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
  spilf26Colo: S('SPILF-2026-IUM', 'diapo 4', 'Recherche ou traitement d\'une colonisation urinaire : non indiqués, sauf avant certains gestes urologiques', 'choix'),
  spilf26Signes: S('SPILF-2026-IUM', 'diapo 4', 'Hématurie macroscopique ou rétention aiguë d\'urine, isolées, ne sont pas des signes cliniques d\'infection urinaire', 'definition'),
  spilf26Indeterminee: S('SPILF-2026-IUM', 'diapo 5', 'Bactériurie de signification clinique indéterminée : Présence d\'une bactériurie associée à des signes généraux non spécifiques et à l\'absence de signes clinique de cystite ; Dans cette situation et en l\'absence de sepsis, une surveillance clinique sans antibiothérapie est recommandée', 'choix'),
  spilf26NonSpecifiques: S('SPILF-2026-IUM', 'diapo 7', 'Signes généraux non spécifiques du sujet âgé (confusion, dépendance aiguë, altération brutale de l\'état général, décompensation d\'organe, chute) lorsqu\'il n\'y a pas de signes d\'infection urinaire associés', 'controle_micro'),
  iuasR1: S('SPILF-AFU-SF2H-2015-IUAS', 'R.1 (A-III), p. 6', 'si et seulement s\'ils présentent une fièvre, une hypothermie (<36°), une hypotension, une altération de l\'état mental, un malaise général ou une léthargie sans autre cause identifiée', 'definition'),
  iuasR4: S('SPILF-AFU-SF2H-2015-IUAS', 'R.3 (A-II), R.4 (A-III), p. 8', 'éliminer d\'autres sites d\'infection… même en présence d\'une bactériurie chez le sujet âgé', 'choix'),
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
  idsaFievreSansFoyer: S('IDSA-2019-bacteriurie-asymptomatique', 'question V (remarque)', 'broad-spectrum antimicrobial therapy directed against urinary and nonurinary sources should be initiated', 'choix'),
  idsaNeutropenie: S('IDSA-2019-bacteriurie-asymptomatique', 'question IX', 'we make no recommendation for or against screening for or treatment of ASB', 'choix'),
  idsaSonde: S('IDSA-2019-bacteriurie-asymptomatique', 'question XI (strong, low)', 'recommend against screening for or treating ASB', 'choix'),
  argPolymicrobien: S('SPILF-2015-IU-argumentaire', 'p. 23', 'Au-delà de deux types de colonies différentes, l\'analyse n\'est pas poursuivie', 'definition'),
  argCollecteur: S('SPILF-2015-IU-argumentaire', 'p. 22', 'le recueil se fait par ponction après désinfection sur le site spécifique du dispositif de sonde (et jamais à partir du sac collecteur)', 'definition'),
  argSansLeuco: S('SPILF-2015-IU-argumentaire', 'p. 23', 'Une bactériurie sans leucocyturie doit faire évoquer par ordre de fréquence une contamination', 'definition'),
  iuasRecontrole: S('SPILF-AFU-SF2H-2015-IUAS', 'p. 10', 'la clinique prime sur les seuils', 'definition'),
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
  bilan_urodynamique: { libelle: 'Bilan urodynamique', conduite: 'traiter_avant', sources: [afu('tableaux 5-6, p. 26, 28', 'Bilan urodynamique : Oui (accord fort)')] },
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
    const urinaireProbable = signesU === 'nouveaux' || declare || ((c.fievre === 'oui' || sonde) && c.autreFoyer === 'recherche_negative');
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
      sources: [SRC.ssc26, SRC.iuasR34, SRC.iuasR4],
      foyerUrinaire: urinaireProbable,
      forme: urinaireProbable ? 'iu_febrile_ou_masculine' : undefined,
    });
  }

  /* 1. Prélèvement potentiellement contaminé. */
  const contamination = ctxU.recueil === 'collecteur' || ctxU.nbEspeces === 'trois_ou_plus';
  if (contamination) {
    const symptomatique = signesU === 'nouveaux' || c.fievre === 'oui' || declare;
    const pourquoi = ctxU.nbEspeces === 'trois_ou_plus' ? 'plusieurs espèces rapportées' : 'recueil par collecteur';
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
      sources: [ctxU.nbEspeces === 'trois_ou_plus' ? SRC.argPolymicrobien : SRC.argCollecteur, SRC.argSansLeuco, SRC.iuasRecontrole, ...(symptomatique ? [SRC.iuasR36] : [SRC.spilf15Colo])],
    });
  }

  /* 2. Porteur d'un dispositif endo-urinaire : définition clinique stricte (IUAS R.1). */
  if (sonde) {
    const signes = c.fievre === 'oui' || c.signesNonSpecifiques === 'oui';
    const aucunSigne = c.fievre === 'non' && c.signesNonSpecifiques === 'non' && signesU !== 'nouveaux';
    if (signes || signesU === 'nouveaux') {
      if (c.autreFoyer === 'identifie')
        return ev({
          decision: 'ne_pas_traiter',
          qualification: 'colonisation',
          titre: 'Bactériurie sur sonde : les signes sont expliqués par un autre foyer',
          raison: 'Sur dispositif endo-urinaire, une infection urinaire n\'est évoquée qu\'en l\'absence d\'autre cause identifiée. Traiter le foyer identifié ; la bactériurie ne justifie pas d\'antibiothérapie propre.',
          conditions: ['dispositif endo-urinaire', 'autre foyer identifié'],
          actions: ['Prendre en charge le foyer identifié', 'Ne pas changer la sonde pour refaire un ECBU'],
          reconsiderer: ['Si le foyer identifié est écarté'],
          sources: [SRC.iuasR1, SRC.iuasLeuco],
        });
      if (c.autreFoyer === 'non_recherche')
        return ev({
          decision: 'informations_insuffisantes',
          qualification: 'indeterminee',
          titre: 'Bactériurie sur sonde avec signes généraux : rechercher d\'abord une autre cause',
          raison: 'Sur dispositif endo-urinaire, la bactériurie est fréquente : l\'infection urinaire n\'est retenue qu\'après avoir écarté une autre cause des signes. La leucocyturie n\'aide pas.',
          conditions: ['dispositif endo-urinaire', 'fièvre ou signes généraux présents'],
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
        conditions: ['dispositif endo-urinaire', 'fièvre ou signes généraux', 'autre foyer recherché et non trouvé'],
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
      questions: [c.fievre === 'inconnu' ? 'Fièvre ou hypothermie ?' : '', c.signesNonSpecifiques === 'inconnu' ? 'Confusion, malaise, léthargie ou hypotension ?' : ''].filter(Boolean),
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
      raison: declare && signesU === 'inconnu' ? 'Foyer urinaire déclaré par le prescripteur.' : 'Signes urinaires récents et ECBU positif : infection urinaire.',
      conditions: [declare && signesU === 'inconnu' ? 'foyer urinaire déclaré' : 'signes urinaires nouveaux', c.fievre === 'oui' ? 'fièvre' : c.fievre === 'non' ? 'pas de fièvre' : 'fièvre non renseignée'],
      questions: forme === 'a_preciser' ? ['Fièvre ou hypothermie ? (distingue cystite et infection fébrile)'] : [],
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
      decision: 'traiter',
      qualification: 'indeterminee',
      titre: 'Fièvre sans foyer identifié et bactériurie : traiter sans présumer l\'origine urinaire',
      raison: 'Fièvre sans signe urinaire et sans autre foyer retrouvé : l\'IDSA 2019 recommande une antibiothérapie couvrant les sources urinaires et non urinaires. Ce choix de spectre n\'est pas modélisé par l\'application : avis SMIT. (SPILF 2026 recommande la surveillance sans antibiotique lorsque seuls des signes généraux non spécifiques sont présents, sans sepsis.)',
      conditions: ['fièvre', 'pas de signe urinaire nouveau', 'autre foyer recherché et non trouvé', 'pas de sepsis'],
      actions: ['Hémocultures avant antibiothérapie', 'Avis SMIT pour le choix du spectre'],
      reconsiderer: ['Apparition de signes urinaires ou lombaires', 'Sepsis', 'Résultat des hémocultures'],
      sources: [SRC.idsaFievreSansFoyer, SRC.spilf26Indeterminee, SRC.iuasR4],
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
      raison: 'Confusion, chute ou perte d\'autonomie sans fièvre ni signe urinaire : ces signes ne doivent pas être attribués à la bactériurie. Rechercher une autre cause ; la bactériurie ne se traite pas.',
      conditions: ['signes non spécifiques', 'pas de fièvre', 'pas de signe urinaire nouveau', 'pas de sepsis'],
      exceptions: exceptionsRecherchees(ctx),
      actions: ['Rechercher une autre cause (iatrogénie, déshydratation, rétention, fécalome, autre infection…)', 'Ne pas prescrire d\'antibiotique pour la bactériurie', 'Ne pas répéter l\'ECBU'],
      surveillance: ['Surveillance clinique (température, état de conscience, autonomie)'],
      reconsiderer: ['Fièvre ou hypothermie', 'Signes urinaires nouveaux', 'Instabilité hémodynamique ou sepsis'],
      sources: [SRC.idsaDelirium, SRC.spilf26Indeterminee, SRC.spilf26NonSpecifiques, SRC.iuasR4],
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
    surveillance: ['Surveillance clinique habituelle'],
    reconsiderer: ['Apparition de signes urinaires, de fièvre ou d\'un sepsis', 'Grossesse', 'Geste urologique programmé'],
    sources: [SRC.spilf15Colo, SRC.spilf26Colo, SRC.afuR1, SRC.idsa19],
  });
}

/** Liste lisible des exceptions examinées. */
function exceptionsRecherchees(ctx: ContexteDecision): string[] {
  const p = ctx.dossier.patient;
  const g = ctx.dossier.clinique.gesteUrologique;
  const l: string[] = [];
  if (p.sexe !== 'homme') l.push(`Grossesse : ${p.grossesse === 'non' ? 'non' : p.grossesse === 'oui' ? 'oui' : 'non applicable'}`);
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
  const femmeEnAgeDeProcreer = p.sexe !== 'homme' && (p.age === undefined || p.age <= 50);

  if (p.grossesse === 'oui')
    return {
      ...base,
      decision: 'traiter',
      qualification: 'colonisation',
      titre: 'Colonisation urinaire gravidique : traitement indiqué',
      raison: 'Pendant la grossesse, une colonisation urinaire se traite, d\'emblée selon l\'antibiogramme (pas de traitement probabiliste).',
      conditions: ['grossesse', 'bactériurie sans symptôme'],
      actions: ['Traitement adapté à l\'antibiogramme (fiche HAS « Femme enceinte »)', 'Avis obstétrical selon le contexte'],
      surveillance: ['ECBU de contrôle 8 à 10 jours après l\'arrêt du traitement, puis ECBU mensuel jusqu\'à l\'accouchement'],
      reconsiderer: ['Fièvre ou douleur lombaire : pyélonéphrite gravidique'],
      sources: [SRC.spilf15Colo, SRC.hasGrossesse, SRC.hasGrossesseSuivi],
      forme: 'colonisation_gravidique',
    };
  if (p.grossesse === 'inconnu' && femmeEnAgeDeProcreer)
    return {
      ...base,
      decision: 'informations_insuffisantes',
      qualification: 'colonisation',
      titre: 'Colonisation probable : exception à vérifier (grossesse)',
      raison: 'Sans symptôme, la bactériurie ne se traite pas, sauf pendant la grossesse : le statut de grossesse doit être connu avant de conclure.',
      questions: ['Grossesse en cours ?'],
      sources: [SRC.spilf15Colo],
    };
  const g = GESTES[c.gesteUrologique];
  if (p.neutropenie === 'oui')
    return {
      ...base,
      decision: 'informations_insuffisantes',
      qualification: 'colonisation',
      titre: 'Bactériurie chez un patient neutropénique : avis spécialisé',
      raison: 'Aucune recommandation pour ou contre le traitement d\'une bactériurie asymptomatique en cas de neutropénie profonde (lacune de connaissance). La décision relève du SMIT ou de l\'hématologue.',
      conditions: ['neutropénie déclarée', 'bactériurie sans symptôme'],
      actions: ['Avis SMIT / hématologie'],
      reconsiderer: ['Fièvre : prise en charge de la neutropénie fébrile (hors périmètre)'],
      sources: [SRC.idsaNeutropenie],
    };
  if (g.conduite === 'sans_recommandation')
    return {
      ...base,
      decision: 'informations_insuffisantes',
      qualification: 'colonisation',
      titre: 'Colonisation et geste sans recommandation établie',
      raison: `Pour ce geste (${g.libelle.toLowerCase()}), les recommandations AFU 2026 ne permettent pas de trancher (« pas de recommandation possible ») : décision avec l'urologue et le SMIT.`,
      actions: ['Discussion avec l\'urologue et le SMIT'],
      sources: g.sources,
    };
  if (g.conduite === 'traiter_avant')
    return {
      ...base,
      statut: g.statut ?? 'verifiee_ia',
      decision: 'traiter',
      qualification: 'colonisation',
      titre: `Colonisation à traiter avant le geste : ${g.libelle.toLowerCase()}`,
      raison: `Avant ce geste urologique, une colonisation urinaire se traite selon l'antibiogramme, pour prévenir une infection post-opératoire.${g.remarque ? ' ' + g.remarque : ''} Durée : l'IDSA 2019 propose 1 ou 2 doses, l'AFU 2026 3 à 5 jours (divergence ; l'application affiche l'AFU).`,
      conditions: ['bactériurie sans symptôme', `geste prévu : ${g.libelle.toLowerCase()}`],
      actions: ['Traitement adapté à l\'antibiogramme, débuté 48 h avant le geste et poursuivi jusqu\'à J0 (au plus 48 h après) : 3 à 5 jours au total', 'Molécules par ordre de préférence (AFU 2026) : fosfomycine-trométamol, nitrofurantoïne, pivmécillinam, triméthoprime ; puis amoxicilline, cotrimoxazole ; puis amoxicilline-acide clavulanique ; puis fluoroquinolones, céfixime. Posologies : se référer au texte (non modélisées)'],
      reconsiderer: ['Report du geste', 'Apparition de signes d\'infection'],
      sources: [...g.sources, SRC.afuDelai, SRC.afuMolecules],
      forme: 'colonisation_avant_geste',
    };
  if (g.conduite === 'a_preciser' && c.gesteUrologique !== 'inconnu')
    return {
      ...base,
      decision: 'informations_insuffisantes',
      qualification: 'colonisation',
      titre: 'Colonisation probable : la conduite dépend du geste prévu',
      raison: `Tous les gestes urologiques ne sont pas équivalents. Le geste « ${g.libelle.toLowerCase()} » n'est pas encore référencé dans l'application : se reporter aux recommandations AFU/CIAFU/SPILF 2026 ou demander l'avis de l'urologue.`,
      questions: ['Nature exacte du geste urologique prévu'],
      sources: [SRC.afuR1],
    };
  if (c.gesteUrologique === 'inconnu')
    return {
      ...base,
      decision: 'informations_insuffisantes',
      qualification: 'colonisation',
      titre: 'Colonisation probable : exception à vérifier (geste urologique)',
      raison: 'Sans symptôme, la bactériurie ne se traite pas, sauf avant certains gestes urologiques : préciser si un geste est prévu, et lequel.',
      questions: ['Un geste urologique est-il prévu ? Lequel ?'],
      sources: [SRC.spilf26Colo],
    };
  return undefined;
}
