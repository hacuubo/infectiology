/**
 * État du dossier saisi (patient + prélèvements + mode d'entrée) et logique
 * d'invalidation des réponses dépendantes devenues non pertinentes.
 * Aucune donnée n'est conservée en dehors de la session du navigateur.
 */
import type { Clinique, DonneesIsolat, FoyerId, Isolat, OrganismeId, Patient, Prelevement } from '../clinical/types';
import { QUESTIONS_SYNDROME, questionsPour } from '../clinical/syndromes/questions';

export type ModeEntree = 'syndrome' | 'microbiologie' | 'non_choisi';

export interface Dossier {
  entree: ModeEntree;
  /** Foyer / syndrome choisi en entrée A. */
  syndrome: FoyerId | 'non_choisi';
  patient: Patient;
  /** Éléments cliniques de l'épisode (indication de traitement). */
  clinique: Clinique;
  prelevements: Prelevement[];
  /** Réponses aux questions propres au foyer (src/clinical/syndromes), par identifiant de question. */
  details?: Record<string, string>;
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
    sexe: 'inconnu', // aucun choix présélectionné : le sexe manquant reste signalé
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

export function cliniqueParDefaut(): Clinique {
  return { fievre: 'inconnu', signesUrinaires: 'inconnu', signesNonSpecifiques: 'inconnu', autreFoyer: 'non_recherche', gesteUrologique: 'inconnu', signesInfectionLocale: 'inconnu' };
}

const LIBELLE_CLINIQUE: Record<keyof Clinique, string> = {
  fievre: 'Fièvre',
  signesUrinaires: 'Signes urinaires',
  signesNonSpecifiques: 'Signes non spécifiques',
  autreFoyer: 'Autre foyer pouvant expliquer les signes',
  gesteUrologique: 'Geste urologique prévu',
  signesInfectionLocale: 'Signes cliniques d’infection de la plaie',
};

const DISPOSITIFS_URINAIRES = ['sonde_vesicale', 'sonde_jj', 'nephrostomie', 'autre'];

/** Questions cliniques utiles à la décision d'indication : posées seulement si elles peuvent la changer. */
export function pertinenceClinique(d: Dossier): Record<keyof Clinique, boolean> {
  const urine = d.prelevements.some((x) => x.type === 'urine');
  const superficiel = d.prelevements.some((x) => x.type === 'superficiel');
  const c = d.clinique ?? cliniqueParDefaut();
  const sonde = DISPOSITIFS_URINAIRES.includes(d.patient.materielUrinaire);
  const grave = d.patient.gravite === 'sepsis' || d.patient.gravite === 'choc_septique';
  return {
    fievre: urine,
    signesUrinaires: urine,
    signesNonSpecifiques: urine,
    autreFoyer: urine && (c.fievre === 'oui' || c.signesNonSpecifiques === 'oui' || (grave && sonde)),
    gesteUrologique: urine,
    signesInfectionLocale: superficiel,
  };
}

export function dossierParDefaut(): Dossier {
  return {
    entree: 'non_choisi',
    syndrome: 'non_choisi',
    patient: patientParDefaut(),
    clinique: cliniqueParDefaut(),
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
    urine: type === 'urine' ? { motif: 'inconnu', recueil: 'inconnu', nbEspeces: 'inconnu' } : undefined,
  };
}

export function nouvelIsolat(): Isolat {
  compteur += 1;
  return { id: `iso-${Date.now().toString(36)}-${compteur}` };
}

/** Isolats d'un prélèvement : le germe principal (porté par le prélèvement) puis les germes supplémentaires. */
export function isolatsDe(p: Prelevement): (DonneesIsolat & { id: string })[] {
  return [p, ...(p.isolatsSupplementaires ?? [])];
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
    champ: 'patient.formeIUMasculine',
    libelle: 'Forme de l\'infection urinaire masculine',
    pertinent: (d) => d.patient.sexe === 'homme',
    estRenseigne: (d) => (d.patient.formeIUMasculine ?? 'inconnu') !== 'inconnu',
    reinitialiser: (d) => {
      d.patient.formeIUMasculine = undefined;
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
  ...(['fievre', 'signesUrinaires', 'signesNonSpecifiques', 'autreFoyer', 'gesteUrologique', 'signesInfectionLocale'] as const).map((k) => ({
    champ: `clinique.${k}`,
    libelle: LIBELLE_CLINIQUE[k],
    pertinent: (d: Dossier) => pertinenceClinique(d)[k],
    estRenseigne: (d: Dossier) => d.clinique !== undefined && d.clinique[k] !== cliniqueParDefaut()[k],
    reinitialiser: (d: Dossier) => {
      (d.clinique as unknown as Record<string, string>)[k] = cliniqueParDefaut()[k];
    },
  })),
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
    estRenseigne: (p) => isolatsDe(p).some((i) => (i.antibiogramme?.length ?? 0) > 0 || Object.keys(i.phenotypes ?? {}).length > 0),
    reinitialiser: (p) => {
      for (const i of isolatsDe(p)) {
        i.antibiogramme = undefined;
        i.phenotypes = undefined;
        i.antibiogrammePour = undefined;
      }
      p.referentiel = undefined;
      p.antibiogrammeDisponible = 'inconnu';
    },
  },
  {
    champ: 'urine',
    libelle: "Contexte de l'ECBU",
    pertinent: (p) => p.type === 'urine',
    estRenseigne: (p) => p.urine !== undefined && (p.urine.motif !== 'inconnu' || p.urine.recueil !== 'inconnu' || p.urine.nbEspeces !== 'inconnu'),
    reinitialiser: (p) => {
      p.urine = undefined;
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
/** Identification précisée pour le même isolat (ex. « entérobactérie non précisée » → E. coli) : les résultats restent valables. */
const PRECISIONS: Partial<Record<OrganismeId, OrganismeId[]>> = {
  bgn_non_identifie: ['enterobacterie_non_identifiee', 'escherichia_coli', 'klebsiella_pneumoniae', 'enterobacter_cloacae', 'proteus_mirabilis', 'pseudomonas_aeruginosa'],
  enterobacterie_non_identifiee: ['escherichia_coli', 'klebsiella_pneumoniae', 'enterobacter_cloacae', 'proteus_mirabilis'],
  staphylocoque_coagulase_negative: ['staphylococcus_epidermidis', 'staphylococcus_lugdunensis'],
  enterocoque_non_identifie: ['enterococcus_faecalis', 'enterococcus_faecium'],
};
function precision(avant: OrganismeId, apres: OrganismeId): boolean {
  return PRECISIONS[avant]?.includes(apres) ?? false;
}

/** Foyer déclaré (syndrome choisi, sinon foyer du prélèvement principal), sans déduction à partir de l'ECBU. */
export function foyerDeclare(d: Dossier): FoyerId {
  const principal = d.prelevements.find((x) => x.type === 'hemoculture') ?? d.prelevements[0];
  if (principal && principal.foyer !== 'inconnu') return principal.foyer;
  if (d.entree === 'syndrome' && d.syndrome !== 'non_choisi') return d.syndrome;
  return 'inconnu';
}

export function nettoyerDossier(d: Dossier): Invalidation[] {
  const invalidations: Invalidation[] = [];
  if (!d.clinique) d.clinique = cliniqueParDefaut();
  // Réponses aux questions d'un foyer qui n'est plus le foyer retenu, ou devenues sans objet : effacées.
  if (d.details) {
    const visibles = new Set(questionsPour(foyerDeclare(d), d.details).map((q) => q.id));
    for (const id of Object.keys(d.details)) {
      if (visibles.has(id)) continue;
      const q = QUESTIONS_SYNDROME.find((x) => x.id === id);
      delete d.details[id];
      if (q) invalidations.push({ champ: `details.${id}`, raison: `« ${q.libelle} » n'est plus pertinent avec le foyer ou les réponses actuelles : réponse effacée.` });
    }
  }
  // Un antibiogramme saisi pour un germe ne doit jamais être réutilisé pour un autre germe.
  for (const p of d.prelevements) {
    for (const iso of isolatsDe(p)) {
      const aDesResultats = (iso.antibiogramme?.length ?? 0) > 0 || Object.keys(iso.phenotypes ?? {}).length > 0;
      if (aDesResultats && iso.antibiogrammePour !== undefined && iso.organisme !== undefined && iso.antibiogrammePour !== iso.organisme && precision(iso.antibiogrammePour, iso.organisme)) {
        iso.antibiogrammePour = iso.organisme;
        continue;
      }
      if (aDesResultats && iso.antibiogrammePour !== undefined && iso.antibiogrammePour !== iso.organisme) {
        const ancien = iso.antibiogrammePour;
        iso.antibiogramme = undefined;
        iso.phenotypes = undefined;
        iso.antibiogrammePour = undefined;
        invalidations.push({ champ: iso.id === p.id ? `${p.id}.antibiogramme` : `${p.id}.${iso.id}.antibiogramme`, raison: `Le germe a changé : les résultats d'antibiogramme saisis pour « ${ancien.replace(/_/g, ' ')} » ne s'appliquent pas au nouveau germe et ont été effacés.` });
      }
    }
  }
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
    if (p.type === 'urine' && !p.urine) p.urine = { motif: 'inconnu', recueil: 'inconnu', nbEspeces: 'inconnu' };
  }
  // Un dossier en entrée « microbiologie » sans prélèvement n'a pas de sens ; on n'en crée pas d'office ici (l'interface le fait).
  return invalidations;
}

export function clonerDossier(d: Dossier): Dossier {
  return JSON.parse(JSON.stringify(d)) as Dossier;
}
