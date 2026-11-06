/**
 * Non-régression des constats des relectures v3 (docs/relectures/v3-*.md). Patients fictifs.
 */
import { StrictMode } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { decider, deciderSansPanne } from '../engine/decider';
import { construireContexte } from '../engine/contexte';
import { clonerDossier, nettoyerDossier, type Dossier } from '../engine/etat';
import { choisirEstimation, estimation, estimerFonctionRenale, type EntreesRenales } from '../calc/renal';
import { referenceRenale } from '../clinical/molecules/reference-renale';
import { irChroniqueSevere } from '../clinical/rules/bgn-urinaire';
import { App } from '../ui/App';
import { casFictif } from './cas-fictifs';
import type { Plan } from '../clinical/types';
import { CAS_ECBU_COLONISATION, CAS_ECOLI_I, CAS_SAB_SASM } from './cas-fictifs';

const MAINTENANT = new Date('2026-11-05T10:00:00Z');
const plan = (d: Dossier, opts: { modeUsageClinique?: boolean } = {}): Plan => {
  const c = clonerDossier(d);
  nettoyerDossier(c);
  return decider(c, { maintenant: MAINTENANT, ...opts });
};
const avec = (d: Dossier, fn: (x: Dossier) => void) => {
  const c = clonerDossier(d);
  fn(c);
  return c;
};
const prescription = (p: Plan, id: string) => p.options.flatMap((o) => o.prescriptions).find((x) => x.moleculeId === id);
const base: EntreesRenales = { sexe: 'homme', stabilite: 'stable', insuffisanceRenaleAigue: 'non', dialyse: 'aucune' };

describe('Relecture développeur v3', () => {
  test('B1. discordance Cockcroft-Gault / DFG désindexé : proposition partielle, donnée bloquante nommée', () => {
    // Homme de 92 ans, 42 kg, 185 cm : Cockcroft-Gault nettement plus bas que le DFG désindexé.
    const p = plan(
      avec(CAS_SAB_SASM, (x) => {
        x.patient.age = 92;
        x.patient.poidsKg = 42;
        x.patient.tailleCm = 185;
        x.patient.renal.creatinine = { valeur: 250, unite: 'umol/L', date: '2026-11-04' };
      }),
    );
    const cefaz = prescription(p, 'cefazoline');
    expect(cefaz?.adaptations.join(' ')).toMatch(/paliers différents/);
    expect(p.sortie.traitement).toBe('partiel');
    const m = p.donneesManquantes.find((x) => /Cockcroft-Gault et DFG désindexé/.test(x.champ));
    expect(m?.impact).toBe('bloque_dose');
    expect(p.sortie.motifs.some((x) => x.aCompleter.some((a) => /Cockcroft-Gault et DFG désindexé/.test(a.texte)))).toBe(true);
  });

  test('M1. sans taille ni poids, DFG indexé normal : palier de la ceftriaxone retenu (indépendant du gabarit)', () => {
    const p = plan(
      avec(CAS_ECOLI_I, (x) => {
        x.patient.poidsKg = undefined;
        x.patient.tailleCm = undefined;
      }),
    );
    const ctri = prescription(p, 'ceftriaxone')!;
    expect(ctri.adaptations[0]).toMatch(/même palier dans tous les cas/);
    expect(ctri.adaptations[0]).toMatch(/Pas d'adaptation/);
    expect(ctri.doseAffichee).not.toMatch(/Dose de référence/);
  });

  test('M2. IRC sévère (SPILF 2015) sans poids ni taille : retenue si le seuil de 30 est franchi quel que soit le gabarit, sinon « inconnu » (jamais « simple » en silence)', () => {
    const sansGabarit = (creat: number) =>
      avec(CAS_ECOLI_I, (x) => {
        x.patient.poidsKg = undefined;
        x.patient.tailleCm = undefined;
        x.patient.renal.creatinine = { valeur: creat, unite: 'umol/L', date: '2026-11-04' };
      });
    // DFG indexé ≈ 11 : de 5 à 22 mL/min selon la surface corporelle, toujours < 30.
    expect(irChroniqueSevere(construireContexte(sansGabarit(500), MAINTENANT))).toBe(true);
    // DFG indexé ≈ 18 : de 9 à 36 mL/min selon le gabarit : indéterminé, donnée demandée.
    expect(irChroniqueSevere(construireContexte(sansGabarit(300), MAINTENANT))).toBe('inconnu');
    // DFG indexé ≈ 95 : toujours ≥ 30.
    expect(irChroniqueSevere(construireContexte(sansGabarit(80), MAINTENANT))).toBe(false);
  });

  test('M3. créatininémie datée du futur et âge implausible : non utilisés, proposition au mieux partielle, motif visible', () => {
    const futur = estimerFonctionRenale({ ...base, ageAns: 60, poidsKg: 70, creatinine: { valeur: 90, unite: 'umol/L', date: '2027-11-04' }, maintenant: MAINTENANT });
    expect(futur.estimations.some((e) => e.calculable)).toBe(false);
    const age = estimerFonctionRenale({ ...base, ageAns: 150, poidsKg: 70, creatinine: { valeur: 90, unite: 'umol/L' } });
    expect(age.estimations.some((e) => e.calculable)).toBe(false);
    expect(estimation(age, 'clairance_cg').manquants).toContain('âge plausible');
    const p = plan(avec(CAS_ECOLI_I, (x) => (x.patient.renal.creatinine = { valeur: 90, unite: 'umol/L', date: '2027-11-04' })));
    expect(p.sortie.traitement).not.toBe('complet');
    expect(p.sortie.motifs[0].type).toBe('incoherence');
  });

  test('M5. mode usage clinique : la cause réelle (règles non validées) en tête, sans motif microbiologique ou de couverture trompeur', () => {
    for (const d of [CAS_SAB_SASM, CAS_ECBU_COLONISATION]) {
      const p = plan(d, { modeUsageClinique: true });
      expect(p.sortie.motifs[0].type).toBe('non_validee');
      expect(p.sortie.motifs.some((m) => m.type === 'microbiologie_insuffisante' || m.type === 'non_couverte')).toBe(false);
    }
  });

  test('M6. arrondi : la valeur affichée et le palier retenu concordent (29,6 → « ≈ 30 » → palier ≥ 30)', () => {
    // Cloxacilline : > 30 pas d'adaptation ; < 30 demi-dose. Cockcroft-Gault ≈ 29,6 mL/min.
    const r = estimerFonctionRenale({ ...base, ageAns: 80, poidsKg: 50, creatinine: { valeur: 1.4071, unite: 'mg/dL' } });
    const v = estimation(r, 'clairance_cg').valeur!;
    expect(v).toBeGreaterThan(29.5);
    expect(v).toBeLessThan(30);
    const p = plan(
      avec(CAS_SAB_SASM, (x) => {
        x.patient.age = 80;
        x.patient.poidsKg = 50;
        x.patient.tailleCm = undefined;
        x.patient.renal.creatinine = { valeur: 1.4071, unite: 'mg/dL', date: '2026-11-04' };
      }),
    );
    const clox = prescription(p, 'cloxacilline')!;
    expect(clox.adaptations[0]).toMatch(/≈ 30 mL\/min : ClCr > 30 mL\/min : pas d'adaptation/);
  });

  test('M7. valeur du laboratoire : combinaisons méthode/unité incohérentes refusées, unité jamais déduite', () => {
    const cgIndexe = estimerFonctionRenale({ ...base, dfg: { valeur: 40, methode: 'Cockcroft', unite: 'mL/min/1,73 m²' } });
    expect(cgIndexe.labo?.utilisable).toBe(false);
    expect(cgIndexe.incoherences.length).toBe(1);
    expect(choisirEstimation(cgIndexe, referenceRenale('ertapeneme')).valeur).toBeUndefined();
    const ckdMlMin = estimerFonctionRenale({ ...base, dfg: { valeur: 40, methode: 'CKD-EPI', unite: 'mL/min' } });
    expect(ckdMlMin.labo?.utilisable).toBe(false);
    expect(choisirEstimation(ckdMlMin, referenceRenale('amoxicilline')).valeur).toBeUndefined();
    const sansUnite = estimerFonctionRenale({ ...base, dfg: { valeur: 40, methode: 'Cockcroft' } });
    expect(sansUnite.labo?.unite).toBe('inconnue');
    expect(choisirEstimation(sansUnite, referenceRenale('vancomycine')).valeur).toBeUndefined();
  });

  test('M8. erreur technique chez un patient en choc : urgence maintenue avant « réessayer »', () => {
    const casse = { ...clonerDossier(CAS_SAB_SASM), prelevements: undefined } as unknown as Dossier;
    casse.patient.gravite = 'choc_septique';
    const r = deciderSansPanne(casse);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.sortie.urgence).toBe(true);
      expect(r.sortie.actionsUrgentes[0].texte).toMatch(/Ne pas attendre l’application/);
      expect(r.sortie.motifs[0].prochaineAction).toMatch(/^Prise en charge urgente/);
    }
  });

  test('m1. EKFC entre 18 et 25 ans : Cockcroft-Gault reste calculable', () => {
    const r = estimerFonctionRenale({ ...base, ageAns: 22, poidsKg: 70, creatinine: { valeur: 80, unite: 'umol/L' }, equation: 'ekfc' });
    expect(estimation(r, 'dfg_indexe').calculable).toBe(false);
    expect(estimation(r, 'clairance_cg').calculable).toBe(true);
  });

  test('m4. aucune parenthèse vide dans les refus', () => {
    const r = estimerFonctionRenale({ ...base, ageAns: 60, poidsKg: 70, creatinine: { valeur: 90, unite: 'umol/L' }, stabilite: 'instable' });
    for (const id of ['vancomycine', 'amoxicilline', 'meropeneme', 'ertapeneme']) expect(choisirEstimation(r, referenceRenale(id)).refus ?? '').not.toMatch(/\(\)/);
  });
});

describe('Relecture documentaire v3', () => {
  test('ertapénème : la différence de grandeur (clairance indexée du RCP / DFG indexé) est dite', () => {
    const r = estimerFonctionRenale({ ...base, ageAns: 60, creatinine: { valeur: 90, unite: 'umol/L' } });
    expect(choisirEstimation(r, referenceRenale('ertapeneme')).pourquoi).toMatch(/grandeur différente/);
  });
  test('EKFC : l’extrait HAS « formule CKD-EPI » n’est pas présenté comme justification ; divergence affichée', () => {
    const r = estimerFonctionRenale({ ...base, ageAns: 50, creatinine: { valeur: 1.2, unite: 'mg/dL' }, equation: 'ekfc' });
    const e = estimation(r, 'dfg_indexe');
    expect(e.sources.some((s) => s.source === 'HAS-2023-MRC-7-messages')).toBe(false);
    expect(e.limites.join(' ')).toMatch(/non retenue par la HAS/);
  });
  test('point non résolu : la phrase « Cela ne signifie pas qu’aucun traitement n’est indiqué » est présente', () => {
    const p = plan(
      avec(CAS_ECBU_COLONISATION, (x) => {
        x.clinique.fievre = 'oui';
        x.clinique.signesUrinaires = 'absents';
        x.clinique.autreFoyer = 'recherche_negative';
      }),
    );
    expect(p.sortie.motifs.find((m) => m.type === 'non_validee')?.limite).toMatch(/Cela ne signifie pas qu'aucun traitement n'est indiqué/);
  });
});

describe('Interface', () => {
  test('M4. avis de changement visible sous StrictMode, absent après réinitialisation de la saisie', async () => {
    const u = userEvent.setup();
    render(
      <StrictMode>
        <App dossierInitial={casFictif('sab')} />
      </StrictMode>,
    );
    expect(screen.queryByText(/Votre dernière modification change la proposition/)).toBeNull();
    const creat = screen.getByLabelText('Valeur de la créatininémie');
    await u.clear(creat);
    await u.type(creat, '400');
    const avis = await screen.findByText(/Votre dernière modification change la proposition/);
    expect(within(avis.closest('div')!).getAllByText(/adaptation rénale modifiée/).length).toBeGreaterThan(0);
    await u.click(screen.getByRole('button', { name: 'Réinitialiser la saisie' }));
    expect(screen.queryByText(/Votre dernière modification change la proposition/)).toBeNull();
  }, 20000);
});
