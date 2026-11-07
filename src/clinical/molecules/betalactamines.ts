import type { AdaptationRenale, Molecule, SourceRef } from '../types';
import { S, SRC_DOSES_2026, encephalopathieBetaLactamine, stpBetaLactamineReanimation } from './base';

/**
 * Régimes intra-abdominaux de SFAR 2026 en perfusion continue ou prolongée : les paliers du RCP visent
 * l'administration intermittente et ne se convertissent pas ; SFAR 2026 (Annexe 1) renvoie l'insuffisance rénale au GPR
 * (céfépime : concentrations sériques). Au-dessus du seuil du RCP, pas d'adaptation.
 */
function adaptationRenaleIIA(seuil: number, sansAdaptation: SourceRef, cefepime = false): AdaptationRenale {
  const avis = `adaptation de ce schéma (perfusion continue ou prolongée) non tabulée par les sources lues : SFAR 2026 renvoie au Guide Prescription Rein${cefepime ? ' et adapte le céfépime selon les concentrations sériques' : ''} — avis pharmacologique, dosage plasmatique.`;
  const src = [S('SFAR-2026-IIA', 'Annexe 1, p. 73-74', 'GPR (Guide Prescription Rein) via accès Vidal®', 'adaptation_renale'), ...(cefepime ? [S('SFAR-2026-IIA', 'Annexe 1, p. 73-74 (céfépime, usuelles)', 'paraphrase : si IR et/ou dose ≥ 6 g/j, adaptation par les concentrations sériques', 'adaptation_renale')] : [])];
  return {
    methode: 'Cockcroft',
    statut: 'verifiee_ia',
    paliers: [
      { clcrMin: seuil, texte: `ClCr ≥ ${seuil} mL/min : pas d'adaptation (seuil du RCP).`, sources: [sansAdaptation] },
      { clcrMax: seuil, texte: `ClCr < ${seuil} mL/min : ${avis}`, sources: src },
    ],
    hemodialyse: { texte: `Hémodialyse : ${avis}`, sources: src },
    eerContinue: { texte: `Épuration extrarénale continue : ${avis}`, sources: src },
  };
}

const CRAT_PENI = S('CRAT-penicillines-grossesse', 'En pratique', "L'utilisation des pénicillines suivantes est possible quel que soit le terme de la grossesse", 'autre');
const CRAT_CEPH = S('CRAT-cephalosporines-grossesse', 'En pratique', 'céfotaxime, ceftriaxone, ceftazidime utilisables « quel que soit le terme de la grossesse, en raison de leur intérêt thérapeutique »', 'autre');

/* ------------------------------------------------------------------ */
/* Doses méningées : adaptation rénale propre au régime (SPILF 2018)    */
/* ------------------------------------------------------------------ */
// docs/sources/recherche-meningites.md §1 (Tableau 8, §12.8.2.4), §2 (dia 11), §9.3. Les paliers des RCP visent la
// posologie standard : ils ne s'appliquent jamais sous une dose méningée (relecture v7, constat bloquant 1).
const SP_MEN = 'SPILF-2018-meningites';
const DIA_MEN = 'SPILF-2018-meningites-diapo';
const SRC_24H = S(DIA_MEN, 'dia 11', '[reformulation] pas d\'adaptation les 24 premières heures quel que soit le DFG', 'adaptation_renale');
const SRC_DOSAGE_LCS = S(SP_MEN, '§12.8.2.4 p. 23', '[reformulation] Doser plasma et LCS pour vérifier des concentrations dans le LCS ≥ 10 fois la CMI', 'adaptation_renale');
const SRC_HEMOFILTRATION = S(DIA_MEN, 'dia 11', '[reformulation] doses habituelles sous hémofiltration continue', 'adaptation_renale');
const HD_MENINGE = (molecule: string) => ({
  texte: `Hémodialyse intermittente : non traitée par les sources lues pour la dose méningée de ${molecule}. Pleine dose les 24 premières heures (SPILF 2018 : quel que soit le DFG), puis avis pharmacologique et dosages plasmatiques (et dans le LCS). Le palier « hémodialyse » du RCP vise la posologie standard : il ne s'applique pas à la dose méningée.`,
  sources: [SRC_24H, SRC_DOSAGE_LCS],
});

/** Céfotaxime méningé : pleine dose 24 h puis −25 / −50 / −75 % selon le DFG (SPILF 2018, Tableau 8 ; diaporama 11). */
function renalCefotaximeMeninge(dose: 300 | 200): AdaptationRenale {
  const red = (pc: number) => (dose * (100 - pc)) / 100;
  const calc = dose === 300 ? '(valeur du diaporama SPILF)' : '(pourcentage SPILF appliqué par l\'application à 200 mg/kg/j)';
  const src = S(SP_MEN, 'Tableau 8 p. 22 ; §12.8.2.4 p. 23', '[reformulation] céfotaxime — même dose les 24 premières heures, puis réduction de 25 % (DFG 30–60), 50 % (DFG 15–30), 75 % (DFG < 15) ; pas d\'adaptation sous hémofiltration continue', 'adaptation_renale');
  const dia = S(DIA_MEN, 'dia 11', '[reformulation] céfotaxime 225 mg/kg/j (30 < DFG ≤ 60), 150 mg/kg/j (15 < DFG ≤ 30), 75 mg/kg/j (DFG ≤ 15)', 'adaptation_renale');
  const palier = (bornes: string, pc: number) =>
    `${bornes} : pleine dose (${dose} mg/kg/j) les 24 premières heures, puis réduction de ${pc} % : ${red(pc)} mg/kg/j ${calc}. Seuils SPILF exprimés en DFG sans formule précisée (non tranché). Doser plasma et LCS.`;
  return {
    methode: 'non_precisee',
    statut: 'brouillon',
    texteGeneral: 'Dose méningée (SPILF 2018) : pas d\'adaptation les 24 premières heures quel que soit le DFG ; les paliers du RCP (posologie standard) ne s\'appliquent pas.',
    paliers: [
      { clcrMin: 60.01, texte: 'DFG > 60 mL/min : pas d\'adaptation de la dose méningée (SPILF 2018).', sources: [src] },
      { clcrMin: 30.01, clcrMax: 60.01, texte: palier('DFG 31-60 mL/min (SPILF : 30 < DFG ≤ 60)', 25), sources: [src, dia, SRC_24H, SRC_DOSAGE_LCS] },
      { clcrMin: 15.01, clcrMax: 30.01, texte: palier('DFG 16-30 mL/min (SPILF : 15 < DFG ≤ 30)', 50), sources: [src, dia, SRC_24H, SRC_DOSAGE_LCS] },
      { clcrMax: 15.01, texte: palier('DFG ≤ 15 mL/min', 75), sources: [src, dia, SRC_24H, SRC_DOSAGE_LCS] },
    ],
    hemodialyse: HD_MENINGE('céfotaxime'),
    eerContinue: { texte: 'Hémofiltration continue : doses habituelles, pas d\'adaptation (SPILF 2018). Doser plasma et LCS.', sources: [src, SRC_HEMOFILTRATION, SRC_DOSAGE_LCS] },
  };
}

/** Ceftriaxone méningée : pas d'adaptation si ClCr ≥ 30 ; sinon pleine dose 24 h (2 injections) puis −50 % en 1 injection (SPILF 2018). */
function renalCeftriaxoneMeninge(dose: 100 | 75): AdaptationRenale {
  const calc = dose === 100 ? '50 mg/kg/j (valeur du diaporama SPILF)' : '37,5 mg/kg/j (pourcentage SPILF appliqué par l\'application à 75 mg/kg/j)';
  const src = S(SP_MEN, 'Tableau 8 p. 22', '[reformulation] Ceftriaxone — si ClCr < 30 : même dose 24 h (en 2 injections) puis −50 % en 1 injection', 'adaptation_renale');
  const info = S('SPILF-2019-info-antibio-90', 'tableau', 'Si DFG <30mL/min: même dose pdt 24h (en 2 perfusions), puis, baisse de 50% en 1 perfusion', 'adaptation_renale');
  return {
    methode: 'non_precisee',
    statut: 'brouillon',
    texteGeneral: 'Dose méningée (SPILF 2018) : pas d\'adaptation si ClCr ≥ 30 mL/min ; les paliers du RCP (posologie standard, plafond de 2 g/j) ne s\'appliquent pas.',
    paliers: [
      { clcrMin: 30, texte: 'ClCr ≥ 30 mL/min : pas d\'adaptation de la dose méningée (SPILF 2018).', sources: [src] },
      {
        clcrMax: 30,
        texte: `ClCr < 30 mL/min : pleine dose (${dose} mg/kg/j, en 2 injections) les 24 premières heures, puis réduction de 50 % en 1 injection : ${calc}. Seuil < 30 (texte long, Info-antibio ; « ≤ 30 » lu dans le diaporama) ; grandeur rénale non tranchée (clairance ou DFG). Doser plasma et LCS.`,
        sources: [src, info, S(DIA_MEN, 'dia 11', '[reformulation] ceftriaxone 100 mg/kg/j en 2 fois/j puis 50 mg/kg/j en 1 fois/j', 'adaptation_renale'), SRC_DOSAGE_LCS],
      },
    ],
    hemodialyse: HD_MENINGE('ceftriaxone'),
    eerContinue: { texte: 'Hémofiltration continue : doses habituelles, pas d\'adaptation (SPILF 2018, diaporama 11). Doser plasma et LCS.', sources: [SRC_HEMOFILTRATION, SRC_DOSAGE_LCS] },
  };
}

/**
 * Amoxicilline méningée (200 mg/kg/j) : aucune adaptation rénale de cette dose dans les sources lues (la SPILF ne
 * détaille que les C3G ; les paliers du RCP visent sa posologie, au plus 12 g/j). Seuil de 30 mL/min du RCP conservé
 * pour signaler où commence l'adaptation, sans en reprendre les doses.
 */
const RENAL_AMOXICILLINE_MENINGE: AdaptationRenale = {
  methode: 'non_precisee',
  statut: 'brouillon',
  texteGeneral: 'Dose méningée : aucune adaptation rénale chiffrée dans les sources lues ; les paliers du RCP (posologie standard, au plus 12 g/j) ne s\'appliquent pas.',
  paliers: [
    {
      clcrMin: 30.01,
      texte: 'DFG > 30 mL/min : pas d\'adaptation selon le RCP (seuil établi pour la posologie du RCP, au plus 12 g/j) ; la SPILF 2018 ne traite pas l\'adaptation rénale de l\'amoxicilline à dose méningée.',
      sources: [S('RCP-amoxicilline', '§4.2 (tableau)', '> 30 : pas d\'adaptation', 'adaptation_renale')],
    },
    {
      clcrMax: 30.01,
      texte: 'DFG ≤ 30 mL/min : aucune adaptation de la dose méningée dans les sources lues (SPILF 2018 : paliers des seules C3G ; paliers du RCP établis pour la posologie standard, inapplicables à 200 mg/kg/j). Pleine dose les 24 premières heures (principe SPILF énoncé avant les paliers des C3G, extension à l\'amoxicilline non explicite), puis avis pharmacologique et dosages plasmatiques (et dans le LCS) ; surveiller l\'apparition de convulsions (RCP).',
      sources: [SRC_24H, SRC_DOSAGE_LCS, S('RCP-amoxicilline', '§4.4', 'Des convulsions peuvent apparaitre chez les patients insuffisant rénaux ou recevant des doses élevées', 'surveillance')],
    },
  ],
  hemodialyse: HD_MENINGE('l\'amoxicilline'),
  eerContinue: { texte: 'Épuration extrarénale continue : non traitée par les sources lues pour l\'amoxicilline à dose méningée : avis pharmacologique et dosages plasmatiques (et dans le LCS).', sources: [SRC_DOSAGE_LCS] },
};

/* ------------------------------------------------------------------ */
export const cefotaxime: Molecule = {
  id: 'cefotaxime',
  dci: 'Céfotaxime',
  famille: 'cephalosporine',
  chaineLaterale: 'aminothiazolyl-oxyimino : R1 identique céfotaxime/ceftriaxone/céfépime, proche pour ceftazidime et céfixime (connaissance non vérifiée dans une source lue : tableaux SPILF/JNI en image)',
  statut: 'verifiee_ia',
  regimens: [
    {
      id: 'cefotaxime-std',
      libelle: '1 g toutes les 8 h (posologie standard)',
      indication: 'Pyélonéphrite / IU masculine sans signe de gravité (SPILF 2015, 2026) ; souche « S ».',
      dose: { type: 'fixe', valeur: 1, unite: 'g', frequenceParJour: 3 },
      voie: 'IV',
      modalites: 'perfusion de 30 min toutes les 8 h',
      statut: 'verifiee_ia',
      sources: [S('SPILF-2026-IUM', 'diapo 14', 'céfotaxime IV 3 g/jour', 'posologie'), S('SPILF-2015-IU', 'annexe 1, p. 41', 'céfotaxime 1 g x 3/jour, voire 2 g x 3/jour', 'posologie'), S(SRC_DOSES_2026, 'Annexe 9 (céfotaxime)', '1 g toutes les 8 h en perfusions de 30 min', 'posologie')],
    },
    {
      id: 'cefotaxime-fort',
      libelle: '2 g toutes les 8 h (forte posologie : sepsis, choc, souche « I »)',
      indication: 'IU grave avec sepsis/choc (SPILF 2026 : 6 g/j), bactériémie, souche catégorisée « sensible à forte posologie ».',
      dose: { type: 'fixe', valeur: 2, unite: 'g', frequenceParJour: 3 },
      voie: 'IV',
      modalites: 'perfusion de 30 min toutes les 8 h (ou perfusion prolongée de 4 h : SPILF/SFPT/CA-SFM)',
      statut: 'verifiee_ia',
      sources: [S('SPILF-2026-IUM', 'diapo 15, 22', 'Céfotaxime IV 6 g/jour OU ceftriaxone IV 2 g/jour ET amikacine IV 30 mg/kg, dose unique', 'posologie'), S('SPILF-2015-IU', 'annexe 1, p. 41', 'PNA grave : céfotaxime 2 g x 3/jour', 'posologie'), S(SRC_DOSES_2026, 'Annexe 9 (céfotaxime)', '2 g toutes les 8 h en perfusions de 30 min', 'posologie'), S('EUCAST-2026-dosages-v16.0', 'Dosages, p. 8', 'Cefotaxime 1 g x 3 iv [standard] ; 2 g x 3 iv [high]', 'posologie')],
    },
    // Méningite bactérienne (docs/sources/recherche-meningites.md §1, §10.2) : dose concordante avec le RCP (200 à 300 mg/kg/j),
    // sans données du RCP au-delà de 24 g/j ; brouillon tant que la révision SPILF n'est pas publiée (note §9).
    {
      id: 'cefotaxime-meninge-300',
      libelle: '300 mg/kg/j IV — méningite (cocci à Gram positif, pneumocoque, examen direct négatif)',
      indication: 'Méningite bactérienne : examen direct à cocci à Gram positif ou pneumocoque, examen direct négatif, pneumocoque de CMI C3G > 0,5 mg/L (SPILF 2018).',
      dose: { type: 'ponderale', valeur: 75, unite: 'mg/kg', frequenceParJour: 4, poidsReference: 'total' },
      voie: 'IV',
      modalites: '75 mg/kg toutes les 6 h, ou perfusion continue après une dose de charge de 50 mg/kg sur 1 h (SPILF 2018). Pas de dose maximale consensuelle chez l\'adulte (SPILF) ; RCP : pas de données au-delà de 24 g/j (dépassé au-delà de 80 kg). Poids de référence non précisé par la source (poids réel retenu par l\'application).',
      statut: 'brouillon',
      sources: [
        S('SPILF-2018-meningites', 'p. 21, §12.8.1.1 ; Tableau 8 p. 22', '[reformulation] céfotaxime 300 mg/kg/j IV, en continu (dose de charge 50 mg/kg sur 1 h) ou ≥ 4 perfusions (75 mg/kg/6 h)', 'posologie'),
        S('SPILF-2018-meningites', 'p. 21, §12.8.1.1', 'some studies report doses of 24 g/day of cefotaxime', 'posologie'),
        S('RCP-cefotaxime', '§4.2', 'Méningites: 200 à 300 mg/kg/jour, on ne dispose pas d\'éléments d\'efficacité ou de tolérance au-delà de 24 g/ jour', 'posologie'),
      ],
      adaptationRenale: renalCefotaximeMeninge(300),
    },
    {
      id: 'cefotaxime-meninge-200',
      libelle: '200 mg/kg/j IV — méningite (méningocoque, H. influenzae, E. coli ; pneumocoque de CMI amoxicilline > 0,5 mg/L)',
      indication: 'Méningite bactérienne : cocci à Gram négatif ou méningocoque, bacille à Gram négatif, H. influenzae, E. coli ; pneumocoque de CMI C3G ≤ 0,5 et CMI amoxicilline > 0,5 mg/L (SPILF 2018).',
      dose: { type: 'ponderale', valeur: 50, unite: 'mg/kg', frequenceParJour: 4, poidsReference: 'total' },
      voie: 'IV',
      modalites: '50 mg/kg toutes les 6 h, ou perfusion continue après une dose de charge de 50 mg/kg (SPILF 2018). RCP : pas de données au-delà de 24 g/j (dépassé au-delà de 120 kg). Poids de référence non précisé par la source (poids réel retenu par l\'application).',
      statut: 'brouillon',
      sources: [
        S('SPILF-2018-meningites', 'p. 21, §12.8.1.2', '[reformulation] céfotaxime 200 mg/kg/j (50 mg/kg/6 h ou continu avec charge 50 mg/kg)', 'posologie'),
        S('RCP-cefotaxime', '§4.2', 'Méningites: 200 à 300 mg/kg/jour', 'posologie'),
      ],
      adaptationRenale: renalCefotaximeMeninge(200),
    },
    {
      id: 'cefotaxime-iia',
      libelle: '1 à 2 g toutes les 8 h (infection intra-abdominale, posologie usuelle)',
      indication: 'Infection intra-abdominale communautaire sans sepsis ni choc, avec le métronidazole (SFAR 2026, Annexe 1, colonne « usuelles »).',
      dose: { type: 'fixe', valeur: 2, unite: 'g', frequenceParJour: 3, texte: '1 à 2 g toutes les 8 h' },
      voie: 'IV',
      modalites: 'perfusion de 30 min à 4 h toutes les 8 h',
      statut: 'verifiee_ia',
      sources: [S('SFAR-2026-IIA', 'Annexe 1, p. 73-74 (usuelles)', '1-2 g/8h IV en perfusion de 30 min - 4h', 'posologie'), S('RCP-cefotaxime', '§4.2', '3 g/jour en moyenne pouvant être portée jusqu\'à 12 g', 'posologie')],
    },
    // Pneumonies (docs/sources/recherche-pneumonies.md).
    {
      id: 'cefotaxime-pac-1g8h',
      libelle: '1 g toutes les 8 h IV ou IM (pneumonie hors soins critiques)',
      indication: 'PAC ambulatoire avec comorbidité et allergie non grave aux pénicillines (HAS 2025) ; PAC hospitalisée non grave (SPILF 2025).',
      dose: { type: 'fixe', valeur: 1, unite: 'g', frequenceParJour: 3 },
      voie: 'IM ou IV',
      modalites: 'IV ou IM toutes les 8 h',
      statut: 'verifiee_ia',
      sources: [S('SPILF-SPLF-2025-PAC', 'tableau 10, p. 8', 'Céfotaxime « 1 g x 3/j »', 'posologie'), S('HAS-2025-PAC-adulte-ambulatoire', 'comorbidités, allergie aux pénicillines', 'cefotaxime : 1g 3 fois par jour par voie IM ou IV', 'posologie')],
    },
    {
      id: 'cefotaxime-pac-soins-critiques',
      libelle: 'Soins critiques : 80 à 100 mg/kg/j (article) ou 100 mg/kg/j (diaporama) — divergence non tranchée',
      indication: 'PAC grave en soins critiques (C3G associée à un macrolide, SPILF 2025) : la posologie diffère entre l\'article et le diaporama SPILF.',
      dose: { type: 'ponderale', valeur: 100, unite: 'mg/kg', texte: '80 à 100 mg/kg/j selon l\'article SPILF/SPLF 2025 (tableau 10) ; 100 mg/kg/j selon le diaporama SPILF 2025 (diapo 15) — divergence non tranchée, nombre d\'administrations non précisé' },
      voie: 'IV',
      modalites: 'IV ; répartition journalière non précisée par les sources lues',
      statut: 'brouillon',
      sources: [S('SPILF-SPLF-2025-PAC', 'tableau 10, p. 8 (soins critiques)', '80-100 mg/kg/j', 'posologie'), S('SPILF-2025-PAC-diapo', 'diapo 15', 'Céfotaxime soins critiques « 100 mg/kg/j »', 'posologie')],
    },
  ],
  adaptationRenale: {
    methode: 'Cockcroft',
    statut: 'verifiee_ia',
    paliers: [
      { clcrMin: 10, texte: 'ClCr ≥ 10 mL/min : pas d\'adaptation (le RCP ne prévoit pas de palier intermédiaire).', sources: [S('RCP-cefotaxime', '§4.2', 'ClCr < 10 mL/min → après dose initiale normale, entretien à demi-dose, intervalle inchangé', 'adaptation_renale')] },
      { clcrMax: 10, texte: 'ClCr < 10 mL/min : dose initiale normale, puis demi-dose à chaque administration, intervalle inchangé.', sources: [S('RCP-cefotaxime', '§4.2', 'entretien à demi-dose, intervalle inchangé', 'adaptation_renale')] },
    ],
    hemodialyse: { texte: '1 à 2 g/jour ; le jour de l\'hémodialyse, administrer après la séance.', sources: [S('RCP-cefotaxime', '§4.2', 'le jour de l\'hémodialyse, le céfotaxime doit être administré après la séance de dialyse', 'adaptation_renale')] },
  },
  surveillance: [encephalopathieBetaLactamine('cefotaxime-encephalopathie', 'RCP-cefotaxime'), stpBetaLactamineReanimation('cefotaxime-stp')],
  grossesse: { statut: 'utilisable', texte: 'Utilisable quel que soit le terme.', sources: [CRAT_CEPH] },
};

/* ------------------------------------------------------------------ */
export const ceftriaxone: Molecule = {
  id: 'ceftriaxone',
  dci: 'Ceftriaxone',
  famille: 'cephalosporine',
  chaineLaterale: 'aminothiazolyl-oxyimino : R1 identique céfotaxime/ceftriaxone/céfépime, proche pour ceftazidime et céfixime (connaissance non vérifiée dans une source lue : tableaux SPILF/JNI en image)',
  statut: 'verifiee_ia',
  regimens: [
    {
      id: 'ceftriaxone-1g',
      libelle: '1 g toutes les 24 h',
      indication: 'IU fébrile sans gravité (SPILF 2015/2026, HAS 2021) ; voie IV, IM ou SC.',
      dose: { type: 'fixe', valeur: 1, unite: 'g', frequenceParJour: 1 },
      voie: 'IM ou IV',
      modalites: 'perfusion de 30 min ou IV directe, 1 fois par 24 h (IM ou SC possible)',
      statut: 'verifiee_ia',
      sources: [S('SPILF-2026-IUM', 'diapo 14', 'ceftriaxone IV 1 g/jour', 'posologie'), S('HAS-2021-PNA-femme', 'Antibiothérapie probabiliste', 'Ceftriaxone IM ou IV : 1 g par jour ; 2 g par jour si signes de gravité ou obésité (IMC > 30)', 'posologie'), S('SPILF-2015-IU', 'annexe 1, p. 41', 'ceftriaxone 1 g x1/jour, voire 2 g x1/jour', 'posologie')],
    },
    {
      id: 'ceftriaxone-2g',
      libelle: '2 g toutes les 24 h (gravité, bactériémie, obésité)',
      // Audit relecteur 2 : « souche I » retiré — 2 g/24 h est la posologie STANDARD (EUCAST 2 g × 1 ; SPILF/SFPT/CA-SFM 1 à 2 g/24 h) ; souche I → 2 g/12 h.
      indication: 'IU grave (SPILF 2015/2026), bactériémie, endocardite à streptocoque (ESC 2023 : 2 g/j), obésité IMC > 30 (HAS). Pas pour une souche catégorisée I (forte posologie = 2 g toutes les 12 h).',
      dose: { type: 'fixe', valeur: 2, unite: 'g', frequenceParJour: 1 },
      voie: 'IV',
      modalites: 'perfusion de 30 min, 1 fois par 24 h',
      statut: 'verifiee_ia',
      sources: [S('SPILF-2026-IUM', 'diapo 15', 'ceftriaxone IV 2 g/jour', 'posologie'), S('ESC-2023-endocardite', 'Recommendation Table 7 (EHJ p. 3977)', 'Ceftriaxone 2 g/day i.v. in 1 dose', 'posologie'), S('EUCAST-2026-dosages-v16.0', 'Dosages, p. 8', 'Ceftriaxone 2 g x 1 iv [standard] ; 2 g x 2 iv ou 4 g x 1 iv [high]', 'posologie')],
    },
    {
      id: 'ceftriaxone-2g12h',
      libelle: '2 g toutes les 12 h (forte posologie : souche « I », endocardite à E. faecalis en association)',
      indication: 'Endocardite à E. faecalis : amoxicilline + ceftriaxone 4 g/j en 2 doses (ESC 2023, SPILF/AEPEI 2025) ; souche catégorisée « sensible à forte posologie » (I) (SPILF/SFPT/CA-SFM : forte posologie 2 g toutes les 12 h ; EUCAST : 2 g × 2 ou 4 g × 1).',
      dose: { type: 'fixe', valeur: 2, unite: 'g', frequenceParJour: 2 },
      voie: 'IV',
      modalites: 'perfusion de 30 min toutes les 12 h',
      statut: 'verifiee_ia',
      sources: [S('ESC-2023-endocardite', 'Recommendation Table 9 (EHJ p. 3982)', 'Ceftriaxone 4 g/day i.v. in 2 doses', 'posologie'), S('SPILF-AEPEI-2025-endocardite', 'diapo 11', 'Ceftriaxone : 2 g/12h', 'posologie'), S(SRC_DOSES_2026, 'Annexe 9 (ceftriaxone)', 'forte posologie : 2 g toutes les 12 h', 'posologie')],
    },
    // Méningite bactérienne (docs/sources/recherche-meningites.md §1, §9.8 point 1, §10.2) : doses SPILF au-dessus du RCP.
    {
      id: 'ceftriaxone-meninge-100',
      libelle: '100 mg/kg/j IV en 1 ou 2 perfusions — méningite (pneumocoque, examen direct négatif) — au-dessus du RCP',
      indication: 'Méningite bactérienne : cocci à Gram positif ou pneumocoque, examen direct négatif, pneumocoque de CMI C3G > 0,5 mg/L (SPILF 2018).',
      dose: { type: 'ponderale', valeur: 50, unite: 'mg/kg', frequenceParJour: 2, poidsReference: 'total' },
      voie: 'IV',
      modalites: 'Dose journalière en 1 ou 2 perfusions (SPILF 2018), affichée en 2 perfusions (RCP : 2 administrations par jour envisageables au-delà de 2 g/j) ; une prise unique n\'est pas imposée. Hors RCP : le RCP prévoit 2 à 4 g par jour pour la méningite ; 100 mg/kg/j dépasse 4 g/j dès 40 kg. Pas de dose maximale consensuelle (SPILF). Poids de référence non précisé par la source (poids réel retenu par l\'application).',
      statut: 'brouillon',
      sources: [
        S('SPILF-2018-meningites', 'p. 21, §12.8.1.1 ; Tableau 8 p. 22', '[reformulation] ceftriaxone 100 mg/kg/j en 1 ou 2 perfusions', 'posologie'),
        S('RCP-ceftriaxone', '§4.2', 'méningite bactérienne « 2-4 g » « Une fois par jour »', 'posologie'),
      ],
      remarques: 'Écart au RCP signalé (recherche-meningites.md §9.8, point 1) : dose recommandée SPILF supérieure au maximum du RCP.',
      adaptationRenale: renalCeftriaxoneMeninge(100),
    },
    {
      id: 'ceftriaxone-meninge-75',
      libelle: '75 mg/kg/j IV en 1 ou 2 perfusions — méningite (méningocoque, H. influenzae, E. coli) — au-dessus du RCP',
      indication: 'Méningite bactérienne : cocci à Gram négatif ou méningocoque, bacille à Gram négatif, H. influenzae, E. coli ; pneumocoque de CMI amoxicilline > 0,5 mg/L (SPILF 2018).',
      dose: { type: 'ponderale', valeur: 37.5, unite: 'mg/kg', frequenceParJour: 2, poidsReference: 'total' },
      voie: 'IV',
      modalites: 'Dose journalière en 1 ou 2 perfusions (SPILF 2018), affichée en 2 perfusions (RCP : 2 administrations par jour envisageables au-delà de 2 g/j) ; une prise unique n\'est pas imposée. Hors RCP : le RCP prévoit 2 à 4 g par jour pour la méningite ; 75 mg/kg/j dépasse 4 g/j au-delà de 53 kg. Poids de référence non précisé par la source (poids réel retenu par l\'application).',
      statut: 'brouillon',
      sources: [
        S('SPILF-2018-meningites', 'p. 21, §12.8.1.2', '[reformulation] ceftriaxone 75 mg/kg/j en 1 ou 2 perfusions', 'posologie'),
        S('RCP-ceftriaxone', '§4.2', 'méningite bactérienne « 2-4 g » « Une fois par jour »', 'posologie'),
      ],
      remarques: 'Écart au RCP signalé (recherche-meningites.md §9.8, point 1).',
      adaptationRenale: renalCeftriaxoneMeninge(75),
    },
    // Prophylaxie du portage de méningocoque (docs/sources/recherche-meningites.md §5, §9.8 point 11) : dose absente du RCP.
    {
      id: 'ceftriaxone-prophylaxie-iim-250',
      libelle: '250 mg en injection unique — prophylaxie des infections invasives à méningocoque (hors RCP)',
      indication: 'Prophylaxie du portage de méningocoque (instruction DGS 2018 : en cas de contre-indication, de résistance ou d\'infections répétées ; DGS-Urgent 2025_06 relayé par l\'AP-HP : si la souche est résistante à la ciprofloxacine ou non documentée).',
      dose: { type: 'fixe', valeur: 250, unite: 'mg', frequenceParJour: 1, texte: '250 mg en injection unique' },
      voie: 'IM ou IV',
      modalites: 'Injection unique. Posologie absente du RCP (pas d\'indication de prophylaxie des IIM) : usage recommandé par la DGS, hors RCP.',
      statut: 'brouillon',
      sources: [
        S('DGS-2018-IIM', 'p. 18, fiche 8-2', 'Ceftriaxone par voie injectable, en dose unique : Adulte : injection unique de 250 mg', 'posologie'),
        S('SPILF-2018-IIM-diapo', 'dia 6', 'ceftriaxone IV dose unique (250 mg chez l\'adulte', 'posologie'),
      ],
      remarques: 'Écart au RCP signalé (recherche-meningites.md §9.8, point 11).',
    },
    {
      id: 'ceftriaxone-iia',
      libelle: '1 à 2 g toutes les 24 h (infection intra-abdominale, posologie usuelle)',
      indication: 'Infection intra-abdominale communautaire sans sepsis ni choc, avec le métronidazole (SFAR 2026, Annexe 1, colonne « usuelles » ; RCP : infections intra-abdominales).',
      dose: { type: 'fixe', valeur: 2, unite: 'g', frequenceParJour: 1, texte: '1 à 2 g toutes les 24 h' },
      voie: 'IV',
      modalites: 'perfusion de 30 min ou IV directe, 1 fois par 24 h',
      statut: 'verifiee_ia',
      sources: [S('SFAR-2026-IIA', 'Annexe 1, p. 73-74 (usuelles)', '1-2 g/j IV', 'posologie'), S('RCP-ceftriaxone', '§4.2 (infections intra-abdominales)', '1‑2 g Une fois par jour', 'posologie')],
    },
    {
      id: 'ceftriaxone-iia-rea',
      libelle: '2 g toutes les 12 h (infection intra-abdominale, réanimation, patient grave)',
      indication: 'Infection intra-abdominale du patient grave (SFAR 2026, Annexe 1, colonne « réanimation, patient grave »).',
      dose: { type: 'fixe', valeur: 2, unite: 'g', frequenceParJour: 2 },
      voie: 'IV',
      modalites: 'perfusion de 30 min toutes les 12 h',
      statut: 'verifiee_ia',
      sources: [S('SFAR-2026-IIA', 'Annexe 1, p. 73-74 (réanimation)', '2 g/12h IV en perfusion de 30 min', 'posologie')],
      remarques: 'Au-delà de la ligne « infections intra-abdominales » du RCP (1-2 g une fois par jour).',
    },
    // Pneumonies (docs/sources/recherche-pneumonies.md).
    {
      id: 'ceftriaxone-pac-1g',
      libelle: '1 g toutes les 24 h IV, IM ou SC (pneumonie hors soins critiques)',
      indication: 'PAC ambulatoire avec comorbidité et allergie non grave aux pénicillines (HAS 2025) ; PAC hospitalisée non grave (SPILF 2025) ; pneumonie d\'inhalation (SPILF/SFGG 2025).',
      dose: { type: 'fixe', valeur: 1, unite: 'g', frequenceParJour: 1 },
      voie: 'IM ou IV',
      modalites: 'IV, IM ou SC, 1 fois par 24 h (voie SC citée par la HAS et la SPILF/SFGG)',
      statut: 'verifiee_ia',
      sources: [S('SPILF-SPLF-2025-PAC', 'tableau 10, p. 8', 'Ceftriaxone « 1 g x 1/j »', 'posologie'), S('HAS-2025-PAC-adulte-ambulatoire', 'comorbidités, allergie aux pénicillines', 'ceftriaxone : 1g 1 fois par jour par voie IM, IV ou SC', 'posologie'), S('SPILF-SFGG-2025-inhalation-diapo', 'diapo 11', 'Pas d\'adaptation : 1g/24h, IV ou SC', 'posologie')],
    },
    {
      id: 'ceftriaxone-pac-2g',
      libelle: '2 g toutes les 24 h IV (PAC grave, soins critiques)',
      indication: 'PAC grave : C3G associée à un macrolide (SPILF 2025, tableau 10, colonne soins critiques).',
      dose: { type: 'fixe', valeur: 2, unite: 'g', frequenceParJour: 1 },
      voie: 'IV',
      modalites: 'perfusion de 30 min, 1 fois par 24 h',
      statut: 'verifiee_ia',
      sources: [S('SPILF-SPLF-2025-PAC', 'tableau 10, p. 8 (soins critiques)', '2 g x 1/j', 'posologie')],
    },
  ],
  adaptationRenale: {
    methode: 'non_precisee',
    statut: 'verifiee_ia',
    texteGeneral: 'Pas de réduction de dose en insuffisance rénale si la fonction hépatique est conservée.',
    paliers: [
      { clcrMin: 10, texte: 'Pas d\'adaptation.', sources: [S('RCP-ceftriaxone', '§4.2', 'Il n\'est pas nécessaire de réduire la dose de ceftriaxone en cas d\'insuffisance rénale', 'adaptation_renale')] },
      { clcrMax: 10, texte: 'ClCr < 10 mL/min : ne pas dépasser 2 g/jour.', sources: [S('RCP-ceftriaxone', '§4.2', 'ClCr < 10 mL/min : ne pas dépasser « 2 g par jour »', 'adaptation_renale')] },
    ],
    hemodialyse: { texte: 'Non dialysable : pas de dose supplémentaire ; ne pas dépasser 2 g/jour.', sources: [S('RCP-ceftriaxone', '§4.2', 'hémodialyse : pas de dose supplémentaire (non dialysable)', 'adaptation_renale')] },
  },
  insuffisanceHepatique: { texte: 'Insuffisance hépatique sévère : aucune donnée d\'étude ; en cas d\'insuffisance rénale associée, surveiller et ne pas dépasser 2 g/jour.', sources: [S('RCP-ceftriaxone', '§4.2', 'insuffisance hépatique sévère : « Aucune donnée issue d\'études n\'est disponible »', 'adaptation_renale')] },
  surveillance: [
    encephalopathieBetaLactamine('ceftriaxone-encephalopathie', 'RCP-ceftriaxone', '§4.4', '[résumé de la fiche de vérification, non verbatim] encéphalopathie signalée surtout chez le sujet âgé et en insuffisance rénale grave'),
    {
      id: 'ceftriaxone-calcium',
      type: 'interaction',
      categorie: 'systematique',
      quoi: 'Ne pas mélanger ni co-administrer avec des solutions calciques (précipités) ; surveillance des précipités biliaires en cas de traitement prolongé',
      quand: { ancre: 'debut_traitement', texte: 'À chaque administration' },
      pourquoi: 'Précipitation ceftriaxone-calcium ; pseudo-lithiase biliaire.',
      statut: 'verifiee_ia',
      sources: [S('RCP-ceftriaxone', '§4.4', 'calcium (pas de mélange/co-administration), précipités biliaires', 'surveillance')],
    },
    stpBetaLactamineReanimation('ceftriaxone-stp'),
  ],
  grossesse: { statut: 'utilisable', texte: 'Utilisable quel que soit le terme.', sources: [CRAT_CEPH] },
};

/* ------------------------------------------------------------------ */
export const cloxacilline: Molecule = {
  id: 'cloxacilline',
  dci: 'Cloxacilline',
  famille: 'penicilline',
  chaineLaterale: 'isoxazolyl-pénicilline (cloxacilline, oxacilline)',
  statut: 'verifiee_ia',
  regimens: [
    {
      id: 'cloxacilline-2g-x6',
      libelle: '2 g toutes les 4 h (12 g/j) — bactériémie et endocardite à SASM',
      indication: 'Bactériémie et endocardite à S. aureus sensible à la méticilline (ESC 2023 : 12 g/j en 4-6 doses ; SPILF/SFPT/CA-SFM : 100-200 mg/kg/j en 6 administrations).',
      dose: { type: 'fixe', valeur: 2, unite: 'g', frequenceParJour: 6, doseMaxParJour: { valeur: 12, unite: 'g' } },
      voie: 'IV',
      modalites: 'perfusion de 30 à 60 min toutes les 4 h (ou perfusion continue 150-200 mg/kg/j après dose de charge de 2 g : SPILF/AEPEI)',
      statut: 'verifiee_ia',
      sources: [S('ESC-2023-endocardite', 'Recommendation Table 8 (EHJ p. 3980)', '(Flu)cloxacillin 12 g/day i.v. in 4-6 doses', 'posologie'), S(SRC_DOSES_2026, 'Annexe 9 (cloxacilline)', 'Cloxacilline 100 à 200 mg/kg/jour en 6 administrations', 'posologie'), S('SPILF-AEPEI-2025-endocardite', 'diapo 16', '(Cl)oxacilline : 150 à 200 mg/kg/j en perf continue après dose de charge de 2g… ou en 6 inj', 'posologie'), S('RCP-cloxacilline', '§4.2', '8 à 12 g/jour, répartis en 4 à 6 administrations journalières', 'posologie')],
      remarques: 'Pour un poids < 60 kg, 12 g/j dépasse 200 mg/kg/j : ajuster à 150-200 mg/kg/j.',
    },
    {
      id: 'cloxacilline-100mgkg-abces',
      libelle: '100 mg/kg/j IV (maximum 12 g/j) — abcès cutané',
      indication: 'Abcès cutané, en complément du drainage, si la voie IV est nécessaire (HAS 2021 ; SPILF 2023 pour le pied diabétique).',
      // Fréquence : les sources donnent 4 à 6 administrations par jour ; l'application affiche 6 (choix dans la fourchette).
      dose: { type: 'ponderale', valeur: 100 / 6, unite: 'mg/kg', frequenceParJour: 6, poidsReference: 'total', doseMaxParJour: { valeur: 12, unite: 'g' } },
      voie: 'IV',
      modalites: '100 mg/kg/j (HAS 2021) affichés en 6 administrations ; les sources donnent 4 à 6 administrations par jour (tableau 1 de HAS 2019, RCP) ; sans dépasser 12 g/j (HAS 2019 : 6 à 12 g/j ; RCP : 8 à 12 g/j) ; pas de voie orale (mauvaise biodisponibilité)',
      statut: 'verifiee_ia',
      sources: [S('HAS-2021-abces-cutanes', 'antibiothérapie', 'oxacilline ou cloxacilline IV : 100 mg/kg/j', 'posologie'), S('HAS-2019-infections-cutanees', 'annexe 1, tableau 1, p. 29', '6 à 12 g/jour', 'posologie'), S('RCP-cloxacilline', '§4.2', '8 à 12 g/jour, répartis en 4 à 6 administrations journalières', 'posologie')],
      remarques: 'Unités divergentes entre sources (g/j dans HAS 2019, mg/kg/j dans la fiche HAS 2021 et SPILF 2023) : les deux sont affichées.',
    },
  ],
  adaptationRenale: {
    methode: 'Cockcroft',
    statut: 'verifiee_ia',
    paliers: [
      { clcrMin: 30, texte: 'ClCr > 30 mL/min : pas d\'adaptation.', sources: [S('RCP-cloxacilline', '§4.2', 'ClCr > 30 ml/min pas d\'adaptation', 'adaptation_renale')] },
      { clcrMax: 30, texte: 'ClCr < 30 mL/min : réduire de moitié la dose journalière (idem si insuffisance hépatique associée à une insuffisance rénale).', sources: [S('RCP-cloxacilline', '§4.2', 'ClCr < 30 ml/min « réduire de moitié la dose journalière »', 'adaptation_renale')] },
    ],
    hemodialyse: { texte: 'Non traitée dans le RCP : avis pharmacologique (dose réduite de moitié comme pour ClCr < 30).', sources: [S('RCP-cloxacilline', '§4.2', 'hémodialyse : non traitée', 'adaptation_renale')] },
  },
  insuffisanceHepatique: { texte: 'Insuffisance hépatique associée à une insuffisance rénale (quel que soit le degré) : moitié de la dose.', sources: [S('RCP-cloxacilline', '§4.2', 'insuffisance hépatique associée à une IR : moitié de la dose', 'adaptation_renale')] },
  surveillance: [
    {
      id: 'cloxacilline-kaliemie-renal',
      type: 'biologique',
      categorie: 'systematique',
      quoi: 'Kaliémie et créatininémie (fortes doses) ; bilan hépatique si traitement prolongé',
      quand: { ancre: 'avant_traitement', texte: 'Avant traitement puis régulièrement (fréquence non chiffrée par le RCP)', repetition: 'régulièrement' },
      pourquoi: 'Hypokaliémie, lésions rénales aiguës à forte dose, hépatotoxicité.',
      statut: 'verifiee_ia',
      sources: [S('RCP-cloxacilline', '§4.4', 'hypokaliémie (surveillance K+ « doit être envisagée ») ; lésions rénales aiguës à forte dose', 'surveillance')],
    },
    encephalopathieBetaLactamine('cloxacilline-encephalopathie', 'RCP-cloxacilline'),
    stpBetaLactamineReanimation('cloxacilline-stp'),
  ],
  grossesse: { statut: 'utilisable', texte: 'Pénicillines utilisables quel que soit le terme.', sources: [CRAT_PENI] },
};

/* ------------------------------------------------------------------ */
export const cefazoline: Molecule = {
  id: 'cefazoline',
  dci: 'Céfazoline',
  famille: 'cephalosporine',
  chaineLaterale: 'céfazoline : chaînes latérales propres, différentes des pénicillines et des autres céphalosporines de la base (connaissance non vérifiée dans une source lue)',
  statut: 'verifiee_ia',
  regimens: [
    {
      id: 'cefazoline-2g-x3',
      libelle: '2 g toutes les 8 h (6 g/j) — bactériémie et endocardite à SASM',
      indication: 'Bactériémie et endocardite à SASM (ESC 2023 : 6 g/j en 3 doses ; SPILF/SFPT/CA-SFM : 2 g/8 h ou 80-100 mg/kg/j). Alternative à la cloxacilline, mieux tolérée.',
      dose: { type: 'fixe', valeur: 2, unite: 'g', frequenceParJour: 3 },
      voie: 'IV',
      modalites: 'perfusion de 60 min toutes les 8 h (ou perfusion continue après dose de charge de 2 g)',
      statut: 'verifiee_ia',
      sources: [S('ESC-2023-endocardite', 'Recommendation Table 8 (EHJ p. 3980)', 'Cefazolin 6 g/day i.v. in 3 doses', 'posologie'), S(SRC_DOSES_2026, 'Annexe 9 (céfazoline)', 'Céfazoline … 2 g toutes les 8 h ou 80 à 100 mg/kg/jour en 3 administrations', 'posologie'), S('SPILF-AEPEI-2025-endocardite', 'diapo 13, 16', 'Céfazoline Ou (Cl)oxacilline ; Céfazoline : 100mg/kg/j IV en 3 inj', 'choix'), S('SPILF-2025-DESC-SAB-Tattevin', 'messages clés', 'Péni M (anti-staph) ou céfazoline > autres Beta-lactamines si SAMS', 'choix')],
      remarques: 'ESC 2023 (Recommendation Table 8, note e) : « Cefazolin can replace cloxacillin only in patients with non-immediate-type hypersensitivity reactions to penicillin » — en cas d\'allergie à la pénicilline, la céfazoline ne remplace la cloxacilline que si la réaction n\'était pas immédiate. Divergence : SPILF 2026 (d\'après ESCMID 2026) admet une céphalosporine à chaînes latérales différentes en cas de réaction immédiate non grave. Rang 1 de la céfazoline = choix de l\'application (sources : céfazoline OU cloxacilline, à égalité).',
    },
    {
      id: 'cefazoline-80mgkg-abces',
      libelle: '80 mg/kg/j IV en 3 administrations — abcès cutané',
      indication: 'Abcès cutané, en complément du drainage, si la voie IV est nécessaire (HAS 2021).',
      dose: { type: 'ponderale', valeur: 80 / 3, unite: 'mg/kg', frequenceParJour: 3, poidsReference: 'total', doseMaxParJour: { valeur: 6, unite: 'g' } },
      voie: 'IV',
      modalites: 'perfusion IV toutes les 8 h ; sans dépasser 6 g/j (tableau 1 de HAS 2019 : 3 à 6 g/j)',
      statut: 'verifiee_ia',
      sources: [S('HAS-2021-abces-cutanes', 'antibiothérapie', 'céfazoline IV : 80 mg/kg/j', 'posologie'), S('HAS-2019-infections-cutanees', 'annexe 1, tableau 1, p. 29', '3 à 6 g/jour', 'posologie')],
      remarques: 'SPILF 2023 (pied diabétique) : 80-100 mg/kg/j. Unités divergentes entre sources (g/j dans HAS 2019, mg/kg/j dans la fiche HAS 2021).',
    },
  ],
  adaptationRenale: {
    methode: 'non_precisee',
    statut: 'verifiee_ia',
    paliers: [
      { clcrMin: 55, texte: 'ClCr ≥ 55 mL/min : dose normale.', sources: [S('RCP-cefazoline', '§4.2 (tableau IR)', 'ClCr ≥ 55 : dose normale', 'adaptation_renale')] },
      { clcrMin: 35, clcrMax: 55, texte: 'ClCr 35-54 mL/min : dose normale, intervalle ≥ 8 h.', sources: [S('RCP-cefazoline', '§4.2 (tableau IR)', '35-54 : dose normale, intervalle ≥ 8 h', 'adaptation_renale')] },
      { clcrMin: 11, clcrMax: 35, texte: 'ClCr 11-34 mL/min : moitié de la dose toutes les 12 h.', sources: [S('RCP-cefazoline', '§4.2 (tableau IR)', '11-34 : moitié de dose /12 h', 'adaptation_renale')] },
      { clcrMax: 11, texte: 'ClCr ≤ 10 mL/min : quart de la dose toutes les 18-24 h.', sources: [S('RCP-cefazoline', '§4.2 (tableau IR)', '≤ 10 : quart de dose /18-24 h', 'adaptation_renale')] },
    ],
    hemodialyse: { texte: 'Posologie « dépendra des conditions de dialyse » (RCP, sans chiffre) : avis pharmacologique.', sources: [S('RCP-cefazoline', '§4.2', 'la posologie dépendra des conditions de dialyse', 'adaptation_renale')] },
  },
  surveillance: [encephalopathieBetaLactamine('cefazoline-encephalopathie', 'RCP-cefazoline', '§4.4', 'L\'exposition aux bêta-lactamines est associée au risque d\'encéphalopathie'), stpBetaLactamineReanimation('cefazoline-stp')],
  grossesse: { statut: 'utilisable', texte: 'Utilisation possible, en particulier au-delà du 1er trimestre (CRAT).', sources: [S('CRAT-cephalosporines-grossesse', 'En pratique', "L'utilisation de la céfazoline est possible, en particulier au-delà du 1er trimestre", 'autre')] },
};

/* ------------------------------------------------------------------ */
export const amoxicilline: Molecule = {
  id: 'amoxicilline',
  dci: 'Amoxicilline',
  famille: 'penicilline',
  chaineLaterale: 'aminopénicilline (amoxicilline, ampicilline ; R1 identique ou proche de céfadroxil/céfalexine/céfaclor — connaissance non vérifiée dans une source lue)',
  statut: 'verifiee_ia',
  regimens: [
    {
      id: 'amoxicilline-po-1g8h',
      libelle: '1 g toutes les 8 h per os (relais documenté, souche sensible)',
      indication: 'Relais oral de PNA / IU masculine à entérobactérie sensible : à privilégier (SPILF 2015, HAS 2021, SPILF 2026).',
      dose: { type: 'fixe', valeur: 1, unite: 'g', frequenceParJour: 3 },
      voie: 'PO',
      modalites: 'per os toutes les 8 h',
      statut: 'verifiee_ia',
      sources: [S('SPILF-2026-IUM', 'diapo 23-24', 'Amoxicilline 1 gx3/jour', 'posologie'), S('HAS-2021-PNA-femme', 'tableau relais', 'amoxicilline 1 g ×3/j 10 j', 'posologie'), S('SPILF-2015-IU', 'p. 19 ; annexe 1', 'amoxicilline (à privilégier sur souche sensible)', 'choix')],
    },
    {
      id: 'amoxicilline-po-50mgkg',
      libelle: '50 mg/kg/j per os en 3 prises (maximum 6 g/j) — DHBNN',
      indication: 'Dermohypodermite bactérienne non nécrosante (érysipèle) de l\'adulte (HAS 2019, fiche HAS 2021).',
      dose: { type: 'ponderale', valeur: 50 / 3, unite: 'mg/kg', frequenceParJour: 3, poidsReference: 'total', doseMaxParJour: { valeur: 6, unite: 'g' } },
      voie: 'PO',
      modalites: 'per os en 3 prises par jour, sans dépasser 6 g/j ; obésité : adapter les doses (HAS 2019)',
      statut: 'verifiee_ia',
      sources: [S('HAS-2021-DHBNN-adulte', 'traitement', 'amoxicilline : 50 mg/kg/j en 3 prises (sans dépasser 6 g/j) pendant 7 jours', 'posologie'), S('HAS-2019-infections-cutanees', '§ 1.8.2, p. 13 (AE)', 'amoxicilline : 50 mg/kg/jour en trois prises avec un maximum de 6 g/jour', 'posologie')],
    },
    {
      id: 'amoxicilline-iv-std',
      libelle: '1 g toutes les 6 h IV (posologie standard, ~50-100 mg/kg/j)',
      indication: 'Bactériémie à entérocoque ou streptocoque sensible sans endocardite (posologie standard du tableau SPILF/SFPT/CA-SFM).',
      dose: { type: 'fixe', valeur: 1, unite: 'g', frequenceParJour: 4 },
      voie: 'IV',
      modalites: 'perfusion de 30 à 60 min toutes les 6 h',
      statut: 'verifiee_ia',
      sources: [S(SRC_DOSES_2026, 'Annexe 9 (amoxicilline)', 'Amoxicilline iv 50 à 100 mg/kg/jour [standard]', 'posologie'), S('RCP-amoxicilline', '§4.2', '750 mg à 2 g toutes les 8 heures, ou 2 g toutes les 12 heures, au maximum 12 g/ jour', 'posologie')],
    },
    {
      id: 'amoxicilline-iv-fort',
      libelle: '200 mg/kg/j IV en 6 administrations (max 12 g/j) — endocardite, forte posologie',
      indication: 'Endocardite à streptocoque (100-200 mg/kg/j) ou à E. faecalis (200 mg/kg/j, max 12 g/j) ; souche « I ».',
      dose: { type: 'ponderale', valeur: 33.3, unite: 'mg/kg', frequenceParJour: 6, poidsReference: 'total', doseMaxParAdministration: { valeur: 2, unite: 'g' }, doseMaxParJour: { valeur: 12, unite: 'g' } },
      voie: 'IV',
      modalites: 'perfusion de 30 à 60 min toutes les 4 h (200 mg/kg/j), sans dépasser 12 g/j ; ou perfusion continue après dose de charge de 2 g',
      statut: 'verifiee_ia',
      sources: [S('ESC-2023-endocardite', 'Recommendation Table 7 et 9', 'Amoxicillin 100-200 mg/kg/day i.v. in 4-6 doses ; Amoxicillin 200 mg/kg/day i.v. in 4-6 doses', 'posologie'), S('SPILF-AEPEI-2025-endocardite', 'diapo 11', 'Amoxicilline : 200 mg/kg/j en 6 inj/j… sans dépasser 12g/j', 'posologie'), S(SRC_DOSES_2026, 'Annexe 9 (amoxicilline)', '100 à 200 mg/kg/jour en 6 administrations (toutes les 4 h)', 'posologie')],
    },
    // Méningite bactérienne (docs/sources/recherche-meningites.md §1, §9.8 point 1, §10.2) : pas de plafond SPILF ; au-dessus du maximum du RCP.
    {
      id: 'amoxicilline-meninge-200',
      libelle: '200 mg/kg/j IV — méningite (Listeria, S. agalactiae, pneumocoque sensible) — sans plafond, au-dessus du RCP',
      indication: 'Méningite bactérienne : bacille à Gram positif ou Listeria (avec gentamicine), examen direct négatif avec arguments pour une listériose, pneumocoque de CMI C3G et amoxicilline ≤ 0,5 mg/L, S. agalactiae (SPILF 2018).',
      dose: { type: 'ponderale', valeur: 33.3, unite: 'mg/kg', frequenceParJour: 6, poidsReference: 'total' },
      voie: 'IV',
      modalites: '200 mg/kg/j en 4 à 6 perfusions ou en perfusion continue (SPILF 2018), affichés ici en 6 perfusions. Hors RCP : le RCP prévoit pour la méningite 1 à 2 g toutes les 4 à 6 h, au maximum 12 g/j (dépassé au-delà de 60 kg). Poids de référence non précisé par la source (poids réel retenu par l\'application).',
      statut: 'brouillon',
      sources: [
        S('SPILF-2018-meningites', 'p. 21, §12.8.1.3', '[reformulation] amoxicilline 200 mg/kg/j IV en 4 à 6 perfusions', 'posologie'),
        S('RCP-amoxicilline', '§4.2', 'Méningite bactérienne 1 g à 2 g toutes les 4 à 6 heures, au maximum 12 g/jour', 'posologie'),
      ],
      remarques: 'Écart au RCP signalé (recherche-meningites.md §9.8, point 1) : pas de plafond à 12 g/j dans la recommandation SPILF.',
      adaptationRenale: RENAL_AMOXICILLINE_MENINGE,
    },
    // Pneumonies (docs/sources/recherche-pneumonies.md).
    {
      id: 'amoxicilline-pac-1g8h',
      libelle: '1 g toutes les 8 h per os ou IV (pneumonie hors soins critiques)',
      indication: 'PAC ambulatoire sans comorbidité (SPILF 2025 B-1, HAS 2025) ; PAC hospitalisée non grave sans comorbidité, per os ou IV (SPILF 2025 A-1).',
      dose: { type: 'fixe', valeur: 1, unite: 'g', frequenceParJour: 3 },
      voie: 'IV ou PO',
      modalites: 'per os (ambulatoire) ou IV toutes les 8 h',
      statut: 'verifiee_ia',
      sources: [S('SPILF-SPLF-2025-PAC', 'tableau 10, p. 8', 'Amoxicilline « 1 g x 3/j »', 'posologie'), S('HAS-2025-PAC-adulte-ambulatoire', '1re intention sans comorbidité', 'amoxicilline 1g 3 fois par jour', 'posologie')],
    },
  ],
  adaptationRenale: {
    methode: 'non_precisee',
    statut: 'verifiee_ia',
    texteGeneral: 'Paliers du RCP exprimés en DFG (mL/min).',
    paliers: [
      { clcrMin: 30.01, texte: 'DFG > 30 mL/min : pas d\'adaptation.', sources: [S('RCP-amoxicilline', '§4.2 (tableau)', '> 30 : pas d\'adaptation', 'adaptation_renale')] },
      { clcrMin: 10, clcrMax: 30.01, texte: 'DFG 10-30 mL/min : 1 g immédiatement, puis 500 mg à 1 g deux fois par jour.', sources: [S('RCP-amoxicilline', '§4.2 (tableau)', '10-30 : « 1 g immédiatement, puis 500 mg à 1 g deux fois par jour »', 'adaptation_renale')] },
      { clcrMax: 10, texte: 'DFG < 10 mL/min : 1 g immédiatement, puis 500 mg/jour.', sources: [S('RCP-amoxicilline', '§4.2 (tableau)', '< 10 : « 1 g immédiatement, puis 500 mg/jour »', 'adaptation_renale')] },
    ],
    hemodialyse: { texte: '1 g en fin de dialyse, puis 500 mg toutes les 24 h.', sources: [S('RCP-amoxicilline', '§4.2', 'hémodialyse : « 1 g en fin de dialyse, puis 500 mg toutes les 24 heures »', 'adaptation_renale')] },
  },
  surveillance: [
    {
      id: 'amoxicilline-cristallurie',
      type: 'clinique',
      categorie: 'conditionnelle',
      quoi: 'Hydratation et diurèse adéquates (cristallurie) ; surveillance des convulsions à forte dose ou en insuffisance rénale',
      quand: { ancre: 'quotidien', texte: 'Pendant toute la durée du traitement à forte dose' },
      pourquoi: 'Cristallurie à forte dose ; convulsions en cas d\'insuffisance rénale ou de doses élevées.',
      conditionId: 'insuffisance_renale',
      conditionTexte: 'si forte posologie ou insuffisance rénale',
      statut: 'verifiee_ia',
      sources: [S('RCP-amoxicilline', '§4.4', 'cristallurie (« maintenir un apport hydrique et une émission d\'urine adéquats ») ; « Des convulsions peuvent apparaitre chez les patients insuffisant rénaux ou recevant des doses élevées »', 'surveillance')],
    },
    stpBetaLactamineReanimation('amoxicilline-stp'),
  ],
  grossesse: { statut: 'utilisable', texte: 'Utilisable quel que soit le terme.', sources: [CRAT_PENI] },
};

/* ------------------------------------------------------------------ */
export const amoxicillineClavulanate: Molecule = {
  id: 'amoxicilline_clavulanate',
  dci: 'Amoxicilline-acide clavulanique',
  famille: 'penicilline',
  chaineLaterale: 'aminopénicilline',
  statut: 'verifiee_ia',
  regimens: [
    {
      id: 'amoxclav-po-1g8h',
      libelle: '1 g toutes les 8 h per os (relais documenté)',
      indication: 'Relais oral de PNA / IU masculine (après amoxicilline et cotrimoxazole dans l\'ordre de préférence).',
      dose: { type: 'fixe', valeur: 1, unite: 'g', frequenceParJour: 3 },
      voie: 'PO',
      modalites: 'per os toutes les 8 h',
      statut: 'verifiee_ia',
      sources: [S('SPILF-2026-IUM', 'diapo 23-24', 'Amoxicilline-acide clavulanique 1 gx3/jour', 'posologie'), S('HAS-2021-PNA-femme', 'tableau relais', 'amox-clav 1 g ×3/j 10 j', 'posologie')],
    },
    {
      id: 'amoxclav-po-diverticulite',
      libelle: '1 g 3 fois par jour per os (diverticulite non compliquée sans réponse au traitement symptomatique)',
      indication: 'Diverticulite non compliquée sans réponse au traitement symptomatique (HAS 2021).',
      dose: { type: 'fixe', valeur: 1, unite: 'g', frequenceParJour: 3 },
      voie: 'PO',
      modalites: 'per os toutes les 8 h',
      statut: 'verifiee_ia',
      sources: [S('HAS-2021-diverticulite', 'fiche mémo', 'amoxicilline-acide clavulanique : 1 g 3 fois par jour pendant 7 jours', 'posologie')],
    },
    {
      id: 'amoxclav-po-50mgkg-morsure',
      libelle: '50 mg/kg/j d\'amoxicilline per os en 3 prises (maximum 6 g/j ; acide clavulanique ≤ 375 mg/j) — DHBNN après morsure',
      indication: 'Dermohypodermite après morsure (traitement curatif) : HAS 2019 § 1.8.2, fiche HAS 2021.',
      dose: { type: 'ponderale', valeur: 50 / 3, unite: 'mg/kg', frequenceParJour: 3, poidsReference: 'total', doseMaxParJour: { valeur: 6, unite: 'g' } },
      voie: 'PO',
      modalites: 'per os en 3 prises par jour ; dose exprimée en amoxicilline, sans dépasser 6 g/j d\'amoxicilline ni 375 mg/j d\'acide clavulanique (le tableau 1 de HAS 2019 indique 250 mg/j : incohérence de la source signalée)',
      statut: 'verifiee_ia',
      sources: [
        S('HAS-2021-DHBNN-adulte', 'morsure animale', 'sans dépasser 375 mg par jour d\'acide clavulanique, pendant 7 jours', 'posologie'),
        S('HAS-2019-infections-cutanees', '§ 1.8.2, p. 13 (AE)', '50 mg/kg/jour d\'amoxicilline sans dépasser 6 g/jour, et sans dépasser 375 mg/jour d\'acide clavulanique', 'posologie'),
        S('HAS-2019-infections-cutanees', 'annexe 1, tableau 1, p. 29', '50 mg/kg/jour d\'amoxicilline sans dépasser 250mg/jour d\'acide clavulanique', 'posologie'),
      ],
      remarques: 'Plafond d\'acide clavulanique divergent dans HAS 2019 (375 mg/j au § 1.8.2, 250 mg/j au tableau 1) ; la fiche HAS 2021 (mise à jour 2024) retient 375 mg/j. Le plafond d\'acide clavulanique dépend de la présentation choisie : il n\'est pas calculé par l\'application.',
    },
    // Peau et tissus mous (docs/sources/recherche-peau-tissus-mous.md § 5, § 8, § 13.3) : régimes propres, sources propres.
    {
      id: 'amoxclav-po-1g8h-peau',
      libelle: '1 g toutes les 8 h per os — morsure (préemptif) ; pied diabétique',
      indication: 'Plaie de morsure sans signe d\'infection, traitement préemptif (SFMU 2017) ; infection de plaie du pied diabétique, grade 2 sur plaie chronique à grade 4 sans sepsis (SPILF 2023).',
      dose: { type: 'fixe', valeur: 1, unite: 'g', frequenceParJour: 3 },
      voie: 'PO',
      modalites: 'per os toutes les 8 h ; posologies SPILF 2023 « validées pour des patients dont l\'IMC est < 30 kg/m2 »',
      statut: 'verifiee_ia',
      sources: [S('SFMU-2017-plaies', 'p. 10', 'amoxicilline et acide clavulanique à la posologie de 1 g trois fois par jour', 'posologie'), S('SPILF-2023-pied-diabetique', 'diapo 26', 'PO : 1 g/8h', 'posologie')],
    },
    {
      id: 'amoxclav-iv-1g8h-peau',
      libelle: '1 g toutes les 8 h IV — pied diabétique',
      indication: 'Infection de plaie du pied diabétique, grades 2 à 4 sans sepsis, si la voie IV est nécessaire (SPILF 2023 : 1 à 2 g/8 h).',
      dose: { type: 'fixe', valeur: 1, unite: 'g', frequenceParJour: 3 },
      voie: 'IV',
      modalites: 'perfusion de 30 à 60 min toutes les 8 h ; SPILF 2023 : 1 à 2 g/8 h (bas de la fourchette affiché) ; posologies « validées pour des patients dont l\'IMC est < 30 kg/m2 »',
      statut: 'verifiee_ia',
      sources: [S('SPILF-2023-pied-diabetique', 'diapo 26', 'IV : 1-2 g/8h', 'posologie'), S('RCP-amoxicilline-clavulanate', '§4.2', '1 g/200 mg toutes les 8 heures', 'posologie')],
    },
    {
      id: 'amoxclav-iv-1g8h',
      libelle: '1 g/200 mg toutes les 8 h IV',
      indication: 'IU associée aux soins avec cocci à Gram positif à l\'examen direct (IUAS 2015 R.45) ; relais IV.',
      dose: { type: 'fixe', valeur: 1, unite: 'g', frequenceParJour: 3 },
      voie: 'IV',
      modalites: 'perfusion de 30 à 60 min toutes les 8 h (max 1,2 g d\'acide clavulanique/j)',
      statut: 'verifiee_ia',
      sources: [S('RCP-amoxicilline-clavulanate', '§4.2', '1 g/200 mg toutes les 8 heures', 'posologie'), S(SRC_DOSES_2026, 'Annexe 9 (amoxicilline-clavulanate)', '1 g + 0,2 g en perfusions de 30-60 min toutes les 8 à 6 h', 'posologie')],
    },
    // Pneumonies (docs/sources/recherche-pneumonies.md).
    {
      id: 'amoxclav-pac-1g8h',
      libelle: '1 g toutes les 8 h per os ou IV (pneumonie hors soins critiques)',
      indication: 'PAC avec comorbidité ou contexte grippal, ambulatoire ou hospitalisée non grave (SPILF 2025, HAS 2025) ; pneumonie d\'inhalation (SPILF/SFGG 2025, 1re intention).',
      dose: { type: 'fixe', valeur: 1, unite: 'g', frequenceParJour: 3 },
      voie: 'IV ou PO',
      modalites: 'per os (1 g/125 mg) ou IV toutes les 8 h',
      statut: 'verifiee_ia',
      sources: [S('SPILF-SPLF-2025-PAC', 'tableau 10, p. 8', 'Amoxicilline-acide clavulanique « 1 g x 3/j »', 'posologie'), S('HAS-2025-PAC-adulte-ambulatoire', 'comorbidités ou exposition aux antibiotiques', 'amoxicilline/acide clavulanique : 1g/125 mg 3 fois par jour', 'posologie'), S('SPILF-SFGG-2025-inhalation-diapo', 'diapo 11', '> 30 ml/min : 1g d\'amoxicilline toutes les 8h', 'posologie')],
    },
  ],
  adaptationRenale: {
    methode: 'Cockcroft',
    statut: 'verifiee_ia',
    paliers: [
      { clcrMin: 30.01, texte: 'ClCr > 30 mL/min : pas d\'adaptation.', sources: [S('RCP-amoxicilline-clavulanate', '§4.2', 'ClCr > 30 : pas d\'adaptation', 'adaptation_renale')] },
      { clcrMin: 10, clcrMax: 30.01, texte: 'ClCr 10-30 mL/min : 1 g/200 mg puis 500 mg/100 mg deux fois par jour.', sources: [S('RCP-amoxicilline-clavulanate', '§4.2', '10-30 : 1 g/200 mg puis « 500 mg/100 mg deux fois par jour »', 'adaptation_renale')] },
      { clcrMax: 10, texte: 'ClCr < 10 mL/min : 1 g/200 mg puis 500 mg/100 mg toutes les 24 h.', sources: [S('RCP-amoxicilline-clavulanate', '§4.2', '< 10 : 1 g/200 mg puis « 500 mg/100 mg toutes les 24 heures »', 'adaptation_renale')] },
    ],
    hemodialyse: { texte: 'Schéma ClCr < 10 mL/min + une dose de 500 mg/100 mg à la fin de la dialyse.', sources: [S('RCP-amoxicilline-clavulanate', '§4.2', '« une dose de 500 mg/100 mg à la fin de la dialyse »', 'adaptation_renale')] },
  },
  insuffisanceHepatique: { texte: 'Utiliser avec prudence et surveiller régulièrement la fonction hépatique.', sources: [S('RCP-amoxicilline-clavulanate', '§4.2', 'Utiliser avec prudence et surveiller la fonction hépatique régulièrement', 'surveillance')] },
  surveillance: [
    {
      id: 'amoxclav-hepatique',
      type: 'biologique',
      categorie: 'conditionnelle',
      quoi: 'Bilan hépatique',
      quand: { ancre: 'non_determine', texte: 'Régulièrement en cas d\'insuffisance hépatique ou de traitement prolongé (fréquence non chiffrée)' },
      pourquoi: 'Hépatotoxicité (cholestase), rare mais potentiellement grave.',
      conditionId: 'duree_sup_7j',
      conditionTexte: 'si traitement > 7 jours ou insuffisance hépatique',
      statut: 'verifiee_ia',
      sources: [S('RCP-amoxicilline-clavulanate', '§4.4', 'hépatotoxicité (« des décès ont été signalés dans des circonstances extrêmement rares »)', 'surveillance')],
    },
  ],
  grossesse: { statut: 'utilisable', texte: 'Pénicillines utilisables quel que soit le terme (CRAT).', sources: [CRAT_PENI] },
};

/* ------------------------------------------------------------------ */
export const piperacillineTazobactam: Molecule = {
  id: 'piperacilline_tazobactam',
  dci: 'Pipéracilline-tazobactam',
  famille: 'penicilline',
  chaineLaterale: 'uréidopénicilline',
  statut: 'verifiee_ia',
  regimens: [
    {
      id: 'piptazo-4g8h',
      libelle: '4 g/0,5 g toutes les 8 h en perfusion prolongée de 4 h (standard) ou toutes les 6 h en 30 min',
      indication: 'IU associée aux soins (IUAS 2015 R.45 : spectre sur P. aeruginosa et entérocoque) ; BLSE urinaire documentée (SPILF 2026 : 12 g/j).',
      dose: { type: 'fixe', valeur: 4, unite: 'g', frequenceParJour: 3 },
      voie: 'IV',
      modalites: 'perfusion prolongée de 4 h toutes les 8 h (ou 4 g toutes les 6 h en 30 min = 16 g/j : standard SPILF/SFPT/CA-SFM) ; SPILF 2026 BLSE : 12 g/j',
      statut: 'verifiee_ia',
      sources: [S('RCP-piperacilline-tazobactam', '§4.2', 'La dose habituelle est de 4 g de pipéracilline/0,5 g de tazobactam donnée toutes les 8 heures', 'posologie'), S(SRC_DOSES_2026, 'Annexe 9 (pipéracilline-tazobactam)', 'perf. prolongées 4 g + 0,5 g toutes les 8 h en 4 h', 'posologie'), S('SPILF-2026-IUM', 'diapo 17, 24', 'pipéracilline-tazobactam IV 12 g/jour', 'posologie'), S('SPILF-AFU-SF2H-2015-IUAS', 'R.45, p. 31', 'En 1ère intention : pipéracilline + tazobactam (intérêt du spectre sur Pseudomonas aeruginosa et entérocoque), ceftriaxone, cefotaxime', 'choix')],
    },
    {
      id: 'piptazo-4g6h-prolongee',
      libelle: '4 g/0,5 g toutes les 6 h en perfusion de 3 h (forte posologie : souche « I », P. aeruginosa, sepsis)',
      indication: 'Souche « sensible à forte posologie », P. aeruginosa, choc septique (SPILF/SFPT/CA-SFM).',
      dose: { type: 'fixe', valeur: 4, unite: 'g', frequenceParJour: 4 },
      voie: 'IV',
      modalites: 'perfusion prolongée de 3 h toutes les 6 h (les perfusions courtes n\'atteignent pas l\'objectif pour les souches SFP)',
      statut: 'verifiee_ia',
      sources: [S(SRC_DOSES_2026, 'Annexe 9 (pipéracilline-tazobactam)', 'forte : prolongée 4 g + 0,5 g toutes les 6 h en 3 h ; perf. courtes : « objectif non atteignable »', 'posologie'), S('EUCAST-2026-dosages-v16.0', 'Dosages, p. 7', '(4 g + 0.5 g) x 4 iv en perfusion de 3 h [high]', 'posologie')],
    },
    {
      id: 'piptazo-iia-rea',
      libelle: 'Dose de charge 4 g/0,5 g puis 16 g/2 g par 24 h en perfusion continue (infection intra-abdominale, réanimation)',
      indication: 'Infection intra-abdominale du patient grave (SFAR 2026, Annexe 1, colonne « réanimation, patient grave ») : choc septique communautaire sans facteur de risque de BLSE, IIA associée aux soins.',
      chargeInitiale: { libelle: 'Dose de charge (4 g/0,5 g en 30 min)', type: 'fixe', valeur: 4, unite: 'g' },
      dose: { type: 'fixe', valeur: 16, unite: 'g', continue: true },
      voie: 'IV',
      modalites: 'dose de charge en 30 min puis perfusion continue sur 24 h (16 g de pipéracilline + 2 g de tazobactam)',
      statut: 'verifiee_ia',
      sources: [S('SFAR-2026-IIA', 'Annexe 1, p. 73-74 (réanimation)', '(16 g + 2000 mg)/j', 'posologie'), S('SFAR-2026-IIA', 'Annexe 1, p. 73-74 (usuelles)', '(4g+500 mg) IV en 30min', 'posologie')],
      remarques: 'SFAR 2026, colonne « usuelles » : dose de charge puis « (200 mg+25 mg)/kg/j » en continu ou en perfusions prolongées de 4 h toutes les 6-8 h ; hyperclairance (ClCr mesurée > 130 mL/min) : « (20 g+ 2500 mg)/j ».',
      adaptationRenale: adaptationRenaleIIA(40, S('RCP-piperacilline-tazobactam', '§4.2', 'ClCr > 40 : « Pas d\'ajustement de dose nécessaire »', 'adaptation_renale')),
    },
    // Pneumonie d'inhalation (docs/sources/recherche-pneumonies.md §6).
    {
      id: 'piptazo-inhalation',
      libelle: '4 g de pipéracilline toutes les 6 à 8 h (pneumonie d\'inhalation)',
      indication: 'Pneumonie d\'inhalation grave avec facteur de risque de P. aeruginosa, ou sans évolution favorable à 72 h (SPILF/SFGG 2025).',
      dose: { type: 'fixe', valeur: 4, unite: 'g', frequenceParJour: 3, texte: '4 g de pipéracilline (+ 0,5 g de tazobactam) toutes les 6 à 8 h' },
      voie: 'IV',
      modalites: 'IV toutes les 6 à 8 h',
      statut: 'verifiee_ia',
      sources: [S('SPILF-SFGG-2025-inhalation-diapo', 'diapo 11', '>20ml/min : 4g de pipéracilline toutes les 6 à 8h', 'posologie'), S('RCP-piperacilline-tazobactam', '§4.2', 'La dose habituelle est de 4 g de pipéracilline/0,5 g de tazobactam donnée toutes les 8 heures', 'posologie')],
    },
  ],
  adaptationRenale: {
    methode: 'Cockcroft',
    statut: 'verifiee_ia',
    paliers: [
      { clcrMin: 40, texte: 'ClCr > 40 mL/min : pas d\'ajustement.', sources: [S('RCP-piperacilline-tazobactam', '§4.2', 'ClCr > 40 : « Pas d\'ajustement de dose nécessaire »', 'adaptation_renale')] },
      { clcrMin: 20, clcrMax: 40, texte: 'ClCr 20-40 mL/min : dose maximale 4 g/0,5 g toutes les 8 h.', sources: [S('RCP-piperacilline-tazobactam', '§4.2', '20-40 : « Dose maximum suggérée : 4 g/0,5 g toutes les 8 heures »', 'adaptation_renale')] },
      { clcrMax: 20, texte: 'ClCr < 20 mL/min : dose maximale 4 g/0,5 g toutes les 12 h.', sources: [S('RCP-piperacilline-tazobactam', '§4.2', '< 20 : « Dose maximum suggérée : 4 g/0,5 g toutes les 12 heures »', 'adaptation_renale')] },
    ],
    hemodialyse: { texte: 'Schéma ClCr < 20 + dose supplémentaire de 2 g/0,25 g après chaque séance.', sources: [S('RCP-piperacilline-tazobactam', '§4.2', '« une dose supplémentaire de 2 g pipéracilline/0,25 g tazobactam doit être administrée après chaque séance de dialyse »', 'adaptation_renale')] },
  },
  surveillance: [
    {
      id: 'piptazo-nfs-k',
      type: 'biologique',
      categorie: 'conditionnelle',
      quoi: 'NFS (fonction hématopoïétique) et kaliémie',
      quand: { ancre: 'hebdomadaire', texte: 'Évaluation périodique en cas de traitement prolongé (fréquence non chiffrée)' },
      pourquoi: 'Cytopénies et hypokaliémie en traitement prolongé.',
      conditionId: 'duree_sup_7j',
      conditionTexte: 'si traitement > 7 jours',
      statut: 'verifiee_ia',
      sources: [S('RCP-piperacilline-tazobactam', '§4.4', '« une évaluation périodique de la fonction hématopoïétique doit être effectuée » ; kaliémie', 'surveillance')],
    },
    {
      id: 'piptazo-vanco-ira',
      type: 'interaction',
      categorie: 'conditionnelle',
      quoi: 'Créatininémie rapprochée si vancomycine associée',
      quand: { ancre: 'quotidien', texte: 'Quotidienne tant que l\'association persiste' },
      pourquoi: 'Augmentation de l\'incidence des lésions rénales aiguës avec l\'association vancomycine + pipéracilline-tazobactam.',
      conditionId: 'vancomycine_associee',
      conditionTexte: 'si vancomycine associée',
      statut: 'verifiee_ia',
      sources: [S('RCP-piperacilline-tazobactam', '§4.4', 'association vancomycine : « une augmentation de l\'incidence de lésion rénale aiguë »', 'surveillance'), S('ASHP-IDSA-2020-vancomycine-STP', 'néphrotoxicité', 'piperacillin/tazobactam and flucloxacillin have been reported to increase the risk for AKI', 'surveillance')],
    },
    encephalopathieBetaLactamine('piptazo-encephalopathie', 'RCP-piperacilline-tazobactam', '§4.4', '[résumé de la fiche de vérification, non verbatim] convulsions possibles à fortes doses et en insuffisance rénale'),
    stpBetaLactamineReanimation('piptazo-stp'),
  ],
  grossesse: { statut: 'utilisable', texte: 'Envisageable quel que soit le terme, à posologies efficaces (CRAT).', sources: [S('CRAT-penicillines-grossesse', 'En pratique', 'envisageable quel que soit le terme de la grossesse, à posologies efficaces (pipéracilline ± tazobactam)', 'autre')] },
};

/* ------------------------------------------------------------------ */
export const temocilline: Molecule = {
  id: 'temocilline',
  dci: 'Témocilline',
  famille: 'penicilline',
  chaineLaterale: '6-α-méthoxy-pénicilline',
  statut: 'verifiee_ia',
  regimens: [
    {
      id: 'temocilline-2g8h',
      libelle: '2 g toutes les 8 h (6 g/j) — BLSE urinaire documentée',
      indication: 'Entérobactérie BLSE : IU masculine / PNA (SPILF 2026 : 6 g/j ; forte posologie de l\'annexe SPILF/SFPT/CA-SFM). Rappel : la souche sauvage est rendue « I » par EUCAST (jamais S).',
      dose: { type: 'fixe', valeur: 2, unite: 'g', frequenceParJour: 3 },
      voie: 'IV',
      modalites: 'perfusion de 30 min toutes les 8 h (ou 6 g/j en perfusion continue après dose de charge de 2 g)',
      statut: 'verifiee_ia',
      sources: [S('SPILF-2026-IUM', 'diapo 17, 24', 'témocilline IV 6 g/jour', 'posologie'), S('RCP-temocilline', '§4.2', '6 g par jour, à répartir en 3 administrations ou sous forme d\'une perfusion continue', 'posologie'), S(SRC_DOSES_2026, 'Annexe 9 (témocilline)', 'la posologie de 2 g toutes les 12 h s\'applique en cas de catégorisation "sensible à posologie standard" et uniquement pour les infections urinaires sans signe de gravité', 'posologie'), S('EUCAST-2026-breakpoints-v16.1', 'feuille Enterobacterales p. 15 ; note 13', 'Temocillin S ≤ 0.001 / R > 16 mg/L : la souche sauvage est rendue I', 'definition')],
      remarques: 'Divergence : SPILF 2015 indiquait 4 g/j ; SPILF 2026 et RCP (infections sévères) 6 g/j.',
    },
  ],
  adaptationRenale: {
    methode: 'Cockcroft',
    statut: 'verifiee_ia',
    paliers: [
      { clcrMin: 60, texte: 'ClCr > 60 mL/min : 2 g toutes les 12 h (standard) ou 2 g/8 h (forte posologie).', sources: [S('RCP-temocilline', '§4.2', '> 60 mL/min : 2 g/12 h', 'adaptation_renale')] },
      { clcrMin: 30, clcrMax: 60, texte: 'ClCr 30-60 mL/min : 1 g toutes les 12 h (RCP, schéma standard) — forte posologie non documentée en IR : avis pharmacologique.', sources: [S('RCP-temocilline', '§4.2', '60-30 : 1 g/12 h', 'adaptation_renale')] },
      { clcrMin: 10, clcrMax: 30, texte: 'ClCr 10-30 mL/min : 1 g toutes les 24 h.', sources: [S('RCP-temocilline', '§4.2', '30-10 : 1 g/24 h', 'adaptation_renale')] },
      { clcrMax: 10, texte: 'ClCr < 10 mL/min : palier non précisé par le RCP (« incertitudes posologiques ») : avis pharmacologique.', sources: [S('RCP-temocilline', '§4.2', 'pas de palier < 10 ; incertitudes posologiques signalées', 'adaptation_renale')] },
    ],
    hemodialyse: { texte: '1 g IV par 24 h de session inter-dialyse, de préférence à la fin de l\'hémodialyse (ou 2 g/48 h, 3 g/72 h).', sources: [S('RCP-temocilline', '§4.2', '1 g (injection I.V.) par 24 heures de session inter-dialyse, de préférence à la fin de l\'hémodialyse', 'adaptation_renale')] },
  },
  surveillance: [
    {
      id: 'temocilline-electrolytes',
      type: 'biologique',
      categorie: 'conditionnelle',
      quoi: 'Ionogramme (kaliémie)',
      quand: { ancre: 'hebdomadaire', texte: 'Périodique chez les patients à faibles réserves potassiques (fréquence non chiffrée)' },
      pourquoi: 'Hypokaliémie.',
      conditionTexte: 'si faibles réserves en potassium (diurétiques…)',
      statut: 'verifiee_ia',
      sources: [S('RCP-temocilline', '§4.4', 'Des déterminations périodiques des électrolytes doivent être réalisées chez des patients avec de faibles réserves de potassium', 'surveillance')],
    },
    encephalopathieBetaLactamine('temocilline-encephalopathie', 'RCP-temocilline', '§4.4', '[résumé de la fiche de vérification, non verbatim] convulsions en cas de surdosage ou d\'insuffisance rénale'),
  ],
  grossesse: { statut: 'non_verifie', texte: 'Fiche CRAT non consultée : statut non vérifié.', sources: [] },
};

/* ------------------------------------------------------------------ */
// Audit relecteur 2 (2026-11-05) : RCP lu sur la BDPM (CÉFOXITINE PANPHARMA 2 g, RCP mis à jour le 13/06/2022) :
// posologie et adaptation rénale désormais sourcées → statut « verifiee_ia » (grossesse toujours non vérifiée).
export const cefoxitine: Molecule = {
  id: 'cefoxitine',
  dci: 'Céfoxitine',
  famille: 'cephalosporine',
  chaineLaterale: 'céphamycine',
  statut: 'verifiee_ia',
  regimens: [
    {
      id: 'cefoxitine-6g',
      libelle: '2 g toutes les 8 h (6 g/j) — BLSE à E. coli ou Proteus (IU)',
      indication: 'IU masculine / PNA à E. coli ou Proteus BLSE (SPILF 2026 : 1er choix IV avec pipéracilline-tazobactam et témocilline ; uniquement E. coli/Proteus).',
      dose: { type: 'fixe', valeur: 2, unite: 'g', frequenceParJour: 3 },
      voie: 'IV',
      modalites: 'IV toutes les 8 h (RCP : injection IV lente en 3 à 5 min ; modalités de perfusion non lues dans le RCP)',
      statut: 'verifiee_ia',
      sources: [S('SPILF-2026-IUM', 'diapo 17, 24', 'céfoxitine IV 6 g/jour (seulement si E. coli ou Proteus)', 'posologie'), S('SPILF-2026-info-antibio-109', 'posologies', 'céfoxitine 6g/24h', 'posologie'), S('RCP-cefoxitine', '§4.2', 'traitement curatif : 1 ou 2 g toutes les 8 heures, soit 3 à 6 g par jour', 'posologie')],
    },
  ],
  adaptationRenale: {
    methode: 'non_precisee',
    statut: 'verifiee_ia',
    texteGeneral: 'Dose de charge de 1 ou 2 g possible, puis entretien selon la clairance (RCP).',
    paliers: [
      { clcrMin: 50, texte: 'ClCr > 50 mL/min : pas d\'adaptation (le tableau du RCP commence à 50 mL/min).', sources: [S('RCP-cefoxitine', '§4.2 (tableau IR)', 'tableau d\'entretien à partir de 50 - 30 ml/min', 'adaptation_renale')] },
      { clcrMin: 30, clcrMax: 50, texte: 'ClCr 30-50 mL/min : 1 à 2 g toutes les 8 à 12 h.', sources: [S('RCP-cefoxitine', '§4.2 (tableau IR)', '50 - 30 : 1 - 2 g toutes les 8 - 12 heures', 'adaptation_renale')] },
      { clcrMin: 10, clcrMax: 30, texte: 'ClCr 10-29 mL/min : 1 à 2 g toutes les 12 à 24 h.', sources: [S('RCP-cefoxitine', '§4.2 (tableau IR)', '29 - 10 : 1 - 2 g toutes les 12 - 24 heures', 'adaptation_renale')] },
      { clcrMin: 5, clcrMax: 10, texte: 'ClCr 5-9 mL/min : 0,5 à 1 g toutes les 12 à 24 h.', sources: [S('RCP-cefoxitine', '§4.2 (tableau IR)', '9 - 5 : 0,5 - 1 g toutes les 12 - 24 heures', 'adaptation_renale')] },
      { clcrMax: 5, texte: 'ClCr < 5 mL/min : 0,5 à 1 g toutes les 24 à 48 h.', sources: [S('RCP-cefoxitine', '§4.2 (tableau IR)', 'inférieure à 5 : 0,5 - 1 g toutes les 24 - 48 heures', 'adaptation_renale')] },
    ],
    hemodialyse: { texte: 'Dose de charge de 1 à 2 g après chaque hémodialyse, entretien selon le tableau.', sources: [S('RCP-cefoxitine', '§4.2', 'la dose de charge de 1 - 2 g doit être donnée après chaque hémodialyse', 'adaptation_renale')] },
  },
  surveillance: [],
  grossesse: { statut: 'non_verifie', texte: 'Non vérifié (fiche CRAT non consultée).', sources: [] },
};

/* ------------------------------------------------------------------ */
export const cefepime: Molecule = {
  id: 'cefepime',
  dci: 'Céfépime',
  famille: 'cephalosporine',
  chaineLaterale: 'aminothiazolyl-oxyimino : R1 identique céfotaxime/ceftriaxone/céfépime, proche pour ceftazidime et céfixime (connaissance non vérifiée dans une source lue : tableaux SPILF/JNI en image)',
  statut: 'verifiee_ia',
  regimens: [
    {
      id: 'cefepime-2g8h',
      libelle: '2 g toutes les 8 h (forte posologie)',
      indication: 'Entérobactérie résistante aux C3G par céphalosporinase hyperproduite (SPILF 2023/2026 : céfépime traitement de référence), P. aeruginosa (forte posologie uniquement + STP).',
      dose: { type: 'fixe', valeur: 2, unite: 'g', frequenceParJour: 3 },
      voie: 'IV',
      modalites: 'perfusion de 30 min (ou 4 h) toutes les 8 h',
      statut: 'verifiee_ia',
      sources: [S(SRC_DOSES_2026, 'Annexe 9 (céfépime)', 'forte « 2 g toutes les 8 h en perfusions de 30 min » ou « en perfusions de 4 h » ; Pseudomonas : forte posologie « et nécessite un suivi thérapeutique pharmacologique »', 'posologie'), S('SPILF-2023-BGN-MDR-diapo', 'diapo 10', 'Céfépime est le traitement de référence (AmpC)', 'choix'), S('RCP-cefepime', '§4.2', '1 g ×2/j à 2 g ×3/j (Pseudomonas sévère : 2 g ×3)', 'posologie')],
    },
    {
      id: 'cefepime-iia',
      libelle: '2 g toutes les 8 h en perfusion de 4 à 8 h (infection intra-abdominale, posologie usuelle)',
      indication: 'Infection intra-abdominale associée aux soins, 1er épisode, avec le métronidazole (SFAR 2026 R1.2.6, Annexe 1, colonne « usuelles ») ; usage guidé par les concentrations plasmatiques.',
      dose: { type: 'fixe', valeur: 2, unite: 'g', frequenceParJour: 3 },
      voie: 'IV',
      modalites: 'perfusion prolongée de 4 à 8 h toutes les 8 h ; si insuffisance rénale et/ou dose ≥ 6 g/j : adaptation par les concentrations sériques',
      statut: 'verifiee_ia',
      sources: [S('SFAR-2026-IIA', 'Annexe 1, p. 73-74 (usuelles)', '2 g/8h IV en perfusion de 4-8 h', 'posologie'), S('RCP-cefepime', '§4.2', '1 g ×2/j à 2 g ×3/j (Pseudomonas sévère : 2 g ×3)', 'posologie')],
      adaptationRenale: adaptationRenaleIIA(50, S('RCP-cefepime', '§4.4', 'adaptation pour des clairances de créatinine inférieures ou égales à 50 ml/min', 'adaptation_renale'), true),
    },
    {
      id: 'cefepime-iia-rea',
      libelle: 'Dose de charge 2 g puis 3 à 4 g par 24 h en perfusion continue (infection intra-abdominale, réanimation)',
      indication: 'Infection intra-abdominale associée aux soins du patient grave (SFAR 2026, Annexe 1, colonne « réanimation, patient grave ») ; monitorage plasmatique entre la 24e et la 36e heure.',
      chargeInitiale: { libelle: 'Dose de charge (2 g en 30 min)', type: 'fixe', valeur: 2, unite: 'g' },
      dose: { type: 'fixe', valeur: 4, unite: 'g', continue: true, texte: '3 à 4 g/24 h en perfusion continue' },
      voie: 'IV',
      modalites: 'dose de charge en 30 min puis perfusion continue ; dosage plasmatique entre la 24e et la 36e heure',
      statut: 'verifiee_ia',
      sources: [S('SFAR-2026-IIA', 'Annexe 1, p. 73-74 (réanimation)', '3 g à 4 g/j en perfusion continue', 'posologie'), S('SFAR-2026-IIA', 'Annexe 1, p. 73-74 (réanimation)', 'entre la 24è et la 36è heures', 'surveillance')],
      remarques: 'Hyperclairance (ClCr mesurée > 130 mL/min) : dose de charge 2 g puis « 6 g/j en perfusion continue » (SFAR 2026, Annexe 1).',
      adaptationRenale: adaptationRenaleIIA(50, S('RCP-cefepime', '§4.4', 'adaptation pour des clairances de créatinine inférieures ou égales à 50 ml/min', 'adaptation_renale'), true),
    },
    {
      id: 'cefepime-biliaire-2g12h',
      libelle: '2 g toutes les 12 h (infections biliaires, RCP)',
      indication: 'Infections biliaires : ligne du RCP (2 g IV 2 fois par jour) ; les Tokyo Guidelines 2018 ne donnent pas de posologie.',
      dose: { type: 'fixe', valeur: 2, unite: 'g', frequenceParJour: 2 },
      voie: 'IV',
      modalites: 'perfusion de 30 min toutes les 12 h',
      statut: 'verifiee_ia',
      sources: [S('RCP-cefepime', '§4.2 (infections biliaires)', '« infections biliaires » : 2 g IV 2 fois/j', 'posologie')],
    },
  ],
  adaptationRenale: {
    methode: 'Cockcroft',
    statut: 'verifiee_ia',
    texteGeneral: 'Adapter dès que ClCr ≤ 50 mL/min (formule de Cockcroft citée par le RCP) ; neurotoxicité en cas de surdosage.',
    paliers: [
      { clcrMin: 50, texte: 'ClCr > 50 mL/min : pas d\'adaptation.', sources: [S('RCP-cefepime', '§4.4', 'adaptation pour des clairances de créatinine inférieures ou égales à 50 ml/min', 'adaptation_renale')] },
      { clcrMin: 30, clcrMax: 50, texte: 'ClCr 30-50 mL/min : 2 g ×3/j → 1 g ×3/j ; 2 g ×2/j → 2 g ×1/j ; 1 g ×2/j → 1 g ×1/j (tableau du RCP).', sources: [S('RCP-cefepime', '§4.2 (tableau IR, vérifié le 2026-11-05)', '2 g, 3 fois par jour → 1 g, 3 fois par jour [50-30]', 'adaptation_renale')] },
      { clcrMin: 11, clcrMax: 30, texte: 'ClCr 11-29 mL/min : 2 g ×3/j → 1 g ×2/j ; 2 g ×2/j → 1 g ×1/j ; 1 g ×2/j → 500 mg ×1/j (tableau du RCP).', sources: [S('RCP-cefepime', '§4.2 (tableau IR, vérifié le 2026-11-05)', '2 g, 3 fois par jour → 1 g, 2 fois par jour [29-11]', 'adaptation_renale')] },
      { clcrMax: 11, texte: 'ClCr ≤ 10 mL/min : 2 g ×3/j → 1 g ×1/j ; 2 g ×2/j → 500 mg ×1/j ; 1 g ×2/j → 250 mg ×1/j (tableau du RCP). Dosage plasmatique utile en cas de signes neurologiques (SFPT/SFAR 2018).', sources: [S('RCP-cefepime', '§4.2 (tableau IR, vérifié le 2026-11-05)', '2 g, 3 fois par jour → 1 g, 1 fois par jour [≤ 10]', 'adaptation_renale')] },
    ],
    hemodialyse: { texte: 'Dose de charge 1 g puis 500 mg une fois par jour ; les jours de dialyse, administrer après la séance.', sources: [S('RCP-cefepime', '§4.2', '« dose de charge : 1 g, suivi de 500 mg, 1 fois/jour » ; « une dose doit être administrée après la séance de dialyse »', 'adaptation_renale')] },
  },
  surveillance: [
    { ...encephalopathieBetaLactamine('cefepime-encephalopathie', 'RCP-cefepime'), categorie: 'systematique', conditionId: undefined, conditionTexte: undefined, quoi: 'Surveillance neurologique quotidienne (encéphalopathie, myoclonies, convulsions) — risque accru en insuffisance rénale et chez le sujet âgé' },
    { ...stpBetaLactamineReanimation('cefepime-stp'), categorie: 'conditionnelle', conditionTexte: 'si P. aeruginosa/Acinetobacter à forte posologie, insuffisance rénale ou signes neurologiques' },
  ],
  grossesse: { statut: 'utilisable', texte: 'Envisageable quel que soit le terme si les autres céphalosporines ne conviennent pas (CRAT).', sources: [CRAT_CEPH] },
};

/* ------------------------------------------------------------------ */
export const meropeneme: Molecule = {
  id: 'meropeneme',
  dci: 'Méropénème',
  famille: 'carbapeneme',
  statut: 'verifiee_ia',
  regimens: [
    {
      id: 'meropeneme-1g8h',
      libelle: '1 g toutes les 8 h (standard)',
      indication: 'Entérobactérie BLSE sans alternative (IU : 3 g/j SPILF 2026), infection documentée à BLSE grave (SPILF 2023 / ESCMID 2022).',
      dose: { type: 'fixe', valeur: 1, unite: 'g', frequenceParJour: 3 },
      voie: 'IV',
      modalites: 'perfusion de 30 min toutes les 8 h',
      statut: 'verifiee_ia',
      sources: [S('SPILF-2026-IUM', 'diapo 17', 'méropénème IV 3 g/jour', 'posologie'), S(SRC_DOSES_2026, 'Annexe 9 (méropénème)', '1 g toutes les 8 h en perfusions de 30 min', 'posologie'), S('RCP-meropeneme', '§4.2 (tableau 1)', '500 mg ou 1 g toutes les 8 h (pneumonie sévère, IU compliquée, intra-abdominale)', 'posologie')],
    },
    {
      id: 'meropeneme-2g8h',
      libelle: '2 g toutes les 8 h en perfusion prolongée de 3 h (forte posologie : choc septique, souche « I »)',
      indication: 'Choc septique urinaire avec facteur de risque de C3G-R (SPILF 2026 : 6 g/j) ; souche « sensible à forte posologie ».',
      dose: { type: 'fixe', valeur: 2, unite: 'g', frequenceParJour: 3 },
      voie: 'IV',
      modalites: 'perfusion prolongée de 3 à 8 h toutes les 8 h (2 g/8 h en 30 min n\'atteint pas les objectifs pour les souches SFP)',
      statut: 'verifiee_ia',
      sources: [S('SPILF-2026-IUM', 'diapo 15, 22', 'Imipénème IV 3 g/jour OU méropénème IV 6 g/jour ET amikacine IV 30 mg/kg, dose unique', 'posologie'), S(SRC_DOSES_2026, 'Annexe 9 (méropénème)', 'forte « 2 g toutes les 8 h en perfusions de 3 à 8 h »', 'posologie')],
    },
    // Méningite à E. coli BLSE suspectée (docs/sources/recherche-meningites.md §1, §10.2 : RCP non relu pour la méningite).
    {
      id: 'meropeneme-meninge-40',
      libelle: '40 mg/kg toutes les 8 h en perfusion lente — méningite à E. coli BLSE suspectée (avis d\'expert)',
      indication: 'Méningite à bacille à Gram négatif ou E. coli avec suspicion de BLSE (colonisation ou prélèvement d\'un autre site) : méropénème et avis d\'expert (SPILF 2018).',
      dose: { type: 'ponderale', valeur: 40, unite: 'mg/kg', frequenceParJour: 3, poidsReference: 'total' },
      voie: 'IV',
      modalites: 'Perfusion lente toutes les 8 h ; avis d\'expert (SPILF 2018). RCP du méropénème non relu pour la méningite. Poids de référence non précisé par la source (poids réel retenu par l\'application).',
      statut: 'brouillon',
      sources: [S('SPILF-2018-meningites', 'p. 22, §12.8.1.5', '[reformulation] méropénème 40 mg/kg × 3/j en perfusion lente + avis d\'expert', 'posologie')],
    },
    {
      id: 'meropeneme-iia',
      libelle: '1 à 2 g toutes les 8 h en perfusion de 3 à 8 h (infection intra-abdominale, posologie usuelle)',
      indication: 'Infection intra-abdominale à risque de BLSE ou de BMR (SFAR 2026, Annexe 1, colonne « usuelles ») ; RCP : infections intra-abdominales compliquées.',
      dose: { type: 'fixe', valeur: 2, unite: 'g', frequenceParJour: 3, texte: '1 à 2 g toutes les 8 h' },
      voie: 'IV',
      modalites: 'perfusion prolongée de 3 à 8 h toutes les 8 h',
      statut: 'verifiee_ia',
      sources: [S('SFAR-2026-IIA', 'Annexe 1, p. 73-74 (usuelles)', '1-2g/8h IV en perfusion de 3 à 8h', 'posologie'), S('RCP-meropeneme', '§4.2 (infections intra-abdominales compliquées)', '« 500 mg ou 1 g » toutes les 8 h', 'posologie')],
      remarques: 'La dose de 2 g toutes les 8 h dépasse la ligne « infections intra-abdominales compliquées » du RCP (500 mg ou 1 g toutes les 8 h).',
    },
    {
      id: 'meropeneme-iia-rea',
      libelle: '3 g par 24 h en perfusion continue (infection intra-abdominale, réanimation)',
      indication: 'Infection intra-abdominale du patient grave à risque de BLSE ou de BMR (SFAR 2026, Annexe 1, colonne « réanimation, patient grave »).',
      dose: { type: 'fixe', valeur: 3, unite: 'g', continue: true },
      voie: 'IV',
      modalites: 'perfusion continue sur 24 h',
      statut: 'verifiee_ia',
      sources: [S('SFAR-2026-IIA', 'Annexe 1, p. 73-74 (réanimation)', '3 g/j en perfusion continue', 'posologie')],
      remarques: 'Hyperclairance (ClCr mesurée > 130 mL/min) : « 6 g/j en perfusion continue » (SFAR 2026, Annexe 1).',
      adaptationRenale: adaptationRenaleIIA(51, S('RCP-meropeneme', '§4.2 (tableau 2)', 'ajustement « lorsque la clairance de la créatinine est inférieure à 51 mL/min »', 'adaptation_renale')),
    },
  ],
  adaptationRenale: {
    methode: 'Cockcroft',
    statut: 'verifiee_ia',
    paliers: [
      { clcrMin: 51, texte: 'ClCr ≥ 51 mL/min : pas d\'adaptation.', sources: [S('RCP-meropeneme', '§4.2 (tableau 2)', 'ajustement « lorsque la clairance de la créatinine est inférieure à 51 mL/min »', 'adaptation_renale')] },
      { clcrMin: 26, clcrMax: 51, texte: 'ClCr 26-50 mL/min : une dose unitaire toutes les 12 h.', sources: [S('RCP-meropeneme', '§4.2 (tableau 2)', '26-50 : une dose unitaire /12 h', 'adaptation_renale')] },
      { clcrMin: 10, clcrMax: 26, texte: 'ClCr 10-25 mL/min : moitié de la dose unitaire toutes les 12 h.', sources: [S('RCP-meropeneme', '§4.2 (tableau 2)', '10-25 : moitié /12 h', 'adaptation_renale')] },
      { clcrMax: 10, texte: 'ClCr < 10 mL/min : moitié de la dose unitaire toutes les 24 h.', sources: [S('RCP-meropeneme', '§4.2 (tableau 2)', '< 10 : moitié /24 h', 'adaptation_renale')] },
    ],
    hemodialyse: { texte: 'Administrer la dose requise après la fin de la séance d\'hémodialyse.', sources: [S('RCP-meropeneme', '§4.2', '« La dose requise doit être administrée après la fin de la séance d\'hémodialyse. »', 'adaptation_renale')] },
  },
  surveillance: [
    { ...encephalopathieBetaLactamine('meropeneme-convulsions', 'RCP-meropeneme', '§4.4', 'Des crises convulsives ont été peu fréquemment rapportées lors du traitement par les carbapénèmes'), quoi: 'Surveillance neurologique (crises convulsives, peu fréquentes) et bilan hépatique' },
    stpBetaLactamineReanimation('meropeneme-stp'),
  ],
  grossesse: { statut: 'non_verifie', texte: 'Fiche CRAT méropénème introuvable lors de la vérification ; l\'imipénème-cilastatine est « envisageable quel que soit le terme ».', sources: [] },
};

/* ------------------------------------------------------------------ */
export const imipeneme: Molecule = {
  id: 'imipeneme',
  dci: 'Imipénème-cilastatine',
  famille: 'carbapeneme',
  statut: 'verifiee_ia',
  regimens: [
    {
      id: 'imipeneme-1g8h',
      libelle: '1 g toutes les 8 h (3 g/j)',
      indication: 'Choc septique urinaire avec facteur de risque de C3G-R (SPILF 2026 : 3 g/j) ; BLSE sans alternative.',
      dose: { type: 'fixe', valeur: 1, unite: 'g', frequenceParJour: 3 },
      voie: 'IV',
      modalites: 'perfusion de 30 min toutes les 8 h (pas de perfusion prolongée : instabilité) ; max 4 g/j',
      statut: 'verifiee_ia',
      sources: [S('SPILF-2026-IUM', 'diapo 15, 22', 'Imipénème IV 3 g/jour', 'posologie'), S('RCP-imipeneme', '§4.2', '1 000 mg/1 000 mg toutes les 8 heures OU toutes les 6 heures ; max 4 000 mg/jour', 'posologie'), S(SRC_DOSES_2026, 'Annexe 9 (imipénème)', 'standard « 0,5 g toutes les 6 h en perfusions de 30 min ou 1 g toutes les 8 h » ; pas de perfusions prolongées ou continues', 'posologie')],
    },
  ],
  adaptationRenale: {
    methode: 'Cockcroft',
    statut: 'verifiee_ia',
    texteGeneral: 'Tableau du RCP selon la dose totale journalière (2, 3 ou 4 g/j) — paliers ci-dessous pour 3 g/j.',
    paliers: [
      { clcrMin: 90, texte: 'ClCr ≥ 90 mL/min : 1 g toutes les 8 h.', sources: [S('RCP-imipeneme', '§4.2 (tableau 1)', '≥ 90 : 500/6 h, 1 000/8 h, 1 000/6 h', 'adaptation_renale')] },
      { clcrMin: 60, clcrMax: 90, texte: 'ClCr 60-89 mL/min : 500 mg toutes les 6 h (pour 3 g/j).', sources: [S('RCP-imipeneme', '§4.2 (tableau 1)', '60-89 : 400/6 h, 500/6 h, 750/8 h', 'adaptation_renale')] },
      { clcrMin: 30, clcrMax: 60, texte: 'ClCr 30-59 mL/min : 500 mg toutes les 8 h (pour 3 g/j).', sources: [S('RCP-imipeneme', '§4.2 (tableau 1)', '30-59 : 300/6 h, 500/8 h, 500/6 h', 'adaptation_renale')] },
      { clcrMin: 15, clcrMax: 30, texte: 'ClCr 15-29 mL/min : 500 mg toutes les 12 h.', sources: [S('RCP-imipeneme', '§4.2 (tableau 1)', '15-29 : 200/6 h, 500/12 h, 500/12 h', 'adaptation_renale')] },
      { clcrMax: 15, texte: 'ClCr < 15 mL/min : ne pas administrer sauf si une hémodialyse est instaurée dans les 48 h.', sources: [S('RCP-imipeneme', '§4.2 (tableau 1)', '< 15 : non administré « sauf si une hémodialyse est instaurée dans les 48 heures »', 'adaptation_renale')] },
    ],
    hemodialyse: { texte: 'Schéma ClCr 15-29 (500 mg/12 h), dose après la séance puis toutes les 12 h.', sources: [S('RCP-imipeneme', '§4.2', 'dialysés : schéma 15-29, dose après séance puis toutes les 12 h', 'adaptation_renale')] },
  },
  surveillance: [
    { ...encephalopathieBetaLactamine('imipeneme-neuro', 'RCP-imipeneme', '§4.4', 'Un respect strict des schémas posologiques recommandés s\'impose.'), categorie: 'systematique', conditionId: undefined, conditionTexte: undefined, quoi: 'Surveillance neurologique (myoclonies, confusion, convulsions) : respect strict des schémas posologiques adaptés à la fonction rénale' },
  ],
  // Audit relecteur 2 : « utilisable » rétrogradé en « non_verifie » (fiche CRAT 13283 vue seulement en résultat de recherche, rattachée à tort à la fiche pénicillines).
  grossesse: { statut: 'non_verifie', texte: 'Non vérifié : la fiche CRAT imipénem n\'a été vue qu\'en résultat de recherche (« envisageable quel que soit le terme »), non lue.', sources: [] },
};

/* ------------------------------------------------------------------ */
export const ertapeneme: Molecule = {
  id: 'ertapeneme',
  dci: 'Ertapénème',
  famille: 'carbapeneme',
  statut: 'verifiee_ia',
  regimens: [
    {
      id: 'ertapeneme-1g',
      libelle: '1 g toutes les 24 h',
      indication: 'Relais d\'une BLSE urinaire sans alternative (SPILF 2015, 2026) ; après avis spécialisé hors IU (SPILF 2023).',
      dose: { type: 'fixe', valeur: 1, unite: 'g', frequenceParJour: 1 },
      voie: 'IV',
      modalites: 'perfusion de 30 min, 1 fois par 24 h',
      statut: 'verifiee_ia',
      sources: [S('SPILF-2026-IUM', 'diapo 17', 'ertapénème IV 1 g/jour', 'posologie'), S(SRC_DOSES_2026, 'Annexe 9 (ertapénème)', '1 g toutes les 24 h en 30 min', 'posologie'), S('RCP-ertapeneme', '§4.2', 'la dose d\'ERTAPENEM est de 1 gramme (g) administrée une fois par jour par voie intraveineuse ; perfusé pendant 30 minutes', 'posologie')],
    },
  ],
  // Audit relecteur 2 (2026-11-05) : adaptation rénale renseignée d'après le RCP (BDPM) — l'ertapénème ne doit pas être utilisé si ClCr ≤ 30 ni en hémodialyse.
  adaptationRenale: {
    methode: 'non_precisee',
    statut: 'verifiee_ia',
    texteGeneral: 'RCP : clairance exprimée en mL/min/1,73 m².',
    paliers: [
      { clcrMin: 30.01, texte: 'ClCr > 30 mL/min/1,73 m² : aucune adaptation posologique.', sources: [S('RCP-ertapeneme', '§4.2', 'Chez les patients dont la clairance de la créatinine est > 30 ml/min/1,73 m² […] aucune adaptation posologique n\'est nécessaire', 'adaptation_renale')] },
      { clcrMax: 30.01, texte: 'ClCr ≤ 30 mL/min/1,73 m² : NE PAS UTILISER (données de sécurité et d\'efficacité insuffisantes) — choisir une autre molécule.', sources: [S('RCP-ertapeneme', '§4.2', 'les données de sécurité d\'emploi et d\'efficacité de l\'ertapénème sont insuffisantes […] l\'ertapénème ne doit pas être utilisé chez ces patients', 'adaptation_renale')] },
    ],
    hemodialyse: { texte: 'NE PAS UTILISER chez l\'hémodialysé (données insuffisantes).', sources: [S('RCP-ertapeneme', '§4.2', 'Chez les patients hémodialysés […] l\'ertapénème ne doit pas être utilisé chez ces patients', 'adaptation_renale')] },
  },
  surveillance: [],
  grossesse: { statut: 'non_verifie', texte: 'Non vérifié.', sources: [] },
};

/* ------------------------------------------------------------------ */
export const aztreonam: Molecule = {
  id: 'aztreonam',
  dci: 'Aztréonam',
  famille: 'monobactam',
  statut: 'verifiee_ia',
  regimens: [
    {
      id: 'aztreonam-2g8h',
      libelle: '2 g toutes les 8 h',
      indication: 'IU fébrile en cas d\'allergie aux bêta-lactamines (SPILF 2015 : PNA ; en association à l\'amikacine si grave) ; utilisable en cas d\'allergie sauf hypersensibilité à la ceftazidime/céfidérocol.',
      dose: { type: 'fixe', valeur: 2, unite: 'g', frequenceParJour: 3 },
      voie: 'IV',
      modalites: 'perfusion de 20 à 60 min toutes les 8 h (max 8 g/j)',
      statut: 'verifiee_ia',
      sources: [S('SPILF-2015-IU', 'annexe 1, p. 41', 'aztréonam 2 g x 3/jour', 'posologie'), S('RCP-aztreonam', '§4.2', '6-8 g/24 h en 3-4 injections ; dose maximale recommandée 8 g par jour', 'posologie'), S('SPILF-JNI-2024-allergie', 'HSI aux céphalosporines', 'L\'aztréonam est utilisable sauf si allergie à la ceftazidime et au cefidérocol', 'choix')],
    },
  ],
  adaptationRenale: {
    methode: 'Cockcroft',
    statut: 'verifiee_ia',
    paliers: [
      { clcrMin: 30, texte: 'ClCr ≥ 30 mL/min : dose normale.', sources: [S('RCP-aztreonam', '§4.2', '≥ 30 mL/min dose normale', 'adaptation_renale')] },
      { clcrMin: 10, clcrMax: 30, texte: 'ClCr 10-30 mL/min : demi-dose après une dose de charge de 1-2 g.', sources: [S('RCP-aztreonam', '§4.2', '10-30 : demi-dose', 'adaptation_renale')] },
      { clcrMax: 10, texte: 'ClCr < 10 mL/min : quart de dose après une dose de charge de 1-2 g.', sources: [S('RCP-aztreonam', '§4.2', '< 10 : quart de dose (après charge 1-2 g)', 'adaptation_renale')] },
    ],
    hemodialyse: { texte: '1/8 de dose après chaque hémodialyse (en plus du schéma ClCr < 10).', sources: [S('RCP-aztreonam', '§4.2', 'hémodialysés : « 1/8 de dose après hémodialyse »', 'adaptation_renale')] },
  },
  surveillance: [
    {
      id: 'aztreonam-renal-aminoside',
      type: 'biologique',
      categorie: 'conditionnelle',
      quoi: 'Créatininémie',
      quand: { ancre: 'quotidien', texte: 'Régulière si aminoside associé' },
      pourquoi: 'Surveillance rénale recommandée en association avec un aminoside.',
      conditionId: 'aminoside_associe',
      conditionTexte: 'si aminoside associé',
      statut: 'verifiee_ia',
      sources: [S('RCP-aztreonam', '§4.4', 'surveillance rénale si aminoside associé', 'surveillance')],
    },
  ],
  grossesse: { statut: 'non_verifie', texte: 'Fiche CRAT non consultée : statut non vérifié.', sources: [] },
};

/* ------------------------------------------------------------------ */
export const cefixime: Molecule = {
  id: 'cefixime',
  dci: 'Céfixime',
  famille: 'cephalosporine',
  chaineLaterale: 'aminothiazolyl-oxyimino : R1 identique céfotaxime/ceftriaxone/céfépime, proche pour ceftazidime et céfixime (connaissance non vérifiée dans une source lue : tableaux SPILF/JNI en image)',
  // Audit relecteur 2 (2026-11-05) : RCP lu (BDPM) → « verifiee_ia » ; grossesse non vérifiée.
  statut: 'verifiee_ia',
  regimens: [
    {
      id: 'cefixime-200x2',
      libelle: '200 mg toutes les 12 h per os (relais, dernier choix)',
      indication: 'Relais oral de PNA / IU masculine (dernier choix de la liste SPILF/HAS).',
      dose: { type: 'fixe', valeur: 200, unite: 'mg', frequenceParJour: 2 },
      voie: 'PO',
      modalites: 'per os toutes les 12 h',
      statut: 'verifiee_ia',
      sources: [S('SPILF-2026-IUM', 'diapo 23-24', 'Céfixime 200 mgx2/jour', 'posologie'), S('HAS-2021-PNA-femme', 'tableau relais', 'céfixime 200 ×2/j 10 j', 'posologie'), S('RCP-cefixime', '§4.2', 'est de 400 mg/j, en deux administrations, à 12 heures d\'intervalle', 'posologie')],
    },
  ],
  adaptationRenale: {
    methode: 'non_precisee',
    statut: 'verifiee_ia',
    paliers: [
      { clcrMin: 20.01, texte: 'ClCr > 20 mL/min : pas d\'adaptation.', sources: [S('RCP-cefixime', '§4.2', 'Lorsque les valeurs de la clairance de la créatinine sont supérieures à 20 mL/min, il n\'est pas utile de modifier la posologie', 'adaptation_renale')] },
      { clcrMax: 20.01, texte: 'ClCr ≤ 20 mL/min (y compris hémodialyse) : ne pas dépasser 200 mg/j en une prise.', sources: [S('RCP-cefixime', '§4.2', 'ne devra pas dépasser 200 mg/j, en une administration', 'adaptation_renale')] },
    ],
    hemodialyse: { texte: 'Ne pas dépasser 200 mg/j en une prise.', sources: [S('RCP-cefixime', '§4.2', 'y compris chez les patients hémodialysés : ne devra pas dépasser 200 mg/j, en une administration', 'adaptation_renale')] },
  },
  surveillance: [],
  grossesse: { statut: 'non_verifie', texte: 'Non vérifié.', sources: [] },
};
