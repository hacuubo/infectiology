# Relecture v7 — infection à Clostridioides difficile (2026-11-07)

Deux relectures par des agents IA, l'une de sécurité de l'information clinique et de conformité documentaire, l'autre de développement, sur le commit 526e115. Corrections faites sur le commit de base 5bdba0b. Ces relectures ne remplacent pas une validation médicale.

Référence documentaire : `docs/sources/recherche-clostridioides-difficile.md`.

## Constats et suites données

| Niveau | Constat | Suite |
|---|---|---|
| Bloquant | Forme fulminante avec toxines négatives (GDH ou TAAN positif) : urgence « standard », ni option, ni alerte, ni avis chirurgical. | La forme fulminante est évaluée avant le résultat du test. Avec ce profil, on garde l'urgence immédiate, l'avis chirurgical et un traitement empirique admis (IDSA 2017). Les options restent conditionnelles, en brouillon, avec décision du SMIT. Le doute infection ou portage est affiché comme point non résolu. Testé. |
| Bloquant | Sepsis ou choc avec une conclusion sans traitement (sans diarrhée, diarrhée inconnue, test négatif, discordant, attente) : la conclusion C. difficile masquait le sepsis. | Avec un sepsis ou un choc, ces conclusions ne sont plus la conclusion de la fiche. Elles sont présentées « pour C. difficile seulement ». La décision devient l'urgence, avec en tête : prise en charge du sepsis sans attendre (alerte du moteur, protocole local, avis réanimation et SMIT) et recherche d'une autre cause. Une alerte le dit et la couverture devient partielle. Testé pour chaque gravité, chaque réponse sur la diarrhée et chaque résultat de test. |
| Majeur | Choc septique avec recherche négative : « ne pas traiter », urgence standard. | Recherche négative avec forme grave et compliquée (choc, iléus ou critère déclaré) : urgence conservée, diagnostic à revoir, avis chirurgical et infectiologique urgents. Ce cas n'est pas traité par les sources lues : indication en brouillon, sans option. Testé. |
| Majeur | Attente du résultat alors que la forme compliquée n'est pas renseignée (dans l'attente comme dans le profil discordant). | La donnée devient bloquante (`details.cdiff.compliquee`), puisque c'est la seule exception à l'attente. Testé. |
| Majeur | Laxatif dans les 48 h : l'alerte dit « pas en routine », mais le contrôle disait « indiqué, maintenant ». | Le contrôle devient « non systématique », avec la raison. La première action rappelle d'abord le laxatif. Testé. |
| Majeur | 1er épisode sans facteur de risque présenté comme couvert et vérifié, alors que la branche SPILF 2026 est illisible. | Options en brouillon, couverture partielle, « non tranché » écrit dans le commentaire et la description. Testé. |
| Majeur | Récidives multiples : « schéma standard 10 j » vérifié, alors que la source dit seulement « à base de vancomycine ou de fidaxomicine ». | Options en brouillon, libellé « schéma non précisé par la source ; schéma standard affiché ». Testé. |
| Majeur | Sepsis et traitement de l'ICD : le sepsis n'est pas un critère de forme grave dans les sources. | Pas de critère inventé. L'aide de la question « forme compliquée » le dit et demande de rechercher une hypotension ou des lactates élevés. Testé. |
| Majeur | Syndrome C. difficile choisi, mais une hémoculture porte un autre foyer : R-CDIFF ne s'appliquait plus. | R-CDIFF s'applique dès que le syndrome C. difficile est choisi en entrée A. Questions et réponses conservées (mécanisme du moteur). Testé avec une hémoculture à E. coli de foyer urinaire. |
| Majeur | Allergie à la fidaxomicine : vancomycine absente ou seulement conditionnelle, d'où un motif « contraintes ». | 1re récidive : la vancomycine passe en 1re ligne, car c'est la 2e intention quand la fidaxomicine n'est pas accessible (Rev Prat 2026). Haut risque : vancomycine conditionnelle en brouillon, conduite non tranchée, avis. Rang inconnu : vancomycine en alternative, en brouillon. Testé. |
| Majeur | Forme fulminante sans aucune option de 1re ligne : pas de motif dans l'état de sortie. | Le motif générique vient du moteur. Six cas fulminants (test positif, discordant, négatif, en attente, iléus sans test, choc avec test négatif) sont ajoutés à l'invariant « jamais sans motif » de `src/tests/sortie-renal.test.tsx`. Testé. |
| Majeur | Grossesse inconnue chez une femme de 30 ans : fidaxomicine en 1re ligne, sortie complète. | Si une grossesse est possible et non renseignée, la donnée « grossesse » devient bloquante (`patient.grossesse`). Testé. |
| Majeur | Boutons « Compléter » sans cible. Les critères de gravité menaient à la créatininémie. | Chaque donnée manquante de R-CDIFF a une cible (`details.cdiff.<id>` ou `patient.…`). Le test vérifie aussi que chaque cible renvoie à une question existante. |
| Majeur | Dialyse : vancomycine orale et fidaxomicine affichaient « dose de référence… à adapter » et « avis requis ». | Vancomycine orale : `absorptionSystemiqueNegligeable` est renseigné (CRAT, « pratiquement pas absorbée par voie digestive », cité par la note §15.4 I). La réserve du RCP §4.4 reste écrite : absorption possible en cas de colite pseudomembraneuse. Fidaxomicine : voir « Non corrigé ». Testé. |
| Mineur | Divergence sur le critère créatinine (IDSA en valeur absolue) affichée seulement en forme grave. | Divergence ajoutée à l'aide de la question sur la gravité (> 1,5 mg/dL, environ 133 µmol/L par conversion). Testé. |
| Mineur | L'iléus seul classait la forme comme fulminante sans le dire. | Dit dans l'option « iléus » de la question, dans son aide, dans la description de la situation et dans l'alerte (« Classée grave et compliquée : iléus »). Testé. |
| Mineur | Choc sans diarrhée avec test positif : « portage » sans autre piste. | Ajout dans « à reconsidérer » : « iléus ou mégacôlon toxique ? ». Testé. |
| Mineur | Durée des précautions contact tranchée chez un porteur. | Le geste du porteur reprend la divergence HCSP / IDSA / CLIN. |
| Mineur | TAAN seul traité comme une infection confirmée. | Alerte avec les positions de SPILF 2022, ESCMID 2021 (« preferably with a low cycle threshold ») et IDSA 2017 (test de toxines plutôt qu'un TAAN seul). Contrôle « recherche des toxines A/B ». Options en brouillon, couverture partielle. Testé. |
| Mineur | TMF : « quel que soit le traitement reçu » étendu aux patients à haut risque ; grade AE omis. | Texte repris au plus près de la diapositive : haut risque de morbi-mortalité (grade AE) ; « quel que soit le traitement reçu » seulement après 70 ans (grade C). Testé. |
| Mineur | Citation IDSA (« au moins 2 récidives ») utilisée à l'appui de la TMF, sans signaler la divergence. | 1re récidive : divergence affichée (SPILF 2026 dès la 1re récidive selon le traitement reçu ; IDSA après 2 récidives). Récidives multiples : concordance dite explicitement. Testé. |
| Mineur | Grossesse : fortes doses et schémas pulsés « écartés » ; options fulminantes proposées sans réserve. | Ils sont « déconseillés » (alerte, « should be discouraged ») au lieu d'être écartés. En forme fulminante, les options vancomycine 500 mg et fidaxomicine portent la réserve liée à la grossesse. Testé. |
| Mineur | « Avis chirurgical immédiat ». | « Avis chirurgical systématique et précoce », comme dans la note §15.4 D. Testé. |
| Mineur | Interactions P-gp : la ciclosporine était rattachée à toute la classe des anticalcineurines ; amiodarone et dronédarone n'apparaissaient que dans les modalités. | Le texte de l'interaction anticalcineurine nomme la ciclosporine et précise que le tacrolimus n'est pas cité. Nouvelle interaction pour les traitements allongeant le QT : amiodarone et dronédarone. Nouvelle question « inhibiteur puissant de la P-gp » : alerte si oui ; donnée à compléter si elle est inconnue et qu'un traitement allongeant le QT ou un anticalcineurine est déclaré. Testé. |
| Mineur | Allergie aux macrolides : le moteur dit « famille évitée » alors que la fidaxomicine reste en 1re ligne. | L'alerte dit explicitement que l'exclusion des macrolides ne s'applique pas à la fidaxomicine (RCP : prudence, pas de contre-indication). Elle demande de préciser la réaction et de surveiller l'hypersensibilité. Testé. |
| Mineur | Fidaxomicine : prescription hospitalière et SMR absents. | Modalités : prescription hospitalière, rétrocession, SMR insuffisant si C. difficile n'est pas objectivé (BDPM). Ce dernier point est aussi rappelé sur l'option fulminante quand le test n'a pas confirmé l'infection. Testé. |
| Mineur | « Colite sévère » au lieu de « colite pseudomembraneuse ». | Corrigé, avec le terme du RCP. |
| Mineur | Voie orale impossible : l'option réutilisait le régime PO en solution buvable. | Nouveau régime `vanco-intraluminal-125x4`, voie « intraluminale », en brouillon, sourcé ESCMID 2021 et SPILF 2022 (dose extrapolée). Testé. |
| Mineur | Diarrhée inconnue : même donnée sous deux libellés. | Un seul libellé : une seule ligne « Compléter ». Testé. |
| Mineur | Contexte inconnu au 1er épisode : doublon avec R-DONNEES ; réponse « hospitalisation » ignorée. | Réponse « non » : facteur exclu, aucune donnée demandée. Sinon, même libellé que R-DONNEES (« contexte communautaire ou associé aux soins », `patient.contexte`). Testé. |
| Mineur | 65 ans et autre facteur inconnu : divergence sur le seuil d'âge non affichée. | Alerte de divergence affichée aussi dans cette branche. Testé. |
| Mineur | Voie orale « inconnu » traitée comme possible, sans donnée manquante. | Donnée manquante (affine, `details.cdiff.voie_orale`). Testé. |
| Mineur | Grossesse : branche prise avant la lecture du rang ; récidives multiples sans mention de la TMF. | Rang inconnu : donnée manquante. Récidives multiples pendant la grossesse : orientation vers un centre de TMF, place de la TMF non détaillée. Testé. |
| Mineur | Tests manquants (sepsis × test, fulminante × test, allergies, dialyse, cibles, invariant, bactériémie). | Tous ajoutés : 33 nouveaux tests C. difficile et 1 test d'invariant. Chacun échoue sur le code de base et passe après correction (vérifié). |
| Documentaire | Citations présentées comme verbatim, absentes des extraits : « 2ème choix », « s'établit ici aussi en 1re ligne », « Informer le patient sortant », extrait RCP oral rénal, « per os ou par sonde ». | « 2ème choix » et « Informer le patient sortant » : référence conservée sans extrait, avec renvoi au paragraphe de la note. Rev Prat : remplacé par l'extrait « La vancomycine est le traitement de 2e intention… ». Le palier rénal oral est donné comme lecture de la note §16.2, sans extrait. « Ou par sonde » est retiré des textes IDSA et du régime 500 mg. Testé. |
| Documentaire | Précautions « dès la suspicion » et « gants » sans extrait. | Remplacé par la paraphrase de la note : précautions préemptives si le résultat n'est pas disponible le jour même (IDSA 2017). Signalé comme paraphrase, pas comme extrait. Testé. |
| Documentaire | Alerte « haut risque » : les sources ne couvraient ni l'âge > 65 ans ni l'antibiothérapie concomitante. | Les cinq facteurs SPILF 2026 sont cités, avec ESCMID p. 27. |
| Documentaire | Info-antibio 94 (remplacée) citée pour des affirmations actuelles. | Chaque citation indique « extrait jugé encore valide par la note §5 ; Info-antibio 94 remplacée ». |

## Non corrigé, à l'appréciation du médecin

- **Fidaxomicine non absorbée** : `absorptionSystemiqueNegligeable` n'est pas renseigné, car la note ne cite aucun extrait du RCP sur l'absorption systémique. À la place, la dialyse et l'épuration extrarénale affichent ce que dit le RCP : aucune consigne propre, aucune adaptation jugée nécessaire, prudence si l'insuffisance rénale est sévère. Le message « avis requis » disparaît. En revanche, le moteur garde « Dose de référence… à adapter » en dialyse. Lire le RCP §5.2 permettrait de renseigner ce champ.
- **Sepsis sans choc** : il ne devient pas un critère de forme grave, car aucune source lue ne le classe ainsi. Il est seulement signalé dans l'aide de la question.
- **Recherche négative avec forme grave et compliquée** : aucune option. Le cas n'est pas traité par les sources, et l'indication est en brouillon avec un avis urgent.
- **Inhibiteur de la P-gp déclaré** : la fidaxomicine reste en 1re ligne, avec une alerte « association déconseillée ». Les sources ne disent pas s'il faut alors préférer la vancomycine.
- **Interaction avec R-BACTERIEMIE-BGN** : traitée par le moteur, sans changement dans les règles de bactériémie.

## Fichiers partagés modifiés

- `src/clinical/types.ts` : voie « intraluminale » ajoutée au type `Regimen.voie` (constat sur la voie orale impossible).
- `src/tests/sortie-renal.test.tsx` : cas fulminants ajoutés à l'invariant « jamais sans motif ».

## Vérifications

- `npx tsc --noEmit` : réussi.
- `npx vitest run` : 23 fichiers, 415 tests réussis, dont 52 pour C. difficile.
