# Relecture v4 — saisie simplifiée (2026-11-06)

Relecture par un agent IA (développement et contrôle documentaire). Elle ne remplace pas une validation humaine qualifiée.

## Demande de l'utilisateur

Saisie allégée :
- en-tête réduit au titre ;
- ni sélecteur de cas fictif, ni case « N'appliquer que les règles validées par un humain » ;
- avertissement et état de la base en fin de saisie ;
- résumé du patient réduit par défaut ;
- patient : âge et sexe sur une ligne (Femme / Homme), poids et taille sur une ligne, sans texte d'aide ;
- créatininémie sans date, avec son unité ;
- DFG indexé affiché dans son champ, saisi à la main s'il n'est pas calculable ;
- équation et poids de Cockcroft-Gault masqués, liste des estimations retirée de la saisie ;
- définition des contextes « associé aux soins » et « communautaire » ;
- gravité sans paragraphe explicatif ;
- valve cardiaque : « Inconnu » conservé.

## Constats et suites données

| Niveau | Constat | Suite |
|---|---|---|
| Bloquant | Femme par défaut : un homme non coché passe dans le cadre de l'infection urinaire féminine. Les estimations rénales sont alors faussées : DFG surestimé, clairance de Cockcroft-Gault minorée de 15 %. Les garde-fous fondés sur « sexe inconnu » ne se déclenchent plus. | **Corrigé après arbitrage de l'utilisateur (« Aucun présélectionné »)** : sexe « inconnu » par défaut, aucun bouton coché ; les garde-fous « sexe inconnu » s'appliquent de nouveau. Sous le champ DFG, la donnée manquante au calcul est nommée. |
| Majeur | Un DFG saisi restait caché mais actif une fois le calcul possible. | Valeur affichée sous le DFG calculé, avec un bouton « Effacer » ; testé. |
| Majeur | Des cibles et des textes renvoyaient à des réglages retirés (poids de Cockcroft-Gault, « ce choix se modifie dans la saisie »). | La discordance de paliers renvoie à la créatininémie. Le texte devient « poids réel utilisé, à discuter avec le pharmacien ». |
| Majeur | Des textes demandaient encore une date de créatininémie. | Textes corrigés. Plus de limite « date non renseignée » ; une nouvelle valeur ne reprend pas une ancienne date. |
| Mineur | Le DFG saisi n'accepte que l'unité indexée (mL/min/1,73 m²). | Conforme à la demande (« case indexée »). Une clairance en mL/min fournie par le laboratoire ne se saisit plus. |
| Mineur | Unités renvoyées à la ligne à 375 px. | Largeur du champ réduite ; l'unité reste sur la ligne. |
| Mineur | Le mode « usage clinique » subsiste dans le moteur. | Conservé (testé côté moteur), simplement retiré de l'interface. |
| Documentaire | La définition omettait « ou un délai supérieur à la période d'incubation », et « communautaire » n'apparaissait pas comme un complément. | Les deux points sont rétablis dans le texte visible. Extrait verbatim vérifié : IUAS 2015, sous-question 4, citant le CTINILS 2007. |

## Vérifications

- `npx tsc --noEmit` : réussi.
- `npx vitest run` : 223 tests réussis, dont 6 nouveaux dans `saisie-v4.test.tsx`.
- `npm run build` : réussi.
- Après l'arbitrage sur le sexe : aucun bouton coché par défaut, « sexe ? » dans le résumé, DFG calculé dès que « Femme » ou « Homme » est choisi (testé).
- Aperçu local à 375 px : âge et sexe sur une ligne, poids et taille sur la suivante, créatininémie et DFG côte à côte, sans débordement.
