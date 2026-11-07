/**
 * Méningites bactériennes aiguës communautaires de l'adulte : urgence (antibiotique dans l'heure, antibiotique
 * avant la PL, purpura fulminans), imagerie et contre-indications de la PL, probabiliste selon l'examen direct du
 * LCS, allergie, dexaméthasone, adaptation à la CMI et durées par germe, PL de contrôle, déclaration obligatoire et
 * prophylaxie des sujets contacts d'un méningocoque ; méningite post-neurochirurgicale ou sur matériel : avis spécialisé.
 * Sources : SPILF 2018 (texte long, diaporama, Info-antibio 90 ; « en cours de révision »), instruction DGS 2018,
 * DGS-Urgent 2025_06 (relayé par l'AP-HP), IDSA 2017 (recoupement), RCP — docs/sources/recherche-meningites.md.
 * Statut : brouillon pour tout le domaine tant que la révision SPILF n'est pas publiée (note §9).
 * Extraits : le texte long SPILF est en anglais ; ses extraits en français sont des reformulations, marquées « [reformulation] ».
 */
import type { Regle } from '../../engine/decider';
import { moleculeEvitee, type ContexteDecision } from '../../engine/contexte';
import type { DonneeManquante, OptionTherapeutique, OrganismeId, SourceRef, StatutValidation } from '../types';
import { estimation } from '../../calc/renal';
import { nombreFr } from '../../calc/format';
import { LIBELLE_ORGANISME } from '../microbiologie/germes';
import { reponseDetail } from '../syndromes/questions';
import { germeDeduit, germeMeningite, germesHorsListe, prelevementsMeningite } from '../syndromes/meningites';
import { Fiche, S, adulte, lireAntibiogramme, pireC3G, type DureeDecidee, type ItemPrescription } from './outils';

const ID_REGLE = 'R-MENINGITE-BACTERIENNE';
const SP = 'SPILF-2018-meningites';
const DIA = 'SPILF-2018-meningites-diapo';
const DGS = 'DGS-2018-IIM';
const APHP = 'APHP-2025-IIM-CAT';

/** Extrait reformulé (texte long SPILF en anglais, passage de diaporama ou de l'instruction non cité mot pour mot). */
const SPr = (repere: string, extrait: string, justifie: SourceRef['justifie']) => S(SP, repere, `[reformulation] ${extrait}`, justifie);
const DIAr = (repere: string, extrait: string, justifie: SourceRef['justifie']) => S(DIA, repere, `[reformulation] ${extrait}`, justifie);
const DGSr = (repere: string, extrait: string, justifie: SourceRef['justifie']) => S(DGS, repere, `[reformulation] ${extrait}`, justifie);

const CTX300: ItemPrescription = { m: 'cefotaxime', r: 'cefotaxime-meninge-300' };
const CTX200: ItemPrescription = { m: 'cefotaxime', r: 'cefotaxime-meninge-200' };
const CRO100: ItemPrescription = { m: 'ceftriaxone', r: 'ceftriaxone-meninge-100' };
const CRO75: ItemPrescription = { m: 'ceftriaxone', r: 'ceftriaxone-meninge-75' };
const AMX: ItemPrescription = { m: 'amoxicilline', r: 'amoxicilline-meninge-200' };
const GENTA: ItemPrescription = { m: 'gentamicine', r: 'gentamicine-5-listeria' };
const VANCO: ItemPrescription = { m: 'vancomycine', r: 'vancomycine-meninge' };
const RIFA: ItemPrescription = { m: 'rifampicine', r: 'rifampicine-meninge-300x2' };
const CIPRO_IV: ItemPrescription = { m: 'ciprofloxacine', r: 'cipro-iv-meninge' };
const SMX: ItemPrescription = { m: 'cotrimoxazole', r: 'smx-tmp-meninge' };
const MERO: ItemPrescription = { m: 'meropeneme', r: 'meropeneme-meninge-40' };
const RIFA_PO: ItemPrescription = { m: 'rifampicine', r: 'rifampicine-po-prophylaxie-iim' };
const CIPRO_PO: ItemPrescription = { m: 'ciprofloxacine', r: 'cipro-po-500-du' };
const CRO_PROPH: ItemPrescription = { m: 'ceftriaxone', r: 'ceftriaxone-prophylaxie-iim-250' };

type Rang = OptionTherapeutique['rang'];
type Germe = 'pneumocoque' | 'meningocoque' | 'listeria' | 'h_influenzae' | 'e_coli' | 's_agalactiae' | 'autre';

const LIB_GERME: Record<Germe, string> = {
  pneumocoque: 'pneumocoque',
  meningocoque: 'méningocoque',
  listeria: 'Listeria monocytogenes',
  h_influenzae: 'Haemophilus influenzae',
  e_coli: 'Escherichia coli',
  s_agalactiae: 'Streptococcus agalactiae',
  autre: 'autre germe',
};

/** Organisme de la liste de saisie correspondant au germe (les autres germes de la méningite n'y figurent pas). */
const ORGANISME_DU_GERME: Partial<Record<Germe, OrganismeId>> = { pneumocoque: 'streptococcus_pneumoniae', e_coli: 'escherichia_coli', s_agalactiae: 'streptococcus_agalactiae' };

/* ------------------------------------------------------------------ */
/* Sources réutilisées                                                 */
/* ------------------------------------------------------------------ */

const SRC_DELAI = [
  SPr('p. 11, §12.1', 'antibiothérapie (et dexaméthasone si indiquée) idéalement dans l\'heure suivant l\'admission, quel que soit le délai présumé depuis le début', 'choix'),
  S(DIA, 'dia 8', 'Au plus tard dans les 3 heures', 'choix'),
];
const SRC_AVANT_PL = SPr('p. 11, §12.2', 'trois situations, « but after blood culture » : purpura fulminans ; admission hospitalière impossible dans les 90 minutes ; contre-indication à une PL immédiate', 'choix');
const SRC_PL_NON_IMMEDIATE = SPr('p. 5, §11.2', 'Si PL non immédiate : antibiothérapie probabiliste + dexaméthasone, après au moins deux hémocultures.', 'choix');
const SRC_ATTENDRE = SPr('p. 21, §12.8', 'antibiothérapie dès que le LCS est trouble ; en attendant le Gram, schéma « examen direct négatif »', 'choix');
const SRC_C3G_EGAL = S(DIA, 'dia 3', 'Le céfotaxime ou la ceftriaxone sont les deux antibiotiques de première intention', 'choix');
const TXT_C3G_EGAL = 'Céfotaxime et ceftriaxone : « les deux antibiotiques de première intention » (SPILF 2018), proposés au même rang ; l\'ordre d\'affichage n\'exprime aucune préférence.';
const SRC_PAS_VANCO = SPr('p. 21, §12.7.5', 'à dose optimale de C3G, l\'ajout systématique de vancomycine n\'est pas justifié chez l\'adulte et l\'enfant', 'choix');
const TEXTE_DELAI = 'Méningite bactérienne suspectée : antibiothérapie (et dexaméthasone si indiquée) idéalement dans l\'heure suivant l\'admission, quel que soit le délai depuis le début des signes ; au plus tard dans les 3 heures. Tout retard aggrave le pronostic.';
const SRC_DEXA_INDIC = SPr('p. 25, §13.2.1', 'suspicion sans confirmation microbiologique mais décision d\'antibiothérapie probabiliste (imagerie retardant la PL, PL contre-indiquée pour raison non neurologique, LCS trouble/purulent, examen direct négatif mais arguments biologiques)', 'geste');
const SRC_DEXA_SUITE = SPr('p. 25-26', 'poursuivre 4 jours si pneumocoque ou Haemophilus ; au choix du clinicien si méningocoque ; arrêt pour les autres germes', 'geste');

const D_NON_DOC: DureeDecidee = {
  texte: 'Selon le germe documenté (pneumocoque 10 à 14 j, méningocoque 4 à 7 j, Listeria 21 j, H. influenzae 7 j, E. coli 21 j) ; méningite non documentée d\'évolution favorable : 14 jours.',
  pointDeDepart: 'non précisé par les sources (début du traitement présumé)',
  sources: [SPr('Tableau 11 p. 28 ; §14.1.5 p. 29', 'non documentée d\'évolution favorable : 14 j', 'duree'), S(DIA, 'dia 17', 'poursuite de l\'antibiothérapie jusqu\'au 14ème jour', 'duree')],
};

/* ------------------------------------------------------------------ */
/* Lecture du dossier                                                  */
/* ------------------------------------------------------------------ */

function q(ctx: ContexteDecision, id: string): string {
  return reponseDetail(ctx.dossier, id);
}

/** Donnée manquante rattachée à la question du foyer (bouton « Compléter »). */
function manqueQ(f: Fiche, id: string, champ: string, pourquoi: string, impact: DonneeManquante['impact']) {
  f.manque(champ, pourquoi, impact, `details.${id}`);
}

/** Arguments pour une listériose (SPILF 2018 p. 22) : âge > 70 ans, immunodépression (saisis), autres (question). */
export function argumentsListeriose(ctx: ContexteDecision): { etat: 'oui' | 'non' | 'inconnu'; raisons: string[] } {
  const p = ctx.dossier.patient;
  const raisons: string[] = [];
  if (p.age !== undefined && p.age > 70) raisons.push('âge > 70 ans');
  if (p.immunodepression === 'oui') raisons.push('immunodépression');
  const autres = q(ctx, 'meningite.listeriose');
  if (autres === 'oui') raisons.push('comorbidités, début progressif ou rhombencéphalite');
  if (raisons.length) return { etat: 'oui', raisons };
  if (autres === 'non' && p.age !== undefined && p.immunodepression === 'non') return { etat: 'non', raisons };
  return { etat: 'inconnu', raisons };
}

/** Arguments pour une listériose inconnus : « Compléter » vise la donnée qui manque vraiment (question, âge ou immunodépression). */
function manqueListeriose(ctx: ContexteDecision, f: Fiche) {
  const p = ctx.dossier.patient;
  const pourquoi = 'ajout de l\'amoxicilline et de la gentamicine (arguments pour une listériose, SPILF 2018)';
  if (q(ctx, 'meningite.listeriose') === 'inconnu') manqueQ(f, 'meningite.listeriose', 'arguments pour une listériose', pourquoi, 'bloque_decision');
  else if (p.age === undefined) f.manque('âge', pourquoi, 'bloque_decision', 'patient.age');
  else f.manque('immunodépression', pourquoi, 'bloque_decision', 'patient.immunodepression');
}

/** Contre-indication non neurologique de la PL : question du foyer, ou anticoagulant déclaré (AVK, AOD). */
function contreIndicationPL(ctx: ContexteDecision): { etat: string; anticoagulant: boolean } {
  const t = ctx.dossier.patient.traitementsAssocies;
  const anticoagulant = t.includes('avk') || t.includes('aod');
  const r = q(ctx, 'meningite.ci_pl');
  return { etat: anticoagulant ? 'oui' : r, anticoagulant };
}

interface Allergies {
  /** Pénicillines et céphalosporines évitées (anaphylaxie, réaction retardée sévère, bêta-lactamine non précisée). */
  grave: boolean;
  /** Amoxicilline évitée (famille ou molécule). */
  peni: boolean;
  /** Céfotaxime ou ceftriaxone évités. */
  c3g: boolean;
}

/** Éviction lue au niveau de la molécule (comme le contrôle des allergies du moteur), pas seulement de la famille. */
function allergies(ctx: ContexteDecision): Allergies {
  const peni = moleculeEvitee('amoxicilline', 'penicilline', ctx.allergie).evitee;
  const c3g = moleculeEvitee('cefotaxime', 'cephalosporine', ctx.allergie).evitee || moleculeEvitee('ceftriaxone', 'cephalosporine', ctx.allergie).evitee;
  return { grave: ctx.allergie.famillesAEviter.has('penicilline') && ctx.allergie.famillesAEviter.has('cephalosporine'), peni, c3g };
}

/* ------------------------------------------------------------------ */
/* Briques communes                                                    */
/* ------------------------------------------------------------------ */

function indication(f: Fiche, decision: 'urgence' | 'traiter', titre: string, raison: string, actions: string[], sources: SourceRef[]) {
  f.c.indication = { decision, qualification: 'infection_probable', titre, raison, conditions: [], exceptions: [], actions, surveillance: [], reconsiderer: [], questions: [], sources, statut: 'brouillon', regleId: ID_REGLE };
}

function alerteRenaleC3G(f: Fiche) {
  f.alerte(
    'attention',
    'Insuffisance rénale et C3G méningées : les paliers de la SPILF 2018 sont appliqués sous chaque traitement — pleine dose les 24 premières heures, puis céfotaxime réduit de 25 % (DFG 30-60), 50 % (15-30) ou 75 % (< 15), ceftriaxone réduite de 50 % en une injection si ClCr < 30 mL/min ; doses habituelles sous hémofiltration continue. Les paliers des RCP (céfotaxime : demi-dose sous 10 mL/min ; ceftriaxone : 2 g/j au plus) visent la posologie standard et ne sont pas appliqués à la dose méningée. Doser plasma et LCS.',
    [
      SPr('Tableau 8 p. 22 ; §12.8.2.4 p. 23', 'céfotaxime — même dose les 24 premières heures, puis réduction de 25 % (DFG 30–60), 50 % (DFG 15–30), 75 % (DFG < 15) ; pas d\'adaptation sous hémofiltration continue', 'adaptation_renale'),
      SPr('Tableau 8 p. 22', 'Ceftriaxone — si ClCr < 30 : même dose 24 h (en 2 injections) puis −50 % en 1 injection', 'adaptation_renale'),
      DIAr('dia 11', 'pas d\'adaptation les 24 premières heures quel que soit le DFG', 'adaptation_renale'),
    ],
  );
}

function controleDosageC3G(ctx: ContexteDecision, f: Fiche, fort: boolean) {
  const p = ctx.dossier.patient;
  const cg = estimation(ctx.renal, 'clairance_cg');
  const ageSup70 = p.age !== undefined && p.age > 70;
  const clcrInf30 = cg.calculable && cg.valeur !== undefined && cg.valeur < 30;
  const doseSup10 = fort && p.poidsKg !== undefined && p.poidsKg * 300 > 10000;
  f.controle({
    id: 'ctl-meningite-dosage-c3g',
    type: 'autre',
    categorie: ageSup70 || clcrInf30 || doseSup10 ? 'indique' : 'conditionnel',
    quoi: 'Dosage plasmatique (résiduel) de la C3G',
    quand: { ancre: 'debut_traitement', offsetHeures: 48, texte: 'À 48 h de traitement' },
    pourquoi: `Si dose > 10 g/j, âge > 70 ans ou ClCr < 30 mL/min${doseSup10 ? ' (céfotaxime 300 mg/kg/j : plus de 10 g/j pour ce poids)' : ''}${ageSup70 ? ' (âge > 70 ans)' : ''}${clcrInf30 ? ' (ClCr < 30 mL/min)' : ''}.`,
    sources: [SPr('p. 21', 'Dosage résiduel plasmatique à 48 h si dose > 10 g/j, âge > 70 ans ou ClCr < 30 mL/min', 'surveillance')],
  });
}

interface PaireC3G {
  id: string;
  libelle: string;
  fort: boolean;
  rang: Rang;
  condition?: string;
  duree: DureeDecidee;
  sources: SourceRef[];
  avec?: ItemPrescription[];
  /** Libellé des molécules associées (« + amoxicilline + gentamicine »). */
  suffixe?: string;
  type?: 'probabiliste' | 'documente';
  commentaire?: string;
  statut?: StatutValidation;
  /** Ceftriaxone affichée en premier (purpura fulminans, méningocoque : DGS 2018) ; même rang dans tous les cas. */
  ceftriaxoneDabord?: boolean;
}

/** Paire céfotaxime / ceftriaxone, au même rang (SPILF 2018 : « les deux antibiotiques de première intention »). */
function pairesC3G(f: Fiche, o: PaireC3G) {
  const avec = o.avec ?? [];
  const type = o.type ?? 'probabiliste';
  const suffixe = o.suffixe ?? (avec.length ? ' + amoxicilline + gentamicine' : '');
  const mg = o.fort ? ['300', '100'] : ['200', '75'];
  const sources = [...o.sources, SRC_C3G_EGAL];
  const cefo = () =>
    f.option({ id: `${o.id}-cefotaxime`, libelle: `${o.libelle} : céfotaxime ${mg[0]} mg/kg/j${suffixe}`, type, rang: o.rang, condition: o.condition, items: [o.fort ? CTX300 : CTX200, ...avec], duree: o.duree, sources, statut: o.statut, commentaire: [TXT_C3G_EGAL, 'RCP du céfotaxime : pas de données au-delà de 24 g/j.', o.commentaire].filter(Boolean).join(' ') });
  const cro = () =>
    f.option({
      id: `${o.id}-ceftriaxone`,
      libelle: `${o.libelle} : ceftriaxone ${mg[1]} mg/kg/j${suffixe}`,
      type,
      rang: o.rang,
      condition: o.condition,
      items: [o.fort ? CRO100 : CRO75, ...avec],
      duree: o.duree,
      sources,
      statut: o.statut,
      commentaire: [TXT_C3G_EGAL, 'Dose SPILF au-dessus du RCP (méningite : 2 à 4 g par jour) : écart signalé, statut brouillon ; 1 ou 2 perfusions par jour (prise unique non imposée).', o.commentaire].filter(Boolean).join(' '),
    });
  if (o.ceftriaxoneDabord) {
    cro();
    cefo();
  } else {
    cefo();
    cro();
  }
  alerteRenaleC3G(f);
}

function dexaDose(): { texte: string; sources: SourceRef[] } {
  return {
    texte:
      'Dexaméthasone 10 mg IV toutes les 6 h pendant 4 jours, juste avant ou avec la 1re dose d\'antibiotique ; en cas d\'oubli, jusqu\'à 12 h après la 1re dose d\'antibiotique (SPILF 2018 ; ESCMID 2016, cité par la SPILF : 4 h). RCP (DEXAMETHASONE KRKA, seule spécialité lue dont l\'AMM cite la méningite) : 0,15 mg/kg toutes les 6 h pendant 4 jours, en commençant avant l\'antibiotique — formulation divergente (dose fixe ou au poids), non tranchée.',
    sources: [
      S(SP, 'p. 25, §13.2.1', '10 mg every 6 hours, for 4 days', 'geste'),
      S(DIA, 'dia 3', 'En cas d\'oubli, la dexaméthasone peut être administrée jusqu\'à 12 H après la première dose d\'antibiotique', 'geste'),
      SPr('p. 25', 'ESCMID 2016 retient 4 heures, recommandations britanniques 2016 12 heures', 'geste'),
      S('RCP-dexamethasone-krka', '§4.2', '0,15 mg/kg de poids corporel toutes les 6 heures pendant 4 jours, […] commençant avant la première administration de l\'antibiotique', 'posologie'),
    ],
  };
}

const SRC_DEXA_NON = [
  S(DIA, 'dia 13', 'La dexaméthasone n\'est pas recommandée chez l\'immunodéprimé et en cas de listériose', 'geste'),
  SPr('p. 24', 'MONALISA — la dexaméthasone était un facteur indépendant de surmortalité, d\'où sa contre-indication en cas de listériose confirmée', 'geste'),
];

/** Dexaméthasone avant documentation (indication selon le contexte et l'examen direct). */
function dexaProbabiliste(ctx: ContexteDecision, f: Fiche, contexte: 'pf' | 'avant_pl' | 'pl_immediate' | 'neg' | 'cgp' | 'cgn' | 'bgp' | 'bgn', listeria: 'oui' | 'non' | 'inconnu') {
  const p = ctx.dossier.patient;
  if (p.immunodepression === 'oui') {
    f.geste('Pas de dexaméthasone : immunodépression (SPILF 2018).', SRC_DEXA_NON);
    return;
  }
  const d = dexaDose();
  const reserveImmuno = p.immunodepression === 'inconnu' ? ' Sauf immunodépression (à préciser).' : '';
  if (p.immunodepression === 'inconnu') f.manque('immunodépression', 'la dexaméthasone n\'est pas recommandée chez l\'immunodéprimé ; argument pour une listériose', 'affine', 'patient.immunodepression');
  if (contexte === 'bgp') {
    f.geste(
      `Examen direct à bacille à Gram positif (Listeria probable) : il n'est pas cité explicitement parmi les indications de la dexaméthasone (SPILF 2018 p. 25) ; un LCS trouble en est une, avec la 1re dose d'antibiotique. Elle n'est pas recommandée en cas de listériose (neuroméningée ou confirmée) : l'arrêter si Listeria est confirmée.${reserveImmuno}`,
      [SRC_DEXA_INDIC, ...SRC_DEXA_NON, SRC_DEXA_SUITE],
    );
    return;
  }
  if (contexte === 'bgn') {
    f.geste(
      `Examen direct à bacille à Gram négatif : il n'est pas cité explicitement parmi les indications de la dexaméthasone (SPILF 2018 p. 25) ; un LCS trouble en est une, avec la 1re dose d'antibiotique. Après identification : la poursuivre 4 jours au total si H. influenzae, l'arrêter pour les autres germes (E. coli…).${reserveImmuno}`,
      [SRC_DEXA_INDIC, SRC_DEXA_SUITE],
    );
    return;
  }
  const quand =
    contexte === 'pf'
      ? 'Purpura fulminans : il n\'est pas cité tel quel parmi les indications de la dexaméthasone ; l\'antibiothérapie probabiliste avant la PL en est une (SPILF 2018). Méningocoque probable : indication non consensuelle, plusieurs experts ne la recommandent pas. Si elle est retenue : '
      : contexte === 'pl_immediate'
        ? 'Si l\'antibiothérapie probabiliste est décidée (LCS trouble, PL retardée) : '
        : contexte === 'cgn'
          ? 'Cocci à Gram négatif (méningocoque) : indication non consensuelle, plusieurs experts ne la recommandent pas (SPILF 2018). Si elle est retenue : '
          : '';
  const lis = listeria === 'oui' ? ' Arguments pour une listériose : la dexaméthasone n\'est pas recommandée en cas de listériose ; l\'arrêter si Listeria est confirmée.' : '';
  const src = [...d.sources, SRC_DEXA_INDIC];
  if (contexte === 'cgn' || contexte === 'pf') src.push(S(SP, 'p. 25, §13.2.1', 'Several experts do not recommend dexamethasone', 'geste'));
  f.geste(`${quand}${d.texte}${reserveImmuno}${lis}`, listeria === 'oui' ? [...src, ...SRC_DEXA_NON] : src);
  const pd = ctx.dossier.horaires.premiereDoseISO;
  if (pd && ctx.maintenant.getTime() - new Date(pd).getTime() > 12 * 3_600_000)
    f.alerte('attention', 'La 1re dose d\'antibiotique date de plus de 12 h : si la dexaméthasone n\'a pas été débutée, la fenêtre de rattrapage de la SPILF (12 h) est dépassée.', [S(DIA, 'dia 3', 'En cas d\'oubli, la dexaméthasone peut être administrée jusqu\'à 12 H après la première dose d\'antibiotique', 'geste')]);
}

/** Infection invasive à méningocoque : déclaration obligatoire, contagiosité, sujets contacts, décontamination du cas index. */
function iim(f: Fiche, motif: string, casIndex: boolean) {
  f.alerte('attention', `Critère de cas d'infection invasive à méningocoque (${motif}) : déclaration obligatoire — signalement sans délai à l'ARS (plateforme de veille, par téléphone 24 h/24), puis fiche de notification (DGS 2018).`, [
    S(DGS, 'p. 16, fiche 7', 'Tout cas répondant à au moins un de ces critères doit être signalé sans délai à l\'autorité sanitaire (ARS)', 'definition'),
    DGSr('p. 16, fiche 7', 'critères (isolement ou PCR + d\'un site stérile ou d\'une lésion purpurique ; diplocoques Gram − dans le LCS ; LCS purulent + purpura ; purpura fulminans)', 'definition'),
  ]);
  f.geste(
    'Précautions « gouttelettes » : la contagiosité débute dix jours avant l\'hospitalisation et se termine après la 1re administration parentérale de ceftriaxone, ou 24 h après le début d\'un autre antibiotique efficace sur le portage ; les précautions sont levées à ce moment (DGS 2018).',
    [
      S(DGS, 'p. 10, fiche 1', 'la période de contagiosité débute dix jours avant l\'hospitalisation et se termine après la première administration parentérale de ceftriaxone ou 24 h après l\'administration d\'un autre antibiotique efficace sur le portage', 'geste'),
      DGSr('p. 15', 'précautions gouttelettes levées 24 h après le début d\'un antibiotique actif sur le portage (immédiatement avec la ceftriaxone)', 'geste'),
    ],
  );
  f.geste(
    'Sujets contacts (exposition directe aux sécrétions rhinopharyngées du cas dans les 10 jours précédant son hospitalisation : distance < 1 m, face à face, au moins une heure d\'affilée — moins si toux ou éternuements —, bouche-à-bouche quelle que soit la durée) : antibioprophylaxie quel que soit leur statut vaccinal, dans les 24 à 48 heures suivant le diagnostic ; sans intérêt au-delà de 10 jours après le dernier contact. Liste et mise en œuvre avec l\'ARS. Inutiles : désinfection rhinopharyngée, prélèvement de gorge des contacts, éviction, fermeture d\'établissement.',
    [
      S(DGS, 'p. 17, fiche 8-1', 'dans les 24 à 48 heures suivant le diagnostic, et n\'a plus d\'intérêt au-delà de 10 jours après le dernier contact avec le cas index pendant sa période de contagiosité', 'geste'),
      S(DGS, 'p. 17, fiche 8-1', 'quel que soit leur statut vaccinal', 'geste'),
      DGSr('p. 18', 'désinfection rhino-pharyngée, prélèvement de gorge des contacts, éviction scolaire, fermeture d\'établissement', 'geste'),
    ],
  );
  f.alerte(
    'attention',
    'Choix de l\'antibioprophylaxie des contacts : deux doctrines coexistent, non tranchées par l\'application. Instruction DGS 2018 : rifampicine orale 600 mg toutes les 12 h pendant 2 jours ; si contre-indication, résistance ou cas répétés : ciprofloxacine 500 mg en dose unique, ou ceftriaxone 250 mg en injection unique (dose absente du RCP). DGS-Urgent 2025_06 (texte primaire non lu ; relayé par l\'AP-HP en octobre 2025, sans posologie) : ciprofloxacine si la souche est sensible, ceftriaxone si elle est résistante ou non documentée, rifampicine réservée (souche résistante à la ciprofloxacine et contre-indication à la ceftriaxone). Rifampicine : RCP du 08/04/2026 plus restrictif chez la femme enceinte ou en âge de procréer. Décision avec l\'ARS.',
    [
      S(DGS, 'p. 18, fiche 8-2', 'Rifampicine par voie orale, pendant deux jours', 'choix'),
      S(DGS, 'p. 18, fiche 8-2', 'Ceftriaxone par voie injectable, en dose unique : Adulte : injection unique de 250 mg', 'choix'),
      S('DGS-URGENT-2025-06', 'PDF primaire non lisible : contenu connu par relais (AP-HP, octobre 2025)', undefined, 'choix'),
      S(APHP, 'V3-16/10/25 (relais du DGS-Urgent 2025_06)', 'Ciprofloxacine si la souche est sensible à la ciprofloxacine', 'choix'),
      S(APHP, 'V3-16/10/25 (relais du DGS-Urgent 2025_06)', 'Ceftriaxone si la souche est résistante à la ciprofloxacine ou en l\'absence de documentation', 'choix'),
      S(APHP, 'V3-16/10/25 (relais du DGS-Urgent 2025_06)', 'Rifampicine réservée aux situations où la souche est résistante à la ciprofloxacine et qu\'il existe une contre-indication à la ceftriaxone', 'choix'),
      S('RCP-rifampicine-orale', '§4.6', 'ne doit être utilisé pendant la grossesse que lorsque cela est strictement nécessaire', 'autre'),
    ],
  );
  if (!casIndex) return;
  const cond = 'cas index non traité par ceftriaxone : décontamination du portage selon la DGS 2018 ; inutile après au moins 24 h de C3G selon la SPILF 2018 (divergence non tranchée)';
  const srcCas = [S(DGS, 'p. 15', 'prophylaxie du portage pour le patient « s\'il n\'a pas été traité par ceftriaxone »', 'choix'), SPr('p. 28, §14.1.2', 'pas de décontamination pharyngée si ≥ 24 h de C3G', 'choix')];
  const commun = 'Choix de la molécule non tranché — instruction DGS 2018 : rifampicine en 1re intention, ciprofloxacine ou ceftriaxone en 2e intention ; DGS-Urgent 2025_06 (relais AP-HP) : ciprofloxacine si la souche est sensible, ceftriaxone si elle est résistante ou non documentée, rifampicine réservée. Ordre d\'affichage alphabétique, sans préférence ; décision avec l\'ARS.';
  const srcAphp = (extrait: string) => S(APHP, 'V3-16/10/25 (relais du DGS-Urgent 2025_06)', extrait, 'choix');
  f.option({ id: 'meningite-cas-index-ceftriaxone', libelle: 'Décontamination du portage du cas index : ceftriaxone 250 mg en injection unique (hors RCP)', type: 'documente', rang: 'conditionnelle', condition: cond, items: [CRO_PROPH], duree: { texte: 'Injection unique', pointDeDepart: 'injection unique', dureePrevueJours: 1, sources: [S(DGS, 'p. 18, fiche 8-2', 'Ceftriaxone par voie injectable, en dose unique : Adulte : injection unique de 250 mg', 'duree')] }, sources: [...srcCas, srcAphp('Ceftriaxone si la souche est résistante à la ciprofloxacine ou en l\'absence de documentation')], statut: 'brouillon', commentaire: commun });
  f.option({ id: 'meningite-cas-index-ciprofloxacine', libelle: 'Décontamination du portage du cas index : ciprofloxacine orale en dose unique', type: 'documente', rang: 'conditionnelle', condition: cond, items: [CIPRO_PO], duree: { texte: 'Dose unique', pointDeDepart: 'prise unique', dureePrevueJours: 1, sources: [S('RCP-ciprofloxacine-orale', '§4.2', '1 jour (dose unique)', 'duree')] }, sources: [...srcCas, srcAphp('Ciprofloxacine si la souche est sensible à la ciprofloxacine')], statut: 'brouillon', commentaire: commun });
  f.option({ id: 'meningite-cas-index-rifampicine', libelle: 'Décontamination du portage du cas index : rifampicine orale 48 h', type: 'documente', rang: 'conditionnelle', condition: cond, items: [RIFA_PO], duree: { texte: '48 heures', pointDeDepart: 'première prise', dureePrevueJours: 2, sources: [S('RCP-rifampicine-orale', '§4.2', 'La rifampicine sera donnée pendant 48 heures', 'duree')] }, sources: [...srcCas, S(DGS, 'p. 18, fiche 8-2', 'Rifampicine par voie orale, pendant deux jours', 'choix')], statut: 'brouillon', commentaire: commun });
}

/** Doses calculées au-delà des données du RCP (céfotaxime > 24 g/j, amoxicilline > 12 g/j) ou d'une charge de vancomycine > 3 g. */
function alertesDoseMax(ctx: ContexteDecision, f: Fiche) {
  const poids = ctx.dossier.patient.poidsKg;
  if (!poids) return;
  const regs = new Set(f.c.options.flatMap((o) => o.prescriptions.map((x) => x.regimenId)));
  const gj = (mgkg: number) => nombreFr((poids * mgkg) / 1000, 1);
  const srcCtx = [S('RCP-cefotaxime', '§4.2', 'on ne dispose pas d\'éléments d\'efficacité ou de tolérance au-delà de 24 g/ jour', 'posologie'), S(SP, 'p. 21, §12.8.1.1', 'some studies report doses of 24 g/day of cefotaxime', 'posologie')];
  for (const [id, mgkg] of [['cefotaxime-meninge-300', 300], ['cefotaxime-meninge-200', 200]] as const)
    if (regs.has(id) && poids * mgkg > 24000)
      f.alerte('attention', `Céfotaxime ${mgkg} mg/kg/j pour ${nombreFr(poids, 1)} kg : ${gj(mgkg)} g/j, au-delà de 24 g/j — le RCP ne dispose pas de données d'efficacité ni de tolérance au-delà ; pas de consensus SPILF sur la dose maximale de l'adulte ; poids de référence non précisé par la source. Dose à décider avec l'infectiologue, avec dosages (brouillon).`, srcCtx);
  if (regs.has('amoxicilline-meninge-200') && poids * 200 > 12000)
    f.alerte('attention', `Amoxicilline 200 mg/kg/j pour ${nombreFr(poids, 1)} kg : ${gj(200)} g/j, au-delà du maximum du RCP (12 g/j) ; la SPILF 2018 ne fixe pas de plafond ; poids de référence non précisé par la source. Dose à décider avec l'infectiologue (brouillon).`, [
      S('RCP-amoxicilline', '§4.2', 'Méningite bactérienne 1 g à 2 g toutes les 4 à 6 heures, au maximum 12 g/jour', 'posologie'),
      SPr('p. 21, §12.8.1.3', 'amoxicilline 200 mg/kg/j IV en 4 à 6 perfusions', 'posologie'),
    ]);
  if (regs.has('vancomycine-meninge') && poids * 30 > 3000)
    f.alerte('attention', `Vancomycine : dose de charge de 30 mg/kg pour ${nombreFr(poids, 1)} kg = ${gj(30)} g, au-delà des 3 g retenus pour les autres schémas de vancomycine ; la SPILF 2018 ne fixe pas de plafond (divergence non tranchée) : avis pharmacologique.`, [
      SPr('Tableau 10 p. 24', 'vancomycine (charge 30 mg/kg sur 1 h puis 40–60 mg/kg/j, résiduelle 15–20 mg/L)', 'posologie'),
      S('ASHP-IDSA-2020-vancomycine-STP', 'dose de charge', 'Loading doses should be based on actual body weight and not exceed 3,000 mg', 'posologie'),
    ]);
}

/* ------------------------------------------------------------------ */
/* Règle                                                               */
/* ------------------------------------------------------------------ */

export const R_MENINGITE: Regle = {
  id: ID_REGLE,
  libelle: 'Méningite bactérienne aiguë communautaire de l\'adulte',
  description: 'SPILF 2018 (texte long, diaporama ; en cours de révision), instruction DGS 2018 et DGS-Urgent 2025_06 (prophylaxie des IIM), IDSA 2017 (méningites post-neurochirurgicales, recoupement), RCP. Brouillon tant que la révision SPILF n\'est pas publiée.',
  statut: 'brouillon',
  priorite: 156,
  sources: [S(SP, 'Med Mal Infect 2019;49:405-441', undefined, 'choix'), S(DIA, 'validé le 19/09/2018', undefined, 'choix'), S(DGS, 'instruction DGS/SP/2018/163', undefined, 'choix')],
  // Syndrome « méningite » choisi en entrée A : la règle s'applique même si une hémoculture porte un autre foyer.
  sApplique: (ctx) => adulte(ctx) && (ctx.foyer === 'meningite' || (ctx.dossier.entree === 'syndrome' && ctx.dossier.syndrome === 'meningite')),
  appliquer: (ctx) => {
    const f = new Fiche(ctx, 'brouillon');
    const p = ctx.dossier.patient;
    f.alerte('info', 'Référentiel SPILF 2018 (actualisation de la conférence de consensus 2008) marqué « en cours de révision » sur le site de la SPILF (consulté le 06/11/2026) ; aucune nouvelle version publiée : tout le domaine reste en brouillon.', [S('SPILF-page-recommandations', 'Infections neuro-méningées', '(en cours de révision)', 'autre')]);
    if (ctx.foyer !== 'meningite')
      f.alerte('attention', `Un prélèvement est rattaché à un autre foyer (${ctx.foyer}) alors que le syndrome choisi est une méningite : la méningite reste prise en charge ci-dessous ; les propositions d'autres règles visent ce foyer. Vérifier le foyer du prélèvement.`);
    const neuro = q(ctx, 'meningite.neurochirurgie');
    const pf = q(ctx, 'meningite.purpura') === 'fulminans';
    if (neuro === 'oui') {
      horsModele(ctx, f, pf);
      return f.fin();
    }
    if (p.contexte === 'associe_aux_soins') {
      f.plafond('partielle');
      f.alerte('attention', 'Contexte associé aux soins : les schémas proposés sont ceux des méningites communautaires (SPILF 2018) ; une méningite post-neurochirurgicale ou sur matériel (dérivation, drain) en sort et relève d\'un avis spécialisé. Avis infectiologique.');
      if (neuro === 'inconnu') manqueQ(f, 'meningite.neurochirurgie', 'méningite post-neurochirurgicale ou sur matériel (dérivation, drain)', 'hors du référentiel SPILF 2018 (méningites communautaires) : avis spécialisé', 'bloque_decision');
    } else if (p.contexte === 'inconnu') {
      f.alerte('attention', 'Contexte à confirmer : les schémas proposés ne valent que pour la méningite communautaire ; méningite post-neurochirurgicale ou sur matériel (dérivation, drain) : avis spécialisé.');
      if (neuro === 'inconnu') manqueQ(f, 'meningite.neurochirurgie', 'méningite post-neurochirurgicale ou sur matériel (dérivation, drain)', 'hors du référentiel SPILF 2018 (méningites communautaires) : avis spécialisé', 'affine');
    }
    f.avis(
      'Avis réanimateur recommandé pour tous. Réanimation si purpura extensif, Glasgow ≤ 8, signes neurologiques focaux, signes de souffrance du tronc cérébral, état de mal convulsif, instabilité hémodynamique ou détresse respiratoire ; Glasgow ≤ 13 : discuter les soins continus ; sinon, surveillance horaire de la conscience et de l\'hémodynamique pendant au moins 24 h.',
      pf || p.gravite === 'choc_septique',
      [SPr('p. 26, §13.3.1', 'critères de réanimation — purpura extensif, Glasgow ≤ 8, signes neurologiques focaux, signes de souffrance du tronc cérébral, état de mal convulsif, instabilité hémodynamique ; avis réanimateur recommandé pour tous', 'autre'), S(DIA, 'dia 14', 'Score de Glasgow ≤ 13 : discuter surveillance en soins continus', 'autre')],
    );
    f.geste('Pas d\'anticonvulsivant en prévention primaire ; pas de restriction hydrique (natrémie et diurèse quotidiennes) ; en cas de sepsis, insuline IV pour une glycémie < 1,8 g/L après stabilisation hémodynamique.', [SPr('p. 26-27, §13.3.2', 'non recommandée ; natrémie et diurèse quotidiennes', 'geste'), SPr('p. 27', 'insuline IV pour < 1,8 g/L après stabilisation hémodynamique en cas de sepsis', 'geste')]);
    const germe = germeMeningite(ctx.dossier);
    const declare = q(ctx, 'meningite.germe');
    const deduit = germeDeduit(ctx.dossier);
    if (deduit && declare !== 'inconnu' && declare !== 'non_documente' && declare !== deduit)
      f.alerte('attention', `Germe déclaré (${LIB_GERME[declare as Germe] ?? declare}) différent de celui d'une hémoculture ou d'un prélèvement méningé saisi (${LIB_GERME[deduit as Germe] ?? deduit}) : vérifier ; la réponse à la question est retenue.`);
    for (const x of germesHorsListe(ctx.dossier)) {
      const nom = x.organismeLibre || LIBELLE_ORGANISME[x.organisme!];
      f.alerte('attention', `${x.type === 'hemoculture' ? 'Hémoculture' : 'Prélèvement méningé'} à ${nom} : germe hors des schémas méningés modélisés (SPILF 2018 : pneumocoque, méningocoque, Listeria, H. influenzae, E. coli, S. agalactiae). S'il s'agit du germe de la méningite, répondre « Autre germe » à la question du germe ; avis infectiologique.`);
      f.avis(`Méningite et ${nom} dans un prélèvement : avis infectiologique pour le choix et la durée.`, false, []);
    }
    if (germe !== 'inconnu' && germe !== 'non_documente') documentee(ctx, f, germe as Germe);
    else probabiliste(ctx, f);
    alertesDoseMax(ctx, f);
    return f.fin();
  },
};

/** Méningite post-neurochirurgicale ou sur matériel : hors modèle, avis spécialisé ; urgence et purpura fulminans conservés. */
function horsModele(ctx: ContexteDecision, f: Fiche, pf: boolean) {
  f.alerte('urgence', TEXTE_DELAI, SRC_DELAI);
  if (pf) purpuraFulminans(f, allergies(ctx).grave);
  associeeAuxSoins(f);
  indication(f, 'urgence', 'Méningite post-neurochirurgicale ou sur matériel : traitement urgent, schéma hors référentiel', 'Méningite suspectée : l\'antibiothérapie ne doit pas être retardée ; le schéma relève d\'un avis spécialisé (hors du référentiel SPILF 2018 des méningites communautaires).', ['Avis infectiologique et neurochirurgical immédiat', 'Hémocultures et prélèvements (LCS, matériel) avant antibiotique si cela ne le retarde pas', 'Antibiothérapie probabiliste dans l\'heure selon le protocole local'], SRC_DELAI);
}

function associeeAuxSoins(f: Fiche) {
  const src = [S('IDSA-2017-HCAVM', 'Rec. 37 (strong, low)', 'cefepime, ceftazidime, or meropenem', 'choix'), S('IDSA-2017-HCAVM', 'Rec. 62-63', '[reformulation] ablation de la dérivation/du drain infecté', 'geste')];
  f.urgence('immediate')
    .situation('meningite-associee-soins', 'Méningite post-neurochirurgicale ou sur matériel (dérivation, drain) : avis spécialisé', 'non_couverte', 'Hors du référentiel SPILF 2018 (méningites communautaires). Aucune recommandation française récente trouvée ; l\'IDSA 2017 n\'a été lue que partiellement (recoupement).')
    .avis('Méningite post-neurochirurgicale ou sur matériel : avis infectiologique et neurochirurgical immédiat (dérivation ou drain infecté : ablation à discuter).', true, src)
    .absence(
      'Antibiothérapie d\'une méningite associée aux soins (post-neurochirurgicale, sur dérivation ou drain)',
      'Recherche du 2026-11-06 : pas de recommandation française récente ; IDSA 2017 (page lue via un outil de résumé, tableau des posologies non lu) : vancomycine + bêta-lactamine antipyocyanique (céfépime, ceftazidime ou méropénème), ablation du matériel infecté, durées de 10 à 21 jours selon le germe — repris pour information, sans proposition automatisée.',
      ['Avis infectiologique et neurochirurgical immédiat', 'Hémocultures et prélèvements (LCS, matériel) avant antibiotique si cela ne le retarde pas', 'Antibiothérapie probabiliste selon le protocole local, sans attendre'],
      src,
    );
}

/* ------------------------------------------------------------------ */
/* Avant documentation                                                 */
/* ------------------------------------------------------------------ */

/** Durée d'une méningite non documentée : 14 jours si l'évolution est favorable (examen direct négatif ou en attente). */
function dureeNonDoc(ctx: ContexteDecision): DureeDecidee {
  const nonDoc = ['negatif', 'trouble_attente'].includes(q(ctx, 'meningite.lcs'));
  if (nonDoc && q(ctx, 'meningite.evolution') === 'favorable')
    return { ...D_NON_DOC, texte: `${D_NON_DOC.texte} Germe non documenté, évolution favorable déclarée : 14 jours.`, dureePrevueJours: 14 };
  return D_NON_DOC;
}

const CHAMP_LCS = 'ponction lombaire : aspect du LCS et coloration de Gram';
const COND_PL = 'dès que le LCS est trouble (sans attendre l\'examen direct) ; d\'emblée, après hémocultures, si la PL ne peut pas être réalisée dans l\'heure suivant l\'admission';
const COND_A_PRECISER = 'dès que le LCS est trouble ; d\'emblée, après hémocultures, si la PL est différée (imagerie préalable, contre-indication), si elle ne peut pas être réalisée dans l\'heure suivant l\'admission ou si l\'admission à l\'hôpital est impossible dans les 90 minutes';

function probabiliste(ctx: ContexteDecision, f: Fiche) {
  const lcs = q(ctx, 'meningite.lcs');
  const purpura = q(ctx, 'meningite.purpura');
  const pf = purpura === 'fulminans';
  const imag = q(ctx, 'meningite.imagerie');
  const ci = contreIndicationPL(ctx);
  const lis = argumentsListeriose(ctx);
  const al = allergies(ctx);
  const avantPL = lcs === 'pas_faite' || lcs === 'inconnu';
  f.urgence('immediate');
  f.alerte('urgence', TEXTE_DELAI, SRC_DELAI);
  // L'examen du LCS affine le schéma mais ne retarde jamais l'antibiotique ; jamais demandé dans le purpura fulminans.
  if (lcs === 'inconnu' && !pf) f.manque(CHAMP_LCS, 'oriente le schéma probabiliste ; l\'antibiothérapie ne l\'attend pas si la PL est différée ou impossible dans l\'heure (SPILF 2018)', 'affine', 'details.meningite.lcs');
  const actionPL = 'Si la PL ne peut pas être réalisée dans l\'heure suivant l\'admission (ou si l\'admission à l\'hôpital est impossible dans les 90 minutes) : hémocultures, puis dexaméthasone et antibiothérapie probabiliste sans attendre la PL (au plus tard dans les 3 heures).';
  if (avantPL && !pf) f.geste(actionPL, [SRC_PL_NON_IMMEDIATE, SRC_AVANT_PL, S(DIA, 'dia 8', 'Au plus tard dans les 3 heures', 'choix')]);
  indication(
    f,
    'urgence',
    pf ? 'Purpura fulminans : antibiotique immédiat' : 'Méningite bactérienne suspectée : antibiothérapie urgente',
    pf ? 'Purpura fulminans : 1re dose d\'antibiotique immédiate, sans attendre aucun prélèvement (DGS 2018).' : 'Méningite bactérienne suspectée : antibiothérapie dans l\'heure suivant l\'admission (SPILF 2018) ; tout retard aggrave le pronostic.',
    pf
      ? ['1re dose d\'antibiotique immédiate (ceftriaxone, à défaut céfotaxime), IV ou à défaut IM, sans attendre aucun prélèvement', 'Appel du SAMU-Centre 15 ; réanimation']
      : avantPL
        ? ['Hémocultures puis antibiothérapie (et dexaméthasone si indiquée) dans l\'heure suivant l\'admission, au plus tard dans les 3 heures', actionPL]
        : ['Antibiothérapie (et dexaméthasone si indiquée) immédiate, sans attendre l\'examen direct ni la culture'],
    [...SRC_DELAI, SRC_PL_NON_IMMEDIATE],
  );

  // Hémocultures : divergence SPILF / DGS dans le purpura fulminans (non tranchée : pas d'ancre « avant le traitement »).
  if (pf) {
    f.controle({ id: 'ctl-meningite-hc', type: 'hemoculture', categorie: 'conditionnel', quoi: 'Hémocultures — sans retarder l\'antibiotique', quand: { ancre: 'non_determine', texte: 'Divergence : SPILF 2018 « après hémoculture » ; DGS 2018 : l\'antibiothérapie ne doit pas être retardée par une hémoculture' }, pourquoi: 'Purpura fulminans : la SPILF place l\'antibiotique après les hémocultures, la DGS demande de ne pas le retarder pour un prélèvement. Divergence affichée, non tranchée par l\'application.', sources: [SRC_AVANT_PL, S(DGS, 'p. 15, fiche 6', 'ne doit pas être retardée par la réalisation d\'une hémoculture ou d\'un prélèvement sanguin', 'controle_micro')] });
  } else {
    f.controle({ id: 'ctl-meningite-hc', type: 'hemoculture', categorie: 'indique', quoi: 'Hémocultures (au moins une paire ; au moins deux si la PL est différée)', quand: { ancre: 'avant_traitement', texte: 'Avant la 1re dose d\'antibiotique, sans la retarder' }, pourquoi: 'Documentation, en particulier quand la PL est différée.', sources: [SPr('p. 8', 'au moins une paire d\'hémocultures', 'controle_micro'), SRC_PL_NON_IMMEDIATE] });
  }
  if (pf || purpura === 'autre') f.controle({ id: 'ctl-meningite-biopsie', type: 'prelevement', categorie: 'conditionnel', quoi: 'Biopsie cutanée d\'une lésion purpurique', quand: { ancre: 'non_determine', texte: 'Après l\'antibiotique' }, pourquoi: 'Documentation microbiologique en cas de purpura.', sources: [SPr('p. 8', 'biopsie cutanée si purpura', 'controle_micro')] });
  if (purpura === 'inconnu') manqueQ(f, 'meningite.purpura', 'purpura (fulminans ?)', 'purpura fulminans : antibiotique immédiat avant tout prélèvement (DGS 2018)', 'bloque_decision');

  if (pf) purpuraFulminans(f, al.grave);

  // Rang des options et situation.
  let rang: Rang = 'premiere_ligne';
  let condition: string | undefined;
  let contexteDexa: Parameters<typeof dexaProbabiliste>[2] = 'neg';
  if (avantPL) {
    controlesAvantPL(f, pf, imag, ci);
    if (pf) {
      contexteDexa = 'pf';
    } else if (imag === 'oui' || ci.etat === 'oui') {
      f.situation('meningite-antibiotique-avant-pl', 'Méningite suspectée, PL différée : antibiothérapie et dexaméthasone avant la PL', 'couverte', `Hémocultures, puis dexaméthasone et antibiothérapie sans attendre ${imag === 'oui' ? 'l\'imagerie' : 'la correction de la contre-indication'} ; PL dès que possible. Schéma « examen direct négatif » (SPILF 2018).`);
      contexteDexa = 'avant_pl';
    } else if (imag === 'non' && ci.etat === 'non') {
      f.situation('meningite-pl-immediate', 'Méningite suspectée : PL dans l\'heure', 'couverte', 'Pas de contre-indication ni d\'imagerie préalable : PL dans l\'heure suivant l\'admission ; antibiothérapie dès que le LCS est trouble, sans attendre l\'examen direct — ou d\'emblée si la PL ne peut pas être faite dans l\'heure.');
      rang = 'conditionnelle';
      condition = COND_PL;
      contexteDexa = 'pl_immediate';
    } else {
      f.situation('meningite-pl-a-preciser', 'Méningite suspectée : PL immédiate ou différée à préciser', 'partielle', 'Rechercher les signes imposant une imagerie et les contre-indications de la PL : ils décident si l\'antibiothérapie précède la PL. Elle ne doit pas être retardée au-delà de l\'heure.');
      rang = 'conditionnelle';
      condition = COND_A_PRECISER;
      contexteDexa = 'pl_immediate';
    }
    schemaNegatif(ctx, f, rang, condition, lis, al, pf);
  } else if (lcs === 'trouble_attente' || lcs === 'negatif') {
    if (lcs === 'trouble_attente') f.situation('meningite-lcs-trouble', 'LCS trouble, examen direct en attente', 'couverte', 'Antibiothérapie immédiate sans attendre l\'examen direct : schéma « examen direct négatif » (SPILF 2018).');
    else {
      f.situation('meningite-examen-direct-negatif', `Méningite à examen direct négatif${lis.etat === 'oui' ? ' avec arguments pour une listériose' : ''}`, lis.etat === 'inconnu' ? 'partielle' : 'couverte', lis.etat === 'oui' ? `Arguments : ${lis.raisons.join(', ')}.` : 'C3G à forte dose ; amoxicilline et gentamicine s\'il existe des arguments pour une listériose.');
      f.controle({ id: 'ctl-meningite-lactates', type: 'prelevement', categorie: 'conditionnel', quoi: 'Lactates du LCS (seuil 3,8 mmol/L) et procalcitonine sérique', quand: { ancre: 'avant_traitement', texte: 'Sur la PL initiale' }, pourquoi: 'Utiles seulement si l\'examen direct est négatif.', sources: [SPr('p. 8', 'lactates LCS (meilleur seuil 3,8 mmol/L) et PCT sérique utiles seulement si examen direct négatif', 'controle_micro')] });
    }
    schemaNegatif(ctx, f, 'premiere_ligne', undefined, lis, al, pf);
    if (lcs === 'trouble_attente') f.reeval('Adapter dès l\'examen direct (cocci à Gram positif ou négatif, bacille à Gram positif ou négatif) puis à la culture.', [SRC_ATTENDRE]);
    if (q(ctx, 'meningite.evolution') === 'defavorable') {
      f.controle({ id: 'ctl-meningite-pl-controle', type: 'prelevement', categorie: 'indique', quoi: 'PL de contrôle après imagerie, avec dosage de la C3G', quand: { ancre: 'debut_traitement', offsetHeures: 48, texte: 'À 48-72 h de traitement' }, pourquoi: 'Évolution défavorable.', sources: [SPr('p. 29 §14.2 ; Tableau 12 p. 30', 'si évolution défavorable, systématique après imagerie, avec dosage de la C3G', 'controle_micro')] });
      f.controle({ id: 'ctl-meningite-imagerie', type: 'imagerie', categorie: 'indique', quoi: 'Imagerie cérébrale (IRM)', quand: { ancre: 'debut_traitement', offsetHeures: 48, texte: 'À 48-72 h de traitement' }, pourquoi: 'Évolution défavorable à 48-72 h.', sources: [SPr('p. 29-30 ; Tableau 13', 'occasionnelle si fièvre > 38,5 °C, troubles de conscience ou céphalées persistant après 48–72 h, signes neurologiques nouveaux', 'imagerie')] });
    }
  } else {
    contexteDexa = lcs as 'cgp' | 'cgn' | 'bgp' | 'bgn';
    examenDirect(ctx, f, contexteDexa, al, pf);
  }
  dexaProbabiliste(ctx, f, contexteDexa, lis.etat);
  // Déclaration : purpura + LCS purulent est un critère de cas quel que soit l'examen direct (DGS 2018, fiche 7).
  if (pf || lcs === 'cgn') iim(f, pf ? 'purpura fulminans' : 'diplocoques à Gram négatif dans le LCS', lcs === 'cgn');
  else if (purpura === 'autre' && ['trouble_attente', 'cgp', 'bgp', 'bgn'].includes(lcs)) iim(f, 'purpura et LCS purulent', false);
  else if (purpura === 'autre' && lcs === 'negatif')
    f.alerte('attention', 'Purpura et LCS : si le LCS est purulent, c\'est un critère de cas d\'infection invasive à méningocoque — déclaration obligatoire sans délai à l\'ARS (DGS 2018).', [S(DGS, 'p. 16, fiche 7', 'LCS purulent + purpura', 'definition')]);
  f.reeval('Réévaluer à 48-72 h : germe et CMI, évolution clinique ; adapter la molécule, la dose et la durée (choisir le germe dans les précisions du foyer).', [SPr('p. 27, §14.1 ; Tableau 11 p. 28', 'adaptation à la CMI et à l\'évolution à 48–72 h', 'choix')], 48);
}

function controlesAvantPL(f: Fiche, pf: boolean, imag: string, ci: { etat: string; anticoagulant: boolean }) {
  const srcImag = S(SP, 'p. 10, §11.3.1', 'Isolated consciousness disorders are not considered contraindications', 'imagerie');
  // Antibiothérapie avant la PL déjà décidée (imagerie requise ou contre-indication) : les autres données ne font qu'affiner.
  const decide = imag === 'oui' || ci.etat === 'oui';
  if (imag === 'oui')
    f.controle({ id: 'ctl-meningite-imagerie-avant-pl', type: 'imagerie', categorie: 'indique', quoi: 'Imagerie cérébrale avant la PL', quand: { ancre: 'debut_traitement', texte: 'Après hémocultures, dexaméthasone et 1re dose d\'antibiotique ; puis PL si l\'imagerie le permet' }, pourquoi: 'Signes de localisation ou crises focales récentes, signes d\'engagement ou crises persistantes.', sources: [srcImag, SRC_AVANT_PL] });
  else if (imag === 'non')
    f.controle({ id: 'ctl-meningite-imagerie-avant-pl', type: 'imagerie', categorie: 'non_systematique', quoi: 'Pas d\'imagerie avant la PL', quand: { ancre: 'non_determine', texte: 'Sans objet' }, pourquoi: 'Aucun signe de localisation, d\'engagement ni crise persistante ; des troubles de conscience isolés ne suffisent pas à la justifier.', sources: [srcImag] });
  else if (!pf) manqueQ(f, 'meningite.imagerie', 'signes imposant une imagerie avant la PL', 'décide si l\'antibiothérapie précède la PL (SPILF 2018)', decide ? 'affine' : 'bloque_decision');
  if (ci.anticoagulant) f.alerte('attention', 'Anticoagulant déclaré (AVK ou AOD) : contre-indication à une PL immédiate (AOD quelle que soit la dose) ; antibiothérapie avant la PL.', [S(SP, 'p. 5 §11.2.1 ; Tableau 1 p. 6', 'irrespective of the dose', 'definition'), SPr('p. 5 §11.2.1 ; Tableau 1 p. 6', 'anticoagulant à dose efficace (AVK, HNF ou HBPM, AOD « irrespective of the dose »)', 'definition')]);
  if (ci.etat === 'oui')
    f.controle({ id: 'ctl-meningite-ci-pl', type: 'prelevement', categorie: 'indique', quoi: 'Corriger la contre-indication (hémostase, hémodynamique, ventilation) puis PL dès que possible', quand: { ancre: 'debut_traitement', texte: 'Après hémocultures, dexaméthasone et 1re dose d\'antibiotique' }, pourquoi: 'Contre-indication non neurologique à une PL immédiate.', sources: [SPr('p. 5 §11.2.1 ; Tableau 1 p. 6', 'Les antiagrégants plaquettaires ne contre-indiquent pas la PL', 'definition'), SRC_AVANT_PL] });
  else if (ci.etat === 'inconnu' && !pf) manqueQ(f, 'meningite.ci_pl', 'contre-indication non neurologique à la PL', 'décide si l\'antibiothérapie précède la PL (SPILF 2018)', decide ? 'affine' : 'bloque_decision');
  if (pf)
    f.controle({ id: 'ctl-meningite-pl', type: 'prelevement', categorie: 'conditionnel', quoi: 'Ponction lombaire', quand: { ancre: 'non_determine', texte: 'Après l\'antibiotique, une fois l\'état stabilisé' }, pourquoi: 'Purpura fulminans : certains experts déconseillent la PL, même après correction.', sources: [SPr('p. 11, §12.2', 'Certains experts déconseillent la PL dans le purpura fulminans même après correction', 'controle_micro')] });
  else if (imag === 'non' && ci.etat === 'non')
    f.controle({ id: 'ctl-meningite-pl', type: 'prelevement', categorie: 'indique', quoi: 'Ponction lombaire', quand: { ancre: 'avant_traitement', texte: 'Dans l\'heure suivant l\'admission' }, pourquoi: 'Pas de contre-indication ni d\'imagerie préalable requise.', sources: [S(SP, 'p. 5, §11.2', 'within one hour following admission', 'controle_micro')] });
}

function purpuraFulminans(f: Fiche, allergieGrave: boolean) {
  f.urgence('immediate').situation('meningite-purpura-fulminans', 'Purpura fulminans : antibiothérapie immédiate, avant tout prélèvement', 'couverte', 'Antibiotique immédiat sans attendre aucun prélèvement, IV si possible, sinon IM, quel que soit l\'état hémodynamique ; SAMU-Centre 15 ; réanimation. En l\'absence d\'examen direct, schéma « examen direct négatif » (SPILF 2018).');
  f.alerte('urgence', 'Purpura fulminans : 1re dose d\'antibiotique immédiate, sans attendre aucun prélèvement.', [S(DGS, 'p. 15, fiche 6', 'doit immédiatement recevoir une première dose d\'un antibiotique', 'choix')]);
  f.geste(
    'Purpura fulminans : 1re dose d\'antibiotique immédiate, par voie IV si possible, à défaut IM, quel que soit l\'état hémodynamique ; de préférence ceftriaxone, à défaut céfotaxime. Adulte, en préhospitalier : ceftriaxone 1 g ou céfotaxime 1 g (présentation sans lidocaïne en IV). Appel systématique du SAMU-Centre 15.',
    [
      S(DGS, 'p. 15, fiche 6', 'administrée si possible par voie intraveineuse (IV), à défaut par voie intramusculaire (IM), quel que soit l\'état hémodynamique du patient', 'geste'),
      S(DGS, 'p. 15, fiche 6', 'de préférence ceftriaxone ou, en cas d\'indisponibilité, céfotaxime', 'geste'),
      DGSr('Tableau I, p. 15', 'adulte : ceftriaxone 1 g ; céfotaxime 1 g', 'posologie'),
    ],
  );
  if (allergieGrave)
    f.alerte('attention', 'Purpura fulminans et hypersensibilité sévère aux bêta-lactamines : réintroduction d\'une bêta-lactamine non recommandée, surtout en cas de choc (DGS 2018) ; recours : fluoroquinolone (DGS 2018, ciprofloxacine ou lévofloxacine, posologie non précisée) ou vancomycine + rifampicine (SPILF 2018) — affichés au même rang, sans préférence établie : avis infectiologique immédiat.', [
      S(DGS, 'p. 15, note 10', 'la réintroduction d\'une bêta-lactamine n\'est pas recommandée, surtout si le patient est en état de choc', 'choix'),
      S(DGS, 'p. 15, note 10', 'les fluoroquinolones (ciprofloxacine ou lévofloxacine) peuvent constituer un recours', 'choix'),
    ]);
}

interface OptionAllergie {
  id: string;
  libelle: string;
  items: ItemPrescription[];
  rangBase: Rang;
  /** Peut devenir la 1re ligne si la bêta-lactamine habituelle est évitée (rang « alternative »). */
  promouvable: boolean;
  grave: boolean;
  condition?: string;
  duree: DureeDecidee;
  extrait: string;
  type?: 'probabiliste' | 'documente';
  sansMeropeneme?: boolean;
}

function optionAllergie(f: Fiche, o: OptionAllergie): boolean {
  const condAl = o.grave
    ? undefined
    : o.promouvable
      ? 'si la bêta-lactamine habituelle ne peut pas être utilisée (allergie déclarée) — la SPILF 2018 recommande céfotaxime ou ceftriaxone si l\'allergie n\'est pas grave (anaphylaxie) ; avis infectiologique'
      : 'si allergie grave (hypersensibilité immédiate anaphylactique) aux bêta-lactamines — avis infectiologique obligatoire';
  const rifa = o.items.some((i) => i.m === 'rifampicine');
  const ok = f.option({
    id: o.id,
    libelle: o.libelle,
    type: o.type ?? 'probabiliste',
    rang: o.promouvable && o.rangBase !== 'conditionnelle' ? 'alternative' : 'conditionnelle',
    condition: [condAl, o.condition].filter(Boolean).join(' ; ') || undefined,
    items: o.items,
    duree: o.duree,
    statut: 'brouillon',
    sources: [SPr('p. 23, §12.8.2.3 ; Tableau 10 p. 24', o.extrait, 'choix'), SPr('p. 23, §12.8.2.3', 'allergie grave = hypersensibilité immédiate anaphylactique ; sinon céfotaxime/ceftriaxone recommandés', 'definition')],
    commentaire: `Allergie non grave : céfotaxime ou ceftriaxone restent recommandés (SPILF 2018). Aztréonam : mauvaise diffusion dans le LCS.${o.sansMeropeneme ? '' : ' Méropénème possible (faible risque croisé) mais sans données : avis infectiologique et surveillance continue les 24 premières heures.'}${rifa ? ' La rifampicine, inducteur enzymatique, peut réduire l\'effet de la dexaméthasone (RCP).' : ''}`,
  });
  if (o.grave) f.avis('Allergie grave aux bêta-lactamines et méningite : avis infectiologique obligatoire.', true, [SPr('p. 23, §12.8.2.3', 'avis infectiologique ; surveillance continue les 24 premières heures', 'choix')]);
  return ok;
}

/** Schéma « examen direct négatif » (aussi : avant la PL, LCS trouble en attente du Gram, purpura fulminans). */
function schemaNegatif(ctx: ContexteDecision, f: Fiche, rang: Rang, condition: string | undefined, lis: { etat: 'oui' | 'non' | 'inconnu'; raisons: string[] }, al: Allergies, pf: boolean) {
  const src = [SPr('p. 22-23, §12.8.2', 'sans argument pour une listériose → céfotaxime 300 mg/kg/j ou ceftriaxone 100 mg/kg/j ; avec arguments → même C3G + amoxicilline 200 mg/kg/j + gentamicine 5 mg/kg/j', 'choix'), SRC_ATTENDRE, SRC_PAS_VANCO];
  const srcLis = SPr('p. 22', 'Arguments pour listériose : âge > 70 ans, comorbidités, immunodépression, début progressif, rhombencéphalite (atteinte des nerfs crâniens et/ou syndrome cérébelleux)', 'definition');
  const dBase = dureeNonDoc(ctx);
  const dLis: DureeDecidee = { ...dBase, texte: `${dBase.texte} Gentamicine : les 5 premiers jours seulement.` };
  const comPf = pf ? 'Purpura fulminans : de préférence ceftriaxone, à défaut céfotaxime (DGS 2018).' : undefined;
  const srcPf = pf ? [S(DGS, 'p. 15, fiche 6', 'de préférence ceftriaxone ou, en cas d\'indisponibilité, céfotaxime', 'choix')] : [];
  if (lis.etat === 'inconnu') manqueListeriose(ctx, f);
  if (lis.etat !== 'oui')
    pairesC3G(f, { id: 'meningite-neg', libelle: 'Méningite sans documentation', fort: true, rang, condition: lis.etat === 'inconnu' ? [condition, 'en l\'absence d\'argument pour une listériose'].filter(Boolean).join(' ; ') : condition, duree: dBase, sources: [...src, ...srcPf], ceftriaxoneDabord: pf, commentaire: comPf });
  if (lis.etat !== 'non')
    pairesC3G(f, {
      id: 'meningite-neg-listeria',
      libelle: 'Méningite sans documentation, arguments pour une listériose',
      fort: true,
      rang: lis.etat === 'oui' ? rang : 'conditionnelle',
      condition: lis.etat === 'oui' ? condition : [condition, 's\'il existe des arguments pour une listériose'].filter(Boolean).join(' ; '),
      duree: dLis,
      sources: [...src, srcLis, ...srcPf],
      avec: [AMX, GENTA],
      ceftriaxoneDabord: pf,
      commentaire: [lis.etat === 'oui' ? `Arguments : ${lis.raisons.join(', ')}.` : '', 'Amoxicilline 200 mg/kg/j au-dessus du maximum du RCP (12 g/j) au-delà de 60 kg.', comPf].filter(Boolean).join(' '),
    });
  // Pénicilline seule évitée (allergie non grave), arguments pour une listériose : C3G (recommandée si l'allergie n'est pas
  // grave) + cotrimoxazole (alternative de la SPILF pour Listeria) — association composée par l'application.
  if (al.peni && !al.c3g && lis.etat !== 'non')
    pairesC3G(f, {
      id: 'meningite-neg-c3g-cotrimoxazole',
      libelle: 'Allergie aux pénicillines non grave, arguments pour une listériose',
      fort: true,
      rang: lis.etat === 'oui' && rang !== 'conditionnelle' ? 'alternative' : 'conditionnelle',
      condition: [condition, lis.etat === 'oui' ? 'si l\'amoxicilline ne peut pas être utilisée (allergie) — avis infectiologique' : 's\'il existe des arguments pour une listériose et si l\'amoxicilline ne peut pas être utilisée — avis infectiologique'].filter(Boolean).join(' ; '),
      duree: dBase,
      sources: [...src, srcLis, SPr('p. 23, §12.8.2.3', 'allergie grave = hypersensibilité immédiate anaphylactique ; sinon céfotaxime/ceftriaxone recommandés', 'definition'), SPr('Tableau 10 p. 24', 'Listeria → cotrimoxazole 10–20 mg/kg/j de triméthoprime en 4 prises', 'choix')],
      avec: [SMX],
      suffixe: ' + cotrimoxazole',
      statut: 'brouillon',
      ceftriaxoneDabord: pf,
      commentaire: 'Association composée par l\'application à partir de deux éléments de la SPILF 2018 (C3G si l\'allergie n\'est pas grave ; cotrimoxazole pour Listeria en cas d\'allergie) : elle n\'est pas écrite telle quelle — avis infectiologique. Cotrimoxazole : dose SPILF au-dessus du RCP.',
    });
  controleDosageC3G(ctx, f, true);
  // Allergie (Tableau 10) : vancomycine + rifampicine (± cotrimoxazole si arguments pour une listériose).
  const promouvable = !pf && (al.grave || al.c3g || (al.peni && lis.etat === 'oui'));
  const extrait = 'examen direct négatif → vancomycine + rifampicine (± cotrimoxazole si arguments pour listériose)';
  const condPf = pf && al.grave ? 'purpura fulminans et allergie grave : recours à décider avec l\'infectiologue (divergence DGS / SPILF ci-dessous)' : undefined;
  const base = { rangBase: pf ? ('conditionnelle' as Rang) : rang, promouvable, grave: al.grave, condition: [condition, condPf].filter(Boolean).join(' ; ') || undefined, duree: dBase, extrait };
  if (lis.etat === 'oui') {
    const ok = optionAllergie(f, { ...base, id: 'meningite-neg-allergie', libelle: 'Allergie aux bêta-lactamines : vancomycine + rifampicine + cotrimoxazole', items: [VANCO, RIFA, SMX] });
    // Cotrimoxazole contre-indiqué (ex. ClCr < 15 mL/min hors dialyse) : l'association n'est pas perdue en bloc.
    if (!ok) {
      optionAllergie(f, { ...base, id: 'meningite-neg-allergie-sans-cotrimoxazole', libelle: 'Allergie aux bêta-lactamines : vancomycine + rifampicine (cotrimoxazole écarté)', items: [VANCO, RIFA] });
      f.alerte('attention', 'Cotrimoxazole écarté (contre-indication, voir « Pourquoi cette proposition n\'est pas disponible ») : vancomycine + rifampicine seules ne couvrent pas Listeria — avis infectiologique immédiat.', [SPr('Tableau 10 p. 24', extrait, 'choix')]);
    }
  } else optionAllergie(f, { ...base, id: 'meningite-neg-allergie', libelle: 'Allergie aux bêta-lactamines : vancomycine + rifampicine', items: [VANCO, RIFA] });
  if (pf && al.grave) {
    f.option({
      id: 'meningite-pf-allergie-ciprofloxacine',
      libelle: 'Purpura fulminans, allergie grave aux bêta-lactamines : ciprofloxacine (recours DGS 2018)',
      type: 'probabiliste',
      rang: 'conditionnelle',
      condition: condPf,
      items: [CIPRO_IV],
      duree: dBase,
      statut: 'brouillon',
      sources: [S(DGS, 'p. 15, note 10', 'les fluoroquinolones (ciprofloxacine ou lévofloxacine) peuvent constituer un recours', 'choix'), SPr('Tableau 10 p. 24', 'méningocoque → ciprofloxacine « 800–1200 mg » (fréquence non précisée)', 'posologie')],
      commentaire: 'DGS 2018 : posologie non précisée (ciprofloxacine ou lévofloxacine) ; dose affichée : SPILF 2018, tableau 10 (méningocoque, allergie grave), fréquence non précisée. Même rang que vancomycine + rifampicine : aucune préférence établie.',
    });
    f.avis('Purpura fulminans et allergie grave aux bêta-lactamines : avis infectiologique immédiat pour le choix du recours (fluoroquinolone ou vancomycine + rifampicine).', true, [S(DGS, 'p. 15, note 10', 'les fluoroquinolones (ciprofloxacine ou lévofloxacine) peuvent constituer un recours', 'choix')]);
  }
}

/** Schémas selon l'examen direct (cocci ou bacille, Gram positif ou négatif). */
function examenDirect(ctx: ContexteDecision, f: Fiche, ed: 'cgp' | 'cgn' | 'bgp' | 'bgn', al: Allergies, pf: boolean) {
  const promouvable = !pf && (al.grave || al.c3g);
  const rangAl: Rang = pf ? 'conditionnelle' : 'premiere_ligne';
  if (ed === 'cgp') {
    f.situation('meningite-examen-direct-cgp', 'Méningite à cocci à Gram positif (pneumocoque probable)', 'couverte', 'C3G à forte dose (pneumocoque) ; pas de vancomycine systématique.');
    pairesC3G(f, { id: 'meningite-cgp', libelle: 'Cocci à Gram positif', fort: true, rang: 'premiere_ligne', duree: D_NON_DOC, ceftriaxoneDabord: pf, sources: [SPr('p. 21, §12.8.1.1 ; Tableau 8 p. 22', 'céfotaxime 300 mg/kg/j IV, en continu (dose de charge 50 mg/kg sur 1 h) ou ≥ 4 perfusions (75 mg/kg/6 h) ; ou ceftriaxone 100 mg/kg/j en 1 ou 2 perfusions', 'choix'), SRC_PAS_VANCO] });
    controleDosageC3G(ctx, f, true);
    optionAllergie(f, { id: 'meningite-cgp-allergie', libelle: 'Allergie aux bêta-lactamines : vancomycine + rifampicine', items: [VANCO, RIFA], rangBase: rangAl, promouvable, grave: al.grave, duree: D_NON_DOC, extrait: 'pneumocoque → vancomycine (charge 30 mg/kg sur 1 h puis 40–60 mg/kg/j, résiduelle 15–20 mg/L) + rifampicine (adulte 300 mg × 2/j) ou méropénème' });
    return;
  }
  if (ed === 'cgn') {
    f.situation('meningite-examen-direct-cgn', 'Méningite à cocci à Gram négatif (méningocoque probable)', 'couverte', 'C3G (méningocoque) ; infection invasive à méningocoque : déclaration obligatoire et prophylaxie des contacts.');
    pairesC3G(f, { id: 'meningite-cgn', libelle: 'Cocci à Gram négatif', fort: false, rang: 'premiere_ligne', duree: D_NON_DOC, ceftriaxoneDabord: true, commentaire: 'Ceftriaxone : dispense de la décontamination du portage du cas index (DGS 2018).', sources: [SPr('p. 21, §12.8.1.2', 'céfotaxime 200 mg/kg/j (50 mg/kg/6 h ou continu avec charge 50 mg/kg) ou ceftriaxone 75 mg/kg/j en 1 ou 2 perfusions', 'choix'), S(DGS, 'p. 2-3', 'usage exclusif des céphalosporines de 3ème génération (suppression de l\'amoxicilline)', 'choix'), S(DGS, 'p. 15', 'prophylaxie du portage pour le patient « s\'il n\'a pas été traité par ceftriaxone »', 'choix')] });
    optionAllergie(f, { id: 'meningite-cgn-allergie', libelle: 'Allergie aux bêta-lactamines : ciprofloxacine', items: [CIPRO_IV], rangBase: rangAl, promouvable, grave: al.grave, duree: D_NON_DOC, extrait: 'méningocoque → ciprofloxacine « 800–1200 mg » (fréquence non précisée) ou rifampicine', sansMeropeneme: true });
    f.alerte('info', 'Allergie et méningocoque : la SPILF cite aussi la rifampicine ; son RCP précise qu\'elle « n\'est pas un traitement de la méningite à méningocoque » (divergence : non proposée seule).', [S(DIA, 'dia 12', 'Ciprofloxacine OU rifampicine', 'choix'), S('RCP-rifampicine-orale', '§4.1', 'la rifampicine n\'est pas un traitement de la méningite à méningocoque', 'choix')]);
    return;
  }
  if (ed === 'bgp') {
    f.situation('meningite-examen-direct-bgp', 'Méningite à bacille à Gram positif (Listeria probable)', 'couverte', 'Amoxicilline + gentamicine (Listeria) ; dexaméthasone non recommandée en cas de listériose.');
    const src = [SPr('p. 21, §12.8.1.3', 'amoxicilline 200 mg/kg/j IV en 4 à 6 perfusions + gentamicine', 'choix')];
    f.option({ id: 'meningite-bgp', libelle: 'Bacille à Gram positif : amoxicilline 200 mg/kg/j + gentamicine 5 mg/kg/j', type: 'probabiliste', rang: 'premiere_ligne', items: [AMX, GENTA], duree: dureeListeria(ctx), sources: src, commentaire: 'Amoxicilline 200 mg/kg/j au-dessus du maximum du RCP (12 g/j) au-delà de 60 kg : écart signalé, statut brouillon.' });
    f.option({ id: 'meningite-bgp-allergie', libelle: 'Allergie aux pénicillines : cotrimoxazole', type: 'probabiliste', rang: al.peni && !pf ? 'alternative' : 'conditionnelle', condition: al.peni ? 'allergie aux pénicillines déclarée — avis infectiologique' : 'si allergie aux pénicillines — avis infectiologique', items: [SMX], duree: dureeListeria(ctx), statut: 'brouillon', sources: [SPr('Tableau 10 p. 24', 'Listeria → cotrimoxazole 10–20 mg/kg/j de triméthoprime en 4 prises', 'choix')], commentaire: 'Dose SPILF au-dessus du RCP (6 à 8 mg/kg/j de triméthoprime) : divergence non tranchée.' });
    return;
  }
  // Bacille à Gram négatif : H. influenzae ou E. coli ; méropénème si E. coli BLSE suspecté.
  const blse = suspicionBLSE(ctx);
  f.situation('meningite-examen-direct-bgn', `Méningite à bacille à Gram négatif${blse === 'ecoli' ? ' — E. coli BLSE suspecté' : ''}`, blse ? 'partielle' : 'couverte', 'C3G (H. influenzae, E. coli) ; méropénème et avis d\'expert si un E. coli BLSE est suspecté (colonisation ou prélèvement d\'un autre site).');
  const srcBgn = [SPr('p. 21-22, §12.8.1.4-5', 'céfotaxime 200 mg/kg/j ou ceftriaxone 75 mg/kg/j', 'choix')];
  if (blse === 'ecoli') {
    f.option({ id: 'meningite-bgn-meropeneme', libelle: 'BGN, E. coli BLSE suspecté : méropénème 40 mg/kg × 3/j', type: 'probabiliste', rang: 'premiere_ligne', items: [MERO], duree: D_NON_DOC, sources: [SRC_MERO] });
    f.avis('Méningite à BGN avec suspicion d\'E. coli BLSE : avis d\'expert.', true, [SRC_MERO]);
  } else if (blse === 'autre') alerteBlseAutre(f);
  pairesC3G(f, { id: 'meningite-bgn', libelle: 'Bacille à Gram négatif', fort: false, rang: blse === 'ecoli' ? 'conditionnelle' : 'premiere_ligne', condition: blse === 'ecoli' ? 'si la BLSE est écartée' : undefined, duree: D_NON_DOC, ceftriaxoneDabord: pf, sources: srcBgn });
  optionAllergie(f, { id: 'meningite-bgn-allergie', libelle: 'Allergie aux bêta-lactamines : ciprofloxacine (H. influenzae)', items: [CIPRO_IV], rangBase: rangAl, promouvable, grave: al.grave, duree: D_NON_DOC, extrait: 'H. influenzae → ciprofloxacine 800–1200 mg', sansMeropeneme: blse === 'ecoli' });
}

const SRC_MERO = SPr('p. 22, §12.8.1.5', 'Suspicion d\'E. coli BLSE (colonisation ou prélèvement d\'un autre site) : méropénème 40 mg/kg × 3/j en perfusion lente + avis d\'expert', 'choix');

function alerteBlseAutre(f: Fiche) {
  f.alerte('attention', 'Colonisation ou prélèvement à une bactérie BLSE autre qu\'E. coli : la SPILF 2018 ne prévoit le méropénème que pour une suspicion d\'E. coli BLSE — situation non tranchée par les sources : avis d\'expert.', [SRC_MERO]);
  f.avis('Méningite à BGN et BLSE autre qu\'E. coli (colonisation ou autre site) : avis d\'expert.', true, [SRC_MERO]);
}

/**
 * Suspicion de BLSE (SPILF 2018 §12.8.1.5 : « E. coli BLSE », colonisation ou prélèvement d'un autre site) :
 * « ecoli » si l'antécédent ou le prélèvement concerne E. coli, « autre » pour une autre bactérie BLSE.
 */
function suspicionBLSE(ctx: ContexteDecision): 'ecoli' | 'autre' | false {
  let autre = false;
  for (const a of ctx.dossier.patient.antecedentsMicro)
    if (a.resistance === 'BLSE') {
      if (/coli/i.test(a.organisme)) return 'ecoli';
      autre = true;
    }
  for (const x of ctx.dossier.prelevements) {
    const atb = lireAntibiogramme(x);
    if (x.organisme === 'escherichia_coli' && (atb.meca('BLSE') || pireC3G(atb.sir) === 'R')) return 'ecoli';
    if (atb.meca('BLSE')) autre = true;
  }
  return autre ? 'autre' : false;
}

/* ------------------------------------------------------------------ */
/* Germe documenté                                                     */
/* ------------------------------------------------------------------ */

function dureeListeria(ctx: ContexteDecision): DureeDecidee {
  const fav = q(ctx, 'meningite.evolution') === 'favorable';
  return {
    texte: `Amoxicilline 21 jours, 14 jours si évolution favorable (SPILF 2018 §14.1.3 ; tableau 11 : 14 à 21 jours ; diaporama : 21 jours) ; gentamicine les 5 premiers jours seulement.${fav ? ' Évolution favorable déclarée : 14 jours possibles.' : ''}`,
    pointDeDepart: 'non précisé par les sources (début du traitement présumé)',
    dureePrevueJours: fav ? 14 : 21,
    sources: [SPr('p. 28-29, §14.1.3', 'amoxicilline 200 mg/kg/j 21 jours (14 si évolution favorable) + gentamicine 5 mg/kg/j en une perfusion de 30 min les 5 premiers jours', 'duree'), SPr('Tableau 11 p. 28', 'Listeria 14–21 j', 'duree'), S(DIA, 'dia 17', 'Listéria 21 jours', 'duree')],
  };
}

/** Isolats du germe documenté dans les hémocultures ou les prélèvements méningés. */
function isolatsDuGerme(ctx: ContexteDecision, germe: Germe) {
  const o = ORGANISME_DU_GERME[germe];
  return o ? prelevementsMeningite(ctx.dossier).filter((x) => x.organisme === o) : [];
}

/** CMI (mg/L) d'un pneumocoque : saisie dans l'antibiogramme d'une hémoculture ou du LCS, sinon réponse à la question. */
function cmiPneumo(ctx: ContexteDecision, dcis: string[], idQ: string): 'le' | 'gt' | undefined {
  const valeurs = isolatsDuGerme(ctx, 'pneumocoque').flatMap((x) => (x.antibiogramme ?? []).filter((r) => dcis.includes(r.dci) && r.cmi !== undefined).map((r) => r.cmi!));
  if (valeurs.length) return Math.max(...valeurs) > 0.5 ? 'gt' : 'le';
  const r = q(ctx, idQ);
  return r === 'le_0_5' ? 'le' : r === 'gt_0_5' ? 'gt' : undefined;
}

/**
 * Antibiogramme du germe documenté : une molécule rendue R est écartée (raison tracée). Pneumocoque : C3G et
 * amoxicilline relèvent de la CMI (seuil 0,5 mg/L), la catégorie S/I/R n'est pas convertie (seuils méningés non lus).
 */
function appliquerAntibiogramme(ctx: ContexteDecision, f: Fiche, germe: Germe) {
  const lectures = isolatsDuGerme(ctx, germe).map((x) => lireAntibiogramme(x));
  if (!lectures.length) return;
  const parCmi = germe === 'pneumocoque' ? ['cefotaxime', 'ceftriaxone', 'amoxicilline'] : [];
  const resistant = (dci: string) => !parCmi.includes(dci) && lectures.some((l) => l.sir(dci) === 'R');
  const gardees: OptionTherapeutique[] = [];
  let retiree = false;
  for (const o of f.c.options) {
    const r = o.type === 'documente' && !o.id.startsWith('meningite-cas-index') ? o.prescriptions.find((x) => resistant(x.moleculeId)) : undefined;
    if (r) {
      f.ecarter(o.libelle, 'resistance', `${r.dci} rendu résistant (R) sur l'antibiogramme du germe documenté`);
      retiree = true;
    } else gardees.push(o);
  }
  f.c.options.splice(0, f.c.options.length, ...gardees);
  if (retiree && !gardees.some((o) => o.rang === 'premiere_ligne' && !o.id.startsWith('meningite-cas-index'))) {
    f.alerte('attention', 'Antibiogramme : les options de 1re ligne sont résistantes (voir « Pourquoi cette proposition n\'est pas disponible ») — avis infectiologique immédiat.');
    f.avis(`Méningite à ${LIB_GERME[germe]} : schéma de 1re ligne résistant sur l'antibiogramme — avis infectiologique.`, true, []);
    f.plafond('partielle');
  }
}

function documentee(ctx: ContexteDecision, f: Fiche, germe: Germe) {
  const evol = q(ctx, 'meningite.evolution');
  const al = allergies(ctx);
  const p = ctx.dossier.patient;
  const fav = evol === 'favorable';
  const defav = evol === 'defavorable';
  const dep = 'non précisé par les sources (début du traitement présumé)';
  f.urgence('elevee');
  indication(f, 'traiter', `Méningite à ${LIB_GERME[germe]} : traitement adapté au germe`, 'Méningite bactérienne documentée : adaptation au germe, à la CMI et à l\'évolution (SPILF 2018).', [], [SPr('p. 27, §14.1 ; Tableau 11 p. 28', 'adaptation à la CMI et à l\'évolution à 48–72 h', 'choix')]);
  if (evol === 'inconnu') manqueQ(f, 'meningite.evolution', 'évolution à 48-72 h', 'durée du traitement, PL de contrôle et imagerie (SPILF 2018)', 'bloque_duree');
  if (al.grave)
    f.alerte('attention', 'Allergie documentée (SPILF 2018, tableau 11) : choc anaphylactique à la pénicilline → discuter une C3G sous surveillance en réanimation, ou vancomycine + rifampicine ; choc anaphylactique à une C3G → C3G contre-indiquées sauf avis d\'expert.', [SPr('note du Tableau 11', 'choc anaphylactique à la pénicilline → discuter C3G sous surveillance en réanimation ou vancomycine + rifampicine ; choc anaphylactique à une C3G → C3G contre-indiquées sauf avis d\'expert', 'choix')]);

  // Dexaméthasone après identification (jamais chez l'immunodéprimé).
  if (germe === 'pneumocoque' || germe === 'h_influenzae') {
    if (p.immunodepression === 'oui') f.geste('Pas de dexaméthasone : immunodépression (SPILF 2018) ; si elle a été débutée, l\'arrêter.', SRC_DEXA_NON);
    else f.geste(`Dexaméthasone (si débutée) : la poursuivre 4 jours au total.${p.immunodepression === 'inconnu' ? ' Sauf immunodépression (à préciser).' : ''}`, [SRC_DEXA_SUITE, ...(p.immunodepression === 'inconnu' ? SRC_DEXA_NON : [])]);
    if (p.immunodepression === 'inconnu') f.manque('immunodépression', 'la dexaméthasone n\'est pas recommandée chez l\'immunodéprimé', 'affine', 'patient.immunodepression');
  } else if (germe === 'meningocoque') f.geste(`Dexaméthasone (si débutée) : poursuite au choix du clinicien (méningocoque)${p.immunodepression === 'oui' ? ' — immunodépression : non recommandée' : ''}.`, [SRC_DEXA_SUITE, ...(p.immunodepression === 'oui' ? SRC_DEXA_NON : [])]);
  else f.geste(`Dexaméthasone (si débutée) : l'arrêter (${LIB_GERME[germe]})${germe === 'listeria' ? ' — non recommandée en cas de listériose' : ''}.`, germe === 'listeria' ? [SRC_DEXA_SUITE, ...SRC_DEXA_NON] : [SRC_DEXA_SUITE]);

  // PL de contrôle (Tableau 12) et imagerie (Tableau 13).
  const srcPL = [SPr('p. 29 §14.2 ; Tableau 12 p. 30', 'si évolution défavorable, systématique après imagerie, avec dosage de la C3G', 'controle_micro'), S(DIA, 'dia 18', 'PL de contrôle non indiquée si évolution favorable', 'controle_micro')];
  const cmiC3G = germe === 'pneumocoque' ? cmiPneumo(ctx, ['cefotaxime', 'ceftriaxone'], 'meningite.cmi_c3g') : undefined;
  const plSystematique = !['pneumocoque', 'meningocoque', 'h_influenzae', 'listeria'].includes(germe);
  const plIndiquee = defav || plSystematique || cmiC3G === 'gt';
  f.controle({
    id: 'ctl-meningite-pl-controle',
    type: 'prelevement',
    categorie: plIndiquee ? 'indique' : germe === 'pneumocoque' && cmiC3G === undefined ? 'conditionnel' : 'non_systematique',
    quoi: defav ? 'PL de contrôle après imagerie, avec dosage de la C3G' : 'PL de contrôle',
    quand: { ancre: 'debut_traitement', offsetHeures: 48, texte: 'À 48-72 h de traitement' },
    pourquoi: defav ? 'Évolution défavorable.' : plSystematique ? `Germe autre que pneumocoque, méningocoque, H. influenzae ou Listeria (${LIB_GERME[germe]}) : systématique.` : cmiC3G === 'gt' ? 'Pneumocoque de CMI C3G > 0,5 mg/L : avec dosages.' : 'Non indiquée si l\'évolution est favorable (sauf pneumocoque de CMI C3G > 0,5 mg/L).',
    sources: srcPL,
  });
  const orl = germe === 'pneumocoque' && q(ctx, 'meningite.orl') === 'oui';
  const imagSyst = !['pneumocoque', 'meningocoque'].includes(germe) || orl;
  f.controle({
    id: 'ctl-meningite-imagerie',
    type: 'imagerie',
    categorie: imagSyst || defav ? 'indique' : 'conditionnel',
    quoi: defav ? 'Imagerie cérébrale (IRM)' : 'Imagerie cérébrale au cours du traitement',
    quand: { ancre: 'debut_traitement', offsetHeures: 48, texte: imagSyst ? 'Pendant le traitement (délai non précisé)' : 'Si fièvre > 38,5 °C, troubles de conscience ou céphalées persistant après 48-72 h, ou signes neurologiques nouveaux' },
    pourquoi: defav ? 'Évolution défavorable à 48-72 h.' : imagSyst ? (orl ? 'Pneumocoque avec otite, sinusite ou mastoïdite.' : 'Bactérie autre que pneumocoque ou méningocoque.') : 'Imagerie occasionnelle seulement.',
    sources: [SPr('p. 29-30 ; Tableau 13', 'systématique si bactérie autre que pneumocoque ou méningocoque, pneumocoque avec otite/sinusite/mastoïdite ; occasionnelle si fièvre > 38,5 °C, troubles de conscience ou céphalées persistant après 48–72 h, signes neurologiques nouveaux', 'imagerie')],
  });
  if (orl) f.avis('Foyer ORL : avis ORL (paracentèse si otite moyenne aiguë) ; en cas de brèche : pas d\'antibioprophylaxie ni de prolongation de l\'antibiothérapie avant fermeture, vaccination antipneumococcique.', false, [SPr('p. 31, §14.4', 'avis ORL ; paracentèse si OMA ; pas d\'antibioprophylaxie ni de prolongation de l\'antibiothérapie avant fermeture d\'une brèche ; vaccination antipneumococcique si brèche', 'geste')]);
  f.reeval('Avant la sortie (ou au plus tard 15 jours après la fin du traitement) : examen neurologique et test auditif ; suivi pendant 12 mois ; rechercher une pathologie prédisposante (diabète, éthylisme, cancer, cirrhose, hémopathie, VIH si facteur de risque).', [DIAr('dia 22-23', 'examen neurologique et test auditif avant la sortie ou au plus tard 15 jours après la fin du traitement ; suivi 12 mois', 'autre')]);

  switch (germe) {
    case 'pneumocoque': {
      const cmiAmox = cmiPneumo(ctx, ['amoxicilline'], 'meningite.cmi_amox');
      if (cmiC3G === undefined) manqueQ(f, 'meningite.cmi_c3g', 'CMI de la C3G (pneumocoque)', 'dose de C3G, PL de contrôle et durée (SPILF 2018, tableau 11)', 'bloque_dose');
      if (cmiC3G === 'le' && cmiAmox === undefined) manqueQ(f, 'meningite.cmi_amox', 'CMI de l\'amoxicilline (pneumocoque)', 'amoxicilline de préférence si CMI ≤ 0,5 mg/L (SPILF 2018, tableau 11)', 'affine');
      // Catégorie I/R sans CMI : la SPILF raisonne en CMI ; la catégorisation n'est pas convertie.
      const lectures = isolatsDuGerme(ctx, 'pneumocoque').map((x) => lireAntibiogramme(x));
      const c3gNonS = lectures.some((l) => ['cefotaxime', 'ceftriaxone'].some((d) => l.sir(d) === 'R' || l.sir(d) === 'I'));
      if (cmiC3G === undefined && c3gNonS) {
        f.alerte('attention', 'Pneumocoque : C3G catégorisée I ou R sans CMI saisie. La SPILF 2018 raisonne sur la CMI (seuil 0,5 mg/L) ; l\'application ne convertit pas la catégorie (seuils méningés non lus) : demander la CMI ; C3G à la dose la plus forte en attendant ; avis infectiologue et microbiologiste.');
        f.avis('Pneumocoque de sensibilité diminuée aux C3G (catégorie I ou R) : avis infectiologue et microbiologiste.', true, []);
      }
      const duree: DureeDecidee = {
        texte: `10 à 14 jours : 10 jours si évolution favorable en 48 h et CMI C3G ≤ 0,5 mg/L, sinon 14 jours.${fav && cmiC3G === 'le' ? ' Conditions réunies : 10 jours.' : ''}`,
        pointDeDepart: dep,
        dureePrevueJours: fav && cmiC3G === 'le' ? 10 : 14,
        sources: [SPr('Tableau 11 p. 28', 'pneumocoque 10–14 j (10 j si évolution favorable en 48 h et CMI C3G ≤ 0,5)', 'duree')],
      };
      const src11 = (extrait: string) => [SPr('p. 27, §14.1 ; Tableau 11 p. 28', extrait, 'choix')];
      const EXT_LE = 'CMI C3G ≤ 0,5 mg/L et CMI amoxicilline ≤ 0,5 → amoxicilline 200 mg/kg/j de préférence (ou C3G maintenue)';
      const EXT_AMOX_GT = 'CMI amoxicilline > 0,5 → céfotaxime 200 mg/kg/j ou ceftriaxone 75 mg/kg/j';
      f.situation('meningite-pneumocoque', 'Méningite à pneumocoque', cmiC3G === undefined ? 'partielle' : 'couverte', 'Adaptation à la CMI de la C3G et de l\'amoxicilline (seuil 0,5 mg/L).');
      if (cmiC3G === 'le' && cmiAmox === 'le') {
        f.option({ id: 'meningite-pneumo-amox', libelle: 'Pneumocoque (CMI C3G et amoxicilline ≤ 0,5 mg/L) : amoxicilline 200 mg/kg/j', type: 'documente', rang: 'premiere_ligne', items: [AMX], duree, sources: src11(EXT_LE), commentaire: 'Amoxicilline 200 mg/kg/j au-dessus du maximum du RCP (12 g/j) au-delà de 60 kg : écart signalé, statut brouillon.' });
        f.option({ id: 'meningite-pneumo-c3g-maintenue', libelle: 'Pneumocoque (CMI ≤ 0,5 mg/L) : C3G maintenue', type: 'documente', rang: 'alternative', items: [CTX300], duree, statut: 'brouillon', sources: src11(EXT_LE), commentaire: 'Le tableau 11 ne précise pas la dose de la C3G maintenue : la dose probabiliste (300 mg/kg/j) est reprise, à valider.' });
        alerteRenaleC3G(f);
      } else if (cmiC3G === 'le' && cmiAmox === 'gt') {
        pairesC3G(f, { id: 'meningite-pneumo-c3g200', libelle: 'Pneumocoque (CMI C3G ≤ 0,5 mg/L, CMI amoxicilline > 0,5 mg/L)', fort: false, rang: 'premiere_ligne', duree, type: 'documente', sources: src11(EXT_AMOX_GT) });
      } else if (cmiC3G === 'le') {
        // CMI de l'amoxicilline inconnue : la C3G en cours est maintenue (dose probabiliste) en attendant ; aucune baisse non sourcée.
        pairesC3G(f, { id: 'meningite-pneumo-c3g-maintenue', libelle: 'Pneumocoque (CMI C3G ≤ 0,5 mg/L, CMI amoxicilline en attente) : C3G maintenue', fort: true, rang: 'premiere_ligne', duree, type: 'documente', statut: 'brouillon', sources: src11(EXT_LE), commentaire: 'Dans l\'attente de la CMI de l\'amoxicilline, la C3G probabiliste est maintenue (le tableau 11 n\'en précise pas la dose : 300 mg/kg/j repris, à valider). CMI amoxicilline > 0,5 mg/L : céfotaxime 200 / ceftriaxone 75 mg/kg/j ; ≤ 0,5 mg/L : amoxicilline de préférence.' });
        controleDosageC3G(ctx, f, true);
        pairesC3G(f, { id: 'meningite-pneumo-c3g200', libelle: 'Pneumocoque (CMI C3G ≤ 0,5 mg/L)', fort: false, rang: 'conditionnelle', condition: 'si la CMI de l\'amoxicilline est > 0,5 mg/L', duree, type: 'documente', sources: src11(EXT_AMOX_GT) });
        f.option({ id: 'meningite-pneumo-amox', libelle: 'Pneumocoque : amoxicilline 200 mg/kg/j', type: 'documente', rang: 'conditionnelle', condition: 'si CMI de l\'amoxicilline ≤ 0,5 mg/L (à préférer)', items: [AMX], duree, sources: src11(EXT_LE) });
      } else {
        pairesC3G(f, { id: 'meningite-pneumo-c3g300', libelle: cmiC3G === 'gt' ? 'Pneumocoque (CMI C3G > 0,5 mg/L)' : c3gNonS ? 'Pneumocoque (C3G I ou R, CMI non saisie)' : 'Pneumocoque (CMI en attente)', fort: true, rang: 'premiere_ligne', duree, type: 'documente', sources: src11('CMI C3G > 0,5 → céfotaxime 300 / ceftriaxone 100 mg/kg/j, PL de contrôle avec dosages, avis infectiologue et microbiologiste') });
        controleDosageC3G(ctx, f, true);
        if (cmiC3G === 'gt') f.avis('Pneumocoque de CMI C3G > 0,5 mg/L : avis infectiologue et microbiologiste.', false, src11('CMI C3G > 0,5 → céfotaxime 300 / ceftriaxone 100 mg/kg/j, PL de contrôle avec dosages, avis infectiologue et microbiologiste'));
      }
      optionAllergie(f, { id: 'meningite-pneumo-allergie', libelle: 'Allergie aux bêta-lactamines : vancomycine + rifampicine', items: [VANCO, RIFA], rangBase: 'premiere_ligne', promouvable: al.grave || al.c3g || (al.peni && cmiC3G === 'le' && cmiAmox === 'le'), grave: al.grave, duree, type: 'documente', extrait: 'pneumocoque → vancomycine (charge 30 mg/kg sur 1 h puis 40–60 mg/kg/j, résiduelle 15–20 mg/L) + rifampicine (adulte 300 mg × 2/j) ou méropénème' });
      if (defav) f.avis('Évolution défavorable à 48-72 h : imagerie (IRM), PL de contrôle, optimisation (dose, C3G de plus faible CMI, ajout de rifampicine 10 mg/kg/12 h ou de vancomycine) avec l\'infectiologue.', true, src11('Évolution défavorable à 48–72 h : imagerie (IRM), PL de contrôle, optimisation (dose, C3G à plus faible CMI, ajout rifampicine 10 mg/kg/12 h ou vancomycine)'));
      break;
    }
    case 'meningocoque': {
      // Durée fixée à l'évaluation de 48 h : 4 jours si favorable, sinon 7 (diaporama) ; rien d'imposé avant.
      const duree: DureeDecidee = {
        texte: `${fav ? '4 jours (évolution favorable dès 48 h)' : defav ? '7 jours (évolution non favorable à 48 h)' : '4 jours si l\'évolution est favorable dès 48 h, sinon 7 jours : durée à fixer à l\'évaluation de 48 h'}. Sources divergentes : SPILF 2018 texte et diaporama 4 à 7 jours ; tableau 11 : 5 à 7 jours (plutôt 5) ; DGS 2018 : au-delà de 4 jours, pas de justification dans les formes classiques.`,
        pointDeDepart: dep,
        dureePrevueJours: fav ? 4 : defav ? 7 : undefined,
        sources: [SPr('p. 28, §14.1.2', 'durée 4 à 7 jours (4 jours si apyrexie en 48 h)', 'duree'), S(DIA, 'dia 17', 'Méningocoque 4 jours si évolution favorable dès 48h, sinon 7 jours', 'duree'), SPr('Tableau 11 p. 28', 'méningocoque 5–7 j dans le tableau (note e : plutôt 5 j)', 'duree'), S(DGS, 'p. 15', 'Dans les formes classiques, la poursuite du traitement au-delà de 4 jours n\'a pas de justification', 'duree')],
      };
      f.situation('meningite-meningocoque', 'Méningite à méningocoque', 'couverte', 'C3G ; déclaration obligatoire ; prophylaxie des sujets contacts.');
      pairesC3G(f, { id: 'meningite-meningo', libelle: 'Méningocoque', fort: false, rang: 'premiere_ligne', duree, type: 'documente', ceftriaxoneDabord: true, commentaire: 'Ceftriaxone : dispense de la décontamination du portage du cas index (DGS 2018).', sources: [SPr('p. 28, §14.1.2', 'C3G ≤ 200 mg/kg/j (céfotaxime) ou 75 mg/kg/j (ceftriaxone)', 'choix'), S(DGS, 'p. 15', 'prophylaxie du portage pour le patient « s\'il n\'a pas été traité par ceftriaxone »', 'choix')] });
      f.reeval('Amoxicilline possible si CMI ≤ 0,125 mg/L (SPILF 2018 ; dose non précisée pour le méningocoque).', [SPr('p. 28, §14.1.2', 'amoxicilline possible si CMI ≤ 0,125 mg/L', 'choix')]);
      optionAllergie(f, { id: 'meningite-meningo-allergie', libelle: 'Allergie aux bêta-lactamines : ciprofloxacine', items: [CIPRO_IV], rangBase: 'premiere_ligne', promouvable: al.grave || al.c3g, grave: al.grave, duree, type: 'documente', extrait: 'méningocoque → ciprofloxacine « 800–1200 mg » (fréquence non précisée) ou rifampicine', sansMeropeneme: true });
      iim(f, 'méningite à méningocoque', true);
      break;
    }
    case 'listeria': {
      f.situation('meningite-listeria', 'Méningite à Listeria monocytogenes', 'couverte', 'Amoxicilline + gentamicine (5 premiers jours) ; pas de dexaméthasone ; déclaration obligatoire.');
      f.option({ id: 'meningite-listeria-amox-genta', libelle: 'Listeria : amoxicilline 200 mg/kg/j + gentamicine 5 mg/kg/j (5 premiers jours)', type: 'documente', rang: 'premiere_ligne', items: [AMX, GENTA], duree: dureeListeria(ctx), sources: [SPr('p. 28-29, §14.1.3 ; Tableau 11', 'amoxicilline 200 mg/kg/j 21 jours (14 si évolution favorable) + gentamicine 5 mg/kg/j en une perfusion de 30 min les 5 premiers jours ; alternative cotrimoxazole', 'choix')], commentaire: 'Amoxicilline 200 mg/kg/j au-dessus du maximum du RCP (12 g/j) au-delà de 60 kg : écart signalé, statut brouillon.' });
      f.option({ id: 'meningite-listeria-cotrimoxazole', libelle: 'Listeria, alternative (allergie) : cotrimoxazole', type: 'documente', rang: al.peni ? 'alternative' : 'conditionnelle', condition: al.peni ? 'allergie aux pénicillines déclarée — avis infectiologique' : 'si l\'amoxicilline ne peut pas être utilisée (allergie) — avis infectiologique', items: [SMX], duree: dureeListeria(ctx), statut: 'brouillon', sources: [SPr('p. 28-29, §14.1.3', 'alternative cotrimoxazole', 'choix'), SPr('Tableau 10 p. 24', 'Listeria → cotrimoxazole 10–20 mg/kg/j de triméthoprime en 4 prises', 'choix')], commentaire: 'Dose SPILF au-dessus du RCP (6 à 8 mg/kg/j de triméthoprime) : divergence non tranchée.' });
      f.alerte('attention', 'Méningite à Listeria monocytogenes : déclaration obligatoire.', [S(SP, 'p. 12, §12.3.1', 'the mandatory report of meningococcal or Listeria monocytogenes meningitis', 'definition')]);
      break;
    }
    case 'h_influenzae':
    case 'e_coli': {
      const hi = germe === 'h_influenzae';
      const duree: DureeDecidee = hi
        ? { texte: '7 jours', pointDeDepart: dep, dureePrevueJours: 7, sources: [S(DIA, 'dia 17', 'Haemophilus influenzae 7 jours', 'duree')] }
        : { texte: '21 jours', pointDeDepart: dep, dureePrevueJours: 21, sources: [S(DIA, 'dia 17', 'E. coli 21 jours', 'duree'), SPr('Tableau 11 p. 28', 'E. coli 21 j', 'duree')] };
      const blse = hi ? false : suspicionBLSE(ctx);
      f.situation(`meningite-${germe}`, `Méningite à ${LIB_GERME[germe]}${blse === 'ecoli' ? ' — BLSE suspectée ou documentée' : ''}`, blse ? 'partielle' : 'couverte', hi ? 'C3G, 7 jours.' : 'C3G, 21 jours ; méropénème et avis d\'expert si BLSE.');
      const src = [SPr(hi ? 'p. 21-22, §12.8.1.4' : 'p. 22, §12.8.1.5', 'céfotaxime 200 mg/kg/j ou ceftriaxone 75 mg/kg/j', 'choix')];
      if (blse === 'ecoli') {
        f.option({ id: 'meningite-ecoli-meropeneme', libelle: 'E. coli, BLSE : méropénème 40 mg/kg × 3/j', type: 'documente', rang: 'premiere_ligne', items: [MERO], duree, sources: [SRC_MERO] });
        f.avis('Méningite à E. coli BLSE : avis d\'expert.', true, [SRC_MERO]);
      } else if (blse === 'autre') alerteBlseAutre(f);
      pairesC3G(f, { id: `meningite-${germe}`, libelle: LIB_GERME[germe], fort: false, rang: blse === 'ecoli' ? 'conditionnelle' : 'premiere_ligne', condition: blse === 'ecoli' ? 'si la souche est sensible aux C3G (BLSE écartée)' : undefined, duree, type: 'documente', sources: src });
      if (hi) optionAllergie(f, { id: 'meningite-hi-allergie', libelle: 'Allergie aux bêta-lactamines : ciprofloxacine', items: [CIPRO_IV], rangBase: 'premiere_ligne', promouvable: al.grave || al.c3g, grave: al.grave, duree, type: 'documente', extrait: 'H. influenzae → ciprofloxacine 800–1200 mg', sansMeropeneme: true });
      else if (al.grave || al.c3g) f.avis('Méningite à E. coli et allergie aux bêta-lactamines : pas de schéma dans le tableau 10 de la SPILF — avis infectiologique.', true, [SPr('p. 23, §12.8.2.3', 'avis infectiologique ; surveillance continue les 24 premières heures', 'choix')]);
      break;
    }
    case 's_agalactiae': {
      f.situation('meningite-s-agalactiae', 'Méningite à Streptococcus agalactiae', 'couverte', 'Amoxicilline 200 mg/kg/j, 14 à 21 jours.');
      f.option({ id: 'meningite-sagalactiae-amox', libelle: 'S. agalactiae : amoxicilline 200 mg/kg/j', type: 'documente', rang: 'premiere_ligne', items: [AMX], duree: { texte: '14 à 21 jours', pointDeDepart: dep, sources: [SPr('Tableau 11 p. 28', 'S. agalactiae 14–21 j (amoxicilline 200 mg/kg/j)', 'duree')] }, sources: [SPr('Tableau 11 p. 28', 'S. agalactiae 14–21 j (amoxicilline 200 mg/kg/j)', 'choix')], commentaire: 'Amoxicilline 200 mg/kg/j au-dessus du maximum du RCP (12 g/j) au-delà de 60 kg : écart signalé, statut brouillon.' });
      if (al.peni) f.avis('S. agalactiae et allergie aux pénicillines : pas d\'alternative dans les sources lues — avis infectiologique.', true, []);
      break;
    }
    default: {
      f.situation('meningite-autre-germe', 'Méningite à un germe non modélisé', 'non_couverte', 'Germe hors des schémas de la SPILF 2018 modélisés : avis infectiologique.');
      f.avis('Méningite à un germe non modélisé : avis infectiologique pour le choix et la durée.', true, []);
      f.absence('Méningite à un germe autre que pneumocoque, méningocoque, Listeria, H. influenzae, E. coli ou S. agalactiae', 'Les sources lues (SPILF 2018, tableaux 8 et 11) ne couvrent que ces germes.', ['Avis infectiologique', 'PL de contrôle à 48-72 h et imagerie (systématiques pour ces germes)'], [S(SP, 'Tableau 11 p. 28', undefined, 'choix')]);
    }
  }
  appliquerAntibiogramme(ctx, f, germe);
}

export const REGLES_MENINGITES = [R_MENINGITE];
