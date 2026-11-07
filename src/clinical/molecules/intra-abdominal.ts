/**
 * Molécule propre aux infections intra-abdominales : métronidazole (IV et per os).
 * RCP lus le 2026-11-06 (base de données publique des médicaments) et CRAT : docs/sources/recherche-intra-abdominal.md §12.1.
 * Les autres molécules citées par les recommandations sans RCP lu (linézolide, téicoplanine, moxifloxacine,
 * tigécycline, éravacycline, antifongiques) ne sont pas dans la base : elles sont seulement mentionnées par les règles.
 */
import type { Molecule } from '../types';
import { S, SRC_DOSES_2026 } from './base';

const RCP_IV = 'RCP-metronidazole-IV';
const RCP_PO = 'RCP-metronidazole-oral';

/** Informations de sécurité des RCP (note §12.1) sans traduction structurée dans la base : affichées en remarque. */
const MISES_EN_GARDE =
  'Interactions (RCP IV et oral §4.5) : busulfan et disulfirame à éviter ; lithium, fluoro-uracile, mycophénolate à prendre en compte ; rifampicine et inducteurs enzymatiques : baisse des concentrations de métronidazole (RCP oral). Syndrome de Cockayne : hépatotoxicité (RCP §4.4). Réactions psychotiques possibles (RCP oral §4.4). Interférence avec les dosages d\'ALAT, ASAT, LDH, triglycérides et glucose (RCP IV §4.4).';

export const metronidazole: Molecule = {
  id: 'metronidazole',
  dci: 'Métronidazole',
  famille: 'nitroimidazole',
  statut: 'verifiee_ia',
  regimens: [
    {
      id: 'metronidazole-iv-500x3',
      libelle: '500 mg toutes les 8 h IV',
      indication: 'Infections intra-abdominales, en association à une céphalosporine, au céfépime, à une fluoroquinolone ou à l\'aztréonam (SFAR 2026 Annexe 1) ; diverticulite (HAS 2017).',
      dose: { type: 'fixe', valeur: 500, unite: 'mg', frequenceParJour: 3 },
      voie: 'IV',
      modalites: 'perfusion de 100 mL (500 mg) sur 20 minutes au minimum, sur une heure en temps normal ; relais oral possible (biodisponibilité orale de 100 %)',
      statut: 'verifiee_ia',
      sources: [
        S(RCP_IV, '§4.2', 'Autrement, 500 mg (100 ml) peuvent être administrés toutes les 8 heures', 'posologie'),
        S('SFAR-2026-IIA', 'Annexe 1, p. 73-74', '500 mg/8h IV', 'posologie'),
        S(SRC_DOSES_2026, 'p. 15 du PDF', 'Métronidazole 0,5 g per os ou par voie iv toutes les 8 h', 'posologie'),
      ],
      remarques: `RCP IV : autre schéma possible, 1 500 mg le premier jour puis 1 000 mg/j en dose unique ; dose de charge de 15 mg/kg possible. Sodium : « 966 mg (42 mmol) de sodium pour une dose de 300 mL ». Effet antabuse : pas d'alcool. Durée : ne pas dépasser 10 jours sauf cas spécifiques (RCP IV §4.4). ${MISES_EN_GARDE}`,
    },
    {
      id: 'metronidazole-po-500x3',
      libelle: '500 mg toutes les 8 h per os',
      indication: 'Diverticulite non compliquée en cas d\'allergie, avec la ciprofloxacine ou la lévofloxacine (HAS 2021) ; relais oral d\'un traitement injectable.',
      dose: { type: 'fixe', valeur: 500, unite: 'mg', frequenceParJour: 3 },
      voie: 'PO',
      modalites: 'per os toutes les 8 h ; pas d\'alcool pendant le traitement (effet antabuse)',
      statut: 'verifiee_ia',
      sources: [
        S('HAS-2021-diverticulite', 'allergie', 'métronidazole 500 mg 3 fois par jour pendant 7 jours', 'posologie'),
        S(RCP_PO, '§4.2', '1 à 1,5 g/jour', 'posologie'),
        S(SRC_DOSES_2026, 'p. 15 du PDF', 'Métronidazole 0,5 g per os ou par voie iv toutes les 8 h', 'posologie'),
      ],
      remarques: `RCP oral §4.3 : contre-indiqué en cas d'allergie au blé (hors maladie cœliaque). ${MISES_EN_GARDE}`,
    },
  ],
  adaptationRenale: {
    methode: 'non_precisee',
    statut: 'verifiee_ia',
    texteGeneral: 'Pas d\'adaptation à la fonction rénale (RCP IV) ; le RCP oral ne mentionne pas d\'adaptation rénale.',
    paliers: [
      {
        texte: 'Pas d\'adaptation : « Aucune réduction de dose n\'est nécessaire » (RCP IV) ; l\'insuffisance rénale ne retarde l\'excrétion qu\'à un degré insignifiant.',
        sources: [
          S(RCP_IV, '§4.2', 'Aucune réduction de dose n\'est nécessaire', 'adaptation_renale'),
          S(RCP_IV, '§5.2', 'Une insuffisance rénale retarde l\'excrétion seulement à un degré insignifiant.', 'adaptation_renale'),
        ],
      },
    ],
    hemodialyse: { texte: 'Éliminé par hémodialyse : les jours de dialyse, dose programmée après la séance.', sources: [S(RCP_IV, '§4.2', 'programmée après l\'hémodialyse les jours de dialyse', 'adaptation_renale')] },
  },
  insuffisanceHepatique: { texte: 'Insuffisance hépatique sévère : doses plus faibles nécessaires (réduction non chiffrée par le RCP).', sources: [S(RCP_IV, '§4.2', 'nécessiteront des doses plus faibles', 'posologie')] },
  surveillance: [
    {
      id: 'metronidazole-neuro',
      type: 'clinique',
      categorie: 'systematique',
      quoi: 'Signes neurologiques (neuropathie périphérique, convulsions, encéphalopathie ou syndrome cérébelleux) et réactions cutanées graves (NET, SJS, DRESS, PEAG) : arrêt',
      quand: { ancre: 'quotidien', texte: 'Pendant tout le traitement', repetition: 'à chaque évaluation clinique' },
      pourquoi: 'Neuropathie (surtout en traitement prolongé), convulsions, encéphalopathie ; réactions cutanées graves.',
      conduite: 'Encéphalopathie ou syndrome cérébelleux : arrêt (RCP oral) ; réaction cutanée grave : arrêt définitif (RCP IV et oral).',
      statut: 'verifiee_ia',
      sources: [
        S(RCP_IV, '§4.4', 'paraphrase : SCAR (NET, SJS, DRESS, PEAG) → arrêt définitif', 'surveillance'),
        S(RCP_PO, '§4.4', 'paraphrase : encéphalopathie/syndrome cérébelleux (lésions IRM cervelet, splénium) → arrêt', 'surveillance'),
      ],
    },
    {
      id: 'metronidazole-nfs',
      type: 'biologique',
      categorie: 'conditionnelle',
      quoi: 'Numération formule sanguine',
      quand: { ancre: 'non_determine', texte: 'En traitement prolongé (fréquence non chiffrée par le RCP)' },
      pourquoi: 'Durée ne devant pas dépasser 10 jours sauf cas spécifiques, avec surveillance clinique et biologique ; NFS si antécédents hématologiques, forte dose ou traitement prolongé.',
      conditionTexte: 'si traitement prolongé (au-delà de 10 jours : cas spécifiques seulement), forte dose ou antécédents hématologiques',
      statut: 'verifiee_ia',
      sources: [S(RCP_IV, '§4.4', 'ne doit pas dépasser 10 jours', 'surveillance'), S(RCP_PO, '§4.4', 'paraphrase : NFS si antécédents hématologiques, forte dose ou traitement prolongé', 'surveillance')],
    },
    {
      // L'association nommée par le RCP IV (ciprofloxacine) déclenche l'ECG quand elle est co-prescrite dans la même option.
      id: 'metronidazole-qt-ciprofloxacine',
      type: 'interaction',
      categorie: 'conditionnelle',
      quoi: 'ECG (QT) : ciprofloxacine associée',
      quand: { ancre: 'avant_traitement', texte: 'Avant traitement puis selon le contexte' },
      pourquoi: 'Torsades de pointes rapportées en association à la ciprofloxacine (RCP IV §4.5).',
      conditionId: 'ciprofloxacine_associee',
      conditionTexte: 'si ciprofloxacine associée',
      statut: 'verifiee_ia',
      sources: [S(RCP_IV, '§4.5', 'amiodarone ou de ciprofloxacine', 'surveillance')],
    },
    {
      id: 'metronidazole-qt',
      type: 'interaction',
      categorie: 'conditionnelle',
      quoi: 'ECG (QT) si médicament allongeant le QT associé (dont amiodarone, ciprofloxacine)',
      quand: { ancre: 'avant_traitement', texte: 'Avant traitement puis selon le contexte' },
      pourquoi: 'Torsades de pointes rapportées en association à l\'amiodarone ou à la ciprofloxacine.',
      conditionId: 'qt_allongeant_associe',
      conditionTexte: 'si médicament allongeant le QT associé',
      statut: 'verifiee_ia',
      sources: [S(RCP_IV, '§4.5', 'amiodarone ou de ciprofloxacine', 'surveillance'), S(RCP_PO, '§4.5', 'médicaments allongeant le QT', 'surveillance')],
    },
    {
      id: 'metronidazole-inr',
      type: 'interaction',
      categorie: 'conditionnelle',
      quoi: 'INR rapproché sous antivitamine K',
      quand: { ancre: 'debut_traitement', texte: 'Pendant le traitement et après son arrêt (fréquence non chiffrée par le RCP)' },
      pourquoi: 'Potentialisation des coumariniques (warfarine).',
      conduite: 'Un ajustement de la dose de l\'anticoagulant peut être nécessaire (RCP IV).',
      // RCP IV §4.5 : coumariniques seulement (pas les anticoagulants oraux directs).
      conditionId: 'avk_associe',
      conditionTexte: 'si antivitamine K associé',
      statut: 'verifiee_ia',
      sources: [S(RCP_IV, '§4.5', 'Un ajustement de la dose de l\'anticoagulant peut s\'avérer nécessaire', 'surveillance')],
    },
  ],
  grossesse: {
    // Statut structuré « eviter » : choisi pour que le moteur AFFICHE le texte de divergence (posologie.ts n'avertit que
    // pour « eviter » ou « contre_indique ») ; il ne tranche pas entre les sources, dont les trois positions sont citées.
    statut: 'eviter',
    texte:
      'Divergence non tranchée : RCP IV (B. Braun) — au 1er trimestre, seulement pour une infection grave menaçant le pronostic vital sans alternative plus sûre ; allaitement interrompu. RCP oral (Flagyl) — utilisable pendant la grossesse si besoin. CRAT — utilisation possible quel que soit le terme ; allaitement envisageable ≤ 14 jours.',
    sources: [
      S(RCP_IV, '§4.6', 'uniquement pour traiter des infections graves menaçant le pronostic vital, si aucune autre alternative plus sûre n\'est possible', 'autre'),
      S(RCP_PO, '§4.6', 'le métronidazole peut être prescrit pendant la grossesse si besoin', 'autre'),
      S('CRAT-metronidazole-grossesse', 'grossesse', 'L\'utilisation du métronidazole est possible quel que soit le terme de la grossesse.', 'autre'),
      S('CRAT-metronidazole-grossesse', 'allaitement', 'envisageable pour une durée limitée (≤ 14 jours)', 'autre'),
    ],
  },
  interactionsPertinentes: [
    { avec: 'avk', texte: 'Potentialisation des coumariniques : INR rapproché, ajustement de l\'anticoagulant si nécessaire.', sources: [S(RCP_IV, '§4.5', 'Un ajustement de la dose de l\'anticoagulant peut s\'avérer nécessaire', 'surveillance')] },
    { avec: 'qt_allongeant', texte: 'Médicaments allongeant le QT : association déconseillée (RCP oral) ; torsades rapportées avec l\'amiodarone et la ciprofloxacine (RCP IV) : surveiller le QT.', sources: [S(RCP_PO, '§4.5', 'médicaments allongeant le QT', 'surveillance'), S(RCP_IV, '§4.5', 'amiodarone ou de ciprofloxacine', 'surveillance')] },
    { avec: 'immunosuppresseur_calcineurine', texte: 'Ciclosporine, tacrolimus : surveillance des taux.', sources: [S(RCP_IV, '§4.5', 'paraphrase : ciclosporine, tacrolimus (surveillance des taux)', 'surveillance')] },
    { avec: 'antiepileptique', texte: 'Phénytoïne, carbamazépine : interaction signalée par le RCP IV ; inducteurs enzymatiques : précaution (RCP oral).', sources: [S(RCP_IV, '§4.5', 'paraphrase : lithium, phénytoïne, carbamazépine, fluorouracile, mycophénolate', 'surveillance'), S(RCP_PO, '§4.5', 'paraphrase : précautions : inducteurs enzymatiques', 'surveillance')] },
  ],
};
