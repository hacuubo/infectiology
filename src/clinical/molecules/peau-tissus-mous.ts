/**
 * Antibiotiques propres aux infections de la peau et des tissus mous : pristinamycine et clindamycine (orale et IV).
 * RCP lus le 2026-11-06 (base de données publique des médicaments) : docs/sources/recherche-peau-tissus-mous.md § 13.
 * Fiches CRAT non trouvées (§ 14) : la grossesse s'appuie sur le § 4.6 des RCP.
 * Molécules citées par les recommandations mais non intégrées (RCP non lu, ou intégration confiée à un autre domaine) :
 * céfalexine, pénicilline G/V, benzathine-benzylpénicilline, doxycycline, mupirocine, linézolide, métronidazole.
 */
import type { Molecule } from '../types';
import { S } from './base';

const PYO = 'RCP-pristinamycine';
const DAL_PO = 'RCP-clindamycine-orale';
const DAL_IV = 'RCP-clindamycine-IV';

export const pristinamycine: Molecule = {
  id: 'pristinamycine',
  dci: 'Pristinamycine',
  famille: 'streptogramine',
  statut: 'verifiee_ia',
  regimens: [
    {
      id: 'pristinamycine-1g-x3',
      libelle: '1 g toutes les 8 h per os',
      indication: 'DHBNN en cas d\'allergie à la pénicilline, abcès, furoncle compliqué, furonculose, impétigo grave (HAS 2019/2021) ; pied diabétique grade 2 si SARM (SPILF 2023).',
      dose: { type: 'fixe', valeur: 1, unite: 'g', frequenceParJour: 3 },
      voie: 'PO',
      modalites: 'à prendre au moment des repas ; contre-indiquée avec la colchicine',
      statut: 'verifiee_ia',
      sources: [
        S(PYO, '§4.2 (tableau)', '1 g x 2/jour à 1 g x 3/jour', 'posologie'),
        S('HAS-2021-DHBNN-adulte', 'allergie à la pénicilline', 'pristinamycine : 1 g 3 fois par jour pendant 7 jours', 'posologie'),
      ],
      remarques: 'Durée du RCP (8 à 14 jours) différente des recommandations (5 jours abcès et furoncle, 7 jours DHBNN, furonculose et impétigo) : la durée affichée est celle de la recommandation. Pas de forme IV.',
    },
  ],
  adaptationRenale: {
    methode: 'non_precisee',
    statut: 'verifiee_ia',
    paliers: [
      { texte: 'Pas d\'adaptation : aucun ajustement posologique jugé nécessaire chez l\'insuffisant rénal (peu éliminée par le rein). Hémodialyse non mentionnée par le RCP.', sources: [S(PYO, '§4.2', 'aucun ajustement posologique n\'est jugé nécessaire chez les patients insuffisants rénaux', 'adaptation_renale')] },
    ],
  },
  surveillance: [
    {
      id: 'pristinamycine-colchicine',
      type: 'interaction',
      categorie: 'systematique',
      quoi: 'Vérifier l\'absence de colchicine : association contre-indiquée',
      quand: { ancre: 'avant_traitement', texte: 'Avant la première prise' },
      pourquoi: 'Contre-indication du RCP (conséquences potentiellement fatales).',
      statut: 'verifiee_ia',
      sources: [S(PYO, '§4.3 ; §4.5', 'Administration concomitante de pristinamycine et de colchicine', 'surveillance')],
    },
    {
      id: 'pristinamycine-cutane',
      type: 'clinique',
      categorie: 'systematique',
      quoi: 'Éruption cutanée (PEAG, SJS/NET, DRESS) : arrêt du traitement ; antécédent d\'éruption grave sous pristinamycine ou allergie au blé : contre-indication',
      quand: { ancre: 'debut_traitement', texte: 'Dès les premières heures du traitement', repetition: 'pendant tout le traitement' },
      pourquoi: 'Réactions cutanées graves possibles, parfois dès les premières heures.',
      statut: 'verifiee_ia',
      sources: [S(PYO, '§4.4', 'parfois même seulement quelques heures après l\'introduction', 'surveillance'), S(PYO, '§4.3', 'Allergie au blé (autre que la maladie coeliaque)', 'surveillance')],
    },
  ],
  // Statut « non vérifié » : le RCP ne conclut pas (« données animales et cliniques insuffisantes ») et la fiche CRAT
  // n'a pas été trouvée ; la règle peau affiche ce texte en alerte quand la pristinamycine est proposée et qu'une
  // grossesse est possible (le moteur n'avertit que pour « éviter » et « contre-indiqué »).
  grossesse: {
    statut: 'non_verifie',
    texte: 'Données animales et cliniques insuffisantes : le RCP indique qu\'elle « peut être envisagée au cours de la grossesse si besoin » ; fiche CRAT non trouvée. Allaitement (RCP) : possible seulement en l\'absence d\'alternative, chez un nouveau-né à terme sans facteur de risque digestif.',
    sources: [S(PYO, '§4.6', 'l\'utilisation de la pristinamycine peut être envisagée au cours de la grossesse si besoin, malgré des données animales et cliniques insuffisantes', 'autre')],
  },
  interactionsPertinentes: [
    { avec: 'colchicine', texte: 'Contre-indiquée : association pristinamycine-colchicine (RCP § 4.3 et § 4.5, conséquences potentiellement fatales).', sources: [S(PYO, '§4.3 ; §4.5', 'Administration concomitante de pristinamycine et de colchicine', 'surveillance')] },
    { avec: 'avk', texte: 'Contrôle plus fréquent de l\'INR.', sources: [S(PYO, '§4.5', 'Contrôle plus fréquent de l\'INR', 'surveillance')] },
    { avec: 'immunosuppresseur_calcineurine', texte: 'Augmentation des concentrations de l\'immunosuppresseur : dosages et contrôle de la fonction rénale.', sources: [S(PYO, '§4.5', undefined, 'surveillance')] },
  ],
};

const SRC_POSO_PO = S(DAL_PO, '§4.2', '600 à 2400 mg/24 heures, en 2, 3 ou 4 prises', 'posologie');
const SRC_POSO_IV = S(DAL_IV, '§4.2', '600 à 2400 mg/24 heures, en 2, 3 ou 4 administrations', 'posologie');
const MODALITES_PO = 'gélules avalées entières avec un grand verre d\'eau, en position verticale au moins 30 minutes ; absorption non modifiée par l\'alimentation';
const MODALITES_IV = 'jamais en IV directe ; perfusion après dilution (600 mg dans 50 mL en 20 min au moins), concentration ≤ 18 mg/mL, débit ≤ 30 mg/min ; une perfusion trop rapide expose à l\'hypotension voire à l\'arrêt cardiaque';

export const clindamycine: Molecule = {
  id: 'clindamycine',
  dci: 'Clindamycine',
  famille: 'lincosamide',
  statut: 'verifiee_ia',
  regimens: [
    {
      id: 'clindamycine-po-600x3',
      libelle: '600 mg toutes les 8 h per os',
      indication: 'DHBNN en cas d\'allergie à la pénicilline, abcès, furoncle compliqué, furonculose (HAS 2019/2021) ; pied diabétique grade 2 sur plaie récente (SPILF 2023).',
      dose: { type: 'fixe', valeur: 600, unite: 'mg', frequenceParJour: 3 },
      voie: 'PO',
      modalites: MODALITES_PO,
      statut: 'verifiee_ia',
      sources: [SRC_POSO_PO, S('HAS-2021-DHBNN-adulte', 'allergie à la pénicilline', 'clindamycine : 600 mg 3 fois par jour', 'posologie')],
    },
    {
      id: 'clindamycine-po-600x4',
      libelle: '600 mg toutes les 6 h per os (poids > 100 kg)',
      indication: 'Mêmes indications chez le patient de plus de 100 kg (HAS 2019/2021).',
      dose: { type: 'fixe', valeur: 600, unite: 'mg', frequenceParJour: 4, doseMaxParJour: { valeur: 2400, unite: 'mg' } },
      voie: 'PO',
      modalites: MODALITES_PO,
      statut: 'verifiee_ia',
      sources: [SRC_POSO_PO, S('HAS-2021-DHBNN-adulte', 'allergie à la pénicilline', 'et jusqu\'à 600 mg 4 fois par jour si poids > 100 kg', 'posologie')],
      remarques: '2 400 mg/24 h : dose maximale du RCP. SPILF 2023 (pied diabétique) propose 900 mg/8 h au-delà de 100 kg, au-dessus de ce maximum : non repris.',
    },
    {
      id: 'clindamycine-iv-600x3',
      libelle: '600 mg toutes les 8 h IV',
      indication: 'Abcès cutané (HAS 2021 : clindamycine PO/IV) ; association dans les dermohypodermites nécrosantes (argumentaire HAS 2019, WSES 2022).',
      dose: { type: 'fixe', valeur: 600, unite: 'mg', frequenceParJour: 3 },
      voie: 'IV',
      modalites: MODALITES_IV,
      statut: 'verifiee_ia',
      sources: [SRC_POSO_IV, S('HAS-2021-abces-cutanes', 'antibiothérapie', 'clindamycine PO/IV : 600 mg 3 fois par jour', 'posologie')],
      remarques: 'Usage hospitalier. Contient de l\'alcool benzylique (acidose métabolique ; prudence en insuffisance hépatique ou rénale).',
    },
    {
      id: 'clindamycine-iv-600x4',
      libelle: '600 mg toutes les 6 h IV (poids > 100 kg)',
      indication: 'Abcès cutané chez le patient de plus de 100 kg (HAS 2021).',
      dose: { type: 'fixe', valeur: 600, unite: 'mg', frequenceParJour: 4, doseMaxParJour: { valeur: 2400, unite: 'mg' } },
      voie: 'IV',
      modalites: MODALITES_IV,
      statut: 'verifiee_ia',
      sources: [SRC_POSO_IV, S('HAS-2021-abces-cutanes', 'antibiothérapie', 'jusqu\'à 600 mg 4 fois par jour si poids > 100 kg', 'posologie')],
      remarques: '2 400 mg/24 h : dose maximale du RCP. Usage hospitalier ; alcool benzylique.',
    },
  ],
  adaptationRenale: {
    methode: 'non_precisee',
    statut: 'verifiee_ia',
    paliers: [
      { texte: 'Pas d\'adaptation posologique prévue par le RCP (métabolisme hépatique) ; surveiller la fonction rénale en cas de trouble rénal préexistant ou de médicament néphrotoxique (lésions rénales aiguës rarement signalées).', sources: [S(DAL_PO, '§4.2 (aucune adaptation rénale mentionnée) ; §4.4 ; §5.2', 'lésions rénales aiguës … rarement signalés', 'adaptation_renale')] },
    ],
    hemodialyse: { texte: 'Non éliminée efficacement par l\'hémodialyse ni la dialyse péritonéale (RCP) ; aucune modalité d\'administration précisée : avis pharmacologique.', sources: [S(DAL_PO, '§4.9', 'L\'hémodialyse et la dialyse péritonéale ne permettent pas d\'éliminer efficacement la clindamycine', 'adaptation_renale')] },
  },
  insuffisanceHepatique: { texte: 'Augmentation des taux sériques et allongement de la demi-vie : prudence ; bilans hépatique et rénal si traitement prolongé.', sources: [S(DAL_PO, '§4.4', 'augmentation des taux sériques et un allongement de la demi-vie', 'surveillance')] },
  surveillance: [
    {
      id: 'clindamycine-colite',
      type: 'clinique',
      categorie: 'systematique',
      quoi: 'Diarrhée : rechercher une colite associée aux antibiotiques (C. difficile) ; arrêt immédiat de la clindamycine',
      quand: { ancre: 'quotidien', texte: 'Pendant tout le traitement et après son arrêt', repetition: 'à chaque évaluation' },
      pourquoi: 'Colites associées aux antibiotiques, dont les colites à C. difficile.',
      statut: 'verifiee_ia',
      sources: [S(DAL_PO, '§4.4', undefined, 'surveillance')],
    },
    {
      id: 'clindamycine-hypersensibilite',
      type: 'clinique',
      categorie: 'systematique',
      quoi: 'Réaction cutanée ou d\'hypersensibilité grave (DRESS, SJS, NET, PEAG) : arrêt ; une PEAG contre-indique toute réadministration',
      quand: { ancre: 'debut_traitement', texte: 'Pendant tout le traitement' },
      pourquoi: 'Hypersensibilité grave possible.',
      statut: 'verifiee_ia',
      sources: [S(DAL_PO, '§4.4', undefined, 'surveillance')],
    },
    {
      id: 'clindamycine-interactions-rcp',
      type: 'interaction',
      categorie: 'systematique',
      quoi: 'Vérifier les traitements associés sans catégorie de saisie : inducteurs du CYP3A4 (rifampicine) — surveiller une perte d\'efficacité ; forme IV : curares (potentialisation)',
      quand: { ancre: 'avant_traitement', texte: 'Avant la première dose' },
      pourquoi: 'Précautions d\'emploi du RCP (§ 4.5) que la saisie ne permet pas de détecter.',
      statut: 'verifiee_ia',
      sources: [S(DAL_PO, '§4.5', undefined, 'surveillance'), S(DAL_IV, '§4.5', undefined, 'surveillance')],
    },
  ],
  grossesse: {
    statut: 'eviter',
    texte: 'Gélule : éviter au 1er trimestre ; utilisable si nécessaire aux 2e et 3e trimestres. Forme injectable : préférable d\'éviter pendant la grossesse (alcool benzylique). Fiche CRAT non trouvée.',
    sources: [S(DAL_PO, '§4.6', 'éviter d\'utiliser la clindamycine au cours du premier trimestre', 'autre'), S(DAL_IV, '§4.6', 'il est préférable d\'éviter d\'utiliser DALACINE 600 mg, solution injectable en ampoule au cours de la grossesse', 'autre')],
  },
  interactionsPertinentes: [
    { avec: 'avk', texte: 'Contrôle plus fréquent de l\'INR.', sources: [S(DAL_PO, '§4.5', 'Contrôle plus fréquent de l\'INR', 'surveillance')] },
    { avec: 'immunosuppresseur_calcineurine', texte: 'Ciclosporine, tacrolimus : baisse des concentrations de l\'immunosuppresseur (précaution d\'emploi).', sources: [S(DAL_PO, '§4.5', undefined, 'surveillance')] },
  ],
};
