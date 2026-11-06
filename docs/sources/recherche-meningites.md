# Recherche documentaire — Méningites bactériennes aiguës de l'adulte

Date de consultation de toutes les sources : **2026-11-06**.
Méthode : WebSearch + WebFetch ; les PDF ont été téléchargés (curl) dans un dossier dédié du scratchpad puis leur texte extrait (pypdf), les diaporamas SPILF (.pptx) extraits de leurs XML, les RCP lus sur la page « extrait » de la base de données publique des médicaments (HTML converti en texte). Chaque élément ci-dessous a été **effectivement lu** dans le texte extrait, sauf mention « NON VÉRIFIÉ », « relais secondaire » ou « non lisible ».

Convention des statuts d'accès :
- **consultee** : texte intégral ou partie pertinente lue.
- **contenu_non_lisible** : URL atteinte, contenu non exploitable (403, page anti-robot, PDF réservé).
- **introuvable** : document recherché sans succès.

Convention de citation : le texte long SPILF 2018 (Hoen et al.) est publié **en anglais** et porte la mention « copyright protected and is the property of SPILF ». Pour ce texte et pour IDSA 2017, les extraits sont limités à de **courts fragments verbatim** entre guillemets (ou aux valeurs chiffrées, qui sont des données), le reste étant une **reformulation fidèle** avec page/section/tableau. Les textes réglementaires publics (instruction DGS, RCP ANSM) sont cités plus librement. Ids = ceux de `docs/sources/registre-meningites.json` ou du registre existant.

Population : **adulte** uniquement ; les posologies pédiatriques des sources ne sont pas reprises.

---

## 0. Panorama des textes en vigueur (ce qui remplace quoi)

| Corpus | Texte en vigueur au 2026-11-06 | Remplace / statut |
|---|---|---|
| SPILF — méningites bactériennes aiguës communautaires (hors nouveau-né) | **Actualisation 2018 de la 17e conférence de consensus (2008)** : texte court Med Mal Infect 2019;49:367-404 (doi 10.1016/j.medmal.2019.03.008) et texte long Hoen B, et al. Med Mal Infect 2019;49:405-441 (doi 10.1016/j.medmal.2019.03.009) — `SPILF-2018-meningites` ; diaporama du comité des référentiels validé le 19/09/2018 — `SPILF-2018-meningites-diapo` ; synthèse Info-antibio n°90 (août 2019) — `SPILF-2019-info-antibio-90` | Conférence de consensus 2008 : l'Info-antibio indique qu'elle « n'est donc plus valide ». **La page « recommandations » de la SPILF marque le texte « (en cours de révision) »** (`SPILF-page-recommandations`, consultée le 06/11/2026) ; aucune nouvelle version 2025-2026 trouvée. |
| DGS — prophylaxie des infections invasives à méningocoque (IIM) | **Instruction n° DGS/SP/2018/163 du 27 juillet 2018** + guide pratique annexé — `DGS-2018-IIM` ; synthèse SPILF validée le 14/11/2018 — `SPILF-2018-IIM-diapo` | Abroge l'instruction DGS/RI1/DUS/2014/301 du 24/10/2014. **Choix de l'antibioprophylaxie modifié en pratique par le DGS-Urgent n°2025_06 du 21/02/2025** (`DGS-URGENT-2025-06`, PDF primaire **non lisible** : page anti-robot) — voir §5 et divergences. Aucune nouvelle instruction remplaçant celle de 2018 trouvée. |
| ESCMID — méningite bactérienne aiguë | van de Beek D, et al. ESCMID guideline, Clin Microbiol Infect 2016;22 Suppl 3:S37-S62 — `ESCMID-2016-meningite` | **contenu_non_lisible** (403 sur l'éditeur, dépôt universitaire réservé). Aucune mise à jour trouvée. Seuls des éléments cités par SPILF 2018 sont repris (indirects). |
| IDSA — ventriculites et méningites associées aux soins | Tunkel AR, et al. Clin Infect Dis 2017;64:e34-e65 — `IDSA-2017-HCAVM` | Page IDSA marquée « CURRENT ». Pas de recommandation française récente spécifique trouvée (les supports JNI citent une référence française de 1987 et renvoient à l'IDSA). |
| RCP | Dexaméthasone injectable (KRKA, Medisol, Kalceks), Rifadine gélule, Ciflox comprimé (nouveaux) ; ceftriaxone, céfotaxime, amoxicilline, gentamicine, cotrimoxazole, rifampicine IV (déjà au registre) | Voir §7 et §8. |

Points de vigilance de vigueur :
- Le référentiel SPILF méningites date de 2018 (épidémiologie 2013-2016) et est **officiellement en cours de révision** : toute la modélisation qui en dérive doit porter cette mention.
- Pour l'antibioprophylaxie des contacts de méningocoque, **deux doctrines coexistent** : instruction 2018 (rifampicine en 1re intention) et DGS-Urgent 2025_06 relayé par l'AP-HP en octobre 2025 (ciprofloxacine si souche sensible, ceftriaxone sinon, rifampicine réservée). Le texte primaire 2025 n'a pas pu être lu.
- Le RCP de la rifampicine orale a été mis à jour le 08/04/2026 (génotoxicité, contraception jusqu'à 6 mois après la dernière dose chez la femme) : plus restrictif que l'instruction 2018 pour la femme enceinte ou en âge de procréer.

---

## 1. SPILF 2018 — Prise en charge des méningites bactériennes aiguës communautaires (texte long) — `SPILF-2018-meningites`

- **Organisme** : SPILF, avec CMIT, APNET, SFM, SFMU, SFN, SFORL, SFP, SNFMI, SRLF, SFR. Comité d'organisation présidé par X. Duval.
- **Titre exact** : « 2018 update of the 17th consensus conference (2008) on anti-infective agents. Management of acute community-acquired bacterial meningitis (excluding newborns). Long version with arguments » / « Prise en charge des méningites bactériennes aiguës communautaires (à l'exclusion du nouveau-né) ». Hoen B, Varon E, de Debroucker T, Fantin B, Grimprel E, Wolff M, Duval X. Med Mal Infect 2019 (doi 10.1016/j.medmal.2019.03.009).
- **URL lue** : https://www.sfmu.org/upload/consensus/cc_méningite_long_2018.pdf (version « article in press », 37 p.).
- **Statut d'accès** : consultee. Texte court (doi …03.008) non lu directement ; son contenu est repris par l'Info-antibio n°90 et le diaporama.
- **Statut de vigueur** : en_vigueur, **en cours de révision** (page SPILF). Pas de gradation explicite des recommandations dans le texte long (rubriques « Recommendations »).

### Extraits et données (page du PDF, section)
**Délai de PL (p. 5, §11.2)** : PL dans l'heure suivant l'admission aux urgences, sauf contre-indication ou imagerie préalable requise — « within one hour following admission ». Si PL non immédiate : antibiothérapie probabiliste + dexaméthasone, après au moins deux hémocultures.
**Contre-indications non neurologiques de la PL (p. 5 §11.2.1 ; Tableau 1 p. 6)** : infection cutanée au site de ponction ; instabilité hémodynamique ou respiratoire non contrôlée ; troubles connus de l'hémostase (hémophilie, autre coagulopathie, plaquettes < 50 000/mm³) ; anticoagulant à dose efficace (AVK, HNF ou HBPM, AOD « irrespective of the dose ») ; saignements spontanés évoquant une CIVD. Les antiagrégants plaquettaires ne contre-indiquent pas la PL.
**Imagerie avant PL — recommandations (p. 10, §11.3.1)** : uniquement si (1) signes évoquant un processus expansif : signes de localisation (Tableau 1 : déficit moteur, déficit sensitif hémicorporel, hémianopsie, syndrome cérébelleux, aphasie) ou crises focales ET récentes (< 4 jours) ; (2) signes d'engagement : troubles de la conscience ET au moins un parmi anomalies pupillaires, dysautonomie, crises toniques postérieures, aréactivité, décortication/décérébration ; (3) crises persistantes empêchant la PL. Fragment : « Isolated consciousness disorders are not considered contraindications ».
**Délai de l'antibiothérapie (p. 11, §12.1, Recommendations)** : antibiothérapie (et dexaméthasone si indiquée) idéalement dans l'heure suivant l'admission, quel que soit le délai présumé depuis le début ; tout retard aggrave le pronostic.
**Antibiothérapie avant la PL (p. 11, §12.2)** : trois situations, « but after blood culture » : purpura fulminans ; admission hospitalière impossible dans les 90 minutes ; contre-indication à une PL immédiate. Certains experts déconseillent la PL dans le purpura fulminans même après correction.
**Pas de vancomycine systématique (p. 21, §12.7.5)** : à dose optimale de C3G, l'ajout systématique de vancomycine n'est pas justifié chez l'adulte et l'enfant.
**Ne pas attendre l'examen direct (p. 21, §12.8)** : antibiothérapie dès que le LCS est trouble ; en attendant le Gram, schéma « examen direct négatif ».
**Cocci Gram + / pneumocoque (p. 21, §12.8.1.1 ; Tableau 8 p. 22)** : céfotaxime 300 mg/kg/j IV, en continu (dose de charge 50 mg/kg sur 1 h) ou ≥ 4 perfusions (75 mg/kg/6 h) ; ou ceftriaxone 100 mg/kg/j en 1 ou 2 perfusions. Pas de consensus sur la dose maximale adulte (« some studies report doses of 24 g/day of cefotaxime »). Dosage résiduel plasmatique à 48 h si dose > 10 g/j, âge > 70 ans ou ClCr < 30 mL/min.
**Cocci Gram − / méningocoque (p. 21, §12.8.1.2)** : céfotaxime 200 mg/kg/j (50 mg/kg/6 h ou continu avec charge 50 mg/kg) ou ceftriaxone 75 mg/kg/j en 1 ou 2 perfusions.
**Bacille Gram + / Listeria (p. 21, §12.8.1.3)** : amoxicilline 200 mg/kg/j IV en 4 à 6 perfusions + gentamicine **5–6 mg/kg/j** en une dose sur 30 min (le Tableau 8 indique « 5 mg/kg/day IV in adults »).
**Bacille Gram − / H. influenzae (p. 21-22, §12.8.1.4)** et **E. coli (p. 22, §12.8.1.5)** : céfotaxime 200 mg/kg/j ou ceftriaxone 75 mg/kg/j. Suspicion d'E. coli BLSE (colonisation ou prélèvement d'un autre site) : méropénème 40 mg/kg × 3/j en perfusion lente + avis d'expert.
**Examen direct négatif (p. 22-23, §12.8.2)** : sans argument pour une listériose → céfotaxime 300 mg/kg/j ou ceftriaxone 100 mg/kg/j ; avec arguments → même C3G + amoxicilline 200 mg/kg/j + gentamicine 5 mg/kg/j. Arguments pour listériose (p. 22) : âge > 70 ans, comorbidités, immunodépression, début progressif, rhombencéphalite (atteinte des nerfs crâniens et/ou syndrome cérébelleux).
**Insuffisance rénale (Tableau 8 p. 22 et §12.8.2.4 p. 23)** : céfotaxime — même dose les 24 premières heures, puis réduction de 25 % (DFG 30–60), 50 % (DFG 15–30), 75 % (DFG < 15) ; pas d'adaptation sous hémofiltration continue. Ceftriaxone — si ClCr < 30 : même dose 24 h (en 2 injections) puis −50 % en 1 injection ; pas d'adaptation si ClCr ≥ 30. Doser plasma et LCS pour vérifier des concentrations dans le LCS ≥ 10 fois la CMI.
**Allergie aux bêta-lactamines (p. 23, §12.8.2.3 ; Tableau 10 p. 24)** : allergie grave = hypersensibilité immédiate anaphylactique ; sinon céfotaxime/ceftriaxone recommandés. Aztréonam : mauvaise diffusion dans le LCS. Méropénème possible (faible risque croisé) mais pas de données ; avis infectiologique ; surveillance continue les 24 premières heures. Tableau 10 : pneumocoque → vancomycine (charge 30 mg/kg sur 1 h puis 40–60 mg/kg/j, résiduelle 15–20 mg/L) + rifampicine (adulte 300 mg × 2/j) ou méropénème (ligne adulte « 2 g three times daily », mise en page du tableau ambiguë à l'extraction) ; méningocoque → ciprofloxacine « 800–1200 mg » (fréquence non précisée) ou rifampicine ; Listeria → cotrimoxazole 10–20 mg/kg/j de triméthoprime en 4 prises ; H. influenzae → ciprofloxacine 800–1200 mg ; examen direct négatif → vancomycine + rifampicine (± cotrimoxazole si arguments pour listériose).
**Dexaméthasone — adulte (p. 25, §13.2.1)** : juste avant ou avec la 1re dose d'antibiotique si : suspicion sans confirmation microbiologique mais décision d'antibiothérapie probabiliste (imagerie retardant la PL, PL contre-indiquée pour raison non neurologique, LCS trouble/purulent, examen direct négatif mais arguments biologiques), ou examen direct évocateur de pneumocoque (Binax + et/ou CG+) ou de méningocoque (CG−, « Several experts do not recommend dexamethasone » dans ce cas). Dose : « 10 mg every 6 hours, for 4 days ». Non recommandée chez l'immunodéprimé et en cas de listériose neuroméningée. Si oubli : dès que possible jusqu'à 12 h après la 1re dose d'antibiotique. Après identification : poursuivre 4 jours si pneumocoque ou Haemophilus ; au choix du clinicien si méningocoque ; arrêt pour les autres germes. Réintroduction discutée en cas de vascularite/ischémie retardée sans échec antibiotique (avis d'experts).
**Argument dexaméthasone/listériose (p. 24)** : MONALISA — la dexaméthasone était un facteur indépendant de surmortalité, d'où sa contre-indication en cas de listériose confirmée.
**Délai maximal de la dexaméthasone dans les autres textes (p. 25)** : ESCMID 2016 retient 4 heures, recommandations britanniques 2016 12 heures (cité par SPILF ; ESCMID non lu en primaire).
**Unité d'hospitalisation (p. 26, §13.3.1)** : critères de réanimation — purpura extensif, Glasgow ≤ 8, signes neurologiques focaux, signes de souffrance du tronc cérébral, état de mal convulsif, instabilité hémodynamique ; avis réanimateur recommandé pour tous ; sinon unité avec surveillance horaire de la conscience et de l'hémodynamique au moins 24 h.
**Anticonvulsivants (p. 26, §13.3.2)** : pas de prévention primaire. **Restriction hydrique (p. 26-27)** : non recommandée ; natrémie et diurèse quotidiennes. **Glycémie (p. 27)** : insuline IV pour < 1,8 g/L après stabilisation hémodynamique en cas de sepsis.
**Réévaluation et adaptation (p. 27, §14.1 ; Tableau 11 p. 28)** — pneumocoque, évolution favorable : CMI C3G ≤ 0,5 mg/L et CMI amoxicilline ≤ 0,5 → amoxicilline 200 mg/kg/j de préférence (ou C3G maintenue) ; CMI amoxicilline > 0,5 → céfotaxime 200 mg/kg/j ou ceftriaxone 75 mg/kg/j ; CMI C3G > 0,5 → céfotaxime 300 / ceftriaxone 100 mg/kg/j, PL de contrôle avec dosages, avis infectiologue et microbiologiste. Évolution défavorable à 48–72 h : imagerie (IRM), PL de contrôle, optimisation (dose, C3G à plus faible CMI, ajout rifampicine 10 mg/kg/12 h ou vancomycine).
**Méningocoque (p. 28, §14.1.2)** : C3G ≤ 200 mg/kg/j (céfotaxime) ou 75 mg/kg/j (ceftriaxone) ; amoxicilline possible si CMI ≤ 0,125 mg/L ; durée 4 à 7 jours (4 jours si apyrexie en 48 h) ; pas de décontamination pharyngée si ≥ 24 h de C3G.
**Listeria (p. 28-29, §14.1.3 ; Tableau 11)** : amoxicilline 200 mg/kg/j 21 jours (14 si évolution favorable) + gentamicine 5 mg/kg/j en une perfusion de 30 min les 5 premiers jours ; alternative cotrimoxazole.
**Durées (Tableau 11, p. 28)** : pneumocoque 10–14 j (10 j si évolution favorable en 48 h et CMI C3G ≤ 0,5) ; méningocoque 5–7 j dans le tableau (note e : plutôt 5 j), **4–7 j dans le texte §14.1.2** ; Listeria 14–21 j ; S. agalactiae 14–21 j (amoxicilline 200 mg/kg/j) ; E. coli 21 j ; H. influenzae 7 j ; non documentée d'évolution favorable : 14 j (§14.1.5 p. 29). Le **point de départ** des durées n'est pas explicitement défini (début de traitement présumé, NON TRANCHÉ).
**Allergie documentée (note du Tableau 11)** : choc anaphylactique à la pénicilline → discuter C3G sous surveillance en réanimation ou vancomycine + rifampicine ; choc anaphylactique à une C3G → C3G contre-indiquées sauf avis d'expert.
**PL de contrôle (p. 29 §14.2 ; Tableau 12 p. 30)** : si évolution favorable, uniquement pneumocoque avec CMI C3G > 0,5 mg/L (à 48–72 h) et bactéries autres que pneumocoque, méningocoque, Haemophilus, Listeria (systématique à 48–72 h) ; si évolution défavorable, systématique après imagerie, avec dosage de la C3G.
**Imagerie au cours du traitement (p. 29-30 ; Tableau 13)** : systématique si bactérie autre que pneumocoque ou méningocoque, pneumocoque avec otite/sinusite/mastoïdite ; occasionnelle si fièvre > 38,5 °C, troubles de conscience ou céphalées persistant après 48–72 h, signes neurologiques nouveaux.
**Porte d'entrée (p. 31, §14.4)** : avis ORL ; paracentèse si OMA ; pas d'antibioprophylaxie ni de prolongation de l'antibiothérapie avant fermeture d'une brèche ; vaccination antipneumococcique si brèche.
**Déclaration (p. 12, §12.3.1)** : les méningites à méningocoque et à L. monocytogenes relèvent de la déclaration obligatoire (« the mandatory report of meningococcal or Listeria monocytogenes meningitis »).
**Biologie (p. 8)** : lactates LCS (meilleur seuil 3,8 mmol/L) et PCT sérique utiles seulement si examen direct négatif ; au moins une paire d'hémocultures ; biopsie cutanée si purpura.

---

## 2. SPILF 2018 — diaporama du comité des référentiels — `SPILF-2018-meningites-diapo`

- **Titre** : « Prise en charge des méningites bactériennes aiguës communautaires (à l'exclusion du nouveau-né) — ACTUALISATION 2017 de la Conférence de Consensus 2008 », validé le 19/9/18.
- **URL** : https://www.infectiologie.com/UserFiles/File/spilf/recos/spilf-comite-referentiel-meningites-2018.pptx — **consultee** ; **en_vigueur (en cours de révision)**.

### Extraits (diapositive)
**Dia 3** : « En cas d'oubli, la dexaméthasone peut être administrée jusqu'à 12 H après la première dose d'antibiotique » ; « Le céfotaxime ou la ceftriaxone sont les deux antibiotiques de première intention ».
**Dia 8 (antibiothérapie immédiate)** : « Dans l'heure qui suit l'arrivée à l'hôpital » ; « Au plus tard dans les 3 heures » ; avant la PL si purpura fulminans, hôpital à plus de 90 min et PL impossible, ou contre-indication à la PL.
**Dia 11 (insuffisance rénale)** : pas d'adaptation les 24 premières heures quel que soit le DFG ; ensuite céfotaxime 225 mg/kg/j (30 < DFG ≤ 60), 150 mg/kg/j (15 < DFG ≤ 30), 75 mg/kg/j (DFG ≤ 15) ; ceftriaxone 100 mg/kg/j en 2 fois/j puis 50 mg/kg/j en 1 fois/j (seuils lus dans la mise en page : ≤ 30) ; doses habituelles sous hémofiltration continue.
**Dia 12 (allergie)** : pneumocoque « Vancomycine ET rifampicine » (alternative méropénème) ; méningocoque « Ciprofloxacine OU rifampicine » ; listériose « Triméthoprime-sulfaméthoxazole » ; H. influenzae ciprofloxacine.
**Dia 13 (corticothérapie)** : indications reprenant le texte long ; « La dexaméthasone n'est pas recommandée chez l'immunodéprimé et en cas de listériose ».
**Dia 14 (unité)** : ajoute « détresse respiratoire » aux critères de réanimation et « Score de Glasgow ≤ 13 : discuter surveillance en soins continus ».
**Dia 17 (durées)** : « Méningocoque 4 jours si évolution favorable dès 48h, sinon 7 jours » ; « Listéria 21 jours » ; « E. coli 21 jours » ; « Haemophilus influenzae 7 jours » ; non documentée favorable : « poursuite de l'antibiothérapie jusqu'au 14ème jour ».
**Dia 18 (PL de contrôle)** : « PL de contrôle non indiquée si évolution favorable » sauf pneumocoque CMI C3G > 0,5 mg/L et méningites autres que pneumocoque, méningocoque, Haemophilus et Listeria.
**Dia 22-23 (suivi)** : examen neurologique et test auditif avant la sortie ou au plus tard 15 jours après la fin du traitement ; suivi 12 mois ; chez l'adulte, recherche de pathologies prédisposantes (diabète, éthylisme, cancer, cirrhose, hémopathie, VIH si facteur de risque).

---

## 3. SPILF — Info-antibio n°90 (août 2019) — `SPILF-2019-info-antibio-90`

- **URL** : https://www.infectiologie.com/UserFiles/File/spilf/atb/info-antibio/info-antibio-2019-08-meningite.pdf — **consultee** ; documentation (synthèse, S. Alfandari) ; en_vigueur.
- Extraits : « Il s'agit de l'actualisation 2018, publiée en 2019, de la conférence de consensus de 2008 qui n'est donc plus valide » ; tableau 1re intention en français identique au Tableau 8 (durées 10-14 / 4-7 / 14-21 / 7 / 21) ; « Corticothérapie: Dexaméthasone 10mg (adulte) […] toutes les 6h, pendant 4 jours » ; ceftriaxone : « Si DFG <30mL/min: même dose pdt 24h (en 2 perfusions), puis, baisse de 50% en 1 perfusion ».

---

## 4. SPILF — page « Recommandations » — `SPILF-page-recommandations`

- **URL** : https://www.infectiologie.com/fr/recommandations.html — consultée le 06/11/2026 (via WebFetch, résumé outillé).
- Rubrique « Infections neuro-méningées » : « Méningites, SPILF 2017 » (textes court et long 2019, diaporama 2018) avec la mention **« (en cours de révision) »** ; « Infections invasives à méningocoque : prophylaxie, DGS 2018 » (PDF et diaporama SPILF). Aucune actualisation méningite publiée.

---

## 5. DGS — Instruction DGS/SP/2018/163 du 27 juillet 2018 et guide pratique IIM — `DGS-2018-IIM`

- **Organisme** : Ministère des solidarités et de la santé, Direction générale de la santé.
- **Titre exact** : « INSTRUCTION N° DGS/SP/2018/163 du 27 juillet 2018 relative à la prophylaxie des infections invasives à méningocoque » + annexe « Guide pratique sur la conduite à tenir devant un ou plusieurs cas d'infection invasive à méningocoque ».
- **URL lue** : https://www.infectiologie.com/UserFiles/File/spilf/recos/1-iim-instruction-dgs-07-2018.pdf (44 p.) ; source officielle signalée : https://sante.gouv.fr/IMG/pdf/instruction_dgs_sp_2018_163.pdf.
- **Statut d'accès** : consultee. **Vigueur** : en_vigueur (texte de référence cité par l'AP-HP en octobre 2025), mais **le choix de la molécule d'antibioprophylaxie est modifié par le DGS-Urgent 2025_06** (§6).

### Extraits (page du PDF / fiche du guide)
**Abrogation (p. 1)** : « Textes abrogés : Instruction n° DGS/RI1/DUS/2014/301 du 24 octobre 2014 ».
**Cas index (p. 2-3)** : « usage exclusif des céphalosporines de 3ème génération (suppression de l'amoxicilline) ».
**Contagiosité (p. 10, fiche 1)** : « la période de contagiosité débute dix jours avant l'hospitalisation et se termine après la première administration parentérale de ceftriaxone ou 24 h après l'administration d'un autre antibiotique efficace sur le portage ».
**Purpura fulminans en préhospitalier (p. 15, fiche 6)** : tout malade avec signes infectieux et « présence d'un purpura ne s'effaçant pas à la vitro pression et comportant au moins un élément nécrotique ou ecchymotique de diamètre supérieur ou égal à 3 millimètres, doit immédiatement recevoir une première dose d'un antibiotique, administrée si possible par voie intraveineuse (IV), à défaut par voie intramusculaire (IM), quel que soit l'état hémodynamique du patient » ; antibiothérapie qui « ne doit pas être retardée par la réalisation d'une hémoculture ou d'un prélèvement sanguin » ; « de préférence ceftriaxone ou, en cas d'indisponibilité, céfotaxime ». **Tableau I — adulte : ceftriaxone 1 g ; céfotaxime 1 g** (IV avec présentation sans lidocaïne, à défaut IM). Appel systématique au SAMU-Centre 15.
**Allergie dans le purpura fulminans (p. 15, note 10)** : en cas d'antécédent d'hypersensibilité sévère aux bêta-lactamines, « la réintroduction d'une bêta-lactamine n'est pas recommandée, surtout si le patient est en état de choc » ; « les fluoroquinolones (ciprofloxacine ou lévofloxacine) peuvent constituer un recours » (posologie non précisée).
**Hôpital (p. 15)** : antibiothérapie curative par C3G injectable ; « Dans les formes classiques, la poursuite du traitement au-delà de 4 jours n'a pas de justification » ; prophylaxie du portage pour le patient « s'il n'a pas été traité par ceftriaxone » ; précautions gouttelettes levées 24 h après le début d'un antibiotique actif sur le portage (immédiatement avec la ceftriaxone).
**Définition des cas et déclaration obligatoire (p. 16, fiche 7)** : critères (isolement ou PCR + d'un site stérile ou d'une lésion purpurique ; diplocoques Gram − dans le LCS ; LCS purulent + purpura ; purpura fulminans) ; « Tout cas répondant à au moins un de ces critères doit être signalé sans délai à l'autorité sanitaire (ARS) » ; signalement téléphonique 24 h/24 à la plateforme de veille de l'ARS puis fiche de notification.
**Sujets contacts (p. 17, fiche 8-1)** : personne exposée directement aux sécrétions rhino-pharyngées du cas dans les 10 jours précédant son hospitalisation ; critères : distance < 1 m, face à face, durée (note 16 : au moins une heure d'affilée, moins si toux/éternuements), bouche-à-bouche quelle que soit la durée ; prophylaxie « quel que soit leur statut vaccinal ».
**Délai (p. 17)** : « dans les 24 à 48 heures suivant le diagnostic, et n'a plus d'intérêt au-delà de 10 jours après le dernier contact avec le cas index pendant sa période de contagiosité ».
**Schéma (p. 18, fiche 8-2)** : « Rifampicine par voie orale, pendant deux jours » — « Adulte : 600 mg (2 gélules de 300 mg), deux fois par jour » ; femme enceinte : rifampicine utilisable, vitamine K1 0,5 à 1 mg au nouveau-né si prise dans les 3-4 jours avant l'accouchement ; contraception mécanique pendant le traitement et la semaine suivante. En cas de contre-indication, de résistance documentée ou d'infection répétée dans une même communauté : « Ciprofloxacine par voie orale, en dose unique : Adulte : dose unique de 500 mg » ; « Ceftriaxone par voie injectable, en dose unique : Adulte : injection unique de 250 mg » ; les deux utilisables chez la femme enceinte.
**Cas répétés (p. 28, fiche 10-3)** : changement d'antibiotique si des contacts ont reçu de la rifampicine depuis plus de 10 jours et moins de 5 mois (ciprofloxacine, ceftriaxone si contre-indication) ; avis infectiologue en cas de doute.
**Mesures inutiles (p. 18)** : désinfection rhino-pharyngée, prélèvement de gorge des contacts, éviction scolaire, fermeture d'établissement.

## 5 bis. SPILF — synthèse IIM validée le 14/11/2018 — `SPILF-2018-IIM-diapo`
- URL : https://www.infectiologie.com/UserFiles/File/spilf/recos/spilf-groupe-recos-iim.pptx — consultee ; reprend l'instruction 2018. Dia 6 : « Rifampicine PO 48h (600 mgx2/j chez l'adulte » ; si contre-indication, résistance ou infections répétées « ceftriaxone IV dose unique (250 mg chez l'adulte » ou « ciprofloxacine PO dose unique (500 mg chez l'adulte ». Dia 4 : « Déclaration obligatoire de tout cas d'IIM sans délai à l'ARS ».

---

## 6. DGS-Urgent n°2025_06 (21/02/2025) « Augmentation des infections invasives à méningocoque en France » — `DGS-URGENT-2025-06`

- **URL primaire** : https://sante.gouv.fr/IMG/pdf/dgs-urgent_2025_06_iim.pdf — **contenu_non_lisible** (curl : « Request Rejected » ; WebFetch : page de vérification anti-robot ; non contournée).
- **Relais lus** :
  - `APHP-2025-IIM-CAT` — AP-HP, Service Prévention du risque infectieux, « Infection invasive à méningocoque : conduite à tenir », V3-16/10/25 (https://aphp.fr/sites/default/files/2025-11/M%C3%A9ningocoque2025.10.16.pdf) — consultee (PDF lu). Extraits : « A adapter aux résultats de l'antibiogramme : • Ciprofloxacine si la souche est sensible à la ciprofloxacine • Ceftriaxone si la souche est résistante à la ciprofloxacine ou en l'absence de documentation • Rifampicine réservée aux situations où la souche est résistante à la ciprofloxacine et qu'il existe une contre-indication à la ceftriaxone » ; références citées : « Instruction DGS du 27/07/2018, Calendrier vaccinal 2025, DGS-URGENT N°2025_06 ». **Aucune posologie** dans ce document.
  - Page SFMU « Alertes sanitaires » reproduisant le DGS-Urgent (lue via un outil de résumé : contenu concordant avec l'AP-HP, sans posologies adulte ; verbatim non garanti). L'article Vidal du 27/02/2025 relie la restriction de la rifampicine à la « fragilité » de son approvisionnement (relais de presse, non utilisé comme source).
- **Statut de vigueur** : incertain (message d'alerte conjoncturel lié à l'augmentation des IIM et aux tensions sur la rifampicine ; pas d'instruction consolidée remplaçant 2018 trouvée). Un compte rendu « doctrine antibioprophylaxie IIM » CORRUSS du 26/03/2025 (peps.sante.gouv.fr) a été repéré par recherche mais **non lisible** (serveur injoignable) ; selon le résumé du moteur de recherche il maintiendrait la rifampicine en 1re intention — **NON VÉRIFIÉ**, contradictoire avec l'AP-HP d'octobre 2025.

---

## 7. ESCMID 2016 — `ESCMID-2016-meningite`

- van de Beek D, Cabellos C, Dzupova O, et al. « ESCMID guideline: diagnosis and treatment of acute bacterial meningitis ». Clin Microbiol Infect 2016;22 Suppl 3:S37-S62. doi 10.1016/j.cmi.2016.01.007.
- **contenu_non_lisible** : HTTP 403 sur clinicalmicrobiologyandinfection.com et sciencedirect.com ; dépôt BORIS (Berne) réservé ; Europe PMC sans résumé. Aucune mise à jour ESCMID trouvée.
- Utilisation : uniquement **indirecte**, via SPILF 2018 p. 25 (délai maximal de la dexaméthasone de 4 h dans ESCMID 2016) et p. 9 (liste d'indications de scanner avant PL des recommandations internationales, que SPILF a volontairement restreinte). Les posologies ESCMID (ceftriaxone 2 g/12 h, dexaméthasone 10 mg/6 h) apparaissent dans des résumés de moteur de recherche **NON VÉRIFIÉS** et ne sont pas retenues.

---

## 8. IDSA 2017 — Healthcare-associated ventriculitis and meningitis — `IDSA-2017-HCAVM`

- Tunkel AR, Hasbun R, Bhimraj A, et al. « 2017 Infectious Diseases Society of America's Clinical Practice Guidelines for Healthcare-Associated Ventriculitis and Meningitis ». Clin Infect Dis 2017;64(6):e34-e65. Page https://www.idsociety.org/practice-guideline/healthcare-associated-ventriculitis-and-meningitis/ (marquée « CURRENT »), doi 10.1093/cid/ciw861.
- **consultee** partiellement (page HTML lue via un outil de résumé ; le tableau de posologies adulte n'était pas dans la page). en_vigueur. **Recoupement uniquement** : la situation relève d'un avis spécialisé.
- Fragments : Rec. 37 (strong, low) — vancomycine + bêta-lactamine antipyocyanique (« cefepime, ceftazidime, or meropenem ») ; Rec. 38 — résiduelle de vancomycine 15–20 µg/mL ; Rec. 39 — allergie : « aztreonam or ciprofloxacin » pour les BGN ; Rec. 62-63 — ablation de la dérivation/du drain infecté ; Rec. 55 — traitement intraventriculaire à envisager ; Rec. 58-60 — durées : SCN/C. acnes 10 j (10–14 j si pléiocytose ou symptômes), S. aureus ou BGN 10–14 j, certains experts 21 j pour les BGN ; Rec. 61 — 10–14 j après la dernière culture positive si cultures persistantes ; Rec. 70-73 — délai de réimplantation de la valve.

---

## 9. Proposition de modélisation

> Statut proposé : **brouillon** pour l'ensemble du domaine tant que la révision SPILF n'est pas publiée ; plusieurs nœuds en **avis spécialisé** obligatoire.

### 9.1 Situations cliniques à distinguer
1. **Suspicion de purpura fulminans** (fièvre + purpura non effaçable avec ≥ 1 élément nécrotique/ecchymotique ≥ 3 mm) → antibiotique immédiat, sans attendre aucun prélèvement : ceftriaxone 1 g IV (à défaut IM), ou céfotaxime 1 g ; SAMU ; réanimation. [`DGS-2018-IIM` p. 15 fiche 6, Tableau I]
2. **Suspicion de méningite bactérienne communautaire sans contre-indication à la PL** → PL dans l'heure, antibiothérapie dès LCS trouble. [`SPILF-2018-meningites` p. 5, p. 21]
3. **Contre-indication à une PL immédiate** (neurologique → scanner ; non neurologique → correction) ou **délai d'admission > 90 min** → hémocultures, dexaméthasone + antibiothérapie avant la PL. [p. 10-11, Fig. 1, Tableau 1]
4. **Selon l'examen direct/PCR du LCS** : CG+ ; CG− ; BG+ ; BG− (H. influenzae / E. coli, ± BLSE) ; négatif sans / avec arguments pour listériose. [Tableau 8 p. 22]
5. **Allergie grave aux bêta-lactamines** (hypersensibilité immédiate anaphylactique) → Tableau 10 + **avis infectiologue obligatoire**. [p. 23-24]
6. **Phase documentée** : adaptation à la CMI et durée par germe. [Tableau 11 p. 28]
7. **Méningite associée aux soins / post-neurochirurgicale / dérivation** → **hors modèle, avis spécialisé** (documentation IDSA 2017 seulement). [`IDSA-2017-HCAVM`]
8. **Contacts d'un cas d'IIM** → antibioprophylaxie + déclaration obligatoire (module séparé). [`DGS-2018-IIM`, `DGS-URGENT-2025-06`]

### 9.2 Données d'entrée (questions)
- Purpura ? Purpura fulminans (critères ci-dessus) ? [DGS p. 15]
- Signes de localisation, crises focales récentes (< 4 j), signes d'engagement (troubles de conscience + anomalie pupillaire/dysautonomie/crises toniques/aréactivité/décortication), crises persistantes ? [SPILF p. 10]
- Anticoagulant à dose efficace (AVK, héparine, AOD), hémostase connue anormale, plaquettes < 50 000/mm³, CIVD, instabilité hémodynamique/respiratoire, infection cutanée lombaire ? [p. 5-6]
- Délai prévisible d'admission hospitalière (> 90 min) ? [p. 11]
- Aspect du LCS (trouble ?), examen direct (Gram), Binax, PCR ? [p. 7-8, 21]
- Arguments pour listériose : âge > 70 ans, comorbidités, immunodépression, début progressif, atteinte des nerfs crâniens / syndrome cérébelleux. [p. 22]
- Immunodépression (contre-indique la dexaméthasone), allergie (type de réaction), poids (doses en mg/kg), DFG/ClCr et hémofiltration continue, âge > 70 ans (dosages). [p. 21-23, 25]
- Colonisation ou infection à E. coli BLSE connue. [p. 22]
- Heure de la 1re dose d'antibiotique (fenêtre de 12 h pour la dexaméthasone). [p. 25]

### 9.3 Antibiothérapie probabiliste (adulte, IV)
| Examen direct / PCR | 1re ligne | Allergie grave (avis infectiologue) | Référence |
|---|---|---|---|
| CG+ (pneumocoque) | Céfotaxime 300 mg/kg/j (4 perfusions ou continu après charge 50 mg/kg/1 h) OU ceftriaxone 100 mg/kg/j en 1-2 perfusions | Vancomycine (charge 30 mg/kg puis 40–60 mg/kg/j, résiduelle 15–20 mg/L) + rifampicine 300 mg × 2/j ; ou méropénème | SPILF 2018 Tableau 8, Tableau 10 |
| CG− (méningocoque) | Céfotaxime 200 mg/kg/j OU ceftriaxone 75 mg/kg/j | Ciprofloxacine 800–1200 mg (/j, fréquence NON PRÉCISÉE) ou rifampicine | id. |
| BG+ (Listeria) | Amoxicilline 200 mg/kg/j (4–6 perfusions ou continu) + gentamicine 5 mg/kg/j (texte : 5–6) en 1 perfusion de 30 min | Cotrimoxazole 10–20 mg/kg/j de TMP en 4 prises | id. |
| BG− (H. influenzae) | Céfotaxime 200 / ceftriaxone 75 mg/kg/j | Ciprofloxacine 800–1200 mg | id. |
| BG− (E. coli) | Céfotaxime 200 / ceftriaxone 75 mg/kg/j ; si BLSE suspectée : méropénème 40 mg/kg × 3/j + avis d'expert | Avis infectiologue | id., note d |
| Négatif, pas d'argument listériose | Céfotaxime 300 / ceftriaxone 100 mg/kg/j | Vancomycine + rifampicine | id. |
| Négatif, arguments listériose | C3G (300/100) + amoxicilline 200 mg/kg/j + gentamicine 5 mg/kg/j | Vancomycine + rifampicine + cotrimoxazole | id. |

- Plafonds : aucun consensus adulte (céfotaxime jusqu'à 24 g/j rapporté) ; **dosage plasmatique à 48 h** si > 10 g/j, âge > 70 ans, ClCr < 30. [p. 21]
- Fonction rénale : pleine dose 24 h, puis céfotaxime −25/−50/−75 % (DFG 30–60 / 15–30 / < 15), ceftriaxone −50 % en 1 prise si ClCr < 30 ; pas d'adaptation sous hémofiltration continue. [Tableau 8 ; dia 11]
- Grandeur rénale : SPILF utilise « GFR » pour le céfotaxime et « creatinine clearance » pour la ceftriaxone, sans préciser la formule — **NON TRANCHÉ** (même ambiguïté à signaler au module fonction rénale).

### 9.4 Dexaméthasone (adulte)
- 10 mg IV toutes les 6 h pendant 4 jours ; juste avant ou avec la 1re dose d'antibiotique ; rattrapage possible jusqu'à 12 h après. [SPILF p. 25 ; dia 3, 13]
- Indications : décision d'antibiothérapie probabiliste sans documentation (imagerie avant PL, PL contre-indiquée, LCS trouble, examen direct négatif mais arguments) ; CG+ / Binax + ; CG− (non consensuel). [p. 25]
- Pas de dexaméthasone : immunodéprimé, listériose neuroméningée. [p. 25]
- Arrêt : poursuite 4 j si pneumocoque ou Haemophilus ; au choix si méningocoque ; arrêt pour les autres germes (et si méningite bactérienne écartée — formulé explicitement pour l'enfant p. 26, implicite chez l'adulte). [p. 25-26]

### 9.5 Adaptation documentée et durées (point de départ : NON PRÉCISÉ par les sources)
- Pneumocoque : voir §1 (CMI C3G et amoxicilline, seuil 0,5 mg/L) ; 10 j si évolution favorable en 48 h et CMI C3G ≤ 0,5, sinon 14 j.
- Méningocoque : 4 j si apyrexie/évolution favorable en 48 h, sinon jusqu'à 7 j (texte 4–7 j ; tableau 5–7 j) ; amoxicilline possible si CMI ≤ 0,125 mg/L.
- Listeria : amoxicilline 21 j (14 j si favorable) + gentamicine 5 premiers jours.
- S. agalactiae 14–21 j ; E. coli 21 j ; H. influenzae 7 j ; non documentée favorable 14 j. [Tableau 11 ; dia 17]

### 9.6 Surveillance, gravité, gestes
- Réanimation si purpura extensif, Glasgow ≤ 8, signes focaux, souffrance du tronc, état de mal, instabilité hémodynamique (± détresse respiratoire, dia 14) ; avis réanimateur pour tous ; surveillance horaire 24 h minimum. [p. 26]
- PL de contrôle : Tableau 12 ; imagerie si évolution défavorable à 48–72 h (Tableau 13). [p. 29-30]
- Porte d'entrée ORL : avis ORL, paracentèse, drainage, fermeture de brèche. [p. 31]
- Natrémie/diurèse quotidiennes ; pas d'anticonvulsivant préventif. [p. 26-27]
- Suivi : audition et examen neurologique avant la sortie ou ≤ 15 j après la fin du traitement, suivi 12 mois. [dia 22-23]

### 9.7 Prophylaxie des contacts d'IIM et déclaration
- Déclaration obligatoire (signalement téléphonique immédiat à l'ARS + notification) de tout cas d'IIM ; la listériose est aussi à déclaration obligatoire. [DGS p. 16 ; SPILF p. 12]
- Contacts : définition DGS (p. 17) ; délai 24–48 h, inutile au-delà de 10 jours après le dernier contact.
- **Molécule — NON TRANCHÉ** : instruction 2018 = rifampicine 600 mg × 2/j pendant 2 jours en 1re intention, ciprofloxacine 500 mg dose unique ou ceftriaxone 250 mg IM/IV dose unique en 2e intention [DGS p. 18] ; DGS-Urgent 2025_06 (relais AP-HP 10/2025) = ciprofloxacine si souche sensible, ceftriaxone si résistante ou non documentée, rifampicine réservée. → à afficher en **brouillon** avec les deux doctrines, ou **avis ARS/infectiologue**.
- Cas index : pas de décontamination si traité par ceftriaxone [DGS p. 15] — ou par une C3G ≥ 24 h selon SPILF [p. 28] (divergence ci-dessous).

### 9.8 Zones grises / divergences (resteront en brouillon ou avis spécialisé)
1. **Doses SPILF > RCP** : ceftriaxone 100 mg/kg/j (≈ 7 g pour 70 kg) vs RCP Rocéphine « 2-4 g » une fois/j pour la méningite ; amoxicilline 200 mg/kg/j vs RCP « au maximum 12 g/jour » ; cotrimoxazole SPILF 10–20 mg/kg/j de TMP vs RCP Bactrim 6–8 mg/kg/j de TMP pour la listériose neuroméningée ; céfotaxime : RCP 200–300 mg/kg/j (cohérent), pas de données au-delà de 24 g/j. Les doses SPILF sont donc partiellement **hors RCP**.
2. **Rénal** : SPILF (réduction en % selon DFG après 24 h) vs RCP céfotaxime (réduction de moitié seulement si ClCr < 10 mL/min).
3. **Hémocultures et purpura fulminans** : SPILF « after blood culture » vs DGS « ne doit pas être retardée par la réalisation d'une hémoculture ».
4. **Dexaméthasone** : délai max 12 h (SPILF) vs 4 h (ESCMID, cité par SPILF) ; dose fixe 10 mg/6 h (SPILF) vs 0,15 mg/kg/6 h (RCP KRKA) ; méningocoque : non consensuel.
5. **Durée méningocoque** : 4–7 j (SPILF texte) vs 5–7 j (Tableau 11) vs « au-delà de 4 jours n'a pas de justification » (DGS fiche 6).
6. **Décontamination du cas index** : ceftriaxone seule dispense (DGS) vs toute C3G ≥ 24 h (SPILF).
7. **Gentamicine Listeria** : 5–6 mg/kg/j (texte §12.8.1.3) vs 5 mg/kg/j (tableaux).
8. **Rifampicine en allergie** : 300 mg × 2/j (Tableau 10) vs 10 mg/kg/12 h (§14.1.1 échec). Interaction : la rifampicine (inducteur) diminue l'effet des corticoïdes (RCP dexaméthasone §4.5).
9. **Ciprofloxacine curative** : « 800–1200 mg » sans fréquence (Tableau 10).
10. **Antibioprophylaxie IIM** : 2018 vs 2025 (ci-dessus) ; **femme enceinte/en âge de procréer** : instruction 2018 (rifampicine utilisable, contraception mécanique 1 semaine) vs RCP Rifadine 08/04/2026 (« ne doit être utilisé pendant la grossesse que lorsque cela est strictement nécessaire », contraception non hormonale jusqu'à 6 mois après la dernière dose).
11. **Ceftriaxone 250 mg en prophylaxie** : posologie absente du RCP Rocéphine (pas d'indication prophylaxie IIM) → usage recommandé par la DGS mais hors RCP.
12. Méningite associée aux soins : **avis spécialisé** systématique.

---

## 10. Molécules

### 10.1 Dexaméthasone injectable (molécule attribuée) — `RCP-dexamethasone-krka`, `RCP-dexamethasone-medisol`

**Spécialités lues** :
- DEXAMETHASONE KRKA 4 mg/ml, solution injectable/pour perfusion — CIS 62350477 — RCP « ANSM - Mis à jour le : 20/02/2023 » — https://base-donnees-publique.medicaments.gouv.fr/medicament/62350477/extrait — **seule spécialité lue dont l'AMM mentionne la méningite bactérienne**.
- DEXAMETHASONE MEDISOL 4 mg/1 ml, solution injectable — CIS 64926466 — RCP mis à jour le 10/03/2025 — https://base-donnees-publique.medicaments.gouv.fr/medicament/64926466/extrait — **la méningite bactérienne ne figure pas** dans §4.1 (seulement « œdème cérébral (tumeurs, abcès à toxoplasme...) », fièvre typhoïde sévère…).
- DEXAMETHASONE KALCEKS 4 mg/1 mL (CIS 63713650, RCP 26/06/2024) : aucune occurrence de « méning » dans le RCP.

**Indication (KRKA §4.1)** : « œdème cérébral associé à une tumeur cérébrale, procédures neurochirurgicales, abcès cérébral, méningite bactérienne (par exemple tuberculose, typhoïde, brucellose) ».
**Posologie (KRKA §4.2)** : « Œdème cérébral dû à une méningite bactérienne : 0,15 mg/kg de poids corporel toutes les 6 heures pendant 4 jours, […] commençant avant la première administration de l'antibiotique » ; « Il convient de tenir compte des recommandations officielles concernant le recours à la corticothérapie pour la prise en charge adéquate des maladies infectieuses ». Mode : IV lente (plus de 2 à 3 minutes) ou perfusion ; IM possible si problème d'accès veineux.
**Fonction rénale** : KRKA §4.2 (sous la rubrique COVID-19) et Medisol §4.2 : « Sujets âgés, insuffisance rénale, insuffisance hépatique : aucun ajustement posologique n'est nécessaire ». Pas de palier rénal.
**Contre-indications (KRKA §4.3)** : hypersensibilité ; « Infection fongique systémique ; infection systémique, sauf si un traitement anti-infectieux spécifique est utilisé ». Medisol §4.3 : « il n'existe toutefois aucune contre-indication absolue pour une corticothérapie d'indication vitale » ; CI : état infectieux hors indications, viroses en évolution (hépatites, herpès, varicelle, zona), états psychotiques non contrôlés, vaccins vivants, troubles de coagulation/anticoagulant **en cas d'injection IM**, association à la rilpivirine (sauf dose unique).
**Mises en garde (§4.4)** : risque accru d'infections, masquage des signes, réactivation tuberculose/hépatite B (KRKA) ; anguillulose maligne — examen parasitologique et traitement éradicateur chez les sujets venant de zone d'endémie (Medisol) ; déséquilibre du diabète (adapter l'insuline), surveillance de la pression artérielle et de la kaliémie à fortes doses ; bradycardie à fortes doses ; réactions anaphylactiques ; crise de phéochromocytome ; troubles visuels ; arrêt progressif après environ 10 jours de traitement (KRKA) — sans objet pour une cure de 4 jours, non précisé par les sources pour cette indication.
**Interactions (§4.5)** : inducteurs du CYP3A4 — **rifampicine** (« L'effet des corticoïdes peut être réduit », KRKA ; Medisol : adapter la posologie des corticoïdes) ; inhibiteurs du CYP3A4 (ritonavir, cobicistat, azolés) ; anticoagulants oraux (surveillance biologique à J8 puis tous les 15 jours, Medisol) ; héparines ; AINS/aspirine (saignement digestif) ; fluoroquinolones (tendinopathie) ; hypokaliémiants et médicaments donnant des torsades de pointes (corriger la kaliémie, ECG) ; insuline/antidiabétiques ; curares non dépolarisants IV (myopathie) ; vaccins vivants (CI).
**Grossesse (§4.6)** : KRKA — passage placentaire ; « ne doit être administré qu'après une évaluation approfondie du rapport bénéfice/risque » au 1er trimestre ; risque d'hypoglycémie néonatale. Medisol — pas de risque malformatif identifié au 1er trimestre ; « les corticoïdes peuvent être prescrits pendant la grossesse si besoin ». CRAT : fiche dexaméthasone **non trouvée** (page non lisible/introuvable).
**Recommandation** : 10 mg/6 h pendant 4 jours (SPILF 2018) — équivaut à 0,15 mg/kg pour ≈ 67 kg ; divergence de formulation à signaler (dose fixe vs mg/kg).

### 10.2 Antibiotiques déjà présents — posologies méningées et RCP
| Molécule | Recommandation (méningite adulte) | RCP (id registre, date) | Concordance |
|---|---|---|---|
| Céfotaxime | 200 ou 300 mg/kg/j, 4 perfusions ou continu (charge 50 mg/kg) [SPILF Tableau 8] | `RCP-cefotaxime` (CIS 65424833, 08/04/2024) §4.2 : « Méningites: 200 à 300 mg/kg/jour, on ne dispose pas d'éléments d'efficacité ou de tolérance au-delà de 24 g/ jour » ; pneumocoque : 50 à 75 mg/kg toutes les 6 h ; §4.1 exclut Listeria. Rénal : moitié dose si ClCr < 10 mL/min ; hémodialyse 1 à 2 g/j | Dose concordante ; adaptation rénale divergente |
| Ceftriaxone | 75 ou 100 mg/kg/j en 1-2 perfusions [SPILF] ; 1 g en préhospitalier si purpura fulminans, 250 mg dose unique en prophylaxie [DGS] | `RCP-ceftriaxone` (Rocéphine, CIS 61476925, 15/04/2025) §4.2 adulte ≥ 50 kg : méningite bactérienne « 2-4 g » « Une fois par jour », 2 fois/j envisageable au-delà de 2 g/j ; aucune indication prophylaxie IIM | 100 mg/kg/j dépasse 4 g/j : **hors RCP** ; 250 mg prophylaxie hors RCP |
| Amoxicilline | 200 mg/kg/j IV (4–6 perfusions ou continu) [SPILF] | `RCP-amoxicilline` (CIS 66918105, 09/02/2023) §4.2 : « Méningite bactérienne 1 g à 2 g toutes les 4 à 6 heures, au maximum 12 g/jour » | 200 mg/kg/j > 12 g/j au-delà de 60 kg : **hors RCP** |
| Gentamicine | 5 mg/kg/j (5–6) en 1 perfusion de 30 min, 5 premiers jours (Listeria) [SPILF] | `RCP-gentamicine` (29/03/2024) §4.1 : méningites et listérioses parmi les indications | Indication concordante (posologie RCP non relue ici) |
| Cotrimoxazole | 10–20 mg/kg/j de TMP en 4 prises (allergie, Listeria) [SPILF Tableau 10] | `RCP-cotrimoxazole` (CIS 69233327, 21/07/2025) §4.2 : « Traitement des infections neuro-méningées à Listeria monocytogenes : 30 à 40 mg/kg/j de sulfaméthoxazole et de 6 à 8 mg/kg/j de triméthoprime » | **Divergence** (SPILF > RCP) |
| Rifampicine (orale, prophylaxie) | 600 mg × 2/j pendant 2 jours [DGS 2018] | **Nouveau** `RCP-rifampicine-orale` (Rifadine 300 mg gélule, CIS 67876901, RCP 08/04/2026) §4.2 : « La rifampicine sera donnée pendant 48 heures à la posologie suivante : Adulte : 600 mg toutes les 12 heures » ; §4.1 : « la rifampicine n'est pas un traitement de la méningite à méningocoque » ; §4.3 CI : porphyries, nombreux antirétroviraux/anti-VHC, isavuconazole, voriconazole, praziquantel… ; §4.6 : contraception non hormonale hautement efficace pendant et 6 mois après (femme) ; grossesse « que lorsque cela est strictement nécessaire » ; vitamine K1 si fin de grossesse | Concordant sur la dose ; RCP plus restrictif (grossesse, contraception) |
| Rifampicine IV (allergie) | 300 mg × 2/j ou 10 mg/kg/12 h [SPILF] | `RCP-rifampicine` (Rifadine IV, CIS 63096551) : mise à jour ANSM lue « 08/04/2026 » (le registre n'indique pas de date) | À mettre à jour dans le registre |
| Ciprofloxacine (orale, prophylaxie) | 500 mg dose unique [DGS 2018] | **Nouveau** `RCP-ciprofloxacine-orale` (Ciflox 500 mg cp, CIS 65636245, 13/03/2026) §4.2 : « Prophylaxie des infections invasives à Neisseria meningitidis » — « 500 mg en dose unique », « 1 jour (dose unique) » | Concordant |
| Ciprofloxacine IV (allergie) | 800–1200 mg (/j) [SPILF] | `RCP-ciprofloxacine` (IV, 13/03/2026) — non relu pour cette indication | NON VÉRIFIÉ |
| Vancomycine, méropénème | Allergie / BLSE (doses SPILF ci-dessus) | `RCP-vancomycine`, `RCP-meropeneme` — non relus pour la méningite | NON VÉRIFIÉ |

### 10.3 Molécules nouvelles nécessaires
- **Dexaméthasone injectable** (adjuvant, non antibiotique) — RCP lus (KRKA, Medisol, Kalceks).
- **Rifampicine orale** (forme orale nouvelle ; molécule déjà présente en IV) — RCP lu.
- **Ciprofloxacine orale** 500 mg (forme orale nouvelle ; molécule déjà présente en IV) — RCP lu.
- Méropénème « méningé » (40 mg/kg × 3/j, perfusions de 3–4 h) : molécule présente, posologie propre à documenter si intégrée (avis spécialisé).
- Lévofloxacine (recours DGS dans le purpura fulminans avec allergie grave) : molécule présente, posologie non fournie par la source.
