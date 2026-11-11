/**
 * Prise en charge simplifiée (v7) : traitement de traitement en vert dans la synthèse, une seule ligne sur la
 * fonction rénale (pas d'adaptation / posologie recommandée / non calculée), plus de bloc « Options
 * thérapeutiques » répétant la synthèse ; glissement au doigt pour l'âge, le poids et la taille.
 */
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../ui/App';
import { casFictif } from './cas-fictifs';

const fiche = () => screen.getByRole('heading', { name: /^Prise en charge/ }).closest('section')!;

describe('Prise en charge simplifiée', () => {
  test('traitement en vert dans la synthèse ; pas de bloc « Options thérapeutiques » ; les autres options sont repliées', () => {
    render(<App dossierInitial={casFictif('sab')} />);
    const dd = fiche().querySelector('.synthese dd.traitement');
    expect(dd).not.toBeNull();
    expect(dd).toHaveTextContent(/Céfazoline|Cloxacilline/);
    expect(within(fiche()).queryByRole('heading', { name: /Options thérapeutiques/ })).toBeNull();
    // Le traitement de la synthèse n'est pas répété en carte d'option.
    expect(fiche().querySelectorAll('article.option.premiere')).toHaveLength(0);
    const autres = fiche().querySelector('details.autres-options')!;
    expect(autres).not.toHaveAttribute('open');
    expect(autres.querySelector('summary')).toHaveTextContent(/Autres options/);
  });

  test('option retenue par le prescripteur : affichée dans la synthèse, la 1re ligne passe dans les autres options', async () => {
    const u = userEvent.setup();
    render(<App dossierInitial={casFictif('sab')} />);
    const premiere = fiche().querySelector('.synthese dd.traitement .traitement-nom')!.textContent!;
    expect(premiere).toMatch(/Céfazoline|Cloxacilline/);
    await u.click(screen.getByText(/Autres options : alternatives/));
    await u.click(screen.getAllByRole('button', { name: 'Retenir cette option' })[0]);
    expect(fiche().querySelector('.synthese')).toHaveTextContent(/Traitement retenu/);
    expect(fiche().querySelector('details.autres-options')).toHaveTextContent(premiere);
  }, 20000);

  test('fonction rénale : une ligne par molécule, sans estimation ; adaptation en dialyse avec la posologie de la source', () => {
    render(<App dossierInitial={casFictif('sarm-hd')} />);
    const synthese = fiche().querySelector('.synthese')!;
    const rein = synthese.querySelector('.rein-adaptee')!;
    expect(rein).toHaveTextContent(/Adaptation à la fonction rénale — posologie recommandée : Hémodialyse intermittente/);
    expect(synthese).not.toHaveTextContent(/Estimation utilisée/);
    expect(synthese).not.toHaveTextContent(/DFG estimé indexé/);
    // La dose de référence reste lisible, signalée comme telle.
    expect(synthese).toHaveTextContent(/Dose de référence \(fonction rénale normale\)/);
  });

  test('fonction rénale non utilisable (IRA) : l’adaptation est dite non calculée, avec sa raison', () => {
    render(<App dossierInitial={casFictif('blse-amk')} />);
    expect(fiche().querySelector('.synthese .rein-non_calculee')).toHaveTextContent(/Adaptation à la fonction rénale non calculée/);
  });

  test('avertissements de la molécule affichés directement dans la synthèse', () => {
    render(<App dossierInitial={casFictif('sarm-hd')} />);
    const synthese = fiche().querySelector('.synthese')!;
    expect(synthese).not.toHaveTextContent(/voir les options thérapeutiques/);
  });

  test('mise en évidence : sans adaptation, traitement en vert gras ; avec adaptation, c’est l’adaptation qui est en gras', () => {
    const { unmount } = render(<App dossierInitial={casFictif('sab')} />);
    let dd = fiche().querySelector('.synthese dd.traitement')!;
    expect(dd).not.toHaveClass('avec-adaptation');
    expect(dd.querySelector('.traitement-nom')).not.toBeNull();
    expect(dd.querySelector('.dose-principale strong')).not.toBeNull();
    unmount();
    // Hémodialyse : posologie adaptée.
    render(<App dossierInitial={casFictif('sarm-hd')} />);
    dd = fiche().querySelector('.synthese dd.traitement')!;
    expect(dd).toHaveClass('avec-adaptation');
    expect(dd.querySelector('.rein-adaptee')).toHaveTextContent(/posologie recommandée/);
  });

  test('calendrier : dosage avec sa cible et la conduite à tenir, visibles sans dépliage', () => {
    render(<App dossierInitial={casFictif('sarm-hd')} />);
    const lignes = [...fiche().querySelectorAll('table.frise tbody tr')].filter((tr) => /: dosage \(/.test(tr.querySelector('.quoi')?.textContent ?? ''));
    expect(lignes.length).toBeGreaterThan(0);
    const ligne = lignes[0];
    expect(ligne.querySelector(':scope td > .cible')).toHaveTextContent(/Cible : .*mg\/L/);
    expect(ligne.querySelector(':scope td > .conduite')).toHaveTextContent(/^Conduite à tenir : /);
    // Ni la cible ni la conduite ne sont cachées dans un bloc replié.
    expect(ligne.querySelector('details .conduite')).toBeNull();
  });
});

describe('Glissement au doigt (téléphone)', () => {
  const glisser = (el: Element, de: number, a: number) => {
    fireEvent.touchStart(el, { touches: [{ clientY: de }] });
    fireEvent.touchMove(el, { touches: [{ clientY: (de + a) / 2 }] });
    fireEvent.touchMove(el, { touches: [{ clientY: a }] });
    fireEvent.touchEnd(el, { touches: [] });
  };

  test('glisser vers le haut augmente, vers le bas diminue ; depuis un champ vide, le 1er cran donne la valeur de départ', () => {
    render(<App />);
    const age = screen.getByLabelText('Âge');
    glisser(age, 300, 300 - 14); // 1 cran
    expect(age).toHaveValue(50);
    glisser(age, 300, 300 - 14 * 5); // 5 crans
    expect(age).toHaveValue(55);
    glisser(age, 300, 300 + 14 * 3);
    expect(age).toHaveValue(52);
    const poids = screen.getByLabelText('Poids');
    glisser(poids, 200, 200 + 14 * 2); // vers le bas depuis vide : 70 puis 69
    expect(poids).toHaveValue(69);
  });

  test('un simple appui (sans glissement) ne change pas la valeur', () => {
    render(<App />);
    const taille = screen.getByLabelText('Taille');
    fireEvent.touchStart(taille, { touches: [{ clientY: 100 }] });
    fireEvent.touchMove(taille, { touches: [{ clientY: 103 }] });
    fireEvent.touchEnd(taille, { touches: [] });
    expect(taille).toHaveValue(null);
  });

  test('bornes respectées', () => {
    render(<App />);
    const age = screen.getByLabelText('Âge');
    glisser(age, 2000, 0); // bien plus de 70 crans vers le haut
    expect(age).toHaveValue(120);
  });
});
