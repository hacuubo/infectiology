/**
 * Mécanismes du moteur ajoutés pour les nouveaux domaines (2026-11-06) : sepsis jamais masqué par une conclusion
 * sans traitement ; adaptation rénale propre à un régime ; molécule non absorbée ; motif quand il n'y a que des
 * options conditionnelles ; cible explicite d'une donnée manquante.
 */
import { decider } from '../engine/decider';
import { calculerPrescription } from '../engine/posologie';
import { construireContexte } from '../engine/contexte';
import { clonerDossier, dossierParDefaut, nettoyerDossier, type Dossier } from '../engine/etat';
import { molecule } from '../clinical/molecules';
import type { Molecule, Regimen } from '../clinical/types';
import { Fiche } from '../clinical/rules/outils';
import { CAS_ECBU_COLONISATION } from './cas-fictifs';

const MAINTENANT = new Date('2026-11-06T10:00:00Z');
const plan = (d: Dossier) => {
  const c = clonerDossier(d);
  nettoyerDossier(c);
  return decider(c, { maintenant: MAINTENANT });
};

describe('Moteur : mécanismes des nouveaux domaines', () => {
  test('sepsis + conclusion « pas d’antibiothérapie » : l’alerte et l’urgence du sepsis restent affichées', () => {
    const d = clonerDossier(CAS_ECBU_COLONISATION);
    d.patient.gravite = 'sepsis';
    const p = plan(d);
    expect(p.urgence.niveau).toBe('immediate');
    expect(p.urgence.alertes.some((a) => a.niveau === 'urgence' && /Sepsis/.test(a.texte))).toBe(true);
  });

  test('adaptation rénale propre à un régime : prioritaire sur celle de la molécule', () => {
    const d = dossierParDefaut();
    d.patient.age = 60;
    d.patient.sexe = 'homme';
    d.patient.poidsKg = 70;
    d.patient.tailleCm = 175;
    d.patient.renal.creatinine = { valeur: 400, unite: 'umol/L' };
    d.patient.renal.stabilite = 'stable';
    d.patient.renal.dialyse = 'aucune';
    d.patient.renal.insuffisanceRenaleAigue = 'non';
    nettoyerDossier(d);
    const ctx = construireContexte(d, MAINTENANT);
    const m = molecule('amoxicilline');
    const r: Regimen = { ...m.regimens[0], id: 'test-regime', adaptationRenale: { methode: 'non_precisee', statut: 'verifiee_ia', paliers: [{ texte: 'Palier propre au régime : pleine dose 24 h puis avis.', sources: [] }] } };
    const res = calculerPrescription({ molecule: m, regimen: r, ctx, duree: { texte: '1 j', pointDeDepart: 'x', sources: [] } });
    expect(res.prescription.adaptations.join(' ')).toMatch(/Palier propre au régime/);
  });

  test('molécule non absorbée : pas d’adaptation rénale ni de dialyse', () => {
    const d = dossierParDefaut();
    d.patient.renal.dialyse = 'hemodialyse_intermittente';
    nettoyerDossier(d);
    const ctx = construireContexte(d, MAINTENANT);
    const base = molecule('amoxicilline');
    const m: Molecule = { ...base, id: 'test-non-absorbee', absorptionSystemiqueNegligeable: { texte: 'non absorbée (test)', sources: [] } };
    const res = calculerPrescription({ molecule: m, regimen: base.regimens[0], ctx, duree: { texte: '1 j', pointDeDepart: 'x', sources: [] } });
    expect(res.prescription.adaptations.join(' ')).toMatch(/Pas d'adaptation à la fonction rénale ni à la dialyse/);
    expect(res.prescription.doseAffichee).not.toMatch(/Dose de référence/);
  });

  test('Fiche.manque accepte une cible explicite', () => {
    const ctx = construireContexte(dossierParDefaut(), MAINTENANT);
    const f = new Fiche(ctx, 'verifiee_ia');
    f.manque('question de test', 'pour le test', 'bloque_decision', 'details.test.question');
    expect(f.fin().donneesManquantes?.[0].cible).toBe('details.test.question');
  });
});
