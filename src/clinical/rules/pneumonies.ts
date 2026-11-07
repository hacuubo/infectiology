/**
 * Pneumonies de l'adulte : pneumonie aiguë communautaire (ambulatoire, hospitalisée non grave, grave), légionellose,
 * bactéries atypiques, contexte grippal, pneumonie d'inhalation, S. aureus producteur de LPV ; pneumonies associées
 * aux soins de réanimation (PAVM) ; pneumonie nosocomiale hors réanimation (absence de texte français expliquée).
 * Sources : SPILF/SPLF 2025 (article et diaporama), HAS 2025 (PAC ambulatoire), HAS 2023 (M. pneumoniae),
 * SPILF/SFGG 2025 (inhalation, diaporama), SPILF 2026 (légionellose, diaporama), Afssaps 2010 (orientation),
 * RFE SFAR/SRLF 2017, ERS/ESICM 2017 et 2023, IDSA/ATS 2016, ATS/IDSA 2019, SCCM 2024 ; RCP et CRAT —
 * docs/sources/recherche-pneumonies.md. Corrections de la relecture v7 : docs/relectures/v7-pneumonies.md.
 */
import type { Regle } from '../../engine/decider';
import { familleDeclaree, moleculeEvitee, type ContexteDecision } from '../../engine/contexte';
import type { OptionTherapeutique, Prelevement, SourceRef, StatutValidation } from '../types';
import { reponseDetail } from '../syndromes/questions';
import { comorbiditeDeduite, dfgInferieur30 } from '../syndromes/pneumonies';
import { resistanceAttendue } from '../microbiologie/analyse';
import { libelleGerme } from '../microbiologie/germes';
import { SRC_AZI_RESISTANCE, TEXTE_AZI_RESISTANCE } from '../molecules/pneumonies';
import { Fiche, S, adulte, groupe, lireAntibiogramme, statutMeticilline, type DureeDecidee, type GroupeGerme, type ItemPrescription } from './outils';

const SP = 'SPILF-SPLF-2025-PAC';
const SPD = 'SPILF-2025-PAC-diapo';
const AF = 'AFSSAPS-2010-IRB';
const HAS = 'HAS-2025-PAC-adulte-ambulatoire';
const MYCO = 'HAS-2023-mycoplasma';
const INH = 'SPILF-SFGG-2025-inhalation-diapo';
const LEG = 'SPILF-2026-legionellose-diapo';
const SFAR = 'SFAR-SRLF-2017-PAS-rea';
const ERS23 = 'ERS-ESICM-ESCMID-ALAT-2023-PACgrave';
const ERS17 = 'ERS-ESICM-ESCMID-ALAT-2017-HAP-VAP';
const IDSA16 = 'IDSA-ATS-2016-HAP-VAP';
const ATS19 = 'ATS-IDSA-2019-PAC';
const SCCM = 'SCCM-2024-corticoides';

const I = {
  AMOX: { m: 'amoxicilline', r: 'amoxicilline-pac-1g8h' },
  AMOX_SC: { m: 'amoxicilline', r: 'amoxicilline-pac-soins-critiques' },
  AMC: { m: 'amoxicilline_clavulanate', r: 'amoxclav-pac-1g8h' },
  AMC_SC: { m: 'amoxicilline_clavulanate', r: 'amoxclav-pac-soins-critiques' },
  AMC_IV: { m: 'amoxicilline_clavulanate', r: 'amoxclav-iv-1g8h' },
  CRO1: { m: 'ceftriaxone', r: 'ceftriaxone-pac-1g' },
  CRO2: { m: 'ceftriaxone', r: 'ceftriaxone-pac-2g' },
  CTX_SC: { m: 'cefotaxime', r: 'cefotaxime-pac-soins-critiques' },
  CTX_STD: { m: 'cefotaxime', r: 'cefotaxime-std' },
  LEVO: { m: 'levofloxacine', r: 'levo-pac-500' },
  LEVO_SC: { m: 'levofloxacine', r: 'levo-pac-soins-critiques' },
  LEVO_PAVM: { m: 'levofloxacine', r: 'levo-iv-500x2' },
  CLARI: { m: 'clarithromycine', r: 'clarithromycine-po-500x2' },
  CLARI_IV: { m: 'clarithromycine', r: 'clarithromycine-iv-500x2' },
  SPIRA: { m: 'spiramycine', r: 'spiramycine-po-3mui-x3' },
  SPIRA_IV: { m: 'spiramycine', r: 'spiramycine-iv-1-5mui-x3' },
  SPIRA_IV3: { m: 'spiramycine', r: 'spiramycine-iv-3mui-x3' },
  AZI: { m: 'azithromycine', r: 'azithromycine-po-500-250' },
  AZI500: { m: 'azithromycine', r: 'azithromycine-po-500' },
  LZD: { m: 'linezolide', r: 'linezolide-600x2' },
  FEP: { m: 'cefepime', r: 'cefepime-2g8h' },
  TZP: { m: 'piperacilline_tazobactam', r: 'piptazo-4g8h' },
  TZP_FORT: { m: 'piperacilline_tazobactam', r: 'piptazo-4g6h-prolongee' },
  TZP_INH: { m: 'piperacilline_tazobactam', r: 'piptazo-inhalation' },
  SXT_INH: { m: 'cotrimoxazole', r: 'smx-tmp-inhalation' },
  GENTA_PAVM: { m: 'gentamicine', r: 'gentamicine-pavm' },
  AMK: { m: 'amikacine', r: 'amikacine-30-du' },
  CIP: { m: 'ciprofloxacine', r: 'cipro-iv-400x3' },
  MEM: { m: 'meropeneme', r: 'meropeneme-1g8h' },
  IPM: { m: 'imipeneme', r: 'imipeneme-1g8h' },
  VAN_PAVM: { m: 'vancomycine', r: 'vancomycine-pavm' },
} satisfies Record<string, ItemPrescription>;

type OptionFiche = Parameters<Fiche['option']>[0];
type Gravite = boolean | 'inconnu';
const JOUR_MS = 24 * 3600 * 1000;

/**
 * Fiche du foyer pulmonaire.
 * - Bactériémie à S. aureus, streptocoque ou entérocoque identifiés : la règle du germe donne la situation et les
 *   options ; la pneumonie garde ses gestes, contrôles, alertes et avis, et seulement ce qui lui est propre
 *   (`optionPropre`, ex. linézolide d'une PAC grave à S. aureus producteur de LPV). Ses données manquantes, qui ne
 *   changent plus la proposition, ne sont pas émises.
 * - BGN dans les hémocultures : la règle reste pleinement active ; une option dont aucune molécule n'est active sur
 *   le BGN isolé (résistance attendue ou R à l'antibiogramme) est écartée avec sa raison.
 * - Condition imposée (donnée bloquante non renseignée, ex. gravité) : les options deviennent conditionnelles.
 */
class FichePneumonie extends Fiche {
  sansProposition = false;
  bgn?: Prelevement;
  /** Fluoroquinolone reçue dans les 3 derniers mois (HAS 2025). */
  fq: 'oui' | 'date_inconnue' | 'non' = 'non';
  ambulatoire = false;
  private conditionImposee?: string;
  private situationFixee = false;
  private alerteLzdChoc = false;

  /** Situation qui l'emporte sur celles des parcours appelés ensuite (ex. gravité à préciser). */
  fixerSituation(...args: Parameters<Fiche['situation']>) {
    if (!this.sansProposition) super.situation(...args);
    this.situationFixee = true;
    return this;
  }
  override situation(...args: Parameters<Fiche['situation']>) {
    return this.sansProposition || this.situationFixee ? this : super.situation(...args);
  }
  override manque(...args: Parameters<Fiche['manque']>) {
    return this.sansProposition ? this : super.manque(...args);
  }
  override absence(...args: Parameters<Fiche['absence']>) {
    return this.sansProposition ? this : super.absence(...args);
  }
  /** Exécute `fn` avec une condition imposée à toutes ses options (cumulée avec une condition déjà imposée). */
  sous(condition: string | undefined, fn: () => void) {
    const avant = this.conditionImposee;
    if (condition) this.conditionImposee = avant ? `${avant} ; ${condition}` : condition;
    try {
      fn();
    } finally {
      this.conditionImposee = avant;
    }
  }
  override option(o: OptionFiche): boolean {
    return this.sansProposition ? false : this.optionPropre(o);
  }
  /** Option propre au foyer : proposée même pendant une bactériémie dont la règle du germe donne les options. */
  optionPropre(o: OptionFiche): boolean {
    const ctx = this.ctx;
    let opt: OptionFiche = o;
    const levo = o.items.some((i) => i.m === 'levofloxacine');
    if (levo && this.fq === 'oui' && this.ambulatoire) {
      this.ecarter(o.libelle, 'contre_indication', 'fluoroquinolone reçue dans les 3 derniers mois : « Les fluoroquinolones ne doivent pas être prescrites » dans ce cas (HAS 2025, PAC ambulatoire)', [SRC.fqHas]);
      return false;
    }
    if (levo && this.fq !== 'non') {
      const c = this.fq === 'oui' ? 'fluoroquinolone reçue dans les 3 derniers mois : déconseillée par la HAS (PAC ambulatoire), seulement après avis' : 'seulement si aucune fluoroquinolone n\'a été reçue dans les 3 derniers mois (date de la fluoroquinolone déclarée inconnue)';
      opt = { ...opt, rang: 'conditionnelle', condition: opt.condition ? `${c} ; ${opt.condition}` : c };
    }
    if (this.conditionImposee) opt = { ...opt, rang: 'conditionnelle', condition: opt.condition ? `${this.conditionImposee} ; ${opt.condition}` : this.conditionImposee };
    if (this.bgn?.organisme) {
      const atb = lireAntibiogramme(this.bgn);
      const inactive = (m: string) => resistanceAttendue(this.bgn!.organisme, m) !== undefined || atb.sir(m) === 'R';
      if (o.items.every((i) => inactive(i.m))) {
        this.ecarter(o.libelle, 'resistance', `${libelleGerme(this.bgn.organisme)} dans les hémocultures : aucune molécule de l'option n'est active (résistance attendue ou R à l'antibiogramme)`);
        return false;
      }
    }
    if (o.items.some((i) => i.m === 'linezolide') && ctx.dossier.patient.gravite === 'choc_septique' && !this.alerteLzdChoc) {
      this.alerteLzdChoc = true;
      this.alerte('attention', 'Linézolide et choc septique : association aux vasopresseurs (adrénaline, noradrénaline), à la dopamine ou à la dobutamine contre-indiquée sauf surveillance étroite de la pression artérielle (RCP §4.3).', [S('RCP-linezolide', '§4.3', 'les vasopresseurs (par exemple : l\'adrénaline, la noradrénaline)', 'surveillance'), S('RCP-linezolide', '§4.3', 'la dopamine, la dobutamine', 'surveillance')]);
    }
    const n = this.c.donneesManquantes.length;
    const ok = super.option(opt);
    // Surveillance conditionnée à une durée que les sources ne fixent pas : libellé explicite, sans rien à compléter.
    if (o.duree.dureePrevueJours === undefined)
      for (let i = n; i < this.c.donneesManquantes.length; i++) {
        const dm = this.c.donneesManquantes[i];
        if (/^si traitement >/.test(dm.champ))
          this.c.donneesManquantes[i] = { ...dm, champ: 'durée totale du traitement (non fixée par les sources : décidée à la réévaluation)', pourquoi: `${dm.pourquoi} (${dm.champ})`, impact: 'affine' };
      }
    return ok;
  }
}

const r = (ctx: ContexteDecision, id: string) => reponseDetail(ctx.dossier, id);
const jours = (n: number, sources: SourceRef[], texte?: string): DureeDecidee => ({ texte: texte ?? `${n} jours`, pointDeDepart: 'premier jour de traitement (durée totale)', dureePrevueJours: n, sources });
const cible = (id: string) => `details.pneumonie.${id}`;
const grossesse = (ctx: ContexteDecision) => ctx.dossier.patient.grossesse === 'oui';
const qtAssocie = (ctx: ContexteDecision) => ctx.dossier.patient.traitementsAssocies.includes('qt_allongeant');

/** Allergies utiles aux choix SPILF : pénicillines seules (allergie « non grave »), bêta-lactamines (C3G aussi évitées), macrolides. */
function allergies(ctx: ContexteDecision) {
  const ev = (id: string, fam: Parameters<typeof moleculeEvitee>[1]) => moleculeEvitee(id, fam, ctx.allergie).evitee;
  const peni = ev('amoxicilline', 'penicilline');
  const c3g = ev('ceftriaxone', 'cephalosporine');
  const macro = ['spiramycine', 'clarithromycine', 'azithromycine'].some((m) => ev(m, 'macrolide'));
  return { peni, c3g, ciBL: peni && c3g, penicillineSeule: peni && !c3g, macro };
}

/** Fluoroquinolone dans les 3 derniers mois (HAS 2025, note [2]) : en cours, ou terminée (à défaut commencée) depuis ≤ 90 jours. */
function fqRecente(ctx: ContexteDecision): 'oui' | 'date_inconnue' | 'non' {
  let res: 'oui' | 'date_inconnue' | 'non' = 'non';
  for (const a of ctx.dossier.patient.antibiotiquesRecents) {
    if (familleDeclaree(a.dci) !== 'fluoroquinolone') continue;
    if (a.enCours === 'oui') return 'oui';
    const date = a.fin ?? a.debut;
    const t = date ? new Date(date).getTime() : NaN;
    if (Number.isNaN(t)) res = 'date_inconnue';
    else if (ctx.maintenant.getTime() - t <= 90 * JOUR_MS) return 'oui';
  }
  return res;
}

/* ------------------------------------------------------------------ */
/* Extraits réutilisés                                                 */
/* ------------------------------------------------------------------ */

const SRC = {
  definition: S(AF, 'p. 2', 'dite communautaire si elle est acquise en milieu extra-hospitalier ou si, à l\'hôpital, elle survient avant la 48ème heure suivant l\'admission', 'definition'),
  orientation2010: S(SP, 'p. 3-4', 'il convient donc pour cela de se reporter aux recommandations de 2010', 'definition'),
  crb65: S(AF, 'tableau 1, p. 3', '0 critère : traitement ambulatoire possible', 'definition'),
  signesGravite2010: S(AF, 'figure 1, p. 2', 'PA systolique < 90 mmHg, fréquence cardiaque > 120 /min, fréquence respiratoire > 30 / min', 'definition'),
  graveDef: S(SP, 'tableau 1, p. 4', 'Définition d\'une pneumonie aiguë grave si présence d\'un critère majeur ou d\'au moins 3 critères mineurs (selon ATS/IDSA)', 'definition'),
  champ: S(SP, 'p. 3-4', 'Ce texte s\'applique également aux cas des pneumonies graves, sans toutefois proposer de recommandations sur la prise en charge spécifique en soins critiques', 'choix'),
  champ3j: S(SP, 'p. 8', 'PAC non graves (ambulatoires) et modérément graves (hospitalisation hors soins critiques)', 'duree'),
  d3: S(SP, 'p. 8', 'en cas d\'obtention de l\'ensemble des critères de stabilité clinique à J3, un traitement antibiotique de trois jours au total est recommandé (Grade A-1)', 'duree'),
  d5: S(SP, 'p. 8', 'Si la stabilité clinique n\'est obtenue qu\'entre trois et cinq jours de traitement, un traitement antibiotique de cinq jours au total est recommandé (Grade B-1)', 'duree'),
  d7: S(SP, 'p. 8', 'Dans les autres cas de PAC non compliquée, une antibiothérapie de sept jours au total est recommandée (Grade A-1)', 'duree'),
  dComplication: S(SP, 'p. 8', 'Un traitement de durée supérieure à sept jours doit être justifié par la présence d\'une complication telle qu\'un abcès pulmonaire ou un épanchement pleural liquidien significatif', 'duree'),
  dNote1: S(SP, 'p. 8, note 1', 'Pas de données chez les patients immunodéprimés, insuffisants respiratoires, hépatiques et rénaux, chroniques graves', 'duree'),
  dHas: S(HAS, 'durée', 'Possibilité d\'arrêt à 5 jours voire à 3 jours à condition que les critères de stabilité clinique soient obtenus et vérifiés par le médecin et qu\'une information soit délivrée au patient', 'duree'),
  dHasMax: S(HAS, 'durée', '7 jours maximum en cas de pneumonie aiguë communautaire non compliquée', 'duree'),
  levoNB: S(SP, 'tableau 5, NB', 'La lévofloxacine est indiquée uniquement si allergie grave aux bêtalactamines et pas d\'autre possibilité thérapeutique', 'choix'),
  fqHas: S(HAS, 'note [2]', 'Les fluoroquinolones ne doivent pas être prescrites si le patient a reçu une FQ dans les 3 derniers mois.', 'choix'),
  ansmFq: S('ANSM-2023-fluoroquinolones', 'rappel des restrictions', 'à moins que les autres antibiotiques habituellement recommandés pour ces infections ne soient jugés inappropriés', 'choix'),
  pcrVirale: S(SP, 'p. 12', 'réaliser une PCR virale quadriplex à la recherche des virus Influenza A/B, du VRS et du SARS-CoV-2, selon le contexte épidémique', 'controle_micro'),
  corticoNonGrave: S(SP, 'p. 9-10', 'Au cours des PAC non graves (ambulatoires ou hospitalisées), l\'adjonction de corticoïdes n\'est pas recommandée (Grade A-2)', 'geste'),
  documentation: S(SP, 'p. 8-9', 'Une bithérapie n\'est pas recommandée dans les PAC avec documentation bactériologique (y compris celles à L. pneumophila), à l\'exception des pneumonies graves à souche de SASM productrice de LPV', 'choix'),
  desescalade: S(SP, 'p. 8-9', 'La désescalade vers une monothérapie par bêtalactamine devra être rapidement envisagée en l\'absence d\'argument […] en faveur d\'une PAC à bactérie atypique (Grade B-1)', 'choix'),
  tab10Amox: S(SP, 'tableau 10, p. 8', 'Amoxicilline « 1 g x 3/j » / « 2 g x 3/j »', 'posologie'),
  piDefinition: S(INH, 'diapo 3', '+ Infiltrat(s) radiologique(s) nouveau(x)', 'definition'),
  sarmLpv: S(SP, 'p. 8-9', 'En cas de pneumonie grave à SARM producteur de LPV, une monothérapie par linézolide est recommandée', 'choix'),
  sasmLpv: S(SP, 'tableau 9, p. 7', 'Pénicilline M (IV) ou céfazoline + Clindamycine ou rifampicine', 'choix'),
  lzdAvis: S('RCP-linezolide', '§4.1', 'Un traitement par le linézolide devra être débuté uniquement en milieu hospitalier et après avis d\'un spécialiste tel qu\'un microbiologiste ou un infectiologue', 'choix'),
  spiraIvCi: S('RCP-spiramycine-IV', '§4.3', 'En association avec les médicaments donnant des torsades de pointes', 'surveillance'),
  ersAspiration: S(ERS23, 'Q8', 'we suggest standard CAP therapy regimen and not specific therapy targeting anaerobic bacteria', 'choix'),
  inhMecanisme: S(INH, 'diapo 10', 'En cas pneumonie grave dont le mécanisme est incertain : Appliquer les recommandations de la SPILF de 2025 sur la PAC grave.', 'choix'),
};

const TEXTE_LEVO = 'Fluoroquinolone : pas si une fluoroquinolone a été reçue dans les 3 derniers mois (HAS) ; restrictions d\'utilisation de l\'ANSM (2023).';
const TEXTE_PRISTINA = 'En cas d\'allergie, la SPILF 2025 recommande la pristinamycine : molécule non disponible dans cette version de la base (prescription hors application).';
const TEXTE_SPIRA_LEVO = 'Ne pas associer à la spiramycine IV : association contre-indiquée au §4.3 du RCP de la forme IV (citée en précaution d\'emploi au §4.5 du même RCP : incohérence interne, l\'application retient la contre-indication).';
const TEXTE_GROSSESSE_MACRO = 'Grossesse déclarée : spiramycine placée en tête par l\'application (utilisable quel que soit le terme selon le CRAT et le RCP) ; clarithromycine et azithromycine : divergence RCP/CRAT non tranchée (CRAT : possible quel que soit le terme ; RCP : à éviter sauf nécessité).';

/* ------------------------------------------------------------------ */
/* Règle                                                               */
/* ------------------------------------------------------------------ */

/** Hémoculture positive retenue pour le foyer (même ordre que les règles de bactériémie). */
function hemocPositive(ctx: ContexteDecision): { h?: Prelevement; g: GroupeGerme } {
  const h = ctx.hemocultures.find((x) => groupe(x) !== 'aucun');
  return { h, g: groupe(h) };
}
/** Bactériémie qui interdit la conclusion « pas d'antibiotique » : toute hémoculture positive, sauf un SCN sur une seule série. */
function bacteriemieSignificative(ctx: ContexteDecision): boolean {
  return ctx.hemocultures.some((x) => {
    const g = groupe(x);
    return g !== 'aucun' && !(g === 'scn' && (x.hemoc?.nbSeriesPositives ?? 0) === 1);
  });
}

export const R_PNEUMONIE: Regle = {
  id: 'R-PNEUMONIE',
  libelle: 'Pneumonie communautaire, d\'inhalation, légionellose, pneumonie associée aux soins',
  description: 'SPILF/SPLF 2025, HAS 2025, HAS 2023, SPILF/SFGG 2025, SPILF 2026 (légionellose), Afssaps 2010 (orientation), RFE SFAR/SRLF 2017 ; recoupement ERS/ESICM 2017/2023, IDSA/ATS 2016, ATS/IDSA 2019 ; RCP et CRAT.',
  statut: 'verifiee_ia',
  priorite: 154,
  sources: [S(SP, 'MMIF 2025 ; IDN 2025;55:105034', undefined, 'choix'), S(HAS, 'fiche mémo (mise à jour 13/05/2025)', undefined, 'choix'), S(SFAR, 'RFE 2017', undefined, 'choix')],
  sApplique: (ctx) => adulte(ctx) && ctx.foyer === 'pulmonaire',
  appliquer: (ctx) => {
    const f = new FichePneumonie(ctx, 'verifiee_ia');
    const { h, g } = hemocPositive(ctx);
    // Règle commune « foyer de domaine et hémoculture positive » (intégrateur, 7543585).
    if (h && (g === 's_aureus' || g === 'strepto' || g === 'entero')) {
      f.sansProposition = true;
      f.alerte('attention', `Pneumonie avec bactériémie à ${libelleGerme(h.organisme)} : la situation et les options viennent de la règle de bactériémie du germe ; la fiche de la pneumonie garde ses contrôles, gestes et avis. Pas de bithérapie une fois la pneumonie documentée, sauf pneumonie grave à SASM producteur de LPV (SPILF 2025).`, [SRC.documentation]);
      if (h.organisme === 'streptococcus_pneumoniae')
        f.alerte('attention', 'Pneumonie à pneumocoque bactériémique : posologie de l\'amoxicilline de la SPILF 2025 (tableau 10) = 1 g × 3/j hors soins critiques, 2 g × 3/j en soins critiques, à confronter à la dose affichée par la règle de bactériémie ; désescalade vers une bêta-lactamine seule en l\'absence d\'argument pour une bactérie atypique.', [SRC.tab10Amox, SRC.desescalade]);
    } else if (h && g === 'bgn') {
      f.bgn = h;
      f.plafond('partielle');
      f.alerte('attention', 'Pneumonie avec BGN dans les hémocultures : le schéma probabiliste de la pneumonie reste proposé ; les options sans molécule active attendue sur le BGN isolé sont écartées. Le traitement documenté (antibiogramme) n\'est pas modélisé pour le foyer pulmonaire : adapter le traitement à l\'antibiogramme, avis du SMIT.', [SRC.documentation]);
    } else if (h && g === 'cgp_chainettes') {
      f.alerte('attention', 'Cocci à Gram positif en chaînettes non identifiés : le schéma de la pneumonie est maintenu ; la désescalade ne s\'envisage qu\'après documentation et en l\'absence d\'argument pour une bactérie atypique (SPILF 2025).', [SRC.desescalade]);
    } else if (h && (g === 'scn' || g === 'cgp_amas' || g === 's_lugdunensis' || g === 'autre')) {
      f.alerte('info', 'Hémoculture positive non attribuée à la pneumonie à ce stade (staphylocoque à coagulase négative, germe non identifié) : le traitement de la pneumonie reste proposé ; la conclusion propre à l\'hémoculture s\'affiche à part.');
    }
    if (ctx.dossier.prelevements.some((x) => x.type === 'respiratoire' && x.organisme !== undefined)) {
      f.plafond('partielle');
      f.alerte('attention', 'Prélèvement respiratoire positif : le traitement documenté n\'est pas modélisé ; adapter le probabiliste à l\'antibiogramme (désescalade), sans bithérapie sauf pneumonie grave à SASM producteur de LPV.', [SRC.documentation]);
    }
    f.fq = fqRecente(ctx);
    if (f.fq !== 'non')
      f.alerte('attention', f.fq === 'oui' ? 'Fluoroquinolone reçue dans les 3 derniers mois : la HAS écrit que les fluoroquinolones « ne doivent pas être prescrites » (PAC ambulatoire) ; la lévofloxacine n\'est pas proposée sans condition.' : 'Fluoroquinolone récente déclarée sans date : la HAS exclut une fluoroquinolone si une fluoroquinolone a été reçue dans les 3 derniers mois ; préciser la date.', [SRC.fqHas]);
    const contexte = ctx.dossier.patient.contexte;
    if (contexte === 'communautaire') pac(ctx, f);
    else if (contexte === 'associe_aux_soins') associeeAuxSoins(ctx, f);
    else {
      f.situation('pneumonie-contexte-a-preciser', 'Pneumonie : contexte communautaire ou associé aux soins à préciser', 'partielle', 'Communautaire : acquise hors de l\'hôpital (y compris en EHPAD ou après des soins ambulatoires) ou dans les 48 premières heures d\'hospitalisation (Afssaps 2010) ; au-delà, pneumonie associée aux soins. Les schémas diffèrent.');
      f.alerte('attention', 'Pneumonie : préciser si elle est communautaire ou associée aux soins (après 48 h d\'hospitalisation ou de ventilation mécanique).', [SRC.definition, S(SFAR, 'p. 3-4', 'La pneumonie sévère acquise à l\'hôpital et la PAVM sont des infections survenant après 48 h d\'hospitalisation ou de ventilation mécanique, respectivement', 'definition')]);
      f.manque('contexte communautaire ou associé aux soins', 'les schémas de la pneumonie communautaire et de la pneumonie associée aux soins diffèrent', 'bloque_decision', 'patient.contexte');
    }
    return f.fin();
  },
};

/* ------------------------------------------------------------------ */
/* Pneumonie aiguë communautaire                                       */
/* ------------------------------------------------------------------ */

function pac(ctx: ContexteDecision, f: FichePneumonie) {
  const p = ctx.dossier.patient;
  const orient = r(ctx, 'pneumonie.orientation');
  const lieu = r(ctx, 'pneumonie.lieu');
  const graveRep = r(ctx, 'pneumonie.grave');
  const choc = p.gravite === 'choc_septique';
  f.ambulatoire = lieu === 'ambulatoire';
  if (orient === 'fausse_route') return fausseRoute(ctx, f);
  // PAC grave : critères ATS/IDSA (SPILF 2025, tableau 1) ; le choc septique est un critère majeur. En soins critiques
  // sans réponse, la définition ERS/ESICM 2023 (« CAP requiring ICU admission ») est retenue. En hospitalisation sans
  // réponse, la gravité n'est jamais lue comme « non grave » : elle est demandée (bloquante).
  const grave: Gravite = graveRep === 'oui' || choc ? true : graveRep === 'non' ? false : lieu === 'ambulatoire' ? false : lieu === 'soins_critiques' ? true : 'inconnu';
  if (lieu === 'soins_critiques' && graveRep === 'inconnu' && !choc)
    f.manque('critères de pneumonie grave (1 majeur ou 3 mineurs)', 'en soins critiques sans réponse, la pneumonie est traitée comme grave (ERS/ESICM 2023 : « sCAP refers to CAP requiring ICU admission »)', 'affine', cible('grave'));
  if (grave === 'inconnu' && lieu !== 'inconnu')
    f.manque('critères de pneumonie grave (1 majeur ou 3 mineurs)', 'schéma de la PAC non grave ou de la PAC grave (SPILF 2025, tableau 1) : une gravité non renseignée n\'est pas lue comme « non grave »', 'bloque_decision', cible('grave'));
  if (orient === 'inconnu') f.manque('orientation clinique (contexte grippal, bactérie atypique, légionellose, inhalation, LPV)', 'choix du schéma probabiliste (SPILF 2025, tableaux 2, 7 et 9)', 'affine', cible('orientation'));
  if (p.gravite === 'sepsis' && lieu === 'ambulatoire') {
    f.plafond('partielle');
    f.alerte('attention', 'Sepsis déclaré avec une prise en charge ambulatoire : les signes de gravité imposent l\'hospitalisation (critères de 2010, auxquels renvoie la SPILF 2025). Le schéma ambulatoire n\'est affiché que sous condition.', [SRC.orientation2010, SRC.signesGravite2010]);
    f.manque('lieu de prise en charge à confirmer (sepsis déclaré)', 'les signes de gravité sont un critère d\'hospitalisation (Afssaps 2010) : le schéma ambulatoire n\'est pas proposé sans condition', 'bloque_decision', cible('lieu'));
  } else if (p.gravite === 'sepsis' && grave === false) {
    f.plafond('partielle');
    f.alerte('attention', 'Sepsis déclaré alors que la pneumonie est déclarée sans critère de gravité : vérifier les critères de PAC grave (1 majeur ou 3 mineurs, SPILF 2025 tableau 1) ; le schéma affiché est celui de la PAC non grave.', [SRC.graveDef]);
  }
  const condSepsisAmb = p.gravite === 'sepsis' && lieu === 'ambulatoire' ? 'seulement si la prise en charge ambulatoire est maintenue malgré le sepsis (critère d\'hospitalisation, Afssaps 2010)' : undefined;
  f.sous(condSepsisAmb, () => {
    if (orient === 'inhalation') return inhalation(ctx, f, lieu, grave);
    if (orient === 'legionellose') return legionellose(ctx, f, lieu, grave);
    if (grave === true) return pacGrave(ctx, f, orient, lieu);
    if (orient === 'lpv' && grave === false)
      f.alerte('attention', 'Tableau évocateur de S. aureus producteur de LPV sans critère de gravité : le schéma anti-toxinique de la SPILF 2025 (tableau 9) vise la pneumonie grave ; avis infectiologique.', [S(SP, '§2-3, p. 7', 'nécessite l\'utilisation d\'une molécule avec une activité anti-toxinique (Tableau 9) (Grade B-1)', 'choix')]).avis('Avis infectiologique (suspicion de S. aureus producteur de LPV).', true, [S(SP, 'tableau 9, p. 7', 'Contexte post-grippal, gravité, présentation évocatrice : hémoptysie, leucopénie, rash cutané et pneumonie nécrosante (nodules multiples, images excavées)', 'choix')]);
    if (lieu === 'inconnu') return lieuAPreciser(f);
    if (lieu === 'ambulatoire') return pacAmbulatoire(ctx, f, orient);
    if (grave === 'inconnu') return graviteAPreciser(ctx, f, orient, lieu);
    return pacHospitalisee(ctx, f, orient, lieu === 'soins_critiques');
  });
}

function lieuAPreciser(f: Fiche) {
  f.situation('pac-lieu-a-preciser', 'Pneumonie communautaire : lieu de prise en charge à préciser', 'partielle', 'Le schéma dépend du lieu de prise en charge (ambulatoire, hospitalisation, soins critiques) et de la gravité.');
  f.manque('lieu de prise en charge (ambulatoire, hospitalisation, soins critiques)', 'choix du schéma probabiliste (SPILF 2025)', 'bloque_decision', cible('lieu'));
  f.alerte('info', 'Orientation (critères de 2010, auxquels renvoie la SPILF 2025) : CRB 65 = 0 → ambulatoire possible ; ≥ 1 critère → évaluation à l\'hôpital. La HAS fait discuter l\'hospitalisation devant : température < 36 °C ou > 40 °C, hypotension, FR ≥ 30/min, confusion, certaines comorbidités, isolement ou inobservance.', [SRC.orientation2010, SRC.crb65, S(AF, 'tableau 1, p. 3', '≥ 1 critère : évaluation à l\'hôpital', 'definition'), S(HAS, 'orientation', 'amener à discuter une prise en charge hospitalière', 'definition')]);
}

/** Hospitalisation, gravité non renseignée : les deux schémas, chacun sous sa condition (aucun n'est retenu par défaut). */
function graviteAPreciser(ctx: ContexteDecision, f: FichePneumonie, orient: string, lieu: string) {
  f.fixerSituation('pac-gravite-a-preciser', 'Pneumonie aiguë communautaire hospitalisée : gravité à préciser', 'partielle', 'Le schéma diffère entre la PAC non grave (amoxicilline, amoxicilline-acide clavulanique ou C3G selon les comorbidités) et la PAC grave (C3G + macrolide) : les deux sont affichés sous condition jusqu\'à la réponse sur les critères de gravité.');
  f.alerte('attention', 'Gravité de la pneumonie non renseignée : rechercher les critères de PAC grave (1 critère majeur ou au moins 3 mineurs) ; les schémas non grave et grave sont affichés chacun sous condition.', [SRC.graveDef]);
  f.sous('si aucun critère de PAC grave', () => pacHospitalisee(ctx, f, orient, false));
  f.sous('si critères de PAC grave (1 critère majeur ou au moins 3 mineurs)', () => optionsGrave(ctx, f, orient, lieu));
}

function fausseRoute(ctx: ContexteDecision, f: FichePneumonie) {
  const p = ctx.dossier.patient;
  const src = [
    S(INH, 'diapo 9', 'Après une fausse route constatée : Pas d\'antibiothérapie, surveillance clinique', 'choix'),
    S(INH, 'diapo 3', 'Le tableau respiratoire aigu immédiatement secondaire à une fausse route (pneumopathie chimique) ne répond pas à la définition de PI.', 'definition'),
    SRC.piDefinition,
  ];
  const sepsis = p.gravite === 'sepsis' || p.gravite === 'choc_septique';
  const bact = bacteriemieSignificative(ctx);
  const definitionPI = 'Pneumonie d\'inhalation = signes d\'infection respiratoire basse + infiltrat(s) radiologique(s) nouveau(x) (SPILF/SFGG 2025)';
  if (sepsis || bact) {
    // Une conclusion « pas d'antibiotique » propre au foyer ne s'applique jamais avec un sepsis, un choc ou une bactériémie.
    const quoi = [sepsis ? (p.gravite === 'choc_septique' ? 'choc septique' : 'sepsis') : '', bact ? 'hémoculture positive' : ''].filter(Boolean).join(' et ');
    f.fixerSituation('fausse-route-avec-gravite', `Fausse route constatée avec ${quoi} : foyer à préciser`, 'partielle', `La conclusion « pas d'antibiothérapie » de la SPILF/SFGG ne vise que la pneumopathie chimique sans pneumonie ; avec ${quoi}, elle ne s'applique pas. ${definitionPI}.`);
    f.c.indication = {
      decision: sepsis ? 'urgence' : 'informations_insuffisantes',
      qualification: 'indeterminee',
      titre: `Fausse route avec ${quoi} : pas de conclusion « sans antibiotique »`,
      raison: `Le tableau dépasse une pneumopathie chimique (${quoi}) : rechercher une pneumonie d'inhalation (${definitionPI.toLowerCase()}) ou un autre foyer.`,
      conditions: ['Fausse route constatée', quoi],
      exceptions: [],
      actions: [...(sepsis ? ['Antibiothérapie probabiliste dans l’heure selon le foyer retenu ; avis réanimation'] : []), 'Si signes d’infection respiratoire basse et infiltrat nouveau : choisir l’orientation « Pneumonie d’inhalation »'],
      surveillance: [],
      reconsiderer: [],
      questions: ['Signes d’infection respiratoire basse et infiltrat radiologique nouveau (pneumonie d’inhalation) ?'],
      sources: src,
      statut: 'verifiee_ia',
      regleId: 'R-PNEUMONIE',
    };
    if (sepsis) f.urgence('immediate');
    f.manque('orientation : pneumonie d\'inhalation (signes d\'infection respiratoire basse + infiltrat nouveau) ou autre foyer', `fausse route avec ${quoi} : la conclusion « pas d'antibiothérapie » ne s'applique pas`, 'bloque_decision', cible('orientation'));
    f.absence(
      `Fausse route constatée avec ${quoi}`,
      'Recherche du 2026-11-06 : la SPILF/SFGG 2025 ne conclut à l\'absence d\'antibiothérapie qu\'après une fausse route sans pneumonie (pneumopathie chimique) ; elle ne prévoit pas de schéma pour un sepsis, un choc ou une bactériémie après fausse route sans pneumonie d\'inhalation établie.',
      ['Rechercher une pneumonie d\'inhalation (signes d\'infection respiratoire basse + infiltrat nouveau) : si présente, choisir l\'orientation « Pneumonie d\'inhalation »', 'Rechercher un autre foyer', ...(sepsis ? ['Sepsis ou choc : antibiothérapie probabiliste dans l\'heure, avis réanimation'] : [])],
      src,
    );
    return;
  }
  f.c.indication = {
    decision: 'ne_pas_traiter',
    qualification: 'indeterminee',
    titre: 'Fausse route constatée sans pneumonie : pas d\'antibiothérapie',
    raison: `Après une fausse route constatée : pas d'antibiothérapie, surveillance clinique. Le tableau respiratoire aigu immédiatement secondaire à une fausse route (pneumopathie chimique) n'est pas une pneumonie d'inhalation. ${definitionPI}.`,
    conditions: ['Fausse route constatée', 'Pas de critère de pneumonie d\'inhalation déclaré', 'Ni sepsis, ni choc, ni hémoculture positive'],
    exceptions: [],
    actions: ['Surveillance clinique'],
    surveillance: ['Signes d\'infection respiratoire basse et infiltrat radiologique nouveau'],
    reconsiderer: ['Signes d\'infection respiratoire basse avec infiltrat radiologique nouveau (pneumonie d\'inhalation)', 'Sepsis, choc ou hémoculture positive'],
    questions: [],
    sources: src,
    statut: 'verifiee_ia',
    regleId: 'R-PNEUMONIE',
  };
  f.situation('fausse-route-sans-pneumonie', 'Fausse route constatée, sans pneumonie', 'couverte', 'Pas d\'antibiothérapie : surveillance clinique (SPILF/SFGG 2025).');
}

/** Durée de la PAC non grave (ambulatoire ou hospitalisée hors soins critiques) selon la stabilité clinique. */
function dureePacNonGrave(ctx: ContexteDecision, ambulatoire: boolean): DureeDecidee {
  const p = ctx.dossier.patient;
  const stab = r(ctx, 'pneumonie.stabilite');
  // Note 1 : pas de données chez les immunodéprimés, insuffisants respiratoires, hépatiques et rénaux chroniques graves.
  const horsDonnees = p.immunodepression === 'oui' || p.insuffisanceHepatique === 'oui' || ['hemodialyse_intermittente', 'dialyse_peritoneale'].includes(p.renal.dialyse) || dfgInferieur30(ctx.dossier, ctx.maintenant);
  const has = ambulatoire ? [SRC.dHas, SRC.dHasMax] : [];
  const noteHas = ambulatoire ? ' HAS 2025 : 7 jours maximum, arrêt possible à 5 voire 3 jours si la stabilité est vérifiée par le médecin et le patient informé.' : '';
  const noteND = horsDonnees ? ' Pas de données pour la règle des 3 jours chez le patient immunodéprimé ou insuffisant chronique grave (SPILF 2025, note 1) : durée à discuter avec le SMIT.' : '';
  const reserve3j = ' Réserve : pas de données chez les insuffisants respiratoires chroniques graves (non renseigné par la saisie : à vérifier), immunodéprimés, insuffisants hépatiques et rénaux chroniques graves (SPILF 2025, note 1).';
  if (stab === 'j3' && !horsDonnees) return jours(3, [SRC.d3, SRC.dNote1, ...has], `3 jours au total (tous les critères de stabilité obtenus à J3).${reserve3j}`);
  if (stab === 'j3_j5') return jours(5, [SRC.d5, ...has, ...(horsDonnees ? [SRC.dNote1] : [])], `5 jours au total (stabilité obtenue entre J3 et J5).${noteND}`);
  if (stab === 'non') return jours(7, [SRC.d7, SRC.dComplication, ...(horsDonnees ? [SRC.dNote1] : [])], `7 jours au total ; au-delà seulement en cas de complication (abcès, épanchement pleural significatif).${noteND}`);
  return {
    texte: `3, 5 ou 7 jours au total selon la stabilité clinique : 3 jours si tous les critères sont obtenus à J3, 5 jours s'ils le sont entre J3 et J5, 7 jours sinon ; plus de 7 jours seulement si complication.${noteND}${noteHas}`,
    pointDeDepart: 'premier jour de traitement (durée totale)',
    dureePrevueJours: 7,
    sources: [SRC.d3, SRC.d5, SRC.d7, SRC.dComplication, SRC.dNote1, ...has],
  };
}

/** Soins critiques sans critère de gravité : la règle des 3, 5 ou 7 jours ne s'applique pas (SPILF 2025 p. 8). */
const DUREE_SC_NON_GRAVE: DureeDecidee = {
  texte: 'Non fixée : la règle des 3, 5 ou 7 jours de la SPILF 2025 ne vise que les PAC hors soins critiques, et la SPILF ne fait pas de recommandation propre aux soins critiques ; à décider à la réévaluation, avec le réanimateur ou le SMIT.',
  pointDeDepart: 'premier jour de traitement',
  sources: [SRC.champ3j, SRC.champ],
};

function comorbidite(ctx: ContexteDecision): 'oui' | 'non' | 'inconnu' {
  if (comorbiditeDeduite(ctx.dossier, ctx.maintenant)) return 'oui';
  const v = r(ctx, 'pneumonie.comorbidite');
  return v === 'oui' || v === 'non' ? v : 'inconnu';
}

function reevalPac(f: Fiche, ambulatoire: boolean) {
  if (ambulatoire)
    f.reeval('Réévaluation à 48-72 h (H72). Échec d\'une bêta-lactamine : relais (et non ajout) par un macrolide ; échec d\'un macrolide : relais par une bêta-lactamine (amoxicilline, amoxicilline-acide clavulanique ou C3G injectable selon les comorbidités). Échec avec comorbidité : avis spécialisé et hospitalisation à discuter (HAS).', [
      S(SP, '§2-1, p. 6', 'relais par un macrolide lors de la réévaluation à H72 (Grade C-1)', 'choix'),
      S(SPD, 'diapo 21', 'En cas de non amélioration à 72h de bêta-lactamine : relais (et non ajout) vers macrolides', 'choix'),
      S(SP, '§2-1, p. 6', 'relais par bêtalactamine (amoxicilline ou amoxicilline-acide clavulanique ou C3G injectable selon la présence de comorbidités) lors de la réévaluation à H72 (Grade C-1)', 'choix'),
      S(HAS, 'échec à 72 h avec comorbidités', 'Discuter l\'hospitalisation', 'choix'),
    ], 72);
  else
    f.reeval('Réévaluation à 72 h. Échec : bilan complet (complication, bactérie résistante), scanner thoracique, drainage pleural à discuter, élargissement du spectre ; relais par un macrolide si forte suspicion de bactérie atypique.', [
      S(SP, '§2-2, p. 7', 'réaliser un bilan complet avec recherche de complication et/ou de bactéries résistantes', 'choix'),
      S(SP, '§2-2, p. 7', 'Relais par un macrolide si forte suspicion de bactérie atypique (Grade C-1)', 'choix'),
      S(SPD, 'diapo 20', 'A H72, si non-amélioration ou aggravation', 'imagerie'),
    ], 72);
}

function optionLevo(f: Fiche, id: string, al: ReturnType<typeof allergies>, duree: DureeDecidee, sources: SourceRef[], cond = 'uniquement en cas d\'allergie contre-indiquant les bêta-lactamines (allergie grave), sans autre possibilité', item: ItemPrescription = I.LEVO) {
  f.option({ id, libelle: 'Lévofloxacine', type: 'probabiliste', rang: al.ciBL ? 'premiere_ligne' : 'conditionnelle', condition: al.ciBL ? undefined : cond, items: [item], duree, sources: [...sources, SRC.levoNB, SRC.fqHas, SRC.ansmFq], commentaire: TEXTE_LEVO });
}

/* ---------------------------- Ambulatoire ---------------------------- */

function pacAmbulatoire(ctx: ContexteDecision, f: Fiche, orient: string) {
  const al = allergies(ctx);
  f.situation('pac-ambulatoire', 'Pneumonie aiguë communautaire en ambulatoire', 'couverte', 'SPILF/SPLF 2025 et HAS 2025 : choix selon les comorbidités, le contexte grippal et la suspicion de bactérie atypique ; pas d\'examen microbiologique ; durée selon la stabilité clinique.');
  f.controle({ id: 'ctl-pac-amb-micro', type: 'prelevement', categorie: 'non_systematique', quoi: 'Examens microbiologiques (ECBC, antigénuries, hémocultures, PCR)', quand: { ancre: 'non_determine', texte: 'Non requis en ambulatoire' }, pourquoi: 'Pas d\'examen microbiologique en ambulatoire.', sources: [S(HAS, 'examens', 'En ambulatoire, les examens microbiologiques ne sont pas requis.', 'controle_micro'), S(SP, 'p. 10', 'il n\'est pas recommandé de réaliser d\'antigénurie Legionella ou pneumocoque (Grade C-2)', 'controle_micro')] });
  f.controle({ id: 'ctl-pac-amb-imagerie', type: 'imagerie', categorie: 'indique', quoi: 'Imagerie thoracique', quand: { ancre: 'debut_traitement', offsetHeures: 24, texte: 'Dans un délai court (idéalement 24 h), sans retarder l\'antibiothérapie' }, pourquoi: 'Confirmation du diagnostic.', sources: [S(HAS, 'imagerie', 'dans un délai court (idéalement 24h). Néanmoins elle ne doit pas retarder la mise en route du traitement antibiotique', 'imagerie')] });
  f.alerte('info', 'PAC non grave : pas de corticoïdes (SPILF 2025, grade A-2). Les céphalosporines orales n\'ont pas de place dans la PAC.', [SRC.corticoNonGrave, S(SP, '§2-1, p. 6', 'les céphalosporines orales n\'ont aucune place dans le traitement des PAC', 'choix')]);
  reevalPac(f, true);
  const duree = dureePacNonGrave(ctx, true);
  if (orient === 'atypique') return atypiqueAmbulatoire(ctx, f, al);
  if (orient === 'grippe') {
    const src = [S(SP, '§2-1, p. 6 (grippe)', 'amoxicilline-acide clavulanique (Grade C-1) ; en cas d\'allergie : pristinamycine (Grade C-1)', 'choix')];
    // Allergie : la SPILF recommande la pristinamycine (hors base) ; l'option habituelle reste affichée sous condition.
    f.option({ id: 'pac-amb-grippe-amc', libelle: 'Amoxicilline-acide clavulanique (contexte grippal)', type: 'probabiliste', rang: al.peni ? 'conditionnelle' : 'premiere_ligne', condition: al.peni ? 'allergie déclarée : la SPILF 2025 recommande la pristinamycine (hors base)' : undefined, items: [I.AMC], duree, sources: src, commentaire: TEXTE_PRISTINA });
    if (al.peni) f.alerte('attention', `Allergie déclarée, contexte grippal : ${TEXTE_PRISTINA}`, src);
    optionLevo(f, 'pac-amb-grippe-levo', al, duree, []);
    return;
  }
  const comorb = comorbidite(ctx);
  const srcSans = S(SP, '§2-1, p. 6', 'Patient sans comorbidité : amoxicilline (Grade B-1) ; en cas d\'allergie : pristinamycine (Grade B-3)', 'choix');
  const srcAvec = S(SP, '§2-1, p. 6', 'Patient avec au moins une comorbidité (Tableau 3) : amoxicilline-acide clavulanique (Grade B-1) ; en cas d\'allergie non grave : C3G […] injectable (Grade B-1) ; uniquement en cas d\'allergie contre-indiquant l\'utilisation de bêtalactamine : lévofloxacine (Grade B-1)', 'choix');
  const srcHasAvec = S(HAS, 'comorbidités ou exposition aux antibiotiques', 'En cas de comorbidités ou d\'exposition aux antibiotiques[1] dans le mois précédant ou d\'hospitalisation dans les 6 mois : amoxicilline/acide clavulanique : 1g/125 mg 3 fois par jour', 'choix');
  const divergenceComorb = 'Définition divergente : SPILF 2025, hospitalisation dans les 3 mois ; HAS 2025, hospitalisation dans les 6 mois.';
  if (comorb === 'inconnu') f.manque('comorbidité de la liste SPILF 2025 (tableau 3)', 'amoxicilline (aucune comorbidité) ou amoxicilline-acide clavulanique (au moins une)', 'bloque_decision', cible('comorbidite'));
  const deduite = comorbiditeDeduite(ctx.dossier, ctx.maintenant);
  if (comorb !== 'oui') {
    const premiere = comorb === 'non' && !al.peni;
    const condition = premiere ? undefined : al.peni ? 'allergie déclarée : la SPILF 2025 recommande la pristinamycine (hors base)' : 'si aucune comorbidité de la liste SPILF 2025';
    f.option({ id: 'pac-amb-amox', libelle: 'Amoxicilline', type: 'probabiliste', rang: premiere ? 'premiere_ligne' : 'conditionnelle', condition, items: [I.AMOX], duree, sources: [srcSans, S(HAS, '1re intention sans comorbidité', 'amoxicilline 1g 3 fois par jour', 'choix')], commentaire: TEXTE_PRISTINA });
    if (comorb === 'non' && al.peni) f.alerte('attention', `Allergie déclarée, PAC sans comorbidité : ${TEXTE_PRISTINA}`, [srcSans, S(HAS, '1re intention', 'En cas d\'allergie documentée contre-indiquant les pénicillines ou de rupture de stock : pristinamycine 1g 3 fois par jour', 'choix')]);
  }
  if (comorb !== 'non') {
    f.option({ id: 'pac-amb-amc', libelle: 'Amoxicilline-acide clavulanique', type: 'probabiliste', rang: comorb === 'oui' ? 'premiere_ligne' : 'conditionnelle', condition: comorb === 'oui' ? undefined : 'si au moins une comorbidité de la liste SPILF 2025', items: [I.AMC], duree, sources: [srcAvec, srcHasAvec, S(SP, 'tableau 3, NB', 'La présence d\'une seule des comorbidités listées ci-dessus suffit à modifier le choix de l\'amoxicilline', 'choix')], commentaire: `${deduite ? `Comorbidité déduite de la saisie : ${deduite}. ` : ''}${divergenceComorb}` });
    f.option({ id: 'pac-amb-c3g', libelle: 'Ceftriaxone injectable (allergie non grave aux pénicillines)', type: 'probabiliste', rang: al.penicillineSeule && comorb === 'oui' ? 'premiere_ligne' : 'conditionnelle', condition: al.penicillineSeule && comorb === 'oui' ? undefined : 'en cas d\'allergie non grave aux pénicillines, avec comorbidité', items: [I.CRO1], duree, sources: [srcAvec, S(HAS, 'allergie aux pénicillines', 'ceftriaxone : 1g 1 fois par jour par voie IM, IV ou SC', 'choix')], commentaire: 'Céfotaxime 1 g × 3/j IM ou IV possible (HAS 2025). Voie SC citée par la HAS : non rapprochée du RCP dans la note de recherche.' });
  }
  optionLevo(f, 'pac-amb-levo', al, duree, [srcAvec, S(HAS, 'dernier recours', 'En dernier recours, si aucune autre antibiothérapie n\'est possible : fluoroquinolone anti-pneumococcique', 'choix')]);
}

function atypiqueAmbulatoire(ctx: ContexteDecision, f: Fiche, al: ReturnType<typeof allergies>) {
  const src = [
    S(SP, '§2-1, p. 6', 'macrolide en première intention, pristinamycine ou doxycycline en alternative (Grade C-1)', 'choix'),
    S(SP, 'tableau 7, p. 6', 'Macrolide* ; Cycline ; Si contre-indication aux macrolides et aux cyclines : lévofloxacine', 'choix'),
    S(MYCO, 'p. 4', 'Les macrolides sont le traitement de référence', 'choix'),
  ];
  // Divergence HAS 2023 (durée fixe par molécule) / SPILF 2025 (3, 5 ou 7 jours selon la stabilité) : affichée ; la durée
  // prévue n'est retenue que si les deux sources concordent pour la stabilité saisie.
  const stab = r(ctx, 'pneumonie.stabilite');
  const spilf = stab === 'j3' ? 3 : stab === 'j3_j5' ? 5 : stab === 'non' ? 7 : undefined;
  const spilfTexte = spilf ? `${spilf} jours au total selon la SPILF 2025 (stabilité saisie)` : 'SPILF 2025 : 3, 5 ou 7 jours au total selon la stabilité clinique';
  const dDiv = (n: number, has: string, extrait: string): DureeDecidee => ({
    texte: spilf === n ? `${n} jours (HAS 2023 et SPILF 2025 concordantes pour la stabilité saisie).` : `Divergence non tranchée : ${has} selon la HAS (M. pneumoniae, 2023) ; ${spilfTexte}.`,
    pointDeDepart: 'premier jour de traitement (durée totale)',
    dureePrevueJours: spilf === n ? n : undefined,
    sources: [S(MYCO, 'p. 4', extrait, 'duree'), SRC.d3, SRC.d5, SRC.d7],
  });
  const commun = 'Alternatives de la SPILF 2025 non disponibles dans la base : pristinamycine, doxycycline (RCP non lu ; 100 mg × 2/j selon la SPILF, 200 mg × 1/j selon la HAS). Roxithromycine (150 mg × 2/j) : RCP non lu.';
  const g = grossesse(ctx);
  const clari = { id: 'pac-atyp-clari', libelle: 'Clarithromycine', type: 'probabiliste' as const, items: [I.CLARI], statut: 'brouillon' as const, duree: dDiv(5, '5 jours', '500 mg 2 fois par jour pendant 5 jours'), sources: [...src, S(HAS, 'atypique ou échec à 72 h', 'clarithromycine : 500 mg 2 fois par jour', 'choix')], commentaire: `Macrolides cités sans hiérarchie (SPILF 2025) ; ordre de la HAS. ${commun}` };
  const spira = { id: 'pac-atyp-spira', libelle: 'Spiramycine', type: 'probabiliste' as const, items: [I.SPIRA], statut: 'brouillon' as const, duree: dDiv(7, '7 jours', '3 MUI 3 fois par jour pendant 7 jours'), sources: [...src, S(HAS, 'atypique ou échec à 72 h', 'spiramycine : 3 MUI 3 fois par jour', 'choix')], commentaire: `HAS 2023 : spiramycine en cas de problème d'approvisionnement des autres macrolides (M. pneumoniae).${g ? ` ${TEXTE_GROSSESSE_MACRO}` : ''}` };
  const azi = { id: 'pac-atyp-azi', libelle: 'Azithromycine (hors AMM dans la pneumonie)', type: 'probabiliste' as const, items: [I.AZI], statut: 'brouillon' as const, duree: dDiv(5, '5 jours (J1 à J5)', '500 mg/j en une prise à J1 puis 250mg/j de J2 à J5'), sources: [...src, S(HAS, 'atypique ou échec à 72 h', 'azithromycine : 500 mg par jour en une prise à J1 puis 250 mg par jour (antibiotique ayant un impact plus important sur la résistance bactérienne du fait de sa longue demi-vie)', 'choix'), SRC_AZI_RESISTANCE], commentaire: `Impact plus important sur la résistance bactérienne (longue demi-vie, HAS). La pneumonie ne figure pas dans les indications du RCP ZITHROMAX 250 mg (hors AMM). ${TEXTE_AZI_RESISTANCE}` };
  f.optionsEnOrdre(g ? [spira, clari, azi] : [clari, spira, azi]);
  f.option({ id: 'pac-atyp-levo', libelle: 'Lévofloxacine (dernier recours)', type: 'probabiliste', rang: 'conditionnelle', condition: 'seulement si contre-indication aux macrolides et aux cyclines, en dernier recours, décision partagée', items: [I.LEVO], duree: jours(7, [S(MYCO, 'p. 5', 'Lévofloxacine 500 mg 1 fois par jour pendant 7 jours', 'duree')]), sources: [...src, S(MYCO, 'p. 5', 'En dernier recours dans le cadre d\'une décision partagée', 'choix'), SRC.fqHas, SRC.ansmFq], commentaire: `${TEXTE_LEVO} ${al.macro ? 'Allergie aux macrolides déclarée : alternatives SPILF (pristinamycine, doxycycline) hors base, à envisager avant la lévofloxacine.' : ''}`.trim() });
}

/* ------------------------- Hospitalisée non grave ------------------------- */

function pacHospitalisee(ctx: ContexteDecision, f: Fiche, orient: string, sc: boolean) {
  const al = allergies(ctx);
  if (sc)
    f.situation('pac-soins-critiques-non-grave', 'Pneumonie aiguë communautaire en soins critiques, sans critère de gravité', 'partielle', 'La SPILF 2025 ne fait pas de recommandation propre aux soins critiques : choix de la PAC hospitalisée non grave (comorbidités, contexte grippal, bactérie atypique, colonisation à P. aeruginosa) avec les posologies « en soins critiques » du tableau 10 ; durée non fixée (la règle des 3, 5 ou 7 jours vise les PAC hors soins critiques).');
  else f.situation('pac-hospitalisee', 'Pneumonie aiguë communautaire hospitalisée, non grave', 'couverte', 'SPILF/SPLF 2025 : choix selon les comorbidités, le contexte grippal, la suspicion de bactérie atypique et la colonisation à P. aeruginosa ; durée selon la stabilité clinique.');
  if (sc) f.alerte('attention', 'Soins critiques sans critère de PAC grave : schéma de la PAC hospitalisée non grave avec les posologies « en soins critiques » du tableau 10 (amoxicilline 2 g × 3/j, amoxicilline-acide clavulanique 1 ou 2 g × 3/j, ceftriaxone 2 g/j, lévofloxacine 500 à 1 000 mg/j) ; durée à décider à la réévaluation.', [SRC.champ, SRC.tab10Amox, SRC.champ3j]);
  controlesHospitaliseNonGrave(f);
  f.alerte('info', 'PAC non grave : pas de corticoïdes (SPILF 2025, grade A-2) ; pas de bithérapie bêta-lactamine + macrolide ou fluoroquinolone (grade A-1) ; la pristinamycine n\'a pas sa place chez le patient hospitalisé.', [SRC.corticoNonGrave, S(SP, 'p. 8-9', 'une bithérapie probabiliste associant bêtalactamine et macrolide ou fluoroquinolone n\'est pas recommandée […] (Grade A-1)', 'choix'), S(SP, '§2-2, p. 7', 'La pristinamycine n\'a pas sa place chez les patients hospitalisés (Grade C-1)', 'choix')]);
  reevalPac(f, false);
  const duree = sc ? DUREE_SC_NON_GRAVE : dureePacNonGrave(ctx, false);
  const it = { AMOX: sc ? I.AMOX_SC : I.AMOX, AMC: sc ? I.AMC_SC : I.AMC, CRO: sc ? I.CRO2 : I.CRO1, LEVO: sc ? I.LEVO_SC : I.LEVO, SPIRA_IV: sc ? I.SPIRA_IV3 : I.SPIRA_IV };
  const srcLevo = [S(SP, '§2-2, p. 7', 'Alternative (uniquement en cas d\'allergie contre-indiquant l\'utilisation de bêtalactamine) : lévofloxacine (Grade B-1)', 'choix')];
  const fdr = r(ctx, 'pneumonie.fdr_pyo');
  if (fdr === 'colonisation') return antiPyoHospitalise(f, duree);
  if (fdr === 'inconnu') f.manque('colonisation ou infection respiratoire à P. aeruginosa dans l\'année', 'bêta-lactamine anti-P. aeruginosa recommandée en cas de colonisation (SPILF 2025)', 'affine', cible('fdr_pyo'));
  if (orient === 'atypique') {
    const src = [S(SP, '§2-2, p. 7', 'macrolides (Grade C-1)', 'choix'), S(SP, 'tableau 7, p. 6', 'Macrolide* ; Cycline ; Si contre-indication aux macrolides et aux cyclines : lévofloxacine', 'choix')];
    const g = grossesse(ctx);
    const clari = { id: 'pac-hosp-atyp-clari', libelle: 'Clarithromycine per os', type: 'probabiliste' as const, items: [I.CLARI], duree, sources: src, commentaire: 'Macrolides cités sans hiérarchie (SPILF 2025, tableau 7 : azithromycine, clarithromycine, roxithromycine, spiramycine) ; roxithromycine : RCP non lu.' };
    const spira = { id: 'pac-hosp-atyp-spira', libelle: 'Spiramycine per os', type: 'probabiliste' as const, items: [I.SPIRA], duree, sources: src, commentaire: `Voie orale impossible : spiramycine IV (option suivante).${g ? ` ${TEXTE_GROSSESSE_MACRO}` : ''}` };
    f.optionsEnOrdre(g ? [spira, clari] : [clari, spira]);
    f.option({ id: 'pac-hosp-atyp-spira-iv', libelle: 'Spiramycine IV', type: 'probabiliste', rang: 'conditionnelle', condition: 'si la voie orale est impossible', items: [it.SPIRA_IV], duree, sources: [...src, S('RCP-spiramycine-IV', '§4.1', 'Pneumopathies aigües', 'choix')], commentaire: 'Contre-indiquée avec les médicaments donnant des torsades de pointes, dont la lévofloxacine (RCP de la forme IV).' });
    f.option({ id: 'pac-hosp-atyp-levo', libelle: 'Lévofloxacine', type: 'probabiliste', rang: 'conditionnelle', condition: 'uniquement si allergie grave aux bêta-lactamines ou contre-indication aux macrolides', items: [it.LEVO], duree, sources: [S(SP, 'tableau 6, note', 'Lévofloxacine : uniquement si allergie grave aux bêtalactamines ou si contre-indication aux macrolides en cas de suspicion de bactérie atypique', 'choix'), SRC.ansmFq], commentaire: TEXTE_LEVO });
    return;
  }
  if (orient === 'grippe') {
    f.option({ id: 'pac-hosp-grippe-amc', libelle: 'Amoxicilline-acide clavulanique (contexte grippal)', type: 'probabiliste', rang: 'premiere_ligne', items: [it.AMC], duree, sources: [S(SP, '§2-2, p. 7 (grippe)', 'amoxicilline-acide clavulanique (Grade C-1)', 'choix')] });
    c3gAllergiePenicilline(f, 'pac-hosp-grippe-c3g', al, duree, it.CRO, { statut: 'brouillon', commentaire: 'Contexte grippal : la SPILF 2025 ne donne que l\'amoxicilline-acide clavulanique ; la C3G en cas d\'allergie est reprise de la ligne « sans comorbidité » (§2-2) : extrapolation, brouillon.' });
    optionLevo(f, 'pac-hosp-grippe-levo', al, duree, srcLevo, undefined, it.LEVO);
    return;
  }
  const comorb = comorbidite(ctx);
  const srcSans = S(SP, '§2-2, p. 7', 'Patient sans comorbidité : amoxicilline per os ou injectable (Grade A-1) ; en cas d\'allergie aux pénicillines : C3G injectable (Grade B-1)', 'choix');
  const srcAvec = S(SP, '§2-2, p. 7', 'soit amoxicilline-acide clavulanique per os ou injectable, soit C3G injectable (Grade B-1)', 'choix');
  if (comorb === 'inconnu') f.manque('comorbidité de la liste SPILF 2025 (tableau 3)', 'amoxicilline (aucune comorbidité) ou amoxicilline-acide clavulanique / C3G (au moins une)', 'bloque_decision', cible('comorbidite'));
  if (comorb !== 'oui') {
    f.option({ id: 'pac-hosp-amox', libelle: sc ? 'Amoxicilline IV (soins critiques)' : 'Amoxicilline per os ou IV', type: 'probabiliste', rang: comorb === 'non' ? 'premiere_ligne' : 'conditionnelle', condition: comorb === 'non' ? undefined : 'si aucune comorbidité de la liste SPILF 2025', items: [it.AMOX], duree, sources: [srcSans, ...(sc ? [SRC.tab10Amox] : [])] });
    // Comorbidité inconnue : une seule option de ceftriaxone, qui réunit les deux indications (pas de doublon).
    if (comorb === 'non') c3gAllergiePenicilline(f, 'pac-hosp-c3g-allergie', al, duree, it.CRO);
  }
  if (comorb !== 'non') {
    const rang = comorb === 'oui' ? ('premiere_ligne' as const) : ('conditionnelle' as const);
    const condition = comorb === 'oui' ? undefined : 'si au moins une comorbidité de la liste SPILF 2025';
    f.option({ id: 'pac-hosp-amc', libelle: 'Amoxicilline-acide clavulanique per os ou IV', type: 'probabiliste', rang, condition, items: [it.AMC], duree, sources: [srcAvec] });
    f.option({ id: 'pac-hosp-c3g', libelle: sc ? 'Ceftriaxone 2 g (C3G injectable, soins critiques)' : 'Ceftriaxone (C3G injectable)', type: 'probabiliste', rang, condition: comorb === 'oui' ? undefined : 'si au moins une comorbidité de la liste SPILF 2025, ou en cas d\'allergie aux pénicillines sans contre-indication aux C3G', items: [it.CRO], duree, sources: comorb === 'oui' ? [srcAvec] : [srcAvec, srcSans], commentaire: 'Amoxicilline-acide clavulanique ou C3G injectable, au même rang (SPILF 2025) ; céfotaxime 1 g × 3/j possible hors soins critiques.' });
  }
  optionLevo(f, 'pac-hosp-levo', al, duree, srcLevo, undefined, it.LEVO);
}

function c3gAllergiePenicilline(f: Fiche, id: string, al: ReturnType<typeof allergies>, duree: DureeDecidee, item: ItemPrescription, extra: { statut?: StatutValidation; commentaire?: string } = {}) {
  const premiere = al.penicillineSeule;
  f.option({ id, libelle: 'Ceftriaxone (allergie aux pénicillines)', type: 'probabiliste', rang: premiere ? 'premiere_ligne' : 'conditionnelle', condition: premiere ? undefined : 'en cas d\'allergie aux pénicillines sans contre-indication aux C3G', items: [item], duree, sources: [S(SP, '§2-2, p. 7', 'en cas d\'allergie aux pénicillines : C3G injectable (Grade B-1)', 'choix')], ...extra });
}

function antiPyoHospitalise(f: Fiche, duree: DureeDecidee) {
  const src = [
    S(SP, 'p. 9', 'recommandée chez les patients hospitalisés avec une PAC grave ou non grave et présentant un antécédent de colonisation ou d\'infection respiratoire récente (il y a moins d\'un an) par ce pathogène (Grade B-1)', 'choix'),
    S(SP, 'p. 9', 'prendre en compte le dernier antibiogramme disponible (Grade C-1)', 'choix'),
  ];
  f.controle({ id: 'ctl-pac-pyo-ecbc', type: 'prelevement', categorie: 'indique', quoi: 'ECBC ou prélèvement respiratoire (documentation bactériologique)', quand: { ancre: 'avant_traitement', texte: 'Avant l\'antibiothérapie' }, pourquoi: 'Bêta-lactamine anti-P. aeruginosa : documentation fortement recommandée.', sources: [S(SP, 'p. 9', 'fortement recommandé de réaliser des examens de documentation bactériologique', 'controle_micro')] });
  const commentaire = 'Choisir selon le dernier antibiogramme de la souche colonisante (SPILF 2025, C-1). Aztréonam et ceftazidime exclus du probabiliste (avis d\'expert). Posologies non données par la SPILF 2025 : RCP.';
  f.option({ id: 'pac-hosp-pyo-fep', libelle: 'Céfépime (colonisation à P. aeruginosa)', type: 'probabiliste', rang: 'premiere_ligne', items: [I.FEP], duree, sources: [...src, S(SP, 'p. 9', 'céfépime ou l\'association pipéracilline-tazobactam', 'choix')], commentaire });
  f.option({ id: 'pac-hosp-pyo-tzp', libelle: 'Pipéracilline-tazobactam (colonisation à P. aeruginosa)', type: 'probabiliste', rang: 'premiere_ligne', items: [I.TZP], duree, sources: [...src, S(SP, 'p. 9', 'céfépime ou l\'association pipéracilline-tazobactam', 'choix')], commentaire });
}

function controlesHospitaliseNonGrave(f: Fiche) {
  f.controle({ id: 'ctl-pac-hosp-ag-legio', type: 'prelevement', categorie: 'conditionnel', quoi: 'Antigénurie Legionella (pas d\'antigénurie pneumocoque)', quand: { ancre: 'avant_traitement', texte: 'Seulement en cas d\'arguments évocateurs de légionellose' }, pourquoi: 'Pas d\'antigénurie systématique dans la PAC hospitalisée non grave.', sources: [S(SP, 'p. 10', 'sauf en cas d\'arguments évocateurs (cf. Tableau 2) (Grade B-2)', 'controle_micro')] });
  f.controle({ id: 'ctl-pac-hosp-ecbc', type: 'prelevement', categorie: 'conditionnel', quoi: 'ECBC', quand: { ancre: 'avant_traitement', texte: 'En cas de sécrétions muco-purulentes' }, pourquoi: 'Surtout si antibiothérapie non conventionnelle, antécédent de SARM ou de P. aeruginosa, antibiothérapie parentérale dans les 3 mois ou non-réponse à 72 h.', sources: [S(SP, 'p. 11', 'recommandé de réaliser un ECBC en cas de sécrétions muco-purulentes', 'controle_micro')] });
  f.controle({ id: 'ctl-pac-hosp-hc', type: 'hemoculture', categorie: 'conditionnel', quoi: 'Hémocultures', quand: { ancre: 'avant_traitement', texte: 'Seulement si doute diagnostique, immunodépression, antibiothérapie non conventionnelle, antécédent de SARM ou P. aeruginosa, antibiothérapie parentérale < 3 mois, non-réponse à 72 h' }, pourquoi: 'Hémocultures ciblées (avis d\'expert).', sources: [S(SP, 'p. 11', 'si doute diagnostique, immunodépression, antibiothérapie non conventionnelle', 'controle_micro')] });
  f.controle({ id: 'ctl-pac-hosp-pcr', type: 'prelevement', categorie: 'conditionnel', quoi: 'PCR virale (grippe A/B, VRS, SARS-CoV-2)', quand: { ancre: 'avant_traitement', texte: 'Selon le contexte épidémique' }, pourquoi: 'Recherche virale chez le patient hospitalisé.', sources: [SRC.pcrVirale] });
  f.controle({ id: 'ctl-pac-hosp-crp', type: 'autre', categorie: 'non_systematique', quoi: 'CRP et procalcitonine', quand: { ancre: 'non_determine', texte: 'Pas de dosage systématique' }, pourquoi: 'Ni pour le diagnostic ni pour le suivi.', sources: [S(SP, 'p. 10', 'n\'est pas recommandé de manière systématique pour le diagnostic et/ou le suivi des PAC (Grade C-1)', 'controle_micro')] });
}

/* ------------------------------ PAC grave ------------------------------ */

function controlesGrave(f: Fiche) {
  f.controle({ id: 'ctl-pac-grave-hc', type: 'hemoculture', categorie: 'indique', quoi: 'Hémocultures', quand: { ancre: 'avant_traitement', texte: 'Avant l\'antibiothérapie, sans la retarder' }, pourquoi: 'PAC grave : hémocultures systématiques.', sources: [S(SP, 'p. 11', 'réaliser systématiquement des hémocultures (Grade B-1)', 'controle_micro')] });
  f.controle({ id: 'ctl-pac-grave-ag', type: 'prelevement', categorie: 'indique', quoi: 'Antigénuries pneumocoque et Legionella', quand: { ancre: 'avant_traitement', texte: 'À l\'admission' }, pourquoi: 'PAC grave.', ensuite: 'Antigénurie Legionella négative avec suspicion clinique : PCR (et culture) sur prélèvement respiratoire profond.', sources: [S(SP, 'p. 10', 'il est recommandé de réaliser une antigénurie pneumocoque et Legionella (Grade B-1)', 'controle_micro'), S(SP, 'p. 10, note 2', 'En cas d\'antigénurie Legionella négative et de suspicion clinique de PAC grave à Legionella, il faut réaliser une PCR (et une culture) sur prélèvements respiratoires profonds', 'controle_micro')] });
  f.controle({ id: 'ctl-pac-grave-resp', type: 'prelevement', categorie: 'indique', quoi: 'Examen direct (Gram) et culture d\'un prélèvement respiratoire, profond de préférence', quand: { ancre: 'avant_traitement', texte: 'Avant l\'antibiothérapie si possible' }, pourquoi: 'Documentation de la PAC grave.', sources: [S(SP, 'p. 11', 'examen direct microscopique après coloration de Gram et d\'une mise en culture à partir d\'un prélèvement respiratoire', 'controle_micro')] });
  f.controle({ id: 'ctl-pac-grave-pcr', type: 'prelevement', categorie: 'indique', quoi: 'PCR virale (grippe A/B, VRS, SARS-CoV-2)', quand: { ancre: 'avant_traitement', texte: 'Selon le contexte épidémique' }, pourquoi: 'Recherche virale chez le patient hospitalisé.', sources: [SRC.pcrVirale] });
  f.controle({ id: 'ctl-pac-grave-panel', type: 'prelevement', categorie: 'conditionnel', quoi: 'PCR multiplex (panel syndromique) sur prélèvement respiratoire bas', quand: { ancre: 'avant_traitement', texte: 'Si antibiothérapie non conventionnelle (autre que C3G + macrolide)' }, pourquoi: 'Documentation quand le schéma standard n\'est pas utilisé.', sources: [S(SP, 'p. 12', 'lorsqu\'une antibiothérapie non conventionnelle est utilisée', 'controle_micro'), S(ERS23, 'Q1', 'whenever non-standard sCAP antibiotics are prescribed or considered', 'controle_micro')] });
}

function corticoidesGrave(ctx: ContexteDecision, f: Fiche, orient: string, lieu: string) {
  const p = ctx.dossier.patient;
  const exclu = orient === 'grippe' ? 'étiologie grippale' : orient === 'inhalation' ? 'pneumonie d\'inhalation' : p.neutropenie === 'oui' ? 'myélosuppression' : undefined;
  const srcExcl = S(SP, 'p. 9-10', 'en dehors d\'un contexte de myélosuppression, de pneumonie d\'inhalation ou d\'étiologie grippale (Grade A-1)', 'geste');
  if (exclu) {
    f.geste(`Corticoïdes : l'hydrocortisone de la PAC grave n'est pas recommandée dans ce contexte (${exclu} : exclusion de la SPILF 2025).`, [srcExcl]);
    return;
  }
  if (p.neutropenie === 'inconnu') f.manque('neutropénie ou myélosuppression', 'l\'hydrocortisone de la PAC grave est exclue en cas de myélosuppression (SPILF 2025)', 'affine', 'patient.neutropenie');
  const reserveLpv = orient === 'lpv' ? 'Tableau de LPV, souvent post-grippal : si l\'étiologie est grippale, l\'hydrocortisone n\'est pas recommandée (exclusion SPILF 2025). Sinon : ' : '';
  const reserveNeutro = p.neutropenie === 'inconnu' ? ' Neutropénie non renseignée : vérifier l\'absence de myélosuppression.' : '';
  f.geste(
    `${reserveLpv}${lieu === 'soins_critiques' ? '' : 'Si admission en soins critiques : '}hémisuccinate d'hydrocortisone 200 mg/j (IVSE), débuté dans les 24 h suivant l'apparition des signes de gravité, réévalué à J4 pour la décroissance, durée totale 8 à 14 jours (SPILF 2025, grade A-1 ; hors myélosuppression, inhalation et grippe).${reserveNeutro} Divergence entre les sources, non tranchée par l'application : ERS/ESICM 2023, seulement en cas de choc ; ATS/IDSA 2019, pas en routine ; SCCM 2024, recommandation forte.`,
    [
      S(SP, 'p. 9-10', 'l\'adjonction d\'hémisuccinate d\'hydrocortisone, débutée dans les 24 heures suivant l\'apparition des signes de gravité et à la posologie de 200 mg par jour', 'geste'),
      srcExcl,
      S(SPD, 'diapo 19', 'Posologie de 200 mg/j (IVSE) : J1-J4', 'geste'),
      S(ERS23, 'Q6', 'we suggest the use of corticosteroids if shock is present', 'geste'),
      S(ATS19, 'corticoïdes', 'We suggest not routinely using corticosteroids in adults with severe CAP', 'geste'),
      S(SCCM, 'résumé', 'a strong recommendation for use in hospitalized patients with severe CAP', 'geste'),
      ...(orient === 'lpv' ? [S(SP, 'tableau 9, p. 7', 'Contexte post-grippal, gravité, présentation évocatrice : hémoptysie, leucopénie, rash cutané et pneumonie nécrosante (nodules multiples, images excavées)', 'geste')] : []),
    ],
  );
}

function communGrave(ctx: ContexteDecision, f: Fiche, orient: string, lieu: string, avecControles = true) {
  f.urgence('elevee');
  // Pneumonie d'inhalation : pas d'examen bactériologique systématique ni d'antigénurie (SPILF/SFGG 2025).
  if (avecControles) controlesGrave(f);
  corticoidesGrave(ctx, f, orient, lieu);
  if (lieu !== 'soins_critiques')
    f.avis('Avis réanimation : admission directe en réanimation si hypotension nécessitant des vasopresseurs ou insuffisance respiratoire nécessitant la ventilation mécanique.', true, [S(ATS19, 'admission', 'We recommend direct admission to an ICU for patients with hypotension requiring vasopressors or respiratory failure requiring mechanical ventilation', 'autre')]);
  if (qtAssocie(ctx))
    f.alerte('attention', 'Traitement allongeant le QT déclaré : spiramycine IV contre-indiquée (RCP de la forme IV, options écartées) ; clarithromycine IV (hors AMM) avec prudence (QT, RCP) ; ECG, kaliémie et avis pharmaceutique ou cardiologique.', [SRC.spiraIvCi, S('RCP-clarithromycine', '§4.3', 'Allongement congénital ou acquis de l\'intervalle QT', 'surveillance')]);
}

const DUREE_GRAVE: DureeDecidee = {
  texte: 'Non fixée par la SPILF 2025 pour la PAC grave (la règle des 3, 5 ou 7 jours ne vise que les PAC non graves et modérément graves ; pas de recommandation propre aux soins critiques) : à décider à la réévaluation, avec le réanimateur ou le SMIT. ERS/ESICM 2023 : procalcitonine suggérée pour raccourcir la durée.',
  pointDeDepart: 'premier jour de traitement',
  sources: [SRC.champ3j, SRC.champ, S(ERS23, 'Q4', 'We suggest the use of PCT to reduce the duration of antibiotic treatment in patients with sCAP', 'duree')],
};

function pacGrave(ctx: ContexteDecision, f: FichePneumonie, orient: string, lieu: string) {
  f.situation('pac-grave', 'Pneumonie aiguë communautaire grave', 'couverte', 'SPILF/SPLF 2025 : C3G injectable + macrolide (lévofloxacine seule en cas d\'allergie), bêta-lactamine anti-P. aeruginosa si facteur de risque, schéma anti-toxinique si LPV ; pas de recommandation propre aux soins critiques ; durée non fixée (indiquée dans la durée de chaque option).');
  communGrave(ctx, f, orient, lieu);
  f.reeval('Désescalade rapide vers une bêta-lactamine seule en l\'absence d\'argument pour une bactérie atypique ; pas de bithérapie après documentation (sauf SASM producteur de LPV).', [SRC.desescalade, SRC.documentation], 72);
  optionsGrave(ctx, f, orient, lieu);
}

/** Options de la PAC grave (aussi affichées sous condition quand la gravité est à préciser). */
function optionsGrave(ctx: ContexteDecision, f: FichePneumonie, orient: string, lieu: string) {
  const al = allergies(ctx);
  if (orient === 'lpv') return lpv(ctx, f, al);
  const srcBase = [
    S(SP, '§2-3, p. 7', 'C3G injectable associée à un macrolide ou, en cas d\'allergie à l\'une des deux classes médicamenteuses, monothérapie par fluoroquinolone antipneumococcique (lévofloxacine) (Grade B-1)', 'choix'),
    S(SP, 'p. 8-9', 'une bithérapie probabiliste associant bêtalactamine (C3G) et macrolide est recommandée', 'choix'),
    S(ERS23, 'Q3', 'We suggest the addition of macrolides, not fluoroquinolones, to beta-lactams as empirical antibiotic therapy in hospitalised patients with sCAP', 'choix'),
  ];
  const srcPyoSC = S(SP, 'p. 9', 'chez les patients hospitalisés avec une PAC grave admis en soins critiques et présentant au moins un facteur de risque parmi : antibiothérapie parentérale récente (moins de trois mois), BPCO sévère, bronchectasies et/ou trachéotomie (Grade B-1)', 'choix');
  const fdr = r(ctx, 'pneumonie.fdr_pyo');
  // Facteurs « autres » : seulement pour la PAC grave admise en soins critiques (SPILF 2025 p. 9).
  const pyo = fdr === 'colonisation' || (fdr === 'autre' && lieu === 'soins_critiques');
  if (fdr === 'autre' && lieu !== 'soins_critiques')
    f.alerte('info', `Facteur de risque « autre » de P. aeruginosa (antibiothérapie parentérale < 3 mois, BPCO sévère, bronchectasies, trachéotomie) : la SPILF 2025 ne le retient que pour la PAC grave admise en soins critiques ; lieu déclaré : ${lieu === 'inconnu' ? 'non renseigné' : 'hors soins critiques'}, schéma C3G + macrolide affiché.`, [srcPyoSC]);
  if (fdr === 'inconnu') f.manque('facteur de risque de P. aeruginosa (colonisation < 1 an, antibiothérapie parentérale < 3 mois, BPCO sévère, bronchectasies, trachéotomie)', 'PAC grave : C3G + macrolide, ou bêta-lactamine anti-P. aeruginosa + molécule active sur les atypiques (SPILF 2025)', 'bloque_decision', cible('fdr_pyo'));
  const noteMacrolide = 'Macrolide IV : spiramycine (AMM IV « pneumopathies aigües ») ou clarithromycine IV (hors AMM). Azithromycine non proposée en soins critiques : forme IV non disponible en France et tableau 10 discordant (article français : une seule valeur ; article anglais : deux colonnes ; diaporama : « Non »).';
  const fdrInconnu = fdr === 'inconnu';
  if (!pyo) {
    const premier = fdr === 'non' || fdr === 'autre' ? ('premiere_ligne' as const) : ('conditionnelle' as const);
    const condition = premier === 'premiere_ligne' ? undefined : 'si aucun facteur de risque de P. aeruginosa';
    f.optionsEnOrdre(
      [
        { id: 'pac-grave-c3g-spira', libelle: 'Ceftriaxone + spiramycine IV', type: 'probabiliste', condition, items: [I.CRO2, I.SPIRA_IV3], duree: DUREE_GRAVE, sources: srcBase, commentaire: `${noteMacrolide}${orient === 'grippe' ? ' Contexte grippal : pas de corticoïdes.' : ''}` },
        { id: 'pac-grave-c3g-clari', libelle: 'Ceftriaxone + clarithromycine IV (hors AMM)', type: 'probabiliste', condition, items: [I.CRO2, I.CLARI_IV], duree: DUREE_GRAVE, sources: srcBase, commentaire: 'Clarithromycine IV : AMM limitée aux mycobactéries atypiques du SIDA (hors AMM ici). Ordre des macrolides choisi par l\'application (spiramycine dans son AMM IV) : la SPILF ne les hiérarchise pas.' },
        { id: 'pac-grave-ctx-spira', libelle: 'Céfotaxime + spiramycine IV', type: 'probabiliste', condition, items: [I.CTX_SC, I.SPIRA_IV3], duree: DUREE_GRAVE, sources: srcBase, commentaire: 'Posologie du céfotaxime en soins critiques divergente (80 à 100 mg/kg/j dans l\'article, 100 mg/kg/j dans le diaporama) : brouillon.' },
      ],
      premier,
    );
  }
  if (pyo || fdrInconnu) {
    const srcPyo = [srcPyoSC, S(SP, 'p. 9', 'céfépime ou l\'association pipéracilline-tazobactam', 'choix'), S(SP, 'p. 9', 'devra également comporter une molécule active sur les bactéries atypiques (Grade B-1)', 'choix')];
    if (fdr === 'colonisation') srcPyo.unshift(S(SP, 'p. 9', 'recommandée chez les patients hospitalisés avec une PAC grave ou non grave et présentant un antécédent de colonisation ou d\'infection respiratoire récente (il y a moins d\'un an) par ce pathogène (Grade B-1)', 'choix'));
    const rang = pyo ? ('premiere_ligne' as const) : ('conditionnelle' as const);
    const condition = pyo ? undefined : 'si facteur de risque de P. aeruginosa';
    const commentaire = `${fdr === 'colonisation' ? 'Colonisation connue : choisir selon le dernier antibiogramme (C-1). ' : ''}Aztréonam et ceftazidime exclus du probabiliste (avis d'expert). Posologies de la bêta-lactamine non données par la SPILF 2025 : RCP. ${noteMacrolide}`;
    const fep = f.option({ id: 'pac-grave-pyo-fep', libelle: 'Céfépime + spiramycine IV', type: 'probabiliste', rang, condition, items: [I.FEP, I.SPIRA_IV3], duree: DUREE_GRAVE, sources: srcPyo, commentaire });
    const tzp = f.option({ id: 'pac-grave-pyo-tzp', libelle: 'Pipéracilline-tazobactam + spiramycine IV', type: 'probabiliste', rang, condition, items: [I.TZP, I.SPIRA_IV3], duree: DUREE_GRAVE, sources: srcPyo, commentaire });
    // Spiramycine IV écartée (ex. traitement allongeant le QT) : le macrolide actif sur les atypiques devient la clarithromycine IV.
    if (!fep && !tzp) {
      const c = `Spiramycine IV écartée (voir « propositions écartées ») : clarithromycine IV, hors AMM. ${commentaire}`;
      f.option({ id: 'pac-grave-pyo-fep-clari', libelle: 'Céfépime + clarithromycine IV (hors AMM)', type: 'probabiliste', rang, condition, items: [I.FEP, I.CLARI_IV], duree: DUREE_GRAVE, sources: srcPyo, commentaire: c });
      f.option({ id: 'pac-grave-pyo-tzp-clari', libelle: 'Pipéracilline-tazobactam + clarithromycine IV (hors AMM)', type: 'probabiliste', rang, condition, items: [I.TZP, I.CLARI_IV], duree: DUREE_GRAVE, sources: srcPyo, commentaire: c });
    }
    if (pyo) f.controle({ id: 'ctl-pac-grave-pyo-doc', type: 'prelevement', categorie: 'indique', quoi: 'Documentation bactériologique (prélèvement respiratoire)', quand: { ancre: 'avant_traitement', texte: 'Avant l\'antibiothérapie' }, pourquoi: 'Bêta-lactamine anti-P. aeruginosa.', sources: [S(SP, 'p. 9', 'fortement recommandé de réaliser des examens de documentation bactériologique', 'controle_micro')] });
    if (pyo && al.ciBL) f.avis('PAC grave avec facteur de risque de P. aeruginosa et allergie aux bêta-lactamines : aucun schéma précisé par la SPILF 2025 ; avis infectiologique.', true, srcPyo);
  }
  if (!pyo) {
    const premiere = al.c3g || al.macro;
    f.option({ id: 'pac-grave-levo', libelle: 'Lévofloxacine IV en monothérapie (allergie)', type: 'probabiliste', rang: premiere ? 'premiere_ligne' : 'conditionnelle', condition: premiere ? undefined : 'en cas d\'allergie aux C3G (bêta-lactamines) ou aux macrolides', items: [I.LEVO_SC], duree: DUREE_GRAVE, sources: [srcBase[0], S(SPD, 'diapo 13', 'Lévofloxacine (uniquement si allergie contre indiquant l\'utilisation de bêta-lactamines)', 'choix'), SRC.ansmFq, SRC.spiraIvCi], commentaire: `${TEXTE_LEVO} ${TEXTE_SPIRA_LEVO}` });
  }
}

function lpv(ctx: ContexteDecision, f: FichePneumonie, al: ReturnType<typeof allergies>) {
  const src = [S(SP, 'tableau 9, p. 7', 'C3G parentérale (céfotaxime ou ceftriaxone) + macrolide + linézolide', 'choix'), S(SP, '§2-3, p. 7', 'nécessite l\'utilisation d\'une molécule avec une activité anti-toxinique (Tableau 9) (Grade B-1)', 'choix')];
  f.avis('Suspicion de pneumonie à S. aureus producteur de LPV : avis infectiologique ; le linézolide se débute à l\'hôpital après avis d\'un spécialiste (RCP).', true, [SRC.lzdAvis]);
  const sa = ctx.hemocultures.find((h) => groupe(h) === 's_aureus');
  if (sa) {
    // Bactériémie à S. aureus : la règle du germe donne les options ; le schéma anti-toxinique propre à la PAC grave
    // à S. aureus producteur de LPV (seule exception à la monothérapie après documentation) reste signalé ici.
    const meti = statutMeticilline(lireAntibiogramme(sa));
    if (meti === 'R')
      f.optionPropre({ id: 'pac-grave-lpv-sarm-lzd', libelle: 'Linézolide en monothérapie (PAC grave à SARM producteur de LPV)', type: 'documente', rang: 'premiere_ligne', items: [I.LZD], duree: DUREE_GRAVE, sources: [SRC.sarmLpv], commentaire: 'SPILF 2025 : monothérapie par linézolide dans la pneumonie grave à SARM producteur de LPV ; alternative du tableau 9 : vancomycine + clindamycine ou rifampicine (clindamycine absente de la base). Durée : celle de la bactériémie à S. aureus (règle du germe).' });
    else {
      f.alerte('attention', 'PAC grave à SASM producteur de LPV : pénicilline M (IV) ou céfazoline + clindamycine ou rifampicine (SPILF 2025, tableau 9), seule exception à la monothérapie après documentation. La règle de bactériémie à S. aureus ne propose pas l\'anti-toxinique ; clindamycine absente de la base : avis infectiologique.', [SRC.sasmLpv, SRC.documentation]);
      if (meti === undefined)
        f.optionPropre({ id: 'pac-grave-lpv-sa-lzd', libelle: 'Linézolide (anti-toxinique, LPV) en attendant la sensibilité à la méticilline', type: 'probabiliste', rang: 'conditionnelle', condition: 'monothérapie si SARM producteur de LPV (SPILF 2025) ; si SASM : schéma pénicilline M ou céfazoline + clindamycine ou rifampicine', items: [I.LZD], duree: DUREE_GRAVE, sources: [SRC.sarmLpv, SRC.sasmLpv, ...src], commentaire: 'Sensibilité à la méticilline inconnue : décision avec l\'infectiologue.' });
    }
    return;
  }
  f.optionsEnOrdre([
    { id: 'pac-grave-lpv', libelle: 'Ceftriaxone + spiramycine IV + linézolide (LPV)', type: 'probabiliste', items: [I.CRO2, I.SPIRA_IV3, I.LZD], duree: DUREE_GRAVE, sources: src, commentaire: 'Alternative de la SPILF 2025 (tableau 9) : C3G + vancomycine + clindamycine — clindamycine non disponible dans cette version de la base.' },
    { id: 'pac-grave-lpv-clari', libelle: 'Ceftriaxone + clarithromycine IV (hors AMM) + linézolide (LPV)', type: 'probabiliste', items: [I.CRO2, I.CLARI_IV, I.LZD], duree: DUREE_GRAVE, sources: src, commentaire: 'Macrolide du tableau 9 non précisé ; clarithromycine IV hors AMM (brouillon).' },
  ]);
  f.option({ id: 'pac-grave-lpv-allergie', libelle: 'Lévofloxacine + linézolide (LPV, allergie aux bêta-lactamines)', type: 'probabiliste', rang: al.c3g ? 'premiere_ligne' : 'conditionnelle', condition: al.c3g ? undefined : 'en cas d\'allergie aux bêta-lactamines', items: [I.LEVO_SC, I.LZD], duree: DUREE_GRAVE, sources: [S(SP, 'tableau 9, p. 7', 'En cas d\'allergie aux bêta-lactamines : lévofloxacine + linézolide', 'choix')], commentaire: TEXTE_LEVO });
  f.reeval('Documentation : SASM producteur de LPV → pénicilline M (IV) ou céfazoline + clindamycine ou rifampicine ; SARM producteur de LPV → linézolide en monothérapie.', [SRC.sasmLpv, SRC.sarmLpv]);
}

/* ------------------------------ Légionellose ------------------------------ */

function legionellose(ctx: ContexteDecision, f: FichePneumonie, lieu: string, grave: Gravite) {
  const al = allergies(ctx);
  const immuno = ctx.dossier.patient.immunodepression;
  const libGrave = grave === true ? ' grave' : grave === false ? ' non grave' : ' (gravité à préciser)';
  f.situation('legionellose', `Légionellose${libGrave}${immuno === 'oui' ? ', patient immunodéprimé' : immuno === 'inconnu' ? ', immunodépression non renseignée' : ''}`, grave === 'inconnu' || immuno === 'inconnu' ? 'partielle' : 'couverte', 'SPILF 2026 (diaporama ; article non trouvé) et SPILF 2025 (tableau 7) : monothérapie ; macrolide (azithromycine) si forme non grave chez l\'immunocompétent ; lévofloxacine si forme grave ou immunodépression. Durées suggérées : durée optimale non démontrée.');
  f.geste('Légionellose : maladie à déclaration obligatoire.', [S(LEG, 'diapo 2', 'Maladie à déclaration obligatoire', 'geste')]);
  f.controle({ id: 'ctl-legio-ag', type: 'prelevement', categorie: 'indique', quoi: 'Antigénurie Legionella', quand: { ancre: 'avant_traitement', texte: 'Au diagnostic' }, pourquoi: 'Test diagnostique de référence ; ne détecte que le sérogroupe 1 (sensibilité < 50 % dans les formes modérées).', ensuite: 'Négative avec suspicion persistante : PCR sur prélèvement respiratoire profond.', sources: [S(LEG, 'diapo 3', 'Antigénurie : test diagnostique de référence', 'controle_micro'), S(LEG, 'diapo 3', 'Ne détecte que le sérogroupe Lp1', 'controle_micro')] });
  f.controle({ id: 'ctl-legio-pcr', type: 'prelevement', categorie: 'conditionnel', quoi: 'PCR Legionella sur prélèvement respiratoire profond (pas de sérologie)', quand: { ancre: 'avant_traitement', texte: 'Si l\'antigénurie est négative ou pour documenter la souche' }, pourquoi: 'PCR uniquement sur prélèvements respiratoires profonds ; la sérologie n\'est pas recommandée.', sources: [S(LEG, 'diapo 3', 'PCR uniquement sur prélèvements respiratoires profonds', 'controle_micro'), S(LEG, 'diapo 3', 'La sérologie légionnelle n\'est pas recommandée', 'controle_micro')] });
  f.alerte('info', 'Légionellose : bithérapie non recommandée ; rifampicine sans indication ; doxycycline d\'efficacité non démontrée.', [S(LEG, 'diapo 5', 'Bithérapie non recommandée', 'choix'), S(LEG, 'diapo 8', 'Pas d\'indication dans la légionellose', 'choix')]);
  const srcChoix = S(LEG, 'diapo 5', 'Forme grave et/ou patient immunodéprimé : Lévofloxacine en monothérapie ; Alternatives : Clarithromycine ou Spiramycine', 'choix');
  if (grave === 'inconnu') f.manque('critères de pneumonie grave (1 majeur ou 3 mineurs)', 'légionellose : macrolide si forme non grave chez l\'immunocompétent, lévofloxacine si forme grave (SPILF 2026)', 'bloque_decision', cible('grave'));
  if (immuno === 'inconnu')
    f.manque('immunodépression', grave === true ? 'légionellose grave : durée de 7 jours, ou de 10 jours chez l\'immunodéprimé (SPILF 2026)' : 'légionellose non grave : azithromycine chez l\'immunocompétent, lévofloxacine chez l\'immunodéprimé (SPILF 2026)', grave === true ? 'bloque_duree' : 'bloque_decision', 'patient.immunodepression');
  if (grave === true) {
    communGrave(ctx, f, 'legionellose', lieu);
    f.reeval('Relais oral dès la stabilité clinique.', [S(LEG, 'diapo 11', '*Relais oral dès stabilité clinique', 'choix')], 72);
  }
  const srcDiapo10 = S(LEG, 'diapo 10', 'Durée optimale de l\'antibiothérapie non démontrée', 'duree');
  const d = (n: number, extrait: string, texte?: string) => jours(n, [S(LEG, 'diapo 11', extrait, 'duree'), srcDiapo10], `${texte ?? `${n} jours`} (durée suggérée ; durée optimale non démontrée)`);
  const nonPrecisee = (cas: string): DureeDecidee => ({ texte: `Durée non précisée par le diaporama SPILF 2026 pour cette molécule ${cas}`, pointDeDepart: 'premier jour de traitement', sources: [srcDiapo10] });
  const srcLevoMacro = S(SP, 'tableau 7, p. 6', 'Légionellose : Macrolide* ; Si forme grave ou contre-indication aux macrolides : lévofloxacine', 'choix');
  const g = grossesse(ctx);

  const nonGraveImmunocompetent = () => {
    const ex = 'Forme non grave, immunocompétent : 3 jours si Azithromycine ; 7 jours si Clarithromycine, Roxithromycine, Spiramycine ou Lévofloxacine (si CI aux macrolides)';
    const src = [S(LEG, 'diapo 5', 'Forme non grave, patient non immunodéprimé : Traitement possible en ambulatoire ; Macrolide en monothérapie : Azithromycine', 'choix'), srcLevoMacro];
    const azi = { id: 'legio-azi', libelle: 'Azithromycine (hors AMM)', type: 'probabiliste' as const, items: [I.AZI500], duree: d(3, ex), sources: [...src, SRC_AZI_RESISTANCE], commentaire: `Hors AMM : la pneumonie ne figure pas dans les indications du RCP ZITHROMAX 250 mg. ${TEXTE_AZI_RESISTANCE} Traitement possible en ambulatoire. Roxithromycine (alternative citée) : RCP non lu.` };
    const clari = { id: 'legio-clari', libelle: 'Clarithromycine', type: 'probabiliste' as const, items: [I.CLARI], duree: d(7, ex), sources: src };
    const spira = { id: 'legio-spira', libelle: 'Spiramycine', type: 'probabiliste' as const, items: [I.SPIRA], duree: d(7, ex), sources: src, commentaire: `SPILF 2026 : 1,5 à 3 MUI × 3/j hors soins critiques.${g ? ` ${TEXTE_GROSSESSE_MACRO}` : ''}` };
    f.optionsEnOrdre(g ? [spira, azi, clari] : [azi, clari, spira]);
    f.option({ id: 'legio-levo', libelle: 'Lévofloxacine (contre-indication aux macrolides)', type: 'probabiliste', rang: al.macro ? 'premiere_ligne' : 'conditionnelle', condition: al.macro ? undefined : 'si contre-indication aux macrolides', items: [I.LEVO], duree: d(7, ex), sources: [srcLevoMacro, SRC.ansmFq], commentaire: TEXTE_LEVO });
  };
  const nonGraveImmunodeprime = () => {
    const ex = 'Patients immunodéprimés non graves : 5 jours si Azithromycine, 10 jours si Lévofloxacine ou Clarithromycine';
    f.option({ id: 'legio-id-levo', libelle: 'Lévofloxacine (patient immunodéprimé)', type: 'probabiliste', rang: 'premiere_ligne', items: [I.LEVO], duree: d(10, ex), sources: [srcChoix, SRC.ansmFq], commentaire: `${TEXTE_LEVO} Le même diaporama donne aussi une durée pour l'azithromycine chez l'immunodéprimé non grave (5 jours, diapo 11) alors que la diapo 5 retient la lévofloxacine : incohérence interne non tranchée, azithromycine non proposée.` });
    f.option({ id: 'legio-id-clari', libelle: 'Clarithromycine (patient immunodéprimé)', type: 'probabiliste', rang: 'alternative', items: [I.CLARI], duree: d(10, ex), sources: [srcChoix] });
    f.option({ id: 'legio-id-spira', libelle: 'Spiramycine (patient immunodéprimé)', type: 'probabiliste', rang: 'alternative', items: [I.SPIRA], statut: 'brouillon', duree: nonPrecisee('chez l\'immunodéprimé non grave (seules l\'azithromycine, la lévofloxacine et la clarithromycine ont une durée suggérée).'), sources: [srcChoix] });
  };
  const formeGrave = () => {
    const id = immuno === 'oui';
    const ex = id ? 'Patients immunodéprimés graves* : 10 jours : Lévofloxacine IV ou Clarithromycine IV' : 'Pneumonie grave* : 7 jours : Spiramycine IV ou Clarithromycine IV ou Lévofloxacine IV';
    const n = id ? 10 : 7;
    const duree = immuno === 'inconnu' ? { ...d(7, 'Pneumonie grave* : 7 jours : Spiramycine IV ou Clarithromycine IV ou Lévofloxacine IV'), texte: '7 jours (forme grave), 10 jours chez l\'immunodéprimé (durées suggérées ; durée optimale non démontrée) : immunodépression à préciser', dureePrevueJours: undefined } : d(n, ex);
    f.option({ id: 'legio-g-levo', libelle: 'Lévofloxacine IV en monothérapie', type: 'probabiliste', rang: 'premiere_ligne', items: [I.LEVO_SC], duree, sources: [srcChoix, srcLevoMacro, SRC.ansmFq, SRC.spiraIvCi], commentaire: `${TEXTE_LEVO} Pas de bithérapie. ${TEXTE_SPIRA_LEVO}` });
    f.option({ id: 'legio-g-spira', libelle: 'Spiramycine IV', type: 'probabiliste', rang: 'alternative', items: [I.SPIRA_IV3], statut: id ? 'brouillon' : undefined, duree: id ? nonPrecisee('chez l\'immunodéprimé grave (seules la lévofloxacine et la clarithromycine IV ont une durée suggérée).') : duree, sources: [srcChoix], commentaire: 'Contre-indiquée avec la lévofloxacine et les autres médicaments donnant des torsades de pointes (RCP de la forme IV) : attention au relais.' });
    f.option({ id: 'legio-g-clari', libelle: 'Clarithromycine IV (hors AMM)', type: 'probabiliste', rang: 'alternative', items: [I.CLARI_IV], duree, sources: [srcChoix], commentaire: 'Hors AMM : l\'AMM de la forme IV se limite aux mycobactéries atypiques du SIDA.' });
  };

  if (grave === true) return formeGrave();
  const formeNG = grave === 'inconnu' ? 'si forme non grave' : undefined;
  if (immuno === 'non') f.sous(formeNG, nonGraveImmunocompetent);
  else if (immuno === 'oui') f.sous(formeNG, nonGraveImmunodeprime);
  else {
    f.sous([formeNG, 'si patient immunocompétent'].filter(Boolean).join(' ; '), nonGraveImmunocompetent);
    f.sous([formeNG, 'si patient immunodéprimé'].filter(Boolean).join(' ; '), nonGraveImmunodeprime);
  }
  if (grave === 'inconnu') f.sous('si forme grave', formeGrave);
}

/* -------------------------- Pneumonie d'inhalation -------------------------- */

function inhalation(ctx: ContexteDecision, f: FichePneumonie, lieu: string, grave: Gravite) {
  const al = allergies(ctx);
  f.situation('pneumonie-inhalation', `Pneumonie d'inhalation${grave === true ? ' grave' : grave === 'inconnu' ? ' (gravité à préciser)' : ''}`, grave === 'inconnu' ? 'partielle' : 'couverte', 'SPILF/SFGG 2025 (diaporama ; article non lisible) : amoxicilline-acide clavulanique en 1re intention, pas de métronidazole ; forme grave : pipéracilline-tazobactam si facteur de risque de P. aeruginosa, sinon schéma de la PAC grave (ERS/ESICM 2023) ; 5 jours si évolution favorable à 72 h.');
  if (lieu === 'ambulatoire') f.alerte('attention', 'La pneumonie d\'inhalation fait partie des critères d\'hospitalisation de 2010.', [S(AF, 'figure 1, p. 2', 'pneumonie d\'inhalation ou sur obstacle trachéo-bronchique connu ou suspecté', 'definition')]);
  if (lieu === 'inconnu') f.manque('lieu de prise en charge (ambulatoire, hospitalisation, soins critiques)', 'pneumonie d\'inhalation : critère d\'hospitalisation (Afssaps 2010) ; schéma de la forme grave différent', 'bloque_decision', cible('lieu'));
  if (grave === 'inconnu') f.manque('critères de pneumonie grave (1 majeur ou 3 mineurs)', 'pneumonie d\'inhalation : schéma de la forme grave différent (SPILF/SFGG 2025, diapo 10)', 'bloque_decision', cible('grave'));
  f.controle({ id: 'ctl-inh-scanner', type: 'imagerie', categorie: 'indique', quoi: 'Scanner thoracique sans injection', quand: { ancre: 'non_determine', texte: 'En priorité' }, pourquoi: 'Imagerie de la pneumonie d\'inhalation.', sources: [S(INH, 'diapo 6', 'En priorité un scanner thoracique sans injection', 'imagerie')] });
  f.controle({ id: 'ctl-inh-micro', type: 'prelevement', categorie: 'non_systematique', quoi: 'Examens bactériologiques, antigénuries pneumocoque et Legionella', quand: { ancre: 'non_determine', texte: 'Pas d\'examen systématique' }, pourquoi: 'Aucun examen bactériologique systématique ; antigénuries non recommandées.', sources: [S(INH, 'diapo 7', 'Aucun examen complémentaire bactériologique systématique n\'est recommandé', 'controle_micro'), S(INH, 'diapo 7', 'Les antigénuries (pneumocoque et légionelle) ne sont pas recommandées', 'controle_micro')] });
  f.controle({ id: 'ctl-inh-ecbc', type: 'prelevement', categorie: 'conditionnel', quoi: 'ECBC', quand: { ancre: 'avant_traitement', texte: 'Avant toute antibiothérapie active sur P. aeruginosa' }, pourquoi: 'Documentation avant un traitement anti-P. aeruginosa.', sources: [S(INH, 'diapo 7', 'Un ECBC doit être réalisé avant l\'initiation d\'une antibiothérapie à activité anti-P. aeruginosa', 'controle_micro')] });
  f.geste('Réévaluer les médicaments favorisant l\'inhalation : psychotropes, anticholinergiques, inhibiteurs de la pompe à protons.', [S(INH, 'diapo 14', 'Les inhibiteurs de la pompe à proton', 'geste')]);
  f.alerte('info', 'Pas de métronidazole ni de traitement anti-anaérobie spécifique (SPILF/SFGG 2025 ; ERS/ESICM 2023).', [S(INH, 'diapo 8', 'Il est recommandé de ne pas associer le métronidazole', 'choix'), SRC.ersAspiration]);
  if (grave === true) communGrave(ctx, f, 'inhalation', lieu, false);
  const stab = r(ctx, 'pneumonie.stabilite');
  const srcD = [S(INH, 'diapo 13', '5 jours en cas d\'évolution clinique favorable', 'duree'), S(INH, 'diapo 13', 'La persistance de la toux n\'est pas un critère de non-amélioration', 'duree')];
  const duree: DureeDecidee =
    stab === 'j3_j5' || stab === 'non'
      ? { texte: 'Évolution non favorable à 72 h : durée non précisée par la SPILF/SFGG 2025 (relais par pipéracilline-tazobactam) ; à décider avec le SMIT.', pointDeDepart: 'premier jour de traitement', sources: srcD }
      : jours(5, srcD, '5 jours si l\'évolution est favorable à 72 h (tous les critères de stabilité clinique) ; la persistance de la toux n\'est pas un critère de non-amélioration');
  const dureeGrave: DureeDecidee = {
    texte: 'Forme grave : durée non fixée (le diaporama SPILF/SFGG 2025 indique 5 jours en cas d\'évolution favorable à 72 h sans viser la forme grave ; la SPILF 2025 ne fixe pas la durée de la PAC grave) : à décider à la réévaluation, avec le réanimateur ou le SMIT.',
    pointDeDepart: 'premier jour de traitement',
    sources: [...srcD, SRC.champ3j],
  };
  f.reeval('Évaluation à 72 h par les critères de stabilité clinique ; sans évolution favorable : relais par pipéracilline-tazobactam.', [S(INH, 'diapo 9', 'Relais par pipéracilline – tazobactam', 'choix')], 72);
  const commentaireAmc = 'Paliers rénaux divergents : diaporama SPILF/SFGG (DFG 10-30 : 1 g en dose de charge puis 0,5 g toutes les 8 h ; < 10 : 0,5 g toutes les 24 h) et RCP affiché ci-dessous (ClCr 10-30 : 500 mg × 2/j) — non tranché.';
  const srcAmc = [S(INH, 'diapo 8', 'Traitement de première intention : amoxicilline - ac. clavulanique PO ou IV', 'choix')];
  const nonGrave = () => {
    f.option({ id: 'inh-amc', libelle: 'Amoxicilline-acide clavulanique per os ou IV', type: 'probabiliste', rang: 'premiere_ligne', items: [I.AMC], duree, sources: srcAmc, commentaire: commentaireAmc });
    f.option({ id: 'inh-cro', libelle: 'Ceftriaxone IV ou SC en monothérapie', type: 'probabiliste', rang: al.penicillineSeule ? 'premiere_ligne' : 'conditionnelle', condition: al.penicillineSeule ? undefined : 'allergie à la pénicilline sans contre-indication aux C3G, ou voies orale et IV impossibles (voie SC)', items: [I.CRO1], duree, sources: [S(INH, 'diapo 8', 'Allergie à la pénicilline sans contre-indication à l\'utilisation des C3G : ceftriaxone IV ou SC en monothérapie', 'choix'), S(INH, 'diapo 8', 'Impossibilité d\'utiliser la voie orale et IV : ceftriaxone SC en monothérapie', 'choix')], commentaire: 'Voie SC citée par la SPILF/SFGG 2025 : non rapprochée du RCP dans la note de recherche (à vérifier).' });
    f.option({ id: 'inh-sxt', libelle: 'Cotrimoxazole per os ou IV', type: 'probabiliste', rang: al.ciBL ? 'premiere_ligne' : 'conditionnelle', condition: al.ciBL ? undefined : 'contre-indication aux bêta-lactamines', items: [I.SXT_INH], duree, sources: [S(INH, 'diapo 8', 'Contre-indication aux bétalactamines : cotrimoxazole PO ou IV', 'choix')], commentaire: 'Paliers rénaux divergents : diaporama (DFG 15-30 : 800 mg toutes les 24 h ; < 15 : 800 mg toutes les 48 h) et RCP affiché ci-dessous (< 15 hors dialyse : ne pas utiliser) — non tranché. Indication dans la pneumonie d\'inhalation non rapprochée du RCP dans la note de recherche.' });
  };
  const formeGrave = () => {
    const fdr = r(ctx, 'pneumonie.fdr_pyo');
    const sarm = r(ctx, 'pneumonie.sarm');
    const pyo = fdr === 'colonisation' || fdr === 'autre';
    if (fdr === 'inconnu') f.manque('facteur de risque de P. aeruginosa (colonisation < 1 an, antibiothérapie parentérale < 3 mois, BPCO sévère, bronchectasies, trachéotomie)', 'pneumonie d\'inhalation grave : pipéracilline-tazobactam si au moins un facteur (SPILF/SFGG 2025)', 'bloque_decision', cible('fdr_pyo'));
    if (sarm === 'inconnu') f.manque('colonisation connue à SARM', 'pneumonie d\'inhalation grave : ajout du linézolide si colonisation à SARM (SPILF/SFGG 2025)', 'affine', cible('sarm'));
    const plusLzd = sarm === 'oui' ? [I.LZD] : [];
    const libLzd = sarm === 'oui' ? ' + linézolide' : '';
    const srcLzd = sarm === 'oui' ? [S(INH, 'diapo 10', 'Patients précédemment connu colonisé à SARM', 'choix'), S(INH, 'diapo 10', 'Ajout du linezolide', 'choix')] : [];
    if (pyo || fdr === 'inconnu')
      f.option({ id: 'inh-g-tzp', libelle: `Pipéracilline-tazobactam${libLzd}`, type: 'probabiliste', rang: pyo ? 'premiere_ligne' : 'conditionnelle', condition: pyo ? undefined : 'si au moins un facteur de risque de P. aeruginosa', items: [I.TZP_INH, ...plusLzd], duree: dureeGrave, sources: [S(INH, 'diapo 10', 'Piperacilline-tazobactam en traitement probabiliste', 'choix'), ...srcLzd], commentaire: 'ECBC avant l\'antibiothérapie anti-P. aeruginosa.' });
    if (!pyo) {
      // Sans facteur de P. aeruginosa : schéma standard de la PAC grave (ERS/ESICM 2023 Q8 ; SPILF/SFGG : mécanisme
      // incertain → SPILF 2025 PAC grave). L'amoxicilline-acide clavulanique (1re intention générale) reste conditionnelle.
      const premier = fdr === 'non' ? ('premiere_ligne' as const) : ('conditionnelle' as const);
      const condition = fdr === 'non' ? undefined : 'si aucun facteur de risque de P. aeruginosa';
      const srcPacGrave = [S(SP, '§2-3, p. 7', 'C3G injectable associée à un macrolide ou, en cas d\'allergie à l\'une des deux classes médicamenteuses, monothérapie par fluoroquinolone antipneumococcique (lévofloxacine) (Grade B-1)', 'choix'), SRC.ersAspiration, SRC.inhMecanisme];
      f.optionsEnOrdre(
        [
          { id: 'inh-g-c3g-spira', libelle: `Ceftriaxone + spiramycine IV${libLzd} (schéma de la PAC grave)`, type: 'probabiliste', condition, items: [I.CRO2, I.SPIRA_IV3, ...plusLzd], duree: dureeGrave, sources: [...srcPacGrave, ...srcLzd], commentaire: 'ERS/ESICM 2023 : schéma standard de la PAC grave en cas de facteur de risque d\'inhalation, sans traitement anti-anaérobie spécifique.' },
          { id: 'inh-g-c3g-clari', libelle: `Ceftriaxone + clarithromycine IV (hors AMM)${libLzd} (schéma de la PAC grave)`, type: 'probabiliste', condition, items: [I.CRO2, I.CLARI_IV, ...plusLzd], duree: dureeGrave, sources: [...srcPacGrave, ...srcLzd], commentaire: 'Clarithromycine IV : hors AMM.' },
        ],
        premier,
      );
      f.option({ id: 'inh-g-amc', libelle: `Amoxicilline-acide clavulanique IV${libLzd}`, type: 'probabiliste', rang: 'conditionnelle', condition: `1re intention générale de la pneumonie d'inhalation, sans schéma propre à la forme grave${condition ? ` ; ${condition}` : ''}`, items: [I.AMC_SC, ...plusLzd], statut: 'brouillon', duree: dureeGrave, sources: [...srcAmc, SRC.inhMecanisme, ...srcLzd], commentaire: `Le diaporama SPILF/SFGG ne donne pas de schéma propre à la forme grave sans facteur de risque de P. aeruginosa ; posologie en soins critiques divergente (tableau 10 : 1 ou 2 g × 3/j ; diaporama PAC : 2 g × 3/j). ${commentaireAmc}` });
      f.option({ id: 'inh-g-levo', libelle: `Lévofloxacine IV${libLzd} (allergie, schéma de la PAC grave)`, type: 'probabiliste', rang: al.c3g || al.macro ? 'premiere_ligne' : 'conditionnelle', condition: al.c3g || al.macro ? condition : `en cas d'allergie aux C3G (bêta-lactamines) ou aux macrolides${condition ? ` ; ${condition}` : ''}`, items: [I.LEVO_SC, ...plusLzd], duree: dureeGrave, sources: [...srcPacGrave, SRC.ansmFq, ...srcLzd], commentaire: TEXTE_LEVO });
    }
  };
  if (grave !== true) f.sous(grave === 'inconnu' ? 'si forme non grave' : undefined, nonGrave);
  if (grave !== false) f.sous(grave === 'inconnu' ? 'si forme grave' : undefined, formeGrave);
}

/* ------------------------------------------------------------------ */
/* Pneumonies associées aux soins                                      */
/* ------------------------------------------------------------------ */

function associeeAuxSoins(ctx: ContexteDecision, f: Fiche) {
  const lieu = r(ctx, 'pneumonie.soins_lieu');
  if (lieu === 'inconnu') {
    f.situation('pneumonie-soins-a-preciser', 'Pneumonie associée aux soins : lieu de survenue à préciser', 'partielle', 'Réanimation (PAVM ou pneumonie acquise à l\'hôpital grave) : RFE SFAR/SRLF 2017 ; hors réanimation : aucun texte français.');
    f.manque('lieu de survenue (réanimation sous ventilation, réanimation sans ventilation, hors réanimation)', 'seule la pneumonie de réanimation a une recommandation française (SFAR/SRLF 2017)', 'bloque_decision', cible('soins_lieu'));
    return;
  }
  if (lieu === 'hors_rea') return horsReanimation(f);
  return reanimation(ctx, f, lieu);
}

function horsReanimation(f: Fiche) {
  const src = [
    S(ERS17, 'Q2', 'We suggest using narrow-spectrum antibiotics (ertapenem, ceftriaxone, cefotaxime, moxifloxacin or levofloxacin) in patients with suspected low risk of resistance and early-onset HAP/VAP', 'choix'),
    S(ERS17, 'Q3', 'We recommend initial empiric combination therapy for high-risk HAP/VAP patients', 'choix'),
    S(IDSA16, 'HAP', 'Only one risk factor was significantly associated with MDR HAP: prior intravenous antibiotic use', 'choix'),
  ];
  f.situation('pneumonie-nosocomiale-hors-rea', 'Pneumonie associée aux soins hors réanimation', 'partielle', 'Aucune recommandation française : la RFE SFAR/SRLF 2017 est limitée à la réanimation. Pas de schéma proposé : avis du SMIT.');
  f.alerte('attention', 'Pneumonie acquise hors de l\'hôpital (EHPAD, soins ambulatoires) ou dans les 48 premières heures d\'hospitalisation : elle est communautaire (Afssaps 2010) et relève des schémas de la PAC — choisir le contexte « communautaire ».', [SRC.definition]);
  f.absence('Pneumonie associée aux soins hors réanimation', 'Recherche du 2026-11-06 : aucun texte français (SFAR/SRLF 2017 limitée à la réanimation). Recoupement non transposé : ERS/ESICM 2017 (spectre étroit si faible risque de résistance et début précoce, association si haut risque), IDSA/ATS 2016 (seul facteur de risque de BMR : antibiothérapie IV récente ; 7 jours).', ['Avis du SMIT pour le choix probabiliste', 'Prélèvements respiratoires avant l\'antibiothérapie'], src);
  f.avis('Avis du SMIT : pneumonie associée aux soins hors réanimation (aucune recommandation française).', false, src);
}

function reanimation(ctx: ContexteDecision, f: Fiche, lieu: string) {
  const p = ctx.dossier.patient;
  const al = allergies(ctx);
  f.situation('pneumonie-associee-soins-rea', lieu === 'pavm' ? 'Pneumonie acquise sous ventilation mécanique (PAVM)' : 'Pneumonie associée aux soins de réanimation', 'partielle', 'RFE SFAR/SRLF 2017 (aucune actualisation trouvée) : monothérapie probabiliste sauf facteur de risque de BMR ou choc ; schémas du protocole n° 4 = avis d\'experts, posologies « à titre indicatif » et correspondance molécule/posologie reconstituée (brouillon).');
  const srcR31 = S(SFAR, 'R3.1', 'immédiatement en cas de suspicion de pneumonie avec signes de gravité hémodynamique (choc), respiratoire (syndrome de détresse respiratoire aigu) ou de terrain fragile (immunodépression). GRADE 2+', 'choix');
  f.controle({ id: 'ctl-pavm-prelevement', type: 'prelevement', categorie: 'indique', quoi: 'Prélèvement microbiologique des voies aériennes (quel que soit le type)', quand: { ancre: 'avant_traitement', texte: 'Avant toute introduction ou modification de l\'antibiothérapie' }, pourquoi: 'Documentation de la pneumonie associée aux soins.', sources: [S(SFAR, 'R2.2', 'Il faut probablement réaliser des prélèvements microbiologiques des voies aériennes, quel que soit le type, avant toute introduction ou modification de l\'antibiothérapie. GRADE 2+', 'controle_micro')] });
  f.controle({ id: 'ctl-pavm-pct', type: 'autre', categorie: 'non_systematique', quoi: 'Procalcitonine, TREM-1 soluble, scores cliniques (CPIS)', quand: { ancre: 'non_determine', texte: 'Pas pour le diagnostic' }, pourquoi: 'Non recommandés pour diagnostiquer la pneumonie associée aux soins.', sources: [S(SFAR, 'R2.3', 'procalcitonine ou alvéolaires de TREM-1 soluble pour diagnostiquer', 'controle_micro'), S(SFAR, 'R2.1', 'Il ne faut probablement pas utiliser les scores cliniques (CPIS, CPIS modifié) pour le diagnostic', 'controle_micro')] });
  f.alerte('info', 'Corticoïdes : aucune recommandation dans la pneumonie associée aux soins de réanimation (SFAR/SRLF 2017).', [S(SFAR, 'corticoïdes', 'Aucune recommandation n\'a donc été proposée', 'geste')]);
  const choc = p.gravite === 'choc_septique';
  if (choc || p.immunodepression === 'oui') f.urgence('immediate').alerte('urgence', 'Pneumonie associée aux soins avec choc ou chez un patient immunodéprimé : prélever puis traiter immédiatement.', [srcR31]);
  const srcR32court = S(SFAR, 'R3.2', 'Il faut traiter par monothérapie en probabiliste les pneumonies associées aux soins du patient immunocompétent sous ventilation mécanique', 'choix');
  if (p.immunodepression === 'oui')
    f.alerte('attention', 'Patient immunodéprimé : la monothérapie probabiliste de la SFAR/SRLF (R3.2) ne vise que le patient immunocompétent ; avis infectiologique.', [srcR32court]).avis('Avis infectiologique (pneumonie associée aux soins, patient immunodéprimé).', true, [srcR31]);
  const delai = r(ctx, 'pneumonie.delai');
  const rep = r(ctx, 'pneumonie.fdr_bmr');
  // Ancienne réponse « oui » (BMR ou BGN non fermentant) : colonne « tardive ou BGN non fermentant », comme avant.
  const fdrBase = rep === 'oui' ? 'bgn_nf' : rep;
  // Épuration extrarénale au diagnostic : facteur de risque de BMR (argumentaire R3.2).
  const fdr = p.renal.dialyse === 'eer_continue' && fdrBase !== 'bgn_nf' ? 'bmr' : fdrBase;
  const sarm = r(ctx, 'pneumonie.sarm');
  const blse = p.antecedentsMicro.some((a) => a.resistance === 'BLSE');
  if (delai === 'inconnu') f.manque('délai d\'apparition (< 5 jours ou ≥ 5 jours)', 'schéma probabiliste de la SFAR/SRLF 2017 (précoce ou tardive)', 'bloque_decision', cible('delai'));
  if (fdr === 'inconnu') f.manque('facteur de risque de BMR ou de BGN non fermentant', 'monothérapie ou association (SFAR/SRLF 2017, R3.2)', 'bloque_decision', cible('fdr_bmr'));
  if (sarm === 'inconnu') f.manque('facteur de risque de SARM', 'ajout d\'un anti-SARM seulement en présence d\'un facteur de risque (SFAR/SRLF 2017, R3.3)', 'affine', cible('sarm'));
  type Colonne = 'mono' | 'choc' | 'pyo' | 'bmr_precoce' | undefined;
  const colonne: Colonne = delai === 'tardive' || fdr === 'bgn_nf' ? 'pyo' : delai === 'precoce' && fdr === 'bmr' ? 'bmr_precoce' : delai === 'precoce' && fdr === 'non' ? (choc ? 'choc' : 'mono') : undefined;
  const srcProto = S(SFAR, 'protocole n° 4, p. 23', 'Posologies données à titre indicatif pour un patient avec fonction rénale normale et poids standard', 'choix');
  const srcR32 = S(SFAR, 'R3.2', 'Il faut traiter par monothérapie en probabiliste les pneumonies associées aux soins du patient immunocompétent sous ventilation mécanique, en dehors de la présence de facteurs de risque de bactéries multirésistantes', 'choix');
  const srcBi = S(SFAR, 'argumentaire R3.2, p. 18', 'En présence d\'au moins un de ces facteurs de risque, la bithérapie lors du traitement probabiliste est indiquée', 'choix');
  const srcR33 = S(SFAR, 'R3.3', 'Les experts suggèrent de ne pas utiliser de manière probabiliste et systématique un antibiotique actif contre Staphylococcus aureus résistant à la méticilline', 'choix');
  const ajoutSarm = sarm === 'oui' ? [I.VAN_PAVM] : [];
  const libSarm = sarm === 'oui' ? ' + vancomycine' : '';
  const noteSarm = sarm === 'oui' ? ' Facteur de risque de SARM : vancomycine ajoutée (ou linézolide 600 mg × 2/j) à la dose du protocole SFAR (15 mg/kg puis 30 à 40 mg/kg/j), affichée sans calcul.' : '';
  const duree: DureeDecidee = {
    texte: `7 jours au plus (SFAR/SRLF 2017 ; ERS/ESICM 2017 : 7 à 8 jours ; IDSA/ATS 2016 : 7 jours), sauf immunodépression, empyème, pneumonie nécrosante ou abcédée${p.immunodepression === 'oui' ? ' — patient immunodéprimé : durée à discuter avec le SMIT' : ''}.`,
    pointDeDepart: 'premier jour de traitement',
    dureePrevueJours: 7,
    sources: [
      S(SFAR, 'R3.5', 'Il ne faut pas prolonger plus de 7 jours la durée du traitement antibiotique pour les pneumonies associées aux soins', 'duree'),
      S(ERS17, 'Q4', 'We suggest using a 7–8-day course of antibiotic therapy in patients with VAP', 'duree'),
      S(IDSA16, 'durée', 'we recommend a 7-day course of antimicrobial therapy rather than a longer duration', 'duree'),
    ],
  };
  f.reeval('Après documentation : réduire le spectre et privilégier une monothérapie, y compris pour les bacilles à Gram négatif non fermentants.', [S(SFAR, 'R3.4', 'Il faut probablement réduire le spectre et privilégier une monothérapie […] après documentation, y compris pour les bacilles à Gram négatif non fermentants. GRADE 2+', 'choix')], 48);
  const opt = (id: string, libelle: string, rang: OptionTherapeutique['rang'], items: ItemPrescription[], sources: SourceRef[], commentaire: string, condition?: string) =>
    f.option({ id, libelle, type: 'probabiliste', rang, condition, items, duree, statut: 'brouillon', sources: [...sources, srcProto], commentaire: `${commentaire}${noteSarm} Protocole SFAR/SRLF 2017 : avis d'experts, correspondance molécule/posologie reconstituée.` });
  const conditionCol = (c: Colonne, texte: string) => (colonne === c ? undefined : texte);
  const rangDe = (c: Colonne) => (colonne === c ? ('premiere_ligne' as const) : ('conditionnelle' as const));
  // Monothérapie (R3.2) : patient immunocompétent sous ventilation mécanique. Hors ventilation ou immunodépression
  // non exclue : affichée seulement sous condition (extrapolation signalée).
  const reserveMono = [
    lieu === 'rea' ? 'R3.2 vise le patient sous ventilation mécanique : extrapolation à la pneumonie de réanimation sans ventilation, à valider (ERS/ESICM 2017 : spectre étroit possible dans la pneumonie acquise à l\'hôpital précoce à faible risque)' : '',
    p.immunodepression === 'oui' ? 'R3.2 ne vise que le patient immunocompétent : avis infectiologique' : p.immunodepression === 'inconnu' ? 'seulement chez le patient immunocompétent (R3.2)' : '',
  ].filter(Boolean).join(' ; ');
  if (p.immunodepression === 'inconnu' && (colonne === 'mono' || colonne === undefined)) f.manque('immunodépression', 'la monothérapie probabiliste de la SFAR/SRLF (R3.2) ne vise que le patient immunocompétent', colonne === 'mono' ? 'bloque_decision' : 'affine', 'patient.immunodepression');
  if ((colonne === 'mono' || colonne === undefined) && !choc) {
    const c = 'si pneumonie précoce (< 5 jours), sans choc ni facteur de risque de BMR';
    const rangMono = reserveMono ? ('conditionnelle' as const) : rangDe('mono');
    const condMono = [conditionCol('mono', c), reserveMono].filter(Boolean).join(' ; ') || undefined;
    opt('pavm-mono-amc', `Amoxicilline-acide clavulanique IV${libSarm} (monothérapie)`, rangMono, [I.AMC_IV, ...ajoutSarm], [srcR32, ...(lieu === 'rea' ? [S(ERS17, 'Q2', 'We suggest using narrow-spectrum antibiotics (ertapenem, ceftriaxone, cefotaxime, moxifloxacin or levofloxacin) in patients with suspected low risk of resistance and early-onset HAP/VAP', 'choix')] : [])], 'SFAR 2017 : bêta-lactamine inactive sur P. aeruginosa, 3 à 6 g/j (dose affichée : 3 g/j, dans la fourchette).', condMono);
    opt('pavm-mono-ctx', `Céfotaxime${libSarm} (monothérapie)`, rangMono, [I.CTX_STD, ...ajoutSarm], [srcR32], 'SFAR 2017 : C3G type céfotaxime, 3 à 6 g/j ; ERS/ESICM 2017 : spectre étroit (ertapénème, ceftriaxone, céfotaxime, lévofloxacine) si faible risque de résistance.', condMono);
    if (colonne === 'mono') opt('pavm-mono-levo', 'Lévofloxacine (allergie aux bêta-lactamines)', al.ciBL && !reserveMono ? 'premiere_ligne' : 'conditionnelle', [I.LEVO_PAVM, ...ajoutSarm], [srcR32], 'SFAR 2017 : lévofloxacine 500 mg × 2/j en cas d\'allergie.', [al.ciBL ? '' : 'en cas d\'allergie aux bêta-lactamines', reserveMono].filter(Boolean).join(' ; ') || undefined);
  }
  if (colonne === 'choc' || (colonne === undefined && choc)) {
    const c = 'si pneumonie précoce (< 5 jours), avec choc, sans facteur de risque de BMR';
    const note = 'SFAR 2017 : bêta-lactamine + aminoside (à privilégier) ou fluoroquinolone (ofloxacine 200 mg × 2/j, absente de la base) ; gentamicine à la dose du protocole SFAR (8 mg/kg/j), affichée sans calcul (ANSM : 3 à 8 mg/kg/j ; SPILF/SFPT/CA-SFM 2026 : 6 à 7 mg/kg).';
    opt('pavm-choc-amc', `Amoxicilline-acide clavulanique IV + gentamicine${libSarm}`, rangDe('choc'), [I.AMC_IV, I.GENTA_PAVM, ...ajoutSarm], [srcBi], note, conditionCol('choc', c));
    opt('pavm-choc-ctx', `Céfotaxime + gentamicine${libSarm}`, rangDe('choc'), [I.CTX_STD, I.GENTA_PAVM, ...ajoutSarm], [srcBi], note, conditionCol('choc', c));
    opt('pavm-choc-levo', 'Lévofloxacine + gentamicine (allergie aux bêta-lactamines)', al.ciBL && colonne === 'choc' ? 'premiere_ligne' : 'conditionnelle', [I.LEVO_PAVM, I.GENTA_PAVM, ...ajoutSarm], [srcBi], note, [al.ciBL ? '' : 'en cas d\'allergie aux bêta-lactamines', conditionCol('choc', c) ?? ''].filter(Boolean).join(' ; ') || undefined);
  }
  if (colonne === 'bmr_precoce') {
    f.alerte('attention', 'Pneumonie précoce avec facteur de risque de BMR sans facteur de BGN non fermentant : cas non prévu par le protocole n° 4 de la SFAR/SRLF ; la bithérapie probabiliste est indiquée (argumentaire R3.2). Schémas de la colonne « tardive » affichés sous condition ; avis du SMIT.', [srcBi, srcProto]);
    f.avis('Avis du SMIT : pneumonie de réanimation précoce avec facteur de risque de BMR (cas non prévu par le protocole SFAR/SRLF 2017).', choc, [srcBi]);
  }
  if (colonne === 'pyo' || colonne === 'bmr_precoce' || colonne === undefined) {
    const c = colonne === 'bmr_precoce' ? 'cas non prévu par le protocole n° 4 (précoce avec facteur de BMR seulement) : bithérapie indiquée (argumentaire R3.2), schéma de la colonne « tardive » à valider avec le SMIT' : 'si pneumonie tardive (≥ 5 jours) ou facteur de risque de BGN non fermentant';
    const note = 'SFAR 2017 : amikacine à préférer à la gentamicine et aux fluoroquinolones ; ceftazidime (6 g/j) possible mais absente de la base. Allergie : aztréonam + clindamycine (clindamycine absente de la base : avis).';
    if (blse) {
      opt('pavm-pyo-mem', `Méropénème + amikacine${libSarm} (portage de BLSE)`, rangDe('pyo'), [I.MEM, I.AMK, ...ajoutSarm], [srcBi], `Portage de BLSE déclaré : carbapénème (SFAR 2017 : méropénème 3 à 6 g/j ; dose affichée : 3 g/j). ${note}`, conditionCol('pyo', c));
      opt('pavm-pyo-ipm', `Imipénème + amikacine${libSarm} (portage de BLSE)`, rangDe('pyo'), [I.IPM, I.AMK, ...ajoutSarm], [srcBi], `SFAR 2017 : imipénème 3 g/j. ${note}`, conditionCol('pyo', c));
    } else {
      opt('pavm-pyo-fep', `Céfépime + amikacine${libSarm}`, rangDe('pyo'), [I.FEP, I.AMK, ...ajoutSarm], [srcBi], `SFAR 2017 : céfépime 4 à 6 g/j (dose affichée : 6 g/j). ${note}`, conditionCol('pyo', c));
      opt('pavm-pyo-tzp', `Pipéracilline-tazobactam + amikacine${libSarm}`, rangDe('pyo'), [I.TZP_FORT, I.AMK, ...ajoutSarm], [srcBi], `SFAR 2017 : pipéracilline-tazobactam 16 g/j. ${note}`, conditionCol('pyo', c));
      if (colonne === 'pyo') opt('pavm-pyo-fep-cipro', `Céfépime + ciprofloxacine${libSarm}`, 'alternative', [I.FEP, I.CIP, ...ajoutSarm], [srcBi], 'SFAR 2017 : ciprofloxacine 400 mg × 3/j en alternative à l\'amikacine.');
    }
    if (colonne === 'pyo' && al.ciBL) f.avis('Allergie aux bêta-lactamines : la SFAR/SRLF 2017 propose aztréonam + clindamycine ; la clindamycine n\'est pas dans la base : avis infectiologique.', true, [srcProto]);
  }
  if (sarm === 'oui') {
    f.alerte('info', 'Facteur de risque de SARM : anti-SARM probabiliste (vancomycine ou linézolide), à ne pas utiliser de façon systématique sans facteur de risque.', [srcR33, S(SFAR, 'protocole n° 4', '600 mg x 2/j', 'posologie')]);
  }
}

export const REGLES_PNEUMONIES = [R_PNEUMONIE];
