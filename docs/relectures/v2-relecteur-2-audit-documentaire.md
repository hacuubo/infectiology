# Relecture 2 (v2) — Audit documentaire : indication de traitement et antibiogramme guidé

- **Relecteur** : agent IA d'audit documentaire (relecteur 2). Ce n'est **pas** un avis médical et l'audit ne vaut pas validation humaine : aucun statut ne doit passer à `validee_humain` sur la foi de ce rapport.
- **Date** : 2026-11-05. **Branche** : `feat/indication-antibiogramme-guide`, commit `c92ada1` (« Indication de traitement et antibiogramme guidé (avant relecture) »). **Diff audité** : `git diff feat/premiere-chaine-complete...HEAD`.
- **Fichiers modifiés par l'audit** : ce rapport seulement. Aucun fichier source ni test n'a été modifié.
- Les numéros de ligne renvoient à l'état du commit `c92ada1`.

---

## 1. Résumé

L'architecture documentaire du lot est solide. Les sources sont presque toutes lues et citées avec un repère exact. Le registre contient chaque identifiant utilisé (40/40 vérifiés). Les citations à fort enjeu que j'ai relues dans les originaux sont **exactes** : AFU 2026 Q1/Q3, SPILF 2026 diapos 3-7, IUAS R.1, R.4, R.17, R.28-R.36, IDSA 2019 II, V, IX, XI, XIII, HAS femme enceinte, CA-SFM 2026 (BLSE, céphalosporinase, carbapénémase, staphylocoques, entérocoques, streptocoques A/B/C/G, céfoxitine), EUCAST ERP v1.2, ESP v1.1, règles expertes v3.3 (règles 7, 8, 10), IDSA/ESCMID 2026 Table 1 et SSC 2026.

Les défauts relevés tiennent moins à des citations fausses qu'à des **conditions ou exceptions manquantes** et à des **citations utilisées hors de leur champ** :

1. **Erreur de lecture SARM/SAMS** (`outils.ts:254-261`) : l'oxacilline est lue avant la céfoxitine. Une souche « oxacilline S / céfoxitine R » est donc classée SAMS, ce qui contredit le CA-SFM 2026 ch. 5.7 et la règle 1 EUCAST staphylocoques. Le forçage « toutes β-lactamines R » ne se déclenche que sur le phénotype SARM déclaré, jamais sur une céfoxitine R.
2. **ECBU « contaminé » sans recherche des exceptions** (`ecbu.ts:176-192`). Sans symptôme, l'application conclut « ni traitement ni nouvel ECBU » même en cas de grossesse ou de geste urologique à risque programmé. Or l'AFU 2026 Q2 R7 et Q3 R5 ne permettent ni de recommander ni de déconseiller dans ce cas (≥ 3 germes avant geste), et la SPILF 2015 p. 31 vise justement à distinguer colonisation gravidique et contamination. De plus, chez un patient fébrile, la conduite « attendre le nouvel ECBU avant tout antibiotique » s'appuie sur IUAS R.36, alors que **R.35** (infection parenchymateuse : probabiliste dans les 12 h) s'applique.
3. **IDSA 2019 Q V (remarque) détournée** (`ecbu.ts:67, 328`) : le texte vise « fever **and other systemic signs potentially consistent with a severe infection (sepsis)** ». L'application l'invoque pour une fièvre **sans sepsis**. La branche est déjà en `brouillon`, mais la raison affichée attribue à l'IDSA ce qu'elle ne dit pas. Symétriquement, en sepsis avec fièvre et bactériurie sans signe urinaire (`ecbu.ts:158`), l'application retient un foyer urinaire probable, alors que la même remarque demande un spectre « urinary **and nonurinary** ».
4. **Colonisation gravidique traitée sans condition microbiologique** (`ecbu.ts:400-413`). Le seuil ≥ 10⁵ UFC/mL **monomicrobien** (HAS) ou > 10⁵ UFC/mL (SPILF 2015 p. 31) n'est pas vérifié : un ECBU à 2 espèces conduit à « traiter ». La conduite propre au streptocoque B (traitement per-partum, SPILF 2015 p. 31) manque.
5. **Neutropénie** (`ecbu.ts:425-436`) : l'IDSA Q IX ne vise que la neutropénie **à haut risque** (PNN < 100/mm³, ≥ 7 jours après chimiothérapie). IUAS R.28 (D-III, ne pas dépister ni traiter) diverge et n'est pas signalée. Enfin, la neutropénie est testée **avant** le geste urologique, ce qui masque la conduite AFU.
6. **Sources fusionnées ou utilisées hors champ en microbiologie** :
   - La règle EUCAST 7, propre à E. coli, Klebsiella et Raoultella et au phénotype « R à une C3G/C4G et S à une autre », sert de justification générale à « C3G R ≠ BLSE ». Le texte adapté est le CA-SFM 2026 p. 50.
   - La céfoxitine est présentée « E. coli ou Proteus » (SPILF 2026), avec à côté la source SPILF 2023 « E. coli uniquement », sans signaler l'écart. Le CA-SFM 2026 p. 51 ne valide les concentrations critiques thérapeutiques de la céfoxitine **que pour E. coli**.
   - La témocilline hors voie urinaire est écartée au motif d'une catégorisation « uniquement urinaire » (EUCAST), alors que le CA-SFM 2026 a une ligne « autres infections ».
7. **Discordance céfotaxime R / ceftriaxone S non traitée** : `ceftriaxone ?? cefotaxime` masque une résistance à l'une des deux C3G (`bgn-urinaire.ts:43`, `analyse.ts:149`, `guide.ts:242`). C'est précisément le phénotype de la règle EUCAST 7 (avertissement pour les infections non urinaires).

Les statuts `brouillon` sont honnêtes là où ils sont posés (sonde JJ/néphrostomie, fièvre sans foyer). En revanche, plusieurs branches marquées `verifiee_ia` portent un des défauts ci-dessus : le §7 propose leur statut.

Bilan : **72 éléments audités** (§3). 47 conformes, dont plusieurs avec une divergence à afficher ; 20 à corriger ; 4 à bloquer en `brouillon` jusqu'à correction (I13, I15, I16, M5) ; 1 non vérifiable (M25). Certaines parties d'éléments restent non vérifiables : voir §6.

---

## 2. Sources relues dans les documents originaux (2026-11-05)

Téléchargement dans un dossier vide du scratchpad, puis extraction locale (`pdftotext -enc UTF-8`, XML des diapositives pour le pptx, HTML converti en texte). Aucun blocage anti-robot rencontré sur ces adresses.

| Source | URL | Accès | Points vérifiés |
|---|---|---|---|
| AFU/CIAFU 2026, synthèse (40 p.) | infectiologie.com/…/reco-ecbu-synthese-04032026-mel.pdf | **lu** | Q1 R3, R7, R8, R10 ; Q2 R3 (10 j), R7 (≥ 3 germes) ; Q3 R1-R6 (48 h avant, 3 à 5 j, **R3 : durée NLPC non définie**, ordre des molécules, R5 polymicrobien) ; tableaux 5-6 (bilan urodynamique « Oui / Accord fort », sonde JJ « Oui » et légende contraire, biopsies « Non → cf. CIAFU/CCAFU ») ; règle p. 26 « si un ECBU est indiqué et positif, l'antibiothérapie est indiquée » |
| SPILF 2026 IU masculines, diaporama | infectiologie.com/…/spilf-groupe-recos-ium.pptx | **lu** (diapos 3-7) | Cadre (homme, communautaire, **hors sonde, immunodéprimé, soins**) ; diapos 4-7 mot pour mot conformes aux extraits du code |
| IUAS 2015 (RPC 7 mai 2015) | infectiologie.com/…/2015-rpc-infections-urinaires-associees-aux-soins.pdf | **lu** | R.1 (« si et seulement si » signes **systémiques**), R.2, **R.3** (sujet âgé : évoquer une IUAS devant une aggravation cognitive), R.4, R.17, R.19, **R.28**, R.29, R.30, R.33, R.34, **R.35**, R.36 ; p. 10 « la clinique prime » |
| SPILF 2015 texte court | infectiologie.com/…/infections-urinaires-spilf.pdf | **lu** | p. 7 (deux situations consensuelles) ; p. 31 (définition gravidique > 10⁵, 2 cultures ou 1 acceptée, seuil choisi contre les contaminations ; streptocoque B quel que soit le titre → per-partum) |
| IDSA 2019 ASB (page HTML) | idsociety.org/practice-guideline/asymptomatic-bacteriuria/ | **lu** | II, V (et sa remarque **conditionnée au sepsis**), VII, **IX (haut risque seulement)**, XI (ablation de sonde : pas de recommandation), XIII (geste avec effraction muqueuse ; 1 ou 2 doses) |
| HAS femme enceinte (c_2722927) | has-sante.fr | **lu** | Validation 15/07/2021, mise à jour 13/05/2025 ; « ≥ 10⁵ UFC/ml **monomicrobienne** » ; « pas de traitement probabiliste » ; amoxicilline 1 g × 3, 7 j ; ECBU 8-10 j puis mensuel ; cystite gravidique : **traitement probabiliste** |
| CA-SFM 2026 V1.0 (176 p.) | sfm-microbiologie.org/casfm2026_v1-0-septembre-2026/ | **lu** (recherche plein texte) | Avant-propos (carbapénémase → R) ; ch. 5.1 (BLSE → R C3G/C4G/ATM ; céphalosporinase → R C3G/ATM/pipé ± tazo ; groupe 3 ; p. 49 CMI de l'association hors IU ; p. 50 C3G SFP/R sans synergie = céphalosporinase hyperproduite ou plasmidique ; p. 51 céfoxitine validée **seulement pour E. coli** ; témocilline « autres infections ») ; 5.7 (SARM = R céfoxitine **ou** oxacilline selon l'espèce, ou mec additionnel) ; 5.8 ; 5.10 ; ch. 3 définition SFP |
| EUCAST Expected Resistant Phenotypes v1.2 | eucast.org/…/Expected_Resistant_Phenotypes_v1.2_20230113.pdf | **lu** | En-têtes Tables 1, 2, 4 ; note 2 (AmpC inductible) ; note 1 (LLR aminosides) |
| EUCAST Expected Susceptible Phenotypes v1.1 | eucast.org/…/Expected_Susceptible_Phenotypes_Tables_v1.1_20220325.pdf | **lu** | 2.1-2.8 (dont entérocoque « teicoplanin R but not vancomycin ») |
| EUCAST Expert Rules v3.3 Enterobacterales | eucast.org/…/ExpertRules_V3.3_20240630_Enterobacterales.pdf | **lu** | Règle 7 (champ : E. coli, Klebsiella sauf K. aerogenes, Raoultella ; phénotype discordant), règle 8 (Enterobacterales sauf Salmonella), règle 10 |
| IDSA/ESCMID 2026 SAB, Table 1 | idsociety.org/…/table-of-definitions-08.17.2026.pdf | **lu** | « S. aureus is rarely a blood culture contaminant » ; « Any patient with ≥1 positive blood culture for S. aureus due to infection » |
| SSC 2026 (page SCCM) | sccm.org/…/surviving-sepsis-campaign-…-2026 | **lu** | Choc et sepsis probable ou certain : « immediately, ideally within 1 hr » ; sepsis **possible** sans choc : ≤ 3 h après investigation rapide |

---

## 3. Tableau d'audit élément par élément

Verdicts : **conforme** / **à corriger** / **à bloquer en brouillon** (jusqu'à correction) / **non vérifiable**.

### 3.1 Indication de traitement

| # | Élément (fichier:ligne) | Verdict | Source et repère vérifiés | Correction proposée |
|---|---|---|---|---|
| I1 | `SRC.spilf15Colo` (ecbu.ts:41) | conforme | SPILF 2015 p. 7, citation exacte | — |
| I2 | `SRC.spilf26Colo/Signes/Indeterminee/NonSpecifiques` (ecbu.ts:42-45) | conforme (citations) / à corriger (champ) | SPILF 2026 diapos 4, 5, 7, mot pour mot. **Cadre diapo 3 : homme, communautaire, hors sonde, hors immunodéprimé** | Ajouter « (IU masculine communautaire) » au repère. Quand le patient est une femme, ne pas présenter SPILF 2026 comme source principale : SPILF 2015 p. 7 et p. 11, et IDSA II/IV/V couvrent ce cas |
| I3 | `SRC.iuasR1` (ecbu.ts:46) | conforme | IUAS R.1 (A-III), p. 6 | — |
| I4 | `SRC.iuasR4`, repère « R.3 (A-II), R.4 (A-III) » (ecbu.ts:47) | **à corriger** | R.3 dit « évoquer une IUAS chez le sujet âgé devant l'apparition d'une aggravation des troubles cognitifs ou de la dépendance… associés ou non… à une fièvre ». Ce n'est **pas** un argument de non-traitement | Retirer R.3 du repère (garder R.4). Signaler la **divergence** IUAS R.3 / SPILF 2026 diapo 7 / IDSA V dans la branche « signes non spécifiques » (ecbu.ts:346-361) |
| I5 | `SRC.iuasR29`, `iuasR30`, `iuasR33` (ecbu.ts:49-51) | conforme | IUAS R.29 (D-II), R.30 (B-III), R.33 (« niveau de preuve élevé selon Grade ») | — |
| I6 | `SRC.iuasR34` (ecbu.ts:52) | conforme | R.34 (A-I) « sepsis sévère » (terminologie 2001) | Optionnel : noter l'équivalence approximative avec le « sepsis » de Sepsis-3 |
| I7 | `SRC.iuasR36` (ecbu.ts:53) | conforme (citation) / voir I15 | R.36 (A-III), p. 29 | — |
| I8 | `SRC.afuR1/Rtup/Ureteroscopie/Nlpc/Cystoscopie/Sonde` (ecbu.ts:54-59) | conforme | AFU Q1 R1 (AE), R3 (B), R7 (B), R8 (A), R10 (B), R17 (AE) | — |
| I9 | `SRC.afuDelai` Q3 R2 (grade C) (ecbu.ts:60) | conforme | « débutée 48 heures avant… total de 3 à 5 jours » | — |
| I10 | `SRC.afuMolecules` Q3 R4 (ecbu.ts:61) et actions (ecbu.ts:456) | conforme | Q3 R4 : 1re à 5e intention, ordre alphabétique | Ajouter le grade (AE) au repère |
| I11 | `SRC.hasGrossesse/hasGrossesseSuivi` (ecbu.ts:62-63) | conforme | HAS 13/05/2025 | — |
| I12 | `SRC.idsa19` « question II (strong) » (ecbu.ts:65) | conforme | II = femmes saines seulement | Dans la branche asymptomatique générale, citer aussi IV (sujet âgé) et VI (diabète), ou préciser la population |
| I13 | `SRC.idsaFievreSansFoyer` (ecbu.ts:67) et raison (ecbu.ts:328) | **à bloquer en brouillon** (déjà `brouillon`) + **à corriger** | IDSA V, remarque : « fever **and other systemic signs potentially consistent with a severe infection (sepsis)** and without a localizing source » | Raison : « L'IDSA 2019 ne se prononce que pour la fièvre **avec signes de sepsis** ; pour une fièvre sans sepsis, aucune source lue ne tranche. » Garder `brouillon`. Utiliser cette remarque dans la branche gravité (I14) |
| I14 | Branche gravité, `urinaireProbable` (ecbu.ts:158) | **à corriger** | IDSA V remarque (spectre urinaire **et** non urinaire) ; IUAS R.1 (sonde : IUAS si pas d'autre cause) | Hors sonde, « fièvre + autre foyer recherché négatif + sepsis » sans signe urinaire doit donner `qualification: 'indeterminee'`, `foyerUrinaire: false` et un avis pour le spectre. Ne garder « urinaire probable » que si des signes urinaires sont présents, si le foyer est déclaré, ou si le patient porte un dispositif (R.1) |
| I15 | Branche contamination, patient symptomatique : `attendre_resultat` (ecbu.ts:176-192) | **à bloquer en brouillon** | IUAS **R.35** (A-III) : infection parenchymateuse, probabiliste « dans les 12 heures » ; R.36 exclut les « situation[s] à risque » ; SPILF 2015 p. 23 (« refaire le prélèvement ») | Fièvre ou homme : « refaire l'ECBU **maintenant**, puis traitement probabiliste selon la forme sans attendre le résultat ». N'utiliser `attendre_resultat` que pour un tableau non fébrile et non grave, sans terrain à risque |
| I16 | Branche contamination, patient asymptomatique : `ne_pas_traiter` + « ne pas refaire d'ECBU », **sans appel à `exceptions()`** (ecbu.ts:181-190) | **à bloquer en brouillon** | AFU Q2 R7 et Q3 R5 (≥ 3 germes avant geste : « pas possible de recommander ou de ne pas recommander », AE) ; AFU p. 21 (« faisceau d'arguments… utilité de traiter un ECBU polymicrobien avant une chirurgie avec un matériel endo-urinaire ») ; SPILF 2015 p. 31 (seuil gravidique fixé pour écarter les contaminations) | Appeler les exceptions **avant** de conclure. Grossesse → `informations_insuffisantes` + « contrôler l'ECBU ». Geste `traiter_avant` → `informations_insuffisantes`, avec la mention « pas de recommandation possible (AFU Q2 R7, Q3 R5) ; si traitement : fosfomycine-trométamol, nitrofurantoïne, pivmécillinam, triméthoprime (Q3 R6) » |
| I17 | Recueil `collecteur` = contamination (ecbu.ts:176 ; libellé UI « Poche ou sac collecteur », Microbiologie.tsx:55) | conforme / à préciser | SPILF 2015 argumentaire p. 22 : jamais sur le **sac** ; mais « collecteur pénien » recommandé chez l'homme incontinent | Libellé « Sac collecteur de sonde » ; le collecteur pénien ne doit pas être classé contaminé d'office |
| I18 | Sonde + signes urinaires seuls (sans fièvre ni signe général) → `traiter` (ecbu.ts:198-233) | **à corriger** | IUAS R.1 : « **si et seulement s'ils présentent** une fièvre, une hypothermie, une hypotension, une altération de l'état mental, un malaise général ou une léthargie ». Les signes locaux ne relèvent de R.2 qu'**après ablation** du dispositif | Ne pas compter `signesU === 'nouveaux'` comme critère suffisant sur dispositif. Pour une douleur lombaire sur JJ/néphrostomie, renvoyer à un avis (source non lue : EAU CA-UTI). Effet de bord : avec des signes urinaires seuls, la question « autre foyer » n'est pas affichée (`Indication.tsx:23`) et la décision reste bloquée (à transmettre au relecteur 1) |
| I19 | Sonde asymptomatique → `ne_pas_traiter` (ecbu.ts:235-250) | conforme + divergence à afficher | IUAS R.29, R.33 ; AFU R17 ; IDSA XI (strong, low) | Signaler que l'IDSA XI ne fait **aucune recommandation** au moment de l'**ablation** de sonde (knowledge gap). Ne pas fusionner |
| I20 | Signes urinaires nouveaux → infection ; homme → forme fébrile/masculine (ecbu.ts:263-277) | conforme | SPILF 2026 diapo 4 (cadre homme) ; SPILF 2015 | Exception manquante : **IUAS R.17** (D-III : ne pas traiter les signes mictionnels sans fièvre après RTUP, RTUV ou pose de sonde endo-urétérale). Si `interventionRecente` le permet, la proposer en question |
| I21 | Foyer déclaré + signes inconnus → `traiter` (ecbu.ts:263, 268) | à corriger (mineur) | Principe du module (ecbu.ts:9 : « inconnu ne vaut jamais non ») | Conclure `informations_insuffisantes` et demander les signes, ou étiqueter « sur déclaration du prescripteur » avec une question bloquante |
| I22 | Fièvre inconnue → question « ≥ 38 °C ou < 36 °C » (ecbu.ts:336-345) | conforme | IUAS R.1 (hypothermie < 36 °C) | — |
| I23 | Signes non spécifiques sans fièvre → `ne_pas_traiter` (ecbu.ts:346-361) | conforme + divergence à afficher | IDSA V (strong, very low) ; SPILF 2026 diapos 5 et 7 ; IUAS R.4 | Afficher la divergence IUAS R.3 (A-II, voir I4) |
| I24 | Asymptomatique → colonisation (ecbu.ts:364-377) | conforme | SPILF 2015 p. 7 ; SPILF 2026 diapo 4 ; AFU R1 ; IDSA II ; IUAS R.19 (E-I) | Exception non recherchée : greffe rénale < 1 mois (IDSA VII : pas de recommandation ; IUAS R.27 « possible ») → `informations_insuffisantes` si les données existent |
| I25 | `femmeEnAgeDeProcreer` : seuil ≤ 50 ans (ecbu.ts:398) | à corriger (traçabilité) | Aucune source | Marquer explicitement « choix applicatif non sourcé » (commentaire et ARBITRAGES) |
| I26 | Grossesse → `traiter` (ecbu.ts:400-413) | **à corriger** | HAS : « ≥ 10⁵ UFC/ml monomicrobienne » ; SPILF 2015 p. 31 : « > 10⁵ », 2 cultures (1 acceptée) ; **streptocoque B quel que soit le titre → traitement + per-partum** | Conditionner `traiter` à `nbEspeces === 'une'` (et, si la donnée existe, à ≥ 10⁵). Si 2 espèces ou nombre inconnu → `informations_insuffisantes` (« contrôler l'ECBU »). Ajouter l'action « streptocoque B : prévoir l'antibioprophylaxie per-partum » |
| I27 | Neutropénie → avis (ecbu.ts:425-436) | **à corriger** | IDSA IX : « **high-risk** neutropenia (ANC < 100 cells/mm³, ≥ 7 days' duration following chemotherapy) », faible risque = pas de sur-risque ; **IUAS R.28 (D-III)** : ne pas dépister ni traiter chez les « autres immunodéprimés » | Ajouter la condition « haut risque » (sinon conduite standard). Afficher la divergence IDSA IX / IUAS R.28. Tester `traiter_avant` (AFU) **avant** la neutropénie, ou afficher les deux (AFU p. 18 : dérogation argumentée et tracée pour l'immunodéprimé) |
| I28 | Geste `traiter_avant` : durée 3 à 5 jours appliquée à **tous** les gestes (ecbu.ts:447-460) | **à corriger** | AFU **Q3 R3** (AE) : NLPC, traiter mais « ne permettent pas de définir la durée du traitement antibiotique préopératoire » ; Q2 R3 (AE) : ECBU dans les **10 jours** avant (15 j exceptionnellement) | Pour `nlpc` : remplacer « 3 à 5 jours » par « durée préopératoire non définie (AFU Q3 R3) ». Ajouter la condition « ECBU de moins de 10 jours ». Bilan urodynamique : R2 vise le « geste chirurgical » ; durée à confirmer (Egrot 2018 non lu) |
| I29 | Tableau `GESTES` (ecbu.ts:85-116) | conforme | AFU Q1 R2-R17 ; tableaux 5-6. Sonde JJ en `brouillon` avec la zone grise exacte (tableau « Oui » contre légende p. 27) | Biopsies de prostate : la source renvoie à CIAFU 2021 (Bruyère) et CCAFU 2022, non lus ; ajouter `remarque` |
| I30 | Divergence de durée IDSA (1-2 doses) / AFU (3-5 j) affichée (ecbu.ts:454) | conforme | IDSA XIII ; AFU Q3 R2 | Exemple de bonne pratique (divergence signalée, pas fusionnée) |
| I31 | `R_INDICATION_ECBU`, cystite (indication.ts:63-65) | **à corriger** | HAS femme enceinte : **cystite gravidique = traitement probabiliste**, molécules propres | Si `grossesse === 'oui'`, renvoyer à la fiche HAS « Femme enceinte : colonisation urinaire et cystite », et non à la fiche « Cystite de la femme » |
| I32 | Colonisation gravidique : amoxicilline 7 j si S ; ordre des alternatives (indication.ts:69-71) | conforme | HAS (1 g × 3, 7 j ; pivmécillinam, fosfomycine-trométamol, triméthoprime, nitrofurantoïne…) | Préciser « triméthoprime à éviter avant 10 SA » (HAS) |
| I33 | `R_SEPSIS_FOYER_INCONNU` (indication.ts:86-122) | conforme / non vérifiable (partie) | SSC 2026 lu (≤ 1 h si sepsis probable ou certain) | « ≥ 2 paires » et « réévaluation à 24-72 h » ne figurent pas dans les extraits cités : ajouter la source ou retirer. HAS 2025 : PDF non lu. Préciser que le sepsis « possible » relève du délai de 3 h |
| I34 | `R_PRELEVEMENT_SUPERFICIEL` (indication.ts:124-159) | conforme / à corriger (extrait) | HAS 2019 p. 18, 3.3.1 (fiche) ; IWGDF rec. 11 | Extrait IWGDF tronqué : la condition « when the goal is to reduce the risk of new infection, or to promote ulcer healing » est supprimée. La citer en entier. HAS 2019 : champ « plaies chroniques hors pied diabétique », à rappeler |
| I35 | Indication S. aureus (cocci-gram-positif.ts:53-68) | conforme | IDSA/ESCMID 2026 Table 1 (lu) | Optionnel : `urgence` aussi si `sepsis` (cohérence avec l'ECBU) |
| I36 | Indication SCN (cocci-gram-positif.ts:150-163) | conforme / à corriger (mineur) | Doern 2019 (non chiffré), IDSA 2009 Rec. 38, définition « au moins 2 séries, même antibiogramme » (info-antibio, via SRLF) | La qualification `infection` ne correspond pas au titre « probable » : passer à `infection_probable` |

### 3.2 Interprétation microbiologique

| # | Élément (fichier:ligne) | Verdict | Source et repère vérifiés | Correction proposée |
|---|---|---|---|---|
| M1 | Forçage BLSE → R C3G/C4G/aztréonam (outils.ts:197-200) | conforme + divergence à afficher | CA-SFM 2026 ch. 5.1, citation exacte. EUCAST v16.1 note 1 (« reported as tested ») et règle 7 (« report each as tested ») divergent | Dans la note, ajouter « (EUCAST : rendre tel quel ; divergence assumée par le CA-SFM) ». Exceptions CA-SFM non modélisées : K. oxytoca hyperOXY, K. pneumoniae hyperSHV |
| M2 | Forçage céphalosporinase → R C3G/ATM/pipé-tazo (outils.ts:201-204) | conforme + divergence | CA-SFM 2026 ch. 5.1 (citation exacte) ; EUCAST règle 6 : « report as tested » | Idem M1 |
| M3 | Forçage carbapénémase → R carbapénèmes (outils.ts:205-208) | conforme | CA-SFM 2026, avant-propos p. 5 (citation exacte) ; EUCAST : catégoriser tel quel mais préférer d'autres molécules | Mentionner la divergence. OXA-48 → céfotaxime/ceftriaxone R (« il semble prudent », CA-SFM) non modélisé |
| M4 | Forçage SARM **seulement si le phénotype est déclaré** (outils.ts:209-212) | **à corriger** | CA-SFM 5.7 : « méticillino-résistantes (phénotypiquement résistantes à la céfoxitine ou à l'oxacilline selon l'espèce) doivent être rendues résistantes à toutes les β-lactamines » ; EUCAST staphylocoques, règle 1 | Déclencher le forçage aussi sur céfoxitine R ou oxacilline R (familles staphylocoques) |
| M5 | `statutMeticilline` : `oxacilline ?? cefoxitine` ; « I » lu comme S (outils.ts:254-261) | **à bloquer en brouillon** (règle SAB/SCN/endocardite dépendante) | CA-SFM 5.7 (céfoxitine = dépistage de référence ; note 4 : discordance oxacilline/céfoxitine → vérifier) | R si l'**un** des deux est R ; discordance (un R et un S) → `undefined` + incohérence « à vérifier ». « I » n'existe pas pour ce dépistage → incohérence, pas S. Aligner `analyse.ts:182` et `guide.ts:303` sur la même fonction |
| M6 | Règle EUCAST 8 limitée aux Enterobacterales (outils.ts:216-219) | conforme | Règle 8 : « Enterobacterales except Salmonella spp. » | — |
| M7 | Résistances attendues lues R (outils.ts:220-228 ; analyse.ts:50-78) | conforme | ERP v1.2 Tables 1, 2, 4 ; CA-SFM ch. 2 p. 34-37 (oxacilline et daptomycine chez les Enterobacterales : CA-SFM seulement, l'extrait ERP ne les couvre pas, mais CA_NAT est bien cité) | — |
| M8 | Entérocoque amox R → pipé-tazo, imipénème, méropénème, ertapénème R (outils.ts:230-232) | conforme / à corriger (traçabilité) | CA-SFM 5.8 (« uréidopénicillines et carbapénèmes ») ; EUCAST entérocoques règle 1 : imipénème seulement | Ajouter une `note` avec la source (aujourd'hui, le forçage est silencieux) |
| M9 | Note catégorie I (outils.ts, `AIDE_I` guide.ts:88) | conforme / à compléter | CA-SFM ch. 3 : « …à forte posologie **ou si l'antibiotique est fortement concentré au site de l'infection** » ; Annexe 7 note 2 (cystite) | Compléter la définition (cystite : posologie standard possible pour les molécules à élimination urinaire) |
| M10 | « C3G R sans mécanisme » : alerte et incohérence citant la **règle EUCAST 7** (bgn-urinaire.ts:49-51 ; analyse.ts:154-158) | **à corriger** | Règle 7 = E. coli, Klebsiella (sauf K. aerogenes), Raoultella ; phénotype « R à une C3G/C4G **et S à une autre** » ; la remarque dit « most often caused by ESBL » (argument plutôt inverse) | Citer **CA-SFM 2026 p. 50** : « …en l'absence de synergie… évocatrice d'une souche hyperproductrice de céphalosporinase chromosomique (groupe 3 et E. coli) ou d'une céphalosporinase plasmidique » |
| M11 | `c3g = ceftriaxone ?? cefotaxime` (bgn-urinaire.ts:43 ; analyse.ts:149 ; guide.ts:242) | **à corriger** | EUCAST règle 7 (phénotype discordant → avertissement hors IU) ; CA-SFM p. 50 (une seule C3G SFP/R suffit à évoquer un mécanisme) | « C3G R » = au moins une C3G (céfotaxime, ceftriaxone, ceftazidime) R. Une discordance doit générer une incohérence et la question du mécanisme. Ne jamais proposer la ceftriaxone S si le céfotaxime est R sans arbitrage |
| M12 | Carbapénème non sensible sans carbapénémase → incohérence (analyse.ts:160-161) | conforme | CA-SFM Annexe 6 p. 158 (toute souche SFP/R à au moins un carbapénème = suspecte) | « Prévenir l'équipe d'hygiène » : source non citée (HCSP BHRe) |
| M13 | Cipro R / lévo S → incohérence (analyse.ts:162-163) | conforme | Règle 8 | — |
| M14 | Incohérences SARM / dépistage (analyse.ts:180-186) | à corriger | CA-SFM 5.7 note 4 | Ajouter la discordance **oxacilline vs céfoxitine** (voir M5) |
| M15 | Phénotypes inhabituels (analyse.ts:81-89) | conforme | ESP v1.1 2.1-2.7 (relu) | Manque : entérocoque « téicoplanine R, vancomycine S » (ESP 2.6 ; CA-SFM p. 82 « impossible ») |
| M16 | Streptocoques A/B/C/G : déduction amox ← péni G (analyse.ts:188-193 ; cocci-gram-positif.ts:218-219 ; guide.ts:315) | conforme / à corriger (cas R) | CA-SFM 5.10 2/B (citation exacte) ; EUCAST streptocoques, règle 1 : si R, « confirm species identification and determine… the MIC of the relevant agent » | N'appliquer la déduction que si péni G = S. Si R, pas de déduction (l'incohérence est déjà signalée) |
| M17 | Entérocoques, aminosides : repère « note 2 » (analyse.ts:206-207) | à corriger (repère) | ERP note 1 (LLR, tous entérocoques) ; note 2 = E. faecium seulement | Citer la note 1 (note 2 en plus pour E. faecium) |
| M18 | Question BLSE : libellés de compte rendu, aide « ne la déduisez pas » (guide.ts:147-157) | conforme | CA-SFM 5.1 ; libellé non normé (fiche) | Utilité : signaler la divergence sur la céfoxitine (voir P2) |
| M19 | Question céphalosporinase (guide.ts:158-168, 249) | conforme | CA-SFM 5.1 p. 50 ; SPILF 2023 diapo 10 | — |
| M20 | Questions carbapénémase, ERV, HNR (guide.ts:169-212, 258, 329-330) | conforme | CA-SFM avant-propos, p. 81 (> 128 mg/L, < 8 mm, croisée amikacine/tobramycine) ; HCSP 2019 | — |
| M21 | CMI pipé-tazo hors IU (guide.ts:253) | conforme / mineur | CA-SFM p. 49 : « souche productrice de BLSE » | La question s'affiche aussi pour une C3G R sans BLSE : préciser « si BLSE » |
| M22 | Groupe 3, céfépime (guide.ts:270-279) | conforme | CA-SFM p. 50 (liste et commentaire exacts) | La famille `enterobacterale_groupe3` ne contient que E. cloacae dans `OrganismeId` : à documenter |
| M23 | Pseudomonas : « I » attendu, forte posologie (guide.ts:281-287 ; analyse.ts:146) | conforme | EUCAST v16.1 (off-scale) ; CA-SFM 5.2 | — |
| M24 | Staphylocoques : vancomycine CMI (guide.ts:305) | conforme | EUCAST detection v2.01 p. 33 ; v16.1 note 1 | — |
| M25 | Aztréonam en cas d'allergie : « si l'allergie ne concerne ni la ceftazidime ni une réaction retardée sévère » (guide.ts:266) | non vérifiable | Aucune source citée | Citer la source (fiches allergie) ou retirer la condition |

### 3.3 Pertinence thérapeutique (« sensible ≠ indiqué », pas d'extrapolation)

| # | Élément (fichier:ligne) | Verdict | Source et repère vérifiés | Correction proposée |
|---|---|---|---|---|
| T1 | Pas d'extrapolation céfotaxime → ceftriaxone (bgn-urinaire.ts:71-84) | conforme | Principe (aucune règle de déduction lue) | Combiner avec M11 |
| T2 | Témocilline « non retenue » hors IU (analyse.ts:165) | **à corriger** | EUCAST v16.1 : une seule ligne (urinaire) ; **CA-SFM 2026 p. 49 : ligne « Témocilline (autres infections) » 0,001/16** (E. coli, Klebsiella sauf K. aerogenes, Raoultella, P. mirabilis) ; la ligne urinaire du CA-SFM vise les IU « **sans signes de gravité** » | Motif : « proposée par la SPILF uniquement en foyer urinaire ; CA-SFM : catégorisation possible hors IU (forte posologie), EUCAST : non ». Signaler aussi qu'en **forme grave**, la ligne urinaire 8/16 du CA-SFM ne s'applique pas |
| T3 | Céfoxitine « E. coli ou Proteus » (analyse.ts:166-167 ; guide.ts:154, 255 ; bgn-urinaire.ts:105) | **à corriger** | SPILF 2026 diapos 17 et 24 : « seulement si E. coli ou Proteus » ; SPILF 2023 diapo 6 : « uniquement pour E. coli » ; **CA-SFM 2026 p. 51 : valeurs critiques thérapeutiques « validées que pour E. coli »** | Ne pas citer les deux SPILF ensemble comme une seule règle. Pour P. mirabilis : option `conditionnelle` ou `brouillon`, avec la mention « catégorisation CA-SFM non validée pour Proteus ; divergence SPILF 2023/2026 » |
| T4 | Groupe 3 : C3G et pipé-tazo non retenues (analyse.ts:168-173) | conforme | CA-SFM p. 50 | — |
| T5 | Aminosides non retenus hors IU (analyse.ts:174-177) | conforme | EUCAST règle 10 (relu) ; CA-SFM p. 54 | — |
| T6 | Céfixime et staphylocoque (analyse.ts:185) | conforme | CA-SFM 5.7 (relu) | — |
| T7 | Streptocoques : aminosides et ciprofloxacine (analyse.ts:195-199) | conforme | ERP 4.6 note 1 ; EUCAST v16.1 (« report resistant without prior testing ») | — |
| T8 | « Résistance aux C3G » non BLSE : pipé-tazo `conditionnelle`, céfoxitine exclue (bgn-urinaire.ts:47-55, 103) | conforme | CA-SFM p. 50 ; SPILF 2023 diapos 5-6 ; SPILF 2026 diapo 22 (C3G-R par céphalosporinase : céfépime ou témocilline) | ESCMID 2022 : texte intégral non lu (403, selon la fiche) ; laisser la mention « d'après SPILF 2023 » |
| T9 | Antibiogramme non affiché comme essentiel si « ne pas traiter » ou SCN sur 1 série (guide.ts:232-233, 292-298) | conforme | Cohérent avec l'indication | — |
| T10 | Pas de généralisation espèce → genre (germes.ts) | conforme | Familles explicites ; `gallolyticus` classé avec les viridans, conforme à la feuille EUCAST « Viridans group streptococci » (groupe S. bovis inclus) | Renommer `strepto_oral` en `strepto_viridans_bovis` (lisibilité) |
| T11 | Registre : `IDSA-ESCMID-2026-SAB` sans l'URL de la Table 1 | à corriger (mineur) | Table 1 = `table-of-definitions-08.17.2026.pdf` | Ajouter cette URL en note du registre |

---

## 4. Corrections par priorité

### P1 — à corriger avant tout usage (ou à passer en `brouillon` d'ici là)
1. **`outils.ts:254-261` `statutMeticilline`** (et `outils.ts:209-212`) : céfoxitine R **ou** oxacilline R → SARM ; discordance → inconnu + incohérence ; « I » → incohérence. Forçage β-lactamines R aussi sur céfoxitine R. Sources : CA-SFM 5.7, note 4 ; EUCAST staphylocoques règle 1. Aligner `analyse.ts:182` et `guide.ts:303`.
2. **`ecbu.ts:176-192`** (contamination) : appeler `exceptions()` avant de conclure (grossesse, geste `traiter_avant` → `informations_insuffisantes`, AFU Q2 R7/Q3 R5-R6) ; patient fébrile → refaire l'ECBU puis probabiliste (IUAS R.35), et non `attendre_resultat`.
3. **`ecbu.ts:400-413`** (grossesse) : exiger un ECBU monomicrobien (HAS) ; sinon `informations_insuffisantes` + contrôle ; ajouter la conduite streptocoque B / per-partum (SPILF 2015 p. 31).
4. **`ecbu.ts:158`** (sepsis) : hors dispositif et sans signe urinaire ni foyer déclaré, pas de « foyer urinaire probable » ; spectre urinaire et non urinaire (IDSA V, remarque).
5. **`ecbu.ts:328` et `ecbu.ts:67`** : corriger l'attribution à l'IDSA (remarque conditionnée au sepsis) ; garder `brouillon`.
6. **`bgn-urinaire.ts:43`, `analyse.ts:149`, `guide.ts:242`** : toute C3G R (céfotaxime, ceftriaxone, ceftazidime) déclenche la voie « C3G R » ; discordance → incohérence (EUCAST règle 7 ; CA-SFM p. 50).

### P2 — à corriger (attribution, condition ou divergence)
7. `ecbu.ts:198-233` : sur dispositif, les signes urinaires seuls ne suffisent pas (IUAS R.1, « si et seulement si ») ; signaler au relecteur 1 le blocage d'interface (`Indication.tsx:23`).
8. `ecbu.ts:425-436` : neutropénie à haut risque seulement (IDSA IX) ; divergence IUAS R.28 ; ordre par rapport au geste (AFU p. 18).
9. `ecbu.ts:447-460` : NLPC sans durée préopératoire définie (AFU Q3 R3) ; condition « ECBU ≤ 10 jours » (Q2 R3).
10. `ecbu.ts:47` : retirer R.3 du repère ; afficher la divergence IUAS R.3 / SPILF 2026 / IDSA V (`ecbu.ts:346-361`).
11. `indication.ts:63-65` : grossesse → fiche HAS « Femme enceinte » (cystite gravidique probabiliste).
12. `analyse.ts:166-167`, `guide.ts:154, 255`, `bgn-urinaire.ts:105` : céfoxitine — séparer SPILF 2026 (E. coli, Proteus), SPILF 2023 (E. coli) et CA-SFM p. 51 (validée pour E. coli seulement) ; Proteus en option conditionnelle.
13. `analyse.ts:165` : témocilline — motif corrigé (CA-SFM « autres infections » ; ligne urinaire « sans signes de gravité »).
14. `bgn-urinaire.ts:51`, `analyse.ts:158` : remplacer la règle EUCAST 7 par CA-SFM p. 50.
15. `ecbu.ts:235-250` : divergence IDSA XI (ablation de sonde, pas de recommandation) ; `ecbu.ts:263-277` : exception IUAS R.17.
16. `outils.ts:197-208` : mentionner la divergence EUCAST (« report as tested ») dans les notes BLSE, céphalosporinase et carbapénémase.

### P3 — traçabilité et finitions
17. `ecbu.ts:398` : âge ≤ 50 ans = choix applicatif non sourcé, à documenter.
18. `ecbu.ts:42-45` : préciser le champ SPILF 2026 (homme, communautaire) ; `ecbu.ts:65` : population IDSA II.
19. `outils.ts:230-232` : note sourcée pour le forçage entérocoque ; `analyse.ts:206` : ERP note 1 au lieu de note 2.
20. `cocci-gram-positif.ts:219` et `analyse.ts:192` : déduction streptocoques A/B/C/G uniquement si péni G S.
21. `analyse.ts:81-89` : ajouter « téicoplanine R / vancomycine S » (entérocoque).
22. `guide.ts:88` : définition SFP complète (concentration au site ; cystite).
23. `guide.ts:253` : CMI de l'association « si BLSE ».
24. `guide.ts:266` : sourcer ou retirer la condition aztréonam/allergie.
25. `indication.ts:110-111` : sourcer « ≥ 2 paires » et « 24-72 h » ; `indication.ts:142` : extrait IWGDF complet.
26. `cocci-gram-positif.ts:163` : `infection_probable`.
27. `Microbiologie.tsx:55` : libellé « sac collecteur de sonde » (le collecteur pénien n'est pas un critère de contamination).
28. Registre : URL de la Table 1 IDSA/ESCMID 2026 ; grade AE de Q3 R4.

---

## 5. Divergences entre sources à afficher (sans fusion)

| Sujet | Source A | Source B | Où l'afficher |
|---|---|---|---|
| Sujet âgé, aggravation cognitive avec bactériurie | IUAS R.3 (A-II) : évoquer une IUAS | SPILF 2026 diapo 7 ; IDSA V : chercher une autre cause, ne pas traiter | ecbu.ts:346-361 |
| Neutropénie | IDSA IX : pas de recommandation (haut risque) | IUAS R.28 (D-III) : ne pas dépister ni traiter | ecbu.ts:425-436 |
| Ablation de sonde vésicale | AFU R17 ; IUAS R.29 : ne pas dépister ni traiter | IDSA XI : pas de recommandation | ecbu.ts:235-250 |
| Durée avant geste | AFU Q3 R2 : 3 à 5 j (NLPC : non définie) | IDSA XIII : 1 ou 2 doses | déjà affichée (ecbu.ts:454), à compléter pour la NLPC |
| Céfoxitine et BLSE | SPILF 2026 : E. coli ou Proteus | SPILF 2023 : E. coli ; CA-SFM p. 51 : validée pour E. coli seulement | analyse.ts:167, guide.ts:154/255 |
| Témocilline hors IU | EUCAST : pas de catégorisation | CA-SFM 2026 : ligne « autres infections » | analyse.ts:165 |
| BLSE, céphalosporinase, carbapénémase | CA-SFM : interpréter R | EUCAST : rendre tel quel | outils.ts:197-208 |
| Entérocoque amox R | CA-SFM : uréidopénicillines et carbapénèmes R | EUCAST règle 1 : uréidopénicillines et imipénème | outils.ts:230 |
| Durée colonisation gravidique | HAS, SPILF : 7 j (fosfomycine : dose unique) | IDSA III : 4 à 7 j | indication.ts:70 |

---

## 6. Ce qui n'a pas pu être vérifié

- **ESCMID 2022 (BGN multirésistants)** : texte intégral bloqué selon la fiche (403). Je n'ai pas réessayé ni contourné. La conduite « C3G R » repose donc sur SPILF 2023 (diaporama), lui-même dérivé de l'ESCMID.
- **ESC 2023 endocardite** : bloqué (403) selon la fiche ; hors du cœur de ce lot.
- **CIAFU 2021** (Bey : sondes JJ et néphrostomie ; Bruyère : biopsies de prostate), **CCAFU 2022** (Ploussard), **Egrot 2018** (bilan urodynamique) : seulement cités par l'AFU 2026, non lus. La conduite pour les biopsies et la durée du traitement avant un bilan urodynamique restent non vérifiées.
- **Argumentaire AFU 2026** : non lu (seule la synthèse l'a été).
- **REMIC 7** et **CLSI M47** : payants ; aucun seuil microbiologique de contamination n'a été lu dans une source de microbiologie.
- **HAS 2025 sepsis** (PDF) et **article SSC 2026** (payant) : seule la page SCCM a été relue.
- **Grades SPILF 2026** : absents du diaporama ; article Lafaurie 2026 non lu.
- **Non relus par moi** (fiches de l'équipe jugées fiables, non revérifiées dans l'original) : HAS cystite de la femme, HAS/SPILF/SFD 2019 plaies, IWGDF 2023 (hors troncature relevée en I34), Doern 2019, IDSA 2009 Rec. 38, tableaux EUCAST v16.1 (XLSX), règles expertes EUCAST staphylocoques, entérocoques et streptocoques 2025 (citées d'après la fiche S3-S5).
- Le CA-SFM 2026 a été lu par recherche plein texte : les tableaux pivotés (résistances naturelles p. 34-37) n'ont pas été relus par coordonnées. Je m'appuie sur la fiche de l'équipe.

---

## 7. Matrice des NOUVELLES règles

Statut proposé : **verifiee_ia** = conforme en l'état ; **brouillon** = à bloquer jusqu'à correction ; **verifiee_ia après correction** = garder si la correction P1/P2 indiquée est faite.

| Identifiant | Conditions | Exceptions | Données nécessaires | Conclusion | Source + version | Statut proposé |
|---|---|---|---|---|---|---|
| R-INDICATION-ECBU / gravité (ecbu.ts:157-173) | ECBU positif, sans hémoculture positive ; sepsis ou choc | — | gravité, signes urinaires, fièvre, dispositif, autre foyer | urgence ; ATB dans l'heure ; foyer urinaire probable seulement avec signes urinaires, foyer déclaré ou dispositif | SSC 2026 (page SCCM) ; IUAS 2015 R.34, R.4 ; IDSA 2019 V (remarque) | **brouillon** jusqu'à I14 |
| … / contamination (ecbu.ts:175-192) | recueil sur sac collecteur ou ≥ 3 espèces | **grossesse, geste `traiter_avant`** (manquantes) ; fièvre → R.35 | recueil, nb d'espèces, signes, fièvre, grossesse, geste | refaire l'ECBU ; ne pas traiter si asymptomatique (hors exceptions) | SPILF 2015 argumentaire p. 22-23 ; IUAS p. 10, R.35, R.36 ; AFU 2026 Q2 R7, Q3 R5-R6 | **brouillon** jusqu'à I15-I16 |
| … / dispositif + signes (ecbu.ts:195-234) | dispositif endo-urinaire ; fièvre, hypothermie ou signe général | autre foyer identifié ; non recherché | dispositif, fièvre, signes généraux, autre foyer | infection probable si aucune autre cause | IUAS 2015 R.1, R.4, p. 9-10 | **verifiee_ia après correction** I18 (exclure les signes urinaires seuls) |
| … / dispositif asymptomatique (ecbu.ts:235-250) | dispositif ; ni fièvre ni signe général ni signe urinaire | grossesse, geste | idem + grossesse, geste | ne pas traiter, y compris avant ablation ou changement de sonde vésicale | IUAS R.1, R.29, R.33 ; AFU 2026 R17 ; IDSA 2019 XI | verifiee_ia (afficher la divergence IDSA XI sur l'ablation) |
| … / signes urinaires (ecbu.ts:262-277) | signes urinaires récents (ou foyer déclaré) | **IUAS R.17** (après RTUP/RTUV/JJ) | signes, fièvre, sexe, grossesse | cystite (femme apyrétique) ou IU fébrile/masculine | SPILF 2015 ; SPILF 2026 diapo 4 ; HAS cystite | verifiee_ia après correction I20-I21 et I31 |
| … / foyer déclaré sans signe (ecbu.ts:278-288) | foyer déclaré, pas de signe urinaire, pas de fièvre | — | signes, fièvre | informations insuffisantes | SPILF 2015 p. 7 ; SPILF 2026 diapo 4 | verifiee_ia |
| … / fièvre + autre foyer (ecbu.ts:302-312) | fièvre, pas de signe urinaire, autre foyer identifié | — | fièvre, autre foyer | ne pas traiter la bactériurie | IUAS R.4 ; SPILF 2015 p. 7 | verifiee_ia |
| … / fièvre sans foyer (ecbu.ts:324-334) | fièvre, pas de signe urinaire, recherche négative, pas de sepsis | — | idem | traiter (spectre : avis SMIT) | **aucune source lue pour la fièvre sans sepsis** ; IDSA V remarque = sepsis ; SPILF 2026 diapo 5 (divergence) | **brouillon** (déjà) + texte corrigé (I13) |
| … / signes non spécifiques (ecbu.ts:346-361) | signes non spécifiques ; ni fièvre ni signe urinaire | grossesse, geste | signes, fièvre, grossesse, geste | ne pas traiter ; chercher une autre cause | IDSA 2019 V ; SPILF 2026 diapos 5, 7 ; IUAS R.4 (divergence R.3) | verifiee_ia après correction I4 |
| … / asymptomatique (ecbu.ts:363-377) | ni signe urinaire, ni fièvre, ni sepsis | grossesse, geste, neutropénie (greffe rénale < 1 mois : non recherchée) | idem | ne pas traiter, ne pas contrôler | SPILF 2015 p. 7 ; SPILF 2026 diapo 4 ; AFU R1 ; IDSA II ; IUAS R.19 | verifiee_ia |
| … / exception grossesse (ecbu.ts:400-423) | grossesse oui ; ou inconnue chez une femme ≤ 50 ans | **ECBU non monomicrobien** (manquante) ; streptocoque B | grossesse, âge, nb d'espèces, germe | traiter selon antibiogramme, 7 j ; contrôle 8-10 j puis mensuel | HAS c_2722927 (MAJ 13/05/2025) ; SPILF 2015 p. 7, 31 | **brouillon** jusqu'à I26 |
| … / exception neutropénie (ecbu.ts:425-436) | neutropénie déclarée | geste `traiter_avant` (ordre) | neutropénie (profondeur, durée) | avis SMIT/hématologie | IDSA 2019 IX (haut risque) ; IUAS R.28 (divergence) | verifiee_ia après correction I27 |
| … / geste sans recommandation (ecbu.ts:437-446) | LEC, transplantation, prolapsus/incontinence, Rezum, HIFU | — | geste | décision urologue + SMIT | AFU 2026 Q1 R5.2, R9, R14.1, R16 ; tableau 6 | verifiee_ia |
| … / geste `traiter_avant` (ecbu.ts:447-460) | geste de la liste AFU « ECBU + traiter » | sonde JJ/néphrostomie (zone grise) ; **NLPC (durée)** ; ≥ 3 germes | geste, antibiogramme, date de l'ECBU | traiter selon antibiogramme, J-2 → J0 (max J+2) | AFU 2026 Q1, Q3 R2, R4 ; IDSA XIII (divergence de durée) | verifiee_ia après correction I28 (sonde JJ : brouillon) |
| … / geste à préciser ou inconnu (ecbu.ts:461-480) | geste « autre » ou non renseigné | — | geste | informations insuffisantes | AFU R1 ; SPILF 2026 diapo 4 | verifiee_ia |
| R-SEPSIS-FOYER-INCONNU (indication.ts:86-122) | sepsis ou choc ; foyer inconnu ; aucun germe ; pas d'ECBU évalué | sepsis « possible » (3 h) | gravité, foyer, germe | urgence ; avis réa/SMIT | SSC 2026 (page SCCM, MAJ 23/03/2026) ; HAS 2025 (non lu) | verifiee_ia (sourcer « 2 paires » et « 24-72 h ») |
| R-PRELEVEMENT-SUPERFICIEL (indication.ts:124-159) | prélèvement superficiel positif ; pas d'hémoculture positive ni de prélèvement profond ou urinaire positif | — | signes d'infection locale | non → ne pas traiter ; oui → avis ; inconnu → question | HAS/SPILF/SFD 2019 § 3 ; IWGDF/IDSA 2023 rec. 1a, 5, 11 | verifiee_ia (extrait IWGDF complet) |
| R-BACTERIEMIE-S-AUREUS, indication (cocci-gram-positif.ts:53-68) | S. aureus identifié dans ≥ 1 hémoculture | — | identification | traiter (urgence si choc) | IDSA/ESCMID 2026 Table 1 (17/08/2026) | verifiee_ia |
| R-BACTERIEMIE-SCN, indication (cocci-gram-positif.ts:150-163) | SCN en hémoculture | S. lugdunensis ; matériel ; sepsis | nombre de séries, matériel, gravité | 1 série : refaire les hémocultures (urgence si sepsis) ; ≥ 2 séries : traiter | IDSA 2009 Rec. 38 ; Doern 2019 ; info-antibio SPILF 2019 (via SRLF 2020) | verifiee_ia (qualification `infection_probable`) |
| Lecture BLSE / céphalosporinase / carbapénémase (outils.ts:197-208) | mécanisme rapporté « présent » | K. oxytoca hyperOXY, K. pneumoniae hyperSHV (non modélisés) | phénotypes, S/I/R | C3G/C4G/ATM R ; C3G/ATM/pipé-tazo R ; carbapénèmes R | CA-SFM 2026 V1.0 ch. 5.1, avant-propos p. 5 | verifiee_ia (ajouter la mention de la divergence EUCAST) |
| Lecture SARM + `statutMeticilline` (outils.ts:209-212, 254-261) | phénotype SARM ou dépistage céfoxitine/oxacilline | discordance oxacilline/céfoxitine | phénotype, céfoxitine, oxacilline | SARM → β-lactamines R sauf ceftaroline/ceftobiprole | CA-SFM 2026 ch. 5.7 (note 4) ; EUCAST staphylocoques règle 1 (nov. 2025) | **brouillon** jusqu'à M4-M5 |
| Règle 8 FQ (outils.ts:213-219) | Enterobacterales, ciprofloxacine R | Salmonella (non modélisée) | ciprofloxacine | toutes FQ R | EUCAST Expert Rules v3.3 règle 8 | verifiee_ia |
| Résistances attendues (outils.ts:220-228 ; analyse.ts:50-78) | germe identifié ; molécule attendue R rendue S/I | — | organisme, S/I/R | lue R + incohérence | EUCAST ERP v1.2 ; CA-SFM 2026 ch. 2 ; EUCAST v16.1 (tirets) | verifiee_ia |
| Entérocoque amox R (outils.ts:230-232) | entérocoque, amoxicilline R | — | amoxicilline | pipé-tazo et carbapénèmes R | CA-SFM 2026 ch. 5.8 ; EUCAST entérocoques règle 1 | verifiee_ia (ajouter une note sourcée) |
| C3G R sans mécanisme (bgn-urinaire.ts:43-55 ; analyse.ts:149-159) | Enterobacterale ; C3G R ; BLSE non rapportée | céphalosporinase rapportée → voie AmpC | C3G (**toutes**), phénotypes | conduite « C3G R » ; pas de céfoxitine ; pipé-tazo conditionnelle ; demander le mécanisme | CA-SFM 2026 p. 50 ; SPILF 2023 diapos 5-6 ; SPILF 2026 diapo 22 | **brouillon** jusqu'à M10-M11 |
| Céfoxitine, BLSE urinaire (bgn-urinaire.ts:105 ; analyse.ts:166-167) | BLSE documentée ; foyer urinaire ; E. coli (ou Proteus) | Proteus : non validé CA-SFM | organisme, BLSE, céfoxitine | option céfoxitine 6 g/j | SPILF 2026 diapos 17, 24 ; SPILF 2023 diapo 6 ; CA-SFM p. 51 | verifiee_ia pour E. coli ; **brouillon** pour Proteus |
| Témocilline non retenue hors IU (analyse.ts:165) | Enterobacterale ; foyer non urinaire | — | foyer | non proposée | SPILF 2023/2026 (usage urinaire) ; EUCAST v16.1 ; CA-SFM p. 49 (divergence) | verifiee_ia après correction T2 |
| Groupe 3 : C3G et pipé-tazo non retenues (analyse.ts:168-173 ; guide.ts:270-279) | E. cloacae complex | — | organisme | céfépime privilégié | CA-SFM 2026 ch. 5.1 p. 50 | verifiee_ia |
| Aminosides non retenus hors IU (analyse.ts:174-177) | Enterobacterale ; foyer non urinaire | — | foyer | association uniquement | EUCAST v3.3 règle 10 ; CA-SFM p. 54 | verifiee_ia |
| Phénotypes inhabituels (analyse.ts:81-89, 180-207) | R à une molécule « attendue S » | — | organisme, S/I/R | à confirmer par le laboratoire | EUCAST ESP v1.1 ; CA-SFM 5.7, 5.8, 5.10 | verifiee_ia (compléter téicoplanine/vancomycine) |
| Strepto A/B/C/G : amox ← péni G (cocci-gram-positif.ts:218-219 ; analyse.ts:188-193) | S. pyogenes, S. agalactiae, groupes C/G ; péni G S | péni G R : pas de déduction | péni G, amoxicilline | amoxicilline lue S | CA-SFM 2026 ch. 5.10 2/B ; EUCAST streptocoques règle 1 | verifiee_ia après correction M16 |
| Questions guidées par famille (guide.ts:226-338) | famille de germe ; contexte (urinaire, grave, endocardite, allergie, prothèse) | ne pas traiter ; SCN sur 1 série | isolat, contexte | questions essentielles / complémentaires | CA-SFM 2026 ; EUCAST v16.1 ; SPILF 2023/2026 ; SPILF/AEPEI 2025 | verifiee_ia (guide.ts:266 : non sourcé) |

## Suites données (2026-11-05)

Les corrections P1 et P2 sont appliquées et testées (`src/tests/relectures-v2.test.ts`).

- **M5 / M4 (méticilline)** : dépistage fondé sur les résultats bruts ; céfoxitine ou oxacilline R → R ; discordance ou « I » → statut inconnu et incohérence signalée ; forçage des bêta-lactamines sur céfoxitine/oxacilline R.
- **I15 / I16 (contamination)** : exceptions examinées ; fièvre → ECBU refait maintenant puis conduite habituelle (IUAS R.35) ; avant geste à risque → informations insuffisantes (AFU Q2 R7, Q3 R5).
- **I26 (grossesse)** : traitement seulement si l'ECBU est monomicrobien ; streptocoque B → antibioprophylaxie per-partum (SPILF 2015 p. 31).
- **I13 / I14 (IDSA V)** : remarque citée pour la fièvre avec sepsis seulement ; sans sepsis, conclusion « informations insuffisantes » en brouillon ; foyer urinaire non présumé en sepsis sans signe urinaire.
- **M11 / M10** : C3G la plus défavorable (céfotaxime, ceftriaxone, ceftazidime) ; discordance signalée ; CA-SFM p. 50 cité à la place de la règle EUCAST 7.
- **I18, I21, I25, I27, I28, I31, I34, I36, I2, I4, M8, M14, M16, M17, T2, T3, T11** : corrigés comme proposé (sonde : signes systémiques exigés ; déclaration du prescripteur étiquetée ; seuil d'âge marqué non sourcé ; neutropénie à haut risque et divergence IUAS R.28 ; NLPC et ECBU de moins de 10 jours ; cystite gravidique ; citation IWGDF complète ; SCN « infection probable » ; SPILF 2026 limitée à l'homme ; IUAS R.3 retirée des arguments de non-traitement et affichée comme divergence ; notes de forçage ; repères ERP ; témocilline hors voie urinaire et céfoxitine Proteus en brouillon ; URL de la Table 1).
- **Non vérifiables, inchangés** : ESCMID 2022, ESC 2023, CIAFU 2021, Egrot 2018 (bilan urodynamique laissé en brouillon), REMIC.
