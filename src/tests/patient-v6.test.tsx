/**
 * Onglet Patient (v6) : onglets « Patient » / « Prise en charge », valeurs de départ ajustables (âge 50, poids 70,
 * taille 170) jamais utilisées tant qu'elles ne sont pas choisies, créatininémie en µmol/L, équation du DFG
 * préselectionnée, demande d'avis infectiologique par courriel en fin d'onglet.
 */
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../ui/App';
import { courrielAvis, DESTINATAIRE_AVIS, formuleFinale, lienCourriel, lireSignature } from '../ui/avis';
import { dossierParDefaut } from '../engine/etat';
import { contexteUI } from '../ui/contexte-ui';

describe('Onglet Patient', () => {
  test('onglets « Patient » et « Prise en charge »', () => {
    render(<App />);
    const nav = screen.getByRole('navigation', { name: /écran étroit/ });
    expect(within(nav).getByRole('button', { name: /^Patient/ })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: /^Prise en charge/ })).toBeInTheDocument();
    expect(within(nav).queryByRole('button', { name: /Saisie|Fiche/ })).toBeNull();
    expect(screen.getByRole('heading', { name: /^Prise en charge/ })).toBeInTheDocument();
  });

  test('âge, poids, taille : valeur de départ en grisé, non utilisée ; − / +, flèches et molette partent de cette valeur', async () => {
    const u = userEvent.setup();
    render(<App />);
    const age = screen.getByLabelText('Âge') as HTMLInputElement;
    expect(age).toHaveValue(null);
    expect(age).toHaveAttribute('placeholder', '50');
    expect(screen.getByLabelText('Poids')).toHaveAttribute('placeholder', '70');
    expect(screen.getByLabelText('Taille')).toHaveAttribute('placeholder', '170');
    // Valeur de départ non retenue : l'âge reste une donnée manquante pour le calcul du DFG.
    await u.type(screen.getByLabelText('Valeur de la créatininémie'), '90');
    await u.click(within(screen.getByRole('radiogroup', { name: 'Sexe' })).getByRole('radio', { name: 'Femme' }));
    expect(screen.getByText(/Calcul automatique impossible, il manque : âge/)).toBeInTheDocument();

    await u.click(screen.getByRole('button', { name: 'Augmenter : Âge' }));
    expect(age).toHaveValue(50);
    await u.click(screen.getByRole('button', { name: 'Augmenter : Âge' }));
    expect(age).toHaveValue(51);
    await u.click(screen.getByRole('button', { name: 'Diminuer : Âge' }));
    await u.click(screen.getByRole('button', { name: 'Diminuer : Âge' }));
    expect(age).toHaveValue(49);
    age.focus();
    await u.keyboard('{ArrowUp}');
    expect(age).toHaveValue(50);
    fireEvent.wheel(age, { deltaY: -100 });
    expect(age).toHaveValue(51);
    fireEvent.wheel(age, { deltaY: 100 });
    expect(age).toHaveValue(50);
    expect(screen.getByLabelText('DFG estimé calculé')).toBeInTheDocument();

    // Depuis un champ vide, le premier cran donne la valeur de départ, dans un sens comme dans l'autre.
    await u.click(screen.getByRole('button', { name: 'Diminuer : Poids' }));
    expect(screen.getByLabelText('Poids')).toHaveValue(70);
    await u.click(screen.getByRole('button', { name: 'Augmenter : Taille' }));
    expect(screen.getByLabelText('Taille')).toHaveValue(170);
    // La saisie au clavier reste possible.
    await u.clear(screen.getByLabelText('Poids'));
    await u.type(screen.getByLabelText('Poids'), '82');
    expect(screen.getByLabelText('Poids')).toHaveValue(82);
  }, 20000);

  test('molette sans le focus : la page défile, la valeur ne change pas', () => {
    render(<App />);
    const taille = screen.getByLabelText('Taille');
    fireEvent.wheel(taille, { deltaY: -100 });
    expect(taille).toHaveValue(null);
  });

  test('créatininémie en µmol/L par défaut ; équation CKD-EPI 2009 préselectionnée et modifiable', async () => {
    const u = userEvent.setup();
    render(<App />);
    expect(screen.getByLabelText('Unité de la créatininémie')).toHaveValue('umol/L');
    await u.type(screen.getByLabelText('Âge'), '70');
    await u.type(screen.getByLabelText('Valeur de la créatininémie'), '90');
    await u.click(within(screen.getByRole('radiogroup', { name: 'Sexe' })).getByRole('radio', { name: 'Femme' }));
    const champ = document.querySelector('[data-champ="patient.renal.dfg"]') as HTMLElement;
    // Femme, 70 ans, 90 µmol/L : CKD-EPI 2009 ≈ 56 mL/min/1,73 m², sans avoir choisi l'unité.
    expect(within(champ).getByLabelText('DFG estimé calculé')).toHaveTextContent('56');
    const equation = within(champ).getByLabelText('Équation du DFG estimé');
    expect(equation).toHaveValue('ckd_epi_2009');
    expect(champ).toHaveTextContent(/Préselection : équation recommandée en Europe/);
    await u.selectOptions(equation, 'ckd_epi_2021');
    expect(champ).toHaveTextContent('CKD-EPI 2021');
    expect(champ).toHaveTextContent(/vérifier qu’il s’agit de celle du laboratoire/);
  }, 20000);

  test('EKFC non proposée à 25 ans ou moins', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.type(screen.getByLabelText('Âge'), '22');
    await u.type(screen.getByLabelText('Valeur de la créatininémie'), '70');
    await u.click(within(screen.getByRole('radiogroup', { name: 'Sexe' })).getByRole('radio', { name: 'Homme' }));
    const option = within(screen.getByLabelText('Équation du DFG estimé')).getByRole('option', { name: 'EKFC' }) as HTMLOptionElement;
    expect(option.disabled).toBe(true);
  }, 20000);

  test('une valeur en mg/dL laissée en µmol/L est signalée et non utilisée', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.type(screen.getByLabelText('Valeur de la créatininémie'), '1.2');
    expect(screen.getByText(/Valeur non utilisée/)).toBeInTheDocument();
  });
});

describe('Demande d’avis infectiologique', () => {
  beforeEach(() => window.localStorage.clear());
  test('dernière section de l’onglet Patient : destinataire, aperçu, lien de messagerie et signature', async () => {
    const u = userEvent.setup();
    const { container } = render(<App />);
    const section = screen.getByRole('heading', { name: /Demande d’avis infectiologique/ }).closest('section')!;
    // Juste avant le pied de page de la colonne Patient.
    expect(section.nextElementSibling).toBe(container.querySelector('.colonne-saisie > footer.pied-saisie'));
    expect(section).toHaveTextContent(DESTINATAIRE_AVIS);

    await u.type(screen.getByLabelText('Âge'), '68');
    await u.type(within(section).getByLabelText('Histoire clinique'), 'Fièvre depuis 48 h');
    await u.type(within(section).getByLabelText('Question posée'), 'Durée de traitement ?');
    const apercu = within(section).getByLabelText('Aperçu du courriel') as HTMLTextAreaElement;
    expect(apercu.value).toMatch(/^Objet : Demande d’avis infectiologique — 68 ans/);
    expect(apercu.value).toContain('Fièvre depuis 48 h');
    expect(apercu.value).toContain('Durée de traitement ?');
    // Sans signature enregistrée : formule finale seule.
    expect(apercu.value.endsWith('Je reste disponible pour tout complément.\n\nConfraternellement,')).toBe(true);
    // Signature (fictive) saisie une fois, conservée dans ce navigateur.
    await u.type(within(section).getByLabelText('Nom'), 'Dr TEST Fictif');
    await u.type(within(section).getByLabelText('Adresse électronique'), 'test@exemple.invalid');
    await u.type(within(section).getByLabelText('Téléphone'), '00 00 00 00 00');
    expect(apercu.value.endsWith('Confraternellement,\n\nDr TEST Fictif\n\ntest@exemple.invalid\n\n00 00 00 00 00')).toBe(true);
    expect(lireSignature()).toEqual({ nom: 'Dr TEST Fictif', courriel: 'test@exemple.invalid', telephone: '00 00 00 00 00' });

    const lien = within(section).getByRole('link', { name: 'Ouvrir dans ma messagerie' });
    const href = lien.getAttribute('href')!;
    expect(href.startsWith(`mailto:${DESTINATAIRE_AVIS}?subject=`)).toBe(true);
    const corps = decodeURIComponent(href.split('&body=')[1]);
    expect(corps).toContain('Confraternellement,\r\n\r\nDr TEST Fictif\r\n\r\ntest@exemple.invalid\r\n\r\n00 00 00 00 00');

    // Nouveau patient : le texte libre du patient précédent est effacé, la signature est conservée.
    await u.click(screen.getByRole('button', { name: 'Réinitialiser le patient' }));
    expect(screen.getByLabelText('Histoire clinique')).toHaveValue('');
    const apres = (screen.getByLabelText('Aperçu du courriel') as HTMLTextAreaElement).value;
    expect(apres).not.toContain('Fièvre');
    expect(apres).toContain('Dr TEST Fictif');
    // La signature peut être effacée de ce navigateur.
    await u.click(screen.getByRole('button', { name: 'Effacer ma signature de ce navigateur' }));
    expect(lireSignature()).toEqual({ nom: '', courriel: '', telephone: '' });
    expect(window.localStorage.getItem('infectiology.signatureAvis')).toBeNull();
  }, 20000);

  test('courrielAvis : motif et précisions du foyer (réponses inconnues omises), données du dossier, signature', () => {
    const d = dossierParDefaut();
    d.entree = 'syndrome';
    d.syndrome = 'pulmonaire';
    d.patient.age = 72;
    d.patient.sexe = 'femme';
    d.patient.contexte = 'communautaire';
    d.details = { 'pneumonie.lieu': 'hospitalisation' };
    d.patient.antibiotiquesRecents = [{ dci: 'amoxicilline', enCours: 'oui' } as (typeof d.patient.antibiotiquesRecents)[number]];
    const { objet, corps } = courrielAvis(d, contexteUI(d));
    expect(objet).toBe('Demande d’avis infectiologique — Pulmonaire (pneumonie communautaire ou associée aux soins), 72 ans');
    expect(corps).toContain('Je sollicite votre avis pour une patiente de 72 ans.');
    expect(corps).toContain('- Lieu de prise en charge retenu : Hospitalisation hors soins critiques');
    expect(corps).not.toMatch(/: Inconnu$/m);
    expect(corps).toMatch(/- Allergies : /);
    expect(corps).toContain('Antibiothérapie en cours : amoxicilline');
    expect(corps).not.toContain('1re dose');
    expect(corps.endsWith(formuleFinale())).toBe(true);
  });

  test('formuleFinale : une ligne vide entre les éléments, éléments vides omis', () => {
    expect(formuleFinale({ nom: 'Dr X', courriel: '', telephone: '01' })).toBe('Confraternellement,\n\nDr X\n\n01');
  });

  test('lienCourriel : objet et corps encodés, retours à la ligne en CRLF', () => {
    const l = lienCourriel('Objet é', 'a\nb & c');
    expect(l).toBe(`mailto:${DESTINATAIRE_AVIS}?subject=Objet%20%C3%A9&body=a%0D%0Ab%20%26%20c`);
  });
});
