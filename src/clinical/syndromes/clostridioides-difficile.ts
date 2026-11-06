/**
 * Questions du foyer « Diarrhée à Clostridioides difficile » (docs/sources/recherche-clostridioides-difficile.md §15.1) :
 * diarrhée (qui tester), résultat du test, rang de l'épisode, critères de gravité et de forme grave-compliquée,
 * facteurs de risque de récidive non déduits de la saisie, voie orale. L'âge, la grossesse, le contexte
 * (associé aux soins), le choc septique, la fonction rénale et les allergies viennent de la saisie du patient.
 */
import type { Dossier } from '../../engine/etat';
import type { QuestionSyndrome } from './questions';

const ouiNon = [
  { v: 'oui', l: 'Oui' },
  { v: 'non', l: 'Non' },
];

const F = ['clostridioides_difficile' as const];

/** Diarrhée ou iléus : la prise en charge de l'épisode est à décrire (sinon, conclusion « ne pas tester / ne pas traiter »). */
const symptomatique = (r: (id: string) => string) => r('cdiff.diarrhee') !== 'non';

export const QUESTIONS_CDIFF: QuestionSyndrome[] = [
  {
    id: 'cdiff.diarrhee',
    foyers: F,
    libelle: 'Diarrhée nouvelle et inexpliquée : au moins 3 selles non moulées (Bristol 6-7) en 24 h ?',
    aide: 'Ne pas rechercher C. difficile sur des selles moulées ni chez un patient sans diarrhée (sauf iléus).',
    options: [
      { v: 'oui', l: 'Oui (≥ 3 selles non moulées / 24 h)' },
      { v: 'non', l: 'Non (pas de diarrhée, selles moulées)' },
      { v: 'ileus', l: 'Pas de selles : iléus' },
    ],
  },
  {
    id: 'cdiff.laxatif',
    foyers: F,
    libelle: 'Laxatif dans les 48 heures précédentes ?',
    options: ouiNon,
    pertinente: (r) => r('cdiff.diarrhee') === 'oui',
  },
  {
    id: 'cdiff.test',
    foyers: F,
    libelle: 'Recherche de C. difficile toxinogène : résultat',
    aide: 'Algorithme en 2 étapes : GDH ou TAAN (PCR), puis toxines A/B libres (EIA). La recherche doit être demandée explicitement.',
    options: [
      { v: 'non_preleve', l: 'Non prélevé' },
      { v: 'en_attente', l: 'Prélevé, résultat en attente' },
      { v: 'negatif', l: 'Négatif (1re étape GDH ou TAAN négative)' },
      { v: 'toxine_positive', l: 'Toxines libres positives' },
      { v: 'taan_seul', l: 'TAAN (PCR) positif, toxines non recherchées' },
      { v: 'discordant', l: 'GDH ou TAAN positif, toxines négatives' },
    ],
  },
  {
    id: 'cdiff.episode',
    foyers: F,
    libelle: 'Rang de l\'épisode',
    aide: 'Récidive : nouvel épisode dans les 8 semaines suivant un épisode dont les symptômes s\'étaient résolus.',
    options: [
      { v: 'premier', l: '1er épisode' },
      { v: 'premiere_recidive', l: '1re récidive' },
      { v: 'recidives_multiples', l: '2e récidive ou plus' },
    ],
    pertinente: (r) => symptomatique(r),
  },
  {
    id: 'cdiff.traitement_precedent',
    foyers: F,
    libelle: 'Traitement de l\'épisode précédent',
    options: [
      { v: 'fidaxomicine', l: 'Fidaxomicine' },
      { v: 'vancomycine', l: 'Vancomycine' },
      { v: 'metronidazole', l: 'Métronidazole' },
    ],
    pertinente: (r) => symptomatique(r) && (r('cdiff.episode') === 'premiere_recidive' || r('cdiff.episode') === 'recidives_multiples'),
  },
  {
    id: 'cdiff.gravite',
    foyers: F,
    libelle: 'Au moins un critère de gravité : température > 38,5 °C, leucocytes > 15 G/L, créatininémie > 50 % au-dessus de la valeur de base, ou signes d\'imagerie (distension colique, infiltration de la graisse péricolique, épaississement pariétal) ?',
    options: ouiNon,
    pertinente: (r) => symptomatique(r),
  },
  {
    id: 'cdiff.compliquee',
    foyers: F,
    libelle: 'Forme grave et compliquée (fulminante) : hypotension, lactates élevés, mégacôlon toxique, perforation ou évolution fulminante ?',
    aide: 'Le choc septique (saisi dans la gravité) et l\'iléus (saisi plus haut) suffisent à définir cette forme.',
    options: ouiNon,
    pertinente: (r, d: Dossier) => r('cdiff.diarrhee') === 'oui' && d.patient.gravite !== 'choc_septique',
  },
  {
    id: 'cdiff.antecedent',
    foyers: F,
    libelle: 'Antécédent d\'infection à C. difficile (épisode plus ancien) ?',
    aide: 'Facteur de risque de récidive (ESCMID 2021, SPILF 2026).',
    options: ouiNon,
    pertinente: (r) => symptomatique(r) && r('cdiff.episode') === 'premier',
  },
  {
    id: 'cdiff.hospitalisation',
    foyers: F,
    libelle: 'Hospitalisation dans les 3 derniers mois ?',
    aide: 'Avec un épisode associé aux soins : facteur de risque de récidive.',
    options: ouiNon,
    pertinente: (r, d: Dossier) => symptomatique(r) && r('cdiff.episode') === 'premier' && d.patient.contexte !== 'communautaire',
  },
  {
    id: 'cdiff.atb',
    foyers: F,
    libelle: 'Antibiothérapie systémique (autre que le traitement de l\'ICD) poursuivie après le diagnostic ?',
    aide: 'L\'antibiotique inducteur est à arrêter dès que possible ; sa poursuite est un facteur de risque de récidive.',
    options: ouiNon,
    pertinente: (r) => symptomatique(r),
  },
  {
    id: 'cdiff.ipp',
    foyers: F,
    libelle: 'Traitement par inhibiteur de la pompe à protons (IPP) en cours ?',
    options: ouiNon,
    pertinente: (r) => symptomatique(r),
  },
  {
    id: 'cdiff.voie_orale',
    foyers: F,
    libelle: 'Voie orale possible ?',
    options: [
      { v: 'oui', l: 'Oui' },
      { v: 'non', l: 'Non (sonde gastrique ou voie colique nécessaire)' },
    ],
    pertinente: (r) => symptomatique(r),
  },
];
