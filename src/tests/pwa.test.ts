/**
 * Installation sur le bureau / l'écran d'accueil : le manifeste et les icônes existent, sont servis
 * par le site lui-même (aucune adresse extérieure) et ont les tailles déclarées.
 */
import { describe, expect, test } from 'vitest';
// @ts-expect-error : les types Node ne sont pas installés dans le projet ; le module existe dans l'environnement de test.
import { existsSync, readFileSync } from 'node:fs';

const manifeste = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf-8'));
const index = readFileSync('index.html', 'utf-8');

/** Largeur et hauteur lues dans l'en-tête PNG (IHDR). */
function taillePng(chemin: string): [number, number] {
  const b = readFileSync(chemin);
  expect(b.subarray(1, 4).toString('ascii')).toBe('PNG');
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
}

describe('PWA', () => {
  test('manifeste : nom, affichage autonome, démarrage relatif au site', () => {
    expect(manifeste.short_name).toBe('Infectiology');
    expect(manifeste.display).toBe('standalone');
    expect(manifeste.start_url).toBe('./');
    expect(manifeste.scope).toBe('./');
    expect(manifeste.lang).toBe('fr');
  });

  test('icônes 192 et 512, « any » et « maskable », présentes et à la bonne taille', () => {
    for (const purpose of ['any', 'maskable']) {
      for (const t of [192, 512]) expect(manifeste.icons.some((i: { sizes: string; purpose: string }) => i.sizes === `${t}x${t}` && i.purpose === purpose)).toBe(true);
    }
    for (const i of manifeste.icons) {
      expect(i.src).not.toMatch(/^(https?:)?\/\//);
      const chemin = `public/${i.src}`;
      expect(existsSync(chemin)).toBe(true);
      const [l, h] = taillePng(chemin);
      expect(`${l}x${h}`).toBe(i.sizes);
    }
    expect(taillePng('public/apple-touch-icon.png')).toEqual([180, 180]);
    expect(taillePng('public/favicon-32.png')).toEqual([32, 32]);
  });

  test('index.html : manifeste, favicons et icône Apple référencés, sans adresse extérieure', () => {
    for (const ref of ['/manifest.webmanifest', '/favicon.svg', '/favicon-32.png', '/apple-touch-icon.png']) expect(index).toContain(`href="${ref}"`);
    expect(index).not.toMatch(/href="https?:\/\//);
  });
});
