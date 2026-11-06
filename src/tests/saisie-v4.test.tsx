/**
 * Saisie simplifiée (v4) : en-tête réduit, pas de sélecteur de cas ni de mode « règles validées »,
 * résumé réduit par défaut, patient compact, DFG indexé affiché dans son champ, définitions des contextes.
 */
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../ui/App';

describe('Saisie simplifiée', () => {
  test('en-tête : ni sélecteur de cas fictif, ni case « règles validées » ; avertissement en fin de saisie', () => {
    const { container } = render(<App />);
    expect(screen.queryByLabelText('Cas fictif')).toBeNull();
    expect(screen.queryByText(/N'appliquer que les règles validées/)).toBeNull();
    const entete = container.querySelector('header.bandeau')!;
    expect(entete).not.toHaveTextContent(/non validé pour l'usage clinique/);
    const pied = container.querySelector('.colonne-saisie > footer.pied-saisie')!;
    expect(pied).toHaveTextContent(/Outil en développement, non validé pour l'usage clinique/);
    expect(pied).toHaveTextContent(/Version clinique/);
    expect(container.querySelector('.colonne-saisie')!.lastElementChild).toBe(pied);
  });

  test('résumé du patient réduit par défaut, réaffichable', async () => {
    const u = userEvent.setup();
    render(<App />);
    expect(document.getElementById('resume-patient')).not.toBeVisible();
    await u.click(screen.getByRole('button', { name: 'Afficher le résumé' }));
    expect(document.getElementById('resume-patient')).toBeVisible();
  });

  test('sexe : aucun choix présélectionné, sans choix « Inconnu » ; poids et taille sans texte d’aide', () => {
    const { container } = render(<App />);
    const groupe = screen.getByRole('radiogroup', { name: 'Sexe' });
    expect(within(groupe).getAllByRole('radio').map((r) => r.textContent)).toEqual(['Femme', 'Homme']);
    for (const r of within(groupe).getAllByRole('radio')) expect(r).toHaveAttribute('aria-checked', 'false');
    // Le sexe manquant reste signalé (résumé).
    expect(document.getElementById('resume-patient')).toHaveTextContent('sexe ?');
    for (const c of ['patient.age', 'patient.sexe', 'patient.poidsKg', 'patient.tailleCm']) expect(container.querySelector(`[data-champ="${c}"] .aide`)).toBeNull();
    // Âge et sexe sur une même ligne, poids et taille sur la suivante.
    const lignes = [...container.querySelectorAll('#t-patient ~ .deux-colonnes')];
    expect(lignes[0].querySelector('[data-champ="patient.age"]') && lignes[0].querySelector('[data-champ="patient.sexe"]')).toBeTruthy();
    expect(lignes[1].querySelector('[data-champ="patient.poidsKg"]') && lignes[1].querySelector('[data-champ="patient.tailleCm"]')).toBeTruthy();
  });

  test('fonction rénale : créatininémie sans date ; DFG indexé affiché dans son champ dès qu’il est calculable', async () => {
    const u = userEvent.setup();
    render(<App />);
    expect(screen.queryByLabelText(/Date du prélèvement de créatininémie/)).toBeNull();
    expect(screen.queryByText(/Équation du DFG estimé|Poids utilisé dans Cockcroft-Gault|Estimations calculées/)).toBeNull();
    // Sans créatininémie : le DFG se saisit.
    expect(screen.getByLabelText('DFG estimé (valeur du laboratoire)')).toBeInTheDocument();
    await u.type(screen.getByLabelText('Âge'), '70');
    await u.selectOptions(screen.getByLabelText('Unité de la créatininémie'), 'umol/L');
    await u.type(screen.getByLabelText('Valeur de la créatininémie'), '90');
    // Sexe non renseigné : pas de calcul, la donnée manquante est nommée.
    expect(screen.getByText(/Calcul automatique impossible, il manque : variable de sexe/)).toBeInTheDocument();
    await u.click(within(screen.getByRole('radiogroup', { name: 'Sexe' })).getByRole('radio', { name: 'Femme' }));
    // Femme, 70 ans, 90 µmol/L : CKD-EPI 2009 ≈ 56 mL/min/1,73 m² (141 × (1,018/0,7)^−1,209 × 0,993^70 × 1,018).
    const champ = document.querySelector('[data-champ="patient.renal.dfg"]') as HTMLElement;
    expect(within(champ).getByLabelText('DFG estimé calculé')).toHaveTextContent('56');
    expect(champ).toHaveTextContent('mL/min/1,73 m² (CKD-EPI 2009)');
    expect(screen.queryByLabelText('DFG estimé (valeur du laboratoire)')).toBeNull();
  }, 20000);

  test('DFG saisi : sans équation précisée, la valeur est signalée comme non utilisée', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.type(screen.getByLabelText('DFG estimé (valeur du laboratoire)'), '45');
    expect(screen.getByText(/Équation non précisée : la valeur n’est pas utilisée/)).toBeInTheDocument();
    await u.selectOptions(screen.getByLabelText('Équation du DFG saisi'), 'CKD-EPI');
    expect(screen.queryByText(/Équation non précisée/)).toBeNull();
    // Le DFG devient calculable : la valeur saisie reste visible et peut être effacée (pas de valeur cachée).
    await u.type(screen.getByLabelText('Âge'), '70');
    await u.selectOptions(screen.getByLabelText('Unité de la créatininémie'), 'umol/L');
    await u.type(screen.getByLabelText('Valeur de la créatininémie'), '90');
    await u.click(within(screen.getByRole('radiogroup', { name: 'Sexe' })).getByRole('radio', { name: 'Femme' }));
    expect(screen.getByText(/Valeur saisie : 45 mL\/min\/1,73 m²/)).toBeInTheDocument();
    await u.click(screen.getByRole('button', { name: 'Effacer' }));
    expect(screen.queryByText(/Valeur saisie/)).toBeNull();
  }, 20000);

  test('contexte : définitions « associée aux soins » et « communautaire » sourcées ; gravité sans paragraphe explicatif', () => {
    const { container } = render(<App />);
    const def = container.querySelector('#t-contexte ~ .definition')!;
    expect(def).toHaveTextContent(/sans être présente ni en incubation/);
    expect(def).toHaveTextContent(/48 h/);
    expect(def).toHaveTextContent(/Communautaire : les autres situations/);
    expect(def).toHaveTextContent(/Sources \(1\)/);
    expect(container.querySelector('[data-champ="patient.gravite"] .aide')).toBeNull();
    expect(within(screen.getByRole('radiogroup', { name: /^Valve cardiaque/ })).getByRole('radio', { name: 'Inconnu' })).toBeInTheDocument();
  });
});
