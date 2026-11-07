/**
 * Situations sans recommandation dédiée (2026-11-06) : l'absence est expliquée, pas comblée par une extrapolation.
 * BGN sans foyer : voir acceptation.test.ts. Ici : staphylocoques à coagulase négative.
 */
import { decider } from '../engine/decider';
import { clonerDossier, nettoyerDossier, type Dossier } from '../engine/etat';
import type { Plan } from '../clinical/types';
import { CAS_SCN_DEUX_SERIES_MATERIEL } from './cas-fictifs';

const MAINTENANT = new Date('2026-11-06T10:00:00Z');
function plan(d: Dossier, modif?: (x: Dossier) => void): Plan {
  const c = clonerDossier(d);
  modif?.(c);
  nettoyerDossier(c);
  return decider(c, { maintenant: MAINTENANT });
}
const absence = (p: Plan) => p.sortie.motifs.find((m) => m.statut.startsWith('Aucune recommandation dédiée'));

describe('Staphylocoque à coagulase négative : choix de la molécule', () => {
  test('sans cathéter : aucune molécule extrapolée, absence de recommandation expliquée, traitement toujours indiqué', () => {
    const p = plan(CAS_SCN_DEUX_SERIES_MATERIEL, (x) => {
      x.patient.materielVasculaire = 'aucun';
      x.prelevements[0].foyer = 'inconnu';
    });
    expect(p.options).toHaveLength(0);
    expect(p.indication?.decision).toBe('traiter');
    const a = absence(p)!;
    expect(a.motif).toMatch(/coagulase négative sans cathéter/);
    expect(a.limite).toMatch(/Cela ne signifie pas qu'aucun traitement n'est indiqué/);
    expect(a.prochaineAction).toMatch(/Avis du SMIT/);
  });

  test('cathéter et sensibilité à la méticilline inconnue : vancomycine probabiliste de l’infection de cathéter (SRLF 2020) conservée', () => {
    const p = plan(CAS_SCN_DEUX_SERIES_MATERIEL);
    expect(p.options.map((o) => o.prescriptions[0].moleculeId)).toEqual(['vancomycine']);
    expect(absence(p)).toBeUndefined();
  });

  test('cathéter et SCN sensible à la méticilline : pas de céfazoline extrapolée, absence expliquée', () => {
    const p = plan(CAS_SCN_DEUX_SERIES_MATERIEL, (x) => {
      x.prelevements[0].stade = 'antibiogramme';
      x.prelevements[0].antibiogramme = [{ dci: 'cefoxitine', categorie: 'S' }];
    });
    expect(p.options).toHaveLength(0);
    expect(absence(p)!.motif).toMatch(/sensible à la méticilline/);
  });
});
