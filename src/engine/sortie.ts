/**
 * État de sortie explicite du moteur : une fiche n'affiche jamais une zone thérapeutique vide sans
 * explication. Chaque motif est construit à partir des règles réellement évaluées (indication, situation,
 * données manquantes, lecture de l'antibiogramme, propositions écartées) : aucun texte n'est rédigé
 * après coup pour justifier une absence de proposition.
 */
import type { ElementACompleter, EtatSortie, MotifSortie, Plan, PropositionEcartee, SourceRef } from '../clinical/types';
import type { ContexteDecision } from './contexte';
import { rattacherChamp } from './cibles';
import { libelleGerme } from '../clinical/microbiologie/germes';
import { LIBELLE_FOYER } from '../ui/libelles';

export const TEXTE_NON_COUVERTE =
  "L'application ne dispose pas actuellement d'une règle validée pour cette situation. Cela ne signifie pas qu'aucun traitement n'est indiqué.";
export const TEXTE_CONTRAINTES =
  "Le moteur ne peut pas proposer d'option validée qui respecte ces contraintes. Cela ne signifie pas qu'aucun traitement n'existe : l'avis spécialisé indiqué est nécessaire.";

export const ROLE_IMPACT: Record<ElementACompleter['impact'], string> = {
  bloque_decision: "empêche le choix de l'antibiotique ou la décision",
  bloque_dose: 'empêche seulement le calcul de la dose',
  bloque_duree: 'empêche seulement de fixer la durée',
  bloque_surveillance: 'empêche seulement de personnaliser la surveillance',
  affine: 'affinerait la proposition',
};

function element(champ: string, role: string, impact: ElementACompleter['impact'], cible?: string): ElementACompleter {
  return { texte: champ, role, impact, cible: cible ?? rattacherChamp(champ).cible };
}

function dedup<T>(liste: T[], cle: (x: T) => string): T[] {
  const vus = new Set<string>();
  return liste.filter((x) => (vus.has(cle(x)) ? false : (vus.add(cle(x)), true)));
}

/** Données d'entrée jugées incohérentes par le moteur (valeurs à vérifier, réponses contradictoires). */
export interface IncoherenceDossier {
  texte: string;
  cible?: string;
  sources: SourceRef[];
  origine: string;
}

export function incoherencesDossier(ctx: ContexteDecision): IncoherenceDossier[] {
  const res: IncoherenceDossier[] = [];
  for (const i of ctx.renal.incoherences) res.push({ texte: i.texte, cible: i.cible, sources: [], origine: 'calcul-renal' });
  for (const x of ctx.dossier.prelevements)
    if (x.type === 'urine' && x.urine?.nbEspeces === 'une' && (x.isolatsSupplementaires ?? []).some((i) => i.organisme !== undefined))
      res.push({ texte: 'ECBU : « une espèce » est indiqué, mais plusieurs germes sont saisis.', cible: 'prelevements', sources: [], origine: 'controle-ecbu' });
  return res;
}

export function etablirSortie(plan: Plan, ctx: ContexteDecision, ecartees: PropositionEcartee[]): EtatSortie {
  const ind = plan.indication;
  const decision = ind?.decision;
  const p = ctx.dossier.patient;
  const premieres = plan.options.filter((o) => o.rang === 'premiere_ligne');
  const manques = plan.donneesManquantes.map((m) => {
    const r = rattacherChamp(m.champ);
    return { ...m, domaine: r.domaine, cible: m.cible ?? r.cible };
  });
  const bloquants = manques.filter((m) => m.impact !== 'affine');
  const incoherents = incoherencesDossier(ctx).length > 0 || plan.microbiologie.some((m) => m.incoherences.length > 0);
  // Une donnée incohérente rend la proposition au mieux partielle : ce qui en dépend n'est pas fiable.
  const traitement: EtatSortie['traitement'] = plan.options.length === 0 ? 'aucun' : premieres.length === 0 || bloquants.length > 0 || incoherents ? 'partiel' : 'complet';

  const urgence = plan.urgence.niveau === 'immediate' || decision === 'urgence' || p.gravite === 'sepsis' || p.gravite === 'choc_septique';
  const actionsUrgentes = dedup(
    [
      ...(decision === 'urgence' && ind ? ind.actions.map((t) => ({ texte: t, sources: ind.sources })) : []),
      // Les alertes de niveau « urgence » restent affichées une seule fois, dans la barre permanente.
      ...plan.avisSpecialise.filter((a) => a.urgent).map((a) => ({ texte: a.texte, sources: a.sources })),
    ],
    (x) => x.texte,
  );

  const motifs: MotifSortie[] = [];
  const dejaTraitement = plan.options.map((o) => `${o.rang === 'premiere_ligne' ? '1re ligne' : o.rang === 'alternative' ? 'Alternative' : 'Conditionnelle'} : ${o.libelle}`);
  const avis = plan.avisSpecialise.map((a) => a.texte);

  /* G. Données incohérentes : à corriger avant tout. */
  const inco: IncoherenceDossier[] = [
    ...incoherencesDossier(ctx),
    ...plan.microbiologie.flatMap((m) => m.incoherences.map((x) => ({ texte: `${m.germe} : ${x.texte}`, cible: 'prelevements', sources: x.sources, origine: 'lecture-antibiogramme' }))),
  ];
  if (inco.length > 0)
    motifs.push({
      type: 'incoherence',
      rang: 10,
      statut: 'Données à vérifier',
      motif: inco.length === 1 ? inco[0].texte : `${inco.length} réponses ou valeurs sont contradictoires ou hors des valeurs plausibles.`,
      verifie: [],
      dejaPropose: dejaTraitement,
      aCompleter: inco.map((i) => element(i.texte, 'valeur contradictoire ou implausible : ce qui en dépend ne peut pas être calculé de façon fiable', 'bloque_decision', i.cible)),
      prochaineAction: 'Vérifier et corriger ces valeurs, puis relire la fiche recalculée.',
      sources: inco.flatMap((i) => i.sources),
      origine: dedup(inco.map((i) => i.origine), (x) => x),
    });

  /* F. Point non résolu par les sources (règle en brouillon) : pas de proposition automatisée. */
  if (ind?.pointNonResolu && decision !== 'traiter' && decision !== 'urgence')
    motifs.push({
      type: 'non_validee',
      rang: 45,
      statut: 'Recommandations absentes ou divergentes : pas de proposition automatisée',
      motif: ind.raison,
      verifie: ind.conditions,
      dejaPropose: ind.actions,
      aCompleter: [],
      prochaineAction: ind.actions.length ? ind.actions.join(' ; ') : 'Décision avec le SMIT.',
      sources: ind.sources,
      limite: `${ind.pointNonResolu} Cela ne signifie pas qu'aucun traitement n'est indiqué.`,
      origine: [ind.regleId],
    });
  /* F bis. Absence de recommandation dédiée, déclarée par une règle : expliquée, jamais comblée. */
  for (const a of plan.absencesRecommandation)
    motifs.push({
      type: 'non_validee',
      rang: 25,
      statut: 'Aucune recommandation dédiée : pas de proposition automatisée',
      motif: `${a.sujet} : aucune recommandation dédiée n'a été trouvée. L'application ne propose pas de schéma extrapolé d'autres situations.`,
      verifie: [],
      dejaPropose: [...a.aFaire, ...dejaTraitement],
      aCompleter: [],
      prochaineAction: a.aFaire.length ? a.aFaire.join(' ; ') : (avis[0] ?? 'Avis du SMIT.'),
      sources: a.sources,
      limite: `${a.recherche} Cela ne signifie pas qu'aucun traitement n'est indiqué.`,
      origine: [a.origine],
    });
  const masquees = ecartees.filter((e) => e.type === 'non_validee' || e.type === 'source_retiree');
  // Mode usage clinique : le masquage des règles non validées est la vraie cause ; il passe en tête.
  const masquageExplique = masquees.length > 0 && plan.options.length === 0;
  if (masquees.length > 0 && traitement !== 'complet')
    motifs.push({
      type: 'non_validee',
      rang: masquageExplique ? 15 : 50,
      statut: 'Proposition masquée : règle non validée ou source retirée',
      motif: masquees.map((e) => `${e.libelle} : ${e.raison}`).join(' ; '),
      verifie: [],
      dejaPropose: dejaTraitement,
      aCompleter: [],
      prochaineAction: 'Avis du SMIT : la proposition existe dans la base mais ne peut pas être affichée comme validée.',
      sources: masquees.flatMap((e) => e.sources),
      origine: dedup(masquees.map((e) => e.origine), (x) => x),
    });

  /* A. Antibiothérapie non indiquée. */
  if (decision === 'ne_pas_traiter' && ind)
    motifs.push({
      type: 'non_indiquee',
      rang: 70,
      statut: "Pas d'antibiothérapie indiquée",
      motif: ind.raison,
      verifie: [...ind.conditions, ...ind.exceptions],
      dejaPropose: ind.actions,
      aCompleter: [],
      prochaineAction:
        [ind.surveillance.length ? `Surveillance : ${ind.surveillance.join(' ; ')}` : '', ind.reconsiderer.length ? `Reconsidérer si : ${ind.reconsiderer.join(' ; ')}` : ''].filter(Boolean).join('. ') ||
        'Aucune action complémentaire prévue par la règle.',
      sources: ind.sources,
      origine: [ind.regleId],
    });

  /* C. Résultat microbiologique attendu ou insuffisant. */
  // Les données microbiologiques qui ne bloquent que la dose, la durée ou la surveillance relèvent de la « proposition incomplète ».
  const manquesMicro = decision === 'ne_pas_traiter' ? [] : manques.filter((m) => m.domaine === 'microbiologie' && (m.impact === 'bloque_decision' || m.impact === 'affine'));
  const documentee = premieres.some((o) => o.type === 'documente');
  const inconnues = decision === 'ne_pas_traiter' ? [] : plan.microbiologie.flatMap((m) => m.inconnues.map((x) => ({ ...x, germe: m.germe })));
  // Identification en attente : seul l'examen direct est connu.
  for (const x of ctx.dossier.prelevements)
    if (!x.organisme && x.examenDirect && x.examenDirect !== 'inconnu' && decision !== 'ne_pas_traiter')
      inconnues.push({ texte: `identification du germe (examen direct seul : ${x.examenDirect.toUpperCase()})`, pourquoi: 'le choix documenté et la lecture de l’antibiogramme dépendent de l’espèce', germe: x.type === 'hemoculture' ? 'Hémoculture' : 'Prélèvement' });
  if (decision === 'attendre_resultat' && ind)
    motifs.push({
      type: 'microbiologie_insuffisante',
      rang: 30,
      statut: 'Un résultat est nécessaire avant de conclure',
      motif: ind.raison,
      verifie: ind.conditions,
      dejaPropose: ind.actions,
      aCompleter: manquesMicro.map((m) => element(m.champ, m.pourquoi, m.impact, m.cible)),
      prochaineAction: ind.actions[0] ?? 'Obtenir le résultat attendu.',
      sources: ind.sources,
      origine: [ind.regleId],
    });
  else if ((manquesMicro.some((m) => m.impact !== 'affine') || (inconnues.length > 0 && !documentee)) && traitement !== 'complet' && !masquageExplique) {
    const probabilistes = plan.options.filter((o) => o.type === 'probabiliste');
    const determinants = plan.microbiologie.flatMap((m) => m.determinants.map((d) => `${m.germe} : ${d.texte}`));
    motifs.push({
      type: 'microbiologie_insuffisante',
      rang: 30,
      statut: 'Résultats microbiologiques insuffisants pour une proposition documentée',
      motif: [...manquesMicro.map((m) => `${m.champ} (${m.pourquoi})`), ...inconnues.map((x) => `${x.germe} : ${x.texte}`)].join(' ; '),
      verifie: determinants,
      dejaPropose: probabilistes.length
        ? probabilistes.map((o) => `Traitement probabiliste sourcé : ${o.libelle}`)
        : plan.options.length
          ? dejaTraitement
          : ['Aucun traitement probabiliste sourcé n’est modélisé pour ce contexte.'],
      aCompleter: [
        ...manquesMicro.map((m) => element(m.champ, m.pourquoi, m.impact, m.cible)),
        ...inconnues.map((x) => element(`${x.germe} : ${x.texte}`, x.pourquoi, 'affine', 'prelevements')),
      ],
      prochaineAction: 'Demander au laboratoire le résultat manquant puis le saisir dans l’antibiogramme guidé.',
      sources: [],
      origine: ['lecture-antibiogramme'],
    });
  }

  /* B. Informations manquantes (hors microbiologie). */
  const manquesDecision = manques.filter((m) => m.domaine !== 'microbiologie' && m.impact === 'bloque_decision');
  const insuffisant = decision === 'informations_insuffisantes' && !!ind && !ind.pointNonResolu;
  const questions = insuffisant && ind ? ind.questions.filter((q) => !manquesDecision.some((m) => m.champ === q)) : [];
  const rienSaisi = ctx.foyer === 'inconnu' && !ctx.organisme && ctx.dossier.prelevements.every((x) => !x.organisme) && !ind;
  if (rienSaisi && plan.options.length === 0)
    motifs.push({
      type: 'informations_manquantes',
      rang: 20,
      statut: 'Point de départ à renseigner',
      motif: 'Ni syndrome infectieux ni résultat microbiologique ne sont saisis : aucune règle de choix thérapeutique ne peut encore être évaluée.',
      verifie: [],
      dejaPropose: [],
      aCompleter: [element('Point d’entrée : syndrome ou résultat microbiologique', 'détermine les règles à évaluer', 'bloque_decision', 'entree')],
      prochaineAction: 'Choisir un syndrome ou saisir un résultat microbiologique.',
      sources: [],
      origine: ['moteur'],
    });
  else if (insuffisant || (manquesDecision.length > 0 && traitement !== 'complet'))
    motifs.push({
      type: 'informations_manquantes',
      rang: 20,
      statut: insuffisant ? "Informations insuffisantes pour décider de l'indication" : "Informations manquantes pour choisir l'antibiotique",
      motif: insuffisant && ind ? ind.raison : `${manquesDecision.length} donnée(s) empêche(nt) le choix de l'antibiotique ; la proposition affichée reste provisoire.`,
      verifie: ind?.conditions ?? [],
      dejaPropose: [...(insuffisant && ind ? ind.actions : []), ...dejaTraitement],
      aCompleter: [...questions.map((q) => element(q, "nécessaire pour conclure sur l'indication", 'bloque_decision')), ...manquesDecision.map((m) => element(m.champ, m.pourquoi, m.impact, m.cible))],
      prochaineAction: 'Compléter les données signalées : la fiche est recalculée à chaque saisie.',
      sources: insuffisant && ind ? ind.sources : [],
      origine: insuffisant && ind ? [ind.regleId] : ['donnees-manquantes'],
    });

  /* E. Aucune option de la base ne satisfait les contraintes. */
  const contraintes = ecartees.filter((e) => e.type === 'allergie' || e.type === 'resistance' || e.type === 'contre_indication');
  if (contraintes.length > 0 && premieres.length === 0 && decision !== 'ne_pas_traiter')
    motifs.push({
      type: 'contraintes',
      rang: 40,
      statut: 'Aucune option de la base ne satisfait les contraintes',
      motif: `Contraintes bloquantes : ${contraintes.map((e) => `${e.libelle} (${e.raison})`).join(' ; ')}`,
      verifie: [],
      dejaPropose: dejaTraitement,
      aCompleter: [],
      prochaineAction: avis[0] ?? 'Avis infectiologique (et allergologique si une allergie est en cause).',
      sources: contraintes.flatMap((e) => e.sources),
      limite: TEXTE_CONTRAINTES,
      origine: dedup(contraintes.map((e) => e.origine), (x) => x),
    });

  /* D. Situation non couverte : nommer la limite exacte. */
  const conclusionIndication = decision === 'ne_pas_traiter' || decision === 'attendre_resultat' || decision === 'informations_insuffisantes';
  if (plan.options.length === 0 && !conclusionIndication && !rienSaisi && !masquageExplique && plan.absencesRecommandation.length === 0 && !motifs.some((m) => m.type === 'contraintes' || m.type === 'informations_manquantes')) {
    motifs.push({
      type: 'non_couverte',
      rang: 60,
      statut: 'Situation non couverte par l’application',
      motif: `${plan.situation.libelle}. ${plan.situation.description}`,
      verifie: [],
      dejaPropose: [...avis, ...plan.gestes.map((g) => g.texte)],
      aCompleter: [],
      prochaineAction: avis[0] ?? 'Avis du SMIT.',
      sources: dedupRefs(plan.regles.flatMap((r) => r.sources)).slice(0, 6),
      limite: limiteCouverture(plan, ctx),
      origine: plan.regles.map((r) => r.id),
    });
  }

  /* B (partiel). Proposition affichée mais incomplète : dose, durée ou surveillance. */
  const partiels = bloquants.filter((m) => m.impact === 'bloque_dose' || m.impact === 'bloque_duree' || m.impact === 'bloque_surveillance');
  if (plan.options.length > 0 && partiels.length > 0)
    motifs.push({
      type: 'informations_manquantes',
      rang: 80,
      statut: 'Proposition incomplète',
      motif: 'Le choix de la molécule est établi ; des données manquent pour la dose, la durée ou la surveillance.',
      verifie: [],
      dejaPropose: dejaTraitement,
      aCompleter: partiels.map((m) => element(m.champ, `${ROLE_IMPACT[m.impact]} — ${m.pourquoi}`, m.impact, m.cible)),
      prochaineAction: 'Compléter les données signalées ; la dose de référence reste affichée en attendant.',
      sources: [],
      origine: ['donnees-manquantes'],
    });

  // Options seulement conditionnelles (aucune 1re ligne) sans autre explication : le dire.
  if (traitement === 'partiel' && premieres.length === 0 && motifs.length === 0)
    motifs.push({
      type: 'non_validee',
      rang: 55,
      statut: 'Pas d’option de 1re ligne : options conditionnelles seulement',
      motif: 'Les options affichées dépendent chacune d’une condition (voir leur libellé) ; aucune n’est proposée sans condition.',
      verifie: [],
      dejaPropose: dejaTraitement,
      aCompleter: [],
      prochaineAction: avis[0] ?? 'Vérifier les conditions de chaque option ; avis du SMIT.',
      sources: [],
      origine: ['moteur'],
    });

  // Filet de sécurité : jamais d'absence de proposition sans motif.
  if (traitement === 'aucun' && motifs.length === 0)
    motifs.push({
      type: 'non_couverte',
      rang: 60,
      statut: 'Situation non couverte par l’application',
      motif: `${plan.situation.libelle}. ${plan.situation.description}`,
      verifie: [],
      dejaPropose: avis,
      aCompleter: [],
      prochaineAction: avis[0] ?? 'Avis du SMIT.',
      sources: [],
      limite: limiteCouverture(plan, ctx),
      origine: plan.regles.map((r) => r.id),
    });

  // Urgence : l'absence de proposition ne doit jamais faire attendre.
  if (urgence && traitement !== 'complet')
    for (const m of motifs) {
      const premiere = actionsUrgentes[0]?.texte;
      const action = (premiere ?? 'appliquer les mesures urgentes affichées en haut de l’écran et demander un avis immédiat').replace(/[.\s]+$/, '');
      m.prochaineAction = `Ne pas attendre : ${action}.${m.prochaineAction ? ` Ensuite : ${m.prochaineAction}` : ''}`;
    }

  motifs.sort((a, b) => a.rang - b.rang);
  return { traitement, urgence, actionsUrgentes, motifs, ecartees };
}

function dedupRefs(refs: SourceRef[]): SourceRef[] {
  return dedup(refs, (r) => `${r.source}|${r.repere ?? ''}`);
}

/** Limite exacte de couverture : germe, foyer, terrain, technique d'épuration, association de facteurs. */
function limiteCouverture(plan: Plan, ctx: ContexteDecision): string {
  const p = ctx.dossier.patient;
  const l: string[] = [];
  if (ctx.organisme) l.push(`germe : ${libelleGerme(ctx.organisme)}`);
  if (ctx.foyer !== 'inconnu') l.push(`foyer : ${LIBELLE_FOYER[ctx.foyer]}`);
  if (p.neutropenie === 'oui') l.push('terrain : neutropénie');
  if (p.grossesse === 'oui') l.push('terrain : grossesse');
  if (p.renal.dialyse === 'dialyse_peritoneale') l.push('technique d’épuration : dialyse péritonéale');
  if (ctx.dossier.prelevements.some((x) => (x.isolatsSupplementaires ?? []).some((i) => i.organisme))) l.push('prélèvement polymicrobien');
  const combinaison = l.length > 1 ? ' (association de ces facteurs)' : '';
  return `${TEXTE_NON_COUVERTE}${l.length ? ` Limite : ${l.join(' ; ')}${combinaison} — situation retenue : ${plan.situation.libelle}.` : ''}`;
}

/** Sortie d'une panne du moteur : jamais traduite par « pas d'antibiothérapie indiquée ». */
export function sortieErreurTechnique(message: string, urgence = false): EtatSortie {
  return {
    traitement: 'aucun',
    urgence,
    // Sepsis ou choc déclarés : l'urgence ne disparaît pas avec la panne (SSC 2026 : antibiothérapie dans l'heure).
    actionsUrgentes: urgence
      ? [
          {
            texte: 'Ne pas attendre l’application : sepsis ou choc déclaré, antibiothérapie probabiliste dans l’heure selon le protocole local et avis réanimation / SMIT immédiat.',
            sources: [{ source: 'SSC-2026', repere: 'page SCCM', extrait: 'administering antimicrobial therapy immediately, ideally within 1 hr of recognition', justifie: 'autre' }],
          },
        ]
      : [],
    ecartees: [],
    motifs: [
      {
        type: 'erreur_technique',
        rang: 0,
        statut: 'Erreur technique du moteur — ce n’est pas une conclusion médicale',
        motif: `Le calcul n’a pas abouti (${message}). Aucune conclusion sur l’indication ni sur le traitement ne peut en être tirée.`,
        verifie: [],
        dejaPropose: [],
        aCompleter: [],
        prochaineAction: urgence
          ? 'Prise en charge urgente sans attendre l’application ; les données saisies sont conservées, réessayer ensuite et signaler l’erreur.'
          : 'Les données saisies sont conservées : réessayer. Si l’erreur persiste, décider sans l’application (avis du SMIT) et signaler l’erreur.',
        sources: [],
        origine: ['moteur'],
      },
    ],
  };
}
