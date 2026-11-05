/**
 * Patients FICTIFS de démonstration et d'acceptation. Aucune donnée réelle.
 */
import { dossierParDefaut, type Dossier } from '../engine/etat';
import type { Patient, Prelevement } from '../clinical/types';

export interface CasFictif {
  id: string;
  titre: string;
  description: string;
  dossier: Dossier;
}

function patient(p: Partial<Patient>): Patient {
  const base = dossierParDefaut().patient;
  return { ...base, ...p, renal: { ...base.renal, ...(p.renal ?? {}) } };
}

type HemocPartiel = Partial<NonNullable<Prelevement['hemoc']>>;
function hemoc(p: Omit<Partial<Prelevement>, 'hemoc'> & { hemoc?: HemocPartiel }): Prelevement {
  return {
    id: 'hc-1',
    type: 'hemoculture',
    stade: 'identification',
    antibiogrammeDisponible: 'non',
    foyer: 'inconnu',
    foyerStatut: 'inconnu',
    signesInfectionMateriel: 'inconnu',
    ...p,
    hemoc: { origine: 'peripherique', persistance: 'non_controlees', nbSeriesPrelevees: 2, nbSeriesPositives: 2, ...(p.hemoc ?? {}) },
  };
}

function dossier(d: Partial<Dossier>): Dossier {
  return { ...dossierParDefaut(), entree: 'microbiologie', ...d };
}

const patiente90 = patient({
  age: 90,
  sexe: 'femme',
  grossesse: 'non',
  allaitement: 'non',
  renal: { creatinine: { valeur: 180, unite: 'umol/L', date: '2026-11-04' }, stabilite: 'instable', insuffisanceRenaleAigue: 'oui', dialyse: 'aucune' },
});

/** Cas 1 : 90 ans, fièvre, insuffisance rénale, BGN non identifié — données volontairement incomplètes. */
export const CAS_BGN_90 = dossier({
  patient: patiente90,
  prelevements: [hemoc({ stade: 'examen_direct', examenDirect: 'bgn', organisme: undefined })],
});

/** Cas 2 : même patiente, foyer urinaire confirmé, E. coli avec antibiogramme, sepsis. */
export const CAS_BGN_90_URINAIRE = dossier({
  patient: { ...patiente90, poidsKg: 52, tailleCm: 158, statutAllergie: 'aucune', contexte: 'communautaire', gravite: 'sepsis', valve: 'native', dispositifIntracardiaque: 'non', protheseArticulaire: 'non', materielVasculaire: 'aucun', materielUrinaire: 'aucun', immunodepression: 'non', insuffisanceHepatique: 'non' },
  prelevements: [
    hemoc({
      stade: 'antibiogramme',
      organisme: 'escherichia_coli',
      antibiogrammeDisponible: 'oui',
      referentiel: 'CA-SFM/EUCAST 2026 V1.0',
      antibiogramme: [
        { dci: 'amoxicilline', categorie: 'R' },
        { dci: 'amoxicilline_clavulanate', categorie: 'S' },
        { dci: 'ceftriaxone', categorie: 'S' },
        { dci: 'cefotaxime', categorie: 'S' },
        { dci: 'ciprofloxacine', categorie: 'S' },
        { dci: 'cotrimoxazole', categorie: 'S' },
        { dci: 'gentamicine', categorie: 'S' },
        { dci: 'amikacine', categorie: 'S' },
      ],
      foyer: 'urinaire',
      foyerStatut: 'confirme',
    }),
  ],
});

/** Cas 3 : même patiente que le cas 1, avec prothèse valvulaire biologique. */
export const CAS_BGN_90_VALVE = dossier({
  patient: { ...patiente90, valve: 'prothese_biologique' },
  prelevements: [hemoc({ stade: 'examen_direct', examenDirect: 'bgn' })],
});

const adulteStable = patient({ age: 64, sexe: 'homme', poidsKg: 80, tailleCm: 178, statutAllergie: 'aucune', contexte: 'associe_aux_soins', gravite: 'stable', valve: 'native', dispositifIntracardiaque: 'non', protheseArticulaire: 'non', materielVasculaire: 'aucun', materielUrinaire: 'aucun', immunodepression: 'non', renal: { creatinine: { valeur: 90, unite: 'umol/L' }, stabilite: 'stable', insuffisanceRenaleAigue: 'non', dialyse: 'aucune' } });

/** Cas 4 : S. epidermidis dans 1 flacon sur 2 séries, sans matériel. */
export const CAS_SCN_UN_FLACON = dossier({
  patient: adulteStable,
  prelevements: [hemoc({ organisme: 'staphylococcus_epidermidis', hemoc: { nbSeriesPrelevees: 2, nbSeriesPositives: 1, nbFlaconsPositifs: 1 } })],
});

/** Cas 5 : S. epidermidis dans 2 séries sur 2, PICC et prothèse de hanche. */
export const CAS_SCN_DEUX_SERIES_MATERIEL = dossier({
  patient: { ...adulteStable, materielVasculaire: 'picc', protheseArticulaire: 'oui', protheseArticulaireDetails: { site: 'hanche droite', datePose: '2025-03-01' } },
  prelevements: [hemoc({ organisme: 'staphylococcus_epidermidis', hemoc: { nbSeriesPrelevees: 2, nbSeriesPositives: 2, nbFlaconsPositifs: 3, origine: 'les_deux', delaiPositiviteDifferentielHeures: 3 }, foyer: 'catheter', foyerStatut: 'suspecte' })],
});

/** Cas 6 : bactériémie à S. aureus sensible à la méticilline, communautaire. */
export const CAS_SAB_SASM = dossier({
  patient: { ...adulteStable, contexte: 'communautaire' },
  prelevements: [hemoc({ stade: 'antibiogramme', organisme: 'staphylococcus_aureus', antibiogramme: [{ dci: 'oxacilline', categorie: 'S' }, { dci: 'vancomycine', categorie: 'S' }], hemoc: { datePremierePositiveISO: '2026-11-03T08:00' } })],
  horaires: { premiereDoseISO: '2026-11-03T10:00' },
});

/** Cas 7 : même S. aureus, allergie retardée sévère (DRESS) à l'amoxicilline. */
export const CAS_SAB_ALLERGIE_SEVERE = dossier({
  ...CAS_SAB_SASM,
  patient: { ...CAS_SAB_SASM.patient, statutAllergie: 'presentes', allergies: [{ molecule: 'amoxicilline', reaction: 'retardee_severe', gravite: 'severe', delai: 'DRESS en 2019' }] },
});

/** Cas 8 : même S. aureus, allergie immédiate grave (anaphylaxie) à l'amoxicilline. */
export const CAS_SAB_ALLERGIE_IMMEDIATE = dossier({
  ...CAS_SAB_SASM,
  patient: { ...CAS_SAB_SASM.patient, statutAllergie: 'presentes', allergies: [{ molecule: 'amoxicilline', reaction: 'immediate', gravite: 'severe' }] },
});

/** Cas 9 : SARM chez un patient hémodialysé, poids absent. */
export const CAS_SARM_HEMODIALYSE = dossier({
  patient: { ...adulteStable, poidsKg: undefined, renal: { stabilite: 'inconnu', insuffisanceRenaleAigue: 'non', dialyse: 'hemodialyse_intermittente', horairesDialyse: undefined } },
  prelevements: [hemoc({ stade: 'antibiogramme', organisme: 'staphylococcus_aureus', antibiogramme: [{ dci: 'oxacilline', categorie: 'R' }, { dci: 'vancomycine', categorie: 'S' }], mecanismes: ['SARM'] })],
});

/** Cas 10 : PNA masculine, E. coli rendu I à la ceftriaxone. */
export const CAS_ECOLI_I = dossier({
  patient: { ...adulteStable, contexte: 'communautaire', formeIUMasculine: 'pna' },
  prelevements: [hemoc({ stade: 'antibiogramme', organisme: 'escherichia_coli', antibiogramme: [{ dci: 'amoxicilline', categorie: 'R' }, { dci: 'ceftriaxone', categorie: 'I' }, { dci: 'ciprofloxacine', categorie: 'R' }, { dci: 'cotrimoxazole', categorie: 'R' }], foyer: 'urinaire', foyerStatut: 'confirme' })],
});

/** Cas 11 : S. aureus avec hémocultures persistantes et date de négativation inconnue. */
export const CAS_SAB_PERSISTANT = dossier({
  ...CAS_SAB_SASM,
  prelevements: [hemoc({ stade: 'antibiogramme', organisme: 'staphylococcus_aureus', antibiogramme: [{ dci: 'oxacilline', categorie: 'S' }], hemoc: { persistance: 'persistantes' } })],
});

/** Cas 12 : endocardite à E. faecalis sur prothèse. */
export const CAS_EI_FAECALIS = dossier({
  patient: { ...adulteStable, valve: 'prothese_mecanique' },
  prelevements: [hemoc({ stade: 'antibiogramme', organisme: 'enterococcus_faecalis', antibiogramme: [{ dci: 'amoxicilline', categorie: 'S' }], foyer: 'endocardite', foyerStatut: 'confirme' })],
});

/** Cas 13 : BLSE urinaire avec amikacine, sepsis, insuffisance rénale aiguë, horaires de première dose connus. */
export const CAS_BLSE_AMIKACINE = dossier({
  patient: { ...patiente90, poidsKg: 60, tailleCm: 160, statutAllergie: 'aucune', contexte: 'communautaire', gravite: 'sepsis', valve: 'native', dispositifIntracardiaque: 'non', protheseArticulaire: 'non', materielVasculaire: 'aucun', materielUrinaire: 'aucun', antecedentsMicro: [{ organisme: 'E. coli', resistance: 'BLSE', date: '2026-08-01' }] },
  prelevements: [hemoc({ stade: 'identification', organisme: 'escherichia_coli', foyer: 'urinaire', foyerStatut: 'confirme' })],
  horaires: { premiereDoseISO: '2026-11-04T09:00', dureePerfusionMin: 30 },
});

export const CAS_FICTIFS: CasFictif[] = [
  { id: 'bgn-90', titre: '1. 90 ans, fièvre, IRA, BGN non identifié (données incomplètes)', description: 'Doit conduire à des questions et à des options conditionnelles, sans prescription définitive.', dossier: CAS_BGN_90 },
  { id: 'bgn-90-urinaire', titre: '2. Même patiente : foyer urinaire, E. coli et antibiogramme, sepsis', description: 'IU fébrile documentée chez une patiente âgée avec IRA.', dossier: CAS_BGN_90_URINAIRE },
  { id: 'bgn-90-valve', titre: '3. Même patiente avec prothèse valvulaire biologique', description: 'BGN et matériel intracardiaque.', dossier: CAS_BGN_90_VALVE },
  { id: 'scn-1', titre: '4. S. epidermidis : 1 flacon, sans matériel', description: 'Contamination possible : contrôle avant tout traitement.', dossier: CAS_SCN_UN_FLACON },
  { id: 'scn-2', titre: '5. S. epidermidis : 2 séries, PICC et prothèse de hanche', description: 'Bactériémie vraie probable sur matériel.', dossier: CAS_SCN_DEUX_SERIES_MATERIEL },
  { id: 'sab', titre: '6. S. aureus sensible à la méticilline', description: 'Stratification, hémocultures à 48 h, ETT, 14 j dès la négativation.', dossier: CAS_SAB_SASM },
  { id: 'sab-dress', titre: '7. S. aureus + allergie retardée sévère (DRESS)', description: 'Toutes les bêta-lactamines évitées.', dossier: CAS_SAB_ALLERGIE_SEVERE },
  { id: 'sab-anaphylaxie', titre: '8. S. aureus + allergie immédiate grave', description: 'Pénicillines évitées ; céphalosporines sous réserve.', dossier: CAS_SAB_ALLERGIE_IMMEDIATE },
  { id: 'sarm-hd', titre: '9. SARM, hémodialyse, poids absent', description: 'Dose pondérale non calculée ; vancomycine pré-dialyse.', dossier: CAS_SARM_HEMODIALYSE },
  { id: 'ecoli-i', titre: '10. E. coli catégorie I à la ceftriaxone (PNA masculine)', description: 'Forte posologie retenue.', dossier: CAS_ECOLI_I },
  { id: 'sab-persistant', titre: '11. S. aureus, hémocultures persistantes', description: 'Risque accru ; foyer profond.', dossier: CAS_SAB_PERSISTANT },
  { id: 'ei-faecalis', titre: '12. Endocardite à E. faecalis sur prothèse mécanique', description: 'Amoxicilline + ceftriaxone.', dossier: CAS_EI_FAECALIS },
  { id: 'blse-amk', titre: '13. 90 ans, BLSE urinaire, sepsis : amikacine et calendrier du pic', description: 'Horaires connus : calendrier daté.', dossier: CAS_BLSE_AMIKACINE },
];
