/**
 * Méningites bactériennes communautaires de l'adulte (R-MENINGITE-BACTERIENNE, 2026-11-06). Résultats attendus
 * établis d'après docs/sources/recherche-meningites.md (SPILF 2018, instruction DGS 2018, DGS-Urgent 2025_06
 * relayé, RCP), indépendamment du code.
 */
import { decider } from '../engine/decider';
import { dossierParDefaut, nettoyerDossier, nouveauPrelevement, type Dossier } from '../engine/etat';
import { questionsPour } from '../clinical/syndromes/questions';
import { SOURCES_PAR_ID } from '../clinical/sources';
import type { Plan } from '../clinical/types';

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
const opt = (p: Plan, id: string) => p.options.find((o) => o.id === id);
const molecules = (p: Plan, rang?: string) => p.options.filter((o) => !rang || o.rang === rang).flatMap((o) => o.prescriptions.map((x) => x.regimenId));
const textes = (p: Plan) => [...p.gestes.map((g) => g.texte), ...p.urgence.alertes.map((a) => a.texte), ...p.avisSpecialise.map((a) => a.texte)].join(' | ');

describe('Urgence et ponction lombaire', () => {
  test('sans contre-indication ni imagerie : PL dans l’heure ; antibiotique dès que le LCS est trouble (options conditionnelles) ; urgence immédiate', () => {
    const p = plan(meningite({ 'meningite.lcs': 'pas_faite', 'meningite.imagerie': 'non', 'meningite.ci_pl': 'non', 'meningite.listeriose': 'non' }));
    expect(p.situation.id).toBe('meningite-pl-immediate');
    expect(p.urgence.niveau).toBe('immediate');
    expect(p.controles.find((c) => c.id === 'ctl-meningite-pl')?.categorie).toBe('indique');
    expect(p.options.every((o) => o.rang === 'conditionnelle')).toBe(true);
    expect(opt(p, 'meningite-neg-cefotaxime')?.condition).toMatch(/LCS est trouble/);
    expect(textes(p)).toMatch(/dans l'heure suivant l'admission/);
  });

  test('signes imposant une imagerie : antibiothérapie et dexaméthasone avant l’imagerie et la PL (schéma « examen direct négatif »)', () => {
    const p = plan(meningite({ 'meningite.lcs': 'pas_faite', 'meningite.imagerie': 'oui', 'meningite.ci_pl': 'non', 'meningite.listeriose': 'non' }));
    expect(p.situation.id).toBe('meningite-antibiotique-avant-pl');
    expect(p.controles.find((c) => c.id === 'ctl-meningite-imagerie-avant-pl')?.categorie).toBe('indique');
    expect(molecules(p, 'premiere_ligne')).toEqual(['cefotaxime-meninge-300']);
    expect(p.gestes.some((g) => /Dexaméthasone 10 mg IV toutes les 6 h pendant 4 jours/.test(g.texte) && /12 h après/.test(g.texte) && /0,15 mg\/kg/.test(g.texte))).toBe(true);
  });

  test('anticoagulant (AOD) déclaré : contre-indication à une PL immédiate, antibiotique avant la PL', () => {
    const p = plan(meningite({ 'meningite.lcs': 'pas_faite', 'meningite.imagerie': 'non', 'meningite.listeriose': 'non' }, (d) => (d.patient.traitementsAssocies = ['aod'])));
    expect(p.situation.id).toBe('meningite-antibiotique-avant-pl');
    expect(p.controles.find((c) => c.id === 'ctl-meningite-ci-pl')?.categorie).toBe('indique');
  });

  test('purpura fulminans : C3G immédiate avant tout prélèvement (ceftriaxone 1 g en préhospitalier) ; divergence SPILF/DGS sur les hémocultures affichée ; déclaration obligatoire', () => {
    const p = plan(meningite({ 'meningite.purpura': 'fulminans', 'meningite.lcs': 'pas_faite', 'meningite.listeriose': 'non' }));
    expect(p.situation.id).toBe('meningite-purpura-fulminans');
    expect(p.urgence.niveau).toBe('immediate');
    expect(p.gestes.some((g) => /ceftriaxone 1 g ou céfotaxime 1 g/.test(g.texte) && /SAMU/.test(g.texte))).toBe(true);
    const hc = p.controles.find((c) => c.id === 'ctl-meningite-hc')!;
    expect(hc.categorie).toBe('conditionnel');
    expect(hc.sources.map((s) => s.source)).toEqual(expect.arrayContaining(['SPILF-2018-meningites', 'DGS-2018-IIM']));
    expect(hc.pourquoi).toMatch(/Divergence/);
    expect(molecules(p, 'premiere_ligne')).toEqual(['cefotaxime-meninge-300']);
    expect(textes(p)).toMatch(/déclaration obligatoire/);
  });
});

describe('Probabiliste selon l’examen direct du LCS', () => {
  test('cocci à Gram positif : céfotaxime 300 mg/kg/j (vérifié, dans le RCP) ; ceftriaxone 100 mg/kg/j en alternative, brouillon, écart au RCP signalé ; pas de vancomycine systématique', () => {
    const p = plan(meningite({ 'meningite.lcs': 'cgp' }));
    expect(p.situation.id).toBe('meningite-examen-direct-cgp');
    const ctx = opt(p, 'meningite-cgp-cefotaxime')!;
    expect(ctx.rang).toBe('premiere_ligne');
    expect(ctx.statut).toBe('verifiee_ia');
    expect(ctx.prescriptions[0].doseAffichee).toMatch(/75 mg\/kg/);
    const cro = opt(p, 'meningite-cgp-ceftriaxone')!;
    expect(cro.rang).toBe('alternative');
    expect(cro.statut).toBe('brouillon');
    expect(cro.commentaire).toMatch(/au-dessus du RCP/);
    expect(cro.prescriptions[0].modalites).toMatch(/Hors RCP/);
    expect(p.options.filter((o) => o.rang !== 'conditionnelle').some((o) => o.prescriptions.some((x) => x.moleculeId === 'vancomycine'))).toBe(false);
    expect(p.controles.find((c) => c.id === 'ctl-meningite-dosage-c3g')?.categorie).toBe('indique');
    expect(p.urgence.alertes.some((a) => /Insuffisance rénale et C3G méningées/.test(a.texte))).toBe(true);
  });

  test('cocci à Gram négatif : céfotaxime 200 mg/kg/j ; déclaration obligatoire ; prophylaxie des contacts avec les deux doctrines (DGS 2018 / DGS-Urgent 2025) affichées sans trancher', () => {
    const p = plan(meningite({ 'meningite.lcs': 'cgn' }));
    expect(p.situation.id).toBe('meningite-examen-direct-cgn');
    expect(molecules(p, 'premiere_ligne')).toEqual(['cefotaxime-meninge-200']);
    expect(textes(p)).toMatch(/déclaration obligatoire/);
    const doctrine = p.urgence.alertes.find((a) => /deux doctrines/.test(a.texte))!;
    expect(doctrine.texte).toMatch(/rifampicine orale 600 mg/);
    expect(doctrine.texte).toMatch(/ciprofloxacine si la souche est sensible/);
    expect(doctrine.sources?.map((s) => s.source)).toEqual(expect.arrayContaining(['DGS-2018-IIM', 'DGS-URGENT-2025-06', 'APHP-2025-IIM-CAT']));
    const casIndex = opt(p, 'meningite-cas-index-rifampicine')!;
    expect(casIndex.rang).toBe('conditionnelle');
    expect(casIndex.statut).toBe('brouillon');
    expect(casIndex.prescriptions[0].doseAffichee).toMatch(/600 mg × 2\/24 h/);
    expect(p.gestes.some((g) => /quel que soit leur statut vaccinal/.test(g.texte))).toBe(true);
    expect(p.gestes.some((g) => /plusieurs experts ne la recommandent pas/.test(g.texte))).toBe(true);
  });

  test('bacille à Gram positif : amoxicilline 200 mg/kg/j + gentamicine 5 mg/kg/j (brouillon : amoxicilline au-dessus du RCP) ; pas de dexaméthasone', () => {
    const p = plan(meningite({ 'meningite.lcs': 'bgp' }));
    const o = p.options.find((x) => x.rang === 'premiere_ligne')!;
    expect(o.prescriptions.map((x) => x.regimenId)).toEqual(['amoxicilline-meninge-200', 'gentamicine-5-listeria']);
    expect(o.statut).toBe('brouillon');
    expect(o.prescriptions[0].modalites).toMatch(/12 g\/j/);
    expect(molecules(p)).not.toContain('cefotaxime-meninge-300');
    expect(p.gestes.some((g) => /ne fait pas partie des indications/.test(g.texte))).toBe(true);
  });

  test('examen direct négatif : sans argument pour une listériose, C3G seule ; après 70 ans, C3G + amoxicilline + gentamicine', () => {
    const jeune = plan(meningite({ 'meningite.lcs': 'negatif', 'meningite.listeriose': 'non' }));
    expect(molecules(jeune, 'premiere_ligne')).toEqual(['cefotaxime-meninge-300']);
    const age = plan(meningite({ 'meningite.lcs': 'negatif' }, (d) => (d.patient.age = 75)));
    expect(age.situation.libelle).toMatch(/arguments pour une listériose/);
    expect(molecules(age, 'premiere_ligne')).toEqual(['cefotaxime-meninge-300', 'amoxicilline-meninge-200', 'gentamicine-5-listeria']);
  });

  test('arguments pour une listériose non renseignés : demandés ; l’association avec amoxicilline reste conditionnelle', () => {
    const p = plan(meningite({ 'meningite.lcs': 'trouble_attente' }));
    expect(p.situation.id).toBe('meningite-lcs-trouble');
    expect(p.donneesManquantes.some((m) => m.champ === 'arguments pour une listériose' && m.cible === 'details.meningite.listeriose')).toBe(true);
    expect(opt(p, 'meningite-neg-listeria-cefotaxime')?.rang).toBe('conditionnelle');
  });

  test('immunodépression : pas de dexaméthasone ; argument pour une listériose', () => {
    const p = plan(meningite({ 'meningite.lcs': 'negatif' }, (d) => (d.patient.immunodepression = 'oui')));
    expect(p.gestes.some((g) => /Pas de dexaméthasone : immunodépression/.test(g.texte))).toBe(true);
    expect(molecules(p, 'premiere_ligne')).toContain('amoxicilline-meninge-200');
  });

  test('allergie grave (anaphylaxie) : C3G écartées, vancomycine + rifampicine proposées (brouillon) avec avis infectiologique obligatoire', () => {
    const p = plan(meningite({ 'meningite.lcs': 'cgp' }, (d) => {
      d.patient.statutAllergie = 'presentes';
      d.patient.allergies = [{ molecule: 'amoxicilline', reaction: 'immediate', gravite: 'severe' }];
    }));
    const premiere = p.options.find((o) => o.rang === 'premiere_ligne')!;
    expect(premiere.id).toBe('meningite-cgp-allergie');
    expect(premiere.prescriptions.map((x) => x.regimenId)).toEqual(['vancomycine-meninge', 'rifampicine-meninge-300x2']);
    expect(premiere.statut).toBe('brouillon');
    expect(p.avisSpecialise.some((a) => /avis infectiologique obligatoire/.test(a.texte) && a.urgent)).toBe(true);
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

  test('pneumocoque CMI C3G > 0,5 mg/L : céfotaxime 300 mg/kg/j, PL de contrôle avec dosages, avis infectiologue et microbiologiste, 14 jours', () => {
    const p = plan(meningite({ 'meningite.germe': 'pneumocoque', 'meningite.cmi_c3g': 'gt_0_5', 'meningite.evolution': 'favorable', 'meningite.orl': 'non' }));
    expect(molecules(p, 'premiere_ligne')).toEqual(['cefotaxime-meninge-300']);
    expect(p.options[0].prescriptions[0].duree.dureePrevueJours).toBe(14);
    expect(p.controles.find((c) => c.id === 'ctl-meningite-pl-controle')?.categorie).toBe('indique');
    expect(p.avisSpecialise.some((a) => /microbiologiste/.test(a.texte))).toBe(true);
  });

  test('méningocoque, évolution favorable : C3G 4 jours, divergence des durées affichée (4-7, 5-7, DGS 4 jours)', () => {
    const p = plan(meningite({ 'meningite.germe': 'meningocoque', 'meningite.evolution': 'favorable' }));
    const o = opt(p, 'meningite-meningo-cefotaxime')!;
    expect(o.rang).toBe('premiere_ligne');
    expect(o.prescriptions[0].duree.dureePrevueJours).toBe(4);
    expect(o.prescriptions[0].duree.texte).toMatch(/5 à 7 jours/);
    expect(o.prescriptions[0].duree.texte).toMatch(/au-delà de 4 jours/);
    expect(textes(p)).toMatch(/déclaration obligatoire/);
  });

  test('Listeria : amoxicilline + gentamicine (5 premiers jours), 21 jours ; dexaméthasone arrêtée ; déclaration obligatoire', () => {
    const p = plan(meningite({ 'meningite.germe': 'listeria', 'meningite.evolution': 'trop_tot' }));
    const o = p.options.find((x) => x.rang === 'premiere_ligne')!;
    expect(o.prescriptions.map((x) => x.moleculeId)).toEqual(['amoxicilline', 'gentamicine']);
    expect(o.prescriptions[0].duree.dureePrevueJours).toBe(21);
    expect(p.gestes.some((g) => /l'arrêter/.test(g.texte) && /listériose/.test(g.texte))).toBe(true);
    expect(textes(p)).toMatch(/Listeria monocytogenes : déclaration obligatoire/);
  });

  test('E. coli : C3G 21 jours ; PL de contrôle et imagerie systématiques ; antécédent de BLSE : méropénème et avis d’expert', () => {
    const p = plan(meningite({ 'meningite.germe': 'e_coli', 'meningite.evolution': 'favorable' }));
    expect(molecules(p, 'premiere_ligne')).toEqual(['cefotaxime-meninge-200']);
    expect(p.options[0].prescriptions[0].duree.dureePrevueJours).toBe(21);
    expect(p.controles.find((c) => c.id === 'ctl-meningite-pl-controle')?.categorie).toBe('indique');
    expect(p.controles.find((c) => c.id === 'ctl-meningite-imagerie')?.categorie).toBe('indique');
    const blse = plan(meningite({ 'meningite.germe': 'e_coli', 'meningite.evolution': 'favorable' }, (d) => (d.patient.antecedentsMicro = [{ organisme: 'escherichia_coli', resistance: 'BLSE' }])));
    expect(molecules(blse, 'premiere_ligne')).toEqual(['meropeneme-meninge-40']);
    expect(blse.avisSpecialise.some((a) => /avis d'expert/.test(a.texte))).toBe(true);
  });

  test('hémoculture à S. pneumoniae sans réponse à la question du germe : méningite à pneumocoque retenue (priorité sur la règle des streptocoques)', () => {
    const d = meningite({ 'meningite.cmi_c3g': 'gt_0_5', 'meningite.evolution': 'trop_tot' });
    const h = nouveauPrelevement('hemoculture');
    h.organisme = 'streptococcus_pneumoniae';
    h.foyer = 'meningite';
    d.prelevements = [h];
    const p = plan(d);
    expect(p.situation.id).toBe('meningite-pneumocoque');
    expect(p.regles.map((r) => r.id)).toContain('R-MENINGITE-BACTERIENNE');
    expect(p.optionRetenueId).toBe('meningite-pneumo-c3g300-cefotaxime');
  });
});

describe('Méningite associée aux soins, questions et sources', () => {
  test('associée aux soins : pas de schéma communautaire ; avis spécialisé et absence de recommandation expliquée', () => {
    const p = plan(meningite({ 'meningite.lcs': 'cgp' }, (d) => (d.patient.contexte = 'associe_aux_soins')));
    expect(p.situation.id).toBe('meningite-associee-soins');
    expect(p.options).toHaveLength(0);
    expect(p.absencesRecommandation.some((a) => /associée aux soins/.test(a.sujet))).toBe(true);
    expect(p.avisSpecialise.some((a) => a.urgent)).toBe(true);
  });

  test('questions du foyer : examen direct et PL tant que le germe n’est pas documenté ; CMI seulement pour le pneumocoque ; réponses sans objet effacées', () => {
    const d = meningite({ 'meningite.lcs': 'pas_faite' });
    expect(questionsPour('meningite', d).map((q) => q.id)).toEqual(expect.arrayContaining(['meningite.purpura', 'meningite.lcs', 'meningite.imagerie', 'meningite.ci_pl', 'meningite.listeriose', 'meningite.germe']));
    expect(questionsPour('meningite', d).some((q) => q.id === 'meningite.cmi_c3g')).toBe(false);
    d.details!['meningite.germe'] = 'pneumocoque';
    nettoyerDossier(d);
    expect(d.details!['meningite.lcs']).toBeUndefined();
    expect(questionsPour('meningite', d).some((q) => q.id === 'meningite.cmi_c3g')).toBe(true);
  });

  test('toute source citée par les plans de méningite existe dans le registre', () => {
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
      meningite({}, (d) => (d.patient.contexte = 'associe_aux_soins')),
    ];
    const manquantes = new Set<string>();
    for (const d of cas) {
      const p = plan(d);
      for (const r of p.sources) if (!SOURCES_PAR_ID[r.source]) manquantes.add(r.source);
      for (const a of p.urgence.alertes) for (const r of a.sources ?? []) if (!SOURCES_PAR_ID[r.source]) manquantes.add(r.source);
      for (const a of p.absencesRecommandation) for (const r of a.sources) if (!SOURCES_PAR_ID[r.source]) manquantes.add(r.source);
    }
    expect([...manquantes]).toEqual([]);
  });
});
