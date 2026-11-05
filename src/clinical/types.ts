/**
 * Modèle de données de la base clinique, du registre des sources et des sorties du moteur.
 * Tout est volontairement explicite : « inconnu » est distinct de « non ».
 */

export type TriState = 'oui' | 'non' | 'inconnu';

/** Statuts de validation d'une règle ou d'un élément clinique. */
export type StatutValidation =
  | 'brouillon'
  | 'verifiee_ia'
  | 'validee_humain'
  | 'publiee'
  | 'retiree';

/* ------------------------------------------------------------------ */
/* Registre des sources                                                */
/* ------------------------------------------------------------------ */

export type StatutAcces = 'consultee' | 'contenu_non_lisible' | 'introuvable';
export type StatutVigueur = 'en_vigueur' | 'remplacee' | 'incertain' | 'retiree';

export interface Source {
  id: string;
  organisme: string;
  titre: string;
  annee: number;
  version?: string;
  type: 'recommandation' | 'consensus' | 'rcp' | 'referentiel' | 'reglementaire' | 'essai' | 'revue' | 'documentation';
  url: string;
  urlPdf?: string;
  dateConsultation: string; // AAAA-MM-JJ
  statutAcces: StatutAcces;
  statutVigueur: StatutVigueur;
  remplaceePar?: string;
  notes?: string;
}

/** Référence précise à un passage d'une source. */
export interface SourceRef {
  source: string; // id de Source
  repere?: string; // page, section, tableau, numéro de recommandation
  extrait?: string; // court extrait justificatif (≤ 40 mots)
  /** Ancre ou page permettant d'ouvrir le passage (ex. "#page=45" ou "#section-4-2"). */
  ancre?: string;
  /** Ce que cette référence justifie. */
  justifie?:
    | 'choix'
    | 'posologie'
    | 'adaptation_renale'
    | 'duree'
    | 'surveillance'
    | 'controle_micro'
    | 'imagerie'
    | 'geste'
    | 'definition'
    | 'autre';
}

/* ------------------------------------------------------------------ */
/* Patient                                                             */
/* ------------------------------------------------------------------ */

export type Sexe = 'femme' | 'homme' | 'inconnu';
export type UniteCreatinine = 'umol/L' | 'mg/dL';
export type MethodeDFG = 'CKD-EPI' | 'MDRD' | 'Cockcroft' | 'mesure' | 'inconnue';
export type Dialyse = 'aucune' | 'hemodialyse_intermittente' | 'eer_continue' | 'dialyse_peritoneale' | 'inconnu';
export type Contexte = 'communautaire' | 'associe_aux_soins' | 'inconnu';
export type Gravite = 'stable' | 'sepsis' | 'choc_septique' | 'inconnu';
export type Valve = 'native' | 'prothese_mecanique' | 'prothese_biologique' | 'tavi' | 'inconnu';

export type TypeReactionAllergique =
  | 'immediate' // urticaire, angio-œdème, bronchospasme, anaphylaxie (< 1 h)
  | 'retardee_benigne' // exanthème maculo-papuleux sans signe de gravité
  | 'retardee_severe' // DRESS, SJS/Lyell, PEAG, atteinte d'organe
  | 'intolerance_non_allergique' // troubles digestifs, etc.
  | 'inconnue';

export interface Allergie {
  /** DCI ou classe (ex. "amoxicilline", "penicillines", "cephalosporines"). */
  molecule: string;
  reaction: TypeReactionAllergique;
  gravite?: 'legere' | 'moderee' | 'severe' | 'inconnue';
  delai?: string;
  /** Molécules de la même famille tolérées depuis. */
  tolerees?: string[];
}

export interface AntibiotiqueRecent {
  dci: string;
  enCours: TriState;
  debut?: string; // AAAA-MM-JJ
  fin?: string;
  /** Horaire de la dernière dose, pour les calendriers de STP. */
  derniereDoseISO?: string;
}

export interface AntecedentMicrobiologique {
  organisme: string;
  resistance?: 'BLSE' | 'EPC' | 'SARM' | 'ERV' | 'autre';
  date?: string;
}

export type MaterielVasculaire = 'aucun' | 'cvc' | 'picc' | 'chambre_implantable' | 'catheter_dialyse' | 'autre' | 'inconnu';
export type MaterielUrinaire = 'aucun' | 'sonde_vesicale' | 'sonde_jj' | 'nephrostomie' | 'autre' | 'inconnu';

export interface Patient {
  age?: number;
  sexe: Sexe;
  poidsKg?: number;
  tailleCm?: number;
  grossesse: TriState;
  allaitement: TriState;
  renal: {
    creatinine?: { valeur: number; unite: UniteCreatinine; date?: string };
    dfg?: { valeur: number; methode: MethodeDFG; date?: string };
    stabilite: 'stable' | 'instable' | 'inconnu';
    insuffisanceRenaleAigue: TriState;
    dialyse: Dialyse;
    /** Pour l'hémodialyse intermittente : jours et heures de séance. */
    horairesDialyse?: string;
  };
  insuffisanceHepatique: TriState;
  /** « aucune » = interrogatoire fait, aucune allergie ; « inconnu » = non recherché. */
  statutAllergie: 'aucune' | 'presentes' | 'inconnu';
  allergies: Allergie[];
  immunodepression: TriState;
  neutropenie: TriState;
  traitementsAssocies: TraitementAssocie[];
  antibiotiquesRecents: AntibiotiqueRecent[];
  antecedentsMicro: AntecedentMicrobiologique[];
  contexte: Contexte;
  gravite: Gravite;
  valve: Valve;
  dispositifIntracardiaque: TriState;
  protheseArticulaire: TriState;
  protheseArticulaireDetails?: { site?: string; datePose?: string };
  materielVasculaire: MaterielVasculaire;
  materielVasculaireDatePose?: string;
  materielUrinaire: MaterielUrinaire;
  /** Forme clinique de l'infection urinaire masculine (SPILF 2026 : la durée en dépend). */
  formeIUMasculine?: 'pna' | 'prostatite' | 'orchi_epididymite' | 'inconnu';
  interventionRecente?: string;
}

/**
 * Geste urologique prévu : tous les gestes ne sont pas équivalents vis-à-vis
 * d'une colonisation urinaire (AFU/CIAFU/SPILF 2026).
 */
export type GesteUrologique =
  | 'aucun'
  // ECBU et traitement d'une colonisation recommandés (AFU 2026)
  | 'ablation_endoscopique_hbp'
  | 'urethroplastie'
  | 'ureteroscopie'
  | 'nlpc'
  | 'rtuv'
  | 'bilan_urodynamique'
  | 'sonde_jj_nephrostomie'
  // Pas de dépistage (AFU 2026)
  | 'cystoscopie'
  | 'prostatectomie_totale'
  | 'enucleation_voie_haute'
  | 'cystectomie'
  | 'nephrectomie'
  | 'instillations_toxine'
  | 'sphincter_implant_prothese'
  | 'biopsies_prostate'
  | 'changement_ablation_sonde_vesicale'
  // Pas de recommandation possible (AFU 2026)
  | 'sans_recommandation'
  | 'autre'
  | 'inconnu';

/** Éléments cliniques de l'épisode, utiles pour décider s'il faut traiter. */
export interface Clinique {
  /** Fièvre ≥ 38 °C ou hypothermie < 36 °C. */
  fievre: TriState;
  /** Signes fonctionnels urinaires (brûlures, pollakiurie, impériosité, douleur sus-pubienne, lombaire ou pelvienne). */
  signesUrinaires: 'nouveaux' | 'chroniques_inchanges' | 'absents' | 'inconnu';
  /** Signes non spécifiques : confusion, chute, perte d'autonomie, altération de l'état général. */
  signesNonSpecifiques: TriState;
  /** Un autre foyer infectieux peut-il expliquer les signes ? */
  autreFoyer: 'identifie' | 'recherche_negative' | 'non_recherche';
  gesteUrologique: GesteUrologique;
  /** Prélèvement superficiel (plaie) : signes cliniques d'infection locale (pus, dermohypodermite, abcès…). */
  signesInfectionLocale: TriState;
}

/* ------------------------------------------------------------------ */
/* Microbiologie                                                       */
/* ------------------------------------------------------------------ */

export type TypePrelevement = 'hemoculture' | 'urine' | 'profond' | 'superficiel' | 'respiratoire' | 'autre';
export type StadeIdentification = 'examen_direct' | 'identification' | 'antibiogramme';
export type CategorieSIR = 'S' | 'I' | 'R';

export type OrganismeId =
  | 'bgn_non_identifie'
  | 'enterobacterie_non_identifiee'
  | 'escherichia_coli'
  | 'klebsiella_pneumoniae'
  | 'enterobacter_cloacae'
  | 'proteus_mirabilis'
  | 'pseudomonas_aeruginosa'
  | 'cgp_non_identifie'
  | 'staphylococcus_aureus'
  | 'staphylocoque_coagulase_negative'
  | 'staphylococcus_epidermidis'
  | 'staphylococcus_lugdunensis'
  | 'streptococcus_pneumoniae'
  | 'streptococcus_pyogenes'
  | 'streptococcus_agalactiae'
  | 'streptocoque_groupe_c_g'
  | 'streptocoque_viridans'
  | 'streptococcus_gallolyticus'
  | 'enterococcus_faecalis'
  | 'enterococcus_faecium'
  | 'enterocoque_non_identifie'
  | 'autre';

/** « NT » : non testé, en attente ou non renseigné — jamais interprété comme sensible. */
export type CategorieSaisie = CategorieSIR | 'NT';

export interface ResultatAntibiogramme {
  dci: string;
  categorie: CategorieSaisie;
  cmi?: number; // mg/L
}

/**
 * Phénotype ou mécanisme de résistance explicitement rapporté par le laboratoire.
 * « non_rapporte » (non recherché ou non renseigné) n'est jamais lu comme « absent ».
 */
export type PhenotypeId = 'BLSE' | 'ampc' | 'carbapenemase' | 'SARM' | 'ERV' | 'hnr_gentamicine';
export type EtatPhenotype = 'present' | 'absent' | 'non_rapporte';

/** Données propres à un isolat : chaque antibiogramme reste rattaché à son germe. */
export interface DonneesIsolat {
  organisme?: OrganismeId;
  organismeLibre?: string;
  antibiogramme?: ResultatAntibiogramme[];
  phenotypes?: Partial<Record<PhenotypeId, EtatPhenotype>>;
  /** Germe pour lequel les résultats ont été saisis : si le germe change, ils sont effacés. */
  antibiogrammePour?: OrganismeId;
}

export interface Isolat extends DonneesIsolat {
  id: string;
}

/** Raison de la réalisation de l'ECBU. */
export type MotifECBU =
  | 'signes_urinaires'
  | 'fievre'
  | 'signes_non_specifiques'
  | 'depistage_grossesse'
  | 'avant_geste_urologique'
  | 'systematique'
  | 'controle_apres_traitement'
  | 'autre'
  | 'inconnu';

export type RecueilUrine = 'mi_jet' | 'sondage_aller_retour' | 'sonde_a_demeure' | 'collecteur' | 'nephrostomie_ou_derivation' | 'inconnu';

export interface ContexteECBU {
  motif: MotifECBU;
  recueil: RecueilUrine;
  /** Nombre d'espèces rapportées par le laboratoire. */
  nbEspeces: 'une' | 'deux' | 'trois_ou_plus' | 'inconnu';
}

export type MecanismeResistance =
  | 'BLSE'
  | 'carbapenemase'
  | 'cephalosporinase_dereprimee'
  | 'SARM'
  | 'ERV'
  | 'aucun_documente';

export type FoyerId =
  | 'inconnu'
  | 'urinaire'
  | 'endocardite'
  | 'catheter'
  | 'osteoarticulaire_materiel'
  | 'osteoarticulaire_sans_materiel'
  | 'cutane'
  | 'pulmonaire'
  | 'digestif'
  | 'autre';

export interface Prelevement extends DonneesIsolat {
  id: string;
  type: TypePrelevement;
  stade: StadeIdentification;
  /** Résultat de l'examen direct, si seul disponible. */
  examenDirect?: 'bgn' | 'cgp_amas' | 'cgp_chainettes' | 'autre' | 'inconnu';
  antibiogrammeDisponible: TriState;
  referentiel?: string; // ex. "CA-SFM/EUCAST 2026 v1.0"
  /** Autres germes du même prélèvement (prélèvement polymicrobien), chacun avec son antibiogramme. */
  isolatsSupplementaires?: Isolat[];
  /** ECBU : raison, mode de recueil, nombre d'espèces. */
  urine?: ContexteECBU;
  /** Hémocultures. */
  hemoc?: {
    nbSeriesPrelevees?: number;
    nbSeriesPositives?: number;
    nbFlaconsPositifs?: number;
    origine: 'peripherique' | 'catheter' | 'les_deux' | 'inconnu';
    delaiPositiviteDifferentielHeures?: number;
    datePremierePositiveISO?: string;
    persistance: 'negativees' | 'persistantes' | 'non_controlees' | 'inconnu';
    dateNegativationISO?: string;
  };
  /** Foyer suspecté / confirmé. */
  foyer: FoyerId;
  foyerStatut: 'suspecte' | 'confirme' | 'inconnu';
  signesInfectionMateriel: TriState;
  dateISO?: string;
}

/* ------------------------------------------------------------------ */
/* Molécules et posologies                                             */
/* ------------------------------------------------------------------ */

export type Famille =
  | 'penicilline'
  | 'cephalosporine'
  | 'carbapeneme'
  | 'monobactam'
  | 'aminoside'
  | 'glycopeptide'
  | 'lipopeptide'
  | 'oxazolidinone'
  | 'fluoroquinolone'
  | 'sulfamide'
  | 'rifamycine'
  | 'autre';

export interface DoseSpec {
  type: 'fixe' | 'ponderale';
  valeur: number;
  unite: 'g' | 'mg' | 'mg/kg' | 'MUI';
  /** Nombre d'administrations par 24 h (ou perfusion continue si `continue`). */
  frequenceParJour?: number;
  continue?: boolean;
  poidsReference?: 'total' | 'ideal' | 'ajuste';
  /** Pour `ajuste` : ratio poids réel / poids idéal à partir duquel le poids ajusté est utilisé. */
  seuilObesiteRatio?: number;
  doseMaxParAdministration?: { valeur: number; unite: 'g' | 'mg' };
  doseMaxParJour?: { valeur: number; unite: 'g' | 'mg' };
  /** Formulation lisible de secours quand la dose n'est pas un simple nombre (fourchette, etc.). */
  texte?: string;
}

export interface Regimen {
  id: string;
  libelle: string;
  indication: string;
  dose: DoseSpec;
  chargeInitiale?: DoseSpec & { libelle: string };
  voie: 'IV' | 'PO' | 'IV ou PO' | 'IM ou IV';
  modalites: string; // ex. "perfusion de 30 min"
  statut: StatutValidation;
  sources: SourceRef[];
  remarques?: string;
}

export interface PalierRenal {
  clcrMin?: number; // mL/min inclus
  clcrMax?: number; // mL/min exclu
  texte: string;
  sources: SourceRef[];
}

export interface AdaptationRenale {
  methode: 'Cockcroft' | 'CKD-EPI' | 'non_precisee';
  texteGeneral?: string;
  paliers: PalierRenal[];
  hemodialyse?: { texte: string; sources: SourceRef[] };
  eerContinue?: { texte: string; sources: SourceRef[] };
  statut: StatutValidation;
}

export type CategorieSurveillance = 'systematique' | 'conditionnelle' | 'non_recommande_routine' | 'non_determinable';

export interface SpecCalendrier {
  ancre:
    | 'avant_traitement'
    | 'debut_traitement'
    | 'dose'
    | 'fin_perfusion'
    | 'premiere_hemoculture_negative'
    | 'premiere_hemoculture_positive'
    | 'quotidien'
    | 'hebdomadaire'
    | 'non_determine';
  /** Délai en heures après l'ancre (peut être négatif pour « avant »). */
  offsetHeures?: number;
  /** Numéro de dose concerné (1 = première dose). */
  numeroDose?: number;
  /** Jour de traitement (J1 = premier jour). */
  jour?: number;
  repetition?: string;
  /** Formulation lisible, toujours présente. */
  texte: string;
}

export type ConditionId =
  | 'duree_sup_3j'
  | 'duree_sup_7j'
  | 'duree_sup_14j'
  | 'insuffisance_renale'
  | 'sujet_age'
  | 'hemodialyse'
  | 'eer_continue'
  | 'grossesse'
  | 'aminoside_associe'
  | 'piperacilline_associee'
  | 'statine_associee'
  | 'serotoninergique_associe'
  | 'qt_allongeant_associe'
  | 'anticoagulant_associe'
  | 'perfusion_continue'
  | 'perfusion_intermittente'
  | 'instabilite_renale'
  | 'patient_severe'
  | 'duree_sup_5j_ou_insuffisance_renale'
  | 'vancomycine_associee'
  | 'perfusion_intermittente_hors_hemodialyse';

export interface ElementSurveillance {
  id: string;
  type: 'bilan_initial' | 'clinique' | 'biologique' | 'stp' | 'interaction';
  categorie: CategorieSurveillance;
  quoi: string;
  quand: SpecCalendrier;
  pourquoi: string;
  /** Uniquement si sourcée. */
  conduite?: string;
  conditionTexte?: string;
  conditionId?: ConditionId;
  statut: StatutValidation;
  sources: SourceRef[];
}

export interface SpecSTP {
  id: string;
  parametre: 'pic' | 'residuelle' | 'plateau' | 'auc';
  indication: string;
  categorie: CategorieSurveillance;
  premierPrelevement: {
    quand: string; // ex. "après la 1re dose"
    position: string; // ex. "30 min après la fin de la perfusion de 30 min"
    numeroDose?: number;
    jour?: number;
    offsetHeuresApresFinPerfusion?: number;
    avantDoseSuivante?: boolean;
  };
  repetition: string;
  cible?: { min?: number; max?: number; unite: string; verifiee: boolean; texte: string };
  limites: string;
  conduite?: string;
  conditionId?: ConditionId;
  conditionTexte?: string;
  statut: StatutValidation;
  sources: SourceRef[];
}

export interface Molecule {
  id: string;
  dci: string;
  famille: Famille;
  /** Pour les bêta-lactamines : groupe de chaîne latérale (réactivité croisée). */
  chaineLaterale?: string;
  regimens: Regimen[];
  adaptationRenale: AdaptationRenale;
  surveillance: ElementSurveillance[];
  stp?: SpecSTP[];
  grossesse?: { statut: 'utilisable' | 'eviter' | 'contre_indique' | 'non_verifie'; texte: string; sources: SourceRef[] };
  insuffisanceHepatique?: { texte: string; sources: SourceRef[] };
  interactionsPertinentes?: { avec: TraitementAssocie; texte: string; sources: SourceRef[] }[];
  statut: StatutValidation;
}

/** Catégories de traitements associés pertinents pour les interactions. */
export type TraitementAssocie =
  | 'statine'
  | 'avk'
  | 'aod'
  | 'serotoninergique'
  | 'qt_allongeant'
  | 'methotrexate'
  | 'immunosuppresseur_calcineurine'
  | 'diuretique'
  | 'ains'
  | 'autre_nephrotoxique'
  | 'contraceptif_oral'
  | 'antiepileptique'
  | 'antiretroviral'
  | 'autre';

/* ------------------------------------------------------------------ */
/* Sorties du moteur                                                   */
/* ------------------------------------------------------------------ */

export type NiveauUrgence = 'immediate' | 'elevee' | 'standard';
export type Couverture = 'couverte' | 'partielle' | 'non_couverte';

export interface Alerte {
  niveau: 'urgence' | 'attention' | 'info';
  texte: string;
  sources?: SourceRef[];
}

export interface DonneeManquante {
  champ: string;
  pourquoi: string;
  impact: 'bloque_dose' | 'bloque_surveillance' | 'bloque_decision' | 'affine';
}

export interface PrescriptionProposee {
  moleculeId: string;
  dci: string;
  regimenId: string;
  /** Dose affichée : calculée si possible, sinon texte explicite de ce qui manque. */
  doseAffichee: string;
  doseCalculee?: {
    valeurParAdministration: number;
    unite: string;
    frequenceParJour?: number;
    continue?: boolean;
    poidsUtilise?: { valeur: number; type: string };
  };
  chargeInitiale?: string;
  voie: string;
  modalites: string;
  adaptations: string[];
  duree: { texte: string; pointDeDepart: string; sources: SourceRef[]; dureePrevueJours?: number };
  /** Surveillance propre à cette molécule, affichée avec le traitement. */
  surveillance: LigneSurveillance[];
  sources: SourceRef[];
  statut: StatutValidation;
  avertissements: string[];
}

export interface OptionTherapeutique {
  id: string;
  libelle: string;
  type: 'probabiliste' | 'documente';
  rang: 'premiere_ligne' | 'alternative' | 'conditionnelle';
  condition?: string;
  prescriptions: PrescriptionProposee[];
  commentaire?: string;
  sources: SourceRef[];
  statut: StatutValidation;
}

export interface LigneSurveillance {
  moleculeDci: string;
  element: ElementSurveillance | SpecSTP;
  texteCalendrier: string;
  dateCalculeeISO?: string;
}

export interface LigneControle {
  id: string;
  type: 'hemoculture' | 'echocardiographie' | 'imagerie' | 'prelevement' | 'foyer' | 'materiel' | 'autre';
  categorie: 'indique' | 'non_systematique' | 'conditionnel' | 'non_determinable';
  quoi: string;
  quand: SpecCalendrier;
  pourquoi: string;
  ensuite?: string;
  sources: SourceRef[];
  statut: StatutValidation;
}

export interface EvenementFrise {
  id: string;
  moment: string;
  ordre: number;
  quoi: string;
  pourquoi: string;
  ensuite?: string;
  type: 'maintenant' | 'controle' | 'surveillance' | 'reevaluation' | 'relais_arret';
  dateISO?: string;
  sources: SourceRef[];
}

export interface RegleAppliquee {
  id: string;
  libelle: string;
  statut: StatutValidation;
  sources: SourceRef[];
}

/** Décision sur l'indication d'antibiothérapie : distincte du choix de la molécule. */
export type DecisionIndication = 'traiter' | 'urgence' | 'ne_pas_traiter' | 'informations_insuffisantes' | 'attendre_resultat';
export type QualificationCulture = 'infection' | 'infection_probable' | 'colonisation' | 'contamination_possible' | 'indeterminee';

export interface IndicationPlan {
  decision: DecisionIndication;
  qualification: QualificationCulture;
  titre: string;
  raison: string;
  /** Conditions qui justifient la conclusion (ce qui a été renseigné). */
  conditions: string[];
  /** Exceptions recherchées ou à rechercher avant de conclure. */
  exceptions: string[];
  actions: string[];
  surveillance: string[];
  /** Éléments qui doivent faire reconsidérer la décision. */
  reconsiderer: string[];
  /** Questions dont la réponse permettrait de conclure (décision « informations insuffisantes »). */
  questions: string[];
  sources: SourceRef[];
  statut: StatutValidation;
  regleId: string;
}

/** Synthèse microbiologique d'un isolat : ce qui compte pour la décision. */
export interface SyntheseIsolat {
  prelevementId: string;
  isolatId: string;
  germe: string;
  determinants: { texte: string; sources: SourceRef[] }[];
  inconnues: { texte: string; pourquoi: string }[];
  incoherences: { texte: string; sources: SourceRef[] }[];
  sensiblesNonRetenues: { dci: string; raison: string; sources: SourceRef[] }[];
}

export interface Plan {
  versionClinique: string;
  indication?: IndicationPlan;
  microbiologie: SyntheseIsolat[];
  situation: {
    id: string;
    libelle: string;
    couverture: Couverture;
    description: string;
  };
  urgence: { niveau: NiveauUrgence; alertes: Alerte[] };
  options: OptionTherapeutique[];
  surveillance: LigneSurveillance[];
  controles: LigneControle[];
  gestes: { texte: string; sources: SourceRef[] }[];
  reevaluation: { texte: string; sources: SourceRef[] }[];
  avisSpecialise: { texte: string; urgent: boolean; sources: SourceRef[] }[];
  donneesManquantes: DonneeManquante[];
  frise: EvenementFrise[];
  regles: RegleAppliquee[];
  sources: SourceRef[];
  contientReglesNonValidees: boolean;
  /** Option dont le calendrier est affiché (retenue par le prescripteur ou 1re ligne). */
  optionRetenueId?: string;
}
