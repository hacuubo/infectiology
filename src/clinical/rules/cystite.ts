/**
 * Cystite de la femme (simple, à risque de complication, récidivante, gravidique), cystite de l'homme,
 * colonisation gravidique et colonisation avant geste urologique.
 * Sources : HAS 2021 (fiches cystite et femme enceinte, mises à jour 2025), SPILF 2018 (Caron), SPILF 2015,
 * SPILF 2026 (IU masculines), AFU/CIAFU 2026, IUAS 2015, EAU 2026, RCP (BDPM) et CRAT —
 * docs/sources/recherche-cystite.md. Relectures : docs/relectures/v6-cystite.md.
 */
import type { Regle } from '../../engine/decider';
import type { ContexteDecision } from '../../engine/contexte';
import type { OptionTherapeutique, Prelevement, SourceRef } from '../types';
import { estimation } from '../../calc/renal';
import { reponseDetail } from '../syndromes/questions';
import { Fiche, S, adulte, groupe, lireAntibiogramme, type DureeDecidee, type ItemPrescription } from './outils';

const HAS_C = 'HAS-2021-cystite-femme';
const HAS_G = 'HAS-2021-femme-enceinte-IU';
const SP15 = 'SPILF-2015-IU';
const SP18 = 'SPILF-2018-IU-Caron';
const SP26 = 'SPILF-2026-IUM';
const AFU = 'AFU-2026-ECBU-geste';
const IUAS = 'SPILF-AFU-SF2H-2015-IUAS';

export type FormeCystite = 'cystite_femme' | 'cystite_gravidique' | 'cystite_homme' | 'colonisation_gravidique' | 'colonisation_avant_geste' | 'hors_champ_soins' | 'hors_champ_homme';

const DISPOSITIFS = ['sonde_vesicale', 'sonde_jj', 'nephrostomie', 'autre'];

/** Hémoculture réellement positive (germe identifié ou examen direct) : une hémoculture négative ou en cours ne compte pas. */
function hemocPositive(ctx: ContexteDecision): boolean {
  return ctx.hemocultures.some((h) => groupe(h) !== 'aucun');
}

/** ECBU de l'évaluation (même prélèvement que l'indication), sinon le premier ECBU avec un germe. */
function ecbu(ctx: ContexteDecision): Prelevement | undefined {
  return ctx.evaluationECBU?.urine ?? ctx.urines.find((u) => u.organisme !== undefined) ?? ctx.urines[0];
}

/** Germe identifié autre qu'un BGN sans antibiogramme : schémas de la cystite non applicables (pivmécillinam inactif sur l'entérocoque…). */
function germeNonModelise(ctx: ContexteDecision): boolean {
  const u = ecbu(ctx);
  if (!u?.organisme) return false;
  const abg = u.stade === 'antibiogramme' && (u.antibiogramme?.length ?? 0) > 0;
  return groupe(u) !== 'bgn' && !abg;
}

/** Forme relevant de cette règle, d'après l'évaluation de l'ECBU ou, sans ECBU, d'après le foyer et la clinique. */
export function formeCystite(ctx: ContexteDecision): FormeCystite | undefined {
  const p = ctx.dossier.patient;
  const c = ctx.dossier.clinique;
  if (!adulte(ctx) || hemocPositive(ctx)) return undefined;
  // Sepsis ou choc : jamais une cystite (urgence, règles de l'infection urinaire fébrile ou du sepsis).
  if (p.gravite === 'sepsis' || p.gravite === 'choc_septique') return undefined;
  // Douleur lombaire, frissons, malaise : signes systémiques, pas une cystite (EAU 2026, 3.4.1).
  if (reponseDetail(ctx.dossier, 'urinaire.pyelo') === 'oui') return undefined;
  if (germeNonModelise(ctx)) return undefined;
  const dispositif = DISPOSITIFS.includes(p.materielUrinaire);
  const ev = ctx.evaluationECBU;
  if (ev) {
    if (ev.decision !== 'traiter') return undefined;
    if (ev.forme === 'colonisation_gravidique') return 'colonisation_gravidique';
    if (ev.forme === 'colonisation_avant_geste') return 'colonisation_avant_geste';
    // Porteur de dispositif endo-urinaire : parcours de l'IU associée aux soins (R-INDICATION-ECBU, R-IU-FEBRILE).
    if (dispositif) return undefined;
    if (ev.forme === 'cystite') return p.contexte === 'associe_aux_soins' ? 'hors_champ_soins' : p.grossesse === 'oui' ? 'cystite_gravidique' : 'cystite_femme';
    if (p.sexe === 'homme' && c.fievre === 'non' && c.signesUrinaires === 'nouveaux' && c.signesNonSpecifiques !== 'oui' && (p.formeIUMasculine ?? 'inconnu') === 'inconnu') return formeHomme(ctx);
    return undefined;
  }
  if (ctx.foyer !== 'urinaire' || c.fievre !== 'non' || c.signesUrinaires !== 'nouveaux') return undefined;
  if (dispositif || p.contexte === 'associe_aux_soins') return 'hors_champ_soins';
  if (p.sexe === 'homme') return (p.formeIUMasculine ?? 'inconnu') === 'inconnu' ? formeHomme(ctx) : undefined;
  if (p.sexe === 'femme') return p.grossesse === 'oui' ? 'cystite_gravidique' : 'cystite_femme';
  return undefined;
}

/** SPILF 2026 exclut immunodéprimés, porteurs de sonde, IU liées aux soins et IU récidivantes (diapo 3). */
function formeHomme(ctx: ContexteDecision): FormeCystite {
  const p = ctx.dossier.patient;
  if (p.immunodepression === 'oui' || p.contexte === 'associe_aux_soins' || DISPOSITIFS.includes(p.materielUrinaire) || reponseDetail(ctx.dossier, 'urinaire.recidivante') === 'oui') return 'hors_champ_homme';
  return 'cystite_homme';
}

const du = (sources: SourceRef[]): DureeDecidee => ({ texte: 'Prise unique', pointDeDepart: 'prise unique', dureePrevueJours: 1, sources });
const jours = (n: number, sources: SourceRef[], texte?: string): DureeDecidee => ({ texte: texte ?? `${n} jours`, pointDeDepart: 'premier jour de traitement', dureePrevueJours: n, sources });
const j135 = (sources: SourceRef[]): DureeDecidee => ({ texte: '3 prises : J1, J3 et J5', pointDeDepart: 'première prise', dureePrevueJours: 5, sources });

const FOSFO: ItemPrescription = { m: 'fosfomycine_trometamol', r: 'fosfo-3g-du' };
const FOSFO3: ItemPrescription = { m: 'fosfomycine_trometamol', r: 'fosfo-3g-j1j3j5' };
const FOSFO_GESTE: ItemPrescription = { m: 'fosfomycine_trometamol', r: 'fosfo-3g-j-2-j0' };
const PIVM: ItemPrescription = { m: 'pivmecillinam', r: 'pivmecillinam-400x2' };
const NITRO: ItemPrescription = { m: 'nitrofurantoine', r: 'nitrofurantoine-100x3' };
const TMP: ItemPrescription = { m: 'trimethoprime', r: 'trimethoprime-300' };
const AMOX: ItemPrescription = { m: 'amoxicilline', r: 'amoxicilline-po-1g8h' };
const AMOXCLAV: ItemPrescription = { m: 'amoxicilline_clavulanate', r: 'amoxclav-po-1g8h' };
const SMX: ItemPrescription = { m: 'cotrimoxazole', r: 'smx-tmp-800-160-x2' };

/** Lecture de l'antibiogramme : sensible, résistante ou non rendue (jamais confondues). */
interface Lecture {
  abg: boolean;
  etat: (dci: string) => 'S' | 'R' | 'non_rendu';
}
function lecture(ctx: ContexteDecision): Lecture {
  const prl = ecbu(ctx);
  const abg = prl?.stade === 'antibiogramme' && (prl.antibiogramme?.length ?? 0) > 0;
  const atb = lireAntibiogramme(prl);
  return {
    abg,
    etat: (dci) => {
      const s = atb.sir(dci);
      return s === undefined ? 'non_rendu' : s === 'R' ? 'R' : 'S';
    },
  };
}

interface Candidat {
  dci: string;
  item: ItemPrescription;
  lib: string;
  duree: DureeDecidee;
  sources: SourceRef[];
  statut?: OptionTherapeutique['statut'];
  commentaire?: string;
  condition?: string;
}

/**
 * Traitement documenté selon une liste ordonnée (ordre de la source) : seules les molécules rendues sensibles sont proposées ;
 * une molécule mieux classée non rendue par le laboratoire est demandée (elle pourrait être préférable) ; une molécule
 * contre-indiquée (palier rénal, interaction) laisse sa place à la suivante. Renvoie le nombre d'options et les non rendues.
 */
function documente(f: Fiche, l: Lecture, id: string, liste: Candidat[], contexte: string): { n: number; nonRendues: string[] } {
  const sensibles = liste.filter((x) => l.etat(x.dci) === 'S');
  const premierSensible = liste.findIndex((x) => l.etat(x.dci) === 'S');
  const avant = premierSensible < 0 ? liste : liste.slice(0, premierSensible);
  const nonRendues = avant.filter((x) => l.etat(x.dci) === 'non_rendu').map((x) => x.lib);
  for (const lib of nonRendues)
    f.manque(`sensibilité à ${lib.toLowerCase()} (non rendue par l'antibiogramme)`, `${contexte} : molécule mieux classée que celles qui sont rendues sensibles`, sensibles.length ? 'affine' : 'bloque_decision');
  const n = f.optionsEnOrdre(
    sensibles.map((x) => ({ id: `${id}-${x.dci}`, libelle: `${x.lib} (souche sensible)`, type: 'documente' as const, items: [x.item], duree: x.duree, sources: x.sources, statut: x.statut, commentaire: x.commentaire, condition: x.condition, ...(x.condition ? { rang: 'conditionnelle' as const } : {}) })),
  );
  return { n, nonRendues };
}

/** Facteurs de risque de complication (HAS 2021 ; SPILF 2015 p. 6). La grossesse oriente vers la cystite gravidique (traitée à part). */
function risqueComplication(ctx: ContexteDecision): { risque: 'oui' | 'non' | 'inconnu'; raisons: string[]; manquants: string[]; seulementIR: boolean } {
  const p = ctx.dossier.patient;
  const raisons: string[] = [];
  const manquants: string[] = [];
  let ir = false;
  if (ctx.grossessePossible && p.grossesse === 'inconnu') manquants.push('grossesse');
  const anomalie = reponseDetail(ctx.dossier, 'urinaire.anomalie');
  if (anomalie === 'oui') raisons.push('anomalie de l\'arbre urinaire');
  else if (anomalie === 'inconnu') manquants.push('anomalie organique ou fonctionnelle de l\'arbre urinaire');
  // HAS : « immunodépression grave » ; la saisie ne distingue pas la gravité : toute immunodépression déclarée est retenue (choix prudent).
  if (p.immunodepression === 'oui') raisons.push('immunodépression (déclarée ; la HAS retient l\'immunodépression grave)');
  else if (p.immunodepression === 'inconnu') manquants.push('immunodépression');
  if (p.age === undefined) manquants.push('âge');
  else if (p.age > 75) raisons.push('âge > 75 ans');
  else if (p.age > 65) {
    const fried = reponseDetail(ctx.dossier, 'urinaire.fried');
    if (fried === 'oui') raisons.push('> 65 ans avec au moins 3 critères de Fried');
    else if (fried === 'inconnu') manquants.push('critères de fragilité de Fried');
  }
  if (['hemodialyse_intermittente', 'eer_continue', 'dialyse_peritoneale'].includes(p.renal.dialyse)) {
    raisons.push('insuffisance rénale sévère (dialyse)');
    ir = true;
  } else {
    const dfg = estimation(ctx.renal, 'dfg_indexe');
    const v = dfg.calculable ? dfg.valeur : p.renal.dfg?.valeur;
    const irConnue = reponseDetail(ctx.dossier, 'urinaire.ir_severe');
    if ((v !== undefined && v < 30) || (v === undefined && irConnue === 'oui')) {
      raisons.push('insuffisance rénale sévère (DFG < 30)');
      ir = true;
    } else if (v === undefined && irConnue === 'inconnu') manquants.push('insuffisance rénale sévère connue (DFG < 30)');
  }
  return { risque: raisons.length ? 'oui' : manquants.length ? 'inconnu' : 'non', raisons, manquants, seulementIR: ir && raisons.length === 1 };
}

const SRC_FDR = S(HAS_C, 'facteurs de risque de complication', 'la grossesse, toute anomalie organique ou fonctionnelle de l\'arbre urinaire, l\'insuffisance rénale sévère (débit de filtration glomérulaire < 30 ml/min), l\'immunodépression grave, un âge supérieur à 75 ans, ou supérieur à 65 ans avec au moins 3 critères de Fried', 'definition');

/** Nitrofurantoïne : contre-indications et restrictions du RCP que la saisie ne connaît pas (G6PD, antécédent, cures répétées). */
function nitroAutorisee(ctx: ContexteDecision, f: Fiche): { possible: boolean; commentaire: string } {
  const r = reponseDetail(ctx.dossier, 'urinaire.nitro_ci');
  const src = [S('RCP-nitrofurantoine', '§4.3', 'Déficit en glucose-6-phosphate-déshydrogénase (G6PD)', 'choix'), S(HAS_C, 'nitrofurantoïne', 'contre-indication en cas d\'insuffisance rénale avec un débit de filtration glomérulaire < 45 ml/min ou de traitements itératifs', 'choix')];
  if (r === 'oui') {
    f.ecarter('Nitrofurantoïne', 'contre_indication', 'contre-indication déclarée (déficit en G6PD, antécédent d\'effet indésirable sous nitrofurantoïne, traitements itératifs ou allergie aux nitrofuranes/au blé) : réintroduction exceptionnelle (RCP)', src);
    return { possible: false, commentaire: '' };
  }
  return { possible: true, commentaire: r === 'inconnu' ? 'À vérifier avant prescription : déficit en G6PD, antécédent d\'effet indésirable sous nitrofurantoïne (réintroduction exceptionnelle), traitements itératifs, allergie aux nitrofuranes ou au blé (RCP, HAS).' : '' };
}

export const R_CYSTITE: Regle = {
  id: 'R-CYSTITE',
  libelle: 'Cystite, colonisation gravidique et colonisation avant geste urologique',
  description: 'HAS 2021 (mises à jour 2025), SPILF 2018, SPILF 2026 (homme), AFU/CIAFU 2026, IUAS 2015 ; RCP et CRAT des molécules.',
  statut: 'verifiee_ia',
  priorite: 158,
  sources: [S(HAS_C, 'fiche mémo', undefined, 'choix'), S(HAS_G, 'fiche mémo', undefined, 'choix'), S(SP18, 'p. 346-353', undefined, 'choix')],
  sApplique: (ctx) => formeCystite(ctx) !== undefined,
  appliquer: (ctx) => {
    const forme = formeCystite(ctx)!;
    const f = new Fiche(ctx, 'verifiee_ia');
    const l = lecture(ctx);
    switch (forme) {
      case 'cystite_femme':
        cystiteFemme(ctx, f, l);
        break;
      case 'cystite_gravidique':
        cystiteGravidique(ctx, f, l);
        break;
      case 'colonisation_gravidique':
        colonisationGravidique(ctx, f, l);
        break;
      case 'colonisation_avant_geste':
        colonisationAvantGeste(ctx, f, l);
        break;
      case 'cystite_homme':
        cystiteHomme(ctx, f, l);
        break;
      case 'hors_champ_soins':
        f.situation('cystite-associee-aux-soins', 'Cystite associée aux soins ou sur dispositif urinaire', 'partielle', 'Hors du champ des fiches HAS et de la SPILF 2026. IUAS 2015 : différer l\'antibiothérapie pour l\'adapter à l\'ECBU ; 5 à 7 jours.');
        f.controle({ id: 'ctl-cystite-soins-ecbu', type: 'prelevement', categorie: 'indique', quoi: 'ECBU avec antibiogramme', quand: { ancre: 'avant_traitement', texte: 'Avant tout antibiotique' }, pourquoi: 'Traitement différé, adapté à l\'ECBU.', sources: [S(IUAS, 'R.36 (A-III)', 'différer l\'antibiothérapie afin de l\'adapter aux résultats de l\'ECBU', 'controle_micro')] });
        f.absence('Choix de l\'antibiotique d\'une cystite associée aux soins ou sur dispositif urinaire', 'Les fiches HAS et la SPILF 2018 traitent la cystite communautaire de la femme ; IUAS 2015 fixe seulement le principe (différer, adapter à l\'ECBU) et la durée (5 à 7 jours, R.51).', ['ECBU puis traitement adapté à l\'antibiogramme', 'Avis du SMIT pour le choix de la molécule'], [S(IUAS, 'R.51 (B-III)', 'traiter 5 à 7 jours les cystites associées aux soins', 'duree')]);
        break;
      case 'hors_champ_homme':
        f.situation('cystite-homme-hors-champ', 'Infection urinaire masculine hors du champ de la SPILF 2026', 'partielle', 'Immunodépression, sonde, infection liée aux soins ou infections récidivantes : exclus de la SPILF 2026 (diapo 3).');
        f.controle({ id: 'ctl-cystite-homme-ecbu', type: 'prelevement', categorie: 'indique', quoi: 'ECBU', quand: { ancre: 'avant_traitement', texte: 'Avant tout antibiotique' }, pourquoi: 'Recommandé avant toute antibiothérapie d\'une infection urinaire masculine.', sources: [S(SP26, 'diapo 6', 'Recommandé pour le diagnostic de toute infection urinaire avant de débuter une antibiothérapie', 'controle_micro')] });
        f.absence('Choix de l\'antibiotique d\'une infection urinaire masculine non fébrile hors du champ de la SPILF 2026', 'La SPILF 2026 exclut les patients immunodéprimés, porteurs de sonde, les infections liées aux soins et récidivantes ; le chapitre masculin de la SPILF 2015 est remplacé.', ['ECBU puis traitement adapté', 'Avis du SMIT'], [S(SP26, 'diapo 3', undefined, 'autre')]);
        break;
    }
    return f.fin();
  },
};

function cystiteFemme(ctx: ContexteDecision, f: Fiche, l: Lecture) {
  const recidivante = reponseDetail(ctx.dossier, 'urinaire.recidivante') === 'oui';
  const { risque, raisons, manquants, seulementIR } = risqueComplication(ctx);
  const nitro = nitroAutorisee(ctx, f);
  if (recidivante) {
    f.alerte('info', 'Cystite récidivante (au moins 4 épisodes en 12 mois) : l\'épisode se traite comme une cystite, sans nitrofurantoïne. Une antibioprophylaxie ne se discute que si au moins 1 épisode par mois, après échec des mesures non antibiotiques.', [
      S(HAS_C, 'cystite récidivante', 'Le traitement curatif d\'un épisode de cystite récidivante est celui d\'une cystite.', 'choix'),
      S(SP18, 'p. 348', 'Dans cette indication l\'administration de nitrofurantoïne est non recommandée (risque de toxicité grave favorisée par les ré-introductions)', 'choix'),
      S(HAS_C, 'antibioprophylaxie', 'si au moins 1 épisode par mois', 'choix'),
    ]);
    f.controle({ id: 'ctl-cystite-recidive-ecbu', type: 'prelevement', categorie: 'indique', quoi: 'ECBU', quand: { ancre: 'avant_traitement', texte: 'Pour les premiers épisodes de récidive' }, pourquoi: 'Bilan de la cystite récidivante.', sources: [S(SP15, 'p. 14 (IV-C)', 'Pour les premiers épisodes de récidive, un ECBU est indiqué', 'controle_micro')] });
  }
  const sansNitro = recidivante || !nitro.possible;
  if (risque === 'non') {
    // Cystite simple : antibiogramme éventuel (ECBU fait malgré tout) respecté ; si ni fosfomycine ni pivmécillinam : stratégie documentée de la forme à risque.
    const fosfoOk = !l.abg || l.etat('fosfomycine') !== 'R';
    const pivmOk = !l.abg || l.etat('mecillinam') !== 'R';
    if (!fosfoOk && !pivmOk) {
      f.situation('cystite-simple-documentee', 'Cystite simple : fosfomycine et mécillinam résistants', 'couverte', 'Ni la fosfomycine ni le pivmécillinam ne sont possibles : traitement documenté selon les modalités de la cystite à risque de complication (SPILF 2018).');
      documenteRisque(ctx, f, l, sansNitro, nitro.commentaire);
      return;
    }
    f.situation('cystite-simple', 'Cystite simple', 'couverte', `Femme sans facteur de risque de complication : bandelette urinaire seule${recidivante ? ' (ECBU pour les premiers épisodes de récidive)' : ', pas d\'ECBU'} ; traitement probabiliste.`);
    if (!recidivante) f.controle({ id: 'ctl-cystite-ecbu-echec', type: 'prelevement', categorie: 'conditionnel', quoi: 'ECBU', quand: { ancre: 'debut_traitement', offsetHeures: 72, texte: 'Seulement si persistance ou aggravation des signes après 3 jours, ou récidive dans les 2 semaines' }, pourquoi: 'Pas d\'ECBU dans la cystite simple, sauf évolution défavorable.', sources: [S(HAS_C, 'cystite simple', 'Pas d\'ECBU sauf si évolution défavorable (persistance ou aggravation des signes cliniques après 3 jours ou de récidive précoce dans les 2 semaines).', 'controle_micro')] });
    const type = l.abg ? ('documente' as const) : ('probabiliste' as const);
    f.optionsEnOrdre([
      ...(fosfoOk ? [{ id: 'cystite-simple-fosfo', libelle: 'Fosfomycine-trométamol en prise unique', type, items: [FOSFO], duree: du([S(HAS_C, 'cystite simple', '1 re intention : fosfomycine-trométamol, 3 g en prise unique', 'duree')]), sources: [S(HAS_C, 'cystite simple', '1 re intention : fosfomycine-trométamol, 3 g en prise unique', 'choix'), S(SP18, 'p. 346', 'en 1re intention à la fosfomycine trométamol en dose unique (I-A)', 'choix')] }] : []),
      ...(pivmOk
        ? [
            {
              id: 'cystite-simple-pivm',
              libelle: 'Pivmécillinam',
              type,
              items: [PIVM],
              // Divergence non tranchée : 3 jours (HAS 2021, mise à jour 2025) ou 5 jours (SPILF 2018, RCP).
              statut: 'brouillon' as const,
              duree: { texte: '3 jours selon la HAS ; 5 jours selon la SPILF 2018 et le RCP (divergence non tranchée)', pointDeDepart: 'premier jour de traitement', sources: [S(HAS_C, 'cystite simple', '2 e intention : pivmécillinam : 400 mg 2 fois par jour pendant 3 jours', 'duree'), S(SP18, 'p. 346', 'en 2e intention au pivmécillinam pendant 5 j (I-A)', 'duree'), S('RCP-pivmecillinam', '§4.2 (tableau)', 'Cystites aiguës non compliquées : 400 mg x 2/jour pendant 5 jours', 'duree')] },
              sources: [S(HAS_C, 'cystite simple', '2 e intention : pivmécillinam : 400 mg 2 fois par jour pendant 3 jours', 'choix')],
              commentaire: 'Les autres antibiotiques ne sont pas indiqués (HAS). Si ni la fosfomycine ni le pivmécillinam ne sont possibles : ECBU et traitement documenté comme une cystite à risque de complication (SPILF 2018).',
            },
          ]
        : []),
    ]);
    return;
  }
  if (risque === 'inconnu') {
    f.situation('cystite-risque-a-preciser', 'Cystite : facteurs de risque de complication à préciser', 'partielle', `À préciser : ${manquants.join(', ')}. Sans facteur de risque, la cystite est simple (bandelette, traitement probabiliste) ; avec un facteur de risque, ECBU et traitement différé.`);
    for (const m of manquants) f.manque(m, 'cystite simple ou à risque de complication (HAS)', 'bloque_decision');
    f.option({ id: 'cystite-simple-fosfo', libelle: 'Fosfomycine-trométamol en prise unique', type: 'probabiliste', rang: 'conditionnelle', condition: 'si aucun facteur de risque de complication (cystite simple) et pas de grossesse', items: [FOSFO], duree: du([S(HAS_C, 'cystite simple', '1 re intention : fosfomycine-trométamol, 3 g en prise unique', 'duree')]), sources: [S(HAS_C, 'cystite simple', '1 re intention : fosfomycine-trométamol, 3 g en prise unique', 'choix'), SRC_FDR] });
    return;
  }
  // Cystite récidivante à risque de complication : hors champ des recommandations codifiées.
  if (recidivante) {
    f.situation('cystite-recidivante-a-risque', 'Cystite récidivante à risque de complication', 'partielle', `Facteur(s) : ${raisons.join(', ')}. Prise en charge en concertation multidisciplinaire.`);
    f.absence('Cystite récidivante à risque de complication', 'SPILF 2018 (p. 347) : concertation multidisciplinaire ; ces stratégies ne peuvent faire l\'objet de recommandations codifiées. SPILF 2015 (p. 5) l\'exclut de son champ.', ['ECBU', 'Avis du SMIT et de l\'urologue (concertation multidisciplinaire)'], [S(SP18, 'p. 347', 'De telles stratégies… ne peuvent faire l\'objet de recommandations codifiées', 'choix')]);
    return;
  }
  // Cystite à risque de complication.
  const differable = reponseDetail(ctx.dossier, 'urinaire.differable');
  f.situation('cystite-a-risque', 'Cystite à risque de complication', 'couverte', `Facteur(s) : ${raisons.join(', ')}. ECBU systématique ; traitement différé jusqu'à l'antibiogramme, à privilégier.`);
  f.alerte('info', `Cystite à risque de complication (${raisons.join(', ')}).`, [SRC_FDR]);
  f.controle({ id: 'ctl-cystite-ecbu', type: 'prelevement', categorie: 'indique', quoi: 'ECBU avec antibiogramme', quand: { ancre: 'avant_traitement', texte: 'Avant tout antibiotique' }, pourquoi: 'Cystite à risque de complication : ECBU systématique ; traitement adapté à l\'antibiogramme.', sources: [S(SP18, 'p. 346', 'Un ECBU doit être systématiquement réalisé (II-B).', 'controle_micro')] });
  f.controle({ id: 'ctl-cystite-bladder', type: 'imagerie', categorie: 'conditionnel', quoi: 'Mesure du résidu vésical (bladder-scan)', quand: { ancre: 'non_determine', texte: 'Si suspicion de rétention' }, pourquoi: 'Rétention urinaire, particulièrement chez la personne âgée.', sources: [S(SP18, 'p. 346', 'particulièrement utile chez les personnes âgées', 'imagerie')] });
  f.controle({ id: 'ctl-cystite-ecbu-controle', type: 'prelevement', categorie: 'non_systematique', quoi: 'ECBU de contrôle', quand: { ancre: 'non_determine', texte: 'Seulement si évolution défavorable' }, pourquoi: 'Pas de contrôle systématique.', sources: [S(HAS_C, 'suivi', 'Pas d\'ECBU de contrôle sauf si évolution défavorable', 'controle_micro')] });
  if (l.abg) {
    documenteRisque(ctx, f, l, sansNitro, nitro.commentaire);
    return;
  }
  // Pas encore d'antibiogramme : différer si possible ; sinon probabiliste (nitrofurantoïne, puis fosfomycine en 3 prises).
  if (differable === 'inconnu') f.manque('possibilité de différer le traitement jusqu\'à l\'antibiogramme', 'cystite à risque : traitement différé à privilégier, probabiliste seulement si la patiente est très symptomatique', 'affine');
  f.reeval('Traitement différé à privilégier : débuter l\'antibiotique adapté dès l\'antibiogramme (amoxicilline, sinon pivmécillinam, sinon nitrofurantoïne ; 7 jours). En cas de traitement probabiliste, adaptation systématique à l\'antibiogramme.', [S(HAS_C, 'cystite à risque', 'Traitement différé à privilégier', 'choix')]);
  const nonDifferable = differable === 'non';
  const cond = nonDifferable ? undefined : differable === 'oui' ? 'seulement si la tolérance se dégrade avant l\'antibiogramme' : 'seulement si le traitement ne peut pas être différé (patiente très symptomatique)';
  // Insuffisance rénale sévère (seul facteur de risque ou non) : DFG < 30 < 45, la nitrofurantoïne est contre-indiquée.
  const nitroPossible = !sansNitro && !seulementIR && !raisons.some((r) => r.startsWith('insuffisance rénale sévère'));
  f.optionsEnOrdre(
    [
      ...(nitroPossible ? [{ id: 'cystite-risque-proba-nitro', libelle: 'Nitrofurantoïne (probabiliste)', type: 'probabiliste' as const, items: [NITRO], condition: cond, duree: jours(7, [S(HAS_C, 'cystite à risque, probabiliste', '1 re intention : nitrofurantoïne : 100 mg 3 fois par jour pendant 7 jours', 'duree')]), sources: [S(HAS_C, 'cystite à risque, probabiliste', '1 re intention : nitrofurantoïne : 100 mg 3 fois par jour pendant 7 jours', 'choix')], commentaire: nitro.commentaire || undefined }] : []),
      { id: 'cystite-risque-proba-fosfo3', libelle: 'Fosfomycine-trométamol, 3 prises (J1, J3, J5) — hors AMM', type: 'probabiliste' as const, items: [FOSFO3], condition: cond, duree: j135([S(HAS_C, 'cystite à risque, probabiliste', '2 e intention : fosfomycine-trométamol : 3 g à J1, J3 et J5', 'duree')]), sources: [S(HAS_C, 'cystite à risque, probabiliste', '2 e intention : fosfomycine-trométamol : 3 g à J1, J3 et J5', 'choix')] },
    ],
    nonDifferable ? 'premiere_ligne' : 'conditionnelle',
  );
}

/** Cystite à risque, différée : amoxicilline > pivmécillinam > nitrofurantoïne (HAS) ; puis fosfomycine 3 prises > triméthoprime (SPILF 2018 seule, brouillon). */
function documenteRisque(ctx: ContexteDecision, f: Fiche, l: Lecture, sansNitro: boolean, commentaireNitro: string) {
  void ctx;
  const liste: Candidat[] = [
    { dci: 'amoxicilline', item: AMOX, lib: 'Amoxicilline', duree: jours(7, [S(HAS_C, 'cystite à risque, différé', 'amoxicilline : 1g 3 fois par jour pendant 7 jours', 'duree')]), sources: [S(HAS_C, 'cystite à risque, différé', 'amoxicilline : 1g 3 fois par jour pendant 7 jours', 'choix')] },
    { dci: 'mecillinam', item: PIVM, lib: 'Pivmécillinam', duree: jours(7, [S(HAS_C, 'cystite à risque, différé', 'pivmécillinam : 400 mg 2 fois par jour pendant 7 jours', 'duree')]), sources: [S(HAS_C, 'cystite à risque, différé', 'pivmécillinam : 400 mg 2 fois par jour pendant 7 jours', 'choix')] },
    ...(sansNitro ? [] : [{ dci: 'nitrofurantoine', item: NITRO, lib: 'Nitrofurantoïne', duree: jours(7, [S(HAS_C, 'cystite à risque, différé', 'nitrofurantoïne : 100 mg 3 fois par jour pendant 7 jours', 'duree')]), sources: [S(HAS_C, 'cystite à risque, différé', 'nitrofurantoïne : 100 mg 3 fois par jour pendant 7 jours', 'choix')], commentaire: commentaireNitro || undefined }]),
    { dci: 'fosfomycine', item: FOSFO3, lib: 'Fosfomycine-trométamol, 3 prises (J1, J3, J5) — hors AMM', duree: j135([S(SP18, 'p. 346', 'en 4e la fosfomycine trométamol (3 doses espacées chacune de 48 h)', 'duree')]), statut: 'brouillon', sources: [S(SP18, 'p. 346', 'en 4e la fosfomycine trométamol (3 doses espacées chacune de 48 h), en 5e le TMP (5 j)', 'choix')], commentaire: '4e intention de la SPILF 2018, absente de la fiche HAS : à valider.' },
    { dci: 'trimethoprime', item: TMP, lib: 'Triméthoprime', duree: jours(5, [S(SP18, 'p. 346', 'en 5e le TMP (5 j)', 'duree')]), statut: 'brouillon', sources: [S(SP18, 'p. 346', 'en 5e le TMP (5 j)', 'choix')], commentaire: '5e intention de la SPILF 2018, absente de la fiche HAS : à valider.' },
  ];
  const { n, nonRendues } = documente(f, l, 'cystite-risque-doc', liste, 'cystite à risque de complication');
  if (n === 0 && nonRendues.length === 0)
    f.absence('Cystite à risque de complication : aucune des molécules recommandées n\'est utilisable', 'Les recommandations lues (HAS 2021, SPILF 2018) ne donnent pas de choix au-delà de l\'amoxicilline, du pivmécillinam, de la nitrofurantoïne, de la fosfomycine (3 prises) et du triméthoprime.', ['Avis du SMIT, avec l\'antibiogramme complet'], [S(SP18, 'p. 346', undefined, 'choix')]);
}

function cystiteGravidique(ctx: ContexteDecision, f: Fiche, l: Lecture) {
  f.situation('cystite-gravidique', 'Cystite gravidique', 'couverte', 'ECBU puis traitement probabiliste sans attendre l\'antibiogramme ; adaptation en cas d\'échec ou de résistance.');
  f.controle({ id: 'ctl-gravidique-ecbu', type: 'prelevement', categorie: 'indique', quoi: 'ECBU avec antibiogramme', quand: { ancre: 'avant_traitement', texte: 'Avant le traitement' }, pourquoi: 'Cystite gravidique : ECBU systématique.', sources: [S(SP18, 'p. 339 (angl.)', 'always indicated', 'controle_micro')] });
  suiviGravidique(f);
  const srcProba = S(HAS_G, 'cystite gravidique', 'Traitement probabiliste, à débuter sans attendre le résultat de l\'antibiogramme', 'choix');
  const fosfoActive = !l.abg || l.etat('fosfomycine') !== 'R';
  const pivmActif = !l.abg || l.etat('mecillinam') !== 'R';
  const type = l.abg ? ('documente' as const) : ('probabiliste' as const);
  const n = f.optionsEnOrdre([
    ...(fosfoActive ? [{ id: 'gravidique-fosfo', libelle: 'Fosfomycine-trométamol en prise unique', type, items: [FOSFO], duree: du([S(HAS_G, 'cystite gravidique', 'fosfomycine-trométamol : 3 g en prise unique', 'duree')]), sources: [srcProba, S(SP18, 'p. 353', 'Le seul traitement de 1re intention désormais recommandé… est la fosfomycine trométamol à dose unique (II-B)', 'choix')] }] : []),
    ...(pivmActif ? [{ id: 'gravidique-pivm', libelle: 'Pivmécillinam', type, items: [PIVM], duree: jours(7, [S(HAS_G, 'cystite gravidique', 'pivmécillinam : 400 mg 2 fois par jour pendant 7 jours', 'duree')]), sources: [srcProba, S('RCP-pivmecillinam', '§4.2 (tableau)', 'Cystites à risque de complication, incluant les cystites gravidiques', 'posologie')] }] : []),
  ]);
  if (l.abg && n === 0) relaisGravidique(ctx, f, l, 'cystite');
  else if (l.abg && l.etat('amoxicilline') === 'S')
    f.reeval('Antibiogramme rendu, amoxicilline sensible : la HAS ne change de molécule qu\'en cas d\'échec ou de résistance ; la SPILF 2018 propose l\'amoxicilline en relais (divergence non tranchée).', [S(HAS_G, 'cystite gravidique', 'En cas d\'échec ou de résistance', 'choix'), S(SP18, 'p. 353', undefined, 'choix')]);
}

/** Ordre HAS (échec ou résistance de la cystite gravidique ; colonisation après les trois premières molécules). */
function relaisGravidique(ctx: ContexteDecision, f: Fiche, l: Lecture, contexte: 'cystite' | 'colonisation') {
  const nitro = nitroAutorisee(ctx, f);
  const rep = contexte === 'cystite' ? 'cystite gravidique, échec ou résistance' : 'colonisation gravidique';
  const c = (dci: string, item: ItemPrescription, lib: string, ex: string, extra: Partial<Candidat> = {}): Candidat => ({ dci, item, lib, duree: jours(7, [S(HAS_G, rep, ex, 'duree')]), sources: [S(HAS_G, rep, ex, 'choix')], ...extra });
  const liste: Candidat[] = [
    c('amoxicilline', AMOX, 'Amoxicilline', 'amoxicilline : 1 g 3 fois par jour pendant 7 jours'),
    // Triméthoprime : HAS « à éviter avant 10 SA » ; RCP du 19/05/2026 : contre-indiqué au 1er trimestre (le terme n'est pas saisi).
    c('trimethoprime', TMP, 'Triméthoprime', 'triméthoprime : 300 mg par jour pendant 7 jours, à éviter avant 10 semaines d\'aménorrhée', { condition: 'pas au 1er trimestre (contre-indiqué par le RCP ; HAS : à éviter avant 10 SA)', statut: 'brouillon' }),
    ...(nitro.possible ? [c('nitrofurantoine', NITRO, 'Nitrofurantoïne', 'nitrofurantoïne : 100 mg 3 fois par jour pendant 7 jours', { condition: 'pas en fin de grossesse (travail, accouchement : contre-indiquée)', commentaire: nitro.commentaire || undefined })] : []),
    c('cotrimoxazole', SMX, 'Cotrimoxazole', 'cotrimoxazole : 800 mg/160 mg 2 fois par jour pendant 7 jours, à éviter avant 10 semaines d\'aménorrhée', { condition: 'à éviter avant 10 semaines d\'aménorrhée (HAS)' }),
    c('amoxicilline_clavulanate', AMOXCLAV, 'Amoxicilline-acide clavulanique', 'amoxicilline + acide clavulanique : 1 g 3 fois par jour pendant 7 jours'),
  ];
  const { n, nonRendues } = documente(f, l, `gravidique-${contexte}`, liste, contexte === 'cystite' ? 'cystite gravidique' : 'colonisation gravidique');
  if (n === 0 && nonRendues.length === 0) f.absence(`${contexte === 'cystite' ? 'Cystite' : 'Colonisation'} gravidique : aucune molécule de la liste HAS n'est utilisable`, 'La fiche HAS « Femme enceinte : colonisation urinaire et cystite » (mise à jour 2025) ne propose pas d\'autre molécule.', ['Avis du SMIT et de l\'obstétricien, avec l\'antibiogramme complet'], [S(HAS_G, 'fiche mémo', undefined, 'choix')]);
}

function suiviGravidique(f: Fiche) {
  f.controle({ id: 'ctl-gravidique-suivi', type: 'prelevement', categorie: 'indique', quoi: 'ECBU de contrôle, puis ECBU mensuel jusqu\'à l\'accouchement', quand: { ancre: 'non_determine', texte: '8 à 10 jours après l\'arrêt du traitement, puis tous les mois' }, pourquoi: 'Suivi de la bactériurie gravidique.', sources: [S(HAS_G, 'contrôle', 'ECBU de contrôle 8 à 10 jours après l\'arrêt du traitement, puis ECBU mensuel jusqu\'à l\'accouchement.', 'controle_micro')] });
}

function colonisationGravidique(ctx: ContexteDecision, f: Fiche, l: Lecture) {
  f.situation('colonisation-gravidique', 'Colonisation urinaire gravidique', 'couverte', 'Traitement adapté à l\'antibiogramme, dès réception des résultats ; pas de traitement probabiliste.');
  suiviGravidique(f);
  if (!l.abg) {
    f.manque('antibiogramme de l\'ECBU', 'colonisation gravidique : traitement adapté à l\'antibiogramme, pas de probabiliste (HAS)', 'bloque_decision');
    return;
  }
  const srcPrincipe = S(HAS_G, 'colonisation gravidique', 'Traitement adapté aux résultats de l\'antibiogramme, à commencer dès réception des résultats (pas de traitement probabiliste)', 'choix');
  const c = (dci: string, item: ItemPrescription, lib: string, ex: string, duree: DureeDecidee): Candidat => ({ dci, item, lib, duree, sources: [srcPrincipe, S(HAS_G, 'colonisation gravidique', ex, 'posologie')] });
  const premiers = [
    c('amoxicilline', AMOX, 'Amoxicilline', 'amoxicilline : 1 g 3 fois par jour pendant 7 jours', jours(7, [S(HAS_G, 'colonisation gravidique', 'amoxicilline : 1 g 3 fois par jour pendant 7 jours', 'duree')])),
    c('mecillinam', PIVM, 'Pivmécillinam', 'pivmécillinam : 400 mg 2 fois par jour, pendant 7 jours', jours(7, [S(HAS_G, 'colonisation gravidique', 'pivmécillinam : 400 mg 2 fois par jour, pendant 7 jours', 'duree')])),
    c('fosfomycine', FOSFO, 'Fosfomycine-trométamol en prise unique', 'fosfomycine-trométamol : 3 g en prise unique', du([S(HAS_G, 'colonisation gravidique', 'fosfomycine-trométamol : 3 g en prise unique', 'duree')])),
  ];
  const { n, nonRendues } = documente(f, l, 'colonisation-gravidique', premiers, 'colonisation gravidique');
  if (n === 0 && nonRendues.length === 0) relaisGravidique(ctx, f, { ...l, etat: (d) => (d === 'amoxicilline' ? 'R' : l.etat(d)) }, 'colonisation');
}

function colonisationAvantGeste(ctx: ContexteDecision, f: Fiche, l: Lecture) {
  const nlpc = ctx.dossier.clinique.gesteUrologique === 'nlpc';
  const homme = ctx.dossier.patient.sexe === 'homme';
  f.situation('colonisation-avant-geste', 'Colonisation urinaire avant geste urologique', 'partielle', `Traitement adapté à l'antibiogramme${nlpc ? ' ; durée préopératoire non définie par l\'AFU pour la NLPC' : ', débuté 48 h avant le geste et poursuivi au plus 48 h après (3 à 5 jours)'}. L'AFU ne donne pas de posologie : celles affichées sont celles de la cystite (brouillon).`);
  const duree: DureeDecidee = nlpc
    ? { texte: 'Durée préopératoire non définie par l\'AFU pour la NLPC : à décider avec l\'urologue', pointDeDepart: 'avant le geste', sources: [S(AFU, 'Q3 R3 (Grade AE)', undefined, 'duree')] }
    : { texte: 'Débuté 48 h avant le geste, poursuivi au minimum jusqu\'au jour du geste et au maximum 48 h après : 3 à 5 jours', pointDeDepart: '48 h avant le geste', dureePrevueJours: 5, sources: [S(AFU, 'Q3 R2 (Grade C)', 'celle-ci sera débutée 48 heures avant le geste chirurgical et sera poursuivie au minimum à J0 et au maximum 48 heures après le geste, soit un total de 3 à 5 jours', 'duree')] };
  const prl = ecbu(ctx);
  if (prl && (prl.isolatsSupplementaires ?? []).some((i) => i.organisme !== undefined))
    f.alerte('attention', 'Culture polymicrobienne : pas de recommandation (AFU) ; si un traitement est décidé sans antibiogramme par souche : fosfomycine-trométamol, nitrofurantoïne, pivmécillinam ou triméthoprime.', [S(AFU, 'Q3 R5-R6 (Grade AE)', 'Fosfomycine-Trométamol, Nitrofurantoïne, Pivmécillinam et Triméthoprime', 'choix')]);
  if (!l.abg) {
    f.manque('antibiogramme de l\'ECBU', 'colonisation avant geste : traitement adapté à l\'antibiogramme (AFU 2026)', 'bloque_decision');
    return;
  }
  const nitro = nitroAutorisee(ctx, f);
  const srcR4 = S(AFU, 'Q3 R4 (Grade AE)', 'En 1ère intention : Fosfomycine-trométamol (J-2 / J0), Nitrofurantoïne, Pivmécillinam, et Triméthoprime', 'choix');
  const comm = (horsAmmHomme: boolean) => `Molécules de même rang, citées par ordre alphabétique (AFU). Posologie non donnée par l'AFU : reprise de la cystite, à valider.${horsAmmHomme && homme ? ' Hors AMM chez l\'homme (RCP).' : ''}`;
  const c = (dci: string, item: ItemPrescription, lib: string, horsAmm: boolean, d = duree, extra = ''): Candidat => ({ dci, item, lib, duree: d, sources: [srcR4], statut: 'brouillon', commentaire: `${comm(horsAmm)}${extra}` });
  const premiere = [
    c('fosfomycine', FOSFO_GESTE, 'Fosfomycine-trométamol (J-2 et J0)', true, nlpc ? duree : { ...duree, texte: 'Deux prises : J-2 et le jour du geste (AFU)', dureePrevueJours: 3 }, ' Schéma en deux prises hors AMM.'),
    ...(nitro.possible ? [c('nitrofurantoine', NITRO, 'Nitrofurantoïne', true, duree, nitro.commentaire ? ` ${nitro.commentaire}` : '')] : []),
    c('mecillinam', PIVM, 'Pivmécillinam', true),
    c('trimethoprime', TMP, 'Triméthoprime', true),
  ];
  // Même rang (ordre alphabétique) : toutes les molécules sensibles de 1re intention sont en 1re ligne.
  const sensibles1 = premiere.filter((x) => l.etat(x.dci) === 'S');
  const nonRendues1 = premiere.filter((x) => l.etat(x.dci) === 'non_rendu');
  let n = 0;
  for (const x of sensibles1) if (f.option({ id: `avant-geste-${x.dci}`, libelle: `${x.lib} (souche sensible)`, type: 'documente', rang: 'premiere_ligne', items: [x.item], duree: x.duree, sources: x.sources, statut: 'brouillon', commentaire: x.commentaire })) n++;
  if (n > 0) return;
  if (nonRendues1.length) {
    for (const x of nonRendues1) f.manque(`sensibilité à ${x.lib.toLowerCase()} (non rendue par l'antibiogramme)`, 'colonisation avant geste : molécule de 1re intention (AFU 2026)', 'bloque_decision');
    return;
  }
  const seconde = [c('amoxicilline', AMOX, 'Amoxicilline', false), c('cotrimoxazole', SMX, 'Cotrimoxazole', false)];
  for (const x of seconde.filter((y) => l.etat(y.dci) === 'S')) if (f.option({ id: `avant-geste-${x.dci}`, libelle: `${x.lib} (souche sensible)`, type: 'documente', rang: 'premiere_ligne', items: [x.item], duree: x.duree, sources: [S(AFU, 'Q3 R4 (Grade AE)', 'En 2ème intention : Amoxicilline, Cotrimoxazole', 'choix')], statut: 'brouillon', commentaire: x.commentaire })) n++;
  if (n > 0) return;
  if (l.etat('amoxicilline_clavulanate') === 'S') {
    const x = c('amoxicilline_clavulanate', AMOXCLAV, 'Amoxicilline-acide clavulanique', false);
    if (f.option({ id: 'avant-geste-amoxicilline_clavulanate', libelle: `${x.lib} (souche sensible)`, type: 'documente', rang: 'premiere_ligne', items: [x.item], duree: x.duree, sources: [S(AFU, 'Q3 R4 (Grade AE)', 'En 3ème intention : Amoxicilline + acide clavulanique', 'choix')], statut: 'brouillon', commentaire: x.commentaire })) return;
  }
  f.absence('Colonisation avant geste : aucune molécule des trois premières intentions AFU n\'est utilisable', 'AFU 2026 Q3 R4 cite ensuite les fluoroquinolones et le céfixime, puis « autres antibiotiques », sans posologie.', ['Avis du SMIT ou de l\'urologue référent'], [srcR4]);
}

function cystiteHomme(ctx: ContexteDecision, f: Fiche, l: Lecture) {
  const differable = reponseDetail(ctx.dossier, 'urinaire.differable');
  const nitro = nitroAutorisee(ctx, f);
  f.situation('cystite-homme', 'Cystite de l\'homme (infection urinaire masculine sans fièvre)', 'couverte', 'SPILF 2026 : pas de « cystite simple » chez l\'homme. ECBU systématique ; si bonne tolérance, attendre l\'ECBU ; 7 jours (fosfomycine : 3 prises). Molécules hors AMM chez l\'homme (RCP).');
  f.controle({ id: 'ctl-cystite-homme-ecbu', type: 'prelevement', categorie: 'indique', quoi: 'ECBU (pas de bandelette ; pas de PSA ni de marqueur inflammatoire)', quand: { ancre: 'avant_traitement', texte: 'Avant tout antibiotique' }, pourquoi: 'Seul examen recommandé pour confirmer le diagnostic.', sources: [S(SP26, 'diapo 8', 'ECBU : seul examen complémentaire recommandé pour confirmer le diagnostic', 'controle_micro')] });
  f.controle({ id: 'ctl-cystite-homme-echo', type: 'imagerie', categorie: 'indique', quoi: 'Échographie des voies urinaires avec mesure du résidu post-mictionnel', quand: { ancre: 'non_determine', texte: 'Dès le premier épisode' }, pourquoi: 'Bilan de l\'infection urinaire masculine.', sources: [S(SP26, 'diapo 36-38', 'Echographie des voies urinaires avec mesure du résidu post-mictionnel (RPM)', 'imagerie')] });
  const d7 = jours(7, [S(SP26, 'diapo 11', '7 jours — Sauf fosfomycine-trometamol : 3 doses (J1-J3-J5)', 'duree')]);
  const d135 = j135([S(SP26, 'diapo 11', '7 jours — Sauf fosfomycine-trometamol : 3 doses (J1-J3-J5)', 'duree')]);
  const horsAmm = 'Hors AMM chez l\'homme (RCP).';
  const horsAmmNitro = 'Hors AMM : selon son RCP, la nitrofurantoïne « n\'est pas adapté[e] aux infections urinaires chez l\'homme » ; EAU : seulement si une atteinte prostatique est écartée. Brouillon.';
  if (l.abg) {
    const src = [S(SP26, 'diapo 10', 'Amoxicilline 1 gx3/j ; Fosfomycine-trométamol 3 g/prise ; Nitrofurantoïne 100 mgx3/j ; Pivmécillinam 400 mgx2/j ; Triméthoprime 300 mgx1/j', 'choix')];
    // Ordre alphabétique (SPILF 2026), sans hiérarchie : toutes les molécules sensibles en 1re ligne.
    const liste: Candidat[] = [
      { dci: 'amoxicilline', item: AMOX, lib: 'Amoxicilline', duree: d7, sources: src },
      { dci: 'fosfomycine', item: FOSFO3, lib: 'Fosfomycine-trométamol (J1, J3, J5)', duree: d135, sources: src, commentaire: horsAmm },
      ...(nitro.possible ? [{ dci: 'nitrofurantoine', item: NITRO, lib: 'Nitrofurantoïne', duree: d7, sources: src, statut: 'brouillon' as const, commentaire: `${horsAmmNitro}${nitro.commentaire ? ` ${nitro.commentaire}` : ''}` }] : []),
      { dci: 'mecillinam', item: PIVM, lib: 'Pivmécillinam', duree: d7, sources: src, commentaire: horsAmm },
      { dci: 'trimethoprime', item: TMP, lib: 'Triméthoprime', duree: d7, sources: src, commentaire: horsAmm },
    ];
    let n = 0;
    for (const x of liste.filter((y) => l.etat(y.dci) === 'S')) if (f.option({ id: `cystite-homme-doc-${x.dci}`, libelle: `${x.lib} (souche sensible)`, type: 'documente', rang: 'premiere_ligne', items: [x.item], duree: x.duree, sources: x.sources, statut: x.statut, commentaire: `Molécules citées par ordre alphabétique (SPILF 2026), sans hiérarchie. Poursuivre le probabiliste s'il est actif.${x.commentaire ? ` ${x.commentaire}` : ''}` })) n++;
    if (n === 0) {
      const nonRendues = liste.filter((y) => l.etat(y.dci) === 'non_rendu');
      for (const x of nonRendues) f.manque(`sensibilité à ${x.lib.toLowerCase()} (non rendue par l'antibiogramme)`, 'cystite de l\'homme (SPILF 2026)', 'bloque_decision');
      if (nonRendues.length === 0) f.absence('Cystite de l\'homme : aucune des molécules de la SPILF 2026 n\'est utilisable', 'SPILF 2026 (diapo 10) ne cite pas d\'autre molécule pour la cystite masculine.', ['Avis du SMIT avec l\'antibiogramme complet'], [S(SP26, 'diapo 10', undefined, 'choix')]);
    }
    return;
  }
  if (differable === 'inconnu') f.manque('possibilité de différer le traitement jusqu\'à l\'ECBU', 'bonne tolérance : attendre l\'ECBU (SPILF 2026)', 'affine');
  const rang = differable === 'non' ? ('premiere_ligne' as const) : ('conditionnelle' as const);
  const cond = differable === 'non' ? undefined : differable === 'oui' ? 'seulement si la tolérance se dégrade avant l\'ECBU' : 'seulement si le traitement ne peut pas attendre l\'ECBU (mauvaise tolérance)';
  const src = [S(SP26, 'diapo 9', 'traitement oral probabiliste, par ordre alphabétique : Fosfomycine-trométamol (3 g à J1-J3-J5) ; Nitrofurantoïne 100 mgx3/j ; Pivmécillinam 400 mgx2/j', 'choix')];
  f.reeval('Si bonne tolérance ou diagnostic douteux : attendre l\'ECBU pour débuter un antibiotique adapté.', [S(SP26, 'diapo 9', 'Si bonne tolérance ou diagnostic douteux : attendre les résultats de l\'ECBU pour débuter un traitement antibiotique adapté', 'choix')]);
  f.option({ id: 'cystite-homme-fosfo', libelle: 'Fosfomycine-trométamol (J1, J3, J5)', type: 'probabiliste', rang, condition: cond, items: [FOSFO3], duree: d135, sources: src, commentaire: `Ordre alphabétique (SPILF 2026), sans hiérarchie. ${horsAmm}` });
  if (nitro.possible) f.option({ id: 'cystite-homme-nitro', libelle: 'Nitrofurantoïne', type: 'probabiliste', rang, condition: cond, items: [NITRO], duree: d7, sources: src, statut: 'brouillon', commentaire: `${horsAmmNitro}${nitro.commentaire ? ` ${nitro.commentaire}` : ''}` });
  f.option({ id: 'cystite-homme-pivm', libelle: 'Pivmécillinam', type: 'probabiliste', rang, condition: cond, items: [PIVM], duree: d7, sources: src, commentaire: horsAmm });
}

export const REGLES_CYSTITE = [R_CYSTITE];
