/**
 * Repli des étapes terminées : jamais d'étape bloquée repliée, résumé lisible, réouverture d'un clic,
 * contenu conservé (masqué, pas supprimé).
 */
import { describe, expect, test } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { App } from '../ui/App';
import { peutReplierAuto } from '../ui/Repli';
import { resumesEtapes } from '../ui/ResumePatient';
import { contexteUI } from '../ui/contexte-ui';
import { dossierParDefaut } from '../engine/etat';
import { CAS_ECOLI_I } from './cas-fictifs';

describe('Règle de repli automatique', () => {
  const base = { visible: true, aCompleter: false, touchee: true, focusDedans: false, basSection: 50, hautVisible: 120 };
  test('étape terminée, travaillée, quittée et sortie de l’écran par le haut : repliée', () => {
    expect(peutReplierAuto(base)).toBe(true);
  });
  test('jamais si une donnée bloquante, si non travaillée, si le focus y est, ou si encore visible', () => {
    expect(peutReplierAuto({ ...base, aCompleter: true })).toBe(false);
    expect(peutReplierAuto({ ...base, touchee: false })).toBe(false);
    expect(peutReplierAuto({ ...base, focusDedans: true })).toBe(false);
    expect(peutReplierAuto({ ...base, basSection: 200 })).toBe(false);
    expect(peutReplierAuto({ ...base, visible: false })).toBe(false);
  });
});

describe('Résumé des étapes', () => {
  test('dossier vide : rien n’est inventé', () => {
    const d = dossierParDefaut();
    const r = resumesEtapes(d, contexteUI(d));
    expect(r['t-entree']).toBe('Point d’entrée non choisi');
    expect(r['t-patient']).toContain('âge ?');
    expect(r['t-micro']).toBe('Aucun prélèvement saisi');
    expect(r['t-horaires']).toContain('horaire non saisi');
  });
});

describe('Repli manuel dans l’application', () => {
  test('une étape sans donnée bloquante se replie, affiche son résumé et se rouvre', () => {
    render(<App dossierInitial={CAS_ECOLI_I} />);
    const section = document.querySelector<HTMLElement>('[data-etape="t-horaires"]')!;
    const bouton = within(section).getByRole('button', { name: /Replier/ });
    fireEvent.click(bouton);
    expect(section).toHaveClass('repliee');
    expect(document.getElementById('t-horaires-corps')).not.toBeVisible();
    // Le contenu reste dans la page : aucune saisie perdue.
    expect(document.getElementById('t-horaires-corps')).toBeInTheDocument();
    expect(section.querySelector('.resume-etape')).toHaveTextContent('1re dose');
    expect(screen.getByRole('button', { name: /Tout déplier/ })).toBeInTheDocument();
    fireEvent.click(within(section).getByRole('button', { name: /Modifier/ }));
    expect(section).not.toHaveClass('repliee');
    expect(document.getElementById('t-horaires-corps')).toBeVisible();
  });

  test('une étape avec une donnée bloquante n’offre pas de repli', () => {
    render(<App />);
    const section = document.querySelector<HTMLElement>('[data-etape="t-entree"]')!;
    expect(within(section).queryByRole('button', { name: /Replier/ })).toBeNull();
  });

  test('la progression rouvre l’étape repliée', () => {
    render(<App dossierInitial={CAS_ECOLI_I} />);
    const section = document.querySelector<HTMLElement>('[data-etape="t-horaires"]')!;
    fireEvent.click(within(section).getByRole('button', { name: /Replier/ }));
    const nav = screen.getByRole('navigation', { name: 'Étapes de la saisie' });
    fireEvent.click(within(nav).getByRole('button', { name: /Horaires/ }));
    expect(section).not.toHaveClass('repliee');
  });
});
