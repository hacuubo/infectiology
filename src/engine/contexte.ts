/**
 * Contexte dérivé du dossier : fonction rénale estimée, analyse des allergies,
 * prélèvement principal, organisme retenu, foyer retenu. Tout est déterministe.
 */
import type { Dossier } from './etat';
import type { Famille, FoyerId, OrganismeId, Prelevement, SourceRef, TriState } from '../clinical/types';
import { estimerFonctionRenale, type EstimationRenale } from '../calc/renal';
import { MOLECULES } from '../clinical/molecules';
import { evaluerECBU, type EvaluationECBU } from '../clinical/indication/ecbu';
import { cliniqueParDefaut } from './etat';

export interface AnalyseAllergie {
  /** Familles à éviter d'emblée (réaction sévère ou immédiate documentée). */
  famillesAEviter: Set<Famille>;
  /** Molécules nommément à éviter. */
  moleculesAEviter: Set<string>;
  /** Molécules utilisables sous réserve (réaction bénigne retardée, chaîne latérale différente...). */
  reserves: { moleculeId: string; texte: string }[];
  explications: string[];
  /** Vrai si une réaction retardée sévère (DRESS, SJS/Lyell) est déclarée : contre-indication de classe. */
  retardeeSevere: boolean;
  immediate: boolean;
  sources: SourceRef[];
}

const PENICILLINES = ['penicilline', 'penicillines', 'amoxicilline', 'amoxicilline_clavulanate', 'ampicilline', 'cloxacilline', 'oxacilline', 'piperacilline_tazobactam', 'piperacilline', 'ticarcilline', 'temocilline'];
const CEPHALOSPORINES = ['cephalosporine', 'cephalosporines', 'cefazoline', 'cefalexine', 'cefadroxil', 'cefuroxime', 'cefotaxime', 'ceftriaxone', 'ceftazidime', 'cefepime', 'cefixime', 'cefpodoxime', 'ceftaroline', 'ceftobiprole'];
const CARBAPENEMES = ['carbapeneme', 'carbapenemes', 'meropeneme', 'imipeneme', 'imipeneme_cilastatine', 'ertapeneme'];

function normaliser(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

/** Classe une molécule déclarée par l'utilisateur. */
export function familleDeclaree(molecule: string): Famille | 'betalactamine_indeterminee' | 'autre' {
  const n = normaliser(molecule);
  if (n.includes('betalactamine') || n.includes('beta_lactamine')) return 'betalactamine_indeterminee';
  if (PENICILLINES.some((p) => n.includes(p))) return 'penicilline';
  if (CEPHALOSPORINES.some((c) => n.includes(c)) || n.startsWith('cef')) return 'cephalosporine';
  if (CARBAPENEMES.some((c) => n.includes(c))) return 'carbapeneme';
  if (n.includes('aztreonam')) return 'monobactam';
  if (n.includes('vancomycine') || n.includes('teicoplanine') || n.includes('glycopeptide')) return 'glycopeptide';
  if (n.includes('gentamicine') || n.includes('amikacine') || n.includes('tobramycine') || n.includes('aminoside')) return 'aminoside';
  if (n.includes('floxacine') || n.includes('quinolone')) return 'fluoroquinolone';
  if (n.includes('sulfam') || n.includes('cotrimoxazole') || n.includes('trimethoprime')) return 'sulfamide';
  if (n.includes('daptomycine')) return 'lipopeptide';
  if (n.includes('linezolide')) return 'oxazolidinone';
  if (n.includes('rifampicine')) return 'rifamycine';
  return 'autre';
}

/**
 * Analyse des allergies déclarées. Principe de prudence :
 * - réaction retardée sévère (DRESS, SJS/Lyell, PEAG, atteinte d'organe) → éviter toute la classe
 *   des bêta-lactamines et ne pas proposer de réintroduction ;
 * - réaction immédiate à une pénicilline → éviter les pénicillines ; céphalosporines à chaîne latérale
 *   différente (ex. céfazoline, céfotaxime, ceftriaxone) et carbapénèmes possibles avec précaution, décision clinique ;
 * - réaction retardée bénigne ou intolérance non allergique → signaler, ne pas exclure d'office.
 * Les niveaux de réactivité croisée exacts dépendent des sources enregistrées dans la base (voir sources ALLERGIE).
 */
export function analyserAllergies(d: Dossier): AnalyseAllergie {
  const res: AnalyseAllergie = {
    famillesAEviter: new Set(),
    moleculesAEviter: new Set(),
    reserves: [],
    explications: [],
    retardeeSevere: false,
    immediate: false,
    sources: [
      { source: 'SPILF-2026-allergie-diapo', repere: 'diapo 2-4', justifie: 'definition' },
      { source: 'SPILF-JNI-2024-allergie', repere: 'algorithme', justifie: 'definition' },
    ],
  };
  for (const a of d.patient.allergies) {
    const fam = familleDeclaree(a.molecule);
    const n = normaliser(a.molecule);
    if (a.reaction === 'retardee_severe') {
      res.retardeeSevere = true;
      if (fam === 'penicilline' || fam === 'cephalosporine' || fam === 'carbapeneme' || fam === 'monobactam' || fam === 'betalactamine_indeterminee') {
        res.famillesAEviter.add('penicilline');
        res.famillesAEviter.add('cephalosporine');
        res.famillesAEviter.add('carbapeneme');
        res.famillesAEviter.add('monobactam');
        res.explications.push(`Réaction retardée sévère déclarée à « ${a.molecule} » : toute bêta-lactamine est évitée (contre-indication de classe, pas de réintroduction sans avis allergologique).`);
      } else if (fam !== 'autre') {
        res.famillesAEviter.add(fam);
        res.explications.push(`Réaction retardée sévère déclarée à « ${a.molecule} » : famille ${fam} évitée.`);
      } else {
        res.moleculesAEviter.add(n);
        res.explications.push(`Réaction retardée sévère déclarée à « ${a.molecule} » : molécule évitée.`);
      }
      continue;
    }
    if (a.reaction === 'immediate' || (a.reaction === 'inconnue' && (a.gravite === 'severe' || a.gravite === 'inconnue' || a.gravite === undefined))) {
      res.immediate = a.reaction === 'immediate' || res.immediate;
      const grave = a.gravite === 'severe';
      if (a.reaction === 'immediate' && grave && (fam === 'penicilline' || fam === 'cephalosporine' || fam === 'betalactamine_indeterminee')) {
        res.famillesAEviter.add('penicilline');
        res.famillesAEviter.add('cephalosporine');
        res.famillesAEviter.add('carbapeneme');
        res.moleculesAEviter.add('aztreonam');
        res.explications.push(`Réaction immédiate grave (anaphylaxie) déclarée à « ${a.molecule} » : contre-indication aux bêta-lactamines en attente d'un avis allergologique (SPILF 2026) ; l'aztréonam reste discuté (sauf allergie à la ceftazidime) mais n'est pas proposé d'office.`);
        continue;
      }
      if (fam === 'penicilline' || fam === 'betalactamine_indeterminee') {
        res.famillesAEviter.add('penicilline');
        res.explications.push(
          a.reaction === 'immediate'
            ? `Réaction immédiate déclarée à « ${a.molecule} » : pénicillines évitées ; céphalosporines à chaîne latérale différente et carbapénèmes possibles sous surveillance (réactivité croisée faible), décision clinique.`
            : `Allergie de type et gravité non précisés à « ${a.molecule} » : par prudence, pénicillines évitées jusqu'à précision ; préciser le type de réaction pour affiner.`,
        );
        if (fam === 'betalactamine_indeterminee') {
          res.famillesAEviter.add('cephalosporine');
          res.famillesAEviter.add('carbapeneme');
          res.explications.push('Bêta-lactamine non précisée : toutes les bêta-lactamines sont évitées jusqu\'à identification de la molécule en cause.');
        }
        for (const m of MOLECULES) {
          if (m.famille === 'cephalosporine' || m.famille === 'carbapeneme') {
            res.reserves.push({ moleculeId: m.id, texte: `Réaction immédiate à une pénicilline déclarée : ${m.dci} utilisable seulement après évaluation du risque (chaîne latérale, gravité), sous surveillance.` });
          }
        }
        // Chaînes latérales identiques : amoxicilline/ampicilline ↔ céfalexine/céfadroxil/céfaclor (non présentes dans la base IV) ;
        if (n.includes('amoxicilline') || n.includes('ampicilline')) {
          res.moleculesAEviter.add('cefalexine');
          res.moleculesAEviter.add('cefadroxil');
        }
      } else if (fam === 'cephalosporine') {
        res.famillesAEviter.add('cephalosporine');
        res.explications.push(`Réaction immédiate déclarée à « ${a.molecule} » : céphalosporines évitées (sauf chaîne latérale clairement différente, décision spécialisée) ; pénicillines et carbapénèmes possibles avec précaution.`);
        if (n.includes('ceftazidime')) res.moleculesAEviter.add('aztreonam');
      } else if (fam !== 'autre') {
        res.famillesAEviter.add(fam);
        res.explications.push(`Réaction immédiate déclarée à « ${a.molecule} » : famille ${fam} évitée.`);
      } else {
        res.moleculesAEviter.add(n);
        res.explications.push(`Réaction immédiate déclarée à « ${a.molecule} » : molécule évitée.`);
      }
      continue;
    }
    if (a.reaction === 'retardee_benigne') {
      res.explications.push(`Réaction retardée bénigne déclarée à « ${a.molecule} » : pas de contre-indication de classe ; la molécule en cause est évitée par défaut, les autres membres de la famille restent possibles sous surveillance.`);
      res.moleculesAEviter.add(n);
      continue;
    }
    if (a.reaction === 'intolerance_non_allergique') {
      res.explications.push(`Intolérance non allergique déclarée à « ${a.molecule} » : pas une allergie, aucune exclusion appliquée.`);
      continue;
    }
    res.explications.push(`Allergie déclarée à « ${a.molecule} » (type non précisé, non sévère) : molécule évitée par prudence ; préciser le type de réaction.`);
    res.moleculesAEviter.add(n);
  }
  return res;
}

export function moleculeEvitee(moleculeId: string, famille: Famille, analyse: AnalyseAllergie): { evitee: boolean; raison?: string } {
  if (analyse.famillesAEviter.has(famille)) return { evitee: true, raison: `famille ${famille} évitée (allergie déclarée)` };
  const n = normaliser(moleculeId);
  for (const m of analyse.moleculesAEviter) {
    if (n.includes(m) || m.includes(n)) return { evitee: true, raison: `${moleculeId} évité (allergie déclarée)` };
  }
  return { evitee: false };
}

/* ------------------------------------------------------------------ */

export interface ContexteDecision {
  dossier: Dossier;
  renal: EstimationRenale;
  allergie: AnalyseAllergie;
  /** Prélèvement principal (hémoculture en priorité, sinon le premier). */
  prelevementPrincipal?: Prelevement;
  hemocultures: Prelevement[];
  urines: Prelevement[];
  organisme?: OrganismeId;
  foyer: FoyerId;
  foyerStatut: 'suspecte' | 'confirme' | 'inconnu';
  sujetAge: boolean;
  poidsDisponible: boolean;
  materielPresent: boolean;
  materielVasculairePresent: boolean;
  protheseValvulaire: boolean;
  grossessePossible: boolean;
  antibiogrammeDisponible: boolean;
  /** Antécédent de BLSE/EPC ou antibiothérapie récente (facteurs de risque de résistance). */
  risqueBLSE: { present: boolean; raisons: string[] };
  maintenant: Date;
  /** Évaluation de l'indication devant un ECBU positif sans hémoculture positive. */
  evaluationECBU?: EvaluationECBU;
  /** Vrai si le foyer urinaire a été déduit de l'évaluation de l'ECBU (et non déclaré). */
  foyerDeduit: boolean;
}

export function construireContexte(d: Dossier, maintenant: Date = new Date()): ContexteDecision {
  const p = d.patient;
  const sexe = p.sexe;
  const renal = estimerFonctionRenale({
    ageAns: p.age,
    poidsKg: p.poidsKg,
    tailleCm: p.tailleCm,
    sexe,
    creatinine: p.renal.creatinine,
    dfg: p.renal.dfg ? { valeur: p.renal.dfg.valeur, methode: p.renal.dfg.methode } : undefined,
    stabilite: p.renal.stabilite,
    insuffisanceRenaleAigue: p.renal.insuffisanceRenaleAigue,
    dialyse: p.renal.dialyse,
  });
  const hemocultures = d.prelevements.filter((x) => x.type === 'hemoculture');
  const urines = d.prelevements.filter((x) => x.type === 'urine');
  const principal = hemocultures[0] ?? d.prelevements[0];
  let foyer: FoyerId = 'inconnu';
  let foyerStatut: 'suspecte' | 'confirme' | 'inconnu' = 'inconnu';
  if (d.entree === 'syndrome' && d.syndrome !== 'non_choisi') {
    foyer = d.syndrome;
    foyerStatut = 'suspecte';
  }
  if (principal && principal.foyer !== 'inconnu') {
    foyer = principal.foyer;
    foyerStatut = principal.foyerStatut === 'inconnu' ? 'suspecte' : principal.foyerStatut;
  }
  const risques: string[] = [];
  if (p.antecedentsMicro.some((a) => a.resistance === 'BLSE' || a.resistance === 'EPC')) risques.push('antécédent de colonisation/infection à BLSE ou EPC');
  if (p.antibiotiquesRecents.length > 0) risques.push('antibiothérapie récente ou en cours');
  if (p.contexte === 'associe_aux_soins') risques.push('contexte associé aux soins');

  const materielVasculairePresent = !['aucun', 'inconnu'].includes(p.materielVasculaire);
  const protheseValvulaire = ['prothese_mecanique', 'prothese_biologique', 'tavi'].includes(p.valve);
  const materielPresent =
    materielVasculairePresent || protheseValvulaire || p.dispositifIntracardiaque === 'oui' || p.protheseArticulaire === 'oui' || !['aucun', 'inconnu'].includes(p.materielUrinaire);

  // Pas d'écriture dans le dossier (appelé pendant le rendu) : copie si la clinique manque.
  const dd: Dossier = d.clinique ? d : { ...d, clinique: cliniqueParDefaut() };
  const ctx: ContexteDecision = {
    dossier: dd,
    renal,
    allergie: analyserAllergies(d),
    prelevementPrincipal: principal,
    hemocultures,
    urines,
    organisme: principal?.organisme,
    foyer,
    foyerStatut,
    sujetAge: p.age !== undefined && p.age >= 75,
    poidsDisponible: p.poidsKg !== undefined && p.poidsKg > 0,
    materielPresent,
    materielVasculairePresent,
    protheseValvulaire,
    grossessePossible: p.grossesse === 'oui' || (p.grossesse === 'inconnu' && p.sexe !== 'homme' && (p.age === undefined || p.age <= 50)),
    antibiogrammeDisponible: principal?.stade === 'antibiogramme' && (principal.antibiogramme?.length ?? 0) > 0,
    risqueBLSE: { present: risques.length > 0, raisons: risques },
    maintenant,
    foyerDeduit: false,
  };
  // Indication devant un ECBU positif : le foyer urinaire n'est retenu que si l'infection est établie ou probable.
  ctx.evaluationECBU = evaluerECBU(ctx);
  if (ctx.evaluationECBU?.foyerUrinaire && ctx.foyer === 'inconnu') {
    ctx.foyer = 'urinaire';
    ctx.foyerStatut = 'suspecte';
    ctx.foyerDeduit = true;
  }
  return ctx;
}

export function tri(v: TriState | undefined): 'oui' | 'non' | 'inconnu' {
  return v ?? 'inconnu';
}
