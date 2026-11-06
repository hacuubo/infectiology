/**
 * Questions du foyer intra-abdominal (docs/sources/recherche-intra-abdominal.md §11.2) : type d'infection,
 * contrôle de la source, forme compliquée ou non, facteurs de risque de BLSE/BMR/entérocoque (SFAR 2026, tableau 1),
 * critères antifongiques (SFAR 2026 R1.2.13), diverticulite (HAS), angiocholite (TG18), cholécystite, PBS (EASL 2018).
 * Âge, sexe, grossesse, gravité (sepsis/choc), contexte communautaire/associé aux soins, allergies, immunodépression
 * et fonction rénale viennent de la saisie du patient : ils ne sont pas redemandés.
 */
import type { Dossier } from '../../engine/etat';
import type { QuestionSyndrome } from './questions';

const F: QuestionSyndrome['foyers'] = ['digestif'];
const ouiNon = [
  { v: 'oui', l: 'Oui' },
  { v: 'non', l: 'Non' },
];

type R = (id: string) => string;
const type = (r: R) => r('digestif.type');
const grave = (d: Dossier) => d.patient.gravite === 'sepsis' || d.patient.gravite === 'choc_septique';
/** Infection intra-abdominale relevant de SFAR 2026 (geste de contrôle de la source). */
const iiaSfar = (r: R) => type(r) === 'peritonite' || (type(r) === 'diverticulite' && r('digestif.diverticulite.forme') === 'peritonite') || (type(r) === 'appendicite' && r('digestif.appendicite.prise_en_charge') === 'appendicectomie');
const premierEpisodeSoins = (r: R, d: Dossier) => iiaSfar(r) && d.patient.contexte === 'associe_aux_soins' && r('digestif.postop') !== 'complication_iia';

export const QUESTIONS_INTRA_ABDOMINAL: QuestionSyndrome[] = [
  {
    id: 'digestif.type',
    foyers: F,
    libelle: 'Type d\'infection intra-abdominale',
    aide: 'Péritonite : perforation d\'organe creux, collection, péritonite postopératoire… (IIA nécessitant un geste, SFAR 2026). Les infections biliaires, la cirrhose, les abcès hépatiques isolés et l\'appendicite non opérée sont hors du champ SFAR 2026.',
    options: [
      { v: 'peritonite', l: 'Péritonite ou autre IIA nécessitant un geste (perforation, collection, postopératoire)' },
      { v: 'appendicite', l: 'Appendicite aiguë' },
      { v: 'diverticulite', l: 'Diverticulite colique' },
      { v: 'angiocholite', l: 'Angiocholite' },
      { v: 'cholecystite', l: 'Cholécystite aiguë' },
      { v: 'pbs', l: 'Infection spontanée du liquide d\'ascite (cirrhose)' },
      { v: 'abces_hepatique', l: 'Abcès hépatique' },
      { v: 'autre', l: 'Autre (pancréatite infectée…)' },
    ],
  },
  {
    id: 'digestif.postop',
    foyers: F,
    libelle: 'IIA associée aux soins : quel cadre ?',
    aide: 'Une IIA après chirurgie abdominale réglée est un premier épisode d\'IIA associée aux soins ; une IIA après une première intervention pour IIA (reprise) relève des complications (SFAR 2026, champ 3). La durée diffère entre IIA postopératoire et non postopératoire.',
    options: [
      { v: 'non_postop', l: 'Premier épisode, non postopératoire (hospitalisation > 48 h, acte de soins)' },
      { v: 'postop_reglee', l: 'Premier épisode, postopératoire d\'une chirurgie réglée' },
      { v: 'complication_iia', l: 'Complication après une intervention pour IIA' },
    ],
    pertinente: (r, d) => (type(r) === 'peritonite' || (type(r) === 'diverticulite' && r('digestif.diverticulite.forme') === 'peritonite')) && d.patient.contexte === 'associe_aux_soins',
  },
  {
    id: 'digestif.appendicite.forme',
    foyers: F,
    libelle: 'Appendicite compliquée ?',
    aide: 'Compliquée : perforée, gangréneuse, abcédée ou avec péritonite (s\'étendant au-delà de l\'organe d\'origine).',
    options: [
      { v: 'non_compliquee', l: 'Non compliquée' },
      { v: 'compliquee', l: 'Compliquée' },
    ],
    pertinente: (r) => type(r) === 'appendicite',
  },
  {
    id: 'digestif.appendicite.prise_en_charge',
    foyers: F,
    libelle: 'Prise en charge de l\'appendicite',
    options: [
      { v: 'appendicectomie', l: 'Appendicectomie (réalisée ou prévue)' },
      { v: 'non_operee', l: 'Traitement non opératoire (antibiotiques seuls)' },
    ],
    pertinente: (r) => type(r) === 'appendicite',
  },
  {
    id: 'digestif.diverticulite.forme',
    foyers: F,
    libelle: 'Forme de la diverticulite',
    aide: 'Classification de Hinchey (HAS 2017, annexe 1) : I abcès péricolique, II abcès pelvien ou à distance, III péritonite purulente, IV péritonite fécale.',
    options: [
      { v: 'non_compliquee', l: 'Non compliquée' },
      { v: 'abces', l: 'Abcès (Hinchey I-II)' },
      { v: 'bulles', l: 'Perforation avec bulles péricoliques, sans péritonite' },
      { v: 'peritonite', l: 'Péritonite généralisée (Hinchey III-IV)' },
    ],
    pertinente: (r) => type(r) === 'diverticulite',
  },
  {
    id: 'digestif.diverticulite.scanner',
    foyers: F,
    libelle: 'Diverticulite confirmée par un scanner ?',
    options: ouiNon,
    pertinente: (r) => type(r) === 'diverticulite' && r('digestif.diverticulite.forme') === 'non_compliquee',
  },
  {
    id: 'digestif.diverticulite.signes_gravite',
    foyers: F,
    libelle: 'Signes de gravité (PAS ≤ 100 mmHg, FR ≥ 22/min ou confusion) ?',
    options: ouiNon,
    pertinente: (r, d) => type(r) === 'diverticulite' && r('digestif.diverticulite.forme') === 'non_compliquee' && !grave(d),
  },
  {
    id: 'digestif.diverticulite.asa',
    foyers: F,
    libelle: 'Score ASA > 3 ?',
    options: ouiNon,
    pertinente: (r) => type(r) === 'diverticulite' && r('digestif.diverticulite.forme') === 'non_compliquee',
  },
  {
    id: 'digestif.diverticulite.echec',
    foyers: F,
    libelle: 'Absence de réponse au traitement symptomatique ?',
    options: [
      { v: 'non', l: 'Non : prise en charge initiale' },
      { v: 'oui', l: 'Oui : pas de réponse au traitement symptomatique' },
    ],
    pertinente: (r) => type(r) === 'diverticulite' && r('digestif.diverticulite.forme') === 'non_compliquee',
  },
  {
    id: 'digestif.source',
    foyers: F,
    libelle: 'Contrôle de la source (chirurgie, drainage percutané ou endoscopique)',
    aide: 'Les durées courtes (2, 4 ou 8 jours) ne s\'appliquent qu\'après un contrôle de la source jugé adéquat ; elles courent à partir du geste.',
    options: [
      { v: 'obtenu', l: 'Obtenu (geste réalisé, jugé adéquat)' },
      { v: 'en_attente', l: 'Geste prévu, pas encore réalisé' },
      { v: 'non', l: 'Pas de geste réalisé ni prévu' },
    ],
    pertinente: (r) => iiaSfar(r) || type(r) === 'angiocholite',
  },
  {
    id: 'digestif.fdr_blse',
    foyers: F,
    libelle: 'Facteurs de risque de BLSE (SFAR 2026, tableau 1)',
    aide: 'Autres facteurs : amoxicilline-acide clavulanique, C2G, C3G ou fluoroquinolone dans les 6 mois ; voyage en zone d\'endémie dans les 3 mois ; EHPAD/SLD avec sonde urinaire à demeure ou gastrostomie ; prévalence locale élevée.',
    options: [
      { v: 'atcd_blse_6mois', l: 'Antécédent documenté de colonisation ou d\'infection à BLSE dans les 6 mois' },
      { v: 'autre_fdr', l: 'Autre facteur de risque seulement' },
      { v: 'aucun', l: 'Aucun' },
    ],
    pertinente: (r, d) => iiaSfar(r) && d.patient.contexte === 'communautaire' && grave(d),
  },
  {
    id: 'digestif.bmr',
    foyers: F,
    libelle: 'Nombre de critères de risque de bactérie multirésistante (SFAR 2026, tableau 1)',
    aide: 'C3G ou fluoroquinolone dans les 3 mois ; portage < 3 mois de BLSE ou de P. aeruginosa résistant à la ceftazidime ; hospitalisation à l\'étranger dans les 12 mois ; EHPAD/SLD avec dispositif invasif ; échec d\'un traitement par C3G, fluoroquinolone ou pipéracilline-tazobactam ; récidive précoce (< 15 jours) sous pipéracilline-tazobactam ≥ 3 jours.',
    options: [
      { v: 'aucun', l: 'Aucun' },
      { v: 'un', l: 'Un' },
      { v: 'deux_ou_plus', l: 'Deux ou plus' },
    ],
    pertinente: premierEpisodeSoins,
  },
  {
    id: 'digestif.dosage_cefepime',
    foyers: F,
    libelle: 'Dosage plasmatique du céfépime disponible ?',
    aide: 'SFAR 2026 : le céfépime s\'utilise guidé par ses concentrations plasmatiques (neurotoxicité) ; sinon, pipéracilline-tazobactam selon l\'écologie.',
    options: ouiNon,
    pertinente: premierEpisodeSoins,
  },
  {
    id: 'digestif.fdr_enterocoque',
    foyers: F,
    libelle: 'Facteur de risque d\'entérocoque résistant à l\'ampicilline ?',
    aide: 'Péritonite d\'origine suspectée hépato-biliaire ; transplantation hépatique, immunodépression ; antibiothérapie en cours ou céphalosporine préalable (SFAR 2026, tableau 1).',
    options: ouiNon,
    pertinente: premierEpisodeSoins,
  },
  {
    id: 'digestif.levures',
    foyers: F,
    libelle: 'Examen direct du liquide péritonéal positif à levures ?',
    options: ouiNon,
    pertinente: (r, d) => iiaSfar(r) && (d.patient.contexte === 'associe_aux_soins' || grave(d)),
  },
  {
    id: 'digestif.sus_mesocolique',
    foyers: F,
    libelle: 'Chirurgie sus-mésocolique ?',
    options: ouiNon,
    pertinente: (r, d) => iiaSfar(r) && (d.patient.contexte === 'associe_aux_soins' || grave(d)) && r('digestif.levures') !== 'oui',
  },
  {
    id: 'digestif.atb_48h',
    foyers: F,
    libelle: 'Antibiothérapie en cours depuis plus de 48 heures ?',
    options: ouiNon,
    pertinente: (r, d) => iiaSfar(r) && (d.patient.contexte === 'associe_aux_soins' || grave(d)) && r('digestif.levures') !== 'oui',
  },
  {
    id: 'digestif.angiocholite.dysfonction',
    foyers: F,
    libelle: 'Dysfonction d\'au moins un organe (TG18, grade III) ?',
    aide: 'Hypotension nécessitant dopamine ≥ 5 µg/kg/min ou noradrénaline ; trouble de conscience ; PaO2/FiO2 < 300 ; oligurie ou créatinine > 2,0 mg/dL ; TP-INR > 1,5 ; plaquettes < 100 000/mm³.',
    options: ouiNon,
    pertinente: (r, d) => type(r) === 'angiocholite' && d.patient.gravite !== 'choc_septique',
  },
  {
    id: 'digestif.angiocholite.grade2',
    foyers: F,
    libelle: 'Au moins deux critères de grade II (TG18) ?',
    aide: 'Leucocytes > 12 000 ou < 4 000/mm³ ; fièvre ≥ 39 °C ; âge ≥ 75 ans ; bilirubine totale ≥ 5 mg/dL ; hypoalbuminémie (< 0,7 × limite inférieure).',
    options: ouiNon,
    pertinente: (r, d) => type(r) === 'angiocholite' && d.patient.gravite !== 'choc_septique' && r('digestif.angiocholite.dysfonction') !== 'oui',
  },
  {
    id: 'digestif.biliaire.anastomose',
    foyers: F,
    libelle: 'Anastomose bilio-digestive ?',
    aide: 'TG18 : couverture des anaérobies (métronidazole) suggérée si une anastomose bilio-digestive est présente.',
    options: ouiNon,
    pertinente: (r) => type(r) === 'angiocholite',
  },
  {
    id: 'digestif.cholecystite.prise_en_charge',
    foyers: F,
    libelle: 'Prise en charge de la cholécystite',
    options: [
      { v: 'cholecystectomie', l: 'Cholécystectomie' },
      { v: 'drainage', l: 'Drainage percutané (cholécystostomie)' },
      { v: 'ni_l_un_ni_l_autre', l: 'Ni opérée ni drainée' },
    ],
    pertinente: (r) => type(r) === 'cholecystite',
  },
  {
    id: 'digestif.cholecystite.compliquee',
    foyers: F,
    libelle: 'Cholécystite compliquée (perforation, gangrène ou nécrose, emphysème) ?',
    options: ouiNon,
    pertinente: (r) => type(r) === 'cholecystite',
  },
  {
    id: 'digestif.pbs.pnn',
    foyers: F,
    libelle: 'Polynucléaires neutrophiles dans le liquide d\'ascite > 250/mm³ ?',
    options: ouiNon,
    pertinente: (r) => type(r) === 'pbs',
  },
  {
    id: 'digestif.pbs.resistance',
    foyers: F,
    libelle: 'Prévalence locale de bactéries résistantes',
    aide: 'EASL 2018 ne chiffre pas le seuil : selon l\'écologie de l\'établissement.',
    options: [
      { v: 'faible', l: 'Faible' },
      { v: 'elevee', l: 'Élevée (BLSE fréquentes)' },
    ],
    pertinente: (r) => type(r) === 'pbs',
  },
];
