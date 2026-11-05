/**
 * Tests de l'audit documentaire du relecteur 2 (2026-11-05).
 * Chaque résultat attendu est établi à partir de la source citée en commentaire (relue le 2026-11-04/05),
 * indépendamment du code testé. Patients FICTIFS.
 */
import { decider } from '../engine/decider';
import { clonerDossier, nettoyerDossier, type Dossier } from '../engine/etat';
import { MOLECULES_PAR_ID } from '../clinical/molecules';
import { SOURCES_PAR_ID } from '../clinical/sources';
import type { Plan, SpecSTP } from '../clinical/types';
import { CAS_BGN_90_URINAIRE, CAS_BLSE_AMIKACINE, CAS_ECOLI_I, CAS_EI_FAECALIS, CAS_SARM_HEMODIALYSE, CAS_SAB_SASM } from './cas-fictifs';

const MAINTENANT = new Date('2026-11-05T10:00:00Z');
function plan(d: Dossier): Plan {
  const c = clonerDossier(d);
  nettoyerDossier(c);
  return decider(c, { maintenant: MAINTENANT, modeUsageClinique: false });
}
const toutesMolecules = (p: Plan) => p.options.flatMap((o) => o.prescriptions.map((x) => x.moleculeId));

describe('Audit relecteur 2 — aminosides', () => {
  test('insuffisance rénale : résiduelle d\'amikacine AVANT la 2e injection, < 2,5 mg/L (ANSM 2011 p. 8 ; RCP amikacine §4.2)', () => {
    const p = plan(CAS_BLSE_AMIKACINE); // IRA déclarée
    const amk = p.options.flatMap((o) => o.prescriptions).find((x) => x.moleculeId === 'amikacine')!;
    const ir = amk.surveillance.find((s) => (s.element as SpecSTP).id === 'amikacine-residuelle-ir')?.element as SpecSTP | undefined;
    expect(ir).toBeDefined();
    expect(ir!.premierPrelevement.numeroDose).toBe(2);
    expect(ir!.premierPrelevement.avantDoseSuivante).toBe(true);
    expect(ir!.cible).toMatchObject({ max: 2.5, unite: 'mg/L' });
  });

  test('gentamicine : cible de pic 30-40 mg/L sans restriction de dose inventée (ANSM 2011, tableau 1)', () => {
    const pic = MOLECULES_PAR_ID.gentamicine.stp!.find((s) => s.id === 'gentamicine-pic')!;
    expect(pic.cible).toMatchObject({ min: 30, max: 40 });
    expect(pic.cible!.texte).not.toMatch(/6-8 mg\/kg/);
    expect(MOLECULES_PAR_ID.gentamicine.stp!.some((s) => s.id === 'gentamicine-residuelle-ir' && s.premierPrelevement.numeroDose === 2)).toBe(true);
  });

  test('endocardite probabiliste avec sepsis : gentamicine 5 mg/kg/j (SPILF/AEPEI 2025, diapo 6)', () => {
    const d = clonerDossier(CAS_EI_FAECALIS);
    d.patient.valve = 'native';
    d.patient.gravite = 'sepsis';
    d.prelevements[0] = { ...d.prelevements[0], stade: 'examen_direct', examenDirect: 'cgp_chainettes', organisme: undefined, antibiogramme: undefined };
    const p = plan(d);
    const genta = p.options.find((o) => o.id === 'ei-proba-nve')?.prescriptions.find((x) => x.moleculeId === 'gentamicine');
    expect(genta?.regimenId).toBe('gentamicine-5-ei-proba');
  });
});

describe('Audit relecteur 2 — vancomycine', () => {
  test('résiduelle (discontinu) : 2e jour de traitement, sans numéro de dose dépendant d\'un intervalle de 24 h (RCP §4.2)', () => {
    const r = MOLECULES_PAR_ID.vancomycine.stp!.find((s) => s.id === 'vancomycine-residuelle')!;
    expect(r.premierPrelevement.jour).toBe(2);
    expect(r.premierPrelevement.numeroDose).toBeUndefined();
  });

  test('créatininémie : la fréquence hebdomadaire/quotidienne de Rybak 2020 (dosages de vancomycine) n\'est pas attribuée à la créatinine', () => {
    const e = MOLECULES_PAR_ID.vancomycine.surveillance.find((s) => s.id === 'vancomycine-renal')!;
    expect(e.quand.texte).not.toMatch(/hebdomadaire/);
    expect(e.sources.some((s) => /once-weekly/.test(s.extrait ?? ''))).toBe(false);
  });

  test('aucun « pic » de vancomycine', () => {
    expect(MOLECULES_PAR_ID.vancomycine.stp!.some((s) => s.parametre === 'pic')).toBe(false);
  });
});

describe('Audit relecteur 2 — RCP relus', () => {
  test('céfépime : 2 g × 3/j → 1 g × 3/j (50-30), 1 g × 2/j (29-11), 1 g × 1/j (≤ 10) (RCP Céfépime Stragen §4.2)', () => {
    const pal = MOLECULES_PAR_ID.cefepime.adaptationRenale.paliers;
    expect(pal.find((x) => x.clcrMin === 30)!.texte).toMatch(/2 g ×3\/j → 1 g ×3\/j/);
    expect(pal.find((x) => x.clcrMin === 11)!.texte).toMatch(/2 g ×3\/j → 1 g ×2\/j/);
    expect(pal.find((x) => x.clcrMax === 11)!.texte).toMatch(/2 g ×3\/j → 1 g ×1\/j/);
  });

  test('ertapénème : ne pas utiliser si ClCr ≤ 30 ni en hémodialyse (RCP Ertapenem Panpharma §4.2)', () => {
    const ar = MOLECULES_PAR_ID.ertapeneme.adaptationRenale;
    expect(ar.statut).toBe('verifiee_ia');
    expect(ar.paliers.find((x) => x.clcrMax !== undefined && x.clcrMax <= 31)!.texte).toMatch(/NE PAS UTILISER/);
    expect(ar.hemodialyse!.texte).toMatch(/NE PAS UTILISER/);
    expect(SOURCES_PAR_ID['RCP-ertapeneme'].statutAcces).toBe('consultee');
  });

  test('céfixime ≤ 20 mL/min : 200 mg/j en une prise ; céfoxitine : tableau IR du RCP', () => {
    expect(MOLECULES_PAR_ID.cefixime.adaptationRenale.paliers.some((x) => /200 mg\/j/.test(x.texte))).toBe(true);
    expect(MOLECULES_PAR_ID.cefoxitine.adaptationRenale.paliers.length).toBeGreaterThanOrEqual(4);
    expect(SOURCES_PAR_ID['RCP-cefoxitine'].statutAcces).toBe('consultee');
    expect(MOLECULES_PAR_ID.cefoxitine.grossesse?.statut).toBe('non_verifie');
  });

  test('grossesse : aucun statut « utilisable » sans source lue', () => {
    for (const m of Object.values(MOLECULES_PAR_ID)) if (m.grossesse?.statut === 'utilisable') expect(m.grossesse.sources.length, m.id).toBeGreaterThan(0);
  });
});

describe('Audit relecteur 2 — catégorie EUCAST I et relais', () => {
  test('ceftriaxone rendue I : forte posologie 2 g toutes les 12 h (SPILF/SFPT/CA-SFM p. 165 ; EUCAST 2 g × 2)', () => {
    const p = plan(CAS_ECOLI_I);
    const o = p.options.find((x) => x.id === 'doc-c3g')!;
    expect(o.prescriptions[0].regimenId).toBe('ceftriaxone-2g12h');
  });

  test('ciprofloxacine ou cotrimoxazole rendus I : pas de relais à posologie standard, alerte de forte posologie (Annexe 9 p. 168, 172)', () => {
    const d = clonerDossier(CAS_BGN_90_URINAIRE);
    d.prelevements[0].antibiogramme = d.prelevements[0].antibiogramme!.map((r) => (r.dci === 'ciprofloxacine' || r.dci === 'cotrimoxazole' ? { ...r, categorie: 'I' as const } : r));
    const p = plan(d);
    expect(p.options.some((o) => o.id === 'relais-cipro' || o.id === 'relais-smx')).toBe(false);
    expect(p.urgence.alertes.some((a) => /forte posologie \(750 mg/.test(a.texte))).toBe(true);
  });
});

describe('Audit relecteur 2 — infections urinaires', () => {
  test('IU associée aux soins, antécédent de BLSE < 6 mois et sepsis : carbapénème + amikacine (IUAS 2015 R.47)', () => {
    const d = clonerDossier(CAS_BLSE_AMIKACINE);
    d.patient.materielUrinaire = 'sonde_vesicale';
    const p = plan(d);
    const o = p.options.find((x) => x.id === 'proba-iu-grave-blse');
    expect(o?.prescriptions.map((x) => x.moleculeId).sort()).toEqual(['amikacine', 'meropeneme']);
  });

  test('homme immunodéprimé : hors SPILF 2026 → options en brouillon', () => {
    const d = clonerDossier(CAS_ECOLI_I);
    d.patient.immunodepression = 'oui';
    const p = plan(d);
    expect(p.options.length).toBeGreaterThan(0);
    expect(p.options.every((o) => o.statut === 'brouillon')).toBe(true);
  });

  test('femme jeune immunodéprimée, PNA sans gravité : à risque de complication → uroscanner (SPILF 2015 p. 6 et p. 21)', () => {
    const d = clonerDossier(CAS_BGN_90_URINAIRE);
    d.patient.age = 40;
    d.patient.gravite = 'stable';
    d.patient.immunodepression = 'oui';
    const p = plan(d);
    expect(p.controles.some((c) => c.id === 'ctl-iu-uroscanner')).toBe(true);
  });
});

describe('Audit relecteur 2 — cocci à Gram positif', () => {
  test('bactériémie à streptocoque hors endocardite : molécule extrapolée → brouillon ; durée 7 j sourcée', () => {
    const d = clonerDossier(CAS_SAB_SASM);
    d.prelevements[0] = { ...d.prelevements[0], organisme: 'streptococcus_pyogenes', antibiogramme: [{ dci: 'amoxicilline', categorie: 'S' }] };
    const p = plan(d);
    expect(p.options.length).toBeGreaterThan(0);
    expect(p.options.every((o) => o.statut === 'brouillon')).toBe(true);
    expect(p.options[0].prescriptions[0].duree.dureePrevueJours).toBe(7);
  });

  test('endocardite à SARM : daptomycine seule bloquée (association requise), vancomycine ESC en alternative', () => {
    const d = clonerDossier(CAS_SARM_HEMODIALYSE);
    d.prelevements[0].foyer = 'endocardite';
    const p = plan(d);
    expect(p.options.find((o) => o.id === 'ei-staph')?.statut).toBe('brouillon');
    expect(toutesMolecules(p)).toContain('vancomycine');
  });
});
