# Recherche documentaire — Infections intra-abdominales de l'adulte

Date de consultation de toutes les sources : **2026-11-06**.
Méthode : WebSearch + WebFetch ; les PDF ont été téléchargés (curl, ou copie binaire renvoyée par WebFetch) puis leur texte extrait localement (pypdf) ; les textes PubMed Central open access (WSES) ont été lus en XML intégral via l'API Europe PMC ; les pages HAS, BDPM (RCP) et CRAT ont été lues en HTML/JSON brut. Chaque extrait cité ci-dessous a été **effectivement lu** dans le texte extrait, sauf mention « NON LU » / « non lisible ».
Choix rédactionnel : les extraits verbatim sont volontairement **courts** (fragment décisif : dose, durée, critère, grade), le reste étant paraphrasé avec un repère précis (page, recommandation, tableau). Les paraphrases sont signalées par « (paraphrase) ».
Population : adulte uniquement. Je ne suis ni médecin ni pharmacien : ce document est une recherche documentaire, pas une validation clinique.

Convention des statuts d'accès :
- **consultee** : texte intégral (ou partie pertinente) lu.
- **contenu_non_lisible** : document atteint (titre/résumé/page d'accueil) mais texte pertinent non lu (403, paywall, image).
- **introuvable** : recherché sans succès.

Identifiants de sources : ceux de `docs/sources/registre-intra-abdominal.json` (nouveaux) ou de `src/clinical/sources/registre.json` (déjà présents : `SPILF-GPIP-2021-durees`, `HAS-2024-synthese-antibiotherapie`, `SPILF-SFPT-CASFM-2026-posologies`, `SFPT-SFAR-2018-betalactamines`, `RCP-*` des molécules déjà intégrées).

---

## 0. Panorama des textes en vigueur (ce qui remplace quoi)

| Corpus | Texte en vigueur au 2026-11-06 | Remplace / statut |
|---|---|---|
| Péritonites et IIA nécessitant un geste (communautaires, associées aux soins, postopératoires) — **France** | **SFAR + FCVD, SFCD, SFED, SFM, SFR, SPILF, SFPT : RFE « Prise en charge thérapeutique des infections intra-abdominales de l'adulte » 2026** (validée CA SFAR 24/06/2026) — `SFAR-2026-IIA` | Remplace la RFE SFAR/SRLF/SPILF/AFC/SFCD 2015 (Montravers, Anesth Reanim 2015;1:75-99 / ACCPM 2015;34:117-30) — `SFAR-2015-IIA` |
| Champ **exclu** par SFAR 2026 : infections biliaires, abcès hépatiques isolés, infections primaires du cirrhotique, appendicites non opérées, aplasie/greffe d'organe solide | Voir lignes suivantes | SFAR 2015 les excluait déjà (+ « infections sigmoïdiennes ») |
| Diverticulite — France | **HAS 2017 RBP « Prise en charge médicale et chirurgicale de la diverticulite colique »** (novembre 2017) — `HAS-2017-diverticulite` ; **fiche HAS « Choix et durées d'antibiothérapies : diverticulite aiguë sigmoïdienne non compliquée »** (validée 15/07/2021, mise en ligne 27/08/2021, mise à jour 13/05/2025) — `HAS-2021-diverticulite` ; reprise dans la synthèse HAS mise à jour décembre 2024 — `HAS-2024-synthese-antibiotherapie` | HAS 2017 actualise la RBP HAS 2006 (non lue) |
| Diverticulite — international | WSES 2020 (Sartelli, WJES 2020;15:32) — `WSES-2020-diverticulite` | Met à jour WSES 2016 (non lue) |
| Appendicite — international | WSES 2020 « Jerusalem guidelines » (Di Saverio, WJES 2020;15:27) — `WSES-2020-appendicite` | Met à jour 2016 (non lue) |
| Infections biliaires (cholécystite, angiocholite) | **Tokyo Guidelines 2018** : antimicrobiens (Gomi, JHBPS 2018;25:3-16) — `TG18-antimicrobiens` ; gravité angiocholite (Kiriyama, JHBPS 2018;25:17-30) — `TG18-angiocholite` ; gravité cholécystite (Yokoe, JHBPS 2018;25:41-54) — `TG18-cholecystite` (non lisible) ; WSES 2020 cholécystite lithiasique (Pisano, WJES 2020;15:61) — `WSES-2020-cholecystite` | Aucune recommandation française dédiée trouvée. Aucune version « TG2x » postérieure trouvée (recherche Europe PMC 2026 : seules des études de validation de TG18). |
| IIA — international transversal | WSES 2017 (Sartelli, WJES 2017;12:29) — `WSES-2017-IIA` ; WSES/GAIS/SIS-E/WSIS/AAST « global clinical pathways » 2021 (WJES 2021;16:49) — `WSES-2021-parcours-IIA` ; SIS 2017 (Mazuski, Surg Infect 2017;18:1-76) — `SIS-2017-IIA` (résumé seul) | — |
| IDSA | SIS/IDSA 2010 (Solomkin, CID 2010;50:133-64) — `IDSA-2010-IIA` (résumé seul) ; **IDSA 2024 « Part 1 »** (évaluation du risque, imagerie, microbiologie ; CID 2024;79 Suppl 3) — `IDSA-2024-IIA-partie1` (page IDSA lue, statut « CURRENT ») | La partie « antibiothérapie » de 2010 n'a pas encore d'actualisation IDSA trouvée (page IDSA : « Part 1 of an update ») |
| Péritonite bactérienne spontanée (cirrhose) | **EASL 2018** CPG décompensation de la cirrhose (J Hepatol 2018;69:406-60) — `EASL-2018-cirrhose` ; AFEF/SPILF 2020 (alternatives à la norfloxacine en prophylaxie) — `AFEF-2020-norfloxacine` | Aucune version EASL plus récente trouvée (WebSearch). AASLD 2021 repérée, NON LUE. |
| Abcès hépatique pyogène | **Aucune recommandation dédiée trouvée** (SPILF, SNFGE, AFEF, ESCMID). Seuls repères : durée SPILF/GPIP 2021 (`SPILF-GPIP-2021-durees`) et note du tableau 5 TG18 | Revue systématique et essai en cours (TIME-TO-LIA, 3 vs 6 semaines) repérés, non lus |
| Durées (transversal) | SPILF/GPIP 2021 (diaporama SPILF 10/03/2021) — `SPILF-GPIP-2021-durees` | Pour péritonite communautaire, SFAR 2026 (4 j, appendicite compliquée 2 j) est plus récent et plus précis |
| Antibioprophylaxie (appendicectomie, cholécystectomie, colorectal) | SFAR/SPILF RFE 2024 « Antibioprophylaxie en chirurgie et médecine interventionnelle », **V3.0 du 04/05/2026** — `SFAR-SPILF-2024-antibioprophylaxie` | — |
| *C. difficile* (place du métronidazole) | ESCMID 2021 (non lu) via diaporama SPILF 09/02/2022 — `SPILF-2022-ICD-diapo` | Volet « diagnostic/facteurs de risque » SPILF 2014 marqué « en cours de révision » (page SPILF) |
| Essais pivots | STOP-IT (Sawyer, NEJM 2015) — `STOP-IT-2015` ; DURAPOP (Montravers, ICM 2018) — `DURAPOP-2018` | résumés lus |

Points de vigilance de vigueur :
- La page « recommandations » SPILF (lue le 2026-11-06) liste « Infections intra abdominales, SFAR, 2026 » avec le lien de téléchargement SFAR ; aucune IIA n'y est marquée « en cours de révision ».
- **SFAR 2026 ne traite ni les infections biliaires, ni la cirrhose, ni les abcès hépatiques isolés, ni l'appendicite non opérée** : pour ces situations, aucune source française récente n'a été trouvée en dehors des durées SPILF/GPIP 2021.
- **SFAR 2026, Figures 1 à 3** (algorithmes probabilistes communautaire, associé aux soins, antifongique) sont des **images non extraites** : seules leurs légendes ont été lues. Les choix décrits ci-dessous viennent des recommandations textuelles R1.2.x et de l'argumentaire.

---

## 1. SFAR 2026 — RFE « Prise en charge thérapeutique des infections intra-abdominales de l'adulte » (`SFAR-2026-IIA`)

- **Organisme** : SFAR, avec FCVD, SFCD, SFED, SFM, SFR, SPILF, SFPT (coordination P. Montravers, C. Roger).
- **Titre exact** : « Prise en charge thérapeutique des Infections intra-abdominales de l'adulte » (Recommandations formalisées d'experts, 2026).
- **Version** : texte validé par le Comité des référentiels cliniques SFAR le 09/06/2026 et le CA SFAR le 24/06/2026 ; méthode GRADE ; 42 recommandations (8 GRADE 1, 13 GRADE 2, 21 avis d'experts, 1 absence de recommandation).
- **URL** : https://sfar.org/download/prise-en-charge-therapeutique-des-infections-intra-abdominales-de-ladulte/?wpdmdl=145222&refresh=6aba1396469fb1790579606 (lien donné par la page SPILF) ; PDF de 91 pages.
- **Statut d'accès** : consultee (texte intégral extrait ; figures non lisibles). **Vigueur** : en_vigueur.

### Extraits — champ et définitions
- Champ (p. 9) : limité aux IIA « nécessitant une intervention (chirurgicale, endoscopique ou radiologique) » ; n'aborde « ni les infections primaires associées à la cirrhose, ni les infections focalisées telles que les infections biliaires ou les abcès hépatiques isolés ».
- Exclusions (p. 9 et tableau PICO p. 15) : « la population pédiatrique, les patients ne relevant pas d'une prise en charge interventionnelle dont les appendicites non opérées, et les patients en aplasie ou greffés d'organe solide ».
- IIA associée aux soins (p. 7) : acquise « lors d'une hospitalisation > 48h ou après acte de soins » ; postopératoire = forme d'IIA associée aux soins après procédure chirurgicale, endoscopique ou radiologique (p. 8, paraphrase).
- Champ 3 (p. 9, paraphrase) : les IIA postopératoires **après une première intervention pour IIA** relèvent du champ 3 (complications) ; les IIA après **chirurgie abdominale réglée** sont un « premier épisode » d'IIA associée aux soins (champ 1).
- Compliquée / non compliquée (p. 8) : « non compliquée » = « limitée à l'organe d'origine, sans diffusion au péritoine » ; « compliquée » = « s'étendant au-delà de l'organe d'origine ».
- Sepsis / choc (p. 8) : définitions Sepsis-3 (variation aiguë « ≥ 2 points du score SOFA » ; choc : vasopresseurs pour PAM ≥ 65 mmHg et « lactatémie >2 mmol/L »). Instabilité hémodynamique (p. 9) : hypotension « nécessitant le recours à un soutien vasopresseur, associée à des signes d'hypoperfusion tissulaire ».
- BMR (p. 8) : « résistance à un agent de trois ou plus catégories d'antibactériens ».
- Carbapénémases communautaires (p. 10, paraphrase) : risque jugé faible en France, **non abordé** par ces RFE.

### Extraits — contrôle de la source (Champ 1, Q1, p. 18)
- **R1.1.1 (GRADE 1)** : instabilité hémodynamique → contrôle de la source « le plus rapidement possible » par voie chirurgicale, avec « lavage de l'ensemble de la cavité abdominale ».
- **R1.1.2 (avis d'experts)** : instabilité non contrôlée en peropératoire → « Damage Control » ; « reprise chirurgicale dans les 24-48 heures ».
- **R1.1.3 (avis d'experts)** : perforation d'organe creux → voie d'abord discutée chirurgien/anesthésiste ; cœlioscopie si hémodynamique le permet (paraphrase).
- **R1.1.4 (GRADE 2)** : IIA postopératoire, patient stable, collection accessible → « traitement mini-invasif (endoscopie interventionnelle ou drainage percutané guidé par l'imagerie) » en première intention.
- **R1.1.5 (GRADE 1)** : diverticulite perforée purulente Hinchey III sans sepsis → « ne pas réaliser un lavage péritonéal exclusif sans résection » ; résection sigmoïdienne avec anastomose primaire ± iléostomie + lavage.

### Extraits — probabiliste communautaire (Q2, p. 22-24)
- **R1.2.1 (GRADE 2)** : IIA communautaire **sans sepsis ni choc** → « céphalosporine de 3ème génération (céfotaxime, ceftriaxone) au métronidazole ».
- **R1.2.2 (GRADE 2)** : ne pas prendre en compte les BLSE dans les IIA communautaires sans sepsis ni choc.
- **R1.2.3 (avis d'experts)** : **sepsis** → carbapénème « uniquement en cas d'antécédent documenté de colonisation ou d'infection à entérobactéries productrices de BLSE dans les 6 mois ».
- **R1.2.4 (GRADE 2)** : **choc septique sans facteur de risque de BLSE** → « pipéracilline-tazobactam ».
- **R1.2.5 (GRADE 2)** : **choc septique avec ≥ 1 facteur de risque de BLSE** → « carbapénème selon la prévalence locale des infections à BLSE ».
- Amoxicilline-acide clavulanique (argumentaire p. 23) : résistance d'*E. coli* de ville « 21,2% » (PRIMO 2023) qui « limite l'utilisation de l'amoxicilline-acide clavulanique en première intention ».
- Entérocoque communautaire (p. 23) : « Il ne faut probablement pas prendre en compte le risque d'entérocoque » dans les IIA communautaires sans gravité.
- Ertapénème (p. 24, paraphrase) : spectre plus étroit (épargne des carbapénèmes larges) mais PK limitante en soins critiques (forte liaison protéique, hypoalbuminémie).
- Pipéracilline-tazobactam + amikacine (p. 24) : en choc avec FdR de BLSE, pip-taz « peut être associée avec de l'amikacine afin d'élargir le spectre » (option, non recommandation numérotée).

### Tableau 1 (p. 27) — facteurs de risque de bactéries résistantes (verbatim abrégé)
- **BLSE** : « ATCD d'infections/colonisation à BLSE < 6 mois » ; « Prévalence locale élevée » ; amoxicilline-clavulanate / C2G / C3G / fluoroquinolones « dans les 6 mois précédents » ; « Voyage en zone d'endémie dans les 3 mois » ; EHPAD/SLD « avec dispositif invasif permanent (sonde urinaire à demeure et/ou gastrostomie) ».
- **BMR** : C3G ou fluoroquinolones « dans les 3 mois » ; portage « de moins de 3 mois d'une BLSE ou d'un Pseudomonas aeruginosa résistant à la ceftazidime » ; « Hospitalisation dans un établissement étranger au cours des 12 mois » ; EHPAD/SLD avec dispositif invasif ; « Échec d'un traitement antérieur par céphalosporine de 3e génération ou fluoroquinolones ou pipéracilline-tazobactam » ; « Récidive précoce (< 15 jours) » sous pip-taz ≥ 3 jours.
- **Entérocoques résistants à l'ampicilline** : « Péritonite d'origine suspectée hépato-biliaire » ; « transplantation hépatique, patient immunodéprimé » ; « déjà sous antibiothérapie ou antibiothérapie préalable par céphalosporine ».
- Argumentaire p. 24 (paraphrase) : ces facteurs ont une faible VPP et une forte VPN en France ; au premier plan : antécédent de BLSE et exposition à > 2 lignes d'antibiotiques à large spectre.

### Extraits — probabiliste associé aux soins, 1er épisode (p. 28-29)
- **R1.2.6 (GRADE 1)** : 1er épisode, **y compris sepsis/choc**, sans FdR de BMR → « l'association céfépime et métronidazole ».
- **R1.2.7 (avis d'experts)** : si « impossibilité de monitorage plasmatique du céfépime » et selon l'écologie → « pipéracilline-tazobactam ».
- **R1.2.8 (avis d'experts)** : choc septique sous céfépime + métronidazole → ajouter un anti-entérocoque « tel que linézolide, vancomycine ou teicoplanine ».
- **R1.2.9 (avis d'experts)** : pip-taz + FdR d'entérocoque ampicilline-résistant → ajouter linézolide, vancomycine ou teicoplanine.
- **R1.2.10 (GRADE 1)** : « au moins deux critères de risque de bactérie multirésistante » → carbapénème ; « En cas de sepsis ou de choc septique, la présence d'un seul critère suffit ».
- Céfépime (p. 29) : utilisation « guidée par le suivi des concentrations plasmatiques » (neurotoxicité) ; aminoside : bénéfice non démontré en probabiliste dans les IIA associées aux soins (paraphrase). SFAR 2015 recommandait pip-taz + aminoside (rappel p. 28).

### Extraits — allergie aux bêta-lactamines (p. 32-36)
- **R1.2.11 (avis d'experts)**, communautaire (y compris sepsis/choc), allergie interdisant céphalosporines et carbapénèmes : « (1) l'association lévofloxacine et métronidazole, ou moxifloxacine* (*après contrôle du QT corrigé), (2) tigécycline ou éravacycline en cas de contre-indication aux fluoroquinolones » ; réévaluation à 48 h.
- **R1.2.12 (avis d'experts)**, associée aux soins : « (1) ciprofloxacine + métronidazole + linézolide ou vancomycine ou teicoplanine ; (2) aztréonam + métronidazole + linézolide ou vancomycine ou teicoplanine ; (3) tigécycline + ciprofloxacine ou éravacycline + ciprofloxacine ».
- Tableau 2 (p. 35, paraphrase) : allergie non retenue ou faible risque → C3G + imidazolé ; risque intermédiaire (réaction immédiate non sévère < 5 ans, urticaire) → éviter les pénicillines, céphalosporine à chaînes latérales différentes, OU monobactam + imidazolé, OU carbapénème ; haut risque (réaction retardée sévère) → lévofloxacine + imidazolé, moxifloxacine, tigécycline ou éravacycline. Tableau 3 (réactivité croisée) = image, non lisible.

### Extraits — antifongiques (p. 36-39, 49-54, 61)
- **R1.2.13 (GRADE 2)** : IIA communautaire en sepsis/choc **ou** associée aux soins → antifongique si examen direct du liquide péritonéal « positif à levures, ou si au moins 3 des critères suivants » : « défaillance hémodynamique, sexe féminin, chirurgie sus-mésocolique, antibiothérapie depuis plus de 48 heures ».
- p. 37 : pas d'antifongique probabiliste dans l'IIA communautaire sans gravité, « même si le l'examen direct du liquide péritonéal revient positif à levures » ; échinocandine à privilégier si FdR de résistance aux azolés (Tableau 4 : exposition récente aux azolés, écologie hospitalière, IRC, neutropénie, tumeur solide).
- **R2.3.1 (avis d'experts)** : culture positive à *Candida* → durée « limiter … à 8 jours » si contrôle de source rapide et efficace, évolution favorable, absence de candidémie. **Absence de recommandation** dans les autres situations (p. 49).
- **R2.3.2 (avis d'experts)** : culture négative ou non disponible → β-D-glucane « à J0 et à J3 » ; si les deux négatifs, arrêt précoce envisageable.
- **R2.4.2 (avis d'experts)** : désescalade antifongique (patient non neutropénique, source contrôlée, prélèvements interprétables, amélioration à 48-72 h, PK/PD optimisée, durée après désescalade > 24 h).
- **R3.3.5 (avis d'experts)** : complication postopératoire avec gravité hémodynamique ou levures à l'examen direct → antifongique probabiliste « en privilégiant les échinocandines ».
- Posologie de désescalade (p. 54) : fluconazole « 12 mg/kg en dose de charge, puis de 6 mg/kg/j ».

### Extraits — admission en soins critiques (p. 39-40)
- **R1.3.1 (GRADE 1)** : sepsis ou choc septique → « admission systématique en soins critiques ».
- **R1.3.2 (GRADE 2)** : sinon, décision selon « Âge >60 ans, comorbidités, péritonite généralisée ».
- **R1.3.3 (avis d'experts)** : scores CPIRO, WSES Sepsis Severity Score, PIPAS envisageables (Annexe 2, p. 75-78, barèmes lus).
- Facteurs de mauvaise évolution (tableau p. 40, paraphrase) : âge, IMC < 20, antécédents cardiovasculaires majeurs, IRC, cancer ; choc, sepsis, péritonite généralisée, collections multiples, perforation sus-mésocolique ; délai de prise en charge chirurgicale.

### Extraits — surveillance (p. 42)
- **R2.1.1 (GRADE 2)** : ne pas faire en systématique pendant 5 jours : « Dosage systématique de la procalcitonine et de la CRP », relaparotomie systématique (hors Damage Control), « Cultures microbiologiques des liquides de drainage ».
- **R2.1.2 (avis d'experts)** : pas de TDM systématique les 5 premiers jours si évolution favorable.

### Extraits — durées d'antibiothérapie (p. 44-47, 60)
- **R2.2.1 (GRADE 1)** : appendicite aiguë **non compliquée**, source contrôlée → pas d'antibiothérapie « au-delà de l'antibioprophylaxie peropératoire (dose unique) ».
- **R2.2.2 (GRADE 1)** : appendicite aiguë **compliquée**, source contrôlée → « antibiothérapie probabiliste postopératoire de courte durée (2 jours) ». Argumentaire p. 46 : 24 h « pourrait » être envisagée chez des patients sans comorbidité, source certainement contrôlée (paraphrase ; essai APPIC 2 j vs 5 j, n = 1005).
- **R2.2.3 (GRADE 1)** : IIA communautaire compliquée (hors appendicite), source contrôlée → « limiter la durée d'antibiothérapie à 4 jours », « y compris en cas de sepsis initial ou de contrôle de la source effectué par drainage percutané ou endoscopique ».
- **R2.2.4 (avis d'experts)** : IIA associée aux soins (hors postopératoire) sans sepsis/choc, source contrôlée → 4 jours.
- **R2.2.5 (GRADE 2)** : IIA associée aux soins **en sepsis ou choc**, source contrôlée → « limiter la durée d'antibiothérapie à 8 jours ».
- **R3.3.4 (avis d'experts)** : complication postopératoire après IIA, source contrôlée et amélioration → 8 jours ; au-delà, « discussion multidisciplinaire ».
- Point de départ (paraphrase de STOP-IT, p. 46) : la durée court **à partir du contrôle de la source** (critère principal évalué « dans les 30 jours suivant le contrôle de la source »).

### Extraits — désescalade et complications (p. 52, 57-61)
- **R2.4.1 (GRADE 2)** : évolution favorable après contrôle de la source → « désescalader l'antibiothérapie après réception des résultats bactériologiques ».
- **R3.1.1 (GRADE 2)** : évolution défavorable suspecte de complication → contrôle de la source « en urgence » ; **R3.1.2** : approche mini-invasive si stable.
- **R3.2.1 (GRADE 2)** : phase précoce (≤ 72 h) : « fièvre, ou d'un iléus, ou de la persistance de défaillance d'organe » → suspecter complication/contrôle imparfait. **R3.2.2** : pas de CRP/PCT, pas de culture de drain en place. **R3.2.3** : > 72 h → scanner TAP injecté (opacification si geste gastrique/colique).
- **R3.3.1 (GRADE 2)** : complication postopératoire → probabiliste couvrant « entérobactéries multirésistantes, dont les BLSE, P. aeruginosa, E. faecium », selon écologie locale et du patient.
- **R3.3.2** : adaptation secondaire aux prélèvements de la reprise ou aux hémocultures. **R3.3.3** : suivi thérapeutique pharmacologique en soins critiques ou si risque de surdosage, selon les recommandations SFAR/SFPT 2018 (`SFPT-SFAR-2018-betalactamines`).

### Annexe 1 (p. 73-74) — posologies proposées (adulte ; colonnes : « usuelles SPILF » | « réanimation, patient grave » | « hyperclairant, ClCr mesurée > 130 mL/min »)
Les colonnes ont été attribuées par la position horizontale du texte dans le PDF (coordonnées x vérifiées).
| Molécule | Usuelle | Réanimation | Hyperclairant |
|---|---|---|---|
| Métronidazole | « 500 mg/8h IV » | « 500 mg/8h IV » | (vide) |
| Céfotaxime | « 1-2 g/8h IV en perfusion de 30 min - 4h » | « 2 g/8H IV en perfusion de 30 min ou perfusion continue » | NA |
| Ceftriaxone | « 1-2 g/j IV » | « 2 g/12h IV en perfusion de 30 min » | NA |
| Céfépime | « 2 g/8h IV en perfusion de 4-8 h » ; si IR et/ou dose ≥ 6 g/j : adaptation par concentrations sériques | DDC 2 g en 30 min puis « 3 g à 4 g/j en perfusion continue » ; monitorage « entre la 24è et la 36è heures » | DDC 2 g puis « 6 g/j en perfusion continue » |
| Pipéracilline-tazobactam | DDC « (4g+500 mg) IV en 30min » puis « (200 mg+25 mg)/kg/j » en continu ou perfusion prolongée de 4 h toutes les 6-8 h | DDC 4 g/0,5 g puis « (16 g + 2000 mg)/j » en continu | DDC puis « (20 g+ 2500 mg)/j » en continu |
| Ertapénème | « 1g/j IV perfusion de 30min ou IM ou SC » | « 1g/12h IV perfusion de 30min » | (vide) |
| Imipénème | « 1 g/6-8h IV en perfusion de 30 min » | « 1 g/8h IV en perfusion de 30 min » | (vide) |
| Méropénème | « 1-2g/8h IV en perfusion de 3 à 8h » | « 3 g/j en perfusion continue » | « 6 g/j en perfusion continue » |
| Amikacine | « 25-30 mg/kg/j IV en une perfusion de 30 min en DUJ » (adaptation Cmax/Cmin) | « 25-30 mg/kg de poids ajusté*/j » | — |
| Lévofloxacine | « 500 mg/12-24h IV » | « 500 mg/12h IV » | NA |
| Ciprofloxacine | « 400 mg/8-12h IV » | « 400 mg/8h IV » | NA |
| Moxifloxacine | « 400 mg/j IV » | « 400 mg/j IV » | — |
| Vancomycine | DDC « 20-30 mg/kg » puis 20-40 mg/kg/j (continu ou /6-12 h), STP | DDC 30 mg/kg, entretien 10-30 mg/kg/j continu selon fonction rénale | 40 mg/kg/j continu |
| Linézolide | « 600 mg/12h IV ou p.o. » | 600 mg/8-12 h | 1800 mg/j continu |
| Teicoplanine | DDC « 12 mg/kg/12h IV pendant 3-5 j » puis 12 mg/kg/j, résiduelles | idem | NA |
| Tigécycline | DDC 100 mg puis « 50 mg/12 h IV » | DDC 100 mg puis « 100mg /12 h IV » | — |
| Éravacycline | « 1 mg/kg/12h IV » | idem | — |
| Caspofungine | < 80 kg : 70 mg J1 puis 50 mg/j ; ≥ 80 kg : 70 mg/j | DDC 140 mg J1 puis 1 mg/kg/j | — |
| Micafungine | ≥ 40 kg : « 100 mg/j IV » | DDC 150 mg J1 puis 100 mg/j (150 mg si obèse ; 200 mg/j possible) | — |
| Fluconazole | DDC 6 mg/kg/12 h J1 puis 6 mg/kg/j | DDC 12 mg/kg J1 puis 6 mg/kg/j | NA |
- Poids ajusté aminosides : « poids idéal + 0,4(poids réel mesuré – poids idéal) ». Insuffisance rénale : renvoi au « GPR (Guide Prescription Rein) via accès Vidal® » ; obèses : www.abxbmi.com/fr. **Gentamicine et amoxicilline-acide clavulanique ne figurent pas dans l'Annexe 1.**

---

## 2. SFAR 2015 — RFE « Prise en charge des infections intra-abdominales » (`SFAR-2015-IIA`)
- **Organisme** : SFAR, SRLF, SPILF, AFC, SFCD (Montravers P et al.). Anesth Reanim 2015;1:75-99 ; version anglaise ACCPM 2015;34:117-30.
- **URL** : https://www.infectiologie.com/UserFiles/File/medias/Recos/2014-inf-intra-abdo-SFAR.pdf
- **Statut d'accès** : consultee (parcouru pour le champ et les points de divergence). **Vigueur** : remplacee (par `SFAR-2026-IIA`, qui la cite comme « dernières recommandations » de 2015, p. 7).
- Champ (p. « 2 » du texte, paraphrase + extrait) : limité aux péritonites nécessitant une prise en charge chirurgicale ; n'abordait pas les infections primaires de la cirrhose ni « les infections biliaires, les abcès hépatiques isolés ou les infections sigmoïdiennes ».
- R43 (allergie, associée aux soins, avis d'expert) incluait l'**amikacine** dans toutes les associations — supprimée en 2026 (R1.2.12).

---

## 3. HAS — diverticulite

### 3a. Fiche « Choix et durées d'antibiothérapies : Diverticulite aiguë sigmoïdienne non compliquée » (`HAS-2021-diverticulite`)
- **Organisme** : HAS (série de fiches avec la SPILF). Validée 15/07/2021, mise en ligne 27/08/2021, **mise à jour 13/05/2025**.
- **URL** : https://www.has-sante.fr/jcms/p_3282886/fr/choix-et-durees-d-antibiotherapies-diverticulite-aigue-sigmoidienne-non-compliquee
- **Statut d'accès** : consultee (HTML). **Vigueur** : en_vigueur.
- Extraits :
  - Diagnostic : imagerie, « scanner abdominal en première intention ».
  - « Le traitement ambulatoire est recommandé en cas de diverticulite non compliquée en l'absence de comorbidité ou de contexte social défavorable. »
  - Sans antibiotique « en l'absence de signes de gravité (notamment pression artérielle systolique ≤ 100 mmHg, fréquence respiratoire ≥ 22/min ou confusion), d'immunodépression [1], de score ASA > 3 [2] ou de grossesse ».
  - Non-réponse au traitement symptomatique : « amoxicilline-acide clavulanique : 1 g 3 fois par jour pendant 7 jours ».
  - Allergie : « ciprofloxacine: 500 mg 2 fois par jour + métronidazole 500 mg 3 fois par jour pendant 7 jours » ou « lévofloxacine 500 mg par jour + métronidazole 500 mg 3 fois par jour pendant 7 jours ».
  - Voie IV recommandée « En cas de signes de gravité, de grossesse, de score ASA > 3 ou d'immunodépression ».
  - Note [1] immunodépression : « congénitale ou acquise, traitement immunosuppresseur ou immunomodulateur, corticothérapie systémique, cancer évolutif, insuffisance rénale terminale ».
- La synthèse HAS (déc. 2024, `HAS-2024-synthese-antibiotherapie`, p. 5) reprend : sans antibiotique en l'absence de gravité ; amoxicilline-acide clavulanique 7 jours ; allergie : ciprofloxacine ou lévofloxacine 7 jours (la synthèse ne mentionne pas le métronidazole, contrairement à la fiche — divergence de présentation, la fiche détaillée fait foi).

### 3b. RBP « Prise en charge médicale et chirurgicale de la diverticulite colique » (`HAS-2017-diverticulite`)
- **Organisme** : HAS, novembre 2017 (texte des recommandations, 23 p.). **URL** : https://www.has-sante.fr/upload/docs/application/pdf/2017-12/prise_en_charge_medicale_et_chirurgicale_-_recommandations.pdf ; fiche de synthèse : https://www.has-sante.fr/upload/docs/application/pdf/2017-12/fs_diverticulite_v5.pdf
- **Statut d'accès** : consultee. **Vigueur** : en_vigueur (volet non compliqué repris par la fiche 2021 ; volet compliqué non actualisé par la HAS).
- Extraits (p. 8-9 du PDF) :
  - Grade A : ambulatoire si non compliquée « (stade Hinchey Ia) » sans comorbidité significative / contexte social défavorable.
  - Grade A : traitement symptomatique sans antibiotique des diverticulites non compliquées « confirmées par le scanner » (mêmes exceptions que 2021).
  - Grade A : non-réponse → voie orale « amoxicilline et acide clavulanique, ou en cas d'allergie, une fluoroquinolone (lévofloxacine ou ciprofloxacine) associé au métronidazole » ; gravité/grossesse/ASA > 3/immunodépression → IV « identique à celle proposée dans la diverticulite compliquée ».
  - AE : durée ne dépassant « pas sept jours » (non compliquée, immunocompétent).
  - Forme perforée avec bulles péricoliques sans péritonite clinique (grade C) / à distance (AE) : antibiothérapie seule.
  - AE : IV « associant amoxicilline-acide clavulanique et gentamicine, ou céfotaxime et métronidazole, ou ceftriaxone et métronidazole. En cas d'allergie prouvée, une association lévofloxacine, gentamicine et métronidazole. »
  - « En l'absence d'argument scientifique, la durée de l'antibiothérapie ne peut pas faire l'objet de recommandations. »
  - Drainage radiologique des abcès « lorsque cela est techniquement faisable » (sans seuil de taille).
  - Hinchey III : lavage péritonéal laparoscopique (LPL) non recommandé (grade A) ; Hinchey IV : « ne pas pratiquer le LPL » (AE).
  - Annexe 1 (p. 16) : Hinchey I « Phlegmon ou abcès péricolique », II « Abcès pelvien, abdominal ou rétropéritonéal (péritonite localisée) », III « Péritonite généralisée purulente », IV « Péritonite fécale ».

---

## 4. WSES (World Society of Emergency Surgery) — textes open access CC-BY lus intégralement (Europe PMC)

### 4a. WSES 2017 IIA (`WSES-2017-IIA`) — Sartelli M et al., WJES 2017;12:29 (PMC5504840). consultee ; en_vigueur (pas de version complète plus récente ; complétée par 4b).
- Durée : « In patients with complicated IAI undergoing an adequate source-control procedure, a short course of antibiotic therapy (3-5 d) is always recommended (Recommendation 1A). »
- IIA non compliquées (appendicite, cholécystite) traitées définitivement : « post-operative antibiotic therapy is not necessary (Recommendation 1A) ».
- Signes persistants au-delà de 5-7 jours de traitement → investigation diagnostique (1C) (paraphrase).
- Entérocoque : couverture « should be always considered » dans les IIA postopératoires.
- Biliaire : couverture spécifique des entérocoques « not routinely suggested for community-acquired biliary infections ».
- Candida : antifongique empirique recommandé pour les IIA nosocomiales, « especially those with recent abdominal surgery or anastomotic leak (Recommendation 1C) » ; non recommandé en communautaire sauf patients critiques/immunodéprimés.
- Annexes 1-4 (posologies, fonction rénale normale ; **non françaises**) : communautaire non critique : « Amoxicillin/clavulanate 1.2-2.2 g 6-hourly » ou « Ceftriazone 2 g 24-hourly + Metronidazole 500 mg 6-hourly » ou céfotaxime 2 g/8 h + métronidazole 500 mg/6 h ; BLSE : ertapénème 1 g/24 h ; critique : pip-taz 4,5 g/6 h ou céfépime 2 g/8 h + métronidazole 500 mg/6 h ; amikacine « 15–20 mg/kg 24-hourly » en cas d'allergie ; échinocandines (caspofungine 70 puis 50 mg ; micafungine 100 mg ; anidulafungine 200 puis 100 mg).

### 4b. WSES/GAIS/SIS-E/WSIS/AAST 2021 « global clinical pathways » IIA (`WSES-2021-parcours-IIA`) — WJES 2021;16:49 (PMC8467193). consultee ; en_vigueur.
- IIA non compliquées : « post-operative antimicrobial therapy is not necessary if source control is adequate ».
- Cholécystite compliquée : cholécystectomie « and antibiotic therapy for 4 days » ; cholécystostomie si patient inopérable sans amélioration après 3-5 jours d'antibiotiques (paraphrase).
- Appendicite compliquée : appendicectomie « and antibiotic therapy for 4 days if source control is adequate (immunocompetent patients) ».

### 4c. WSES 2020 diverticulite (`WSES-2020-diverticulite`) — WJES 2020;15:32 (PMC7206757). consultee ; en_vigueur.
- « In immunocompetent patients with uncomplicated diverticulitis without signs of systemic inflammation, we recommend to not prescribe antibiotic therapy (strong recommendation based on high-quality evidence, 1A). »
- Antibiotiques suggérés si manifestations systémiques ou patients à haut risque : « immunocompromised patients, elderly patients, and those with comorbidities » ; voie orale si possible (1B).
- Bulles péricoliques : essai de traitement non opératoire avec antibiotiques (2C). Abcès < 4-5 cm : antibiotiques seuls (2C) ; gros abcès : drainage percutané + antibiotiques (2C).
- Péritonite diffuse : « We suggest a 4-day period of postoperative antibiotic therapy in complicated ALCD if source control has been adequate (weak recommendation based on moderate-quality evidence, 2B). »

### 4d. WSES 2020 appendicite — Jerusalem guidelines (`WSES-2020-appendicite`) — WJES 2020;15:27 (PMC7386163). consultee ; en_vigueur.
- Rec. 2.1.1 (1A) : discuter le traitement non opératoire (NOM) par antibiotiques chez des patients sélectionnés avec appendicite non compliquée « and absence of appendicolith ». Rec. 2.1.2 (2C) : pas de NOM pendant la grossesse. Rec. 2.3 (1B) : NOM → IV puis relais oral. Statement 2.4 : traitement symptomatique sans antibiotique — « No recommendation ».
- Rec. 7.1 (1A) : « single preoperative dose of broad-spectrum antibiotics » ; « against postoperative antibiotics for patients with uncomplicated appendicitis ».
- Rec. 7.2 (1A) : « against prolonging antibiotics longer than 3–5 days postoperatively in case of complicated appendicitis with adequate source-control » ; Statement 7.2 : arrêt après 24 h « seems safe » chez l'adulte.
- Rec. 6.1 (2B) : abcès/phlegmon appendiculaire : NOM avec antibiotiques ± drainage percutané si pas d'expertise cœlioscopique ; Rec. 6.4 (2C) : ≥ 40 ans traités sans chirurgie → coloscopie et TDM à distance.

### 4e. WSES 2020 cholécystite lithiasique aiguë (`WSES-2020-cholecystite`) — WJES 2020;15:61 (PMC7643471). consultee ; en_vigueur.
- 7.1 : « In uncomplicated ACC, we recommend against the routine use of postoperative antibiotics when the focus of infection is controlled by cholecystectomy. #QoE: high; SoR: strong# »
- 7.2 (forte) : cholécystite compliquée → régime selon pathogènes présumés et risque de résistance. Entérocoque : couverture non systématique en communautaire ; présumé chez l'immunodéprimé/transplanté (paraphrase).
- Gravité : « The TG18 adopted the TG13 severity grading criteria » (le barème lui-même n'est pas reproduit dans ce texte).

---

## 5. Tokyo Guidelines 2018 — infections biliaires

### 5a. TG18 antimicrobiens (`TG18-antimicrobiens`) — Gomi H et al., J Hepatobiliary Pancreat Sci 2018;25:3-16, DOI 10.1002/jhbp.518
- **URL** : https://doi.org/10.1002/jhbp.518 (Wiley : 403) ; lu sur la copie « Publisher's PDF / Version of record » du dépôt Amsterdam UMC : https://pure.amsterdamumc.nl/ws/files/158545466/Tokyo-guidelines-2018-antimicrobial-therapy-for-acute-cholangitis-and-cholecystitis.pdf
- **Statut d'accès** : consultee. **Vigueur** : en_vigueur (aucune révision trouvée).
- Délai (p. 4) : choc septique → antibiothérapie « within an hour » ; autres : « within 6 h of diagnosis ».
- Q2 (p. 7) : « We suggest anaerobic therapy if a biliary-enteric anastomosis is present. (Recommendation 2, level C) ».
- Tableau 3 (p. 6, paraphrase) : grades I-II communautaires : céphalosporines (dont céfotaxime/ceftriaxone) ± métronidazole, ertapénème, fluoroquinolones ± métronidazole ; grade III communautaire et associées aux soins : pip-taz, céfépime/ceftazidime ± métronidazole, carbapénèmes, aztréonam ± métronidazole. Note a : « Vancomycin is recommended to cover Enterococcus spp. for grade III community-acquired acute cholangitis and cholecystitis, and healthcare-associated acute biliary infections. » Note d : anti-anaérobie si anastomose bilio-digestive ; carbapénèmes, pip-taz, céfoxitine ont une activité suffisante. Note e : fluoroquinolones si sensibilité connue ou allergie.
- Q3 angiocholite (p. 10) : « Once the source of infection is controlled, antimicrobial therapy for patients with acute cholangitis is recommended for the duration of 4 to 7 days. (Recommendation 1, level C) »
- Q4 cholécystite (p. 11) : grade I-II : antibiothérapie « only before and at the time of surgery. (Recommendation 1, level B) » ; grade III : « 4 to 7 days » après contrôle de la source (Recommendation 2, level D) — un membre du consensus a jugé les données insuffisantes.
- Tableau 5 (p. 10) : grade I-II cholécystite : arrêt « within 24 h after cholecystectomy » ; perforation, emphysème, nécrose vésiculaire : 4-7 jours ; bactériémie à cocci Gram+ (*Enterococcus*, *Streptococcus*) : « minimum 2 weeks » ; calculs résiduels/obstacle : poursuivre jusqu'à résolution ; abcès hépatique : jusqu'à résolution clinique, biologique et radiologique complète.

### 5b. TG18 gravité de l'angiocholite (`TG18-angiocholite`) — Kiriyama S et al., JHBPS 2018;25:17-30, DOI 10.1002/jhbp.512 ; copie Amsterdam UMC (version publiée). consultee ; en_vigueur.
- Tableau 4 (p. 27 journal) — **Grade III** : dysfonction d'au moins un organe : « hypotension requiring dopamine ≥5 µg/kg per min, or any dose of norepinephrine » ; trouble de conscience ; « PaO2/FiO2 ratio <300 » ; « oliguria, serum creatinine >2.0 mg/dl » ; « PT-INR >1.5 » ; « platelet count <100,000/mm3 ».
- **Grade II** : deux parmi : GB > 12 000 ou < 4 000/mm³ ; « High fever (≥39°C) » ; « Age (≥75 years old) » ; « total bilirubin ≥5 mg/dl » ; hypoalbuminémie (< 0,7 × limite inférieure).
- **Grade I** : ni II ni III à l'admission.
- Tableau 2 (p. 19 journal, paraphrase) : diagnostic suspect = A (fièvre/frissons ou syndrome inflammatoire) + B (cholestase : ictère ou bilan hépatique perturbé) ou C (imagerie : dilatation, cause) ; certain = A + B + C ; fièvre > 38 °C.

### 5c. TG18 gravité de la cholécystite (`TG18-cholecystite`) — Yokoe M et al., JHBPS 2018;25:41-54, DOI 10.1002/jhbp.515
- **Statut d'accès** : contenu_non_lisible (Wiley 403 ; dépôt Université d'Édimbourg 403). Barème **non lu** : à ne pas modéliser sans lecture. Seule information lue (WSES 2020) : TG18 a repris les critères de gravité TG13.

---

## 6. Péritonite bactérienne spontanée (PBS / ISLA) — EASL 2018 et AFEF/SPILF

### 6a. EASL 2018 (`EASL-2018-cirrhose`) — « EASL Clinical Practice Guidelines for the management of patients with decompensated cirrhosis », J Hepatol 2018;69:406-460
- **URL** : https://easl.eu/wp-content/uploads/2018/10/decompensated-cirrhosis-English-report.pdf (version « article in press »). consultee. **Vigueur** : en_vigueur (aucune version plus récente trouvée ; à revérifier sur easl.eu).
- Diagnostic (p. 19) : PBS = « neutrophil count in ascitic fluid of >250/mm3 (II-2;1) » ; culture du liquide et hémocultures avant antibiotiques (II-2;1).
- Traitement (p. 21) : « Third-generation cephalosporins are recommended as first-line antibiotic treatment for community-acquired SBP in countries with low rates of bacterial resistance (I;1). » Forte résistance : pip-taz ou carbapénème (II-2;1). Nosocomiale/associée aux soins : pip-taz si faible prévalence de BMR, carbapénème si BLSE fréquentes, ± glycopeptide/daptomycine/linézolide si BMR Gram+ (I;1).
- Contrôle (p. 21) : seconde ponction « at 48 h » ; échec si baisse des neutrophiles < 25 % (II-2;1). Durée : « at least 5–7 days (III;1) ».
- Albumine (p. 22) : « 1.5 g/kg at diagnosis and 1 g/kg on day 3 » (I;1).
- Prophylaxie secondaire (p. 22) : norfloxacine 400 mg/j (I;1) — voir 6b pour la situation française.

### 6b. AFEF/SPILF — « Alternatives à la Norfloxacine pour la prévention de l'infection spontanée du liquide d'ascite » (`AFEF-2020-norfloxacine`)
- **URL** : https://afef.asso.fr/wp-content/uploads/2023/06/Avis-experts-norfloxacine.pdf (daté 2020 sur la page SPILF). consultee ; en_vigueur. Avis d'experts.
- Indications (p. 1) : prophylaxie primaire si ascite « pauvre en protides (<15 grammes par litre) » et Child-Pugh C ; secondaire après un épisode d'ISLA.
- 1er choix : « ciprofloxacine à la posologie de 500 mg par jour » ; 2e : cotrimoxazole 800/160 mg/j ; norfloxacine 400 mg/j « à la charge du patient » ; rifaximine 550 mg × 2 si encéphalopathie (tableau p. 2).
- Note : pas de traitement curatif de la PBS dans ce texte (seulement la prophylaxie). **Aucune source française sur le traitement curatif de la PBS n'a été trouvée** ; durée SPILF/GPIP 2021 : « Infection de liquide d'ascite : 5 jours si cefotaxime » (diapo 31).

---

## 7. Durées SPILF/GPIP 2021 (`SPILF-GPIP-2021-durees`, déjà au registre) — diaporama SPILF du 10/03/2021, diapos 31-34
- « Infection de liquide d'ascite : 5 jours si cefotaxime » ; « Abcès hépatique non amibien : 28 jours » ; « Diverticulite simple sans réponse au traitement symptomatique : 7 jours ».
- « Perforation digestive (opérée dans les 24 heures) : ≤ 24 heures » ; « Péritonite localisée : 3 jours* » ; « Péritonite généralisée (en dehors des péritonites postopératoires) : 4 jours* » ; « Péritonite postopératoire : 8 jours* » (* si source contrôlée) ; *Candida* peropératoire « ne doit pas faire prolonger la durée ».
- Cholécystite : cholécystectomie non compliquée « ≤ 24 heures » ; vésicule perforée 3 jours ; grade III 3 jours ; drainage percutané 7 jours ; non opérée ou non drainée 7 jours.
- « Angiocholite avec drainage efficace : 3 jours post-drainage (même si bactériémie associée) ».
- Appendicite opérée non perforée « ≤ 24 heures » ; « traitement non chirurgical : 7 jours ».

---

## 8. Antibioprophylaxie SFAR/SPILF 2024 V3.0 (`SFAR-SPILF-2024-antibioprophylaxie`)
- **URL** : https://www.infectiologie.com/UserFiles/File/spilf/recos/2024-rfe-antibioprophylaxie.pdf ; historique des versions : « V3.0 du 04/05/2026 ». consultee (partie digestive) ; en_vigueur.
- « Appendicectomie programmée » : « Céfoxitine 2 g IVL », réinjection 1 g si durée > 2 h (avis d'experts) (p. 80). L'appendicectomie **pour appendicite aiguë** de l'adulte ne figure pas dans ce tableau (seule une ligne pédiatrique) : la dose unique de R2.2.1 SFAR 2026 n'a pas de molécule précisée dans les textes lus.
- Allergie (p. 79-80) : « Si céfoxitine : gentamicine 6-7 mg/kg IVL + métronidazole 1g IVL ». Chirurgie colorectale : métronidazole 1 g per os la veille (+ tobramycine), proctologie : « Métronidazole 1g IVL Dose unique ».

---

## 9. Essais pivots (résumés lus via Europe PMC)
- **STOP-IT** (`STOP-IT-2015`) — Sawyer RG et al., NEJM 2015;372:1996-2005 (PMC4469182). 518 patients, contrôle de source adéquat ; durée fixe « 4±1 calendar days » vs jusqu'à 2 jours après résolution (max 10 j) ; critère composite 21,8 % vs 22,3 % ; durée médiane 4,0 vs 8,0 jours.
- **DURAPOP** (`DURAPOP-2018`) — Montravers P et al., Intensive Care Med 2018;44:300-10. 21 réanimations françaises, IIA postopératoires, randomisation à J8 : arrêt vs poursuite « until day 15 » ; équivalence de mortalité à J45 ; plus de drainages ultérieurs dans le bras court (P = 0,041). Divergence mineure : SFAR 2026 (p. 48) écrit « 8 jours vs 14 jours ».

---

## 10. Sources atteintes mais non exploitées
- **SIS 2017** (`SIS-2017-IIA`) : Mazuski JE et al., Surg Infect 2017;18:1-76 — résumé seul (non open access) : contenu_non_lisible.
- **IDSA/SIS 2010** (`IDSA-2010-IIA`) : Solomkin JS et al., CID 2010;50:133-64 — résumé seul : contenu_non_lisible.
- **IDSA 2024 Part 1** (`IDSA-2024-IIA-partie1`) : page IDSA lue (« CURRENT », publiée 13/06/2024, partie 1 = risque, imagerie, microbiologie) ; texte du guideline non lu.
- **TG18 cholécystite (gravité)** : 403.
- **ESCMID 2021 *C. difficile*** : non lu directement (lu via diaporama SPILF 2022).
- **AASLD 2021 ascite/PBS** : repérée, non lue.

---

## 11. Proposition de modélisation

### 11.1 Situations cliniques à distinguer (arbre de décision)
1. **Péritonite / IIA compliquée communautaire** nécessitant un geste (appendiculaire compliquée, perforation d'ulcère, perforation colique, diverticulite Hinchey III-IV…) — `SFAR-2026-IIA`.
2. **IIA associée aux soins, 1er épisode** (dont postopératoire de chirurgie réglée) — `SFAR-2026-IIA` R1.2.6-R1.2.10.
3. **Complication postopératoire après une 1re intervention pour IIA** (péritonite « tertiaire ») — `SFAR-2026-IIA` champ 3.
4. **Appendicite** : (a) opérée non compliquée ; (b) opérée compliquée (perforée, gangréneuse, abcédée) ; (c) non opérée (traitement antibiotique exclusif) — hors champ SFAR 2026 → `WSES-2020-appendicite` + `SPILF-GPIP-2021-durees` (7 jours) : **brouillon**.
5. **Diverticulite** : (a) non compliquée (« Hinchey Ia » selon HAS 2017) ; (b) abcédée (Hinchey I abcès péricolique, II abcès pelvien/à distance — annexe HAS 2017) ; (c) perforée sans péritonite (bulles) ; (d) péritonite (Hinchey III-IV) → bascule en situation 1.
6. **Cholécystite aiguë** (grade TG18 I/II/III ; cholécystectomie / drainage / ni l'un ni l'autre ; perforation/gangrène).
7. **Angiocholite** (grade TG18 I/II/III ; drainage obtenu ou non ; bactériémie à cocci Gram+).
8. **Abcès hépatique pyogène** — **avis spécialisé** (aucune recommandation dédiée).
9. **PBS du cirrhotique** (communautaire / associée aux soins / nosocomiale) — `EASL-2018-cirrhose`.
10. Hors champ à signaler (renvoi avis spécialisé) : immunodépression profonde (aplasie, greffe d'organe solide — exclus de SFAR 2026), pancréatite infectée (non traitée ici), *C. difficile* (autre module).

### 11.2 Données d'entrée (questions à poser)
- Lieu d'acquisition : communautaire / associée aux soins (hospitalisation > 48 h ou acte de soins) / postopératoire (chirurgie réglée vs reprise après IIA). [`SFAR-2026-IIA` p. 7-9]
- Gravité : sepsis (ΔSOFA ≥ 2) ; choc septique (vasopresseurs + lactate > 2 mmol/L). [`SFAR-2026-IIA` p. 8]
- Source : organe, IIA compliquée ou non, geste de contrôle réalisé (chirurgie, drainage percutané/endoscopique), date du contrôle de la source, contrôle jugé adéquat.
- FdR BLSE (Tableau 1 BLSE) ; nombre de FdR BMR (Tableau 1 BMR) ; FdR entérocoque ampi-R (origine hépato-biliaire, transplanté hépatique/immunodéprimé, antibiothérapie en cours ou céphalosporine préalable).
- FdR candidose (examen direct levures ; défaillance hémodynamique ; sexe féminin ; chirurgie sus-mésocolique ; antibiothérapie > 48 h) et FdR de résistance au fluconazole (Tableau 4).
- Allergie aux bêta-lactamines : profil (non retenue / faible / intermédiaire / haut risque — Tableau 2 SFAR).
- Âge > 60 ans, comorbidités, péritonite généralisée (admission en soins critiques). [R1.3.2]
- Possibilité de dosage plasmatique du céfépime (R1.2.7). QTc si moxifloxacine.
- Diverticulite : confirmation scanner, Hinchey, signes de gravité HAS (PAS ≤ 100 mmHg, FR ≥ 22/min, confusion), immunodépression (définition HAS), ASA > 3, grossesse, réponse au traitement symptomatique.
- Biliaire : grade TG18 (angiocholite : tableau lu ; cholécystite : barème non lu), drainage/cholécystectomie et date, anastomose bilio-digestive, hémocultures (cocci Gram+), calcul résiduel.
- Cirrhose : PNN ascite > 250/mm³, acquisition (communautaire / soins / nosocomiale), écologie locale, sepsis.
- Fonction rénale (DFG/ClCr ; hémodialyse), fonction hépatique (métronidazole : hépatopathie sévère), grossesse, poids (aminosides, antifongiques).

### 11.3 Probabiliste — péritonite / IIA compliquée communautaire (`SFAR-2026-IIA`)
| Situation | 1re ligne | Justification |
|---|---|---|
| Sans sepsis ni choc | céfotaxime **ou** ceftriaxone + métronidazole | R1.2.1 (GRADE 2) ; BLSE non couvertes R1.2.2 |
| Sepsis | idem ; carbapénème **seulement** si BLSE documentée < 6 mois | R1.2.3 (avis d'experts) |
| Choc septique sans FdR BLSE | pipéracilline-tazobactam | R1.2.4 (GRADE 2) |
| Choc septique avec ≥ 1 FdR BLSE | carbapénème selon prévalence locale (pip-taz ± amikacine discutée dans l'argumentaire) | R1.2.5 (GRADE 2) ; p. 24 |
| Allergie vraie (ni céphalosporine ni carbapénème) | lévofloxacine + métronidazole, ou moxifloxacine (QTc) ; si CI fluoroquinolones : tigécycline ou éravacycline ; réévaluer à 48 h | R1.2.11 (avis d'experts) |
| Antifongique | non en l'absence de gravité ; si sepsis/choc : selon R1.2.13 | R1.2.13 (GRADE 2) |
- **Zone grise** : choix entre ertapénème et carbapénème large en cas de choc (argumentaire p. 24, pas de recommandation) ; « prévalence locale élevée » non chiffrée ; Figure 1 (algorithme) non lue — elle mentionne C2G, moxifloxacine, tigécycline/éravacycline dans sa légende : **brouillon**.
- Amoxicilline-acide clavulanique : **pas en 1re intention** dans SFAR 2026 (argument PRIMO) — divergence avec WSES 2017 (option dans les IIA communautaires « mild ») et avec HAS 2017 (diverticulite compliquée : amox-clav + gentamicine).

### 11.4 Probabiliste — IIA associée aux soins, 1er épisode (`SFAR-2026-IIA`)
| Situation | 1re ligne | Justification |
|---|---|---|
| Sans FdR BMR (y compris sepsis/choc) | céfépime + métronidazole (avec dosage plasmatique du céfépime) | R1.2.6 (GRADE 1) |
| Pas de dosage de céfépime possible | pipéracilline-tazobactam (selon écologie) | R1.2.7 (avis d'experts) |
| Choc sous céfépime + métronidazole | + linézolide **ou** vancomycine **ou** teicoplanine | R1.2.8 (avis d'experts) |
| Pip-taz + FdR entérocoque ampi-R | + linézolide/vancomycine/teicoplanine | R1.2.9 (avis d'experts) |
| ≥ 2 FdR BMR, ou ≥ 1 si sepsis/choc | carbapénème | R1.2.10 (GRADE 1) |
| Allergie vraie | ciprofloxacine + métronidazole + (linézolide/vancomycine/teicoplanine) ; ou aztréonam + métronidazole + (idem) ; ou tigécycline/éravacycline + ciprofloxacine | R1.2.12 (avis d'experts) |
| Antifongique | si examen direct levures ou ≥ 3 critères ; échinocandine si FdR de résistance aux azolés | R1.2.13 (GRADE 2), p. 37, Tableau 4 |
- **Zone grise** : choix du carbapénème (ertapénème vs méropénème/imipénème) non précisé pour les IIA associées aux soins (P. aeruginosa non couvert par l'ertapénème : `WSES-2017-IIA`) → **avis spécialisé/brouillon**.

### 11.5 Complication postopératoire après IIA (champ 3)
- Contrôle de la source en urgence (R3.1.1), mini-invasif si stable (R3.1.2).
- Probabiliste couvrant BLSE, *P. aeruginosa*, *E. faecium* selon écologie (R3.3.1, GRADE 2) — **molécules non nommées** par la recommandation : **avis spécialisé**.
- Antifongique probabiliste (échinocandine) si gravité hémodynamique ou levures à l'examen direct (R3.3.5).
- STP des bêta-lactamines en soins critiques (R3.3.3).

### 11.6 Durées et point de départ (après contrôle de la source)
| Situation | Durée | Source |
|---|---|---|
| Appendicite non compliquée opérée | antibioprophylaxie seule (dose unique) | `SFAR-2026-IIA` R2.2.1 (GRADE 1) ; `WSES-2020-appendicite` 7.1 |
| Appendicite compliquée opérée, source contrôlée | 2 jours (24 h discutable) | R2.2.2 (GRADE 1) ; WSES : ≤ 3-5 j |
| IIA communautaire compliquée (hors appendicite), y compris sepsis initial ou drainage percutané/endoscopique | 4 jours | R2.2.3 (GRADE 1) ; STOP-IT |
| IIA associée aux soins (hors postop.) sans sepsis | 4 jours | R2.2.4 (avis d'experts) |
| IIA associée aux soins en sepsis/choc | 8 jours | R2.2.5 (GRADE 2) |
| Complication postopératoire après IIA | 8 jours (au-delà : RCP) | R3.3.4 (avis d'experts) ; DURAPOP |
| Perforation digestive opérée < 24 h | ≤ 24 h | `SPILF-GPIP-2021-durees` (non repris par SFAR 2026) |
| Candidose péritonéale (culture +), conditions R2.3.1 | 8 jours d'antifongique | R2.3.1 (avis d'experts) ; autres cas : absence de recommandation |
| Diverticulite non compliquée nécessitant antibiotique | 7 jours (point de départ : début de l'antibiotique) | `HAS-2021-diverticulite` ; `HAS-2017-diverticulite` (AE ≤ 7 j) |
| Diverticulite compliquée traitée médicalement (abcès, bulles) | **non tranché** (HAS 2017 : pas de recommandation de durée) | **brouillon / avis spécialisé** |
| Diverticulite opérée (péritonite), source contrôlée | 4 jours | `WSES-2020-diverticulite` (2B) ; cohérent avec R2.2.3 |
| Cholécystite grade I-II, cholécystectomie | arrêt dans les 24 h (ou per-opératoire seul) | `TG18-antimicrobiens` Q4 (1B) ; `WSES-2020-cholecystite` 7.1 ; `SPILF-GPIP-2021-durees` ≤ 24 h |
| Cholécystite grade III ou perforée/gangréneuse, source contrôlée | TG18 : 4-7 j ; SPILF : 3 j ; WSES 2021 : 4 j | **divergence** → brouillon (proposer la fourchette avec les trois références) |
| Cholécystite drainée (percutané) / non opérée non drainée | 7 jours | `SPILF-GPIP-2021-durees` (seule source) |
| Angiocholite, drainage efficace | SPILF : 3 j post-drainage (même si bactériémie) ; TG18 : 4-7 j | **divergence** |
| Bactériémie à *Enterococcus*/*Streptococcus* d'origine biliaire | ≥ 2 semaines (TG18) vs 3 j (SPILF, « même si bactériémie », sans distinguer les cocci Gram+) | **divergence** → avis spécialisé |
| Abcès hépatique non amibien | 28 jours (SPILF/GPIP) ; TG18 : jusqu'à résolution | seul repère chiffré : SPILF ; **avis spécialisé** (drainage) |
| PBS | ≥ 5-7 jours (EASL, III;1) ; 5 jours si céfotaxime (SPILF) | `EASL-2018-cirrhose` ; `SPILF-GPIP-2021-durees` |
| Appendicite non opérée | 7 jours | `SPILF-GPIP-2021-durees` (seule source chiffrée) — brouillon |

### 11.7 Biliaire — probabiliste (`TG18-antimicrobiens`, pas de source française)
- Grade I-II communautaire : C3G (céfotaxime/ceftriaxone) ± métronidazole, ou ertapénème ; métronidazole **seulement si anastomose bilio-digestive** (TG18 Q2, 2C) — divergence potentielle avec la pratique française « C3G + métronidazole » des péritonites (SFAR 2026 R1.2.1 ne s'applique pas aux infections biliaires focalisées). **Brouillon.**
- Grade III communautaire ou associée aux soins : pip-taz, céfépime ± métronidazole, carbapénème ; **+ vancomycine** (entérocoque) selon TG18 note a ; SFAR 2026 (Tableau 1) cite l'origine hépato-biliaire comme FdR d'entérocoque ampi-R ; WSES : couverture entérocoque non systématique en communautaire. **Divergence → avis spécialisé.**
- Gravité de l'angiocholite : barème TG18 lu (11.2) → modélisable. Cholécystite : barème **non lu** → ne pas modéliser.
- Geste : drainage biliaire (CPRE) en 1re intention pour l'angiocholite modérée/sévère (`WSES-2017-IIA`, 1A) ; cholécystectomie précoce (1A) ; cholécystostomie si inopérable (1B).

### 11.8 Diverticulite (`HAS-2021-diverticulite`, `HAS-2017-diverticulite`, `WSES-2020-diverticulite`)
- Non compliquée confirmée au scanner, sans gravité/immunodépression/ASA > 3/grossesse : **pas d'antibiotique**, ambulatoire, surveillance clinique.
- Non-réponse : amoxicilline-acide clavulanique 1 g × 3/j per os 7 jours ; allergie : ciprofloxacine 500 mg × 2 + métronidazole 500 mg × 3, ou lévofloxacine 500 mg × 1 + métronidazole 500 mg × 3, 7 jours.
- Gravité / grossesse / ASA > 3 / immunodépression, ou forme compliquée : IV « amoxicilline-acide clavulanique et gentamicine, ou céfotaxime et métronidazole, ou ceftriaxone et métronidazole » ; allergie : lévofloxacine + gentamicine + métronidazole (HAS 2017, AE). **Posologies IV non précisées par la HAS** → utiliser l'Annexe 1 SFAR 2026 pour C3G/métronidazole ; pour amox-clav IV, RCP (1 g/200 mg toutes les 8 h). **Divergence** : SFAR 2026 ne retient plus amox-clav en 1re intention pour les péritonites communautaires.
- Abcès : drainage si faisable (HAS) ; WSES : < 4-5 cm antibiotiques seuls. Hinchey III sans sepsis : résection-anastomose + lavage, pas de lavage exclusif (SFAR 2026 R1.1.5).

### 11.9 PBS (`EASL-2018-cirrhose`)
- Communautaire, faible résistance : C3G (EASL I;1). Forte résistance : pip-taz ou carbapénème. Associée aux soins/nosocomiale : pip-taz (faible BMR) ou carbapénème (BLSE) ± anti-Gram+ BMR. Albumine 1,5 g/kg J1 puis 1 g/kg J3. Ponction de contrôle à 48 h. Durée ≥ 5-7 j.
- **Zone grise** : « prévalence élevée de résistance » non chiffrée ; posologie de la C3G non précisée par EASL (SPILF : céfotaxime, 5 jours, sans dose) → posologie céfotaxime : RCP (`RCP-cefotaxime`) / Annexe 1 SFAR (hors champ cirrhose) : **brouillon**.

### 11.10 Surveillance et critères d'avis
- Soins critiques : sepsis/choc systématique (R1.3.1) ; sinon âge > 60 ans, comorbidités, péritonite généralisée (R1.3.2).
- Pas de CRP/PCT systématiques, pas de TDM systématique < J5, pas de culture de drain (R2.1.1, R2.1.2, R3.2.2).
- Signaux d'alerte ≤ 72 h : fièvre, iléus, défaillance d'organe persistante → complication / contrôle imparfait (R3.2.1) ; > 72 h : TDM TAP injectée (R3.2.3).
- Désescalade après antibiogramme si évolution favorable (R2.4.1).
- Céfépime : dosage plasmatique (24-36e h) ; aminosides : Cmax/Cmin ; vancomycine/teicoplanine : résiduelles (Annexe 1).
- Avis spécialisé : complication postopératoire, allergie vraie, BMR documentée, carbapénémase (non traitée par SFAR 2026), candidose hors R2.3.1, abcès hépatique, biliaire grade III, immunodépression profonde, durée > 8 jours.

### 11.11 Ce qui n'est PAS tranché (rester en « brouillon » ou « avis spécialisé »)
1. Infections biliaires : aucune recommandation française ; divergences TG18 / SPILF 2021 / WSES (durées, entérocoque, métronidazole).
2. Barème TG18 de gravité de la cholécystite : non lu.
3. Appendicite non opérée : hors SFAR 2026 ; seule durée chiffrée SPILF 2021 (7 j), molécule non précisée dans les textes lus.
4. Diverticulite compliquée traitée médicalement : durée non recommandée par la HAS ; schéma IV HAS 2017 (amox-clav + gentamicine) divergent de SFAR 2026.
5. Abcès hépatique : 28 j (SPILF) sans recommandation dédiée ; drainage non tranché.
6. Choix du carbapénème (ertapénème vs large spectre) ; « prévalence locale élevée » de BLSE non chiffrée.
7. Molécules du probabiliste de la complication postopératoire (R3.3.1 non nominative).
8. Durée antifongique hors R2.3.1 (absence de recommandation).
9. Posologie de la dose unique peropératoire d'appendicectomie en urgence (molécule non précisée dans les textes lus).
10. PBS : posologie et seuils de résistance non précisés.

---

## 12. Molécules

### 12.1 Métronidazole (molécule attribuée — RCP lus)

**(a) METRONIDAZOLE B BRAUN 0,5 %, solution pour perfusion — CIS 66095383 — RCP « ANSM - Mis à jour le : 16/12/2025 »** (`RCP-metronidazole-IV`)
URL : https://base-donnees-publique.medicaments.gouv.fr/medicament/66095383/extrait (page « Dernière mise à jour le 03/11/2026 »). NB : FLAGYL 0,5 % injectable (CIS 67965563) a une AMM **abrogée** (fichier CIS_bdpm.txt).
- §4.1 : infections « des voies gastro-intestinales et de la région abdominale (par ex. péritonite, abcès hépatique, infections post-opératoires suite à une chirurgie colique ou rectale…) » ; en infection mixte, ajouter un antibiotique actif sur les aérobies.
- §4.2 adulte, infections anaérobies : « une dose unique de 1 500 mg (300 ml) est administrée le premier jour du traitement suivie de 1 000 mg (200 ml) administrés sous forme de doses uniques les jours suivants » ; « Autrement, 500 mg (100 ml) peuvent être administrés toutes les 8 heures » ; dose de charge possible « 15 mg/kg » ; « Dans la plupart des cas, un traitement de 7 jours sera suffisant. »
- §4.2 prophylaxie : « 500 mg, avec l'administration terminée environ une heure avant la chirurgie. La dose est répétée 8 et 16 heures après. »
- §4.2 insuffisance rénale : « Aucune réduction de dose n'est nécessaire » ; hémodialyse : dose « programmée après l'hémodialyse les jours de dialyse ».
- §4.2 insuffisance hépatique sévère : « nécessiteront des doses plus faibles » (sans palier chiffré).
- §4.2 administration : « 100 ml au maximum sur 20 minutes au minimum, mais sur une heure en temps normal ».
- §4.3 : hypersensibilité au métronidazole / nitroimidazolés / excipients.
- §4.4 : durée « ne doit pas dépasser 10 jours » sauf cas spécifiques avec surveillance clinique et biologique ; numération globulaire en traitement prolongé ; neuropathie, convulsions ; SCAR (NET, SJS, DRESS, PEAG) → arrêt définitif ; syndrome de Cockayne : hépatotoxicité ; sodium « 966 mg (42 mmol) de sodium pour une dose de 300 mL » ; interférence avec dosages ALAT/ASAT/LDH/triglycérides/glucose.
- §4.5 : QT — torsades rapportées avec « amiodarone ou de ciprofloxacine » → surveiller le QT ; **coumariniques (warfarine)** : potentialisation, « Un ajustement de la dose de l'anticoagulant peut s'avérer nécessaire » ; busulfan (à éviter) ; disulfirame (à éviter) ; ciclosporine, tacrolimus (surveillance des taux), lithium, phénytoïne, carbamazépine, fluorouracile, mycophénolate ; alcool (effet antabuse).
- §4.6 : 1er trimestre « uniquement pour traiter des infections graves menaçant le pronostic vital, si aucune autre alternative plus sûre n'est possible » ; allaitement interrompu (et 2-3 jours après).
- §4.9 : éliminé par hémodialyse. §5.2 : demi-vie « 8 (6-10) heures » ; « Une insuffisance rénale retarde l'excrétion seulement à un degré insignifiant. »

**(b) FLAGYL 500 mg, comprimé pelliculé — CIS 61659061 — RCP « ANSM - Mis à jour le : 04/07/2025 »** (`RCP-metronidazole-oral`)
URL : https://base-donnees-publique.medicaments.gouv.fr/medicament/61659061/extrait
- §4.1 : dont « Traitement curatif des infections médico-chirurgicales à germes anaérobies sensibles » et « Relais des traitements curatifs par voie injectable ».
- §4.2 adulte, infections à anaérobies (« en première intention ou en traitement de relais ») : « 1 à 1,5 g/jour ». Amibiase : « 1,50 g par jour en trois prises », 7 jours ; amibiase hépatique abcédée : évacuation de l'abcès conjointe. Lambliase : « 0,750 g à 1 g par jour pendant cinq jours ». Trichomonase : 2 g dose unique. Vaginites non spécifiques : 500 mg × 2/j, 7 jours.
- **Pas d'adaptation rénale mentionnée** en §4.2 ; §5.2 : « La biodisponibilité par voie orale est de 100 % » ; demi-vie « 8 à 10 heures » ; « Forte concentration hépatique et biliaire. Faible concentration colique. »
- §4.3 : hypersensibilité aux imidazolés ; allergie au blé (hors maladie cœliaque) ; enfant < 6 ans (forme).
- §4.4 : PEAG/SJS/Lyell → arrêt et contre-indication définitive ; encéphalopathie/syndrome cérébelleux (lésions IRM cervelet, splénium) → arrêt ; neuropathie périphérique (traitement prolongé) ; réactions psychotiques ; NFS si antécédents hématologiques, forte dose ou traitement prolongé ; Cockayne.
- §4.5 : déconseillés : alcool, busulfan, disulfirame, **médicaments allongeant le QT** ; précautions : inducteurs enzymatiques, **rifampicine** (baisse des concentrations de métronidazole), lithium ; à prendre en compte : fluoro-uracile ; **INR** : déséquilibres sous antibiotiques (paragraphe générique).
- §4.6 : « le métronidazole peut être prescrit pendant la grossesse si besoin » ; éviter pendant l'allaitement.
- **C. difficile** : **aucun des deux RCP ne mentionne l'infection à *C. difficile* comme indication** (seule la colite pseudomembraneuse en effet indésirable, RCP IV §4.4/§4.8).

**(c) Grossesse / allaitement — CRAT** (`CRAT-metronidazole-grossesse`), mises à jour 12/09/2024 : https://www.lecrat.fr/10412/ (grossesse) ; https://www.lecrat.fr/10413/ (allaitement). consultee.
- Grossesse : « aucun effet malformatif, fœtal ou néonatal attribuable au traitement n'est retenu à ce jour » ; « L'utilisation du métronidazole est possible quel que soit le terme de la grossesse. »
- Allaitement (voie orale/IV) : « envisageable pour une durée limitée (≤ 14 jours) ».
- **Divergence** : RCP B. Braun IV (restriction au 1er trimestre, allaitement interrompu) plus restrictif que le CRAT et que le RCP Flagyl oral.

**(d) Posologies métronidazole selon les recommandations**
- SFAR 2026 Annexe 1 : « 500 mg/8h IV » (usuel et réanimation).
- SPILF/SFPT/CA-SFM 2026 (`SPILF-SFPT-CASFM-2026-posologies`, p. 15 du PDF) : « Métronidazole 0,5 g per os ou par voie iv toutes les 8 h » ; forte posologie « Non applicable ».
- HAS 2021 diverticulite : « métronidazole 500 mg 3 fois par jour pendant 7 jours » (avec ciprofloxacine ou lévofloxacine).
- *C. difficile* (`SPILF-2022-ICD-diapo`, diapos 8-10) : « Le métronidazole n'est plus recommandé comme antibiotique de première ligne » ; posologie si utilisé : « 500 mg/8 h qsp 10j » per os ou IV ; place : 1er épisode si traitement standard (vancomycine/fidaxomicine) indisponible ; voie orale impossible : « administration locale +/- métronidazole IV ou tigécycline ».
- Antibioprophylaxie (`SFAR-SPILF-2024-antibioprophylaxie`) : 1 g IV dose unique (proctologie) ; 1 g IV + gentamicine si allergie (à la place de la céfoxitine) ; 1 g per os la veille de chirurgie colorectale (+ tobramycine).
- Divergence internationale : WSES 2017 « Metronidazole 500 mg 6-hourly » (non français).

### 12.2 Posologies propres à l'intra-abdominal pour les molécules déjà présentes (pas de nouveau RCP complet ; extraits §4.2 relus le 2026-11-06)
| Molécule | RCP (id registre, MAJ lue) | Ligne IIA du RCP | Recommandation IIA |
|---|---|---|---|
| Amoxicilline-acide clavulanique | `RCP-amoxicilline-clavulanate` (Sandoz IV, MAJ 21/02/2023) | IIA dans §4.1 ; « 1 g/200 mg toutes les 8 heures » ; ClCr 10-30 : 1 g/200 mg puis « 500 mg/100 mg deux fois par jour » ; ClCr < 10 : 1 g/200 mg puis 500 mg/100 mg/24 h | Per os diverticulite : « 1 g 3 fois par jour pendant 7 jours » (`HAS-2021-diverticulite`) ; IV + gentamicine (diverticulite compliquée, `HAS-2017-diverticulite`, sans dose) ; non 1re intention péritonite (`SFAR-2026-IIA`) |
| Céfotaxime | `RCP-cefotaxime` (Panpharma 2 g, MAJ 08/04/2024) | Pas d'indication IIA nommée ; « 3 g/jour en moyenne pouvant être portée jusqu'à 12 g » | SFAR 2026 : 1-2 g/8 h (usuel) ; 2 g/8 h ou continu (réanimation) |
| Ceftriaxone | `RCP-ceftriaxone` (Rocéphine, MAJ 15/04/2025) | « 1‑2 g Une fois par jour » pour les « Infections intra-abdominales » | SFAR 2026 : 1-2 g/j (usuel) ; « 2 g/12h » (réanimation) |
| Pipéracilline-tazobactam | `RCP-piperacilline-tazobactam` (Tazocilline, MAJ 13/11/2025) | IIA compliquées : 4 g/0,5 g « Toutes les 8 heures » | SFAR 2026 : DDC 4 g/0,5 g puis perfusion prolongée/continue (200 mg + 25 mg)/kg/j ; 16 g/2 g/j continu (réanimation) |
| Céfépime | `RCP-cefepime` (Stragen, MAJ 27/09/2024) | Pas de ligne IIA ; « infections biliaires » : 2 g IV 2 fois/j ; *Pseudomonas* sévère : 2 g × 3 | SFAR 2026 : 2 g/8 h en perfusion de 4-8 h, ou DDC 2 g + 3-4 g/j continu, dosage plasmatique |
| Ertapénème | `RCP-ertapeneme` (Panpharma, MAJ 31/10/2023) | IIA dans §4.1 ; « 1 gramme (g) administrée une fois par jour » ; ClCr ≤ 30 et HD : ne pas utiliser (note registre) | SFAR 2026 : 1 g/j ; « 1g/12h » (réanimation) — **au-delà du RCP** |
| Méropénème | `RCP-meropeneme` (Kalceks, MAJ 20/01/2026) | « Infections intra-abdominales compliquées » : « 500 mg ou 1 g » toutes les 8 h | SFAR 2026 : 1-2 g/8 h en 3-8 h ; 3 g/j continu (réanimation), 6 g/j (hyperclairant) |
| Imipénème-cilastatine | `RCP-imipeneme` (Panpharma, MAJ 17/06/2022) | IIA compliquées dans §4.1 ; 500 mg/6 h ou 1 g/8 h ou /6 h (ClCr ≥ 90) | SFAR 2026 : 1 g/6-8 h ; 1 g/8 h (réanimation) |
| Gentamicine | `RCP-gentamicine` (Panpharma 160 mg, MAJ 29/03/2024) | Pas de ligne IIA ; « 3 à 8 mg/kg/jour » DUJ ; durée « maximale de 5 jours » | HAS 2017 diverticulite compliquée (dose non précisée) ; SFAR/SPILF 2024 prophylaxie « 6-7 mg/kg IVL » ; **absente de SFAR 2026** |
| Amikacine | `RCP-amikacine` (Stragen, MAJ 24/09/2025) | « Infections intra-abdominales compliquées » dans §4.1 ; « 15 mg/kg de poids corporel/jour » (adulte, ClCr ≥ 50) ; 15-30 mg/kg/j selon recommandations ; durée « limitée à 5 jours » | SFAR 2026 : 25-30 mg/kg/j DUJ (poids ajusté en réanimation), Cmax/Cmin |

### 12.3 Antifongiques (sans RCP — recommandations seulement)
- Échinocandines (caspofungine, micafungine) en 1re intention si FdR de résistance aux azolés ou complication postopératoire grave ; fluconazole en désescalade sur souche sensible (12 mg/kg puis 6 mg/kg/j) — `SFAR-2026-IIA` (posologies Annexe 1 ci-dessus). Anidulafungine : WSES 2017 seulement (200 mg puis 100 mg/j).

### 12.4 Molécules nouvelles nécessaires pour ce domaine (absentes de l'application)
- **Métronidazole** IV et per os — RCP lus (12.1).
- Anti-entérocoques : **linézolide**, **teicoplanine** (vancomycine déjà présente) — RCP non lus.
- Allergie : **moxifloxacine** (QTc), **tigécycline**, **éravacycline** — RCP non lus.
- Antifongiques : **caspofungine**, **micafungine**, **fluconazole** (± anidulafungine) — RCP non lus.
- Cirrhose : **albumine** (EASL), prophylaxie **norfloxacine** (non remboursée) — hors antibiothérapie curative ; ciprofloxacine et cotrimoxazole déjà présents.
- *C. difficile* (si module ultérieur) : vancomycine per os, fidaxomicine, bezlotoxumab — hors périmètre.
