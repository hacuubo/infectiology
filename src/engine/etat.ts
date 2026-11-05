/**
 * État du dossier saisi (patient + prélèvements + mode d'entrée) et logique
 * d'invalidation des réponses dépendantes devenues non pertinentes.
 * Aucune donnée n'est conservée en dehors de la session du navigateur.
 */
import type { FoyerId, Patient, Prelevement } from '../clinical/types';

export type ModeEntree = 'syndrome' | 'microbiologie' | 'non_choisi';

export interface Dossier {
  entree: ModeEntree;
  /** Foyer / syndrome choisi en entrée A. */
  syndrome: FoyerId | 'non_choisi';
  patient: Patient;
  prelevements: Prelevement[];
  /** Horodatages réels saisis, pour transformer les calendriers relatifs en dates. */
  /** Option thérapeutique retenue par le prescripteur (le calendrier suit cette option). */
  optionRetenueId?: string;
  horaires: {
    maintenantISO?: string;
    premiereDoseISO?: string;
    /** Durée de perfusion prévue (min) pour les aminosides, si connue. */
    dureePerfusionMin?: number;
  };
}

export function patientParDefaut(): Patient {
  return {
    sexe: 'inconnu',
    grossesse: 'inconnu',
    allaitement: 'inconnu',
    renal: { stabilite: 'inconnu', insuffisanceRenaleAigue: 'inconnu', dialyse: 'inconnu' },
    insuffisanceHepatique: 'inconnu',
    statutAllergie: 'inconnu',
    allergies: [],
    immunodepression: 'inconnu',
    neutropenie: 'inconnu',
    traitementsAssocies: [],
    antibiotiquesRecents: [],
    antecedentsMicro: [],
    contexte: 'inconnu',
    gravite: 'inconnu',
    valve: 'inconnu',
    dispositifIntracardiaque: 'inconnu',
    protheseArticulaire: 'inconnu',
    materielVasculaire: 'inconnu',
    materielUrinaire: 'inconnu',
  };
}

export function dossierParDefaut(): Dossier {
  return {
    entree: 'non_choisi',
    syndrome: 'non_choisi',
    patient: patientParDefaut(),
    prelevements: [],
    horaires: {},
  };
}

let compteur = 0;
export function nouveauPrelevement(type: Prelevement['type'] = 'hemoculture'): Prelevement {
  compteur += 1;
  return {
    id: `prl-${Date.now().toString(36)}-${compteur}`,
    type,
    stade: 'identification',
    antibiogrammeDisponible: 'inconnu',
    foyer: 'inconnu',
    foyerStatut: 'inconnu',
    signesInfectionMateriel: 'inconnu',
    hemoc: type === 'hemoculture' ? { origine: 'inconnu', persistance: 'inconnu' } : undefined,
  };
}

/* ------------------------------------------------------------------ */
/* Pertinence des champs et invalidation                               */
/* ------------------------------------------------------------------ */

export interface Invalidation {
  champ: string;
  raison: string;
}

/**
 * Règles de pertinence : chaque entrée décrit un champ dont la réponse
 * n'a de sens que si `pertinent(d)` est vrai. Si ce n'est plus le cas,
 * `reinitialiser(d)` remet le champ à sa valeur « non renseigné ».
 * Les mêmes prédicats pilotent l'affichage progressif de l'interface.
 */
export const REGLES_PERTINENCE: {
  champ: string;
  libelle: string;
  pertinent: (d: Dossier) => boolean;
  estRenseigne: (d: Dossier) => boolean;
  reinitialiser: (d: Dossier) => void;
}[] = [
  {
    champ: 'patient.grossesse',
    libelle: 'Grossesse',
    pertinent: (d) => d.patient.sexe !== 'homme' && (d.patient.age === undefined || d.patient.age <= 55),
    estRenseigne: (d) => d.patient.grossesse !== 'inconnu',
    reinitialiser: (d) => {
      d.patient.grossesse = 'inconnu';
    },
  },
  {
    champ: 'patient.allaitement',
    libelle: 'Allaitement',
    pertinent: (d) => d.patient.sexe !== 'homme' && (d.patient.age === undefined || d.patient.age <= 55),
    estRenseigne: (d) => d.patient.allaitement !== 'inconnu',
    reinitialiser: (d) => {
      d.patient.allaitement = 'inconnu';
    },
  },
  {
    champ: 'patient.allergies',
    libelle: 'Liste des allergies',
    pertinent: (d) => d.patient.statutAllergie === 'presentes',
    estRenseigne: (d) => d.patient.allergies.length > 0,
    reinitialiser: (d) => {
      d.patient.allergies = [];
    },
  },
  {
    champ: 'patient.renal.horairesDialyse',
    libelle: 'Horaires de dialyse',
    pertinent: (d) => d.patient.renal.dialyse === 'hemodialyse_intermittente',
    estRenseigne: (d) => !!d.patient.renal.horairesDialyse,
    reinitialiser: (d) => {
      d.patient.renal.horairesDialyse = undefined;
    },
  },
  {
    champ: 'patient.renal.stabilite',
    libelle: 'Stabilité de la fonction rénale',
    pertinent: (d) => d.patient.renal.dialyse === 'aucune' || d.patient.renal.dialyse === 'inconnu',
    estRenseigne: (d) => d.patient.renal.stabilite !== 'inconnu',
    reinitialiser: (d) => {
      d.patient.renal.stabilite = 'inconnu';
    },
  },
  {
    champ: 'patient.neutropenie',
    libelle: 'Neutropénie',
    pertinent: (d) => d.patient.immunodepression !== 'non',
    estRenseigne: (d) => d.patient.neutropenie !== 'inconnu',
    reinitialiser: (d) => {
      d.patient.neutropenie = 'inconnu';
    },
  },
  {
    champ: 'patient.protheseArticulaireDetails',
    libelle: 'Détails de la prothèse articulaire',
    pertinent: (d) => d.patient.protheseArticulaire === 'oui',
    estRenseigne: (d) => !!d.patient.protheseArticulaireDetails,
    reinitialiser: (d) => {
      d.patient.protheseArticulaireDetails = undefined;
    },
  },
  {
    champ: 'patient.materielVasculaireDatePose',
    libelle: 'Date de pose du matériel vasculaire',
    pertinent: (d) => !['aucun', 'inconnu'].includes(d.patient.materielVasculaire),
    estRenseigne: (d) => !!d.patient.materielVasculaireDatePose,
    reinitialiser: (d) => {
      d.patient.materielVasculaireDatePose = undefined;
    },
  },
  {
    champ: 'patient.dispositifIntracardiaque',
    libelle: 'Dispositif intracardiaque',
    pertinent: () => true,
    estRenseigne: (d) => d.patient.dispositifIntracardiaque !== 'inconnu',
    reinitialiser: (d) => {
      d.patient.dispositifIntracardiaque = 'inconnu';
    },
  },
  {
    champ: 'horaires.premiereDoseISO',
    libelle: 'Horaire de la première dose',
    pertinent: (d) => d.entree !== 'non_choisi',
    estRenseigne: (d) => !!d.horaires.premiereDoseISO,
    reinitialiser: (d) => {
      d.horaires.premiereDoseISO = undefined;
    },
  },
];

/** Règles de pertinence propres à chaque prélèvement. */
export const REGLES_PERTINENCE_PRELEVEMENT: {
  champ: string;
  libelle: string;
  pertinent: (p: Prelevement, d: Dossier) => boolean;
  estRenseigne: (p: Prelevement) => boolean;
  reinitialiser: (p: Prelevement) => void;
}[] = [
  {
    champ: 'examenDirect',
    libelle: 'Examen direct',
    pertinent: (p) => p.stade === 'examen_direct',
    estRenseigne: (p) => p.examenDirect !== undefined,
    reinitialiser: (p) => {
      p.examenDirect = undefined;
    },
  },
  {
    champ: 'organisme',
    libelle: 'Organisme identifié',
    pertinent: (p) => p.stade !== 'examen_direct',
    estRenseigne: (p) => p.organisme !== undefined,
    reinitialiser: (p) => {
      p.organisme = undefined;
      p.organismeLibre = undefined;
    },
  },
  {
    champ: 'antibiogramme',
    libelle: 'Antibiogramme',
    pertinent: (p) => p.stade === 'antibiogramme',
    estRenseigne: (p) => (p.antibiogramme?.length ?? 0) > 0 || (p.mecanismes?.length ?? 0) > 0,
    reinitialiser: (p) => {
      p.antibiogramme = undefined;
      p.mecanismes = undefined;
      p.referentiel = undefined;
      p.antibiogrammeDisponible = 'inconnu';
    },
  },
  {
    champ: 'hemoc',
    libelle: 'Détails des hémocultures',
    pertinent: (p) => p.type === 'hemoculture',
    estRenseigne: (p) => p.hemoc !== undefined && (p.hemoc.origine !== 'inconnu' || p.hemoc.persistance !== 'inconnu' || p.hemoc.nbSeriesPositives !== undefined),
    reinitialiser: (p) => {
      p.hemoc = undefined;
    },
  },
  {
    champ: 'hemoc.delaiPositiviteDifferentielHeures',
    libelle: 'Délai de positivité différentiel',
    pertinent: (p, d) => p.type === 'hemoculture' && p.hemoc?.origine === 'les_deux' && !['aucun'].includes(d.patient.materielVasculaire),
    estRenseigne: (p) => p.hemoc?.delaiPositiviteDifferentielHeures !== undefined,
    reinitialiser: (p) => {
      if (p.hemoc) p.hemoc.delaiPositiviteDifferentielHeures = undefined;
    },
  },
  {
    champ: 'hemoc.dateNegativationISO',
    libelle: 'Date de négativation des hémocultures',
    pertinent: (p) => p.type === 'hemoculture' && p.hemoc?.persistance === 'negativees',
    estRenseigne: (p) => !!p.hemoc?.dateNegativationISO,
    reinitialiser: (p) => {
      if (p.hemoc) p.hemoc.dateNegativationISO = undefined;
    },
  },
  {
    champ: 'signesInfectionMateriel',
    libelle: "Signes d'infection sur matériel",
    pertinent: (_p, d) =>
      d.patient.protheseArticulaire === 'oui' ||
      !['aucun', 'inconnu'].includes(d.patient.materielVasculaire) ||
      !['aucun', 'inconnu'].includes(d.patient.materielUrinaire) ||
      d.patient.dispositifIntracardiaque === 'oui' ||
      ['prothese_mecanique', 'prothese_biologique', 'tavi'].includes(d.patient.valve),
    estRenseigne: (p) => p.signesInfectionMateriel !== 'inconnu',
    reinitialiser: (p) => {
      p.signesInfectionMateriel = 'inconnu';
    },
  },
];

/**
 * Nettoie le dossier : toute réponse renseignée sur un champ devenu non
 * pertinent est remise à « non renseigné ». Retourne la liste des invalidations
 * pour information de l'utilisateur. Déterministe et idempotent.
 */
export function nettoyerDossier(d: Dossier): Invalidation[] {
  const invalidations: Invalidation[] = [];
  for (const r of REGLES_PERTINENCE) {
    if (!r.pertinent(d) && r.estRenseigne(d)) {
      r.reinitialiser(d);
      invalidations.push({ champ: r.champ, raison: `« ${r.libelle} » n'est plus pertinent avec les réponses actuelles : réponse effacée.` });
    }
  }
  for (const p of d.prelevements) {
    for (const r of REGLES_PERTINENCE_PRELEVEMENT) {
      if (!r.pertinent(p, d) && r.estRenseigne(p)) {
        r.reinitialiser(p);
        invalidations.push({ champ: `${p.id}.${r.champ}`, raison: `« ${r.libelle} » n'est plus pertinent pour ce prélèvement : réponse effacée.` });
      }
    }
    if (p.type === 'hemoculture' && !p.hemoc) p.hemoc = { origine: 'inconnu', persistance: 'inconnu' };
  }
  // Un dossier en entrée « microbiologie » sans prélèvement n'a pas de sens ; on n'en crée pas d'office ici (l'interface le fait).
  return invalidations;
}

export function clonerDossier(d: Dossier): Dossier {
  return JSON.parse(JSON.stringify(d)) as Dossier;
}
