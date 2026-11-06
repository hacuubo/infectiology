/**
 * Méningites bactériennes aiguës communautaires de l'adulte : urgence (antibiotique dans l'heure, antibiotique
 * avant la PL, purpura fulminans), imagerie et contre-indications de la PL, probabiliste selon l'examen direct du
 * LCS, allergie, dexaméthasone, adaptation à la CMI et durées par germe, PL de contrôle, déclaration obligatoire et
 * prophylaxie des sujets contacts d'un méningocoque ; méningite associée aux soins : avis spécialisé.
 * Sources : SPILF 2018 (texte long, diaporama, Info-antibio 90 ; « en cours de révision »), instruction DGS 2018,
 * DGS-Urgent 2025_06 (relayé), IDSA 2017 (recoupement), RCP — docs/sources/recherche-meningites.md.
 */
import type { Regle } from '../../engine/decider';
import type { ContexteDecision } from '../../engine/contexte';
import type { DonneeManquante, OptionTherapeutique, SourceRef } from '../types';
import { estimation } from '../../calc/renal';
import { reponseDetail } from '../syndromes/questions';
import { GERME_DE_PRELEVEMENT, germeMeningite } from '../syndromes/meningites';
import { Fiche, S, adulte, lireAntibiogramme, pireC3G, type DureeDecidee, type ItemPrescription } from './outils';

const SP = 'SPILF-2018-meningites';
const DIA = 'SPILF-2018-meningites-diapo';
const DGS = 'DGS-2018-IIM';

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

/* ------------------------------------------------------------------ */
/* Sources réutilisées                                                 */
/* ------------------------------------------------------------------ */

const SRC_DELAI = [
  S(SP, 'p. 11, §12.1', 'antibiothérapie (et dexaméthasone si indiquée) idéalement dans l\'heure suivant l\'admission, quel que soit le délai présumé depuis le début', 'choix'),
  S(DIA, 'dia 8', 'Au plus tard dans les 3 heures', 'choix'),
];
const SRC_AVANT_PL = S(SP, 'p. 11, §12.2', 'trois situations, « but after blood culture » : purpura fulminans ; admission hospitalière impossible dans les 90 minutes ; contre-indication à une PL immédiate', 'choix');
const SRC_ATTENDRE = S(SP, 'p. 21, §12.8', 'antibiothérapie dès que le LCS est trouble ; en attendant le Gram, schéma « examen direct négatif »', 'choix');
const SRC_C3G_EGAL = 'Céfotaxime et ceftriaxone sont cités à égalité par la SPILF 2018 ; le rang 1 du céfotaxime est un choix de l\'application (sa dose est dans le RCP, celle de la ceftriaxone le dépasse).';
const SRC_PAS_VANCO = S(SP, 'p. 21, §12.7.5', 'à dose optimale de C3G, l\'ajout systématique de vancomycine n\'est pas justifié chez l\'adulte et l\'enfant', 'choix');

const D_NON_DOC: DureeDecidee = {
  texte: 'Selon le germe documenté (pneumocoque 10 à 14 j, méningocoque 4 à 7 j, Listeria 21 j, H. influenzae 7 j, E. coli 21 j) ; méningite non documentée d\'évolution favorable : 14 jours.',
  pointDeDepart: 'non précisé par les sources (début du traitement présumé)',
  sources: [S(SP, 'Tableau 11 p. 28 ; §14.1.5 p. 29', 'non documentée d\'évolution favorable : 14 j', 'duree'), S(DIA, 'dia 17', 'poursuite de l\'antibiothérapie jusqu\'au 14ème jour', 'duree')],
};

/* ------------------------------------------------------------------ */
/* Lecture du dossier                                                  */
/* ------------------------------------------------------------------ */

function q(ctx: ContexteDecision, id: string): string {
  return reponseDetail(ctx.dossier, id);
}

/** Donnée manquante rattachée à la question du foyer (bouton « Compléter »). */
function manqueQ(f: Fiche, id: string, champ: string, pourquoi: string, impact: DonneeManquante['impact']) {
  f.c.donneesManquantes.push({ champ, pourquoi, impact, cible: `details.${id}` });
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

/** Contre-indication non neurologique de la PL : question du foyer, ou anticoagulant déclaré (AVK, AOD). */
function contreIndicationPL(ctx: ContexteDecision): { etat: string; anticoagulant: boolean } {
  const t = ctx.dossier.patient.traitementsAssocies;
  const anticoagulant = t.includes('avk') || t.includes('aod');
  const r = q(ctx, 'meningite.ci_pl');
  return { etat: anticoagulant ? 'oui' : r, anticoagulant };
}

function allergies(ctx: ContexteDecision) {
  const a = ctx.allergie.famillesAEviter;
  return { grave: a.has('penicilline') && a.has('cephalosporine'), peni: a.has('penicilline') };
}

/* ------------------------------------------------------------------ */
/* Briques communes                                                    */
/* ------------------------------------------------------------------ */

function alerteRenaleC3G(f: Fiche) {
  f.alerte(
    'attention',
    'Insuffisance rénale et C3G méningées : la SPILF 2018 garde la pleine dose les 24 premières heures, puis réduit le céfotaxime de 25 % (DFG 30-60), 50 % (15-30) ou 75 % (< 15) et la ceftriaxone de 50 % en une injection si ClCr < 30 mL/min (pas d\'adaptation sous hémofiltration continue) ; le RCP du céfotaxime ne réduit de moitié qu\'en dessous de 10 mL/min. Divergence non tranchée : le palier affiché sous chaque traitement est celui du RCP. Doser plasma et LCS.',
    [
      S(SP, 'Tableau 8 p. 22 ; §12.8.2.4 p. 23', 'céfotaxime — même dose les 24 premières heures, puis réduction de 25 % (DFG 30–60), 50 % (DFG 15–30), 75 % (DFG < 15) ; pas d\'adaptation sous hémofiltration continue', 'adaptation_renale'),
      S(SP, 'Tableau 8 p. 22', 'Ceftriaxone — si ClCr < 30 : même dose 24 h (en 2 injections) puis −50 % en 1 injection', 'adaptation_renale'),
      S(DIA, 'dia 11', 'pas d\'adaptation les 24 premières heures quel que soit le DFG', 'adaptation_renale'),
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
    sources: [S(SP, 'p. 21', 'Dosage résiduel plasmatique à 48 h si dose > 10 g/j, âge > 70 ans ou ClCr < 30 mL/min', 'surveillance')],
  });
}

/** Paire céfotaxime / ceftriaxone (rang 1 céfotaxime, choix de l'application). */
function pairesC3G(
  f: Fiche,
  o: { id: string; libelle: string; fort: boolean; rang: Rang; condition?: string; duree: DureeDecidee; sources: SourceRef[]; avec?: ItemPrescription[]; type?: 'probabiliste' | 'documente'; commentaire?: string },
) {
  const avec = o.avec ?? [];
  const type = o.type ?? 'probabiliste';
  const suffixe = avec.length ? ' + amoxicilline + gentamicine' : '';
  const mg = o.fort ? ['300', '100'] : ['200', '75'];
  f.option({ id: `${o.id}-cefotaxime`, libelle: `${o.libelle} : céfotaxime ${mg[0]} mg/kg/j${suffixe}`, type, rang: o.rang, condition: o.condition, items: [o.fort ? CTX300 : CTX200, ...avec], duree: o.duree, sources: o.sources, commentaire: [SRC_C3G_EGAL, o.commentaire].filter(Boolean).join(' ') });
  f.option({
    id: `${o.id}-ceftriaxone`,
    libelle: `${o.libelle} : ceftriaxone ${mg[1]} mg/kg/j${suffixe}`,
    type,
    rang: o.rang === 'premiere_ligne' ? 'alternative' : o.rang,
    condition: o.condition,
    items: [o.fort ? CRO100 : CRO75, ...avec],
    duree: o.duree,
    sources: o.sources,
    commentaire: `Dose SPILF au-dessus du RCP (méningite : 2 à 4 g une fois par jour) : écart signalé, statut brouillon. ${o.commentaire ?? ''}`.trim(),
  });
  alerteRenaleC3G(f);
}

function dexaDose(): { texte: string; sources: SourceRef[] } {
  return {
    texte:
      'Dexaméthasone 10 mg IV toutes les 6 h pendant 4 jours, juste avant ou avec la 1re dose d\'antibiotique ; en cas d\'oubli, jusqu\'à 12 h après la 1re dose d\'antibiotique (SPILF 2018 ; ESCMID 2016, cité par la SPILF : 4 h). RCP (DEXAMETHASONE KRKA, seule spécialité lue dont l\'AMM cite la méningite) : 0,15 mg/kg toutes les 6 h pendant 4 jours, en commençant avant l\'antibiotique — formulation divergente (dose fixe ou au poids), non tranchée.',
    sources: [
      S(SP, 'p. 25, §13.2.1', '10 mg every 6 hours, for 4 days', 'geste'),
      S(DIA, 'dia 3', 'En cas d\'oubli, la dexaméthasone peut être administrée jusqu\'à 12 H après la première dose d\'antibiotique', 'geste'),
      S(SP, 'p. 25', 'ESCMID 2016 retient 4 heures, recommandations britanniques 2016 12 heures', 'geste'),
      S('RCP-dexamethasone-krka', '§4.2', '0,15 mg/kg de poids corporel toutes les 6 heures pendant 4 jours, […] commençant avant la première administration de l\'antibiotique', 'posologie'),
    ],
  };
}

const SRC_DEXA_NON = [
  S(DIA, 'dia 13', 'La dexaméthasone n\'est pas recommandée chez l\'immunodéprimé et en cas de listériose', 'geste'),
  S(SP, 'p. 24', 'MONALISA — la dexaméthasone était un facteur indépendant de surmortalité', 'geste'),
];

/** Dexaméthasone avant documentation (indication selon le contexte et l'examen direct). */
function dexaProbabiliste(ctx: ContexteDecision, f: Fiche, contexte: 'avant_pl' | 'pl_immediate' | 'neg' | 'cgp' | 'cgn' | 'bgp' | 'bgn', listeria: 'oui' | 'non' | 'inconnu') {
  const p = ctx.dossier.patient;
  if (p.immunodepression === 'oui') {
    f.geste('Pas de dexaméthasone : immunodépression (SPILF 2018).', SRC_DEXA_NON);
    return;
  }
  const d = dexaDose();
  const reserveImmuno = p.immunodepression === 'inconnu' ? ' Sauf immunodépression (à préciser).' : '';
  if (p.immunodepression === 'inconnu') f.manque('immunodépression', 'la dexaméthasone n\'est pas recommandée chez l\'immunodéprimé ; argument pour une listériose', 'affine');
  if (contexte === 'bgp') {
    f.geste('Examen direct à bacille à Gram positif (Listeria ?) : la dexaméthasone ne fait pas partie des indications et n\'est pas recommandée en cas de listériose ; si elle a été débutée, l\'arrêter dès que Listeria est confirmée (SPILF 2018).', [...SRC_DEXA_NON, S(SP, 'p. 25-26', 'arrêt pour les autres germes', 'geste')]);
    return;
  }
  if (contexte === 'bgn') {
    f.geste(`Examen direct à bacille à Gram négatif : il ne figure pas parmi les indications de la dexaméthasone (SPILF 2018 p. 25) ; si elle a été débutée, la poursuivre 4 jours si H. influenzae est identifié, l'arrêter pour les autres germes (E. coli…).${reserveImmuno}`, [S(SP, 'p. 25-26', 'poursuivre 4 jours si pneumocoque ou Haemophilus ; au choix du clinicien si méningocoque ; arrêt pour les autres germes', 'geste')]);
    return;
  }
  const quand =
    contexte === 'pl_immediate'
      ? 'Si l\'antibiothérapie probabiliste est décidée (LCS trouble, PL retardée) : '
      : contexte === 'cgn'
        ? 'Cocci à Gram négatif (méningocoque) : indication non consensuelle, plusieurs experts ne la recommandent pas (SPILF 2018). Si elle est retenue : '
        : '';
  const lis = listeria === 'oui' ? ' Arguments pour une listériose : la dexaméthasone n\'est pas recommandée en cas de listériose ; l\'arrêter si Listeria est confirmée.' : '';
  const src = [...d.sources, S(SP, 'p. 25, §13.2.1', 'suspicion sans confirmation microbiologique mais décision d\'antibiothérapie probabiliste', 'geste')];
  if (contexte === 'cgn') src.push(S(SP, 'p. 25, §13.2.1', 'Several experts do not recommend dexamethasone', 'geste'));
  f.geste(`${quand}${d.texte}${reserveImmuno}${lis}`, listeria === 'oui' ? [...src, ...SRC_DEXA_NON] : src);
  const pd = ctx.dossier.horaires.premiereDoseISO;
  if (pd && ctx.maintenant.getTime() - new Date(pd).getTime() > 12 * 3_600_000)
    f.alerte('attention', 'La 1re dose d\'antibiotique date de plus de 12 h : si la dexaméthasone n\'a pas été débutée, la fenêtre de rattrapage de la SPILF (12 h) est dépassée.', [S(DIA, 'dia 3', 'En cas d\'oubli, la dexaméthasone peut être administrée jusqu\'à 12 H après la première dose d\'antibiotique', 'geste')]);
}

/** Infection invasive à méningocoque : déclaration obligatoire, sujets contacts, décontamination du cas index. */
function iim(f: Fiche, motif: string, casIndex: boolean) {
  f.alerte('attention', `Infection invasive à méningocoque (${motif}) : déclaration obligatoire — signalement sans délai à l'ARS (plateforme de veille, par téléphone 24 h/24), puis fiche de notification (DGS 2018).`, [
    S(DGS, 'p. 16, fiche 7', 'Tout cas répondant à au moins un de ces critères doit être signalé sans délai à l\'autorité sanitaire (ARS)', 'definition'),
  ]);
  f.geste(
    'Sujets contacts (exposition directe aux sécrétions rhinopharyngées du cas dans les 10 jours précédant son hospitalisation : distance < 1 m, face à face, au moins une heure d\'affilée — moins si toux ou éternuements —, bouche-à-bouche quelle que soit la durée) : antibioprophylaxie quel que soit leur statut vaccinal, dans les 24 à 48 heures suivant le diagnostic ; sans intérêt au-delà de 10 jours après le dernier contact. Liste et mise en œuvre avec l\'ARS. Inutiles : désinfection rhinopharyngée, prélèvement de gorge des contacts, éviction, fermeture d\'établissement.',
    [
      S(DGS, 'p. 17, fiche 8-1', 'dans les 24 à 48 heures suivant le diagnostic, et n\'a plus d\'intérêt au-delà de 10 jours après le dernier contact avec le cas index pendant sa période de contagiosité', 'geste'),
      S(DGS, 'p. 17, fiche 8-1', 'quel que soit leur statut vaccinal', 'geste'),
      S(DGS, 'p. 18', 'désinfection rhino-pharyngée, prélèvement de gorge des contacts, éviction scolaire, fermeture d\'établissement', 'geste'),
    ],
  );
  f.alerte(
    'attention',
    'Choix de l\'antibioprophylaxie des contacts : deux doctrines coexistent, non tranchées par l\'application. Instruction DGS 2018 : rifampicine orale 600 mg toutes les 12 h pendant 2 jours ; si contre-indication, résistance ou cas répétés : ciprofloxacine 500 mg en dose unique, ou ceftriaxone 250 mg en injection unique (dose absente du RCP). DGS-Urgent 2025_06 (texte primaire non lu ; relayé par l\'AP-HP en octobre 2025, sans posologie) : ciprofloxacine si la souche est sensible, ceftriaxone si elle est résistante ou non documentée, rifampicine réservée (souche résistante à la ciprofloxacine et contre-indication à la ceftriaxone). Rifampicine : RCP du 08/04/2026 plus restrictif chez la femme enceinte ou en âge de procréer. Décision avec l\'ARS.',
    [
      S(DGS, 'p. 18, fiche 8-2', 'Rifampicine par voie orale, pendant deux jours', 'choix'),
      S(DGS, 'p. 18, fiche 8-2', 'Ceftriaxone par voie injectable, en dose unique : Adulte : injection unique de 250 mg', 'choix'),
      S('DGS-URGENT-2025-06', 'relais (PDF primaire non lisible)', 'ciprofloxacine si souche sensible, ceftriaxone si résistante ou non documentée, rifampicine réservée', 'choix'),
      S('APHP-2025-IIM-CAT', 'V3-16/10/25', 'Ciprofloxacine si la souche est sensible à la ciprofloxacine', 'choix'),
      S('RCP-rifampicine-orale', '§4.6', 'contraception non hormonale hautement efficace pendant et 6 mois après (femme) ; grossesse « que lorsque cela est strictement nécessaire »', 'autre'),
    ],
  );
  if (!casIndex) return;
  const cond = 'cas index non traité par ceftriaxone : décontamination du portage selon la DGS 2018 ; inutile après au moins 24 h de C3G selon la SPILF 2018 (divergence non tranchée)';
  const srcCas = [S(DGS, 'p. 15', 'prophylaxie du portage pour le patient « s\'il n\'a pas été traité par ceftriaxone »', 'choix'), S(SP, 'p. 28, §14.1.2', 'pas de décontamination pharyngée si ≥ 24 h de C3G', 'choix')];
  const commun = 'Choix de la molécule non tranché (instruction 2018 : rifampicine en 1re intention ; DGS-Urgent 2025_06 relayé : ciprofloxacine si souche sensible) : décision avec l\'ARS.';
  f.option({ id: 'meningite-cas-index-rifampicine', libelle: 'Décontamination du portage du cas index : rifampicine orale 48 h', type: 'documente', rang: 'conditionnelle', condition: cond, items: [RIFA_PO], duree: { texte: '48 heures', pointDeDepart: 'première prise', dureePrevueJours: 2, sources: [S('RCP-rifampicine-orale', '§4.2', 'La rifampicine sera donnée pendant 48 heures', 'duree')] }, sources: srcCas, statut: 'brouillon', commentaire: commun });
  f.option({ id: 'meningite-cas-index-ciprofloxacine', libelle: 'Décontamination du portage du cas index : ciprofloxacine orale en dose unique', type: 'documente', rang: 'conditionnelle', condition: cond, items: [CIPRO_PO], duree: { texte: 'Dose unique', pointDeDepart: 'prise unique', dureePrevueJours: 1, sources: [S('RCP-ciprofloxacine-orale', '§4.2', '1 jour (dose unique)', 'duree')] }, sources: srcCas, statut: 'brouillon', commentaire: commun });
}

/* ------------------------------------------------------------------ */
/* Règle                                                               */
/* ------------------------------------------------------------------ */

export const R_MENINGITE: Regle = {
  id: 'R-MENINGITE-BACTERIENNE',
  libelle: 'Méningite bactérienne aiguë communautaire de l\'adulte',
  description: 'SPILF 2018 (texte long, diaporama ; en cours de révision), instruction DGS 2018 et DGS-Urgent 2025_06 (prophylaxie des IIM), IDSA 2017 (méningites associées aux soins, recoupement), RCP.',
  statut: 'verifiee_ia',
  priorite: 156,
  sources: [S(SP, 'Med Mal Infect 2019;49:405-441', undefined, 'choix'), S(DIA, 'validé le 19/09/2018', undefined, 'choix'), S(DGS, 'instruction DGS/SP/2018/163', undefined, 'choix')],
  sApplique: (ctx) => adulte(ctx) && ctx.foyer === 'meningite',
  appliquer: (ctx) => {
    const f = new Fiche(ctx, 'verifiee_ia');
    const p = ctx.dossier.patient;
    f.alerte('info', 'Référentiel SPILF 2018 (actualisation de la conférence de consensus 2008) marqué « en cours de révision » sur le site de la SPILF (consulté le 06/11/2026) ; aucune nouvelle version publiée.', [S('SPILF-page-recommandations', 'Infections neuro-méningées', '(en cours de révision)', 'autre')]);
    if (p.contexte === 'associe_aux_soins') {
      associeeAuxSoins(f);
      return f.fin();
    }
    if (p.contexte === 'inconnu') f.alerte('attention', 'Contexte à confirmer : les schémas proposés ne valent que pour la méningite communautaire ; méningite associée aux soins (neurochirurgie, dérivation, drain) : avis spécialisé.');
    f.avis(
      'Avis réanimateur recommandé pour tous. Réanimation si purpura extensif, Glasgow ≤ 8, signes neurologiques focaux, signes de souffrance du tronc cérébral, état de mal convulsif, instabilité hémodynamique ou détresse respiratoire ; Glasgow ≤ 13 : discuter les soins continus ; sinon, surveillance horaire de la conscience et de l\'hémodynamique pendant au moins 24 h.',
      q(ctx, 'meningite.purpura') === 'fulminans' || p.gravite === 'choc_septique',
      [S(SP, 'p. 26, §13.3.1', 'critères de réanimation — purpura extensif, Glasgow ≤ 8, signes neurologiques focaux, signes de souffrance du tronc cérébral, état de mal convulsif, instabilité hémodynamique ; avis réanimateur recommandé pour tous', 'autre'), S(DIA, 'dia 14', 'Score de Glasgow ≤ 13 : discuter surveillance en soins continus', 'autre')],
    );
    f.geste('Pas d\'anticonvulsivant en prévention primaire ; pas de restriction hydrique (natrémie et diurèse quotidiennes) ; en cas de sepsis, insuline IV pour une glycémie < 1,8 g/L après stabilisation hémodynamique.', [S(SP, 'p. 26-27, §13.3.2', 'non recommandée ; natrémie et diurèse quotidiennes', 'geste'), S(SP, 'p. 27', 'insuline IV pour < 1,8 g/L après stabilisation hémodynamique en cas de sepsis', 'geste')]);
    const germe = germeMeningite(ctx.dossier);
    const declare = q(ctx, 'meningite.germe');
    const deduit = ctx.dossier.prelevements.map((x) => (x.organisme ? GERME_DE_PRELEVEMENT[x.organisme] : undefined)).find((g) => g !== undefined);
    if (deduit && declare !== 'inconnu' && declare !== 'non_documente' && declare !== deduit)
      f.alerte('attention', `Germe déclaré (${LIB_GERME[declare as Germe] ?? declare}) différent de celui d'un prélèvement saisi (${LIB_GERME[deduit as Germe] ?? deduit}) : vérifier ; la réponse à la question est retenue.`);
    if (germe !== 'inconnu' && germe !== 'non_documente') documentee(ctx, f, germe as Germe);
    else probabiliste(ctx, f);
    return f.fin();
  },
};

function associeeAuxSoins(f: Fiche) {
  const src = [S('IDSA-2017-HCAVM', 'Rec. 37 (strong, low)', 'cefepime, ceftazidime, or meropenem', 'choix'), S('IDSA-2017-HCAVM', 'Rec. 62-63', 'ablation de la dérivation/du drain infecté', 'geste')];
  f.urgence('immediate')
    .situation('meningite-associee-soins', 'Méningite associée aux soins (post-neurochirurgicale, dérivation, drain) : avis spécialisé', 'non_couverte', 'Hors du référentiel SPILF 2018 (méningites communautaires). Aucune recommandation française récente trouvée ; l\'IDSA 2017 n\'a été lue que partiellement (recoupement).')
    .avis('Méningite associée aux soins : avis infectiologique et neurochirurgical immédiat (dérivation ou drain infecté : ablation à discuter).', true, src)
    .absence(
      'Antibiothérapie d\'une méningite associée aux soins',
      'Recherche du 2026-11-06 : pas de recommandation française récente ; IDSA 2017 (page lue via un outil de résumé, tableau des posologies non lu) : vancomycine + bêta-lactamine antipyocyanique (céfépime, ceftazidime ou méropénème), ablation du matériel infecté, durées de 10 à 21 jours selon le germe — repris pour information, sans proposition automatisée.',
      ['Avis infectiologique et neurochirurgical immédiat', 'Hémocultures et prélèvements (LCS, matériel) avant antibiotique si cela ne le retarde pas', 'Antibiothérapie probabiliste selon le protocole local, sans attendre'],
      src,
    );
}

/* ------------------------------------------------------------------ */
/* Avant documentation                                                 */
/* ------------------------------------------------------------------ */

function probabiliste(ctx: ContexteDecision, f: Fiche) {
  const lcs = q(ctx, 'meningite.lcs');
  const pf = q(ctx, 'meningite.purpura') === 'fulminans';
  const imag = q(ctx, 'meningite.imagerie');
  const ci = contreIndicationPL(ctx);
  const lis = argumentsListeriose(ctx);
  const al = allergies(ctx);
  const avantPL = lcs === 'pas_faite' || lcs === 'inconnu';
  f.urgence('immediate');
  f.alerte('urgence', 'Méningite bactérienne suspectée : antibiothérapie (et dexaméthasone si indiquée) idéalement dans l\'heure suivant l\'admission, quel que soit le délai depuis le début des signes ; au plus tard dans les 3 heures. Tout retard aggrave le pronostic.', SRC_DELAI);
  if (lcs === 'inconnu') manqueQ(f, 'meningite.lcs', 'ponction lombaire et examen direct du LCS', 'oriente le schéma probabiliste (SPILF 2018)', 'bloque_decision');

  // Hémocultures : divergence SPILF / DGS dans le purpura fulminans.
  if (pf) {
    f.controle({ id: 'ctl-meningite-hc', type: 'hemoculture', categorie: 'conditionnel', quoi: 'Hémocultures — sans retarder l\'antibiotique', quand: { ancre: 'avant_traitement', texte: 'Divergence : SPILF 2018 « après hémoculture » ; DGS 2018 : l\'antibiothérapie ne doit pas être retardée par une hémoculture' }, pourquoi: 'Purpura fulminans : la SPILF place l\'antibiotique après les hémocultures, la DGS demande de ne pas le retarder pour un prélèvement. Divergence affichée, non tranchée par l\'application.', sources: [SRC_AVANT_PL, S(DGS, 'p. 15, fiche 6', 'ne doit pas être retardée par la réalisation d\'une hémoculture ou d\'un prélèvement sanguin', 'controle_micro')] });
    f.controle({ id: 'ctl-meningite-biopsie', type: 'prelevement', categorie: 'conditionnel', quoi: 'Biopsie cutanée d\'une lésion purpurique', quand: { ancre: 'non_determine', texte: 'Après l\'antibiotique' }, pourquoi: 'Documentation microbiologique en cas de purpura.', sources: [S(SP, 'p. 8', 'biopsie cutanée si purpura', 'controle_micro')] });
  } else {
    f.controle({ id: 'ctl-meningite-hc', type: 'hemoculture', categorie: 'indique', quoi: 'Hémocultures (au moins une paire ; au moins deux si la PL est différée)', quand: { ancre: 'avant_traitement', texte: 'Avant la 1re dose d\'antibiotique, sans la retarder' }, pourquoi: 'Documentation, en particulier quand la PL est différée.', sources: [S(SP, 'p. 8', 'au moins une paire d\'hémocultures', 'controle_micro'), S(SP, 'p. 5, §11.2', 'Si PL non immédiate : antibiothérapie probabiliste + dexaméthasone, après au moins deux hémocultures.', 'controle_micro')] });
  }
  if (q(ctx, 'meningite.purpura') === 'autre') f.controle({ id: 'ctl-meningite-biopsie', type: 'prelevement', categorie: 'conditionnel', quoi: 'Biopsie cutanée d\'une lésion purpurique', quand: { ancre: 'non_determine', texte: 'Après l\'antibiotique' }, pourquoi: 'Documentation microbiologique en cas de purpura.', sources: [S(SP, 'p. 8', 'biopsie cutanée si purpura', 'controle_micro')] });
  if (q(ctx, 'meningite.purpura') === 'inconnu') manqueQ(f, 'meningite.purpura', 'purpura (fulminans ?)', 'purpura fulminans : antibiotique immédiat avant tout prélèvement (DGS 2018)', 'bloque_decision');

  if (pf) purpuraFulminans(f, al.grave);

  // Rang des options et situation.
  let rang: Rang = 'premiere_ligne';
  let condition: string | undefined;
  let contexteDexa: Parameters<typeof dexaProbabiliste>[2] = 'neg';
  if (avantPL) {
    controlesAvantPL(f, pf, imag, ci);
    if (pf) {
      if (!f.c.situation) f.situation('meningite-purpura-fulminans', 'Purpura fulminans : antibiothérapie immédiate, avant tout prélèvement', 'couverte', 'Antibiotique immédiat sans attendre aucun prélèvement ; réanimation. En l\'absence d\'examen direct, schéma « examen direct négatif » (SPILF 2018).');
      contexteDexa = 'avant_pl';
    } else if (imag === 'oui' || ci.etat === 'oui') {
      f.situation('meningite-antibiotique-avant-pl', 'Méningite suspectée, PL différée : antibiothérapie et dexaméthasone avant la PL', 'couverte', `Hémocultures, puis dexaméthasone et antibiothérapie sans attendre ${imag === 'oui' ? 'l\'imagerie' : 'la correction de la contre-indication'} ; PL dès que possible. Schéma « examen direct négatif » (SPILF 2018).`);
      contexteDexa = 'avant_pl';
    } else if (imag === 'non' && ci.etat === 'non') {
      f.situation('meningite-pl-immediate', 'Méningite suspectée : PL dans l\'heure', 'couverte', 'Pas de contre-indication ni d\'imagerie préalable : PL dans l\'heure suivant l\'admission ; antibiothérapie dès que le LCS est trouble, sans attendre l\'examen direct.');
      rang = 'conditionnelle';
      condition = 'dès que le LCS est trouble (sans attendre l\'examen direct), ou d\'emblée si la PL ne peut pas être faite dans l\'heure (au plus tard dans les 3 heures)';
      contexteDexa = 'pl_immediate';
    } else {
      f.situation('meningite-pl-a-preciser', 'Méningite suspectée : PL immédiate ou différée à préciser', 'partielle', 'Rechercher les signes imposant une imagerie et les contre-indications de la PL : ils décident si l\'antibiothérapie précède la PL. Elle ne doit pas être retardée au-delà de l\'heure.');
      rang = 'conditionnelle';
      condition = 'dès que le LCS est trouble, ou d\'emblée si la PL est différée (imagerie préalable, contre-indication) ou impossible dans l\'heure';
      contexteDexa = 'pl_immediate';
    }
    schemaNegatif(ctx, f, rang, condition, lis, al);
  } else if (lcs === 'trouble_attente' || lcs === 'negatif') {
    if (lcs === 'trouble_attente') f.situation('meningite-lcs-trouble', 'LCS trouble, examen direct en attente', 'couverte', 'Antibiothérapie immédiate sans attendre l\'examen direct : schéma « examen direct négatif » (SPILF 2018).');
    else {
      f.situation('meningite-examen-direct-negatif', `Méningite à examen direct négatif${lis.etat === 'oui' ? ' avec arguments pour une listériose' : ''}`, lis.etat === 'inconnu' ? 'partielle' : 'couverte', lis.etat === 'oui' ? `Arguments : ${lis.raisons.join(', ')}.` : 'C3G à forte dose ; amoxicilline et gentamicine s\'il existe des arguments pour une listériose.');
      f.controle({ id: 'ctl-meningite-lactates', type: 'prelevement', categorie: 'conditionnel', quoi: 'Lactates du LCS (seuil 3,8 mmol/L) et procalcitonine sérique', quand: { ancre: 'avant_traitement', texte: 'Sur la PL initiale' }, pourquoi: 'Utiles seulement si l\'examen direct est négatif.', sources: [S(SP, 'p. 8', 'lactates LCS (meilleur seuil 3,8 mmol/L) et PCT sérique utiles seulement si examen direct négatif', 'controle_micro')] });
    }
    schemaNegatif(ctx, f, 'premiere_ligne', undefined, lis, al);
    if (lcs === 'trouble_attente') f.reeval('Adapter dès l\'examen direct (cocci à Gram positif ou négatif, bacille à Gram positif ou négatif) puis à la culture.', [SRC_ATTENDRE]);
  } else {
    contexteDexa = lcs as 'cgp' | 'cgn' | 'bgp' | 'bgn';
    examenDirect(ctx, f, contexteDexa, al);
  }
  dexaProbabiliste(ctx, f, contexteDexa, lis.etat);
  if (pf || lcs === 'cgn') iim(f, pf ? 'purpura fulminans' : 'diplocoques à Gram négatif dans le LCS', lcs === 'cgn');
  else if (q(ctx, 'meningite.purpura') === 'autre' && lcs === 'trouble_attente')
    f.alerte('attention', 'Purpura et LCS purulent : critère de cas d\'infection invasive à méningocoque — déclaration obligatoire sans délai à l\'ARS si le LCS est purulent (DGS 2018).', [S(DGS, 'p. 16, fiche 7', 'LCS purulent + purpura', 'definition')]);
  f.reeval('Réévaluer à 48-72 h : germe et CMI, évolution clinique ; adapter la molécule, la dose et la durée (choisir le germe dans les précisions du foyer).', [S(SP, 'p. 27, §14.1 ; Tableau 11 p. 28', undefined, 'choix')], 48);
}

function controlesAvantPL(f: Fiche, pf: boolean, imag: string, ci: { etat: string; anticoagulant: boolean }) {
  const srcImag = S(SP, 'p. 10, §11.3.1', 'Isolated consciousness disorders are not considered contraindications', 'imagerie');
  if (imag === 'oui')
    f.controle({ id: 'ctl-meningite-imagerie-avant-pl', type: 'imagerie', categorie: 'indique', quoi: 'Imagerie cérébrale avant la PL', quand: { ancre: 'debut_traitement', texte: 'Après hémocultures, dexaméthasone et 1re dose d\'antibiotique ; puis PL si l\'imagerie le permet' }, pourquoi: 'Signes de localisation ou crises focales récentes, signes d\'engagement ou crises persistantes.', sources: [srcImag, SRC_AVANT_PL] });
  else if (imag === 'non')
    f.controle({ id: 'ctl-meningite-imagerie-avant-pl', type: 'imagerie', categorie: 'non_systematique', quoi: 'Pas d\'imagerie avant la PL', quand: { ancre: 'non_determine', texte: 'Sans objet' }, pourquoi: 'Aucun signe de localisation, d\'engagement ni crise persistante ; des troubles de conscience isolés ne suffisent pas à la justifier.', sources: [srcImag] });
  else if (!pf) manqueQ(f, 'meningite.imagerie', 'signes imposant une imagerie avant la PL', 'décide si l\'antibiothérapie précède la PL (SPILF 2018)', 'bloque_decision');
  if (ci.anticoagulant) f.alerte('attention', 'Anticoagulant déclaré (AVK ou AOD) : contre-indication à une PL immédiate (AOD quelle que soit la dose) ; antibiothérapie avant la PL.', [S(SP, 'p. 5 §11.2.1 ; Tableau 1 p. 6', 'anticoagulant à dose efficace (AVK, HNF ou HBPM, AOD « irrespective of the dose »)', 'definition')]);
  if (ci.etat === 'oui')
    f.controle({ id: 'ctl-meningite-ci-pl', type: 'prelevement', categorie: 'indique', quoi: 'Corriger la contre-indication (hémostase, hémodynamique, ventilation) puis PL dès que possible', quand: { ancre: 'debut_traitement', texte: 'Après hémocultures, dexaméthasone et 1re dose d\'antibiotique' }, pourquoi: 'Contre-indication non neurologique à une PL immédiate.', sources: [S(SP, 'p. 5 §11.2.1 ; Tableau 1 p. 6', 'Les antiagrégants plaquettaires ne contre-indiquent pas la PL', 'definition'), SRC_AVANT_PL] });
  else if (ci.etat === 'inconnu' && !pf) manqueQ(f, 'meningite.ci_pl', 'contre-indication non neurologique à la PL', 'décide si l\'antibiothérapie précède la PL (SPILF 2018)', 'bloque_decision');
  if (pf)
    f.controle({ id: 'ctl-meningite-pl', type: 'prelevement', categorie: 'conditionnel', quoi: 'Ponction lombaire', quand: { ancre: 'non_determine', texte: 'Après l\'antibiotique, une fois l\'état stabilisé' }, pourquoi: 'Purpura fulminans : certains experts déconseillent la PL, même après correction.', sources: [S(SP, 'p. 11, §12.2', 'Certains experts déconseillent la PL dans le purpura fulminans même après correction', 'controle_micro')] });
  else if (imag === 'non' && ci.etat === 'non')
    f.controle({ id: 'ctl-meningite-pl', type: 'prelevement', categorie: 'indique', quoi: 'Ponction lombaire', quand: { ancre: 'avant_traitement', texte: 'Dans l\'heure suivant l\'admission' }, pourquoi: 'Pas de contre-indication ni d\'imagerie préalable requise.', sources: [S(SP, 'p. 5, §11.2', 'PL dans l\'heure suivant l\'admission aux urgences, sauf contre-indication ou imagerie préalable requise', 'controle_micro')] });
}

function purpuraFulminans(f: Fiche, allergieGrave: boolean) {
  f.urgence('immediate').situation('meningite-purpura-fulminans', 'Purpura fulminans : antibiothérapie immédiate, avant tout prélèvement', 'couverte', 'Antibiotique immédiat sans attendre aucun prélèvement, IV si possible, sinon IM, quel que soit l\'état hémodynamique ; SAMU-Centre 15 ; réanimation.');
  f.alerte('urgence', 'Purpura fulminans : 1re dose d\'antibiotique immédiate, sans attendre aucun prélèvement.', [S(DGS, 'p. 15, fiche 6', 'doit immédiatement recevoir une première dose d\'un antibiotique', 'choix')]);
  f.geste(
    'Purpura fulminans : 1re dose d\'antibiotique immédiate, par voie IV si possible, à défaut IM, quel que soit l\'état hémodynamique ; de préférence ceftriaxone, à défaut céfotaxime. Adulte, en préhospitalier : ceftriaxone 1 g ou céfotaxime 1 g (présentation sans lidocaïne en IV). Appel systématique du SAMU-Centre 15.',
    [
      S(DGS, 'p. 15, fiche 6', 'administrée si possible par voie intraveineuse (IV), à défaut par voie intramusculaire (IM), quel que soit l\'état hémodynamique du patient', 'geste'),
      S(DGS, 'p. 15, fiche 6', 'de préférence ceftriaxone ou, en cas d\'indisponibilité, céfotaxime', 'geste'),
      S(DGS, 'Tableau I, p. 15', 'adulte : ceftriaxone 1 g ; céfotaxime 1 g', 'posologie'),
    ],
  );
  if (allergieGrave)
    f.alerte('attention', 'Purpura fulminans et hypersensibilité sévère aux bêta-lactamines : réintroduction d\'une bêta-lactamine non recommandée, surtout en cas de choc ; les fluoroquinolones (ciprofloxacine ou lévofloxacine) peuvent constituer un recours — posologie non précisée par la source : avis infectiologique immédiat.', [S(DGS, 'p. 15, note 10', 'les fluoroquinolones (ciprofloxacine ou lévofloxacine) peuvent constituer un recours', 'choix')]);
}

/** Schéma « examen direct négatif » (aussi : avant la PL, LCS trouble en attente du Gram). */
function schemaNegatif(ctx: ContexteDecision, f: Fiche, rang: Rang, condition: string | undefined, lis: { etat: 'oui' | 'non' | 'inconnu'; raisons: string[] }, al: { grave: boolean; peni: boolean }) {
  const src = [S(SP, 'p. 22-23, §12.8.2', 'sans argument pour une listériose → céfotaxime 300 mg/kg/j ou ceftriaxone 100 mg/kg/j ; avec arguments → même C3G + amoxicilline 200 mg/kg/j + gentamicine 5 mg/kg/j', 'choix'), SRC_ATTENDRE, SRC_PAS_VANCO];
  const srcLis = S(SP, 'p. 22', 'Arguments pour listériose (p. 22) : âge > 70 ans, comorbidités, immunodépression, début progressif, rhombencéphalite (atteinte des nerfs crâniens et/ou syndrome cérébelleux)', 'definition');
  const dLis: DureeDecidee = { ...D_NON_DOC, texte: `${D_NON_DOC.texte} Gentamicine : les 5 premiers jours seulement.` };
  if (lis.etat === 'inconnu') manqueQ(f, 'meningite.listeriose', 'arguments pour une listériose', 'ajout de l\'amoxicilline et de la gentamicine (SPILF 2018)', 'bloque_decision');
  if (lis.etat !== 'oui')
    pairesC3G(f, { id: 'meningite-neg', libelle: 'Méningite sans documentation', fort: true, rang, condition: lis.etat === 'inconnu' ? [condition, 'en l\'absence d\'argument pour une listériose'].filter(Boolean).join(' ; ') : condition, duree: D_NON_DOC, sources: src });
  if (lis.etat !== 'non')
    pairesC3G(f, {
      id: 'meningite-neg-listeria',
      libelle: 'Méningite sans documentation, arguments pour une listériose',
      fort: true,
      rang: lis.etat === 'oui' ? rang : 'conditionnelle',
      condition: lis.etat === 'oui' ? condition : [condition, 's\'il existe des arguments pour une listériose'].filter(Boolean).join(' ; '),
      duree: dLis,
      sources: [...src, srcLis],
      avec: [AMX, GENTA],
      commentaire: lis.etat === 'oui' ? `Arguments : ${lis.raisons.join(', ')}. Amoxicilline 200 mg/kg/j au-dessus du maximum du RCP (12 g/j) au-delà de 60 kg.` : 'Amoxicilline 200 mg/kg/j au-dessus du maximum du RCP (12 g/j) au-delà de 60 kg.',
    });
  controleDosageC3G(ctx, f, true);
  // Allergie grave (Tableau 10) : vancomycine + rifampicine (± cotrimoxazole si arguments pour une listériose).
  const items = lis.etat === 'oui' ? [VANCO, RIFA, SMX] : [VANCO, RIFA];
  optionAllergie(f, { id: 'meningite-neg-allergie', libelle: `Allergie grave aux bêta-lactamines : vancomycine + rifampicine${lis.etat === 'oui' ? ' + cotrimoxazole' : ''}`, items, rangBase: rang, grave: al.grave, condition, duree: D_NON_DOC, extrait: 'examen direct négatif → vancomycine + rifampicine (± cotrimoxazole si arguments pour listériose)' });
}

function optionAllergie(f: Fiche, o: { id: string; libelle: string; items: ItemPrescription[]; rangBase: Rang; grave: boolean; condition?: string; duree: DureeDecidee; extrait: string; type?: 'probabiliste' | 'documente'; sansMeropeneme?: boolean }) {
  const condAl = 'si allergie grave (hypersensibilité immédiate anaphylactique) aux bêta-lactamines — avis infectiologique obligatoire';
  const rifa = o.items.some((i) => i.m === 'rifampicine');
  f.option({
    id: o.id,
    libelle: o.libelle,
    type: o.type ?? 'probabiliste',
    rang: o.grave && o.rangBase !== 'conditionnelle' ? 'alternative' : 'conditionnelle',
    condition: o.grave ? o.condition : [condAl, o.condition].filter(Boolean).join(' ; '),
    items: o.items,
    duree: o.duree,
    statut: 'brouillon',
    sources: [S(SP, 'p. 23, §12.8.2.3 ; Tableau 10 p. 24', o.extrait, 'choix'), S(SP, 'p. 23, §12.8.2.3', 'allergie grave = hypersensibilité immédiate anaphylactique ; sinon céfotaxime/ceftriaxone recommandés', 'definition')],
    commentaire: `Allergie non grave : céfotaxime ou ceftriaxone restent recommandés (SPILF 2018). Aztréonam : mauvaise diffusion dans le LCS.${o.sansMeropeneme ? '' : ' Méropénème possible (faible risque croisé) mais sans données : avis infectiologique et surveillance continue les 24 premières heures.'}${rifa ? ' La rifampicine, inducteur enzymatique, peut réduire l\'effet de la dexaméthasone (RCP).' : ''}`,
  });
  if (o.grave) f.avis('Allergie grave aux bêta-lactamines et méningite : avis infectiologique obligatoire.', true, [S(SP, 'p. 23, §12.8.2.3', 'avis infectiologique ; surveillance continue les 24 premières heures', 'choix')]);
}

/** Schémas selon l'examen direct (cocci ou bacille, Gram positif ou négatif). */
function examenDirect(ctx: ContexteDecision, f: Fiche, ed: 'cgp' | 'cgn' | 'bgp' | 'bgn', al: { grave: boolean; peni: boolean }) {
  if (ed === 'cgp') {
    f.situation('meningite-examen-direct-cgp', 'Méningite à cocci à Gram positif (pneumocoque probable)', 'couverte', 'C3G à forte dose (pneumocoque) ; pas de vancomycine systématique.');
    pairesC3G(f, { id: 'meningite-cgp', libelle: 'Cocci à Gram positif', fort: true, rang: 'premiere_ligne', duree: D_NON_DOC, sources: [S(SP, 'p. 21, §12.8.1.1 ; Tableau 8 p. 22', 'céfotaxime 300 mg/kg/j IV, en continu (dose de charge 50 mg/kg sur 1 h) ou ≥ 4 perfusions (75 mg/kg/6 h) ; ou ceftriaxone 100 mg/kg/j en 1 ou 2 perfusions', 'choix'), SRC_PAS_VANCO] });
    controleDosageC3G(ctx, f, true);
    optionAllergie(f, { id: 'meningite-cgp-allergie', libelle: 'Allergie grave aux bêta-lactamines : vancomycine + rifampicine', items: [VANCO, RIFA], rangBase: 'premiere_ligne', grave: al.grave, duree: D_NON_DOC, extrait: 'pneumocoque → vancomycine (charge 30 mg/kg sur 1 h puis 40–60 mg/kg/j, résiduelle 15–20 mg/L) + rifampicine (adulte 300 mg × 2/j) ou méropénème' });
    return;
  }
  if (ed === 'cgn') {
    f.situation('meningite-examen-direct-cgn', 'Méningite à cocci à Gram négatif (méningocoque probable)', 'couverte', 'C3G (méningocoque) ; infection invasive à méningocoque : déclaration obligatoire et prophylaxie des contacts.');
    pairesC3G(f, { id: 'meningite-cgn', libelle: 'Cocci à Gram négatif', fort: false, rang: 'premiere_ligne', duree: D_NON_DOC, sources: [S(SP, 'p. 21, §12.8.1.2', 'céfotaxime 200 mg/kg/j (50 mg/kg/6 h ou continu avec charge 50 mg/kg) ou ceftriaxone 75 mg/kg/j en 1 ou 2 perfusions', 'choix'), S(DGS, 'p. 2-3', 'usage exclusif des céphalosporines de 3ème génération (suppression de l\'amoxicilline)', 'choix')] });
    optionAllergie(f, { id: 'meningite-cgn-allergie', libelle: 'Allergie grave aux bêta-lactamines : ciprofloxacine', items: [CIPRO_IV], rangBase: 'premiere_ligne', grave: al.grave, duree: D_NON_DOC, extrait: 'méningocoque → ciprofloxacine « 800–1200 mg » (fréquence non précisée) ou rifampicine', sansMeropeneme: true });
    f.alerte('info', 'Allergie et méningocoque : la SPILF cite aussi la rifampicine ; son RCP précise qu\'elle « n\'est pas un traitement de la méningite à méningocoque » (divergence : non proposée seule).', [S(DIA, 'dia 12', 'Ciprofloxacine OU rifampicine', 'choix'), S('RCP-rifampicine-orale', '§4.1', 'la rifampicine n\'est pas un traitement de la méningite à méningocoque', 'choix')]);
    return;
  }
  if (ed === 'bgp') {
    f.situation('meningite-examen-direct-bgp', 'Méningite à bacille à Gram positif (Listeria probable)', 'couverte', 'Amoxicilline + gentamicine (Listeria) ; pas de dexaméthasone.');
    const src = [S(SP, 'p. 21, §12.8.1.3', 'amoxicilline 200 mg/kg/j IV en 4 à 6 perfusions + gentamicine', 'choix')];
    f.option({ id: 'meningite-bgp', libelle: 'Bacille à Gram positif : amoxicilline 200 mg/kg/j + gentamicine 5 mg/kg/j', type: 'probabiliste', rang: 'premiere_ligne', items: [AMX, GENTA], duree: dureeListeria(ctx), sources: src, commentaire: 'Amoxicilline 200 mg/kg/j au-dessus du maximum du RCP (12 g/j) au-delà de 60 kg : écart signalé, statut brouillon.' });
    f.option({ id: 'meningite-bgp-allergie', libelle: 'Allergie aux pénicillines : cotrimoxazole', type: 'probabiliste', rang: al.peni ? 'alternative' : 'conditionnelle', condition: al.peni ? undefined : 'si allergie aux pénicillines — avis infectiologique', items: [SMX], duree: dureeListeria(ctx), statut: 'brouillon', sources: [S(SP, 'Tableau 10 p. 24', 'Listeria → cotrimoxazole 10–20 mg/kg/j de triméthoprime en 4 prises', 'choix')], commentaire: 'Dose SPILF au-dessus du RCP (6 à 8 mg/kg/j de triméthoprime) : divergence non tranchée.' });
    return;
  }
  // Bacille à Gram négatif : H. influenzae ou E. coli ; méropénème si BLSE suspectée.
  const blse = suspicionBLSE(ctx);
  f.situation('meningite-examen-direct-bgn', `Méningite à bacille à Gram négatif${blse ? ' — E. coli BLSE suspecté' : ''}`, blse ? 'partielle' : 'couverte', 'C3G (H. influenzae, E. coli) ; méropénème et avis d\'expert si une BLSE est suspectée (colonisation ou prélèvement d\'un autre site).');
  const srcBgn = [S(SP, 'p. 21-22, §12.8.1.4-5', 'céfotaxime 200 mg/kg/j ou ceftriaxone 75 mg/kg/j', 'choix')];
  if (blse) {
    f.option({ id: 'meningite-bgn-meropeneme', libelle: 'BGN, BLSE suspectée : méropénème 40 mg/kg × 3/j', type: 'probabiliste', rang: 'premiere_ligne', items: [MERO], duree: D_NON_DOC, sources: [S(SP, 'p. 22, §12.8.1.5', 'Suspicion d\'E. coli BLSE (colonisation ou prélèvement d\'un autre site) : méropénème 40 mg/kg × 3/j en perfusion lente + avis d\'expert', 'choix')] });
    f.avis('Méningite à BGN avec suspicion de BLSE : avis d\'expert.', true, [S(SP, 'p. 22, §12.8.1.5', 'méropénème 40 mg/kg × 3/j en perfusion lente + avis d\'expert', 'choix')]);
  }
  pairesC3G(f, { id: 'meningite-bgn', libelle: 'Bacille à Gram négatif', fort: false, rang: blse ? 'conditionnelle' : 'premiere_ligne', condition: blse ? 'si la BLSE est écartée' : undefined, duree: D_NON_DOC, sources: srcBgn });
  optionAllergie(f, { id: 'meningite-bgn-allergie', libelle: 'Allergie grave aux bêta-lactamines : ciprofloxacine (H. influenzae)', items: [CIPRO_IV], rangBase: 'premiere_ligne', grave: al.grave, duree: D_NON_DOC, extrait: 'H. influenzae → ciprofloxacine 800–1200 mg', sansMeropeneme: blse });
}

/** BLSE suspectée : antécédent de colonisation/infection à BLSE ou prélèvement (autre site) BLSE ou résistant aux C3G. */
function suspicionBLSE(ctx: ContexteDecision): boolean {
  if (ctx.dossier.patient.antecedentsMicro.some((a) => a.resistance === 'BLSE')) return true;
  return ctx.dossier.prelevements.some((x) => {
    const atb = lireAntibiogramme(x);
    return atb.meca('BLSE') || (x.organisme === 'escherichia_coli' && pireC3G(atb.sir) === 'R');
  });
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
    sources: [S(SP, 'p. 28-29, §14.1.3', 'amoxicilline 200 mg/kg/j 21 jours (14 si évolution favorable) + gentamicine 5 mg/kg/j en une perfusion de 30 min les 5 premiers jours', 'duree'), S(SP, 'Tableau 11 p. 28', 'Listeria 14–21 j', 'duree'), S(DIA, 'dia 17', 'Listéria 21 jours', 'duree')],
  };
}

/** CMI (mg/L) d'un pneumocoque : saisie dans l'antibiogramme d'un prélèvement, sinon réponse à la question. */
function cmiPneumo(ctx: ContexteDecision, dcis: string[], idQ: string): 'le' | 'gt' | undefined {
  const valeurs = ctx.dossier.prelevements
    .filter((x) => x.organisme === 'streptococcus_pneumoniae')
    .flatMap((x) => (x.antibiogramme ?? []).filter((r) => dcis.includes(r.dci) && r.cmi !== undefined).map((r) => r.cmi!));
  if (valeurs.length) return Math.max(...valeurs) > 0.5 ? 'gt' : 'le';
  const r = q(ctx, idQ);
  return r === 'le_0_5' ? 'le' : r === 'gt_0_5' ? 'gt' : undefined;
}

function documentee(ctx: ContexteDecision, f: Fiche, germe: Germe) {
  const evol = q(ctx, 'meningite.evolution');
  const al = allergies(ctx);
  const fav = evol === 'favorable';
  const defav = evol === 'defavorable';
  const dep = 'non précisé par les sources (début du traitement présumé)';
  f.urgence('elevee');
  if (evol === 'inconnu') manqueQ(f, 'meningite.evolution', 'évolution à 48-72 h', 'durée du traitement, PL de contrôle et imagerie (SPILF 2018)', 'bloque_duree');
  if (al.grave)
    f.alerte('attention', 'Allergie documentée (SPILF 2018, tableau 11) : choc anaphylactique à la pénicilline → discuter une C3G sous surveillance en réanimation, ou vancomycine + rifampicine ; choc anaphylactique à une C3G → C3G contre-indiquées sauf avis d\'expert.', [S(SP, 'note du Tableau 11', 'choc anaphylactique à la pénicilline → discuter C3G sous surveillance en réanimation ou vancomycine + rifampicine ; choc anaphylactique à une C3G → C3G contre-indiquées sauf avis d\'expert', 'choix')]);

  // Dexaméthasone après identification.
  if (germe === 'pneumocoque' || germe === 'h_influenzae') f.geste('Dexaméthasone (si débutée) : la poursuivre 4 jours au total.', [S(SP, 'p. 25-26', 'poursuivre 4 jours si pneumocoque ou Haemophilus', 'geste')]);
  else if (germe === 'meningocoque') f.geste('Dexaméthasone (si débutée) : poursuite au choix du clinicien (méningocoque).', [S(SP, 'p. 25-26', 'au choix du clinicien si méningocoque', 'geste')]);
  else f.geste(`Dexaméthasone (si débutée) : l'arrêter (${LIB_GERME[germe]})${germe === 'listeria' ? ' — non recommandée en cas de listériose' : ''}.`, germe === 'listeria' ? [S(SP, 'p. 25-26', 'arrêt pour les autres germes', 'geste'), ...SRC_DEXA_NON] : [S(SP, 'p. 25-26', 'arrêt pour les autres germes', 'geste')]);

  // PL de contrôle (Tableau 12) et imagerie (Tableau 13).
  const srcPL = [S(SP, 'p. 29 §14.2 ; Tableau 12 p. 30', 'si évolution défavorable, systématique après imagerie, avec dosage de la C3G', 'controle_micro'), S(DIA, 'dia 18', 'PL de contrôle non indiquée si évolution favorable', 'controle_micro')];
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
    sources: [S(SP, 'p. 29-30 ; Tableau 13', 'systématique si bactérie autre que pneumocoque ou méningocoque, pneumocoque avec otite/sinusite/mastoïdite ; occasionnelle si fièvre > 38,5 °C, troubles de conscience ou céphalées persistant après 48–72 h, signes neurologiques nouveaux', 'imagerie')],
  });
  if (orl) f.avis('Foyer ORL : avis ORL (paracentèse si otite moyenne aiguë) ; en cas de brèche : pas d\'antibioprophylaxie ni de prolongation de l\'antibiothérapie avant fermeture, vaccination antipneumococcique.', false, [S(SP, 'p. 31, §14.4', 'avis ORL ; paracentèse si OMA ; pas d\'antibioprophylaxie ni de prolongation de l\'antibiothérapie avant fermeture d\'une brèche ; vaccination antipneumococcique si brèche', 'geste')]);
  f.reeval('Avant la sortie (ou au plus tard 15 jours après la fin du traitement) : examen neurologique et test auditif ; suivi pendant 12 mois ; rechercher une pathologie prédisposante (diabète, éthylisme, cancer, cirrhose, hémopathie, VIH si facteur de risque).', [S(DIA, 'dia 22-23', 'examen neurologique et test auditif avant la sortie ou au plus tard 15 jours après la fin du traitement ; suivi 12 mois', 'autre')]);

  switch (germe) {
    case 'pneumocoque': {
      const cmiAmox = cmiPneumo(ctx, ['amoxicilline'], 'meningite.cmi_amox');
      if (cmiC3G === undefined) manqueQ(f, 'meningite.cmi_c3g', 'CMI de la C3G (pneumocoque)', 'dose de C3G, PL de contrôle et durée (SPILF 2018, tableau 11)', 'bloque_dose');
      if (cmiC3G === 'le' && cmiAmox === undefined) manqueQ(f, 'meningite.cmi_amox', 'CMI de l\'amoxicilline (pneumocoque)', 'amoxicilline de préférence si CMI ≤ 0,5 mg/L (SPILF 2018, tableau 11)', 'affine');
      const duree: DureeDecidee = {
        texte: `10 à 14 jours : 10 jours si évolution favorable en 48 h et CMI C3G ≤ 0,5 mg/L, sinon 14 jours.${fav && cmiC3G === 'le' ? ' Conditions réunies : 10 jours.' : ''}`,
        pointDeDepart: dep,
        dureePrevueJours: fav && cmiC3G === 'le' ? 10 : 14,
        sources: [S(SP, 'Tableau 11 p. 28', 'pneumocoque 10–14 j (10 j si évolution favorable en 48 h et CMI C3G ≤ 0,5)', 'duree')],
      };
      const src11 = (extrait: string) => [S(SP, 'p. 27, §14.1 ; Tableau 11 p. 28', extrait, 'choix')];
      f.situation('meningite-pneumocoque', 'Méningite à pneumocoque', cmiC3G === undefined ? 'partielle' : 'couverte', 'Adaptation à la CMI de la C3G et de l\'amoxicilline (seuil 0,5 mg/L).');
      if (cmiC3G === 'le' && cmiAmox === 'le') {
        f.option({ id: 'meningite-pneumo-amox', libelle: 'Pneumocoque (CMI C3G et amoxicilline ≤ 0,5 mg/L) : amoxicilline 200 mg/kg/j', type: 'documente', rang: 'premiere_ligne', items: [AMX], duree, sources: src11('CMI C3G ≤ 0,5 mg/L et CMI amoxicilline ≤ 0,5 → amoxicilline 200 mg/kg/j de préférence (ou C3G maintenue)'), commentaire: 'Amoxicilline 200 mg/kg/j au-dessus du maximum du RCP (12 g/j) au-delà de 60 kg : écart signalé, statut brouillon.' });
        f.option({ id: 'meningite-pneumo-c3g-maintenue', libelle: 'Pneumocoque (CMI ≤ 0,5 mg/L) : C3G maintenue', type: 'documente', rang: 'alternative', items: [CTX300], duree, statut: 'brouillon', sources: src11('CMI C3G ≤ 0,5 mg/L et CMI amoxicilline ≤ 0,5 → amoxicilline 200 mg/kg/j de préférence (ou C3G maintenue)'), commentaire: 'Le tableau 11 ne précise pas la dose de la C3G maintenue : la dose probabiliste (300 mg/kg/j) est reprise, à valider.' });
        alerteRenaleC3G(f);
      } else if (cmiC3G === 'le') {
        pairesC3G(f, { id: 'meningite-pneumo-c3g200', libelle: 'Pneumocoque (CMI C3G ≤ 0,5 mg/L)', fort: false, rang: 'premiere_ligne', duree, type: 'documente', sources: src11('CMI amoxicilline > 0,5 → céfotaxime 200 mg/kg/j ou ceftriaxone 75 mg/kg/j'), commentaire: cmiAmox === undefined ? 'Si la CMI de l\'amoxicilline est ≤ 0,5 mg/L, l\'amoxicilline 200 mg/kg/j est à préférer.' : undefined });
        if (cmiAmox === undefined) f.option({ id: 'meningite-pneumo-amox', libelle: 'Pneumocoque : amoxicilline 200 mg/kg/j', type: 'documente', rang: 'conditionnelle', condition: 'si CMI de l\'amoxicilline ≤ 0,5 mg/L (à préférer)', items: [AMX], duree, sources: src11('CMI C3G ≤ 0,5 mg/L et CMI amoxicilline ≤ 0,5 → amoxicilline 200 mg/kg/j de préférence (ou C3G maintenue)') });
      } else {
        pairesC3G(f, { id: 'meningite-pneumo-c3g300', libelle: cmiC3G === 'gt' ? 'Pneumocoque (CMI C3G > 0,5 mg/L)' : 'Pneumocoque (CMI en attente)', fort: true, rang: 'premiere_ligne', duree, type: 'documente', sources: src11('CMI C3G > 0,5 → céfotaxime 300 / ceftriaxone 100 mg/kg/j, PL de contrôle avec dosages, avis infectiologue et microbiologiste') });
        controleDosageC3G(ctx, f, true);
        if (cmiC3G === 'gt') f.avis('Pneumocoque de CMI C3G > 0,5 mg/L : avis infectiologue et microbiologiste.', false, src11('CMI C3G > 0,5 → céfotaxime 300 / ceftriaxone 100 mg/kg/j, PL de contrôle avec dosages, avis infectiologue et microbiologiste'));
      }
      optionAllergie(f, { id: 'meningite-pneumo-allergie', libelle: 'Allergie grave aux bêta-lactamines : vancomycine + rifampicine', items: [VANCO, RIFA], rangBase: 'premiere_ligne', grave: al.grave, duree, type: 'documente', extrait: 'pneumocoque → vancomycine (charge 30 mg/kg sur 1 h puis 40–60 mg/kg/j, résiduelle 15–20 mg/L) + rifampicine (adulte 300 mg × 2/j) ou méropénème' });
      if (defav) f.avis('Évolution défavorable à 48-72 h : imagerie (IRM), PL de contrôle, optimisation (dose, C3G de plus faible CMI, ajout de rifampicine 10 mg/kg/12 h ou de vancomycine) avec l\'infectiologue.', true, src11('Évolution défavorable à 48–72 h : imagerie (IRM), PL de contrôle, optimisation (dose, C3G à plus faible CMI, ajout rifampicine 10 mg/kg/12 h ou vancomycine)'));
      return;
    }
    case 'meningocoque': {
      const duree: DureeDecidee = {
        texte: `${fav ? '4 jours (évolution favorable dès 48 h)' : '7 jours (évolution non favorable ou non encore évaluée ; 4 jours si favorable dès 48 h)'}. Sources divergentes : SPILF 2018 texte et diaporama 4 à 7 jours ; tableau 11 : 5 à 7 jours (plutôt 5) ; DGS 2018 : au-delà de 4 jours, pas de justification dans les formes classiques.`,
        pointDeDepart: dep,
        dureePrevueJours: fav ? 4 : 7,
        sources: [S(SP, 'p. 28, §14.1.2', 'durée 4 à 7 jours (4 jours si apyrexie en 48 h)', 'duree'), S(DIA, 'dia 17', 'Méningocoque 4 jours si évolution favorable dès 48h, sinon 7 jours', 'duree'), S(SP, 'Tableau 11 p. 28', 'méningocoque 5–7 j dans le tableau (note e : plutôt 5 j)', 'duree'), S(DGS, 'p. 15', 'Dans les formes classiques, la poursuite du traitement au-delà de 4 jours n\'a pas de justification', 'duree')],
      };
      f.situation('meningite-meningocoque', 'Méningite à méningocoque', 'couverte', 'C3G ; déclaration obligatoire ; prophylaxie des sujets contacts.');
      pairesC3G(f, { id: 'meningite-meningo', libelle: 'Méningocoque', fort: false, rang: 'premiere_ligne', duree, type: 'documente', sources: [S(SP, 'p. 28, §14.1.2', 'C3G ≤ 200 mg/kg/j (céfotaxime) ou 75 mg/kg/j (ceftriaxone)', 'choix')] });
      f.reeval('Amoxicilline possible si CMI ≤ 0,125 mg/L (SPILF 2018 ; dose non précisée pour le méningocoque).', [S(SP, 'p. 28, §14.1.2', 'amoxicilline possible si CMI ≤ 0,125 mg/L', 'choix')]);
      optionAllergie(f, { id: 'meningite-meningo-allergie', libelle: 'Allergie grave aux bêta-lactamines : ciprofloxacine', items: [CIPRO_IV], rangBase: 'premiere_ligne', grave: al.grave, duree, type: 'documente', extrait: 'méningocoque → ciprofloxacine « 800–1200 mg » (fréquence non précisée) ou rifampicine', sansMeropeneme: true });
      iim(f, 'méningite à méningocoque', true);
      return;
    }
    case 'listeria': {
      f.situation('meningite-listeria', 'Méningite à Listeria monocytogenes', 'couverte', 'Amoxicilline + gentamicine (5 premiers jours) ; pas de dexaméthasone ; déclaration obligatoire.');
      f.option({ id: 'meningite-listeria-amox-genta', libelle: 'Listeria : amoxicilline 200 mg/kg/j + gentamicine 5 mg/kg/j (5 premiers jours)', type: 'documente', rang: 'premiere_ligne', items: [AMX, GENTA], duree: dureeListeria(ctx), sources: [S(SP, 'p. 28-29, §14.1.3 ; Tableau 11', 'amoxicilline 200 mg/kg/j 21 jours (14 si évolution favorable) + gentamicine 5 mg/kg/j en une perfusion de 30 min les 5 premiers jours ; alternative cotrimoxazole', 'choix')], commentaire: 'Amoxicilline 200 mg/kg/j au-dessus du maximum du RCP (12 g/j) au-delà de 60 kg : écart signalé, statut brouillon.' });
      f.option({ id: 'meningite-listeria-cotrimoxazole', libelle: 'Listeria, alternative (allergie) : cotrimoxazole', type: 'documente', rang: al.peni ? 'alternative' : 'conditionnelle', condition: al.peni ? undefined : 'si l\'amoxicilline ne peut pas être utilisée (allergie) — avis infectiologique', items: [SMX], duree: dureeListeria(ctx), statut: 'brouillon', sources: [S(SP, 'p. 28-29, §14.1.3', 'alternative cotrimoxazole', 'choix'), S(SP, 'Tableau 10 p. 24', 'Listeria → cotrimoxazole 10–20 mg/kg/j de triméthoprime en 4 prises', 'choix')], commentaire: 'Dose SPILF au-dessus du RCP (6 à 8 mg/kg/j de triméthoprime) : divergence non tranchée.' });
      f.alerte('attention', 'Méningite à Listeria monocytogenes : déclaration obligatoire.', [S(SP, 'p. 12, §12.3.1', 'the mandatory report of meningococcal or Listeria monocytogenes meningitis', 'definition')]);
      return;
    }
    case 'h_influenzae':
    case 'e_coli': {
      const hi = germe === 'h_influenzae';
      const duree: DureeDecidee = hi
        ? { texte: '7 jours', pointDeDepart: dep, dureePrevueJours: 7, sources: [S(DIA, 'dia 17', 'Haemophilus influenzae 7 jours', 'duree')] }
        : { texte: '21 jours', pointDeDepart: dep, dureePrevueJours: 21, sources: [S(DIA, 'dia 17', 'E. coli 21 jours', 'duree'), S(SP, 'Tableau 11 p. 28', 'E. coli 21 j', 'duree')] };
      const blse = !hi && suspicionBLSE(ctx);
      f.situation(`meningite-${germe}`, `Méningite à ${LIB_GERME[germe]}${blse ? ' — BLSE suspectée ou documentée' : ''}`, blse ? 'partielle' : 'couverte', hi ? 'C3G, 7 jours.' : 'C3G, 21 jours ; méropénème et avis d\'expert si BLSE.');
      const src = [S(SP, hi ? 'p. 21-22, §12.8.1.4' : 'p. 22, §12.8.1.5', 'céfotaxime 200 mg/kg/j ou ceftriaxone 75 mg/kg/j', 'choix')];
      if (blse) {
        f.option({ id: 'meningite-ecoli-meropeneme', libelle: 'E. coli, BLSE : méropénème 40 mg/kg × 3/j', type: 'documente', rang: 'premiere_ligne', items: [MERO], duree, sources: [S(SP, 'p. 22, §12.8.1.5', 'Suspicion d\'E. coli BLSE (colonisation ou prélèvement d\'un autre site) : méropénème 40 mg/kg × 3/j en perfusion lente + avis d\'expert', 'choix')] });
        f.avis('Méningite à E. coli BLSE : avis d\'expert.', true, [S(SP, 'p. 22, §12.8.1.5', 'méropénème 40 mg/kg × 3/j en perfusion lente + avis d\'expert', 'choix')]);
      }
      pairesC3G(f, { id: `meningite-${germe}`, libelle: LIB_GERME[germe], fort: false, rang: blse ? 'conditionnelle' : 'premiere_ligne', condition: blse ? 'si la souche est sensible aux C3G (BLSE écartée)' : undefined, duree, type: 'documente', sources: src });
      if (hi) optionAllergie(f, { id: 'meningite-hi-allergie', libelle: 'Allergie grave aux bêta-lactamines : ciprofloxacine', items: [CIPRO_IV], rangBase: 'premiere_ligne', grave: al.grave, duree, type: 'documente', extrait: 'H. influenzae → ciprofloxacine 800–1200 mg', sansMeropeneme: true });
      else if (al.grave) f.avis('Méningite à E. coli et allergie grave aux bêta-lactamines : pas de schéma dans le tableau 10 de la SPILF — avis infectiologique.', true, [S(SP, 'p. 23, §12.8.2.3', 'avis infectiologique ; surveillance continue les 24 premières heures', 'choix')]);
      return;
    }
    case 's_agalactiae': {
      f.situation('meningite-s-agalactiae', 'Méningite à Streptococcus agalactiae', 'couverte', 'Amoxicilline 200 mg/kg/j, 14 à 21 jours.');
      f.option({ id: 'meningite-sagalactiae-amox', libelle: 'S. agalactiae : amoxicilline 200 mg/kg/j', type: 'documente', rang: 'premiere_ligne', items: [AMX], duree: { texte: '14 à 21 jours', pointDeDepart: dep, sources: [S(SP, 'Tableau 11 p. 28', 'S. agalactiae 14–21 j (amoxicilline 200 mg/kg/j)', 'duree')] }, sources: [S(SP, 'Tableau 11 p. 28', 'S. agalactiae 14–21 j (amoxicilline 200 mg/kg/j)', 'choix')], commentaire: 'Amoxicilline 200 mg/kg/j au-dessus du maximum du RCP (12 g/j) au-delà de 60 kg : écart signalé, statut brouillon.' });
      if (al.peni) f.avis('S. agalactiae et allergie aux pénicillines : pas d\'alternative dans les sources lues — avis infectiologique.', true, []);
      return;
    }
    default: {
      f.situation('meningite-autre-germe', 'Méningite à un germe non modélisé', 'non_couverte', 'Germe hors des schémas de la SPILF 2018 modélisés : avis infectiologique.');
      f.avis('Méningite à un germe non modélisé : avis infectiologique pour le choix et la durée.', true, []);
      f.absence('Méningite à un germe autre que pneumocoque, méningocoque, Listeria, H. influenzae, E. coli ou S. agalactiae', 'Les sources lues (SPILF 2018, tableaux 8 et 11) ne couvrent que ces germes.', ['Avis infectiologique', 'PL de contrôle à 48-72 h et imagerie (systématiques pour ces germes)'], [S(SP, 'Tableau 11 p. 28', undefined, 'choix')]);
    }
  }
}

export const REGLES_MENINGITES = [R_MENINGITE];
