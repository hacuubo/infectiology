/**
 * B2 (relecture v3) : une panne du calcul rénal pendant la saisie ne doit ni effacer l'écran ni perdre les
 * données, et doit s'afficher comme une erreur technique, jamais comme une conclusion médicale.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { App } from '../ui/App';
import { casFictif } from './cas-fictifs';

vi.mock('../calc/renal', async (importOriginal) => {
  const reel = await importOriginal<typeof import('../calc/renal')>();
  return {
    ...reel,
    estimerFonctionRenale: (e: Parameters<typeof reel.estimerFonctionRenale>[0]) => {
      if (e.ageAns === 99) throw new Error('panne simulée du calcul rénal');
      return reel.estimerFonctionRenale(e);
    },
  };
});

test('panne du calcul rénal : erreur technique affichée, saisie conservée, aucune conclusion médicale', async () => {
  // React journalise les erreurs captées par les limites d'erreur : attendu ici.
  const journal = vi.spyOn(console, 'error').mockImplementation(() => {});
  const u = userEvent.setup();
  render(<App dossierInitial={casFictif('sab')} />);
  const age = screen.getByLabelText('Âge') as HTMLInputElement;
  await u.clear(age);
  await u.type(age, '99');
  // Le formulaire reste affiché avec la valeur saisie ; la fiche annonce une erreur technique.
  expect(screen.getAllByText(/ce n’est pas une conclusion médicale/i).length).toBeGreaterThan(0);
  expect(screen.queryByText(/Pas d'antibiothérapie indiquée/)).toBeNull();
  // Correction de la saisie : tout revient.
  await u.clear(screen.getByLabelText('Âge'));
  await u.type(screen.getByLabelText('Âge'), '64');
  expect(screen.getByRole('heading', { name: /Fiche opérationnelle/ })).toBeInTheDocument();
  journal.mockRestore();
}, 20000);
