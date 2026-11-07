/**
 * Infection à Clostridioides difficile (R-CDIFF, 2026-11-06). Résultats attendus établis d'après
 * docs/sources/recherche-clostridioides-difficile.md (SPILF 2026 et 2022, ESCMID 2021 et 2016, IDSA/SHEA 2017 et 2021,
 * HCSP 2008, RCP fidaxomicine et vancomycine orale), indépendamment du code.
 */
import { decider } from '../engine/decider';
import { construireContexte } from '../engine/contexte';
import { dossierParDefaut, nettoyerDossier, nouveauPrelevement, type Dossier } from '../engine/etat';
import { questionsPour } from '../clinical/syndromes/questions';
import { QUESTIONS_CDIFF } from '../clinical/syndromes/clostridioides-difficile';
import { R_CDIFF } from '../clinical/rules/clostridioides-difficile';
import { MOLECULES_PAR_ID } from '../clinical/molecules';
import { SOURCES_PAR_ID } from '../clinical/sources';
import type { Plan } from '../clinical/types';

const MAINTENANT = new Date('2026-11-06T10:00:00Z');

function cdiff(details: Record<string, string> = {}, modif?: (d: Dossier) => void): Dossier {
  const d = dossierParDefaut();
  d.entree = 'syndrome';
  d.syndrome = 'clostridioides_difficile';
  d.patient.age = 50;
  d.patient.sexe = 'homme';
  d.patient.poidsKg = 70;
  d.patient.tailleCm = 175;
  d.patient.immunodepression = 'non';
  d.patient.neutropenie = 'non';
  d.patient.contexte = 'communautaire';
  d.patient.gravite = 'stable';
  d.patient.statutAllergie = 'aucune';
  d.patient.renal = { creatinine: { valeur: 80, unite: 'umol/L' }, stabilite: 'stable', insuffisanceRenaleAigue: 'non', dialyse: 'aucune' };
  d.details = {
    'cdiff.diarrhee': 'oui',
    'cdiff.laxatif': 'non',
    'cdiff.test': 'toxine_positive',
    'cdiff.episode': 'premier',
    'cdiff.gravite': 'non',
    'cdiff.compliquee': 'non',
    'cdiff.antecedent': 'non',
    'cdiff.atb': 'non',
    'cdiff.ipp': 'non',
    'cdiff.voie_orale': 'oui',
    ...details,
  };
  modif?.(d);
  return d;
}
function plan(d: Dossier): Plan {
  nettoyerDossier(d);
  return decider(d, { maintenant: MAINTENANT });
}
const molecules = (p: Plan, rang?: string) => p.options.filter((o) => !rang || o.rang === rang).flatMap((o) => o.prescriptions.map((x) => x.moleculeId));
const option = (p: Plan, id: string) => p.options.find((o) => o.id === id)!;

describe('Qui tester, qui ne pas traiter', () => {
  test('test positif sans diarrhée : portage, pas de traitement, pas de test de guérison', () => {
    const p = plan(cdiff({ 'cdiff.diarrhee': 'non' }));
    expect(p.situation.id).toBe('cdiff-portage');
    expect(p.indication?.decision).toBe('ne_pas_traiter');
    expect(p.indication?.qualification).toBe('colonisation');
    expect(p.options).toHaveLength(0);
    expect(p.indication?.actions.join(' ')).toMatch(/ni pour contrôler la guérison/);
    expect(p.sortie.motifs.some((m) => m.type === 'non_indiquee')).toBe(true);
  });

  test('sans diarrhée ni résultat : pas de recherche de C. difficile', () => {
    const d = cdiff({ 'cdiff.diarrhee': 'non', 'cdiff.test': 'non_preleve' });
    const p = plan(d);
    expect(p.situation.id).toBe('cdiff-sans-diarrhee');
    expect(p.indication?.decision).toBe('ne_pas_traiter');
    expect(d.details!['cdiff.episode']).toBeUndefined();
    expect(p.controles.some((c) => c.id === 'ctl-cdiff-recherche')).toBe(false);
  });

  test('diarrhée non encore testée, forme non fulminante : recherche demandée, traitement attendu, précautions contact immédiates', () => {
    const p = plan(cdiff({ 'cdiff.test': 'non_preleve' }));
    expect(p.situation.id).toBe('cdiff-a-tester');
    expect(p.indication?.decision).toBe('attendre_resultat');
    expect(p.options).toHaveLength(0);
    expect(p.controles.find((c) => c.id === 'ctl-cdiff-recherche')?.categorie).toBe('indique');
    // IDSA 2017 : précautions préemptives si le résultat n'est pas disponible le jour même (pas « dès la suspicion », non sourcé).
    expect(p.gestes.some((g) => /préemptives si le résultat n'est pas disponible le jour même/.test(g.texte))).toBe(true);
    expect(p.gestes.some((g) => /dès la suspicion/.test(g.texte))).toBe(false);
  });

  test('recherche négative : pas de traitement, pas de nouveau test dans les 7 jours', () => {
    const p = plan(cdiff({ 'cdiff.test': 'negatif' }));
    expect(p.indication?.decision).toBe('ne_pas_traiter');
    expect(p.indication?.actions.join(' ')).toMatch(/7 jours/);
    expect(p.options).toHaveLength(0);
  });

  test('GDH/TAAN positif et toxines négatives : infection ou portage non tranché', () => {
    const p = plan(cdiff({ 'cdiff.test': 'discordant' }));
    expect(p.indication?.decision).toBe('informations_insuffisantes');
    expect(p.indication?.pointNonResolu).toMatch(/portage/);
    expect(p.options).toHaveLength(0);
    expect(p.sortie.motifs.some((m) => m.type === 'non_validee')).toBe(true);
  });
});

describe('1er épisode', () => {
  test('sans facteur de risque de récidive : fidaxomicine 200 mg × 2/j 10 j, vancomycine orale 125 mg × 4/j en alternative', () => {
    const p = plan(cdiff());
    expect(p.situation.id).toBe('cdiff-1er-episode');
    expect(molecules(p, 'premiere_ligne')).toEqual(['fidaxomicine']);
    expect(molecules(p, 'alternative')).toEqual(['vancomycine_orale']);
    const fx = option(p, 'cdiff-1er-fidaxo').prescriptions[0];
    expect(fx.doseAffichee).toMatch(/200 mg × 2\/24 h/);
    expect(fx.duree.texte).toBe('10 jours');
    const vo = option(p, 'cdiff-1er-vanco').prescriptions[0];
    expect(vo.doseAffichee).toMatch(/125 mg × 4\/24 h/);
    expect(vo.voie).toBe('PO');
    expect(option(p, 'cdiff-1er-vanco').commentaire).toMatch(/Métronidazole/);
    expect(p.sortie.traitement).toBe('complet');
    // Branche SPILF 2026 illisible (note §15.4 A, §15.7 n° 1) : non tranchée → brouillon, couverture partielle.
    expect(option(p, 'cdiff-1er-fidaxo').statut).toBe('brouillon');
    expect(option(p, 'cdiff-1er-vanco').statut).toBe('brouillon');
    expect(p.situation.couverture).toBe('partielle');
  });

  test('vancomycine orale : ni paliers rénaux ni STP de la voie IV, même en insuffisance rénale', () => {
    const p = plan(cdiff({}, (d) => {
      d.patient.age = 60;
      d.patient.renal.creatinine = { valeur: 250, unite: 'umol/L' };
    }));
    const vo = option(p, 'cdiff-1er-vanco').prescriptions[0];
    const txt = vo.adaptations.join(' ');
    expect(txt).toMatch(/Pas d'adaptation à la fonction rénale ni à la dialyse/);
    expect(txt).toMatch(/colite pseudomembraneuse/);
    expect(txt).not.toMatch(/mg\/kg|toutes les 24 h/);
    expect(vo.doseAffichee).not.toMatch(/Dose de référence/);
    expect(vo.surveillance.some((s) => (s.element as { parametre?: string }).parametre !== undefined)).toBe(false);
    expect(MOLECULES_PAR_ID.vancomycine_orale.stp).toBeUndefined();
    expect(MOLECULES_PAR_ID.vancomycine.regimens.every((r) => r.voie === 'IV')).toBe(true);
  });

  test('âge > 65 ans (haut risque) : fidaxomicine standard ou pulsée seule ; vancomycine pulsée et bezlotoxumab écartés', () => {
    const p = plan(cdiff({}, (d) => (d.patient.age = 72)));
    expect(p.situation.id).toBe('cdiff-1er-episode-haut-risque');
    expect(molecules(p)).toEqual(['fidaxomicine', 'fidaxomicine']);
    const pulse = option(p, 'cdiff-1er-fidaxo-pulse');
    expect(pulse.rang).toBe('alternative');
    expect(pulse.prescriptions[0].doseAffichee).toMatch(/jour 7 au jour 25|J7 à J25/);
    expect(pulse.prescriptions[0].duree.dureePrevueJours).toBe(25);
    expect(p.sortie.ecartees.some((e) => /Bezlotoxumab/.test(e.libelle) && /20\/10\/2026/.test(e.raison))).toBe(true);
    expect(p.sortie.ecartees.some((e) => /Vancomycine en schéma pulsé/.test(e.libelle))).toBe(true);
    expect(p.avisSpecialise.some((a) => /non tranchée/.test(a.texte))).toBe(true);
  });

  test('65 ans exactement : seuil divergent (> 65 vs ≥ 65), les deux conduites en brouillon', () => {
    const p = plan(cdiff({}, (d) => (d.patient.age = 65)));
    expect(p.situation.id).toBe('cdiff-1er-episode-seuil-age');
    expect(p.urgence.alertes.some((a) => /≥ 65 ans/.test(a.texte))).toBe(true);
    expect(option(p, 'cdiff-1er-fidaxo-pulse').statut).toBe('brouillon');
    expect(option(p, 'cdiff-1er-vanco').statut).toBe('brouillon');
    expect(option(p, 'cdiff-1er-fidaxo').statut).toBe('verifiee_ia');
  });

  test('forme grave : vancomycine ou fidaxomicine sans supériorité ; forte dose de vancomycine non retenue', () => {
    const p = plan(cdiff({ 'cdiff.gravite': 'oui' }));
    expect(molecules(p, 'premiere_ligne').sort()).toEqual(['fidaxomicine', 'vancomycine_orale']);
    expect(p.urgence.alertes.some((a) => /500 mg × 4\/j/.test(a.texte) && /métronidazole IV/.test(a.texte))).toBe(true);
  });
});

describe('Forme grave et compliquée (fulminante)', () => {
  test('divergence IDSA / ESCMID-SPILF affichée sans être tranchée ; avis chirurgical systématique et précoce', () => {
    const p = plan(cdiff({ 'cdiff.compliquee': 'oui' }));
    expect(p.situation.id).toBe('cdiff-fulminante');
    expect(p.urgence.niveau).toBe('immediate');
    expect(p.options.every((o) => o.rang === 'conditionnelle' && o.statut === 'brouillon')).toBe(true);
    expect(option(p, 'cdiff-fulminante-idsa').prescriptions[0].doseAffichee).toMatch(/500 mg × 4\/24 h/);
    expect(option(p, 'cdiff-fulminante-vanco-125').prescriptions[0].doseAffichee).toMatch(/125 mg × 4\/24 h/);
    expect(option(p, 'cdiff-fulminante-idsa').commentaire).toMatch(/métronidazole IV/);
    expect(p.avisSpecialise.some((a) => a.urgent && /chirurgical/.test(a.texte))).toBe(true);
  });

  test('choc septique saisi : forme fulminante sans question supplémentaire ; traitement sans attendre le test', () => {
    const d = cdiff({ 'cdiff.test': 'en_attente' }, (x) => (x.patient.gravite = 'choc_septique'));
    expect(questionsPour('clostridioides_difficile', d).some((q) => q.id === 'cdiff.compliquee')).toBe(false);
    const p = plan(d);
    expect(p.situation.id).toBe('cdiff-fulminante');
    expect(p.indication?.decision).toBe('urgence');
    expect(p.options.length).toBe(3);
  });
});

describe('Récidives', () => {
  test('1re récidive après vancomycine : fidaxomicine 1re ligne ; vancomycine (standard ou pulsée) seulement si fidaxomicine indisponible ; TMF à discuter', () => {
    const p = plan(cdiff({ 'cdiff.episode': 'premiere_recidive', 'cdiff.traitement_precedent': 'vancomycine' }));
    expect(p.situation.id).toBe('cdiff-1re-recidive');
    expect(molecules(p, 'premiere_ligne')).toEqual(['fidaxomicine']);
    expect(option(p, 'cdiff-recidive-fidaxo-pulse').rang).toBe('alternative');
    const vp = option(p, 'cdiff-recidive-vanco-pulse');
    expect(vp.rang).toBe('conditionnelle');
    expect(vp.condition).toMatch(/fidaxomicine n'est pas disponible/);
    expect(vp.prescriptions[0].duree.dureePrevueJours).toBe(42);
    expect(p.avisSpecialise.some((a) => /TMF/.test(a.texte) && /recommandée après un traitement par vancomycine/.test(a.texte))).toBe(true);
  });

  test('1re récidive après fidaxomicine : non tranché, options en brouillon et avis spécialisé', () => {
    const p = plan(cdiff({ 'cdiff.episode': 'premiere_recidive', 'cdiff.traitement_precedent': 'fidaxomicine' }));
    expect(option(p, 'cdiff-recidive-fidaxo').statut).toBe('brouillon');
    expect(p.situation.couverture).toBe('partielle');
  });

  test('récidives multiples : vancomycine ou fidaxomicine puis TMF dans un centre ; rifaximine et bezlotoxumab écartés', () => {
    const p = plan(cdiff({ 'cdiff.episode': 'recidives_multiples', 'cdiff.traitement_precedent': 'vancomycine' }));
    expect(molecules(p, 'premiere_ligne').sort()).toEqual(['fidaxomicine', 'vancomycine_orale']);
    expect(p.avisSpecialise.some((a) => /centre de transplantation de microbiote fécal/.test(a.texte))).toBe(true);
    expect(p.sortie.ecartees.some((e) => /Rifaximine/.test(e.libelle))).toBe(true);
    expect(p.sortie.ecartees.some((e) => /Bezlotoxumab/.test(e.libelle))).toBe(true);
  });
});

describe('Terrain, voie d’administration et mesures associées', () => {
  test('grossesse : vancomycine orale préférée ; fidaxomicine seulement conditionnelle, avec avertissement', () => {
    const p = plan(cdiff({}, (d) => {
      d.patient.sexe = 'femme';
      d.patient.age = 30;
      d.patient.grossesse = 'oui';
    }));
    expect(p.situation.id).toBe('cdiff-grossesse');
    expect(molecules(p, 'premiere_ligne')).toEqual(['vancomycine_orale']);
    const fx = option(p, 'cdiff-grossesse-fidaxo');
    expect(fx.rang).toBe('conditionnelle');
    expect(fx.prescriptions[0].avertissements.join(' ')).toMatch(/préférable d'éviter/);
  });

  test('voie orale impossible : vancomycine intraluminale aux doses orales, en brouillon', () => {
    const p = plan(cdiff({ 'cdiff.voie_orale': 'non' }));
    expect(p.situation.id).toBe('cdiff-voie-orale-impossible');
    expect(option(p, 'cdiff-intraluminal-vanco').statut).toBe('brouillon');
  });

  test('mesures associées en gestes : inducteur, IPP, ralentisseurs, hygiène des mains, bionettoyage, durée des précautions divergente', () => {
    const p = plan(cdiff({ 'cdiff.ipp': 'oui', 'cdiff.atb': 'oui' }, (d) => (d.patient.age = 72)));
    const g = p.gestes.map((x) => x.texte).join(' | ');
    expect(g).toMatch(/antibiotique inducteur/);
    expect(g).toMatch(/IPP en cours : discuter son arrêt/);
    expect(g).toMatch(/Pas de ralentisseur du transit/);
    expect(g).toMatch(/savon doux/);
    expect(g).toMatch(/hypochlorite de sodium à 0,5 %/);
    expect(g).toMatch(/divergence non tranchée/);
    expect(p.urgence.alertes.some((a) => /Antibiothérapie systémique poursuivie/.test(a.texte))).toBe(true);
    expect(p.options.every((o) => o.prescriptions.every((x) => ['fidaxomicine', 'vancomycine_orale'].includes(x.moleculeId)))).toBe(true);
  });

  test('toute source citée (options, gestes, avis, alertes, indication) existe dans le registre', () => {
    const cas = [cdiff(), cdiff({ 'cdiff.diarrhee': 'non' }), cdiff({ 'cdiff.compliquee': 'oui' }), cdiff({ 'cdiff.episode': 'premiere_recidive' }), cdiff({ 'cdiff.episode': 'recidives_multiples' }), cdiff({ 'cdiff.test': 'discordant' }), cdiff({ 'cdiff.voie_orale': 'non' }), cdiff({}, (d) => (d.patient.age = 72))];
    const manquantes = new Set<string>();
    for (const d of cas) {
      const p = plan(d);
      const refs = [...p.sources, ...p.gestes.flatMap((g) => g.sources), ...p.avisSpecialise.flatMap((a) => a.sources), ...p.reevaluation.flatMap((r) => r.sources), ...(p.indication?.sources ?? []), ...p.sortie.ecartees.flatMap((e) => e.sources)];
      for (const r of refs) if (!SOURCES_PAR_ID[r.source]) manquantes.add(r.source);
    }
    expect([...manquantes]).toEqual([]);
  });
});

/* ------------------------------------------------------------------ */
/* Relecture v7 (clinique et développement)                            */
/* ------------------------------------------------------------------ */

const SANS_TRAITEMENT = ['ne_pas_traiter', 'attendre_resultat', 'informations_insuffisantes'];
const TESTS = ['non_preleve', 'en_attente', 'negatif', 'toxine_positive', 'taan_seul', 'discordant'];
/** Contribution de R-CDIFF seule (pour vérifier ce que la règle elle-même produit). */
const contribution = (d: Dossier) => {
  nettoyerDossier(d);
  return R_CDIFF.appliquer(construireContexte(d, MAINTENANT));
};

describe('v7 — forme fulminante : urgence quel que soit le test', () => {
  test('fulminante + GDH/TAAN positif et toxines négatives : urgence immédiate, avis chirurgical, options conditionnelles en brouillon, point non résolu', () => {
    const p = plan(cdiff({ 'cdiff.test': 'discordant', 'cdiff.compliquee': 'oui' }));
    expect(p.urgence.niveau).toBe('immediate');
    expect(p.indication?.decision).toBe('urgence');
    expect(p.indication?.pointNonResolu).toMatch(/portage/);
    expect(p.options.length).toBe(3);
    expect(p.options.every((o) => o.rang === 'conditionnelle' && o.statut === 'brouillon' && /SMIT/.test(o.condition ?? ''))).toBe(true);
    expect(p.avisSpecialise.some((a) => a.urgent && /chirurgical systématique et précoce/.test(a.texte))).toBe(true);
    expect(p.urgence.alertes.some((a) => a.niveau === 'urgence' && /grave et compliquée/.test(a.texte))).toBe(true);
  });

  test('choc septique + recherche négative : pas de « ne pas traiter », urgence conservée, avis chirurgical et infectiologique, autre cause', () => {
    const p = plan(cdiff({ 'cdiff.test': 'negatif' }, (d) => (d.patient.gravite = 'choc_septique')));
    expect(p.urgence.niveau).toBe('immediate');
    expect(p.indication?.decision).toBe('urgence');
    expect(p.indication?.actions.join(' ')).toMatch(/Revoir le diagnostic/);
    expect(p.avisSpecialise.some((a) => a.urgent && /chirurgical et infectiologique/.test(a.texte))).toBe(true);
    expect(p.sortie.motifs.some((m) => m.type === 'non_indiquee')).toBe(false);
  });

  test('iléus + recherche négative : urgence conservée (l’iléus classe la forme comme grave et compliquée)', () => {
    const p = plan(cdiff({ 'cdiff.diarrhee': 'ileus', 'cdiff.test': 'negatif' }));
    expect(p.urgence.niveau).toBe('immediate');
    expect(p.indication?.raison).toMatch(/iléus/);
  });

  test('le motif de la forme fulminante est dit en clair (iléus seul)', () => {
    const p = plan(cdiff({ 'cdiff.diarrhee': 'ileus', 'cdiff.test': 'toxine_positive' }));
    expect(p.situation.id).toBe('cdiff-fulminante');
    expect(p.situation.description).toMatch(/Classée grave et compliquée : iléus/);
    expect(questionsPour('clostridioides_difficile', cdiff()).find((q) => q.id === 'cdiff.diarrhee')?.options?.some((o) => /iléus \(forme grave et compliquée\)/.test(o.l))).toBe(true);
  });

  test('attente du résultat avec forme compliquée non renseignée : donnée manquante bloquante', () => {
    const p = plan(cdiff({ 'cdiff.test': 'en_attente', 'cdiff.compliquee': '' }, (d) => delete d.details!['cdiff.compliquee']));
    expect(p.indication?.decision).toBe('attendre_resultat');
    const m = p.donneesManquantes.find((x) => /forme grave et compliquée/.test(x.champ))!;
    expect(m.impact).toBe('bloque_decision');
    expect(m.cible).toBe('details.cdiff.compliquee');
  });

  test('IDSA : forte dose « per os » (l’extrait ne dit pas « par sonde ») ; grossesse : options fulminantes signalées déconseillées', () => {
    const p = plan(cdiff({ 'cdiff.compliquee': 'oui' }, (d) => {
      d.patient.sexe = 'femme';
      d.patient.age = 30;
      d.patient.grossesse = 'oui';
    }));
    expect(option(p, 'cdiff-fulminante-idsa').libelle).not.toMatch(/sonde/);
    expect(option(p, 'cdiff-fulminante-idsa').condition).toMatch(/grossesse : fortes doses de vancomycine déconseillées/);
    expect(option(p, 'cdiff-fulminante-fidaxo').condition).toMatch(/grossesse : préférable d'éviter/);
  });

  test('fulminante sans test : fidaxomicine signalée « SMR insuffisant si C. difficile non objectivé »', () => {
    const p = plan(cdiff({ 'cdiff.test': 'non_preleve', 'cdiff.compliquee': 'oui' }));
    expect(option(p, 'cdiff-fulminante-fidaxo').commentaire).toMatch(/SMR jugé insuffisant/);
  });
});

describe('v7 — sepsis ou choc : jamais masqué par une conclusion propre à C. difficile', () => {
  test('sepsis/choc × diarrhée × chaque résultat de test : urgence immédiate, alerte sepsis, jamais de conclusion globale sans traitement', () => {
    for (const gravite of ['sepsis', 'choc_septique'] as const)
      for (const diarrhee of ['oui', 'non', 'inconnu'])
        for (const t of TESTS) {
          const d = cdiff({ 'cdiff.test': t, 'cdiff.diarrhee': diarrhee }, (x) => (x.patient.gravite = gravite));
          if (diarrhee === 'inconnu') delete d.details!['cdiff.diarrhee'];
          const p = plan(d);
          const cas = `${gravite} / diarrhée ${diarrhee} / ${t}`;
          expect(p.urgence.niveau, cas).toBe('immediate');
          expect(p.urgence.alertes.some((a) => a.niveau === 'urgence' && /Sepsis|Choc septique/.test(a.texte)), cas).toBe(true);
          expect(SANS_TRAITEMENT.includes(p.indication?.decision ?? ''), cas).toBe(false);
          expect(p.sortie.motifs.some((m) => m.type === 'non_indiquee'), cas).toBe(false);
          if (p.sortie.traitement !== 'complet') expect(p.sortie.motifs.length, cas).toBeGreaterThan(0);
        }
  });

  test('sepsis + recherche négative : conclusion limitée à C. difficile, autre cause à rechercher', () => {
    const p = plan(cdiff({ 'cdiff.test': 'negatif' }, (d) => (d.patient.gravite = 'sepsis')));
    expect(p.indication?.titre).toMatch(/pour C. difficile seulement : recherche négative/);
    expect(p.indication?.actions[0]).toMatch(/Prise en charge du sepsis sans attendre/);
    expect(p.urgence.alertes.some((a) => /autre cause à rechercher/.test(a.texte))).toBe(true);
    expect(p.situation.couverture).toBe('partielle');
  });

  test('choc sans diarrhée avec test positif : reconsidérer un iléus ou un mégacôlon', () => {
    const p = plan(cdiff({ 'cdiff.diarrhee': 'non' }, (d) => (d.patient.gravite = 'choc_septique')));
    expect(p.indication?.reconsiderer.join(' ')).toMatch(/iléus, ou mégacôlon toxique/);
  });

  test('choc + diarrhée inconnue : la forme fulminante possible est signalée', () => {
    const d = cdiff({}, (x) => (x.patient.gravite = 'choc_septique'));
    delete d.details!['cdiff.diarrhee'];
    const p = plan(d);
    expect(p.urgence.alertes.some((a) => /classerait l'infection à C. difficile en forme grave et compliquée/.test(a.texte))).toBe(true);
  });

  test('aide de la question « forme compliquée » : le sepsis seul n’est pas un critère des sources lues', () => {
    expect(QUESTIONS_CDIFF.find((q) => q.id === 'cdiff.compliquee')?.aide).toMatch(/sepsis sans choc n'est pas, en soi, un critère/);
  });
});

describe('v7 — diagnostic', () => {
  test('laxatif dans les 48 h : recherche non systématique (cohérent avec l’alerte)', () => {
    const p = plan(cdiff({ 'cdiff.test': 'non_preleve', 'cdiff.laxatif': 'oui' }));
    expect(p.controles.find((c) => c.id === 'ctl-cdiff-recherche')?.categorie).toBe('non_systematique');
    expect(p.indication?.actions[0]).toMatch(/Laxatif/);
  });

  test('TAAN seul : options en brouillon, positions IDSA (toxines) et ESCMID 2021 (Ct bas) affichées, recherche de toxines demandée', () => {
    const p = plan(cdiff({ 'cdiff.test': 'taan_seul' }, (d) => (d.patient.age = 72)));
    expect(p.options.length).toBeGreaterThan(0);
    expect(p.options.every((o) => o.statut === 'brouillon')).toBe(true);
    expect(p.situation.couverture).toBe('partielle');
    expect(p.urgence.alertes.some((a) => /IDSA 2017 préfère un test de toxines/.test(a.texte) && /Ct bas/.test(a.texte))).toBe(true);
    expect(p.controles.some((c) => c.id === 'ctl-cdiff-toxines')).toBe(true);
  });

  test('diarrhée inconnue : une seule ligne « Compléter » (même libellé), vers la question', () => {
    const d = cdiff();
    delete d.details!['cdiff.diarrhee'];
    const p = plan(d);
    const lignes = p.sortie.motifs.flatMap((m) => m.aCompleter).filter((x) => /diarrhée/.test(x.texte));
    expect(lignes).toHaveLength(1);
    expect(lignes[0].cible).toBe('details.cdiff.diarrhee');
  });

  test('critère créatinine : divergence IDSA (valeur absolue) affichée dans l’aide de la question', () => {
    expect(QUESTIONS_CDIFF.find((q) => q.id === 'cdiff.gravite')?.aide).toMatch(/IDSA 2017 en valeur absolue \(> 1,5 mg\/dL/);
  });
});

describe('v7 — épisodes et récidives', () => {
  test('récidives multiples : options en brouillon, schéma non précisé par la source', () => {
    const p = plan(cdiff({ 'cdiff.episode': 'recidives_multiples', 'cdiff.traitement_precedent': 'vancomycine' }));
    for (const id of ['cdiff-multi-vanco', 'cdiff-multi-fidaxo']) {
      expect(option(p, id).statut).toBe('brouillon');
      expect(option(p, id).libelle).toMatch(/schéma non précisé par la source/);
    }
  });

  test('TMF en 1re récidive : « quel que soit le traitement reçu » réservé aux > 70 ans, grade AE du haut risque, divergence IDSA', () => {
    const p = plan(cdiff({ 'cdiff.episode': 'premiere_recidive', 'cdiff.traitement_precedent': 'vancomycine' }));
    const tmf = p.avisSpecialise.find((a) => /TMF/.test(a.texte))!.texte;
    expect(tmf).toMatch(/réfractaire\) \(grade AE\)/);
    expect(tmf).toMatch(/quel que soit le traitement reçu chez les patients de plus de 70 ans \(grade C\)/);
    expect(tmf).toMatch(/IDSA 2017 ne propose la TMF qu'après au moins 2 récidives/);
  });

  test('65 ans et autre facteur inconnu : la divergence du seuil d’âge reste affichée', () => {
    const p = plan(cdiff({ 'cdiff.ipp': '' }, (d) => {
      d.patient.age = 65;
      delete d.details!['cdiff.ipp'];
    }));
    expect(p.situation.id).toBe('cdiff-1er-episode-risque-a-preciser');
    expect(p.urgence.alertes.some((a) => /Seuil d'âge du haut risque de récidive divergent/.test(a.texte))).toBe(true);
  });

  test('contexte inconnu : hospitalisation « non » suffit ; « oui » renvoie au contexte (même ligne que les données générales)', () => {
    const sansHospit = contribution(cdiff({ 'cdiff.hospitalisation': 'non' }, (d) => (d.patient.contexte = 'inconnu')));
    expect(sansHospit.donneesManquantes!.some((m) => /contexte|hospitalisation/.test(m.champ))).toBe(false);
    const avecHospit = contribution(cdiff({ 'cdiff.hospitalisation': 'oui' }, (d) => (d.patient.contexte = 'inconnu')));
    expect(avecHospit.donneesManquantes!.find((m) => /contexte/.test(m.champ))).toMatchObject({ champ: 'contexte communautaire ou associé aux soins', cible: 'patient.contexte' });
  });

  test('voie orale non renseignée : donnée manquante', () => {
    const d = cdiff();
    delete d.details!['cdiff.voie_orale'];
    expect(plan(d).donneesManquantes.find((m) => /voie orale/.test(m.champ))?.cible).toBe('details.cdiff.voie_orale');
  });
});

describe('v7 — terrain, allergies, interactions, molécules', () => {
  test('femme de 30 ans, grossesse non renseignée : donnée bloquante vers le champ grossesse', () => {
    const p = plan(cdiff({}, (d) => {
      d.patient.sexe = 'femme';
      d.patient.age = 30;
      d.patient.grossesse = 'inconnu';
    }));
    const g = p.donneesManquantes.find((m) => m.champ === 'grossesse')!;
    expect(g.impact).toBe('bloque_decision');
    expect(g.cible).toBe('patient.grossesse');
    expect(p.sortie.traitement).not.toBe('complet');
  });

  test('grossesse : fortes doses et schémas pulsés « déconseillés » (pas « écartés ») ; récidives multiples : centre de TMF', () => {
    const p = plan(cdiff({ 'cdiff.episode': 'recidives_multiples', 'cdiff.traitement_precedent': 'vancomycine' }, (d) => {
      d.patient.sexe = 'femme';
      d.patient.age = 30;
      d.patient.grossesse = 'oui';
    }));
    expect(p.sortie.ecartees.some((e) => /forte dose/.test(e.libelle))).toBe(false);
    expect(p.urgence.alertes.some((a) => /déconseillés/.test(a.texte) && /should be discouraged/.test(a.texte))).toBe(true);
    expect(p.avisSpecialise.some((a) => /centre de transplantation de microbiote fécal/.test(a.texte))).toBe(true);
  });

  test('allergie à la fidaxomicine, 1re récidive : vancomycine en 1re ligne (2e intention si fidaxomicine non accessible), pas de motif « contraintes »', () => {
    const p = plan(cdiff({ 'cdiff.episode': 'premiere_recidive', 'cdiff.traitement_precedent': 'vancomycine' }, (d) => {
      d.patient.statutAllergie = 'presentes';
      d.patient.allergies = [{ molecule: 'fidaxomicine', reaction: 'immediate', gravite: 'severe' }];
    }));
    expect(molecules(p, 'premiere_ligne')).toEqual(['vancomycine_orale']);
    expect(p.sortie.motifs.some((m) => m.type === 'contraintes')).toBe(false);
  });

  test('allergie à la fidaxomicine, haut risque : vancomycine conditionnelle en brouillon, conduite non tranchée', () => {
    const p = plan(cdiff({}, (d) => {
      d.patient.age = 72;
      d.patient.statutAllergie = 'presentes';
      d.patient.allergies = [{ molecule: 'fidaxomicine', reaction: 'immediate', gravite: 'severe' }];
    }));
    const v = option(p, 'cdiff-1er-vanco');
    expect(v.rang).toBe('conditionnelle');
    expect(v.statut).toBe('brouillon');
    expect(v.condition).toMatch(/allergie déclarée/);
  });

  test('allergie aux macrolides : fidaxomicine maintenue, avec la prudence du RCP dite explicitement', () => {
    const p = plan(cdiff({}, (d) => {
      d.patient.statutAllergie = 'presentes';
      d.patient.allergies = [{ molecule: 'clarithromycine', reaction: 'immediate', gravite: 'legere' }];
    }));
    expect(molecules(p, 'premiere_ligne')).toContain('fidaxomicine');
    expect(p.urgence.alertes.some((a) => /exclusion des macrolides ne s'applique pas à la fidaxomicine/.test(a.texte))).toBe(true);
  });

  test('interactions P-gp : amiodarone/dronédarone via le traitement allongeant le QT, question dédiée, tacrolimus non cité', () => {
    const p = plan(cdiff({}, (d) => (d.patient.traitementsAssocies = ['qt_allongeant', 'immunosuppresseur_calcineurine'])));
    const fx = option(p, 'cdiff-1er-fidaxo').prescriptions[0];
    expect(fx.avertissements.join(' ')).toMatch(/amiodarone ou la dronédarone/);
    expect(fx.avertissements.join(' ')).toMatch(/tacrolimus n'est pas cité/);
    expect(p.donneesManquantes.find((m) => /P-gp/.test(m.champ))?.cible).toBe('details.cdiff.pgp');
    const oui = plan(cdiff({ 'cdiff.pgp': 'oui' }));
    expect(oui.urgence.alertes.some((a) => /P-gp déclaré/.test(a.texte))).toBe(true);
  });

  test('fidaxomicine : prescription hospitalière et SMR dans les modalités', () => {
    const fx = option(plan(cdiff()), 'cdiff-1er-fidaxo').prescriptions[0];
    expect(fx.modalites).toMatch(/prescription hospitalière/);
    expect(fx.modalites).toMatch(/SMR jugé insuffisant/);
  });

  test('voie orale impossible : régime intraluminal propre (pas la solution buvable PO)', () => {
    const vo = option(plan(cdiff({ 'cdiff.voie_orale': 'non' })), 'cdiff-intraluminal-vanco').prescriptions[0];
    expect(vo.regimenId).toBe('vanco-intraluminal-125x4');
    expect(vo.voie).toBe('intraluminale');
  });

  test('hémodialyse : vancomycine orale sans « dose de référence » ni « avis requis » ; fidaxomicine : ce que dit le RCP', () => {
    const p = plan(cdiff({ 'cdiff.gravite': 'oui' }, (d) => (d.patient.renal = { ...d.patient.renal, dialyse: 'hemodialyse_intermittente' })));
    const vo = option(p, 'cdiff-1er-vanco').prescriptions[0];
    expect(vo.doseAffichee).not.toMatch(/Dose de référence/);
    expect(vo.adaptations.join(' ')).toMatch(/ni à la dialyse/);
    expect(vo.adaptations.join(' ')).not.toMatch(/avis pharmacologique/);
    const fx = option(p, 'cdiff-1er-fidaxo').prescriptions[0];
    expect(fx.adaptations.join(' ')).toMatch(/aucune consigne propre à la dialyse/);
    expect(fx.adaptations.join(' ')).not.toMatch(/non renseignée dans la base/);
  });
});

describe('v7 — cibles, sources, bactériémie concomitante', () => {
  test('toute donnée manquante produite par R-CDIFF a une cible, et chaque cible « details » est une question du foyer', () => {
    const ids = new Set(QUESTIONS_CDIFF.map((q) => `details.${q.id}`));
    const vider = (...cles: string[]) => (d: Dossier) => {
      for (const c of cles) delete d.details![c];
    };
    const cas: Dossier[] = [
      cdiff({}, vider('cdiff.diarrhee')),
      cdiff({ 'cdiff.test': 'en_attente' }, vider('cdiff.compliquee')),
      cdiff({}, vider('cdiff.test')),
      cdiff({ 'cdiff.test': 'discordant' }, vider('cdiff.compliquee')),
      cdiff({}, vider('cdiff.episode', 'cdiff.gravite', 'cdiff.voie_orale', 'cdiff.compliquee')),
      cdiff({}, (d) => {
        vider('cdiff.antecedent', 'cdiff.atb', 'cdiff.ipp', 'cdiff.hospitalisation')(d);
        d.patient.age = undefined;
        d.patient.contexte = 'inconnu';
      }),
      cdiff({ 'cdiff.episode': 'premiere_recidive' }),
      cdiff({}, (d) => {
        d.patient.sexe = 'femme';
        d.patient.age = 30;
        d.patient.grossesse = 'inconnu';
        d.patient.traitementsAssocies = ['qt_allongeant'];
      }),
      cdiff({ 'cdiff.episode': '' }, (d) => {
        delete d.details!['cdiff.episode'];
        d.patient.sexe = 'femme';
        d.patient.age = 30;
        d.patient.grossesse = 'oui';
      }),
    ];
    let n = 0;
    for (const d of cas) {
      // Cible portée par la donnée elle-même, ou (données des molécules, ex. « grossesse ») rattachée par le moteur.
      const p = plan(structuredClone(d));
      for (const m of contribution(d).donneesManquantes ?? []) {
        n++;
        const cible = m.cible ?? p.donneesManquantes.find((x) => x.champ === m.champ)?.cible;
        expect(cible, m.champ).toBeDefined();
        if (cible!.startsWith('details.')) expect(ids.has(cible!), cible).toBe(true);
        else expect(cible).toMatch(/^patient\./);
      }
    }
    expect(n).toBeGreaterThan(10);
  });

  test('extraits non verbatim retirés (« 2ème choix », « s’établit ici aussi », « Informer le patient sortant »)', () => {
    const cas = [cdiff(), cdiff({ 'cdiff.episode': 'premiere_recidive' }), cdiff({}, (d) => delete d.details!['cdiff.episode'])];
    for (const d of cas) {
      const p = plan(d);
      const extraits = [...p.sources, ...p.reevaluation.flatMap((r) => r.sources), ...p.options.flatMap((o) => o.sources)].map((s) => s.extrait ?? '');
      expect(extraits.some((e) => /2ème choix|s'établit ici aussi|Informer le patient sortant/.test(e))).toBe(false);
    }
  });

  test('syndrome C. difficile choisi + hémoculture d’un autre foyer : R-CDIFF s’applique et ses questions sont conservées', () => {
    const d = cdiff();
    const h = nouveauPrelevement('hemoculture');
    h.organisme = 'escherichia_coli';
    h.foyer = 'urinaire';
    h.foyerStatut = 'suspecte';
    d.prelevements = [h];
    nettoyerDossier(d);
    expect(d.details!['cdiff.test']).toBe('toxine_positive');
    expect(questionsPour('clostridioides_difficile', d).some((q) => q.id === 'cdiff.diarrhee')).toBe(true);
    const p = decider(d, { maintenant: MAINTENANT });
    expect(p.regles.some((r) => r.id === 'R-CDIFF')).toBe(true);
    expect(p.options.some((o) => o.prescriptions.some((x) => x.moleculeId === 'fidaxomicine'))).toBe(true);
  });
});
