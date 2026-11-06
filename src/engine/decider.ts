/**
 * Moteur décisionnel déterministe : applique les règles de la base clinique au
 * contexte et assemble le plan. À entrées et version clinique identiques, le
 * résultat est identique (aucun aléa, aucun appel réseau, aucun modèle génératif).
 */
import type {
  AbsenceRecommandation,
  Alerte,
  Couverture,
  IndicationPlan,
  DonneeManquante,
  LigneControle,
  NiveauUrgence,
  OptionTherapeutique,
  Plan,
  PropositionEcartee,
  RegleAppliquee,
  SourceRef,
  StatutValidation,
} from '../clinical/types';
import type { Dossier } from './etat';
import { construireContexte, moleculeEvitee, type ContexteDecision } from './contexte';
import { SOURCES_PAR_ID } from '../clinical/sources';
import { MOLECULES_PAR_ID } from '../clinical/molecules';
import { construireFrise } from '../schedule/frise';
import { VERSION_CLINIQUE } from '../clinical/version';
import { REGLES } from '../clinical/rules';
import { analyserIsolat } from '../clinical/microbiologie/analyse';
import { isolatsDe } from './etat';
import { etablirSortie, sortieErreurTechnique } from './sortie';
import { rattacherChamp } from './cibles';

export interface Contribution {
  situation?: Plan['situation'];
  urgence?: NiveauUrgence;
  alertes?: Alerte[];
  options?: OptionTherapeutique[];
  controles?: LigneControle[];
  gestes?: { texte: string; sources: SourceRef[] }[];
  reevaluation?: { texte: string; sources: SourceRef[]; offsetHeures?: number }[];
  avisSpecialise?: { texte: string; urgent: boolean; sources: SourceRef[] }[];
  donneesManquantes?: DonneeManquante[];
  /** Plafonne la couverture de la situation retenue (ex. neutropénie → partielle). */
  couvertureMax?: Couverture;
  /** Décision sur l'indication d'antibiothérapie (la règle de plus haute priorité l'emporte). */
  indication?: IndicationPlan;
  /** Propositions écartées par la règle, avec leur raison structurée. */
  ecartees?: PropositionEcartee[];
  /** Points sans recommandation dédiée : expliqués, non comblés. */
  absences?: Omit<AbsenceRecommandation, 'origine'>[];
}

export interface Regle {
  id: string;
  libelle: string;
  description: string;
  statut: StatutValidation;
  /** Priorité : les règles de situation (plus haute) définissent la situation retenue. */
  priorite: number;
  sources: SourceRef[];
  sApplique: (ctx: ContexteDecision) => boolean;
  appliquer: (ctx: ContexteDecision) => Contribution;
}

export interface OptionsMoteur {
  /** En mode « usage clinique », seules les règles validées par un humain ou publiées sont appliquées. */
  modeUsageClinique?: boolean;
  maintenant?: Date;
}

const RANG_URGENCE: Record<NiveauUrgence, number> = { standard: 0, elevee: 1, immediate: 2 };

/** Décisions qui excluent toute proposition d'antibiotique. */
export const DECISIONS_SANS_TRAITEMENT: IndicationPlan['decision'][] = ['ne_pas_traiter', 'attendre_resultat', 'informations_insuffisantes'];
/** Règles transversales dont le contenu ne concerne qu'un traitement en cours ou à débuter. */
const REGLES_DU_TRAITEMENT = ['R-REEVALUATION-48-72H', 'R-GRAVITE-SEPSIS'];

function cleRef(r: SourceRef): string {
  return `${r.source}|${r.repere ?? ''}|${r.justifie ?? ''}`;
}

export function dedupSources(refs: SourceRef[]): SourceRef[] {
  const vus = new Set<string>();
  return refs.filter((r) => {
    const k = cleRef(r);
    if (vus.has(k)) return false;
    vus.add(k);
    return true;
  });
}

/**
 * Regroupe les motifs répétés molécule par molécule :
 * « détermine si « X » (A) est nécessaire ; détermine si « X » (B) est nécessaire »
 * → « détermine si « X » est nécessaire (A, B) ». Les autres motifs sont dédoublonnés tels quels.
 */
export function regrouperPourquoi(pourquoi: string): string {
  const morceaux = pourquoi.split(' ; ');
  const groupes = new Map<string, string[]>();
  const ordre: string[] = [];
  for (const m of morceaux) {
    const r = /^détermine si « (.+) » \((.+)\) est nécessaire$/.exec(m);
    const cle = r ? `§${r[1]}` : m;
    if (!groupes.has(cle)) {
      groupes.set(cle, []);
      ordre.push(cle);
    }
    if (r && !groupes.get(cle)!.includes(r[2])) groupes.get(cle)!.push(r[2]);
  }
  return ordre.map((cle) => (cle.startsWith('§') ? `détermine si « ${cle.slice(1)} » est nécessaire (${groupes.get(cle)!.join(', ')})` : cle)).join(' ; ');
}

export function decider(dossier: Dossier, opts: OptionsMoteur = {}): Plan {
  const ctx = construireContexte(dossier, opts.maintenant ?? new Date(dossier.horaires.maintenantISO ?? Date.now()));
  const reglesActives = REGLES.filter((r) => r.statut !== 'retiree').filter((r) => !opts.modeUsageClinique || r.statut === 'validee_humain' || r.statut === 'publiee');
  const applicables = reglesActives.filter((r) => r.sApplique(ctx)).sort((a, b) => b.priorite - a.priorite || a.id.localeCompare(b.id));

  const plan: Plan = {
    versionClinique: VERSION_CLINIQUE.version,
    situation: {
      id: 'aucune',
      libelle: 'Situation non déterminée',
      couverture: 'non_couverte',
      description: "Les informations saisies ne permettent pas encore d'identifier une situation couverte par la base clinique.",
    },
    urgence: { niveau: 'standard', alertes: [] },
    options: [],
    microbiologie: [],
    surveillance: [],
    controles: [],
    gestes: [],
    reevaluation: [],
    avisSpecialise: [],
    donneesManquantes: [],
    frise: [],
    regles: [],
    sources: [],
    contientReglesNonValidees: false,
    absencesRecommandation: [],
    sortie: { traitement: 'aucun', urgence: false, actionsUrgentes: [], motifs: [], ecartees: [] },
  };
  const ecartees: PropositionEcartee[] = [];
  // Mode usage clinique : les règles non validées par un humain ne sont pas évaluées ; leur masquage est tracé.
  if (opts.modeUsageClinique)
    for (const r of REGLES.filter((x) => x.statut !== 'retiree' && x.statut !== 'validee_humain' && x.statut !== 'publiee' && x.sApplique(ctx)))
      ecartees.push({ libelle: r.libelle, type: 'non_validee', raison: `mode usage clinique : règle au statut « ${r.statut} », non validée par un humain, non appliquée`, sources: r.sources, origine: r.id });

  const reevals: { texte: string; sources: SourceRef[]; offsetHeures?: number }[] = [];
  let regleSituation: RegleAppliquee | undefined;
  let couvertureMax: Couverture = 'couverte';
  const RANG_COUV: Record<Couverture, number> = { couverte: 2, partielle: 1, non_couverte: 0 };
  const contributions: { ra: RegleAppliquee; c: Contribution }[] = [];
  for (const r of applicables) {
    const ra: RegleAppliquee = { id: r.id, libelle: r.libelle, statut: r.statut, sources: r.sources };
    plan.regles.push(ra);
    contributions.push({ ra, c: r.appliquer(ctx) });
  }

  // Indication. Une conclusion propre à un prélèvement (contamination possible, colonisation…) ne retire pas le
  // traitement d'un autre foyer : une décision de traiter, explicite ou portée par une règle qui propose un
  // traitement, l'emporte ; les autres conclusions restent affichées comme conclusions secondaires.
  const nonTraitement = (c: Contribution) => !!c.indication && DECISIONS_SANS_TRAITEMENT.includes(c.indication.decision);
  const indications = contributions.filter((x) => x.c.indication).map((x) => x.c.indication!);
  const traitantes = contributions.filter((x) => (x.c.options?.length ?? 0) > 0 && !nonTraitement(x.c));
  const principale = indications.find((i) => i.decision === 'urgence') ?? indications.find((i) => i.decision === 'traiter') ?? (traitantes.length > 0 ? undefined : indications[0]);
  const traitement = principale ? !DECISIONS_SANS_TRAITEMENT.includes(principale.decision) : traitantes.length > 0;
  plan.indication = principale;
  plan.indicationsSecondaires = indications.filter((i) => i !== principale);
  // Sans traitement, les éléments propres au traitement sont écartés (options, contrôles et réévaluation des règles thérapeutiques).
  const garder = (x: { ra: RegleAppliquee; c: Contribution }) =>
    traitement || nonTraitement(x.c) || ((x.c.options?.length ?? 0) === 0 && !REGLES_DU_TRAITEMENT.includes(x.ra.id));
  const situationCandidate = contributions.find((x) => x.c.situation && (!traitement || !nonTraitement(x.c))) ?? contributions.find((x) => x.c.situation);
  if (situationCandidate) {
    plan.situation = situationCandidate.c.situation!;
    regleSituation = situationCandidate.ra;
  }

  for (const { ra, c } of contributions.filter(garder)) {
    if (c.ecartees) ecartees.push(...c.ecartees.map((e) => ({ ...e, origine: ra.id })));
    if (c.absences) plan.absencesRecommandation.push(...c.absences.map((a) => ({ ...a, origine: ra.id })));
    if (c.couvertureMax && RANG_COUV[c.couvertureMax] < RANG_COUV[couvertureMax]) couvertureMax = c.couvertureMax;
    if (c.urgence && RANG_URGENCE[c.urgence] > RANG_URGENCE[plan.urgence.niveau]) plan.urgence.niveau = c.urgence;
    if (c.alertes) plan.urgence.alertes.push(...c.alertes);
    if (c.options) plan.options.push(...c.options);
    if (c.controles) plan.controles.push(...c.controles);
    if (c.gestes) plan.gestes.push(...c.gestes);
    if (c.reevaluation) {
      plan.reevaluation.push(...c.reevaluation.map(({ texte, sources }) => ({ texte, sources })));
      reevals.push(...c.reevaluation);
    }
    if (c.avisSpecialise) plan.avisSpecialise.push(...c.avisSpecialise);
    if (c.donneesManquantes) plan.donneesManquantes.push(...c.donneesManquantes.filter((m) => traitement || (m.impact !== 'bloque_dose' && m.impact !== 'bloque_duree' && m.impact !== 'bloque_surveillance')));
  }
  // Prélèvement polymicrobien : chaque antibiogramme reste rattaché à son isolat ; les propositions ne portent que sur le germe principal.
  const poly = dossier.prelevements.filter((x) => (x.isolatsSupplementaires ?? []).some((i) => i.organisme !== undefined));
  if (poly.length > 0) {
    if (RANG_COUV.partielle < RANG_COUV[couvertureMax]) couvertureMax = 'partielle';
    plan.urgence.alertes.push({ niveau: 'attention', texte: 'Prélèvement polymicrobien : au-delà du périmètre validé. Les propositions ne tiennent compte que du germe principal de chaque prélèvement ; la couverture des autres isolats (voir leurs antibiogrammes) est à vérifier avec le SMIT.' });
  }
  for (const x of poly) if (x.type === 'urine' && x.urine?.nbEspeces === 'une') plan.urgence.alertes.push({ niveau: 'attention', texte: 'ECBU : « une espèce » est indiqué, mais plusieurs germes sont saisis. Vérifier le compte rendu.' });
  if (RANG_COUV[couvertureMax] < RANG_COUV[plan.situation.couverture]) plan.situation.couverture = couvertureMax;

  // Synthèse microbiologique de chaque isolat identifié.
  for (const prl of dossier.prelevements) for (const iso of isolatsDe(prl)) if (iso.organisme) plan.microbiologie.push(analyserIsolat(ctx, prl, iso));

  // Indication : une culture positive ne déclenche jamais, à elle seule, une proposition d'antibiotique.
  if (!plan.indication && plan.options.length > 0 && regleSituation) {
    plan.indication = {
      decision: plan.urgence.niveau === 'immediate' ? 'urgence' : 'traiter',
      qualification: 'infection',
      titre: 'Indication de traitement retenue',
      raison: `Situation infectieuse retenue : ${plan.situation.libelle}.`,
      conditions: [],
      exceptions: [],
      actions: [],
      surveillance: [],
      reconsiderer: [],
      questions: [],
      sources: regleSituation.sources,
      statut: regleSituation.statut,
      regleId: regleSituation.id,
    };
  }
  if (!traitement) plan.options = [];

  // 1. Sources retirées : toute option qui s'appuie sur une source retirée est exclue.
  const sourceRetiree = (refs: SourceRef[]) => refs.find((r) => SOURCES_PAR_ID[r.source]?.statutVigueur === 'retiree');
  plan.options = plan.options.filter((o) => {
    const refs = [...o.sources, ...o.prescriptions.flatMap((p) => [...p.sources, ...p.duree.sources])];
    const ret = sourceRetiree(refs);
    if (ret) ecartees.push({ libelle: o.libelle, type: 'source_retiree', raison: `s'appuie sur une source marquée comme retirée (${SOURCES_PAR_ID[ret.source]?.titre ?? ret.source})`, sources: [ret], origine: 'controle-sources' });
    if (ret) plan.urgence.alertes.push({ niveau: 'attention', texte: `Option « ${o.libelle} » retirée : elle s'appuie sur une source marquée comme retirée (${SOURCES_PAR_ID[ret.source]?.titre ?? ret.source}). Révision de la règle nécessaire.` });
    return !ret;
  });

  // 2. Mode usage clinique : seules les options validées par un humain ou publiées sont conservées.
  if (opts.modeUsageClinique) {
    const avant = plan.options.length;
    for (const o of plan.options)
      if (o.statut !== 'validee_humain' && o.statut !== 'publiee')
        ecartees.push({ libelle: o.libelle, type: 'non_validee', raison: `mode usage clinique : règle au statut « ${o.statut} », non validée par un humain`, sources: o.sources, origine: 'mode-usage-clinique' });
    plan.options = plan.options.filter((o) => o.statut === 'validee_humain' || o.statut === 'publiee');
    if (avant > 0 || applicables.length === 0) plan.urgence.alertes.push({ niveau: 'attention', texte: `Mode usage clinique : ${avant - plan.options.length} option(s) non validée(s) par un humain masquée(s). Aucune règle de cette version n'est encore validée médicalement : prendre l'avis du SMIT.` });
  }

  // 3. Allergies : une option contenant une molécule évitée devient conditionnelle ; promotion d'une alternative sûre.
  const evitee = (o: OptionTherapeutique) => {
    for (const p of o.prescriptions) {
      const m = MOLECULES_PAR_ID[p.moleculeId];
      if (!m) continue;
      const e = moleculeEvitee(m.id, m.famille, ctx.allergie);
      if (e.evitee) return e.raison;
    }
    return undefined;
  };
  let premiereRetiree = false;
  for (const o of plan.options) {
    const raison = evitee(o);
    if (raison) {
      ecartees.push({ libelle: o.libelle, type: 'allergie', raison: `${raison} ; affichée seulement comme option conditionnelle`, sources: [], origine: 'controle-allergies' });
      if (o.rang === 'premiere_ligne') premiereRetiree = true;
      o.rang = 'conditionnelle';
      o.condition = `Non utilisable en l'état : ${raison}. Seulement après évaluation allergologique.`;
    }
  }
  if (premiereRetiree && !plan.options.some((o) => o.rang === 'premiere_ligne')) {
    const alt = plan.options.find((o) => o.rang === 'alternative' && !evitee(o));
    if (alt) {
      alt.rang = 'premiere_ligne';
      plan.urgence.alertes.push({ niveau: 'attention', texte: `Allergie déclarée : l'option de 1re ligne habituelle est contre-indiquée ; « ${alt.libelle} » est proposée à la place.` });
    } else {
      plan.urgence.alertes.push({ niveau: 'urgence', texte: 'Allergie déclarée : aucune option de la base ne peut être proposée sans risque ; avis infectiologique et allergologique.' });
    }
  }

  // 4. Option retenue par le prescripteur : le calendrier suit cette option ; si elle n'existe plus, son calendrier est invalidé.
  let base = plan.options.find((o) => o.rang === 'premiere_ligne');
  if (dossier.optionRetenueId) {
    const retenue = plan.options.find((o) => o.id === dossier.optionRetenueId);
    if (retenue) base = retenue;
    else plan.urgence.alertes.push({ niveau: 'attention', texte: 'L\'option précédemment retenue n\'est plus proposée avec les données actuelles : son calendrier de surveillance a été retiré. Choisir une nouvelle option.' });
  }
  plan.optionRetenueId = base?.id;
  plan.surveillance = base ? base.prescriptions.flatMap((p) => p.surveillance) : [];

  // Dédoublonnage des données manquantes (même champ → une ligne, impact le plus fort)
  const poids: Record<DonneeManquante['impact'], number> = { affine: 0, bloque_surveillance: 1, bloque_duree: 2, bloque_dose: 3, bloque_decision: 4 };
  const parChamp = new Map<string, DonneeManquante>();
  for (const dm of plan.donneesManquantes) {
    const ex = parChamp.get(dm.champ);
    if (!ex) parChamp.set(dm.champ, { ...dm });
    else {
      // Impact le plus fort conservé, motifs de toutes les demandes conservés (aucune perte d'information).
      const pourquoi = ex.pourquoi.split(' ; ').includes(dm.pourquoi) ? ex.pourquoi : `${ex.pourquoi} ; ${dm.pourquoi}`;
      parChamp.set(dm.champ, { ...ex, pourquoi, impact: poids[dm.impact] > poids[ex.impact] ? dm.impact : ex.impact });
    }
  }
  plan.donneesManquantes = [...parChamp.values()]
    .map((dm) => ({ ...dm, pourquoi: regrouperPourquoi(dm.pourquoi), cible: dm.cible ?? rattacherChamp(dm.champ).cible }))
    .sort((a, b) => poids[b.impact] - poids[a.impact]);

  // Alertes : urgence en tête, dédoublonnées
  const rangAl = { urgence: 0, attention: 1, info: 2 };
  const vuesAl = new Set<string>();
  plan.urgence.alertes = plan.urgence.alertes.filter((a) => (vuesAl.has(a.texte) ? false : (vuesAl.add(a.texte), true))).sort((a, b) => rangAl[a.niveau] - rangAl[b.niveau]);

  // Frise
  plan.frise = construireFrise(plan.surveillance, plan.controles, reevals, {
    maintenantISO: dossier.horaires.maintenantISO,
    premiereDoseISO: dossier.horaires.premiereDoseISO,
    dureePerfusionMin: dossier.horaires.dureePerfusionMin,
    premiereHemocNegativeISO: ctx.hemocultures[0]?.hemoc?.dateNegativationISO,
    premiereHemocPositiveISO: ctx.hemocultures[0]?.hemoc?.datePremierePositiveISO,
  });

  // Sources dédupliquées
  const refs: SourceRef[] = [];
  for (const r of plan.regles) refs.push(...r.sources);
  for (const o of plan.options) {
    refs.push(...o.sources);
    for (const pr of o.prescriptions) {
      refs.push(...pr.sources, ...pr.duree.sources);
      for (const s of pr.surveillance) refs.push(...s.element.sources);
    }
  }
  for (const c of plan.controles) refs.push(...c.sources);
  for (const g of plan.gestes) refs.push(...g.sources);
  for (const a of plan.avisSpecialise) refs.push(...a.sources);
  for (const a of plan.urgence.alertes) refs.push(...(a.sources ?? []));
  plan.sources = dedupSources(refs);

  plan.contientReglesNonValidees =
    plan.regles.some((r) => r.statut !== 'validee_humain' && r.statut !== 'publiee') ||
    plan.options.some((o) => o.prescriptions.some((p) => p.statut !== 'validee_humain' && p.statut !== 'publiee'));

  // État de sortie explicite : jamais de zone thérapeutique vide sans explication.
  plan.sortie = etablirSortie(plan, ctx, ecartees);

  return plan;
}

/** Résultat du moteur : un plan, ou une erreur technique explicitement distinguée d'une conclusion médicale. */
export type ResultatMoteur = { ok: true; plan: Plan } | { ok: false; erreur: string; sortie: Plan['sortie'] };

/** Appel protégé du moteur : une panne n'est jamais traduite par « pas d'antibiothérapie indiquée ». */
export function deciderSansPanne(dossier: Dossier, opts: OptionsMoteur = {}): ResultatMoteur {
  try {
    return { ok: true, plan: decider(dossier, opts) };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    // Lecture brute et protégée de la gravité : l'urgence ne disparaît pas avec la panne.
    let urgence = false;
    try {
      urgence = ['sepsis', 'choc_septique'].includes(dossier?.patient?.gravite ?? '');
    } catch {
      urgence = false;
    }
    return { ok: false, erreur: message, sortie: sortieErreurTechnique(message, urgence) };
  }
}

export { construireContexte };
export type { ContexteDecision };
