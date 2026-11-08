/**
 * États de sortie explicites (aucune fiche sans explication) et intégration de la fonction rénale
 * dans les propositions. Patients fictifs.
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { decider, deciderSansPanne } from '../engine/decider';
import { comparerPlans } from '../engine/comparaison';
import { clonerDossier, nettoyerDossier, nouveauPrelevement, type Dossier } from '../engine/etat';
import { TEXTE_NON_COUVERTE } from '../engine/sortie';
import { PanneauErreurTechnique } from '../ui/Explication';
import { App } from '../ui/App';
import { casFictif } from './cas-fictifs';
import type { Plan } from '../clinical/types';
import {
  CAS_BGN_90,
  CAS_BLSE_AMIKACINE,
  CAS_ECBU_COLONISATION,
  CAS_ECBU_C3G_R,
  CAS_SAB_SASM,
  CAS_SARM_HEMODIALYSE,
  CAS_SAB_ALLERGIE_SEVERE,
} from './cas-fictifs';

const plan = (d: Dossier): Plan => {
  const c = clonerDossier(d);
  nettoyerDossier(c);
  return decider(c, { maintenant: new Date('2026-11-05T10:00:00Z') });
};
const avec = (d: Dossier, fn: (x: Dossier) => void) => {
  const c = clonerDossier(d);
  fn(c);
  return c;
};
const types = (p: Plan) => p.sortie.motifs.map((m) => m.type);
const prescription = (p: Plan, id: string) => p.options.flatMap((o) => o.prescriptions).find((x) => x.moleculeId === id);

/** Vancomycine sur SARM, adulte stable, fonction rénale stable. */
const SARM_STABLE = avec(CAS_SARM_HEMODIALYSE, (x) => {
  x.patient.poidsKg = 80;
  x.patient.renal = { creatinine: { valeur: 90, unite: 'umol/L', date: '2026-11-04' }, stabilite: 'stable', insuffisanceRenaleAigue: 'non', dialyse: 'aucune' };
});

/** Infection à C. difficile, forme grave et compliquée (fulminante) : options toutes conditionnelles. */
const cdiffFulminante = (details: Record<string, string>, fn?: (x: Dossier) => void): Dossier => {
  const d = clonerDossier(CAS_ECBU_COLONISATION);
  d.entree = 'syndrome';
  d.syndrome = 'clostridioides_difficile';
  d.prelevements = [];
  d.patient.age = 50;
  d.patient.sexe = 'homme';
  d.patient.gravite = 'stable';
  d.details = { 'cdiff.diarrhee': 'oui', 'cdiff.test': 'toxine_positive', 'cdiff.compliquee': 'oui', 'cdiff.episode': 'premier', 'cdiff.voie_orale': 'oui', ...details };
  fn?.(d);
  return d;
};
const CAS_CDIFF_FULMINANTS = [
  cdiffFulminante({}),
  cdiffFulminante({ 'cdiff.test': 'discordant' }),
  cdiffFulminante({ 'cdiff.test': 'negatif' }),
  cdiffFulminante({ 'cdiff.test': 'en_attente' }),
  cdiffFulminante({ 'cdiff.test': 'non_preleve', 'cdiff.diarrhee': 'ileus' }),
  cdiffFulminante({ 'cdiff.test': 'negatif' }, (x) => (x.patient.gravite = 'choc_septique')),
];

describe('Aucune fiche thérapeutique vide sans explication', () => {
  test('toute fiche sans traitement complet porte au moins un motif structuré, avec statut, motif et prochaine action', () => {
    for (const d of [CAS_ECBU_COLONISATION, CAS_BLSE_AMIKACINE, CAS_SARM_HEMODIALYSE, CAS_ECBU_C3G_R, avec(CAS_SAB_SASM, (x) => (x.prelevements = [])), ...CAS_CDIFF_FULMINANTS]) {
      const p = plan(d);
      if (p.sortie.traitement !== 'complet') {
        expect(p.sortie.motifs.length).toBeGreaterThan(0);
        for (const m of p.sortie.motifs) {
          expect(m.statut).not.toBe('');
          expect(m.motif).not.toBe('');
          expect(m.prochaineAction).not.toBe('');
          expect(m.origine.length).toBeGreaterThan(0);
          expect(m.motif).not.toMatch(/^(données insuffisantes|aucun résultat|aucune proposition)\.?$/i);
        }
      }
    }
  });

  test('C. difficile fulminante (tout résultat de test) : jamais « complet », toujours un motif, urgence conservée', () => {
    for (const d of CAS_CDIFF_FULMINANTS) {
      const p = plan(d);
      expect(p.situation.id).toMatch(/^cdiff-/);
      expect(p.sortie.traitement).not.toBe('complet');
      expect(p.sortie.motifs.length).toBeGreaterThan(0);
      expect(p.sortie.urgence).toBe(true);
    }
  });

  test('A. antibiothérapie non indiquée : raison, exceptions vérifiées, surveillance et réévaluation, source', () => {
    const p = plan(CAS_ECBU_COLONISATION);
    expect(p.sortie.traitement).toBe('aucun');
    const m = p.sortie.motifs.find((x) => x.type === 'non_indiquee')!;
    expect(m.motif).toMatch(/colonisation/);
    expect(m.verifie.join(' ')).toMatch(/Geste urologique/);
    expect(m.prochaineAction).toMatch(/Reconsidérer si/);
    expect(m.sources.length).toBeGreaterThan(0);
    expect(m.origine).toEqual(['R-INDICATION-ECBU']);
  });

  test('B. données suffisantes pour choisir la molécule mais pas pour sa dose : choix conservé, donnée nommée et rôle « dose seulement »', () => {
    const d = avec(SARM_STABLE, (x) => (x.patient.poidsKg = undefined));
    const p = plan(d);
    expect(prescription(p, 'vancomycine')).toBeDefined();
    expect(p.sortie.traitement).toBe('partiel');
    const m = p.sortie.motifs.find((x) => x.statut === 'Proposition incomplète')!;
    expect(m.dejaPropose.join(' ')).toMatch(/1re ligne/);
    const poids = m.aCompleter.find((x) => /poids/.test(x.texte))!;
    expect(poids.impact).toBe('bloque_dose');
    expect(poids.role).toMatch(/empêche seulement le calcul de la dose/);
    expect(poids.cible).toBe('patient.poidsKg');
  });

  test('B. donnée empêchant de fixer la durée distinguée (date de la 1re hémoculture négative)', () => {
    const p = plan(CAS_SAB_SASM);
    const duree = p.donneesManquantes.find((m) => /hémoculture négative/.test(m.champ));
    expect(duree?.impact).toBe('bloque_duree');
  });

  test('C. identification en attente : résultat manquant nommé ; sans foyer, aucun probabiliste sourcé n’est inventé', () => {
    const p = plan(CAS_BGN_90);
    const m = p.sortie.motifs.find((x) => x.type === 'microbiologie_insuffisante')!;
    expect(m.aCompleter.map((x) => x.texte).join(' ')).toMatch(/identification du germe \(examen direct seul : BGN\)/);
    expect(m.dejaPropose.join(' ')).toMatch(/Aucun traitement probabiliste sourcé/);
    // Le foyer suspecté est une donnée clinique, pas microbiologique.
    expect(p.sortie.motifs.find((x) => x.type === 'informations_manquantes' && x.rang === 20)!.aCompleter.map((x) => x.texte).join(' ')).toMatch(/foyer suspecté/);
  });

  test('C. mécanisme de résistance non rapporté : lecture à compléter auprès du laboratoire', () => {
    const p = plan(CAS_ECBU_C3G_R);
    expect(p.microbiologie[0].inconnues.map((i) => i.texte).join(' ')).toMatch(/BLSE/);
    expect(p.donneesManquantes.find((m) => /mécanisme/.test(m.champ))?.cible).toBe('prelevements');
  });

  test('D. infection non couverte : limite exacte nommée et texte imposé', () => {
    const prl = { ...nouveauPrelevement('superficiel'), organisme: 'staphylococcus_aureus' as const };
    const d = avec(CAS_SAB_SASM, (x) => {
      x.prelevements = [prl];
      x.clinique.signesInfectionLocale = 'oui';
    });
    const p = plan(d);
    expect(p.options).toHaveLength(0);
    const m = p.sortie.motifs.find((x) => x.type === 'non_couverte')!;
    expect(m.limite).toContain(TEXTE_NON_COUVERTE);
    expect(m.limite).toMatch(/germe : S\. aureus|Staphylococcus aureus/);
    expect(m.prochaineAction).toMatch(/avis spécialisé/i);
  });

  test('E. options exclues par plusieurs contraintes : contraintes nommées, sans affirmer qu’aucun traitement n’existe', () => {
    const d = avec(CAS_ECBU_C3G_R, (x) => {
      x.prelevements[0].phenotypes = { carbapenemase: 'present' };
      x.patient.statutAllergie = 'presentes';
      x.patient.allergies = [{ molecule: 'amoxicilline', reaction: 'retardee_severe', gravite: 'severe' }];
    });
    const p = plan(d);
    const m = p.sortie.motifs.find((x) => x.type === 'contraintes')!;
    expect(m.motif).toMatch(/carbapénémase/);
    expect(m.limite).toMatch(/ne signifie pas qu'aucun traitement n'existe/);
    expect(p.sortie.ecartees.some((e) => e.type === 'resistance' && e.origine !== '')).toBe(true);
  });

  test('E. allergie : option rendue conditionnelle, raison structurée dans « Pourquoi cette proposition n’est-elle pas disponible ? »', () => {
    const p = plan(CAS_SAB_ALLERGIE_SEVERE);
    const e = p.sortie.ecartees.filter((x) => x.type === 'allergie');
    expect(e.length).toBeGreaterThan(0);
    expect(e[0].origine).toBe('controle-allergies');
    expect(e[0].raison).toMatch(/allergie/);
  });

  test('F. point non résolu par les sources : explication et absence de proposition automatisée', () => {
    const d = avec(CAS_ECBU_COLONISATION, (x) => {
      x.clinique.fievre = 'oui';
      x.clinique.signesUrinaires = 'absents';
      x.clinique.autreFoyer = 'recherche_negative';
      x.patient.gravite = 'stable';
    });
    const p = plan(d);
    const m = p.sortie.motifs.find((x) => x.type === 'non_validee');
    expect(m?.limite).toMatch(/aucune source lue ne tranche/);
    expect(p.options).toHaveLength(0);
  });

  test('F. mode usage clinique : options non validées masquées avec leur raison', () => {
    const c = clonerDossier(CAS_SAB_SASM);
    nettoyerDossier(c);
    const p = decider(c, { modeUsageClinique: true, maintenant: new Date('2026-11-05T10:00:00Z') });
    expect(p.options).toHaveLength(0);
    expect(p.sortie.ecartees.some((e) => e.type === 'non_validee')).toBe(true);
    expect(types(p)).toContain('non_validee');
  });

  test('G. données incohérentes : valeur à vérifier, accès direct au champ', () => {
    const d = avec(SARM_STABLE, (x) => (x.patient.renal.creatinine = { valeur: 1.1, unite: 'umol/L', date: '2026-11-04' }));
    const p = plan(d);
    const m = p.sortie.motifs[0];
    expect(m.type).toBe('incoherence');
    expect(m.aCompleter[0].cible).toBe('patient.renal.creatinine');
    expect(m.aCompleter[0].texte).toMatch(/s'agit-il de mg\/dL/);
  });

  test('H. erreur technique : distinguée d’une conclusion médicale, jamais « pas d’antibiothérapie indiquée »', () => {
    const casse = { ...clonerDossier(CAS_SAB_SASM), patient: undefined } as unknown as Dossier;
    const r = deciderSansPanne(casse);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.sortie.motifs[0].type).toBe('erreur_technique');
      expect(r.sortie.motifs.some((m) => m.type === 'non_indiquee')).toBe(false);
      expect(r.sortie.motifs[0].statut).toMatch(/pas une conclusion médicale/);
    }
  });

  test('H. panneau d’erreur : bouton « Réessayer », sans conclusion clinique', async () => {
    const u = userEvent.setup();
    const r = deciderSansPanne({ ...clonerDossier(CAS_SAB_SASM), patient: undefined } as unknown as Dossier);
    let essais = 0;
    if (!r.ok) render(<PanneauErreurTechnique sortie={r.sortie} onReessayer={() => essais++} />);
    expect(screen.getByRole('alert')).toHaveTextContent(/ce n’est pas une conclusion médicale/i);
    expect(screen.queryByText(/Pas d'antibiothérapie indiquée/)).toBeNull();
    await u.click(screen.getByRole('button', { name: 'Réessayer' }));
    expect(essais).toBe(1);
  });

  test('Urgence sans proposition calculable : actions urgentes maintenues, jamais d’invitation à attendre', () => {
    const d = avec(CAS_SAB_SASM, (x) => {
      x.prelevements = [];
      x.patient.gravite = 'choc_septique';
    });
    const p = plan(d);
    expect(p.options).toHaveLength(0);
    expect(p.sortie.urgence).toBe(true);
    expect(p.sortie.actionsUrgentes.map((a) => a.texte).join(' ')).toMatch(/Antibiothérapie probabiliste dans l'heure/);
    for (const m of p.sortie.motifs) expect(m.prochaineAction).toMatch(/^Ne pas attendre/);
  });
});

describe('Fonction rénale dans les propositions', () => {
  test('chaque adaptation précise l’estimation utilisée et pourquoi, avec la source de la référence', () => {
    const p = plan(SARM_STABLE);
    const v = prescription(p, 'vancomycine')!;
    expect(v.adaptations.join(' ')).toMatch(/Clairance estimée de la créatinine \(Cockcroft-Gault\) ≈ \d+ mL\/min/);
    expect(v.adaptations.join(' ')).toMatch(/formule de structure Cockcroft-Gault/);
    expect(v.sources.some((s) => s.source === 'RCP-vancomycine' && /Hommes/.test(s.extrait ?? ''))).toBe(true);
  });

  test('changement de créatininémie modifiant une adaptation : recalcul et signalement', () => {
    const avant = plan(SARM_STABLE);
    const apres = plan(avec(SARM_STABLE, (x) => (x.patient.renal.creatinine!.valeur = 400)));
    const a = prescription(avant, 'vancomycine')!.adaptations[0];
    const b = prescription(apres, 'vancomycine')!.adaptations[0];
    expect(a).not.toBe(b);
    expect(b).toMatch(/< 20 mL\/min/);
    expect(comparerPlans(avant, apres).join(' ')).toMatch(/vancomycine : adaptation rénale modifiée/i);
  });

  test('fonction rénale instable : aucune adaptation automatique, limite et avis', () => {
    const p = plan(avec(SARM_STABLE, (x) => (x.patient.renal.stabilite = 'instable')));
    const v = prescription(p, 'vancomycine')!;
    expect(v.adaptations[0]).toMatch(/Adaptation rénale non calculée : fonction rénale instable/);
    expect(v.adaptations[0]).toMatch(/Avis pharmacologique ou néphrologique ; dosage plasmatique/);
  });

  test('hémodialyse : règles propres à la modalité, pas d’estimation', () => {
    const p = plan(CAS_SARM_HEMODIALYSE);
    const v = prescription(p, 'vancomycine')!;
    expect(v.adaptations.join(' ')).toMatch(/Hémodialyse intermittente/);
    expect(v.adaptations.join(' ')).not.toMatch(/Cockcroft-Gault ≈/);
  });
});

describe('Interface : explication et accès direct aux champs', () => {
  test('« Compléter » mène directement au champ du poids', async () => {
    const u = userEvent.setup();
    render(<App dossierInitial={casFictif('sarm-hd')} />);
    const fiche = screen.getByRole('heading', { name: /^Prise en charge/ }).closest('section')!;
    // Les éléments manquants sont listés en tête de fiche, chacun menant à son champ.
    const manquants = within(fiche).getByRole('region', { name: /Éléments manquants/ });
    await u.click(within(manquants).getByRole('button', { name: /^Compléter : poids/ }));
    await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText('Poids')));
  });

  test('fiche patient : estimations distinctes avec formule, version, unité et détail du calcul', async () => {
    render(<App dossierInitial={casFictif('sab')} />);
    const fiche = screen.getByRole('heading', { name: /^Prise en charge/ }).closest('section')!;
    expect(within(fiche).getByText(/DFG estimé indexé/)).toBeInTheDocument();
    expect(within(fiche).getAllByText(/mL\/min\/1,73 m²/).length).toBeGreaterThan(0);
    expect(within(fiche).getAllByText(/version 2009, sans coefficient racial/).length).toBeGreaterThan(0);
    expect(within(fiche).getAllByText('Détail du calcul et source').length).toBe(3);
  });
});
