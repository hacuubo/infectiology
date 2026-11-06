import type { Molecule } from '../types';
import { S, SRC_DOSES_2026 } from './base';

const ANSM_FQ = S('ANSM-2023-fluoroquinolones', 'DHPC 02/08/2023', 'Effets « très rares, graves, invalidants, durables et potentiellement irréversibles »', 'surveillance');

function surveillanceFQ(prefix: string, rcp: string) {
  return [
    {
      id: `${prefix}-tendons`,
      type: 'clinique' as const,
      categorie: 'systematique' as const,
      quoi: 'Surveillance tendineuse (douleur, tendinite, rupture), neurologique et psychiatrique ; arrêt au moindre signe',
      quand: { ancre: 'quotidien' as const, texte: 'Dès les premières 48 h et pendant tout le traitement (risque persistant jusqu\'à plusieurs mois après l\'arrêt)' },
      pourquoi: 'Tendinopathies accrues chez le sujet âgé, l\'insuffisant rénal, le greffé et sous corticoïdes ; effets indésirables graves et durables (ANSM 2023).',
      conduite: 'Arrêt immédiat en cas de douleur tendineuse, de signes neurologiques ou psychiatriques.',
      statut: 'verifiee_ia' as const,
      sources: [S(rcp, '§4.4', 'Le risque de tendinite et de rupture de tendon est augmenté chez les patients âgés', 'surveillance'), ANSM_FQ],
    },
    {
      id: `${prefix}-qt`,
      type: 'interaction' as const,
      categorie: 'conditionnelle' as const,
      quoi: 'ECG (QT) si médicament allongeant le QT associé, sujet âgé ou femme',
      quand: { ancre: 'avant_traitement' as const, texte: 'Avant traitement puis selon le contexte' },
      pourquoi: 'Allongement de l\'intervalle QT.',
      conditionId: 'qt_allongeant_associe' as const,
      conditionTexte: 'si médicament allongeant le QT associé',
      statut: 'verifiee_ia' as const,
      sources: [S(rcp, '§4.4', 'Les patients âgés et les femmes peuvent être plus sensibles aux traitements allongeant l\'intervalle QT', 'surveillance')],
    },
    {
      id: `${prefix}-glycemie`,
      type: 'biologique' as const,
      categorie: 'conditionnelle' as const,
      quoi: 'Glycémie chez le diabétique',
      quand: { ancre: 'quotidien' as const, texte: 'Pendant le traitement' },
      pourquoi: 'Dysglycémies.',
      conditionTexte: 'si diabète',
      statut: 'verifiee_ia' as const,
      sources: [S(rcp, '§4.4', 'glycémie chez diabétiques / dysglycémie', 'surveillance')],
    },
  ];
}

export const ciprofloxacine: Molecule = {
  id: 'ciprofloxacine',
  dci: 'Ciprofloxacine',
  famille: 'fluoroquinolone',
  statut: 'verifiee_ia',
  regimens: [
    {
      id: 'cipro-po-500x2',
      libelle: '500 mg toutes les 12 h per os',
      indication: 'PNA / IU masculine sans gravité (pas de fluoroquinolone dans les 6 mois) ; relais documenté.',
      dose: { type: 'fixe', valeur: 500, unite: 'mg', frequenceParJour: 2 },
      voie: 'PO',
      modalites: 'per os toutes les 12 h',
      statut: 'verifiee_ia',
      sources: [S('SPILF-2026-IUM', 'diapo 14, 16', 'ciprofloxacine PO 500 mgx2/jour (en l\'absence de prise de fluoroquinolones dans les 6 mois)', 'posologie'), S('HAS-2021-PNA-femme', 'Antibiothérapie probabiliste', 'Ciprofloxacine : 500 mg 2 fois par jour', 'posologie'), S('SPILF-2015-IU', 'annexe 1, p. 41', 'ciprofloxacine 500 mg PO x 2/jour', 'posologie')],
    },
    {
      id: 'cipro-iv-400x3',
      libelle: '400 mg toutes les 8 h IV (sepsis, allergie aux bêta-lactamines)',
      indication: 'IU masculine avec sepsis/choc et allergie à toutes les bêta-lactamines : ciprofloxacine IV 400 mg ×3 + amikacine (SPILF 2026).',
      dose: { type: 'fixe', valeur: 400, unite: 'mg', frequenceParJour: 3 },
      voie: 'IV',
      modalites: 'perfusion de 60 min toutes les 8 h',
      statut: 'verifiee_ia',
      sources: [S('SPILF-2026-IUM', 'diapo 29', 'Ciprofloxacine IV 400 mgx3/jour OU lévofloxacine IV 500 mgx2/jour ET Amikacine IV 30 mg/kg dose unique', 'posologie'), S(SRC_DOSES_2026, 'Annexe 9 (ciprofloxacine)', 'forte : 0,4 g iv toutes les 8 h', 'posologie')],
    },
    // Prophylaxie des infections invasives à méningocoque (docs/sources/recherche-meningites.md §5, §10.2) : RCP oral lu.
    {
      id: 'cipro-po-500-du',
      libelle: '500 mg per os en dose unique — prophylaxie des infections invasives à méningocoque',
      indication: 'Prophylaxie du portage de méningocoque (instruction DGS 2018 : 2e intention, en cas de contre-indication ou de résistance à la rifampicine, ou d\'infections répétées dans une même communauté ; DGS-Urgent 2025_06 relayé : 1re intention si souche sensible).',
      dose: { type: 'fixe', valeur: 500, unite: 'mg', frequenceParJour: 1, texte: '500 mg en dose unique' },
      voie: 'PO',
      modalites: 'Prise unique (1 jour).',
      statut: 'verifiee_ia',
      sources: [
        S('RCP-ciprofloxacine-orale', '§4.2 (prophylaxie des infections invasives à Neisseria meningitidis)', '500 mg en dose unique', 'posologie'),
        S('DGS-2018-IIM', 'p. 18, fiche 8-2', 'Ciprofloxacine par voie orale, en dose unique : Adulte : dose unique de 500 mg', 'posologie'),
      ],
    },
    // Méningite, allergie grave aux bêta-lactamines (SPILF 2018 Tableau 10) : fréquence non précisée, RCP IV non relu pour cette indication.
    {
      id: 'cipro-iv-meninge',
      libelle: '800 à 1 200 mg/j IV — méningite à méningocoque ou à H. influenzae, allergie grave aux bêta-lactamines (fréquence non précisée)',
      indication: 'Méningite à méningocoque ou à H. influenzae chez un patient allergique grave aux bêta-lactamines (SPILF 2018, Tableau 10) ; avis infectiologique.',
      dose: { type: 'fixe', valeur: 800, unite: 'mg', texte: '800 à 1 200 mg par jour (fréquence d\'administration non précisée par la source)' },
      voie: 'IV',
      modalites: 'Fréquence non précisée par SPILF 2018 (Tableau 10) ; RCP de la ciprofloxacine IV non relu pour cette indication : avis infectiologique et pharmacologique.',
      statut: 'brouillon',
      sources: [S('SPILF-2018-meningites', 'Tableau 10 p. 24', 'méningocoque → ciprofloxacine « 800–1200 mg » (fréquence non précisée)', 'posologie')],
    },
  ],
  adaptationRenale: {
    methode: 'Cockcroft',
    statut: 'verifiee_ia',
    // Audit relecteur 2 : paliers lus dans le RCP de la forme IV (Ciflox 200 mg/100 mL) ; ceux de la forme orale n'ont pas été lus.
    texteGeneral: 'Paliers du RCP de la forme injectable (mL/min/1,73 m²) ; paliers de la forme orale non vérifiés (RCP oral non lu).',
    paliers: [
      { clcrMin: 60, texte: 'ClCr ≥ 60 mL/min/1,73 m² : pas d\'adaptation.', sources: [S('RCP-ciprofloxacine', '§4.2', 'ClCr 30-60 mL/min/1,73 m² : 200-400 mg toutes les 12 h', 'adaptation_renale')] },
      { clcrMin: 30, clcrMax: 60, texte: 'ClCr 30-60 mL/min/1,73 m² : 200-400 mg toutes les 12 h (IV).', sources: [S('RCP-ciprofloxacine', '§4.2', '« 200-400 mg toutes les 12 h »', 'adaptation_renale')] },
      { clcrMax: 30, texte: 'ClCr < 30 mL/min/1,73 m² : 200-400 mg toutes les 24 h (IV).', sources: [S('RCP-ciprofloxacine', '§4.2', '< 30 : « 200-400 mg toutes les 24 h »', 'adaptation_renale')] },
    ],
    hemodialyse: { texte: 'Administrer après la dialyse.', sources: [S('RCP-ciprofloxacine', '§4.2', 'hémodialyse : « après la dialyse »', 'adaptation_renale')] },
  },
  surveillance: surveillanceFQ('cipro', 'RCP-ciprofloxacine'),
  grossesse: { statut: 'utilisable', texte: 'Fluoroquinolone de 1re intention quel que soit le terme (CRAT) ; pas de place dans la cystite/bactériurie de la grossesse (HAS).', sources: [S('CRAT-fluoroquinolones-grossesse', 'En pratique', 'La ciprofloxacine est la fluoroquinolone de 1ère intention quel que soit le terme de la grossesse', 'autre')] },
  interactionsPertinentes: [{ avec: 'qt_allongeant', texte: 'Allongement du QT : ECG et prudence.', sources: [S('RCP-ciprofloxacine', '§4.4', 'traitements allongeant l\'intervalle QT', 'surveillance')] }],
};

export const levofloxacine: Molecule = {
  id: 'levofloxacine',
  dci: 'Lévofloxacine',
  famille: 'fluoroquinolone',
  statut: 'verifiee_ia',
  regimens: [
    {
      id: 'levo-500',
      libelle: '500 mg toutes les 24 h (PO ou IV)',
      indication: 'PNA / IU masculine sans gravité (pas de FQ dans les 6 mois) ; relais documenté.',
      dose: { type: 'fixe', valeur: 500, unite: 'mg', frequenceParJour: 1 },
      voie: 'IV ou PO',
      modalites: 'per os ou perfusion de 60 min, 1 fois par 24 h',
      statut: 'verifiee_ia',
      sources: [S('SPILF-2026-IUM', 'diapo 14, 16', 'lévofloxacine PO 500 mg/jour', 'posologie'), S('RCP-levofloxacine', '§4.2', 'pyélonéphrite « 500 mg une fois par jour »', 'posologie')],
    },
    {
      id: 'levo-iv-500x2',
      libelle: '500 mg toutes les 12 h IV (sepsis, allergie aux bêta-lactamines)',
      indication: 'IU masculine avec sepsis/choc et allergie à toutes les bêta-lactamines, avec amikacine (SPILF 2026).',
      dose: { type: 'fixe', valeur: 500, unite: 'mg', frequenceParJour: 2 },
      voie: 'IV',
      modalites: 'perfusion de 60 min toutes les 12 h',
      statut: 'verifiee_ia',
      sources: [S('SPILF-2026-IUM', 'diapo 29', 'lévofloxacine IV 500 mgx2/jour ET Amikacine IV 30 mg/kg dose unique', 'posologie')],
    },
  ],
  adaptationRenale: {
    methode: 'Cockcroft',
    statut: 'verifiee_ia',
    // Audit relecteur 2 : les paliers ci-dessous valent pour le schéma 500 mg/24 h ; pour 500 mg/12 h, le tableau (lu avec une confiance moyenne) indique 250 mg/12 h (50-20) puis 125 mg/12 h (19-10).
    texteGeneral: 'Paliers indiqués pour le schéma 500 mg/24 h ; pour 500 mg/12 h : 250 mg/12 h (ClCr 50-20), 125 mg/12 h (19-10) — tableau du RCP lu avec une confiance moyenne (colonnes).',
    paliers: [
      { clcrMin: 50, texte: 'ClCr ≥ 50 mL/min : pas d\'adaptation.', sources: [S('RCP-levofloxacine', '§4.2', 'tableau par ClCr 50-20, 19-10, < 10', 'adaptation_renale')] },
      { clcrMin: 20, clcrMax: 50, texte: 'ClCr 20-49 mL/min : dose initiale normale puis entretien réduit (schéma 500 mg : 250 mg/24 h).', sources: [S('RCP-levofloxacine', '§4.2', '50-20 ml/min : puis 250 mg/24 h (schéma 500 mg)', 'adaptation_renale')] },
      { clcrMin: 10, clcrMax: 20, texte: 'ClCr 10-19 mL/min : dose initiale normale puis 125 mg/24 h (schéma 500 mg).', sources: [S('RCP-levofloxacine', '§4.2', '19-10 ml/min : puis 125 mg/24 h', 'adaptation_renale')] },
      { clcrMax: 10, texte: 'ClCr < 10 mL/min (dont hémodialyse) : dose initiale normale puis 125 mg/24 h.', sources: [S('RCP-levofloxacine', '§4.2', '< 10 (HD/DPCA)', 'adaptation_renale')] },
    ],
    hemodialyse: { texte: 'Schéma ClCr < 10 mL/min (125 mg/24 h après dose initiale).', sources: [S('RCP-levofloxacine', '§4.2', 'tableau < 10 inclut HD', 'adaptation_renale')] },
  },
  surveillance: surveillanceFQ('levo', 'RCP-levofloxacine'),
  grossesse: { statut: 'eviter', texte: 'Lévofloxacine en 2e intention pendant la grossesse (ciprofloxacine préférée, CRAT).', sources: [S('CRAT-fluoroquinolones-grossesse', 'En pratique', 'la lévofloxacine ou l\'ofloxacine peuvent être utilisées en 2ème intention', 'autre')] },
  interactionsPertinentes: [{ avec: 'qt_allongeant', texte: 'Allongement du QT : ECG et prudence.', sources: [S('RCP-levofloxacine', '§4.4', 'Les patients âgés et les femmes peuvent être plus sensibles aux traitements allongeant l\'intervalle QTc', 'surveillance')] }],
};

export const cotrimoxazole: Molecule = {
  id: 'cotrimoxazole',
  dci: 'Cotrimoxazole (sulfaméthoxazole-triméthoprime)',
  famille: 'sulfamide',
  statut: 'verifiee_ia',
  regimens: [
    {
      id: 'smx-tmp-800-160-x2',
      libelle: '800/160 mg toutes les 12 h per os',
      indication: 'Relais oral documenté de prostatite (1er choix SPILF 2026), PNA et IU masculine (après amoxicilline), BLSE sensible.',
      dose: { type: 'fixe', valeur: 960, unite: 'mg', frequenceParJour: 2 },
      voie: 'PO',
      modalites: '1 comprimé « forte » (800 mg SMX + 160 mg TMP) toutes les 12 h',
      statut: 'verifiee_ia',
      sources: [S('SPILF-2026-IUM', 'diapo 16-17, 23', 'Sulfaméthoxazole-triméthoprime PO 800/160 mg 1 cpx2/jour', 'posologie'), S('HAS-2021-PNA-femme', 'tableau relais', 'cotrimoxazole 800/160 ×2/j 10 j', 'posologie'), S(SRC_DOSES_2026, 'Annexe 9 (cotrimoxazole)', '0,16 g TMP + 0,8 g SMX toutes les 12 h', 'posologie')],
    },
    // Méningite à Listeria, allergie (docs/sources/recherche-meningites.md §1 Tableau 10, §9.8 point 1, §10.2) : SPILF au-dessus du RCP.
    {
      id: 'smx-tmp-meninge',
      libelle: '10 à 20 mg/kg/j de triméthoprime IV en 4 prises — méningite à Listeria (allergie) — au-dessus du RCP',
      indication: 'Méningite à Listeria (ou bacille à Gram positif, ou arguments pour une listériose) chez un patient allergique aux pénicillines (SPILF 2018, Tableaux 10 et 11).',
      dose: { type: 'ponderale', valeur: 10, unite: 'mg/kg', frequenceParJour: 4, poidsReference: 'total', texte: '10 à 20 mg/kg/j de triméthoprime, en 4 prises (SPILF 2018) — RCP (infections neuro-méningées à Listeria) : 6 à 8 mg/kg/j de triméthoprime et 30 à 40 mg/kg/j de sulfaméthoxazole' },
      voie: 'IV',
      modalites: 'Hors RCP : la dose SPILF dépasse la posologie du RCP pour la listériose neuro-méningée (divergence non tranchée) ; avis infectiologique.',
      statut: 'brouillon',
      sources: [
        S('SPILF-2018-meningites', 'Tableau 10 p. 24', 'Listeria → cotrimoxazole 10–20 mg/kg/j de triméthoprime en 4 prises', 'posologie'),
        S('RCP-cotrimoxazole', '§4.2', 'Traitement des infections neuro-méningées à Listeria monocytogenes : 30 à 40 mg/kg/j de sulfaméthoxazole et de 6 à 8 mg/kg/j de triméthoprime', 'posologie'),
      ],
      remarques: 'Écart au RCP signalé (recherche-meningites.md §9.8, point 1).',
    },
  ],
  adaptationRenale: {
    methode: 'Cockcroft',
    statut: 'verifiee_ia',
    paliers: [
      { clcrMin: 30.01, texte: 'ClCr > 30 mL/min : posologie normale.', sources: [S('RCP-cotrimoxazole', '§4.2', 'Clairance de la créatinine > 30 ml/min : posologie normale', 'adaptation_renale')] },
      { clcrMin: 15, clcrMax: 30.01, texte: 'ClCr 15-30 mL/min : demi-dose, en 1 prise par jour.', sources: [S('RCP-cotrimoxazole', '§4.2', '15-30 : demi-dose, 1 perfusion/jour', 'adaptation_renale')] },
      { clcrMax: 15, texte: 'ClCr < 15 mL/min hors dialyse : ne pas utiliser.', sources: [S('RCP-cotrimoxazole', '§4.2', '< 15 hors dialyse : ne pas utiliser', 'adaptation_renale')] },
    ],
    hemodialyse: { texte: 'Demi-dose après la dialyse ; sulfaméthoxazolémie tous les trois jours.', sources: [S('RCP-cotrimoxazole', '§4.2', 'hémodialyse : demi-dose après dialyse, sulfaméthoxazolémie « tous les trois jours »', 'adaptation_renale')] },
  },
  surveillance: [
    {
      id: 'smx-tmp-k-creat',
      type: 'biologique',
      categorie: 'systematique',
      quoi: 'Kaliémie et créatininémie (surveillance « étroite » à forte dose, en insuffisance rénale, chez le sujet âgé ou avec hyperkaliémiants) ; NFS si traitement prolongé ou > 65 ans',
      quand: { ancre: 'avant_traitement', texte: 'Avant traitement puis périodiquement (fréquence non chiffrée par le RCP)', repetition: 'périodique' },
      pourquoi: 'Hyperkaliémie, insuffisance rénale, cytopénies (carence en folates).',
      conduite: 'Hydratation ≥ 2 L/j ; acide folinique si anomalies hématologiques.',
      statut: 'verifiee_ia',
      sources: [S('RCP-cotrimoxazole', '§4.4', '« Une surveillance étroite de la kaliémie et de la fonction rénale est nécessaire » ; « Un contrôle hématologique périodique est nécessaire »', 'surveillance')],
    },
  ],
  grossesse: { statut: 'eviter', texte: 'Triméthoprime : préférer un autre antibiotique avant 10 SA (tube neural), acide folique proposé par analogie ; sulfamide déconseillé à terme (ictère néonatal : non vérifié au CRAT).', sources: [S('CRAT-trimethoprime-grossesse', 'En pratique', '< 10 SA : « On préférera un autre antibiotique »', 'autre')] },
  interactionsPertinentes: [
    { avec: 'methotrexate', texte: 'Association déconseillée (toxicité hématologique du méthotrexate).', sources: [S('RCP-cotrimoxazole', '§4.4', 'carence en folates ; acide folinique si anomalies hématologiques', 'surveillance')] },
    { avec: 'avk', texte: 'Potentialisation des AVK : contrôle de l\'INR rapproché.', sources: [S('RCP-cotrimoxazole', '§4.4', 'interactions (mise en garde de classe)', 'surveillance')] },
  ],
};

export const rifampicine: Molecule = {
  id: 'rifampicine',
  dci: 'Rifampicine',
  famille: 'rifamycine',
  statut: 'verifiee_ia',
  regimens: [
    {
      id: 'rifampicine-900',
      libelle: '900 mg/j (600 mg si < 70 kg) — endocardite sur prothèse à staphylocoque, après négativation des hémocultures',
      indication: 'Endocardite sur valve prothétique à staphylocoque (ESC 2023 : 900 mg/j en 3 prises, ≥ 6 semaines ; SPILF/AEPEI : 900 mg en 1 prise, 600 mg si < 70 kg, à débuter après négativation des hémocultures).',
      dose: { type: 'fixe', valeur: 900, unite: 'mg', frequenceParJour: 1, texte: '900 mg/j en 1 prise (600 mg/j si poids < 70 kg) — SPILF/AEPEI ; ESC 2023 : 900 mg/j en 3 prises' },
      voie: 'IV ou PO',
      modalites: 'à introduire après négativation des hémocultures (SPILF/AEPEI ; ESC : après 3-5 jours de traitement efficace)',
      statut: 'verifiee_ia',
      sources: [S('ESC-2023-endocardite', 'Recommendation Table 8 (EHJ p. 3980-3981)', 'Rifampin 900 mg/day i.v. or orally in 3 equally divided doses', 'posologie'), S('SPILF-AEPEI-2025-endocardite', 'diapo 15-16', 'Rifampicine [après] Hémocultures stériles ; 900 mg/j en 1 dose/24h (600 mg si poids < 70kg)', 'posologie')],
    },
    // Méningite, allergie grave aux bêta-lactamines (docs/sources/recherche-meningites.md §1 Tableau 10, §9.8 point 8).
    {
      id: 'rifampicine-meninge-300x2',
      libelle: '300 mg toutes les 12 h — méningite, allergie grave aux bêta-lactamines, en association à la vancomycine',
      indication: 'Méningite à pneumocoque ou à examen direct négatif chez un patient allergique grave aux bêta-lactamines : vancomycine + rifampicine (SPILF 2018, Tableau 10).',
      dose: { type: 'fixe', valeur: 300, unite: 'mg', frequenceParJour: 2 },
      voie: 'IV ou PO',
      modalites: 'Voie non précisée par la source. Divergence SPILF 2018 : 300 mg × 2/j (Tableau 10) ; 10 mg/kg/12 h en cas d\'échec à pneumocoque (§14.1.1). Inducteur enzymatique : l\'effet de la dexaméthasone peut être réduit (RCP dexaméthasone).',
      statut: 'brouillon',
      sources: [
        S('SPILF-2018-meningites', 'Tableau 10 p. 24', 'rifampicine (adulte 300 mg × 2/j)', 'posologie'),
        S('SPILF-2018-meningites', 'p. 27, §14.1', 'ajout rifampicine 10 mg/kg/12 h ou vancomycine', 'posologie'),
        S('RCP-dexamethasone-krka', '§4.5', 'L\'effet des corticoïdes peut être réduit', 'autre'),
      ],
    },
    // Prophylaxie des infections invasives à méningocoque (docs/sources/recherche-meningites.md §5, §10.2) : RCP oral (Rifadine gélule) lu.
    {
      id: 'rifampicine-po-prophylaxie-iim',
      libelle: '600 mg toutes les 12 h per os pendant 48 h — prophylaxie des infections invasives à méningocoque',
      indication: 'Prophylaxie du portage de méningocoque (instruction DGS 2018 : 1re intention ; DGS-Urgent 2025_06 relayé : réservée à une souche résistante à la ciprofloxacine avec contre-indication à la ceftriaxone).',
      dose: { type: 'fixe', valeur: 600, unite: 'mg', frequenceParJour: 2 },
      voie: 'PO',
      modalites: 'Pendant 48 heures (2 gélules de 300 mg toutes les 12 h). Femme : contraception non hormonale hautement efficace pendant le traitement et 6 mois après (RCP 08/04/2026 ; l\'instruction DGS 2018 indiquait une contraception mécanique pendant le traitement et la semaine suivante). Grossesse : seulement si strictement nécessaire (RCP) ; vitamine K1 au nouveau-né si prise en fin de grossesse.',
      statut: 'verifiee_ia',
      sources: [
        S('RCP-rifampicine-orale', '§4.2', 'La rifampicine sera donnée pendant 48 heures à la posologie suivante : Adulte : 600 mg toutes les 12 heures', 'posologie'),
        S('DGS-2018-IIM', 'p. 18, fiche 8-2', 'Adulte : 600 mg (2 gélules de 300 mg), deux fois par jour', 'posologie'),
        S('RCP-rifampicine-orale', '§4.6', 'contraception non hormonale hautement efficace pendant et 6 mois après (femme) ; grossesse « que lorsque cela est strictement nécessaire »', 'autre'),
      ],
      remarques: 'Le RCP précise que la rifampicine n\'est pas un traitement de la méningite à méningocoque (§4.1).',
    },
  ],
  adaptationRenale: {
    methode: 'Cockcroft',
    statut: 'verifiee_ia',
    paliers: [
      { clcrMin: 60, texte: 'ClCr ≥ 60 mL/min : pas d\'adaptation.', sources: [S('RCP-rifampicine', '§4.2', 'IR 60-30 ml/min : rifampicinémie « au 2ème ou 3ème jour du traitement »', 'adaptation_renale')] },
      { clcrMin: 30, clcrMax: 60, texte: 'ClCr 30-60 mL/min : rifampicinémie au 2e-3e jour.', sources: [S('RCP-rifampicine', '§4.2', 'rifampicinémie « au 2ème ou 3ème jour du traitement »', 'adaptation_renale')] },
      { clcrMax: 30, texte: 'ClCr < 30 mL/min : espacement des prises indispensable, guidé par la rifampicinémie.', sources: [S('RCP-rifampicine', '§4.2', '< 30 : « l\'espacement des prises est indispensable »', 'adaptation_renale')] },
    ],
  },
  insuffisanceHepatique: { texte: 'Diminuer la posologie (ex. 5 mg/kg/j sans dépasser 900 mg/j en tuberculose) ; s\'aider de la rifampicinémie.', sources: [S('RCP-rifampicine', '§4.2', 'La posologie devra être diminuée […] On pourra s\'aider du dosage de la rifampicinémie', 'adaptation_renale')] },
  surveillance: [
    {
      id: 'rifampicine-hepatique',
      type: 'biologique',
      categorie: 'systematique',
      quoi: 'Bilan hépatique (transaminases, bilirubine)',
      quand: { ancre: 'debut_traitement', offsetHeures: 24 * 7, texte: 'Au 8e jour, à la fin du 1er mois, puis tous les 2 mois (toutes les 2-4 semaines si hépatopathie préexistante)', repetition: 'J8, M1, puis /2 mois' },
      pourquoi: 'Hépatotoxicité.',
      statut: 'verifiee_ia',
      sources: [S('RCP-rifampicine', '§4.4', 'bilan hépatique « au 8ème jour, à la fin du 1er mois, puis de façon plus espacée (2 mois) »', 'surveillance')],
    },
    {
      id: 'rifampicine-interactions',
      type: 'interaction',
      categorie: 'systematique',
      quoi: 'Revue des interactions (induction enzymatique maximale en ~15 jours, persistant 1-2 semaines après l\'arrêt) : AVK (INR pendant et 8 jours après), contraception mécanique additionnelle, immunosuppresseurs, antirétroviraux, antiépileptiques',
      quand: { ancre: 'avant_traitement', texte: 'Avant l\'introduction puis à chaque modification de traitement' },
      pourquoi: 'Inducteur enzymatique puissant.',
      statut: 'verifiee_ia',
      sources: [S('RCP-rifampicine', '§4.4-4.5', 'l\'effet inducteur atteint un niveau maximum en 15 jours environ et persiste 1 à 2 semaines après l\'arrêt ; AVK « pendant le traitement par la rifampicine et 8 jours après son arrêt »', 'surveillance')],
    },
  ],
  stp: [
    {
      id: 'rifampicinemie',
      parametre: 'residuelle',
      categorie: 'conditionnelle',
      indication: 'Insuffisance hépatique ou insuffisance rénale (ClCr 30-60 mL/min).',
      premierPrelevement: { quand: 'au 2e ou 3e jour de traitement', position: 'non précisée par le RCP', jour: 2 },
      repetition: 'non précisée',
      cible: undefined,
      limites: 'Cible non chiffrée par le RCP.',
      conduite: 'Réduire la dose si concentrations élevées.',
      conditionId: 'insuffisance_renale',
      conditionTexte: 'si insuffisance rénale (ClCr 30-60) ou hépatique',
      statut: 'verifiee_ia',
      sources: [S('RCP-rifampicine', '§4.2', 'rifampicinémie « au 2ème ou 3ème jour du traitement »', 'surveillance')],
    },
  ],
  // Audit relecteur 2 : « utilisable » sans source lue → « non_verifie » (fiche CRAT 8385 vue seulement en résultat de recherche).
  grossesse: { statut: 'non_verifie', texte: 'Non vérifié : la fiche CRAT rifampicine n\'a été vue qu\'en résultat de recherche (utilisable quel que soit le terme ; rares hémorragies néonatales précoces), non lue.', sources: [] },
  interactionsPertinentes: [
    { avec: 'avk', texte: 'Diminution de l\'effet des AVK : INR rapprochés pendant le traitement et 8 jours après l\'arrêt.', sources: [S('RCP-rifampicine', '§4.5', 'AVK « pendant le traitement par la rifampicine et 8 jours après son arrêt »', 'surveillance')] },
    { avec: 'aod', texte: 'Diminution des concentrations des anticoagulants oraux directs (induction) : association à éviter / avis.', sources: [S('RCP-rifampicine', '§4.5', 'induction enzymatique', 'surveillance')] },
    { avec: 'contraceptif_oral', texte: 'Inefficacité des contraceptifs oraux : contraception mécanique additionnelle.', sources: [S('RCP-rifampicine', '§4.4', 'contraception mécanique additionnelle', 'surveillance')] },
    { avec: 'immunosuppresseur_calcineurine', texte: 'Baisse des concentrations de ciclosporine/tacrolimus : dosages rapprochés.', sources: [S('RCP-rifampicine', '§4.5', 'induction enzymatique', 'surveillance')] },
    { avec: 'antiretroviral', texte: 'Interactions majeures avec de nombreux antirétroviraux : avis spécialisé.', sources: [S('RCP-rifampicine', '§4.5', 'induction enzymatique', 'surveillance')] },
    { avec: 'antiepileptique', texte: 'Baisse des concentrations de certains antiépileptiques : dosages.', sources: [S('RCP-rifampicine', '§4.5', 'induction enzymatique', 'surveillance')] },
  ],
};
