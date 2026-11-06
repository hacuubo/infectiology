/**
 * Peau et tissus mous (R-PEAU-TISSUS-MOUS, 2026-11-06). Résultats attendus établis d'après
 * docs/sources/recherche-peau-tissus-mous.md (HAS 2019/2021, SPILF 2023, IWGDF 2023, SFMU 2017, IDSA 2014, WSES 2022, RCP),
 * indépendamment du code.
 */
import { decider } from '../engine/decider';
import { dossierParDefaut, nettoyerDossier, nouveauPrelevement, type Dossier } from '../engine/etat';
import type { Plan, Prelevement } from '../clinical/types';
import { SOURCES_PAR_ID } from '../clinical/sources';

const MAINTENANT = new Date('2026-11-06T10:00:00Z');

function peau(details: Record<string, string>, modif?: (d: Dossier) => void): Dossier {
  const d = dossierParDefaut();
  d.entree = 'syndrome';
  d.syndrome = 'cutane';
  d.patient.age = 45;
  d.patient.sexe = 'homme';
  d.patient.poidsKg = 70;
  d.patient.tailleCm = 175;
  d.patient.statutAllergie = 'aucune';
  d.patient.contexte = 'communautaire';
  d.patient.gravite = 'stable';
  d.patient.immunodepression = 'non';
  d.patient.neutropenie = 'non';
  d.patient.renal = { creatinine: { valeur: 80, unite: 'umol/L' }, stabilite: 'stable', insuffisanceRenaleAigue: 'non', dialyse: 'aucune' };
  d.patient.valve = 'native';
  d.patient.dispositifIntracardiaque = 'non';
  d.patient.protheseArticulaire = 'non';
  d.patient.materielVasculaire = 'aucun';
  d.patient.materielUrinaire = 'aucun';
  d.details = { 'peau.necrose': 'non', ...details };
  modif?.(d);
  return d;
}
const DHBNN = { 'peau.forme': 'dhbnn', 'peau.dhbnn_particularite': 'aucune', 'peau.hospitalisation': 'non', 'peau.recidives': 'non' };

function plan(d: Dossier): Plan {
  nettoyerDossier(d);
  return decider(d, { maintenant: MAINTENANT });
}
const molecules = (p: Plan, rang?: string) => p.options.filter((o) => !rang || o.rang === rang).flatMap((o) => o.prescriptions.map((x) => x.moleculeId));
const option = (p: Plan, id: string) => p.options.find((o) => o.id === id);
const allergiePeni = (d: Dossier) => {
  d.patient.statutAllergie = 'presentes';
  d.patient.allergies = [{ molecule: 'amoxicilline', reaction: 'immediate', gravite: 'moderee' }];
};

describe('DHBNN (érysipèle) de l’adulte', () => {
  test('commune : amoxicilline 50 mg/kg/j en 3 prises 7 jours ; clindamycine et pristinamycine seulement si allergie ; pas d’examen', () => {
    const p = plan(peau(DHBNN));
    expect(p.situation.id).toBe('dhbnn');
    expect(p.regles.some((r) => r.id === 'R-SYNDROME-NON-COUVERT')).toBe(false);
    expect(molecules(p, 'premiere_ligne')).toEqual(['amoxicilline']);
    const amox = option(p, 'dhbnn-amoxicilline')!.prescriptions[0];
    expect(amox.regimenId).toBe('amoxicilline-po-50mgkg');
    expect(amox.doseAffichee).toMatch(/1 ?170 mg × 3\/24 h/);
    expect(amox.duree.dureePrevueJours).toBe(7);
    expect(option(p, 'dhbnn-clindamycine')?.rang).toBe('conditionnelle');
    expect(option(p, 'dhbnn-pristinamycine')?.rang).toBe('conditionnelle');
    expect(p.controles.find((c) => c.id === 'ctl-dhbnn-prelevement')?.categorie).toBe('conditionnel');
    expect(p.urgence.alertes.some((a) => /corticoïde/.test(a.texte))).toBe(true);
    expect(p.donneesManquantes.filter((m) => m.impact !== 'affine')).toEqual([]);
    expect(p.sortie.traitement).toBe('complet');
  });

  test('allergie à la pénicilline, 110 kg : clindamycine 600 mg × 4/j et pristinamycine 1 g × 3/j en 1re ligne, 7 jours', () => {
    const p = plan(peau(DHBNN, (d) => {
      allergiePeni(d);
      d.patient.poidsKg = 110;
    }));
    expect(molecules(p, 'premiere_ligne').sort()).toEqual(['clindamycine', 'pristinamycine']);
    expect(molecules(p)).not.toContain('amoxicilline');
    expect(option(p, 'dhbnn-clindamycine')!.prescriptions[0].doseAffichee).toMatch(/600 mg × 4\/24 h/);
    expect(option(p, 'dhbnn-pristinamycine')!.prescriptions[0].doseAffichee).toMatch(/1 g × 3\/24 h/);
  });

  test('face : hospitalisation en urgence, pas de schéma antibiotique proposé', () => {
    const p = plan(peau({ ...DHBNN, 'peau.dhbnn_particularite': 'face' }));
    expect(p.situation.id).toBe('dhbnn-face');
    expect(p.options).toHaveLength(0);
    expect(p.avisSpecialise.some((a) => a.urgent && /urgence/.test(a.texte))).toBe(true);
    expect(p.absencesRecommandation.length).toBeGreaterThan(0);
  });

  test('récidives (≥ 2 épisodes/an) : prophylaxie mentionnée comme avis, sans option de pénicilline retard', () => {
    const p = plan(peau({ ...DHBNN, 'peau.recidives': 'oui' }));
    expect(p.avisSpecialise.some((a) => /benzathine/.test(a.texte))).toBe(true);
    expect(molecules(p)).not.toContain('benzathine_benzylpenicilline');
  });
});

describe('Forme nécrosante (DHBN / fasciite nécrosante)', () => {
  test('urgence médico-chirurgicale : appel du 15 et chirurgien ; options seulement en brouillon', () => {
    const p = plan(peau({ 'peau.necrose': 'oui', 'peau.forme': 'dhbnn' }));
    expect(p.situation.id).toBe('dhbn-fn');
    expect(p.urgence.niveau).toBe('immediate');
    expect(p.avisSpecialise.some((a) => a.urgent && /chirurgical/.test(a.texte))).toBe(true);
    expect(p.gestes.some((g) => /excision/.test(g.texte))).toBe(true);
    expect(p.options.length).toBeGreaterThan(0);
    expect(p.options.every((o) => o.statut === 'brouillon')).toBe(true);
    expect(molecules(p)).toEqual(expect.arrayContaining(['piperacilline_tazobactam', 'vancomycine', 'clindamycine']));
    // La clindamycine IV reste dans le maximum du RCP (2 400 mg/24 h).
    const clin = p.options.flatMap((o) => o.prescriptions).find((x) => x.moleculeId === 'clindamycine')!;
    expect(clin.doseAffichee).toMatch(/600 mg × 3\/24 h/);
  });
});

describe('Abcès, furoncle, furonculose', () => {
  test('abcès : drainage, prélèvement du pus ; clindamycine ou pristinamycine 5 jours ; voies IV conditionnelles', () => {
    const p = plan(peau({ 'peau.forme': 'abces' }));
    expect(p.situation.id).toBe('abces-cutane');
    expect(p.gestes.some((g) => /drainage/.test(g.texte))).toBe(true);
    expect(p.controles.find((c) => c.id === 'ctl-abces-pus')?.categorie).toBe('indique');
    expect(molecules(p, 'premiere_ligne').sort()).toEqual(['clindamycine', 'pristinamycine']);
    expect(p.options.every((o) => o.prescriptions[0].duree.dureePrevueJours === 5)).toBe(true);
    expect(molecules(p, 'conditionnelle')).toEqual(expect.arrayContaining(['cloxacilline', 'cefazoline']));
    expect(option(p, 'abces-clindamycine')?.commentaire).toMatch(/IDSA/);
  });

  test('abcès à SARM résistant à la clindamycine : bêta-lactamines et clindamycine écartées, pristinamycine maintenue', () => {
    const d = peau({ 'peau.forme': 'abces' });
    const pus: Prelevement = { ...nouveauPrelevement('profond'), organisme: 'staphylococcus_aureus', stade: 'antibiogramme', antibiogrammePour: 'staphylococcus_aureus', phenotypes: { SARM: 'present' }, antibiogramme: [{ dci: 'oxacilline', categorie: 'R' }, { dci: 'clindamycine', categorie: 'R' }, { dci: 'pristinamycine', categorie: 'S' }] };
    d.prelevements = [pus];
    const p = plan(d);
    expect(molecules(p)).toEqual(['pristinamycine']);
    expect(p.sortie.ecartees.filter((e) => e.type === 'resistance').length).toBeGreaterThanOrEqual(3);
  });

  test('furoncle isolé non compliqué : pas d’antibiotique ; compliqué : clindamycine ou pristinamycine 5 jours', () => {
    const simple = plan(peau({ 'peau.forme': 'furoncle', 'peau.furoncle_complique': 'non' }));
    expect(simple.indication?.decision).toBe('ne_pas_traiter');
    expect(simple.options).toHaveLength(0);
    const comp = plan(peau({ 'peau.forme': 'furoncle', 'peau.furoncle_complique': 'oui' }));
    expect(molecules(comp, 'premiere_ligne').sort()).toEqual(['clindamycine', 'pristinamycine']);
    expect(comp.options[0].prescriptions[0].duree.dureePrevueJours).toBe(5);
  });

  test('furonculose : 7 jours, chlorhexidine, décolonisation sans antibiotique général', () => {
    const p = plan(peau({ 'peau.forme': 'furonculose' }));
    expect(p.options.every((o) => o.prescriptions[0].duree.dureePrevueJours === 7)).toBe(true);
    expect(p.gestes.map((g) => g.texte).join(' ')).toMatch(/chlorhexidine/);
    expect(p.gestes.map((g) => g.texte).join(' ')).toMatch(/pas d'antibiotique par voie générale pour décoloniser/);
  });
});

describe('Impétigo de l’adulte', () => {
  test('grave : pristinamycine 1 g × 3/j 7 jours (céfalexine citée, non proposée) ; peu étendu : pas d’antibiotique général', () => {
    const p = plan(peau({ 'peau.forme': 'impetigo', 'peau.impetigo_grave': 'oui' }));
    expect(molecules(p)).toEqual(['pristinamycine']);
    expect(p.options[0].prescriptions[0].duree.dureePrevueJours).toBe(7);
    expect(p.options[0].commentaire).toMatch(/Céfalexine/);
    const loc = plan(peau({ 'peau.forme': 'impetigo', 'peau.impetigo_grave': 'non' }));
    expect(loc.indication?.decision).toBe('ne_pas_traiter');
    expect(loc.indication?.actions.join(' ')).toMatch(/Mupirocine/);
  });
});

describe('Morsures', () => {
  test('morsure infectée : amoxicilline-acide clavulanique 50 mg/kg/j, durée divergente (HAS 7 j / SFMU 10-14 j) → brouillon', () => {
    const p = plan(peau({ 'peau.forme': 'morsure', 'peau.morsure_origine': 'animale', 'peau.morsure_infectee': 'oui' }));
    const o = option(p, 'morsure-infectee-amoxclav')!;
    expect(o.statut).toBe('brouillon');
    expect(o.prescriptions[0].regimenId).toBe('amoxclav-po-50mgkg-morsure');
    expect(o.prescriptions[0].duree.texte).toMatch(/10 à 14 jours/);
    expect(p.gestes.map((g) => g.texte).join(' ')).toMatch(/antirabique/);
  });

  test('plaie profonde non infectée : préemptif 1 g × 3/j 5 jours (SFMU), réévaluation à 48 h', () => {
    const p = plan(peau({ 'peau.forme': 'morsure', 'peau.morsure_origine': 'animale', 'peau.morsure_infectee': 'non', 'peau.morsure_profonde': 'oui' }));
    const o = option(p, 'morsure-preemptif-amoxclav')!;
    expect(o.rang).toBe('premiere_ligne');
    expect(o.prescriptions[0].doseAffichee).toMatch(/1 g × 3\/24 h/);
    expect(o.prescriptions[0].duree.dureePrevueJours).toBe(5);
    expect(p.reevaluation.some((r) => /48 h/.test(r.texte))).toBe(true);
  });

  test('allergie à la pénicilline : avis spécialisé, ni pristinamycine ni clindamycine (Pasteurella naturellement résistante)', () => {
    const p = plan(peau({ 'peau.forme': 'morsure', 'peau.morsure_origine': 'animale', 'peau.morsure_infectee': 'oui' }, allergiePeni));
    expect(p.options).toHaveLength(0);
    expect(p.avisSpecialise.some((a) => /avis spécialisé/.test(a.texte))).toBe(true);
    expect(p.sortie.ecartees.some((e) => /Pasteurella/.test(e.raison))).toBe(true);
  });
});

describe('Pied diabétique (SPILF 2023, IWGDF 2023)', () => {
  const pied = (d: Record<string, string>, modif?: (x: Dossier) => void) => plan(peau({ 'peau.forme': 'pied_diabetique', 'peau.pied_osteite': 'non', ...d }, modif));

  test('grade 1 : ni prélèvement ni antibiotique', () => {
    const p = pied({ 'peau.pied_grade': '1' });
    expect(p.indication?.decision).toBe('ne_pas_traiter');
    expect(p.options).toHaveLength(0);
  });

  test('grade 2, plaie récente : clindamycine 600 mg/8 h 7 jours ; prélèvement après débridement, pas d’écouvillon superficiel', () => {
    const p = pied({ 'peau.pied_grade': '2', 'peau.pied_anciennete': 'recente' });
    expect(molecules(p, 'premiere_ligne')).toEqual(['clindamycine']);
    expect(p.options[0].prescriptions[0].duree.dureePrevueJours).toBe(7);
    expect(p.controles.find((c) => c.id === 'ctl-pied-prelevement')?.quoi).toMatch(/débridement/);
    expect(p.urgence.alertes.some((a) => /écouvillonnage superficiel/.test(a.texte))).toBe(true);
  });

  test('grade 2 récente au-delà de 100 kg : 900 mg/8 h de la SPILF non repris (au-dessus du RCP), option en brouillon', () => {
    const p = pied({ 'peau.pied_grade': '2', 'peau.pied_anciennete': 'recente' }, (d) => (d.patient.poidsKg = 120));
    const o = option(p, 'pied-g2-clindamycine')!;
    expect(o.statut).toBe('brouillon');
    expect(o.commentaire).toMatch(/900 mg\/8 h/);
    expect(o.prescriptions[0].doseAffichee).toMatch(/600 mg × 4\/24 h/);
  });

  test('grade 3 : amoxicilline-acide clavulanique 10 jours ; grade 4 avec choc : pipéracilline-tazobactam + vancomycine + amikacine', () => {
    const g3 = pied({ 'peau.pied_grade': '3' });
    expect(molecules(g3, 'premiere_ligne')).toEqual(['amoxicilline_clavulanate']);
    expect(g3.options[0].prescriptions[0].duree.dureePrevueJours).toBe(10);
    const g4 = pied({ 'peau.pied_grade': '4' }, (d) => (d.patient.gravite = 'choc_septique'));
    expect(option(g4, 'pied-g4-sepsis')!.prescriptions.map((x) => x.moleculeId)).toEqual(['piperacilline_tazobactam', 'vancomycine', 'amikacine']);
    expect(g4.controles.some((c) => c.id === 'ctl-pied-hemoc')).toBe(true);
  });
});

describe('Sources', () => {
  test('toute référence produite pour les formes cutanées pointe vers le registre', () => {
    const cas: Record<string, string>[] = [
      DHBNN,
      { ...DHBNN, 'peau.dhbnn_particularite': 'perinee' },
      { ...DHBNN, 'peau.dhbnn_particularite': 'aquatique', 'peau.recidives': 'oui', 'peau.hospitalisation': 'oui' },
      { 'peau.necrose': 'oui' },
      { 'peau.forme': 'abces' },
      { 'peau.forme': 'furoncle', 'peau.furoncle_complique': 'oui' },
      { 'peau.forme': 'furoncle', 'peau.furoncle_complique': 'non' },
      { 'peau.forme': 'furonculose' },
      { 'peau.forme': 'impetigo', 'peau.impetigo_grave': 'oui' },
      { 'peau.forme': 'impetigo', 'peau.impetigo_grave': 'non' },
      { 'peau.forme': 'morsure', 'peau.morsure_origine': 'humaine', 'peau.morsure_infectee': 'non', 'peau.morsure_profonde': 'non' },
      { 'peau.forme': 'pied_diabetique', 'peau.pied_grade': '4', 'peau.pied_osteite': 'oui', 'peau.necrose': 'oui' },
      { 'peau.forme': 'pied_diabetique', 'peau.pied_grade': '2', 'peau.pied_anciennete': 'inconnu' },
      { 'peau.forme': 'autre' },
      {},
    ];
    const manquantes = new Set<string>();
    for (const details of cas)
      for (const allergie of [false, true]) {
        const p = plan(peau(details, allergie ? allergiePeni : undefined));
        const refs = [...p.sources, ...p.urgence.alertes.flatMap((a) => a.sources ?? []), ...p.absencesRecommandation.flatMap((a) => a.sources), ...p.sortie.ecartees.flatMap((e) => e.sources), ...(p.indication?.sources ?? [])];
        for (const r of refs) if (!SOURCES_PAR_ID[r.source]) manquantes.add(r.source);
      }
    expect([...manquantes]).toEqual([]);
  });
});

describe('Articulation avec R-PRELEVEMENT-SUPERFICIEL et les bactériémies', () => {
  const superficiel = (): Prelevement => ({ ...nouveauPrelevement('superficiel'), organisme: 'staphylococcus_aureus' });

  test('plaie colonisée sans signe d’infection : ne pas traiter, même si une forme est renseignée', () => {
    const d = peau({ 'peau.forme': 'abces' }, (x) => {
      x.prelevements = [superficiel()];
      x.clinique.signesInfectionLocale = 'non';
    });
    const p = plan(d);
    expect(p.indication?.decision).toBe('ne_pas_traiter');
    expect(p.options).toHaveLength(0);
    expect(p.regles.some((r) => r.id === 'R-PEAU-TISSUS-MOUS')).toBe(false);
  });

  test('infection clinique avec forme connue : le schéma de la forme s’applique (plus de situation « non couverte »)', () => {
    const d = peau({ 'peau.forme': 'abces' }, (x) => {
      x.prelevements = [superficiel()];
      x.clinique.signesInfectionLocale = 'oui';
    });
    const p = plan(d);
    expect(p.situation.id).toBe('abces-cutane');
    expect(p.indication?.decision).toBe('traiter');
    expect(molecules(p, 'premiere_ligne').sort()).toEqual(['clindamycine', 'pristinamycine']);
  });

  test('bactériémie à S. aureus sur abcès : pas d’option cutanée (durée de la bactériémie), gestes de drainage conservés', () => {
    const d = peau({ 'peau.forme': 'abces' }, (x) => {
      const h = nouveauPrelevement('hemoculture');
      h.organisme = 'staphylococcus_aureus';
      h.stade = 'antibiogramme';
      h.antibiogramme = [{ dci: 'oxacilline', categorie: 'S' }];
      h.antibiogrammePour = 'staphylococcus_aureus';
      h.foyer = 'cutane';
      h.foyerStatut = 'confirme';
      x.prelevements = [h];
    });
    const p = plan(d);
    expect(p.regles.some((r) => r.id === 'R-BACTERIEMIE-S-AUREUS')).toBe(true);
    expect(p.options.some((o) => o.id.startsWith('abces-'))).toBe(false);
    expect(p.gestes.some((g) => /drainage/.test(g.texte))).toBe(true);
    expect(p.situation.id).not.toBe('abces-cutane');
  });
});
