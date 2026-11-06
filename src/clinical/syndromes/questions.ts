/**
 * Questions propres à un foyer infectieux (forme clinique, lieu de prise en charge, épisode…), déclarées une fois
 * et utilisées à la fois par la saisie (affichage), le nettoyage du dossier (réponse effacée si le foyer change)
 * et les règles (lecture de la réponse). Chaque question a une option « inconnu » : une réponse absente n'est
 * jamais interprétée comme « non ».
 */
import type { FoyerId } from '../types';
import type { Dossier } from '../../engine/etat';
import { QUESTIONS_URINAIRE } from './urinaire';
import { QUESTIONS_PEAU } from './peau-tissus-mous';

export interface OptionQuestion {
  v: string;
  l: string;
}

export interface QuestionSyndrome {
  /** Identifiant stable, préfixé par le foyer (ex. « pneumonie.lieu »). */
  id: string;
  foyers: FoyerId[];
  libelle: string;
  aide?: string;
  /** Options affichées ; « inconnu » est ajouté automatiquement en dernier. */
  options: OptionQuestion[];
  /** Affichée seulement si la condition est vraie (réponses aux autres questions). */
  pertinente?: (reponse: (id: string) => string, dossier: Dossier) => boolean;
}

/** Registre des questions par foyer, complété domaine par domaine (voir ./index.ts). */
export const QUESTIONS_SYNDROME: QuestionSyndrome[] = [...QUESTIONS_URINAIRE, ...QUESTIONS_PEAU];

export function optionsAvecInconnu(q: QuestionSyndrome): OptionQuestion[] {
  return q.options.some((o) => o.v === 'inconnu') ? q.options : [...q.options, { v: 'inconnu', l: 'Inconnu' }];
}

/** Questions à afficher pour un foyer, compte tenu du dossier et des réponses déjà données. */
export function reponseDetail(dossier: Dossier, id: string): string {
  return dossier.details?.[id] ?? 'inconnu';
}

export function questionsPour(foyer: FoyerId, dossier: Dossier): QuestionSyndrome[] {
  const reponse = (id: string) => dossier.details?.[id] ?? 'inconnu';
  return QUESTIONS_SYNDROME.filter((q) => q.foyers.includes(foyer) && (!q.pertinente || q.pertinente(reponse, dossier)));
}
