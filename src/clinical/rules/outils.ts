/**
 * Outils communs aux règles : construction des contributions, classification des germes,
 * lecture de l'antibiogramme (avec lecture interprétative CA-SFM), statut minimal.
 */
import type { ContexteDecision } from '../../engine/contexte';
import type { Contribution } from '../../engine/decider';
import type {
  Alerte,
  CategorieSIR,
  DonneesIsolat,
  EtatPhenotype,
  PhenotypeId,
  Couverture,
  DonneeManquante,
  LigneControle,
  OptionTherapeutique,
  OrganismeId,
  Prelevement,
  SourceRef,
  StatutValidation,
} from '../types';
import { calculerPrescription, type DureeDecidee } from '../../engine/posologie';
import { regimen } from '../molecules';
import { familleDe } from '../microbiologie/germes';
import { resistanceAttendue } from '../microbiologie/analyse';

export { S } from '../molecules/base';
export type { DureeDecidee };

const ORDRE_STATUT: StatutValidation[] = ['retiree', 'brouillon', 'verifiee_ia', 'validee_humain', 'publiee'];
export function statutMin(...s: StatutValidation[]): StatutValidation {
  return s.reduce((a, b) => (ORDRE_STATUT.indexOf(a) <= ORDRE_STATUT.indexOf(b) ? a : b));
}

export interface ItemPrescription {
  m: string;
  r: string;
}

/** Accumulateur d'une contribution de règle. */
export class Fiche {
  readonly c: Required<Omit<Contribution, 'situation' | 'urgence' | 'couvertureMax' | 'indication'>> & Pick<Contribution, 'situation' | 'urgence' | 'couvertureMax' | 'indication'> = {
    alertes: [],
    options: [],
    controles: [],
    gestes: [],
    reevaluation: [],
    avisSpecialise: [],
    donneesManquantes: [],
  };
  constructor(
    public readonly ctx: ContexteDecision,
    public readonly statutRegle: StatutValidation,
  ) {}

  situation(id: string, libelle: string, couverture: Couverture, description: string) {
    this.c.situation = { id, libelle, couverture, description };
    return this;
  }
  urgence(n: 'immediate' | 'elevee' | 'standard') {
    this.c.urgence = n;
    return this;
  }
  plafond(c: Couverture) {
    this.c.couvertureMax = c;
    return this;
  }
  alerte(niveau: Alerte['niveau'], texte: string, sources?: SourceRef[]) {
    this.c.alertes.push({ niveau, texte, sources });
    return this;
  }
  manque(champ: string, pourquoi: string, impact: DonneeManquante['impact'] = 'bloque_decision') {
    this.c.donneesManquantes.push({ champ, pourquoi, impact });
    return this;
  }
  avis(texte: string, urgent: boolean, sources: SourceRef[]) {
    this.c.avisSpecialise.push({ texte, urgent, sources });
    return this;
  }
  geste(texte: string, sources: SourceRef[]) {
    this.c.gestes.push({ texte, sources });
    return this;
  }
  reeval(texte: string, sources: SourceRef[], offsetHeures?: number) {
    this.c.reevaluation.push({ texte, sources, offsetHeures });
    return this;
  }
  controle(l: Omit<LigneControle, 'statut'> & { statut?: StatutValidation }) {
    this.c.controles.push({ ...l, statut: l.statut ?? this.statutRegle });
    return this;
  }
  option(o: {
    id: string;
    libelle: string;
    type: OptionTherapeutique['type'];
    rang: OptionTherapeutique['rang'];
    condition?: string;
    commentaire?: string;
    sources: SourceRef[];
    items: ItemPrescription[];
    duree: DureeDecidee;
    statut?: StatutValidation;
  }) {
    const ids = o.items.map((i) => i.m);
    const prescriptions = o.items.map((i) => {
      const { molecule, regimen: r } = regimen(i.m, i.r);
      const res = calculerPrescription({ molecule, regimen: r, ctx: this.ctx, duree: o.duree, coPrescriptions: ids.filter((x) => x !== i.m) });
      // Les données manquantes d'une option conditionnelle n'en bloquent pas d'autres : on les conserve mais en « affine ».
      for (const dm of res.donneesManquantes) this.c.donneesManquantes.push(o.rang === 'premiere_ligne' ? dm : { ...dm, impact: dm.impact === 'bloque_decision' || dm.impact === 'bloque_dose' ? dm.impact : 'affine' });
      return res.prescription;
    });
    const statut = statutMin(o.statut ?? this.statutRegle, ...prescriptions.map((p) => p.statut));
    this.c.options.push({
      id: o.id,
      libelle: o.libelle,
      type: o.type,
      rang: o.rang,
      condition: o.condition,
      commentaire: o.commentaire,
      prescriptions,
      sources: o.sources,
      statut,
    });
    return this;
  }
  fin(): Contribution {
    return this.c;
  }
}

/* ------------------------------------------------------------------ */
/* Germes                                                              */
/* ------------------------------------------------------------------ */

export type GroupeGerme = 'bgn' | 's_aureus' | 'scn' | 's_lugdunensis' | 'strepto' | 'entero' | 'cgp_amas' | 'cgp_chainettes' | 'autre' | 'aucun';

const BGN: OrganismeId[] = ['bgn_non_identifie', 'enterobacterie_non_identifiee', 'escherichia_coli', 'klebsiella_pneumoniae', 'enterobacter_cloacae', 'proteus_mirabilis', 'pseudomonas_aeruginosa'];
const STREPTO: OrganismeId[] = ['streptococcus_pneumoniae', 'streptococcus_pyogenes', 'streptococcus_agalactiae', 'streptocoque_groupe_c_g', 'streptocoque_viridans', 'streptococcus_gallolyticus'];
const ENTERO: OrganismeId[] = ['enterococcus_faecalis', 'enterococcus_faecium', 'enterocoque_non_identifie'];

export function groupe(p: Prelevement | undefined): GroupeGerme {
  if (!p) return 'aucun';
  const o = p.organisme;
  if (p.stade === 'examen_direct' || !o) {
    if (p.examenDirect === 'bgn') return 'bgn';
    if (p.examenDirect === 'cgp_amas') return 'cgp_amas';
    if (p.examenDirect === 'cgp_chainettes') return 'cgp_chainettes';
    return p.stade === 'examen_direct' || !o ? (p.examenDirect === 'autre' ? 'autre' : 'aucun') : 'aucun';
  }
  if (BGN.includes(o)) return 'bgn';
  if (o === 'staphylococcus_aureus') return 's_aureus';
  if (o === 'staphylococcus_lugdunensis') return 's_lugdunensis';
  if (o === 'staphylocoque_coagulase_negative' || o === 'staphylococcus_epidermidis') return 'scn';
  if (o === 'cgp_non_identifie') return 'cgp_amas';
  if (STREPTO.includes(o)) return 'strepto';
  if (ENTERO.includes(o)) return 'entero';
  return 'autre';
}

export function germePrincipal(ctx: ContexteDecision): { prl?: Prelevement; g: GroupeGerme } {
  const prl = ctx.hemocultures.find((h) => groupe(h) !== 'aucun') ?? ctx.hemocultures[0] ?? ctx.dossier.prelevements.find((p) => groupe(p) !== 'aucun');
  return { prl, g: groupe(prl) };
}

export function adulte(ctx: ContexteDecision): boolean {
  return ctx.dossier.patient.age === undefined || ctx.dossier.patient.age >= 18;
}

export function bacteriemie(ctx: ContexteDecision): boolean {
  return ctx.hemocultures.length > 0;
}

/* ------------------------------------------------------------------ */
/* Antibiogramme : lecture brute puis lecture interprétative CA-SFM    */
/* ------------------------------------------------------------------ */

export interface LectureAtb {
  /** Catégorie après lecture interprétative ; undefined = inconnu (non testé, en attente, non renseigné). */
  sir: (dci: string) => CategorieSIR | undefined;
  notes: { texte: string; sources: SourceRef[] }[];
  /** Vrai seulement si le laboratoire a rapporté le mécanisme (« présent »). */
  meca: (m: PhenotypeId) => boolean;
  etat: (m: PhenotypeId) => EtatPhenotype;
}

const C3G = ['cefotaxime', 'ceftriaxone', 'ceftazidime', 'cefepime', 'cefixime', 'aztreonam'];

export function lireAntibiogramme(p: DonneesIsolat | undefined): LectureAtb {
  const brut = new Map<string, CategorieSIR>();
  // « NT » (non testé / en attente) n'est jamais interprété : la molécule reste inconnue.
  for (const r of p?.antibiogramme ?? []) if (r.categorie !== 'NT') brut.set(r.dci, r.categorie);
  const etats = p?.phenotypes ?? {};
  const mecas = new Set((Object.keys(etats) as PhenotypeId[]).filter((k) => etats[k] === 'present'));
  const forces = new Map<string, CategorieSIR>();
  const notes: LectureAtb['notes'] = [];
  const casfm = (repere: string, extrait: string): SourceRef[] => [{ source: 'CASFM-2026-V1.0', repere, extrait, justifie: 'definition' }];
  if (mecas.has('BLSE')) {
    for (const d of C3G) if (brut.get(d) && brut.get(d) !== 'R') forces.set(d, 'R');
    notes.push({ texte: 'BLSE : tout résultat S ou I aux C3G/C4G et à l\'aztréonam est interprété R (lecture interprétative CA-SFM 2026).', sources: casfm('ch. 5.1 Enterobacterales', 'pour les souches productrices de BLSE, il est recommandé d\'interpréter "résistant" tout résultat "sensible" ou "sensible à forte posologie" aux C3G, aux C4G ou à l\'aztréonam') });
  }
  if (mecas.has('ampc')) {
    for (const d of ['cefotaxime', 'ceftriaxone', 'ceftazidime', 'aztreonam', 'piperacilline_tazobactam']) if (brut.get(d) && brut.get(d) !== 'R') forces.set(d, 'R');
    notes.push({ texte: 'Céphalosporinase hyperproduite : C3G, aztréonam et pipéracilline(-tazobactam) interprétés R (CA-SFM 2026) ; céfépime privilégié.', sources: casfm('ch. 5.1 Enterobacterales', 'interpréter "résistant" tout résultat "sensible" ou "sensible à forte posologie" aux C3G, à l\'aztréonam, à la pipéracilline ou à la pipéracilline-tazobactam') });
  }
  if (mecas.has('carbapenemase')) {
    for (const d of ['ertapeneme', 'imipeneme', 'meropeneme']) if (brut.get(d) && brut.get(d) !== 'R') forces.set(d, 'R');
    notes.push({ texte: 'Carbapénémase : carbapénèmes interprétés R (changement CA-SFM 2026).', sources: casfm('avant-propos p. 5', 'interpréter comme "résistants" les carbapénèmes qui peuvent apparaître "sensibles" ou "sensibles à forte posologie"') });
  }
  if (mecas.has('SARM')) {
    for (const d of ['oxacilline', 'cefazoline', 'amoxicilline_clavulanate', 'piperacilline_tazobactam', 'cefotaxime', 'ceftriaxone', 'meropeneme', 'imipeneme']) forces.set(d, 'R');
    notes.push({ texte: 'SARM : résistance à toutes les bêta-lactamines sauf ceftaroline et ceftobiprole (CA-SFM 2026).', sources: casfm('ch. 5.7 Staphylococcus', 'doivent être rendues résistantes à toutes les β-lactamines, y compris les carbapénèmes, à l\'exception de la ceftaroline et du ceftobiprole') });
  }
  // Règle 8 des règles expertes EUCAST : propre aux Enterobacterales, non généralisée aux autres germes.
  const fam = familleDe(p?.organisme);
  const ciproR = brut.get('ciprofloxacine') === 'R';
  if (ciproR && (fam === 'enterobacterale' || fam === 'enterobacterale_groupe3')) {
    forces.set('levofloxacine', 'R');
    notes.push({ texte: 'Résistance à la ciprofloxacine : toutes les fluoroquinolones sont rendues R (EUCAST expert rule 8).', sources: [{ source: 'EUCAST-expert-rules-v3.3-enterobacterales', repere: 'règle 8', extrait: 'IF resistant to ciprofloxacin, THEN report as resistant to all fluoroquinolones', justifie: 'definition' }] });
  }
  // Résistances attendues (ex-« naturelles ») : un résultat S/I est lu R (EUCAST : « report as resistant »).
  for (const [dci, cat] of brut) {
    if (cat === 'R') continue;
    const a = resistanceAttendue(p?.organisme, dci);
    if (a) {
      forces.set(dci, 'R');
      notes.push({ texte: `${dci.replace(/_/g, ' ')} rendu ${cat} malgré une résistance attendue pour ce germe : lu R ; vérifier avec le laboratoire.`, sources: a.sources });
    }
  }
  // Entérocoques : une résistance aux aminopénicillines s'étend aux uréidopénicillines et aux carbapénèmes (CA-SFM 2026 ch. 5.8).
  if (p?.organisme && ['enterococcus_faecalis', 'enterococcus_faecium', 'enterocoque_non_identifie'].includes(p.organisme) && brut.get('amoxicilline') === 'R') {
    for (const d of ['piperacilline_tazobactam', 'imipeneme', 'meropeneme', 'ertapeneme']) if (brut.get(d) && brut.get(d) !== 'R') forces.set(d, 'R');
  }
  if ([...brut.values()].includes('I')) {
    notes.push({
      texte: 'Catégorie I = « sensible à forte posologie » (EUCAST : susceptible, increased exposure) : une molécule rendue I reste utilisable à la forte posologie ; elle ne doit pas être assimilée à R.',
      sources: [
        { source: 'EUCAST-definitions-SIR', repere: 'New definitions of S, I and R', extrait: 'The tradition to lump I and R together as \'non-susceptible\' is not valid.', justifie: 'definition' },
        { source: 'CASFM-2026-V1.0', repere: 'ch. 3, p. 41', extrait: '"Sensible à forte posologie" : la probabilité de succès thérapeutique est élevée dès lors que l\'antibiotique est utilisé à forte posologie', justifie: 'definition' },
      ],
    });
  }
  return {
    sir: (d) => forces.get(d) ?? brut.get(d),
    notes,
    meca: (m) => mecas.has(m),
    etat: (m) => etats[m] ?? 'non_rapporte',
  };
}

/**
 * Statut vis-à-vis de la méticilline : statut rapporté par le laboratoire, sinon dépistage céfoxitine/oxacilline.
 * Deux informations contradictoires donnent « inconnu » (à vérifier), jamais un choix arbitraire.
 */
export function statutMeticilline(atb: LectureAtb): 'R' | 'S' | undefined {
  const ph = atb.etat('SARM');
  const test = atb.sir('oxacilline') ?? atb.sir('cefoxitine');
  const t = test === 'R' ? 'R' : test === 'S' || test === 'I' ? 'S' : undefined;
  const p = ph === 'present' ? 'R' : ph === 'absent' ? 'S' : undefined;
  if (p && t && p !== t) return undefined;
  return p ?? t;
}

export function utilisable(c: CategorieSIR | undefined): boolean {
  return c === 'S' || c === 'I';
}
