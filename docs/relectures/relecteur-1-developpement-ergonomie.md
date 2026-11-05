# Relecture 1 — développement et ergonomie

Date : 2026-11-05. Branche : `feat/premiere-chaine-complete`. Aucun commit ni envoi effectué.
Périmètre modifié : `src/calc/`, `src/engine/`, `src/schedule/`, `src/ui/`, `src/tests/`. **`src/clinical/**` n'a pas été modifié** : un autre relecteur (audit clinique) y travaillait en même temps.

## 1. Méthode

1. Lecture du README, de `docs/PERIMETRE.md`, puis de tout le code hors base clinique : `engine/` (contexte, posologie, decider, etat), `calc/renal.ts`, `schedule/frise.ts`, `ui/`, `tests/`.
2. Recalcul à la main des formules (Cockcroft-Gault, CKD-EPI 2021, Du Bois, Devine, poids ajusté) et comparaison avec le code.
3. Parcours dans le navigateur intégré (serveur Vite `http://localhost:5173`), en largeur ordinateur (1366 × 850) et tablette (768 × 1024), avec les cas fictifs et des saisies manuelles.
4. Chaque anomalie a été reproduite (navigateur ou test), corrigée, puis couverte par un test de non-régression (`src/tests/relecture-dev.test.tsx`).
5. Vérification finale : `tsc`, `vitest`, `build`. Pour séparer mes changements de ceux de l'audit clinique en cours, j'ai aussi lancé la suite dans une copie temporaire contenant mes fichiers et la version d'origine (HEAD) de `src/clinical/`.

## 2. Parcours testés

| Parcours | Navigateur | Test automatisé |
|---|---|---|
| Entrée A (syndrome « urinaire ») : fiche probabiliste immédiate | oui | oui |
| Entrée B (cas fictifs 1 à 13 chargés) | oui (cas 6, 9, 11, 12, 13, 5) | oui (13 cas) |
| Retour A → B → A sans ressaisie du syndrome | non | oui |
| « Inconnu » distinct de « non » (grossesse, gravité) | oui (gravité) | oui |
| Invalidation : grossesse « oui » puis sexe « homme » → réponse effacée et signalée ; retour à « femme » → « inconnu » | oui | oui |
| Recalcul immédiat après modification | oui | oui (test existant et nouveaux) |
| Résumé patient permanent (barre du haut, visible dans les deux onglets) | oui | oui |
| Fiche A-E visible, détails dépliables (frise, surveillance, sources) | oui | oui |
| Navigation clavier dans les groupes radio (flèches, Début/Fin, un seul arrêt de tabulation) | oui (vraie frappe de touche) | oui |
| Tablette 768 px : onglets Saisie/Fiche, pas de défilement horizontal, colonnes qui défilent sous la barre fixe | oui | oui (règle CSS, test statique) |
| Saisie de la créatininémie (unité avant la valeur, unité incohérente) | oui | oui |
| Frise datée (cas 13 avec horaires) / relative (sans horaires) | oui | oui (13 cas sans horaires) |

## 3. Anomalies trouvées

Gravité : **critique** (fonction inaccessible ou valeur dangereuse), **majeure**, **mineure**.

| # | Gravité | Fichier:ligne (avant correction) | Anomalie | Corrigée |
|---|---|---|---|---|
| 1 | critique | `src/ui/styles.css:53-56` | Sous 980 px, la règle générale `.onglets { display: none }` était écrite **après** la règle de la media query. Les onglets étaient donc masqués, la colonne résultat aussi (`masque-mobile`) : **la fiche était inaccessible sur tablette**. Constaté dans le navigateur. | oui (ordre des règles, test de non-régression) |
| 2 | critique | `src/ui/FormulaireDossier.tsx:74` | Choisir l'unité de créatininémie avant de saisir la valeur créait une créatininémie **à 0**. Le résumé affichait « créat. 0 mg/dL ; CKD-EPI ≈ NaN » et la valeur NaN pouvait servir aux paliers de dose. Constaté dans le navigateur. | oui (unité « en attente » gardée dans l'état local) |
| 3 | critique | `src/calc/renal.ts:42,59,176` | Une créatininémie ≤ 0 ou non numérique produisait NaN, qui était quand même retenu comme `valeurPourPosologie` par la branche CKD-EPI. | oui (valeur invalide traitée comme manquante) |
| 4 | majeure | `src/calc/renal.ts` | Aucun contrôle de cohérence entre la valeur et l'unité. Exemple : 1,2 saisi en µmol/L donnait une clairance d'environ 5 000 mL/min, donc « pas d'adaptation ». | oui : bornes 15–2 500 µmol/L et 0,17–28,3 mg/dL. Hors bornes, la valeur n'est pas utilisée et l'interface affiche « s'agit-il de mg/dL ? » |
| 5 | majeure | `src/engine/posologie.ts:217` | Le plafond de la **dose de charge** n'était pas appliqué (vancomycine 25 mg/kg, maximum 3 g : 150 kg donnait 3 750 mg). | oui |
| 6 | majeure | `src/engine/posologie.ts:196-204` | `doseMaxParJour` n'était jamais appliqué aux doses pondérales. | oui (plafond journalier ÷ nombre d'administrations ; arrondi fait avant le plafond) |
| 7 | majeure | `src/schedule/frise.ts:37-40` | Ancre `debut_traitement` **sans délai explicite** (« À chaque administration », « Chez tous les adultes, dès que possible ») : l'heure de la 1re dose s'affichait comme date. **Date inventée.** | oui : pas de date sans délai explicite |
| 8 | majeure | `src/schedule/frise.ts:35` | `avant_traitement` affichait toujours « Maintenant, avant la 1re dose », y compris pour « au plus tard dans les 24 h » (uroscanner), « Sans délai » (ETT) ou « … si le cathéter est conservé ». | oui (texte de la source repris quand il y a un délai ou une condition) |
| 9 | majeure | `src/schedule/frise.ts` | Le champ `jour` de `SpecCalendrier` était ignoré. Un « J2 » était daté à l'heure près (1re dose + 24 h), ce qui confond jour de traitement et délai en heures. | oui : un jour de traitement est daté au jour près, sans heure |
| 10 | majeure | `src/ui/PanneauResultat.tsx` (frise) | La frise affichait comme « moment » le texte complet de la source (« après 48 h de traitement — juste avant la dose suivante (position précisée par…) »). La cible du dosage (60-80 mg/L…) et les limites n'y figuraient pas. | oui : moment court (« Juste avant la 3e dose », « 1re dose : fin de perfusion + 30 min · mer. 04/11 10:00 », « J2 », « H+48 après la 1re dose ») ; cible toujours visible ; pourquoi, conduite, répétition, limites, texte source et sources dans un panneau dépliable |
| 11 | majeure | `src/engine/decider.ts:187-189` | Dédoublonnage des données manquantes : quand une demande d'impact plus fort remplaçait la précédente, le motif de la première était **perdu**. | oui (motifs fusionnés, impact maximal conservé) |
| 12 | majeure | `src/ui/PanneauResultat.tsx:95` | `aria-live="polite"` sur toute la fiche : un lecteur d'écran relisait toute la fiche à chaque frappe. | oui : un message de statut court et masqué remplace cette annonce |
| 13 | majeure | `src/ui/composants.tsx` | Groupes `role="radiogroup"` sans navigation au clavier : chaque bouton était un arrêt de tabulation et les flèches étaient inactives. | oui (tabulation itinérante, flèches, Début/Fin) |
| 14 | mineure | `src/ui/composants.tsx:5-9` | Identifiants de champs générés par un compteur global à chaque rendu : instables et non déterministes. | oui (`useId`) |
| 15 | mineure | `src/engine/posologie.ts:217`, `ResumePatient.tsx:15-21` | Nombres affichés avec un point décimal (« 52.5 kg », « 1.2 mg/dL »). | oui (`src/calc/format.ts`, test sur les 13 cas) |
| 16 | mineure | `src/engine/posologie.ts:37` | Unités incohérentes : « 1,8 g » à côté de « 1560 mg » selon que la dose tombait sur une centaine ronde. | oui : doses pondérales toujours en mg ; conversion en g seulement si elle est exacte (doses fixes) |
| 17 | mineure | `src/engine/posologie.ts:256` | « dialyse (oui/non) » et « dialyse / épuration extrarénale (oui/non) » apparaissaient sur deux lignes séparées. | oui (même libellé, fusion) |
| 18 | mineure | `src/engine/posologie.ts:65` | Poids idéal pouvant dépasser le poids réel (patient maigre). Aucun régime de la base ne l'utilise aujourd'hui. | oui (minimum des deux) |
| 19 | mineure | `src/ui/ResumePatient.tsx` | Valeurs codées brutes dans le résumé (« non controlees », « foyer confirme », « hemodialyse intermittente »). La valeur retenue pour les doses n'y figurait pas. | oui (libellés, ligne « Retenu pour les doses », heure de la 1re dose) |
| 20 | mineure | `src/ui/styles.css` | Contraste insuffisant : bordure des contrôles #d9dee5 (1,3:1) et anneau de focus #8fb8ea (2:1). | oui (#767f8e ≥ 3:1, focus #0b5cad) |
| 21 | mineure | `src/ui/FormulaireDossier.tsx` | Plusieurs boutons portaient le même nom « Retirer », les groupes S/I/R étaient tous nommés « Catégorie », et la méthode du DFG ne pouvait pas être choisie avant la valeur. | oui (noms explicites, `role="group"` par prélèvement et par allergie, méthode « en attente ») |
| 22 | mineure | `src/ui/styles.css` | Les éléments `.sr-only` (position absolue) allongeaient la page : un défilement du document apparaissait sous la mise en page fixe. Constaté dans le navigateur. | oui (`position: relative` sur les colonnes) |
| 23 | mineure | `src/schedule/frise.ts` | `moment` de réévaluation « H+48 » sans ancre. | oui (« H+48 après la 1re dose ») |

## 4. Simplification de la fiche

- **Barre permanente** sous l'en-tête : niveau d'urgence, alertes urgentes (une seule fois) et résumé du patient compact (repliable). Elle reste visible dans les deux onglets et pendant le défilement, car les colonnes défilent indépendamment sous la barre.
- **Avertissements répétés par molécule** (sujet âgé, fonction rénale instable…) : regroupés en tête de la section B avec la liste des molécules concernées. Sous chaque molécule, un renvoi « + n avertissements communs » les remplace. Aucun avertissement n'est supprimé.
- **Durée** : affichée une seule fois par option quand elle est identique pour toutes les molécules.
- **Badges de statut** : forme courte (« vérifiée par IA ») avec le libellé complet en infobulle et dans le bandeau de la fiche. Le badge d'une molécule n'apparaît que s'il diffère de celui de l'option.
- **Frise** : deux colonnes (Quand / Quoi). Le moment est court, la cible du dosage reste visible. Pourquoi, conduite, répétition, limites, texte source et sources sont dans un panneau dépliable. Une phrase indique si le calendrier est daté ou relatif.
- Options conditionnelles dépliées d'office quand il n'existe aucune 1re ligne. Avis spécialisés urgents placés en tête de la section D.

## 5. Contrôle des calculs

- Cockcroft-Gault : formule exacte, équivalence µmol/L ↔ mg/dL (facteur 88,4) vérifiée, coefficient 0,85 pour les femmes. Garde-fous ajoutés : âge ≥ 140 ans et poids ≤ 0.
- CKD-EPI 2021 : coefficients κ et α et facteur 1,012 conformes. Vérifié sur 3 jeux de valeurs (84,3 ; 91,7 ; 116,3).
- Du Bois, Devine, poids ajusté (PI + 0,4 × excès, seuil poids réel/PI > 1,25) : conformes.
- Remarque non corrigée : la branche « CKD-EPI désindexé » de `valeurPourPosologie` est pratiquement inatteignable. La désindexation exige le poids, et le poids donne Cockcroft, qui est prioritaire. Le comportement reste correct.
- Déterminisme : plan JSON identique sur deux exécutions pour les 13 cas. Aucune dépendance à l'horloge dans les règles (`ctx.maintenant` n'est pas utilisé).

## 6. Tests ajoutés

`src/tests/relecture-dev.test.tsx` contient **33 tests** :
- formatage français ;
- formules recalculées à la main ;
- créatininémie nulle ou d'unité incohérente ;
- plafonds par administration et par jour, plafond de la dose de charge de la vancomycine ;
- absence de point décimal dans les 13 cas ;
- calendrier : sans délai → pas de date ; J2 daté au jour près ; dose n > 1 jamais datée ; « juste avant la dose suivante » ; fin de perfusion datée seulement si la durée est connue ; « sans délai » ; aucune date dans les 13 cas sans horaires ; moments ≤ 70 caractères ; pas de doublon ;
- déterminisme, dédoublonnage des données manquantes, distinction inconnu/non ;
- interface : règle CSS tablette, clavier dans les groupes radio, créatininémie, barre d'urgence et avertissements communs, résumé lisible, A → B → A et invalidation, frise dépliable.

Test existant ajusté : `acceptation.test.ts:240` (`/après la 1re dose/` → `/1re dose/`, nouveau libellé court ; le sens du test est inchangé).

## 7. Résultats finaux

- `npx tsc --noEmit` : **0 erreur**.
- `npx vitest run` (dossier de travail, avec les modifications cliniques en cours de l'autre relecteur) : **95 réussis, 3 échecs sur 98**. Les 3 échecs viennent tous de modifications concurrentes dans `src/clinical/**` (voir § 8).
- Même suite dans une copie contenant mes fichiers et `src/clinical/` de HEAD (sans `audit-clinique.test.ts`, propre à l'autre relecteur) : **81/81 réussis** (48 initiaux + 33 nouveaux).
- `npm run build` : **réussi** (avertissement Vite : paquet JS de 505 kB, au-dessus du seuil indicatif de 500 kB).

## 8. Problèmes signalés à l'audit clinique (`src/clinical/**`, non modifié)

1. **Tests en échec dus aux modifications en cours** :
   - `base.test.ts` « molécules dont le RCP n'a pas été consulté restent en brouillon » : une molécule est passée à `verifiee_ia`.
   - `acceptation.test.ts` « C3G rendue I » : le régime attendu `ceftriaxone-2g` est devenu `ceftriaxone-2g12h`.
   - `acceptation.test.ts` « sources remplacées ou non lisibles » : `statutAcces` attendu `introuvable`, reçu `consultee`.
   
   Il faut soit mettre ces tests à jour avec justification sourcée, soit revoir les changements.
2. `molecules/betalactamines.ts` (« À chaque administration ») et `rules/cocci-gram-positif.ts` (ETT « Chez tous les adultes, dès que possible ») : ancre `debut_traitement` sans délai. Le moteur ne les date plus. L'ancre `non_determine` (ou une ancre « à chaque dose ») serait plus juste.
3. `rules/bgn-urinaire.ts` (uroscanner) : ancre `avant_traitement` avec `offsetHeures: 24` pour « au plus tard dans les 24 h ». Ce n'est pas « avant le traitement ». Le moteur reprend désormais le texte de la source ; une ancre dédiée serait préférable.
4. Ancre `hebdomadaire` utilisée pour des fréquences « non chiffrées » (`betalactamines.ts`, deux surveillances) : elle suggère une fréquence que la source ne donne pas. Le moteur affiche le texte, mais trie ces éléments à J7.
5. `vancomycine-residuelle` : `numeroDose: 4` + `jour: 2` + `avantDoseSuivante`. C'est cohérent seulement pour une administration toutes les 12 h ; avec un intervalle allongé (insuffisance rénale), la 4e dose n'est plus à J2. De même, `amikacine-residuelle` `numeroDose: 3` (« après 48 h ») suppose une dose toutes les 24 h. Proposition : n'exprimer que le jour ou le délai, ou rattacher le numéro de dose à la fréquence du régime.
6. `rules/outils.ts` (`Fiche.option`) : pour une option qui n'est pas de 1re ligne, toute donnée manquante est ramenée à « affine ». Le poids d'une option aminoside conditionnelle s'affiche donc « affinerait la proposition » alors qu'il bloque le calcul de dose de cette option.

## 9. Limites restantes

- Le numéro de dose n > 1 n'est jamais daté et sert au tri sur la base d'une dose toutes les 24 h. L'intervalle du régime n'est pas transmis à la frise (type `LigneSurveillance` dans `src/clinical/types.ts`, hors de mon périmètre).
- Seuils incohérents entre `etat.ts` (question « grossesse » posée jusqu'à 55 ans) et `contexte.ts` (grossesse « possible » jusqu'à 50 ans) : non modifié, c'est un choix clinique à arbitrer.
- Une réponse effacée par invalidation n'est pas restaurée si l'utilisateur revient en arrière (choix de conception : pas de réponse incohérente conservée en mémoire cachée). La navigation A ↔ B, elle, ne perd rien.
- Les sections 2 à 5 du formulaire s'affichent avant le choix de l'entrée A ou B.
- Accessibilité vérifiée par l'arbre ARIA, les tests jsdom et une frappe clavier réelle, sans lecteur d'écran réel. Les petits téléphones (< 600 px) ne sont pas une cible testée.
- Les doses en insuffisance rénale restent des doses de référence accompagnées du palier du RCP (limite connue, `PERIMETRE.md`).
- Paquet JS de plus de 500 kB (registre des sources intégré) : découpage possible ultérieurement.

## 10. Fichiers modifiés ou créés

- Créés : `src/calc/format.ts`, `src/tests/relecture-dev.test.tsx`, ce rapport.
- Modifiés : `src/calc/renal.ts`, `src/engine/posologie.ts`, `src/engine/decider.ts`, `src/schedule/frise.ts`, `src/ui/App.tsx`, `src/ui/PanneauResultat.tsx`, `src/ui/ResumePatient.tsx`, `src/ui/FormulaireDossier.tsx`, `src/ui/composants.tsx`, `src/ui/libelles.ts`, `src/ui/styles.css`, `src/tests/acceptation.test.ts` (1 ligne).
