/**
 * Décision « traiter / ne pas traiter » et antibiogramme guidé.
 * Résultats attendus établis à partir des sources (docs/sources/recherche-indication.md,
 * docs/sources/recherche-antibiogramme-guide.md). Patients fictifs.
 */
import { decider } from '../engine/decider';
import { clonerDossier, nettoyerDossier, nouvelIsolat, type Dossier } from '../engine/etat';
import { construireContexte } from '../engine/contexte';
import { contexteGuide } from '../clinical/microbiologie/analyse';
import { guideAntibiogramme } from '../clinical/microbiologie/guide';
import { lireAntibiogramme } from '../clinical/rules/outils';
import type { Prelevement } from '../clinical/types';
import {
  CAS_ECBU_AVANT_GESTE,
  CAS_ECBU_C3G_R,
  CAS_ECBU_COLONISATION,
  CAS_ECBU_SONDE,
  CAS_ECBU_SUJET_AGE,
  CAS_SAB_SASM,
  CAS_SCN_DEUX_SERIES_MATERIEL,
  CAS_SCN_UN_FLACON,
  patiente72,
  urine,
} from './cas-fictifs';

const plan = (d: Dossier) => {
  const c = clonerDossier(d);
  nettoyerDossier(c);
  return decider(c, { maintenant: new Date('2026-11-05T10:00:00Z') });
};
const molecules = (d: Dossier) =>
  plan(d)
    .options.flatMap((o) => o.prescriptions)
    .map((p) => p.moleculeId);
const questions = (d: Dossier, prl: Prelevement = d.prelevements[0]) => {
  const ctx = construireContexte(d);
  return guideAntibiogramme(prl, contexteGuide(ctx, prl, prl));
};
const ids = (g: ReturnType<typeof questions>) => g.essentielles.map((q) => q.id);
const avec = (d: Dossier, fn: (x: Dossier) => void) => {
  const c = clonerDossier(d);
  fn(c);
  return c;
};

describe('ECBU positif : traiter ou ne pas traiter', () => {
  test('sans symptôme et sans exception : pas d\'antibiothérapie, conclusion complète et sourcée', () => {
    const p = plan(CAS_ECBU_COLONISATION);
    expect(p.indication?.decision).toBe('ne_pas_traiter');
    expect(p.indication?.qualification).toBe('colonisation');
    expect(p.options).toHaveLength(0);
    expect(p.indication?.raison).toMatch(/colonisation/);
    expect(p.indication?.conditions.length).toBeGreaterThan(0);
    expect(p.indication?.exceptions.join(' ')).toMatch(/Geste urologique/);
    expect(p.indication?.reconsiderer.join(' ')).toMatch(/fièvre/);
    expect(p.indication?.sources.map((s) => s.source)).toEqual(expect.arrayContaining(['SPILF-2015-IU', 'IDSA-2019-bacteriurie-asymptomatique', 'AFU-2026-ECBU-geste']));
    // SPILF 2026 ne vise que l'homme (IU masculine communautaire) : non citée pour cette patiente.
    expect(p.indication?.sources.some((s) => s.source === 'SPILF-2026-IUM')).toBe(false);
  });

  test('symptômes compatibles et fièvre : infection urinaire, propositions de traitement', () => {
    const d = avec(CAS_ECBU_COLONISATION, (x) => {
      x.clinique.signesUrinaires = 'nouveaux';
      x.clinique.fievre = 'oui';
    });
    const p = plan(d);
    expect(p.indication?.decision).toBe('traiter');
    expect(p.indication?.qualification).toBe('infection');
    expect(p.regles.some((r) => r.id === 'R-IU-FEBRILE')).toBe(true);
    expect(p.options.some((o) => o.rang === 'premiere_ligne')).toBe(true);
  });

  test('signes urinaires sans fièvre chez la femme : cystite, sans schéma de pyélonéphrite', () => {
    const d = avec(CAS_ECBU_COLONISATION, (x) => {
      x.clinique.signesUrinaires = 'nouveaux';
      x.clinique.fievre = 'non';
    });
    const p = plan(d);
    expect(p.situation.id).toBe('cystite');
    expect(p.regles.some((r) => r.id === 'R-IU-FEBRILE')).toBe(false);
    expect(p.options).toHaveLength(0);
  });

  test('personne âgée confuse, sans fièvre ni signe urinaire : pas d\'antibiotique, autre cause à rechercher', () => {
    const p = plan(CAS_ECBU_SUJET_AGE);
    expect(p.indication?.decision).toBe('ne_pas_traiter');
    expect(p.indication?.actions.join(' ')).toMatch(/autre cause/);
    expect(p.indication?.sources.some((s) => s.source === 'IDSA-2019-bacteriurie-asymptomatique' && /question V/.test(s.repere ?? ''))).toBe(true);
    expect(p.options).toHaveLength(0);
  });

  test('sonde à demeure sans fièvre ni signe général : colonisation, pas de traitement', () => {
    const p = plan(CAS_ECBU_SONDE);
    expect(p.indication?.decision).toBe('ne_pas_traiter');
    expect(p.indication?.raison).toMatch(/leucocyturie/);
    expect(p.options).toHaveLength(0);
  });

  test('sonde avec fièvre, autre foyer non recherché : informations insuffisantes', () => {
    const d = avec(CAS_ECBU_SONDE, (x) => (x.clinique.fievre = 'oui'));
    const p = plan(d);
    expect(p.indication?.decision).toBe('informations_insuffisantes');
    expect(p.indication?.questions.join(' ')).toMatch(/autre foyer/);
    expect(p.options).toHaveLength(0);
  });

  test('grossesse : la colonisation se traite selon l\'antibiogramme (amoxicilline si sensible)', () => {
    const d = avec(CAS_ECBU_COLONISATION, (x) => {
      x.patient.age = 30;
      x.patient.grossesse = 'oui';
    });
    const p = plan(d);
    expect(p.indication?.decision).toBe('traiter');
    expect(p.situation.id).toBe('colonisation-gravidique');
    expect(p.options.map((o) => o.id)).toEqual(['gravidique-amox']);
    expect(p.indication?.surveillance.join(' ')).toMatch(/8 à 10 jours/);
  });

  test('grossesse inconnue chez une femme jeune : l\'exception est vérifiée avant de conclure', () => {
    const d = avec(CAS_ECBU_COLONISATION, (x) => {
      x.patient.age = 30;
      x.patient.grossesse = 'inconnu';
    });
    expect(plan(d).indication?.decision).toBe('informations_insuffisantes');
  });

  test('gestes urologiques non équivalents : urétéroscopie → traiter ; cystoscopie → ne pas traiter ; non renseigné → informations insuffisantes', () => {
    expect(plan(CAS_ECBU_AVANT_GESTE).indication?.decision).toBe('traiter');
    expect(plan(CAS_ECBU_AVANT_GESTE).indication?.actions.join(' ')).toMatch(/48 h avant le geste/);
    expect(plan(avec(CAS_ECBU_AVANT_GESTE, (x) => (x.clinique.gesteUrologique = 'cystoscopie'))).indication?.decision).toBe('ne_pas_traiter');
    expect(plan(avec(CAS_ECBU_AVANT_GESTE, (x) => (x.clinique.gesteUrologique = 'inconnu'))).indication?.decision).toBe('informations_insuffisantes');
    expect(plan(avec(CAS_ECBU_AVANT_GESTE, (x) => (x.clinique.gesteUrologique = 'sans_recommandation'))).indication?.decision).toBe('informations_insuffisantes');
    // Le traitement avant geste ne propose pas une posologie de pyélonéphrite.
    expect(plan(CAS_ECBU_AVANT_GESTE).options).toHaveLength(0);
  });

  test('ECBU à trois espèces ou plus : contamination possible ; asymptomatique → ne pas traiter, symptomatique → refaire l\'ECBU', () => {
    const asympt = avec(CAS_ECBU_COLONISATION, (x) => (x.prelevements[0].urine = { motif: 'systematique', recueil: 'mi_jet', nbEspeces: 'trois_ou_plus' }));
    expect(plan(asympt).indication).toMatchObject({ decision: 'ne_pas_traiter', qualification: 'contamination_possible' });
    const sympt = avec(asympt, (x) => (x.clinique.signesUrinaires = 'nouveaux'));
    const p = plan(sympt);
    expect(p.indication?.decision).toBe('attendre_resultat');
    expect(p.controles.some((c) => c.id === 'ctl-ecbu-refaire')).toBe(true);
    expect(p.options).toHaveLength(0);
  });

  test('foyer urinaire déclaré mais aucun signe clinique : pas de proposition automatique', () => {
    const d = avec(CAS_ECBU_COLONISATION, (x) => (x.prelevements[0].foyer = 'urinaire'));
    const p = plan(d);
    expect(p.indication?.decision).toBe('informations_insuffisantes');
    expect(p.options).toHaveLength(0);
  });

  test('signes urinaires inconnus : la décision n\'est pas prise, la question est posée', () => {
    const d = avec(CAS_ECBU_COLONISATION, (x) => (x.clinique.signesUrinaires = 'inconnu'));
    const p = plan(d);
    expect(p.indication?.decision).toBe('informations_insuffisantes');
    expect(p.donneesManquantes.some((m) => /Signes urinaires/.test(m.champ) && m.impact === 'bloque_decision')).toBe(true);
  });
});

describe('Urgence et foyer incertain', () => {
  test('sepsis sans foyer ni germe : urgence, antibiothérapie dans l\'heure, avis', () => {
    const d: Dossier = { ...clonerDossier(CAS_ECBU_COLONISATION), entree: 'syndrome', syndrome: 'inconnu', prelevements: [] };
    d.patient.gravite = 'sepsis';
    const p = plan(d);
    expect(p.indication?.decision).toBe('urgence');
    expect(p.indication?.regleId).toBe('R-SEPSIS-FOYER-INCONNU');
    expect(p.urgence.niveau).toBe('immediate');
  });

  test('sepsis avec bactériurie sans signe urinaire : urgence, origine urinaire non présumée', () => {
    const d = avec(CAS_ECBU_COLONISATION, (x) => (x.patient.gravite = 'sepsis'));
    const p = plan(d);
    expect(p.indication).toMatchObject({ decision: 'urgence', qualification: 'indeterminee' });
    expect(p.situation.id).toBe('sepsis-foyer-indetermine');
  });
});

describe('Hémocultures : contamination possible', () => {
  test('SCN dans une seule série, sans matériel : attendre le résultat des nouvelles hémocultures, sans antibiotique', () => {
    const p = plan(CAS_SCN_UN_FLACON);
    expect(p.indication?.decision).toBe('attendre_resultat');
    expect(p.indication?.qualification).toBe('contamination_possible');
    expect(p.options).toHaveLength(0);
  });

  test('SCN dans une seule série avec matériel : même conduite, avis avant de conclure', () => {
    const d = avec(CAS_SCN_UN_FLACON, (x) => {
      x.patient.materielVasculaire = 'picc';
      x.patient.valve = 'prothese_biologique';
    });
    const p = plan(d);
    expect(p.indication?.decision).toBe('attendre_resultat');
    expect(p.indication?.actions.join(' ')).toMatch(/Avis infectiologique/);
  });

  test('SCN dans deux séries avec matériel : bactériémie probable, traitement', () => {
    const p = plan(CAS_SCN_DEUX_SERIES_MATERIEL);
    expect(p.indication?.decision).toBe('traiter');
    expect(p.options.length).toBeGreaterThan(0);
  });

  test('l\'antibiogramme d\'un SCN sur une seule série n\'est pas demandé', () => {
    expect(questions(CAS_SCN_UN_FLACON).essentielles).toHaveLength(0);
  });
});

describe('S. aureus : statut vis-à-vis de la méticilline', () => {
  const sab = (fn: (p: Prelevement) => void) =>
    avec(CAS_SAB_SASM, (x) => {
      const p = x.prelevements[0];
      p.stade = 'antibiogramme';
      p.antibiogramme = undefined;
      p.phenotypes = undefined;
      p.antibiogrammePour = 'staphylococcus_aureus';
      fn(p);
    });

  test('SAMS rapporté : bêta-lactamine anti-staphylococcique ; la céfoxitine n\'est plus demandée', () => {
    const d = sab((p) => (p.phenotypes = { SARM: 'absent' }));
    expect(molecules(d)).toEqual(expect.arrayContaining(['cefazoline']));
    expect(molecules(d)).not.toContain('vancomycine');
    expect(ids(questions(d))).not.toContain('mol-cefoxitine');
  });

  test('SARM rapporté : vancomycine ou daptomycine, et les sensibilités utiles sont demandées', () => {
    const d = sab((p) => (p.phenotypes = { SARM: 'present' }));
    expect(molecules(d)).toContain('vancomycine');
    expect(molecules(d)).not.toContain('cefazoline');
    expect(ids(questions(d))).toEqual(expect.arrayContaining(['mol-vancomycine', 'mol-daptomycine']));
  });

  test('statut inconnu : la céfoxitine est demandée, « non rapporté » n\'est pas lu comme SAMS', () => {
    const d = sab((p) => (p.phenotypes = { SARM: 'non_rapporte' }));
    expect(ids(questions(d))).toContain('mol-cefoxitine');
    const p = plan(d);
    expect(p.options.find((o) => o.rang === 'premiere_ligne' && o.prescriptions.some((x) => x.moleculeId === 'cefazoline') && o.type === 'documente')).toBeUndefined();
  });

  test('les règles de S. aureus ne sont pas appliquées aux autres staphylocoques', () => {
    const p = plan(CAS_SCN_DEUX_SERIES_MATERIEL);
    expect(p.regles.some((r) => r.id === 'R-BACTERIEMIE-S-AUREUS')).toBe(false);
  });

  test('statut méticilline contradictoire : signalé sans arbitrage', () => {
    const d = sab((p) => {
      p.phenotypes = { SARM: 'present' };
      p.antibiogramme = [{ dci: 'cefoxitine', categorie: 'S' }];
    });
    expect(plan(d).microbiologie[0].incoherences.some((x) => /contradictoires/.test(x.texte))).toBe(true);
  });
});

describe('E. coli et autres entérobactéries', () => {
  const ecoliPNA = (antibiogramme: Prelevement['antibiogramme'], phenotypes?: Prelevement['phenotypes']) =>
    avec(CAS_ECBU_C3G_R, (x) => {
      x.prelevements[0].antibiogramme = antibiogramme;
      x.prelevements[0].phenotypes = phenotypes;
    });

  test('BLSE documentée : C3G lues R, céfoxitine envisageable (E. coli, foyer urinaire)', () => {
    const d = ecoliPNA([{ dci: 'ceftriaxone', categorie: 'S' }, { dci: 'cefoxitine', categorie: 'S' }, { dci: 'temocilline', categorie: 'S' }], { BLSE: 'present' });
    const m = molecules(d);
    expect(m).not.toContain('ceftriaxone');
    expect(m).toContain('cefoxitine');
    expect(plan(d).microbiologie[0].incoherences.some((x) => /BLSE rapportée/.test(x.texte))).toBe(true);
  });

  test('BLSE absente et C3G sensible : C3G proposée, la question BLSE n\'est plus posée', () => {
    const d = ecoliPNA([{ dci: 'amoxicilline', categorie: 'R' }, { dci: 'ceftriaxone', categorie: 'S' }], { BLSE: 'absent' });
    expect(molecules(d)).toContain('ceftriaxone');
    const d2 = ecoliPNA([{ dci: 'amoxicilline', categorie: 'R' }, { dci: 'ceftriaxone', categorie: 'S' }]);
    expect(ids(questions(d2))).not.toContain('ph-BLSE');
  });

  test('BLSE inconnue avec C3G non renseignée : la question est posée et rien n\'est supposé', () => {
    const d = ecoliPNA([{ dci: 'amoxicilline', categorie: 'R' }]);
    expect(ids(questions(d))).toEqual(expect.arrayContaining(['ph-BLSE', 'mol-ceftriaxone']));
    expect(molecules(d)).not.toContain('cefoxitine');
  });

  test('résistance aux C3G sans mécanisme rapporté : pas d\'inférence de BLSE (céfoxitine non proposée)', () => {
    const p = plan(CAS_ECBU_C3G_R);
    expect(p.options.flatMap((o) => o.prescriptions).some((x) => x.moleculeId === 'cefoxitine')).toBe(false);
    expect(p.urgence.alertes.some((a) => /ne prouve pas une BLSE/.test(a.texte))).toBe(true);
    expect(p.microbiologie[0].incoherences.some((x) => /ne permet pas, à elle seule, d'affirmer une BLSE/.test(x.texte))).toBe(true);
    expect(ids(questions(CAS_ECBU_C3G_R))).toContain('ph-ampc');
  });

  test('résultat I : forte posologie, expliquée dans la synthèse', () => {
    const d = ecoliPNA([{ dci: 'amoxicilline', categorie: 'R' }, { dci: 'ceftriaxone', categorie: 'I' }], { BLSE: 'absent' });
    const p = plan(d);
    expect(p.options.flatMap((o) => o.prescriptions).find((x) => x.moleculeId === 'ceftriaxone')?.regimenId).toBe('ceftriaxone-2g12h');
    expect(p.microbiologie[0].determinants.some((x) => /sensible à forte posologie/.test(x.texte))).toBe(true);
  });

  test('antibiogramme incomplet : ce qui manque est listé avec son utilité', () => {
    const d = ecoliPNA([{ dci: 'amoxicilline', categorie: 'R' }]);
    const syn = plan(d).microbiologie[0];
    expect(syn.inconnues.some((x) => /Ceftriaxone/.test(x.texte))).toBe(true);
    expect(syn.inconnues.every((x) => x.pourquoi.length > 0)).toBe(true);
  });

  test('molécule sensible mais inadaptée au foyer : témocilline hors foyer urinaire', () => {
    const d: Dossier = clonerDossier(CAS_ECBU_C3G_R);
    d.prelevements = [{ ...d.prelevements[0], id: 'hc-x', type: 'hemoculture', hemoc: { origine: 'peripherique', persistance: 'non_controlees', nbSeriesPrelevees: 2, nbSeriesPositives: 2 }, foyer: 'digestif', foyerStatut: 'suspecte', urine: undefined }];
    const p = plan(d);
    expect(p.microbiologie[0].sensiblesNonRetenues.some((x) => x.dci === 'Témocilline' && /urinaire/.test(x.raison))).toBe(true);
    expect(p.options.flatMap((o) => o.prescriptions).some((x) => x.moleculeId === 'temocilline')).toBe(false);
  });

  test('résistance attendue rendue sensible (Klebsiella et amoxicilline) : lue R, signalée, jamais proposée', () => {
    const d = ecoliPNA([{ dci: 'amoxicilline', categorie: 'S' }, { dci: 'ceftriaxone', categorie: 'S' }], { BLSE: 'absent' });
    d.prelevements[0].organisme = 'klebsiella_pneumoniae';
    d.prelevements[0].antibiogrammePour = 'klebsiella_pneumoniae';
    const p = plan(d);
    expect(p.options.flatMap((o) => o.prescriptions).some((x) => x.moleculeId === 'amoxicilline')).toBe(false);
    expect(p.microbiologie[0].incoherences.some((x) => /résistance est attendue/.test(x.texte))).toBe(true);
  });

  test('groupe 3 (E. cloacae) : céfépime demandé, C3G et pipéracilline-tazobactam non demandés', () => {
    const d = avec(CAS_ECBU_C3G_R, (x) => {
      x.prelevements[0].organisme = 'enterobacter_cloacae';
      x.prelevements[0].antibiogramme = undefined;
      x.prelevements[0].antibiogrammePour = undefined;
    });
    const q = ids(questions(d));
    expect(q).toContain('mol-cefepime');
    expect(q).not.toContain('mol-ceftriaxone');
    expect(q).not.toContain('mol-piperacilline_tazobactam');
  });
});

describe('Cohérence des données saisies', () => {
  test('changer le germe après saisie des sensibilités efface l\'antibiogramme de l\'ancien germe', () => {
    const d = clonerDossier(CAS_ECBU_C3G_R);
    d.prelevements[0].organisme = 'proteus_mirabilis';
    const inv = nettoyerDossier(d);
    expect(d.prelevements[0].antibiogramme).toBeUndefined();
    expect(inv.some((i) => /Le germe a changé/.test(i.raison))).toBe(true);
  });

  test('plusieurs isolats : chaque antibiogramme reste rattaché à son germe ; hors périmètre signalé', () => {
    const d = clonerDossier(CAS_ECBU_C3G_R);
    const iso = { ...nouvelIsolat(), organisme: 'enterococcus_faecalis' as const, antibiogramme: [{ dci: 'amoxicilline', categorie: 'S' as const }], antibiogrammePour: 'enterococcus_faecalis' as const };
    d.prelevements[0].isolatsSupplementaires = [iso];
    d.prelevements[0].urine = { motif: 'signes_urinaires', recueil: 'mi_jet', nbEspeces: 'deux' };
    const p = plan(d);
    expect(p.microbiologie).toHaveLength(2);
    expect(p.microbiologie[1].germe).toMatch(/faecalis/);
    expect(p.microbiologie[1].determinants.some((x) => /Amoxicilline : S/.test(x.texte))).toBe(true);
    expect(p.microbiologie[0].determinants.some((x) => /Amoxicilline : S/.test(x.texte))).toBe(false);
    expect(p.urgence.alertes.some((a) => /polymicrobien/.test(a.texte))).toBe(true);
    expect(p.situation.couverture).not.toBe('couverte');
  });

  test('« inconnu » n\'est jamais lu comme « non », « sensible » ou « absent »', () => {
    // Non testé (NT) : la molécule reste inconnue.
    const lecture = lireAntibiogramme({ organisme: 'escherichia_coli', antibiogramme: [{ dci: 'amoxicilline', categorie: 'NT' }], phenotypes: { BLSE: 'non_rapporte' } });
    expect(lecture.sir('amoxicilline')).toBeUndefined();
    expect(lecture.meca('BLSE')).toBe(false);
    expect(lecture.etat('BLSE')).toBe('non_rapporte');
    // Fièvre inconnue : pas de conclusion « asymptomatique ».
    const d = avec(CAS_ECBU_COLONISATION, (x) => (x.clinique.fievre = 'inconnu'));
    expect(plan(d).indication?.decision).toBe('informations_insuffisantes');
    // Grossesse inconnue chez une femme jeune : pas de conclusion « pas de grossesse ».
    const g = avec(CAS_ECBU_COLONISATION, (x) => {
      x.patient.age = 25;
      x.patient.grossesse = 'inconnu';
    });
    expect(plan(g).indication?.decision).not.toBe('ne_pas_traiter');
  });

  test('aucune décision de non-traitement ne s\'accompagne d\'une proposition d\'antibiotique', () => {
    const cas = [CAS_ECBU_COLONISATION, CAS_ECBU_SUJET_AGE, CAS_ECBU_SONDE, CAS_SCN_UN_FLACON, avec(CAS_ECBU_COLONISATION, (x) => (x.clinique.signesUrinaires = 'inconnu'))];
    for (const c of cas) {
      const p = plan(c);
      expect(['ne_pas_traiter', 'attendre_resultat', 'informations_insuffisantes']).toContain(p.indication?.decision);
      expect(p.options).toHaveLength(0);
    }
  });

  test('prélèvement superficiel positif sans signe d\'infection : pas d\'antibiothérapie', () => {
    const d: Dossier = { ...clonerDossier(CAS_ECBU_COLONISATION), prelevements: [{ ...urine({ organisme: 'staphylococcus_aureus' }), id: 'plaie', type: 'superficiel', urine: undefined }] };
    d.patient = { ...patiente72 };
    d.clinique.signesInfectionLocale = 'non';
    const p = plan(d);
    expect(p.indication?.decision).toBe('ne_pas_traiter');
    expect(p.indication?.sources.some((s) => s.source === 'IWGDF-IDSA-2023-pied-diabetique')).toBe(true);
  });
});
