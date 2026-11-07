/**
 * Pneumonies (R-PNEUMONIE, 2026-11-06). Résultats attendus établis d'après docs/sources/recherche-pneumonies.md
 * (SPILF/SPLF 2025, HAS 2025, HAS 2023, SPILF/SFGG 2025, SPILF 2026 légionellose, SFAR/SRLF 2017, RCP),
 * indépendamment du code.
 */
import { decider } from '../engine/decider';
import { dossierParDefaut, nettoyerDossier, nouveauPrelevement, type Dossier } from '../engine/etat';
import type { OrganismeId, Plan, Prelevement } from '../clinical/types';
import { SOURCES_PAR_ID } from '../clinical/sources';
import { questionsPour } from '../clinical/syndromes/questions';

const MAINTENANT = new Date('2026-11-06T10:00:00Z');

function pneumonie(details: Record<string, string>, modif?: (d: Dossier) => void): Dossier {
  const d = dossierParDefaut();
  d.entree = 'syndrome';
  d.syndrome = 'pulmonaire';
  const p = d.patient;
  p.age = 50;
  p.sexe = 'homme';
  p.poidsKg = 70;
  p.tailleCm = 175;
  p.grossesse = 'non';
  p.immunodepression = 'non';
  p.neutropenie = 'non';
  p.insuffisanceHepatique = 'non';
  p.statutAllergie = 'aucune';
  p.contexte = 'communautaire';
  p.gravite = 'stable';
  p.renal = { creatinine: { valeur: 80, unite: 'umol/L' }, stabilite: 'stable', insuffisanceRenaleAigue: 'non', dialyse: 'aucune' };
  p.materielVasculaire = 'aucun';
  p.materielUrinaire = 'aucun';
  p.valve = 'native';
  p.dispositifIntracardiaque = 'non';
  p.protheseArticulaire = 'non';
  d.details = { ...details };
  modif?.(d);
  return d;
}
function plan(d: Dossier): Plan {
  nettoyerDossier(d);
  return decider(d, { maintenant: MAINTENANT });
}
const molecules = (p: Plan, rang?: string) => p.options.filter((o) => !rang || o.rang === rang).map((o) => o.prescriptions.map((x) => x.moleculeId).join('+'));
const option = (p: Plan, id: string) => p.options.find((o) => o.id === id)!;
const AMB = { 'pneumonie.orientation': 'aucune', 'pneumonie.lieu': 'ambulatoire' };

describe('PAC ambulatoire (SPILF 2025, HAS 2025)', () => {
  test('sans comorbidité : amoxicilline 1 g × 3/j ; pas d’examen microbiologique ; durée 3, 5 ou 7 jours selon la stabilité', () => {
    const p = plan(pneumonie({ ...AMB, 'pneumonie.comorbidite': 'non' }));
    expect(p.situation.id).toBe('pac-ambulatoire');
    expect(molecules(p, 'premiere_ligne')).toEqual(['amoxicilline']);
    const amox = option(p, 'pac-amb-amox').prescriptions[0];
    expect(amox.doseAffichee).toMatch(/1 g × 3\/24 h/);
    expect(amox.duree.texte).toMatch(/3 jours si tous les critères sont obtenus à J3, 5 jours/);
    expect(p.controles.find((c) => c.id === 'ctl-pac-amb-micro')?.categorie).toBe('non_systematique');
    expect(option(p, 'pac-amb-levo').rang).toBe('conditionnelle');
    expect(p.regles.some((r) => r.id === 'R-SYNDROME-NON-COUVERT')).toBe(false);
  });

  test('avec comorbidité : amoxicilline-acide clavulanique ; C3G injectable et lévofloxacine réservées aux allergies', () => {
    const p = plan(pneumonie({ ...AMB, 'pneumonie.comorbidite': 'oui' }));
    expect(molecules(p, 'premiere_ligne')).toEqual(['amoxicilline_clavulanate']);
    expect(option(p, 'pac-amb-c3g').rang).toBe('conditionnelle');
    expect(option(p, 'pac-amb-levo').rang).toBe('conditionnelle');
  });

  test('avec comorbidité et allergie non grave aux pénicillines : ceftriaxone injectable en 1re ligne', () => {
    const p = plan(pneumonie({ ...AMB, 'pneumonie.comorbidite': 'oui' }, (d) => {
      d.patient.statutAllergie = 'presentes';
      d.patient.allergies = [{ molecule: 'amoxicilline', reaction: 'immediate', gravite: 'moderee' }];
    }));
    expect(molecules(p, 'premiere_ligne')).toEqual(['ceftriaxone']);
    expect(option(p, 'pac-amb-amc').rang).toBe('conditionnelle');
    expect(option(p, 'pac-amb-levo').rang).toBe('conditionnelle');
  });

  test('comorbidité déduite de la saisie (insuffisance hépatique) : la question n’est pas posée, amoxicilline-acide clavulanique', () => {
    const p = plan(pneumonie({ ...AMB }, (d) => (d.patient.insuffisanceHepatique = 'oui')));
    expect(molecules(p, 'premiere_ligne')).toEqual(['amoxicilline_clavulanate']);
    expect(p.donneesManquantes.some((m) => /comorbidité/.test(m.champ))).toBe(false);
  });

  test('durée selon la stabilité clinique : 3 jours (J3), 5 jours (J3-J5), 7 jours sinon', () => {
    const duree = (stab: string) => option(plan(pneumonie({ ...AMB, 'pneumonie.comorbidite': 'non', 'pneumonie.stabilite': stab })), 'pac-amb-amox').prescriptions[0].duree;
    expect(duree('j3').dureePrevueJours).toBe(3);
    expect(duree('j3_j5').dureePrevueJours).toBe(5);
    expect(duree('non').dureePrevueJours).toBe(7);
  });

  test('bactérie atypique : macrolides (clarithromycine 500 mg × 2/j), durée HAS/SPILF divergente laissée en brouillon', () => {
    const p = plan(pneumonie({ ...AMB, 'pneumonie.orientation': 'atypique' }));
    expect(molecules(p, 'premiere_ligne')).toEqual(['clarithromycine']);
    const clari = option(p, 'pac-atyp-clari');
    expect(clari.statut).toBe('brouillon');
    expect(clari.prescriptions[0].doseAffichee).toMatch(/500 mg × 2\/24 h/);
    expect(clari.prescriptions[0].duree.texte).toMatch(/Divergence non tranchée : 5 jours selon la HAS/);
    expect(option(p, 'pac-atyp-azi').commentaire).toMatch(/hors AMM/);
    expect(option(p, 'pac-atyp-levo').rang).toBe('conditionnelle');
  });
});

describe('PAC hospitalisée non grave', () => {
  test('sans comorbidité : amoxicilline per os ou IV ; antigénurie Legionella seulement si arguments ; pas de corticoïdes', () => {
    const p = plan(pneumonie({ 'pneumonie.orientation': 'aucune', 'pneumonie.lieu': 'hospitalisation', 'pneumonie.grave': 'non', 'pneumonie.comorbidite': 'non', 'pneumonie.fdr_pyo': 'non' }));
    expect(p.situation.id).toBe('pac-hospitalisee');
    expect(molecules(p, 'premiere_ligne')).toEqual(['amoxicilline']);
    expect(p.controles.find((c) => c.id === 'ctl-pac-hosp-ag-legio')?.categorie).toBe('conditionnel');
    expect(p.urgence.alertes.some((a) => /pas de corticoïdes/.test(a.texte))).toBe(true);
  });

  test('colonisation à P. aeruginosa : céfépime ou pipéracilline-tazobactam, ECBC', () => {
    const p = plan(pneumonie({ 'pneumonie.orientation': 'aucune', 'pneumonie.lieu': 'hospitalisation', 'pneumonie.grave': 'non', 'pneumonie.comorbidite': 'oui', 'pneumonie.fdr_pyo': 'colonisation' }));
    expect(molecules(p, 'premiere_ligne').sort()).toEqual(['cefepime', 'piperacilline_tazobactam']);
    expect(p.controles.some((c) => c.id === 'ctl-pac-pyo-ecbc')).toBe(true);
  });
});

describe('PAC grave', () => {
  const GRAVE = { 'pneumonie.orientation': 'aucune', 'pneumonie.lieu': 'soins_critiques', 'pneumonie.grave': 'oui', 'pneumonie.fdr_pyo': 'non' };

  test('C3G + macrolide (ceftriaxone 2 g + spiramycine IV 3 MUI × 3) ; hydrocortisone ; hémocultures et antigénuries ; durée non tranchée expliquée', () => {
    const p = plan(pneumonie(GRAVE));
    expect(p.situation.id).toBe('pac-grave');
    expect(molecules(p, 'premiere_ligne')).toEqual(['ceftriaxone+spiramycine']);
    const o = option(p, 'pac-grave-c3g-spira');
    expect(o.prescriptions[0].doseAffichee).toMatch(/2 g × 1\/24 h/);
    expect(o.prescriptions[1].doseAffichee).toMatch(/3 MUI × 3\/24 h/);
    expect(p.gestes.some((g) => /hydrocortisone 200 mg\/j/.test(g.texte) && /ERS\/ESICM 2023/.test(g.texte))).toBe(true);
    expect(p.controles.find((c) => c.id === 'ctl-pac-grave-hc')?.categorie).toBe('indique');
    expect(p.controles.find((c) => c.id === 'ctl-pac-grave-ag')?.categorie).toBe('indique');
    // Relecture v7 (point 10) : la durée non fixée est dite dans le texte de durée, pas par une « absence de recommandation ».
    expect(p.absencesRecommandation.some((a) => /Durée/.test(a.sujet))).toBe(false);
    expect(o.prescriptions[0].duree.texte).toMatch(/Non fixée par la SPILF 2025/);
    expect(option(p, 'pac-grave-c3g-clari').statut).toBe('brouillon');
    expect(option(p, 'pac-grave-levo').rang).toBe('conditionnelle');
  });

  test('céfotaxime en soins critiques : posologies divergentes affichées, brouillon', () => {
    const o = option(plan(pneumonie(GRAVE)), 'pac-grave-ctx-spira');
    expect(o.statut).toBe('brouillon');
    expect(o.prescriptions[0].doseAffichee).toMatch(/80 à 100 mg\/kg\/j.*100 mg\/kg\/j/);
  });

  test('contexte grippal : pas d’hydrocortisone', () => {
    const p = plan(pneumonie({ ...GRAVE, 'pneumonie.orientation': 'grippe' }));
    expect(p.gestes.some((g) => /pas recommandée dans ce contexte \(étiologie grippale/.test(g.texte))).toBe(true);
  });

  test('facteur de risque de P. aeruginosa en soins critiques : céfépime ou pipéracilline-tazobactam + molécule active sur les atypiques', () => {
    const p = plan(pneumonie({ ...GRAVE, 'pneumonie.fdr_pyo': 'autre' }));
    expect(molecules(p, 'premiere_ligne').sort()).toEqual(['cefepime+spiramycine', 'piperacilline_tazobactam+spiramycine']);
  });

  test('tableau de LPV : C3G + macrolide + linézolide', () => {
    const p = plan(pneumonie({ ...GRAVE, 'pneumonie.orientation': 'lpv' }));
    expect(molecules(p, 'premiere_ligne')).toEqual(['ceftriaxone+spiramycine+linezolide']);
    expect(p.avisSpecialise.some((a) => /LPV/.test(a.texte))).toBe(true);
  });
});

describe('Légionellose (SPILF 2026)', () => {
  test('non grave, immunocompétent : azithromycine 500 mg/j 3 jours ; déclaration obligatoire', () => {
    const p = plan(pneumonie({ 'pneumonie.orientation': 'legionellose', 'pneumonie.lieu': 'ambulatoire' }));
    expect(p.situation.id).toBe('legionellose');
    const azi = option(p, 'legio-azi');
    expect(azi.rang).toBe('premiere_ligne');
    expect(azi.prescriptions[0].duree.dureePrevueJours).toBe(3);
    expect(azi.commentaire).toMatch(/Hors AMM/);
    expect(p.gestes.some((g) => /déclaration obligatoire/.test(g.texte))).toBe(true);
  });

  test('grave : lévofloxacine IV en monothérapie 7 jours ; immunodéprimé grave : 10 jours', () => {
    const p = plan(pneumonie({ 'pneumonie.orientation': 'legionellose', 'pneumonie.lieu': 'soins_critiques', 'pneumonie.grave': 'oui' }));
    expect(molecules(p, 'premiere_ligne')).toEqual(['levofloxacine']);
    expect(option(p, 'legio-g-levo').prescriptions[0].duree.dureePrevueJours).toBe(7);
    const pid = plan(pneumonie({ 'pneumonie.orientation': 'legionellose', 'pneumonie.lieu': 'soins_critiques', 'pneumonie.grave': 'oui' }, (d) => (d.patient.immunodepression = 'oui')));
    expect(option(pid, 'legio-g-levo').prescriptions[0].duree.dureePrevueJours).toBe(10);
  });
});

describe('Pneumonie d’inhalation (SPILF/SFGG 2025)', () => {
  test('non grave : amoxicilline-acide clavulanique 5 jours, pas de métronidazole, scanner ; allergie grave aux bêta-lactamines : cotrimoxazole', () => {
    const p = plan(pneumonie({ 'pneumonie.orientation': 'inhalation', 'pneumonie.lieu': 'hospitalisation', 'pneumonie.grave': 'non' }));
    expect(p.situation.id).toBe('pneumonie-inhalation');
    expect(molecules(p, 'premiere_ligne')).toEqual(['amoxicilline_clavulanate']);
    expect(option(p, 'inh-amc').prescriptions[0].duree.dureePrevueJours).toBe(5);
    expect(p.urgence.alertes.some((a) => /métronidazole/.test(a.texte))).toBe(true);
    expect(p.controles.some((c) => c.id === 'ctl-inh-scanner')).toBe(true);
    const pa = plan(pneumonie({ 'pneumonie.orientation': 'inhalation', 'pneumonie.lieu': 'hospitalisation', 'pneumonie.grave': 'non' }, (d) => {
      d.patient.statutAllergie = 'presentes';
      d.patient.allergies = [{ molecule: 'amoxicilline', reaction: 'immediate', gravite: 'severe' }];
    }));
    expect(molecules(pa, 'premiere_ligne')).toEqual(['cotrimoxazole']);
  });

  test('grave avec facteur de risque de P. aeruginosa et colonisation à SARM : pipéracilline-tazobactam + linézolide', () => {
    const p = plan(pneumonie({ 'pneumonie.orientation': 'inhalation', 'pneumonie.lieu': 'soins_critiques', 'pneumonie.grave': 'oui', 'pneumonie.fdr_pyo': 'autre', 'pneumonie.sarm': 'oui' }));
    expect(molecules(p, 'premiere_ligne')).toEqual(['piperacilline_tazobactam+linezolide']);
    expect(p.controles.some((c) => c.id === 'ctl-pac-grave-ag')).toBe(false);
  });

  test('fausse route constatée sans pneumonie : pas d’antibiothérapie', () => {
    const p = plan(pneumonie({ 'pneumonie.orientation': 'fausse_route' }));
    expect(p.indication?.decision).toBe('ne_pas_traiter');
    expect(p.options).toHaveLength(0);
  });
});

describe('Pneumonies associées aux soins (SFAR/SRLF 2017)', () => {
  const PAVM = { 'pneumonie.soins_lieu': 'pavm', 'pneumonie.delai': 'precoce', 'pneumonie.fdr_bmr': 'non', 'pneumonie.sarm': 'non' };
  const soins = (details: Record<string, string>, modif?: (d: Dossier) => void) => pneumonie(details, (d) => {
    d.patient.contexte = 'associe_aux_soins';
    modif?.(d);
  });

  test('PAVM précoce sans choc ni facteur de risque : monothérapie (amoxicilline-acide clavulanique ou céfotaxime), brouillon, 7 jours au plus ; prélèvement avant antibiotique', () => {
    const p = plan(soins(PAVM));
    expect(p.situation.id).toBe('pneumonie-associee-soins-rea');
    expect(molecules(p, 'premiere_ligne').sort()).toEqual(['amoxicilline_clavulanate', 'cefotaxime']);
    expect(p.options.every((o) => o.statut === 'brouillon')).toBe(true);
    expect(p.options[0].prescriptions[0].duree.dureePrevueJours).toBe(7);
    expect(p.controles.find((c) => c.id === 'ctl-pavm-prelevement')?.categorie).toBe('indique');
  });

  test('PAVM précoce avec choc : bêta-lactamine + aminoside', () => {
    const p = plan(soins(PAVM, (d) => (d.patient.gravite = 'choc_septique')));
    expect(molecules(p, 'premiere_ligne').sort()).toEqual(['amoxicilline_clavulanate+gentamicine', 'cefotaxime+gentamicine']);
  });

  test('PAVM tardive : céfépime ou pipéracilline-tazobactam + amikacine ; portage de BLSE : carbapénème + amikacine', () => {
    const p = plan(soins({ ...PAVM, 'pneumonie.delai': 'tardive' }));
    expect(molecules(p, 'premiere_ligne').sort()).toEqual(['cefepime+amikacine', 'piperacilline_tazobactam+amikacine']);
    const pb = plan(soins({ ...PAVM, 'pneumonie.delai': 'tardive' }, (d) => (d.patient.antecedentsMicro = [{ organisme: 'escherichia_coli', resistance: 'BLSE' }])));
    expect(molecules(pb, 'premiere_ligne').sort()).toEqual(['imipeneme+amikacine', 'meropeneme+amikacine']);
  });

  test('hors réanimation : aucune recommandation française, absence expliquée, pas de schéma', () => {
    const p = plan(soins({ 'pneumonie.soins_lieu': 'hors_rea' }));
    expect(p.options).toHaveLength(0);
    expect(p.absencesRecommandation.some((a) => /hors réanimation/.test(a.sujet))).toBe(true);
  });
});

describe('Interactions et questions du foyer', () => {
  test('bactériémie à S. aureus avec foyer pulmonaire : la règle de bactériémie garde la situation et les options', () => {
    const d = pneumonie({ 'pneumonie.orientation': 'aucune', 'pneumonie.lieu': 'hospitalisation', 'pneumonie.grave': 'non' });
    const h = nouveauPrelevement('hemoculture');
    h.organisme = 'staphylococcus_aureus';
    h.stade = 'identification';
    h.foyer = 'pulmonaire';
    d.prelevements = [h];
    const p = plan(d);
    expect(p.regles.some((r) => r.id === 'R-PNEUMONIE')).toBe(true);
    expect(p.situation.id).toBe('bacteriemie-s-aureus');
    expect(p.options.some((o) => o.id.startsWith('pac-'))).toBe(false);
  });

  test('réponses du foyer pulmonaire effacées si le foyer change', () => {
    const d = pneumonie({ ...AMB, 'pneumonie.comorbidite': 'non' });
    d.syndrome = 'urinaire';
    nettoyerDossier(d);
    expect(Object.keys(d.details ?? {}).some((k) => k.startsWith('pneumonie.'))).toBe(false);
  });

  test('toute source citée par les parcours de pneumonie existe dans le registre', () => {
    const dossiers = [
      pneumonie({ ...AMB, 'pneumonie.comorbidite': 'oui' }),
      pneumonie({ ...AMB, 'pneumonie.orientation': 'atypique' }),
      pneumonie({ ...AMB, 'pneumonie.orientation': 'grippe' }),
      pneumonie({ 'pneumonie.orientation': 'aucune', 'pneumonie.lieu': 'hospitalisation', 'pneumonie.grave': 'non', 'pneumonie.comorbidite': 'oui', 'pneumonie.fdr_pyo': 'colonisation' }),
      pneumonie({ 'pneumonie.orientation': 'atypique', 'pneumonie.lieu': 'hospitalisation', 'pneumonie.grave': 'non' }),
      pneumonie({ 'pneumonie.orientation': 'lpv', 'pneumonie.lieu': 'soins_critiques', 'pneumonie.grave': 'oui' }),
      pneumonie({ 'pneumonie.orientation': 'aucune', 'pneumonie.lieu': 'soins_critiques', 'pneumonie.grave': 'oui', 'pneumonie.fdr_pyo': 'inconnu' }),
      pneumonie({ 'pneumonie.orientation': 'legionellose', 'pneumonie.lieu': 'hospitalisation', 'pneumonie.grave': 'non' }, (d) => (d.patient.immunodepression = 'oui')),
      pneumonie({ 'pneumonie.orientation': 'legionellose', 'pneumonie.lieu': 'soins_critiques', 'pneumonie.grave': 'oui' }),
      pneumonie({ 'pneumonie.orientation': 'inhalation', 'pneumonie.lieu': 'soins_critiques', 'pneumonie.grave': 'oui', 'pneumonie.fdr_pyo': 'non', 'pneumonie.sarm': 'oui' }),
      pneumonie({ 'pneumonie.orientation': 'fausse_route' }),
      pneumonie({ 'pneumonie.soins_lieu': 'pavm', 'pneumonie.delai': 'tardive', 'pneumonie.fdr_bmr': 'oui', 'pneumonie.sarm': 'oui' }, (d) => (d.patient.contexte = 'associe_aux_soins')),
      pneumonie({ 'pneumonie.soins_lieu': 'hors_rea' }, (d) => (d.patient.contexte = 'associe_aux_soins')),
    ];
    const manquantes = new Set<string>();
    for (const d of dossiers) {
      const p = plan(d);
      const refs = [...p.sources, ...p.urgence.alertes.flatMap((a) => a.sources ?? []), ...p.absencesRecommandation.flatMap((a) => a.sources), ...(p.indication?.sources ?? [])];
      for (const r of refs) if (!SOURCES_PAR_ID[r.source]) manquantes.add(r.source);
    }
    expect([...manquantes]).toEqual([]);
  });

  test('contexte non renseigné : situation partielle, pas de schéma', () => {
    const p = plan(pneumonie({}, (d) => (d.patient.contexte = 'inconnu')));
    expect(p.situation.id).toBe('pneumonie-contexte-a-preciser');
    expect(p.options).toHaveLength(0);
    expect(p.donneesManquantes.find((m) => /contexte communautaire/.test(m.champ))?.cible).toBe('patient.contexte');
  });
});

/* ------------------------------------------------------------------ */
/* Relecture v7 (docs/relectures/v7-pneumonies.md)                     */
/* ------------------------------------------------------------------ */

function hemoc(d: Dossier, init: Partial<Prelevement> & { organisme?: OrganismeId }, series?: number): Prelevement {
  const h = nouveauPrelevement('hemoculture');
  Object.assign(h, { foyer: 'pulmonaire' }, init);
  if (series !== undefined) h.hemoc = { ...h.hemoc!, nbSeriesPositives: series, nbSeriesPrelevees: 2 };
  d.prelevements = [...d.prelevements, h];
  return h;
}
const HOSP = { 'pneumonie.orientation': 'aucune', 'pneumonie.lieu': 'hospitalisation', 'pneumonie.grave': 'non', 'pneumonie.comorbidite': 'non', 'pneumonie.fdr_pyo': 'non' };
const GRAVE_SC = { 'pneumonie.orientation': 'aucune', 'pneumonie.lieu': 'soins_critiques', 'pneumonie.grave': 'oui', 'pneumonie.fdr_pyo': 'non' };
const premieres = (p: Plan) => p.options.filter((o) => o.rang === 'premiere_ligne');

describe('Relecture v7 — hémocultures positives (règle commune foyer + bactériémie)', () => {
  test('point 1 : PAC à K. pneumoniae bactériémique — la pneumonie garde ses options, amoxicilline écartée (résistance attendue), indication « traiter »', () => {
    const p = plan(pneumonie(HOSP, (d) => hemoc(d, { organisme: 'klebsiella_pneumoniae' })));
    expect(p.situation.id).toBe('pac-hospitalisee');
    expect(p.options.length).toBeGreaterThan(0);
    expect(p.options.some((o) => o.prescriptions.some((x) => x.moleculeId === 'amoxicilline'))).toBe(false);
    expect(p.sortie.ecartees.some((e) => e.type === 'resistance' && /Amoxicilline/.test(e.libelle))).toBe(true);
    expect(p.indication?.decision).toBe('traiter');
    expect(p.sortie.traitement).not.toBe('aucun');
    expect(p.sortie.motifs.some((m) => m.type === 'non_couverte')).toBe(false);
  });

  test('point 1 : PAC grave en choc avec BGN à l’examen direct — C3G + macrolide proposés, urgence', () => {
    const p = plan(pneumonie(GRAVE_SC, (d) => {
      d.patient.gravite = 'choc_septique';
      hemoc(d, { stade: 'examen_direct', examenDirect: 'bgn' });
    }));
    expect(molecules(p, 'premiere_ligne')).toContain('ceftriaxone+spiramycine');
    expect(p.indication?.decision).toBe('urgence');
  });

  test('point 1 : PAVM tardive à P. aeruginosa bactériémique — options SFAR conservées', () => {
    const p = plan(pneumonie({ 'pneumonie.soins_lieu': 'pavm', 'pneumonie.delai': 'tardive', 'pneumonie.fdr_bmr': 'non', 'pneumonie.sarm': 'non' }, (d) => {
      d.patient.contexte = 'associe_aux_soins';
      hemoc(d, { organisme: 'pseudomonas_aeruginosa' });
    }));
    expect(molecules(p, 'premiere_ligne').sort()).toEqual(['cefepime+amikacine', 'piperacilline_tazobactam+amikacine']);
  });

  test('point 2 : SCN sur une seule série — le traitement de la pneumonie reste proposé, conclusion SCN secondaire', () => {
    const p = plan(pneumonie(HOSP, (d) => hemoc(d, { organisme: 'staphylococcus_epidermidis' }, 1)));
    expect(molecules(p, 'premiere_ligne')).toEqual(['amoxicilline']);
    expect(p.indication?.decision).toBe('traiter');
    expect(p.indicationsSecondaires?.some((i) => i.regleId === 'R-BACTERIEMIE-SCN')).toBe(true);
  });

  test('point 7 : PAC grave à SARM producteur de LPV — linézolide en monothérapie proposé à côté des options de la bactériémie', () => {
    const p = plan(pneumonie({ ...GRAVE_SC, 'pneumonie.orientation': 'lpv' }, (d) => hemoc(d, { organisme: 'staphylococcus_aureus', stade: 'antibiogramme', antibiogrammeDisponible: 'oui', phenotypes: { SARM: 'present' } })));
    expect(p.situation.id).toBe('bacteriemie-s-aureus');
    expect(option(p, 'pac-grave-lpv-sarm-lzd').rang).toBe('premiere_ligne');
    const inconnu = plan(pneumonie({ ...GRAVE_SC, 'pneumonie.orientation': 'lpv' }, (d) => hemoc(d, { organisme: 'staphylococcus_aureus' })));
    expect(option(inconnu, 'pac-grave-lpv-sa-lzd').rang).toBe('conditionnelle');
    expect(inconnu.urgence.alertes.some((a) => /SASM producteur de LPV/.test(a.texte))).toBe(true);
    // Point 18 : pas de données manquantes de la pneumonie pendant la bactériémie à S. aureus.
    expect(inconnu.donneesManquantes.some((m) => /comorbidité|lieu de prise en charge/.test(m.champ))).toBe(false);
  });

  test('point 8 : cocci en chaînettes non identifiés dans une PAC grave — le macrolide reste proposé', () => {
    const p = plan(pneumonie(GRAVE_SC, (d) => hemoc(d, { stade: 'examen_direct', examenDirect: 'cgp_chainettes' })));
    expect(option(p, 'pac-grave-c3g-spira').rang).toBe('premiere_ligne');
  });
});

describe('Relecture v7 — fausse route, gravité, lieu', () => {
  test('points 3 et 21 : fausse route avec choc ou bactériémie — jamais « pas d’antibiothérapie »', () => {
    const choc = plan(pneumonie({ 'pneumonie.orientation': 'fausse_route' }, (d) => (d.patient.gravite = 'choc_septique')));
    expect(choc.indication?.decision).toBe('urgence');
    expect(choc.sortie.motifs.some((m) => m.type === 'non_indiquee')).toBe(false);
    expect(choc.urgence.alertes.some((a) => a.niveau === 'urgence')).toBe(true);
    expect(choc.donneesManquantes.some((m) => m.cible === 'details.pneumonie.orientation' && m.impact === 'bloque_decision')).toBe(true);
    const bact = plan(pneumonie({ 'pneumonie.orientation': 'fausse_route' }, (d) => hemoc(d, { organisme: 'escherichia_coli' })));
    expect(bact.indication?.decision).not.toBe('ne_pas_traiter');
    const simple = plan(pneumonie({ 'pneumonie.orientation': 'fausse_route' }));
    expect(simple.sortie.motifs[0].type).toBe('non_indiquee');
    expect(simple.indication?.raison).toMatch(/infiltrat/);
  });

  test('point 4 : gravité non renseignée en hospitalisation — demandée (bloquante), aucun schéma en 1re ligne', () => {
    const p = plan(pneumonie({ ...HOSP, 'pneumonie.grave': 'inconnu' }));
    expect(p.situation.id).toBe('pac-gravite-a-preciser');
    expect(premieres(p)).toHaveLength(0);
    expect(option(p, 'pac-hosp-amox').condition).toMatch(/si aucun critère de PAC grave/);
    expect(option(p, 'pac-grave-c3g-spira').condition).toMatch(/si critères de PAC grave/);
    expect(p.donneesManquantes.find((m) => /critères de pneumonie grave/.test(m.champ))).toMatchObject({ impact: 'bloque_decision', cible: 'details.pneumonie.grave' });
    expect(p.sortie.traitement).toBe('partiel');
  });

  test('point 4 : légionellose et inhalation de gravité ou de terrain inconnus — pas de 1re ligne « complète »', () => {
    const legio = plan(pneumonie({ 'pneumonie.orientation': 'legionellose', 'pneumonie.lieu': 'hospitalisation' }, (d) => (d.patient.immunodepression = 'inconnu')));
    expect(premieres(legio)).toHaveLength(0);
    expect(legio.donneesManquantes.some((m) => m.cible === 'patient.immunodepression' && m.impact === 'bloque_decision')).toBe(true);
    expect(legio.sortie.traitement).toBe('partiel');
    const inh = plan(pneumonie({ 'pneumonie.orientation': 'inhalation' }));
    expect(premieres(inh)).toHaveLength(0);
    expect(inh.donneesManquantes.some((m) => m.cible === 'details.pneumonie.lieu')).toBe(true);
    expect(inh.sortie.traitement).toBe('partiel');
  });

  test('points 5 et 24 : soins critiques sans critère de gravité — posologies « soins critiques », durée non fixée, comorbidité demandée', () => {
    const d = pneumonie({ ...HOSP, 'pneumonie.lieu': 'soins_critiques' });
    expect(questionsPour('pulmonaire', d).some((q) => q.id === 'pneumonie.comorbidite')).toBe(true);
    const p = plan(d);
    expect(p.situation.id).toBe('pac-soins-critiques-non-grave');
    const amox = option(p, 'pac-hosp-amox').prescriptions[0];
    expect(amox.doseAffichee).toMatch(/2 g × 3\/24 h/);
    expect(amox.duree.dureePrevueJours).toBeUndefined();
    expect(p.donneesManquantes.some((m) => /comorbidité/.test(m.champ))).toBe(false);
  });

  test('point 6 : ambulatoire avec sepsis — pas de schéma ambulatoire en 1re ligne, proposition non complète', () => {
    const p = plan(pneumonie({ ...AMB, 'pneumonie.comorbidite': 'non' }, (d) => (d.patient.gravite = 'sepsis')));
    expect(premieres(p)).toHaveLength(0);
    expect(p.sortie.traitement).toBe('partiel');
    expect(p.urgence.alertes.some((a) => /imposent l.hospitalisation/.test(a.texte))).toBe(true);
  });

  test('point 35 : facteur « autre » de P. aeruginosa dans une PAC grave hors soins critiques — C3G + macrolide', () => {
    const p = plan(pneumonie({ ...GRAVE_SC, 'pneumonie.lieu': 'hospitalisation', 'pneumonie.fdr_pyo': 'autre' }));
    expect(molecules(p, 'premiere_ligne')).toEqual(['ceftriaxone+spiramycine']);
  });

  test('point 10 : PAC grave — pas de motif « aucune recommandation dédiée » à côté des options', () => {
    const p = plan(pneumonie(GRAVE_SC));
    expect(p.sortie.motifs.some((m) => /Aucune recommandation dédiée/.test(m.statut))).toBe(false);
  });

  test('point 19 : PAC grave avec facteur de P. aeruginosa — pas de donnée manquante au libellé brut « si traitement > … »', () => {
    const p = plan(pneumonie({ ...GRAVE_SC, 'pneumonie.fdr_pyo': 'autre' }));
    expect(p.donneesManquantes.some((m) => /^si traitement/.test(m.champ))).toBe(false);
  });
});

describe('Relecture v7 — molécules, interactions, terrain', () => {
  test('point 9 : traitement allongeant le QT — spiramycine IV écartée, clarithromycine IV en 1re ligne ; forme orale conservée', () => {
    const p = plan(pneumonie(GRAVE_SC, (d) => (d.patient.traitementsAssocies = ['qt_allongeant'])));
    expect(p.options.some((o) => o.prescriptions.some((x) => x.regimenId === 'spiramycine-iv-3mui-x3'))).toBe(false);
    expect(p.sortie.ecartees.some((e) => e.type === 'contre_indication' && /spiramycine/i.test(e.libelle))).toBe(true);
    expect(molecules(p, 'premiere_ligne')).toEqual(['ceftriaxone+clarithromycine']);
    const pyo = plan(pneumonie({ ...GRAVE_SC, 'pneumonie.fdr_pyo': 'autre' }, (d) => (d.patient.traitementsAssocies = ['qt_allongeant'])));
    expect(molecules(pyo, 'premiere_ligne').sort()).toEqual(['cefepime+clarithromycine', 'piperacilline_tazobactam+clarithromycine']);
    const oral = plan(pneumonie({ ...AMB, 'pneumonie.orientation': 'atypique' }, (d) => (d.patient.traitementsAssocies = ['qt_allongeant'])));
    expect(option(oral, 'pac-atyp-spira').prescriptions[0].avertissements.some((a) => /précaution d.emploi/.test(a))).toBe(true);
  });

  test('point 25 : grossesse — spiramycine en tête (atypique, légionellose), divergence RCP/CRAT affichée', () => {
    const preg = (d: Dossier) => {
      d.patient.sexe = 'femme';
      d.patient.grossesse = 'oui';
    };
    const atyp = plan(pneumonie({ ...AMB, 'pneumonie.orientation': 'atypique' }, preg));
    expect(molecules(atyp, 'premiere_ligne')).toEqual(['spiramycine']);
    expect(option(atyp, 'pac-atyp-spira').commentaire).toMatch(/divergence RCP\/CRAT/);
    const legio = plan(pneumonie({ 'pneumonie.orientation': 'legionellose', 'pneumonie.lieu': 'ambulatoire' }, preg));
    expect(molecules(legio, 'premiere_ligne')).toEqual(['spiramycine']);
  });

  test('point 26 : azithromycine hors AMM — brouillon et avertissement « risque de résistance » du RCP', () => {
    const p = plan(pneumonie({ 'pneumonie.orientation': 'legionellose', 'pneumonie.lieu': 'ambulatoire' }));
    const azi = option(p, 'legio-azi');
    expect(azi.statut).toBe('brouillon');
    expect(azi.commentaire).toMatch(/première intention ne sont pas indiqués/);
  });

  test('point 27 : PAVM — doses SFAR affichées (gentamicine 8 mg/kg/j, vancomycine 15 puis 30 à 40 mg/kg/j), sans calcul d’une autre dose', () => {
    const p = plan(pneumonie({ 'pneumonie.soins_lieu': 'pavm', 'pneumonie.delai': 'precoce', 'pneumonie.fdr_bmr': 'non', 'pneumonie.sarm': 'oui' }, (d) => {
      d.patient.contexte = 'associe_aux_soins';
      d.patient.gravite = 'choc_septique';
    }));
    const o = option(p, 'pavm-choc-amc');
    expect(o.prescriptions.find((x) => x.moleculeId === 'gentamicine')!.doseAffichee).toMatch(/8 mg\/kg\/j/);
    expect(o.prescriptions.find((x) => x.moleculeId === 'vancomycine')!.doseAffichee).toMatch(/15 mg\/kg puis 30 à 40 mg\/kg\/j/);
  });

  test('point 28 : monothérapie R3.2 sous condition hors ventilation ou chez l’immunodéprimé ; précoce avec BMR seulement : cas non prévu', () => {
    const base = { 'pneumonie.delai': 'precoce', 'pneumonie.fdr_bmr': 'non', 'pneumonie.sarm': 'non' };
    const soins = (det: Record<string, string>, m?: (d: Dossier) => void) => plan(pneumonie(det, (d) => {
      d.patient.contexte = 'associe_aux_soins';
      m?.(d);
    }));
    expect(premieres(soins({ ...base, 'pneumonie.soins_lieu': 'rea' }))).toHaveLength(0);
    expect(premieres(soins({ ...base, 'pneumonie.soins_lieu': 'pavm' }, (d) => (d.patient.immunodepression = 'oui')))).toHaveLength(0);
    const bmr = soins({ ...base, 'pneumonie.soins_lieu': 'pavm', 'pneumonie.fdr_bmr': 'bmr' });
    expect(premieres(bmr)).toHaveLength(0);
    expect(option(bmr, 'pavm-pyo-fep').condition).toMatch(/non prévu par le protocole/);
  });

  test('point 15 : PAVM avec choc, délai inconnu — la colonne « choc » (bêta-lactamine + aminoside) est affichée', () => {
    const p = plan(pneumonie({ 'pneumonie.soins_lieu': 'pavm', 'pneumonie.sarm': 'non' }, (d) => {
      d.patient.contexte = 'associe_aux_soins';
      d.patient.gravite = 'choc_septique';
    }));
    expect(p.options.some((o) => o.id === 'pavm-choc-amc')).toBe(true);
    expect(p.options.some((o) => o.id === 'pavm-mono-amc')).toBe(false);
  });

  test('point 29 : LPV — réserve « post-grippal » sur l’hydrocortisone ; neutropénie inconnue signalée', () => {
    const p = plan(pneumonie({ ...GRAVE_SC, 'pneumonie.orientation': 'lpv' }, (d) => (d.patient.neutropenie = 'inconnu')));
    expect(p.gestes.some((g) => /post-grippal/.test(g.texte) && /hydrocortisone/.test(g.texte))).toBe(true);
    expect(p.donneesManquantes.some((m) => m.cible === 'patient.neutropenie')).toBe(true);
  });

  test('points 13 et 30 : antibiothérapie du mois et DFG < 30 déduits comme comorbidités ; pas de « 3 jours » sans réserve', () => {
    const atb = plan(pneumonie({ ...AMB }, (d) => {
      d.horaires.maintenantISO = MAINTENANT.toISOString();
      d.patient.antibiotiquesRecents = [{ dci: 'amoxicilline', enCours: 'non', fin: '2026-10-25' }];
    }));
    expect(molecules(atb, 'premiere_ligne')).toEqual(['amoxicilline_clavulanate']);
    const ir = plan(pneumonie({ ...AMB, 'pneumonie.stabilite': 'j3' }, (d) => {
      d.patient.age = 80;
      d.patient.renal = { ...d.patient.renal, creatinine: { valeur: 300, unite: 'umol/L' } };
    }));
    const amc = option(ir, 'pac-amb-amc').prescriptions[0];
    expect(amc.duree.dureePrevueJours).not.toBe(3);
    const j3 = option(plan(pneumonie({ ...AMB, 'pneumonie.comorbidite': 'non', 'pneumonie.stabilite': 'j3' })), 'pac-amb-amox').prescriptions[0];
    expect(j3.duree.texte).toMatch(/insuffisants respiratoires chroniques graves/);
  });

  test('points 14 et 42 : fluoroquinolone dans les 3 mois — lévofloxacine écartée en ambulatoire, conditionnelle à l’hôpital', () => {
    const fq = (d: Dossier) => {
      d.patient.statutAllergie = 'presentes';
      d.patient.allergies = [{ molecule: 'amoxicilline', reaction: 'immediate', gravite: 'severe' }];
      d.patient.antibiotiquesRecents = [{ dci: 'lévofloxacine', enCours: 'non', fin: '2026-09-01' }];
    };
    const amb = plan(pneumonie({ ...AMB, 'pneumonie.comorbidite': 'oui' }, fq));
    expect(amb.options.some((o) => o.id === 'pac-amb-levo')).toBe(false);
    expect(amb.sortie.ecartees.some((e) => /3 derniers mois/.test(e.raison))).toBe(true);
    const hosp = plan(pneumonie({ ...HOSP, 'pneumonie.comorbidite': 'oui' }, fq));
    expect(option(hosp, 'pac-hosp-levo').rang).toBe('conditionnelle');
    const ancienne = plan(pneumonie({ ...AMB, 'pneumonie.comorbidite': 'oui' }, (d) => {
      fq(d);
      d.patient.antibiotiquesRecents = [{ dci: 'lévofloxacine', enCours: 'non', fin: '2026-01-01' }];
    }));
    expect(option(ancienne, 'pac-amb-levo').rang).toBe('premiere_ligne');
  });

  test('point 16 : comorbidité inconnue à l’hôpital — une seule option de ceftriaxone', () => {
    const p = plan(pneumonie({ ...HOSP, 'pneumonie.comorbidite': 'inconnu' }));
    expect(p.options.filter((o) => o.prescriptions.some((x) => x.moleculeId === 'ceftriaxone'))).toHaveLength(1);
  });

  test('points 17 et 34 : lévofloxacine en soins critiques — fourchette 500 à 1 000 mg/j affichée, non tranchée', () => {
    const p = plan(pneumonie(GRAVE_SC, (d) => {
      d.patient.statutAllergie = 'presentes';
      d.patient.allergies = [{ molecule: 'ceftriaxone', reaction: 'immediate', gravite: 'severe' }];
    }));
    const levo = option(p, 'pac-grave-levo').prescriptions[0];
    expect(levo.doseAffichee).toMatch(/500 à 1 000 mg\/j/);
    expect(levo.doseCalculee).toBeUndefined();
  });

  test('point 23 : inhalation grave sans facteur de P. aeruginosa — schéma de la PAC grave en 1re ligne, amoxicilline-acide clavulanique conditionnelle, durée non fixée', () => {
    const p = plan(pneumonie({ 'pneumonie.orientation': 'inhalation', 'pneumonie.lieu': 'soins_critiques', 'pneumonie.grave': 'oui', 'pneumonie.fdr_pyo': 'non', 'pneumonie.sarm': 'non' }));
    expect(molecules(p, 'premiere_ligne')).toEqual(['ceftriaxone+spiramycine']);
    expect(option(p, 'inh-g-amc').rang).toBe('conditionnelle');
    expect(option(p, 'inh-g-c3g-spira').prescriptions[0].duree.dureePrevueJours).toBeUndefined();
  });

  test('points 12 et 32 : questions lues — pas de comorbidité pour l’atypique ; stabilité lue par l’atypique ambulatoire', () => {
    expect(questionsPour('pulmonaire', pneumonie({ ...AMB, 'pneumonie.orientation': 'atypique' })).some((q) => q.id === 'pneumonie.comorbidite')).toBe(false);
    expect(questionsPour('pulmonaire', pneumonie({ 'pneumonie.orientation': 'inhalation', 'pneumonie.lieu': 'hospitalisation', 'pneumonie.grave': 'non' })).some((q) => q.id === 'pneumonie.fdr_pyo' || q.id === 'pneumonie.sarm')).toBe(false);
    const concord = option(plan(pneumonie({ ...AMB, 'pneumonie.orientation': 'atypique', 'pneumonie.stabilite': 'j3_j5' })), 'pac-atyp-clari').prescriptions[0].duree;
    expect(concord.dureePrevueJours).toBe(5);
    const div = option(plan(pneumonie({ ...AMB, 'pneumonie.orientation': 'atypique', 'pneumonie.stabilite': 'j3' })), 'pac-atyp-clari').prescriptions[0].duree;
    expect(div.dureePrevueJours).toBeUndefined();
    expect(div.texte).toMatch(/Divergence non tranchée : 5 jours selon la HAS.*3 jours au total selon la SPILF/);
  });

  test('point 11 : cibles « Compléter » des données manquantes du domaine', () => {
    const p = plan(pneumonie({ 'pneumonie.orientation': 'inconnu', 'pneumonie.lieu': 'hospitalisation', 'pneumonie.grave': 'non', 'pneumonie.comorbidite': 'inconnu', 'pneumonie.fdr_pyo': 'inconnu' }));
    const cibleDe = (re: RegExp) => p.donneesManquantes.find((m) => re.test(m.champ))?.cible;
    expect(cibleDe(/^orientation clinique/)).toBe('details.pneumonie.orientation');
    expect(cibleDe(/^comorbidité/)).toBe('details.pneumonie.comorbidite');
    expect(cibleDe(/P\. aeruginosa dans l.année/)).toBe('details.pneumonie.fdr_pyo');
    const pavm = plan(pneumonie({ 'pneumonie.soins_lieu': 'pavm' }, (d) => (d.patient.contexte = 'associe_aux_soins')));
    expect(pavm.donneesManquantes.find((m) => /délai/.test(m.champ))?.cible).toBe('details.pneumonie.delai');
    expect(pavm.donneesManquantes.find((m) => /BMR ou de BGN/.test(m.champ))?.cible).toBe('details.pneumonie.fdr_bmr');
    expect(pavm.donneesManquantes.find((m) => /SARM/.test(m.champ))?.cible).toBe('details.pneumonie.sarm');
  });

  test('point 36 : la réévaluation ne cite plus le texte remplacé (Afssaps 2010 §2.2.3)', () => {
    const p = plan(pneumonie({ ...AMB, 'pneumonie.comorbidite': 'non' }));
    expect(p.reevaluation.flatMap((r) => r.sources).some((s) => s.source === 'AFSSAPS-2010-IRB')).toBe(false);
  });

  test('point 40 : allergie aux pénicillines, PAC ambulatoire sans comorbidité — alerte « attention » (pristinamycine), pas « urgence »', () => {
    const p = plan(pneumonie({ ...AMB, 'pneumonie.comorbidite': 'non' }, (d) => {
      d.patient.statutAllergie = 'presentes';
      d.patient.allergies = [{ molecule: 'amoxicilline', reaction: 'immediate', gravite: 'moderee' }];
    }));
    expect(p.urgence.alertes.some((a) => a.niveau === 'urgence' && /aucune option/.test(a.texte))).toBe(false);
    expect(p.urgence.alertes.some((a) => a.niveau === 'attention' && /pristinamycine/.test(a.texte))).toBe(true);
  });

  test('point 43 : pneumonie « associée aux soins » hors réanimation — rappel de la définition de la PAC (EHPAD, soins ambulatoires)', () => {
    const p = plan(pneumonie({ 'pneumonie.soins_lieu': 'hors_rea' }, (d) => (d.patient.contexte = 'associe_aux_soins')));
    expect(p.urgence.alertes.some((a) => /EHPAD/.test(a.texte))).toBe(true);
  });
});
