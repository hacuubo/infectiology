# Procédure de veille mensuelle

## Planification

- Le workflow `.github/workflows/veille.yml` s'exécute le **1er de chaque mois à 08:07, fuseau Europe/Paris** (clé `timezone` documentée par GitHub ; heure d'été et d'hiver gérées).
- Un créneau de **rattrapage le 2 du mois** relance la veille si celle du 1er a échoué ; il ne fait rien si la veille du mois a réussi (prévention des doublons).
- **Lancement manuel** : onglet Actions → « Veille mensuelle des sources » → Run workflow (option « force » pour relancer un mois déjà traité). En local :

```bash
npm run veille
```

- **Retards possibles** documentés par GitHub : forte charge au début de chaque heure, jobs en file éventuellement abandonnés ; désactivation des workflows planifiés après 60 jours sans activité dans un dépôt public (un lancement manuel les réactive).
- `concurrency` empêche deux veilles simultanées.

## Ce que fait le script

`tools/veille/run.mjs` parcourt le registre explicite `tools/veille/registre-veille.json`, télécharge chaque page ou document, normalise le contenu et compare son empreinte SHA-256 à celle de la dernière veille réussie (`tools/veille/etat-veille.json`). Une entrée « sentinelle » surveille l'URL d'une version future attendue (ex. EUCAST v17.0) : son apparition signale une nouvelle version.

Résultats possibles :

| Statut | Signification |
|---|---|
| `aucune_nouveaute` | toutes les sources ont répondu, aucune empreinte n'a changé ; la veille est consignée |
| `changements_detectes` | au moins une source a changé ; une analyse humaine est requise |
| `echec_partiel` | au moins une source est inaccessible : **ce n'est pas une absence de changement** ; relancer |

Chaque exécution écrit un journal `docs/veille/journal/AAAA-MM-JJ.md` et met à jour `src/clinical/etat-base.json` (dernière veille tentée et réussie, changements en attente), affichés dans l'application. Le workflow vérifie aussi l'accessibilité de chaque URL du registre clinique et rejoue tous les tests.

Les pages HTML d'EUCAST (`clinical_breakpoints`, `newsiandr`) refusent les clients automatisés (réponse 404) : elles doivent être vérifiées manuellement à chaque veille.

## Quand un changement est détecté

1. Lire la source changée et identifier précisément ce qui a changé (version, correctif, retrait, remplacement).
2. Rechercher dans `src/clinical/` toutes les règles et molécules qui citent cette source (identifiant du registre), y compris doses, adaptations rénales, surveillance, STP, contrôles et durées.
3. Mettre à jour le registre (`statutVigueur`, `remplaceePar`, `dateConsultation`), puis les règles concernées avec leurs nouveaux repères.
4. Écrire ou adapter les tests d'acceptation à partir de la source, indépendamment du code.
5. Relecture 1 (développeur/ergonomie) : calculs, unités, calendriers, interface.
6. Relecture 2 (audit documentaire infectiologique) : chaque indication, dose, durée, surveillance et source.
7. Ouvrir une pull request avec les sources, les différences avant/après et l'impact clinique.
8. **Attendre une validation humaine qualifiée** avant toute publication thérapeutique. Aucune fusion automatique des changements cliniques.
