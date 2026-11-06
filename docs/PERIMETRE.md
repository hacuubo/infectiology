# Périmètre de la version 2026.11.2-brouillon

Population : **adulte uniquement**. Toute saisie d'un âge inférieur à 18 ans bloque les propositions. Les règles adultes ne sont pas transposées à la pédiatrie.

## Couvert (règles sourcées, statut « vérifiée par IA »)

| Situation | Règle | Sources principales |
|---|---|---|
| Infection urinaire fébrile de la femme (PNA simple, à risque, grave), avec ou sans bactériémie | `R-IU-FEBRILE` | SPILF 2015/2018, HAS 2021, EAU 2026 |
| Infection urinaire masculine communautaire | `R-IU-FEBRILE` | SPILF 2026 (diaporama officiel, article non lisible) |
| Infection urinaire associée aux soins / sur sonde | `R-IU-FEBRILE` | SPILF/AFU/SF2H 2015 |
| BGN documenté avec antibiogramme (lecture interprétative BLSE, céphalosporinase, carbapénémase, catégorie I) | `R-IU-FEBRILE`, `R-BACTERIEMIE-BGN` | CA-SFM 2026, EUCAST v16.1, SPILF 2023 (d'après ESCMID 2022) |
| Bactériémie à S. aureus : stratification, hémocultures de contrôle, échographie, durée | `R-BACTERIEMIE-S-AUREUS` | IDSA/ESCMID 2026 |
| Bactériémie à S. aureus : molécules SASM/SARM | `R-BACTERIEMIE-S-AUREUS` | ESC 2023, SPILF 2025, IDSA 2011 (archivée) |
| Streptocoques et entérocoques hors endocardite | `R-BACTERIEMIE-STREPTOCOQUE`, `R-BACTERIEMIE-ENTEROCOQUE` | SPILF/GPIP 2021, ESC 2023, IDSA 2009 |
| Endocardite (staphylocoques, streptocoques, entérocoques ; probabiliste) | `R-ENDOCARDITE` | ESC 2023, SPILF/AEPEI 2025 |
| Infection liée au cathéter | `R-INFECTION-CATHETER` | IDSA 2009, SRLF 2020, SPILF 2021 |
| Gravité, réévaluation, persistance des hémocultures, colonisation urinaire | règles transversales | SSC 2026, HAS 2008/2025, SRLF 2020 |
| Indication devant un ECBU positif : infection, colonisation, contamination possible, situation indéterminée ; signes non spécifiques du sujet âgé ; porteur de sonde ; exceptions grossesse et gestes urologiques (liste AFU 2026) | `R-INDICATION-ECBU` | SPILF 2015 (texte court et argumentaire), SPILF 2026, IUAS 2015, AFU/CIAFU 2026, IDSA 2019, HAS (femme enceinte) |
| Sepsis sans foyer ni germe identifié : urgence, sans proposition de molécule | `R-SEPSIS-FOYER-INCONNU` | SSC 2026, HAS 2025 |
| Infection à C. difficile : qui tester, pas de test ni de traitement sans diarrhée (test positif = portage), pas de test de guérison ; 1er épisode avec ou sans facteur de risque de récidive, forme grave, 1re récidive, récidives multiples (puis TMF : avis), grossesse ; mesures associées (inducteur, IPP, ralentisseurs, précautions contact, mains, bionettoyage) en gestes ; fidaxomicine et vancomycine orale (molécule distincte de la vancomycine IV) | `R-CDIFF` | SPILF 2026 (JNI) et 2022, ESCMID 2021 et 2016, IDSA/SHEA 2017 et 2021, HCSP 2008, RCP |
| Prélèvement superficiel positif : pas d'antibiotique sans signe clinique d'infection | `R-PRELEVEMENT-SUPERFICIEL` | HAS/SPILF/SFD 2019, IWGDF/IDSA 2023 |
| Hémocultures : S. aureus jamais traité comme contaminant ; SCN sur une seule série → refaire les hémocultures | `R-BACTERIEMIE-S-AUREUS`, `R-BACTERIEMIE-SCN` | IDSA/ESCMID 2026 (Table 1), IDSA 2009 rec. 38, Doern 2019 |
| Antibiogramme guidé : questions par famille de germes, mécanismes rapportés, résistances attendues lues R, phénotypes inhabituels et résultats contradictoires signalés, molécules sensibles mais non pertinentes | `src/clinical/microbiologie/` | CA-SFM 2026, EUCAST v16.1, EUCAST phénotypes attendus et inhabituels, EUCAST détection v2.01 |
| Fonction rénale : DFG estimé indexé (CKD-EPI 2009 sans coefficient racial par défaut ; 2021 ou EKFC au choix), DFG désindexé (Du Bois), clairance de Cockcroft-Gault ; valeur du laboratoire conservée à part ; choix de l'estimation selon la référence de chaque molécule | `src/calc/renal.ts`, `src/clinical/molecules/reference-renale.ts` | HAS 2023 (MRC), KDIGO 2024, EFLM 2022, Levey 2009, Inker 2021, Du Bois 1916, RCP, FDA 2024, EMA 2015 |
| Explication de toute absence de proposition complète : non indiquée, informations manquantes, microbiologie insuffisante, situation non couverte, contraintes, règle non validée, données incohérentes, erreur technique | `src/engine/sortie.ts` | issue des règles évaluées (aucun texte rédigé après coup) |
| Surveillance et STP intégrés : aminosides, vancomycine, daptomycine, bêta-lactamines en soins critiques, rifampicine, fluoroquinolones, cotrimoxazole | base des molécules | ANSM 2011, RCP, Rybak 2020, SPILF/SFPT/CA-SFM 2026, SFPT/SFAR 2018, Abdul-Aziz 2020 |

## Partiellement couvert (règles en brouillon ou avis spécialisé requis)

- **Bactériémie à BGN sans foyer, probabiliste** : aucune recommandation dédiée trouvée. Depuis le 2026-11-06, l'application **ne propose plus de schéma extrapolé** : elle explique l'absence (« Aucune recommandation dédiée : pas de proposition automatisée »), garde l'indication de traiter, la recherche du foyer et l'avis du SMIT. Avec un foyer connu ou un antibiogramme, les règles du foyer et le traitement documenté s'appliquent.
- **Staphylocoques à coagulase négative** : pas de recommandation dédiée aux critères contamination/infection ; choix de molécule non tranché : depuis le 2026-11-06, l'absence est expliquée (pas de céfazoline extrapolée) ; seule la vancomycine probabiliste d'une infection liée au cathéter reste proposée (SRLF 2020 R3.11, brouillon). La conduite « 1 seule série → refaire les hémocultures » est sourcée (IDSA 2009, rec. 38).
- **S. aureus avant la sensibilité à la méticilline** : choix probabiliste non tranché par les sources lues (brouillon).
- **Infection ostéoarticulaire sur matériel** : recommandations SPILF 2026 présentées aux JNI, publication finale non localisée ; schéma probabiliste en brouillon.
- **P. aeruginosa** documenté : forte posologie uniquement, avis spécialisé.
- **Grossesse, immunodépression** : statut molécule par molécule (CRAT) mais pas de schéma dédié ; l'IU de l'homme immunodéprimé est hors du champ SPILF 2026 (brouillon).
- **Bloqués en brouillon par l'audit documentaire** : daptomycine seule dans l'endocardite à SARM (les sources la recommandent en association), molécules des bactériémies à streptocoque hors endocardite (extrapolées), vancomycine pour allergie dans les bactériémies à entérocoque, aztréonam dans l'IU associée aux soins.
- **Indication, situations en brouillon** :
  - fièvre sans signe urinaire ni autre foyer avec bactériurie : IDSA 2019 (remarque) et SPILF 2026 divergent ; avis SMIT, spectre non modélisé ;
  - changement de sonde JJ ou de néphrostomie : zone grise dans le texte AFU 2026.
- **Cystite, colonisation gravidique, colonisation avant geste** : l'indication est sourcée, mais les molécules de 1re intention (fosfomycine-trométamol, pivmécillinam, nitrofurantoïne, triméthoprime) ne sont pas dans la base. Seule l'amoxicilline est proposée pendant la grossesse si la souche est sensible.
- **Infection à C. difficile, points en brouillon ou avis** : forme fulminante (IDSA 2017 vancomycine 500 mg × 4/j + métronidazole IV vs ESCMID 2021/SPILF 2022 125 mg × 4/j ou fidaxomicine : non tranché, options conditionnelles), voie orale impossible (vancomycine intraluminale), 1re récidive après fidaxomicine, seuil d'âge 65 ans (> 65 vs ≥ 65), profil GDH/TAAN+ toxines−, durée des précautions contact ; fidaxomicine indisponible chez le patient à haut risque → avis. Bezlotoxumab (AMM abrogée le 20/10/2026), tigécycline, rifaximine et modalités de la TMF non modélisés ; métronidazole cité en commentaire seulement.
- **Prélèvements polymicrobiens** : chaque antibiogramme reste rattaché à son isolat, mais les propositions ne portent que sur le germe principal (alerte affichée).
- **Statut grossesse non vérifié** : imipénème, rifampicine, daptomycine, témocilline, aztréonam, méropénème.

## Non couvert (avis spécialisé, aucune proposition)

- Pédiatrie.
- Neutropénie fébrile (ECIL-4 : avis immédiat).
- Entérobactéries productrices de carbapénémase, ERV.
- Foyers pulmonaires, digestifs, cutanés, ostéoarticulaires sans matériel (hors bactériémie couverte).
- Endocardites à BGN, champignons, germes intracellulaires.
- Candidémies.
- Prélèvements respiratoires ; infection cutanée cliniquement avérée (indication posée, molécule non modélisée).
- Transplanté rénal de moins d'un mois avec bactériurie (aucune recommandation, IDSA 2019) ; ce terrain n'est pas saisi dans l'application.

## Limites connues

- Les doses affichées en insuffisance rénale sont des **doses de référence** accompagnées du palier du RCP : la dose ajustée n'est pas recalculée automatiquement.
- Les taux de réactivité croisée entre bêta-lactamines (chaînes latérales) n'ont pas pu être vérifiés (tableaux SPILF en image).
- La fréquence de la créatininémie sous vancomycine ou aminosides n'est chiffrée par aucune source française lue.
- Le moment du premier dosage de vancomycine en perfusion continue n'est pas fixé par les sources françaises.
- La position exacte de la résiduelle d'aminoside par rapport à la dose suivante vient du position paper Abdul-Aziz 2020, pas de l'ANSM.
- L'analyse des allergies n'exploite pas encore le délai depuis la réaction (≤ 5 ans / > 5 ans) qui oriente la stratification SPILF 2026.
- Une dose n > 1 n'est jamais datée dans la frise : l'intervalle réel entre doses dépend de la fonction rénale et des dosages.
- Poids de référence des aminosides : poids idéal de Lorentz (RCP gentamicine) + 0,43 × surcharge (gentamicine) ou + 40 % de l'excédent (amikacine). Le RCP amikacine ne précise pas la formule du poids idéal ; Lorentz est retenu par cohérence.
- La HAS (2023) demande d'adapter les posologies avec CKD-EPI alors que certains RCP citent Cockcroft-Gault : l'estimation est choisie molécule par molécule (voir ARBITRAGES) et toujours affichée avec sa raison.
- Fonction rénale : pas de cystatine C ni de DFG mesuré ; EKFC non calculé avant 25 ans (Q dépend de l'âge) ; pas de seuil chiffré de désindexation ; en IRA, instabilité ou dialyse, aucune adaptation automatique (avis spécialisé).
- Les paliers de la ciprofloxacine sont ceux de la forme IV (mL/min/1,73 m²) ; ceux de la forme orale n'ont pas été lus.
- Les équations sont celles de l'adulte ; la grossesse, l'infection grave et les masses musculaires extrêmes sont signalées comme limites (KDIGO 2024), sans correction.
