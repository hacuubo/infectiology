/**
 * Infections intra-abdominales (R-INTRA-ABDOMINAL, 2026-11-06). Résultats attendus établis d'après
 * docs/sources/recherche-intra-abdominal.md (SFAR 2026, HAS 2017/2021, WSES 2020, TG18, EASL 2018, SPILF/GPIP 2021,
 * RCP et CRAT du métronidazole), indépendamment du code.
 */
import { decider } from '../engine/decider';
import { dossierParDefaut, nettoyerDossier, nouveauPrelevement, type Dossier } from '../engine/etat';
import { questionsPour } from '../clinical/syndromes/questions';
import { MOLECULES_PAR_ID } from '../clinical/molecules';
import { SOURCES_PAR_ID } from '../clinical/sources';
import type { Plan } from '../clinical/types';

const MAINTENANT = new Date('2026-11-06T10:00:00Z');

function iia(details: Record<string, string>, modif?: (d: Dossier) => void): Dossier {
  const d = dossierParDefaut();
  d.entree = 'syndrome';
  d.syndrome = 'digestif';
  d.patient.age = 55;
  d.patient.sexe = 'homme';
  d.patient.poidsKg = 70;
  d.patient.grossesse = 'non';
  d.patient.immunodepression = 'non';
  d.patient.neutropenie = 'non';
  d.patient.statutAllergie = 'aucune';
  d.patient.contexte = 'communautaire';
  d.patient.gravite = 'stable';
  d.patient.renal = { creatinine: { valeur: 80, unite: 'umol/L' }, stabilite: 'stable', insuffisanceRenaleAigue: 'non', dialyse: 'aucune' };
  d.details = { ...details };
  modif?.(d);
  return d;
}
function plan(d: Dossier): Plan {
  nettoyerDossier(d);
  return decider(d, { maintenant: MAINTENANT });
}
const premieres = (p: Plan) => p.options.filter((o) => o.rang === 'premiere_ligne');
const mols = (o: Plan['options'][number]) => o.prescriptions.map((x) => x.moleculeId);
const PERITONITE = { 'digestif.type': 'peritonite', 'digestif.source': 'obtenu' };

describe('Péritonite communautaire (SFAR 2026)', () => {
  test('sans sepsis ni choc : C3G (céfotaxime ou ceftriaxone) + métronidazole 500 mg/8 h ; 4 jours après contrôle de la source', () => {
    const p = plan(iia(PERITONITE));
    expect(p.situation.id).toBe('iia-communautaire');
    expect(p.regles.some((r) => r.id === 'R-SYNDROME-NON-COUVERT')).toBe(false);
    const l1 = premieres(p);
    expect(l1.map(mols)).toEqual([['cefotaxime', 'metronidazole'], ['ceftriaxone', 'metronidazole']]);
    expect(l1.every((o) => o.statut === 'verifiee_ia')).toBe(true);
    const mtz = l1[0].prescriptions[1];
    expect(mtz.doseAffichee).toMatch(/500 mg × 3\/24 h/);
    expect(mtz.duree.texte).toMatch(/^4 jours/);
    expect(mtz.duree.pointDeDepart).toMatch(/contrôle de la source/);
    expect(mtz.adaptations.join(' ')).toMatch(/Pas d'adaptation/);
    expect(p.options.some((o) => mols(o).some((m) => ['meropeneme', 'imipeneme', 'ertapeneme', 'piperacilline_tazobactam'].includes(m)))).toBe(false);
  });

  test('source non encore contrôlée : la durée n’est pas fixée et un avis chirurgical est demandé', () => {
    const p = plan(iia({ 'digestif.type': 'peritonite', 'digestif.source': 'en_attente' }));
    expect(premieres(p)[0].prescriptions[0].duree.texte).toMatch(/^Après contrôle de la source/);
    expect(p.avisSpecialise.some((a) => /Contrôle de la source à réaliser/.test(a.texte))).toBe(true);
  });

  test('sepsis : C3G + métronidazole sauf antécédent documenté de BLSE < 6 mois (carbapénème, brouillon)', () => {
    const sansBlse = plan(iia({ ...PERITONITE, 'digestif.fdr_blse': 'autre_fdr' }, (d) => (d.patient.gravite = 'sepsis')));
    expect(premieres(sansBlse).map(mols)).toEqual([['cefotaxime', 'metronidazole'], ['ceftriaxone', 'metronidazole']]);
    const blse = plan(iia({ ...PERITONITE, 'digestif.fdr_blse': 'atcd_blse_6mois' }, (d) => (d.patient.gravite = 'sepsis')));
    expect(blse.options.some((o) => mols(o).includes('cefotaxime'))).toBe(false);
    const carba = premieres(blse);
    expect(carba.map(mols)).toEqual([['meropeneme']]);
    expect(carba[0].statut).toBe('brouillon');
  });

  test('choc septique : pipéracilline-tazobactam sans facteur de risque de BLSE, carbapénème avec ; facteur inconnu demandé', () => {
    const sans = plan(iia({ ...PERITONITE, 'digestif.fdr_blse': 'aucun' }, (d) => (d.patient.gravite = 'choc_septique')));
    expect(premieres(sans).map(mols)).toEqual([['piperacilline_tazobactam']]);
    expect(premieres(sans)[0].prescriptions[0].doseAffichee).toMatch(/16 g en perfusion continue/);
    const avec = plan(iia({ ...PERITONITE, 'digestif.fdr_blse': 'autre_fdr' }, (d) => (d.patient.gravite = 'choc_septique')));
    expect(premieres(avec).map(mols)).toEqual([['meropeneme']]);
    expect(avec.options.find((o) => o.id === 'iia-choc-piptazo-amikacine')?.statut).toBe('brouillon');
    const inconnu = plan(iia(PERITONITE, (d) => (d.patient.gravite = 'choc_septique')));
    expect(inconnu.donneesManquantes.some((m) => /facteurs de risque de BLSE/.test(m.champ))).toBe(true);
    expect(inconnu.options.every((o) => o.rang !== 'premiere_ligne')).toBe(true);
  });

  test('allergie retardée sévère aux bêta-lactamines : lévofloxacine + métronidazole proposée (avis d’experts, brouillon)', () => {
    const p = plan(iia(PERITONITE, (d) => {
      d.patient.statutAllergie = 'presentes';
      d.patient.allergies = [{ molecule: 'amoxicilline', reaction: 'retardee_severe' }];
    }));
    const l1 = premieres(p);
    expect(l1.map(mols)).toEqual([['levofloxacine', 'metronidazole']]);
    expect(l1[0].statut).toBe('brouillon');
    expect(l1[0].commentaire).toMatch(/Moxifloxacine/);
  });
});

describe('IIA associée aux soins (SFAR 2026)', () => {
  const SOINS = { ...PERITONITE, 'digestif.postop': 'non_postop', 'digestif.bmr': 'aucun', 'digestif.dosage_cefepime': 'oui', 'digestif.fdr_enterocoque': 'non', 'digestif.levures': 'non', 'digestif.sus_mesocolique': 'non', 'digestif.atb_48h': 'non' };
  const soins = (det: Record<string, string>, modif?: (d: Dossier) => void) => iia(det, (d) => { d.patient.contexte = 'associe_aux_soins'; modif?.(d); });

  test('1er épisode sans critère de BMR : céfépime + métronidazole avec dosage plasmatique ; 4 jours sans gravité, 8 jours si sepsis', () => {
    const p = plan(soins(SOINS));
    expect(premieres(p).map(mols)).toEqual([['cefepime', 'metronidazole']]);
    expect(p.controles.find((c) => c.id === 'ctl-iia-cefepime-stp')?.quand.texte).toMatch(/24e et la 36e heure/);
    expect(premieres(p)[0].prescriptions[0].duree.texte).toMatch(/4 jours/);
    const sepsis = plan(soins(SOINS, (d) => (d.patient.gravite = 'sepsis')));
    expect(premieres(sepsis)[0].prescriptions[0].duree.texte).toMatch(/8 jours/);
  });

  test('dosage du céfépime impossible : pipéracilline-tazobactam (avis d’experts) ; + vancomycine si risque d’entérocoque', () => {
    const p = plan(soins({ ...SOINS, 'digestif.dosage_cefepime': 'non' }));
    expect(premieres(p).map(mols)).toEqual([['piperacilline_tazobactam']]);
    expect(premieres(p)[0].statut).toBe('brouillon');
    const e = plan(soins({ ...SOINS, 'digestif.dosage_cefepime': 'non', 'digestif.fdr_enterocoque': 'oui' }));
    expect(premieres(e).map(mols)).toEqual([['piperacilline_tazobactam', 'vancomycine']]);
  });

  test('un critère de BMR avec sepsis : carbapénème ; sans sepsis, un critère ne suffit pas', () => {
    const p = plan(soins({ ...SOINS, 'digestif.bmr': 'un' }, (d) => (d.patient.gravite = 'sepsis')));
    expect(premieres(p).map(mols)).toEqual([['meropeneme']]);
    const stable = plan(soins({ ...SOINS, 'digestif.bmr': 'un' }));
    expect(premieres(stable).map(mols)).toEqual([['cefepime', 'metronidazole']]);
  });

  test('antifongique : au moins 3 critères (choc, femme, chirurgie sus-mésocolique) → indiqué, molécule non modélisée', () => {
    const p = plan(soins({ ...SOINS, 'digestif.sus_mesocolique': 'oui' }, (d) => {
      d.patient.gravite = 'choc_septique';
      d.patient.sexe = 'femme';
    }));
    expect(p.urgence.alertes.some((a) => /Antifongique probabiliste indiqué/.test(a.texte))).toBe(true);
    expect(premieres(p).map(mols)).toEqual([['cefepime', 'metronidazole', 'vancomycine']]);
  });

  test('complication après une intervention pour IIA : pas de molécule (SFAR non nominative), absence expliquée et avis urgent', () => {
    const p = plan(soins({ ...SOINS, 'digestif.postop': 'complication_iia' }));
    expect(p.situation.id).toBe('iia-complication-postop');
    expect(p.options).toHaveLength(0);
    expect(p.absencesRecommandation.some((a) => /complication postopératoire/.test(a.sujet))).toBe(true);
    expect(p.avisSpecialise.some((a) => a.urgent)).toBe(true);
  });
});

describe('Appendicite et diverticulite', () => {
  test('appendicite non compliquée opérée : pas d’antibiothérapie au-delà de la dose unique peropératoire', () => {
    const p = plan(iia({ 'digestif.type': 'appendicite', 'digestif.appendicite.forme': 'non_compliquee', 'digestif.appendicite.prise_en_charge': 'appendicectomie', 'digestif.source': 'obtenu' }));
    expect(p.indication?.decision).toBe('ne_pas_traiter');
    expect(p.options).toHaveLength(0);
    expect(p.absencesRecommandation.some((a) => /dose unique peropératoire/.test(a.sujet))).toBe(true);
  });

  test('appendicite compliquée opérée : C3G + métronidazole 2 jours ; non opérée : absence expliquée (7 jours SPILF, molécule non précisée)', () => {
    const p = plan(iia({ 'digestif.type': 'appendicite', 'digestif.appendicite.forme': 'compliquee', 'digestif.appendicite.prise_en_charge': 'appendicectomie', 'digestif.source': 'obtenu' }));
    expect(premieres(p)[0].prescriptions[0].duree.texte).toMatch(/^2 jours/);
    const nop = plan(iia({ 'digestif.type': 'appendicite', 'digestif.appendicite.forme': 'non_compliquee', 'digestif.appendicite.prise_en_charge': 'non_operee' }));
    expect(nop.options).toHaveLength(0);
    expect(nop.absencesRecommandation[0].recherche).toMatch(/7 jours/);
  });

  test('diverticulite non compliquée confirmée au scanner, sans critère : pas d’antibiotique', () => {
    const p = plan(iia({ 'digestif.type': 'diverticulite', 'digestif.diverticulite.forme': 'non_compliquee', 'digestif.diverticulite.scanner': 'oui', 'digestif.diverticulite.signes_gravite': 'non', 'digestif.diverticulite.asa': 'non', 'digestif.diverticulite.echec': 'non' }));
    expect(p.indication?.decision).toBe('ne_pas_traiter');
    expect(p.options).toHaveLength(0);
  });

  test('diverticulite non compliquée sans réponse au traitement symptomatique : amoxicilline-acide clavulanique 1 g × 3/j per os 7 jours ; allergie : fluoroquinolone + métronidazole', () => {
    const p = plan(iia({ 'digestif.type': 'diverticulite', 'digestif.diverticulite.forme': 'non_compliquee', 'digestif.diverticulite.scanner': 'oui', 'digestif.diverticulite.signes_gravite': 'non', 'digestif.diverticulite.asa': 'non', 'digestif.diverticulite.echec': 'oui' }));
    const l1 = premieres(p);
    expect(l1.map(mols)).toEqual([['amoxicilline_clavulanate']]);
    expect(l1[0].prescriptions[0].voie).toBe('PO');
    expect(l1[0].prescriptions[0].duree.texte).toBe('7 jours');
    expect(p.options.filter((o) => o.rang === 'alternative').map(mols)).toEqual([['ciprofloxacine', 'metronidazole'], ['levofloxacine', 'metronidazole']]);
  });

  test('diverticulite non compliquée et grossesse : voie IV (schémas HAS 2017 en brouillon) ; divergence de grossesse du métronidazole signalée', () => {
    const p = plan(iia({ 'digestif.type': 'diverticulite', 'digestif.diverticulite.forme': 'non_compliquee', 'digestif.diverticulite.scanner': 'oui', 'digestif.diverticulite.signes_gravite': 'non', 'digestif.diverticulite.asa': 'non' }, (d) => {
      d.patient.sexe = 'femme';
      d.patient.age = 30;
      d.patient.grossesse = 'oui';
    }));
    expect(p.situation.id).toBe('diverticulite-non-compliquee-iv');
    expect(premieres(p).every((o) => o.statut === 'brouillon')).toBe(true);
    const mtz = p.options.flatMap((o) => o.prescriptions).find((x) => x.moleculeId === 'metronidazole')!;
    expect(mtz.avertissements.join(' ')).toMatch(/Divergence non tranchée/);
  });
});

describe('Infections biliaires, ascite, abcès hépatique', () => {
  test('angiocholite avec choc (grade III) : pipéracilline-tazobactam en brouillon ; durée SPILF 3 j et TG18 4-7 j affichées', () => {
    const p = plan(iia({ 'digestif.type': 'angiocholite', 'digestif.source': 'obtenu', 'digestif.biliaire.anastomose': 'non' }, (d) => (d.patient.gravite = 'choc_septique')));
    expect(p.situation.libelle).toMatch(/grade III/);
    const l1 = premieres(p);
    expect(l1.map(mols)).toEqual([['piperacilline_tazobactam']]);
    expect(l1[0].statut).toBe('brouillon');
    expect(l1[0].prescriptions[0].duree.texte).toMatch(/3 jours.*4 à 7 jours.*divergence/);
  });

  test('angiocholite communautaire de grade I : C3G sans métronidazole, sauf anastomose bilio-digestive', () => {
    const base = { 'digestif.type': 'angiocholite', 'digestif.source': 'en_attente', 'digestif.angiocholite.dysfonction': 'non', 'digestif.angiocholite.grade2': 'non' };
    const p = plan(iia({ ...base, 'digestif.biliaire.anastomose': 'non' }));
    expect(premieres(p).map(mols)).toEqual([['ceftriaxone'], ['cefotaxime']]);
    expect(p.gestes.some((g) => /CPRE/.test(g.texte))).toBe(true);
    const a = plan(iia({ ...base, 'digestif.biliaire.anastomose': 'oui' }));
    expect(premieres(a).map(mols)).toEqual([['ceftriaxone', 'metronidazole'], ['cefotaxime', 'metronidazole']]);
  });

  test('cholécystite : grille TG18 non lue, pas de molécule ; durées divergentes affichées', () => {
    const p = plan(iia({ 'digestif.type': 'cholecystite', 'digestif.cholecystite.prise_en_charge': 'cholecystectomie', 'digestif.cholecystite.compliquee': 'oui' }));
    expect(p.options).toHaveLength(0);
    expect(p.absencesRecommandation.some((a) => /cholécystite/.test(a.sujet))).toBe(true);
    expect(p.reevaluation.map((r) => r.texte).join(' ')).toMatch(/4 à 7 jours \(TG18\), 3 jours.*4 jours \(WSES 2021\)/);
  });

  test('infection spontanée du liquide d’ascite communautaire, faible résistance : céfotaxime (brouillon), albumine 1,5 g/kg puis 1 g/kg, ponction à 48 h', () => {
    const p = plan(iia({ 'digestif.type': 'pbs', 'digestif.pbs.pnn': 'oui', 'digestif.pbs.resistance': 'faible' }));
    expect(premieres(p).map(mols)).toEqual([['cefotaxime']]);
    expect(premieres(p)[0].statut).toBe('brouillon');
    expect(p.gestes.some((g) => /1,5 g\/kg.*105 g/.test(g.texte))).toBe(true);
    expect(p.controles.some((c) => c.id === 'ctl-pbs-48h')).toBe(true);
  });

  test('abcès hépatique : aucune recommandation dédiée, absence expliquée (28 jours SPILF/GPIP 2021)', () => {
    const p = plan(iia({ 'digestif.type': 'abces_hepatique' }));
    expect(p.options).toHaveLength(0);
    expect(p.absencesRecommandation[0].recherche).toMatch(/28 jours/);
  });
});

describe('Questions du foyer, molécule et sources', () => {
  test('questions affichées selon le type et effacées si le foyer change', () => {
    const d = iia({ 'digestif.type': 'diverticulite', 'digestif.diverticulite.forme': 'non_compliquee' });
    const ids = questionsPour('digestif', d).map((q) => q.id);
    expect(ids).toContain('digestif.diverticulite.asa');
    expect(ids).not.toContain('digestif.bmr');
    d.syndrome = 'urinaire';
    nettoyerDossier(d);
    expect(Object.keys(d.details ?? {})).toHaveLength(0);
  });

  test('type non renseigné : demandé, aucune option', () => {
    const p = plan(iia({}));
    expect(p.situation.id).toBe('iia-type-a-preciser');
    expect(p.donneesManquantes.some((m) => /type d'infection intra-abdominale/.test(m.champ))).toBe(true);
    expect(p.options).toHaveLength(0);
  });

  test('métronidazole : pas d’adaptation rénale, hémodialyse après la séance, sources du registre', () => {
    const m = MOLECULES_PAR_ID.metronidazole;
    expect(m.famille).toBe('nitroimidazole');
    expect(m.adaptationRenale.paliers[0].texte).toMatch(/Pas d'adaptation/);
    expect(m.adaptationRenale.hemodialyse?.texte).toMatch(/après la séance/);
    expect(SOURCES_PAR_ID['RCP-metronidazole-IV'].statutAcces).toBe('consultee');
    expect(SOURCES_PAR_ID['SPILF-2022-ICD-diapo']).toBeDefined();
  });

  test('toutes les références produites sur les parcours intra-abdominaux pointent vers le registre', () => {
    const cas = [
      iia(PERITONITE),
      iia({ ...PERITONITE, 'digestif.fdr_blse': 'autre_fdr' }, (d) => (d.patient.gravite = 'choc_septique')),
      iia({ ...PERITONITE, 'digestif.postop': 'complication_iia' }, (d) => (d.patient.contexte = 'associe_aux_soins')),
      iia({ 'digestif.type': 'angiocholite' }),
      iia({ 'digestif.type': 'cholecystite' }),
      iia({ 'digestif.type': 'pbs' }),
      iia({ 'digestif.type': 'abces_hepatique' }),
      iia({ 'digestif.type': 'diverticulite', 'digestif.diverticulite.forme': 'abces' }),
    ];
    const manquantes = new Set<string>();
    for (const d of cas) {
      const p = plan(d);
      const refs = [...p.sources, ...p.urgence.alertes.flatMap((a) => a.sources ?? []), ...p.absencesRecommandation.flatMap((a) => a.sources), ...(p.indication?.sources ?? []), ...p.reevaluation.flatMap((r) => r.sources)];
      for (const r of refs) if (!SOURCES_PAR_ID[r.source]) manquantes.add(r.source);
    }
    expect([...manquantes]).toEqual([]);
  });

  test('bactériémie à BGN avec foyer intra-abdominal : la situation reste intra-abdominale', () => {
    const d = iia(PERITONITE);
    const h = nouveauPrelevement('hemoculture');
    h.organisme = 'escherichia_coli';
    h.foyer = 'digestif';
    h.foyerStatut = 'suspecte';
    d.prelevements = [h];
    const p = plan(d);
    expect(p.situation.id).toBe('iia-communautaire');
    expect(p.regles.some((r) => r.id === 'R-BACTERIEMIE-BGN')).toBe(true);
  });
});
