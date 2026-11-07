/**
 * Infection à Clostridioides difficile (ICD) de l'adulte : qui tester, conclusion « ne pas traiter » sans diarrhée,
 * pas de test de guérison, gravité et forme grave-compliquée (fulminante), 1er épisode avec ou sans facteur de risque
 * de récidive, 1re récidive, récidives multiples (TMF : avis), voie orale impossible, grossesse, mesures associées.
 * Sources : SPILF 2026 (JNI) et Revue du Praticien 2026, SPILF 2022, ESCMID 2021 (traitement) et 2016 (diagnostic),
 * IDSA/SHEA 2017 et 2021, HCSP 2008, SF2H 2009, SFM 2025, RCP — docs/sources/recherche-clostridioides-difficile.md.
 *
 * Principes (relecture v7) :
 * - la forme grave et compliquée (fulminante) est évaluée avant le résultat du test : elle garde son urgence et son
 *   avis chirurgical quel que soit ce résultat ;
 * - en cas de sepsis ou de choc, une conclusion propre à C. difficile (« pas de traitement », « attendre le résultat »,
 *   « informations insuffisantes ») ne devient jamais la conclusion de la fiche : elle est présentée comme limitée à
 *   C. difficile, la prise en charge du sepsis restant en tête ;
 * - chaque donnée manquante renvoie à son champ de saisie (cible).
 *
 * Non modélisés : bezlotoxumab (AMM abrogée le 20/10/2026) ; métronidazole (cité seulement si fidaxomicine et
 * vancomycine indisponibles, ou par voie IV en adjonction : molécule ajoutée séparément dans la base, mentionnée en
 * commentaire) ; tigécycline et rifaximine (RCP non lus) ; modalités de la TMF (centre spécialisé).
 */
import type { Regle } from '../../engine/decider';
import { moleculeEvitee, type ContexteDecision } from '../../engine/contexte';
import type { IndicationPlan, SourceRef, StatutValidation } from '../types';
import { reponseDetail } from '../syndromes/questions';
import { molecule } from '../molecules';
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
const BDPM_F = 'BDPM-dificlir-fiche';
/** Info-antibio 94 est remplacée : seuls ses extraits jugés « encore valides » par la note (§5) sont cités. */
const IA94_VALIDE = '(extrait jugé encore valide par la note §5 ; Info-antibio 94 remplacée)';

const FIDAXO: ItemPrescription = { m: 'fidaxomicine', r: 'fidaxomicine-200x2' };
const FIDAXO_P: ItemPrescription = { m: 'fidaxomicine', r: 'fidaxomicine-pulse' };
const VANCO: ItemPrescription = { m: 'vancomycine_orale', r: 'vanco-po-125x4' };
const VANCO_500: ItemPrescription = { m: 'vancomycine_orale', r: 'vanco-po-500x4' };
const VANCO_P: ItemPrescription = { m: 'vancomycine_orale', r: 'vanco-po-pulse' };
const VANCO_IL: ItemPrescription = { m: 'vancomycine_orale', r: 'vanco-intraluminal-125x4' };

/** Cible « Compléter » d'une question du foyer. */
const Q = (id: string) => `details.cdiff.${id}`;
const CHAMP_DIARRHEE = 'diarrhée (au moins 3 selles non moulées en 24 h) ou iléus';
const CHAMP_FULMINANTE = 'forme grave et compliquée (hypotension, lactates élevés, mégacôlon toxique, perforation, évolution fulminante)';

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
const SRC_DEF_FULMINANTE = [
  S(ESC21, 'p. 11', 'hypotension, septic shock, elevated serum lactate, ileus, toxic megacolon, bowel perforation, or any fulminant course of disease', 'definition'),
  S(SP22, 'diapo 5', 'Hypotension, choc septique, élévation des lactates, iléus, mégacolon toxique, perforation intestinale, évolution fulminante', 'definition'),
];
const SRC_CHIRURGIEN = S(ESC21, 'p. 17', 'Consult a surgeon for any severe-complicated case.', 'choix');
const SRC_EMPIRIQUE = [S(IDSA17, 'traitement empirique', 'a substantial delay in laboratory confirmation is expected, or for fulminant CDI', 'choix'), S(ESC21, 'p. 31', 'strongly discourage the start of empirical therapy without diagnostic testing', 'choix')];
const SRC_LAXATIF = S(IDSA17, 'qui tester', 'not routinely performing testing on stool from a patient who has received a laxative within the previous 48 hours.', 'controle_micro');
const SRC_VANCO_2E_INTENTION = S(RP26, '1re récidive', 'La vancomycine est le traitement de 2e intention, lorsque la fidaxomicine n\'est pas disponible ou accessible.', 'choix');
const SRC_BEZLO = [
  S('BDPM-zinplava-arret', 'fiche CIS 69894104', 'Statut de l\'autorisation : Abrogée le 20-10-2026', 'autre'),
  S('EMA-2026-zinplava-retrait', 'EPAR', 'On 20 October 2026, the European Commission withdrew the marketing authorisation for Zinplava (bezlotoxumab)', 'autre'),
  S(SP26, 'objectif', 'Le bezlotoxumab n\'est plus commercialisé en France', 'autre'),
];
const SRC_DUREE_PCC = [
  S(HCSP, 'p. 5', 'jusqu\'à la fin de l\'épisode diarrhéique', 'geste'),
  S(IDSA17, 'prévention', 'Continue contact precautions for at least 48 hours after diarrhea has resolved', 'geste'),
  S('SPILF-JNI-2024-PCC', 'levée des PCC', 'Selon décision CLIN/instance LIN de l\'établissement', 'geste'),
];
const TEXTE_DUREE_PCC = 'jusqu\'à la fin de l\'épisode diarrhéique (HCSP 2008) ou au moins 48 h après la fin de la diarrhée (IDSA 2017 ; JNI 2024 : selon la décision du CLIN) — divergence non tranchée, suivre la politique de l\'établissement';
const COMMENTAIRE_METRO = 'Métronidazole 500 mg × 3/j pendant 10 jours seulement si fidaxomicine et vancomycine ne sont ni disponibles ni utilisables (ESCMID 2021) : non proposé par cette règle (molécule ajoutée séparément dans la base).';
const SANS_TRAITEMENT: IndicationPlan['decision'][] = ['ne_pas_traiter', 'attendre_resultat', 'informations_insuffisantes'];

type Reponse = (id: string) => string;

/** Réponse à une question du foyer (« inconnu » si absente). */
const rep = (ctx: ContexteDecision): Reponse => (id) => reponseDetail(ctx.dossier, `cdiff.${id}`);

/** Allergie déclarée qui fait éviter la fidaxomicine (le moteur rendra ses options conditionnelles). */
const fidaxoEvitee = (ctx: ContexteDecision) => moleculeEvitee('fidaxomicine', molecule('fidaxomicine').famille, ctx.allergie).evitee;

/** Forme grave et compliquée (fulminante) : choc septique saisi, iléus, ou critère déclaré. */
export function formeFulminante(ctx: ContexteDecision): boolean | 'inconnu' {
  const r = rep(ctx);
  if (ctx.dossier.patient.gravite === 'choc_septique' || r('diarrhee') === 'ileus') return true;
  if (r('diarrhee') !== 'oui') return false;
  const c = r('compliquee');
  return c === 'oui' ? true : c === 'non' ? false : 'inconnu';
}

/** Ce qui classe le tableau en forme grave et compliquée (dit en clair). */
function criteresFulminante(ctx: ContexteDecision): string[] {
  const r = rep(ctx);
  const l: string[] = [];
  if (ctx.dossier.patient.gravite === 'choc_septique') l.push('choc septique saisi');
  if (r('diarrhee') === 'ileus') l.push('iléus');
  if (r('compliquee') === 'oui') l.push('critère déclaré (hypotension, lactates élevés, mégacôlon toxique, perforation ou évolution fulminante)');
  return l;
}

export const R_CDIFF: Regle = {
  id: 'R-CDIFF',
  libelle: 'Infection à Clostridioides difficile : diagnostic, gravité, épisode, récidives, mesures associées',
  description: 'SPILF 2026 (JNI) et 2022 ; ESCMID 2021 (traitement) et 2016 (diagnostic) ; IDSA/SHEA 2017 et 2021 ; HCSP 2008 ; RCP fidaxomicine et vancomycine orale.',
  statut: 'verifiee_ia',
  priorite: 156,
  sources: [S(SP26, 'diaporama JNI 2026', undefined, 'choix'), S(ESC21, 'p. 10-31', undefined, 'choix'), S(SP22, 'diapos 3-10', undefined, 'choix'), S(ESC16, 'p. S79', undefined, 'controle_micro')],
  // Syndrome choisi en entrée A : la règle s'applique même si un prélèvement (hémoculture) porte un autre foyer.
  sApplique: (ctx) => adulte(ctx) && (ctx.foyer === 'clostridioides_difficile' || (ctx.dossier.entree === 'syndrome' && ctx.dossier.syndrome === 'clostridioides_difficile')),
  appliquer: (ctx) => {
    const f = new Fiche(ctx, 'verifiee_ia');
    const r = rep(ctx);
    const diarrhee = r('diarrhee');
    const test = r('test');
    const choc = ctx.dossier.patient.gravite === 'choc_septique';
    if (diarrhee === 'non') {
      sansDiarrhee(f, test, choc);
      sepsisNonMasque(f, ctx);
      return f.fin();
    }
    if (diarrhee === 'inconnu') {
      f.c.indication = indication('informations_insuffisantes', 'indeterminee', 'Diarrhée à préciser avant de tester ou de traiter', 'La recherche de C. difficile et son traitement ne concernent que la diarrhée nouvelle et inexpliquée (au moins 3 selles non moulées en 24 h) ou l\'iléus.', {
        questions: [CHAMP_DIARRHEE],
        actions: choc ? ['Choc septique : préciser sans délai la diarrhée ou l\'iléus — avec l\'un ou l\'autre, forme grave et compliquée (traitement sans attendre le test, avis chirurgical)'] : [],
        sources: [...SRC_DEF_DIARRHEE, ...SRC_PAS_DE_TEST_ASYMPTOMATIQUE, ...(choc ? SRC_DEF_FULMINANTE : [])],
      });
      f.situation('cdiff-diarrhee-a-preciser', 'Diarrhée à C. difficile : symptômes à préciser', 'couverte', f.c.indication.raison);
      f.manque(CHAMP_DIARRHEE, 'qui tester et qui traiter (pas de test ni de traitement sans diarrhée)', 'bloque_decision', Q('diarrhee'));
      if (choc)
        f.alerte('attention', 'Choc septique saisi et diarrhée non renseignée : une diarrhée ou un iléus classerait l\'infection à C. difficile en forme grave et compliquée (ESCMID 2021, SPILF 2022), traitée sans attendre le test (IDSA 2017) avec avis chirurgical.', [...SRC_DEF_FULMINANTE, ...SRC_EMPIRIQUE.slice(0, 1), SRC_CHIRURGIEN]);
      sepsisNonMasque(f, ctx);
      return f.fin();
    }
    // Patient symptomatique (diarrhée ou iléus). La forme fulminante est évaluée AVANT le résultat du test.
    const fulminante = formeFulminante(ctx);
    const laxatif = diarrhee === 'oui' && r('laxatif') === 'oui';
    if (laxatif)
      f.alerte('attention', 'Laxatif dans les 48 h précédentes : la recherche de C. difficile n\'est pas recommandée en routine ; rechercher d\'abord cette cause de diarrhée (IDSA 2017).', [SRC_LAXATIF]);
    if (test === 'negatif') {
      if (fulminante === true) negatifFormeGrave(f, ctx);
      else {
        testNegatif(f);
        sepsisNonMasque(f, ctx);
      }
      return f.fin();
    }
    mesuresAssociees(f, r, fulminante === true);
    if (test === 'discordant') {
      if (fulminante === true) {
        f.c.indication = indication('urgence', 'indeterminee', 'Forme grave et compliquée, toxines négatives : traitement empirique admis, avis urgent', 'GDH ou TAAN positif et toxines négatives : infection ou portage, non tranché (ESCMID 2016). Devant une forme grave et compliquée, IDSA 2017 admet un traitement sans attendre la confirmation ; la décision se prend avec le SMIT et le chirurgien.', {
          actions: ['Avis chirurgical systématique et précoce ; prise en charge multidisciplinaire (chirurgien, réanimateur, infectiologue)', 'Décision de traiter avec le SMIT ou le microbiologiste (profil discordant)'],
          reconsiderer: ['Autre diagnostic retrouvé : arrêter le traitement anti-C. difficile'],
          sources: [S(ESC16, 'p. S79', 'may represent samples with CDI or C. difficile carriage and may optionally be tested with TC or NAAT', 'controle_micro'), ...SRC_EMPIRIQUE, SRC_CHIRURGIEN],
          pointNonResolu: 'Profil GDH ou TAAN positif / toxines négatives : infection ou portage, non tranché par les sources lues (ESCMID 2016) ; aucun seuil de Ct de la PCR n\'est modélisé.',
        });
        traitement(f, ctx, r, true, test);
      } else {
        discordant(f, fulminante);
        sepsisNonMasque(f, ctx);
      }
      return f.fin();
    }
    if (test === 'toxine_positive' || test === 'taan_seul') {
      if (test === 'taan_seul') taanSeul(f);
      traitement(f, ctx, r, fulminante, test);
      if (test === 'taan_seul') {
        // Infection ou portage : aucune option ne sort au statut « vérifiée par IA ».
        for (const o of f.c.options) o.statut = 'brouillon';
        f.plafond('partielle');
      }
      return f.fin();
    }
    // Pas encore de résultat (non prélevé, en attente, inconnu).
    if (test === 'inconnu') f.manque('résultat de la recherche de C. difficile toxinogène', 'pas de traitement sans test diagnostique, sauf forme fulminante (ESCMID 2021, IDSA 2017)', 'bloque_decision', Q('test'));
    const testEnRoutine = !laxatif || fulminante === true;
    if (test !== 'en_attente')
      f.controle({
        id: 'ctl-cdiff-recherche',
        type: 'prelevement',
        categorie: testEnRoutine ? 'indique' : 'non_systematique',
        quoi: `Recherche de C. difficile toxinogène, demandée explicitement (algorithme en 2 étapes : GDH ou TAAN, puis toxines A/B)${diarrhee === 'ileus' ? ' ; iléus : écouvillon rectal' : ''}`,
        quand: {
          ancre: 'avant_traitement',
          texte: fulminante === true ? 'Maintenant, sans retarder le traitement' : testEnRoutine ? 'Maintenant, avant tout traitement' : 'Pas en routine : laxatif dans les 48 h (IDSA 2017) ; rechercher d\'abord cette cause de diarrhée',
        },
        pourquoi: testEnRoutine
          ? 'Diarrhée nouvelle et inexpliquée : population cible du test ; la recherche ne fait pas partie de la coproculture standard.'
          : 'La recherche n\'est pas recommandée en routine après un laxatif dans les 48 h ; si elle est faite, elle doit être demandée explicitement.',
        sources: [
          S(SFM, 'indications', 'La recherche de C. difficile toxinogène doit être demandée explicitement, ne fait pas partie de la coproculture standard.', 'controle_micro'),
          S(ESC16, 'p. S79', 'We recommend the use of a 2-step algorithm', 'controle_micro'),
          ...(diarrhee === 'ileus' ? [S(ESC16, 'p. S79', 'a rectal swab can be used', 'controle_micro')] : []),
          SRC_DEF_DIARRHEE[1],
          ...(testEnRoutine ? [] : [SRC_LAXATIF]),
        ],
      });
    if (fulminante === true) {
      f.c.indication = indication('urgence', 'infection_probable', 'Forme fulminante : traitement sans attendre le résultat', `Forme grave et compliquée (${criteresFulminante(ctx).join(', ')}) : le traitement empirique est admis sans attendre la confirmation (IDSA 2017, repris par ESCMID 2021).`, {
        actions: ['Recherche de C. difficile toxinogène sans retarder le traitement', 'Avis chirurgical systématique et précoce ; prise en charge multidisciplinaire'],
        reconsiderer: ['Recherche négative : revoir le diagnostic'],
        sources: [...SRC_EMPIRIQUE, ...SRC_DEF_FULMINANTE],
      });
      traitement(f, ctx, r, true, test);
      return f.fin();
    }
    // Seule exception à l'attente du résultat : la forme grave et compliquée. Inconnue, elle bloque la décision.
    if (fulminante === 'inconnu')
      f.manque(CHAMP_FULMINANTE, 'seule exception à l\'attente du résultat : forme grave et compliquée, traitée sans attendre (IDSA 2017, ESCMID 2021)', 'bloque_decision', Q('compliquee'));
    f.c.indication = indication('attendre_resultat', 'indeterminee', 'Attendre le résultat de la recherche de C. difficile avant de traiter', 'ESCMID 2021 déconseille fortement un traitement empirique sans test diagnostique ; IDSA 2017 ne l\'admet qu\'en cas de délai important attendu pour le résultat ou de forme fulminante.', {
      actions: [
        laxatif
          ? 'Laxatif dans les 48 h : rechercher d\'abord cette cause de diarrhée ; recherche de C. difficile non recommandée en routine (IDSA 2017)'
          : test === 'en_attente'
            ? 'Obtenir le résultat de la recherche de C. difficile toxinogène'
            : 'Prélever les selles pour la recherche de C. difficile toxinogène (demande explicite)',
        'Précautions complémentaires contact préemptives si le résultat n\'est pas disponible le jour même (IDSA 2017)',
      ],
      reconsiderer: ['Délai important attendu pour le résultat (traitement empirique admis par IDSA 2017)', 'Apparition d\'une forme grave et compliquée'],
      sources: [S(ESC21, 'p. 31', 'strongly discourage the start of empirical therapy without diagnostic testing', 'choix'), SRC_EMPIRIQUE[0], ...(laxatif ? [SRC_LAXATIF] : [])],
    });
    f.situation('cdiff-a-tester', 'Suspicion d\'infection à C. difficile : résultat attendu', 'couverte', f.c.indication.raison);
    sepsisNonMasque(f, ctx);
    return f.fin();
  },
};

function indication(
  decision: IndicationPlan['decision'],
  qualification: IndicationPlan['qualification'],
  titre: string,
  raison: string,
  o: { conditions?: string[]; exceptions?: string[]; actions?: string[]; surveillance?: string[]; reconsiderer?: string[]; questions?: string[]; sources: SourceRef[]; pointNonResolu?: string; statut?: StatutValidation },
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
    statut: o.statut ?? 'verifiee_ia',
    regleId: 'R-CDIFF',
    ...(o.pointNonResolu ? { pointNonResolu: o.pointNonResolu } : {}),
  };
}

/**
 * Sepsis ou choc déclaré : une conclusion sans traitement propre à C. difficile ne devient pas la conclusion de la
 * fiche. Elle est présentée comme limitée à C. difficile ; la prise en charge du sepsis (alerte R-GRAVITE-SEPSIS,
 * conservée par le moteur) reste en tête, sans délai.
 */
function sepsisNonMasque(f: Fiche, ctx: ContexteDecision) {
  const g = ctx.dossier.patient.gravite;
  const ind = f.c.indication;
  if ((g !== 'sepsis' && g !== 'choc_septique') || !ind || !SANS_TRAITEMENT.includes(ind.decision)) return;
  const etat = g === 'choc_septique' ? 'choc septique' : 'sepsis';
  const Etat = g === 'choc_septique' ? 'Choc septique' : 'Sepsis';
  const conclusionCdiff = `${ind.titre.charAt(0).toLowerCase()}${ind.titre.slice(1)}`;
  f.c.indication = {
    ...ind,
    decision: 'urgence',
    titre: `${Etat} : prise en charge sans attendre — pour C. difficile seulement : ${conclusionCdiff}`,
    raison: `Conclusion limitée à C. difficile : ${ind.raison} Elle ne dit rien du ${etat} déclaré, dont la cause (autre foyer) est à rechercher et la prise en charge à débuter sans délai (voir l'alerte ${etat}).`,
    actions: [`Prise en charge du ${etat} sans attendre, selon l'alerte affichée et le protocole local ; avis réanimation et SMIT`, 'Rechercher une autre cause ou un autre foyer infectieux', ...ind.actions],
  };
  if (f.c.situation)
    f.c.situation = { ...f.c.situation, couverture: 'partielle', description: `${f.c.situation.description} ${Etat} déclaré : sa cause et sa prise en charge sortent de cette fiche.` };
  f.alerte('attention', `${Etat} déclaré : la fiche C. difficile ne conclut pas à un traitement anti-C. difficile (${conclusionCdiff}). Ce n'est pas une conclusion sur le ${etat} : autre cause à rechercher, prise en charge sans attendre.`);
}

/** Pas de diarrhée ni d'iléus : pas de test ; un test positif n'est pas une indication ; pas de test de guérison. */
function sansDiarrhee(f: Fiche, test: string, choc: boolean) {
  const positif = test === 'toxine_positive' || test === 'taan_seul' || test === 'discordant';
  const sources = [
    ...SRC_PAS_DE_TEST_ASYMPTOMATIQUE,
    ...SRC_PAS_DE_CONTROLE,
    S(SP22, 'diapo 3 (définition)', 'Tableau clinique compatible + toxine libre par EIA* + pas d\'autre cause évidente de diarrhée', 'definition'),
    SRC_DEF_DIARRHEE[0],
    S(ESC21, 'p. 29', 'Routine prophylaxis with anti-CDI antibiotics when on systemic antibiotic treatment is not recommended.', 'choix'),
    ...(choc ? SRC_DEF_FULMINANTE : []),
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
      actions: ['Pas de traitement anti-C. difficile (ni curatif ni prophylactique)', 'Ne pas rechercher C. difficile chez un patient asymptomatique, ni pour contrôler la guérison', 'Précautions complémentaires contact : réservées aux patients symptomatiques (durée après une diarrhée récente : divergente, voir les gestes)'],
      reconsiderer: [
        ...(choc ? ['Choc : absence de selles par iléus, ou mégacôlon toxique ? Ce serait une forme grave et compliquée (répondre « iléus » à la question sur la diarrhée)'] : []),
        'Apparition d\'une diarrhée (au moins 3 selles non moulées en 24 h) ou d\'un iléus',
      ],
      sources,
    },
  );
  f.situation(positif ? 'cdiff-portage' : 'cdiff-sans-diarrhee', positif ? 'Recherche de C. difficile positive sans diarrhée (portage)' : 'Pas de diarrhée : ni test ni traitement de C. difficile', 'couverte', f.c.indication.raison);
  f.geste(`Précautions complémentaires contact : elles ne s'appliquent qu'aux patients symptomatiques (HCSP 2008). Diarrhée récemment résolue : durée ${TEXTE_DUREE_PCC}.`, [
    S(HCSP, 'p. 2', 'Les précautions « contact » ne s\'appliquent qu\'aux patients symptomatiques', 'geste'),
    ...SRC_DUREE_PCC,
  ]);
}

function testNegatif(f: Fiche) {
  const src = [
    S(ESC16, 'p. S79', 'Samples with a negative first test result can be reported as negative.', 'controle_micro'),
    SRC_PAS_DE_TEST_ASYMPTOMATIQUE[0],
  ];
  f.c.indication = indication('ne_pas_traiter', 'indeterminee', 'Recherche négative : pas de traitement de C. difficile', 'Un premier test (GDH ou TAAN) négatif permet de rendre le résultat négatif (algorithme en 2 étapes, ESCMID 2016) : l\'infection à C. difficile n\'est pas retenue.', {
    conditions: ['recherche de C. difficile négative (1re étape)'],
    actions: ['Pas de traitement anti-C. difficile', 'Rechercher une autre cause de diarrhée', 'Ne pas répéter le test dans les 7 jours au cours du même épisode'],
    reconsiderer: ['Aggravation ou apparition d\'une forme grave et compliquée : avis spécialisé'],
    sources: src,
  });
  f.situation('cdiff-test-negatif', 'Recherche de C. difficile négative', 'couverte', f.c.indication.raison);
}

/**
 * Recherche négative mais tableau grave et compliqué (choc, iléus, critère déclaré) : l'urgence est conservée,
 * le diagnostic est à revoir avec un avis chirurgical et infectiologique urgent. Aucune option n'est proposée :
 * les sources lues ne traitent pas ce cas (extrapolation, brouillon).
 */
function negatifFormeGrave(f: Fiche, ctx: ContexteDecision) {
  const criteres = criteresFulminante(ctx);
  const choc = ctx.dossier.patient.gravite === 'choc_septique';
  const src = [S(ESC16, 'p. S79', 'Samples with a negative first test result can be reported as negative.', 'controle_micro'), ...SRC_DEF_FULMINANTE, SRC_CHIRURGIEN];
  f.urgence('immediate');
  f.c.indication = indication('urgence', 'indeterminee', 'Recherche négative mais tableau grave et compliqué : avis chirurgical et infectiologique urgents', `Un premier test négatif permet de rendre le résultat négatif (ESCMID 2016) ; le tableau (${criteres.join(', ')}) correspond pourtant aux critères d'une forme grave et compliquée. Revoir le diagnostic sans attendre, avec un avis chirurgical et infectiologique urgent.`, {
    conditions: ['recherche de C. difficile négative (1re étape)', ...criteres],
    actions: [
      'Avis chirurgical et infectiologique urgents',
      'Revoir le diagnostic : autre cause du tableau',
      ...(choc ? ['Prise en charge du choc septique sans attendre, selon l\'alerte affichée et le protocole local ; avis réanimation'] : []),
    ],
    sources: src,
    statut: 'brouillon',
  });
  f.situation('cdiff-negatif-forme-grave', 'Recherche de C. difficile négative, tableau grave et compliqué', 'partielle', 'Recherche négative, mais critères de forme grave et compliquée : cas non traité par les sources lues ; urgence conservée, diagnostic à revoir avec avis chirurgical et infectiologique.');
  f.alerte('urgence', `Tableau grave et compliqué (${criteres.join(', ')}) malgré une recherche de C. difficile négative : urgence conservée, revoir le diagnostic, avis chirurgical et infectiologique urgents${choc ? ' ; prise en charge du choc sans attendre' : ''}.`, src);
  f.avis('Avis chirurgical et infectiologique urgents : tableau grave et compliqué malgré une recherche de C. difficile négative ; revoir le diagnostic (les sources lues ne traitent pas ce cas).', true, src);
}

function discordant(f: Fiche, fulminante: boolean | 'inconnu') {
  const src = [S(ESC16, 'p. S79', 'may represent samples with CDI or C. difficile carriage and may optionally be tested with TC or NAAT', 'controle_micro')];
  f.c.indication = indication('informations_insuffisantes', 'indeterminee', 'GDH ou TAAN positif, toxines négatives : infection ou portage', 'Ce profil peut correspondre à une infection ou à un simple portage (ESCMID 2016) : l\'interprétation est clinique.', {
    actions: ['Interprétation clinique avec le SMIT ou le microbiologiste', 'Si GDH positif et toxines négatives : TAAN ou culture toxigénique possible (ESCMID 2016)'],
    reconsiderer: ['Forme grave ou compliquée, aggravation'],
    sources: src,
    pointNonResolu: 'Profil GDH ou TAAN positif / toxines négatives : infection ou portage, non tranché par les sources lues (ESCMID 2016) ; aucun seuil de Ct de la PCR n\'est modélisé (ESCMID 2021 : « preferably with a low cycle threshold », sans valeur chiffrée).',
  });
  f.situation('cdiff-discordant', 'Infection à C. difficile ou portage (toxines négatives)', 'partielle', f.c.indication.raison);
  if (fulminante === 'inconnu')
    f.manque(CHAMP_FULMINANTE, 'forme grave et compliquée : traitement empirique admis malgré le profil discordant (IDSA 2017), avis chirurgical', 'bloque_decision', Q('compliquee'));
  f.avis('Profil GDH/TAAN positif et toxines négatives : décision de traiter avec le SMIT.', false, src);
}

/** TAAN seul : infection ou portage possible ; positions des sources affichées, options en brouillon. */
function taanSeul(f: Fiche) {
  const src = [
    S(SP22, 'diapo 3', 'Tableau clinique compatible + test PCR positif ou culture toxigénique positive', 'definition'),
    S(ESC21, 'p. 10', 'a positive nucleic acid amplification test (NAAT) preferably with a low cycle threshold (Ct) value', 'definition'),
    S(IDSA17, 'algorithme', 'Use a stool toxin test as part of a multistep algorithm', 'controle_micro'),
    S(ESC16, 'p. S79', 'Samples with a positive first test result should be tested further with a toxin A/B EIA.', 'controle_micro'),
  ];
  f.alerte('attention', 'TAAN (PCR) positif sans recherche de toxines : infection ou portage possible. La définition d\'un épisode l\'accepte avec un tableau clinique compatible (SPILF 2022), de préférence avec un Ct bas selon ESCMID 2021 (aucun seuil chiffré) ; IDSA 2017 préfère un test de toxines dans un algorithme en plusieurs étapes plutôt qu\'un TAAN seul ; ESCMID 2016 : compléter par la recherche de toxines A/B. Options en brouillon : décision avec le SMIT ou le microbiologiste.', src);
  f.controle({
    id: 'ctl-cdiff-toxines',
    type: 'prelevement',
    categorie: 'indique',
    quoi: 'Recherche des toxines A/B libres (EIA), 2e étape de l\'algorithme',
    quand: { ancre: 'avant_traitement', texte: 'Dès que possible, sur le même épisode' },
    pourquoi: 'Un TAAN positif seul ne distingue pas l\'infection du portage.',
    sources: src.slice(2),
  });
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
  f.geste('Précautions complémentaires contact pour le patient symptomatique : chambre individuelle avec sanitaires dédiés (IDSA 2017), gants et surblouse (IDSA 2017), surblouse à manches longues lors des contacts directs avec le patient ou ses excreta (HCSP 2008). IDSA 2017 : précautions préemptives si le résultat n\'est pas disponible le jour même.', [
    S(IDSA17, 'prévention', 'with a dedicated toilet', 'geste'),
    S(IDSA17, 'prévention (gants et surblouse ; précautions préemptives si résultat non disponible le jour même : paraphrase de la note §8, pas un extrait)', undefined, 'geste'),
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
  f.geste(`Durée des précautions contact (divergence non tranchée) : ${TEXTE_DUREE_PCC}.`, SRC_DUREE_PCC);
  f.geste('Pas de probiotiques ni de prophylaxie médicamenteuse.', [
    S(SP22, 'diapo 10', 'Aucune prophylaxie médicamenteuse, y compris par probiotiques, n\'est recommandée.', 'geste'),
    S(IA94, `probiotiques ${IA94_VALIDE}`, 'Les probiotiques ne sont pas recommandés', 'geste'),
  ]);
}

interface Manquant {
  champ: string;
  cible: string;
}

/** Facteurs de risque de récidive (SPILF 2026, d'après ESCMID 2021) au 1er épisode. */
function risqueRecidive(ctx: ContexteDecision, r: Reponse): { risque: 'oui' | 'non' | 'inconnu' | 'divergent'; raisons: string[]; manquants: Manquant[]; ageDivergent: boolean } {
  const p = ctx.dossier.patient;
  const raisons: string[] = [];
  const manquants: Manquant[] = [];
  let ageDivergent = false;
  if (p.age === undefined) manquants.push({ champ: 'âge', cible: 'patient.age' });
  else if (p.age > 65) raisons.push('âge > 65 ans');
  else if (p.age === 65) ageDivergent = true;
  const ante = r('antecedent');
  if (ante === 'oui') raisons.push('antécédent d\'infection à C. difficile');
  else if (ante === 'inconnu') manquants.push({ champ: 'antécédent d\'infection à C. difficile', cible: Q('antecedent') });
  // « Épisode lié aux soins ET hospitalisation dans les 3 derniers mois » : les deux éléments sont nécessaires.
  const h = r('hospitalisation');
  if (p.contexte === 'associe_aux_soins') {
    if (h === 'oui') raisons.push('épisode associé aux soins avec hospitalisation dans les 3 derniers mois');
    else if (h === 'inconnu') manquants.push({ champ: 'hospitalisation dans les 3 derniers mois', cible: Q('hospitalisation') });
  } else if (p.contexte === 'inconnu' && h !== 'non') {
    // Même libellé que R-DONNEES : une seule ligne « Compléter » vers le contexte.
    manquants.push({ champ: 'contexte communautaire ou associé aux soins', cible: 'patient.contexte' });
    if (h === 'inconnu') manquants.push({ champ: 'hospitalisation dans les 3 derniers mois', cible: Q('hospitalisation') });
  }
  const atb = r('atb');
  if (atb === 'oui') raisons.push('antibiothérapie systémique concomitante après le diagnostic');
  else if (atb === 'inconnu') manquants.push({ champ: 'antibiothérapie systémique poursuivie après le diagnostic', cible: Q('atb') });
  const ipp = r('ipp');
  if (ipp === 'oui') raisons.push('traitement par IPP');
  else if (ipp === 'inconnu') manquants.push({ champ: 'traitement par IPP', cible: Q('ipp') });
  const risque = raisons.length ? 'oui' : manquants.length ? 'inconnu' : ageDivergent ? 'divergent' : 'non';
  return { risque, raisons, manquants, ageDivergent };
}

const SRC_FDR = [
  S(SP26, 'tableau « Définitions » (d\'après ESCMID 2021)', 'Age > 65 ans', 'definition'),
  S(SP26, 'tableau « Définitions »', 'Episode antérieur d\'infection à C. difficile', 'definition'),
  S(SP26, 'tableau « Définitions » (d\'après ESCMID 2021)', 'Episode lié aux soins et hospitalisation dans les 3 derniers mois', 'definition'),
  S(SP26, 'tableau « Définitions »', 'Antibiothérapie systémique concomitante après le diagnostic', 'definition'),
  S(SP26, 'tableau « Définitions »', 'Traitement par IPP pendant ou au décours du diagnostic', 'definition'),
  S(ESC21, 'p. 27', 'prior CDI episode(s)', 'definition'),
  S(ESC21, 'p. 27', 'concomitant non-CDI antibiotic use after the diagnosis', 'definition'),
];
const SRC_AGE_DIVERGENT = [S(SP26, 'tableau « Définitions »', 'Age > 65 ans', 'definition'), S(RP26, 'haut risque', 'âge ≥ 65 ans', 'definition')];
const TEXTE_AGE_DIVERGENT = 'Seuil d\'âge du haut risque de récidive divergent : « > 65 ans » (SPILF 2026, ESCMID 2021) ou « ≥ 65 ans » (Revue du Praticien). À 65 ans, les deux conduites sont affichées.';

function traitement(f: Fiche, ctx: ContexteDecision, r: Reponse, fulminante: boolean | 'inconnu', test: string) {
  const p = ctx.dossier.patient;
  f.alerte('info', 'Traitement par voie orale (ou intraluminale) : la vancomycine IV n\'est pas efficace sur l\'infection à C. difficile.', [S(RCP_VO, '§4.4', 'L\'administration intraveineuse de vancomycine n\'est pas efficace pour le traitement des infections à Clostridium difficile.', 'choix')]);
  if (p.allergies.some((a) => /macrolide|[ée]rythromycine|clarithromycine|azithromycine|spiramycine|roxithromycine|josamycine|t[ée]lithromycine/i.test(a.molecule)))
    f.alerte('attention', 'Allergie à un macrolide déclarée : l\'exclusion des macrolides ne s\'applique pas à la fidaxomicine, qui reste proposée (le RCP ne la contre-indique pas), mais le RCP demande la prudence : préciser le type de réaction et surveiller l\'hypersensibilité (dont l\'angio-œdème).', [
      S(RCP_F, '§4.4', 'prudence chez les patients ayant une allergie connue aux macrolides', 'surveillance'),
      S(RCP_F, '§4.4', 'angioedèmes sévères', 'surveillance'),
    ]);
  if (p.allaitement === 'oui')
    f.alerte('info', 'Allaitement : avec la fidaxomicine, interrompre l\'allaitement ou le traitement selon le bénéfice ; vancomycine orale envisageable (RCP).', [S(RCP_F, '§4.6', 'interrompre l\'allaitement ou le traitement selon le bénéfice', 'autre'), S(RCP_VO, '§4.6', 'envisageable', 'autre')]);
  if (ctx.grossessePossible && p.grossesse === 'inconnu')
    f.manque('grossesse', 'fidaxomicine à éviter pendant la grossesse (RCP), vancomycine préférée (ESCMID 2021) : le choix de la 1re ligne en dépend', 'bloque_decision', 'patient.grossesse');
  const pgp = r('pgp');
  if (pgp === 'oui')
    f.alerte('attention', 'Inhibiteur puissant de la P-gp déclaré (ciclosporine, kétoconazole, érythromycine, clarithromycine, vérapamil, dronédarone ou amiodarone) : association avec la fidaxomicine déconseillée (RCP §4.5).', [S(RCP_F, '§4.5', 'la ciclosporine, le kétoconazole, l\'érythromycine, la clarithromycine, le vérapamil, la dronédarone et l\'amiodarone', 'surveillance')]);
  else if (pgp === 'inconnu' && p.traitementsAssocies.some((t) => t === 'qt_allongeant' || t === 'immunosuppresseur_calcineurine'))
    f.manque('inhibiteur puissant de la P-gp (ciclosporine, amiodarone, dronédarone, vérapamil…)', 'association déconseillée avec la fidaxomicine (RCP §4.5)', 'affine', Q('pgp'));
  f.reeval('Évaluer la réponse chaque jour et ne conclure qu\'après au moins 3 jours de traitement (en l\'absence d\'aggravation) ; pas de réponse après 3 à 5 jours : forme réfractaire — revoir le diagnostic si la forme est non compliquée et stable, avis chirurgical en cas d\'aggravation.', [
    S(ESC21, 'p. 10', 'after at least 3 days, assuming that the patient is not worsening on treatment', 'definition'),
    S(SP22, 'diapo 4', 'Absence de réponse au traitement après 3-5 jours', 'definition'),
    S(ESC21, 'p. 20', 'carefully re-evaluate the diagnosis of CDI and consider an alternative diagnosis.', 'choix'),
    S(ESC21, 'p. 20', 'Consult a surgeon as soon as a patient\'s condition is deteriorating and the patient is not responding to CDI treatment.', 'choix'),
  ], 72);
  f.reeval('Pas de test de guérison : l\'efficacité se juge sur la clinique. Ne pas prolonger au-delà de 10-14 jours pour une non-réponse ou une antibiothérapie associée. Informer le patient sortant des signes de récidive.', [
    ...SRC_PAS_DE_CONTROLE,
    S(ESC21, 'p. 31', 'we also discourage treatment beyond the recommended standard duration of 10-14 days with SoC antibiotics because of lack of response or co-administered antibiotic treatment.', 'duree'),
    S(HCSP, 'p. 5 (information du patient sortant : paraphrase de la note §15.6, pas un extrait)', undefined, 'autre'),
  ]);
  const grave = r('gravite');
  if (fulminante === 'inconnu') f.manque(CHAMP_FULMINANTE, 'forme fulminante : avis chirurgical et schéma divergent IDSA / ESCMID-SPILF', 'bloque_decision', Q('compliquee'));
  if (fulminante === true) {
    formeFulminanteTraitement(f, ctx, r, test);
    return;
  }
  if (grave === 'inconnu')
    f.manque('critères de gravité de l\'ICD (température > 38,5 °C, leucocytes > 15 G/L, créatininémie > 50 % de la valeur de base, imagerie)', 'forme grave : vancomycine ou fidaxomicine sans supériorité démontrée ; forme non sévère : arrêt de l\'inducteur et surveillance 48 h', 'affine', Q('gravite'));
  if (grave === 'oui') {
    f.alerte('info', 'Forme grave : pas d\'ajout systématique de métronidazole IV ; la vancomycine 500 mg × 4/j prévue par le RCP pour les formes sévères n\'est pas recommandée par ESCMID 2021 (divergence : 125 mg × 4/j retenu). Critère créatinine : ESCMID/SPILF en valeur relative (> 50 % de la base), IDSA en valeur absolue (> 1,5 mg/dL).', [
      S(ESC21, 'p. 17', 'For severe CDI, routine addition of i.v. metronidazole to oral SoC therapy is not recommended.', 'choix'),
      S(IA94, `ICD grave ${IA94_VALIDE}`, 'Pas d\'association systématique avec le métronidazole', 'choix'),
      S(RCP_VO, '§4.2', 'Cette dose peut être augmentée à 500 mg toutes les 6 heures pendant 10 jours en cas d\'ICD sévère ou compliquée.', 'posologie'),
      S(ESC21, 'p. 13', 'The use of vancomycin 500 mg four times daily is not recommended.', 'posologie'),
      S(ESC21, 'p. 11', 'fever i.e. core body temperature >38.5 °C, marked leukocytosis i.e. leukocyte count >15 x 10^9/L, and rise in serum creatinine, i.e. >50% above the baseline', 'definition'),
      S(IDSA17, 'sévérité (tableau)', 'a serum creatinine level >1.5 mg/dL', 'definition'),
    ]);
  }
  const voie = r('voie_orale');
  if (voie === 'non') {
    voieOraleImpossible(f);
    return;
  }
  if (voie === 'inconnu') f.manque('voie orale possible', 'voie orale impossible : administration intraluminale (sonde gastroduodénale ou voie colique), avis spécialisé (ESCMID 2021)', 'affine', Q('voie_orale'));
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
    default: {
      f.situation('cdiff-episode-a-preciser', 'Infection à C. difficile : rang de l\'épisode à préciser', 'partielle', 'La fidaxomicine 200 mg × 2/j pendant 10 jours est un traitement de 1re ligne du 1er épisode comme de la 1re récidive ; les alternatives, la place de la TMF et les schémas pulsés dépendent du rang de l\'épisode.');
      f.manque('rang de l\'épisode (1er épisode, 1re récidive, récidives multiples)', 'alternatives, schémas pulsés et place de la TMF', 'bloque_decision', Q('episode'));
      f.option({ id: 'cdiff-fidaxo', libelle: 'Fidaxomicine (schéma standard)', type: 'documente', rang: 'premiere_ligne', items: [FIDAXO], duree: D_FIDAXO, sources: [S(ESC21, 'p. 13', 'For the initial episode of CDI we recommend fidaxomicin 200 mg twice daily for 10 days.', 'choix'), SRC_VANCO_2E_INTENTION] });
      if (fidaxoEvitee(ctx))
        f.option({ id: 'cdiff-vanco', libelle: 'Vancomycine per os (schéma standard)', type: 'documente', rang: 'alternative', items: [VANCO], duree: D_VANCO, statut: 'brouillon', sources: [S(ESC21, 'p. 13', 'oral vancomycin 125 mg four times daily for 10 days is a suitable alternative.', 'choix'), SRC_VANCO_2E_INTENTION], commentaire: 'Fidaxomicine évitée (allergie déclarée) : vancomycine en alternative ; schéma à confirmer selon le rang de l\'épisode.' });
    }
  }
}

function premierEpisode(f: Fiche, ctx: ContexteDecision, r: Reponse, grave: boolean) {
  const { risque, raisons, manquants, ageDivergent } = risqueRecidive(ctx, r);
  const libGrave = grave ? ', forme grave' : '';
  const evitee = fidaxoEvitee(ctx);
  const srcFidaxo1 = [
    S(ESC21, 'p. 13', 'For the initial episode of CDI we recommend fidaxomicin 200 mg twice daily for 10 days.', 'choix'),
    S(IDSA21, 'épisode initial', 'we suggest using fidaxomicin rather than a standard course of vancomycin', 'choix'),
  ];
  const srcGrave = [S(ESC21, 'p. 17', 'vancomycin 125 mg four times daily for 10 days or fidaxomicin 200 mg twice daily for 10 days. There is no data supporting the superiority of one over the other.', 'choix'), S(SP22, 'diapo 8', 'Vancomycine ou fidaxomicine. Voie orale impossible: administration locale +/- métronidazole IV ou tigécycline', 'choix')];
  const commentaireSansFdr = 'Branche « sans facteur de risque » de l\'algorithme SPILF 2026 illisible (image) ; la Revue du Praticien indique qu\'elle « suit l\'algorithme habituel » : schéma ESCMID 2021 / SPILF 2022 repris, NON TRANCHÉ, à confirmer sur le texte écrit SPILF 2026.';
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
      sources: grave ? srcGrave : [S(ESC21, 'p. 13', 'oral vancomycin 125 mg four times daily for 10 days is a suitable alternative.', 'choix'), S(SP22, 'algorithme (2e choix, d\'après la note §15.4 A)', undefined, 'choix')],
      condition: extra.condition,
      statut: extra.statut,
      commentaire: [extra.commentaire, COMMENTAIRE_METRO].filter(Boolean).join(' '),
    });
  const fidaxoStd = (extra: { statut?: 'brouillon'; commentaire?: string } = {}) =>
    f.option({ id: 'cdiff-1er-fidaxo', libelle: 'Fidaxomicine (schéma standard)', type: 'documente', rang: 'premiere_ligne', items: [FIDAXO], duree: D_FIDAXO, sources: risque === 'oui' ? srcHautRisque : grave ? [...srcFidaxo1, ...srcGrave] : srcFidaxo1, ...extra });
  const fidaxoPulse = (rang: 'alternative' | 'conditionnelle', extra: { condition?: string; statut?: 'brouillon'; commentaire?: string } = {}) =>
    f.option({ id: 'cdiff-1er-fidaxo-pulse', libelle: 'Fidaxomicine (schéma prolongé-pulsé)', type: 'documente', rang, items: [FIDAXO_P], duree: D_FIDAXO_P, sources: srcHautRisque, ...extra });
  switch (risque) {
    case 'non':
      // Branche non tranchée (note §15.4 A et §15.7 n° 1) : brouillon, couverture partielle.
      f.situation('cdiff-1er-episode', `1er épisode d'infection à C. difficile sans facteur de risque de récidive${libGrave}`, 'partielle', `${grave ? 'Forme grave : vancomycine ou fidaxomicine, sans supériorité démontrée de l\'une sur l\'autre (ESCMID 2021, SPILF 2022).' : 'Fidaxomicine en 1re intention ; vancomycine en alternative (ESCMID 2021).'} Branche de l'algorithme SPILF 2026 illisible : non tranché.`);
      fidaxoStd({ statut: 'brouillon', commentaire: commentaireSansFdr });
      vancoStd(grave ? 'premiere_ligne' : 'alternative', { statut: 'brouillon', commentaire: commentaireSansFdr });
      return;
    case 'oui':
      f.situation('cdiff-1er-episode-haut-risque', `1er épisode d'infection à C. difficile à haut risque de récidive${libGrave}`, 'couverte', `Facteur(s) : ${raisons.join(', ')}. Fidaxomicine seule, en schéma standard ou prolongé-pulsé (SPILF 2026).`);
      f.alerte('info', `Haut risque de récidive (${raisons.join(', ')}).`, SRC_FDR);
      fidaxoStd();
      fidaxoPulse('alternative');
      if (grave || evitee)
        vancoStd('conditionnelle', {
          statut: 'brouillon',
          condition: evitee ? 'Fidaxomicine non utilisable (allergie déclarée) : conduite non tranchée — avis spécialisé' : 'Forme grave : à discuter avec l\'avis spécialisé',
          commentaire: [
            grave ? 'Forme grave : vancomycine ou fidaxomicine sans supériorité (ESCMID 2021, SPILF 2022) ; haut risque de récidive : fidaxomicine seule (SPILF 2026). Articulation des deux situations non précisée par les sources lues.' : '',
            evitee ? 'Fidaxomicine évitée (allergie déclarée) chez un patient à haut risque : la Revue du Praticien écrit que la vancomycine n\'est plus proposée, la diapositive SPILF 2026 ne vise que la vancomycine pulsée seule (divergence).' : '',
          ].filter(Boolean).join(' '),
        });
      f.ecarter('Vancomycine en schéma pulsé seule', 'inadaptee', 'non recommandée en alternative à la fidaxomicine au 1er épisode à haut risque de récidive (SPILF 2026, grade AE)', [S(SP26, '1er épisode à haut risque', 'La vancomycine pulsée seule n\'est pas recommandée en alternative à la fidaxomicine en schéma classique ou pulsée. (Grade AE)', 'choix')]);
      ecarterBezlotoxumab(f);
      f.reeval('Pas de transplantation de microbiote fécal après la fin de la fidaxomicine (standard ou pulsée) au 1er épisode.', [S(SP26, '1er épisode à haut risque', 'La TMF n\'est pas recommandée après la fin de la fidaxomicine standard ou pulsée. Grade AE', 'choix')]);
      f.avis('Fidaxomicine non disponible ou non accessible chez ce patient à haut risque de récidive : conduite non tranchée (bezlotoxumab retiré ; la Revue du Praticien écrit que la vancomycine n\'est plus proposée, la diapositive SPILF 2026 ne vise que la vancomycine pulsée seule) — avis spécialisé.', false, [
        S(RP26, 'haut risque', 'La vancomycine n\'est plus proposée en alternative à la fidaxomicine', 'choix'),
        S(SP26, '1er épisode à haut risque', 'La vancomycine pulsée seule n\'est pas recommandée en alternative à la fidaxomicine en schéma classique ou pulsée. (Grade AE)', 'choix'),
        S(BDPM_F, 'conditions de délivrance', 'prescription hospitalière', 'autre'),
      ]);
      return;
    case 'divergent':
      f.situation('cdiff-1er-episode-seuil-age', `1er épisode d'infection à C. difficile, patient de 65 ans${libGrave}`, 'partielle', 'Seul facteur possible : l\'âge de 65 ans, facteur de risque de récidive selon la Revue du Praticien (≥ 65 ans) mais pas selon la diapositive SPILF 2026 et ESCMID 2021 (> 65 ans). Divergence non tranchée.');
      f.alerte('attention', TEXTE_AGE_DIVERGENT, SRC_AGE_DIVERGENT);
      fidaxoStd();
      fidaxoPulse('alternative', { statut: 'brouillon', commentaire: 'Seulement si 65 ans est retenu comme facteur de risque de récidive (seuil « ≥ 65 ans » de la Revue du Praticien).' });
      vancoStd(grave ? 'premiere_ligne' : 'alternative', { statut: 'brouillon', commentaire: `Seulement si 65 ans n'est pas retenu comme facteur de risque de récidive (seuil « > 65 ans »). ${commentaireSansFdr}` });
      return;
    default:
      f.situation('cdiff-1er-episode-risque-a-preciser', `1er épisode d'infection à C. difficile : facteurs de risque de récidive à préciser${libGrave}`, 'partielle', `À préciser : ${manquants.map((m) => m.champ).join(', ')}. La fidaxomicine standard est de 1re ligne dans tous les cas ; l'alternative dépend du risque de récidive.`);
      if (ageDivergent) f.alerte('attention', TEXTE_AGE_DIVERGENT, SRC_AGE_DIVERGENT);
      for (const m of manquants) f.manque(m.champ, 'facteur de risque de récidive : alternative à la fidaxomicine standard (SPILF 2026)', 'affine', m.cible);
      fidaxoStd();
      fidaxoPulse('conditionnelle', { condition: `si au moins un facteur de risque de récidive${ageDivergent ? ' (65 ans : seuil divergent)' : ''}` });
      vancoStd('conditionnelle', { condition: 'si aucun facteur de risque de récidive', statut: 'brouillon', commentaire: commentaireSansFdr });
  }
}

function premiereRecidive(f: Fiche, ctx: ContexteDecision, r: Reponse) {
  const precedent = r('traitement_precedent');
  const apresFidaxo = precedent === 'fidaxomicine';
  const evitee = fidaxoEvitee(ctx);
  f.situation('cdiff-1re-recidive', '1re récidive d\'infection à C. difficile', apresFidaxo ? 'partielle' : 'couverte', 'Récidive : nouvel épisode dans les 8 semaines après résolution du précédent. Fidaxomicine en 1re ligne (standard ou prolongée-pulsée) ; vancomycine en 2e intention si la fidaxomicine n\'est pas disponible ; TMF à discuter (SPILF 2026).');
  if (precedent === 'inconnu') f.manque('traitement de l\'épisode précédent', 'TMF recommandée après vancomycine, possible après fidaxomicine ; récidive après fidaxomicine non tranchée', 'affine', Q('traitement_precedent'));
  const commentaireApresFidaxo = apresFidaxo ? '1re récidive après un épisode traité par fidaxomicine : conduite non explicite dans le texte lisible de SPILF 2026 (ESCMID 2021 proposait l\'ajout du bezlotoxumab, retiré) — avis spécialisé.' : undefined;
  const srcFidaxo = [
    S(SP26, '1re récidive', 'La fidaxomicine pulsée est une alternative au schéma standard. (Grade AE)', 'choix'),
    SRC_VANCO_2E_INTENTION,
    S(IDSA21, 'récidive', 'we suggest fidaxomicin (standard or extended-pulsed regimen) rather than a standard course of vancomycin', 'choix'),
    ...(precedent === 'vancomycine' || precedent === 'metronidazole' ? [S(ESC21, 'p. 22', 'If the initial CDI episode was treated with vancomycin or metronidazole, then fidaxomicin 200 mg twice daily for 10 days is the preferred agent to treat a first CDI recurrence.', 'choix')] : []),
  ];
  const statut = apresFidaxo ? ('brouillon' as const) : undefined;
  f.option({ id: 'cdiff-recidive-fidaxo', libelle: 'Fidaxomicine (schéma standard)', type: 'documente', rang: 'premiere_ligne', items: [FIDAXO], duree: D_FIDAXO, sources: srcFidaxo, statut, commentaire: commentaireApresFidaxo });
  f.option({ id: 'cdiff-recidive-fidaxo-pulse', libelle: 'Fidaxomicine (schéma prolongé-pulsé)', type: 'documente', rang: 'alternative', items: [FIDAXO_P], duree: D_FIDAXO_P, sources: srcFidaxo, statut, commentaire: commentaireApresFidaxo });
  // Vancomycine : 2e intention « lorsque la fidaxomicine n'est pas disponible ou accessible » (Rev Prat 2026).
  // Fidaxomicine évitée (allergie déclarée) : cette condition est remplie, la vancomycine passe en 1re ligne.
  const condVanco = evitee ? undefined : 'seulement si la fidaxomicine n\'est pas disponible ou pas accessible';
  const commentaireEvitee = evitee ? 'Fidaxomicine évitée (allergie déclarée) : vancomycine, traitement de 2e intention lorsque la fidaxomicine n\'est pas disponible ou accessible (Revue du Praticien 2026). ' : '';
  const srcVanco = [
    SRC_VANCO_2E_INTENTION,
    S(SP26, '1re récidive', 'La vancomycine pulsée n\'est pas recommandée en remplacement de la fidaxomicine (Std ou pulsée) lorsque celle-ci est disponible et accessible (Grade AE).', 'choix'),
  ];
  f.option({ id: 'cdiff-recidive-vanco', libelle: 'Vancomycine per os (schéma standard)', type: 'documente', rang: evitee ? 'premiere_ligne' : 'conditionnelle', condition: condVanco, items: [VANCO], duree: D_VANCO, sources: srcVanco, commentaire: `${commentaireEvitee}Après la vancomycine, la TMF est recommandée (SPILF 2026, grade B).` });
  f.option({ id: 'cdiff-recidive-vanco-pulse', libelle: 'Vancomycine per os (schéma dégressif-pulsé, 6 semaines)', type: 'documente', rang: evitee ? 'alternative' : 'conditionnelle', condition: condVanco, items: [VANCO_P], duree: D_VANCO_P, sources: [...srcVanco, S(SP26, '1re récidive', 'La vancomycine pulsée est possible en alternative à la vancomycine standard. (Grade AE)', 'choix')], commentaire: `${commentaireEvitee}Après la vancomycine pulsée, la TMF est recommandée (SPILF 2026, grade C).` });
  const plus70 = ctx.dossier.patient.age !== undefined && ctx.dossier.patient.age > 70;
  f.avis(
    `Transplantation de microbiote fécal (TMF) à discuter avec un centre de TMF (SPILF 2026) : recommandée après un traitement par vancomycine standard (grade B) ou pulsée (grade C) ; possible après la fidaxomicine standard ou pulsée (grade AE) ; possible chez les patients à haut risque de morbi-mortalité lié à l'ICD (comorbidités majeures, antécédents d'ICD grave compliquée ou réfractaire) (grade AE) ; possible quel que soit le traitement reçu chez les patients de plus de 70 ans (grade C)${plus70 ? ', comme ce patient' : ''}. Divergence : IDSA 2017 ne propose la TMF qu'après au moins 2 récidives (3 épisodes). Modalités de la TMF non modélisées.`,
    false,
    [
      S(SP26, 'TMF en 1re récidive', 'La TMF est recommandée après la vancomycine Std (Grade B) ou pulsée (Grade C).', 'choix'),
      S(SP26, 'TMF en 1re récidive', 'La TMF est possible après la fidaxomicine (Std ou pulsée). Grade AE', 'choix'),
      S(SP26, 'TMF en 1re récidive', 'possible chez les patients à haut risque de morbi-mortalité lié à l\'ICD (comorbidités majeures, antécédents d\'ICD grave compliquée ou réfractaire). (Grade AE)', 'choix'),
      S(SP26, 'TMF en 1re récidive', 'possible après quel que soit le traitement reçu chez les patients de plus de 70 ans. (Grade C)', 'choix'),
      S(IDSA17, 'TMF', 'appropriate antibiotic treatments for at least 2 recurrences (ie, 3 CDI episodes) should be tried prior to offering fecal microbiota transplantation', 'choix'),
    ],
  );
  if (apresFidaxo) f.avis(commentaireApresFidaxo!, false, [S(SP26, '1re récidive', undefined, 'choix')]);
  ecarterBezlotoxumab(f);
}

const SRC_RECIDIVES_MULTIPLES = [
  S(RP26, 'récidives multiples', 'En cas de nouvelle(s) récidive(s), la SPILF recommande un traitement à base de vancomycine ou de fidaxomicine, suivi par une TMF.', 'choix'),
  S(ESC21, 'p. 24', 'Treatment options for a second or further CDI recurrence include FMT after SoC antibiotic pre-treatment or bezlotoxumab in addition to SoC', 'choix'),
];
const SRC_CENTRE_TMF = [
  S(ESC21, 'p. 24', 'For FMT an adequate multidisciplinary risk assessment is mandatory', 'choix'),
  S(IDSA17, 'TMF', 'appropriate antibiotic treatments for at least 2 recurrences (ie, 3 CDI episodes) should be tried prior to offering fecal microbiota transplantation', 'choix'),
  S(SP26, 'contexte 2', 'Validation des centres de TMF', 'autre'),
];
const TEXTE_CENTRE_TMF = 'Orienter vers un centre de transplantation de microbiote fécal (centres validés GFTF/ANSM) : évaluation multidisciplinaire du risque obligatoire avant la TMF. À ce stade (2e récidive ou plus), la TMF est retenue par SPILF 2026, ESCMID 2021 et IDSA 2017 (après au moins 2 récidives).';

function recidivesMultiples(f: Fiche) {
  f.situation('cdiff-recidives-multiples', 'Récidives multiples d\'infection à C. difficile (2e récidive ou plus)', 'partielle', 'Traitement par vancomycine ou fidaxomicine, suivi d\'une transplantation de microbiote fécal (TMF) dans un centre spécialisé ; schéma antibiotique et modalités de la TMF non précisés par les sources lues.');
  const commentaire = 'Vancomycine ou fidaxomicine, sans ordre de préférence dans les sources lues. Schéma non précisé par la source (« un traitement à base de vancomycine ou de fidaxomicine », Revue du Praticien 2026) : le schéma standard de 10 jours affiché est celui du 1er épisode, à confirmer avec le centre de TMF. Délai, produit et voie de la TMF à définir avec le centre (non modélisés).';
  f.option({ id: 'cdiff-multi-vanco', libelle: 'Vancomycine per os (schéma non précisé par la source ; schéma standard affiché), puis TMF', type: 'documente', rang: 'premiere_ligne', items: [VANCO], duree: D_VANCO, statut: 'brouillon', sources: SRC_RECIDIVES_MULTIPLES, commentaire });
  f.option({ id: 'cdiff-multi-fidaxo', libelle: 'Fidaxomicine (schéma non précisé par la source ; schéma standard affiché), puis TMF', type: 'documente', rang: 'premiere_ligne', items: [FIDAXO], duree: D_FIDAXO, statut: 'brouillon', sources: SRC_RECIDIVES_MULTIPLES, commentaire });
  f.avis(TEXTE_CENTRE_TMF, false, SRC_CENTRE_TMF);
  ecarterBezlotoxumab(f);
  f.ecarter('Rifaximine en relais', 'inadaptee', 'non recommandée (possible résistance croisée avec la rifampicine)', [S(IA94, `récidives ${IA94_VALIDE}`, 'La rifaximine est non recommandée devant une possible résistance croisée avec la rifampicine.', 'choix')]);
}

function voieOraleImpossible(f: Fiche) {
  f.situation('cdiff-voie-orale-impossible', 'Infection à C. difficile : voie orale impossible', 'partielle', 'Administration intraluminale (sonde gastroduodénale ou voie colique) de vancomycine aux doses orales standard, avec avis spécialisé (ESCMID 2021, SPILF 2022).');
  f.option({
    id: 'cdiff-intraluminal-vanco',
    libelle: 'Vancomycine 125 mg toutes les 6 h par sonde gastroduodénale ou par voie colique',
    type: 'documente',
    rang: 'premiere_ligne',
    items: [VANCO_IL],
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

const SRC_GROSSESSE_FORTE_DOSE = S(ESC21, 'p. 31', 'prolonged administration and high dosing of vancomycin should be discouraged', 'choix');

function grossesse(f: Fiche, r: Reponse) {
  f.situation('cdiff-grossesse', 'Infection à C. difficile pendant la grossesse', 'partielle', 'Vancomycine préférée (ESCMID 2021) ; fidaxomicine à éviter faute de données (RCP). Fortes doses et traitements prolongés de vancomycine déconseillés.');
  const episode = r('episode');
  if (episode === 'inconnu') f.manque('rang de l\'épisode (1er épisode, 1re récidive, récidives multiples)', 'récidive pendant la grossesse : avis spécialisé et obstétrical ; récidives multiples : place de la TMF', 'affine', Q('episode'));
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
  f.alerte('attention', 'Grossesse : vancomycine à forte dose (500 mg × 4/j) et schémas prolongés (pulsés) déconseillés (ESCMID 2021 : « should be discouraged »).', [SRC_GROSSESSE_FORTE_DOSE]);
  if (episode === 'premiere_recidive' || episode === 'recidives_multiples')
    f.avis('Récidive pendant la grossesse : la conduite (schémas pulsés, TMF) n\'est pas détaillée pour la grossesse dans les sources lues — avis spécialisé et obstétrical.', false, [SRC_GROSSESSE_FORTE_DOSE]);
  if (episode === 'recidives_multiples') f.avis(`${TEXTE_CENTRE_TMF} Grossesse : place de la TMF non détaillée par les sources lues.`, false, [...SRC_RECIDIVES_MULTIPLES, ...SRC_CENTRE_TMF]);
}

function formeFulminanteTraitement(f: Fiche, ctx: ContexteDecision, r: Reponse, test: string) {
  const p = ctx.dossier.patient;
  const criteres = criteresFulminante(ctx);
  const discordant = test === 'discordant';
  const confirme = test === 'toxine_positive' || test === 'taan_seul';
  const enceinte = p.grossesse === 'oui';
  f.situation(
    'cdiff-fulminante',
    `Infection à C. difficile grave et compliquée (fulminante)${discordant ? ' — toxines négatives : infection ou portage' : ''}`,
    'partielle',
    `Classée grave et compliquée : ${criteres.join(', ')}. Avis chirurgical systématique et précoce, prise en charge multidisciplinaire. Schéma antibiotique divergent entre IDSA 2017 et ESCMID 2021 / SPILF 2022 : non tranché, les deux sont affichés.`,
  );
  f.urgence('immediate');
  f.alerte('urgence', `Forme grave et compliquée (fulminante) — ${criteres.join(', ')} : avis chirurgical systématique et précoce, prise en charge multidisciplinaire (chirurgien, réanimateur, infectiologue).`, SRC_DEF_FULMINANTE);
  f.avis('Avis chirurgical systématique et précoce (toute forme grave et compliquée) ; approche multidisciplinaire.', true, [SRC_CHIRURGIEN, S(SP22, 'diapo 8', 'Vancomycine ou fidaxomicine. Approche multidisciplinaire avec avis chirurgical. Évaluation TMF3 et tigécycline si réfractaire', 'choix')]);
  f.avis('Chirurgie : colectomie subtotale avec conservation du rectum, ou iléostomie de dérivation avec lavage colique et vancomycine antérograde (IDSA 2017) ; colectomie partielle ou iléostomie pour éviter la colectomie totale (ESCMID 2021). Seuils chirurgicaux non trouvés dans les sources lues. Si la chirurgie est impossible : TMF de sauvetage à discuter ; tigécycline IV (charge 100 mg puis 50 mg × 2/j) à discuter en cas d\'aggravation (ESCMID 2021, recommandations faibles ; RCP non lu, non modélisée).', false, [
    S(IDSA17, 'chirurgie', 'perform subtotal colectomy with preservation of the rectum', 'choix'),
    S(IDSA17, 'chirurgie', 'Diverting loop ileostomy with colonic lavage followed by antegrade vancomycin flushes is an alternative approach', 'choix'),
    S(ESC21, 'p. 17', 'Total abdominal colectomy might be prevented by partial colectomy or loop ileostomy.', 'choix'),
    S(ESC21, 'p. 17', '50 mg twice daily (100 mg loading dose) may be considered on a case-by-case basis', 'choix'),
  ]);
  f.alerte('attention', 'Divergence non tranchée : IDSA/SHEA 2017 recommande la vancomycine 500 mg × 4/j per os, par voie rectale en cas d\'iléus, et le métronidazole IV 500 mg toutes les 8 h ; ESCMID 2021 et SPILF 2022 retiennent vancomycine 125 mg × 4/j ou fidaxomicine 200 mg × 2/j, sans forte dose ni métronidazole IV systématique. Choix avec l\'avis spécialisé.', [
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
  if (enceinte) f.alerte('attention', 'Grossesse : fortes doses et traitements prolongés de vancomycine déconseillés (ESCMID 2021) ; fidaxomicine : préférable de l\'éviter (RCP).', [SRC_GROSSESSE_FORTE_DOSE, S(RCP_F, '§4.6', 'il est préférable d\'éviter l\'utilisation de la fidaxomicine pendant la grossesse', 'choix')]);
  const condition = `Divergence IDSA / ESCMID-SPILF non tranchée : choix avec l'avis spécialisé (chirurgien, infectiologue, réanimateur)${discordant ? ' ; profil GDH/TAAN positif et toxines négatives (infection ou portage) : décision de traiter avec le SMIT' : ''}`;
  const srcEu = [S(ESC21, 'p. 17', 'vancomycin 125 mg four times daily for 10 days or fidaxomicin 200 mg twice daily for 10 days. There is no data supporting the superiority of one over the other.', 'choix'), S(SP22, 'diapo 8', 'Vancomycine ou fidaxomicine. Approche multidisciplinaire avec avis chirurgical. Évaluation TMF3 et tigécycline si réfractaire', 'choix')];
  f.option({ id: 'cdiff-fulminante-vanco-125', libelle: 'Vancomycine 125 mg toutes les 6 h (ESCMID 2021, SPILF 2022)', type: 'documente', rang: 'conditionnelle', condition, items: [VANCO], duree: D_VANCO, statut: 'brouillon', sources: srcEu, commentaire: 'Pas d\'ajout systématique de métronidazole IV (ESCMID 2021).' });
  f.option({
    id: 'cdiff-fulminante-fidaxo',
    libelle: 'Fidaxomicine 200 mg toutes les 12 h (ESCMID 2021, SPILF 2022)',
    type: 'documente',
    rang: 'conditionnelle',
    condition: `${condition}${enceinte ? ' ; grossesse : préférable d\'éviter la fidaxomicine (RCP)' : ''}`,
    items: [FIDAXO],
    duree: D_FIDAXO,
    statut: 'brouillon',
    sources: [...srcEu, S(RCP_F, '§4.4', 'colite pseudo-membraneuse ou une ICD fulminante ou engageant le pronostic vital', 'choix'), ...(confirme ? [] : [S(BDPM_F, 'SMR', 'insuffisant dans les infections où Clostridium difficile n\'est pas objectivé', 'autre')])],
    commentaire: `RCP : prudence, données limitées dans les ICD fulminantes ; administration intraluminale : pas de données (ESCMID 2021).${confirme ? '' : ' C. difficile non encore objectivé : SMR jugé insuffisant dans ce cas (BDPM) ; prescription hospitalière.'}`,
  });
  f.option({
    id: 'cdiff-fulminante-idsa',
    libelle: 'Vancomycine 500 mg toutes les 6 h per os (IDSA/SHEA 2017)',
    type: 'documente',
    rang: 'conditionnelle',
    condition: `${condition}${enceinte ? ' ; grossesse : fortes doses de vancomycine déconseillées (ESCMID 2021)' : ''}`,
    items: [VANCO_500],
    duree: D_VANCO_500,
    statut: 'brouillon',
    sources: [S(IDSA17, 'fulminant CDI', 'vancomycin administered orally is the regimen of choice', 'choix'), S(IDSA17, 'fulminant CDI', 'The vancomycin dosage is 500 mg orally 4 times per day and 500 mg in approximately 100 mL normal saline per rectum every 6 hours as a retention enema', 'choix'), ...(enceinte ? [SRC_GROSSESSE_FORTE_DOSE] : [])],
    commentaire: 'IDSA 2017 y associe le métronidazole IV 500 mg toutes les 8 h, en particulier en cas d\'iléus (non proposé ici : molécule ajoutée séparément dans la base), et, en cas d\'iléus, la vancomycine par voie rectale (500 mg dans environ 100 mL de sérum physiologique toutes les 6 h, en lavement de rétention ; voie non modélisée). ESCMID 2021 : forte dose « not recommended ».',
  });
}

function ecarterBezlotoxumab(f: Fiche) {
  f.ecarter('Bezlotoxumab (en association au traitement antibiotique)', 'inadaptee', 'n\'est plus disponible : arrêt de commercialisation le 23/05/2025, autorisation de mise sur le marché abrogée le 20/10/2026 ; les branches « + bezlotoxumab » des recommandations ESCMID 2021, IDSA 2021 et SPILF 2022 sont caduques', SRC_BEZLO);
}

export const REGLES_CDIFF = [R_CDIFF];
