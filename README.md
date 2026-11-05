# Infectiology — aide à la décision en antibiothérapie (adulte)

Application web française d'aide à la décision pour les prescripteurs, **en attendant l'avis du service de maladies infectieuses et tropicales (SMIT)**.

> **Statut : prototype de recherche, non validé pour l'usage clinique.** Aucune règle de la version `2026.11.0-brouillon` n'a été validée par un médecin. Les règles « vérifiées par IA » ne valent pas validation médicale. Voir [docs/GOUVERNANCE.md](docs/GOUVERNANCE.md).

## Lancer l'application

Prérequis : Node.js 20 ou plus récent.

```bash
npm install
```

```bash
npm run dev
```

L'application s'ouvre sur http://127.0.0.1:5173. Le menu « Charger un cas fictif » propose 13 patients fictifs.

Autres commandes :

```bash
npm test
```

```bash
npm run build
```

```bash
npm run veille
```

## Ce que fait l'application

1. **Deux entrées** : syndrome/foyer (A) ou résultat microbiologique (B).
2. **Questions progressives** : seules les questions pertinentes s'affichent ; « inconnu » est distinct de « non » ; une réponse devenue incohérente est effacée et signalée.
3. **Fiche opérationnelle** recalculée à chaque modification :
   - A. situation retenue, degré d'urgence, alertes, informations manquantes ;
   - B. traitement (DCI, dose, voie, modalités, adaptation rénale, durée et point de départ) ;
   - C. surveillance et contrôles, sous forme de frise (quand / quoi / pourquoi / ensuite) ;
   - D. réévaluation et avis spécialisé ;
   - E. sources, avec repère précis et statut de vérification.
4. **Résumé patient** visible en permanence.

## Architecture

| Couche | Emplacement | Rôle |
|---|---|---|
| Interface | `src/ui/` | React, formulaire progressif, fiche, résumé |
| Moteur déterministe | `src/engine/` | contexte, posologie, décision, invalidation |
| Calculs physiologiques | `src/calc/renal.ts` | Cockcroft-Gault, CKD-EPI 2021, Du Bois, poids idéal/ajusté |
| Calendrier | `src/schedule/frise.ts` | frise relative ou datée selon les horaires connus |
| Base clinique versionnée | `src/clinical/molecules/`, `src/clinical/rules/`, `src/clinical/etat-base.json` | molécules, régimes, adaptation rénale, surveillance, STP ; règles par situation |
| Registre des sources | `src/clinical/sources/registre.json` | organisme, titre, année, version, URL, date de consultation, statut d'accès et de vigueur |
| Tests | `src/tests/` | calculs, base, acceptation, interface |
| Veille | `tools/veille/`, `.github/workflows/veille.yml` | veille mensuelle des sources |
| Recherche documentaire | `docs/sources/` | fiches de vérification des sources (2026-11-04) |

Aucun modèle génératif n'intervient lors de la consultation : à entrées et version clinique identiques, le résultat est identique (testé). Aucune donnée saisie n'est conservée ni transmise.

## Documentation

- [Périmètre couvert et limites](docs/PERIMETRE.md)
- [Arbitrages entre sources](docs/ARBITRAGES.md)
- [Gouvernance, validation, publication et retour arrière](docs/GOUVERNANCE.md)
- [Procédure de veille](docs/veille/PROCEDURE.md)
- [Rapports des relecteurs](docs/relectures/)
