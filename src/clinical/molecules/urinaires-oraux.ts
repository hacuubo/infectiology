/**
 * Antibiotiques oraux de la cystite et des colonisations urinaires (gravidique, avant geste urologique).
 * RCP lus le 2026-11-06 (base de données publique des médicaments) et CRAT : docs/sources/recherche-cystite.md §8.
 * Indications de l'AMM : femme (et adolescente) ; tout usage chez l'homme est hors AMM (RCP).
 */
import type { Molecule } from '../types';
import { S } from './base';

export const fosfomycineTrometamol: Molecule = {
  id: 'fosfomycine_trometamol',
  dci: 'Fosfomycine-trométamol',
  famille: 'autre',
  statut: 'verifiee_ia',
  regimens: [
    {
      id: 'fosfo-3g-du',
      libelle: '3 g per os en prise unique',
      indication: 'Cystite simple (1re intention), cystite gravidique (1re intention), colonisation gravidique.',
      dose: { type: 'fixe', valeur: 3, unite: 'g', texte: '3 g en prise unique' },
      voie: 'PO',
      modalites: 'à jeun (environ 2 à 3 h avant ou après un repas), de préférence au coucher, après avoir vidé la vessie',
      statut: 'verifiee_ia',
      sources: [
        S('RCP-fosfomycine-trometamol', '§4.2', 'Cystite aiguë non compliquée chez les femmes adultes et adolescentes (> 12 ans) : administration unique de 3 g de fosfomycine.', 'posologie'),
        S('HAS-2021-cystite-femme', 'cystite simple', '1 re intention : fosfomycine-trométamol, 3 g en prise unique', 'posologie'),
      ],
    },
    {
      id: 'fosfo-3g-j1j3j5',
      libelle: '3 g per os à J1, J3 et J5 (hors AMM)',
      indication: 'Cystite à risque de complication ne pouvant être différée (2e intention HAS) ; cystite de l\'homme (SPILF 2026).',
      dose: { type: 'fixe', valeur: 3, unite: 'g', texte: '3 g à J1, J3 et J5 (3 prises espacées de 48 h)' },
      voie: 'PO',
      modalites: 'à jeun, de préférence au coucher ; schéma hors AMM (SPILF 2018)',
      statut: 'verifiee_ia',
      sources: [
        S('HAS-2021-cystite-femme', 'cystite à risque, traitement ne pouvant être différé', '2 e intention : fosfomycine-trométamol : 3 g à J1, J3 et J5', 'posologie'),
        S('SPILF-2018-IU-Caron', 'p. 346', 'le schéma à 3 doses reste actuellement hors AMM', 'posologie'),
      ],
    },
  ],
  adaptationRenale: {
    methode: 'non_precisee',
    statut: 'verifiee_ia',
    paliers: [
      { clcrMin: 10, texte: 'ClCr ≥ 10 mL/min : pas d\'adaptation (concentrations urinaires efficaces 48 h).', sources: [S('RCP-fosfomycine-trometamol', '§5.2', 'efficaces pendant 48 heures après une dose habituelle si la clairance de la créatinine est supérieure à 10 ml/min', 'adaptation_renale')] },
      { clcrMax: 10, texte: 'ClCr < 10 mL/min : non recommandée.', sources: [S('RCP-fosfomycine-trometamol', '§4.2', 'n\'est pas recommandée chez les patients présentant une insuffisance rénale (clairance de la créatinine < 10 ml/min', 'adaptation_renale')] },
    ],
  },
  surveillance: [],
  grossesse: {
    statut: 'utilisable',
    texte: 'Traitement monodose possible quel que soit le terme (CRAT) ; 1re intention de la cystite gravidique (HAS).',
    sources: [S('CRAT-fosfomycine-grossesse', 'cystite gravidique', 'Un traitement monodose par fosfomycine est possible quel que soit le terme de la grossesse.', 'autre')],
  },
};

export const pivmecillinam: Molecule = {
  id: 'pivmecillinam',
  dci: 'Pivmécillinam',
  famille: 'penicilline',
  statut: 'verifiee_ia',
  regimens: [
    {
      id: 'pivmecillinam-400x2',
      libelle: '400 mg toutes les 12 h per os',
      indication: 'Cystite simple (2e intention), cystite à risque différée, cystite et colonisation gravidiques.',
      dose: { type: 'fixe', valeur: 400, unite: 'mg', frequenceParJour: 2 },
      voie: 'PO',
      modalites: 'au milieu d\'un repas, avec un grand verre d\'eau ; ne pas s\'allonger dans les 30 minutes suivantes',
      statut: 'verifiee_ia',
      sources: [
        S('RCP-pivmecillinam', '§4.2 (tableau)', 'Cystites aiguës non compliquées : 400 mg x 2/jour pendant 5 jours', 'posologie'),
        S('HAS-2021-cystite-femme', 'cystite à risque, différé', 'pivmécillinam : 400 mg 2 fois par jour pendant 7 jours', 'posologie'),
      ],
    },
  ],
  adaptationRenale: {
    methode: 'non_precisee',
    texteGeneral: 'Modalités d\'adaptation optimales non établies (RCP).',
    statut: 'verifiee_ia',
    paliers: [
      { clcrMin: 30, texte: 'Filtration glomérulaire ≥ 30 mL/min : pas d\'adaptation.', sources: [S('RCP-pivmecillinam', '§4.2', 'Quand la filtration glomérulaire est comprise entre 15 et 30 ml/min, diviser la posologie par deux.', 'adaptation_renale')] },
      { clcrMin: 15, clcrMax: 30, texte: 'Filtration glomérulaire 15-30 mL/min : diviser la posologie par deux.', sources: [S('RCP-pivmecillinam', '§4.2', 'Quand la filtration glomérulaire est comprise entre 15 et 30 ml/min, diviser la posologie par deux.', 'adaptation_renale')] },
      { clcrMax: 15, texte: 'Filtration glomérulaire < 15 mL/min : diviser la posologie par trois.', sources: [S('RCP-pivmecillinam', '§4.2', 'Quand la filtration glomérulaire est inférieure à 15 ml/min, diviser la posologie par trois.', 'adaptation_renale')] },
    ],
  },
  surveillance: [],
  grossesse: {
    statut: 'utilisable',
    texte: 'Plus de 1 000 grossesses sans effet malformatif (RCP) ; 2e intention de la cystite gravidique (HAS).',
    sources: [S('RCP-pivmecillinam', '§4.6', 'peut être utilisé pendant la grossesse si nécessaire', 'autre'), S('CRAT-pivmecillinam-grossesse', 'cystite gravidique', 'aucun effet malformatif, foetal ou néonatal attribuable au traitement n\'est retenu à ce jour', 'autre')],
  },
  interactionsPertinentes: [
    { avec: 'methotrexate', texte: 'Association déconseillée : toxicité hématologique du méthotrexate.', sources: [S('RCP-pivmecillinam', '§4.5', 'méthotrexate (« toxicité hématologique »)', 'surveillance')] },
    { avec: 'antiepileptique', texte: 'Acide valproïque / valproate : association déconseillée (déficit en carnitine).', sources: [S('RCP-pivmecillinam', '§4.5', 'acide valproïque/valproate (« déficit en carnitine »)', 'surveillance')] },
  ],
};

export const nitrofurantoine: Molecule = {
  id: 'nitrofurantoine',
  dci: 'Nitrofurantoïne',
  famille: 'autre',
  statut: 'verifiee_ia',
  regimens: [
    {
      id: 'nitrofurantoine-100x3',
      libelle: '100 mg toutes les 8 h per os',
      indication: 'Cystite à risque de complication (documentée, ou probabiliste si le traitement ne peut être différé), cystite gravidique en cas d\'échec, colonisation gravidique.',
      dose: { type: 'fixe', valeur: 100, unite: 'mg', frequenceParJour: 3 },
      voie: 'PO',
      modalites: 'au cours des repas ; jamais plus de 7 jours ; jamais en prophylaxie ni en traitement itératif',
      statut: 'verifiee_ia',
      sources: [
        S('RCP-nitrofurantoine', '§4.2', 'Femme adulte : 300 mg (6 gélules) par jour, en 3 prises journalières.', 'posologie'),
        S('HAS-2021-cystite-femme', 'cystite à risque', 'nitrofurantoïne : 100 mg 3 fois par jour pendant 7 jours', 'posologie'),
      ],
      remarques: 'Restrictions ANSM intégrées au RCP : cystite documentée de la femme ; probabiliste seulement en cas d\'urgence ; ≤ 7 jours.',
    },
  ],
  adaptationRenale: {
    methode: 'non_precisee',
    statut: 'verifiee_ia',
    paliers: [
      { clcrMin: 45, texte: 'ClCr ou DFG ≥ 45 mL/min : pas d\'adaptation.', sources: [S('RCP-nitrofurantoine', '§4.2', 'clairance de la créatinine < 45 ml/mn… la nitrofurantoïne est contre-indiquée', 'adaptation_renale')] },
      { clcrMax: 45, texte: 'ClCr ou DFG < 45 mL/min : contre-indiquée (RCP ; HAS : DFG < 45 ; SPILF : ClCr < 40).', sources: [S('RCP-nitrofurantoine', '§4.3', 'Insuffisance rénale (TFGe inférieur à 45 ml/min)', 'adaptation_renale'), S('HAS-2021-cystite-femme', 'nitrofurantoïne', 'contre-indication en cas d\'insuffisance rénale avec un débit de filtration glomérulaire < 45 ml/min ou de traitements itératifs', 'adaptation_renale')] },
    ],
  },
  surveillance: [
    {
      id: 'nitrofurantoine-poumon-foie',
      type: 'clinique',
      categorie: 'systematique',
      quoi: 'Signes respiratoires (toux, dyspnée) et hépatiques (nausées, ictère) : arrêt immédiat s\'ils apparaissent',
      quand: { ancre: 'quotidien', texte: 'Pendant tout le traitement', repetition: 'à chaque évaluation' },
      pourquoi: 'Atteintes pulmonaires (fibroses, pneumopathies interstitielles) et hépatiques pouvant conduire dans de rares cas à une issue fatale.',
      conduite: 'Arrêt immédiat ; réintroduction exceptionnelle. Interrogatoire préalable : antécédent d\'effet indésirable sous nitrofurantoïne, traitements itératifs.',
      statut: 'verifiee_ia',
      sources: [S('RCP-nitrofurantoine', '§4.4', 'atteintes pulmonaires (fibroses, pneumopathies interstitielles) […] hépatiques […] pouvant conduire dans de rares cas à une issue fatale', 'surveillance')],
    },
  ],
  grossesse: {
    statut: 'eviter',
    texte: 'Contre-indiquée en fin de grossesse (travail, accouchement : anémie hémolytique néonatale) ; ailleurs, seulement après avoir écarté les autres options (CRAT).',
    sources: [S('RCP-nitrofurantoine', '§4.3', 'fin de grossesse (pendant le travail et l\'accouchement)', 'autre'), S('CRAT-nitrofurantoine-grossesse', 'cystite gravidique', 'ne sera envisagée qu\'après avoir écarté les autres options disponibles', 'autre')],
  },
};

export const trimethoprime: Molecule = {
  id: 'trimethoprime',
  dci: 'Triméthoprime',
  famille: 'autre',
  statut: 'verifiee_ia',
  regimens: [
    {
      id: 'trimethoprime-300',
      libelle: '300 mg par jour per os en 1 prise',
      indication: 'Cystite gravidique en cas d\'échec (2e intention), colonisation gravidique (4e intention), cystite à risque documentée (SPILF 2018, 5e intention).',
      dose: { type: 'fixe', valeur: 300, unite: 'mg', frequenceParJour: 1 },
      voie: 'PO',
      modalites: 'en une prise quotidienne',
      statut: 'verifiee_ia',
      sources: [
        S('RCP-trimethoprime', '§4.2', 'Cystites aiguës non compliquées : 300 mg par jour, en une prise quotidienne, pendant 3 jours', 'posologie'),
        S('HAS-2021-femme-enceinte-IU', 'colonisation, 4e intention', 'triméthoprime : 300 mg par jour pendant 7 jours, à éviter avant 10 semaines d\'aménorrhée', 'posologie'),
      ],
    },
  ],
  adaptationRenale: {
    methode: 'non_precisee',
    texteGeneral: 'Schéma optimal en insuffisance rénale non établi (RCP) ; prudence et surveillance biologique.',
    statut: 'verifiee_ia',
    paliers: [
      { clcrMin: 15, texte: 'ClCr ≥ 15 mL/min : pas d\'adaptation chiffrée (schéma optimal non établi ; surveillance de la kaliémie).', sources: [S('RCP-trimethoprime', '§4.2', 'Le schéma d\'administration optimal chez le sujet normo-rénal et chez le sujet insuffisant rénal n\'est pas établi.', 'adaptation_renale')] },
      { clcrMax: 15, texte: 'ClCr < 15 mL/min : contre-indiqué.', sources: [S('RCP-trimethoprime', '§4.3', 'Insuffisance rénale sévère (clairance de la créatinine < 15mL/mn)', 'adaptation_renale')] },
    ],
  },
  surveillance: [
    {
      id: 'trimethoprime-kaliemie',
      type: 'biologique',
      categorie: 'conditionnelle',
      quoi: 'Kaliémie (insuffisant rénal, sujet âgé, hyperkaliémiants) ; contrôle hématologique (traitement itératif, > 65 ans, carence en folates)',
      quand: { ancre: 'avant_traitement', texte: 'Fréquence non chiffrée par le RCP', repetition: 'non précisée' },
      pourquoi: 'Hyperkaliémie ; leucopénie, agranulocytose, anémie mégaloblastique. Le triméthoprime peut élever la créatininémie sans baisse réelle du DFG.',
      conditionId: 'insuffisance_renale',
      conditionTexte: 'si insuffisance rénale, sujet âgé, hyperkaliémiants ou traitement itératif',
      statut: 'verifiee_ia',
      sources: [S('RCP-trimethoprime', '§4.4', 'Un contrôle hématologique est nécessaire en cas de : Traitement itératif ; Chez le sujet âgé de plus de 65 ans ; Et chez les sujets carencés en folates', 'surveillance')],
    },
  ],
  grossesse: {
    statut: 'contre_indique',
    texte: 'Contre-indiqué au 1er trimestre (RCP du 19/05/2026) ; à éviter aux 2e et 3e trimestres sauf nécessité clinique. HAS : à éviter avant 10 semaines d\'aménorrhée (divergence : le RCP, plus restrictif, est retenu).',
    sources: [S('RCP-trimethoprime', '§4.6', 'contre-indiqué pendant le premier trimestre de la grossesse', 'autre'), S('HAS-2021-femme-enceinte-IU', 'triméthoprime', 'à éviter avant 10 semaines d\'aménorrhée', 'autre')],
  },
  interactionsPertinentes: [
    { avec: 'methotrexate', texte: 'Contre-indiqué avec le méthotrexate.', sources: [S('RCP-trimethoprime', '§4.3', 'Association avec le méthotrexate', 'surveillance')] },
  ],
};
