/**
 * Formatage des nombres à la française (virgule décimale, espace fine insécable
 * pour les milliers). Déterministe : n'utilise pas la locale du navigateur.
 */

const ESPACE_FINE = ' ';

/** Arrondit à `decimales` (peut être négatif : -1 = à la dizaine) et formate avec la virgule décimale. */
export function nombreFr(valeur: number, decimales = 0): string {
  if (!Number.isFinite(valeur)) return '?';
  const f = Math.pow(10, decimales);
  const arrondi = Math.round(valeur * f) / f;
  const negatif = arrondi < 0;
  const abs = Math.abs(arrondi);
  const [entier, frac] = (decimales > 0 ? String(abs) : String(Math.round(abs))).split('.');
  const entierGroupe = entier.length > 4 ? entier.replace(/\B(?=(\d{3})+(?!\d))/g, ESPACE_FINE) : entier;
  return `${negatif ? '−' : ''}${entierGroupe}${frac ? `,${frac}` : ''}`;
}

/**
 * Dose en mg ou g. Les doses fixes exprimées en g restent en g ; une dose en mg
 * n'est convertie en g que si la conversion est exacte au dixième (1 500 mg → 1,5 g),
 * sinon elle reste en mg (1 560 mg) : pas de conversion qui masquerait un arrondi.
 */
export function formaterDose(valeur: number, unite: string, opts: { forcerMg?: boolean } = {}): string {
  if (unite === 'mg' && !opts.forcerMg && valeur >= 1000 && valeur % 100 === 0) return `${nombreFr(valeur / 1000, 1)} g`;
  return `${nombreFr(valeur, valeur < 10 ? 2 : 0)} ${unite}`;
}
