/**
 * Tests d'acceptation. Les résultats attendus sont établis à partir des sources
 * (repères en commentaire), indépendamment du code testé.
 */
import { decider } from '../engine/decider';
import { clonerDossier, nettoyerDossier, type Dossier } from '../engine/etat';
import { SOURCES_PAR_ID } from '../clinical/sources';
import type { Plan, SpecSTP } from '../clinical/types';
import {
  CAS_BGN_90,
  CAS_BGN_90_URINAIRE,
  CAS_BGN_90_VALVE,
  CAS_BLSE_AMIKACINE,
  CAS_ECOLI_I,
  CAS_EI_FAECALIS,
  CAS_SAB_ALLERGIE_IMMEDIATE,
  CAS_SAB_ALLERGIE_SEVERE,
  CAS_SAB_PERSISTANT,
  CAS_SAB_SASM,
  CAS_SARM_HEMODIALYSE,
  CAS_SCN_DEUX_SERIES_MATERIEL,
  CAS_SCN_UN_FLACON,
} from './cas-fictifs';

const MAINTENANT = new Date('2026-11-04T10:00:00Z');
function plan(d: Dossier, mode = false): Plan {
  const c = clonerDossier(d);
  nettoyerDossier(c);
  return decider(c, { maintenant: MAINTENANT, modeUsageClinique: mode });
}
const premiere = (p: Plan) => p.options.filter((o) => o.rang === 'premiere_ligne');
const dcis = (p: Plan) => premiere(p).flatMap((o) => o.prescriptions.map((x) => x.moleculeId));
const manque = (p: Plan, motif: RegExp) => p.donneesManquantes.some((m) => motif.test(m.champ));

describe('90 ans, fièvre, insuffisance rénale, bactériémie à BGN', () => {
  test('données incomplètes : questions nécessaires et options conditionnelles, pas de prescription définitive', () => {
    const p = plan(CAS_BGN_90);
    expect(premiere(p)).toHaveLength(0);
    expect(p.options.length).toBeGreaterThan(0);
    expect(p.options.every((o) => o.rang === 'conditionnelle')).toBe(true);
    for (const m of [/gravité/, /foyer/, /contexte/, /allergies/, /matériel/]) expect(manque(p, m)).toBe(true);
    // Aucune recommandation dédiée au probabiliste des BGN sans foyer : options en brouillon
    expect(p.options.every((o) => o.statut === 'brouillon')).toBe(true);
    expect(p.situation.couverture).toBe('partielle');
  });

  test('foyer urinaire + antibiogramme + sepsis : C3G documentée, pas de carbapénème, relais oraux, uroscanner, sans hémoculture de contrôle systématique', () => {
    const p = plan(CAS_BGN_90_URINAIRE);
    // SPILF 2018 p. 336 : C3G injectables privilégiées ; amoxicilline R
    expect(dcis(p)).toEqual(['ceftriaxone']);
    expect(p.options.flatMap((o) => o.prescriptions.map((x) => x.moleculeId))).not.toContain('meropeneme');
    expect(p.options.some((o) => o.id === 'relais-smx')).toBe(true);
    expect(p.options.some((o) => o.id === 'relais-amox')).toBe(false);
    // SPILF 2015 p. 21-23 : uroscanner au plus tard dans les 24 h
    expect(p.controles.find((c) => c.id === 'ctl-iu-uroscanner')?.categorie).toBe('indique');
    // Hémocultures de contrôle non systématiques
    expect(p.controles.find((c) => c.id === 'ctl-iu-hc-controle')?.categorie).toBe('non_systematique');
    // Sepsis : urgence immédiate (SSC 2026)
    expect(p.urgence.niveau).toBe('immediate');
    // IRA : les estimations ne sont pas utilisées pour personnaliser la dose ; la limite est affichée
    const ceftri = premiere(p)[0].prescriptions[0];
    expect(ceftri.adaptations.join(' ')).toMatch(/Adaptation rénale non calculée : fonction rénale instable ou insuffisance rénale aiguë/);
    // Durée : 10 j si évolution rapidement favorable (SPILF 2018) ; bactériémie sans prolongation (SPILF 2015)
    expect(ceftri.duree.texte).toMatch(/10 jours/);
    expect(ceftri.duree.texte).toMatch(/ne modifie ni le choix ni la durée/);
  });

  test('avec prothèse valvulaire : alerte endocardite, ETO conditionnelle, avis spécialisé', () => {
    const p = plan(CAS_BGN_90_VALVE);
    expect(p.controles.some((c) => c.id === 'ctl-valve-eto' && c.categorie === 'conditionnel')).toBe(true);
    expect(p.avisSpecialise.length).toBeGreaterThan(0);
    expect(p.urgence.alertes.some((a) => /endocardite/i.test(a.texte))).toBe(true);
  });
});

describe('Staphylocoques à coagulase négative', () => {
  test('S. epidermidis 1 flacon sans matériel : pas d\'antibiotique d\'emblée, hémocultures à refaire (IDSA 2009 rec. 38)', () => {
    const p = plan(CAS_SCN_UN_FLACON);
    expect(p.options).toHaveLength(0);
    expect(p.controles.some((c) => c.id === 'ctl-scn-repeter' && c.categorie === 'indique')).toBe(true);
    expect(p.situation.libelle).toMatch(/contamination possible/);
  });

  test('S. epidermidis 2 séries avec PICC et prothèse : bactériémie vraie probable, retrait/verrou, avis urgent, molécule en brouillon', () => {
    const p = plan(CAS_SCN_DEUX_SERIES_MATERIEL);
    expect(p.situation.id).toBe('scn-bacteriemie');
    expect(p.avisSpecialise.some((a) => a.urgent)).toBe(true);
    expect(p.gestes.some((g) => /verrou/i.test(g.texte))).toBe(true);
    expect(premiere(p)[0].statut).toBe('brouillon');
    // Délai différentiel ≥ 2 h (IDSA 2009 rec. 19)
    expect(p.urgence.alertes.some((a) => /≥ 2 h/.test(a.texte))).toBe(true);
  });

  test('S. epidermidis : nombre de séries inconnu → donnée bloquante, pas de conclusion automatique', () => {
    const d = clonerDossier(CAS_SCN_UN_FLACON);
    if (d.prelevements[0].hemoc) d.prelevements[0].hemoc.nbSeriesPositives = undefined;
    const p = plan(d);
    expect(manque(p, /séries/)).toBe(true);
    expect(p.options).toHaveLength(0);
  });
});

describe('Bactériémie à S. aureus (IDSA/ESCMID 2026)', () => {
  test('SASM : céfazoline ou cloxacilline, hémocultures à 48 h puis toutes les 24-48 h, ETT systématique, 14 j dès la clairance', () => {
    const p = plan(CAS_SAB_SASM);
    expect(dcis(p)).toEqual(['cefazoline']);
    expect(p.options.some((o) => o.prescriptions.some((x) => x.moleculeId === 'cloxacilline') && o.rang === 'alternative')).toBe(true);
    const hc = p.controles.find((c) => c.id === 'ctl-sab-hc')!;
    expect(hc.categorie).toBe('indique');
    expect(hc.quand.offsetHeures).toBe(48);
    expect(hc.quand.repetition).toMatch(/24-48 h/);
    // Date calculée à partir de la 1re hémoculture positive (03/11 08:00 + 48 h)
    const ev = p.frise.find((e) => e.quoi.startsWith('Hémocultures de contrôle'));
    expect(ev?.dateISO).toBe(new Date('2026-11-05T08:00').toISOString());
    expect(p.controles.find((c) => c.id === 'ctl-sab-ett')?.categorie).toBe('indique');
    const duree = premiere(p)[0].prescriptions[0].duree;
    expect(duree.texte).toMatch(/14 jours/);
    expect(duree.pointDeDepart).toMatch(/hémoculture négative/);
    // Début communautaire = facteur de risque clé (CS1) : ETO indiquée
    expect(p.controles.find((c) => c.id === 'ctl-sab-eto')?.categorie).toBe('indique');
    expect(p.avisSpecialise.some((a) => a.urgent)).toBe(true);
  });

  test('hémocultures persistantes : risque accru, alerte urgente, ETO', () => {
    const p = plan(CAS_SAB_PERSISTANT);
    expect(p.situation.libelle).toMatch(/risque accru/);
    expect(p.urgence.alertes.some((a) => a.niveau === 'urgence' && /toujours positives/.test(a.texte))).toBe(true);
    expect(p.controles.some((c) => c.id === 'ctl-persist-eto')).toBe(true);
  });

  test('hémocultures négativées : la date de négativation devient le point de départ affiché', () => {
    const d = clonerDossier(CAS_SAB_SASM);
    d.prelevements[0].hemoc!.persistance = 'negativees';
    d.prelevements[0].hemoc!.dateNegativationISO = '2026-11-06T08:00';
    const p = plan(d);
    expect(premiere(p)[0].prescriptions[0].duree.texte).toMatch(/06\/11\/2026/);
    expect(manque(p, /hémoculture négative/)).toBe(false);
  });
});

describe('Allergies', () => {
  test('réaction retardée sévère (DRESS) : aucune bêta-lactamine en 1re ligne, daptomycine proposée', () => {
    const p = plan(CAS_SAB_ALLERGIE_SEVERE);
    expect(dcis(p)).toEqual(['daptomycine']);
    expect(p.options.filter((o) => o.prescriptions.some((x) => ['cefazoline', 'cloxacilline'].includes(x.moleculeId))).every((o) => o.rang === 'conditionnelle')).toBe(true);
    expect(p.urgence.alertes.some((a) => /retardée sévère/.test(a.texte))).toBe(true);
  });

  test('réaction immédiate grave (anaphylaxie) : bêta-lactamines contre-indiquées en attente d\'avis allergologique (SPILF 2026)', () => {
    const p = plan(CAS_SAB_ALLERGIE_IMMEDIATE);
    expect(dcis(p)).toEqual(['daptomycine']);
  });

  test('réaction immédiate non grave : pénicillines évitées, céfazoline sous réserve', () => {
    const d = clonerDossier(CAS_SAB_ALLERGIE_IMMEDIATE);
    d.patient.allergies[0].gravite = 'legere';
    const p = plan(d);
    expect(dcis(p)).toEqual(['cefazoline']);
    expect(premiere(p)[0].prescriptions[0].avertissements.join(' ')).toMatch(/évaluation du risque/);
  });
});

describe('Poids, fonction rénale, dialyse', () => {
  test('poids absent : dose fixe calculée, dose pondérale non calculée et signalée', () => {
    const d = clonerDossier(CAS_BGN_90_URINAIRE);
    d.patient.poidsKg = undefined;
    const p = plan(d);
    const ceftri = premiere(p)[0].prescriptions[0];
    expect(ceftri.doseCalculee?.valeurParAdministration).toBe(2);
    const sarm = plan(CAS_SARM_HEMODIALYSE);
    const vanco = premiere(sarm)[0].prescriptions[0];
    expect(vanco.doseCalculee).toBeUndefined();
    expect(vanco.doseAffichee).toMatch(/poids manquant/);
    expect(sarm.donneesManquantes.some((m) => m.champ === 'poids' && m.impact === 'bloque_dose')).toBe(true);
  });

  test('hémodialyse : vancomycine discontinue, dosage pré-dialyse 15-20 mg/L (Rybak 2020 Rec. 14), horaires de séance demandés', () => {
    const p = plan(CAS_SARM_HEMODIALYSE);
    const vanco = premiere(p)[0].prescriptions[0];
    expect(vanco.regimenId).toBe('vancomycine-discontinu');
    expect(vanco.adaptations.join(' ')).toMatch(/pré-dialyse cible 15-20 mg\/L/);
    const pre = vanco.surveillance.find((s) => (s.element as SpecSTP).id === 'vancomycine-predialyse');
    expect(pre).toBeDefined();
    expect(vanco.surveillance.some((s) => (s.element as SpecSTP).id === 'vancomycine-plateau')).toBe(false);
    expect(manque(p, /horaires de dialyse/)).toBe(true);
    expect(vanco.doseAffichee).toMatch(/Dose de référence/);
  });

  test('IRA : aucune estimation ne personnalise la dose du méropénème ; avis et réévaluation quotidienne', () => {
    const p = plan(CAS_BLSE_AMIKACINE);
    const mero = premiere(p)[0].prescriptions.find((x) => x.moleculeId === 'meropeneme')!;
    expect(mero.adaptations.join(' ')).toMatch(/Adaptation rénale non calculée/);
    expect(mero.adaptations.join(' ')).toMatch(/Avis pharmacologique ou néphrologique/);
    expect(mero.adaptations.join(' ')).not.toMatch(/10-25 mL\/min/);
    expect(mero.doseAffichee).toMatch(/Dose de référence/);
  });
});

describe('Catégorie EUCAST I', () => {
  test('C3G rendue I : forte posologie retenue et définition de I rappelée (EUCAST, CA-SFM)', () => {
    const p = plan(CAS_ECOLI_I);
    const o = premiere(p)[0];
    // Forte posologie EUCAST/CA-SFM de la ceftriaxone = 2 g toutes les 12 h (2 g/24 h est la posologie standard)
    expect(o.prescriptions[0].regimenId).toBe('ceftriaxone-2g12h');
    expect(o.libelle).toMatch(/forte posologie/);
    expect(p.urgence.alertes.some((a) => /sensible à forte posologie/.test(a.texte))).toBe(true);
    // Ciprofloxacine R → toutes FQ R (EUCAST expert rule 8)
    expect(p.options.some((x) => x.prescriptions.some((y) => y.moleculeId === 'ciprofloxacine'))).toBe(false);
  });

  test('BLSE : C3G rendue S interprétée R (CA-SFM 2026)', () => {
    const d = clonerDossier(CAS_ECOLI_I);
    d.prelevements[0].phenotypes = { BLSE: 'present' };
    d.prelevements[0].antibiogramme = [{ dci: 'ceftriaxone', categorie: 'S' }, { dci: 'temocilline', categorie: 'I' }, { dci: 'piperacilline_tazobactam', categorie: 'S' }];
    const p = plan(d);
    expect(dcis(p)).not.toContain('ceftriaxone');
    expect(dcis(p)).toEqual(['temocilline']);
  });
});

describe('Suivi thérapeutique pharmacologique', () => {
  test('amikacine : pic 30 min après la fin d\'une perfusion de 30 min, après la 1re dose, cible 60-80 mg/L ; résiduelle si IR ou > 5 j, < 2,5 mg/L, 2×/semaine (ANSM 2011)', () => {
    const p = plan(CAS_BLSE_AMIKACINE);
    const amk = premiere(p)[0].prescriptions.find((x) => x.moleculeId === 'amikacine')!;
    const pic = amk.surveillance.find((s) => (s.element as SpecSTP).id === 'amikacine-pic')!.element as SpecSTP;
    expect(pic.premierPrelevement.numeroDose).toBe(1);
    expect(pic.premierPrelevement.offsetHeuresApresFinPerfusion).toBe(0.5);
    expect(pic.cible).toMatchObject({ min: 60, max: 80, unite: 'mg/L' });
    const res = amk.surveillance.find((s) => (s.element as SpecSTP).id === 'amikacine-residuelle')!.element as SpecSTP;
    expect(res.cible).toMatchObject({ max: 2.5, unite: 'mg/L' });
    expect(res.repetition).toMatch(/2 fois par semaine/);
    // Horaires connus (1re dose 09:00, perfusion 30 min) : pic daté à 10:00
    const ev = p.frise.find((e) => /Amikacine : dosage \(pic\)/.test(e.quoi));
    expect(ev?.dateISO).toBe(new Date('2026-11-04T10:00').toISOString());
  });

  test('horaires manquants : calendrier relatif, sans date inventée', () => {
    const d = clonerDossier(CAS_BLSE_AMIKACINE);
    d.horaires = {};
    const p = plan(d);
    const ev = p.frise.find((e) => /Amikacine : dosage \(pic\)/.test(e.quoi));
    expect(ev?.dateISO).toBeUndefined();
    expect(ev?.moment).toMatch(/1re dose/);
  });

  test('vancomycine en perfusion continue : plateau 20-25 mg/L (pas de « pic »), pas de résiduelle discontinue', () => {
    const p = plan(CAS_SCN_DEUX_SERIES_MATERIEL);
    const v = premiere(p)[0].prescriptions[0];
    const ids = v.surveillance.map((s) => (s.element as SpecSTP).id);
    expect(ids).toContain('vancomycine-plateau');
    expect(ids).not.toContain('vancomycine-residuelle');
    const plateau = v.surveillance.find((s) => (s.element as SpecSTP).id === 'vancomycine-plateau')!.element as SpecSTP;
    expect(plateau.cible).toMatchObject({ min: 20, max: 25 });
    expect(v.surveillance.some((s) => (s.element as SpecSTP).parametre === 'pic')).toBe(false);
  });
});

describe('Endocardite', () => {
  test('E. faecalis sur prothèse : amoxicilline + ceftriaxone 6 semaines (ESC 2023 T9, SPILF/AEPEI), hémocultures à J3', () => {
    const p = plan(CAS_EI_FAECALIS);
    expect(dcis(p).sort()).toEqual(['amoxicilline', 'ceftriaxone']);
    expect(premiere(p)[0].prescriptions[0].duree.dureePrevueJours).toBe(42);
    expect(p.controles.some((c) => c.id === 'ctl-ei-hc-j3')).toBe(true);
  });
});

describe('Invalidation, option retenue et recalcul', () => {
  test('changer de traitement retire l\'ancien calendrier', () => {
    const d = clonerDossier(CAS_SAB_SASM);
    d.optionRetenueId = 'doc-sasm-cloxa';
    const p1 = plan(d);
    expect(p1.surveillance.some((s) => s.moleculeDci === 'Cloxacilline')).toBe(true);
    // L'antibiogramme révèle un SARM : l'option retenue n'existe plus
    d.prelevements[0].antibiogramme = [{ dci: 'oxacilline', categorie: 'R' }];
    const p2 = plan(d);
    expect(p2.surveillance.some((s) => s.moleculeDci === 'Cloxacilline')).toBe(false);
    expect(p2.urgence.alertes.some((a) => /n'est plus proposée/.test(a.texte))).toBe(true);
  });

  test('réponse dépendante invalidée : date de négativation effacée si les hémocultures redeviennent positives', () => {
    const d = clonerDossier(CAS_SAB_SASM);
    d.prelevements[0].hemoc!.persistance = 'negativees';
    d.prelevements[0].hemoc!.dateNegativationISO = '2026-11-06T08:00';
    d.prelevements[0].hemoc!.persistance = 'persistantes';
    const inv = nettoyerDossier(d);
    expect(d.prelevements[0].hemoc!.dateNegativationISO).toBeUndefined();
    expect(inv.length).toBe(1);
  });

  test('déterminisme : mêmes entrées, même version → même résultat', () => {
    expect(JSON.stringify(plan(CAS_BGN_90_URINAIRE))).toBe(JSON.stringify(plan(CAS_BGN_90_URINAIRE)));
  });

  test('mode usage clinique : aucune règle validée par un humain → aucune proposition', () => {
    const p = plan(CAS_SAB_SASM, true);
    expect(p.options).toHaveLength(0);
    expect(p.urgence.alertes.some((a) => /Mode usage clinique/.test(a.texte))).toBe(true);
  });
});

describe('Sources retirées, remplacées ou inaccessibles', () => {
  test('une option dont la source est retirée est exclue et signalée', () => {
    const s = SOURCES_PAR_ID['IDSA-ESCMID-2026-SAB'];
    const avant = s.statutVigueur;
    s.statutVigueur = 'retiree';
    try {
      const p = plan(CAS_SAB_SASM);
      expect(p.options.some((o) => o.id === 'doc-sasm-cefazoline')).toBe(false);
      expect(p.urgence.alertes.some((a) => /source marquée comme retirée/.test(a.texte))).toBe(true);
    } finally {
      s.statutVigueur = avant;
    }
  });

  test('sources remplacées ou non lisibles : identifiées dans le registre (affichage « non vérifiée » / « remplacée »)', () => {
    expect(SOURCES_PAR_ID['SSC-2021'].statutVigueur).toBe('remplacee');
    expect(SOURCES_PAR_ID['ESCMID-2022-BGN-MDR'].statutAcces).toBe('contenu_non_lisible');
    expect(SOURCES_PAR_ID['HAS-2023-SAD-antibiotherapie'].statutAcces).toBe('contenu_non_lisible');
  });
});
