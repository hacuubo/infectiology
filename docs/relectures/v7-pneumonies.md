# Relecture v7 — pneumonies (2026-11-07)

Deux relectures par des agents IA (développement ; sécurité de l'information clinique et conformité documentaire) du domaine fusionné en fcb6383, 43 constats, et la règle commune « foyer de domaine et hémoculture positive » décidée par l'intégrateur (7543585). Corrections faites sur 7543585. Elles ne remplacent pas une validation médicale.

Référence documentaire : `docs/sources/recherche-pneumonies.md`.

## Constats et suites données

| Niveau | Constat | Suite |
|---|---|---|
| Bloquant (1, 22) | Bactériémie à BGN avec pneumonie : aucune proposition (chaque règle renvoyait à l'autre). | Règle commune appliquée : avec un BGN dans les hémocultures, R-PNEUMONIE reste active (situation, probabiliste, durées) ; R-BACTERIEMIE-BGN pose l'indication. Une option dont aucune molécule n'est active sur le BGN isolé (résistance attendue CA-SFM/EUCAST ou R à l'antibiogramme) est écartée avec sa raison (amoxicilline et K. pneumoniae). Traitement documenté non modélisé : alerte, couverture partielle. Testé (K. pneumoniae, examen direct BGN en choc, PAVM à P. aeruginosa). |
| Bloquant (2, 22) | SCN sur une seule série (ou germe non identifié) : traitement de la pneumonie annulé. | Seuls S. aureus, streptocoque et entérocoque **identifiés** passent la main à la règle du germe. SCN, S. lugdunensis, CGP en amas ou en chaînettes non identifiés, « autre » : la pneumonie garde son traitement ; la conclusion SCN s'affiche en indication secondaire. Testé. |
| Bloquant (3, 21) | « Fausse route constatée » l'emportait sur un sepsis, un choc ou une bactériémie. | Avec sepsis, choc ou hémoculture positive (sauf SCN sur une série) : jamais « pas d'antibiothérapie ». Indication « urgence » (sepsis, choc) ou « informations insuffisantes », orientation demandée (bloquante), absence de schéma expliquée. Rappel de la définition de la pneumonie d'inhalation (diapo 3 : signes d'infection respiratoire basse + infiltrat nouveau) dans les deux cas. Testé. |
| Majeur (4) | Gravité non renseignée lue comme « non grave » (PAC, légionellose, inhalation) ; sepsis déclaré sans effet. | Hospitalisation sans réponse : situation « gravité à préciser », donnée bloquante (cible `details.pneumonie.grave`), schémas non grave et grave affichés chacun sous condition. Légionellose : gravité et immunodépression demandées, branches sous condition. Inhalation : lieu et gravité demandés, formes non grave et grave sous condition. Sepsis + « non grave » : alerte, couverture partielle. Testé. |
| Majeur (5, 24) | Soins critiques sans critère de gravité : impasse de saisie, posologies hors soins critiques, règle des 3/5/7 jours. | Situation propre : choix de la PAC hospitalisée non grave, posologies « en soins critiques » du tableau 10 (nouveaux régimes amoxicilline 2 g × 3/j et amoxicilline-acide clavulanique 1 ou 2 g × 3/j en brouillon, ceftriaxone 2 g, lévofloxacine 500-1 000 mg/j, spiramycine IV 3 MUI), durée non fixée. Question de comorbidité posée. Testé. |
| Majeur (6) | Ambulatoire avec sepsis : amoxicilline en 1re ligne, sortie « complète ». | Alerte (signes de gravité = critère d'hospitalisation, 2010), donnée bloquante « lieu à confirmer », schéma ambulatoire seulement sous condition. Testé. |
| Majeur (7) | PAC grave LPV avec S. aureus dans les hémocultures : le linézolide disparaissait. | SARM : linézolide en monothérapie en 1re ligne (SPILF 2025 p. 8-9), à côté des options de la bactériémie. Méticilline inconnue : linézolide conditionnel + alerte du schéma SASM (pénicilline M ou céfazoline + clindamycine ou rifampicine). SASM : alerte et avis. Testé. |
| Majeur (8) | CGP en chaînettes non identifiés : macrolide retiré avant documentation ; dose d'amoxicilline du pneumocoque ≠ tableau 10. | Germe non identifié : la pneumonie garde C3G + macrolide. Pneumocoque bactériémique : alerte sur la dose du tableau 10 (1 g × 3 / 2 g × 3 en soins critiques) et sur la désescalade. Testé. |
| Majeur (9) | Spiramycine IV en 1re ligne malgré un traitement allongeant le QT. | Interactions portées par le régime (nouveau champ `Regimen.interactionsPertinentes`) : forme IV « Contre-indiquée » (RCP IV §4.3, avec l'incohérence du §4.5 dite), forme orale « précaution d'emploi ». Le moteur écarte la spiramycine IV ; repli sur la clarithromycine IV (hors AMM, brouillon) dans la PAC grave, la PAC à risque de P. aeruginosa et la LPV ; alerte QT. Testé. |
| Majeur (10) | Motif « Aucune recommandation dédiée » affiché à côté d'options de 1re ligne (durée de la PAC grave). | `f.absence` retiré : la durée non fixée est dite dans le texte de durée. Test existant adapté (il vérifiait l'absence ; il vérifie maintenant le texte de durée). |
| Majeur (23) | Inhalation grave sans facteur de P. aeruginosa : amoxicilline-acide clavulanique en 1re ligne, 5 jours. | 1re ligne = schéma de la PAC grave (ERS/ESICM 2023 Q8 ; diapo 10), amoxicilline-acide clavulanique conditionnelle (brouillon, posologie soins critiques divergente), lévofloxacine si allergie, durée non fixée pour la forme grave. Testé. |
| Majeur (25) | Grossesse : clarithromycine/azithromycine en 1re ligne devant la spiramycine. | Grossesse déclarée : spiramycine en tête (atypique ambulatoire et hospitalisée, légionellose non grave), choix de l'application dit ; divergence RCP/CRAT affichée (statut « éviter » conservé avec les deux positions). Testé. |
| Majeur (26) | Azithromycine hors AMM en « vérifiée » ; avertissement « risque de résistance » du RCP absent. | Régimes d'azithromycine en brouillon ; avertissement du RCP §4.4 dans les régimes et les options. Voie SC de la ceftriaxone et cotrimoxazole de l'inhalation : « non rapprochés du RCP dans la note » écrit. Testé. |
| Majeur (27) | PAVM : gentamicine et vancomycine calculées sur un autre régime que la SFAR. | Régimes propres `gentamicine-pavm` (8 mg/kg/j) et `vancomycine-pavm` (15 mg/kg puis 30-40 mg/kg/j), brouillon, affichés sans calcul ; autres doses de la base dans les fourchettes SFAR (dites). Testé. |
| Majeur (28) | PAVM : monothérapie R3.2 appliquée sans ventilation et chez l'immunodéprimé ; précoce + BMR seul envoyée en colonne « tardive ». | Monothérapie conditionnelle hors ventilation (extrapolation dite) ou si l'immunodépression n'est pas exclue (donnée bloquante si inconnue). Question « facteur de risque » scindée (BGN non fermentant / BMR seul / aucun) ; précoce + BMR seul : cas non prévu par le protocole, schémas « tardive » sous condition, alerte et avis. Testé. |
| Majeur (29) | Corticoïdes : LPV post-grippale non exclue ; neutropénie inconnue non signalée. | Réserve « post-grippal » dans le geste ; donnée manquante (cible `patient.neutropenie`). Testé. |
| Majeur (30) / Mineur (13) | Note 1 de la règle des 3 jours incomplète ; comorbidités déjà saisies non déduites. | Antibiothérapie du mois (datée, sauf nitrofurantoïne, fosfomycine, pivmécillinam) et DFG estimé < 30 hors IRA/instabilité déduits ; DFG < 30 sort de la règle des 3 jours ; la réserve de la note 1 (dont insuffisance respiratoire chronique, non saisie) accompagne toujours « 3 jours ». Testé. |
| Mineur (11) | Pas de cible « Compléter ». | Cible `details.pneumonie.<id>` (ou `patient.…`) sur chaque donnée manquante du domaine. Testé. |
| Mineur (12, 32) | Questions posées mais jamais lues ; durée de l'atypique tranchée en silence. | Comorbidité non posée pour grippe/atypique ; facteur P. aeruginosa et SARM posés seulement pour l'inhalation grave ou de gravité inconnue ; stabilité lue par l'atypique ambulatoire : durée prévue retenue seulement si HAS et SPILF concordent, sinon divergence affichée sans durée prévue. Testé. |
| Mineur (14) / Documentaire (42) | Fluoroquinolone récente : simple alerte, sans date. | Fenêtre de 3 mois sur les dates saisies : ambulatoire (champ de la HAS) → lévofloxacine écartée ; ailleurs → conditionnelle ; date inconnue → conditionnelle. Testé. |
| Mineur (15) | PAVM avec choc et délai/facteur inconnus : colonne « choc » absente. | Colonnes « choc » et « tardive » affichées sous condition, pas la monothérapie. Testé. |
| Mineur (16) | Doublon de ceftriaxone (comorbidité inconnue). | Une seule option réunissant les deux indications. Testé. |
| Mineur (17, 34) | Céfotaxime 1 g × 3 inutilisé ; voie SC de la ceftriaxone ; lévofloxacine 500-1 000 tranchée à 1 000. | Régime inutilisé retiré ; modalités SC « non rapprochées du RCP » ; lévofloxacine sans fréquence stockée, fourchette « non tranchée ». Testé. |
| Mineur (18) | Données manquantes inutiles pendant une bactériémie à germe couvert. | Non émises quand la règle du germe donne les options. Testé. |
| Mineur (19) | Libellé brut « si traitement > 7 jours » → « Proposition incomplète ». | Durée non fixée par les sources : libellé « durée totale du traitement (non fixée…) », impact « affinerait ». Testé. |
| Mineur (20) | Tests manquants ou faibles. | 31 tests ajoutés (57 au total), chacun échouant sur 7543585 (vérifié en restaurant le code de base) ; test S. aureus renforcé (options de la bactériémie, linézolide), fausse route avec motif de sortie. |
| Mineur (33) | Grippe hospitalisée + allergie : C3G extrapolée sans le dire. | Brouillon et commentaire « extrapolation de la ligne sans comorbidité ». |
| Mineur (35) | Facteur « autre » de P. aeruginosa appliqué hors soins critiques. | Retenu seulement en soins critiques ; alerte sinon. Testé. |
| Mineur (36) | Réévaluation sourcée par l'Afssaps 2010 (remplacée). | Sources SPILF 2025 (H72) et diaporama seulement. Testé. |
| Mineur (37) | Spiramycine IV + lévofloxacine : incohérence du RCP non dite. | Dite dans l'interaction et dans les options de lévofloxacine. |
| Mineur (38) | Informations de sécurité des RCP absentes. | Ajouts : spiramycine–lévodopa, azithromycine–colchicine/digoxine/dabigatran, clarithromycine–rifampicine, linézolide (convulsions, tyramine, bactériémie sur cathéter à Gram négatif) ; alerte linézolide + vasopresseurs en cas de choc. |
| Mineur (39) | Paraphrases citées comme extraits du RCP. | Extrait verbatim (« + Rivaroxaban ») ou pas d'extrait (résumés de la note). |
| Mineur (40) | Allergie, PAC ambulatoire sans comorbidité : alerte « urgence ». | L'option habituelle est conditionnelle dès la saisie de l'allergie : alerte « attention » (pristinamycine hors base) seulement. Testé. |
| Documentaire (41) | PERIMETRE présentait la fausse route et les bactériémies comme couvertes. | PERIMETRE mis à jour après correction. |
| Documentaire (43) | « Associé aux soins » pour un résident d'EHPAD → « hors réanimation : aucune recommandation ». | Aide de la question du lieu de survenue, alerte du parcours hors réanimation et description de « contexte à préciser » : une pneumonie acquise hors de l'hôpital ou dans les 48 premières heures est communautaire. Testé. |

## Non corrigé, à l'appréciation du médecin

- **Statut des options issues des seuls diaporamas** (légionellose SPILF 2026, inhalation SPILF/SFGG 2025 ; point 31) : laissées « vérifiées par IA », sourcées ; la décision de les garder ainsi relève d'un humain.
- **Saisie de QT long, hypokaliémie, colchicine, IMAO, vasopresseurs** (point 38) : pas de nouveaux champs (types et saisie partagés) ; ces interactions sont des lignes de surveillance conditionnelles et le choc déclenche l'alerte linézolide + vasopresseurs.
- **Aide de la question « contexte » (saisie partagée)** et texte de R-TERRAIN-GROSSESSE (« contrôlée selon le CRAT », autre domaine) : non modifiés ; le domaine affiche ses propres précisions.
- **Doublons avec les règles de bactériémie** : CGP en chaînettes non identifiés → options de R-BACTERIEMIE-STREPTOCOQUE (amoxicilline IV, brouillon) à côté de C3G + macrolide ; CGP en amas → options probabilistes de R-BACTERIEMIE-S-AUREUS à côté de celles de la pneumonie. À arbitrer dans ces règles (non modifiées).
- **Amoxicilline-acide clavulanique 1 g × 3 dans la PAVM** (« 3 à 6 g/j » SFAR) et céfépime/méropénème : doses de la base dans la fourchette SFAR, dites en commentaire, non dupliquées en régimes.

## Fichiers partagés modifiés

- `src/clinical/types.ts` : `Regimen.interactionsPertinentes` (optionnel).
- `src/engine/posologie.ts` : une interaction du régime remplace celle de la molécule pour le même traitement associé.
- `src/clinical/molecules/betalactamines.ts`, `divers.ts`, `aminosides-glycopeptides.ts` : régimes de pneumonie seulement (ajouts, retrait de `cefotaxime-pac-1g8h`).
- `docs/PERIMETRE.md`.

## Vérifications

- `npx tsc --noEmit` : réussi.
- `npx vitest run` : 23 fichiers, 412 tests réussis, dont 57 pour les pneumonies (31 nouveaux, échouant tous sur 7543585 avant correction).
