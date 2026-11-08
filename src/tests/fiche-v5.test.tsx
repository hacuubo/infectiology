/**
 * Fiche concise (v5) : éléments manquants en tête, cliquables et surlignés dans la saisie ; plus d'étapes
 * du parcours ni de mention « non validée » en tête ; synthèse avec traitement, dose, voie, durée et
 * surveillance ; sources en liens courts.
 */
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../ui/App';
import { casFictif } from './cas-fictifs';
import { clonerDossier } from '../engine/etat';

const fiche = () => screen.getByRole('heading', { name: /^Prise en charge/ }).closest('section')!;

describe('Fiche concise', () => {
  test('ni étapes du parcours, ni mention « non validée » en tête : la mention est en fin de fiche', () => {
    render(<App dossierInitial={casFictif('sarm-hd')} />);
    const f = fiche();
    expect(within(f).queryByRole('list', { name: 'Étapes du parcours' })).toBeNull();
    expect(within(f).queryByText(/^vérifiée par IA$/)).toBeNull();
    const sections = f.querySelectorAll('.fiche-section');
    expect(sections[sections.length - 1]).toHaveTextContent(/non validées par un humain/);
    for (const el of within(f).getAllByText(/non validées par un humain/)) expect(sections[sections.length - 1]).toContainElement(el);
  });

  test('éléments manquants : liste en tête, champs surlignés dans la saisie, surbrillance levée une fois complétés', async () => {
    const u = userEvent.setup();
    render(<App dossierInitial={casFictif('sarm-hd')} />);
    const manquants = within(fiche()).getByRole('region', { name: /Éléments manquants/ });
    // Avant la synthèse.
    expect(manquants.compareDocumentPosition(fiche().querySelector('.synthese')!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(manquants).getByRole('button', { name: /^Compléter : poids/ })).toHaveTextContent(/^poids$/);
    const champPoids = document.querySelector('[data-champ="patient.poidsKg"]')!;
    expect(champPoids).toHaveClass('manquant');
    expect(champPoids).toHaveTextContent('à compléter');
    // Donnée qui affinerait seulement (horaires de dialyse) : signalée comme facultative.
    expect(document.querySelector('[data-champ="patient.renal.horairesDialyse"]')).toHaveClass('facultatif');
    await u.type(screen.getByLabelText('Poids'), '70');
    expect(document.querySelector('[data-champ="patient.poidsKg"]')).not.toHaveClass('manquant');
    expect(within(fiche()).queryByRole('button', { name: /^Compléter : poids/ })).toBeNull();
  }, 20000);

  test('synthèse : traitement retenu avec dose, voie et durée, surveillance résumée avec la cible du dosage', () => {
    render(<App dossierInitial={casFictif('sarm-hd')} />);
    const synthese = fiche().querySelector('.synthese')!;
    // Foyer manquant (bloque le choix) : 1re ligne provisoire, avec le motif du moteur mot pour mot.
    expect(synthese).toHaveTextContent(/Traitement proposé \(1re ligne\) — provisoire/);
    expect(synthese).toHaveTextContent(/la proposition affichée reste provisoire/);
    expect(synthese).not.toHaveTextContent(/Traitement retenu/);
    expect(synthese).toHaveTextContent(/Vancomycine : Dose de charge/);
    expect(synthese).toHaveTextContent(/— IV, perfusion/);
    expect(synthese).toHaveTextContent(/Hémodialyse intermittente/);
    expect(synthese).toHaveTextContent(/Durée : 14 jours/);
    expect(synthese).toHaveTextContent(/Dosage \(résiduelle\).*cible : 15 à 20 mg\/L/);
    expect(synthese).toHaveTextContent(/Hémocultures de contrôle/);
    // Surveillance conditionnelle : la condition est reprise mot pour mot.
    expect(synthese).toHaveTextContent(/Contrôle de la fonction auditive — si traitement prolongé/);
  });

  test('pas d’antibiothérapie indiquée : la raison est dans la synthèse, sans bloc « Pourquoi » répété', () => {
    render(<App dossierInitial={casFictif('ecbu-colonisation')} />);
    const synthese = fiche().querySelector('.synthese')!;
    expect(synthese).toHaveTextContent(/Raison de ne pas traiter/);
    expect(synthese).toHaveTextContent(/À faire et surveillance/);
    expect(synthese).toHaveTextContent(/Ne pas prescrire d'antibiotique/);
    expect(within(fiche()).queryByRole('region', { name: /Pourquoi aucun traitement/ })).toBeNull();
  });

  test('sources : liens courts vers la recommandation, liste complète en fin de fiche', () => {
    render(<App dossierInitial={casFictif('sarm-hd')} />);
    const f = fiche();
    const lien = within(f).getAllByRole('link', { name: 'IDSA / ESCMID 2026 (nouvel onglet)' })[0];
    expect(lien).toHaveAttribute('href', expect.stringMatching(/^https:\/\//));
    expect(lien).toHaveAttribute('target', '_blank');
    expect(lien.getAttribute('title')).toMatch(/Staphylococcus aureus Bacteremia/);
    expect(within(f).queryByText(/^Sources \(\d+\)$/)).toBeNull();
    expect(within(f).getByText(/^Sources de cette prise en charge \(\d+\)$/)).toBeInTheDocument();
  });

  test('dossier vide : le point d’entrée figure dans les éléments manquants et mène au champ', async () => {
    const u = userEvent.setup();
    render(<App />);
    const manquants = within(fiche()).getByRole('region', { name: /Éléments manquants/ });
    await u.click(within(manquants).getByRole('button', { name: /^Compléter : Point d’entrée/ }));
    expect(document.querySelector('[data-champ="entree"]')).toContainElement(document.activeElement as HTMLElement);
    // Le motif du moteur et sa prochaine action restent lisibles dans la synthèse.
    expect(fiche().querySelector('.synthese')).toHaveTextContent(/Point de départ à renseigner/);
    expect(fiche().querySelector('.synthese')).toHaveTextContent(/Choisir un syndrome ou saisir un résultat microbiologique/);
    expect(fiche().querySelector('.synthese')).not.toHaveTextContent(/explication ci-dessous/);
  }, 20000);

  test('une option en brouillon reste marquée, dans les options comme dans la synthèse', () => {
    const d = clonerDossier(casFictif('ecoli-i'));
    d.patient.immunodepression = 'oui';
    render(<App dossierInitial={d} />);
    expect(fiche().querySelector('.synthese')).toHaveTextContent(/brouillon/);
    expect(within(fiche()).getAllByText('brouillon').length).toBeGreaterThan(1);
  });

  test('sources : deux sources du même organisme et de la même année restent distinguables', () => {
    render(<App dossierInitial={casFictif('bgn-90')} />);
    for (const ligne of fiche().querySelectorAll('.refs-inline')) {
      const noms = [...ligne.querySelectorAll('a')].map((a) => a.textContent);
      expect(new Set(noms).size).toBe(noms.length);
    }
  });

  test('points d’attention : le niveau est dit en texte, pas seulement par la couleur', () => {
    render(<App dossierInitial={casFictif('sarm-hd')} />);
    const points = within(fiche()).getByRole('list', { name: "Points d'attention" });
    expect(points).toHaveTextContent(/Attention : S\. aureus/);
    expect(points).toHaveTextContent(/Information : SARM/);
  });

  test('« Traitement retenu » seulement quand le prescripteur a retenu une option', async () => {
    const u = userEvent.setup();
    render(<App dossierInitial={casFictif('sab')} />);
    await u.click(screen.getByText(/Alternatives et options conditionnelles/));
    await u.click(screen.getAllByRole('button', { name: 'Retenir cette option' })[0]);
    const synthese = fiche().querySelector('.synthese')!;
    expect(synthese).toHaveTextContent(/Traitement retenu — provisoire/);
    expect(synthese).toHaveTextContent(/Cloxacilline/);
  }, 20000);

  test('fin de fiche : les sources de l’indication figurent dans la liste complète', () => {
    render(<App dossierInitial={casFictif('ecbu-colonisation')} />);
    const fin = fiche().querySelector('.fin-fiche')!;
    expect(fin).toHaveTextContent(/IDSA/);
  });
});
