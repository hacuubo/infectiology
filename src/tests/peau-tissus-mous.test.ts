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

  // Relecture v7 (n° 11) : un abcès est du pus par définition ; « pas de signe d'infection » est une incohérence de saisie,
  // pas une colonisation (le test précédent entérinait l'inverse).
  test('abcès déclaré avec écouvillon et « pas de signe d’infection » : forme retenue, incohérence signalée, pas de « ne pas traiter »', () => {
    const d = peau({ 'peau.forme': 'abces' }, (x) => {
      x.prelevements = [superficiel()];
      x.clinique.signesInfectionLocale = 'non';
    });
    const p = plan(d);
    expect(p.indication?.decision).not.toBe('ne_pas_traiter');
    expect(p.situation.id).toBe('abces-cutane');
    expect(p.donneesManquantes.some((m) => /contredite par la forme/.test(m.champ) && m.impact === 'bloque_decision')).toBe(true);
    expect(p.sortie.traitement).toBe('partiel');
  });

  test('plaie sans forme renseignée, écouvillon positif, pas de signe d’infection : colonisation, ne pas traiter', () => {
    const d = peau({}, (x) => {
      x.prelevements = [superficiel()];
      x.clinique.signesInfectionLocale = 'non';
    });
    const p = plan(d);
    expect(p.indication?.decision).toBe('ne_pas_traiter');
    expect(p.regles.some((r) => r.id === 'R-PEAU-TISSUS-MOUS')).toBe(false);
  });

  test('même plaie colonisée en sepsis : jamais « pas d’antibiotique »', () => {
    const d = peau({}, (x) => {
      x.prelevements = [superficiel()];
      x.clinique.signesInfectionLocale = 'non';
      x.patient.gravite = 'sepsis';
    });
    const p = plan(d);
    expect(p.indication?.decision).not.toBe('ne_pas_traiter');
    expect(p.sortie.urgence).toBe(true);
  });

  test('DHBNN avec écouvillon et signes locaux « inconnu » : le plan cutané s’applique sans question redondante', () => {
    const d = peau(DHBNN, (x) => {
      x.prelevements = [superficiel()];
      x.clinique.signesInfectionLocale = 'inconnu';
    });
    const p = plan(d);
    expect(p.situation.id).toBe('dhbnn');
    expect(molecules(p, 'premiere_ligne')).toEqual(['amoxicilline']);
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
    // Relecture v7 (n° 12-13) : pas de donnée manquante propre aux options cutanées effacées.
    expect(p.donneesManquantes.some((m) => /ancienneté|critère d'hospitalisation/.test(m.champ))).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/* Relecture v7 (2026-11-07) : un test par constat testable             */
/* ------------------------------------------------------------------ */

const hemoc = (modif: (h: Prelevement) => void): Prelevement => {
  const h = nouveauPrelevement('hemoculture');
  h.foyer = 'cutane';
  h.foyerStatut = 'confirme';
  modif(h);
  return h;
};
const ecouvillon = (organisme: Prelevement['organisme'], atb: Prelevement['antibiogramme'] = []): Prelevement => ({ ...nouveauPrelevement('superficiel'), organisme, stade: atb.length ? 'antibiogramme' : 'identification', antibiogrammePour: organisme, antibiogramme: atb });

describe('Nécrose déclarée : urgence médico-chirurgicale quels que soient l’écouvillon et le grade', () => {
  for (const signes of ['inconnu', 'non'] as const)
    test(`nécrose + écouvillon à S. aureus, signes locaux « ${signes} » : DHBN-FN, urgence immédiate`, () => {
      const p = plan(peau({ 'peau.necrose': 'oui', 'peau.forme': 'dhbnn' }, (x) => {
        x.prelevements = [ecouvillon('staphylococcus_aureus')];
        x.clinique.signesInfectionLocale = signes;
      }));
      expect(p.situation.id).toBe('dhbn-fn');
      expect(p.urgence.niveau).toBe('immediate');
      expect(p.indication?.decision).not.toBe('ne_pas_traiter');
    });

  test('pied diabétique, nécrose, grade non renseigné : avis chirurgical urgent', () => {
    const p = plan(peau({ 'peau.forme': 'pied_diabetique', 'peau.pied_osteite': 'non', 'peau.necrose': 'oui' }));
    expect(p.avisSpecialise.some((a) => a.urgent && /chirurgical/.test(a.texte))).toBe(true);
    expect(p.urgence.alertes.some((a) => a.niveau === 'urgence' && /nécrose/.test(a.texte))).toBe(true);
  });

  test('pied diabétique, nécrose, grade 1 : pas de « ni prélèvement ni antibiotique », grade contredit', () => {
    const p = plan(peau({ 'peau.forme': 'pied_diabetique', 'peau.pied_osteite': 'non', 'peau.necrose': 'oui', 'peau.pied_grade': '1' }));
    expect(p.indication?.decision).not.toBe('ne_pas_traiter');
    expect(p.avisSpecialise.some((a) => a.urgent && /chirurgical/.test(a.texte))).toBe(true);
    expect(p.situation.id).toBe('pied-grade-incoherent');
    expect(p.donneesManquantes.some((m) => m.cible === 'details.peau.pied_grade' && m.impact === 'bloque_decision')).toBe(true);
  });
});

describe('Hémoculture positive (règle commune de bactériémie concomitante)', () => {
  test('SCN dans une seule série + DHBNN : l’érysipèle reste traité (amoxicilline), la conclusion SCN reste secondaire', () => {
    const p = plan(peau(DHBNN, (x) => {
      x.prelevements = [hemoc((h) => {
        h.organisme = 'staphylococcus_epidermidis';
        h.hemoc = { origine: 'peripherique', persistance: 'inconnu', nbSeriesPrelevees: 2, nbSeriesPositives: 1 };
      })];
    }));
    expect(molecules(p, 'premiere_ligne')).toEqual(['amoxicilline']);
    expect(p.situation.id).toBe('dhbnn');
    expect((p.indicationsSecondaires ?? []).some((i) => i.regleId === 'R-BACTERIEMIE-SCN')).toBe(true);
  });

  test('pied grade 4 en choc, BGN à l’examen direct : schéma du pied proposé (plus de « situation non couverte »)', () => {
    const p = plan(peau({ 'peau.forme': 'pied_diabetique', 'peau.pied_osteite': 'non', 'peau.pied_grade': '4' }, (x) => {
      x.patient.gravite = 'choc_septique';
      x.prelevements = [hemoc((h) => {
        h.stade = 'examen_direct';
        h.examenDirect = 'bgn';
      })];
    }));
    expect(option(p, 'pied-g4-sepsis')?.prescriptions.map((x) => x.moleculeId)).toEqual(['piperacilline_tazobactam', 'vancomycine', 'amikacine']);
    expect(p.sortie.motifs.some((m) => m.type === 'non_couverte')).toBe(false);
  });

  test('pied grade 4 en choc, E. coli sans antibiogramme : schéma du pied ; E. coli R à la pipéracilline-tazobactam : option écartée', () => {
    const ident = plan(peau({ 'peau.forme': 'pied_diabetique', 'peau.pied_osteite': 'non', 'peau.pied_grade': '4' }, (x) => {
      x.patient.gravite = 'choc_septique';
      x.prelevements = [hemoc((h) => (h.organisme = 'escherichia_coli'))];
    }));
    expect(option(ident, 'pied-g4-sepsis')).toBeDefined();
    const r = plan(peau({ 'peau.forme': 'pied_diabetique', 'peau.pied_osteite': 'non', 'peau.pied_grade': '4' }, (x) => {
      x.patient.gravite = 'choc_septique';
      x.prelevements = [hemoc((h) => {
        h.organisme = 'escherichia_coli';
        h.stade = 'antibiogramme';
        h.antibiogrammePour = 'escherichia_coli';
        h.antibiogramme = [{ dci: 'piperacilline_tazobactam', categorie: 'R' }];
      })];
    }));
    expect(option(r, 'pied-g4-sepsis')).toBeUndefined();
    expect(r.sortie.ecartees.some((e) => e.type === 'resistance' && /hémoculture/.test(e.raison))).toBe(true);
  });

  test('DHBNN + bactériémie à E. coli : schéma anti-streptococcique seulement conditionnel, absence expliquée', () => {
    const p = plan(peau(DHBNN, (x) => {
      x.prelevements = [hemoc((h) => (h.organisme = 'escherichia_coli'))];
    }));
    expect(option(p, 'dhbnn-amoxicilline')?.rang).toBe('conditionnelle');
    expect(p.absencesRecommandation.some((a) => /BGN/.test(a.sujet))).toBe(true);
  });

  test('fasciite nécrosante + bactériémie à S. pyogenes : schémas avec clindamycine conservés, situation DHBN-FN', () => {
    const p = plan(peau({ 'peau.necrose': 'oui', 'peau.forme': 'dhbnn' }, (x) => {
      x.prelevements = [hemoc((h) => (h.organisme = 'streptococcus_pyogenes'))];
    }));
    expect(p.situation.id).toBe('dhbn-fn');
    expect(option(p, 'fn-ptz-vanco-clinda')).toBeDefined();
    expect(p.urgence.alertes.some((a) => /Streptocoque A/.test(a.texte))).toBe(true);
  });

  test('furoncle « non compliqué » + bactériémie à S. aureus : pas de conclusion « pas d’antibiotique »', () => {
    const p = plan(peau({ 'peau.forme': 'furoncle', 'peau.furoncle_complique': 'non' }, (x) => {
      x.prelevements = [hemoc((h) => (h.organisme = 'staphylococcus_aureus'))];
    }));
    expect(p.indication?.decision).not.toBe('ne_pas_traiter');
    expect(p.regles.some((r) => r.id === 'R-BACTERIEMIE-S-AUREUS')).toBe(true);
  });
});

describe('Sepsis et choc : pas de schéma ambulatoire en 1re ligne, jamais « pas d’antibiotique »', () => {
  test('DHBNN en choc septique : amoxicilline per os seulement conditionnelle, sortie au mieux partielle, avis', () => {
    const p = plan(peau(DHBNN, (x) => (x.patient.gravite = 'choc_septique')));
    expect(option(p, 'dhbnn-amoxicilline')?.rang).toBe('conditionnelle');
    expect(option(p, 'dhbnn-amoxicilline')?.condition).toMatch(/voie orale/);
    expect(p.sortie.traitement).not.toBe('complet');
    expect(p.absencesRecommandation.some((a) => /hospitalisée ou avec sepsis/.test(a.sujet))).toBe(true);
  });

  test('DHBNN hospitalisée sans gravité : schéma oral sous réserve, sortie non « complète » (absence affichée)', () => {
    const p = plan(peau({ ...DHBNN, 'peau.hospitalisation': 'oui' }));
    expect(option(p, 'dhbnn-amoxicilline')?.rang).toBe('conditionnelle');
    expect(p.sortie.traitement).not.toBe('complet');
  });

  test('furoncle « non compliqué » avec sepsis : forme compliquée retenue, incohérence signalée, schéma oral sous réserve', () => {
    const sepsis = plan(peau({ 'peau.forme': 'furoncle', 'peau.furoncle_complique': 'non' }, (x) => (x.patient.gravite = 'sepsis')));
    expect(sepsis.indication?.decision).not.toBe('ne_pas_traiter');
    expect(sepsis.situation.id).toBe('furoncle-complique');
    expect(sepsis.urgence.alertes.some((a) => /contredite par : sepsis/.test(a.texte))).toBe(true);
    expect(molecules(sepsis, 'conditionnelle').sort()).toEqual(['clindamycine', 'pristinamycine']);
    expect(sepsis.absencesRecommandation.some((a) => /Furoncle compliqué avec sepsis/.test(a.sujet))).toBe(true);
  });

  test('pied grade 1 avec sepsis : pas de « ni antibiotique », grade contredit, schéma du grade 4 conditionnel', () => {
    const p = plan(peau({ 'peau.forme': 'pied_diabetique', 'peau.pied_osteite': 'non', 'peau.pied_grade': '1' }, (x) => (x.patient.gravite = 'sepsis')));
    expect(p.indication?.decision).not.toBe('ne_pas_traiter');
    expect(option(p, 'pied-g4-sepsis')?.rang).toBe('conditionnelle');
    expect(p.donneesManquantes.some((m) => m.cible === 'details.peau.pied_grade')).toBe(true);
  });

  test('impétigo « peu étendu » avec sepsis : pas de conclusion « traitement local seul »', () => {
    const p = plan(peau({ 'peau.forme': 'impetigo', 'peau.impetigo_grave': 'non' }, (x) => (x.patient.gravite = 'sepsis')));
    expect(p.indication?.decision).not.toBe('ne_pas_traiter');
  });
});

describe('Réponses inconnues et morsure non profonde : indication explicite', () => {
  test('furoncle à complication inconnue, impétigo à gravité inconnue, morsure à profondeur inconnue : informations insuffisantes', () => {
    for (const d of <Record<string, string>[]>[
      { 'peau.forme': 'furoncle', 'peau.furoncle_complique': 'inconnu' },
      { 'peau.forme': 'impetigo', 'peau.impetigo_grave': 'inconnu' },
      { 'peau.forme': 'morsure', 'peau.morsure_origine': 'animale', 'peau.morsure_infectee': 'non', 'peau.morsure_profonde': 'inconnu' },
    ]) {
      const p = plan(peau(d));
      expect(p.indication?.decision).toBe('informations_insuffisantes');
      expect(p.indication?.titre).not.toBe('Indication de traitement retenue');
    }
  });

  test('morsure non profonde, non infectée, sans situation à risque : pas d’antibiotique, « reconsidérer si » la liste IDSA', () => {
    const p = plan(peau({ 'peau.forme': 'morsure', 'peau.morsure_origine': 'animale', 'peau.morsure_infectee': 'non', 'peau.morsure_profonde': 'non', 'peau.morsure_facteurs': 'non' }));
    expect(p.indication?.decision).toBe('ne_pas_traiter');
    expect(p.indication?.reconsiderer.join(' ')).toMatch(/asplénie/);
    expect(p.options).toHaveLength(0);
  });

  test('morsure non profonde chez un immunodéprimé : préemptif IDSA conditionnel, brouillon ; plaie profonde : brouillon aussi', () => {
    const p = plan(peau({ 'peau.forme': 'morsure', 'peau.morsure_origine': 'animale', 'peau.morsure_infectee': 'non', 'peau.morsure_profonde': 'non' }, (x) => (x.patient.immunodepression = 'oui')));
    const o = option(p, 'morsure-preemptif-amoxclav')!;
    expect(o.rang).toBe('conditionnelle');
    expect(o.statut).toBe('brouillon');
    expect(o.prescriptions[0].regimenId).toBe('amoxclav-po-1g8h-peau');
    const prof = plan(peau({ 'peau.forme': 'morsure', 'peau.morsure_origine': 'animale', 'peau.morsure_infectee': 'non', 'peau.morsure_profonde': 'oui' }));
    expect(option(prof, 'morsure-preemptif-amoxclav')?.statut).toBe('brouillon');
  });

  test('morsure infectée à 120 kg : divergence de dose SFMU affichée, plafond d’acide clavulanique signalé', () => {
    const p = plan(peau({ 'peau.forme': 'morsure', 'peau.morsure_origine': 'animale', 'peau.morsure_infectee': 'oui' }, (x) => (x.patient.poidsKg = 120)));
    expect(option(p, 'morsure-infectee-amoxclav')?.commentaire).toMatch(/SFMU 2017 1 g trois fois par jour/);
    expect(p.urgence.alertes.some((a) => /375 mg\/j/.test(a.texte))).toBe(true);
  });
});

describe('Antibiogramme, interactions, grossesse, allaitement', () => {
  test('DHBNN, écouvillon de porte d’entrée à E. coli résistant à l’amoxicilline : amoxicilline maintenue (cible streptocoque)', () => {
    const p = plan(peau(DHBNN, (x) => {
      x.prelevements = [ecouvillon('escherichia_coli', [{ dci: 'amoxicilline', categorie: 'R' }])];
      x.clinique.signesInfectionLocale = 'oui';
    }));
    expect(molecules(p, 'premiere_ligne')).toEqual(['amoxicilline']);
    expect(p.urgence.alertes.some((a) => /porte d'entrée/.test(a.texte))).toBe(true);
  });

  test('colchicine : pristinamycine écartée (contre-indication) ; impétigo grave sans autre option : contraintes expliquées', () => {
    const dh = plan(peau(DHBNN, (x) => {
      allergiePeni(x);
      x.patient.traitementsAssocies = ['colchicine'];
    }));
    expect(molecules(dh)).not.toContain('pristinamycine');
    expect(dh.sortie.ecartees.some((e) => e.type === 'contre_indication' && /colchicine/.test(e.raison))).toBe(true);
    expect(molecules(dh, 'premiere_ligne')).toEqual(['clindamycine']);
    const imp = plan(peau({ 'peau.forme': 'impetigo', 'peau.impetigo_grave': 'oui' }, (x) => (x.patient.traitementsAssocies = ['colchicine'])));
    expect(imp.options).toHaveLength(0);
    expect(imp.sortie.motifs.some((m) => m.type === 'contraintes')).toBe(true);
  });

  test('grossesse possible : la pristinamycine porte une alerte (données insuffisantes, RCP), comme la clindamycine', () => {
    const p = plan(peau(DHBNN, (x) => {
      allergiePeni(x);
      x.patient.sexe = 'femme';
      x.patient.age = 30;
      x.patient.grossesse = 'oui';
    }));
    expect(p.urgence.alertes.some((a) => /pristinamycine — données animales et cliniques insuffisantes/.test(a.texte))).toBe(true);
    expect(option(p, 'dhbnn-clindamycine')!.prescriptions[0].avertissements.join(' ')).toMatch(/Grossesse/);
  });

  test('allaitement : clindamycine en alternative derrière la pristinamycine ; alerte seulement si la clindamycine est proposée', () => {
    const p = plan(peau(DHBNN, (x) => {
      allergiePeni(x);
      x.patient.sexe = 'femme';
      x.patient.grossesse = 'non';
      x.patient.allaitement = 'oui';
    }));
    expect(option(p, 'dhbnn-clindamycine')?.rang).toBe('alternative');
    expect(option(p, 'dhbnn-pristinamycine')?.rang).toBe('premiere_ligne');
    // Clindamycine rendue R sur le pus d'un abcès : pas d'alerte d'allaitement propre à la clindamycine.
    const d = peau({ 'peau.forme': 'abces' }, (x) => {
      x.patient.sexe = 'femme';
      x.patient.grossesse = 'non';
      x.patient.allaitement = 'oui';
      x.patient.poidsKg = undefined;
    });
    d.prelevements = [{ ...nouveauPrelevement('profond'), organisme: 'staphylococcus_aureus', stade: 'antibiogramme', antibiogrammePour: 'staphylococcus_aureus', antibiogramme: [{ dci: 'clindamycine', categorie: 'R' }] }];
    const ab = plan(d);
    expect(molecules(ab)).not.toContain('clindamycine');
    expect(ab.urgence.alertes.some((a) => /la clindamycine est contre-indiquée/.test(a.texte))).toBe(false);
    expect(ab.donneesManquantes.some((m) => m.champ === 'poids' && /clindamycine/.test(m.pourquoi))).toBe(false);
  });

  test('hémodialyse : la clindamycine signale qu’elle n’est pas dialysée ; la pristinamycine sans adaptation rénale', () => {
    const p = plan(peau({ 'peau.forme': 'abces' }, (x) => (x.patient.renal = { ...x.patient.renal, dialyse: 'hemodialyse_intermittente' })));
    expect(option(p, 'abces-clindamycine')!.prescriptions[0].adaptations.join(' ')).toMatch(/hémodialyse/i);
    expect(option(p, 'abces-pristinamycine')).toBeDefined();
  });
});

const pied3 = () => plan(peau({ 'peau.forme': 'pied_diabetique', 'peau.pied_osteite': 'non', 'peau.pied_grade': '3' }));

describe('Posologies, durées et régimes propres à la peau', () => {
  test('cloxacilline de l’abcès à 130 kg : dose calculée et plafonnée à 12 g/j', () => {
    const p = plan(peau({ 'peau.forme': 'abces' }, (x) => (x.patient.poidsKg = 130)));
    const c = option(p, 'abces-cloxacilline')!.prescriptions[0];
    expect(c.doseAffichee).toMatch(/plafonné/);
    expect(c.doseCalculee?.frequenceParJour).toBe(6);
    expect(c.doseCalculee!.valeurParAdministration * 6).toBeLessThanOrEqual(12000);
  });

  test('pied grade 3 : durée comptée après excision de la nécrose ; régimes amoxicilline-acide clavulanique propres à la peau', () => {
    const p = pied3();
    const o = option(p, 'pied-g23-amoxclav-po')!;
    expect(o.prescriptions[0].duree.pointDeDepart).toMatch(/excision/);
    expect(o.prescriptions[0].regimenId).toBe('amoxclav-po-1g8h-peau');
    expect(option(p, 'pied-g23-amoxclav-iv')!.prescriptions[0].regimenId).toBe('amoxclav-iv-1g8h-peau');
  });

  test('pied grade 4 avec sepsis et risque de BLSE : alerte « pas de carbapénème sauf suspicion de BLSE »', () => {
    const p = plan(peau({ 'peau.forme': 'pied_diabetique', 'peau.pied_osteite': 'non', 'peau.pied_grade': '4' }, (x) => {
      x.patient.gravite = 'sepsis';
      x.patient.antecedentsMicro = [{ organisme: 'escherichia_coli', resistance: 'BLSE', date: '2026-09-01' }];
    }));
    expect(p.urgence.alertes.some((a) => /suspicion de BLSE/.test(a.texte))).toBe(true);
  });

  test('pied grade 4 avec sepsis et allergie : libellé d’absence « allergie à la pénicilline »', () => {
    const p = plan(peau({ 'peau.forme': 'pied_diabetique', 'peau.pied_osteite': 'non', 'peau.pied_grade': '4' }, (x) => {
      x.patient.gravite = 'sepsis';
      allergiePeni(x);
    }));
    expect(p.absencesRecommandation.some((a) => /allergie à la pénicilline/.test(a.sujet))).toBe(true);
  });

  test('fasciite nécrosante : deux schémas larges au même rang, libellés attribués à leur source', () => {
    const p = plan(peau({ 'peau.necrose': 'oui', 'peau.forme': 'dhbnn' }));
    expect(option(p, 'fn-ptz-vanco')?.libelle).not.toMatch(/WSES/);
    expect(option(p, 'fn-ptz-vanco')?.rang).toBe(option(p, 'fn-ptz-vanco-clinda')?.rang);
    expect(option(p, 'fn-ptz-vanco')?.commentaire).toMatch(/patient stable/);
  });

  test('face et périnée : extrapolation dite explicitement', () => {
    const face = plan(peau({ ...DHBNN, 'peau.dhbnn_particularite': 'face' }));
    expect(face.situation.description).toMatch(/Extrapolation/);
    const per = plan(peau({ ...DHBNN, 'peau.dhbnn_particularite': 'perinee' }));
    expect(per.urgence.alertes.some((a) => /Extrapolation/.test(a.texte))).toBe(true);
  });
});

describe('Boutons « Compléter » et nettoyage des réponses', () => {
  test('chaque donnée manquante du foyer cible sa question details.peau.*', () => {
    const cas: [Record<string, string>, string][] = [
      [{ 'peau.necrose': 'inconnu' }, 'details.peau.forme'],
      [{ 'peau.forme': 'furoncle', 'peau.furoncle_complique': 'inconnu' }, 'details.peau.furoncle_complique'],
      [{ 'peau.forme': 'impetigo', 'peau.impetigo_grave': 'inconnu' }, 'details.peau.impetigo_grave'],
      [{ 'peau.forme': 'morsure', 'peau.morsure_infectee': 'inconnu' }, 'details.peau.morsure_infectee'],
      [{ 'peau.forme': 'pied_diabetique', 'peau.pied_osteite': 'inconnu' }, 'details.peau.pied_grade'],
      [{ 'peau.forme': 'pied_diabetique', 'peau.pied_grade': '2' }, 'details.peau.pied_anciennete'],
      [{ ...DHBNN, 'peau.dhbnn_particularite': 'inconnu', 'peau.hospitalisation': 'inconnu' }, 'details.peau.dhbnn_particularite'],
      [{ ...DHBNN, 'peau.necrose': 'inconnu' }, 'details.peau.necrose'],
    ];
    for (const [details, cible] of cas) {
      const d = peau({}, (x) => (x.details = details));
      const p = plan(d);
      expect(p.donneesManquantes.map((m) => m.cible)).toContain(cible);
      expect(p.sortie.motifs.flatMap((m) => m.aCompleter).some((e) => e.cible === cible)).toBe(true);
    }
    const hosp = plan(peau({ ...DHBNN, 'peau.hospitalisation': 'inconnu' }));
    expect(hosp.donneesManquantes.find((m) => /hospitalisation/.test(m.champ))?.cible).toBe('details.peau.hospitalisation');
  });

  test('furoncle → abcès : la réponse « furoncle compliqué » est effacée', () => {
    const d = peau({ 'peau.forme': 'furoncle', 'peau.furoncle_complique': 'oui' });
    nettoyerDossier(d);
    d.details = { ...d.details, 'peau.forme': 'abces' };
    nettoyerDossier(d);
    expect(d.details?.['peau.furoncle_complique']).toBeUndefined();
  });
});
