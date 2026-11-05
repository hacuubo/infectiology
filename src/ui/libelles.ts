import type { FoyerId, OrganismeId, TraitementAssocie } from '../clinical/types';

export { LIBELLE_ORGANISME } from '../clinical/microbiologie/germes';

export const GROUPES_ORGANISMES: { titre: string; ids: OrganismeId[] }[] = [
  { titre: 'Bacilles à Gram négatif', ids: ['bgn_non_identifie', 'enterobacterie_non_identifiee', 'escherichia_coli', 'klebsiella_pneumoniae', 'enterobacter_cloacae', 'proteus_mirabilis', 'pseudomonas_aeruginosa'] },
  { titre: 'Staphylocoques', ids: ['cgp_non_identifie', 'staphylococcus_aureus', 'staphylocoque_coagulase_negative', 'staphylococcus_epidermidis', 'staphylococcus_lugdunensis'] },
  { titre: 'Streptocoques', ids: ['streptococcus_pneumoniae', 'streptococcus_pyogenes', 'streptococcus_agalactiae', 'streptocoque_groupe_c_g', 'streptocoque_viridans', 'streptococcus_gallolyticus'] },
  { titre: 'Entérocoques', ids: ['enterococcus_faecalis', 'enterococcus_faecium', 'enterocoque_non_identifie'] },
  { titre: 'Autre', ids: ['autre'] },
];

export const LIBELLE_FOYER: Record<FoyerId, string> = {
  inconnu: 'Inconnu / non identifié',
  urinaire: 'Urinaire (pyélonéphrite, infection urinaire masculine, sur matériel)',
  endocardite: 'Endocardite (suspectée ou confirmée)',
  catheter: 'Cathéter / matériel vasculaire',
  osteoarticulaire_materiel: 'Ostéoarticulaire sur matériel (prothèse, ostéosynthèse)',
  osteoarticulaire_sans_materiel: 'Ostéoarticulaire sans matériel',
  cutane: 'Peau et tissus mous',
  pulmonaire: 'Pulmonaire',
  digestif: 'Digestif / intra-abdominal',
  autre: 'Autre foyer',
};

export const FOYERS_ENTREE_A: FoyerId[] = ['urinaire', 'endocardite', 'catheter', 'osteoarticulaire_materiel', 'osteoarticulaire_sans_materiel', 'cutane', 'pulmonaire', 'digestif', 'inconnu'];

export const LIBELLE_TRAITEMENT: Record<TraitementAssocie, string> = {
  statine: 'Statine',
  avk: 'Antivitamine K',
  aod: 'Anticoagulant oral direct',
  serotoninergique: 'Antidépresseur sérotoninergique (ISRS, IRSNa, tramadol…)',
  qt_allongeant: 'Médicament allongeant le QT',
  methotrexate: 'Méthotrexate',
  immunosuppresseur_calcineurine: 'Ciclosporine / tacrolimus',
  diuretique: 'Diurétique',
  ains: 'AINS',
  autre_nephrotoxique: 'Autre néphrotoxique (produit de contraste récent, cisplatine…)',
  contraceptif_oral: 'Contraceptif oral',
  antiepileptique: 'Antiépileptique',
  antiretroviral: 'Antirétroviral',
  autre: 'Autre traitement à vérifier',
};

/* Libellés lisibles (accents, termes cliniques) des valeurs codées, pour le résumé patient. */
export const LIBELLE_VALEUR: Record<string, string> = {
  femme: 'femme',
  homme: 'homme',
  communautaire: 'communautaire',
  associe_aux_soins: 'associé aux soins',
  stable: 'stable',
  sepsis: 'sepsis',
  choc_septique: 'choc septique',
  inconnu: 'non renseigné',
  inconnue: 'non renseignée',
  native: 'native',
  prothese_mecanique: 'prothèse mécanique',
  prothese_biologique: 'prothèse biologique',
  tavi: 'TAVI',
  cvc: 'cathéter veineux central',
  picc: 'PICC',
  chambre_implantable: 'chambre implantable',
  catheter_dialyse: 'cathéter de dialyse',
  sonde_vesicale: 'sonde vésicale',
  sonde_jj: 'sonde JJ',
  nephrostomie: 'néphrostomie',
  autre: 'autre',
  hemodialyse_intermittente: 'hémodialyse intermittente',
  eer_continue: 'EER continue',
  dialyse_peritoneale: 'dialyse péritonéale',
  immediate: 'immédiate',
  retardee_benigne: 'retardée bénigne',
  retardee_severe: 'retardée sévère',
  intolerance_non_allergique: 'intolérance non allergique',
  negativees: 'contrôles négativés',
  persistantes: 'toujours positives',
  non_controlees: 'pas encore contrôlées',
  suspecte: 'suspecté',
  confirme: 'confirmé',
  bgn: 'BGN',
  cgp_amas: 'CGP en amas',
  cgp_chainettes: 'CGP en chaînettes',
  BLSE: 'BLSE',
  carbapenemase: 'carbapénémase',
  SARM: 'SARM',
  ERV: 'ERV',
  EPC: 'EPC',
};

export function libelle(v: string | undefined): string {
  if (v === undefined) return 'non renseigné';
  return LIBELLE_VALEUR[v] ?? v.replace(/_/g, ' ');
}
