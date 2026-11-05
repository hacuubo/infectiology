/**
 * Rattachement déterministe d'une donnée manquante (libellé produit par une règle) au champ de saisie
 * qui permet de la compléter, et à son domaine (clinique, microbiologie, fonction rénale…).
 * Sert aux boutons « Compléter » de la fiche : ils mènent directement au champ, sans refaire le parcours.
 */

export type DomaineManquant = 'entree' | 'patient' | 'renal' | 'microbiologie' | 'clinique' | 'horaires' | 'autre';

/** Ordre significatif : la première expression reconnue l'emporte. */
const TABLE: { motif: RegExp; cible: string; domaine: DomaineManquant }[] = [
  { motif: /point d.entrée|syndrome ou résultat/i, cible: 'entree', domaine: 'entree' },
  { motif: /horaires de dialyse/i, cible: 'patient.renal.horairesDialyse', domaine: 'renal' },
  { motif: /stabilité de la fonction rénale/i, cible: 'patient.renal.stabilite', domaine: 'renal' },
  { motif: /dialyse|épuration extrarénale/i, cible: 'patient.renal.dialyse', domaine: 'renal' },
  { motif: /date (et heure )?du prélèvement de créatinine|date de la créatinine/i, cible: 'patient.renal.creatinine.date', domaine: 'renal' },
  { motif: /unité de la créatinine/i, cible: 'patient.renal.creatinine', domaine: 'renal' },
  { motif: /créatinin|fonction rénale/i, cible: 'patient.renal.creatinine', domaine: 'renal' },
  { motif: /^âge/i, cible: 'patient.age', domaine: 'patient' },
  { motif: /^sexe|variable de sexe/i, cible: 'patient.sexe', domaine: 'patient' },
  { motif: /^poids/i, cible: 'patient.poidsKg', domaine: 'patient' },
  { motif: /^taille/i, cible: 'patient.tailleCm', domaine: 'patient' },
  { motif: /allergi/i, cible: 'patient.statutAllergie', domaine: 'patient' },
  { motif: /grossesse/i, cible: 'patient.grossesse', domaine: 'patient' },
  { motif: /^gravité/i, cible: 'patient.gravite', domaine: 'patient' },
  { motif: /contexte communautaire/i, cible: 'patient.contexte', domaine: 'patient' },
  { motif: /^matériel urinaire/i, cible: 'patient.materielUrinaire', domaine: 'patient' },
  { motif: /prothèse valvulaire/i, cible: 'patient.valve', domaine: 'patient' },
  { motif: /^matériel/i, cible: 'patient.materielVasculaire', domaine: 'patient' },
  { motif: /forme clinique de l.IU masculine/i, cible: 'patient.formeIUMasculine', domaine: 'patient' },
  { motif: /antécédents de BLSE|antibiotiques des 3-6/i, cible: 'patient.antecedentsMicro', domaine: 'patient' },
  { motif: /1re dose|première dose/i, cible: 'horaires.premiereDoseISO', domaine: 'horaires' },
  { motif: /foyer suspecté/i, cible: 'prelevements', domaine: 'clinique' },
  {
    motif: /hémoculture|séries|antibiogramme|sensibilit|CMI|mécanisme|oxacilline|céfoxitine|identification|germe|examen direct|phénotype|BLSE|carbapénémase/i,
    cible: 'prelevements',
    domaine: 'microbiologie',
  },
  { motif: /signes|fièvre|hypothermie|confusion|autre foyer|geste urologique|ECBU|Grossesse en cours/i, cible: 'clinique', domaine: 'clinique' },
];

export function rattacherChamp(champ: string): { cible?: string; domaine: DomaineManquant } {
  const t = TABLE.find((x) => x.motif.test(champ));
  return t ? { cible: t.cible, domaine: t.domaine } : { domaine: 'autre' };
}
