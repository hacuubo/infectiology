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
    libelle: 'Au moins 4 épisodes de cystite sur les 12 derniers mois ?',
    options: ouiNon,
    pertinente: (_r, d) => cystitePossible(d) && d.patient.sexe === 'femme' && d.patient.grossesse !== 'oui',
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
