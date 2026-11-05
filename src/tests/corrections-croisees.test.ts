/**
 * Corrections issues du croisement des deux relectures (résultats attendus établis à partir des sources).
 */
import { decider } from '../engine/decider';
import { clonerDossier, nettoyerDossier, type Dossier } from '../engine/etat';
import { poidsIdealLorentz, poidsAjuste } from '../calc/renal';
import { CAS_ECOLI_I, CAS_EI_FAECALIS } from './cas-fictifs';

const plan = (d: Dossier) => {
  const c = clonerDossier(d);
  nettoyerDossier(c);
  return decider(c, { maintenant: new Date('2026-11-04T10:00:00Z') });
};

describe('Poids de référence des aminosides (RCP)', () => {
  test('Lorentz (RCP gentamicine) : femme 160 cm → 55 kg ; homme 180 cm → 72,5 kg', () => {
    expect(poidsIdealLorentz(160, 'femme')).toBe(55);
    expect(poidsIdealLorentz(180, 'homme')).toBe(72.5);
    expect(poidsAjuste(110, 55, 0.43)).toBeCloseTo(78.65, 2);
  });

  test('gentamicine chez une patiente obèse : poids idéal de Lorentz + 0,43 × surcharge', () => {
    const d = clonerDossier(CAS_EI_FAECALIS);
    d.patient.sexe = 'femme';
    d.patient.grossesse = 'non';
    d.patient.allaitement = 'non';
    d.patient.poidsKg = 110;
    d.patient.tailleCm = 160;
    d.prelevements[0].organisme = 'enterococcus_faecium';
    d.prelevements[0].antibiogramme = [{ dci: 'amoxicilline', categorie: 'R' }, { dci: 'vancomycine', categorie: 'S' }];
    const p = plan(d);
    const genta = p.options.flatMap((o) => o.prescriptions).find((x) => x.moleculeId === 'gentamicine')!;
    expect(genta.doseCalculee?.poidsUtilise?.valeur).toBeCloseTo(78.7, 1);
    expect(genta.doseCalculee?.poidsUtilise?.type).toMatch(/Lorentz/);
  });
});

describe('Infection urinaire masculine (SPILF 2026)', () => {
  test('la durée dépend de la forme clinique : PNA 7 j, prostatite 14 j, orchi-épididymite 10 j', () => {
    const duree = (forme: 'pna' | 'prostatite' | 'orchi_epididymite') => {
      const d = clonerDossier(CAS_ECOLI_I);
      d.patient.formeIUMasculine = forme;
      return plan(d).options.find((o) => o.rang === 'premiere_ligne')!.prescriptions[0].duree.dureePrevueJours;
    };
    expect(duree('pna')).toBe(7);
    expect(duree('prostatite')).toBe(14);
    expect(duree('orchi_epididymite')).toBe(10);
  });

  test('forme inconnue : donnée bloquante signalée, aucune durée inventée', () => {
    const d = clonerDossier(CAS_ECOLI_I);
    d.patient.formeIUMasculine = 'inconnu';
    const p = plan(d);
    expect(p.donneesManquantes.some((m) => /forme clinique/.test(m.champ) && m.impact === 'bloque_decision')).toBe(true);
    expect(p.options.find((o) => o.rang === 'premiere_ligne')!.prescriptions[0].duree.dureePrevueJours).toBeUndefined();
  });
});
