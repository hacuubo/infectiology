/**
 * Moteur de calendrier : transforme les éléments de surveillance et de contrôle
 * (toujours relatifs à une ancre) en une frise chronologique compacte.
 * Si les horaires réels sont connus, les dates absolues sont calculées ;
 * sinon la frise reste relative. Aucun calendrier n'est inventé : chaque ligne
 * provient d'un élément sourcé.
 */
import type { EvenementFrise, LigneControle, LigneSurveillance, SpecCalendrier, SpecSTP, ElementSurveillance } from '../clinical/types';

export interface Horaires {
  maintenantISO?: string;
  premiereDoseISO?: string;
  dureePerfusionMin?: number;
  premiereHemocNegativeISO?: string;
  premiereHemocPositiveISO?: string;
}

const ORDRE_INDETERMINE = 1_000_000;

function ajouterHeures(iso: string, heures: number): string {
  const d = new Date(iso);
  d.setTime(d.getTime() + heures * 3_600_000);
  return d.toISOString();
}

export function formaterDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

/** Calcule l'ordre relatif (heures depuis le début) et, si possible, la date absolue d'un SpecCalendrier. */
export function resoudreCalendrier(spec: SpecCalendrier, h: Horaires): { ordre: number; dateISO?: string; moment: string } {
  const offset = spec.offsetHeures ?? 0;
  switch (spec.ancre) {
    case 'avant_traitement':
      return { ordre: -1, dateISO: h.maintenantISO, moment: 'Maintenant, avant la 1re dose' };
    case 'debut_traitement': {
      const ordre = offset;
      const dateISO = h.premiereDoseISO ? ajouterHeures(h.premiereDoseISO, offset) : undefined;
      return { ordre, dateISO, moment: dateISO ? formaterDate(dateISO) : spec.texte };
    }
    case 'dose': {
      // Sans intervalle connu, on ne peut pas dater une dose n ; on reste relatif.
      if (spec.numeroDose === 1 && h.premiereDoseISO) {
        const dateISO = ajouterHeures(h.premiereDoseISO, offset);
        return { ordre: offset, dateISO, moment: formaterDate(dateISO) };
      }
      return { ordre: spec.numeroDose ? (spec.numeroDose - 1) * 24 + offset : offset, moment: spec.texte };
    }
    case 'fin_perfusion': {
      if (spec.numeroDose === 1 && h.premiereDoseISO && h.dureePerfusionMin !== undefined) {
        const dateISO = ajouterHeures(h.premiereDoseISO, h.dureePerfusionMin / 60 + offset);
        return { ordre: h.dureePerfusionMin / 60 + offset, dateISO, moment: formaterDate(dateISO) };
      }
      return { ordre: offset + 0.5, moment: spec.texte };
    }
    case 'premiere_hemoculture_negative': {
      if (h.premiereHemocNegativeISO) {
        const dateISO = ajouterHeures(h.premiereHemocNegativeISO, offset);
        return { ordre: 48 + offset, dateISO, moment: formaterDate(dateISO) };
      }
      return { ordre: 48 + offset, moment: spec.texte };
    }
    case 'premiere_hemoculture_positive': {
      if (h.premiereHemocPositiveISO) {
        const dateISO = ajouterHeures(h.premiereHemocPositiveISO, offset);
        return { ordre: offset, dateISO, moment: formaterDate(dateISO) };
      }
      return { ordre: offset, moment: spec.texte };
    }
    case 'quotidien':
      return { ordre: 24, moment: spec.texte };
    case 'hebdomadaire':
      return { ordre: 24 * 7, moment: spec.texte };
    case 'non_determine':
    default:
      return { ordre: ORDRE_INDETERMINE, moment: spec.texte };
  }
}

function calendrierDeStp(s: SpecSTP): SpecCalendrier {
  const pp = s.premierPrelevement;
  if (pp.avantDoseSuivante && pp.numeroDose) {
    return { ancre: 'dose', numeroDose: pp.numeroDose, offsetHeures: 0, texte: `${pp.quand} — ${pp.position}` };
  }
  if (pp.offsetHeuresApresFinPerfusion !== undefined && pp.numeroDose) {
    return { ancre: 'fin_perfusion', numeroDose: pp.numeroDose, offsetHeures: pp.offsetHeuresApresFinPerfusion, texte: `${pp.quand} — ${pp.position}` };
  }
  if (pp.jour) {
    return { ancre: 'debut_traitement', offsetHeures: (pp.jour - 1) * 24, texte: `${pp.quand} — ${pp.position}` };
  }
  return { ancre: 'non_determine', texte: `${pp.quand} — ${pp.position}` };
}

function estStp(e: ElementSurveillance | SpecSTP): e is SpecSTP {
  return (e as SpecSTP).parametre !== undefined;
}

export function construireFrise(surveillance: LigneSurveillance[], controles: LigneControle[], reevaluations: { texte: string; sources: EvenementFrise['sources']; offsetHeures?: number }[], h: Horaires): EvenementFrise[] {
  const evts: EvenementFrise[] = [];
  let i = 0;
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
      sources: c.sources,
    });
  }
  for (const s of surveillance) {
    const e = s.element;
    if (e.categorie === 'non_recommande_routine') continue;
    const spec = estStp(e) ? calendrierDeStp(e) : e.quand;
    const r = resoudreCalendrier(spec, h);
    const quoi = estStp(e) ? `${s.moleculeDci} : dosage (${e.parametre})` : `${s.moleculeDci} : ${e.quoi}`;
    evts.push({
      id: `fr-s-${i++}`,
      moment: r.moment,
      ordre: r.ordre,
      quoi: quoi + (e.categorie === 'conditionnelle' ? ' (conditionnel)' : ''),
      pourquoi: estStp(e) ? e.indication : e.pourquoi,
      ensuite: estStp(e) ? e.conduite ?? e.repetition : e.conduite ?? e.quand.repetition,
      type: spec.ancre === 'avant_traitement' ? 'maintenant' : 'surveillance',
      dateISO: r.dateISO,
      sources: e.sources,
    });
  }
  for (const re of reevaluations) {
    const off = re.offsetHeures ?? 48;
    const dateISO = h.premiereDoseISO ? ajouterHeures(h.premiereDoseISO, off) : undefined;
    evts.push({
      id: `fr-r-${i++}`,
      moment: dateISO ? formaterDate(dateISO) : `H+${off}`,
      ordre: off,
      quoi: re.texte,
      pourquoi: 'Réévaluation systématique de l\'antibiothérapie',
      type: 'reevaluation',
      dateISO,
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
  return dedup.sort((a, b) => a.ordre - b.ordre);
}
