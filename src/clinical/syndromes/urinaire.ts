/**
 * Questions du foyer urinaire utiles à la cystite (docs/sources/recherche-cystite.md §11.2) :
 * facteurs de risque de complication non déduits de la saisie, récidive, possibilité de différer le traitement.
 * Les autres facteurs (âge, grossesse, immunodépression, insuffisance rénale) viennent de la saisie du patient.
 */
import type { Dossier } from '../../engine/etat';
import type { QuestionSyndrome } from './questions';

const ouiNon = [
  { v: 'oui', l: 'Oui' },
  { v: 'non', l: 'Non' },
];

/** Cystite possible : signes urinaires récents sans fièvre (saisis à l'étape « Faut-il traiter ? » ou au foyer). */
function cystitePossible(d: Dossier): boolean {
  return d.clinique.fievre !== 'oui';
}

export const QUESTIONS_URINAIRE: QuestionSyndrome[] = [
  {
    id: 'urinaire.pyelo',
    foyers: ['urinaire'],
    libelle: 'Douleur lombaire, frissons ou malaise ?',
    aide: 'Signes systémiques : il ne s\'agit pas d\'une cystite (EAU 2026, définition de la cystite).',
    options: ouiNon,
    pertinente: (_r, d) => cystitePossible(d),
  },
  {
    id: 'urinaire.anomalie',
    foyers: ['urinaire'],
    libelle: 'Anomalie organique ou fonctionnelle de l\'arbre urinaire ?',
    aide: 'Résidu vésical, reflux, lithiase, tumeur, acte urologique récent… Facteur de risque de complication (HAS, SPILF). Le diabète n\'en est pas un.',
    options: ouiNon,
    pertinente: (_r, d) => cystitePossible(d) && d.patient.sexe === 'femme' && d.patient.grossesse !== 'oui',
  },
  {
    id: 'urinaire.fried',
    foyers: ['urinaire'],
    libelle: 'Au moins 3 critères de fragilité de Fried ?',
    aide: 'Perte de poids involontaire, épuisement, faiblesse, marche lente, activité physique réduite. Après 65 ans, 3 critères ou plus rendent la cystite « à risque de complication ».',
    options: ouiNon,
    pertinente: (_r, d) => cystitePossible(d) && d.patient.sexe === 'femme' && d.patient.age !== undefined && d.patient.age > 65 && d.patient.age <= 75,
  },
  {
    id: 'urinaire.recidivante',
    foyers: ['urinaire'],
    libelle: 'Infections urinaires récidivantes (au moins 4 épisodes sur 12 mois) ?',
    options: ouiNon,
    pertinente: (_r, d) => cystitePossible(d) && d.patient.grossesse !== 'oui',
  },
  {
    id: 'urinaire.ir_severe',
    foyers: ['urinaire'],
    libelle: 'Insuffisance rénale sévère connue (DFG < 30) ?',
    aide: 'Utile seulement si la créatininémie n\'est pas saisie.',
    options: ouiNon,
    pertinente: (_r, d) => cystitePossible(d) && d.patient.sexe === 'femme' && d.patient.grossesse !== 'oui' && !d.patient.renal.creatinine && !d.patient.renal.dfg,
  },
  {
    id: 'urinaire.nitro_ci',
    foyers: ['urinaire'],
    libelle: 'Contre-indication à la nitrofurantoïne ?',
    aide: 'Déficit en G6PD, antécédent d\'effet indésirable sous nitrofurantoïne, traitements répétés, allergie aux nitrofuranes ou au blé (RCP, HAS).',
    options: ouiNon,
    pertinente: (_r, d) => cystitePossible(d),
  },
  {
    id: 'urinaire.differable',
    foyers: ['urinaire'],
    libelle: 'Le traitement peut-il attendre l\'antibiogramme ?',
    aide: 'Non : patiente ou patient très symptomatique, mauvaise tolérance. Concerne la cystite à risque de complication et la cystite de l\'homme.',
    options: [
      { v: 'oui', l: 'Oui, bonne tolérance' },
      { v: 'non', l: 'Non, très symptomatique' },
    ],
    pertinente: (_r, d) => cystitePossible(d) && d.patient.grossesse !== 'oui',
  },
];
