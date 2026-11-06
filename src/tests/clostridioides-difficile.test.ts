/**
 * Infection à Clostridioides difficile (R-CDIFF, 2026-11-06). Résultats attendus établis d'après
 * docs/sources/recherche-clostridioides-difficile.md (SPILF 2026 et 2022, ESCMID 2021 et 2016, IDSA/SHEA 2017 et 2021,
 * HCSP 2008, RCP fidaxomicine et vancomycine orale), indépendamment du code.
 */
import { decider } from '../engine/decider';
import { dossierParDefaut, nettoyerDossier, type Dossier } from '../engine/etat';
import { questionsPour } from '../clinical/syndromes/questions';
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
    expect(p.gestes.some((g) => /Précautions complémentaires contact dès la suspicion/.test(g.texte))).toBe(true);
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
  });

  test('vancomycine orale : ni paliers rénaux ni STP de la voie IV, même en insuffisance rénale', () => {
    const p = plan(cdiff({}, (d) => {
      d.patient.age = 60;
      d.patient.renal.creatinine = { valeur: 250, unite: 'umol/L' };
    }));
    const vo = option(p, 'cdiff-1er-vanco').prescriptions[0];
    const txt = vo.adaptations.join(' ');
    expect(txt).toMatch(/pas d'adaptation posologique prévue/);
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
  test('divergence IDSA / ESCMID-SPILF affichée sans être tranchée ; avis chirurgical immédiat', () => {
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
