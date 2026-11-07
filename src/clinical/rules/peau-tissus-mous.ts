/**
 * Infections de la peau et des tissus mous de l'adulte : DHBNN (érysipèle), abcès, furoncle et furonculose, impétigo,
 * morsures, infection du pied diabétique (grades IWGDF, ostéite à part), DHBN / fasciite nécrosante.
 * Sources : HAS 2019 et fiches HAS 2021 (mises à jour 2024-2025), SPILF 2023 et IWGDF/IDSA 2023 (pied diabétique),
 * SFMU 2017 (morsures), conférence de consensus 2000, IDSA 2014 et WSES 2022 (formes nécrosantes), RCP —
 * docs/sources/recherche-peau-tissus-mous.md.
 * Molécules citées par les sources mais non intégrées (RCP non lu ou intégration confiée à un autre domaine) :
 * céfalexine, pénicilline G/V, benzathine-benzylpénicilline, doxycycline, mupirocine, linézolide, métronidazole.
 * Elles sont nommées dans les commentaires, jamais proposées.
 *
 * Hémoculture positive (règle commune décidée à l'intégration, commit 7543585) :
 * - BGN : la règle reste pleinement active ; les molécules rendues R sur l'antibiogramme de l'hémoculture sont écartées ;
 * - SCN sur une seule série (contaminant possible) : hémoculture ignorée pour le traitement de la forme cutanée ;
 * - S. aureus, streptocoque, entérocoque (ou CGP à l'examen direct) : les options sont celles de la règle de bactériémie
 *   du germe ; cette règle garde gestes, contrôles, alertes et avis — sauf la forme nécrosante, dont les schémas restent ;
 * - toute bactériémie significative, un sepsis ou un choc interdisent les conclusions « pas d'antibiotique » de la forme.
 */
import type { Regle } from '../../engine/decider';
import type { ContexteDecision } from '../../engine/contexte';
import { moleculeEvitee } from '../../engine/contexte';
import type { IndicationPlan, Prelevement, SourceRef } from '../types';
import { reponseDetail } from '../syndromes/questions';
import { regimen } from '../molecules';
import { libelleGerme } from '../microbiologie/germes';
import { Fiche, S, adulte, groupe, lireAntibiogramme, type DureeDecidee, type ItemPrescription, type LectureAtb } from './outils';

const H19 = 'HAS-2019-infections-cutanees';
const ARG = 'SPILF-HAS-2019-infections-cutanees-argumentaire';
const H_DH = 'HAS-2021-DHBNN-adulte';
const H_AB = 'HAS-2021-abces-cutanes';
const H_FU = 'HAS-2021-furoncles';
const H_FS = 'HAS-2021-furonculoses';
const H_IM = 'HAS-2021-impetigo';
const CC00 = 'SPILF-SFD-2000-erysipele-FN';
const SP23 = 'SPILF-2023-pied-diabetique';
const IWGDF = 'IWGDF-IDSA-2023-pied-diabetique';
const IDSA = 'IDSA-2014-SSTI';
const SFMU = 'SFMU-2017-plaies';
const WSES = 'WSES-2022-SSTI';
const HCSP = 'HCSP-2014-SARM-Co';
const REGLE = 'R-PEAU-TISSUS-MOUS';

/** Cible du bouton « Compléter » pour une question du foyer. */
const C = (id: string) => `details.peau.${id}`;

export type FormePeau = 'necrosante' | 'dhbnn' | 'abces' | 'furoncle' | 'furonculose' | 'impetigo' | 'morsure' | 'pied_diabetique' | 'autre' | 'a_preciser';
const FORMES: FormePeau[] = ['dhbnn', 'abces', 'furoncle', 'furonculose', 'impetigo', 'morsure', 'pied_diabetique', 'autre'];
/** Formes infectieuses par définition : un prélèvement superficiel positif n'y pose pas la question de la colonisation. */
const FORMES_INFECTIEUSES: FormePeau[] = ['dhbnn', 'abces', 'furoncle', 'furonculose', 'impetigo', 'morsure', 'pied_diabetique'];

/** Seul un prélèvement superficiel (ou de plaie) est positif, sans hémoculture, prélèvement profond ni ECBU positif. */
export function prelevementSuperficielSeul(ctx: ContexteDecision): boolean {
  return (
    ctx.hemocultures.every((h) => h.organisme === undefined) &&
    ctx.dossier.prelevements.some((x) => x.type === 'superficiel' && x.organisme !== undefined) &&
    !ctx.dossier.prelevements.some((x) => (x.type === 'profond' || x.type === 'urine') && x.organisme !== undefined)
  );
}

/**
 * Forme relevant de cette règle (foyer « Peau et tissus mous », adulte). Les signes de nécrose priment sur la forme déclarée
 * et sur tout prélèvement (HAS 2019), sauf au pied diabétique où ils relèvent de la chirurgie urgente dans la branche IPPPD
 * (SPILF 2023, diapos 5 et 17). Une forme infectieuse par définition (DHBNN, abcès, furoncle, impétigo, morsure, pied
 * diabétique) relève de cette règle même si seul un prélèvement superficiel est positif. Sans forme renseignée (ou « autre »),
 * une plaie dont seul le prélèvement superficiel est positif reste à R-PRELEVEMENT-SUPERFICIEL tant que l'infection clinique
 * n'est pas affirmée (colonisation : ne pas traiter).
 */
export function formePeau(ctx: ContexteDecision): FormePeau | undefined {
  if (!adulte(ctx) || ctx.foyer !== 'cutane') return undefined;
  const forme = reponseDetail(ctx.dossier, 'peau.forme') as FormePeau;
  if (forme === 'pied_diabetique') return forme;
  if (reponseDetail(ctx.dossier, 'peau.necrose') === 'oui') return 'necrosante';
  if (FORMES_INFECTIEUSES.includes(forme)) return forme;
  if (prelevementSuperficielSeul(ctx) && ctx.dossier.clinique.signesInfectionLocale !== 'oui') return undefined;
  return FORMES.includes(forme) ? forme : 'a_preciser';
}

const jours = (n: number, sources: SourceRef[], texte?: string): DureeDecidee => ({ texte: texte ?? `${n} jours`, pointDeDepart: 'premier jour de traitement', dureePrevueJours: n, sources });

const AMOX50: ItemPrescription = { m: 'amoxicilline', r: 'amoxicilline-po-50mgkg' };
const AMC50: ItemPrescription = { m: 'amoxicilline_clavulanate', r: 'amoxclav-po-50mgkg-morsure' };
const AMC_PO: ItemPrescription = { m: 'amoxicilline_clavulanate', r: 'amoxclav-po-1g8h-peau' };
const AMC_IV: ItemPrescription = { m: 'amoxicilline_clavulanate', r: 'amoxclav-iv-1g8h-peau' };
const PRISTINA: ItemPrescription = { m: 'pristinamycine', r: 'pristinamycine-1g-x3' };
const CLOXA: ItemPrescription = { m: 'cloxacilline', r: 'cloxacilline-100mgkg-abces' };
const CEFAZ: ItemPrescription = { m: 'cefazoline', r: 'cefazoline-80mgkg-abces' };
const PTZ: ItemPrescription = { m: 'piperacilline_tazobactam', r: 'piptazo-4g8h' };
const PTZ_FORT: ItemPrescription = { m: 'piperacilline_tazobactam', r: 'piptazo-4g6h-prolongee' };
const VANCO: ItemPrescription = { m: 'vancomycine', r: 'vancomycine-discontinu' };
const AMIKA: ItemPrescription = { m: 'amikacine', r: 'amikacine-30-du' };
const CLINDA_IV3: ItemPrescription = { m: 'clindamycine', r: 'clindamycine-iv-600x3' };

/** Nom de la molécule sur l'antibiogramme (la cloxacilline est rendue « oxacilline »). */
const DCI_ATB: Record<string, string> = { cloxacilline: 'oxacilline' };

/* ------------------------------------------------------------------ */
/* Hémocultures                                                        */
/* ------------------------------------------------------------------ */

type TypeBacteriemie = 'aucune' | 'bgn' | 'contaminant_possible' | 'scn_probable' | 'germe_couvert' | 'autre';
interface Bacteriemie {
  type: TypeBacteriemie;
  prl?: Prelevement;
  libelle: string;
}

/** Classement de l'hémoculture positive selon la règle commune « foyer de domaine et hémoculture positive ». */
export function bacteriemiePeau(ctx: ContexteDecision): Bacteriemie {
  const prl = ctx.hemocultures.find((h) => groupe(h) !== 'aucun');
  if (!prl) return { type: 'aucune', libelle: '' };
  const g = groupe(prl);
  const libelle = prl.organisme ? libelleGerme(prl.organisme) : g === 'bgn' ? 'bacille à Gram négatif (examen direct)' : g === 'cgp_amas' ? 'cocci à Gram positif en amas (examen direct)' : g === 'cgp_chainettes' ? 'cocci à Gram positif en chaînettes (examen direct)' : 'germe non identifié';
  if (g === 'bgn') return { type: 'bgn', prl, libelle };
  if (g === 'scn') return { type: (prl.hemoc?.nbSeriesPositives ?? 0) >= 2 ? 'scn_probable' : 'contaminant_possible', prl, libelle };
  if (g === 's_lugdunensis') return { type: 'scn_probable', prl, libelle };
  if (g === 's_aureus' || g === 'cgp_amas' || g === 'strepto' || g === 'cgp_chainettes' || g === 'entero') return { type: 'germe_couvert', prl, libelle };
  return { type: 'autre', prl, libelle };
}

/* ------------------------------------------------------------------ */
/* Contexte de la fiche                                                */
/* ------------------------------------------------------------------ */

interface K {
  ctx: ContexteDecision;
  f: Fiche;
  /** Antibiogramme du prélèvement cutané (profond ou superficiel). */
  atb: LectureAtb;
  prl?: Prelevement;
  /** Antibiogramme d'une hémoculture à BGN. */
  atbHemoc?: LectureAtb;
  bact: Bacteriemie;
  /** Bactériémie significative (tout sauf un SCN sur une seule série). */
  bactSignif: boolean;
  grave: boolean;
  /** Les options reviennent à la règle de bactériémie du germe : aucune option ici. */
  sansOptions: boolean;
  /** Schéma oral sous réserve (forme hospitalisée, sepsis, choc) : options orales conditionnelles. */
  oralSousReserve?: string;
  /** Rang maximal imposé (BGN dans les hémocultures d'une forme à cocci à Gram positif). */
  plafondConditionnel?: string;
}
type Opt = Parameters<Fiche['option']>[0];

const estOral = (i: ItemPrescription) => regimen(i.m, i.r).regimen.voie === 'PO';

/**
 * Ajoute l'option sauf si une de ses molécules est rendue R (antibiogramme du prélèvement cutané ou d'une hémoculture à BGN).
 * Les effets propres à une molécule (poids et allaitement pour la clindamycine, grossesse pour la pristinamycine) ne sont émis
 * que si l'option est effectivement proposée.
 */
function proposer(k: K, o: Opt): boolean {
  if (k.sansOptions) return false;
  const p = k.ctx.dossier.patient;
  for (const [atb, origine] of [[k.atb, 'prélèvement cutané'], [k.atbHemoc, 'hémoculture']] as const) {
    const r = atb && o.items.find((i) => atb.sir(DCI_ATB[i.m] ?? i.m) === 'R');
    if (r) {
      k.f.ecarter(o.libelle, 'resistance', `${DCI_ATB[r.m] ?? r.m} rendu(e) R sur l'antibiogramme (${origine})`, []);
      return false;
    }
  }
  let rang = o.rang;
  const conditions: string[] = o.condition ? [o.condition] : [];
  const clinda = o.items.some((i) => i.m === 'clindamycine');
  if (clinda && p.allaitement === 'oui' && rang === 'premiere_ligne') {
    rang = 'alternative';
    conditions.push('allaitement : contre-indication du § 4.3 du RCP (le § 4.6 de la gélule l\'admet : incohérence du RCP)');
  }
  if (k.oralSousReserve && o.items.every(estOral)) {
    rang = 'conditionnelle';
    conditions.push(k.oralSousReserve);
  }
  if (k.plafondConditionnel) {
    rang = 'conditionnelle';
    conditions.push(k.plafondConditionnel);
  }
  const ok = k.f.option({ ...o, rang, condition: conditions.length ? conditions.join(' ; ') : undefined });
  if (!ok) return false;
  if (clinda) {
    if (p.poidsKg === undefined) k.f.manque('poids', 'clindamycine : 600 mg × 4/j au-delà de 100 kg (HAS)', 'affine', 'patient.poidsKg');
    if (p.allaitement === 'oui')
      k.f.alerte('attention', 'Allaitement : la clindamycine est contre-indiquée en cas d\'allaitement selon le § 4.3 de ses RCP, alors que le § 4.6 de la gélule indique que l\'allaitement est possible (incohérence du RCP) ; forme injectable : alcool benzylique. Le RCP de la pristinamycine admet l\'allaitement en l\'absence d\'alternative.', [S('RCP-clindamycine-orale', '§4.3 ; §4.6', 'en cas d\'allaitement', 'autre'), S('RCP-pristinamycine', '§4.6', undefined, 'autre')]);
  }
  if (o.items.some((i) => i.m === 'pristinamycine')) {
    if (k.ctx.grossessePossible)
      k.f.alerte('attention', `Grossesse ${p.grossesse === 'oui' ? 'déclarée' : 'non exclue'} : pristinamycine — données animales et cliniques insuffisantes ; le RCP indique qu'elle « peut être envisagée au cours de la grossesse si besoin ». Fiche CRAT non trouvée.`, [S('RCP-pristinamycine', '§4.6', 'l\'utilisation de la pristinamycine peut être envisagée au cours de la grossesse si besoin, malgré des données animales et cliniques insuffisantes', 'autre')]);
    if (p.allaitement === 'oui') k.f.alerte('attention', 'Allaitement : pristinamycine possible seulement en l\'absence d\'alternative, chez un nouveau-né à terme sans facteur de risque digestif (RCP).', [S('RCP-pristinamycine', '§4.6', undefined, 'autre')]);
  }
  return true;
}

/** Clindamycine : 600 mg × 3/j, × 4/j au-delà de 100 kg (HAS 2019/2021, dans le maximum du RCP). Sans effet de bord. */
function clinda(k: K, voie: 'po' | 'iv'): ItemPrescription {
  const p = k.ctx.dossier.patient;
  const x4 = p.poidsKg !== undefined && p.poidsKg > 100;
  return { m: 'clindamycine', r: `clindamycine-${voie}-600x${x4 ? 4 : 3}` };
}

function allergiePenicilline(ctx: ContexteDecision): boolean {
  return moleculeEvitee('amoxicilline', 'penicilline', ctx.allergie).evitee;
}

function indicationSansTraitement(titre: string, raison: string, conditions: string[], actions: string[], reconsiderer: string[], sources: SourceRef[]): IndicationPlan {
  return { decision: 'ne_pas_traiter', qualification: 'infection', titre, raison, conditions, exceptions: [], actions, surveillance: [], reconsiderer, questions: [], sources, statut: 'verifiee_ia', regleId: REGLE };
}

function indicationInsuffisante(titre: string, raison: string, questions: string[], sources: SourceRef[]): IndicationPlan {
  return { decision: 'informations_insuffisantes', qualification: 'indeterminee', titre, raison, conditions: [], exceptions: [], actions: [], surveillance: [], reconsiderer: [], questions, sources, statut: 'verifiee_ia', regleId: REGLE };
}

/** Motif qui interdit une conclusion « pas d'antibiotique » propre à la forme (sepsis, choc, bactériémie). */
// La fièvre n'est pas saisie pour ce foyer (champ effacé) : elle fait partie de la question « furoncle compliqué ».
function motifSystemique(k: K): string | undefined {
  const g = k.ctx.dossier.patient.gravite;
  if (g === 'choc_septique') return 'choc septique';
  if (g === 'sepsis') return 'sepsis';
  if (k.bactSignif) return `bactériémie (${k.bact.libelle})`;
  return undefined;
}

const SRC_AMBU = S(H19, 'préambule, p. 6', undefined, 'choix');
const RESERVE_ORALE_GRAVE = 'si la voie orale est possible : schéma des recommandations ambulatoires, sans schéma IV pour une forme avec sepsis ou choc';

/** Forme orale ambulatoire chez un patient en sepsis ou en choc : absence de schéma IV expliquée. */
function absenceGrave(k: K, sujet: string) {
  k.f.absence(
    `${sujet} avec sepsis ou choc septique : schéma IV`,
    'Les recommandations lues pour cette forme (HAS 2019, texte ambulatoire ; fiches HAS 2021 ; SFMU 2017) ne donnent qu\'un schéma oral ; aucun schéma IV n\'est précisé en cas de sepsis ou de choc.',
    ['Rechercher une forme nécrosante', 'Schéma oral seulement si la voie orale est possible', 'Antibiothérapie IV avec le SMIT et la réanimation'],
    [SRC_AMBU],
  );
  k.f.avis(`${sujet} avec sepsis ou choc septique : antibiothérapie IV à décider avec le SMIT et la réanimation.`, true, [SRC_AMBU]);
}

/* ------------------------------------------------------------------ */
/* DHBN / fasciite nécrosante                                          */
/* ------------------------------------------------------------------ */

function necrosante(k: K) {
  const { f } = k;
  const srcUrg = [
    S(H19, '§ 2.2, p. 17 (AE)', 'La suspicion d\'une FN nécessite d\'appeler le 15 pour une hospitalisation en urgence dans un service spécialisé.', 'choix'),
    S(H19, '§ 2.3, p. 18 (AE)', 'La FN est une urgence médico-chirurgicale', 'choix'),
  ];
  f.situation('dhbn-fn', 'Dermohypodermite bactérienne nécrosante / fasciite nécrosante suspectée', 'partielle', 'Urgence médico-chirurgicale : appel du 15 et avis chirurgical immédiats ; l\'excision chirurgicale est le geste principal. Aucun texte français récent ne donne d\'antibiothérapie probabiliste de l\'adulte : schémas affichés en brouillon, à décider avec le chirurgien, le réanimateur et le SMIT.');
  f.urgence('immediate');
  f.alerte('urgence', 'Suspicion de DHBN / fasciite nécrosante : urgence médico-chirurgicale. Appeler le 15 (hospitalisation en urgence en service spécialisé) et le chirurgien ; ne pas retarder la chirurgie par l\'imagerie.', [...srcUrg, S(H19, '§ 2.3, p. 18 (AE)', 'ne doit pas retarder le geste chirurgical', 'imagerie')]);
  f.avis('Avis chirurgical immédiat (excision) et avis réanimation : appel du 15.', true, srcUrg);
  f.avis('Avis SMIT pour l\'antibiothérapie (pas de schéma français récent pour l\'adulte).', true, [S(CC00, 'p. 462', 'adjuvant indispensable du traitement chirurgical', 'choix')]);
  f.geste('Chirurgie d\'excision au plus vite : la précocité du geste dans les 24 premières heures est un déterminant majeur du pronostic ; contrôle de la région opérée le lendemain et les jours suivants.', [
    S(CC00, 'p. 462', 'il faut opérer au plus vite', 'geste'),
    S(CC00, 'p. 462', 'L\'excision est le maître geste', 'geste'),
    S(CC00, 'p. 462', 'La précocité du geste opératoire dans les premières 24 heures suivant l\'admission est un déterminant majeur du pronostic.', 'geste'),
  ]);
  f.geste('Reprise chirurgicale 24 à 36 h après le premier débridement, puis chaque jour si nécessaire (IDSA 2014). Atteinte cervico-faciale : rechercher une médiastinite ; abdomino-périnéale : dérivation digestive et/ou urinaire souvent nécessaire (consensus 2000).', [
    S(IDSA, 'VIII', '24–36 hours after the first debridement and daily thereafter', 'geste'),
    S(CC00, 'p. 462', undefined, 'geste'),
  ]);
  f.controle({ id: 'ctl-fn-hemoc', type: 'hemoculture', categorie: 'indique', quoi: 'Hémocultures', quand: { ancre: 'avant_traitement', texte: 'Avant l\'antibiothérapie, sans la retarder' }, pourquoi: 'Extrapolation signalée : HAS 2019 cite « éventuellement hémocultures » pour une dermohypodermite avec signes de gravité (§ 1.6, DHBNN) ; le chapitre FN (§ 2) ne mentionne que la ponction-aspiration et les prélèvements opératoires.', sources: [S(H19, '§ 1.6, p. 12 (AE)', 'éventuellement hémocultures', 'controle_micro')] });
  f.controle({ id: 'ctl-fn-perop', type: 'prelevement', categorie: 'indique', quoi: 'Prélèvements per-opératoires ; ponction-aspiration à l\'aiguille possible', quand: { ancre: 'non_determine', texte: 'Au bloc ; une ponction préalable ne doit pas retarder la chirurgie' }, pourquoi: 'Infections monomicrobiennes (streptocoque A) ou polymicrobiennes (S. aureus, entérobactéries, P. aeruginosa, anaérobies).', sources: [S(H19, '§ 2.3, p. 18 (AE)', 'sans retarder la prise en charge chirurgicale', 'controle_micro'), S(H19, '§ 2.1, p. 17', 'principalement dues au SGA', 'definition')] });
  const duree: DureeDecidee = {
    texte: 'Non chiffrée : jusqu\'à ce qu\'un nouveau débridement ne soit plus nécessaire, avec amélioration clinique et apyrexie depuis 48-72 h (IDSA 2014) ; aucune durée dans les textes français',
    pointDeDepart: 'premier jour de traitement',
    sources: [S(IDSA, 'VIII', 'until further debridement is no longer necessary, the patient has improved clinically, and fever has been absent for 48–72 hours', 'duree')],
  };
  const com =
    'Brouillon : aucune source française récente ; les deux schémas larges (IDSA 2014, WSES 2022) sont affichés au même rang, sans préférence tranchée. WSES 2022, patient stable : amoxicilline-acide clavulanique 1,2/2,2 g toutes les 8 h, ou ceftriaxone 2 g/24 h + métronidazole 500 mg/8 h, ou céfotaxime 2 g/8 h + métronidazole, + clindamycine 600-900 mg/8 h. Conférence de consensus 2000 (vigueur incertaine), selon la localisation : membres et cervico-facial, pénicilline G + clindamycine (ou rifampicine) ; abdomen et périnée, uréidopénicilline + métronidazole, ± amikacine si P. aeruginosa est craint chez l\'immunodéprimé ; toxicomanie IV, association anti-staphylococcique active sur le streptocoque. IDSA 2014 : linézolide possible à la place de la vancomycine, carbapénème à la place de la pipéracilline-tazobactam, ou ceftriaxone + métronidazole ; streptocoque A documenté : pénicilline + clindamycine. Pénicilline G, linézolide et métronidazole ne sont pas intégrés à l\'application.';
  proposer(k, {
    id: 'fn-ptz-vanco',
    libelle: 'Pipéracilline-tazobactam + vancomycine (IDSA 2014)',
    type: 'probabiliste',
    rang: 'premiere_ligne',
    statut: 'brouillon',
    items: [PTZ_FORT, VANCO],
    duree,
    sources: [S(IDSA, 'VIII (strong, low)', 'broad (eg, vancomycin or linezolid plus piperacillin-tazobactam or a carbapenem; or plus ceftriaxone and metronidazole)', 'choix'), S(WSES, 'tableau NSTI, p. 17-18', '4.5 g every 6 h', 'posologie')],
    commentaire: `Posologie de la pipéracilline-tazobactam tirée de la WSES 2022 (tableaux IDSA non lus). ${com}`,
  });
  proposer(k, {
    id: 'fn-ptz-vanco-clinda',
    libelle: 'Pipéracilline-tazobactam + vancomycine + clindamycine (WSES 2022, patient instable)',
    type: 'probabiliste',
    rang: 'premiere_ligne',
    statut: 'brouillon',
    items: [PTZ_FORT, VANCO, CLINDA_IV3],
    duree,
    sources: [
      S(WSES, 'p. 14', 'Linezolid and clindamycin play an important role because they may significantly inhibit exotoxin production', 'choix'),
      S(WSES, 'tableau NSTI, p. 17-18', '600–900 mg every 8 h', 'posologie'),
      S(ARG, 'p. 45', 'molécule d\'intérêt dans les infections graves en association aux β-lactamines : DHBN et FN, inhibitrice sur la synthèse de toxines', 'choix'),
    ],
    commentaire: 'Brouillon. La WSES ajoute la clindamycine à tous ses schémas. Clindamycine 600 mg/8 h IV : bas de la fourchette WSES (600-900 mg/8 h), dans le maximum du RCP (2 400 mg/24 h) que 900 mg/8 h dépasserait ; argumentaire HAS 2019 : 600 mg toutes les 6-8 h IV, voire 900 mg en cas d\'obésité. ' + com,
  });
  f.absence(
    'Antibiothérapie probabiliste des DHBN / fasciites nécrosantes de l\'adulte',
    'HAS 2019 ne traite que la reconnaissance et l\'orientation ; la conférence de consensus SPILF/SFD 2000 (vigueur incertaine) donne des associations par localisation sans posologie ni durée ; aucune recommandation française plus récente (SFAR, SPILF, SRLF) n\'a été trouvée au 2026-11-06.',
    ['Chirurgie d\'excision en urgence', 'Antibiothérapie décidée avec le chirurgien, le réanimateur et le SMIT ; les schémas affichés sont des brouillons tirés de l\'IDSA 2014 et de la WSES 2022'],
    [S(H19, '§ 2, p. 17-18', undefined, 'choix'), S(CC00, 'p. 461-462', undefined, 'choix')],
  );
}

/* ------------------------------------------------------------------ */
/* DHBNN (érysipèle)                                                   */
/* ------------------------------------------------------------------ */

const STREPTO_BETA = ['streptococcus_pyogenes', 'streptococcus_agalactiae', 'streptocoque_groupe_c_g'];

function dhbnn(k0: K) {
  const { ctx, f } = k0;
  const p = ctx.dossier.patient;
  const part = reponseDetail(ctx.dossier, 'peau.dhbnn_particularite');
  const hosp = reponseDetail(ctx.dossier, 'peau.hospitalisation');
  const grave = k0.grave;
  const soins = p.contexte === 'associe_aux_soins';
  const srcAvis = S(H19, 'p. 13 (AE)', 'DHBNN liées aux soins ; exposition aquatique et marine ; injection septique (toxicomanie IV)', 'choix');
  const src181 = S(H19, '§ 1.8.1, p. 13', 'pas d\'intérêt à l\'élargissement du spectre vers une antibiothérapie autre qu\'anti-streptococcique dans les DHBNN non compliquées', 'choix');

  // Antibiogramme : la cible est le streptocoque (HAS 2019 § 1.8.1). Celui d'un germe de porte d'entrée (écouvillon
  // superficiel, germe autre qu'un streptocoque β-hémolytique) n'exclut pas une molécule.
  const pertinent = !k0.prl || k0.prl.type === 'profond' || STREPTO_BETA.includes(k0.prl.organisme ?? '');
  const k: K = pertinent ? k0 : { ...k0, atb: lireAntibiogramme(undefined) };
  if (!pertinent && (k0.prl?.antibiogramme?.length ?? 0) > 0)
    f.alerte('info', `Germe de porte d'entrée (${libelleGerme(k0.prl!.organisme)}, prélèvement superficiel) : son antibiogramme n'est pas pris en compte pour le choix de l'antibiotique de la DHBNN, qui vise le streptocoque (HAS 2019 : pas d'élargissement du spectre).`, [src181]);

  // Mesures communes à toute DHBNN (HAS 2019).
  f.geste('Marquer au feutre les contours du placard inflammatoire.', [S(H19, 'p. 8 (AE)', 'marquer au feutre les contours du placard inflammatoire', 'geste')]);
  f.geste('Repos avec surélévation du membre ; contention pendant au moins 3 semaines ; anticoagulation prophylactique à discuter ; mise à jour de la vaccination antitétanique.', [S(H19, '§ 1.8.4, p. 14 (AE)', 'au moins 3 semaines', 'geste'), S(H19, '§ 1.8.4, p. 14 (AE)', 'mise à jour de la vaccination antitétanique', 'geste')]);
  f.geste('Traiter les facteurs favorisants : porte d\'entrée (plaie, intertrigo, dermatose sous-jacente), lymphœdème (compression médicale), obésité.', [S(H19, '§ 1.5.1 et § 1.9 (AE)', '(plaies, intertrigo, dermatose sous-jacente)', 'geste'), S(H19, '§ 1.9 (AE)', 'traité par compression médicale', 'geste')]);
  f.alerte('info', 'Ni antibiotique local, ni corticoïde, ni AINS (HAS 2019, grade C) ; AINS au long cours : arrêt transitoire ; corticoïdes et aspirine antiagrégante : poursuivis. Divergence : IDSA 2014, prednisone 40 mg/j 7 jours « could be considered » chez le non-diabétique (recommandation faible).', [
    S(H19, '§ 1.8.3, p. 14 (grade C)', 'ne pas prescrire des corticoïdes ou des anti-inflammatoires non stéroïdiens (AINS)', 'autre'),
    S(H19, '§ 1.8.2, p. 13 (AE)', 'ne pas prescrire d\'antibiothérapie locale', 'choix'),
    S(IDSA, 'V (weak, moderate)', 'could be considered', 'autre'),
  ]);
  f.alerte('info', 'Placard bilatéral sans fièvre ni frissons : suspecter un autre diagnostic (insuffisance veineuse).', [S(H19, '§ 1.4, p. 11 (AE)', 'suspecter un autre diagnostic', 'definition')]);
  if (grave)
    f.alerte('urgence', 'Signes de gravité : évoquer une DHBN, en particulier une fasciite nécrosante (rechercher les signes locaux de nécrose) ; hospitalisation.', [S(H19, '§ 1.4, p. 11 (AE)', 'évoquer une DHBN et en particulier une fasciite nécrosante', 'choix')]);

  // Prélèvements : aucun si non compliquée, sauf situations listées (HAS 2019 § 1.6).
  const prelever = grave || p.immunodepression === 'oui' || soins || part === 'aquatique' || part === 'injection';
  f.controle({
    id: 'ctl-dhbnn-prelevement',
    type: 'prelevement',
    categorie: prelever ? 'indique' : 'conditionnel',
    quoi: prelever ? 'Prélèvement local de la porte d\'entrée, éventuellement hémocultures' : 'Aucun examen complémentaire si DHBNN non compliquée ; prélèvement de la porte d\'entrée (± hémocultures) seulement en cas de morsure, milieu aquatique, voyage en zone tropicale, plaie post-traumatique, liée aux soins ou injection septique, lésions suppurées, échec d\'un traitement présumé adapté, immunodépression ou signes de gravité',
    quand: { ancre: 'avant_traitement', texte: prelever ? 'Avant l\'antibiotique, sans le retarder' : 'Seulement dans les situations listées' },
    pourquoi: 'Diagnostic clinique ; étiologie non streptococcique possible dans ces situations.',
    sources: [S(H19, '§ 1.6, p. 12 (AE)', 'En cas de DHBNN non compliquée, aucun examen complémentaire n\'est recommandé', 'controle_micro')],
  });

  if (part === 'face') {
    const ext = 'Extrapolation de l\'application : HAS 2019 impose l\'hospitalisation en urgence en cas de suspicion de staphylococcie « maligne » de la face ; faute de critère saisi, toute dermohypodermite de la face est traitée ici comme cette suspicion.';
    f.situation('dhbnn-face', 'Dermohypodermite de la face : staphylococcie « maligne » à éliminer', 'partielle', `${ext} Pas de schéma antibiotique dans les recommandations lues.`);
    f.urgence('elevee').alerte('urgence', `Dermohypodermite de la face : éliminer une staphylococcie « maligne », dont la suspicion impose une hospitalisation en urgence. ${ext}`, [S(H19, 'p. 8 (AE)', 'Sa suspicion impose une hospitalisation en urgence.', 'choix')]);
    f.avis('Hospitalisation en urgence ; antibiothérapie avec le SMIT (dermohypodermite de la face, staphylococcie maligne à éliminer).', true, [S(H19, 'p. 8 (AE)', 'Sa suspicion impose une hospitalisation en urgence.', 'choix')]);
    f.absence('Dermohypodermite de la face', 'HAS 2019 impose l\'hospitalisation en urgence en cas de suspicion de staphylococcie maligne et cite la face parmi les localisations à étiologie non streptococcique, sans schéma antibiotique.', ['Hospitalisation en urgence', 'Antibiothérapie avec le SMIT'], [S(H19, 'p. 8 et p. 10 (AE)', 'face, région périnéo-fessière', 'choix')]);
    return;
  }
  if (part === 'perinee') {
    const ext = 'Extrapolation de l\'application : HAS 2019 (p. 9) demande l\'hospitalisation en urgence (appel du centre 15) dans le contexte du diagnostic différentiel de gangrène de Fournier ; l\'application l\'applique à toute dermohypodermite périnéo-fessière (portée exacte de l\'extrait à vérifier dans le texte HAS).';
    f.situation('dhbnn-perinee', 'Dermohypodermite périnéo-fessière : gangrène de Fournier à éliminer', 'partielle', `${ext} Pas de schéma antibiotique dans les recommandations lues.`);
    f.urgence('immediate').alerte('urgence', `Région périnéo-fessière : éliminer une gangrène de Fournier ; hospitaliser en urgence (appel du 15). ${ext}`, [S(H19, 'p. 9 (AE)', 'hospitaliser le patient en urgence (appel au centre 15', 'choix')]);
    f.avis('Hospitalisation en urgence (appel du 15) ; avis chirurgical et SMIT.', true, [S(H19, 'p. 9 (AE)', 'hospitaliser le patient en urgence (appel au centre 15', 'choix')]);
    f.absence('Dermohypodermite périnéo-fessière', 'HAS 2019 cite la région périnéo-fessière parmi les localisations à étiologie non streptococcique et renvoie à l\'hospitalisation en urgence, sans schéma antibiotique.', ['Hospitalisation en urgence', 'Antibiothérapie avec le chirurgien et le SMIT'], [S(H19, 'p. 10 (AE)', 'face, région périnéo-fessière', 'choix')]);
    return;
  }
  if (soins || part === 'aquatique' || part === 'injection') {
    const motif = [soins ? 'liée aux soins' : '', part === 'aquatique' ? 'après exposition aquatique ou marine' : '', part === 'injection' ? 'après injection septique' : ''].filter(Boolean).join(', ');
    f.situation('dhbnn-avis', `DHBNN ${motif}`, 'partielle', 'Avis spécialisé recommandé, sans schéma antibiotique dans les recommandations lues.');
    f.avis(`DHBNN ${motif} : avis spécialisé pour le choix de l'antibiotique (HAS).`, grave, [srcAvis, S(H_DH, 'avis spécialisé', undefined, 'choix')]);
    f.absence(`DHBNN ${motif}`, 'HAS 2019 et la fiche HAS 2021 renvoient à un avis spécialisé, sans schéma antibiotique.', ['Prélèvement de la porte d\'entrée (± hémocultures) avant antibiotique', 'Avis spécialisé (SMIT)'], [srcAvis]);
    return;
  }
  if (part === 'inconnu') f.manque('localisation ou porte d\'entrée particulière (face, périnée, exposition aquatique, injection)', 'avis spécialisé ou hospitalisation en urgence au lieu du schéma habituel (HAS 2019)', 'bloque_decision', C('dhbnn_particularite'));

  // HAS 2019 est un texte ambulatoire : en hospitalisation, en sepsis ou en choc, le schéma oral n'est proposé que sous réserve.
  const horsAmbulatoire = hosp === 'oui' || grave;
  if (horsAmbulatoire) k.oralSousReserve = grave ? 'si la voie orale est possible et la forme nécrosante écartée (schéma ambulatoire HAS 2019 ; sepsis ou choc : pas de schéma IV dans les recommandations lues)' : 'si la voie orale est possible (schéma ambulatoire HAS 2019 ; pas de schéma IV ni de durée en hospitalisation dans les recommandations lues)';

  f.situation('dhbnn', 'Dermohypodermite bactérienne non nécrosante (érysipèle)', horsAmbulatoire ? 'partielle' : 'couverte', 'Diagnostic clinique ; streptocoques β-hémolytiques A et G : antibiotique anti-streptococcique seul pendant 7 jours, sans le prolonger pour une régression cutanée lente.');
  const d7 = jours(7, [S(H_DH, 'traitement', 'pendant 7 jours', 'duree'), S(H19, '§ 1.8.2, p. 13 (AE)', 'une durée de 7 jours', 'duree')], '7 jours (ne pas prolonger pour une régression cutanée lente)');
  const allergie = allergiePenicilline(ctx);
  const srcAll = S(H_DH, 'allergie documentée à la pénicilline', 'En cas d\'allergie documentée à la pénicilline', 'choix');
  if (allergie) f.ecarter('Amoxicilline', 'allergie', 'allergie à la pénicilline déclarée : clindamycine ou pristinamycine (HAS)', [srcAll]);
  else
    proposer(k, {
      id: 'dhbnn-amoxicilline',
      libelle: 'Amoxicilline per os',
      type: 'probabiliste',
      rang: 'premiere_ligne',
      items: [AMOX50],
      duree: d7,
      sources: [S(H_DH, 'traitement', 'amoxicilline : 50 mg/kg/j en 3 prises (sans dépasser 6 g/j) pendant 7 jours', 'choix'), src181],
    });
  const rang = allergie ? ('premiere_ligne' as const) : ('conditionnelle' as const);
  const condition = allergie ? undefined : 'seulement en cas d\'allergie documentée à la pénicilline';
  proposer(k, {
    id: 'dhbnn-clindamycine',
    libelle: 'Clindamycine per os (allergie à la pénicilline)',
    type: 'probabiliste',
    rang,
    condition,
    items: [clinda(k, 'po')],
    duree: d7,
    sources: [srcAll, S(H_DH, 'allergie documentée à la pénicilline', 'clindamycine : 600 mg 3 fois par jour, et jusqu\'à 600 mg 4 fois par jour si poids > 100 kg, pendant 7 jours', 'choix'), S(H19, '§ 1.8.2, p. 13 (AE)', 'pristinamycine (1 g x 3 /jour) ou clindamycine (600 mg x 3/jour, et jusqu\'à 600 mg x 4/jour si poids > 100 kg)', 'choix')],
    commentaire: 'Le RCP classe Streptococcus pyogenes « inconstamment sensible » à la clindamycine : exploiter l\'antibiogramme s\'il existe (érythromycine, résistance inductible). 600 mg × 4/j au-delà de 100 kg.',
  });
  proposer(k, {
    id: 'dhbnn-pristinamycine',
    libelle: 'Pristinamycine per os (allergie à la pénicilline)',
    type: 'probabiliste',
    rang,
    condition,
    items: [PRISTINA],
    duree: d7,
    sources: [srcAll, S(H_DH, 'allergie documentée à la pénicilline', 'pristinamycine : 1 g 3 fois par jour pendant 7 jours', 'choix')],
    commentaire: 'Contre-indiquée avec la colchicine (RCP).',
  });

  if (horsAmbulatoire) {
    f.alerte('attention', 'Critère d\'hospitalisation : prise en charge hospitalière.', [S(H19, '§ 1.7, p. 12 (AE)', undefined, 'choix')]);
    f.absence('DHBNN hospitalisée ou avec sepsis : voie IV et durée', 'HAS 2019 est un texte ambulatoire et ne précise ni schéma IV ni durée en hospitalisation ; la SPILF 2023 (pied diabétique) cite l\'amoxicilline IV 50 mg/kg/j si streptocoque, non transposée ici.', ['Schéma oral seulement si la voie orale est possible', 'Sinon : voie IV avec le SMIT'], [SRC_AMBU, S(SP23, 'diapo 26', 'IV : 50 à 100 mg/kg/j', 'posologie')]);
    if (grave) f.avis('DHBNN avec sepsis ou choc septique : antibiothérapie IV à décider avec le SMIT et la réanimation ; forme nécrosante à éliminer.', true, [SRC_AMBU, S(H19, '§ 1.4, p. 11 (AE)', 'évoquer une DHBN et en particulier une fasciite nécrosante', 'choix')]);
  } else if (hosp === 'inconnu') f.manque('critère d\'hospitalisation (HAS 2019)', 'lieu de prise en charge ; le schéma oral est celui du traitement ambulatoire', 'affine', C('hospitalisation'));
  if (grave || p.antecedentsMicro.some((a) => a.resistance === 'SARM'))
    f.alerte('info', 'SARM : HAS 2019, pas d\'élargissement du spectre en France dans la DHBNN non compliquée ; IDSA 2014, couverture anti-SARM si traumatisme pénétrant, SARM connu (infection ou colonisation nasale), drogues IV ou SIRS. Divergence non tranchée : avis SMIT.', [S(H19, '§ 1.8.1, p. 13', 'pas d\'intérêt à l\'élargissement du spectre', 'choix'), S(IDSA, 'IV (strong, moderate)', undefined, 'choix')]);
  f.reeval('Réévaluer à 24-48 h : évolution défavorable → hospitalisation ; aggravation 24 à 48 h après le début de l\'antibiotique → évoquer une forme nécrosante. Une régression cutanée lente (2 à 3 semaines) ne justifie pas de prolonger l\'antibiotique.', [S(H19, '§ 1.7, p. 12 (AE)', 'évolution défavorable dans les 24 à 48 heures', 'choix'), S(H19, '§ 1.8.2, p. 13 (AE)', 'ne doit pas conduire à prolonger l\'antibiothérapie', 'duree')], 48);
  const recid = reponseDetail(ctx.dossier, 'peau.recidives');
  if (recid === 'oui')
    f.avis('Au moins 2 épisodes de DHBNN dans l\'année : antibioprophylaxie des récidives à discuter si les facteurs de risque ne sont pas contrôlables — benzathine-benzylpénicilline 2,4 MUI IM toutes les 2 à 4 semaines, ou pénicilline V 1 à 2 MUI/j en 2 prises (HAS), durée non déterminée ; azithromycine 250 mg/j si allergie (hors AMM, HAS 2019 seulement, non reprise par la fiche 2021). Ces molécules ne sont pas intégrées (RCP non lus). IDSA 2014 : à partir de 3 à 4 épisodes par an.', false, [
      S(H_DH, 'prophylaxie des récidives', 'à partir de 2 épisodes de DHBNN dans l\'année écoulée', 'choix'),
      S(H19, 'p. 15 (AE)', 'benzyl-pénicilline G retard 2,4 MUI IM toutes les 2 à 4 semaines', 'choix'),
      S(H19, 'p. 15 (AE)', 'azithromycine (250 mg/jour) si allergie à la pénicilline (hors AMM)', 'choix'),
      S(IDSA, 'VI (weak, moderate)', '3–4 episodes of cellulitis per year', 'choix'),
    ]);
}

/* ------------------------------------------------------------------ */
/* Abcès, furoncle, furonculose                                         */
/* ------------------------------------------------------------------ */

function abces(k: K) {
  const { f } = k;
  f.situation('abces-cutane', 'Abcès cutané', 'couverte', 'Incision-drainage et prélèvement du pus ; antibiothérapie active sur S. aureus pendant 5 jours en complément du geste (HAS).');
  f.geste('Incision / drainage chirurgical et renforcement des mesures d\'hygiène.', [S(H19, '§ 6.5, p. 25 (AE)', 'incision/un drainage chirurgical et le renforcement des mesures d\'hygiène', 'geste'), S(H_AB, 'traitement chirurgical', 'Traitement chirurgical : incision/drainage chirurgical.', 'geste')]);
  f.controle({ id: 'ctl-abces-pus', type: 'prelevement', categorie: 'indique', quoi: 'Prélèvement bactériologique du pus', quand: { ancre: 'avant_traitement', texte: 'Lors du drainage, avant l\'antibiotique' }, pourquoi: 'S. aureus le plus souvent ; abcès secondaires parfois polymicrobiens.', sources: [S(H_AB, 'prélèvement', 'Un prélèvement bactériologique du pus de l\'abcès est recommandé.', 'controle_micro')] });
  f.alerte('info', 'Collection sur cathéter : infection de cathéter ; collection après chirurgie : infection du site opératoire — prise en charge spécifique, hors de ce schéma.', [S(H19, 'p. 25', undefined, 'definition')]);
  const d5 = jours(5, [S(H_AB, 'antibiothérapie', 'antibiothérapie de première intention pendant 5 jours par', 'duree')]);
  const srcChoix = S(H_AB, 'antibiothérapie', 'clindamycine PO/IV : 600 mg 3 fois par jour et jusqu\'à 600 mg 4 fois par jour si poids > 100 kg ; ou pristinamycine PO : 1 g 3 fois par jour', 'choix');
  const srcH19 = S(H19, '§ 6.5, p. 25 (AE)', 'Une antibiothérapie de courte durée (5 jours) active sur SA (clindamycine per os/IV, pristinamycine per os, oxacilline ou cloxacilline IV, cefazoline IV), est recommandée en complément du geste chirurgical.', 'choix');
  const src100 = S(H_AB, 'antibiothérapie', 'jusqu\'à 600 mg 4 fois par jour si poids > 100 kg', 'posologie');
  const div = 'Divergence affichée : HAS 2019/2021, antibiotique systématique après drainage ; IDSA 2014 (II, strong, low), antibiotique décidé selon la présence d\'un SIRS.';
  // Sepsis ou choc : les formes IV listées par la HAS passent en 1re ligne, les formes orales sous réserve.
  if (k.grave) k.oralSousReserve = 'si la voie orale est possible (sepsis ou choc : voie IV)';
  const rIV = k.grave ? ('premiere_ligne' as const) : ('conditionnelle' as const);
  const cIV = k.grave ? undefined : 'si la voie IV est nécessaire';
  const n = [
    proposer(k, { id: 'abces-clindamycine', libelle: 'Clindamycine per os', type: 'probabiliste', rang: 'premiere_ligne', items: [clinda(k, 'po')], duree: d5, sources: [srcChoix, srcH19, src100], commentaire: `Le RCP classe le SARM « inconstamment sensible » à la clindamycine : l'antibiogramme du pus reste nécessaire. ${div}` }),
    proposer(k, { id: 'abces-pristinamycine', libelle: 'Pristinamycine per os', type: 'probabiliste', rang: 'premiere_ligne', items: [PRISTINA], duree: d5, sources: [srcChoix, srcH19], commentaire: `Contre-indiquée avec la colchicine. ${div}` }),
    proposer(k, { id: 'abces-clindamycine-iv', libelle: 'Clindamycine IV', type: 'probabiliste', rang: rIV, condition: cIV, items: [clinda(k, 'iv')], duree: d5, sources: [srcChoix, srcH19, src100] }),
    proposer(k, { id: 'abces-cloxacilline', libelle: 'Cloxacilline IV', type: 'probabiliste', rang: rIV, condition: cIV, items: [CLOXA], duree: d5, sources: [S(H_AB, 'antibiothérapie', 'oxacilline ou cloxacilline IV : 100 mg/kg/j', 'choix'), srcH19] }),
    proposer(k, { id: 'abces-cefazoline', libelle: 'Céfazoline IV', type: 'probabiliste', rang: rIV, condition: cIV, items: [CEFAZ], duree: d5, sources: [S(H_AB, 'antibiothérapie', 'céfazoline IV : 80 mg/kg/j', 'choix'), srcH19] }),
  ].filter(Boolean).length;
  if (n === 0 && !k.sansOptions) f.absence('Abcès cutané : aucune molécule recommandée n\'est utilisable (antibiogramme, contre-indication)', 'HAS 2019 et la fiche HAS 2021 ne citent pas d\'autre molécule.', ['Avis du SMIT avec l\'antibiogramme complet'], [srcH19]);
  f.reeval('Adapter l\'antibiotique à l\'antibiogramme du pus.', [srcH19]);
}

function furoncle(k: K) {
  const { ctx, f } = k;
  let comp = reponseDetail(ctx.dossier, 'peau.furoncle_complique');
  const soins = 'Soins locaux : ne pas manipuler le furoncle ; toilette, pansement ; incision de l\'extrémité s\'il est volumineux.';
  const srcSoins = S(H19, '§ 4.4.1, p. 22 (AE)', 'ne pas traiter par antibiothérapie (locale ou générale)', 'choix');
  const srcSyst = S(H19, '§ 4.1, p. 21', 'présence de signes systémiques (fièvre)', 'definition');
  // HAS 2019 : des signes systémiques (fièvre) définissent le furoncle compliqué ; un sepsis ou une bactériémie aussi.
  const syst = motifSystemique(k);
  if (syst && comp !== 'oui') {
    if (comp === 'non') f.alerte('attention', `Réponse « furoncle non compliqué » contredite par : ${syst}. Forme compliquée retenue (signes systémiques, HAS 2019) ; vérifier la saisie.`, [srcSyst]);
    comp = 'oui';
  }
  if (comp === 'non') {
    const ind = indicationSansTraitement(
      'Furoncle isolé non compliqué : pas d\'antibiothérapie',
      'Soins locaux seuls ; ni antibiotique local ni antibiotique général (HAS).',
      ['furoncle isolé', 'ni complication ni terrain à risque', 'ni fièvre, ni sepsis, ni bactériémie'],
      [soins, 'Pas de prélèvement ; pas de recherche de la leucocidine de Panton-Valentine en routine'],
      ['Anthrax, multiplication des lésions, dermohypodermite péri-lésionnelle, abcédation secondaire, fièvre'],
      [S(H_FU, 'furoncle isolé', 'ne pas traiter par antibiothérapie locale ou générale', 'choix'), srcSoins, S(H19, '§ 4.2, p. 21 (AE)', 'ne pas faire de prélèvement', 'controle_micro')],
    );
    f.c.indication = ind;
    f.situation('furoncle-simple', 'Furoncle isolé non compliqué', 'couverte', ind.raison);
    return;
  }
  const champ = 'furoncle compliqué ou terrain à risque (anthrax, lésions multiples, dermohypodermite, abcédation, fièvre ; immunodépression, diabète, obésité, face, main, péri-orificiel, échec)';
  f.situation('furoncle-complique', comp === 'oui' ? 'Furoncle compliqué ou à risque de complication' : 'Furoncle : complication ou terrain à risque à préciser', comp === 'oui' ? 'couverte' : 'partielle', 'Prélèvement du pus puis antibiothérapie anti-staphylococcique 5 jours, sans attendre le résultat.');
  if (comp === 'inconnu') {
    f.manque(champ, 'furoncle isolé non compliqué : pas d\'antibiotique ; compliqué : antibiothérapie 5 jours (HAS)', 'bloque_decision', C('furoncle_complique'));
    f.c.indication = indicationInsuffisante('Furoncle : indication de l\'antibiotique à préciser', 'Furoncle isolé non compliqué : soins locaux seuls ; furoncle compliqué ou terrain à risque : antibiothérapie 5 jours (HAS 2019).', [champ], [srcSoins, srcSyst]);
  }
  f.geste(soins, [srcSoins]);
  f.controle({ id: 'ctl-furoncle-pus', type: 'prelevement', categorie: comp === 'oui' ? 'indique' : 'conditionnel', quoi: 'Prélèvement bactériologique du pus', quand: { ancre: 'avant_traitement', texte: 'Avant l\'antibiotique, sans en attendre le résultat' }, pourquoi: 'Furoncle compliqué, retour de voyage ou terrain à risque.', sources: [S(H19, '§ 4.4.2, p. 22 (AE)', 'après la réalisation d\'un prélèvement bactériologique, et sans en attendre les résultats', 'controle_micro')] });
  const d5 = jours(5, [S(H19, '§ 4.4.2, p. 22 (AE)', 'La durée du traitement recommandée est de 5 jours.', 'duree')]);
  const rang = comp === 'oui' ? ('premiere_ligne' as const) : ('conditionnelle' as const);
  const condition = comp === 'oui' ? undefined : 'seulement si furoncle compliqué ou terrain à risque';
  if (k.grave) {
    k.oralSousReserve = RESERVE_ORALE_GRAVE;
    absenceGrave(k, 'Furoncle compliqué');
  }
  proposer(k, { id: 'furoncle-clindamycine', libelle: 'Clindamycine per os', type: 'probabiliste', rang, condition, items: [clinda(k, 'po')], duree: d5, sources: [S(H_FU, 'furoncle compliqué', 'clindamycine : 600 mg 3 fois par jour (et jusqu\'à 600 mg 4 fois par jour si poids > 100 kg) pendant 5 jours', 'choix')] });
  proposer(k, { id: 'furoncle-pristinamycine', libelle: 'Pristinamycine per os', type: 'probabiliste', rang, condition, items: [PRISTINA], duree: d5, sources: [S(H_FU, 'furoncle compliqué', 'pristinamycine : 1 g 3 fois par jour pendant 5 jours', 'choix')], commentaire: 'Contre-indiquée avec la colchicine.' });
  f.reeval('Réadapter à l\'antibiogramme du pus.', [S(H_FU, 'furoncle compliqué', undefined, 'choix')]);
}

function furonculose(k: K) {
  const { f } = k;
  f.situation('furonculose', 'Furonculose (poussée)', 'couverte', 'Prélèvement, antibiothérapie anti-staphylococcique 7 jours, hygiène et douches à la chlorhexidine ; décolonisation après guérison, sans antibiotique général.');
  f.controle({ id: 'ctl-furonculose-pus', type: 'prelevement', categorie: 'indique', quoi: 'Prélèvement bactériologique du pus d\'un furoncle', quand: { ancre: 'avant_traitement', texte: 'Avant traitement' }, pourquoi: 'Documentation de la souche (SARM communautaire possible).', sources: [S(H_FS, 'prélèvement', 'Réalisation d\'un prélèvement bactériologique avant traitement.', 'controle_micro')] });
  f.geste('Mesures d\'hygiène, pansement ; douche quotidienne à la chlorhexidine pendant 7 jours.', [S(H19, '§ 5.4, p. 23 (AE)', undefined, 'geste'), S(H_FS, 'poussée', undefined, 'geste')]);
  f.geste('Après guérison : décolonisation du patient et de l\'entourage (mupirocine nasale 2 fois par jour 7 jours, chlorhexidine ; mupirocine non intégrée, RCP non lu) ; pas d\'antibiotique par voie générale pour décoloniser. Dépistage des gîtes seulement après échec d\'une première décolonisation ; cas groupés (plus de 2 cas) : conduite du HCSP 2014.', [
    S(H_FS, 'décolonisation', 'Il n\'est pas recommandé de prescrire une antibiothérapie par voie générale pour réaliser une décolonisation.', 'geste'),
    S(H19, '§ 5.2, p. 23 (AE)', 'seulement après échec d\'une première décolonisation', 'controle_micro'),
    S(HCSP, '§ 6.4.4, p. 31', undefined, 'geste'),
  ]);
  const src = S(H19, '§ 5.4, p. 23 (AE)', 'antibiothérapie orale anti-staphylococcique (pristinamycine ou clindamycine) pendant 7 jours', 'choix');
  const d7 = jours(7, [S(H19, '§ 5.4, p. 23 (AE)', 'antibiothérapie orale anti-staphylococcique (pristinamycine ou clindamycine) pendant 7 jours', 'duree')]);
  if (k.grave) {
    k.oralSousReserve = RESERVE_ORALE_GRAVE;
    absenceGrave(k, 'Furonculose');
  }
  proposer(k, { id: 'furonculose-clindamycine', libelle: 'Clindamycine per os', type: 'probabiliste', rang: 'premiere_ligne', items: [clinda(k, 'po')], duree: d7, sources: [src, S(H_FS, 'poussée', undefined, 'choix')] });
  proposer(k, { id: 'furonculose-pristinamycine', libelle: 'Pristinamycine per os', type: 'probabiliste', rang: 'premiere_ligne', items: [PRISTINA], duree: d7, sources: [src, S(H_FS, 'poussée', undefined, 'choix')], commentaire: 'Contre-indiquée avec la colchicine.' });
}

/* ------------------------------------------------------------------ */
/* Impétigo                                                            */
/* ------------------------------------------------------------------ */

function impetigo(k: K) {
  const { ctx, f } = k;
  let grave = reponseDetail(ctx.dossier, 'peau.impetigo_grave');
  const champ = 'impétigo grave (ecthyma, > 2 % de surface, > 6 lésions, extension rapide)';
  const syst = motifSystemique(k);
  const srcGrave = S(H19, '§ 7.4.3, p. 27 (AE)', 'pour une durée de 7 jours', 'duree');
  if (syst && grave === 'non') {
    // Pas de conclusion « traitement local seul » avec un sepsis ou une bactériémie : la forme est à revoir.
    f.alerte('attention', `Réponse « impétigo peu étendu » contredite par : ${syst}. Pas de conclusion « traitement local seul » ; vérifier la forme et rechercher une autre infection.`, [srcGrave]);
    f.manque(`${champ} — réponse « non » contredite par : ${syst}`, 'forme peu étendue : traitement local seul ; forme grave : antibiothérapie générale (HAS)', 'bloque_decision', C('impetigo_grave'));
    grave = 'incoherent';
  }
  if (grave === 'non') {
    const ind = indicationSansTraitement(
      'Impétigo peu étendu : pas d\'antibiothérapie par voie générale',
      'Forme peu étendue (moins de 2 % de la surface, moins de 6 lésions, sans extension rapide) : traitement local seul (HAS, grade C).',
      ['impétigo peu étendu', 'ni sepsis ni bactériémie'],
      ['Mupirocine locale 2 à 3 fois par jour pendant 5 jours (HAS) — molécule non intégrée à l\'application (RCP non lu)', 'Pas de prélèvement lors d\'une première poussée', 'Impétiginisation : traiter aussi la dermatose sous-jacente'],
      ['Ecthyma, plus de 2 % de la surface, plus de 6 lésions, extension rapide'],
      [S(H19, '§ 7.4.2, p. 27 (grade C)', 'deux à trois fois par jour pendant une durée de 5 jours', 'choix'), S(H_IM, 'forme localisée', '2 ou 3 fois par jour pendant une durée de 5 jours', 'choix')],
    );
    f.c.indication = ind;
    f.situation('impetigo-localise', 'Impétigo peu étendu', 'couverte', ind.raison);
    return;
  }
  f.situation('impetigo-grave', grave === 'oui' ? 'Impétigo grave de l\'adulte' : 'Impétigo : gravité à préciser', grave === 'oui' ? 'couverte' : 'partielle', 'Prélèvement puis antibiothérapie par voie générale 7 jours, sans antibiotique local associé.');
  if (grave === 'inconnu') {
    f.manque(champ, 'forme peu étendue : traitement local ; forme grave : antibiothérapie générale (HAS)', 'bloque_decision', C('impetigo_grave'));
    if (!syst) f.c.indication = indicationInsuffisante('Impétigo : gravité à préciser', 'Forme peu étendue : traitement local seul ; forme grave : antibiothérapie par voie générale 7 jours (HAS 2019).', [champ], [srcGrave]);
  }
  f.controle({ id: 'ctl-impetigo-prelevement', type: 'prelevement', categorie: grave === 'oui' ? 'indique' : 'conditionnel', quoi: 'Prélèvement du pus ou du liquide de bulle', quand: { ancre: 'avant_traitement', texte: 'Avant traitement, sans en attendre le résultat' }, pourquoi: 'Formes autres qu\'un impétigo peu étendu en première poussée.', sources: [S(H19, '§ 7.2, p. 26 (AE)', undefined, 'controle_micro')] });
  f.geste('Impétiginisation : traiter aussi la dermatose sous-jacente.', [S(H19, '§ 7.4.4', undefined, 'geste')]);
  if (k.grave) {
    k.oralSousReserve = RESERVE_ORALE_GRAVE;
    absenceGrave(k, 'Impétigo');
  }
  const n = proposer(k, {
    id: 'impetigo-pristinamycine',
    libelle: 'Pristinamycine per os',
    type: 'probabiliste',
    rang: grave === 'oui' ? 'premiere_ligne' : 'conditionnelle',
    condition: grave === 'oui' ? undefined : 'seulement si impétigo grave',
    items: [PRISTINA],
    duree: jours(7, [srcGrave]),
    sources: [S(H_IM, 'formes graves, adulte', 'pristinamycine per os : 1 g 3 fois par jour pendant 7 jours', 'choix'), S(H19, '§ 7.4.3, p. 27 (AE)', 'la pristinamycine ou une C1G (comme la céfalexine)', 'choix')],
    commentaire: 'Céfalexine per os 2 à 4 g/j pendant 7 jours : autre choix de la HAS, non intégré (RCP non lu). En cas d\'allergie à la pénicilline : pristinamycine (HAS). Pas d\'antibiotique local associé ; SARM non pris en compte en probabiliste (HAS 2019). Contre-indiquée avec la colchicine.',
  });
  if (!n && !k.sansOptions)
    f.absence('Impétigo grave : pristinamycine non utilisable', 'La HAS cite la pristinamycine ou la céfalexine ; la céfalexine n\'est pas intégrée à l\'application (RCP non lu).', ['Avis du SMIT (céfalexine 2 à 4 g/j pendant 7 jours selon la HAS, en l\'absence d\'allergie)'], [S(H_IM, 'formes graves, adulte', 'céfalexine per os : 2 à 4 g par jour pendant 7 jours', 'choix')]);
}

/* ------------------------------------------------------------------ */
/* Morsures                                                            */
/* ------------------------------------------------------------------ */

function morsure(k: K) {
  const { ctx, f } = k;
  const p = ctx.dossier.patient;
  const infectee = reponseDetail(ctx.dossier, 'peau.morsure_infectee');
  const profonde = reponseDetail(ctx.dossier, 'peau.morsure_profonde');
  const humaine = reponseDetail(ctx.dossier, 'peau.morsure_origine') === 'humaine';
  f.geste('Lavage abondant et parage ; plaie profonde de chat peu accessible : laissée ouverte, fermeture secondaire à J4-J5.', [S(SFMU, '§ 3.3.5 ; § 4.1.2, p. 17-18', undefined, 'geste')]);
  f.geste('Prévention du tétanos : mise à jour de la vaccination antitétanique (HAS 2019, cité pour la DHBNN ; la conduite française détaillée n\'a pas été recherchée — se référer au calendrier vaccinal en vigueur ; IDSA 2014, texte des États-Unis : anatoxine si non vacciné depuis 10 ans). Risque rabique : contacter le centre antirabique.', [S(H19, '§ 1.8.4, p. 14 (AE)', 'mise à jour de la vaccination antitétanique', 'geste'), S(SFMU, '§ 4.1.2, p. 17-18', undefined, 'geste'), S(IDSA, 'XIII', undefined, 'geste')]);
  if (humaine) f.geste('Morsure humaine : évaluer le risque de transmission du VIH, du VHB et du VHC.', [S(SFMU, 'tableau 2, p. 12', undefined, 'geste')]);
  f.avis('Avis chirurgical si lésion ostéo-tendineuse ou articulaire, plaie complexe de la face, atteinte nerveuse ou complication (abcès, ostéite, arthrite).', false, [S(SFMU, 'p. 18', undefined, 'geste'), S(IDSA, 'XI', undefined, 'geste')]);
  f.reeval('Réévaluation clinique systématique à 48 h.', [S(SFMU, 'p. 10', 'systématiquement à 48 h', 'choix')], 48);
  if (infectee === 'oui')
    f.controle({ id: 'ctl-morsure-prelevement', type: 'prelevement', categorie: 'conditionnel', quoi: 'Ponction d\'une éventuelle collection profonde ; pas de prélèvement superficiel (SFMU 2017). HAS 2019 : prélèvement de la porte d\'entrée (± hémocultures) en cas de DHBNN après morsure — divergence sur le prélèvement superficiel', quand: { ancre: 'avant_traitement', texte: 'Avant l\'antibiotique, sans le retarder' }, pourquoi: 'Pasteurella, streptocoques, staphylocoques, anaérobies ; Eikenella après morsure humaine.', sources: [S(SFMU, '§ 3.3.4, p. 10', 'Seule la ponction d\'une éventuelle collection profonde est justifiée', 'controle_micro'), S(H19, '§ 1.6, p. 12 (AE)', 'morsure animale ou humaine', 'controle_micro')] });
  else
    f.controle({ id: 'ctl-morsure-pas-de-prelevement', type: 'prelevement', categorie: 'non_systematique', quoi: 'Pas de prélèvement en l\'absence de signe infectieux, même si la plaie est vue tardivement', quand: { ancre: 'non_determine', texte: 'Sans objet sans signe infectieux' }, pourquoi: 'Les prélèvements superficiels ne sont pas indiqués.', sources: [S(SFMU, 'p. 18', 'Il n\'y a pas d\'indication à réaliser de prélèvement en l\'absence de signe infectieux, même si la plaie est vue tardivement.', 'controle_micro')] });

  const champInf = 'signes d\'infection de la plaie de morsure';
  const srcInf = S(SFMU, 'p. 10', 'L\'antibiothérapie doit être systématique pour toutes les plaies profondes résultant d\'une morsure', 'choix');
  if (infectee === 'inconnu') {
    f.situation('morsure-a-preciser', 'Morsure : présence de signes d\'infection à préciser', 'partielle', 'Plaie infectée : traitement curatif ; plaie non infectée : traitement préemptif selon la profondeur.');
    f.manque(champInf, 'traitement curatif (HAS) ou préemptif (SFMU, IDSA)', 'bloque_decision', C('morsure_infectee'));
    f.c.indication = indicationInsuffisante('Morsure : signes d\'infection à préciser', 'Plaie infectée : traitement curatif (HAS 2019) ; plaie non infectée : traitement préemptif selon la profondeur (SFMU 2017) ou des situations à risque (IDSA 2014).', [champInf], [srcInf]);
    return;
  }
  const syst = motifSystemique(k);
  if (infectee === 'non' && syst) {
    f.situation('morsure-incoherente', 'Morsure déclarée non infectée, avec ' + syst, 'partielle', 'Signes d\'infection à vérifier : un sepsis ou une bactériémie ne permettent pas de conclure à une plaie non infectée.');
    f.alerte('attention', `Réponse « pas de signe d'infection de la morsure » contredite par : ${syst}. Vérifier la plaie et rechercher une autre source.`);
    f.manque(`${champInf} — réponse « non » contredite par : ${syst}`, 'traitement curatif (HAS) ou préemptif (SFMU, IDSA)', 'bloque_decision', C('morsure_infectee'));
    f.absence('Morsure déclarée non infectée avec sepsis ou bactériémie', 'Les recommandations lues (HAS 2019, SFMU 2017, IDSA 2014) ne traitent pas cette association.', ['Vérifier les signes d\'infection de la plaie', 'Avis du SMIT'], [srcInf]);
    f.avis('Morsure avec sepsis ou bactériémie : avis du SMIT.', k.grave, [srcInf]);
    return;
  }
  if (allergiePenicilline(ctx)) {
    f.situation('morsure-allergie', `Morsure ${infectee === 'oui' ? 'infectée' : 'non infectée'} chez un patient allergique à la pénicilline`, 'partielle', 'Avis spécialisé (HAS) : pas de proposition automatisée.');
    f.avis('Morsure et allergie à la pénicilline : avis spécialisé pour le choix de l\'antibiotique (HAS).', k.grave, [S(H_DH, 'morsure animale', 'avis spécialisé', 'choix')]);
    const srcRes = [
      S('RCP-pristinamycine', '§5.1', 'Pasteurella', 'autre'),
      S('RCP-clindamycine-orale', '§5.1', 'Pasteurella', 'autre'),
      S(IDSA, 'XII', 'resistant to first-generation cephalosporins, macrolides, clindamycin, and aminoglycosides', 'autre'),
    ];
    f.ecarter('Pristinamycine ou clindamycine en monothérapie', 'inadaptee', 'Pasteurella est naturellement résistante à la pristinamycine et à la clindamycine (RCP § 5.1) ; Eikenella (morsure humaine) est résistante à la clindamycine (IDSA 2014)', srcRes);
    f.absence('Morsure chez un patient allergique à la pénicilline', 'La fiche HAS 2021 renvoie à un avis spécialisé. Le SFMU 2017 propose la doxycycline (non intégrée, RCP non lu), puis pristinamycine, clindamycine ou cotrimoxazole ; or les RCP classent Pasteurella parmi les espèces naturellement résistantes à la pristinamycine et à la clindamycine : pas de proposition automatisée.', ['Avis spécialisé (SMIT)'], [S(H_DH, 'morsure animale', 'avis spécialisé', 'choix'), S(SFMU, 'tableau 1, p. 11', 'Doxycycline 100 mg / 12 h PO', 'choix'), ...srcRes]);
    return;
  }
  if (infectee === 'oui') {
    f.situation('morsure-infectee', 'Morsure infectée (DHBNN après morsure)', 'couverte', 'Amoxicilline-acide clavulanique per os ; durée divergente entre la HAS (7 jours) et le SFMU (10 à 14 jours si infection patente ou plaie vue tardivement).');
    if (k.grave) {
      k.oralSousReserve = RESERVE_ORALE_GRAVE;
      absenceGrave(k, 'Morsure infectée');
    }
    const lourd = p.poidsKg !== undefined && p.poidsKg > 60;
    if (lourd)
      f.alerte('attention', `Amoxicilline-acide clavulanique 50 mg/kg/j chez un patient de ${p.poidsKg} kg : plus de 3 g/j d'amoxicilline. Vérifier, selon la présentation choisie, que l'acide clavulanique reste ≤ 375 mg/j (HAS 2019, fiche HAS 2021).`, [S(H_DH, 'morsure animale', 'sans dépasser 375 mg par jour d\'acide clavulanique, pendant 7 jours', 'posologie')]);
    proposer(k, {
      id: 'morsure-infectee-amoxclav',
      libelle: 'Amoxicilline-acide clavulanique per os',
      type: 'probabiliste',
      rang: 'premiere_ligne',
      statut: 'brouillon',
      items: [AMC50],
      duree: {
        texte: '7 jours (HAS 2019, fiche HAS 2021) ; SFMU 2017 : total de 10 à 14 jours si infection patente ou morsure vue tardivement (divergence non tranchée)',
        pointDeDepart: 'premier jour de traitement',
        dureePrevueJours: 7,
        sources: [S(H_DH, 'morsure animale', 'pendant 7 jours', 'duree'), S(SFMU, 'p. 10', 'prolongée pour un total de 10 à 14 jours', 'duree')],
      },
      sources: [S(H19, 'p. 13 (AE)', 'DHBNN après morsure : amoxicilline-acide clavulanique oral : 50 mg/kg/jour d\'amoxicilline sans dépasser 6 g/jour, et sans dépasser 375 mg/jour d\'acide clavulanique, pour une durée de 7 jours', 'choix'), S(H_DH, 'morsure animale', 'sans dépasser 375 mg par jour d\'acide clavulanique, pendant 7 jours', 'choix')],
      commentaire: `Brouillon : durée divergente entre la HAS et le SFMU ; dose également divergente : HAS 50 mg/kg/j d'amoxicilline, SFMU 2017 1 g trois fois par jour. Plafond d'acide clavulanique : 375 mg/j (HAS 2021 ; 250 mg/j dans le tableau 1 de HAS 2019), non calculé par l'application (dépend de la présentation).${lourd ? ' Au-delà de 60 kg, la dose dépasse 3 g/j d\'amoxicilline : vérifier le plafond d\'acide clavulanique.' : ''}`,
    });
    return;
  }
  // Plaie non infectée : traitement préemptif (SFMU : plaies profondes ; IDSA : situations à risque). Les deux sources
  // divergent sur l'indication du préemptif (note § 11.3) : les options préemptives sont en brouillon.
  const d5 = jours(5, [S(SFMU, 'p. 10', 'généralement de cinq jours', 'duree')]);
  const srcSfmu = [srcInf, S(SFMU, 'p. 10', 'amoxicilline et acide clavulanique à la posologie de 1 g trois fois par jour', 'posologie')];
  const idsa = 'IDSA 2014 : traitement préemptif de 3 à 5 jours en cas d\'immunodépression, d\'asplénie, d\'hépatopathie avancée, d\'œdème de la zone, de lésion modérée à sévère notamment de la main ou de la face, d\'atteinte possible du périoste ou de l\'articulation.';
  const listeIdsa = 'Immunodépression, asplénie, hépatopathie avancée, œdème de la zone, lésion modérée à sévère (notamment main ou face), atteinte possible du périoste ou de l\'articulation (IDSA 2014)';
  if (profonde === 'oui') {
    f.situation('morsure-profonde', 'Plaie profonde de morsure, sans signe d\'infection', 'couverte', 'Antibiothérapie préemptive systématique (SFMU 2017), 5 jours, réévaluation à 48 h.');
    proposer(k, { id: 'morsure-preemptif-amoxclav', libelle: 'Amoxicilline-acide clavulanique per os (préemptif)', type: 'probabiliste', rang: 'premiere_ligne', statut: 'brouillon', items: [AMC_PO], duree: d5, sources: srcSfmu, commentaire: `Brouillon : indication du préemptif divergente entre le SFMU 2017 (toute plaie profonde) et l'IDSA 2014 (situations à risque) — même statut que le cas superficiel. ${idsa}` });
    return;
  }
  if (profonde === 'inconnu') {
    const champ = 'profondeur de la plaie de morsure';
    f.situation('morsure-a-preciser', 'Morsure sans signe d\'infection : profondeur à préciser', 'partielle', 'SFMU 2017 : antibiothérapie préemptive systématique si plaie profonde.');
    f.manque(champ, 'SFMU 2017 : antibiothérapie préemptive systématique si plaie profonde', 'bloque_decision', C('morsure_profonde'));
    f.c.indication = indicationInsuffisante('Morsure : profondeur de la plaie à préciser', 'Plaie profonde : traitement préemptif systématique (SFMU 2017) ; plaie superficielle : selon les situations à risque (IDSA 2014).', [champ], srcSfmu);
    return;
  }
  // Plaie non profonde, non infectée.
  const facteurs = reponseDetail(ctx.dossier, 'peau.morsure_facteurs');
  const immuno = p.immunodepression === 'oui';
  const srcIdsa = S(IDSA, 'XI (strong, low)', undefined, 'choix');
  if (facteurs === 'oui' || immuno) {
    f.situation('morsure-superficielle-risque', 'Morsure non profonde, sans signe d\'infection, situation à risque (IDSA 2014)', 'partielle', 'SFMU 2017 : antibiothérapie systématique seulement pour les plaies profondes ; IDSA 2014 : préemptif dans des situations à risque. Indications divergentes : option conditionnelle en brouillon.');
    proposer(k, {
      id: 'morsure-preemptif-amoxclav',
      libelle: 'Amoxicilline-acide clavulanique per os (préemptif)',
      type: 'probabiliste',
      rang: 'conditionnelle',
      condition: `selon l'IDSA 2014 (situation à risque : ${immuno ? 'immunodépression' : 'facteur déclaré'}) ; le SFMU 2017 ne le prévoit que pour les plaies profondes`,
      statut: 'brouillon',
      items: [AMC_PO],
      duree: d5,
      sources: [...srcSfmu, srcIdsa],
      commentaire: `Brouillon : indications du traitement préemptif divergentes entre le SFMU 2017 et l'IDSA 2014. ${idsa}`,
    });
    return;
  }
  if (facteurs === 'inconnu') {
    const champ = 'situation à risque selon l\'IDSA (asplénie, hépatopathie avancée, œdème, lésion de la main ou de la face, atteinte du périoste ou de l\'articulation)';
    f.situation('morsure-a-preciser', 'Morsure non profonde sans signe d\'infection : situation à risque à préciser', 'partielle', 'Sans plaie profonde ni situation à risque, ni le SFMU 2017 ni l\'IDSA 2014 ne prévoient d\'antibiotique.');
    f.manque(champ, 'IDSA 2014 : traitement préemptif dans ces situations', 'bloque_decision', C('morsure_facteurs'));
    f.c.indication = indicationInsuffisante('Morsure non profonde : situation à risque à préciser', 'Sans plaie profonde (SFMU 2017) ni situation à risque (IDSA 2014), aucune des sources lues ne prévoit d\'antibiotique.', [champ], [srcSfmu[0], srcIdsa]);
    return;
  }
  const ind = indicationSansTraitement(
    'Morsure non profonde, sans signe d\'infection ni situation à risque : pas d\'antibiotique',
    'Le SFMU 2017 réserve l\'antibiothérapie systématique aux plaies profondes ; l\'IDSA 2014 réserve le préemptif aux situations à risque.',
    ['plaie non profonde', 'pas de signe d\'infection', 'pas de situation à risque (IDSA 2014)'],
    ['Lavage, parage, prévention du tétanos et de la rage', 'Réévaluation clinique à 48 h'],
    [`Apparition de signes d'infection ; ${listeIdsa}`],
    [srcSfmu[0], srcIdsa],
  );
  f.c.indication = ind;
  f.situation('morsure-sans-antibiotique', 'Morsure non profonde, sans signe d\'infection ni situation à risque', 'couverte', ind.raison);
}

/* ------------------------------------------------------------------ */
/* Pied diabétique                                                     */
/* ------------------------------------------------------------------ */

function piedDiabetique(k: K) {
  const { ctx, f } = k;
  const p = ctx.dossier.patient;
  const grade = reponseDetail(ctx.dossier, 'peau.pied_grade');
  const osteite = reponseDetail(ctx.dossier, 'peau.pied_osteite');
  const necrose = reponseDetail(ctx.dossier, 'peau.necrose');
  const sarm = p.antecedentsMicro.some((a) => a.resistance === 'SARM');
  const allergie = allergiePenicilline(ctx);
  const srcPrl = S(SP23, 'diapo 7', 'prélever uniquement en présence de signes cliniques évocateurs d\'une infection de plaie (grade 2, 3 ou 4)', 'controle_micro');
  const champGrade = 'grade IWGDF/IDSA de l\'infection du pied';
  const poso = 'Posologies SPILF 2023 « validées pour des patients dont l\'IMC est < 30 kg/m2 », à adapter à la fonction rénale.';
  const srcDuree = S(IWGDF, 'Rec. 12b (Strong; High)', 'for a duration of 1 to 2 weeks', 'duree');
  const d10: DureeDecidee = { texte: '10 jours après excision de la nécrose (jusqu\'à 14 jours si pas d\'amélioration à J7)', pointDeDepart: 'excision de la nécrose, si une excision est réalisée (SPILF 2023)', dureePrevueJours: 10, sources: [S(SP23, 'diapo 29 (grades 3 et 4)', undefined, 'duree'), srcDuree] };

  /** Grade 4 avec sepsis ou choc (SPILF 2023, diapo 15). */
  const optionSepsis = (rang: 'premiere_ligne' | 'conditionnelle', condition?: string) => {
    if (allergie) {
      f.absence('Pied diabétique grade 4 avec sepsis ou choc, allergie à la pénicilline déclarée', 'SPILF 2023 : allergie non grave aux bêta-lactamines, céfépime + métronidazole + (lipo)glycopeptide ou linézolide, ou ceftobiprole + métronidazole ; allergie grave, aztréonam + métronidazole + (lipo)glycopeptide ou linézolide. Métronidazole et linézolide ne sont pas intégrés à l\'application.', ['Avis infectiologique immédiat'], [S(SP23, 'diapo 15', undefined, 'choix')]);
      f.avis('Pied diabétique avec sepsis et allergie : avis infectiologique immédiat.', true, [S(SP23, 'diapo 15', undefined, 'choix')]);
      return;
    }
    const choc = p.gravite === 'choc_septique';
    if (ctx.risqueBLSE.present)
      f.alerte('attention', `Risque de BLSE (${ctx.risqueBLSE.raisons.join(', ')}) : la SPILF 2023 exclut les carbapénèmes « sauf si suspicion de BLSE » ; aucun schéma n'est précisé dans ce cas — avis infectiologique.`, [S(SP23, 'diapo 15', undefined, 'choix')]);
    proposer(k, {
      id: 'pied-g4-sepsis',
      libelle: `Pipéracilline-tazobactam + vancomycine${choc ? ' + amikacine (choc septique)' : ''}`,
      type: 'probabiliste',
      rang,
      condition,
      items: choc ? [PTZ, VANCO, AMIKA] : [PTZ, VANCO],
      duree: d10,
      sources: [S(SP23, 'diapo 15', 'Pipéracilline/tazobactam + (lipo)glycopeptide ou linézolide', 'choix'), S(SP23, 'diapo 15', 'Si choc septique : ajout d\'amikacine', 'choix'), S(SP23, 'diapo 26', '12-16 g/j', 'posologie')],
      commentaire: `Linézolide (alternative au glycopeptide) non intégré. Pas de carbapénème sauf suspicion de BLSE, pas de tigécycline (SPILF 2023). Vancomycine : schéma de la base ; la valeur SPILF « 15-20 mg/kg/j », ambiguë, n'est pas reprise. ${poso}`,
    });
  };

  if (osteite === 'oui') {
    f.controle({ id: 'ctl-pied-biopsie-osseuse', type: 'prelevement', categorie: 'indique', quoi: 'Biopsie osseuse (plutôt qu\'un prélèvement des tissus mous)', quand: { ancre: 'avant_traitement', texte: 'Avant l\'antibiothérapie de l\'ostéite' }, pourquoi: 'Ostéite suspectée : documentation osseuse.', sources: [S(SP23, 'diapo 7', undefined, 'controle_micro'), S(IWGDF, 'Rec. 10 (Conditional; Moderate)', undefined, 'controle_micro')] });
    f.alerte('info', 'Ostéite suspectée (O) : traitement propre — pas d\'antibiothérapie probabiliste pour une ostéite sans infection des tissus mous ; durées SPILF 2023 : 6 semaines sans chirurgie, 3 semaines en cas d\'ostéite résiduelle après chirurgie, 5 jours après amputation complète. Biomarqueurs sériques non recommandés pour le diagnostic.', [S(SP23, 'diapo 11', 'en cas d\'ostéite sans infection associée de la peau ou des tissus mous', 'choix'), S(SP23, 'diapo 29', undefined, 'duree'), S(SP23, 'diapo 4', 'Il n\'est pas recommandé d\'utiliser un biomarqueur sérique (CRP, VS, procalcitonine) dans le diagnostic d\'une OPPD', 'definition'), S(IWGDF, 'Rec. 17', undefined, 'duree')]);
    f.avis('Ostéite du pied diabétique suspectée : avis spécialisé (documentation osseuse, durée, chirurgie).', false, [S(SP23, 'diapo 7 et 29', undefined, 'choix')]);
  } else if (osteite === 'inconnu') f.manque('ostéite suspectée (pied diabétique)', 'biopsie osseuse et durée propre à l\'ostéite (SPILF 2023)', 'affine', C('pied_osteite'));

  // Nécrose ou gravité locale : chirurgie en urgence, quel que soit le grade déclaré ou le prélèvement (SPILF 2023 diapo 17).
  const srcChir = S(SP23, 'diapo 17', 'abcès profond, nécrose extensive, gangrène, gaz sous cutané, syndrome de loge', 'geste');
  if (necrose === 'oui') {
    f.urgence('elevee').alerte('urgence', 'Signes de nécrose ou de gravité locale sur le pied : hospitalisation et avis chirurgical urgent (abcès profond, nécrose extensive, gangrène, gaz sous-cutané, syndrome de loge : chirurgie en urgence).', [S(SP23, 'diapo 5', undefined, 'choix'), srcChir]);
    f.avis('Avis chirurgical urgent (pied diabétique avec nécrose ou signes de gravité locale).', true, [srcChir, S(IWGDF, 'Rec. 19-21', undefined, 'geste')]);
  } else if (necrose === 'inconnu') f.manque('signes locaux de gravité (nécrose, gangrène, gaz, abcès profond)', 'chirurgie en urgence (SPILF 2023)', 'affine', C('necrose'));

  // Grade 1 (non infecté) contredit par une nécrose, un sepsis ou une bactériémie : jamais « pas d'antibiotique ».
  const contradiction = grade === '1' ? (necrose === 'oui' ? 'signes de nécrose' : motifSystemique(k)) : undefined;
  if (grade === 'inconnu' || contradiction) {
    if (contradiction) {
      f.situation('pied-grade-incoherent', `Pied diabétique : grade 1 (non infecté) déclaré, contredit par : ${contradiction}`, 'partielle', 'Grade à vérifier : une plaie non infectée ne s\'accompagne ni de nécrose, ni de sepsis, ni de bactériémie liée au pied.');
      f.alerte('attention', `Grade 1 (plaie non infectée) contredit par : ${contradiction}. Pas de conclusion « ni prélèvement ni antibiotique » ; vérifier le grade (grade 4 = au moins 2 critères de SRIS).`, [S(SP23, 'diapo 6', undefined, 'definition')]);
      f.manque(`${champGrade} — grade 1 contredit par : ${contradiction}`, 'prélèvement, antibiotique et durée dépendent du grade (SPILF 2023, IWGDF 2023)', 'bloque_decision', C('pied_grade'));
    } else {
      f.situation('pied-grade-a-preciser', 'Plaie du pied diabétique : grade IWGDF à préciser', 'partielle', 'Grade 1 : ni prélèvement ni antibiotique ; grades 2 à 4 : prélèvement après débridement et antibiothérapie selon le grade (SPILF 2023).');
      f.manque(champGrade, 'prélèvement, antibiotique et durée dépendent du grade (SPILF 2023, IWGDF 2023)', 'bloque_decision', C('pied_grade'));
    }
    if (k.grave) optionSepsis('conditionnelle', 'si l\'infection du pied est la source du sepsis (grade 4 : au moins 2 critères de SRIS)');
    else if (contradiction && k.bactSignif)
      f.absence('Bactériémie avec une plaie du pied déclarée non infectée', 'Les recommandations lues (SPILF 2023, IWGDF 2023) ne traitent pas cette association : grade à vérifier, autre source à rechercher.', ['Vérifier le grade de la plaie', 'Avis infectiologique'], [S(SP23, 'diapo 6', undefined, 'definition')]);
    return;
  }
  if (grade === '1') {
    const ind = indicationSansTraitement(
      'Plaie du pied non infectée (grade 1) : ni prélèvement ni antibiotique',
      'Une plaie non infectée ne se prélève pas et ne se traite pas par antibiotique, ni local ni général.',
      ['grade IWGDF 1 (moins de 2 signes d\'infection)', 'ni nécrose, ni sepsis, ni bactériémie'],
      ['Soins de plaie, décharge', ...(osteite === 'oui' ? ['Ostéite suspectée : biopsie osseuse avant tout antibiotique ; pas de probabiliste sans infection des tissus mous ; avis spécialisé'] : [])],
      ['Apparition d\'au moins 2 signes d\'infection (œdème ou induration, érythème > 0,5 cm, douleur, chaleur, pus)'],
      [srcPrl, S(IWGDF, 'Rec. 11', undefined, 'choix'), S(SP23, 'diapo 3', 'La présence d\'au moins 2 signes définit l\'infection de la plaie', 'definition')],
    );
    f.c.indication = ind;
    f.situation('pied-grade-1', 'Plaie du pied diabétique non infectée (grade 1)', 'couverte', ind.raison);
    return;
  }

  // Grades 2 à 4.
  f.situation('pied-diabetique', `Infection de plaie du pied diabétique, grade ${grade} (IWGDF)`, 'couverte', 'Prélèvement après débridement ; antibiothérapie selon le grade et l\'ancienneté de la plaie (SPILF 2023) ; avis chirurgical et vasculaire selon la situation.');
  f.controle({ id: 'ctl-pied-prelevement', type: 'prelevement', categorie: 'indique', quoi: 'Après débridement : curetage-écouvillonnage (plaie superficielle) ou biopsie tissulaire des berges (plaie profonde) ; aspiration à l\'aiguille si collection', quand: { ancre: 'avant_traitement', texte: 'Avant l\'antibiotique' }, pourquoi: 'Documentation de l\'infection de plaie (grades 2 à 4).', sources: [srcPrl, S(SP23, 'diapo 7', 'Débrider avant tout prélèvement', 'controle_micro'), S(IWGDF, 'Rec. 5 (Conditional; Moderate)', 'preferably by aseptically collecting a tissue specimen (by curettage or biopsy)', 'controle_micro')] });
  if (grade === '4') f.controle({ id: 'ctl-pied-hemoc', type: 'hemoculture', categorie: 'indique', quoi: 'Hémocultures', quand: { ancre: 'avant_traitement', texte: 'Avant l\'antibiotique' }, pourquoi: 'Infection sévère (grade 4).', sources: [S(SP23, 'diapo 7', 'dans le grade 4', 'controle_micro')] });
  f.alerte('info', 'À ne pas faire : écouvillonnage superficiel de la plaie, ensemencement en flacons d\'hémoculture, biologie moléculaire en 1re intention, anatomopathologie des biopsies osseuses ; pas d\'antibiotique local.', [S(SP23, 'diapo 8', 'prélever par écouvillonnage superficiel de la plaie', 'controle_micro'), S(SP23, 'diapo 11', undefined, 'choix')]);
  if (grade === '3' || grade === '4') {
    f.avis('Avis chirurgical précoce (24-48 h) des formes modérées ou sévères ; bilan vasculaire récent et avis vasculaire en cas d\'artériopathie.', false, [S(IWGDF, 'Rec. 19-21', undefined, 'geste'), S(SP23, 'diapo 17', undefined, 'geste')]);
    f.alerte('attention', grade === '4' ? 'Grade 4 : hospitalisation.' : 'Grade 3 : hospitalisation si comorbidités ou critère SPILF (extension, collection, nécrose, fièvre > 38 °C, qSOFA ≥ 2, leucocytes > 12 ou < 4 G/L, déséquilibre glycémique, acidose, insuffisance rénale aiguë).', [S(IWGDF, 'Rec. 2 (Conditional; Low)', undefined, 'choix'), S(SP23, 'diapo 5', 'Fièvre > 38°C, qSOFA* ≥ 2', 'choix')]);
  }
  f.reeval('Réévaluer dès 48-72 h, y compris en ambulatoire ; en cas d\'échec à 72 h, rechercher une posologie inadaptée, une inobservance, une intolérance, un abcès profond, une ischémie ou l\'absence de décharge avant d\'élargir le spectre.', [S(SP23, 'diapo 16', 'dès 48-72 heures', 'choix')], 48);

  // Sepsis ou choc avec un grade 2 ou 3 (« sans signe général ») : grade à vérifier, schéma oral sous réserve.
  if (k.grave && (grade === '2' || grade === '3')) {
    f.alerte('attention', `Grade ${grade} déclaré avec un ${p.gravite === 'choc_septique' ? 'choc septique' : 'sepsis'} : le grade 4 se définit par au moins 2 critères de SRIS ; vérifier le grade.`, [S(SP23, 'diapo 6', undefined, 'definition')]);
    f.manque(`${champGrade} — grade ${grade} contredit par le sepsis`, 'schéma du grade 4 avec sepsis (SPILF 2023)', 'bloque_decision', C('pied_grade'));
    k.oralSousReserve = 'si la voie orale est possible et que le sepsis n\'est pas lié au pied';
    optionSepsis('conditionnelle', 'si l\'infection du pied est la source du sepsis (grade 4)');
  }

  const d7 = jours(7, [S(SP23, 'diapo 29 (peau et tissus mous, grade 2)', undefined, 'duree'), srcDuree]);
  const anc = reponseDetail(ctx.dossier, 'peau.pied_anciennete');

  const optRecente = (rang: Opt['rang'], condition?: string) => {
    if (sarm) {
      proposer(k, { id: 'pied-g2-pristinamycine', libelle: 'Pristinamycine per os (SARM récent ou colonisation)', type: 'probabiliste', rang, condition, items: [PRISTINA], duree: d7, sources: [S(SP23, 'diapo 13', 'Pristinamycine ou linézolide', 'choix'), S(SP23, 'diapo 27', 'PO : 1g/8h', 'posologie')], commentaire: `Linézolide : autre choix de la SPILF, non intégré ici. Le RCP précise que la pristinamycine n'a pas fait l'objet d'étude clinique spécifique dans le pied diabétique. Contre-indiquée avec la colchicine. ${poso}` });
      return;
    }
    const x4 = p.poidsKg !== undefined && p.poidsKg > 100;
    proposer(k, {
      id: 'pied-g2-clindamycine',
      libelle: 'Clindamycine per os',
      type: 'probabiliste',
      rang,
      condition,
      statut: x4 ? 'brouillon' : undefined,
      items: [clinda(k, 'po')],
      duree: d7,
      sources: [S(SP23, 'diapo 13', 'Céfalexine ou clindamycine en première intention', 'choix'), S(SP23, 'diapo 27', 'PO ou IV : 600 mg/8h si poids < 100 kg', 'posologie')],
      commentaire: `Céfalexine (1 g/8 h) : autre 1re intention de la SPILF, non intégrée (RCP non lu). Non recommandés : cyclines, cotrimoxazole, fluoroquinolones.${x4 ? ' Au-delà de 100 kg, la SPILF 2023 propose 900 mg/8 h (2,7 g/j), au-dessus du maximum du RCP (2 400 mg/24 h) : non repris ; 600 mg × 4/j (HAS, maximum du RCP) affiché en brouillon, à valider.' : ''} ${poso}`,
    });
  };
  const optAmoxClav = (rang: Opt['rang'], condition: string | undefined, duree: DureeDecidee, prefixe: string) => {
    if (allergie) {
      f.ecarter('Amoxicilline-acide clavulanique', 'allergie', 'allergie à la pénicilline déclarée', []);
      f.absence(`${prefixe} chez un patient allergique à la pénicilline`, 'SPILF 2023 : allergie sans gravité, ceftriaxone + métronidazole (métronidazole non intégré à l\'application) ; allergie grave, avis infectiologique.', ['Avis infectiologique'], [S(SP23, 'diapo 13', 'ceftriaxone + métronidazole', 'choix')]);
      f.avis('Allergie à la pénicilline (pied diabétique) : avis infectiologique pour le choix de l\'antibiotique.', false, [S(SP23, 'diapo 13', undefined, 'choix')]);
      return;
    }
    const src = [S(SP23, 'diapo 13-14', 'Amoxicilline/acide clavulanique', 'choix')];
    const com = `${sarm ? 'SARM récent : avis infectiologique pour un ajout (pristinamycine, linézolide, doxycycline ou cotrimoxazole). ' : ''}${poso}`;
    const g4 = prefixe === 'Grade 4';
    proposer(k, { id: `${g4 ? 'pied-g4' : 'pied-g23'}-amoxclav-iv`, libelle: 'Amoxicilline-acide clavulanique IV', type: 'probabiliste', rang: g4 ? rang : 'conditionnelle', condition: g4 ? condition : [condition, 'si la voie IV est nécessaire'].filter(Boolean).join(' ; '), items: [AMC_IV], duree, sources: [...src, S(SP23, 'diapo 26', 'IV : 1-2 g/8h', 'posologie')], commentaire: `SPILF 2023 : 1 à 2 g/8 h IV ; la base propose 1 g/8 h. ${com}` });
    proposer(k, { id: `${g4 ? 'pied-g4' : 'pied-g23'}-amoxclav-po`, libelle: 'Amoxicilline-acide clavulanique per os', type: 'probabiliste', rang, condition, items: [AMC_PO], duree, sources: [...src, S(SP23, 'diapo 26', 'PO : 1 g/8h', 'posologie')], commentaire: com });
    if (sarm) f.avis('SARM récent (pied diabétique) : avis infectiologique.', false, [S(SP23, 'diapo 13', undefined, 'choix')]);
  };

  if (grade === '2' && anc === 'recente') return optRecente('premiere_ligne');
  if (grade === '2' && anc === 'inconnu') {
    f.manque('ancienneté de la plaie (moins de 4 semaines ou plus)', 'plaie récente : cible S. aureus et streptocoques ; chronique : aussi entérobactéries et anaérobies (SPILF 2023)', 'bloque_decision', C('pied_anciennete'));
    optRecente('conditionnelle', 'si plaie de moins de 4 semaines');
    optAmoxClav('conditionnelle', 'si plaie de 4 semaines ou plus', d7, 'Grade 2');
    return;
  }
  if (grade === '2' || grade === '3') return optAmoxClav('premiere_ligne', undefined, grade === '2' ? d7 : d10, grade === '2' ? 'Grade 2 sur plaie chronique' : 'Grade 3');

  // Grade 4.
  const g = p.gravite;
  const sepsis = g === 'sepsis' || g === 'choc_septique';
  if (!sepsis) {
    optAmoxClav(g === 'inconnu' ? 'conditionnelle' : 'premiere_ligne', g === 'inconnu' ? 'si ni sepsis ni choc' : undefined, d10, 'Grade 4');
    if (!allergie)
      proposer(k, { id: 'pied-g4-piptazo', libelle: 'Pipéracilline-tazobactam (P. aeruginosa récent)', type: 'probabiliste', rang: 'conditionnelle', condition: 'si P. aeruginosa récent, sensible', items: [PTZ], duree: d10, sources: [S(SP23, 'diapo 14', undefined, 'choix'), S(SP23, 'diapo 26', '12-16 g/j', 'posologie')], commentaire: poso });
  }
  if (sepsis) optionSepsis('premiere_ligne');
  else if (g === 'inconnu') optionSepsis('conditionnelle', 'si sepsis ou choc septique');
}

/* ------------------------------------------------------------------ */
/* Autres situations                                                   */
/* ------------------------------------------------------------------ */

function autre(k: K) {
  const { f } = k;
  const src = [S(H19, '§ 3.4, p. 20 (AE)', 'il n\'est pas recommandé de réaliser une antibiothérapie d\'épreuve', 'choix')];
  f.situation('peau-autre', 'Autre infection de la peau ou plaie', 'non_couverte', 'Plaie chronique hors pied diabétique : dermohypodermite contiguë → traiter comme une DHBNN ; abcès ou suppuration → comme un abcès ; plaie seulement suspecte → pas d\'antibiothérapie d\'épreuve, avis spécialisé (HAS 2019). Infection du site opératoire ou de cathéter : prise en charge spécifique.');
  f.avis('Infection cutanée ou de plaie hors des formes modélisées : avis spécialisé pour le choix thérapeutique.', k.grave, src);
  f.controle({ id: 'ctl-plaie-chronique', type: 'prelevement', categorie: 'conditionnel', quoi: 'Plaie chronique : pas de prélèvement systématique ; pus franc → prélever avant antibiotique ; plaie non suppurée suspecte → pas de prélèvement, avis spécialisé', quand: { ancre: 'avant_traitement', texte: 'Seulement si suppuration franche' }, pourquoi: 'Une plaie est toujours colonisée.', sources: [S(H19, '3.3.1, p. 20 (AE)', 'La réalisation systématique d\'un prélèvement bactériologique d\'une plaie chronique n\'est pas recommandée.', 'controle_micro')] });
}

function aPreciser(k: K) {
  const { ctx, f } = k;
  f.situation('peau-forme-a-preciser', 'Infection de la peau et des tissus mous : forme clinique à préciser', 'partielle', 'Le geste, les prélèvements, l\'antibiotique et la durée dépendent de la forme : DHBNN, abcès, furoncle, impétigo, morsure, pied diabétique, forme nécrosante.');
  f.manque('forme clinique (peau et tissus mous)', 'choix du geste, des prélèvements et de l\'antibiotique', 'bloque_decision', C('forme'));
  if (reponseDetail(ctx.dossier, 'peau.necrose') === 'inconnu') f.manque('signes locaux de gravité (forme nécrosante ?)', 'une DHBN / fasciite nécrosante est une urgence médico-chirurgicale (HAS 2019)', 'bloque_decision', C('necrose'));
}

/* ------------------------------------------------------------------ */

/** Données manquantes conservées quand les options reviennent à la règle de bactériémie du germe (urgence, geste, avis). */
const CIBLES_HORS_OPTIONS = [C('necrose'), C('forme'), C('dhbnn_particularite'), C('pied_grade'), C('pied_osteite'), 'clinique'];

export const R_PEAU_TISSUS_MOUS: Regle = {
  id: REGLE,
  libelle: 'Infections de la peau et des tissus mous : DHBNN, abcès, furoncle, impétigo, morsure, pied diabétique, forme nécrosante',
  description: 'HAS 2019 et fiches HAS 2021 ; SPILF 2023 et IWGDF/IDSA 2023 (pied diabétique) ; SFMU 2017 (morsures) ; conférence de consensus 2000, IDSA 2014 et WSES 2022 (formes nécrosantes) ; RCP.',
  statut: 'verifiee_ia',
  priorite: 156,
  sources: [S(H19, 'texte des recommandations', undefined, 'choix'), S(SP23, 'diaporama 2023', undefined, 'choix'), S(SFMU, 'p. 10-11', undefined, 'choix')],
  sApplique: (ctx) => formePeau(ctx) !== undefined,
  appliquer: (ctx) => {
    const forme = formePeau(ctx)!;
    const f = new Fiche(ctx, 'verifiee_ia');
    const prl = ctx.dossier.prelevements.find((x) => (x.type === 'profond' || x.type === 'superficiel') && x.organisme !== undefined);
    const bact = bacteriemiePeau(ctx);
    const g = ctx.dossier.patient.gravite;
    const k: K = {
      ctx,
      f,
      atb: lireAntibiogramme(prl),
      prl,
      atbHemoc: bact.type === 'bgn' ? lireAntibiogramme(bact.prl) : undefined,
      bact,
      bactSignif: bact.type !== 'aucune' && bact.type !== 'contaminant_possible',
      grave: g === 'sepsis' || g === 'choc_septique',
      sansOptions: bact.type === 'germe_couvert' && forme !== 'necrosante',
    };
    if (forme !== 'necrosante' && forme !== 'pied_diabetique' && forme !== 'a_preciser' && reponseDetail(ctx.dossier, 'peau.necrose') === 'inconnu')
      f.manque('signes locaux de gravité (forme nécrosante ?)', 'une DHBN / fasciite nécrosante est une urgence médico-chirurgicale (HAS 2019)', 'bloque_decision', C('necrose'));

    // Forme infectieuse par définition et « pas de signe d'infection locale » avec un prélèvement superficiel : incohérence.
    const infectieuse = ['dhbnn', 'abces', 'furoncle', 'furonculose', 'impetigo'].includes(forme) || (forme === 'pied_diabetique' && ['2', '3', '4'].includes(reponseDetail(ctx.dossier, 'peau.pied_grade'))) || (forme === 'morsure' && reponseDetail(ctx.dossier, 'peau.morsure_infectee') === 'oui');
    if (infectieuse && prelevementSuperficielSeul(ctx) && ctx.dossier.clinique.signesInfectionLocale === 'non') {
      f.alerte('attention', 'Réponse « pas de signe clinique d\'infection locale » contredite par la forme déclarée, infectieuse par définition : la forme clinique est retenue ; vérifier la saisie.', [S(H19, 'p. 18 (plaies chroniques hors pied diabétique)', 'La présence de bactéries sur une plaie (chronique ou non) est constante.', 'definition')]);
      f.manque('signes cliniques d\'infection locale : réponse « non » contredite par la forme déclarée', 'distinguer colonisation et infection : la forme déclarée est infectieuse par définition', 'bloque_decision', 'clinique');
    }

    // BGN dans les hémocultures d'une forme dont le schéma ne vise que les cocci à Gram positif.
    const cgpSeuls = ['dhbnn', 'abces', 'furoncle', 'furonculose', 'impetigo'].includes(forme) || (forme === 'pied_diabetique' && reponseDetail(ctx.dossier, 'peau.pied_grade') === '2' && reponseDetail(ctx.dossier, 'peau.pied_anciennete') === 'recente');
    if (bact.type === 'bgn' && cgpSeuls) {
      k.plafondConditionnel = 'le schéma de la forme cutanée vise les cocci à Gram positif et ne couvre pas le BGN des hémocultures : décision avec le SMIT';
      f.absence('Bactériémie à BGN au cours d\'une forme cutanée à cocci à Gram positif', 'Les recommandations lues pour cette forme (HAS 2019/2021, SPILF 2023) visent les streptocoques et S. aureus ; elles ne traitent pas une bactériémie à BGN associée.', ['Rechercher une autre source (urinaire, digestive, cathéter)', 'Avis du SMIT pour un schéma actif sur le BGN'], [S(H19, '§ 1.8.1, p. 13', 'pas d\'intérêt à l\'élargissement du spectre', 'choix')]);
    }

    switch (forme) {
      case 'necrosante':
        necrosante(k);
        break;
      case 'dhbnn':
        dhbnn(k);
        break;
      case 'abces':
        abces(k);
        break;
      case 'furoncle':
        furoncle(k);
        break;
      case 'furonculose':
        furonculose(k);
        break;
      case 'impetigo':
        impetigo(k);
        break;
      case 'morsure':
        morsure(k);
        break;
      case 'pied_diabetique':
        piedDiabetique(k);
        break;
      case 'autre':
        autre(k);
        break;
      default:
        aPreciser(k);
    }

    const srcBact = [S('SPILF-GPIP-2021-durees', 'diapo 21', undefined, 'duree')];
    if (bact.type === 'germe_couvert' && forme !== 'necrosante') {
      // Options et durée : règle de bactériémie du germe ; la fiche cutanée garde gestes, contrôles, alertes et avis.
      f.c.options = [];
      f.c.absences = [];
      f.c.ecartees = [];
      f.c.situation = undefined;
      f.c.indication = undefined;
      f.c.donneesManquantes = f.c.donneesManquantes.filter((m) => m.cible !== undefined && CIBLES_HORS_OPTIONS.includes(m.cible));
      const poly = forme === 'pied_diabetique' || forme === 'morsure' || forme === 'autre';
      f.alerte('attention', `Bactériémie à ${bact.libelle} : le choix de l'antibiotique et sa durée suivent la règle de bactériémie du germe ; cette fiche ajoute les gestes, prélèvements et avis propres à l'infection cutanée.${poly ? ' L\'infection cutanée peut être polymicrobienne (pied diabétique, morsure, plaie) : la couverture des autres germes est à discuter avec le SMIT.' : ''}`, srcBact);
    } else if (bact.type === 'germe_couvert') {
      const sga = bact.prl?.organisme === 'streptococcus_pyogenes';
      f.alerte(
        'attention',
        sga
          ? 'Streptocoque A dans les hémocultures d\'une forme nécrosante : IDSA 2014, pénicilline + clindamycine (pénicilline G non intégrée). La règle de bactériémie à streptocoque propose l\'amoxicilline seule, sans clindamycine anti-toxinique : les schémas de la forme nécrosante sont conservés ; décision avec le chirurgien et le SMIT.'
          : `Bactériémie à ${bact.libelle} au cours d'une forme nécrosante, souvent polymicrobienne : les schémas de la forme nécrosante sont conservés à côté de ceux de la règle du germe ; décision avec le chirurgien et le SMIT.`,
        sga ? [S(IDSA, 'VIII (strong, low)', 'Penicillin plus clindamycin', 'choix')] : [S(H19, '§ 2.1, p. 17', 'principalement dues au SGA', 'definition')],
      );
    } else if (bact.type === 'bgn') {
      f.alerte('attention', `Bactériémie à ${bact.libelle} : le schéma probabiliste est celui de la forme cutanée ; les molécules rendues R sur l'antibiogramme de l'hémoculture sont écartées ; l'adaptation à l'antibiogramme (traitement documenté) n'est pas modélisée ici : avis du SMIT.`, srcBact);
    } else if (bact.type === 'contaminant_possible') {
      f.alerte('info', `Staphylocoque à coagulase négative dans une seule série (contaminant possible) : il ne modifie pas le traitement de l'infection cutanée.`);
    } else if (bact.type === 'scn_probable') {
      f.alerte('attention', `Bactériémie à ${bact.libelle} probable : le traitement de la forme cutanée est conservé ; la molécule et la durée de la bactériémie (règle staphylocoque à coagulase négative) sont à confronter avec le SMIT.`, srcBact);
    } else if (bact.type === 'autre') {
      f.alerte('attention', `Bactériémie à ${bact.libelle}, germe sans règle de bactériémie dédiée : le traitement de la forme cutanée est conservé ; vérifier qu'il couvre ce germe (avis du SMIT).`);
    }
    return f.fin();
  },
};

export const REGLES_PEAU = [R_PEAU_TISSUS_MOUS];
