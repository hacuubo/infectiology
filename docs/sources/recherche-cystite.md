# Recherche documentaire — Cystite de l'adulte, colonisation gravidique et colonisation avant geste urologique

Date de consultation de toutes les sources : **2026-11-06** (sauf mention « lu le 2026-11-04 » : passage déjà lu pour `recherche-urinaire.md` / `recherche-indication.md` et seulement repris ici).
Méthode : WebSearch + WebFetch pour repérer les textes ; les PDF (SPILF 2015, SPILF 2018, AFU 2026, EAU 2026, synthèse HAS) et le diaporama SPILF 2026 (.pptx) ont été **re-téléchargés** dans un dossier neuf du scratchpad et leur texte extrait (pypdf ; XML du pptx) ; les pages HTML (fiches HAS, RCP de la base de données publique des médicaments, CRAT) ont été téléchargées et converties en texte. Chaque extrait cité a été **effectivement lu** dans ce texte extrait, sauf mention « NON VÉRIFIÉ » ou « non lisible ». Dans le PDF SPILF 2015, l'extraction rend les traits d'union par un « S » (« fosfomycineStrométamol ») : les traits d'union ont été rétablis dans les citations, sans autre modification.

Convention des statuts d'accès :
- **consultee** : texte intégral ou partie pertinente effectivement lu.
- **contenu_non_lisible** : URL atteinte, contenu non exploitable (ex. site d'archives indisponible).
- **introuvable** : document recherché sans succès.

Les sources sont citées par leur `id` du registre (`src/clinical/sources/registre.json`) ; les nouvelles sont dans `docs/sources/registre-cystite.json`.

Contexte applicatif (lu dans le code, non modifié) : la forme `cystite` est déduite dans `src/clinical/indication/ecbu.ts` (signes urinaires, pas de fièvre, femme) ; `src/clinical/rules/indication.ts` n'affiche qu'un renvoi aux fiches HAS (« molécules… non modélisées ») ; la colonisation gravidique ne propose que l'amoxicilline ; la colonisation avant geste n'affiche que la liste AFU sans posologie. Le guide microbiologique connaît les libellés `fosfomycine` et `nitrofurantoine`, pas le mécillinam ni le triméthoprime seul.

---

## 0. Panorama des textes en vigueur (ce qui remplace quoi)

| Corpus | Texte en vigueur au 2026-11-06 | Statut / remarque |
|---|---|---|
| SPILF — IU communautaires de la **femme** (cystite simple, à risque, récidivante, grossesse) | **SPILF 2018 (Caron et al., Méd Mal Infect 2018;48:327-358)** = recommandations « 2017 », qui **modifient** le texte court SPILF 2015 pour la cystite | La page SPILF « Recommandations » liste « Infections urinaires communautaires (SPILF 2017, publiée dans MMI en 2018) » ; aucune IU n'y est « en cours de révision » (lu le 2026-11-06). SPILF 2015 (`SPILF-2015-IU`) reste lisible mais **ses chapitres cystite simple / à risque sont dépassés** sur la 3e intention, la place de la fosfomycine et l'exclusion des FQ/céfixime (cf. §2) |
| HAS — fiches mémo « Choix et durées d'antibiothérapies » | Fiche « Cystite aiguë simple, à risque de complication ou récidivante, de la femme » et fiche « Femme enceinte : colonisation urinaire et cystite » : validées 15/07/2021, en ligne 27/08/2021, **« Mis à jour le 13 mai 2025 »** ; passages marqués « [2024] » (actualisation Collège juillet 2024, décision n°2024.0181/DC/SBP). Synthèse PDF « Mise à jour décembre 2024 » | En vigueur. Élaborées « en partenariat avec la SPILF » : c'est la version **la plus récente** des positions françaises sur la cystite de la femme |
| SPILF — IU **masculines** (dont « cystite aiguë bactérienne » de l'homme) | SPILF 2026 (Lafaurie et al., Infect Dis Now 2026) ; diaporama officiel 20/06/2026 ; Info-antibio n°109 | Remplace le chapitre IU masculines 2015/2018. Exclut IU récidivantes, sondés, immunodéprimés, IU liées aux soins |
| AFU/CIAFU (+ SPILF) — colonisation avant geste urologique | RBP « Place de l'ECBU avant une prise en charge urologique… », synthèse janvier 2026 (mise en ligne 04/03/2026) | Précise IUAS 2015 R.20-R.24 (durée notamment) |
| SPILF/AFU/SF2H — IU associées aux soins | IUAS 2015 | Seul texte français pour la cystite associée aux soins (R.51-R.52) |
| ANSM — nitrofurantoïne | Restrictions de 2012 (lettre du 12/03/2012), rappel 01/04/2014, point d'information 26/05/2016 : **intégrées au RCP FURADANTINE en vigueur (MAJ ANSM 28/10/2025)** | Lettres elles-mêmes **non lisibles** (archives ANSM « temporairement indisponible[s] ») ; titres et dates lus sur une page ANSM active |
| ANSM — fluoroquinolones | Rappel des restrictions, 02/08/2023 (suite décision CE 11/03/2019) | En vigueur ; vise explicitement la cystite non compliquée et la prophylaxie des IU basses récidivantes |
| EAU — Urological Infections | Édition 2026 (« limited update March 2026 ») ; sections 3.4.3.d et 3.4.4.d (cystite) **modifiées en 2026** | En vigueur ; référence européenne (aucun guideline ESCMID dédié à la cystite trouvé — cf. `recherche-urinaire.md` §9) |
| IDSA — cystite non compliquée | Guideline IDSA/ESCMID 2011 (Gupta) ; guideline IDSA « complicated UTI » mis en consultation publique (2025, signalé par un résumé de congrès 2026) | **Non consultés** (hors hiérarchie prioritaire ; statut de l'actualisation non vérifié) |

Points de vigilance de vigueur :
- La **fiche HAS cystite** (MAJ 2024/2025) et SPILF 2018 concordent sur l'essentiel ; HAS raccourcit le pivmécillinam de la cystite simple à **3 jours** (SPILF 2015/2018 et RCP : 5 jours). Aucun texte SPILF postérieur sur la cystite de la femme n'a été trouvé.
- Le RCP DELPRIM (triméthoprime) a été **mis à jour le 19/05/2026** : contre-indication au 1er trimestre, ce qui est plus strict que la fiche HAS (« à éviter avant 10 semaines d'aménorrhée »).

---

## 1. SPILF 2015 — texte court (`SPILF-2015-IU`)

- **Organisme** : SPILF. **Titre exact** : « Diagnostic et antibiothérapie des infections urinaires bactériennes communautaires de l'adulte — Mise au point — Texte court — Actualisation au 11 décembre 2015 des recommandations initialement mises en ligne en mai 2014 ».
- **URL** : https://www.infectiologie.com/UserFiles/File/spilf/recos/infections-urinaires-spilf.pdf (43 p.).
- **Statut d'accès** : consultee (p. 5-17, 31-33, 36, 40-41 relus le 2026-11-06). **Vigueur** : en vigueur pour les définitions et la grossesse ; **cystite simple / à risque : partiellement remplacée par SPILF 2018** (cf. §2) ; IU masculines remplacées par SPILF 2026.
- Grades : I-A à IV-C (niveau de preuve – force) et « Accord professionnel ».

### Extraits (page du PDF = page imprimée)
- **Champ (p. 5)** : « les cystites récidivantes à risque de complication… et les IU liées aux soins sont exclues du champ de ces recommandations ».
- **Facteurs de risque de complication (p. 6)** : « toute anomalie organique ou fonctionnelle de l'arbre urinaire, quelle qu'elle soit (résidu vésical, reflux, lithiase, tumeur, acte récent…) » ; « sexe masculin » ; « grossesse » ; « sujet âgé : patient de plus de 65 ans avec > 3 critères de fragilité (critères de Fried…), ou patient de plus de 75 ans » ; « immunodépression grave » ; « insuffisance rénale chronique sévère (clairance < 30 ml/min) ».
- **Diabète (p. 6)** : « Le diabète, même insulino-requérant, n'est plus considéré comme un facteur de risque de complication ».
- **Cystite récidivante (p. 7)** : « Elles sont définies par la survenue d'au moins 4 épisodes pendant 12 mois consécutifs. »
- **Seuils de résistance (p. 8)** : « Pour l'antibiothérapie probabiliste des cystites simples… les antibiotiques utilisables sont ceux dont le taux de résistance est < 20 % dans la population cible. » ; pour cystite à risque, cystite gravidique… « un taux de résistance > 10% n'est pas acceptable [Accord professionnel] ».
- **FQ < 6 mois (p. 8)** : « ne pas les utiliser en traitement probabiliste chez un patient déjà traité par quinolones dans les 6 mois précédents (quelle qu'en ait été l'indication) ».
- **BLSE (p. 9)** : actifs sur E. coli BLSE : « la fosfomycine-trométamol (sensibilité > 98 %), la nitrofurantoïne (>90%)… et le pivmécillinam (70-90%) ».
- **ECBU / BU (p. 10)** : « Un ECBU est indiqué devant toute suspicion clinique d'IU, à l'exception des cystites simples. » ; « La BU seule est recommandée dans la cystite aiguë simple. » ; femme symptomatique : absence de leucocytes et de nitrites « très bonne valeur prédictive négative (VPN) (>95%) en l'absence d'immunodépression grave ».
- **Seuils ECBU (p. 10)** : leucocyturie « > 10⁴ /ml » ; E. coli, S. saprophyticus « 10³ UFC/ml » ; autres entérobactéries, entérocoque… « 10⁴ UFC/ml » chez la femme ; « le tableau clinique prime ».
- **Sujet âgé (p. 11)** : « Sujet agé > 75 ans, ou > 65 ans et fragile (> 3 critères de Fried) : l'IU est « à risque de complication » et traitée comme telle. » ; nitrofurantoïne : « respecter la contre-indication en cas d'insuffisance rénale avec clairance de la créatinine < 40 ml/min ».
- **Cystite simple (p. 12)** : « La BU est le seul examen paraclinique recommandé. » ; « En 1ère intention : Fosfomycine-trométamol en dose unique (I-A) » ; « En 2eme intention : Pivmécillinam pendant 5 jours (I-A) » ; « En 3ème intention : Fluoroquinolone en prise unique : ciprofloxacine ou ofloxacine (I-A) » et « Nitrofurantoïne pendant 5 jours (I-A) » (**3e intention remplacée en 2018**). Non indiqués : amoxicilline, amoxicilline-acide clavulanique, TMP, TMP-SMX, C3G.
- **Surveillance cystite simple (p. 12)** : « Il est recommandé de ne pas prévoir de consultation, de BU ou d'ECBU de contrôle. Un ECBU ne sera réalisé qu'en cas d'évolution défavorable (persistance des signes cliniques après 3 jours) ou de récidive précoce dans les deux semaines. »
- **Cystite simple à EBLSE documentée (p. 12)** : « amoxicilline-acide clavulanique pendant 5 à 7 jours » ; « triméthoprime (TMP) pendant 3 jours » ; « TMP-SMX pendant 3 jours » ; « En cas d'échec et retraitement, ou en cas de cystite à EBLSE, la durée de traitement n'est pas modifiée. »
- **Cystite à risque — diagnostic (p. 13)** : « Une BU est recommandée. » ; « Un ECBU doit être systématiquement réalisé. » ; « En cas de suspicion de rétention aiguë d'urine, une mesure simplifiée du résidu vésical post-mictionnel par ultrason (exemple : Bladder-scanTM) doit être réalisée ».
- **Cystite à risque — principe (p. 13)** : « Le principe fondamental est de différer chaque fois que possible l'antibiothérapie pour prescrire un traitement d'emblée adapté à l'antibiogramme ». Propositions « résultent d'accord professionnel ».
- **Cystite à risque — différé (p. 13)** : « amoxicilline, 7 jours (IV-C) » ; « pivmécillinam, 7 jours (IV-C) » ; « nitrofurantoïne, 7 jours (IV-C) » ; « triméthoprime, 5 jours (IV-C) » ; puis amox-clav ou céfixime 7 j, FQ, TMP-SMX 5 j ; « fosfomycine-trométamol sur avis d'expert (IV-C) » (**ordre modifié en 2018**).
- **Cystite à risque — probabiliste (p. 13-14)** : « Dans le cas où il est difficile de différer le traitement (patiente très symptomatique, terrain particulier) cette situation devant rester rare, la nitrofurantoïne est retenue comme traitement de 1ère intention » ; 2e intention céfixime ou FQ (**supprimés en 2018**) ; « L'adaptation de l'antibiothérapie à l'antibiogramme est systématique. »
- **Cystite récidivante — bilan (p. 14)** : « Pour les premiers épisodes de récidive, un ECBU est indiqué… (IV-C). » ; « ne pas faire d'investigations complémentaires systématiques chez la femme non ménopausée avec examen clinique normal… (II-B) ».
- **Cystite récidivante — épisode (p. 14)** : « Le traitement curatif d'un épisode de cystite récidivante est similaire à celui d'une cystite simple. » ; auto-traitement après BU « au cas par cas… réévaluation périodique de la procédure au moins 2 fois par an (II-B) ».
- **Prévention (p. 15)** : canneberge « 36 mg/jour de proanthocyanidine (IV-C) » ; œstrogènes locaux post-ménopause « après avis gynécologique (IV-C) ».
- **Antibioprophylaxie (p. 15)** : « ne doit être proposée que chez les patientes présentant au moins une cystite par mois, lorsque les autres mesures ont échoué (IV-C) » ; « Un ECBU doit être réalisé au plus tard une à deux semaines avant le début… Celui-ci doit être négatif » ; « L'utilisation de nitrofurantoïne dans cette indication est formellement contre-indiquée (IV-C). » ; post-coïtal : « TMP, 1 comprimé à 100 mg dans les 2 heures précédant ou suivant le rapport sexuel » ; « fosfomycine-trométamol, 3 grammes… (administration tous les 7 jours au maximum…) » ; continue : « TMP, 1 comprimé à 100 mg par jour » ; « fosfomycine-trométamol (3 g tous les 7 jours) » ; durée « au moins 6 mois… réévaluée au moins 2 fois par an ». (**Posologie TMP 100 mg remplacée par 150 mg en 2018**.)
- **Annexe 1 (p. 40), hors grossesse** : cystite simple : fosfomycine « 3 g PO x 1/jour — 1 jour (traitement monodose) » ; pivmécillinam « 400 mg PO x 2 /jour — 5 jours » ; nitrofurantoïne « 100 mg PO x 3/jour — 5 jours » ; ciprofloxacine « 500 mg PO x 1/jour » et ofloxacine « 400 mg PO x 1/jour » monodose. Cystite à risque (différé) : amoxicilline et amox-clav « 1 g PO x 3/jour », pivmécillinam « 400 mg PO x 2 /jour », céfixime « 200 mg PO x 2/jour », nitrofurantoïne « 100 mg PO x 3/jour », ciprofloxacine « 500 mg PO X2/jour », ofloxacine « 200 mg PO X2/jour », durée « 7 jours » ; « Triméthoprime 300 mg PO X1/jour » et TMP-SMX « forte… 1 cp X2/jour » : « 5 jours » ; fosfomycine « Avis d'expert ». Prophylaxie : fosfomycine « 1 sachet (3g) tous les 7 jours, 6 mois minimum » ; TMP « 100 mg PO X1/jour, 6 mois minimum » ; TMP-SMX « adulte » 80/400 « 1 cp/jour ».

### Grossesse (p. 31-33, 36)
- **Colonisation — définition (p. 31)** : « présence, sur 2 cultures consécutives (réalisées à 1 ou 2 semaines d'intervalle), de la même bactérie à un seuil > 10⁵ UFC/ml (II-B). Pour des raisons de faisabilité, un seul prélèvement est accepté. »
- **Dépistage (p. 31)** : BU « aux consultations des 4ème, 5ème, 6ème, 7ème, 8ème et 9ème mois » ; femmes à risque (« antécédents d'IU, de diabète ou d'uropathie ») : ECBU dès la 1re consultation (II-B).
- **Traitement (p. 31)** : « recommandé, y compris pour le streptocoque B, car il évite l'évolution vers une PNA, (I-A) » ; « Il est d'emblée adapté à l'antibiogramme (Accord professionnel). » ; ordre : « amoxicilline (II-B) » > « pivmécillinam (II-B) » > « fosfomycine-trométamol (II-B) » > « triméthoprime (à éviter les deux premiers mois de la grossesse) (IV-C) » > nitrofurantoïne (« traitements itératifs contre-indiqués »), SMX-TMP, amox-clav, « Céfixime (II-B) ou ciprofloxacine (IV-C) » ; « La durée de traitement est de 7 jours, à l'exception de la fosfomycine-trométamol en prise unique (II-B). »
- **Suivi (p. 31, 33)** : « Un ECBU 8 à 10 jours après l'arrêt du traitement est recommandé, suivi d'un ECBU mensuel jusqu'à l'accouchement (Accord professionnel). »
- **Cystite gravidique (p. 32)** : « Un traitement antibiotique probabiliste doit être débuté sans attendre les résultats de l'antibiogramme (IV-B). » ; « 1ère intention: fosfomycine-trométamol (II-B) ; 2ème intention: pivmécillinam (II-B) ; 3ème intention: nitrofurantoïne (IV-C) ; 4ème intention: céfixime (II-B) ou ciprofloxacine (IV-C) » ; « L'antibiothérapie doit être adaptée à 48h » ; relais : amoxicilline > fosfomycine ou pivmécillinam > TMP > nitrofurantoïne, SMX-TMP, amox-clav, céfixime ou ciprofloxacine.
- **Durée cystite gravidique (p. 33)** : « Un traitement de 7 jours est recommandé, sauf pour la fosfomycine-trométamol (monodose) (II-B). »
- **Annexe 1** : explicitement « en dehors de la femme enceinte » → **aucune posologie gravidique** dans SPILF 2015 (posologies : fiche HAS, §3b).

---

## 2. SPILF 2018 — Caron et al. (`SPILF-2018-IU-Caron`)

- **Titre exact** : « Practice guidelines for the management of adult community-acquired urinary tract infections / Recommandations pour la prise en charge des infections urinaires communautaires de l'adulte », Méd Mal Infect 2018;48:327-358 (texte anglais p. 327-341, version française p. 342-358).
- **URL** : https://urofrance.org/sites/default/files/recommandations_pour_la_prise_en_charge_des_infections_urinaires_communautaires_de_ladulte.pdf (PDF de 54 p. téléchargé le 2026-11-06 ; la version lue le 2026-11-04 comptait 32 p. — même article, mise en page différente, NON VÉRIFIÉ au-delà des pages citées).
- **Statut d'accès** : consultee (cystite et grossesse, en anglais et en français). **Vigueur** : en vigueur (« SPILF 2017, publiée dans MMI en 2018 » sur la page SPILF). Les **figures 2, 3, 4, 8, 9** (algorithmes) sont des images non extraites : seul le texte est cité.
- Statut affiché (p. 328) : recos 2014, actualisées en 2015 (grossesse, témocilline, TMP), et le présent document « includes changes decided in 2017 ».

### Extraits (page de la revue)
- **Cystite simple (p. 346, fr.)** : « La stratégie recommandée reste un traitement probabiliste guidé par une simple BU, sans ECBU préalable. » ; « en 1re intention à la fosfomycine trométamol en dose unique (I-A) » ; « en 2e intention au pivmécillinam pendant 5 j (I-A) ».
- **3e intention supprimée (p. 346)** : « Aucun choix de 3e intention probabiliste n'est optimal » ; FQ « il n'est pas recommandé d'utiliser… (accord professionnel) » ; nitrofurantoïne « il n'est pas recommandé d'utiliser… dans cette indication en France compte-tenu de son positionnement réglementaire » ; SMX-TMP et TMP « proche de 20 % ».
- **Double contre-indication (p. 346)** : « pour les très rares situations où ni la fosfomycine trométamol, ni le pivmécillinam ne seraient indiqués est-il proposé un ECBU pour guider une stratégie d'antibiothérapie documentée selon les mêmes modalités que les cystites aiguës à risque de complication ».
- **Échec (p. 346)** : « En cas d'échec (défini par la persistance des signes sans amélioration après 3 j), un ECBU est alors indiqué » ; durée non modifiée « dès lors que la souche est pleinement sensible ».
- **Cystite à risque — diagnostic (p. 346)** : « Un ECBU doit être systématiquement réalisé (II-B). » ; bladder-scan si suspicion de rétention, « particulièrement utile chez les personnes âgées ».
- **Cystite à risque — différé (p. 346)** : « soit en 1ère intention l'amoxicilline (7 j), en 2e le pivmécillinam (7 j), en 3e la nitrofurantoïne (7 j), en 4e la fosfomycine trométamol (3 doses espacées chacune de 48 h), en 5e le TMP (5 j) » (IV-C).
- **Cystite à risque — probabiliste (p. 346)** : « Dans les cas – devant rester rares – où il n'apparaît pas possible de différer le traitement (patiente très symptomatique...), la nitrofurantoïne et la fosfomycine-trométamol peuvent être utilisées » ; nitrofurantoïne (III-B) « sauf chez l'insuffisant rénal connu (clairance de la créatinine < 40 mL/mn) » ; fosfomycine (III-B) : « le schéma à 3 doses reste actuellement hors AMM ».
- **FQ/céfixime exclus (p. 346)** : « Céfixime et fluoroquinolones (proposées en 2e intention jusqu'en 2015 en probabiliste) ne sont plus recommandées (accord professionnel) » ; pivmécillinam probabiliste : données « trop parcellaires ».
- **Suivi (p. 347)** : « ni consultation, ni ECBU systématique ».
- **Cystite récidivante (p. 347)** : « Définies par au moins 4 épisodes sur 12 mois » ; avec FDR de complication : « concertation multidisciplinaire… De telles stratégies… ne peuvent faire l'objet de recommandations codifiées » ; bilan hors femme non ménopausée à examen normal : « au minimum une échographie des voies urinaires avec mesure du résidu post-mictionnel » (IV-C).
- **Épisode curatif (p. 348)** : « similaire à celui d'une cystite simple. Dans cette indication l'administration de nitrofurantoïne est non recommandée (risque de toxicité grave favorisée par les ré-introductions) » ; auto-traitement « réévaluation périodique (2 fois par an) » (II-B) ; apports hydriques « 1,5 L/24 h ».
- **Antibioprophylaxie (p. 348)** : « à éviter au maximum » ; « ne change pas l'histoire naturelle (rechutes très fréquentes à l'arrêt) (I-A) » ; nitrofurantoïne « ne doit plus être utilisée dans cette indication du fait de complications graves très corrélées à la durée (fibrose pulmonaire, hépatite fulminante) (IV-C) » ; β-lactamines et FQ « à épargner » ; « ne se discute que chez les patientes souffrant d'au moins un épisode par mois, et lorsque les autres mesures ont échoué ».
- **Posologies prophylaxie (p. 348)** : post-coïtal « 2 h avant ou 2 h après la relation sexuelle, sans dépasser le rythme d'administration de la prophylaxie continue » ; « Le TMP étant disponible en France exclusivement sous forme de comprimé à 300 mg, il est proposé de retenir… un demi-comprimé, soit 150 mg » ; SMX-TMP « 400–80 mg/j » ; « prise au coucher » ; fosfomycine « un sachet de 3 g tous les 7 j (IV-C) » ; « La surveillance est purement clinique… ne pas effectuer d'ECBU systématique ».
- **Colonisation gravidique (p. 352)** : « Le traitement doit être systématique (I-A) » ; « traitement d'emblée adapté aux résultats d'un antibiogramme » ; amoxicilline > pivmécillinam (IV-C) > fosfomycine (II-B) > TMP > nitrofurantoïne, SMX-TMP, amox-clav ou céfixime ; « Le TMP et le cotrimoxazole (SMX-TMP) doivent être évités les deux premiers mois » ; « dose unique pour fosfomycine trométamol et de 7 j pour les autres schémas (II-B) ». (Ciprofloxacine **absente** de cette liste 2018, présente en 2015.)
- **Cystite gravidique (p. 353 ; angl. p. 339)** : ECBU « always indicated » ; « Le seul traitement de 1re intention désormais recommandé… est la fosfomycine trométamol à dose unique (II-B) » ; « Le pivmécillinam est proposé en 2e intention (IV-C) » ; « En 3e intention (éventualité très rare) peuvent se discuter nitrofurantoïne, céfixime ou ciprofloxacine » ; relais : amoxicilline > fosfomycine ou pivmécillinam > TMP > nitrofurantoïne, SMX-TMP, amox-clav, céfixime, ciprofloxacine ; « dose unique pour fosfomycine trométamol, et d'une durée de 7 j pour les autres schémas » ; « Un ECBU 8 à 10 j après l'arrêt du traitement est recommandé, suivi d'un ECBU mensuel jusqu'à l'accouchement ».

---

## 3. HAS — fiches mémo (partenariat SPILF/GPIP)

### 3a. Fiche « Cystite aiguë simple, à risque de complication ou récidivante, de la femme » (`HAS-2021-cystite-femme`)
- **URL** : https://www.has-sante.fr/jcms/c_2722827/fr/cystite-aigue-simple-a-risque-de-complication-ou-recidivante-de-la-femme — **consultee** (HTML converti en texte, 2026-11-06). « Date de validation : 15 juillet 2021 » ; « Mis en ligne le 27 août 2021 - Mis à jour le 13 mai 2025 ». **Vigueur** : en vigueur.
- **FDR de complication** : « la grossesse, toute anomalie organique ou fonctionnelle de l'arbre urinaire, l'insuffisance rénale sévère (débit de filtration glomérulaire < 30 ml/min), l'immunodépression grave, un âge supérieur à 75 ans, ou supérieur à 65 ans avec au moins 3 critères de Fried ». « Le diabète, type 1 ou 2, n'est pas un facteur de risque de complication. »
- **Cystite simple** : « Diagnostic clinique : brûlures mictionnelles et/ou urgenturies. » ; BU ; « Ne pas prescrire un examen cytobactériologique des urines (ECBU). » ; « 1 re intention : fosfomycine-trométamol, 3 g en prise unique » ; « 2 e intention : pivmécillinam : 400 mg 2 fois par jour pendant 3 jours » ; « Les autres antibiotiques ne sont pas indiqués. » ; « Pas d'ECBU sauf si évolution défavorable (persistance ou aggravation des signes cliniques après 3 jours ou de récidive précoce dans les 2 semaines). »
- **Délivrance officinale [2024]** : délivrance sans ordonnance par le pharmacien « conditionnée à la réalisation du test urinaire d'orientation diagnostique… dont le résultat est positif » (renvoi Légifrance JORFTEXT000049734400, non lu).
- **Cystite à risque** : ECBU ; « L'ECBU est positif si leucocyturie ≥ 10⁴/ml et bactériurie ≥ 10³ UFC/ml pour Escherichia coli, Staphylococcus saprophyticus et bactériurie ≥ 10⁴ UFC/ml pour les autres bactéries. » ; « en cas de discordance c'est la clinique qui prime [2024] ».
- **Différé [2024]** : « Traitement différé à privilégier » ; « amoxicilline : 1g 3 fois par jour pendant 7 jours » ; « pivmécillinam : 400 mg 2 fois par jour pendant 7 jours » ; « nitrofurantoïne : 100 mg 3 fois par jour pendant 7 jours » (3 lignes seulement).
- **Probabiliste [2024]** : « Traitement ne pouvant être différé » : « 1 re intention : nitrofurantoïne : 100 mg 3 fois par jour pendant 7 jours » ; « 2 e intention : fosfomycine-trométamol : 3 g à J1, J3 et J5 ».
- **Nitrofurantoïne** : « contre-indication en cas d'insuffisance rénale avec un débit de filtration glomérulaire < 45 ml/min ou de traitements itératifs ».
- **Suivi** : « Pas d'ECBU de contrôle sauf si évolution défavorable ».
- **Colonisation** : « Ne pas traiter une colonisation urinaire (ECBU positif sans symptomatologie clinique) à l'exception de la grossesse et de la chirurgie urologique programmée. »
- **Récidivante** : « (au moins 4 épisodes pendant une période de 12 mois) » ; « Le traitement curatif d'un épisode de cystite récidivante est celui d'une cystite. »
- **Antibioprophylaxie** : « si au moins 1 épisode par mois » ; « ECBU initial avant début de l'antibioprophylaxie » ; 1re intention « fosfomycine-trométamol : 3 g en prise unique tous les 7 jours au maximum » ou « triméthoprime : 150 mg par jour (1 fois par jour maximum, au coucher) », post-coïtal « dans les 2 heures précédant ou suivant le rapport sexuel » ; 2e intention « cotrimoxazole : 400 mg/80 mg par jour à prendre au coucher » ; « La nitrofurantoïne est contre-indiquée, les bêta-lactamines doivent être évitées, les fluoroquinolones ne doivent pas être utilisées dans la prévention des infections récidivantes des voies urinaires basses [2024] ». (**Aucune durée de prophylaxie** dans la fiche ; SPILF 2015 : « au moins 6 mois ».)

### 3b. Fiche « Femme enceinte : colonisation urinaire et cystite » (`HAS-2021-femme-enceinte-IU`)
- **URL** : https://www.has-sante.fr/jcms/c_2722927/fr/femme-enceinte-colonisation-urinaire-et-cystite — **consultee** (2026-11-06). « Mis à jour le 13 mai 2025 ». **Vigueur** : en vigueur.
- **Dépistage** : « bandelette urinaire (BU) mensuelle à partir du 4 e mois de grossesse. Si BU positive… un examen cytobactériologique des urines (ECBU) doit être réalisé. » ; femmes à risque (« uropathie sous-jacente organique ou fonctionnelle, diabète, antécédents de cystite aiguë récidivante ») : ECBU « à la première consultation… puis tous les mois à partir du 4 e mois ».
- **Définition** : « Une colonisation urinaire est définie par une bactériurie ≥ 10 5 UFC/ml monomicrobienne. »
- **Colonisation — traitement** : « Traitement adapté aux résultats de l'antibiogramme, à commencer dès réception des résultats (pas de traitement probabiliste) » :
  1. « amoxicilline : 1 g 3 fois par jour pendant 7 jours »
  2. « pivmécillinam : 400 mg 2 fois par jour, pendant 7 jours »
  3. « fosfomycine-trométamol : 3 g en prise unique »
  4. « triméthoprime : 300 mg par jour pendant 7 jours, à éviter avant 10 semaines d'aménorrhée »
  5. « nitrofurantoïne : 100 mg 3 fois par jour pendant 7 jours » ; « cotrimoxazole : 800 mg/160 mg 2 fois par jour pendant 7 jours, à éviter avant 10 semaines d'aménorrhée » ; « amoxicilline + acide clavulanique : 1 g 3 fois par jour pendant 7 jours ».
- **Contrôle** : « ECBU de contrôle 8 à 10 jours après l'arrêt du traitement, puis ECBU mensuel jusqu'à l'accouchement. »
- **Cystite gravidique** : ECBU (mêmes seuils que §3a) ; « Traitement probabiliste, à débuter sans attendre le résultat de l'antibiogramme » : 1re « fosfomycine-trométamol : 3 g en prise unique » ; 2e « pivmécillinam : 400 mg 2 fois par jour pendant 7 jours ».
- **Cystite gravidique — « En cas d'échec ou de résistance »** : 1re « amoxicilline : 1 g 3 fois par jour pendant 7 jours » ; 2e « triméthoprime : 300 mg par jour pendant 7 jours, à éviter avant 10 semaines d'aménorrhée » ; 3e « nitrofurantoïne : 100 mg 3 fois par jour pendant 7 jours » ; 4e cotrimoxazole 800/160 ×2/j 7 j (à éviter avant 10 SA) ou amox-clav 1 g ×3/j 7 j ; même contrôle ECBU.
- Céfixime et ciprofloxacine **absents** de la fiche (présents dans SPILF 2015/2018).

### 3c. Fiche de synthèse PDF (`HAS-2024-synthese-antibiotherapie`)
- **URL** : https://has-sante.fr/upload/docs/application/pdf/2024-08/choix_et_durees_dantibiotherapie_synthese_actualisation_aout_2024__mel_v2.pdf — **consultee** (p. 1). « Validée par le Collège le 15 juillet 2021 — Mise à jour décembre 2024 ».
- p. 1 : cystite simple « fosfomycine-trométamol Prise unique » ; cystite à risque « Traitement probabiliste (adaptation secondaire systématique à l'antibiogramme) nitrofurantoïne 7 jours » ; « Traitement adapté à l'antibiogramme amoxicilline 7 jours » ; prophylaxie fosfomycine ou « triméthoprime 150 mg par jour » ; colonisation gravidique « Pas de traitement probabiliste… amoxicilline 7 jours » ; cystite gravidique « fosfomycine-trométamol Prise unique », « En cas d'échec ou de résistance amoxicilline 7 jours ».

---

## 4. SPILF 2026 — IU masculines : la « cystite aiguë bactérienne » de l'homme (`SPILF-2026-IUM`, `SPILF-2026-info-antibio-109`)

- **URL** : https://www.infectiologie.com/UserFiles/File/spilf/recos/spilf-groupe-recos-ium.pptx — **consultee** (re-téléchargé, texte des diapositives extrait le 2026-11-06). Article princeps (Infect Dis Now) non lisible (403, cf. `recherche-urinaire.md` §3a). Grades absents du diaporama.
- **Vigueur** : en vigueur.
- **Constat demandé** : SPILF 2026 traite la cystite de l'homme **comme une entité de l'IU masculine**, sans catégorie « cystite simple » : pas de BU, ECBU systématique, traitement différé si bien tolérée, 7 jours.
- **Périmètre (diapo 3)** : « infections urinaires aiguës, communautaires, de l'homme, adulte » ; exclues : immunodéprimé, porteur de sonde, « vessie neurologique », « Liées aux soins », « Récidivantes ».
- **Diagnostic (diapo 8)** : « Diagnostic clinique : présence de signes cliniques locaux, d'apparition aigüe, et absence de fièvre » ; « ECBU : seul examen complémentaire recommandé pour confirmer le diagnostic » ; « Prélèvement sanguin : non recommandé (pas de dosage du PSA ni des marqueurs de l'inflammation) ».
- **BU (diapo 6)** : « Non recommandée dans la stratégie diagnostique » ; ECBU « Recommandé pour le diagnostic de toute infection urinaire avant de débuter une antibiothérapie ».
- **Initial (diapo 9)** : « Si bonne tolérance ou diagnostic douteux : attendre les résultats de l'ECBU pour débuter un traitement antibiotique adapté » ; sinon « traitement oral probabiliste, par ordre alphabétique : Fosfomycine-trométamol (3 g à J1-J3-J5) ; Nitrofurantoïne 100 mgx3/j ; Pivmécillinam 400 mgx2/j ».
- **Documenté (diapo 10)** : « Poursuite du traitement probabiliste si uropathogène sensible » ; sinon, ordre alphabétique : « Amoxicilline 1 gx3/j ; Fosfomycine-trométamol 3 g/prise ; Nitrofurantoïne 100 mgx3/j ; Pivmécillinam 400 mgx2/j ; Triméthoprime 300 mgx1/j ».
- **Durée (diapo 11)** : « 7 jours — Sauf fosfomycine-trometamol : 3 doses (J1-J3-J5) ». Info-antibio 109 (lu le 2026-11-04) : « Cystite 7 jours sauf fosfo-trométamol 3 doses ».
- **Bilan (diapo 36-38)** : « Echographie des voies urinaires avec mesure du résidu post-mictionnel (RPM) » dès le 1er épisode ; consultation urologie si « Hématurie macroscopique », « Score IPSS > 7 », « RPM > 100 ml »…
- ⚠ **Hors AMM** chez l'homme : RCP FURADANTINE « n'est pas adapté aux infections urinaires chez l'homme » ; RCP SELEXID et DELPRIM : indication « femme adulte » ; RCP MONURIL : « femmes et… adolescentes », prise unique (cf. §8).

---

## 5. AFU/CIAFU 2026 — colonisation avant geste urologique (`AFU-2026-ECBU-geste`)

- **URL** : https://www.infectiologie.com/UserFiles/File/spilf/recos/reco-ecbu-synthese-04032026-mel.pdf — **consultee** (p. 22-25 relues le 2026-11-06 ; liste geste par geste : `recherche-indication.md` §1.2, lue le 2026-11-04). **Vigueur** : en vigueur.
- **Moment de l'ECBU (Q2 R3, p. 22, lu le 2026-11-04)** : « réaliser un ECBU préopératoire dans les 10 jours précédant l'intervention dans les cas où il est indiqué (Grade AE) » ; Q2 R2 : pas de bandelette (Grade B).
- **Q3 R1 (p. 24)** : « En cas de colonisation urinaire et d'indication au traitement antibiotique, il est recommandé de mettre en place un traitement antibiotique adapté, indépendamment de la quantité du microorganisme isolé (Grade AE). »
- **Q3 R2 (p. 24) — moment et durée** : « celle-ci sera débutée 48 heures avant le geste chirurgical et sera poursuivie au minimum à J0 et au maximum 48 heures après le geste, soit un total de 3 à 5 jours de traitement péri-opératoire (Grade C). »
- **Q3 R3 (p. 25) — NLPC** : traiter, mais le texte ne permet pas « de définir la durée du traitement antibiotique préopératoire de cette colonisation » (Grade AE). Conclusion p. 23 : NLPC à risque, « une durée de 7 jours d'antibiothérapie avant l'intervention pourrait diminuer le risque de sepsis » (NP2).
- **Q3 R4 (p. 25) — molécules (ordre alphabétique, Grade AE)** : « En 1ère intention : Fosfomycine-trométamol (J-2 / J0), Nitrofurantoïne, Pivmécillinam, et Triméthoprime ; En 2ème intention : Amoxicilline, Cotrimoxazole ; En 3ème intention : Amoxicilline + acide clavulanique ; En 4ème intention : Fluoroquinolones ; Céfixime ; En 5ème intention : Autres antibiotiques. » Principe : « même en présence de bactéries multirésistantes… en privilégiant les traitements per os ».
- **Q3 R5-R6 (p. 25)** : culture polymicrobienne : pas de recommandation ; si traitement décidé sans antibiogramme par souche : « Fosfomycine-Trométamol, Nitrofurantoïne, Pivmécillinam et Triméthoprime (Grade AE) ».
- **Posologies : NON DONNÉES** par la synthèse AFU (aucune dose, aucun « mg » dans le texte extrait). « Fosfomycine-trométamol (J-2 / J0) » = deux prises (J-2 et J0) ; la dose par prise (3 g) n'est pas écrite → à reprendre des RCP/autres recos, **à valider**. Argumentaire AFU non lu.
- **Comparaison** : IUAS 2015 R.22 « jusqu'à ablation de la sonde vésicale ou 7 jours au maximum » (lu le 2026-11-04) ; IDSA 2019 (`IDSA-2019-bacteriurie-asymptomatique`, Q XIII) « a short course (1 or 2 doses) », « initiated 30–60 minutes before the procedure » (Weak/low ; lu le 2026-11-04) ; EAU 2026 3.3.5.e/3.3.7 : « Screen for and treat asymptomatic bacteriuria prior to urological procedures breaching the mucosa. (Strong) » sans durée précise.

---

## 6. IUAS 2015 — cystite associée aux soins (`SPILF-AFU-SF2H-2015-IUAS`) (lu le 2026-11-04)
- « R.51. … traiter 5 à 7 jours les cystites associées aux soins (B-III). » ; « R.52. Un traitement de 3 jours seulement… femme de moins de 75 ans… après ablation de la sonde vésicale (B-III). » ; « R.36. Dans les autres situations… différer l'antibiothérapie afin de l'adapter aux résultats de l'ECBU (A-III). » (citations reprises de `recherche-urinaire.md` §4, non relues le 2026-11-06).

---

## 7. EAU Guidelines on Urological Infections 2026 (`EAU-2026-urological-infections`)

- **URL** : https://d56bochluxqnz.cloudfront.net/documents/full-guideline/EAU-Guidelines-on-Urological-Infections-2026.pdf — **consultee** (sections 3.3.5.e, 3.3.7, 3.4, 3.5 ; pages PDF 13-26, relues le 2026-11-06). **Vigueur** : en vigueur.
- **Définition (3.4.1, p. 16)** : « symptomatic lower urinary tract infection limited to the bladder, in the absence of systemic symptoms or signs such as fever, chills, flank pain, or malaise ».
- **Diagnostic (3.4.3.d, p. 16)** : diagnostic clinique (Strong) ; « Use urine dipstick testing for diagnosis of acute cystitis. Weak » ; culture si « Suspected systemic urinary tract infection », « Symptoms that do not resolve or recur within four weeks », « atypical symptoms », « high risk for infection with antimicrobial-resistant pathogens », « Pregnant women » (Strong).
- **Abstention antibiotique (3.4.4.b, p. 19)** : « In non-geriatric patients, non-antibiotic therapy alone should be considered as an alternative to antibiotic treatment. A shared decision-making process with the patients is essential ».
- **1re ligne (3.4.4.b, p. 19)** : « fosfomycin trometamol 3g single-dose, pivmecillinam 400mg three times daily for three to five days, and nitrofurantoin (e.g. nitrofurantoin monohydrate/macrocrystals 100mg twice daily for five days) ».
- **TMP/SMX (p. 19)** : « Co-trimoxazole (160/800mg twice daily for three days) or trimethoprim (200mg twice daily for five days) should only be considered as drugs of first choice in areas with known resistance rates for E. coli of < 20% ».
- **FQ (p. 19)** : « In cystitis, a fluoroquinolone should only be used when it is considered inappropriate to use other antibacterial agents that are commonly recommended » ; recommandation (p. 20) : « Do not use aminopenicillins or fluoroquinolones to treat cystitis. Strong ».
- **Grossesse (3.4.4.c.1, p. 19)** : « penicillins, cephalosporins, fosfomycin, nitrofurantoin (not in case of glucose-6-phosphate dehydrogenase deficiency and during the end of pregnancy), trimethoprim (not in the first trimester), and sulphonamides (not in the last trimester) can be considered ».
- **Insuffisance rénale (3.4.4.c.2, p. 19)** : « No adjustment of dose is necessary until the glomerular filtration rate (GFR) is < 20mL/min » (hors néphrotoxiques) ; « Nitrofurantoin is contraindicated in patients with an estimated GFR of less than 30mL/min/1.73m2 ».
- **Homme (3.4.4.d, p. 20)** : « For empirical oral treatment of acute uncomplicated cystitis in younger men, pivmecillinam and nitrofurantoin are recommended » ; nitrofurantoïne seulement « if prostatic involvement has been reliably excluded » ; Table 3 : SMX-TMP « 160/800mg b.i.d 7 days » chez l'homme.
- **Table 3 (p. 20)** : fosfomycine « 3g SD 1 day » ; nitrofurantoïne microcristaux « 50-100mg four times a day 5 days » ; pivmécillinam « 400mg t.i.d 3-5 days » ; nitroxoline « 250mg t.i.d 5 days » ; alternatives céfadroxil, cefpodoxime 3 j ; TMP « 200mg b.i.d 5 days » si résistance < 20 %.
- **Suivi (3.4.5, p. 21)** : « Routine post-treatment urinalysis or urine cultures in asymptomatic patients are not indicated » ; échec ou récidive < 2 semaines : culture + antibiogramme, « Retreatment with a seven-day regimen using another agent should be considered ».
- **Récidivante (3.5.1, p. 21)** : « at least three episodes of cystitis/year or two episodes of cystitis in the last six months » ; « Diagnose recurrent cystitis by urine culture. Strong » (p. 26).
- **Prophylaxie (3.5.3.d, p. 24-26)** : « Use continuous or postcoital antimicrobial prophylaxis to prevent recurrent cystitis when non-antimicrobial interventions have failed. Counsel patients regarding possible side effects. Strong » ; schémas : « nitrofurantoin 50mg or 100mg once daily, fosfomycin trometamol 3g once weekly, trimethoprim 100mg once daily » ; « Consider self-administered short-term antimicrobial therapy for patients with good compliance. Strong » ; non antibiotiques : œstrogènes vaginaux post-ménopause (Strong), méthénamine hippurate (Strong), canneberge (Strong), D-mannose (Weak)…
- **ABU grossesse (3.3.7, p. 15)** : « Screen for and treat asymptomatic bacteriuria in pregnant women with standard short course treatment or single dose fosfomycin trometamol » (Weak) ; « it is advisable to consult national recommendations for pregnant women ».

---

## 8. Molécules attribuées — RCP français (BDPM) et CRAT

### 8.1 Fosfomycine-trométamol — `RCP-fosfomycine-trometamol`
- **Spécialité** : MONURIL 3 g, granulés pour solution buvable en sachet — **CIS 67951706** (spécialité de référence du groupe générique ; génériques nombreux, ex. URIDOZ, NON VÉRIFIÉS). RCP : https://base-donnees-publique.medicaments.gouv.fr/affichageDoc.php?specid=67951706&typedoc=R — **consultee**. « ANSM - Mis à jour le : 25/07/2025 » (fiche BDPM « Dernière mise à jour le 03/11/2026 »). Commercialisé (déclaration 19/06/1990).
- **§4.1** : « indiqué dans le traitement de la cystite aiguë non compliquée chez les femmes et les adolescentes ».
- **§4.2** : « Cystite aiguë non compliquée chez les femmes adultes et adolescentes (> 12 ans) : administration unique de 3 g de fosfomycine. » ; « pris à jeun (environ 2 à 3 heures avant ou 2 à 3 heures après un repas), de préférence avant le coucher et après la vidange de la vessie ».
- **Rein (§4.2, §5.2)** : « n'est pas recommandée chez les patients présentant une insuffisance rénale (clairance de la créatinine < 10 ml/min, voir rubrique 5.2) » ; concentrations urinaires « efficaces pendant 48 heures après une dose habituelle si la clairance de la créatinine est supérieure à 10 ml/min ». Grandeur : **clairance de la créatinine** (pas de paliers). Hémodialyse (§4.9, surdosage) : « éliminée efficacement de l'organisme par hémodialyse » ; aucune posologie en dialyse.
- **§4.3** : hypersensibilité seulement.
- **§4.4** : anaphylaxie ; colite à C. difficile ; « En cas d'infections persistantes, un examen approfondi et une réévaluation du diagnostic est recommandée » ; saccharose, sulfites.
- **§4.5** : « l'administration concomitante de métoclopramide diminue les concentrations sériques et urinaires en fosfomycine et qu'elle doit être évitée » ; INR : mention générique des antibiotiques (AVK).
- **§4.6** : 1er trimestre « (n = 152) sont limitées » ; « doit être utilisé pendant la grossesse uniquement si cela est vraiment nécessaire » ; allaitement : « une dose orale unique… peut être utilisée ».
- **CRAT** (`CRAT-fosfomycine-grossesse`, https://www.lecrat.fr/6678/, MAJ 11.12.2025, consultee) : « aucun effet malformatif, foetal ou néonatal n'est retenu à ce jour » ; cystite gravidique : « Un traitement monodose par fosfomycine est possible quel que soit le terme de la grossesse. » ; ECBU avant traitement.
- **Hors AMM à signaler** : schéma 3 g J1-J3-J5 (cystite à risque, homme) — SPILF 2018 : « le schéma à 3 doses reste actuellement hors AMM » ; prophylaxie 3 g/7 j ; usage chez l'homme ; « J-2 / J0 » (AFU).

### 8.2 Pivmécillinam — `RCP-pivmecillinam`
- **Spécialité** : SELEXID 200 mg, comprimé pelliculé — **CIS 60670489**. RCP : https://base-donnees-publique.medicaments.gouv.fr/affichageDoc.php?specid=60670489&typedoc=R — **consultee**. « ANSM - Mis à jour le : 27/05/2026 ». Commercialisé (déclaration 20/11/2020).
- **§4.1** : « indiqué chez la femme adulte dans le traitement d'infections urinaires ».
- **§4.2 (tableau)** : « Cystites aiguës non compliquées : 400 mg x 2/jour pendant 5 jours » ; « Cystites à risque de complication, incluant les cystites gravidiques » et « Bactériuries asymptomatiques gravidiques » : « 400 mg x 2/jour pendant 7 jours » (cellule fusionnée commune aux deux lignes, `rowspan=2` vérifié dans le HTML).
- **Rein (§4.2)** : « Quand la filtration glomérulaire est comprise entre 15 et 30 ml/min, diviser la posologie par deux. Quand la filtration glomérulaire est inférieure à 15 ml/min, diviser la posologie par trois. » ; « les modalités d'adaptation posologique optimales chez l'insuffisant rénal ne sont pas établies ». Grandeur : « filtration glomérulaire » / « clairance de la créatinine » (formulation mixte). Hémodialyse : non trouvé.
- **Administration** : « au milieu d'un repas, avec un grand verre d'eau » ; ne pas s'allonger « pendant les 30 minutes qui suivent ».
- **§4.3** : « Hypersensibilité à la substance active, aux pénicillines » ; « Antécédent d'une réaction d'hypersensibilité immédiate sévère (par exemple anaphylaxie) à une autre bêta-lactamine » ; « Toute affection susceptible de retarder le transit ou la vidange œsophagienne » ; déficit sévère en carnitine d'origine génétique.
- **§4.4** : EICG (DRESS, SJS, NET) ; « Les données sont limitées dans le traitement des cystites à risque de complication et des bactériuries asymptomatiques gravidiques » ; ulcérations œsophagiennes ; « ne doit pas être utilisé chez les patients souffrant de porphyries » ; encéphalopathie (surdosage, IR) ; traitement « au long cours ou répété » : risque de déficit en carnitine ; faux positif du dépistage néonatal de l'acidémie isovalérique si prise peu avant l'accouchement.
- **§4.5** : associations déconseillées : **méthotrexate** (« toxicité hématologique »), **acide valproïque/valproate** (« déficit en carnitine ») ; INR/AVK : mention générique.
- **§4.6** : « plus de 1000 grossesses » sans effet malformatif ; « peut être utilisé pendant la grossesse si nécessaire » ; allaitement possible.
- **CRAT** (`CRAT-pivmecillinam-grossesse`, https://www.lecrat.fr/6688/, MAJ 31.07.2024) : « aucun effet malformatif, foetal ou néonatal attribuable au traitement n'est retenu à ce jour » ; cystite gravidique : utilisable « quel que soit le terme » en 2e intention.

### 8.3 Nitrofurantoïne — `RCP-nitrofurantoine`
- **Spécialité** : FURADANTINE 50 mg, gélule — **CIS 62013296** (seule spécialité orale adulte trouvée). RCP : https://base-donnees-publique.medicaments.gouv.fr/affichageDoc.php?specid=62013296&typedoc=R — **consultee**. « ANSM - Mis à jour le : 28/10/2025 ».
- **§4.1** : « traitement curatif de la cystite documentée due à des germes sensibles chez la femme adulte, l'adolescente et la petite fille à partir de l'âge de 6 ans, lorsqu'aucun autre antibiotique présentant un meilleur rapport bénéfice-risque ne peut être utilisé par voie orale ».
- **§4.2** : « Femme adulte : 300 mg (6 gélules) par jour, en 3 prises journalières. » ; « Durée de traitement : 5-7 jours. » ; « le traitement curatif d'un épisode de cystite ne doit pas excéder une durée de plus de 7 jours » ; « Avaler les gélules de préférence au cours des repas ».
- **Rein** : §4.2 « clairance de la créatinine < 45 ml/mn… la nitrofurantoïne est contre-indiquée » ; §4.3 « Insuffisance rénale (TFGe inférieur à 45 ml/min) » (grandeur **mixte** Clcr / DFGe dans le même RCP). Hémodialyse : seulement en surdosage (« peut être hémodialysée en cas d'ingestion récente »).
- **§4.3** : hypersensibilité aux nitrofuranes ; IR < 45 ; « Traitement prophylactique (continu ou intermittent) » ; « Traitement curatif prolongé » ; « Déficit en glucose-6-phosphate-déshydrogénase (G6PD) » ; allergie au blé ; enfant < 6 ans ; « fin de grossesse (pendant le travail et l'accouchement) ».
- **§4.4 (restrictions ANSM intégrées)** : atteintes « pulmonaires (fibroses, pneumopathies interstitielles) », « hépatiques (hépatites cytolytiques, hépatites cholestatiques, hépatites chroniques, cirrhoses) », « pouvant conduire dans de rares cas à une issue fatale » ; arrêt immédiat si toux, gêne respiratoire, nausées, ictère… ; « interrogatoire approfondi avant de débuter le traitement… antécédent d'effets indésirables sous nitrofurantoïne » ; « toute réintroduction… doit rester exceptionnelle » ; « Le traitement curatif par nitrofurantoïne sera débuté après documentation microbiologique de l'épisode en cours » ; probabiliste « uniquement en cas d'urgence à instaurer un traitement et/ou d'après l'histoire de la maladie… (antécédents connus de cystites récidivantes dues à des bactéries multi-résistantes) » ; sujets > 65 ans : « surveillance particulière » ; hépatotoxicité, pancréatite aiguë ; « n'est pas adapté aux infections urinaires chez l'homme ».
- **§4.5** : antiacides (trisilicate de magnésium) à 2 h ; INR/AVK : mention générique.
- **§4.6** : données en traitement aigu « nombreuses et rassurantes » ; contre-indiquée « pendant le travail et l'accouchement » (anémie hémolytique néonatale) ; « ne doit être envisagée au cours de la grossesse que si nécessaire ».
- **CRAT** (`CRAT-nitrofurantoine-grossesse`, https://www.lecrat.fr/6683/, MAJ 13.11.2025) : « ne doit plus être utilisée au long cours dans la prévention des récidives » ; cystite gravidique : « ne sera envisagée qu'après avoir écarté les autres options disponibles ».
- **ANSM (lettres)** (`ANSM-2012-nitrofurantoine`) : « Restriction d'utilisation en raison d'un risque de survenue d'effets indésirables graves hépatiques et pulmonaires », 12/03/2012 ; rappel du 01/04/2014 ; point du 26/05/2016 — **titres/dates lus** sur https://ansm.sante.fr/tableau-acces-derogatoire/furadantin (page « Mise à jour 02/10/2024 », « profil de risque problématique ») ; **contenu des lettres non lisible** (archives ANSM indisponibles le 2026-11-06). Le contenu réglementaire est restitué ci-dessus via le RCP en vigueur.

### 8.4 Triméthoprime — `RCP-trimethoprime`
- **Spécialité** : DELPRIM 300 mg, comprimé sécable — **CIS 66142235**. RCP : https://base-donnees-publique.medicaments.gouv.fr/affichageDoc.php?specid=66142235&typedoc=R — **consultee**. « ANSM - Mis à jour le : 19/05/2026 ». Commercialisé (déclaration 29/03/2017).
- **§4.1** : « indiqué chez la femme adulte et l'adolescente dans le traitement d'infections urinaires ».
- **§4.2** : « Cystites aiguës non compliquées : 300 mg par jour, en une prise quotidienne, pendant 3 jours » ; « Le schéma d'administration optimal chez le sujet normo-rénal et chez le sujet insuffisant rénal n'est pas établi. » ; prophylaxie « au cas par cas… avec la dose journalière de 150 mg ».
- **§4.3** : hypersensibilité ; « Anémie macrocytaire » ; « Insuffisance rénale sévère (clairance de la créatinine < 15mL/mn) » ; « Insuffisance hépatique sévère » ; « Association avec le méthotrexate » ; « Premier trimestre de grossesse ».
- **Rein** : CI si Clcr < 15 mL/min ; entre 15 et normal : **aucun palier** (« n'est pas établi ») ; prudence et « surveillance biologique » en IR ; hémodialyse : seulement en surdosage. ⚠ §4.4 : « peut entraîner une augmentation de la créatininémie par inhibition de la sécrétion de créatinine sans réelle diminution du débit de filtration glomérulaire » (biais d'estimation du DFG sous traitement).
- **§4.4** : « L'utilisation du triméthoprime seul est envisagée dans des recommandations dans le traitement curatif des cystites à risque de complication dont les cystites gravidiques, les bactériuries asymptomatiques gravidiques » ; SCAR (SJS, NET, DRESS) ; hématologie (leucopénie, agranulocytose, anémie mégaloblastique) — « Un contrôle hématologique est nécessaire en cas de : Traitement itératif ; Chez le sujet âgé de plus de 65 ans ; Et chez les sujets carencés en folates » ; « surveillance de la kaliémie… insuffisants rénaux et… sujets âgés » ; photosensibilité ; G6PD.
- **§4.5** : CI **méthotrexate** ; déconseillé **répaglinide** ; pyriméthamine ; ciclosporine ; **hyperkaliémiants** (IEC, ARA II, AINS, héparines, diurétiques épargneurs de potassium…) ; INR/AVK : mention générique.
- **§4.6** : « contre-indiqué pendant le premier trimestre de la grossesse » ; « Au cours des deuxièmes et troisièmes trimestres, l'utilisation doit être évitée, sauf en cas de nécessité clinique. » ; allaitement « déconseillé ».
- **CRAT** (`CRAT-trimethoprime-grossesse`, déjà au registre ; https://www.lecrat.fr/6669/, MAJ 03.10.2025, relu le 2026-11-06) : « Avant 10 semaines d'aménorrhée : On préférera un autre antibiotique » ; « Au-delà de 10 semaines d'aménorrhée : l'utilisation du triméthoprime est possible après avoir écarté les autres options disponibles ».

### 8.5 Molécules non attribuées : posologie et durée propres à la cystite / colonisation (recommandations)

| Molécule | Situation | Posologie | Durée | Source + repère |
|---|---|---|---|---|
| Amoxicilline | Cystite à risque (différé), colonisation gravidique, relais cystite gravidique | « 1g 3 fois par jour » | 7 j | HAS cystite (différé) ; HAS femme enceinte ; SPILF 2015 annexe p. 40 ; SPILF 2026 diapo 10 (homme) |
| Amoxicilline-acide clavulanique | Cystite à risque (5e choix SPILF 2015, absente HAS cystite) ; grossesse 5e/4e intention ; cystite simple EBLSE après échec | « 1 g 3 fois par jour » | 7 j (SPILF 2015 : « 5 à 7 jours » si EBLSE) | HAS femme enceinte ; SPILF 2015 p. 12, p. 40 |
| Céfixime | Cystite à risque (SPILF 2015 seulement, retiré du probabiliste en 2018) ; grossesse 3e/4e intention (SPILF) | « 200 mg PO x 2/jour » | 7 j | SPILF 2015 p. 40 ; SPILF 2018 p. 346, 353 ; **absent des fiches HAS** |
| Ciprofloxacine | Cystite simple (SPILF 2015 seulement, **retirée en 2018**) ; cystite à risque différé (SPILF 2015) ; grossesse (SPILF 2015/2018, dernier recours) | DU « 500 mg PO x 1/jour » (cystite simple 2015) ; « 500 mg PO X2/jour » (à risque) | DU ; 5 j | SPILF 2015 p. 12-14, p. 40 ; restrictions ANSM 2023 (cf. §9) |
| Ofloxacine | Idem (SPILF 2015 seulement) | DU « 400 mg PO x 1/jour » ; « 200 mg PO X2/jour » | DU ; 5 j | SPILF 2015 p. 40 |
| Cotrimoxazole (SMX-TMP) | Cystite à risque différé (SPILF 2015) ; cystite simple EBLSE ; grossesse 5e intention ; prophylaxie 2e intention | Curatif « 800 mg/160 mg 2 fois par jour » ; prophylaxie « 400 mg/80 mg par jour » au coucher | Curatif 3 j (EBLSE cystite simple) / 5 j (à risque, SPILF 2015) / 7 j (grossesse, HAS) | SPILF 2015 p. 12, 40 ; HAS femme enceinte ; HAS cystite (prophylaxie) ; « à éviter avant 10 semaines d'aménorrhée » (HAS) |

---

## 9. Restrictions ANSM à signaler

- **Nitrofurantoïne** (`ANSM-2012-nitrofurantoine`, `RCP-nitrofurantoine`) : réservée à la cystite **documentée** de la femme, probabiliste seulement « en cas d'urgence » ; durée ≤ 7 j ; **contre-indiquée** en prophylaxie (continue ou intermittente) et en traitement prolongé ; réintroduction « exceptionnelle » ; CI si DFGe/Clcr < 45 ; CI déficit G6PD et fin de grossesse ; risques hépatiques et pulmonaires parfois mortels (cf. §8.3). Cohérent avec HAS (« traitements itératifs ») et SPILF 2018 (« ne doit plus être utilisée » en prophylaxie, non recommandée pour la cystite simple et la cystite récidivante).
- **Fluoroquinolones** (`ANSM-2023-fluoroquinolones`, relu le 2026-11-06) : publié le 02/08/2023 ; ne pas utiliser dans les « infections de sévérité légère à modérée » dont la **cystite non compliquée** « à moins que les autres antibiotiques habituellement recommandés pour ces infections ne soient jugés inappropriés » ; ne pas utiliser « pour prévenir la diarrhée du voyageur ou les infections récidivantes des voies urinaires basses ». EAU 2026 rappelle la décision de la Commission européenne du « 11 March 2019 ». **Conséquence** : la FQ en DU de la cystite simple (SPILF 2015) est à exclure ; les FQ restent en 4e intention AFU (colonisation avant geste) et en dernier recours chez la femme enceinte (SPILF).

---

## 10. Divergences explicites entre sources

1. **Pivmécillinam, cystite simple — durée et rythme** : SPILF 2015/2018 « pendant 5 jours » (I-A) et RCP « 400 mg x 2/jour pendant 5 jours » ; **HAS « 400 mg 2 fois par jour pendant 3 jours »** ; EAU « 400mg three times daily for three to five days ».
2. **Cystite simple — 3e intention** : SPILF 2015 FQ DU ou nitrofurantoïne 5 j ; **SPILF 2018 : aucune, ECBU et traitement documenté** ; HAS « Les autres antibiotiques ne sont pas indiqués » ; EAU : nitrofurantoïne en 1re ligne (100 mg ×2/j 5 j, formes non commercialisées en France NON VÉRIFIÉ), TMP/SMX-TMP si résistance < 20 %, nitroxoline.
3. **Cystite à risque — probabiliste** : SPILF 2015 nitrofurantoïne > céfixime/FQ ; **SPILF 2018 et HAS : nitrofurantoïne > fosfomycine 3 g J1-J3-J5** (FQ/céfixime exclus).
4. **Cystite à risque — différé** : SPILF 2015 amox > pivm > nitro > TMP 5 j > amox-clav/céfixime/FQ/SMX-TMP > fosfo (avis d'expert) ; SPILF 2018 amox > pivm > nitro > **fosfo 3 doses** > TMP 5 j ; HAS : amox > pivm > nitro (rien au-delà).
5. **Nitrofurantoïne — seuil rénal** : SPILF 2015/2018 Clcr < 40 ; HAS DFG < 45 ; RCP Clcr < 45 (§4.2) / TFGe < 45 (§4.3) ; EAU eGFR < 30.
6. **Triméthoprime et grossesse** : HAS « à éviter avant 10 semaines d'aménorrhée » ; SPILF « à éviter les deux premiers mois » ; CRAT « Avant 10 SA… On préférera un autre antibiotique » ; **RCP 19/05/2026 : CI au 1er trimestre, à éviter aux 2e-3e trimestres sauf nécessité** ; EAU « not in the first trimester ».
7. **Triméthoprime — posologies** : RCP cystite simple 300 mg/j 3 j ; SPILF 2015 cystite à risque 300 mg/j 5 j ; HAS grossesse 300 mg/j 7 j ; SPILF 2026 homme 300 mg ×1/j (7 j) ; EAU 200 mg ×2/j 5 j. Prophylaxie : SPILF 2015 et EAU 100 mg/j ; SPILF 2018, HAS et RCP 150 mg/j.
8. **Cystite récidivante — définition** : SPILF/HAS ≥ 4 épisodes / 12 mois ; EAU ≥ 3/an ou ≥ 2/6 mois.
9. **Antibioprophylaxie** : SPILF/HAS seulement si ≥ 1 épisode/mois après échec des mesures non antibiotiques ; EAU « Strong » après échec des mesures non antimicrobiennes, sans seuil de fréquence, et **inclut la nitrofurantoïne 50-100 mg/j**, que le RCP français contre-indique.
10. **Antibiothérapie de la cystite simple** : SPILF 2015 « un traitement par antibiotique est indiqué… (I-A) » ; EAU : chez la femme non âgée, « non-antibiotic therapy alone should be considered ».
11. **ECBU de la cystite simple** : SPILF/HAS non ; EAU culture si atypique, échec, récidive < 4 semaines, risque de résistance ; récidivante : SPILF ECBU « pour les premiers épisodes de récidive », EAU « Diagnose recurrent cystitis by urine culture ».
12. **Cystite gravidique — relais** : SPILF 2018 amoxicilline > fosfomycine ou pivmécillinam > TMP > (nitro, SMX-TMP, amox-clav, céfixime, cipro) ; HAS amoxicilline > TMP > nitrofurantoïne > SMX-TMP ou amox-clav (sans céfixime ni cipro).
13. **Colonisation gravidique — 5e intention** : SPILF 2015 inclut céfixime et ciprofloxacine ; SPILF 2018 céfixime sans cipro ; HAS ni l'un ni l'autre.
14. **Pivmécillinam — colonisation gravidique** : SPILF 2015 (II-B) vs SPILF 2018 (IV-C) ; RCP : « Les données sont limitées ».
15. **Colonisation avant geste — durée** : AFU 2026 J-2 → J0 à J+2 (3-5 j) ; IUAS 2015 jusqu'à l'ablation de sonde / 7 j max ; IDSA 2019 1-2 doses 30-60 min avant ; NLPC : durée non définie (AFU R3), 7 j avant évoqué (NP2).
16. **Homme** : SPILF 2026 nitrofurantoïne, pivmécillinam, fosfomycine 3 doses, TMP en option ; EAU : pivmécillinam/nitrofurantoïne chez le « younger men », SMX-TMP 7 j ; **RCP FURADANTINE : « n'est pas adapté aux infections urinaires chez l'homme »** ; SELEXID/DELPRIM/MONURIL : AMM féminine → **tout usage chez l'homme est hors AMM**.

---

## 11. Proposition de modélisation

### 11.1 Situations à distinguer
| Code proposé | Définition opérationnelle | Source |
|---|---|---|
| `cystite_simple` | Femme non enceinte, signes urinaires bas sans fièvre ni signe de PNA, **aucun** FDR de complication | HAS cystite ; SPILF 2015 p. 6 |
| `cystite_a_risque` | Femme non enceinte avec ≥ 1 FDR : anomalie organique/fonctionnelle de l'arbre urinaire ; IR sévère (DFG < 30 HAS ; Clcr < 30 SPILF) ; immunodépression grave ; âge > 75 ans ou > 65 ans avec ≥ 3 critères de Fried | HAS cystite ; SPILF 2015 p. 6 |
| `cystite_recidivante` | ≥ 4 épisodes / 12 mois (traiter l'épisode comme la forme simple ou à risque) | SPILF 2015 p. 7 ; HAS |
| `cystite_gravidique` | Grossesse + signes de cystite | HAS femme enceinte |
| `colonisation_gravidique` | Grossesse, sans symptôme, bactériurie monomicrobienne ≥ 10⁵ UFC/ml | HAS femme enceinte |
| `colonisation_avant_geste` | ECBU indiqué par AFU 2026 (geste listé) et positif, sans signe d'infection | AFU 2026 Q1-Q3 |
| `cystite_homme` | Homme, signes locaux aigus sans fièvre → **IU masculine** (SPILF 2026), jamais « simple » | SPILF 2026 diapo 3, 8-11 |
| `cystite_associee_aux_soins` | Hors champ des fiches femme ; IUAS R.51-R.52 (5-7 j, différer) → **avis / brouillon** | IUAS 2015 |

Le diabète n'est pas un FDR (SPILF 2015 p. 6 ; HAS). « Cystites récidivantes à risque de complication » : hors champ SPILF 2015 (p. 5) et multidisciplinaire (SPILF 2018 p. 347) → **avis spécialisé**.

### 11.2 Données d'entrée (questions à poser)
- Sexe ; grossesse (oui/non) et **terme en SA** (TMP avant 10 SA / 1er trimestre ; nitrofurantoïne en fin de grossesse/travail).
- Fièvre, frissons, douleur lombaire, malaise (→ sortir de la cystite : PNA/IU fébrile) ; tolérance / « patiente très symptomatique » (différable ou non).
- FDR de complication (liste 11.1) ; âge ; critères de Fried ; immunodépression grave ; anomalie urologique ; DFG (CKD-EPI) **et** Clcr (Cockcroft-Gault) — les RCP mélangent les deux grandeurs.
- Nombre d'épisodes sur 12 mois ; caractère post-coïtal ; échec à J3 / récidive < 2 semaines.
- BU (leucocytes, nitrites) ; ECBU : espèce, numération, leucocyturie, **antibiogramme** avec amoxicilline, **mécillinam**, **nitrofurantoïne**, **fosfomycine**, **triméthoprime**, SMX-TMP, amox-clav, céfixime/C3G, FQ ; mono/polymicrobien.
- Antécédent d'EI sous nitrofurantoïne ; prises itératives de nitrofurantoïne ; déficit en G6PD ; allergie au blé.
- Allergie : pénicillines / anaphylaxie à une β-lactamine (CI pivmécillinam, amoxicilline).
- Traitements : méthotrexate (CI TMP ; pivmécillinam déconseillé), valproate (pivmécillinam déconseillé), métoclopramide (fosfomycine à éviter), répaglinide (TMP déconseillé), hyperkaliémiants (TMP), AVK (INR).
- Terrain : porphyrie, trouble du transit œsophagien (CI pivmécillinam), anémie macrocytaire, IH sévère (CI TMP).
- FQ dans les 6 mois (si FQ envisagée en dernier recours).
- Geste urologique : type (table AFU), date prévue (ECBU ≤ 10 j avant, traitement débuté J-2).

### 11.3 Cystite simple (femme non enceinte)
- **Examens** : BU seule ; pas d'ECBU (SPILF 2015 p. 10, 12 ; HAS).
- **1re ligne** : fosfomycine-trométamol **3 g PO dose unique** à jeun (HAS ; SPILF 2015/2018 I-A ; RCP §4.2).
- **2e ligne** : pivmécillinam **400 mg ×2/j** — durée **divergente : 3 j (HAS) vs 5 j (SPILF 2015/2018, RCP)** → afficher 3 j (HAS, plus récent) avec mention de la divergence, ou laisser en **brouillon** ; choix à arbitrer par le relecteur médical.
- **Si les deux sont impossibles** : pas de 3e ligne probabiliste → **ECBU** et traitement documenté selon la stratégie de la cystite à risque (SPILF 2018 p. 346 ; HAS « Les autres antibiotiques ne sont pas indiqués »). Ne PAS proposer FQ (ANSM 2023, SPILF 2018) ni nitrofurantoïne probabiliste (SPILF 2018, RCP).
- **Surveillance** : pas de contrôle ; ECBU si persistance/aggravation à J3 ou récidive < 2 semaines (HAS). Retraitement : même durée (SPILF 2015 p. 12).
- **Hospitalisation / gravité** : aucune dans les sources pour la cystite ; signes systémiques → requalifier (EAU 3.4.1).

### 11.4 Cystite à risque de complication (femme non enceinte)
- **Examens** : BU + **ECBU systématique** (SPILF 2015 p. 13 ; SPILF 2018 II-B ; HAS) ; bladder-scan si suspicion de rétention (SPILF 2015 p. 13).
- **Stratégie par défaut : différer** jusqu'à l'antibiogramme (HAS [2024] ; SPILF 2018 accord professionnel).
- **Différé, selon l'antibiogramme** : amoxicilline 1 g ×3/j 7 j > pivmécillinam 400 mg ×2/j 7 j > nitrofurantoïne 100 mg ×3/j 7 j (HAS ; SPILF 2018) ; au-delà : fosfomycine 3 g J1-J3-J5 puis TMP 300 mg/j 5 j (**SPILF 2018 seulement**, hors fiche HAS ; fosfomycine 3 doses hors AMM) → **brouillon**. Amox-clav, céfixime, FQ, SMX-TMP : SPILF 2015 seulement (5e choix) → **avis**.
- **Probabiliste (non différable, rare)** : nitrofurantoïne 100 mg ×3/j (si DFG/Clcr ≥ 45, pas de traitement itératif, pas d'antécédent d'EI, pas de déficit G6PD) ; sinon fosfomycine 3 g J1-J3-J5 (HAS ; SPILF 2018 III-B). Réévaluation **systématique** à l'antibiogramme (HAS ; SPILF 2015 p. 14). Durée totale 7 j (SPILF 2015 p. 16 algorithme 2).
- **Surveillance** : pas d'ECBU de contrôle sauf évolution défavorable (HAS).
- **Avis** : cystite récidivante à risque ; échec malgré traitement adapté (non traité par les sources : zone grise).

### 11.5 Cystite récidivante
- **Épisode** : comme la cystite simple (ou à risque) ; **pas de nitrofurantoïne** (SPILF 2015 p. 16 ; SPILF 2018 p. 348) ; ECBU pour les premiers épisodes de récidive (SPILF IV-C).
- **Auto-traitement** après BU : possible, réévaluation 2 fois/an (SPILF II-B) — information, pas d'automatisation.
- **Antibioprophylaxie** : à documenter en **« avis »** : seulement si ≥ 1 épisode/mois après échec des mesures non antibiotiques, ECBU négatif préalable ; fosfomycine 3 g tous les 7 j au maximum ou TMP 150 mg/j au coucher (HAS, SPILF 2018, RCP DELPRIM) ; 2e intention SMX-TMP 400/80 mg/j ; post-coïtal dans les 2 h avant/après le rapport ; durée « au moins 6 mois », réévaluation 2 fois/an (SPILF 2015 p. 15 ; HAS : pas de durée). Nitrofurantoïne CI, FQ interdites, β-lactamines à éviter.

### 11.6 Grossesse
- **Cystite gravidique** : ECBU puis **probabiliste immédiat** : fosfomycine 3 g DU (1re), pivmécillinam 400 mg ×2/j 7 j (2e) (HAS ; SPILF 2018 ; RCP SELEXID 7 j ; CRAT). Échec/résistance : amoxicilline 1 g ×3/j 7 j > TMP 300 mg/j 7 j (**pas avant 10 SA HAS / CI au 1er trimestre RCP**) > nitrofurantoïne 100 mg ×3/j 7 j (CI fin de grossesse/travail, DFG < 45) > SMX-TMP 800/160 ×2/j 7 j ou amox-clav 1 g ×3/j 7 j (HAS). Céfixime/ciprofloxacine : SPILF seulement → **avis**.
- **Colonisation gravidique** (≥ 10⁵ UFC/ml monomicrobienne) : **pas de probabiliste** ; dès l'antibiogramme : amoxicilline 7 j > pivmécillinam 7 j > fosfomycine 3 g DU > TMP 300 mg/j 7 j (≥ 10 SA ; RCP : CI T1) > nitrofurantoïne / SMX-TMP / amox-clav 7 j (HAS ; SPILF).
- **Suivi** (cystite et colonisation) : ECBU 8-10 j après l'arrêt, puis mensuel jusqu'à l'accouchement (HAS ; SPILF 2015 accord professionnel).
- **Streptocoque B** : traitement si ≥ 10⁵ + prophylaxie per-partum quel que soit le titre (SPILF 2015 p. 31 ; SPILF 2018 p. 338) → message d'information (HAS muette).
- **Zone grise** : TMP entre 10 SA et fin du 1er trimestre (HAS « éviter avant 10 SA » vs RCP « CI au 1er trimestre ») → proposer de suivre le RCP (plus restrictif) ou **avis**.

### 11.7 Colonisation avant geste urologique
- Indication (geste par geste) : `recherche-indication.md` §1.2 (déjà modélisée).
- **Moment** : ECBU ≤ 10 j avant ; antibiotique **débuté 48 h avant** le geste, poursuivi au minimum jusqu'à J0 et au maximum 48 h après, total 3-5 j (AFU Q3 R2, Grade C). NLPC : durée **non définie** → avis.
- **Molécules** (AFU R4, AE) : 1re intention (ordre alphabétique) fosfomycine-trométamol (J-2 / J0), nitrofurantoïne, pivmécillinam, triméthoprime ; 2e amoxicilline, cotrimoxazole ; 3e amox-clav ; 4e FQ, céfixime.
- **Posologies** : **non données par AFU** → à emprunter (proposition, statut **brouillon**) aux posologies curatives des cystites : fosfomycine 3 g par prise (RCP), nitrofurantoïne 100 mg ×3/j (HAS ; RCP 300 mg/j ; **hors indication RCP chez l'homme**), pivmécillinam 400 mg ×2/j (HAS/RCP), TMP 300 mg/j (RCP), amoxicilline 1 g ×3/j, SMX-TMP 800/160 ×2/j. Ce report n'est écrit dans aucune source.
- Polymicrobien : pas de recommandation ; si traitement décidé : les 4 molécules de 1re intention (AFU R6).

### 11.8 Homme
- Ne pas proposer « cystite simple » ; renvoyer vers l'IU masculine SPILF 2026 : ECBU, différé si bien toléré ; probabiliste fosfomycine 3 g J1-J3-J5, nitrofurantoïne 100 mg ×3/j ou pivmécillinam 400 mg ×2/j ; documenté : amoxicilline 1 g ×3/j, fosfomycine 3 g/prise, nitrofurantoïne, pivmécillinam, TMP 300 mg ×1/j ; **7 j** (fosfomycine 3 doses) ; écho + RPM dès le 1er épisode (SPILF 2026 diapo 8-11, 37). Mentionner **hors AMM** pour les 4 molécules (RCP). Cystite masculine récidivante : hors champ SPILF 2026 → **avis**.

### 11.9 Adaptation rénale (récapitulatif RCP)
| Molécule | Règle RCP | Grandeur |
|---|---|---|
| Fosfomycine-trométamol | « n'est pas recommandée » si Clcr < 10 ml/min | Clcr |
| Pivmécillinam | dose de charge identique ; ÷ 2 si 15-30 ml/min ; ÷ 3 si < 15 ml/min ; « optimales… ne sont pas établies » | « filtration glomérulaire » |
| Nitrofurantoïne | CI si < 45 (Clcr §4.2 ; TFGe §4.3) ; SPILF : Clcr < 40 | mixte |
| Triméthoprime | CI si Clcr < 15 mL/min ; pas de palier au-dessus ; ↑ créatininémie sans baisse du DFG | Clcr |
Hémodialyse : aucune posologie trouvée pour ces 4 molécules (mentions de dialyse limitées au surdosage).

### 11.10 Ce que les sources ne tranchent pas (brouillon / avis)
- Durée du pivmécillinam dans la cystite simple (3 vs 5 j).
- Place de la fosfomycine 3 doses et du TMP dans la cystite à risque différée au-delà des 3 lignes HAS (SPILF 2018 seul).
- Abstention antibiotique / traitement symptomatique (EAU) vs antibiothérapie (SPILF).
- Durée de l'antibioprophylaxie (SPILF 2015 « au moins 6 mois » ; HAS silencieuse ; EAU 3-12 mois rapportés).
- Posologies de la colonisation avant geste ; durée avant NLPC.
- TMP entre 10 SA et 12-14 SA (HAS vs RCP).
- Cystite associée aux soins, cystite récidivante à risque, cystite récidivante de l'homme.
- Seuil nitrofurantoïne 40 vs 45 (vs 30 EAU) ; nitrofurantoïne chez l'homme (hors AMM, RCP « pas adapté »).

---

## 12. Ce qui relève de connaissances antérieures ou n'a pas été lu
- Lettres ANSM nitrofurantoïne 2012/2014/2016 : non lisibles (archives indisponibles) ; seul leur contenu repris dans le RCP est cité.
- Texte Légifrance sur la délivrance officinale (JORFTEXT000049734400) : non lu.
- Argumentaire AFU 2026 ; article princeps SPILF 2026 (403) ; figures/algorithmes SPILF 2018 (images).
- IDSA 2011 cystite non compliquée et guideline IDSA cUTI : non consultés. OMS AWaRe 2022 : non consulté.
- Génériques de fosfomycine-trométamol et leurs RCP : non vérifiés (seul MONURIL lu).
- Concentrations critiques CA-SFM du mécillinam, de la fosfomycine orale et de la nitrofurantoïne (« cystites ») : repérées dans le CA-SFM 2026 mais non analysées (domaine microbiologie).
