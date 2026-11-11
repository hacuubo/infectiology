/**
 * Moteur de calendrier : transforme les éléments de surveillance et de contrôle
 * (toujours relatifs à une ancre) en une frise chronologique compacte.
 *
 * Principes :
 * - le moment affiché est COURT (« Maintenant », « J2 », « H+48 après la 1re dose »,
 *   « Juste avant la 3e dose »…) ; la formulation complète de la source est conservée
 *   dans `precisionMoment` et affichée dans un panneau dépliable ;
 * - une date n'est calculée que si l'horaire de l'ancre est saisi ET que la source donne
 *   un délai explicite ; sinon la frise reste relative (aucune date inventée) ;
 * - « jour de traitement » (J2), « numéro de dose » (avant la 3e dose), « délai en heures »
 *   (H+48) et « après la fin de perfusion » restent distincts : un jour de traitement est
 *   daté au jour près (sans heure), une dose n > 1 n'est jamais datée (l'intervalle réel
 *   peut être modifié par l'adaptation rénale ou les dosages).
 */
import type { EvenementFrise, LigneControle, LigneSurveillance, SpecCalendrier, SpecSTP, ElementSurveillance } from '../clinical/types';

export interface Horaires {
  maintenantISO?: string;
  premiereDoseISO?: string;
  dureePerfusionMin?: number;
  premiereHemocNegativeISO?: string;
  premiereHemocPositiveISO?: string;
}

/** Événement de frise enrichi des détails affichés dans le panneau dépliable. */
export interface EvenementFriseDetaille extends EvenementFrise {
  /** Formulation complète du moment (texte source), si elle diffère du moment court. */
  precisionMoment?: string;
  /** Vrai si la date est au jour près (jour de traitement) et non à l'heure près. */
  dateAuJour?: boolean;
  cible?: string;
  /** Conduite à tenir selon le résultat (dosage hors cible, anomalie), affichée sans dépliage. */
  conduite?: string;
  limites?: string;
  repetition?: string;
  conditionnel?: boolean;
  /**
   * Position sur la frise graphique, en heures depuis la 1re dose. Renseignée seulement si le moment
   * est placé sans approximation (avant traitement, jour de traitement, délai explicite, 1re dose,
   * réévaluation) ; absente pour « chaque jour », « juste avant la 3e dose », les ancres d'hémoculture
   * ou un moment indéterminé : ces événements restent dans le tableau sans être placés.
   */
  position?: number;
}

/** Spécification interne : un libellé court peut être imposé (cas des dosages). */
type SpecInterne = SpecCalendrier & { libelleCourt?: string };

const ORDRE_INDETERMINE = 1_000_000;

function ajouterHeures(iso: string, heures: number): string {
  const d = new Date(iso);
  d.setTime(d.getTime() + heures * 3_600_000);
  return d.toISOString();
}

function dateValide(iso: string | undefined): iso is string {
  return !!iso && !Number.isNaN(new Date(iso).getTime());
}

export function formaterDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function formaterJour(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit' });
}

export function ordinalDose(n: number): string {
  return n === 1 ? '1re' : `${n}e`;
}

function heures(h: number): string {
  return String(Math.round(h * 100) / 100).replace('.', ',');
}

/** Abrège un texte de source pour la colonne « Quand » (première proposition, 60 caractères au plus). */
export function abreger(texte: string, max = 60): string {
  const brut = texte.split(/ \(| ; | — |\. /)[0].trim();
  const premier = brut.charAt(0).toUpperCase() + brut.slice(1);
  if (premier.length <= max) return premier;
  const coupe = premier.slice(0, max);
  return `${coupe.slice(0, coupe.lastIndexOf(' ') > 20 ? coupe.lastIndexOf(' ') : max)}…`;
}

function avecDate(libelle: string, dateISO: string | undefined, auJour = false): string {
  return dateISO ? `${libelle} · ${auJour ? formaterJour(dateISO) : formaterDate(dateISO)}` : libelle;
}

/**
 * Calcule l'ordre relatif (heures depuis la 1re dose, pour le tri), la date absolue si elle est
 * déterminable, et le moment court affiché.
 */
export function resoudreCalendrier(spec: SpecInterne, h: Horaires): { ordre: number; dateISO?: string; moment: string; dateAuJour?: boolean; position?: number } {
  const offset = spec.offsetHeures ?? 0;
  const premiereDose = dateValide(h.premiereDoseISO) ? h.premiereDoseISO : undefined;
  switch (spec.ancre) {
    case 'avant_traitement': {
      // « Maintenant (avant la 1re dose) » seulement si la source le dit sans délai ni condition ;
      // sinon (« sans délai », « au plus tard dans les 24 h », « … si le cathéter est conservé »)
      // le texte de la source est repris, pour ne pas imposer un examen avant la 1re dose à tort.
      const simple = spec.offsetHeures === undefined && /^(maintenant|avant)/i.test(spec.texte) && !/\bsi\b/i.test(spec.texte);
      const libelle = spec.libelleCourt ?? (simple ? 'Maintenant (avant la 1re dose)' : abreger(spec.texte));
      return { ordre: spec.offsetHeures ? -1 + spec.offsetHeures / 1000 : -1, dateISO: simple && dateValide(h.maintenantISO) ? h.maintenantISO : undefined, moment: libelle, position: spec.offsetHeures ?? 0 };
    }
    case 'debut_traitement': {
      if (spec.jour !== undefined) {
        // Jour de traitement : J1 = jour de la 1re dose ; daté au jour près, jamais à l'heure.
        const dateISO = premiereDose ? ajouterHeures(premiereDose, (spec.jour - 1) * 24) : undefined;
        return { ordre: (spec.jour - 1) * 24, dateISO, dateAuJour: true, moment: avecDate(spec.libelleCourt ?? `J${spec.jour}`, dateISO, true), position: (spec.jour - 1) * 24 + 12 };
      }
      if (spec.offsetHeures === undefined) {
        // Pas de délai explicite (ex. « à chaque administration », « dès que possible ») : aucune date.
        return { ordre: 0, moment: spec.libelleCourt ?? abreger(spec.texte) };
      }
      const dateISO = premiereDose ? ajouterHeures(premiereDose, offset) : undefined;
      const libelle = spec.libelleCourt ?? (offset === 0 ? 'Début du traitement (1re dose)' : `H+${heures(offset)} après la 1re dose`);
      return { ordre: offset, dateISO, moment: avecDate(libelle, dateISO), position: offset };
    }
    case 'dose': {
      const n = spec.numeroDose ?? 1;
      const libelle = spec.libelleCourt ?? (offset === 0 ? `${ordinalDose(n)} dose` : `${ordinalDose(n)} dose ${offset > 0 ? '+' : '−'} ${heures(Math.abs(offset))} h`);
      const ordre = spec.jour !== undefined ? (spec.jour - 1) * 24 + offset : (n - 1) * 24 + offset;
      // Placement sur la frise : 1re dose, ou jour de traitement explicite ; jamais d'après l'intervalle supposé.
      const position = n === 1 ? offset : spec.jour !== undefined ? (spec.jour - 1) * 24 + 12 : undefined;
      // Seule la 1re dose est datable : l'heure des doses suivantes dépend de l'intervalle réellement appliqué.
      if (n === 1 && premiereDose) {
        const dateISO = ajouterHeures(premiereDose, offset);
        return { ordre: offset, dateISO, moment: avecDate(libelle, dateISO), position };
      }
      return { ordre, moment: libelle, position };
    }
    case 'fin_perfusion': {
      const n = spec.numeroDose ?? 1;
      const libelle = spec.libelleCourt ?? `${ordinalDose(n)} dose : fin de perfusion + ${heures(offset * 60)} min`;
      if (n === 1 && premiereDose && h.dureePerfusionMin !== undefined && h.dureePerfusionMin > 0) {
        const dateISO = ajouterHeures(premiereDose, h.dureePerfusionMin / 60 + offset);
        return { ordre: h.dureePerfusionMin / 60 + offset, dateISO, moment: avecDate(libelle, dateISO), position: h.dureePerfusionMin / 60 + offset };
      }
      return { ordre: (n - 1) * 24 + offset + 0.5, moment: libelle, position: n === 1 ? offset + 0.5 : undefined };
    }
    case 'premiere_hemoculture_negative': {
      const libelle = spec.libelleCourt ?? (offset ? `H+${heures(offset)} après la 1re hémoculture négative` : '1re hémoculture négative');
      if (dateValide(h.premiereHemocNegativeISO)) {
        const dateISO = ajouterHeures(h.premiereHemocNegativeISO, offset);
        return { ordre: 48 + offset, dateISO, moment: avecDate(libelle, dateISO) };
      }
      return { ordre: 48 + offset, moment: libelle };
    }
    case 'premiere_hemoculture_positive': {
      const libelle = spec.libelleCourt ?? (offset ? `H+${heures(offset)} après la 1re hémoculture positive` : '1re hémoculture positive');
      if (dateValide(h.premiereHemocPositiveISO)) {
        const dateISO = ajouterHeures(h.premiereHemocPositiveISO, offset);
        return { ordre: offset, dateISO, moment: avecDate(libelle, dateISO) };
      }
      return { ordre: offset, moment: libelle };
    }
    case 'quotidien':
      return { ordre: 24, moment: spec.libelleCourt ?? abreger(spec.texte) };
    case 'hebdomadaire':
      return { ordre: 24 * 7, moment: spec.libelleCourt ?? abreger(spec.texte) };
    case 'non_determine':
    default:
      return { ordre: ORDRE_INDETERMINE, moment: spec.libelleCourt ?? abreger(spec.texte) };
  }
}

export const LIBELLE_PARAMETRE_STP: Record<SpecSTP['parametre'], string> = {
  pic: 'pic',
  residuelle: 'résiduelle',
  plateau: 'plateau',
  auc: 'ASC',
};

/**
 * Traduit le premier prélèvement d'un dosage en spécification de calendrier.
 * Priorité : « juste avant la dose n » > « après la fin de perfusion de la dose n » > « jour n ».
 */
export function calendrierDeStp(s: SpecSTP): SpecInterne {
  const pp = s.premierPrelevement;
  const texte = `${pp.quand} — ${pp.position}`;
  if (pp.avantDoseSuivante && pp.numeroDose) {
    return { ancre: 'dose', numeroDose: pp.numeroDose, jour: pp.jour, offsetHeures: 0, texte, libelleCourt: `Juste avant la ${ordinalDose(pp.numeroDose)} dose${pp.jour ? ` (J${pp.jour})` : ''}` };
  }
  if (pp.offsetHeuresApresFinPerfusion !== undefined && pp.numeroDose) {
    return { ancre: 'fin_perfusion', numeroDose: pp.numeroDose, offsetHeures: pp.offsetHeuresApresFinPerfusion, texte };
  }
  if (pp.jour) {
    return { ancre: 'debut_traitement', jour: pp.jour, texte };
  }
  return { ancre: 'non_determine', texte, libelleCourt: abreger(pp.quand) };
}

function estStp(e: ElementSurveillance | SpecSTP): e is SpecSTP {
  return (e as SpecSTP).parametre !== undefined;
}

export function construireFrise(surveillance: LigneSurveillance[], controles: LigneControle[], reevaluations: { texte: string; sources: EvenementFrise['sources']; offsetHeures?: number }[], h: Horaires): EvenementFriseDetaille[] {
  const evts: EvenementFriseDetaille[] = [];
  let i = 0;
  const precision = (court: string, long: string) => (long && long !== court ? long : undefined);
  for (const c of controles) {
    if (c.categorie === 'non_systematique') continue; // n'encombre pas la frise ; reste dans la rubrique Contrôles
    const r = resoudreCalendrier(c.quand, h);
    evts.push({
      id: `fr-c-${i++}`,
      moment: r.moment,
      ordre: r.ordre,
      quoi: c.quoi + (c.categorie === 'conditionnel' ? ' (conditionnel)' : ''),
      pourquoi: c.pourquoi,
      ensuite: c.ensuite,
      type: c.quand.ancre === 'avant_traitement' ? 'maintenant' : 'controle',
      dateISO: r.dateISO,
      dateAuJour: r.dateAuJour,
      position: r.position,
      precisionMoment: precision(r.moment, c.quand.texte),
      repetition: c.quand.repetition,
      conditionnel: c.categorie === 'conditionnel',
      sources: c.sources,
    });
  }
  for (const s of surveillance) {
    const e = s.element;
    if (e.categorie === 'non_recommande_routine') continue;
    const spec: SpecInterne = estStp(e) ? calendrierDeStp(e) : e.quand;
    const r = resoudreCalendrier(spec, h);
    const quoi = estStp(e) ? `${s.moleculeDci} : dosage (${LIBELLE_PARAMETRE_STP[e.parametre]})` : `${s.moleculeDci} : ${e.quoi}`;
    evts.push({
      id: `fr-s-${i++}`,
      moment: r.moment,
      ordre: r.ordre,
      quoi: quoi + (e.categorie === 'conditionnelle' ? ' (conditionnel)' : ''),
      pourquoi: estStp(e) ? e.indication : e.pourquoi,
      ensuite: estStp(e) ? e.conduite ?? e.repetition : e.conduite ?? e.quand.repetition,
      type: spec.ancre === 'avant_traitement' ? 'maintenant' : 'surveillance',
      dateISO: r.dateISO,
      dateAuJour: r.dateAuJour,
      position: r.position,
      // texteCalendrier contient la formulation complète ET la condition d'application éventuelle.
      precisionMoment: precision(r.moment, s.texteCalendrier),
      cible: estStp(e) && e.cible ? `${e.cible.texte}${e.cible.verifiee ? '' : ' (cible non vérifiée dans la source)'}` : undefined,
      conduite: e.conduite,
      limites: estStp(e) ? e.limites : undefined,
      repetition: estStp(e) ? e.repetition : e.quand.repetition,
      conditionnel: e.categorie === 'conditionnelle',
      sources: e.sources,
    });
  }
  for (const re of reevaluations) {
    const off = re.offsetHeures ?? 48;
    const premiereDose = dateValide(h.premiereDoseISO) ? h.premiereDoseISO : undefined;
    const dateISO = premiereDose ? ajouterHeures(premiereDose, off) : undefined;
    evts.push({
      id: `fr-r-${i++}`,
      moment: avecDate(`H+${heures(off)} après la 1re dose`, dateISO),
      ordre: off,
      quoi: re.texte,
      pourquoi: 'Réévaluation systématique de l\'antibiothérapie',
      type: 'reevaluation',
      dateISO,
      position: off,
      sources: re.sources,
    });
  }
  // Fusion des doublons stricts (même quoi + même ordre)
  const vus = new Set<string>();
  const dedup = evts.filter((e) => {
    const k = `${e.ordre}|${e.quoi}`;
    if (vus.has(k)) return false;
    vus.add(k);
    return true;
  });
  // Tri stable : à ordre égal, l'ordre d'insertion (contrôles, surveillance, réévaluation) est conservé.
  return dedup.sort((a, b) => a.ordre - b.ordre);
}
