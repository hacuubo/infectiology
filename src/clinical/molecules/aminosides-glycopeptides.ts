import type { Molecule } from '../types';
import { S, SRC_DOSES_2026 } from './base';

/* ------------------------------------------------------------------ */
/* AMIKACINE                                                           */
/* ------------------------------------------------------------------ */

export const amikacine: Molecule = {
  id: 'amikacine',
  dci: 'Amikacine',
  famille: 'aminoside',
  statut: 'verifiee_ia',
  regimens: [
    {
      id: 'amikacine-30-du',
      libelle: '30 mg/kg en dose unique (association, sepsis / choc)',
      indication: 'Infection urinaire grave ou bactériémie à BGN avec sepsis/choc, en association à une bêta-lactamine, dose unique (1 à 3 jours maximum selon SPILF 2015).',
      dose: { type: 'ponderale', valeur: 30, unite: 'mg/kg', frequenceParJour: 1, poidsReference: 'ajuste', seuilObesiteRatio: 1.25 },
      voie: 'IV',
      modalites: 'perfusion de 30 min, dose unique journalière',
      statut: 'verifiee_ia',
      sources: [
        S('SPILF-2026-IUM', 'diapo 14-15, 21-22', 'Céfotaxime IV 6 g/jour OU ceftriaxone IV 2 g/jour ET amikacine IV 30 mg/kg, dose unique', 'posologie'),
        S('SPILF-2015-IU', 'annexe 1, p. 41', 'amikacine 30 mg/kg X1/jour 1 à 3 jours en bithérapie', 'posologie'),
        S(SRC_DOSES_2026, 'Annexe 9 (aminosides, p. 169 de la version 2025)', 'Amikacine 25 à 30 mg/kg en perfusions de 30 min en dose unique journalière', 'posologie'),
        S('ANSM-2011-aminosides', 'p. 5-6', 'amikacine : 15 à 30 mg/kg/jour ; perfusion de 30 minutes ; dose unique journalière', 'posologie'),
        S('RCP-amikacine', '§4.2', 'en se basant sur le poids corporel idéal estimé du patient et en ajoutant 40 % de l\'excédent', 'posologie'),
      ],
      // Audit relecteur 2 (2026-11-05) : remarque complétée — le RCP plafonne la dose à 1,5 g/j, ce que la dose
      // SPILF de 30 mg/kg dépasse dès 50 kg (divergence à afficher, pas à corriger : la dose SPILF est retenue).
      remarques: "Poids de référence : poids réel ; en cas d'obésité, poids idéal + 40 % de l'excédent (RCP amikacine, formule du poids idéal non précisée ; l'application utilise Devine). Le seuil d'obésité (ratio 1,25) est un choix de l'application, non sourcé. Divergence : le RCP amikacine indique 15 mg/kg/j (jusqu'à 30) et une dose maximale de 1,5 g/j ; la dose de 30 mg/kg (SPILF 2015/2026, SPILF/SFPT/CA-SFM 25-30 mg/kg) dépasse ce plafond au-delà de 50 kg (hors RCP).",
    },
    {
      id: 'amikacine-15-mono',
      libelle: '15 mg/kg/j en monothérapie (PNA, allergie aux bêta-lactamines)',
      indication: 'Pyélonéphrite aiguë sans gravité en cas d\'allergie aux bêta-lactamines ou de résistance aux C3G (SPILF 2015) ; durée 5 jours (SPILF 2018/2026).',
      dose: { type: 'ponderale', valeur: 15, unite: 'mg/kg', frequenceParJour: 1, poidsReference: 'ajuste', seuilObesiteRatio: 1.25 },
      voie: 'IV',
      modalites: 'perfusion de 30 min, dose unique journalière',
      statut: 'verifiee_ia',
      sources: [
        S('SPILF-2015-IU', 'annexe 1, p. 41 ; p. 19-20', 'amikacine monothérapie 15 mg/kg X1/jour', 'posologie'),
        S('ANSM-2011-aminosides', 'p. 5', "L'utilisation des aminosides en monothérapie […] correspond essentiellement à la prise en charge de certaines infections urinaires", 'choix'),
      ],
      remarques: 'Divergence : SPILF/SFPT/CA-SFM 2026 et EAU 2026 indiquent 25-30 mg/kg ; EAU : « not studied as monotherapy in acute pyelonephritis ».',
    },
  ],
  adaptationRenale: {
    methode: 'Cockcroft',
    statut: 'verifiee_ia',
    texteGeneral: "Pas de réduction de la dose unitaire : première injection à dose pleine, puis espacement des injections guidé par la concentration résiduelle (< 2,5 mg/L avant réinjection).",
    paliers: [
      { clcrMin: 50, texte: 'ClCr ≥ 50 mL/min : dose unique journalière habituelle ; dosage de la résiduelle seulement si traitement > 5 jours.', sources: [S('RCP-amikacine', '§4.2', 'Dose adulte (ClCr ≥ 50 mL/min) : 15 mg/kg de poids corporel/jour', 'adaptation_renale')] },
      { clcrMax: 50, texte: 'ClCr < 50 mL/min : dose unique journalière, cure courte (1 à 2 injections), suivi « fortement recommandé » des concentrations pour adapter doses et intervalles ; ne pas réinjecter tant que la résiduelle est ≥ 2,5 mg/L.', sources: [S('RCP-amikacine', '§4.2', 'IR (ClCr < 50 mL/min) : DUJ, dosages pour adapter doses et intervalles, cures courtes (1-2 injections)', 'adaptation_renale'), S('ANSM-2011-aminosides', 'p. 8', 'Des taux résiduels (Cmin) supérieurs à ceux donnés dans le tableau 1, nécessitent d\'espacer les injections', 'adaptation_renale')] },
    ],
    hemodialyse: { texte: 'Pas de schéma chiffré dans le RCP amikacine lu : dose unique puis réinjection guidée par la résiduelle ; avis pharmacologique. Pour la gentamicine, le RCP indique une injection 2 à 4 h avant la séance (divergence avec la pratique « après séance » des autres antibiotiques).', sources: [S('RCP-amikacine', '§4.2', 'adapter selon les dosages, notamment lorsque le patient est sous dialyse', 'adaptation_renale'), S('RCP-gentamicine', '§4.2', 'les injections doivent se faire 2 à 4 heures avant la séance de dialyse', 'adaptation_renale')] },
    eerContinue: { texte: 'Réinjection guidée par la résiduelle avant chaque dose ; posologie non déterminable sans dosage (avis pharmacologique/réanimation).', sources: [S('RCP-amikacine', '§4.2', 'suivi « fortement recommandé » en IR', 'adaptation_renale')] },
  },
  surveillance: [
    {
      id: 'amikacine-renal',
      type: 'biologique',
      categorie: 'systematique',
      quoi: 'Créatininémie (fonction rénale) avant la 1re dose puis pendant le traitement',
      quand: { ancre: 'avant_traitement', texte: 'Avant la 1re dose, puis régulièrement pendant le traitement (fréquence non chiffrée par les sources)', repetition: 'régulièrement ; avec chaque résiduelle si traitement prolongé' },
      pourquoi: 'Néphrotoxicité, accrue au-delà de 5-7 jours ; conditionne l\'espacement des doses.',
      statut: 'verifiee_ia',
      sources: [S('RCP-amikacine', '§4.4', 'fonction rénale évaluée avant et « surveillée régulièrement »', 'surveillance'), S('ANSM-2011-aminosides', 'p. 7-8', 'Les risques de survenue de toxicités rénale et auditive augmentent pour les durées de traitement supérieures à 5-7 jours', 'surveillance')],
    },
    {
      id: 'amikacine-duree',
      type: 'clinique',
      categorie: 'systematique',
      quoi: 'Réévaluer l\'arrêt de l\'aminoside à 48-72 h ; ne pas dépasser 5 jours (3 jours si IU associée aux soins)',
      quand: { ancre: 'debut_traitement', offsetHeures: 48, texte: 'À 48-72 h de traitement' },
      pourquoi: 'Rapport bénéfice/risque ; toxicité au-delà de 5-7 jours.',
      statut: 'verifiee_ia',
      sources: [S('ANSM-2011-aminosides', 'p. 7', 'un aminoside peut être arrêté après 48 à 72 heures de traitement […] il pourra être poursuivi au maximum 5 jours', 'duree'), S('SPILF-AFU-SF2H-2015-IUAS', 'R.39, p. 29', 'ne pas prescrire les aminosides plus de 72 heures', 'duree')],
    },
    {
      id: 'amikacine-audition',
      type: 'clinique',
      categorie: 'conditionnelle',
      quoi: 'Surveillance auditive (acouphènes, hypoacousie) ; audiogramme « si possible » en cas de traitement prolongé',
      quand: { ancre: 'quotidien', texte: 'Interrogatoire à chaque évaluation ; audiogramme si traitement prolongé (fréquence non chiffrée)' },
      pourquoi: 'Ototoxicité cumulative ; arrêt si acouphènes, hypoacousie ou perte des hautes fréquences.',
      conditionId: 'duree_sup_3j',
      conditionTexte: 'si traitement > 3 jours',
      statut: 'verifiee_ia',
      sources: [S('RCP-amikacine', '§4.4', 'audiogrammes répétés « si possible » ; arrêt si acouphènes, hypoacousie subjective ou perte des hautes fréquences', 'surveillance')],
    },
  ],
  stp: [
    {
      id: 'amikacine-pic',
      parametre: 'pic',
      categorie: 'conditionnelle',
      indication: 'Patients sévères (choc septique, réanimation, obésité morbide, neutropénie fébrile, brûlés, polytraumatisés) ou paramètres pharmacocinétiques modifiés ; pas systématique si traitement ≤ 3 jours sans modification PK attendue.',
      premierPrelevement: { quand: 'après la 1re dose', position: '30 minutes après la fin de la perfusion de 30 minutes', numeroDose: 1, offsetHeuresApresFinPerfusion: 0.5 },
      repetition: 'après modification de dose (non précisé autrement par la source)',
      cible: { min: 60, max: 80, unite: 'mg/L', verifiee: true, texte: '60 à 80 mg/L (ANSM 2011, tableau 1)' },
      limites: 'Interprétation valable seulement si la perfusion a duré 30 min et le prélèvement 30 min après sa fin ; horaires réels requis.',
      conduite: 'Pic inférieur à la cible : augmenter la posologie de l\'injection suivante.',
      conditionId: 'patient_severe',
      // Audit relecteur 2 : liste alignée sur l'ANSM 2011 p. 8 ; l'IRA et l'EER sont des ajouts du moteur (modification PK probable), signalés comme tels.
      conditionTexte: 'si patient sévère (ANSM 2011 : choc septique, réanimation sous ventilation, brûlé, neutropénie fébrile, obésité morbide, polytraumatisé) ; l\'application l\'applique aussi en cas de sepsis, d\'IRA ou d\'EER',
      statut: 'verifiee_ia',
      sources: [
        S('ANSM-2011-aminosides', 'p. 8, tableau 1', 'Les dosages du pic doivent être effectués 30 minutes après la fin de la perfusion (dont la durée doit également être de 30 minutes)', 'surveillance'),
        S('ANSM-2011-aminosides', 'p. 8', 'Un dosage du pic plasmatique est conseillé après la 1re injection chez tous les patients sévères', 'surveillance'),
        S('RCP-amikacine', '§4.2', 'Pic 30 min après la fin de perfusion, cible 60 à 80 mg/L', 'surveillance'),
      ],
    },
    {
      // Audit relecteur 2 (2026-11-05) : ajout. En insuffisance rénale, la résiduelle conditionne CHAQUE réinjection
      // (pas de réinjection tant qu'elle dépasse le seuil) : le 1er dosage se fait avant la 2e injection, et non
      // « après 48 h » (délai que l'ANSM réserve aux traitements > 5 jours).
      id: 'amikacine-residuelle-ir',
      parametre: 'residuelle',
      categorie: 'conditionnelle',
      indication: 'Insuffisance rénale : dosage de la résiduelle avant toute réinjection (suivi « fortement recommandé » par le RCP ; réinjection seulement si la résiduelle est sous le seuil).',
      premierPrelevement: { quand: 'avant la 2e injection (au moment prévu de la réinjection), puis avant chaque réinjection', position: 'juste avant la réinjection envisagée', numeroDose: 2, avantDoseSuivante: true },
      repetition: 'avant chaque réinjection, avec la créatininémie',
      cible: { max: 2.5, unite: 'mg/L', verifiee: true, texte: '< 2,5 mg/L avant réinjection (ANSM 2011, tableau 1)' },
      limites: 'Sans épuration extrarénale : pas de réinjection tant que la résiduelle reste au-dessus du seuil ; l\'intervalle n\'est pas fixé à l\'avance.',
      conduite: 'Résiduelle ≥ 2,5 mg/L : ne pas réinjecter, redoser ; espacer les injections sans réduire la dose unitaire.',
      conditionId: 'insuffisance_renale',
      conditionTexte: 'si insuffisance rénale (ClCr < 50 mL/min selon le RCP ; seuil du moteur : < 60 mL/min), IRA ou dialyse',
      statut: 'verifiee_ia',
      sources: [
        S('RCP-amikacine', '§4.2', 'IR (ClCr < 50 mL/min) : DUJ, dosages pour adapter doses et intervalles, cures courtes (1-2 injections)', 'surveillance'),
        S('ANSM-2011-aminosides', 'p. 8', 'Des taux résiduels (Cmin) supérieurs à ceux donnés dans le tableau 1, nécessitent d\'espacer les injections', 'surveillance'),
        S('RCP-gentamicine', '§4.2', '[principe de classe] sans épuration extrarénale, pas de réinjection tant que la résiduelle reste au-dessus du seuil', 'surveillance'),
      ],
    },
    {
      id: 'amikacine-residuelle',
      parametre: 'residuelle',
      categorie: 'conditionnelle',
      indication: 'Traitement > 5 jours (dosage à effectuer après 48 h de traitement) ; en insuffisance rénale, voir aussi le dosage avant chaque réinjection.',
      premierPrelevement: { quand: 'après 48 h de traitement', position: 'juste avant la dose suivante (position précisée par Abdul-Aziz 2020 ; non explicitée par l\'ANSM)', numeroDose: 3, avantDoseSuivante: true },
      repetition: '2 fois par semaine, avec surveillance de la fonction rénale',
      cible: { max: 2.5, unite: 'mg/L', verifiee: true, texte: '< 2,5 mg/L (ANSM 2011, tableau 1)' },
      limites: 'En insuffisance rénale sans épuration extrarénale : pas de réinjection tant que la résiduelle reste au-dessus du seuil.',
      conduite: 'Résiduelle supérieure à la cible : espacer les injections (pas de réduction de la dose unitaire).',
      conditionId: 'duree_sup_5j_ou_insuffisance_renale',
      conditionTexte: 'si insuffisance rénale, ou si le traitement dépasse 5 jours',
      statut: 'verifiee_ia',
      sources: [
        S('ANSM-2011-aminosides', 'p. 8', 'Un dosage de la concentration résiduelle est nécessaire uniquement si la durée de traitement est > 5 jours (dosage à effectuer après 48 heures de traitement) ou en cas d\'insuffisance rénale', 'surveillance'),
        S('ANSM-2011-aminosides', 'p. 8', 'Ce dosage doit être répété 2 fois par semaine et s\'accompagner d\'une surveillance de la fonction rénale', 'surveillance'),
        S('ABDUL-AZIZ-2020-TDM', 'Table 4', 'Amikacin < 2.5 mg/L ; 30 min or just before the next dosing', 'surveillance'),
      ],
    },
  ],
  grossesse: { statut: 'utilisable', texte: 'Amikacine utilisable quel que soit le terme (règles habituelles, fonction rénale maternelle) ; tenir compte de l\'exposition in utero lors du dépistage néonatal de l\'audition si traitement prolongé.', sources: [S('CRAT-aminosides-grossesse', 'En pratique', 'Quelques cas de surdité ont été rapportés chez des enfants exposés in utero aux aminosides par voie injectable', 'autre')] },
  interactionsPertinentes: [
    { avec: 'autre_nephrotoxique', texte: 'Néphrotoxicité additive : surveillance rénale renforcée, limiter la durée.', sources: [S('ANSM-2011-aminosides', 'p. 6', 'association à des facteurs risquant d\'augmenter la toxicité rénale', 'surveillance')] },
    { avec: 'diuretique', texte: 'Diurétiques de l\'anse : risque accru d\'ototoxicité et de néphrotoxicité (mise en garde de classe).', sources: [S('ANSM-2011-aminosides', 'p. 6', 'association à des facteurs risquant d\'augmenter la toxicité rénale', 'surveillance')] },
  ],
};

/* ------------------------------------------------------------------ */
/* GENTAMICINE                                                         */
/* ------------------------------------------------------------------ */

export const gentamicine: Molecule = {
  id: 'gentamicine',
  dci: 'Gentamicine',
  famille: 'aminoside',
  statut: 'verifiee_ia',
  regimens: [
    {
      id: 'gentamicine-3-synergie',
      libelle: '3 mg/kg/j en synergie (endocardite à streptocoque/entérocoque, prothèse valvulaire)',
      indication: 'Endocardite : association synergique avec une bêta-lactamine ou un glycopeptide (ESC 2023 ; SPILF/AEPEI 2025).',
      dose: { type: 'ponderale', valeur: 3, unite: 'mg/kg', frequenceParJour: 1, poidsReference: 'ajuste', seuilObesiteRatio: 1.25 },
      voie: 'IM ou IV',
      modalites: 'perfusion de 30 min, 1 dose par jour',
      statut: 'verifiee_ia',
      sources: [
        S('ESC-2023-endocardite', 'Recommendation Table 7 et 9 (EHJ p. 3977, 3982)', 'Gentamicin 3 mg/kg/day i.v. or i.m. in 1 dose', 'posologie'),
        S('SPILF-AEPEI-2025-endocardite', 'diapo 16', 'Gentamicine : 3 mg/kg/j', 'posologie'),
        S(SRC_DOSES_2026, 'Annexe 9 (aminosides)', 'Pour les streptocoques et les entérocoques, une posologie plus faible de 3 mg/kg/jour est utilisable en cas d\'association synergique', 'posologie'),
      ],
      remarques: 'Poids en cas d\'obésité : le RCP gentamicine indique poids idéal (Lorentz) + 0,43 × surcharge ; l\'application calcule Devine + 0,4 × excès (écart signalé au relecteur du moteur).',
    },
    {
      // Audit relecteur 2 (2026-11-05) : ajout. Le schéma probabiliste SPILF/AEPEI de l'endocardite indique
      // 5 mg/kg/j de gentamicine (sepsis uniquement) ; la règle affichait la dose synergique de 3 mg/kg.
      id: 'gentamicine-5-ei-proba',
      libelle: '5 mg/kg/j (endocardite, probabiliste, uniquement si sepsis — SPILF/AEPEI)',
      indication: 'Endocardite sur valve native ou prothèse tardive, traitement probabiliste avec sepsis : amoxicilline + céfazoline + gentamicine (SPILF/AEPEI 2025).',
      dose: { type: 'ponderale', valeur: 5, unite: 'mg/kg', frequenceParJour: 1, poidsReference: 'ajuste', seuilObesiteRatio: 1.25 },
      voie: 'IV',
      modalites: 'perfusion de 30 min, 1 dose par jour ; arrêt à l\'identification ou au plus tard à la négativation des hémocultures',
      statut: 'verifiee_ia',
      sources: [
        S('SPILF-AEPEI-2025-endocardite', 'diapo 6', 'Amoxicilline IV (200 mg/kg/jour) + céfazoline IV (100 mg/kg/jour) + (gentamicine IV (5 mg/kg/jour) uniquement chez les patients en sepsis)', 'posologie'),
        S('ANSM-2011-aminosides', 'p. 6', 'gentamicine, tobramycine : 3 à 8 mg/kg/jour', 'posologie'),
      ],
      remarques: 'ESC 2023 (Recommendation Table 10) : gentamicine 3 mg/kg/j dans le schéma empirique. Divergence affichée ; position SPILF/AEPEI retenue (ARBITRAGES).',
    },
    {
      id: 'gentamicine-6-7',
      libelle: '6-7 mg/kg en dose unique journalière (infections sévères à BGN, en association)',
      indication: 'Association à une bêta-lactamine en cas de sepsis ; dose du tableau SPILF/SFPT/CA-SFM (haut de la fourchette ANSM 3-8 mg/kg).',
      dose: { type: 'ponderale', valeur: 6, unite: 'mg/kg', frequenceParJour: 1, poidsReference: 'ajuste', seuilObesiteRatio: 1.25 },
      voie: 'IV',
      modalites: 'perfusion de 30 min, dose unique journalière',
      statut: 'verifiee_ia',
      sources: [S(SRC_DOSES_2026, 'Annexe 9 (aminosides)', 'Gentamicine 6 à 7 mg/kg en perfusions de 30 min en dose unique journalière', 'posologie'), S('ANSM-2011-aminosides', 'p. 6', 'gentamicine, tobramycine : 3 à 8 mg/kg/jour', 'posologie')],
      remarques: 'Divergence documentée : ANSM 2011 et RCP 3-8 mg/kg/j ; SPILF/SFPT/CA-SFM 2026 : 6-7 mg/kg.',
    },
    // Méningite à Listeria (docs/sources/recherche-meningites.md §1) : indication présente dans le RCP (§4.1), posologie du RCP non relue ici ;
    // brouillon tant que la révision SPILF n'est pas publiée (note §9). Adaptation rénale : celle de la molécule (RCP) —
    // même dose à chaque injection, intervalle guidé par la résiduelle : aucun plafond du schéma standard sous la dose méningée.
    {
      id: 'gentamicine-5-listeria',
      libelle: '5 mg/kg/j, les 5 premiers jours — méningite à Listeria (ou suspicion), en association à l\'amoxicilline',
      indication: 'Méningite à bacille à Gram positif ou à Listeria, examen direct négatif avec arguments pour une listériose : amoxicilline + gentamicine (SPILF 2018).',
      dose: { type: 'ponderale', valeur: 5, unite: 'mg/kg', frequenceParJour: 1, poidsReference: 'ajuste', seuilObesiteRatio: 1.25 },
      voie: 'IV',
      modalites: 'Une perfusion de 30 min par jour, les 5 premiers jours seulement. SPILF 2018 : 5 à 6 mg/kg/j dans le texte (§12.8.1.3), 5 mg/kg/j dans les tableaux (divergence mineure, la valeur des tableaux est affichée). Poids de référence non précisé par la SPILF : l\'application reprend le poids ajusté des autres schémas de gentamicine (formule du RCP) ; le seuil d\'obésité de 1,25 est un choix de l\'application, non sourcé.',
      statut: 'brouillon',
      sources: [
        S('SPILF-2018-meningites', 'p. 21, §12.8.1.3 ; Tableau 8', '[reformulation] gentamicine 5–6 mg/kg/j en une dose sur 30 min (le Tableau 8 indique « 5 mg/kg/day IV in adults »)', 'posologie'),
        S('SPILF-2018-meningites', 'p. 28-29, §14.1.3', '[reformulation] gentamicine 5 mg/kg/j en une perfusion de 30 min les 5 premiers jours', 'duree'),
      ],
    },
    // Pneumonie associée aux soins de réanimation (docs/sources/recherche-pneumonies.md §8) : dose du protocole SFAR,
    // affichée sans calcul (avis d'experts, correspondance molécule/posologie reconstituée, nombre d'injections non précisé).
    {
      id: 'gentamicine-pavm',
      libelle: '8 mg/kg/j (protocole SFAR/SRLF 2017, pneumonie de réanimation avec choc) — avis d\'experts',
      indication: 'Pneumonie associée aux soins de réanimation, précoce, avec choc, sans facteur de risque de BMR : bêta-lactamine + aminoside (SFAR/SRLF 2017, protocole n° 4).',
      dose: { type: 'ponderale', valeur: 8, unite: 'mg/kg', poidsReference: 'ajuste', seuilObesiteRatio: 1.25, texte: '8 mg/kg/j (SFAR/SRLF 2017, protocole n° 4, « à titre indicatif ») — nombre d\'administrations non précisé, dose non calculée ; ANSM 2011 : 3 à 8 mg/kg/j ; SPILF/SFPT/CA-SFM 2026 : 6 à 7 mg/kg' },
      voie: 'IV',
      modalites: 'IV ; modalités non précisées par le protocole SFAR (posologies « à titre indicatif »)',
      statut: 'brouillon',
      sources: [
        S('SFAR-SRLF-2017-PAS-rea', 'protocole n° 4, p. 23', 'Posologies données à titre indicatif pour un patient avec fonction rénale normale et poids standard', 'posologie'),
        S('ANSM-2011-aminosides', 'p. 6', 'gentamicine, tobramycine : 3 à 8 mg/kg/jour', 'posologie'),
      ],
      remarques: 'Correspondance molécule/posologie du protocole n° 4 reconstituée (note de recherche §8, confiance moyenne).',
    },
  ],
  adaptationRenale: {
    methode: 'Cockcroft',
    statut: 'verifiee_ia',
    texteGeneral: 'Première injection à la dose habituelle ; réinjections à la même dose, espacées selon la résiduelle (< 0,5 mg/L) ou, à défaut, selon la clairance.',
    paliers: [
      { clcrMin: 60, texte: 'ClCr 60-90 mL/min : réinjection toutes les 24 h si dosage impossible.', sources: [S('RCP-gentamicine', '§4.2', 'ClCr 90-60 ml/min : 24 h', 'adaptation_renale')] },
      { clcrMin: 40, clcrMax: 60, texte: 'ClCr 40-60 mL/min : réinjection toutes les 36 h si dosage impossible ; dosage de la résiduelle recommandé.', sources: [S('RCP-gentamicine', '§4.2', '60-40 : 36 h', 'adaptation_renale')] },
      { clcrMin: 20, clcrMax: 40, texte: 'ClCr 20-40 mL/min : réinjection toutes les 48 h si dosage impossible ; dosage de la résiduelle recommandé.', sources: [S('RCP-gentamicine', '§4.2', '40-20 : 48 h', 'adaptation_renale')] },
      { clcrMax: 20, texte: 'ClCr < 20 mL/min : dosage impératif de la résiduelle avant toute réinjection ; privilégier 1 ou 2 injections au total.', sources: [S('RCP-gentamicine', '§4.2', '< 20 : dosage impératif de la résiduelle', 'adaptation_renale')] },
    ],
    hemodialyse: { texte: 'RCP : injections 2 à 4 h avant la séance de dialyse (pour limiter la toxicité) ; divergence avec la règle « après séance » des autres antibiotiques ; avis pharmacologique.', sources: [S('RCP-gentamicine', '§4.2', 'les injections doivent se faire 2 à 4 heures avant la séance de dialyse', 'adaptation_renale')] },
    eerContinue: { texte: 'Réinjection guidée par la résiduelle ; posologie non déterminable sans dosage.', sources: [S('RCP-gentamicine', '§4.2', 'réinjections […] sauf adaptation selon le pic', 'adaptation_renale')] },
  },
  surveillance: [
    {
      id: 'gentamicine-renal',
      type: 'biologique',
      categorie: 'systematique',
      quoi: 'Créatininémie avant la 1re dose puis pendant le traitement',
      quand: { ancre: 'avant_traitement', texte: 'Avant la 1re dose, puis régulièrement (fréquence non chiffrée par les sources)', repetition: 'avec chaque résiduelle' },
      pourquoi: 'Néphrotoxicité ; conditionne l\'intervalle entre les doses.',
      statut: 'verifiee_ia',
      sources: [S('RCP-gentamicine', '§4.4', 'surveillance rénale et auditive recommandée', 'surveillance'), S('ANSM-2011-aminosides', 'p. 8', 's\'accompagner d\'une surveillance de la fonction rénale', 'surveillance')],
    },
    {
      id: 'gentamicine-duree-ei',
      type: 'clinique',
      categorie: 'systematique',
      quoi: 'Limiter la durée : 2 semaines (ESC 2023) ou jusqu\'à négativation des hémocultures (SPILF/AEPEI) en endocardite ; ≤ 5 jours hors endocardite',
      quand: { ancre: 'debut_traitement', offsetHeures: 48, texte: 'Réévaluation à 48-72 h puis à chaque résultat d\'hémoculture' },
      pourquoi: 'Toxicité cumulative rénale et cochléo-vestibulaire.',
      statut: 'verifiee_ia',
      sources: [S('ANSM-2011-aminosides', 'p. 7', 'il pourra être poursuivi au maximum 5 jours', 'duree'), S('SPILF-AEPEI-2025-endocardite', 'diapo 15', 'Gentamicine [jusqu\'à] Hémocultures stériles', 'duree'), S('ESC-2023-endocardite', 'Recommendation Table 8', 'gentamicin for 2 weeks', 'duree')],
    },
    {
      id: 'gentamicine-audition',
      type: 'clinique',
      categorie: 'conditionnelle',
      quoi: 'Surveillance auditive et vestibulaire (acouphènes, hypoacousie, vertiges)',
      quand: { ancre: 'quotidien', texte: 'À chaque évaluation ; audiogramme si traitement prolongé (fréquence non chiffrée)' },
      pourquoi: 'Ototoxicité, accrue au-delà de 5-7 jours.',
      conditionId: 'duree_sup_3j',
      conditionTexte: 'si traitement > 3 jours',
      statut: 'verifiee_ia',
      sources: [S('RCP-gentamicine', '§4.4', 'toxicités rénale et auditive augmentent au-delà de 5-7 jours', 'surveillance')],
    },
  ],
  stp: [
    {
      id: 'gentamicine-pic',
      parametre: 'pic',
      categorie: 'conditionnelle',
      indication: 'Patients sévères (choc, réanimation, obésité morbide, neutropénie fébrile…) ; pas systématique si traitement ≤ 3 jours sans modification PK.',
      premierPrelevement: { quand: 'après la 1re dose', position: '30 minutes après la fin de la perfusion de 30 minutes', numeroDose: 1, offsetHeuresApresFinPerfusion: 0.5 },
      repetition: 'après modification de dose',
      // Audit relecteur 2 : « pour la dose de 6-8 mg/kg » retiré du texte de cible (non écrit dans l'ANSM, qui applique le tableau 1 sans distinction de dose).
      cible: { min: 30, max: 40, unite: 'mg/L', verifiee: true, texte: '30 à 40 mg/L (ANSM 2011, tableau 1)' },
      limites: 'Les sources lues ne fixent pas de cible de pic pour la dose synergique de 3 mg/kg de l\'endocardite (ANSM 2011 p. 5 : schémas d\'endocardite traités à part) : interprétation par un pharmacologue dans ce contexte.',
      conduite: 'Pic inférieur à la cible : augmenter la posologie de l\'injection suivante.',
      conditionId: 'patient_severe',
      conditionTexte: 'si patient sévère (ANSM 2011 : choc septique, réanimation sous ventilation, brûlé, neutropénie fébrile, obésité morbide, polytraumatisé) ; l\'application l\'applique aussi en cas de sepsis, d\'IRA ou d\'EER',
      statut: 'verifiee_ia',
      sources: [S('ANSM-2011-aminosides', 'p. 8, tableau 1', 'gentamicine, nétilmicine, tobramycine : pic 30 à 40 mg/l', 'surveillance'), S('RCP-gentamicine', '§4.2', 'Pic : 30 min après la fin de la perfusion, après la première injection […] chez des patients sévères', 'surveillance')],
    },
    {
      // Audit relecteur 2 (2026-11-05) : ajout (même raisonnement que l'amikacine ; RCP gentamicine explicite).
      id: 'gentamicine-residuelle-ir',
      parametre: 'residuelle',
      categorie: 'conditionnelle',
      indication: 'Insuffisance rénale : dosage de la résiduelle avant toute réinjection ; à défaut de dosage, réinjection selon la clairance (RCP : 36 h si 40-60, 48 h si 20-40 mL/min) ; < 20 mL/min : dosage impératif.',
      premierPrelevement: { quand: 'avant la 2e injection (au moment prévu de la réinjection), puis avant chaque réinjection', position: 'juste avant la réinjection envisagée', numeroDose: 2, avantDoseSuivante: true },
      repetition: 'avant chaque réinjection, avec la créatininémie',
      cible: { max: 0.5, unite: 'mg/L', verifiee: true, texte: '< 0,5 mg/L avant réinjection (ANSM 2011, tableau 1)' },
      limites: 'Sans épuration extrarénale : pas de réinjection tant que la résiduelle reste au-dessus du seuil.',
      conduite: 'Résiduelle ≥ 0,5 mg/L : ne pas réinjecter, redoser ; réinjections à la même dose que la première.',
      conditionId: 'insuffisance_renale',
      conditionTexte: 'si insuffisance rénale (paliers RCP à partir de ClCr < 60 mL/min), IRA ou dialyse',
      statut: 'verifiee_ia',
      sources: [
        S('RCP-gentamicine', '§4.2', 'réinjections à la même dose que celle de la première injection ; < 20 : dosage impératif de la résiduelle', 'surveillance'),
        S('ANSM-2011-aminosides', 'p. 8', 'Des taux résiduels (Cmin) supérieurs à ceux donnés dans le tableau 1, nécessitent d\'espacer les injections', 'surveillance'),
      ],
    },
    {
      id: 'gentamicine-residuelle',
      parametre: 'residuelle',
      categorie: 'conditionnelle',
      indication: 'Traitement > 5 jours (dosage après 48 h de traitement) ; en endocardite (traitement de 2 semaines) la résiduelle est donc indiquée ; en insuffisance rénale, voir aussi le dosage avant chaque réinjection.',
      premierPrelevement: { quand: 'après 48 h de traitement', position: 'juste avant la dose suivante (Abdul-Aziz 2020 ; non explicité par l\'ANSM)', numeroDose: 3, avantDoseSuivante: true },
      repetition: '2 fois par semaine, avec surveillance de la fonction rénale',
      cible: { max: 0.5, unite: 'mg/L', verifiee: true, texte: '< 0,5 mg/L (ANSM 2011, tableau 1)' },
      limites: 'Ne pas réinjecter tant que la résiduelle est au-dessus du seuil (hors épuration extrarénale).',
      conduite: 'Résiduelle supérieure à la cible : espacer les injections.',
      conditionId: 'duree_sup_5j_ou_insuffisance_renale',
      conditionTexte: 'si traitement > 5 jours ou insuffisance rénale',
      statut: 'verifiee_ia',
      sources: [S('ANSM-2011-aminosides', 'p. 8', 'Un dosage de la concentration résiduelle est nécessaire uniquement si la durée de traitement est > 5 jours […] ou en cas d\'insuffisance rénale', 'surveillance'), S('ABDUL-AZIZ-2020-TDM', 'Table 4', 'Gentamicin/tobramycin < 0.5 mg/L', 'surveillance')],
    },
  ],
  grossesse: { statut: 'utilisable', texte: 'Gentamicine utilisable quel que soit le terme, dose unique journalière, durée courte ; dépistage auditif néonatal à prévoir si traitement prolongé.', sources: [S('CRAT-aminosides-grossesse', 'En pratique', 'amikacine, gentamicine, tobramycine utilisables à tout terme', 'autre')] },
  interactionsPertinentes: [
    { avec: 'autre_nephrotoxique', texte: 'Néphrotoxicité additive : surveillance rénale renforcée.', sources: [S('ANSM-2011-aminosides', 'p. 6', 'association à des facteurs risquant d\'augmenter la toxicité rénale', 'surveillance')] },
    { avec: 'diuretique', texte: 'Diurétiques de l\'anse : risque accru d\'ototoxicité et de néphrotoxicité.', sources: [S('ANSM-2011-aminosides', 'p. 6', 'association à des facteurs risquant d\'augmenter la toxicité rénale', 'surveillance')] },
  ],
};

/* ------------------------------------------------------------------ */
/* VANCOMYCINE                                                         */
/* ------------------------------------------------------------------ */

export const vancomycine: Molecule = {
  id: 'vancomycine',
  dci: 'Vancomycine',
  famille: 'glycopeptide',
  statut: 'verifiee_ia',
  regimens: [
    {
      id: 'vancomycine-continu',
      libelle: 'Dose de charge puis perfusion continue (30 mg/kg/j)',
      indication: 'Infections sévères à staphylocoques résistants à la méticilline ou allergie aux bêta-lactamines (endocardite : schéma SPILF/AEPEI 2025).',
      chargeInitiale: { libelle: 'Dose de charge', type: 'ponderale', valeur: 25, unite: 'mg/kg', poidsReference: 'total', doseMaxParAdministration: { valeur: 3, unite: 'g' } },
      dose: { type: 'ponderale', valeur: 30, unite: 'mg/kg', continue: true, poidsReference: 'total' },
      voie: 'IV',
      modalites: 'dose de charge en perfusion de 1 à 2 h (20-30 mg/kg, poids réel, max 3 g), puis perfusion continue sur 24 h ; débit ajusté sur le plateau',
      statut: 'verifiee_ia',
      sources: [
        S(SRC_DOSES_2026, 'Annexe 9 (glycopeptides, p. 169 de la version 2025)', 'dose de charge de 20 à 30 mg/kg en perfusion de 1 à 2 h, puis dose d\'entretien de 20 à 40 mg/kg/jour', 'posologie'),
        S('SPILF-AEPEI-2025-endocardite', 'diapo 16', 'Vancomycine : 30 mg/kg/j IV perf continue après dose de charge de 20-30 mg/kg', 'posologie'),
        S('ASHP-IDSA-2020-vancomycine-STP', 'Rec. 10 ; dose de charge', 'a loading dose of 15 to 20 mg/kg, followed by daily maintenance CI of 30 to 40 mg/kg […] target steady-state concentration of 20 to 25 mg/L ; Loading doses should be based on actual body weight and not exceed 3,000 mg', 'posologie'),
      ],
      // Audit relecteur 2 : attribution Rybak corrigée (20-35 mg/kg = administration discontinue ; 15-20 mg/kg = perfusion continue, Rec. 10).
      remarques: 'Dose de charge : 20-30 mg/kg (SPILF/SFPT/CA-SFM ; SPILF/AEPEI), 25-30 mg/kg (RCP, présentation péjorative) ; Rybak 2020 : 15-20 mg/kg avant perfusion continue (Rec. 10), 20-35 mg/kg en discontinu. La valeur de 25 mg/kg est un choix médian de l\'application, plafonné à 3 g (Rybak). Vitesse : le RCP limite la perfusion à 10 mg/min (≥ 1 h), ce qu\'une charge de 2-3 g en 1-2 h dépasse : durée de perfusion à ajuster (divergence RCP / SPILF « 1 à 2 h »).',
    },
    {
      id: 'vancomycine-discontinu',
      libelle: 'Administration discontinue : 15-20 mg/kg toutes les 8 à 12 h',
      indication: 'Alternative à la perfusion continue ; RCP.',
      chargeInitiale: { libelle: 'Dose de charge (optionnelle, présentation sévère)', type: 'ponderale', valeur: 25, unite: 'mg/kg', poidsReference: 'total', doseMaxParAdministration: { valeur: 3, unite: 'g' } },
      dose: { type: 'ponderale', valeur: 15, unite: 'mg/kg', frequenceParJour: 2, poidsReference: 'total', doseMaxParAdministration: { valeur: 2, unite: 'g' } },
      voie: 'IV',
      modalites: 'perfusion d\'au moins 1 h (≤ 10 mg/min), toutes les 8 à 12 h selon la fonction rénale ; dose affichée pour un intervalle de 12 h (15 mg/kg), jusqu\'à 20 mg/kg/8 h',
      statut: 'verifiee_ia',
      sources: [
        S('RCP-vancomycine', '§4.2', 'La dose recommandée est de 15 à 20 mg/kg de poids corporel toutes les 8 à 12 h (ne pas dépasser 2 g par dose)', 'posologie'),
        S('ASHP-IDSA-2020-vancomycine-STP', 'Rec. 1', 'Doses of 15 to 20 mg/kg (based on actual body weight) administered every 8 to 12 hours', 'posologie'),
      ],
    },
    // Méningite, allergie grave aux bêta-lactamines (docs/sources/recherche-meningites.md §1 Tableau 10 ; RCP non relu pour la méningite).
    {
      id: 'vancomycine-meninge',
      libelle: 'Charge 30 mg/kg sur 1 h puis 40 à 60 mg/kg/j — méningite, allergie grave aux bêta-lactamines (avis infectiologique)',
      indication: 'Méningite à pneumocoque ou à examen direct négatif chez un patient allergique grave aux bêta-lactamines, en association à la rifampicine (SPILF 2018, Tableau 10).',
      chargeInitiale: { libelle: 'Dose de charge sur 1 h', type: 'ponderale', valeur: 30, unite: 'mg/kg', poidsReference: 'total' },
      dose: { type: 'ponderale', valeur: 40, unite: 'mg/kg', poidsReference: 'total', texte: '40 à 60 mg/kg/j après la dose de charge ; concentration résiduelle cible 15 à 20 mg/L (SPILF 2018, Tableau 10)' },
      voie: 'IV',
      modalites: 'Rythme d\'administration non précisé par la source ; avis infectiologique obligatoire. RCP de la vancomycine non relu pour la méningite. Dose de charge sans plafond dans la source (au-delà de 100 kg, elle dépasse les 3 g des autres schémas de vancomycine : divergence non tranchée). Poids de référence non précisé par la source (poids réel retenu par l\'application).',
      statut: 'brouillon',
      sources: [S('SPILF-2018-meningites', 'Tableau 10 p. 24', '[reformulation] vancomycine (charge 30 mg/kg sur 1 h puis 40–60 mg/kg/j, résiduelle 15–20 mg/L)', 'posologie')],
      // Les paliers du RCP (15 à 20 mg/kg par administration) visent la posologie standard : pas sous la dose méningée.
      adaptationRenale: {
        methode: 'Cockcroft',
        statut: 'brouillon',
        texteGeneral: 'Dose méningée : aucune adaptation rénale chiffrée dans les sources lues ; entretien guidé par la concentration résiduelle (15 à 20 mg/L, SPILF 2018).',
        paliers: [
          { clcrMin: 50, texte: 'ClCr ≥ 50 mL/min : schéma habituel de la dose méningée, ajusté sur la concentration résiduelle (cible 15 à 20 mg/L, SPILF 2018).', sources: [S('SPILF-2018-meningites', 'Tableau 10 p. 24', '[reformulation] résiduelle 15–20 mg/L', 'adaptation_renale')] },
          {
            clcrMax: 50,
            texte: 'ClCr < 50 mL/min : dose de charge non réduite (RCP) ; entretien de la dose méningée guidé par la concentration résiduelle (cible 15 à 20 mg/L, SPILF 2018), avec avis pharmacologique. Les paliers du RCP visent la posologie standard et ne s\'appliquent pas à la dose méningée.',
            sources: [S('RCP-vancomycine', '§4.2', 'Chez les patients avec insuffisance rénale légère ou modérée, la dose initiale ne doit pas être diminuée', 'adaptation_renale'), S('SPILF-2018-meningites', 'Tableau 10 p. 24', '[reformulation] résiduelle 15–20 mg/L', 'adaptation_renale')],
          },
        ],
        hemodialyse: { texte: 'Hémodialyse intermittente : non traitée par les sources lues pour la dose méningée ; dosages (cible résiduelle 15 à 20 mg/L, SPILF 2018) et avis pharmacologique.', sources: [S('SPILF-2018-meningites', 'Tableau 10 p. 24', '[reformulation] résiduelle 15–20 mg/L', 'adaptation_renale')] },
        eerContinue: { texte: 'Épuration extrarénale continue : non traitée par les sources lues pour la dose méningée ; dosages (cible résiduelle 15 à 20 mg/L, SPILF 2018) et avis pharmacologique.', sources: [S('SPILF-2018-meningites', 'Tableau 10 p. 24', '[reformulation] résiduelle 15–20 mg/L', 'adaptation_renale')] },
      },
    },
    // Pneumonie associée aux soins de réanimation avec facteur de risque de SARM (docs/sources/recherche-pneumonies.md §8).
    {
      id: 'vancomycine-pavm',
      libelle: '15 mg/kg puis 30 à 40 mg/kg/j (protocole SFAR/SRLF 2017, facteur de risque de SARM) — avis d\'experts',
      indication: 'Pneumonie associée aux soins de réanimation avec facteur de risque de SARM (SFAR/SRLF 2017, R3.3 et protocole n° 4).',
      dose: { type: 'ponderale', valeur: 30, unite: 'mg/kg', poidsReference: 'total', texte: '15 mg/kg puis 30 à 40 mg/kg/j (SFAR/SRLF 2017, protocole n° 4, « à titre indicatif ») — mode d\'administration non précisé, dose non calculée ; adaptation sur les concentrations' },
      voie: 'IV',
      modalites: 'IV ; mode d\'administration (continu ou discontinu) non précisé par le protocole SFAR',
      statut: 'brouillon',
      sources: [
        S('SFAR-SRLF-2017-PAS-rea', 'protocole n° 4, p. 23', '15 mg/kg puis 30 à 40 mg/kg/j', 'posologie'),
        S('SFAR-SRLF-2017-PAS-rea', 'protocole n° 4, p. 23', 'Posologies données à titre indicatif pour un patient avec fonction rénale normale et poids standard', 'posologie'),
      ],
      remarques: 'Correspondance molécule/posologie du protocole n° 4 reconstituée (note de recherche §8, confiance moyenne).',
    },
  ],
  adaptationRenale: {
    methode: 'Cockcroft',
    statut: 'verifiee_ia',
    texteGeneral: 'Dose initiale (charge) non réduite ; entretien guidé par les concentrations ; prolonger l\'intervalle plutôt que réduire la dose.',
    paliers: [
      { clcrMin: 50, texte: 'ClCr ≥ 50 mL/min : schéma habituel, adaptation sur les concentrations.', sources: [S('RCP-vancomycine', '§4.2', 'Chez les patients avec insuffisance rénale légère ou modérée, la dose initiale ne doit pas être diminuée', 'adaptation_renale')] },
      { clcrMin: 20, clcrMax: 50, texte: 'ClCr 20-49 mL/min : 15 à 20 mg/kg pouvant être administrée toutes les 24 h (discontinu) ; adaptation sur les concentrations.', sources: [S('RCP-vancomycine', '§4.2', 'ClCr 20-49 mL/min : 15 à 20 mg/kg pouvant être administrée toutes les 24 heures', 'adaptation_renale')] },
      { clcrMax: 20, texte: 'ClCr < 20 mL/min : doses fondées sur les concentrations résiduelles et la fonction rénale résiduelle ; prolonger l\'intervalle.', sources: [S('RCP-vancomycine', '§4.2', 'basés sur les taux sériques résiduels de vancomycine et sur la fonction rénale résiduelle', 'adaptation_renale')] },
    ],
    hemodialyse: { texte: 'Concentration pré-dialyse cible 15-20 mg/L, dosage au moins hebdomadaire, jamais pendant ni dans les 2 h suivant la séance ; dose d\'entretien 7,5-15 mg/kg après ou pendant la séance selon la membrane (Rybak 2020, Table 2).', sources: [S('ASHP-IDSA-2020-vancomycine-STP', 'Rec. 14, Table 2', 'Maintaining predialysis concentrations between 15 and 20 mg/L is likely to achieve the AUC of 400 to 600', 'adaptation_renale')] },
    eerContinue: { texte: 'Charge 20-25 mg/kg (poids réel) puis 7,5-10 mg/kg toutes les 12 h pour un débit d\'effluent de 20-25 mL/kg/h ; dosage dans les 24 premières heures.', sources: [S('ASHP-IDSA-2020-vancomycine-STP', 'Rec. 16', 'Loading doses of 20 to 25 mg/kg by actual body weight should be used in patients receiving CRRT ; 7.5 to 10 mg/kg every 12 hours', 'adaptation_renale')] },
  },
  surveillance: [
    {
      id: 'vancomycine-renal',
      type: 'biologique',
      categorie: 'systematique',
      // Audit relecteur 2 (2026-11-05) : correction. La fréquence « hebdomadaire / quotidienne » de Rybak 2020 porte sur
      // les dosages de vancomycine (vérifié dans le texte OUP le 2026-11-05), pas sur la créatininémie : aucune source lue
      // ne chiffre la fréquence de la créatininémie (cf. PERIMETRE, limites connues).
      quoi: 'Créatininémie avant traitement puis régulièrement, en particulier avec chaque dosage de vancomycine',
      quand: { ancre: 'avant_traitement', texte: 'Avant la 1re dose, puis « périodiquement » (RCP) ; fréquence non chiffrée par les sources lues — à rapprocher des dosages de vancomycine', repetition: 'périodique (non chiffrée)' },
      pourquoi: 'Néphrotoxicité (définition Rybak 2020 : créatinine ≥ +0,5 mg/dL ou +50 % sur des dosages quotidiens consécutifs), majorée par les aminosides et la pipéracilline-tazobactam.',
      statut: 'verifiee_ia',
      sources: [S('RCP-vancomycine', '§4.4', 'bilans « périodiquement » (NFS, urines, fonction rénale et hépatique)', 'surveillance'), S('ASHP-IDSA-2020-vancomycine-STP', 'néphrotoxicité (texte)', 'an increase in the serum creatinine (SCr) level of ≥0.5 mg/dL, or a 50% increase from baseline in consecutive daily readings', 'definition')],
    },
    {
      id: 'vancomycine-audition',
      type: 'clinique',
      categorie: 'conditionnelle',
      quoi: 'Contrôle de la fonction auditive',
      quand: { ancre: 'non_determine', texte: 'Régulier en cas de traitement prolongé ou de fortes doses (fréquence non chiffrée)' },
      pourquoi: 'Ototoxicité, surtout si aminosides associés ou insuffisance rénale.',
      conditionId: 'duree_sup_7j',
      conditionTexte: 'si traitement prolongé (> 7 jours) ou aminoside associé',
      statut: 'verifiee_ia',
      sources: [S('RCP-vancomycine', '§4.4', 'un contrôle régulier de la fonction auditive est recommandé', 'surveillance')],
    },
  ],
  stp: [
    {
      id: 'vancomycine-plateau',
      parametre: 'plateau',
      categorie: 'systematique',
      indication: 'Perfusion continue : concentration à l\'état d\'équilibre (plateau), à tout moment de la perfusion.',
      premierPrelevement: { quand: 'dès l\'état d\'équilibre, dans les 24-48 premières heures (Rybak : exposition cible « within the first 24 to 48 hours ») ; moment exact du 1er dosage non précisé par les sources françaises', position: 'à tout moment pendant la perfusion continue (Abdul-Aziz 2020)', jour: 2 },
      repetition: 'hebdomadaire si hémodynamique stable ; plus fréquente, voire quotidienne, si instable (Rybak 2020, Rec. 5 : fréquence « based on clinical judgment »)',
      cible: { min: 20, max: 25, unite: 'mg/L', verifiee: true, texte: '20 à 25 mg/L (SPILF/SFPT/CA-SFM 2026 ; Rybak 2020 ; Abdul-Aziz 2020) ; ASC 400-600 mg·h/L = plateau × 24' },
      limites: 'La cible « 20-30 mg/L » qui circule correspond à la téicoplanine, pas à la vancomycine. Interprétable seulement à l\'équilibre.',
      conduite: 'Ajuster le débit de perfusion ; prolonger l\'intervalle/réduire en cas de surdosage ou d\'élévation de la créatinine.',
      conditionId: 'perfusion_continue',
      conditionTexte: 'si perfusion continue',
      statut: 'verifiee_ia',
      sources: [
        S(SRC_DOSES_2026, 'Annexe 9 (glycopeptides)', 'administration continue, objectif de concentration plasmatique au plateau entre 20 et 25 mg/L ; objectif d\'ASC entre 400 et 600', 'surveillance'),
        S('ASHP-IDSA-2020-vancomycine-STP', 'Rec. 3, Rec. 10', 'target steady-state concentration of 20 to 25 mg/L', 'surveillance'),
        S('ABDUL-AZIZ-2020-TDM', 'Table 4', 'Css: 20–25 mg/L', 'surveillance'),
      ],
    },
    {
      id: 'vancomycine-residuelle',
      parametre: 'residuelle',
      categorie: 'systematique',
      indication: 'Administration discontinue : résiduelle (et si possible ASC par approche bayésienne, méthode préférée du consensus 2020).',
      // Audit relecteur 2 : numeroDose (4) retiré — avec un intervalle de 8 ou 12 h, la « 4e dose » ne correspond pas au J2
      // du RCP et le calendrier la plaçait à H72 ; le jour 2 (RCP) est conservé comme repère.
      premierPrelevement: { quand: 'le 2e jour de traitement (RCP) / dans les 24-48 h (Rybak)', position: 'immédiatement avant la dose suivante (résiduelle) ; pour l\'ASC : 1-2 h après la fin de perfusion et en fin d\'intervalle', jour: 2, avantDoseSuivante: true },
      repetition: 'hebdomadaire si hémodynamique stable ; plus fréquente, voire quotidienne, si instable (Rybak 2020, Rec. 5 : fréquence « based on clinical judgment »)',
      cible: { min: 15, max: 20, unite: 'mg/L', verifiee: true, texte: 'résiduelle 15-20 mg/L et ASC/CMI 400-600 (CMI ≤ 1 mg/L) — SPILF/SFPT/CA-SFM 2026 ; Rybak 2020 : le creux seul « n\'est plus recommandé », préférer l\'ASC' },
      limites: 'Divergence : RCP 10-20 mg/L (15-20 si CMI ≥ 1) ; Rybak 2020 recommande le pilotage par l\'ASC plutôt que par la résiduelle seule.',
      conduite: 'Adapter la dose ou l\'intervalle ; prolonger l\'intervalle en insuffisance rénale.',
      conditionId: 'perfusion_intermittente_hors_hemodialyse',
      conditionTexte: 'si administration discontinue (hors hémodialyse)',
      statut: 'verifiee_ia',
      sources: [
        S('RCP-vancomycine', '§4.2', 'mesurée le deuxième jour de traitement, immédiatement avant la dose suivante', 'surveillance'),
        S(SRC_DOSES_2026, 'Annexe 9 (glycopeptides)', 'administration discontinue, objectif de concentration plasmatique résiduelle entre 15 et 20 mg/L ; objectif d\'ASC entre 400 et 600', 'surveillance'),
        S('ASHP-IDSA-2020-vancomycine-STP', 'Rec. 2, Rec. 4', 'Trough-only monitoring, with a target of 15 to 20 mg/L, is no longer recommended', 'surveillance'),
      ],
    },
    {
      id: 'vancomycine-predialyse',
      parametre: 'residuelle',
      categorie: 'systematique',
      indication: 'Hémodialyse intermittente : concentration pré-dialyse.',
      premierPrelevement: { quand: 'avant la séance de dialyse suivant la dose de charge', position: 'avant la séance ; jamais pendant ni dans les 2 h suivant la dialyse' },
      repetition: 'au moins une fois par semaine',
      cible: { min: 15, max: 20, unite: 'mg/L', verifiee: true, texte: '15 à 20 mg/L avant dialyse (Rybak 2020, Rec. 14)' },
      limites: 'Horaires des séances nécessaires pour planifier le prélèvement.',
      conduite: "Dose d'entretien 7,5-15 mg/kg après ou pendant la séance selon la membrane.",
      conditionId: 'hemodialyse',
      conditionTexte: 'si hémodialyse intermittente',
      statut: 'verifiee_ia',
      sources: [S('ASHP-IDSA-2020-vancomycine-STP', 'Rec. 14, Table 2', 'Predialysis serum concentration monitoring should be performed not less than weekly', 'surveillance')],
    },
  ],
  grossesse: { statut: 'utilisable', texte: 'Utilisable quel que soit le terme ; tenir compte de l\'exposition in utero lors du dépistage auditif néonatal si traitement prolongé.', sources: [S('CRAT-vancomycine-grossesse', 'En pratique', 'la vancomycine peut être utilisée quel que soit le terme de la grossesse', 'autre')] },
  interactionsPertinentes: [
    { avec: 'autre_nephrotoxique', texte: 'Néphrotoxicité additive : surveillance étroite de la créatinine.', sources: [S('RCP-vancomycine', '§4.5', 'Une surveillance étroite du patient est nécessaire, particulièrement en cas d\'administration concomitante d\'aminosides', 'surveillance')] },
  ],
};

/* ------------------------------------------------------------------ */
/* DAPTOMYCINE                                                         */
/* ------------------------------------------------------------------ */

export const daptomycine: Molecule = {
  id: 'daptomycine',
  dci: 'Daptomycine',
  famille: 'lipopeptide',
  statut: 'verifiee_ia',
  regimens: [
    {
      id: 'daptomycine-6',
      libelle: '6 mg/kg/24 h (AMM : bactériémie à S. aureus, endocardite droite)',
      indication: 'Bactériémie à S. aureus (SARM ou allergie), endocardite du cœur droit — posologie de l\'AMM.',
      dose: { type: 'ponderale', valeur: 6, unite: 'mg/kg', frequenceParJour: 1, poidsReference: 'total' },
      voie: 'IV',
      modalites: 'perfusion de 30 min (ou injection de 2 min), 1 fois par 24 h',
      statut: 'verifiee_ia',
      sources: [S('RCP-daptomycine', '§4.2', '6 mg/kg/24 h (bactériémie à S. aureus, endocardite droite)', 'posologie'), S('IDSA-2011-SARM', 'Rec. 19', 'daptomycin 6 mg/kg/dose IV once daily (AI) for at least 2 weeks', 'posologie')],
    },
    {
      id: 'daptomycine-10-12',
      libelle: '10-12 mg/kg/24 h (hors AMM : endocardite, SARM — ESC 2023 10 mg/kg ; SPILF/AEPEI 12 mg/kg)',
      indication: 'Endocardite à staphylocoque ou entérocoque (ESC 2023 : 10 mg/kg ; SPILF/AEPEI 2025 : 12 mg/kg) — hors AMM.',
      dose: { type: 'ponderale', valeur: 10, unite: 'mg/kg', frequenceParJour: 1, poidsReference: 'total' },
      voie: 'IV',
      modalites: 'perfusion de 30 min, 1 fois par 24 h ; dose affichée : 10 mg/kg (ESC), la position française SPILF/AEPEI indique 12 mg/kg',
      statut: 'verifiee_ia',
      sources: [S('ESC-2023-endocardite', 'Recommendation Table 8 (EHJ p. 3980)', 'Daptomycin 10 mg/kg/day i.v. in 1 dose', 'posologie'), S('SPILF-AEPEI-2025-endocardite', 'diapo 16', 'Daptomycine : 12 mg/kg/j', 'posologie'), S('RCP-daptomycine', '§4.2', 'Il n\'y a aucune posologie de 8 à 10 mg/kg pour l\'adulte (hors AMM)', 'posologie')],
      remarques: 'Divergence documentée ESC 10 mg/kg vs SPILF/AEPEI 12 mg/kg ; hors AMM (RCP : 4-6 mg/kg).',
    },
  ],
  adaptationRenale: {
    methode: 'Cockcroft',
    statut: 'verifiee_ia',
    paliers: [
      { clcrMin: 30, texte: 'ClCr ≥ 30 mL/min : pas d\'adaptation.', sources: [S('RCP-daptomycine', '§4.2', 'ClCr < 30 mL/min : […] toutes les 48 heures', 'adaptation_renale')] },
      { clcrMax: 30, texte: 'ClCr < 30 mL/min : même dose unitaire administrée toutes les 48 h.', sources: [S('RCP-daptomycine', '§4.2', 'ClCr < 30 mL/min : 4 ou 6 mg/kg « toutes les 48 heures »', 'adaptation_renale')] },
    ],
    hemodialyse: { texte: 'Même dose toutes les 48 h, administrée après la fin de la dialyse les jours de dialyse.', sources: [S('RCP-daptomycine', '§4.2', 'doit être administré après la fin de la dialyse les jours de dialyse', 'adaptation_renale')] },
    eerContinue: { texte: 'Non précisé dans le RCP lu : avis pharmacologique.', sources: [S('RCP-daptomycine', '§4.2', 'schéma toutes les 48 h en cas de ClCr < 30 mL/min', 'adaptation_renale')] },
  },
  surveillance: [
    {
      id: 'daptomycine-cpk',
      type: 'biologique',
      categorie: 'systematique',
      quoi: 'CPK à l\'initiation puis au moins une fois par semaine (tous les 2-3 jours pendant les 2 premières semaines si ClCr < 80 mL/min, statine, fibrate ou ciclosporine)',
      quand: { ancre: 'avant_traitement', texte: 'Avant la 1re dose, puis au moins 1 fois par semaine', repetition: 'hebdomadaire ; tous les 2-3 jours les 2 premières semaines si facteur de risque' },
      pourquoi: 'Myopathie / rhabdomyolyse.',
      conduite: 'Arrêt si symptômes musculaires inexpliqués avec CPK > 5 × LSN ; interrompre les statines si possible.',
      statut: 'verifiee_ia',
      sources: [S('RCP-daptomycine', '§4.4', 'CPK « à l\'initiation, puis à intervalles réguliers (au moins une fois par semaine) » ; « par ex. tous les 2-3 jours au moins pendant les deux premières semaines »', 'surveillance')],
    },
    {
      id: 'daptomycine-pneumonie-eosino',
      type: 'clinique',
      categorie: 'systematique',
      quoi: 'Surveillance respiratoire (dyspnée, fièvre, infiltrats) — pneumonie à éosinophiles',
      quand: { ancre: 'quotidien', texte: 'À chaque évaluation clinique, surtout après 2 semaines' },
      pourquoi: 'Pneumonie à éosinophiles : arrêt immédiat.',
      conduite: 'Arrêt immédiat de la daptomycine.',
      statut: 'verifiee_ia',
      sources: [S('RCP-daptomycine', '§4.4', 'pneumonie à éosinophiles : arrêt immédiat', 'surveillance')],
    },
  ],
  stp: [
    {
      id: 'daptomycine-residuelle',
      parametre: 'residuelle',
      categorie: 'non_recommande_routine',
      indication: 'Dosage ni recommandé ni déconseillé en routine (position paper 2020) ; peut aider en cas d\'élévation des CPK.',
      premierPrelevement: { quand: '72 h après le début', position: 'juste avant la dose', jour: 4, avantDoseSuivante: true },
      repetition: 'non précisée',
      cible: { max: 24, unite: 'mg/L', verifiee: true, texte: 'Cmin < 24 mg/L (Abdul-Aziz 2020 : Cmin ≥ 24,3 mg/L associée à une élévation des CPK)' },
      limites: 'Pas de recommandation de routine.',
      statut: 'verifiee_ia',
      sources: [S('ABDUL-AZIZ-2020-TDM', 'Table 4', 'Cmin < 24 mg/L (prélèvement 72 h post-initiation of therapy)', 'surveillance')],
    },
  ],
  grossesse: { statut: 'non_verifie', texte: 'Fiche CRAT non consultée lors de la vérification : statut non vérifié.', sources: [] },
  interactionsPertinentes: [
    { avec: 'statine', texte: 'Risque musculaire accru : CPK tous les 2-3 jours les 2 premières semaines ; envisager la suspension de la statine.', sources: [S('RCP-daptomycine', '§4.4', 'statines, fibrates, ciclosporine : CPK tous les 2-3 jours au moins pendant les deux premières semaines', 'surveillance')] },
    { avec: 'immunosuppresseur_calcineurine', texte: 'Ciclosporine : risque musculaire accru, CPK rapprochées.', sources: [S('RCP-daptomycine', '§4.4', 'statines, fibrates, ciclosporine', 'surveillance')] },
  ],
};
