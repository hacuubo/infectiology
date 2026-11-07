/**
 * Questions du foyer « Méningite » (méningite bactérienne communautaire de l'adulte), d'après
 * docs/sources/recherche-meningites.md §9.2 : méningite post-neurochirurgicale ou sur matériel, purpura, signes imposant l'imagerie avant la PL,
 * contre-indications non neurologiques de la PL, examen direct du LCS, arguments pour une listériose,
 * germe documenté, CMI du pneumocoque, évolution à 48-72 h, foyer ORL.
 * L'âge, l'immunodépression, les allergies, la fonction rénale, le poids, le contexte (communautaire ou
 * associé aux soins) et les anticoagulants viennent de la saisie du patient : ils ne sont pas redemandés.
 */
import type { Dossier } from '../../engine/etat';
import type { OrganismeId, Prelevement } from '../types';
import type { QuestionSyndrome } from './questions';

const ouiNon = [
  { v: 'oui', l: 'Oui' },
  { v: 'non', l: 'Non' },
];

/** Germe déductible d'un prélèvement déjà saisi (les autres germes de la méningite ne sont pas dans la liste des organismes). */
export const GERME_DE_PRELEVEMENT: Partial<Record<OrganismeId, string>> = {
  streptococcus_pneumoniae: 'pneumocoque',
  escherichia_coli: 'e_coli',
  streptococcus_agalactiae: 's_agalactiae',
};

/**
 * Prélèvements qui peuvent documenter la méningite : hémocultures et prélèvements rattachés au foyer « méningite »
 * (LCS). Un ECBU, un prélèvement respiratoire ou vaginal ne documente jamais la méningite (relecture v7, bloquant 1).
 */
export function prelevementsMeningite(d: Dossier): Prelevement[] {
  return d.prelevements.filter((p) => p.type === 'hemoculture' || p.foyer === 'meningite');
}

/** Staphylocoques à coagulase négative : contaminants fréquents des hémocultures, non signalés comme « germe hors liste ». */
const CONTAMINANTS: OrganismeId[] = ['staphylocoque_coagulase_negative', 'staphylococcus_epidermidis'];

/** Germes des prélèvements méningés hors des schémas modélisés (SCN exclus) : signalés, jamais traités en silence. */
export function germesHorsListe(d: Dossier): Prelevement[] {
  return prelevementsMeningite(d).filter((p) => p.organisme && !GERME_DE_PRELEVEMENT[p.organisme] && !CONTAMINANTS.includes(p.organisme));
}

/** Germe déduit d'une hémoculture ou d'un prélèvement au foyer « méningite ». */
export function germeDeduit(d: Dossier): string | undefined {
  for (const p of prelevementsMeningite(d)) {
    const g = p.organisme ? GERME_DE_PRELEVEMENT[p.organisme] : undefined;
    if (g) return g;
  }
  return undefined;
}

/** Germe déclaré à la question, sinon déduit d'une hémoculture ou d'un prélèvement au foyer « méningite ». */
export function germeMeningite(d: Dossier): string {
  const q = d.details?.['meningite.germe'];
  if (q && q !== 'inconnu' && q !== 'non_documente') return q;
  return germeDeduit(d) ?? q ?? 'inconnu';
}

const documente = (d: Dossier) => !['inconnu', 'non_documente'].includes(germeMeningite(d));
const avantPL = (r: (id: string) => string) => ['pas_faite', 'inconnu'].includes(r('meningite.lcs'));

export const QUESTIONS_MENINGITE: QuestionSyndrome[] = [
  {
    id: 'meningite.neurochirurgie',
    foyers: ['meningite'],
    libelle: 'Méningite post-neurochirurgicale ou sur matériel (dérivation, drain) ?',
    aide: 'Hors du référentiel SPILF 2018 (méningites communautaires) : avis spécialisé. Un contexte « associé aux soins » (EHPAD, hospitalisation récente) ne suffit pas à en faire une méningite post-neurochirurgicale.',
    options: ouiNon,
  },
  {
    id: 'meningite.purpura',
    foyers: ['meningite'],
    libelle: 'Purpura ?',
    aide: 'Purpura fulminans : chez un malade fébrile, purpura ne s\'effaçant pas à la vitropression et comportant au moins un élément nécrotique ou ecchymotique de diamètre ≥ 3 mm (DGS 2018). Antibiotique immédiat, avant tout prélèvement.',
    options: [
      { v: 'fulminans', l: 'Purpura fulminans' },
      { v: 'autre', l: 'Purpura, sans ces critères' },
      { v: 'non', l: 'Pas de purpura' },
    ],
  },
  {
    id: 'meningite.lcs',
    foyers: ['meningite'],
    libelle: 'Ponction lombaire : aspect et examen direct du LCS',
    aide: 'Ne pas attendre l\'examen direct : l\'antibiothérapie débute dès que le LCS est trouble (SPILF 2018).',
    options: [
      { v: 'pas_faite', l: 'PL pas encore réalisée' },
      { v: 'trouble_attente', l: 'LCS trouble, examen direct en attente' },
      { v: 'cgp', l: 'Cocci à Gram positif (pneumocoque ?)' },
      { v: 'cgn', l: 'Cocci à Gram négatif (méningocoque ?)' },
      { v: 'bgp', l: 'Bacille à Gram positif (Listeria ?)' },
      { v: 'bgn', l: 'Bacille à Gram négatif (H. influenzae, E. coli ?)' },
      { v: 'negatif', l: 'Examen direct négatif' },
    ],
    // Toujours affichée : la réponse n'est pas effacée quand le germe est documenté (relecture v7, mineur 17).
  },
  {
    id: 'meningite.imagerie',
    foyers: ['meningite'],
    libelle: 'Signes imposant une imagerie cérébrale avant la PL ?',
    aide: 'Signes de localisation (déficit moteur, déficit sensitif hémicorporel, hémianopsie, syndrome cérébelleux, aphasie) ou crises focales récentes (< 4 jours) ; signes d\'engagement (troubles de la conscience ET anomalie pupillaire, dysautonomie, crises toniques postérieures, aréactivité, décortication ou décérébration) ; crises persistantes. Des troubles de conscience isolés ne suffisent pas (SPILF 2018).',
    options: ouiNon,
    // Tant que la PL n'est pas faite, même si une hémoculture documente déjà le germe.
    pertinente: (r) => avantPL(r),
  },
  {
    id: 'meningite.ci_pl',
    foyers: ['meningite'],
    libelle: 'Contre-indication non neurologique à la PL ?',
    aide: 'Infection cutanée au site de ponction ; instabilité hémodynamique ou respiratoire non contrôlée ; troubles connus de l\'hémostase (hémophilie, autre coagulopathie, plaquettes < 50 000/mm³) ; anticoagulant à dose efficace (AVK, héparine, AOD quelle que soit la dose) ; saignement spontané évoquant une CIVD. Les antiagrégants plaquettaires ne contre-indiquent pas la PL (SPILF 2018).',
    options: ouiNon,
    pertinente: (r) => avantPL(r),
  },
  {
    id: 'meningite.listeriose',
    foyers: ['meningite'],
    libelle: 'Autres arguments pour une listériose ?',
    aide: 'Comorbidités, début progressif, rhombencéphalite (atteinte des nerfs crâniens et/ou syndrome cérébelleux). L\'âge > 70 ans et l\'immunodépression, saisis par ailleurs, en sont aussi (SPILF 2018).',
    options: ouiNon,
    pertinente: (r, d) =>
      !documente(d) && ['pas_faite', 'trouble_attente', 'negatif', 'inconnu'].includes(r('meningite.lcs')) && !(d.patient.age !== undefined && d.patient.age > 70) && d.patient.immunodepression !== 'oui',
  },
  {
    id: 'meningite.germe',
    foyers: ['meningite'],
    libelle: 'Germe identifié (culture, PCR ou antigène du LCS, hémoculture)',
    aide: 'Inutile de répondre si une hémoculture ou un prélèvement de LCS saisi l\'identifie déjà (S. pneumoniae, E. coli, S. agalactiae). Un germe d\'un autre site (ECBU, prélèvement respiratoire ou vaginal) ne documente pas la méningite.',
    options: [
      { v: 'non_documente', l: 'Pas encore identifié' },
      { v: 'pneumocoque', l: 'Pneumocoque' },
      { v: 'meningocoque', l: 'Méningocoque' },
      { v: 'listeria', l: 'Listeria monocytogenes' },
      { v: 'h_influenzae', l: 'Haemophilus influenzae' },
      { v: 'e_coli', l: 'Escherichia coli' },
      { v: 's_agalactiae', l: 'Streptococcus agalactiae' },
      { v: 'autre', l: 'Autre germe' },
    ],
  },
  {
    id: 'meningite.cmi_c3g',
    foyers: ['meningite'],
    libelle: 'Pneumocoque : CMI de la C3G (céfotaxime/ceftriaxone)',
    aide: 'Seuil de 0,5 mg/L (SPILF 2018, tableau 11). Inutile si la CMI est saisie dans l\'antibiogramme du prélèvement.',
    options: [
      { v: 'le_0_5', l: '≤ 0,5 mg/L' },
      { v: 'gt_0_5', l: '> 0,5 mg/L' },
    ],
    pertinente: (_r, d) => germeMeningite(d) === 'pneumocoque',
  },
  {
    id: 'meningite.cmi_amox',
    foyers: ['meningite'],
    libelle: 'Pneumocoque : CMI de l\'amoxicilline',
    aide: 'Seuil de 0,5 mg/L (SPILF 2018, tableau 11).',
    options: [
      { v: 'le_0_5', l: '≤ 0,5 mg/L' },
      { v: 'gt_0_5', l: '> 0,5 mg/L' },
    ],
    pertinente: (r, d) => germeMeningite(d) === 'pneumocoque' && r('meningite.cmi_c3g') !== 'gt_0_5',
  },
  {
    id: 'meningite.orl',
    foyers: ['meningite'],
    libelle: 'Otite, sinusite ou mastoïdite associée ?',
    aide: 'Pneumocoque avec foyer ORL : imagerie systématique et avis ORL (SPILF 2018).',
    options: ouiNon,
    pertinente: (_r, d) => germeMeningite(d) === 'pneumocoque',
  },
  {
    id: 'meningite.evolution',
    foyers: ['meningite'],
    libelle: 'Évolution après 48-72 h de traitement',
    aide: 'Elle fixe la durée (pneumocoque, méningocoque, Listeria ; méningite non documentée) et l\'indication de la PL de contrôle et de l\'imagerie.',
    options: [
      { v: 'favorable', l: 'Favorable dès 48 h (apyrexie, amélioration)' },
      { v: 'defavorable', l: 'Défavorable (fièvre, troubles de conscience ou céphalées persistants, signes nouveaux)' },
      { v: 'trop_tot', l: 'Pas encore évaluable' },
    ],
    // Lue pour un germe documenté ou une méningite non documentée (examen direct négatif ou en attente).
    pertinente: (r, d) => documente(d) || ['negatif', 'trouble_attente'].includes(r('meningite.lcs')),
  },
];
