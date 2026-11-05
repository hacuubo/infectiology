/**
 * Fonction rénale : estimations calculées à partir de la créatininémie, valeur rendue par le laboratoire,
 * et choix de l'estimation adaptée à chaque référence posologique.
 *
 * Trois grandeurs distinctes, jamais interchangeables :
 *  - DFG estimé indexé (CKD-EPI 2009 sans coefficient racial par défaut ; CKD-EPI 2021 ou EKFC au choix), mL/min/1,73 m² ;
 *  - DFG estimé désindexé (× surface corporelle de Du Bois / 1,73), mL/min ;
 *  - clairance estimée de la créatinine (Cockcroft-Gault), mL/min.
 * Aucune donnée manquante n'est inventée : une estimation non calculable l'indique avec ce qui manque.
 * Aucune correction ethnique n'est appliquée (le coefficient « race noire » de CKD-EPI 2009 n'est jamais utilisé).
 * Sources et divergences : docs/sources/recherche-fonction-renale.md.
 */
import type { MethodeDFG, SourceRef, UniteCreatinine } from '../clinical/types';
import type { ReferenceRenale } from '../clinical/molecules/reference-renale';
import { nombreFr } from './format';

/* ------------------------------------------------------------------ */
/* Sources des formules                                                */
/* ------------------------------------------------------------------ */

const ref = (source: string, repere: string, extrait?: string): SourceRef => ({ source, repere, extrait, justifie: 'adaptation_renale' });
export const SOURCES_RENALES = {
  ckdEpi2021: [ref('NKF-CKD-EPI-2021', 'formule', 'eGFR = 142 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^−1.200 × 0.9938^Age × 1.012 [if female]'), ref('INKER-2021-CKD-EPI', 'tableau des coefficients (équation créatinine 2021)')],
  ckdEpi2009: [ref('LEVEY-2009-CKD-EPI', 'Results', 'GFR = 141 × min(Scr/κ, 1)α × max(Scr/κ, 1)-1.209 × 0.993Age × 1.018 [if female] × 1.159 [if black]'), ref('EFLM-2022-CKD-EPI-Europe', 'éditorial EFLM', 'CKD-EPI 2009 sans coefficient racial maintenue en Europe')],
  ekfc: [ref('STEHLE-2023-DFG', 'tableau 1', 'si SCr/Q < 1 : 107,3 × (SCr/Q)-0,322 × 0,990(âge - 40)'), ref('KDIGO-2024-CKD', 'Table 14 (équations validées)')],
  kdigoEquation: ref('KDIGO-2024-CKD', 'PP 1.2.4.1-1.2.4.2 ; Table 14', 'une équation par région, sans variable raciale'),
  hasCkdEpi: ref('HAS-2023-MRC-7-messages', 'message 4', "L'adaptation des posologies doit s'effectuer à partir de l'estimation du DFG obtenue par la formule CKD-EPI"),
  hasDesindexation: ref('HAS-2023-MRC-7-messages', 'message 4, note 3', 'la désindexation […] est recommandée lorsque celle-ci est éloignée de 1,73 m²'),
  duBois: ref('HAS-2023-MRC-7-messages', 'message 4, note 3', 'SC (m²) = 0,007184 x taille (cm)0,725 x poids réel (kg)0,425'),
  cockcroft: [ref('COCKCROFT-GAULT-1976', 'équation originale'), ref('RCP-vancomycine', '§4.2', 'Hommes : [poids (kg) x [140 - âge (ans)]] / [72 x créatinine plasmatique (mg/dl)]')],
  kdigoDesindexe: ref('KDIGO-2024-CKD', 'PP 4.2.4', 'eGFR nonindexed for body surface area (BSA) may be indicated, especially for medications with a narrow therapeutic range'),
  emaDesindexe: ref('EMA-2015-PK-insuffisance-renale', 'p. 3', 'dose recommendations … should be based on absolute GFR … and not on GFR normalised to a body surface area of 1.73 m2'),
  kdigoInstable: ref('KDIGO-2024-CKD', 'PP 4.2.5', 'Consider and adapt drug dosing in people where GFR … [is] not in a steady state'),
  hasInstable: ref('HAS-2023-guide-MRC', 'p. 23-24', "l'adaptation des posologies devrait s'effectuer en milieu spécialisé à partir du dosage des médicaments ou de la mesure du DFG"),
  kdigoTable10: ref('KDIGO-2024-CKD', 'Table 10', 'catabolic states, such as serious infections or inflammatory states'),
  fdaPoidsObese: ref('FDA-2024-PK-insuffisance-renale', '§ IV.A, p. 6', 'use of alternative body weight metrics such as ideal body weight (IBW) or adjusted body weight (ABW)'),
} as const;

/* ------------------------------------------------------------------ */
/* Unités et plausibilité                                              */
/* ------------------------------------------------------------------ */

/** 1 mg/dL de créatinine = 88,4 µmol/L. */
export const FACTEUR_CREATININE = 88.4;

export function creatinineEnMgDl(valeur: number, unite: UniteCreatinine): number {
  return unite === 'mg/dL' ? valeur : valeur / FACTEUR_CREATININE;
}
export function creatinineEnUmolL(valeur: number, unite: UniteCreatinine): number {
  return unite === 'umol/L' ? valeur : valeur * FACTEUR_CREATININE;
}

/**
 * Bornes de plausibilité de la créatininémie selon l'unité (adulte). Hors bornes, l'unité est très
 * probablement erronée (ex. 1,2 saisi en µmol/L au lieu de mg/dL) : la valeur n'est pas utilisée, et
 * l'unité n'est jamais corrigée d'après la valeur. µmol/L : 15 à 2 500 ; mg/dL : 0,17 à 28,3.
 */
export const BORNES_CREATININE = { 'umol/L': { min: 15, max: 2500 }, 'mg/dL': { min: 0.17, max: 28.3 } } as const;
/** Bornes de plausibilité (choix de l'application, non sourcé) : au-delà, la valeur est à vérifier. */
export const BORNES_POIDS = { min: 25, max: 300 } as const;
export const BORNES_TAILLE = { min: 120, max: 230 } as const;

export function creatininePlausible(valeur: number, unite: UniteCreatinine): { plausible: boolean; raison?: string } {
  if (!Number.isFinite(valeur) || valeur <= 0) return { plausible: false, raison: 'valeur nulle, négative ou non numérique' };
  const b = BORNES_CREATININE[unite];
  const u = unite === 'umol/L' ? 'µmol/L' : 'mg/dL';
  if (valeur < b.min || valeur > b.max) {
    const autre = unite === 'umol/L' ? 'mg/dL' : 'µmol/L';
    return { plausible: false, raison: `${nombreFr(valeur, 2)} ${u} est hors des valeurs plausibles (${nombreFr(b.min, 2)} à ${nombreFr(b.max, 2)} ${u}) ; s'agit-il de ${autre} ?` };
  }
  return { plausible: true };
}

/* ------------------------------------------------------------------ */
/* Formules                                                            */
/* ------------------------------------------------------------------ */

/**
 * Cockcroft-Gault : ClCr (mL/min) = (140 − âge) × poids / (72 × créatininémie en mg/dL), × 0,85 chez la femme.
 * Poids réel, comme dans la formule citée par le RCP de la vancomycine. Non indexée à la surface corporelle.
 */
export function cockcroftGault(params: { ageAns: number; poidsKg: number; creatinine: number; unite: UniteCreatinine; sexe: 'femme' | 'homme' }): number {
  const creatMgDl = creatinineEnMgDl(params.creatinine, params.unite);
  if (!(creatMgDl > 0) || !(params.poidsKg > 0) || params.ageAns >= 140) return NaN;
  const base = ((140 - params.ageAns) * params.poidsKg) / (72 * creatMgDl);
  return params.sexe === 'femme' ? base * 0.85 : base;
}

/**
 * CKD-EPI 2021 (créatinine seule, sans variable ethnique) :
 * DFGe = 142 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^−1,200 × 0,9938^âge × 1,012 [femme] ;
 * κ = 0,7 (femme) / 0,9 (homme) ; α = −0,241 (femme) / −0,302 (homme) ; Scr en mg/dL ; mL/min/1,73 m².
 */
export function ckdEpi2021(params: { ageAns: number; creatinine: number; unite: UniteCreatinine; sexe: 'femme' | 'homme' }): number {
  const scr = creatinineEnMgDl(params.creatinine, params.unite);
  if (!(scr > 0)) return NaN;
  const femme = params.sexe === 'femme';
  const kappa = femme ? 0.7 : 0.9;
  const alpha = femme ? -0.241 : -0.302;
  const ratio = scr / kappa;
  return 142 * Math.pow(Math.min(ratio, 1), alpha) * Math.pow(Math.max(ratio, 1), -1.2) * Math.pow(0.9938, params.ageAns) * (femme ? 1.012 : 1);
}

/**
 * CKD-EPI 2009 sans coefficient racial (le facteur 1,159 n'est jamais appliqué) :
 * DFGe = 141 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^−1,209 × 0,993^âge × 1,018 [femme] ; α = −0,329 (F) / −0,411 (H).
 */
export function ckdEpi2009(params: { ageAns: number; creatinine: number; unite: UniteCreatinine; sexe: 'femme' | 'homme' }): number {
  const scr = creatinineEnMgDl(params.creatinine, params.unite);
  if (!(scr > 0)) return NaN;
  const femme = params.sexe === 'femme';
  const kappa = femme ? 0.7 : 0.9;
  const alpha = femme ? -0.329 : -0.411;
  const ratio = scr / kappa;
  return 141 * Math.pow(Math.min(ratio, 1), alpha) * Math.pow(Math.max(ratio, 1), -1.209) * Math.pow(0.993, params.ageAns) * (femme ? 1.018 : 1);
}

/**
 * EKFC (adulte de plus de 25 ans ; Q dépend de l'âge avant 25 ans, non implémenté) :
 * DFGe = 107,3 × (Scr/Q)^−0,322 si Scr/Q < 1, sinon 107,3 × (Scr/Q)^−1,132 ; × 0,990^(âge − 40) si âge > 40 ;
 * Q = 80 µmol/L (homme), 62 µmol/L (femme), calcul en µmol/L comme le calculateur de référence.
 */
export function ekfc(params: { ageAns: number; creatinine: number; unite: UniteCreatinine; sexe: 'femme' | 'homme' }): number {
  const scr = creatinineEnUmolL(params.creatinine, params.unite);
  if (!(scr > 0) || params.ageAns <= 25) return NaN;
  const q = params.sexe === 'femme' ? 62 : 80;
  const r = scr / q;
  return 107.3 * Math.pow(r, r < 1 ? -0.322 : -1.132) * (params.ageAns > 40 ? Math.pow(0.99, params.ageAns - 40) : 1);
}

export type EquationDFG = 'ckd_epi_2009' | 'ckd_epi_2021' | 'ekfc';
export const EQUATION_DFG_PAR_DEFAUT: EquationDFG = 'ckd_epi_2009';
export const EQUATIONS_DFG: Record<EquationDFG, { formule: string; version: string; calcul: typeof ckdEpi2021; sources: SourceRef[] }> = {
  ckd_epi_2009: { formule: 'CKD-EPI créatinine', version: '2009, sans coefficient racial', calcul: ckdEpi2009, sources: [...SOURCES_RENALES.ckdEpi2009, SOURCES_RENALES.kdigoEquation] },
  ckd_epi_2021: { formule: 'CKD-EPI créatinine', version: '2021 (sans variable raciale)', calcul: ckdEpi2021, sources: [...SOURCES_RENALES.ckdEpi2021, SOURCES_RENALES.kdigoEquation] },
  ekfc: { formule: 'EKFC', version: '2021 (Q adulte : 80 µmol/L H, 62 µmol/L F)', calcul: ekfc, sources: [...SOURCES_RENALES.ekfc] },
};

/** Surface corporelle de Du Bois (formule citée par la HAS) : 0,007184 × poids^0,425 × taille^0,725 (kg, cm). */
export function surfaceCorporelleDuBois(poidsKg: number, tailleCm: number): number {
  return 0.007184 * Math.pow(poidsKg, 0.425) * Math.pow(tailleCm, 0.725);
}

/** Désindexation : DFG (mL/min) = DFG indexé × SC / 1,73. */
export function desindexer(dfgIndexe: number, surfaceM2: number): number {
  return (dfgIndexe * surfaceM2) / 1.73;
}

/** Poids idéal (Devine) : homme 50 + 0,9 × (taille cm − 152) ; femme 45,5 + 0,9 × (taille cm − 152). */
export function poidsIdealDevine(tailleCm: number, sexe: 'femme' | 'homme'): number {
  const base = sexe === 'femme' ? 45.5 : 50;
  return base + 0.9 * (tailleCm - 152);
}

/**
 * Poids idéal de Lorentz, formule citée par le RCP de la gentamicine (Panpharma, §4.2) :
 * homme = T − 100 − (T − 150)/4 ; femme = T − 100 − (T − 150)/2 (taille en cm, adulte, 140-220 cm).
 */
export function poidsIdealLorentz(tailleCm: number, sexe: 'femme' | 'homme'): number {
  return tailleCm - 100 - (tailleCm - 150) / (sexe === 'femme' ? 2 : 4);
}

/** Poids ajusté = PI + k × (poids réel − PI). k = 0,43 (RCP gentamicine), 0,40 (RCP amikacine) ; 0,4 par défaut. */
export function poidsAjuste(poidsReelKg: number, poidsIdealKg: number, k = 0.4): number {
  return poidsIdealKg + k * (poidsReelKg - poidsIdealKg);
}

export function arrondi(valeur: number, decimales = 0): number {
  const f = Math.pow(10, decimales);
  return Math.round(valeur * f) / f;
}

/* ------------------------------------------------------------------ */
/* Estimations                                                         */
/* ------------------------------------------------------------------ */

export type IdEstimation = 'dfg_indexe' | 'dfg_desindexe' | 'clairance_cg';
export type UniteRenale = 'mL/min/1,73 m²' | 'mL/min';

export interface Estimation {
  id: IdEstimation;
  libelle: string;
  grandeur: 'dfg' | 'clairance_creatinine';
  unite: UniteRenale;
  formule: string;
  version: string;
  valeur?: number;
  calculable: boolean;
  /** Données requises absentes ou invalides. */
  manquants: string[];
  /** Données utilisées (avec leur valeur). */
  donnees: string[];
  /** Détail pas à pas du calcul. */
  calcul: string[];
  limites: string[];
  sources: SourceRef[];
}

export interface ValeurLabo {
  valeur: number;
  unite: UniteRenale | 'inconnue';
  methode: MethodeDFG;
  date?: string;
  libelle: string;
  limites: string[];
}

export interface EntreesRenales {
  ageAns?: number;
  poidsKg?: number;
  tailleCm?: number;
  sexe: 'femme' | 'homme' | 'inconnu';
  creatinine?: { valeur: number; unite?: UniteCreatinine; date?: string; heure?: string };
  /** Valeur rendue par le laboratoire (ou déjà calculée), conservée avec sa méthode, son unité et sa date. */
  dfg?: { valeur: number; methode: MethodeDFG; unite?: UniteRenale; date?: string };
  stabilite: 'stable' | 'instable' | 'inconnu';
  insuffisanceRenaleAigue: 'oui' | 'non' | 'inconnu';
  dialyse: 'aucune' | 'hemodialyse_intermittente' | 'eer_continue' | 'dialyse_peritoneale' | 'inconnu';
  /** Équation du DFG (par défaut CKD-EPI 2009 sans coefficient racial) : choisir celle du laboratoire. */
  equation?: EquationDFG;
  /** Poids de Cockcroft-Gault : réel (formule des RCP) par défaut ; idéal ou ajusté au choix explicite (obésité). */
  poidsCockcroft?: 'reel' | 'ideal' | 'ajuste';
  /** Infection grave (sepsis, choc) : état catabolique, limite des équations (KDIGO 2024, Table 10). */
  infectionGrave?: boolean;
  grossesse?: boolean;
  /** Date de référence (contrôle des dates futures). */
  maintenant?: Date;
}

export interface EstimationRenale {
  /** Toujours les trois estimations, calculables ou non. */
  estimations: Estimation[];
  labo?: ValeurLabo;
  surfaceCorporelle?: number;
  creatinine?: { mgDl: number; umolL: number; saisie: string; date?: string; heure?: string };
  etat: 'equilibre' | 'equilibre_non_confirme' | 'instable' | 'dialyse' | 'hors_domaine';
  /** Faux si dialyse, IRA, instabilité ou hors domaine : aucune estimation ne personnalise automatiquement une dose. */
  applicable: boolean;
  raisonNonApplicable?: string;
  limites: string[];
  manquants: string[];
  incoherences: { texte: string; cible: string }[];
}

const DIALYSE_ACTIVE = ['hemodialyse_intermittente', 'eer_continue', 'dialyse_peritoneale'];
const LIBELLE_UNITE_CREAT: Record<UniteCreatinine, string> = { 'umol/L': 'µmol/L', 'mg/dL': 'mg/dL' };

export function estimation(renal: EstimationRenale, id: IdEstimation): Estimation {
  return renal.estimations.find((e) => e.id === id)!;
}

export function estimerFonctionRenale(e: EntreesRenales): EstimationRenale {
  const res: EstimationRenale = { estimations: [], etat: 'equilibre', applicable: true, limites: [], manquants: [], incoherences: [] };
  const sexe = e.sexe === 'femme' || e.sexe === 'homme' ? e.sexe : undefined;

  /* --- Contrôles de cohérence des données (jamais de correction silencieuse). */
  let creatValide = false;
  const c = e.creatinine;
  if (c) {
    if (!c.unite) {
      res.manquants.push('unité de la créatininémie (µmol/L ou mg/dL)');
    } else {
      const v = creatininePlausible(c.valeur, c.unite);
      if (!v.plausible) res.incoherences.push({ texte: `Créatininémie non utilisée : ${v.raison}. Vérifier la valeur et l'unité.`, cible: 'patient.renal.creatinine' });
      else creatValide = true;
    }
    if (c.date && e.maintenant) {
      const d = new Date(`${c.date}T${c.heure ?? '00:00'}`);
      if (!Number.isNaN(d.getTime()) && d.getTime() > e.maintenant.getTime() + 60_000)
        res.incoherences.push({ texte: `Date de la créatininémie (${c.date}${c.heure ? ` ${c.heure}` : ''}) postérieure à maintenant : vérifier la date.`, cible: 'patient.renal.creatinine' });
    }
    if (!c.date) res.limites.push('Date de la créatininémie non renseignée : impossible de savoir si la valeur est récente.');
  }
  const poidsOk = e.poidsKg !== undefined && e.poidsKg >= BORNES_POIDS.min && e.poidsKg <= BORNES_POIDS.max;
  const tailleOk = e.tailleCm !== undefined && e.tailleCm >= BORNES_TAILLE.min && e.tailleCm <= BORNES_TAILLE.max;
  if (e.poidsKg !== undefined && !poidsOk) res.incoherences.push({ texte: `Poids de ${nombreFr(e.poidsKg, 1)} kg hors des valeurs plausibles (${BORNES_POIDS.min} à ${BORNES_POIDS.max} kg) : vérifier la saisie.`, cible: 'patient.poidsKg' });
  if (e.tailleCm !== undefined && !tailleOk) res.incoherences.push({ texte: `Taille de ${nombreFr(e.tailleCm, 0)} cm hors des valeurs plausibles (${BORNES_TAILLE.min} à ${BORNES_TAILLE.max} cm) : vérifier la saisie (en centimètres).`, cible: 'patient.tailleCm' });
  if (e.ageAns !== undefined && (e.ageAns < 0 || e.ageAns > 120)) res.incoherences.push({ texte: `Âge de ${e.ageAns} ans implausible : vérifier la saisie.`, cible: 'patient.age' });

  /* --- Domaine de validité. */
  if (DIALYSE_ACTIVE.includes(e.dialyse)) {
    res.etat = 'dialyse';
    res.applicable = false;
    res.raisonNonApplicable = "patient dialysé ou sous épuration extrarénale : les estimations à partir de la créatininémie ne s'appliquent pas ; la posologie suit les règles propres à la modalité d'épuration.";
  } else if (e.insuffisanceRenaleAigue === 'oui' || e.stabilite === 'instable') {
    res.etat = 'instable';
    res.applicable = false;
    res.raisonNonApplicable =
      "fonction rénale instable ou insuffisance rénale aiguë : les équations supposent une créatininémie à l'état d'équilibre ; leur résultat n'est pas une mesure fiable et n'est pas utilisé pour personnaliser la dose.";
  } else if (e.ageAns !== undefined && e.ageAns < 18) {
    res.etat = 'hors_domaine';
    res.applicable = false;
    res.raisonNonApplicable = "patient de moins de 18 ans : équations établies chez l'adulte, hors du périmètre de l'application.";
  } else if (e.stabilite === 'inconnu') {
    res.etat = 'equilibre_non_confirme';
    res.limites.push("Stabilité de la fonction rénale non renseignée : les estimations supposent un état d'équilibre.");
  }
  if (e.dialyse === 'inconnu') res.manquants.push('dialyse / épuration extrarénale (oui/non)');

  /* --- Créatininémie retenue. */
  const unite = c?.unite;
  if (c && unite && creatValide) {
    const saisie = `${nombreFr(c.valeur, unite === 'mg/dL' ? 2 : 0)} ${LIBELLE_UNITE_CREAT[unite]}`;
    res.creatinine = { mgDl: creatinineEnMgDl(c.valeur, unite), umolL: creatinineEnUmolL(c.valeur, unite), saisie, date: c.date, heure: c.heure };
  } else if (!c) res.manquants.push('créatininémie (avec unité et date)');

  if (poidsOk && tailleOk) res.surfaceCorporelle = surfaceCorporelleDuBois(e.poidsKg!, e.tailleCm!);
  const cr = res.creatinine;
  const dateCr = cr?.date ? ` du ${cr.date}${cr.heure ? ` à ${cr.heure}` : ''}` : ' (date non renseignée)';
  const donneeCreat = cr ? `créatininémie ${cr.saisie}${unite === 'umol/L' ? ` (= ${nombreFr(cr.mgDl, 2)} mg/dL)` : ''}${dateCr}` : '';
  const limitesCommunes: string[] = [];
  if (res.etat === 'instable') limitesCommunes.push(`Non valide : ${res.raisonNonApplicable}`);
  if (res.etat === 'hors_domaine') limitesCommunes.push(`Non valide : ${res.raisonNonApplicable}`);
  if (res.etat === 'equilibre_non_confirme') limitesCommunes.push("Valable seulement si la créatininémie est stable (état d'équilibre).");
  const imc = poidsOk && tailleOk ? e.poidsKg! / Math.pow(e.tailleCm! / 100, 2) : undefined;
  if (imc !== undefined && imc < 18.5) limitesCommunes.push(`IMC ${nombreFr(imc, 1)} kg/m² : masse musculaire probablement faible, la créatininémie surestime le DFG (limite citée pour IMC < 18).`);
  if (imc !== undefined && imc >= 40) limitesCommunes.push(`IMC ${nombreFr(imc, 1)} kg/m² : obésité de classe III, situation où la KDIGO 2024 (Table 8) suggère la cystatine C.`);
  if (e.infectionGrave) limitesCommunes.push('Infection grave (sepsis, choc) : état catabolique où la KDIGO 2024 (Table 10) indique une mesure du DFG ; estimation à interpréter avec prudence et à réévaluer.');
  if (e.grossesse) limitesCommunes.push('Grossesse : la créatininémie baisse physiologiquement et la surface corporelle varie ; les équations sont difficiles à utiliser (KDIGO 2024, § 4.2).');

  /* --- 1. DFG estimé indexé (CKD-EPI 2021). */
  const eq = e.equation ?? EQUATION_DFG_PAR_DEFAUT;
  const def = EQUATIONS_DFG[eq];
  const indexe: Estimation = {
    id: 'dfg_indexe',
    libelle: 'DFG estimé indexé',
    grandeur: 'dfg',
    unite: 'mL/min/1,73 m²',
    formule: def.formule,
    version: def.version,
    calculable: false,
    manquants: [],
    donnees: [],
    calcul: [],
    limites: [...limitesCommunes],
    sources: [...def.sources, SOURCES_RENALES.hasCkdEpi],
  };
  if (eq === 'ekfc' && e.ageAns !== undefined && e.ageAns <= 25) indexe.manquants.push('EKFC : âge > 25 ans requis (Q dépend de l’âge avant 25 ans, non implémenté) — choisir CKD-EPI');
  if (res.etat === 'dialyse') indexe.manquants.push('non applicable (dialyse)');
  if (!cr) indexe.manquants.push(c && !unite ? 'unité de la créatininémie' : c ? 'créatininémie plausible' : 'créatininémie');
  if (e.ageAns === undefined) indexe.manquants.push('âge');
  if (!sexe) indexe.manquants.push('variable de sexe de l’équation (femme/homme)');
  if (indexe.manquants.length === 0 && cr && e.ageAns !== undefined && sexe && res.etat !== 'hors_domaine') {
    indexe.valeur = def.calcul({ ageAns: e.ageAns, creatinine: cr.mgDl, unite: 'mg/dL', sexe });
    indexe.calculable = Number.isFinite(indexe.valeur);
    indexe.donnees = [`âge ${e.ageAns} ans`, `sexe (variable de l'équation) : ${sexe}`, donneeCreat];
    const f = sexe === 'femme';
    const q = f ? 62 : 80;
    const etape =
      eq === 'ckd_epi_2009'
        ? [`κ = ${f ? '0,7' : '0,9'} ; α = ${f ? '−0,329' : '−0,411'}`, `DFGe = 141 × min(Scr/κ ; 1)^α × max(Scr/κ ; 1)^−1,209 × 0,993^${e.ageAns}${f ? ' × 1,018' : ''} (coefficient racial non appliqué)`]
        : eq === 'ckd_epi_2021'
          ? [`κ = ${f ? '0,7' : '0,9'} ; α = ${f ? '−0,241' : '−0,302'}`, `DFGe = 142 × min(Scr/κ ; 1)^α × max(Scr/κ ; 1)^−1,200 × 0,9938^${e.ageAns}${f ? ' × 1,012' : ''}`]
          : [`Q = ${q} µmol/L ; Scr/Q = ${nombreFr(cr.umolL / q, 3)}`, `DFGe = 107,3 × (Scr/Q)^${cr.umolL / q < 1 ? '−0,322' : '−1,132'}${e.ageAns > 40 ? ` × 0,990^(${e.ageAns} − 40)` : ''}`];
    indexe.calcul = [
      ...(unite === 'umol/L' ? [`Scr = ${nombreFr(cr.umolL, 0)} / 88,4 = ${nombreFr(cr.mgDl, 3)} mg/dL`] : [`Scr = ${nombreFr(cr.mgDl, 3)} mg/dL (= ${nombreFr(cr.umolL, 0)} µmol/L)`]),
      ...etape,
      `= ${nombreFr(indexe.valeur, 1)} mL/min/1,73 m²`,
    ];
    if (e.ageAns >= 75) indexe.limites.push('Sujet âgé : précision moindre des équations (masse musculaire variable).');
  }

  /* --- 2. DFG estimé désindexé (× SC Du Bois / 1,73). */
  const des: Estimation = {
    id: 'dfg_desindexe',
    libelle: 'DFG estimé désindexé',
    grandeur: 'dfg',
    unite: 'mL/min',
    formule: `${def.formule} × surface corporelle (Du Bois) / 1,73`,
    version: `${def.version} ; Du Bois et Du Bois (1916)`,
    calculable: false,
    manquants: [...indexe.manquants],
    donnees: [],
    calcul: [],
    limites: [...limitesCommunes],
    sources: [SOURCES_RENALES.hasDesindexation, SOURCES_RENALES.duBois, SOURCES_RENALES.kdigoDesindexe, SOURCES_RENALES.emaDesindexe],
  };
  if (e.poidsKg === undefined) des.manquants.push('poids (surface corporelle)');
  else if (!poidsOk) des.manquants.push('poids plausible');
  if (e.tailleCm === undefined) des.manquants.push('taille (surface corporelle)');
  else if (!tailleOk) des.manquants.push('taille plausible');
  if (indexe.calculable && res.surfaceCorporelle !== undefined) {
    des.valeur = desindexer(indexe.valeur!, res.surfaceCorporelle);
    des.calculable = Number.isFinite(des.valeur);
    des.donnees = [...indexe.donnees, `poids ${nombreFr(e.poidsKg!, 1)} kg`, `taille ${nombreFr(e.tailleCm!, 0)} cm`];
    des.calcul = [
      `SC (Du Bois) = 0,007184 × ${nombreFr(e.poidsKg!, 1)}^0,425 × ${nombreFr(e.tailleCm!, 0)}^0,725 = ${nombreFr(res.surfaceCorporelle, 2)} m²`,
      `DFG désindexé = ${nombreFr(indexe.valeur!, 1)} × ${nombreFr(res.surfaceCorporelle, 2)} / 1,73 = ${nombreFr(des.valeur, 1)} mL/min`,
    ];
    if (Math.abs(res.surfaceCorporelle - 1.73) < 0.1) des.limites.push(`Surface corporelle proche de 1,73 m² (${nombreFr(res.surfaceCorporelle, 2)} m²) : valeurs indexée et désindexée voisines.`);
  }

  /* --- 3. Clairance estimée de la créatinine (Cockcroft-Gault). */
  const cg: Estimation = {
    id: 'clairance_cg',
    libelle: 'Clairance estimée de la créatinine',
    grandeur: 'clairance_creatinine',
    unite: 'mL/min',
    formule: 'Cockcroft-Gault',
    version: `1976, poids ${e.poidsCockcroft === 'ideal' ? 'idéal (Devine)' : e.poidsCockcroft === 'ajuste' ? 'ajusté (idéal + 0,4 × excès)' : 'réel'}`,
    calculable: false,
    manquants: [...indexe.manquants],
    donnees: [],
    calcul: [],
    limites: [...limitesCommunes, "Formule non réévaluée avec les dosages standardisés de la créatinine ; la HAS (2023) ne la recommande plus pour estimer la fonction rénale."],
    sources: [...SOURCES_RENALES.cockcroft],
  };
  if (e.poidsKg === undefined) cg.manquants.push('poids');
  else if (!poidsOk) cg.manquants.push('poids plausible');
  const choixPoids = e.poidsCockcroft ?? 'reel';
  if (choixPoids !== 'reel' && !tailleOk) cg.manquants.push('taille (poids idéal ou ajusté)');
  if (cg.manquants.length === 0 && cr && e.ageAns !== undefined && sexe && res.etat !== 'hors_domaine') {
    const pi = tailleOk ? poidsIdealDevine(e.tailleCm!, sexe) : undefined;
    const poidsCG = choixPoids === 'ideal' ? Math.min(pi!, e.poidsKg!) : choixPoids === 'ajuste' ? (e.poidsKg! > pi! ? poidsAjuste(e.poidsKg!, pi!, 0.4) : e.poidsKg!) : e.poidsKg!;
    const nomPoids = choixPoids === 'ideal' ? 'poids idéal (Devine)' : choixPoids === 'ajuste' ? 'poids ajusté (idéal Devine + 0,4 × excès)' : 'poids réel';
    cg.valeur = cockcroftGault({ ageAns: e.ageAns, poidsKg: poidsCG, creatinine: cr.mgDl, unite: 'mg/dL', sexe });
    cg.calculable = Number.isFinite(cg.valeur);
    cg.donnees = [`âge ${e.ageAns} ans`, `sexe (variable de l'équation) : ${sexe}`, `${nomPoids} ${nombreFr(poidsCG, 1)} kg${choixPoids !== 'reel' ? ` (poids réel ${nombreFr(e.poidsKg!, 1)} kg)` : ''}`, donneeCreat];
    cg.calcul = [
      ...(unite === 'umol/L' ? [`créatininémie = ${nombreFr(cr.umolL, 0)} / 88,4 = ${nombreFr(cr.mgDl, 3)} mg/dL`] : []),
      ...(choixPoids !== 'reel' ? [`poids idéal (Devine) = ${nombreFr(pi!, 1)} kg → ${nomPoids} = ${nombreFr(poidsCG, 1)} kg`] : []),
      `ClCr = (140 − ${e.ageAns}) × ${nombreFr(poidsCG, 1)} / (72 × ${nombreFr(cr.mgDl, 3)})${sexe === 'femme' ? ' × 0,85' : ''}`,
      `= ${nombreFr(cg.valeur, 1)} mL/min`,
    ];
    if (choixPoids !== 'reel') {
      cg.limites.push('Poids idéal ou ajusté choisi par l’utilisateur : les RCP citent « poids (kg) » sans qualificatif ; la FDA (2024) juge ces poids plus exacts chez la personne obèse. Facteur 0,4 du poids ajusté : choix de l’application.');
      cg.sources.push(SOURCES_RENALES.fdaPoidsObese);
    }
    if (imc !== undefined && imc >= 30 && choixPoids === 'reel')
      cg.limites.push(`Obésité (IMC ${nombreFr(imc, 1)} kg/m²) : le poids de Cockcroft-Gault diverge selon les sources (réel dans la formule des RCP ; idéal ou ajusté selon la FDA 2024) ; ce choix se modifie dans la saisie.`);
  }
  res.estimations = [indexe, des, cg];

  /* --- Valeur fournie par le laboratoire : conservée telle quelle, distincte du calcul de l'application. */
  if (e.dfg && Number.isFinite(e.dfg.valeur) && e.dfg.valeur > 0) {
    const u: UniteRenale | 'inconnue' = e.dfg.unite ?? (e.dfg.methode === 'Cockcroft' ? 'mL/min' : 'inconnue');
    const lim: string[] = [];
    if (u === 'inconnue') lim.push('Unité non précisée : la valeur n’est pas utilisée pour adapter une dose.');
    if (!e.dfg.date) lim.push('Date non renseignée.');
    if (e.dfg.methode === 'inconnue') lim.push('Méthode inconnue : la valeur n’est pas utilisée pour adapter une dose.');
    const calcule = e.dfg.methode === 'CKD-EPI' ? indexe : e.dfg.methode === 'Cockcroft' ? cg : undefined;
    if (calcule?.calculable && calcule.valeur && Math.abs(calcule.valeur - e.dfg.valeur) / calcule.valeur > 0.15)
      lim.push(`Écart de plus de 15 % avec le calcul de l'application (${nombreFr(calcule.valeur, 0)} ${calcule.unite}) : vérifier la date de la créatininémie, l'unité ou la version de l'équation.`);
    res.labo = { valeur: e.dfg.valeur, unite: u, methode: e.dfg.methode, date: e.dfg.date, libelle: `Valeur fournie (${e.dfg.methode === 'inconnue' ? 'méthode inconnue' : e.dfg.methode})`, limites: lim };
  }

  if (!poidsOk && e.poidsKg === undefined && cr) res.manquants.push('poids (nécessaire à Cockcroft-Gault et à la désindexation)');
  if (e.ageAns === undefined && cr) res.manquants.push('âge');
  if (!sexe && cr) res.manquants.push('variable de sexe des équations (femme/homme)');
  return res;
}

/* ------------------------------------------------------------------ */
/* Choix de l'estimation pour une référence posologique                */
/* ------------------------------------------------------------------ */

export interface ChoixEstimation {
  /** Valeur utilisée pour situer le patient dans les paliers ; absente si aucune ne peut l'être automatiquement. */
  valeur?: number;
  unite?: UniteRenale;
  /** Libellé de l'estimation utilisée : nom, formule, valeur, unité. */
  libelle?: string;
  pourquoi: string;
  sources: SourceRef[];
  /** Méthode de substitution (la référence demande une autre formule, non calculable). */
  substitution?: string;
  /** Deux estimations recevables conduisant à des paliers différents. */
  discordance?: string;
  /** Pourquoi aucune estimation n'est utilisée automatiquement. */
  refus?: string;
  manquants: string[];
}

/** Union de listes de données manquantes, sans doublon de même donnée (« poids » et « poids (surface corporelle) »). */
function unir(...listes: string[][]): string[] {
  const res: string[] = [];
  for (const m of listes.flat()) {
    const base = m.split(' (')[0];
    if (!res.some((x) => x.split(' (')[0] === base)) res.push(m);
  }
  return res;
}

function txt(e: Estimation): string {
  return `${e.libelle} (${e.formule}) ≈ ${nombreFr(e.valeur!, 0)} ${e.unite}`;
}

/**
 * Choisit l'estimation adaptée à la grandeur exigée par la référence posologique de la molécule.
 * Ne substitue jamais une valeur indexée (mL/min/1,73 m²) à des paliers en mL/min, ni l'inverse.
 * @param palierDe fonction qui situe une valeur dans les paliers de la molécule (pour détecter une discordance).
 */
export function choisirEstimation(renal: EstimationRenale, refM: ReferenceRenale, palierDe?: (v: number) => number): ChoixEstimation {
  const ind = estimation(renal, 'dfg_indexe');
  const des = estimation(renal, 'dfg_desindexe');
  const cg = estimation(renal, 'clairance_cg');
  const srcRef = refM.sources;
  const labo = renal.labo;
  if (!renal.applicable) return { pourquoi: '', sources: srcRef, refus: renal.raisonNonApplicable, manquants: [] };

  if (refM.unite === 'mL/min/1,73 m²') {
    const pourquoi = 'la référence posologique exprime ses paliers en mL/min/1,73 m² (valeur indexée) : le DFG estimé indexé est utilisé, sans désindexation.';
    if (ind.calculable) return { valeur: ind.valeur, unite: ind.unite, libelle: txt(ind), pourquoi, sources: [...srcRef, ...ind.sources], manquants: [] };
    if (labo && labo.unite === 'mL/min/1,73 m²' && labo.methode !== 'inconnue')
      return { valeur: labo.valeur, unite: 'mL/min/1,73 m²', libelle: `${labo.libelle} ≈ ${nombreFr(labo.valeur, 0)} mL/min/1,73 m²`, pourquoi: `${pourquoi} Valeur fournie par le laboratoire, faute de calcul possible.`, sources: srcRef, manquants: [] };
    return { pourquoi, sources: srcRef, refus: `DFG estimé indexé non calculable (${ind.manquants.join(', ')}).`, manquants: ind.manquants };
  }

  if (refM.grandeur === 'dfg') {
    const pourquoi = 'la référence posologique exprime ses paliers en DFG (mL/min) : le DFG estimé désindexé est utilisé (désindexation recommandée par la HAS pour adapter une posologie).';
    if (des.calculable) return { valeur: des.valeur, unite: 'mL/min', libelle: txt(des), pourquoi, sources: [...srcRef, ...des.sources], manquants: [] };
    if (labo && labo.unite === 'mL/min' && labo.methode !== 'inconnue' && labo.methode !== 'Cockcroft')
      return { valeur: labo.valeur, unite: 'mL/min', libelle: `${labo.libelle} ≈ ${nombreFr(labo.valeur, 0)} mL/min`, pourquoi: `${pourquoi} Valeur fournie, faute de calcul possible.`, sources: srcRef, manquants: [] };
    return { pourquoi, sources: [...srcRef, SOURCES_RENALES.hasDesindexation], refus: `DFG désindexé non calculable (${des.manquants.join(', ')}) ; le DFG indexé n'est pas utilisé à la place.`, manquants: des.manquants };
  }

  // Clairance de la créatinine en mL/min.
  if (refM.formuleCitee === 'cockcroft_gault') {
    const pourquoi = 'la référence posologique cite la formule de Cockcroft-Gault pour ses paliers de clairance.';
    if (cg.calculable) return { valeur: cg.valeur, unite: 'mL/min', libelle: txt(cg), pourquoi, sources: [...srcRef, ...cg.sources], manquants: [] };
    if (labo && labo.methode === 'Cockcroft' && labo.unite === 'mL/min') return { valeur: labo.valeur, unite: 'mL/min', libelle: `${labo.libelle} ≈ ${nombreFr(labo.valeur, 0)} mL/min`, pourquoi, sources: srcRef, manquants: [] };
    if (des.calculable)
      return {
        valeur: des.valeur,
        unite: 'mL/min',
        libelle: txt(des),
        pourquoi,
        substitution: `Cockcroft-Gault non calculable (${cg.manquants.join(', ')}) : DFG estimé désindexé utilisé à la place, comme le recommande la HAS pour adapter les posologies. Les deux grandeurs ne sont pas équivalentes : vérifier dès que le poids est connu.`,
        sources: [...srcRef, SOURCES_RENALES.hasCkdEpi, ...des.sources],
        manquants: cg.manquants,
      };
    return { pourquoi, sources: srcRef, refus: `ni la clairance de Cockcroft-Gault (${cg.manquants.join(', ')}) ni le DFG désindexé (${des.manquants.join(', ')}) ne sont calculables.`, manquants: unir(cg.manquants, des.manquants) };
  }

  // Clairance sans formule précisée : HAS (CKD-EPI désindexé) et usage historique (Cockcroft-Gault) divergent.
  const pourquoi =
    'la référence exprime ses paliers en clairance de la créatinine (mL/min) sans préciser la formule ; la HAS recommande le DFG CKD-EPI désindexé, les RCP qui citent une formule utilisent Cockcroft-Gault : les deux estimations recevables sont comparées.';
  const srcDiv = [...srcRef, SOURCES_RENALES.hasCkdEpi, SOURCES_RENALES.hasDesindexation];
  if (cg.calculable && des.calculable) {
    if (palierDe && palierDe(cg.valeur!) !== palierDe(des.valeur!))
      return {
        pourquoi,
        sources: [...srcDiv, ...cg.sources],
        discordance: `${txt(cg)} et ${txt(des)} situent le patient dans des paliers différents : pas de choix automatique.`,
        refus: 'les deux estimations recevables conduisent à des adaptations différentes ; décision avec le pharmacien ou le néphrologue, et dosage plasmatique si la molécule est dosable.',
        manquants: [],
      };
    return { valeur: des.valeur, unite: 'mL/min', libelle: `${txt(des)} ; ${txt(cg)} (même palier)`, pourquoi, sources: [...srcDiv, ...cg.sources], manquants: [] };
  }
  if (des.calculable) return { valeur: des.valeur, unite: 'mL/min', libelle: txt(des), pourquoi: `${pourquoi} Seul le DFG désindexé est calculable.`, sources: srcDiv, manquants: cg.manquants };
  if (cg.calculable) return { valeur: cg.valeur, unite: 'mL/min', libelle: txt(cg), pourquoi: `${pourquoi} Seule la clairance de Cockcroft-Gault est calculable (taille manquante pour le DFG désindexé).`, sources: [...srcRef, ...cg.sources], manquants: des.manquants };
  if (labo && labo.unite === 'mL/min' && labo.methode !== 'inconnue') return { valeur: labo.valeur, unite: 'mL/min', libelle: `${labo.libelle} ≈ ${nombreFr(labo.valeur, 0)} mL/min`, pourquoi: `${pourquoi} Valeur fournie, faute de calcul possible.`, sources: srcRef, manquants: [] };
  return { pourquoi, sources: srcRef, refus: `aucune estimation en mL/min n'est calculable (${unir(cg.manquants, des.manquants).join(', ')}) ; une valeur indexée n'est pas utilisée à la place.`, manquants: unir(cg.manquants, des.manquants) };
}
