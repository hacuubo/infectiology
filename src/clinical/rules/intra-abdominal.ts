/**
 * Infections intra-abdominales de l'adulte : péritonites et IIA nécessitant un geste (communautaires, associées aux
 * soins, complications postopératoires), appendicite, diverticulite, angiocholite, cholécystite, infection spontanée
 * du liquide d'ascite, abcès hépatique.
 * Sources : SFAR 2026 (RFE IIA), HAS 2017/2021 et WSES 2020 (diverticulite), WSES 2020 (appendicite), TG18 (infections
 * biliaires), WSES 2017/2020/2021, EASL 2018 et AFEF/SPILF 2020 (cirrhose), SPILF/GPIP 2021 (durées) ; RCP et CRAT du
 * métronidazole — docs/sources/recherche-intra-abdominal.md.
 */
import type { Regle } from '../../engine/decider';
import type { ContexteDecision } from '../../engine/contexte';
import type { IndicationPlan, SourceRef } from '../types';
import { reponseDetail } from '../syndromes/questions';
import { Fiche, S, adulte, bacteriemie, germePrincipal, type DureeDecidee, type ItemPrescription } from './outils';

const SFAR = 'SFAR-2026-IIA';
const DUREES = 'SPILF-GPIP-2021-durees';
const HAS21 = 'HAS-2021-diverticulite';
const HAS17 = 'HAS-2017-diverticulite';
const WSES_DIV = 'WSES-2020-diverticulite';
const WSES_APP = 'WSES-2020-appendicite';
const WSES17 = 'WSES-2017-IIA';
const WSES21 = 'WSES-2021-parcours-IIA';
const WSES_CHOL = 'WSES-2020-cholecystite';
const TG18 = 'TG18-antimicrobiens';
const TG18_ANGIO = 'TG18-angiocholite';
const EASL = 'EASL-2018-cirrhose';
const ANNEXE = 'Annexe 1, p. 73-74';

const MTZ_IV: ItemPrescription = { m: 'metronidazole', r: 'metronidazole-iv-500x3' };
const MTZ_PO: ItemPrescription = { m: 'metronidazole', r: 'metronidazole-po-500x3' };
const CTX_U: ItemPrescription = { m: 'cefotaxime', r: 'cefotaxime-iia' };
const CTX_R: ItemPrescription = { m: 'cefotaxime', r: 'cefotaxime-fort' };
const CRO_U: ItemPrescription = { m: 'ceftriaxone', r: 'ceftriaxone-iia' };
const CRO_R: ItemPrescription = { m: 'ceftriaxone', r: 'ceftriaxone-2g12h' };
const PTZ_U: ItemPrescription = { m: 'piperacilline_tazobactam', r: 'piptazo-4g8h' };
const PTZ_R: ItemPrescription = { m: 'piperacilline_tazobactam', r: 'piptazo-iia-rea' };
const FEP_U: ItemPrescription = { m: 'cefepime', r: 'cefepime-iia' };
const FEP_R: ItemPrescription = { m: 'cefepime', r: 'cefepime-iia-rea' };
const FEP_BIL: ItemPrescription = { m: 'cefepime', r: 'cefepime-biliaire-2g12h' };
const MEM_U: ItemPrescription = { m: 'meropeneme', r: 'meropeneme-iia' };
const MEM_R: ItemPrescription = { m: 'meropeneme', r: 'meropeneme-iia-rea' };
const MEM_RCP: ItemPrescription = { m: 'meropeneme', r: 'meropeneme-1g8h' };
const IPM: ItemPrescription = { m: 'imipeneme', r: 'imipeneme-1g8h' };
const ETP: ItemPrescription = { m: 'ertapeneme', r: 'ertapeneme-1g' };
const AMK: ItemPrescription = { m: 'amikacine', r: 'amikacine-30-du' };
const VAN: ItemPrescription = { m: 'vancomycine', r: 'vancomycine-continu' };
const LEVO_U: ItemPrescription = { m: 'levofloxacine', r: 'levo-500' };
const LEVO_R: ItemPrescription = { m: 'levofloxacine', r: 'levo-iv-500x2' };
const CIP_IV: ItemPrescription = { m: 'ciprofloxacine', r: 'cipro-iv-400x3' };
const CIP_PO: ItemPrescription = { m: 'ciprofloxacine', r: 'cipro-po-500x2' };
const ATM: ItemPrescription = { m: 'aztreonam', r: 'aztreonam-2g8h' };
const AMC_PO: ItemPrescription = { m: 'amoxicilline_clavulanate', r: 'amoxclav-po-1g8h' };
const AMC_IV: ItemPrescription = { m: 'amoxicilline_clavulanate', r: 'amoxclav-iv-1g8h' };
const GEN: ItemPrescription = { m: 'gentamicine', r: 'gentamicine-6-7' };

const QT_CIPRO_MTZ = 'Métronidazole + ciprofloxacine : torsades de pointes rapportées (RCP métronidazole IV §4.5) : surveiller le QT.';
const SANS_RCP_ALLERGIE = 'Moxifloxacine (après contrôle du QT corrigé), tigécycline et éravacycline, citées par SFAR 2026, ne sont pas dans la base (RCP non lus) : avis spécialisé si nécessaires.';
const SANS_RCP_ENTERO = 'Linézolide et téicoplanine, cités comme alternatives à la vancomycine, ne sont pas dans la base (RCP non lus).';

type Rang = 'premiere_ligne' | 'alternative' | 'conditionnelle';

/* ------------------------------------------------------------------ */
/* Outils                                                              */
/* ------------------------------------------------------------------ */

const rep = (ctx: ContexteDecision, id: string) => reponseDetail(ctx.dossier, id);
const grave = (ctx: ContexteDecision) => ctx.dossier.patient.gravite === 'sepsis' || ctx.dossier.patient.gravite === 'choc_septique';
const choc = (ctx: ContexteDecision) => ctx.dossier.patient.gravite === 'choc_septique';
/** Bêta-lactamines à éviter (allergie déclarée) : céphalosporines exclues. */
const allergieCephalo = (ctx: ContexteDecision) => ctx.allergie.famillesAEviter.has('cephalosporine');

function indicationSans(titre: string, raison: string, conditions: string[], exceptions: string[], actions: string[], reconsiderer: string[], sources: SourceRef[], questions: string[] = [], decision: IndicationPlan['decision'] = 'ne_pas_traiter'): IndicationPlan {
  return { decision, qualification: 'infection', titre, raison, conditions, exceptions, actions, surveillance: [], reconsiderer, questions, sources, statut: 'verifiee_ia', regleId: 'R-INTRA-ABDOMINAL' };
}

/** Durée qui court à partir du contrôle de la source (STOP-IT, SFAR 2026 p. 46). */
function apresSource(n: number, texte: string, sources: SourceRef[], obtenu: boolean): DureeDecidee {
  return {
    texte: obtenu ? texte : `Après contrôle de la source : ${texte} (tant que la source n'est pas contrôlée, la durée n'est pas fixée)`,
    pointDeDepart: 'contrôle de la source (geste)',
    dureePrevueJours: n,
    sources: [...sources, S('STOP-IT-2015', 'résumé', '4±1 calendar days', 'duree')],
  };
}

/* ------------------------------------------------------------------ */
/* Règle                                                               */
/* ------------------------------------------------------------------ */

export const R_INTRA_ABDOMINAL: Regle = {
  id: 'R-INTRA-ABDOMINAL',
  libelle: 'Infections intra-abdominales de l\'adulte',
  description: 'SFAR 2026 (IIA nécessitant un geste), HAS 2017/2021 et WSES 2020 (diverticulite), WSES 2020 (appendicite), TG18 (infections biliaires), EASL 2018 (PBS), SPILF/GPIP 2021 (durées) ; RCP et CRAT du métronidazole.',
  statut: 'verifiee_ia',
  priorite: 156,
  sources: [S(SFAR, 'R1.1 à R3.3', undefined, 'choix'), S(HAS21, 'fiche mémo', undefined, 'choix'), S(TG18, 'Q1-Q4, tableaux 3 et 5', undefined, 'choix'), S(EASL, 'p. 19-22', undefined, 'choix')],
  sApplique: (ctx) => adulte(ctx) && ctx.foyer === 'digestif',
  appliquer: (ctx) => {
    const f = new Fiche(ctx, 'verifiee_ia');
    switch (rep(ctx, 'digestif.type')) {
      case 'peritonite':
        iiaSfar(ctx, f, {});
        break;
      case 'appendicite':
        appendicite(ctx, f);
        break;
      case 'diverticulite':
        diverticulite(ctx, f);
        break;
      case 'angiocholite':
        angiocholite(ctx, f);
        break;
      case 'cholecystite':
        cholecystite(ctx, f);
        break;
      case 'pbs':
        pbs(ctx, f);
        break;
      case 'abces_hepatique':
        abcesHepatique(f);
        break;
      case 'autre':
        f.situation('iia-autre', 'Infection intra-abdominale non modélisée', 'non_couverte', 'Pancréatite infectée et autres infections intra-abdominales : non traitées par les sources lues pour ce domaine.');
        f.absence('Infection intra-abdominale hors des situations modélisées (pancréatite infectée…)', 'Recherche du 2026-11-06 : SFAR 2026 traite les IIA nécessitant un geste ; la pancréatite infectée n\'est pas traitée dans les textes lus.', ['Avis chirurgical et infectiologique', 'Contrôle de la source si une collection est accessible'], [S(SFAR, 'p. 9', 'nécessitant une intervention (chirurgicale, endoscopique ou radiologique)', 'definition')]);
        f.avis('Infection intra-abdominale non modélisée : avis infectiologique et chirurgical.', grave(ctx), []);
        break;
      default:
        f.situation('iia-type-a-preciser', 'Infection intra-abdominale : type à préciser', 'partielle', 'Le choix et la durée dépendent du type d\'infection (péritonite, appendicite, diverticulite, angiocholite, cholécystite, ascite infectée, abcès hépatique) et du contrôle de la source.');
        f.manque('type d\'infection intra-abdominale', 'conditionne le spectre, la durée et le geste de contrôle de la source', 'bloque_decision');
        f.geste('Contrôle de la source : geste central de la prise en charge (chirurgie, drainage percutané ou endoscopique).', [S(SFAR, 'p. 9', 'nécessitant une intervention (chirurgicale, endoscopique ou radiologique)', 'geste')]);
    }
    return f.fin();
  },
};

/* ------------------------------------------------------------------ */
/* IIA nécessitant un geste (SFAR 2026)                                */
/* ------------------------------------------------------------------ */

interface OptsIIA {
  appendicite?: boolean;
  diverticulite?: boolean;
  /** Toutes les options deviennent conditionnelles (donnée bloquante manquante). */
  condition?: string;
}

function iiaSfar(ctx: ContexteDecision, f: Fiche, o: OptsIIA) {
  const p = ctx.dossier.patient;
  const source = rep(ctx, 'digestif.source');
  const obtenu = source === 'obtenu';
  if (p.contexte === 'associe_aux_soins' && rep(ctx, 'digestif.postop') === 'complication_iia') {
    complicationPostop(ctx, f);
    return;
  }
  // Contrôle de la source : geste central.
  if (choc(ctx))
    f.geste('Instabilité hémodynamique : contrôle de la source le plus rapidement possible par voie chirurgicale, avec lavage de l\'ensemble de la cavité abdominale ; si l\'instabilité n\'est pas contrôlée en peropératoire : « Damage Control » et reprise dans les 24-48 heures.', [
      S(SFAR, 'R1.1.1 (GRADE 1), p. 18', 'lavage de l\'ensemble de la cavité abdominale', 'geste'),
      S(SFAR, 'R1.1.2 (avis d\'experts), p. 18', 'reprise chirurgicale dans les 24-48 heures', 'geste'),
    ]);
  else
    f.geste('Contrôle de la source : geste central (chirurgie, drainage percutané ou endoscopique) ; perforation d\'organe creux : voie d\'abord discutée entre chirurgien et anesthésiste.', [S(SFAR, 'p. 9', 'nécessitant une intervention (chirurgicale, endoscopique ou radiologique)', 'geste'), S(SFAR, 'R1.1.3 (avis d\'experts), p. 18', 'cœlioscopie si hémodynamique le permet', 'geste')]);
  if (p.contexte === 'associe_aux_soins' && !choc(ctx))
    f.geste('IIA postopératoire, patient stable, collection accessible : traitement mini-invasif (endoscopie interventionnelle ou drainage percutané guidé par l\'imagerie) en première intention.', [S(SFAR, 'R1.1.4 (GRADE 2), p. 18', 'traitement mini-invasif (endoscopie interventionnelle ou drainage percutané guidé par l\'imagerie)', 'geste')]);
  if (o.diverticulite)
    f.geste('Diverticulite perforée purulente (Hinchey III) sans sepsis : pas de lavage péritonéal exclusif sans résection ; résection sigmoïdienne avec anastomose primaire ± iléostomie et lavage. Hinchey IV : pas de lavage péritonéal laparoscopique.', [S(SFAR, 'R1.1.5 (GRADE 1), p. 18', 'ne pas réaliser un lavage péritonéal exclusif sans résection', 'geste'), S(HAS17, 'p. 8-9', 'ne pas pratiquer le LPL', 'geste')]);
  if (!obtenu) {
    f.urgence('elevee');
    f.avis(source === 'non' ? 'Aucun geste de contrôle de la source réalisé ni prévu : avis chirurgical urgent (les durées courtes ne s\'appliquent qu\'après contrôle de la source).' : 'Contrôle de la source à réaliser : avis chirurgical (ou radiologie, endoscopie interventionnelles).', true, [S(SFAR, 'R1.1.1 (GRADE 1), p. 18', 'le plus rapidement possible', 'geste')]);
    if (source === 'inconnu') f.manque('contrôle de la source (obtenu, prévu, aucun geste)', 'les durées courtes courent à partir du contrôle de la source', 'bloque_duree');
  }
  // Soins critiques.
  if (grave(ctx)) f.avis('Sepsis ou choc septique : admission systématique en soins critiques.', true, [S(SFAR, 'R1.3.1 (GRADE 1), p. 39', 'admission systématique en soins critiques', 'autre')]);
  else f.avis('Admission en soins critiques à discuter selon l\'âge (> 60 ans), les comorbidités et une péritonite généralisée.', false, [S(SFAR, 'R1.3.2 (GRADE 2), p. 39', 'Âge >60 ans, comorbidités, péritonite généralisée', 'autre')]);
  if (ctx.allergie.famillesAEviter.has('penicilline') && !allergieCephalo(ctx))
    f.alerte('attention', 'Allergie aux pénicillines (SFAR 2026, tableau 2) : risque intermédiaire (réaction immédiate non sévère, urticaire) — éviter les pénicillines ; céphalosporine à chaînes latérales différentes, monobactam + imidazolé ou carbapénème. Haut risque : lévofloxacine + imidazolé (avis d\'experts).', [S(SFAR, 'tableau 2, p. 35', 'éviter les pénicillines, céphalosporine à chaînes latérales différentes, OU monobactam + imidazolé, OU carbapénème', 'choix')]);
  if (p.neutropenie === 'oui' || p.immunodepression === 'oui')
    f.alerte('attention', 'Aplasie et greffe d\'organe solide : exclues du champ des recommandations SFAR 2026 ; avis spécialisé.', [S(SFAR, 'p. 9 et tableau PICO p. 15', 'les patients en aplasie ou greffés d\'organe solide', 'definition')]);
  // Surveillance et réévaluation.
  f.controle({ id: 'ctl-iia-biomarqueurs', type: 'autre', categorie: 'non_systematique', quoi: 'Procalcitonine, CRP, cultures des liquides de drainage', quand: { ancre: 'debut_traitement', texte: 'Pas de dosage ni de culture systématiques pendant les 5 premiers jours' }, pourquoi: 'Ne pas faire en systématique (SFAR 2026) ; pas de culture d\'un drain en place pour suspecter une complication.', sources: [S(SFAR, 'R2.1.1 (GRADE 2), p. 42', 'Dosage systématique de la procalcitonine et de la CRP', 'controle_micro'), S(SFAR, 'R3.2.2, p. 57-61', 'pas de CRP/PCT, pas de culture de drain en place', 'controle_micro')] });
  f.controle({ id: 'ctl-iia-tdm', type: 'imagerie', categorie: 'conditionnel', quoi: 'Scanner thoraco-abdomino-pelvien injecté (opacification si geste gastrique ou colique)', quand: { ancre: 'debut_traitement', offsetHeures: 72, texte: 'Pas de scanner systématique les 5 premiers jours si l\'évolution est favorable ; au-delà de 72 h, si suspicion de complication' }, pourquoi: 'Évolution défavorable après la 72e heure : rechercher une complication ou un contrôle imparfait de la source.', sources: [S(SFAR, 'R2.1.2 (avis d\'experts), p. 42', 'pas de TDM systématique les 5 premiers jours si évolution favorable', 'imagerie'), S(SFAR, 'R3.2.3, p. 57-61', '> 72 h → scanner TAP injecté (opacification si geste gastrique/colique)', 'imagerie')] });
  f.reeval('Jusqu\'à 72 h : fièvre, iléus ou défaillance d\'organe persistante → suspecter une complication ou un contrôle imparfait de la source (contrôle de la source en urgence si évolution défavorable).', [S(SFAR, 'R3.2.1 (GRADE 2), p. 57-61', 'fièvre, ou d\'un iléus, ou de la persistance de défaillance d\'organe', 'autre'), S(SFAR, 'R3.1.1 (GRADE 2), p. 57-61', 'en urgence', 'geste')], 72);
  f.reeval('Évolution favorable après contrôle de la source : désescalader l\'antibiothérapie après réception des résultats bactériologiques.', [S(SFAR, 'R2.4.1 (GRADE 2), p. 52', 'désescalader l\'antibiothérapie après réception des résultats bactériologiques', 'choix')]);
  if (p.contexte === 'communautaire') communautaire(ctx, f, o, obtenu);
  else if (p.contexte === 'associe_aux_soins') associeAuxSoins(ctx, f, o, obtenu);
  else f.manque('contexte communautaire ou associé aux soins', 'IIA : le schéma probabiliste en dépend (SFAR 2026)', 'bloque_decision');
  antifongique(ctx, f);
}

function dureeCommunautaire(o: OptsIIA, obtenu: boolean): DureeDecidee {
  if (o.appendicite)
    return apresSource(2, '2 jours après l\'appendicectomie (appendicite compliquée, source contrôlée)', [S(SFAR, 'R2.2.2 (GRADE 1), p. 44-47', 'antibiothérapie probabiliste postopératoire de courte durée (2 jours)', 'duree')], obtenu);
  return apresSource(4, '4 jours, y compris en cas de sepsis initial ou de contrôle de la source par drainage percutané ou endoscopique', [S(SFAR, 'R2.2.3 (GRADE 1), p. 44-47', 'limiter la durée d\'antibiothérapie à 4 jours', 'duree'), ...(o.diverticulite ? [S(WSES_DIV, 'péritonite diffuse (2B)', 'We suggest a 4-day period of postoperative antibiotic therapy in complicated ALCD if source control has been adequate', 'duree')] : [])], obtenu);
}

const COMMENT_DUREE_APP = 'Durée : 24 h pourrait être envisagée chez un patient sans comorbidité dont la source est certainement contrôlée (argumentaire SFAR 2026, p. 46) ; WSES 2020 : pas plus de 3-5 jours.';
const COMMENT_DUREE_SPILF = 'SPILF/GPIP 2021 (antérieur) : perforation digestive opérée dans les 24 heures ≤ 24 heures ; péritonite localisée 3 jours ; généralisée 4 jours (si source contrôlée). SFAR 2026, plus récente, est affichée.';

function communautaire(ctx: ContexteDecision, f: Fiche, o: OptsIIA, obtenu: boolean) {
  const p = ctx.dossier.patient;
  const libel = o.appendicite ? 'Appendicite compliquée' : o.diverticulite ? 'Diverticulite compliquée de péritonite' : 'Péritonite communautaire';
  const fdr = rep(ctx, 'digestif.fdr_blse');
  const duree = dureeCommunautaire(o, obtenu);
  const commDuree = o.appendicite ? COMMENT_DUREE_APP : COMMENT_DUREE_SPILF;
  const r = (vrai: boolean): Rang => (o.condition ? 'conditionnelle' : vrai ? 'premiere_ligne' : 'conditionnelle');
  const cond = (c?: string) => [o.condition, c].filter(Boolean).join(' ; ') || undefined;
  const srcR121 = S(SFAR, 'R1.2.1 (GRADE 2), p. 22-24', 'céphalosporine de 3ème génération (céfotaxime, ceftriaxone) au métronidazole', 'choix');
  const srcR122 = S(SFAR, 'R1.2.2 (GRADE 2), p. 22-24', 'ne pas prendre en compte les BLSE dans les IIA communautaires sans sepsis ni choc', 'choix');
  const commC3G = `BLSE et entérocoque non pris en compte sans sepsis ni choc. Amoxicilline-acide clavulanique : pas en 1re intention (résistance d'E. coli de ville 21,2 %, SFAR 2026) — divergence avec WSES 2017 et HAS 2017 (diverticulite), qui la citent. ${commDuree}`;
  if (p.gravite === 'stable' || p.gravite === 'inconnu') {
    f.situation(o.appendicite ? 'appendicite-compliquee' : 'iia-communautaire', `${libel} sans sepsis ni choc`, 'couverte', 'Céphalosporine de 3e génération + métronidazole ; durée courte à partir du contrôle de la source.');
    const c = p.gravite === 'inconnu' ? 'si ni sepsis ni choc septique' : undefined;
    const rg: Rang = c ? 'conditionnelle' : r(true);
    f.option({ id: 'iia-c3g-cefotaxime', libelle: 'Céfotaxime + métronidazole', type: 'probabiliste', rang: rg, condition: cond(c), items: [CTX_U, MTZ_IV], duree, sources: [srcR121, srcR122], commentaire: commC3G });
    f.option({ id: 'iia-c3g-ceftriaxone', libelle: 'Ceftriaxone + métronidazole', type: 'probabiliste', rang: rg, condition: cond(c), items: [CRO_U, MTZ_IV], duree, sources: [srcR121, srcR122], commentaire: commC3G });
  } else if (p.gravite === 'sepsis') {
    f.situation(o.appendicite ? 'appendicite-compliquee-sepsis' : 'iia-communautaire-sepsis', `${libel} avec sepsis`, 'couverte', 'C3G + métronidazole ; carbapénème seulement en cas d\'antécédent documenté de BLSE dans les 6 mois (avis d\'experts).');
    const srcR123 = S(SFAR, 'R1.2.3 (avis d\'experts), p. 22-24', 'uniquement en cas d\'antécédent documenté de colonisation ou d\'infection à entérobactéries productrices de BLSE dans les 6 mois', 'choix');
    if (fdr === 'inconnu') f.manque('antécédent documenté de colonisation ou d\'infection à BLSE dans les 6 mois', 'IIA communautaire avec sepsis : carbapénème seulement dans ce cas (SFAR 2026 R1.2.3)', 'bloque_decision');
    const blse = fdr === 'atcd_blse_6mois';
    const c3gRang: Rang = fdr === 'inconnu' ? 'conditionnelle' : r(!blse);
    if (!blse) {
      const cc = fdr === 'inconnu' ? 'sans antécédent documenté de BLSE dans les 6 mois' : undefined;
      const comm = `Réanimation : posologies de la colonne « réanimation, patient grave » (SFAR 2026, Annexe 1). En sepsis, maintien de la C3G hors antécédent de BLSE < 6 mois : SFAR 2026 R1.2.3, avis d'experts. ${commDuree}`;
      f.option({ id: 'iia-c3g-cefotaxime', libelle: 'Céfotaxime + métronidazole', type: 'probabiliste', rang: c3gRang, condition: cond(cc), items: [CTX_R, MTZ_IV], duree, sources: [srcR121, srcR123, S(SFAR, `${ANNEXE} (réanimation)`, '2 g/8H IV en perfusion de 30 min ou perfusion continue', 'posologie')], commentaire: comm });
      f.option({ id: 'iia-c3g-ceftriaxone', libelle: 'Ceftriaxone + métronidazole', type: 'probabiliste', rang: c3gRang, condition: cond(cc), items: [CRO_R, MTZ_IV], duree, sources: [srcR121, srcR123, S(SFAR, `${ANNEXE} (réanimation)`, '2 g/12h IV en perfusion de 30 min', 'posologie')], commentaire: comm });
    }
    if (blse || fdr === 'inconnu') carbapenemes(f, fdr === 'inconnu' ? 'conditionnelle' : r(true), cond(fdr === 'inconnu' ? 'si antécédent documenté de BLSE dans les 6 mois' : undefined), duree, [srcR123], true);
  } else {
    // Choc septique
    f.situation(o.appendicite ? 'appendicite-compliquee-choc' : 'iia-communautaire-choc', `${libel} avec choc septique`, 'couverte', 'Sans facteur de risque de BLSE : pipéracilline-tazobactam ; avec au moins un facteur : carbapénème selon la prévalence locale.');
    if (fdr === 'inconnu') f.manque('facteurs de risque de BLSE (SFAR 2026, tableau 1)', 'choc septique : pipéracilline-tazobactam ou carbapénème (SFAR 2026 R1.2.4-R1.2.5)', 'bloque_decision');
    const avecFdr = fdr === 'atcd_blse_6mois' || fdr === 'autre_fdr';
    if (!avecFdr)
      f.option({ id: 'iia-choc-piptazo', libelle: 'Pipéracilline-tazobactam', type: 'probabiliste', rang: fdr === 'inconnu' ? 'conditionnelle' : r(true), condition: cond(fdr === 'inconnu' ? 'si aucun facteur de risque de BLSE' : undefined), items: [PTZ_R], duree, sources: [S(SFAR, 'R1.2.4 (GRADE 2), p. 22-24', 'pipéracilline-tazobactam', 'choix'), S(SFAR, `${ANNEXE} (réanimation)`, '(16 g + 2000 mg)/j', 'posologie')], commentaire: commDuree });
    if (avecFdr || fdr === 'inconnu') {
      const srcR125 = S(SFAR, 'R1.2.5 (GRADE 2), p. 22-24', 'carbapénème selon la prévalence locale des infections à BLSE', 'choix');
      carbapenemes(f, fdr === 'inconnu' ? 'conditionnelle' : r(true), cond(fdr === 'inconnu' ? 'si au moins un facteur de risque de BLSE' : undefined), duree, [srcR125], true);
      f.option({ id: 'iia-choc-piptazo-amikacine', libelle: 'Pipéracilline-tazobactam + amikacine (option de l\'argumentaire)', type: 'probabiliste', rang: fdr === 'inconnu' ? 'conditionnelle' : 'alternative', condition: cond('si au moins un facteur de risque de BLSE, selon l\'écologie locale'), items: [PTZ_R, AMK], duree, statut: 'brouillon', sources: [S(SFAR, 'argumentaire p. 24', 'peut être associée avec de l\'amikacine afin d\'élargir le spectre', 'choix'), S(SFAR, `${ANNEXE} (réanimation)`, '25-30 mg/kg de poids ajusté*/j', 'posologie')], commentaire: 'Option citée dans l\'argumentaire SFAR 2026, non recommandation numérotée : à valider. Durée de l\'amikacine non précisée par SFAR 2026.' });
    }
  }
  if (allergieCephalo(ctx)) {
    const levo = grave(ctx) ? LEVO_R : LEVO_U;
    f.option({ id: 'iia-allergie-levo-mtz', libelle: 'Lévofloxacine + métronidazole (allergie interdisant céphalosporines et carbapénèmes)', type: 'probabiliste', rang: 'alternative', condition: cond('allergie interdisant céphalosporines et carbapénèmes ; réévaluation à 48 h'), items: [levo, MTZ_IV], duree, statut: 'brouillon', sources: [S(SFAR, 'R1.2.11 (avis d\'experts), p. 32-36', 'l\'association lévofloxacine et métronidazole, ou moxifloxacine* (*après contrôle du QT corrigé)', 'choix'), S(SFAR, ANNEXE, '500 mg/12-24h IV', 'posologie')], commentaire: `SFAR 2026 R1.2.11, avis d'experts. Risque allergique intermédiaire (tableau 2) : céphalosporine à chaînes latérales différentes, monobactam + imidazolé ou carbapénème restent possibles. ${SANS_RCP_ALLERGIE}` });
  }
}

/** Carbapénème : choix de la molécule non tranché par SFAR 2026 (zone grise). */
function carbapenemes(f: Fiche, rang: Rang, condition: string | undefined, duree: DureeDecidee, src: SourceRef[], rea: boolean) {
  const zone = 'Choix du carbapénème non précisé par SFAR 2026 (zone grise ; Figures 1-3 non lues) : ertapénème à spectre plus étroit mais pharmacocinétique limitante en soins critiques (argumentaire p. 24) ; P. aeruginosa non couvert par l\'ertapénème (WSES 2017). À valider.';
  f.option({ id: 'iia-carba-meropeneme', libelle: 'Carbapénème : méropénème', type: 'probabiliste', rang, condition, items: [rea ? MEM_R : MEM_U], duree, statut: 'brouillon', sources: [...src, S(SFAR, `${ANNEXE} (${rea ? 'réanimation' : 'usuelles'})`, rea ? '3 g/j en perfusion continue' : '1-2g/8h IV en perfusion de 3 à 8h', 'posologie')], commentaire: zone });
  f.option({ id: 'iia-carba-imipeneme', libelle: 'Carbapénème : imipénème-cilastatine', type: 'probabiliste', rang: rang === 'premiere_ligne' ? 'alternative' : rang, condition, items: [IPM], duree, statut: 'brouillon', sources: [...src, S(SFAR, ANNEXE, '1 g/8h IV en perfusion de 30 min', 'posologie')], commentaire: zone });
}

function associeAuxSoins(ctx: ContexteDecision, f: Fiche, o: OptsIIA, obtenu: boolean) {
  const p = ctx.dossier.patient;
  const postop = rep(ctx, 'digestif.postop');
  const bmr = rep(ctx, 'digestif.bmr');
  const dosage = rep(ctx, 'digestif.dosage_cefepime');
  const entero = rep(ctx, 'digestif.fdr_enterocoque');
  const g = grave(ctx);
  const conds: string[] = [];
  if (o.condition) conds.push(o.condition);
  if (postop === 'inconnu') {
    f.manque('premier épisode ou complication après une intervention pour IIA', 'les complications postopératoires relèvent d\'un autre schéma (SFAR 2026, champ 3)', 'bloque_decision');
    conds.push('si premier épisode (pas une complication après intervention pour IIA)');
  }
  if (bmr === 'inconnu') f.manque('nombre de critères de risque de bactérie multirésistante (SFAR 2026, tableau 1)', 'carbapénème si au moins deux critères, ou un seul en cas de sepsis ou de choc (SFAR 2026 R1.2.10)', 'bloque_decision');
  if (p.gravite === 'inconnu') conds.push('gravité à préciser (durée 4 ou 8 jours, anti-entérocoque si choc)');
  const conditionnel = conds.length > 0 || bmr === 'inconnu';
  f.situation('iia-associee-soins', `IIA associée aux soins, premier épisode${g ? (choc(ctx) ? ' — choc septique' : ' — sepsis') : ''}`, 'couverte', 'Céfépime + métronidazole (dosage plasmatique du céfépime) ; pipéracilline-tazobactam si dosage impossible ; carbapénème si critères de bactérie multirésistante.');
  const carba = bmr === 'deux_ou_plus' || (bmr === 'un' && g);
  const srcR1210 = S(SFAR, 'R1.2.10 (GRADE 1), p. 28-29', 'En cas de sepsis ou de choc septique, la présence d\'un seul critère suffit', 'choix');
  const duree: DureeDecidee = g
    ? apresSource(8, '8 jours (IIA associée aux soins en sepsis ou choc, source contrôlée)', [S(SFAR, 'R2.2.5 (GRADE 2), p. 44-47', 'limiter la durée d\'antibiothérapie à 8 jours', 'duree')], obtenu)
    : postop === 'postop_reglee'
      ? { texte: 'Non fixée par SFAR 2026 pour l\'IIA postopératoire sans sepsis (R2.2.4 exclut le postopératoire) ; SPILF/GPIP 2021 : péritonite postopératoire 8 jours si source contrôlée.', pointDeDepart: 'contrôle de la source (geste)', dureePrevueJours: 8, sources: [S(SFAR, 'R2.2.4 (avis d\'experts), p. 44-47', 'IIA associée aux soins (hors postopératoire) sans sepsis/choc, source contrôlée → 4 jours', 'duree'), S(DUREES, 'diapo 31-34', 'Péritonite postopératoire : 8 jours*', 'duree')] }
      : apresSource(4, '4 jours (IIA associée aux soins hors postopératoire, sans sepsis ni choc, source contrôlée ; avis d\'experts)', [S(SFAR, 'R2.2.4 (avis d\'experts), p. 44-47', 'IIA associée aux soins (hors postopératoire) sans sepsis/choc, source contrôlée → 4 jours', 'duree')], obtenu);
  const rangDe = (vrai: boolean): Rang => (conditionnel ? 'conditionnelle' : vrai ? 'premiere_ligne' : 'conditionnelle');
  const condDe = (c?: string) => [...conds, c].filter(Boolean).join(' ; ') || undefined;
  if (carba || bmr === 'inconnu') {
    carbapenemes(f, rangDe(true), condDe(bmr === 'inconnu' ? 'si au moins deux critères de BMR, ou un seul avec sepsis ou choc' : undefined), duree, [srcR1210], g);
  }
  if (!carba) {
    const cBmr = bmr === 'inconnu' ? 'si moins de deux critères de BMR (aucun en cas de sepsis ou de choc)' : undefined;
    const avecVanco = choc(ctx);
    const fep = g ? FEP_R : FEP_U;
    const srcFep = [S(SFAR, 'R1.2.6 (GRADE 1), p. 28-29', 'l\'association céfépime et métronidazole', 'choix'), S(SFAR, `${ANNEXE} (${g ? 'réanimation' : 'usuelles'})`, g ? '3 g à 4 g/j en perfusion continue' : '2 g/8h IV en perfusion de 4-8 h', 'posologie')];
    const fepRang: Rang = dosage === 'non' ? 'conditionnelle' : rangDe(true);
    const fepCond = condDe([cBmr, dosage === 'non' ? 'seulement si un dosage plasmatique du céfépime est accessible' : undefined].filter(Boolean).join(' ; ') || undefined);
    f.option({
      id: avecVanco ? 'iia-soins-cefepime-mtz-vanco' : 'iia-soins-cefepime-mtz',
      libelle: avecVanco ? 'Céfépime + métronidazole + vancomycine (choc septique)' : 'Céfépime + métronidazole',
      type: 'probabiliste',
      rang: fepRang,
      condition: fepCond,
      items: avecVanco ? [fep, MTZ_IV, VAN] : [fep, MTZ_IV],
      duree,
      statut: avecVanco ? 'brouillon' : undefined,
      sources: avecVanco ? [...srcFep, S(SFAR, 'R1.2.8 (avis d\'experts), p. 28-29', 'tel que linézolide, vancomycine ou teicoplanine', 'choix')] : srcFep,
      commentaire: `Céfépime guidé par le suivi des concentrations plasmatiques (neurotoxicité). ${avecVanco ? `Ajout d'un anti-entérocoque en cas de choc : SFAR 2026 R1.2.8, avis d'experts. ${SANS_RCP_ENTERO} ` : ''}${g ? '' : 'Durée de 4 jours : avis d\'experts (R2.2.4).'}`,
    });
    if (dosage !== 'oui') {
      const vanco = entero === 'oui';
      f.option({
        id: vanco ? 'iia-soins-piptazo-vanco' : 'iia-soins-piptazo',
        libelle: vanco ? 'Pipéracilline-tazobactam + vancomycine (risque d\'entérocoque résistant à l\'ampicilline)' : 'Pipéracilline-tazobactam (dosage du céfépime impossible)',
        type: 'probabiliste',
        rang: dosage === 'non' ? rangDe(true) : 'conditionnelle',
        condition: condDe([cBmr, dosage === 'inconnu' ? 'si le dosage plasmatique du céfépime est impossible' : undefined].filter(Boolean).join(' ; ') || undefined),
        items: vanco ? [g ? PTZ_R : PTZ_U, VAN] : [g ? PTZ_R : PTZ_U],
        duree,
        statut: 'brouillon',
        sources: [S(SFAR, 'R1.2.7 (avis d\'experts), p. 28-29', 'impossibilité de monitorage plasmatique du céfépime', 'choix'), ...(vanco ? [S(SFAR, 'R1.2.9 (avis d\'experts), p. 28-29', 'pip-taz + FdR d\'entérocoque ampicilline-résistant → ajouter linézolide, vancomycine ou teicoplanine', 'choix')] : []), S(SFAR, `${ANNEXE} (${g ? 'réanimation' : 'usuelles'})`, g ? '(16 g + 2000 mg)/j' : '(4g+500 mg) IV en 30min', 'posologie')],
        commentaire: `SFAR 2026 R1.2.7${vanco ? ' et R1.2.9' : ''}, avis d'experts, selon l'écologie locale. ${vanco ? SANS_RCP_ENTERO : entero === 'inconnu' ? 'Facteur de risque d\'entérocoque résistant à l\'ampicilline à préciser : ajout d\'un anti-entérocoque si présent (R1.2.9).' : ''}`,
      });
      if (entero === 'inconnu') f.manque('facteur de risque d\'entérocoque résistant à l\'ampicilline', 'ajout d\'un anti-entérocoque à la pipéracilline-tazobactam (SFAR 2026 R1.2.9)', 'affine');
    }
    if (dosage === 'inconnu') f.manque('possibilité de dosage plasmatique du céfépime', 'céfépime + métronidazole si le dosage est accessible, sinon pipéracilline-tazobactam (SFAR 2026 R1.2.6-R1.2.7)', 'affine');
    f.controle({ id: 'ctl-iia-cefepime-stp', type: 'autre', categorie: dosage === 'non' ? 'conditionnel' : 'indique', quoi: 'Dosage plasmatique du céfépime', quand: { ancre: 'debut_traitement', offsetHeures: 24, texte: 'Entre la 24e et la 36e heure' }, pourquoi: 'Céfépime guidé par le suivi des concentrations plasmatiques (neurotoxicité).', sources: [S(SFAR, 'p. 29', 'guidée par le suivi des concentrations plasmatiques', 'surveillance'), S(SFAR, `${ANNEXE} (réanimation)`, 'entre la 24è et la 36è heures', 'surveillance')] });
  }
  if (allergieCephalo(ctx)) {
    const srcR1212 = S(SFAR, 'R1.2.12 (avis d\'experts), p. 32-36', '(1) ciprofloxacine + métronidazole + linézolide ou vancomycine ou teicoplanine ; (2) aztréonam + métronidazole + linézolide ou vancomycine ou teicoplanine', 'choix');
    const comm = `SFAR 2026 R1.2.12, avis d'experts. ${SANS_RCP_ENTERO} Option (3) tigécycline ou éravacycline + ciprofloxacine : molécules hors base (RCP non lus).`;
    f.option({ id: 'iia-allergie-cipro-mtz-vanco', libelle: 'Ciprofloxacine + métronidazole + vancomycine (allergie)', type: 'probabiliste', rang: 'alternative', condition: condDe('allergie interdisant céphalosporines et carbapénèmes'), items: [CIP_IV, MTZ_IV, VAN], duree, statut: 'brouillon', sources: [srcR1212, S(SFAR, ANNEXE, '400 mg/8h IV', 'posologie')], commentaire: `${comm} ${QT_CIPRO_MTZ}` });
    f.option({ id: 'iia-allergie-aztreonam-mtz-vanco', libelle: 'Aztréonam + métronidazole + vancomycine (allergie)', type: 'probabiliste', rang: 'alternative', condition: condDe('allergie interdisant céphalosporines et carbapénèmes (aztréonam contre-indiqué si allergie à la ceftazidime)'), items: [ATM, MTZ_IV, VAN], duree, statut: 'brouillon', sources: [srcR1212], commentaire: `${comm} Posologie de l'aztréonam absente de l'Annexe 1 SFAR 2026 : posologie du RCP.` });
  }
}

/** Complication postopératoire après une première intervention pour IIA (SFAR 2026, champ 3). */
function complicationPostop(ctx: ContexteDecision, f: Fiche) {
  f.situation('iia-complication-postop', 'Complication postopératoire après une intervention pour IIA', 'partielle', 'Contrôle de la source en urgence ; probabiliste couvrant BLSE, P. aeruginosa et E. faecium selon l\'écologie (molécules non nommées par SFAR 2026) : avis spécialisé.');
  f.urgence('elevee');
  f.geste('Suspicion de complication : contrôle de la source en urgence ; approche mini-invasive si le patient est stable.', [S(SFAR, 'R3.1.1 (GRADE 2), p. 57-61', 'en urgence', 'geste'), S(SFAR, 'R3.1.2, p. 57-61', 'approche mini-invasive si stable', 'geste')]);
  f.absence(
    'Molécules du probabiliste d\'une complication postopératoire après IIA',
    'SFAR 2026 R3.3.1 (GRADE 2) demande de couvrir « entérobactéries multirésistantes, dont les BLSE, P. aeruginosa, E. faecium », selon l\'écologie locale et du patient, sans nommer de molécule (Figures non lues).',
    [
      'Avis infectiologique et réanimatoire urgent pour le choix des molécules',
      'Adapter aux prélèvements de la reprise ou aux hémocultures (R3.3.2)',
      'Suivi thérapeutique pharmacologique en soins critiques ou si risque de surdosage (R3.3.3)',
      'Gravité hémodynamique ou levures à l\'examen direct : antifongique probabiliste en privilégiant les échinocandines (R3.3.5 ; molécules hors base, RCP non lus)',
      'Durée : 8 jours si source contrôlée et amélioration ; au-delà, discussion multidisciplinaire (R3.3.4, avis d\'experts)',
    ],
    [S(SFAR, 'R3.3.1 (GRADE 2), p. 57-61', 'entérobactéries multirésistantes, dont les BLSE, P. aeruginosa, E. faecium', 'choix'), S(SFAR, 'R3.3.4 (avis d\'experts), p. 60', 'discussion multidisciplinaire', 'duree'), S(SFAR, 'R3.3.5 (avis d\'experts)', 'en privilégiant les échinocandines', 'choix'), S('DURAPOP-2018', 'résumé', 'until day 15', 'duree')],
  );
  f.avis('Complication postopératoire après IIA : avis infectiologique et chirurgical urgent (choix probabiliste non nominatif).', true, [S(SFAR, 'R3.3.1 (GRADE 2), p. 57-61', 'entérobactéries multirésistantes, dont les BLSE, P. aeruginosa, E. faecium', 'choix')]);
  f.reeval('Durée : 8 jours si source contrôlée et amélioration (avis d\'experts) ; au-delà, discussion multidisciplinaire.', [S(SFAR, 'R3.3.4 (avis d\'experts), p. 60', 'discussion multidisciplinaire', 'duree')]);
  antifongique(ctx, f);
}

/** Antifongique probabiliste (SFAR 2026 R1.2.13) : molécules hors base (RCP non lus). */
function antifongique(ctx: ContexteDecision, f: Fiche) {
  const p = ctx.dossier.patient;
  if (!(p.contexte === 'associe_aux_soins' || grave(ctx))) return;
  const src = [S(SFAR, 'R1.2.13 (GRADE 2), p. 36-39', 'défaillance hémodynamique, sexe féminin, chirurgie sus-mésocolique, antibiothérapie depuis plus de 48 heures', 'choix')];
  const levures = rep(ctx, 'digestif.levures');
  const criteres: { nom: string; v: 'oui' | 'non' | 'inconnu' }[] = [
    { nom: 'défaillance hémodynamique', v: p.gravite === 'choc_septique' ? 'oui' : p.gravite === 'inconnu' ? 'inconnu' : 'non' },
    { nom: 'sexe féminin', v: p.sexe === 'femme' ? 'oui' : p.sexe === 'homme' ? 'non' : 'inconnu' },
    { nom: 'chirurgie sus-mésocolique', v: rep(ctx, 'digestif.sus_mesocolique') as 'oui' | 'non' | 'inconnu' },
    { nom: 'antibiothérapie depuis plus de 48 heures', v: rep(ctx, 'digestif.atb_48h') as 'oui' | 'non' | 'inconnu' },
  ];
  const oui = criteres.filter((c) => c.v === 'oui').length;
  const inconnus = criteres.filter((c) => c.v === 'inconnu');
  const texteMol = 'Échinocandine à privilégier si facteur de risque de résistance aux azolés (exposition récente aux azolés, écologie hospitalière, insuffisance rénale chronique, neutropénie, tumeur solide). Antifongiques hors base (RCP non lus) : avis spécialisé pour la molécule et la dose. Culture positive à Candida : 8 jours si contrôle de source rapide et efficace, évolution favorable et absence de candidémie (R2.3.1) ; culture négative ou non disponible : β-D-glucane à J0 et J3, arrêt précoce envisageable si les deux sont négatifs (R2.3.2).';
  if (levures === 'oui' || oui >= 3) {
    f.alerte('attention', `Antifongique probabiliste indiqué (SFAR 2026 R1.2.13) : ${levures === 'oui' ? 'examen direct positif à levures' : `${oui} critères sur 4`}. ${texteMol}`, [...src, S(SFAR, 'p. 37, tableau 4', 'échinocandine à privilégier si FdR de résistance aux azolés', 'choix'), S(SFAR, 'R2.3.1 (avis d\'experts), p. 49', 'limiter … à 8 jours', 'duree'), S(SFAR, 'R2.3.2 (avis d\'experts)', 'à J0 et à J3', 'controle_micro')]);
    f.avis('Antifongique probabiliste indiqué : avis pour le choix de la molécule (non modélisée).', grave(ctx), src);
  } else if (levures === 'inconnu' || oui + inconnus.length >= 3) {
    f.manque(`critères d'antifongique probabiliste (${[levures === 'inconnu' ? 'examen direct à levures' : '', ...inconnus.map((c) => c.nom)].filter(Boolean).join(', ')})`, 'antifongique si examen direct positif à levures ou au moins 3 critères (SFAR 2026 R1.2.13)', 'affine');
  } else {
    f.alerte('info', `Pas d'antifongique probabiliste : examen direct sans levures et ${oui} critère(s) sur 4 (seuil : 3).`, src);
  }
}

/* ------------------------------------------------------------------ */
/* Appendicite                                                         */
/* ------------------------------------------------------------------ */

function appendicite(ctx: ContexteDecision, f: Fiche) {
  const forme = rep(ctx, 'digestif.appendicite.forme');
  const pec = rep(ctx, 'digestif.appendicite.prise_en_charge');
  if (pec === 'non_operee') {
    f.situation('appendicite-non-operee', 'Appendicite traitée sans chirurgie', 'partielle', 'Hors champ SFAR 2026 ; seule durée chiffrée : 7 jours (SPILF/GPIP 2021). Molécule non précisée par les textes lus.');
    f.absence(
      'Antibiothérapie de l\'appendicite non opérée (molécule)',
      'SFAR 2026 exclut les appendicites non opérées. WSES 2020 : traitement non opératoire à discuter chez des patients sélectionnés avec appendicite non compliquée « and absence of appendicolith » (1A), IV puis relais oral (1B), sans nommer de molécule. SPILF/GPIP 2021 : « traitement non chirurgical : 7 jours ».',
      ['Avis chirurgical (indication du traitement non opératoire)', 'Durée de 7 jours (SPILF/GPIP 2021, seule source chiffrée)', 'Abcès ou phlegmon appendiculaire : traitement non opératoire avec antibiotiques ± drainage percutané (WSES 6.1, 2B)', 'À partir de 40 ans, traité sans chirurgie : coloscopie et scanner à distance (WSES 6.4, 2C)'],
      [S(SFAR, 'p. 9', 'les patients ne relevant pas d\'une prise en charge interventionnelle dont les appendicites non opérées', 'definition'), S(WSES_APP, 'Rec. 2.1.1 (1A)', 'and absence of appendicolith', 'choix'), S(DUREES, 'diapo 31-34', 'traitement non chirurgical : 7 jours', 'duree')],
    );
    if (ctx.dossier.patient.grossesse === 'oui') f.alerte('attention', 'Grossesse : pas de traitement non opératoire de l\'appendicite (WSES 2020, 2C).', [S(WSES_APP, 'Rec. 2.1.2 (2C)', 'pas de NOM pendant la grossesse', 'choix')]);
    f.avis('Appendicite non opérée : avis chirurgical ; choix antibiotique avec le SMIT (aucune molécule précisée par les textes lus).', false, []);
    return;
  }
  if (pec === 'inconnu') f.manque('prise en charge de l\'appendicite (appendicectomie ou traitement non opératoire)', 'la conduite antibiotique en dépend', 'bloque_decision');
  const condPec = pec === 'inconnu' ? 'si appendicectomie' : undefined;
  const sansGravite = !grave(ctx) && !bacteriemie(ctx);
  if (forme === 'non_compliquee' && sansGravite && pec === 'inconnu') {
    f.situation('appendicite-a-preciser', 'Appendicite non compliquée : prise en charge à préciser', 'partielle', 'Opérée : pas d\'antibiothérapie au-delà de l\'antibioprophylaxie (SFAR 2026) ; non opérée : hors champ SFAR 2026 (7 jours selon SPILF/GPIP 2021, molécule non précisée).');
    return;
  }
  if (forme === 'non_compliquee' && sansGravite) {
    f.situation('appendicite-non-compliquee', 'Appendicite aiguë non compliquée opérée', 'couverte', 'Pas d\'antibiothérapie au-delà de l\'antibioprophylaxie peropératoire (dose unique).');
    const src = [S(SFAR, 'R2.2.1 (GRADE 1), p. 44-47', 'au-delà de l\'antibioprophylaxie peropératoire (dose unique)', 'duree'), S(WSES_APP, 'Rec. 7.1 (1A)', 'against postoperative antibiotics for patients with uncomplicated appendicitis', 'duree')];
    f.c.indication = indicationSans(
      'Appendicite non compliquée opérée : pas d\'antibiothérapie curative',
      'Source contrôlée par l\'appendicectomie : pas d\'antibiothérapie au-delà de l\'antibioprophylaxie peropératoire en dose unique (SFAR 2026, GRADE 1 ; WSES 2020).',
      ['Appendicite non compliquée', 'Appendicectomie réalisée ou prévue', 'Ni sepsis ni choc, pas de bactériémie'],
      ['Appendicite compliquée découverte en peropératoire (perforée, gangréneuse, abcédée) : antibiothérapie de 2 jours'],
      ['Antibioprophylaxie peropératoire en dose unique', 'Appendicectomie'],
      ['Appendicite compliquée en peropératoire', 'Sepsis ou choc'],
      src,
    );
    f.absence('Molécule de la dose unique peropératoire de l\'appendicectomie en urgence', 'SFAR/SPILF 2024 (antibioprophylaxie, V3.0) ne cite que l\'appendicectomie programmée (céfoxitine 2 g IVL) ; l\'appendicectomie pour appendicite aiguë de l\'adulte n\'y figure pas. WSES 2020 : « single preoperative dose of broad-spectrum antibiotics », sans molécule.', ['Protocole d\'antibioprophylaxie local', 'Avis de l\'anesthésiste'], [S('SFAR-SPILF-2024-antibioprophylaxie', 'p. 80', 'Céfoxitine 2 g IVL', 'choix'), S(WSES_APP, 'Rec. 7.1 (1A)', 'single preoperative dose of broad-spectrum antibiotics', 'choix')]);
    if (rep(ctx, 'digestif.source') !== 'obtenu') f.geste('Appendicectomie (contrôle de la source).', [S(SFAR, 'R2.2.1 (GRADE 1), p. 44-47', 'au-delà de l\'antibioprophylaxie peropératoire (dose unique)', 'geste')]);
    return;
  }
  if (forme === 'inconnu') f.manque('appendicite compliquée ou non (perforée, gangréneuse, abcédée)', 'non compliquée : pas d\'antibiothérapie postopératoire ; compliquée : 2 jours (SFAR 2026)', 'bloque_decision');
  if (forme === 'non_compliquee') f.alerte('attention', 'Appendicite dite non compliquée avec sepsis, choc ou bactériémie : rechercher une forme compliquée ; schéma de l\'appendicite compliquée affiché.', [S(SFAR, 'p. 8', 'limitée à l\'organe d\'origine, sans diffusion au péritoine', 'definition')]);
  const condition = [condPec, forme === 'inconnu' ? 'si appendicite compliquée' : undefined].filter(Boolean).join(' ; ') || undefined;
  iiaSfar(ctx, f, { appendicite: true, condition });
}

/* ------------------------------------------------------------------ */
/* Diverticulite                                                       */
/* ------------------------------------------------------------------ */

function diverticulite(ctx: ContexteDecision, f: Fiche) {
  const forme = rep(ctx, 'digestif.diverticulite.forme');
  const p = ctx.dossier.patient;
  if (forme === 'peritonite') {
    iiaSfar(ctx, f, { diverticulite: true });
    return;
  }
  if (forme === 'inconnu') {
    f.situation('diverticulite-a-preciser', 'Diverticulite : forme à préciser', 'partielle', 'Non compliquée, abcédée, perforée avec bulles ou péritonite : la conduite en dépend.');
    f.manque('forme de la diverticulite (non compliquée, abcès, bulles, péritonite)', 'conditionne l\'indication d\'antibiotique, la voie et le geste', 'bloque_decision');
    f.controle({ id: 'ctl-div-scanner', type: 'imagerie', categorie: 'indique', quoi: 'Scanner abdominal', quand: { ancre: 'avant_traitement', texte: 'En première intention' }, pourquoi: 'Diagnostic et forme de la diverticulite.', sources: [S(HAS21, 'diagnostic', 'scanner abdominal en première intention', 'imagerie')] });
    return;
  }
  if (forme === 'non_compliquee') {
    diverticuliteSimple(ctx, f);
    return;
  }
  // Abcès ou bulles : traitement médical.
  f.situation('diverticulite-compliquee', forme === 'abces' ? 'Diverticulite compliquée d\'abcès' : 'Diverticulite perforée avec bulles péricoliques, sans péritonite', 'partielle', 'Antibiothérapie IV (schémas HAS 2017, avis d\'experts, posologies non précisées) ; durée non recommandée par la HAS.');
  if (forme === 'abces')
    f.geste('Abcès : drainage radiologique lorsqu\'il est techniquement faisable (HAS 2017, sans seuil de taille) ; WSES 2020 : abcès < 4-5 cm traité par antibiotiques seuls, gros abcès par drainage percutané + antibiotiques (2C).', [S(HAS17, 'p. 8-9', 'lorsque cela est techniquement faisable', 'geste'), S(WSES_DIV, 'abcès (2C)', 'Abcès < 4-5 cm : antibiotiques seuls (2C) ; gros abcès : drainage percutané + antibiotiques (2C)', 'geste')]);
  else f.geste('Perforation avec bulles péricoliques sans péritonite clinique : antibiothérapie seule (HAS 2017, grade C ; WSES 2020 : essai de traitement non opératoire, 2C) ; avis chirurgical.', [S(HAS17, 'p. 8-9', 'Forme perforée avec bulles péricoliques sans péritonite clinique (grade C)', 'geste'), S(WSES_DIV, 'bulles (2C)', 'essai de traitement non opératoire avec antibiotiques (2C)', 'geste')]);
  f.avis('Diverticulite compliquée : avis chirurgical.', false, []);
  const duree: DureeDecidee = { texte: 'Non recommandée : « En l\'absence d\'argument scientifique, la durée de l\'antibiothérapie ne peut pas faire l\'objet de recommandations » (HAS 2017) — à décider avec le SMIT.', pointDeDepart: 'premier jour de traitement', sources: [S(HAS17, 'p. 8-9', 'En l\'absence d\'argument scientifique, la durée de l\'antibiothérapie ne peut pas faire l\'objet de recommandations.', 'duree')] };
  f.absence('Durée de l\'antibiothérapie de la diverticulite compliquée traitée médicalement', 'HAS 2017 : pas de recommandation possible ; la fiche HAS 2021 ne traite que la forme non compliquée ; SFAR 2026 ne traite que les IIA nécessitant un geste.', ['Durée à décider avec le SMIT et le chirurgien'], [S(HAS17, 'p. 8-9', 'la durée de l\'antibiothérapie ne peut pas faire l\'objet de recommandations', 'duree')]);
  schemasIVHas2017(f, duree, undefined);
  if (p.gravite === 'sepsis' || p.gravite === 'choc_septique') f.alerte('attention', 'Sepsis ou choc : prise en charge des IIA graves (SFAR 2026) si une péritonite ou une collection nécessitant un geste est en cause.', [S(SFAR, 'R1.3.1 (GRADE 1), p. 39', 'admission systématique en soins critiques', 'autre')]);
}

/** Schéma IV HAS 2017 (diverticulite compliquée ou non compliquée avec exception) : avis d'experts, posologies non précisées. */
function schemasIVHas2017(f: Fiche, duree: DureeDecidee, condition: string | undefined) {
  const srcIV = S(HAS17, 'p. 8-9 (avis d\'experts)', 'associant amoxicilline-acide clavulanique et gentamicine, ou céfotaxime et métronidazole, ou ceftriaxone et métronidazole', 'choix');
  const comm = 'HAS 2017, avis d\'experts ; posologies non précisées par la HAS : posologies usuelles de l\'Annexe 1 SFAR 2026 (C3G, métronidazole) et du RCP (amoxicilline-acide clavulanique, gentamicine). Molécules citées par la HAS sans hiérarchie.';
  const rang: Rang = condition ? 'conditionnelle' : 'premiere_ligne';
  f.option({ id: 'div-iv-cefotaxime-mtz', libelle: 'Céfotaxime + métronidazole (IV)', type: 'probabiliste', rang, condition, items: [CTX_U, MTZ_IV], duree, statut: 'brouillon', sources: [srcIV], commentaire: comm });
  f.option({ id: 'div-iv-ceftriaxone-mtz', libelle: 'Ceftriaxone + métronidazole (IV)', type: 'probabiliste', rang, condition, items: [CRO_U, MTZ_IV], duree, statut: 'brouillon', sources: [srcIV], commentaire: comm });
  f.option({ id: 'div-iv-amoxclav-genta', libelle: 'Amoxicilline-acide clavulanique + gentamicine (IV)', type: 'probabiliste', rang, condition, items: [AMC_IV, GEN], duree, statut: 'brouillon', sources: [srcIV], commentaire: `${comm} Divergence : SFAR 2026 ne retient plus l'amoxicilline-acide clavulanique en 1re intention dans les péritonites communautaires (résistance d'E. coli de ville 21,2 %) ; la gentamicine est absente de SFAR 2026.` });
  f.option({ id: 'div-iv-allergie-levo-genta-mtz', libelle: 'Lévofloxacine + gentamicine + métronidazole (allergie prouvée)', type: 'probabiliste', rang: 'alternative', condition: [condition, 'en cas d\'allergie prouvée aux bêta-lactamines'].filter(Boolean).join(' ; '), items: [{ m: 'levofloxacine', r: 'levo-500' }, GEN, MTZ_IV], duree, statut: 'brouillon', sources: [S(HAS17, 'p. 8-9 (avis d\'experts)', 'En cas d\'allergie prouvée, une association lévofloxacine, gentamicine et métronidazole.', 'choix')], commentaire: comm });
}

function diverticuliteSimple(ctx: ContexteDecision, f: Fiche) {
  const p = ctx.dossier.patient;
  const scanner = rep(ctx, 'digestif.diverticulite.scanner');
  const echec = rep(ctx, 'digestif.diverticulite.echec');
  const sGrav = grave(ctx) ? 'oui' : rep(ctx, 'digestif.diverticulite.signes_gravite');
  const exceptions: { nom: string; v: string }[] = [
    { nom: 'signes de gravité', v: sGrav },
    { nom: 'immunodépression', v: p.immunodepression },
    { nom: 'score ASA > 3', v: rep(ctx, 'digestif.diverticulite.asa') },
    { nom: 'grossesse', v: p.sexe === 'homme' ? 'non' : p.grossesse },
  ];
  const presentes = exceptions.filter((e) => e.v === 'oui').map((e) => e.nom);
  const inconnues = exceptions.filter((e) => e.v !== 'oui' && e.v !== 'non').map((e) => e.nom);
  const srcSans = S(HAS21, 'fiche mémo', 'en l\'absence de signes de gravité (notamment pression artérielle systolique ≤ 100 mmHg, fréquence respiratoire ≥ 22/min ou confusion), d\'immunodépression [1], de score ASA > 3 [2] ou de grossesse', 'choix');
  const srcIV = S(HAS21, 'fiche mémo', 'En cas de signes de gravité, de grossesse, de score ASA > 3 ou d\'immunodépression', 'choix');
  f.controle({ id: 'ctl-div-scanner', type: 'imagerie', categorie: scanner === 'oui' ? 'non_systematique' : 'indique', quoi: 'Scanner abdominal', quand: { ancre: 'avant_traitement', texte: scanner === 'oui' ? 'Déjà réalisé' : 'En première intention' }, pourquoi: 'Le traitement sans antibiotique concerne les diverticulites non compliquées confirmées par le scanner.', sources: [S(HAS21, 'diagnostic', 'scanner abdominal en première intention', 'imagerie'), S(HAS17, 'p. 8-9 (grade A)', 'confirmées par le scanner', 'imagerie')] });
  if (presentes.length > 0) {
    f.situation('diverticulite-non-compliquee-iv', 'Diverticulite non compliquée avec critère d\'antibiothérapie IV', 'partielle', `Critère(s) : ${presentes.join(', ')}. Antibiothérapie IV identique à celle de la diverticulite compliquée (HAS 2017 ; molécules : avis d'experts).`);
    f.alerte('attention', `Diverticulite non compliquée avec ${presentes.join(', ')} : antibiothérapie par voie IV (HAS).`, [srcIV]);
    const duree: DureeDecidee = { texte: '7 jours au plus (HAS 2017, avis d\'experts, forme non compliquée de l\'immunocompétent) ; durée non précisée chez l\'immunodéprimé', pointDeDepart: 'premier jour de traitement', dureePrevueJours: 7, sources: [S(HAS17, 'p. 8-9 (avis d\'experts)', 'pas sept jours', 'duree')] };
    schemasIVHas2017(f, duree, undefined);
    return;
  }
  const exceptionsTexte = ['Signes de gravité (PAS ≤ 100 mmHg, FR ≥ 22/min, confusion), immunodépression (dont corticothérapie, cancer évolutif, insuffisance rénale terminale), score ASA > 3, grossesse : antibiothérapie IV (HAS)', 'WSES 2020 cite aussi le sujet âgé et les comorbidités parmi les patients à haut risque (divergence de périmètre avec la HAS)'];
  if (inconnues.length > 0) {
    f.situation('diverticulite-non-compliquee-a-preciser', 'Diverticulite non compliquée : critères d\'antibiothérapie à préciser', 'partielle', `À préciser : ${inconnues.join(', ')}.`);
    for (const n of inconnues) f.manque(n, 'diverticulite non compliquée : sans antibiotique en l\'absence de ce critère (HAS 2021)', 'bloque_decision');
    f.c.indication = indicationSans('Diverticulite non compliquée : critères à préciser', 'Sans signe de gravité, immunodépression, score ASA > 3 ni grossesse, la diverticulite non compliquée confirmée au scanner se traite sans antibiotique (HAS 2021).', ['Diverticulite non compliquée'], exceptionsTexte, ['Préciser les critères manquants'], [], [srcSans], inconnues, 'informations_insuffisantes');
    return;
  }
  if (echec === 'oui') {
    f.situation('diverticulite-non-compliquee-echec', 'Diverticulite non compliquée sans réponse au traitement symptomatique', 'couverte', 'Amoxicilline-acide clavulanique per os 7 jours ; en cas d\'allergie, fluoroquinolone + métronidazole.');
    const d7 = (ex: string): DureeDecidee => ({ texte: '7 jours', pointDeDepart: 'premier jour de traitement', dureePrevueJours: 7, sources: [S(HAS21, 'fiche mémo', ex, 'duree'), S(DUREES, 'diapo 31-34', 'Diverticulite simple sans réponse au traitement symptomatique : 7 jours', 'duree')] });
    f.option({ id: 'div-amoxclav-po', libelle: 'Amoxicilline-acide clavulanique per os', type: 'probabiliste', rang: 'premiere_ligne', items: [AMC_PO], duree: d7('amoxicilline-acide clavulanique : 1 g 3 fois par jour pendant 7 jours'), sources: [S(HAS21, 'fiche mémo', 'amoxicilline-acide clavulanique : 1 g 3 fois par jour pendant 7 jours', 'choix'), S(HAS17, 'p. 8-9 (grade A)', 'amoxicilline et acide clavulanique, ou en cas d\'allergie, une fluoroquinolone (lévofloxacine ou ciprofloxacine) associé au métronidazole', 'choix')] });
    const commAll = 'La synthèse HAS de décembre 2024 ne mentionne pas le métronidazole ; la fiche détaillée HAS 2021 (mise à jour 2025), qui l\'associe, fait foi.';
    f.option({ id: 'div-allergie-cipro-mtz', libelle: 'Ciprofloxacine + métronidazole per os (allergie)', type: 'probabiliste', rang: 'alternative', condition: 'en cas d\'allergie aux bêta-lactamines', items: [CIP_PO, MTZ_PO], duree: d7('ciprofloxacine: 500 mg 2 fois par jour + métronidazole 500 mg 3 fois par jour pendant 7 jours'), sources: [S(HAS21, 'fiche mémo', 'ciprofloxacine: 500 mg 2 fois par jour + métronidazole 500 mg 3 fois par jour pendant 7 jours', 'choix')], commentaire: `${commAll} ${QT_CIPRO_MTZ}` });
    f.option({ id: 'div-allergie-levo-mtz', libelle: 'Lévofloxacine + métronidazole per os (allergie)', type: 'probabiliste', rang: 'alternative', condition: 'en cas d\'allergie aux bêta-lactamines', items: [LEVO_U, MTZ_PO], duree: d7('lévofloxacine 500 mg par jour + métronidazole 500 mg 3 fois par jour pendant 7 jours'), sources: [S(HAS21, 'fiche mémo', 'lévofloxacine 500 mg par jour + métronidazole 500 mg 3 fois par jour pendant 7 jours', 'choix')], commentaire: commAll });
    return;
  }
  // Prise en charge initiale, sans critère d'antibiothérapie.
  f.situation('diverticulite-non-compliquee', 'Diverticulite non compliquée sans critère d\'antibiothérapie', 'couverte', 'Traitement symptomatique sans antibiotique ; ambulatoire en l\'absence de comorbidité ou de contexte social défavorable.');
  const confirme = scanner === 'oui';
  f.c.indication = indicationSans(
    confirme ? 'Diverticulite non compliquée : pas d\'antibiotique' : 'Diverticulite non compliquée : confirmer au scanner avant de conclure',
    confirme
      ? 'Diverticulite non compliquée confirmée au scanner, sans signe de gravité, immunodépression, score ASA > 3 ni grossesse : traitement symptomatique sans antibiotique (HAS 2017 grade A, HAS 2021 ; WSES 2020 1A chez l\'immunocompétent sans inflammation systémique).'
      : 'Le traitement sans antibiotique s\'applique aux diverticulites non compliquées confirmées par le scanner (HAS 2017, grade A) : scanner abdominal en première intention.',
    ['Diverticulite non compliquée', confirme ? 'Confirmée au scanner' : 'Scanner non renseigné', 'Ni signe de gravité, ni immunodépression, ni score ASA > 3, ni grossesse'],
    exceptionsTexte,
    confirme ? ['Traitement symptomatique', 'Traitement ambulatoire en l\'absence de comorbidité ou de contexte social défavorable', 'Surveillance clinique'] : ['Scanner abdominal'],
    ['Absence de réponse au traitement symptomatique : amoxicilline-acide clavulanique 1 g × 3/j per os, 7 jours (allergie : ciprofloxacine ou lévofloxacine + métronidazole)', 'Apparition d\'un critère de gravité ou d\'une complication'],
    [srcSans, S(HAS21, 'fiche mémo', 'Le traitement ambulatoire est recommandé en cas de diverticulite non compliquée en l\'absence de comorbidité ou de contexte social défavorable.', 'choix'), S(WSES_DIV, '1A', 'we recommend to not prescribe antibiotic therapy', 'choix')],
    confirme ? [] : ['Diverticulite confirmée au scanner ?'],
    confirme ? 'ne_pas_traiter' : 'informations_insuffisantes',
  );
}

/* ------------------------------------------------------------------ */
/* Infections biliaires (TG18 ; pas de source française)               */
/* ------------------------------------------------------------------ */

function gradeAngiocholite(ctx: ContexteDecision): 'I' | 'II' | 'III' | undefined {
  if (choc(ctx)) return 'III';
  const dys = rep(ctx, 'digestif.angiocholite.dysfonction');
  if (dys === 'oui') return 'III';
  if (dys !== 'non') return undefined;
  const g2 = rep(ctx, 'digestif.angiocholite.grade2');
  return g2 === 'oui' ? 'II' : g2 === 'non' ? 'I' : undefined;
}

const COMM_BILIAIRE = 'Aucune recommandation française sur les infections biliaires (SFAR 2026 les exclut) : schéma des Tokyo Guidelines 2018, à valider. TG18 ne donne pas de posologie dans le texte lu : posologies usuelles de l\'Annexe 1 SFAR 2026 (IIA, hors champ biliaire) ou du RCP.';
const COMM_VANCO_TG18 = 'TG18 recommande la vancomycine (entérocoque) dans les formes de grade III communautaires et les infections biliaires associées aux soins ; WSES ne la juge pas systématique en communautaire ; SFAR 2026 (péritonites) cite l\'origine hépato-biliaire comme facteur de risque d\'entérocoque résistant à l\'ampicilline : divergence, avis spécialisé.';

function angiocholite(ctx: ContexteDecision, f: Fiche) {
  const p = ctx.dossier.patient;
  const grade = gradeAngiocholite(ctx);
  const source = rep(ctx, 'digestif.source');
  const obtenu = source === 'obtenu';
  const anastomose = rep(ctx, 'digestif.biliaire.anastomose');
  const srcGrade = [S(TG18_ANGIO, 'tableau 4 (p. 27)', 'hypotension requiring dopamine ≥5 µg/kg per min, or any dose of norepinephrine', 'definition')];
  f.situation('angiocholite', `Angiocholite${grade ? ` de grade ${grade} (TG18)` : ' — grade TG18 à préciser'}`, 'partielle', 'Drainage biliaire et antibiothérapie (Tokyo Guidelines 2018) ; aucune recommandation française : options en brouillon.');
  f.urgence(grade === 'III' ? 'immediate' : 'elevee');
  f.alerte(grade === 'III' && choc(ctx) ? 'urgence' : 'attention', choc(ctx) ? 'Angiocholite avec choc septique : antibiothérapie dans l\'heure (TG18).' : 'Angiocholite : antibiothérapie dans les 6 heures suivant le diagnostic (dans l\'heure en cas de choc septique, TG18).', [S(TG18, 'p. 4', 'within an hour', 'autre'), S(TG18, 'p. 4', 'within 6 h of diagnosis', 'autre')]);
  if (!grade) f.manque('grade de gravité de l\'angiocholite (TG18 : dysfonction d\'organe, critères de grade II)', 'le spectre probabiliste dépend du grade (TG18, tableau 3)', 'bloque_decision');
  if (!obtenu) {
    f.geste('Drainage biliaire (CPRE) en première intention pour l\'angiocholite modérée ou sévère.', [S(WSES17, 'd\'après la note de recherche, §11.7 (1A)', 'drainage biliaire (CPRE) en 1re intention pour l\'angiocholite modérée/sévère', 'geste')]);
    f.avis('Angiocholite : avis gastro-entérologique ou radiologique pour le drainage biliaire.', grade !== 'I', []);
  }
  if (anastomose === 'inconnu') f.manque('anastomose bilio-digestive', 'couverture des anaérobies (métronidazole) suggérée si présente (TG18 Q2)', 'affine');
  const mtz = anastomose === 'oui' ? [MTZ_IV] : [];
  const srcMtz = S(TG18, 'Q2 (p. 7)', 'We suggest anaerobic therapy if a biliary-enteric anastomosis is present. (Recommendation 2, level C)', 'choix');
  const plusMtz = anastomose === 'oui' ? ' + métronidazole' : '';
  const commMtz = anastomose === 'oui' ? '' : ' Métronidazole seulement en cas d\'anastomose bilio-digestive (TG18 Q2) — à la différence des péritonites (SFAR 2026 : C3G + métronidazole).';
  const duree: DureeDecidee = {
    texte: `${obtenu ? '' : 'Après drainage efficace : '}3 jours après le drainage (SPILF/GPIP 2021, même si bactériémie) ou 4 à 7 jours après le contrôle de la source (TG18) — divergence non tranchée. Calcul résiduel ou obstacle persistant : poursuivre jusqu'à résolution (TG18).`,
    pointDeDepart: 'drainage biliaire (contrôle de la source)',
    dureePrevueJours: 7,
    sources: [S(DUREES, 'diapo 31-34', 'Angiocholite avec drainage efficace : 3 jours post-drainage (même si bactériémie associée)', 'duree'), S(TG18, 'Q3 (p. 10)', 'is recommended for the duration of 4 to 7 days. (Recommendation 1, level C)', 'duree')],
  };
  // Grade III ou associée aux soins : spectre large ; communautaire de grade I-II : C3G. Sinon (grade ou contexte inconnu) : les deux, conditionnels.
  const severe = grade === 'III' || p.contexte === 'associe_aux_soins';
  const leger = (grade === 'I' || grade === 'II') && p.contexte === 'communautaire';
  const indetermine = !severe && !leger;
  if (p.contexte === 'inconnu') f.manque('contexte communautaire ou associé aux soins', 'angiocholite : spectre selon le contexte et le grade (TG18, tableau 3)', 'bloque_decision');
  const srcT3 = S(TG18, 'tableau 3 (p. 6)', 'grades I-II communautaires : céphalosporines (dont céfotaxime/ceftriaxone) ± métronidazole, ertapénème', 'choix');
  const srcT3s = S(TG18, 'tableau 3 (p. 6)', 'grade III communautaire et associées aux soins : pip-taz, céfépime/ceftazidime ± métronidazole, carbapénèmes, aztréonam ± métronidazole', 'choix');
  if (leger || indetermine) {
    const rang: Rang = leger ? 'premiere_ligne' : 'conditionnelle';
    const condition = leger ? undefined : 'si angiocholite communautaire de grade I ou II';
    f.option({ id: 'angio-ceftriaxone', libelle: `Ceftriaxone${plusMtz}`, type: 'probabiliste', rang, condition, items: [CRO_U, ...mtz], duree, statut: 'brouillon', sources: [srcT3, ...(mtz.length ? [srcMtz] : [])], commentaire: `${COMM_BILIAIRE}${commMtz}` });
    f.option({ id: 'angio-cefotaxime', libelle: `Céfotaxime${plusMtz}`, type: 'probabiliste', rang, condition, items: [CTX_U, ...mtz], duree, statut: 'brouillon', sources: [srcT3, ...(mtz.length ? [srcMtz] : [])], commentaire: `${COMM_BILIAIRE}${commMtz}` });
    f.option({ id: 'angio-ertapeneme', libelle: 'Ertapénème', type: 'probabiliste', rang: leger ? 'alternative' : 'conditionnelle', condition, items: [ETP], duree, statut: 'brouillon', sources: [srcT3], commentaire: `${COMM_BILIAIRE} Épargne des carbapénèmes : à réserver selon le risque de BLSE.` });
  }
  if (severe || indetermine) {
    const rang: Rang = severe ? 'premiere_ligne' : 'conditionnelle';
    const condition = severe ? undefined : 'si angiocholite de grade III ou associée aux soins';
    const rangAlt: Rang = rang === 'premiere_ligne' ? 'alternative' : 'conditionnelle';
    f.option({ id: 'angio-piptazo', libelle: 'Pipéracilline-tazobactam', type: 'probabiliste', rang, condition, items: [PTZ_U], duree, statut: 'brouillon', sources: [srcT3s, S('RCP-piperacilline-tazobactam', '§4.2 (IIA compliquées)', '4 g/0,5 g « Toutes les 8 heures »', 'posologie')], commentaire: `${COMM_BILIAIRE} ${COMM_VANCO_TG18}` });
    f.option({ id: 'angio-cefepime', libelle: `Céfépime${plusMtz}`, type: 'probabiliste', rang: rangAlt, condition, items: [FEP_BIL, ...mtz], duree, statut: 'brouillon', sources: [srcT3s, ...(mtz.length ? [srcMtz] : [])], commentaire: `${COMM_BILIAIRE}${commMtz} ${COMM_VANCO_TG18}` });
    f.option({ id: 'angio-meropeneme', libelle: 'Carbapénème : méropénème', type: 'probabiliste', rang: rangAlt, condition, items: [MEM_RCP], duree, statut: 'brouillon', sources: [srcT3s, S('RCP-meropeneme', '§4.2 (infections intra-abdominales compliquées)', '« 500 mg ou 1 g » toutes les 8 h', 'posologie')], commentaire: `${COMM_BILIAIRE} ${COMM_VANCO_TG18}` });
    f.avis('Angiocholite de grade III ou associée aux soins : couverture de l\'entérocoque (vancomycine selon TG18) à discuter avec le SMIT (sources divergentes).', grade === 'III', [S(TG18, 'tableau 3, note a', 'Vancomycin is recommended to cover Enterococcus spp. for grade III community-acquired acute cholangitis and cholecystitis, and healthcare-associated acute biliary infections.', 'choix'), S(WSES17, 'biliaire', 'not routinely suggested for community-acquired biliary infections', 'choix')]);
  }
  if (allergieCephalo(ctx) || ctx.allergie.famillesAEviter.has('penicilline'))
    f.option({ id: 'angio-aztreonam', libelle: `Aztréonam${plusMtz} (allergie)`, type: 'probabiliste', rang: 'alternative', condition: 'en cas d\'allergie aux bêta-lactamines (aztréonam contre-indiqué si allergie à la ceftazidime)', items: [ATM, ...mtz], duree, statut: 'brouillon', sources: [srcT3s], commentaire: `${COMM_BILIAIRE} TG18 cite aussi les fluoroquinolones (± métronidazole) en cas d'allergie ou de sensibilité connue, sans préciser la molécule dans le texte lu.` });
  const { g } = germePrincipal(ctx);
  if (bacteriemie(ctx) && (g === 'strepto' || g === 'entero' || g === 'cgp_chainettes'))
    bacteriemieCgpBiliaire(f);
  f.alerte('info', `Gravité TG18 : ${grade ? `grade ${grade}` : 'à préciser'}. Grade III : dysfonction d'au moins un organe ; grade II : au moins deux critères (leucocytes, fièvre ≥ 39 °C, âge ≥ 75 ans, bilirubine ≥ 5 mg/dL, hypoalbuminémie).`, srcGrade);
}

function bacteriemieCgpBiliaire(f: Fiche) {
  f.alerte('attention', 'Bactériémie à entérocoque ou streptocoque d\'origine biliaire : TG18 recommande au moins 2 semaines, SPILF/GPIP 2021 3 jours après drainage « même si bactériémie » (sans distinguer les cocci à Gram positif) — divergence non tranchée.', [S(TG18, 'tableau 5 (p. 10)', 'minimum 2 weeks', 'duree'), S(DUREES, 'diapo 31-34', 'Angiocholite avec drainage efficace : 3 jours post-drainage (même si bactériémie associée)', 'duree')]);
  f.avis('Bactériémie à cocci à Gram positif d\'origine biliaire : durée à décider avec le SMIT (sources divergentes).', false, [S(TG18, 'tableau 5 (p. 10)', 'minimum 2 weeks', 'duree')]);
}

function cholecystite(ctx: ContexteDecision, f: Fiche) {
  const pec = rep(ctx, 'digestif.cholecystite.prise_en_charge');
  const comp = rep(ctx, 'digestif.cholecystite.compliquee');
  f.situation('cholecystite', 'Cholécystite aiguë', 'partielle', 'La grille de gravité TG18 de la cholécystite n\'a pas été lue : le choix probabiliste, qui dépend du grade, n\'est pas modélisé. Geste et durées affichés.');
  f.geste('Cholécystectomie précoce ; cholécystostomie (drainage percutané) si le patient n\'est pas opérable, notamment sans amélioration après 3 à 5 jours d\'antibiotiques.', [S(WSES17, 'd\'après la note de recherche, §11.7', 'cholécystectomie précoce (1A) ; cholécystostomie si inopérable (1B)', 'geste'), S(WSES21, 'cholécystite', 'cholécystostomie si patient inopérable sans amélioration après 3-5 jours d\'antibiotiques', 'geste')]);
  f.absence(
    'Choix probabiliste de la cholécystite aiguë selon le grade TG18',
    'Le barème de gravité TG18 de la cholécystite (Yokoe 2018) n\'a pas pu être lu (accès refusé) ; le tableau 3 des TG18 choisit les molécules selon ce grade. Aucune recommandation française dédiée.',
    [
      'Établir le grade TG18 de la cholécystite (barème non intégré à l\'application)',
      'TG18, tableau 3 : grades I-II communautaires — céphalosporine (céfotaxime, ceftriaxone) ± métronidazole, ertapénème ; grade III ou associée aux soins — pipéracilline-tazobactam, céfépime ± métronidazole, carbapénème (vancomycine selon TG18 : divergence avec WSES)',
      'Avis du SMIT pour le choix',
    ],
    [S('TG18-cholecystite', 'barème de gravité', undefined, 'definition'), S(TG18, 'tableau 3 (p. 6)', 'grades I-II communautaires : céphalosporines (dont céfotaxime/ceftriaxone) ± métronidazole, ertapénème', 'choix')],
  );
  const s = (repere: string, ex: string, id = DUREES) => S(id, repere, ex, 'duree');
  if (pec === 'cholecystectomie' && comp === 'non')
    f.reeval('Durée après cholécystectomie d\'une cholécystite non compliquée : pas d\'antibiothérapie postopératoire (WSES 2020) ; arrêt dans les 24 heures (TG18 grades I-II ; SPILF/GPIP 2021 ≤ 24 heures).', [S(WSES_CHOL, '7.1', 'we recommend against the routine use of postoperative antibiotics when the focus of infection is controlled by cholecystectomy', 'duree'), s('tableau 5 (p. 10)', 'within 24 h after cholecystectomy', TG18), s('diapo 31-34', 'cholécystectomie non compliquée « ≤ 24 heures »')]);
  else if (pec === 'cholecystectomie' && comp === 'oui')
    f.reeval('Durée après cholécystectomie d\'une cholécystite compliquée (perforation, gangrène, emphysème) : 4 à 7 jours (TG18), 3 jours pour une vésicule perforée (SPILF/GPIP 2021), 4 jours (WSES 2021) — divergence non tranchée.', [s('tableau 5 (p. 10)', 'perforation, emphysème, nécrose vésiculaire : 4-7 jours', TG18), s('diapo 31-34', 'vésicule perforée 3 jours'), s('cholécystite compliquée', 'and antibiotic therapy for 4 days', WSES21)]);
  else if (pec === 'drainage') f.reeval('Durée après drainage percutané : 7 jours (SPILF/GPIP 2021, seule source).', [s('diapo 31-34', 'drainage percutané 7 jours')]);
  else if (pec === 'ni_l_un_ni_l_autre') f.reeval('Cholécystite ni opérée ni drainée : 7 jours (SPILF/GPIP 2021, seule source).', [s('diapo 31-34', 'non opérée ou non drainée 7 jours')]);
  else f.manque('prise en charge de la cholécystite (cholécystectomie, drainage, ni l\'un ni l\'autre) et forme compliquée ou non', 'la durée en dépend (TG18, SPILF/GPIP 2021, WSES)', 'bloque_duree');
  f.avis('Cholécystite : avis chirurgical ; choix antibiotique avec le SMIT (grade TG18 non modélisé).', grave(ctx), []);
  const { g } = germePrincipal(ctx);
  if (bacteriemie(ctx) && (g === 'strepto' || g === 'entero' || g === 'cgp_chainettes')) bacteriemieCgpBiliaire(f);
}

/* ------------------------------------------------------------------ */
/* Infection spontanée du liquide d'ascite (EASL 2018)                 */
/* ------------------------------------------------------------------ */

function pbs(ctx: ContexteDecision, f: Fiche) {
  const p = ctx.dossier.patient;
  const pnn = rep(ctx, 'digestif.pbs.pnn');
  const res = rep(ctx, 'digestif.pbs.resistance');
  f.controle({ id: 'ctl-pbs-ponction', type: 'prelevement', categorie: pnn === 'oui' ? 'non_systematique' : 'indique', quoi: 'Ponction d\'ascite : polynucléaires neutrophiles, culture du liquide ; hémocultures', quand: { ancre: 'avant_traitement', texte: 'Avant l\'antibiothérapie' }, pourquoi: 'Diagnostic : PNN > 250/mm³ dans le liquide d\'ascite.', sources: [S(EASL, 'p. 19', 'neutrophil count in ascitic fluid of >250/mm3 (II-2;1)', 'controle_micro')] });
  if (pnn === 'non') {
    f.situation('ascite-pnn-normal', 'Ascite sans critère d\'infection spontanée', 'partielle', 'PNN ≤ 250/mm³ : le critère diagnostique de l\'infection spontanée du liquide d\'ascite (EASL 2018) n\'est pas rempli.');
    f.avis('Ascite sans critère de PBS et suspicion d\'infection : rechercher un autre foyer ; avis spécialisé.', false, [S(EASL, 'p. 19', 'neutrophil count in ascitic fluid of >250/mm3 (II-2;1)', 'definition')]);
    return;
  }
  f.situation('pbs', 'Infection spontanée du liquide d\'ascite (cirrhose)', 'partielle', 'C3G en 1re intention (communautaire, faible résistance) ; albumine ; ponction de contrôle à 48 h. Posologies non précisées par l\'EASL : options en brouillon.');
  f.urgence('elevee');
  if (pnn === 'inconnu') f.manque('PNN du liquide d\'ascite (> 250/mm³ ?)', 'diagnostic d\'infection spontanée du liquide d\'ascite (EASL 2018)', 'bloque_decision');
  const poids = p.poidsKg;
  f.geste(`Albumine : 1,5 g/kg au diagnostic puis 1 g/kg à J3${poids ? ` (soit ${Math.round(1.5 * poids)} g puis ${Math.round(poids)} g pour ${poids} kg)` : ''}.`, [S(EASL, 'p. 22 (I;1)', '1.5 g/kg at diagnosis and 1 g/kg on day 3', 'geste')]);
  f.controle({ id: 'ctl-pbs-48h', type: 'prelevement', categorie: 'indique', quoi: 'Seconde ponction d\'ascite (PNN)', quand: { ancre: 'debut_traitement', offsetHeures: 48, texte: 'À 48 h de traitement' }, pourquoi: 'Échec si les PNN baissent de moins de 25 %.', ensuite: 'Échec : élargir le spectre et rechercher une péritonite secondaire (avis spécialisé).', sources: [S(EASL, 'p. 21 (II-2;1)', 'at 48 h', 'controle_micro')] });
  f.reeval('Après l\'épisode : prophylaxie secondaire — ciprofloxacine 500 mg/j en 1er choix, cotrimoxazole 800/160 mg/j en 2e choix ; norfloxacine 400 mg/j à la charge du patient (AFEF/SPILF 2020, avis d\'experts).', [S('AFEF-2020-norfloxacine', 'p. 1-2', 'ciprofloxacine à la posologie de 500 mg par jour', 'choix')]);
  const duree: DureeDecidee = { texte: 'Au moins 5 à 7 jours (EASL 2018) ; 5 jours si céfotaxime (SPILF/GPIP 2021)', pointDeDepart: 'premier jour de traitement', dureePrevueJours: 7, sources: [S(EASL, 'p. 21 (III;1)', 'at least 5–7 days (III;1)', 'duree'), S(DUREES, 'diapo 31', 'Infection de liquide d\'ascite : 5 jours si cefotaxime', 'duree')] };
  const commDose = 'Posologie non précisée par l\'EASL 2018 ni par la SPILF : posologie usuelle de l\'Annexe 1 SFAR 2026 (IIA, hors champ cirrhose) ou du RCP, à valider. « Prévalence élevée de résistance » non chiffrée par l\'EASL.';
  const cond = pnn === 'inconnu' ? 'si PNN > 250/mm³' : undefined;
  const conds = (c?: string) => [cond, c].filter(Boolean).join(' ; ') || undefined;
  if (res === 'inconnu') f.manque('prévalence locale de bactéries résistantes (faible ou élevée)', 'C3G si faible résistance ; pipéracilline-tazobactam ou carbapénème sinon (EASL 2018)', 'bloque_decision');
  if (p.contexte === 'inconnu') f.manque('contexte communautaire ou associé aux soins', 'infection spontanée du liquide d\'ascite : spectre selon l\'acquisition (EASL 2018)', 'bloque_decision');
  const rg = (vrai: boolean): Rang => (cond || res === 'inconnu' || p.contexte === 'inconnu' ? 'conditionnelle' : vrai ? 'premiere_ligne' : 'conditionnelle');
  const srcC3G = S(EASL, 'p. 21 (I;1)', 'Third-generation cephalosporins are recommended as first-line antibiotic treatment for community-acquired SBP in countries with low rates of bacterial resistance (I;1).', 'choix');
  const srcLarge = S(EASL, 'p. 21', 'pip-taz ou carbapénème (II-2;1)', 'choix');
  const srcSoins = S(EASL, 'p. 21 (I;1)', 'pip-taz si faible prévalence de BMR, carbapénème si BLSE fréquentes, ± glycopeptide/daptomycine/linézolide si BMR Gram+ (I;1)', 'choix');
  const commu = p.contexte === 'communautaire';
  const soins = p.contexte === 'associe_aux_soins';
  if (!soins) f.option({ id: 'pbs-cefotaxime', libelle: 'Céfotaxime (C3G)', type: 'probabiliste', rang: rg(commu && res === 'faible'), condition: conds(commu && res === 'faible' ? undefined : 'si infection communautaire et faible prévalence de résistance'), items: [CTX_U], duree, statut: 'brouillon', sources: [srcC3G, S(DUREES, 'diapo 31', 'Infection de liquide d\'ascite : 5 jours si cefotaxime', 'choix')], commentaire: commDose });
  f.option({ id: 'pbs-piptazo', libelle: 'Pipéracilline-tazobactam', type: 'probabiliste', rang: rg((commu && res === 'elevee') || (soins && res === 'faible')), condition: conds((commu && res === 'elevee') || (soins && res === 'faible') ? undefined : 'si forte prévalence de résistance (communautaire) ou acquisition associée aux soins avec faible prévalence de BMR'), items: [PTZ_U], duree, statut: 'brouillon', sources: [commu ? srcLarge : srcSoins, S('RCP-piperacilline-tazobactam', '§4.2 (IIA compliquées)', '4 g/0,5 g « Toutes les 8 heures »', 'posologie')], commentaire: `${commDose}${soins ? ' Glycopeptide, daptomycine ou linézolide si BMR à Gram positif (EASL) : avis.' : ''}` });
  f.option({ id: 'pbs-meropeneme', libelle: 'Carbapénème : méropénème', type: 'probabiliste', rang: res === 'elevee' && !cond && p.contexte !== 'inconnu' ? (soins ? 'premiere_ligne' : 'alternative') : 'conditionnelle', condition: conds(res === 'elevee' ? undefined : 'si forte prévalence de résistance (BLSE fréquentes)'), items: [MEM_RCP], duree, statut: 'brouillon', sources: [soins ? srcSoins : srcLarge, S('RCP-meropeneme', '§4.2 (infections intra-abdominales compliquées)', '« 500 mg ou 1 g » toutes les 8 h', 'posologie')], commentaire: `${commDose} Choix du carbapénème non précisé par l'EASL.` });
}

/* ------------------------------------------------------------------ */
/* Abcès hépatique                                                     */
/* ------------------------------------------------------------------ */

function abcesHepatique(f: Fiche) {
  f.situation('abces-hepatique', 'Abcès hépatique', 'non_couverte', 'Aucune recommandation dédiée trouvée : ni molécule, ni indication de drainage modélisées. Avis spécialisé.');
  f.absence(
    'Abcès hépatique pyogène : choix antibiotique et drainage',
    'Recherche du 2026-11-06 : aucune recommandation dédiée (SPILF, SNFGE, AFEF, ESCMID) ; SFAR 2026 exclut les abcès hépatiques isolés. Seuls repères : SPILF/GPIP 2021 « Abcès hépatique non amibien : 28 jours » ; TG18 (tableau 5) : jusqu\'à résolution clinique, biologique et radiologique complète.',
    ['Avis infectiologique et radiologique (drainage)', 'Durée indicative : 28 jours (SPILF/GPIP 2021) ou jusqu\'à résolution (TG18)', 'Amibiase hépatique abcédée : métronidazole 1,5 g/j en trois prises, 7 jours, avec évacuation de l\'abcès (RCP Flagyl oral) — diagnostic spécialisé'],
    [S(DUREES, 'diapo 31-34', 'Abcès hépatique non amibien : 28 jours', 'duree'), S(TG18, 'tableau 5 (p. 10)', 'jusqu\'à résolution clinique, biologique et radiologique complète', 'duree'), S(SFAR, 'p. 9', 'les abcès hépatiques isolés', 'definition'), S('RCP-metronidazole-oral', '§4.2', '1,50 g par jour en trois prises', 'posologie')],
  );
  f.avis('Abcès hépatique : avis infectiologique et radiologique (drainage).', false, []);
}

export const REGLES_INTRA_ABDOMINAL = [R_INTRA_ABDOMINAL];
