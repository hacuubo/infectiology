/**
 * Tests ajoutés par la relecture développement / ergonomie (relecteur 1).
 * Valeurs attendues calculées à la main (détail en commentaire), indépendamment du code testé.
 */
// @ts-expect-error : les types Node ne sont pas installés dans le projet ; le module existe dans l'environnement de test.
import { readFileSync } from 'node:fs';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../ui/App';
import { casFictif } from './cas-fictifs';
import { nombreFr, formaterDose } from '../calc/format';
import { ckdEpi2021, cockcroftGault, creatininePlausible, estimerFonctionRenale, poidsAjuste, poidsIdealDevine, surfaceCorporelleDuBois } from '../calc/renal';
import { dosePonderalePlafonnee, calculerPrescription } from '../engine/posologie';
import { decider, regrouperPourquoi } from '../engine/decider';
import { construireContexte } from '../engine/contexte';
import { clonerDossier, dossierParDefaut, nettoyerDossier, type Dossier } from '../engine/etat';
import { calendrierDeStp, construireFrise, resoudreCalendrier, type EvenementFriseDetaille } from '../schedule/frise';
import { MOLECULES_PAR_ID } from '../clinical/molecules';
import { CAS_BLSE_AMIKACINE, CAS_FICTIFS } from './cas-fictifs';
import type { SpecSTP } from '../clinical/types';

const MAINTENANT = new Date('2026-11-04T10:00:00Z');
function plan(d: Dossier) {
  const c = clonerDossier(d);
  nettoyerDossier(c);
  return decider(c, { maintenant: MAINTENANT });
}

/* ------------------------------------------------------------------ */
describe('Formatage des nombres (virgule décimale française)', () => {
  test('virgule décimale, arrondi, milliers', () => {
    expect(nombreFr(1.5, 1)).toBe('1,5');
    expect(nombreFr(26.09)).toBe('26');
    expect(nombreFr(0.25, 2)).toBe('0,25');
    expect(nombreFr(12000)).toBe('12 000');
    expect(nombreFr(1800)).toBe('1800');
    expect(nombreFr(NaN)).toBe('?');
  });

  test('conversion mg → g seulement si exacte au dixième ; doses pondérales toujours en mg', () => {
    expect(formaterDose(1500, 'mg')).toBe('1,5 g');
    expect(formaterDose(1560, 'mg')).toBe('1560 mg');
    expect(formaterDose(1800, 'mg', { forcerMg: true })).toBe('1800 mg');
    expect(formaterDose(2, 'g')).toBe('2 g');
    expect(formaterDose(0.5, 'g')).toBe('0,5 g');
  });
});

/* ------------------------------------------------------------------ */
describe('Calculs physiologiques (contrôle indépendant)', () => {
  test('Cockcroft-Gault homme : (140 − 60) × 80 / (72 × 1,0) = 88,9 mL/min ; 88,4 µmol/L ≡ 1 mg/dL', () => {
    expect(cockcroftGault({ ageAns: 60, poidsKg: 80, creatinine: 1, unite: 'mg/dL', sexe: 'homme' })).toBeCloseTo(88.89, 1);
    expect(cockcroftGault({ ageAns: 60, poidsKg: 80, creatinine: 88.4, unite: 'umol/L', sexe: 'homme' })).toBeCloseTo(88.89, 1);
    // Femme : × 0,85
    expect(cockcroftGault({ ageAns: 60, poidsKg: 80, creatinine: 1, unite: 'mg/dL', sexe: 'femme' })).toBeCloseTo(75.56, 1);
  });

  test('CKD-EPI 2021 homme 50 ans, 1,0 mg/dL : 142 × (1/0,9)^−1,2 × 0,9938^50 ≈ 91,7', () => {
    expect(ckdEpi2021({ ageAns: 50, creatinine: 1, unite: 'mg/dL', sexe: 'homme' })).toBeCloseTo(91.7, 0);
    // Créatinine basse (branche min) : femme 40 ans, 0,6 mg/dL → 142 × (0,6/0,7)^−0,241 × 0,9938^40 × 1,012
    // = 142 × 1,0379 × 0,7798 × 1,012 ≈ 116,3
    expect(ckdEpi2021({ ageAns: 40, creatinine: 0.6, unite: 'mg/dL', sexe: 'femme' })).toBeCloseTo(116.3, 0);
  });

  test('Du Bois, poids idéal (Devine) femme et poids ajusté', () => {
    expect(surfaceCorporelleDuBois(60, 160)).toBeCloseTo(1.62, 2);
    expect(poidsIdealDevine(160, 'femme')).toBeCloseTo(52.7, 1);
    expect(poidsAjuste(100, 52.7)).toBeCloseTo(71.62, 2);
  });

  test('créatininémie nulle : aucune valeur NaN propagée, donnée signalée manquante', () => {
    const r = estimerFonctionRenale({ ageAns: 70, poidsKg: 70, sexe: 'homme', creatinine: { valeur: 0, unite: 'mg/dL' }, stabilite: 'stable', insuffisanceRenaleAigue: 'non', dialyse: 'aucune' });
    expect(r.estimations.every((e) => !e.calculable && e.valeur === undefined)).toBe(true);
    expect(r.incoherences.map((i) => i.texte).join(' ')).toMatch(/Créatininémie non utilisée/);
  });

  test('unité incohérente (1,2 « µmol/L ») : valeur non utilisée au lieu d\'une clairance aberrante', () => {
    expect(creatininePlausible(1.2, 'umol/L').plausible).toBe(false);
    expect(creatininePlausible(1.2, 'mg/dL').plausible).toBe(true);
    expect(creatininePlausible(106, 'mg/dL').plausible).toBe(false);
    const r = estimerFonctionRenale({ ageAns: 70, poidsKg: 70, sexe: 'homme', creatinine: { valeur: 1.2, unite: 'umol/L' }, stabilite: 'stable', insuffisanceRenaleAigue: 'non', dialyse: 'aucune' });
    expect(r.estimations.some((e) => e.calculable)).toBe(false);
    expect(r.incoherences.map((i) => i.texte).join(' ')).toMatch(/mg\/dL/);
  });

  test('DFG saisi nul ou négatif ignoré', () => {
    const r = estimerFonctionRenale({ sexe: 'inconnu', dfg: { valeur: 0, methode: 'CKD-EPI' }, stabilite: 'stable', insuffisanceRenaleAigue: 'non', dialyse: 'aucune' });
    expect(r.labo).toBeUndefined();
  });
});

/* ------------------------------------------------------------------ */
describe('Doses : plafonds, unités, poids de référence', () => {
  test('plafond par administration (25 mg/kg × 150 kg = 3 750 mg → 3 000 mg)', () => {
    expect(dosePonderalePlafonnee(25, 150, { maxParAdministration: { valeur: 3, unite: 'g' } })).toEqual({ mg: 3000, plafonne: 'administration' });
  });

  test('plafond journalier (50 mg/kg × 100 kg × 4/j = 20 g > 12 g → 3 000 mg par administration)', () => {
    expect(dosePonderalePlafonnee(50, 100, { maxParJour: { valeur: 12, unite: 'g' }, frequenceParJour: 4 })).toEqual({ mg: 3000, plafonne: 'jour' });
  });

  test('arrondi à 10 mg, sans plafond (30 mg/kg × 52 kg = 1 560 mg)', () => {
    expect(dosePonderalePlafonnee(30, 52, {})).toEqual({ mg: 1560, plafonne: false });
  });

  test('vancomycine : la dose de charge respecte son plafond de 3 g (anomalie corrigée)', () => {
    const m = MOLECULES_PAR_ID.vancomycine;
    const r = m.regimens.find((x) => x.chargeInitiale?.doseMaxParAdministration);
    expect(r).toBeDefined();
    const d = dossierParDefaut();
    d.entree = 'microbiologie';
    d.patient = { ...d.patient, age: 50, sexe: 'homme', poidsKg: 150, tailleCm: 180 };
    const ctx = construireContexte(d, MAINTENANT);
    const res = calculerPrescription({ molecule: m, regimen: r!, ctx, duree: { texte: '14 jours', pointDeDepart: 'J1', sources: [] } });
    const max = r!.chargeInitiale!.doseMaxParAdministration!;
    const maxMg = max.unite === 'g' ? max.valeur * 1000 : max.valeur;
    expect(res.prescription.chargeInitiale).toContain(`${maxMg} mg`);
    expect(res.prescription.chargeInitiale).toMatch(/plafonnée/);
    // virgule décimale dans la mention du poids
    expect(res.prescription.chargeInitiale).not.toMatch(/\d\.\d/);
  });

  test('aucun nombre à point décimal dans les doses, adaptations et charges des 13 cas fictifs', () => {
    for (const c of CAS_FICTIFS) {
      const p = plan(c.dossier);
      for (const o of p.options)
        for (const pr of o.prescriptions) {
          for (const t of [pr.doseAffichee, pr.chargeInitiale ?? '', ...pr.adaptations.filter((a) => /≈/.test(a)).map((a) => a.split(':')[0])]) {
            expect(t, `${c.id} / ${pr.dci}`).not.toMatch(/\d\.\d/);
          }
        }
    }
  });
});

/* ------------------------------------------------------------------ */
describe('Calendrier : relatif vs daté, sans date inventée', () => {
  const H = { premiereDoseISO: '2026-11-04T09:00', dureePerfusionMin: 30 };

  test('« à chaque administration » / « dès que possible » (sans délai explicite) : jamais daté', () => {
    const r = resoudreCalendrier({ ancre: 'debut_traitement', texte: 'À chaque administration' }, H);
    expect(r.dateISO).toBeUndefined();
    expect(r.moment).toBe('À chaque administration');
  });

  test('jour de traitement (J2) : daté au jour près, pas à l\'heure', () => {
    const r = resoudreCalendrier({ ancre: 'debut_traitement', jour: 2, texte: 'le 2e jour' }, H);
    expect(r.dateAuJour).toBe(true);
    expect(r.dateISO).toBe(new Date('2026-11-05T09:00').toISOString());
    expect(r.moment).toMatch(/^J2 · /);
    expect(r.moment).not.toMatch(/09:00/);
  });

  test('numéro de dose > 1 : jamais daté (intervalle réel inconnu) ; distinct d\'un jour de traitement', () => {
    const r = resoudreCalendrier({ ancre: 'dose', numeroDose: 3, texte: 'avant la 3e dose' }, H);
    expect(r.dateISO).toBeUndefined();
    expect(r.moment).toBe('3e dose');
  });

  test('« avant la dose suivante » : libellé « Juste avant la ne dose », non daté', () => {
    const stp = { parametre: 'residuelle', premierPrelevement: { quand: 'après 48 h', position: 'juste avant la dose suivante', numeroDose: 3, avantDoseSuivante: true } } as SpecSTP;
    const spec = calendrierDeStp(stp);
    const r = resoudreCalendrier(spec, H);
    expect(r.moment).toBe('Juste avant la 3e dose');
    expect(r.dateISO).toBeUndefined();
  });

  test('« après la fin de perfusion » de la 1re dose : daté seulement si la durée de perfusion est connue', () => {
    const spec = { ancre: 'fin_perfusion' as const, numeroDose: 1, offsetHeures: 0.5, texte: '30 min après la fin de perfusion' };
    expect(resoudreCalendrier(spec, H).dateISO).toBe(new Date('2026-11-04T10:00').toISOString());
    expect(resoudreCalendrier(spec, { premiereDoseISO: H.premiereDoseISO }).dateISO).toBeUndefined();
    expect(resoudreCalendrier(spec, {}).moment).toBe('1re dose : fin de perfusion + 30 min');
  });

  test('« sans délai » n\'est pas présenté comme « avant la 1re dose »', () => {
    expect(resoudreCalendrier({ ancre: 'avant_traitement', texte: 'Sans délai' }, H).moment).toBe('Sans délai');
    expect(resoudreCalendrier({ ancre: 'avant_traitement', offsetHeures: 24, texte: 'Au plus tard dans les 24 h' }, H).moment).toBe('Au plus tard dans les 24 h');
    expect(resoudreCalendrier({ ancre: 'avant_traitement', texte: 'Maintenant, avant la 1re dose' }, H).moment).toBe('Maintenant (avant la 1re dose)');
  });

  test('réévaluation : ancre explicite (« après la 1re dose »)', () => {
    const f = construireFrise([], [], [{ texte: 'Réévaluer', sources: [] }], {});
    expect(f[0].moment).toBe('H+48 après la 1re dose');
    expect(f[0].dateISO).toBeUndefined();
  });

  test('aucune date dans aucune frise des 13 cas fictifs quand les horaires manquent', () => {
    for (const c of CAS_FICTIFS) {
      const d = clonerDossier(c.dossier);
      d.horaires = {};
      for (const prl of d.prelevements) if (prl.hemoc) prl.hemoc = { ...prl.hemoc, dateNegativationISO: undefined, datePremierePositiveISO: undefined };
      const p = plan(d);
      expect(p.frise.filter((e) => e.dateISO).map((e) => e.quoi), c.id).toEqual([]);
      expect(p.frise.some((e) => /\d{2}\/\d{2}/.test(e.moment)), c.id).toBe(false);
    }
  });

  test('moments courts (≤ 70 caractères hors date) ; texte long conservé en précision', () => {
    for (const c of CAS_FICTIFS) {
      for (const e of plan(c.dossier).frise as EvenementFriseDetaille[]) {
        expect(e.moment.split(' · ')[0].length, `${c.id} : ${e.moment}`).toBeLessThanOrEqual(70);
      }
    }
    const pic = (plan(CAS_BLSE_AMIKACINE).frise as EvenementFriseDetaille[]).find((e) => /dosage \(pic\)/.test(e.quoi));
    expect(pic?.precisionMoment).toMatch(/30 minutes après la fin de la perfusion/);
    expect(pic?.cible).toMatch(/60 à 80 mg\/L/);
  });

  test('pas de doublon (même moment + même action) dans les frises', () => {
    for (const c of CAS_FICTIFS) {
      const cles = plan(c.dossier).frise.map((e) => `${e.ordre}|${e.quoi}`);
      expect(new Set(cles).size, c.id).toBe(cles.length);
    }
  });
});

/* ------------------------------------------------------------------ */
describe('Déterminisme et dédoublonnage', () => {
  test('mêmes entrées → même plan (JSON identique) pour les 13 cas', () => {
    for (const c of CAS_FICTIFS) expect(JSON.stringify(plan(c.dossier))).toBe(JSON.stringify(plan(c.dossier)));
  });

  test('données manquantes : un seul libellé par champ, motifs répétés par molécule regroupés', () => {
    expect(regrouperPourquoi('détermine si « X » (A) est nécessaire ; détermine si « X » (B) est nécessaire ; autre')).toBe('détermine si « X » est nécessaire (A, B) ; autre');
    for (const c of CAS_FICTIFS) {
      const champs = plan(c.dossier).donneesManquantes.map((m) => m.champ);
      expect(new Set(champs).size, c.id).toBe(champs.length);
      expect(champs.filter((x) => /dialyse/.test(x) && /oui\/non/.test(x)).length, c.id).toBeLessThanOrEqual(1);
    }
  });

  test('« inconnu » distinct de « non » : grossesse inconnue → donnée demandée ; « non » → rien', () => {
    const base = clonerDossier(CAS_FICTIFS.find((c) => c.id === 'ecoli-i')!.dossier);
    base.patient = { ...base.patient, sexe: 'femme', age: 30 };
    const inconnue = clonerDossier(base);
    inconnue.patient.grossesse = 'inconnu';
    const non = clonerDossier(base);
    non.patient.grossesse = 'non';
    expect(plan(inconnue).donneesManquantes.some((m) => m.champ === 'grossesse')).toBe(true);
    expect(plan(non).donneesManquantes.some((m) => m.champ === 'grossesse')).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
describe('Interface : parcours, accessibilité, responsive', () => {
  test('régression CSS : les onglets réapparaissent sous 980 px (règle placée après la règle générale)', () => {
    const css: string = readFileSync('src/ui/styles.css', 'utf-8') // chemin relatif à la racine du projet (répertoire de lancement de vitest);
    const general = css.indexOf('.onglets { display: none');
    const media = css.indexOf('@media (max-width: 980px)');
    expect(general).toBeGreaterThan(-1);
    expect(media).toBeGreaterThan(general);
    expect(css.slice(media, css.indexOf('}', css.indexOf('.onglets', media)) + 1)).toMatch(/\.onglets \{ display: flex; \}/);
  });

  test('groupes radio : un seul arrêt de tabulation, flèches pour changer de choix', async () => {
    const u = userEvent.setup();
    render(<App />);
    // Groupe à trois choix (le sexe n'en a plus que deux).
    const groupe = screen.getByRole('radiogroup', { name: /^Contexte de l'infection/ });
    const radios = within(groupe).getAllByRole('radio');
    expect(radios.filter((r) => r.tabIndex === 0)).toHaveLength(1);
    radios[0].focus();
    await u.keyboard('{ArrowRight}');
    expect(within(groupe).getByRole('radio', { name: 'Associé aux soins' })).toHaveAttribute('aria-checked', 'true');
    expect(within(groupe).getByRole('radio', { name: 'Associé aux soins' })).toHaveFocus();
    await u.keyboard('{End}');
    expect(within(groupe).getByRole('radio', { name: 'Inconnu' })).toHaveAttribute('aria-checked', 'true');
    await u.keyboard('{ArrowRight}');
    expect(within(groupe).getByRole('radio', { name: 'Communautaire' })).toHaveAttribute('aria-checked', 'true');
  });

  test('choisir l\'unité de créatininémie avant la valeur ne crée pas de créatininémie à 0 (anomalie corrigée)', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.selectOptions(screen.getByLabelText('Unité de la créatininémie'), 'mg/dL');
    const resume = screen.getByLabelText('Résumé du patient');
    expect(resume).not.toHaveTextContent(/créat\. 0/);
    expect(resume).not.toHaveTextContent(/NaN/);
    await u.type(screen.getByLabelText('Valeur de la créatininémie'), '1.2');
    expect(resume).toHaveTextContent(/créat\. 1,2 mg\/dL/);
  });

  test('alertes urgentes dans la barre permanente, une seule fois ; avertissements communs regroupés', async () => {
    render(<App dossierInitial={casFictif('blse-amk')} />);
    const barre = screen.getByRole('region', { name: "Niveau d'urgence et alertes urgentes" });
    expect(within(barre).getByText(/urgence immédiate/)).toBeInTheDocument();
    expect(within(barre).getByText(/Sepsis : antibiothérapie IV immédiate/)).toBeInTheDocument();
    expect(screen.getAllByText(/Sepsis : antibiothérapie IV immédiate/)).toHaveLength(1);
    // IRA : aucune estimation ne personnalise la dose ; chaque molécule l'explique (méropénème, amikacine).
    expect(screen.getAllByText(/Adaptation rénale non calculée/).length).toBeGreaterThanOrEqual(2);
  });

  test('résumé lisible : libellés accentués, pas de valeur codée brute', async () => {
    render(<App dossierInitial={casFictif('blse-amk')} />);
    const resume = screen.getByLabelText('Résumé du patient');
    expect(resume).toHaveTextContent(/pas encore contrôlées/);
    expect(resume).toHaveTextContent(/foyer confirmé/);
    expect(resume).toHaveTextContent(/non utilisées pour les doses/);
    expect(resume).not.toHaveTextContent(/controlees|confirme :|_/);
  });

  test('retour A → B → A sans ressaisie du syndrome ; invalidation signalée', async () => {
    const u = userEvent.setup();
    render(<App />);
    const entree = screen.getByRole('radiogroup', { name: 'Par quoi commencez-vous ?' });
    await u.click(within(entree).getByRole('radio', { name: /A\. Syndrome/ }));
    await u.selectOptions(screen.getByLabelText('Syndrome / foyer'), 'urinaire');
    await u.click(within(entree).getByRole('radio', { name: /B\. Résultat/ }));
    await u.click(within(entree).getByRole('radio', { name: /A\. Syndrome/ }));
    expect(screen.getByLabelText('Syndrome / foyer')).toHaveValue('urinaire');

    await u.type(screen.getByLabelText('Âge'), '30');
    await u.click(within(screen.getByRole('radiogroup', { name: /^Sexe/ })).getByRole('radio', { name: 'Femme' }));
    await u.click(within(screen.getByRole('radiogroup', { name: 'Grossesse' })).getByRole('radio', { name: 'Oui' }));
    await u.click(within(screen.getByRole('radiogroup', { name: /^Sexe/ })).getByRole('radio', { name: 'Homme' }));
    expect(screen.getByText(/« Grossesse » n'est plus pertinent/)).toBeInTheDocument();
    expect(screen.queryByRole('radiogroup', { name: 'Grossesse' })).toBeNull();
  });

  test('frise : moment court en colonne, détails (pourquoi, cible, conduite) dans un panneau dépliable', async () => {
    render(<App dossierInitial={casFictif('blse-amk')} />);
    const table = screen.getByRole('table', { name: /Calendrier de surveillance/ });
    const lignePic = within(table).getAllByRole('row').find((r) => /dosage \(pic\)/.test(r.textContent ?? ''))!;
    expect(within(lignePic).getByRole('rowheader')).toHaveTextContent(/1re dose : fin de perfusion \+ 30 min · /);
    expect(within(lignePic).getByText(/Cible : 60 à 80 mg\/L/)).toBeVisible();
    const resume = within(lignePic).getByText('Pourquoi, conduite et précisions');
    expect(resume.closest('details')).not.toHaveAttribute('open');
  });
});
