# Recherche documentaire — Infection à *Clostridioides difficile* (ICD) de l'adulte

Date de consultation de toutes les sources : **2026-11-06**.
Méthode : WebSearch + WebFetch ; les PDF, diaporamas (.pptx) et pages BDPM ont été téléchargés dans un dossier dédié puis leur texte extrait localement (pypdf, pdftotext pour le PDF chiffré SPILF 2026, lecture des XML pour les .pptx, analyse HTML pour la BDPM). Chaque extrait cité ci-dessous a été **effectivement lu** dans le texte extrait, sauf mention « NON VÉRIFIÉ ». IDSA 2021 a été lu via WebFetch (lecture partielle, extraits courts restitués par l'outil). Les extraits anglais sont laissés en anglais.

Convention des statuts d'accès :
- **consultée (contenu lu)** : texte intégral ou partie pertinente lue.
- **trouvée mais contenu non lisible** : URL atteinte, contenu non exploitable (ex. : arbre décisionnel en image).
- **introuvable** : recherché sans succès.

Identifiants entre crochets = ids proposés dans `docs/sources/registre-clostridioides-difficile.json` (ou ids déjà présents dans `src/clinical/sources/registre.json`).

---

## 0. Panorama des textes en vigueur (ce qui remplace quoi)

| Corpus | Texte en vigueur au 2026-11-06 | Remplace / statut |
|---|---|---|
| SPILF — traitement de l'ICD de l'adulte | **Mise à jour SPILF 2026** (Chopin, Galpérine, Barbut, Benech, Bleibtreu, Boutoille ; groupe Recommandations SPILF + GFTF + Ginger), présentée aux JNI le 19/06/2026 [SPILF-2026-ICD-JNI] ; résumé Rev Prat 03/09/2026 [REVPRAT-2026-ICD-SPILF] | Remplace l'algorithme SPILF 2022 [SPILF-2022-ICD-diapo] pour le 1er épisode à haut risque de récidive et les récidives (motif : arrêt du bezlotoxumab). **Aucune publication écrite trouvée** ; la page Recommandations SPILF affiche toujours l'entrée C. difficile « (en cours de révision) ». |
| SPILF — formes graves, compliquées, voie orale impossible, définitions | Diaporama SPILF 2022 [SPILF-2022-ICD-diapo] (non revu en 2026) | Remplace les diapositives SPILF 2016 tirées d'ESCMID 2014 [SPILF-2016-ICD-diapo-ESCMID-2014] |
| ESCMID — traitement | **ESCMID 2021** (van Prehn et al.) [ESCMID-2021-ICD-traitement] | Remplace ESCMID 2014. Volet bezlotoxumab caduc. Aucune mise à jour ultérieure trouvée. |
| ESCMID — diagnostic | **ESCMID 2016** (Crobach et al.) [ESCMID-2016-ICD-diagnostic] | Remplace ESCMID 2009. |
| IDSA/SHEA | **2017** (McDonald et al., CID 2018) [IDSA-SHEA-2017-ICD] + **focused update 2021** (Johnson et al.) [IDSA-SHEA-2021-ICD-focused] | 2021 actualise le choix fidaxomicine/vancomycine et le bezlotoxumab ; le reste de 2017 (diagnostic, prévention, fulminant) reste en vigueur. |
| Hygiène (France) | **HCSP 2008** (avis du 20/06/2008) [HCSP-2008-ICD] pour les mesures spécifiques ; **SF2H 2009** [SF2H-2009-transmission-croisee] pour le cadre général des PCC | Volet thérapeutique HCSP 2008 obsolète (métronidazole 1re intention). Aucun texte français plus récent spécifique de C. difficile trouvé (recherches SF2H, HCSP, Santé publique France). |
| Bezlotoxumab (ZINPLAVA) | **Arrêt de commercialisation déclaré le 23/05/2025** ; **AMM abrogée le 20/10/2026** [BDPM-zinplava-arret] [EMA-2026-zinplava-retrait] | — |
| HAS | Aucune recommandation HAS dédiée à l'ICD trouvée. Seuls les avis de la Commission de la transparence sur DIFICLIR (2012, 2020, 2024) via la BDPM [BDPM-dificlir-fiche]. | — |

Textes repérés mais **non lus** (cités pour mémoire, non utilisés) : AGA Clinical Practice Update 2026 (gastro-entérologie, États-Unis) ; recommandations australiennes ASID 2025 ; recommandations suisses SSI 2026 (Swiss Med Wkly) ; ACG 2021 ; fiche Répia/PRIMO « Clostridioides difficile : prise en charge en ville » (septembre 2025, citée dans la bibliographie de Rev Prat, introuvable en ligne) ; documents ANSM sur l'encadrement de la TMF (2014-2015, connus seulement par la presse). CRAT fidaxomicine : **introuvable**.

Points de vigilance de vigueur :
- La mise à jour SPILF 2026 n'existe qu'en **diaporama** ; ses arbres décisionnels sont des **images non lisibles** dans le PDF ; le contenu exploitable est le texte des diapositives et le résumé de la Revue du Praticien.
- SPILF 2026 cite comme facteurs de risque de récidive ceux d'ESCMID 2021 ; seuil d'âge : « > 65 ans » (diapositive) vs « ≥ 65 ans » (Rev Prat).
- **Forme orale de vancomycine en France** : aucune gélule ; la voie orale repose sur des poudres « pour solution à diluer pour perfusion **ou pour solution buvable** ». Le RCP déjà dans le registre (`RCP-vancomycine`, VIATRIS **125 mg**, CIS 60033510) **n'a pas d'indication orale** (voir §Molécules). La diapositive SPILF 2026 mentionne des échanges ANSM-SPILF sur l'« Accessibilité en France de la vancomycine capsule disponible en suisse ».

---

## 1. SPILF 2026 — Mise à jour du traitement des ICD de l'adulte (JNI 2026) [SPILF-2026-ICD-JNI]

- **Organisme** : SPILF, groupe Recommandations, avec GFTF (Groupe français de transplantation fécale) et Ginger.
- **Titre exact** : « Mise à jour du traitement des infections à Clostridioides difficile chez l'adulte ». Orateur A. Bleibtreu, JNI 2026, Paris.
- **URL** : https://www.infectiologie.com/UserFiles/File/jni/2026/groupes/sg05-02.pdf
- **Accès** : consultée (texte des diapositives) ; **arbres décisionnels 2022/2026 non lisibles** (images).
- **Vigueur** : en vigueur (version écrite non publiée à la date de consultation).
- **Méthode** (diapo « Contexte ») : « Élaboration de 9 questions PICO », « Bibliographie 2021 à T1 2026 », « Vote d'un panel de 25 relecteurs » ; gradation HAS (A, B, C, AE = avis d'experts).

Extraits :
- Objectif : « Le bezlotoxumab n'est plus commercialisé en France » ; « L'esprit de cette mise à jour est de définir en alternative au bezlotoxumab » la place de la fidaxomicine, de la vancomycine et de la TMF.
- Facteurs de risque de récidive (tableau « Définitions », repris d'ESCMID 2021) : « Age > 65 ans » (fort, modéré) ; « Episode antérieur d'infection à C. difficile » (fort, modéré) ; « Episode lié aux soins et hospitalisation dans les 3 derniers mois » (faible, bas) ; « Antibiothérapie systémique concomitante après le diagnostic » (faible, très bas) ; « Traitement par IPP pendant ou au décours du diagnostic » (faible, très bas).
- Posologies (même tableau, voie per os) : fidaxomicine « 200 mg/12 h qsp 10j » ; fidaxomicine pulsée « 200 mg/12 h qsp de J1 à J5, puis 200 mg toutes les 48h de J7 à J25 » ; vancomycine « 125 mg/6 h qsp 10j » ; vancomycine pulsée « 125 mg/6 h qsp 14j, puis 125 mg/12 h qsp 7j, puis 125 mg/24 h qsp 7j, puis 125 mg toutes les 48 h qsp 7j, puis 125 mg toutes les 72 h qsp 7j ».
- **1er épisode à haut risque de récidive** : « La Fidaxomicine en schéma pulsé est une alternative au schéma standard (Grade AE) » ; « La vancomycine pulsée seule n'est pas recommandée en alternative à la fidaxomicine en schéma classique ou pulsée. (Grade AE) » ; « La TMF n'est pas recommandée après la fin de la fidaxomicine standard ou pulsée. Grade AE ».
- **1re récidive** (« 1ère récidive = Pop à Ht risque ») : « La fidaxomicine pulsée est une alternative au schéma standard. (Grade AE) » ; « La vancomycine pulsée n'est pas recommandée en remplacement de la fidaxomicine (Std ou pulsée) lorsque celle-ci est disponible et accessible (Grade AE). » ; « La vancomycine pulsée est possible en alternative à la vancomycine standard. (Grade AE) ».
- **TMF en 1re récidive** : « La TMF est recommandée après la vancomycine Std (Grade B) ou pulsée (Grade C). » ; « La TMF est possible après la fidaxomicine (Std ou pulsée). Grade AE » ; « possible chez les patients à haut risque de morbi-mortalité lié à l'ICD (comorbidités majeures, antécédents d'ICD grave compliquée ou réfractaire). (Grade AE) » ; « possible après quel que soit le traitement reçu chez les patients de plus de 70 ans. (Grade C) ».
- Remarque : « l'esprit des recommandations est de proposer la TMF en alternative au bezlotoxumab dans ces situations ».
- Contexte 2 : échanges ANSM-SPILF sur « Accessibilité en Pharmacie d'officine de la fidaxomicine », « Générique fidaxomicine », « Accessibilité en France de la vancomycine capsule » ; échanges GFTF-ANSM sur la « Validation des centres de TMF ».

## 2. La Revue du Praticien, 3 septembre 2026 — « C. difficile : nouvel algorithme thérapeutique de la SPILF » [REVPRAT-2026-ICD-SPILF]

- **URL** : https://www.larevuedupraticien.fr/article/c-difficile-nouvel-algorithme-therapeutique-de-la-spilf — consultée ; source secondaire.
- Extraits :
  - Bezlotoxumab « retiré de la vente début 2025 par son seul producteur ».
  - Haut risque : « âge ≥ 65 ans ; antibiothérapie systémique concomitante après le diagnostic ; épisode lié aux soins avec hospitalisation dans les 3 derniers mois ; traitement par IPP pendant ou au décours du diagnostic ».
  - « Dans ces situations, la prise en charge repose désormais uniquement sur la fidaxomicine, en schéma standard (200 mg/12 h, qsp 10 j) ou pulsé ».
  - « Dans les autres situations (absence de facteur de risque particulier), la prise en charge suit l'algorithme habituel (figure). » (figure non lisible).
  - Récidive : « nouvel épisode d'ICD dans les 8 semaines après le 1er épisode (si ce dernier s'est résolu) » ; « La vancomycine est le traitement de 2e intention, lorsque la fidaxomicine n'est pas disponible ou accessible. »
  - « En cas de nouvelle(s) récidive(s), la SPILF recommande un traitement à base de vancomycine ou de fidaxomicine, suivi par une TMF. »
- **Divergence de transcription** : Rev Prat écrit « La vancomycine n'est plus proposée en alternative à la fidaxomicine » (1er épisode à haut risque) alors que la diapositive vise la « vancomycine pulsée seule ». Seuil d'âge « ≥ 65 » (Rev Prat) vs « > 65 » (diapositive, ESCMID).

## 3. SPILF 2022 — Mise au point sur le traitement des ICD (diaporama du 09/02/2022) [SPILF-2022-ICD-diapo]

- **URL** : https://www.infectiologie.com/UserFiles/File/spilf/recos/spilf-groupe-reco-spilf-icd-escmid-2022.pptx — consultée (texte extrait du .pptx, algorithme compris).
- **Vigueur** : incertain — remplacé par SPILF 2026 pour haut risque/récidives ; conservé pour formes graves/compliquées, voie orale impossible, définitions.
- Extraits :
  - Définition (diapo 3) : « Tableau clinique compatible + toxine libre par EIA* + pas d'autre cause évidente de diarrhée ( > 3 selles molles (Bristol 6-7) en 24h) » OU « Tableau clinique compatible + test PCR positif ou culture toxigénique positive » OU colite pseudomembraneuse + test toxigénique positif.
  - Réponse (diapo 4) : « L'évaluation de la réponse au traitement ne se fait pas avant le 3ème jour de traitement » ; forme réfractaire : « Absence de réponse au traitement après 3-5 jours » ; rechute : « Episode survenant dans les 8 semaines du 1er épisode après une réponse initiale au traitement ».
  - **Gravité** (diapo 5) : forme grave = au moins un critère parmi « Fièvre > 38.5°C », « Leucocytose > 15.109/L », « Créatinine > 50% valeur de base », imagerie (« distension colique, infiltration de la graisse péri-colique, épaississement paroi colique ») ; **forme grave ET compliquée** = « Hypotension, choc septique, élévation des lactates, iléus, mégacolon toxique, perforation intestinale, évolution fulminante ».
  - **Mesures générales** (diapo 7) : « Arrêt d'une antibiothérapie quand elle n'est pas nécessaire » ; « Rééquilibration hydro-électrolytique » ; « Pas de ralentisseurs du transit » ; « Discuter l'arrêt du traitement par IPP ».
  - Algorithme (diapo 8, texte) : forme grave → « Vancomycine ou fidaxomicine. Voie orale impossible: administration locale +/- métronidazole IV ou tigécycline » ; forme grave et compliquée et/ou réfractaire → « Vancomycine ou fidaxomicine. Approche multidisciplinaire avec avis chirurgical. Évaluation TMF3 et tigécycline si réfractaire ».
  - Posologies (diapo 9) : métronidazole « 500 mg/8 h qsp 10j » per os et IV ; tigécycline « Charge 100 mg puis 50 mg/12h » IV ; bezlotoxumab « 10 mg/kg sur 1h, dose unique » IV (caduc).
  - Remarques (diapo 10) : « Le métronidazole n'est plus recommandé comme antibiotique de première ligne » ; « Il n'existe pas de données suffisantes pour argumenter l'utilisation de hautes doses de vancomycine » ; « Aucune prophylaxie médicamenteuse, y compris par probiotiques, n'est recommandée. »

## 4. SPILF 2016 (diapositives ESCMID 2014) [SPILF-2016-ICD-diapo-ESCMID-2014] — remplacée

- **URL** : https://www.infectiologie.com/UserFiles/File/spilf/recos/icd-reco-escmid-2014.pptx — consultée.
- Utile seulement pour la liste détaillée des signes de gravité (diapo 4) : « Lactatémie ≥ 5 mmol/L », « Albuminémie < 30 g/L », « Distension colique (diamètre > 6 cm). » ; mégacôlon toxique (diapo 3) : « Distension colique radiologique (Diamètre > 6 cm) et syndrome inflammatoire systémique sévère ». Traitements (métronidazole 1re ligne) **obsolètes**.

## 5. Info-antibio N°94, novembre 2021 [SPILF-2021-info-antibio-94] — remplacée

- **URL** : https://www.infectiologie.com/UserFiles/File/spilf/atb/info-antibio/info-antibio-2021-11-icd.pdf — consultée.
- Extraits utiles encore valides : « L'abandon du métronidazole (sauf si la fidaxomicine et la vancomycine sont indisponibles) » ; « La rifaximine est non recommandée devant une possible résistance croisée avec la rifampicine. » ; « Les probiotiques ne sont pas recommandés » ; ICD grave : « Pas d'association systématique avec le métronidazole » ; « ICD réfractaire : Non compliquée et stable : revoir le diagnostic ».

## 6. ESCMID 2021 — mise à jour du guide de traitement (van Prehn et al.) [ESCMID-2021-ICD-traitement]

- **Organisme** : ESCMID / ESGCD. **Titre exact** : « European Society of Clinical Microbiology and Infectious Diseases: 2021 update on the treatment guidance document for Clostridioides difficile infection in adults ». Clin Microbiol Infect 2021;27 Suppl 2:S1-S21.
- **URL** : https://www.clinicalmicrobiologyandinfection.com/article/S1198-743X(21)00568-1/fulltext ; lu dans le pre-proof https://elibrary.escmid.org/download/16382185018656_66.pdf (58 p.). Pages citées = pages du PDF pre-proof.
- **Accès** : consultée. **Vigueur** : en vigueur (bezlotoxumab caduc). GRADE (force : strong/weak ; niveau : high → very low ; « Good practice statement »).

Définitions (p. 10-11) :
- Diarrhée : « Diarrhea is defined as ≥3 loose stools, i.e. Bristol stool scale 6-7 [17], in 24 hours. »
- Épisode : toxines libres par EIA sans autre cause, ou « a positive nucleic acid amplification test (NAAT) preferably with a low cycle threshold (Ct) value », ou colite pseudomembraneuse + test toxigénique.
- Réponse : évaluée « after at least 3 days, assuming that the patient is not worsening on treatment ».
- Réfractaire : « no response after 3-5 days of therapy ».
- Récidive : « CDI re-occurs within 8 weeks after a previous episode, provided the symptoms from the previous episode resolved ».
- **Severe CDI** : « fever i.e. core body temperature >38.5 °C, marked leukocytosis i.e. leukocyte count >15 x 10^9/L, and rise in serum creatinine, i.e. >50% above the baseline ».
- **Severe-complicated (fulminant)** : « hypotension, septic shock, elevated serum lactate, ileus, toxic megacolon, bowel perforation, or any fulminant course of disease ».

I. Épisode initial (p. 13) :
- « In case of non-severe CDI, we recommend to discontinue antibiotic therapy if possible with the inciting antibiotic and closely monitor the patient for 48 hours. » (Good practice statement)
- « For the initial episode of CDI we recommend fidaxomicin 200 mg twice daily for 10 days. » (Strong, Moderate)
- Vancomycine : « oral vancomycin 125 mg four times daily for 10 days is a suitable alternative. » (Strong, High)
- Métronidazole : « Oral metronidazole 500 mg three times daily for 10 days should be used only when vancomycin and fidaxomicin are not available or feasible. » (Strong, Moderate)
- « The use of vancomycin 500 mg four times daily is not recommended. » (Strong, Very low)
- Fidaxomicine prolongée : « 200 mg twice daily on days 1-5, and 200 mg once daily on alternate days on days 7-25 », « especially in elderly hospitalized patients » (Weak, Low).
- Haute dose de vancomycine (p. 15) : « The standard dose of 125 mg four times daily already results in high intraluminal levels ».

II. Formes graves et graves-compliquées (p. 17) :
- « vancomycin 125 mg four times daily for 10 days or fidaxomicin 200 mg twice daily for 10 days. There is no data supporting the superiority of one over the other. » (Good practice statement)
- « For severe CDI, routine addition of i.v. metronidazole to oral SoC therapy is not recommended. » (Weak against, Very Low)
- Tigécycline IV « 50 mg twice daily (100 mg loading dose) may be considered on a case-by-case basis » si aggravation (Weak, Very Low).
- « Consult a surgeon for any severe-complicated case. » (Good practice statement) ; « Total abdominal colectomy might be prevented by partial colectomy or loop ileostomy. » (Weak, Very Low)

III. Voie orale impossible (p. 19-20) :
- « attempt intraluminal (gastroduodenal or coloscopic) delivery of vancomycin or fidaxomicin » (GPS) « and consider adjunctive treatment with i.v. metronidazole 500 mg 3 times daily or i.v. tigecycline » (Weak, Very Low).
- Doses intraluminales : « dosages range from 250 mg once daily to 1 g QID » ; « It seems reasonable use standard oral dosages for intraluminal delivery. »

IV. Réfractaire (p. 20) :
- Non compliquée stable : « carefully re-evaluate the diagnosis of CDI and consider an alternative diagnosis. » (GPS)
- « Consult a surgeon as soon as a patient's condition is deteriorating and the patient is not responding to CDI treatment. » (GPS)
- TMF de sauvetage si chirurgie impossible (Weak, Very Low).

V. Récidive (p. 22) :
- « If the initial CDI episode was treated with vancomycin or metronidazole, then fidaxomicin 200 mg twice daily for 10 days is the preferred agent to treat a first CDI recurrence. » (Strong, Low)
- Vancomycine dégressive/pulsée si fidaxomicine ou bezlotoxumab indisponibles (Weak, Very low) ; schéma de l'essai (p. 23) : « 2 weeks of vancomycin 125 mg orally four times daily, followed by 1 week 125 mg twice daily, then 1 week 125 mg daily, then 1 week 125 mg every second day, and finally 125 mg orally every third day for 1 week. »

VI. Récidives multiples (p. 24) :
- « Treatment options for a second or further CDI recurrence include FMT after SoC antibiotic pre-treatment or bezlotoxumab in addition to SoC » ; « For FMT an adequate multidisciplinary risk assessment is mandatory » (Weak, Moderate pour la TMF).

VII-VIII. Facteurs pronostiques (p. 26-27) :
- Gravité : « The most important risk factors for severe CDI are older age (>65 years old) and presence of multiple comorbidities. » (Strong, Moderate)
- Récidive : âge > 65 ans (Strong, Moderate) ; « prior CDI episode(s) » (Strong, Moderate) ; « healthcare-associated CDI and prior hospitalization in the last three months » (Weak, Low) ; « concomitant non-CDI antibiotic use after the diagnosis » (Weak, Very low) ; « PPI therapy » (Weak, Very low).

IX. Prophylaxie (p. 29) : « Routine prophylaxis with anti-CDI antibiotics when on systemic antibiotic treatment is not recommended. » (GPS).

Autres (p. 31) :
- Grossesse : « In the absence of clinical data and experience with fidaxomicin, we prefer vancomycin during pregnancy. » ; certaines formes IV « contain the excipients PEG 400 and NADA and therefore cannot be used for oral administration in pregnant woman » ; « prolonged administration and high dosing of vancomycin should be discouraged » ; TDM « may be considered ».
- Traitement empirique : « strongly discourage the start of empirical therapy without diagnostic testing » (hors retard diagnostique important ou forme fulminante, reprise d'IDSA 2017).
- Durée : « we also discourage treatment beyond the recommended standard duration of 10-14 days with SoC antibiotics because of lack of response or co-administered antibiotic treatment. »

## 7. ESCMID 2016 — guide diagnostique (Crobach et al.) [ESCMID-2016-ICD-diagnostic]

- **Titre exact** : « European Society of Clinical Microbiology and Infectious Diseases: update of the diagnostic guidance document for Clostridium difficile infection ». Clin Microbiol Infect 2016;22:S63-S81. **URL** : https://openaccess.sgul.ac.uk/109285/1/1-s2.0-S1198743X16300258-main.pdf — consultée. En vigueur.
- Extraits (p. S79) :
  - « We recommend against the use of a single rapid test as a standalone test due to inadequate PPV in an endemic situation. » (Strong, moderate)
  - « We recommend the use of a 2-step algorithm » ; « This algorithm should start with either NAAT or GDH EIA. Samples with a negative first test result can be reported as negative. »
  - « Samples with a positive first test result should be tested further with a toxin A/B EIA. Samples with a positive second test results can be reported as CDI-positive. »
  - Alternative : GDH et toxine A/B EIA d'emblée ; GDH+/toxine− « may represent samples with CDI or C. difficile carriage and may optionally be tested with TC or NAAT » (Weak).
  - « Formed stool samples should not be tested for CDI (except in case of paralytic ileus). » (GPS) ; iléus : « a rectal swab can be used ».
  - « Repeated testing after a first positive sample during the same diarrhoeal episode is not recommended in an endemic situation. » ; « A test of cure is not recommended. » (GPS)
  - Approche laboratoire : « We suggest that at least all submitted unformed stool samples from patients 3 years or older should be tested for CDI. »

## 8. IDSA/SHEA 2017 (McDonald et al., CID 2018;66:e1-e48) [IDSA-SHEA-2017-ICD]

- **URL** : https://pmc.ncbi.nlm.nih.gov/articles/PMC6018983/ — consultée (texte PMC). En vigueur sauf points actualisés en 2021.
- Qui tester : « Patients with unexplained and new-onset ≥3 unformed stools in 24 hours are the preferred target population for testing for CDI » (weak, very low) ; laxatifs : « not routinely performing testing on stool from a patient who has received a laxative within the previous 48 hours. »
- Algorithme : « Use a stool toxin test as part of a multistep algorithm (ie, glutamate dehydrogenase [GDH] plus toxin; GDH plus toxin, arbitrated by nucleic acid amplification test [NAAT]; or NAAT plus toxin) rather than a NAAT alone » en l'absence de critères préétablis (weak, low).
- « Do not perform repeat testing (within 7 days) during the same episode of diarrhea and do not test stool from asymptomatic patients » (strong, moderate).
- Récidive suspectée : « Testing for recurrent CDI should ideally include toxin detection ».
- Sévérité (tableau) : non sévère « white blood cell count of ≤15000 cells/mL and a serum creatinine level <1.5 mg/dL » ; sévère « ≥15000 cells/mL or a serum creatinine level >1.5 mg/dL » ; fulminant « Hypotension or shock, ileus, megacolon ». Note : critères « based on expert opinion ».
- Antibiotique inducteur : « Discontinue therapy with the inciting antibiotic agent(s) as soon as possible » (strong, moderate) ; traitement empirique seulement si « a substantial delay in laboratory confirmation is expected, or for fulminant CDI » (weak, low).
- **Fulminant** : « vancomycin administered orally is the regimen of choice » (strong, moderate) ; « The vancomycin dosage is 500 mg orally 4 times per day and 500 mg in approximately 100 mL normal saline per rectum every 6 hours as a retention enema » ; métronidazole IV « 500 mg intravenously every 8 hours », « particularly if ileus is present » (strong, moderate) ; voie rectale si iléus (weak, low).
- Chirurgie : « perform subtotal colectomy with preservation of the rectum » (strong, moderate) ; « Diverting loop ileostomy with colonic lavage followed by antegrade vancomycin flushes is an alternative approach » (weak, low).
- Surveillance vancomycine forte dose : « it may be appropriate to monitor trough serum concentration » (hautes doses, exposition prolongée, insuffisance rénale, muqueuse lésée).
- Durées : note du tableau « some patients (particularly those treated with metronidazole) may have delayed response to treatment and clinicians should consider extending treatment duration to 14 days » ; pas de recommandation pour prolonger le traitement anti-C. difficile pendant une antibiothérapie concomitante (« no recommendation »).
- TMF : « appropriate antibiotic treatments for at least 2 recurrences (ie, 3 CDI episodes) should be tried prior to offering fecal microbiota transplantation ».
- Prévention : chambre individuelle « with a dedicated toilet » (strong, moderate) ; gants et surblouse (strong) ; précautions contact préemptives si résultat non disponible le jour même (strong, moderate) ; « Continue contact precautions for at least 48 hours after diarrhea has resolved » (weak, low) ; hygiène des mains au savon et à l'eau « preferentially » en situation d'épidémie/hyperendémie (weak, low) et en cas de contact avec les selles (good practice).
- IPP : « insufficient evidence for discontinuation of PPIs as a measure for preventing CDI » (pas de recommandation).

## 9. IDSA/SHEA 2021 focused update (Johnson et al., CID 2021;73:e1029-e1044) [IDSA-SHEA-2021-ICD-focused]

- **URL** : https://academic.oup.com/cid/article/73/5/e1029/6298219 — consultée partiellement (WebFetch). En vigueur (bezlotoxumab caduc).
- Épisode initial : « we suggest using fidaxomicin rather than a standard course of vancomycin » (conditional, moderate).
- Récidive : « we suggest fidaxomicin (standard or extended-pulsed regimen) rather than a standard course of vancomycin » (conditional, low).
- Bezlotoxumab : « as a co-intervention along with standard-of-care (SOC) antibiotics » si récidive < 6 mois (conditional, very low) ; insuffisance cardiaque : « reserved for use when the benefit outweighs the risk ».
- Schémas (tableau, restitué par l'outil, NON VÉRIFIÉ mot à mot) : fidaxomicine prolongée-pulsée 200 mg × 2/j 5 jours puis 1 fois tous les 2 jours pendant 20 jours ; option « vancomycine puis rifaximine 400 mg × 3/j 20 jours » en récidives multiples ; fulminant inchangé par rapport à 2017.

## 10. HCSP 2008 — avis du 20 juin 2008 [HCSP-2008-ICD]

- **Titre exact** : « Avis relatif à la maîtrise de la diffusion des infections à Clostridium difficile dans les établissements de santé français ». **URL** : https://www.hcsp.fr/hcspi/docspdf/avisrapports/hcspa20080620_Cdifficile.pdf — consultée (11 p.). **Vigueur : incertain** (thérapeutique obsolète ; hygiène non remplacée).
- Extraits :
  - « Les précautions « contact » ne s'appliquent qu'aux patients symptomatiques » (p. 2).
  - Produits pour les mains : efficacité « modérée sur les spores de C. difficile (savons doux, savons antiseptiques) voire nulle (produits hydro-alcooliques) » (p. 2).
  - Hygiène des mains : « avant de quitter la chambre, jeter les gants et faire un lavage simple des mains au savon doux (éliminer les spores) puis, après un séchage complet, se désinfecter les mains par friction avec un produit hydro-alcoolique » (p. 3).
  - Surblouse « à manches longues, lors des contacts directs avec le patient ou ses excréta » (p. 3).
  - Bionettoyage « au moins quotidien », désinfection par « hypochlorite de sodium à 0,5 % de chlore actif », « temps de contact minimum de 10 minutes » (p. 4).
  - « isolement géographique des patients symptomatiques dans des chambres individuelles » (p. 4) ; maintien « jusqu'à la fin de l'épisode diarrhéique » (p. 5).
  - Volet thérapeutique **obsolète** : métronidazole « en première intention » ; vancomycine « 250 mg à 500 mg x 4/jour » (p. 4).

## 11. SF2H 2009 — Prévention de la transmission croisée : précautions complémentaires contact [SF2H-2009-transmission-croisee]

- **URL** : https://www.sf2h.net/k-stock/data/uploads/2009/01/SF2H_prevention-transmission-croisee-2009.pdf — consultée. En vigueur.
- Le texte exclut la prise en charge spécifique de C. difficile de certaines recommandations (gants) : « Cette recommandation ne prend pas en compte la problématique de la prise en charge de certains micro-organismes comme Clostridium difficile toxinogènes » ; renvoie à l'avis HCSP 2008.
- « Dans des situations d'exposition à certains pathogènes, comme Clostridium difficile [62] et l'agent de la gale, il est recommandé de réaliser un lavage simple des mains suivi d'une FHA sur mains correctement séchées. »

## 12. SFM 2025 — fiche pédagogique « Clostridioides difficile » [SFM-2025-fiche-ICD]

- **URL** : https://www.sfm-microbiologie.org/wp-content/uploads/2025/06/10-Clostridium-difficile.pdf — consultée. Document d'enseignement (pas une recommandation).
- Indications de la recherche : « chez un patient hospitalisé depuis trois jours ou plus », « > 65 ans », « antécédents d'hospitalisation dans les deux mois précédents », « antibiothérapie récente », « toute diarrhée communautaire, aiguë et sévère, ne retrouvant pas d'autre cause » ; « La recherche de C. difficile toxinogène doit être demandée explicitement, ne fait pas partie de la coproculture standard. »
- « Prélèvement de contrôle déconseillé : seule l'amélioration des signes cliniques rend compte de l'efficacité du traitement. »
- Mesures générales : « arrêt de l'antibiothérapie responsable si possible, hydratation, mesures d'hygiène, contre-indication du lopéramide ».
- Hygiène : « les solutés hydro-alcooliques sont inefficaces sur les spores » ; bionettoyage « au moins quotidien » avec « produit sporicide (par exemple eau de Javel à 0,5 %) ».

## 13. JNI 2024 — Précautions complémentaires contact (Lehoussel, Jeanne-Leroyer) [SPILF-JNI-2024-PCC]

- **URL** : https://infectiologie.com/UserFiles/File/jni/2024/pnm/jni2024-atpar2-02-lehoussel-jeanne-leroyer.pdf — consultée ; source faible (quiz).
- Levée des PCC : « Levée Cdiff => 48h » (après fin des symptômes), « Selon décision CLIN/instance LIN de l'établissement ».

## 14. Bezlotoxumab — statut 2025-2026 [BDPM-zinplava-arret] [EMA-2026-zinplava-retrait]

- BDPM (CIS 69894104) : « Déclaration d'arrêt de commercialisation : 23/05/2025 » ; « Statut de l'autorisation : Abrogée le 20-10-2026 » ; « Ce médicament n'est ou ne sera bientôt plus disponible sur le marché. »
- EMA : « On 20 October 2026, the European Commission withdrew the marketing authorisation for Zinplava (bezlotoxumab) » ; à la demande du titulaire, « for commercial reasons ».
- SPILF 2026 : « Le bezlotoxumab n'est plus commercialisé en France ».
- **Conséquence** : toute branche « + bezlotoxumab » d'ESCMID 2021, IDSA 2021, SPILF 2022, Info-antibio 2021 et de la fiche SFM 2025 est **caduque** ; ne pas la modéliser.

---

## 15. Proposition de modélisation

### 15.1 Données d'entrée (questions à poser)

1. Diarrhée nouvelle et inexpliquée **≥ 3 selles non moulées (Bristol 6-7) / 24 h** ? [ESCMID-2021-ICD-traitement p. 10 « ≥3 loose stools, i.e. Bristol stool scale 6-7 » ; IDSA-SHEA-2017-ICD « ≥3 unformed stools in 24 hours »]. Laxatif dans les 48 h ? [IDSA-SHEA-2017-ICD]. Iléus (pas de selles) ? [ESCMID-2016-ICD-diagnostic : écouvillon rectal].
2. Résultat microbiologique : 1re étape (GDH ou TAAN/PCR) puis toxine A/B ; profil discordant (GDH+ ou PCR+ / toxine−) [ESCMID-2016-ICD-diagnostic].
3. Rang de l'épisode : 1er épisode / 1re récidive (dans les 8 semaines après résolution) / ≥ 2e récidive [ESCMID-2021-ICD-traitement p. 10 ; REVPRAT-2026-ICD-SPILF]. Traitement reçu lors de l'épisode précédent (fidaxomicine, vancomycine, métronidazole).
4. Critères de gravité : T > 38,5 °C ; leucocytes > 15 G/L ; créatinine > 50 % au-dessus de la valeur de base ; signes d'imagerie [ESCMID-2021-ICD-traitement p. 11 ; SPILF-2022-ICD-diapo diapo 5].
5. Critères de forme grave-compliquée/fulminante : hypotension, choc septique, lactates élevés, iléus, mégacôlon toxique, perforation, aggravation rapide [mêmes sources].
6. Facteurs de risque de récidive : âge > 65 ans (≥ 65 selon Rev Prat), antécédent d'ICD, épisode lié aux soins + hospitalisation < 3 mois, antibiothérapie systémique concomitante après le diagnostic, IPP [SPILF-2026-ICD-JNI ; ESCMID-2021-ICD-traitement p. 27].
7. Voie orale possible ? (sinon sonde gastrique / voie colique) [ESCMID-2021-ICD-traitement p. 19].
8. Antibiothérapie en cours (inducteur) : arrêt possible ? IPP en cours ? ralentisseur du transit ?
9. Terrain : grossesse ; allergie connue aux macrolides (fidaxomicine) ; insuffisance rénale sévère ; traitement par inhibiteur puissant de la P-gp (ciclosporine, kétoconazole, érythromycine, clarithromycine, vérapamil, dronédarone, amiodarone) ou dabigatran [RCP-fidaxomicine §4.4-4.5] ; AVK [RCP-vancomycine-orale §4.5] ; âge > 70 ans (TMF possible quel que soit le traitement reçu) [SPILF-2026-ICD-JNI].
10. Disponibilité de la fidaxomicine (prescription hospitalière, rétrocession) [BDPM-dificlir-fiche] et accès à un centre de TMF.

### 15.2 Diagnostic — qui tester, comment

| Élément | Règle proposée | Référence + extrait |
|---|---|---|
| Qui tester | Diarrhée nouvelle inexpliquée ≥ 3 selles non moulées/24 h, sans laxatif < 48 h | IDSA-SHEA-2017-ICD « ≥3 unformed stools in 24 hours » (weak, very low) ; ESCMID-2021-ICD-traitement « ≥3 loose stools, i.e. Bristol stool scale 6-7 » |
| Ne pas tester | Patient asymptomatique ; selles moulées (sauf iléus) ; test répété dans les 7 j au cours du même épisode | IDSA-SHEA-2017-ICD « do not test stool from asymptomatic patients » (strong) ; ESCMID-2016-ICD-diagnostic « Formed stool samples should not be tested » |
| Pas de test de guérison | Contrôle microbiologique après traitement non indiqué | ESCMID-2016-ICD-diagnostic « A test of cure is not recommended. » ; SFM-2025-fiche-ICD « Prélèvement de contrôle déconseillé » |
| Algorithme | 2 étapes : GDH ou TAAN, puis toxine A/B EIA ; négatif à l'étape 1 = négatif ; GDH/TAAN+ et toxine+ = ICD ; GDH/TAAN+ et toxine− = ICD ou portage (interprétation clinique ; TAAN/culture toxigénique optionnelle) | ESCMID-2016-ICD-diagnostic (Strong, moderate) ; IDSA-SHEA-2017-ICD (weak, low) |
| Récidive suspectée | Nouveau test incluant la détection de toxine | IDSA-SHEA-2017-ICD « should ideally include toxin detection » |
| Traitement empirique | Seulement si délai diagnostique important ou forme fulminante | IDSA-SHEA-2017-ICD (weak, low) ; ESCMID-2021-ICD-traitement p. 31 |
| Remboursement fidaxomicine | Réservée aux ICD documentées | BDPM-dificlir-fiche : SMR « insuffisant dans les infections où Clostridium difficile n'est pas objectivé » |

**Zone grise** : le profil GDH+ (ou PCR+) / toxine− n'est pas tranché (ICD vs portage) → afficher « interprétation clinique / avis spécialisé ». ESCMID 2021 accepte un TAAN positif « preferably with a low cycle threshold » sans seuil chiffré → ne pas modéliser de seuil de Ct.

### 15.3 Mesures associées (toutes situations)

| Mesure | Références + extrait |
|---|---|
| Arrêter l'antibiotique inducteur dès que possible ; si ICD non sévère et arrêt possible, surveiller 48 h étroitement | IDSA-SHEA-2017-ICD (strong, moderate) ; ESCMID-2021-ICD-traitement p. 13 « closely monitor the patient for 48 hours » (GPS) |
| Réhydratation, correction électrolytique | SPILF-2022-ICD-diapo « Rééquilibration hydro-électrolytique » ; RCP-vancomycine-orale §4.2 « Un apport adéquat en liquides et électrolytes » |
| Pas de ralentisseur du transit (lopéramide) | SPILF-2022-ICD-diapo ; SFM-2025-fiche-ICD « contre-indication du lopéramide » ; RCP-vancomycine-orale §4.4 « doivent être évités » |
| Réévaluer / discuter l'arrêt des IPP | SPILF-2022-ICD-diapo « Discuter l'arrêt du traitement par IPP » ; RCP-vancomycine-orale §4.4 « devrait être réévaluée » (IDSA 2017 : pas de recommandation sur ce point) |
| Pas de probiotiques ; pas de prophylaxie antibiotique systématique | SPILF-2022-ICD-diapo diapo 10 ; ESCMID-2021-ICD-traitement p. 29 |
| Précautions complémentaires contact dès la suspicion, chambre individuelle, gants, surblouse à manches longues | HCSP-2008-ICD p. 3-4 ; IDSA-SHEA-2017-ICD (strong) ; SFM-2025-fiche-ICD |
| Hygiène des mains : lavage au savon doux, séchage, puis friction hydro-alcoolique, avant de quitter la chambre | HCSP-2008-ICD p. 3 ; SF2H-2009-transmission-croisee « lavage simple des mains suivi d'une FHA sur mains correctement séchées » |
| Bionettoyage quotidien sporicide (hypochlorite 0,5 %, contact ≥ 10 min) | HCSP-2008-ICD p. 4 |
| Durée des PCC | **Divergence** : HCSP-2008-ICD « jusqu'à la fin de l'épisode diarrhéique » vs IDSA-SHEA-2017-ICD « at least 48 hours after diarrhea has resolved » ; SPILF-JNI-2024-PCC « 48h » selon le CLIN → proposer « jusqu'à 48 h après la fin de la diarrhée, selon la politique de l'établissement » en **brouillon** |

### 15.4 Traitement par situation (adulte, voie orale sauf mention)

**A. 1er épisode, non grave ou grave, SANS facteur de risque de récidive**
- 1re ligne : fidaxomicine 200 mg × 2/j, 10 j [ESCMID-2021-ICD-traitement p. 13, Strong/Moderate ; IDSA-SHEA-2021-ICD-focused, conditional/moderate].
- Alternative : vancomycine 125 mg × 4/j, 10 j [ESCMID-2021-ICD-traitement « suitable alternative », Strong/High ; SPILF-2022-ICD-diapo « 2ème choix »].
- Métronidazole 500 mg × 3/j, 10 j **seulement** si fidaxomicine et vancomycine indisponibles [ESCMID-2021-ICD-traitement, Strong/Moderate].
- **Non tranché** : l'algorithme SPILF 2026 pour cette branche est une image non lisible ; Rev Prat dit « suit l'algorithme habituel » → reprendre SPILF 2022 / ESCMID 2021 et marquer « à confirmer sur le texte SPILF 2026 ».

**B. 1er épisode AVEC facteur(s) de risque de récidive**
- Fidaxomicine standard (200 mg × 2/j, 10 j) **ou** pulsée (200 mg × 2/j J1-J5 puis 200 mg 1 jour sur 2 J7-J25) [SPILF-2026-ICD-JNI, Grade AE].
- Vancomycine pulsée seule non recommandée en alternative ; pas de TMF après fidaxomicine [SPILF-2026-ICD-JNI, Grade AE].
- **Non tranché** : conduite si fidaxomicine indisponible. ESCMID 2021 et SPILF 2022 proposaient vancomycine + bezlotoxumab (caduc). Rev Prat affirme que la vancomycine n'est plus proposée, la diapositive vise seulement la « vancomycine pulsée seule » → **avis spécialisé**.
- Divergence : la fidaxomicine pulsée est « off-label » selon ESCMID 2021 (p. 15) mais figure désormais dans le RCP DIFICLIR (« Schéma prolongé-pulsé », §4.2).

**C. Forme grave (non compliquée)**
- Vancomycine 125 mg × 4/j 10 j ou fidaxomicine 200 mg × 2/j 10 j, sans supériorité démontrée [ESCMID-2021-ICD-traitement p. 17, GPS ; SPILF-2022-ICD-diapo].
- Pas d'ajout systématique de métronidazole IV [ESCMID-2021-ICD-traitement, Weak against ; SPILF-2021-info-antibio-94].
- **Divergence posologique** : le RCP de la vancomycine orale autorise « 500 mg toutes les 6 heures pendant 10 jours en cas d'ICD sévère ou compliquée » ; ESCMID 2021 : « The use of vancomycin 500 mg four times daily is not recommended » ; SPILF 2022 : pas de données pour les hautes doses → modéliser 125 mg × 4/j et signaler la divergence.
- Critère créatinine : ESCMID/SPILF en relatif (> 50 % de la base) vs IDSA en absolu (> 1,5 mg/dL) → retenir la définition ESCMID/SPILF, signaler IDSA.

**D. Forme grave-compliquée / fulminante**
- Avis chirurgical systématique et précoce ; approche multidisciplinaire [ESCMID-2021-ICD-traitement « Consult a surgeon for any severe-complicated case » ; SPILF-2022-ICD-diapo].
- Antibiotique : vancomycine ou fidaxomicine orale [SPILF-2022-ICD-diapo ; ESCMID-2021-ICD-traitement] ; tigécycline IV (charge 100 mg puis 50 mg/12 h) à discuter si aggravation/réfractaire [ESCMID-2021-ICD-traitement, Weak/Very low].
- **Divergence majeure** : IDSA-SHEA-2017-ICD → vancomycine **500 mg × 4/j** per os ou par sonde + vancomycine rectale 500 mg dans ~100 mL de sérum physiologique toutes les 6 h si iléus + **métronidazole IV 500 mg/8 h** (strong/moderate). ESCMID 2021/SPILF 2022 → pas de haute dose, métronidazole IV seulement si voie orale impossible ou faibles concentrations intraluminales attendues. → Statut **avis spécialisé** ; afficher les deux options sourcées.
- Chirurgie : colectomie subtotale avec conservation du rectum, ou iléostomie de dérivation avec lavage colique et vancomycine antérograde [IDSA-SHEA-2017-ICD] ; colectomie partielle ou iléostomie pour éviter la colectomie totale [ESCMID-2021-ICD-traitement, Weak/Very low]. Seuils chirurgicaux (lactates, leucocytes) : **non trouvés** dans les textes lus.
- TMF de sauvetage si chirurgie impossible [ESCMID-2021-ICD-traitement, Weak/Very low] → avis spécialisé.

**E. Voie orale impossible**
- Administration intraluminale (sonde gastroduodénale, voie colique) de vancomycine ou fidaxomicine aux doses orales standard ± métronidazole IV 500 mg × 3/j ou tigécycline IV [ESCMID-2021-ICD-traitement p. 19-20 ; SPILF-2022-ICD-diapo « administration locale +/- métronidazole IV ou tigécycline »]. Dose rectale : seulement IDSA 2017 (500 mg dans ~100 mL toutes les 6 h). Fidaxomicine intraluminale : « There is no data » (ESCMID p. 20).

**F. Réfractaire (pas de réponse après 3-5 j)**
- Non compliquée et stable : revoir le diagnostic, vérifier l'observance [ESCMID-2021-ICD-traitement p. 20-21 ; SPILF-2021-info-antibio-94].
- Aggravation : avis chirurgical ; tigécycline, TMF à discuter [ESCMID-2021-ICD-traitement ; SPILF-2022-ICD-diapo] → avis spécialisé.

**G. 1re récidive**
- 1re ligne : fidaxomicine standard ou pulsée [SPILF-2026-ICD-JNI, Grade AE ; REVPRAT-2026-ICD-SPILF « la fidaxomicine s'établit ici aussi en 1re ligne » ; ESCMID-2021-ICD-traitement si épisode initial traité par vancomycine/métronidazole, Strong/Low ; IDSA-SHEA-2021-ICD-focused].
- 2e intention si fidaxomicine non disponible/accessible : vancomycine standard (125 mg × 4/j 10 j) ou pulsée/dégressive (6 semaines) [SPILF-2026-ICD-JNI, Grade AE].
- TMF : recommandée après vancomycine (standard Grade B ; pulsée Grade C) ; possible après fidaxomicine ; possible chez les patients à haut risque de morbi-mortalité et chez les > 70 ans quel que soit le traitement [SPILF-2026-ICD-JNI].
- **Non tranché** : 1re récidive après un 1er épisode déjà traité par fidaxomicine (ESCMID proposait + bezlotoxumab, caduc) → fidaxomicine pulsée ou vancomycine + TMF selon SPILF 2026 ? Non explicite dans le texte lisible → avis spécialisé.

**H. ≥ 2e récidive (récidives multiples)**
- Vancomycine ou fidaxomicine puis TMF [REVPRAT-2026-ICD-SPILF ; ESCMID-2021-ICD-traitement « FMT after SoC antibiotic pre-treatment », Weak/Moderate ; IDSA-SHEA-2017-ICD (strong/moderate) après au moins 2 récidives]. TMF : évaluation multidisciplinaire, produits standardisés [ESCMID-2021-ICD-traitement p. 24] ; centres GFTF validés avec l'ANSM [SPILF-2026-ICD-JNI] → **orienter vers un centre de TMF (avis spécialisé)**. Formulation, voie et dose de TMF : hors champ (non modélisées).
- Rifaximine en relais : option IDSA 2021 (NON VÉRIFIÉ mot à mot) mais « non recommandée » par SPILF-2021-info-antibio-94 (résistance croisée avec la rifampicine) → ne pas modéliser.

**I. Grossesse**
- ESCMID-2021-ICD-traitement p. 31 : « we prefer vancomycin during pregnancy » ; RCP-fidaxomicine §4.6 : « il est préférable d'éviter l'utilisation de la fidaxomicine pendant la grossesse » ; RCP-vancomycine-orale §4.6 : utilisation envisageable « quel qu'en soit le terme » ; CRAT-vancomycine-grossesse (registre existant) : vancomycine utilisable à tout terme, « pratiquement pas absorbée par voie digestive ». Éviter hautes doses/prolongation (ESCMID). Allaitement : fidaxomicine, choisir entre allaitement et traitement (RCP §4.6) ; vancomycine orale « envisageable » (RCP §4.6).

### 15.5 Durées et point de départ

| Schéma | Durée | Source |
|---|---|---|
| Fidaxomicine standard | 10 j à partir du début du traitement | RCP-fidaxomicine §4.2 ; ESCMID-2021-ICD-traitement ; SPILF-2026-ICD-JNI |
| Fidaxomicine pulsée | J1-J5 × 2/j, pas de prise J6, puis 1 jour sur 2 J7-J25 (25 j) | RCP-fidaxomicine §4.2 « pas de prise de comprimé le jour 6 » ; SPILF-2026-ICD-JNI |
| Vancomycine standard | 10 j | RCP-vancomycine-orale §4.2 ; ESCMID-2021-ICD-traitement |
| Vancomycine pulsée/dégressive | 14 j × 4/j, 7 j × 2/j, 7 j × 1/j, 7 j 1 j/2, 7 j 1 j/3 (6 semaines) | SPILF-2026-ICD-JNI ; ESCMID-2021-ICD-traitement p. 23 |
| Métronidazole (si seul disponible) | 10 j | ESCMID-2021-ICD-traitement ; SPILF-2022-ICD-diapo |
| Prolongation | Déconseillée au-delà de 10-14 j pour non-réponse ou antibiothérapie concomitante | ESCMID-2021-ICD-traitement p. 31 ; IDSA-SHEA-2017-ICD (pas de recommandation) |

Note : le schéma dégressif du RCP de la vancomycine orale (« 125-500 mg/jour tous les 2-3 jours pendant au moins 3 semaines ») diffère du schéma SPILF/ESCMID → utiliser celui de la SPILF et signaler.

### 15.6 Surveillance

- Évaluer la réponse quotidiennement, conclure après ≥ 3 j ; réfractaire si pas de réponse à 3-5 j [ESCMID-2021-ICD-traitement p. 10 ; SPILF-2022-ICD-diapo]. La normalisation des selles peut prendre des semaines (ESCMID p. 10).
- Pas de test de guérison [ESCMID-2016-ICD-diagnostic ; SFM-2025-fiche-ICD].
- Vancomycine orale : dosage sérique chez les patients avec maladie inflammatoire de la muqueuse intestinale (RCP §4.2/4.4) ; envisager la résiduelle en cas de haute dose, exposition prolongée, insuffisance rénale (IDSA-SHEA-2017-ICD). **Aucun calendrier chiffré** dans ces sources pour la voie orale.
- AVK + vancomycine : surveillance de l'INR (RCP §4.5, libellé commun aux voies IV et orale).
- Informer le patient sortant des signes de récidive [HCSP-2008-ICD p. 5].

### 15.7 Ce qui reste NON tranché (→ brouillon / avis spécialisé)

1. Branche « 1er épisode sans facteur de risque » de SPILF 2026 (image illisible).
2. Alternative à la fidaxomicine chez le patient à haut risque quand elle est indisponible (bezlotoxumab retiré ; Rev Prat et diapositive divergent).
3. Forme fulminante : vancomycine 125 vs 500 mg × 4/j ; métronidazole IV systématique (IDSA) ou non (ESCMID).
4. Durée des précautions contact (fin de diarrhée vs + 48 h).
5. Profil GDH+/toxine− ; seuil de Ct de la PCR.
6. Seuil d'âge du haut risque (> 65 vs ≥ 65) ; définition de la gravité (créatinine relative vs absolue).
7. Indications et modalités de la TMF (centres, produits) : orienter vers un centre GFTF.
8. Ordre fidaxomicine/vancomycine en récidive après un épisode déjà traité par fidaxomicine.

---

## 16. Molécules

### 16.1 Fidaxomicine — DIFICLIR 200 mg, comprimé pelliculé [RCP-fidaxomicine]

- **Source** : RCP européen (procédure centralisée), annexe I de l'EPAR en français, titulaire Tillotts Pharma GmbH : https://www.ema.europa.eu/fr/documents/product-information/dificlir-epar-product-information_fr.pdf ; fiche BDPM **CIS 61973350** (page mise à jour 03/11/2026, renvoie à l'EMA). Rubrique 10 « date de mise à jour du texte » vide dans le PDF ; métadonnées du PDF : 28/09/2023. Consultée.
- **Statut** : liste I, **prescription hospitalière**, agréée aux collectivités, inscrite sur la liste de rétrocession ; déclaration de commercialisation 19/11/2012 ; SMR important, ASMR III (avis CT 14/02/2024 : le schéma prolongé-pulsé ne modifie pas l'ASMR) [BDPM-dificlir-fiche].
- **§4.1** : « traitement des infections à Clostridioides difficile (ICD), appelées également diarrhées associées à C. difficile (DACD) chez les patients adultes ».
- **§4.2 Posologie adulte** : « La dose recommandée est de 200 mg (un comprimé) deux fois par jour (une fois toutes les 12 heures) pendant 10 jours » ; schéma prolongé-pulsé : « deux fois par jour du jour 1 au jour 5 (pas de prise de comprimé le jour 6) puis une fois tous les deux jours du jour 7 au jour 25 ». Granulés pour suspension buvable 40 mg/mL utilisables chez l'adulte ayant des difficultés à avaler. Comprimés « administrés entiers avec de l'eau », « au cours ou en dehors des repas ».
- **Fonction rénale** : « Aucune adaptation posologique n'est jugée nécessaire. » ; prudence en « insuffisance rénale sévère » (données limitées). Aucun palier, aucune grandeur (ClCr/DFG) ni consigne d'hémodialyse dans le RCP. Insuffisance hépatique : pas d'adaptation, prudence si modérée à sévère. Sujet âgé : pas d'adaptation.
- **§4.3** : hypersensibilité à la substance active ou aux excipients (seule contre-indication).
- **§4.4** : hypersensibilité dont « angioedèmes sévères » ; « prudence chez les patients ayant une allergie connue aux macrolides » ; prudence en cas de « colite pseudo-membraneuse ou une ICD fulminante ou engageant le pronostic vital » (données limitées) ; inhibiteurs puissants de la P-gp « déconseillée ».
- **§4.5** : substrat de la P-gp ; association déconseillée avec « la ciclosporine, le kétoconazole, l'érythromycine, la clarithromycine, le vérapamil, la dronédarone et l'amiodarone » ; inhibiteur faible à modéré de la P-gp intestinale : effet sur le « dabigatran etexilate, ne peut pas être exclu » ; digoxine et rosuvastatine : pas d'effet cliniquement pertinent. Aucune mention AVK ni QT.
- **§4.6 Grossesse** : « Il n'existe pas de donnée sur l'utilisation de la fidaxomicine chez la femme enceinte » ; « il est préférable d'éviter l'utilisation de la fidaxomicine pendant la grossesse ». Allaitement : interrompre l'allaitement ou le traitement selon le bénéfice. **CRAT fidaxomicine : introuvable.**
- **§5.1 (EXTEND)** : guérison clinique persistante 30 j après la fin du traitement 70,1 % (fidaxomicine prolongée-pulsée) vs 59,2 % (vancomycine 125 mg × 4/j 10 j).

### 16.2 Vancomycine per os [RCP-vancomycine-orale] — et statut de [RCP-vancomycine]

- **Vérification de l'id existant** : `RCP-vancomycine` = « RCP VANCOMYCINE VIATRIS 125 mg (CIS 60033510) … mis à jour le 19/10/2026 ». Relu le 2026-11-06 : présentation « **poudre pour solution à diluer pour perfusion** » ; §4.1 limité à « Administration intraveineuse » et « Administration intra-péritonéale » ; **aucune indication ni posologie orale, aucune mention de C. difficile en §4.1/§4.2**. Seules mentions : « Après administration orale, il est attendu que la surveillance des concentrations sériques de vancomycine soit effectuée chez les patients présentant des maladies inflammatoires intestinales » (§4.2) et, dans la notice, le cas d'une vancomycine « administrée en perfusion au lieu d'une administration par voie orale ». → **Cet id ne peut pas justifier la voie orale** ; nouvel id proposé `RCP-vancomycine-orale`.
- **Source retenue** : RCP **VANCOMYCINE VIATRIS 500 mg, poudre pour solution à diluer pour perfusion ou pour solution buvable**, **CIS 69031610**, « ANSM - Mis à jour le : 22/10/2026 », https://base-donnees-publique.medicaments.gouv.fr/medicament/69031610/extrait — consultée. Libellé §4.2 identique relevé dans VANCOMYCINE SANDOZ 500 mg (CIS 64022454, RCP 17/06/2026). Aucune gélule de vancomycine trouvée en France (SPILF 2026 évoque la « vancomycine capsule disponible en suisse »).
- **§4.1** : « Administration orale — La vancomycine est indiquée dans tous les groupes d'âges pour le traitement des infections à Clostridium difficile (CDI) ».
- **§4.2 Posologie (≥ 12 ans)** : « 125 mg toutes les 6 heures pendant 10 jours pour un premier épisode d'ICD non sévère. Cette dose peut être augmentée à 500 mg toutes les 6 heures pendant 10 jours en cas d'ICD sévère ou compliquée. La dose maximale journalière ne devrait pas dépasser 2 g. » Récurrences multiples : « 125 mg 4 fois par jour pendant 10 jours, suivi soit d'une diminution progressive de la dose … soit suivi d'un traitement itératif, p.ex., 125-500 mg/jour tous les 2-3 jours pendant au moins 3 semaines. » « Dès que possible, l'antibiotique suspecté d'être à l'origine de l'ICD doit être arrêté. »
- **Préparation orale (§4.2/6.6)** : « Dissoudre le contenu d'un flacon de 500 mg avec 10 mL d'eau potable » ; dilution dans du jus de pomme ou d'orange avant administration ; tableau volume/dose (500 mg = 10 mL ; 250 mg = 5 mL ; 100 mg = 2 mL…) — **125 mg ne figure pas dans le tableau** (la concentration se déduit de 500 mg/10 mL, déduction non écrite dans le RCP). Conservation de la solution reconstituée dans l'eau potable : « 4 jours à 4°C ou à 25°C ». Excipients : §6.1 « Sans objet » (pas de PEG 400/NADA, point soulevé par ESCMID pour la grossesse).
- **Fonction rénale (voie orale)** : **aucune adaptation posologique** prévue pour la voie orale (les paliers ClCr du RCP concernent la voie IV). §4.4 « Potentiel d'absorption systémique » : « L'absorption peut être augmentée chez les patients atteints de maladies inflammatoires de la muqueuse intestinale ou de colite pseudomembraneuse due à Clostridium difficile » ; risque d'effets indésirables « surtout en cas d'insuffisance rénale concomitante ». Hémodialyse : rien de spécifique à la voie orale.
- **§4.3** : hypersensibilité ; voie IM interdite.
- **§4.4 (voie orale)** : « L'administration intraveineuse de vancomycine n'est pas efficace pour le traitement des infections à Clostridium difficile. » ; « Les médicaments inhibant la motilité gastro-intestinale doivent être évités et l'utilisation des inhibiteurs de la pompe à protons devrait être réévaluée. » ; « La vancomycine orale augmente le risque de sélection d'Entérocoques résistants à la vancomycine ».
- **§4.5** : warfarine/anticoagulants oraux : « suivre l'INR fréquemment pendant et rapidement après l'administration concomitante » (texte commun aux voies) ; néphrotoxiques/ototoxiques (concerne surtout la voie IV).
- **§4.6** : grossesse — « son utilisation puisse être envisagée si besoin au cours de la grossesse, quel qu'en soit le terme » ; allaitement — voie orale « envisageable » (faible absorption digestive). CRAT : [CRAT-vancomycine-grossesse] (registre existant, mise à jour 26/12/2024).
- **Divergence RCP / recommandations** : 500 mg × 4/j (RCP, forme sévère) vs « not recommended » (ESCMID 2021) ; schéma itératif « 125-500 mg/jour tous les 2-3 jours » (RCP) vs schéma pulsé de 6 semaines (SPILF 2026/ESCMID).

### 16.3 Métronidazole per os / IV (posologie ICD des recommandations uniquement ; RCP attribué à un autre agent)

- Per os : « 500 mg three times daily for 10 days », uniquement si vancomycine et fidaxomicine indisponibles [ESCMID-2021-ICD-traitement p. 13, Strong/Moderate] ; « 500 mg/8 h qsp 10j » [SPILF-2022-ICD-diapo diapo 9].
- IV (voie orale impossible, en adjonction) : « 500 mg 3 times daily » [ESCMID-2021-ICD-traitement p. 20] ; « 500 mg 8/h qsp 10j » [SPILF-2022-ICD-diapo] ; fulminant : « 500 mg intravenously every 8 hours » [IDSA-SHEA-2017-ICD].

### 16.4 Bezlotoxumab — NE PAS MODÉLISER

- Arrêt de commercialisation (23/05/2025), AMM abrogée (20/10/2026) [BDPM-zinplava-arret ; EMA-2026-zinplava-retrait].

### 16.5 Autres molécules citées, RCP non lu

- **Tigécycline IV** (charge 100 mg puis 50 mg/12 h, formes graves/compliquées réfractaires, voie orale impossible) : posologie issue d'ESCMID 2021 et SPILF 2022 ; **RCP non lu** (hors attribution) ; usage hors AMM probable pour cette indication (NON VÉRIFIÉ).
- **Rifaximine** : non recommandée (SPILF-2021-info-antibio-94) ; RCP non lu.

---

## 17. Fichiers téléchargés (traçabilité)

Dossier : `C:\Users\hacuu\AppData\Local\Temp\claude\e0159439f992dac2\514ac18c-5803-4d79-87ea-0aea3de5cf58\scratchpad\elargissement\telechargements\clostridioides-difficile\` — spilf-jni2026-sg05-02.pdf, spilf-icd-2022.pptx, spilf-icd-2014.pptx, info-antibio-94.pdf, escmid-2021-aam.pdf, escmid-2016-diag.pdf, idsa-2017.html, hcsp-2008.pdf, sf2h-2009.pdf, sfm-2025-cdiff.pdf, jni2024-precautions.pdf, dificlir-epar-fr.pdf, fidaxo-61973350.html, vanco-60033510.html, vanco-69031610.html, vanco-64022454.html, zinplava-bdpm.html, zinplava-ema.html, revprat-2026.html.
