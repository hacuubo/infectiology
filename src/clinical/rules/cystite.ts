/**
 * Cystite de la femme (simple, à risque de complication, récidivante, gravidique), cystite de l'homme,
 * colonisation gravidique et colonisation avant geste urologique.
 * Sources : HAS 2021 (fiches cystite et femme enceinte, mises à jour 2025), SPILF 2018 (Caron), SPILF 2026
 * (IU masculines), AFU/CIAFU 2026, RCP (BDPM) et CRAT — docs/sources/recherche-cystite.md.
 */
import type { Regle } from '../../engine/decider';
import type { ContexteDecision } from '../../engine/contexte';
import type { Prelevement, SourceRef } from '../types';
import { estimation } from '../../calc/renal';
import { reponseDetail } from '../syndromes/questions';
import { Fiche, S, adulte, bacteriemie, lireAntibiogramme, utilisable, type DureeDecidee, type ItemPrescription } from './outils';

const HAS_C = 'HAS-2021-cystite-femme';
const HAS_G = 'HAS-2021-femme-enceinte-IU';
const SP18 = 'SPILF-2018-IU-Caron';
const SP26 = 'SPILF-2026-IUM';
const AFU = 'AFU-2026-ECBU-geste';

export type FormeCystite = 'cystite_femme' | 'cystite_gravidique' | 'cystite_homme' | 'colonisation_gravidique' | 'colonisation_avant_geste';

/** Forme relevant de cette règle, d'après l'évaluation de l'ECBU ou, sans ECBU, d'après le foyer et la clinique. */
export function formeCystite(ctx: ContexteDecision): FormeCystite | undefined {
  if (!adulte(ctx) || bacteriemie(ctx)) return undefined;
  const p = ctx.dossier.patient;
  const c = ctx.dossier.clinique;
  const ev = ctx.evaluationECBU;
  if (ev) {
    if (ev.decision !== 'traiter') return undefined;
    if (ev.forme === 'colonisation_gravidique') return 'colonisation_gravidique';
    if (ev.forme === 'colonisation_avant_geste') return 'colonisation_avant_geste';
    if (ev.forme === 'cystite') return p.grossesse === 'oui' ? 'cystite_gravidique' : 'cystite_femme';
    if (p.sexe === 'homme' && c.fievre === 'non' && c.signesUrinaires === 'nouveaux') return 'cystite_homme';
    return undefined;
  }
  if (ctx.foyer !== 'urinaire' || c.fievre !== 'non' || c.signesUrinaires !== 'nouveaux') return undefined;
  if (p.sexe === 'homme') return 'cystite_homme';
  if (p.sexe === 'femme') return p.grossesse === 'oui' ? 'cystite_gravidique' : 'cystite_femme';
  return undefined;
}

const du = (sources: SourceRef[]): DureeDecidee => ({ texte: 'Prise unique', pointDeDepart: 'prise unique', dureePrevueJours: 1, sources });
const jours = (n: number, sources: SourceRef[], texte?: string): DureeDecidee => ({ texte: texte ?? `${n} jours`, pointDeDepart: 'premier jour de traitement', dureePrevueJours: n, sources });
const j135 = (sources: SourceRef[]): DureeDecidee => ({ texte: '3 prises : J1, J3 et J5', pointDeDepart: 'première prise', dureePrevueJours: 5, sources });

const FOSFO: ItemPrescription = { m: 'fosfomycine_trometamol', r: 'fosfo-3g-du' };
const FOSFO3: ItemPrescription = { m: 'fosfomycine_trometamol', r: 'fosfo-3g-j1j3j5' };
const PIVM: ItemPrescription = { m: 'pivmecillinam', r: 'pivmecillinam-400x2' };
const NITRO: ItemPrescription = { m: 'nitrofurantoine', r: 'nitrofurantoine-100x3' };
const TMP: ItemPrescription = { m: 'trimethoprime', r: 'trimethoprime-300' };
const AMOX: ItemPrescription = { m: 'amoxicilline', r: 'amoxicilline-po-1g8h' };
const AMOXCLAV: ItemPrescription = { m: 'amoxicilline_clavulanate', r: 'amoxclav-po-1g8h' };
const SMX: ItemPrescription = { m: 'cotrimoxazole', r: 'smx-tmp-800-160-x2' };

/** Antibiogramme de l'ECBU (premier prélèvement urinaire avec un germe). */
function ecbu(ctx: ContexteDecision): Prelevement | undefined {
  return ctx.urines.find((u) => u.organisme !== undefined) ?? ctx.urines[0];
}

/** Facteurs de risque de complication (HAS 2021 ; SPILF 2015 p. 6) : « oui », « non » ou « inconnu » avec les données manquantes. */
function risqueComplication(ctx: ContexteDecision): { risque: 'oui' | 'non' | 'inconnu'; raisons: string[]; manquants: string[] } {
  const p = ctx.dossier.patient;
  const raisons: string[] = [];
  const manquants: string[] = [];
  const anomalie = reponseDetail(ctx.dossier, 'urinaire.anomalie');
  if (anomalie === 'oui') raisons.push('anomalie de l\'arbre urinaire');
  else if (anomalie === 'inconnu') manquants.push('anomalie organique ou fonctionnelle de l\'arbre urinaire');
  if (p.immunodepression === 'oui') raisons.push('immunodépression');
  else if (p.immunodepression === 'inconnu') manquants.push('immunodépression');
  if (p.age === undefined) manquants.push('âge');
  else if (p.age > 75) raisons.push('âge > 75 ans');
  else if (p.age > 65) {
    const fried = reponseDetail(ctx.dossier, 'urinaire.fried');
    if (fried === 'oui') raisons.push('> 65 ans avec au moins 3 critères de Fried');
    else if (fried === 'inconnu') manquants.push('critères de fragilité de Fried');
  }
  if (['hemodialyse_intermittente', 'eer_continue', 'dialyse_peritoneale'].includes(p.renal.dialyse)) raisons.push('insuffisance rénale sévère (dialyse)');
  else {
    const dfg = estimation(ctx.renal, 'dfg_indexe');
    const v = dfg.calculable ? dfg.valeur : p.renal.dfg?.valeur;
    if (v !== undefined && v < 30) raisons.push('insuffisance rénale sévère (DFG < 30)');
    else if (v === undefined) manquants.push('fonction rénale (insuffisance rénale sévère ?)');
  }
  return { risque: raisons.length ? 'oui' : manquants.length ? 'inconnu' : 'non', raisons, manquants };
}

const SRC_FDR = S(HAS_C, 'facteurs de risque de complication', 'la grossesse, toute anomalie organique ou fonctionnelle de l\'arbre urinaire, l\'insuffisance rénale sévère (débit de filtration glomérulaire < 30 ml/min), l\'immunodépression grave, un âge supérieur à 75 ans', 'definition');

export const R_CYSTITE: Regle = {
  id: 'R-CYSTITE',
  libelle: 'Cystite, colonisation gravidique et colonisation avant geste urologique',
  description: 'HAS 2021 (mises à jour 2025), SPILF 2018, SPILF 2026 (homme), AFU/CIAFU 2026 ; RCP et CRAT des molécules.',
  statut: 'verifiee_ia',
  priorite: 158,
  sources: [S(HAS_C, 'fiche mémo', undefined, 'choix'), S(HAS_G, 'fiche mémo', undefined, 'choix'), S(SP18, 'p. 346-353', undefined, 'choix')],
  sApplique: (ctx) => formeCystite(ctx) !== undefined,
  appliquer: (ctx) => {
    const forme = formeCystite(ctx)!;
    const f = new Fiche(ctx, 'verifiee_ia');
    const prl = ecbu(ctx);
    const atb = lireAntibiogramme(prl);
    const abg = prl?.stade === 'antibiogramme' && (prl.antibiogramme?.length ?? 0) > 0;
    const sensible = (dci: string) => abg && utilisable(atb.sir(dci));
    switch (forme) {
      case 'cystite_femme':
        cystiteFemme(ctx, f, abg, sensible);
        break;
      case 'cystite_gravidique':
        cystiteGravidique(f, abg, sensible);
        break;
      case 'colonisation_gravidique':
        colonisationGravidique(f, abg, sensible);
        break;
      case 'colonisation_avant_geste':
        colonisationAvantGeste(f, abg, sensible);
        break;
      case 'cystite_homme':
        cystiteHomme(ctx, f, abg, sensible);
        break;
    }
    return f.fin();
  },
};

type Sensible = (dci: string) => boolean;

function cystiteFemme(ctx: ContexteDecision, f: Fiche, abg: boolean, sensible: Sensible) {
  const recidivante = reponseDetail(ctx.dossier, 'urinaire.recidivante') === 'oui';
  const { risque, raisons, manquants } = risqueComplication(ctx);
  if (recidivante)
    f.alerte('info', 'Cystite récidivante (au moins 4 épisodes en 12 mois) : l\'épisode se traite comme une cystite ; pas de nitrofurantoïne. Une antibioprophylaxie ne se discute que si au moins 1 épisode par mois, après échec des mesures non antibiotiques : avis spécialisé.', [
      S(HAS_C, 'cystite récidivante', 'Le traitement curatif d\'un épisode de cystite récidivante est celui d\'une cystite.', 'choix'),
      S(SP18, 'p. 348', 'Dans cette indication l\'administration de nitrofurantoïne est non recommandée (risque de toxicité grave favorisée par les ré-introductions)', 'choix'),
      S(HAS_C, 'antibioprophylaxie', 'si au moins 1 épisode par mois', 'choix'),
    ]);
  if (risque === 'non') {
    f.situation('cystite-simple', 'Cystite simple', 'couverte', 'Femme sans facteur de risque de complication : bandelette urinaire seule, pas d\'ECBU ; traitement probabiliste.');
    f.controle({ id: 'ctl-cystite-ecbu-echec', type: 'prelevement', categorie: 'conditionnel', quoi: 'ECBU', quand: { ancre: 'debut_traitement', offsetHeures: 72, texte: 'Seulement si persistance ou aggravation des signes après 3 jours, ou récidive dans les 2 semaines' }, pourquoi: 'Pas d\'ECBU dans la cystite simple, sauf évolution défavorable.', sources: [S(HAS_C, 'cystite simple', 'Pas d\'ECBU sauf si évolution défavorable (persistance ou aggravation des signes cliniques après 3 jours ou de récidive précoce dans les 2 semaines).', 'controle_micro')] });
    f.option({ id: 'cystite-simple-fosfo', libelle: 'Fosfomycine-trométamol en prise unique', type: 'probabiliste', rang: 'premiere_ligne', items: [FOSFO], duree: du([S(HAS_C, 'cystite simple', '1 re intention : fosfomycine-trométamol, 3 g en prise unique', 'duree')]), sources: [S(HAS_C, 'cystite simple', '1 re intention : fosfomycine-trométamol, 3 g en prise unique', 'choix'), S(SP18, 'p. 346', 'en 1re intention à la fosfomycine trométamol en dose unique (I-A)', 'choix')] });
    f.option({
      id: 'cystite-simple-pivm',
      libelle: 'Pivmécillinam',
      type: 'probabiliste',
      rang: 'alternative',
      items: [PIVM],
      // Divergence non tranchée : 3 jours (HAS 2021, mise à jour 2025) ou 5 jours (SPILF 2018, RCP).
      statut: 'brouillon',
      duree: { texte: '3 jours selon la HAS ; 5 jours selon la SPILF 2018 et le RCP (divergence non tranchée)', pointDeDepart: 'premier jour de traitement', sources: [S(HAS_C, 'cystite simple', '2 e intention : pivmécillinam : 400 mg 2 fois par jour pendant 3 jours', 'duree'), S(SP18, 'p. 346', 'en 2e intention au pivmécillinam pendant 5 j (I-A)', 'duree'), S('RCP-pivmecillinam', '§4.2 (tableau)', 'Cystites aiguës non compliquées : 400 mg x 2/jour pendant 5 jours', 'duree')] },
      sources: [S(HAS_C, 'cystite simple', '2 e intention : pivmécillinam', 'choix')],
      commentaire: 'Les autres antibiotiques ne sont pas indiqués (HAS). Si ni la fosfomycine ni le pivmécillinam ne sont possibles : ECBU et traitement documenté comme une cystite à risque de complication (SPILF 2018).',
    });
    return;
  }
  if (risque === 'inconnu') {
    f.situation('cystite-risque-a-preciser', 'Cystite : facteurs de risque de complication à préciser', 'partielle', `À préciser : ${manquants.join(', ')}. Sans facteur de risque, la cystite est simple (bandelette, traitement probabiliste) ; avec un facteur de risque, ECBU et traitement différé.`);
    for (const m of manquants) f.manque(m, 'cystite simple ou à risque de complication (HAS)', 'bloque_decision');
    f.option({ id: 'cystite-simple-fosfo', libelle: 'Fosfomycine-trométamol en prise unique', type: 'probabiliste', rang: 'conditionnelle', condition: 'si aucun facteur de risque de complication (cystite simple)', items: [FOSFO], duree: du([S(HAS_C, 'cystite simple', '1 re intention : fosfomycine-trométamol, 3 g en prise unique', 'duree')]), sources: [S(HAS_C, 'cystite simple', '1 re intention : fosfomycine-trométamol, 3 g en prise unique', 'choix'), SRC_FDR] });
    return;
  }
  // Cystite à risque de complication.
  const differable = reponseDetail(ctx.dossier, 'urinaire.differable');
  f.situation('cystite-a-risque', 'Cystite à risque de complication', 'couverte', `Facteur(s) : ${raisons.join(', ')}. ECBU systématique ; traitement différé jusqu'à l'antibiogramme, à privilégier.`);
  f.alerte('info', `Cystite à risque de complication (${raisons.join(', ')}).`, [SRC_FDR]);
  f.controle({ id: 'ctl-cystite-ecbu', type: 'prelevement', categorie: 'indique', quoi: 'ECBU avec antibiogramme', quand: { ancre: 'avant_traitement', texte: 'Avant tout antibiotique' }, pourquoi: 'Cystite à risque de complication : ECBU systématique ; traitement adapté à l\'antibiogramme.', sources: [S(SP18, 'p. 346', 'Un ECBU doit être systématiquement réalisé (II-B).', 'controle_micro')] });
  const d7 = jours(7, [S(HAS_C, 'cystite à risque, différé', 'amoxicilline : 1g 3 fois par jour pendant 7 jours', 'duree')]);
  if (abg) {
    // Différé, selon l'antibiogramme (HAS : 3 lignes ; SPILF 2018 ajoute fosfomycine 3 doses puis triméthoprime).
    const choix = [
      { dci: 'amoxicilline', item: AMOX, lib: 'Amoxicilline', src: S(HAS_C, 'cystite à risque, différé', 'amoxicilline : 1g 3 fois par jour pendant 7 jours', 'choix') },
      { dci: 'mecillinam', item: PIVM, lib: 'Pivmécillinam', src: S(HAS_C, 'cystite à risque, différé', 'pivmécillinam : 400 mg 2 fois par jour pendant 7 jours', 'choix') },
      ...(recidivante ? [] : [{ dci: 'nitrofurantoine', item: NITRO, lib: 'Nitrofurantoïne', src: S(HAS_C, 'cystite à risque, différé', 'nitrofurantoïne : 100 mg 3 fois par jour pendant 7 jours', 'choix') }]),
    ].filter((x) => sensible(x.dci));
    choix.forEach((x, i) => f.option({ id: `cystite-risque-doc-${x.dci}`, libelle: `${x.lib} (souche sensible)`, type: 'documente', rang: i === 0 ? 'premiere_ligne' : 'alternative', items: [x.item], duree: d7, sources: [x.src, S(SP18, 'p. 346', 'soit en 1ère intention l\'amoxicilline (7 j), en 2e le pivmécillinam (7 j), en 3e la nitrofurantoïne (7 j)', 'choix')] }));
    if (choix.length === 0) {
      if (sensible('fosfomycine')) f.option({ id: 'cystite-risque-doc-fosfo3', libelle: 'Fosfomycine-trométamol, 3 prises (J1, J3, J5) — hors AMM', type: 'documente', rang: 'premiere_ligne', items: [FOSFO3], duree: j135([S(SP18, 'p. 346', 'en 4e la fosfomycine trométamol (3 doses espacées chacune de 48 h)', 'duree')]), statut: 'brouillon', sources: [S(SP18, 'p. 346', 'en 4e la fosfomycine trométamol (3 doses espacées chacune de 48 h), en 5e le TMP (5 j)', 'choix')], commentaire: '4e intention de la SPILF 2018, absente de la fiche HAS : à valider.' });
      if (sensible('trimethoprime')) f.option({ id: 'cystite-risque-doc-tmp', libelle: 'Triméthoprime', type: 'documente', rang: sensible('fosfomycine') ? 'alternative' : 'premiere_ligne', items: [TMP], duree: jours(5, [S(SP18, 'p. 346', 'en 5e le TMP (5 j)', 'duree')]), statut: 'brouillon', sources: [S(SP18, 'p. 346', 'en 5e le TMP (5 j)', 'choix')], commentaire: '5e intention de la SPILF 2018, absente de la fiche HAS : à valider.' });
      if (!sensible('fosfomycine') && !sensible('trimethoprime')) {
        f.absence('Cystite à risque de complication : aucune des molécules recommandées n\'est sensible', 'Les recommandations lues (HAS 2021, SPILF 2018) ne donnent pas de choix au-delà de l\'amoxicilline, du pivmécillinam, de la nitrofurantoïne, de la fosfomycine (3 doses) et du triméthoprime.', ['Avis du SMIT, avec l\'antibiogramme complet'], [S(SP18, 'p. 346', undefined, 'choix')]);
      }
    }
    return;
  }
  // Pas encore d'antibiogramme : différer si possible ; sinon probabiliste.
  const nonDifferable = differable === 'non';
  if (differable === 'inconnu') f.manque('possibilité de différer le traitement jusqu\'à l\'antibiogramme', 'cystite à risque : traitement différé à privilégier, probabiliste seulement si la patiente est très symptomatique', 'affine');
  f.reeval('Traitement différé à privilégier : débuter l\'antibiotique adapté dès l\'antibiogramme (amoxicilline, sinon pivmécillinam, sinon nitrofurantoïne ; 7 jours). En cas de traitement probabiliste, adaptation systématique à l\'antibiogramme.', [S(HAS_C, 'cystite à risque', 'Traitement différé à privilégier', 'choix')]);
  const rang = nonDifferable ? ('premiere_ligne' as const) : ('conditionnelle' as const);
  const cond = nonDifferable ? undefined : 'seulement si le traitement ne peut pas être différé (patiente très symptomatique)';
  if (!recidivante)
    f.option({ id: 'cystite-risque-proba-nitro', libelle: 'Nitrofurantoïne (probabiliste)', type: 'probabiliste', rang, condition: cond, items: [NITRO], duree: jours(7, [S(HAS_C, 'cystite à risque, probabiliste', '1 re intention : nitrofurantoïne : 100 mg 3 fois par jour pendant 7 jours', 'duree')]), sources: [S(HAS_C, 'cystite à risque, probabiliste', '1 re intention : nitrofurantoïne : 100 mg 3 fois par jour pendant 7 jours', 'choix')], commentaire: 'Contre-indiquée si DFG < 45 mL/min, traitements itératifs, déficit en G6PD ou antécédent d\'effet indésirable sous nitrofurantoïne (RCP, HAS).' });
  f.option({ id: 'cystite-risque-proba-fosfo3', libelle: 'Fosfomycine-trométamol, 3 prises (J1, J3, J5) — hors AMM', type: 'probabiliste', rang: recidivante ? rang : nonDifferable ? 'alternative' : 'conditionnelle', condition: cond, items: [FOSFO3], duree: j135([S(HAS_C, 'cystite à risque, probabiliste', '2 e intention : fosfomycine-trométamol : 3 g à J1, J3 et J5', 'duree')]), sources: [S(HAS_C, 'cystite à risque, probabiliste', '2 e intention : fosfomycine-trométamol : 3 g à J1, J3 et J5', 'choix')] });
}

function cystiteGravidique(f: Fiche, abg: boolean, sensible: Sensible) {
  f.situation('cystite-gravidique', 'Cystite gravidique', 'couverte', 'ECBU puis traitement probabiliste sans attendre l\'antibiogramme ; adaptation en cas d\'échec ou de résistance.');
  f.controle({ id: 'ctl-gravidique-ecbu', type: 'prelevement', categorie: 'indique', quoi: 'ECBU avec antibiogramme', quand: { ancre: 'avant_traitement', texte: 'Avant le traitement' }, pourquoi: 'Cystite gravidique : ECBU systématique.', sources: [S(HAS_G, 'cystite gravidique', 'Traitement probabiliste, à débuter sans attendre le résultat de l\'antibiogramme', 'controle_micro')] });
  suiviGravidique(f);
  const srcProba = [S(HAS_G, 'cystite gravidique', 'Traitement probabiliste, à débuter sans attendre le résultat de l\'antibiogramme', 'choix')];
  const fosfoActive = !abg || sensible('fosfomycine');
  const pivmActif = !abg || sensible('mecillinam');
  if (fosfoActive) f.option({ id: 'gravidique-fosfo', libelle: 'Fosfomycine-trométamol en prise unique', type: abg ? 'documente' : 'probabiliste', rang: 'premiere_ligne', items: [FOSFO], duree: du([S(HAS_G, 'cystite gravidique', '1re : fosfomycine-trométamol : 3 g en prise unique', 'duree')]), sources: [...srcProba, S(SP18, 'p. 353', 'Le seul traitement de 1re intention désormais recommandé… est la fosfomycine trométamol à dose unique (II-B)', 'choix')] });
  if (pivmActif) f.option({ id: 'gravidique-pivm', libelle: 'Pivmécillinam', type: abg ? 'documente' : 'probabiliste', rang: fosfoActive ? 'alternative' : 'premiere_ligne', items: [PIVM], duree: jours(7, [S(HAS_G, 'cystite gravidique', '2e : pivmécillinam : 400 mg 2 fois par jour pendant 7 jours', 'duree')]), sources: [...srcProba, S('RCP-pivmecillinam', '§4.2 (tableau)', 'Cystites à risque de complication, incluant les cystites gravidiques : 400 mg x 2/jour pendant 7 jours', 'posologie')] });
  if (abg && !fosfoActive && !pivmActif) {
    // « En cas d'échec ou de résistance » (HAS) : amoxicilline > triméthoprime > nitrofurantoïne > cotrimoxazole ou amoxicilline-acide clavulanique.
    relaisGravidique(f, sensible, 'cystite');
  } else if (abg) {
    f.reeval('En cas d\'échec ou de résistance : amoxicilline, puis triméthoprime (pas au 1er trimestre), puis nitrofurantoïne, puis cotrimoxazole ou amoxicilline-acide clavulanique, 7 jours, selon l\'antibiogramme (HAS).', [S(HAS_G, 'cystite gravidique, échec ou résistance', '1re « amoxicilline : 1 g 3 fois par jour pendant 7 jours »', 'choix')]);
  }
}

/** Ordre HAS commun à la colonisation gravidique (après fosfomycine/pivmécillinam) et à l'échec de la cystite gravidique. */
function relaisGravidique(f: Fiche, sensible: Sensible, contexte: 'cystite' | 'colonisation') {
  const d7 = (extrait: string) => jours(7, [S(HAS_G, contexte === 'cystite' ? 'cystite gravidique, échec ou résistance' : 'colonisation gravidique', extrait, 'duree')]);
  const liste = [
    { dci: 'amoxicilline', item: AMOX, lib: 'Amoxicilline', ex: 'amoxicilline : 1 g 3 fois par jour pendant 7 jours' },
    { dci: 'trimethoprime', item: TMP, lib: 'Triméthoprime (pas au 1er trimestre)', ex: 'triméthoprime : 300 mg par jour pendant 7 jours, à éviter avant 10 semaines d\'aménorrhée' },
    { dci: 'nitrofurantoine', item: NITRO, lib: 'Nitrofurantoïne (contre-indiquée en fin de grossesse)', ex: 'nitrofurantoïne : 100 mg 3 fois par jour pendant 7 jours' },
    { dci: 'cotrimoxazole', item: SMX, lib: 'Cotrimoxazole (à éviter avant 10 SA)', ex: 'cotrimoxazole : 800 mg/160 mg 2 fois par jour pendant 7 jours, à éviter avant 10 semaines d\'aménorrhée' },
    { dci: 'amoxicilline_clavulanate', item: AMOXCLAV, lib: 'Amoxicilline-acide clavulanique', ex: 'amoxicilline + acide clavulanique : 1 g 3 fois par jour pendant 7 jours' },
  ].filter((x) => sensible(x.dci));
  liste.forEach((x, i) => f.option({ id: `gravidique-${contexte}-${x.dci}`, libelle: `${x.lib} (souche sensible)`, type: 'documente', rang: i === 0 ? 'premiere_ligne' : 'alternative', items: [x.item], duree: d7(x.ex), sources: [S(HAS_G, contexte === 'cystite' ? 'cystite gravidique, échec ou résistance' : 'colonisation gravidique', x.ex, 'choix')] }));
  if (liste.length === 0) f.absence(`${contexte === 'cystite' ? 'Cystite' : 'Colonisation'} gravidique : aucune molécule de la liste HAS n'est sensible`, 'La fiche HAS « Femme enceinte : colonisation urinaire et cystite » (mise à jour 2025) ne propose pas d\'autre molécule.', ['Avis du SMIT et de l\'obstétricien, avec l\'antibiogramme complet'], [S(HAS_G, 'fiche mémo', undefined, 'choix')]);
}

function suiviGravidique(f: Fiche) {
  f.controle({ id: 'ctl-gravidique-suivi', type: 'prelevement', categorie: 'indique', quoi: 'ECBU de contrôle, puis ECBU mensuel jusqu\'à l\'accouchement', quand: { ancre: 'non_determine', texte: '8 à 10 jours après l\'arrêt du traitement, puis tous les mois' }, pourquoi: 'Suivi de la bactériurie gravidique.', sources: [S(HAS_G, 'contrôle', 'ECBU de contrôle 8 à 10 jours après l\'arrêt du traitement, puis ECBU mensuel jusqu\'à l\'accouchement.', 'controle_micro')] });
}

function colonisationGravidique(f: Fiche, abg: boolean, sensible: Sensible) {
  f.situation('colonisation-gravidique', 'Colonisation urinaire gravidique', 'couverte', 'Traitement adapté à l\'antibiogramme, dès réception des résultats ; pas de traitement probabiliste.');
  suiviGravidique(f);
  if (!abg) {
    f.manque('antibiogramme de l\'ECBU', 'colonisation gravidique : traitement adapté à l\'antibiogramme, pas de probabiliste (HAS)', 'bloque_decision');
    return;
  }
  const premiers = [
    { dci: 'amoxicilline', item: AMOX, lib: 'Amoxicilline', duree: jours(7, [S(HAS_G, 'colonisation gravidique', 'amoxicilline : 1 g 3 fois par jour pendant 7 jours', 'duree')]), ex: 'amoxicilline : 1 g 3 fois par jour pendant 7 jours' },
    { dci: 'mecillinam', item: PIVM, lib: 'Pivmécillinam', duree: jours(7, [S(HAS_G, 'colonisation gravidique', 'pivmécillinam : 400 mg 2 fois par jour, pendant 7 jours', 'duree')]), ex: 'pivmécillinam : 400 mg 2 fois par jour, pendant 7 jours' },
    { dci: 'fosfomycine', item: FOSFO, lib: 'Fosfomycine-trométamol en prise unique', duree: du([S(HAS_G, 'colonisation gravidique', 'fosfomycine-trométamol : 3 g en prise unique', 'duree')]), ex: 'fosfomycine-trométamol : 3 g en prise unique' },
  ].filter((x) => sensible(x.dci));
  premiers.forEach((x, i) => f.option({ id: `colonisation-gravidique-${x.dci}`, libelle: `${x.lib} (souche sensible)`, type: 'documente', rang: i === 0 ? 'premiere_ligne' : 'alternative', items: [x.item], duree: x.duree, sources: [S(HAS_G, 'colonisation gravidique', 'Traitement adapté aux résultats de l\'antibiogramme, à commencer dès réception des résultats (pas de traitement probabiliste)', 'choix'), S(HAS_G, 'colonisation gravidique', x.ex, 'posologie')] }));
  if (premiers.length === 0) relaisGravidique(f, (d) => d !== 'amoxicilline' && sensible(d), 'colonisation');
}

function colonisationAvantGeste(f: Fiche, abg: boolean, sensible: Sensible) {
  f.situation('colonisation-avant-geste', 'Colonisation urinaire avant geste urologique', 'partielle', 'Traitement adapté à l\'antibiogramme, débuté 48 h avant le geste et poursuivi au plus 48 h après (3 à 5 jours). L\'AFU ne donne pas de posologie : celles affichées sont les posologies de la cystite (brouillon).');
  const duree: DureeDecidee = { texte: 'Débuté 48 h avant le geste, poursuivi au minimum jusqu\'au jour du geste et au maximum 48 h après : 3 à 5 jours', pointDeDepart: '48 h avant le geste', dureePrevueJours: 5, sources: [S(AFU, 'Q3 R2 (Grade C)', 'celle-ci sera débutée 48 heures avant le geste chirurgical et sera poursuivie au minimum à J0 et au maximum 48 heures après le geste, soit un total de 3 à 5 jours', 'duree')] };
  if (!abg) {
    f.manque('antibiogramme de l\'ECBU', 'colonisation avant geste : traitement adapté à l\'antibiogramme (AFU 2026)', 'bloque_decision');
    return;
  }
  const srcR4 = S(AFU, 'Q3 R4 (Grade AE)', 'En 1ère intention : Fosfomycine-trométamol (J-2 / J0), Nitrofurantoïne, Pivmécillinam, et Triméthoprime', 'choix');
  const premiere = [
    { dci: 'fosfomycine', item: FOSFO, lib: 'Fosfomycine-trométamol (J-2 et J0)', duree: { ...duree, texte: 'Deux prises : J-2 et le jour du geste (AFU) ; dose par prise non précisée par l\'AFU (3 g : posologie de la cystite)', dureePrevueJours: 3 } },
    { dci: 'nitrofurantoine', item: NITRO, lib: 'Nitrofurantoïne', duree },
    { dci: 'mecillinam', item: PIVM, lib: 'Pivmécillinam', duree },
    { dci: 'trimethoprime', item: TMP, lib: 'Triméthoprime', duree },
  ].filter((x) => sensible(x.dci));
  const seconde = [
    { dci: 'amoxicilline', item: AMOX, lib: 'Amoxicilline', duree },
    { dci: 'cotrimoxazole', item: SMX, lib: 'Cotrimoxazole', duree },
  ].filter((x) => sensible(x.dci));
  const liste = premiere.length ? premiere : seconde.length ? seconde : sensible('amoxicilline_clavulanate') ? [{ dci: 'amoxicilline_clavulanate', item: AMOXCLAV, lib: 'Amoxicilline-acide clavulanique', duree }] : [];
  liste.forEach((x) =>
    f.option({ id: `avant-geste-${x.dci}`, libelle: `${x.lib} (souche sensible)`, type: 'documente', rang: 'premiere_ligne', items: [x.item], duree: x.duree, statut: 'brouillon', sources: [srcR4], commentaire: 'Molécules de même rang, citées par ordre alphabétique (AFU). Posologie non donnée par l\'AFU : reprise de la cystite, à valider. Hors AMM chez l\'homme pour la fosfomycine, la nitrofurantoïne, le pivmécillinam et le triméthoprime (RCP).' }),
  );
  if (liste.length === 0) f.absence('Colonisation avant geste : aucune molécule des trois premières intentions AFU n\'est sensible', 'AFU 2026 Q3 R4 cite ensuite les fluoroquinolones et le céfixime, puis « autres antibiotiques », sans posologie.', ['Avis du SMIT ou de l\'urologue référent'], [srcR4]);
}

function cystiteHomme(ctx: ContexteDecision, f: Fiche, abg: boolean, sensible: Sensible) {
  const differable = reponseDetail(ctx.dossier, 'urinaire.differable');
  f.situation('cystite-homme', 'Cystite de l\'homme (infection urinaire masculine sans fièvre)', 'couverte', 'SPILF 2026 : pas de « cystite simple » chez l\'homme. ECBU systématique ; si bonne tolérance, attendre l\'ECBU ; 7 jours (fosfomycine : 3 prises). Molécules hors AMM chez l\'homme (RCP).');
  f.controle({ id: 'ctl-cystite-homme-ecbu', type: 'prelevement', categorie: 'indique', quoi: 'ECBU (pas de bandelette ; pas de PSA ni de marqueur inflammatoire)', quand: { ancre: 'avant_traitement', texte: 'Avant tout antibiotique' }, pourquoi: 'Seul examen recommandé pour confirmer le diagnostic.', sources: [S(SP26, 'diapo 8', 'ECBU : seul examen complémentaire recommandé pour confirmer le diagnostic', 'controle_micro')] });
  f.controle({ id: 'ctl-cystite-homme-echo', type: 'imagerie', categorie: 'indique', quoi: 'Échographie des voies urinaires avec mesure du résidu post-mictionnel', quand: { ancre: 'non_determine', texte: 'Dès le premier épisode' }, pourquoi: 'Bilan de l\'infection urinaire masculine.', sources: [S(SP26, 'diapo 36-38', 'Echographie des voies urinaires avec mesure du résidu post-mictionnel (RPM)', 'imagerie')] });
  const d7 = jours(7, [S(SP26, 'diapo 11', '7 jours — Sauf fosfomycine-trometamol : 3 doses (J1-J3-J5)', 'duree')]);
  const d135 = j135([S(SP26, 'diapo 11', '7 jours — Sauf fosfomycine-trometamol : 3 doses (J1-J3-J5)', 'duree')]);
  const horsAmm = 'Hors AMM chez l\'homme (RCP) ; nitrofurantoïne : « n\'est pas adapté aux infections urinaires chez l\'homme » selon son RCP.';
  if (abg) {
    const liste = [
      { dci: 'amoxicilline', item: AMOX, lib: 'Amoxicilline', duree: d7 },
      { dci: 'fosfomycine', item: FOSFO3, lib: 'Fosfomycine-trométamol (J1, J3, J5)', duree: d135 },
      { dci: 'nitrofurantoine', item: NITRO, lib: 'Nitrofurantoïne', duree: d7 },
      { dci: 'mecillinam', item: PIVM, lib: 'Pivmécillinam', duree: d7 },
      { dci: 'trimethoprime', item: TMP, lib: 'Triméthoprime', duree: d7 },
    ].filter((x) => sensible(x.dci));
    liste.forEach((x) => f.option({ id: `cystite-homme-doc-${x.dci}`, libelle: `${x.lib} (souche sensible)`, type: 'documente', rang: 'premiere_ligne', items: [x.item], duree: x.duree, sources: [S(SP26, 'diapo 10', 'Amoxicilline 1 gx3/j ; Fosfomycine-trométamol 3 g/prise ; Nitrofurantoïne 100 mgx3/j ; Pivmécillinam 400 mgx2/j ; Triméthoprime 300 mgx1/j', 'choix')], commentaire: `Molécules citées par ordre alphabétique (SPILF 2026), sans hiérarchie. Poursuivre le probabiliste s'il est actif. ${x.dci === 'amoxicilline' ? '' : horsAmm}` }));
    if (liste.length === 0) f.absence('Cystite de l\'homme : aucune des molécules de la SPILF 2026 n\'est sensible', 'SPILF 2026 (diapo 10) ne cite pas d\'autre molécule pour la cystite masculine.', ['Avis du SMIT avec l\'antibiogramme complet'], [S(SP26, 'diapo 10', undefined, 'choix')]);
    return;
  }
  if (differable === 'inconnu') f.manque('possibilité de différer le traitement jusqu\'à l\'ECBU', 'bonne tolérance : attendre l\'ECBU (SPILF 2026)', 'affine');
  const rang = differable === 'non' ? ('premiere_ligne' as const) : ('conditionnelle' as const);
  const cond = differable === 'non' ? undefined : 'seulement si le traitement ne peut pas attendre l\'ECBU (mauvaise tolérance)';
  const src = [S(SP26, 'diapo 9', 'traitement oral probabiliste, par ordre alphabétique : Fosfomycine-trométamol (3 g à J1-J3-J5) ; Nitrofurantoïne 100 mgx3/j ; Pivmécillinam 400 mgx2/j', 'choix')];
  f.reeval('Si bonne tolérance ou diagnostic douteux : attendre l\'ECBU pour débuter un antibiotique adapté.', [S(SP26, 'diapo 9', 'Si bonne tolérance ou diagnostic douteux : attendre les résultats de l\'ECBU pour débuter un traitement antibiotique adapté', 'choix')]);
  f.option({ id: 'cystite-homme-fosfo', libelle: 'Fosfomycine-trométamol (J1, J3, J5)', type: 'probabiliste', rang, condition: cond, items: [FOSFO3], duree: d135, sources: src, commentaire: `Ordre alphabétique (SPILF 2026), sans hiérarchie. ${horsAmm}` });
  f.option({ id: 'cystite-homme-nitro', libelle: 'Nitrofurantoïne', type: 'probabiliste', rang, condition: cond, items: [NITRO], duree: d7, sources: src, commentaire: horsAmm });
  f.option({ id: 'cystite-homme-pivm', libelle: 'Pivmécillinam', type: 'probabiliste', rang, condition: cond, items: [PIVM], duree: d7, sources: src, commentaire: horsAmm });
}

export const REGLES_CYSTITE = [R_CYSTITE];
