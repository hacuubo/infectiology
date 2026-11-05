/**
 * Antibiogramme guidé : pour un isolat donné, seules les questions qui peuvent
 * modifier la décision dans le contexte renseigné sont « essentielles » ; les
 * autres restent accessibles (« Ajouter d'autres résultats »).
 *
 * Deux types de saisie :
 *  - phénotype / mécanisme rapporté par le laboratoire : présent / absent / non rapporté ;
 *  - sensibilité à une molécule : S / I / R / non testé (NT).
 * Une absence de réponse n'est jamais lue comme « absent », « non » ou « sensible ».
 */
import type { CategorieSaisie, DonneesIsolat, EtatPhenotype, OrganismeId, PhenotypeId, SourceRef } from '../types';
import { S } from '../molecules/base';
import type { FamilleGerme } from './germes';

export interface ContexteGuide {
  famille: FamilleGerme;
  organisme: OrganismeId;
  /** Foyer urinaire retenu (déclaré ou déduit de l'indication). */
  urinaire: boolean;
  endocardite: boolean;
  grave: boolean;
  /** Pénicillines et céphalosporines à éviter (allergie déclarée). */
  allergieBetaLactamines: boolean;
  protheseValvulaireOuIntracardiaque: boolean;
  bacteriemie: boolean;
  /** SCN : signification de l'hémoculture (≥ 2 séries = « oui » ; 1 série = « non »). */
  scnSignificatif: 'oui' | 'non' | 'inconnu';
  /** Conclusion « ne pas traiter » établie pour ce prélèvement : l'antibiogramme ne change plus la conduite. */
  traitementNonIndique?: boolean;
}

export type GroupeQuestion = 'Mécanisme rapporté' | 'Choix du traitement' | 'Relais oral (foyer urinaire)' | 'Allergie' | 'Matériel / endocardite' | 'Autres résultats';

interface QuestionBase {
  id: string;
  libelle: string;
  /** Libellés tels qu'ils peuvent apparaître sur le compte rendu. */
  compteRendu: string;
  /** Aide courte pour retrouver ou interpréter l'information. */
  aide: string;
  /** Pourquoi la réponse peut changer la décision. */
  utilite: string;
  groupe: GroupeQuestion;
  sources: SourceRef[];
}
export interface QuestionPhenotype extends QuestionBase {
  type: 'phenotype';
  phenotype: PhenotypeId;
  etats: Record<EtatPhenotype, string>;
}
export interface QuestionMolecule extends QuestionBase {
  type: 'molecule';
  dci: string;
  /** Renseigné seulement quand la CMI change réellement la décision. */
  cmi?: string;
}
export type QuestionMicro = QuestionPhenotype | QuestionMolecule;

export interface GuideAntibiogramme {
  famille?: FamilleGerme;
  essentielles: QuestionMicro[];
  complementaires: QuestionMicro[];
  message?: string;
}

/* ------------------------------------------------------------------ */
/* Lecture des réponses                                                */
/* ------------------------------------------------------------------ */

export function categorieDe(iso: DonneesIsolat, dci: string): CategorieSaisie | undefined {
  return iso.antibiogramme?.find((r) => r.dci === dci)?.categorie;
}
/** Catégorie exploitable : S, I ou R ; « NT » et l'absence de réponse renvoient undefined (inconnu). */
export function sirDe(iso: DonneesIsolat, dci: string): 'S' | 'I' | 'R' | undefined {
  const c = categorieDe(iso, dci);
  return c === 'NT' ? undefined : c;
}
export function etatPhenotype(iso: DonneesIsolat, id: PhenotypeId): EtatPhenotype {
  return iso.phenotypes?.[id] ?? 'non_rapporte';
}
const nonS = (c: 'S' | 'I' | 'R' | undefined) => c === 'I' || c === 'R';

/* ------------------------------------------------------------------ */
/* Catalogue                                                           */
/* ------------------------------------------------------------------ */

const CASFM = (repere: string, extrait?: string) => S('CASFM-2026-V1.0', repere, extrait, 'definition');
export const AIDE_I = 'I = « sensible à forte posologie » (CA-SFM 2026) : la molécule reste utilisable, mais à la forte posologie ; ne pas l\'assimiler à R.';
export const SOURCE_I: SourceRef[] = [
  CASFM('ch. 3, p. 41', '"Sensible à forte posologie" : la probabilité de succès thérapeutique est élevée dès lors que l\'antibiotique est utilisé à forte posologie'),
  S('EUCAST-definitions-SIR', 'New definitions of S, I and R', 'The tradition to lump I and R together as \'non-susceptible\' is not valid.', 'definition'),
];

const LIB_MOLECULE: Record<string, string> = {
  amoxicilline: 'Amoxicilline',
  amoxicilline_clavulanate: 'Amoxicilline-acide clavulanique',
  piperacilline_tazobactam: 'Pipéracilline-tazobactam',
  temocilline: 'Témocilline',
  cefazoline: 'Céfazoline',
  cefoxitine: 'Céfoxitine',
  cefotaxime: 'Céfotaxime',
  ceftriaxone: 'Ceftriaxone',
  ceftazidime: 'Ceftazidime',
  cefepime: 'Céfépime',
  cefixime: 'Céfixime',
  aztreonam: 'Aztréonam',
  ertapeneme: 'Ertapénème',
  imipeneme: 'Imipénème',
  meropeneme: 'Méropénème',
  amikacine: 'Amikacine',
  gentamicine: 'Gentamicine',
  ciprofloxacine: 'Ciprofloxacine',
  levofloxacine: 'Lévofloxacine',
  cotrimoxazole: 'Triméthoprime-sulfaméthoxazole (cotrimoxazole)',
  oxacilline: 'Oxacilline',
  penicilline_g: 'Pénicilline G (benzylpénicilline)',
  vancomycine: 'Vancomycine',
  daptomycine: 'Daptomycine',
  rifampicine: 'Rifampicine',
  fosfomycine: 'Fosfomycine',
  nitrofurantoine: 'Nitrofurantoïne',
  teicoplanine: 'Téicoplanine',
  linezolide: 'Linézolide',
  clindamycine: 'Clindamycine',
};
export function libelleMolecule(dci: string): string {
  return LIB_MOLECULE[dci] ?? dci;
}

function mol(dci: string, groupe: GroupeQuestion, utilite: string, o: Partial<Pick<QuestionMolecule, 'libelle' | 'compteRendu' | 'aide' | 'sources' | 'cmi'>> = {}): QuestionMolecule {
  return {
    type: 'molecule',
    id: `mol-${dci}`,
    dci,
    libelle: o.libelle ?? libelleMolecule(dci),
    compteRendu: o.compteRendu ?? `« ${libelleMolecule(dci).split(' (')[0]} » suivi de S, I (« SFP ») ou R`,
    aide: o.aide ?? AIDE_I,
    utilite,
    groupe,
    sources: o.sources ?? [],
    cmi: o.cmi,
  };
}

type ModelePhenotype = Omit<QuestionPhenotype, 'groupe'>;
const PHENOTYPES: Record<PhenotypeId, ModelePhenotype> = {
  BLSE: {
    type: 'phenotype',
    id: 'ph-BLSE',
    phenotype: 'BLSE',
    libelle: 'BLSE (bêta-lactamase à spectre étendu)',
    compteRendu: '« BLSE », « EBLSE », « bêta-lactamase à spectre étendu », en conclusion ou en commentaire',
    aide: 'Ne la déduisez pas vous-même d\'une résistance aux C3G : seule la mention du laboratoire compte.',
    utilite: 'Une BLSE rend R les C3G, C4G et l\'aztréonam (lecture CA-SFM) et oriente vers les alternatives aux C3G ; la céfoxitine n\'est envisageable que si la BLSE est documentée (E. coli, Proteus).',
    etats: { present: 'BLSE rapportée', absent: 'Absence de BLSE indiquée', non_rapporte: 'Non mentionné' },
    sources: [CASFM('ch. 5.1 Enterobacterales', 'pour les souches productrices de BLSE, il est recommandé d\'interpréter "résistant" tout résultat "sensible" ou "sensible à forte posologie" aux C3G, aux C4G ou à l\'aztréonam'), S('SPILF-2026-IUM', 'diapo 17, 24', 'céfoxitine IV 6 g/jour (seulement si E. coli ou Proteus)', 'choix')],
  },
  ampc: {
    type: 'phenotype',
    id: 'ph-ampc',
    phenotype: 'ampc',
    libelle: 'Céphalosporinase hyperproduite ou acquise (AmpC)',
    compteRendu: '« céphalosporinase de haut niveau », « hyperproduite », « déréprimée » ou « céphalosporinase plasmidique »',
    aide: 'Le laboratoire la mentionne en commentaire. Une résistance aux C3G sans BLSE peut relever de ce mécanisme : demandez-le au laboratoire plutôt que de le supposer.',
    utilite: 'Une céphalosporinase hyperproduite rend R les C3G, l\'aztréonam et la pipéracilline-tazobactam (CA-SFM 2026) : le céfépime devient le traitement de référence.',
    etats: { present: 'Céphalosporinase rapportée', absent: 'Absence indiquée', non_rapporte: 'Non mentionné' },
    sources: [CASFM('ch. 5.1 Enterobacterales', 'interpréter "résistant" tout résultat "sensible" ou "sensible à forte posologie" aux C3G, à l\'aztréonam, à la pipéracilline ou à la pipéracilline-tazobactam'), S('SPILF-2023-BGN-MDR-diapo', 'diapo 10', 'Céfépime est le traitement de référence', 'choix')],
  },
  carbapenemase: {
    type: 'phenotype',
    id: 'ph-carbapenemase',
    phenotype: 'carbapenemase',
    libelle: 'Carbapénémase',
    compteRendu: '« carbapénémase », « EPC », « OXA-48 », « KPC », « NDM », « VIM », « IMP », « BHRe »',
    aide: 'Souvent signalée par un appel du laboratoire ou de l\'équipe d\'hygiène, avec le type d\'enzyme.',
    utilite: 'Une carbapénémase rend R les carbapénèmes (CA-SFM 2026), sort du périmètre de l\'application et impose un avis infectiologique immédiat et des mesures BHRe.',
    etats: { present: 'Carbapénémase rapportée', absent: 'Absence indiquée', non_rapporte: 'Non mentionné' },
    sources: [CASFM('avant-propos p. 5', 'interpréter comme "résistants" les carbapénèmes qui peuvent apparaître "sensibles" ou "sensibles à forte posologie"'), S('HCSP-2019-BHRe', 'définitions', undefined, 'definition')],
  },
  SARM: {
    type: 'phenotype',
    id: 'ph-SARM',
    phenotype: 'SARM',
    libelle: 'Statut vis-à-vis de la méticilline',
    compteRendu: '« SARM », « méti-R », « résistant à la méticilline » / « SAMS », « SASM », « méti-S » ; parfois un résultat rapide (PCR mecA, PLP2a) sur le flacon',
    aide: 'Si le compte rendu ne le dit pas en toutes lettres, indiquez le résultat de la céfoxitine (dépistage) juste en dessous.',
    utilite: 'Décide entre bêta-lactamine anti-staphylococcique (céfazoline, cloxacilline) et vancomycine ou daptomycine.',
    etats: { present: 'Résistant à la méticilline', absent: 'Sensible à la méticilline', non_rapporte: 'Non rapporté' },
    sources: [CASFM('ch. 5.7 Staphylococcus', 'doivent être rendues résistantes à toutes les β-lactamines, y compris les carbapénèmes, à l\'exception de la ceftaroline et du ceftobiprole')],
  },
  ERV: {
    type: 'phenotype',
    id: 'ph-ERV',
    phenotype: 'ERV',
    libelle: 'Entérocoque résistant aux glycopeptides (ERG/ERV)',
    compteRendu: '« ERG », « ERV », « vanA », « vanB »',
    aide: 'Signalé par le laboratoire et l\'équipe d\'hygiène (bactérie hautement résistante émergente).',
    utilite: 'Hors périmètre de l\'application : avis infectiologique immédiat et mesures BHRe.',
    etats: { present: 'ERG/ERV rapporté', absent: 'Absence indiquée', non_rapporte: 'Non mentionné' },
    sources: [S('HCSP-2019-BHRe', 'définitions', 'ERG = E. faecium vanA/vanB', 'definition')],
  },
  hnr_gentamicine: {
    type: 'phenotype',
    id: 'ph-hnr',
    phenotype: 'hnr_gentamicine',
    libelle: 'Haut niveau de résistance à la gentamicine',
    compteRendu: '« gentamicine haut niveau », « HNR gentamicine », « Gentamicine (charge élevée) » R',
    aide: 'Test propre aux entérocoques (CMI > 128 mg/L ou diamètre < 8 mm selon le CA-SFM).',
    utilite: 'Sans haut niveau de résistance, une synergie est attendue avec une pénicilline ou un glycopeptide ; avec, l\'association à la gentamicine perd son intérêt (résistance croisée à l\'amikacine).',
    etats: { present: 'Haut niveau de résistance', absent: 'Pas de haut niveau de résistance', non_rapporte: 'Non rapporté' },
    sources: [CASFM('ch. 5.8 Enterococcus', 'En l\'absence de haut niveau de résistance à la gentamicine […] une synergie est attendue avec les pénicillines ou les glycopeptides')],
  },
};

function pheno(id: PhenotypeId, groupe: GroupeQuestion = 'Mécanisme rapporté'): QuestionPhenotype {
  return { ...PHENOTYPES[id], groupe };
}
export function questionPhenotype(id: PhenotypeId): QuestionPhenotype {
  return pheno(id);
}

/* ------------------------------------------------------------------ */
/* Questions par famille                                               */
/* ------------------------------------------------------------------ */

export function guideAntibiogramme(iso: DonneesIsolat, cg: ContexteGuide | undefined): GuideAntibiogramme {
  if (!cg) return { essentielles: [], complementaires: [], message: 'Identifiez d\'abord le germe : les questions d\'antibiogramme dépendent de l\'espèce.' };
  const ess: QuestionMicro[] = [];
  const s = (dci: string) => sirDe(iso, dci);
  const ph = (id: PhenotypeId) => etatPhenotype(iso, id);
  let message: string | undefined;
  if (cg.traitementNonIndique)
    return { famille: cg.famille, essentielles: [], complementaires: complements(cg.famille), message: 'Pas d’antibiothérapie indiquée dans la situation renseignée : l’antibiogramme ne change pas la conduite. Il reste saisissable ci-dessous.' };

  switch (cg.famille) {
    case 'bgn_non_identifie':
    case 'cgp_non_identifie':
      return { famille: cg.famille, essentielles: [], complementaires: [], message: 'L\'identification du germe est nécessaire : les questions d\'antibiogramme dépendent de l\'espèce.' };
    case 'autre':
      return { famille: cg.famille, essentielles: [], complementaires: autresMolecules(BGN_TOUTES.concat(STAPH_TOUTES)), message: 'Germe hors des familles modélisées : aucune question guidée. Les résultats restent saisissables, mais leur interprétation relève du SMIT.' };
    case 'enterobacterale': {
      const c3g = s('ceftriaxone') ?? s('cefotaxime');
      const blse = ph('BLSE');
      // Une C3G rendue S sur un compte rendu interprété exclut une BLSE détectée (lecture CA-SFM) : la question ne change alors rien.
      if (c3g !== 'S' || blse !== 'non_rapporte') ess.push(pheno('BLSE'));
      const klebsiella = cg.organisme === 'klebsiella_pneumoniae';
      if (!klebsiella) ess.push(mol('amoxicilline', 'Choix du traitement', 'Spectre le plus étroit : à privilégier si la souche est sensible (SPILF 2015).', { sources: [S('SPILF-2015-IU', 'p. 19', 'amoxicilline (à privilégier sur souche sensible)', 'choix')] }));
      ess.push(mol('ceftriaxone', 'Choix du traitement', 'C3G : traitement de référence des infections urinaires fébriles hospitalisées ; une résistance oriente vers les alternatives aux C3G.', { compteRendu: '« Ceftriaxone » ; si seul le céfotaxime est rendu, saisissez-le dans « Ajouter d\'autres résultats »' }));
      if (nonS(c3g) && blse !== 'present') ess.push(pheno('ampc'));
      const c3gR = blse === 'present' || c3g === 'R';
      if (c3gR) {
        if (cg.urinaire) ess.push(mol('temocilline', 'Choix du traitement', 'Alternative aux carbapénèmes dans les infections urinaires à entérobactérie résistante aux C3G (SPILF 2023, SPILF 2026).', { sources: [S('SPILF-2023-BGN-MDR-diapo', 'diapo 6', undefined, 'choix')] }));
        ess.push(mol('piperacilline_tazobactam', 'Choix du traitement', 'Alternative aux carbapénèmes dans les infections urinaires (SPILF 2023) ; à interpréter R si une céphalosporinase hyperproduite est rapportée.', cg.urinaire ? {} : { cmi: 'Hors foyer urinaire, le CA-SFM demande la CMI de l\'association pour une souche productrice de BLSE.', sources: [CASFM('ch. 5.1, p. 49')] }));
        if (cg.urinaire && blse === 'present' && (cg.organisme === 'escherichia_coli' || cg.organisme === 'proteus_mirabilis'))
          ess.push(mol('cefoxitine', 'Choix du traitement', 'Alternative réservée à E. coli ou Proteus producteurs de BLSE, en foyer urinaire (SPILF 2026).', { sources: [S('SPILF-2026-IUM', 'diapo 17, 24', 'céfoxitine IV 6 g/jour (seulement si E. coli ou Proteus)', 'choix')] }));
        if (cg.grave || !cg.urinaire) ess.push(mol('meropeneme', 'Choix du traitement', 'Carbapénème : référence des infections graves ou hors foyer urinaire à entérobactérie résistante aux C3G (SPILF 2023).'));
      }
      if ([s('ertapeneme'), s('meropeneme'), s('imipeneme')].some(nonS) || ph('carbapenemase') === 'present') ess.push(pheno('carbapenemase'));
      if (cg.urinaire) {
        ess.push(mol('cotrimoxazole', 'Relais oral (foyer urinaire)', 'Relais oral sur souche sensible, après amélioration clinique.'));
        ess.push(mol('ciprofloxacine', 'Relais oral (foyer urinaire)', 'Relais oral sur souche sensible ; une résistance s\'étend à toutes les fluoroquinolones (EUCAST, règle 8).'));
        if (!c3gR && s('amoxicilline') !== 'S' && !klebsiella) ess.push(mol('amoxicilline_clavulanate', 'Relais oral (foyer urinaire)', 'Relais oral possible si la souche est sensible et sans BLSE.'));
      }
      if (cg.allergieBetaLactamines) {
        if (!cg.urinaire) ess.push(mol('ciprofloxacine', 'Allergie', 'Alternative aux bêta-lactamines en cas d\'allergie.'));
        ess.push(mol('aztreonam', 'Allergie', 'Alternative aux bêta-lactamines si l\'allergie ne concerne ni la ceftazidime ni une réaction retardée sévère.'));
      }
      break;
    }
    case 'enterobacterale_groupe3': {
      message = 'Espèce à céphalosporinase chromosomique inductible (groupe 3 du CA-SFM) : la monothérapie par C3G ou pipéracilline-tazobactam est déconseillée même si la souche est rendue sensible ; ces résultats ne sont donc pas demandés.';
      ess.push(mol('cefepime', 'Choix du traitement', 'Céfépime : traitement de référence des entérobactéries du groupe 3 (CA-SFM 2026, SPILF 2023). Une BLSE le rendrait R.', { sources: [CASFM('ch. 5.1 (groupe 3)', 'privilégier l\'utilisation des céphalosporines de 4e génération (céfépime)')] }));
      if (nonS(s('cefepime'))) ess.push(mol('meropeneme', 'Choix du traitement', 'Si le céfépime n\'est pas utilisable : carbapénème, sur avis.'));
      if ([s('ertapeneme'), s('meropeneme'), s('imipeneme')].some(nonS) || ph('carbapenemase') === 'present') ess.push(pheno('carbapenemase'));
      if (cg.urinaire) {
        ess.push(mol('cotrimoxazole', 'Relais oral (foyer urinaire)', 'Relais oral sur souche sensible.'));
        ess.push(mol('ciprofloxacine', 'Relais oral (foyer urinaire)', 'Relais oral sur souche sensible.'));
      }
      break;
    }
    case 'pseudomonas': {
      message = 'P. aeruginosa : les bêta-lactamines et la ciprofloxacine ne s\'y utilisent qu\'à forte posologie (SPILF/SFPT/CA-SFM) ; un résultat « I » est donc attendu et impose la forte posologie.';
      ess.push(mol('piperacilline_tazobactam', 'Choix du traitement', '1re option si utilisable, toujours à forte posologie.', { sources: [S('SPILF-SFPT-CASFM-2026-posologies', 'Annexe 9', 'Pseudomonas spp. […] forte posologie uniquement', 'posologie')] }));
      ess.push(mol('cefepime', 'Choix du traitement', 'Alternative à forte posologie, avec suivi pharmacologique.'));
      if (cg.urinaire) ess.push(mol('ciprofloxacine', 'Relais oral (foyer urinaire)', 'Relais oral possible, uniquement à forte posologie.'));
      if ([s('meropeneme'), s('imipeneme')].some((c) => c === 'R') || ph('carbapenemase') === 'present') ess.push(pheno('carbapenemase'));
      break;
    }
    case 's_aureus':
    case 's_lugdunensis':
    case 'scn': {
      if (cg.famille === 'scn' && cg.scnSignificatif === 'non') {
        return {
          famille: cg.famille,
          essentielles: [],
          complementaires: [pheno('SARM', 'Autres résultats'), ...autresMolecules(STAPH_TOUTES)],
          message: 'Une seule série positive : l\'antibiogramme ne change pas la conduite tant que la signification n\'est pas établie (refaire les hémocultures). Il reste saisissable ci-dessous.',
        };
      }
      ess.push(pheno('SARM'));
      if (ph('SARM') === 'non_rapporte')
        ess.push(mol('cefoxitine', 'Mécanisme rapporté', 'La céfoxitine est le test de dépistage de la résistance à la méticilline : R = résistant à la méticilline, S = sensible (CA-SFM 2026).', { libelle: 'Céfoxitine (dépistage de la résistance à la méticilline)', compteRendu: '« Céfoxitine » ou « Céfoxitine (dépistage) » ; parfois « Oxacilline »', aide: 'Ne répondez S ou R que si le résultat figure sur le compte rendu.', sources: [CASFM('ch. 5.7 Staphylococcus', 'Le disque de céfoxitine permet un dépistage fiable de la résistance à la méticilline pour toutes les espèces')] }));
      const sarm = ph('SARM') === 'present' || s('cefoxitine') === 'R' || s('oxacilline') === 'R';
      if (sarm || cg.allergieBetaLactamines) {
        ess.push(mol('vancomycine', sarm ? 'Choix du traitement' : 'Allergie', 'Traitement de référence si résistance à la méticilline ou allergie aux bêta-lactamines.', cg.famille === 's_aureus' && cg.bacteriemie ? { cmi: 'Infection sévère à S. aureus traitée par vancomycine : la CMI doit être déterminée ; à 2 mg/L, la réponse clinique peut être altérée (EUCAST).', sources: [S('EUCAST-detection-v2.01', 'p. 33', 'The MIC should always be determined', 'definition')] } : {}));
        ess.push(mol('daptomycine', sarm ? 'Choix du traitement' : 'Allergie', 'Alternative à la vancomycine.'));
      }
      if (cg.endocardite && cg.protheseValvulaireOuIntracardiaque) {
        ess.push(mol('rifampicine', 'Matériel / endocardite', 'Endocardite sur prothèse à staphylocoque : la rifampicine fait partie du schéma (ESC 2023, SPILF/AEPEI 2025).'));
        ess.push(mol('gentamicine', 'Matériel / endocardite', 'Endocardite sur prothèse à staphylocoque : la gentamicine fait partie du schéma initial.'));
      }
      break;
    }
    case 'strepto_abcg': {
      ess.push(mol('penicilline_g', 'Choix du traitement', 'La sensibilité à l\'amoxicilline se déduit de celle de la pénicilline G pour les streptocoques A, B, C et G (CA-SFM 2026) ; une résistance est exceptionnelle.', { compteRendu: '« Pénicilline G » ou « Benzylpénicilline »', sources: [CASFM('ch. 5.10', 'La sensibilité à l\'amoxicilline et à la pipéracilline des streptocoques des groupes A, B, C ou G se déduit de la sensibilité à la pénicilline G.')] }));
      break;
    }
    case 'strepto_oral':
    case 'strepto_pneumoniae': {
      const srcEI = [S('SPILF-AEPEI-2025-endocardite', 'diapo 8-9', 'choix guidé par la CMI d\'amoxicilline (≤ 0,5 ; 0,5-2 ; > 2 mg/L) et de C3G', 'choix')];
      ess.push(mol('amoxicilline', 'Choix du traitement', 'Traitement de référence si sensible. Pour ces streptocoques, la déduction depuis la pénicilline G n\'est pas appliquée par l\'application.', cg.endocardite ? { cmi: 'Endocardite : le schéma dépend de la CMI d\'amoxicilline (≤ 0,5 ; 0,5 à 2 ; > 2 mg/L, SPILF/AEPEI 2025).', sources: srcEI } : {}));
      if (cg.endocardite) ess.push(mol('ceftriaxone', 'Matériel / endocardite', 'Endocardite : la CMI de la C3G (≤ 0,5 mg/L) conditionne l\'alternative par ceftriaxone (SPILF/AEPEI 2025).', { cmi: 'Saisissez la CMI en mg/L si elle est rendue.', sources: srcEI }));
      break;
    }
    case 'enterocoque': {
      ess.push(mol('amoxicilline', 'Choix du traitement', 'Amoxicilline si sensible ; une résistance s\'étend à la pipéracilline et aux carbapénèmes (CA-SFM 2026).', { sources: [CASFM('ch. 5.8 Enterococcus', 'Les souches d\'entérocoques "résistantes" aux aminopénicillines doivent également être catégorisées "résistantes" aux uréidopénicillines et aux carbapénèmes.')] }));
      const amoxR = s('amoxicilline') === 'R';
      if (amoxR || cg.organisme === 'enterococcus_faecium' || cg.allergieBetaLactamines) ess.push(mol('vancomycine', !amoxR && cg.allergieBetaLactamines ? 'Allergie' : 'Choix du traitement', 'Vancomycine si résistance à l\'amoxicilline ou allergie.'));
      if (s('vancomycine') === 'R' || ph('ERV') === 'present') ess.push(pheno('ERV'));
      if (cg.endocardite && (cg.organisme === 'enterococcus_faecium' || amoxR)) ess.push(pheno('hnr_gentamicine', 'Matériel / endocardite'));
      break;
    }
  }
  const essentielles = dedoublonner(ess);
  const dejaPosees = new Set(essentielles.map((q) => q.id));
  const complementaires = complements(cg.famille).filter((q) => !dejaPosees.has(q.id));
  return { famille: cg.famille, essentielles, complementaires, message };
}

function dedoublonner(qs: QuestionMicro[]): QuestionMicro[] {
  const vus = new Set<string>();
  return qs.filter((q) => (vus.has(q.id) ? false : (vus.add(q.id), true)));
}

const BGN_TOUTES = ['amoxicilline', 'amoxicilline_clavulanate', 'piperacilline_tazobactam', 'temocilline', 'cefoxitine', 'cefotaxime', 'ceftriaxone', 'cefepime', 'cefixime', 'aztreonam', 'ertapeneme', 'imipeneme', 'meropeneme', 'amikacine', 'gentamicine', 'ciprofloxacine', 'levofloxacine', 'cotrimoxazole'];
const STAPH_TOUTES = ['oxacilline', 'cefoxitine', 'cefazoline', 'vancomycine', 'daptomycine', 'rifampicine', 'gentamicine', 'levofloxacine', 'cotrimoxazole'];
const STREPTO_TOUTES = ['penicilline_g', 'amoxicilline', 'ceftriaxone', 'cefotaxime', 'vancomycine', 'levofloxacine'];
const ENTERO_TOUTES = ['amoxicilline', 'piperacilline_tazobactam', 'imipeneme', 'vancomycine', 'daptomycine', 'ceftriaxone'];

function autresMolecules(dcis: string[]): QuestionMicro[] {
  return [...new Set(dcis)].map((d) => mol(d, 'Autres résultats', 'Résultat complémentaire : il est enregistré et pris en compte s\'il modifie la lecture (incohérence, résistance attendue).'));
}

function complements(f: FamilleGerme): QuestionMicro[] {
  switch (f) {
    case 'enterobacterale':
    case 'enterobacterale_groupe3':
      return [...autresMolecules(BGN_TOUTES), pheno('BLSE', 'Autres résultats'), pheno('ampc', 'Autres résultats'), pheno('carbapenemase', 'Autres résultats')];
    case 'pseudomonas':
      return [...autresMolecules(['piperacilline_tazobactam', 'cefepime', 'meropeneme', 'imipeneme', 'aztreonam', 'amikacine', 'ciprofloxacine', 'levofloxacine']), pheno('carbapenemase', 'Autres résultats')];
    case 's_aureus':
    case 's_lugdunensis':
    case 'scn':
      return [pheno('SARM', 'Autres résultats'), ...autresMolecules(STAPH_TOUTES)];
    case 'strepto_abcg':
    case 'strepto_oral':
    case 'strepto_pneumoniae':
      return autresMolecules(STREPTO_TOUTES);
    case 'enterocoque':
      return [...autresMolecules(ENTERO_TOUTES), pheno('ERV', 'Autres résultats'), pheno('hnr_gentamicine', 'Autres résultats')];
    default:
      return [];
  }
}
