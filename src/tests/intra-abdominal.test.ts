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
    expect(nop.absencesRecommandation.find((a) => /appendicite non opérée/.test(a.sujet))?.recherche).toMatch(/7 jours/);
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
  test('angiocholite avec choc (grade III) : pipéracilline-tazobactam, céfépime, méropénème au même rang (TG18 sans hiérarchie), en brouillon ; durée SPILF 3 j et TG18 4-7 j affichées', () => {
    const p = plan(iia({ 'digestif.type': 'angiocholite', 'digestif.source': 'obtenu', 'digestif.biliaire.anastomose': 'non' }, (d) => (d.patient.gravite = 'choc_septique')));
    expect(p.situation.libelle).toMatch(/grade III/);
    const l1 = premieres(p);
    // Relecture v7 (point 30) : TG18 liste ces molécules sans hiérarchie.
    expect(l1.map(mols)).toEqual([['piperacilline_tazobactam'], ['cefepime'], ['meropeneme']]);
    expect(l1[0].prescriptions[0].duree.dureePrevueJours).toBeUndefined();
    expect(l1[0].statut).toBe('brouillon');
    expect(l1[0].prescriptions[0].duree.texte).toMatch(/3 jours.*4 à 7 jours.*divergence/);
  });

  test('angiocholite communautaire de grade I : C3G sans métronidazole, sauf anastomose bilio-digestive', () => {
    const base = { 'digestif.type': 'angiocholite', 'digestif.source': 'en_attente', 'digestif.angiocholite.dysfonction': 'non', 'digestif.angiocholite.grade2': 'non' };
    const p = plan(iia({ ...base, 'digestif.biliaire.anastomose': 'non' }));
    // Relecture v7 (point 30) : ertapénème au même rang (TG18 sans hiérarchie).
    expect(premieres(p).map(mols)).toEqual([['ceftriaxone'], ['cefotaxime'], ['ertapeneme']]);
    expect(p.gestes.some((g) => /CPRE/.test(g.texte))).toBe(true);
    const a = plan(iia({ ...base, 'digestif.biliaire.anastomose': 'oui' }));
    expect(premieres(a).map(mols)).toEqual([['ceftriaxone', 'metronidazole'], ['cefotaxime', 'metronidazole'], ['ertapeneme']]);
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
    expect(p.absencesRecommandation.find((a) => /Abcès hépatique/.test(a.sujet))?.recherche).toMatch(/28 jours/);
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
    // Indication explicite et options du foyer conservées ; la durée du foyer est confrontée à la bactériémie.
    expect(p.indication?.decision).toBe('traiter');
    expect(premieres(p).map(mols)).toEqual([['cefotaxime', 'metronidazole'], ['ceftriaxone', 'metronidazole']]);
    expect(premieres(p)[0].prescriptions[0].duree.texte).toMatch(/^4 jours/);
    expect(p.urgence.alertes.some((a) => /ne visent pas explicitement le patient bactériémique/.test(a.texte))).toBe(true);
  });
});

/* ------------------------------------------------------------------ */
/* Relecture v7 (docs/relectures/v7-intra-abdominal.md)                */
/* ------------------------------------------------------------------ */

function hemoc(d: Dossier, organisme: NonNullable<Dossier['prelevements'][number]['organisme']>) {
  const h = nouveauPrelevement('hemoculture');
  h.organisme = organisme;
  h.foyer = 'digestif';
  h.foyerStatut = 'suspecte';
  d.prelevements = [...d.prelevements, h];
}
const DIV_SIMPLE = { 'digestif.type': 'diverticulite', 'digestif.diverticulite.forme': 'non_compliquee', 'digestif.diverticulite.scanner': 'oui', 'digestif.diverticulite.signes_gravite': 'non', 'digestif.diverticulite.asa': 'non', 'digestif.diverticulite.echec': 'non' };
const textes = (p: Plan) => [...p.urgence.alertes.map((a) => a.texte), ...p.reevaluation.map((r) => r.texte), ...p.avisSpecialise.map((a) => a.texte)].join(' | ');

describe('Relecture v7 — bactériémie, sepsis et choc : jamais « pas d’antibiotique »', () => {
  test('diverticulite non compliquée + E. coli en hémoculture : pas de conclusion « ne pas traiter », schéma IV HAS en brouillon', () => {
    const p = plan(iia(DIV_SIMPLE, (d) => hemoc(d, 'escherichia_coli')));
    expect(p.indication?.decision).not.toBe('ne_pas_traiter');
    expect(p.situation.id).toBe('diverticulite-non-compliquee-bacteriemie');
    expect(p.sortie.motifs.some((m) => m.type === 'non_indiquee')).toBe(false);
    const l1 = premieres(p);
    expect(l1.length).toBeGreaterThan(0);
    expect(l1.every((o) => o.statut === 'brouillon' && /extrapolation/.test(o.commentaire ?? ''))).toBe(true);
  });

  test('staphylocoque à coagulase négative (contaminant possible) : ignoré pour le foyer', () => {
    const p = plan(iia(DIV_SIMPLE, (d) => hemoc(d, 'staphylocoque_coagulase_negative')));
    expect(p.regles.some((r) => r.id === 'R-INTRA-ABDOMINAL')).toBe(true);
    expect(p.options.some((o) => o.id.startsWith('div-'))).toBe(false);
  });

  test('cholécystite opérée « non compliquée » avec bactériémie ou sepsis : pas de « pas d’antibiothérapie postopératoire » ; grade III TG18 4-7 j vs SPILF 3 j', () => {
    const det = { 'digestif.type': 'cholecystite', 'digestif.cholecystite.prise_en_charge': 'cholecystectomie', 'digestif.cholecystite.compliquee': 'non' };
    const stable = plan(iia(det));
    expect(textes(stable)).toMatch(/pas d'antibiothérapie postopératoire/);
    expect(textes(stable)).toMatch(/grade non modélisé/);
    for (const p of [plan(iia(det, (d) => hemoc(d, 'escherichia_coli'))), plan(iia(det, (d) => (d.patient.gravite = 'sepsis')))]) {
      expect(textes(p)).not.toMatch(/: pas d'antibiothérapie postopératoire/);
      expect(textes(p)).toMatch(/4 à 7 jours.*3 jours.*divergence non tranchée/);
      expect(p.indication?.decision).not.toBe('ne_pas_traiter');
    }
  });

  test('ascite sans critère de PBS avec bactériémie : absence de schéma expliquée, jamais « ne pas traiter »', () => {
    const p = plan(iia({ 'digestif.type': 'pbs', 'digestif.pbs.pnn': 'non' }, (d) => hemoc(d, 'escherichia_coli')));
    expect(p.indication?.decision).not.toBe('ne_pas_traiter');
    expect(p.absencesRecommandation.some((a) => /ascite sans critère/.test(a.sujet))).toBe(true);
  });

  test('appendicite dite non compliquée avec sepsis : schéma de l’appendicite compliquée en brouillon ; gravité inconnue : demandée, pas de conclusion', () => {
    const det = { 'digestif.type': 'appendicite', 'digestif.appendicite.forme': 'non_compliquee', 'digestif.appendicite.prise_en_charge': 'appendicectomie', 'digestif.source': 'obtenu' };
    const p = plan(iia({ ...det, 'digestif.fdr_blse': 'aucun' }, (d) => (d.patient.gravite = 'sepsis')));
    expect(p.options.length).toBeGreaterThan(0);
    expect(p.options.every((o) => o.statut === 'brouillon')).toBe(true);
    const inc = plan(iia(det, (d) => (d.patient.gravite = 'inconnu')));
    expect(inc.indication?.decision).toBe('informations_insuffisantes');
    expect(inc.donneesManquantes.find((m) => /^gravité/.test(m.champ))?.cible).toBe('patient.gravite');
  });

  test('diverticulite : gravité non renseignée → critère demandé, pas de « pas d’antibiotique »', () => {
    const p = plan(iia(DIV_SIMPLE, (d) => (d.patient.gravite = 'inconnu')));
    expect(p.indication?.decision).toBe('informations_insuffisantes');
  });
});

describe('Relecture v7 — appendicite associée aux soins, cibles, germes de bactériémie', () => {
  test('appendicite compliquée associée aux soins : la question « cadre » est posée et conservée ; céfépime + métronidazole', () => {
    const d = iia({ 'digestif.type': 'appendicite', 'digestif.appendicite.forme': 'compliquee', 'digestif.appendicite.prise_en_charge': 'appendicectomie', 'digestif.source': 'obtenu', 'digestif.postop': 'non_postop', 'digestif.bmr': 'aucun', 'digestif.dosage_cefepime': 'oui', 'digestif.fdr_enterocoque': 'non', 'digestif.levures': 'non', 'digestif.sus_mesocolique': 'non', 'digestif.atb_48h': 'non' }, (x) => (x.patient.contexte = 'associe_aux_soins'));
    expect(questionsPour('digestif', d).map((q) => q.id)).toContain('digestif.postop');
    const p = plan(d);
    expect(d.details?.['digestif.postop']).toBe('non_postop');
    expect(premieres(p).map(mols)).toEqual([['cefepime', 'metronidazole']]);
    expect(p.donneesManquantes.some((m) => /premier épisode/.test(m.champ))).toBe(false);
  });

  test('chaque donnée manquante d’un parcours digestif a une cible ; les questions cliniques ne sont pas classées en microbiologie', () => {
    const cas = [
      plan(iia({ 'digestif.type': 'peritonite' }, (d) => (d.patient.gravite = 'sepsis'))),
      plan(iia({ 'digestif.type': 'peritonite' }, (d) => (d.patient.gravite = 'choc_septique'))),
      plan(iia({ 'digestif.type': 'peritonite' }, (d) => (d.patient.contexte = 'associe_aux_soins'))),
      plan(iia({ 'digestif.type': 'diverticulite', 'digestif.diverticulite.forme': 'non_compliquee' })),
      plan(iia({ 'digestif.type': 'angiocholite' })),
      plan(iia({ 'digestif.type': 'cholecystite' })),
      plan(iia({ 'digestif.type': 'pbs' })),
      plan(iia({ 'digestif.type': 'appendicite' })),
      plan(iia({})),
    ];
    for (const p of cas) {
      // Hors périmètre : conditions de surveillance produites par le moteur (« si traitement > 3 jours »…), sans champ de saisie.
      for (const m of p.donneesManquantes.filter((x) => x.impact !== 'bloque_surveillance' && !/^si /.test(x.champ))) expect(`${m.champ} → ${m.cible}`).toMatch(/ → (details\.digestif\.|patient\.)/);
      expect(p.sortie.motifs.some((m) => m.type === 'microbiologie_insuffisante'), p.situation.id).toBe(false);
    }
  });

  test('péritonite + bactériémie à S. aureus ou à entérocoque : les options du foyer ne sont qu’en association (pas retenues en 1re ligne)', () => {
    for (const germe of ['staphylococcus_aureus', 'enterococcus_faecalis'] as const) {
      const p = plan(iia(PERITONITE, (d) => hemoc(d, germe)));
      const iiaOpts = p.options.filter((o) => o.id.startsWith('iia-'));
      expect(iiaOpts.length).toBeGreaterThan(0);
      expect(iiaOpts.every((o) => o.rang === 'conditionnelle' && /en association au traitement de la bactériémie/.test(o.condition ?? ''))).toBe(true);
      expect(p.optionRetenueId?.startsWith('iia-')).not.toBe(true);
      expect(textes(p)).toMatch(/Durée de la bactériémie à confronter/);
    }
    const angio = plan(iia({ 'digestif.type': 'angiocholite', 'digestif.source': 'obtenu', 'digestif.angiocholite.dysfonction': 'non', 'digestif.angiocholite.grade2': 'non', 'digestif.biliaire.anastomose': 'non' }, (d) => hemoc(d, 'enterococcus_faecalis')));
    expect(angio.options.filter((o) => o.id.startsWith('angio-')).every((o) => o.rang === 'conditionnelle')).toBe(true);
    expect(textes(angio)).toMatch(/au moins 2 semaines/);
  });
});

describe('Relecture v7 — schémas selon la gravité, allergie, aminosides', () => {
  test('complication postopératoire en choc, homme, sans levures : antifongique R3.3.5 indiqué, jamais « pas d’antifongique »', () => {
    const p = plan(iia({ ...PERITONITE, 'digestif.postop': 'complication_iia', 'digestif.levures': 'non' }, (d) => {
      d.patient.contexte = 'associe_aux_soins';
      d.patient.gravite = 'choc_septique';
    }));
    expect(p.urgence.alertes.some((a) => /R3\.3\.5/.test(a.texte) && /échinocandine/.test(a.texte))).toBe(true);
    expect(p.urgence.alertes.some((a) => /Pas d'antifongique/.test(a.texte))).toBe(false);
  });

  test('diverticulite abcédée drainée : schéma SFAR (4 jours après drainage) ; abcès non drainé en choc : pipéracilline-tazobactam (SFAR extrapolé, brouillon), schémas HAS conditionnels', () => {
    const draine = plan(iia({ 'digestif.type': 'diverticulite', 'digestif.diverticulite.forme': 'abces', 'digestif.source': 'obtenu' }));
    expect(premieres(draine).map(mols)).toEqual([['cefotaxime', 'metronidazole'], ['ceftriaxone', 'metronidazole']]);
    expect(premieres(draine)[0].prescriptions[0].duree.texte).toMatch(/^4 jours/);
    const choc = plan(iia({ 'digestif.type': 'diverticulite', 'digestif.diverticulite.forme': 'abces', 'digestif.source': 'non', 'digestif.fdr_blse': 'aucun' }, (d) => (d.patient.gravite = 'choc_septique')));
    expect(premieres(choc).map(mols)).toEqual([['piperacilline_tazobactam']]);
    expect(premieres(choc)[0].statut).toBe('brouillon');
    expect(premieres(choc)[0].prescriptions[0].doseAffichee).toMatch(/16 g/);
    expect(choc.options.filter((o) => o.id.startsWith('div-iv')).every((o) => o.rang === 'conditionnelle' && /sans sepsis ni choc/.test(o.condition ?? ''))).toBe(true);
    const simpleSepsis = plan(iia({ ...DIV_SIMPLE, 'digestif.fdr_blse': 'aucun' }, (d) => (d.patient.gravite = 'sepsis')));
    expect(premieres(simpleSepsis).length).toBeGreaterThan(0);
    expect(simpleSepsis.indication?.decision).not.toBe('ne_pas_traiter');
  });

  test('péritonite communautaire, gravité inconnue : schémas sepsis et choc affichés en conditionnel ; gravité demandée (bloquante)', () => {
    const p = plan(iia(PERITONITE, (d) => (d.patient.gravite = 'inconnu')));
    expect(p.options.every((o) => o.rang === 'conditionnelle')).toBe(true);
    expect(p.options.find((o) => o.id === 'iia-choc-piptazo')?.condition).toMatch(/si choc septique/);
    expect(p.options.some((o) => o.id === 'iia-carba-meropeneme')).toBe(true);
    expect(p.options.find((o) => o.id === 'iia-sepsis-ceftriaxone')?.condition).toMatch(/si sepsis/);
    const g = p.donneesManquantes.find((m) => /^gravité/.test(m.champ));
    expect(g?.impact).toBe('bloque_decision');
    expect(g?.cible).toBe('patient.gravite');
    const soins = plan(iia({ ...PERITONITE, 'digestif.postop': 'non_postop', 'digestif.bmr': 'aucun', 'digestif.dosage_cefepime': 'oui' }, (d) => {
      d.patient.contexte = 'associe_aux_soins';
      d.patient.gravite = 'inconnu';
    }));
    expect(soins.options.map((o) => o.id)).toEqual(expect.arrayContaining(['iia-soins-cefepime-mtz', 'iia-soins-cefepime-mtz-rea', 'iia-soins-cefepime-mtz-vanco']));
  });

  test('C3G + métronidazole en sepsis : brouillon, sans la source R1.2.1 (qui vise « sans sepsis ni choc »), posologie de réanimation', () => {
    const p = plan(iia({ ...PERITONITE, 'digestif.fdr_blse': 'aucun' }, (d) => (d.patient.gravite = 'sepsis')));
    const l1 = premieres(p);
    expect(l1.every((o) => o.statut === 'brouillon')).toBe(true);
    expect(l1.some((o) => o.sources.some((s) => /R1\.2\.1 /.test(s.repere ?? '')))).toBe(false);
    expect(l1[1].prescriptions[0].regimenId).toBe('ceftriaxone-iia-rea');
  });

  test('allergie immédiate non sévère aux pénicillines, choc communautaire sans facteur de BLSE : une alternative du tableau 2 est proposée', () => {
    const p = plan(iia({ ...PERITONITE, 'digestif.fdr_blse': 'aucun' }, (d) => {
      d.patient.gravite = 'choc_septique';
      d.patient.statutAllergie = 'presentes';
      d.patient.allergies = [{ molecule: 'amoxicilline', reaction: 'immediate', gravite: 'legere' }];
    }));
    expect(premieres(p).length).toBeGreaterThan(0);
    expect(p.urgence.alertes.some((a) => /aucune option de la base/.test(a.texte))).toBe(false);
    expect(p.options.some((o) => mols(o).includes('aztreonam'))).toBe(true);
    expect(p.options.some((o) => mols(o).includes('meropeneme'))).toBe(true);
  });

  test('aminosides : gentamicine et amikacine sans durée inventée (plafond du RCP de 5 jours)', () => {
    const p = plan(iia({ ...DIV_SIMPLE, 'digestif.diverticulite.asa': 'oui' }));
    const opt = p.options.find((o) => o.id === 'div-iv-amoxclav-genta')!;
    const genta = opt.prescriptions.find((x) => x.moleculeId === 'gentamicine')!;
    expect(genta.duree.texte).toMatch(/maximale de 5 jours/);
    expect(genta.duree.dureePrevueJours).toBeUndefined();
    expect(opt.prescriptions[0].duree.dureePrevueJours).toBe(7);
    const choc = plan(iia({ ...PERITONITE, 'digestif.fdr_blse': 'autre_fdr' }, (d) => (d.patient.gravite = 'choc_septique')));
    const amk = choc.options.find((o) => o.id === 'iia-choc-piptazo-amikacine')!.prescriptions.find((x) => x.moleculeId === 'amikacine')!;
    expect(amk.duree.texte).toMatch(/limitée à 5 jours/);
    expect(amk.duree.dureePrevueJours).toBeUndefined();
  });

  test('neutropénie (aplasie) : hors champ SFAR 2026 — absence expliquée, options conditionnelles, indication explicite', () => {
    const p = plan(iia(PERITONITE, (d) => {
      d.patient.immunodepression = 'oui';
      d.patient.neutropenie = 'oui';
    }));
    expect(p.absencesRecommandation.some((a) => /aplasie/.test(a.sujet))).toBe(true);
    expect(p.options.length).toBeGreaterThan(0);
    expect(p.options.every((o) => o.rang === 'conditionnelle' && o.statut === 'brouillon')).toBe(true);
    expect(p.indication?.decision).toBe('traiter');
    const immuno = plan(iia(PERITONITE, (d) => (d.patient.immunodepression = 'oui')));
    expect(immuno.absencesRecommandation.some((a) => /aplasie/.test(a.sujet))).toBe(false);
  });
});

describe('Relecture v7 — points mineurs', () => {
  test('diverticulite chez une femme de 72 ans, grossesse non renseignée : pas bloquant', () => {
    const p = plan(iia(DIV_SIMPLE, (d) => {
      d.patient.sexe = 'femme';
      d.patient.age = 72;
      d.patient.grossesse = 'inconnu';
    }));
    expect(p.indication?.decision).toBe('ne_pas_traiter');
  });

  test('diverticulite, réponse au traitement symptomatique non renseignée : signalée', () => {
    const det: Record<string, string> = { ...DIV_SIMPLE };
    delete det['digestif.diverticulite.echec'];
    const p = plan(iia(det));
    expect(p.donneesManquantes.find((m) => /réponse au traitement symptomatique/.test(m.champ))?.cible).toBe('details.digestif.diverticulite.echec');
    expect(p.indication?.conditions.join(' ')).toMatch(/prise en charge initiale supposée/);
  });

  test('antécédent de BLSE saisi dans le dossier mais « aucun facteur » répondu : contradiction signalée', () => {
    const p = plan(iia({ ...PERITONITE, 'digestif.fdr_blse': 'aucun' }, (d) => {
      d.patient.gravite = 'sepsis';
      d.patient.antecedentsMicro = [{ organisme: 'escherichia_coli', resistance: 'BLSE' }];
    }));
    expect(p.urgence.alertes.some((a) => /Antécédent de BLSE saisi dans le dossier patient/.test(a.texte))).toBe(true);
  });

  test('perfusion continue et insuffisance rénale ou dialyse : pas de palier intermittent du RCP, avis pharmacologique', () => {
    const ir = plan(iia({ ...PERITONITE, 'digestif.fdr_blse': 'aucun' }, (d) => {
      d.patient.gravite = 'choc_septique';
      d.patient.age = 80;
      d.patient.renal = { creatinine: { valeur: 250, unite: 'umol/L' }, stabilite: 'stable', insuffisanceRenaleAigue: 'non', dialyse: 'aucune' };
    }));
    const ptz = premieres(ir)[0].prescriptions[0];
    expect(ptz.adaptations.join(' ')).toMatch(/non tabulée/);
    expect(ptz.adaptations.join(' ')).not.toMatch(/toutes les 12 h/);
    const hd = plan(iia({ ...PERITONITE, 'digestif.postop': 'non_postop', 'digestif.bmr': 'aucun', 'digestif.dosage_cefepime': 'oui', 'digestif.levures': 'non', 'digestif.sus_mesocolique': 'non', 'digestif.atb_48h': 'non' }, (d) => {
      d.patient.contexte = 'associe_aux_soins';
      d.patient.gravite = 'sepsis';
      d.patient.renal = { creatinine: { valeur: 600, unite: 'umol/L' }, stabilite: 'stable', insuffisanceRenaleAigue: 'non', dialyse: 'hemodialyse_intermittente' };
    }));
    const fep = premieres(hd)[0].prescriptions[0];
    expect(fep.moleculeId).toBe('cefepime');
    expect(fep.adaptations.join(' ')).toMatch(/Hémodialyse intermittente : .*non tabulée.*concentrations sériques/);
  });

  test('ciprofloxacine + métronidazole : ECG déclenché par la co-prescription ; INR seulement sous AVK', () => {
    const p = plan(iia({ ...PERITONITE, 'digestif.postop': 'non_postop', 'digestif.bmr': 'aucun', 'digestif.dosage_cefepime': 'oui' }, (d) => {
      d.patient.contexte = 'associe_aux_soins';
      d.patient.statutAllergie = 'presentes';
      d.patient.allergies = [{ molecule: 'amoxicilline', reaction: 'retardee_severe' }];
      d.patient.traitementsAssocies = ['aod'];
    }));
    const o = p.options.find((x) => x.id === 'iia-allergie-cipro-mtz-vanco')!;
    const mtz = o.prescriptions.find((x) => x.moleculeId === 'metronidazole')!;
    const ids = mtz.surveillance.map((l) => l.element.id);
    expect(ids).toContain('metronidazole-qt-ciprofloxacine');
    expect(ids).not.toContain('metronidazole-inr');
  });

  test('angiocholite sans drainage : avis urgent, aucune durée fixée ; R1.1.4 réservée au postopératoire', () => {
    const p = plan(iia({ 'digestif.type': 'angiocholite', 'digestif.source': 'non', 'digestif.angiocholite.dysfonction': 'non', 'digestif.angiocholite.grade2': 'non', 'digestif.biliaire.anastomose': 'non' }));
    expect(p.avisSpecialise.some((a) => a.urgent && /sans drainage/.test(a.texte))).toBe(true);
    expect(premieres(p)[0].prescriptions[0].duree.texte).toMatch(/^Sans drainage biliaire : aucune durée fixée/);
    const nonPostop = plan(iia({ ...PERITONITE, 'digestif.postop': 'non_postop', 'digestif.bmr': 'aucun', 'digestif.dosage_cefepime': 'oui' }, (d) => (d.patient.contexte = 'associe_aux_soins')));
    expect(nonPostop.gestes.some((g) => /mini-invasif/.test(g.texte))).toBe(false);
    const postop = plan(iia({ ...PERITONITE, 'digestif.postop': 'postop_reglee', 'digestif.bmr': 'aucun', 'digestif.dosage_cefepime': 'oui' }, (d) => (d.patient.contexte = 'associe_aux_soins')));
    expect(postop.gestes.some((g) => /mini-invasif/.test(g.texte))).toBe(true);
    expect(premieres(postop)[0].prescriptions[0].duree.dureePrevueJours).toBeUndefined();
  });

  test('régimes propres au domaine : amoxicilline-acide clavulanique de la diverticulite ; ascite à forte résistance : pip-taz et méropénème au même rang, durée sans valeur retenue', () => {
    const div = plan(iia({ ...DIV_SIMPLE, 'digestif.diverticulite.echec': 'oui' }));
    expect(premieres(div)[0].prescriptions[0].regimenId).toBe('amoxclav-po-diverticulite');
    const ascite = plan(iia({ 'digestif.type': 'pbs', 'digestif.pbs.pnn': 'oui', 'digestif.pbs.resistance': 'elevee' }));
    expect(premieres(ascite).map(mols)).toEqual([['piperacilline_tazobactam'], ['meropeneme']]);
    expect(premieres(ascite)[0].prescriptions[0].duree.dureePrevueJours).toBeUndefined();
  });

  test('statut d’accès des essais lus en résumé seulement', () => {
    expect(SOURCES_PAR_ID['STOP-IT-2015'].statutAcces).toBe('contenu_non_lisible');
    expect(SOURCES_PAR_ID['DURAPOP-2018'].statutAcces).toBe('contenu_non_lisible');
  });
});
