# Relecture 2 — Audit documentaire infectiologique de la base clinique

- **Relecteur** : agent IA (relecteur 2). Ce document n'est **pas** un avis médical et ne vaut pas validation : aucun statut n'a été porté à `validee_humain` ni `publiee`.
- **Date** : 2026-11-05. **Version auditée** : `2026.11.0-brouillon` (branche `feat/premiere-chaine-complete`, commit `fe86353` + modifications non commitées du relecteur 1 sur `src/ui`, `src/engine`, `src/calc`, `src/schedule`, `src/tests`).
- **Périmètre modifié par cet audit** : `src/clinical/**` uniquement, plus le nouveau fichier `src/tests/audit-clinique.test.ts` et les deux rapports de `docs/relectures/`. Aucun commit.
- **Matrice détaillée** : [`matrice-regles.md`](matrice-regles.md) (une ligne par règle `R-…`, par régime, par adaptation rénale, par élément de surveillance et par STP).

---

## 1. Méthode

1. Lecture de `docs/PERIMETRE.md`, `docs/ARBITRAGES.md` et des cinq fiches de vérification du 2026-11-04 (`docs/sources/recherche-*.md`), en retenant pour chaque affirmation son statut d'accès réel (lu / non lisible / introuvable / NON VÉRIFIÉ).
2. Lecture intégrale de `src/clinical/` : `types.ts`, `molecules/*.ts`, `rules/*.ts`, `sources/registre.json`, `etat-base.json`, `version.ts`. Lecture des parties du moteur qui conditionnent l'interprétation des données cliniques (`engine/posologie.ts` : poids, conditions, statut ; `engine/contexte.ts` : allergies ; `schedule/frise.ts` : calendrier des STP) — **sans les modifier**.
3. Confrontation, élément par élément, de chaque valeur (dose, unité, fréquence, voie, perfusion, charge, paliers rénaux, hémodialyse, EER, durée et point de départ, surveillance, STP, contrôles, imagerie, gestes, avis) aux extraits des fiches.
4. **Vérification directe dans la source originale** pour les points douteux (WebFetch, 2026-11-05) — voir §2. Les PDF ont été convertis localement (`pdftotext`) dans le dossier dédié du scratchpad `audit-src`.
5. Correction des valeurs erronées ou mal attribuées ; blocage (`brouillon`) des éléments insuffisamment étayés ; commentaire `// Audit relecteur 2` à chaque modification.
6. Après chaque lot : `npx tsc --noEmit` (OK) et `npx vitest run` (voir §7).

Niveau d'exigence : un élément n'est laissé en `verifiee_ia` que si la valeur affichée figure dans une source lue (fiche du 2026-11-04 avec extrait, ou relecture du 2026-11-05). Une **absence de recommandation** n'est jamais présentée comme une recommandation de ne pas faire.

---

## 2. Sources relues directement pendant l'audit (statut d'accès réel)

| Source | Accès le 2026-11-05 | Ce qui a été vérifié |
|---|---|---|
| Rybak 2020 (ASHP/IDSA), AJHP 77(11):835, texte OUP | **lu** (0-100 000 caractères sur 380 000) | La fréquence « once-weekly / frequent or daily » (Rec. 5) porte sur **les dosages de vancomycine**, pas sur la créatininémie ; charge avant perfusion continue **15-20 mg/kg** ; Css mesurable « any time after steady state » ; pas de moment chiffré pour le 1er dosage en continu. |
| RCP Céfépime Stragen 1 g (BDPM 62202966, RCP 27/09/2024) | **lu** (2 lectures concordantes) | Tableau d'insuffisance rénale complet (voir §4.2). |
| RCP Ertapenem Panpharma 1 g (BDPM 69931556, RCP 31/10/2023) | **lu** | 1 g/24 h en 30 min ; ClCr > 30 mL/min/1,73 m² : pas d'adaptation ; IR sévère et hémodialyse : « ne doit pas être utilisé ». |
| RCP Céfoxitine Panpharma 2 g (BDPM 67355243, RCP 13/06/2022) | **lu** (section 4.2) | 1-2 g/8 h (3-6 g/j) ; tableau IR 50-30 / 29-10 / 9-5 / < 5 ; charge après chaque hémodialyse. Section 4.4 non lue. |
| RCP Céfixime Viatris 200 mg (BDPM 62217516, RCP 03/06/2026) | **lu** (4.2, 4.3) | 400 mg/j en 2 prises ; ClCr > 20 : pas d'adaptation ; ≤ 20 et hémodialyse : ≤ 200 mg/j en 1 prise. |
| SPILF 2015, IU communautaires, texte court (PDF) | **lu** (pdftotext) | Liste complète des facteurs de risque de complication (p. 6) : anomalie de l'arbre urinaire, sexe masculin, grossesse, sujet âgé (> 75 ans ou > 65 ans + ≥ 3 critères de Fried), immunodépression grave, IRC sévère (clairance < 30 mL/min). |
| Recherches BDPM ertapénème/céfoxitine/céfixime (WebSearch) | résultats de moteur | Utilisés uniquement pour localiser les RCP, jamais comme source de valeur. |

Toutes les autres vérifications reposent sur les extraits des fiches du 2026-11-04 ; leur statut (lu, non lisible, NON VÉRIFIÉ) est repris tel quel dans la matrice. Aucun site n'a été contourné ; aucun contenu non lu n'est présenté comme lu.

Incohérence relevée entre fiches : la fiche « bactériémies » indique Rybak 2020 « trouvée mais contenu non lisible », la fiche « pharmacologie » « consultée (texte OUP lu) ». La relecture du 2026-11-05 confirme que le texte OUP est lisible : c'est la fiche pharmacologie qui fait foi.

---

## 3. Synthèse chiffrée

| | Nombre |
|---|---|
| Règles `R-…` auditées | 20 |
| Molécules auditées | 23 |
| Régimes posologiques audités | 40 (dont 1 ajouté) |
| Adaptations rénales auditées | 23 |
| Éléments de surveillance (hors STP) audités | 43 |
| Spécifications STP auditées | 12 (dont 2 ajoutées) + 8 STP bêta-lactamines en réanimation (élément de surveillance) |
| Statuts grossesse audités | 23 |
| **Total d'éléments audités (lignes de matrice)** | **≈ 185** |
| Éléments **corrigés** (valeur, repère, extrait, source ou attribution) | **31** |
| Éléments **bloqués** (passés en `brouillon`) | **7** (+ 2 statuts grossesse rétrogradés en `non_verifie` : imipénème, rifampicine) |
| Éléments **débloqués** après lecture du RCP (`brouillon` → `verifiee_ia`) | 3 (céfoxitine, céfixime, adaptation rénale de l'ertapénème) |
| Tests existants mis en échec par une correction justifiée | 3 (voir §7) |
| Tests d'audit ajoutés | 17 (`src/tests/audit-clinique.test.ts`, tous verts) |

---

## 4. Constats par domaine

### 4.1 Aminosides (amikacine, gentamicine)

**Conformes (ANSM 2011 p. 5-8, tableau 1 ; RCP §4.2-4.4 ; SPILF)** : DUJ en perfusion de 30 min ; amikacine 30 mg/kg en association (SPILF 2015/2026, SPILF/SFPT/CA-SFM 25-30) ; gentamicine 3 mg/kg synergie (ESC 2023, SPILF/AEPEI) et 6-7 mg/kg (SPILF/SFPT/CA-SFM) ; **pic** conseillé après la **1re injection** chez le patient sévère, **30 min après la fin d'une perfusion de 30 min** (`numeroDose: 1`, `offsetHeuresApresFinPerfusion: 0.5`) ; cibles de pic 60-80 (amikacine) et 30-40 mg/L (gentamicine) ; résiduelle < 2,5 / < 0,5 mg/L ; répétition 2 fois/semaine avec fonction rénale ; conduite (pic bas → augmenter l'injection suivante ; résiduelle haute → espacer, pas de réduction de la dose unitaire) ; paliers d'intervalle de la gentamicine (24/36/48 h, dosage impératif < 20) ; injection 2-4 h avant la dialyse (RCP gentamicine, divergence affichée) ; durée ≤ 5 j, réévaluation à 48-72 h ; ≤ 72 h en IUAS (R.39).

**Corrigé** :
1. **Résiduelle en insuffisance rénale (erreur de calendrier, impact sécurité)** : la seule spécification de résiduelle plaçait le 1er dosage « après 48 h de traitement, avant la 3e dose » quelle que soit l'indication. Or l'ANSM réserve « après 48 h » aux traitements > 5 jours ; en insuffisance rénale le RCP impose de ne **pas réinjecter tant que la résiduelle dépasse le seuil** (gentamicine : « < 20 mL/min : dosage impératif de la résiduelle »). Ajout de `amikacine-residuelle-ir` et `gentamicine-residuelle-ir` : 1er dosage **avant la 2e injection**, puis avant chaque réinjection, cible inchangée. La spécification « > 5 jours » est conservée (identifiant inchangé, compatible avec les tests existants).
2. **Cible de pic de la gentamicine** : la mention « pour la dose de 6-8 mg/kg » n'est pas dans l'ANSM ; retirée. Remplacée par : aucune cible sourcée pour la dose synergique de 3 mg/kg de l'endocardite → interprétation pharmacologique.
3. **Indication du pic** : `conditionTexte` réaligné sur la liste ANSM (choc septique, réanimation ventilée, brûlé, neutropénie fébrile, obésité morbide, polytraumatisé) ; l'extension du moteur au sepsis, à l'IRA et à l'EER est désormais signalée comme un ajout de l'application.
4. **Amikacine 30 mg/kg** : la remarque signale désormais le plafond du RCP (**1,5 g/j**) que la dose SPILF dépasse dès 50 kg (hors RCP, dose SPILF retenue).
5. **Poids en cas d'obésité** : RCP gentamicine = poids idéal **Lorentz + 0,43 × surcharge** ; RCP amikacine = poids idéal + 40 % de l'excédent (formule du poids idéal non précisée). Le moteur applique Devine + 0,4 × excès pour tous les aminosides : écart documenté dans les remarques et signalé au relecteur 1 (§8).
6. **Gentamicine de l'endocardite probabiliste** : SPILF/AEPEI (diapo 6) indique **5 mg/kg/j** « uniquement chez les patients en sepsis » ; la règle affichait 3 mg/kg. Nouveau régime `gentamicine-5-ei-proba` utilisé par `R-ENDOCARDITE` (l'ESC 2023 indique 3 mg/kg : divergence affichée).

**Non résolu / à valider** : pas de schéma d'aminoside en hémodialyse pour l'amikacine (RCP muet) ; hémodialyse de la gentamicine « 2-4 h avant la séance » (RCP) en contradiction avec l'usage « après séance » ; fréquence de la créatininémie non chiffrée par les sources ; position exacte de la résiduelle (« juste avant la dose ») tirée d'Abdul-Aziz 2020, pas de l'ANSM.

### 4.2 Bêta-lactamines

**Corrigé** :
1. **Céfépime, tableau d'insuffisance rénale (valeurs fausses)** : l'application indiquait pour 2 g × 3/j « → 2 g × 2 (30-50) » et « → 2 g × 1 (11-29) ». Le RCP (relu deux fois le 2026-11-05) indique **2 g × 3 → 1 g × 3 (50-30), 1 g × 2 (29-11), 1 g × 1 (≤ 10)** ; 2 g × 2 → 2 g × 1, 1 g × 1, 500 mg × 1 ; 1 g × 2 → 1 g × 1, 500 mg × 1, 250 mg × 1. Les trois paliers ont été réécrits avec l'extrait exact.
2. **Ceftriaxone et catégorie I** : 2 g/24 h est la posologie **standard** (EUCAST « 2 g × 1 » ; SPILF/SFPT/CA-SFM « 1 à 2 g/24 h ») ; la forte posologie est **2 g/12 h** (SPILF/SFPT/CA-SFM p. 165 ; EUCAST 2 g × 2 ou 4 g × 1). Le libellé « souche I » a été retiré du régime 2 g/24 h et ajouté au régime 2 g/12 h ; la règle documentée BGN utilise désormais 2 g/12 h pour une souche I.
3. **Pipéracilline-tazobactam rendue I (BLSE urinaire)** : le schéma standard était utilisé ; remplacé par la forte posologie (4 g/6 h en 3 h).
4. **Céfoxitine** (RCP lu) : posologie 1-2 g/8 h confirmée, tableau IR et hémodialyse renseignés ; molécule et régime passés de `brouillon` à `verifiee_ia` ; registre `RCP-cefoxitine` → `consultee`. Modalités de perfusion et section 4.4 non lues (signalé) ; grossesse non vérifiée.
5. **Céfixime** (RCP lu) : adaptation rénale renseignée (> 20 : inchangé ; ≤ 20 et HD : ≤ 200 mg/j en 1 prise) ; passage à `verifiee_ia` ; registre `RCP-cefixime` → `consultee`.
6. **Ertapénème** (RCP lu) : adaptation rénale `brouillon` vide → **« ne pas utiliser » si ClCr ≤ 30 mL/min/1,73 m² ou hémodialyse** (information de sécurité qui manquait) ; nouvelle source `RCP-ertapeneme`.
7. **Extraits « encéphalopathie »** : un extrait unique (« Les bêtalactamines exposent au risque d'encéphalopathie… ») était attribué à tous les RCP ; il n'est textuel que pour céfotaxime, céfépime et cloxacilline. Extraits propres à chaque RCP (céfazoline, méropénème, imipénème verbatim ; ceftriaxone, pipéracilline-tazobactam, témocilline marqués « résumé, non verbatim »).
8. **Céfazoline / ESC 2023 note e** : la paraphrase inversait le sens ; remplacée par la citation exacte (« Cefazolin can replace cloxacillin only in patients with non-immediate-type hypersensitivity reactions to penicillin ») et la divergence avec SPILF 2026 ; le rang 1 de la céfazoline est indiqué comme choix de l'application (les sources citent céfazoline **ou** cloxacilline à égalité).
9. **Chaînes latérales** : les libellés affirmaient des identités de chaîne (ex. ceftazidime/céfixime « aminothiazole-méthoxyimino », amoxicilline « identique » à céfadroxil/céfalexine) que **aucune source lue** ne documente (tableaux SPILF/JNI en image). Libellés rendus prudents et marqués « non vérifié ».
10. **Imipénème, grossesse** : « utilisable » reposait sur un résultat de recherche CRAT rattaché à la fiche pénicillines → `non_verifie`.

**Conformes** : posologies et paliers RCP de céfotaxime, ceftriaxone, cloxacilline, céfazoline, amoxicilline, amoxicilline-clavulanate, pipéracilline-tazobactam, témocilline, méropénème, imipénème, aztréonam ; STP des bêta-lactamines en soins critiques (SFPT/SFAR 2018 R4.1-R4.4, 24-48 h, résiduelle/plateau, 4-8 × CMI).

### 4.3 Vancomycine

**Conforme** : stratégie selon le mode d'administration — **plateau 20-25 mg/L** en perfusion continue (SPILF/SFPT/CA-SFM, Rybak Rec. 10, Abdul-Aziz), **résiduelle 15-20 mg/L ± ASC 400-600** en discontinu (avec la position de Rybak : creux seul « no longer recommended »), **pré-dialyse 15-20 mg/L** au moins hebdomadaire, jamais pendant ni < 2 h après la séance (Rybak Rec. 14) ; **aucun « pic »** ; mise en garde « 20-30 mg/L = téicoplanine » ; EER continue (Rybak Rec. 16) ; paliers RCP.

**Corrigé** :
1. **Créatininémie (attribution erronée)** : « hebdomadaire si stable, quotidienne si instable : Rybak 2020 » était appliqué à la créatinine ; la relecture du texte confirme que cette fréquence concerne les **dosages de vancomycine**. Texte remplacé par « périodiquement (RCP), fréquence non chiffrée » ; extrait Rybak remplacé par sa définition de la néphrotoxicité.
2. **Résiduelle discontinue, calendrier** : `numeroDose: 4` supposait un intervalle de 24 h (le calendrier la plaçait à H72) alors que le RCP dit « le deuxième jour de traitement, immédiatement avant la dose suivante » ; numéro de dose retiré, repère J2 conservé.
3. **Dose de charge** : la remarque attribuait « 20-35 mg/kg » à Rybak pour la perfusion continue ; Rybak indique 15-20 mg/kg avant perfusion continue (20-35 en discontinu). Ajout de la divergence de vitesse (RCP ≤ 10 mg/min vs charge « en 1 à 2 h » SPILF).
4. Répétition des dosages reformulée selon Rybak Rec. 5 (« based on clinical judgment » ; « ou néphrotoxiques associés » n'était pas dans la source).

**Non résolu** : moment du 1er dosage en perfusion continue (non fixé par les sources ; J2 = choix de l'application) ; cible ESC 2023 (résiduelle 10-15, voire 15-20) vs SPILF/AEPEI (plateau 20-25).

### 4.4 Daptomycine, rifampicine, fluoroquinolones, cotrimoxazole

Conformes pour l'essentiel (RCP ; ESC 2023 ; SPILF/AEPEI ; Abdul-Aziz). Corrigé : rifampicine grossesse « utilisable » sans source lue → `non_verifie` ; ciprofloxacine : paliers IV seuls lus, désormais indiqué (forme orale non vérifiée) ; lévofloxacine : paliers valables pour le schéma 500 mg/24 h, valeurs du schéma 500 mg/12 h ajoutées avec confiance moyenne. Divergence maintenue : daptomycine 10 (ESC) vs 12 mg/kg (SPILF/AEPEI), hors AMM.

### 4.5 Hémocultures de contrôle (par germe)

| Germe | Application | Source | Verdict |
|---|---|---|---|
| *S. aureus* | ≥ 2 séries **48 h après le prélèvement de la 1re hémoculture positive**, puis 1-2 séries toutes les 24-48 h jusqu'à négativation ; jour de clairance = J0 de la durée (ou retrait du foyer si postérieur) | IDSA/ESCMID 2026 CS2 (lu) | conforme |
| BGN | non systématiques ; si fièvre persistante/évolution défavorable ; persistance > 3 j = bactériémie persistante | aucune recommandation ne les exige (SRLF 2020 R3.2 ; SPILF 2015 : la bactériémie ne modifie ni choix ni durée) | conforme ; **sources de `ctl-iu-hc-controle` corrigées** (l'extrait EAU portait sur les hémocultures initiales) |
| Streptocoques / entérocoques hors EI | non systématiques ; ETO si persistance à entérocoque | SRLF 2020 R3.3a | conforme (absence de recommandation explicitée) |
| Endocardite | ≥ 3 séries avant traitement ; contrôle à J3 puis jusqu'à stérilisation (J3 conditionne 4 vs 6 sem.) | ESC 2023 5.3.1 ; SPILF/AEPEI diapo 14 | conforme |
| SCN | 1 série : refaire hémocultures périphériques ± sur cathéter avant tout traitement ; ≥ 2 séries même espèce/même antibiogramme = vraie bactériémie probable ; verrou : J4, J11, avant réutilisation | IDSA 2009 rec. 38 ; SRLF/SPILF 2019 ; SPILF verrou 2021 | conforme ; critères chiffrés (délai de positivité, nombre de flacons) **non sourcés** et non utilisés |

### 4.6 *S. epidermidis* (contaminant vs bactériémie vraie)

Conforme : un SCN n'est ni automatiquement contaminant ni automatiquement traité ; nombre de séries **bloquant** s'il est inconnu ; 1 série → contrôle avant antibiotique ; matériel endovasculaire → avis avant de conclure ; molécule en `brouillon` (aucune recommandation dédiée). Limites : le moteur ne compare pas les antibiogrammes des séries (« même antibiogramme » est demandé dans le texte) ; *S. lugdunensis* est traité comme bactériémie vraie dès 1 série — **choix non sourcé**, désormais signalé dans l'alerte (la source SPILF/GPIP 2021 ne vise que la durée de 14 j). Durée après retrait du cathéter : 3 j (SPILF 2021) / 5-7 j (IDSA 2009) / 7 j (SRLF 2020), divergence affichée.

### 4.7 Catégorie EUCAST I

La définition (EUCAST « susceptible, increased exposure » ; CA-SFM « sensible à forte posologie ») et la règle « ne pas assimiler I à R » sont conformes. **Défaut corrigé** : plusieurs options « I » utilisaient la posologie **standard** — ceftriaxone 2 g/24 h, pipéracilline-tazobactam 4 g/8 h, relais ciprofloxacine 500 mg × 2 et cotrimoxazole 800/160 × 2. Désormais : ceftriaxone 2 g/12 h, pipéracilline-tazobactam 4 g/6 h en 3 h ; relais oraux standard réservés aux souches **S**, alerte de forte posologie (ciprofloxacine 750 mg × 2 ; cotrimoxazole 320/1600 × 2 ; SPILF/SFPT/CA-SFM p. 168, 172) pour les souches I. *P. aeruginosa* : l'option « ciprofloxacine 500 mg × 2 » est retirée (forte posologie uniquement ; régime oral absent de la base) et remplacée par une alerte.

### 4.8 Allergies

Base clinique (`R-ALLERGIE-BETALACTAMINES`, extraits SPILF 2026 et JNI 2024) conforme : réaction immédiate grave → contre-indication aux bêta-lactamines et avis allergologique (SPILF 2026) ; réaction retardée sévère (SJS/Lyell, DRESS, PEAG…) → contre-indication de toute la classe (JNI 2024, d'après Wijnakker 2023) ; aztréonam utilisable sauf allergie à la ceftazidime/céfidérocol. **Taux de réactivité croisée et chaînes latérales : NON VÉRIFIÉS** (tableaux en image) — libellés de chaînes corrigés en conséquence (§4.2).

Écarts relevant du moteur (`engine/contexte.ts`, non modifié, transmis au relecteur 1) : (a) le **délai** de la réaction (≤ 5 ans / > 5 ans), critère central de la stratification SPILF 2026, n'est pas exploité ; (b) une réaction **retardée non grave récente** (≤ 5 ans) à une pénicilline n'exclut que la molécule en cause, alors que SPILF 2026 la classe « haut risque » (alternatives = céphalosporine à chaîne différente, monobactam, carbapénème) ; (c) la céfazoline reste proposée « sous réserve » après réaction **immédiate** non grave à une pénicilline : conforme à SPILF 2026, contraire à la note e de l'ESC 2023 (divergence documentée sur la fiche céfazoline).

### 4.9 Durées et points de départ

Conformes : *S. aureus* 14 j à compter de la clairance (CS6/CS7, retrait du foyer si postérieur) ; endocardite à compter du 1er jour de traitement efficace / 1re hémoculture négative, nouveau traitement complet seulement si culture de valve positive (ESC 7.1) ; 4 sem. si hémocultures négatives à J3 et apyrexie, 6 sinon (SPILF/AEPEI) ; ILC à compter de l'ablation et de la 1re hémoculture négative (SPILF 2021) ; IU (SPILF 2015/2018, 2026, IUAS 2015) ; BGN 7 j (SPILF/GPIP 2021, SRLF 2020). « Premier jour de traitement efficace » pour BGN/streptocoques : **point de départ non précisé par la source** (déjà signalé dans le texte). IU masculine : `dureePrevueJours = 14` (prostatite) alors que la PNA masculine relève de 7 j : la forme clinique n'est pas demandée — à traiter (§8).

### 4.10 Divergences ESC 2023 vs SPILF/AEPEI 2025

Toutes les divergences de la fiche (§7 bactériémies) sont visibles dans l'application ; arbitrage conforme à `ARBITRAGES.md`. Corrigé : gentamicine probabiliste 5 mg/kg (§4.1). **Bloqué** : `ei-staph` pour le **SARM** — la daptomycine y était proposée **seule** en 1re ligne, alors que SPILF/AEPEI l'associe à la ceftaroline ou à la fosfomycine et que l'ESC la cite en association (IIb C) ; les partenaires ne sont pas dans la base → `brouillon`, la vancomycine (ESC I B) reste l'alternative vérifiée.

### 4.11 BGN sans foyer, probabiliste

`R-BACTERIEMIE-BGN` : les quatre options probabilistes sont déjà en `brouillon` avec le commentaire d'arbitrage (aucune recommandation dédiée, extrapolation des IU graves) — **conforme**, à maintenir en brouillon. La partie documentée (`documenterBGN`) reste `verifiee_ia` après les corrections I/forte posologie et *P. aeruginosa*.

### 4.12 Infections urinaires

Corrigé : (1) **facteurs de risque de complication** : seul l'âge > 75 ans était pris en compte ; ajout de l'immunodépression, de la grossesse et de l'IRC sévère (clairance < 30 mL/min hors IRA), et d'une donnée manquante pour l'anomalie urologique et la fragilité (SPILF 2015 p. 6, relue) — conséquence : uroscanner sous 24 h et durée « à risque » ; (2) **IUAS avec antécédent de BLSE < 6 mois et sepsis** : la règle proposait pipéracilline-tazobactam + amikacine ; IUAS R.47 prévoit **imipénème/méropénème + amikacine** ; (3) **allergie à toutes les bêta-lactamines** : chez l'homme, SPILF 2026 place la fluoroquinolone en 1re intention et ne cite pas l'aztréonam → FQ en 1re ligne ; en IUAS, R.45 cite les aminosides → l'aztréonam y passe en `brouillon`. **Bloqué** : l'**homme immunodéprimé** (exclu de SPILF 2026, chapitre masculin SPILF 2015 remplacé) → toutes les options de la règle en `brouillon` avec alerte.

---

## 5. Règles et éléments bloqués (passés en `brouillon`) et pourquoi

| Élément | Raison |
|---|---|
| `R-BACTERIEMIE-STREPTOCOQUE` / options `strepto-amox`, `strepto-c3g` | Aucune recommandation lue sur le choix de la molécule dans la bactériémie à streptocoque hors endocardite ; amoxicilline extrapolée (règle de lecture CA-SFM, ESC 2023 T7 = endocardite). La durée (7 j) reste sourcée. |
| `R-BACTERIEMIE-ENTEROCOQUE` / option `entero-vanco-allergie` | IDSA 2009 rec. 91 cite la vancomycine en cas de **résistance**, pas d'allergie. |
| `R-ENDOCARDITE` / option `ei-staph` si SARM | Daptomycine en monothérapie ; les sources ne la recommandent qu'en association (partenaires absents de la base). |
| `R-IU-FEBRILE`, homme immunodéprimé (toutes les options) | Hors périmètre de SPILF 2026 ; aucun texte masculin en vigueur pour ce terrain. |
| `R-IU-FEBRILE`, IUAS, option `proba-iu-allergie` (aztréonam) | IUAS 2015 R.45 recommande les aminosides en cas d'allergie ; aztréonam extrapolé de SPILF 2015. |
| Grossesse : imipénème, rifampicine | « Utilisable » sans fiche CRAT lue → `non_verifie`. |

Déjà en brouillon et maintenus : probabiliste BGN sans foyer ; *S. aureus* avant la sensibilité à la méticilline ; SCN (molécule) ; IOA sur matériel (source SPILF 2026 au statut incertain) ; CGP en chaînettes en attente d'identification.

---

## 6. Divergences non résolues (à arbitrer par un médecin)

1. Gentamicine dans l'endocardite à staphylocoque sur prothèse : 2 semaines (ESC) vs jusqu'à stérilisation des hémocultures (SPILF/AEPEI).
2. Gentamicine empirique de l'endocardite : 3 mg/kg (ESC) vs 5 mg/kg si sepsis (SPILF/AEPEI, retenu).
3. Daptomycine 10 (ESC) vs 12 mg/kg (SPILF/AEPEI), hors AMM ; RCP 4-6.
4. Vancomycine : cible ESC (résiduelle 10-15/15-20) vs SPILF/AEPEI (plateau 20-25) ; « oublier la vancomycine » pour le SARM (SPILF/AEPEI) vs vancomycine I B (ESC).
5. Céfazoline après réaction immédiate non grave à une pénicilline : SPILF 2026 (possible) vs ESC 2023 note e (non).
6. Gentamicine et hémodialyse : 2-4 h avant la séance (RCP) vs « après séance ».
7. Amikacine 30 mg/kg (SPILF) vs plafond 1,5 g/j (RCP).
8. SCN après retrait du cathéter : 3 / 5-7 / 7 jours.
9. Changement de sonde urinaire : 24 h après le début (IUAS) vs avant le début (EAU 2026).
10. PNA simple de la femme : FQ en 1re intention (HAS 2021, SPILF 2018) vs C3G en 1re ligne dans l'application (cadre hospitalier, SPILF 2015 « privilégier les C3G en cas d'hospitalisation ») — à confirmer.
11. Facteurs de risque de BLSE : SPILF 2015 (6 mois, hospitalisation 3 mois) vs SPILF 2026 (3 mois) ; le moteur n'en applique qu'une définition.
12. Poids ajusté des aminosides : Lorentz + 0,43 (RCP gentamicine) / idéal + 40 % (RCP amikacine) vs Devine + 0,4 (moteur).

---

## 7. Tests

- `npx tsc --noEmit` : **OK**.
- `npx vitest run` : **3 échecs, tous dus à des corrections cliniques justifiées** (les fichiers de test existants n'ont pas été modifiés) ; les 17 tests d'audit passent, ainsi que tous les autres.

| Test en échec | Raison | Correction attendue du test |
|---|---|---|
| `acceptation.test.ts` › Catégorie EUCAST I › « C3G rendue I : forte posologie retenue… » | 2 g/24 h est la posologie **standard** de la ceftriaxone (EUCAST, SPILF/SFPT/CA-SFM) ; la forte posologie est 2 g/12 h (p. 165) | `expect(o.prescriptions[0].regimenId).toBe('ceftriaxone-2g12h')` |
| `acceptation.test.ts` › Sources… › « sources remplacées ou non lisibles… » | Le RCP céfoxitine a été lu le 2026-11-05 (BDPM 67355243) | remplacer l'assertion `RCP-cefoxitine … 'introuvable'` par une source réellement non lisible, p. ex. `expect(SOURCES_PAR_ID['HAS-2023-SAD-antibiotherapie'].statutAcces).toBe('contenu_non_lisible')` |
| `base.test.ts` › « les molécules dont le RCP n'a pas été consulté restent en brouillon » | RCP céfoxitine et céfixime lus ; posologie et adaptation rénale vérifiées | tester l'invariant plutôt que la liste : toute molécule dont une source `rcp` est `introuvable` est en brouillon ; ou attendre `verifiee_ia` pour `cefoxitine` et `cefixime` |

---

## 8. Points à faire valider par un médecin humain / à traiter par le relecteur 1

**Validation médicale (prioritaire)** : toutes les corrections du §4 ; les blocages du §5 ; les divergences du §6 ; le seuil d'obésité 1,25 et la dose de charge médiane de vancomycine (25 mg/kg) qui sont des choix de l'application ; l'extension du pic d'aminoside au sepsis, à l'IRA et à l'EER ; le traitement de *S. lugdunensis* comme bactériémie vraie dès 1 série ; le classement céfazoline > cloxacilline.

**Moteur, calendrier et interface (hors périmètre de cet audit, signalés au relecteur 1)** :
1. `calc/renal.ts` / `engine/posologie.ts` : poids idéal Devine + 0,4 pour tous les aminosides ; le RCP gentamicine impose Lorentz + 0,43.
2. `schedule/frise.ts` : l'ancre `dose` calcule `(numeroDose − 1) × 24 h` ; faux pour les intervalles ≠ 24 h et pour la réinjection d'aminoside espacée en IR (le texte reste correct).
3. `engine/contexte.ts` (allergies) : prise en compte du délai ≤ 5 / > 5 ans ; réaction retardée non grave récente à une pénicilline (SPILF 2026 : haut risque).
4. `evaluerCondition('insuffisance_renale')` : seuil unique < 60 mL/min, alors que les RCP utilisent < 50 (amikacine), < 30 (cloxacilline, daptomycine)… ; `amoxicilline-cristallurie` ne peut pas être conditionnée à la forte posologie.
5. IU masculine : demander la forme (PNA / prostatite / épididymite) pour la durée (7 / 14 / 10 j) au lieu de 14 j par défaut.
6. Comparaison des antibiogrammes entre séries pour les SCN.
7. `docs/PERIMETRE.md` et `docs/ARBITRAGES.md` (hors de mon périmètre d'écriture) à mettre à jour : céfoxitine, céfixime, ertapénème désormais vérifiés (RCP lus) ; streptocoques hors endocardite : molécule en brouillon ; gentamicine 5 mg/kg dans l'endocardite probabiliste ; fréquence de la créatininémie sous vancomycine non chiffrée (confirmé).

---

## 9. Limites de l'audit

- Audit réalisé par un agent IA : il ne remplace ni la relecture d'un infectiologue, ni celle d'un pharmacologue.
- La majorité des vérifications repose sur les extraits des fiches du 2026-11-04 ; seuls les points listés au §2 ont été relus dans la source originale. Les textes non lisibles restent non lisibles : ESCMID 2022 et 2026 (texte intégral), SPILF 2026 IU masculines (article), SPILF/AEPEI (article), HAS 2025 sepsis (PDF), SFPT/SFAR 2018 (PDF français), tableaux de chaînes latérales SPILF/JNI (images), tableau IR du RCP amikacine (image).
- Les lectures WebFetch passent par un modèle de résumé : les tableaux RCP céfépime ont été lus deux fois avec des requêtes différentes et concordent ; une erreur de transcription reste possible et doit être levée par lecture humaine du RCP.
- Les règles ont été auditées sur leur contenu clinique et sur les cas fictifs ; l'exhaustivité des chemins logiques du moteur n'a pas été testée.
- Les fiches CRAT non lues (céfoxitine, témocilline, méropénème, aztréonam, daptomycine, rifampicine, imipénème) laissent ces statuts grossesse en `non_verifie`.
