/**
 * Règles transversales : périmètre (adulte), gravité, terrain, allergies,
 * données essentielles, réévaluation, persistance des hémocultures, colonisation urinaire.
 */
import type { Regle } from '../../engine/decider';
import { Fiche, S, adulte, bacteriemie, germePrincipal } from './outils';

export const R_PEDIATRIE: Regle = {
  id: 'R-PERIMETRE-PEDIATRIE',
  libelle: 'Patient de moins de 18 ans : hors périmètre',
  description: 'Les règles adultes ne sont pas transposées à la pédiatrie.',
  statut: 'verifiee_ia',
  priorite: 1000,
  sources: [],
  sApplique: (ctx) => !adulte(ctx),
  appliquer: (ctx) =>
    new Fiche(ctx, 'verifiee_ia')
      .situation('pediatrie', 'Patient de moins de 18 ans — non couvert', 'non_couverte', 'L\'application ne couvre que l\'adulte. Les règles adultes ne doivent pas être transposées à l\'enfant : avis pédiatrique et infectiologique.')
      .alerte('urgence', 'Hors périmètre : patient pédiatrique. Aucune proposition thérapeutique n\'est générée.')
      .avis('Avis pédiatrique / infectiologie pédiatrique.', true, [])
      .fin(),
};

export const R_GRAVITE: Regle = {
  id: 'R-GRAVITE-SEPSIS',
  libelle: 'Gravité : délai d\'antibiothérapie, hémocultures, contrôle de la source',
  description: 'Sepsis-3 ; Surviving Sepsis Campaign 2026 ; HAS/SRLF 2025.',
  statut: 'verifiee_ia',
  priorite: 0,
  sources: [S('SSC-2026', 'page SCCM (numéros de recommandation non visibles)', 'administering antimicrobial therapy immediately, ideally within 1 hr of recognition', 'autre'), S('SEPSIS-3-2016', 'Box 3', 'Organ dysfunction can be identified as an acute change in total SOFA score ≥2 points consequent to the infection.', 'definition')],
  sApplique: (ctx) => adulte(ctx) && (ctx.dossier.entree !== 'non_choisi' || ctx.dossier.patient.gravite !== 'inconnu'),
  appliquer: (ctx) => {
    const f = new Fiche(ctx, 'verifiee_ia');
    const g = ctx.dossier.patient.gravite;
    const ssc1h = S('SSC-2026', 'page SCCM — antimicrobiens', 'administering antimicrobial therapy immediately, ideally within 1 hr of recognition', 'autre');
    const sscHc = S('SSC-2026', 'page SCCM — cultures', 'collecting blood cultures as soon as possible and ideally before the administration of antimicrobial therapy', 'controle_micro');
    const sscSrc = S('SSC-2026', 'page SCCM — contrôle de la source', 'early source control over late source control, ideally within 6 hr of diagnosis', 'geste');
    const has = S('HAS-2025-sepsis', 'page de présentation', 'Appliquer au mieux dans la première heure, un groupe d\'actions coordonnées et standardisées', 'autre');
    if (g === 'choc_septique' || g === 'sepsis') {
      if (ctx.foyer === 'clostridioides_difficile')
        f.alerte('info', 'Infection à C. difficile : son traitement est oral (ou intraluminal), voir la fiche ; l\'antibiothérapie IV probabiliste du sepsis vise un autre foyer suspecté.', [S('ESCMID-2021-ICD-traitement', 'recommandations', undefined, 'autre')]);
      f.urgence('immediate')
        .alerte('urgence', `${g === 'choc_septique' ? 'Choc septique' : 'Sepsis'} : antibiothérapie IV immédiate, idéalement dans l'heure ; hémocultures (au moins 40 mL, 2-3 paires) et lactate sans retarder l'antibiothérapie ; avis réanimation.`, [ssc1h, sscHc, has])
        .geste('Contrôle de la source le plus tôt possible, idéalement dans les 6 h du diagnostic (drainage, ablation de matériel infecté, levée d\'obstacle).', [sscSrc])
        // Audit relecteur 2 : source précisée (HAS 2025, page de présentation : admission en soins critiques si non-résolution).
        .avis(g === 'choc_septique' ? 'Avis réanimation immédiat (choc septique).' : 'Avis réanimation si dysfonction d\'organe persistante après traitement initial.', g === 'choc_septique', [has, S('HAS-2025-sepsis', 'page de présentation', 'admission en soins critiques « en l\'absence de résolution des variables cliniques après traitement initial »', 'autre')]);
    } else if (g === 'inconnu') {
      f.urgence('elevee')
        .alerte('attention', 'Gravité non renseignée : rechercher un sepsis (dysfonction d\'organe, SOFA ≥ 2) ou un choc septique ; elle conditionne le délai (1 h si sepsis probable ou choc, 3 h si sepsis seulement possible) et le schéma (ajout d\'un aminoside).', [ssc1h, S('SSC-2026', 'page SCCM — sepsis possible', 'within 3 hours from the time when sepsis was first suspected', 'autre')])
        .manque('gravité (sepsis, choc septique ou stable)', 'conditionne le délai et le schéma probabiliste', 'bloque_decision');
    } else if (ctx.foyer === 'meningite') {
      // Méningite : l'urgence (antibiotique dans l'heure) est portée par R-MENINGITE-BACTERIENNE ; pas de délai de 3 h.
    } else {
      f.alerte('info', 'Pas de dysfonction d\'organe déclarée : réévaluer la gravité à chaque étape ; en cas de sepsis seulement possible, antibiothérapie dans les 3 h si la suspicion persiste.', [S('SSC-2026', 'page SCCM — sepsis possible', 'within 3 hours from the time when sepsis was first suspected', 'autre')]);
    }
    return f.fin();
  },
};

export const R_TERRAIN: Regle = {
  id: 'R-TERRAIN-IMMUNODEPRESSION',
  libelle: 'Neutropénie / immunodépression : hors périmètre validé, avis immédiat',
  description: 'ECIL-4 : stratégie escalade/désescalade selon le risque ; non modélisée dans l\'application.',
  statut: 'verifiee_ia',
  priorite: 0,
  sources: [S('ECIL-4-2013', 'abstract', 'A \'de-escalation\' approach […] should be used only in those patients with', 'choix')],
  sApplique: (ctx) => adulte(ctx) && (ctx.dossier.patient.neutropenie === 'oui' || ctx.dossier.patient.immunodepression === 'oui'),
  appliquer: (ctx) => {
    const f = new Fiche(ctx, 'verifiee_ia').plafond('partielle');
    if (ctx.dossier.patient.neutropenie === 'oui') {
      f.urgence('immediate')
        .alerte('urgence', 'Neutropénie fébrile : situation non couverte par les règles de l\'application (stratégie ECIL-4 selon le risque : escalade par défaut, désescalade si colonisation à BMR ou présentation compliquée). Avis hématologique/infectiologique immédiat.', [S('ECIL-4-2013', 'abstract', 'An \'escalation\' approach, avoiding empirical carbapenems and combinations, should be employed in patients without particular risk factors.', 'choix')])
        .avis('Avis infectiologique et hématologique immédiat (neutropénie fébrile).', true, [S('ECIL-4-2013', 'abstract', undefined, 'choix')]);
    } else {
      f.alerte('attention', 'Immunodépression déclarée : les propositions ne tiennent pas compte des pathogènes opportunistes ; les recommandations urinaires masculines SPILF 2026 excluent ce terrain. Avis infectiologique.', [S('SPILF-2026-IUM', 'diapo 3', 'patient immunodéprimé (exclusion du périmètre)', 'autre')])
        .avis('Avis infectiologique (immunodépression).', false, []);
    }
    return f.fin();
  },
};

export const R_GROSSESSE: Regle = {
  id: 'R-TERRAIN-GROSSESSE',
  libelle: 'Grossesse : vigilance molécule par molécule, avis obstétrical',
  description: 'CRAT ; SPILF 2015 (PNA gravidique : avis obstétrical).',
  statut: 'verifiee_ia',
  priorite: 0,
  sources: [S('SPILF-2015-IU', 'p. 33-35', 'L\'hospitalisation initiale est le plus souvent recommandée', 'autre')],
  sApplique: (ctx) => adulte(ctx) && ctx.dossier.patient.grossesse === 'oui',
  appliquer: (ctx) =>
    new Fiche(ctx, 'verifiee_ia')
      .plafond('partielle')
      .alerte('attention', 'Grossesse : chaque molécule est contrôlée selon le CRAT (avertissement affiché sur le traitement) ; les schémas spécifiques de la grossesse ne sont que partiellement couverts. Avis obstétrical et infectiologique.', [S('SPILF-2015-IU', 'p. 33-35', undefined, 'autre')])
      .avis('Avis obstétrical (grossesse).', false, [S('SPILF-2018-IU-Caron', 'p. 339-340', 'Mandatory obstetrical examination and common initial hospitalization', 'autre')])
      .fin(),
};

export const R_ALLERGIE: Regle = {
  id: 'R-ALLERGIE-BETALACTAMINES',
  libelle: 'Allergies déclarées : exclusions et réserves',
  description: 'SPILF 2026 (d\'après ESCMID 2026) ; JNI 2024 SPILF. Les taux de réactivité croisée par chaîne latérale ne sont pas vérifiés (tableaux en image).',
  statut: 'verifiee_ia',
  priorite: 0,
  sources: [S('SPILF-2026-allergie-diapo', 'diapo 2-4, 7-8', 'Réaction allergique grave → Avis/cs en allergologie ; Contre-indication aux Bêta-lactamines', 'choix'), S('SPILF-JNI-2024-allergie', 'algorithme', 'réaction retardée grave → CI de toutes les bêtalactamines ; Avis d\'expert en allergologie nécessaire', 'choix')],
  sApplique: (ctx) => adulte(ctx) && (ctx.dossier.entree !== 'non_choisi' || ctx.dossier.patient.allergies.length > 0),
  appliquer: (ctx) => {
    const f = new Fiche(ctx, 'verifiee_ia');
    const p = ctx.dossier.patient;
    if (p.statutAllergie === 'inconnu' && p.allergies.length === 0) {
      f.manque('allergies (aucune connue / présentes / inconnu)', 'conditionne le choix des bêta-lactamines', 'bloque_decision');
      f.alerte('attention', 'Statut allergique non renseigné : à préciser avant toute bêta-lactamine.');
    }
    const srcs = [S('SPILF-2026-allergie-diapo', 'diapo 4', 'Prescription possible d\'une céphalosporine avec des chaînes différentes ou d\'un monobactam (contre-indication si allergie ceftazidime/cefidérocol) ou d\'un carbapénème', 'choix'), S('SPILF-JNI-2024-allergie', 'HSI grave aux pénicillines', 'Contre-indication de toutes les pénicillines, et des céphalosporines avec une similitude de chaines avec l\'antibiotique inculpé', 'choix')];
    for (const e of ctx.allergie.explications) f.alerte(ctx.allergie.retardeeSevere ? 'urgence' : 'attention', e, srcs);
    if (ctx.allergie.retardeeSevere || p.allergies.some((a) => a.gravite === 'severe')) f.avis('Avis allergologique (réaction grave déclarée) ; ne pas réintroduire la molécule en cause.', false, srcs);
    return f.fin();
  },
};

export const R_DONNEES: Regle = {
  id: 'R-DONNEES-ESSENTIELLES',
  libelle: 'Données essentielles manquantes',
  description: 'Liste les informations nécessaires à l\'individualisation, sans les inventer.',
  statut: 'verifiee_ia',
  priorite: 0,
  sources: [],
  sApplique: (ctx) => adulte(ctx) && ctx.dossier.entree !== 'non_choisi',
  appliquer: (ctx) => {
    const f = new Fiche(ctx, 'verifiee_ia');
    const p = ctx.dossier.patient;
    if (p.age === undefined) f.manque('âge', 'périmètre (adulte), facteurs de complication, estimation de la fonction rénale', 'bloque_decision');
    if (p.sexe === 'inconnu') f.manque('sexe', 'infection urinaire masculine vs féminine ; formules rénales', 'affine');
    if (p.contexte === 'inconnu') f.manque('contexte communautaire ou associé aux soins', 'spectre probabiliste', 'bloque_decision');
    if (p.renal.dialyse === 'inconnu') f.manque('dialyse / épuration extrarénale (oui/non)', 'adaptation posologique', 'affine');
    if (!p.renal.creatinine && !p.renal.dfg && p.renal.dialyse !== 'hemodialyse_intermittente' && p.renal.dialyse !== 'eer_continue') f.manque('créatininémie (avec unité)', 'adaptation rénale ; surveillance des molécules néphrotoxiques', 'bloque_dose');
    if (p.renal.creatinine && p.renal.stabilite === 'inconnu' && p.renal.dialyse !== 'hemodialyse_intermittente') f.manque('stabilité de la fonction rénale', 'les formules ne s\'appliquent qu\'à l\'état d\'équilibre', 'affine');
    if (bacteriemie(ctx)) {
      const h = ctx.hemocultures[0];
      if (h.foyer === 'inconnu' && ctx.dossier.syndrome === 'non_choisi') f.manque('foyer suspecté (urinaire, cathéter, endocardite, ostéoarticulaire…)', 'oriente le spectre, la durée et le contrôle de la source', 'bloque_decision');
      if (p.materielVasculaire === 'inconnu' || p.valve === 'inconnu' || p.protheseArticulaire === 'inconnu' || p.dispositifIntracardiaque === 'inconnu') f.manque('matériel (valve, dispositif intracardiaque, cathéter, prothèse)', 'risque d\'infection sur matériel, échocardiographie, retrait', 'bloque_decision');
    }
    return f.fin();
  },
};

export const R_REEVALUATION: Regle = {
  id: 'R-REEVALUATION-48-72H',
  libelle: 'Réévaluation de l\'antibiothérapie entre la 24e et la 72e heure',
  description: 'HAS 2008 ; certification HAS 2025, critère impératif 2.4-02 ; SSC 2026 (désescalade).',
  statut: 'verifiee_ia',
  priorite: 0,
  sources: [S('HAS-2025-certification-2.4-02', 'p. 110', 'Les prescriptions d\'antibiotiques sont systématiquement réévaluées entre la 24e et la 72e heure.', 'autre')],
  sApplique: (ctx) => adulte(ctx) && (bacteriemie(ctx) || ctx.dossier.syndrome !== 'non_choisi'),
  appliquer: (ctx) =>
    new Fiche(ctx, 'verifiee_ia')
      .reeval('Réévaluer entre H24 et H72 : évolution clinique, résultats microbiologiques, désescalade, relais oral, durée prévisionnelle notée dans le dossier.', [S('HAS-2025-certification-2.4-02', 'p. 110', 'Les prescriptions d\'antibiotiques sont systématiquement réévaluées entre la 24e et la 72e heure.', 'autre'), S('HAS-2008-strategie-antibiotherapie', 'ch. 2.1, p. 7', 'La réévaluation entre la 24e heure et la 72e heure permet d\'apprécier l\'évolution clinique, d\'obtenir les données microbiologiques', 'autre'), S('SSC-2026', 'page SCCM — désescalade', 'de-escalation of antimicrobial therapy over no de-escalation when a confirmed microbiological diagnosis', 'autre')], 48)
      .fin(),
};

export const R_PERSISTANCE: Regle = {
  id: 'R-HEMOCULTURES-PERSISTANTES',
  libelle: 'Hémocultures persistantes sous traitement',
  description: 'SRLF 2020 : bactériémie persistante après 3 j de traitement bien conduit ; ETO si persistance (S. aureus, entérocoque ; tout germe si risque d\'endocardite).',
  statut: 'verifiee_ia',
  priorite: 0,
  sources: [S('SRLF-2020-catheters', 'info-antibio 2019 ; R3.3', 'La persistance d\'HC positives après 3j de traitement bien conduit définit une bactériémie (fongémie) persistante', 'definition')],
  sApplique: (ctx) => adulte(ctx) && ctx.hemocultures.some((h) => h.hemoc?.persistance === 'persistantes'),
  appliquer: (ctx) => {
    const src = [S('SRLF-2020-catheters', 'info-antibio 2019 ; R3.3a/b', 'Une ETO est suggérée en cas de bactériémie persistante à S. aureus, ou entérocoque (R3.3a), et, quel que soit le micro-organisme (R3.3b), chez les patients à risque d\'endocardite', 'imagerie')];
    return new Fiche(ctx, 'verifiee_ia')
      .urgence('elevee')
      .alerte('urgence', 'Hémocultures toujours positives sous traitement : rechercher un foyer profond, une endocardite, une thrombophlébite ou un matériel infecté ; contrôle de la source ; avis infectiologique.', src)
      .controle({ id: 'ctl-persist-eto', type: 'echocardiographie', categorie: 'conditionnel', quoi: 'Échocardiographie transœsophagienne', quand: { ancre: 'non_determine', texte: 'Dès la constatation de la persistance' }, pourquoi: 'Bactériémie persistante à S. aureus ou entérocoque, ou tout germe chez un patient à risque d\'endocardite.', ensuite: 'Si endocardite : choisir le foyer « Endocardite » pour le schéma dédié.', sources: src })
      .avis('Avis infectiologique (bactériémie persistante).', true, src)
      .fin();
  },
};

// R-COLONISATION-URINAIRE (version 2026.11.0) est remplacée par R-INDICATION-ECBU (src/clinical/rules/indication.ts).

export const R_SYNDROME_NON_COUVERT: Regle = {
  id: 'R-SYNDROME-NON-COUVERT',
  libelle: 'Syndrome hors périmètre actuel',
  // Foyers digestif, cutané et pulmonaire retirés le 2026-11-06 : couverts par R-INTRA-ABDOMINAL, R-PEAU-TISSUS-MOUS et R-PNEUMONIE.
  description: 'Foyers « autre » et ostéoarticulaire sans matériel, sans bactériémie couverte.',
  statut: 'verifiee_ia',
  priorite: 10,
  sources: [],
  sApplique: (ctx) => adulte(ctx) && ['autre', 'osteoarticulaire_sans_materiel'].includes(ctx.foyer) && germePrincipal(ctx).g === 'aucun',
  appliquer: (ctx) =>
    new Fiche(ctx, 'verifiee_ia')
      .situation('syndrome-non-couvert', 'Foyer non couvert par la version actuelle', 'non_couverte', 'Les infections ostéoarticulaires sans matériel et les autres foyers ne sont pas encore modélisés. Seules les règles transversales (gravité, réévaluation) s\'appliquent.')
      .avis('Avis infectiologique pour le choix thérapeutique.', false, [])
      .fin(),
};

export const REGLES_TRANSVERSALES = [R_PEDIATRIE, R_GRAVITE, R_TERRAIN, R_GROSSESSE, R_ALLERGIE, R_DONNEES, R_REEVALUATION, R_PERSISTANCE, R_SYNDROME_NON_COUVERT];
