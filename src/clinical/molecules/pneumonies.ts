/**
 * Molécules des pneumonies : macrolides (spiramycine, clarithromycine, azithromycine) et linézolide.
 * RCP lus le 2026-11-06 (base de données publique des médicaments) et CRAT : docs/sources/recherche-pneumonies.md §12.
 * Hors AMM signalés par la note : clarithromycine IV (AMM limitée aux mycobactéries atypiques), azithromycine dans
 * la pneumonie (absente des indications du RCP ZITHROMAX 250 mg) ; azithromycine IV non disponible en France.
 */
import type { Molecule } from '../types';
import { S } from './base';

const SP = 'SPILF-SPLF-2025-PAC';
const HAS = 'HAS-2025-PAC-adulte-ambulatoire';
const LEG = 'SPILF-2026-legionellose-diapo';

/* ------------------------------------------------------------------ */
export const spiramycine: Molecule = {
  id: 'spiramycine',
  dci: 'Spiramycine',
  famille: 'macrolide',
  statut: 'verifiee_ia',
  regimens: [
    {
      id: 'spiramycine-po-3mui-x3',
      libelle: '3 MUI toutes les 8 h per os',
      indication: 'PAC à bactérie atypique ou échec d\'une bêta-lactamine à 72 h (HAS 2025) ; légionellose non grave (alternative, SPILF 2026).',
      dose: { type: 'fixe', valeur: 3, unite: 'MUI', frequenceParJour: 3, texte: '3 MUI × 3/24 h (HAS 2025) — SPILF 2025 (hors soins critiques) : 1,5 à 3 MUI × 3/j ; RCP : 6 à 9 MUI/24 h' },
      voie: 'PO',
      modalites: 'comprimés à 3 MUI, en 2 à 3 prises par jour (RCP)',
      statut: 'verifiee_ia',
      sources: [
        S(HAS, 'atypique ou échec à 72 h', 'spiramycine : 3 MUI 3 fois par jour', 'posologie'),
        S(SP, 'tableau 10, p. 8', '1,5 MUI à 3 MUI x 3/j', 'posologie'),
        S('RCP-spiramycine', '§4.2', '6 à 9 MILLIONS d\'U.I./24 heures, soit 2 à 3 comprimés par jour en 2 à 3 prises', 'posologie'),
      ],
    },
    {
      id: 'spiramycine-iv-1-5mui-x3',
      libelle: '1,5 MUI toutes les 8 h IV',
      indication: 'Pneumonie hospitalisée non grave à bactérie atypique ou légionellose quand la voie orale est impossible (RCP IV : « Pneumopathies aigües »).',
      dose: { type: 'fixe', valeur: 1.5, unite: 'MUI', frequenceParJour: 3 },
      voie: 'IV',
      modalites: 'perfusion lente d\'une heure dans au moins 100 mL de glucose à 5 % (RCP)',
      statut: 'verifiee_ia',
      sources: [
        S('RCP-spiramycine-IV', '§4.2', '1,5 M U.I. toutes les 8 heures (soit 4,5 M U.I. par jour) en perfusion lente', 'posologie'),
        S(SP, 'tableau 10, p. 8', '1,5 MUI à 3 MUI x 3/j', 'posologie'),
      ],
    },
    {
      id: 'spiramycine-iv-3mui-x3',
      libelle: '3 MUI toutes les 8 h IV (soins critiques, forme grave)',
      indication: 'PAC grave (macrolide associé à la C3G) et légionellose grave (alternative) : SPILF 2025 tableau 10 et SPILF 2026 (soins critiques).',
      dose: { type: 'fixe', valeur: 3, unite: 'MUI', frequenceParJour: 3 },
      voie: 'IV',
      modalites: 'perfusion lente d\'une heure dans au moins 100 mL de glucose à 5 % (RCP)',
      statut: 'verifiee_ia',
      sources: [
        S(SP, 'tableau 10, p. 8 (soins critiques)', '3 MUI x 3/j', 'posologie'),
        S(LEG, 'diapo 9 (soins critiques)', '3 MUI x 3/j', 'posologie'),
        S('RCP-spiramycine-IV', '§4.2', 'En cas d\'infection sévère, la posologie peut être doublée', 'posologie'),
      ],
    },
  ],
  adaptationRenale: {
    methode: 'non_precisee',
    statut: 'verifiee_ia',
    paliers: [{ texte: 'Pas d\'adaptation (RCP oral et IV : aucun ajustement chez l\'insuffisant rénal).', sources: [S('RCP-spiramycine', '§4.2', 'Chez le sujet insuffisant rénal : Aucun ajustement posologique n\'est nécessaire', 'adaptation_renale')] }],
  },
  surveillance: [
    {
      id: 'spiramycine-qt',
      type: 'interaction',
      categorie: 'conditionnelle',
      quoi: 'ECG (QT) et kaliémie avant la forme IV ; vérifier l\'absence de médicament donnant des torsades de pointes (contre-indiqués avec la forme IV, dont lévofloxacine et moxifloxacine)',
      quand: { ancre: 'avant_traitement', texte: 'Avant la première perfusion' },
      pourquoi: 'La spiramycine IV fait partie des médicaments donnant des torsades de pointes ; contre-indiquée chez les sujets à risque de QT long (RCP IV).',
      conditionTexte: 'surtout pour la forme IV, ou si facteur de risque de QT long',
      statut: 'verifiee_ia',
      sources: [
        S('RCP-spiramycine-IV', '§4.4', 'La spiramycine par voie IV fait partie des médicaments donnant des torsades de pointes', 'surveillance'),
        S('RCP-spiramycine-IV', '§4.3', 'Chez les sujets à risque de « QT long »', 'surveillance'),
      ],
    },
    {
      id: 'spiramycine-cutane-g6pd',
      type: 'clinique',
      categorie: 'systematique',
      quoi: 'Surveillance cutanée (SJS, Lyell, PEAG : arrêt et contre-indication définitive) ; éviter en cas de déficit connu en G6PD',
      quand: { ancre: 'quotidien', texte: 'Pendant le traitement' },
      pourquoi: 'Réactions cutanées graves ; anémie hémolytique sur déficit en G6PD.',
      statut: 'verifiee_ia',
      sources: [S('RCP-spiramycine', '§4.4', 'De très rares cas d\'anémie hémolytique […] déficit en Glucose-6-Phosphate-Déshydrogénase, l\'utilisation de la spiramycine dans cette population de patients n\'est pas recommandée', 'surveillance')],
    },
  ],
  grossesse: {
    statut: 'utilisable',
    texte: 'Utilisable quel que soit le terme (CRAT) ; « peut être envisagée au cours de la grossesse si besoin » (RCP). Allaitement déconseillé (RCP).',
    sources: [S('CRAT-spiramycine-grossesse', 'En pratique', 'L\'utilisation de la spiramycine est possible quel que soit le terme de la grossesse.', 'autre'), S('RCP-spiramycine', '§4.6', 'L\'utilisation de la spiramycine peut être envisagée au cours de la grossesse si besoin', 'autre')],
  },
  interactionsPertinentes: [
    { avec: 'qt_allongeant', texte: 'Forme IV : association contre-indiquée avec les médicaments donnant des torsades de pointes (dont lévofloxacine, moxifloxacine, citalopram, dompéridone, amiodarone, sotalol) ; forme orale : précaution d\'emploi.', sources: [S('RCP-spiramycine-IV', '§4.3', 'En association avec les médicaments donnant des torsades de pointes', 'surveillance')] },
    { avec: 'avk', texte: 'Augmentation de l\'effet des anticoagulants oraux : contrôle de l\'INR.', sources: [S('RCP-spiramycine', '§4.5', 'De nombreux cas d\'augmentation de l\'activité des anticoagulants oraux ont été rapportés', 'surveillance')] },
  ],
};

/* ------------------------------------------------------------------ */
export const clarithromycine: Molecule = {
  id: 'clarithromycine',
  dci: 'Clarithromycine',
  famille: 'macrolide',
  statut: 'verifiee_ia',
  regimens: [
    {
      id: 'clarithromycine-po-500x2',
      libelle: '500 mg toutes les 12 h per os',
      indication: 'PAC à bactérie atypique ou échec d\'une bêta-lactamine à 72 h (HAS 2025, SPILF 2025) ; M. pneumoniae (HAS 2023) ; légionellose (alternative, SPILF 2026).',
      dose: { type: 'fixe', valeur: 500, unite: 'mg', frequenceParJour: 2 },
      voie: 'PO',
      modalites: 'per os toutes les 12 h',
      statut: 'verifiee_ia',
      sources: [
        S('RCP-clarithromycine', '§4.2', 'Sinusites aiguës, exacerbations des bronchites chroniques, pneumopathies communautaires : 1000 mg/jour en deux prises par jour', 'posologie'),
        S(HAS, 'atypique ou échec à 72 h', 'clarithromycine : 500 mg 2 fois par jour', 'posologie'),
        S(SP, 'tableau 10, p. 8', '500 mg x 2/j', 'posologie'),
      ],
    },
    {
      id: 'clarithromycine-iv-500x2',
      libelle: '500 mg toutes les 12 h IV — hors AMM dans la pneumonie',
      indication: 'PAC grave (macrolide associé à la C3G) et légionellose grave (alternative) : recommandée par la SPILF 2025/2026, mais l\'AMM de la forme IV se limite aux mycobactéries atypiques du SIDA.',
      dose: { type: 'fixe', valeur: 500, unite: 'mg', frequenceParJour: 2 },
      voie: 'IV',
      modalites: 'perfusion de 60 minutes toutes les 12 h ; ni bolus ni IM (RCP IV)',
      // Hors AMM : la seule indication du RCP IV est « Infections à mycobactéries atypiques chez les patients atteints de SIDA ».
      statut: 'brouillon',
      sources: [
        S('RCP-clarithromycine-IV', '§4.2', '500 mg deux fois par jour à 12 heures d\'intervalle', 'posologie'),
        S('RCP-clarithromycine-IV', '§4.1', 'Infections à mycobactéries atypiques chez les patients atteints de SIDA, quand la voie orale est impossible', 'choix'),
        S(SP, 'tableau 10, p. 8 (soins critiques)', '500 mg x 2/j', 'posologie'),
        S(LEG, 'diapo 9 (soins critiques)', '500 mg x 2/j', 'posologie'),
      ],
      remarques: 'Hors AMM : recommandée par la SPILF dans la PAC grave et la légionellose grave.',
    },
  ],
  adaptationRenale: {
    methode: 'non_precisee',
    statut: 'verifiee_ia',
    texteGeneral: 'RCP oral : phrase sur la clairance tronquée sur la BDPM (non lisible) ; §4.4 : réduction imposée si ClCr < 30 mL/min. RCP IV : dose diminuée de moitié si clairance < 30 mL/min.',
    paliers: [
      { clcrMin: 30, texte: 'ClCr ≥ 30 mL/min : pas d\'adaptation (seuil de réduction des RCP : 30 mL/min).', sources: [S('RCP-clarithromycine-IV', '§4.2', 'clairance inférieure à 30 ml/minute, la dose administrée doit être diminuée de moitié', 'adaptation_renale')] },
      {
        clcrMax: 30,
        texte: 'ClCr < 30 mL/min : forme IV, dose diminuée de moitié ; forme orale, réduction imposée par le RCP mais chiffre non lisible sur la BDPM (avis pharmaceutique).',
        sources: [S('RCP-clarithromycine-IV', '§4.2', 'clairance inférieure à 30 ml/minute, la dose administrée doit être diminuée de moitié', 'adaptation_renale'), S('RCP-clarithromycine', '§4.4', 'l\'allongement de la demi-vie impose une réduction de la posologie', 'adaptation_renale')],
      },
    ],
  },
  insuffisanceHepatique: {
    texte: 'Ne pas dépasser 500 mg deux fois par jour ; contre-indiquée en cas d\'insuffisance hépatique sévère associée à une insuffisance rénale ; hépatotoxicité (cas d\'insuffisance hépatique fatale).',
    sources: [S('RCP-clarithromycine', '§4.2', 'la dose de 500 mg deux fois par jour ne doit pas être dépassée', 'adaptation_renale'), S('RCP-clarithromycine', '§4.3', 'insuffisance hépatique sévère en association avec une insuffisance rénale', 'adaptation_renale')],
  },
  surveillance: [
    {
      id: 'clarithromycine-ci-associations',
      type: 'interaction',
      categorie: 'systematique',
      quoi: 'Vérifier les associations contre-indiquées (colchicine, simvastatine, dérivés de l\'ergot, pimozide, mizolastine, ticagrélor, ivabradine, dompéridone, quétiapine, ranolazine), le QT et la kaliémie/magnésémie',
      quand: { ancre: 'avant_traitement', texte: 'Avant la première dose' },
      pourquoi: 'Contre-indiquée en cas d\'allongement congénital ou acquis du QT et de déséquilibre électrolytique (hypokaliémie, hypomagnésémie).',
      statut: 'verifiee_ia',
      sources: [
        S('RCP-clarithromycine', '§4.3', 'Allongement congénital ou acquis de l\'intervalle QT', 'surveillance'),
        S('RCP-clarithromycine', '§4.3', 'ne doit pas être administrée à des patients présentant des déséquilibres électrolytiques (hypokaliémie ou hypomagnésémie)', 'surveillance'),
      ],
    },
    {
      id: 'clarithromycine-foie',
      type: 'clinique',
      categorie: 'systematique',
      quoi: 'Signes d\'atteinte hépatique (ictère, anorexie, urines foncées) : arrêt',
      quand: { ancre: 'quotidien', texte: 'Pendant le traitement' },
      pourquoi: 'Hépatotoxicité.',
      statut: 'verifiee_ia',
      sources: [S('RCP-clarithromycine', '§4.4', 'Des cas d\'insuffisance hépatique fatale ont été rapportés', 'surveillance')],
    },
  ],
  grossesse: {
    statut: 'eviter',
    texte: 'Divergence non tranchée : RCP, « pas recommandée sans avoir soigneusement évalué les bénéfices par rapport aux risques » ; CRAT, utilisation possible quel que soit le terme.',
    sources: [
      S('RCP-clarithromycine', '§4.6', 'l\'utilisation pendant la grossesse n\'est pas recommandée sans avoir soigneusement évalué les bénéfices par rapport aux risques', 'autre'),
      S('CRAT-clarithromycine-grossesse', 'En pratique', 'L\'utilisation de la clarithromycine est possible quel que soit le terme de la grossesse.', 'autre'),
    ],
  },
  interactionsPertinentes: [
    { avec: 'statine', texte: 'Simvastatine contre-indiquée ; atorvastatine à éviter dans la mesure du possible.', sources: [S('RCP-clarithromycine', '§4.3', 'la simvastatine', 'surveillance'), S('RCP-clarithromycine', '§4.4', 'atorvastatine « doit être évitée dans la mesure du possible »', 'surveillance')] },
    { avec: 'avk', texte: 'Augmentation de l\'effet des AVK : contrôle plus fréquent de l\'INR.', sources: [S('RCP-clarithromycine', '§4.4', 'L\'INR et le taux de prothrombine doivent être surveillés fréquemment', 'surveillance')] },
    { avec: 'aod', texte: 'Rivaroxaban : association déconseillée ; autres AOD : précautions.', sources: [S('RCP-clarithromycine', '§4.5', '« + Rivaroxaban » (déconseillée)', 'surveillance')] },
    { avec: 'qt_allongeant', texte: 'Allongement du QT : contre-indication en cas de QT long ; prudence avec les médicaments allongeant le QT.', sources: [S('RCP-clarithromycine', '§4.3', 'Allongement congénital ou acquis de l\'intervalle QT', 'surveillance')] },
  ],
};

/* ------------------------------------------------------------------ */
export const azithromycine: Molecule = {
  id: 'azithromycine',
  dci: 'Azithromycine',
  famille: 'macrolide',
  statut: 'verifiee_ia',
  regimens: [
    {
      id: 'azithromycine-po-500-250',
      libelle: '500 mg à J1 puis 250 mg/j per os — hors AMM dans la pneumonie',
      indication: 'PAC à bactérie atypique (HAS 2025, SPILF 2025) ; M. pneumoniae (HAS 2023 : J1 à J5). La pneumonie ne figure pas dans les indications du RCP ZITHROMAX 250 mg.',
      dose: { type: 'fixe', valeur: 250, unite: 'mg', frequenceParJour: 1, texte: '500 mg en une prise à J1, puis 250 mg/j' },
      voie: 'PO',
      modalites: 'une prise par jour',
      statut: 'verifiee_ia',
      sources: [
        S(HAS, 'atypique ou échec à 72 h', 'azithromycine : 500 mg par jour en une prise à J1 puis 250 mg par jour', 'posologie'),
        S(SP, 'tableau 10, p. 8', '500 mg/j (J1) puis 250 mg/j', 'posologie'),
        S('RCP-azithromycine', '§4.2', '500 mg le jour 1, puis 250 mg/jour du jour 2 au jour 5', 'posologie'),
      ],
      remarques: 'Hors AMM dans la pneumonie (RCP ZITHROMAX 250 mg) ; azithromycine IV non disponible en France.',
    },
    {
      id: 'azithromycine-po-500',
      libelle: '500 mg/j per os — légionellose non grave (hors AMM)',
      indication: 'Légionellose non grave : 1re intention (SPILF 2026), 3 jours chez l\'immunocompétent.',
      dose: { type: 'fixe', valeur: 500, unite: 'mg', frequenceParJour: 1 },
      voie: 'PO',
      modalites: 'une prise par jour',
      statut: 'verifiee_ia',
      sources: [S(LEG, 'diapo 9 (hors soins critiques)', '500 mg/j', 'posologie'), S('RCP-azithromycine', '§4.2', '500 mg/jour pendant 3 jours', 'posologie')],
      remarques: 'Hors AMM dans la légionellose (la pneumonie ne figure pas dans les indications du RCP ZITHROMAX 250 mg).',
    },
  ],
  adaptationRenale: {
    methode: 'non_precisee',
    statut: 'verifiee_ia',
    paliers: [
      { clcrMin: 10, texte: 'DFG ≥ 10 mL/min : pas d\'adaptation.', sources: [S('RCP-azithromycine', '§4.2', 'Aucune adaptation posologique n\'est nécessaire chez les patients présentant un DFG ≥ 10 mL/min', 'adaptation_renale')] },
      { clcrMax: 10, texte: 'DFG < 10 mL/min : phrase du RCP tronquée sur la BDPM ; exposition augmentée (Cmax + 61 %, ASC + 35 %) : prudence, avis pharmaceutique.', sources: [S('RCP-azithromycine', '§5.2', 'La C max et l\'ASC 0-120 moyennes étaient augmentées de 61 % et 35 %', 'adaptation_renale')] },
    ],
    hemodialyse: { texte: 'Élimination par la dialyse peu probable (RCP §5.2) : schéma du DFG < 10 mL/min, prudence.', sources: [S('RCP-azithromycine', '§5.2', 'il est peu probable que la dialyse entraîne une élimination significative', 'adaptation_renale')] },
  },
  surveillance: [
    {
      id: 'azithromycine-qt-foie',
      type: 'clinique',
      categorie: 'systematique',
      quoi: 'QT (femme, sujet âgé, hypokaliémie, bradycardie, insuffisance cardiaque sévère) et signes d\'hépatite ; aggravation d\'une myasthénie',
      quand: { ancre: 'avant_traitement', texte: 'Avant la première dose, puis pendant le traitement' },
      pourquoi: 'Allongement du QT ; hépatite fulminante rapportée ; myasthénie.',
      statut: 'verifiee_ia',
      sources: [S('RCP-azithromycine', '§4.4', 'hépatite fulminante', 'surveillance')],
    },
  ],
  grossesse: {
    statut: 'eviter',
    texte: 'Divergence non tranchée : RCP, seulement « en cas de nécessité clinique » ; CRAT, utilisation possible quel que soit le terme.',
    sources: [
      S('RCP-azithromycine', '§4.6', 'L\'azithromycine ne doit être utilisée pendant la grossesse qu\'en cas de nécessité clinique.', 'autre'),
      S('CRAT-azithromycine-grossesse', 'En pratique', 'L\'utilisation de l\'azithromycine est possible quel que soit le terme de la grossesse.', 'autre'),
    ],
  },
  interactionsPertinentes: [
    { avec: 'qt_allongeant', texte: 'Allongement du QT, notamment avec les fluoroquinolones (moxifloxacine, lévofloxacine) et l\'hydroxychloroquine.', sources: [S('RCP-azithromycine', '§4.5', 'fluoroquinolones (par exemple, moxifloxacine et lévofloxacine)', 'surveillance')] },
    { avec: 'statine', texte: 'Rhabdomyolyses rapportées avec les statines.', sources: [S('RCP-azithromycine', '§4.5', 'des cas de rhabdomyolyse ont été rapportés', 'surveillance')] },
    { avec: 'avk', texte: 'Warfarine : contrôles plus fréquents du temps de prothrombine.', sources: [S('RCP-azithromycine', '§4.5', 'Une augmentation de la fréquence des contrôles du temps de prothrombine doit être envisagée', 'surveillance')] },
    { avec: 'aod', texte: 'Dabigatran (P-gp) : risque accru d\'hémorragie.', sources: [S('RCP-azithromycine', '§4.5', 'risque accru d\'hémorragie', 'surveillance')] },
  ],
};

/* ------------------------------------------------------------------ */
export const linezolide: Molecule = {
  id: 'linezolide',
  dci: 'Linézolide',
  famille: 'oxazolidinone',
  statut: 'verifiee_ia',
  regimens: [
    {
      id: 'linezolide-600x2',
      libelle: '600 mg toutes les 12 h (IV ou per os)',
      indication: 'Pneumonie communautaire ou nosocomiale documentée ou suspectée à Gram positif (RCP) : PAC grave évocatrice de S. aureus producteur de LPV (SPILF 2025), pneumonie d\'inhalation grave chez un patient colonisé à SARM (SPILF/SFGG 2025), PAVM avec facteur de risque de SARM (SFAR/SRLF 2017).',
      dose: { type: 'fixe', valeur: 600, unite: 'mg', frequenceParJour: 2 },
      voie: 'IV ou PO',
      modalites: 'perfusion de 30 à 120 minutes, ou per os (biodisponibilité voisine de 100 %) ; à débuter uniquement à l\'hôpital, après avis d\'un spécialiste',
      statut: 'verifiee_ia',
      sources: [
        S('RCP-linezolide', '§4.2', 'Pneumonie nosocomiale : 600 mg par voie orale deux fois par jour, 10-14 jours consécutifs', 'posologie'),
        S(SP, 'tableau 10, p. 8', '600 mg x 2/j', 'posologie'),
        S('RCP-linezolide', '§4.1', 'Un traitement par le linézolide devra être débuté uniquement en milieu hospitalier et après avis d\'un spécialiste tel qu\'un microbiologiste ou un infectiologue', 'choix'),
      ],
      remarques: 'Durée maximale de traitement : 28 jours (RCP). Inactif sur les bactéries à Gram négatif.',
    },
  ],
  adaptationRenale: {
    methode: 'non_precisee',
    statut: 'verifiee_ia',
    texteGeneral: 'Insuffisance rénale sévère : prudence (métabolites accumulés jusqu\'à 10 fois) ; surveillance hématologique étroite.',
    paliers: [{ texte: 'Pas d\'adaptation (RCP) ; insuffisance rénale sévère : prudence et surveillance hématologique étroite.', sources: [S('RCP-linezolide', '§4.2', 'Insuffisance rénale : Aucun ajustement posologique n\'est nécessaire', 'adaptation_renale')] }],
    hemodialyse: { texte: 'Administrer après la séance de dialyse.', sources: [S('RCP-linezolide', '§4.2', 'il devra être administré après dialyse', 'adaptation_renale')] },
  },
  surveillance: [
    {
      id: 'linezolide-nfs',
      type: 'biologique',
      categorie: 'systematique',
      quoi: 'Numération sanguine complète (hémoglobine, plaquettes, leucocytes)',
      quand: { ancre: 'hebdomadaire', texte: 'Une fois par semaine pendant le traitement', repetition: 'hebdomadaire' },
      pourquoi: 'Myélosuppression (anémie, thrombopénie, leucopénie) ; surveillance plus étroite en cas d\'insuffisance rénale sévère ou de traitement > 10-14 jours.',
      statut: 'verifiee_ia',
      sources: [S('RCP-linezolide', '§4.4', 'surveiller une fois par semaine la numération sanguine complète […] quelle que soit la numération initiale', 'surveillance')],
    },
    {
      id: 'linezolide-vasopresseurs',
      type: 'interaction',
      categorie: 'conditionnelle',
      quoi: 'Surveillance étroite de la pression artérielle',
      quand: { ancre: 'quotidien', texte: 'Pendant toute l\'association' },
      pourquoi: 'Contre-indiqué, sauf surveillance étroite de la pression artérielle, avec les vasopresseurs (adrénaline, noradrénaline), la dopamine, la dobutamine, les ISRS, les tricycliques, les triptans, en cas d\'HTA non contrôlée ou d\'état confusionnel aigu ; IMAO contre-indiqués.',
      conditionTexte: 'si vasopresseur, dopamine, dobutamine ou sérotoninergique associé',
      statut: 'verifiee_ia',
      sources: [S('RCP-linezolide', '§4.3', 'les vasopresseurs (par exemple : l\'adrénaline, la noradrénaline)', 'surveillance'), S('RCP-linezolide', '§4.3', 'la dopamine, la dobutamine', 'surveillance')],
    },
    {
      id: 'linezolide-natremie-neuro',
      type: 'clinique',
      categorie: 'conditionnelle',
      quoi: 'Natrémie (sujet âgé) ; troubles visuels et neuropathie (surtout au-delà de 28 jours) ; acidose lactique ; syndrome sérotoninergique',
      quand: { ancre: 'non_determine', texte: 'Pendant le traitement (fréquence non chiffrée par le RCP)' },
      pourquoi: 'Hyponatrémie/SIADH, neuropathie optique et périphérique, acidose lactique.',
      conditionId: 'sujet_age',
      conditionTexte: 'natrémie chez le sujet âgé',
      statut: 'verifiee_ia',
      sources: [S('RCP-linezolide', '§4.4', 'hyponatrémie/SIADH (natrémie chez le sujet âgé)', 'surveillance')],
    },
  ],
  grossesse: {
    statut: 'eviter',
    texte: 'Ne pas administrer pendant la grossesse sauf nécessité absolue (RCP) ; fiche CRAT non trouvée. Allaitement à interrompre.',
    sources: [S('RCP-linezolide', '§4.6', 'Le linézolide ne doit pas être administré lors de la grossesse sauf si cela est absolument nécessaire', 'autre')],
  },
  interactionsPertinentes: [
    { avec: 'serotoninergique', texte: 'ISRS, tricycliques, triptans : contre-indiqués sauf surveillance étroite (syndrome sérotoninergique, pression artérielle) ; IMAO contre-indiqués.', sources: [S('RCP-linezolide', '§4.3', 'ISRS, tricycliques, triptans', 'surveillance')] },
  ],
};
