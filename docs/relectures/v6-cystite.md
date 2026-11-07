# Relecture v6 — cystite (2026-11-06)

Deux relectures par des agents IA, l'une de développement, l'autre de sécurité de l'information clinique et de conformité documentaire, sur le commit 854fc44. Elles ne remplacent pas une validation médicale.

Référence documentaire : `docs/sources/recherche-cystite.md`.

## Constats et suites données

| Niveau | Constat | Suite |
|---|---|---|
| Bloquant | Une contre-indication (palier rénal, interaction déclarée) n'écartait pas la molécule : nitrofurantoïne en 1re ligne avec un DFG < 30 ; triméthoprime avec le méthotrexate. | Mécanisme général du moteur : une prescription contre-indiquée est écartée, avec sa raison dans « Pourquoi cette proposition n'est pas disponible ». La molécule suivante de la liste prend sa place (`Fiche.optionsEnOrdre`). Testé. |
| Bloquant | Sepsis ou choc sans ECBU : la situation était traitée comme une cystite simple. | Une cystite n'est jamais retenue en cas de sepsis ou de choc. Testé. |
| Bloquant | L'antibiogramme était ignoré dans la cystite simple. | Fosfomycine ou pivmécillinam résistants : retirés. Si les deux le sont, stratégie documentée de la forme à risque (SPILF 2018). Testé. |
| Bloquant | Allergie au pivmécillinam ou au cotrimoxazole non détectée. | Pivmécillinam classé parmi les pénicillines. Une allergie aux sulfamides fait aussi éviter le triméthoprime. Testé. |
| Bloquant | Porteur de sonde et infection associée aux soins traités comme une cystite communautaire. | Avec ECBU : parcours de l'infection urinaire associée aux soins, comme avant. Sans ECBU : situation « cystite associée aux soins », ECBU, absence de recommandation expliquée, avis (IUAS 2015). Testé. |
| Majeur | Une hémoculture négative ou en cours comptait comme une bactériémie. | Seules les hémocultures avec un germe comptent. Testé. |
| Majeur | Entrée par l'ECBU sans foyer déclaré : les questions urinaires étaient invisibles et leurs réponses effacées. | Les questions urinaires s'affichent dès qu'un ECBU est saisi. Testé. |
| Majeur | Grossesse non renseignée chez une femme jeune : traitée comme une cystite simple. | La grossesse bloque la décision. Testé. |
| Majeur | Nitrofurantoïne : grandeur rénale tranchée sans le dire ; contre-indications du RCP non demandées (G6PD, antécédent d'effet indésirable, cures répétées). | Grandeur « clairance » : le moteur compare Cockcroft-Gault et DFG désindexé et signale une discordance. Adaptation rénale en brouillon, avec le seuil divergent (45, 40 ou 30). Nouvelle question sur les contre-indications ; réponse « oui » : molécule écartée partout. Testé. |
| Majeur | Triméthoprime et nitrofurantoïne proposés en 1re ligne pendant la grossesse sans connaître le terme. | Options conditionnelles : triméthoprime « pas au 1er trimestre » (brouillon, divergence HAS/RCP) ; nitrofurantoïne « pas en fin de grossesse » ; cotrimoxazole « à éviter avant 10 SA ». Testé. |
| Majeur | « Non rendu » par le laboratoire était confondu avec « résistant » ; une absence de recommandation était affirmée à tort. | Distinction stricte. Une molécule mieux classée non rendue est demandée au laboratoire. Avant un geste, pas de passage à la 2e intention tant que la 1re n'est pas rendue. Testé. |
| Majeur | Hors champ traité comme couvert : homme immunodéprimé, sondé ou récidivant ; cystite récidivante à risque. | Homme : situation hors champ de la SPILF 2026, sans molécule. Récidivante à risque : concertation (SPILF 2018 p. 347), sans schéma. Testé. |
| Majeur | Forme d'infection urinaire masculine déclarée (prostatite…) ignorée ; germe non BGN sans antibiogramme orienté vers la cystite ; R-IU-FEBRILE appliquée sans fièvre. | La cystite masculine exige une forme non précisée. Un germe non BGN sans antibiogramme reste « germe non modélisé ». Sans ECBU et sans fièvre, plus de schéma d'infection fébrile. |
| Majeur | Colonisation avant geste : dose « prise unique » avec deux prises ; durée « 3 à 5 jours » pour la NLPC. | Schéma fosfomycine « J-2 et J0 », hors AMM, en brouillon. NLPC : durée non définie par l'AFU. Texte de l'indication corrigé. |
| Mineur | Douleur lombaire sans fièvre comptée comme cystite. | Question « douleur lombaire, frissons ou malaise » : réponse oui, pas une cystite (EAU 2026). |
| Mineur | Cystite récidivante : ECBU des premiers épisodes absent ; formule « avis spécialisé » non sourcée. | ECBU ajouté (SPILF 2015 p. 14) ; formule retirée. |
| Mineur | Divergence HAS/SPILF sur le relais par amoxicilline dans la cystite gravidique non signalée. | Réévaluation qui affiche les deux positions. |
| Mineur | Mises en garde des RCP manquantes. | Ajouts : métoclopramide (fosfomycine), transit œsophagien (pivmécillinam), anémie macrocytaire et insuffisance hépatique sévère (triméthoprime), hyperkaliémiants. Surveillance hématologique après 65 ans séparée de la kaliémie. |
| Mineur | Bladder-scan et « pas d'ECBU de contrôle » absents de la forme à risque. | Ajoutés. |
| Mineur | « Compléter » sans cible pour les nouvelles questions. | Cibles ajoutées. |
| Documentaire | Extraits non verbatim ; sources qui ne soutenaient pas l'affirmation (durées de 7 jours, ECBU gravidique, kaliémie, critère de Fried) ; paliers « pas d'adaptation » déduits. | Extraits corrigés mot pour mot. Une source propre à chaque molécule. Paliers déduits signalés comme tels. « Immunodépression grave » (HAS) : toute immunodépression déclarée est retenue, et c'est dit. |

## Non corrigé, à l'appréciation du médecin

- **Question « Le traitement peut-il attendre l'antibiogramme ? »** : posée aussi quand la cystite s'avère simple ; elle est alors sans effet.
- **Terme de la grossesse** : non saisi ; les molécules concernées restent conditionnelles.
- **Pivmécillinam dans la cystite simple** : 3 jours (HAS) ou 5 jours (SPILF, RCP), les deux affichés, en brouillon.

## Vérifications

- `npx tsc --noEmit` : réussi.
- `npx vitest run` : 266 tests réussis, dont 28 pour la cystite.
