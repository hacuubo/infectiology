import type { ElementSurveillance, SourceRef } from '../types';

/** Référence précise à une source du registre. */
export function S(source: string, repere?: string, extrait?: string, justifie?: SourceRef['justifie'], ancre?: string): SourceRef {
  return { source, repere, extrait, justifie, ancre };
}

/** Surveillance commune aux bêta-lactamines : neurotoxicité (encéphalopathie) en cas d'insuffisance rénale ou de surdosage. */
export function encephalopathieBetaLactamine(id: string, sourceRcp: string, repere = '§4.4'): ElementSurveillance {
  return {
    id,
    type: 'clinique',
    categorie: 'conditionnelle',
    quoi: 'Surveillance neurologique (confusion, myoclonies, convulsions) — encéphalopathie aux bêta-lactamines',
    quand: { ancre: 'quotidien', texte: 'Quotidienne pendant le traitement', repetition: 'à chaque évaluation clinique' },
    pourquoi: "Risque d'encéphalopathie accru en cas de surdosage ou d'insuffisance rénale, surtout chez le sujet âgé.",
    conduite: "En cas de signes neurologiques : vérifier l'adaptation posologique à la fonction rénale ; un dosage plasmatique peut aider (SFPT/SFAR 2018).",
    conditionId: 'insuffisance_renale',
    conditionTexte: 'si insuffisance rénale ou sujet âgé',
    statut: 'verifiee_ia',
    sources: [S(sourceRcp, repere, 'Les bêtalactamines exposent au risque d\'encéphalopathie […] en cas de surdosage ou d\'insuffisance rénale', 'surveillance')],
  };
}

/** STP des bêta-lactamines en soins critiques (SFPT/SFAR 2018) : conditionnel. */
export function stpBetaLactamineReanimation(id: string): ElementSurveillance {
  return {
    id,
    type: 'stp',
    categorie: 'conditionnelle',
    quoi: 'Dosage plasmatique de la bêta-lactamine (résiduelle si administration discontinue, plateau si perfusion continue)',
    quand: { ancre: 'debut_traitement', offsetHeures: 24, texte: '24 à 48 h après le début du traitement, puis après tout changement de posologie', repetition: 'après tout changement de posologie ou changement clinique important' },
    pourquoi: 'Patients de soins critiques avec variabilité pharmacocinétique attendue (choc, EER, hyperfiltration) ou suspicion de toxicité ; cible : concentration libre 4 à 8 × CMI pendant 100 % du temps.',
    conduite: 'Sous-dosage : augmenter la dose ou la durée de perfusion ; surdosage : réduire (perfusion continue), suspendre et reprendre sous STP.',
    conditionId: 'patient_severe',
    conditionTexte: "si patient de soins critiques, sepsis/choc septique, épuration extrarénale ou insuffisance rénale aiguë",
    statut: 'verifiee_ia',
    sources: [
      S('SFPT-SFAR-2018-betalactamines', 'R4.1, R4.2, R4.4, R2.2', 'performing beta-lactam TDM 24 to 48 h after the onset of treatment; after any change in dosage', 'surveillance'),
      S('ABDUL-AZIZ-2020-TDM', 'Table 4', '30 min or just before the next dosing', 'surveillance'),
    ],
  };
}

export const SRC_DOSES_2026 = 'SPILF-SFPT-CASFM-2026-posologies';
export const SRC_EUCAST_DOSAGES = 'EUCAST-2026-dosages-v16.0';
