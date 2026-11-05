# Recherche documentaire — Lire un antibiogramme : ce qui change la décision (adulte)

Date de consultation : **2026-11-05** pour toutes les sources ci-dessous.
Complète `recherche-microbiologie.md` (fiches 1.7, 1.8, 2.1, sections 4.6, 7.1, 8) sans la répéter, sauf pour corriger ou préciser.

Conventions :
- **lu** = texte réellement extrait du document (PDF converti avec `pdftotext`, XLSX lu cellule par cellule avec un script Python sans dépendance, PPTX lu en XML). **non vérifié** = non lu dans la source (connaissance antérieure, résumé, ou source inaccessible).
- Les tableaux à colonnes **pivotées** (résistances naturelles CA-SFM, Expected Resistant Phenotypes EUCAST) ont été relus **par coordonnées** : position de chaque « R » comparée à la position des en-têtes de colonne dans le flux PDF. Contrôle de cohérence fait sur des lignes connues (*Serratia marcescens*, *Citrobacter freundii*) : alignement exact. Les cases concernées sont donc marquées « lu (coordonnées) ».
- Repères : pages = numéros imprimés (identiques aux pages PDF pour le CA-SFM 2026) ; XLSX EUCAST = « feuille, ligne ».
- Particularité du PDF CA-SFM 2026 : le texte extrait contient la séquence littérale « [...] » à plusieurs endroits (p. 34, 37, 50, 52, 60, 61, 72, 73, 75, 77, 96, 158, 161). Ce qui se trouvait à ces endroits n'est pas lisible ; les citations qui contiennent « [...] » le reproduisent tel quel.
- Citations ≤ 40 mots, langue d'origine.

---

## 1. Fiches sources

### S1 — CA-SFM / EUCAST, Recommandations 2026 V1.0 Septembre 2026
- Organisme : Société Française de Microbiologie (SFM), Comité de l'antibiogramme. Version 2026 V1.0, septembre 2026.
- URL : https://www.sfm-microbiologie.org/casfm2026_v1-0-septembre-2026/ (PDF de 9,9 Mo renvoyé directement, 176 p.)
- Statut d'accès : **lu**. Statut de vigueur : **en vigueur** (voir fiche 2.1 du fichier précédent).

**Chapitre 2 — Résistances naturelles (p. 34-38)**
- Définition (p. 34) : « Les quelques souches apparemment sensibles aux antibiotiques auxquels l'espèce est naturellement résistante devraient donc être interprétées « R ». Les résistances naturelles de bas niveau ne devant pas modifier la catégorisation sont indiquées par la lettre « r » ».
- 2.1.1 Enterobacterales, résistances communes (p. 34) : « Pénicilline G, oxacilline, glycopeptides et lipoglycopeptides, macrolides (avec certaines exceptions1), kétolides, lincosamides, streptogramines, acide fusidique, oxazolidinones, daptomycine, rifampicine. »
- Tableau espèces (p. 34-35, lu par coordonnées) — colonnes : aminopénicillines, amoxicilline-clavulanate, ticarcilline-pipéracilline, C1G, céfoxitine, céfuroxime, imipénème, gentamicine, tobramycine, amikacine, tétracyclines, tigécycline, colistine, nitrofurantoïne, fosfomycine :
  - *Enterobacter cloacae* complex : R aminopénicillines, amoxicilline-clavulanate, C1G, céfoxitine ; colistine « R4 » (note 4 : « Résistance hétérogène observée dans plusieurs sous-groupes phylogénétiques »).
  - *Klebsiella* spp. : R aminopénicillines, ticarcilline-pipéracilline.
  - *Proteus mirabilis* : imipénème « r5 », tétracyclines, tigécycline, colistine, nitrofurantoïne. Note 5 (p. 35) : « Résistance naturelle de bas niveau à l'imipénème : les souches sauvages sont catégorisées « sensibles à forte posologie ». »
  - *E. coli* : absent du tableau (seules les résistances communes s'appliquent).
- 2.1.3 Bacilles à Gram négatif non fermentaires, résistances communes (p. 36) : « Pénicilline G, aminopénicillines, oxacilline, céphalosporines de 1re et 2e génération, céfotaxime, ceftriaxone, ertapénème, glycopeptides et lipoglycopeptides, macrolides, kétolides, lincosamides, streptogramines, acide fusidique, oxazolidinones, daptomycine. » (la rifampicine **n'y figure pas**).
- *P. aeruginosa* (p. 36, lu par coordonnées) : R amoxicilline-clavulanate, « aminosides » avec note 3, chloramphénicol, triméthoprime, **triméthoprime-sulfaméthoxazole**, tétracycline, doxycycline, tigécycline/minocycline. Note 3 : « Pseudomonas aeruginosa est naturellement résistant à la kanamycine et la néomycine » → le « R » aminosides ne vise **pas** amikacine/gentamicine/tobramycine.
- 2.3 Cocci à Gram positif, résistances communes (p. 37) : « Mécillinam, aztréonam, céfidérocol, témocilline, acide nalidixique, colistine. »
- Tableau cocci Gram + (p. 37, lu par coordonnées) — colonnes : péfloxacine, acide fusidique, oxacilline, céphalosporines, ertapénème, aminosides, lincosamides, streptogramines, pleuromutilines, vancomycine, téicoplanine, fosfomycine, sulfamides :
  - *Enterococcus* spp. : R péfloxacine, acide fusidique, oxacilline, céphalosporines, ertapénème, aminosides « r » (notes 1, 2), sulfamides.
  - *E. faecalis* et *E. avium* : idem + lincosamides, streptogramines, pleuromutilines ; note 3 sur céphalosporines : « Sauf ceftobiprole et E. faecalis. »
  - *Streptococcus* spp. : R péfloxacine, acide fusidique, aminosides « r » (note 1).
  - *S. aureus* : **aucune** ligne spécifique (seules les résistances communes).
  - Note 1 : « Résistance naturelle de bas niveau aux aminosides : l'association d'un aminoside et d'une molécule active sur la paroi bactérienne (β-lactamine ou glycopeptide) est synergique et bactéricide pour les souches qui ne présentent pas un haut niveau de résistance aux aminosides. »
  - Note 2 : « Chez E. faecium, la production de deux enzymes chromosomiques, AAC(6')-li et EfmM, abolit la synergie entre pénicillines/glycopeptides et aminosides (sauf gentamicine). »

**Chapitre 5.1 Enterobacterales (p. 48-58)** — compléments à la fiche 2.1 :
- p. 49 : « Pour Proteus mirabilis, les souches catégorisées « résistantes » à l'amoxicilline (ou à l'ampicilline) doivent être catégorisées « résistantes » à la ticarcilline et à la pipéracilline. »
- p. 49 (BLSE et inhibiteurs) : « Si l'utilisation d'une de ces associations est retenue par le clinicien pour traiter une infection due à une souche productrice de BLSE, il y a lieu de déterminer la CMI de l'association retenue si l'infection à traiter est autre qu'une infection urinaire. »
- p. 49, note 1/A : « La catégorisation de l'amoxicilline peut être déduite de celle de l'ampicilline. Ne pas rendre le résultat de l'ampicilline sur le compte rendu ».
- p. 49, témocilline (lu par coordonnées) : ligne « Témocilline (infections urinaires sans signes de gravité) » S ≤ 8, R > 16 mg/L, disque 30 µg, S ≥ 20, R < 17 mm (aucune restriction d'espèce écrite sur cette ligne) ; ligne « Témocilline (autres infections), E. coli, Klebsiella spp. (sauf K. aerogenes), Raoultella spp. et P. mirabilis » S ≤ 0,001, R > 16 mg/L, S ≥ 50, R < 17 mm.
- p. 49, amoxicilline-clavulanate : 8/8 mg/L (19/19 mm) ; « (cystites) » 32/32 mg/L (16/16 mm).
- p. 51 (lu par coordonnées) : céfotaxime 1/2 ; ceftriaxone 1/2 ; céfépime 1/4 ; ceftazidime 1/4 ; aztréonam 1/4 ; « Céfixime (cystites ou relais pour pyélonéphrites) » 1/1 ; « Céfoxitine, E. coli » 8/8 mg/L, 18/18 mm.
- p. 51, note 8 : « La céfoxitine peut être utilisée pour la détection des Enterobacterales hyperproductrices de céphalosporinases (AmpC) : ce test est sensible, mais peu spécifique [...]. Pour une utilisation thérapeutique, les valeurs critiques ne sont validées que pour E. coli. »
- p. 50 : « Une souche catégorisée « sensible à forte posologie » ou « résistante » au céfotaxime et/ou ceftriaxone et/ou ceftazidime et/ou aztréonam en l'absence de synergie [...] est évocatrice d'une souche hyperproductrice de céphalosporinase chromosomique (Enterobacterales du groupe 3 et E. coli) ou d'une céphalosporinase plasmidique ».
- p. 50 : liste du groupe 3 : « Citrobacter freundii complex, Enterobacter cloacae complex, Hafnia spp., Klebsiella aerogenes, Morganella morganii, Pantoea agglomerans, Providencia spp. et Serratia marcescens ».
- p. 52 : ertapénème 0,5/0,5 ; imipénème 2/4 ; « Imipénème, Morganellaceae » 0,001/4 (note 1 : « Un bas niveau de résistance est commun aux Morganellaceae imposant l'utilisation de fortes posologies. ») ; méropénème 2/8 ; méropénème méningites 2/2.
- p. 53 : ciprofloxacine 0,25/0,5 ; lévofloxacine 0,5/1 ; note 1/A : dépistage acide nalidixique/péfloxacine positif avec FQ « sensibles » → pas de changement de catégorie, mais « un commentaire indiquant la présence d'un bas niveau de résistance aux fluoroquinolones et le risque de sélection de mutants résistants ». Note B : « Afin d'exclure tout mécanisme de résistance aux fluoroquinolones en cas de méningite, déterminer la CMI de la ciprofloxacine. »
- p. 54, aminosides : amikacine 8/8 (18/18 mm), gentamicine 2/2 (17/17), tobramycine 2/2 (16/16), **sans parenthèses** ; commentaire : « Infections systémiques : pour les souches sensibles, l'utilisation d'un aminoside est préconisée en association avec d'autres molécules actives ». Règle : « Une résistance isolée à la tobramycine est improbable : pour ce phénotype [...] l'amikacine doit être interprétée « résistante ». »
- p. 55 (lu par coordonnées) : triméthoprime-sulfaméthoxazole « (infections urinaires sans signes de gravité) » 2/2 mg/L (14/14 mm) ; « (autres infections) » 0,5/0,5 mg/L (15/15 mm).

**Chapitre 5.2 Pseudomonas (p. 59-62)**
- Valeurs « off-scale » S ≤ 0,001 (souche sauvage = SFP) lues : pipéracilline (0,001/16), pipéracilline-tazobactam (0,001/16), céfépime (0,001/8), ceftazidime (0,001/8), aztréonam (0,001/16), imipénème (0,001/4), ciprofloxacine (0,001/0,5), lévofloxacine (0,001/0,5 — lu par coordonnées, **diffère d'EUCAST**, voir S2). Méropénème *P. aeruginosa* 2/8 (pas off-scale).
- Aminosides : amikacine 16/16, tobramycine 2/2 ; **la gentamicine n'est pas listée** pour Pseudomonas (liste standard p. 59 : amikacine, tobramycine). Commentaire « en association » pour les infections systémiques (p. 62).
- p. 61 : « Afin de limiter l'usage abusif du méropénème, il est proposé de ne pas rendre sur le compte rendu [...] le résultat du méropénème [...] si une ou plusieurs autres β-lactamines de spectre plus étroit [...] sont catégorisées « sensibles à forte posologie ». »
- p. 61 : « Une résistance isolée aux carbapénèmes correspond à une imperméabilité spécifique. Cette résistance n'est pas croisée avec les autres β-lactamines. »
- p. 60, note 6 : « Une co-résistance à l'imipénème (CMI > 4 mg/L ou diamètre < 20 mm) et à l'association ceftolozane-tazobactam (CMI > 4 mg/L ou diamètre < 23 mm) est évocatrice de la production de carbapénèmase chez Pseudomonas aeruginosa. »
- p. 61, note 1 : « L'efficacité de la lévofloxacine est inférieure à celle de la ciprofloxacine. »

**Chapitre 5.7 Staphylococcus (p. 72-79)** — changement 2026 sur la pénicillinase :
- p. 73 : « Les tests chromogéniques utilisant la nitrocéphine manquent de sensibilité pour détecter de façon fiable la production de pénicillinase par les staphylocoques ».
- p. 73, note 1/A (S. aureus) : « la détermination de la CMI de la pénicilline G permet de confirmer la présence de pénicillinase si la CMI est > 0,125 mg/L ; une CMI ≤ 0,125 mg/L ne permet pas d'exclure la présence d'une pénicillinase. » Suite : seules les souches avec « à la fois un diamètre ≥ 26 mm ET une bordure floue » ne produisent pas de pénicillinase (p. 79 : bordure floue → « Rendre « sensible » » ; bordure nette → « Rendre « résistant » »).
- p. 73, note 2/B (S. lugdunensis) : pénicillinase si CMI > 0,125 mg/L ou diamètre < 26 mm.
- p. 73 : « Les souches méticillino-sensibles non productrices de pénicillinase sont également sensibles à la pénicilline G, à la pénicilline V, aux aminopénicillines, aux carboxypénicilines et aux uréidopénicillines. »
- p. 73, note 4 : discordance oxacilline R (CMI > 0,25 mg/L) / céfoxitine négative en automate → « vérifier le résultat avec un disque de céfoxitine et/ou rechercher la présence additionnelle d'un gène mecA/C ou d'une PLP2a/c ».
- p. 74, céfoxitine (dépistage) : S ≥ 22 / R < 22 mm pour « S. aureus, et SCN autres que S. epidermidis ou S. lugdunensis » ; S ≥ 27 / R < 27 mm pour « S. epidermidis et S. lugdunensis » ; note C : SCN non identifié à l'espèce « S ≥ 27 mm, R < 22 mm, avec une ZIT à 22-26 mm ; pour les résultats en ZIT, rechercher la présence additionnelle d'un gène mecA/C ou d'une PLP2a/c ». (Valeurs 2026 **vérifiées** ; corrige le « non vérifié » de la fiche 2.1.)
- p. 74, note 1/A : CMI de céfoxitine utile seulement pour S. aureus et S. lugdunensis (> 4 mg/L) et S. saprophyticus (> 8 mg/L).
- p. 74, note 2 : ceftaroline SFP/R ou ceftobiprole R « sont rares. Vérifier le résultat ainsi que l'identification ».
- p. 75, fluoroquinolones, note A : dépistage norfloxacine négatif (≥ 17 mm) → « « sensibles » à la moxifloxacine et à la délafloxacine, « sensibles à forte posologie » à la lévofloxacine et « sensibles à forte posologie en association » à la ciprofloxacine ». Note 1/B : ciprofloxacine « préconisée à forte posologie et en association ».
- p. 75, aminosides : gentamicine S. aureus 2/2 (18/18 mm), SCN 2/2 (22/22) ; note 1 « Infections systémiques : [...] en association » ; note 2 « Les souches résistantes à la gentamicine sont résistantes à tous les aminosides. » ; note 3 (kanamycine dépistage) « Interprétation valable pour l'amikacine. » ; note 4 « Les souches résistantes à la tobramycine sont résistantes à la kanamycine et à l'amikacine. »
- p. 76, glycopeptides : vancomycine S. aureus 2/2 mg/L, SCN 4/4 ; note 3 « doit obligatoirement être réalisée par microdilution en milieu liquide » ; note 4 « Pour S. aureus et la vancomycine, des échecs thérapeutiques ont été rapportés avec des souches de CMI à 2 mg/L. » ; note A : méthode des disques interdite.
- p. 78 : rifampicine S. aureus 0,06/0,06 mg/L ; note 4 « Pour les souches sensibles, l'utilisation de la fosfomycine iv ou de la rifampicine est préconisée en association » ; note 2 « Les souches résistantes à la daptomycine sont exceptionnelles. [...] elle ne doit pas être utilisée pour traiter les pneumonies. »

**Chapitre 5.8 Enterococcus (p. 80-84)**
- p. 80 : ampicilline (dépistage)/amoxicilline 4/4 mg/L ; « Pipéracilline, E. faecalis » 0,001/16 ; note 1/A : « Chez E. faecalis la résistance aux aminopénicillines est exceptionnelle [...] vérifier le résultat ainsi que l'identification » ; note 2/B : « Chez E. faecalis, des souches sensibles aux aminopénicillines peuvent être résistantes à la pipéracilline et/ou à l'imipénème. »
- p. 81 : HNR gentamicine (CMI > 128 mg/L ou < 8 mm), croisée avec amikacine et tobramycine (déjà noté) ; formulation via Annexe 7.
- p. 82 : « Les espèces E. gallinarum et E. casseliflavus présentent une résistance naturelle à la vancomycine (VanC). » ; « Le phénotype « résistant » à la téicoplanine et « sensible » à la vancomycine est impossible. » ; téicoplanine 2/2 ; vancomycine 4/4 ; note A : pas de rendu « sensible » avant 24 h ; note B : bordure floue ou colonies → « confirmer la résistance par PCR ou rendre « résistant » ».
- p. 84, note 5/E : « L'activité du triméthoprime ou du triméthoprime-sulfaméthoxazole sur les entérocoques est incertaine et l'antibiogramme n'est pas prédictible de l'efficacité clinique. » ; note 2 : daptomycine R « rares ».

**Chapitre 5.9 S. pneumoniae (p. 85-89, lu par coordonnées)**
- p. 86 : oxacilline 1 µg (dépistage) S ≥ 20 mm ; pénicilline G 0,06/1 ; « méningites et endocardites » 0,06/0,06 ; amoxicilline iv 1/2 ; amoxicilline iv « méningites et endocardites » 0,5/0,5 ; note 1/A : si dépistage positif « notamment en cas d'infection grave, d'échec clinique [...] il y a lieu de déterminer la CMI d'au moins une des β-lactamines [...] (amoxicilline, céfotaxime, ceftriaxone) ».
- p. 87 : céfotaxime et ceftriaxone 0,5/2 ; « méningites et endocardites » 0,5/0,5 ; méropénème (méningites) 0,25/0,25 avec note « la CMI du méropénème doit être déterminée ».

**Chapitre 5.10 Streptocoques A, B, C, G (p. 90-92)**
- p. 91 (lu par coordonnées) : « Pénicilline G, S. agalactiae » 0,125/0,125 mg/L (18/18 mm) ; « Pénicilline G, S. pyogenes, S. dysgalactiae, S. equi et S. canis » **0,06/0,06 mg/L** (23 mm) — **diffère d'EUCAST v16.1 (0,03)**, voir S2.
- p. 91 : amoxicilline et pipéracilline : « se déduit de la sensibilité à la pénicilline G » ; céphalosporines et carbapénèmes : « Les souches « sensibles à posologie standard » à la pénicilline G peuvent être catégorisées « sensibles à posologie standard » aux céphalosporines ».
- p. 92 : « Les streptocoques présentent une résistance naturelle de bas niveau (BNR) à tous les aminosides [...]. L'acquisition d'une résistance de haut niveau (HNR) abolit cet effet synergique bactéricide. » ; gentamicine : « Pour les infections qui le nécessitent, déterminer la CMI » ; HNR si CMI > 128 mg/L.

**Chapitre 5.11 Autres streptocoques (viridans, groupe S. bovis dont S. gallolyticus) (p. 95-97)**
- p. 96 (lu par coordonnées) : pénicilline G 0,25/0,25 (21 mm) ; ampicilline (dépistage) 0,5/2 ; amoxicilline 0,5/2 ; **pas de ligne « endocardite » distincte** (contrairement à EUCAST).
- p. 96, note 1/A : « En cas d'infection grave, d'échec clinique ou si le test de dépistage est positif (diamètre < 21 mm ou CMI > 0,25 mg/L), déterminer la CMI d'au moins une β-lactamine ».
- p. 96 : céfotaxime, ceftriaxone, céfépime 0,5/0,5 ; ertapénème 0,5/0,5 ; imipénème, méropénème 2/2.
- p. 97 : gentamicine HNR : « Pour les infections qui le nécessitent (endocardites par exemple), déterminer la CMI. »

**Annexe 6 — criblage des carbapénémases (p. 158)**
- Nœuds du logigramme (lus ; **les flèches ne sont pas lisibles**, l'enchaînement exact est **non vérifié**) : ceftazidime-avibactam (10-4 µg) < 10 mm ; méropénème ou imipénème (10 µg) < 22 mm (imipénème non utilisable pour les Morganellaceae) ; témocilline (30 µg) < 16 mm ; « Enterobacterales du groupe 3 » ; méropénème ou imipénème < 32 mm sur MH-cloxacilline (partie optionnelle) ; issues « Réaliser un test de confirmation de carbapénèmase » / « Pas de carbapénèmase ».
- Méthodes automatisées : « toute souche catégorisée « sensible à forte posologie » ou « résistante » à au moins un des carbapénèmes testés peut être considérée comme suspecte de produire une carbapénémase. De plus, toute souche d'Escherichia coli présentant une CMI à l'ertapénème ≥ 0,25 mg/L doit également être considérée comme suspecte ».
- p. 158 : environ 10 % des souches OXA-48-like ou VIM ont des diamètres compatibles avec une sensibilité à tous les carbapénèmes.

**Annexe 7 — Formulation des résultats (p. 159-162)** — source principale des **libellés**
- Tableau 2 (p. 162) : cas général « Sensible à posologie standard » ou « sensible » ou « S » / « Sensible à forte posologie » ou « SFP » ou « F » / « Résistant » ou « R » ; « en association » : « Sensible à posologie standard en association », « Sensible à forte posologie en association » ; haut niveau : « Absence de résistance à haut niveau » / « Résistant à haut niveau » ; sauvage : « Absence de résistance » / « Résistant » ; ZIT : « Détermination de la CMI sur demande » (disques) ou « Non catégorisable » (CMI) ; sans concentration critique : « Utilisable avec précaution à posologie standard » / « Utilisable avec précaution à forte posologie » / « Utilisation déconseillée ».
- Tableau 2, note 2 (commentaire urinaire proposé) : « En cas de cystite, les molécules à élimination urinaire prédominante catégorisées « sensibles à forte posologie » peuvent être utilisées à posologie standard. »
- Tableau 1 (p. 161, page pivotée relue par coordonnées) :
  - « Sensible à posologie standard en association » : aminosides pour Enterobacterales, *Pseudomonas*, *Acinetobacter*, *Staphylococcus* (« Infection systémique uniquement : si infection urinaire, rendre « sensible » sans mention « en association » ») ; colistine ; fosfomycine iv ; **rifampicine** pour *Staphylococcus*, *Streptococcus* et autres (prophylaxie : « sensible » sans mention).
  - « Sensible à forte posologie en association » : **ciprofloxacine** pour *Staphylococcus* ; minocycline (*Acinetobacter*, *S. maltophilia*).
  - « Résistances à haut niveau » : aminosides pour *Enterococcus* et *Streptococcus* (commentaire) ; « S. pneumoniae : pas d'utilité de tester la gentamicine ».
  - « Distinction des souches sauvages et non sauvages » : moxifloxacine (entérocoques, streptocoques « autres ») ; triméthoprime et TMP-SMX pour *Enterococcus* (« Pour les souches sauvages, accompagner le résultat d'un commentaire ») ; triméthoprime pour streptocoques A/B/C/G.
  - Note 4 : entérocoques sauvages vis-à-vis du TMP/TMP-SMX → « un commentaire peut préciser que l'efficacité clinique de la molécule est incertaine. »

**Annexe 8 (p. 163)** — commentaires pouvant remplacer l'antibiogramme : pour *E. faecalis* et streptocoques β-hémolytiques A/B/C/G : « Espèce bactérienne sensible à l'amoxicilline aux doses adaptées au site et à la nature de l'infection. Contactez le laboratoire si nécessité de tester d'autres molécules. » ; « l'antibiogramme reste nécessaire pour des infections invasives ou sévères ».

### S2 — EUCAST, Clinical Breakpoint Tables v16.1 (XLSX)
- URL : https://www.eucast.org/fileadmin/eucast/pdf/breakpoints/v_16.1_Breakpoint_Tables.xlsx (en-tête lu : « EUCAST Clinical Breakpoint Tables v. 16.1, valid from 2026-06-24 »). Statut : **lu**, **en vigueur**.
- Attention de lecture : dans le XLSX, les appels de note sont collés aux valeurs (ex. « 0.0011 » = 0,001 + note 1 ; « 161 » = 16 + note 1). Les valeurs ci-dessous sont corrigées en conséquence.

**Pseudomonas (feuille « Pseudomonas »)** — molécules à S ≤ 0,001 (sauvage rendu I, jamais S, Note 13 de la feuille Notes) : pipéracilline (l. 15 : 0,001/16), pipéracilline-tazobactam (l. 16 : 0,001/16), ticarcilline-clavulanate (l. 17), céfépime (l. 33 : 0,001/8), ceftazidime (l. 41 : 0,001/8), doripénème (l. 53 : 0,001/2), imipénème (l. 55 : 0,001/4), aztréonam (l. 65 : 0,001/16), ciprofloxacine (l. 71 : 0,001/0,5), lévofloxacine (l. 73 : 0,001/**2**).
- Non off-scale : méropénème *P. aeruginosa* (l. 57) 2/8 ; ceftazidime-avibactam 8/8 ; ceftolozane-tazobactam 4/4 ; imipénème-relebactam 2/2 ; céfidérocol 2/2.
- Aminosides : « Amikacin (systemic infections) » **(16)/(16)** ; « (infections originating from the urinary tract) » 16/16 ; tobramycine systémique **(2)/(2)**, urinaire 2/2 ; **gentamicine IE** (systémique et urinaire) ; note 1/A : « For information on how to use breakpoints in brackets, see [guidance] ».
- Colistine (4)/(4) entre parenthèses.
- Tiret « - » (« report resistant without prior testing », Note 8) pour : ampicilline, amoxicilline, amoxicilline-clavulanate, **témocilline**, cloxacilline, céfazoline, céfixime, **céfotaxime**, **céfoxitine**, **ceftriaxone**, **ertapénème**, vancomycine, **daptomycine**, **rifampicine**, **triméthoprime-sulfaméthoxazole**.
- Implication : pour *P. aeruginosa*, un antibiogramme « sauvage » ne contient **aucun « S »** pour pipéracilline(-tazobactam), ceftazidime, céfépime, aztréonam, imipénème, ciprofloxacine, lévofloxacine : la catégorie attendue est I/SFP → **forte posologie obligatoire** ; seul le méropénème peut être « S ».

**Enterobacterales (feuille « Enterobacterales »)**
- l. 26 : « Temocillin (infections originating from the urinary tract), E. coli, Klebsiella spp. (except K. aerogenes) and P. mirabilis » 0,001/16, 30 µg, 50/17 mm (note F : « Ignore isolated colonies within the inhibition zone. ») — **aucune autre ligne témocilline** (pas de ligne « autres infections »).
- l. 47 : « Cefoxitin (screen only) » Note 5, 30 µg, 19/19 mm ; note 5 : « The cefoxitin cut-off value (8 mg/L) has a high sensitivity but poor specificity for identification of AmpC-producing Enterobacterales [...]. Classical non-AmpC producers are wild type, whereas plasmid AmpC producers or chromosomal AmpC hyperproducers are non-wild type. »
- l. 40 : « Cefazolin (infections originating from the urinary tract), E. coli and Klebsiella spp. (except K. aerogenes) » 0,001/4 ; note 2/A : souches sensibles à céfadroxil/céfalexine → « susceptible, increased exposure » (I) à la céfazoline.
- Note 1 céphalosporines (sous la l. 37) : « Some isolates that produce beta-lactamases are susceptible to 3rd or 4th generation cephalosporins with these breakpoints and should be reported as tested, i.e. the presence or absence of an ESBL does not in itself influence the categorisation of susceptibility. »
- Note 1 carbapénèmes (l. 63) : « If a carbapenemase is detected, the clinical response to treatment with carbapenems [...] may be impaired, even if categorised S or I. Other antimicrobials are preferred [...]. For carbapenemase screening, a meropenem screening cut-off of >0.125 mg/L (zone diameter <28 mm) is recommended. »
- Aminosides (l. 95-98) : amikacine systémique (8)/(8) (18 mm), urinaire 8/8 ; gentamicine systémique (2)/(2) (17 mm), urinaire 2/2 (**valeurs confirmées sur le XLSX** ; corrige le « à confirmer » de la fiche 1.1).
- TMP-SMX (l. 157) : Enterobacterales sauf *Serratia* 0,5/0,5 (15/15 mm) ; *Serratia* 0,001/2.
- Amoxicilline oral « (infections originating from the urinary tract) » 0,001/8 ; amoxicilline-clavulanate oral « (other indications) » (0,001)/(8) entre parenthèses ; iv 8/8.
- Tirets pour cloxacilline, vancomycine, daptomycine, rifampicine.

**Staphylococcus (feuille « Staphylococcus »)**
- l. 10 note 1/A : « Isolates that test susceptible to benzylpenicillin and cefoxitin can be reported susceptible to all penicillins. Isolates that test resistant to benzylpenicillin but susceptible to cefoxitin are susceptible to β-lactam β-lactamase inhibitor combinations, the isoxazolylpenicillins [...] Isolates that test resistant to cefoxitin are resistant to all penicillins. »
- Note B : « For S. aureus, disk diffusion is more reliable than MIC determination for detection of penicillinase producers [...] If the zone diameter is <26 mm, then report resistant. » ; « Chromogenic cephalosporin-based beta-lactamase tests do not reliably detect staphylococcal penicillinase. »
- Note 2/C (autres staphylocoques) : « No currently available method can reliably detect penicillinase production in all species of staphylococci ».
- Céfoxitine dépistage (l. 42-43) : 22/22 mm (S. aureus et SCN hors S. epidermidis/S. lugdunensis) ; 27/27 mm, ATU 27 (S. epidermidis, S. lugdunensis) ; note B : SCN non identifié « use zone diameter breakpoints S≥25, R<25 mm, with an ATU of 22-24 mm ».
- Note 1/A céphalosporines (l. 33) : « If cefazolin, cefepime, cefotaxime, ceftriaxone or cefuroxime iv are reported for methicillin-susceptible staphylococci, these should be reported “susceptible, increased exposure” (I) ».
- Ciprofloxacine S. aureus **(0,001)/(2)** entre parenthèses ; lévofloxacine 0,001/1 (sauvage = I) ; note D : dépistage norfloxacine négatif → moxifloxacine S, lévofloxacine I, ciprofloxacine « can be used in high exposure in combination therapy ».
- Amikacine (16)/(16), gentamicine (2)/(2) — **entre parenthèses**.
- Vancomycine S. aureus 2/2, SCN 4/4 ; note 1 : « S. aureus with vancomycin MIC values of 2 mg/L are on the border of the wild-type distribution and there may be an impaired clinical response. » ; note 2 (dalbavancine, téicoplanine, vancomycine) : « Resistant isolates are rare or not yet reported. [...] must be confirmed and the isolate sent to a reference laboratory. »
- Daptomycine S. aureus 1/1 (note 1 : R rares ou non rapportés) ; « other staphylococci » : Note 3 (ECOFF seulement).
- Rifampicine S. aureus et SCN 0,06/0,06 ; TMP-SMX 0,5/0,5.
- Tirets : témocilline, céfixime, aztréonam.

**Enterococcus (feuille « Enterococcus »)**
- Ampicilline iv 4/4 ; amoxicilline « Susceptibility can be inferred from ampicillin » ; note A : « For E. faecalis that test resistant to ampicillin with disk diffusion, confirm with an MIC test. » ; pipéracilline(-tazobactam) et imipénème *E. faecalis* 0,001/16 et 0,001/4 (sauvage = I).
- Gentamicine « (test for acquired aminoglycoside-modifying enzyme) » : note 2/A — « Negative test: Isolates with gentamicin MIC ≤128 mg/L or a zone diameter ≥8 mm [...] synergy with penicillins or glycopeptides can be expected [...]. For other aminoglycosides, this may not be the case. »
- Vancomycine *E. faecalis* et *E. faecium* 4/4 ; « E. casseliflavus and E. gallinarum » tiret ; téicoplanine 2/2.
- **Daptomycine IE** ; TMP et TMP-SMX « Note 4 » : « The activity of trimethoprim and trimethoprim-sulfamethoxazole is uncertain against enterococci, and it is not possible to predict clinical outcome. »
- Tirets : toutes les céphalosporines, témocilline, cloxacilline, ertapénème, **méropénème**, aztréonam, rifampicine.

**Streptococcus A, B, C, G (feuille « Streptococcus A,B,C,G »)**
- Benzylpénicilline groupes A, C, G **0,03/0,03** (23 mm) ; *S. agalactiae* 0,125/0,125 (18 mm) ; note 2 : « Resistant isolates are rare or not yet reported. »
- Note 1/A pénicillines : « The susceptibility of streptococcus groups A, B, C and G to penicillins is inferred from the benzylpenicillin susceptibility with the exception of phenoxymethylpenicillin and isoxazolylpenicillins for streptococcus group B ».
- Céphalosporines : « inferred from the benzylpenicillin susceptibility » ; carbapénèmes idem (« Note1 »).
- Lévofloxacine 0,001/2 ; vancomycine 2/2 ; daptomycine 1/1 ; rifampicine 0,25/0,25 ; TMP-SMX 0,5/0,5.
- Tirets : amikacine, **gentamicine**, ciprofloxacine, céfixime, témocilline, aztréonam.

**S. pneumoniae (feuille « S.pneumoniae »)**
- Note 1/B : « When the screen is negative (oxacillin zone diameter ≥20 mm, or benzylpenicillin MIC ≤0.06 mg/L) all beta-lactam agents for which clinical breakpoints are available [...] can be reported susceptible without further testing ».
- Benzylpénicilline 0,06/1 ; « (endocarditis and meningitis) » 0,06/0,06 ; ampicilline iv 0,5/1, « (endocarditis and meningitis) » 0,06/0,06 ; amoxicilline iv « (endocarditis and meningitis) » **0,06/0,06** ; céfotaxime/ceftriaxone 0,5/2, « (endocarditis and meningitis) » 0,5/0,5 ; méropénème méningite 0,25/0,25.
- Lévofloxacine 0,001/2 ; vancomycine 2/2 ; rifampicine 0,125 ; TMP-SMX 1/1. Tirets : ciprofloxacine, gentamicine, amikacine, céfixime, témocilline, aztréonam. Cloxacilline, céfazoline, céfoxitine : IE.
- L'organigramme (« flow chart ») est une image non lisible dans le XLSX : **non vérifié**.

**Viridans group streptococci (feuille « Viridans group streptococci »)** — inclut le groupe *S. bovis* dont *S. gallolyticus* (texte l. 6 lu).
- Benzylpénicilline « (screen only) » 0,25/0,25 (21 mm) ; « (indications other than endocarditis) » 0,25/1 ; **« (endocarditis) » 0,25/0,25** ; « (endocarditis, in combination with other antimicrobial treatment) » **(1)/(1)** entre parenthèses.
- Ampicilline iv (endocarditis) 0,5/0,5 ; amoxicilline iv (endocarditis) 0,5/0,5 ; hors endocardite 0,5/2.
- Note 1/A : « Isolates categorised as screen negative can be reported susceptible to beta-lactam agents [...]. Isolates categorised as screen positive should be tested for susceptibility to individual agents or reported resistant. »
- Céfotaxime, ceftriaxone, céfépime 0,5/0,5 ; imipénème, méropénème 2/2 ; ertapénème 0,5/0,5.
- Gentamicine « (test for acquired aminoglycoside-modifying enzyme) » : « Positive test: Isolates with gentamicin MIC >128 mg/L denote presence of aminoglycoside-modifying enzymes. Combinations between penicillins or glycopeptides and aminoglycosides will not be synergistic. »
- Vancomycine 2/2 ; **daptomycine IE** ; **lévofloxacine IE** ; rifampicine « Note » ; tirets : ciprofloxacine, **TMP-SMX**, céfixime.

**Feuille « Changes »** : la mise à jour « Flow chart updated with new recommendations on ampicillin and amoxicillin in endocarditis and meningitis » est rattachée à **Streptococcus pneumoniae** (l. 22), pas aux streptocoques A, B, C, G (l. 21 : céfidérocol, TMP-SMX). **Correction** de la fiche 1.1 du fichier précédent.

### S3 — EUCAST Expert Rules, Staphylococcus spp., novembre 2025
- URL : https://www.eucast.org/fileadmin/eucast/pdf/expert_rules/Staphylococcus_ExpertRules_20251109.pdf (lien lu sur https://www.eucast.org/bacteria/important-additional-information/expert-rules/). Statut : **lu**, en vigueur.
- Règle 1 (grade A) : céfoxitine positive → « report resistant to all beta-lactams, except those specifically licensed to treat infections caused by methicillin-resistant staphylococci [...] (ceftaroline and ceftobiprole) » ; céfoxitine négative → « report as susceptible to all beta-lactams with recognised anti-staphylococcal activity. » ; « EUCAST does not encourage screening for BORSA ».
- Règle 2 (grade C) : « IF resistant to benzylpenicillin OR IF beta-lactamase is detected, THEN report as resistant to all penicillins, regardless of MIC, except the isoxazolyl-penicillins and combinations with beta-lactamase inhibitors » ; remarque : « Testing for beta-lactamase production with nitrocefin is discouraged. »
- Règles 5-6 (FQ) : « IF resistant to levofloxacin or moxifloxacin, THEN report as resistant to all fluoroquinolones. » ; dépistage norfloxacine positif + I → avertissement de sélection de résistance.
- Règle 8 (glycopeptides) : vancomycine S → dalbavancine, oritavancine, télavancine S.
- **Aucune règle** sur les aminosides, la rifampicine, la daptomycine ni sur un phénotype « vancomycine R » dans ce document (lu en entier).

### S4 — EUCAST Expert Rules, Enterococcus spp., novembre 2025
- URL : https://www.eucast.org/fileadmin/eucast/pdf/expert_rules/Enterococcus_ExpertRules_20251109.pdf. Statut : **lu**.
- Règle 1 (grade C) : « IF resistant to ampicillin, THEN report as resistant to ureidopenicillins and imipenem » ; remarque : « Although ampicillin resistance predicts the test result for imipenem, this is not true for ampicillin susceptibility » ; « In E. faecalis, susceptibility to ampicillin, amoxicillin and piperacillin (with and without beta-lactamase inhibitor) can be inferred from ampicillin in 98% of isolates » ; mais « some of the isolates can be resistant to piperacillin despite being ampicillin susceptible, it is recommended to test the agent to be reported. »
- Règle 2 (grade B) : HNR gentamicine → avertissement de non-synergie « except for streptomycin » et test streptomycine ; sinon « report gentamicin as effective for synergy purposes ».
- Règle 5 (glycopeptides, grade B) : vancomycine R + téicoplanine S → avertissement (vanB) ; « IF vancomycin susceptible but vanA is detected by molecular methods THEN report resistant to vancomycin and teicoplanin » ; vanB détecté → vancomycine R + avertissement téicoplanine.
- Règle 6 : « Do not report clindamycin as susceptible in E. faecium ».

### S5 — EUCAST Expert Rules, Streptococcus spp. (hors pneumocoque), novembre 2025
- URL : https://www.eucast.org/fileadmin/eucast/pdf/expert_rules/Streptococcus_ExpertRules_20251109.pdf. Statut : **lu**.
- Règle 1 (β-hémolytiques A, B, C, G ; grade C) : « IF susceptible to benzylpenicillin, THEN report susceptible to aminopenicillins, cephalosporins and carbapenems. IF resistant to benzylpenicillin, THEN confirm species identification and determine and report according to the MIC of the relevant agent. » ; remarque : « No resistance to beta-lactams reported so far except in Group B streptococci (MIC of benzylpenicillin up to 1 mg/L). »
- Règle 2 (viridans) : dépistage pénicilline négatif → « report susceptible to any indicated beta-lactam agent » ; positif → tester individuellement ou rendre R ; « in case of resistance to benzylpenicillin the results of other drugs cannot be inferred ».
- Règle 4 (A, B, C, G) : norfloxacine négative → lévofloxacine « susceptible, increased exposure », moxifloxacine « susceptible ».
- Règle 5 (aminosides) : HNR gentamicine → « cautionary warning that combinations of a beta-lactam with gentamicin may not be synergistic » ; « NOTE: this rule applies to isolates from endocarditis only. » ; remarque : HNR décrite chez les viridans et le groupe B.

### S6 — EUCAST Expert Rules, Streptococcus pneumoniae, novembre 2025
- URL : https://www.eucast.org/fileadmin/eucast/pdf/expert_rules/Pneumococcus_ExpertRules_20251109.pdf. Statut : **lu**.
- Règle 1 (grade A) : oxacilline négative → « report beta-lactam agents with breakpoints for S. pneumoniae susceptible » ; positive → « refer to the flowchart in the Breakpoint Tables. »
- Règles 3-4 : FQ, même logique que les staphylocoques (lévofloxacine I si norfloxacine négative ; R lévo/moxi → R toutes FQ).

### S7 — EUCAST Expert Rules v3.3, Enterobacterales (juin 2024) — compléments
- URL : https://www.eucast.org/fileadmin/eucast/pdf/expert_rules/ExpertRules_V3.3_20240630_Enterobacterales.pdf. Statut : **lu**.
- Règles 1-2 (grade A) : *E. coli*, *P. mirabilis* : « IF resistant to ampicillin, THEN report resistant to piperacillin regardless of test result » ; « Report all Klebsiella spp. (except K. aerogenes) and Raoultella spp. as piperacillin resistant, regardless of test result ».
- Règle 5 : *Enterobacter* spp., *K. aerogenes*, *C. freundii*, *Serratia*, *M. morganii*, *H. alvei*, *Providencia* : céfuroxime S → rendre céfuroxime et autres C2G R.
- Règle 6 : « IF resistant to any 3rd generation (cefotaxime, ceftriaxone, ceftazidime) or 4th generation (cefepime) cephalosporin AND susceptible to piperacillin-tazobactam or amoxicillin-clavulanic acid, THEN report as tested. »
- **Déduction amoxicilline → amoxicilline-clavulanate : aucune règle trouvée** dans les règles v3.3 (lues en entier). La seule déduction lue est ampicilline → amoxicilline (S2 note B ; S1 p. 49 note 1/A).

### S8 — EUCAST, Expected Resistant Phenotypes v1.2 (janvier 2023)
- URL : https://www.eucast.org/fileadmin/eucast/pdf/expert_rules/Expected_Resistant_Phenotypes_v1.2_20230113.pdf. Statut : **lu (coordonnées)** — corrige le « non vérifié » de la fiche 1.8.
- Table 1 (p. 3-4), colonnes : ampicilline/amoxicilline, amoxicilline-clavulanate, ampicilline-sulbactam, ticarcilline, céfazoline/céfalotine, céfalexine/céfadroxil, céfoxitine, céfuroxime, tétracyclines, tigécycline, polymyxine/colistine, fosfomycine, nitrofurantoïne :
  - 1.3 *E. cloacae* complex : R ampicilline/amoxicilline, amoxicilline-clavulanate, ampicilline-sulbactam, céfazoline/céfalotine, céfoxitine.
  - 1.7 *K. pneumoniae* complex : R ampicilline/amoxicilline, ticarcilline.
  - 1.12 *P. mirabilis* : R tétracyclines, polymyxine/colistine, nitrofurantoïne (**pas** de R tigécycline dans v1.2, contrairement au CA-SFM).
  - Note 2 : « Clinical breakpoints for cefoxitin have not been defined. Enterobacterales species expected to be resistant to this antibiotic produce a chromosomal inducible AmpC β-lactamase (AmpC) ».
- Table 2 (p. 5), non fermentants ; en-tête : « also generally intrinsically resistant to benzylpenicillin, first- and second-generation cephalosporins, glycopeptides, lipoglycopeptides, fusidic acid, macrolides, lincosamides, streptogramins, rifampicin and oxazolidinones » ; 2.7 *P. aeruginosa* : R ampicilline/amoxicilline, amoxicilline-clavulanate, ampicilline-sulbactam, **céfotaxime/ceftriaxone**, **ertapénème**, chloramphénicol, triméthoprime (colonne « Trimethoprim », pas TMP-SMX), tétracyclines, tigécycline ; note 5 dans la colonne aminosides : « Pseudomonas aeruginosa is resistant to kanamycin and neomycin due to low level APH(3')-IIb activity. »
- Table 4 (p. 7), Gram + ; en-tête : « Gram-positive bacteria are expected to be resistant to aztreonam, temocillin, polymyxin B/colistin and nalidixic acid. » Colonnes : acide fusidique, ceftazidime, céphalosporines (sauf ceftazidime), aminosides, macrolides, clindamycine, quinupristine-dalfopristine, vancomycine, téicoplanine, fosfomycine, novobiocine, sulfamides :
  - 4.5 « Other coagulase-negative staphylococci and S. aureus » : R ceftazidime seulement.
  - 4.6 *Streptococcus* spp. : R acide fusidique, ceftazidime, aminosides (note 1).
  - 4.7 *E. faecalis* : R acide fusidique, ceftazidime, céphalosporines, aminosides (note 1), macrolides, clindamycine, quinupristine-dalfopristine, sulfamides.
  - 4.9 *E. faecium* : R acide fusidique, ceftazidime, céphalosporines, aminosides (notes 1, 2), macrolides, sulfamides (pas de R clindamycine dans la table).
  - Note 1 : « Low-level resistance (LLR) to aminoglycosides. Combinations of aminoglycosides with cell wall inhibitors [...] are synergistic and bactericidal against isolates that are susceptible to cell wall inhibitors and do not display high-level resistance to aminoglycosides ».
  - Note 2 : AAC(6')-I d'*E. faecium* responsable de la perte de synergie « (except gentamicin, amikacin and streptomycin) ».

### S9 — EUCAST, Expected Susceptible Phenotypes v1.1 (mars 2022)
- URL : https://www.eucast.org/fileadmin/eucast/pdf/expert_rules/Expected_Susceptible_Phenotypes_Tables_v1.1_20220325.pdf. Statut : **lu (coordonnées)**. Il n'existe pas de document « exceptional phenotypes » distinct : les « unusual phenotypes » sont dans ce document.
- Définition : « a resistant result should be viewed with suspicion [...] results should be confirmed with alternative methods. »
- Table 2 (p. 4) :
  - 2.1 *S. aureus* : « Resistant to vancomycin, teicoplanin, telavancin, dalbavancin, oritavancin, daptomycin, linezolid, tedizolid, quinupristin-dalfopristin, tigecycline, eravacycline or omadacycline ».
  - 2.2 SCN : idem sans téicoplanine (vancomycine, daptomycine, linézolide avec réserve note 1).
  - 2.4 *S. pneumoniae* : « Resistant to carbapenems, vancomycin, teicoplanin [...] daptomycin, linezolid [...] or rifampicin. »
  - 2.5 Streptocoques A, B, C, G : « Resistant to penicillin, cephalosporins, vancomycin, teicoplanin [...] daptomycin, linezolid [...] ».
  - 2.6 *Enterococcus* spp. : « Resistant to daptomycin, linezolid, tigecycline, eravacycline or omadacycline » et « Resistant to teicoplanin but not vancomycin ».
  - 2.7 *E. faecalis* : « Resistant to ampicillin ».
- Table 1 (p. 3) : 1.1 Enterobacterales (sauf Morganellaceae et *S. marcescens*) et 1.3 *P. aeruginosa* : « Resistant to colistin » (sauf pays où ce n'est pas rare).
- Aucun phénotype inhabituel listé pour les streptocoques viridans.

### S10 — EUCAST, « Guidelines for detection of resistance mechanisms and specific resistances of clinical and/or epidemiological importance », Version 2.01, juillet 2017
- URL : https://www.eucast.org/fileadmin/eucast/pdf/eucast_guidelines/EUCAST_detection_of_resistance_mechanisms_170711.pdf (lien lu sur https://www.eucast.org/bacteria/important-additional-information/resistance-detection/). Statut : **lu** ; vigueur : toujours listé par EUCAST au 2026-11-05 ; seuils carbapénèmes cohérents avec v16.1.
- Carbapénémases (p. 4-5) : « Decreased susceptibility to carbapenems in Enterobacteriaceae may, however, also be caused by either extended spectrum β-lactamases (ESBL) or AmpC enzymes combined with decreased permeability ». Table 1 : seuil de dépistage méropénème > 0,125 mg/L (< 28 mm), ertapénème > 0,125 mg/L (< 25 mm) ; note 3 (ertapénème) : « High sensitivity but low specificity [...] isolates with ESBL and AmpC may be resistant without having carbapenemases. » ; note 2 : 25-27 mm à investiguer seulement si résistance à pipéracilline-tazobactam et/ou témocilline.
- Fig. 1 : « High-level temocillin resistance (>128 mg/L, zone diameter <11 mm) is a phenotypic marker of OXA-48 » ; p. 5 : « this marker is not specific for OXA-48-type carbapenemases ».
- OXA-48 (p. 5) : « with some enzymes (e.g. OXA-48-like) the organisms may be fully susceptible to cephalosporins. »
- BLSE, définition (p. 13) : enzymes qui hydrolysent « oxyimino-β-lactam compounds (cefuroxime, third- and fourth-generation cephalosporins and aztreonam) but neither cephamycins nor carbapenems ».
- Groupes (p. 14) : groupe 1 « E. coli, Klebsiella spp., P. mirabilis, Salmonella spp., Shigella spp. » ; groupe 2 « Enterobacteriaceae with inducible chromosomal AmpC: Enterobacter spp., Citrobacter freundii, Morganella morganii, Providencia stuartii, Serratia spp., Hafnia alvei » → confirmation BLSE avec céfépime ± clavulanate.
- AmpC (p. 21-22) : « The derepression or hyperproduction of natural AmpCs [...] confers high-level resistance to cephalosporins and to penicillin-β-lactamase inhibitor combinations. » ; critère : « A cefoxitin MIC >8 mg/L (zone size <19 mm) combined with phenotypic resistance to ceftazidime and/or cefotaxime » ; « susceptibility to cefepime together with resistance to cefotaxime and/or ceftazidime is another phenotypic indicator of AmpC, although less specific. »
- GISA (p. 33) : « VRSA [...] (MIC >8 mg/L) » ; « VISA [...] (MIC 4 - 8 mg/L) » ; « The MIC should always be determined when using vancomycin to treat a patient with severe S. aureus infection. »

### S11 — ESCMID 2022, Paul M et al., « ESCMID guidelines for the treatment of infections caused by multidrug-resistant Gram-negative bacilli (endorsed by ESICM) », Clin Microbiol Infect 2022;28:521-547 (DOI 10.1016/j.cmi.2021.11.025, PMID 34923128)
- URL éditeur (lien « Open access publication » de la page ESCMID https://www.escmid.org/guidelines-journals/guidelines/published-guidelines/) : https://www.clinicalmicrobiologyandinfection.com/article/S1198-743X(21)00679-0/fulltext → **HTTP 403** (blocage anti-robot ; non contourné). Europe PMC : service indisponible (503).
- Statut d'accès : **résumé seulement lu** (PubMed E-utilities). Vigueur : en vigueur (aucune mise à jour trouvée sur la page ESCMID).
- Extraits du résumé : « These ESCMID guidelines address the targeted antibiotic treatment of third-generation cephalosporin-resistant Enterobacterales (3GCephRE) and carbapenem-resistant Gram-negative bacteria » ; « Most recommendations are based on very-low- and low-certainty evidence. A high value was placed on antibiotic stewardship considerations [...] searching for carbapenem-sparing options for 3GCephRE ».
- **Recommandations détaillées (carbapénème pour infection grave, pipéracilline-tazobactam, alternatives pour IU non graves, forces/niveaux de preuve, AmpC/céfépime) : non vérifiées** (texte intégral non lu). Ma connaissance antérieure, à confirmer : carbapénème (imipénème/méropénème) pour bactériémie/infection grave à 3GCephRE (forte, certitude modérée) ; ertapénème possible sans choc ; BL/BLI, quinolones, cotrimoxazole, aminosides pour infections non graves/IU selon sensibilité (conditionnelles) — **NON VÉRIFIÉ**. Les AmpC ne me semblent pas traitées spécifiquement par ce texte — **NON VÉRIFIÉ**.

### S12 — IDSA 2026, « IDSA 2026 Guidance on the Treatment of Antimicrobial Resistant Gram-Negative Infections », Version 4.0 (Tamma PD et al.)
- URL : https://www.idsociety.org/practice-guideline/amr-guidance/ (datePublished 2026-07-30 ; « current as of March 1, 2026 »). Statut : **lu** (page HTML). Source de **substitution** pour la question AmpC/céfépime (non demandée nommément). Contexte américain, seuils CLSI, pas de GRADE (« GRADE methodology [...] is not employed »).
- ESBL : « E. coli, K. pneumoniae, or K. oxytoca isolates resistant to ceftriaxone (i.e., ceftriaxone minimum inhibitory concentrations [MICs] ≥4 µg/mL) is a threshold commonly acknowledged as a surrogate for ESBL-production ».
- ESBL hors voie urinaire : « Ertapenem, imipenem, and meropenem are preferred agents for the treatment of ESBL-E infections outside of the urinary tract. Imipenem or meropenem are preferred for patients who are critically ill or those with hypoalbuminemia. »
- Pipéracilline-tazobactam : alternative pour cUTI sans bactériémie ni gravité ; « not suggested for the treatment of ESBL-E infections at sites outside of the urinary tract, even when in vitro susceptibility [...] is demonstrated. »
- Céfépime et ESBL : « The panel suggests avoiding cefepime for the treatment of cUTI or infections outside of the urinary tract caused by ESBL-E, even if susceptibility to cefepime is demonstrated. »
- AmpC : « Enterobacter cloacae complex, Klebsiella aerogenes, and Citrobacter freundii are the most frequently encountered Enterobacterales at moderate risk for clinically significant inducible ampC » (+ *H. alvei*) ; « Cefepime is suggested for the treatment of infections caused by organisms at moderate risk of significant AmpC production [...] if cefepime MICs are in the susceptible or susceptible dose-dependent range (i.e., ≤8 µg/mL). » ; ceftriaxone et pipéracilline-tazobactam non suggérés pour les infections invasives à ces espèces.
- OXA-48 : « Ceftazidime-avibactam is the preferred treatment option for OXA-48-E infections. »
- *P. aeruginosa* : si sensible aux β-lactamines classiques et aux carbapénèmes, « the former are preferred over carbapenem therapy ».

### S13 — ESC 2023, « 2023 ESC Guidelines for the management of endocarditis » (Delgado V et al., Eur Heart J 2023;44:3948-4042)
- URL : https://academic.oup.com/eurheartj/article/44/39/3948/7243107 → **HTTP 403** (page de vérification « Just a moment… », non contournée) ; page ESC escardio.org : 404.
- Statut : **non lu**. Seuils de CMI de pénicilline (≤ 0,125 ; 0,25-2 ; > 2 mg/L) et texte sur les entérocoques HNR : **NON VÉRIFIÉS dans l'ESC**. Substituts lus : S14 (SPILF/AEPEI d'après l'ESC 2023) et S2 (EUCAST viridans « endocarditis »).

### S14 — SPILF/AEPEI, « Antibiothérapie curative et antibioprophylaxie de l'endocardite infectieuse — Prise de position SPILF/AEPEI d'après l'analyse de la recommandation ESC 2023 », diaporama du comité des référentiels du 12/11/2025
- URL : https://www.infectiologie.com/UserFiles/File/spilf/recos/spilf-groupe-recos-endocardite-atb-2025.pptx (lien lu sur https://www.infectiologie.com/fr/recommandations.html). Article associé (Infectious Diseases Now 2024, https://www.sciencedirect.com/science/article/pii/S2666991924001787) : **403**, non lu.
- Statut : **lu** (texte des diapositives ; arbre décisionnel de la diapositive 9 reconstruit par la position des formes). Vigueur : position française en vigueur.
- Diapositive 8 : « Les choix thérapeutiques sont basés sur les résultats des CMI de l'amoxicilline et des C3G » ; durée 4 semaines (valve native), 6 semaines (prothèse) ; gentamicine si indiquée 15 j.
- Diapositive 9 (EI à streptocoque, sans allergie) : CMI amoxicilline ≤ 0,5 mg/L → amoxicilline 100 mg/kg/j (alternative ceftriaxone 2 g/j si CMI C3G ≤ 0,5) ; 0,5 < CMI amoxicilline ≤ 2 → ceftriaxone 2 g/j si CMI C3G ≤ 0,5, sinon amoxicilline 200 mg/kg/j + gentamicine 3 mg/kg/j ; CMI amoxicilline > 2 → ceftriaxone 2 g/j si CMI C3G ≤ 0,5, sinon vancomycine 30 mg/kg/j.
- Diapositive 10 (entérocoques) : *E. faecalis* : amoxicilline + ceftriaxone 6 sem. ; allergie : daptomycine ± ceftaroline, ou vancomycine + gentamicine ; « Enterococcus faecium sans haut niveau de résistance aux aminosides — Quelle que soit la sensibilité à l'amoxicilline — Vancomycine + gentamicine 6S/2S ». (Le seuil de CMI de daptomycine de la note « * Si CMI [?] 2 mg/l » a un caractère illisible : non vérifié.)
- Diapositives 13 et 15 (staphylocoques) : SAMS valve native : céfazoline ou (cl)oxacilline ; SARM : daptomycine + ceftaroline ou fosfomycine ; valve prothétique : association avec **rifampicine** et **gentamicine** (schéma graphique ; la condition de sensibilité n'est pas écrite sur la diapositive).

### S15 — IDSA/ESCMID 2026, « Consensus Statements on Staphylococcus aureus Bacteremia », Executive Summary (version 2026-09-01)
- URL : https://www.idsociety.org/globalassets/idsa/practice-guidelines/sab/executive-summary_20260901.pdf (et page https://www.idsociety.org/practice-guideline/staphylococcus-aureus-bacteremia/). Statut : **lu**.
- Portée : « Future manuscripts will address the management of MRSA and methicillin-susceptible S. aureus (MSSA) bacteremia. » → **aucune** recommandation de la partie 1 (7 consensus statements) sur le choix d'antibiotique selon SAMS/SARM, la PCR mecA/PLP2a, la CMI de vancomycine, la rifampicine ou la gentamicine (recherche des termes « rapid », « mecA », « PCR », « PBP2a », « vancomycin », « rifampin », « gentamicin » : aucune occurrence pertinente).

### S16 — IDSA 2011, Liu C et al., « Clinical Practice Guidelines by the IDSA for the Treatment of MRSA Infections in Adults and Children », Clin Infect Dis 2011;52:e18-e55 (DOI 10.1093/cid/ciq146)
- URL : https://www.idsociety.org/practice-guideline/mrsa/ — page lue : mention « **ARCHIVED** ». Texte intégral sur OUP (bloqué) : **non lu**.
- Recommandation « CMI de vancomycine > 2 mg/L → alternative à la vancomycine » : **NON VÉRIFIÉE** dans la source (connaissance antérieure). Les éléments lus équivalents sont EUCAST v16.1 (CMI 2 mg/L limite, réponse possiblement altérée) et CA-SFM p. 76 (échecs à CMI 2 mg/L).

### S17 — SPILF 2009, « Infections ostéo-articulaires sur matériel (prothèse, implant, ostéosynthèse) — Texte court », Version V6 définitive du 13 mai 2009
- URL : https://www.infectiologie.com/UserFiles/File/spilf/recos/inf-osseuse-court.pdf. Statut : **lu** (extraits rifampicine). Vigueur : ancienne (2009), toujours listée par la SPILF ; actualisation non recherchée.
- « en cas d'infection staphylococcique, ne jamais utiliser la rifampicine, l'acide fusidique, les fluoroquinolones et la fosfomycine en monothérapie » ;
- « En cas d'infection à staphylocoque, cette association sera prolongée au moins 6 semaines (en privilégiant la rifampicine dans le schéma associatif si la bactérie y est sensible et à condition de ne jamais utiliser cette molécule en monothérapie) (grade B). »

---

## 2. Par famille de germes — ce qu'il faut demander au prescripteur

Colonnes : **question** (à poser à l'utilisateur de l'application) → **pourquoi elle change la décision** → **libellé probable sur le compte rendu** → **source + repère** → **confiance** (élevée = lu et cohérent CA-SFM/EUCAST ; moyenne = lu mais divergence ou lecture par coordonnées ; faible = non vérifié).

### 2.1 Enterobacterales (E. coli, K. pneumoniae, E. cloacae, P. mirabilis, entérobactérie non identifiée)

| Question | Pourquoi | Libellé probable | Source + repère | Confiance |
|---|---|---|---|---|
| Infection urinaire (cystite / IU sans signe de gravité) ou autre site ? | Concentrations critiques différentes : témocilline (8/16 IU sans gravité vs 0,001/16 autres infections), TMP-SMX (2/2 vs 0,5/0,5), amoxicilline-clavulanate cystite 32/32, céfixime « cystites ou relais pour pyélonéphrites » | « Sensible à forte posologie » + commentaire cystite | S1 p. 49, 51, 55 ; S1 Annexe 7 Tableau 2 note 2 | élevée (CA-SFM) |
| Le résultat aminoside est-il « en association » ? | Aminoside seul déconseillé en infection systémique ; rendu « sensible » simple si IU | « Sensible à posologie standard en association » | S1 p. 54 + Annexe 7 Tableau 1 ; S2 Enterobacterales l. 95-98 (valeurs entre parenthèses) | élevée |
| Le compte rendu mentionne-t-il une BLSE ? | C3G, C4G, aztréonam lus « R » même si S/SFP ; BL/BLI : CMI à demander hors IU | « Résistant » (C3G/C4G/aztréonam) ; « BLSE » (libellé non normé par le CA-SFM) | S1 p. 49-51 (notes 2, 6) | élevée |
| Céphalosporinase hyperproduite (ou C3G SFP/R sans synergie) ? | C3G, aztréonam, pipéracilline(-tazobactam) lus « R » ; céfépime reste possible | « Résistant » ; « céphalosporinase hyperproduite / déréprimée » (non normé) | S1 p. 50, 51 note 6 ; S10 p. 21-22 | élevée |
| Espèce du groupe 3 (E. cloacae, K. aerogenes, C. freundii…) ? | Risque de sélection de mutants sous C3G ou pipéracilline-tazobactam même si S → céfépime préféré | Commentaire : « l'utilisation en monothérapie de la pipéracilline-tazobactam ou des céphalosporines de 3e génération [...] est déconseillée » | S1 p. 50 ; S7 règle 3 ; S12 (céfépime CMI ≤ 8) | élevée |
| Carbapénémase identifiée ? De quel type (OXA-48, KPC, NDM/VIM) ? | CA-SFM 2026 : ertapénème/imipénème/méropénème rendus « R » ; OXA-48 : céfotaxime/ceftriaxone « R » mais ceftazidime, céfépime, aztréonam rendus bruts ; type → choix des nouvelles molécules (hors base) | « Résistant » ; « EPC » / « carbapénémase de type OXA-48 » (non normé) | S1 p. 50, 52, avant-propos p. 5 ; S2 note carbapénèmes ; S12 | élevée |
| Ertapénème SFP/R ou E. coli ertapénème CMI ≥ 0,25 ? | Suspicion de carbapénémase → test de confirmation ; mais ESBL/AmpC + imperméabilité peuvent donner le même phénotype | (pas de libellé normé ; commentaire possible) | S1 Annexe 6 p. 158 ; S10 p. 4-5 | élevée |
| Céfoxitine R ? | Évoque AmpC (chromosomique hyperproduite ou plasmidique) ; peu spécifique (porines) ; usage thérapeutique validé seulement pour E. coli | « Résistant » (E. coli) | S1 p. 51 note 8 ; S2 l. 47 note 5 ; S10 p. 22 | élevée |
| Ciprofloxacine R ? Dépistage acide nalidixique positif ? | R cipro → R toutes FQ ; dépistage positif avec FQ S → commentaire de risque de sélection | « Résistant » ; commentaire « bas niveau de résistance aux fluoroquinolones » | S1 p. 53 ; S7 règle 8 | élevée |
| Méningite ? | Concentrations critiques méningées (céfotaxime 1/1, méropénème 2/2, cipro : CMI) | — | S1 p. 51-53 | élevée |
| P. mirabilis / Morganellaceae et imipénème ? | Sauvage = SFP (bas niveau naturel) → forte posologie | « Sensible à forte posologie » | S1 p. 35 note 5, p. 52 ; S2 l. 66 | élevée |
| Amikacine S, gentamicine S, tobramycine R ? | Phénotype improbable → amikacine lue « R » | « Résistant » (amikacine) | S1 p. 54 | élevée |
| Entérobactérie non identifiée à l'espèce ? | Les restrictions d'espèce (témocilline autres infections, céfoxitine, céfazoline urinaire) ne s'appliquent pas ; résistances naturelles inconnues | — | S1 p. 49, 51 ; S2 l. 26, 40 | moyenne (déduction) |

### 2.2 Pseudomonas aeruginosa

| Question | Pourquoi | Libellé probable | Source + repère | Confiance |
|---|---|---|---|---|
| Les β-lactamines anti-pyocyaniques sont-elles « SFP » ? | Souche sauvage = SFP (S ≤ 0,001) pour pipéracilline(-tazobactam), ceftazidime, céfépime, aztréonam, imipénème, cipro (et lévo) → forte posologie obligatoire ; « S » n'existe pas | « Sensible à forte posologie » | S2 Pseudomonas l. 15-73 ; S1 p. 59-61 ; Note 13 v16.1 | élevée |
| Le méropénème est-il absent du compte rendu ? | CA-SFM : masqué si une β-lactamine plus étroite est SFP | (non rendu) | S1 p. 61 | élevée |
| Résistance isolée aux carbapénèmes ? | Imperméabilité (OprD), non croisée → autres β-lactamines utilisables | — | S1 p. 61 | élevée |
| Imipénème R + ceftolozane-tazobactam R ? | Évoque une carbapénémase | — | S1 p. 60 note 6 ; p. 61 note 2 | élevée |
| Aminoside : lequel est rendu ? | Gentamicine sans concentration critique (EUCAST IE ; absente CA-SFM) → amikacine ou tobramycine, en association en infection systémique | « Sensible à posologie standard en association » | S2 l. 82-88 ; S1 p. 62 + Annexe 7 | élevée |
| Lévofloxacine rendue ? | Activité inférieure à la cipro ; R > 0,5 (CA-SFM) vs R > 2 (EUCAST) | « Sensible à forte posologie » | S1 p. 61 ; S2 l. 73 | moyenne (divergence) |

### 2.3 Staphylococcus aureus, SCN (S. epidermidis), S. lugdunensis

| Question | Pourquoi | Libellé probable | Source + repère | Confiance |
|---|---|---|---|---|
| Méticilline : céfoxitine (ou PCR mecA/PLP2a) positive ? | SARM → R toutes β-lactamines sauf ceftaroline/ceftobiprole ; SAMS → céfazoline/cloxacilline | « Méticillino-résistant » / « résistant à l'oxacilline » (libellé exact non normé) | S1 p. 73-74 ; S3 règle 1 ; S2 l. 42-43 | élevée |
| Espèce : S. epidermidis ou S. lugdunensis ? | Seuil céfoxitine 27 mm (vs 22 mm S. aureus) ; S. lugdunensis : pénicilline G et céfoxitine interprétées comme S. aureus | — | S1 p. 73-74 ; S2 l. 11, 43 | élevée |
| Pénicilline G rendue « S » ? | Seulement si diamètre ≥ 26 mm ET bordure floue (S. aureus) ; CMI ≤ 0,125 n'exclut pas la pénicillinase ; pas de méthode fiable pour la plupart des SCN | « Sensible » / « Résistant » | S1 p. 73, 79 (changement 2026) ; S2 l. 10 notes 1/A, B, 2/C ; S3 règle 2 | élevée |
| Céfazoline rendue sans test ? | SAMS → céfazoline S sans test complémentaire ; C3G seulement SFP, dernier recours, relais | « Sensible » (céfazoline) ; « Sensible à forte posologie » (céfotaxime/ceftriaxone) | S1 p. 74 ; S2 l. 33 note 1/A | élevée |
| CMI de vancomycine (microdilution) ? | CMI 2 mg/L : échecs rapportés / réponse possiblement altérée ; > 2 : rare, confirmer et envoyer | Valeur de CMI | S1 p. 76 note 4 ; S2 glycopeptides note 1 ; S10 p. 33 | élevée (sens) / faible pour le seuil IDSA 2011 |
| Rifampicine et gentamicine sensibles (infection sur matériel, EI prothétique) ? | Rifampicine à privilégier dans l'association « si la bactérie y est sensible » ; jamais en monothérapie ; gentamicine R → R tous aminosides | « Sensible à posologie standard en association » | S17 ; S1 p. 75, 78 + Annexe 7 ; S14 diapo 15 | élevée |
| Fluoroquinolones : dépistage norfloxacine ? | Négatif → lévofloxacine SFP, cipro « SFP en association » ; R lévo → R toutes FQ | « Sensible à forte posologie en association » (cipro) | S1 p. 75 ; S2 l. 76-81 ; S3 règles 5-6 | élevée |
| Daptomycine : CMI rendue ? Site pulmonaire ? | CMI obligatoire ; R exceptionnelle ; inactive en pneumonie | Valeur de CMI | S1 p. 78 note 2 ; S2 l. 140 | élevée |
| Test rapide (PCR mecA / PLP2a sur flacon) disponible ? | Détermine SAMS/SARM avant l'antibiogramme ; place dans les recommandations SAB 2026 : **non traitée** (partie 1) | — | S15 (portée) ; S1 p. 73 (mec additionnel = SARM) | faible (pas de recommandation lue) |

### 2.4 Enterococcus faecalis, E. faecium

| Question | Pourquoi | Libellé probable | Source + repère | Confiance |
|---|---|---|---|---|
| Espèce : faecalis ou faecium ? | Amoxicilline R exceptionnelle chez faecalis, fréquente chez faecium ; synergie aminoside abolie chez faecium sauf gentamicine | — | S1 p. 37, 80 ; S8 Table 4 note 2 | élevée |
| Amoxicilline S ou R ? | R → R pipéracilline(-tazobactam) et carbapénèmes ; S (faecalis) → amoxicilline, mais pipéracilline/imipénème à tester | « Sensible » / « Résistant » | S1 p. 80 ; S4 règle 1 ; S2 Enterococcus | élevée |
| Haut niveau de résistance à la gentamicine ? | HNR → pas de synergie β-lactamine/glycopeptide + aminoside (croisée amikacine, tobramycine) | « Absence de résistance à haut niveau » / « Résistant à haut niveau » | S1 p. 81 + Annexe 7 ; S2 note 2/A ; S4 règle 2 | élevée |
| Vancomycine/téicoplanine ; vanA/vanB ? | ERV (vanA : R vanco + téico ; vanB : vanco R, téico S avec risque) ; pas de « S » avant 24 h | « Résistant » ; commentaire téicoplanine | S1 p. 82 ; S4 règle 5 | élevée |
| Céphalosporine rendue ? | Résistance naturelle à toutes les C (sauf ceftobiprole/E. faecalis) ; ceftriaxone seulement en association avec amoxicilline (EI à E. faecalis) | « Résistant » | S1 p. 37, 80 ; S8 ; S14 diapo 10 | élevée |
| Cotrimoxazole rendu ? | Activité incertaine ; antibiogramme non prédictif | « Absence de résistance » + commentaire « efficacité clinique [...] incertaine » | S1 p. 84 note 5/E + Annexe 7 note 4 ; S2 note 4/C | élevée |
| Daptomycine ? | EUCAST : IE (pas de concentration critique) ; R rare | — | S2 l. 131 ; S1 p. 84 | moyenne |

### 2.5 Streptococcus pyogenes, S. agalactiae, streptocoques C/G

| Question | Pourquoi | Libellé probable | Source + repère | Confiance |
|---|---|---|---|---|
| Pénicilline G S ? | Amoxicilline, pipéracilline, céphalosporines, carbapénèmes déduits | « Sensible » | S1 p. 91 ; S2 note 1/A ; S5 règle 1 | élevée |
| Pénicilline G R ou diamètre < 23 mm ? | Exceptionnel : vérifier identification + CMI, laboratoire référent ; GBS jusqu'à 1 mg/L décrit | — | S1 p. 91 note 1, A ; S5 règle 1 ; S9 2.5 | élevée |
| Endocardite : HNR gentamicine recherchée ? | HNR → pas de synergie (règle limitée à l'endocardite) | « Absence de résistance à haut niveau » | S1 p. 92 ; S5 règle 5 | élevée |
| Lévofloxacine | Sauvage = I ; dépistage norfloxacine | « Sensible à forte posologie » | S1 p. 91 ; S2 ; S5 règle 4 | élevée |

### 2.6 Streptococcus pneumoniae

| Question | Pourquoi | Libellé probable | Source + repère | Confiance |
|---|---|---|---|---|
| Dépistage oxacilline ≥ 20 mm (ou péni G ≤ 0,06) ? | Négatif → toutes β-lactamines S ; positif → CMI d'amoxicilline/céfotaxime/ceftriaxone | — | S1 p. 86 ; S2 note 1/B ; S6 règle 1 | élevée |
| Méningite ou endocardite ? | Seuils bas : péni G 0,06 ; amoxicilline 0,5 (CA-SFM) vs 0,06 (EUCAST) ; céfotaxime/ceftriaxone 0,5 ; méropénème 0,25 (CMI obligatoire) | Valeurs de CMI | S1 p. 86-87 ; S2 l. 9-14, 42, 52, 64 | moyenne (divergence amoxicilline) |
| Gentamicine | « pas d'utilité de tester la gentamicine » | — | S1 Annexe 7 Tableau 1 | élevée |

### 2.7 Streptocoques oraux (viridans), S. gallolyticus (groupe S. bovis)

| Question | Pourquoi | Libellé probable | Source + repère | Confiance |
|---|---|---|---|---|
| Endocardite ? CMI d'amoxicilline et de C3G disponibles ? | Le schéma SPILF dépend de la CMI d'amoxicilline (≤ 0,5 ; 0,5-2 ; > 2) et de C3G (≤ 0,5) | Valeurs de CMI | S14 diapo 9 ; S1 p. 96 note 1/A ; S2 viridans l. 12-18 | élevée (SPILF) ; ESC non lu |
| Dépistage pénicilline G (≤ 0,25 mg/L / ≥ 21 mm) ? | Négatif → β-lactamines S ; positif → tester individuellement (pas de déduction) | — | S1 p. 96 ; S2 note 1/A ; S5 règle 2 | élevée |
| HNR gentamicine (endocardite) ? | Synergie conditionnelle (amoxicilline 200 mg/kg/j + gentamicine si amox 0,5-2 et C3G > 0,5) | « Absence de résistance à haut niveau » | S1 p. 97 ; S2 viridans l. 86 ; S5 règle 5 ; S14 | élevée |
| Fluoroquinolone ou cotrimoxazole rendus ? | EUCAST : lévofloxacine IE, ciprofloxacine et TMP-SMX « - » | — | S2 viridans l. 74-140 | élevée (EUCAST) |

---

## 3. Résistances attendues vérifiées (molécules de la base)

Lecture : « R » = attendu résistant (ne pas utiliser, rendre R). Sources : ERP = S8 (EUCAST v1.2, lu par coordonnées) ; CA = S1 ch. 2 (lu par coordonnées) ; « - » = tiret dans la table EUCAST v16.1 (S2), qui signifie « report resistant without prior testing ». Les molécules non citées ne sont pas attendues résistantes d'après ces sources.

| Espèce | Molécules de la base attendues R | Source(s) | Confiance |
|---|---|---|---|
| Toutes Enterobacterales (dont E. coli, entérobactérie non identifiée) | vancomycine, rifampicine | ERP Table 1 en-tête ; CA p. 34 ; « - » S2 | élevée |
| Toutes Enterobacterales | cloxacilline, daptomycine | CA p. 34 (« oxacilline », « daptomycine ») ; « - » S2 l. 29, 142 ; **absentes** de l'en-tête ERP | élevée (CA + tiret EUCAST) |
| K. pneumoniae | + amoxicilline | ERP 1.7 ; CA p. 34 | élevée |
| E. cloacae complex | + amoxicilline, amoxicilline-clavulanate, céfazoline, céfoxitine | ERP 1.3 ; CA p. 34 | élevée |
| P. mirabilis | aucune molécule de la base en plus (R tétracyclines, colistine, nitrofurantoïne ; CA ajoute tigécycline) ; imipénème « r » : sauvage = SFP | ERP 1.12 ; CA p. 34-35 note 5 | élevée |
| P. aeruginosa | amoxicilline, amoxicilline-clavulanate, céfotaxime, ceftriaxone, ertapénème | ERP 2.7 ; CA p. 36 ; « - » S2 | élevée |
| P. aeruginosa | céfazoline, céfoxitine (C1G/C2G) | ERP Table 2 en-tête ; CA p. 36 ; « - » S2 l. 32, 38 | élevée (céfoxitine classée C2G : déduction appuyée par le tiret) |
| P. aeruginosa | cotrimoxazole | CA p. 36 (colonne TMP-SMX) ; « - » S2 l. 140 ; ERP liste seulement le triméthoprime | élevée |
| P. aeruginosa | vancomycine, daptomycine, cloxacilline | ERP en-tête (glycopeptides) ; CA p. 36 ; « - » S2 | élevée |
| P. aeruginosa | rifampicine | ERP en-tête ; « - » S2 l. 137 ; **absente** de la liste CA p. 36 | moyenne (divergence de liste, même conclusion pratique) |
| P. aeruginosa | témocilline, céfixime | « - » S2 l. 18, 36 seulement | moyenne |
| P. aeruginosa | **pas** amikacine/gentamicine : le « R » aminosides vise kanamycine/néomycine (gentamicine = IE EUCAST) | ERP note 5 ; CA p. 36 note 3 | élevée |
| S. aureus, SCN, S. lugdunensis | aztréonam, témocilline | ERP Table 4 en-tête ; CA p. 37 ; « - » S2 | élevée |
| S. aureus, SCN | céfixime (ne pas utiliser) | « - » S2 l. 40 ; CA p. 74 (« ne doivent pas être utilisés ») | élevée |
| Streptocoques (pneumocoque, A/B/C/G, viridans, gallolyticus) | aztréonam, témocilline | ERP Table 4 ; CA p. 37 ; « - » S2 | élevée |
| Streptocoques | amikacine, gentamicine en monothérapie (bas niveau ; synergie conservée sans HNR) | ERP 4.6 note 1 ; CA p. 37 « r », p. 92, 97 | élevée |
| Streptocoques | ciprofloxacine (non utilisable) ; céfixime | « - » S2 (A/B/C/G, pneumocoque, viridans) | élevée (EUCAST) |
| Viridans / gallolyticus | cotrimoxazole « - » | S2 viridans l. 140 | élevée (EUCAST seul) |
| E. faecalis | céfazoline, céfoxitine, céfotaxime, ceftriaxone, céfépime, céfixime ; amikacine/gentamicine (bas niveau) ; cloxacilline | ERP 4.7 ; CA p. 37 ; « - » S2 | élevée |
| E. faecium | idem (+ perte de synergie sauf gentamicine) | ERP 4.9 notes 1-2 ; CA p. 37 note 2 | élevée |
| E. faecalis, E. faecium | ertapénème | CA p. 37 ; « - » S2 l. 58 ; **absent** ERP | élevée (CA + tiret) |
| E. faecalis, E. faecium | méropénème, aztréonam, témocilline, rifampicine | « - » S2 l. 61, 67, 22, 140 ; ERP (aztréonam, témocilline) | élevée pour aztréonam/témocilline ; moyenne pour méropénème/rifampicine (EUCAST seul) |
| E. faecalis, E. faecium | cotrimoxazole : **non R attendu** mais activité incertaine (sulfamides R naturels) | ERP/CA « sulfamides » ; S2 note 4/C ; CA p. 84 | élevée |

---

## 4. Résultats exceptionnels ou contradictoires (à faire vérifier par le laboratoire)

1. **S. aureus ou SCN résistant à la vancomycine, à la daptomycine** (ou téicoplanine pour S. aureus) — phénotype inhabituel : confirmer, laboratoire référent. S9 2.1-2.2 ; S2 Staphylococcus notes 1-2 glycopeptides et daptomycine ; S1 p. 76 note 4, p. 78 note 2.
2. **S. aureus vancomycine CMI = 2 mg/L** — non exceptionnel mais limite : « impaired clinical response » possible. S2 note 1 ; S1 p. 76 note 4.
3. **Streptocoque A, B, C, G résistant à la pénicilline / aux céphalosporines** — exceptionnel ; vérifier l'identification, CMI. S9 2.5 ; S1 p. 91 note 1 ; S5 règle 1 (GBS jusqu'à 1 mg/L décrit) ; S2 note 2.
4. **S. pneumoniae résistant aux carbapénèmes, à la vancomycine ou à la rifampicine** — inhabituel. S9 2.4.
5. **E. faecalis résistant à l'ampicilline/amoxicilline** — inhabituel ; confirmer par CMI. S9 2.7 ; S2 Enterococcus note A ; S1 p. 80 note 1/A.
6. **Entérocoque résistant à la daptomycine** (ou linézolide) — inhabituel. S9 2.6 ; S1 p. 84 note 2.
7. **Entérocoque téicoplanine R / vancomycine S** — « impossible » (CA-SFM). S1 p. 82 ; S9 2.6.
8. **Entérocoque vancomycine S mais vanA/vanB détecté** — rendre R. S4 règle 5.
9. **Espèce attendue résistante rendue S** (ex. K. pneumoniae amoxicilline S, E. cloacae céfoxitine S, P. aeruginosa ertapénème S) — résultat suspect ; rendre R. S8 p. 2 ; S1 p. 34.
10. **Discordance oxacilline R / céfoxitine négative** (staphylocoque, automate) — vérifier disque céfoxitine ou mecA/C/PLP2a. S1 p. 73 note 4.
11. **S. aureus pénicilline G CMI ≤ 0,125 mais bordure nette ou diamètre < 26 mm** — pénicillinase : rendre R. S1 p. 73, 79 ; S2 note B.
12. **Ceftaroline SFP/R ou ceftobiprole R** chez staphylocoque — rare, vérifier. S1 p. 74 note 2.
13. **Enterobacterales : tobramycine R isolée** (amikacine S, gentamicine S) — improbable, amikacine lue R. S1 p. 54.
14. **Enterobacterales : C3G R mais pipéracilline-tazobactam ou amoxicilline-clavulanate S** — phénotype BLSE habituel ; EUCAST : rendre tel quel ; CA-SFM : CMI de l'association si infection non urinaire. S7 règle 6 ; S1 p. 49.
15. **EPC apparemment S aux carbapénèmes** — CA-SFM 2026 : rendre R ; EUCAST : catégoriser tel quel mais préférer d'autres molécules. S1 p. 52 ; S2 note 1 carbapénèmes.
16. **OXA-48 apparemment S aux C3G** — CA-SFM : céfotaxime/ceftriaxone lus R. S1 p. 50 ; S10 p. 5.
17. **Enterobacterales groupe 3 S aux C3G / pipéracilline-tazobactam** — commentaire obligatoire (monothérapie déconseillée). S1 p. 50 ; S7 règle 3.
18. **E. faecalis amoxicilline S mais pipéracilline ou imipénème R** — possible ; tester la molécule rendue. S1 p. 80 note 2/B ; S4 règle 1.
19. **P. aeruginosa : carbapénème R isolé** — imperméabilité, non croisée ; **imipénème R + ceftolozane-tazobactam R** — suspicion de carbapénémase. S1 p. 60-61.
20. **Staphylocoque / streptocoque : dépistage norfloxacine positif et lévofloxacine SFP** — rendre avec avertissement de sélection de mutants. S1 p. 75, 91 ; S3 règle 6.
21. **Résultat en ZIT** — « Détermination de la CMI sur demande » / « Non catégorisable ». S1 Annexe 7 Tableau 2.

---

## 5. Cas où une CMI est nécessaire (lus)

- Glycopeptides (staphylocoques, entérocoques, streptocoques) : microdilution obligatoire, disques interdits (S1 p. 76, 82 ; S2).
- Daptomycine, colistine, céfidérocol, ceftaroline, ceftobiprole (S1 p. 51, 55, 74, 78).
- Streptocoques A, C, G : pénicilline G < 23 mm → CMI (S1 p. 91 note A).
- Streptocoques « autres » : infection grave, échec ou dépistage positif → CMI d'au moins une β-lactamine (S1 p. 96).
- Pneumocoque : dépistage oxacilline < 20 mm, infection grave → CMI amoxicilline/céfotaxime/ceftriaxone ; méropénème en méningite (S1 p. 86-87).
- Endocardite à streptocoque : CMI d'amoxicilline et de C3G (S14 diapo 8-9) ; gentamicine HNR « pour les infections qui le nécessitent » (S1 p. 92, 97).
- Enterobacterales BLSE traitées par BL/BLI hors IU : CMI de l'association (S1 p. 49) ; méningite : CMI de ciprofloxacine (S1 p. 53).
- E. faecalis ampicilline R au disque : confirmer par CMI (S2 note A).
- S. aureus sévère traité par vancomycine : « The MIC should always be determined » (S10 p. 33).

---

## 6. Divergences et corrections

1. **Témocilline** : CA-SFM 2026 a deux lignes (IU sans gravité 8/16, sans restriction d'espèce écrite ; autres infections 0,001/16 pour E. coli, Klebsiella sauf K. aerogenes, Raoultella, P. mirabilis) ; EUCAST v16.1 n'a qu'une ligne (« infections originating from the urinary tract », mêmes espèces sauf Raoultella non citée, 0,001/16). La fiche 7.1 du fichier précédent décrivait seulement la version EUCAST.
2. **Pénicilline G streptocoques A, C, G** : CA-SFM 0,06/0,06 mg/L vs EUCAST 0,03/0,03.
3. **Amoxicilline pneumocoque méningite/endocardite** : CA-SFM 0,5/0,5 vs EUCAST 0,06/0,06 (mis à jour en v16.0).
4. **Viridans en endocardite** : EUCAST a des lignes « endocarditis » (péni G 0,25/0,25 ; association (1)/(1)) ; CA-SFM n'en a pas (seuil unique 0,25/0,25).
5. **Lévofloxacine P. aeruginosa** : CA-SFM R > 0,5 vs EUCAST R > 2 (lecture CA-SFM par coordonnées).
6. **Céfoxitine SCN non identifié** : CA-SFM S ≥ 27 / R < 22 (ZIT 22-26) vs EUCAST S ≥ 25 / R < 25 (ATU 22-24).
7. **Aminosides** : EUCAST entre parenthèses (Enterobacterales systémiques, Pseudomonas, staphylocoques) ; CA-SFM sans parenthèses mais libellé « en association » (même intention).
8. **Résistances naturelles** : CA-SFM ajoute daptomycine et oxacilline (Enterobacterales), ertapénème (entérocoques), tigécycline (P. mirabilis), TMP-SMX (P. aeruginosa) ; EUCAST ERP ajoute rifampicine (non fermentants), clindamycine E. faecalis.
9. **Correction de la fiche 1.1** (fichier précédent) : la mise à jour de l'organigramme « ampicillin and amoxicillin in endocarditis and meningitis » concerne **S. pneumoniae**, pas les streptocoques A, B, C, G (feuille Changes l. 21-22).
10. **Corrections de la fiche 2.1** : diamètres céfoxitine 2026 désormais vérifiés (22/27 mm) ; aminosides EUCAST v16.1 vérifiés sur XLSX.

---

## 7. Non vérifié (à retenir)

- **ESC 2023** (texte intégral bloqué, 403) : seuils de pénicilline (≤ 0,125 ; 0,25-2 ; > 2 mg/L), recommandations entérocoques HNR — **non vérifiés** ; substitut : SPILF/AEPEI 2025 (seuils fondés sur l'amoxicilline 0,5 et 2 mg/L et C3G 0,5 mg/L) et EUCAST v16.1 (viridans « endocarditis »).
- **ESCMID 2022** (403) : recommandations détaillées, forces et niveaux de preuve — **non vérifiés** (résumé seul lu). Substitut lu : IDSA 2026 AMR Guidance v4.0 (sans GRADE, contexte américain).
- **IDSA 2011 MRSA** (archivée, texte OUP bloqué) : règle « CMI vancomycine > 2 mg/L → alternative » — **non vérifiée**.
- **IDSA/ESCMID 2026 SAB** : la place de la PCR mecA/PLP2a, la CMI de vancomycine, rifampicine/gentamicine n'y sont **pas traitées** (renvoyées à de futurs manuscrits) — vérifié par absence.
- **Recommandation SPILF sur la PCR mecA / PLP2a sur flacon** : aucune trouvée.
- **Organigrammes** : annexe 6 CA-SFM (flèches) et « flow chart » pneumocoque EUCAST (image) — enchaînement **non vérifié**.
- Passages marqués « [...] » dans le PDF CA-SFM 2026 — contenu non lisible.
- Note de seuil de daptomycine (diapositive SPILF 10) : caractère manquant.
- Libellés « BLSE », « céphalosporinase hyperproduite », « EPC », « méticillino-résistant » sur les comptes rendus : **non normés** par le CA-SFM (libellés probables seulement) ; seuls les libellés de l'Annexe 7 sont normés.
