/**
 * Questions du foyer pulmonaire (docs/sources/recherche-pneumonies.md §10.2). Le contexte communautaire ou
 * associé aux soins, la gravité (sepsis, choc), l'immunodépression, les allergies, la fonction rénale (dont
 * l'épuration extrarénale), les antibiotiques récents et les antécédents de BLSE viennent de la saisie du patient :
 * ils ne sont pas redemandés.
 */
import type { Dossier } from '../../engine/etat';
import { estimation, estimerFonctionRenale } from '../../calc/renal';
import type { QuestionSyndrome } from './questions';

const ouiNon = [
  { v: 'oui', l: 'Oui' },
  { v: 'non', l: 'Non' },
];

const communautaire = (d: Dossier) => d.patient.contexte === 'communautaire';
const associeAuxSoins = (d: Dossier) => d.patient.contexte === 'associe_aux_soins';

const normaliser = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const JOUR_MS = 24 * 3600 * 1000;

/**
 * Antibiothérapie dans le mois précédent (SPILF 2025, tableau 3 : « sauf nitrofurantoïne, fosfomycine orale,
 * pivmecillinam ») : en cours, ou terminée (à défaut commencée) depuis 30 jours au plus. Sans date, rien n'est déduit.
 */
export function antibiotiqueDuMois(d: Dossier, maintenant: Date): string | undefined {
  for (const a of d.patient.antibiotiquesRecents) {
    const n = normaliser(a.dci ?? '');
    if (!n || ['nitrofur', 'fosfomycine', 'pivmecillinam'].some((x) => n.includes(x))) continue;
    if (a.enCours === 'oui') return a.dci;
    const date = a.fin ?? a.debut;
    if (!date) continue;
    const t = new Date(date).getTime();
    if (!Number.isNaN(t) && maintenant.getTime() - t <= 30 * JOUR_MS) return a.dci;
  }
  return undefined;
}

/** DFG estimé < 30 mL/min sans insuffisance rénale aiguë ni instabilité déclarées, hors dialyse (tableau 3). */
export function dfgInferieur30(d: Dossier, maintenant: Date): boolean {
  const p = d.patient;
  if (p.renal.insuffisanceRenaleAigue === 'oui' || p.renal.stabilite === 'instable' || p.renal.dialyse !== 'aucune') return false;
  const r = estimerFonctionRenale({
    ageAns: p.age,
    poidsKg: p.poidsKg,
    tailleCm: p.tailleCm,
    sexe: p.sexe,
    creatinine: p.renal.creatinine,
    dfg: p.renal.dfg,
    stabilite: p.renal.stabilite,
    insuffisanceRenaleAigue: p.renal.insuffisanceRenaleAigue,
    dialyse: p.renal.dialyse,
    equation: p.renal.equationDfg,
    poidsCockcroft: p.renal.poidsCockcroft,
    infectionGrave: p.gravite === 'sepsis' || p.gravite === 'choc_septique',
    grossesse: p.grossesse === 'oui',
    maintenant,
  });
  return (['dfg_indexe', 'dfg_desindexe'] as const).some((id) => {
    const v = estimation(r, id).valeur;
    return v !== undefined && Math.round(v) < 30;
  });
}

const maintenantDe = (d: Dossier) => (d.horaires?.maintenantISO ? new Date(d.horaires.maintenantISO) : new Date());

/** Comorbidité du tableau 3 SPILF 2025 déjà déduite de la saisie : la question n'est pas posée. */
export function comorbiditeDeduite(d: Dossier, maintenant: Date = maintenantDe(d)): string | undefined {
  const p = d.patient;
  if (p.immunodepression === 'oui') return 'immunodépression';
  if (p.insuffisanceHepatique === 'oui') return 'insuffisance hépatique';
  if (p.renal.dialyse === 'hemodialyse_intermittente' || p.renal.dialyse === 'dialyse_peritoneale') return 'insuffisance rénale chronique dialysée';
  if (dfgInferieur30(d, maintenant)) return 'DFG estimé < 30 mL/min (insuffisance rénale chronique si l\'état est stable)';
  const atb = antibiotiqueDuMois(d, maintenant);
  if (atb) return `antibiothérapie dans le mois précédent (${atb})`;
  return undefined;
}
const reanimation = (r: (id: string) => string) => r('pneumonie.soins_lieu') === 'pavm' || r('pneumonie.soins_lieu') === 'rea';
/** Pneumonie non grave selon la réponse (le choc septique déclaré est un critère majeur). */
const nonGrave = (r: (id: string) => string, d: Dossier) => r('pneumonie.grave') !== 'oui' && d.patient.gravite !== 'choc_septique';

export const QUESTIONS_PNEUMONIE: QuestionSyndrome[] = [
  {
    id: 'pneumonie.orientation',
    foyers: ['pulmonaire'],
    libelle: 'Orientation clinique de la pneumonie communautaire',
    aide: 'Légionellose : exposition à risque (voyage, eau en aérosols), début rapide, signes digestifs ou neurologiques, pouls dissocié, insuffisance rénale, hyponatrémie, cytolyse. M. pneumoniae : épidémie familiale ou en institution, sujet jeune, toux fébrile traînante. Inhalation : signes d\'infection respiratoire basse avec infiltrat radiologique nouveau, et troubles de la déglutition ou inhalation, ou atteinte déclive avec facteur de risque d\'inhalation. LPV : contexte post-grippal, gravité, hémoptysie, leucopénie, rash, pneumonie nécrosante. Une fausse route immédiatement suivie d\'un tableau respiratoire aigu (pneumopathie chimique) n\'est pas une pneumonie d\'inhalation.',
    options: [
      { v: 'aucune', l: 'Pas d\'orientation particulière' },
      { v: 'grippe', l: 'Contexte grippal' },
      { v: 'atypique', l: 'Bactérie « atypique » suspectée (M. pneumoniae, C. pneumoniae)' },
      { v: 'legionellose', l: 'Légionellose suspectée ou confirmée' },
      { v: 'inhalation', l: 'Pneumonie d\'inhalation' },
      { v: 'lpv', l: 'Tableau évocateur de S. aureus producteur de LPV' },
      { v: 'fausse_route', l: 'Fausse route constatée, sans pneumonie (tableau immédiat)' },
    ],
    pertinente: (_r, d) => communautaire(d),
  },
  {
    id: 'pneumonie.lieu',
    foyers: ['pulmonaire'],
    libelle: 'Lieu de prise en charge retenu',
    aide: 'Orientation selon les critères de 2010, auxquels renvoie la SPILF 2025 : CRB 65 (confusion, fréquence respiratoire ≥ 30/min, PAS < 90 ou PAD ≤ 60 mmHg, âge ≥ 65 ans) ; 0 critère : ambulatoire possible ; ≥ 1 critère : évaluation à l\'hôpital. Hospitalisation aussi si signe de gravité, néoplasie, inhalation ou obstacle, complication, isolement ou inobservance prévisible.',
    options: [
      { v: 'ambulatoire', l: 'Ambulatoire' },
      { v: 'hospitalisation', l: 'Hospitalisation hors soins critiques' },
      { v: 'soins_critiques', l: 'Soins critiques (réanimation, soins intensifs)' },
    ],
    pertinente: (r, d) => communautaire(d) && r('pneumonie.orientation') !== 'fausse_route',
  },
  {
    id: 'pneumonie.grave',
    foyers: ['pulmonaire'],
    libelle: 'Critères de pneumonie grave (au moins 1 critère majeur ou 3 critères mineurs) ?',
    aide: 'Majeurs : choc septique ; détresse respiratoire nécessitant la ventilation mécanique. Mineurs : FR ≥ 30/min ; PaO2/FiO2 ≤ 250 ; infiltrats multilobaires ; confusion ; urée ≥ 7,14 mmol/L ; leucocytes < 4 000/mm³ (dus à l\'infection) ; plaquettes < 100 000/mm³ ; température < 36 °C ; hypotension nécessitant une expansion volémique (SPILF 2025, tableau 1).',
    options: ouiNon,
    pertinente: (r, d) => communautaire(d) && r('pneumonie.lieu') !== 'ambulatoire' && r('pneumonie.orientation') !== 'fausse_route' && d.patient.gravite !== 'choc_septique',
  },
  {
    id: 'pneumonie.comorbidite',
    foyers: ['pulmonaire'],
    libelle: 'Au moins une comorbidité de la liste SPILF 2025 ?',
    aide: 'Hospitalisation dans les 3 mois ; antibiothérapie dans le mois (sauf nitrofurantoïne, fosfomycine orale, pivmécillinam) ; éthylisme chronique ; troubles de la déglutition ; maladie neurologique sévère avec risque de fausses routes ; néoplasie active ; immunodépression ; BPCO sévère ou insuffisance respiratoire chronique (OLD, VNI) ; insuffisance cardiaque congestive ; insuffisance hépatique ; insuffisance rénale chronique (DFG < 30). L\'asthme seul et l\'âge seul n\'en sont pas.',
    options: ouiNon,
    // Lue seulement par les parcours « sans orientation » (ambulatoire, hospitalisation, soins critiques non graves) et par
    // le volet non grave d'un tableau de LPV de gravité non établie.
    pertinente: (r, d) => communautaire(d) && comorbiditeDeduite(d) === undefined && ['aucune', 'inconnu', 'lpv'].includes(r('pneumonie.orientation')) && nonGrave(r, d),
  },
  {
    id: 'pneumonie.fdr_pyo',
    foyers: ['pulmonaire'],
    libelle: 'Facteur de risque de Pseudomonas aeruginosa ?',
    aide: 'Pris en compte chez le patient hospitalisé : la colonisation ou l\'infection respiratoire récente suffit ; les autres facteurs ne comptent que pour la pneumonie grave admise en soins critiques et la pneumonie d\'inhalation grave.',
    options: [
      { v: 'colonisation', l: 'Colonisation ou infection respiratoire à P. aeruginosa depuis moins d\'un an' },
      { v: 'autre', l: 'Autre : antibiothérapie parentérale < 3 mois, BPCO sévère, bronchectasies, trachéotomie' },
      { v: 'non', l: 'Aucun' },
    ],
    pertinente: (r, d) => {
      const o = r('pneumonie.orientation');
      if (!communautaire(d) || r('pneumonie.lieu') === 'ambulatoire' || ['legionellose', 'fausse_route'].includes(o)) return false;
      // Inhalation : lue seulement pour la forme grave (ou de gravité non établie) ; LPV grave : schéma anti-toxinique sans ce critère.
      if (o === 'inhalation') return r('pneumonie.grave') !== 'non';
      if (o === 'lpv') return nonGrave(r, d);
      return true;
    },
  },
  {
    id: 'pneumonie.stabilite',
    foyers: ['pulmonaire'],
    libelle: 'Critères de stabilité clinique (température ≤ 37,8 °C, PAS ≥ 90 mmHg, FC ≤ 100/min, FR ≤ 24/min, SpO2 ≥ 90 % ou PaO2 ≥ 60 mmHg en air ambiant)',
    aide: 'Fixe la durée totale de la pneumonie non grave hors soins critiques : 3 jours si tous les critères sont obtenus à J3, 5 jours s\'ils le sont entre J3 et J5, 7 jours sinon (SPILF 2025). La toux, l\'expectoration et l\'asthénie peuvent persister plusieurs semaines.',
    options: [
      { v: 'j3', l: 'Tous obtenus à J3' },
      { v: 'j3_j5', l: 'Obtenus entre J3 et J5' },
      { v: 'non', l: 'Non obtenus à J5' },
      { v: 'pas_encore', l: 'Pas encore évaluable (avant J3)' },
    ],
    pertinente: (r, d) =>
      communautaire(d) && ['aucune', 'grippe', 'atypique', 'inhalation', 'inconnu', 'lpv'].includes(r('pneumonie.orientation')) && nonGrave(r, d) && r('pneumonie.lieu') !== 'soins_critiques',
  },
  {
    id: 'pneumonie.soins_lieu',
    foyers: ['pulmonaire'],
    libelle: 'Pneumonie associée aux soins : où est-elle survenue ?',
    aide: 'Pneumonie survenant après 48 h d\'hospitalisation (pneumonie acquise à l\'hôpital) ou de ventilation mécanique (PAVM). Une pneumonie acquise hors de l\'hôpital (EHPAD, soins ambulatoires) ou dans les 48 premières heures d\'hospitalisation est communautaire (Afssaps 2010) : choisir le contexte « communautaire ».',
    options: [
      { v: 'pavm', l: 'En réanimation, sous ventilation mécanique (PAVM)' },
      { v: 'rea', l: 'En réanimation, sans ventilation mécanique (pneumonie sévère acquise à l\'hôpital)' },
      { v: 'hors_rea', l: 'Hors réanimation' },
    ],
    pertinente: (_r, d) => associeAuxSoins(d),
  },
  {
    id: 'pneumonie.delai',
    foyers: ['pulmonaire'],
    libelle: 'Délai d\'apparition (depuis l\'admission ou le début de la ventilation)',
    options: [
      { v: 'precoce', l: 'Moins de 5 jours (précoce)' },
      { v: 'tardive', l: '5 jours ou plus (tardive)' },
    ],
    pertinente: (r, d) => associeAuxSoins(d) && reanimation(r),
  },
  {
    id: 'pneumonie.fdr_bmr',
    foyers: ['pulmonaire'],
    libelle: 'Facteur de risque de BMR ou de bacille à Gram négatif non fermentant (hors choc septique) ?',
    aide: 'BGN non fermentant (P. aeruginosa) : BPCO, dilatation des bronches, mucoviscidose. BMR : antibiothérapie dans les 90 jours, hospitalisation de plus de 5 jours, épuration extrarénale au diagnostic, SDRA (SFAR/SRLF 2017). Le protocole SFAR place les facteurs de BGN non fermentant dans la colonne « tardive » ; il ne prévoit pas la pneumonie précoce avec facteur de BMR seulement.',
    options: [
      { v: 'bgn_nf', l: 'Facteur de risque de BGN non fermentant (avec ou sans facteur de BMR)' },
      { v: 'bmr', l: 'Facteur de risque de BMR seulement (antibiothérapie < 90 j, hospitalisation > 5 j, EER, SDRA)' },
      { v: 'non', l: 'Aucun' },
    ],
    pertinente: (r, d) => associeAuxSoins(d) && reanimation(r),
  },
  {
    id: 'pneumonie.sarm',
    foyers: ['pulmonaire'],
    libelle: 'Facteur de risque de SARM ?',
    aide: 'Colonisation connue ou récente à SARM ; en réanimation, aussi : prévalence locale de SARM élevée, lésion cutanée chronique, dialyse chronique (SFAR/SRLF 2017).',
    options: ouiNon,
    pertinente: (r, d) => (associeAuxSoins(d) && reanimation(r)) || (communautaire(d) && r('pneumonie.orientation') === 'inhalation' && r('pneumonie.lieu') !== 'ambulatoire' && r('pneumonie.grave') !== 'non'),
  },
];
