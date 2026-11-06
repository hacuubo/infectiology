/**
 * Indication d'antibiothérapie : « traiter », « urgence », « ne pas traiter »,
 * « informations insuffisantes », « attendre un résultat ». Ces conclusions ne sont
 * pas interchangeables et sont présentées comme des conclusions cliniques complètes.
 */
import { formeCystite } from './cystite';
import { formePeau, prelevementSuperficielSeul } from './peau-tissus-mous';
import type { Regle } from '../../engine/decider';
import type { IndicationPlan } from '../types';
import type { EvaluationECBU } from '../indication/ecbu';
import { Fiche, S, adulte, germePrincipal } from './outils';

export function indicationDepuis(ev: Omit<EvaluationECBU, 'foyerUrinaire' | 'forme' | 'urine'>, regleId: string): IndicationPlan {
  return {
    decision: ev.decision,
    qualification: ev.qualification,
    titre: ev.titre,
    raison: ev.raison,
    conditions: ev.conditions,
    exceptions: ev.exceptions,
    actions: ev.actions,
    surveillance: ev.surveillance,
    reconsiderer: ev.reconsiderer,
    questions: ev.questions,
    sources: ev.sources,
    statut: ev.statut,
    regleId,
    ...(ev.pointNonResolu ? { pointNonResolu: ev.pointNonResolu } : {}),
  };
}

export const R_INDICATION_ECBU: Regle = {
  id: 'R-INDICATION-ECBU',
  libelle: 'ECBU positif : infection, colonisation, contamination ou situation indéterminée',
  description: 'SPILF 2015 et argumentaire, SPILF 2026 (diapos 4-7), IUAS 2015 (R.1-R.4, R.29-R.36), AFU/CIAFU 2026, IDSA 2019, HAS (femme enceinte).',
  statut: 'verifiee_ia',
  priorite: 160,
  sources: [S('SPILF-2015-IU', 'p. 7', undefined, 'choix'), S('SPILF-2026-IUM', 'diapos 4-7', undefined, 'choix'), S('AFU-2026-ECBU-geste', 'Q1-Q3', undefined, 'choix')],
  sApplique: (ctx) => adulte(ctx) && ctx.evaluationECBU !== undefined,
  appliquer: (ctx) => {
    const ev = ctx.evaluationECBU!;
    const f = new Fiche(ctx, ev.statut);
    f.c.indication = indicationDepuis(ev, 'R-INDICATION-ECBU');
    switch (ev.decision) {
      case 'ne_pas_traiter':
        f.situation(`ecbu-${ev.qualification}`, ev.qualification === 'contamination_possible' ? 'ECBU probablement contaminé, sans symptôme' : 'Bactériurie sans infection urinaire', 'couverte', 'Conclusion détaillée en B.');
        break;
      case 'attendre_resultat':
        f.situation('ecbu-a-refaire', 'ECBU à refaire avant de conclure', 'couverte', 'Conclusion détaillée en B.');
        f.controle({ id: 'ctl-ecbu-refaire', type: 'prelevement', categorie: 'indique', quoi: 'Nouvel ECBU dans de bonnes conditions (milieu de jet après toilette, ou sondage aller-retour ; jamais sur le sac collecteur)', quand: { ancre: 'avant_traitement', texte: 'Maintenant, avant toute antibiothérapie' }, pourquoi: 'Le premier prélèvement est d\'interprétation douteuse.', sources: ev.sources });
        break;
      case 'informations_insuffisantes':
        f.situation('ecbu-indetermine', 'ECBU positif : indication non établie', 'couverte', 'Les informations à compléter sont listées en B.');
        for (const q of ev.questions) f.manque(q, 'nécessaire pour conclure sur l\'indication d\'antibiothérapie', 'bloque_decision');
        break;
      case 'urgence':
        if (!ev.foyerUrinaire) {
          f.situation('sepsis-foyer-indetermine', 'Sepsis avec bactériurie, foyer non établi', 'non_couverte', 'Le spectre doit couvrir les sources urinaires et non urinaires ; ce choix n\'est pas modélisé : avis réanimation / SMIT immédiat.');
          f.urgence('immediate').avis('Sepsis sans foyer établi : avis réanimation / SMIT immédiat pour l\'antibiothérapie probabiliste.', true, ev.sources);
        }
        break;
      case 'traiter':
        for (const q of ev.questions) f.manque(q, 'à confirmer pour l’indication et la forme clinique', ev.forme === 'a_preciser' ? 'bloque_decision' : 'affine');
        // Cystite et colonisations traitées (gravidique, avant geste) : situation et molécules dans R-CYSTITE.
        if (formeCystite(ctx)) {
          /* rien ici */
        } else if (ev.foyerUrinaire && !['bgn', 'aucun'].includes(germePrincipal(ctx).g)) {
          f.situation('iu-germe-non-modelise', 'Infection urinaire à germe non modélisé', 'partielle', 'Les schémas d’infection urinaire de l’application ne couvrent que les bacilles à Gram négatif.');
          f.avis('Infection urinaire à germe autre qu’un bacille à Gram négatif : choix thérapeutique avec le SMIT.', false, ev.sources);
        } else if (ev.forme === 'a_preciser' || !ev.foyerUrinaire) {
          f.situation('iu-forme-a-preciser', ev.qualification === 'indeterminee' ? 'Fièvre sans foyer établi avec bactériurie' : 'Infection urinaire : forme à préciser', 'partielle', ev.raison);
          if (ev.qualification === 'indeterminee') f.avis('Antibiothérapie couvrant sources urinaires et non urinaires : avis SMIT.', false, ev.sources);
        }
        break;
    }
    return f.fin();
  },
};

export const R_SEPSIS_FOYER_INCONNU: Regle = {
  id: 'R-SEPSIS-FOYER-INCONNU',
  libelle: 'Sepsis sans foyer ni germe identifié : prise en charge urgente',
  description: 'SSC 2026 ; HAS 2025 ; IUAS 2015 R.34.',
  statut: 'verifiee_ia',
  priorite: 150,
  sources: [S('SSC-2026', 'page SCCM', 'administering antimicrobial therapy immediately, ideally within 1 hr of recognition', 'autre')],
  sApplique: (ctx) =>
    adulte(ctx) &&
    (ctx.dossier.patient.gravite === 'sepsis' || ctx.dossier.patient.gravite === 'choc_septique') &&
    ctx.foyer === 'inconnu' &&
    germePrincipal(ctx).g === 'aucun' &&
    ctx.evaluationECBU === undefined,
  appliquer: (ctx) => {
    const f = new Fiche(ctx, 'verifiee_ia');
    const src = [S('SSC-2026', 'page SCCM', 'administering antimicrobial therapy immediately, ideally within 1 hr of recognition', 'autre'), S('HAS-2025-sepsis', 'fiche', undefined, 'autre')];
    f.c.indication = {
      decision: 'urgence',
      qualification: 'indeterminee',
      titre: 'Sepsis : antibiothérapie sans attendre l\'identification du foyer',
      raison: 'Infection grave avec foyer incertain : l\'antibiothérapie probabiliste ne doit pas attendre la fin du parcours. Le spectre dépend du foyer suspecté, du contexte et du risque de résistance : avis réanimation / SMIT.',
      conditions: [`gravité : ${ctx.dossier.patient.gravite === 'choc_septique' ? 'choc septique' : 'sepsis'}`, 'foyer non identifié', 'aucun germe identifié'],
      exceptions: [],
      actions: ['Hémocultures (au moins 2 paires) avant la première dose, sans la retarder', 'Antibiothérapie probabiliste dans l\'heure', 'Recherche du foyer et contrôle de la source', 'Avis réanimation / SMIT'],
      surveillance: ['Réévaluation clinique rapprochée ; réévaluation de l\'antibiothérapie à 24-72 h'],
      reconsiderer: ['Foyer identifié', 'Résultat des prélèvements'],
      questions: ['Foyer suspecté'],
      sources: src,
      statut: 'verifiee_ia',
      regleId: 'R-SEPSIS-FOYER-INCONNU',
    };
    f.situation('sepsis-foyer-inconnu', 'Sepsis sans foyer identifié', 'non_couverte', 'Le choix probabiliste sans foyer n\'est pas modélisé : avis réanimation / SMIT immédiat.');
    f.urgence('immediate').avis('Avis réanimation / SMIT immédiat pour le choix probabiliste.', true, src);
    return f.fin();
  },
};

export const R_PRELEVEMENT_SUPERFICIEL: Regle = {
  id: 'R-PRELEVEMENT-SUPERFICIEL',
  libelle: 'Prélèvement superficiel ou de plaie positif',
  description: 'HAS/SPILF/SFD 2019 (plaies chroniques) ; IWGDF/IDSA 2023 (pied diabétique).',
  statut: 'verifiee_ia',
  priorite: 155,
  sources: [S('HAS-2019-infections-cutanees', '§ 3, p. 18-20', undefined, 'choix')],
  sApplique: (ctx) => adulte(ctx) && prelevementSuperficielSeul(ctx),
  appliquer: (ctx) => {
    const f = new Fiche(ctx, 'verifiee_ia');
    const c = ctx.dossier.clinique;
    const src = [
      S('HAS-2019-infections-cutanees', 'p. 18 (plaies chroniques hors pied diabétique)', 'La présence de bactéries sur une plaie (chronique ou non) est constante.', 'definition'),
      S('HAS-2019-infections-cutanees', '3.3.1, p. 20 (AE)', 'La réalisation systématique d\'un prélèvement bactériologique d\'une plaie chronique n\'est pas recommandée.', 'controle_micro'),
      S('IWGDF-IDSA-2023-pied-diabetique', 'rec. 11 (best practice), pied diabétique', 'Do not treat clinically uninfected foot ulcers with systemic or local antibiotic therapy when the goal is to reduce the risk of new infection, or to promote ulcer healing.', 'choix'),
    ];
    const base = { exceptions: [] as string[], surveillance: [] as string[], questions: [] as string[], sources: src, statut: 'verifiee_ia' as const, regleId: 'R-PRELEVEMENT-SUPERFICIEL' };
    if (c.signesInfectionLocale === 'non') {
      f.c.indication = { ...base, decision: 'ne_pas_traiter', qualification: 'colonisation', titre: 'Pas d\'antibiothérapie indiquée dans la situation renseignée', raison: 'Une plaie est toujours colonisée : sans signe clinique d\'infection, la culture positive ne justifie pas d\'antibiotique.', conditions: ['prélèvement superficiel positif', 'pas de signe clinique d\'infection locale', 'pas de bactériémie'], actions: ['Ne pas prescrire d\'antibiotique', 'Soins locaux ; ne pas multiplier les prélèvements superficiels'], reconsiderer: ['Dermohypodermite, abcès, pus, aggravation de la plaie, signes généraux'] };
      f.situation('plaie-colonisee', 'Plaie colonisée sans infection clinique', 'couverte', f.c.indication.raison);
    } else if (c.signesInfectionLocale === 'oui') {
      if (formePeau(ctx) !== undefined) {
        // Foyer « Peau et tissus mous » : l'indication, la situation et le traitement suivent la forme clinique (R-PEAU-TISSUS-MOUS),
        // y compris les formes sans antibiotique (furoncle isolé, impétigo peu étendu, pied diabétique grade 1).
        f.alerte('info', 'Infection locale clinique : la culture du prélèvement superficiel ne décide pas seule ; la prise en charge suit la forme clinique renseignée (foyer « Peau et tissus mous »).', src);
        return f.fin();
      }
      f.c.indication = { ...base, decision: 'traiter', qualification: 'infection_probable', titre: 'Infection locale clinique', raison: 'Le diagnostic d\'infection de plaie est clinique. Le choix thérapeutique dépend de la forme clinique : choisir le foyer « Peau et tissus mous » et préciser la forme.', conditions: ['signes cliniques d\'infection locale'], actions: ['Prélèvement de pus ou tissulaire (pas d\'écouvillonnage superficiel) avant antibiothérapie', 'Préciser le foyer « Peau et tissus mous » et la forme clinique', 'Sinon : avis spécialisé'], reconsiderer: [] };
      f.situation('infection-cutanee', 'Infection cutanée ou de plaie', 'non_couverte', 'Foyer et forme clinique non précisés : choisir le foyer « Peau et tissus mous » et la forme, ou avis spécialisé.');
      f.avis('Infection cutanée ou de plaie : préciser le foyer et la forme clinique, sinon avis spécialisé pour le choix thérapeutique.', false, src);
    } else {
      f.c.indication = { ...base, decision: 'informations_insuffisantes', qualification: 'indeterminee', titre: 'Prélèvement superficiel positif : préciser les signes cliniques', raison: 'Une culture positive d\'un prélèvement superficiel ne suffit pas : l\'infection de plaie se définit cliniquement.', conditions: [], actions: [], reconsiderer: [], questions: ['Signes cliniques d\'infection locale (pus, abcès, dermohypodermite, aggravation) ?'] };
      f.situation('plaie-a-qualifier', 'Prélèvement superficiel positif à qualifier', 'couverte', f.c.indication.raison);
      f.manque('signes cliniques d\'infection locale', 'distinguer colonisation et infection de plaie', 'bloque_decision');
    }
    return f.fin();
  },
};

export const REGLES_INDICATION = [R_INDICATION_ECBU, R_SEPSIS_FOYER_INCONNU, R_PRELEVEMENT_SUPERFICIEL];
