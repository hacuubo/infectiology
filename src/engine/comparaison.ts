/**
 * Comparaison de deux plans successifs : signale les modifications de la saisie qui changent la
 * proposition thérapeutique (décision, options, doses, adaptations rénales, surveillance).
 * Déterministe : ne compare que des champs produits par le moteur.
 */
import type { Plan } from '../clinical/types';
import { LIBELLE_DECISION_COURT } from './libelles-moteur';

function cleOption(o: Plan['options'][number]) {
  return o.id;
}

export function comparerPlans(avant: Plan | undefined, apres: Plan): string[] {
  if (!avant) return [];
  const res: string[] = [];
  const dA = avant.indication?.decision;
  const dB = apres.indication?.decision;
  if (dA !== dB) res.push(`Décision : ${dA ? LIBELLE_DECISION_COURT[dA] : 'non établie'} → ${dB ? LIBELLE_DECISION_COURT[dB] : 'non établie'}.`);
  const parId = new Map(avant.options.map((o) => [cleOption(o), o]));
  const idsB = new Set(apres.options.map(cleOption));
  for (const o of avant.options) if (!idsB.has(cleOption(o))) res.push(`Option retirée : ${o.libelle}.`);
  for (const o of apres.options) {
    const a = parId.get(cleOption(o));
    if (!a) {
      res.push(`Nouvelle option : ${o.libelle}.`);
      continue;
    }
    if (a.rang !== o.rang) res.push(`${o.libelle} : rang ${a.rang.replace('_', ' ')} → ${o.rang.replace('_', ' ')}.`);
    for (const p of o.prescriptions) {
      const pa = a.prescriptions.find((x) => x.moleculeId === p.moleculeId);
      if (!pa) continue;
      if (pa.doseAffichee !== p.doseAffichee) res.push(`${p.dci} : dose modifiée (${p.doseAffichee}).`);
      const adA = pa.adaptations.join(' | ');
      const adB = p.adaptations.join(' | ');
      if (adA !== adB) res.push(`${p.dci} : adaptation rénale modifiée — ${(p.adaptations[0] ?? 'aucune').replace(/\.+$/, '')}.`);
      if (pa.surveillance.length !== p.surveillance.length) res.push(`${p.dci} : surveillance modifiée (${pa.surveillance.length} → ${p.surveillance.length} élément(s)).`);
    }
  }
  if (avant.sortie.traitement !== apres.sortie.traitement) res.push(`Proposition : ${avant.sortie.traitement} → ${apres.sortie.traitement}.`);
  return [...new Set(res)];
}
