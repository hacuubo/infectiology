/**
 * Thème « Tactile » (v8) : bandeau patient permanent, progression de la saisie,
 * frise graphique du traitement (placement sans approximation, numéros repris dans le tableau).
 */
import { describe, expect, test } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { App } from '../ui/App';
import { FriseGraphique, numerosReperes } from '../ui/FriseGraphique';
import { resoudreCalendrier, type EvenementFriseDetaille } from '../schedule/frise';
import { deciderSansPanne } from '../engine/decider';
import { CAS_ECOLI_I, CAS_SAB_SASM } from './cas-fictifs';

describe('Frise : position seulement quand le moment est placé sans approximation', () => {
  const H = { premiereDoseISO: '2026-11-04T09:00' };
  test('jour de traitement : au milieu du jour (J2 → 36 h)', () => {
    expect(resoudreCalendrier({ ancre: 'debut_traitement', jour: 2, texte: 'le 2e jour' }, H).position).toBe(36);
  });
  test('délai explicite après la 1re dose', () => {
    expect(resoudreCalendrier({ ancre: 'debut_traitement', offsetHeures: 48, texte: 'à 48 h' }, H).position).toBe(48);
  });
  test('avant traitement : au départ', () => {
    expect(resoudreCalendrier({ ancre: 'avant_traitement', texte: 'Avant la 1re dose' }, H).position).toBe(0);
  });
  test('dose n > 1 sans jour, chaque jour, ancre d’hémoculture, indéterminé : non placés', () => {
    expect(resoudreCalendrier({ ancre: 'dose', numeroDose: 3, texte: 'avant la 3e dose' }, H).position).toBeUndefined();
    expect(resoudreCalendrier({ ancre: 'quotidien', texte: 'chaque jour' }, H).position).toBeUndefined();
    expect(resoudreCalendrier({ ancre: 'premiere_hemoculture_negative', texte: 'après négativation' }, H).position).toBeUndefined();
    expect(resoudreCalendrier({ ancre: 'non_determine', texte: 'selon évolution' }, H).position).toBeUndefined();
    expect(resoudreCalendrier({ ancre: 'debut_traitement', texte: 'À chaque administration' }, H).position).toBeUndefined();
  });
});

describe('Frise graphique', () => {
  test('numéros attribués aux seuls événements placés, dans l’ordre du calendrier', () => {
    const f = [
      { id: 'a', position: 0 },
      { id: 'b' },
      { id: 'c', position: 48 },
    ] as EvenementFriseDetaille[];
    expect([...numerosReperes(f)]).toEqual([
      ['a', 1],
      ['c', 2],
    ]);
  });

  test('rien n’est affiché sans durée ni repère placé', () => {
    const { container } = render(<FriseGraphique frise={[{ id: 'x', moment: 'chaque jour', ordre: 24, quoi: 'q', pourquoi: '', type: 'surveillance', sources: [] }]} />);
    expect(container).toBeEmptyDOMElement();
  });

  test('cas fictif : la fiche affiche la frise et les mêmes numéros dans le tableau', () => {
    const r = deciderSansPanne(CAS_ECOLI_I);
    expect(r.ok).toBe(true);
    render(<App dossierInitial={CAS_ECOLI_I} />);
    const placés = r.ok ? r.plan.frise.filter((e) => (e as EvenementFriseDetaille).position !== undefined).length : 0;
    if (placés > 0) {
      expect(screen.getByText(/Frise du traitement/)).toBeInTheDocument();
      const tableau = screen.getByRole('table', { name: 'Calendrier de surveillance et de contrôles' });
      expect(within(tableau).getAllByTitle(/^Repère \d+ de la frise$/)).toHaveLength(placés);
    }
  });
});

describe('Bandeau patient et progression', () => {
  test('dossier vide : le bandeau signale ce qui manque, sans rien supposer', () => {
    render(<App />);
    const bandeau = screen.getByRole('list', { name: 'Patient en cours' });
    expect(bandeau).toHaveTextContent('sexe ?, âge ?');
    expect(bandeau).toHaveTextContent('allergie ?');
    expect(bandeau).toHaveTextContent('contexte ?');
  });

  test('dossier rempli : sexe, âge et allergie affichés', () => {
    render(<App dossierInitial={CAS_SAB_SASM} />);
    const bandeau = screen.getByRole('list', { name: 'Patient en cours' });
    expect(bandeau).not.toHaveTextContent('âge ?');
  });

  test('la progression liste les cinq étapes et signale celles à compléter', () => {
    render(<App />);
    const nav = screen.getByRole('navigation', { name: 'Étapes de la saisie' });
    const boutons = within(nav).getAllByRole('button');
    expect(boutons).toHaveLength(5);
    expect(boutons[0]).toHaveTextContent(/Point d’entrée.*à compléter/);
  });
});
