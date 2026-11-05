/**
 * Intégrité de la base clinique et du registre des sources (exécuté aussi par la veille).
 */
import { SOURCES, SOURCES_PAR_ID } from '../clinical/sources';
import { MOLECULES } from '../clinical/molecules';
import { REGLES } from '../clinical/rules';
import { decider } from '../engine/decider';
import { CAS_FICTIFS } from './cas-fictifs';
import { clonerDossier, nettoyerDossier } from '../engine/etat';
import type { SourceRef } from '../clinical/types';

function toutesLesRefsMolecules(): SourceRef[] {
  const refs: SourceRef[] = [];
  for (const m of MOLECULES) {
    for (const r of m.regimens) refs.push(...r.sources);
    for (const p of m.adaptationRenale.paliers) refs.push(...p.sources);
    if (m.adaptationRenale.hemodialyse) refs.push(...m.adaptationRenale.hemodialyse.sources);
    if (m.adaptationRenale.eerContinue) refs.push(...m.adaptationRenale.eerContinue.sources);
    for (const s of m.surveillance) refs.push(...s.sources);
    for (const s of m.stp ?? []) refs.push(...s.sources);
    if (m.grossesse) refs.push(...m.grossesse.sources);
    for (const i of m.interactionsPertinentes ?? []) refs.push(...i.sources);
  }
  return refs;
}

describe('Registre des sources', () => {
  test('identifiants uniques et champs obligatoires', () => {
    const ids = SOURCES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of SOURCES) {
      expect(s.url).toMatch(/^https:\/\//);
      expect(s.dateConsultation).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(s.organisme.length).toBeGreaterThan(1);
    }
  });

  test('le domaine détourné sitegpr.com n\'est jamais cité', () => {
    expect(SOURCES.some((s) => /sitegpr\.com/.test(s.url))).toBe(false);
  });

  test('toute référence des molécules pointe vers une source du registre', () => {
    const manquantes = toutesLesRefsMolecules().filter((r) => !SOURCES_PAR_ID[r.source]).map((r) => r.source);
    expect([...new Set(manquantes)]).toEqual([]);
  });

  test('toute référence produite par les règles sur les cas fictifs pointe vers le registre', () => {
    const manquantes = new Set<string>();
    for (const c of CAS_FICTIFS) {
      const d = clonerDossier(c.dossier);
      nettoyerDossier(d);
      const p = decider(d, { maintenant: new Date('2026-11-04T10:00:00Z') });
      for (const r of p.sources) if (!SOURCES_PAR_ID[r.source]) manquantes.add(r.source);
      for (const a of p.urgence.alertes) for (const r of a.sources ?? []) if (!SOURCES_PAR_ID[r.source]) manquantes.add(r.source);
    }
    expect([...manquantes]).toEqual([]);
  });
});

describe('Base clinique', () => {
  test('identifiants de règles et de molécules uniques', () => {
    expect(new Set(REGLES.map((r) => r.id)).size).toBe(REGLES.length);
    expect(new Set(MOLECULES.map((m) => m.id)).size).toBe(MOLECULES.length);
  });

  test('chaque régime posologique est sourcé pour la posologie', () => {
    for (const m of MOLECULES) for (const r of m.regimens) expect(r.sources.some((s) => s.justifie === 'posologie'), `${m.id}/${r.id}`).toBe(true);
  });

  test('aucune cible de STP n\'est affichée comme vérifiée sans source de surveillance', () => {
    for (const m of MOLECULES) for (const s of m.stp ?? []) if (s.cible?.verifiee) expect(s.sources.some((x) => x.justifie === 'surveillance'), s.id).toBe(true);
  });

  test('aucune règle n\'est validée par un humain dans cette version (statut honnête)', () => {
    expect(REGLES.every((r) => r.statut !== 'validee_humain' && r.statut !== 'publiee')).toBe(true);
  });

  test('les molécules dont le RCP n\'a pas été consulté restent en brouillon', () => {
    for (const id of ['cefoxitine', 'cefixime']) expect(MOLECULES.find((m) => m.id === id)?.statut).toBe('brouillon');
  });
});
