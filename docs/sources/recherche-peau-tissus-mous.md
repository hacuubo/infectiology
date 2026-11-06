# Recherche documentaire — Infections de la peau et des tissus mous de l'adulte

Date de consultation de toutes les sources : **2026-11-06**.
Méthode : WebSearch + WebFetch ; les PDF ont été téléchargés (curl) puis leur texte extrait localement (pypdf) ; les pages HTML de la HAS, de l'IDSA et de la base de données publique des médicaments (BDPM) ont été téléchargées et converties en texte ; le diaporama SPILF 2023 (.pptx) a été lu à partir de ses XML. Chaque extrait cité ci-dessous a été **effectivement lu** dans le texte extrait, sauf mention « NON LU » ou « non trouvé ». Les extraits sont volontairement courts (fragments factuels : molécule, dose, durée, critère).

Convention des statuts d'accès :
- **consultee** : texte intégral ou partie pertinente lue.
- **contenu_non_lisible** : URL atteinte, contenu non exploitable (tableaux en image, 403…).
- **introuvable** : document recherché sans succès.

Ids du registre : les sources déjà présentes dans `src/clinical/sources/registre.json` gardent leur id (`HAS-2019-infections-cutanees`, `IWGDF-IDSA-2023-pied-diabetique`, `HAS-2024-synthese-antibiotherapie`, `RCP-*` des molécules déjà intégrées, `SPILF-GPIP-2021-durees`). Les nouvelles sont dans `docs/sources/registre-peau-tissus-mous.json`.

---

## 0. Panorama des textes en vigueur (ce qui remplace quoi)

| Corpus | Texte en vigueur au 2026-11-06 | Remplace / statut |
|---|---|---|
| Infections cutanées bactériennes courantes (DHBNN, reconnaître DHBN-FN, plaies chroniques, furoncle, furonculose, abcès, impétigo) | `HAS-2019-infections-cutanees` : RBP SPILF/SFD/HAS, février 2019 (texte des recommandations) + argumentaire `SPILF-HAS-2019-infections-cutanees-argumentaire` | Actualise **certaines** recommandations de la conférence de consensus SPILF/SFD 2000 « Érysipèle et fasciite nécrosante » (préambule p. 6). Page SPILF « recommandations » : listée sans mention « en cours de révision ». |
| Fiches mémo HAS « Choix et durées d'antibiothérapies » (peau) | Validées 15/07/2021, mises en ligne 27/08/2021 : DHBNN adulte (MAJ 12/07/2024) `HAS-2021-DHBNN-adulte` ; abcès cutanés (MAJ 13/05/2025) `HAS-2021-abces-cutanes` ; furoncles (MAJ 15/07/2024) `HAS-2021-furoncles` ; furonculoses (MAJ 13/05/2025) `HAS-2021-furonculoses` ; impétigo (MAJ 13/05/2025) `HAS-2021-impetigo` ; fiche de synthèse (MAJ déc. 2024) `HAS-2024-synthese-antibiotherapie` | Déclinaison opérationnelle de HAS 2019 ; ajoutent quelques posologies (céfazoline, cloxacilline en mg/kg pour l'abcès). |
| DHBN / fasciite nécrosante — antibiothérapie probabiliste de l'adulte | **Aucun texte français postérieur à 2000 trouvé.** HAS 2019 ne traite que la **reconnaissance** et l'orientation (§ 2). Seul texte français donnant un probabiliste par localisation : conférence de consensus 2000 `SPILF-SFD-2000-erysipele-FN` (texte court, Ann Dermatol Venereol 2001;128:458-62) | Statut **incertain** : non abrogée pour la FN, mais ancienne (2000) ; la partie DHBNN est remplacée par HAS 2019. Recherche d'une RFE SFAR/SPILF/SRLF sur les infections nécrosantes des tissus mous : **introuvable**. |
| Infection du pied diabétique | **SPILF 2023** « Recommandations de pratique clinique pour le diagnostic et la prise en charge infectiologique des infections de plaie du pied chez les patients diabétiques (IPPPD) » — diaporama du comité des référentiels 27/10/2023 (lu) ; article Bonnet E et al., Infect Dis Now 2024;54(1):104832 (NON LU) `SPILF-2023-pied-diabetique` ; **IWGDF/IDSA 2023** `IWGDF-IDSA-2023-pied-diabetique` | SPILF 2023 « Mise à jour des recommandations de 2006 » (diapo 2) ; s'appuie sur IWGDF **2019**. IWGDF : **mise à jour 2027 annoncée** (présentation prévue au symposium de mai 2027, page « guidelines 2027 » du site IWGDF) — pas encore publiée. |
| Morsures et plaies aiguës | `SFMU-2017-plaies` : « Plaies aiguës en structure d'urgence — Référentiel de bonne pratique », SFMU 2017 (v2, septembre 2017), avec SFFPC, SOFCPRE, soutien SPILF et GFRUP | Aucune actualisation trouvée (page SFMU : v2 sept. 2017). HAS 2019/2021 couvre la **DHBNN après morsure** (traitement curatif). |
| SARM communautaire, cas groupés | `HCSP-2014-SARM-Co` : « Conduite à tenir lors d'épisodes de cas groupés d'infections cutanées suppuratives liées aux souches de SARM Co », HCSP, 10/07/2014 | Renvoyé par HAS 2019 (§ 5.2, cas groupés ; § 5.4, protocole de décolonisation). |
| IDSA — SSTI | `IDSA-2014-SSTI` : Stevens DL et al., Clin Infect Dis 2014;59:e10-e52 (+ correction CID 2015;60:1448) | Page IDSA : « CURRENT » ; aucune révision annoncée sur la page. Tableaux de posologies (Tables 2, 4, 5) en image : **non lus**. |
| Consensus chirurgical international | `WSES-2022-SSTI` : Sartelli M et al., « WSES/GAIS/WSIS/SIS-E/AAST global clinical pathways for patients with skin and soft tissue infections », World J Emerg Surg 2022;17:3 | Revue/consensus d'experts (non GRADE). Utilisé uniquement en recoupement (posologies NSTI). |
| ESCMID | **Aucun guideline ESCMID dédié aux SSTI / NSTI trouvé.** | — |

Points de vigilance :
- La page SPILF « recommandations » (consultée 2026-11-06) ne mentionne **aucun** texte « peau / tissus mous / pied diabétique » en cours de révision ; elle liste HAS/SPILF/SFD 2019, HCSP 2014 SARM-Co, SFMU 2017 plaies, SPILF 2023 pied diabétique.
- Le champ de HAS 2019 est **ambulatoire, France métropolitaine** (préambule p. 6) ; plaies chroniques **hors pied diabétique** ; plaies aiguës post-opératoires et post-traumatiques **non abordées** (§ 3.1, p. 18).

---

## 1. `HAS-2019-infections-cutanees` — SPILF / SFD / HAS, « Prise en charge des infections cutanées bactériennes courantes », février 2019

- **Organisme** : HAS, SFD, SPILF. Méthode RPC. Grades A/B/C/AE (p. 2).
- **URL** : https://www.has-sante.fr/jcms/c_2911550/fr/prise-en-charge-des-infections-cutanees-bacteriennes-courantes ; PDF : https://www.has-sante.fr/upload/docs/application/pdf/2019-04/prise_en_charge_des_infections_cutanees_bacteriennes_courantes_recommandations.pdf (35 p.).
- **Accès** : consultee (texte intégral lu). **Vigueur** : en_vigueur (déjà au registre).
- Message clé de la page HAS : « La durée totale de l'antibiothérapie en ambulatoire doit être courte (au maximum 7 jours). »

### 1.1 DHBNN (érysipèle / « cellulite » non nécrosante)
- Microbiologie (§ 1.1, p. 7) : streptocoque β-hémolytique du groupe A « dans 58 à 73 % des cas, du groupe G dans 14 à 25 % des cas ».
- Facteurs de risque (§ 1.1.1, p. 7) : « antécédent personnel de DHBNN, l'obésité, la présence d'un œdème chronique ou d'un lymphœdème de jambe, et la présence d'une porte d'entrée cutanée ».
- Diagnostic (p. 8, AE) : « Le diagnostic de DHBNN est clinique. » ; « marquer au feutre les contours du placard inflammatoire ».
- **Signes de gravité** (§ 1.2.2, p. 8, grade C) : sepsis (qSOFA : « troubles de conscience, fréquence respiratoire > 22/minute et PAS < 100mmHg ») ou choc toxinique ; « douleur particulièrement intense, discordante avec les signes locaux » ; « lividités, taches cyaniques, crépitation sous-cutanée, hypo- ou anesthésie locale, induration dépassant l'érythème, nécrose locale » ; « extension rapide des signes locaux en quelques heures » ; aggravation « 24 à 48 heures après l'introduction de la première antibiothérapie ».
- Étiologie non streptococcique à considérer (p. 10, AE) : « morsure animale, exposition marine, voie veineuse périphérique, toxicomanie IV » ; « face, région périnéo-fessière » ; « enfant, immunodépression ».
- Face (p. 8, AE) : staphylococcie « maligne » de la face : « Sa suspicion impose une hospitalisation en urgence. »
- Périnée (p. 9, AE) : diagnostic différentiel = gangrène de Fournier → « hospitaliser le patient en urgence (appel au centre 15 ».
- Différentiel (§ 1.4, p. 11, AE) : DHB avec signes de gravité → « évoquer une DHBN et en particulier une fasciite nécrosante » ; placard **bilatéral** sans fièvre ni frissons → « suspecter un autre diagnostic » (insuffisance veineuse).
- **Examens / prélèvements** (§ 1.6, p. 12, AE) : « En cas de DHBNN non compliquée, aucun examen complémentaire n'est recommandé » ; prélèvements (porte d'entrée, « éventuellement hémocultures ») seulement si : morsure animale ou humaine ; milieu aquatique ; voyage en zone tropicale ; post-traumatique, liée aux soins ou injection septique ; lésions suppuratives ; échec d'un traitement présumé adapté ; immunodéprimé ; signes de gravité.
- **Hospitalisation d'emblée** (§ 1.7, p. 12, AE) : signes de gravité ; « immunodépression, diabète déséquilibré, insuffisance cardiaque à partir du stade III NYHA, insuffisance rénale sévère, insuffisance hépatique » ; « obésité morbide (IMC > 40) » ; impossibilité de traitement/surveillance à domicile, non-observance, précarité, « impossibilité de prendre un traitement par voie orale » ; « sujet âgé > 75 ans et polypathologique ». **Hospitalisation secondaire** : signes de gravité, ou « évolution défavorable dans les 24 à 48 heures ».
- Cible (§ 1.8.1, p. 13) : « pas d'intérêt à l'élargissement du spectre vers une antibiothérapie autre qu'anti-streptococcique dans les DHBNN non compliquées ».
- **Traitement curatif adulte** (§ 1.8.2, p. 13, AE) :
  - « amoxicilline : 50 mg/kg/jour en trois prises avec un maximum de 6 g/jour » ;
  - allergie à la pénicilline : « pristinamycine (1 g x 3 /jour) ou clindamycine (600 mg x 3/jour, et jusqu'à 600 mg x 4/jour si poids > 100 kg) » ;
  - « une durée de 7 jours » ; régression cutanée retardée (« 2, voire 3 semaines ») qui « ne doit pas conduire à prolonger l'antibiothérapie » ; « ne pas prescrire d'antibiothérapie locale ».
- **Situations particulières** (p. 13, AE) : « DHBNN après morsure : amoxicilline-acide clavulanique oral : 50 mg/kg/jour d'amoxicilline sans dépasser 6 g/jour, et sans dépasser 375 mg/jour d'acide clavulanique, pour une durée de 7 jours » ; érysipélatoïde : amoxicilline 50 mg/kg/j, 7 jours. **Avis spécialisé** : « DHBNN liées aux soins ; exposition aquatique et marine ; injection septique (toxicomanie IV) ».
- Obésité (p. 13) : « il faut adapter les doses d'antibiotiques » ; éviter IM et SC.
- Anti-inflammatoires (§ 1.8.3, p. 14, grade C) : « ne pas prescrire des corticoïdes ou des anti-inflammatoires non stéroïdiens (AINS) » ; AINS au long cours : arrêt transitoire ; corticoïdes / aspirine anti-agrégante : poursuivis.
- Mesures associées (§ 1.8.4, p. 14, AE) : repos et surélévation du membre ; anticoagulation prophylactique « discutée » ; contention « au moins 3 semaines » ; « mise à jour de la vaccination antitétanique ».
- **Facteurs favorisants à traiter** (§ 1.5.1 p. 11 et § 1.9 p. 14, AE) : traiter la porte d'entrée ; lymphœdème « traité par compression médicale » ; portes d'entrée « (plaies, intertrigo, dermatose sous-jacente) » ; obésité prise en charge.
- **Antibioprophylaxie des récidives** (p. 15, AE ; NB : placée dans le PDF sous le titre « 1.10 », mais concerne l'adulte, cf. fiche HAS 2021) : « à partir de deux épisodes de DHBNN dans l'année écoulée » si facteurs de risque non contrôlables ; « benzyl-pénicilline G retard 2,4 MUI IM toutes les 2 à 4 semaines » ; « pénicilline V … 1 à 2 millions UI/jour selon le poids en deux prises » ; « azithromycine (250 mg/jour) si allergie à la pénicilline (hors AMM) » ; durée « non déterminée ».

### 1.2 DHBN / fasciite nécrosante (reconnaissance uniquement)
- Facteurs de risque (§ 2.1, p. 17) : « le diabète, les anti-inflammatoires non stéroïdiens, l'immunodépression », malnutrition, âge > 60 ans, toxicomanie IV, insuffisance veineuse, AOMI, obésité. Mortalité « entre 20 % et 30 % ».
- Microbiologie (p. 17) : monomicrobiennes « principalement dues au SGA » ou polymicrobiennes (SA, entérobactéries, P. aeruginosa, anaérobies).
- Suspicion (§ 2.2, p. 17, AE) : mêmes signes que § 1.2.2, avec « qSOFA ≥ 2 » et aggravation « 48 heures » après la 1re antibiothérapie. « La suspicion d'une FN nécessite d'appeler le 15 pour une hospitalisation en urgence dans un service spécialisé. »
- Examens (p. 18, AE) : « La FN est une urgence médico-chirurgicale » ; examens « non recommandé[s] en pratique de ville » ; IRM seulement si doute, « ne doit pas retarder le geste chirurgical » ; ponction-aspiration à l'aiguille possible « sans retarder la prise en charge chirurgicale ».
- **Pas d'antibiothérapie probabiliste de l'adulte proposée** dans le texte des recommandations 2019 (vérifié : aucune molécule au § 2). L'argumentaire ne reprend que le tableau GPIP **pédiatrique** (Tableau 24, p. 62).

### 1.3 Plaies chroniques (hors pied diabétique) — déjà au registre (cf. `recherche-indication.md` § 9.1)
- § 3.3.1 p. 20 (AE) : pas de prélèvement systématique ; pus franc → prélever avant antibiotique ; plaie non suppurée suspecte → pas de prélèvement, avis spécialisé.
- § 3.4 p. 20 (AE) : dermohypodermite contiguë → traiter comme DHBNN ; abcès / suppuration → traiter comme abcès ; plaie suspecte → « il n'est pas recommandé de réaliser une antibiothérapie d'épreuve ».

### 1.4 Furoncle, anthrax
- Définition (§ 4.1, p. 21) : infection du follicule pilo-sébacé « due à Staphylococcus aureus », très majoritairement LPV+.
- **Formes compliquées** (p. 21) : « anthrax ; multiplication des lésions ; apparition d'une dermohypodermite péri-lésionnelle ; abcédation secondaire ; présence de signes systémiques (fièvre) ».
- **Terrain/situations à risque de complication** (p. 21) : âge < 1 an ; immunodépression ; comorbidités (diabète, obésité) ; « localisation rendant le drainage difficile (face, main, siège péri-orificiel) » ; absence de réponse au traitement initial.
- Prélèvement (§ 4.2, p. 21, AE) : furoncle isolé en ville → « ne pas faire de prélèvement » ; compliqué, retour de voyage ou terrain à risque → prélever le pus avant antibiotique ; « pas d'intérêt à rechercher la LPV … en routine ».
- **Furoncle isolé non compliqué** (§ 4.4.1, p. 22, AE) : soins locaux seuls (ne pas manipuler, toilette, incision de l'extrémité si volumineux, pansement) ; « ne pas traiter par antibiothérapie (locale ou générale) ».
- **Furoncle compliqué / à risque** (§ 4.4.2, p. 22, AE) : antibiothérapie générale « après la réalisation d'un prélèvement bactériologique, et sans en attendre les résultats » ; « clindamycine ou pristinamycine » ; « La durée du traitement recommandée est de 5 jours. »

### 1.5 Furonculose
- Prélèvement (§ 5.2, p. 23, AE) : pus d'un furoncle avant traitement ; dépistage des gîtes « seulement après échec d'une première décolonisation » ; cas groupés (> 2 cas) → HCSP 2014.
- Poussée (§ 5.4, p. 23, AE) : hygiène, pansement ; douches chlorhexidine 1/j 7 jours ; « antibiothérapie orale anti-staphylococcique (pristinamycine ou clindamycine) pendant 7 jours ».
- Après guérison (p. 23-24) : décolonisation du patient et de l'entourage (mupirocine nasale 2/j 7 jours, chlorhexidine…). « Il n'est pas recommandé de prescrire une antibiothérapie générale pour réaliser une décolonisation. »

### 1.6 Abcès cutané
- Définition (§ 6.1, p. 24) : primaires « le plus souvent dus à SA » ; secondaires (peau pathologique) SA mais « peuvent être polymicrobiens ».
- Collection sur cathéter → infection de cathéter ; après chirurgie → infection du site opératoire, prise en charge spécifique (p. 25).
- Prélèvement (§ 6.4, p. 25, AE) : « Un prélèvement bactériologique du pus de l'abcès est recommandé. »
- **Traitement** (§ 6.5, p. 25, AE) : « incision/un drainage chirurgical et le renforcement des mesures d'hygiène » ; « Une antibiothérapie de courte durée (5 jours) active sur SA (clindamycine per os/IV, pristinamycine per os, oxacilline ou cloxacilline IV, cefazoline IV), est recommandée en complément du geste chirurgical. »
- ⚠ Le texte français recommande l'antibiotique **systématiquement** après drainage ; l'IDSA 2014 le réserve selon le SIRS (cf. § 7).

### 1.7 Impétigo (l'adulte est traité par la reco)
- SARM (§ 7.4, p. 26) : « Étant donné le taux de 5 à 10 % de SARM en France parmi la population de SA communautaires, il n'est pas justifié de prendre en compte le SARM » en probabiliste (impétigo, voie orale).
- Prélèvement (§ 7.2, p. 26, AE) : peu étendu, 1re poussée → pas de prélèvement ; autres formes → prélever ; traiter sans attendre.
- Forme peu étendue (§ 7.4.2, p. 27, grade C) : < 2 % de surface, < 6 lésions, sans extension rapide → mupirocine locale « deux à trois fois par jour pendant une durée de 5 jours ».
- **Formes graves** (§ 7.4.3, p. 27, AE) : ecthyma ; > 2 % de surface ; > 6 lésions ; extension rapide → antibiothérapie générale « pour une durée de 7 jours » ; adulte : « la pristinamycine ou une C1G (comme la céfalexine) » ; pas d'antibiotique local associé.

### 1.8 Annexe 1, Tableau 1 (p. 29) — « Antibiotiques par voie générale dans les IBPTM non dues au SGA » (colonne adulte)
| Molécule | Voie / rythme | Adulte | Remarque |
|---|---|---|---|
| Oxacilline, cloxacilline | IV, 4 à 6 fois/j | « 6 à 12 g/jour » | « Pas d'utilisation par voie orale du fait de la mauvaise biodisponibilité » |
| Céfadroxil, céfalexine | PO, 3 fois/j | « 2 à 4 g/jour » | — |
| Céfazoline | IV, 3 fois/j | « 3 à 6 g/jour » | — |
| Amoxicilline-acide clavulanique | PO, 3 fois/j | « 50 mg/kg/jour d'amoxicilline sans dépasser 250mg/jour d'acide clavulanique » | ⚠ contredit le § 1.8.2 et la fiche HAS 2021 (375 mg/j) |
| Pristinamycine | PO, 2 à 3 fois/j | « 2 à 3 g/jour » | — |
| Clindamycine | PO, IV, 3 fois/j | « 1,8 à 2,4 g/jour » | — |
| Sulfaméthoxazole-triméthoprime | PO, 2 à 3 fois/j | « 1,6 à 2,4 g/jour (sulfaméthoxazole) » | « risque d'échec en cas d'utilisation probabiliste sur S. aureus » |

---

## 2. `SPILF-HAS-2019-infections-cutanees-argumentaire` — argumentaire scientifique (138 p.)

- **URL** : https://www.infectiologie.com/UserFiles/File/spilf/recos/2019-prise-en-charge-des-infections-cutanees-bacteriennes-courantes-argumentaire.pdf. **Accès** : consultee (passages ciblés). **Vigueur** : en_vigueur.
- Clindamycine dans les formes graves (p. 45) : « molécule d'intérêt dans les infections graves en association aux β-lactamines : DHBN et FN, inhibitrice sur la synthèse de toxines » ; « 600 mg toutes les 6-8 heures IV, voire 900 mg en cas d'obésité ».
- Pristinamycine (p. 45) : « posologie habituelle de 2 à 3 grammes par 24 heures, pouvant atteindre 4 grammes par jour lors d'infections sévères (données RCP) ».
- Pénicillines M et cotrimoxazole dans les DHB (p. 38, chapitre enfant) : pénicillines M IV « moins bonne efficacité sur le SGA » ; sulfaméthoxazole : « mauvaise efficacité sur le SGA ». Clindamycine : plus de 20 % des SA « résistantes à l'érythromycine, ce qui peut indiquer une résistance inductible à la clindamycine ».
- Obésité (p. 34) : clindamycine « en IV aller jusqu'à 600 mg/6 h ou 600-900 mg toutes les 8 heures » ; « Pyostacine : pas de données » ; vancomycine : charge sur poids réel, entretien sur poids ajusté, dosages ; linézolide : « Pas d'adaptation chez l'obèse : 600 mg toutes les 12 heures ».
- Rappel des recos 2000 (Tableau 14, p. 43) et IDSA 2014 (Tableau 13, p. 42) : informatif.

---

## 3. Fiches mémo HAS « Choix et durées d'antibiothérapies » (peau) — validées 15/07/2021

Toutes : **consultee** (page HTML lue), **en_vigueur**, partenariat SPILF/GPIP.

### 3.1 `HAS-2021-DHBNN-adulte` — https://www.has-sante.fr/jcms/p_3282443/fr/ (MAJ 12/07/2024)
- « amoxicilline : 50 mg/kg/j en 3 prises (sans dépasser 6 g/j) pendant 7 jours ».
- « En cas d'allergie documentée à la pénicilline » : « clindamycine : 600 mg 3 fois par jour, et jusqu'à 600 mg 4 fois par jour si poids > 100 kg, pendant 7 jours » ou « pristinamycine : 1 g 3 fois par jour pendant 7 jours ».
- « Ne pas prolonger l'antibiothérapie » ; pas d'antibiotique local, ni corticoïdes, ni AINS.
- **Morsure animale** : amoxicilline-acide clavulanique oral 50 mg/kg/j d'amoxicilline, ≤ 6 g/j, « sans dépasser 375 mg par jour d'acide clavulanique, pendant 7 jours » ; **allergie documentée à la pénicilline : « avis spécialisé »**.
- Avis spécialisé : DHBNN liées aux soins ; exposition aquatique et marine ; injection septique.
- Prophylaxie des récidives (« à partir de 2 épisodes de DHBNN dans l'année écoulée ») : benzyl-pénicilline G retard 2,4 MUI IM toutes les 2 à 4 semaines ; pénicilline V 1 à 2 MUI/j en 2 prises. (L'azithromycine de HAS 2019 n'est **pas** reprise sur la fiche.)

### 3.2 `HAS-2021-abces-cutanes` — https://www.has-sante.fr/jcms/p_3282441/fr/ (MAJ 13/05/2025)
- « Un prélèvement bactériologique du pus de l'abcès est recommandé. » ; « Traitement chirurgical : incision/drainage chirurgical. »
- « antibiothérapie de première intention pendant 5 jours par » : « clindamycine PO/IV : 600 mg 3 fois par jour et jusqu'à 600 mg 4 fois par jour si poids > 100 kg ; ou pristinamycine PO : 1 g 3 fois par jour » ; « oxacilline ou cloxacilline IV : 100 mg/kg/j » ; « céfazoline IV : 80 mg/kg/j ».

### 3.3 `HAS-2021-furoncles` — https://www.has-sante.fr/jcms/p_3278809/fr/ (MAJ 15/07/2024)
- Isolé non compliqué : « ne pas traiter par antibiothérapie locale ou générale ».
- Compliqué : « Anthrax ou multiplication des lésions ou dermohypodermite périlésionnelle ou abcédation secondaire ou signes systémiques (fièvre) ».
- Adulte : prélèvement ; « clindamycine : 600 mg 3 fois par jour (et jusqu'à 600 mg 4 fois par jour si poids > 100 kg) pendant 5 jours » ou « pristinamycine : 1 g 3 fois par jour pendant 5 jours » ; réadapter à l'antibiogramme.

### 3.4 `HAS-2021-furonculoses` — https://www.has-sante.fr/jcms/p_3282447/fr/ (MAJ 13/05/2025)
- « Réalisation d'un prélèvement bactériologique avant traitement. »
- Poussée : clindamycine 600 mg ×3/j (×4 si > 100 kg) **7 jours** ou pristinamycine 1 g ×3/j **7 jours** ; chlorhexidine 1/j 7 jours.
- Décolonisation après guérison ; « Il n'est pas recommandé de prescrire une antibiothérapie par voie générale pour réaliser une décolonisation. »

### 3.5 `HAS-2021-impetigo` — https://www.has-sante.fr/jcms/p_3282449/fr/ (MAJ 13/05/2025)
- Formes graves, adulte : « pristinamycine per os : 1 g 3 fois par jour pendant 7 jours » ; « céfalexine per os : 2 à 4 g par jour pendant 7 jours » ; allergie documentée à la pénicilline : pristinamycine.
- Localisé : mupirocine « 2 ou 3 fois par jour pendant une durée de 5 jours ».

### 3.6 `HAS-2024-synthese-antibiotherapie` (déjà au registre) — p. 3-4
- DHBNN non compliquée : amoxicilline, « 7 jours. Ne pas prolonger » ; plaie par morsure animale : amoxicilline-acide clavulanique 7 jours ; abcès : incision/drainage + « clindamycine ou pristinamycine 5 jours » ; furonculose : 7 jours ; furoncle compliqué adulte : clindamycine ou pristinamycine 5 jours ; impétigo grave adulte : pristinamycine 7 jours.

---

## 4. `SPILF-SFD-2000-erysipele-FN` — Conférence de consensus « Érysipèle et fasciite nécrosante : prise en charge », texte court (2000)

- **Organisme** : SPILF, SFD (label ANAES). Publication : Ann Dermatol Venereol 2001;128:458-62.
- **URL** : https://www.sfdermato.org/upload/recommandations/erysipele-court-60a03bfa8c55af03ef3ec54a1b380a73.pdf (texte long : …/erysipele-long-60a03bfa8c55af03ef3ec54a1b380a73.pdf, téléchargé, non exploité).
- **Accès** : consultee (texte court, questions 3 et 4, p. 461-462). **Vigueur** : **incertain** — partie DHBNN remplacée par HAS 2019 ; partie DHBN-FN (antibiothérapie) **non actualisée** depuis.
- Principe (p. 462) : antibiothérapie « adjuvant indispensable du traitement chirurgical » ; choix « habituellement probabiliste tenant compte de la localisation anatomique ».
- **Membres et cervico-facial** : « une association de pénicilline G et de clindamycine ou éventuellement de rifampicine ».
- **Abdomen et périnée** : « l'association d'une pénicilline à spectre large de type uréidopénicilline et d'un imidazolé (métronidazole), éventuellement associé à un aminoside type amikacine lorsque l'on craint la présence de Pseudomonas aeruginosa chez l'immunodéprimé ».
- Anaérobies : « le traitement comportera systématiquement un antibiotique dirigé contre eux ».
- **Toxicomane** : association anti-staphylococcique active sur le streptocoque (« amoxicilline – acide clavulanique, pénicilline M, voire céphalosporine de 1re génération ou glycopeptide avec un aminoside type gentamicine »).
- Chirurgie : « il faut opérer au plus vite » ; « L'excision est le maître geste » ; contrôle de la région opérée « le lendemain et les jours suivants » ; cervico-facial : rechercher une médiastinite ; abdomino-périnéal : dérivation digestive et/ou urinaire souvent nécessaire.
- Pronostic : « La précocité du geste opératoire dans les premières 24 heures suivant l'admission est un déterminant majeur du pronostic. »
- **Aucune posologie ni durée** n'est donnée pour la DHBN-FN.

---

## 5. `SPILF-2023-pied-diabetique` — SPILF 2023, infections de plaie du pied chez le diabétique (IPPPD)

- **Titre exact** (diapo 1) : « Recommandations de pratique clinique pour le diagnostic et la prise en charge infectiologique des infections de plaie du pied chez les patients diabétiques (IPPPD) Recommandations SPILF 2023 ». Diaporama du comité des référentiels, 27/10/2023.
- **URL** : https://www.infectiologie.com/UserFiles/File/spilf/recos/spilf-groupe-reco-inf-ipppd.pptx ; article : https://www.sciencedirect.com/science/article/pii/S266699192300194X (Bonnet E, Maulin L, Senneville E et al., Infect Dis Now 2024;54(1):104832, doi:10.1016/j.idnow.2023.104832).
- **Accès** : diaporama consultee (30 diapositives) ; article **NON LU** (grades non disponibles dans le diaporama). **Vigueur** : en_vigueur.
- Infection (diapo 3) : œdème/induration, « Érythème > 0,5 cm autour des limites de la plaie », douleur, chaleur, pus ; « La présence d'au moins 2 signes définit l'infection de la plaie ».
- **Classification IWGDF** (diapo 6) : grade 1 non infecté ; **2 léger** (peau/sous-cutané, érythème < 2 cm) ; **3 modéré** (structures profondes ou érythème ≥ 2 cm, sans signes généraux) ; **4 sévère** (SRIS ≥ 2 critères) ; ostéite : ajouter « (O) » à 3 ou 4.
- Ostéite évoquée (diapo 4) : plaie chronique > 1 mois et surface > 2 cm² et/ou profondeur > 3 mm ; orteil « saucisse » ; contact osseux positif ; os exposé. « Il n'est pas recommandé d'utiliser un biomarqueur sérique (CRP, VS, procalcitonine) dans le diagnostic d'une OPPD ».
- **Hospitalisation** (diapo 5) : extension sous-cutanée, dermohypodermite rapidement progressive, collection, bulles, crépitation, taches ecchymotiques, nécrose, anesthésie ; « Fièvre > 38°C, qSOFA* ≥ 2 » ; leucocytes > 12 ou < 4 G/L, déséquilibre glycémique, acidose, insuffisance rénale aiguë.
- **Prélèvements à faire** (diapo 7) : « prélever uniquement en présence de signes cliniques évocateurs d'une infection de plaie (grade 2, 3 ou 4) » ; « Débrider avant tout prélèvement » ; superficiel : « curetage-écouvillonnage » ; profond : biopsie tissulaire des berges ; collection : aspiration à l'aiguille ; hémocultures « dans le grade 4 » ; biopsie osseuse si ostéite suspectée.
- **À ne pas faire** (diapo 8) : inoculer en flacons d'hémoculture ; « prélever par écouvillonnage superficiel de la plaie » ; biologie moléculaire en 1re intention ; anatomopathologie des biopsies osseuses.
- Antibiothérapie (diapo 11) : pas d'antibiotique local ; probabiliste « dès lors que le diagnostic d'infection de la peau et des tissus mous est posé » ; **pas** de probabiliste « en cas d'ostéite sans infection associée de la peau ou des tissus mous ».
- Cibles (diapo 12) : toujours SAMS ; plaie récente (< 4 semaines) : SAMS + streptocoques ; plaie chronique (≥ 4 semaines) : + entérobactéries et anaérobies ; pas de couverture P. aeruginosa, SARM, entérocoques dans les formes non graves.
- **Grade 2, plaie récente (PO)** (diapo 13) : « Céfalexine ou clindamycine en première intention » ; SARM récent/colonisation : « Pristinamycine ou linézolide » ; « Non recommandé : cyclines, cotrimoxazole, fluoroquinolones ».
- **Grade 2 plaie chronique ou grade 3** (diapo 13) : « Amoxicilline/acide clavulanique » ; allergie sans gravité : « ceftriaxone + métronidazole » ; allergie grave : avis infectiologique ; SARM : avis infectiologique (ajout pristinamycine, linézolide, doxycycline ou cotrimoxazole).
- **Grade 4 sans sepsis ni choc** (diapo 14) : amoxicilline/acide clavulanique ; mêmes alternatives ; P. aeruginosa récent sensible : pipéracilline/tazobactam.
- **Grade 4 avec sepsis ou choc** (diapo 15) : « Pipéracilline/tazobactam + (lipo)glycopeptide ou linézolide » ; allergie non grave : « céfépime + métronidazole + (lipo)glycopeptide ou linézolide ou ceftobiprole + métronidazole » ; allergie grave aux β-lactamines : « aztréonam + métronidazole + (lipo)glycopeptide ou linézolide » ; « Si choc septique : ajout d'amikacine » ; pas de carbapénème « sauf si suspicion de BLSE », pas de tigécycline.
- Réévaluation (diapo 16) : « dès 48-72 heures » ; échec à 72 h : rechercher posologie inadaptée, inobservance, intolérance, abcès profond, ischémie, absence de décharge avant d'élargir.
- Chirurgie (diapo 17) : chirurgie **en urgence** si « abcès profond, nécrose extensive, gangrène, gaz sous cutané, syndrome de loge » ; bilan vasculaire récent grades 3-4.
- **Durées** (diapo 29) : peau/tissus mous grade 2 : **7 jours** ; grade 3 ou 4 : **10 jours** (après excision de la nécrose ; jusqu'à 14 jours si pas d'amélioration à J7) ; ostéite sans chirurgie : **6 semaines** ; après chirurgie partielle (ostéite résiduelle) : **3 semaines** ; après amputation complète : **5 jours** (sinon 7 à 14 j si infection des tissus mous persistante).
- Suivi (diapo 30) : clinique jusqu'à cicatrisation et 2 mois après ; pas de biologie/imagerie si bonne évolution.
- **Posologies « peau et tissus mous »** (diapo 26-27 ; « Posologies à adapter à la fonction rénale … validées pour des patients dont l'IMC est < 30 kg/m2 ») :
  - amoxicilline : « PO : 1 g /8h si streptocoque » ; « IV : 50 à 100 mg/kg/j » (50 si streptocoque, 100 sinon) ;
  - amoxicilline-acide clavulanique : « PO : 1 g/8h » ; « IV : 1-2 g/8h » ;
  - céfalexine : « PO : 1g/8h » ; céfazoline : « IV : 80-100 mg/kg/j » ;
  - oxacilline ou cloxacilline : « IV : 100 mg/kg/j » ;
  - clindamycine : « PO ou IV : 600 mg/8h si poids < 100 kg » ; « 900 mg/8h si poids > 100 kg » ;
  - cotrimoxazole : « PO : 800/160 mg/8-12h » ;
  - pipéracilline-tazobactam : « 12-16 g/j » ;
  - vancomycine : « IV : 15-20 mg/kg/j » (⚠ unité « /j » telle qu'écrite : ambiguë, cf. § 11) ;
  - linézolide : « PO ou IV : 600 mg/12h » ;
  - pristinamycine : « PO : 1g/8h » ;
  - ceftriaxone : « 1g/j » ; céfotaxime : « 50-100 mg/kg/j » ; céfépime : « 2g/12h » ; aztréonam : « 1g/8h » ; amikacine : « 25-30 mg/kg/j » ; daptomycine : « IV : 6-8 mg/kg/j ».
- Tableaux par bactérie (diapo 21) : SAMS 1er choix oxacilline/cloxacilline/céfazoline IV ou céfalexine PO ; relais oral « Céfalexine Ou clindamycine Ou cotrimoxazole » ; SARM : vancomycine, teicoplanine, daptomycine, linézolide, tédizolide ; C1G possibles si allergie à la pénicilline « sauf si allergie croisée aux céphalosporines ou réaction d'hypersensibilité immédiate ».

---

## 6. `IWGDF-IDSA-2023-pied-diabetique` — compléments (déjà au registre)

- **URL** : https://iwgdfguidelines.org/wp-content/uploads/2023/07/IWGDF-2023-04-Infection-Guideline.pdf (Senneville É et al.). **Accès** : consultee. **Vigueur** : en_vigueur (mise à jour 2027 annoncée, non publiée).
- Rec. 1b (p. 5, Strong; Low) : grader la sévérité avec la classification IWGDF/IDSA (Table 1, p. 14 ; SIRS conservé, pas de remplacement par qSOFA, p. 13).
- Rec. 2 (p. 5, Conditional; Low) : hospitaliser les infections sévères ou modérées avec comorbidités clés ; p. 15 : l'ostéite « does not necessarily require hospitalisation ». Table 2 (p. 16) : facteurs d'hospitalisation (instabilité, IV nécessaire, ischémie sévère, chirurgie, échec ambulatoire).
- Rec. 5 (p. 5, Conditional; Moderate) : culture « preferably by aseptically collecting a tissue specimen (by curettage or biopsy) ». Rationale p. 18 : infection aiguë non sévère sans antibiotique récent → probabiliste sans culture « may be reasonable ».
- Rec. 10 (p. 5, Conditional; Moderate) : ostéite suspectée → échantillon **osseux** plutôt que tissus mous.
- Rec. 11 (p. 5) : ne pas traiter les ulcères non infectés.
- Rec. 12b (p. 5, Strong; High) : tissus mous « for a duration of 1 to 2 weeks » ; 12c : jusqu'à 3-4 semaines si extension, lenteur, AOMI sévère ; 12d : réévaluer si non résolu à 4 semaines.
- (Numérotation de la liste p. 5-7 ; dans le corps du texte, la numérotation est décalée d’un rang à partir de la 15 — ex. « Recommendation 16 » p. 28 = Rec. 17 de la liste.)
- Rec. 14 (p. 6, BPS) : infection légère, sans antibiotique récent, climat tempéré → Gram + aérobies seuls.
- Rec. 16 (p. 6, BPS) : pas de couverture empirique de P. aeruginosa en climat tempéré.
- Rec. 17 (p. 6, Conditional; Low) : ostéite : jusqu'à 3 semaines après amputation mineure avec berge osseuse positive ; **6 semaines** sans résection.
- Rec. 19-21 (p. 6) : avis chirurgical urgent si sévère ou gangrène, nécrose, abcès profond, syndrome de loge, ischémie sévère ; chirurgie précoce (24-48 h) modérée/sévère ; avis vasculaire si AOMI.
- Table 4 (p. 25-26, « from Lipsky et al. ») : légère → cloxacilline ou céfalexine ; allergie → clindamycine, fluoroquinolone, cotrimoxazole, doxycycline ; modérée/sévère → amoxicilline/clavulanate, C2G/C3G ; ischémie/nécrose/gaz → ajouter couverture anaérobie ; SARM → glycopeptides, linézolide, daptomycine… **Aucune posologie** (« Given at usual recommended doses for serious infections »).

---

## 7. `IDSA-2014-SSTI` — Stevens DL et al., « Practice Guidelines for the Diagnosis and Management of Skin and Soft Tissue Infections: 2014 Update by the IDSA »

- **URL** : https://www.idsociety.org/practice-guideline/skin-and-soft-tissue-infections/ ; doi:10.1093/cid/ciu296. **Accès** : consultee (texte des recommandations et résumés de preuves, page IDSA) ; **Tables 2, 4, 5 (posologies) non lisibles** (images). **Vigueur** : en_vigueur (« CURRENT » sur la page IDSA).
- **Abcès / furoncles / anthrax** (II) : culture du pus « recommended, but treatment without these studies is reasonable in typical cases (strong, moderate) » ; « Incision and drainage is the recommended treatment » (strong, high) ; antibiotique anti-S. aureus en complément décidé sur la présence d'un SIRS (strong, low) ; anti-SARM si échec, immunodépression marquée, ou « SIRS and hypotension » (strong, low).
- Abcès récidivant (III) : rechercher une cause locale ; après culture, « 5- to 10-day course » (weak, low).
- **Cellulite / érysipèle** (IV) : cultures « not routinely recommended (strong, moderate) » ; hémocultures et prélèvements à envisager si chimiothérapie, neutropénie, immunodépression cellulaire sévère, immersion, morsure animale ; forme typique sans signes systémiques : antibiotique « active against streptococci » (strong, moderate) ; **anti-SARM** (vancomycine ou autre) si traumatisme pénétrant, SARM ailleurs, colonisation nasale SARM, usage de drogues IV ou SIRS (strong, moderate) ; durée « 5 days, but treatment should be extended if the infection has not improved » (strong, high) ; surélévation et traitement des facteurs favorisants (strong, moderate) ; examiner les espaces interdigitaux.
- Corticoïdes (V) : prednisone 40 mg/j 7 jours « could be considered » chez le non-diabétique (weak, moderate) — **⚠ diverge de HAS 2019 (grade C : ne pas prescrire)**.
- Cellulite récidivante (VI) : prophylaxie si « 3–4 episodes of cellulitis per year » (weak, moderate) — HAS : à partir de 2 épisodes/an.
- **Fasciite nécrosante** (VIII) : avis chirurgical rapide (strong, low) ; probabiliste « broad (eg, vancomycin or linezolid plus piperacillin-tazobactam or a carbapenem; or plus ceftriaxone and metronidazole) » (strong, low) ; SGA documenté : « Penicillin plus clindamycin » (strong, low) ; reprise chirurgicale « 24–36 hours after the first debridement and daily thereafter » ; antibiotiques jusqu'à absence de besoin de débridement, amélioration et apyrexie « for 48–72 hours ».
- **Morsures** (XI-XII) : traitement **préemptif 3 à 5 jours** si immunodépression, asplénie, hépatopathie avancée, œdème de la zone, lésions modérées à sévères notamment main ou face, atteinte possible du périoste ou de l'articulation (strong, low) ; morsure infectée : agent actif sur aérobies et anaérobies « such as amoxicillin-clavulanate » (strong, moderate) ; macrolides à éviter (activité variable sur P. multocida) ; morsure humaine : Eikenella corrodens « resistant to first-generation cephalosporins, macrolides, clindamycin, and aminoglycosides » ; allergie : fluoroquinolone + métronidazole ou moxifloxacine. Tétanos (XIII) : anatoxine si non vacciné depuis 10 ans.
- Durée générale (abrégé, XXIII) : « 7–14 days » pour la plupart des SSTI bactériennes chez le neutropénique (contexte neutropénie).

---

## 8. `SFMU-2017-plaies` — « Plaies aiguës en structure d'urgence — Référentiel de bonne pratique », SFMU 2017

- **URL** : https://www.infectiologie.com/UserFiles/File/spilf/recos/2017-rbp-plaies.pdf (32 p.) ; page SFMU : https://www.sfmu.org/upload/consensus/rbp_plaies2017_v2.pdf (v2, sept. 2017). **Accès** : consultee. **Vigueur** : en_vigueur (aucune actualisation trouvée).
- Prélèvements (§ 3.3.4, p. 10) : « Les prélèvements superficiels ne sont pas indiqués avant mise en route d'un traitement antibiotique. Seule la ponction d'une éventuelle collection profonde est justifiée » ; morsure (p. 18) : « Il n'y a pas d'indication à réaliser de prélèvement en l'absence de signe infectieux, même si la plaie est vue tardivement. »
- **Morsures** (p. 10) : « L'antibiothérapie doit être systématique pour toutes les plaies profondes résultant d'une morsure » ; durée « généralement de cinq jours », réévaluation « systématiquement à 48 h » ; « amoxicilline et acide clavulanique à la posologie de 1 g trois fois par jour » ; allergie : « pristinamycine à 1 g deux à trois fois par jour ou la clindamycine 600 mg trois fois par jour » ; infection patente ou morsure vue tardivement : « prolongée pour un total de 10 à 14 jours ».
- Tableau 1 (p. 11), morsures de mammifères (Pasteurella, streptocoques, staphylocoques, anaérobies) : Protocole 1 amoxicilline-acide clavulanique 1 g/8 h PO ; allergie aux pénicillines : Protocole 2 « Doxycycline 100 mg / 12 h PO » ; si cyclines contre-indiquées et allergie : Protocole 3 « Pristinamycine 1 g / 8 h PO », « Clindamycine 600 mg / 8 h PO », « Cotrimoxazole 800 mg / 160 mg / 12 h PO » ; 5 jours (à poursuivre si infection compliquée). Contre-indications des cyclines listées : « deuxième et troisième trimestres de grossesse, allaitement, insuffisance hépatique, insuffisance rénale, exposition au soleil ».
- Tableau 1, plaies traumatiques infectées : érythème/induration > 5 cm, lymphangite ou signes généraux sans gravité → Protocole 1 (allergie : Protocole 3) **7 jours** ; critères de gravité locaux (crépitation, nécrose) ou généraux → « Hospitalisation immédiate et avis chirurgical et infectiologue urgent ».
- Tableau 2 (p. 12) : chien/chat (Pasteurella < 24 h ; pyogènes 2 j ; Capnocytophaga ; Bartonella pour le chat ; rage) ; homme (streptocoques, S. aureus, Eikenella, anaérobies ; VIH, VHC, VHB).
- § 4.1.2 (p. 17-18) : risque d'infection « de 30 à 50 % » ; main à risque ; plaie profonde de chat peu accessible : laissée ouverte, fermeture secondaire J4-J5 ; rage : contacter le centre antirabique ; consultation chirurgicale pour lésions ostéo-tendineuses, face complexe, nerfs, complications ; « réévaluation clinique à 48 h ».

---

## 9. `WSES-2022-SSTI` — Sartelli M et al., World J Emerg Surg 2022;17:3 (recoupement)

- **URL** : https://wjes.biomedcentral.com/articles/10.1186/s13017-022-00406-2 (PDF lu). **Accès** : consultee (sections NSTI). **Vigueur** : en_vigueur (consensus international d'experts, non français).
- NSTI (p. 14) : probabiliste large couvrant Gram +, Gram − et anaérobes ; « Linezolid and clindamycin play an important role because they may significantly inhibit exotoxin production ».
- Tableau NSTI, fonction rénale normale (p. 17-18) : **patient stable** : amoxicilline/clavulanate « 1.2/2.2 g every 8 h » ou ceftriaxone 2 g/24 h + métronidazole 500 mg/8 h ou céfotaxime 2 g/8 h + métronidazole, **+ clindamycine « 600–900 mg every 8 h »** ; **patient instable** : pipéracilline/tazobactam « 4.5 g every 6 h » ou méropénème 1 g/8 h ou imipénème 500 mg/6 h, **+** linézolide « 600 mg every 12 h » ou tédizolide, ou vancomycine « 25–30 mg/kg loading dose then 15–20 mg/kg/dose every 8 h », teicoplanine, daptomycine 6-8 mg/kg/24 h, **+ clindamycine 600–900 mg/8 h**.

---

## 10. `HCSP-2014-SARM-Co` (contexte)

- **URL** : https://www.hcsp.fr/Explore.cgi/Telecharger?NomFichier=hcspr20140710_infectionscutaneesSarmCo.pdf (48 p.). **Accès** : consultee (passages). **Vigueur** : en_vigueur (référencé par HAS 2019).
- § 6.4.4 (p. 31) : association d'une antibiothérapie systémique à la décolonisation « n'est pas souhaitable en première intention » ; si décidée : « court (inférieur à 7 jours) », « rifampicine et triméthoprime/sulfaméthoxazole ou doxycycline » selon antibiogramme.
- Hors champ du moteur (gestion de cas groupés) ; à garder comme renvoi.

---

## 11. Divergences et zones grises

1. **Acide clavulanique maximal** : HAS 2019 § 1.8.2 et fiche HAS 2021 « 375 mg/jour » vs HAS 2019 Tableau 1 « 250mg/jour ». À trancher : retenir la fiche HAS 2021 (plus récente, MAJ 2024) en signalant l'incohérence.
2. **Durée après morsure** : HAS 2019/2021 **7 jours** (DHBNN après morsure, traitement curatif) ; SFMU 2017 **5 jours** (préemptif et infection simple), **10 à 14 jours** si infection patente ou morsure vue tardivement ; IDSA 2014 préemptif **3 à 5 jours** sur indications. Les situations ne sont pas identiques (préemptif vs curatif) : à modéliser séparément.
3. **Indication du préemptif après morsure** : SFMU « systématique pour toutes les plaies profondes » ; IDSA : sur facteurs de risque (immunodépression, asplénie, main/face, etc.).
4. **Allergie après morsure** : HAS 2021 → « avis spécialisé » ; SFMU → doxycycline, puis pristinamycine/clindamycine/cotrimoxazole ; **mais** les RCP classent *Pasteurella* parmi les espèces **naturellement résistantes** à la pristinamycine (RCP Pyostacine § 5.1) et à la clindamycine (RCP Dalacine § 5.1) ; IDSA : clindamycine inactive sur *Eikenella* (morsure humaine). → Ne pas automatiser pristinamycine ou clindamycine en monothérapie après morsure : **avis spécialisé** (aligné HAS 2021).
5. **Antibiotique après drainage d'abcès** : HAS 2019/2021 systématique 5 jours ; IDSA 2014 selon SIRS / terrain.
6. **Corticoïdes dans la DHBNN** : HAS 2019 non (grade C) ; IDSA 2014 « could be considered » (weak). Suivre HAS.
7. **Seuil de prophylaxie des récidives** : HAS ≥ 2 épisodes/an ; IDSA 3-4 épisodes/an.
8. **Clindamycine > 100 kg** : HAS 600 mg ×4/j (2,4 g/j, = maximum RCP) ; SPILF 2023 pied diabétique **900 mg/8 h** (2,7 g/j, **au-dessus du maximum RCP oral et IV de 2400 mg/24 h**) ; WSES 600-900 mg/8 h. Zone grise : rester au RCP sauf avis spécialisé.
9. **Vancomycine** : SPILF 2023 « 15-20 mg/kg/j » (unité vraisemblablement par dose, ambiguë) vs WSES « 15–20 mg/kg/dose every 8 h » après dose de charge. Ne pas reprendre la valeur SPILF telle quelle ; renvoyer au schéma vancomycine déjà intégré (`RCP-vancomycine`, `ASHP-IDSA-2020-vancomycine-STP`).
10. **Céfazoline / cloxacilline** : HAS 2019 Tableau 1 en g/j (céfazoline 3-6 g/j ; cloxacilline 6-12 g/j) vs fiche HAS 2021 en mg/kg/j (céfazoline 80 ; cloxacilline 100) vs SPILF 2023 (céfazoline 80-100 ; cloxacilline 100).
11. **Durée pied diabétique tissus mous** : SPILF 7 j (grade 2) / 10 j (grades 3-4, jusqu'à 14) ; IWGDF 1 à 2 semaines (jusqu'à 3-4). Compatibles ; SPILF plus précis.
12. **Classification pied diabétique et gravité** : IWGDF garde le SIRS pour le grade 4 ; SPILF ajoute qSOFA ≥ 2 et biologie dans les critères d'hospitalisation.
13. **DHBN-FN, probabiliste de l'adulte** : seule source française = consensus 2000 (pénicilline G + clindamycine ; uréidopénicilline + métronidazole ± amikacine), sans dose ni durée ; IDSA 2014 et WSES 2022 proposent des schémas plus larges incluant un anti-SARM (vancomycine/linézolide). **Pas de texte français en vigueur récent** → zone grise.
14. **Pénicillines M dans la DHBNN** : déconseillées (moins actives sur SGA, argumentaire 2019 p. 38, chapitre enfant) ; elles restent recommandées pour l'abcès (SA).
15. **Allaitement et clindamycine orale** : RCP Dalacine 300 mg : allaitement en **contre-indication (§ 4.3)** mais « l'allaitement est possible » (§ 4.6) — incohérence interne du RCP.

---

## 12. Proposition de modélisation

> Tout ce qui suit est une proposition de règles **à valider** ; les éléments marqués **[brouillon]** ou **[avis]** ne sont pas tranchés par les sources.

### 12.1 Situations cliniques à distinguer (arbre de tri)
1. **Signes de nécrose / gravité** (HAS 2019 § 1.2.2 et § 2.2 ; SPILF 2023 diapo 5 pour le pied) → **DHBN-FN suspectée : urgence médico-chirurgicale** (appel 15 / chirurgien), prélèvements per-opératoires, probabiliste selon localisation [brouillon], réanimation. *Prioritaire sur toutes les autres branches.*
2. **Pied d'un patient diabétique** → branche IPPPD (SPILF 2023 / IWGDF 2023), grade 1 à 4, (O).
3. **Plaie chronique (ulcère, escarre) hors pied diabétique** → règle existante R-PRELEVEMENT-SUPERFICIEL ; si dermohypodermite contiguë → branche DHBNN ; si pus/abcès → branche abcès ; sinon avis spécialisé, pas d'antibiothérapie d'épreuve (HAS 2019 § 3.4).
4. **Collection purulente** : abcès / furoncle / anthrax / furonculose.
5. **Morsure** (animale / humaine) : plaie récente sans signe d'infection (préemptif) vs plaie infectée / DHBNN après morsure.
6. **DHBNN** (placard inflammatoire fébrile, unilatéral) : commune vs situations particulières (soins, aquatique, injection, face, périnée, immunodépression, voyage).
7. **Impétigo** : localisé vs grave.

### 12.2 Données d'entrée (questions à poser)
- Localisation (membre inférieur/supérieur, face, périnée/OGE, tronc, pied) ; uni/bilatéral ; fièvre/frissons.
- Signes de gravité : qSOFA (conscience, FR > 22, PAS < 100) ; douleur disproportionnée ; lividités, taches cyaniques, crépitation, anesthésie, induration dépassant l'érythème, nécrose, bulles ; extension rapide en heures ; aggravation à 24-48 h sous antibiotique adapté.
- Collection/pus ; nombre de lésions ; surface (> 2 % ?) ; dermohypodermite péri-lésionnelle.
- Porte d'entrée / contexte : morsure (animal, humain, délai, profondeur, main/face, articulation), plaie liée aux soins (cathéter, site opératoire), injection IV, exposition aquatique/marine, voyage tropical, exposition professionnelle (poisson/viande).
- Terrain : diabète (et équilibre), immunodépression, asplénie, hépatopathie, insuffisance cardiaque NYHA ≥ III, insuffisance rénale sévère, IMC (> 30, > 40, poids > 100 kg), âge > 75 ans polypathologique, possibilité de traitement oral et de surveillance à domicile, AOMI/ischémie.
- Allergie aux β-lactamines (documentée ? grave/immédiate ?) ; grossesse/allaitement ; AVK ; colchicine ; ciclosporine/tacrolimus.
- Antécédents : épisodes de DHBNN dans l'année ; SARM (infection/colonisation récente) ; antibiotique récent ; P. aeruginosa récent (pied).
- Pied diabétique : signes d'infection (≥ 2), érythème < ou ≥ 2 cm, structures profondes, SIRS, ancienneté de la plaie (< ou ≥ 4 semaines), ostéite suspectée, ischémie.

### 12.3 DHBNN commune de l'adulte
| Élément | Proposition | Source / extrait |
|---|---|---|
| Diagnostic | Clinique ; aucun examen si non compliquée | HAS 2019 § 1.2.1, § 1.6 (AE) |
| Prélèvements | Seulement dans les 8 situations du § 1.6 (morsure, aquatique, tropique, soins/injection, suppuration, échec, immunodépression, gravité) | HAS 2019 § 1.6 (AE) |
| Hospitalisation | Critères § 1.7 (d'emblée / secondaire) | HAS 2019 § 1.7 (AE) |
| 1re ligne | Amoxicilline PO 50 mg/kg/j en 3 prises, max 6 g/j | HAS 2019 § 1.8.2 ; `HAS-2021-DHBNN-adulte` |
| Allergie documentée | Clindamycine 600 mg ×3/j (×4 si > 100 kg) **ou** pristinamycine 1 g ×3/j | idem |
| Durée | **7 jours**, ne pas prolonger pour des signes cutanés résiduels | idem |
| Non recommandé | Antibiotique local ; AINS ; corticoïdes (grade C) | HAS 2019 § 1.8.2-1.8.3 |
| Mesures | Repos, surélévation ; contention ≥ 3 semaines ; anticoagulation prophylactique discutée ; vaccination antitétanique | HAS 2019 § 1.8.4 (AE) |
| Facteurs favorisants | Traiter porte d'entrée (intertrigo, plaie, dermatose), lymphœdème (compression), obésité | HAS 2019 § 1.9 (AE) |
| Prévention des récidives | ≥ 2 épisodes/an + facteurs non contrôlables : benzathine-pénicilline 2,4 MUI IM / 2-4 sem. ou pénicilline V 1-2 MUI/j en 2 prises ; azithromycine 250 mg/j si allergie (hors AMM, HAS 2019 seulement) [brouillon pour l'azithromycine] | HAS 2019 p. 15 ; `HAS-2021-DHBNN-adulte` |
| Surveillance | Réévaluer à 24-48 h (fièvre persistante, extension → hospitalisation secondaire ; aggravation → évoquer DHBN) | HAS 2019 § 1.7, § 1.2.2 |
| Voie IV en hospitalisation | **Non précisée** par HAS 2019 (texte ambulatoire). Argumentaire et SPILF 2023 pied (diapo 26) : amoxicilline IV 50 mg/kg/j si streptocoque. **[brouillon]** | SPILF 2023 diapo 26 |
| Avis spécialisé | DHBNN liées aux soins ; exposition aquatique/marine ; injection septique ; face (staphylococcie maligne : hospitalisation urgente) ; périnée (Fournier) | HAS 2019 p. 8-9, 13 |
| SARM | Non couvert en probabiliste en France (SGA ; « pas d'intérêt à l'élargissement ») ; IDSA couvre le SARM si drogues IV/SARM connu/SIRS → **divergence**, avis | HAS 2019 § 1.8.1 ; IDSA IV |
| Grossesse | Non traitée par HAS 2019. Amoxicilline : CRAT pénicillines (registre) ; clindamycine : éviter T1 (RCP § 4.6) ; pristinamycine : « peut être envisagée » (RCP § 4.6) | RCP |

### 12.4 Abcès cutané, furoncle, anthrax, furonculose
| Situation | Geste / prélèvement | Antibiotique | Durée | Source |
|---|---|---|---|---|
| Furoncle isolé non compliqué | Soins locaux ; pas de prélèvement | **Aucun** (ni local ni général) | — | HAS 2019 § 4.2, 4.4.1 ; `HAS-2021-furoncles` |
| Furoncle compliqué (anthrax, multiplication, DH périlésionnelle, abcédation, fièvre) ou à risque (immunodépression, diabète, obésité, face/main/péri-orificiel, échec) | Prélèvement du pus avant ATB, sans attendre le résultat | Clindamycine 600 mg ×3/j (×4 si > 100 kg) ou pristinamycine 1 g ×3/j | **5 jours** | HAS 2019 § 4.4.2 ; `HAS-2021-furoncles` |
| Furonculose (poussée) | Prélèvement ; chlorhexidine 7 j ; décolonisation après guérison (pas d'antibiotique général pour décoloniser) | Clindamycine ou pristinamycine (mêmes doses) | **7 jours** | HAS 2019 § 5 ; `HAS-2021-furonculoses` |
| Abcès cutané | **Incision-drainage** + prélèvement du pus + hygiène | Clindamycine PO/IV 600 mg ×3/j (×4 si > 100 kg) ou pristinamycine PO 1 g ×3/j ; ou cloxacilline/oxacilline IV 100 mg/kg/j ; ou céfazoline IV 80 mg/kg/j | **5 jours** | HAS 2019 § 6.5 ; `HAS-2021-abces-cutanes` |
| Abcès sur cathéter / post-opératoire | Hors champ : infection de cathéter / ISO | — | — | HAS 2019 p. 25 |
| Face, staphylococcie « maligne » | Hospitalisation en urgence | **[avis]** (pas de schéma dans la reco) | — | HAS 2019 p. 8 |
| SARM communautaire suspecté/connu | Antibiogramme ; IDSA : anti-SARM si échec, immunodépression, SIRS + hypotension | Molécule selon antibiogramme **[avis]** ; cas groupés : HCSP 2014 | — | IDSA II ; HCSP 2014 |

Note : clindamycine et pristinamycine couvrent le SAMS ; le RCP classe le SARM « inconstamment sensible » à la clindamycine et « habituellement sensible » à la pristinamycine (§ 5.1) — ne dispense pas de l'antibiogramme.

### 12.5 DHBN / fasciite nécrosante (urgence médico-chirurgicale)
- **Action principale** : appel 15 / chirurgien en urgence ; chirurgie d'excision « au plus vite » (CC 2000 ; HAS 2019 § 2.2 ; IDSA VIII). Ne pas retarder par l'imagerie (HAS 2019 p. 18).
- Prélèvements : hémocultures, prélèvements per-opératoires ; ponction-aspiration possible sans retarder la chirurgie (HAS 2019 § 2.3).
- **Probabiliste [brouillon, avis spécialisé obligatoire]** — aucune source française récente :
  - Membres / cervico-facial : pénicilline G + clindamycine (CC 2000) ; IDSA/WSES : bêta-lactamine large + anti-SARM, + clindamycine (WSES).
  - Abdomino-périnéal (dont Fournier) : uréidopénicilline (pipéracilline[-tazobactam]) + métronidazole ± amikacine si P. aeruginosa chez l'immunodéprimé (CC 2000 ; la mention « tazobactam » n'est pas dans le texte de 2000).
  - Toxicomanie IV : couverture staphylococcique + streptococcique (CC 2000).
  - Posologies : non données par la source française ; recoupement WSES 2022 (pipéracilline-tazobactam 4,5 g/6 h ; clindamycine 600-900 mg/8 h ; linézolide 600 mg/12 h ; vancomycine 25-30 mg/kg puis 15-20 mg/kg/8 h). Pour la clindamycine, plafond RCP 2400 mg/24 h.
  - SGA documenté : pénicilline + clindamycine (IDSA VIII, strong, low).
  - Durée : IDSA « until further debridement is no longer necessary, the patient has improved clinically, and fever has been absent for 48–72 hours » ; aucune durée chiffrée française → **[avis]**.

### 12.6 Morsures
| Situation | Proposition | Source |
|---|---|---|
| Toute morsure | Lavage abondant, parage ; tétanos ; **rage** (centre antirabique) ; morsure humaine : risque VIH/VHB/VHC | SFMU 2017 § 3.3.5, § 4.1.2 ; IDSA XI, XIII |
| Prélèvement | Pas de prélèvement sans signe infectieux ; pas de prélèvement superficiel ; ponction d'une collection profonde seulement | SFMU 2017 p. 10, 18 |
| Plaie profonde de morsure sans signe d'infection (préemptif) | Amoxicilline-acide clavulanique 1 g ×3/j PO, **5 jours**, réévaluation à 48 h | SFMU 2017 p. 10-11 ; IDSA XI (3-5 j, sur facteurs) |
| Morsure infectée / DHBNN après morsure | Amoxicilline-acide clavulanique 50 mg/kg/j d'amoxicilline (≤ 6 g/j ; ≤ 375 mg/j de clavulanate), **7 jours** | HAS 2019 § 1.8.2 ; `HAS-2021-DHBNN-adulte` |
| Infection patente étendue ou morsure vue tardivement | SFMU : total **10 à 14 jours** **[brouillon : diverge de HAS 7 j]** | SFMU 2017 p. 10 |
| Allergie aux pénicillines | **Avis spécialisé** (HAS 2021). SFMU propose doxycycline 100 mg ×2/j, sinon pristinamycine/clindamycine/cotrimoxazole — **non retenu en automatique** (Pasteurella naturellement résistante à pristinamycine et clindamycine selon RCP ; Eikenella résistante à la clindamycine selon IDSA) | `HAS-2021-DHBNN-adulte` ; RCP § 5.1 ; IDSA XII |
| Avis chirurgical | Lésions ostéo-tendineuses, articulaires, face complexe, nerfs, abcès, ostéite, arthrite | SFMU 2017 p. 18 ; IDSA XI |

### 12.7 Infection du pied diabétique (adulte)
| Grade (IWGDF) | Prélèvement | Probabiliste | Durée | Source |
|---|---|---|---|---|
| 1 (non infecté) | **Ne pas prélever** | **Pas d'antibiotique** | — | SPILF 2023 diapo 7 ; IWGDF Rec. 11 |
| 2, plaie récente (< 4 sem.) | Débridement puis curetage-écouvillonnage ; pas d'écouvillon superficiel | PO : céfalexine 1 g/8 h ou clindamycine 600 mg/8 h (900 si > 100 kg, ⚠ > RCP) ; SARM : pristinamycine 1 g/8 h ou linézolide 600 mg/12 h | 7 j | SPILF 2023 diapo 13, 26-27, 29 |
| 2 plaie chronique (≥ 4 sem.) ou 3 | Biopsie tissulaire si profonde ; aspiration si collection | Amoxicilline-acide clavulanique (PO 1 g/8 h ; IV 1-2 g/8 h) ; allergie non grave : ceftriaxone 1 g/j + métronidazole ; allergie grave/SARM : avis infectiologique | 7 j (grade 2) ; 10 j (grade 3), jusqu'à 14 j | idem |
| 4 sans sepsis | + hémocultures | Amoxicilline-acide clavulanique ; P. aeruginosa récent : pipéracilline-tazobactam 12-16 g/j | 10 j (jusqu'à 14) | SPILF 2023 diapo 14, 29 |
| 4 avec sepsis/choc | Hémocultures ; chirurgie urgente si abcès profond, nécrose, gaz, loge | Pipéracilline-tazobactam + (lipo)glycopeptide ou linézolide ; allergie non grave : céfépime + métronidazole + glycopeptide/linézolide ; allergie grave : aztréonam + métronidazole + glycopeptide/linézolide ; choc : + amikacine | 10 j (jusqu'à 14) | SPILF 2023 diapo 15, 17, 29 |
| Ostéite (O) | **Biopsie osseuse** avant ATB ; pas de probabiliste si ostéite isolée sans infection des tissus mous | Selon documentation | 6 semaines sans chirurgie ; 3 semaines si ostéite résiduelle ; 5 j après amputation complète | SPILF 2023 diapo 7, 11, 29 ; IWGDF Rec. 10, 17 |
- Hospitalisation : grade 4, grade 3 avec comorbidités (AOMI) ; critères SPILF diapo 5 ; IWGDF Rec. 2.
- Réévaluation 48-72 h, y compris en ambulatoire (diapo 16). Avis vasculaire si AOMI (IWGDF Rec. 21).
- Posologies : à adapter à la fonction rénale ; « validées pour des patients dont l'IMC est < 30 » (SPILF diapo 26).

### 12.8 Impétigo de l'adulte
- Localisé (< 2 %, < 6 lésions, pas d'extension) : mupirocine 2-3 ×/j 5 jours ; pas d'antibiotique général (HAS 2019 § 7.4.2, grade C).
- Grave (ecthyma, > 2 %, > 6 lésions, extension rapide) : prélèvement ; pristinamycine 1 g ×3/j **7 jours** ou céfalexine 2-4 g/j 7 jours ; allergie : pristinamycine ; pas d'antibiotique local associé (HAS 2019 § 7.4.3 ; `HAS-2021-impetigo`).
- Impétiginisation : traiter aussi la dermatose sous-jacente (HAS 2019 § 7.4.4).
- La céfalexine n'est pas dans la liste des molécules de l'application (molécule nouvelle).

### 12.9 Prélèvements — tableau récapitulatif (« faire / ne pas faire »)
| Situation | Faire | Ne pas faire | Source |
|---|---|---|---|
| DHBNN non compliquée | — | Aucun examen | HAS 2019 § 1.6 |
| DHBNN avec situation particulière (8 cas) | Prélèvement local de la porte d'entrée ± hémocultures | — | HAS 2019 § 1.6 |
| Furoncle isolé | — | Pas de prélèvement ; pas de recherche LPV | HAS 2019 § 4.2 |
| Furoncle compliqué / à risque, furonculose, abcès | Pus avant ATB (sans attendre le résultat) | — | HAS 2019 § 4.2, 5.2, 6.4 |
| Furonculose | Dépistage des gîtes seulement après échec d'une 1re décolonisation | Dépistage d'emblée | HAS 2019 § 5.2 |
| Impétigo peu étendu, 1re poussée | — | Pas de prélèvement | HAS 2019 § 7.2 |
| Impétigo autres formes | Pus / liquide de bulle | — | HAS 2019 § 7.2 |
| Plaie chronique | Pus si suppuration franche | Prélèvement systématique ; prélèvement d'une plaie non suppurée | HAS 2019 § 3.3.1 |
| Pied diabétique grade 1 | — | Pas de prélèvement | SPILF 2023 diapo 7 |
| Pied diabétique grades 2-4 | Après débridement : curetage, biopsie, aspiration ; hémocultures grade 4 ; biopsie osseuse si ostéite | Écouvillon superficiel ; flacons d'hémoculture ; PCR en 1re intention ; anapath osseuse | SPILF 2023 diapo 7-8 |
| Morsure / plaie aiguë sans signe infectieux | — | Pas de prélèvement ; pas de prélèvement superficiel | SFMU 2017 p. 10, 18 |
| DHBN-FN | Prélèvements per-opératoires ; ponction-aspiration possible | Retarder la chirurgie pour l'imagerie | HAS 2019 § 2.3 ; CC 2000 |

---

## 13. Molécules

### 13.1 Pristinamycine — `RCP-pristinamycine`
- **Spécialité** : PYOSTACINE 500 mg, comprimé pelliculé (Sanofi Winthrop Industrie), **CIS 63728481**. RCP « ANSM - Mis à jour le : 17/06/2026 » (fiche BDPM « Dernière mise à jour le 03/11/2026 »). URL : https://base-donnees-publique.medicaments.gouv.fr/medicament/63728481/extrait. **Accès** : consultee. Liste I, procédure nationale. Une présentation 250 mg existe (citée § 4.2, non lue).
- **§ 4.1 Indications** (adulte et enfant) : « Sinusites maxillaires aiguës » ; « Exacerbations aiguës de bronchites chroniques » ; « Pneumonies communautaires de gravité légère à modérée » ; « Infections de la peau et des tissus mous ».
- **§ 4.2 Posologie adulte** (tableau) :
  - sinusites maxillaires aiguës : « 1 g x2/jour », 4 jours ;
  - exacerbations aiguës de bronchites chroniques : « 1 g x 3/jour », 4 jours ;
  - pneumonies communautaires légères à modérées : « 1 g x 3/jour », « 7 à 14 jours » ;
  - **infections de la peau et des tissus mous : « 1 g x 2/jour à 1 g x 3/jour », « 8 à 14 jours »** ;
  - « La posologie peut être portée à 4 g/jour dans des cas pouvant présenter des facteurs de sévérité. »
  - ⚠ Durée RCP peau 8-14 j ≠ recommandations (5 j abcès/furoncle, 7 j DHBNN/furonculose/impétigo) : suivre les recommandations.
- **Fonction rénale** (§ 4.2) : « aucun ajustement posologique n'est jugé nécessaire chez les patients insuffisants rénaux » (« peu éliminée par le rein »). Hémodialyse : non mentionnée.
- Administration : « VOIE ORALE » ; « à prendre au moment des repas ». Pas de forme IV.
- **§ 4.3 Contre-indications** : hypersensibilité à la pristinamycine ou aux synergistines ; « Antécédent d'éruptions graves telles qu'une pustulose exanthématique aiguë généralisée … (DRESS), ou une vascularite » sous pristinamycine ; « Allergie au blé (autre que la maladie coeliaque) » ; « Administration concomitante de pristinamycine et de colchicine ».
- **§ 4.4** : « La pristinamycine n'a pas fait l'objet d'étude clinique spécifique dans le traitement d'infections du pied chez le diabétique » ; « n'est pas adaptée dans le traitement de l'angine » ; réactions cutanées graves possibles « parfois même seulement quelques heures après l'introduction » ; sensibilisation antérieure possible par la virginiamycine.
- **§ 4.5 Interactions** : **contre-indiquée avec la colchicine** (« conséquences potentiellement fatales ») ; **AVK** : « Contrôle plus fréquent de l'INR » ; **immunosuppresseurs** : augmentation des concentrations, dosages et contrôle rénal. QT, statines : **non mentionnés** dans le RCP.
- **§ 4.6 Grossesse** : « l'utilisation de la pristinamycine peut être envisagée au cours de la grossesse si besoin, malgré des données animales et cliniques insuffisantes » ; allaitement possible si pas d'alternative, chez le nouveau-né à terme sans facteur de risque digestif. **CRAT** : fiche **non trouvée** (recherche lecrat.fr sans résultat).
- **§ 4.8** : très fréquent : pesanteur gastrique, vomissements ; colites pseudo-membraneuses ; hépatites ; PEAG, SJS/NET, DRESS ; insuffisance rénale aiguë (fréquence indéterminée).
- **§ 5.1 Spectre** : habituellement sensibles : SAMS, « Staphylococcus méticilline-résistant », Streptococcus, anaérobies (Fusobacterium, Prevotella, Peptostreptococcus…) ; **naturellement résistantes : Entérobactéries, « Pasteurella », Pseudomonas, Enterococcus faecalis**.
- Autres places dans les recommandations lues : pied diabétique grade 2 si SARM (SPILF 2023 diapo 13), ajout discuté si SARM grades 3-4 (diapo 13-14), posologie « PO : 1g/8h » (diapo 27) ; morsures en cas d'allergie (SFMU 2017, Protocole 3).

### 13.2 Clindamycine — `RCP-clindamycine-orale` et `RCP-clindamycine-IV`
- **Spécialités** :
  - DALACINE 300 mg, gélule (Pfizer Holding France), **CIS 64829519**, RCP « Mis à jour le : 20/07/2026 ». URL : https://base-donnees-publique.medicaments.gouv.fr/medicament/64829519/extrait. Consultee.
  - DALACINE 600 mg, solution injectable (ampoule 4 ml, Pfizer), **CIS 69913330**, RCP « Mis à jour le : 20/07/2026 », **usage hospitalier**. URL : https://base-donnees-publique.medicaments.gouv.fr/medicament/69913330/extrait. Consultee.
- **§ 4.1** (oral et IV) : « limitées aux infections sévères, dues à des germes définis comme sensibles » : ORL, bronchopulmonaires, stomatologiques, **cutanées**, génitales, ostéoarticulaires, abdominales post-chirurgicales, septicémiques ; « à l'exception des infections méningées ». Prophylaxie : endocardite (oral, allergie aux β-lactamines) ; antibioprophylaxie chirurgicale (IV, allergie aux β-lactamines : neurochirurgie, chirurgie digestive sous-mésocolique, ORL carcinologique, gynécologique, amputation de membre, en association avec un aminoside sauf neurochirurgie).
- **§ 4.2 Posologie adulte** : oral : « 600 à 2400 mg/24 heures, en 2, 3 ou 4 prises » ; IV : « 600 à 2400 mg/24 heures, en 2, 3 ou 4 administrations ». Oral : gélules entières, « grand verre d'eau », position verticale « au moins 30 minutes » ; absorption non modifiée par l'alimentation. IV : « Ne jamais administrer par voie IV directe » ; dilution (600 mg dans 50 mL en ≥ 20 min ; 900 mg dans 50-100 mL en ≥ 30 min ; 1200 mg dans 100 mL en ≥ 40 min) ; concentration ≤ 18 mg/mL, vitesse ≤ 30 mg/min ; IM > 600 mg en une fois déconseillée.
- **Posologies recommandées pour la peau** : 600 mg ×3/j, jusqu'à ×4/j si > 100 kg, PO ou IV (HAS 2019/2021) ; 600 mg/6-8 h IV dans DHBN-FN, 900 mg si obésité (argumentaire 2019 p. 45) ; 600 mg/8 h (< 100 kg) ou 900 mg/8 h (> 100 kg) (SPILF 2023) ; 600-900 mg/8 h en association (WSES 2022, NSTI). ⚠ Le maximum RCP est 2400 mg/24 h.
- **Fonction rénale** : **pas d'adaptation posologique prévue au § 4.2** (aucune mention) ; § 4.4 : « lésions rénales aiguës … rarement signalés » → surveillance de la fonction rénale en cas de trouble rénal préexistant ou de néphrotoxiques ; § 4.9 : « L'hémodialyse et la dialyse péritonéale ne permettent pas d'éliminer efficacement la clindamycine » ; § 5.2 : métabolisme hépatique, ~10 % éliminés sous forme active dans les urines, demi-vie 2,5 h.
- **Fonction hépatique** (§ 4.4) : « augmentation des taux sériques et un allongement de la demi-vie » chez l'insuffisant hépatique ; bilans hépatique et rénal si traitement prolongé.
- **§ 4.3 Contre-indications** : hypersensibilité à la clindamycine ou à la lincomycine ; oral : enfant < 6 ans (forme) ; IV : enfant < 3 ans (alcool benzylique) ; **« en cas d'allaitement »** (oral et IV) — ⚠ contradiction avec le § 4.6 de la gélule (« l'allaitement est possible »).
- **§ 4.4 Mises en garde** : colites associées aux antibiotiques / C. difficile → arrêt immédiat ; hypersensibilité grave (DRESS, SJS, NET, PEAG, syndrome de Kounis) ; PEAG contre-indique toute réadministration ; IV : hypotension voire arrêt cardiaque si perfusion trop rapide, thrombophlébites ; IV : alcool benzylique (acidose métabolique, prudence insuffisance hépatique/rénale, grossesse, allaitement) ; oral : atteintes œsophagiennes ; lactose.
- **§ 4.5 Interactions** (précautions d'emploi) : **AVK** (« Contrôle plus fréquent de l'INR ») ; **ciclosporine, tacrolimus** (baisse des concentrations) ; **inducteurs du CYP3A4 (rifampicine)** : surveiller une perte d'efficacité ; IV : **curares** (potentialisation) ; oral : topiques gastro-intestinaux/antiacides (à distance > 2 h). QT, statines : **non mentionnés**.
- **§ 4.6 Grossesse** : gélule : « éviter d'utiliser la clindamycine au cours du premier trimestre » ; « Lors du deuxième et troisième trimestre … peut être utilisée si nécessaire ». Injectable : « il est préférable d'éviter d'utiliser DALACINE 600 mg, solution injectable en ampoule au cours de la grossesse » (alcool benzylique). **CRAT** : fiche **non trouvée** (recherche lecrat.fr sans résultat).
- **§ 5.1 Spectre** : habituellement sensibles : SAMS, Streptococcus agalactiae, anaérobies (Fusobacterium, Prevotella, Porphyromonas, Capnocytophaga, C. perfringens…) ; **inconstamment sensibles (résistance acquise ≥ 10 %) : SARM, « Streptococcus pyogenes », streptocoques oraux, Bacteroides, Peptostreptococcus, Erysipelothrix** ; **naturellement résistantes : entérobactéries, Pseudomonas, « Pasteurella », Enterococcus spp. (hors faecium)** ; résistance inductible par les macrolides (phénotype MLSB).
- ⚠ Conséquence : en DHBNN chez l'allergique, la clindamycine est recommandée par HAS alors que le RCP classe S. pyogenes « inconstamment sensible » ; l'antibiogramme (érythromycine/test d'induction) doit être exploité quand il existe.

### 13.3 Molécules déjà présentes — posologies propres à la peau (selon les recommandations)
| Molécule | Indication peau | Posologie (source) |
|---|---|---|
| Amoxicilline | DHBNN PO | 50 mg/kg/j en 3 prises, max 6 g/j, 7 j (HAS 2019, HAS 2021) ; pied : PO 1 g/8 h si streptocoque, IV 50-100 mg/kg/j (SPILF 2023) ; érysipélatoïde 50 mg/kg/j 7 j (HAS 2019) |
| Amoxicilline-acide clavulanique | DHBNN après morsure | 50 mg/kg/j d'amoxicilline, ≤ 6 g/j, clavulanate ≤ 375 mg/j, 7 j (HAS 2019 § 1.8.2, HAS 2021) [⚠ 250 mg/j dans Tableau 1] |
| | Morsure (préemptif) | 1 g ×3/j PO, 5 j (SFMU 2017) |
| | Pied diabétique grades 2 chronique-4 | PO 1 g/8 h ; IV 1-2 g/8 h (SPILF 2023) |
| | NSTI stable (recoupement) | 1,2/2,2 g toutes les 8 h IV (WSES 2022) |
| Cloxacilline (ou oxacilline) | Abcès (IV) | 100 mg/kg/j (HAS 2021 ; SPILF 2023) ; 6 à 12 g/j en 4-6 fois (HAS 2019 Tableau 1) ; pas de voie orale |
| Céfazoline | Abcès (IV) | 80 mg/kg/j (HAS 2021) ; 80-100 mg/kg/j (SPILF 2023) ; 3 à 6 g/j en 3 fois (HAS 2019 Tableau 1) |
| Cotrimoxazole | IBPTM non SGA | 1,6 à 2,4 g/j de sulfaméthoxazole PO en 2-3 prises (HAS 2019 Tableau 1, « risque d'échec … probabiliste sur S. aureus ») ; morsure (Protocole 3) 800/160 mg/12 h (SFMU) ; pied : 800/160 mg/8-12 h, non recommandé en probabiliste grade 2 (SPILF 2023). Inactif sur SGA (argumentaire 2019) |
| Pipéracilline-tazobactam | Pied grade 4 / NSTI | 12-16 g/j (SPILF 2023) ; 4,5 g/6 h (WSES 2022) ; NSTI abdomino-périnéale : « uréidopénicilline » sans dose (CC 2000) |
| Vancomycine | Pied grade 4 avec sepsis / NSTI | « IV : 15-20 mg/kg/j » (SPILF 2023, ambigu) ; 25-30 mg/kg de charge puis 15-20 mg/kg/dose /8 h (WSES 2022) ; obésité : charge sur poids réel, entretien poids ajusté + dosages (argumentaire 2019) |
| Linézolide (RCP lu par un autre agent) | SARM pied / NSTI | 600 mg/12 h PO ou IV (SPILF 2023 ; WSES 2022) ; pas d'adaptation à l'obésité (argumentaire 2019) |
| Ceftriaxone | Pied, allergie non grave | 1 g/j (+ métronidazole) (SPILF 2023) ; NSTI stable 2 g/24 h + métronidazole (WSES) |
| Amikacine | Pied grade 4 choc | 25-30 mg/kg/j (SPILF 2023) |

### 13.4 Molécules **nouvelles** nécessaires (non présentes dans l'application)
- **Pristinamycine** (RCP lu ici).
- **Clindamycine** orale et IV (RCP lus ici).
- **Linézolide** (RCP attribué à un autre agent).
- **Métronidazole** (NSTI abdomino-périnéale, pied diabétique allergie) — RCP **non lu**.
- **Céfalexine** (impétigo grave, pied grade 2, relais SAMS) — RCP **non lu**.
- **Pénicilline G** (CC 2000, DHBN-FN membres) et **benzathine-benzylpénicilline / pénicilline V** (prévention des récidives) — RCP **non lus**.
- **Doxycycline** (morsure si allergie, SFMU ; SARM pied) — RCP **non lu**.
- **Mupirocine** (topique : impétigo localisé, décolonisation) — RCP **non lu**.
- Molécules citées mais hors 1re ligne : teicoplanine, tédizolide, ceftobiprole, azithromycine (prophylaxie hors AMM).

---

## 14. Ce qui n'a pas pu être vérifié
- Article SPILF 2023 pied diabétique (Bonnet et al., Infect Dis Now 2024) : non lu → **grades des recommandations SPILF 2023 inconnus**.
- Tableaux de posologies IDSA 2014 (Tables 2, 4, 5) : images non lues.
- Recommandation française récente (SFAR/SPILF/SRLF/SFD) sur la DHBN-FN de l'adulte : **introuvable** ; texte long de la conférence de consensus 2000 téléchargé mais non exploité.
- CRAT pristinamycine et clindamycine : fiches non trouvées sur lecrat.fr (moteur de recherche du site non exploitable) → repli sur RCP § 4.6.
- Durée de l'antibiothérapie des DHBNN **hospitalisées** et relais IV → PO : non traitée par HAS 2019 (texte ambulatoire).
- Exposition aquatique/marine, voyage tropical, DHBNN liées aux soins, injection septique : sources → « avis spécialisé », sans schéma.
- IWGDF/IDSA 2027 : annoncé, non publié au 2026-11-06.
