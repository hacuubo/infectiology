/**
 * Méningites bactériennes communautaires de l'adulte (R-MENINGITE-BACTERIENNE, 2026-11-06 ; corrections v7). Résultats
 * attendus établis d'après docs/sources/recherche-meningites.md (SPILF 2018, instruction DGS 2018, DGS-Urgent 2025_06
 * relayé, RCP), indépendamment du code. Tout le domaine est en brouillon tant que la révision SPILF n'est pas publiée.
 */
import { decider } from '../engine/decider';
import { dossierParDefaut, nettoyerDossier, nouveauPrelevement, type Dossier } from '../engine/etat';
import { questionsPour } from '../clinical/syndromes/questions';
import { SOURCES_PAR_ID } from '../clinical/sources';
import { regimen } from '../clinical/molecules';
import type { OrganismeId, Plan, Prelevement } from '../clinical/types';

const MAINTENANT = new Date('2026-11-06T10:00:00Z');

function meningite(details: Record<string, string> = {}, modif?: (d: Dossier) => void): Dossier {
  const d = dossierParDefaut();
  d.entree = 'syndrome';
  d.syndrome = 'meningite';
  d.patient.age = 45;
  d.patient.sexe = 'homme';
  d.patient.poidsKg = 70;
  d.patient.tailleCm = 175;
  d.patient.immunodepression = 'non';
  d.patient.neutropenie = 'non';
  d.patient.contexte = 'communautaire';
  d.patient.gravite = 'stable';
  d.patient.statutAllergie = 'aucune';
  d.patient.renal = { creatinine: { valeur: 80, unite: 'umol/L' }, stabilite: 'stable', insuffisanceRenaleAigue: 'non', dialyse: 'aucune' };
  d.details = { 'meningite.purpura': 'non', ...details };
  modif?.(d);
  return d;
}
function plan(d: Dossier): Plan {
  nettoyerDossier(d);
  return decider(d, { maintenant: MAINTENANT });
}
function prl(type: Prelevement['type'], organisme: OrganismeId, foyer: Prelevement['foyer'], modif?: (x: Prelevement) => void): Prelevement {
  const x = nouveauPrelevement(type);
  x.organisme = organisme;
  x.foyer = foyer;
  modif?.(x);
  return x;
}
const allergie = (molecule: string, reaction: 'immediate' | 'retardee_benigne', gravite?: 'moderee' | 'severe') => (d: Dossier) => {
  d.patient.statutAllergie = 'presentes';
  d.patient.allergies = [{ molecule, reaction, gravite }];
};
const opt = (p: Plan, id: string) => p.options.find((o) => o.id === id);
const molecules = (p: Plan, rang?: string) => p.options.filter((o) => !rang || o.rang === rang).flatMap((o) => o.prescriptions.map((x) => x.regimenId));
const textes = (p: Plan) => [...p.gestes.map((g) => g.texte), ...p.urgence.alertes.map((a) => a.texte), ...p.avisSpecialise.map((a) => a.texte)].join(' | ');
const adaptations = (p: Plan, regimenId: string) => p.options.flatMap((o) => o.prescriptions).filter((x) => x.regimenId === regimenId).flatMap((x) => x.adaptations).join(' | ');

describe('Urgence et ponction lombaire', () => {
  test('sans contre-indication ni imagerie : PL dans l’heure ; antibiotique dès que le LCS est trouble ou si la PL ne peut pas être faite dans l’heure (options conditionnelles) ; urgence immédiate', () => {
    const p = plan(meningite({ 'meningite.lcs': 'pas_faite', 'meningite.imagerie': 'non', 'meningite.ci_pl': 'non', 'meningite.listeriose': 'non' }));
    expect(p.situation.id).toBe('meningite-pl-immediate');
    expect(p.urgence.niveau).toBe('immediate');
    expect(p.controles.find((c) => c.id === 'ctl-meningite-pl')?.categorie).toBe('indique');
    expect(p.options.every((o) => o.rang === 'conditionnelle')).toBe(true);
    expect(opt(p, 'meningite-neg-cefotaxime')?.condition).toMatch(/LCS est trouble/);
    expect(opt(p, 'meningite-neg-cefotaxime')?.condition).toMatch(/dans l'heure suivant l'admission/);
    expect(textes(p)).toMatch(/dans l'heure suivant l'admission/);
  });

  test('signes imposant une imagerie : antibiothérapie et dexaméthasone avant l’imagerie et la PL (schéma « examen direct négatif »)', () => {
    const p = plan(meningite({ 'meningite.lcs': 'pas_faite', 'meningite.imagerie': 'oui', 'meningite.ci_pl': 'non', 'meningite.listeriose': 'non' }));
    expect(p.situation.id).toBe('meningite-antibiotique-avant-pl');
    expect(p.controles.find((c) => c.id === 'ctl-meningite-imagerie-avant-pl')?.categorie).toBe('indique');
    expect(molecules(p, 'premiere_ligne')).toEqual(['cefotaxime-meninge-300', 'ceftriaxone-meninge-100']);
    expect(p.gestes.some((g) => /Dexaméthasone 10 mg IV toutes les 6 h pendant 4 jours/.test(g.texte) && /12 h après/.test(g.texte) && /0,15 mg\/kg/.test(g.texte))).toBe(true);
  });

  test('anticoagulant (AOD) déclaré : contre-indication à une PL immédiate, antibiotique avant la PL ; l’imagerie inconnue n’est plus bloquante', () => {
    const p = plan(meningite({ 'meningite.lcs': 'pas_faite', 'meningite.listeriose': 'non' }, (d) => (d.patient.traitementsAssocies = ['aod'])));
    expect(p.situation.id).toBe('meningite-antibiotique-avant-pl');
    expect(p.controles.find((c) => c.id === 'ctl-meningite-ci-pl')?.categorie).toBe('indique');
    expect(p.donneesManquantes.find((m) => m.cible === 'details.meningite.imagerie')?.impact).toBe('affine');
  });

  test('purpura fulminans : C3G immédiate avant tout prélèvement (ceftriaxone en tête, même rang) ; divergence SPILF/DGS sur les hémocultures sans ancre « avant le traitement » ; déclaration obligatoire ; LCS jamais demandé', () => {
    const p = plan(meningite({ 'meningite.purpura': 'fulminans', 'meningite.lcs': 'pas_faite', 'meningite.listeriose': 'non' }));
    expect(p.situation.id).toBe('meningite-purpura-fulminans');
    expect(p.urgence.niveau).toBe('immediate');
    expect(p.gestes.some((g) => /ceftriaxone 1 g ou céfotaxime 1 g/.test(g.texte) && /SAMU/.test(g.texte))).toBe(true);
    const hc = p.controles.find((c) => c.id === 'ctl-meningite-hc')!;
    expect(hc.categorie).toBe('conditionnel');
    expect(hc.quand.ancre).toBe('non_determine');
    expect(hc.sources.map((s) => s.source)).toEqual(expect.arrayContaining(['SPILF-2018-meningites', 'DGS-2018-IIM']));
    expect(hc.pourquoi).toMatch(/Divergence/);
    expect(molecules(p, 'premiere_ligne')).toEqual(['ceftriaxone-meninge-100', 'cefotaxime-meninge-300']);
    expect(textes(p)).toMatch(/déclaration obligatoire/);
    expect(p.gestes.some((g) => /Purpura fulminans : il n'est pas cité tel quel/.test(g.texte) && /non consensuelle/.test(g.texte))).toBe(true);
    const sansLcs = plan(meningite({ 'meningite.purpura': 'fulminans' }));
    expect(sansLcs.donneesManquantes.some((m) => m.cible === 'details.meningite.lcs')).toBe(false);
  });

  test('à l’ouverture : le LCS non fait n’est pas bloquant (affine, hors « résultats microbiologiques ») ; l’action « antibiotique si la PL n’est pas faite dans l’heure » est une action urgente', () => {
    const p = plan(meningite({}));
    const lcs = p.donneesManquantes.find((m) => m.cible === 'details.meningite.lcs')!;
    expect(lcs.impact).toBe('affine');
    expect(p.sortie.motifs.some((m) => m.type === 'microbiologie_insuffisante')).toBe(false);
    expect(p.indication?.decision).toBe('urgence');
    expect(p.sortie.actionsUrgentes.some((a) => /PL ne peut pas être réalisée dans l'heure/.test(a.texte))).toBe(true);
    expect(p.gestes.some((g) => /90 minutes/.test(g.texte))).toBe(true);
  });
});

describe('Probabiliste selon l’examen direct du LCS', () => {
  test('cocci à Gram positif : céfotaxime 300 et ceftriaxone 100 mg/kg/j au même rang (brouillon) ; ceftriaxone en 2 perfusions, écart au RCP signalé ; pas de vancomycine systématique', () => {
    const p = plan(meningite({ 'meningite.lcs': 'cgp' }));
    expect(p.situation.id).toBe('meningite-examen-direct-cgp');
    const ctx = opt(p, 'meningite-cgp-cefotaxime')!;
    expect(ctx.rang).toBe('premiere_ligne');
    expect(ctx.statut).toBe('brouillon');
    expect(ctx.prescriptions[0].doseAffichee).toMatch(/75 mg\/kg/);
    const cro = opt(p, 'meningite-cgp-ceftriaxone')!;
    expect(cro.rang).toBe('premiere_ligne');
    expect(cro.statut).toBe('brouillon');
    expect(cro.commentaire).toMatch(/au-dessus du RCP/);
    expect(cro.commentaire).not.toMatch(/choix de l'application/);
    expect(cro.prescriptions[0].modalites).toMatch(/Hors RCP/);
    expect(cro.prescriptions[0].doseAffichee).toMatch(/3 ?500 mg × 2\/24 h/);
    expect(p.options.filter((o) => o.rang !== 'conditionnelle').some((o) => o.prescriptions.some((x) => x.moleculeId === 'vancomycine'))).toBe(false);
    expect(p.controles.find((c) => c.id === 'ctl-meningite-dosage-c3g')?.categorie).toBe('indique');
    expect(p.urgence.alertes.some((a) => /Insuffisance rénale et C3G méningées/.test(a.texte))).toBe(true);
  });

  test('cocci à Gram négatif : C3G 200/75 au même rang, ceftriaxone en tête ; déclaration obligatoire, gouttelettes ; prophylaxie des contacts avec les deux doctrines sans trancher ; cas index : ceftriaxone, ciprofloxacine, rifampicine', () => {
    const p = plan(meningite({ 'meningite.lcs': 'cgn' }));
    expect(p.situation.id).toBe('meningite-examen-direct-cgn');
    expect(molecules(p, 'premiere_ligne')).toEqual(['ceftriaxone-meninge-75', 'cefotaxime-meninge-200']);
    expect(textes(p)).toMatch(/déclaration obligatoire/);
    expect(p.gestes.some((g) => /gouttelettes/.test(g.texte) && /ceftriaxone/.test(g.texte))).toBe(true);
    const doctrine = p.urgence.alertes.find((a) => /deux doctrines/.test(a.texte))!;
    expect(doctrine.texte).toMatch(/rifampicine orale 600 mg/);
    expect(doctrine.texte).toMatch(/ciprofloxacine si la souche est sensible/);
    expect(doctrine.sources?.map((s) => s.source)).toEqual(expect.arrayContaining(['DGS-2018-IIM', 'DGS-URGENT-2025-06', 'APHP-2025-IIM-CAT']));
    // Le DGS-Urgent (non lu) n'est jamais cité par un extrait.
    expect(doctrine.sources?.find((s) => s.source === 'DGS-URGENT-2025-06')?.extrait).toBeUndefined();
    const ids = p.options.filter((o) => o.id.startsWith('meningite-cas-index')).map((o) => o.id);
    expect(ids).toEqual(['meningite-cas-index-ceftriaxone', 'meningite-cas-index-ciprofloxacine', 'meningite-cas-index-rifampicine']);
    const rifa = opt(p, 'meningite-cas-index-rifampicine')!;
    expect(rifa.rang).toBe('conditionnelle');
    expect(rifa.statut).toBe('brouillon');
    expect(rifa.prescriptions[0].doseAffichee).toMatch(/600 mg × 2\/24 h/);
    expect(opt(p, 'meningite-cas-index-ceftriaxone')?.prescriptions[0].doseAffichee).toMatch(/250 mg/);
    expect(p.gestes.some((g) => /quel que soit leur statut vaccinal/.test(g.texte))).toBe(true);
    expect(p.gestes.some((g) => /plusieurs experts ne la recommandent pas/.test(g.texte))).toBe(true);
  });

  test('bacille à Gram positif : amoxicilline 200 mg/kg/j + gentamicine 5 mg/kg/j (brouillon) ; dexaméthasone « non citée explicitement », à arrêter si Listeria confirmée', () => {
    const p = plan(meningite({ 'meningite.lcs': 'bgp' }));
    const o = p.options.find((x) => x.rang === 'premiere_ligne')!;
    expect(o.prescriptions.map((x) => x.regimenId)).toEqual(['amoxicilline-meninge-200', 'gentamicine-5-listeria']);
    expect(o.statut).toBe('brouillon');
    expect(o.prescriptions[0].modalites).toMatch(/12 g\/j/);
    expect(molecules(p)).not.toContain('cefotaxime-meninge-300');
    expect(p.gestes.some((g) => /pas cité explicitement/.test(g.texte) && /LCS trouble en est une/.test(g.texte) && /l'arrêter si Listeria est confirmée/.test(g.texte))).toBe(true);
  });

  test('bacille à Gram négatif : dexaméthasone « non citée explicitement », poursuivie 4 jours si H. influenzae', () => {
    const p = plan(meningite({ 'meningite.lcs': 'bgn' }));
    expect(p.gestes.some((g) => /pas cité explicitement/.test(g.texte) && /4 jours au total si H. influenzae/.test(g.texte))).toBe(true);
  });

  test('examen direct négatif : sans argument pour une listériose, C3G seule ; après 70 ans, C3G + amoxicilline + gentamicine', () => {
    const jeune = plan(meningite({ 'meningite.lcs': 'negatif', 'meningite.listeriose': 'non' }));
    expect(molecules(jeune, 'premiere_ligne')).toEqual(['cefotaxime-meninge-300', 'ceftriaxone-meninge-100']);
    const age = plan(meningite({ 'meningite.lcs': 'negatif' }, (d) => (d.patient.age = 75)));
    expect(age.situation.libelle).toMatch(/arguments pour une listériose/);
    expect(molecules(age, 'premiere_ligne')).toEqual(['cefotaxime-meninge-300', 'amoxicilline-meninge-200', 'gentamicine-5-listeria', 'ceftriaxone-meninge-100', 'amoxicilline-meninge-200', 'gentamicine-5-listeria']);
  });

  test('examen direct négatif, évolution favorable sans germe : 14 jours', () => {
    const p = plan(meningite({ 'meningite.lcs': 'negatif', 'meningite.listeriose': 'non', 'meningite.evolution': 'favorable' }));
    expect(opt(p, 'meningite-neg-cefotaxime')?.prescriptions[0].duree.dureePrevueJours).toBe(14);
  });

  test('arguments pour une listériose non renseignés : demandés ; l’association avec amoxicilline reste conditionnelle ; « Compléter » vise l’âge s’il manque', () => {
    const p = plan(meningite({ 'meningite.lcs': 'trouble_attente' }));
    expect(p.situation.id).toBe('meningite-lcs-trouble');
    expect(p.donneesManquantes.some((m) => m.champ === 'arguments pour une listériose' && m.cible === 'details.meningite.listeriose')).toBe(true);
    expect(opt(p, 'meningite-neg-listeria-cefotaxime')?.rang).toBe('conditionnelle');
    const sansAge = plan(meningite({ 'meningite.lcs': 'trouble_attente', 'meningite.listeriose': 'non' }, (d) => (d.patient.age = undefined)));
    expect(sansAge.donneesManquantes.some((m) => m.cible === 'patient.age' && /listériose/.test(m.pourquoi))).toBe(true);
  });

  test('immunodépression : pas de dexaméthasone ; argument pour une listériose', () => {
    const p = plan(meningite({ 'meningite.lcs': 'negatif' }, (d) => (d.patient.immunodepression = 'oui')));
    expect(p.gestes.some((g) => /Pas de dexaméthasone : immunodépression/.test(g.texte))).toBe(true);
    expect(molecules(p, 'premiere_ligne')).toContain('amoxicilline-meninge-200');
  });

  test('purpura et LCS purulent (cocci à Gram positif) : critère de cas d’IIM, déclaration obligatoire quel que soit l’examen direct', () => {
    const p = plan(meningite({ 'meningite.purpura': 'autre', 'meningite.lcs': 'cgp' }));
    expect(textes(p)).toMatch(/Critère de cas d'infection invasive à méningocoque \(purpura et LCS purulent\)/);
  });
});

describe('Allergies', () => {
  test('allergie grave (anaphylaxie) : C3G écartées, vancomycine + rifampicine proposées (brouillon) avec avis infectiologique obligatoire', () => {
    const p = plan(meningite({ 'meningite.lcs': 'cgp' }, allergie('amoxicilline', 'immediate', 'severe')));
    const premiere = p.options.find((o) => o.rang === 'premiere_ligne')!;
    expect(premiere.id).toBe('meningite-cgp-allergie');
    expect(premiere.prescriptions.map((x) => x.regimenId)).toEqual(['vancomycine-meninge', 'rifampicine-meninge-300x2']);
    expect(premiere.statut).toBe('brouillon');
    expect(p.avisSpecialise.some((a) => /avis infectiologique obligatoire/.test(a.texte) && a.urgent)).toBe(true);
  });

  test('purpura fulminans et allergie grave : vancomycine + rifampicine et ciprofloxacine au même rang conditionnel, rien n’est promu ; avis immédiat', () => {
    const p = plan(meningite({ 'meningite.purpura': 'fulminans', 'meningite.listeriose': 'non' }, allergie('amoxicilline', 'immediate', 'severe')));
    expect(opt(p, 'meningite-neg-allergie')?.rang).toBe('conditionnelle');
    expect(opt(p, 'meningite-pf-allergie-ciprofloxacine')?.rang).toBe('conditionnelle');
    expect(p.options.some((o) => o.rang === 'premiere_ligne' && o.prescriptions.some((x) => x.moleculeId === 'vancomycine'))).toBe(false);
    expect(p.avisSpecialise.some((a) => /Purpura fulminans et allergie grave/.test(a.texte) && a.urgent)).toBe(true);
  });

  test('allergie immédiate non grave à la ceftriaxone, cocci à Gram positif : l’option d’allergie est promue en 1re ligne (pas d’alerte « aucune option »)', () => {
    const p = plan(meningite({ 'meningite.lcs': 'cgp' }, allergie('ceftriaxone', 'immediate', 'moderee')));
    expect(p.options.find((o) => o.rang === 'premiere_ligne')?.id).toBe('meningite-cgp-allergie');
    expect(p.urgence.alertes.some((a) => /aucune option de la base/.test(a.texte))).toBe(false);
  });

  test('allergie non grave à l’amoxicilline (réaction retardée bénigne), bacille à Gram positif : cotrimoxazole promu (éviction lue au niveau de la molécule)', () => {
    const p = plan(meningite({ 'meningite.lcs': 'bgp' }, allergie('amoxicilline', 'retardee_benigne')));
    expect(p.options.find((o) => o.rang === 'premiere_ligne')?.id).toBe('meningite-bgp-allergie');
  });

  test('allergie immédiate non grave à l’amoxicilline, arguments pour une listériose : C3G + cotrimoxazole promue (brouillon, association composée signalée)', () => {
    const p = plan(meningite({ 'meningite.lcs': 'negatif' }, (d) => {
      d.patient.age = 75;
      allergie('amoxicilline', 'immediate', 'moderee')(d);
    }));
    const premiere = p.options.find((o) => o.rang === 'premiere_ligne')!;
    expect(premiere.prescriptions.map((x) => x.moleculeId)).toEqual(['cefotaxime', 'cotrimoxazole']);
    expect(premiere.commentaire).toMatch(/composée par l'application/);
    expect(p.urgence.alertes.some((a) => /aucune option de la base/.test(a.texte))).toBe(false);
  });

  test('allergie grave, arguments pour une listériose, ClCr < 15 : cotrimoxazole écarté mais vancomycine + rifampicine conservées, écart signalé', () => {
    const p = plan(meningite({ 'meningite.lcs': 'negatif' }, (d) => {
      d.patient.age = 75;
      d.patient.renal = { creatinine: { valeur: 700, unite: 'umol/L' }, stabilite: 'stable', insuffisanceRenaleAigue: 'non', dialyse: 'aucune' };
      allergie('amoxicilline', 'immediate', 'severe')(d);
    }));
    expect(opt(p, 'meningite-neg-allergie-sans-cotrimoxazole')?.prescriptions.map((x) => x.moleculeId)).toEqual(['vancomycine', 'rifampicine']);
    expect(textes(p)).toMatch(/ne couvrent pas Listeria/);
  });
});

describe('Adaptation rénale et doses des régimes méningés', () => {
  test('hémodialyse, listériose possible : aucun palier « standard » du RCP sous les doses méningées ; pleine dose 24 h puis avis et dosages', () => {
    const p = plan(meningite({ 'meningite.lcs': 'negatif' }, (d) => {
      d.patient.age = 75;
      d.patient.renal = { creatinine: { valeur: 700, unite: 'umol/L' }, stabilite: 'stable', insuffisanceRenaleAigue: 'non', dialyse: 'hemodialyse_intermittente', horairesDialyse: 'lundi, mercredi, vendredi' };
    }));
    const ctx = adaptations(p, 'cefotaxime-meninge-300');
    expect(ctx).toMatch(/Pleine dose les 24 premières heures/);
    expect(ctx).not.toMatch(/1 à 2 g\/jour/);
    const amx = adaptations(p, 'amoxicilline-meninge-200');
    expect(amx).toMatch(/avis pharmacologique/);
    expect(amx).not.toMatch(/500 mg/);
    expect(adaptations(p, 'ceftriaxone-meninge-100')).not.toMatch(/2 g\/jour/);
  });

  test('ClCr < 15 : céfotaxime réduit de 75 % après 24 h, ceftriaxone de 50 % (SPILF), sans plafond de 2 g/j ; amoxicilline sans les doses du RCP', () => {
    const p = plan(meningite({ 'meningite.lcs': 'negatif' }, (d) => {
      d.patient.age = 75;
      d.patient.renal = { creatinine: { valeur: 900, unite: 'umol/L' }, stabilite: 'stable', insuffisanceRenaleAigue: 'non', dialyse: 'aucune' };
    }));
    const ctx = adaptations(p, 'cefotaxime-meninge-300');
    expect(ctx).toMatch(/réduction de 75 % : 75 mg\/kg\/j/);
    expect(ctx).not.toMatch(/demi-dose/);
    const cro = adaptations(p, 'ceftriaxone-meninge-100');
    expect(cro).toMatch(/réduction de 50 %/);
    expect(cro).not.toMatch(/ne pas dépasser 2 g/);
    const amx = adaptations(p, 'amoxicilline-meninge-200');
    expect(amx).toMatch(/aucune adaptation de la dose méningée/);
    expect(amx).not.toMatch(/500 mg à 1 g deux fois par jour|500 mg\/jour/);
    expect(opt(p, 'meningite-neg-listeria-cefotaxime')?.prescriptions[0].doseAffichee).toMatch(/Dose de référence/);
  });

  test('130 kg : avertissement au-delà de 24 g/j de céfotaxime et de 12 g/j d’amoxicilline ; charge de vancomycine > 3 g signalée', () => {
    const p = plan(meningite({ 'meningite.lcs': 'negatif' }, (d) => {
      d.patient.poidsKg = 130;
      d.patient.age = 75;
    }));
    expect(textes(p)).toMatch(/Céfotaxime 300 mg\/kg\/j pour 130 kg : 39 g\/j, au-delà de 24 g\/j/);
    expect(textes(p)).toMatch(/Amoxicilline 200 mg\/kg\/j pour 130 kg : 26 g\/j/);
    expect(textes(p)).toMatch(/Vancomycine : dose de charge/);
  });

  test('cotrimoxazole méningé : dose par prise cohérente avec 10 mg/kg/j (bas de la fourchette)', () => {
    const r = regimen('cotrimoxazole', 'smx-tmp-meninge').regimen;
    expect(r.dose.valeur * (r.dose.frequenceParJour ?? 1)).toBe(10);
  });
});

describe('Germe documenté : adaptation à la CMI et durées', () => {
  test('pneumocoque CMI C3G et amoxicilline ≤ 0,5 mg/L, évolution favorable : amoxicilline 200 mg/kg/j, 10 jours ; PL de contrôle non systématique ; dexaméthasone 4 jours', () => {
    const p = plan(meningite({ 'meningite.germe': 'pneumocoque', 'meningite.cmi_c3g': 'le_0_5', 'meningite.cmi_amox': 'le_0_5', 'meningite.evolution': 'favorable', 'meningite.orl': 'non' }));
    expect(p.situation.id).toBe('meningite-pneumocoque');
    const o = p.options.find((x) => x.rang === 'premiere_ligne')!;
    expect(o.prescriptions[0].regimenId).toBe('amoxicilline-meninge-200');
    expect(o.prescriptions[0].duree.dureePrevueJours).toBe(10);
    expect(p.controles.find((c) => c.id === 'ctl-meningite-pl-controle')?.categorie).toBe('non_systematique');
    expect(p.gestes.some((g) => /poursuivre 4 jours/.test(g.texte))).toBe(true);
  });

  test('pneumocoque CMI C3G ≤ 0,5 mg/L, CMI amoxicilline inconnue : C3G maintenue à 300/100 mg/kg/j en 1re ligne (pas de baisse non sourcée)', () => {
    const p = plan(meningite({ 'meningite.germe': 'pneumocoque', 'meningite.cmi_c3g': 'le_0_5', 'meningite.evolution': 'trop_tot', 'meningite.orl': 'non' }));
    expect(molecules(p, 'premiere_ligne')).toEqual(['cefotaxime-meninge-300', 'ceftriaxone-meninge-100']);
    expect(opt(p, 'meningite-pneumo-c3g200-cefotaxime')?.rang).toBe('conditionnelle');
  });

  test('pneumocoque immunodéprimé : pas de poursuite de la dexaméthasone', () => {
    const p = plan(meningite({ 'meningite.germe': 'pneumocoque', 'meningite.cmi_c3g': 'gt_0_5', 'meningite.evolution': 'favorable' }, (d) => (d.patient.immunodepression = 'oui')));
    expect(p.gestes.some((g) => /Pas de dexaméthasone : immunodépression/.test(g.texte))).toBe(true);
    expect(p.gestes.some((g) => /la poursuivre 4 jours/.test(g.texte))).toBe(false);
  });

  test('pneumocoque CMI C3G > 0,5 mg/L : céfotaxime 300 / ceftriaxone 100 mg/kg/j, PL de contrôle avec dosages, avis infectiologue et microbiologiste, 14 jours', () => {
    const p = plan(meningite({ 'meningite.germe': 'pneumocoque', 'meningite.cmi_c3g': 'gt_0_5', 'meningite.evolution': 'favorable', 'meningite.orl': 'non' }));
    expect(molecules(p, 'premiere_ligne')).toEqual(['cefotaxime-meninge-300', 'ceftriaxone-meninge-100']);
    expect(p.options[0].prescriptions[0].duree.dureePrevueJours).toBe(14);
    expect(p.controles.find((c) => c.id === 'ctl-meningite-pl-controle')?.categorie).toBe('indique');
    expect(p.avisSpecialise.some((a) => /microbiologiste/.test(a.texte))).toBe(true);
  });

  test('pneumocoque d’hémoculture, céfotaxime rendu R sans CMI : alerte (catégorie non convertie), avis, pas « CMI en attente »', () => {
    const d = meningite({ 'meningite.evolution': 'trop_tot', 'meningite.orl': 'non' });
    d.prelevements = [prl('hemoculture', 'streptococcus_pneumoniae', 'meningite', (x) => {
      x.stade = 'antibiogramme';
      x.antibiogramme = [{ dci: 'cefotaxime', categorie: 'R' }];
    })];
    const p = plan(d);
    expect(textes(p)).toMatch(/C3G catégorisée I ou R sans CMI saisie/);
    expect(opt(p, 'meningite-pneumo-c3g300-cefotaxime')?.libelle).toMatch(/C3G I ou R/);
  });

  test('méningocoque, évolution favorable : C3G 4 jours, divergence des durées affichée ; évolution pas encore évaluable : pas de durée imposée', () => {
    const p = plan(meningite({ 'meningite.germe': 'meningocoque', 'meningite.evolution': 'favorable' }));
    const o = opt(p, 'meningite-meningo-cefotaxime')!;
    expect(o.rang).toBe('premiere_ligne');
    expect(opt(p, 'meningite-meningo-ceftriaxone')?.rang).toBe('premiere_ligne');
    expect(o.prescriptions[0].duree.dureePrevueJours).toBe(4);
    expect(o.prescriptions[0].duree.texte).toMatch(/5 à 7 jours/);
    expect(o.prescriptions[0].duree.texte).toMatch(/au-delà de 4 jours/);
    expect(textes(p)).toMatch(/déclaration obligatoire/);
    const tot = plan(meningite({ 'meningite.germe': 'meningocoque', 'meningite.evolution': 'trop_tot' }));
    expect(opt(tot, 'meningite-meningo-cefotaxime')?.prescriptions[0].duree.dureePrevueJours).toBeUndefined();
  });

  test('Listeria : amoxicilline + gentamicine (5 premiers jours), 21 jours ; dexaméthasone arrêtée ; déclaration obligatoire', () => {
    const p = plan(meningite({ 'meningite.germe': 'listeria', 'meningite.evolution': 'trop_tot' }));
    const o = p.options.find((x) => x.rang === 'premiere_ligne')!;
    expect(o.prescriptions.map((x) => x.moleculeId)).toEqual(['amoxicilline', 'gentamicine']);
    expect(o.prescriptions[0].duree.dureePrevueJours).toBe(21);
    expect(o.prescriptions[1].modalites).toMatch(/seuil d'obésité de 1,25 est un choix de l'application/);
    expect(p.gestes.some((g) => /l'arrêter/.test(g.texte) && /listériose/.test(g.texte))).toBe(true);
    expect(textes(p)).toMatch(/Listeria monocytogenes : déclaration obligatoire/);
  });

  test('E. coli : C3G 21 jours ; PL de contrôle et imagerie systématiques ; antécédent d’E. coli BLSE : méropénème et avis d’expert ; BLSE d’une autre espèce : pas de méropénème, avis', () => {
    const p = plan(meningite({ 'meningite.germe': 'e_coli', 'meningite.evolution': 'favorable' }));
    expect(molecules(p, 'premiere_ligne')).toEqual(['cefotaxime-meninge-200', 'ceftriaxone-meninge-75']);
    expect(p.options[0].prescriptions[0].duree.dureePrevueJours).toBe(21);
    expect(p.controles.find((c) => c.id === 'ctl-meningite-pl-controle')?.categorie).toBe('indique');
    expect(p.controles.find((c) => c.id === 'ctl-meningite-imagerie')?.categorie).toBe('indique');
    const blse = plan(meningite({ 'meningite.germe': 'e_coli', 'meningite.evolution': 'favorable' }, (d) => (d.patient.antecedentsMicro = [{ organisme: 'escherichia_coli', resistance: 'BLSE' }])));
    expect(molecules(blse, 'premiere_ligne')).toEqual(['meropeneme-meninge-40']);
    expect(blse.avisSpecialise.some((a) => /avis d'expert/.test(a.texte))).toBe(true);
    const kpn = plan(meningite({ 'meningite.germe': 'e_coli', 'meningite.evolution': 'favorable' }, (d) => (d.patient.antecedentsMicro = [{ organisme: 'Klebsiella pneumoniae', resistance: 'BLSE' }])));
    expect(molecules(kpn)).not.toContain('meropeneme-meninge-40');
    expect(textes(kpn)).toMatch(/BLSE autre qu'E. coli/);
  });

  test('S. agalactiae d’hémoculture résistant à l’amoxicilline : option écartée (raison tracée), avis immédiat', () => {
    const d = meningite({ 'meningite.evolution': 'favorable' });
    d.prelevements = [prl('hemoculture', 'streptococcus_agalactiae', 'meningite', (x) => {
      x.stade = 'antibiogramme';
      x.antibiogramme = [{ dci: 'amoxicilline', categorie: 'R' }];
    })];
    const p = plan(d);
    expect(opt(p, 'meningite-sagalactiae-amox')).toBeUndefined();
    expect(p.sortie.ecartees.some((e) => e.type === 'resistance' && /amoxicilline/i.test(e.raison))).toBe(true);
    expect(p.avisSpecialise.some((a) => /résistant sur l'antibiogramme/.test(a.texte) && a.urgent)).toBe(true);
  });

  test('hémoculture à S. pneumoniae sans réponse à la question du germe : méningite à pneumocoque retenue (priorité sur la règle des streptocoques)', () => {
    const d = meningite({ 'meningite.cmi_c3g': 'gt_0_5', 'meningite.evolution': 'trop_tot' });
    d.prelevements = [prl('hemoculture', 'streptococcus_pneumoniae', 'meningite')];
    const p = plan(d);
    expect(p.situation.id).toBe('meningite-pneumocoque');
    expect(p.regles.map((r) => r.id)).toContain('R-MENINGITE-BACTERIENNE');
    expect(p.regles.map((r) => r.id)).not.toContain('R-BACTERIEMIE-STREPTOCOQUE');
    expect(p.optionRetenueId).toBe('meningite-pneumo-c3g300-cefotaxime');
  });
});

describe('Documentation par les seuls prélèvements pertinents ; règles de bactériémie', () => {
  test('ECBU à E. coli et LCS à cocci à Gram positif après 70 ans : la méningite n’est pas « documentée à E. coli » ; réponses LCS conservées', () => {
    const d = meningite({ 'meningite.lcs': 'cgp' }, (x) => (x.patient.age = 75));
    d.prelevements = [prl('urine', 'escherichia_coli', 'urinaire')];
    const p = plan(d);
    expect(p.situation.id).toBe('meningite-examen-direct-cgp');
    expect(d.details!['meningite.lcs']).toBe('cgp');
    expect(molecules(p)).not.toContain('cefotaxime-meninge-200');
  });

  test('sepsis, LCS à cocci à Gram positif, ECBU à Klebsiella : la situation reste la méningite', () => {
    const d = meningite({ 'meningite.lcs': 'cgp' }, (x) => (x.patient.gravite = 'sepsis'));
    d.prelevements = [prl('urine', 'klebsiella_pneumoniae', 'inconnu')];
    const p = plan(d);
    expect(p.situation.id).toBe('meningite-examen-direct-cgp');
  });

  test('hémoculture à S. aureus au foyer méningé : règle de S. aureus exclue, germe hors liste signalé, schéma probabiliste conservé', () => {
    const d = meningite({ 'meningite.lcs': 'cgp' });
    d.prelevements = [prl('hemoculture', 'staphylococcus_aureus', 'meningite')];
    const p = plan(d);
    expect(p.regles.map((r) => r.id)).not.toContain('R-BACTERIEMIE-S-AUREUS');
    expect(p.situation.id).toBe('meningite-examen-direct-cgp');
    expect(textes(p)).toMatch(/germe hors des schémas méningés modélisés/);
  });

  test('hémoculture à Klebsiella : alerte « germe hors liste », pas de documentation silencieuse', () => {
    const d = meningite({ 'meningite.lcs': 'bgn' });
    d.prelevements = [prl('hemoculture', 'klebsiella_pneumoniae', 'meningite')];
    const p = plan(d);
    expect(p.situation.id).toBe('meningite-examen-direct-bgn');
    expect(textes(p)).toMatch(/Hémoculture à .*germe hors des schémas méningés/);
  });

  test('syndrome méningite et hémoculture rattachée à un autre foyer : la règle de méningite s’applique quand même, avec une alerte', () => {
    const d = meningite({ 'meningite.lcs': 'cgp' });
    d.prelevements = [prl('hemoculture', 'staphylocoque_coagulase_negative', 'urinaire')];
    const p = plan(d);
    expect(p.regles.map((r) => r.id)).toContain('R-MENINGITE-BACTERIENNE');
    expect(textes(p)).toMatch(/rattaché à un autre foyer/);
  });

  test('syndrome méningite et hémoculture au foyer inconnu : la méningite est retenue', () => {
    const d = meningite({ 'meningite.lcs': 'cgp' });
    d.prelevements = [prl('hemoculture', 'streptococcus_pneumoniae', 'inconnu')];
    const p = plan(d);
    expect(p.situation.id).toBe('meningite-pneumocoque');
  });
});

describe('Méningite post-neurochirurgicale, statut, questions et sources', () => {
  test('contexte associé aux soins sans neurochirurgie : schéma communautaire avec alerte et couverture partielle ; neurochirurgie non renseignée : demandée', () => {
    const p = plan(meningite({ 'meningite.lcs': 'cgp' }, (d) => (d.patient.contexte = 'associe_aux_soins')));
    expect(p.situation.id).toBe('meningite-examen-direct-cgp');
    expect(p.situation.couverture).toBe('partielle');
    expect(p.donneesManquantes.some((m) => m.cible === 'details.meningite.neurochirurgie')).toBe(true);
  });

  test('méningite post-neurochirurgicale : pas de schéma communautaire ; avis spécialisé, absence expliquée ; urgence et purpura fulminans conservés', () => {
    const p = plan(meningite({ 'meningite.lcs': 'cgp', 'meningite.neurochirurgie': 'oui', 'meningite.purpura': 'fulminans' }, (d) => (d.patient.contexte = 'associe_aux_soins')));
    expect(p.situation.id).toBe('meningite-associee-soins');
    expect(p.options).toHaveLength(0);
    expect(p.absencesRecommandation.some((a) => /associée aux soins/.test(a.sujet))).toBe(true);
    expect(p.avisSpecialise.some((a) => a.urgent)).toBe(true);
    expect(p.indication?.decision).toBe('urgence');
    expect(p.urgence.alertes.some((a) => a.niveau === 'urgence' && /Purpura fulminans/.test(a.texte))).toBe(true);
    expect(p.urgence.alertes.some((a) => /dans l'heure suivant l'admission/.test(a.texte))).toBe(true);
  });

  test('statut : règle et options en brouillon ; référentiel SPILF 2018 de vigueur incertaine', () => {
    const p = plan(meningite({ 'meningite.lcs': 'cgp' }));
    expect(p.regles.find((r) => r.id === 'R-MENINGITE-BACTERIENNE')?.statut).toBe('brouillon');
    expect(p.options.every((o) => o.statut === 'brouillon')).toBe(true);
    expect(SOURCES_PAR_ID['SPILF-2018-meningites'].statutVigueur).toBe('incertain');
  });

  test('questions du foyer : examen direct conservé après documentation ; CMI seulement pour le pneumocoque ; réponses sans objet effacées', () => {
    const d = meningite({ 'meningite.lcs': 'pas_faite', 'meningite.listeriose': 'non' });
    expect(questionsPour('meningite', d).map((q) => q.id)).toEqual(expect.arrayContaining(['meningite.neurochirurgie', 'meningite.purpura', 'meningite.lcs', 'meningite.imagerie', 'meningite.ci_pl', 'meningite.listeriose', 'meningite.germe']));
    expect(questionsPour('meningite', d).some((q) => q.id === 'meningite.cmi_c3g')).toBe(false);
    expect(questionsPour('meningite', d).some((q) => q.id === 'meningite.evolution')).toBe(false);
    d.details!['meningite.germe'] = 'pneumocoque';
    nettoyerDossier(d);
    expect(d.details!['meningite.lcs']).toBe('pas_faite');
    expect(d.details!['meningite.listeriose']).toBeUndefined();
    expect(questionsPour('meningite', d).some((q) => q.id === 'meningite.cmi_c3g')).toBe(true);
  });

  test('toute source citée par les plans de méningite existe dans le registre ; extraits reformulés marqués', () => {
    const cas = [
      meningite({ 'meningite.purpura': 'fulminans', 'meningite.lcs': 'pas_faite' }),
      meningite({ 'meningite.lcs': 'cgn' }),
      meningite({ 'meningite.lcs': 'bgn' }),
      meningite({ 'meningite.lcs': 'negatif' }, (d) => (d.patient.age = 80)),
      meningite({ 'meningite.germe': 'pneumocoque', 'meningite.cmi_c3g': 'le_0_5', 'meningite.cmi_amox': 'le_0_5', 'meningite.orl': 'oui', 'meningite.evolution': 'defavorable' }),
      meningite({ 'meningite.germe': 'listeria' }),
      meningite({ 'meningite.germe': 'h_influenzae' }),
      meningite({ 'meningite.germe': 's_agalactiae' }),
      meningite({ 'meningite.germe': 'autre' }),
      meningite({ 'meningite.neurochirurgie': 'oui' }, (d) => (d.patient.contexte = 'associe_aux_soins')),
    ];
    const manquantes = new Set<string>();
    for (const d of cas) {
      const p = plan(d);
      const refs = [...p.sources, ...p.urgence.alertes.flatMap((a) => a.sources ?? []), ...p.absencesRecommandation.flatMap((a) => a.sources), ...p.options.flatMap((o) => [...o.sources, ...o.prescriptions.flatMap((x) => x.sources)])];
      for (const r of refs) if (!SOURCES_PAR_ID[r.source]) manquantes.add(r.source);
      // Le texte long SPILF est en anglais : un extrait en français est une reformulation, signalée comme telle.
      for (const r of refs) if (r.source === 'SPILF-2018-meningites' && r.extrait && /[éèàù]/.test(r.extrait)) expect(r.extrait).toMatch(/^\[reformulation\]/);
    }
    expect([...manquantes]).toEqual([]);
  });
});
