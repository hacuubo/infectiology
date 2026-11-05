import type { DecisionIndication } from '../clinical/types';

export const LIBELLE_DECISION_COURT: Record<DecisionIndication, string> = {
  traiter: 'traitement indiqué',
  urgence: 'urgence',
  ne_pas_traiter: 'pas d’antibiothérapie indiquée',
  informations_insuffisantes: 'informations insuffisantes',
  attendre_resultat: 'attendre un résultat',
};
