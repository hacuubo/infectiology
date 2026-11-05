# Recherche documentaire — Estimation de la fonction rénale à partir de la créatininémie (adulte)

Complète `recherche-pharmacologie.md` §4 (fiches 4.1 à 4.10), qui n'est pas répété ici : fiche HAS « 7 messages » (CKD-EPI sans version, abandon de Cockcroft-Gault, désindexation Du Bois), formule CKD-EPI 2021 de la NKF, Cockcroft-Gault des RCP vancomycine et céfépime.

- Date de consultation : **2026-11-05**
- Méthode : WebSearch puis lecture des sources par WebFetch, ou PDF téléchargés et convertis en texte (`pdftotext`). Les calculateurs en ligne ont été exécutés dans le navigateur intégré, et la valeur affichée a été relevée.
- Statuts d'accès : **consultée (contenu lu)** / **trouvée mais contenu non lisible** / **introuvable**.
- Les extraits sont cités mot pour mot, entre guillemets, dans la langue d'origine, et font moins de 40 mots. Une coupure est signalée par « […] ».
- **NON VÉRIFIÉ** : affirmation non lue ce jour dans une source primaire ou faisant autorité.
- Confiance : **élevée** (source primaire officielle lue), **moyenne** (source secondaire faisant autorité, ou lecture partielle), **faible** (indirecte).

---

## 0. Réponses courtes

1. **Équation en France.** La HAS (guide parcours MRC, juillet 2021, mis à jour en septembre 2023 ; avis du 27/09/2023) impose « CKD-EPI » **sans préciser la version**. La KDIGO 2024 (PP 1.2.4.1) laisse chaque région choisir parmi les équations validées : CKD-EPI 2009 *sans coefficient racial*, CKD-EPI 2021 ou EKFC (Table 14). L'EFLM (2022), alignée sur un éditorial de l'ERA, recommande de **ne pas adopter CKD-EPI 2021 en Europe** et de **garder CKD-EPI 2009 sans facteur racial**, avec EKFC comme candidate future. Aucune position officielle de la SFNDT ni de la SFBC n'a été retrouvée. **Les sources divergent** : 2009 sans race (EFLM/ERA), « CKD-EPI » sans version (HAS), libre choix régional (KDIGO), 2021 (NKF/ASN, États-Unis).
2. **Formules.** Toutes ont été vérifiées dans une source primaire ou faisant autorité (§2). Une subtilité EKFC : Q = 80/62 µmol/L ne vaut pas exactement 0,90/0,70 mg/dL (80/88,4 = 0,905).
3. **Désindexation.** Une seule règle se retrouve à la HAS, à la KDIGO (PP 4.2.4) et à la FDA : DFGe × SC/1,73. La HAS la demande quand la surface corporelle est éloignée de 1,73 m². L'EMA et la FDA veulent des doses fondées sur un DFG absolu en mL/min.
4. **Poids dans Cockcroft-Gault.** Le résumé original dit seulement « wt kg ». La FDA 2024 juge le poids idéal ou ajusté « probablement plus exact » que le poids réel chez le sujet en surpoids. MSD Manuals indique le « lean body weight ». **Divergence, non tranchée.**
5. **IRA, instabilité, dialyse.** Les équations supposent un état stable (KDIGO 2024 PP 4.2.5 ; MSD et MDCalc). En situation instable : dosages des médicaments et/ou DFG mesuré, en milieu spécialisé (HAS, guide p. 23-24).

---

## 1. Quelle équation pour l'adulte en France et en Europe ?

### 1.1 HAS — Guide du parcours de soins MRC de l'adulte (juillet 2021, mis à jour en septembre 2023)
- URL : https://www.has-sante.fr/upload/docs/application/pdf/2021-09/guide__mrc.pdf (page : https://www.has-sante.fr/jcms/p_3288950/fr/guide-du-parcours-de-soins-maladie-renale-chronique-de-l-adulte-mrc, mise en ligne le 17/11/2023). Statut : **consultée (contenu lu)**, PDF de 91 pages.
- p. 11 : « Le débit de filtration glomérulaire est estimé à partir de la créatininémie en utilisant l'équation Chronic Kidney Disease Epidemiology Collaboration (CKD-EPI). »
- p. 12 : « Le résultat de créatininémie doit être transmis avec l'estimation du DFG selon la formule CKD-EPI. »
- p. 23 (§ 4.2.1.2) : « la formule de Cockcroft-Gault estimant la filtration glomérulaire ne devrait plus être utilisée pour adapter les posologies de médicaments à élimination urinaire »
- p. 23 : « l'adaptation des posologies doit s'effectuer à partir de la valeur du DFG estimé à partir de l'équation CKD-EPI. »
- **Aucune mention de 2009, 2021 ni d'EKFC** dans le texte (recherche plein texte : aucune occurrence de « 2009 », « EKFC » ou « race »). La référence (20) de ce passage est la ligne directrice EMA 2015.
- Confiance : élevée.

### 1.2 HAS — Avis n° 2023.0034/AC/SEAP du 27 septembre 2023 (actes de dépistage de la MRC)
- URL : https://www.has-sante.fr/upload/docs/application/pdf/2023-09/ac_2023_0034_avis_rapport_albuminurie_creatininurie_mrc.pdf. Statut : **consultée (contenu lu)**.
- « Considérant que la formule CKD-EPI permettant d'estimer le DFG est l'équation présentant les meilleures performances analytiques (biais, précision, exactitude) quel que soit le niveau de la fonction rénale »
- « Il est rappelé que le dosage de créatininémie est réalisé par méthodes enzymatiques. Le compte-rendu doit préciser la méthode utilisée. »
- « Il est rappelé que le DFG est calculé en utilisant la formule CKD-EPI et est exprimé en mL/min/1,73m² dans le compte-rendu. »
- L'avis vise les positions du CNP de biologie médicale et de la SFNDT, sans en citer le contenu. **Pas de version de CKD-EPI.** Confiance : élevée.

### 1.3 KDIGO 2024 CKD Guideline (Kidney Int 2024;105(4S):S117-S314)
- URL : https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf. Statut : **consultée (contenu lu)**, PDF complet.
- Recommandation 1.2.4.1 (p. S186) : « We recommend using a validated GFR estimating equation to derive GFR from serum filtration markers (eGFR) rather than relying on the serum filtration markers alone (1D). »
- PP 1.2.4.1 : « Use the same equation within geographical regions (as defined locally [e.g., continent, country, and region] and as large as possible). Within such regions, equations may differ for adults and children. »
- PP 1.2.4.2 (p. S188) : « Use of race in the computation of eGFR should be avoided. »
- Choix laissé aux régions (S187) : « instead of being prescriptive, we list a set of criteria that defines a valid equation, a set of equations considered valid at this time »
- Rationale (S188) : « The 2009 CKD-EPI creatinine equation is more accurate than the 2021 CKD-EPI creatinine equation in the non-Black race group, as indicated by the percentage of eGFRs within 30% of mGFR (P30) »
- Sur EKFC (S188) : « The original EKFC creatinine equation had a Q-value developed from Belgium and Sweden but was validated in 7 European studies and is recommended for use in White Europeans. »
- Table 14 « Validated GFR estimating equations » (S189) : CKD-EPI 2009 (« reported not using the Black race coefficient », ≥ 18 ans), CKD-EPI 2021 (≥ 18 ans), EKFC 2021 (2-100 ans), Lund-Malmö révisée 2014.
- Table 11 (S184) : « Use an enzymatic method to assay creatinine, where possible. » ; et : « Report eGFR rounded to the nearest whole number and relative to a body surface area (BSA) of 1.73 m2 in adults »
- Confiance : élevée.

### 1.4 EFLM — Delanaye P et al., Clin Chem Lab Med 2023;61(1):44-47 (en ligne le 24/10/2022), DOI 10.1515/cclm-2022-0928
- URL lue : https://orbi.uliege.be/bitstream/2268/296790/1/DelanayeCCLM2022edito.pdf (version éditeur). Statut : **consultée (contenu lu)**.
- Résumé : « The EFLM recommends not to implement the race-free Chronic Kidney Disease Epidemiology Consortium (CKD-EPI) equation in European laboratories and to keep the 2009 version of the CKD-EPI equation, without applying a race correction factor. »
- « This recommendation is completely in line with a recent Editorial published by the European Renal Association »
- « In Europe, this equation could be for instance the new European Kidney Function Consortium (EKFC) equation, which is population-specific, developed from European cohorts and accurate from infants to the older old. »
- L'éditorial ERA cité (Gansevoort RT et al., « What should European nephrology do with the new CKD-EPI equation? », NDT 2022, doi 10.1093/ndt/gfac254) est **trouvé mais non lu**.
- Confiance : élevée (position d'une fédération européenne de biologie).

### 1.5 Stehlé T, Vidal-Petiot E, Flamant M, Delanaye P. Nephrol Ther 2023;19(1):1-10 (revue de la Société francophone de néphrologie, dialyse et transplantation)
- URL : https://orbi.uliege.be/bitstream/2268/300897/1/Stehl%c3%a9NephrolTher2023.pdf. Statut : **consultée (contenu lu)**.
- Résumé : « Chez les sujets européens et africains, CKD-EPIcr-2021 surévalue le DFG réel et ne doit pas être adoptée. »
- p. 7 : « En Europe, ce facteur d'ajustement ethnique n'a jamais été recommandé »
- Conclusion : « Nous partageons l'opinion de ne pas adopter l'équation CKD-EPICr-2021 en Europe »
- C'est une mise au point d'experts français et belges, **pas une recommandation de la SFNDT**. Confiance : moyenne.

### 1.6 SFNDT, SFBC et Société Francophone de Néphrologie : position officielle datée
- Statut : **introuvable**. Aucune recommandation officielle sur le choix entre CKD-EPI 2009, CKD-EPI 2021 et EKFC n'a été trouvée (recherches du 2026-11-05). Seuls existent des résumés de congrès SFNDT 2025 sur EKFC (orbi.uliege.be, non lus) et des diaporamas.
- **NON VÉRIFIÉ** : que les laboratoires français rendent majoritairement CKD-EPI 2009 sans facteur racial (connaissance antérieure).

---

## 2. Formules vérifiées

| Élément | Formule (Scr en mg/dL sauf mention) | Source lue | Confiance |
|---|---|---|---|
| **CKD-EPI 2021** | 142 × min(Scr/κ,1)^α × max(Scr/κ,1)^−1,200 × 0,9938^âge × 1,012 [F] ; κ = 0,7 (F) / 0,9 (H) ; α = −0,241 (F) / −0,302 (H) | Inker LA et al., NEJM 2021;385:1737-49 (PMC8822996, coefficients du tableau) ; NKF (fiche 4.6) ; Stehlé 2023, tableau 1 | élevée |
| **CKD-EPI 2009** (sans race) | 141 × min(Scr/κ,1)^α × max(Scr/κ,1)^−1,209 × 0,993^âge × 1,018 [F] (× 1,159 [Noir] **à ne pas appliquer**) ; κ = 0,7 / 0,9 ; α = −0,329 (F) / −0,411 (H) | Levey AS et al., Ann Intern Med 2009;150:604-12 (PMC2763564) ; calculateur MSD Manuals | élevée |
| **EKFC** (âge > 25 ans) | si Scr/Q < 1 : 107,3 × (Scr/Q)^−0,322 ; si Scr/Q ≥ 1 : 107,3 × (Scr/Q)^−1,132 ; × 0,990^(âge−40) si âge > 40 ; Q = 80 µmol/L (0,90 mg/dL) H, 62 µmol/L (0,70 mg/dL) F | Stehlé 2023, tableau 1 (co-auteur EKFC) ; reproduit par le calculateur EKFC (§7) | moyenne-élevée (article princeps Pottel 2021 non lisible) |
| **Cockcroft-Gault 1976** | Ccr = (140 − âge) × poids (kg) / (72 × Scr) ; « 15% less in females » (soit × 0,85) | Résumé Nephron 1976;16:31-41 (karger.com) | élevée |
| **Conversion** | 1 mg/dL = 88,4 µmol/L | KDIGO 2024, « Conversion factors » ; Stehlé 2023 (« diviser par 88,4 ») ; MSD (facteur 0,0113122 = 1/88,4) | élevée |
| **Du Bois 1916** | A (cm²) = W^0,425 × H^0,725 × 71,84 (W en kg, H en cm), soit SC (m²) = 0,007184 × W^0,425 × H^0,725 | Du Bois D, Du Bois EF, Arch Intern Med 1916;17:863-71 (scan Zenodo) ; HAS (fiche 4.1) | élevée |

Extraits :
- Levey 2009 (PMC, Results) : « GFR = 141 × min(Scr/κ, 1)α × max(Scr/κ, 1)-1.209 × 0.993Age × 1.018 [if female] × 1.159 [if black] ». Le dernier « × » s'affichait « _ » dans la page (artefact de rendu).
- Cockcroft-Gault (résumé, karger.com/nef/article/16/1/31) : « Ccr = (140 – age) (wt kg)/72 × Scr(mg/100ml) (15% less in females). »
- Du Bois (OCR du scan, paragraphe de la formule puis résumé ; page exacte non relevée) : « A = W0·425 H0·725 X 71.84 » ; puis « A being the surface area in square centimeters, the height in centimeters, W the weight in kilograms »
- Stehlé 2023, EKFC : « si SCr/Q < 1 : 107,3 × (SCr/Q)-0,322 × 0,990(âge - 40) si SCr/Q ≥ 1 : 107,3 × (SCr/Q)-1,132 × 0,990(âge - 40) »
- Stehlé 2023 : « Sexe masculin : Q = 80 μmol/L (0,90 mg/dL) Sexe féminin : Q = 62 μmol/L (0,70 mg/dL) »

Pièges relevés :
- **Coefficient d'âge de CKD-EPI 2009** : Stehlé 2023 écrit 0,9929 ; Levey 2009 et MSD écrivent **0,993**. Retenir 0,993 (source primaire).
- **Q d'EKFC** : 80/88,4 = 0,905 et non 0,90 mg/dL. Le calculateur EKFC de référence calcule avec 80/62 µmol/L (§7). Selon l'unité utilisée, le DFGe diffère de 0,1 à 0,5 mL/min/1,73 m².
- **Q chez le jeune** : entre 2 et 25 ans, Q dépend de l'âge (formule ln(Q) de Stehlé, tableau 1). L'application vise les adultes ≥ 18 ans : de 18 à 25 ans, Q **n'est pas constant** (à implémenter ou à signaler). Le tableau FAS de Stehlé dit « ≥ 20 ans » et celui d'EKFC « > 25 ans ».
- Article princeps EKFC (Pottel H et al., Ann Intern Med 2021;174:183-91, DOI 10.7326/M20-4366) : **trouvé mais contenu non lisible** (403 ; seules les métadonnées ont été lues via Europe PMC). Le coefficient 0,990 et les exposants ne sont donc pas lus dans l'article princeps.

---

## 3. Domaine de validité et conditions d'utilisation

| Condition | Ce que disent les sources | Source |
|---|---|---|
| Âge | CKD-EPI 2009 et 2021 : ≥ 18 ans ; EKFC : 2-100 ans | KDIGO 2024 Table 14 ; Inker 2021 : « All the participants were 18 years of age or older. » |
| État stable | « Lags behind changes in GFR » (eGFR vs mGFR) | KDIGO 2024 Table 9 |
| État stable | « For use in patients with stable renal function. » | MDCalc (Cockcroft-Gault), consultée |
| État stable | Cockcroft-Gault valable « if the plasma creatinine concentration is stable. » | MSD Manuals, consultée |
| IRA | « Do not assume chronicity based upon a single abnormal level for eGFR and ACR, as the finding could be the result of a recent acute kidney injury (AKI) » | KDIGO 2024 PP 1.1.3.2 |
| IRA (KDIGO 2012) | « Both the KDOQI guideline and KDIGO recommend that, in stable patients, an eGFR should be used. » | KDIGO AKI 2012, chap. 4 (Kidney Int Suppl 2012;2:69-88), consultée |
| Masse musculaire | Indications de la cystatine C (Table 8) : troubles alimentaires, culturisme, « Above-knee amputation », lésion médullaire, obésité de classe III ; maladies : dénutrition, cancer, insuffisance cardiaque, cirrhose, maladies cachectisantes | KDIGO 2024 Table 8 (S178-S179) |
| Situations à DFG mesuré | « catabolic states, such as serious infections or inflammatory states […] advanced cirrhosis or heart failure, use of high-dose steroids, or the very frail » | KDIGO 2024 Table 10 |
| Grossesse | « Creatinine decreases physiologically during pregnancy due to glomerular hyperfiltration, and BSA varies. This creates challenges for using GFR or eGFR equations. » | KDIGO 2024 § 4.2 (S250) |
| Dosage de la créatinine | enzymatique et traçable ; HAS : « réalisé par méthodes enzymatiques » | KDIGO Table 11 ; HAS avis 2023 ; EMA § 5.2 |
| Dosage de la créatinine | CKD-EPI 2021 est « Designed for use with laboratory creatinine values that are standardized to IDMS. » | NKF (fiche 4.6) |
| Dialyse | Pas d'énoncé direct sur l'invalidité de l'eGFR en dialyse dans les textes lus. La FDA traite la dialyse à part (clairance extracorporelle, voir §8). | **NON VÉRIFIÉ** comme règle explicite |
| Populations noires | EKFC : Q spécifiques pour les populations noires européennes et africaines (KDIGO S188-S189) ; Pottel 2021 n'incluait pas de patients noirs | KDIGO 2024 ; Stehlé 2023 |

---

## 4. Désindexation (DFGe × SC/1,73)

- **HAS** (guide p. 23) : « la désindexation de la formule en tenant compte de la surface corporelle du patient est recommandée lorsque celle-ci est éloignée de 1,73 m² (utiliser la formule : DFG estimé x surface corporelle/1,73) ». **Aucun seuil chiffré** pour « éloignée ». La fiche 7 messages précise la SC de Du Bois sur le « poids réel » (fiche 4.1).
- **KDIGO 2024, PP 4.2.4** (S249) : « In people with extremes of body weight, eGFR nonindexed for body surface area (BSA) may be indicated, especially for medications with a narrow therapeutic range or requiring a minimum concentration to be effective. »
- KDIGO, suite : « Nonindexed eGFR can be obtained by multiplying the indexed eGFR results by the person's BSA and dividing by 1.73 m2, or by using an appropriate online calculator. »
- **KDIGO PP 4.2.2** : « For most people and clinical settings, validated eGFR equations using SCr are appropriate for drug dosing. »
- **KDIGO PP 4.2.3** : « Where more accuracy is required for drug-related decision-making (e.g., dosing due to narrow therapeutic or toxic range) […] use of equations that combine both creatinine and cystatin C, or measured GFR may be indicated. »
- **KDIGO PP 4.2.5** : « Consider and adapt drug dosing in people where GFR, non-GFR determinants of the filtration markers, or volume of distribution are not in a steady state. »
- **KDIGO sur Cockcroft-Gault** (S248-S249) : « there are concerns about use of weight, which can be impacted by edema or obesity. » ; plus loin : « to date, few studies have been conducted to compare different equations for eGFR in the context of drug dosing/kinetics »
- **FDA 2024** (§ IV.A, p. 6) : « when providing a recommended dosage in adult patients with renal impairment, use the eGFR expressed as mL/minute rather than the eGFR referenced to a BSA value of 1.73 m2. » La SC se calcule « using an appropriate formula », avec renvoi à Du Bois 1916 et Mosteller 1987.
- **EMA 2015** (p. 4, § 2) : « dose recommendations for a renally eliminated drug should be based on absolute GFR (or other measure for renal function in ml/min), and not on GFR normalised to a body surface area of 1.73 m2. »
- **NKF** (calculateur) : « Adjust eGFR for body surface area (for medication-related decision making, using Dubois Method) ».
- Divergence de périmètre : HAS = désindexer si SC éloignée de 1,73 ; KDIGO = « may be indicated » aux extrêmes de poids, surtout pour les médicaments à marge étroite ; EMA/FDA = la dose se fonde toujours sur des mL/min absolus.

---

## 5. Poids dans Cockcroft-Gault

- **Article original (1976)** : le résumé dit « (wt kg) » sans préciser réel, idéal ou maigre. Texte intégral **trouvé mais contenu non lisible** (karger.com : « You do not currently have access »). **NON VÉRIFIÉ** : que les auteurs aient utilisé le poids réel.
- **FDA 2024** (§ IV.A, p. 6) : « In overweight or obese individuals, use of alternative body weight metrics such as ideal body weight (IBW) or adjusted body weight (ABW) when calculating eCLcr using the C-G equation is likely to provide a more accurate estimate » (référence : Pai MP, Adv Chronic Kidney Dis 2010).
- **MSD Manuals** (calculateur CG) : « Weight is the estimated lean body weight. »
- **MDCalc** (CG) : « Equation may be inaccurate depending on body weight and BMI; by including height, we calculate BMI and provide a modified estimate/range. » Aucune règle explicite affichée.
- **KDIGO 2024** : mentionne seulement des « concerns about use of weight » (œdème, obésité). Aucune règle.
- **RCP français** (vancomycine, céfépime ; fiche 4.7) : « poids (kg) » sans qualificatif ; poids ajusté défini pour les aminosides (fiche 4.8).
- **Conclusion** : divergence entre poids réel (implicite), poids idéal ou ajusté chez l'obèse (FDA) et poids maigre (MSD). **Non tranché** ; à exposer à l'utilisateur.

---

## 6. Base réglementaire de l'étiquetage (CG vs eGFR)

### 6.1 FDA, « Pharmacokinetics in Patients with Impaired Renal Function – Study Design, Data Analysis, and Impact on Dosing », Guidance for Industry, mars 2024 (version finale)
- URL : https://www.fda.gov/media/78573/download. Statut : **consultée (contenu lu)**, PDF.
- § IV.A (p. 7) : « Because of the widespread availability and incorporation of eGFR into current clinical practice, use of eGFR to determine renal function in PK studies is recommended over eCLcr. »
- Suite : « any contemporary, widely accepted, and clinically applicable estimating equation for the population being studied is considered reasonable to assess renal function in pharmacokinetic studies. »
- § V.C (p. 14) : « dosage recommendations in patients with impaired renal function can significantly differ if different estimating equations of renal function are used »
- Le CG reste listé comme méthode acceptable (« (2) Estimated CLcr (eCLcr) in mL/minute calculated using the Cockcroft-Gault (CG) equation »). Confiance : élevée.

### 6.2 EMA/CHMP/83874/2014, « Guideline on the evaluation of the pharmacokinetics of medicinal products in patients with decreased renal function » (adoptée le 17/12/2015, en vigueur le 01/07/2016)
- URL : https://www.ema.europa.eu/en/documents/scientific-guideline/guideline-evaluation-pharmacokinetics-medicinal-products-patients-decreased-renal-function_en.pdf. Statut : **consultée (contenu lu)**.
- **Cockcroft-Gault n'est pas nommé** (recherche plein texte). L'EMA privilégie un DFG mesuré dans les études (§ 5.2, p. 7) : « it is recommended that a method accurately measuring GFR using an exogenous marker is used to determine renal function in the subjects in the pharmacokinetic study, if possible. »
- § 5.2 (p. 8) : un DFG indexé « should be recalculated to the absolute GFR in ml/min in each individual. »
- § 7 (p. 14) : « Preferably, renal function should be expressed as GFR (ml/min), but if creatinine clearance (measured or estimated) has been used to estimate renal function in the pharmacokinetic study, this should be made clear in section 4.2. »
- Conséquence : les seuils des RCP anciens (en « ClCr », souvent Cockcroft-Gault) ne se transposent pas exactement en DFGe CKD-EPI. **NON VÉRIFIÉ** : l'ampleur de l'écart pour chaque antibiotique.

---

## 7. Exemples de référence indépendants (pour les tests unitaires)

Les valeurs « publiées ou affichées » proviennent d'une source externe (article ou calculateur officiel exécuté le 2026-11-05). La colonne « calcul maison » est mon propre calcul en Python avec les formules du §2. **Ce calcul n'est pas indépendant** ; il sert seulement à vérifier la concordance.

| # | Équation | Entrées | Valeur publiée ou affichée | Source externe | Calcul maison |
|---|---|---|---|---|---|
| A | Du Bois | 150 cm, 60 kg | **1,55 m²** | Du Bois 1916 (texte suivant l'abaque, fig. 2) : « if the man were 150 centimeters tall and weighed 60 kilograms, the approximate surface area would be 1.55 square meters. » (lecture sur abaque) | 1,548 |
| B | CKD-EPI 2021 | H, 50 ans, 1,2 mg/dL | **74** mL/min/1,73 m² | Calculateur NKF (kidney.org/professionals/gfr_calculator), « Standardized assays » = Yes | 73,67 |
| C | CKD-EPI 2021 désindexé | idem B + 175 cm, 70 kg, désindexation Du Bois activée | **79** mL/min | Calculateur NKF (option « Adjust eGFR for body surface area […] Dubois ») | SC 1,848 ; 78,70 |
| D | CKD-EPI 2021 | F, 70 ans, 0,9 mg/dL | **69** mL/min/1,73 m² | Calculateur NKF | 68,77 |
| E | CKD-EPI 2009 (sans race) | H, 50 ans, 1,2 mg/dL, race « White or Other (1) » | **70,09** | Calculateur MSD Manuals (EBMcalc, msdmanuals.com/iframe/manual/medical-calculators/gfr_ckd_epi.htm) | 70,09 |
| F | CKD-EPI 2009 (sans race) | F, 70 ans, 0,9 mg/dL | **64,78** | Calculateur MSD Manuals | 64,78 |
| G | EKFC | H, 50 ans, 1,2 mg/dL | **70,5** mL/min/1,73 m² | Calculateur EKFC (https://ekfccalculator.pages.dev/, « reference implementation for the EKFC equations », cité par Delanaye, diaporama 2025) | 70,51 avec Q = 80/88,4 ; **70,07 avec Q = 0,90** |
| H | EKFC | F, 70 ans, 80 µmol/L | **59,5** | Calculateur EKFC | 59,48 avec Q = 62 µmol/L ; 59,35 avec Q = 0,70 mg/dL |
| I | Cockcroft-Gault | H, 60 ans, 70 kg, 1,0 mg/dL | **77,78** mL/min | Calculateur MSD Manuals CG (CreatinineCl_CG-en.htm) | 77,78 |
| J | Cockcroft-Gault | F, 70 ans, 60 kg, 0,9 mg/dL | **55,09** mL/min | Calculateur MSD Manuals CG | 55,09 |

Remarques :
- Le calculateur NKF arrondit à l'entier, d'où une tolérance de ± 0,5 dans les tests B-D.
- Les exemples G et H montrent que l'implémentation de référence d'EKFC calcule en µmol/L avec Q = 80/62. Une application qui calcule en mg/dL avec Q = 0,90/0,70 s'écartera de ± 0,5 mL/min/1,73 m².
- Le site ekfccalculator.pages.dev n'affiche aucun éditeur. Il est cité par P. Delanaye (co-auteur EKFC) dans un diaporama de 2025 (orbi.uliege.be/bitstream/2268/338740), ce qui donne une confiance moyenne.
- **Introuvables** : exemple chiffré dans Inker 2021 (aucun dans l'article, supplément non lu), dans Levey 2009 (aucun) et dans Pottel 2021 (non lisible). Aucun exemple chiffré KDIGO ou HAS.

---

## 8. IRA et dialyse : ne pas individualiser la dose à partir de l'eGFR ou de CG

- **HAS, guide MRC p. 23-24** : pour un médicament à index thérapeutique étroit ou une créatinine non fiable, « l'adaptation des posologies devrait s'effectuer en milieu spécialisé à partir du dosage des médicaments ou de la mesure du DFG « vrai » du patient ». L'annexe 12 (liste des « marge étroite ») ne cite ni les aminosides ni la vancomycine.
- **KDIGO 2024, PP 4.2.5**, explication (S249) : « healthcare providers should regularly assess risk, benefits, and value of the medication, and consider higher or lower doses than indicated. Where possible, use medication level testing to guide dosing. »
- **KDIGO 2024, Table 10** (mGFR indiqué) : « drug dosing if there is a narrow therapeutic index or serious toxicity »
- **KDIGO AKI 2012, recommandation 3.8.3** : « We recommend monitoring aminoglycoside drug levels when treatment with multiple daily dosing is used for more than 24 hours. (1A) » ; recommandation 3.8.4 (2C) : surveiller au-delà de 48 h en dose unique journalière.
- **KDIGO AKI 2012** (aminosides) : « Single-dose daily regimens are difficult to apply in patients with pre-existing kidney disease, and patients with vacillating eGFR and hemodynamics, such as critically ill patients in the ICU setting. »
- **EMA § 6.2.4** : pour les médicaments à index étroit, se demander si un STP doit être recommandé. Pour la dialyse, l'EMA demande de préciser la dose et son moment par rapport à la séance.
- **FDA § V.C (p. 15)** : en EER continue, « dosing recommendations should be based on the intensity of the CRRT regimen ». Recommandations distinctes selon la modalité, et prise en compte de la fonction rénale résiduelle.
- **Matzke GR et al., KDIGO, Kidney Int 2011;80:1122-37** (dosage des médicaments en IRA et MRC) : **trouvée mais contenu non lisible** (abonnement ; seul le résumé a été lu, il ne contient pas de règle utilisable).
- Rappel (fiche 4.10) : SFPT/SFAR 2018 recommande la clairance mesurée U×V/P en réanimation ; les RCP donnent les règles de dose après la séance d'hémodialyse.

---

## 9. Synthèse pour l'application

**Équation(s) recommandée(s)**
- Exigence opposable en France : « CKD-EPI » (HAS, guide MRC 2023 et avis du 27/09/2023), **version non précisée**.
- Version par défaut défendable en France : **CKD-EPI 2009 sans coefficient racial**. Elle est explicitement recommandée en Europe par l'EFLM (2022, alignée sur l'ERA), validée par la KDIGO 2024 (Table 14) et plus exacte que 2021 chez les non-Noirs (KDIGO S188).
- Paramétrables : **CKD-EPI 2021** (NKF/ASN, KDIGO Table 14) et **EKFC** (KDIGO Table 14 ; EFLM « could be »).
- Afficher la version utilisée, comme l'exige la HAS pour les comptes rendus. **Décision à prendre par l'équipe**, les sources divergeant.

**Unités et conversion** : Scr µmol/L ÷ 88,4 → mg/dL. Pour EKFC, utiliser Q = 80 / 62 µmol/L pour reproduire le calculateur de référence.

**Surface corporelle** : Du Bois, SC (m²) = 0,007184 × poids réel^0,425 × taille(cm)^0,725 (HAS ; Du Bois 1916 ; NKF ; FDA cite Du Bois et Mosteller).

**Désindexation** : DFGe (mL/min) = DFGe (mL/min/1,73 m²) × SC / 1,73. Elle est à appliquer pour l'adaptation des doses quand la SC est éloignée de 1,73 m² (HAS, sans seuil chiffré), et surtout pour les antibiotiques à marge étroite (KDIGO PP 4.2.4). EMA et FDA fondent toute recommandation de dose sur des mL/min absolus. **Seuil d'« éloignement » : NON VÉRIFIÉ, aucun chiffre trouvé.**

**Cockcroft-Gault** : à fournir seulement comme repère « RCP » (les seuils des RCP anciens sont en ClCr), avec l'avertissement HAS « ne devrait plus être utilisée ». Poids : **divergence** (réel implicite / idéal ou ajusté si obésité selon FDA / maigre selon MSD), à laisser au choix explicite de l'utilisateur.

**Domaine de validité** : adulte ≥ 18 ans ; créatinine stable ; dosage enzymatique traçable IDMS. L'application doit signaler (sans bloquer, ou en bloquant selon le choix de l'équipe) : IRA ou créatinine instable, dialyse ou EER, grossesse, masse musculaire extrême (amputation, paraplégie, dénutrition, cachexie, cirrhose, culturisme, obésité de classe III), sujet très fragile, état catabolique ou infection grave (KDIGO Tables 8 et 10).

**Conduite par situation**
- MRC stable, poids standard : CKD-EPI indexé, ou désindexé si la SC est loin de 1,73.
- Poids extrême ou médicament à marge étroite : désindexer ; envisager eGFRcr-cys ou DFG mesuré (KDIGO PP 4.2.3-4.2.4) ; STP.
- IRA ou instabilité : ne pas individualiser la dose sur l'eGFR ni sur CG ; dosages des médicaments et/ou clairance mesurée ; avis spécialisé (HAS p. 23-24 ; KDIGO PP 4.2.5).
- Hémodialyse ou EER : schémas spécifiques du RCP ou spécialisés, plus STP (FDA § V.C ; EMA § 6.2.4 ; fiche 4.10).

**Restent NON VÉRIFIÉS**
1. Une position officielle datée de la SFNDT, de la SFBC ou de la Société Francophone de Néphrologie sur 2009, 2021 ou EKFC (introuvable).
2. L'équation réellement rendue par les laboratoires français (2009 sans race supposée).
3. L'article princeps EKFC (Pottel 2021) : coefficients lus seulement dans Stehlé 2023, reproduits par le calculateur.
4. Le poids utilisé dans l'article original de Cockcroft-Gault (texte intégral non lisible).
5. Le seuil chiffré de SC « éloignée de 1,73 m² » (HAS).
6. L'éditorial ERA (Gansevoort, NDT 2022) et Matzke/KDIGO 2011 : non lus.
7. Une règle explicite « eGFR non valide en dialyse » dans une recommandation lue.
8. Des exemples chiffrés publiés (et non issus de calculateurs) pour CKD-EPI 2009, CKD-EPI 2021, EKFC et CG.

---

## 10. URL consultées (2026-11-05)

| URL | Statut |
|---|---|
| has-sante.fr/upload/docs/application/pdf/2021-09/guide__mrc.pdf | consultée (contenu lu) |
| has-sante.fr/upload/docs/application/pdf/2023-09/ac_2023_0034_avis_rapport_albuminurie_creatininurie_mrc.pdf | consultée (contenu lu) |
| has-sante.fr/jcms/p_3288950/… et p_3289324/… (pages) | consultées ; PDF non lié depuis la page |
| kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf | consultée (contenu lu) |
| kdigo.org/wp-content/uploads/2016/10/KDIGO-2012-AKI-Guideline-English.pdf | consultée (contenu lu) |
| orbi.uliege.be/bitstream/2268/296790/1/DelanayeCCLM2022edito.pdf (EFLM) | consultée (contenu lu) |
| orbi.uliege.be/bitstream/2268/300897/1/Stehl%c3%a9NephrolTher2023.pdf | consultée (contenu lu) |
| orbi.uliege.be/bitstream/2268/338740/1/Delanaye%20Biologie%20Clinique%202025.pdf | consultée (contenu lu, diaporama) |
| pmc.ncbi.nlm.nih.gov/articles/PMC2763564 (Levey 2009) | consultée (contenu lu) |
| pmc.ncbi.nlm.nih.gov/articles/PMC8822996 (Inker 2021) | consultée (formule mal rendue, coefficients lus) |
| karger.com/nef/article/16/1/31/… (Cockcroft-Gault) | résumé lu ; texte intégral non lisible |
| zenodo.org/records/1423319/files/article.pdf (Du Bois 1916) | consultée (contenu lu, OCR) |
| Europe PMC : PMID 33166224 (Pottel 2021), 2520314 (Du Bois), 21918498 (Matzke 2011) | métadonnées lues |
| acpjournals.org/doi/10.7326/M20-4366 (Pottel 2021) | trouvée mais contenu non lisible (403) |
| fda.gov/media/78573/download (FDA 2024) | consultée (contenu lu) |
| ema.europa.eu/…/guideline-evaluation-pharmacokinetics-…-decreased-renal-function_en.pdf | consultée (contenu lu) |
| kidney.org/professionals/gfr_calculator | consultée, calculateur exécuté |
| ekfccalculator.pages.dev | consultée, calculateur exécuté |
| msdmanuals.com/…/gfr_ckd_epi.htm ; CreatinineCl_CG-en.htm | consultées, calculateurs exécutés |
| mdcalc.com/calc/43 | consultée (contenu lu) |
| Gansevoort RT et al., NDT 2022 (doi 10.1093/ndt/gfac254) | trouvée, non lue |
| Position officielle SFNDT / SFBC | introuvable |

---

## 11. Corrections après l'audit documentaire (2026-11-05)

- **HAS, guide p. 23-24** : le passage vise les médicaments à index thérapeutique étroit et les situations où la créatinine n'est pas fiable. Il ne nomme ni l'IRA ni l'instabilité. L'application l'étend à ces situations : c'est une interprétation, déclarée dans `docs/ARBITRAGES.md`. Les mentions des §0 et §9 qui l'attribuaient directement à la HAS sont à lire ainsi.
- **Grossesse (KDIGO 2024 § 4.2)** : p. S250, et non S249.
- **EMA** : le principe des doses en mL/min absolus figure p. 4 (§ 2), et non p. 3.
- **Cockcroft-Gault, RCP de la vancomycine** : la formule n'y est pas nommée ; elle est intitulée « eGFR ».
