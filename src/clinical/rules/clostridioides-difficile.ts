/**
 * Infection à Clostridioides difficile (ICD) de l'adulte : qui tester, conclusion « ne pas traiter » sans diarrhée,
 * pas de test de guérison, gravité et forme grave-compliquée (fulminante), 1er épisode avec ou sans facteur de risque
 * de récidive, 1re récidive, récidives multiples (TMF : avis), voie orale impossible, grossesse, mesures associées.
 * Sources : SPILF 2026 (JNI) et Revue du Praticien 2026, SPILF 2022, ESCMID 2021 (traitement) et 2016 (diagnostic),
 * IDSA/SHEA 2017 et 2021, HCSP 2008, SF2H 2009, SFM 2025, RCP — docs/sources/recherche-clostridioides-difficile.md.
 *
 * Non modélisés : bezlotoxumab (AMM abrogée le 20/10/2026) ; métronidazole (cité seulement si fidaxomicine et
 * vancomycine indisponibles, ou par voie IV en adjonction : molécule ajoutée séparément dans la base, mentionnée en
 * commentaire) ; tigécycline et rifaximine (RCP non lus) ; modalités de la TMF (centre spécialisé).
 */
import type { Regle } from '../../engine/decider';
import type { ContexteDecision } from '../../engine/contexte';
import type { IndicationPlan, SourceRef } from '../types';
import { reponseDetail } from '../syndromes/questions';
import { Fiche, S, adulte, type DureeDecidee, type ItemPrescription } from './outils';

const SP26 = 'SPILF-2026-ICD-JNI';
const RP26 = 'REVPRAT-2026-ICD-SPILF';
const SP22 = 'SPILF-2022-ICD-diapo';
const ESC21 = 'ESCMID-2021-ICD-traitement';
const ESC16 = 'ESCMID-2016-ICD-diagnostic';
const IDSA17 = 'IDSA-SHEA-2017-ICD';
const IDSA21 = 'IDSA-SHEA-2021-ICD-focused';
const HCSP = 'HCSP-2008-ICD';
const SF2H = 'SF2H-2009-transmission-croisee';
const SFM = 'SFM-2025-fiche-ICD';
const IA94 = 'SPILF-2021-info-antibio-94';
const RCP_F = 'RCP-fidaxomicine';
const RCP_VO = 'RCP-vancomycine-orale';

const FIDAXO: ItemPrescription = { m: 'fidaxomicine', r: 'fidaxomicine-200x2' };
const FIDAXO_P: ItemPrescription = { m: 'fidaxomicine', r: 'fidaxomicine-pulse' };
const VANCO: ItemPrescription = { m: 'vancomycine_orale', r: 'vanco-po-125x4' };
const VANCO_500: ItemPrescription = { m: 'vancomycine_orale', r: 'vanco-po-500x4' };
const VANCO_P: ItemPrescription = { m: 'vancomycine_orale', r: 'vanco-po-pulse' };

const jours = (n: number, sources: SourceRef[], texte?: string): DureeDecidee => ({ texte: texte ?? `${n} jours`, pointDeDepart: 'premier jour de traitement', dureePrevueJours: n, sources });
const D_FIDAXO = jours(10, [S(RCP_F, '§4.2', 'deux fois par jour (une fois toutes les 12 heures) pendant 10 jours', 'duree'), S(SP26, 'tableau « Définitions »', '200 mg/12 h qsp 10j', 'duree')]);
const D_FIDAXO_P = jours(25, [S(RCP_F, '§4.2 (schéma prolongé-pulsé)', 'deux fois par jour du jour 1 au jour 5 (pas de prise de comprimé le jour 6) puis une fois tous les deux jours du jour 7 au jour 25', 'duree')], '25 jours : J1-J5 deux prises par jour, pas de prise J6, puis une prise un jour sur deux de J7 à J25');
const D_VANCO = jours(10, [S(RCP_VO, '§4.2', '125 mg toutes les 6 heures pendant 10 jours', 'duree'), S(ESC21, 'p. 13', 'oral vancomycin 125 mg four times daily for 10 days is a suitable alternative.', 'duree')]);
const D_VANCO_500 = jours(10, [S(RCP_VO, '§4.2', '500 mg toutes les 6 heures pendant 10 jours en cas d\'ICD sévère ou compliquée', 'duree')]);
const D_VANCO_P = jours(42, [S(SP26, 'tableau « Définitions »', '125 mg/6 h qsp 14j, puis 125 mg/12 h qsp 7j, puis 125 mg/24 h qsp 7j, puis 125 mg toutes les 48 h qsp 7j, puis 125 mg toutes les 72 h qsp 7j', 'duree')], '6 semaines : 14 j toutes les 6 h, 7 j toutes les 12 h, 7 j toutes les 24 h, 7 j toutes les 48 h, 7 j toutes les 72 h');

const SRC_DEF_DIARRHEE = [
  S(ESC21, 'p. 10', 'Diarrhea is defined as ≥3 loose stools, i.e. Bristol stool scale 6-7', 'definition'),
  S(IDSA17, 'qui tester', 'Patients with unexplained and new-onset ≥3 unformed stools in 24 hours are the preferred target population for testing for CDI', 'definition'),
];
const SRC_PAS_DE_TEST_ASYMPTOMATIQUE = [
  S(IDSA17, 'diagnostic', 'Do not perform repeat testing (within 7 days) during the same episode of diarrhea and do not test stool from asymptomatic patients', 'controle_micro'),
  S(ESC16, 'p. S79', 'Formed stool samples should not be tested for CDI (except in case of paralytic ileus).', 'controle_micro'),
];
const SRC_PAS_DE_CONTROLE = [
  S(ESC16, 'p. S79', 'A test of cure is not recommended.', 'controle_micro'),
  S(SFM, 'suivi', 'Prélèvement de contrôle déconseillé : seule l\'amélioration des signes cliniques rend compte de l\'efficacité du traitement.', 'controle_micro'),
];
const SRC_BEZLO = [
  S('BDPM-zinplava-arret', 'fiche CIS 69894104', 'Statut de l\'autorisation : Abrogée le 20-10-2026', 'autre'),
  S('EMA-2026-zinplava-retrait', 'EPAR', 'On 20 October 2026, the European Commission withdrew the marketing authorisation for Zinplava (bezlotoxumab)', 'autre'),
  S(SP26, 'objectif', 'Le bezlotoxumab n\'est plus commercialisé en France', 'autre'),
];
const COMMENTAIRE_METRO = 'Métronidazole 500 mg × 3/j pendant 10 jours seulement si fidaxomicine et vancomycine ne sont ni disponibles ni utilisables (ESCMID 2021) : non proposé par cette règle (molécule ajoutée séparément dans la base).';

type Reponse = (id: string) => string;

/** Réponse à une question du foyer (« inconnu » si absente). */
const rep = (ctx: ContexteDecision): Reponse => (id) => reponseDetail(ctx.dossier, `cdiff.${id}`);

/** Forme grave et compliquée (fulminante) : choc septique saisi, iléus, ou critère déclaré. */
export function formeFulminante(ctx: ContexteDecision): boolean | 'inconnu' {
  const r = rep(ctx);
  if (ctx.dossier.patient.gravite === 'choc_septique' || r('diarrhee') === 'ileus') return true;
  if (r('diarrhee') !== 'oui') return false;
  const c = r('compliquee');
  return c === 'oui' ? true : c === 'non' ? false : 'inconnu';
}

export const R_CDIFF: Regle = {
  id: 'R-CDIFF',
  libelle: 'Infection à Clostridioides difficile : diagnostic, gravité, épisode, récidives, mesures associées',
  description: 'SPILF 2026 (JNI) et 2022 ; ESCMID 2021 (traitement) et 2016 (diagnostic) ; IDSA/SHEA 2017 et 2021 ; HCSP 2008 ; RCP fidaxomicine et vancomycine orale.',
  statut: 'verifiee_ia',
  priorite: 156,
  sources: [S(SP26, 'diaporama JNI 2026', undefined, 'choix'), S(ESC21, 'p. 10-31', undefined, 'choix'), S(SP22, 'diapos 3-10', undefined, 'choix'), S(ESC16, 'p. S79', undefined, 'controle_micro')],
  sApplique: (ctx) => adulte(ctx) && ctx.foyer === 'clostridioides_difficile',
  appliquer: (ctx) => {
    const f = new Fiche(ctx, 'verifiee_ia');
    const r = rep(ctx);
    const diarrhee = r('diarrhee');
    const test = r('test');
    if (diarrhee === 'non') {
      sansDiarrhee(f, test);
      return f.fin();
    }
    if (diarrhee === 'inconnu') {
      f.c.indication = indication('informations_insuffisantes', 'indeterminee', 'Diarrhée à préciser avant de tester ou de traiter', 'La recherche de C. difficile et son traitement ne concernent que la diarrhée nouvelle et inexpliquée (au moins 3 selles non moulées en 24 h) ou l\'iléus.', {
        questions: ['Diarrhée : au moins 3 selles non moulées (Bristol 6-7) en 24 h, ou iléus ?'],
        sources: [...SRC_DEF_DIARRHEE, ...SRC_PAS_DE_TEST_ASYMPTOMATIQUE],
      });
      f.situation('cdiff-diarrhee-a-preciser', 'Diarrhée à C. difficile : symptômes à préciser', 'couverte', f.c.indication.raison);
      f.manque('diarrhée (au moins 3 selles non moulées / 24 h) ou iléus', 'qui tester et qui traiter (pas de test ni de traitement sans diarrhée)', 'bloque_decision');
      return f.fin();
    }
    // Patient symptomatique (diarrhée ou iléus).
    if (diarrhee === 'oui' && r('laxatif') === 'oui')
      f.alerte('attention', 'Laxatif dans les 48 h précédentes : la recherche de C. difficile n\'est pas recommandée en routine ; rechercher d\'abord cette cause de diarrhée (IDSA 2017).', [S(IDSA17, 'qui tester', 'not routinely performing testing on stool from a patient who has received a laxative within the previous 48 hours.', 'controle_micro')]);
    const fulminante = formeFulminante(ctx);
    if (test === 'negatif') {
      testNegatif(f);
      return f.fin();
    }
    mesuresAssociees(f, r, fulminante === true);
    if (test === 'discordant') {
      discordant(f, fulminante === true);
      return f.fin();
    }
    if (test === 'toxine_positive' || test === 'taan_seul') {
      if (test === 'taan_seul')
        f.alerte('info', 'TAAN (PCR) positif sans recherche de toxines : la définition d\'un épisode (SPILF 2022, ESCMID 2021) l\'accepte avec un tableau clinique compatible ; ESCMID 2016 recommande un algorithme en 2 étapes complété par la recherche de toxines A/B.', [
          S(SP22, 'diapo 3', 'Tableau clinique compatible + test PCR positif ou culture toxigénique positive', 'definition'),
          S(ESC16, 'p. S79', 'Samples with a positive first test result should be tested further with a toxin A/B EIA.', 'controle_micro'),
        ]);
      traitement(f, ctx, r, fulminante);
      return f.fin();
    }
    // Pas encore de résultat (non prélevé, en attente, inconnu).
    if (test === 'inconnu') f.manque('résultat de la recherche de C. difficile toxinogène', 'pas de traitement sans test diagnostique, sauf forme fulminante (ESCMID 2021, IDSA 2017)', 'bloque_decision');
    if (test !== 'en_attente')
      f.controle({
        id: 'ctl-cdiff-recherche',
        type: 'prelevement',
        categorie: 'indique',
        quoi: `Recherche de C. difficile toxinogène, demandée explicitement (algorithme en 2 étapes : GDH ou TAAN, puis toxines A/B)${diarrhee === 'ileus' ? ' ; iléus : écouvillon rectal' : ''}`,
        quand: { ancre: 'avant_traitement', texte: fulminante === true ? 'Maintenant, sans retarder le traitement' : 'Maintenant, avant tout traitement' },
        pourquoi: 'Diarrhée nouvelle et inexpliquée : population cible du test ; la recherche ne fait pas partie de la coproculture standard.',
        sources: [
          S(SFM, 'indications', 'La recherche de C. difficile toxinogène doit être demandée explicitement, ne fait pas partie de la coproculture standard.', 'controle_micro'),
          S(ESC16, 'p. S79', 'We recommend the use of a 2-step algorithm', 'controle_micro'),
          ...(diarrhee === 'ileus' ? [S(ESC16, 'p. S79', 'a rectal swab can be used', 'controle_micro')] : []),
          SRC_DEF_DIARRHEE[1],
        ],
      });
    if (fulminante === true) {
      f.c.indication = indication('urgence', 'infection_probable', 'Forme fulminante : traitement sans attendre le résultat', 'Forme grave et compliquée : le traitement empirique est admis sans attendre la confirmation (IDSA 2017, repris par ESCMID 2021).', {
        actions: ['Recherche de C. difficile toxinogène sans retarder le traitement', 'Avis chirurgical et prise en charge multidisciplinaire immédiats'],
        reconsiderer: ['Recherche négative : revoir le diagnostic'],
        sources: [S(IDSA17, 'traitement empirique', 'a substantial delay in laboratory confirmation is expected, or for fulminant CDI', 'choix'), S(ESC21, 'p. 31', 'strongly discourage the start of empirical therapy without diagnostic testing', 'choix')],
      });
      traitement(f, ctx, r, true);
      return f.fin();
    }
    f.c.indication = indication('attendre_resultat', 'indeterminee', 'Attendre le résultat de la recherche de C. difficile avant de traiter', 'ESCMID 2021 déconseille fortement un traitement empirique sans test diagnostique ; IDSA 2017 ne l\'admet qu\'en cas de délai important attendu pour le résultat ou de forme fulminante.', {
      actions: [test === 'en_attente' ? 'Obtenir le résultat de la recherche de C. difficile toxinogène' : 'Prélever les selles pour la recherche de C. difficile toxinogène (demande explicite)', 'Précautions complémentaires contact dès maintenant, sans attendre le résultat'],
      reconsiderer: ['Délai important attendu pour le résultat (traitement empirique admis par IDSA 2017)', 'Apparition d\'une forme grave et compliquée'],
      sources: [S(ESC21, 'p. 31', 'strongly discourage the start of empirical therapy without diagnostic testing', 'choix'), S(IDSA17, 'traitement empirique', 'a substantial delay in laboratory confirmation is expected, or for fulminant CDI', 'choix')],
    });
    f.situation('cdiff-a-tester', 'Suspicion d\'infection à C. difficile : résultat attendu', 'couverte', f.c.indication.raison);
    return f.fin();
  },
};

function indication(
  decision: IndicationPlan['decision'],
  qualification: IndicationPlan['qualification'],
  titre: string,
  raison: string,
  o: { conditions?: string[]; exceptions?: string[]; actions?: string[]; surveillance?: string[]; reconsiderer?: string[]; questions?: string[]; sources: SourceRef[]; pointNonResolu?: string },
): IndicationPlan {
  return {
    decision,
    qualification,
    titre,
    raison,
    conditions: o.conditions ?? [],
    exceptions: o.exceptions ?? [],
    actions: o.actions ?? [],
    surveillance: o.surveillance ?? [],
    reconsiderer: o.reconsiderer ?? [],
    questions: o.questions ?? [],
    sources: o.sources,
    statut: 'verifiee_ia',
    regleId: 'R-CDIFF',
    ...(o.pointNonResolu ? { pointNonResolu: o.pointNonResolu } : {}),
  };
}

/** Pas de diarrhée ni d'iléus : pas de test ; un test positif n'est pas une indication ; pas de test de guérison. */
function sansDiarrhee(f: Fiche, test: string) {
  const positif = test === 'toxine_positive' || test === 'taan_seul' || test === 'discordant';
  const sources = [
    ...SRC_PAS_DE_TEST_ASYMPTOMATIQUE,
    ...SRC_PAS_DE_CONTROLE,
    S(SP22, 'diapo 3 (définition)', 'Tableau clinique compatible + toxine libre par EIA* + pas d\'autre cause évidente de diarrhée', 'definition'),
    SRC_DEF_DIARRHEE[0],
    S(ESC21, 'p. 29', 'Routine prophylaxis with anti-CDI antibiotics when on systemic antibiotic treatment is not recommended.', 'choix'),
  ];
  f.c.indication = indication(
    'ne_pas_traiter',
    positif ? 'colonisation' : 'indeterminee',
    positif ? 'Test positif sans diarrhée : pas de traitement de C. difficile' : 'Pas de diarrhée : ni recherche ni traitement de C. difficile',
    positif
      ? 'Sans diarrhée (moins de 3 selles non moulées en 24 h) ni iléus, il n\'y a pas d\'épisode d\'infection à C. difficile : la définition exige un tableau clinique compatible. Un test positif chez un patient asymptomatique, ou après traitement (test de guérison), traduit un portage et ne justifie aucun traitement.'
      : 'La recherche de C. difficile n\'est pas indiquée chez un patient sans diarrhée ou sur des selles moulées (sauf iléus), ni comme contrôle de guérison.',
    {
      conditions: ['pas de diarrhée (moins de 3 selles non moulées / 24 h)', 'pas d\'iléus', ...(positif ? ['recherche de C. difficile positive'] : [])],
      actions: ['Pas de traitement anti-C. difficile (ni curatif ni prophylactique)', 'Ne pas rechercher C. difficile chez un patient asymptomatique, ni pour contrôler la guérison', 'Précautions complémentaires contact : réservées aux patients symptomatiques'],
      reconsiderer: ['Apparition d\'une diarrhée (au moins 3 selles non moulées en 24 h) ou d\'un iléus'],
      sources,
    },
  );
  f.situation(positif ? 'cdiff-portage' : 'cdiff-sans-diarrhee', positif ? 'Recherche de C. difficile positive sans diarrhée (portage)' : 'Pas de diarrhée : ni test ni traitement de C. difficile', 'couverte', f.c.indication.raison);
  f.geste('Précautions complémentaires contact : elles ne s\'appliquent qu\'aux patients symptomatiques.', [S(HCSP, 'p. 2', 'Les précautions « contact » ne s\'appliquent qu\'aux patients symptomatiques', 'geste')]);
}

function testNegatif(f: Fiche) {
  const src = [
    S(ESC16, 'p. S79', 'Samples with a negative first test result can be reported as negative.', 'controle_micro'),
    SRC_PAS_DE_TEST_ASYMPTOMATIQUE[0],
  ];
  f.c.indication = indication('ne_pas_traiter', 'indeterminee', 'Recherche négative : pas de traitement de C. difficile', 'Un premier test (GDH ou TAAN) négatif permet de rendre le résultat négatif (algorithme en 2 étapes, ESCMID 2016) : l\'infection à C. difficile n\'est pas retenue.', {
    conditions: ['recherche de C. difficile négative (1re étape)'],
    actions: ['Pas de traitement anti-C. difficile', 'Rechercher une autre cause de diarrhée', 'Ne pas répéter le test dans les 7 jours au cours du même épisode'],
    reconsiderer: ['Aggravation ou forme grave et compliquée : avis spécialisé'],
    sources: src,
  });
  f.situation('cdiff-test-negatif', 'Recherche de C. difficile négative', 'couverte', f.c.indication.raison);
}

function discordant(f: Fiche, fulminante: boolean) {
  const src = [S(ESC16, 'p. S79', 'may represent samples with CDI or C. difficile carriage and may optionally be tested with TC or NAAT', 'controle_micro')];
  f.c.indication = indication('informations_insuffisantes', 'indeterminee', 'GDH ou TAAN positif, toxines négatives : infection ou portage', 'Ce profil peut correspondre à une infection ou à un simple portage (ESCMID 2016) : l\'interprétation est clinique.', {
    actions: ['Interprétation clinique avec le SMIT ou le microbiologiste', 'Si GDH positif et toxines négatives : TAAN ou culture toxigénique possible (ESCMID 2016)'],
    reconsiderer: ['Forme grave ou compliquée, aggravation'],
    sources: src,
    pointNonResolu: 'Profil GDH ou TAAN positif / toxines négatives : infection ou portage, non tranché par les sources lues (ESCMID 2016) ; aucun seuil de Ct de la PCR n\'est modélisé (ESCMID 2021 : « preferably with a low cycle threshold », sans valeur chiffrée).',
  });
  f.situation('cdiff-discordant', 'Infection à C. difficile ou portage (toxines négatives)', 'partielle', f.c.indication.raison);
  f.avis('Profil GDH/TAAN positif et toxines négatives : décision de traiter avec le SMIT.', fulminante, src);
}

/** Mesures associées sourcées, présentées comme gestes (pas comme options antibiotiques). */
function mesuresAssociees(f: Fiche, r: Reponse, fulminante: boolean) {
  const nonSevere = r('gravite') === 'non' && !fulminante;
  f.geste(
    `Arrêter dès que possible l'antibiotique inducteur (et toute antibiothérapie non nécessaire)${nonSevere ? ' ; forme non sévère : si l\'arrêt est possible, surveillance étroite pendant 48 h (ESCMID 2021)' : ''}.`,
    [
      S(IDSA17, 'antibiotique inducteur', 'Discontinue therapy with the inciting antibiotic agent(s) as soon as possible', 'geste'),
      S(SP22, 'diapo 7', 'Arrêt d\'une antibiothérapie quand elle n\'est pas nécessaire', 'geste'),
      S(RCP_VO, '§4.2', 'Dès que possible, l\'antibiotique suspecté d\'être à l\'origine de l\'ICD doit être arrêté.', 'geste'),
      ...(nonSevere ? [S(ESC21, 'p. 13', 'In case of non-severe CDI, we recommend to discontinue antibiotic therapy if possible with the inciting antibiotic and closely monitor the patient for 48 hours.', 'geste')] : []),
    ],
  );
  if (r('atb') === 'oui')
    f.alerte('attention', 'Antibiothérapie systémique poursuivie après le diagnostic : à arrêter dès que possible ; c\'est un facteur de risque de récidive. Ne pas prolonger le traitement de l\'ICD au-delà de 10-14 jours à cause d\'elle (ESCMID 2021 ; IDSA 2017 : pas de recommandation).', [
      S(ESC21, 'p. 27', 'concomitant non-CDI antibiotic use after the diagnosis', 'definition'),
      S(ESC21, 'p. 31', 'we also discourage treatment beyond the recommended standard duration of 10-14 days with SoC antibiotics because of lack of response or co-administered antibiotic treatment.', 'duree'),
    ]);
  f.geste('Réhydratation et correction hydro-électrolytique.', [S(SP22, 'diapo 7', 'Rééquilibration hydro-électrolytique', 'geste'), S(RCP_VO, '§4.2', 'Un apport adéquat en liquides et électrolytes', 'geste')]);
  f.geste('Pas de ralentisseur du transit (lopéramide contre-indiqué).', [
    S(SP22, 'diapo 7', 'Pas de ralentisseurs du transit', 'geste'),
    S(SFM, 'mesures générales', 'contre-indication du lopéramide', 'geste'),
    S(RCP_VO, '§4.4', 'Les médicaments inhibant la motilité gastro-intestinale doivent être évités', 'geste'),
  ]);
  if (r('ipp') !== 'non')
    f.geste(`${r('ipp') === 'oui' ? 'IPP en cours' : 'IPP éventuel'} : discuter son arrêt (SPILF 2022 ; RCP de la vancomycine orale : à réévaluer). IDSA 2017 juge les données insuffisantes pour recommander l'arrêt.`, [
      S(SP22, 'diapo 7', 'Discuter l\'arrêt du traitement par IPP', 'geste'),
      S(RCP_VO, '§4.4', 'l\'utilisation des inhibiteurs de la pompe à protons devrait être réévaluée', 'geste'),
      S(IDSA17, 'prévention', 'insufficient evidence for discontinuation of PPIs as a measure for preventing CDI', 'geste'),
    ]);
  f.geste('Précautions complémentaires contact dès la suspicion, sans attendre le résultat : chambre individuelle avec sanitaires dédiés, gants, surblouse à manches longues pour les contacts directs avec le patient ou ses excreta.', [
    S(IDSA17, 'prévention', 'with a dedicated toilet', 'geste'),
    S(HCSP, 'p. 3', 'à manches longues, lors des contacts directs avec le patient ou ses excréta', 'geste'),
    S(HCSP, 'p. 4', 'isolement géographique des patients symptomatiques dans des chambres individuelles', 'geste'),
  ]);
  f.geste('Hygiène des mains : avant de quitter la chambre, retirer les gants, lavage simple au savon doux (élimination des spores), séchage complet, puis friction hydro-alcoolique ; la friction seule est inefficace sur les spores.', [
    S(HCSP, 'p. 3', 'avant de quitter la chambre, jeter les gants et faire un lavage simple des mains au savon doux (éliminer les spores) puis, après un séchage complet, se désinfecter les mains par friction avec un produit hydro-alcoolique', 'geste'),
    S(SF2H, 'C. difficile', 'il est recommandé de réaliser un lavage simple des mains suivi d\'une FHA sur mains correctement séchées.', 'geste'),
    S(SFM, 'hygiène', 'les solutés hydro-alcooliques sont inefficaces sur les spores', 'geste'),
  ]);
  f.geste('Bionettoyage au moins quotidien de la chambre avec un produit sporicide : hypochlorite de sodium à 0,5 % de chlore actif, temps de contact d\'au moins 10 minutes.', [
    S(HCSP, 'p. 4', 'hypochlorite de sodium à 0,5 % de chlore actif', 'geste'),
    S(HCSP, 'p. 4', 'temps de contact minimum de 10 minutes', 'geste'),
    S(SFM, 'hygiène', 'produit sporicide (par exemple eau de Javel à 0,5 %)', 'geste'),
  ]);
  f.geste('Durée des précautions contact (divergence non tranchée) : jusqu\'à la fin de l\'épisode diarrhéique (HCSP 2008) ou au moins 48 h après la fin de la diarrhée (IDSA 2017 ; JNI 2024 : selon la décision du CLIN) — suivre la politique de l\'établissement.', [
    S(HCSP, 'p. 5', 'jusqu\'à la fin de l\'épisode diarrhéique', 'geste'),
    S(IDSA17, 'prévention', 'Continue contact precautions for at least 48 hours after diarrhea has resolved', 'geste'),
    S('SPILF-JNI-2024-PCC', 'levée des PCC', 'Selon décision CLIN/instance LIN de l\'établissement', 'geste'),
  ]);
  f.geste('Pas de probiotiques ni de prophylaxie médicamenteuse.', [
    S(SP22, 'diapo 10', 'Aucune prophylaxie médicamenteuse, y compris par probiotiques, n\'est recommandée.', 'geste'),
    S(IA94, 'probiotiques', 'Les probiotiques ne sont pas recommandés', 'geste'),
  ]);
}

/** Facteurs de risque de récidive (SPILF 2026, d'après ESCMID 2021) au 1er épisode. */
function risqueRecidive(ctx: ContexteDecision, r: Reponse): { risque: 'oui' | 'non' | 'inconnu' | 'divergent'; raisons: string[]; manquants: string[] } {
  const p = ctx.dossier.patient;
  const raisons: string[] = [];
  const manquants: string[] = [];
  let divergent = false;
  if (p.age === undefined) manquants.push('âge');
  else if (p.age > 65) raisons.push('âge > 65 ans');
  else if (p.age === 65) divergent = true;
  const ante = r('antecedent');
  if (ante === 'oui') raisons.push('antécédent d\'infection à C. difficile');
  else if (ante === 'inconnu') manquants.push('antécédent d\'infection à C. difficile');
  if (p.contexte === 'associe_aux_soins') {
    const h = r('hospitalisation');
    if (h === 'oui') raisons.push('épisode associé aux soins avec hospitalisation dans les 3 derniers mois');
    else if (h === 'inconnu') manquants.push('hospitalisation dans les 3 derniers mois');
  } else if (p.contexte === 'inconnu') manquants.push('épisode associé aux soins (hospitalisation dans les 3 derniers mois)');
  const atb = r('atb');
  if (atb === 'oui') raisons.push('antibiothérapie systémique concomitante après le diagnostic');
  else if (atb === 'inconnu') manquants.push('antibiothérapie systémique poursuivie après le diagnostic');
  const ipp = r('ipp');
  if (ipp === 'oui') raisons.push('traitement par IPP');
  else if (ipp === 'inconnu') manquants.push('traitement par IPP');
  const risque = raisons.length ? 'oui' : manquants.length ? 'inconnu' : divergent ? 'divergent' : 'non';
  return { risque, raisons, manquants };
}

const SRC_FDR = [
  S(SP26, 'tableau « Définitions » (d\'après ESCMID 2021)', 'Episode lié aux soins et hospitalisation dans les 3 derniers mois', 'definition'),
  S(SP26, 'tableau « Définitions »', 'Traitement par IPP pendant ou au décours du diagnostic', 'definition'),
  S(ESC21, 'p. 27', 'prior CDI episode(s)', 'definition'),
];
const SRC_AGE_DIVERGENT = [S(SP26, 'tableau « Définitions »', 'Age > 65 ans', 'definition'), S(RP26, 'haut risque', 'âge ≥ 65 ans', 'definition')];

function traitement(f: Fiche, ctx: ContexteDecision, r: Reponse, fulminante: boolean | 'inconnu') {
  const p = ctx.dossier.patient;
  f.alerte('info', 'Traitement par voie orale (ou intraluminale) : la vancomycine IV n\'est pas efficace sur l\'infection à C. difficile.', [S(RCP_VO, '§4.4', 'L\'administration intraveineuse de vancomycine n\'est pas efficace pour le traitement des infections à Clostridium difficile.', 'choix')]);
  if (p.allergies.some((a) => /macrolide|[ée]rythromycine|clarithromycine|azithromycine|spiramycine|roxithromycine|josamycine|t[ée]lithromycine/i.test(a.molecule)))
    f.alerte('attention', 'Allergie à un macrolide déclarée : prudence avec la fidaxomicine (RCP).', [S(RCP_F, '§4.4', 'prudence chez les patients ayant une allergie connue aux macrolides', 'surveillance')]);
  if (p.allaitement === 'oui')
    f.alerte('info', 'Allaitement : avec la fidaxomicine, interrompre l\'allaitement ou le traitement selon le bénéfice ; vancomycine orale envisageable (RCP).', [S(RCP_F, '§4.6', 'interrompre l\'allaitement ou le traitement selon le bénéfice', 'autre'), S(RCP_VO, '§4.6', 'envisageable', 'autre')]);
  f.reeval('Évaluer la réponse chaque jour et ne conclure qu\'après au moins 3 jours de traitement (en l\'absence d\'aggravation) ; pas de réponse après 3 à 5 jours : forme réfractaire — revoir le diagnostic si la forme est non compliquée et stable, avis chirurgical en cas d\'aggravation.', [
    S(ESC21, 'p. 10', 'after at least 3 days, assuming that the patient is not worsening on treatment', 'definition'),
    S(SP22, 'diapo 4', 'Absence de réponse au traitement après 3-5 jours', 'definition'),
    S(ESC21, 'p. 20', 'carefully re-evaluate the diagnosis of CDI and consider an alternative diagnosis.', 'choix'),
    S(ESC21, 'p. 20', 'Consult a surgeon as soon as a patient\'s condition is deteriorating and the patient is not responding to CDI treatment.', 'choix'),
  ], 72);
  f.reeval('Pas de test de guérison : l\'efficacité se juge sur la clinique. Ne pas prolonger au-delà de 10-14 jours pour une non-réponse ou une antibiothérapie associée. Informer le patient sortant des signes de récidive.', [
    ...SRC_PAS_DE_CONTROLE,
    S(ESC21, 'p. 31', 'we also discourage treatment beyond the recommended standard duration of 10-14 days with SoC antibiotics because of lack of response or co-administered antibiotic treatment.', 'duree'),
    S(HCSP, 'p. 5', 'Informer le patient sortant des signes de récidive', 'autre'),
  ]);
  const grave = r('gravite');
  if (fulminante === 'inconnu')
    f.manque('forme grave et compliquée (hypotension, lactates élevés, mégacôlon toxique, perforation, évolution fulminante)', 'forme fulminante : avis chirurgical et schéma divergent IDSA / ESCMID-SPILF', 'bloque_decision');
  if (fulminante === true) {
    formeFulminanteTraitement(f, ctx, r);
    return;
  }
  if (grave === 'inconnu')
    f.manque('critères de gravité de l\'ICD (température > 38,5 °C, leucocytes > 15 G/L, créatininémie > 50 % de la valeur de base, imagerie)', 'forme grave : vancomycine ou fidaxomicine sans supériorité démontrée ; forme non sévère : arrêt de l\'inducteur et surveillance 48 h', 'affine');
  if (grave === 'oui') {
    f.alerte('info', 'Forme grave : pas d\'ajout systématique de métronidazole IV ; la vancomycine 500 mg × 4/j prévue par le RCP pour les formes sévères n\'est pas recommandée par ESCMID 2021 (divergence : 125 mg × 4/j retenu). Critère créatinine : ESCMID/SPILF en valeur relative (> 50 % de la base), IDSA en valeur absolue (> 1,5 mg/dL).', [
      S(ESC21, 'p. 17', 'For severe CDI, routine addition of i.v. metronidazole to oral SoC therapy is not recommended.', 'choix'),
      S(IA94, 'ICD grave', 'Pas d\'association systématique avec le métronidazole', 'choix'),
      S(RCP_VO, '§4.2', 'Cette dose peut être augmentée à 500 mg toutes les 6 heures pendant 10 jours en cas d\'ICD sévère ou compliquée.', 'posologie'),
      S(ESC21, 'p. 13', 'The use of vancomycin 500 mg four times daily is not recommended.', 'posologie'),
      S(ESC21, 'p. 11', 'fever i.e. core body temperature >38.5 °C, marked leukocytosis i.e. leukocyte count >15 x 10^9/L, and rise in serum creatinine, i.e. >50% above the baseline', 'definition'),
      S(IDSA17, 'sévérité (tableau)', 'a serum creatinine level >1.5 mg/dL', 'definition'),
    ]);
  }
  if (r('voie_orale') === 'non') {
    voieOraleImpossible(f);
    return;
  }
  if (p.grossesse === 'oui') {
    grossesse(f, r);
    return;
  }
  switch (r('episode')) {
    case 'premier':
      premierEpisode(f, ctx, r, grave === 'oui');
      break;
    case 'premiere_recidive':
      premiereRecidive(f, ctx, r);
      break;
    case 'recidives_multiples':
      recidivesMultiples(f);
      break;
    default:
      f.situation('cdiff-episode-a-preciser', 'Infection à C. difficile : rang de l\'épisode à préciser', 'partielle', 'La fidaxomicine 200 mg × 2/j pendant 10 jours est un traitement de 1re ligne du 1er épisode comme de la 1re récidive ; les alternatives, la place de la TMF et les schémas pulsés dépendent du rang de l\'épisode.');
      f.manque('rang de l\'épisode (1er épisode, 1re récidive, récidives multiples)', 'alternatives, schémas pulsés et place de la TMF', 'bloque_decision');
      f.option({ id: 'cdiff-fidaxo', libelle: 'Fidaxomicine (schéma standard)', type: 'documente', rang: 'premiere_ligne', items: [FIDAXO], duree: D_FIDAXO, sources: [S(ESC21, 'p. 13', 'For the initial episode of CDI we recommend fidaxomicin 200 mg twice daily for 10 days.', 'choix'), S(RP26, '1re récidive', 'la fidaxomicine s\'établit ici aussi en 1re ligne', 'choix')] });
  }
}

function premierEpisode(f: Fiche, ctx: ContexteDecision, r: Reponse, grave: boolean) {
  const { risque, raisons, manquants } = risqueRecidive(ctx, r);
  const libGrave = grave ? ', forme grave' : '';
  const srcFidaxo1 = [
    S(ESC21, 'p. 13', 'For the initial episode of CDI we recommend fidaxomicin 200 mg twice daily for 10 days.', 'choix'),
    S(IDSA21, 'épisode initial', 'we suggest using fidaxomicin rather than a standard course of vancomycin', 'choix'),
  ];
  const srcGrave = [S(ESC21, 'p. 17', 'vancomycin 125 mg four times daily for 10 days or fidaxomicin 200 mg twice daily for 10 days. There is no data supporting the superiority of one over the other.', 'choix'), S(SP22, 'diapo 8', 'Vancomycine ou fidaxomicine. Voie orale impossible: administration locale +/- métronidazole IV ou tigécycline', 'choix')];
  const commentaireSansFdr = 'Branche « sans facteur de risque » de l\'algorithme SPILF 2026 illisible (image) ; la Revue du Praticien indique qu\'elle « suit l\'algorithme habituel » : schéma ESCMID 2021 / SPILF 2022 repris, à confirmer sur le texte écrit SPILF 2026.';
  const srcHautRisque = [
    S(RP26, 'haut risque', 'Dans ces situations, la prise en charge repose désormais uniquement sur la fidaxomicine, en schéma standard (200 mg/12 h, qsp 10 j) ou pulsé', 'choix'),
    S(SP26, '1er épisode à haut risque', 'La Fidaxomicine en schéma pulsé est une alternative au schéma standard (Grade AE)', 'choix'),
  ];
  const vancoStd = (rang: 'premiere_ligne' | 'alternative' | 'conditionnelle', extra: { condition?: string; statut?: 'brouillon'; commentaire?: string } = {}) =>
    f.option({
      id: 'cdiff-1er-vanco',
      libelle: 'Vancomycine per os (schéma standard)',
      type: 'documente',
      rang,
      items: [VANCO],
      duree: D_VANCO,
      sources: grave ? srcGrave : [S(ESC21, 'p. 13', 'oral vancomycin 125 mg four times daily for 10 days is a suitable alternative.', 'choix'), S(SP22, 'algorithme', '2ème choix', 'choix')],
      condition: extra.condition,
      statut: extra.statut,
      commentaire: [extra.commentaire, COMMENTAIRE_METRO].filter(Boolean).join(' '),
    });
  const fidaxoStd = (commentaire?: string) => f.option({ id: 'cdiff-1er-fidaxo', libelle: 'Fidaxomicine (schéma standard)', type: 'documente', rang: 'premiere_ligne', items: [FIDAXO], duree: D_FIDAXO, sources: risque === 'oui' ? srcHautRisque : grave ? [...srcFidaxo1, ...srcGrave] : srcFidaxo1, commentaire });
  const fidaxoPulse = (rang: 'alternative' | 'conditionnelle', extra: { condition?: string; statut?: 'brouillon'; commentaire?: string } = {}) =>
    f.option({ id: 'cdiff-1er-fidaxo-pulse', libelle: 'Fidaxomicine (schéma prolongé-pulsé)', type: 'documente', rang, items: [FIDAXO_P], duree: D_FIDAXO_P, sources: srcHautRisque, ...extra });
  switch (risque) {
    case 'non':
      f.situation('cdiff-1er-episode', `1er épisode d'infection à C. difficile sans facteur de risque de récidive${libGrave}`, 'couverte', grave ? 'Forme grave : vancomycine ou fidaxomicine, sans supériorité démontrée de l\'une sur l\'autre (ESCMID 2021, SPILF 2022).' : 'Fidaxomicine en 1re intention ; vancomycine en alternative (ESCMID 2021).');
      fidaxoStd(commentaireSansFdr);
      vancoStd(grave ? 'premiere_ligne' : 'alternative', { commentaire: commentaireSansFdr });
      return;
    case 'oui':
      f.situation('cdiff-1er-episode-haut-risque', `1er épisode d'infection à C. difficile à haut risque de récidive${libGrave}`, 'couverte', `Facteur(s) : ${raisons.join(', ')}. Fidaxomicine seule, en schéma standard ou prolongé-pulsé (SPILF 2026).`);
      f.alerte('info', `Haut risque de récidive (${raisons.join(', ')}).`, SRC_FDR);
      fidaxoStd();
      fidaxoPulse('alternative');
      if (grave)
        vancoStd('conditionnelle', { statut: 'brouillon', condition: 'Forme grave : à discuter avec l\'avis spécialisé', commentaire: 'Forme grave : vancomycine ou fidaxomicine sans supériorité (ESCMID 2021, SPILF 2022) ; haut risque de récidive : fidaxomicine seule (SPILF 2026). Articulation des deux situations non précisée par les sources lues.' });
      f.ecarter('Vancomycine en schéma pulsé seule', 'inadaptee', 'non recommandée en alternative à la fidaxomicine au 1er épisode à haut risque de récidive (SPILF 2026, grade AE)', [S(SP26, '1er épisode à haut risque', 'La vancomycine pulsée seule n\'est pas recommandée en alternative à la fidaxomicine en schéma classique ou pulsée. (Grade AE)', 'choix')]);
      ecarterBezlotoxumab(f);
      f.reeval('Pas de transplantation de microbiote fécal après la fin de la fidaxomicine (standard ou pulsée) au 1er épisode.', [S(SP26, '1er épisode à haut risque', 'La TMF n\'est pas recommandée après la fin de la fidaxomicine standard ou pulsée. Grade AE', 'choix')]);
      f.avis('Fidaxomicine non disponible ou non accessible chez ce patient à haut risque de récidive : conduite non tranchée (bezlotoxumab retiré ; la Revue du Praticien écrit que la vancomycine n\'est plus proposée, la diapositive SPILF 2026 ne vise que la vancomycine pulsée seule) — avis spécialisé.', false, [
        S(RP26, 'haut risque', 'La vancomycine n\'est plus proposée en alternative à la fidaxomicine', 'choix'),
        S(SP26, '1er épisode à haut risque', 'La vancomycine pulsée seule n\'est pas recommandée en alternative à la fidaxomicine en schéma classique ou pulsée. (Grade AE)', 'choix'),
        S('BDPM-dificlir-fiche', 'conditions de délivrance', 'prescription hospitalière', 'autre'),
      ]);
      return;
    case 'divergent':
      f.situation('cdiff-1er-episode-seuil-age', `1er épisode d'infection à C. difficile, patient de 65 ans${libGrave}`, 'partielle', 'Seul facteur possible : l\'âge de 65 ans, facteur de risque de récidive selon la Revue du Praticien (≥ 65 ans) mais pas selon la diapositive SPILF 2026 et ESCMID 2021 (> 65 ans). Divergence non tranchée.');
      f.alerte('attention', 'Seuil d\'âge du haut risque de récidive divergent : « > 65 ans » (SPILF 2026, ESCMID 2021) ou « ≥ 65 ans » (Revue du Praticien). À 65 ans, les deux conduites sont affichées.', SRC_AGE_DIVERGENT);
      fidaxoStd();
      fidaxoPulse('alternative', { statut: 'brouillon', commentaire: 'Seulement si 65 ans est retenu comme facteur de risque de récidive (seuil « ≥ 65 ans » de la Revue du Praticien).' });
      vancoStd(grave ? 'premiere_ligne' : 'alternative', { statut: 'brouillon', commentaire: `Seulement si 65 ans n'est pas retenu comme facteur de risque de récidive (seuil « > 65 ans »). ${commentaireSansFdr}` });
      return;
    default:
      f.situation('cdiff-1er-episode-risque-a-preciser', `1er épisode d'infection à C. difficile : facteurs de risque de récidive à préciser${libGrave}`, 'partielle', `À préciser : ${manquants.join(', ')}. La fidaxomicine standard est de 1re ligne dans tous les cas ; l'alternative dépend du risque de récidive.`);
      for (const m of manquants) f.manque(m, 'facteur de risque de récidive : alternative à la fidaxomicine standard (SPILF 2026)', 'affine');
      fidaxoStd();
      fidaxoPulse('conditionnelle', { condition: 'si au moins un facteur de risque de récidive' });
      vancoStd('conditionnelle', { condition: 'si aucun facteur de risque de récidive', commentaire: commentaireSansFdr });
  }
}

function premiereRecidive(f: Fiche, ctx: ContexteDecision, r: Reponse) {
  const precedent = r('traitement_precedent');
  const apresFidaxo = precedent === 'fidaxomicine';
  f.situation('cdiff-1re-recidive', '1re récidive d\'infection à C. difficile', apresFidaxo ? 'partielle' : 'couverte', 'Récidive : nouvel épisode dans les 8 semaines après résolution du précédent. Fidaxomicine en 1re ligne (standard ou prolongée-pulsée) ; vancomycine en 2e intention si la fidaxomicine n\'est pas disponible ; TMF à discuter (SPILF 2026).');
  if (precedent === 'inconnu') f.manque('traitement de l\'épisode précédent', 'TMF recommandée après vancomycine, possible après fidaxomicine ; récidive après fidaxomicine non tranchée', 'affine');
  const commentaireApresFidaxo = apresFidaxo ? '1re récidive après un épisode traité par fidaxomicine : conduite non explicite dans le texte lisible de SPILF 2026 (ESCMID 2021 proposait l\'ajout du bezlotoxumab, retiré) — avis spécialisé.' : undefined;
  const srcFidaxo = [
    S(SP26, '1re récidive', 'La fidaxomicine pulsée est une alternative au schéma standard. (Grade AE)', 'choix'),
    S(RP26, '1re récidive', 'la fidaxomicine s\'établit ici aussi en 1re ligne', 'choix'),
    S(IDSA21, 'récidive', 'we suggest fidaxomicin (standard or extended-pulsed regimen) rather than a standard course of vancomycin', 'choix'),
    ...(precedent === 'vancomycine' || precedent === 'metronidazole' ? [S(ESC21, 'p. 22', 'If the initial CDI episode was treated with vancomycin or metronidazole, then fidaxomicin 200 mg twice daily for 10 days is the preferred agent to treat a first CDI recurrence.', 'choix')] : []),
  ];
  const statut = apresFidaxo ? ('brouillon' as const) : undefined;
  f.option({ id: 'cdiff-recidive-fidaxo', libelle: 'Fidaxomicine (schéma standard)', type: 'documente', rang: 'premiere_ligne', items: [FIDAXO], duree: D_FIDAXO, sources: srcFidaxo, statut, commentaire: commentaireApresFidaxo });
  f.option({ id: 'cdiff-recidive-fidaxo-pulse', libelle: 'Fidaxomicine (schéma prolongé-pulsé)', type: 'documente', rang: 'alternative', items: [FIDAXO_P], duree: D_FIDAXO_P, sources: srcFidaxo, statut, commentaire: commentaireApresFidaxo });
  const condVanco = 'seulement si la fidaxomicine n\'est pas disponible ou pas accessible';
  const srcVanco = [
    S(RP26, '1re récidive', 'La vancomycine est le traitement de 2e intention, lorsque la fidaxomicine n\'est pas disponible ou accessible.', 'choix'),
    S(SP26, '1re récidive', 'La vancomycine pulsée n\'est pas recommandée en remplacement de la fidaxomicine (Std ou pulsée) lorsque celle-ci est disponible et accessible (Grade AE).', 'choix'),
  ];
  f.option({ id: 'cdiff-recidive-vanco', libelle: 'Vancomycine per os (schéma standard)', type: 'documente', rang: 'conditionnelle', condition: condVanco, items: [VANCO], duree: D_VANCO, sources: srcVanco, commentaire: 'Après la vancomycine, la TMF est recommandée (SPILF 2026, grade B).' });
  f.option({ id: 'cdiff-recidive-vanco-pulse', libelle: 'Vancomycine per os (schéma dégressif-pulsé, 6 semaines)', type: 'documente', rang: 'conditionnelle', condition: condVanco, items: [VANCO_P], duree: D_VANCO_P, sources: [...srcVanco, S(SP26, '1re récidive', 'La vancomycine pulsée est possible en alternative à la vancomycine standard. (Grade AE)', 'choix')], commentaire: 'Après la vancomycine pulsée, la TMF est recommandée (SPILF 2026, grade C).' });
  const plus70 = ctx.dossier.patient.age !== undefined && ctx.dossier.patient.age > 70;
  f.avis(
    `Transplantation de microbiote fécal (TMF) à discuter avec un centre de TMF : recommandée après un traitement par vancomycine standard (grade B) ou pulsée (grade C) ; possible après la fidaxomicine (avis d'experts) ; possible quel que soit le traitement reçu chez les patients à haut risque de morbi-mortalité (comorbidités majeures, antécédent d'ICD grave compliquée ou réfractaire)${plus70 ? ' et chez les patients de plus de 70 ans, comme celui-ci (grade C)' : ' et après 70 ans (grade C)'}. Modalités de la TMF non modélisées.`,
    false,
    [
      S(SP26, 'TMF en 1re récidive', 'La TMF est recommandée après la vancomycine Std (Grade B) ou pulsée (Grade C).', 'choix'),
      S(SP26, 'TMF en 1re récidive', 'La TMF est possible après la fidaxomicine (Std ou pulsée). Grade AE', 'choix'),
      S(SP26, 'TMF en 1re récidive', 'possible chez les patients à haut risque de morbi-mortalité lié à l\'ICD (comorbidités majeures, antécédents d\'ICD grave compliquée ou réfractaire). (Grade AE)', 'choix'),
      S(SP26, 'TMF en 1re récidive', 'possible après quel que soit le traitement reçu chez les patients de plus de 70 ans. (Grade C)', 'choix'),
    ],
  );
  if (apresFidaxo) f.avis(commentaireApresFidaxo!, false, [S(SP26, '1re récidive', undefined, 'choix')]);
  ecarterBezlotoxumab(f);
}

function recidivesMultiples(f: Fiche) {
  f.situation('cdiff-recidives-multiples', 'Récidives multiples d\'infection à C. difficile (2e récidive ou plus)', 'partielle', 'Traitement par vancomycine ou fidaxomicine, suivi d\'une transplantation de microbiote fécal (TMF) dans un centre spécialisé ; modalités de la TMF non modélisées.');
  const src = [
    S(RP26, 'récidives multiples', 'En cas de nouvelle(s) récidive(s), la SPILF recommande un traitement à base de vancomycine ou de fidaxomicine, suivi par une TMF.', 'choix'),
    S(ESC21, 'p. 24', 'Treatment options for a second or further CDI recurrence include FMT after SoC antibiotic pre-treatment or bezlotoxumab in addition to SoC', 'choix'),
  ];
  const commentaire = 'Traitement antibiotique avant la TMF ; délai, produit et voie de la TMF à définir avec le centre (non modélisés).';
  f.option({ id: 'cdiff-multi-vanco', libelle: 'Vancomycine per os (schéma standard), puis TMF', type: 'documente', rang: 'premiere_ligne', items: [VANCO], duree: D_VANCO, sources: src, commentaire: `Vancomycine ou fidaxomicine, sans ordre de préférence dans les sources lues. ${commentaire}` });
  f.option({ id: 'cdiff-multi-fidaxo', libelle: 'Fidaxomicine (schéma standard), puis TMF', type: 'documente', rang: 'premiere_ligne', items: [FIDAXO], duree: D_FIDAXO, sources: src, commentaire: `Vancomycine ou fidaxomicine, sans ordre de préférence dans les sources lues. ${commentaire}` });
  f.avis('Orienter vers un centre de transplantation de microbiote fécal (centres validés GFTF/ANSM) : évaluation multidisciplinaire du risque obligatoire avant la TMF.', false, [
    S(ESC21, 'p. 24', 'For FMT an adequate multidisciplinary risk assessment is mandatory', 'choix'),
    S(IDSA17, 'TMF', 'appropriate antibiotic treatments for at least 2 recurrences (ie, 3 CDI episodes) should be tried prior to offering fecal microbiota transplantation', 'choix'),
    S(SP26, 'contexte 2', 'Validation des centres de TMF', 'autre'),
  ]);
  ecarterBezlotoxumab(f);
  f.ecarter('Rifaximine en relais', 'inadaptee', 'non recommandée (possible résistance croisée avec la rifampicine)', [S(IA94, 'récidives', 'La rifaximine est non recommandée devant une possible résistance croisée avec la rifampicine.', 'choix')]);
}

function voieOraleImpossible(f: Fiche) {
  f.situation('cdiff-voie-orale-impossible', 'Infection à C. difficile : voie orale impossible', 'partielle', 'Administration intraluminale (sonde gastroduodénale ou voie colique) de vancomycine aux doses orales standard, avec avis spécialisé (ESCMID 2021, SPILF 2022).');
  f.option({
    id: 'cdiff-intraluminal-vanco',
    libelle: 'Vancomycine 125 mg toutes les 6 h par sonde gastroduodénale ou par voie colique',
    type: 'documente',
    rang: 'premiere_ligne',
    items: [VANCO],
    duree: D_VANCO,
    statut: 'brouillon',
    sources: [
      S(ESC21, 'p. 19-20', 'attempt intraluminal (gastroduodenal or coloscopic) delivery of vancomycin or fidaxomicin', 'choix'),
      S(ESC21, 'p. 20', 'It seems reasonable use standard oral dosages for intraluminal delivery.', 'posologie'),
      S(SP22, 'diapo 8', 'Vancomycine ou fidaxomicine. Voie orale impossible: administration locale +/- métronidazole IV ou tigécycline', 'choix'),
    ],
    commentaire: 'Dose intraluminale extrapolée des doses orales (ESCMID : « It seems reasonable ») ; fidaxomicine intraluminale : pas de données. En adjonction possible : métronidazole IV 500 mg × 3/j (non proposé ici : molécule ajoutée séparément) ou tigécycline IV (RCP non lu, non modélisée). Voie rectale : seulement IDSA 2017 (500 mg dans environ 100 mL de sérum physiologique toutes les 6 h), non modélisée.',
  });
  f.avis('Voie orale impossible : modalités d\'administration intraluminale et adjonction éventuelle de métronidazole IV ou de tigécycline IV à décider avec l\'avis spécialisé.', false, [S(ESC21, 'p. 19-20', 'and consider adjunctive treatment with i.v. metronidazole 500 mg 3 times daily or i.v. tigecycline', 'choix')]);
}

function grossesse(f: Fiche, r: Reponse) {
  f.situation('cdiff-grossesse', 'Infection à C. difficile pendant la grossesse', 'partielle', 'Vancomycine préférée (ESCMID 2021) ; fidaxomicine à éviter faute de données (RCP). Fortes doses et traitements prolongés de vancomycine déconseillés.');
  f.option({
    id: 'cdiff-grossesse-vanco',
    libelle: 'Vancomycine per os (schéma standard)',
    type: 'documente',
    rang: 'premiere_ligne',
    items: [VANCO],
    duree: D_VANCO,
    sources: [S(ESC21, 'p. 31', 'In the absence of clinical data and experience with fidaxomicin, we prefer vancomycin during pregnancy.', 'choix'), S(RCP_VO, '§4.6', 'quel qu\'en soit le terme', 'choix'), S('CRAT-vancomycine-grossesse', 'En pratique', 'la vancomycine peut être utilisée quel que soit le terme de la grossesse', 'choix')],
  });
  f.option({ id: 'cdiff-grossesse-fidaxo', libelle: 'Fidaxomicine (schéma standard)', type: 'documente', rang: 'conditionnelle', condition: 'seulement si la vancomycine n\'est pas utilisable : aucune donnée chez la femme enceinte', items: [FIDAXO], duree: D_FIDAXO, sources: [S(RCP_F, '§4.6', 'il est préférable d\'éviter l\'utilisation de la fidaxomicine pendant la grossesse', 'choix')] });
  f.ecarter('Vancomycine à forte dose (500 mg × 4/j) ou en schéma prolongé (pulsé)', 'inadaptee', 'fortes doses et traitements prolongés de vancomycine déconseillés pendant la grossesse (ESCMID 2021)', [S(ESC21, 'p. 31', 'prolonged administration and high dosing of vancomycin should be discouraged', 'choix')]);
  if (r('episode') === 'premiere_recidive' || r('episode') === 'recidives_multiples')
    f.avis('Récidive pendant la grossesse : la conduite (schémas pulsés, TMF) n\'est pas détaillée pour la grossesse dans les sources lues — avis spécialisé et obstétrical.', false, [S(ESC21, 'p. 31', 'prolonged administration and high dosing of vancomycin should be discouraged', 'choix')]);
}

function formeFulminanteTraitement(f: Fiche, ctx: ContexteDecision, r: Reponse) {
  const p = ctx.dossier.patient;
  f.situation('cdiff-fulminante', 'Infection à C. difficile grave et compliquée (fulminante)', 'partielle', 'Avis chirurgical immédiat et prise en charge multidisciplinaire. Schéma antibiotique divergent entre IDSA 2017 et ESCMID 2021 / SPILF 2022 : non tranché, les deux sont affichés.');
  f.urgence('immediate');
  const srcDef = [S(ESC21, 'p. 11', 'hypotension, septic shock, elevated serum lactate, ileus, toxic megacolon, bowel perforation, or any fulminant course of disease', 'definition'), S(SP22, 'diapo 5', 'Hypotension, choc septique, élévation des lactates, iléus, mégacolon toxique, perforation intestinale, évolution fulminante', 'definition')];
  f.alerte('urgence', 'Forme grave et compliquée (fulminante) : avis chirurgical immédiat, prise en charge multidisciplinaire (chirurgien, réanimateur, infectiologue).', srcDef);
  f.avis('Avis chirurgical immédiat (toute forme grave et compliquée) ; approche multidisciplinaire.', true, [S(ESC21, 'p. 17', 'Consult a surgeon for any severe-complicated case.', 'choix'), S(SP22, 'diapo 8', 'Vancomycine ou fidaxomicine. Approche multidisciplinaire avec avis chirurgical. Évaluation TMF3 et tigécycline si réfractaire', 'choix')]);
  f.avis('Chirurgie : colectomie subtotale avec conservation du rectum, ou iléostomie de dérivation avec lavage colique et vancomycine antérograde (IDSA 2017) ; colectomie partielle ou iléostomie pour éviter la colectomie totale (ESCMID 2021). Seuils chirurgicaux non trouvés dans les sources lues. Si la chirurgie est impossible : TMF de sauvetage à discuter ; tigécycline IV (charge 100 mg puis 50 mg × 2/j) à discuter en cas d\'aggravation (ESCMID 2021, recommandations faibles ; RCP non lu, non modélisée).', false, [
    S(IDSA17, 'chirurgie', 'perform subtotal colectomy with preservation of the rectum', 'choix'),
    S(IDSA17, 'chirurgie', 'Diverting loop ileostomy with colonic lavage followed by antegrade vancomycin flushes is an alternative approach', 'choix'),
    S(ESC21, 'p. 17', 'Total abdominal colectomy might be prevented by partial colectomy or loop ileostomy.', 'choix'),
    S(ESC21, 'p. 17', '50 mg twice daily (100 mg loading dose) may be considered on a case-by-case basis', 'choix'),
  ]);
  f.alerte('attention', 'Divergence non tranchée : IDSA/SHEA 2017 recommande la vancomycine 500 mg × 4/j per os ou par sonde, par voie rectale en cas d\'iléus, et le métronidazole IV 500 mg toutes les 8 h ; ESCMID 2021 et SPILF 2022 retiennent vancomycine 125 mg × 4/j ou fidaxomicine 200 mg × 2/j, sans forte dose ni métronidazole IV systématique. Choix avec l\'avis spécialisé.', [
    S(IDSA17, 'fulminant CDI', 'The vancomycin dosage is 500 mg orally 4 times per day and 500 mg in approximately 100 mL normal saline per rectum every 6 hours as a retention enema', 'choix'),
    S(IDSA17, 'fulminant CDI', '500 mg intravenously every 8 hours', 'choix'),
    S(ESC21, 'p. 17', 'vancomycin 125 mg four times daily for 10 days or fidaxomicin 200 mg twice daily for 10 days. There is no data supporting the superiority of one over the other.', 'choix'),
    S(SP22, 'diapo 10', 'Il n\'existe pas de données suffisantes pour argumenter l\'utilisation de hautes doses de vancomycine', 'choix'),
  ]);
  if (r('voie_orale') === 'non' || r('diarrhee') === 'ileus')
    f.alerte('attention', 'Voie orale impossible ou iléus : administration intraluminale (sonde gastroduodénale, voie colique) aux doses orales standard, avec en adjonction possible métronidazole IV ou tigécycline IV (ESCMID 2021, SPILF 2022) ; voie rectale : IDSA 2017.', [
      S(ESC21, 'p. 19-20', 'attempt intraluminal (gastroduodenal or coloscopic) delivery of vancomycin or fidaxomicin', 'choix'),
      S(IDSA17, 'fulminant CDI', 'particularly if ileus is present', 'choix'),
    ]);
  if (p.grossesse === 'oui') f.alerte('attention', 'Grossesse : fortes doses et traitements prolongés de vancomycine déconseillés (ESCMID 2021).', [S(ESC21, 'p. 31', 'prolonged administration and high dosing of vancomycin should be discouraged', 'choix')]);
  const condition = 'Divergence IDSA / ESCMID-SPILF non tranchée : choix avec l\'avis spécialisé (chirurgien, infectiologue, réanimateur)';
  const srcEu = [S(ESC21, 'p. 17', 'vancomycin 125 mg four times daily for 10 days or fidaxomicin 200 mg twice daily for 10 days. There is no data supporting the superiority of one over the other.', 'choix'), S(SP22, 'diapo 8', 'Vancomycine ou fidaxomicine. Approche multidisciplinaire avec avis chirurgical. Évaluation TMF3 et tigécycline si réfractaire', 'choix')];
  f.option({ id: 'cdiff-fulminante-vanco-125', libelle: 'Vancomycine 125 mg toutes les 6 h (ESCMID 2021, SPILF 2022)', type: 'documente', rang: 'conditionnelle', condition, items: [VANCO], duree: D_VANCO, statut: 'brouillon', sources: srcEu, commentaire: 'Pas d\'ajout systématique de métronidazole IV (ESCMID 2021).' });
  f.option({ id: 'cdiff-fulminante-fidaxo', libelle: 'Fidaxomicine 200 mg toutes les 12 h (ESCMID 2021, SPILF 2022)', type: 'documente', rang: 'conditionnelle', condition, items: [FIDAXO], duree: D_FIDAXO, statut: 'brouillon', sources: [...srcEu, S(RCP_F, '§4.4', 'colite pseudo-membraneuse ou une ICD fulminante ou engageant le pronostic vital', 'choix')], commentaire: 'RCP : prudence, données limitées dans les ICD fulminantes ; administration intraluminale : pas de données (ESCMID 2021).' });
  f.option({
    id: 'cdiff-fulminante-idsa',
    libelle: 'Vancomycine 500 mg toutes les 6 h per os ou par sonde (IDSA/SHEA 2017)',
    type: 'documente',
    rang: 'conditionnelle',
    condition,
    items: [VANCO_500],
    duree: D_VANCO_500,
    statut: 'brouillon',
    sources: [S(IDSA17, 'fulminant CDI', 'vancomycin administered orally is the regimen of choice', 'choix'), S(IDSA17, 'fulminant CDI', 'The vancomycin dosage is 500 mg orally 4 times per day and 500 mg in approximately 100 mL normal saline per rectum every 6 hours as a retention enema', 'choix')],
    commentaire: 'IDSA 2017 y associe le métronidazole IV 500 mg toutes les 8 h, en particulier en cas d\'iléus (non proposé ici : molécule ajoutée séparément dans la base), et, en cas d\'iléus, la vancomycine par voie rectale (500 mg dans environ 100 mL de sérum physiologique toutes les 6 h, en lavement de rétention ; voie non modélisée). ESCMID 2021 : forte dose « not recommended ».',
  });
}

function ecarterBezlotoxumab(f: Fiche) {
  f.ecarter('Bezlotoxumab (en association au traitement antibiotique)', 'inadaptee', 'n\'est plus disponible : arrêt de commercialisation le 23/05/2025, autorisation de mise sur le marché abrogée le 20/10/2026 ; les branches « + bezlotoxumab » des recommandations ESCMID 2021, IDSA 2021 et SPILF 2022 sont caduques', SRC_BEZLO);
}

export const REGLES_CDIFF = [R_CDIFF];
