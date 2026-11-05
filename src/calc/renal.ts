/**
 * Calculs physiologiques : fonction rénale, surface corporelle, poids de référence.
 * Les formules sont documentées avec leurs limites ; aucune valeur n'est inventée
 * quand une donnée manque (retour `undefined` + explication).
 */

export interface EstimationRenale {
  /** Clairance de la créatinine (Cockcroft-Gault), mL/min, non indexée. */
  cockcroftMlMin?: number;
  /** DFG estimé CKD-EPI 2021 (sans variable ethnique), mL/min/1,73 m². */
  ckdEpi2021?: number;
  /** DFG CKD-EPI désindexé à la surface corporelle du patient, mL/min. */
  ckdEpiDesindexe?: number;
  /** DFG saisi directement par l'utilisateur. */
  dfgSaisi?: { valeur: number; methode: string };
  /** Valeur retenue pour les paliers posologiques (Cockcroft en priorité, cf. RCP). */
  valeurPourPosologie?: { valeur: number; methode: string; unite: 'mL/min' };
  /** Faux si dialyse, IRA ou instabilité : les formules ne s'appliquent pas mécaniquement. */
  applicable: boolean;
  limites: string[];
  manquants: string[];
}

export function creatinineEnMgDl(valeur: number, unite: 'umol/L' | 'mg/dL'): number {
  return unite === 'mg/dL' ? valeur : valeur / 88.4;
}

/**
 * Bornes de plausibilité de la créatininémie selon l'unité (adulte). Hors bornes, l'unité
 * est très probablement erronée (ex. 1,2 saisi en µmol/L au lieu de mg/dL) : la valeur n'est
 * pas utilisée plutôt que de produire une clairance aberrante (ex. 5 000 mL/min).
 * µmol/L : 15 à 2 500 ; mg/dL : 0,17 à 28 (mêmes bornes converties, facteur 88,4).
 */
export const BORNES_CREATININE = { 'umol/L': { min: 15, max: 2500 }, 'mg/dL': { min: 0.17, max: 28.3 } } as const;

export function creatininePlausible(valeur: number, unite: 'umol/L' | 'mg/dL'): { plausible: boolean; raison?: string } {
  if (!Number.isFinite(valeur) || valeur <= 0) return { plausible: false, raison: 'valeur nulle, négative ou non numérique' };
  const b = BORNES_CREATININE[unite];
  const u = unite === 'umol/L' ? 'µmol/L' : 'mg/dL';
  if (valeur < b.min || valeur > b.max) {
    const autre = unite === 'umol/L' ? 'mg/dL' : 'µmol/L';
    return { plausible: false, raison: `${String(valeur).replace('.', ',')} ${u} est hors des valeurs plausibles (${String(b.min).replace('.', ',')} à ${String(b.max).replace('.', ',')} ${u}) ; s'agit-il de ${autre} ?` };
  }
  return { plausible: true };
}

/**
 * Cockcroft-Gault : ClCr (mL/min) = (140 − âge) × poids / (72 × créat mg/dL), × 0,85 si femme.
 * Avec créatinine en µmol/L : (140 − âge) × poids / (0,814 × créat µmol/L) [équivalent].
 * Poids réel dans la formule originale. Limites : obésité, sujet âgé, sarcopénie,
 * fonction rénale instable (formule valable à l'état d'équilibre seulement).
 */
export function cockcroftGault(params: {
  ageAns: number;
  poidsKg: number;
  creatinine: number;
  unite: 'umol/L' | 'mg/dL';
  sexe: 'femme' | 'homme';
}): number {
  const creatMgDl = creatinineEnMgDl(params.creatinine, params.unite);
  if (!(creatMgDl > 0) || !(params.poidsKg > 0) || params.ageAns >= 140) return NaN;
  const base = ((140 - params.ageAns) * params.poidsKg) / (72 * creatMgDl);
  return params.sexe === 'femme' ? base * 0.85 : base;
}

/**
 * CKD-EPI 2021 (créatinine seule, sans variable ethnique) :
 * eGFR = 142 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^−1,200 × 0,9938^âge × 1,012 [si femme]
 * κ = 0,7 (femme) / 0,9 (homme) ; α = −0,241 (femme) / −0,302 (homme). Scr en mg/dL.
 */
export function ckdEpi2021(params: {
  ageAns: number;
  creatinine: number;
  unite: 'umol/L' | 'mg/dL';
  sexe: 'femme' | 'homme';
}): number {
  const scr = creatinineEnMgDl(params.creatinine, params.unite);
  if (!(scr > 0)) return NaN;
  const femme = params.sexe === 'femme';
  const kappa = femme ? 0.7 : 0.9;
  const alpha = femme ? -0.241 : -0.302;
  const ratio = scr / kappa;
  return (
    142 *
    Math.pow(Math.min(ratio, 1), alpha) *
    Math.pow(Math.max(ratio, 1), -1.2) *
    Math.pow(0.9938, params.ageAns) *
    (femme ? 1.012 : 1)
  );
}

/** Surface corporelle de Du Bois : 0,007184 × poids^0,425 × taille^0,725 (kg, cm). */
export function surfaceCorporelleDuBois(poidsKg: number, tailleCm: number): number {
  return 0.007184 * Math.pow(poidsKg, 0.425) * Math.pow(tailleCm, 0.725);
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

export interface EntreesRenales {
  ageAns?: number;
  poidsKg?: number;
  tailleCm?: number;
  sexe: 'femme' | 'homme' | 'inconnu';
  creatinine?: { valeur: number; unite: 'umol/L' | 'mg/dL' };
  dfg?: { valeur: number; methode: string };
  stabilite: 'stable' | 'instable' | 'inconnu';
  insuffisanceRenaleAigue: 'oui' | 'non' | 'inconnu';
  dialyse: 'aucune' | 'hemodialyse_intermittente' | 'eer_continue' | 'dialyse_peritoneale' | 'inconnu';
}

export function estimerFonctionRenale(e: EntreesRenales): EstimationRenale {
  const res: EstimationRenale = { applicable: true, limites: [], manquants: [] };

  if (e.dialyse !== 'aucune' && e.dialyse !== 'inconnu') {
    res.applicable = false;
    res.limites.push(
      "Patient dialysé : les formules d'estimation ne s'appliquent pas ; la posologie suit les règles propres à la modalité d'épuration (cf. RCP de chaque molécule).",
    );
  }
  if (e.insuffisanceRenaleAigue === 'oui' || e.stabilite === 'instable') {
    res.applicable = false;
    res.limites.push(
      "Fonction rénale instable ou insuffisance rénale aiguë : les formules supposent un état d'équilibre ; l'estimation est indicative seulement et doit être réévaluée quotidiennement.",
    );
  }
  if (e.stabilite === 'inconnu' && e.dialyse === 'aucune') {
    res.limites.push("Stabilité de la fonction rénale non renseignée : l'estimation suppose un état d'équilibre.");
  }

  if (e.dfg && Number.isFinite(e.dfg.valeur) && e.dfg.valeur > 0) {
    res.dfgSaisi = e.dfg;
  }

  const sexeConnu = e.sexe === 'femme' || e.sexe === 'homme';
  const verifCreat = e.creatinine ? creatininePlausible(e.creatinine.valeur, e.creatinine.unite) : undefined;
  if (e.creatinine && verifCreat && !verifCreat.plausible) {
    res.manquants.push(`créatininémie valide (${verifCreat.raison})`);
    res.limites.push(`Créatininémie non utilisée : ${verifCreat.raison}. Vérifier la valeur et l'unité (µmol/L ou mg/dL).`);
  } else if (e.creatinine) {
    if (e.ageAns === undefined) res.manquants.push('âge');
    if (!sexeConnu) res.manquants.push('sexe');
    if (e.ageAns !== undefined && sexeConnu) {
      const sexe = e.sexe as 'femme' | 'homme';
      res.ckdEpi2021 = ckdEpi2021({ ageAns: e.ageAns, creatinine: e.creatinine.valeur, unite: e.creatinine.unite, sexe });
      if (e.poidsKg !== undefined) {
        res.cockcroftMlMin = cockcroftGault({
          ageAns: e.ageAns,
          poidsKg: e.poidsKg,
          creatinine: e.creatinine.valeur,
          unite: e.creatinine.unite,
          sexe,
        });
        if (e.tailleCm !== undefined) {
          const sc = surfaceCorporelleDuBois(e.poidsKg, e.tailleCm);
          res.ckdEpiDesindexe = (res.ckdEpi2021 * sc) / 1.73;
        }
      } else {
        res.manquants.push('poids (nécessaire à Cockcroft-Gault, méthode des RCP)');
      }
      if (e.ageAns >= 75) {
        res.limites.push(
          "Sujet âgé : les formules sont moins fiables (masse musculaire) ; Cockcroft-Gault tend à sous-estimer et CKD-EPI à surestimer la fonction rénale réelle.",
        );
      }
    }
  } else {
    res.manquants.push('créatininémie');
  }

  // Valeur retenue pour les paliers : Cockcroft (méthode des RCP) > DFG saisi Cockcroft
  // > CKD-EPI désindexé > DFG saisi (indexé, signalé) > CKD-EPI (indexé, signalé)
  if (res.cockcroftMlMin !== undefined && Number.isFinite(res.cockcroftMlMin)) {
    res.valeurPourPosologie = { valeur: res.cockcroftMlMin, methode: 'Cockcroft-Gault (poids réel)', unite: 'mL/min' };
  } else if (res.dfgSaisi && res.dfgSaisi.methode === 'Cockcroft') {
    res.valeurPourPosologie = { valeur: res.dfgSaisi.valeur, methode: 'Cockcroft-Gault (saisi)', unite: 'mL/min' };
  } else if (res.ckdEpiDesindexe !== undefined) {
    res.valeurPourPosologie = { valeur: res.ckdEpiDesindexe, methode: 'CKD-EPI 2021 désindexé (× SC/1,73)', unite: 'mL/min' };
    res.limites.push(
      'Paliers des RCP établis avec Cockcroft-Gault ; le DFG CKD-EPI désindexé est utilisé faute de poids pour Cockcroft, ce qui peut différer.',
    );
  } else if (res.dfgSaisi) {
    res.valeurPourPosologie = {
      valeur: res.dfgSaisi.valeur,
      methode: `${res.dfgSaisi.methode} (indexé à 1,73 m², non désindexé : taille/poids absents)`,
      unite: 'mL/min',
    };
    res.limites.push(
      "DFG indexé utilisé tel quel pour les paliers RCP (méthode Cockcroft) : approximation à signaler, surtout si la corpulence s'éloigne de 1,73 m².",
    );
  } else if (res.ckdEpi2021 !== undefined && Number.isFinite(res.ckdEpi2021)) {
    res.valeurPourPosologie = {
      valeur: res.ckdEpi2021,
      methode: 'CKD-EPI 2021 (indexé, non désindexé : poids/taille absents)',
      unite: 'mL/min',
    };
    res.limites.push('DFG indexé utilisé tel quel pour les paliers RCP (méthode Cockcroft) : approximation à signaler.');
  }

  return res;
}

export function arrondi(valeur: number, decimales = 0): number {
  const f = Math.pow(10, decimales);
  return Math.round(valeur * f) / f;
}
