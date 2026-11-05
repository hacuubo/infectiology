/**
 * Contexte de décision mis en cache par dossier : l'état React étant remplacé à chaque modification,
 * un même objet dossier donne toujours le même contexte (évite de le recalculer pour chaque isolat).
 */
import type { Dossier } from '../engine/etat';
import { construireContexte, type ContexteDecision } from '../engine/contexte';

const cache = new WeakMap<Dossier, ContexteDecision>();

export function contexteUI(d: Dossier): ContexteDecision {
  let ctx = cache.get(d);
  if (!ctx) {
    ctx = construireContexte(d);
    cache.set(d, ctx);
  }
  return ctx;
}
