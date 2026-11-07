/**
 * Questions du foyer « Peau et tissus mous » (docs/sources/recherche-peau-tissus-mous.md § 12.1-12.2) :
 * signes de nécrose, forme clinique, puis les éléments propres à chaque forme. L'âge, le poids, la gravité (sepsis),
 * l'immunodépression, le contexte associé aux soins, les allergies et les antécédents de SARM viennent de la saisie.
 */
import type { QuestionSyndrome } from './questions';

const ouiNon = [
  { v: 'oui', l: 'Oui' },
  { v: 'non', l: 'Non' },
];

export const FORMES_PEAU = [
  { v: 'dhbnn', l: 'Érysipèle / dermohypodermite bactérienne non nécrosante (DHBNN)' },
  { v: 'abces', l: 'Abcès cutané' },
  { v: 'furoncle', l: 'Furoncle ou anthrax' },
  { v: 'furonculose', l: 'Furonculose (furoncles récidivants)' },
  { v: 'impetigo', l: 'Impétigo' },
  { v: 'morsure', l: 'Morsure (animale ou humaine)' },
  { v: 'pied_diabetique', l: 'Plaie du pied chez un patient diabétique' },
  { v: 'autre', l: 'Autre (plaie chronique, site opératoire, cathéter…)' },
];

export const QUESTIONS_PEAU: QuestionSyndrome[] = [
  {
    id: 'peau.necrose',
    foyers: ['cutane'],
    libelle: 'Signes locaux de gravité évoquant une forme nécrosante (DHBN / fasciite nécrosante) ?',
    aide: 'Douleur intense discordante avec les signes locaux, lividités, taches cyaniques, crépitation sous-cutanée, hypo- ou anesthésie, induration dépassant l\'érythème, nécrose, extension rapide en quelques heures, aggravation 24 à 48 h après le début d\'un antibiotique (HAS 2019). Pied diabétique : abcès profond, nécrose extensive, gangrène, gaz sous-cutané, syndrome de loge — chirurgie en urgence (SPILF 2023).',
    options: ouiNon,
  },
  {
    id: 'peau.forme',
    foyers: ['cutane'],
    libelle: 'Forme clinique',
    options: FORMES_PEAU,
  },
  {
    id: 'peau.dhbnn_particularite',
    foyers: ['cutane'],
    libelle: 'Localisation ou porte d\'entrée particulière ?',
    aide: 'Face, périnée, exposition aquatique ou marine, injection septique : étiologie non streptococcique possible ; avis spécialisé ou hospitalisation en urgence (HAS 2019). Le contexte associé aux soins se renseigne avec le patient.',
    options: [
      { v: 'aucune', l: 'Aucune (membre, porte d\'entrée cutanée banale)' },
      { v: 'face', l: 'Face' },
      { v: 'perinee', l: 'Région périnéo-fessière' },
      { v: 'aquatique', l: 'Exposition aquatique ou marine' },
      { v: 'injection', l: 'Injection septique (toxicomanie IV)' },
    ],
    pertinente: (r) => r('peau.forme') === 'dhbnn' && r('peau.necrose') !== 'oui',
  },
  {
    id: 'peau.hospitalisation',
    foyers: ['cutane'],
    libelle: 'Critère d\'hospitalisation présent ?',
    aide: 'Signes de gravité ; immunodépression ; diabète déséquilibré ; insuffisance cardiaque NYHA ≥ III ; insuffisance rénale sévère ; insuffisance hépatique ; IMC > 40 ; traitement ou surveillance impossibles à domicile, précarité, voie orale impossible ; > 75 ans polypathologique ; évolution défavorable à 24-48 h (HAS 2019).',
    options: ouiNon,
    pertinente: (r) => r('peau.forme') === 'dhbnn' && r('peau.necrose') !== 'oui',
  },
  {
    id: 'peau.recidives',
    foyers: ['cutane'],
    libelle: 'Au moins 2 épisodes de DHBNN dans l\'année écoulée ?',
    options: ouiNon,
    pertinente: (r) => r('peau.forme') === 'dhbnn' && r('peau.necrose') !== 'oui',
  },
  {
    id: 'peau.furoncle_complique',
    foyers: ['cutane'],
    libelle: 'Furoncle compliqué ou terrain à risque de complication ?',
    aide: 'Compliqué : anthrax, multiplication des lésions, dermohypodermite péri-lésionnelle, abcédation secondaire, fièvre. À risque : immunodépression, diabète, obésité, localisation rendant le drainage difficile (face, main, péri-orificielle), absence de réponse au traitement initial (HAS 2019).',
    options: ouiNon,
    pertinente: (r) => r('peau.forme') === 'furoncle' && r('peau.necrose') !== 'oui',
  },
  {
    id: 'peau.impetigo_grave',
    foyers: ['cutane'],
    libelle: 'Impétigo grave ?',
    aide: 'Ecthyma, surface atteinte > 2 % de la surface corporelle, plus de 6 lésions, ou extension rapide (HAS 2019).',
    options: ouiNon,
    pertinente: (r) => r('peau.forme') === 'impetigo' && r('peau.necrose') !== 'oui',
  },
  {
    id: 'peau.morsure_origine',
    foyers: ['cutane'],
    libelle: 'Origine de la morsure',
    options: [
      { v: 'animale', l: 'Animale (chien, chat…)' },
      { v: 'humaine', l: 'Humaine' },
    ],
    pertinente: (r) => r('peau.forme') === 'morsure' && r('peau.necrose') !== 'oui',
  },
  {
    id: 'peau.morsure_infectee',
    foyers: ['cutane'],
    libelle: 'Signes d\'infection de la plaie de morsure ?',
    aide: 'Dermohypodermite, écoulement purulent, lymphangite, abcès.',
    options: ouiNon,
    pertinente: (r) => r('peau.forme') === 'morsure' && r('peau.necrose') !== 'oui',
  },
  {
    id: 'peau.morsure_profonde',
    foyers: ['cutane'],
    libelle: 'Plaie de morsure profonde ?',
    aide: 'SFMU 2017 : antibiothérapie systématique pour toute plaie profonde de morsure.',
    options: ouiNon,
    pertinente: (r) => r('peau.forme') === 'morsure' && r('peau.necrose') !== 'oui' && r('peau.morsure_infectee') !== 'oui',
  },
  {
    id: 'peau.morsure_facteurs',
    foyers: ['cutane'],
    libelle: 'Situation à risque selon l\'IDSA 2014 ?',
    aide: 'Asplénie, hépatopathie avancée, œdème de la zone mordue, lésion modérée à sévère (notamment de la main ou de la face), atteinte possible du périoste ou de l\'articulation. L\'immunodépression se renseigne avec le patient.',
    options: ouiNon,
    pertinente: (r) => r('peau.forme') === 'morsure' && r('peau.necrose') !== 'oui' && r('peau.morsure_infectee') === 'non' && r('peau.morsure_profonde') === 'non',
  },
  {
    id: 'peau.pied_grade',
    foyers: ['cutane'],
    libelle: 'Grade IWGDF/IDSA de l\'infection du pied',
    aide: 'Infection = au moins 2 signes parmi : œdème ou induration, érythème > 0,5 cm autour de la plaie, douleur, chaleur, pus (SPILF 2023).',
    options: [
      { v: '1', l: 'Grade 1 : pas de signe d\'infection' },
      { v: '2', l: 'Grade 2 (léger) : peau et sous-cutané, érythème < 2 cm' },
      { v: '3', l: 'Grade 3 (modéré) : structures profondes ou érythème ≥ 2 cm, sans signe général' },
      { v: '4', l: 'Grade 4 (sévère) : au moins 2 critères de SRIS' },
    ],
    pertinente: (r) => r('peau.forme') === 'pied_diabetique',
  },
  {
    id: 'peau.pied_anciennete',
    foyers: ['cutane'],
    libelle: 'Ancienneté de la plaie',
    options: [
      { v: 'recente', l: 'Moins de 4 semaines' },
      { v: 'chronique', l: '4 semaines ou plus' },
    ],
    pertinente: (r) => r('peau.forme') === 'pied_diabetique' && r('peau.pied_grade') === '2',
  },
  {
    id: 'peau.pied_osteite',
    foyers: ['cutane'],
    libelle: 'Ostéite suspectée ?',
    aide: 'Plaie chronique de plus d\'un mois et de plus de 2 cm² et/ou profonde de plus de 3 mm, orteil « saucisse », contact osseux positif, os exposé (SPILF 2023).',
    options: ouiNon,
    pertinente: (r) => r('peau.forme') === 'pied_diabetique',
  },
];
