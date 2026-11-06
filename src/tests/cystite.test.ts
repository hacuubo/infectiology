/**
 * Cystite (R-CYSTITE, 2026-11-06). Résultats attendus établis d'après docs/sources/recherche-cystite.md
 * (HAS 2021 mises à jour 2025, SPILF 2018, SPILF 2026, AFU 2026, RCP), indépendamment du code.
 */
import { decider } from '../engine/decider';
import { dossierParDefaut, nettoyerDossier, nouveauPrelevement, type Dossier } from '../engine/etat';
import type { Plan } from '../clinical/types';

const MAINTENANT = new Date('2026-11-06T10:00:00Z');

function cystite(modif?: (d: Dossier) => void): Dossier {
  const d = dossierParDefaut();
  d.entree = 'syndrome';
  d.syndrome = 'urinaire';
  d.patient.age = 30;
  d.patient.sexe = 'femme';
  d.patient.grossesse = 'non';
  d.patient.immunodepression = 'non';
  d.patient.renal.creatinine = { valeur: 60, unite: 'umol/L' };
  d.clinique.fievre = 'non';
  d.clinique.signesUrinaires = 'nouveaux';
  d.details = { 'urinaire.anomalie': 'non', 'urinaire.recidivante': 'non' };
  modif?.(d);
  return d;
}
function plan(d: Dossier): Plan {
  nettoyerDossier(d);
  return decider(d, { maintenant: MAINTENANT });
}
const molecules = (p: Plan, rang?: string) => p.options.filter((o) => !rang || o.rang === rang).flatMap((o) => o.prescriptions.map((x) => x.moleculeId));
function avecECBU(d: Dossier, abg: { dci: string; categorie: 'S' | 'I' | 'R' }[]) {
  const u = nouveauPrelevement('urine');
  u.organisme = 'escherichia_coli';
  u.stade = 'antibiogramme';
  u.antibiogramme = abg;
  u.antibiogrammePour = 'escherichia_coli';
  u.urine = { motif: 'signes_urinaires', recueil: 'mi_jet', nbEspeces: 'une' };
  d.prelevements = [u];
}

describe('Cystite de la femme', () => {
  test('simple : fosfomycine-trométamol 3 g en prise unique, pivmécillinam en 2e intention (durée divergente, brouillon), pas d’ECBU', () => {
    const p = plan(cystite());
    expect(p.situation.id).toBe('cystite-simple');
    expect(molecules(p, 'premiere_ligne')).toEqual(['fosfomycine_trometamol']);
    const fosfo = p.options[0].prescriptions[0];
    expect(fosfo.doseAffichee).toBe('3 g en prise unique');
    expect(fosfo.duree.texte).toBe('Prise unique');
    const pivm = p.options.find((o) => o.id === 'cystite-simple-pivm')!;
    expect(pivm.rang).toBe('alternative');
    expect(pivm.statut).toBe('brouillon');
    expect(pivm.prescriptions[0].duree.texte).toMatch(/3 jours selon la HAS ; 5 jours selon la SPILF/);
    expect(p.controles.find((c) => c.id === 'ctl-cystite-ecbu-echec')?.categorie).toBe('conditionnel');
    expect(p.regles.some((r) => r.id === 'R-IU-FEBRILE')).toBe(false);
  });

  test('facteur de risque inconnu : il est demandé ; fosfomycine seulement conditionnelle', () => {
    const p = plan(cystite((d) => (d.details = {})));
    expect(p.situation.id).toBe('cystite-risque-a-preciser');
    expect(p.donneesManquantes.some((m) => /anomalie organique/.test(m.champ))).toBe(true);
    expect(p.options.every((o) => o.rang === 'conditionnelle')).toBe(true);
  });

  test('à risque, sans antibiogramme : ECBU, traitement différé ; probabilistes seulement conditionnels (nitrofurantoïne puis fosfomycine J1-J3-J5)', () => {
    const p = plan(cystite((d) => (d.details!['urinaire.anomalie'] = 'oui')));
    expect(p.situation.id).toBe('cystite-a-risque');
    expect(p.controles.find((c) => c.id === 'ctl-cystite-ecbu')?.categorie).toBe('indique');
    expect(p.options.every((o) => o.rang === 'conditionnelle')).toBe(true);
    expect(molecules(p)).toEqual(['nitrofurantoine', 'fosfomycine_trometamol']);
    expect(p.reevaluation.map((r) => r.texte).join(' ')).toMatch(/Traitement différé à privilégier/);
  });

  test('à risque, traitement ne pouvant être différé : nitrofurantoïne 100 mg × 3/j 7 j en 1re ligne', () => {
    const p = plan(cystite((d) => {
      d.details!['urinaire.anomalie'] = 'oui';
      d.details!['urinaire.differable'] = 'non';
    }));
    const nitro = p.options.find((o) => o.rang === 'premiere_ligne')!;
    expect(nitro.prescriptions[0].moleculeId).toBe('nitrofurantoine');
    expect(nitro.prescriptions[0].doseAffichee).toMatch(/100 mg × 3\/24 h/);
    expect(nitro.prescriptions[0].duree.texte).toBe('7 jours');
  });

  test('à risque, antibiogramme : amoxicilline si sensible ; sinon pivmécillinam si mécillinam sensible', () => {
    const d1 = cystite((d) => (d.details!['urinaire.anomalie'] = 'oui'));
    avecECBU(d1, [{ dci: 'amoxicilline', categorie: 'S' }, { dci: 'mecillinam', categorie: 'S' }]);
    expect(molecules(plan(d1), 'premiere_ligne')).toEqual(['amoxicilline']);
    const d2 = cystite((d) => (d.details!['urinaire.anomalie'] = 'oui'));
    avecECBU(d2, [{ dci: 'amoxicilline', categorie: 'R' }, { dci: 'mecillinam', categorie: 'S' }]);
    expect(molecules(plan(d2), 'premiere_ligne')).toEqual(['pivmecillinam']);
  });

  test('âge > 75 ans : cystite à risque sans autre question', () => {
    const p = plan(cystite((d) => (d.patient.age = 80)));
    expect(p.situation.id).toBe('cystite-a-risque');
    expect(p.situation.description).toMatch(/âge > 75 ans/);
  });

  test('cystite récidivante : pas de nitrofurantoïne pour l’épisode', () => {
    const p = plan(cystite((d) => {
      d.details!['urinaire.anomalie'] = 'oui';
      d.details!['urinaire.recidivante'] = 'oui';
    }));
    expect(molecules(p)).not.toContain('nitrofurantoine');
    expect(p.urgence.alertes.some((a) => /récidivante/.test(a.texte))).toBe(true);
  });

  test('DFG < 45 : la nitrofurantoïne est signalée contre-indiquée par son adaptation rénale', () => {
    const p = plan(cystite((d) => {
      d.patient.age = 70;
      d.details!['urinaire.fried'] = 'non';
      d.details!['urinaire.anomalie'] = 'oui';
      d.patient.renal.creatinine = { valeur: 140, unite: 'umol/L' };
    }));
    const nitro = p.options.find((o) => o.prescriptions[0].moleculeId === 'nitrofurantoine')!;
    expect(nitro.prescriptions[0].adaptations.join(' ')).toMatch(/contre-indiquée/);
  });
});

describe('Cystite gravidique et colonisation', () => {
  test('cystite gravidique : probabiliste immédiat, fosfomycine prise unique puis pivmécillinam 7 j ; ECBU de contrôle puis mensuel', () => {
    const p = plan(cystite((d) => (d.patient.grossesse = 'oui')));
    expect(p.situation.id).toBe('cystite-gravidique');
    expect(molecules(p, 'premiere_ligne')).toEqual(['fosfomycine_trometamol']);
    expect(p.options.find((o) => o.id === 'gravidique-pivm')?.prescriptions[0].duree.texte).toBe('7 jours');
    expect(p.controles.find((c) => c.id === 'ctl-gravidique-suivi')?.quoi).toMatch(/mensuel/);
  });

  test('colonisation gravidique sans antibiogramme : pas de probabiliste, antibiogramme demandé', () => {
    const d = cystite((x) => {
      x.entree = 'microbiologie';
      x.syndrome = 'non_choisi';
      x.patient.grossesse = 'oui';
      x.clinique = { fievre: 'non', signesUrinaires: 'absents', signesNonSpecifiques: 'non', autreFoyer: 'non_recherche', gesteUrologique: 'aucun', signesInfectionLocale: 'inconnu' };
    });
    const u = nouveauPrelevement('urine');
    u.organisme = 'escherichia_coli';
    u.urine = { motif: 'depistage_grossesse', recueil: 'mi_jet', nbEspeces: 'une' };
    d.prelevements = [u];
    const p = plan(d);
    expect(p.situation.id).toBe('colonisation-gravidique');
    expect(p.options).toHaveLength(0);
    expect(p.donneesManquantes.some((m) => /antibiogramme/.test(m.champ))).toBe(true);
  });
});

describe('Cystite de l’homme (SPILF 2026)', () => {
  test('sans fièvre : ECBU et échographie, pas de schéma d’IU fébrile ; trois molécules orales conditionnelles, hors AMM signalé, 7 jours', () => {
    const p = plan(cystite((d) => {
      d.patient.sexe = 'homme';
      d.patient.grossesse = 'inconnu';
    }));
    expect(p.situation.id).toBe('cystite-homme');
    expect(p.regles.some((r) => r.id === 'R-IU-FEBRILE')).toBe(false);
    expect(molecules(p).sort()).toEqual(['fosfomycine_trometamol', 'nitrofurantoine', 'pivmecillinam']);
    expect(p.options.every((o) => o.rang === 'conditionnelle')).toBe(true);
    expect(p.options.every((o) => /Hors AMM/.test(o.commentaire ?? ''))).toBe(true);
    expect(p.controles.some((c) => c.id === 'ctl-cystite-homme-echo')).toBe(true);
  });

  test('avec fièvre : infection urinaire masculine fébrile (R-IU-FEBRILE), pas de cystite', () => {
    const p = plan(cystite((d) => {
      d.patient.sexe = 'homme';
      d.clinique.fievre = 'oui';
    }));
    expect(p.regles.some((r) => r.id === 'R-CYSTITE')).toBe(false);
    expect(p.regles.some((r) => r.id === 'R-IU-FEBRILE')).toBe(true);
  });
});
