# Veille du 2026-11-05 — faux changements corrigés

## Contexte

Le registre de veille passe de 16 à 27 sources pour couvrir les nouvelles règles :
- décision « traiter / ne pas traiter » : AFU 2026, SPILF 2015 argumentaire, HAS femme enceinte, HAS cystite, HAS 2019 infections cutanées, IWGDF/IDSA 2023, IDSA 2019 bactériurie asymptomatique, IDSA/ESCMID 2026 S. aureus ;
- antibiogramme guidé : EUCAST phénotypes de résistance attendus v1.2, phénotypes inhabituels v1.1, détection des mécanismes v2.01.

La veille a été relancée manuellement (`--force`) pour enregistrer leurs empreintes de référence. Le journal de la première veille du jour est conservé dans `2026-11-05-premiere-reference.md`.

## Faux changements détectés

Ces relances ont signalé comme « changées », à quelques heures d'intervalle, cinq pages HAS, la page boutique du CA-SFM et la page IDSA/ESCMID S. aureus. L'examen du texte normalisé, téléchargé deux fois de suite, a montré que seuls des éléments sans valeur documentaire variaient :
- **Pages HAS** : un jeton encodé régénéré à chaque requête, en pied de page.
- **Page boutique SFM** : la rubrique « Related products », tirée au hasard.

Aucun contenu de recommandation n'avait changé.

## Correction

- `tools/veille/run.mjs` retire les jetons encodés : chaînes de 60 caractères ou plus, ou de 16 caractères ou plus mêlant chiffres et majuscules.
- La page boutique SFM est coupée au repère « Related products » (champ `couperApres` du registre).
- Deux relances consécutives après correction : **aucune nouveauté**, aucune source inaccessible.
- Les entrées « changement en attente » créées par ces faux positifs ont été retirées de `src/clinical/etat-base.json`. Elles portaient les identifiants `2026-11-05-has-antibiotherapie`, `-has-pna-femme`, `-casfm-2026-v1.0`, `-has-femme-enceinte-iu`, `-has-cystite-femme`, `-has-infections-cutanees-2019` et `-idsa-escmid-sab-2026`.

## Limite

Un filtre plus large réduit les faux changements mais peut, en théorie, masquer une modification qui ne porterait que sur une telle chaîne. Les repères de version et les fichiers PDF, comparés octet par octet, restent la référence.
