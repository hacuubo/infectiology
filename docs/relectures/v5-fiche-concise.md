# Relecture v5 — fiche concise (2026-11-06)

Deux relectures par des agents IA : l'une de développement, l'autre de sécurité de l'information clinique et de conformité documentaire. Aucune ne remplace une validation humaine qualifiée.

## Demande de l'utilisateur

Fiche plus concise, avec moins d'encarts :
- en tête, la liste des éléments manquants, chacun cliquable vers son champ de saisie ;
- les mêmes champs surlignés dans la saisie ;
- la mention « règles non validées par un humain » déplacée en fin de fiche ;
- les carrés d'étapes supprimés (Indication / Foyer et germe / Résultats / Prise en charge) ;
- une synthèse plus fournie : germe, traitement avec dose, mode d'administration et durée, surveillance résumée ;
- les sources en liens simples, à cliquer.

## Ce qui a été fait

- **Éléments manquants en tête.** La liste réunit :
  - les données manquantes du plan ;
  - les éléments « à compléter » des motifs « informations manquantes » de l'état de sortie (point d'entrée, questions sur l'indication).
- **Champs signalés dans la saisie.** Chaque élément mène à son champ. Le champ porte la mention « à compléter », ou « à compléter (facultatif) » si la donnée affinerait seulement. Quand aucun champ précis n'existe, c'est la section qui est signalée (antibiogramme, signes cliniques, antécédents).
- **Synthèse.** Elle donne :
  - la situation, l'indication et le germe, avec les résultats déterminants et ceux à préciser ;
  - le traitement : dose, voie, modalités, adaptations, durée ;
  - la surveillance résumée, avec la cible et la condition mot pour mot ;
  - les avis urgents.
- **Mention du traitement.** « Traitement retenu » n'apparaît que si le prescripteur a retenu une option. Sinon, la synthèse affiche « Traitement proposé (1re ligne) ». Elle ajoute « provisoire » si une donnée bloque le choix, et reprend tels quels le statut, le motif et la prochaine action du moteur.
- **Retraits et regroupements.**
  - Carrés d'étapes et bandeau « non validées » supprimés en tête ; la mention est en fin de fiche.
  - Les badges « vérifiée par IA » ont disparu des options. Les badges « brouillon » et « retirée » restent.
  - Les alertes non urgentes deviennent une liste de points d'attention. Le niveau y est dit en texte, pas seulement par la couleur.
- **Sources.**
  - Chaque source devient un lien « organisme année » vers la recommandation, au passage cité quand il est connu. Le titre complet et les repères sont dans l'infobulle.
  - Deux sources de même organisme et de même année sont distinguées par le début du titre.
  - La liste complète figure en fin de fiche. Elle reprend aussi les sources de l'indication, de la lecture microbiologique et du calendrier.

## Constats et suites données

| Niveau | Constat | Suite |
|---|---|---|
| Bloquant | Une 1re ligne provisoire (foyer manquant) apparaissait comme « Traitement retenu », sans le mot « provisoire ». | Intitulé « Traitement proposé (1re ligne) — provisoire » ; statut, motif et prochaine action du moteur repris dans la synthèse ; « retenu » réservé au choix du prescripteur. Testé. |
| Bloquant | Sans traitement proposé, ni explication ni prochaine action (dossier vide ; motif masqué). | Motifs « informations manquantes » repris dans la synthèse. Renvoi à « l'explication ci-dessous » seulement si elle est affichée. Point d'entrée ajouté aux éléments manquants. Testé. |
| Majeur | Le statut « brouillon » était devenu invisible. | Seul « vérifiée par IA » est masqué ; « brouillon » et « retirée » restent marqués, y compris dans la synthèse. Testé. |
| Majeur | Le filtre des adaptations retirait une réserve de calcul (estimation substituée). | Toutes les adaptations sont reprises dans la synthèse. |
| Majeur | Foyer : avec plusieurs prélèvements, un foyer déjà renseigné était surligné et le lien menait au mauvais champ. | Seul un foyer encore inconnu est signalé. |
| Majeur | Les données sans champ précis n'étaient pas surlignées. | Section signalée. |
| Majeur | Des libellés obscurs n'avaient leur sens que dans l'infobulle. | Sans champ cliquable, la raison est affichée ; avec un champ, elle est reliée au bouton pour les lecteurs d'écran. |
| Majeur | Liens de sources ambigus : deux RCP de l'ANSM avaient le même nom. | Libellés distingués par le début du titre. Ajout de « (nouvel onglet) » pour les lecteurs d'écran. Testé. |
| Mineur | Surveillance « (conditionnel) » sans la condition. | Condition reprise mot pour mot. Testé. |
| Mineur | Avertissements de prescription absents de la synthèse. | Renvoi « N avertissement(s) : voir les options thérapeutiques ». |
| Mineur | « Surveillance » pour « Ne pas prescrire d'antibiotique ». | Intitulé « À faire et surveillance » ; doublon retiré du calendrier. |
| Mineur | Libellé tronqué d'une parenthèse d'alternatives (« ou dosage plasmatique… »). | Parenthèse conservée. |
| Mineur | Avertissements communs moins visibles que les avertissements propres. | Encadré rétabli. |
| Mineur | Étiquette « à compléter » mal placée à 375 px ; points d'attention distingués par la couleur seule ; sources en gras dans la barre d'urgence ; test fragile. | Corrigés. |
| Documentaire | La liste « complète » des sources omettait celles de l'indication, de la microbiologie et du calendrier. | Ajoutées à la liste de fin de fiche. |
| Documentaire | Un seul lien par source : les autres repères ne sont lisibles qu'au survol, donc pas sur écran tactile. | **Non corrigé** : ils restent lisibles dans la liste de fin de fiche. |
| Documentaire | La mention « non validée » n'est plus visible près du traitement. | **Conforme à la demande** : fin de fiche, plus le pied de colonne « non validé pour l'usage clinique ». Soumis à l'utilisateur. |

## Vérifications

- `npx tsc --noEmit` : réussi.
- `npx vitest run` : 234 tests réussis, dont 11 dans `fiche-v5.test.tsx`.
- `npm run build` : réussi.
- Aperçu local :
  - six éléments manquants listés et surlignés ;
  - un clic mène au champ ;
  - pas de débordement à 375 px.
