# Gouvernance, validation, publication et retour arrière

## Statuts des règles

| Statut | Signification | Utilisable en mode « usage clinique » |
|---|---|---|
| `brouillon` | règle non sourcée de façon suffisante, extrapolée ou dont une source n'a pas pu être lue | non |
| `verifiee_ia` | règle dont les sources ont été lues et relues par des agents IA | non |
| `validee_humain` | règle relue et signée par un médecin qualifié (infectiologue) désigné | oui |
| `publiee` | règle validée et incluse dans une version clinique publiée | oui |
| `retiree` | règle retirée (source retirée, erreur, remplacement) | non |

Une revue IA n'équivaut pas à une validation médicale. Dans la version `2026.11.0-brouillon`, **aucune règle n'est validée par un humain** : la case « N'appliquer que les règles validées par un humain » masque donc toutes les propositions.

## Conditions avant tout usage clinique réel

Ces conditions ne sont **pas remplies** à ce jour. Aucune conformité n'est déclarée.

1. **Gouvernance médicale** : désigner un référent infectiologue responsable de la base, une procédure de validation règle par règle (signature, date, version), un circuit de signalement des erreurs.
2. **Qualification réglementaire** : un logiciel qui produit, à partir de données d'un patient, une proposition thérapeutique individuelle relève vraisemblablement du statut de **dispositif médical** (règlement (UE) 2017/745, art. 2 ; guide MDCG 2019-11 rev.1 de juin 2025 ; pages ANSM sur les logiciels). La règle 11 de l'annexe VIII place ces logiciels au minimum en classe IIa, et plus haut si une décision erronée peut entraîner un décès ou une détérioration grave. Conséquences : marquage CE, organisme notifié, gestion des risques (ISO 14971), cycle de vie logiciel (IEC 62304), aptitude à l'utilisation (IEC 62366-1), personne chargée de veiller au respect de la réglementation. Une utilisation « en interne » dans un établissement relève de conditions spécifiques (art. 5(5)). Cette analyse doit être confirmée par un spécialiste réglementaire.
3. **Intelligence artificielle** : le moteur de consultation est déterministe et n'utilise pas d'IA. Les agents IA n'interviennent que dans la veille et la relecture, hors produit. Si cela changeait, le règlement (UE) 2024/1689 (AI Act) s'appliquerait (IA intégrée à un dispositif médical = haut risque).
4. **Données personnelles** : l'application ne conserve ni ne transmet aucune donnée. Toute évolution qui stockerait des données de santé exigerait une analyse RGPD (article 9), une analyse d'impact et un hébergement certifié HDS.
5. **Référentiel HAS** : le référentiel fonctionnel HAS 2023 des systèmes d'aide à la décision en antibiothérapie doit être lu intégralement (non lisible lors de la vérification) et l'application confrontée à ses critères.
6. **Sécurité** : revue de sécurité, dépendances maintenues, déploiement sur une infrastructure qualifiée.

## Nouvelles règles de la version 2026.11.1

Les règles d'indication et d'interprétation microbiologique suivent le même circuit que les règles thérapeutiques :
- indication : `R-INDICATION-ECBU`, `R-SEPSIS-FOYER-INCONNU`, `R-PRELEVEMENT-SUPERFICIEL`, et les indications portées par `R-BACTERIEMIE-S-AUREUS` et `R-BACTERIEMIE-SCN` ;
- interprétation microbiologique : `src/clinical/microbiologie/`.

Elles sont « vérifiées par IA » ou en brouillon, jamais validées. Leur matrice figure dans `docs/relectures/v2-relecteur-2-audit-documentaire.md`. Une décision de non-traitement se valide comme une proposition de traitement : conditions, exceptions, source et version.

## Nouveautés de la version 2026.11.2

- **Fonction rénale** (`src/calc/renal.ts`, `src/clinical/molecules/reference-renale.ts`) : les formules, leur version, la grandeur exigée par chaque référence posologique et la conduite en IRA ou dialyse suivent le même circuit de validation que les règles thérapeutiques. Le choix de l'équation par défaut (CKD-EPI 2009 sans coefficient racial) est à confirmer par l'équipe médicale et, si possible, aligné sur l'équation rendue par le laboratoire de l'établissement.
- **États de sortie** (`src/engine/sortie.ts`) : chaque motif d'absence de proposition indique les règles dont il provient. Un motif ne crée aucune recommandation : il reprend ce que les règles ont produit (indication, situation, données manquantes, propositions écartées).
- Relectures : `docs/relectures/v3-relecteur-1-developpement.md` et `docs/relectures/v3-relecteur-2-audit-documentaire.md`.

## Procédure de validation d'une règle

1. La règle est en `verifiee_ia` avec ses sources lues et ses repères (page, tableau, recommandation).
2. Le référent médical relit la règle, ses sources, ses exclusions et les tests associés.
3. En cas d'accord, il passe le statut à `validee_humain` dans le fichier de règle ou de molécule, avec son nom et la date dans le message de commit.
4. Une pull request dédiée est ouverte ; les tests doivent passer ; la validation est tracée dans la PR.

## Publication d'une version clinique

1. Mettre à jour `src/clinical/etat-base.json` : `version`, `dateValidationHumaine`, `statutGlobal`.
2. Étiqueter le commit : `git tag clinique-AAAA.MM.N`.
3. Fusionner sur la branche principale. Rappel : chaque envoi vers la branche publiée peut déclencher un déploiement facturé ; regrouper les changements.

## Retour arrière

1. Identifier la dernière version clinique sûre (`git tag --list 'clinique-*'`).
2. Créer une branche de retour arrière et rétablir les fichiers cliniques de cette version.

```bash
git checkout -b retour-arriere/clinique-AAAA.MM.N
```

```bash
git checkout clinique-AAAA.MM.N -- src/clinical
```

3. Marquer la règle fautive `retiree` dans la version corrigée, documenter l'incident, ouvrir une pull request urgente.
4. Une source retirée dans le registre (`statutVigueur: "retiree"`) exclut automatiquement les options qui en dépendent (testé).
