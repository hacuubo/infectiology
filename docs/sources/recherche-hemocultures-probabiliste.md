# Recherche documentaire — Hémoculture positive à l'examen direct : antibiothérapie probabiliste, candidémie, bacilles à Gram positif

Date de consultation de toutes les sources : **2026-11-11**.
Méthode : WebSearch pour repérer les textes ; métadonnées via l'API Europe PMC et Unpaywall. Les PDF et diaporamas ont été **téléchargés** dans un dossier neuf du scratchpad (`recherche-hemoc/`) puis convertis en texte (`pdftotext` ; XML des diapositives pour les `.pptx`). Les pages HTML (PMC, IDSA, SPILF) ont été téléchargées et converties en texte. Chaque extrait entre guillemets a été **lu** dans ce texte extrait, dans sa langue d'origine. Ce qui n'a pas été lu est marqué **NON VÉRIFIÉ**. Les mises en page en colonnes (figures, algorithmes) sont signalées : l'association ligne/colonne y est reconstituée.

Ce travail ne refait pas `recherche-bacteriemies-foyers.md`. Il en reprend les conclusions des sections 2 (BGN : aucune recommandation probabiliste dédiée ; ESCMID 2022 et SPILF 2023 ne visent que le traitement documenté) et 9.1-9.2 (SSC 2026 : délais 1 h / 3 h ; HAS 2025 : antibiothérapie adaptée « au site, aux germes, à l'origine communautaire ou non, au risque de bactéries multirésistantes et à l'écologie locale »).

Convention des statuts d'accès :
- **consultee** : texte intégral ou partie pertinente effectivement lu.
- **contenu_non_lisible** : URL atteinte, contenu non exploitable (403, paywall, ouvrage payant).
- **introuvable** : document recherché sans succès.

Les sources sont citées par leur `id`. Les sources **déjà au registre** (`src/clinical/sources/registre.json`) ne sont pas recréées : `SSC-2026`, `SSC-2021`, `SRLF-SFAR-2014-RFE-antibiotiques-rea`, `DOERN-2019-contamination`, `ESCMID-2022-BGN-MDR`, `SPILF-2023-BGN-MDR-diapo`, `SPILF-GPIP-2021-durees`, `SRLF-2020-catheters`. Les nouvelles sont dans `docs/sources/registre-hemocultures-probabiliste.json`.

⚠ Ceci est une recherche documentaire, pas un avis médical. Aucune règle de l'application ne doit en être tirée sans relecture par un infectiologue.

---

## 0. Panorama des textes en vigueur

| Question | Texte en vigueur au 2026-11-11 | Statut / remarque |
|---|---|---|
| Couverture empirique SARM / BMR / antifongique dans le sepsis | **SSC 2026** (`SSC-2026`), lu cette fois en **texte intégral** (version Intensive Care Med) | Remplace SSC 2021. Les recommandations 2021 spécifiques au **SARM** (n° 17-18) et à la **double couverture Gram négatif** (n° 19-21) **n'apparaissent pas** dans le texte 2026 lu ; elles sont remplacées par une recommandation générique « pathogène MDR » (n° 25-26) |
| Anti-SARM et carbapénème en probabiliste (France, réanimation) | **RFE SRLF/SFAR 2014** (`SRLF-SFAR-2014-RFE-antibiotiques-rea`, déjà au registre) | Seul texte français trouvé qui énonce des critères de risque SARM et BLSE pour le probabiliste. Champ : réanimation. Aucune actualisation trouvée |
| Hémoculture positive à l'examen direct (CGP amas / chaînettes / BGN) avant identification | **Aucune recommandation nationale ou européenne trouvée** | Seul document trouvé : un **protocole local** (CHU de Nancy, V1.06/2019) hébergé sur le site de la SPILF. Pas une recommandation |
| REMIC (SFM), chapitre hémocultures | REMIC 7.1 (2022), cité dans un cours DESC 2023 | **contenu_non_lisible** (ouvrage payant). Les tableaux REMIC cités dans le cours sont des images |
| Candidémie de l'adulte | **ECMM/ISHAM/ASM 2025** (Cornely, Lancet Infect Dis 2025;25:e280-e293) ; **IDSA 2016** (Pappas, CID 2016;62:e1-e50, page IDSA « CURRENT ») ; **SPILF 2021** (diaporama du comité des référentiels, d'après COMAI AP-HP 2019) | Les trois concordent sur l'échinocandine en 1re intention. Divergences sur le fond d'œil, l'échographie, le point de départ de la durée et le délai du relais |
| Candidose invasive : textes anciens | Conférence de consensus SFAR/SPILF/SRLF 2004 ; ESCMID 2012 | 2004 : lue, **dépassée sur la 1re intention** (fluconazole). ESCMID 2012 : non lue (403) ; absente de la liste ESCMID 2021-2026 |
| Bacilles à Gram positif en hémoculture | **Aucune recommandation dédiée trouvée** | Seule source : revue de guidance ASM `DOERN-2019-contamination` (déjà au registre, lue le 2026-11-05 pour `recherche-indication.md` §9.3) |

---

## 1. Surviving Sepsis Campaign 2026 — couverture empirique (`SSC-2026`, déjà au registre)

- **Titre exact** : « Surviving Sepsis Campaign: international guidelines for management of sepsis and septic shock 2026 ». Prescott HC, Antonelli M, et al.
- **Version lue** : Intensive Care Med (2026) 52:863-936, https://doi.org/10.1007/s00134-026-08361-1. Co-publication Crit Care Med (doi 10.1097/CCM.0000000000007075) : en-tête lu « This article is simultaneously published in the journals Intensive Care Medicine… and Critical Care Medicine ».
- **URL** : https://link.springer.com/article/10.1007/s00134-026-08361-1 ; PDF https://link.springer.com/content/pdf/10.1007/s00134-026-08361-1.pdf (marqué « Open Access » sur la page, téléchargé le 2026-11-11, 74 pages).
- **Accès** : consultee (texte intégral). **Le tableau 1 (« Table of statements », p. 864-869) est une image** : non extrait. Les énoncés ci-dessous viennent du corps du texte.
- **Vigueur** : en vigueur ; remplace SSC 2021.
- Repères : pagination de la revue (p. 863 = page 1 du PDF).
- ➜ **Mise à jour suggérée du registre** (non faite ici) : l'entrée `SSC-2026` indique « article (payant) non lu » ; le texte intégral ICM est en accès libre.

### 1.a SARM
- **Aucune recommandation spécifique au SARM** dans le texte 2026 lu. Le SARM est inclus dans la définition des MDR (p. 885) : « MDR pathogens, defined as those with acquired non-susceptibility to least one agent in three of more antimicrobial categories [215, 216], include Acinetobacter baumannii, extended-spectrum -lactamase (ESBL)-producing Gram-negative bacteria, carbapenem-resistant Enterobacterales (CRE), vancomycin-resistant EnterococcusR pseudomonas, and methicillin-resistant S. aureus (MRSA) » (coquilles d'extraction conservées : « β » perdu, « Enterococcus » et « pseudomonas » accolés).
- Bénéfice tiré surtout des données SARM (p. 885) : « This effect was driven by the observational data evaluating MRSA infection. There was no observed difference in short-term mortality for patients with A. baumannii, ESBL-producing Gram-negative bacteria, or CRE treated with agents active against these pathogens vs. agents that were not. »

### 1.b Pathogènes multirésistants (dont BGN) — recommandations 25 et 26 (p. 884, « New »)
- **Rec. 25** : « For adults with sepsis or septic shock at high risk of infection with a specific multidrug-resistant (MDR) pathogen, we "suggest" using empirical antimicrobial therapy with coverage for this MDR pathogen (conditional recommendation, very low certainty evidence) ».
- **Remarque de la rec. 25 (définition du haut risque)** : « Risk factors for MDR pathogens include colonization with the MDR pathogen of concern, previous infection with the MDR pathogen of concern, prolonged use of broad-spectrum antibiotics, and prolonged hospitalization in a unit with a high prevalence of the MDR pathogen of concern ».
- **Texte (p. 885), avec une fenêtre temporelle** : « Patient-related risk factors for MDR pathogens include colonization with the MDR pathogen of concern in the prior year, infection with the MDR pathogen of concern in the prior year, prolonged use of broad-spectrum antibiotics, and prolonged hospitalization in a hospital with a high prevalence of the MDR pathogen of concern ». « Prolonged » n'est pas chiffré.
- **Rec. 26** : « For adults with sepsis or septic shock at low risk of infection with a specific MDR pathogen, we "suggest against" using empirical antimicrobial therapy with coverage for this MDR pathogen (conditional recommendation, very low certainty evidence) ».
- **Usage sélectif** (p. 885) : « MDR coverage in every adult with sepsis or septic shock would be unacceptable and result in increased harm » ; « selective use of empiric MDR coverage is warranted in patients with risk factors for MDR infection, including in many patients with hospital-acquired infections. »
- **Pas de choix de molécule** (p. 885) : « Specific guidance on antibiotic selection is beyond the scope of this guideline. » Renvoi aux recommandations ESCMID (réf. 216 = Paul 2022) et IDSA (réf. 237 = Tamma 2024). « consultation with infectious disease specialists and/or clinical microbiologists should be considered ».
- **Double couverture Gram négatif** : **aucun énoncé trouvé** dans le texte 2026 (recherche « double », « combination », « two antimicrobials »). Le sort des rec. 2021 n° 19-21 (retirées ou reportées dans le tableau 1 image) est **NON VÉRIFIÉ**.

### 1.c Antifongique empirique
- **Rec. 27 (p. 885, « Revisited »)** : « For adults with sepsis or septic shock, we "suggest against" using empirical antifungal therapy (conditional recommendation, low certainty evidence) ».
- **Remarque** : « Empiric antifungal therapy should be considered on a case-by-case basis in selected patients with sepsis or septic shock and risk factors for fungal infection, including immunosuppression, prolonged use of antibiotics, prolonged hospitalization, and intra-abdominal sources of infection ».
- **Rec. 32 (p. 888, « New »)** : « we "suggest against" using Candida fungal biomarkers to guide initiation of empiric antifungal therapy (conditional recommendation, low certainty evidence) ». Le texte cite la recommandation candidose 2025 (réf. 248 = Cornely 2025, Lancet Infect Dis 25:e280-e293) : le (1,3)-β-D-glucan seul « is not recommended for initiating antifungal therapy ».
- **Hémocultures de contrôle (p. 877)** : « Repeat cultures are recommended to confirm clearance of bacteremia or fungemia for Staphylococcus aureus, Staphylococcus lugdunensis, and Candida species ».
- **Anaérobies (p. 886, rec. 28-29, « New »)** : sans facteur de risque, « we "suggest" using an empiric antibiotic regimen without anaerobic coverage » ; facteurs de risque listés : « intra-abdom inal or deep seated gynecological/obstetric source of infection, necrotizing soft-tissue infection, head and neck infection, and CNS abscesses or empyema ».
- **Tests rapides (p. 887, rec. 31)** : « we "suggest" using pathogen-specific rapid diagnostic tests on a case-by-case basis in selected patients » (conditionnelle, faible).

### 1.d Comparaison avec SSC 2021 (`SSC-2021`, déjà au registre ; texte Europe PMC PMC8486643 relu le 2026-11-11)
- **Rec. 17** : « For adults with sepsis or septic shock at high risk of methicillin resistant staph aureus (MRSA), we recommend using empiric antimicrobials with MRSA coverage over using antimicrobials without MRSA coverage » — « Best Practice statement ».
- **Rec. 18** : « For adults with sepsis or septic shock at low risk of methicillin resistant staph aureus (MRSA), we suggest against using empiric antimicrobials with MRSA coverage… » — « Weak recommendation, low quality of evidence ».
- **Facteurs de risque SARM 2021 (rationnel)** : « prior history of MRSA infection or colonisation, recent IV antibiotics, history of recurrent skin infections or chronic wounds, presence of invasive devices, haemodialysis, recent hospital admissions and severity of illness ». Prévalence : « ranging from ~ 2% in Western Europe to 10% in North America ».
- **Rec. 19** : « For adults with sepsis or septic shock and high risk for multidrug resistant (MDR) organisms, we suggest using two antimicrobials with gram-negative coverage for empiric treatment over one gram-negative agent » (faible, très faible).
- **Rec. 20** : « …low risk for MDR organisms, we suggest against using two Gram-negative agents for empiric treatment » (faible, très faible).
- **Rec. 21** : « we suggest against using double gram-negative coverage once the causative pathogen and the susceptibilities are known » (faible, très faible).
- **Facteurs de risque MDR 2021** : « proven infection or colonisation with antibiotic-resistant organisms within the preceding year, local prevalence of antibiotic-resistant organisms, hospital-acquired/healthcare associated (versus community-acquired infection), broad-spectrum antibiotic use within the preceding 90 days, concurrent use selective digestive decontamination (SDD), travel to a highly endemic country within the preceding 90 days… and hospitalisation abroad within the preceding 90 days ».
- **Rec. 22-23 (antifongique)** : haut risque « we suggest using empiric antifungal therapy over no antifungal therapy » ; bas risque « we suggest against empiric use of antifungal therapy » (faibles, faible).
- **Évolution 2021 → 2026** : SARM et double couverture BGN fondus dans une recommandation « MDR » générique ; plus de « 90 jours » chiffrés (2026 : « prior year » pour colonisation/infection, « prolonged » non chiffré) ; antifongique : un seul énoncé « suggest against », le haut risque passe en remarque « case-by-case ».

---

## 2. RFE SRLF/SFAR 2014 — probabiliste anti-SARM et carbapénèmes (`SRLF-SFAR-2014-RFE-antibiotiques-rea`, déjà au registre)

- **Titre** : « Stratégies de réduction de l'utilisation des antibiotiques à visée curative en réanimation (adulte et pédiatrique) » — RFE SRLF/SFAR avec GFRUP, SFM, SPILF, SF2H, juin 2014.
- **URL** : https://www.infectiologie.com/UserFiles/File/medias/Recos/2014-RFE-ATB-Rea.pdf — consultee (re-téléchargé le 2026-11-11). **Vigueur** : en vigueur (aucune actualisation trouvée). Champ : **réanimation**. Grades : « Accord fort / faible ».
- **Anti-SARM, communautaire (p. 13, d) « TRAITEMENT PROBABILISTE », item 1)** : « Il ne faut pas utiliser les anti-SMR dans le traitement probabiliste des infections communautaires vraies (Accord fort). »
- **Haut risque SARM (p. 13, item 2)** : « Il faut prendre en compte la possibilité d'un Staphylococcus aureus résistant à l'oxacilline (SARM) dans les infections sévères associées aux soins (patients hémodialysés chroniques, patients porteurs de plaies chroniques, d'un cathéter de longue durée et chez les patients de long séjour) (Accord fort). »
- **Texte de l'item 2** : « Il faut prendre en compte la possibilité d'un SARM dans les infections sévères chez les patients sortis précédemment de l'hôpital (dans l'année) porteurs de SARM. »
- **Nosocomial en réanimation (p. 13, item 3)** : « Il faut utiliser les anti-SARM selon l'épidémiologie locale du service pour le traitement probabiliste des infections nosocomiales acquises en réanimation (Accord fort). »
- **Carbapénème, communautaire (p. 11, b) item 1)** : « En traitement probabiliste, en cas d'infection bactérienne communautaire suspectée, il ne faut pas prescrire de carbapénème (Accord fort). Toutefois, un carbapénème peut être considéré chez les patients qui auraient l'association : · d'un antécédent connu de colonisation/infection à entérobactérie productrice de bêta-lactamase à spectre étendu (BLSE), ou à P. aeruginosa résistant à la ceftazidime (caz-R), sur un prélèvement de moins de 3 mois, quel que soit le site, · et d'un sepsis sévère ou choc septique (Accord faible). »
- **Carbapénème, associé aux soins (p. 11, item 2)** : ne pas le prescrire « uniquement sur le caractère nosocomial » mais si « au moins 2 » facteurs parmi : « le traitement antérieur par céphalosporine de troisième génération (C3G), fluoroquinolones (FQ) (dont monodose) ou association pipéracilline-tazobactam (TZP) dans les 3 mois », « le portage d'une entérobactérie productrice de BLSE, ou d'un P. aeruginosa caz-R, sur un prélèvement de moins de 3 mois », « une hospitalisation à l'étranger dans les 12 mois », vie en « EHPAD » ou « SLD » avec « sonde à demeure et/ou d'une gastrostomie », « une épidémie en cours dans le secteur de soins à bactérie multi-résistante » (Accord fort).
- **FQ (p. 12, item 5)** : « Dans le choc septique, en cas d'association avec une bêta-lactamine, il faut préférer les aminosides plutôt qu'une FQ (Accord fort) ».
- Aucune mention d'une hémoculture positive à l'examen direct dans les passages lus (l'examen direct n'y est traité que pour les prélèvements respiratoires).

---

## 3. Hémoculture positive à l'examen direct — recommandations françaises ou européennes

### 3.1 Résultat de la recherche
- Recherches : site SPILF (page « Recommandations » relue le 2026-11-11 : rubriques sepsis/fongiques), SFM/REMIC, SRLF/SFAR, ESCMID (liste des recommandations publiées 2021-2026), WebSearch en français et en anglais.
- **Aucune recommandation nationale ou européenne dédiée** à l'antibiothérapie probabiliste selon l'examen direct d'une hémoculture (CGP en amas, en chaînettes, BGN, levures, BG+) : **introuvable**.
- La page SPILF ne liste aucun texte « bactériémie » ou « hémoculture ». Rubrique sepsis : HAS 2025 (déjà au registre).

### 3.2 REMIC (SFM) (`SFM-REMIC-2022-hemocultures`, nouveau)
- **Accès** : contenu_non_lisible (ouvrage payant, non trouvé en ligne).
- Existence et version attestées indirectement : un cours DESC 2023 (§3.4) porte la mention « REMIC 7.1 - 2022 » sur des diapositives « Exemples d'interprétation des résultats d'hémocultures avec le prélèvement unique » / « …multiple ». Ces tableaux sont des **images** : contenu NON VÉRIFIÉ.
- Un rapport QUAMIC/SFM 2026 (vu seulement dans un résumé de moteur de recherche, **non lu**) classerait les hémocultures en examens urgents « REMIC v7 ».

### 3.3 Protocole local CHU de Nancy (`CHU-Nancy-2019-algorithme-hemocultures`, nouveau)
- **Titre** : « Traitement probabiliste des bactériémies sur l'examen direct des hémocultures (hors neutropénie fébrile) » — V1.06/2019, 2 feuillets.
- **URL** : https://www.infectiologie.com/UserFiles/File/groupe-atb/algorithme-de-pec-bacteriemies-chu-nancy.pdf — consultee.
- **Nature** : **protocole hospitalier local**, hébergé dans l'espace « groupe-atb » du site SPILF. **Pas une recommandation.** Non gradé. Date 2019 : antérieur à SSC 2026.
- **Mise en page** : organigramme en colonnes ; l'association des cases est **reconstituée** (confiance moyenne). Extraits sûrs :
  - **CGP en amas — « Infection ? »** : « Clinique ou porte d'entrée compatible (fièvre, infection cutanée..) », « Vitesse de pousse <24h », « 2 flacons positifs ». « Aucun item » → « Pas d'antibiotique » ; « Répéter les hémocultures à 48h si fièvre ».
  - **CGP en amas — « 1 item »** : « Signes de sepsis/choc septique? », « Hémodialysé? », « Matériel prothétique <1an? » → « Non » : « Cloxacilline » ; « Oui » : « Cloxacilline + Vancomycine* » ; « *Si DFG < 40mL/min  daptomycine ».
  - Une case liste aussi « Valvulopathie », « Antécédent d'endocardite ou patient toxicomane », « Matériel cardiaque prothétique ou endovasculaire » : sa branche de sortie n'est **pas lisible** dans le texte extrait.
  - **Allergie (amas)** : « Pennicillines  céfazoline » ; « Bêta-lactamines contre-indiquées (BL) vancomycine ».
  - **CGP en chaînettes** : branches « Communautaire » / « Nosocomiale » selon le « Point d'appel » (respiratoire, cutanée, urinaire, digestif, vasculaire) ; molécules lues : « Amoxicilline », « Amoxicilline-clavulanate », « Céfotaxime », « Pipéracilline-tazobactam » ; « Prélèvement antérieur avec E. faecium < 1an » → « Vancomycine » ; « Si choc septique: + gentamicine ». Correspondance point d'appel ↔ molécule : **non fiable** à l'extraction.
  - **BGN — communautaire** : « Digestif  Céfotaxime + métronidazole » ; « Urinaire ou autre  Céfotaxime ».
  - **BGN — « Nosocomiale ou antibiothérapie <30j »** : « Digestif  Pipéracilline-tazobactam (PTZ) » ; « Urinaire ou autre  Céfépime » ; « Prélèvement <3 mois à E-BLSE » → « Méropénem + Amikacine » si sepsis/choc, « PTZ si souche S » ; « Sepsis/choc septique : + Amikacine » ; « Si contre-indication aux bêta-lactamines  avis infectiologue ».
  - **Levures** : items « Sepsis/choc septique? », « Exposition antérieure au fluconazole? », « Prélèvements <6 mois avec un Candida fluconazole résistant? », « Matériel cardiaque prothétique ou endovasculaire », « Antécédent d'endocardite ou patient toxicomane » ; « Aucun item » → « Fluconazole IV ou PO » ; « 1 item » → « Caspofungine » ; puis « Enlever les cathéters et culture », « Hémocultures jusqu'à stérilisation, à démarrer 48-72h après le début du traitement », « Echocardiographie + Fond oeil », « Avis infectiologue ».
  - **BG+** : « Grossesse ou néonatalogie ou méningite d'allure bactérienne? » → « Oui » : « Amoxicilline IV » ; sinon « Infection? » : « Vitesse de pousse <24h », « 2 flacons positifs », « Clinique ou porte d'entrée compatible (fièvre, infection profonde/digestive, méningite) », « Immunodéprimé », « Dispositifs vasculaires ou matériel prothétique vasculaire » ; « Aucun item » → « Pas d'antibiotique », « Répéter les hémocultures à 48h si fièvre » ; « 1 item » → « Avis infectiologue ».
  - Commun : « Contrôle de la porte d'entrée » ; « Répéter hémocultures à 48h: si S.aureus, évolution défavorable, ou suspicion d'endocardite » ; « Avis infectiologue (lors de l'identification) ».
- **Aucune dose** dans ce protocole.

### 3.4 Cours DESC 2023, A. Le Monnier, « Bonnes pratiques de prélèvement des hémocultures : quand, pour qui, comment ? » (`SPILF-DESC-2023-hemocultures-LeMonnier`, nouveau)
- **URL** : https://www.infectiologie.com/UserFiles/File/formation/desc/2023/seminaire-mars-2023/t16-mardi-28.03/conf-6-le-monnier-hemocultures-v-pdf.pdf — consultee. DES MIT, 28 mars 2023. **Support de formation, pas une recommandation.**
- Chronologie : « Examen Direct » → « Antibiothérapie probabiliste orientée » ; identification J1-2 ; antibiogramme J1-2 → « Antibiothérapie adaptée ».
- Grille d'interprétation (mise en page en colonnes) : « Peu probable » : « Corynebacterium spp Bacillus spp », « Propionibacterium acnes » ; « contamination cutanée +++ » ; « Sauf si présence sur 2, 3 flacons ou + » ; « Probable » : « S. aureus S. pneumoniae Entérobactéries P. aeruginosa », « C. albicans Streptocoques Méningocoque ». Source de cette grille non indiquée sur la diapositive (REMIC ? NON VÉRIFIÉ).
- Hémoculture de contrôle : « pour s'assurer de la négativation (ex S. aureus et Candida) ou confirmer un doute sur une contamination => 2 à 4 jours après le début du traitement puis tous les jours jusqu'à l'obtention d'hémoculture négatives ».

### 3.5 Consultés, non retenus
- **Groupe transversal sepsis 2006** (« Prise en charge initiale des états septiques graves de l'adulte et de l'enfant », ADARPEF, GFRUP, SAMU de France, SFAR, SFMU, SPILF, SRLF ; « V8 Oct. 2006 ») — https://www.infectiologie.com/UserFiles/File/spilf/recos/2006-sepsis.pdf — lu par recherche de mots-clés. Seule mention : hémocultures « en demandant chaque fois que possible un examen direct par Gram, qui orientera le traitement antibiotique ». Rien sur la conduite selon l'examen direct de l'hémoculture. Antérieur à Sepsis-3 et HAS 2025 : non ajouté au registre.

---

## 4. Candidémie de l'adulte

### 4.1 ECMM/ISHAM/ASM 2025 — Global guideline (`ECMM-ISHAM-ASM-2025-candidose`, nouveau)
- **Titre exact** : « Global guideline for the diagnosis and management of candidiasis: an initiative of the ECMM in cooperation with ISHAM and ASM ». Cornely OA, Sprute R, Bassetti M, et al. Lancet Infect Dis 2025 ; publié en ligne le 13 février 2025 ; doi 10.1016/S1473-3099(24)00749-7 ; pagination finale 25:e280-e293 (référence lue dans SSC 2026, réf. 248). Type d'article : « Review ».
- **URL** : https://doi.org/10.1016/S1473-3099(24)00749-7 (site Lancet : 403). **PDF lu** : copie de la version publiée (CC-BY selon Unpaywall) sur le dépôt KU Leuven, https://lirias.kuleuven.be/retrieve/4cfc0f21-9518-42e6-8cc7-729a94d7b2b1.
- **Accès** : consultee (article principal). **Annexe (appendix, preuves détaillées) non lue.**
- **Version** : le PDF porte « This online publication has been corrected. The corrected version first appeared at thelancet.com/infection on February 26, 2025 ». Un résumé de moteur de recherche signale une **autre correction (23 avril 2025)** sur l'isavuconazole de la figure 2 : NON VÉRIFIÉ ; la copie lue pourrait la précéder. L'isavuconazole n'est donc pas cité ici.
- **Vigueur** : en vigueur (citée par SSC 2026). Échelle : « Strongly / Moderately / Marginally recommended ». Repères : pages de la version en ligne.
- **1re intention (p. 7)** : « Anidulafungin, caspofungin, micafungin, and rezafungin are strongly recommended as first-line treatment for candidaemia. » ; « The spectrum of activity is considered identical between these agents ».
- **Doses de 1re intention (figure 2, p. 7)** : « Anidulafungin* 200 mg once a day on day 1; 100 mg daily from day 2 » ; « Caspofungin* 70 mg once a day on day 1; 50 mg daily from day 2 » ; « Micafungin* 100 mg daily » ; « Rezafungin 400 mg once a week in week 1; 200 mg weekly from week 2 ». (Figure en colonnes : l'appartenance de chaque ligne au niveau de force n'est pas lisible.)
- **Fluconazole (p. 9)** : « Fluconazole is only marginally recommended for initial treatment of candidaemia because of concerns arising from high rates of treatment failure and increased antifungal resistance to this drug in some regions. »
- **Si échinocandines indisponibles (p. 7)** : « liposomal amphotericin B (LAmB), fluconazole, and voriconazole are moderately recommended ».
- **2e ligne (p. 9)** : « LAmB is strongly recommended as a treatment for candidaemia in patients who cannot be treated with echinocandins due to proven or suspected antifungal drug resistance, treatment failure, or intolerance. »
- **Cathéter (p. 11)** : « Central venous catheter removal in patients with candidaemia is strongly recommended as early as possible when catheter removal can be performed safely. » Figure 2 (p. 7) : « Central venous catheter removal As early as possible (<48-72 h) if in place ».
- **Hémocultures de contrôle (figure 2, p. 7)** : « Daily follow-up blood cultures until three consecutive negative days If blood from day five is positive, repeat search for intravascular or other uncontrolled source ».
- **Durée (p. 8)** : « The recommended duration of treatment of candidaemia without deep-seated or metastatic foci is 14 days from the first day of persistently negative blood cultures (ie, three consecutive negative blood cultures). Blood cultures should be performed daily to document the timing of bloodstream clearance of Candida. »
  - ⚠ **Incohérence interne** : la figure 2 (p. 7) écrit « Traditional duration 14 days after last positive blood culture ».
- **Relais oral (p. 8-9)** : « Switching to an oral azole (fluconazole or voriconazole) is moderately recommended after 5 or more days of echinocandin treatment in patients meeting the following criteria: (1) haemodynamically stable; (2) documented clearance of Candida from the bloodstream; (3) non-neutropenic; (4) source control (eg, central venous catheter removal) has been performed; (5) able to tolerate oral azole treatment; and (6) susceptibility confirmed to the selected azole. »
- **Fond d'œil et échographie (figure 1, p. 5)** : cases « Candidaemia Fundoscopy* » et « Echocardiography ». Notes : « *For patients with ocular symptoms, persistent candidaemia, immunosuppression, and those who are not able to verbalise complaints. » ; (symbole perdu à l'extraction) « For patients with suspected endocarditis (including clinical signs such as skin lesions or new murmur), persistent candidaemia, presence of valve disease, and those with a cardiac implantable device. » → **fond d'œil et échographie ciblés, non systématiques**. Niveau de force (couleur de la figure) : NON VÉRIFIÉ.
- **Incertitude reconnue (p. 8)** : études nécessaires sur les « risk categories for screening echocardiography, fundoscopy, and ultrasound of suspected foci ».
- **Diagnostic (p. 3, p. 5)** : « two to three blood culture sets with each 20 mL blood volume should be collected when investigating potential candidaemia » (« strongly recommended » pour les méthodes culturales) ; figure 1 : « Direct gram stain of any positive blood culture ».

### 4.2 IDSA 2016 — Pappas et al. (`IDSA-2016-candidose`, nouveau)
- **Titre exact** : « Clinical Practice Guideline for the Management of Candidiasis: 2016 Update by the Infectious Diseases Society of America ». Clin Infect Dis 2016;62(4):e1-e50, doi 10.1093/cid/civ933 ; publié en ligne le 16 décembre 2015.
- **URL** : https://pmc.ncbi.nlm.nih.gov/articles/PMC4725385/ (texte intégral, lu) ; page IDSA https://www.idsociety.org/practice-guideline/candidiasis/ (lue : statut « CURRENT »). Article OUP : 403.
- **Accès** : consultee. **Vigueur** : en vigueur (page IDSA « CURRENT » ; aucune mise à jour annoncée trouvée).
- Repères : Executive Summary, section I (« What Is the Treatment for Candidemia in Nonneutropenic Patients? ») et II.
- **Rec. 1** : « An echinocandin (caspofungin: loading dose 70 mg, then 50 mg daily; micafungin: 100 mg daily; anidulafungin: loading dose 200 mg, then 100 mg daily) is recommended as initial therapy (strong recommendation; high-quality evidence) ».
- **Rec. 2** : « Fluconazole, intravenous or oral, 800-mg (12 mg/kg) loading dose, then 400 mg (6 mg/kg) daily is an acceptable alternative to an echinocandin as initial therapy in selected patients, including those who are not critically ill and who are considered unlikely to have a fluconazole-resistant Candida species (strong recommendation; high-quality evidence) ».
- **Rec. 3** : « Testing for azole susceptibility is recommended for all bloodstream and other clinically relevant Candida isolates. »
- **Rec. 4 (relais)** : « Transition from an echinocandin to fluconazole (usually within 5–7 days) is recommended for patients who are clinically stable, have isolates that are susceptible to fluconazole (eg, C. albicans ), and have negative repeat blood cultures following initiation of antifungal therapy (strong recommendation; moderate-quality evidence ) ».
- **Rec. 6** : « Lipid formulation amphotericin B (AmB) (3–5 mg/kg daily) is a reasonable alternative if there is intolerance, limited availability, or resistance to other antifungal agents ».
- **Rec. 10 (fond d'œil)** : « All nonneutropenic patients with candidemia should have a dilated ophthalmological examination, preferably performed by an ophthalmologist, within the first week after diagnosis (strong recommendation; low-quality evidence) ».
- **Rec. 11 (hémocultures)** : « Follow-up blood cultures should be performed every day or every other day to establish the time point at which candidemia has been cleared (strong recommendation; low-quality evidence) ».
- **Rec. 12 (durée)** : « Recommended duration of therapy for candidemia without obvious metastatic complications is for 2 weeks after documented clearance of Candida species from the bloodstream and resolution of symptoms attributable to candidemia (strong recommendation; moderate-quality evidence) ».
- **Rec. 13 (cathéter)** : « Central venous catheters (CVCs) should be removed as early as possible in the course of candidemia when the source is presumed to be the CVC and the catheter can be removed safely; this decision should be individualized for each patient (strong recommendation; moderate-quality evidence) ».
- **Neutropénique, rec. 14** : échinocandine en initial (« strong recommendation; moderate-quality evidence ») ; **rec. 16** : fluconazole « for patients who are not critically ill and have had no prior azole exposure (weak recommendation; low-quality evidence) ».
- **Échocardiographie** : **aucune occurrence** de « echocardio », « transesophageal » ou « TEE » dans le texte PMC extrait (352 000 caractères). Pas de recommandation d'échographie systématique trouvée.

### 4.3 SPILF 2021 — diaporama « Bon usage des antifongiques » (`SPILF-2021-antifongiques-diapo`, nouveau)
- **Titre** : « BON USAGE DES ANTIFONGIQUES — Diaporama de synthèse réalisée par le comité des référentiels de la SPILF le 13 10 2021 à partir des Recommandations COMAI AP-HP ». Source citée (diapo 2) : « RECOMMANDATIONS SUR LE BON USAGE DES ANTIFONGIQUES - AP-HP Mise à jour 30/08/2019 », coordination F. Lanternier.
- **URL** : https://www.infectiologie.com/UserFiles/File/spilf/recos/spilf-groupe-recos-antifongiques.pptx — consultee (listé sur la page SPILF « Recommandations », rubrique fongiques : « bon usage des antifongiques (recos AP-HP 2021) »).
- **Vigueur** : en vigueur (seul texte « fongique » listé par la SPILF hors hématologie). Non gradé. Texte AP-HP source : non lu.
- **Mesures systématiques (diapo 3)** : « Ablation immédiate du cathéter ou de la chambre implantable » ; « Contrôle de la négativation des hémocultures » ; « Echographie trans-thoracique à J5-J7 » ; « Echographie trans-oesophagienne en cas de doute à l'ETT ou fièvre/ candidémie persistante à 72h » ; « Doppler veineux à réaliser en cas de signe de thrombose ou de candidémie persistante à 72h » ; « Fond d'œil pour les non neutropéniques dans les 8 jours » ; « Traiter, y compris si 1 seule hémoculture positive (périphérique, sur cathéter ou sur chambre implantable) ».
- **Commentaires SPILF (diapo 4)** : « Un FO est recommandé pour toute candidémie. » ; « Chez le patient neutropénique, le FO est recommandé dès la sortie d'aplasie. » ; « La négativation des hémocultures est attendue à 72h après le début d'un traitement adapté et ablation du cathéter. »
- **Non neutropénique, 1re ligne probabiliste (diapo 5)** : « CASPOFUNGINE Adulte 70 mg dose de charge puis 50 mg/j ou 70 mg/j si poids > 80kg » ; « 150 mg dose de charge puis 1 mg/kg/j à discuter chez les patients les plus graves (qSOFA≥2) » ; « Ou MICAFUNGINE Adulte 100 mg/j » ; « 150 mg/j à discuter chez les patients les plus graves (qSOFA≥2) » ; « Pendant 14 jours à partir de la 1ère hémoculture négative ».
- **Alternative (diapo 5)** : « Si pas de choc, pas d'ATCD de prise d'azolés ou porte d'entrée urinaire » : « FLUCONAZOLE IV 12 mg/kg à J1 puis 6 mg/kg/j ».
- **Cathéter non retirable (diapo 5)** : « Si ablation de cathéter ou chambre implantable impossible » : « AMPHOTERICINE B liposomale 3 mg/kg/j Ou ECHINOCANDINES ».
- **Désescalade (diapo 5)** : « Désescalade après 3 à 5 jours si stabilité clinique + souche sensible + négativation des HC + ablation du cathéter » : « FLUCONAZOLE IV ou PO 12 mg/kg à J1 puis 6 mg/kg/j » « Si C. albicans, C. parapsilosis, C. tropicalis sensible » ; « Fluconazole 12 mg/kg/j pour C. glablatra non R (CMI<32) » (coquille « glablatra » d'origine).
- **Urinaire (diapo 3 et 9)** : « Les échinocandines et l'Amphotéricine B liposomale n'ont pas de place dans le traitement des candidémies à point de départ urinaire ».
- **Endocardite (diapo 11)** : « AMPHOTERICINE B liposomale 3-5 mg/kg/j +/- FLUCYTOSINE 25 mg/kg x 4/j » ou « Forte dose d'Echinocandine » (« CASPOFUNGINE Adulte 150 mg/j » ; « MICAFUNGINE 150 mg/j ») ; « Chirurgie précoce à discuter systématiquement » ; « Avis spécialisé pour la durée ».
- Mise en page en tableau (« Traitement » / « Commentaires ») : rattachement ligne ↔ colonne reconstitué.

### 4.4 Conférence de consensus SFAR/SPILF/SRLF 2004 (`SFAR-SPILF-SRLF-2004-candidoses`, nouveau)
- **Titre** : « Prise en charge des candidoses et aspergilloses invasives de l'adulte » — conférence de consensus commune SFAR, SPILF, SRLF, 13 mai 2004 (Institut Pasteur), résumé.
- **URL** : https://www.infectiologie.com/UserFiles/File/spilf/recos/antifongiques-court-04.pdf — consultee.
- **Vigueur** : **incertain** — non retiré formellement, mais **dépassé** sur la 1re intention (fluconazole « Triflucan® IV 12 mg/kg/j » en tête d'algorithme ; échinocandine « en deuxième intention »). Non listé sur la page SPILF actuelle (rubrique fongiques : seul le diaporama 2021). Ne pas utiliser pour une règle.
- Extraits (§1.2.1 « Candidémie ») : « Il n'y a pas d'argument pour une association (B3) » ; « La durée de traitement est de 2 semaines après la dernière hémoculture positive et la disparition des symptômes (C3) » ; « Le retrait du cathéter intravasculaire est recommandé (B3). »

### 4.5 Textes non lus
- **ESCMID 2012**, « ESCMID* guideline for the diagnosis and management of Candida diseases 2012: non-neutropenic adult patients », Clin Microbiol Infect 2012;18 Suppl 7, doi 10.1111/1469-0691.12039 (`ESCMID-2012-candida-non-neutropenique`) : **contenu_non_lisible** (403). Absent de la page ESCMID des recommandations publiées (liste 2021-2026, lue). Vigueur : incertain. ECMM 2025 (p. 1) le cite parmi les « Current international recommendations ».
- **ESICM/ESCMID 2019**, « ESICM/ESCMID task force on practical management of invasive candidiasis in critically ill patients », Intensive Care Med 2019, doi 10.1007/s00134-019-05599-w (`ESICM-ESCMID-2019-candidose-rea`) : **contenu_non_lisible** (Unpaywall : « closed »).
- **Recommandations françaises SFAR/SRLF/SPILF « 2018/2019 » sur la candidose invasive du patient non neutropénique en réanimation** : **introuvable** (Europe PMC, WebSearch). Un résumé de recherche évoque une fiche SFAR « Prise en charge des candidoses en réanimation » (janvier 2014) : **non trouvée, non lue**.
- **COMAI AP-HP 2019** (texte source du diaporama SPILF) : non recherché en texte intégral (application mobile) — NON VÉRIFIÉ.

---

## 5. Bacilles à Gram positif en hémoculture (Corynebacterium, Bacillus, Cutibacterium, Listeria)

- **Recommandation dédiée : introuvable** (SPILF, SFM, ESCMID, IDSA ; WebSearch en anglais).
- **Déjà documenté** dans `recherche-indication.md` §9.3 (lu le 2026-11-05), source `DOERN-2019-contamination` (revue de guidance ASM, non gradée, Clin Microbiol Rev 2019;33(1):e00009-19, https://pmc.ncbi.nlm.nih.gov/articles/PMC6822992/). Citations reprises de ce fichier, **non relues le 2026-11-11** :
  - « most species of CoNS, most species of Corynebacterium and related genera, Bacillus spp. other than Bacillus anthracis, Micrococcus spp., and Cutibacterium acnes and related species. These organisms may be considered contaminants unless recovered from multiple blood cultures obtained in sequence ».
  - « Staphylococcus aureus, Streptococcus pneumoniae, beta-hemolytic streptococci, Listeria monocytogenes, Escherichia coli and other members of the Enterobacteriaceae, Pseudomonas aeruginosa… and Candida species rarely represent contamination. »
- **Concordance** : cours DESC 2023 (§3.4) — Corynebacterium, Bacillus, Propionibacterium acnes « Peu probable », « Sauf si présence sur 2, 3 flacons ou + ». Protocole Nancy (§3.3) — BG+ : amoxicilline IV si « Grossesse ou néonatalogie ou méningite d'allure bactérienne », sinon critères « Infection? » puis « Pas d'antibiotique » ou « Avis infectiologue ».
- **Listeria** : aucune recommandation sur la bactériémie isolée trouvée. Neurolistériose : voir `recherche-meningites.md` (SPILF 2018). CLSI M47 et REMIC : payants, non lus.

---

## 6. Synthèse — ce que l'application peut et ne peut pas en tirer

Niveaux : **A** = lu dans une recommandation en vigueur ; **B** = support officiel dérivé (diaporama SPILF) ou texte ancien non remplacé ; **C** = protocole local / cours / revue ; **NV** = non vérifié.

### 6.1 Cocci à Gram positif en amas, hémoculture positive, foyer non identifié
- **Peut** : ne pas couvrir le SARM chez un patient **communautaire sans facteur de risque**, même en sepsis. Bases : RFE 2014 « Il ne faut pas utiliser les anti-SMR dans le traitement probabiliste des infections communautaires vraies (Accord fort) » (A, champ réanimation) ; SSC 2026 rec. 26 (A, conditionnelle). Afficher qu'en France la prévalence du SARM est faible ne repose sur aucun chiffre lu ici (SSC 2021 : « ~ 2% in Western Europe », texte remplacé).
- **Peut** : définir le **haut risque SARM** avec la liste RFE 2014 (hémodialyse chronique, plaies chroniques, cathéter de longue durée, long séjour ; porteur connu de SARM sorti de l'hôpital dans l'année ; nosocomial de réanimation selon l'épidémiologie locale) et la remarque SSC 2026 (colonisation/infection dans l'année, antibiotiques larges prolongés, hospitalisation prolongée en unité à forte prévalence). « Prolongé » n'est pas chiffré (A).
- **Ne peut pas** : désigner la β-lactamine probabiliste (cloxacilline vs céfazoline) par une recommandation nationale : **aucune** ne traite l'examen direct. Seul le protocole local Nancy écrit « Cloxacilline », « Cloxacilline + Vancomycine* » si sepsis/hémodialyse/matériel < 1 an, céfazoline si allergie aux pénicillines (C). Le choix SASM documenté reste celui de `recherche-bacteriemies-foyers.md` §1 (B).
- **Ne peut pas** : fixer un critère « contaminant probable » pour les SCN (déjà NV dans `recherche-bacteriemies-foyers.md` §3). Le protocole Nancy (vitesse de pousse < 24 h, 2 flacons, clinique compatible) est local (C).

### 6.2 Cocci à Gram positif en chaînettes
- Aucune recommandation trouvée. Protocole Nancy seulement (C ; correspondance point d'appel ↔ molécule non fiable). → **avis** ou brouillon.

### 6.3 BGN en hémoculture, foyer non identifié
- Confirmé : **pas de recommandation dédiée** (`recherche-bacteriemies-foyers.md` §2 ; recherche refaite ici).
- **Peut** : ne pas proposer de carbapénème chez le communautaire, sauf BLSE/P. aeruginosa caz-R < 3 mois **et** sepsis sévère/choc (RFE 2014, Accord faible pour l'exception) ; associé aux soins : carbapénème seulement si ≥ 2 facteurs de la liste RFE 2014 (A, champ réanimation). SSC 2026 rec. 25-26 : couvrir le MDR seulement si haut risque (A).
- **Ne peut pas** : citer une recommandation 2026 sur la **double couverture** Gram négatif (absente du texte lu ; les rec. 2021 n° 19-21 sont remplacées). Molécule de 1re intention (céfotaxime/ceftriaxone, céfépime, pip-tazo…) : **aucune source nationale** ; protocole Nancy seulement (C). Aminoside dans le choc : RFE 2014 le préfère à une FQ « en cas d'association » (A) — ce n'est pas une indication d'associer.

### 6.4 Levures dans une hémoculture
- **Peut (A)** : 1re intention **échinocandine** (IDSA 2016 rec. 1, forte/élevée ; ECMM 2025 « strongly recommended » ; SPILF 2021 diapo 5). Doses verbatim : caspofungine 70 mg J1 puis 50 mg/j (IDSA, ECMM, SPILF ; SPILF : 70 mg/j si > 80 kg) ; micafungine 100 mg/j ; anidulafungine 200 mg J1 puis 100 mg/j (IDSA, ECMM).
- **Peut (A)** : fluconazole en alternative **sélective** — IDSA : patients « not critically ill » et peu suspects de résistance ; SPILF : « Si pas de choc, pas d'ATCD de prise d'azolés ou porte d'entrée urinaire » ; ECMM : seulement « marginally recommended » en initial. Divergence de force à afficher.
- **Peut (A)** : retrait précoce du cathéter central (IDSA rec. 13 ; ECMM « <48-72 h » ; SPILF « Ablation immédiate ») ; hémocultures de contrôle (IDSA « every day or every other day » ; ECMM « Daily… until three consecutive negative days » ; SSC 2026 p. 877).
- **Peut (A)** : durée **14 jours** — point de départ formulé différemment : IDSA « 2 weeks after documented clearance… and resolution of symptoms » ; SPILF « 14 jours à partir de la 1ère hémoculture négative » ; ECMM texte « from the first day of persistently negative blood cultures (ie, three consecutive negative blood cultures) » mais figure 2 « after last positive blood culture ». Choix à arbitrer par le relecteur.
- **Divergences à afficher** : fond d'œil — IDSA : tous les non-neutropéniques, première semaine ; SPILF : « toute candidémie » (non-neutropénique « dans les 8 jours ») ; ECMM : ciblé (symptômes oculaires, candidémie persistante, immunodépression, patient non communicant). Échographie — SPILF : ETT J5-J7 systématique ; ECMM : ciblée ; IDSA : non trouvée. Relais azolé — IDSA « usually within 5–7 days » ; ECMM « after 5 or more days » + 6 conditions ; SPILF « après 3 à 5 jours ».
- **Interprétation (non écrite dans les sources)** : SSC 2026 rec. 27 (« suggest against » l'antifongique **empirique**) vise le sepsis sans infection fongique documentée. Des levures à l'examen direct d'une hémoculture documentent une fongémie : la rec. 27 ne semble pas s'y appliquer. Le protocole Nancy traite dès l'examen direct (C). À valider par un infectiologue.

### 6.5 Bacilles à Gram positif
- **Peut (B, revue non gradée)** : Corynebacterium, Bacillus non anthracis, Cutibacterium « may be considered contaminants unless recovered from multiple blood cultures obtained in sequence » ; Listeria « rarely » contaminant (Doern 2019).
- **Ne peut pas** : citer une recommandation de conduite à tenir ni un traitement probabiliste pour un BG+ à l'examen direct (introuvable). Le nombre de flacons « 2, 3 » et la vitesse de pousse sont issus d'un cours et d'un protocole local (C).

---

## 7. NON VÉRIFIÉ / non lu
1. Tableau 1 de SSC 2026 (p. 864-869, image) : statut des rec. 2021 n° 17-21 (SARM, double couverture BGN) — retirées ou reportées ? Seule leur absence dans le corps du texte est vérifiée.
2. Suppléments SSC 2026 (Supplemental Digital Content 1-8 : PICO, profils de preuves) : non lus.
3. Version Crit Care Med de SSC 2026 (54(4):725-812) : non lue ; supposée identique (co-publication annoncée).
4. REMIC 7.1 (2022), chapitre hémocultures : payant, non lu ; tableaux d'interprétation seulement vus en image dans un cours.
5. ECMM 2025 : annexe (preuves, recommandations détaillées, pp 90-104 et 140-141) non lue ; niveaux de force de la figure 1 (fond d'œil, échographie) non lisibles ; correction d'avril 2025 (isavuconazole) non vérifiée.
6. ESCMID 2012 (non-neutropénique) et ESICM/ESCMID 2019 (réanimation) : 403 / accès fermé.
7. Recommandation française récente (2014-2026) sur la candidémie en réanimation : introuvable ; fiche SFAR 2014 évoquée, non trouvée.
8. Texte COMAI AP-HP 2019 (source du diaporama SPILF 2021) : non lu.
9. Rapport QUAMIC/SFM 2026 : vu seulement via un résumé de recherche, non lu.
10. Recommandation sur la bactériémie isolée à Listeria, et CLSI M47 : introuvable / payant.
11. Citations Doern 2019 : reprises de `recherche-indication.md`, non relues le 2026-11-11.
12. Doses de l'échinocandine « forte dose » chez le patient grave (SPILF : caspofungine 150 mg puis 1 mg/kg/j ; micafungine 150 mg/j) : lues dans le diaporama seulement, non retrouvées dans IDSA ni ECMM (article principal) ; à confirmer dans le texte AP-HP et les RCP (non lus ici).
13. RCP français des échinocandines et du fluconazole : non consultés dans cette recherche.
