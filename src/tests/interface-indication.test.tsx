/**
 * Interface : décision « faut-il traiter ? » et antibiogramme guidé (patients fictifs).
 */
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../ui/App';
import { casFictif } from './cas-fictifs';

describe('Interface : indication et antibiogramme guidé', () => {
  test('ECBU sans symptôme : la conclusion « pas d\'antibiothérapie » est complète et aucune option n\'est proposée', async () => {
    render(<App dossierInitial={casFictif('ecbu-colonisation')} />);
    expect(screen.getByRole('heading', { name: /Conclusion sur l'indication/ })).toBeInTheDocument();
    expect(screen.getAllByText(/Pas d'antibiothérapie indiquée dans la situation renseignée/).length).toBeGreaterThan(0);
    expect(screen.getByText('Ce qui justifie cette conclusion')).toBeInTheDocument();
    expect(screen.getByText('Exceptions recherchées')).toBeInTheDocument();
    expect(screen.getByText('Reconsidérer la décision si')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retenir cette option' })).not.toBeInTheDocument();
  });

  test('l\'étape 1 recalcule la décision : des signes urinaires récents avec fièvre font passer à « traiter »', async () => {
    const u = userEvent.setup();
    render(<App dossierInitial={casFictif('ecbu-colonisation')} />);
    await u.click(within(screen.getByRole('radiogroup', { name: 'Signes urinaires' })).getByRole('radio', { name: 'Présents, récents' }));
    await u.click(within(screen.getByRole('radiogroup', { name: /Fièvre/ })).getByRole('radio', { name: 'Oui' }));
    expect(screen.getByRole('heading', { name: /Options thérapeutiques/ })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Retenir cette option' }).length).toBeGreaterThan(0);
  });

  test('antibiogramme guidé : signaler une BLSE retire la question sur la céphalosporinase et demande la céfoxitine', async () => {
    const u = userEvent.setup();
    render(<App dossierInitial={casFictif('ecbu-c3gr')} />);
    const mecanismes = () => screen.getByRole('group', { name: 'Mécanisme rapporté' });
    expect(within(mecanismes()).getByText('Céphalosporinase hyperproduite ou acquise (AmpC)')).toBeInTheDocument();
    await u.click(within(mecanismes()).getByRole('radio', { name: 'BLSE rapportée' }));
    expect(within(mecanismes()).queryByText('Céphalosporinase hyperproduite ou acquise (AmpC)')).not.toBeInTheDocument();
    // La question reste disponible dans « Ajouter d'autres résultats ».
    expect(screen.getAllByText('Céphalosporinase hyperproduite ou acquise (AmpC)')).toHaveLength(1);
    expect(within(screen.getByRole('group', { name: 'Choix du traitement' })).getByText('Céfoxitine')).toBeInTheDocument();
  });

  test('cliquer à nouveau sur une réponse l\'efface (retour à « non renseigné »)', async () => {
    const u = userEvent.setup();
    render(<App dossierInitial={casFictif('ecbu-c3gr')} />);
    const blse = () => within(screen.getByRole('group', { name: 'Mécanisme rapporté' })).getByRole('radio', { name: 'BLSE rapportée' });
    await u.click(blse());
    expect(blse()).toHaveAttribute('aria-checked', 'true');
    await u.click(blse());
    expect(blse()).toHaveAttribute('aria-checked', 'false');
  });
});
