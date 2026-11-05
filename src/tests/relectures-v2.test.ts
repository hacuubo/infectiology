/**
 * Non-régression des constats des relectures v2 (docs/relectures/v2-*.md). Patients fictifs.
 */
import { decider } from '../engine/decider';
import { clonerDossier, nettoyerDossier, pertinenceClinique, type Dossier } from '../engine/etat';
import { lireAntibiogramme, statutMeticilline } from '../clinical/rules/outils';
import type { Prelevement } from '../clinical/types';
import { CAS_ECBU_AVANT_GESTE, CAS_ECBU_C3G_R, CAS_ECBU_COLONISATION, CAS_ECBU_SONDE, CAS_SCN_UN_FLACON, urine } from './cas-fictifs';

const plan = (d: Dossier) => {
  const c = clonerDossier(d);
  nettoyerDossier(c);
  return decider(c, { maintenant: new Date('2026-11-05T10:00:00Z') });
};
const avec = (d: Dossier, fn: (x: Dossier) => void) => {
  const c = clonerDossier(d);
  fn(c);
  return c;
};
const pyelonephrite = (x: Dossier) => {
  x.entree = 'syndrome';
  x.syndrome = 'urinaire';
  x.patient.sexe = 'femme';
  x.patient.age = 72;
  x.patient.grossesse = 'non';
  x.patient.contexte = 'communautaire';
  x.patient.gravite = 'stable';
  x.patient.materielUrinaire = 'aucun';
  x.patient.antecedentsMicro = [];
};

describe('Relecteur 1 — bloquants', () => {
  test('B1 : un SCN sur une seule série ne retire pas le traitement d\'une pyélonéphrite déclarée', () => {
    const p = plan(avec(CAS_SCN_UN_FLACON, pyelonephrite));
    expect(p.indication?.decision).toBe('traiter');
    expect(p.options.length).toBeGreaterThan(0);
    expect(p.indicationsSecondaires?.some((i) => i.decision === 'attendre_resultat' && i.regleId === 'R-BACTERIEMIE-SCN')).toBe(true);
  });

  test('B1 : une plaie colonisée ne retire pas le traitement d\'une pyélonéphrite déclarée', () => {
    const d = avec(CAS_SCN_UN_FLACON, (x) => {
      pyelonephrite(x);
      x.prelevements = [{ ...urine({ organisme: 'staphylococcus_aureus' }), id: 'plaie', type: 'superficiel', urine: undefined }];
      x.clinique.signesInfectionLocale = 'non';
    });
    const p = plan(d);
    expect(p.indication?.decision).toBe('traiter');
    expect(p.situation.id).not.toBe('plaie-colonisee');
    expect(p.indicationsSecondaires?.some((i) => i.decision === 'ne_pas_traiter')).toBe(true);
  });

  test('B2 : sonde et signes urinaires isolés : conclusion sans question invisible', () => {
    const d = avec(CAS_ECBU_SONDE, (x) => (x.clinique.signesUrinaires = 'nouveaux'));
    const p = plan(d);
    expect(p.indication?.decision).toBe('informations_insuffisantes');
    expect(p.indication?.questions).toEqual([]);
    // Toute question posée par l'évaluation doit être affichée dans l'interface.
    const avecFievre = avec(CAS_ECBU_SONDE, (x) => (x.clinique.fievre = 'oui'));
    expect(plan(avecFievre).indication?.questions.join(' ')).toMatch(/autre foyer/);
    expect(pertinenceClinique(avecFievre).autreFoyer).toBe(true);
  });
});

describe('Relecteur 1 — majeurs', () => {
  test('M1 : ECBU par collecteur avec une clinique inconnue : pas de conclusion « sans symptôme »', () => {
    const d = avec(CAS_ECBU_COLONISATION, (x) => {
      x.clinique.signesUrinaires = 'inconnu';
      x.clinique.fievre = 'inconnu';
      x.prelevements[0].urine = { motif: 'inconnu', recueil: 'collecteur', nbEspeces: 'une' };
    });
    expect(plan(d).indication?.decision).toBe('informations_insuffisantes');
  });

  test('M1 : prélèvement contaminé chez une femme enceinte : pas de « ne pas traiter »', () => {
    const d = avec(CAS_ECBU_COLONISATION, (x) => {
      x.patient.age = 28;
      x.patient.grossesse = 'oui';
      x.prelevements[0].urine = { motif: 'depistage_grossesse', recueil: 'mi_jet', nbEspeces: 'trois_ou_plus' };
    });
    expect(plan(d).indication?.decision).not.toBe('ne_pas_traiter');
  });

  test('M2 : sur sonde, des signes urinaires inconnus ne sont pas lus comme absents', () => {
    const d = avec(CAS_ECBU_SONDE, (x) => (x.clinique.signesUrinaires = 'inconnu'));
    expect(plan(d).indication?.decision).toBe('informations_insuffisantes');
  });

  test('M3 : sexe inconnu : le sexe est demandé, pas la fièvre déjà renseignée', () => {
    const d = avec(CAS_ECBU_COLONISATION, (x) => {
      x.patient.sexe = 'inconnu';
      x.clinique.signesUrinaires = 'nouveaux';
      x.clinique.fievre = 'non';
    });
    const q = plan(d).indication?.questions.join(' ') ?? '';
    expect(q).toMatch(/Sexe/);
    expect(q).not.toMatch(/Fièvre/);
  });

  test('M4 : une réponse masquée est effacée ; les antibiogrammes des autres isolats suivent le stade', () => {
    const d = clonerDossier(CAS_ECBU_COLONISATION);
    d.clinique.autreFoyer = 'identifie';
    d.clinique.fievre = 'non';
    nettoyerDossier(d);
    expect(d.clinique.autreFoyer).toBe('non_recherche');
    const e = clonerDossier(CAS_ECBU_C3G_R);
    e.prelevements[0].isolatsSupplementaires = [{ id: 'iso-2', organisme: 'enterococcus_faecalis', antibiogramme: [{ dci: 'amoxicilline', categorie: 'S' }], antibiogrammePour: 'enterococcus_faecalis' }];
    e.prelevements[0].stade = 'identification';
    nettoyerDossier(e);
    expect(e.prelevements[0].isolatsSupplementaires![0].antibiogramme).toBeUndefined();
  });

  test('M6 : après « ne pas traiter », la fiche ne garde pas les éléments du traitement', () => {
    const p = plan(CAS_ECBU_COLONISATION);
    expect(p.reevaluation).toHaveLength(0);
    expect(p.frise).toHaveLength(0);
    expect(p.donneesManquantes.some((m) => m.impact === 'bloque_dose')).toBe(false);
  });

  test('M8 : préciser l\'identification (entérobactérie → E. coli) conserve l\'antibiogramme', () => {
    const d = clonerDossier(CAS_ECBU_C3G_R);
    d.prelevements[0].organisme = 'enterobacterie_non_identifiee';
    d.prelevements[0].antibiogrammePour = 'enterobacterie_non_identifiee';
    d.prelevements[0].organisme = 'escherichia_coli';
    const inv = nettoyerDossier(d);
    expect(d.prelevements[0].antibiogramme?.length).toBeGreaterThan(0);
    expect(inv.some((i) => /antibiogramme/.test(i.champ))).toBe(false);
  });
});

describe('Relecteur 2 — corrections prioritaires', () => {
  const staph = (antibiogramme: Prelevement['antibiogramme'], phenotypes?: Prelevement['phenotypes']) => lireAntibiogramme({ organisme: 'staphylococcus_aureus', antibiogramme, phenotypes });

  test('P1-1 : céfoxitine R prime ; discordance céfoxitine / oxacilline → inconnu ; forçage des bêta-lactamines sur céfoxitine R', () => {
    expect(statutMeticilline(staph([{ dci: 'cefoxitine', categorie: 'R' }]))).toBe('R');
    expect(statutMeticilline(staph([{ dci: 'oxacilline', categorie: 'S' }, { dci: 'cefoxitine', categorie: 'R' }]))).toBeUndefined();
    expect(staph([{ dci: 'cefoxitine', categorie: 'R' }, { dci: 'cefazoline', categorie: 'S' }]).sir('cefazoline')).toBe('R');
    expect(statutMeticilline(staph([{ dci: 'cefoxitine', categorie: 'I' }]))).toBeUndefined();
  });

  test('P1-2 : ECBU contaminé chez un patient fébrile : refaire l\'ECBU maintenant puis conduite habituelle (IUAS R.35)', () => {
    const d = avec(CAS_ECBU_COLONISATION, (x) => {
      x.clinique.fievre = 'oui';
      x.clinique.signesUrinaires = 'nouveaux';
      x.prelevements[0].urine = { motif: 'signes_urinaires', recueil: 'mi_jet', nbEspeces: 'trois_ou_plus' };
    });
    const p = plan(d);
    expect(p.indication?.decision).toBe('traiter');
    expect(p.indication?.actions[0]).toMatch(/Refaire un ECBU/);
    expect(p.indication?.sources.some((s) => /R\.35/.test(s.repere ?? ''))).toBe(true);
  });

  test('P1-2 : ECBU contaminé avant un geste à risque : pas de conclusion (AFU, pas de consensus)', () => {
    const d = avec(CAS_ECBU_AVANT_GESTE, (x) => (x.prelevements[0].urine = { motif: 'avant_geste_urologique', recueil: 'mi_jet', nbEspeces: 'trois_ou_plus' }));
    expect(plan(d).indication?.decision).toBe('informations_insuffisantes');
  });

  test('P1-3 : grossesse : traitement seulement si l\'ECBU est monomicrobien ; streptocoque B → per-partum', () => {
    const deux = avec(CAS_ECBU_COLONISATION, (x) => {
      x.patient.age = 30;
      x.patient.grossesse = 'oui';
      x.prelevements[0].urine = { motif: 'depistage_grossesse', recueil: 'mi_jet', nbEspeces: 'deux' };
    });
    expect(plan(deux).indication?.decision).toBe('attendre_resultat');
    const sgb = avec(deux, (x) => {
      x.prelevements[0].organisme = 'streptococcus_agalactiae';
      x.prelevements[0].antibiogramme = undefined;
      x.prelevements[0].antibiogrammePour = undefined;
      x.prelevements[0].urine = { motif: 'depistage_grossesse', recueil: 'mi_jet', nbEspeces: 'une' };
    });
    expect(plan(sgb).indication?.actions.join(' ')).toMatch(/per-partum/);
  });

  test('P1-4 : sepsis avec fièvre sans signe urinaire : foyer urinaire non présumé (spectre urinaire et non urinaire)', () => {
    const d = avec(CAS_ECBU_COLONISATION, (x) => {
      x.patient.gravite = 'sepsis';
      x.clinique.fievre = 'oui';
      x.clinique.autreFoyer = 'recherche_negative';
    });
    const p = plan(d);
    expect(p.indication).toMatchObject({ decision: 'urgence', qualification: 'indeterminee' });
    expect(p.regles.some((r) => r.id === 'R-IU-FEBRILE')).toBe(false);
  });

  test('P1-4 : fièvre sans sepsis ni foyer : aucune source ne tranche, avis (brouillon)', () => {
    const d = avec(CAS_ECBU_COLONISATION, (x) => {
      x.clinique.fievre = 'oui';
      x.clinique.autreFoyer = 'recherche_negative';
    });
    const i = plan(d).indication!;
    expect(i.decision).toBe('informations_insuffisantes');
    expect(i.statut).toBe('brouillon');
  });

  test('P1-5 : un céfotaxime R n\'est pas masqué par une ceftriaxone S', () => {
    const d = avec(CAS_ECBU_C3G_R, (x) => {
      x.prelevements[0].antibiogramme = [{ dci: 'cefotaxime', categorie: 'R' }, { dci: 'ceftriaxone', categorie: 'S' }, { dci: 'temocilline', categorie: 'S' }];
    });
    const p = plan(d);
    expect(p.options.flatMap((o) => o.prescriptions).some((x) => x.moleculeId === 'ceftriaxone')).toBe(false);
    expect(p.microbiologie[0].incoherences.some((x) => /discordants entre C3G/.test(x.texte))).toBe(true);
  });

  test('P2 : NLPC : durée préopératoire non définie ; condition « ECBU de moins de 10 jours »', () => {
    const p = plan(avec(CAS_ECBU_AVANT_GESTE, (x) => (x.clinique.gesteUrologique = 'nlpc')));
    expect(p.indication?.actions[0]).toMatch(/durée préopératoire non définie/);
    expect(p.indication?.conditions.join(' ')).toMatch(/10 jours/);
  });

  test('P2 : céfoxitine pour Proteus BLSE : option conditionnelle en brouillon seulement', () => {
    const d = avec(CAS_ECBU_C3G_R, (x) => {
      x.prelevements[0].organisme = 'proteus_mirabilis';
      x.prelevements[0].antibiogrammePour = 'proteus_mirabilis';
      x.prelevements[0].phenotypes = { BLSE: 'present' };
      x.prelevements[0].antibiogramme = [{ dci: 'cefoxitine', categorie: 'S' }];
    });
    const o = plan(d).options.find((x) => x.prescriptions.some((p) => p.moleculeId === 'cefoxitine'));
    expect(o?.rang).toBe('conditionnelle');
    expect(o?.statut).toBe('brouillon');
  });
});
