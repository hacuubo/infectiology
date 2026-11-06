/**
 * Antibiotiques de l'infection à Clostridioides difficile (ICD) : fidaxomicine et vancomycine PER OS.
 * RCP lus le 2026-11-06 : docs/sources/recherche-clostridioides-difficile.md §16.
 *
 * Vancomycine orale : molécule DISTINCTE de `vancomycine` (IV), et non un régime de plus de celle-ci, car le moteur
 * (src/engine/posologie.ts) applique l'adaptation rénale (`Molecule.adaptationRenale`), la surveillance et le STP
 * (`Molecule.surveillance`, `Molecule.stp`) au niveau de la MOLÉCULE, quel que soit le régime : un régime oral de
 * `vancomycine` recevrait les paliers de clairance IV (« 15 à 20 mg/kg toutes les 24 h »), la résiduelle IV
 * (condition « administration discontinue » vraie pour une prise orale) et la surveillance de la créatinine et de
 * l'audition de la voie IV. Le RCP IV (RCP-vancomycine, CIS 60033510) n'a d'ailleurs aucune indication orale ; la voie
 * orale a son propre RCP (RCP-vancomycine-orale, CIS 69031610).
 *
 * Métronidazole (cité par les recommandations seulement si fidaxomicine et vancomycine sont indisponibles, ou par voie IV
 * en adjonction) : non créé ici (ajouté séparément dans la base).
 * Bezlotoxumab : AMM abrogée le 20/10/2026 (arrêt de commercialisation le 23/05/2025) : non modélisé.
 */
import type { Molecule } from '../types';
import { S } from './base';

const RCP_F = 'RCP-fidaxomicine';
const RCP_VO = 'RCP-vancomycine-orale';

export const fidaxomicine: Molecule = {
  id: 'fidaxomicine',
  dci: 'Fidaxomicine',
  famille: 'autre',
  statut: 'verifiee_ia',
  regimens: [
    {
      id: 'fidaxomicine-200x2',
      libelle: '200 mg toutes les 12 h per os (schéma standard)',
      indication: 'Infection à C. difficile : 1er épisode (1re intention), forme grave, 1re récidive, récidives multiples avant TMF.',
      dose: { type: 'fixe', valeur: 200, unite: 'mg', frequenceParJour: 2 },
      voie: 'PO',
      modalites: 'comprimé avalé entier avec de l\'eau, au cours ou en dehors des repas (granulés pour suspension buvable si difficulté à avaler) ; association déconseillée avec les inhibiteurs puissants de la P-gp (ciclosporine, kétoconazole, érythromycine, clarithromycine, vérapamil, dronédarone, amiodarone)',
      statut: 'verifiee_ia',
      sources: [
        S(RCP_F, '§4.2', 'La dose recommandée est de 200 mg (un comprimé) deux fois par jour (une fois toutes les 12 heures) pendant 10 jours', 'posologie'),
        S('ESCMID-2021-ICD-traitement', 'p. 13', 'For the initial episode of CDI we recommend fidaxomicin 200 mg twice daily for 10 days.', 'posologie'),
        S('SPILF-2026-ICD-JNI', 'tableau « Définitions »', '200 mg/12 h qsp 10j', 'posologie'),
        S(RCP_F, '§4.5', 'la ciclosporine, le kétoconazole, l\'érythromycine, la clarithromycine, le vérapamil, la dronédarone et l\'amiodarone', 'surveillance'),
      ],
    },
    {
      id: 'fidaxomicine-pulse',
      libelle: 'Schéma prolongé-pulsé : 200 mg toutes les 12 h de J1 à J5, puis 200 mg 1 jour sur 2 de J7 à J25',
      indication: '1er épisode à haut risque de récidive, 1re récidive (alternative au schéma standard, SPILF 2026).',
      dose: { type: 'fixe', valeur: 200, unite: 'mg', texte: '200 mg × 2/24 h de J1 à J5 (pas de prise le jour 6), puis 200 mg une fois tous les deux jours de J7 à J25' },
      voie: 'PO',
      modalites: 'comprimé avalé entier avec de l\'eau, au cours ou en dehors des repas ; inhibiteurs puissants de la P-gp déconseillés (RCP §4.5)',
      statut: 'verifiee_ia',
      sources: [
        S(RCP_F, '§4.2 (schéma prolongé-pulsé)', 'deux fois par jour du jour 1 au jour 5 (pas de prise de comprimé le jour 6) puis une fois tous les deux jours du jour 7 au jour 25', 'posologie'),
        S('SPILF-2026-ICD-JNI', 'tableau « Définitions »', '200 mg/12 h qsp de J1 à J5, puis 200 mg toutes les 48h de J7 à J25', 'posologie'),
      ],
      remarques: 'ESCMID 2021 (p. 15) qualifiait ce schéma de « off-label » ; il figure désormais dans le RCP DIFICLIR (§4.2).',
    },
  ],
  adaptationRenale: {
    methode: 'non_precisee',
    statut: 'verifiee_ia',
    texteGeneral: 'Le RCP ne donne ni palier ni grandeur (clairance ou DFG) ni consigne d\'hémodialyse.',
    paliers: [
      {
        texte: 'Pas d\'adaptation posologique (RCP) ; prudence en insuffisance rénale sévère (données limitées).',
        sources: [S(RCP_F, '§4.2', 'Aucune adaptation posologique n\'est jugée nécessaire.', 'adaptation_renale'), S(RCP_F, '§4.2', 'insuffisance rénale sévère', 'adaptation_renale')],
      },
    ],
  },
  surveillance: [
    {
      id: 'fidaxomicine-hypersensibilite',
      type: 'clinique',
      categorie: 'systematique',
      quoi: 'Signes d\'hypersensibilité, dont angio-œdème sévère ; prudence si allergie connue aux macrolides',
      quand: { ancre: 'quotidien', texte: 'Pendant le traitement' },
      pourquoi: 'Réactions d\'hypersensibilité décrites (RCP §4.4).',
      statut: 'verifiee_ia',
      sources: [S(RCP_F, '§4.4', 'angioedèmes sévères', 'surveillance'), S(RCP_F, '§4.4', 'prudence chez les patients ayant une allergie connue aux macrolides', 'surveillance')],
    },
  ],
  grossesse: {
    statut: 'eviter',
    texte: 'Aucune donnée chez la femme enceinte : il est préférable d\'éviter la fidaxomicine pendant la grossesse (RCP) ; ESCMID 2021 préfère la vancomycine. CRAT fidaxomicine introuvable. Allaitement : interrompre l\'allaitement ou le traitement selon le bénéfice (RCP).',
    sources: [
      S(RCP_F, '§4.6', 'il est préférable d\'éviter l\'utilisation de la fidaxomicine pendant la grossesse', 'autre'),
      S('ESCMID-2021-ICD-traitement', 'p. 31', 'In the absence of clinical data and experience with fidaxomicin, we prefer vancomycin during pregnancy.', 'autre'),
    ],
  },
  interactionsPertinentes: [
    { avec: 'immunosuppresseur_calcineurine', texte: 'Ciclosporine (inhibiteur puissant de la P-gp) : association déconseillée.', sources: [S(RCP_F, '§4.5', 'la ciclosporine, le kétoconazole, l\'érythromycine, la clarithromycine, le vérapamil, la dronédarone et l\'amiodarone', 'surveillance')] },
    { avec: 'aod', texte: 'Dabigatran étexilate : un effet de la fidaxomicine (inhibiteur faible à modéré de la P-gp intestinale) ne peut pas être exclu.', sources: [S(RCP_F, '§4.5', 'dabigatran etexilate, ne peut pas être exclu', 'surveillance')] },
  ],
};

export const vancomycineOrale: Molecule = {
  id: 'vancomycine_orale',
  dci: 'Vancomycine (voie orale)',
  famille: 'glycopeptide',
  statut: 'verifiee_ia',
  regimens: [
    {
      id: 'vanco-po-125x4',
      libelle: '125 mg toutes les 6 h per os (schéma standard)',
      indication: 'Infection à C. difficile : alternative à la fidaxomicine (1er épisode sans facteur de risque de récidive), forme grave, 1re récidive si fidaxomicine indisponible, récidives multiples avant TMF, grossesse.',
      dose: { type: 'fixe', valeur: 125, unite: 'mg', frequenceParJour: 4 },
      voie: 'PO',
      modalites: 'solution buvable préparée à partir de la poudre « pour solution à diluer pour perfusion ou pour solution buvable » : flacon de 500 mg dissous dans 10 mL d\'eau potable, diluable dans du jus de pomme ou d\'orange ; solution conservée 4 jours (4 °C ou 25 °C). Le tableau volume/dose du RCP ne mentionne pas 125 mg : volume à calculer et à vérifier avec la pharmacie. Pas de gélule de vancomycine en France',
      statut: 'verifiee_ia',
      sources: [
        S(RCP_VO, '§4.2', '125 mg toutes les 6 heures pendant 10 jours pour un premier épisode d\'ICD non sévère', 'posologie'),
        S('ESCMID-2021-ICD-traitement', 'p. 13', 'oral vancomycin 125 mg four times daily for 10 days is a suitable alternative.', 'posologie'),
        S('SPILF-2026-ICD-JNI', 'tableau « Définitions »', '125 mg/6 h qsp 10j', 'posologie'),
        S(RCP_VO, '§4.2/6.6', 'Dissoudre le contenu d\'un flacon de 500 mg avec 10 mL d\'eau potable', 'posologie'),
      ],
      remarques: 'La vancomycine orale augmente le risque de sélection d\'entérocoques résistants à la vancomycine (RCP §4.4).',
    },
    {
      id: 'vanco-po-500x4',
      libelle: '500 mg toutes les 6 h per os ou par sonde (forte dose : RCP « ICD sévère ou compliquée », IDSA forme fulminante)',
      indication: 'Forme fulminante selon IDSA/SHEA 2017 ; non recommandée par ESCMID 2021 (divergence).',
      dose: { type: 'fixe', valeur: 500, unite: 'mg', frequenceParJour: 4, doseMaxParJour: { valeur: 2, unite: 'g' } },
      voie: 'PO',
      modalites: 'solution buvable (500 mg dans 10 mL d\'eau potable) per os ou par sonde gastrique ; dose maximale journalière 2 g (RCP)',
      statut: 'brouillon',
      sources: [
        S(RCP_VO, '§4.2', 'Cette dose peut être augmentée à 500 mg toutes les 6 heures pendant 10 jours en cas d\'ICD sévère ou compliquée. La dose maximale journalière ne devrait pas dépasser 2 g.', 'posologie'),
        S('IDSA-SHEA-2017-ICD', 'fulminant CDI', 'The vancomycin dosage is 500 mg orally 4 times per day', 'posologie'),
        S('ESCMID-2021-ICD-traitement', 'p. 13', 'The use of vancomycin 500 mg four times daily is not recommended.', 'posologie'),
      ],
      remarques: 'Divergence : RCP et IDSA 2017 (forme fulminante) vs ESCMID 2021 (« not recommended ») et SPILF 2022 (pas de données pour les hautes doses).',
    },
    {
      id: 'vanco-po-pulse',
      libelle: 'Schéma dégressif-pulsé sur 6 semaines',
      indication: '1re récidive : possible en alternative à la vancomycine standard si la fidaxomicine n\'est pas disponible (SPILF 2026).',
      dose: { type: 'fixe', valeur: 125, unite: 'mg', texte: '125 mg toutes les 6 h pendant 14 j, puis 125 mg toutes les 12 h pendant 7 j, puis 125 mg toutes les 24 h pendant 7 j, puis 125 mg toutes les 48 h pendant 7 j, puis 125 mg toutes les 72 h pendant 7 j' },
      voie: 'PO',
      modalites: 'solution buvable (voir schéma standard)',
      statut: 'verifiee_ia',
      sources: [
        S('SPILF-2026-ICD-JNI', 'tableau « Définitions »', '125 mg/6 h qsp 14j, puis 125 mg/12 h qsp 7j, puis 125 mg/24 h qsp 7j, puis 125 mg toutes les 48 h qsp 7j, puis 125 mg toutes les 72 h qsp 7j', 'posologie'),
        S('ESCMID-2021-ICD-traitement', 'p. 23', '2 weeks of vancomycin 125 mg orally four times daily, followed by 1 week 125 mg twice daily, then 1 week 125 mg daily, then 1 week 125 mg every second day, and finally 125 mg orally every third day for 1 week.', 'posologie'),
      ],
      remarques: 'Le schéma itératif du RCP (« 125-500 mg/jour tous les 2-3 jours pendant au moins 3 semaines ») diffère du schéma SPILF/ESCMID retenu ici.',
    },
  ],
  adaptationRenale: {
    methode: 'non_precisee',
    statut: 'verifiee_ia',
    texteGeneral: 'Voie orale : les paliers de clairance du RCP concernent la voie IV ; rien de spécifique à la voie orale en hémodialyse.',
    paliers: [
      {
        texte: 'Voie orale : pas d\'adaptation posologique prévue (les paliers de clairance du RCP concernent la voie IV) ; absorption possible si colite sévère ou maladie inflammatoire de l\'intestin, effets indésirables surtout en cas d\'insuffisance rénale.',
        sources: [
          S(RCP_VO, 'fonction rénale (voie orale), d\'après la note de recherche §16.2', 'aucune adaptation posologique prévue pour la voie orale (les paliers ClCr du RCP concernent la voie IV)', 'adaptation_renale'),
          S(RCP_VO, '§4.4', 'L\'absorption peut être augmentée chez les patients atteints de maladies inflammatoires de la muqueuse intestinale ou de colite pseudomembraneuse due à Clostridium difficile', 'adaptation_renale'),
        ],
      },
    ],
  },
  surveillance: [
    {
      id: 'vanco-orale-dosage',
      type: 'biologique',
      categorie: 'conditionnelle',
      quoi: 'Concentration sérique de vancomycine (absorption digestive possible)',
      quand: { ancre: 'non_determine', texte: 'Aucun calendrier chiffré dans les sources lues pour la voie orale' },
      pourquoi: 'Absorption augmentée en cas de maladie inflammatoire de la muqueuse intestinale ou de colite pseudomembraneuse ; IDSA 2017 : résiduelle à envisager en cas de forte dose, d\'exposition prolongée, d\'insuffisance rénale ou de muqueuse lésée.',
      conditionTexte: 'si maladie inflammatoire de la muqueuse intestinale, colite sévère, forte dose, traitement prolongé ou insuffisance rénale',
      statut: 'verifiee_ia',
      sources: [
        S(RCP_VO, '§4.2/4.4', 'L\'absorption peut être augmentée chez les patients atteints de maladies inflammatoires de la muqueuse intestinale ou de colite pseudomembraneuse due à Clostridium difficile', 'surveillance'),
        S('IDSA-SHEA-2017-ICD', 'surveillance', 'it may be appropriate to monitor trough serum concentration', 'surveillance'),
      ],
    },
  ],
  grossesse: {
    statut: 'utilisable',
    texte: 'Utilisation envisageable quel que soit le terme (RCP) ; molécule préférée pendant la grossesse (ESCMID 2021), qui déconseille les fortes doses et les traitements prolongés. Excipients : pas de PEG 400 ni de NADA dans cette présentation. Allaitement : voie orale envisageable (RCP).',
    sources: [
      S(RCP_VO, '§4.6', 'quel qu\'en soit le terme', 'autre'),
      S('CRAT-vancomycine-grossesse', 'En pratique', 'la vancomycine peut être utilisée quel que soit le terme de la grossesse', 'autre'),
      S('ESCMID-2021-ICD-traitement', 'p. 31', 'prolonged administration and high dosing of vancomycin should be discouraged', 'autre'),
    ],
  },
  interactionsPertinentes: [
    { avec: 'avk', texte: 'Warfarine / anticoagulants oraux : suivre l\'INR fréquemment pendant et rapidement après l\'administration concomitante.', sources: [S(RCP_VO, '§4.5', 'suivre l\'INR fréquemment pendant et rapidement après l\'administration concomitante', 'surveillance')] },
  ],
};
