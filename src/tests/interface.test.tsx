import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../ui/App';
import { casFictif } from './cas-fictifs';

describe('Interface', () => {
  test('affiche l\'avertissement, la version clinique et un résumé vide', () => {
    render(<App />);
    expect(screen.getAllByText(/non validé pour l'usage clinique/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Version clinique/)).toBeInTheDocument();
    expect(screen.getByLabelText('Résumé du patient')).toBeInTheDocument();
  });

  test('charger le cas « 90 ans, BGN » : fiche partielle, options conditionnelles, informations manquantes visibles', async () => {
    render(<App dossierInitial={casFictif('bgn-90')} />);
    expect(screen.getByText(/Bactériémie à BGN non identifié/)).toBeInTheDocument();
    expect(screen.getByText(/partiellement couverte/)).toBeInTheDocument();
    expect(screen.getByText(/Informations manquantes pour individualiser/)).toBeInTheDocument();
    expect(screen.getByText(/Alternatives et options conditionnelles/)).toBeInTheDocument();
  });

  test('« inconnu » est distinct de « non » et le recalcul est immédiat', async () => {
    const u = userEvent.setup();
    render(<App dossierInitial={casFictif('sab')} />);
    expect(screen.getAllByText(/Céfazoline \(SASM\)/).length).toBeGreaterThan(0);
    const groupe = screen.getByRole('radiogroup', { name: 'Gravité' });
    await u.click(within(groupe).getByRole('radio', { name: 'Choc septique' }));
    expect(screen.getAllByText(/urgence immédiate/).length).toBeGreaterThan(0);
  });

  test('retenir une autre option change le calendrier affiché', async () => {
    const u = userEvent.setup();
    render(<App dossierInitial={casFictif('sab')} />);
    await u.click(screen.getByText(/Alternatives et options conditionnelles/));
    const boutons = screen.getAllByRole('button', { name: 'Retenir cette option' });
    await u.click(boutons[0]);
    expect(screen.getByText(/Calendrier établi pour l'option : Cloxacilline/)).toBeInTheDocument();
  });
});
