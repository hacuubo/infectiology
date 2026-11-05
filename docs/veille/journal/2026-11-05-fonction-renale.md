# Veille du 2026-11-05 (soir) — sources de la fonction rénale et faux changements résiduels

## Sources ajoutées (33 au total)

Pour le calcul de la fonction rénale et son usage posologique :
- HAS, guide du parcours de soins MRC (2021, mis à jour en 2023) et fiche « 7 messages clés » ;
- KDIGO 2024 (maladie rénale chronique) ;
- NKF, formule CKD-EPI 2021 ;
- FDA 2024 et EMA (pharmacocinétique en insuffisance rénale).

Leur empreinte de référence a été enregistrée lors d'une relance manuelle (`--force`).

## Faux changements constatés

Trois relances successives ont signalé, une fois chacune, la page HAS « Choix et durées d'antibiothérapie », la page boutique du CA-SFM, puis la page ANSM fluoroquinolones et la page EAU. Chaque page était « inchangée » à la relance suivante.

- **Page HAS** : un bloc masqué contient un jeton CSRF de 16 caractères. Le filtre existant ne le retirait que s'il contenait un chiffre et une majuscule. Un jeton sans chiffre (environ 6 % des requêtes) changeait l'empreinte.
- **ANSM et EAU** : signalées une seule fois, juste après la correction du normaliseur. C'est le ré-étalonnage attendu des pages qui contiennent des blocs masqués.
- **Page boutique SFM** : trois téléchargements successifs donnent le même texte normalisé. L'origine du changement isolé n'a pas été retrouvée.

## Correction

- `tools/veille/run.mjs` retire désormais les blocs masqués (`style="display:none"`) qui ne contiennent que du texte : jeton CSRF, contexte Ajax.
- Relance suivante : **aucune nouveauté**, aucune source inaccessible.
- Les entrées « changement en attente » créées par ces faux positifs n'ont pas été conservées dans `src/clinical/etat-base.json`.

## Limite

Un changement isolé et non reproductible de la page boutique SFM reste possible. Le CA-SFM étant versionné (V1.0 de septembre 2026), un vrai changement apparaîtrait aussi dans le repère de version, qui reste la référence.
