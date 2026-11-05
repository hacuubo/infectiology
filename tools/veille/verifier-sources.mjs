#!/usr/bin/env node
/**
 * Vérifie que chaque source du registre clinique (src/clinical/sources/registre.json)
 * répond encore (HTTP 2xx/3xx) et signale celles qui sont introuvables.
 * Une source injoignable doit être marquée `statutAcces: "introuvable"` ou
 * `statutVigueur: "incertain"` dans le registre, et les règles qui en dépendent
 * doivent être réexaminées. Ne modifie rien ; code de sortie 2 si au moins une source est injoignable.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const registre = JSON.parse(await readFile(path.join(racine, 'src', 'clinical', 'sources', 'registre.json'), 'utf8'));

let injoignables = 0;
for (const s of registre) {
  for (const url of [s.url, s.urlPdf].filter(Boolean)) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 30_000);
    try {
      let rep = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': 'infectiology-veille/1.0' } });
      if (!rep.ok && rep.status !== 405 && rep.status !== 403) {
        rep = await fetch(url, { method: 'GET', redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': 'infectiology-veille/1.0' } });
      }
      const ok = rep.ok || rep.status === 403; // 403 = anti-robot, la ressource existe mais ne nous est pas servie
      console.log(`${ok ? 'OK  ' : 'KO  '} ${rep.status} ${s.id} ${url}`);
      if (!ok) injoignables++;
    } catch (e) {
      console.log(`KO  ERR ${s.id} ${url} (${e?.message ?? e})`);
      injoignables++;
    } finally {
      clearTimeout(t);
    }
  }
}
console.log(`\n${registre.length} sources, ${injoignables} URL injoignable(s).`);
process.exit(injoignables > 0 ? 2 : 0);
