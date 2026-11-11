/**
 * Hémoculture positive sans foyer, à chaque stade (examen direct, identification sans antibiogramme) :
 * germes non couverts (levures, bacilles à Gram positif) et cocci à Gram positif en chaînettes.
 */
import { deciderSansPanne } from '../engine/decider';
import { dossierParDefaut, type Dossier } from '../engine/etat';
import type { Plan, Prelevement } from '../clinical/types';

function cas(prl: Partial<Prelevement>, gravite = 'stable', contexte = 'communautaire'): Dossier {
  const d = dossierParDefaut();
  d.entree = 'microbiologie';
  Object.assign(d.patient, { age: 64, sexe: 'homme', poidsKg: 80, tailleCm: 178, statutAllergie: 'aucune', contexte, gravite, valve: 'native', dispositifIntracardiaque: 'non', protheseArticulaire: 'non', materielVasculaire: 'aucun', materielUrinaire: 'aucun', immunodepression: 'non', neutropenie: 'non', grossesse: 'non' });
  d.patient.renal = { ...d.patient.renal, creatinine: { valeur: 90, unite: 'umol/L' }, stabilite: 'stable', insuffisanceRenaleAigue: 'non', dialyse: 'aucune' };
  d.prelevements = [{ id: 'hc', type: 'hemoculture', stade: 'identification', antibiogrammeDisponible: 'non', foyer: 'inconnu', foyerStatut: 'inconnu', signesInfectionMateriel: 'inconnu', hemoc: { origine: 'peripherique', persistance: 'non_controlees', nbSeriesPrelevees: 2, nbSeriesPositives: 2 }, ...prl } as Prelevement];
  return d;
}

function plan(d: Dossier): Plan {
  const r = deciderSansPanne(d);
  if (!r.ok) throw new Error('panne du moteur');
  return r.plan;
}

describe('Hémoculture positive à un germe non couvert', () => {
  test.each([
    ['examen direct « autre » (levures, bacille à Gram positif)', { stade: 'examen_direct', examenDirect: 'autre' } as Partial<Prelevement>],
    ['germe identifié hors liste', { organisme: 'autre', organismeLibre: 'Candida albicans' } as Partial<Prelevement>],
  ])('%s : absence expliquée, avis urgent, aucune proposition, pas de « point de départ à renseigner »', (_nom, prl) => {
    for (const grav of ['stable', 'sepsis']) {
      const p = plan(cas(prl, grav));
      expect(p.situation.libelle).toMatch(/germe non couvert par l'application/);
      expect(p.situation.couverture).toBe('non_couverte');
      expect(p.options).toHaveLength(0);
      expect(p.absencesRecommandation?.[0]?.sujet).toMatch(/germe non couvert/);
      expect(p.avisSpecialise.some((a) => a.urgent && /germe non couvert/.test(a.texte))).toBe(true);
      expect(p.sortie.motifs.map((m) => m.statut)).not.toContain('Point de départ à renseigner');
      expect(p.regles.map((r) => r.id)).toContain('R-HEMOCULTURE-NON-COUVERTE');
    }
    // En sepsis, l'urgence reste affichée.
    expect(plan(cas(prl, 'sepsis')).urgence.niveau).toBe('immediate');
  });

  test('l’explication cite les recommandations sur la candidémie sans proposer de traitement', () => {
    const p = plan(cas({ stade: 'examen_direct', examenDirect: 'autre' }));
    const a = p.absencesRecommandation![0];
    expect(a.recherche).toMatch(/échinocandine en 1re intention/);
    expect(a.sources.map((s) => s.source)).toEqual(expect.arrayContaining(['ECMM-ISHAM-ASM-2025-candidose', 'IDSA-2016-candidose', 'SPILF-2021-antifongiques-diapo']));
    expect(p.options).toHaveLength(0);
  });

  test('le libellé saisi par le laboratoire est repris', () => {
    expect(plan(cas({ organisme: 'autre', organismeLibre: 'Candida albicans' })).situation.libelle).toMatch(/Candida albicans/);
  });

  test('foyer déclaré : la règle du foyer garde la main (pas de doublon)', () => {
    const d = cas({ stade: 'examen_direct', examenDirect: 'autre' });
    d.entree = 'syndrome';
    d.syndrome = 'pulmonaire';
    expect(plan(d).regles.map((r) => r.id)).not.toContain('R-HEMOCULTURE-NON-COUVERTE');
  });
});

describe('Cocci à Gram positif en amas (examen direct) : couverture du SARM selon le risque', () => {
  const rangs = (p: Plan) => Object.fromEntries(p.options.map((o) => [o.id, o.rang]));

  test.each(['stable', 'sepsis'])('communautaire sans facteur de risque (%s) : céfazoline en 1re ligne, pas d’anti-SARM', (grav) => {
    const p = plan(cas({ stade: 'examen_direct', examenDirect: 'cgp_amas' }, grav));
    expect(rangs(p)).toMatchObject({ 'proba-sab-cefazoline': 'premiere_ligne', 'proba-sab-vanco': 'conditionnelle' });
    const alerte = p.urgence.alertes.find((a) => /pas d'anti-SARM en probabiliste/.test(a.texte))!;
    expect(alerte.sources?.some((s) => s.source === 'SRLF-SFAR-2014-RFE-antibiotiques-rea')).toBe(true);
  });

  test.each([
    ['associé aux soins', (d: Dossier) => (d.patient.contexte = 'associe_aux_soins'), /infection associée aux soins/],
    ['hémodialyse', (d: Dossier) => (d.patient.renal.dialyse = 'hemodialyse_intermittente'), /hémodialyse/],
    ['cathéter de longue durée', (d: Dossier) => (d.patient.materielVasculaire = 'picc'), /cathéter de longue durée/],
    ['antécédent de SARM', (d: Dossier) => (d.patient.antecedentsMicro = [{ organisme: 'staphylococcus_aureus', resistance: 'SARM' } as Dossier['patient']['antecedentsMicro'][number]]), /antécédent de SARM/],
  ])('facteur de risque (%s) : vancomycine en 1re ligne, céfazoline en alternative', (_n, modif, motif) => {
    const d = cas({ stade: 'examen_direct', examenDirect: 'cgp_amas' }, 'sepsis');
    modif(d);
    const p = plan(d);
    expect(rangs(p)).toMatchObject({ 'proba-sab-vanco': 'premiere_ligne', 'proba-sab-cefazoline': 'alternative' });
    expect(p.urgence.alertes.some((a) => /facteur de risque de SARM/.test(a.texte) && motif.test(a.texte))).toBe(true);
  });

  test('contexte inconnu : les deux options restent conditionnelles et le contexte est demandé', () => {
    const p = plan(cas({ stade: 'examen_direct', examenDirect: 'cgp_amas' }, 'stable', 'inconnu'));
    expect(rangs(p)).toMatchObject({ 'proba-sab-vanco': 'conditionnelle', 'proba-sab-cefazoline': 'conditionnelle' });
    expect(p.urgence.alertes.some((a) => /préciser le contexte/.test(a.texte))).toBe(true);
  });

  test('S. aureus identifié, sans antibiogramme : même logique', () => {
    expect(rangs(plan(cas({ organisme: 'staphylococcus_aureus' })))['proba-sab-cefazoline']).toBe('premiere_ligne');
  });
});

describe('Cocci à Gram positif en chaînettes (examen direct)', () => {
  test('amoxicilline en 1re ligne ; ceftriaxone seulement conditionnelle (entérocoque non exclu), avec l’alerte', () => {
    const p = plan(cas({ stade: 'examen_direct', examenDirect: 'cgp_chainettes' }));
    const amox = p.options.find((o) => /Amoxicilline/.test(o.libelle))!;
    expect(amox.rang).toBe('premiere_ligne');
    const c3g = p.options.find((o) => o.libelle === 'Ceftriaxone')!;
    expect(c3g.rang).toBe('conditionnelle');
    expect(c3g.type).toBe('probabiliste');
    expect(c3g.condition).toMatch(/streptocoque identifié/);
    expect(p.urgence.alertes.some((a) => /céphalosporines .* inactives sur les entérocoques/.test(a.texte))).toBe(true);
  });

  test('streptocoque identifié : la ceftriaxone redevient une alternative, sans l’alerte entérocoque', () => {
    const p = plan(cas({ organisme: 'streptococcus_pyogenes' }));
    expect(p.options.find((o) => o.libelle === 'Ceftriaxone')!.rang).toBe('alternative');
    expect(p.urgence.alertes.some((a) => /inactives sur les entérocoques/.test(a.texte))).toBe(false);
  });
});
