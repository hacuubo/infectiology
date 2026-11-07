# Recherche documentaire — Pneumonies de l'adulte (communautaires, d'inhalation, légionellose, associées aux soins)

Date de consultation de toutes les sources : **2026-11-06**.
Méthode : WebSearch + WebFetch ; PDF et diaporamas (.pptx) téléchargés dans un dossier dédié puis texte extrait (pypdf ; XML des diapositives). Le PDF français SPILF/SPLF 2025 a une police mal encodée (accents remplacés par des codes) : les accents ont été rétablis mécaniquement (é, è, à, ê, ç…) sans autre modification. Textes nord-américains et européens en accès libre lus via Europe PMC (texte intégral XML) ou pages officielles. RCP lus sur la base de données publique des médicaments (BDPM, ANSM). Chaque extrait cité a été **effectivement lu**, sauf mention « NON VÉRIFIÉ » ou « non lisible ».

Convention des statuts d'accès :
- **consultee** : texte intégral ou partie pertinente lue.
- **contenu_non_lisible** : URL atteinte, contenu non exploitable (403, page vide, résumé secondaire seulement).
- **introuvable** : document recherché sans succès.

Les sources sont citées par leur identifiant de registre (nouveaux identifiants : `docs/sources/registre-pneumonies.json` ; identifiants existants réutilisés : `HAS-2024-synthese-antibiotherapie`, `ANSM-2023-fluoroquinolones`, `RCP-levofloxacine`, `CRAT-fluoroquinolones-grossesse`).

---

## 0. Panorama des textes en vigueur (ce qui remplace quoi)

| Corpus | Texte en vigueur au 2026-11-06 | Remplace / statut |
|---|---|---|
| PAC de l'adulte (France) | **SPILF/SPLF 2025** « Actualisation des recommandations de prise en charge des PAC chez l'adulte », Dinh A et al., Méd Mal Infect Form 2025 (doi 10.1016/j.mmifmc.2025.01.065) ; version anglaise Infect Dis Now 2025;55:105034 ; diaporama SPILF du 12/03/2025 — `SPILF-SPLF-2025-PAC`, `SPILF-2025-PAC-diapo` | Remplace AFSSAPS/SPILF/SPLF juillet 2010 (`AFSSAPS-2010-IRB`) **sauf** l'algorithme d'orientation et les scores de gravité, non revus : le texte 2025 renvoie explicitement à 2010 pour ces points |
| PAC ambulatoire (HAS) | **HAS/SPILF/GPIP « Choix et durées d'antibiothérapies : PAC de l'adulte en ambulatoire »**, validée 19/12/2024, mise en ligne 09/01/2025, mise à jour 13/05/2025 — `HAS-2025-PAC-adulte-ambulatoire` ; ligne PAC adulte « [2024] » de la synthèse `HAS-2024-synthese-antibiotherapie` | Aucune fiche « 2021 » spécifique PAC adulte trouvée : la série 2021 ne contenait pas cette fiche, ajoutée au 2e volet (2024) |
| Pneumonie à *M. pneumoniae* ambulatoire | HAS « Réponse rapide » validée 21/12/2023 — `HAS-2023-mycoplasma` | En vigueur (référencée sur la page SPILF « 2024 ») |
| Pneumonie d'inhalation | **SPILF/SFGG 2025** (article Infect Dis Now 2025, PII S2666991925000600, non lisible 403) ; diaporama SPILF du 08/01/2025 lu — `SPILF-SFGG-2025-inhalation-diapo` | Nouveau ; exclue du champ de SPILF/SPLF 2025 PAC |
| Légionellose (traitement) | **Diaporama « Traitement antibiotique de la légionellose chez l'adulte – Actualisation », groupe recommandations SPILF, 2026** — `SPILF-2026-legionellose-diapo` | Remplace le diaporama AFSSAPS 2012 (encore listé sur la page SPILF) ; article publié correspondant non trouvé |
| Fluoroquinolones | ANSM 02/08/2023 « rappel des restrictions d'utilisation » — `ANSM-2023-fluoroquinolones` | En vigueur |
| Pneumonies associées aux soins de réanimation (PAVM, pneumonie sévère acquise à l'hôpital) | **RFE SFAR/SRLF « Pneumonies associées aux soins de réanimation »**, validée CA SRLF 08/06/2017 et SFAR 29/06/2017 (publication Anaesth Crit Care Pain Med 2018 – non vérifiée) — `SFAR-SRLF-2017-PAS-rea` | **Aucune actualisation 2024-2026 trouvée** (recherches SFAR/SRLF ; une rumeur de RFE 2025 signalée dans `recherche-gravite-terrain-gouvernance.md` reste NON VÉRIFIÉE). Statut : en vigueur, ancienne |
| Pneumonie nosocomiale **hors réanimation** | **Aucun texte français trouvé** (SFAR/SRLF limité à la réanimation) | Recoupement : ERS 2017, IDSA/ATS 2016 |
| PAC grave (Europe) | **ERS/ESICM/ESCMID/ALAT 2023** (Martin-Loeches I et al., Intensive Care Med 2023 / Eur Respir J 2023) — `ERS-ESICM-ESCMID-ALAT-2023-PACgrave` | En vigueur |
| HAP/VAP (Europe) | **ERS/ESICM/ESCMID/ALAT 2017** (Torres A et al., Eur Respir J 2017;50:1700582) — `ERS-ESICM-ESCMID-ALAT-2017-HAP-VAP` | En vigueur (aucune actualisation trouvée) |
| CAP (États-Unis) | ATS/IDSA 2019 (Metlay JP et al., AJRCCM 2019;200:e45-e67) — `ATS-IDSA-2019-PAC` ; **mise à jour ATS 2025** (AJRCCM, publiée en ligne le 18/07/2025, doi 10.1164/rccm.202507-1692ST), **non endossée par l'IDSA** — `ATS-2025-PAC` (non lisible) | 2019 partiellement remplacée (durée, corticoïdes, échographie) par ATS 2025 côté ATS seulement → `incertain` |
| HAP/VAP (États-Unis) | IDSA/ATS 2016 (Kalil AC et al., Clin Infect Dis 2016;63:e61-e111) — `IDSA-ATS-2016-HAP-VAP`, page IDSA marquée « CURRENT » | En vigueur |
| Corticoïdes (recoupement) | SCCM 2024 Focused Update (Chaudhuri D et al., Crit Care Med 2024;52:e219-e233) — `SCCM-2024-corticoides` (résumé lu) | — |

Points de vigilance de vigueur :
- La page SPILF « recommandations » (consultée 2026-11-06) n'affiche **aucun** texte « pneumonie » en cours de révision ; aucune entrée PAVM n'y figure.
- SPILF/SPLF 2025 ne traite pas : infections virales sans surinfection, pneumonies d'inhalation, dilatation des bronches/mucoviscidose, prévention ; et **ne fait pas de recommandation spécifique aux soins critiques** (diapo 3).
- Le texte publié est une version « ARTICLE IN PRESS » datée du 1er avril 2025 (MMIF) ; la version anglaise (IDN 55:105034) est la version paginée. Des **écarts existent entre le tableau 10 français, le tableau 10 anglais et la diapo 15** (cf. §11).

---

## 1. `SPILF-SPLF-2025-PAC` — SPILF/SPLF 2025, texte publié

- **Organisme** : SPILF et SPLF, avec SRLF, SFM, SFR, SFMU et des représentants de la médecine générale.
- **Titre exact** : « Actualisation des recommandations de prise en charge des pneumonies aiguës communautaires chez l'adulte par la Société de Pathologie Infectieuse de Langue Française (SPILF) et la Société de Pneumologie de Langue Française (SPLF). Avec le soutien de la SRLF, de la SFM, de la SFR et de la SFMU ». Dinh A, Barbier F, Bedos JP et al.
- **Année / version** : 2025. MMIF (doi 10.1016/j.mmifmc.2025.01.065, « ARTICLE IN PRESS », avril 2025) ; anglais : Infect Dis Now 2025;55:105034 (doi 10.1016/j.idnow.2025.105034). Grades A/B/C × force 1/2/3, ou avis d'expert (tableau 4).
- **URL** : https://www.infectiologie.com/UserFiles/File/spilf/recos/mmif-reco-pac.pdf (FR) ; https://www.infectiologie.com/UserFiles/File/spilf/recos/idn-reco-pac.pdf (EN).
- **Statut d'accès** : consultee (les deux PDF extraits). **Vigueur** : en_vigueur.

### Extraits (page du PDF français MMIF)
**Champ (p. 3-4)** : « Ce texte s'applique également aux cas des pneumonies graves, sans toutefois proposer de recommandations sur la prise en charge spécifique en soins critiques » ; « L'algorithme décisionnel pour identifier le lieu de prise en charge ainsi que les scores de gravité n'ont pas été rediscutés : il convient donc pour cela de se reporter aux recommandations de 2010 ».

**Tableau 1 – PAC grave (p. 4)** : « Définition d'une pneumonie aiguë grave si présence d'un critère majeur ou d'au moins 3 critères mineurs (selon ATS/IDSA) ». Majeurs : « Choc septique » ; « Détresse respiratoire nécessitant recours à la ventilation mécanique ». Mineurs : « Fréquence respiratoire ≥ 30 cycles/min », « PaO2/FIO2 ≤ 250* », « Infiltrats multilobaires (i.e., ≥ 2) », « Confusion/désorientation », « Urée plasmatique ≥ 7,14 mmol/L », « Leucopénie (leucocytes < 4 000/mm3) », « Thrombocytopénie (plaquettes < 100 000/mm3) », « Hypothermie (température corporelle < 36 °C) », « Hypotension nécessitant une expansion volémique ». Notes : « FiO2 = 0,21 + 0,03 x débit O2 (L/min) » ; leucopénie « Due à l'infection seule (i.e., pas la chimiothérapie anticancéreuse) ».

**Tableau 2 – suspicion de bactérie atypique (p. 4)** (« faible sensibilité et spécificité ») : Légionellose — contexte « Situation à risque (voyage, exposition à de l'eau en aérosols, etc.) » et « Non-réponse à 48h-72 h de traitement par bêtalactamine bien conduit » ; clinique « Rapidement progressif (2 à 3 jours) », signes digestifs, neurologiques, « pouls dissocié » ; biologie « Insuffisance rénale, hyponatrémie, cytolyse, rhabdomyolyse ». *M. pneumoniae* : « Épidémies (familiale, institution) », terrain « Jeune > âgé », « Progressif : tableau de toux fébrile trainante ».

**Tableau 3 – comorbidités (p. 5)** : « Hospitalisation dans les trois mois précédents » ; « Antibiothérapie dans le mois précédent* » (* « sauf nitrofurantoïne, fosfomycine orale, pivmecillinam ») ; « Éthylisme chronique » ; « Troubles de la déglutition » ; « Maladie neurologique sévère avec risque de fausses routes ** » ; « Néoplasie active » ; « Immunodépression*** » (*** « corticoïdes systémiques ≥ 10 mg/j, autres traitements immunosuppresseurs, asplénie, agranulocytose, infection par le VIH avec une numération lymphocytaire T CD4 ≤ 200/mm3, déficit immunitaire primitif ») ; « BPCO sévère (VEMS < 50 % de la théorique) ou insuffisance respiratoire chronique (OLD ou VNI) » ; « Insuffisance cardiaque congestive » ; « Insuffisance hépatique » ; « Insuffisance rénale chronique (DFG < 30 mL/min) ». NB : « La présence d'une seule des comorbidités listées ci-dessus suffit à modifier le choix de l'amoxicilline » ; « L'asthme en soi n'est pas une comorbidité » ; « L'âge sans comorbidité n'est pas un critère à prendre en compte ».

**2-1 Ambulatoire (p. 6)** : « Patient sans comorbidité : amoxicilline (Grade B-1) ; en cas d'allergie : pristinamycine (Grade B-3) » ; « Patient avec au moins une comorbidité (Tableau 3) : amoxicilline-acide clavulanique (Grade B-1) ; en cas d'allergie non grave : C3G […] injectable (Grade B-1) ; uniquement en cas d'allergie contre-indiquant l'utilisation de bêtalactamine : lévofloxacine (Grade B-1) » ; grippe : « amoxicilline-acide clavulanique (Grade C-1) ; en cas d'allergie : pristinamycine (Grade C-1) » ; atypique : « macrolide en première intention, pristinamycine ou doxycycline en alternative (Grade C-1) » ; échec bêta-lactamine : « relais par un macrolide lors de la réévaluation à H72 (Grade C-1) » ; échec macrolide : « relais par bêtalactamine (amoxicilline ou amoxicilline-acide clavulanique ou C3G injectable selon la présence de comorbidités) lors de la réévaluation à H72 (Grade C-1) ». Remarque : « les céphalosporines orales n'ont aucune place dans le traitement des PAC ». Tableau 5 NB : « La lévofloxacine est indiquée uniquement si allergie grave aux bêtalactamines et pas d'autre possibilité thérapeutique ».

**2-2 Hospitalisé non grave (p. 7)** : « Patient sans comorbidité : amoxicilline per os ou injectable (Grade A-1) ; en cas d'allergie aux pénicillines : C3G injectable (Grade B-1) » ; « Patient avec comorbidités […] (sans facteur de risque d'infection à Pseudomonas aeruginosa […]) : soit amoxicilline-acide clavulanique per os ou injectable, soit C3G injectable (Grade B-1) » ; grippe : « amoxicilline-acide clavulanique (Grade C-1) » ; atypique : « macrolides (Grade C-1) » ; échec H72 : « réaliser un bilan complet avec recherche de complication et/ou de bactéries résistantes » puis « Discussion de drainage pleural », « Élargissement du spectre », « Relais par un macrolide si forte suspicion de bactérie atypique (Grade C-1) » ; « La pristinamycine n'a pas sa place chez les patients hospitalisés (Grade C-1) » ; « Alternative (uniquement en cas d'allergie contre-indiquant l'utilisation de bêtalactamine) : lévofloxacine (Grade B-1) ». Tableau 6 note : « Lévofloxacine : uniquement si allergie grave aux bêtalactamines ou si contre-indication aux macrolides en cas de suspicion de bactérie atypique ».

**2-3 PAC grave (p. 7)** : « C3G injectable associée à un macrolide ou, en cas d'allergie à l'une des deux classes médicamenteuses, monothérapie par fluoroquinolone antipneumococcique (lévofloxacine) (Grade B-1) » ; LPV : « nécessite l'utilisation d'une molécule avec une activité anti-toxinique (Tableau 9) (Grade B-1) ». Tableau 8 : désescalade « La plus précoce possible selon l'évolution clinique et la documentation microbiologique ».

**Tableau 7 – bactéries atypiques (p. 6)** : « Légionellose : Macrolide* ; Si forme grave ou contre-indication aux macrolides : lévofloxacine » ; *M. pneumoniae* et *C. pneumoniae* : « Macrolide* ; Cycline ; Si contre-indication aux macrolides et aux cyclines : lévofloxacine » ; « * Macrolides : azithromycine, clarithromycine, roxithromycine, spiramycine ».

**Tableau 9 – LPV (p. 7)** : probabiliste « C3G parentérale (céfotaxime ou ceftriaxone) + macrolide + linézolide » ; alternative « C3G parentérale + vancomycine + clindamycine** » ; « En cas d'allergie aux bêta-lactamines : lévofloxacine + linézolide » ; SASM LPV+ : « Pénicilline M (IV) ou céfazoline + Clindamycine ou rifampicine » ; SARM LPV+ : « Linézolide » ou « Vancomycine + clindamycine ou rifampicine ». Tableau évocateur : « Contexte post-grippal, gravité, présentation évocatrice : hémoptysie, leucopénie, rash cutané et pneumonie nécrosante (nodules multiples, images excavées) ». ** « La clindamycine est active sur la plupart des bactéries atypiques, mais non active sur toutes les souches de légionelle ».

**Tableau 10 – posologies « en l'absence d'insuffisance rénale » (p. 8, FR)** — hors soins critiques / en soins critiques : Amoxicilline « 1 g x 3/j » / « 2 g x 3/j » ; Pristinamycine « 1 g x 3/j » / « Non » ; Amoxicilline-acide clavulanique « 1 g x 3/j » / « 1 ou 2 g x 3/j » ; Céfotaxime « 1 g x 3/j » / « 80-100 mg/kg/j » ; Ceftriaxone « 1 g x 1/j » / « 2 g x 1/j » ; Lévofloxacine « 500 mg/j » / « 500 mg à 1000 mg/j » ; Azithromycine « 500 mg/j (J1) puis 250 mg/j » (une seule valeur dans le PDF FR) ; Clarithromycine « 500 mg x 2/j » / « 500 mg x 2/j » ; Spiramycine « 1,5 MUI à 3 MUI x 3/j » / « 3 MUI x 3/j » ; Doxycycline « 100 mg x 2/j » ; Céfazoline « 80-100 mg/kg/j » ; Pénicilline M « 80 à 100 mg/kg/j » / « 100 mg/kg/j * » ; Linézolide « 600 mg x 2/j » / « 600 mg x 2/j ». * « en trois perfusions quotidiennes ou IVSE après une dose de charge de 30 mg/kg en une heure ».
Version anglaise (IDN, Table 10) : Azithromycin « 500 mg/d (D1), then 250 mg/d » dans **les deux** colonnes ; Doxycycline « 100 mg× 2/d » dans les deux colonnes.

**Durée (p. 8)** : « en cas d'obtention de l'ensemble des critères de stabilité clinique à J3, un traitement antibiotique de trois jours au total est recommandé (Grade A-1)¹ » ; « Si la stabilité clinique n'est obtenue qu'entre trois et cinq jours de traitement, un traitement antibiotique de cinq jours au total est recommandé (Grade B-1) » ; « Dans les autres cas de PAC non compliquée, une antibiothérapie de sept jours au total est recommandée (Grade A-1) » ; « Un traitement de durée supérieure à sept jours doit être justifié par la présence d'une complication telle qu'un abcès pulmonaire ou un épanchement pleural liquidien significatif ». Note ¹ : « Pas de données chez les patients immunodéprimés, insuffisants respiratoires, hépatiques et rénaux, chroniques graves ». Champ de la règle 3 j : « PAC non graves (ambulatoires) et modérément graves (hospitalisation hors soins critiques) ».

**Tableau 11 – stabilité clinique (p. 8)** : « Température ≤ 37,8 °C » ; « Pression artérielle systolique ≥ 90 mmHg » ; « Fréquence cardiaque ≤ 100/min » ; « Fréquence respiratoire ≤ 24/min » ; « SpO2 ≥ 90 % en air ambiant » ou « PaO2 ≥ 60 mmHg en air ambiant ».

**Associations (p. 8-9)** : PAC non graves : « une bithérapie probabiliste associant bêtalactamine et macrolide ou fluoroquinolone n'est pas recommandée […] (Grade A-1) » ; PAC graves : « une bithérapie probabiliste associant bêtalactamine (C3G) et macrolide est recommandée. La désescalade vers une monothérapie par bêtalactamine devra être rapidement envisagée en l'absence d'argument […] en faveur d'une PAC à bactérie atypique (Grade B-1) » ; « Une bithérapie n'est pas recommandée dans les PAC avec documentation bactériologique (y compris celles à L. pneumophila), à l'exception des pneumonies graves à souche de SASM productrice de LPV » ; « En cas de pneumonie grave à SARM producteur de LPV, une monothérapie par linézolide est recommandée ».

**Bêta-lactamine anti-*Pseudomonas* (p. 9)** : « recommandée chez les patients hospitalisés avec une PAC grave ou non grave et présentant un antécédent de colonisation ou d'infection respiratoire récente (il y a moins d'un an) par ce pathogène (Grade B-1) » ; « chez les patients hospitalisés avec une PAC grave admis en soins critiques et présentant au moins un facteur de risque parmi : antibiothérapie parentérale récente (moins de trois mois), BPCO sévère, bronchectasies et/ou trachéotomie (Grade B-1) » ; « céfépime ou l'association pipéracilline-tazobactam » en 1re intention sans colonisation documentée ; « L'aztréonam et la ceftazidime […] ne doivent pas être utilisés pour l'antibiothérapie probabiliste d'un patient avec PAC (avis d'expert) » ; colonisation connue : « prendre en compte le dernier antibiogramme disponible (Grade C-1) » ; « fortement recommandé de réaliser des examens de documentation bactériologique » (avis d'expert) ; PAC grave à risque de *P. aeruginosa* : « devra également comporter une molécule active sur les bactéries atypiques (Grade B-1) ».

**Corticoïdes (p. 9-10)** : « Au cours des PAC non graves (ambulatoires ou hospitalisées), l'adjonction de corticoïdes n'est pas recommandée (Grade A-2) » ; « Au cours des PAC graves hospitalisées en soins critiques, l'adjonction d'hémisuccinate d'hydrocortisone, débutée dans les 24 heures suivant l'apparition des signes de gravité et à la posologie de 200 mg par jour, avec une réévaluation au quatrième jour pour statuer sur la décroissance pour une durée totale de 8 à 14 jours, est recommandée en dehors d'un contexte de myélosuppression, de pneumonie d'inhalation ou d'étiologie grippale (Grade A-1) ».

**Biomarqueurs (p. 10)** : CRP : « n'est pas recommandé de manière systématique pour le diagnostic et/ou le suivi des PAC (Grade C-1) » ; PCT : idem « (Grade C-1) ».

**Antigénuries (p. 10)** : ambulatoire : « il n'est pas recommandé de réaliser d'antigénurie Legionella ou pneumocoque (Grade C-2) » ; hospitalisée non grave : pas d'antigénurie pneumocoque « (Grade B-2) », pas d'antigénurie Legionella « sauf en cas d'arguments évocateurs (cf. Tableau 2) (Grade B-2) » ; hospitalisée grave : « il est recommandé de réaliser une antigénurie pneumocoque et Legionella (Grade B-1) ». Note 2 : « En cas d'antigénurie Legionella négative et de suspicion clinique de PAC grave à Legionella, il faut réaliser une PCR (et une culture) sur prélèvements respiratoires profonds ».

**ECBC / prélèvements (p. 11)** : ambulatoire « pas recommandé (Grade C-2) » ; hospitalisée non grave : « recommandé de réaliser un ECBC en cas de sécrétions muco-purulentes », particulièrement si antibiothérapie « non conventionnelle (autre qu'amoxicilline, amoxicilline-acide clavulanique, macrolides ou C3G parentérale) », antécédent SARM/*P. aeruginosa*, « antibiothérapie parentérale dans les trois derniers mois », « non-réponse […] (72 h) » (Grade C-2) ; grave : « examen direct microscopique après coloration de Gram et d'une mise en culture à partir d'un prélèvement respiratoire (en privilégiant les prélèvements profonds […]) (Grade C-2) ».

**Hémocultures (p. 11)** : ambulatoire « pas recommandé » (avis d'expert) ; hospitalisée non grave « uniquement » si doute diagnostique, immunodépression, antibiothérapie non conventionnelle, antécédent SARM/*P. aeruginosa*, antibiothérapie parentérale < 3 mois, non-réponse à 72 h (avis d'expert) ; grave : « réaliser systématiquement des hémocultures (Grade B-1) ».

**PCR (p. 12)** : ambulatoire : « la recherche des virus respiratoires ainsi que l'utilisation des PCR syndromiques ne sont pas recommandées (avis d'expert) » ; hospitalisée (non grave et grave) : « réaliser une PCR virale quadriplex à la recherche des virus Influenza A/B, du VRS et du SARS-CoV-2, selon le contexte épidémique » ; panel « bas » en PAC grave « lorsqu'une antibiothérapie non conventionnelle est utilisée […] (c'est-à-dire différente de l'association C3G+Macrolide) » ou recherche de Legionella si PCR spécifique indisponible (Grade C-2).

## 2. `SPILF-2025-PAC-diapo` — diaporama du comité des référentiels SPILF (12/03/2025)

- **URL** : https://www.infectiologie.com/UserFiles/File/spilf/recos/spilf-groupe-reco-pac-2025.pptx — consultee — en_vigueur.
- Diapo 3 : « L'algorithme décisionnel pour le lieu de prise en charge et les scores de gravité n'ont pas été revus (consulter les recommandations 2010) ».
- Diapo 4 : « PAC grave : si présence d'un critère majeur ou au moins 3 critères mineurs (selon ATS/IDSA 2023) » (année « 2023 » non concordante avec l'article — probable coquille).
- Diapo 6 antigénuries : ambulatoire « Non recommandé » ; « PAC hospitalisées non graves : antigénurie Legionella si arguments évocateurs » ; « PAC hospitalisées graves : antigénurie Legionella et pneumocoque ».
- Diapo 10 : « Uniquement si allergie grave aux bêta-lactamines et pas d'autre possibilité thérapeutique : lévofloxacine ».
- Diapo 13 : PAC grave initiale « C3G parentérale (ceftriaxone ou céfotaxime) + Macrolide » ; « Lévofloxacine (uniquement si allergie contre indiquant l'utilisation de bêta-lactamines) ».
- **Diapo 15 (posologies, divergentes de l'article)** : Amoxicilline-acide clavulanique soins critiques « 2 g x3/j » ; Céfotaxime soins critiques « 100 mg/kg/j » ; Azithromycine soins critiques « Non » ; Doxycycline soins critiques « Non » ; Roxithromycine « 150 mg x2/j » ; Rifampicine soins critiques « 10 mg/kg/j » ; Céfazoline et Pénicilline M « 100 mg/kg/j ».
- Diapo 16 : « PAC avec critères de stabilité clinique à J3 : 3 jours » ; « > J3-J5 : 5 jours » ; « Autre : 7 jours » ; « Un traitement supérieur à 7 jours doit être argumenté (ex : complications) ».
- Diapo 19 corticoïdes : « Hémisuccinate d'hydrocortisone » ; « Dans les 24 heures suivant l'apparition des signes de gravité » ; « Posologie de 200 mg/j (IVSE) : J1-J4 » ; « J4 : réévaluation puis décroissance » ; « Durée totale (fonction de la réévaluation) : 8 à 14 jours ».
- Diapo 20 : scanner « A H72, si non-amélioration ou aggravation ».
- Diapo 21 : « En cas de non amélioration à 72h de bêta-lactamine : relais (et non ajout) vers macrolides ».

## 3. `AFSSAPS-2010-IRB` — Afssaps/SPILF/SPLF, juillet 2010

- **Titre exact** : « Antibiothérapie par voie générale dans les infections respiratoires basses de l'adulte — Pneumonie aiguë communautaire — Exacerbations de BPCO », mise au point, Afssaps, juillet 2010.
- **URL** : https://www.infectiologie.com/UserFiles/File/spilf/recos/2010-infvrb-spilf-afssaps.pdf — consultee.
- **Vigueur** : `remplacee` (par SPILF/SPLF 2025) **sauf §2.1 orientation / CRB 65**, auquel renvoie explicitement le texte 2025.
- Définition (p. 2) : « dite communautaire si elle est acquise en milieu extra-hospitalier ou si, à l'hôpital, elle survient avant la 48ème heure suivant l'admission ».
- Figure 1 (p. 2) — signes de gravité imposant l'hospitalisation : « atteinte des fonctions supérieures (altération de la conscience) » ; « PA systolique < 90 mmHg, fréquence cardiaque > 120 /min, fréquence respiratoire > 30 / min » ; « température < 35°C ou ≥ 40°C » ; « néoplasie associée (cancer actif ou diagnostiqué dans l'année, autre que baso-cellulaire) » ; « pneumonie d'inhalation ou sur obstacle trachéo-bronchique connu ou suspecté ». Situations particulières : « complication de la pneumonie (notamment suspicion d'épanchement pleural ou d'abcédation) », « conditions socio-économiques défavorables », « inobservance thérapeutique prévisible », « isolement social, notamment chez les personnes âgées ».
- Facteurs de risque de mortalité (p. 2) : « âge > 65 ans », « insuffisance cardiaque congestive », « maladie cérébro-vasculaire », « maladie rénale », « maladie hépatique », « BPCO », « immunodépression », « drépanocytose homozygote », « antécédent de pneumonie bactérienne », « hospitalisation dans l'année », « vie en institution ». Règle : « Hospitalisation recommandée : âge ≤ 65 ans et deux facteurs de risque ou âge > 65 ans et au moins un facteur de risque » ; sinon « Prise en charge généralement ambulatoire ».
- Tableau 1 CRB 65 (p. 3) : « C : Confusion » ; « R : Fréquence respiratoire ≥ 30 / mn » ; « B : Pression artérielle systolique < 90 mmHg ou Pression artérielle diastolique ≤ 60 mmHg » ; « 65 : Age* ≥ 65 ans » ; « 0 critère : traitement ambulatoire possible » ; « ≥ 1 critère : évaluation à l'hôpital » ; « * Plus que l'âge civil, l'âge physiologique […] est à prendre en compte ».
- §2.2.3 (p. 4) : « Le traitement antibiotique doit être instauré dès le diagnostic porté, idéalement dans les 4 heures. Son efficacité doit être évaluée impérativement après 48-72 heures de traitement. La voie orale doit être privilégiée quand elle est possible. »
- (Tableaux d'antibiothérapie 2010 — durée « 7 à 14 jours », aminoside, télithromycine — **remplacés**, non repris.)

## 4. `HAS-2025-PAC-adulte-ambulatoire` — HAS/SPILF/GPIP, fiche PAC adulte en ambulatoire

- **Titre exact** : « Choix et durées d'antibiothérapies : Pneumonie Aiguë Communautaire de l'adulte en ambulatoire » ; « Date de validation : 19 décembre 2024 » ; « Mis en ligne le 09 janv. 2025 - Mis à jour le 13 mai 2025 ».
- **URL** : https://www.has-sante.fr/jcms/p_3575597/fr/choix-et-durees-d-antibiotherapies-pneumonie-aigue-communautaire-de-l-adulte-en-ambulatoire — consultee (HTML) — en_vigueur.
- Examens : « En ambulatoire, les examens microbiologiques ne sont pas requis. » ; imagerie « dans un délai court (idéalement 24h). Néanmoins elle ne doit pas retarder la mise en route du traitement antibiotique ».
- Critères devant « amener à discuter une prise en charge hospitalière » : « Hypothermie < 36°C ou hyperthermie > 40 °C », « Hypotension », « Fréquence respiratoire ≥ 30 cycles/min », « Confusion » ; comorbidités « insuffisance cardiaque, maladie cérébro-vasculaire, maladie rénale, hépatique, BPCO, hospitalisation dans l'année, antécédent de pneumonie bactérienne » ; « personne âgée isolée, isolement social, inobservance thérapeutique ».
- 1re intention sans comorbidité : « amoxicilline 1g 3 fois par jour » ; « En cas d'allergie documentée contre-indiquant les pénicillines ou de rupture de stock : pristinamycine 1g 3 fois par jour ».
- Atypique ou échec à 72 h : « clarithromycine : 500 mg 2 fois par jour » ; « spiramycine : 3 MUI 3 fois par jour » ; « azithromycine : 500 mg par jour en une prise à J1 puis 250 mg par jour (antibiotique ayant un impact plus important sur la résistance bactérienne du fait de sa longue demi-vie) » ; allergie/CI macrolides : « pristinamycine : 1g 3 fois par jour » ; « doxycycline : 200 mg 1 fois par jour ».
- Comorbidités / exposition : « En cas de comorbidités ou d'exposition aux antibiotiques[1] dans le mois précédant ou d'hospitalisation dans les 6 mois : amoxicilline/acide clavulanique : 1g/125 mg 3 fois par jour » ; allergie pénicilline : « ceftriaxone : 1g 1 fois par jour par voie IM, IV ou SC » ; « cefotaxime : 1g 3 fois par jour par voie IM ou IV » ; « En dernier recours, si aucune autre antibiothérapie n'est possible : fluoroquinolone anti-pneumococcique[2] : levofloxacine 500 mg 1 fois par jour ». [2] « Les fluoroquinolones ne doivent pas être prescrites si le patient a reçu une FQ dans les 3 derniers mois. »
- Échec à 72 h avec comorbidités : « Avis spécialisé » ; « Discuter l'hospitalisation ».
- Durée : « 7 jours maximum en cas de pneumonie aiguë communautaire non compliquée » ; « Possibilité d'arrêt à 5 jours voire à 3 jours à condition que les critères de stabilité clinique soient obtenus et vérifiés par le médecin et qu'une information soit délivrée au patient ». Critères : « Apyrexie », « PA systolique ≥ 90 mm Hg », « Fréquence cardiaque ≤ 100/min », « Fréquence respiratoire ≤ 24/min », « SpO2 ≥ 90 % ou PaO2 ≥ 60 mm Hg en air ambiant ». La toux, l'expectoration et l'asthénie peuvent persister « plusieurs semaines ; cela ne nécessite pas de prolonger l'antibiothérapie ».
- `HAS-2024-synthese-antibiotherapie` (p. 4) : « Pneumonie aiguë communautaire (PAC) sans signe de gravité chez l'adulte [2024] » : amoxicilline ; « clarythromycine » si atypique ou échec (72h) ; « 7 jours maximum ».

## 5. `HAS-2023-mycoplasma` — HAS, réponse rapide *M. pneumoniae* (validée 21/12/2023)

- **URL** : https://www.has-sante.fr/upload/docs/application/pdf/2023-12/reponses_rapides_mycoplasma_pneumoniae_2023-12-22_09-16-40_110.pdf — consultee — en_vigueur.
- p. 4 : « Les indications d'hospitalisation sont les mêmes que celles d'une pneumonie aiguë communautaire. » ; « Les macrolides sont le traitement de référence » ; adulte : clarithromycine « 500 mg 2 fois par jour pendant 5 jours » ; azithromycine « 500 mg/j en une prise à J1 puis 250mg/j de J2 à J5 » ; en cas de problème d'approvisionnement, spiramycine « 3 MUI 3 fois par jour pendant 7 jours », roxithromycine « 150 mg matin et soir pendant 10 jours ».
- p. 5 : allergie/CI macrolides : pristinamycine « 1g matin midi soir pendant 7 jours » ; doxycycline adulte « > 60 kg : 200 mg/j pendant 7 jours » ; « < 60 kg : 200 mg à J1 (en dose unique) puis 100 mg/jour […] durée totale de 7 jours » ; « En dernier recours dans le cadre d'une décision partagée […] Lévofloxacine 500 mg 1 fois par jour pendant 7 jours » ; « L'antibiothérapie doit être efficace dans les 48h-72h, dans le cas contraire le patient doit être réévalué. »

## 6. `SPILF-SFGG-2025-inhalation-diapo` — Pneumonies d'inhalation, SPILF/SFGG (diaporama 08/01/2025)

- **URL** : https://www.infectiologie.com/UserFiles/File/spilf/recos/spilf-groupe-recos-pneumonie-inhalation.pptx — consultee. Article source (Infect Dis Now 2025, https://www.sciencedirect.com/science/article/pii/S2666991925000600 ; version FR MMIF S2772743225004787) : **contenu_non_lisible (403)**. Vigueur : en_vigueur.
- Diapo 3 : « Diagnostic de PI : (1) + (2) » : signes d'infection respiratoire basse « + Infiltrat(s) radiologique(s) nouveau(x) » ; « Troubles de déglutition ou inhalation ou Atteinte clinico-radiologique déclive en présence de facteur(s) de risque d'inhalation » ; « Le tableau respiratoire aigu immédiatement secondaire à une fausse route (pneumopathie chimique) ne répond pas à la définition de PI. »
- Diapo 6 : imagerie « En priorité un scanner thoracique sans injection ».
- Diapo 7 : « Aucun examen complémentaire bactériologique systématique n'est recommandé » ; « Un ECBC doit être réalisé avant l'initiation d'une antibiothérapie à activité anti-P. aeruginosa » ; « Les antigénuries (pneumocoque et légionelle) ne sont pas recommandées ».
- Diapo 8 : « Traitement de première intention : amoxicilline - ac. clavulanique PO ou IV » ; « Impossibilité d'utiliser la voie orale et IV : ceftriaxone SC en monothérapie » ; « Allergie à la pénicilline sans contre-indication à l'utilisation des C3G : ceftriaxone IV ou SC en monothérapie » ; « Contre-indication aux bétalactamines : cotrimoxazole PO ou IV » ; « Il est recommandé de ne pas associer le métronidazole ».
- Diapo 9 : « Après une fausse route constatée : Pas d'antibiothérapie, surveillance clinique » ; absence d'évolution favorable à 72 h : « Relais par pipéracilline – tazobactam ».
- Diapo 10 (formes graves) : « Au moins un FDR de P. aeruginosa parmi : antécédant de colonisation ou d'infection respiratoire récente (<1 ans) documenté à Pseudomonas, antibiothérapie parentérale récente (<3 mois), BPCO sévère, bronchiectasies, trachéotomie » → « Piperacilline-tazobactam en traitement probabiliste » ; « Patients précédemment connu colonisé à SARM » → « Ajout du linezolide » ; « En cas pneumonie grave dont le mécanisme est incertain : Appliquer les recommandations de la SPILF de 2025 sur la PAC grave. »
- Diapo 11 (posologies selon DFG) : amoxicilline-acide clavulanique « > 30 ml/min : 1g d'amoxicilline toutes les 8h » ; « [10-30]ml/min : 1g en dose de charge puis 0.5g toutes les 8h » ; « <10ml/min : 1g en dose de charge puis 0.5g toutes les 24h » ; ceftriaxone « Pas d'adaptation : 1g/24h, IV ou SC » ; cotrimoxazole « >30ml/min : 800mg de sulfamethoxazole toutes les 8h » ; « [15-30]ml/mn : 800mg toutes les 24h » ; « <15ml/mn : 800mg toutes les 48h » ; pipéracilline-tazobactam « >20ml/min : 4g de pipéracilline toutes les 6 à 8h » ; « <20ml/min : 4g toutes les 12h ». (Grandeur : « DFG » sans précision CKD-EPI/Cockcroft.)
- Diapo 13 : « 5 jours en cas d'évolution clinique favorable », évaluée « à 72 heures par la présence de tous les critères de stabilité clinique » (température ≤ 37,8 °C, PAS ≥ 90, FC ≤ 100, FR ≤ 24, SpO2 ≥ 90 % ou PaO2 ≥ 60 mmHg) ; « La persistance de la toux n'est pas un critère de non-amélioration ».
- Diapo 14 : médicaments à réévaluer : psychotropes, anticholinergiques, « Les inhibiteurs de la pompe à proton ».

## 7. `SPILF-2026-legionellose-diapo` — Traitement antibiotique de la légionellose, SPILF 2026

- **URL** : https://www.infectiologie.com/UserFiles/File/spilf/recos/legionellose-2026-groupe-reco-spilf.pptx — consultee — en_vigueur (diaporama ; texte publié non trouvé).
- Diapo 2 : « Maladie à déclaration obligatoire » ; « Pas de transmission interhumaine ».
- Diapo 3 : « Antigénurie : test diagnostique de référence » ; « Ne détecte que le sérogroupe Lp1 » ; sensibilité « inférieure à 50 % chez les patients présentant une forme modérée » ; « PCR uniquement sur prélèvements respiratoires profonds » ; « La sérologie légionnelle n'est pas recommandée ».
- Diapo 5 : « Forme non grave, patient non immunodéprimé : Traitement possible en ambulatoire ; Macrolide en monothérapie : Azithromycine ; Alternatives : Clarithromycine ou Spiramycine (existent sous forme injectable), Roxithromycine » ; « Forme grave et/ou patient immunodéprimé : Lévofloxacine en monothérapie ; Alternatives : Clarithromycine ou Spiramycine » ; « Bithérapie non recommandée ».
- Diapo 8 : rifampicine « Pas d'indication dans la légionellose » ; doxycycline « Efficacité non démontrée ».
- Diapo 9 (posologies) : Lévofloxacine « 500 mg/j » (hors soins critiques, voie orale) / « 500 mg à 1000 mg/j » (soins critiques, IV) ; Azithromycine « 500 mg/j » / « Non (IV non disponible) » ; Clarithromycine « 500 mg x 2/j » / « 500 mg x 2/j » ; Spiramycine « 1,5 MUI à 3 MUI x 3/j » / « 3 MUI x 3/j ».
- Diapo 11 (durées suggérées) : « Forme non grave, immunocompétent : 3 jours si Azithromycine ; 7 jours si Clarithromycine, Roxithromycine, Spiramycine ou Lévofloxacine (si CI aux macrolides) » ; « Patients immunodéprimés non graves : 5 jours si Azithromycine, 10 jours si Lévofloxacine ou Clarithromycine » ; « Pneumonie grave* : 7 jours : Spiramycine IV ou Clarithromycine IV ou Lévofloxacine IV » ; « Patients immunodéprimés graves* : 10 jours : Lévofloxacine IV ou Clarithromycine IV » ; « *Relais oral dès stabilité clinique ».
- Diapo 10 : « Durée optimale de l'antibiothérapie non démontrée : aucune étude randomisée n'a évalué la durée de traitement ».

## 8. `SFAR-SRLF-2017-PAS-rea` — RFE SFAR/SRLF « Pneumonies associées aux soins de réanimation »

- **URL** : https://sfar.org/wp-content/uploads/2017/09/2-2_PNEUMONIES-ASSOCIEES-AUX-SOINS-DE-REANIMATION.pdf (copie SRLF : https://www.srlf.org/wp-content/uploads/2017/09/2017_09_RFE-commune_PNEUMONIES-ASSOCIEES-AUX-SOINS-DE-REANIMATION.pdf) — consultee — en_vigueur (aucune actualisation trouvée). GRADE 1+/2+/1-/2-, avis d'experts ; « Texte validé par le Conseil d'Administration de la SFAR (29/06/2017) et de la SRLF (08/06/2017) ».
- Définitions (p. 3-4) : « La pneumonie sévère acquise à l'hôpital et la PAVM sont des infections survenant après 48 h d'hospitalisation ou de ventilation mécanique, respectivement » ; « on distingue les pneumonies précoces (apparues dans un délai inférieur à 5 jours) et tardives (supérieur ou égal à 5 jours) ».
- Tableau 1 (p. 6) : radiologie + « au moins un des signes suivants » : « Température corporelle > 38,3°C sans autre cause », « Leucocytes < 4000 /mm3 ou ≥ 12000 /mm3 » + « au moins deux » : « Sécrétions purulentes », « Toux ou dyspnée », « Désaturation ou besoin accru en oxygène ou nécessité d'assistance ventilatoire ».
- R2.1 : « Il ne faut probablement pas utiliser les scores cliniques (CPIS, CPIS modifié) pour le diagnostic » (GRADE 2-).
- R2.2 : « Il faut probablement réaliser des prélèvements microbiologiques des voies aériennes, quel que soit le type, avant toute introduction ou modification de l'antibiothérapie. GRADE 2+ ».
- R2.3 : ne pas mesurer « procalcitonine ou alvéolaires de TREM-1 soluble pour diagnostiquer » (GRADE 2-).
- R3.1 : prélever et traiter « immédiatement en cas de suspicion de pneumonie avec signes de gravité hémodynamique (choc), respiratoire (syndrome de détresse respiratoire aigu) ou de terrain fragile (immunodépression). GRADE 2+ ».
- R3.2 : « Il faut traiter par monothérapie en probabiliste les pneumonies associées aux soins du patient immunocompétent sous ventilation mécanique, en dehors de la présence de facteurs de risque de bactéries multirésistantes, de bacilles à Gram négatif non fermentants, et/ou de facteurs de risque élevé de mortalité (choc septique, défaillances d'organes). GRADE 1+ ».
- Argumentaire R3.2 (p. 18) — FR de BMR : « une antibiothérapie dans les 90 jours précédant l'épisode de pneumonie », « une hospitalisation de plus de 5 jours », « le recours à une séance d'épuration extra-rénale lors du diagnostic », « le choc septique », « le SDRA » ; « En présence d'au moins un de ces facteurs de risque, la bithérapie lors du traitement probabiliste est indiquée » ; FR *P. aeruginosa* : « la BPCO, la dilatation des bronches et la mucoviscidose ».
- R3.3 : « Les experts suggèrent de ne pas utiliser de manière probabiliste et systématique un antibiotique actif contre Staphylococcus aureus résistant à la méticilline » (avis d'experts) ; FR SARM (p. 19) : « prévalence locale de SARM élevée, colonisation récente du patient à SARM, lésion cutanée chronique, dialyse chronique ».
- R3.4 : « Il faut probablement réduire le spectre et privilégier une monothérapie […] après documentation, y compris pour les bacilles à Gram négatif non fermentants. GRADE 2+ ».
- R3.5 : « Il ne faut pas prolonger plus de 7 jours la durée du traitement antibiotique pour les pneumonies associées aux soins, y compris pour les pneumonies à bacille à Gram négatif non fermentant en dehors de certaines situations (immunodépression, empyème, pneumonie nécrosante ou abcédée). GRADE 1- ».
- R3.6 : colimycine et/ou aminoside nébulisés si BGN MR sensibles seulement à ces molécules (GRADE 2+). R3.7 : pas de statines (GRADE 1-). Corticoïdes : « Aucune recommandation n'a donc été proposée ».
- **Protocole n°4 « Schémas thérapeutiques (AVIS D'EXPERTS) » (p. 23)** — « Posologies données à titre indicatif pour un patient avec fonction rénale normale et poids standard ». Correspondance molécule/posologie **reconstituée** depuis un tableau aplati par l'extraction (confiance moyenne) :
  - Précoce < 5 j sans choc ni FR BMR : « Béta-lactamine inactive contre P. aeruginosa » — « Amoxicilline/acide clavulanique ou C3G type Céfotaxime » 3 à 6 g/j ; allergie : lévofloxacine 500 mg x 2/j.
  - Précoce < 5 j avec choc sans FR BMR : même bêta-lactamine « + Aminoside b ou + Fluoroquinolone » (ex. gentamicine 8 mg/kg/j ; ofloxacine 200 mg x 2/j) ; allergie : « Lévofloxacine + Gentamicine ».
  - Tardive ≥ 5 j ou autre FR de BGN non fermentant : « Ceftazidime ou Céfépime ou Pipéracilline-tazobactam ou si portage de BLSE c Imipenem-cilastatine ou Méropénème + Amikacine d ou Ciprofloxacine » (ceftazidime 6 g/j ; céfépime 4 à 6 g/j ; pipéracilline-tazobactam 16 g/j ; imipénème 3 g/j ; méropénème 3 à 6 g/j ; amikacine 30 mg/kg/j ; ciprofloxacine 400 mg x 3/j) ; allergie : « Aztréonam + Clindamycine » (3 à 6 g/j ; 600 mg x 3 à 4/j).
  - FR SARM : « Vancomycine ou Linézolide » — « 15 mg/kg puis 30 à 40 mg/kg/j » ; « 600 mg x 2/j ».
  - Notes : « b Privilégier l'usage des aminosides par rapport aux fluoroquinolones pour limiter l'émergence de BMR » ; « d Utiliser en priorité l'amikacine par rapport à la gentamicine ».

## 9. Sources européennes et nord-américaines (recoupement)

### 9a. `ERS-ESICM-ESCMID-ALAT-2023-PACgrave` — consultee (Europe PMC PMC10069946) — en_vigueur
- Définition : « sCAP refers to CAP requiring ICU admission ».
- Q1 : multiplex PCR sur prélèvement respiratoire bas « whenever non-standard sCAP antibiotics are prescribed or considered » (conditionnelle, très faible).
- Q3 : « We suggest the addition of macrolides, not fluoroquinolones, to beta-lactams as empirical antibiotic therapy in hospitalised patients with sCAP. Conditional recommendation, very low quality of evidence ».
- Q4 : « We suggest the use of PCT to reduce the duration of antibiotic treatment in patients with sCAP » (conditionnelle, faible).
- Q6 : « In patients with sCAP, we suggest the use of corticosteroids if shock is present. Conditional recommendation, low quality of evidence » ; remarque : ne s'applique pas aux sCAP virales (grippe, SARS, MERS).
- Q8 : « In patients with sCAP and aspiration risk factors, we suggest standard CAP therapy regimen and not specific therapy targeting anaerobic bacteria. Ungraded, good practice statement ».

### 9b. `ERS-ESICM-ESCMID-ALAT-2017-HAP-VAP` — consultee (PDF hébergé par l'ALAT) — en_vigueur
- Q2 : « We suggest using narrow-spectrum antibiotics (ertapenem, ceftriaxone, cefotaxime, moxifloxacin or levofloxacin) in patients with suspected low risk of resistance and early-onset HAP/VAP. (Weak recommendation, very low quality of evidence.) » ; « A prevalence of resistant pathogens in local microbiological data >25% is considered a high background rate ».
- Q3 : « We recommend initial empiric combination therapy for high-risk HAP/VAP patients to cover Gram-negative bacteria and include antibiotic coverage for MRSA in those patients at risk. (Strong recommendation, moderate quality of evidence.) » ; high-risk : « septic shock and/or […] previous antibiotic use, recent prolonged hospital stay (>5 days of hospitalisation) and previous colonisation with MDR pathogens ».
- Q4 : « We suggest using a 7–8-day course of antibiotic therapy in patients with VAP without immunodeficiency, cystic fibrosis, empyema, lung abscess, cavitation or necrotising pneumonia and with a good clinical response to therapy. (Weak recommendation, moderate quality of evidence.) » ; GPS : appliquer ce raisonnement aux HAP non ventilées « represents good practice ».
- Q6 : pas de dosage sérié de PCT en routine quand la durée prévue est de 7-8 jours (forte, modérée).

### 9c. `IDSA-ATS-2016-HAP-VAP` — consultee (page IDSA « CURRENT », WebFetch partiel) — en_vigueur
- FR de BMR (VAP) : « use of intravenous antibiotics in the past 90 days », « ≥5 days of hospitalization prior to the occurrence of VAP », « septic shock at the time of VAP », « ARDS before VAP », « acute renal replacement therapy prior to VAP » ; HAP : « Only one risk factor was significantly associated with MDR HAP: prior intravenous antibiotic use ».
- SARM : couverture si « units where >10%–20% of S. aureus isolates are methicillin resistant » (faible, très faible) ; double anti-pyocyanique si « >10% of gram-negative isolates are resistant to an agent being considered for monotherapy » (faible, faible).
- Durée : VAP « we recommend a 7-day course of antimicrobial therapy rather than a longer duration » (forte, modérée) ; HAP : idem (forte, très faible). Désescalade : « we suggest that antibiotic therapy be de-escalated rather than fixed ».

### 9d. `ATS-IDSA-2019-PAC` — consultee (Europe PMC PMC6812437) — incertain
- Gravité : « We recommend direct admission to an ICU for patients with hypotension requiring vasopressors or respiratory failure requiring mechanical ventilation » ; critères mineurs IDSA/ATS 2007 « together with clinical judgment ».
- Ambulatoire sans comorbidité : « amoxicillin 1 g three times daily (strong recommendation, moderate quality of evidence) ».
- Antigénuries : pneumocoque non systématique « except in adults with severe CAP » ; Legionella en PAC grave (conditionnelles, faibles).
- Inhalation : « We suggest not routinely adding anaerobic coverage for suspected aspiration pneumonia unless lung abscess or empyema is suspected ».
- Corticoïdes : « We suggest not routinely using corticosteroids in adults with severe CAP (conditional recommendation, moderate quality of evidence) ».
- Durée : « for no less than a total of 5 days (strong recommendation, moderate quality of evidence) ».

### 9e. `ATS-2025-PAC` — contenu_non_lisible
- Article officiel non accessible (redirection/403). Selon des sources secondaires uniquement (NON VÉRIFIÉ, non cité comme verbatim) : durée < 5 jours (minimum 3) chez les patients stables non graves, ≥ 5 jours en PAC grave ; corticoïdes systémiques suggérés en PAC grave (hors grippe) ; mise à jour **non endossée par l'IDSA**.

### 9f. `SCCM-2024-corticoides` — consultee (résumé Europe PMC)
- « a strong recommendation for use in hospitalized patients with severe CAP » ; le panel n'a pas pu fixer molécule, dose et durée dans le SDRA (le résumé ne précise pas de schéma pour la PAC).

---

## 10. Proposition de modélisation

### 10.1 Situations cliniques à distinguer
1. **PAC ambulatoire** (adulte, sans critère d'hospitalisation) — `SPILF-SPLF-2025-PAC` §2-1, `HAS-2025-PAC-adulte-ambulatoire`.
2. **PAC hospitalisée non grave** — `SPILF-SPLF-2025-PAC` §2-2.
3. **PAC grave** (1 critère majeur ou ≥ 3 mineurs) — `SPILF-SPLF-2025-PAC` §2-3, tableaux 1, 8.
   - 3a. sans FR de *P. aeruginosa* ; 3b. avec FR de *P. aeruginosa* ; 3c. tableau évocateur de *S. aureus* LPV.
4. **Légionellose** suspectée/documentée — `SPILF-SPLF-2025-PAC` tableau 7, `SPILF-2026-legionellose-diapo`.
5. **Pneumopathie atypique (*M. pneumoniae*, *C. pneumoniae*)** — tableau 7, `HAS-2023-mycoplasma`.
6. **Contexte grippal** (co/surinfection) — §2-1, §2-2.
7. **Pneumonie d'inhalation** (non grave / grave avec FR *P. aeruginosa* ou SARM) — `SPILF-SFGG-2025-inhalation-diapo`.
8. **Pneumonie associée aux soins en réanimation / PAVM** : précoce (< 5 j) sans FR BMR ; précoce + choc ; tardive (≥ 5 j) ou FR de BGN non fermentant ; FR SARM — `SFAR-SRLF-2017-PAS-rea`.
9. **Pneumonie nosocomiale hors réanimation** — **pas de texte français** : `avis spécialisé` / brouillon (recoupement `ERS-ESICM-ESCMID-ALAT-2017-HAP-VAP` GPS, `IDSA-ATS-2016-HAP-VAP`).

### 10.2 Données d'entrée (questions à poser)
| Question | Valeurs | Justification |
|---|---|---|
| Lieu acquis : communautaire vs ≥ 48 h d'hospitalisation / de ventilation | communautaire / HAP / PAVM | `AFSSAPS-2010-IRB` p. 2 ; `SFAR-SRLF-2017-PAS-rea` p. 3 « après 48 h » |
| Délai d'apparition (PAVM/HAP) | < 5 j / ≥ 5 j | `SFAR-SRLF-2017-PAS-rea` p. 3-4 |
| Critères de gravité ATS/IDSA (2 majeurs, 9 mineurs) | cases | `SPILF-SPLF-2025-PAC` tableau 1 |
| Critères d'orientation (signes de gravité 2010, FR de mortalité, CRB 65, facteurs sociaux) | cases | `AFSSAPS-2010-IRB` fig. 1, tableau 1 ; `HAS-2025-PAC-adulte-ambulatoire` |
| Comorbidités du tableau 3 (11 items) | cases | `SPILF-SPLF-2025-PAC` tableau 3 |
| Contexte grippal / suspicion de surinfection virale | oui/non | §2-1, §2-2 |
| Éléments évocateurs de bactérie atypique / Legionella (tableau 2) | oui/non | tableau 2 |
| Tableau évocateur de LPV (post-grippal, hémoptysie, leucopénie, rash, nécrose) | oui/non | tableau 9 |
| Colonisation/infection respiratoire à *P. aeruginosa* < 1 an ; antibiothérapie parentérale < 3 mois ; BPCO sévère ; bronchectasies ; trachéotomie | cases | §IV p. 9 |
| Colonisation SARM ; prévalence locale SARM ; lésion cutanée chronique ; dialyse chronique | cases | `SFAR-SRLF-2017-PAS-rea` p. 19 ; `SPILF-SFGG-2025-inhalation-diapo` diapo 10 |
| FR BMR (réanimation) : antibiothérapie < 90 j, hospitalisation > 5 j, EER, choc, SDRA | cases | `SFAR-SRLF-2017-PAS-rea` p. 18 |
| Portage BLSE | oui/non | protocole 4 |
| Allergie : pénicillines seules (non grave) / grave contre-indiquant les bêta-lactamines / CI macrolides / CI cyclines | choix | §2-1, §2-2, tableaux 5-7 |
| Fluoroquinolone reçue dans les 3 derniers mois | oui/non | `HAS-2025-PAC-adulte-ambulatoire` note [2] |
| Inhalation : troubles de déglutition / fausse route constatée / atteinte déclive + FR | cases | `SPILF-SFGG-2025-inhalation-diapo` diapo 3, 9 |
| QT long, hypokaliémie, médicaments torsadogènes, colchicine, statine (simvastatine), AVK/AOD, IMAO/ISRS/vasopresseurs | cases | RCP (§12) |
| Immunodépression | oui/non | tableau 3 ; légionellose diapo 11 |
| Grossesse | oui/non | CRAT (§12) |
| DFG / ClCr ; hémodialyse | valeur | RCP ; inhalation diapo 11 |
| Stabilité clinique à J3 (5 critères) | cases | tableau 11 |

### 10.3 Antibiothérapie probabiliste — propositions sourcées

| Situation | 1re ligne | Alternative / allergie | Posologie (sans IR) | Source |
|---|---|---|---|---|
| Ambulatoire, sans comorbidité | Amoxicilline | Allergie : pristinamycine (B-3) ; FQ seulement si allergie grave et pas d'autre possibilité | Amoxicilline 1 g x 3/j | SPILF 2025 §2-1, tab. 10 ; HAS 2025 |
| Ambulatoire, ≥ 1 comorbidité | Amoxicilline-acide clavulanique | Allergie non grave : C3G injectable (ceftriaxone 1 g/j IM/IV/SC ou céfotaxime 1 g x 3/j) ; allergie CI bêta-lactamines : lévofloxacine 500 mg/j | AMC 1 g x 3/j | SPILF 2025 §2-1 ; HAS 2025 |
| Ambulatoire, contexte grippal | Amoxicilline-acide clavulanique | Allergie : pristinamycine (C-1) ou C3G parentérale | idem | SPILF 2025 §2-1, tab. 5 |
| Ambulatoire, atypique | Macrolide | Pristinamycine ou doxycycline | Clarithromycine 500 mg x 2/j ; spiramycine 1,5-3 MUI x 3/j (HAS : 3 MUI x 3/j) ; azithromycine 500 mg J1 puis 250 mg/j | SPILF 2025 tab. 7, 10 ; HAS 2025 |
| Hospitalisé non grave, sans comorbidité | Amoxicilline PO ou IV (A-1) | Allergie pénicillines : C3G injectable (B-1) ; allergie CI bêta-lactamines : lévofloxacine | Amoxicilline 1 g x 3/j ; ceftriaxone 1 g x 1/j ; céfotaxime 1 g x 3/j | SPILF 2025 §2-2 |
| Hospitalisé non grave, comorbidité(s) (sans FR *P. aeruginosa*) | AMC PO/IV ou C3G injectable (B-1) | Allergie CI bêta-lactamines : lévofloxacine 500 mg/j | AMC 1 g x 3/j | SPILF 2025 §2-2 |
| Hospitalisé non grave, atypique | Macrolide (C-1) | Lévofloxacine si allergie grave ou CI macrolides | voir tab. 10 | tab. 6, 7 |
| PAC grave sans FR *P. aeruginosa* | C3G parentérale + macrolide (B-1) | Allergie : lévofloxacine monothérapie | Ceftriaxone 2 g x 1/j ou céfotaxime 80-100 mg/kg/j (article) / 100 mg/kg/j (diapo) ; clarithromycine 500 mg x 2/j ou spiramycine 3 MUI x 3/j ; lévofloxacine 500-1000 mg/j | SPILF 2025 §2-3, tab. 8, 10 |
| PAC grave avec FR *P. aeruginosa* | Céfépime ou pipéracilline-tazobactam + molécule active sur atypiques (B-1) ; si colonisation connue : selon dernier antibiogramme | Aztréonam/ceftazidime exclus en probabiliste | **Posologies céfépime/pip-taz non données par SPILF 2025** → RCP déjà intégrés | SPILF 2025 §IV |
| PAC grave, tableau LPV | C3G + macrolide + linézolide | C3G + vancomycine + clindamycine ; allergie : lévofloxacine + linézolide | Linézolide 600 mg x 2/j | tab. 9, 10 |
| Légionellose non grave, immunocompétent | Azithromycine | Clarithromycine, spiramycine, roxithromycine ; lévofloxacine si CI macrolides | voir diapo 9 | légionellose 2026 diapo 5, 9 |
| Légionellose grave et/ou immunodéprimé | Lévofloxacine monothérapie | Clarithromycine ou spiramycine (IV) ; pas de bithérapie | Lévofloxacine 500-1000 mg/j IV | légionellose 2026 diapo 5, 9 ; SPILF 2025 tab. 7 |
| Inhalation non grave | AMC PO ou IV ; ceftriaxone SC si ni PO ni IV | Allergie pénicilline sans CI C3G : ceftriaxone IV/SC ; CI bêta-lactamines : cotrimoxazole ; **pas de métronidazole** | AMC 1 g/8 h (> 30 mL/min) ; ceftriaxone 1 g/24 h ; cotrimoxazole 800 mg SMX/8 h | inhalation diapo 8, 11 |
| Inhalation grave + FR *P. aeruginosa* / SARM | Pipéracilline-tazobactam ; + linézolide si SARM connu | mécanisme incertain : schéma PAC grave | Pip-taz 4 g/6-8 h (> 20 mL/min) | inhalation diapo 10, 11 |
| PAVM/HAP réa précoce, sans choc ni FR BMR | Monothérapie : AMC ou céfotaxime (R3.2 GRADE 1+) | Allergie : lévofloxacine | 3-6 g/j ; lévofloxacine 500 mg x 2/j (protocole avis d'experts, alignement reconstitué) | SFAR-SRLF 2017 R3.2, protocole 4 |
| PAVM/HAP réa précoce + choc, sans FR BMR | AMC ou céfotaxime + aminoside (préféré) ou FQ | Allergie : lévofloxacine + gentamicine | gentamicine 8 mg/kg/j | protocole 4 |
| PAVM/HAP réa tardive ou FR BGN non fermentant | Ceftazidime / céfépime / pip-taz (carbapénème si portage BLSE) + amikacine (ou ciprofloxacine) | Allergie : aztréonam + clindamycine | amikacine 30 mg/kg/j | protocole 4, R3.2 argumentaire |
| + FR SARM | + vancomycine ou linézolide | — | vancomycine 15 mg/kg puis 30-40 mg/kg/j ; linézolide 600 mg x 2/j | R3.3, protocole 4 |
| Pneumonie nosocomiale hors réa | **avis spécialisé** | — | — | aucun texte français |

### 10.4 Durée et point de départ
- PAC non grave/modérée (ambulatoire ou hospitalisée hors soins critiques) : **3 jours au total** si les 5 critères de stabilité sont présents à J3 (A-1) ; **5 jours** si stabilité entre J3 et J5 (B-1) ; **7 jours** sinon (A-1) ; > 7 j seulement si complication (abcès, épanchement significatif). Point de départ : début de l'antibiothérapie (« trois jours au total »). Exclusion implicite de la règle des 3 j : immunodéprimés, insuffisants respiratoires/hépatiques/rénaux chroniques graves (note ¹ : pas de données). — `SPILF-SPLF-2025-PAC` p. 8.
- PAC grave : **non tranché par SPILF 2025** pour la durée (la règle 3/5/7 vise explicitement les PAC « non graves » et « modérément graves »). ERS 2023 : PCT pour raccourcir (conditionnelle). → brouillon / avis spécialisé.
- Légionellose : diapo 11 (3 j azithromycine ; 7 j autres ; 5/10 j immunodéprimé ; 7 j grave ; 10 j immunodéprimé grave).
- *M. pneumoniae* ambulatoire : clarithromycine 5 j ; azithromycine 5 j (500 puis 250) ; spiramycine 7 j ; doxycycline 7 j ; lévofloxacine 7 j (`HAS-2023-mycoplasma`). (Divergence avec SPILF 2025 qui applique 3/5/7 j à toute PAC.)
- Inhalation : 5 jours si évolution favorable à 72 h.
- PAVM/HAP réa : ≤ 7 jours (R3.5, GRADE 1-) sauf immunodépression, empyème, pneumonie nécrosante ou abcédée ; ERS 2017 : 7-8 jours ; IDSA 2016 : 7 jours.

### 10.5 Réévaluation et désescalade
- Réévaluation à 72 h (SPILF 2025 tableaux 5-6 ; HAS 2025) ; AFSSAPS 2010 : « après 48-72 heures ». Échec bêta-lactamine en ambulatoire : **relais (et non ajout)** par macrolide ; échec macrolide : relais bêta-lactamine ; échec avec comorbidités : avis spécialisé / hospitalisation (HAS). Hospitalisé : bilan de complication, drainage pleural, élargissement, relais macrolide si forte suspicion.
- PAC grave : désescalade vers bêta-lactamine seule en l'absence d'argument pour une atypique (B-1) ; pas de bithérapie si documentation (sauf SASM LPV).
- Réanimation : désescalade/monothérapie après documentation (R3.4).

### 10.6 Corticoïdes (PAC grave)
- SPILF 2025 : hémisuccinate d'hydrocortisone 200 mg/j (IVSE), dans les 24 h des signes de gravité, réévaluation J4, durée totale 8-14 j, hors myélosuppression, inhalation, grippe ; s'applique aux « PAC graves hospitalisées en soins critiques » (A-1). **Pas de corticoïdes en PAC non grave** (A-2).

### 10.7 Microbiologie (selon gravité)
| Examen | Ambulatoire | Hospitalisé non grave | Grave |
|---|---|---|---|
| Antigénurie pneumocoque | non (C-2) | non (B-2) | oui (B-1) |
| Antigénurie Legionella | non (C-2) | si arguments évocateurs (B-2) | oui (B-1) ; si négative + suspicion : PCR/culture profonde |
| ECBC / prélèvement respiratoire | non (C-2) | si sécrétions muco-purulentes, surtout ATB non conventionnelle, ATCD SARM/PA, ATB parentérale < 3 mois, échec 72 h (C-2) | Gram + culture sur prélèvement profond (C-2) |
| Hémocultures | non (avis d'expert) | ciblées (avis d'expert) | systématiques (B-1) |
| PCR virale quadriplex | non | selon contexte épidémique | oui (C-2) |
| Panel syndromique bas | non | non | si ATB ≠ C3G+macrolide ou recherche Legionella sans PCR spécifique (C-2) |
| Inhalation | — | aucun examen systématique ; ECBC avant anti-PA ; pas d'antigénurie | — |
| PAVM | — | — | prélèvement respiratoire avant toute introduction/modification (R2.2, 2+) |

### 10.8 Critères d'orientation / avis
- PAC : orientation par les critères 2010 (signes de gravité, FR de mortalité, CRB 65) ; HAS 2025 : critères pour « discuter » l'hospitalisation. PAC grave = tableau 1 SPILF. Avis spécialisé : échec à 72 h avec comorbidités (HAS). Linézolide : « uniquement en milieu hospitalier et après avis d'un spécialiste » (RCP).
- Gestes : drainage pleural si épanchement (SPILF §2-2) ; scanner à H72 si non-amélioration.

### 10.9 Ce qui n'est PAS tranché (zones grises → brouillon / avis spécialisé)
1. **Durée de la PAC grave** (non couverte par la règle 3/5/7 de SPILF 2025).
2. **Posologies en soins critiques** : discordances article FR / article EN / diapo (céfotaxime 80-100 vs 100 mg/kg/j ; AMC 1 ou 2 g vs 2 g x 3 ; azithromycine et doxycycline « Non » en diapo mais données en EN). → valeurs à confirmer avant intégration.
3. **Adaptation rénale** : SPILF 2025 donne les posologies « en l'absence d'insuffisance rénale » seulement ; seule la diapo inhalation donne des paliers DFG (AMC, cotrimoxazole, pip-taz).
4. **Pneumonie nosocomiale hors réanimation** : aucun texte français.
5. **Protocole SFAR 2017** : posologies « à titre indicatif » (avis d'experts) et alignement molécule/dose reconstitué ; texte de 2017 non actualisé (antibiotiques récents non intégrés ; renvoi à ESCMID 2022 BGN-MDR déjà au registre).
6. **Corticoïdes** : divergence forte entre sources (cf. §11).
7. **Azithromycine IV** : non disponible en France (diapo légionellose) ; **clarithromycine IV** : AMM française limitée aux mycobactéries atypiques (RCP Zeclar IV) ; **azithromycine orale** : la PAC n'est pas une indication du RCP ZITHROMAX 250 mg → usage dans la PAC/légionellose hors AMM bien que recommandé.
8. **Spiramycine IV + lévofloxacine** : association listée « contre-indiquée » au §4.3 du RCP ROVAMYCINE IV (mais citée en « précautions d'emploi » au §4.5 : incohérence interne du RCP). L'association macrolide + lévofloxacine n'est pas proposée par SPILF 2025 (lévofloxacine = alternative en monothérapie), mais le relais/chevauchement doit être signalé.

---

## 11. Divergences entre sources

| Point | Sources et positions |
|---|---|
| Corticoïdes PAC grave | SPILF 2025 : hydrocortisone 200 mg/j recommandée (A-1) hors grippe/inhalation/myélosuppression, sans exiger de choc ; ERS 2023 : « if shock is present » (conditionnelle) ; ATS/IDSA 2019 : « not routinely » ; SCCM 2024 : recommandation forte ; ATS 2025 : suggérés (secondaire, non vérifié) |
| Durée PAC non grave | SPILF 2025 : 3 j si stable à J3 (A-1) ; HAS 2025 : « 7 jours maximum », « possibilité d'arrêt à 5 jours voire à 3 jours » ; ATS/IDSA 2019 : ≥ 5 j ; HAS mycoplasma : 5-7 j selon molécule |
| Définition des comorbidités (ambulatoire) | SPILF 2025 : hospitalisation < 3 mois, ATB < 1 mois ; HAS 2025 : « exposition aux antibiotiques dans le mois » ou « hospitalisation dans les 6 mois » ; liste HAS des critères d'hospitalisation proche de 2010 |
| Doxycycline | SPILF 2025 : 100 mg x 2/j ; HAS 2025 : 200 mg x 1/j ; HAS mycoplasma : 200 mg/j (> 60 kg) |
| Spiramycine | SPILF : 1,5-3 MUI x 3/j (hors soins critiques) ; HAS : 3 MUI x 3/j ; RCP oral : 6-9 MUI/j ; RCP IV : 1,5 MUI/8 h, « peut être doublée » si sévère |
| Clarithromycine IV en PAC | Recommandée (SPILF, légionellose) ; RCP Zeclar IV : indication limitée aux mycobactéries atypiques (SIDA) |
| Bithérapie PAC grave | SPILF/ERS : bêta-lactamine + **macrolide** (ERS : « not fluoroquinolones ») ; ATS/IDSA 2019 : bêta-lactamine + macrolide **ou** FQ respiratoire |
| PCT | SPILF 2025 : non systématique ; ERS 2023 : suggérée pour raccourcir en PAC grave ; SFAR 2017 : pas pour le diagnostic ; ERS 2017 : pas en routine si 7-8 j prévus |
| Inhalation | SPILF/SFGG : AMC 1re intention, pas de métronidazole ; ERS 2023 : régime PAC standard, pas d'anti-anaérobie ; ATS/IDSA : pas d'anti-anaérobie sauf abcès/empyème ; AFSSAPS 2010 : l'inhalation est un critère d'hospitalisation |
| PAVM probabiliste | SFAR 2017 : monothérapie sauf ≥ 1 FR BMR (bithérapie) ; ERS 2017 : spectre étroit possible (ertapénème, ceftriaxone, céfotaxime, lévofloxacine, moxifloxacine) si bas risque, combinaison si haut risque (> 25 % de résistance locale) ; IDSA 2016 : seuils 10-20 % SARM, > 10 % BGN résistants |
| Durée PAVM | SFAR : ≤ 7 j ; ERS : 7-8 j ; IDSA : 7 j |

---

## 12. Molécules attribuées (RCP ANSM / BDPM)

### 12.1 Spiramycine — `RCP-spiramycine` (ROVAMYCINE 3 MUI cp, CIS 67535280, RCP mis à jour le 08/10/2026) et `RCP-spiramycine-IV` (ROVAMYCINE 1,5 MUI lyophilisat, CIS 65952065, RCP mis à jour le 05/06/2026)
- **4.1 (oral)** : « Pneumopathies communautaires chez des sujets : sans facteurs de risque, sans signes de gravité clinique, en l'absence d'éléments cliniques évocateurs d'une étiologie pneumococcique » ; « En cas de suspicion de pneumopathie atypique, les macrolides sont indiqués quels que soient la gravité et le terrain ». **(IV)** : « Pneumopathies aigües ».
- **4.2 (oral)** : « Ce dosage n'est pas adapté à l'enfant. Il est réservé à l'adulte. » ; « 6 à 9 MILLIONS d'U.I./24 heures, soit 2 à 3 comprimés par jour en 2 à 3 prises » ; « Chez le sujet insuffisant rénal : Aucun ajustement posologique n'est nécessaire ». **(IV)** : « 1,5 M U.I. toutes les 8 heures (soit 4,5 M U.I. par jour) en perfusion lente » ; « En cas d'infection sévère, la posologie peut être doublée » ; « perfusion lente d'une heure dans un volume minimal de 100 ml de solution injectable de glucose à 5 pour cent » ; IR : aucun ajustement.
- **4.3 (oral)** : hypersensibilité seulement. **(IV)** : en plus « Chez les sujets à risque de « QT long » » et « En association avec les médicaments donnant des torsades de pointes », liste incluant « lévofloxacine, moxifloxacine », « citalopram », « dompéridone », amiodarone, sotalol.
- **4.4** : SJS/Lyell/PEAG : arrêt et contre-indication de toute réadministration ; « De très rares cas d'anémie hémolytique […] déficit en Glucose-6-Phosphate-Déshydrogénase, l'utilisation de la spiramycine dans cette population de patients n'est pas recommandée » ; QT : prudence (hypokaliémie, hypomagnésémie, cardiopathie, torsadogènes, sujets âgés, femmes). IV : « La spiramycine par voie IV fait partie des médicaments donnant des torsades de pointes ».
- **4.5** : oral : torsadogènes (dont lévofloxacine) en « précautions d'emploi » ; lévodopa/carbidopa ; INR : « De nombreux cas d'augmentation de l'activité des anticoagulants oraux ont été rapportés » (macrolides cités). IV : torsadogènes contre-indiqués ; « Azithromycine, clarithromycine, roxithromycine : Surveillance clinique et électrocardiographique pendant l'association » ; « Ciprofloxacine, levofloxacine, norfloxacine » aussi listées en précautions (incohérence avec §4.3).
- **4.6** : « L'utilisation de la spiramycine peut être envisagée au cours de la grossesse si besoin » ; allaitement déconseillé. **CRAT** (`CRAT-spiramycine-grossesse`, MAJ 31.07.2024) : « L'utilisation de la spiramycine est possible quel que soit le terme de la grossesse. »
- Surveillance : ECG si facteurs de risque de QT (IV surtout) ; INR si AVK ; surveillance cutanée.

### 12.2 Clarithromycine — `RCP-clarithromycine` (ZECLAR 500 mg cp, CIS 67997205, RCP mis à jour le 17/06/2024) et `RCP-clarithromycine-IV` (ZECLAR 0,5 g perfusion, CIS 61433564, RCP mis à jour le 17/06/2024)
- **4.1 (oral)** : « Pneumopathies communautaires chez des sujets : sans facteurs de risque, sans signes de gravité clinique, en l'absence d'éléments cliniques évocateurs d'une étiologie pneumococcique » ; atypique « quels que soient la gravité et le terrain ». **(IV)** : seule indication « Infections à mycobactéries atypiques chez les patients atteints de SIDA, quand la voie orale est impossible ».
- **4.2 (oral)** : « Sinusites aiguës, exacerbations des bronchites chroniques, pneumopathies communautaires : 1000 mg/jour en deux prises par jour » ; IR : **phrase tronquée sur la BDPM** (« Pour des valeurs de la clairance de la créatinine » sans suite — non lisible, idem générique CIS 60814021) ; §4.4 : ClCr < 30 mL/min « l'allongement de la demi-vie impose une réduction de la posologie » ; insuffisance hépatique : « la dose de 500 mg deux fois par jour ne doit pas être dépassée ». **(IV)** : « 500 mg deux fois par jour à 12 heures d'intervalle » ; « clairance inférieure à 30 ml/minute, la dose administrée doit être diminuée de moitié » ; perfusion en 60 minutes ; pas de bolus ni IM.
- **4.3** : allergie aux macrolides ; associations contre-indiquées notamment « la colchicine », dérivés de l'ergot, pimozide, mizolastine, « la simvastatine », ticagrélor, ivabradine, dompéridone, quétiapine, ranolazine ; « Allongement congénital ou acquis de l'intervalle QT » ; « ne doit pas être administrée à des patients présentant des déséquilibres électrolytiques (hypokaliémie ou hypomagnésémie) » ; « insuffisance hépatique sévère en association avec une insuffisance rénale ».
- **4.4** : QT/torsades ; hépatotoxicité (« Des cas d'insuffisance hépatique fatale ont été rapportés ») ; statines CYP3A4 : atorvastatine « doit être évitée dans la mesure du possible » ; AVK : « L'INR et le taux de prothrombine doivent être surveillés fréquemment » ; AOD : précautions ; inducteurs (rifampicine) : baisse des concentrations.
- **4.5** : « + Antivitamines K : Augmentation de l'effet […] Contrôle plus fréquent de l'INR » (précautions d'emploi) ; « + Rivaroxaban » (déconseillée) ; « + Atorvastatine » (précautions) ; « + Rifampicine : Risque de diminution des concentrations plasmatiques de clarithromycine ».
- **4.6** : « l'utilisation pendant la grossesse n'est pas recommandée sans avoir soigneusement évalué les bénéfices par rapport aux risques » (risque accru de fausse couche rapporté par certaines études). **CRAT** (`CRAT-clarithromycine-grossesse`, MAJ 31.07.2024) : « L'utilisation de la clarithromycine est possible quel que soit le terme de la grossesse. » → **divergence RCP/CRAT**.

### 12.3 Azithromycine — `RCP-azithromycine` (ZITHROMAX 250 mg cp, CIS 65740799, RCP mis à jour le 21/08/2026)
- **4.1** : adultes : « Pharyngite et angine aiguës streptococciques », « Abcès dentaire et parodontite », « Exacerbation aiguë de bronchite chronique ». **La pneumonie communautaire ne figure pas dans les indications de ce RCP** (usage recommandé par SPILF/HAS = hors AMM pour cette spécialité ; les RCP des génériques n'ont pas été vérifiés un à un).
- **4.2** : « 500 mg/jour pendant 3 jours ou 500 mg le jour 1, puis 250 mg/jour du jour 2 au jour 5 » (indications listées) ; « Aucune adaptation posologique n'est nécessaire chez les patients présentant un DFG ≥ 10 mL/min » (phrase suivante pour DFG < 10 tronquée sur la BDPM) ; §5.2 : « La C max et l'ASC 0-120 moyennes étaient augmentées de 61 % et 35 % » chez DFG < 10 ; « il est peu probable que la dialyse entraîne une élimination significative » ; insuffisance hépatique sévère : prudence.
- **4.3** : « Hypersensibilité à la substance active, à l'érythromycine, à tout antibiotique de la famille des macrolides ou des kétolides ».
- **4.4** : « Risque de résistance » : traitement « uniquement lorsque les schémas thérapeutiques de première intention ne sont pas indiqués » ; QT (femmes, sujets âgés, hypokaliémie, bradycardie, insuffisance cardiaque sévère) ; hépatotoxicité (« hépatite fulminante ») ; myasthénie.
- **4.5** : QT avec « fluoroquinolones (par exemple, moxifloxacine et lévofloxacine) », hydroxychloroquine ; P-gp : colchicine (« surveillance clinique »), digoxine, dabigatran (« risque accru d'hémorragie ») ; statines : « des cas de rhabdomyolyse ont été rapportés » ; warfarine : « Une augmentation de la fréquence des contrôles du temps de prothrombine doit être envisagée ».
- **4.6** : « L'azithromycine ne doit être utilisée pendant la grossesse qu'en cas de nécessité clinique. » **CRAT** (`CRAT-azithromycine-grossesse`, MAJ 31.07.2024) : « L'utilisation de l'azithromycine est possible quel que soit le terme de la grossesse. »
- Forme IV : **non disponible en France** (`SPILF-2026-legionellose-diapo` diapo 9 « IV non disponible » ; aucune présentation injectable dans la liste BDPM consultée).

### 12.4 Linézolide — `RCP-linezolide` (ZYVOXID 600 mg cp, CIS 68311278, et ZYVOXID 2 mg/ml perfusion, CIS 63283095 ; RCP mis à jour le 21/05/2026)
- **4.1** : « ZYVOXID est indiqué chez les adultes dans le traitement des pneumonies nosocomiales et communautaires lorsqu'elles sont documentées ou suspectées à bactéries à Gram positif sensibles » ; « Le linézolide n'est pas actif dans le traitement des infections dues à des germes à Gram négatif » ; « Un traitement par le linézolide devra être débuté uniquement en milieu hospitalier et après avis d'un spécialiste tel qu'un microbiologiste ou un infectiologue ».
- **4.2** : « Pneumonie nosocomiale : 600 mg par voie orale deux fois par jour, 10-14 jours consécutifs » ; pneumonie communautaire : même posologie ; « La durée maximale du traitement est de 28 jours » ; IV/PO sans ajustement (biodisponibilité « voisine de 100 % ») ; « Insuffisance rénale : Aucun ajustement posologique n'est nécessaire » ; IR sévère : prudence (métabolites jusqu'à 10 fois) ; hémodialyse : « il devra être administré après dialyse » ; IV « sur une période de 30 à 120 minutes ».
- **4.3** : IMAO A/B (ou dans les 2 semaines) ; sauf surveillance étroite de la pression artérielle : HTA non contrôlée, phéochromocytome, hyperthyroïdie, « état confusionnel aigu », ISRS, tricycliques, triptans, « les vasopresseurs (par exemple : l'adrénaline, la noradrénaline) », « la dopamine, la dobutamine », péthidine, buspirone ; allaitement interrompu.
- **4.4** : myélosuppression : « surveiller une fois par semaine la numération sanguine complète […] quelle que soit la numération initiale » ; surveillance étroite si IR sévère, traitement > 10-14 jours ; acidose lactique ; syndrome sérotoninergique ; neuropathie optique/périphérique (surtout > 28 j) ; hyponatrémie/SIADH (natrémie chez le sujet âgé) ; convulsions ; tyramine ; excès de mortalité dans les septicémies sur cathéter avec Gram négatif associé.
- **4.5** : pas d'interaction CYP450 ; rifampicine : baisse ASC « de 32 % » (traduction clinique inconnue) ; warfarine : signification clinique non établie ; sérotoninergiques contre-indiqués.
- **4.6** : « Le linézolide ne doit pas être administré lors de la grossesse sauf si cela est absolument nécessaire ». CRAT : **fiche non trouvée**.

### 12.5 Posologies PAC des molécules déjà présentes (selon les recommandations, à rapprocher des RCP existants)
- Amoxicilline : 1 g x 3/j (hors soins critiques), 2 g x 3/j (soins critiques) — `SPILF-SPLF-2025-PAC` tab. 10 ; HAS 2025 « 1g 3 fois par jour ».
- Amoxicilline-acide clavulanique : 1 g x 3/j ; soins critiques « 1 ou 2 g x 3/j » (article) / « 2 g x3/j » (diapo) ; HAS « 1g/125 mg 3 fois par jour » ; inhalation : paliers DFG (diapo 11).
- Ceftriaxone : 1 g x 1/j ; 2 g x 1/j en soins critiques ; HAS : « IM, IV ou SC ».
- Céfotaxime : 1 g x 3/j ; soins critiques « 80-100 mg/kg/j » (article) / « 100 mg/kg/j » (diapo).
- Lévofloxacine : 500 mg/j ; 500 à 1000 mg/j en soins critiques ; RCP (`RCP-levofloxacine`) PAC « 500 mg une ou deux fois par jour ». Restrictions : `ANSM-2023-fluoroquinolones` — ne pas utiliser « pour traiter des infections de sévérité légère à modérée […] à moins que les autres antibiotiques habituellement recommandés pour ces infections ne soient jugés inappropriés » (la pneumonie n'est pas nommée) ; HAS : pas si FQ dans les 3 derniers mois. Grossesse : `CRAT-fluoroquinolones-grossesse` (lévofloxacine en 2e intention).
- **Pristinamycine (non traitée ici, attribuée à un autre agent)** : citée par SPILF 2025 en ambulatoire (allergie sans comorbidité, B-3 ; contexte grippal allergique, C-1 ; atypique en alternative, C-1), **exclue chez l'hospitalisé (C-1)** et « Non » en soins critiques ; posologie « 1 g x 3/j » (tab. 10) ; HAS 2025 « 1g 3 fois par jour » (allergie ou rupture de stock ; CI macrolides) ; HAS mycoplasma « 1g matin midi soir pendant 7 jours ».
- Autres molécules nouvelles citées par les recommandations PAC mais non attribuées : **doxycycline** (100 mg x 2/j SPILF ; 200 mg x 1/j HAS), **roxithromycine** (150 mg x 2/j), **clindamycine** (LPV ; PAVM allergie 600 mg x 3-4/j), **pénicilline M IV** (cloxacilline, déjà présente), **céfazoline** (déjà présente), **ceftazidime** (PAVM tardive 6 g/j), **ofloxacine** (PAVM précoce + choc 200 mg x 2/j), **tobramycine**, **moxifloxacine** (ERS 2017), **oseltamivir** (ERS 2023, hors antibiotiques), **hémisuccinate d'hydrocortisone** (adjuvant).
