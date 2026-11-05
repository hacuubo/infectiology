# Relecture 2 (v3) — Audit documentaire : fonction rénale calculée et explication des absences de proposition

- **Relecteur** : agent IA d'audit documentaire (relecteur 2). Je ne suis **pas** médecin : ce rapport n'est pas un avis médical et ne vaut pas validation humaine. Aucun statut ne doit passer à `validee_humain` sur la foi de ce rapport.
- **Date** : 2026-11-05. **Branche** : `feat/fonction-renale-explications`, commit `854db9e` (« Fonction rénale calculée et explication de toute absence de proposition (avant relecture) »). **Diff audité** : `git diff 9fa598d..854db9e`.
- **Fichiers modifiés par l'audit** : ce rapport seulement. Aucun fichier source ni test n'a été modifié.
- Les numéros de ligne renvoient à l'état du commit `854db9e` (lu par `git show 854db9e:<fichier>`). Pendant l'audit, des modifications **non commitées** sont apparues dans `src/calc/renal.ts` et `src/engine/posologie.ts` (copie de travail). Elles **n'ont pas été auditées**.
- Verdicts : **conforme** / **à corriger** (attribution, condition, extrait ou affichage à reprendre ; pas de danger immédiat) / **à bloquer** (ne pas utiliser avant correction) / **non vérifiable** (source primaire non lue par moi).

---

## 1. Résumé

Les **formules sont justes**. J'ai vérifié chaque coefficient dans une source lue ce jour : CKD-EPI 2009 sans race, CKD-EPI 2021, EKFC (Q 80/62 µmol/L, âge > 25 ans), Cockcroft-Gault (× 0,85), conversion 88,4, Du Bois et désindexation. J'ai aussi recalculé trois exemples de référence à la main (CKD-EPI 2009 : 70,09 ; CKD-EPI 2021 : 73,67 ; EKFC : 70,51). Le choix par défaut (CKD-EPI 2009 sans coefficient racial) correspond mot pour mot à la position EFLM, et l'application ne contient **aucune correction ethnique**. Les grandeurs et unités des 9 RCP relus sont correctement transcrites. La phrase imposée pour les situations non couvertes est **exacte au caractère près**, et l'urgence préfixe chaque motif par « Ne pas attendre ».

Les défauts tiennent à des **attributions trop larges**, à des **extraits reformulés présentés comme des citations** et à des **divergences non affichées**. Les principaux :

1. **HAS guide MRC p. 23-24 invoqué pour l'IRA et l'instabilité.** Le passage vise un « médicament à index thérapeutique étroit » ou des situations où « la mesure de créatinine n'est pas fiable ». L'IRA n'y est pas nommée (renal.ts:34, ARBITRAGES l. 24, recherche §0.5 et §9). Le registre, lui, résume correctement ce passage.
2. **Substitution de Cockcroft-Gault par le DFG désindexé : branche inatteignable** (renal.ts:522-531, et 550). Le DFG désindexé exige le poids **et** la taille. Quand il est calculable, Cockcroft-Gault l'est donc toujours. Le comportement réel est un **refus**, plus prudent que ce que décrivent ARBITRAGES l. 22 et le message affiché. Il faut aligner la documentation sur le code.
3. **Vancomycine** : le RCP ne nomme pas Cockcroft-Gault. Il appelle le résultat « débit de filtration glomérulaire estimé (eGFR) », avec une formule de structure Cockcroft-Gault. Le libellé « la référence cite la formule de Cockcroft-Gault » est donc à nuancer.
4. **Ertapénème et ciprofloxacine** : leurs RCP parlent de « clairance de la créatinine » en mL/min/1,73 m². L'application utilise le DFG CKD-EPI indexé : l'unité concorde, mais la grandeur diffère. Ce n'est pas affiché.
5. **EKFC choisi** : l'extrait HAS « formule CKD-EPI » reste attaché à l'estimation (renal.ts:336), sans que la divergence avec la HAS soit signalée.
6. **Registre** : titres faux pour EFLM et Stehlé 2023, URL Cockcroft-Gault en 404, note KDIGO-AKI 2012 sortie de son contexte, page EMA erronée (p. 4 et non p. 3).
7. **Seuils non sourcés et non déclarés comme choix** : IMC < 18,5 (alors que le texte affiché dit « < 18 »), âge ≥ 75 ans, écart de 15 % avec le laboratoire, « réévaluer la fonction rénale chaque jour », poids idéal de Devine.
8. **Sorties** : le motif « non validée » (point non résolu, rang 45) ne porte pas la phrase « Cela ne signifie pas qu'aucun traitement n'est indiqué ». « Rien de plus à ce stade. » peut être lu comme une impasse.

**Aucun élément à bloquer.** Aucune erreur de formule, d'unité ou de grandeur ne conduit à appliquer une valeur indexée à des paliers en mL/min, ni l'inverse. Les défauts relevés n'exposent pas à une dose fausse sans avertissement.

Bilan : **89 éléments audités** (§3). 54 conformes, 33 à corriger (un élément « conforme sur le fond mais à corriger » compte dans « à corriger »), 0 à bloquer, 2 non vérifiables (M10, X2). Certaines parties d'éléments conformes restent non vérifiables (§5).

---

## 2. Sources primaires relues ce jour (2026-11-05)

WebFetch, puis extraction locale du PDF (`pdftotext -enc UTF-8`) dans le scratchpad, et recherche plein texte.

| Source | Accès | Points vérifiés |
|---|---|---|
| HAS, guide parcours MRC (guide__mrc.pdf, 91 p., « juillet 2021 mise à jour septembre 2023 ») | **lu** | p. 11 et 12 (CKD-EPI sans version) ; p. 23 § 4.2.1.2 (Cockcroft-Gault, CKD-EPI, désindexation) ; p. 23-24 (milieu spécialisé : **conditions exactes**) ; annexe 12 (aucun antibiotique) ; réf. 20 = EMA ; aucun seuil d'IMC lié aux équations |
| HAS, fiche « 7 messages clés » (fiche__mrc.pdf, sept. 2023) | **lu** | message 4 ; note 3 (Du Bois, poids réel) ; note 4 (« Ne plus utiliser la formule de Cockcroft-Gault ») |
| KDIGO 2024 CKD (PDF complet) | **lu** | PP 1.2.4.1 (S186), 1.2.4.2 (S188) ; Table 8 (S179), Table 10 (S181), Table 14 (S189) ; PP 4.2.2-4.2.5 (S249) ; grossesse (**S250**) ; facteur de conversion 88,4 |
| KDIGO 2012 AKI (PDF) | **lu** | rec. 3.8.3, 3.8.4 ; phrase « in stable patients, an eGFR should be used » (chapitre sur l'IRA aux produits de contraste) |
| EFLM, Delanaye et al., CCLM 2023;61:44-47 | **lu** | titre exact, résumé, EKFC |
| Stehlé et al., Nephrol Ther 2023;19:1-10 | **lu** | titre exact, tableau 1 (EKFC, Q, âge > 40, âges 2-25 ans), « diviser par 88,4 » |
| Du Bois 1916 (scan Zenodo) | **lu** (OCR) | « A = W0·425 […] 0·725 X 71.84 », « 1.55 square meters » |
| FDA 2024 (guidance, « March 2024 ») | **lu** | § IV.A « Determination of Renal Function » p. 5-7 (mL/minute p. 6 ; IBW/ABW p. 6 ; eGFR préféré p. 7) ; § V.C p. 14-15 |
| EMA/CHMP/83874/2014 | **lu** | adoption 17/12/2015, entrée en vigueur 01/07/2016 ; « absolute GFR » **p. 4/15** (§ 2) et p. 12/15 (§ 6.2.4) ; p. 7, 8 et 14 conformes à la note de recherche |
| NKF, formule CKD-EPI 2021 | **lu** | coefficients |
| MSD Manuals, calculateur CKD-EPI 2009 | **lu** | coefficients 2009 (source secondaire) |
| Cockcroft-Gault 1976, résumé (notice HERO/EPA) | **lu** | « (15% less in females) » ; formule non reproduite sur la notice |
| RCP BDPM : vancomycine Viatris, céfépime Stragen, amoxicilline Panpharma, ertapénème Panpharma, Ciflox IV, gentamicine Panpharma, méropénème Kalceks, Tazocilline, Bactrim IV | **lus** (§ 4.2) | grandeur, unité, formule citée, dates des RCP |
| Levey 2009 (PMC2763564) | **non lu** (page de vérification reCAPTCHA) | — |
| Inker 2021 (PMC8822996) | non relu | — |
| karger.com/nef/article/16/1/31/ (URL du registre) | **404** | — |

---

## 3. Tableau d'audit élément par élément

### 3.1 Équations et calculs (`src/calc/renal.ts`)

| # | Affirmation dans l'application | Source et passage lu | Verdict | Correction |
|---|---|---|---|---|
| F1 | Défaut CKD-EPI 2009 sans coefficient racial (renal.ts:132 ; FormulaireDossier.tsx:99-100) | EFLM, résumé : « The EFLM recommends not to implement the race-free […] (CKD-EPI) equation in European laboratories and to keep the 2009 version of the CKD-EPI equation, without applying a race correction factor. » KDIGO PP 1.2.4.2 : « Use of race in the computation of eGFR should be avoided. » HAS p. 11 : « en utilisant l'équation […] (CKD-EPI) », sans version. | **conforme** | Garder la mention « décision à confirmer par l'équipe médicale » (ARBITRAGES l. 21). |
| F2 | CKD-EPI 2009 : 141 ; κ 0,7/0,9 ; α −0,329/−0,411 ; −1,209 ; 0,993^âge ; × 1,018 F ; 1,159 jamais appliqué (renal.ts:104-116) | MSD (Levey 2009) : « GFR = 141 * min(Serum_creatinine/kappa, 1)alpha * max(Serum_creatinine/kappa, 1) -1.209 * 0.993Age * Sex * Race » ; « Female: Sex = 1.018; alpha = -0.329; kappa = 0.7 ». Calcul H, 50 ans, 1,2 mg/dL : 70,09 (égal au calculateur). | **conforme** (source secondaire ; primaire non lue, voir X2) | — |
| F3 | CKD-EPI 2021 : 142 ; α −0,241/−0,302 ; −1,200 ; 0,9938^âge ; × 1,012 F (renal.ts:89-102) | NKF : « 142* min(standardized Scr/K, 1)α * max(standardized Scr/K, 1)-1.200 * 0.9938Age * 1.012 [if female] » ; « α = -0.241 (females) or -0.302 (males) ». Calcul : 73,67. | **conforme** | — |
| F4 | EKFC : 107,3 × (Scr/Q)^−0,322 si < 1, sinon ^−1,132 ; × 0,990^(âge − 40) si > 40 ; Q 80/62 µmol/L, calcul en µmol/L (renal.ts:118-129) | Stehlé, tableau 1 : « si SCr/Q < 1 : 107,3 × (SCr/Q)-0,322 × 0,990(âge - 40) si SCr/Q ≥ 1 : 107,3 × (SCr/Q)-1,132 × 0,990(âge - 40) », sous « Âge > 40 ans » ; « Sexe masculin : Q = 80 μmol/L (0,90 mg/dL) ». Calcul H, 50 ans, 1,2 mg/dL : 70,51 (égal au calculateur EKFC). | **conforme** (article princeps Pottel 2021 non lu) | — |
| F5 | EKFC refusé si âge ≤ 25 ans (renal.ts:125, 338) | Stehlé : « Valeurs de Q pour les âges de 2 à 25 ans » (Q variable) ; « Valeurs de Q pour les âges > 25 ans » (Q fixe). | **conforme** | — |
| F6 | 1 mg/dL = 88,4 µmol/L (renal.ts:44) | KDIGO 2024, « Conversion factors » : Creatinine, mg/dl, facteur 88.4. Stehlé : « si créatinine en µmol/L, diviser par 88,4 ». | **conforme** | — |
| F7 | Du Bois : 0,007184 × poids^0,425 × taille^0,725 (renal.ts:139-142) | HAS fiche, note 3 : « SC (m²) = 0,007184 x taille (cm)0,725 x poids réel (kg)0,425 ». Du Bois 1916 : « A = W0·425 […] 0·725 X 71.84 ». | **conforme** | — |
| F8 | Désindexation : DFG × SC / 1,73 (renal.ts:144-147) | HAS guide p. 23 : « (utiliser la formule : DFG estimé x surface corporelle/1,73) ». KDIGO PP 4.2.4 : « multiplying the indexed eGFR results by the person's BSA and dividing by 1.73 m2 ». | **conforme** | — |
| F9 | Cockcroft-Gault : (140 − âge) × poids / (72 × Scr mg/dL), × 0,85 chez la femme (renal.ts:78-87) | RCP vancomycine § 4.2 : « Hommes : [poids (kg) x [140 - âge (ans)]] / [72 x créatinine plasmatique (mg/dl)] » ; « Femmes : 0.85 x valeur calculée ». Résumé de 1976 : « (15% less in females) ». | **conforme** | — |
| F10 | Poids de Cockcroft-Gault : réel par défaut ; idéal (Devine) ou ajusté (idéal + 0,4 × excès) sur choix (renal.ts:149-153, 164-166, 400, 410-428) | FDA § IV.A p. 6 : « use of alternative body weight metrics such as ideal body weight (IBW) or adjusted body weight (ABW) […] is likely to provide a more accurate estimate ». La FDA ne fixe ni la formule du poids idéal ni le facteur. | **à corriger** | Le facteur 0,4 est bien déclaré comme choix de l'application. Il faut **aussi** sourcer la formule de Devine (dans l'application, elle n'est citée que par Wikipédia, via la recherche) ou la déclarer choix de l'application dans ARBITRAGES. Autre point (l. 414-415) : avec « idéal », `Math.min(PI, poids réel)` affiche « poids idéal (Devine) » même quand c'est le poids réel qui est utilisé. Corriger ce libellé. |
| F11 | « k = 0,43 (RCP gentamicine), 0,40 (RCP amikacine) » (renal.ts:163) | RCP gentamicine : « Poids corrigé = poids idéal1 + 0.43 x surcharge pondérale ». RCP amikacine non relu ce jour. | **conforme** (gentamicine) ; amikacine non relue | — |
| F12 | Limite de Cockcroft-Gault : « Formule non réévaluée avec les dosages standardisés […] ; la HAS (2023) ne la recommande plus pour estimer la fonction rénale » (renal.ts:405) | HAS fiche, message 4 : « L'estimation de la filtration glomérulaire par la formule de Cockcroft-Gault sous-estime le DFG lorsqu'on utilise une méthode de dosage standardisée de la créatinine » ; note 4 : « Ne plus utiliser la formule de Cockcroft-Gault ». | **à corriger** | Reprendre le motif réel de la HAS (sous-estimation avec un dosage standardisé). Attacher la source (fiche HAS, message 4, notes) à cette limite, qui n'en a aucune. « Non réévaluée » vient de KDIGO S248-S249 ou du Vidal : les citer si ce motif est gardé. |
| F13 | IMC < 18,5 : « la créatininémie surestime le DFG (limite citée pour IMC < 18) » (renal.ts:316) | Aucune source primaire lue ne donne ce seuil (HAS guide : aucun ; KDIGO Table 8 : « Eating disorders », « Malnutrition », sans IMC). Seule la recherche (fiche 4.3, Vidal, source secondaire) cite « IMC < 18 ». | **à corriger** | Choisir un seul seuil (le texte dit 18, le code teste 18,5). Attacher la source (Vidal, secondaire) ou déclarer le seuil comme choix de l'application dans ARBITRAGES. Formulation proposée : « l'estimation fondée sur la créatinine peut surestimer le DFG ». |
| F14 | IMC ≥ 40 : « obésité de classe III, situation où la KDIGO 2024 (Table 8) suggère la cystatine C » (renal.ts:317) | KDIGO Table 8 « Indications for use of cystatin C » : « Class III obesity » → « eGFRcr-cys demonstrated to be most accurate » ; note b : « commonly body mass index >40 or >35 kg/m2 ». | **conforme** | Précision facultative : « DFG créatinine + cystatine C » ; seuil > 40 (ou > 35 selon la région). |
| F15 | Infection grave : « état catabolique où la KDIGO 2024 (Table 10) indique une mesure du DFG » (renal.ts:318) | KDIGO Table 10 « Indications for measured GFR » : « This may include catabolic states, such as serious infections or inflammatory states » ; texte : « Table 10 lists indications for when one might consider mGFR ». | **conforme** (nuance) | « indique » → « cite parmi les situations où une mesure du DFG peut être envisagée ». |
| F16 | Grossesse (renal.ts:319) | KDIGO § 4.2, **S250** : « Creatinine decreases physiologically during pregnancy due to glomerular hyperfiltration, and BSA varies. This creates challenges for using GFR or eGFR equations. » | **conforme** | — |
| F17 | Âge ≥ 75 ans : « précision moindre des équations » (renal.ts:360) | Aucune source citée ; ce seuil n'apparaît dans aucune source lue. | **à corriger** | Sourcer (KDIGO Table 14 donne les populations de validation, sans seuil de 75 ans) ou déclarer le seuil comme choix de l'application. |
| F18 | Écart > 15 % entre la valeur du laboratoire et le calcul de l'application (renal.ts:442) | Aucune source. | **à corriger** | Déclarer ce seuil comme choix de l'application (ARBITRAGES, ligne « Bornes de plausibilité » ou ligne propre). |
| F19 | Sources de l'estimation indexée : `[...def.sources, SOURCES_RENALES.hasCkdEpi]`, même quand EKFC est choisi (renal.ts:336) | HAS fiche, message 4 : « […] obtenue par la formule CKD-EPI ». | **à corriger** | Avec EKFC, ne pas présenter l'extrait HAS comme justification. Afficher la divergence : « EKFC : non retenue par la HAS, qui demande CKD-EPI ; validée par KDIGO 2024 (Table 14) ». |
| F20 | Commentaire « 1. DFG estimé indexé (CKD-EPI 2021) » (renal.ts:321) | — | **à corriger** (cosmétique) | Le défaut est CKD-EPI 2009 : corriger le commentaire. |

### 3.2 Grandeur exigée par molécule (`src/clinical/molecules/reference-renale.ts`), vérifiée dans les RCP (BDPM, 2026-11-05)

| # | Affirmation | Passage du RCP lu (§ 4.2) | Verdict | Correction |
|---|---|---|---|---|
| M1 | Vancomycine : clairance, mL/min, **formule citée = Cockcroft-Gault** (l. 28-33) | « Les adaptations de dose chez les patients adultes peuvent être basées sur le débit de filtration glomérulaire estimé (eGFR) » / « selon la formule suivante : » ; « chez les patients avec une clairance de la créatinine entre 20 et 49 mL/min ». Extrait de la formule mot pour mot conforme (RCP du 19/10/2026). | **à corriger** (libellé) | Grandeur, unité et formule correctes. Le RCP **ne nomme pas** Cockcroft-Gault et appelle le résultat « eGFR » ; il écrit « peuvent être basées ». Reformuler le `pourquoi` (renal.ts:519) et ARBITRAGES l. 22 : « formule de structure Cockcroft-Gault donnée par le RCP (non nommée, intitulée eGFR) ». |
| M2 | Céfépime : clairance, mL/min, Cockcroft (l. 34-39) | « Lorsque seule la créatininémie (CRS) est disponible, l'équation de Cockcroft peut être utilisée » / « pour estimer la clairance à la créatinine. » ; tableau « Clairance à la créatinine (ml/min) » ; formule « 7,2 X CRS (mg/l) » (équivaut à 72 × mg/dL) ; RCP du 27/09/2024. | **conforme** | L'extrait commence au milieu de la phrase : ajouter « […] » au début. |
| M3 | Amoxicilline : DFG, mL/min (l. 40) | En-tête « DFG (ml/min) » ; « Supérieur à 30 », « 10 à 30 », « inférieur à 10 » ; RCP du 09/02/2023. | **conforme** (grandeur) / **à corriger** (extrait) | L'extrait « tableau en DFG (mL/min) : > 30 : pas d'adaptation… » est un résumé présenté comme citation. Le marquer « d'après le tableau » ou citer l'en-tête « DFG (ml/min) ». |
| M4 | Ertapénème : clairance, mL/min/1,73 m² (l. 41) | « Chez les patients dont la clairance de la créatinine est > 30 ml/min/1,73 m², aucune adaptation posologique n'est nécessaire. » IR sévère et hémodialyse : « l'ertapénème ne doit pas être utilisé chez ces patients » ; RCP du 31/10/2023. | **conforme** (extrait et unité) / **à corriger** (affichage) | Voir P1 : afficher que le RCP parle d'une clairance de la créatinine indexée et que l'application utilise le DFG CKD-EPI indexé (même unité, grandeur différente). |
| M5 | Ciprofloxacine IV : clairance, mL/min/1,73 m² (l. 42) | En-têtes « Clairance de la créatinine [ml/min/1,73 m2] » et « Créatinine sérique [µmol/l] » ; « 30-60 » / « 124 à 168 » / « 200-400 mg toutes les 12 h » ; RCP du 13/03/2026. | **conforme** (unité) / **à corriger** (affichage, extrait) | Comme M4. L'extrait est reconstitué depuis le tableau : le signaler. Le RCP donne aussi des seuils de créatininémie ; l'application ne les utilise pas, à mentionner. |
| M6 | Gentamicine : clairance, mL/min, sans formule (l. 43) | « le moment de réinjection est déterminé par la valeur de la clairance de la créatinine » ; tableau « Clairance de la créatinine (ml/mn) » 90-60 : 24 h, 60-40 : 36 h, 40-20 : 48 h ; aucune formule nommée ; RCP du 29/03/2024. | **conforme** | L'extrait est reconstitué depuis le tableau : acceptable, le signaler. |
| M7 | Méropénème : clairance, mL/min (l. 54) | « lorsque la clairance de la créatinine est inférieure à 51 mL/min » ; tableau « Clairance de la créatinine (mL/min) » ; aucune formule ; RCP du 20/01/2026. | **conforme** | — |
| M8 | Pipéracilline-tazobactam : clairance, mL/min (l. 51) | Tableau « Clairance de la créatinine (ml/min) » : « > 40 » : « Pas d'ajustement de dose nécessaire » ; « 20-40 » ; « < 20 » ; aucune formule ; RCP du **13/11/2025**. | **conforme** | Ajouter la date du RCP (13/11/2025) au titre du registre `RCP-piperacilline-tazobactam`. |
| M9 | Cotrimoxazole : clairance, mL/min (l. 59) | « Clairance de la créatinine > 30 ml/min : posologie normale, 2 perfusions journalières. » ; aucune formule ; RCP du 21/07/2025. | **conforme** | — |
| M10 | Autres molécules (amikacine, daptomycine, céfotaxime, ceftriaxone, cloxacilline, céfazoline, amoxicilline-clavulanate, témocilline, céfoxitine, imipénème, aztréonam, céfixime, lévofloxacine, rifampicine) (l. 44-60) | Concordent avec les fiches 1.3 et 3.x de `recherche-pharmacologie.md`. RCP non relus ce jour. | **non vérifiable** (par moi) | Relecture ciblée des RCP si le temps le permet. |
| M11 | Molécule absente du tableau : clairance en mL/min, méthode non précisée, `sources: []` (l. 64-66) | — | **conforme** (prudent : mode comparaison) | Afficher « grandeur non vérifiée dans le RCP » lorsque ce défaut s'applique. |

### 3.3 Politique de choix (`choisirEstimation()`, `posologie.ts`, `ARBITRAGES.md`)

| # | Affirmation | Source et passage lu | Verdict | Correction |
|---|---|---|---|---|
| P1 | Paliers en mL/min/1,73 m² → DFG indexé, sans désindexation ; `pourquoi` : « la référence posologique exprime ses paliers en mL/min/1,73 m² » (renal.ts:501-507) | RCP ertapénème et ciprofloxacine (M4, M5) : « clairance de la créatinine » en ml/min/1,73 m². HAS fiche, message 4 : adapter « à partir de l'estimation du DFG obtenue par la formule CKD-EPI ». | **à corriger** (affichage) | La règle d'unité est juste. Mais le `pourquoi` doit dire que la référence exprime une **clairance de la créatinine** indexée et que l'application utilise le DFG CKD-EPI indexé (recommandation HAS), deux grandeurs différentes. |
| P2 | Paliers en DFG (mL/min) → DFG désindexé ; `pourquoi` : « désindexation recommandée par la HAS pour adapter une posologie » (renal.ts:509-515) | HAS p. 23 : désindexation « recommandée lorsque celle-ci est éloignée de 1,73 m² » ; EMA p. 4 : « should be based on absolute GFR » ; FDA p. 6 : « use the eGFR expressed as mL/minute ». | **conforme** (fond) / **à corriger** (texte) | Le texte omet la condition posée par la HAS. Écrire : « désindexation (HAS : si la SC est éloignée de 1,73 m² ; EMA et FDA : dose toujours en mL/min absolus) ». ARBITRAGES l. 25 le dit déjà correctement. |
| P3 | Formule de Cockcroft-Gault citée → Cockcroft-Gault ; sinon **DFG désindexé en substitution signalée** (renal.ts:518-533 ; ARBITRAGES l. 22) | HAS fiche : CKD-EPI pour adapter les posologies. **Code** : le DFG désindexé exige poids et taille plausibles (l. 378-382), Cockcroft-Gault seulement le poids (et la taille si poids idéal ou ajusté, l. 408-411), avec les mêmes données communes. Si le DFG désindexé est calculable, Cockcroft-Gault l'est donc aussi : la branche l. 522-531 est **inatteignable** (sauf âge ≥ 140). Le test renal.test.ts:169-172 le confirme (refus). | **à corriger** | Le comportement réel (refus quand le poids manque) est plus prudent que ce qui est documenté. Choisir l'une des deux options : supprimer la branche et corriger ARBITRAGES l. 22 et la recherche ; ou rendre la substitution possible (DFG indexé ou valeur du laboratoire ?) avec une source explicite. Ne pas laisser décrire une substitution qui n'a jamais lieu. |
| P4 | Clairance sans formule → comparaison de Cockcroft-Gault et du DFG désindexé ; si les paliers diffèrent, pas de choix automatique, les deux paliers sont affichés (renal.ts:535-553 ; posologie.ts:306-313) | HAS (CKD-EPI désindexé) contre FDA p. 6, qui accepte aussi « Estimated CLcr (eCLcr) […] using the Cockcroft-Gault (C-G) equation » ; FDA § V.C p. 14 : « dosage recommendations […] can significantly differ if different estimating equations of renal function are used ». | **conforme** | La divergence est affichée honnêtement. Branche l. 550 (« Seul le DFG désindexé est calculable ») inatteignable pour la même raison qu'en P3 : la supprimer. |
| P5 | IRA ou instabilité : estimations « non valides », aucune adaptation automatique ; avis pharmacologique ou néphrologique ; dosage plasmatique (renal.ts:285-289 ; posologie.ts:302-305) | KDIGO PP 4.2.5 : « Consider and adapt drug dosing in people where GFR, non-GFR determinants of the filtration markers, or volume of distribution are not in a steady state. » ; suite : « Where possible, use medication level testing to guide dosing. » | **conforme** (choix prudent) | Ce refus est un **choix de l'application** : KDIGO dit « adapter », pas « ne pas estimer ». Le dire dans ARBITRAGES (déjà en partie : « adapter, dosages si possible »). |
| P6 | Attribution à la HAS (guide p. 23-24) de la conduite en IRA ou instabilité (renal.ts:34 ; ARBITRAGES l. 24 ; recherche §0.5, §9) | HAS p. 23-24 : « dans le cas de prescription de médicament à index thérapeutique étroit (cf. annexe 12) ou de situations cliniques pour lesquelles la mesure de créatinine n'est pas fiable, l'adaptation des posologies devrait s'effectuer en milieu spécialisé ». L'annexe 12 ne cite aucun antibiotique. | **à corriger** | La HAS ne nomme ni l'IRA ni l'instabilité. Écrire : « HAS (p. 23-24), pour une créatinine non fiable ou un médicament à marge étroite : dosage des médicaments ou DFG mesuré en milieu spécialisé ; l'application l'étend à l'IRA et à l'instabilité (interprétation) ». La note du registre `HAS-2023-guide-MRC` est déjà juste. |
| P7 | « réévaluer la fonction rénale chaque jour » (posologie.ts:303) | KDIGO PP 4.2.5 (explication) : « healthcare providers should regularly assess risk, benefits, and value of the medication ». Aucune fréquence quotidienne dans les sources lues. | **à corriger** | « régulièrement » (KDIGO), ou déclarer « chaque jour » comme choix de l'application. |
| P8 | Dialyse : estimations non applicables ; posologie selon la modalité (renal.ts:281-284 ; ARBITRAGES l. 24) | Ni HAS p. 23-24 ni KDIGO PP 4.2.5 ne parlent de la dialyse. FDA § V.C p. 15 : « In CRRT, dosing recommendations should be based on the intensity of the CRRT regimen ». La recherche (§3) note : « NON VÉRIFIÉ comme règle explicite ». | **à corriger** (attribution) | Attribuer cette ligne aux règles des RCP par modalité, à la FDA § V.C et à l'EMA § 6.2.4, et la déclarer choix de l'application. Ne pas l'appuyer sur la HAS ni sur KDIGO PP 4.2.5. |
| P9 | Limites affichées : obésité (IMC ≥ 30, divergence sur le poids), IMC < 18,5 et ≥ 40, grossesse, infection grave (renal.ts:316-319, 429-430) | Voir F13 à F16 ; KDIGO S248-S249 sur Cockcroft-Gault : « concerns about use of weight, which can be impacted by edema or obesity ». | **conforme** sauf F13 | Voir F13. |
| P10 | `risqueComplicationSpilf2015` : « clairance < 30 mL/min » = **minimum** de Cockcroft-Gault et du DFG désindexé (bgn-urinaire.ts:160-163) | Ce choix « minimum » n'est documenté nulle part (SPILF 2015 non relue ce jour). | **à corriger** (traçabilité) | Ajouter une ligne dans ARBITRAGES : « estimation la plus basse des deux (choix prudent de l'application) ». |
| P11 | ARBITRAGES l. 21 (version de l'équation) | HAS, KDIGO (Table 14 : CKD-EPI 2009 « reported not using the Black race coefficient », CKD-EPI 2021, EKFC 2021) et EFLM lus. | **conforme** | Table 14 liste aussi Lund-Malmö révisée (facultatif). |
| P12 | ARBITRAGES l. 23 (poids de Cockcroft-Gault) | RCP vancomycine : « poids (kg) » ; FDA p. 6 (F10). MSD (« lean body weight ») non relu. | **conforme** (MSD non vérifiable) | Ajouter la formule de Devine comme choix (F10). |
| P13 | ARBITRAGES l. 25 et 26 (seuil de désindexation, bornes de plausibilité) | HAS p. 23 : « éloignée de 1,73 m² », sans seuil. | **conforme** | Ajouter les seuils de F13, F17 et F18. |

### 3.4 Messages des états de sortie (`sortie.ts`, `Explication.tsx`, `FonctionRenale.tsx`)

| # | Affirmation | Exigence ou source | Verdict | Correction |
|---|---|---|---|---|
| S1 | `TEXTE_NON_COUVERTE` (sortie.ts:13-14), utilisé par `limiteCouverture` (l. 315) pour les motifs `non_couverte` (l. 241-254, 273-287) | Phrase imposée : « L'application ne dispose pas actuellement d'une règle validée pour cette situation. Cela ne signifie pas qu'aucun traitement n'est indiqué. » | **conforme** (identique au caractère près) | — |
| S2 | `TEXTE_CONTRAINTES` (sortie.ts:15-16) : « Cela ne signifie pas qu'aucun traitement n'existe : l'avis spécialisé indiqué est nécessaire. » | Pas d'implication d'absence de traitement. | **conforme** | — |
| S3 | Motifs `non_validee` (point non résolu, rang 45, l. 98-111 ; propositions masquées, rang 50, l. 112-125) | Même exigence de ne pas laisser croire à l'absence de traitement. | **à corriger** | Pour le rang 45, ajouter « Cela ne signifie pas qu'aucun traitement n'est indiqué » (dans `limite`, après le point non résolu). Le rang 50 dit déjà que la proposition existe dans la base. |
| S4 | Urgence : `Ne pas attendre : …` en tête de chaque prochaine action (sortie.ts:289-294) ; bandeau « Urgence : ne pas attendre une proposition complète. » (Explication.tsx:122-137) | Un cas urgent ne doit jamais suggérer d'attendre. | **conforme** | Résidu : en urgence, le statut « Un résultat est nécessaire avant de conclure » (l. 157) reste affiché au-dessus. Le reformuler quand `urgence` est vrai, par exemple « Résultat à obtenir (sans retarder les mesures urgentes) ». |
| S5 | « Ce qui peut déjà être proposé : Rien de plus à ce stade. » (Explication.tsx:76) | Pas d'implication d'impasse. | **à corriger** (mineur) | « Aucune proposition de l'application à ce stade : voir la prochaine action. » |
| S6 | Motifs construits à partir des règles évaluées, sans texte ajouté après coup (sortie.ts:1-5, 52-297) | Pas de justification inventée. | **conforme** | Les raisons viennent de `ind.raison`, `e.raison`, `m.pourquoi` et `plan.situation`. |
| S7 | Erreur technique : « ce n'est pas une conclusion médicale » ; ni « inutile » ni « indiquée » (sortie.ts:319-339 ; Explication.tsx:165-180) | — | **conforme** | — |
| S8 | Messages rénaux de la posologie : aucune dose, durée ni cible inventée ; « Avis pharmacologique ou néphrologique », « dosage plasmatique (voir surveillance) » (posologie.ts:303-313, 326-328) | KDIGO PP 4.2.5 (« use medication level testing ») | **conforme** sauf P7 | En urgence avec IRA (situation fréquente en sepsis), il serait utile de rappeler les phrases sourcées des RCP sur la **première dose**. Vancomycine : « la dose initiale ne doit pas être diminuée ». Gentamicine : première injection à la dose habituelle. Cela évite de retarder la première dose. Suggestion, à valider médicalement. |
| S9 | Carte de fonction rénale : trois estimations distinctes, unité, formule, version, date ; « Non valide » si instable ; valeur du laboratoire « valeur fournie, non recalculée » (FonctionRenale.tsx:13-141) | — | **conforme** | — |
| S10 | Aucune correction ethnique (recherche plein texte de `race`, `noir`, `ethni` et `1.159` dans `src/`) | KDIGO PP 1.2.4.2 | **conforme** | Le facteur 1,159 n'apparaît que dans un extrait cité et dans un commentaire qui précise qu'il n'est jamais appliqué. |
| S11 | Rien n'est présenté comme validé : `etat-base.json` « À valider par un médecin » ; `statutGlobal: verifiee_ia` | — | **conforme** | — |

### 3.5 Registre (`src/clinical/sources/registre.json`) et extraits de `SOURCES_RENALES` (renal.ts:22-37)

| # | Entrée ou extrait | Vérification | Verdict | Correction |
|---|---|---|---|---|
| R1 | KDIGO-2024-CKD : titre, Kidney Int 2024;105(4S):S117-S314, URL, notes | Vérifiés sur le PDF. | **conforme** | — |
| R2 | KDIGO-2012-AKI : Kidney Int Suppl 2012;2:1-138 ; note « eGFR réservé au patient stable (chap. 4) » | Rec. 3.8.3 et 3.8.4 conformes. La phrase « in stable patients, an eGFR should be used » se trouve dans le chapitre sur l'IRA aux produits de contraste (évaluation du risque), pas dans un passage sur la posologie. | **à corriger** | Note : « chap. 4 (IRA aux produits de contraste) : eGFR chez le patient stable pour évaluer le risque ». |
| R3 | HAS-2023-guide-MRC : titre, date, URL, note | Vérifiés ; la note (« marge étroite ou créatinine non fiable ») est exacte. | **conforme** | — |
| R4 | LEVEY-2009-CKD-EPI : titre, Ann Intern Med 2009;150:604-12 | Référence confirmée par la FDA (note 11) et l'EFLM (réf. 2). Contenu PMC non lu (reCAPTCHA). | **conforme** (référence) | — |
| R5 | INKER-2021-CKD-EPI : titre, N Engl J Med 2021;385:1737-49 | Référence confirmée par l'EFLM (réf. 23). | **conforme** (référence) | — |
| R6 | EFLM-2022-CKD-EPI-Europe : titre « CKD-EPI 2021 equation: a position statement of the EFLM » | Titre réel : « The new, race-free, Chronic Kidney Disease Epidemiology Consortium (CKD-EPI) equation to estimate glomerular filtration rate: is it applicable in Europe? A position statement by the […] (EFLM) ». Publié en ligne le 24/10/2022. | **à corriger** | Remplacer par le titre exact. |
| R7 | STEHLE-2023-DFG : titre « Estimation du débit de filtration glomérulaire » | Titre réel : « Actualités et perspectives dans l'estimation du débit de filtration glomérulaire » (Nephrol Ther 2023;19:1-10, « Mise au point »). | **à corriger** | Remplacer par le titre exact. |
| R8 | COCKCROFT-GAULT-1976 : titre, Nephron 1976;16:31-41 ; URL karger.com/nef/article/16/1/31/ | Titre et référence conformes (notice HERO). **L'URL renvoie une erreur 404.** | **à corriger** | Remplacer l'URL : DOI 10.1159/000180580 ou PubMed 1244564. Ces deux identifiants viennent des résultats de recherche : je ne les ai pas ouverts, les vérifier avant de les inscrire. |
| R9 | DUBOIS-1916 : titre, Arch Intern Med 1916;17:863-71, URL Zenodo | Titre lu dans le PDF ; référence confirmée par la FDA (note 14). | **conforme** | — |
| R10 | FDA-2024-PK-insuffisance-renale : titre, mars 2024, URL, notes | Couverture « March 2024 » ; § IV.A et V.C conformes. | **conforme** | — |
| R11 | EMA-2015-PK-insuffisance-renale : titre, EMA/CHMP/83874/2014, en vigueur au 01/07/2016 | Conformes (adoption 17/12/2015). | **conforme** | — |
| X1 | `ckdEpi2021` : extrait NKF (renal.ts:23) | NKF : « 142* min(standardized Scr/K, 1)α * … ». Coefficients identiques ; mise en forme normalisée (κ, ^, ×). | **conforme** | Facultatif : signaler « mise en forme normalisée ». |
| X2 | `ckdEpi2009` : extrait Levey « Results » (renal.ts:24) | Primaire non lu (reCAPTCHA) ; coefficients identiques chez MSD. | **non vérifiable** (extrait) | — |
| X3 | `ckdEpi2009` : extrait EFLM « CKD-EPI 2009 sans coefficient racial maintenue en Europe » (renal.ts:24) | Paraphrase française présentée comme extrait. | **à corriger** | Citer : « to keep the 2009 version of the CKD-EPI equation, without applying a race correction factor ». |
| X4 | `ekfc` : extrait Stehlé (renal.ts:25) | Mot pour mot, mais sans la condition « Âge > 40 ans » qui précède le facteur 0,990. | **à corriger** | Préfixer l'extrait par « Âge > 40 ans : ». |
| X5 | `kdigoEquation` : « une équation par région, sans variable raciale » (renal.ts:26) | Paraphrase. PP 1.2.4.1 : « Use the same equation within geographical regions » ; PP 1.2.4.2 : « Use of race in the computation of eGFR should be avoided. » | **à corriger** | Citer les deux PP mot pour mot. |
| X6 | `hasCkdEpi`, message 4 (renal.ts:27) | Mot pour mot. | **conforme** | Voir F19 (EKFC). |
| X7 | `hasDesindexation`, message 4, note 3 (renal.ts:28) | Note 3 : « la désindexation de la formule en tenant compte de la surface corporelle du patient (…) est recommandée lorsque celle-ci est éloignée de 1,73 m² ». | **conforme** | — |
| X8 | `duBois`, message 4, note 3 (renal.ts:29) | Mot pour mot. | **conforme** | — |
| X9 | `cockcroft` : RCP vancomycine § 4.2 (renal.ts:30) | Mot pour mot. | **conforme** | Voir M1 (non nommée). |
| X10 | `kdigoDesindexe`, PP 4.2.4 (renal.ts:31) | Mot pour mot. La PP commence par « In people with extremes of body weight ». | **conforme** | Facultatif : citer aussi le début de la PP. |
| X11 | `emaDesindexe` : « p. 3 » (renal.ts:32) | Texte conforme, mais il se trouve en **p. 4/15** (§ 2, Introduction). Même principe en § 6.2.4 (p. 12/15). | **à corriger** | « p. 4 (§ 2) ». |
| X12 | `kdigoInstable`, PP 4.2.5 : « GFR … [is] not in a steady state » (renal.ts:33) | Original : « … or volume of distribution are not in a steady state ». L'insertion « [is] » modifie la phrase. | **à corriger** (mineur) | Citer la PP entière (27 mots). |
| X13 | `hasInstable`, p. 23-24 (renal.ts:34) | Mot pour mot jusqu'à « mesure du DFG » (« « vrai » du patient » coupé sans « […] ») ; utilisé hors de son champ. | **à corriger** | Voir P6 ; ajouter « […] ». |
| X14 | `kdigoTable10` (renal.ts:35) | Mot pour mot. | **conforme** | Voir F15. |
| X15 | `fdaPoidsObese`, § IV.A p. 6 (renal.ts:36) | Mot pour mot ; page exacte. | **conforme** | — |

### 3.6 Note de recherche `docs/sources/recherche-fonction-renale.md` : citations clés vérifiées

| # | Passage de la note | Vérification | Verdict | Correction |
|---|---|---|---|---|
| D1 | §1.1 HAS p. 11, p. 12, p. 23 (citations) | Mot pour mot, pages exactes ; aucune occurrence de « 2009 » ni d'« EKFC » liée à l'équation. | **conforme** | — |
| D2 | §1.3 KDIGO (PP, Rationale, Tables 11 et 14) | Conformes. | **conforme** | — |
| D3 | §1.4 EFLM (résumé, ERA, EKFC) | Mot pour mot. | **conforme** | — |
| D4 | §2 Stehlé, EKFC et Q | Mot pour mot. | **conforme** | — |
| D5 | §3 grossesse « KDIGO 2024 § 4.2 (S249) » | Ce passage est en **S250**. | **à corriger** | S250. |
| D6 | §4 et §8 : PP 4.2.2 à 4.2.5 ; FDA p. 6 et 7 ; EMA « (p. 3) » | PP et FDA conformes ; EMA en **p. 4**. | **à corriger** (EMA) | p. 4. |
| D7 | §0.5 et §9 : « En situation instable : dosages […] en milieu spécialisé (HAS, guide p. 23-24) » | Voir P6. Le §8 de la même note cite correctement la condition. | **à corriger** | Aligner le §0.5 et le §9 sur le §8. |
| D8 | §6.2 EMA § 5.2 p. 7, p. 8 ; § 7 p. 14 ; « Cockcroft-Gault n'est pas nommé » | Conformes. | **conforme** | — |

---

## 4. Corrections par priorité

### P1 — attribution ou comportement documenté faux
1. **P6, X13, D7** : la HAS p. 23-24 ne vise pas l'IRA. Reformuler dans renal.ts:34, ARBITRAGES l. 24 et recherche §0.5 et §9.
2. **P3** (et P4, l. 550) : branche de substitution inatteignable. Aligner ARBITRAGES l. 22, le message et la recherche sur le comportement réel (refus), ou rendre la substitution réelle avec une source.
3. **F19** : avec EKFC, ne plus présenter la HAS (« formule CKD-EPI ») comme justification ; afficher la divergence.
4. **M1** : vancomycine, formule non nommée par le RCP et intitulée « eGFR ».
5. **P1, M4, M5** : afficher la différence de grandeur (clairance indexée contre DFG indexé) pour l'ertapénème et la ciprofloxacine.

### P2 — extraits, références et seuils
6. **R6, R7, R8** : titres EFLM et Stehlé ; URL Cockcroft-Gault.
7. **X3, X5** : remplacer les paraphrases par des citations exactes ; **X4** : ajouter la condition d'âge ; **X11, D6** : EMA p. 4 ; **X12** : PP 4.2.5 entière ; **M3** : extrait amoxicilline présenté comme résumé du tableau.
8. **F13, F17, F18, P7, F10 (Devine), P10** : seuils et choix non sourcés. Les déclarer « choix de l'application » dans ARBITRAGES ou les sourcer. Harmoniser 18 et 18,5.
9. **P8** : attribuer la ligne « dialyse » aux RCP par modalité, à la FDA § V.C et à l'EMA, et non à la HAS ni à KDIGO PP 4.2.5.
10. **F12** : reformuler la limite de Cockcroft-Gault selon la HAS et la sourcer.
11. **S3** : ajouter la phrase « Cela ne signifie pas qu'aucun traitement n'est indiqué » au motif `non_validee` de rang 45.

### P3 — finitions
12. **R2** (note KDIGO-AKI), **D5** (S250), **F15** (« peut être envisagée »), **F20** (commentaire), **S4** (statut en urgence), **S5** (« Rien de plus à ce stade »), **M2** (« […] »), **M8** (date du RCP), **F10** (libellé quand le poids réel est inférieur au poids idéal).
13. **S8** (suggestion à valider médicalement) : rappeler en IRA les phrases sourcées des RCP sur la première dose.

---

## 5. Ce qui n'a pas pu être vérifié

- **Levey 2009** (PMC2763564) : page de vérification reCAPTCHA. Coefficients confirmés par MSD Manuals (secondaire). L'extrait « Results » n'est pas vérifié mot pour mot (X2).
- **Inker 2021** : non relu. Coefficients confirmés par la NKF.
- **Pottel 2021** (EKFC princeps) : non lu (déjà signalé par la recherche). Coefficients confirmés par Stehlé 2023 et le calcul de l'exemple G.
- **Cockcroft-Gault 1976**, texte intégral : non lu. Le poids utilisé par les auteurs n'est pas vérifié. La formule n'est vérifiée que dans le RCP vancomycine et la notice HERO.
- **RCP amikacine** (facteur 0,40) et **les 14 autres RCP de M10** : non relus ce jour.
- **MSD Manuals** (« lean body weight ») et **SPILF 2015** (« clairance < 30 mL/min ») : non relus.
- **DOI et PubMed** de Cockcroft-Gault (R8) : relevés dans des résultats de recherche, non ouverts.

---

## 6. Matrice des nouveaux éléments rénaux et messages cliniques

| Élément | Fichier:ligne | Source principale | Statut |
|---|---|---|---|
| CKD-EPI 2009 sans race (défaut) | renal.ts:104-116, 132 | EFLM 2022 ; KDIGO Table 14 ; MSD | conforme |
| CKD-EPI 2021 (option) | renal.ts:89-102 | NKF ; KDIGO Table 14 | conforme |
| EKFC (option, âge > 25 ans) | renal.ts:118-129, 338 | Stehlé 2023 tableau 1 ; KDIGO Table 14 | conforme (extrait X4 et source HAS F19 à corriger) |
| Conversion 88,4 | renal.ts:44 | KDIGO « Conversion factors » | conforme |
| Surface corporelle de Du Bois | renal.ts:139-142 | HAS fiche note 3 ; Du Bois 1916 | conforme |
| Désindexation | renal.ts:144-147 | HAS p. 23 ; KDIGO PP 4.2.4 ; FDA p. 6 ; EMA p. 4 | conforme (page EMA à corriger) |
| Cockcroft-Gault (× 0,85) | renal.ts:78-87 | RCP vancomycine ; résumé de 1976 | conforme |
| Poids idéal (Devine) | renal.ts:149-153 | aucune dans l'application | à corriger |
| Poids ajusté, facteur 0,4 | renal.ts:164-166, 414 | choix déclaré ; FDA p. 6 | conforme (choix affiché) |
| Bornes de plausibilité | renal.ts:58-61 | choix déclaré (ARBITRAGES) | conforme |
| Limite IMC < 18,5 | renal.ts:316 | aucune primaire (Vidal secondaire, « < 18 ») | à corriger |
| Limite IMC ≥ 40 | renal.ts:317 | KDIGO Table 8 | conforme |
| Limite infection grave | renal.ts:318 | KDIGO Table 10 | conforme (nuance) |
| Limite grossesse | renal.ts:319 | KDIGO § 4.2 (S250) | conforme |
| Limite âge ≥ 75 ans | renal.ts:360 | aucune | à corriger |
| Limite de Cockcroft-Gault (HAS) | renal.ts:405 | HAS fiche, message 4 | à corriger (reformuler, sourcer) |
| Écart labo > 15 % | renal.ts:442 | aucune | à corriger (déclarer choix) |
| Refus si dialyse | renal.ts:281-284 | RCP, FDA § V.C (non cités) | à corriger (attribution) |
| Refus si IRA ou instabilité | renal.ts:285-289 ; posologie.ts:302-305 | KDIGO PP 4.2.5 ; HAS p. 23-24 (hors champ) | conforme sur le fond ; attribution HAS à corriger |
| Moins de 18 ans hors domaine | renal.ts:290-293 | KDIGO Table 14 (≥ 18 ans pour CKD-EPI) | conforme |
| Choix : paliers en mL/min/1,73 m² → indexé | renal.ts:501-507 | HAS fiche ; RCP ertapénème et ciprofloxacine | à corriger (afficher la différence de grandeur) |
| Choix : paliers en DFG mL/min → désindexé | renal.ts:509-515 | HAS p. 23 ; EMA ; FDA | conforme (préciser la condition HAS) |
| Choix : Cockcroft-Gault cité → Cockcroft-Gault, sinon substitution | renal.ts:518-533 | RCP vancomycine et céfépime ; HAS | à corriger (substitution inatteignable, documentation inexacte) |
| Choix : clairance sans formule → comparaison | renal.ts:535-553 ; posologie.ts:306-313 | HAS contre FDA (divergence affichée) | conforme |
| Référence par molécule : vancomycine | reference-renale.ts:28-33 | RCP Viatris § 4.2 | à corriger (libellé « non nommée, eGFR ») |
| Référence par molécule : céfépime | reference-renale.ts:34-39 | RCP Stragen § 4.2 | conforme |
| Référence par molécule : amoxicilline | reference-renale.ts:40 | RCP Panpharma § 4.2 | conforme (extrait à marquer comme résumé) |
| Référence par molécule : ertapénème | reference-renale.ts:41 | RCP Panpharma § 4.2 | conforme (affichage P1) |
| Référence par molécule : ciprofloxacine IV | reference-renale.ts:42 | RCP Ciflox § 4.2 | conforme (affichage P1) |
| Référence par molécule : gentamicine | reference-renale.ts:43 | RCP Panpharma § 4.2 | conforme |
| Référence par molécule : méropénème | reference-renale.ts:54 | RCP Kalceks § 4.2 | conforme |
| Référence par molécule : pipéracilline-tazobactam | reference-renale.ts:51 | RCP Tazocilline § 4.2 | conforme |
| Référence par molécule : cotrimoxazole | reference-renale.ts:59 | RCP Bactrim § 4.2 | conforme |
| Référence par molécule : 14 autres | reference-renale.ts:44-60 | RCP non relus | non vérifiable |
| Seuil SPILF 2015 « clairance < 30 » = minimum des deux estimations | bgn-urinaire.ts:160-163 | non documenté | à corriger (traçabilité) |
| Message « réévaluer la fonction rénale chaque jour » | posologie.ts:303 | KDIGO « regularly » | à corriger |
| Phrase imposée « situation non couverte » | sortie.ts:13-14, 315 | exigence du projet | conforme |
| Message « contraintes » | sortie.ts:15-16 | — | conforme |
| Motif « point non résolu » (rang 45) | sortie.ts:98-111 | exigence du projet | à corriger (phrase manquante) |
| Urgence : « Ne pas attendre » | sortie.ts:289-294 ; Explication.tsx:122-137 | exigence du projet | conforme (statut l. 157 à reformuler en urgence) |
| « Rien de plus à ce stade » | Explication.tsx:76 | — | à corriger (mineur) |
| Erreur technique ≠ conclusion médicale | sortie.ts:319-339 ; Explication.tsx:165-180 | — | conforme |
| Carte de fonction rénale (trois estimations, labo, limites) | FonctionRenale.tsx:13-141 | — | conforme |
| Aucune correction ethnique | src/ (recherche plein texte) | KDIGO PP 1.2.4.2 | conforme |
| Rien présenté comme validé | etat-base.json | — | conforme |
| Registre : KDIGO-2024, HAS-guide, LEVEY, INKER, DUBOIS, FDA, EMA | registre.json | PDF et références lus | conforme |
| Registre : KDIGO-2012-AKI (note) | registre.json | KDIGO AKI chap. 4 | à corriger |
| Registre : EFLM (titre) | registre.json | CCLM 2023;61:44 | à corriger |
| Registre : STEHLE (titre) | registre.json | Nephrol Ther 2023;19:1 | à corriger |
| Registre : COCKCROFT-GAULT (URL 404) | registre.json | — | à corriger |

---

## Suites données (2026-11-05)

Toutes les corrections demandées ont été faites, sauf mention contraire.

- **Attributions** : la conduite en IRA ou instabilité s'appuie sur KDIGO PP 4.2.5 ; le passage HAS p. 23-24 est cité avec sa condition, et son extension à l'IRA est déclarée comme interprétation (ARBITRAGES). La dialyse est rattachée aux RCP, à la FDA § V.C et à l'EMA § 6.2.4, comme choix de l'application (P6, P8, D7).
- **Substitution de Cockcroft-Gault (P3)** : branche supprimée ; si le poids manque, la référence qui donne la formule de Cockcroft-Gault conduit à un refus explicite, sans substitution. ARBITRAGES corrigé.
- **EKFC (F19)** : l'extrait HAS n'est plus attaché ; la divergence (HAS : CKD-EPI ; KDIGO : EKFC validée) est affichée.
- **Vancomycine (M1)** : « formule de structure Cockcroft-Gault, non nommée par le RCP, intitulée eGFR ».
- **Ertapénème et ciprofloxacine (P1, M4, M5)** : la raison affichée dit que le RCP parle de clairance indexée et que l'application utilise le DFG indexé, de grandeur différente ; extraits reconstitués signalés « d'après le tableau ».
- **Registre (R2, R6, R7, R8)** : titres EFLM et Stehlé corrigés ; URL de Cockcroft-Gault remplacée par le DOI 10.1159/000180580, vérifié dans Crossref (titre, Nephron, p. 31-41) ; note KDIGO-AKI replacée dans son contexte.
- **Extraits et repères (X3, X4, X5, X11, X12, X13, D5, D6)** : citations mot pour mot, EMA p. 4, KDIGO grossesse S250.
- **Seuils non sourcés (F13, F17, F18, F10, P10)** : IMC < 18 (Vidal 2022, source secondaire), âge ≥ 75 ans, écart de 15 %, Devine et facteur 0,4, règle « IRC sévère » déclarés comme choix de l'application (ARBITRAGES) ; libellé du poids réellement utilisé corrigé.
- **Limite de Cockcroft-Gault (F12)** : motif réel de la HAS repris, source attachée.
- **« Chaque jour » (P7)** : remplacé par « régulièrement (KDIGO 2024, PP 4.2.5) ».
- **Sorties (S3, S5)** : phrase « Cela ne signifie pas qu'aucun traitement n'est indiqué » ajoutée au point non résolu ; « Aucune proposition de l'application à ce stade : voir la prochaine action ».
- **Non vérifiable** : extrait de Levey 2009 (reCAPTCHA) et RCP non relus ; inchangé.
