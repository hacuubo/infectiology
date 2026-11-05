# Relecture v3 — relecteur 1 (développement, ergonomie)

Objet : commit `854db9e` (branche `feat/fonction-renale-explications`), diff `9fa598d..854db9e`.
Vérifications faites : `npx tsc --noEmit -p .` sans erreur ; `npx vitest run` : 11 fichiers, 202 tests réussis.
Sondes jetables (fichiers de test temporaires, supprimés ensuite) : les scénarios ci-dessous ont été exécutés et non seulement lus.

Formules : les 10 exemples indépendants du §7 (A à J) sont couverts par `src/tests/renal.test.ts` et passent. CKD-EPI 2009/2021, EKFC (Q en µmol/L, facteur d'âge seulement après 40 ans), Du Bois, désindexation, Cockcroft-Gault, Devine et poids ajusté sont conformes. La conversion 88,4 est appliquée une seule fois, dans le bon sens. L'unité n'est jamais déduite de la valeur.

---

## Bloquant

### B1. Discordance entre Cockcroft-Gault et DFG désindexé : la sortie vaut « complet » alors que la dose n'est pas déterminée
- `src/calc/renal.ts:539-547` renvoie `manquants: []` quand les deux estimations tombent dans des paliers différents. `src/engine/posologie.ts:301-314` ne pousse alors aucune `DonneeManquante`. `src/engine/sortie.ts:61-62` calcule donc `traitement = 'complet'`, et `src/ui/PanneauResultat.tsx:305` masque le panneau « Pourquoi la proposition est incomplète ».
- Scénario exécuté : `CAS_ECOLI_I` modifié (homme de 92 ans, 42 kg, 185 cm, créatininémie 250 µmol/L). Résultat : `sortie.traitement = 'complet'`, `motifs = []`, `donneesManquantes = []`. La céftriaxone s'affiche pourtant « Dose de référence (fonction rénale normale) … à adapter » avec « Adaptation rénale non calculée : … pas de choix automatique ». Le même cas sur un SASM (88 ans, 45 kg) donne la céfazoline en 1re ligne avec deux paliers contradictoires (11-34 et 35-54).
- Le cas « fonction rénale instable » est traité de façon cohérente : `bloque_dose` avec une cible. La discordance ne l'est pas, alors que le contrat de `EtatSortie` dit « complet = sans donnée bloquante ».
- Correction : en cas de `choix.discordance`, pousser une donnée bloquante. Exemple : `{ champ: 'choix de l'estimation rénale (Cockcroft-Gault ou DFG désindexé)', impact: 'bloque_dose', cible: 'patient.renal.poidsCockcroft' }`, ou un motif dédié. Ajouter un test au niveau du plan : `sortie.traitement === 'partiel'` et motif présent.

### B2. Une exception dans `construireContexte` donne un écran blanc et efface la saisie : l'état H n'est jamais atteint
- `App.tsx:33-39` protège `ctx`, et `deciderSansPanne` protège le moteur. En revanche, `ApercuRenal` (`src/ui/FonctionRenale.tsx:70`, monté sans garde dans `FormulaireDossier.tsx:123`) appelle `contexteUI` → `construireContexte` → `estimerFonctionRenale` en dehors de tout `GardeErreur`. `Indication.tsx:142` et `Microbiologie.tsx:210` font de même. `GardeErreur` n'entoure que le panneau de résultat.
- Scénario exécuté : `construireContexte` simulé pour lever une exception quand l'âge vaut 99. Après saisie de l'âge, `document.body` ne contient plus que `<div></div>` (11 caractères). Le formulaire et la fiche disparaissent et l'état `App` est perdu, puisqu'aucune persistance n'existe. Le panneau « Erreur technique » ne s'affiche jamais. Or le code rénal réécrit, le plus susceptible de lever une exception, s'exécute justement dans ce chemin.
- Correction : une limite d'erreur racine autour du contenu de `App` qui conserve l'état (garder `dossier` dans un parent qui ne lève pas) ; entourer `ApercuRenal`, `SectionIndication` et la microbiologie d'un `GardeErreur` ; rendre `contexteUI` tolérant (renvoyer `undefined` en cas d'échec). Ajouter un test au niveau de l'`App`, et pas seulement de `deciderSansPanne`.

---

## Majeur

### M1. Sans taille, un DFG indexé normal bloque la dose et la surveillance de molécules qui ne s'adaptent qu'à moins de 10 mL/min
- `renal.ts:550-553` et `509-515` refusent toute estimation en mL/min sans surface corporelle. C'est correct sur le principe, mais le résultat est absurde quand le palier ne dépend pas de la surface corporelle.
- Scénario exécuté : `CAS_ECOLI_I` sans poids ni taille (64 ans, créatininémie 90 µmol/L, DFG indexé CKD-EPI 2009 ≈ 78). La céftriaxone (seuil < 10) affiche « Dose de référence … à adapter », la fiche passe à « Proposition incomplète » (`bloque_dose`), et la surveillance demande en plus « si insuffisance rénale ou sujet âgé » (`bloque_surveillance`, sans cible ni bouton). C'est le scénario demandé « données suffisantes pour le DFG sans poids ni taille ». Il n'est testé qu'au niveau de `estimerFonctionRenale`, jamais au niveau du plan.
- Correction (sans substituer d'unité) : encadrer le DFG désindexé sur l'intervalle de surface corporelle plausible (par exemple 1,2 à 2,6 m², soit un facteur 0,69 à 1,50). Si les deux bornes tombent dans le même palier, retenir ce palier en l'expliquant (« quel que soit le gabarit ») ; sinon, refuser comme aujourd'hui. Le même encadrement s'applique à `evaluerCondition('insuffisance_renale')`.

### M2. Régression silencieuse du risque de complication de la PNA (SPILF 2015)
- `src/clinical/rules/bgn-urinaire.ts:159-165` ne retient plus que les estimations en mL/min. Avec un DFG indexé de 20 et sans poids ni taille, `clcr` est `undefined`. La PNA est alors classée « simple » (7 jours, pas d'uroscanner obligatoire) sans aucune donnée manquante signalée. Avant ce commit, l'ancienne `valeurPourPosologie` retombait sur le CKD-EPI indexé avec une limite affichée.
- Correction : même encadrement que M1. À défaut, si le DFG indexé est < 30 × 1,5, pousser `poids, taille` en `bloque_duree` avec la raison « risque de complication (clairance < 30) ».

### M3. Données incohérentes sans effet sur la sortie : la créatininémie datée du futur et l'âge implausible sont tout de même utilisés
- `renal.ts:267-271` signale une date future mais garde `creatValide = true`. `renal.ts:278` signale un âge supérieur à 120 sans rien bloquer. Le motif G (`sortie.ts:83-95`) affirme pourtant « ce qui en dépend ne peut pas être calculé de façon fiable », et l'incohérence ne compte pas dans `bloquants` (`sortie.ts:61`).
- Scénario exécuté : `CAS_ECOLI_I` avec une créatininémie datée du 2027-11-04. Résultat : `traitement = 'complet'`, motif `incoherence` présent mais **non affiché**, car `ExplicationSortie` n'est rendu que si la sortie n'est pas complète (`PanneauResultat.tsx:305`). L'adaptation « ≈ 102 mL/min : pas d'adaptation » est produite à partir de cette valeur. Avec un âge de 150 ans, Cockcroft-Gault donne `NaN`, et l'application bascule silencieusement sur le DFG désindexé avec le texte « Cockcroft-Gault non calculable () ».
- Correction : toute incohérence portant sur une entrée d'une formule doit rendre cette entrée invalide (comme pour la créatininémie implausible) et imposer au moins `traitement = 'partiel'`. Afficher le motif G même quand la sortie est complète.

### M4. Avis de changement : invisible sous `StrictMode`, faux lors d'un changement de patient, bruyant à chaque chiffre saisi
- `App.tsx:45-50` écrit dans une `ref` à l'intérieur d'un `useMemo`, ce qui est un effet de bord pendant le rendu. Sous `<React.StrictMode>` (`main.tsx:7`), React 18 rend deux fois : le second rendu compare le plan à son double et renvoie `[]`. Scénario exécuté : sur le cas « sab », la saisie d'une créatininémie de 400 affiche l'avis sans StrictMode, mais **pas** avec StrictMode. Le chargement d'un autre cas fictif compare par ailleurs deux patients différents (« Votre dernière modification… »).
- `comparaison.ts:33-35` compare les textes d'adaptation, qui contiennent la valeur arrondie « ≈ 89 mL/min ». Une variation de 1 µmol/L suffit à déclencher « adaptation rénale modifiée » sans changement de palier.
- Correction : stocker le plan précédent dans un `useEffect` après validation du rendu (ou dans un `useState` mis à jour dans `modifier`) ; réinitialiser lors d'un chargement de cas ou d'un nouveau dossier. Comparer l'indice de palier et la dose, pas le texte. Ajouter un test d'interface sous StrictMode.

### M5. En mode usage clinique, les motifs affichés n'expliquent pas la vraie cause
- Scénarios exécutés : `CAS_SAB_SASM` et `CAS_ECBU_COLONISATION` avec `modeUsageClinique: true`. Les motifs sont C « Résultats microbiologiques insuffisants » (rang 30, en tête), F « Proposition masquée » et D « Situation non couverte par l'application — Limite : germe : S. aureus ». La seule vraie cause est F. Le motif C apparaît parce que `documentee` est faux une fois les options masquées (`sortie.ts:166`). Le motif D (`sortie.ts:241`) n'exclut pas le cas `masquees.length > 0`.
- C'est le mode destiné à l'usage réel : chaque fiche y donnera une explication trompeuse.
- Correction : calculer C et D sur les options d'avant le filtrage du mode clinique, ou les supprimer quand `masquees` explique déjà l'absence ; placer F en tête dans ce mode.

### M6. Arrondi affiché incohérent avec le palier retenu
- `posologie.ts:295` compare la valeur non arrondie, alors que le libellé (`renal.ts:484-486`, `nombreFr(…, 0)`) l'arrondit. Exemple vérifié : Cockcroft-Gault de 29,63 s'affiche « ≈ 30 mL/min » et tombe dans le palier « < 30 mL/min : réduire de moitié » (cloxacilline, daptomycine) ; 50,6 s'affiche « ≈ 51 » avec le palier « 26-50 » du méropénème. Le prescripteur voit une contradiction et ne sait pas quel palier croire.
- Correction : définir une règle unique (par exemple situer la valeur arrondie à l'entier, puisque les seuils des RCP sont des entiers) et l'appliquer à l'affichage comme à `palierDe`. Afficher une décimale à moins de 1 mL/min d'un seuil. Tester les bornes 29,5, 30 et 30,4.

### M7. Valeur fournie par le laboratoire : des combinaisons méthode/unité incohérentes sont acceptées
- `renal.ts:504` accepte une valeur « Cockcroft » déclarée en mL/min/1,73 m² comme DFG indexé (ertapénème). `renal.ts:512` et `552` acceptent une valeur « CKD-EPI » déclarée en « mL/min » comme valeur désindexée. Les deux cas ont été vérifiés avec `choisirEstimation`. Or la plupart des laboratoires rendent le CKD-EPI en mL/min/1,73 m², et l'erreur de saisie « mL/min » est probable. `renal.ts:436` déduit par ailleurs « mL/min » quand la méthode est Cockcroft et que l'unité est vide, ce qui contredit le principe « unité jamais déduite ».
- Correction : signaler en incohérence Cockcroft + indexé ; pour CKD-EPI, MDRD ou EKFC + mL/min, demander une confirmation (« valeur désindexée par le laboratoire ? ») avant tout usage.

### M8. Erreur technique : l'urgence disparaît
- `sortieErreurTechnique` (`sortie.ts:319-339`) fixe `urgence: false`, et `App.tsx` vide `urgentes` quand il n'y a pas de plan. Un patient en choc septique dont le calcul échoue perd le bandeau « antibiothérapie dans l'heure ». Le panneau propose alors d'abord « réessayer », c'est-à-dire d'attendre, alors que le moteur est déterministe et échouera de nouveau.
- Correction : déduire l'urgence de `dossier.patient.gravite` (lecture brute, protégée) dans `deciderSansPanne`. Si elle est présente, afficher en premier « Ne pas attendre l'application : prise en charge du sepsis selon le protocole local, avis immédiat ».

---

## Mineur

- **m1** `renal.ts:372`, `402` : `des` et `cg` héritent de `indexe.manquants`. Avec EKFC sélectionné et un âge de 18 à 25 ans, Cockcroft-Gault est déclaré non calculable (« EKFC : âge > 25 ans requis ») alors qu'il ne dépend pas de l'équation. La vancomycine et le céfépime sont alors bloqués à tort, et `cibleRenale` envoie vers l'âge plutôt que vers le sélecteur d'équation. Correction : séparer les manquants communs (créatininémie, âge, sexe) des manquants propres à l'équation.
- **m2** Doublons de demande : sans poids, la fiche affiche « poids, taille (surface corporelle) » et « poids » sur deux lignes (`posologie.ts:314`, le champ est la jointure par molécule et le dédoublonnage se fait par chaîne). Correction : une `DonneeManquante` par donnée, normalisée avec la clé de `unir()`.
- **m3** Code mort : la branche `substitution` (`renal.ts:522-531`), « seul le DFG désindexé » (`renal.ts:550`) et `posologie.ts:329` ne sont atteignables que si Cockcroft-Gault vaut `NaN` (âge ≥ 140), puisque le DFG désindexé exige déjà le poids. Elles produisent alors « Cockcroft-Gault non calculable () ». De même, `kdigoInstable`, `hasInstable` et `kdigoTable10` ne sont jamais utilisés, si bien que le refus pour instabilité n'a aucune source ; les types d'exclusion `contre_indication` et `inadaptee` ne sont jamais produits.
- **m4** Parenthèses vides : `LigneEstimation` affiche « non calculé () » quand `manquants` est vide (moins de 18 ans, âge `NaN`, Cockcroft-Gault `NaN`), et `choisirEstimation` produit « ni la clairance de Cockcroft-Gault () ni le DFG désindexé () ». Correction : afficher la raison de l'état (`raisonNonApplicable`) quand la liste est vide.
- **m5** Le préfixe d'urgence (`sortie.ts:293`) n'a pas de point avant « Ensuite » : « …sans la retarder Ensuite : … ».
- **m6** La référence de la ciprofloxacine est en mL/min/1,73 m², mais les textes de palier disent « ClCr 30-60 mL/min » (`molecules/divers.ts:78-80`), d'où l'affichage « ≈ 45 mL/min/1,73 m² : ClCr 30-60 mL/min ». Les conventions de bornes sont par ailleurs hétérogènes (`30.01` et `20.01` pour l'ertapénème et le céfixime ; `clcrMin: 30` pour « > 30 » de l'amoxicilline et du cotrimoxazole, alors que 30 appartient à « 10-30 » ou « 15-30 » dans le RCP). Correction : ajouter un attribut `bornes: '[)' | '(]'` explicite par palier.
- **m7** Bornes de saisie incohérentes avec la plausibilité : l'interface accepte 20 kg et 100 cm (`FormulaireDossier.tsx`), le moteur rejette en dessous de 25 kg et de 120 cm. L'âge accepte 150 malgré `max=120`. Aucun avertissement non plus quand la créatininémie a plus de N jours (seule la date absente est signalée), ni quand le DFG calculé dépasse 150 (signe probable d'une erreur d'unité entre 15 et 28 µmol/L).
- **m8** Accessibilité :
  - les boutons « Compléter » et « Corriger » ont tous le même nom accessible ; ajouter `aria-label={`Compléter : ${texte}`}` ;
  - `ApercuRenal` (`role="status" aria-live="polite"`) relit tout le bloc à chaque frappe ;
  - l'alerte d'urgence de `ExplicationSortie` (`role="alert"`) est réannoncée à chaque recalcul ;
  - `.estimation.non-calculable { opacity: .85 }` réduit le contraste d'un texte déjà en couleur `aide` ;
  - `scrollIntoView({ behavior: 'smooth' })` ignore `prefers-reduced-motion` ;
  - la cible `patient.renal.creatinine.date` donne le focus à la valeur, pas à la date.
- **m9** Affichage en double : pour « non indiquée », le motif A répète ce qu'affiche `CarteIndication` juste en dessous (raison, conditions, surveillance).
- **m10** `App.tsx` recalcule le contexte trois fois par frappe (`ctx` local, `contexteUI`, `decider`) ; utiliser `contexteUI` dans `App`. Le commentaire `eslint-disable` de `App.tsx:42` est inutile. `ResumePatient` reconstruit le nom de la formule par découpage de chaînes (`formule.split(' × ')`, `version.split(/[ ,(;]/)`) ; exposer plutôt un champ `nomCourt`.
- **m11** Le champ « si insuffisance rénale ou sujet âgé » (texte de condition de `molecules/base.ts:29`) est présenté comme une donnée à compléter, sans cible ni bouton.

## Tests manquants (par rapport aux scénarios demandés)
1. Niveau plan : DFG indexé seul pour une molécule à seuil bas (M1), discordance avec l'état de sortie (B1), valeur du laboratoire utilisée en repli (M7), incohérence de date ou d'âge avec l'état de sortie (M3).
2. Bornes de palier et arrondi (M6) ; EKFC entre 18 et 25 ans avec Cockcroft-Gault (m1) ; EKFC avant 40 ans.
3. Interface : avis de changement de créatininémie (aucun test, et M4 sous StrictMode) ; erreur technique au niveau de l'`App` (B2) ; focus après « Compléter » sur un champ masqué ou dans un `<details>` fermé.
4. Mode usage clinique : contenu et ordre des motifs (M5).
5. Urgence combinée à une erreur technique (M8).

Le rendu à 375 px a été vérifié par lecture du CSS : `.motif-dl` passe sur une colonne sous 600 px, et les `.ligne` reviennent à la ligne. Aucun problème bloquant n'a été relevé ; l'interface n'a pas été testée dans un navigateur.

---

## Suites données (2026-11-05)

Tests de non-régression : `src/tests/relectures-v3.test.tsx` et `src/tests/panne-interface.test.tsx`.

| Constat | Suite |
|---|---|
| B1 | Corrigé : une discordance de palier ajoute une donnée bloquante (`bloque_dose`, cible « poids de Cockcroft-Gault ») ; la proposition passe en « partielle » et le panneau s'affiche. |
| B2 | Corrigé : gardes locales autour du formulaire, de l'aperçu rénal, des questions d'indication, de l'antibiogramme guidé et du résumé ; une panne affiche une erreur technique, la saisie est conservée. Testé au niveau de l'`App` avec une panne simulée. |
| M1 | Corrigé : sans taille ni poids, le palier est retenu s'il est le même pour toute surface corporelle de 0,87 à 3,46 m² (DFG indexé × 0,5 à × 2, choix de l'application déclaré dans ARBITRAGES). Même encadrement pour la condition de surveillance « insuffisance rénale ». |
| M2 | Corrigé : `irChroniqueSevere` (vrai, faux ou inconnu) ; « inconnu » ajoute une donnée `bloque_duree` pour la PNA de la femme ; hémodialyse et dialyse péritonéale : risque retenu. |
| M3 | Corrigé : créatininémie datée du futur et âge implausible non utilisés ; toute incohérence rend la proposition au moins « partielle », motif G affiché. |
| M4 | Corrigé : plan de référence pris au moment de la modification (état React), remis à zéro au chargement d'un cas ; comparaison sans les valeurs arrondies. Testé sous StrictMode. |
| M5 | Corrigé : en mode usage clinique, motif « règles non validées » en tête ; motifs microbiologie et « non couverte » supprimés quand le masquage explique l'absence. |
| M6 | Corrigé : la valeur est arrondie à l'entier avant d'être située dans les paliers, comme à l'affichage. Paliers « > 30 » de l'amoxicilline, de l'amoxicilline-acide clavulanique et du cotrimoxazole bornés à 30,01 (30 appartient au palier inférieur dans le RCP). |
| M7 | Corrigé : unité jamais déduite ; Cockcroft-Gault déclaré indexé → incohérence ; CKD-EPI, EKFC ou MDRD déclarés en mL/min → non utilisés automatiquement. |
| M8 | Corrigé : la gravité est relue de façon protégée en cas de panne ; l'urgence et l'action urgente (SSC 2026) précèdent « Réessayer ». |
| m1 | Corrigé : manquants communs séparés de la restriction d'âge d'EKFC. |
| m2 | Corrigé : une ligne par donnée manquante. |
| m3 | Corrigé : branche de substitution supprimée (voir aussi l'audit documentaire, P3) ; sources KDIGO PP 4.2.5 et HAS rattachées au refus en cas d'instabilité. Types `contre_indication` et `inadaptee` conservés pour de futures règles. |
| m4 | Corrigé : plus de parenthèses vides. |
| m5 | Corrigé : ponctuation. |
| m6 | Corrigé : libellés de la ciprofloxacine en mL/min/1,73 m² ; bornes, voir M6. |
| m7 | Partiellement : bornes de saisie alignées (25 kg, 120 cm). Pas d'alerte d'ancienneté de la créatininémie ni de DFG > 150 : aucune source pour fixer un seuil. |
| m8 | Partiellement : noms accessibles des boutons, plus de relecture à chaque frappe, alerte d'urgence non réannoncée, `prefers-reduced-motion`, contraste. Le focus sur la date de la créatininémie reste sur la valeur. |
| m9 | Corrigé : la conclusion clinique détaillée est repliée quand un motif la résume. |
| m10 | Partiellement : l'`App` utilise le contexte en cache et le nom court exposé par le calcul ; le moteur construit encore son propre contexte. |
| m11 | Non traité : les conditions textuelles de surveillance n'ont pas de champ cible. |
