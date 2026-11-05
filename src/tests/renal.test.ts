/**
 * Fonction rénale : calculs vérifiés sur des exemples de référence INDÉPENDANTS de l'implémentation
 * (calculateurs officiels exécutés le 2026-11-05 et article de Du Bois 1916 ; voir
 * docs/sources/recherche-fonction-renale.md §7), puis domaine de validité et choix par molécule.
 */
import {
  choisirEstimation,
  ckdEpi2009,
  ckdEpi2021,
  cockcroftGault,
  desindexer,
  ekfc,
  estimation,
  estimerFonctionRenale,
  poidsAjuste,
  poidsIdealDevine,
  surfaceCorporelleDuBois,
  type EntreesRenales,
} from '../calc/renal';
import { referenceRenale } from '../clinical/molecules/reference-renale';

const base: EntreesRenales = { sexe: 'homme', stabilite: 'stable', insuffisanceRenaleAigue: 'non', dialyse: 'aucune' };

describe('Exemples de référence indépendants', () => {
  test('A. Du Bois 1916 : 150 cm, 60 kg → 1,55 m² (exemple de l’article)', () => {
    expect(surfaceCorporelleDuBois(60, 150)).toBeCloseTo(1.55, 2);
  });
  test('B. CKD-EPI 2021, homme 50 ans, 1,2 mg/dL → 74 (calculateur NKF, arrondi à l’entier)', () => {
    expect(Math.round(ckdEpi2021({ ageAns: 50, creatinine: 1.2, unite: 'mg/dL', sexe: 'homme' }))).toBe(74);
  });
  test('C. CKD-EPI 2021 désindexé (Du Bois), même patient, 175 cm, 70 kg → 79 mL/min (calculateur NKF)', () => {
    const sc = surfaceCorporelleDuBois(70, 175);
    expect(Math.round(desindexer(ckdEpi2021({ ageAns: 50, creatinine: 1.2, unite: 'mg/dL', sexe: 'homme' }), sc))).toBe(79);
  });
  test('D. CKD-EPI 2021, femme 70 ans, 0,9 mg/dL → 69 (calculateur NKF)', () => {
    expect(Math.round(ckdEpi2021({ ageAns: 70, creatinine: 0.9, unite: 'mg/dL', sexe: 'femme' }))).toBe(69);
  });
  test('E. CKD-EPI 2009 sans coefficient racial, homme 50 ans, 1,2 mg/dL → 70,09 (calculateur MSD)', () => {
    expect(ckdEpi2009({ ageAns: 50, creatinine: 1.2, unite: 'mg/dL', sexe: 'homme' })).toBeCloseTo(70.09, 1);
  });
  test('F. CKD-EPI 2009 sans coefficient racial, femme 70 ans, 0,9 mg/dL → 64,78 (calculateur MSD)', () => {
    expect(ckdEpi2009({ ageAns: 70, creatinine: 0.9, unite: 'mg/dL', sexe: 'femme' })).toBeCloseTo(64.78, 1);
  });
  test('G. EKFC, homme 50 ans, 1,2 mg/dL → 70,5 (calculateur EKFC de référence)', () => {
    expect(ekfc({ ageAns: 50, creatinine: 1.2, unite: 'mg/dL', sexe: 'homme' })).toBeCloseTo(70.5, 0);
  });
  test('H. EKFC, femme 70 ans, 80 µmol/L → 59,5 (calculateur EKFC de référence)', () => {
    expect(ekfc({ ageAns: 70, creatinine: 80, unite: 'umol/L', sexe: 'femme' })).toBeCloseTo(59.5, 0);
  });
  test('I. Cockcroft-Gault, homme 60 ans, 70 kg, 1,0 mg/dL → 77,78 mL/min (calculateur MSD)', () => {
    expect(cockcroftGault({ ageAns: 60, poidsKg: 70, creatinine: 1, unite: 'mg/dL', sexe: 'homme' })).toBeCloseTo(77.78, 1);
  });
  test('J. Cockcroft-Gault, femme 70 ans, 60 kg, 0,9 mg/dL → 55,09 mL/min (calculateur MSD)', () => {
    expect(cockcroftGault({ ageAns: 70, poidsKg: 60, creatinine: 0.9, unite: 'mg/dL', sexe: 'femme' })).toBeCloseTo(55.09, 1);
  });
});

describe('Unités et conversions', () => {
  test('µmol/L et mg/dL donnent des résultats équivalents (facteur 88,4)', () => {
    const a = estimerFonctionRenale({ ...base, ageAns: 50, poidsKg: 70, tailleCm: 175, creatinine: { valeur: 1.2, unite: 'mg/dL' } });
    const b = estimerFonctionRenale({ ...base, ageAns: 50, poidsKg: 70, tailleCm: 175, creatinine: { valeur: 1.2 * 88.4, unite: 'umol/L' } });
    for (const id of ['dfg_indexe', 'dfg_desindexe', 'clairance_cg'] as const) expect(estimation(b, id).valeur).toBeCloseTo(estimation(a, id).valeur!, 6);
  });
  test('Sans unité, la créatininémie n’est pas utilisée et l’unité n’est jamais devinée', () => {
    const r = estimerFonctionRenale({ ...base, ageAns: 50, poidsKg: 70, creatinine: { valeur: 1.2 } });
    expect(r.estimations.some((e) => e.calculable)).toBe(false);
    expect(r.manquants.join(' ')).toMatch(/unité de la créatininémie/);
  });
  test('Valeur incohérente avec l’unité (1,2 µmol/L) : signalée, non convertie', () => {
    const r = estimerFonctionRenale({ ...base, ageAns: 50, poidsKg: 70, creatinine: { valeur: 1.2, unite: 'umol/L' } });
    expect(r.incoherences[0].texte).toMatch(/s'agit-il de mg\/dL/);
    expect(r.estimations.some((e) => e.calculable)).toBe(false);
  });
  test('Poids, taille et date implausibles signalés', () => {
    const r = estimerFonctionRenale({ ...base, ageAns: 50, poidsKg: 700, tailleCm: 17.5, creatinine: { valeur: 80, unite: 'umol/L', date: '2027-01-01' }, maintenant: new Date('2026-11-05T10:00:00') });
    const t = r.incoherences.map((i) => i.texte).join(' ');
    expect(t).toMatch(/Poids/);
    expect(t).toMatch(/Taille/);
    expect(t).toMatch(/postérieure/);
  });
});

describe('Données requises par chaque formule', () => {
  test('DFG indexé calculable sans poids ni taille ; désindexé et Cockcroft-Gault non calculés', () => {
    const r = estimerFonctionRenale({ ...base, ageAns: 60, creatinine: { valeur: 100, unite: 'umol/L' } });
    expect(estimation(r, 'dfg_indexe').calculable).toBe(true);
    expect(estimation(r, 'dfg_desindexe').calculable).toBe(false);
    expect(estimation(r, 'dfg_desindexe').manquants.join(' ')).toMatch(/poids|taille/);
    expect(estimation(r, 'clairance_cg').calculable).toBe(false);
    expect(estimation(r, 'clairance_cg').manquants).toContain('poids');
  });
  test('Toutes les estimations avec âge, sexe, poids, taille et créatininémie', () => {
    const r = estimerFonctionRenale({ ...base, ageAns: 60, poidsKg: 80, tailleCm: 180, creatinine: { valeur: 100, unite: 'umol/L', date: '2026-11-04' } });
    expect(r.estimations.every((e) => e.calculable)).toBe(true);
    expect(estimation(r, 'dfg_indexe').unite).toBe('mL/min/1,73 m²');
    expect(estimation(r, 'dfg_desindexe').unite).toBe('mL/min');
    expect(estimation(r, 'clairance_cg').unite).toBe('mL/min');
    expect(estimation(r, 'dfg_indexe').donnees.join(' ')).toMatch(/2026-11-04/);
    expect(estimation(r, 'dfg_indexe').calcul.join(' ')).toMatch(/coefficient racial non appliqué/);
  });
  test('Sans âge ou sans variable de sexe : aucune estimation, donnée nommée', () => {
    const r = estimerFonctionRenale({ ...base, sexe: 'inconnu', poidsKg: 70, creatinine: { valeur: 100, unite: 'umol/L' } });
    expect(r.estimations.some((e) => e.calculable)).toBe(false);
    expect(estimation(r, 'dfg_indexe').manquants.join(' ')).toMatch(/âge/);
    expect(estimation(r, 'dfg_indexe').manquants.join(' ')).toMatch(/variable de sexe/);
  });
  test('Équation au choix : 2009 par défaut, 2021 ou EKFC ; EKFC non calculé avant 25 ans', () => {
    const e = { ...base, ageAns: 50, creatinine: { valeur: 1.2, unite: 'mg/dL' as const } };
    expect(estimation(estimerFonctionRenale(e), 'dfg_indexe').valeur).toBeCloseTo(70.09, 1);
    expect(Math.round(estimation(estimerFonctionRenale({ ...e, equation: 'ckd_epi_2021' }), 'dfg_indexe').valeur!)).toBe(74);
    expect(estimation(estimerFonctionRenale({ ...e, equation: 'ekfc' }), 'dfg_indexe').valeur).toBeCloseTo(70.5, 0);
    expect(estimation(estimerFonctionRenale({ ...e, ageAns: 22, equation: 'ekfc' }), 'dfg_indexe').calculable).toBe(false);
  });
  test('Poids de Cockcroft-Gault : réel par défaut ; idéal ou ajusté seulement sur choix explicite', () => {
    const e = { ...base, ageAns: 50, poidsKg: 130, tailleCm: 175, creatinine: { valeur: 1, unite: 'mg/dL' as const } };
    const reel = estimation(estimerFonctionRenale(e), 'clairance_cg');
    expect(reel.valeur).toBeCloseTo(cockcroftGault({ ageAns: 50, poidsKg: 130, creatinine: 1, unite: 'mg/dL', sexe: 'homme' }), 6);
    expect(reel.limites.join(' ')).toMatch(/diverge/);
    const pi = poidsIdealDevine(175, 'homme');
    expect(estimation(estimerFonctionRenale({ ...e, poidsCockcroft: 'ideal' }), 'clairance_cg').valeur).toBeCloseTo(cockcroftGault({ ageAns: 50, poidsKg: pi, creatinine: 1, unite: 'mg/dL', sexe: 'homme' }), 6);
    expect(estimation(estimerFonctionRenale({ ...e, poidsCockcroft: 'ajuste' }), 'clairance_cg').valeur).toBeCloseTo(cockcroftGault({ ageAns: 50, poidsKg: poidsAjuste(130, pi), creatinine: 1, unite: 'mg/dL', sexe: 'homme' }), 6);
  });
});

describe('Domaine de validité', () => {
  test('Fonction rénale instable ou IRA : estimations affichées comme non valides, jamais utilisées pour la dose', () => {
    const r = estimerFonctionRenale({ ...base, sexe: 'femme', ageAns: 90, poidsKg: 50, creatinine: { valeur: 180, unite: 'umol/L' }, stabilite: 'instable', insuffisanceRenaleAigue: 'oui' });
    expect(r.applicable).toBe(false);
    expect(estimation(r, 'clairance_cg').limites.join(' ')).toMatch(/Non valide/);
    const c = choisirEstimation(r, referenceRenale('vancomycine'));
    expect(c.valeur).toBeUndefined();
    expect(c.refus).toMatch(/état d'équilibre/);
  });
  test('Dialyse : estimations non applicables', () => {
    const r = estimerFonctionRenale({ ...base, ageAns: 60, poidsKg: 70, creatinine: { valeur: 500, unite: 'umol/L' }, stabilite: 'inconnu', dialyse: 'hemodialyse_intermittente' });
    expect(r.applicable).toBe(false);
    expect(r.etat).toBe('dialyse');
    expect(r.estimations.some((e) => e.calculable)).toBe(false);
  });
  test('Stabilité inconnue : estimation utilisable mais limite affichée', () => {
    const r = estimerFonctionRenale({ ...base, ageAns: 60, creatinine: { valeur: 100, unite: 'umol/L' }, stabilite: 'inconnu' });
    expect(r.applicable).toBe(true);
    expect(r.limites.join(' ')).toMatch(/Stabilité/);
  });
  test('Valeur du laboratoire conservée avec méthode, unité et date, distincte du calcul', () => {
    const r = estimerFonctionRenale({ ...base, ageAns: 50, creatinine: { valeur: 1.2, unite: 'mg/dL' }, dfg: { valeur: 95, methode: 'CKD-EPI', unite: 'mL/min/1,73 m²', date: '2026-11-03' } });
    expect(r.labo?.valeur).toBe(95);
    expect(r.labo?.date).toBe('2026-11-03');
    expect(r.labo?.limites.join(' ')).toMatch(/Écart de plus de 15 %/);
    expect(estimation(r, 'dfg_indexe').valeur).toBeCloseTo(70.09, 1);
  });
});

describe('Choix de l’estimation selon la référence posologique', () => {
  const complet = estimerFonctionRenale({ ...base, ageAns: 70, poidsKg: 60, tailleCm: 165, creatinine: { valeur: 130, unite: 'umol/L' } });
  test('Indexé, désindexé et clairance ne sont pas interchangeables', () => {
    expect(choisirEstimation(complet, referenceRenale('vancomycine')).libelle).toMatch(/Cockcroft-Gault/);
    expect(choisirEstimation(complet, referenceRenale('amoxicilline')).libelle).toMatch(/désindexé/);
    const erta = choisirEstimation(complet, referenceRenale('ertapeneme'));
    expect(erta.unite).toBe('mL/min/1,73 m²');
    expect(erta.valeur).toBeCloseTo(estimation(complet, 'dfg_indexe').valeur!, 6);
  });
  test('Paliers en DFG mL/min sans taille : le DFG indexé n’est pas utilisé à la place', () => {
    const r = estimerFonctionRenale({ ...base, ageAns: 70, poidsKg: 60, creatinine: { valeur: 130, unite: 'umol/L' } });
    const c = choisirEstimation(r, referenceRenale('amoxicilline'));
    expect(c.valeur).toBeUndefined();
    expect(c.refus).toMatch(/indexé n'est pas utilisé/);
  });
  test('Référence citant Cockcroft-Gault sans poids : substitution signalée par le DFG désindexé ? non, pas de taille non plus → refus', () => {
    const r = estimerFonctionRenale({ ...base, ageAns: 70, creatinine: { valeur: 130, unite: 'umol/L' } });
    expect(choisirEstimation(r, referenceRenale('cefepime')).refus).toMatch(/ni la clairance/);
  });
  test('Clairance sans formule précisée : discordance de palier détectée entre Cockcroft-Gault et DFG désindexé', () => {
    // Personne âgée de faible poids : Cockcroft-Gault nettement plus bas que le DFG désindexé.
    const r = estimerFonctionRenale({ ...base, sexe: 'femme', ageAns: 88, poidsKg: 45, tailleCm: 160, creatinine: { valeur: 85, unite: 'umol/L' } });
    const cg = estimation(r, 'clairance_cg').valeur!;
    const des = estimation(r, 'dfg_desindexe').valeur!;
    const seuil = (cg + des) / 2;
    const c = choisirEstimation(r, referenceRenale('meropeneme'), (v) => (v >= seuil ? 0 : 1));
    expect(c.valeur).toBeUndefined();
    expect(c.discordance).toMatch(/paliers différents/);
  });
});
