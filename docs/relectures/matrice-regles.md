# Matrice d'audit des règles et de la base des molécules — relecteur 2 (2026-11-05)

Légende — **Vérifié dans la source originale** : *oui* = valeur lue dans la source (extrait de la fiche du 2026-11-04 ou relecture du 2026-11-05, marquée « R2 ») ; *partiel* = une partie de l'élément seulement, ou source dérivée (diaporama, résumé) ; *non* = non lu (source non lisible, introuvable ou choix de l'application).
**Verdict** : *conforme* / *corrigé* (valeur, extrait, repère ou attribution modifiés) / *bloqué* (passé en `brouillon`) / *débloqué* (`brouillon` → `verifiee_ia` après lecture) / *maintenu brouillon*.
Abréviations : T = Recommendation Table (ESC 2023) ; Ann. 9 = SPILF/SFPT/CA-SFM, posologies standard et fortes (CA-SFM 2026, valeurs lues dans la v2025 p. 158-172).

## A. Règles

| Identifiant | Objet | Source(s) + repère | Vérifié | Verdict | Commentaire |
|---|---|---|---|---|---|
| R-PERIMETRE-PEDIATRIE | < 18 ans : aucune proposition | — (choix de périmètre) | n.a. | conforme | Pas de source requise. |
| R-GRAVITE-SEPSIS | délai 1 h / 3 h, hémocultures, source < 6 h, avis réa | SSC 2026 (page SCCM) ; Sepsis-3 Box 3 ; HAS 2025 (page) | oui (page SCCM ; article non lu) | corrigé | Avis réanimation « si dysfonction persistante » : source HAS ajoutée (admission en soins critiques si non-résolution). Numéros de recommandation SSC 2026 non visibles. |
| R-TERRAIN-IMMUNODEPRESSION | neutropénie → hors périmètre, avis immédiat | ECIL-4 (abstract) | partiel | conforme | ECIL-4 de vigueur incertaine ; utilisé seulement pour orienter vers l'avis. |
| R-TERRAIN-GROSSESSE | vigilance, avis obstétrical | SPILF 2015 p. 33-35 ; SPILF 2018 p. 339-340 | oui | conforme | |
| R-ALLERGIE-BETALACTAMINES | exclusions selon type de réaction | SPILF 2026 diapo 2-4, 7-8 ; JNI 2024 | partiel (tableaux en image ; ESCMID 2026 non lisible) | conforme (règle) | Écarts du moteur (délai ≤ 5 ans, retardée non grave récente) : rapport §4.8. |
| R-DONNEES-ESSENTIELLES | données manquantes | — | n.a. | conforme | |
| R-REEVALUATION-48-72H | réévaluation H24-H72 | HAS 2025 certification 2.4-02 p. 110 ; HAS 2008 ch. 2.1 ; SSC 2026 | oui | conforme | |
| R-HEMOCULTURES-PERSISTANTES | persistance > 3 j, ETO | SRLF 2020 R3.3a/b (info-antibio 2019) | oui | conforme | |
| R-COLONISATION-URINAIRE | ne pas traiter | SPILF 2015 p. 7 ; IDSA 2019 ; SPILF 2026 diapo 5 | oui | conforme | |
| R-SYNDROME-NON-COUVERT | foyers non modélisés | — | n.a. | conforme | |
| R-IU-FEBRILE — cadres | femme SPILF 2015/2018, homme SPILF 2026, IUAS 2015 | voir fiches | oui | corrigé + bloqué | Homme immunodéprimé (hors SPILF 2026) → règle en brouillon + alerte. |
| R-IU-FEBRILE — facteurs de risque | IU à risque de complication | SPILF 2015 p. 6 (R2 : PDF relu) | oui | corrigé | Ajout immunodépression, grossesse, IRC < 30 mL/min ; donnée manquante pour anomalie urologique/fragilité (seul > 75 ans était pris en compte). |
| R-IU-FEBRILE — probabiliste non grave | C3G (femme/homme) ; pip-tazo ou C3G (IUAS) ; FQ alternative | SPILF 2015 p. 19-22 ; SPILF 2026 diapo 14 ; IUAS R.45 ; HAS 2021 | oui | conforme | Divergence : HAS 2021/SPILF 2018 placent la FQ en 1re intention pour la PNA simple (rapport §6.10). |
| R-IU-FEBRILE — probabiliste sepsis | C3G forte dose + amikacine ; IUAS : pip-tazo + amikacine | SPILF 2015 p. 22-23 ; SPILF 2018 p. 336-337 ; SPILF 2026 diapo 15, 22 ; IUAS R.47 | oui | conforme | |
| R-IU-FEBRILE — antécédent BLSE < 6 mois + sepsis | carbapénème + amikacine | SPILF 2015 p. 23 ; IUAS R.47 | oui | corrigé | Étendu au cadre IUAS (proposait pip-tazo + amikacine, contraire à R.47). |
| R-IU-FEBRILE — choc + FdR | méropénème 2 g/8 h + amikacine | SPILF 2026 diapo 15, 22 ; SPILF 2015 p. 23 ; IUAS R.47 | oui | corrigé (source) | Source IUAS R.47 ajoutée pour le cadre IUAS. Définitions des FdR divergentes (6 vs 3 mois). |
| R-IU-FEBRILE — allergie à toutes les BL | aztréonam ± amikacine ; FQ ± amikacine | SPILF 2015 annexe 1 ; SPILF 2026 diapo 28-29 ; IUAS R.45 | oui | corrigé + bloqué | Homme : FQ en 1re ligne (SPILF 2026), aztréonam alternative ; IUAS : aztréonam en brouillon (R.45 = aminosides). |
| R-IU-FEBRILE — contrôles | ECBU avant ATB ; hémocultures si grave ; HC de contrôle non systématiques ; ECBU de contrôle non | SPILF 2026 diapo 6 ; SPILF 2015 p. 18-23 ; IUAS R.55 ; SRLF R3.2 | oui | corrigé (sources) | Extrait EAU (hémocultures initiales) remplacé par SPILF 2015 (bactériémie sans impact) ; « absence de recommandation » explicitée. |
| R-IU-FEBRILE — imagerie | uroscanner ≤ 24 h (à risque/grave) ; scanner 48-72 h (homme) | SPILF 2015 p. 21-23 ; SPILF 2026 diapo 20 | oui | conforme | |
| R-IU-FEBRILE — gestes | obstacle, rétention, sonde (24 h vs EAU avant) | SPILF 2015 ; SPILF 2018 p. 335 ; IUAS R.56-57 ; EAU 3.8.4 | oui | conforme | Divergence sonde affichée. |
| R-IU-FEBRILE — durées | PNA 7/10 j ; à risque 10 j ; homme 7/10/14 j ; IUAS 10/14 j | SPILF 2018 p. 335-337 ; SPILF 2026 diapo 18, 25 ; Info-antibio 109 ; IUAS R.51-54 | oui | conforme | Homme : `dureePrevueJours` 14 par défaut (forme clinique non demandée) — à traiter (rapport §8). |
| R-IU-FEBRILE — documenté BGN | voir `documenterBGN` (lignes suivantes) | | | | |
| documenterBGN — EPC | hors périmètre, avis | SPILF 2023 diapo 11 ; HCSP 2019 | oui | conforme | |
| documenterBGN — P. aeruginosa | pip-tazo/céfépime forte posologie ; relais cipro | Ann. 9 (forte posologie uniquement) ; IUAS R.49 | oui | corrigé | Option « ciprofloxacine 500 mg × 2 » retirée (souche sauvage I, forte posologie uniquement) → alerte. |
| documenterBGN — céphalosporinase / groupe 3 | céfépime | CA-SFM 2026 ch. 5.1 ; SPILF 2023 diapo 10 | oui | conforme | |
| documenterBGN — BLSE | carbapénème si grave/non urinaire ; témocilline, pip-tazo, céfoxitine si urinaire | SPILF 2023 diapo 5-6 ; SPILF 2026 diapo 17, 24 | oui | corrigé | Pip-tazo rendue I → forte posologie (4 g/6 h en 3 h). |
| documenterBGN — cas général | amoxicilline, C3G | SPILF 2015 p. 19 ; SPILF 2018 p. 336 ; IUAS R.49 | oui | corrigé | C3G rendue I → ceftriaxone **2 g/12 h** (2 g/24 h = standard). |
| documenterBGN — relais oraux | amox, SMX-TMP, amox-clav, cipro, céfixime | SPILF 2026 diapo 23-24 ; HAS 2021 ; Ann. 9 p. 168, 172 | oui | corrigé | Cipro et SMX-TMP à posologie standard réservés aux souches S ; alerte de forte posologie si I. |
| R-BACTERIEMIE-BGN — documenté et durée | 7 j ; contrôle de la source ; HC non systématiques | SPILF/GPIP 2021 diapo 21 ; SRLF 2020 R3.13 ; SSC 2026 | oui (diaporama) | conforme | BALANCE cité comme contexte seulement. Point de départ non précisé par la source (affiché). |
| R-BACTERIEMIE-BGN — probabiliste | 4 options conditionnelles | aucune recommandation dédiée (extrapolation) | non | maintenu brouillon | Conforme au principe : ne pas débloquer sans recommandation. |
| R-BACTERIEMIE-S-AUREUS — stratification, HC, écho, TEP, durée | risque faible/accru ; ≥ 2 séries à H48 puis /24-48 h ; ETT tous ; ETO si critère ; 14 j dès clairance | IDSA/ESCMID 2026 CS1-CS7 (Exec. Summary, CS1, CS2, CS6, CS7 lus ; CS3-5 via page HTML) | oui / partiel (CS3-5) | conforme | |
| R-BACTERIEMIE-S-AUREUS — SASM | céfazoline (1re), cloxacilline (alt.) | ESC 2023 T8 ; SPILF 2025 (Tattevin) | partiel (support de cours) | corrigé (commentaire) | Rang 1 de la céfazoline = choix de l'application (sources à égalité). |
| R-BACTERIEMIE-S-AUREUS — SARM | vancomycine (continu ; discontinu si HD), daptomycine | IDSA 2011 rec. 19 (archivée) ; ESC 2023 T8 | partiel (source archivée) | conforme | IDSA/ESCMID 2026 Partie 2 attendue. |
| R-BACTERIEMIE-S-AUREUS — probabiliste avant méticilline | vancomycine / céfazoline | aucune source dédiée | non | maintenu brouillon | |
| R-BACTERIEMIE-SCN | 1 série → refaire HC ; ≥ 2 séries → vraie probable ; verrou ; durées | IDSA 2009 rec. 38, 75 ; SRLF 2019/2020 ; SPILF 2021 diapo 19-20 ; SPILF verrou 2021 | oui (diaporamas) | conforme / corrigé | Molécule maintenue en brouillon. *S. lugdunensis* : traitement dès 1 série signalé comme choix non sourcé. |
| R-BACTERIEMIE-STREPTOCOQUE | amoxicilline, ceftriaxone ; écho ; coloscopie ; 7 j | SPILF/GPIP 2021 diapo 21 (durée) ; ESC 2023 T5, T7 ; CA-SFM ch. 5.10 | partiel | **bloqué** | Molécule extrapolée (aucune recommandation de bactériémie hors EI) → options en brouillon. Coloscopie = mention de texte ESC (non graduée). |
| R-BACTERIEMIE-ENTEROCOQUE | amoxicilline ; vancomycine si R ; écho E. faecalis ; ETO si persistance ; 7 j | IDSA 2009 rec. 91, 93 ; SPILF 2021 ; ESC T5 ; SRLF R3.3a | oui | conforme / **bloqué** (allergie) | `entero-vanco-allergie` en brouillon (rec. 91 = résistance, pas allergie). |
| R-ENDOCARDITE — HC, écho, chirurgie, DECI | ≥ 3 séries ; contrôle J3 ; ETT/ETO, 5-7 j, fin de traitement ; chirurgie < 24 h / 3-5 j ; extraction DECI | ESC 2023 5.3.1, T5, T12, T20 ; SPILF/AEPEI diapo 14 | oui | conforme | |
| R-ENDOCARDITE — probabiliste NVE / prothèse tardive | amoxicilline + céfazoline (+ gentamicine si sepsis) | SPILF/AEPEI diapo 6 ; ESC T10 | oui (diaporama) | corrigé | Gentamicine **5 mg/kg/j** (SPILF/AEPEI) au lieu de 3. |
| R-ENDOCARDITE — probabiliste prothèse précoce | daptomycine + céfépime | SPILF/AEPEI diapo 7 ; ESC T10 | oui | conforme | Daptomycine affichée 10 mg/kg (SPILF : 12). |
| R-ENDOCARDITE — staphylocoque SASM | céfazoline / cloxacilline (± rifampicine + gentamicine si prothèse) | ESC T8 ; SPILF/AEPEI diapo 13-16 | oui | conforme | Durées et divergences affichées. |
| R-ENDOCARDITE — staphylocoque SARM | daptomycine seule (1re) ; vancomycine (alt.) | SPILF/AEPEI diapo 13 (en association) ; ESC T8 (vanco I B ; dapto IIb C en association) | oui | **bloqué** (`ei-staph` SARM) | Monothérapie non recommandée ; partenaires (ceftaroline, fosfomycine) absents. |
| R-ENDOCARDITE — streptocoque | amoxicilline (CMI) ; ceftriaxone | ESC T7 ; SPILF/AEPEI diapo 8-9 | oui | conforme | CMI requise (`bloque_dose`). |
| R-ENDOCARDITE — entérocoque | amox + ceftriaxone (E. faecalis) ; vanco + genta (E. faecium) | ESC T9 ; SPILF/AEPEI diapo 10-11 | oui | conforme | |
| R-INFECTION-CATHETER | DTP ≥ 2 h ; retrait ; verrou 10 j ; HC J4/J11 ; retrait si HC+ à 72 h ; durées | IDSA 2009 rec. 19, 31-33 ; SPILF verrou 2021 ; SPILF 2021 diapo 19-20 ; IDSA/ESCMID 2026 définitions | oui | conforme | |
| R-IOA-MATERIEL | avis CRIOAc ; prélèvements ; SYLAC ; probabiliste dapto + pip-tazo | SPILF 2026 JNI (incertain) ; EBJIS 2025 ; HAS 2014 | partiel | maintenu brouillon (option) | Publication SPILF 2026 introuvable. |
| R-MATERIEL-INTRACARDIAQUE-BACTERIEMIE | ETO si persistance ; HC à 72 h ; avis | SRLF R3.3b ; ESC T12, T20 | oui | conforme | |

## B. Molécules — régimes, adaptation rénale, surveillance, STP, grossesse

| Identifiant | Objet | Source(s) + repère | Vérifié | Verdict | Commentaire |
|---|---|---|---|---|---|
| amikacine-30-du | 30 mg/kg DUJ, perfusion 30 min, association | SPILF 2026 diapo 14-15 ; SPILF 2015 annexe 1 ; Ann. 9 ; ANSM 2011 p. 5-6 ; RCP §4.2 | oui | corrigé (remarque) | Plafond RCP 1,5 g/j dépassé ; poids ajusté (RCP : idéal + 40 %) ; seuil 1,25 = choix. |
| amikacine-15-mono | 15 mg/kg monothérapie | SPILF 2015 annexe 1 ; ANSM 2011 p. 5 | oui | conforme | Divergence 25-30 mg/kg affichée. |
| amikacine — adaptation rénale | dose pleine, espacement selon résiduelle ; HD/EER sans schéma | RCP §4.2 (tableau en image) ; ANSM p. 8 | partiel | conforme | Tableau IR du RCP non lisible. |
| amikacine-renal | créatinine avant et pendant | RCP §4.4 ; ANSM p. 7-8 | oui | conforme | Fréquence non chiffrée (affiché). |
| amikacine-duree | réévaluer 48-72 h ; ≤ 5 j (≤ 72 h IUAS) | ANSM p. 7 ; IUAS R.39 | oui | conforme | |
| amikacine-audition | interrogatoire ; audiogramme « si possible » | RCP §4.4 | oui | conforme | Seuil > 3 j = choix de l'application. |
| amikacine-pic | après la 1re dose, 30 min après une perfusion de 30 min, 60-80 mg/L | ANSM p. 8, tableau 1 ; RCP §4.2 | oui | corrigé (indication) | Liste ANSM ; extension sepsis/IRA/EER signalée. |
| amikacine-residuelle-ir | **ajout** : avant la 2e injection puis chaque réinjection, < 2,5 mg/L | RCP §4.2 ; ANSM p. 8 ; RCP gentamicine (principe) | oui | corrigé (ajout) | Le 1er dosage « après 48 h » était faux en IR. |
| amikacine-residuelle | > 5 j : après 48 h, avant la dose, < 2,5 mg/L, 2×/sem | ANSM p. 8 ; Abdul-Aziz T4 | oui (position : Abdul-Aziz) | corrigé (indication) | Identifiant conservé. |
| amikacine — grossesse | utilisable, dépistage auditif | CRAT 7720 | oui | conforme | |
| gentamicine-3-synergie | 3 mg/kg/j, 1 dose | ESC T7, T9 ; SPILF/AEPEI diapo 16 ; Ann. 9 | oui | corrigé (remarque poids) | Lorentz + 0,43 (RCP) vs Devine + 0,4 (moteur). |
| gentamicine-5-ei-proba | **ajout** : 5 mg/kg/j si sepsis (EI probabiliste) | SPILF/AEPEI diapo 6 ; ANSM p. 6 | oui (diaporama) | corrigé (ajout) | ESC : 3 mg/kg. |
| gentamicine-6-7 | 6 mg/kg DUJ | Ann. 9 ; ANSM p. 6 | oui | conforme | |
| gentamicine — adaptation rénale | intervalles 24/36/48 h ; < 20 dosage impératif ; HD 2-4 h avant | RCP §4.2 | oui | conforme | Divergence HD affichée. |
| gentamicine-renal | créatinine | RCP §4.4 ; ANSM p. 8 | oui | conforme | |
| gentamicine-duree-ei | 2 sem (ESC) / jusqu'à HC stériles (SPILF) ; ≤ 5 j hors EI | ANSM p. 7 ; SPILF/AEPEI diapo 15 ; ESC T8 | oui | conforme | Divergence non résolue. |
| gentamicine-audition | auditif/vestibulaire | RCP §4.4 | oui | conforme | |
| gentamicine-pic | 1re dose, +30 min, 30-40 mg/L | ANSM p. 8 ; RCP §4.2 | oui | corrigé | « pour la dose de 6-8 mg/kg » retiré (non sourcé) ; dose synergique sans cible. |
| gentamicine-residuelle-ir | **ajout** : avant chaque réinjection, < 0,5 mg/L | RCP §4.2 ; ANSM p. 8 | oui | corrigé (ajout) | |
| gentamicine-residuelle | > 5 j, après 48 h, < 0,5 mg/L | ANSM p. 8 ; Abdul-Aziz T4 | oui | corrigé (indication) | |
| gentamicine — grossesse | utilisable | CRAT 7720 | oui | conforme | |
| vancomycine-continu | charge 25 mg/kg (≤ 3 g) puis 30 mg/kg/j continu | Ann. 9 ; SPILF/AEPEI diapo 16 ; Rybak Rec. 10 | oui (R2 : Rybak relu) | corrigé (remarque) | Rybak CI : charge 15-20 mg/kg ; vitesse RCP ≤ 10 mg/min. |
| vancomycine-discontinu | 15-20 mg/kg /8-12 h, ≤ 2 g/dose | RCP §4.2 ; Rybak Rec. 1 | oui | conforme | |
| vancomycine — adaptation rénale | dose initiale non réduite ; 20-49 : /24 h ; < 20 selon résiduelles ; HD ; EER | RCP §4.2 ; Rybak Rec. 14, 16 | oui | conforme | |
| vancomycine-renal | créatinine avant et périodiquement | RCP §4.4 ; Rybak (définition) | oui (R2) | **corrigé** | Fréquence Rybak attribuée à tort à la créatinine (porte sur les dosages). |
| vancomycine-audition | contrôle auditif régulier | RCP §4.4 | oui | conforme | Seuil > 7 j = choix. |
| vancomycine-plateau | continu, à tout moment à l'équilibre, 20-25 mg/L | Ann. 9 ; Rybak Rec. 10 ; Abdul-Aziz T4 | oui | corrigé (répétition) | 1er dosage J2 = choix (non fixé par les sources). |
| vancomycine-residuelle | discontinu, J2 avant la dose, 15-20 mg/L ± ASC | RCP §4.2 ; Ann. 9 ; Rybak Rec. 2, 4, 5 | oui | **corrigé** | `numeroDose: 4` retiré (plaçait le dosage à H72). |
| vancomycine-predialyse | avant séance, 15-20 mg/L, ≥ 1/sem | Rybak Rec. 14, Table 2 | oui | conforme | |
| vancomycine — grossesse | utilisable | CRAT 13364 | oui | conforme | |
| daptomycine-6 | 6 mg/kg/24 h | RCP §4.2 ; IDSA 2011 rec. 19 | oui | conforme | |
| daptomycine-10-12 | 10 mg/kg (ESC) ; 12 (SPILF) ; hors AMM | ESC T8 ; SPILF/AEPEI diapo 16 ; RCP | oui | conforme | Divergence affichée. |
| daptomycine — adaptation rénale | < 30 : /48 h ; HD après séance ; EER non précisé | RCP §4.2 | oui | conforme | |
| daptomycine-cpk | CPK initiale puis ≥ 1/sem ; /2-3 j si FdR | RCP §4.4 | oui | conforme | |
| daptomycine-pneumonie-eosino | arrêt immédiat | RCP §4.4 | oui | conforme | |
| daptomycine-residuelle (STP) | non recommandé en routine ; Cmin < 24 mg/L à 72 h | Abdul-Aziz T4 | oui | conforme | |
| daptomycine — grossesse | non vérifié | — | non | conforme (honnête) | |
| cefotaxime-std / cefotaxime-fort | 1 g/8 h ; 2 g/8 h | SPILF 2026 ; SPILF 2015 annexe 1 ; Ann. 9 ; EUCAST | oui | conforme | |
| cefotaxime — adaptation rénale | < 10 : demi-dose ; HD après séance | RCP §4.2 | oui | conforme | |
| cefotaxime-encephalopathie | neuro si IR/âge | RCP §4.4 (verbatim) | oui | conforme | |
| cefotaxime-stp (et 7 autres « -stp ») | STP BL réanimation 24-48 h, 4-8 × CMI | SFPT/SFAR 2018 R2.2, R4.1-R4.4 ; Abdul-Aziz T4 | oui | conforme | Tableau 2 SFPT/SFAR (cibles par molécule) non lu. |
| ceftriaxone-1g | 1 g/24 h IM/IV | SPILF 2026 ; HAS 2021 ; SPILF 2015 | oui | conforme | |
| ceftriaxone-2g | 2 g/24 h | SPILF 2026 ; ESC T7 ; EUCAST | oui | **corrigé** | « souche I » retiré : 2 g/24 h = posologie standard. |
| ceftriaxone-2g12h | 2 g/12 h | ESC T9 ; SPILF/AEPEI diapo 11 ; Ann. 9 | oui | corrigé (indication) | = forte posologie (souche I). |
| ceftriaxone — adaptation rénale | pas de réduction ; < 10 : ≤ 2 g/j ; HD sans supplément | RCP §4.2 | oui | conforme | |
| ceftriaxone-encephalopathie | neuro | RCP §4.4 (résumé) | partiel | corrigé (extrait) | Extrait non verbatim désormais signalé comme résumé. |
| ceftriaxone-calcium | pas de co-administration calcique | RCP §4.4 | oui | conforme | |
| cloxacilline-2g-x6 | 2 g/4 h (12 g/j) | ESC T8 ; Ann. 9 ; SPILF/AEPEI diapo 16 ; RCP | oui | conforme | |
| cloxacilline — adaptation rénale | < 30 : moitié ; IH + IR : moitié ; HD non traitée | RCP §4.2 | oui | conforme | |
| cloxacilline-kaliemie-renal / -encephalopathie | K+, créatinine ; neuro | RCP §4.4 (verbatim) | oui | conforme | |
| cefazoline-2g-x3 | 2 g/8 h | ESC T8 ; Ann. 9 ; SPILF/AEPEI ; SPILF 2025 | oui | **corrigé** (remarque) | Note e de l'ESC citée exactement ; divergence SPILF 2026 ; rang 1 = choix. |
| cefazoline — adaptation rénale | ≥ 55 / 35-54 / 11-34 / ≤ 10 ; HD sans chiffre | RCP §4.2 | oui | conforme | |
| cefazoline-encephalopathie | neuro | RCP §4.4 | oui | corrigé (extrait) | Extrait verbatim propre au RCP. |
| cefazoline — chaîne latérale | libellé | aucune source lue | non | corrigé | Marqué « non vérifié ». |
| amoxicilline-po-1g8h / -iv-std / -iv-fort | 1 g/8 h PO ; 1 g/6 h IV ; 200 mg/kg/j ≤ 12 g | SPILF 2026 ; HAS 2021 ; Ann. 9 ; ESC T7, T9 ; SPILF/AEPEI ; RCP | oui | conforme | |
| amoxicilline — adaptation rénale | DFG > 30 / 10-30 / < 10 ; HD | RCP §4.2 | oui | conforme | |
| amoxicilline-cristallurie | hydratation, convulsions | RCP §4.4 | oui | conforme | Condition « forte posologie » non évaluable par le moteur. |
| amoxicilline — chaîne latérale | identité avec céfadroxil/céfalexine | aucune source lue | non | corrigé | Marqué « non vérifié ». |
| amoxclav-po-1g8h / -iv-1g8h | 1 g/8 h | SPILF 2026 ; HAS 2021 ; RCP ; Ann. 9 | oui | conforme | |
| amoxicilline-clavulanate — adaptation rénale / amoxclav-hepatique | paliers RCP ; bilan hépatique | RCP §4.2, 4.4 | oui | conforme | |
| piptazo-4g8h / piptazo-4g6h-prolongee | standard ; forte posologie 3 h | RCP ; Ann. 9 ; SPILF 2026 ; IUAS R.45 ; EUCAST | oui | conforme | |
| pipéracilline-tazobactam — adaptation rénale | > 40 / 20-40 / < 20 ; HD + 2 g/0,25 g | RCP §4.2 | oui | conforme | |
| piptazo-nfs-k / piptazo-vanco-ira | NFS, K+ ; créatinine si vancomycine | RCP §4.4 ; Rybak | oui | conforme | |
| piptazo-encephalopathie | neuro | RCP §4.4 (résumé) | partiel | corrigé (extrait) | |
| temocilline-2g8h | 2 g/8 h (6 g/j) | SPILF 2026 ; RCP ; Ann. 9 ; EUCAST note 13 | oui | conforme | |
| témocilline — adaptation rénale | > 60 / 30-60 / 10-30 ; < 10 non précisé ; HD | RCP §4.2 | oui | conforme | Forte posologie en IR non documentée (affiché). |
| temocilline-electrolytes / -encephalopathie | K+ ; neuro | RCP §4.4 | oui | conforme / corrigé (extrait) | |
| témocilline — grossesse | non vérifié | — | non | conforme (honnête) | |
| cefoxitine-6g | 2 g/8 h | SPILF 2026 ; Info-antibio 109 ; RCP §4.2 (R2) | oui | **débloqué** | RCP lu le 2026-11-05 ; modalités de perfusion non lues. |
| céfoxitine — adaptation rénale | 50-30 / 29-10 / 9-5 / < 5 ; HD | RCP §4.2 (R2) | oui | **débloqué** (renseigné) | Était vide. |
| céfoxitine — grossesse | non vérifié | — | non | conforme (honnête) | |
| cefepime-2g8h | 2 g/8 h | Ann. 9 ; SPILF 2023 diapo 10 ; RCP | oui | conforme | |
| céfépime — adaptation rénale | tableau RCP | RCP §4.2 (R2, 2 lectures) | oui | **corrigé** | 2 g × 3 → 1 g × 3 / 1 g × 2 / 1 g × 1 (étaient 2 g × 2 / 2 g × 1 / non précisé). |
| cefepime-encephalopathie / cefepime-stp | neuro quotidienne ; STP si Pseudomonas/IR/neuro | RCP §4.4 ; Ann. 9 ; SFPT/SFAR | oui | conforme | |
| meropeneme-1g8h / -2g8h | 1 g/8 h ; 2 g/8 h en 3-8 h | SPILF 2026 ; Ann. 9 ; RCP | oui | conforme | |
| méropénème — adaptation rénale | ≥ 51 / 26-50 / 10-25 / < 10 ; HD | RCP §4.2 | oui | conforme | |
| meropeneme-convulsions | neuro | RCP §4.4 | oui | corrigé (extrait) | |
| méropénème — grossesse | non vérifié | — | non | conforme | |
| imipeneme-1g8h | 1 g/8 h, pas de perfusion prolongée | SPILF 2026 ; RCP ; Ann. 9 | oui | conforme | |
| imipénème — adaptation rénale | tableau 3 g/j ; < 15 non sauf HD | RCP §4.2 | oui | conforme | |
| imipeneme-neuro | respect des schémas | RCP §4.4 | oui | corrigé (extrait) | |
| imipénème — grossesse | « utilisable » | CRAT 13283 (résultat de recherche) | non | **bloqué** (`non_verifie`) | |
| ertapeneme-1g | 1 g/24 h en 30 min | SPILF 2026 ; Ann. 9 ; RCP (R2) | oui | conforme (source ajoutée) | |
| ertapénème — adaptation rénale | > 30 : inchangé ; ≤ 30 et HD : **ne pas utiliser** | RCP §4.2 (R2) | oui | **débloqué / corrigé** | Était un brouillon vide. |
| ertapénème — grossesse | non vérifié | — | non | conforme | |
| aztreonam-2g8h | 2 g/8 h | SPILF 2015 annexe 1 ; RCP ; JNI 2024 | oui | conforme | |
| aztréonam — adaptation rénale / aztreonam-renal-aminoside | ≥ 30 / 10-30 / < 10 ; HD 1/8 ; créatinine si aminoside | RCP §4.2, 4.4 | oui | conforme | |
| cefixime-200x2 | 200 mg/12 h PO | SPILF 2026 ; HAS 2021 ; RCP §4.2 (R2) | oui | **débloqué** | |
| céfixime — adaptation rénale | > 20 inchangé ; ≤ 20 et HD ≤ 200 mg/j | RCP §4.2 (R2) | oui | **débloqué** (renseigné) | |
| cipro-po-500x2 / cipro-iv-400x3 | 500 mg/12 h PO ; 400 mg/8 h IV | SPILF 2026 ; HAS 2021 ; SPILF 2015 ; Ann. 9 | oui | conforme | |
| ciprofloxacine — adaptation rénale | 30-60 : /12 h ; < 30 : /24 h ; HD après | RCP IV §4.2 | partiel | corrigé (texte) | Paliers de la forme orale non lus (signalé). |
| cipro-tendons / cipro-qt / cipro-glycemie | tendons, QT, glycémie | RCP §4.4 ; ANSM 2023 | oui | conforme | |
| levo-500 / levo-iv-500x2 | 500 mg/24 h ; 500 mg/12 h | SPILF 2026 ; RCP | oui | conforme | |
| lévofloxacine — adaptation rénale | paliers schéma 500 mg/24 h | RCP §4.2 (tableau, confiance moyenne) | partiel | corrigé (texte) | Valeurs du schéma 500 mg/12 h ajoutées (confiance moyenne). |
| levo-tendons / levo-qt / levo-glycemie | idem | RCP §4.4 | oui | conforme | |
| smx-tmp-800-160-x2 | 800/160 mg/12 h | SPILF 2026 ; HAS 2021 ; Ann. 9 | oui | conforme | Souche I : forte posologie (règles corrigées). |
| cotrimoxazole — adaptation rénale / smx-tmp-k-creat | > 30 / 15-30 / < 15 ; HD ; K+, créatinine, NFS | RCP IV §4.2, 4.4 | oui | conforme | |
| cotrimoxazole — grossesse | éviter < 10 SA | CRAT 6669 | oui | conforme | Ictère à terme non lu. |
| rifampicine-900 | 900 mg/j (600 si < 70 kg) après HC stériles | ESC T8 ; SPILF/AEPEI diapo 15-16 | oui | conforme | |
| rifampicine — adaptation rénale / rifampicinemie | rifampicinémie J2-J3 (60-30) ; < 30 espacer | RCP §4.2 | oui | conforme | Cible non chiffrée. |
| rifampicine-hepatique / -interactions | J8, M1, /2 mois ; induction | RCP §4.4-4.5 | oui | conforme | |
| rifampicine — grossesse | « utilisable » sans source | CRAT 8385 (résultat de recherche) | non | **bloqué** (`non_verifie`) | |

## C. Récapitulatif

- Lignes auditées : 47 lignes de règles (20 règles `R-…` décomposées) + 112 lignes de molécules (regroupant ≈ 140 éléments) ≈ **185 éléments**.
- **Corrigés : 31** (dont 4 ajouts : `amikacine-residuelle-ir`, `gentamicine-residuelle-ir`, `gentamicine-5-ei-proba`, source `RCP-ertapeneme`).
- **Bloqués : 7** éléments passés en `brouillon` (2 options streptocoque, `entero-vanco-allergie`, `ei-staph` SARM, IU homme immunodéprimé, aztréonam IUAS) + 2 statuts grossesse → `non_verifie`.
- **Débloqués : 3** (céfoxitine, céfixime, adaptation rénale de l'ertapénème) après lecture des RCP.
- **Maintenus en brouillon** : probabiliste BGN sans foyer, *S. aureus* avant méticilline, SCN (molécule), IOA sur matériel, CGP en chaînettes.
