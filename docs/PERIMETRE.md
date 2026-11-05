# Périmètre de la version 2026.11.0-brouillon

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
| Surveillance et STP intégrés : aminosides, vancomycine, daptomycine, bêta-lactamines en soins critiques, rifampicine, fluoroquinolones, cotrimoxazole | base des molécules | ANSM 2011, RCP, Rybak 2020, SPILF/SFPT/CA-SFM 2026, SFPT/SFAR 2018, Abdul-Aziz 2020 |

## Partiellement couvert (règles en brouillon ou avis spécialisé requis)

- **Bactériémie à BGN sans foyer, probabiliste** : aucune recommandation dédiée trouvée ; options conditionnelles en **brouillon**, extrapolées des IU graves.
- **Staphylocoques à coagulase négative** : pas de recommandation dédiée aux critères contamination/infection ; choix de molécule en brouillon. La conduite « 1 seule série → refaire les hémocultures » est sourcée (IDSA 2009, rec. 38).
- **S. aureus avant la sensibilité à la méticilline** : choix probabiliste non tranché par les sources lues (brouillon).
- **Infection ostéoarticulaire sur matériel** : recommandations SPILF 2026 présentées aux JNI, publication finale non localisée ; schéma probabiliste en brouillon.
- **P. aeruginosa** documenté : forte posologie uniquement, avis spécialisé.
- **Grossesse, immunodépression** : statut molécule par molécule (CRAT) mais pas de schéma dédié ; l'IU de l'homme immunodéprimé est hors du champ SPILF 2026 (brouillon).
- **Bloqués en brouillon par l'audit documentaire** : daptomycine seule dans l'endocardite à SARM (les sources la recommandent en association), molécules des bactériémies à streptocoque hors endocardite (extrapolées), vancomycine pour allergie dans les bactériémies à entérocoque, aztréonam dans l'IU associée aux soins.
- **Statut grossesse non vérifié** : imipénème, rifampicine, daptomycine, témocilline, aztréonam, méropénème.

## Non couvert (avis spécialisé, aucune proposition)

- Pédiatrie.
- Neutropénie fébrile (ECIL-4 : avis immédiat).
- Entérobactéries productrices de carbapénémase, ERV.
- Foyers pulmonaires, digestifs, cutanés, ostéoarticulaires sans matériel (hors bactériémie couverte).
- Endocardites à BGN, champignons, germes intracellulaires.
- Candidémies.

## Limites connues

- Les doses affichées en insuffisance rénale sont des **doses de référence** accompagnées du palier du RCP : la dose ajustée n'est pas recalculée automatiquement.
- Les taux de réactivité croisée entre bêta-lactamines (chaînes latérales) n'ont pas pu être vérifiés (tableaux SPILF en image).
- La fréquence de la créatininémie sous vancomycine ou aminosides n'est chiffrée par aucune source française lue.
- Le moment du premier dosage de vancomycine en perfusion continue n'est pas fixé par les sources françaises.
- La position exacte de la résiduelle d'aminoside par rapport à la dose suivante vient du position paper Abdul-Aziz 2020, pas de l'ANSM.
- L'analyse des allergies n'exploite pas encore le délai depuis la réaction (≤ 5 ans / > 5 ans) qui oriente la stratification SPILF 2026.
- Une dose n > 1 n'est jamais datée dans la frise : l'intervalle réel entre doses dépend de la fonction rénale et des dosages.
- Poids de référence des aminosides : poids idéal de Lorentz (RCP gentamicine) + 0,43 × surcharge (gentamicine) ou + 40 % de l'excédent (amikacine). Le RCP amikacine ne précise pas la formule du poids idéal ; Lorentz est retenu par cohérence.
- La HAS (2023) demande d'adapter les posologies avec CKD-EPI alors que les RCP sont établis en Cockcroft-Gault : l'application utilise Cockcroft quand le poids est connu et affiche toujours la méthode et ses limites.
