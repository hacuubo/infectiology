import { cockcroftGault, ckdEpi2021, estimerFonctionRenale, poidsIdealDevine, poidsAjuste, surfaceCorporelleDuBois } from '../calc/renal';

describe('Calculs physiologiques', () => {
  test('Cockcroft-Gault : formule du RCP vancomycine (mg/dL) et équivalence µmol/L', () => {
    // (140 − 90) × 50 / (72 × 1,131) × 0,85 = 26,1 mL/min (calcul manuel)
    const v = cockcroftGault({ ageAns: 90, poidsKg: 50, creatinine: 100, unite: 'umol/L', sexe: 'femme' });
    expect(v).toBeCloseTo(26.1, 0);
    const mgdl = cockcroftGault({ ageAns: 90, poidsKg: 50, creatinine: 100 / 88.4, unite: 'mg/dL', sexe: 'femme' });
    expect(mgdl).toBeCloseTo(v, 6);
  });

  test('CKD-EPI 2021 (NKF) : femme 60 ans, créatinine 0,8 mg/dL ≈ 84 mL/min/1,73 m²', () => {
    expect(ckdEpi2021({ ageAns: 60, creatinine: 0.8, unite: 'mg/dL', sexe: 'femme' })).toBeCloseTo(84.3, 0);
  });

  test('Surface corporelle de Du Bois (formule citée par la HAS)', () => {
    expect(surfaceCorporelleDuBois(70, 175)).toBeCloseTo(1.85, 2);
  });

  test('Poids idéal (Devine) et poids ajusté', () => {
    expect(poidsIdealDevine(170, 'homme')).toBeCloseTo(66.2, 1);
    expect(poidsAjuste(120, 66.2)).toBeCloseTo(87.72, 1);
  });

  test('Le DFG indexé n\'est pas assimilé à une clairance : méthode et limite affichées', () => {
    const r = estimerFonctionRenale({ ageAns: 70, sexe: 'homme', dfg: { valeur: 45, methode: 'CKD-EPI' }, stabilite: 'stable', insuffisanceRenaleAigue: 'non', dialyse: 'aucune' });
    expect(r.valeurPourPosologie?.methode).toMatch(/indexé/);
    expect(r.limites.join(' ')).toMatch(/approximation/);
  });

  test('Fonction rénale instable ou IRA : estimation non applicable mécaniquement', () => {
    const r = estimerFonctionRenale({ ageAns: 90, poidsKg: 50, sexe: 'femme', creatinine: { valeur: 180, unite: 'umol/L' }, stabilite: 'instable', insuffisanceRenaleAigue: 'oui', dialyse: 'aucune' });
    expect(r.applicable).toBe(false);
    expect(r.limites.join(' ')).toMatch(/état d'équilibre/);
  });

  test('Dialyse : les formules ne s\'appliquent pas', () => {
    const r = estimerFonctionRenale({ ageAns: 60, poidsKg: 70, sexe: 'homme', stabilite: 'inconnu', insuffisanceRenaleAigue: 'non', dialyse: 'hemodialyse_intermittente' });
    expect(r.applicable).toBe(false);
  });

  test('Sans poids : pas de Cockcroft inventé, manque signalé', () => {
    const r = estimerFonctionRenale({ ageAns: 60, sexe: 'homme', creatinine: { valeur: 100, unite: 'umol/L' }, stabilite: 'stable', insuffisanceRenaleAigue: 'non', dialyse: 'aucune' });
    expect(r.cockcroftMlMin).toBeUndefined();
    expect(r.manquants.join(' ')).toMatch(/poids/);
  });
});
