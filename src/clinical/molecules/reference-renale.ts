/**
 * Grandeur exigée par la référence posologique de chaque molécule pour ses paliers d'adaptation rénale :
 * clairance de la créatinine ou DFG, unité (mL/min ou mL/min/1,73 m²) et formule quand la référence la cite.
 * Lue dans les RCP (docs/sources/recherche-pharmacologie.md, partie 3) : une seule valeur intitulée « DFG »
 * n'est jamais appliquée indistinctement à toutes les molécules.
 */
import type { SourceRef } from '../types';
import { S } from './base';

export interface ReferenceRenale {
  /** Grandeur dans laquelle la référence exprime ses paliers. */
  grandeur: 'clairance_creatinine' | 'dfg';
  /** Unité des paliers. */
  unite: 'mL/min' | 'mL/min/1,73 m²';
  /** Formule citée par la référence elle-même (seulement si elle la cite). */
  formuleCitee?: 'cockcroft_gault';
  /** Passage de la référence qui fixe la grandeur, l'unité ou la formule. */
  sources: SourceRef[];
}

const clcr = (rcp: string, extrait: string): ReferenceRenale => ({
  grandeur: 'clairance_creatinine',
  unite: 'mL/min',
  sources: [S(rcp, '§4.2', extrait, 'adaptation_renale')],
});

export const REFERENCE_RENALE: Record<string, ReferenceRenale> = {
  vancomycine: {
    grandeur: 'clairance_creatinine',
    unite: 'mL/min',
    formuleCitee: 'cockcroft_gault',
    sources: [S('RCP-vancomycine', '§4.2', 'Hommes : [poids (kg) x [140 - âge (ans)]] / [72 x créatinine plasmatique (mg/dl)]', 'adaptation_renale')],
  },
  cefepime: {
    grandeur: 'clairance_creatinine',
    unite: 'mL/min',
    formuleCitee: 'cockcroft_gault',
    sources: [S('RCP-cefepime', '§4.2', "l'équation de Cockcroft peut être utilisée pour estimer la clairance à la créatinine", 'adaptation_renale')],
  },
  amoxicilline: { grandeur: 'dfg', unite: 'mL/min', sources: [S('RCP-amoxicilline', '§4.2 (tableau)', 'tableau en DFG (mL/min) : > 30 : pas d’adaptation ; 10-30 ; < 10', 'adaptation_renale')] },
  ertapeneme: { grandeur: 'clairance_creatinine', unite: 'mL/min/1,73 m²', sources: [S('RCP-ertapeneme', '§4.2', 'Chez les patients dont la clairance de la créatinine est > 30 ml/min/1,73 m² […] aucune adaptation posologique n’est nécessaire', 'adaptation_renale')] },
  ciprofloxacine: { grandeur: 'clairance_creatinine', unite: 'mL/min/1,73 m²', sources: [S('RCP-ciprofloxacine', '§4.2', 'ClCr 30-60 mL/min/1,73 m² : 200-400 mg toutes les 12 h', 'adaptation_renale')] },
  gentamicine: clcr('RCP-gentamicine', 'ClCr 90-60 ml/min : 24 h ; 60-40 : 36 h ; 40-20 : 48 h'),
  amikacine: clcr('RCP-amikacine', 'IR (ClCr < 50 mL/min)'),
  daptomycine: clcr('RCP-daptomycine', 'ClCr < 30 mL/min : 4 ou 6 mg/kg toutes les 48 heures'),
  cefotaxime: clcr('RCP-cefotaxime', 'ClCr < 10 mL/min'),
  ceftriaxone: clcr('RCP-ceftriaxone', 'ClCr < 10 mL/min : ne pas dépasser 2 g par jour'),
  cloxacilline: clcr('RCP-cloxacilline', 'ClCr > 30 ml/min pas d’adaptation'),
  cefazoline: clcr('RCP-cefazoline', 'tableau IR par clairance de la créatinine (≥ 55 ; 35-54 ; 11-34 ; ≤ 10)'),
  amoxicilline_clavulanate: clcr('RCP-amoxicilline-clavulanate', 'ClCr > 30 : pas d’adaptation ; 10-30 ; < 10'),
  piperacilline_tazobactam: clcr('RCP-piperacilline-tazobactam', 'ClCr > 40 : pas d’ajustement ; 20-40 ; < 20'),
  temocilline: clcr('RCP-temocilline', '> 60 mL/min : 2 g/12 h ; 30-10 : 1 g/24 h'),
  cefoxitine: clcr('RCP-cefoxitine', 'tableau IR par clairance de la créatinine (50-30 ; 29-10 ; 9-5 ; < 5)'),
  meropeneme: clcr('RCP-meropeneme', 'lorsque la clairance de la créatinine est inférieure à 51 mL/min'),
  imipeneme: clcr('RCP-imipeneme', 'tableau 1 selon la clairance de la créatinine (≥ 90 ; 60-89 ; 30-59 ; 15-29)'),
  aztreonam: clcr('RCP-aztreonam', '≥ 30 mL/min dose normale ; 10-30 ; < 10'),
  cefixime: clcr('RCP-cefixime', 'Lorsque les valeurs de la clairance de la créatinine sont ≤ 20 ml/min'),
  levofloxacine: clcr('RCP-levofloxacine', 'tableau par ClCr 50-20, 19-10, < 10'),
  cotrimoxazole: clcr('RCP-cotrimoxazole', 'Clairance de la créatinine > 30 ml/min : posologie normale'),
  rifampicine: clcr('RCP-rifampicine', 'IR 60-30 ml/min : rifampicinémie « au 2ème ou 3ème jour du traitement »'),
};

/** Référence par défaut (molécule absente du tableau) : clairance en mL/min, méthode non précisée. */
export function referenceRenale(moleculeId: string): ReferenceRenale {
  return REFERENCE_RENALE[moleculeId] ?? { grandeur: 'clairance_creatinine', unite: 'mL/min', sources: [] };
}
