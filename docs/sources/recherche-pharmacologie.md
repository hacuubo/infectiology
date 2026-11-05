# Recherche documentaire — Pharmacologie des antibiotiques chez l'adulte

Posologies, adaptation rénale/hépatique, suivi thérapeutique pharmacologique (STP), fonction rénale, grossesse/allaitement, allergie aux bêta-lactamines.

- Date de la vérification : **2026-11-04**
- Méthode : recherche web (WebSearch) puis lecture (WebFetch ; PDF téléchargés puis convertis en texte avec `pdftotext` ; diaporama `.pptx` décompressé et texte extrait des XML). Aucune autre source de contenu.
- Convention des statuts d'accès :
  - **consultée (contenu lu)** : le texte a été renvoyé par l'outil et les extraits ci-dessous en sont tirés mot pour mot ;
  - **trouvée mais contenu non lisible** : URL identifiée mais contenu non renvoyé (403, page de connexion, PDF image, tableau en image) ;
  - **introuvable** : aucune URL exploitable.
- Les extraits sont entre guillemets, dans la langue d'origine, ≤ 40 mots, avec le repère (page/section/tableau/numéro de recommandation).
- **NON VÉRIFIÉ** = chiffre ou affirmation issu de connaissances antérieures, non lu dans une source ce jour. Les connaissances antérieures sont systématiquement signalées comme telles.
- Niveau de confiance : **élevée** (lu dans la source primaire officielle, extrait exact), **moyenne** (lu via résumé d'outil ou tableau PDF dont l'alignement des colonnes est incertain), **faible** (indirect ou non vérifié).

---

## 0. Synthèse des points saillants et des pièges

1. **Aminosides** : la mise au point ANSM/Afssaps de mars 2011 reste le texte de référence français (pas d'actualisation retrouvée). Elle est reprise quasi mot pour mot par les RCP 2024-2026 (gentamicine Panpharma, amikacine Stragen). Les doses « usuelles » ont toutefois évolué : le tableau SPILF/SFPT/CA-SFM 2025 indique **gentamicine 6-7 mg/kg** et **amikacine 25-30 mg/kg** en DUJ, là où l'ANSM 2011 donne des fourchettes 3-8 et 15-30 mg/kg.
2. **Vancomycine** : aucune recommandation SFPT/SFAR spécifique retrouvée ; la référence française pratique est le **tableau SPILF/SFPT/CA-SFM 2025** (dose de charge 20-30 mg/kg ; résiduelle 15-20 mg/L en discontinu ; plateau **20-25 mg/L** en continu ; ASC 400-600 dans les deux cas). La cible « 20-30 mg/L » qui circule correspond dans ce tableau à la **téicoplanine** (résiduelle), pas à la vancomycine.
3. **Bêta-lactamines en soins critiques** : le référentiel est SFPT/SFAR 2018 (RPP, pas RFE ; sans la SRLF). STP 24-48 h après le début, résiduelle si discontinu, plateau si continu, cible libre 4-8 × CMI 100 % du temps.
4. **Fonction rénale** : la HAS (fiche 2021, mise à jour septembre 2023) demande d'adapter les posologies avec **CKD-EPI** et de **ne plus utiliser Cockcroft-Gault**, avec désindexation par la surface corporelle (Du Bois) si elle s'éloigne de 1,73 m². Les RCP, eux, restent en « clairance de la créatinine » et, quand ils citent une formule, c'est Cockcroft (céfépime, vancomycine).
5. **GPR** : le domaine `sitegpr.com` ne pointe plus vers le GPR (au 2026-11-04 il renvoie vers un site de casino en ligne). Le GPR est désormais distribué par Vidal (`vidal.fr/gpr`), gratuit pour les libéraux, sur abonnement pour les établissements.
6. **Allergie** : la recommandation de référence en 2026 est **ESCMID (février 2026)**, relayée par la SPILF (diaporama du 8 avril 2026). Aucune recommandation « SFA/SFAR/SPILF 2019 » retrouvée. Le tableau de réactivité croisée SPILF est une image (non lisible).
7. **Fosfocine 1 g IV** : spécialité **abrogée depuis le 24/02/2023** selon la BDPM ; il existe d'autres fosfomycines IV (Panpharma 4 g, Fomicyt) non lues.

---

## 1. AMINOSIDES

### Fiche 1.1 — ANSM/Afssaps, Mise au point sur le bon usage des aminosides administrés par voie injectable : gentamicine, tobramycine, nétilmicine, amikacine

- Organisme : Afssaps (devenue ANSM), avec SPILF et GPIP
- Titre exact : « Mise au point sur le bon usage des aminosides administrés par voie injectable : gentamicine, tobramycine, nétilmicine, amikacine — Propriétés pharmacologiques, indications, posologies et modes d'administration, surveillance du traitement »
- Année : mars 2011 (validée par la Commission d'AMM du 13 janvier 2011). Type : mise au point (document de 10 pages).
- URL : https://ansm.sante.fr/uploads/2021/02/04/map-aminosides.pdf (page d'accueil : https://ansm.sante.fr/actualites/bon-usage-des-aminosides-administres-par-voie-injectable-gentamicine-tobramycine-netilmicine-amikacine)
- Date de consultation : 2026-11-04
- Statut d'accès : **consultée (contenu lu)** (PDF téléchargé, texte extrait intégralement)
- Statut de vigueur : toujours en ligne sur ansm.sante.fr (page republiée le 04/02/2021) ; **aucune actualisation ANSM retrouvée**. Les RCP 2024-2026 (gentamicine Panpharma, amikacine Stragen) en reprennent le contenu. Le tableau SPILF/SFPT/CA-SFM 2025 (fiche 3.2) propose des doses plus élevées pour la gentamicine.
- Extraits (repères = numéro de page du PDF / rubrique) :
  - Objectif PK/PD (p. 3) : « L'effet thérapeutique est maximal si le ratio Cmax/CMI est ≥ 8 à 10 »
  - Durée (p. 5, Indications) : « pour une durée ≤ 5 jours, en raison de leur rapport bénéfice/sécurité d'emploi »
  - Modalités (p. 5) : « Les aminosides doivent être administrés par voie intraveineuse, en perfusion de 30 minutes. »
  - DUJ (p. 5) : « les aminosides doivent être utilisés en dose unique journalière (DUJ) (totalité de la posologie journalière en 1 seule injection) »
  - Endocardite (p. 5) : « la posologie journalière est traditionnellement (absence de donnée récente) répartie en 2 à 3 injections/jour, sauf pour les endocardites à streptocoques (DUJ recommandée) et à entérocoques (DUJ pouvant être envisagée) »
  - Doses adulte (p. 6, Schémas posologiques) : « gentamicine, tobramycine : 3 à 8 mg/kg/jour ; nétilmicine : 4 à 8 mg/kg/jour ; amikacine : 15 à 30 mg/kg/jour »
  - Choix de la dose (p. 6) : « Dans toutes les situations sévères où il existe un risque d'augmentation du Vd et/ou un risque d'infection avec une souche ayant une CMI augmentée, il faut utiliser les posologies les plus élevées, surtout en début de traitement. »
  - Sujet âgé (p. 6) : « Sujets âgés, association à des facteurs risquant d'augmenter la toxicité rénale, infections peu sévères […] : les posologies les moins élevées sont envisageables. »
  - Poids de référence : **le document ne précise pas le poids à utiliser (total/idéal/ajusté)** ; il mentionne seulement « obésité morbide » parmi les situations justifiant un dosage du pic (p. 8). Voir RCP (fiches 1.2, 1.3) pour les formules de poids corrigé.
  - Durée de traitement (p. 7) : « un aminoside peut être arrêté après 48 à 72 heures de traitement […] il pourra être poursuivi au maximum 5 jours, y compris chez les patients neutropéniques en sepsis sévère ou en choc septique »
  - Toxicité (p. 7) : « Les risques de survenue de toxicités rénale et auditive augmentent pour les durées de traitement supérieures à 5-7 jours » ; « La toxicité rénale est indépendante de la concentration plasmatique obtenue au pic. »
  - Dosages — principe (p. 8) : « Le dosage plasmatique ne doit pas être systématique […] En cas de traitement ≤ à 3 jours, aucun dosage n'est nécessaire chez les patients pour lesquels aucune modification des paramètres pharmacocinétiques n'est attendue. »
  - Pic — indication (p. 8) : « Un dosage du pic plasmatique est conseillé après la 1re injection chez tous les patients sévères, surtout si des modifications des paramètres pharmacocinétiques […] sont probables : choc septique, brûlés, neutropénie fébrile, patients de réanimation en ventilation mécanique, obésité morbide, polytraumatisés, mucoviscidose… »
  - Pic — moment (p. 8) : « Les dosages du pic doivent être effectués 30 minutes après la fin de la perfusion (dont la durée doit également être de 30 minutes). »
  - Pic — conduite (p. 8) : « Des taux inférieurs aux objectifs attendus (Tableau 1) doivent entraîner une augmentation de la posologie de l'injection suivante. »
  - Résiduelle — indication et moment (p. 8) : « Un dosage de la concentration résiduelle est nécessaire uniquement si la durée de traitement est > 5 jours (dosage à effectuer après 48 heures de traitement) ou en cas d'insuffisance rénale. »
  - Résiduelle — répétition (p. 8) : « Ce dosage doit être répété 2 fois par semaine et s'accompagner d'une surveillance de la fonction rénale. »
  - Résiduelle — conduite (p. 8) : « Des taux résiduels (Cmin) supérieurs à ceux donnés dans le tableau 1, nécessitent d'espacer les injections. »
  - Cibles (p. 8, Tableau 1 « Objectifs de concentrations ») : gentamicine, nétilmicine, tobramycine : pic 30 à 40 mg/l, résiduelle < 0,5 mg/l ; amikacine : pic 60 à 80 mg/l, résiduelle < 2,5 mg/l.
  - Terrains particuliers (p. 9) : « Les objectifs PK/PD restent les mêmes quelle que soit la situation (sujets âgés, insuffisants rénaux, obésité morbide, grossesse et allaitement…). »
  - **Non traité dans le document** : la position exacte de la résiduelle par rapport à la dose suivante (« juste avant » vs « à 24 h »), la conduite en hémodialyse, la fréquence de la surveillance auditive. Le document n'indique pas non plus explicitement « pas de réduction de dose unitaire en IR » (c'est le RCP gentamicine, fiche 1.2, qui le dit).

### Fiche 1.2 — RCP GENTAMICINE PANPHARMA 160 mg, solution injectable (BDPM/ANSM)

- Organisme : ANSM, Base de données publique des médicaments (BDPM). Type : RCP (générique de référence).
- Version : RCP « mis à jour le 29/03/2024 » ; page BDPM « Dernière mise à jour le 03/11/2026 ».
- URL : https://base-donnees-publique.medicaments.gouv.fr/medicament/68868512/extrait
- Date de consultation : 2026-11-04 — Statut : **consultée (contenu lu)** via résumé WebFetch avec citations.
- Vigueur : RCP en vigueur.
- Extraits (section 4.2 sauf mention) :
  - Dose : 3 à 8 mg/kg/jour, dose maximale « surtout recommandée en début de traitement ou dans les infections graves » ; DUJ en perfusion de 30 min ; « pour une durée maximale de 5 jours ».
  - Obésité : « Poids corrigé = poids idéal + 0.43 x surcharge pondérale » ; « Surcharge pondérale = poids total – poids idéal » ; poids idéal par Lorentz : « Homme = Taille (cm) – 100 – [Taille (cm) – 150] / 4 » ; « Femme = Taille (cm) – 100 – [Taille (cm) – 150] / 2 » (adultes > 18 ans, taille 140-220 cm).
  - Pic : 30 min après la fin de la perfusion, « après la première injection de l'aminoside chez des patients sévères » ; cible 30-40 mg/l.
  - Résiduelle : à doser si « la durée de traitement est supérieure à 5 jours (dosage à effectuer après 48 heures de traitement) » ou en cas d'IR ; cible < 0,5 mg/l ; si dépassée, espacer les injections.
  - Insuffisance rénale : première injection à la dose habituelle ; « réinjections à la même dose que celle de la première injection » sauf adaptation selon le pic ; sans épuration extrarénale, pas de réinjection tant que la résiduelle reste au-dessus du seuil. Si dosage impossible, « le moment de réinjection est déterminé par la valeur de la clairance de la créatinine » : ClCr 90-60 ml/min : 24 h ; 60-40 : 36 h ; 40-20 : 48 h ; < 20 : dosage impératif de la résiduelle. Privilégier la DUJ et les traitements courts (1 ou 2 injections).
  - Hémodialyse : « les injections doivent se faire 2 à 4 heures avant la séance de dialyse » (pour diminuer la toxicité). **Divergence** avec la pratique « dose après séance » : voir §7.
  - Sujet âgé : « Les modalités de traitement doivent être adaptées à la fonction rénale. »
  - 4.4 : toxicités rénale et auditive augmentent au-delà de 5-7 jours ; toxicité précoce possible « dès les premières doses » ; surveillance rénale et auditive recommandée **sans fréquence chiffrée**.
- Confiance : élevée pour les chiffres cités ; les formules de Lorentz et le coefficient 0,43 ont été relus lors d'un second appel ciblé.

### Fiche 1.3 — RCP AMIKACINE STRAGEN 250 mg/mL, solution injectable (BDPM/ANSM)

- Version : page BDPM « Dernière mise à jour le 03/11/2026 » (date du RCP non restituée par l'outil).
- URL : https://base-donnees-publique.medicaments.gouv.fr/medicament/63899393/extrait
- Consultation : 2026-11-04 — Statut : **consultée (contenu lu)** via résumé WebFetch ; le tableau d'adaptation rénale et la formule d'entretien sont des **images non lisibles**.
- Extraits (4.2) :
  - Dose adulte (ClCr ≥ 50 mL/min) : « est de 15 mg/kg de poids corporel/jour », en 1 fois (préféré) ou 7,5 mg/kg/12 h ; fourchette « 15 à 30 mg/kg/jour » ; max 1,5 g/jour.
  - Obésité : dose calculée « en se basant sur le poids corporel idéal estimé du patient et en ajoutant 40 % de l'excédent ».
  - Perfusion 30 min ; durée limitée à 5 jours.
  - Pic 30 min après la fin de perfusion, cible 60 à 80 mg/L ; résiduelle < 2,5 mg/L (moment du prélèvement non précisé) ; suivi « fortement recommandé » en IR.
  - IR (ClCr < 50 mL/min) : DUJ, dosages pour adapter doses et intervalles, cures courtes (1-2 injections). Si ClCr inconnue et patient stable : intervalle (h) = 9 × créatinine sérique (mg/100 mL) (ex. 2 mg/100 mL → 18 h).
  - Dialyse : pas de dose post-séance précisée ; « notamment lorsque le patient est sous dialyse » → adapter selon les dosages.
  - 4.4 : fonction rénale évaluée avant et « surveillée régulièrement » ; audiogrammes répétés « si possible » ; arrêt si acouphènes, hypoacousie subjective ou perte des hautes fréquences. Pas de fréquence chiffrée.
- Confiance : élevée pour les extraits ; moyenne pour le reste (tableau image).
- Note : la recherche a aussi identifié AMIKACINE VIATRIS 500 mg (https://base-donnees-publique.medicaments.gouv.fr/medicament/68502148/extrait) et 62000612 — non lus ; les extraits de recherche indiquent « dose maximale de 30 mg/kg/jour surtout réservée au début du traitement » et, en EER continue, dosages répétés de la résiduelle avant réinjection (trouvés mais non lus en détail).

### Fiche 1.4 — Position paper international (Abdul-Aziz et al., ICM 2020) — pour repère européen

- Organisme : ESICM / ESCMID (PK/PD group) / IATDMCT / ISAC. Titre : « Antimicrobial therapeutic drug monitoring in critically ill adult patients: a Position Paper ». Intensive Care Med 2020;46:1127-1153. DOI 10.1007/s00134-020-06050-1.
- URL lue : https://pmc.ncbi.nlm.nih.gov/articles/PMC7223855 (Springer : redirection vers portail d'authentification, non lu)
- Consultation : 2026-11-04 — Statut : **consultée (contenu lu)** (première moitié du texte, Table 4 incluse).
- Vigueur : position paper 2020 ; pas de version ultérieure retrouvée.
- Extraits (Table 4 sauf mention) :
  - Aminosides : pic « 30 min after the end of infusion », cible « Cmax/MIC ≥ 8–10 » ; résiduelle « Amikacin < 2.5 mg/L », « Gentamicin/tobramycin < 0.5 mg/L » ; « The Panel recommends that TDM be routinely performed when aminoglycosides are used in critically ill patients. »
  - Vancomycine : « AUC0–24/MIC ≥ 400 » avec 2 prélèvements (« 1 h after the end of infusion » et « within 1–2 h of the next infusion ») ; perfusion continue : « Css: 20–25 mg/L » (prélèvement à tout moment).
  - Bêta-lactamines : résiduelle « 30 min or just before the next dosing », « 24–48 h post-initiation of therapy », cible « 100% fT>MIC » ; perfusion continue « Css > MIC » ; « higher (e.g. 2–5 × MIC) » exposures peuvent être bénéfiques.
  - Linézolide : « Cmin: 2–7 mg/L », prélèvement « 48 h post-initiation of therapy ».
  - Téicoplanine : « Cmin ≥ 15–30 mg/L ».
  - Daptomycine : TDM ni recommandé ni déconseillé ; « Cmin < 24 mg/L » (prélèvement « 72 h post-initiation of therapy ») ; Cmin ≥ 24,3 mg/L associée à élévation des CPK.
  - Répétition : « After initial TDM, it is recommended to repeat TDM (within 1–2 days for most drugs) ».
- Confiance : élevée.

---

## 2. VANCOMYCINE

### Fiche 2.1 — Consensus ASHP/IDSA/PIDS/SIDP 2020 (Rybak MJ et al.)

- Titre : « Therapeutic monitoring of vancomycin for serious methicillin-resistant Staphylococcus aureus infections: A revised consensus guideline and review by the American Society of Health-System Pharmacists, the Infectious Diseases Society of America, the Pediatric Infectious Diseases Society, and the Society of Infectious Diseases Pharmacists ». Am J Health-Syst Pharm 2020;77(11):835-864 (DOI 10.1093/ajhp/zxaa036) ; version parallèle Clin Infect Dis 2020;71(6):1361-1364.
- URL lue : https://academic.oup.com/ajhp/article/77/11/835/5810200 (texte intégral, 2 segments lus : 0-200 000 caractères sur 380 000)
- Consultation : 2026-11-04 — Statut : **consultée (contenu lu)**. PubMed (32658968) : page cookie non lisible.
- Vigueur : recommandation en vigueur (pas de révision retrouvée).
- Extraits (numéro de recommandation du Summary) :
  - Rec. 1 (A-II) : cible « AUC/MIC » 400-600 (CMI 1 mg/L par microdilution) ; « Doses of 15 to 20 mg/kg (based on actual body weight) administered every 8 to 12 hours ».
  - Rec. 2 (A-II) : « the most accurate and optimal way to manage vancomycin dosing should be through AUC-guided dosing and monitoring » ; « The preferred approach to monitor AUC involves the use of Bayesian software programs » ; « It is preferred to obtain 2 PK samples (ie, at 1 to 2 hours post infusion and at end of the dosing interval) » ; un seul creux peut suffire en bayésien (B-II).
  - Rec. 3 (A-II) : « vancomycin targeted exposure should be achieved early during the course of therapy, preferably within the first 24 to 48 hours. »
  - Rec. 4 (A-II) : « Trough-only monitoring, with a target of 15 to 20 mg/L, is no longer recommended. » ; fréquence : « once-weekly monitoring for hemodynamically stable patients », « frequent or daily monitoring may be prudent for hemodynamically unstable patients » (B-II).
  - Rec. 5 (B-II) : monitoring recommandé pour les infections graves à SARM.
  - Dose de charge (B-II) : « a loading dose of 20 to 35 mg/kg can be considered for intermittent-infusion administration » ; « Loading doses should be based on actual body weight and not exceed 3,000 mg. »
  - Obésité (B-II/A-II) : « A vancomycin loading dose of 20 to 25 mg/kg using actual body weight, with a maximum dose of 3,000 mg » ; entretien « usually do not exceed 4,500 mg/day ».
  - Perfusion continue (Rec. 10, B-II) : « a loading dose of 15 to 20 mg/kg, followed by daily maintenance CI of 30 to 40 mg/kg (up to 60 mg/kg) » ; « to achieve a target steady-state concentration of 20 to 25 mg/L » ; AUC24 = Css × 24 ; **pas de moment précisé pour le 1er dosage en continu**.
  - Néphrotoxicité (texte) : « an increase in the serum creatinine (SCr) level of ≥0.5 mg/dL, or a 50% increase from baseline in consecutive daily readings » ; ≥ 0,3 mg/dL sur 48 h possible ; « piperacillin/tazobactam and flucloxacillin have been reported to increase the risk for AKI ».
  - Hémodialyse (Rec. 14) : « Maintaining predialysis concentrations between 15 and 20 mg/L is likely to achieve the AUC of 400 to 600 » (C-III) ; « Predialysis serum concentration monitoring should be performed not less than weekly » (B-II) ; prélèvement pas pendant ni dans les 2 h suivant la dialyse ; Table 2 : charge 25-35 mg/kg, entretien 7,5-15 mg/kg 3×/semaine selon membrane et moment (intra- ou post-dialyse).
  - SLED (Rec. 15, B-III) : « Maintenance doses of 15 mg/kg should be given after hybrid hemodialysis ends or during the final 60 to 90 minutes ».
  - CRRT (Rec. 16, B-II) : « Loading doses of 20 to 25 mg/kg by actual body weight should be used in patients receiving CRRT » ; « 7.5 to 10 mg/kg every 12 hours » pour effluent 20-25 mL/kg/h ; dosage « within the first 24 hours ».
  - Fréquence de la créatinine : **non chiffrée pour l'adulte** dans la partie lue.
- Confiance : élevée.

### Fiche 2.2 — SPILF / SFPT / CA-SFM, « Posologie standard et forte posologie : propositions du groupe de travail SPILF, SFPT & CA-SFM », V1.1 juillet 2025 (annexe du CA-SFM 2025)

- Organisme : SPILF, SFPT, CA-SFM (pilote R. Lepeule ; membres dont R. Gauzit, V. Jullien, S. Goutelle). Type : tableau de posologies (pages 158-172 du CA-SFM 2025 v1.1).
- URL : https://www.infectiologie.com/UserFiles/File/spilf/recos/doses-spilf-sfpt-casfm-2025.pdf (versions 2023 et 2024 également en ligne)
- Consultation : 2026-11-04 — Statut : **consultée (contenu lu)** (PDF → texte ; **attention** : tableaux à colonnes imbriquées, l'attribution ligne/molécule est parfois incertaine ; signalé par « confiance moyenne »).
- Vigueur : version en vigueur (V1.1 juillet 2025).
- Extraits (p. 158, préambule) :
  - « Ces posologies s'appliquent aux patients adultes de poids normal (non obèses), hors contexte d'insuffisance rénale ou hépatique. »
  - « Le suivi thérapeutique pharmacologique peut permettre d'évaluer le risque de toxicité ou d'adapter les posologies et/ou les durées de perfusions afin d'atteindre les cibles PK/PD d'efficacité. »
  - Stabilité en perfusion continue : « Il est suggéré de se référer aux recommandations françaises dédiées, coordonnées par la SPILF (https://doi.org/10.1016/j.mmifmc.2024.12.005). »
- Extraits glycopeptides (p. 169) — confiance élevée (texte continu lisible) :
  - Vancomycine, discontinu : « dose de charge de 20 à 30 mg/kg en perfusion de 1 à 2 h, puis dose d'entretien de 20 à 40 mg/kg/jour en perfusions de 1 h toutes les 12 à 6 h »
  - Vancomycine, continu : « dose de charge de 20 à 30 mg/kg en perfusion de 1 à 2 h, puis dose d'entretien de 20 à 40 mg/kg/jour »
  - Cibles : « administration discontinue, objectif de concentration plasmatique résiduelle entre 15 et 20 mg/L ; objectif d'ASC entre 400 et 600 (dans l'hypothèse d'une CMI ≤ 1 mg/L) » ; « administration continue, objectif de concentration plasmatique au plateau entre 20 et 25 mg/L ; objectif d'ASC entre 400 et 600 »
  - Téicoplanine : « Dose de charge de 12 mg/kg toutes les 12 h pour 3 à 5 injections iv, puis dose d'entretien de 12 mg/kg » /24 h ; « objectif de concentration plasmatique résiduelle entre 20 et 30 mg/L » (**c'est à la téicoplanine que s'applique la cible 20-30 mg/L**).
  - **Non précisé** : moment du 1er dosage, fréquence de la créatininémie.
- Extraits aminosides (p. 169) — confiance élevée : « Amikacine 25 à 30 mg/kg en perfusions de 30 min en dose unique journalière » ; « Gentamicine 6 à 7 mg/kg en perfusions de 30 min en dose unique journalière » ; « Tobramycine 6 à 7 mg/kg » ; « Le suivi thérapeutique pharmacologique doit guider l'adaptation des posologies. » ; MNT : amikacine 15 mg/kg/j (quotidien) ou 15-25 mg/kg (3×/sem).
- Autres extraits : voir §3 (bêta-lactamines), §3.15-3.17 (daptomycine, linézolide).

### Fiche 2.3 — RCP VANCOMYCINE VIATRIS 125 mg, poudre pour solution à diluer pour perfusion (BDPM/ANSM)

- Version : « ANSM - Mis à jour le 19/10/2026 » (section 10 non complétée).
- URL : https://base-donnees-publique.medicaments.gouv.fr/medicament/60033510/extrait
- Consultation : 2026-11-04 — Statut : **consultée (contenu lu)** (2 appels).
- Extraits (4.2) :
  - « La dose recommandée est de 15 à 20 mg/kg de poids corporel toutes les 8 à 12 h (ne pas dépasser 2 g par dose). »
  - « une dose charge de 25– 30 mg/kg de poids corporel peut être envisagée » (patients à présentation péjorative).
  - « La perfusion continue de vancomycine peut être envisagée » — **sans dose ni cible de plateau** (6.6 : administration « lentement sur une période de 24 heures »).
  - Cibles : « les taux sanguins thérapeutiques résiduels de vancomycine soient de 10-20 mg/l » ; « Des taux résiduels de 15-20 mg/l sont généralement recommandés » (CMI ≥ 1 mg/L).
  - Moment : « mesurée le deuxième jour de traitement, immédiatement avant la dose suivante » (fonction rénale normale).
  - IR : « Chez les patients avec insuffisance rénale légère ou modérée, la dose initiale ne doit pas être diminuée. » ; ClCr 20-49 mL/min : « 15 à 20 mg/kg pouvant être administrée toutes les 24 heures » ; ClCr < 20 mL/min ou EER : doses « basés sur les taux sériques résiduels de vancomycine et sur la fonction rénale résiduelle » ; « il est préférable de prolonger l'intervalle d'administration ».
  - Formule (non nommée, structure Cockcroft) : « Hommes : [poids (kg) x [140 - âge (ans)]] / [72 x créatinine plasmatique (mg/dl)] », femmes × 0,85.
  - Hémodialyse : « La vancomycine est peu dialysable par hémodialyse intermittente. » ; membranes haute perméabilité et CRRT « augmente la clairance » ; pas de tableau.
  - Perfusion : « d'une durée d'au moins une heure ou à une vitesse maximale de 10 mg/min ».
  - 4.4 : « Un contrôle régulier des taux sanguins de vancomycine est indiqué » (fortes doses/traitement prolongé) ; bilans « périodiquement » (NFS, urines, fonction rénale et hépatique) ; audition : « un contrôle régulier de la fonction auditive est recommandé » ; **aucune fréquence chiffrée**.
  - 4.5 : aminosides → « Une surveillance étroite du patient est nécessaire, particulièrement en cas d'administration concomitante d'aminosides » ; « La dose maximale de vancomycine sera alors limitée à 500 mg toutes les 8 heures. » ; pipéracilline/tazobactam cité parmi les néphrotoxiques.
- Confiance : élevée.

### Fiche 2.4 — Recommandations françaises spécifiques (SFPT / SFAR / SPILF) sur le STP de la vancomycine

- Statut : **introuvable**. Recherches (« SFPT recommandations STP vancomycine », « vancomycine perfusion continue SFAR », « sfpt-fr.org vancomycine ») : aucun texte de société savante française dédié. Seuls documents français retrouvés : tableau SPILF/SFPT/CA-SFM 2025 (fiche 2.2), RCP (fiche 2.3), précis Eurofins-Biomnis 2013 (non lu), étude Ann Fr Anesth Réanim 2010 (Saint-Étienne, charge 30 mg/kg puis 30 mg/kg/24 h, dosage à H24 — trouvée mais non lue).

---

## 3. BÊTA-LACTAMINES ET AUTRES ANTIBIOTIQUES (RCP BDPM) + référentiel soins critiques

### Fiche 3.0 — SFPT/SFAR 2018, « Optimisation du traitement par bêta-lactamines chez le patient de soins critiques » (RPP)

- Organismes : Société Française de Pharmacologie et de Thérapeutique (SFPT) et Société Française d'Anesthésie et de Réanimation (SFAR). **Pas la SRLF.** Format : « Recommandations pour la Pratique Professionnelle » (RPP), 21 recommandations optionnelles (GRADE), 2018. Publication : Guilhaumou R et al., Crit Care 2019;23:104 (DOI 10.1186/s13054-019-2378-9).
- URL PDF original : https://sfar.org/wp-content/uploads/2018/09/RPP_beta-lactamines-en-soins-critiques_041018_logoSFPT.pdf — **trouvée mais contenu non lisible (HTTP 403)**.
- URL lue : https://pmc.ncbi.nlm.nih.gov/articles/PMC6441232/ (version anglaise, **consultée, contenu lu**, première moitié) ; synthèse française : SPILF Info-antibio n° 83, octobre 2018 (https://www.infectiologie.com/UserFiles/File/spilf/atb/info-antibio/info-antibio-2018-10-bl-soins-critiques.pdf, **consultée, contenu lu** intégralement).
- Consultation : 2026-11-04. Vigueur : référentiel en vigueur, aucune révision retrouvée.
- Extraits (numérotation PMC ; texte français = Info-antibio 2018) :
  - R2.2 : « targeting a free plasma beta-lactam concentration between four and eight times the MIC » (100 % du temps) — FR : « cibler une concentration plasmatique libre de bêta-lactamines entre 4 et 8 fois la CMI de la bactérie pendant 100% du temps »
  - R2.3 : « it is useless, and even dangerous, to exceed plasma free concentrations » (> 8 × CMI) — FR : « Il n'est pas utile, et parfois dangereux, de dépasser cet objectif de 8 x CMI »
  - R3.1 : dose initiale plus élevée qu'hors réanimation ; R3.2-3.5 : perfusion prolongée ou continue si CMI élevée, choc septique, infection respiratoire basse, BGN non fermentant ; R3.6 : « administering an intravenous loading dose before starting the continuous or prolonged infusion »
  - Stabilité (Info-antibio) : « Il faut tenir compte de la stabilité des molécules (par exemple l'imipénème ne peut être fait en perfusion continue) »
  - R4.1 : STP « in ICU patients with expected beta-lactam PK variability » (et/ou suspicion de toxicité) ; R4.2 : « in critical care patients undergoing renal replacement therapy » (pas de distinction CVVH/HDI)
  - R4.3 : « dosing plasma trough concentration in case of intermittent administration » / « plasma steady-state concentration in case of continuous administration »
  - R4.4 : « performing beta-lactam TDM 24 to 48 h after the onset of treatment; after any change in dosage » (FR : « A faire 24/48h après le début du traitement et si changement de posologie ou changement clinique important »)
  - R4.5 : infection neuroméningée : dosage sang + LCS simultanés
  - R4.9.1-4.9.3 : si surdosage, réduire la dose journalière (continu), suspendre et reprendre sous STP, EER si IRA responsable
  - R1.2.1/1.2.2 : DFG par clairance mesurée « U × V/P » ; ARC défini « a creatinine clearance (CLCR) > 130 mL/min/1.73m² » ; obésité hors champ (« out of the scope »)
  - Céfépime : cité dans le texte et les notes du Tableau 2 (neurotoxicité), pas dans une recommandation numérotée.
- Confiance : élevée.

### Fiche 3.1 — Cloxacilline IV : RCP CLOXACILLINE PANPHARMA 1 g, poudre pour solution injectable (I.V.)

- RCP mis à jour le 01/12/2021 ; page BDPM 03/11/2026. URL : https://base-donnees-publique.medicaments.gouv.fr/medicament/68429134/extrait — **consultée (contenu lu)**.
- 4.2 : « 8 à 12 g/jour, répartis en 4 à 6 administrations journalières » ; perfusion IV de 60 min ; enfant « 100 à 200 mg/kg/jour […] sans dépasser 12 g/jour » ; IR : ClCr > 30 ml/min pas d'adaptation ; ClCr < 30 ml/min « réduire de moitié la dose journalière » ; insuffisance hépatique associée à une IR (quel que soit le degré) : moitié de la dose ; hémodialyse : non traitée.
- 4.4 : hypokaliémie (surveillance K+ « doit être envisagée ») ; lésions rénales aiguës à forte dose ; « Les bêtalactamines exposent au risque d'encéphalopathie » ; pas de calendrier de surveillance hépatique.
- SPILF 2025 (p. 162, confiance élevée) : « Cloxacilline 100 à 200 mg/kg/jour en 6 administrations (perfusions de 30 à 60 min toutes les 4 h) » ; continue : « 100 à 200 mg/kg/jour après dose de charge de 2 g en perfusion de 60 min ».

### Fiche 3.2 — Céfazoline : RCP CEFAZOLINE PANPHARMA 2 g (CIS 60461151)

- RCP mis à jour le 30/08/2023. URL : https://base-donnees-publique.medicaments.gouv.fr/medicament/60461151/extrait — **consultée (contenu lu)**.
- 4.2 : « La dose normale chez l'adulte est de 1 g à 2 g par jour » (2-3 doses) ; germes moins sensibles 3-4 g/j ; « Pour les infections sévères, des doses allant jusqu'à 6 g par jour ». Tableau IR (entretien) : ClCr ≥ 55 : dose normale ; 35-54 : dose normale, intervalle ≥ 8 h ; 11-34 : moitié de dose /12 h ; ≤ 10 : quart de dose /18-24 h. Dialyse : « la posologie dépendra des conditions de dialyse » (pas de dose post-séance). Pas de formule de clairance.
- 4.4 : « L'exposition aux bêta-lactamines est associée au risque d'encéphalopathie » (surdosage/IR).
- SPILF 2025 (p. 162, confiance élevée) : « 80 à 100 mg/kg/jour en 3 administrations (perfusions de 60 min toutes les 8 h) » ; continue « après dose de charge de 2 g en perfusion de 60 min ».

### Fiche 3.3 — Céfotaxime : RCP CEFOTAXIME PANPHARMA 2 g (CIS 65424833)

- RCP 08/04/2024. URL : https://base-donnees-publique.medicaments.gouv.fr/medicament/65424833/extrait — **consultée (contenu lu)**.
- 4.2 : « 3 g/jour en moyenne pouvant être portée jusqu'à 12 g selon la sévérité de l'infection » ; méningite « 200 à 300 mg/kg/jour » ; IR : ClCr < 10 mL/min → après dose initiale normale, entretien à demi-dose, intervalle inchangé (**pas de palier intermédiaire**) ; hémodialyse : 1 à 2 g/jour, « le jour de l'hémodialyse, le céfotaxime doit être administré après la séance de dialyse ».
- 4.4 : « Les bêtalactamines exposent au risque d'encéphalopathie […] particulièrement, en cas de surdosage ou d'insuffisance rénale ».
- SPILF 2025 (p. 164) : standard « 1 g toutes les 8 h en perfusions de 30 min » ; forte « 2 g toutes les 8 h en perfusions de 30 min », prolongée « 1 à 2 g toutes les 8 h en perfusions de 4 h », continue « 4 g/jour après dose de charge de 2 g » — **confiance moyenne** (colonnes céfotaxime/ceftazidime imbriquées dans le PDF).

### Fiche 3.4 — Ceftriaxone : RCP ROCEPHINE 1 g/3,5 mL IM (CIS 61476925)

- RCP 15/04/2025. URL : https://base-donnees-publique.medicaments.gouv.fr/medicament/61476925/extrait — **consultée (contenu lu)**.
- 4.2 : 1 à 2 g/jour ; 2 à 4 g/jour (méningite, endocardite, neutropénie fébrile) ; « Il n'est pas nécessaire de réduire la dose de ceftriaxone en cas d'insuffisance rénale » (si fonction hépatique conservée) ; ClCr < 10 mL/min : ne pas dépasser « 2 g par jour » ; hémodialyse : pas de dose supplémentaire (non dialysable) ; insuffisance hépatique sévère : « Aucune donnée issue d'études n'est disponible ».
- 4.4 : calcium (pas de mélange/co-administration), précipités biliaires, encéphalopathie (âgés, IR grave).
- SPILF 2025 (p. 165, confiance moyenne) : standard « 1 à 2 g toutes les 24 h en perfusions de 30 min ou en intraveineux direct » ; forte « 2 g toutes les 12 h ».

### Fiche 3.5 — Amoxicilline IV : RCP AMOXICILLINE PANPHARMA 1 g (CIS 66918105)

- RCP 09/02/2023. URL : https://base-donnees-publique.medicaments.gouv.fr/medicament/66918105/extrait — **consultée (contenu lu)**.
- 4.2 : « 750 mg à 2 g toutes les 8 heures, ou 2 g toutes les 12 heures, au maximum 12 g/ jour » ; méningite/endocardite « 1 g à 2 g toutes les 4 à 6 heures, au maximum 12 g/jour » ; tableau en **DFG** (mL/min) : 10-30 : « 1 g immédiatement, puis 500 mg à 1 g deux fois par jour » ; < 10 : « 1 g immédiatement, puis 500 mg/jour » ; > 30 : pas d'adaptation ; hémodialyse : « 1 g en fin de dialyse, puis 500 mg toutes les 24 heures » ; DP : 1 g puis 500 mg/j.
- 4.4 : cristallurie (« maintenir un apport hydrique et une émission d'urine adéquats ») ; « Des convulsions peuvent apparaitre chez les patients insuffisant rénaux ou recevant des doses élevées ».
- SPILF 2025 (p. 159, confiance élevée) : standard « 50 à 100 mg/kg/jour en 3 à 4 perfusions de 30 à 60 min » ; forte « 100 à 200 mg/kg/jour en 6 administrations (perfusions de 30 à 60 min toutes les 4 h) » ou continue « après dose de charge de 2 g ».

### Fiche 3.6 — Amoxicilline-acide clavulanique IV : RCP SANDOZ 1 g/200 mg (CIS 62096413)

- RCP 21/02/2023. URL : https://base-donnees-publique.medicaments.gouv.fr/medicament/62096413/extrait — **consultée (contenu lu)**.
- 4.2 : « 1 g/200 mg toutes les 8 heures » (3 g/600 mg par jour) ; ClCr > 30 : pas d'adaptation ; 10-30 : 1 g/200 mg puis « 500 mg/100 mg deux fois par jour » ; < 10 : 1 g/200 mg puis « 500 mg/100 mg toutes les 24 heures » ; hémodialyse : idem < 10 + « une dose de 500 mg/100 mg à la fin de la dialyse » ; insuffisance hépatique : « Utiliser avec prudence et surveiller la fonction hépatique régulièrement ».
- 4.4 : hépatotoxicité (« des décès ont été signalés dans des circonstances extrêmement rares »), convulsions (IR, fortes doses), cristallurie.
- SPILF 2025 (p. 160, confiance élevée) : standard « 1 g amoxicilline + 0,2 g acide clavulanique en perfusions de 30 à 60 min toutes les 8 à 6 h » ; forte « 2 g amoxicilline + 0,2 g acide clavulanique […] toutes les 8 h » ; « Ne pas dépasser 1,2 g d'acide clavulanique par jour. »

### Fiche 3.7 — Pipéracilline-tazobactam : RCP TAZOCILLINE 4 g/0,5 g (CIS 60445784)

- URL : https://base-donnees-publique.medicaments.gouv.fr/medicament/60445784/extrait — **consultée (contenu lu)** (date du RCP non restituée).
- 4.2 : « La dose habituelle est de 4 g de pipéracilline/0,5 g de tazobactam donnée toutes les 8 heures. » (toutes les 6 h : pneumonie nosocomiale, neutropénie) ; ClCr > 40 : « Pas d'ajustement de dose nécessaire » ; 20-40 : « Dose maximum suggérée : 4 g/0,5 g toutes les 8 heures » ; < 20 : « Dose maximum suggérée : 4 g/0,5 g toutes les 12 heures » ; hémodialyse : « une dose supplémentaire de 2 g pipéracilline/0,25 g tazobactam doit être administrée après chaque séance de dialyse » ; perfusion 30 min.
- 4.4 : convulsions (fortes doses, IR) ; « une évaluation périodique de la fonction hématopoïétique doit être effectuée » ; association vancomycine : « une augmentation de l'incidence de lésion rénale aiguë » ; kaliémie.
- SPILF 2025 (p. 161, confiance élevée) : standard « 4 g pipéracilline + 0,5 g tazobactam toutes les 6 h en perfusions de 30 min » ou prolongée « toutes les 8 h en perfusions de 4 h » ou continue « 8 g pipéracilline + 1 g tazobactam /jour après dose de charge » ; forte : courtes « objectif non atteignable », prolongée « toutes les 6 h en perfusions de 3 h », continue « 12 g pipéracilline + 1,5 g tazobactam /jour » ; « Pseudomonas spp. […] forte posologie uniquement ».

### Fiche 3.8 — Méropénème : RCP MEROPENEM KALCEKS 1 g (CIS 69700834)

- RCP 20/01/2026. URL : https://base-donnees-publique.medicaments.gouv.fr/medicament/69700834/extrait — **consultée (contenu lu)**.
- 4.2 : Tableau 1 : 500 mg ou 1 g toutes les 8 h (pneumonie sévère, IU compliquée, intra-abdominale), 2 g toutes les 8 h (méningite, mucoviscidose) ; Tableau 2 : ajustement « lorsque la clairance de la créatinine est inférieure à 51 mL/min » : 26-50 : une dose unitaire /12 h ; 10-25 : moitié /12 h ; < 10 : moitié /24 h ; « La dose requise doit être administrée après la fin de la séance d'hémodialyse. » ; perfusion « d'environ 15 à 30 minutes », bolus ≤ 1 g « en 5 minutes environ ».
- 4.4 : « Des crises convulsives ont été peu fréquemment rapportées lors du traitement par les carbapénèmes » ; surveillance hépatique.
- SPILF 2025 (p. 167, confiance élevée) : standard « 1 g toutes les 8 h en perfusions de 30 min » ; forte « 2 g toutes les 8 h en perfusions de 3 à 8 h ».

### Fiche 3.9 — Imipénème-cilastatine : RCP IMIPENEM CILASTATINE PANPHARMA 500 mg/500 mg (CIS 65336568)

- RCP 17/06/2022. URL : https://base-donnees-publique.medicaments.gouv.fr/medicament/65336568/extrait — **consultée (contenu lu)**.
- 4.2 : 500 mg/6 h ou « 1 000 mg/1 000 mg toutes les 8 heures OU toutes les 6 heures » ; « La dose quotidienne totale maximale ne devra pas dépasser 4 000 mg/4 000 mg par jour. » ; Tableau 1 selon dose totale (2/3/4 g/j) et ClCr : ≥ 90 : 500/6 h, 1 000/8 h, 1 000/6 h ; 60-89 : 400/6 h, 500/6 h, 750/8 h ; 30-59 : 300/6 h, 500/8 h, 500/6 h ; 15-29 : 200/6 h, 500/12 h, 500/12 h ; < 15 : non administré « sauf si une hémodialyse est instaurée dans les 48 heures » ; dialysés : schéma 15-29, dose après séance puis toutes les 12 h.
- 4.4 : « Un respect strict des schémas posologiques recommandés s'impose. » (myoclonies, confusion, convulsions si dose non adaptée).
- SPILF 2025 (p. 166-167, confiance élevée) : standard « 0,5 g toutes les 6 h en perfusions de 30 min ou 1 g toutes les 8 h » ; forte « 1 g toutes les 6 h » ; « Posologie maximale journalière : 4 g. » ; « Du fait de la faible stabilité de l'imipénème, il n'est pas recommandé de réaliser des perfusions prolongées ou continues avec cette molécule. »

### Fiche 3.10 — Témocilline : RCP NEGABAN 1 g (CIS 62424059)

- URL : https://base-donnees-publique.medicaments.gouv.fr/medicament/62424059/extrait — **consultée (contenu lu)** (date non restituée).
- 4.2 : « Dose standard : 4 g par jour, à répartir en 2 administrations. » ; « 6 g par jour, à répartir en 3 administrations ou sous forme d'une perfusion continue. » ; « Une dose de charge de 2 g doit être administrée avant de commencer la perfusion continue. » ; IR : > 60 mL/min : 2 g/12 h ; 60-30 : 1 g/12 h ; 30-10 : 1 g/24 h ; **pas de palier < 10** ; hémodialyse haut débit : « 1 g (injection I.V.) par 24 heures de session inter-dialyse, de préférence à la fin de l'hémodialyse » (ou 2 g/48 h, 3 g/72 h) ; incertitudes posologiques signalées.
- 4.4 : « Des déterminations périodiques des électrolytes doivent être réalisées chez des patients avec de faibles réserves de potassium. » ; convulsions si surdosage/IR.
- SPILF 2025 (p. 161, confiance moyenne) : standard « 2 g toutes les 12 h en perfusions de 30 min » (IU sans gravité, Enterobacterales S) ; forte « 2 g toutes les 8 h » ou continue « 6 g/jour après dose de charge de 2 g ».

### Fiche 3.11 — Céfépime : RCP CEFEPIME STRAGEN 1 g (CIS 62202966)

- RCP 27/09/2024. URL : https://base-donnees-publique.medicaments.gouv.fr/medicament/62202966/extrait — **consultée (contenu lu)**.
- 4.2 : 1 g ×2/j à 2 g ×3/j (Pseudomonas sévère : 2 g ×3) ; tableau IR par ClCr 50-30, 29-11, ≤ 10 et hémodialyse (ex. 1 g ×2 → 1 g ×1 [50-30] → 500 mg ×1 [29-11]) ; hémodialyse : « dose de charge : 1 g, suivi de 500 mg, 1 fois/jour » ; « Les jours de dialyse, une dose doit être administrée après la séance de dialyse. » (≈ 68 % éliminé en 3 h) ; DPCA : doses usuelles « toutes les 48 heures » ; formule : « l'équation de Cockcroft peut être utilisée pour estimer la clairance à la créatinine », femme « 0,85 fois la Cl.Cr ».
- 4.4 : « Les bêtalactamines exposent au risque d'encéphalopathie » ; accru « en cas de surdosage et/ou d'insuffisance rénale, notamment chez le sujet âgé » ; adaptation « pour des clairances de créatinine inférieures ou égales à 50 ml/min ».
- Contexte : lettre DHPC ANSM 12/04/2018 (https://archive.ansm.sante.fr/content/download/142619/1885921/version/1/file/DHPC-180412-Cefepime.pdf — trouvée, non lue) ; Vidal 2018 (trouvé, non lu).
- SPILF 2025 (p. 163, confiance moyenne) : standard « 1 g toutes les 8 h en perfusions de 30 min » ; forte « 2 g toutes les 8 h en perfusions de 30 min » ou « en perfusions de 4 h » ; Pseudomonas/Acinetobacter : forte posologie « et nécessite un suivi thérapeutique pharmacologique ».

### Fiche 3.12 — Aztréonam : RCP AZACTAM 1 g (CIS 63918096)

- URL : https://base-donnees-publique.medicaments.gouv.fr/medicament/63918096/extrait — **consultée (contenu lu)**.
- 4.2 : « La dose maximale recommandée est de 8 g par jour. » ; 2-3 g/j (sévérité limitée) à 6-8 g/24 h en 3-4 injections ; IR : ≥ 30 mL/min dose normale ; 10-30 : demi-dose ; < 10 : quart de dose (après charge 1-2 g) ; hémodialysés : « 1/8 de dose après hémodialyse » ; IV directe 3-5 min ou perfusion 20-60 min.
- 4.4 : pas de mention de la ceftazidime ; prudence « composés structurellement apparentés » ; surveillance rénale si aminoside associé.
- SPILF 2025 (p. 166, confiance moyenne) : forte « 2 g toutes les 6 h en perfusions de 3 h » ou continue « 6 g/jour après dose de charge de 2 g » ; « Pseudomonas spp. : forte posologie uniquement ».

### Fiche 3.13 — Daptomycine : RCP DAPTOMYCINE MEDAC 500 mg (CIS 66921973)

- RCP 13/11/2023. URL : https://base-donnees-publique.medicaments.gouv.fr/medicament/66921973/extrait — **consultée (contenu lu)**.
- 4.2 : 4 mg/kg/24 h (IcPTM) ; 6 mg/kg/24 h (bactériémie à S. aureus, endocardite droite) ; ClCr < 30 mL/min : 4 ou 6 mg/kg « toutes les 48 heures » ; « Si possible, DAPTOMYCINE MEDAC doit être administré après la fin de la dialyse les jours de dialyse » ; perfusion 30 min ou injection 2 min. **« Il n'y a aucune posologie de 8 à 10 mg/kg pour l'adulte »** dans le RCP (hors AMM).
- 4.4 : CPK « à l'initiation, puis à intervalles réguliers (au moins une fois par semaine) » ; à risque (ClCr < 80 mL/min, statines, fibrates, ciclosporine) : « par ex. tous les 2-3 jours au moins pendant les deux premières semaines » ; arrêt si symptômes musculaires inexpliqués avec CPK > 5 × LSN (seuil 10 × LSN **non mentionné**) ; pneumonie à éosinophiles : arrêt immédiat.
- Dose hors AMM 8-12 mg/kg : SPILF 2025 (p. 172) : ligne « 8 à 12 mg/kg en perfusions de 30 min en dose unique journalière » lue dans la colonne « Posologie standard » du bloc « Divers » ; attribution à la daptomycine par cohérence (seule molécule en mg/kg DUJ de ce bloc) — **confiance moyenne**. Aucune recommandation française dédiée (SPILF endocardite/IOA) retrouvée ; enquête SPILF 2010 (trouvée, non lue) décrivait déjà 8-10 mg/kg hors AMM.

### Fiche 3.14 — Linézolide : RCP LINEZOLIDE PANPHARMA 2 mg/ml (CIS 67910613)

- RCP 25/08/2026. URL : https://base-donnees-publique.medicaments.gouv.fr/medicament/67910613/extrait — **consultée (contenu lu)**.
- 4.2 : 600 mg ×2/j, perfusion 30-120 min ; « La durée maximale du traitement est de 28 jours. » ; IR : pas d'adaptation, prudence si ClCr < 30 ; hémodialyse : « il devra être administré après dialyse » ; insuffisance hépatique : « Aucun ajustement posologique n'est nécessaire. »
- 4.4 : « il est recommandé de surveiller une fois par semaine la numération sanguine complète » ; > 28 jours : « sa fonction visuelle doit être régulièrement surveillée » ; acidose lactique ; syndrome sérotoninergique.
- SPILF 2025 (p. 171, confiance élevée) : « 0,6 g per os ou par voie iv toutes les 12 h » ; « Le suivi thérapeutique pharmacologique peut être utile pour évaluer la toxicité hématologique. »

### Fiche 3.15 — Rifampicine : RCP RIFADINE IV 600 mg (CIS 63096551)

- URL : https://base-donnees-publique.medicaments.gouv.fr/medicament/63096551/extrait — **consultée (contenu lu)** (date non restituée).
- 4.2 : tuberculose « en moyenne 10 mg/kg/jour en une seule perfusion quotidienne » ; infections graves « 20 à 30 mg/kg/jour en 2 perfusions » ; insuffisance hépatique : « La posologie devra être diminuée » (ex. TB « 5 mg/kg/jour en 1 prise sans dépasser 900 mg/jour »), « On pourra s'aider du dosage de la rifampicinémie. » ; IR 60-30 ml/min : rifampicinémie « au 2ème ou 3ème jour du traitement » ; < 30 : « l'espacement des prises est indispensable ».
- 4.4 : bilan hépatique « au 8ème jour, à la fin du 1er mois, puis de façon plus espacée (2 mois) » ; si hépatopathie préexistante « toutes les 2 à 4 semaines » ; induction : « l'effet inducteur atteint un niveau maximum en 15 jours environ et persiste 1 à 2 semaines après l'arrêt » ; AVK « pendant le traitement par la rifampicine et 8 jours après son arrêt » ; contraception mécanique additionnelle ; coloration « (jaune, orange, rouge, brune) des dents, de l'urine, de la sueur » ; « On évitera la prise discontinue de rifampicine » ; reprise progressive (150 mg/j).

### Fiche 3.16 — Ciprofloxacine IV : RCP CIFLOX 200 mg/100 mL (CIS 65126598)

- RCP 13/03/2026. URL : https://base-donnees-publique.medicaments.gouv.fr/medicament/65126598/extrait — **consultée (contenu lu)**.
- 4.2 : 400 mg 2 à 3 fois/jour selon indication ; ClCr 30-60 mL/min/1,73 m² : « 200-400 mg toutes les 12 h » ; < 30 : « 200-400 mg toutes les 24 h » ; hémodialyse : « après la dialyse » ; perfusion « de 30 minutes pour la solution de 200 mg » (60 min pour 400 mg selon autres RCP).
- 4.4 : « Le risque de tendinite et de rupture de tendon est augmenté chez les patients âgés » (IR, greffés, corticoïdes) ; « dès les premières 48 heures du traitement » et « jusqu'à plusieurs mois après l'arrêt » ; QT : « Les patients âgés et les femmes peuvent être plus sensibles aux traitements allongeant l'intervalle QT » ; « Si des crises se produisent, la prise de ciprofloxacine doit être interrompue » ; glycémie chez diabétiques.

### Fiche 3.17 — Lévofloxacine IV : RCP LEVOFLOXACINE ARROW 5 mg/mL perfusion (CIS 67660704)

- RCP 21/10/2026. URL : https://base-donnees-publique.medicaments.gouv.fr/medicament/67660704/extrait — **consultée (contenu lu)**.
- 4.2 : « 500 mg une ou deux fois par jour » (PAC) ; pyélonéphrite « 500 mg une fois par jour » ; IR : tableau par ClCr 50-20, 19-10, < 10 (HD/DPCA) avec dose initiale normale puis entretien réduit (ex. schéma 250 mg : « puis : 125 mg/24 h ») ; extraits de recherche (LEVOFLOXACINE SUN 500 mg cp) : « 50 - 20 ml/min · puis: 125 mg/24 h · puis: 250 mg/24 h · puis: 250 mg/12 h; 19 - 10 ml/min · puis: 125 mg/48 h · puis: 125 mg/24 h · puis: 125 mg/12 h » (selon schéma 250/500/750 mg) — confiance moyenne ; perfusion « d'au moins 30 minutes pour le dosage 250 mg ou 60 minutes pour le dosage 500 mg ».
- 4.4 : tendinite (âgés, IR, greffés, corticoïdes) ; « Les patients âgés et les femmes peuvent être plus sensibles aux traitements allongeant l'intervalle QTc. » ; épilepsie = contre-indication ; dysglycémie ; anévrisme/dissection aortiques.

### Fiche 3.18 — Cotrimoxazole IV : RCP BACTRIM, solution injectable pour perfusion (CIS 69233327)

- RCP 21/07/2025. URL : https://base-donnees-publique.medicaments.gouv.fr/medicament/69233327/extrait — **consultée (contenu lu)**.
- 4.2 : « 2 ampoules en perfusion toutes les 12 heures » (jusqu'à 3 ampoules ×2 si sévère) ; « Clairance de la créatinine > 30 ml/min : posologie normale, 2 perfusions journalières. » ; 15-30 : demi-dose, 1 perfusion/jour ; < 15 hors dialyse : ne pas utiliser ; hémodialyse : demi-dose après dialyse, sulfaméthoxazolémie « tous les trois jours ».
- 4.4 : « Un contrôle hématologique périodique est nécessaire » (traitement prolongé, > 65 ans, carence en folates ; fréquence non chiffrée) ; « Une surveillance étroite de la kaliémie et de la fonction rénale est nécessaire » (fortes doses, IR, VIH, âgés, hyperkaliémiants) ; hydratation ≥ 2 L/j ; acide folinique si anomalies hématologiques.

### Fiche 3.19 — Fosfomycine IV : RCP FOSFOCINE 1 g IV (CIS 68027363)

- RCP 08/10/2020 ; **« abrogé depuis le 24/02/2023 »** (mention BDPM). URL : https://base-donnees-publique.medicaments.gouv.fr/medicament/68027363/extrait — **consultée (contenu lu)**.
- 4.2 : adulte (ClCr > 80) « 12 à 24 g […] en 2 à 3 doses fractionnées » (dose unitaire ≤ 8 g ; sécurité limitée > 16 g/j) ; perfusion ≥ 15 min (2 g), 30 min (3-5 g), 60 min (8 g) ; IR : 40-80 : pas d'ajustement ; Tableau 2 : 70 % de la dose à 40 ml/min, 60 % à 30, 40 % à 20, 20 % à 10 ; dose de charge « mais sans dépasser 8 g » ; hémodialyse chronique : « 2 g de fosfomycine à la fin de chaque séance de dialyse ».
- 4.4 : « 14,4 mmol (ou 330 mg) de sodium par gramme » ; « Les taux de sodium et de potassium doivent être régulièrement surveillés » ; insuffisance cardiaque.
- Spécialités disponibles non lues : FOSFOMYCINE PANPHARMA 4 g (https://base-donnees-publique.medicaments.gouv.fr/medicament/63322018/extrait), FOMICYT 4 g (65164104).
- SPILF 2025 (p. 172, confiance moyenne) : fosfomycine iv « 4 g par voie iv toutes les 8 à 6 h en perfusions de 30 min à 4 h ».

### Fiche 3.20 — Gentamicine / amikacine : voir fiches 1.2 et 1.3.

### Fiche 3.21 — Stabilité des antibiotiques en perfusion prolongée/continue (référence citée par SPILF 2025)

- Référence : Infect Dis Now / MMI-FMC, DOI 10.1016/j.mmifmc.2024.12.005 (recommandations françaises coordonnées par la SPILF, 2024-2025). Statut : **introuvable en texte** (DOI seulement, cité p. 158 du tableau SPILF 2025 et en en-tête du PDF). Référence antérieure citée par Info-antibio 2018 : Longuet et al., Med Mal Infect 2016;46:242-68.

---

## 4. FONCTION RÉNALE

### Fiche 4.1 — HAS, « Maladie rénale chronique de l'adulte : 7 messages clés pour améliorer votre pratique »

- Organisme : Haute Autorité de Santé. Type : fiche « Recommander les bonnes pratiques ». Validée par le Collège le 1er juillet 2021, **mise à jour septembre 2023**.
- URL : https://has-sante.fr/upload/docs/application/pdf/2021-09/fiche__mrc.pdf (page : https://www.has-sante.fr/jcms/p_3289326/fr/maladie-renale-chronique-7-messages-cles-pour-ameliorer-votre-pratique)
- Consultation : 2026-11-04 — Statut : **consultée (contenu lu)** (PDF → texte intégral).
- Vigueur : en vigueur (rattachée au Guide du parcours de soins MRC, mis en ligne le 17/11/2023, https://www.has-sante.fr/jcms/p_3288950/fr/guide-du-parcours-de-soins-maladie-renale-chronique-de-l-adulte-mrc — page lue, le PDF du guide n'a pas été restitué).
- Extraits (message 4, p. 2) :
  - « L'adaptation des posologies doit s'effectuer à partir de l'estimation du DFG obtenue par la formule CKD-EPI »
  - « L'estimation de la filtration glomérulaire par la formule de Cockcroft-Gault sous-estime le DFG lorsqu'on utilise une méthode de dosage standardisée de la créatinine. »
  - « il est actuellement recommandé d'utiliser la formule CKD-EPI pour estimer le DFG et adapter les posologies ou l'intervalle des doses des médicaments à élimination rénale. »
  - Note 3 : « la désindexation de la formule en tenant compte de la surface corporelle du patient (estimée à partir de la formule de Dubois et Dubois : SC (m²) = 0,007184 x taille (cm)0,725 x poids réel (kg)0,425) est recommandée lorsque celle-ci est éloignée de 1,73 m² »
  - Note 4 : « Ne plus utiliser la formule de Cockcroft-Gault »
  - Message 3 : « les dosages médicamenteux sont recommandés chaque fois qu'ils sont possibles. »
  - **La fiche ne précise pas la version de CKD-EPI (2009 vs 2021).**
- Confiance : élevée.

### Fiche 4.2 — HAS 2011, « Évaluation du débit de filtration glomérulaire et du dosage de la créatininémie dans le diagnostic de la maladie rénale chronique chez l'adulte » (rapport d'évaluation technologique, décembre 2011)

- URL : https://www.has-sante.fr/jcms/c_1064297/fr/… — **trouvée mais contenu non lisible** (page de connexion HAS renvoyée). Le PDF « texte_court_dfg_creatininemie.pdf » (https://has-sante.fr/upload/docs/application/pdf/2012-04/texte_court_dfg_creatininemie.pdf) a été lu mais **contient en réalité le texte court du rapport albuminurie/créatininurie (décembre 2011)**, pas celui du DFG.
- Contenu rapporté par des sources secondaires (résumé INAHTA, Delanaye 2016, Vidal 2022) : recommandation d'utiliser CKD-EPI et un dosage enzymatique de la créatinine (**non lu dans la source primaire** → confiance faible). Le texte court albuminurie lu confirme seulement : « Les plus utilisées sont les équations de Cockcroft et Gault, MDRD, et plus récemment l'équation CKD-EPI » et les stades (DFG < 60, 15-59, < 15 mL/min/1,73 m²).

### Fiche 4.3 — Vidal, « Estimation du débit de filtration glomérulaire » (Pr Martin Flamant, Bichat), 2 articles

- URL : https://www.vidal.fr/actualites/29881-estimation-du-debit-de-filtration-glomerulaire-quelle-formule-utiliser.html (20/10/2022) et https://www.vidal.fr/actualites/29888-estimation-du-debit-de-filtration-glomerulaire-l-utilisation-des-formules-en-pratique.html (27/10/2022) — **consultées (contenu lu)** ; les formules sont en image (non lisibles).
- Extraits : CKD-EPI « recalculée en 2021 sans prise en compte du facteur ethnique » ; « Cette formule Race Free est désormais recommandée par les instances nord-américaines » ; « la formule CKD-EPI en première intention, recommandée par les groupes de travail nationaux et internationaux » ; Cockcroft « présente une modélisation erronée de l'âge », non réévaluée en IDMS, résultat individuel « inutilisable » ; limites : IMC < 18, obésité morbide, amputation, cirrhose, grabataires (surestimation), greffe récente ; EKFC « applicable de l'enfant au sujet très âgé ».
- Confiance : moyenne (article d'opinion d'expert, pas une recommandation).

### Fiche 4.4 — La Revue du Praticien, « Débit de filtration glomérulaire : quelle formule utiliser ? » (C. Nobile, 1er février 2023)

- URL : https://www.larevuedupraticien.fr/article/debit-de-filtration-glomerulaire-quelle-formule-utiliser — **consultée (contenu lu)**.
- Extraits : « la formule de Cockcroft devant être abandonnée au profit de la CKD-EPI » ; CKD-EPI « recalculée en 2021 sans prendre en compte le facteur ethnique » ; EKFC plus performante < 35-40 ans et > 75 ans ; référence HAS citée : mise à jour recommandations MRC du 12 octobre 2021.
- Confiance : moyenne.

### Fiche 4.5 — Position SFNDT sur CKD-EPI 2021 vs 2009 vs EKFC

- Statut : **introuvable** (aucun texte officiel SFNDT daté retrouvé). Éléments indirects : présentation congrès SFNDT Rennes 2022 (Delanaye, https://orbi.uliege.be/bitstream/2268/295432/1/DelanayeRennesSFNDT2022.pdf, non lue) concluant que CKD-EPI 2021 est « suboptimale » chez le transplanté en France ; Vidal 2022 : la suppression du facteur ethnique « conduit à une perte de précision significative » en population européenne (**non lu dans la source primaire**).
- Conclusion pratique pour l'application : la HAS (2023) impose « CKD-EPI » sans préciser la version ; en France les laboratoires rendent historiquement CKD-EPI 2009 sans facteur ethnique (**NON VÉRIFIÉ**, connaissance antérieure). Prévoir le paramétrage des deux versions.

### Fiche 4.6 — NKF, CKD-EPI 2021 (formule)

- URL : https://www.kidney.org/professionals/kdoqi/gfr_calculator/formula — **consultée (contenu lu)**.
- Formule (verbatim, mise en forme aplatie) : « eGFR = 142 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^−1.200 × 0.9938^Age × 1.012 [if female] » ; κ = 0,7 (F) / 0,9 (H) ; α = −0,241 (F) / −0,302 (H) ; Scr en mg/dL, eGFR en mL/min/1,73 m² ; « Designed for use with laboratory creatinine values that are standardized to IDMS. »
- CKD-EPI 2009 (**NON VÉRIFIÉ**, connaissance antérieure) : 141 × min(Scr/κ,1)^α × max(Scr/κ,1)^−1,209 × 0,993^âge × 1,018 [F] × 1,159 [race noire] ; α = −0,329 (F) / −0,411 (H).

### Fiche 4.7 — Cockcroft-Gault (formule)

- Lue dans le RCP vancomycine (fiche 2.3) : « Hommes : [poids (kg) x [140 - âge (ans)]] / [72 x créatinine plasmatique (mg/dl)] » ; femmes × 0,85. Confirmé par RCP céfépime (fiche 3.11) : « l'équation de Cockcroft peut être utilisée pour estimer la clairance à la créatinine », femme « 0,85 fois ». Confiance : élevée.
- Version µmol/L (**NON VÉRIFIÉ**, connaissance antérieure) : ClCr (mL/min) = k × (140 − âge) × poids (kg) / créatininémie (µmol/L), k = 1,23 (H) / 1,04 (F). Wikipédia FR « Clairance de la créatinine » (lue) ne donne pas la formule.

### Fiche 4.8 — Surface corporelle et poids

- Du Bois : HAS 2023 (fiche 4.1) : « SC (m²) = 0,007184 x taille (cm)0,725 x poids réel (kg)0,425 » — élevée.
- Mosteller : Wikipédia EN « Body surface area » (https://en.wikipedia.org/wiki/Body_surface_area, lue) : « BSA = √((height × weight) / 3600) » (cm, kg, m²) — moyenne.
- Devine : Wikipédia EN « Human body weight » (https://en.wikipedia.org/wiki/Human_body_weight, lue) : « Male ideal body weight = 50 kilograms (110 lb) + 0.9 kilograms (2.0 lb) × (height (cm) − 152) » ; « Female ideal body weight = 45.5 kilograms (100 lb) + 0.9 kilograms (2.0 lb) × (height (cm) − 152) » — moyenne (version en pouces : 50/45,5 kg + 2,3 kg par pouce > 5 pieds, **NON VÉRIFIÉ**).
- Lorentz : RCP gentamicine (fiche 1.2) : H = T − 100 − (T − 150)/4 ; F = T − 100 − (T − 150)/2 — élevée. Wikipédia FR « Poids idéal » (lue) donne pour la femme « (Taille − 105) − (Taille − 150)/2,5 » (**divergence** de variante, voir §7).
- Poids ajusté aminosides : RCP amikacine Stragen : poids idéal + 40 % de l'excédent ; RCP gentamicine Panpharma : poids idéal + 0,43 × surcharge — élevée.

### Fiche 4.9 — GPR (Guide de Prescription et Rein)

- Page lue : https://www.vidal.fr/gpr/guide-prescription-rein-a-propos.html — **consultée (contenu lu)**. Extraits : « un ensemble d'outils digitaux permettant le Bon Usage Clinique du Médicament » ; fondé sur « les documents réglementaires des produits (Résumés des Caractéristiques des Produits) » ; « GPR reste gratuit pour les professionnels de santé libéraux. » ; établissements : « uniquement par la souscription d'un abonnement annuel » (depuis le 1er septembre 2023 selon résultats de recherche) ; accès via vidal.fr, Vidal Hoptimal, Vidal Mobile. Un communiqué M3/Vidal du 6 août 2025 (trouvé, non lu) annonce l'acquisition du GPR par le groupe Vidal.
- https://sitegpr.com/ : **le domaine renvoie une page de casino en ligne (« Betify », « Mise à jour : avril 2026 »)** ; https://sitegpr.com/fr/ : 404. → Ne plus citer sitegpr.com ; pointer vers vidal.fr/gpr.
- Principes (formules utilisées, seuils, dialyse) : **non documentés sur la page lue**. Le sigle « Guide de Prescription et Rein » et l'origine ICAR (Pitié-Salpêtrière) relèvent de connaissances antérieures (**NON VÉRIFIÉ** sur la page).

### Fiche 4.10 — IRA, instabilité, dialyse (principes)

- Formules non applicables en IRA/instabilité : affirmé par SFPT/SFAR 2018 (R1.2.1-1.2.2 : préférer la clairance mesurée U×V/P en réanimation) et par Vidal 2022 (limites). Pas de texte HAS dédié retrouvé.
- Hémodialyse intermittente : règle « dose après séance » lue dans les RCP céfotaxime, céfépime, méropénème, imipénème, pipéracilline-tazobactam (dose supplémentaire 2 g/0,25 g), amoxicilline (1 g en fin de dialyse), amox-clav (500/100 mg en fin de dialyse), aztréonam (1/8 de dose), témocilline (1 g de préférence en fin de séance), daptomycine, linézolide, ciprofloxacine, cotrimoxazole (demi-dose après), fosfomycine (2 g après). **Exception** : gentamicine « 2 à 4 heures avant la séance » (RCP Panpharma) ; ceftriaxone : pas de supplément.
- EER continue : SFPT/SFAR R4.2 (STP) ; Rybak 2020 Rec. 16 (vancomycine : charge 20-25 mg/kg, 7,5-10 mg/kg/12 h, dosage < 24 h) ; amikacine : étude AMIDIAL-ICU 2025 (Ann Intensive Care, https://annalsofintensivecare.springeropen.com/articles/10.1186/s13613-025-01461-z, trouvée, non lue : 15 mg/kg suffirait en HDI et 20 mg/kg en EER continue pour CMI ≤ 4 ; 30 mg/kg pour CMI 8).

---

## 5. GROSSESSE / ALLAITEMENT — CRAT (lecrat.fr)

Structure des URL : `https://www.lecrat.fr/<id>/` (l'ancien format `spip.php?page=article&id_article=` renvoie 404). Organisme : CRAT (Centre de Référence sur les Agents Tératogènes). Toutes consultées le 2026-11-04.

| Fiche | URL | MAJ | Statut | Extraits « En pratique » |
|---|---|---|---|---|
| Pénicillines – Grossesse | https://www.lecrat.fr/13385/ | 31.07.2024 | lue | « L'utilisation des pénicillines suivantes est possible quel que soit le terme de la grossesse » (péni V, amoxicilline, ampicilline, péni G) ; « envisageable quel que soit le terme de la grossesse, à posologies efficaces » (pipéracilline ± tazobactam, ampicilline-sulbactam) |
| Amoxicilline – Grossesse / Allaitement | https://www.lecrat.fr/6654/ ; https://www.lecrat.fr/6655/ | 31.07.2024 | résultats de recherche (non lues en détail) | grossesse : utilisable à tout terme ; allaitement : < 1 % de la dose pédiatrique, possible sauf allergie aux bêta-lactamines chez l'enfant |
| Céphalosporines – Grossesse | https://www.lecrat.fr/13360/ | 31.07.2024 | lue | « L'utilisation de la céfazoline est possible, en particulier au-delà du 1er trimestre. » ; « On préférera le céfuroxime quel que soit le terme » ; céfotaxime, ceftriaxone, ceftazidime utilisables « quel que soit le terme de la grossesse, en raison de leur intérêt thérapeutique » ; « l'utilisation du céfépime est envisageable quel que soit le terme » (si les précédentes ne conviennent pas) |
| Imipénem – Grossesse | https://www.lecrat.fr/13283/ | — | résultat de recherche | « l'utilisation de l'association imipénem – cilastatine est envisageable quel que soit le terme de la grossesse » ; méropénème : fiche introuvable |
| Aminosides – Grossesse | https://www.lecrat.fr/7720/ | 27.02.2025 | lue | amikacine, gentamicine, tobramycine utilisables à tout terme (règles habituelles, fonction rénale maternelle) ; « Quelques cas de surdité ont été rapportés chez des enfants exposés in utero aux aminosides par voie injectable » (surtout streptomycine/kanamycine, traitements prolongés) ; « Aucun cas de toxicité rénale n'a été décrit à ce jour chez des enfants de mères traitées » ; si traitement prolongé « tenir compte de l'exposition in utero à ces aminosides lors du dépistage néonatal des troubles de l'audition » ; streptomycine/kanamycine : à ne pas utiliser sauf exception |
| Aminosides / Gentamicine / Amikacine – Allaitement | https://www.lecrat.fr/7713/ ; 7721 ; 7706 | — | résultats de recherche | allaitement possible (y compris prématuré) ; gentamicine ≈ 2 % de la dose maternelle ; reconsidérer si traitement > 5 jours (accumulation) |
| Fluoroquinolones – Grossesse | https://www.lecrat.fr/13399/ | 31.07.2024 | lue | « La ciprofloxacine est la fluoroquinolone de 1ère intention quel que soit le terme de la grossesse. » ; « la lévofloxacine ou l'ofloxacine peuvent être utilisées en 2ème intention » ; « Aucune toxicité sur les cartilages articulaires n'a à ce jour été rapportée » chez l'enfant exposé in utero ; (ciprofloxacine 6630 : HAS 2021 — FQ sans place dans cystite/bactériurie de la grossesse) |
| Ciprofloxacine – Allaitement | https://www.lecrat.fr/6631/ | 31.07.2024 | résultat de recherche | utilisation orale/injectable acceptable ; ≈ 3 % de la dose pédiatrique |
| Cotrimoxazole – Allaitement | https://www.lecrat.fr/6661/ | 22.10.2025 | lue | « son utilisation est possible chez une femme qui allaite sauf si l'enfant est susceptible d'être déficitaire en G6PD. » ; « éviter de débuter une grossesse sous cotrimoxazole » |
| Triméthoprime – Grossesse (renvoi cotrimoxazole) | https://www.lecrat.fr/6669/ | 03.10.2025 | lue | risque discuté « anomalies de fermeture du tube neural » (données à confirmer) ; < 10 SA : « On préférera un autre antibiotique » ; acide folique « en théorie logique », 5 mg/j proposé par analogie (sans étude) ; > 10 SA : utilisable après avoir écarté les autres options ; ictère néonatal à terme : **non lu** (fiche Cotrimoxazole – Grossesse non atteinte ; la fiche 364 ancienne format est 404) |
| Triméthoprime – Allaitement | https://www.lecrat.fr/6671/ | 22.10.2025 | lue | « son utilisation est possible chez une femme qui allaite. » (≈ 6 % de la dose maternelle) |
| Cyclines – Grossesse | https://www.lecrat.fr/13144/ | 31.07.2024 | lue | 1er trimestre : doxycycline très nombreuses données « sans effet malformatif attribuable au traitement » ; coloration des dents de lait si exposition ≥ 15 j au 3e trimestre (« En théorie ceci pourrait se produire à partir de 14 semaines d'aménorrhée », cas rapportés > 28 SA) ; au-delà du 1er trimestre, préférer un autre antibiotique si possible ; acné : « la poursuite au-delà du 1er trimestre n'est pas recommandée » |
| Vancomycine – Grossesse | https://www.lecrat.fr/13364/ | 26.12.2024 | lue | « la vancomycine peut être utilisée quel que soit le terme de la grossesse » ; « aucun effet malformatif attribuable au traitement n'a été rapporté à ce jour » ; traitement prolongé : « tenir compte de l'exposition in utero à la vancomycine lors du dépistage néonatal des troubles de l'audition » ; pas de consigne de dosage plasmatique |
| Rifampicine – Grossesse | https://www.lecrat.fr/8385/ | — | résultat de recherche | utilisable quel que soit le terme ; rares hémorragies néonatales précoces (induction enzymatique) |
| Linézolide | — | — | **introuvable** | — |

Source complémentaire lue : C. Charlier (Cochin), « Antibiotiques et grossesse », séminaire DESC mars 2026 (https://www.infectiologie.com/UserFiles/File/formation/desc/2026/seminaire-desc-mars-2026/lundi-23-t.-21/conf-1-antibiotiques-et-grossesse-c-charlier.pdf, **consultée, contenu lu**) : diapo 5 « Gentamicine/amikacine : 2 aminosides OK pendant la grossesse, dose unique/j, durée courte » ; « Triméthoprime : tératogène entre 1-10SA : tube neural++++ CI T1 et ajouter acide folique » ; « Sulfamide : déplace bilirubine /albumine : déconseillé à terme » ; « Ciprofloxacine: seule quinolone autorisée dans les infections urinaires pendant la grossesse » ; diapo 9 : tétracyclines « NON » ; diapo 11 allaitement : quinolones « NON » (reprise 48 h après arrêt), tétracyclines « NON », cotrimoxazole « Probablement OUI » ; références : « Le site CRAT ». **Divergences** CRAT vs Charlier : voir §7.

---

## 6. ALLERGIE AUX BÊTA-LACTAMINES

### Fiche 6.1 — ESCMID 2026 (Joean O, Sermet K, Ashkenazi-Hoffnung L, et al.)

- Titre : « ESCMID clinical guidelines on the evaluation and management of a reported antibiotic allergy ». Clin Microbiol Infect 2026;32(5):767-787. DOI 10.1016/j.cmi.2026.02.011 ; PMID 41707748 ; publication électronique 16 février 2026.
- URL texte intégral : https://www.clinicalmicrobiologyandinfection.org/article/S1198-743X(26)00069-8/fulltext — **trouvée mais contenu non lisible (403)**. Résumé lu via Europe PMC (https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:41707748&resultType=core&format=json) — **consultée (résumé lu)**.
- Résumé (paraphrase du résumé lu) : 5-10 % des allergies déclarées seraient de vraies hypersensibilités ; panel de 16 experts, GRADE-ADOLOPMENT, accord ≥ 80 % ; évaluation clinique structurée fondée sur la réaction index ; si probabilité très faible ou faible : « direct delabelling or a controlled drug challenge ».
- Vigueur : recommandation en vigueur, la plus récente (remplace de fait les positions EAACI/ENDA 2020 — Romano et al., Allergy 2020 — pour la conduite clinique ; EAACI 2020 reste la référence pour le diagnostic allergologique).

### Fiche 6.2 — SPILF, « Allergies aux Bêta-lactamines : recommandations pour la pratique clinique », diaporama du groupe recommandations (8 avril 2026)

- URL page : https://www.infectiologie.com/fr/actualites/allergie-aux-antibiotiques_-n.html (21 avril 2026) ; fichier : https://www.infectiologie.com/UserFiles/File/spilf/recos/allergie-atb-escmid-spilf-2026-groupe-reco.pptx — **consultée (contenu lu)** (texte extrait des 10 diapositives ; **la diapositive 9 « Tableau des allergies croisées » et les algorithmes (diapos 5-6) sont des images, non lisibles**).
- Extraits :
  - Diapo 1 : « Diaporama du groupe SPILF recommandations d'après les recommandations Européennes : “ESCMID Clinical Guidelines…” publiées en février 2026 » ; « Réalisé le 8.4.2026 »
  - Diapo 2 (définitions, grave) : HSI = réaction cutanéo-muqueuse aiguë avec défaillance respiratoire ou hémodynamique ; HSR grave = « sd de Stevens Johnson, épidermolyse nécrosante suraiguë de Lyell », PEAG, purpura (vascularite), « EMP avec atteinte > 50% de la surface corporelle, et/ou atteinte des muqueuses […] et/ou signes systémiques associés (fièvre, éosinophilie >0.5G/L, atteinte d'organes […]) (DRESS) »
  - Diapo 3 (non grave) : « Urticaire=HSI », « EMP isolé=HSR » (< 50 % SC, sans signes systémiques)
  - Diapo 4 (stratification) — haut risque : « Urticaire (isolée, généralisée ou localisée) », « Réaction allergique non grave ET survenue ≤ à 5 ans » → « Prescription possible d'une céphalosporine avec des chaînes différentes* ou d'un monobactam (contre-indication si allergie ceftazidime/cefidérocol) ou d'un carbapénème » ; « Réaction allergique grave » → « Avis/cs en allergologie », « Contre-indication aux Bêla-ctamines » [sic] ; faible risque (réaction non grave sauf urticaire ET > 5 ans ; éruption sans précision sans gravité ; réaction non caractérisable sans gravité) → « Test de réintroduction » ; très faible risque → « L'ensemble des Bêta-lactamines sont utilisables y compris l'antibiotique incriminé »
  - Diapo 7 (faible risque) : « HSI non grave > 5 ans : test de réintroduction » ; « HSR non grave > 5 ans : réintroduction directe possible » ; alternatives : « Céphalosporines avec des chaînes latérales différentes* », « Monobactam », « Carbapénèmes »
  - Diapo 8 (haut risque) : pénicilline incriminée → avis allergologique ; alternatives : céphalosporines à chaînes différentes, monobactam, carbapénèmes
  - Diapo 10 (réintroduction) : « dose unique : administrer 100 % de la dose complète […] amoxicilline (500 mg pour les adultes) » ; « doses graduées : administrer 10 % […] (50 mg d'amoxicilline) ; observer pendant 30 minutes ; administrer 50 % […] ; observer pendant 30 minutes ; administrer le reste » ; « Surveillance médicale pendant 1 heure après la dernière dose » ; contre-indications : « maladie pulmonaire chronique sévère ou décompensée, maladie cardiaque chronique sévère (notamment sténose aortique), femme enceinte, instabilité hémodynamique, traitement par anti histaminique ou corticothérapie, consentement impossible »
- Note : le diaporama ne détaille pas textuellement « réaction retardée grave = CI de toute la classe » ; la diapo 4 dit « Réaction allergique grave → Contre-indication aux Bêta-lactamines » sans distinguer HSI/HSR graves. Le JNI 2024 (fiche 6.3) est plus explicite.
- Confiance : élevée pour le texte ; les taux de réactivité croisée et les chaînes latérales ne sont **pas lisibles** (image).

### Fiche 6.3 — SPILF, JNI 2024, « Allergie aux bêtalactamines : que prescrire en pratique ? » (Dr M.-C. Chopin-Alamartine, groupe recommandations SPILF)

- URL : https://infectiologie.com/UserFiles/File/jni/2024/com/jni2024-sg2-02-chopin.pdf — **consultée (contenu lu)** (PDF chiffré mais texte extractible ; tableaux de chaînes latérales en image).
- Extraits : fréquence : « 1,11% à 1,45% et 0.6% à 1,08% » (pénicillines / céphalosporines) ; « 95% des patients étiquetés « allergique » aux pénicillines sont testés négatifs » ; HSI grave aux pénicillines : « Contre-indication de toutes les pénicillines, et des céphalosporines avec une similitude de chaines avec l'antibiotique inculpé » ; « Toutes les autres bêtalactamines sont utilisables » ; HSI aux céphalosporines grave : « L'aztréonam est utilisable sauf si allergie à la ceftazidime et au cefidérocol » ; algorithme (d'après Wijnakker et al., CMI 2023) : réaction retardée grave → « CI de toutes les bêtalactamines » / « Avis d'expert en allergologie nécessaire » ; EAACI 2020 (Romano) : « Sont utilisables les carbapénèmes ou l'aztréonam (sauf si hypersensibilité au ceftazidime) sauf en cas d'anaphylaxie sévère ».
- Confiance : élevée (document de congrès, antérieur à ESCMID 2026).

### Fiche 6.4 — Recommandations françaises « SFA/SFAR/SPILF 2019 » et HAS

- Statut : **introuvable**. Aucune recommandation française conjointe 2019 sur l'allergie aux bêta-lactamines identifiée. Le Quotidien du Médecin (12/09/2024, https://www.lequotidiendumedecin.fr/actu-medicale/congres/allergies-aux-betalactamines-pas-de-loi-du-tout-ou-rien, lu partiellement, article abonnés) évoquait une mise à jour SPILF « en cours » — concrétisée par le diaporama 2026. Diaporama allergologique Lyon 2023 (C. Jaulent, https://allergolyon.fr/wp-content/uploads/2023/05/26.03.23-Beta-lactamines-C.JAULENT.pdf, lu partiellement) : fondé sur « Towards a more precise diagnosis of hypersensitivity to beta-lactams - an EAACI position paper. Romano et al, Allergy 2020 » ; cite « Toxidermies sévères : NET (Lyell / Stevens Johnson), DRESS ».
- Taux chiffrés de réactivité croisée (amoxicilline ↔ céfadroxil/céfalexine élevée ; ↔ céfazoline faible ; carbapénèmes ≈ 1 %) : **NON VÉRIFIÉS** ce jour (connaissances antérieures ; le tableau SPILF 2026 et celui de Wijnakker 2023 sont des images ; SPILF 2014 Info-antibio cité par la recherche : ≈ 2 % pénicilline→céphalosporine, non lu).

---

## 7. DIVERGENCES ENTRE SOURCES

| Sujet | Source A | Source B | Commentaire |
|---|---|---|---|
| Gentamicine, dose | ANSM 2011 : 3-8 mg/kg/j ; RCP Panpharma 2024 : 3-8 mg/kg/j | SPILF/SFPT/CA-SFM 2025 : 6-7 mg/kg DUJ | Le tableau 2025 ne retient que le haut de la fourchette (cibles PK/PD) |
| Amikacine, dose | RCP Stragen 2026 : 15 mg/kg/j (jusqu'à 30) ; ANSM 2011 : 15-30 | SPILF 2025 : 25-30 mg/kg DUJ | Idem |
| Aminosides et hémodialyse | RCP gentamicine : injection « 2 à 4 heures avant la séance » | Pratique « après séance » des autres antibiotiques (RCP céfépime, méropénème…) ; AMIDIAL-ICU (non lue) | Pas de texte ANSM 2011 sur la dialyse |
| Poids pour aminosides (obèse) | RCP amikacine : idéal + 40 % de l'excédent | RCP gentamicine : idéal + 0,43 × surcharge, Lorentz | Devine non cité par les RCP |
| Lorentz femme | RCP gentamicine : (T−150)/2 | Wikipédia FR : (T−105) − (T−150)/2,5 | Deux variantes circulent ; retenir le RCP |
| Vancomycine, dose de charge | RCP Viatris : 25-30 mg/kg ; SPILF 2025 : 20-30 mg/kg | Rybak 2020 : 20-35 mg/kg (max 3 g), obèse 20-25 ; CI : 15-20 mg/kg | |
| Vancomycine, entretien continu | SPILF 2025 : 20-40 mg/kg/j | Rybak 2020 : 30-40 mg/kg/j (jusqu'à 60) | |
| Vancomycine, cible intermittente | RCP : résiduelle 10-20 (15-20 si CMI ≥ 1) ; SPILF 2025 : résiduelle 15-20 + ASC 400-600 | Rybak 2020 : « Trough-only monitoring […] is no longer recommended » ; Abdul-Aziz : ASC ≥ 400 (sans borne haute) | |
| Vancomycine, 1er dosage | RCP : « le deuxième jour de traitement, immédiatement avant la dose suivante » | Rybak : « within the first 24 to 48 hours » ; continu : non précisé | |
| Cible « 20-30 mg/L » | Correspond à la **téicoplanine** (SPILF 2025) et à Abdul-Aziz (« ≥ 15–30 ») | Vancomycine continue : 20-25 mg/L (SPILF 2025, Rybak, Abdul-Aziz) | |
| Linézolide, résiduelle | Abdul-Aziz 2020 : 2-7 mg/L | « 2-8 mg/L » (connaissance antérieure, NON VÉRIFIÉ) | |
| Bêta-lactamines, cible | SFPT/SFAR 2018 : libre 4-8 × CMI 100 % du temps | Abdul-Aziz 2020 : 100 % fT > CMI, « 2–5 × MIC » | |
| Estimation du DFG pour les doses | HAS 2023 : CKD-EPI, « Ne plus utiliser la formule de Cockcroft-Gault », désindexer (Du Bois) | RCP (céfépime, vancomycine) : Cockcroft ; tous les RCP lus expriment les seuils en « clairance de la créatinine » (amoxicilline Panpharma : « DFG ») | Point à expliciter dans l'application |
| Daptomycine, dose | RCP : 4-6 mg/kg (pas de 8-10) | SPILF 2025 : 8-12 mg/kg DUJ (lecture de tableau, confiance moyenne) | Hors AMM |
| Daptomycine, arrêt | RCP : CPK > 5 × LSN avec symptômes | « > 10 × LSN sans symptôme » : NON VÉRIFIÉ | |
| Triméthoprime/cotrimoxazole, grossesse | CRAT 2025 : préférer un autre ATB < 10 SA, acide folique 5 mg/j « par analogie » ; > 10 SA utilisable | Charlier 2026 : « CI T1 et ajouter acide folique » ; sulfamide « déconseillé à terme » | CRAT plus nuancé que le diaporama ; ictère à terme non lu au CRAT |
| Fluoroquinolones, allaitement | CRAT (ciprofloxacine 6631) : acceptable | Charlier 2026 : « NON », reprise 48 h après arrêt | |
| Tétracyclines, grossesse | CRAT : doxycycline possible au 1er trimestre, préférer autre ATB ensuite | Charlier 2026 : « NON » (toute la grossesse) | |
| Céfazoline, grossesse | CRAT : « possible, en particulier au-delà du 1er trimestre » | Charlier : bêta-lactamines « OUI TOUJOURS » | |
| Allergie, HSR grave | JNI 2024 (Wijnakker) : CI de toutes les bêta-lactamines | SPILF 2026 : « Réaction allergique grave → Contre-indication aux Bêta-lactamines » (sans distinguer HSI/HSR) ; ESCMID texte non lu | |

---

## 8. TABLEAU (a) — Posologies et adaptation rénale par DCI (adulte)

Abréviations : ClCr = clairance de la créatinine (mL/min) telle qu'exprimée dans le RCP ; HD = hémodialyse intermittente ; DUJ = dose unique journalière ; conf. = confiance.

| DCI | Dose adulte usuelle | Seuils ClCr et doses adaptées | Hémodialyse | Surveillance | Source + repère | Conf. |
|---|---|---|---|---|---|---|
| Cloxacilline IV | 8-12 g/j en 4-6 adm., perf. 60 min (RCP) ; 100-200 mg/kg/j en 6 adm. ou continue après charge 2 g (SPILF 2025) | > 30 : inchangé ; < 30 : moitié de la dose journalière ; IR + insuffisance hépatique : moitié | Non traitée dans le RCP | K+, fonction rénale (forte dose), encéphalopathie | RCP Cloxacilline Panpharma 1 g §4.2/4.4 ; SPILF 2025 p. 162 | élevée |
| Céfazoline | 1-2 g/j (3-4 g si moins sensible, jusqu'à 6 g/j) (RCP) ; 80-100 mg/kg/j en 3 adm. ou continue après charge 2 g (SPILF 2025) | ≥ 55 : normal ; 35-54 : normal, ≥ 8 h ; 11-34 : ½ dose /12 h ; ≤ 10 : ¼ dose /18-24 h | « dépendra des conditions de dialyse » (pas de chiffre) | Encéphalopathie (IR/surdosage) | RCP Céfazoline Panpharma 2 g §4.2 tableau ; SPILF 2025 p. 162 | élevée |
| Céfotaxime | 3 g/j (jusqu'à 12 g) ; méningite 200-300 mg/kg/j (RCP) ; 1 g/8 h std, 2 g/8 h forte (SPILF 2025, conf. moyenne) | < 10 : dose initiale normale puis entretien ½, intervalle inchangé (pas d'autre palier) | 1-2 g/j, « après la séance de dialyse » | Encéphalopathie | RCP Céfotaxime Panpharma 2 g §4.2/4.4 | élevée (RCP) |
| Ceftriaxone | 1-2 g/j ; 2-4 g/j méningite/endocardite (RCP) ; 1-2 g/24 h std, 2 g/12 h forte (SPILF 2025) | Pas de réduction ; < 10 : max 2 g/j ; insuffisance hépatique sévère : pas de données | Pas de supplément (non dialysable) | Calcium, précipités biliaires, encéphalopathie (âgé + IR) | RCP Rocéphine §4.2/4.4 | élevée |
| Amoxicilline IV | 750 mg-2 g/8 h ou 2 g/12 h, max 12 g/j ; méningite/endocardite 1-2 g/4-6 h max 12 g/j (RCP) ; 50-100 mg/kg/j std, 100-200 mg/kg/j forte (SPILF 2025) | DFG > 30 : inchangé ; 10-30 : 1 g puis 500 mg-1 g ×2/j ; < 10 : 1 g puis 500 mg/j | 1 g en fin de dialyse puis 500 mg/24 h | Cristallurie (hydratation), convulsions (IR/forte dose) | RCP Amoxicilline Panpharma 1 g §4.2 tableau | élevée |
| Amoxicilline-clavulanate IV | 1 g/200 mg /8 h (RCP) ; 1 g+0,2 g /8-6 h std, 2 g+0,2 g /8 h forte, max 1,2 g clavulanate/j (SPILF 2025) | > 30 : inchangé ; 10-30 : 1 g/200 mg puis 500/100 mg ×2/j ; < 10 : 1 g/200 mg puis 500/100 mg /24 h | Schéma < 10 + 500/100 mg en fin de dialyse | Fonction hépatique (prudence, « surveiller régulièrement » si IH), convulsions, cristallurie | RCP Amox/clav Sandoz 1 g/200 mg §4.2/4.4 ; SPILF 2025 p. 160 | élevée |
| Pipéracilline-tazobactam | 4 g/0,5 g /8 h (/6 h pneumonie nosocomiale, neutropénie), perf. 30 min (RCP) ; /6 h ou prolongée /8 h en 4 h ou continue 8 g/j (std), prolongée /6 h en 3 h ou continue 12 g/j (forte) (SPILF 2025) | > 40 : inchangé ; 20-40 : max 4 g/0,5 g /8 h ; < 20 : max 4 g/0,5 g /12 h | + 2 g/0,25 g après chaque séance | NFS périodique, K+, convulsions ; IRA accrue avec vancomycine | RCP Tazocilline §4.2/4.4 ; SPILF 2025 p. 161 | élevée |
| Méropénème | 0,5-1 g /8 h ; 2 g /8 h méningite/mucoviscidose, perf. 15-30 min ou bolus ≤ 1 g/5 min (RCP) ; 1 g/8 h std, 2 g/8 h en 3-8 h forte (SPILF 2025) | < 51 : 26-50 : dose /12 h ; 10-25 : ½ dose /12 h ; < 10 : ½ dose /24 h | « après la fin de la séance d'hémodialyse » | Convulsions (peu fréquentes), fonction hépatique | RCP Meropenem Kalceks §4.2 tab. 1-2 ; SPILF 2025 p. 167 | élevée |
| Imipénème-cilastatine | 500 mg/6 h ou 1 g/8 h ou 1 g/6 h ; max 4 g/j (RCP) ; idem SPILF 2025 ; pas de perfusion prolongée/continue (stabilité) | Tableau par dose totale : 60-89 : 400/6 h – 500/6 h – 750/8 h ; 30-59 : 300/6 h – 500/8 h – 500/6 h ; 15-29 : 200/6 h – 500/12 h – 500/12 h ; < 15 : ne pas administrer sauf HD dans les 48 h | Schéma 15-29, dose après séance puis /12 h | Neurologique (myoclonies, confusion, convulsions) : « respect strict des schémas posologiques » | RCP Imipénème Panpharma §4.2 tab. 1 ; §4.4 ; SPILF 2025 p. 166-167 | élevée |
| Témocilline | 4 g/j en 2 adm. (std) ; 6 g/j en 3 adm. ou continue après charge 2 g (RCP) ; 2 g/12 h std (IU sans gravité), 2 g/8 h ou 6 g/j continue forte (SPILF 2025, conf. moyenne) | > 60 : 2 g/12 h ; 30-60 : 1 g/12 h ; 10-30 : 1 g/24 h ; < 10 : non précisé | 1 g/24 h « de préférence à la fin de l'hémodialyse » (ou 2 g/48 h, 3 g/72 h) | Électrolytes (K+) périodiques, convulsions si surdosage | RCP Negaban §4.2/4.4 | élevée |
| Céfépime | 1 g ×2/j à 2 g ×3/j (RCP) ; 1 g/8 h std, 2 g/8 h forte (SPILF 2025) + STP si Pseudomonas/Acinetobacter | Adapter si ClCr ≤ 50 (Cockcroft) : paliers 50-30, 29-11, ≤ 10 (ex. 1 g ×2 → 1 g ×1 → 500 mg ×1) | Charge 1 g puis 500 mg/j ; dose « après la séance de dialyse » ; DPCA : doses usuelles /48 h | Encéphalopathie (surdosage/IR/âgé) ; fonction rénale si néphrotoxiques associés | RCP Céfépime Stragen 1 g §4.2 tableau ; §4.4 ; DHPC ANSM 2018 (non lue) | élevée |
| Aztréonam | 2-3 g/j à 6-8 g/j, max 8 g/j (RCP) ; forte 2 g/6 h en 3 h ou 6 g/j continue (SPILF 2025, conf. moyenne) | ≥ 30 : normal ; 10-30 : ½ ; < 10 : ¼ (après charge 1-2 g) | 1/8 de dose après chaque séance | Rénale si aminoside ; réactions allergiques (pas de mention ceftazidime dans RCP) | RCP Azactam §4.2/4.4 | élevée |
| Daptomycine | 4 mg/kg/24 h (IcPTM) ; 6 mg/kg/24 h (bactériémie SA, endocardite droite) (RCP) ; 8-12 mg/kg DUJ hors AMM (SPILF 2025, conf. moyenne) | < 30 : même dose /48 h | Même schéma /48 h, « après la fin de la dialyse » | CPK à l'initiation puis « au moins une fois par semaine » ; « tous les 2-3 jours » 2 premières semaines si ClCr < 80, statines/fibrates/ciclosporine ; arrêt si symptômes + CPK > 5 N ; pneumonie à éosinophiles | RCP Daptomycine Medac §4.2/4.4 ; SPILF 2025 p. 172 | élevée (RCP) |
| Linézolide | 600 mg ×2/j IV (30-120 min) ou PO ; max 28 jours | Pas d'adaptation (prudence < 30) ; IH : pas d'ajustement | « après dialyse » | NFS « une fois par semaine » ; fonction visuelle si > 28 j ; acidose lactique ; sérotoninergique | RCP Linézolide Panpharma §4.2/4.4 ; SPILF 2025 p. 171 | élevée |
| Rifampicine IV | 10 mg/kg/j (TB) ; 20-30 mg/kg/j en 2 perf. (infections graves) | IR 60-30 : rifampicinémie J2-J3 ; < 30 : espacer ; IH : réduire (ex. 5 mg/kg/j ≤ 900 mg), rifampicinémie | Non traitée | Bilan hépatique J8, fin M1, puis /2 mois ; /2-4 sem si hépatopathie ; induction (max ≈ 15 j, persiste 1-2 sem) ; AVK pendant + 8 j ; contraception mécanique | RCP Rifadine IV §4.2/4.4/4.5 | élevée |
| Gentamicine | 3-8 mg/kg/j DUJ perf. 30 min, ≤ 5 j (ANSM 2011, RCP) ; 6-7 mg/kg DUJ (SPILF 2025) ; obèse : poids idéal (Lorentz) + 0,43 × surcharge | 1re dose inchangée ; réinjection quand résiduelle < seuil ; sans dosage : 90-60 : 24 h ; 60-40 : 36 h ; 40-20 : 48 h ; < 20 : dosage impératif | « 2 à 4 heures avant la séance de dialyse » | Pic, résiduelle (cf. tableau b) ; fonction rénale ; audition (pas de fréquence) | ANSM 2011 p. 5-8 ; RCP Gentamicine Panpharma §4.2/4.4 ; SPILF 2025 p. 169 | élevée |
| Amikacine | 15 mg/kg/j (jusqu'à 30) (RCP) ; 15-30 (ANSM 2011) ; 25-30 mg/kg DUJ (SPILF 2025) ; obèse : idéal + 40 % excédent ; max 1,5 g/j | < 50 : DUJ, dosages, cures courtes ; si ClCr inconnue : intervalle (h) = 9 × créat (mg/100 mL) ; tableau en image | Pas de dose post-séance chiffrée | Rénale « surveillée régulièrement », audiogrammes « si possible » | RCP Amikacine Stragen §4.2/4.4 ; ANSM 2011 ; SPILF 2025 | élevée/moyenne |
| Ciprofloxacine IV | 400 mg ×2-3/j ; perf. 30 min (200 mg) / 60 min (400 mg) | 30-60 : 200-400 mg /12 h ; < 30 : 200-400 mg /24 h | « après la dialyse » | Tendinopathie (âge, IR, greffe, corticoïdes ; dès 48 h, jusqu'à mois après), QT (âgés, femmes), convulsions, glycémie | RCP Ciflox IV §4.2/4.4 | élevée |
| Lévofloxacine IV | 500 mg ×1-2/j ; perf. ≥ 30 min (250) / 60 min (500) | 50-20 : dose initiale puis entretien réduit (125 mg/24 h, 250/24 h, 250/12 h selon schéma) ; 19-10 : 125/48 h, 125/24 h, 125/12 h ; < 10 (HD/DPCA) : idem | Tableau < 10 inclut HD | Tendinopathie, QT, épilepsie (CI), dysglycémie, anévrisme aortique | RCP Lévofloxacine Arrow perfusion §4.2/4.4 (+ Lévofloxacine SUN cp, conf. moyenne) | moyenne |
| Cotrimoxazole IV | 2 ampoules /12 h (3 si sévère) | > 30 : normal ; 15-30 : ½ dose en 1 perf./j ; < 15 hors dialyse : ne pas utiliser | ½ dose après dialyse ; sulfaméthoxazolémie /3 j | NFS « périodique », K+ et créatinine « étroite » (fréquence non chiffrée), hydratation ≥ 2 L/j | RCP Bactrim inj. §4.2/4.4 | élevée |
| Fosfomycine IV | 12-24 g/j en 2-3 doses (≤ 8 g/dose) (RCP Fosfocine, **abrogé 24/02/2023**) ; 4 g /8-6 h (SPILF 2025, conf. moyenne) | 40-80 : inchangé ; 40 : 70 % ; 30 : 60 % ; 20 : 40 % ; 10 : 20 % ; charge +100 % (≤ 8 g) | 2 g à la fin de chaque séance | Na+ (14,4 mmol/g), K+ « régulièrement », insuffisance cardiaque | RCP Fosfocine §4.2 tab. 2 /4.4 — autres spécialités IV non lues | moyenne |
| Vancomycine | 15-20 mg/kg /8-12 h (≤ 2 g/dose), charge 25-30 mg/kg (RCP) ; charge 20-30 mg/kg puis 20-40 mg/kg/j discontinu ou continu (SPILF 2025) ; Rybak : 20-35 mg/kg (≤ 3 g) puis 15-20 mg/kg/8-12 h ; CI 15-20 mg/kg puis 30-40 mg/kg/j | Léger/modéré : dose initiale inchangée ; 20-49 : 15-20 mg/kg /24 h ; < 20 : selon résiduelles ; prolonger l'intervalle | Peu dialysable (RCP) ; Rybak : pré-dialyse 15-20 mg/L, dose après ou intra-dialyse, dosage ≥ 1/sem ; CRRT : charge 20-25 mg/kg, 7,5-10 mg/kg/12 h | Taux sanguins « régulier », fonction rénale/audition (RCP, sans fréquence) ; Rybak : hebdo si stable, quotidien si instable | RCP Vancomycine Viatris §4.2/4.4/4.5 ; SPILF 2025 p. 169 ; Rybak 2020 Rec. 1-4, 10, 14-16 | élevée |

---

## 9. TABLEAU (b) — Suivi thérapeutique pharmacologique (STP)

| Molécule | Paramètre | Indication du dosage | 1er prélèvement : quand / position | Répétition | Cible + unité | Conduite | Source + repère | Conf. |
|---|---|---|---|---|---|---|---|---|
| Gentamicine / tobramycine / nétilmicine | Pic (Cmax) | « après la 1re injection chez tous les patients sévères » (choc, brûlés, neutropénie fébrile, VM, obésité morbide, polytraumatisé, mucoviscidose) ; pas systématique si traitement ≤ 3 j sans PK modifiée | Après la 1re dose ; « 30 minutes après la fin de la perfusion » (perf. de 30 min) | Non précisé (après modification de dose) | 30-40 mg/L | Si < cible : « augmentation de la posologie de l'injection suivante » | ANSM 2011 p. 8, Tableau 1 ; RCP gentamicine §4.2 | élevée |
| Gentamicine / tobramycine / nétilmicine | Résiduelle (Cmin) | « uniquement si la durée de traitement est > 5 jours […] ou en cas d'insuffisance rénale » | « après 48 heures de traitement » ; position vs dose : ANSM muet ; Abdul-Aziz : « 30 min or just before the next dosing » ; en IR sans EER : pas de réinjection tant que Cmin > seuil (RCP) | « 2 fois par semaine » + fonction rénale | < 0,5 mg/L | « espacer les injections » (pas de réduction de la dose unitaire : RCP « réinjections à la même dose ») | ANSM 2011 p. 8 ; RCP gentamicine §4.2 ; Abdul-Aziz Table 4 | élevée |
| Amikacine | Pic | Idem gentamicine | Après 1re dose, 30 min après fin de perfusion | Idem | 60-80 mg/L | Idem | ANSM 2011 Tableau 1 ; RCP amikacine Stragen §4.2 | élevée |
| Amikacine | Résiduelle | > 5 j ou IR (« fortement recommandé » en IR, RCP) | Après 48 h ; moment non précisé par le RCP | 2×/semaine | < 2,5 mg/L | Espacer ; en EER continue : réinjecter quand < seuil (RCP Viatris, non lu en détail) | ANSM 2011 ; RCP Stragen | élevée |
| Vancomycine (intermittent) | Résiduelle ± ASC | Tous traitements (RCP : « contrôle régulier » si forte dose/prolongé) ; Rybak : infections graves à SARM | RCP : « le deuxième jour de traitement, immédiatement avant la dose suivante » ; Rybak : exposition cible « within the first 24 to 48 hours », 2 prélèvements (1-2 h post-perfusion + fin d'intervalle) ou 1 creux en bayésien | Rybak : hebdomadaire si stable, quotidien si instable/néphrotoxiques | RCP : 10-20 mg/L (15-20 si CMI ≥ 1) ; SPILF 2025 : résiduelle 15-20 mg/L et ASC 400-600 mg·h/L (CMI ≤ 1) ; Rybak : ASC/CMI 400-600, creux seul « no longer recommended » | Adapter dose/intervalle ; prolonger l'intervalle en IR | RCP Viatris §4.2 ; SPILF 2025 p. 169 ; Rybak Rec. 1-4 | élevée |
| Vancomycine (continu) | Plateau (Css) | Idem | Non précisé par SPILF/Rybak (Abdul-Aziz : à tout moment à l'équilibre ; étude Saint-Étienne 2010 non lue : H24) | Idem | 20-25 mg/L (SPILF 2025, Rybak, Abdul-Aziz) ; ASC 400-600 = Css × 24 | Ajuster le débit | SPILF 2025 p. 169 ; Rybak Rec. 10 ; Abdul-Aziz Table 4 | élevée |
| Vancomycine (HD) | Pré-dialyse | Patients hémodialysés | Avant la séance ; jamais pendant ni dans les 2 h après | « not less than weekly » | 15-20 mg/L | Dose 7,5-15 mg/kg post/intra-dialyse | Rybak Rec. 14, Table 2 | élevée |
| Vancomycine (CRRT) | Concentration | CRRT | « within the first 24 hours » | — | ASC 400-600 | Charge 20-25 mg/kg ; 7,5-10 mg/kg /12 h | Rybak Rec. 16 | élevée |
| Téicoplanine | Résiduelle | STP « doit guider l'adaptation » | Non précisé | — | 20-30 mg/L (SPILF 2025) ; ≥ 15-30 (Abdul-Aziz) | — | SPILF 2025 p. 169 ; Abdul-Aziz Table 4 | élevée |
| Bêta-lactamines (réanimation) | Résiduelle (discontinu) / plateau (continu) ; concentration libre | Patients de soins critiques « avec variabilité PK attendue » et/ou suspicion de toxicité ; EER ; aussi applicable neutropénie profonde, IOA, endocardite (Info-antibio) | « 24 to 48 h after the onset of treatment » ; résiduelle juste avant la dose (Abdul-Aziz : « 30 min or just before ») ; plateau à tout moment ; LCS simultané si méningite | « after any change in dosage » ou changement clinique important | Libre 4-8 × CMI pendant 100 % du temps ; ne pas dépasser 8 × CMI | Sous-dosage : augmenter dose/durée de perfusion ; surdosage : réduire (continu), suspendre, EER si IRA | SFPT/SFAR 2018 R2.2-R2.3, R4.1-R4.5, R4.9 ; Info-antibio 2018 | élevée |
| Céfépime | Concentration | Pseudomonas/Acinetobacter à forte posologie « nécessite un suivi thérapeutique pharmacologique » ; symptômes neurologiques (DHPC 2018, non lue) | Idem bêta-lactamines | — | Non chiffrée dans les sources lues (NON VÉRIFIÉ) | Réduire/suspendre si neurotoxicité | SPILF 2025 p. 163 ; SFPT/SFAR 2018 | moyenne |
| Linézolide | Résiduelle | « peut être utile pour évaluer la toxicité hématologique » (SPILF 2025) ; routine en réanimation (Abdul-Aziz) | « 48 h post-initiation of therapy », juste avant la dose | — | 2-7 mg/L (Abdul-Aziz) | — | SPILF 2025 p. 171 ; Abdul-Aziz Table 4 | élevée |
| Daptomycine | Résiduelle (et CPK) | TDM « neither recommends nor discourages » ; CPK obligatoire (RCP) | Cmin « 72 h post-initiation » ; CPK à l'initiation puis ≥ 1×/semaine (2-3 j si à risque) | CPK hebdomadaire | Cmin < 24 mg/L ; CPK < 5 N (symptomatique) | Arrêt si symptômes musculaires + CPK > 5 N | Abdul-Aziz Table 4 ; RCP Daptomycine Medac §4.4 | élevée |
| Rifampicine | Rifampicinémie | Insuffisance hépatique ; IR 60-30 mL/min | « au 2ème ou 3ème jour du traitement » | — | Non chiffrée (RCP) | Réduire la dose | RCP Rifadine IV §4.2 | élevée |
| Cotrimoxazole (HD) | Sulfaméthoxazolémie | Hémodialysés | — | « tous les trois jours » | Non chiffrée (RCP) | — | RCP Bactrim inj. §4.2 | élevée |

---

## 10. LACUNES ET POINTS NON VÉRIFIÉS (à réserver dans l'application)

1. Position exacte de la résiduelle d'aminoside par rapport à la dose suivante (« juste avant » vs « 24 h après ») : non explicitée par l'ANSM 2011 ni par les RCP ; seule source lue : Abdul-Aziz 2020 (« 30 min or just before the next dosing »).
2. Fréquence chiffrée de la créatininémie sous vancomycine/aminosides (« 2-3 fois/semaine ») : **NON VÉRIFIÉE** (aucune source lue ne la chiffre ; ANSM 2011 : résiduelle « 2 fois par semaine » avec « surveillance de la fonction rénale »).
3. Moment du 1er dosage de vancomycine en perfusion continue (H24) : non chiffré dans SPILF 2025 ni Rybak 2020.
4. Version de CKD-EPI (2009 vs 2021) recommandée par HAS/SFNDT : non précisée dans la fiche HAS lue ; position SFNDT introuvable.
5. Formule de Cockcroft en µmol/L (k = 1,23/1,04), CKD-EPI 2009, Devine en pouces, poids ajusté « IBW + 0,4 × (poids − IBW) » générique : **NON VÉRIFIÉS** (seules les versions RCP — 40 % / 0,43 — sont lues).
6. Taux de réactivité croisée pénicillines/céphalosporines par chaîne latérale et carbapénèmes (≈ 1 %) : **NON VÉRIFIÉS** (tableaux en image dans SPILF 2026 et JNI 2024 ; texte ESCMID 2026 inaccessible).
7. Recommandation SFPT/SFAR 2018 : seule la version PMC anglaise (première moitié) a été lue ; le tableau des concentrations cibles par molécule (Tableau 2) n'a pas été lu.
8. Fosfomycine IV : RCP lu = spécialité abrogée ; RCP Fosfomycine Panpharma 4 g / Fomicyt non lus.
9. Daptomycine 8-12 mg/kg : lecture de tableau PDF (SPILF 2025) à confirmer sur le PDF visuel ; aucune recommandation française d'endocardite/IOA lue.
10. CRAT : fiches « Cotrimoxazole – Grossesse » (ictère à terme), « Méropénème », « Linézolide » non atteintes/introuvables.
11. HAS 2011 (rapport DFG) : non lu dans la source primaire (page de connexion) ; contenu rapporté par sources secondaires seulement.
12. Stabilité des bêta-lactamines en perfusion continue (SPILF 2024-2025, DOI 10.1016/j.mmifmc.2024.12.005) : texte non retrouvé.

---

## 11. LISTE DES URL CONSULTÉES (statut)

- https://ansm.sante.fr/uploads/2021/02/04/map-aminosides.pdf — lue (PDF → texte)
- https://base-donnees-publique.medicaments.gouv.fr/medicament/68868512/extrait (gentamicine) — lue
- https://base-donnees-publique.medicaments.gouv.fr/medicament/63899393/extrait (amikacine Stragen) — lue
- https://base-donnees-publique.medicaments.gouv.fr/medicament/60033510/extrait (vancomycine Viatris) — lue
- https://academic.oup.com/ajhp/article/77/11/835/5810200 (Rybak 2020) — lue (0-200 k caractères)
- https://pmc.ncbi.nlm.nih.gov/articles/PMC7223855 (Abdul-Aziz 2020) — lue (première moitié)
- https://pmc.ncbi.nlm.nih.gov/articles/PMC6441232/ (SFPT/SFAR 2018) — lue (première moitié) ; PDF SFAR — 403
- https://www.infectiologie.com/UserFiles/File/spilf/atb/info-antibio/info-antibio-2018-10-bl-soins-critiques.pdf — lue
- https://www.infectiologie.com/UserFiles/File/spilf/recos/doses-spilf-sfpt-casfm-2025.pdf — lue (PDF → texte)
- RCP BDPM lus : 68429134 (cloxacilline), 60461151 (céfazoline), 65424833 (céfotaxime), 61476925 (ceftriaxone), 66918105 (amoxicilline), 62096413 (amox/clav), 60445784 (pip/tazo), 69700834 (méropénème), 65336568 (imipénème), 62424059 (témocilline), 62202966 (céfépime), 63918096 (aztréonam), 66921973 (daptomycine), 67910613 (linézolide), 63096551 (rifampicine), 65126598 (ciprofloxacine), 67660704 (lévofloxacine), 69233327 (cotrimoxazole), 68027363 (fosfocine)
- https://has-sante.fr/upload/docs/application/pdf/2021-09/fiche__mrc.pdf — lue ; https://www.has-sante.fr/jcms/p_3288950/… — lue (page) ; p_3289324 — non restituée ; c_1064297 — page de connexion ; texte_court_dfg_creatininemie.pdf — lu (contenu = rapport albuminurie)
- https://www.vidal.fr/actualites/29881-… et 29888-… — lues ; https://www.larevuedupraticien.fr/article/debit-de-filtration-glomerulaire-quelle-formule-utiliser — lue
- https://www.kidney.org/professionals/kdoqi/gfr_calculator/formula — lue ; Wikipédia EN Body surface area, Human body weight — lues ; Wikipédia FR Clairance de la créatinine, Poids idéal — lues
- https://www.vidal.fr/gpr/guide-prescription-rein-a-propos.html — lue ; https://sitegpr.com/ — page casino ; /fr/ — 404
- CRAT : 13385, 13360, 7720, 13399, 6661, 6669, 6671, 13144, 13364 — lues ; 6654/6655, 7713/7721/7706, 6631, 13283, 8385 — résultats de recherche seulement ; lecrat.fr/ et /medicament-grossesse/ — lues (navigation) ; spip.php?…id_article=364 — 404
- https://www.infectiologie.com/UserFiles/File/formation/desc/2026/seminaire-desc-mars-2026/lundi-23-t.-21/conf-1-antibiotiques-et-grossesse-c-charlier.pdf — lue
- https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:41707748… (ESCMID 2026, résumé) — lu ; texte intégral CMI — 403 ; PubMed — page cookie
- https://www.infectiologie.com/fr/actualites/allergie-aux-antibiotiques_-n.html — lue ; …/allergie-atb-escmid-spilf-2026-groupe-reco.pptx — lue (texte des diapos)
- https://infectiologie.com/UserFiles/File/jni/2024/com/jni2024-sg2-02-chopin.pdf — lue ; https://allergolyon.fr/wp-content/uploads/2023/05/26.03.23-Beta-lactamines-C.JAULENT.pdf — lue partiellement (grep) ; https://www.larevuedupraticien.fr/article/allergie-presumee-aux-antibiotiques-que-faire — lue ; Le Quotidien du Médecin 12/09/2024 — extrait (abonnés)
