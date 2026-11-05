/**
 * Germes : libellés et familles. Une règle d'une espèce n'est jamais généralisée
 * à tout un genre : chaque famille ci-dessous porte ses propres questions et règles.
 */
import type { OrganismeId } from '../types';

export const LIBELLE_ORGANISME: Record<OrganismeId, string> = {
  bgn_non_identifie: 'Bacille à Gram négatif non identifié',
  enterobacterie_non_identifiee: 'Entérobactérie (espèce non précisée)',
  escherichia_coli: 'Escherichia coli',
  klebsiella_pneumoniae: 'Klebsiella pneumoniae',
  enterobacter_cloacae: 'Enterobacter cloacae complex',
  proteus_mirabilis: 'Proteus mirabilis',
  pseudomonas_aeruginosa: 'Pseudomonas aeruginosa',
  cgp_non_identifie: 'Cocci à Gram positif non identifié',
  staphylococcus_aureus: 'Staphylococcus aureus',
  staphylocoque_coagulase_negative: 'Staphylocoque à coagulase négative (espèce non précisée)',
  staphylococcus_epidermidis: 'Staphylococcus epidermidis',
  staphylococcus_lugdunensis: 'Staphylococcus lugdunensis',
  streptococcus_pneumoniae: 'Streptococcus pneumoniae',
  streptococcus_pyogenes: 'Streptococcus pyogenes (groupe A)',
  streptococcus_agalactiae: 'Streptococcus agalactiae (groupe B)',
  streptocoque_groupe_c_g: 'Streptocoque des groupes C/G (S. dysgalactiae)',
  streptocoque_viridans: 'Streptocoque du groupe viridans (oraux)',
  streptococcus_gallolyticus: 'Streptococcus gallolyticus (ex-bovis)',
  enterococcus_faecalis: 'Enterococcus faecalis',
  enterococcus_faecium: 'Enterococcus faecium',
  enterocoque_non_identifie: 'Entérocoque (espèce non précisée)',
  autre: 'Autre organisme',
};

export type FamilleGerme =
  | 'enterobacterale'
  | 'enterobacterale_groupe3'
  | 'pseudomonas'
  | 'bgn_non_identifie'
  | 's_aureus'
  | 'scn'
  | 's_lugdunensis'
  | 'strepto_abcg'
  | 'strepto_pneumoniae'
  | 'strepto_oral'
  | 'enterocoque'
  | 'cgp_non_identifie'
  | 'autre';

const FAMILLE: Record<OrganismeId, FamilleGerme> = {
  bgn_non_identifie: 'bgn_non_identifie',
  enterobacterie_non_identifiee: 'enterobacterale',
  escherichia_coli: 'enterobacterale',
  klebsiella_pneumoniae: 'enterobacterale',
  proteus_mirabilis: 'enterobacterale',
  // Groupe 3 du CA-SFM (céphalosporinase chromosomique inductible) : C. freundii, E. cloacae complex, K. aerogenes, S. marcescens…
  enterobacter_cloacae: 'enterobacterale_groupe3',
  pseudomonas_aeruginosa: 'pseudomonas',
  cgp_non_identifie: 'cgp_non_identifie',
  staphylococcus_aureus: 's_aureus',
  staphylocoque_coagulase_negative: 'scn',
  staphylococcus_epidermidis: 'scn',
  staphylococcus_lugdunensis: 's_lugdunensis',
  streptococcus_pneumoniae: 'strepto_pneumoniae',
  streptococcus_pyogenes: 'strepto_abcg',
  streptococcus_agalactiae: 'strepto_abcg',
  streptocoque_groupe_c_g: 'strepto_abcg',
  streptocoque_viridans: 'strepto_oral',
  streptococcus_gallolyticus: 'strepto_oral',
  enterococcus_faecalis: 'enterocoque',
  enterococcus_faecium: 'enterocoque',
  enterocoque_non_identifie: 'enterocoque',
  autre: 'autre',
};

export function familleDe(org: OrganismeId | undefined): FamilleGerme | undefined {
  return org ? FAMILLE[org] : undefined;
}

export function libelleGerme(org: OrganismeId | undefined, libre?: string): string {
  if (!org) return 'germe non identifié';
  if (org === 'autre') return libre ? libre : 'autre organisme';
  return LIBELLE_ORGANISME[org];
}
