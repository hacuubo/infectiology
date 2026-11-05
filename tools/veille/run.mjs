#!/usr/bin/env node
/**
 * Veille mensuelle des sources officielles.
 *
 * - Parcourt le registre explicite `registre-veille.json`.
 * - Télécharge chaque page/document, normalise le contenu et calcule une empreinte SHA-256.
 * - Compare à l'état de la dernière veille réussie (`etat-veille.json`).
 * - Écrit un journal daté dans `docs/veille/journal/` et un résumé machine `resultat-veille.json`.
 * - Une source inaccessible est un ÉCHEC PARTIEL (code de sortie 2), pas une absence de changement.
 * - Prévention des doublons : une veille réussie déjà consignée pour le mois courant est ignorée,
 *   sauf `--force`.
 * - Garde de fuseau horaire (repli, si un ordonnanceur sans fuseau IANA est utilisé) : avec
 *   `--garde-heure 8`, ne s'exécute que si l'heure Europe/Paris courante est 08. Le workflow GitHub
 *   utilise désormais la clé `timezone: Europe/Paris` et n'a pas besoin de cette garde.
 * - `--simulation` : aucune requête réseau et aucune écriture d'état (test hors ligne).
 *
 * Aucun modèle génératif n'est appelé ici : ce script détecte des changements, il ne les interprète pas.
 * L'analyse clinique des changements et les deux relectures sont des étapes humaines/assistées décrites
 * dans docs/veille/PROCEDURE.md.
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const cheminRegistre = path.join(__dirname, 'registre-veille.json');
const cheminEtat = path.join(__dirname, 'etat-veille.json');
const cheminResultat = path.join(__dirname, 'resultat-veille.json');
const dossierJournal = path.join(racine, 'docs', 'veille', 'journal');
const cheminEtatBase = path.join(racine, 'src', 'clinical', 'etat-base.json');

const args = process.argv.slice(2);
const force = args.includes('--force');
const gardeIdx = args.indexOf('--garde-heure');
const gardeHeure = gardeIdx >= 0 ? Number(args[gardeIdx + 1]) : undefined;
const simulation = args.includes('--simulation');

function heureParis(date = new Date()) {
  const parts = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', hour12: false }).formatToParts(date);
  return Number(parts.find((p) => p.type === 'hour')?.value ?? NaN);
}
function dateParisISO(date = new Date()) {
  const parts = new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const g = (t) => parts.find((p) => p.type === t)?.value;
  return `${g('year')}-${g('month')}-${g('day')}`;
}

function normaliser(texte, type) {
  if (type === 'binaire') return texte; // déjà une empreinte brute
  return texte
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\b(csrf|nonce|token|session|_ga|timestamp)[^"'\s]*/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function empreinte(s) {
  return createHash('sha256').update(s).digest('hex');
}

async function telecharger(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 45_000);
  try {
    const rep = await fetch(url, {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'infectiology-veille/1.0 (+https://github.com/hacuubo/infectiology)', Accept: '*/*' },
    });
    const type = rep.headers.get('content-type') ?? '';
    const buf = Buffer.from(await rep.arrayBuffer());
    return { ok: rep.ok, statut: rep.status, type, buf, derniereModif: rep.headers.get('last-modified') ?? undefined };
  } finally {
    clearTimeout(t);
  }
}

function extraireReperes(texte, reperes) {
  const trouves = {};
  for (const r of reperes ?? []) {
    const idx = texte.toLowerCase().indexOf(r.toLowerCase());
    trouves[r] = idx >= 0 ? texte.slice(Math.max(0, idx - 60), idx + r.length + 60) : null;
  }
  return trouves;
}

async function lireJson(chemin, defaut) {
  if (!existsSync(chemin)) return defaut;
  return JSON.parse(await readFile(chemin, 'utf8'));
}

async function main() {
  const maintenant = new Date();
  const jour = dateParisISO(maintenant);
  const mois = jour.slice(0, 7);

  if (gardeHeure !== undefined && !force) {
    const h = heureParis(maintenant);
    if (h !== gardeHeure) {
      console.log(`Garde horaire : il est ${h} h à Paris, exécution attendue à ${gardeHeure} h → ignorée (doublon heure d'été/hiver).`);
      await writeFile(cheminResultat, JSON.stringify({ statut: 'ignoree_garde_horaire', jour, heureParis: h }, null, 2));
      return 0;
    }
  }

  const registre = await lireJson(cheminRegistre, { sources: [] });
  const etat = await lireJson(cheminEtat, { derniereReussie: null, sources: {} });

  if (!force && etat.derniereReussie && etat.derniereReussie.slice(0, 7) === mois) {
    console.log(`Une veille réussie est déjà consignée pour ${mois} (${etat.derniereReussie}) → ignorée (prévention des doublons). Utilisez --force pour relancer.`);
    await writeFile(cheminResultat, JSON.stringify({ statut: 'ignoree_doublon', jour, derniereReussie: etat.derniereReussie }, null, 2));
    return 0;
  }

  const lignes = [];
  let changements = 0;
  let inaccessibles = 0;
  const nouvelEtat = { ...etat, sources: { ...etat.sources } };

  for (const s of registre.sources) {
    const ancien = etat.sources[s.id];
    let ligne = { id: s.id, organisme: s.organisme, libelle: s.libelle, url: s.url, statut: 'inchangee' };
    try {
      if (simulation) throw new Error('simulation');
      const r = await telecharger(s.url);
      if (s.type === 'sentinelle') {
        // Sentinelle : l'URL d'une version future attendue. Absente (404) = rien de nouveau ; présente = nouvelle version publiée.
        if (r.ok) {
          ligne.statut = 'changee';
          ligne.detail = 'Nouvelle version publiée (URL sentinelle désormais accessible)';
          changements++;
        } else if (r.statut === 404) {
          ligne.statut = 'inchangee';
          ligne.detail = 'pas encore publiée (404 attendu)';
        } else {
          ligne.statut = 'inaccessible';
          ligne.detail = `HTTP ${r.statut}`;
          inaccessibles++;
        }
        nouvelEtat.sources[s.id] = { statut: ligne.statut, date: jour };
      } else if (!r.ok) {
        ligne.statut = 'inaccessible';
        ligne.detail = `HTTP ${r.statut}`;
        inaccessibles++;
      } else {
        const estBinaire = s.type === 'binaire' || !/text|html|xml|json/i.test(r.type);
        const contenu = estBinaire ? r.buf.toString('base64') : r.buf.toString('utf8');
        const norm = normaliser(contenu, estBinaire ? 'binaire' : 'html');
        const h = empreinte(norm);
        const reperes = estBinaire ? {} : extraireReperes(norm, s.reperes);
        ligne.empreinte = h;
        ligne.taille = r.buf.length;
        ligne.reperes = reperes;
        ligne.derniereModif = r.derniereModif;
        if (!ancien) {
          ligne.statut = 'nouvelle_reference';
        } else if (ancien.empreinte !== h) {
          ligne.statut = 'changee';
          changements++;
          ligne.reperesAvant = ancien.reperes;
        }
        nouvelEtat.sources[s.id] = { empreinte: h, taille: r.buf.length, reperes, derniereModif: r.derniereModif, date: jour };
      }
    } catch (e) {
      ligne.statut = 'inaccessible';
      ligne.detail = String(e?.message ?? e);
      inaccessibles++;
    }
    lignes.push(ligne);
    console.log(`${ligne.statut.padEnd(20)} ${s.id} ${ligne.detail ?? ''}`);
  }

  const statutGlobal = inaccessibles > 0 ? 'echec_partiel' : changements > 0 ? 'changements_detectes' : 'aucune_nouveaute';
  const etatBase = await lireJson(cheminEtatBase, {});

  // Journal lisible
  await mkdir(dossierJournal, { recursive: true });
  const md = [
    `# Veille des sources — ${jour}`,
    '',
    `- Statut global : **${statutGlobal}**`,
    `- Sources surveillées : ${registre.sources.length} ; changées : ${changements} ; inaccessibles : ${inaccessibles}`,
    `- Version clinique au moment de la veille : ${etatBase.version ?? 'inconnue'}`,
    `- Exécution : ${maintenant.toISOString()} (UTC) — ${heureParis(maintenant)} h à Paris`,
    '',
    '| Source | Statut | Détail | Repères |',
    '|---|---|---|---|',
    ...lignes.map((l) => `| ${l.organisme} — ${l.libelle} ([lien](${l.url})) | ${l.statut} | ${l.detail ?? (l.derniereModif ? `Last-Modified: ${l.derniereModif}` : '')} | ${Object.entries(l.reperes ?? {}).filter(([, v]) => v).map(([k, v]) => `${k}: « …${v}… »`).join('<br>')} |`),
    '',
    inaccessibles > 0 ? '> ⚠ Une ou plusieurs sources sont inaccessibles : la veille est en **échec partiel** et doit être relancée ; cela ne vaut pas absence de changement.' : '',
    changements > 0 ? '> Des changements ont été détectés : analyser chaque source changée, identifier les règles concernées (doses, durées, surveillance, contrôles), préparer les modifications et leurs tests, puis soumettre à validation humaine (voir docs/veille/PROCEDURE.md).' : '',
    changements === 0 && inaccessibles === 0 ? '> Aucune nouveauté détectée : la veille est consignée comme « sans nouveauté ».' : '',
  ].join('\n');
  const resultat = { statut: statutGlobal, jour, changements, inaccessibles, lignes };
  if (simulation) {
    console.log('\nSimulation : aucun journal ni état écrit.');
    return inaccessibles > 0 ? 2 : 0;
  }
  await writeFile(path.join(dossierJournal, `${jour}.md`), md, 'utf8');
  await writeFile(cheminResultat, JSON.stringify(resultat, null, 2));

  // État : mis à jour seulement si veille complète (aucune source inaccessible)
  if (inaccessibles === 0) {
    nouvelEtat.derniereReussie = jour;
    await writeFile(cheminEtat, JSON.stringify(nouvelEtat, null, 2));
    etatBase.derniereVeilleReussie = jour;
  }
  etatBase.derniereVeilleTentee = jour;
  if (changements > 0) {
    const existants = new Set((etatBase.changementsEnAttente ?? []).map((c) => c.id));
    for (const l of lignes.filter((x) => x.statut === 'changee')) {
      const id = `${jour}-${l.id}`;
      if (!existants.has(id)) (etatBase.changementsEnAttente ??= []).push({ id, resume: `${l.organisme} — ${l.libelle} : contenu modifié, impact clinique à analyser`, date: jour });
    }
  }
  await writeFile(cheminEtatBase, JSON.stringify(etatBase, null, 2) + '\n');

  console.log(`\nVeille ${statutGlobal} — journal : docs/veille/journal/${jour}.md`);
  return inaccessibles > 0 ? 2 : 0;
}

main().then((code) => process.exit(code), (e) => {
  console.error(e);
  process.exit(1);
});
