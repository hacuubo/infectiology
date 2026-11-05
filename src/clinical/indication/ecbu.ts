/**
 * ECBU positif : infection urinaire, colonisation (bactériurie asymptomatique),
 * prélèvement potentiellement contaminé, ou situation indéterminée.
 *
 * Principes (sources dans chaque branche) :
 *  - une culture positive n'est jamais, à elle seule, une indication d'antibiothérapie ;
 *  - une anomalie biologique isolée (leucocyturie, nombre de germes) ne prouve pas l'infection ;
 *  - les exceptions (grossesse, geste urologique à risque) sont recherchées avant de conclure ;
 *  - « inconnu » ne vaut jamais « non » : une réponse manquante qui pourrait changer la conclusion est demandée.
 * Fonction pure et déterministe.
 */
import type { ContexteDecision } from '../../engine/contexte';
import type { DecisionIndication, GesteUrologique, Prelevement, QualificationCulture, SourceRef, StatutValidation } from '../types';
import { S } from '../molecules/base';

export interface EvaluationECBU {
  decision: DecisionIndication;
  qualification: QualificationCulture;
  titre: string;
  raison: string;
  conditions: string[];
  exceptions: string[];
  actions: string[];
  surveillance: string[];
  reconsiderer: string[];
  questions: string[];
  sources: SourceRef[];
  statut: StatutValidation;
  /** Le foyer urinaire peut être retenu pour le choix du traitement. */
  foyerUrinaire: boolean;
  /** Forme retenue quand l'infection est probable. */
  forme?: 'cystite' | 'iu_febrile_ou_masculine' | 'a_preciser' | 'colonisation_gravidique' | 'colonisation_avant_geste';
  urine: Prelevement;
}

/* ------------------------------------------------------------------ */
/* Sources                                                             */
/* ------------------------------------------------------------------ */

export const SRC = {
  spilf15Colo: S('SPILF-2015-IU', 'p. 7', 'Les deux seules situations consensuelles pour le dépistage et le traitement des colonisations urinaires sont : avant une procédure urologique invasive programmée ; grossesse à partir du 4ème mois', 'choix'),
  spilf26Colo: S('SPILF-2026-IUM', 'diapo 4 (IU masculine communautaire)', 'Recherche ou traitement d\'une colonisation urinaire : non indiqués, sauf avant certains gestes urologiques', 'choix'),
  spilf26Signes: S('SPILF-2026-IUM', 'diapo 4 (IU masculine communautaire)', 'Hématurie macroscopique ou rétention aiguë d\'urine, isolées, ne sont pas des signes cliniques d\'infection urinaire', 'definition'),
  spilf26Indeterminee: S('SPILF-2026-IUM', 'diapo 5 (IU masculine communautaire)', 'Bactériurie de signification clinique indéterminée : Présence d\'une bactériurie associée à des signes généraux non spécifiques et à l\'absence de signes clinique de cystite ; Dans cette situation et en l\'absence de sepsis, une surveillance clinique sans antibiothérapie est recommandée', 'choix'),
  spilf26NonSpecifiques: S('SPILF-2026-IUM', 'diapo 7 (IU masculine communautaire)', 'Signes généraux non spécifiques du sujet âgé (confusion, dépendance aiguë, altération brutale de l\'état général, décompensation d\'organe, chute) lorsqu\'il n\'y a pas de signes d\'infection urinaire associés', 'controle_micro'),
  iuasR1: S('SPILF-AFU-SF2H-2015-IUAS', 'R.1 (A-III), p. 6', 'si et seulement s\'ils présentent une fièvre, une hypothermie (<36°), une hypotension, une altération de l\'état mental, un malaise général ou une léthargie sans autre cause identifiée', 'definition'),
  iuasR4: S('SPILF-AFU-SF2H-2015-IUAS', 'R.4 (A-III), p. 8', 'éliminer d\'autres sites d\'infection… même en présence d\'une bactériurie chez le sujet âgé', 'choix'),
  iuasR3: S('SPILF-AFU-SF2H-2015-IUAS', 'R.3 (A-II), p. 8', 'évoquer une IUAS chez le sujet âgé devant l\'apparition d\'une aggravation des troubles cognitifs ou de la dépendance', 'definition'),
  iuasR28: S('SPILF-AFU-SF2H-2015-IUAS', 'R.28 (D-III)', undefined, 'choix'),
  iuasR35: S('SPILF-AFU-SF2H-2015-IUAS', 'R.35 (A-III), p. 28', 'dans les 12 heures… infection parenchymateuse (pyélonéphrite, prostatite, orchi-épididymite)', 'choix'),
  afuEcbu10j: S('AFU-2026-ECBU-geste', 'Q2 R3 (AE)', 'ECBU préopératoire dans les 10 jours précédant l\'intervention', 'controle_micro'),
  afuNlpcDuree: S('AFU-2026-ECBU-geste', 'Q3 R3 (AE)', 'ne permettent pas de définir la durée du traitement antibiotique préopératoire', 'duree'),
  spilf15Grossesse: S('SPILF-2015-IU', 'p. 31', 'streptocoque B : traitement et antibioprophylaxie per-partum', 'choix'),
  iuasLeuco: S('SPILF-AFU-SF2H-2015-IUAS', 'p. 9-10', 'la leucocyturie n\'est pas prédictive… et n\'entre pas dans les critères définissant l\'infection urinaire sur sonde', 'definition'),
  iuasR29: S('SPILF-AFU-SF2H-2015-IUAS', 'R.29 (D-II)', 'Il est recommandé de ne pas traiter les colonisations urinaires avant ablation ou changement de sonde vésicale', 'choix'),
  iuasR30: S('SPILF-AFU-SF2H-2015-IUAS', 'R.30 (B-III)', 'dépister et traiter les colonisations urinaires avant changement de sonde endo-urétérale', 'choix'),
  iuasR33: S('SPILF-AFU-SF2H-2015-IUAS', 'R.33', 'ne pas traiter une colonisation urinaire chez un malade porteur d\'une sonde vésicale hospitalisé en réanimation', 'choix'),
  iuasR34: S('SPILF-AFU-SF2H-2015-IUAS', 'R.34 (A-I), p. 28', 'antibiothérapie probabiliste dans l\'heure qui suit le diagnostic de sepsis sévère', 'choix'),
  iuasR36: S('SPILF-AFU-SF2H-2015-IUAS', 'R.36 (A-III), p. 29', 'Dans les autres situations… différer l\'antibiothérapie afin de l\'adapter aux résultats de l\'ECBU', 'choix'),
  afuR1: S('AFU-2026-ECBU-geste', 'Q1 R1 (AE)', 'Lorsqu\'un ECBU n\'est pas recommandé en préopératoire…, il est de fait non recommandé de réaliser un quelconque traitement de la colonisation urinaire', 'choix'),
  afuRtup: S('AFU-2026-ECBU-geste', 'Q1 R3 (grade B)', 'réaliser un ECBU préopératoire et de traiter une éventuelle colonisation urinaire avant toute chirurgie endoscopique ablative de l\'hypertrophie de la prostate (RTUP)', 'choix'),
  afuUreteroscopie: S('AFU-2026-ECBU-geste', 'Q1 R7 (grade B)', 'avant toute urétéroscopie', 'choix'),
  afuNlpc: S('AFU-2026-ECBU-geste', 'Q1 R8 (grade A)', 'avant toute néphrolithotomie percutanée', 'choix'),
  afuCystoscopie: S('AFU-2026-ECBU-geste', 'Q1 R10 (grade B)', 'Il est fortement recommandé de ne pas réaliser de dépistage… avant cystoscopie', 'choix'),
  afuSonde: S('AFU-2026-ECBU-geste', 'Q1 R17 (AE)', 'ne pas réaliser de dépistage de la colonisation urinaire avant changement ou ablation de sonde vésicale, cathéter suspubien', 'choix'),
  afuDelai: S('AFU-2026-ECBU-geste', 'Q3 R2 (grade C)', 'débutée 48 heures avant le geste chirurgical et sera poursuivie au minimum à J0 et au maximum 48 heures après le geste, soit un total de 3 à 5 jours', 'duree'),
  afuMolecules: S('AFU-2026-ECBU-geste', 'Q3 R4', '1ère intention : Fosfomycine-trométamol (J-2 / J0), Nitrofurantoïne, Pivmécillinam, et Triméthoprime ; 2ème intention : Amoxicilline, Cotrimoxazole', 'choix'),
  hasGrossesse: S('HAS-2021-femme-enceinte-IU', 'fiche colonisation urinaire gravidique', 'pas de traitement probabiliste', 'choix'),
  hasGrossesseSuivi: S('HAS-2021-femme-enceinte-IU', 'fiche colonisation urinaire gravidique', 'ECBU de contrôle 8 à 10 jours après l\'arrêt du traitement, puis ECBU mensuel', 'controle_micro'),
  hasCystite: S('HAS-2021-cystite-femme', 'fiche cystite', undefined, 'choix'),
  idsa19: S('IDSA-2019-bacteriurie-asymptomatique', 'question II (strong)', 'we recommend against screening for or treating ASB', 'choix'),
  idsaDelirium: S('IDSA-2019-bacteriurie-asymptomatique', 'question V (strong, very low)', 'we recommend assessment for other causes and careful observation rather than antimicrobial treatment', 'choix'),
  idsaFievreSansFoyer: S('IDSA-2019-bacteriurie-asymptomatique', 'question V (remarque : fièvre avec signes de sepsis, sans foyer)', 'broad-spectrum antimicrobial therapy directed against urinary and nonurinary sources should be initiated', 'choix'),
  idsaNeutropenie: S('IDSA-2019-bacteriurie-asymptomatique', 'question IX', 'we make no recommendation for or against screening for or treatment of ASB', 'choix'),
  idsaSonde: S('IDSA-2019-bacteriurie-asymptomatique', 'question XI (strong, low)', 'recommend against screening for or treating ASB', 'choix'),
  argPolymicrobien: S('SPILF-2015-IU-argumentaire', 'p. 23', 'Au-delà de deux types de colonies différentes, l\'analyse n\'est pas poursuivie', 'definition'),
  argCollecteur: S('SPILF-2015-IU-argumentaire', 'p. 22', 'le recueil se fait par ponction après désinfection sur le site spécifique du dispositif de sonde (et jamais à partir du sac collecteur)', 'definition'),
  argSansLeuco: S('SPILF-2015-IU-argumentaire', 'p. 23', 'Une bactériurie sans leucocyturie doit faire évoquer par ordre de fréquence une contamination', 'definition'),
  iuasRecontrole: S('SPILF-AFU-SF2H-2015-IUAS', 'p. 10', 'la clinique prime sur les seuils', 'definition'),
  hasGrossesseDefinition: S('HAS-2021-femme-enceinte-IU', 'définition', 'Une colonisation urinaire est définie par une bactériurie ≥ 10⁵ UFC/ml monomicrobienne.', 'definition'),
  afuPolymicrobien: S('AFU-2026-ECBU-geste', 'Q2 R7, p. 22 ; Q3 R5, p. 25', undefined, 'choix'),
  spilf26Controle: S('SPILF-2026-IUM', 'diapo 7 (IU masculine communautaire)', 'Après un traitement antibiotique curatif conduisant à la guérison clinique', 'controle_micro'),
  ssc26: S('SSC-2026', 'page SCCM', 'administering antimicrobial therapy immediately, ideally within 1 hr of recognition', 'autre'),
};

/* ------------------------------------------------------------------ */
/* Gestes urologiques (AFU/CIAFU/SPILF 2026 ; IUAS 2015 pour la sonde JJ) */
/* ------------------------------------------------------------------ */

const afu = (repere: string, extrait?: string) => S('AFU-2026-ECBU-geste', repere, extrait, 'choix');
type ConduiteGeste = 'traiter_avant' | 'ne_pas_depister' | 'sans_recommandation' | 'a_preciser' | 'aucun';

/** Tableau AFU/CIAFU 2026 (Q1, p. 18-20 ; tableaux 5-6, p. 26-29). */
export const GESTES: Record<GesteUrologique, { libelle: string; conduite: ConduiteGeste; sources: SourceRef[]; remarque?: string; statut?: StatutValidation }> = {
  aucun: { libelle: 'Aucun geste urologique prévu', conduite: 'aucun', sources: [] },
  ablation_endoscopique_hbp: { libelle: 'Chirurgie endoscopique de l\'hypertrophie prostatique (RTUP, PVP, HoLEP, Aquabeam)', conduite: 'traiter_avant', sources: [SRC.afuRtup, afu('Q1 R3 (AE)', 'PVP / HoLEP / Aquabeam')] },
  urethroplastie: { libelle: 'Uréthroplastie, uréthrotomie, urétéroplastie', conduite: 'traiter_avant', sources: [afu('Q1 R6 (C ; AE)', 'Uréthroplastie ; uréthrotomie, urétéroplastie')] },
  ureteroscopie: { libelle: 'Urétéroscopie', conduite: 'traiter_avant', sources: [SRC.afuUreteroscopie] },
  nlpc: { libelle: 'Néphrolithotomie percutanée (NLPC)', conduite: 'traiter_avant', sources: [SRC.afuNlpc] },
  rtuv: { libelle: 'Résection transurétrale de vessie (RTUV)', conduite: 'traiter_avant', sources: [afu('Q1 R11 (C)', 'Résection transurétrale de vessie')] },
  bilan_urodynamique: { libelle: 'Bilan urodynamique', conduite: 'traiter_avant', sources: [afu('tableaux 5-6, p. 26, 28', 'Bilan urodynamique : Oui (accord fort)')], remarque: 'La durée du traitement est définie par l’AFU pour les gestes chirurgicaux ; pour le bilan urodynamique, la source citée par l’AFU (Egrot 2018) n’a pas été lue.', statut: 'brouillon' },
  sonde_jj_nephrostomie: {
    libelle: 'Montée ou changement de sonde JJ, mono J ou néphrostomie',
    conduite: 'traiter_avant',
    sources: [afu('tableau 6, p. 27-28', 'Montée ou changement de sonde de néphrostomie, mono J ou JJ : Oui'), SRC.iuasR30],
    remarque: 'Zone grise : le tableau AFU 2026 indique l\'ECBU, mais sa légende cite ce geste parmi les situations sans consensus.',
    statut: 'brouillon',
  },
  cystoscopie: { libelle: 'Cystoscopie, quelle qu\'en soit l\'indication', conduite: 'ne_pas_depister', sources: [SRC.afuCystoscopie, SRC.afuR1] },
  prostatectomie_totale: { libelle: 'Prostatectomie totale', conduite: 'ne_pas_depister', sources: [afu('Q1 R2 (C)', 'Prostatectomie totale : pas de dépistage'), SRC.afuR1] },
  enucleation_voie_haute: { libelle: 'Énucléation ou adénomectomie prostatique par voie haute', conduite: 'ne_pas_depister', sources: [afu('Q1 R4 (AE)'), SRC.afuR1] },
  cystectomie: { libelle: 'Cystectomie partielle ou totale', conduite: 'ne_pas_depister', sources: [afu('Q1 R12 (AE)'), SRC.afuR1] },
  nephrectomie: { libelle: 'Néphrectomie totale ou partielle, néphro-urétérectomie', conduite: 'ne_pas_depister', sources: [afu('Q1 R14.bis (C ; AE)'), SRC.afuR1] },
  instillations_toxine: { libelle: 'Instillations endovésicales (dont BCG) ou injections de toxine botulinique', conduite: 'ne_pas_depister', sources: [afu('Q1 R13, R13.bis (B ; AE)'), SRC.afuR1] },
  sphincter_implant_prothese: { libelle: 'Sphincter artificiel, implant pénien, prothèse testiculaire', conduite: 'ne_pas_depister', sources: [afu('Q1 R15 (C ; AE)'), SRC.afuR1] },
  biopsies_prostate: { libelle: 'Biopsies de prostate', conduite: 'ne_pas_depister', sources: [afu('tableau 5, p. 26', 'Non → cf. recommandations du CIAFU / CCAFU'), SRC.afuR1] },
  changement_ablation_sonde_vesicale: { libelle: 'Changement ou ablation de sonde vésicale / cathéter sus-pubien', conduite: 'ne_pas_depister', sources: [SRC.afuSonde, SRC.iuasR29] },
  sans_recommandation: {
    libelle: 'Lithotritie extracorporelle, transplantation rénale, prolapsus ou incontinence, Rezum, HIFU',
    conduite: 'sans_recommandation',
    sources: [afu('Q1 R5.2, R9, R14.1, R16 (AE)', 'Pas de recommandation possible')],
  },
  autre: { libelle: 'Autre geste', conduite: 'a_preciser', sources: [] },
  inconnu: { libelle: 'Non renseigné', conduite: 'a_preciser', sources: [] },
};

/* ------------------------------------------------------------------ */

const DISPOSITIFS = ['sonde_vesicale', 'sonde_jj', 'nephrostomie', 'autre'];

/** ECBU positif « isolé » : au moins un ECBU avec germe ou résultat, sans hémoculture positive. */
export function urinePositive(ctx: ContexteDecision): Prelevement | undefined {
  const hemocPositive = ctx.hemocultures.some((h) => h.organisme !== undefined || (h.examenDirect !== undefined && h.examenDirect !== 'inconnu'));
  if (hemocPositive) return undefined;
  return ctx.urines.find((u) => u.organisme !== undefined || (u.urine?.nbEspeces ?? 'inconnu') !== 'inconnu');
}

export function evaluerECBU(ctx: ContexteDecision): EvaluationECBU | undefined {
  return evaluerBrut(ctx, false);
}

function evaluerBrut(ctx: ContexteDecision, ignorerContamination: boolean): EvaluationECBU | undefined {
  const d = ctx.dossier;
  const p = d.patient;
  if (p.age !== undefined && p.age < 18) return undefined;
  const u = urinePositive(ctx);
  if (!u) return undefined;
  const c = d.clinique;
  const sonde = DISPOSITIFS.includes(p.materielUrinaire);
  const grave = p.gravite === 'sepsis' || p.gravite === 'choc_septique';
  const declare = (d.entree === 'syndrome' && d.syndrome === 'urinaire') || u.foyer === 'urinaire';
  const signesU = c.signesUrinaires;
  const ctxU = u.urine ?? { motif: 'inconnu', recueil: 'inconnu', nbEspeces: 'inconnu' };

  const ev = (o: Partial<EvaluationECBU> & Pick<EvaluationECBU, 'decision' | 'qualification' | 'titre' | 'raison'>): EvaluationECBU => ({
    conditions: [],
    exceptions: [],
    actions: [],
    surveillance: [],
    reconsiderer: [],
    questions: [],
    sources: [],
    statut: 'verifiee_ia',
    foyerUrinaire: false,
    urine: u,
    ...o,
  });

  /* 0. Gravité : prise en charge urgente, sans attendre la fin du parcours. */
  if (grave) {
    // Hors dispositif, une fièvre sans signe urinaire ne suffit pas à retenir le foyer urinaire : spectre urinaire et non urinaire (IDSA 2019, V).
    const urinaireProbable = signesU === 'nouveaux' || declare || (sonde && c.autreFoyer === 'recherche_negative');
    return ev({
      decision: 'urgence',
      qualification: urinaireProbable ? 'infection_probable' : 'indeterminee',
      titre: p.gravite === 'choc_septique' ? 'Choc septique : antibiothérapie immédiate' : 'Sepsis : antibiothérapie sans attendre',
      raison: urinaireProbable
        ? 'Sepsis avec foyer urinaire probable : antibiothérapie probabiliste dans l\'heure, après hémocultures et ECBU, sans attendre la fin du parcours.'
        : 'Sepsis : antibiothérapie dans l\'heure. La bactériurie ne suffit pas à affirmer l\'origine urinaire : rechercher activement un autre foyer.',
      conditions: [`gravité : ${p.gravite === 'choc_septique' ? 'choc septique' : 'sepsis'}`],
      actions: ['Hémocultures avant la première dose, sans la retarder', 'Antibiothérapie probabiliste dans l\'heure', 'Rechercher le foyer (urinaire et autres) et un obstacle à drainer', 'Avis réanimation / SMIT'],
      reconsiderer: ['Résultats des hémocultures et de l\'imagerie', 'Autre foyer identifié'],
      sources: [SRC.ssc26, SRC.iuasR34, SRC.iuasR4, ...(urinaireProbable ? [] : [SRC.idsaFievreSansFoyer])],
      foyerUrinaire: urinaireProbable,
      forme: urinaireProbable ? 'iu_febrile_ou_masculine' : undefined,
    });
  }

  /* 1. Prélèvement potentiellement contaminé. */
  const contamination = !ignorerContamination && (ctxU.recueil === 'collecteur' || ctxU.nbEspeces === 'trois_ou_plus');
  if (contamination) {
    const symptomatique = signesU === 'nouveaux' || c.fievre === 'oui' || declare;
    const pourquoi = ctxU.nbEspeces === 'trois_ou_plus' ? 'plusieurs espèces rapportées' : 'recueil par collecteur';
    const srcContamination = [ctxU.nbEspeces === 'trois_ou_plus' ? SRC.argPolymicrobien : SRC.argCollecteur, SRC.argSansLeuco, SRC.iuasRecontrole];
    // Fièvre ou infection masculine : infection parenchymateuse possible, traitement dans les 12 h (IUAS R.35) ;
    // on refait l'ECBU maintenant, puis on applique la conduite habituelle sans attendre le résultat.
    if (c.fievre === 'oui' || (p.sexe === 'homme' && signesU === 'nouveaux')) {
      const r = evaluerBrut(ctx, true);
      if (r)
        return {
          ...r,
          conditions: [...r.conditions, `ECBU initial d'interprétation douteuse (${pourquoi})`],
          actions: ['Refaire un ECBU dans de bonnes conditions maintenant, avant la première dose', ...r.actions],
          sources: [...r.sources, SRC.iuasR35, ...srcContamination],
        };
    }
    if (!symptomatique && (signesU === 'inconnu' || c.fievre === 'inconnu'))
      return ev({
        decision: 'informations_insuffisantes',
        qualification: 'contamination_possible',
        titre: 'Prélèvement probablement contaminé : préciser la clinique',
        raison: `ECBU d'interprétation douteuse (${pourquoi}). La conduite dépend des signes cliniques : refaire le prélèvement s'il y a des symptômes, ne rien faire sinon.`,
        questions: [signesU === 'inconnu' ? 'Signes urinaires récents ?' : '', c.fievre === 'inconnu' ? 'Fièvre ou hypothermie ?' : ''].filter(Boolean),
        sources: srcContamination,
      });
    const femmeJeune = p.sexe !== 'homme' && (p.age === undefined || p.age <= 50);
    if (!symptomatique && (p.grossesse === 'oui' || (p.grossesse === 'inconnu' && femmeJeune)))
      return ev({
        decision: p.grossesse === 'oui' ? 'attendre_resultat' : 'informations_insuffisantes',
        qualification: 'contamination_possible',
        titre: p.grossesse === 'oui' ? 'Grossesse : ECBU à refaire avant de conclure' : 'Prélèvement probablement contaminé : grossesse à vérifier',
        raison: `ECBU d'interprétation douteuse (${pourquoi}). Pendant la grossesse, une colonisation se définit par une bactériurie monomicrobienne ≥ 10⁵ UFC/mL et se traite : un prélèvement contaminé ne permet pas de conclure.`,
        questions: p.grossesse === 'oui' ? [] : ['Grossesse en cours ?'],
        actions: p.grossesse === 'oui' ? ['Refaire un ECBU dans de bonnes conditions'] : [],
        sources: [...srcContamination, SRC.hasGrossesseDefinition],
      });
    if (!symptomatique && GESTES[c.gesteUrologique].conduite === 'traiter_avant')
      return ev({
        decision: 'informations_insuffisantes',
        qualification: 'contamination_possible',
        titre: 'ECBU polymicrobien avant geste urologique : pas de consensus',
        raison: 'Avant un geste urologique, l’AFU 2026 ne recommande ni ne déconseille de refaire un ECBU à trois espèces ou plus, et ne formule pas de recommandation de traitement : décision avec l’urologue.',
        actions: ['Discussion avec l’urologue'],
        sources: [...srcContamination, SRC.afuPolymicrobien],
      });
    return ev({
      decision: symptomatique ? 'attendre_resultat' : 'ne_pas_traiter',
      qualification: 'contamination_possible',
      titre: symptomatique ? 'Prélèvement à refaire avant de conclure' : 'Pas d\'antibiothérapie indiquée : prélèvement probablement contaminé, sans symptôme',
      raison: symptomatique
        ? `ECBU d'interprétation douteuse (${pourquoi}) chez un patient symptomatique : refaire un ECBU dans de bonnes conditions avant toute antibiothérapie, sauf gravité.`
        : `ECBU d'interprétation douteuse (${pourquoi}) sans symptôme : ni traitement ni nouvel ECBU.`,
      conditions: [pourquoi, symptomatique ? 'signes cliniques présents ou foyer urinaire déclaré' : 'aucun signe clinique renseigné'],
      actions: symptomatique ? ['Refaire un ECBU (milieu de jet après toilette, ou sondage aller-retour)', 'Attendre le résultat avant d\'adapter, sauf aggravation'] : ['Ne pas prescrire d\'antibiotique', 'Ne pas refaire d\'ECBU en l\'absence de symptôme'],
      reconsiderer: ['Apparition de fièvre, de signes urinaires ou d\'un sepsis'],
      sources: [...srcContamination, ...(symptomatique ? [SRC.iuasR36] : [SRC.spilf15Colo])],
    });
  }

  /* 2. Porteur d'un dispositif endo-urinaire : définition clinique stricte (IUAS R.1). */
  if (sonde) {
    const signes = c.fievre === 'oui' || c.signesNonSpecifiques === 'oui';
    const aucunSigne = c.fievre === 'non' && c.signesNonSpecifiques === 'non' && (signesU === 'absents' || signesU === 'chroniques_inchanges');
    const presents = [c.fievre === 'oui' ? 'fièvre ou hypothermie' : '', c.signesNonSpecifiques === 'oui' ? 'signes généraux (confusion, malaise, léthargie)' : '', signesU === 'nouveaux' ? 'signes urinaires récents' : ''].filter(Boolean);
    if (!signes && signesU === 'nouveaux' && c.fievre === 'non' && c.signesNonSpecifiques === 'non')
      return ev({
        decision: 'informations_insuffisantes',
        qualification: 'indeterminee',
        titre: 'Signes urinaires isolés chez un porteur de dispositif : avis',
        raison: 'Sur dispositif endo-urinaire, l’infection n’est évoquée qu’en présence de signes systémiques (IUAS R.1). Des signes urinaires isolés (douleur lombaire sur sonde JJ ou néphrostomie, par exemple) ne sont pas couverts par les sources lues : avis spécialisé.',
        conditions: ['dispositif endo-urinaire', 'signes urinaires récents', 'pas de fièvre', 'pas de signe général'],
        actions: ['Avis urologique ou SMIT'],
        reconsiderer: ['Fièvre, hypothermie, hypotension, altération de l’état mental'],
        sources: [SRC.iuasR1],
        statut: 'brouillon',
      });
    if (signes) {
      if (c.autreFoyer === 'identifie')
        return ev({
          decision: 'ne_pas_traiter',
          qualification: 'colonisation',
          titre: 'Bactériurie sur sonde : les signes sont expliqués par un autre foyer',
          raison: 'Sur dispositif endo-urinaire, une infection urinaire n\'est évoquée qu\'en l\'absence d\'autre cause identifiée. Traiter le foyer identifié ; la bactériurie ne justifie pas d\'antibiothérapie propre.',
          conditions: ['dispositif endo-urinaire', ...presents, 'autre foyer identifié'],
          actions: ['Prendre en charge le foyer identifié', 'Ne pas changer la sonde pour refaire un ECBU'],
          reconsiderer: ['Si le foyer identifié est écarté'],
          sources: [SRC.iuasR1, SRC.iuasLeuco],
        });
      if (c.autreFoyer === 'non_recherche')
        return ev({
          decision: 'informations_insuffisantes',
          qualification: 'indeterminee',
          titre: 'Bactériurie sur sonde avec signes cliniques : rechercher d\'abord une autre cause',
          raison: 'Sur dispositif endo-urinaire, la bactériurie est fréquente : l\'infection urinaire n\'est retenue qu\'après avoir écarté une autre cause des signes. La leucocyturie n\'aide pas.',
          conditions: ['dispositif endo-urinaire', ...presents],
          questions: ['Un autre foyer infectieux a-t-il été recherché (pulmonaire, cathéter, cutané, digestif…) ?'],
          actions: ['Examen clinique complet et bilan orienté', 'Hémocultures si fièvre'],
          reconsiderer: ['Aggravation ou sepsis : traiter sans attendre'],
          sources: [SRC.iuasR1, SRC.iuasR4, SRC.iuasLeuco],
        });
      return ev({
        decision: 'traiter',
        qualification: 'infection_probable',
        titre: 'Infection urinaire associée aux soins probable',
        raison: 'Dispositif endo-urinaire, signes cliniques et aucune autre cause identifiée : infection urinaire associée aux soins probable.',
        conditions: ['dispositif endo-urinaire', ...presents, 'autre foyer recherché et non trouvé'],
        actions: ['Retirer ou changer la sonde (voir le moment recommandé)'],
        reconsiderer: ['Autre foyer identifié secondairement'],
        sources: [SRC.iuasR1],
        foyerUrinaire: true,
        forme: 'iu_febrile_ou_masculine',
      });
    }
    if (aucunSigne) {
      const ex = exceptions(ctx, u);
      if (ex) return ex;
      return ev({
        decision: 'ne_pas_traiter',
        qualification: 'colonisation',
        titre: 'Pas d\'antibiothérapie indiquée dans la situation renseignée',
        raison: 'Bactériurie chez un porteur de sonde, sans fièvre ni signe général : colonisation. Elle ne se traite pas, y compris avant ablation ou changement de sonde vésicale. La leucocyturie n\'est pas un critère.',
        conditions: ['dispositif endo-urinaire', 'pas de fièvre', 'pas de signe général (confusion, malaise, léthargie, hypotension)', 'pas de geste urologique à risque prévu'],
        exceptions: exceptionsRecherchees(ctx),
        actions: ['Ne pas prescrire d\'antibiotique', 'Ne pas changer la sonde pour faire un ECBU', 'Réévaluer l\'indication de la sonde'],
        surveillance: ['Surveillance clinique habituelle'],
        reconsiderer: ['Fièvre, hypothermie, hypotension, altération de l\'état mental, malaise ou léthargie sans autre cause', 'Geste urologique programmé (changement de sonde JJ, urétéroscopie…)'],
        sources: [SRC.iuasR1, SRC.iuasR29, SRC.iuasR33, SRC.iuasLeuco, SRC.afuSonde, SRC.idsaSonde],
      });
    }
    return ev({
      decision: 'informations_insuffisantes',
      qualification: 'indeterminee',
      titre: 'Bactériurie sur sonde : préciser les signes cliniques',
      raison: 'Sur dispositif endo-urinaire, seuls des signes cliniques (fièvre, hypothermie, hypotension, altération de l\'état mental, malaise, léthargie) sans autre cause permettent d\'évoquer une infection.',
      conditions: ['dispositif endo-urinaire'],
      questions: [c.fievre === 'inconnu' ? 'Fièvre ou hypothermie ?' : '', c.signesNonSpecifiques === 'inconnu' ? 'Confusion, malaise, léthargie ou hypotension ?' : '', signesU === 'inconnu' ? 'Signes urinaires récents ?' : ''].filter(Boolean),
      sources: [SRC.iuasR1],
    });
  }

  /* 3. Sans dispositif : signes urinaires nouveaux = infection urinaire probable. */
  if (signesU === 'nouveaux' || (declare && signesU === 'inconnu')) {
    const homme = p.sexe === 'homme';
    const forme = homme || c.fievre === 'oui' ? 'iu_febrile_ou_masculine' : c.fievre === 'non' && p.sexe === 'femme' ? 'cystite' : 'a_preciser';
    return ev({
      decision: 'traiter',
      qualification: declare && signesU === 'inconnu' ? 'infection_probable' : 'infection',
      titre: forme === 'cystite' ? 'Cystite : signes urinaires sans fièvre' : 'Infection urinaire probable',
      raison: declare && signesU === 'inconnu' ? 'Foyer urinaire déclaré par le prescripteur, signes urinaires non renseignés : à confirmer (une bactériurie seule n’est pas une infection).' : 'Signes urinaires récents et ECBU positif : infection urinaire.',
      conditions: [declare && signesU === 'inconnu' ? 'foyer urinaire déclaré (sur déclaration du prescripteur)' : 'signes urinaires nouveaux', c.fievre === 'oui' ? 'fièvre' : c.fievre === 'non' ? 'pas de fièvre' : 'fièvre non renseignée'],
      questions: [
        declare && signesU === 'inconnu' ? 'Signes urinaires récents ?' : '',
        ...(forme === 'a_preciser' ? [p.sexe === 'inconnu' ? 'Sexe (infection urinaire masculine ou féminine)' : '', c.fievre === 'inconnu' ? 'Fièvre ou hypothermie ? (distingue cystite et infection fébrile)' : ''] : []),
      ].filter(Boolean),
      sources: [SRC.spilf26Signes],
      foyerUrinaire: forme === 'iu_febrile_ou_masculine',
      forme,
    });
  }
  if (declare && signesU !== 'inconnu' && c.fievre === 'non') {
    return ev({
      decision: 'informations_insuffisantes',
      qualification: 'indeterminee',
      titre: 'Foyer urinaire déclaré sans signe clinique : à vérifier',
      raison: 'Un foyer urinaire est déclaré, mais ni signe urinaire nouveau ni fièvre ne sont renseignés. Une bactériurie seule n\'est pas une infection urinaire.',
      conditions: ['foyer urinaire déclaré', 'pas de signe urinaire nouveau', 'pas de fièvre'],
      questions: ['Quels signes font retenir le foyer urinaire ?'],
      sources: [SRC.spilf15Colo, SRC.spilf26Colo],
    });
  }
  if (signesU === 'inconnu') {
    return ev({
      decision: 'informations_insuffisantes',
      qualification: 'indeterminee',
      titre: 'ECBU positif : préciser les signes cliniques',
      raison: 'Un ECBU positif ne suffit pas à poser une indication. La présence de signes urinaires récents décide entre infection et colonisation.',
      questions: ['Signes urinaires (brûlures, pollakiurie, impériosité, douleur sus-pubienne, lombaire ou pelvienne) : nouveaux, chroniques inchangés ou absents ?'],
      sources: [SRC.spilf15Colo, SRC.spilf26Signes],
    });
  }

  /* 4. Pas de signe urinaire nouveau. */
  if (c.fievre === 'oui') {
    if (c.autreFoyer === 'identifie')
      return ev({
        decision: 'ne_pas_traiter',
        qualification: 'colonisation',
        titre: 'Fièvre expliquée par un autre foyer : la bactériurie ne justifie pas d\'antibiothérapie propre',
        raison: 'Fièvre sans signe urinaire, avec un autre foyer identifié : la bactériurie est une colonisation. Le traitement est celui du foyer identifié.',
        conditions: ['pas de signe urinaire nouveau', 'autre foyer identifié'],
        actions: ['Prendre en charge le foyer identifié'],
        reconsiderer: ['Si le foyer identifié est écarté', 'Apparition de signes urinaires ou d\'un sepsis'],
        sources: [SRC.iuasR4, SRC.spilf15Colo],
      });
    if (c.autreFoyer === 'non_recherche')
      return ev({
        decision: 'informations_insuffisantes',
        qualification: 'indeterminee',
        titre: 'Fièvre sans signe urinaire : rechercher d\'abord un autre foyer',
        raison: 'Une bactériurie est fréquente, surtout chez le sujet âgé : il faut éliminer un autre site d\'infection avant de l\'attribuer à l\'urine.',
        questions: ['Un autre foyer infectieux a-t-il été recherché ?'],
        actions: ['Examen clinique complet, hémocultures, bilan orienté'],
        reconsiderer: ['Sepsis : traiter sans attendre'],
        sources: [SRC.iuasR4],
      });
    return ev({
      decision: 'informations_insuffisantes',
      qualification: 'indeterminee',
      titre: 'Fièvre sans foyer identifié, sans sepsis, avec bactériurie : avis SMIT',
      raison: 'Fièvre sans signe urinaire et sans autre foyer retrouvé, sans sepsis : aucune source lue ne tranche. L’IDSA 2019 ne se prononce que pour la fièvre avec signes de sepsis (spectre urinaire et non urinaire) ; SPILF 2026 recommande la surveillance sans antibiotique devant des signes généraux non spécifiques sans sepsis (homme) ; IUAS 2015 demande d’évoquer une IUAS chez le sujet âgé hospitalisé. Décision avec le SMIT.',
      conditions: ['fièvre', 'pas de signe urinaire nouveau', 'autre foyer recherché et non trouvé', 'pas de sepsis'],
      actions: ['Hémocultures', 'Surveillance clinique rapprochée', 'Avis SMIT'],
      reconsiderer: ['Apparition de signes urinaires ou lombaires', 'Sepsis : traiter sans attendre', 'Résultat des hémocultures'],
      sources: [SRC.spilf26Indeterminee, SRC.idsaFievreSansFoyer, SRC.iuasR3, SRC.iuasR4],
      statut: 'brouillon',
    });
  }
  if (c.fievre === 'inconnu') {
    return ev({
      decision: 'informations_insuffisantes',
      qualification: 'indeterminee',
      titre: 'ECBU positif sans signe urinaire : préciser la température',
      raison: 'Sans signe urinaire nouveau, la conclusion dépend de la présence d\'une fièvre.',
      questions: ['Fièvre ≥ 38 °C ou hypothermie < 36 °C ?'],
      sources: [SRC.spilf15Colo],
    });
  }
  if (c.signesNonSpecifiques === 'oui') {
    const ex = exceptions(ctx, u);
    if (ex) return ex;
    return ev({
      decision: 'ne_pas_traiter',
      qualification: 'colonisation',
      titre: 'Pas d\'antibiothérapie indiquée dans la situation renseignée',
      raison: `Confusion, chute ou perte d'autonomie sans fièvre ni signe urinaire : ces signes ne doivent pas être attribués à la bactériurie. Rechercher une autre cause ; la bactériurie ne se traite pas.${ctx.dossier.patient.contexte === 'associe_aux_soins' ? ' Divergence : en contexte de soins, l’IUAS 2015 (R.3) demande d’évoquer une infection urinaire devant une aggravation cognitive ; l’IDSA 2019 (V) recommande de rechercher une autre cause et de surveiller.' : ''}`,
      conditions: ['signes non spécifiques', 'pas de fièvre', 'pas de signe urinaire nouveau', 'pas de sepsis'],
      exceptions: exceptionsRecherchees(ctx),
      actions: ['Rechercher une autre cause (iatrogénie, déshydratation, rétention, fécalome, autre infection…)', 'Ne pas prescrire d\'antibiotique pour la bactériurie', 'Ne pas répéter l\'ECBU'],
      surveillance: ['Surveillance clinique (température, état de conscience, autonomie)'],
      reconsiderer: ['Fièvre ou hypothermie', 'Signes urinaires nouveaux', 'Instabilité hémodynamique ou sepsis'],
      sources: [SRC.idsaDelirium, ...(p.sexe === 'homme' ? [SRC.spilf26Indeterminee, SRC.spilf26NonSpecifiques] : [SRC.spilf15Colo]), SRC.iuasR4, ...(ctx.dossier.patient.contexte === 'associe_aux_soins' ? [SRC.iuasR3] : [])],
    });
  }

  /* 5. Asymptomatique : colonisation, sauf exception. */
  const ex = exceptions(ctx, u);
  if (ex) return ex;
  return ev({
    decision: 'ne_pas_traiter',
    qualification: 'colonisation',
    titre: 'Pas d\'antibiothérapie indiquée dans la situation renseignée',
    raison: 'ECBU positif sans signe urinaire, sans fièvre et sans sepsis : colonisation urinaire (bactériurie asymptomatique). Ni dépistage ni traitement, en dehors de la grossesse et de certains gestes urologiques.',
    conditions: ['pas de signe urinaire nouveau', 'pas de fièvre', 'pas de sepsis', 'pas de grossesse', 'pas de geste urologique à risque prévu'],
    exceptions: exceptionsRecherchees(ctx),
    actions: ['Ne pas prescrire d\'antibiotique', 'Ne pas contrôler l\'ECBU'],
    surveillance: [ctxU.motif === 'controle_apres_traitement' ? 'ECBU de contrôle non recommandé après une guérison clinique' : 'Surveillance clinique habituelle'],
    reconsiderer: ['Apparition de signes urinaires, de fièvre ou d\'un sepsis', 'Grossesse', 'Geste urologique programmé'],
    sources: [SRC.spilf15Colo, ...(p.sexe === 'homme' ? [SRC.spilf26Colo] : []), SRC.afuR1, SRC.idsa19, ...(ctxU.motif === 'controle_apres_traitement' ? [SRC.spilf26Controle] : [])],
  });
}

/** Liste lisible des exceptions examinées. */
function exceptionsRecherchees(ctx: ContexteDecision): string[] {
  const p = ctx.dossier.patient;
  const g = ctx.dossier.clinique.gesteUrologique;
  const l: string[] = [];
  if (p.sexe !== 'homme') {
    const procreer = p.age === undefined || p.age <= 50;
    l.push(`Grossesse : ${p.grossesse === 'non' ? 'non' : p.grossesse === 'oui' ? 'oui' : procreer ? 'non renseignée' : 'non applicable (âge)'}`);
  }
  l.push(`Geste urologique : ${GESTES[g].libelle.toLowerCase()}`);
  return l;
}

/**
 * Exceptions à la règle « ne pas traiter une colonisation » : grossesse, geste urologique à risque.
 * Renvoie une évaluation si une exception s'applique ou si sa recherche est incomplète.
 */
function exceptions(ctx: ContexteDecision, u: Prelevement): EvaluationECBU | undefined {
  const p = ctx.dossier.patient;
  const c = ctx.dossier.clinique;
  const base = { conditions: [] as string[], exceptions: [] as string[], actions: [] as string[], surveillance: [] as string[], reconsiderer: [] as string[], questions: [] as string[], statut: 'verifiee_ia' as StatutValidation, foyerUrinaire: false, urine: u };
  // Choix applicatif non sourcé (voir docs/ARBITRAGES.md) : la grossesse est demandée jusqu'à 50 ans.
  const femmeEnAgeDeProcreer = p.sexe !== 'homme' && (p.age === undefined || p.age <= 50);

  const g = GESTES[c.gesteUrologique];
  const nbEspeces = u.urine?.nbEspeces ?? 'inconnu';
  const sgb = u.organisme === 'streptococcus_agalactiae';

  if (p.grossesse === 'oui') {
    // Colonisation gravidique : bactériurie monomicrobienne ≥ 10⁵ UFC/mL (HAS) ; le streptocoque B se traite quel que soit le titre (SPILF 2015 p. 31).
    if (nbEspeces !== 'une' && !sgb)
      return {
        ...base,
        decision: nbEspeces === 'deux' ? 'attendre_resultat' : 'informations_insuffisantes',
        qualification: nbEspeces === 'deux' ? 'contamination_possible' : 'indeterminee',
        titre: 'Grossesse : la colonisation gravidique suppose un ECBU monomicrobien',
        raison: nbEspeces === 'deux' ? 'Deux espèces : la définition de la colonisation gravidique (bactériurie monomicrobienne ≥ 10⁵ UFC/mL) n’est pas remplie. Contrôler l’ECBU avant de traiter.' : 'Le nombre d’espèces doit être connu : la colonisation gravidique se définit par une bactériurie monomicrobienne ≥ 10⁵ UFC/mL.',
        conditions: ['grossesse', 'bactériurie sans symptôme'],
        actions: nbEspeces === 'deux' ? ['Contrôler l’ECBU dans de bonnes conditions'] : [],
        questions: nbEspeces === 'deux' ? [] : ['Nombre d’espèces rapportées par le laboratoire ?'],
        sources: [SRC.hasGrossesseDefinition, SRC.spilf15Grossesse],
      };
    return {
      ...base,
      decision: 'traiter',
      qualification: 'colonisation',
      titre: 'Colonisation urinaire gravidique : traitement indiqué',
      raison: 'Pendant la grossesse, une colonisation urinaire (bactériurie monomicrobienne ≥ 10⁵ UFC/mL) se traite, d’emblée selon l’antibiogramme (pas de traitement probabiliste). Le titre exact n’est pas saisi dans l’application : à vérifier sur le compte rendu.',
      conditions: ['grossesse', 'bactériurie sans symptôme', sgb ? 'streptocoque B (quel que soit le titre)' : 'une seule espèce'],
      actions: ['Traitement adapté à l’antibiogramme (fiche HAS « Femme enceinte »)', ...(sgb ? ['Streptocoque B : prévoir l’antibioprophylaxie per-partum'] : []), 'Avis obstétrical selon le contexte'],
      surveillance: ['ECBU de contrôle 8 à 10 jours après l’arrêt du traitement, puis ECBU mensuel jusqu’à l’accouchement'],
      reconsiderer: ['Fièvre ou douleur lombaire : pyélonéphrite gravidique'],
      sources: [SRC.spilf15Colo, SRC.hasGrossesseDefinition, SRC.hasGrossesse, SRC.hasGrossesseSuivi, ...(sgb ? [SRC.spilf15Grossesse] : [])],
      forme: 'colonisation_gravidique',
    };
  }
  if (g.conduite === 'sans_recommandation')
    return {
      ...base,
      decision: 'informations_insuffisantes',
      qualification: 'colonisation',
      titre: 'Colonisation et geste sans recommandation établie',
      raison: `Pour ce geste (${g.libelle.toLowerCase()}), les recommandations AFU 2026 ne permettent pas de trancher (« pas de recommandation possible ») : décision avec l'urologue et le SMIT.`,
      actions: ['Discussion avec l’urologue et le SMIT'],
      sources: g.sources,
    };
  if (g.conduite === 'traiter_avant') {
    const nlpc = c.gesteUrologique === 'nlpc';
    return {
      ...base,
      statut: g.statut ?? 'verifiee_ia',
      decision: 'traiter',
      qualification: 'colonisation',
      titre: `Colonisation à traiter avant le geste : ${g.libelle.toLowerCase()}`,
      raison: `Avant ce geste urologique, une colonisation urinaire se traite selon l'antibiogramme, pour prévenir une infection post-opératoire.${g.remarque ? ' ' + g.remarque : ''} ${nlpc ? 'Pour la NLPC, la durée du traitement préopératoire n’est pas définie (AFU 2026 Q3 R3).' : 'Durée : l’IDSA 2019 propose 1 ou 2 doses, l’AFU 2026 3 à 5 jours (divergence ; l’application affiche l’AFU).'}${p.neutropenie === 'oui' ? ' Patient neutropénique : la conduite AFU s’applique ; dérogation éventuelle à argumenter avec le SMIT.' : ''}`,
      conditions: ['bactériurie sans symptôme', `geste prévu : ${g.libelle.toLowerCase()}`, 'ECBU de moins de 10 jours avant le geste (15 jours au plus, à titre exceptionnel)'],
      actions: [
        nlpc ? 'Traitement adapté à l’antibiogramme avant le geste ; durée préopératoire non définie par l’AFU' : 'Traitement adapté à l’antibiogramme, débuté 48 h avant le geste et poursuivi jusqu’à J0 (au plus 48 h après) : 3 à 5 jours au total',
        'Molécules par ordre de préférence (AFU 2026) : fosfomycine-trométamol, nitrofurantoïne, pivmécillinam, triméthoprime ; puis amoxicilline, cotrimoxazole ; puis amoxicilline-acide clavulanique ; puis fluoroquinolones, céfixime. Posologies : se référer au texte (non modélisées)',
      ],
      reconsiderer: ['Report du geste (ECBU de plus de 10 jours à refaire)', 'Apparition de signes d’infection'],
      sources: [...g.sources, SRC.afuEcbu10j, nlpc ? SRC.afuNlpcDuree : SRC.afuDelai, SRC.afuMolecules],
      forme: 'colonisation_avant_geste',
    };
  }
  if (p.neutropenie === 'oui')
    return {
      ...base,
      decision: 'informations_insuffisantes',
      qualification: 'colonisation',
      titre: 'Bactériurie chez un patient neutropénique : avis spécialisé',
      raison: 'Neutropénie à haut risque (PNN < 100/mm³ depuis au moins 7 jours après chimiothérapie) : l’IDSA 2019 ne recommande ni pour ni contre le traitement d’une bactériurie asymptomatique ; l’IUAS 2015 (R.28) recommande de ne pas dépister ni traiter chez les autres immunodéprimés. Divergence : décision avec le SMIT ou l’hématologue.',
      conditions: ['neutropénie déclarée', 'bactériurie sans symptôme'],
      actions: ['Avis SMIT / hématologie'],
      reconsiderer: ['Fièvre : prise en charge de la neutropénie fébrile (hors périmètre)'],
      sources: [SRC.idsaNeutropenie, SRC.iuasR28],
    };
  // Exceptions dont la recherche est incomplète : toutes les questions sont posées ensemble.
  const questions: string[] = [];
  if (p.grossesse === 'inconnu' && femmeEnAgeDeProcreer) questions.push('Grossesse en cours ?');
  if (c.gesteUrologique === 'inconnu') questions.push('Un geste urologique est-il prévu ? Lequel ?');
  else if (g.conduite === 'a_preciser') questions.push('Nature exacte du geste urologique prévu (non référencé dans l’application : voir AFU/CIAFU/SPILF 2026 ou l’urologue)');
  if (u.urine?.motif === 'avant_geste_urologique' && c.gesteUrologique === 'aucun') questions.push('L’ECBU a été fait avant un geste urologique, mais aucun geste n’est déclaré : lequel est prévu ?');
  if (questions.length > 0)
    return {
      ...base,
      decision: 'informations_insuffisantes',
      qualification: 'colonisation',
      titre: 'Colonisation probable : exceptions à vérifier',
      raison: 'Sans symptôme, la bactériurie ne se traite pas, sauf pendant la grossesse et avant certains gestes urologiques (tous les gestes ne sont pas équivalents) : ces exceptions doivent être connues avant de conclure.',
      exceptions: exceptionsRecherchees(ctx),
      questions,
      sources: [SRC.spilf15Colo, SRC.spilf26Colo, SRC.afuR1],
    };
  return undefined;
}
