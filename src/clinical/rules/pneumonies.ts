/**
 * Pneumonies de l'adulte : pneumonie aiguë communautaire (ambulatoire, hospitalisée non grave, grave), légionellose,
 * bactéries atypiques, contexte grippal, pneumonie d'inhalation, S. aureus producteur de LPV ; pneumonies associées
 * aux soins de réanimation (PAVM) ; pneumonie nosocomiale hors réanimation (absence de texte français expliquée).
 * Sources : SPILF/SPLF 2025 (article et diaporama), HAS 2025 (PAC ambulatoire), HAS 2023 (M. pneumoniae),
 * SPILF/SFGG 2025 (inhalation, diaporama), SPILF 2026 (légionellose, diaporama), Afssaps 2010 (orientation),
 * RFE SFAR/SRLF 2017, ERS/ESICM 2017 et 2023, IDSA/ATS 2016, ATS/IDSA 2019, SCCM 2024 ; RCP et CRAT —
 * docs/sources/recherche-pneumonies.md.
 */
import type { Regle } from '../../engine/decider';
import { familleDeclaree, moleculeEvitee, type ContexteDecision } from '../../engine/contexte';
import type { SourceRef, StatutValidation } from '../types';
import { reponseDetail } from '../syndromes/questions';
import { comorbiditeDeduite } from '../syndromes/pneumonies';
import { Fiche, S, adulte, groupe, type DureeDecidee, type ItemPrescription } from './outils';

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
  AMC: { m: 'amoxicilline_clavulanate', r: 'amoxclav-pac-1g8h' },
  AMC_IV: { m: 'amoxicilline_clavulanate', r: 'amoxclav-iv-1g8h' },
  CRO1: { m: 'ceftriaxone', r: 'ceftriaxone-pac-1g' },
  CRO2: { m: 'ceftriaxone', r: 'ceftriaxone-pac-2g' },
  CTX: { m: 'cefotaxime', r: 'cefotaxime-pac-1g8h' },
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
  GENTA: { m: 'gentamicine', r: 'gentamicine-6-7' },
  AMK: { m: 'amikacine', r: 'amikacine-30-du' },
  CIP: { m: 'ciprofloxacine', r: 'cipro-iv-400x3' },
  MEM: { m: 'meropeneme', r: 'meropeneme-1g8h' },
  IPM: { m: 'imipeneme', r: 'imipeneme-1g8h' },
  VAN: { m: 'vancomycine', r: 'vancomycine-continu' },
} satisfies Record<string, ItemPrescription>;

/** Fiche qui, en cas de bactériémie documentée, laisse la situation et les options à la règle de bactériémie. */
class FichePneumonie extends Fiche {
  constructor(
    ctx: ContexteDecision,
    statut: StatutValidation,
    private readonly sansProposition: boolean,
  ) {
    super(ctx, statut);
  }
  override situation(...args: Parameters<Fiche['situation']>) {
    return this.sansProposition ? this : super.situation(...args);
  }
  override option(o: Parameters<Fiche['option']>[0]): boolean {
    return this.sansProposition ? false : super.option(o);
  }
}

const r = (ctx: ContexteDecision, id: string) => reponseDetail(ctx.dossier, id);
const jours = (n: number, sources: SourceRef[], texte?: string): DureeDecidee => ({ texte: texte ?? `${n} jours`, pointDeDepart: 'premier jour de traitement (durée totale)', dureePrevueJours: n, sources });

/** Allergies utiles aux choix SPILF : pénicillines seules (allergie « non grave »), bêta-lactamines (C3G aussi évitées), macrolides. */
function allergies(ctx: ContexteDecision) {
  const ev = (id: string, fam: Parameters<typeof moleculeEvitee>[1]) => moleculeEvitee(id, fam, ctx.allergie).evitee;
  const peni = ev('amoxicilline', 'penicilline');
  const c3g = ev('ceftriaxone', 'cephalosporine');
  const macro = ['spiramycine', 'clarithromycine', 'azithromycine'].some((m) => ev(m, 'macrolide'));
  return { peni, c3g, ciBL: peni && c3g, penicillineSeule: peni && !c3g, macro };
}

function fqRecente(ctx: ContexteDecision): boolean {
  return ctx.dossier.patient.antibiotiquesRecents.some((a) => familleDeclaree(a.dci) === 'fluoroquinolone');
}

/* ------------------------------------------------------------------ */
/* Extraits réutilisés                                                 */
/* ------------------------------------------------------------------ */

const SRC = {
  definition: S(AF, 'p. 2', 'dite communautaire si elle est acquise en milieu extra-hospitalier ou si, à l\'hôpital, elle survient avant la 48ème heure suivant l\'admission', 'definition'),
  grave: S(SP, 'tableau 1, p. 4', 'Définition d\'une pneumonie aiguë grave si présence d\'un critère majeur ou d\'au moins 3 critères mineurs (selon ATS/IDSA)', 'definition'),
  orientation2010: S(SP, 'p. 3-4', 'il convient donc pour cela de se reporter aux recommandations de 2010', 'definition'),
  crb65: S(AF, 'tableau 1, p. 3', '0 critère : traitement ambulatoire possible', 'definition'),
  reeval: S(AF, '§2.2.3, p. 4', 'Son efficacité doit être évaluée impérativement après 48-72 heures de traitement.', 'autre'),
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
};

const TEXTE_LEVO = 'Fluoroquinolone : pas si une fluoroquinolone a été reçue dans les 3 derniers mois (HAS) ; restrictions d\'utilisation de l\'ANSM (2023).';
const TEXTE_PRISTINA = 'En cas d\'allergie, la SPILF 2025 recommande la pristinamycine : molécule non disponible dans cette version de la base (prescription hors application).';

/* ------------------------------------------------------------------ */
/* Règle                                                               */
/* ------------------------------------------------------------------ */

export const R_PNEUMONIE: Regle = {
  id: 'R-PNEUMONIE',
  libelle: 'Pneumonie communautaire, d\'inhalation, légionellose, pneumonie associée aux soins',
  description: 'SPILF/SPLF 2025, HAS 2025, HAS 2023, SPILF/SFGG 2025, SPILF 2026 (légionellose), Afssaps 2010 (orientation), RFE SFAR/SRLF 2017 ; recoupement ERS/ESICM 2017/2023, IDSA/ATS 2016, ATS/IDSA 2019 ; RCP et CRAT.',
  statut: 'verifiee_ia',
  priorite: 154,
  sources: [S(SP, 'MMIF 2025 ; IDN 2025;55:105034', undefined, 'choix'), S(HAS, 'fiche mémo (mise à jour 13/05/2025)', undefined, 'choix'), S(SFAR, 'RFE 2017', undefined, 'choix')],
  sApplique: (ctx) => adulte(ctx) && ctx.foyer === 'pulmonaire',
  appliquer: (ctx) => {
    // Bactériémie documentée : la règle du germe (S. aureus, streptocoque, BGN…) donne la situation et les options.
    const bacteriemieDocumentee = ctx.hemocultures.some((h) => groupe(h) !== 'aucun');
    const f = new FichePneumonie(ctx, 'verifiee_ia', bacteriemieDocumentee);
    if (bacteriemieDocumentee)
      f.alerte('attention', 'Pneumonie avec hémocultures positives : la situation et le traitement viennent de la règle de bactériémie du germe. Pas de bithérapie une fois la pneumonie documentée, sauf pneumonie grave à SASM producteur de LPV (SPILF 2025).', [SRC.documentation]);
    if (ctx.dossier.prelevements.some((x) => x.type === 'respiratoire' && x.organisme !== undefined)) {
      f.plafond('partielle');
      f.alerte('attention', 'Prélèvement respiratoire positif : le traitement documenté n\'est pas modélisé ; adapter le probabiliste à l\'antibiogramme (désescalade), sans bithérapie sauf pneumonie grave à SASM producteur de LPV.', [SRC.documentation]);
    }
    const contexte = ctx.dossier.patient.contexte;
    if (contexte === 'communautaire') pac(ctx, f);
    else if (contexte === 'associe_aux_soins') associeeAuxSoins(ctx, f);
    else
      f.situation('pneumonie-contexte-a-preciser', 'Pneumonie : contexte communautaire ou associé aux soins à préciser', 'partielle', 'Communautaire : acquise hors de l\'hôpital ou dans les 48 premières heures d\'hospitalisation (Afssaps 2010) ; au-delà, pneumonie associée aux soins. Les schémas diffèrent.')
        .alerte('attention', 'Pneumonie : préciser si elle est communautaire ou associée aux soins (après 48 h d\'hospitalisation ou de ventilation mécanique).', [SRC.definition, S(SFAR, 'p. 3-4', 'La pneumonie sévère acquise à l\'hôpital et la PAVM sont des infections survenant après 48 h d\'hospitalisation ou de ventilation mécanique, respectivement', 'definition')]);
    return f.fin();
  },
};

/* ------------------------------------------------------------------ */
/* Pneumonie aiguë communautaire                                       */
/* ------------------------------------------------------------------ */

function pac(ctx: ContexteDecision, f: Fiche) {
  const p = ctx.dossier.patient;
  const orient = r(ctx, 'pneumonie.orientation');
  const lieu = r(ctx, 'pneumonie.lieu');
  const graveRep = r(ctx, 'pneumonie.grave');
  // PAC grave : critères ATS/IDSA (SPILF 2025, tableau 1) ; le choc septique est un critère majeur ; en soins critiques
  // sans réponse sur les critères, la définition ERS/ESICM 2023 (« CAP requiring ICU admission ») est retenue.
  const grave = graveRep === 'oui' || p.gravite === 'choc_septique' || (lieu === 'soins_critiques' && graveRep !== 'non');
  if (lieu === 'soins_critiques' && graveRep === 'inconnu' && p.gravite !== 'choc_septique')
    f.manque('critères de pneumonie grave (1 majeur ou 3 mineurs)', 'en soins critiques sans réponse, la pneumonie est traitée comme grave (ERS/ESICM 2023 : « sCAP refers to CAP requiring ICU admission »)', 'affine');
  if (orient === 'fausse_route') return fausseRoute(f);
  if (orient === 'inconnu') f.manque('orientation clinique (contexte grippal, bactérie atypique, légionellose, inhalation, LPV)', 'choix du schéma probabiliste (SPILF 2025, tableaux 2, 7 et 9)', 'affine');
  if (fqRecente(ctx)) f.alerte('attention', 'Fluoroquinolone récente déclarée : la HAS déconseille une fluoroquinolone si une fluoroquinolone a été reçue dans les 3 derniers mois.', [SRC.fqHas]);
  if (orient === 'inhalation') return inhalation(ctx, f, lieu, grave);
  if (orient === 'legionellose') return legionellose(ctx, f, lieu, grave);
  if (grave) return pacGrave(ctx, f, orient, lieu);
  if (orient === 'lpv')
    f.alerte('attention', 'Tableau évocateur de S. aureus producteur de LPV sans critère de gravité : le schéma anti-toxinique de la SPILF 2025 (tableau 9) vise la pneumonie grave ; avis infectiologique.', [S(SP, '§2-3, p. 7', 'nécessite l\'utilisation d\'une molécule avec une activité anti-toxinique (Tableau 9) (Grade B-1)', 'choix')]).avis('Avis infectiologique (suspicion de S. aureus producteur de LPV).', true, [S(SP, 'tableau 9, p. 7', 'Contexte post-grippal, gravité, présentation évocatrice : hémoptysie, leucopénie, rash cutané et pneumonie nécrosante (nodules multiples, images excavées)', 'choix')]);
  if (lieu === 'inconnu') return lieuAPreciser(f);
  if (lieu === 'ambulatoire') return pacAmbulatoire(ctx, f, orient);
  return pacHospitalisee(ctx, f, orient);
}

function lieuAPreciser(f: Fiche) {
  f.situation('pac-lieu-a-preciser', 'Pneumonie communautaire : lieu de prise en charge à préciser', 'partielle', 'Le schéma dépend du lieu de prise en charge (ambulatoire, hospitalisation, soins critiques) et de la gravité.');
  f.manque('lieu de prise en charge (ambulatoire, hospitalisation, soins critiques)', 'choix du schéma probabiliste (SPILF 2025)', 'bloque_decision');
  f.alerte('info', 'Orientation (critères de 2010, auxquels renvoie la SPILF 2025) : CRB 65 = 0 → ambulatoire possible ; ≥ 1 critère → évaluation à l\'hôpital. La HAS fait discuter l\'hospitalisation devant : température < 36 °C ou > 40 °C, hypotension, FR ≥ 30/min, confusion, certaines comorbidités, isolement ou inobservance.', [SRC.orientation2010, SRC.crb65, S(AF, 'tableau 1, p. 3', '≥ 1 critère : évaluation à l\'hôpital', 'definition'), S(HAS, 'orientation', 'amener à discuter une prise en charge hospitalière', 'definition')]);
}

function fausseRoute(f: Fiche) {
  const src = [
    S(INH, 'diapo 9', 'Après une fausse route constatée : Pas d\'antibiothérapie, surveillance clinique', 'choix'),
    S(INH, 'diapo 3', 'Le tableau respiratoire aigu immédiatement secondaire à une fausse route (pneumopathie chimique) ne répond pas à la définition de PI.', 'definition'),
  ];
  f.c.indication = {
    decision: 'ne_pas_traiter',
    qualification: 'indeterminee',
    titre: 'Fausse route constatée sans pneumonie : pas d\'antibiothérapie',
    raison: 'Après une fausse route constatée : pas d\'antibiothérapie, surveillance clinique. Le tableau respiratoire aigu immédiatement secondaire à une fausse route (pneumopathie chimique) n\'est pas une pneumonie d\'inhalation.',
    conditions: ['Fausse route constatée', 'Pas de critère de pneumonie d\'inhalation déclaré'],
    exceptions: [],
    actions: ['Surveillance clinique'],
    surveillance: ['Signes d\'infection respiratoire basse et infiltrat radiologique nouveau'],
    reconsiderer: ['Signes d\'infection respiratoire basse avec infiltrat radiologique nouveau (pneumonie d\'inhalation)'],
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
  const horsDonnees = p.immunodepression === 'oui' || p.insuffisanceHepatique === 'oui' || ['hemodialyse_intermittente', 'dialyse_peritoneale'].includes(p.renal.dialyse);
  const has = ambulatoire ? [SRC.dHas, SRC.dHasMax] : [];
  const noteHas = ambulatoire ? ' HAS 2025 : 7 jours maximum, arrêt possible à 5 voire 3 jours si la stabilité est vérifiée par le médecin et le patient informé.' : '';
  const noteND = horsDonnees ? ' Pas de données pour la règle des 3 jours chez le patient immunodéprimé ou insuffisant chronique grave (SPILF 2025, note 1) : durée à discuter avec le SMIT.' : '';
  if (stab === 'j3' && !horsDonnees) return jours(3, [SRC.d3, ...has], '3 jours au total (tous les critères de stabilité obtenus à J3)');
  if (stab === 'j3_j5') return jours(5, [SRC.d5, ...has], `5 jours au total (stabilité obtenue entre J3 et J5).${noteND}`);
  if (stab === 'non') return jours(7, [SRC.d7, SRC.dComplication], `7 jours au total ; au-delà seulement en cas de complication (abcès, épanchement pleural significatif).${noteND}`);
  return {
    texte: `3, 5 ou 7 jours au total selon la stabilité clinique : 3 jours si tous les critères sont obtenus à J3, 5 jours s'ils le sont entre J3 et J5, 7 jours sinon ; plus de 7 jours seulement si complication.${noteND}${noteHas}`,
    pointDeDepart: 'premier jour de traitement (durée totale)',
    dureePrevueJours: 7,
    sources: [SRC.d3, SRC.d5, SRC.d7, SRC.dComplication, ...(horsDonnees ? [SRC.dNote1] : []), ...has],
  };
}

function comorbidite(ctx: ContexteDecision): 'oui' | 'non' | 'inconnu' {
  if (comorbiditeDeduite(ctx.dossier)) return 'oui';
  const v = r(ctx, 'pneumonie.comorbidite');
  return v === 'oui' || v === 'non' ? v : 'inconnu';
}

function reevalPac(f: Fiche, ambulatoire: boolean) {
  if (ambulatoire)
    f.reeval('Réévaluation à 48-72 h. Échec d\'une bêta-lactamine : relais (et non ajout) par un macrolide ; échec d\'un macrolide : relais par une bêta-lactamine (amoxicilline, amoxicilline-acide clavulanique ou C3G injectable selon les comorbidités). Échec avec comorbidité : avis spécialisé et hospitalisation à discuter (HAS).', [
      SRC.reeval,
      S(SP, '§2-1, p. 6', 'relais par un macrolide lors de la réévaluation à H72 (Grade C-1)', 'choix'),
      S(SPD, 'diapo 21', 'En cas de non amélioration à 72h de bêta-lactamine : relais (et non ajout) vers macrolides', 'choix'),
      S(SP, '§2-1, p. 6', 'relais par bêtalactamine (amoxicilline ou amoxicilline-acide clavulanique ou C3G injectable selon la présence de comorbidités) lors de la réévaluation à H72 (Grade C-1)', 'choix'),
      S(HAS, 'échec à 72 h avec comorbidités', 'Discuter l\'hospitalisation', 'choix'),
    ], 72);
  else
    f.reeval('Réévaluation à 72 h. Échec : bilan complet (complication, bactérie résistante), scanner thoracique, drainage pleural à discuter, élargissement du spectre ; relais par un macrolide si forte suspicion de bactérie atypique.', [
      SRC.reeval,
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
  if (orient === 'atypique') return atypiqueAmbulatoire(f, al);
  if (orient === 'grippe') {
    const src = [S(SP, '§2-1, p. 6 (grippe)', 'amoxicilline-acide clavulanique (Grade C-1) ; en cas d\'allergie : pristinamycine (Grade C-1)', 'choix')];
    f.option({ id: 'pac-amb-grippe-amc', libelle: 'Amoxicilline-acide clavulanique (contexte grippal)', type: 'probabiliste', rang: 'premiere_ligne', items: [I.AMC], duree, sources: src, commentaire: TEXTE_PRISTINA });
    if (al.peni) f.alerte('attention', `Allergie déclarée, contexte grippal : ${TEXTE_PRISTINA}`, src);
    optionLevo(f, 'pac-amb-grippe-levo', al, duree, []);
    return;
  }
  const comorb = comorbidite(ctx);
  const srcSans = S(SP, '§2-1, p. 6', 'Patient sans comorbidité : amoxicilline (Grade B-1) ; en cas d\'allergie : pristinamycine (Grade B-3)', 'choix');
  const srcAvec = S(SP, '§2-1, p. 6', 'Patient avec au moins une comorbidité (Tableau 3) : amoxicilline-acide clavulanique (Grade B-1) ; en cas d\'allergie non grave : C3G […] injectable (Grade B-1) ; uniquement en cas d\'allergie contre-indiquant l\'utilisation de bêtalactamine : lévofloxacine (Grade B-1)', 'choix');
  const srcHasAvec = S(HAS, 'comorbidités ou exposition aux antibiotiques', 'En cas de comorbidités ou d\'exposition aux antibiotiques[1] dans le mois précédant ou d\'hospitalisation dans les 6 mois : amoxicilline/acide clavulanique : 1g/125 mg 3 fois par jour', 'choix');
  const divergenceComorb = 'Définition divergente : SPILF 2025, hospitalisation dans les 3 mois ; HAS 2025, hospitalisation dans les 6 mois.';
  if (comorb === 'inconnu') f.manque('comorbidité de la liste SPILF 2025 (tableau 3)', 'amoxicilline (aucune comorbidité) ou amoxicilline-acide clavulanique (au moins une)', 'bloque_decision');
  const deduite = comorbiditeDeduite(ctx.dossier);
  if (comorb !== 'oui') {
    f.option({ id: 'pac-amb-amox', libelle: 'Amoxicilline', type: 'probabiliste', rang: comorb === 'non' ? 'premiere_ligne' : 'conditionnelle', condition: comorb === 'non' ? undefined : 'si aucune comorbidité de la liste SPILF 2025', items: [I.AMOX], duree, sources: [srcSans, S(HAS, '1re intention sans comorbidité', 'amoxicilline 1g 3 fois par jour', 'choix')], commentaire: TEXTE_PRISTINA });
    if (comorb === 'non' && al.peni) f.alerte('attention', `Allergie déclarée, PAC sans comorbidité : ${TEXTE_PRISTINA}`, [srcSans, S(HAS, '1re intention', 'En cas d\'allergie documentée contre-indiquant les pénicillines ou de rupture de stock : pristinamycine 1g 3 fois par jour', 'choix')]);
  }
  if (comorb !== 'non') {
    f.option({ id: 'pac-amb-amc', libelle: 'Amoxicilline-acide clavulanique', type: 'probabiliste', rang: comorb === 'oui' ? 'premiere_ligne' : 'conditionnelle', condition: comorb === 'oui' ? undefined : 'si au moins une comorbidité de la liste SPILF 2025', items: [I.AMC], duree, sources: [srcAvec, srcHasAvec, S(SP, 'tableau 3, NB', 'La présence d\'une seule des comorbidités listées ci-dessus suffit à modifier le choix de l\'amoxicilline', 'choix')], commentaire: `${deduite ? `Comorbidité déduite de la saisie : ${deduite}. ` : ''}${divergenceComorb}` });
    f.option({ id: 'pac-amb-c3g', libelle: 'Ceftriaxone injectable (allergie non grave aux pénicillines)', type: 'probabiliste', rang: al.penicillineSeule && comorb === 'oui' ? 'premiere_ligne' : 'conditionnelle', condition: al.penicillineSeule && comorb === 'oui' ? undefined : 'en cas d\'allergie non grave aux pénicillines, avec comorbidité', items: [I.CRO1], duree, sources: [srcAvec, S(HAS, 'allergie aux pénicillines', 'ceftriaxone : 1g 1 fois par jour par voie IM, IV ou SC', 'choix')], commentaire: 'Céfotaxime 1 g × 3/j IM ou IV possible (HAS 2025).' });
  }
  optionLevo(f, 'pac-amb-levo', al, duree, [srcAvec, S(HAS, 'dernier recours', 'En dernier recours, si aucune autre antibiothérapie n\'est possible : fluoroquinolone anti-pneumococcique', 'choix')]);
}

function atypiqueAmbulatoire(f: Fiche, al: ReturnType<typeof allergies>) {
  const src = [
    S(SP, '§2-1, p. 6', 'macrolide en première intention, pristinamycine ou doxycycline en alternative (Grade C-1)', 'choix'),
    S(SP, 'tableau 7, p. 6', 'Macrolide* ; Cycline ; Si contre-indication aux macrolides et aux cyclines : lévofloxacine', 'choix'),
    S(MYCO, 'p. 4', 'Les macrolides sont le traitement de référence', 'choix'),
  ];
  const spilf = 'SPILF 2025 : 3, 5 ou 7 jours au total selon la stabilité clinique';
  const dDiv = (n: number, has: string, extrait: string): DureeDecidee => ({ texte: `Divergence non tranchée : ${has} selon la HAS (M. pneumoniae, 2023) ; ${spilf}.`, pointDeDepart: 'premier jour de traitement (durée totale)', dureePrevueJours: n, sources: [S(MYCO, 'p. 4', extrait, 'duree'), SRC.d3, SRC.d5, SRC.d7] });
  const commun = 'Alternatives de la SPILF 2025 non disponibles dans la base : pristinamycine, doxycycline (RCP non lu ; 100 mg × 2/j selon la SPILF, 200 mg × 1/j selon la HAS). Roxithromycine (150 mg × 2/j) : RCP non lu.';
  f.option({ id: 'pac-atyp-clari', libelle: 'Clarithromycine', type: 'probabiliste', rang: 'premiere_ligne', items: [I.CLARI], statut: 'brouillon', duree: dDiv(5, '5 jours', '500 mg 2 fois par jour pendant 5 jours'), sources: [...src, S(HAS, 'atypique ou échec à 72 h', 'clarithromycine : 500 mg 2 fois par jour', 'choix')], commentaire: `Macrolides cités sans hiérarchie (SPILF 2025) ; ordre de la HAS. ${commun}` });
  f.option({ id: 'pac-atyp-spira', libelle: 'Spiramycine', type: 'probabiliste', rang: 'alternative', items: [I.SPIRA], statut: 'brouillon', duree: dDiv(7, '7 jours', '3 MUI 3 fois par jour pendant 7 jours'), sources: [...src, S(HAS, 'atypique ou échec à 72 h', 'spiramycine : 3 MUI 3 fois par jour', 'choix')], commentaire: 'HAS 2023 : spiramycine en cas de problème d\'approvisionnement des autres macrolides (M. pneumoniae).' });
  f.option({ id: 'pac-atyp-azi', libelle: 'Azithromycine (hors AMM dans la pneumonie)', type: 'probabiliste', rang: 'alternative', items: [I.AZI], statut: 'brouillon', duree: dDiv(5, '5 jours (J1 à J5)', '500 mg/j en une prise à J1 puis 250mg/j de J2 à J5'), sources: [...src, S(HAS, 'atypique ou échec à 72 h', 'azithromycine : 500 mg par jour en une prise à J1 puis 250 mg par jour (antibiotique ayant un impact plus important sur la résistance bactérienne du fait de sa longue demi-vie)', 'choix')], commentaire: 'Impact plus important sur la résistance bactérienne (longue demi-vie, HAS). La pneumonie ne figure pas dans les indications du RCP ZITHROMAX 250 mg (hors AMM).' });
  f.option({ id: 'pac-atyp-levo', libelle: 'Lévofloxacine (dernier recours)', type: 'probabiliste', rang: 'conditionnelle', condition: 'seulement si contre-indication aux macrolides et aux cyclines, en dernier recours, décision partagée', items: [I.LEVO], duree: jours(7, [S(MYCO, 'p. 5', 'Lévofloxacine 500 mg 1 fois par jour pendant 7 jours', 'duree')]), sources: [...src, S(MYCO, 'p. 5', 'En dernier recours dans le cadre d\'une décision partagée', 'choix'), SRC.fqHas, SRC.ansmFq], commentaire: `${TEXTE_LEVO} ${al.macro ? 'Allergie aux macrolides déclarée : alternatives SPILF (pristinamycine, doxycycline) hors base, à envisager avant la lévofloxacine.' : ''}`.trim() });
}

/* ------------------------- Hospitalisée non grave ------------------------- */

function pacHospitalisee(ctx: ContexteDecision, f: Fiche, orient: string) {
  const al = allergies(ctx);
  f.situation('pac-hospitalisee', 'Pneumonie aiguë communautaire hospitalisée, non grave', 'couverte', 'SPILF/SPLF 2025 : choix selon les comorbidités, le contexte grippal, la suspicion de bactérie atypique et la colonisation à P. aeruginosa ; durée selon la stabilité clinique.');
  controlesHospitaliseNonGrave(f);
  f.alerte('info', 'PAC non grave : pas de corticoïdes (SPILF 2025, grade A-2) ; pas de bithérapie bêta-lactamine + macrolide ou fluoroquinolone (grade A-1) ; la pristinamycine n\'a pas sa place chez le patient hospitalisé.', [SRC.corticoNonGrave, S(SP, 'p. 8-9', 'une bithérapie probabiliste associant bêtalactamine et macrolide ou fluoroquinolone n\'est pas recommandée […] (Grade A-1)', 'choix'), S(SP, '§2-2, p. 7', 'La pristinamycine n\'a pas sa place chez les patients hospitalisés (Grade C-1)', 'choix')]);
  reevalPac(f, false);
  const duree = dureePacNonGrave(ctx, false);
  const srcLevo = [S(SP, '§2-2, p. 7', 'Alternative (uniquement en cas d\'allergie contre-indiquant l\'utilisation de bêtalactamine) : lévofloxacine (Grade B-1)', 'choix')];
  const fdr = r(ctx, 'pneumonie.fdr_pyo');
  if (fdr === 'colonisation') return antiPyoHospitalise(f, duree);
  if (fdr === 'inconnu') f.manque('colonisation ou infection respiratoire à P. aeruginosa dans l\'année', 'bêta-lactamine anti-P. aeruginosa recommandée en cas de colonisation (SPILF 2025)', 'affine');
  if (orient === 'atypique') {
    const src = [S(SP, '§2-2, p. 7', 'macrolides (Grade C-1)', 'choix'), S(SP, 'tableau 7, p. 6', 'Macrolide* ; Cycline ; Si contre-indication aux macrolides et aux cyclines : lévofloxacine', 'choix')];
    f.option({ id: 'pac-hosp-atyp-clari', libelle: 'Clarithromycine per os', type: 'probabiliste', rang: 'premiere_ligne', items: [I.CLARI], duree, sources: src, commentaire: 'Macrolides cités sans hiérarchie (SPILF 2025, tableau 7 : azithromycine, clarithromycine, roxithromycine, spiramycine) ; roxithromycine : RCP non lu.' });
    f.option({ id: 'pac-hosp-atyp-spira', libelle: 'Spiramycine (per os, ou IV si la voie orale est impossible)', type: 'probabiliste', rang: 'alternative', items: [I.SPIRA], duree, sources: src, commentaire: 'Forme IV : 1,5 MUI toutes les 8 h (RCP), contre-indiquée avec les médicaments donnant des torsades de pointes, dont la lévofloxacine.' });
    f.option({ id: 'pac-hosp-atyp-spira-iv', libelle: 'Spiramycine IV', type: 'probabiliste', rang: 'conditionnelle', condition: 'si la voie orale est impossible', items: [I.SPIRA_IV], duree, sources: [...src, S('RCP-spiramycine-IV', '§4.1', 'Pneumopathies aigües', 'choix')] });
    f.option({ id: 'pac-hosp-atyp-levo', libelle: 'Lévofloxacine', type: 'probabiliste', rang: 'conditionnelle', condition: 'uniquement si allergie grave aux bêta-lactamines ou contre-indication aux macrolides', items: [I.LEVO], duree, sources: [S(SP, 'tableau 6, note', 'Lévofloxacine : uniquement si allergie grave aux bêtalactamines ou si contre-indication aux macrolides en cas de suspicion de bactérie atypique', 'choix'), SRC.ansmFq], commentaire: TEXTE_LEVO });
    return;
  }
  if (orient === 'grippe') {
    f.option({ id: 'pac-hosp-grippe-amc', libelle: 'Amoxicilline-acide clavulanique (contexte grippal)', type: 'probabiliste', rang: 'premiere_ligne', items: [I.AMC], duree, sources: [S(SP, '§2-2, p. 7 (grippe)', 'amoxicilline-acide clavulanique (Grade C-1)', 'choix')] });
    c3gAllergiePenicilline(f, 'pac-hosp-grippe-c3g', al, duree);
    optionLevo(f, 'pac-hosp-grippe-levo', al, duree, srcLevo);
    return;
  }
  const comorb = comorbidite(ctx);
  const srcSans = S(SP, '§2-2, p. 7', 'Patient sans comorbidité : amoxicilline per os ou injectable (Grade A-1) ; en cas d\'allergie aux pénicillines : C3G injectable (Grade B-1)', 'choix');
  const srcAvec = S(SP, '§2-2, p. 7', 'soit amoxicilline-acide clavulanique per os ou injectable, soit C3G injectable (Grade B-1)', 'choix');
  if (comorb === 'inconnu') f.manque('comorbidité de la liste SPILF 2025 (tableau 3)', 'amoxicilline (aucune comorbidité) ou amoxicilline-acide clavulanique / C3G (au moins une)', 'bloque_decision');
  if (comorb !== 'oui') {
    f.option({ id: 'pac-hosp-amox', libelle: 'Amoxicilline per os ou IV', type: 'probabiliste', rang: comorb === 'non' ? 'premiere_ligne' : 'conditionnelle', condition: comorb === 'non' ? undefined : 'si aucune comorbidité de la liste SPILF 2025', items: [I.AMOX], duree, sources: [srcSans] });
    c3gAllergiePenicilline(f, 'pac-hosp-c3g-allergie', al, duree, comorb !== 'non');
  }
  if (comorb !== 'non') {
    const rang = comorb === 'oui' ? ('premiere_ligne' as const) : ('conditionnelle' as const);
    const condition = comorb === 'oui' ? undefined : 'si au moins une comorbidité de la liste SPILF 2025';
    f.option({ id: 'pac-hosp-amc', libelle: 'Amoxicilline-acide clavulanique per os ou IV', type: 'probabiliste', rang, condition, items: [I.AMC], duree, sources: [srcAvec] });
    f.option({ id: 'pac-hosp-c3g', libelle: 'Ceftriaxone (C3G injectable)', type: 'probabiliste', rang, condition, items: [I.CRO1], duree, sources: [srcAvec], commentaire: 'Amoxicilline-acide clavulanique ou C3G injectable, au même rang (SPILF 2025) ; céfotaxime 1 g × 3/j possible.' });
  }
  optionLevo(f, 'pac-hosp-levo', al, duree, srcLevo);
}

function c3gAllergiePenicilline(f: Fiche, id: string, al: ReturnType<typeof allergies>, duree: DureeDecidee, toujoursConditionnelle = false) {
  const premiere = al.penicillineSeule && !toujoursConditionnelle;
  f.option({ id, libelle: 'Ceftriaxone (allergie aux pénicillines)', type: 'probabiliste', rang: premiere ? 'premiere_ligne' : 'conditionnelle', condition: premiere ? undefined : 'en cas d\'allergie aux pénicillines sans contre-indication aux C3G', items: [I.CRO1], duree, sources: [S(SP, '§2-2, p. 7', 'en cas d\'allergie aux pénicillines : C3G injectable (Grade B-1)', 'choix')] });
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
  const exclu = orient === 'grippe' ? 'étiologie grippale' : orient === 'inhalation' ? 'pneumonie d\'inhalation' : ctx.dossier.patient.neutropenie === 'oui' ? 'myélosuppression' : undefined;
  const srcExcl = S(SP, 'p. 9-10', 'en dehors d\'un contexte de myélosuppression, de pneumonie d\'inhalation ou d\'étiologie grippale (Grade A-1)', 'geste');
  if (exclu) {
    f.geste(`Corticoïdes : l'hydrocortisone de la PAC grave n'est pas recommandée dans ce contexte (${exclu} : exclusion de la SPILF 2025).`, [srcExcl]);
    return;
  }
  f.geste(
    `${lieu === 'soins_critiques' ? '' : 'Si admission en soins critiques : '}hémisuccinate d'hydrocortisone 200 mg/j (IVSE), débuté dans les 24 h suivant l'apparition des signes de gravité, réévalué à J4 pour la décroissance, durée totale 8 à 14 jours (SPILF 2025, grade A-1 ; hors myélosuppression, inhalation et grippe). Divergence entre les sources, non tranchée par l'application : ERS/ESICM 2023, seulement en cas de choc ; ATS/IDSA 2019, pas en routine ; SCCM 2024, recommandation forte.`,
    [
      S(SP, 'p. 9-10', 'l\'adjonction d\'hémisuccinate d\'hydrocortisone, débutée dans les 24 heures suivant l\'apparition des signes de gravité et à la posologie de 200 mg par jour', 'geste'),
      srcExcl,
      S(SPD, 'diapo 19', 'Posologie de 200 mg/j (IVSE) : J1-J4', 'geste'),
      S(ERS23, 'Q6', 'we suggest the use of corticosteroids if shock is present', 'geste'),
      S(ATS19, 'corticoïdes', 'We suggest not routinely using corticosteroids in adults with severe CAP', 'geste'),
      S(SCCM, 'résumé', 'a strong recommendation for use in hospitalized patients with severe CAP', 'geste'),
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
}

const DUREE_GRAVE: DureeDecidee = {
  texte: 'Non fixée par la SPILF 2025 pour la PAC grave (la règle des 3, 5 ou 7 jours ne vise que les PAC non graves et modérément graves) : à décider à la réévaluation, avec le réanimateur ou le SMIT. ERS/ESICM 2023 : procalcitonine suggérée pour raccourcir la durée.',
  pointDeDepart: 'premier jour de traitement',
  sources: [S(SP, 'p. 8', 'PAC non graves (ambulatoires) et modérément graves (hospitalisation hors soins critiques)', 'duree'), S(ERS23, 'Q4', 'We suggest the use of PCT to reduce the duration of antibiotic treatment in patients with sCAP', 'duree')],
};

function pacGrave(ctx: ContexteDecision, f: Fiche, orient: string, lieu: string) {
  const al = allergies(ctx);
  f.situation('pac-grave', 'Pneumonie aiguë communautaire grave', 'couverte', 'SPILF/SPLF 2025 : C3G injectable + macrolide (lévofloxacine seule en cas d\'allergie), bêta-lactamine anti-P. aeruginosa si facteur de risque, schéma anti-toxinique si LPV ; pas de recommandation propre aux soins critiques ; durée non fixée.');
  communGrave(ctx, f, orient, lieu);
  f.absence('Durée de l\'antibiothérapie de la PAC grave', 'Recherche du 2026-11-06 : la SPILF/SPLF 2025 limite la règle des 3, 5 ou 7 jours aux PAC non graves et modérément graves et ne fait pas de recommandation propre aux soins critiques ; l\'ERS/ESICM 2023 suggère la procalcitonine pour raccourcir la durée.', ['Décider la durée à la réévaluation, avec le réanimateur ou le SMIT'], [DUREE_GRAVE.sources[0], S(SP, 'p. 3-4', 'Ce texte s\'applique également aux cas des pneumonies graves, sans toutefois proposer de recommandations sur la prise en charge spécifique en soins critiques', 'choix')]);
  f.reeval('Désescalade rapide vers une bêta-lactamine seule en l\'absence d\'argument pour une bactérie atypique ; pas de bithérapie après documentation (sauf SASM producteur de LPV).', [S(SP, 'p. 8-9', 'La désescalade vers une monothérapie par bêtalactamine devra être rapidement envisagée en l\'absence d\'argument […] en faveur d\'une PAC à bactérie atypique (Grade B-1)', 'choix'), SRC.documentation], 72);
  if (orient === 'lpv') return lpv(f, al);
  const srcBase = [
    S(SP, '§2-3, p. 7', 'C3G injectable associée à un macrolide ou, en cas d\'allergie à l\'une des deux classes médicamenteuses, monothérapie par fluoroquinolone antipneumococcique (lévofloxacine) (Grade B-1)', 'choix'),
    S(SP, 'p. 8-9', 'une bithérapie probabiliste associant bêtalactamine (C3G) et macrolide est recommandée', 'choix'),
    S(ERS23, 'Q3', 'We suggest the addition of macrolides, not fluoroquinolones, to beta-lactams as empirical antibiotic therapy in hospitalised patients with sCAP', 'choix'),
  ];
  const fdr = r(ctx, 'pneumonie.fdr_pyo');
  const pyo = fdr === 'colonisation' || fdr === 'autre';
  if (fdr === 'inconnu') f.manque('facteur de risque de P. aeruginosa (colonisation < 1 an, antibiothérapie parentérale < 3 mois, BPCO sévère, bronchectasies, trachéotomie)', 'PAC grave : C3G + macrolide, ou bêta-lactamine anti-P. aeruginosa + molécule active sur les atypiques (SPILF 2025)', 'bloque_decision');
  const noteMacrolide = 'Macrolide IV : spiramycine (AMM IV « pneumopathies aigües ») ou clarithromycine IV (hors AMM). Azithromycine non proposée en soins critiques : forme IV non disponible en France et tableau 10 discordant (article français : une seule valeur ; article anglais : deux colonnes ; diaporama : « Non »).';
  if (!pyo) {
    const rang = fdr === 'non' ? ('premiere_ligne' as const) : ('conditionnelle' as const);
    const condition = fdr === 'non' ? undefined : 'si aucun facteur de risque de P. aeruginosa';
    f.option({ id: 'pac-grave-c3g-spira', libelle: 'Ceftriaxone + spiramycine IV', type: 'probabiliste', rang, condition, items: [I.CRO2, I.SPIRA_IV3], duree: DUREE_GRAVE, sources: srcBase, commentaire: `${noteMacrolide}${orient === 'grippe' ? ' Contexte grippal : pas de corticoïdes.' : ''}` });
    f.option({ id: 'pac-grave-c3g-clari', libelle: 'Ceftriaxone + clarithromycine IV (hors AMM)', type: 'probabiliste', rang: fdr === 'non' ? 'alternative' : 'conditionnelle', condition, items: [I.CRO2, I.CLARI_IV], duree: DUREE_GRAVE, sources: srcBase, commentaire: 'Clarithromycine IV : AMM limitée aux mycobactéries atypiques du SIDA (hors AMM ici). Ordre des macrolides choisi par l\'application (spiramycine dans son AMM IV) : la SPILF ne les hiérarchise pas.' });
    f.option({ id: 'pac-grave-ctx-spira', libelle: 'Céfotaxime + spiramycine IV', type: 'probabiliste', rang: fdr === 'non' ? 'alternative' : 'conditionnelle', condition, items: [I.CTX_SC, I.SPIRA_IV3], duree: DUREE_GRAVE, sources: srcBase, commentaire: 'Posologie du céfotaxime en soins critiques divergente (80 à 100 mg/kg/j dans l\'article, 100 mg/kg/j dans le diaporama) : brouillon.' });
  }
  if (pyo || fdr === 'inconnu') {
    const srcPyo = [
      S(SP, 'p. 9', 'chez les patients hospitalisés avec une PAC grave admis en soins critiques et présentant au moins un facteur de risque parmi : antibiothérapie parentérale récente (moins de trois mois), BPCO sévère, bronchectasies et/ou trachéotomie (Grade B-1)', 'choix'),
      S(SP, 'p. 9', 'céfépime ou l\'association pipéracilline-tazobactam', 'choix'),
      S(SP, 'p. 9', 'devra également comporter une molécule active sur les bactéries atypiques (Grade B-1)', 'choix'),
    ];
    const rang = pyo ? ('premiere_ligne' as const) : ('conditionnelle' as const);
    const condition = pyo ? undefined : 'si facteur de risque de P. aeruginosa';
    const commentaire = `${fdr === 'colonisation' ? 'Colonisation connue : choisir selon le dernier antibiogramme (C-1). ' : ''}Aztréonam et ceftazidime exclus du probabiliste (avis d'expert). Posologies de la bêta-lactamine non données par la SPILF 2025 : RCP. ${noteMacrolide}`;
    f.option({ id: 'pac-grave-pyo-fep', libelle: 'Céfépime + spiramycine IV', type: 'probabiliste', rang, condition, items: [I.FEP, I.SPIRA_IV3], duree: DUREE_GRAVE, sources: srcPyo, commentaire });
    f.option({ id: 'pac-grave-pyo-tzp', libelle: 'Pipéracilline-tazobactam + spiramycine IV', type: 'probabiliste', rang, condition, items: [I.TZP, I.SPIRA_IV3], duree: DUREE_GRAVE, sources: srcPyo, commentaire });
    if (pyo) f.controle({ id: 'ctl-pac-grave-pyo-doc', type: 'prelevement', categorie: 'indique', quoi: 'Documentation bactériologique (prélèvement respiratoire)', quand: { ancre: 'avant_traitement', texte: 'Avant l\'antibiothérapie' }, pourquoi: 'Bêta-lactamine anti-P. aeruginosa.', sources: [S(SP, 'p. 9', 'fortement recommandé de réaliser des examens de documentation bactériologique', 'controle_micro')] });
    if (pyo && al.ciBL) f.avis('PAC grave avec facteur de risque de P. aeruginosa et allergie aux bêta-lactamines : aucun schéma précisé par la SPILF 2025 ; avis infectiologique.', true, srcPyo);
  }
  if (!pyo) {
    const premiere = al.c3g || al.macro;
    f.option({ id: 'pac-grave-levo', libelle: 'Lévofloxacine IV en monothérapie (allergie)', type: 'probabiliste', rang: premiere ? 'premiere_ligne' : 'conditionnelle', condition: premiere ? undefined : 'en cas d\'allergie aux C3G (bêta-lactamines) ou aux macrolides', items: [I.LEVO_SC], duree: DUREE_GRAVE, sources: [srcBase[0], S(SPD, 'diapo 13', 'Lévofloxacine (uniquement si allergie contre indiquant l\'utilisation de bêta-lactamines)', 'choix'), SRC.ansmFq], commentaire: `${TEXTE_LEVO} Ne pas associer à la spiramycine IV (association contre-indiquée par le RCP de la forme IV).` });
  }
}

function lpv(f: Fiche, al: ReturnType<typeof allergies>) {
  const src = [S(SP, 'tableau 9, p. 7', 'C3G parentérale (céfotaxime ou ceftriaxone) + macrolide + linézolide', 'choix'), S(SP, '§2-3, p. 7', 'nécessite l\'utilisation d\'une molécule avec une activité anti-toxinique (Tableau 9) (Grade B-1)', 'choix')];
  f.avis('Suspicion de pneumonie à S. aureus producteur de LPV : avis infectiologique ; le linézolide se débute à l\'hôpital après avis d\'un spécialiste (RCP).', true, [S('RCP-linezolide', '§4.1', 'Un traitement par le linézolide devra être débuté uniquement en milieu hospitalier et après avis d\'un spécialiste tel qu\'un microbiologiste ou un infectiologue', 'choix')]);
  f.option({ id: 'pac-grave-lpv', libelle: 'Ceftriaxone + spiramycine IV + linézolide (LPV)', type: 'probabiliste', rang: 'premiere_ligne', items: [I.CRO2, I.SPIRA_IV3, I.LZD], duree: DUREE_GRAVE, sources: src, commentaire: 'Alternative de la SPILF 2025 (tableau 9) : C3G + vancomycine + clindamycine — clindamycine non disponible dans cette version de la base.' });
  f.option({ id: 'pac-grave-lpv-allergie', libelle: 'Lévofloxacine + linézolide (LPV, allergie aux bêta-lactamines)', type: 'probabiliste', rang: al.c3g ? 'premiere_ligne' : 'conditionnelle', condition: al.c3g ? undefined : 'en cas d\'allergie aux bêta-lactamines', items: [I.LEVO_SC, I.LZD], duree: DUREE_GRAVE, sources: [S(SP, 'tableau 9, p. 7', 'En cas d\'allergie aux bêta-lactamines : lévofloxacine + linézolide', 'choix')], commentaire: TEXTE_LEVO });
  f.reeval('Documentation : SASM producteur de LPV → pénicilline M (IV) ou céfazoline + clindamycine ou rifampicine ; SARM producteur de LPV → linézolide en monothérapie.', [S(SP, 'tableau 9, p. 7', 'Pénicilline M (IV) ou céfazoline + Clindamycine ou rifampicine', 'choix'), S(SP, 'p. 8-9', 'En cas de pneumonie grave à SARM producteur de LPV, une monothérapie par linézolide est recommandée', 'choix')]);
}

/* ------------------------------ Légionellose ------------------------------ */

function legionellose(ctx: ContexteDecision, f: Fiche, lieu: string, grave: boolean) {
  const al = allergies(ctx);
  const immuno = ctx.dossier.patient.immunodepression === 'oui';
  f.situation('legionellose', `Légionellose${grave ? ' grave' : ' non grave'}${immuno ? ', patient immunodéprimé' : ''}`, 'couverte', 'SPILF 2026 (diaporama ; article non trouvé) et SPILF 2025 (tableau 7) : monothérapie ; macrolide (azithromycine) si forme non grave chez l\'immunocompétent ; lévofloxacine si forme grave ou immunodépression. Durées suggérées : durée optimale non démontrée.');
  f.geste('Légionellose : maladie à déclaration obligatoire.', [S(LEG, 'diapo 2', 'Maladie à déclaration obligatoire', 'geste')]);
  f.controle({ id: 'ctl-legio-ag', type: 'prelevement', categorie: 'indique', quoi: 'Antigénurie Legionella', quand: { ancre: 'avant_traitement', texte: 'Au diagnostic' }, pourquoi: 'Test diagnostique de référence ; ne détecte que le sérogroupe 1 (sensibilité < 50 % dans les formes modérées).', ensuite: 'Négative avec suspicion persistante : PCR sur prélèvement respiratoire profond.', sources: [S(LEG, 'diapo 3', 'Antigénurie : test diagnostique de référence', 'controle_micro'), S(LEG, 'diapo 3', 'Ne détecte que le sérogroupe Lp1', 'controle_micro')] });
  f.controle({ id: 'ctl-legio-pcr', type: 'prelevement', categorie: 'conditionnel', quoi: 'PCR Legionella sur prélèvement respiratoire profond (pas de sérologie)', quand: { ancre: 'avant_traitement', texte: 'Si l\'antigénurie est négative ou pour documenter la souche' }, pourquoi: 'PCR uniquement sur prélèvements respiratoires profonds ; la sérologie n\'est pas recommandée.', sources: [S(LEG, 'diapo 3', 'PCR uniquement sur prélèvements respiratoires profonds', 'controle_micro'), S(LEG, 'diapo 3', 'La sérologie légionnelle n\'est pas recommandée', 'controle_micro')] });
  f.alerte('info', 'Légionellose : bithérapie non recommandée ; rifampicine sans indication ; doxycycline d\'efficacité non démontrée.', [S(LEG, 'diapo 5', 'Bithérapie non recommandée', 'choix'), S(LEG, 'diapo 8', 'Pas d\'indication dans la légionellose', 'choix')]);
  if (grave) {
    communGrave(ctx, f, 'legionellose', lieu);
    f.reeval('Relais oral dès la stabilité clinique.', [S(LEG, 'diapo 11', '*Relais oral dès stabilité clinique', 'choix')], 72);
  }
  const srcDiapo10 = S(LEG, 'diapo 10', 'Durée optimale de l\'antibiothérapie non démontrée', 'duree');
  const d = (n: number, extrait: string, texte?: string) => jours(n, [S(LEG, 'diapo 11', extrait, 'duree'), srcDiapo10], `${texte ?? `${n} jours`} (durée suggérée ; durée optimale non démontrée)`);
  const nonPrecisee = (cas: string): DureeDecidee => ({ texte: `Durée non précisée par le diaporama SPILF 2026 pour cette molécule ${cas}`, pointDeDepart: 'premier jour de traitement', sources: [srcDiapo10] });
  const srcLevoMacro = S(SP, 'tableau 7, p. 6', 'Légionellose : Macrolide* ; Si forme grave ou contre-indication aux macrolides : lévofloxacine', 'choix');
  const srcGraveID = S(LEG, 'diapo 5', 'Forme grave et/ou patient immunodéprimé : Lévofloxacine en monothérapie ; Alternatives : Clarithromycine ou Spiramycine', 'choix');
  if (!grave && !immuno) {
    const ex = 'Forme non grave, immunocompétent : 3 jours si Azithromycine ; 7 jours si Clarithromycine, Roxithromycine, Spiramycine ou Lévofloxacine (si CI aux macrolides)';
    const src = [S(LEG, 'diapo 5', 'Forme non grave, patient non immunodéprimé : Traitement possible en ambulatoire ; Macrolide en monothérapie : Azithromycine', 'choix'), srcLevoMacro];
    f.option({ id: 'legio-azi', libelle: 'Azithromycine (hors AMM)', type: 'probabiliste', rang: 'premiere_ligne', items: [I.AZI500], duree: d(3, ex), sources: src, commentaire: 'Hors AMM : la pneumonie ne figure pas dans les indications du RCP ZITHROMAX 250 mg. Traitement possible en ambulatoire. Roxithromycine (alternative citée) : RCP non lu.' });
    f.option({ id: 'legio-clari', libelle: 'Clarithromycine', type: 'probabiliste', rang: 'alternative', items: [I.CLARI], duree: d(7, ex), sources: src });
    f.option({ id: 'legio-spira', libelle: 'Spiramycine', type: 'probabiliste', rang: 'alternative', items: [I.SPIRA], duree: d(7, ex), sources: src, commentaire: 'SPILF 2026 : 1,5 à 3 MUI × 3/j hors soins critiques.' });
    f.option({ id: 'legio-levo', libelle: 'Lévofloxacine (contre-indication aux macrolides)', type: 'probabiliste', rang: al.macro ? 'premiere_ligne' : 'conditionnelle', condition: al.macro ? undefined : 'si contre-indication aux macrolides', items: [I.LEVO], duree: d(7, ex), sources: [srcLevoMacro, SRC.ansmFq], commentaire: TEXTE_LEVO });
    return;
  }
  if (!grave) {
    const ex = 'Patients immunodéprimés non graves : 5 jours si Azithromycine, 10 jours si Lévofloxacine ou Clarithromycine';
    f.option({ id: 'legio-id-levo', libelle: 'Lévofloxacine (patient immunodéprimé)', type: 'probabiliste', rang: 'premiere_ligne', items: [I.LEVO], duree: d(10, ex), sources: [srcGraveID, SRC.ansmFq], commentaire: `${TEXTE_LEVO} Le même diaporama donne aussi une durée pour l'azithromycine chez l'immunodéprimé non grave (5 jours, diapo 11) alors que la diapo 5 retient la lévofloxacine : incohérence interne non tranchée, azithromycine non proposée.` });
    f.option({ id: 'legio-id-clari', libelle: 'Clarithromycine (patient immunodéprimé)', type: 'probabiliste', rang: 'alternative', items: [I.CLARI], duree: d(10, ex), sources: [srcGraveID] });
    f.option({ id: 'legio-id-spira', libelle: 'Spiramycine (patient immunodéprimé)', type: 'probabiliste', rang: 'alternative', items: [I.SPIRA], statut: 'brouillon', duree: nonPrecisee('chez l\'immunodéprimé non grave (seules l\'azithromycine, la lévofloxacine et la clarithromycine ont une durée suggérée).'), sources: [srcGraveID] });
    return;
  }
  const ex = immuno ? 'Patients immunodéprimés graves* : 10 jours : Lévofloxacine IV ou Clarithromycine IV' : 'Pneumonie grave* : 7 jours : Spiramycine IV ou Clarithromycine IV ou Lévofloxacine IV';
  const n = immuno ? 10 : 7;
  f.option({ id: 'legio-g-levo', libelle: 'Lévofloxacine IV en monothérapie', type: 'probabiliste', rang: 'premiere_ligne', items: [I.LEVO_SC], duree: d(n, ex), sources: [srcGraveID, srcLevoMacro, SRC.ansmFq], commentaire: `${TEXTE_LEVO} Pas de bithérapie ; ne pas associer à la spiramycine IV (contre-indiquée avec la lévofloxacine, RCP).` });
  f.option({ id: 'legio-g-spira', libelle: 'Spiramycine IV', type: 'probabiliste', rang: 'alternative', items: [I.SPIRA_IV3], statut: immuno ? 'brouillon' : undefined, duree: immuno ? nonPrecisee('chez l\'immunodéprimé grave (seules la lévofloxacine et la clarithromycine IV ont une durée suggérée).') : d(n, ex), sources: [srcGraveID], commentaire: 'Contre-indiquée avec la lévofloxacine et les autres médicaments donnant des torsades de pointes (RCP de la forme IV) : attention au relais.' });
  f.option({ id: 'legio-g-clari', libelle: 'Clarithromycine IV (hors AMM)', type: 'probabiliste', rang: 'alternative', items: [I.CLARI_IV], duree: d(n, ex), sources: [srcGraveID], commentaire: 'Hors AMM : l\'AMM de la forme IV se limite aux mycobactéries atypiques du SIDA.' });
}

/* -------------------------- Pneumonie d'inhalation -------------------------- */

function inhalation(ctx: ContexteDecision, f: Fiche, lieu: string, grave: boolean) {
  const al = allergies(ctx);
  f.situation('pneumonie-inhalation', `Pneumonie d'inhalation${grave ? ' grave' : ''}`, 'couverte', 'SPILF/SFGG 2025 (diaporama ; article non lisible) : amoxicilline-acide clavulanique en 1re intention, pas de métronidazole ; pipéracilline-tazobactam si forme grave avec facteur de risque de P. aeruginosa ; 5 jours si évolution favorable à 72 h.');
  if (lieu === 'ambulatoire') f.alerte('attention', 'La pneumonie d\'inhalation fait partie des critères d\'hospitalisation de 2010.', [S(AF, 'figure 1, p. 2', 'pneumonie d\'inhalation ou sur obstacle trachéo-bronchique connu ou suspecté', 'definition')]);
  f.controle({ id: 'ctl-inh-scanner', type: 'imagerie', categorie: 'indique', quoi: 'Scanner thoracique sans injection', quand: { ancre: 'non_determine', texte: 'En priorité' }, pourquoi: 'Imagerie de la pneumonie d\'inhalation.', sources: [S(INH, 'diapo 6', 'En priorité un scanner thoracique sans injection', 'imagerie')] });
  f.controle({ id: 'ctl-inh-micro', type: 'prelevement', categorie: 'non_systematique', quoi: 'Examens bactériologiques, antigénuries pneumocoque et Legionella', quand: { ancre: 'non_determine', texte: 'Pas d\'examen systématique' }, pourquoi: 'Aucun examen bactériologique systématique ; antigénuries non recommandées.', sources: [S(INH, 'diapo 7', 'Aucun examen complémentaire bactériologique systématique n\'est recommandé', 'controle_micro'), S(INH, 'diapo 7', 'Les antigénuries (pneumocoque et légionelle) ne sont pas recommandées', 'controle_micro')] });
  f.controle({ id: 'ctl-inh-ecbc', type: 'prelevement', categorie: 'conditionnel', quoi: 'ECBC', quand: { ancre: 'avant_traitement', texte: 'Avant toute antibiothérapie active sur P. aeruginosa' }, pourquoi: 'Documentation avant un traitement anti-P. aeruginosa.', sources: [S(INH, 'diapo 7', 'Un ECBC doit être réalisé avant l\'initiation d\'une antibiothérapie à activité anti-P. aeruginosa', 'controle_micro')] });
  f.geste('Réévaluer les médicaments favorisant l\'inhalation : psychotropes, anticholinergiques, inhibiteurs de la pompe à protons.', [S(INH, 'diapo 14', 'Les inhibiteurs de la pompe à proton', 'geste')]);
  f.alerte('info', 'Pas de métronidazole ni de traitement anti-anaérobie spécifique (SPILF/SFGG 2025 ; ERS/ESICM 2023).', [S(INH, 'diapo 8', 'Il est recommandé de ne pas associer le métronidazole', 'choix'), S(ERS23, 'Q8', 'we suggest standard CAP therapy regimen and not specific therapy targeting anaerobic bacteria', 'choix')]);
  if (grave) communGrave(ctx, f, 'inhalation', lieu, false);
  const stab = r(ctx, 'pneumonie.stabilite');
  const srcD = [S(INH, 'diapo 13', '5 jours en cas d\'évolution clinique favorable', 'duree'), S(INH, 'diapo 13', 'La persistance de la toux n\'est pas un critère de non-amélioration', 'duree')];
  const duree: DureeDecidee =
    stab === 'j3_j5' || stab === 'non'
      ? { texte: 'Évolution non favorable à 72 h : durée non précisée par la SPILF/SFGG 2025 (relais par pipéracilline-tazobactam) ; à décider avec le SMIT.', pointDeDepart: 'premier jour de traitement', sources: srcD }
      : jours(5, srcD, '5 jours si l\'évolution est favorable à 72 h (tous les critères de stabilité clinique) ; la persistance de la toux n\'est pas un critère de non-amélioration');
  f.reeval('Évaluation à 72 h par les critères de stabilité clinique ; sans évolution favorable : relais par pipéracilline-tazobactam.', [S(INH, 'diapo 9', 'Relais par pipéracilline – tazobactam', 'choix')], 72);
  const commentaireAmc = 'Paliers rénaux divergents : diaporama SPILF/SFGG (DFG 10-30 : 1 g en dose de charge puis 0,5 g toutes les 8 h ; < 10 : 0,5 g toutes les 24 h) et RCP affiché ci-dessous (ClCr 10-30 : 500 mg × 2/j) — non tranché.';
  const srcAmc = [S(INH, 'diapo 8', 'Traitement de première intention : amoxicilline - ac. clavulanique PO ou IV', 'choix')];
  if (!grave) {
    f.option({ id: 'inh-amc', libelle: 'Amoxicilline-acide clavulanique per os ou IV', type: 'probabiliste', rang: 'premiere_ligne', items: [I.AMC], duree, sources: srcAmc, commentaire: commentaireAmc });
    f.option({ id: 'inh-cro', libelle: 'Ceftriaxone IV ou SC en monothérapie', type: 'probabiliste', rang: al.penicillineSeule ? 'premiere_ligne' : 'conditionnelle', condition: al.penicillineSeule ? undefined : 'allergie à la pénicilline sans contre-indication aux C3G, ou voies orale et IV impossibles (voie SC)', items: [I.CRO1], duree, sources: [S(INH, 'diapo 8', 'Allergie à la pénicilline sans contre-indication à l\'utilisation des C3G : ceftriaxone IV ou SC en monothérapie', 'choix'), S(INH, 'diapo 8', 'Impossibilité d\'utiliser la voie orale et IV : ceftriaxone SC en monothérapie', 'choix')] });
    f.option({ id: 'inh-sxt', libelle: 'Cotrimoxazole per os ou IV', type: 'probabiliste', rang: al.ciBL ? 'premiere_ligne' : 'conditionnelle', condition: al.ciBL ? undefined : 'contre-indication aux bêta-lactamines', items: [I.SXT_INH], duree, sources: [S(INH, 'diapo 8', 'Contre-indication aux bétalactamines : cotrimoxazole PO ou IV', 'choix')], commentaire: 'Paliers rénaux divergents : diaporama (DFG 15-30 : 800 mg toutes les 24 h ; < 15 : 800 mg toutes les 48 h) et RCP affiché ci-dessous (< 15 hors dialyse : ne pas utiliser) — non tranché.' });
    return;
  }
  const fdr = r(ctx, 'pneumonie.fdr_pyo');
  const sarm = r(ctx, 'pneumonie.sarm');
  const pyo = fdr === 'colonisation' || fdr === 'autre';
  if (fdr === 'inconnu') f.manque('facteur de risque de P. aeruginosa (colonisation < 1 an, antibiothérapie parentérale < 3 mois, BPCO sévère, bronchectasies, trachéotomie)', 'pneumonie d\'inhalation grave : pipéracilline-tazobactam si au moins un facteur (SPILF/SFGG 2025)', 'bloque_decision');
  if (sarm === 'inconnu') f.manque('colonisation connue à SARM', 'pneumonie d\'inhalation grave : ajout du linézolide si colonisation à SARM (SPILF/SFGG 2025)', 'affine');
  const plusLzd = sarm === 'oui' ? [I.LZD] : [];
  const srcLzd = sarm === 'oui' ? [S(INH, 'diapo 10', 'Patients précédemment connu colonisé à SARM', 'choix'), S(INH, 'diapo 10', 'Ajout du linezolide', 'choix')] : [];
  if (pyo || fdr === 'inconnu')
    f.option({ id: 'inh-g-tzp', libelle: `Pipéracilline-tazobactam${sarm === 'oui' ? ' + linézolide' : ''}`, type: 'probabiliste', rang: pyo ? 'premiere_ligne' : 'conditionnelle', condition: pyo ? undefined : 'si au moins un facteur de risque de P. aeruginosa', items: [I.TZP_INH, ...plusLzd], duree, sources: [S(INH, 'diapo 10', 'Piperacilline-tazobactam en traitement probabiliste', 'choix'), ...srcLzd], commentaire: 'ECBC avant l\'antibiothérapie anti-P. aeruginosa.' });
  if (!pyo)
    f.option({ id: 'inh-g-amc', libelle: `Amoxicilline-acide clavulanique IV${sarm === 'oui' ? ' + linézolide' : ''}`, type: 'probabiliste', rang: fdr === 'non' ? 'premiere_ligne' : 'conditionnelle', condition: fdr === 'non' ? undefined : 'si aucun facteur de risque de P. aeruginosa', items: [I.AMC, ...plusLzd], statut: 'brouillon', duree, sources: [...srcAmc, S(INH, 'diapo 10', 'En cas pneumonie grave dont le mécanisme est incertain : Appliquer les recommandations de la SPILF de 2025 sur la PAC grave.', 'choix'), ...srcLzd], commentaire: `Forme grave sans facteur de risque de P. aeruginosa : le diaporama ne donne pas de schéma propre (1re intention générale de la pneumonie d'inhalation, brouillon) ; si le mécanisme est incertain, appliquer le schéma de la PAC grave (SPILF 2025). ${commentaireAmc}` });
}

/* ------------------------------------------------------------------ */
/* Pneumonies associées aux soins                                      */
/* ------------------------------------------------------------------ */

function associeeAuxSoins(ctx: ContexteDecision, f: Fiche) {
  const lieu = r(ctx, 'pneumonie.soins_lieu');
  if (lieu === 'inconnu') {
    f.situation('pneumonie-soins-a-preciser', 'Pneumonie associée aux soins : lieu de survenue à préciser', 'partielle', 'Réanimation (PAVM ou pneumonie acquise à l\'hôpital grave) : RFE SFAR/SRLF 2017 ; hors réanimation : aucun texte français.');
    f.manque('lieu de survenue (réanimation sous ventilation, réanimation sans ventilation, hors réanimation)', 'seule la pneumonie de réanimation a une recommandation française (SFAR/SRLF 2017)', 'bloque_decision');
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
  if (p.immunodepression === 'oui')
    f.alerte('attention', 'Patient immunodéprimé : la monothérapie probabiliste de la SFAR/SRLF (R3.2) ne vise que le patient immunocompétent ; avis infectiologique.', [S(SFAR, 'R3.2', 'Il faut traiter par monothérapie en probabiliste les pneumonies associées aux soins du patient immunocompétent sous ventilation mécanique', 'choix')]).avis('Avis infectiologique (pneumonie associée aux soins, patient immunodéprimé).', true, [srcR31]);
  const delai = r(ctx, 'pneumonie.delai');
  const eer = p.renal.dialyse === 'eer_continue';
  const fdr = eer ? 'oui' : r(ctx, 'pneumonie.fdr_bmr');
  const sarm = r(ctx, 'pneumonie.sarm');
  const blse = p.antecedentsMicro.some((a) => a.resistance === 'BLSE');
  if (delai === 'inconnu') f.manque('délai d\'apparition (< 5 jours ou ≥ 5 jours)', 'schéma probabiliste de la SFAR/SRLF 2017 (précoce ou tardive)', 'bloque_decision');
  if (fdr === 'inconnu') f.manque('facteur de risque de BMR ou de BGN non fermentant', 'monothérapie ou association (SFAR/SRLF 2017, R3.2)', 'bloque_decision');
  if (sarm === 'inconnu') f.manque('facteur de risque de SARM', 'ajout d\'un anti-SARM seulement en présence d\'un facteur de risque (SFAR/SRLF 2017, R3.3)', 'affine');
  const colonne = delai === 'tardive' || fdr === 'oui' ? 'pyo' : delai === 'precoce' && fdr === 'non' ? (choc ? 'choc' : 'mono') : undefined;
  const srcProto = S(SFAR, 'protocole n° 4, p. 23', 'Posologies données à titre indicatif pour un patient avec fonction rénale normale et poids standard', 'choix');
  const srcR32 = S(SFAR, 'R3.2', 'Il faut traiter par monothérapie en probabiliste les pneumonies associées aux soins du patient immunocompétent sous ventilation mécanique, en dehors de la présence de facteurs de risque de bactéries multirésistantes', 'choix');
  const srcBi = S(SFAR, 'argumentaire R3.2, p. 18', 'En présence d\'au moins un de ces facteurs de risque, la bithérapie lors du traitement probabiliste est indiquée', 'choix');
  const srcR33 = S(SFAR, 'R3.3', 'Les experts suggèrent de ne pas utiliser de manière probabiliste et systématique un antibiotique actif contre Staphylococcus aureus résistant à la méticilline', 'choix');
  const ajoutSarm = sarm === 'oui' ? [I.VAN] : [];
  const libSarm = sarm === 'oui' ? ' + vancomycine' : '';
  const noteSarm = sarm === 'oui' ? ' Facteur de risque de SARM : vancomycine ajoutée (ou linézolide 600 mg × 2/j) ; SFAR 2017 : vancomycine 15 mg/kg puis 30 à 40 mg/kg/j, schéma affiché = celui de la base (dose de charge 25 mg/kg puis 30 mg/kg/j en continu) — divergence non tranchée.' : '';
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
  const opt = (id: string, libelle: string, rang: 'premiere_ligne' | 'alternative' | 'conditionnelle', items: ItemPrescription[], sources: SourceRef[], commentaire: string, condition?: string) =>
    f.option({ id, libelle, type: 'probabiliste', rang, condition, items, duree, statut: 'brouillon', sources: [...sources, srcProto], commentaire: `${commentaire}${noteSarm} Protocole SFAR/SRLF 2017 : avis d'experts, correspondance molécule/posologie reconstituée.` });
  const cond = (c: typeof colonne, texte: string) => (colonne === c ? undefined : texte);
  const rangDe = (c: typeof colonne) => (colonne === c ? ('premiere_ligne' as const) : ('conditionnelle' as const));
  if (colonne === 'mono' || colonne === undefined) {
    const c = 'si pneumonie précoce (< 5 jours), sans choc ni facteur de risque de BMR';
    opt('pavm-mono-amc', `Amoxicilline-acide clavulanique IV${libSarm} (monothérapie)`, rangDe('mono'), [I.AMC_IV, ...ajoutSarm], [srcR32], 'SFAR 2017 : bêta-lactamine inactive sur P. aeruginosa, 3 à 6 g/j.', cond('mono', c));
    opt('pavm-mono-ctx', `Céfotaxime${libSarm} (monothérapie)`, rangDe('mono'), [I.CTX_STD, ...ajoutSarm], [srcR32], 'SFAR 2017 : C3G type céfotaxime, 3 à 6 g/j ; ERS/ESICM 2017 : spectre étroit (ertapénème, ceftriaxone, céfotaxime, lévofloxacine) si faible risque de résistance.', cond('mono', c));
    if (colonne === 'mono') opt('pavm-mono-levo', 'Lévofloxacine (allergie aux bêta-lactamines)', al.ciBL ? 'premiere_ligne' : 'conditionnelle', [I.LEVO_PAVM, ...ajoutSarm], [srcR32], 'SFAR 2017 : lévofloxacine 500 mg × 2/j en cas d\'allergie.', al.ciBL ? undefined : 'en cas d\'allergie aux bêta-lactamines');
  }
  if (colonne === 'choc') {
    const note = 'SFAR 2017 : bêta-lactamine + aminoside (à privilégier) ou fluoroquinolone (ofloxacine 200 mg × 2/j, absente de la base) ; gentamicine 8 mg/kg/j selon la SFAR, 6 à 7 mg/kg selon le régime affiché de la base — divergence non tranchée.';
    opt('pavm-choc-amc', `Amoxicilline-acide clavulanique IV + gentamicine${libSarm}`, 'premiere_ligne', [I.AMC_IV, I.GENTA, ...ajoutSarm], [srcBi], note);
    opt('pavm-choc-ctx', `Céfotaxime + gentamicine${libSarm}`, 'premiere_ligne', [I.CTX_STD, I.GENTA, ...ajoutSarm], [srcBi], note);
    opt('pavm-choc-levo', 'Lévofloxacine + gentamicine (allergie aux bêta-lactamines)', al.ciBL ? 'premiere_ligne' : 'conditionnelle', [I.LEVO_PAVM, I.GENTA, ...ajoutSarm], [srcBi], note, al.ciBL ? undefined : 'en cas d\'allergie aux bêta-lactamines');
  }
  if (colonne === 'pyo' || colonne === undefined) {
    const c = 'si pneumonie tardive (≥ 5 jours) ou facteur de risque de BMR ou de BGN non fermentant';
    const note = 'SFAR 2017 : amikacine à préférer à la gentamicine et aux fluoroquinolones ; ceftazidime (6 g/j) possible mais absente de la base. Allergie : aztréonam + clindamycine (clindamycine absente de la base : avis).';
    if (blse) {
      opt('pavm-pyo-mem', `Méropénème + amikacine${libSarm} (portage de BLSE)`, rangDe('pyo'), [I.MEM, I.AMK, ...ajoutSarm], [srcBi], `Portage de BLSE déclaré : carbapénème (SFAR 2017 : méropénème 3 à 6 g/j). ${note}`, cond('pyo', c));
      opt('pavm-pyo-ipm', `Imipénème + amikacine${libSarm} (portage de BLSE)`, rangDe('pyo'), [I.IPM, I.AMK, ...ajoutSarm], [srcBi], `SFAR 2017 : imipénème 3 g/j. ${note}`, cond('pyo', c));
    } else {
      opt('pavm-pyo-fep', `Céfépime + amikacine${libSarm}`, rangDe('pyo'), [I.FEP, I.AMK, ...ajoutSarm], [srcBi], `SFAR 2017 : céfépime 4 à 6 g/j. ${note}`, cond('pyo', c));
      opt('pavm-pyo-tzp', `Pipéracilline-tazobactam + amikacine${libSarm}`, rangDe('pyo'), [I.TZP_FORT, I.AMK, ...ajoutSarm], [srcBi], `SFAR 2017 : pipéracilline-tazobactam 16 g/j. ${note}`, cond('pyo', c));
      if (colonne === 'pyo') opt('pavm-pyo-fep-cipro', `Céfépime + ciprofloxacine${libSarm}`, 'alternative', [I.FEP, I.CIP, ...ajoutSarm], [srcBi], 'SFAR 2017 : ciprofloxacine 400 mg × 3/j en alternative à l\'amikacine.');
    }
    if (colonne === 'pyo' && al.ciBL) f.avis('Allergie aux bêta-lactamines : la SFAR/SRLF 2017 propose aztréonam + clindamycine ; la clindamycine n\'est pas dans la base : avis infectiologique.', true, [srcProto]);
  }
  if (sarm === 'oui') {
    f.alerte('info', 'Facteur de risque de SARM : anti-SARM probabiliste (vancomycine ou linézolide), à ne pas utiliser de façon systématique sans facteur de risque.', [srcR33, S(SFAR, 'protocole n° 4', '600 mg x 2/j', 'posologie')]);
  }
}

export const REGLES_PNEUMONIES = [R_PNEUMONIE];
