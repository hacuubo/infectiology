/**
 * Pneumonies (R-PNEUMONIE, 2026-11-06). Résultats attendus établis d'après docs/sources/recherche-pneumonies.md
 * (SPILF/SPLF 2025, HAS 2025, HAS 2023, SPILF/SFGG 2025, SPILF 2026 légionellose, SFAR/SRLF 2017, RCP),
 * indépendamment du code.
 */
import { decider } from '../engine/decider';
import { dossierParDefaut, nettoyerDossier, nouveauPrelevement, type Dossier } from '../engine/etat';
import type { Plan } from '../clinical/types';
import { SOURCES_PAR_ID } from '../clinical/sources';

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
    expect(p.absencesRecommandation.some((a) => /Durée/.test(a.sujet))).toBe(true);
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
  });
});
