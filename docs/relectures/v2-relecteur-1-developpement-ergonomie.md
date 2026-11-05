# Relecture v2 — relecteur 1 : développement et ergonomie

Branche `feat/indication-antibiogramme-guide`, commit `c92ada1` (diff relu : `git diff feat/premiere-chaine-complete...HEAD`).
Date : 2026-11-05. Aucun fichier source ni test modifié par cette relecture.

## Résumé

- `npx tsc --noEmit` : OK. `npx vitest run` : 8 fichiers, 139 tests, tous verts. `npm run build` : OK, mais le paquet JS fait 604 kB (avertissement Vite > 500 kB).
- Les scénarios ont été rejoués sur le moteur (script jetable hors dépôt, groupé avec esbuild) et dans l'aperçu `http://127.0.0.1:5173` (cas fictif 14, largeur 375 px : aucun débordement horizontal, ni en « Saisie » ni en « Fiche »).
- Le socle est solide : l'évaluation de l'ECBU est pure, l'état « NT » et l'état « non rapporté » ne sont jamais lus comme S ou absent, un antibiogramme est effacé quand le germe change, les isolats sont modélisés, la carte « Pas d'antibiothérapie indiquée » est complète et sourcée.
- **Constat principal (bloquant)** : la décision d'indication est **globale au dossier**. La première règle qui en pose une l'emporte (`decider.ts:142`), puis **toutes** les options sont retirées (`decider.ts:185-186`). Une conclusion qui ne porte que sur un prélèvement (SCN sur une seule série, plaie colonisée) supprime donc le traitement d'une autre infection bien établie (pyélonéphrite déclarée).
- Autre constat bloquant : sur sonde, avec des signes urinaires seuls, le moteur demande « un autre foyer a-t-il été recherché ? », mais l'interface ne pose pas cette question. Le parcours est sans issue.
- 9 constats majeurs (« inconnu » lu comme « absent », réponses cachées conservées ou effacées à tort, questions sans effet, plan incohérent après « ne pas traiter », aucun test d'interface). Ils sont détaillés ci-dessous.

## Constats bloquants

### B1. Une indication portant sur un seul prélèvement retire le traitement des autres foyers

- **Fichiers** : `src/engine/decider.ts:142` (la première indication l'emporte), `src/engine/decider.ts:185-186` (`plan.options = []`), `src/clinical/rules/cocci-gram-positif.ts` (R_SCN, `ind('attendre_resultat' …)`), `src/clinical/rules/indication.ts:131-135` (R_PRELEVEMENT_SUPERFICIEL, qui ne tient pas compte du syndrome déclaré).
- **Scénarios rejoués** (moteur) :
  1. Pyélonéphrite déclarée (entrée syndrome urinaire, fièvre, signes urinaires, E. coli à l'ECBU) **+ hémoculture à S. epidermidis sur 1 série sur 2**. Résultat : `attendre_resultat` (R-BACTERIEMIE-SCN), situation `scn-une-serie`, **0 option**. Sans l'hémoculture, la même patiente reçoit 3 options (témocilline…).
  2. Même situation avec un **sepsis** : `urgence`, situation « SCN dans une seule série » (couverture « couverte »), **0 option**. La pyélonéphrite grave n'apparaît plus du tout.
  3. Pyélonéphrite déclarée, ECBU encore en attente, **écouvillon de plaie à S. aureus sans signe local** (`signesInfectionLocale = non`). Résultat : `ne_pas_traiter` « Pas d'antibiothérapie indiquée », 0 option. Sans la plaie : R-IU-FEBRILE et 2 options probabilistes.
- **Cause** : `evaluerECBU` s'efface dès qu'une hémoculture est positive. L'indication de R_SCN (priorité 130) devient alors celle de tout le dossier. Rien ne rattache une indication au prélèvement qu'elle concerne.
- **Correction proposée** : rattacher chaque `IndicationPlan` à un périmètre (`prelevementId` / foyer), par exemple `portee: { prelevementId?: string; foyer?: FoyerId }`. Ne retirer que les options issues de règles de ce même périmètre (ajouter `regleId` ou `prelevementId` sur chaque option). Quand un foyer est déclaré et traité par sa propre règle, une conclusion « contamination / colonisation » sur un autre prélèvement devient une **conclusion secondaire**, affichée à côté, et non la décision globale. Au minimum : R_SCN et R_PRELEVEMENT_SUPERFICIEL ne posent pas `f.c.indication` si `ctx.foyer` est déclaré et différent du foyer du prélèvement concerné.
- **Test à ajouter** : « PNA déclarée + SCN sur 1 série → options de la PNA conservées, conclusion SCN affichée séparément » ; même chose avec une plaie colonisée.

### B2. Bactériurie sur sonde avec signes urinaires seuls : la question demandée n'est jamais affichée

- **Fichiers** : `src/ui/Indication.tsx:23` (`autreFoyer: urine && (c.fievre === 'oui' || c.signesNonSpecifiques === 'oui')`), à comparer à `src/clinical/indication/ecbu.ts:198-221` (la branche sonde lit `autreFoyer` aussi quand `signesU === 'nouveaux'`).
- **Scénario** (cas 16 modifié) : sonde vésicale, fièvre « non », signes non spécifiques « non », signes urinaires « présents, récents ». Le moteur conclut `informations_insuffisantes` et demande « Un autre foyer infectieux a-t-il été recherché ? ». L'interface n'affiche pas cette question, puisque ni la fièvre ni les signes non spécifiques ne valent « oui ». L'utilisateur ne peut pas débloquer la décision.
- **Note** : le titre et les conditions affichés sont en plus faux : « … avec signes généraux », « fièvre ou signes généraux présents » (voir M5).
- **Correction proposée** : dériver la visibilité des questions de l'évaluation elle-même, et non d'une seconde règle écrite à la main. Par exemple, `evaluerECBU` renvoie la liste des champs `clinique.*` qu'il a lus ou qu'il demande (`champsUtiles: (keyof Clinique)[]`), et `SectionIndication` les affiche. À défaut, aligner `pertinenceClinique.autreFoyer` sur `urine && (fievre === 'oui' || nonSpec === 'oui' || (sonde && signesUrinaires === 'nouveaux'))`.
- **Test à ajouter** (interface) : pour toute évaluation `informations_insuffisantes`, chaque question listée correspond à un champ visible dans « Faut-il traiter ? » ou dans le formulaire.

## Constats majeurs

### M1. « Inconnu » lu comme « sans symptôme » dans la branche « prélèvement contaminé »

- **Fichier** : `src/clinical/indication/ecbu.ts:176-191`.
- `symptomatique = signesU === 'nouveaux' || fievre === 'oui' || declare` : un tableau clinique entièrement **inconnu** donne `ne_pas_traiter`, avec le titre « …sans symptôme » et la condition « aucun signe clinique renseigné ».
- **Scénario rejoué** : ECBU recueilli par collecteur, clinique laissée par défaut → « Pas d'antibiothérapie indiquée : prélèvement probablement contaminé, sans symptôme ». Même résultat chez une **femme enceinte** (grossesse « oui »), qui ne reçoit ni nouvel ECBU ni rappel de l'exception gravidique. Les exceptions (`exceptions()`) ne sont pas recherchées dans cette branche.
- **Correction** : si les signes urinaires ou la fièvre valent « inconnu », conclure `informations_insuffisantes` en posant ces questions. Appeler `exceptions()` (grossesse, geste) avant de conclure `ne_pas_traiter`. Pendant la grossesse, `attendre_resultat` (refaire l'ECBU).

### M2. Sur sonde, des signes urinaires « inconnus » sont lus comme « absents »

- **Fichier** : `src/clinical/indication/ecbu.ts:197` (`aucunSigne = … && signesU !== 'nouveaux'`).
- **Scénario rejoué** : cas 16 avec signes urinaires « inconnu » → `ne_pas_traiter`. Pourtant la même branche traite `signesU === 'nouveaux'` comme un critère. Si le critère compte quand il est présent, son absence de réponse ne peut pas valoir « non ».
- **Correction** : soit la définition IUAS R.1 ne retient que les signes généraux, et alors il ne faut lire ni poser `signesUrinaires` sur sonde ; soit il compte, et alors exiger `absents | chroniques_inchanges` pour conclure `aucunSigne`.

### M3. Question erronée quand le sexe est inconnu

- **Fichier** : `src/clinical/indication/ecbu.ts:265, 272`.
- **Scénario rejoué** : sexe « inconnu », signes urinaires récents, fièvre « non » → forme `a_preciser`. La seule question affichée est « Fièvre ou hypothermie ? », alors qu'elle a déjà la réponse « non ». L'information qui manque est le sexe. La donnée manquante bloquante pointe aussi vers la mauvaise question (`indication.ts:76`).
- **Correction** : construire `questions` d'après ce qui est réellement inconnu (`p.sexe === 'inconnu'` → « Sexe », `c.fievre === 'inconnu'` → « Fièvre »).

### M4. Réponses masquées conservées, puis utilisées

- **Fichiers** : `src/ui/Indication.tsx:14-27` (la visibilité est calculée côté interface) et `src/engine/etat.ts:206-214` (seul `clinique.gesteUrologique` a une règle de pertinence).
- **Scénario** : sonde, fièvre « oui », « Oui, un autre foyer est identifié ». L'utilisateur corrige ensuite la fièvre en « non » (et signes non spécifiques « non ») et coche des signes urinaires récents. La question sur l'autre foyer disparaît, mais la valeur `identifie` reste et l'évaluation conclut « Bactériurie sur sonde : les signes sont expliqués par un autre foyer » à partir d'une réponse invisible. C'est le même mécanisme qui empêche de débloquer B2.
- **Scénario 2** (rejoué sur le moteur) : stade « Antibiogramme » → « Identification ». L'antibiogramme du germe principal est effacé (`etat.ts:254`), **pas celui des isolats supplémentaires**. L'amoxicilline S du germe 2 reste. Elle n'est plus affichée (`Microbiologie.tsx:267` exige le stade « Antibiogramme »), mais elle alimente toujours `plan.microbiologie` (`decider.ts:165`) et la synthèse.
- **Correction** : ajouter dans `REGLES_PERTINENCE` les champs `clinique.*` (même prédicat que l'affichage, idéalement une seule fonction partagée entre `etat.ts` et `Indication.tsx`). Dans `REGLES_PERTINENCE_PRELEVEMENT.antibiogramme.reinitialiser`, vider aussi `isolatsSupplementaires[].antibiogramme / phenotypes / antibiogrammePour`.

### M5. Conditions affichées fausses (synthèse et carte)

- **Fichier** : `src/clinical/indication/ecbu.ts:210-221`.
- Avec signes urinaires seuls (sans fièvre ni signe général), le titre devient « Bactériurie sur sonde avec signes généraux » et la condition « fièvre ou signes généraux présents ». La carte « Ce qui justifie cette conclusion » affirme donc un fait qui n'a pas été saisi.
- **Correction** : générer conditions et titre à partir des valeurs réellement présentes.

### M6. Après « ne pas traiter », le plan garde les éléments du traitement

- **Fichier** : `src/engine/decider.ts:185-186` (seules les options sont retirées).
- **Scénario rejoué** : foyer urinaire déclaré, fièvre, autre foyer identifié → `ne_pas_traiter`. Le plan contient encore : contrôles « ECBU avant toute antibiothérapie », « Hémocultures de contrôle », « ECBU de contrôle sous ou après traitement » ; 1 réévaluation à 48-72 h de l'antibiothérapie ; 2 événements de frise ; l'alerte « Conduite des entérobactéries résistantes aux C3G » ; la donnée manquante « mécanisme de la résistance aux C3G ». Ces éléments contredisent la conclusion.
- **Correction** : quand la décision n'est pas de traiter, filtrer aussi `controles`, `reevaluation`, `frise`, `donneesManquantes` (impact `affine`) et les alertes de choix thérapeutique issues des règles de traitement. Le plus simple : ne pas appliquer ces règles (via `sApplique`), ou marquer leurs contributions par `regleId` et les filtrer en même temps que les options (cf. B1).

### M7. Questions sans effet sur la décision (exigence « chaque question a une utilité »)

- `Pourquoi cet ECBU a-t-il été fait ?` (`Microbiologie.tsx:30-46`) : `urine.motif` **n'est lu nulle part** dans le moteur (vérifié par grep : seuls `recueil` et `nbEspeces` sont lus).
- `Fièvre` et `Signes urinaires` sont affichés pour un syndrome urinaire déclaré **sans ECBU** (`Indication.tsx:20-21`), alors que `evaluerECBU` exige une urine positive. Ils sont sans effet (rejoué : R-IU-FEBRILE donne les mêmes options quelles que soient ces réponses).
- `Fièvre` est affichée pour un prélèvement superficiel, mais `R_PRELEVEMENT_SUPERFICIEL` ne la lit pas.
- `Signes non spécifiques` et `Geste urologique` restent affichés quand les signes urinaires sont « présents, récents » sans sonde (branche 3 : ni l'un ni l'autre n'est lu).
- Toute la section reste visible quand une hémoculture est positive, alors que `evaluerECBU` renvoie alors `undefined`.
- **Correction** : même mécanisme qu'en B2 (champs utiles renvoyés par l'évaluation) ; supprimer `motif` ou l'utiliser (contrôle après traitement, dépistage de grossesse ou bilan avant geste : cohérence avec `clinique.gesteUrologique` et la grossesse).

### M8. Changer d'identification efface à tort un antibiogramme encore valable

- **Fichier** : `src/engine/etat.ts:326-337`.
- **Scénario rejoué** : antibiogramme saisi pour « Entérobactérie (espèce non précisée) », puis germe précisé en « E. coli » : tout est effacé (« Le germe a changé… »). Même chose pour BGN non identifié → espèce, ou SCN non précisé → S. epidermidis. C'est la même souche et le même compte rendu : l'utilisateur doit tout ressaisir.
- **Correction** : ne pas effacer quand le nouveau germe affine l'ancien (même famille, ou ancien = groupe non identifié de la même lignée). Dans ce cas, conserver les résultats, retirer seulement ceux qui deviennent hors sujet, et le signaler. Le libellé de l'invalidation affiche aussi l'identifiant brut (« enterobacterie non identifiee ») : utiliser `LIBELLE_ORGANISME`.

### M9. Aucun test d'interface pour les nouveaux composants

- `src/tests/interface.test.tsx` et `relecture-dev.test.tsx` ne mentionnent ni « Faut-il traiter », ni « Ajouter d'autres résultats », ni « Autre germe », ni la synthèse ou les étapes. Les 37 scénarios de `indication-antibiogramme.test.ts` ne testent que le moteur.
- Non couverts : visibilité et invalidation des questions cliniques (B2, M4), radiogroupes des cartes (clavier, `aria-labelledby`), compteur « (n saisis) », ajout et retrait d'un isolat, effacement visible après changement de germe, absence de débordement à 375 px pour les cartes.

## Constats mineurs

| # | Fichier:ligne | Constat | Correction |
|---|---|---|---|
| m1 | `src/clinical/rules/indication.ts:62-78` | IU à germe hors BGN (ex. E. faecalis à l'ECBU, fièvre, signes) : indication « traiter », situation `aucune` (non couverte), aucune option, **aucun avis**. Rejoué. | Situation explicite « IU à germe non modélisé » + avis SMIT. |
| m2 | `src/clinical/rules/indication.ts:81` | `p.sexe === 'homme' && ev.forme === 'cystite'` n'est jamais vrai (`cystite` exige `sexe === 'femme'`, `ecbu.ts:265`) : code mort. | Supprimer. |
| m3 | `src/engine/contexte.ts:235` | `construireContexte` modifie le dossier passé (`d.clinique = …`) alors qu'il est appelé pendant le rendu (`Indication.tsx:157`, `Microbiologie.tsx:208`) sur l'objet d'état React. | Lire `d.clinique ?? cliniqueParDefaut()` sans écrire. |
| m4 | `src/ui/Indication.tsx:157`, `src/ui/Microbiologie.tsx:208` | `construireContexte` est recalculé à chaque rendu, une fois **par isolat** et une fois pour les étapes, en plus de `decider` dans `App`. | Exposer `foyer` et le contexte du guide dans `Plan` (ou un `useMemo` dans `App`) et les passer en props. |
| m5 | `src/ui/FormulaireDossier.tsx:58` | « Étape 1 — Faut-il traiter ? » est insérée entre « 1. Point d'entrée » et « 2. Patient » : la numérotation se contredit, et les 4 étapes du parcours (`EtapesParcours`) ne correspondent pas aux 5 sections du formulaire. La section n'apparaît qu'après l'ajout d'un ECBU en section 4, donc **au-dessus** de la position de lecture, sans annonce. | Renommer sans numéro (« Faut-il traiter ? »), annoncer son apparition (lien « Répondre aux questions d'indication » près de l'ECBU), ou la placer juste après le prélèvement. |
| m6 | `src/ui/Indication.tsx:141` | « Pour conclure, il manque » liste les questions en texte simple, sans lien vers le champ (grossesse en section 2, matériel en section 3). | Ancre ou bouton « Aller à la question ». |
| m7 | `src/clinical/indication/ecbu.ts:400-480` | Les exceptions sont demandées une par une (grossesse, puis geste au tour suivant). | Lister ensemble toutes les inconnues des exceptions. |
| m8 | `src/clinical/indication/ecbu.ts:385` | « Grossesse : non applicable » est affiché pour la valeur `inconnu`. Acceptable pour une femme de 72 ans dont la réponse a été invalidée, mais en général « inconnu » n'est pas « non applicable ». | Distinguer `inconnu` (sexe inconnu, âge ≤ 50 ans) et non applicable. |
| m9 | `src/ui/Indication.tsx:219` et `PanneauResultat.tsx` (B) | Décision « traiter » sans option (cystite, colonisation avant geste) : la synthèse affiche « aucune option de 1re ligne », et la carte n'apparaît que si `actions.length > 0`. Aucune carte pour une cystite. | Toujours afficher la carte d'indication ; synthèse « non modélisé — voir fiche HAS ». |
| m10 | `PanneauResultat.tsx` (section C), `Indication.tsx:222` | Pour « ne pas traiter », la synthèse indique « 0 élément(s) de surveillance, 0 contrôle(s), surveillance clinique — voir C », mais C affiche « Aucun calendrier ne peut être établi sans proposition thérapeutique », sans la surveillance de l'indication. La zone annoncée dit « Fiche recalculée : … 0 option(s) » au lieu de la décision. | Afficher `indication.surveillance` dans C ; formuler l'annonce à partir de `LIBELLE_DECISION`. |
| m11 | Fiche (vérifié dans l'aperçu, cas 14) | La raison est répétée trois fois : synthèse « Raison de ne pas traiter », A. Situation (description) et B. Carte. Ce n'est pas concis. | Dans A, renvoyer à B, ou n'afficher la raison que dans B. |
| m12 | `src/ui/Indication.tsx:159-164` | Étape 3 : le compteur « n à préciser » inclut les questions d'antibiogramme alors que le stade est « Identification » (rejoué : 6 inconnues pour une PNA sans antibiogramme). | Ne pas compter les questions d'antibiogramme avant le stade « Antibiogramme ». |
| m13 | `src/clinical/rules/outils.ts` (résistances attendues) + `analyse.ts:135-139` | Double signalement : l'alerte d'en-tête « aztreonam rendu S malgré… » (avec l'identifiant brut) **et** l'incohérence « Aztréonam rendu S… » de la lecture microbiologique. Rejoué sur SAB + aztréonam S. | Une seule source (l'incohérence) ; utiliser `libelleMolecule` dans la note. |
| m14 | `src/ui/Microbiologie.tsx:156-163` | Recliquer sur la catégorie déjà choisie la retire **et efface la CMI** saisie. | Conserver la CMI (catégorie `NT`). |
| m15 | `src/ui/Microbiologie.tsx:154`, `composants.tsx:95` | L'aide S/I/R/NT n'est portée que par `title` (inaccessible au tactile et peu lue par les lecteurs d'écran). | `aria-describedby` vers une aide visible, ou libellé long en `sr-only`. |
| m16 | `src/clinical/types.ts:273-279`, `src/ui/libelles.ts:45, 119-123` | `MecanismeResistance`, `DCI_ANTIBIOGRAMME` et les libellés `cephalosporinase_dereprimee` / `aucun_documente` sont du code mort après le passage aux phénotypes. | Supprimer. |
| m17 | `ContexteECBU.nbEspeces` vs `isolatsSupplementaires` | « Une espèce » saisie avec deux isolats : aucune incohérence signalée. | Dériver ou contrôler `nbEspeces` à partir des isolats. |
| m18 | `src/clinical/rules/indication.ts:99` | R-SEPSIS-FOYER-INCONNU exige `entree !== 'non_choisi'` : un choc septique saisi avant le choix du point d'entrée n'obtient pas la carte « Urgence » (seule l'alerte R-GRAVITE apparaît). Rejoué. C'est un ordre artificiel. | Supprimer cette condition (comme R-GRAVITE, qui accepte `gravite !== 'inconnu'`). |
| m19 | `src/ui/styles.css` (bloc ajouté) | Couleurs codées en dur (`#f6fbf7`, `#fffaf2`) au lieu de variables : à vérifier si un thème sombre existe. | Variables `--ok-clair` / `--attention-clair`. |
| m20 | `npm run build` | Paquet de 604 kB (avertissement Vite). | Charger le registre des sources à la demande (`import()`), ou `manualChunks`. |
| m21 | `src/engine/etat.ts:335` | Champ d'invalidation `ecbu-1.ecbu-1.antibiogramme` pour le germe principal (id du prélèvement répété). | N'ajouter `iso.id` que s'il diffère de `p.id`. |

## Points conformes

- « NT » est exclu de la lecture (`outils.ts` `lireAntibiogramme`). `etat()` renvoie `non_rapporte` par défaut. `statutMeticilline` donne « inconnu » sur contradiction, sans arbitrage (rejoué : SARM « absent » + céfoxitine R → vancomycine + céfazoline proposées, incohérence signalée).
- Aucune double négation dans les libellés (« Absence de BLSE indiquée », « Non mentionné », « Sensible à la méticilline »).
- Sensibilités et phénotypes saisis sous forme de cartes à boutons radio (`GroupeRadio` : un seul arrêt de tabulation, flèches, Début/Fin), regroupées par usage (`fieldset` / `legend`), avec « Sur le compte rendu », une aide courte et « Pourquoi cette question ? ».
- « Ajouter d'autres résultats » toujours disponible, avec le compteur des saisies. Les questions essentielles disparaissent quand elles ne changent plus la conduite (SCN sur 1 série, colonisation).
- Effacement de l'antibiogramme à chaque changement de germe, signalé dans la zone d'invalidations (mais trop large : voir M8). Contexte de l'ECBU effacé quand le type de prélèvement change.
- Isolats multiples : chaque antibiogramme reste rattaché à son isolat (test l. 342), l'alerte « polymicrobien » s'affiche et la couverture est plafonnée.
- La carte « Pas d'antibiothérapie indiquée » est aussi riche qu'une option : justification, exceptions, à faire, surveillance, reconsidérer, sources, badge vert.
- Synthèse complète (indication oui/non/indéterminée, germe, déterminants, inconnues, traitement ou raison, surveillance, sources).
- Sepsis : l'évaluation de l'ECBU traite la gravité d'abord (`ecbu.ts:157`), sans attendre la fin du parcours.
- 375 px : `scrollWidth === 375` sur la saisie et la fiche (cas 14) ; `synthese-dl` passe sur une colonne sous 600 px ; `.etapes` en grille `auto-fit`.

## Tests suggérés

1. **B1** : PNA déclarée + SCN sur 1 série (stable puis sepsis) → les options R-IU-FEBRILE restent présentes ; la conclusion SCN est séparée. PNA + plaie colonisée → idem.
2. **B2 / M4** (interface, Testing Library) : sonde + signes urinaires récents → la question « Un autre foyer… » est visible ; masquer une question remet sa valeur à « inconnu » / `non_recherche` (invalidation affichée).
3. Propriété : pour toute évaluation `informations_insuffisantes`, chaque question correspond à un champ visible ; aucune question demandée n'a déjà une réponse (M3).
4. **M1 / M2** : collecteur + clinique inconnue → `informations_insuffisantes` ; collecteur + grossesse → pas de `ne_pas_traiter` ; sonde + signes urinaires inconnus → pas de `ne_pas_traiter` (selon le choix retenu).
5. **M6** : toute décision `ne_pas_traiter` / `attendre_resultat` → `controles`, `frise` et `reevaluation` ne contiennent rien qui suppose un antibiotique.
6. Retour du stade « Antibiogramme » à « Identification » avec isolats supplémentaires → leurs antibiogrammes sont effacés.
7. **M8** : affiner l'identification (entérobactérie non précisée → E. coli) conserve l'antibiogramme ; changer de famille (E. coli → S. aureus) l'efface.
8. Interface : `AntibiogrammeGuide` (clic et flèches sur S/I/R/NT, compteur « (n saisis) », CMI conservée), ajout et retrait d'un isolat, `CarteIndication` présente pour chaque décision, y compris « traiter » sans option.
9. Régression m1 : ECBU à entérocoque avec fièvre → situation non couverte + avis.

## Suites données (2026-11-05)

Tous les constats bloquants et majeurs sont corrigés et couverts par `src/tests/relectures-v2.test.ts`.

| Constat | Suite |
|---|---|
| B1 | Les indications sont combinées dans `decider.ts` : une décision de traiter, explicite ou portée par une règle qui propose un traitement, l'emporte ; les autres conclusions s'affichent en « Autres conclusions ». La règle d'IU fébrile choisit son germe sans être bloquée par un contaminant possible (`germeUrinaire`). |
| B2 | La question « autre foyer » n'est plus demandée pour des signes urinaires isolés sur sonde (avis, conformément à IUAS R.1) ; sa pertinence est partagée entre moteur et interface (`pertinenceClinique`). |
| M1 | Branche « contamination » : clinique inconnue → informations insuffisantes ; grossesse et geste à risque examinés ; fièvre → ECBU refait maintenant puis conduite habituelle (IUAS R.35). |
| M2, M3, M5 | Signes urinaires inconnus sur sonde demandés ; sexe demandé à la place de la fièvre déjà connue ; conditions construites à partir des réponses. |
| M4 | Réponses cliniques masquées effacées (`REGLES_PERTINENCE`) ; antibiogrammes des isolats supplémentaires effacés avec le stade. |
| M6 | Sans traitement : options, réévaluation, contrôles thérapeutiques et données de dose écartés ; la section C affiche la surveillance de la conclusion. |
| M7 | Le motif de l'ECBU est utilisé (contrôle après traitement, bilan avant geste) ; fièvre et signes urinaires ne sont plus demandés sans ECBU. |
| M8 | Préciser l'identification (non identifié → espèce compatible) conserve l'antibiogramme. |
| M9 | `src/tests/interface-indication.test.tsx` (4 tests). |
| Mineurs | Corrigés : m1, m2, m3, m4 (cache par dossier), m5 (section placée après les prélèvements, sans numéro), m7, m8, m9, m10, m11, m12, m13, m14, m15, m16, m17, m18, m19, m21. Non traités : m6 (liens vers les questions), m20 (taille du paquet). |
