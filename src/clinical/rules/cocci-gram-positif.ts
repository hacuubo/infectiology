/**
 * Cocci à Gram positif : S. aureus, staphylocoques à coagulase négative (dont S. epidermidis
 * et S. lugdunensis), streptocoques, entérocoques.
 */
import type { Regle } from '../../engine/decider';
import type { ContexteDecision } from '../../engine/contexte';
import type { SourceRef } from '../types';
import { Fiche, S, adulte, bacteriemie, germePrincipal, lireAntibiogramme, statutMeticilline, type DureeDecidee } from './outils';

const IDSA26 = 'IDSA-ESCMID-2026-SAB';

/* ------------------------------------------------------------------ */
/* Staphylococcus aureus                                               */
/* ------------------------------------------------------------------ */

export function facteursRisqueSAB(ctx: ContexteDecision): { cles: string[]; autres: string[]; inconnus: string[] } {
  const p = ctx.dossier.patient;
  const h = ctx.hemocultures[0]?.hemoc;
  const cles: string[] = [];
  const autres: string[] = [];
  const inconnus: string[] = [];
  if (p.contexte === 'communautaire') cles.push('début communautaire');
  else if (p.contexte === 'inconnu') inconnus.push('contexte (communautaire ?)');
  if (h?.persistance === 'persistantes') cles.push('hémoculture positive ≥ 48 h après la première');
  else if (!h || h.persistance === 'inconnu' || h.persistance === 'non_controlees') inconnus.push('hémocultures de contrôle à 48 h');
  if (p.dispositifIntracardiaque === 'oui') cles.push('dispositif intracardiaque');
  else if (p.dispositifIntracardiaque === 'inconnu') inconnus.push('dispositif intracardiaque');
  if (['prothese_mecanique', 'prothese_biologique', 'tavi'].includes(p.valve)) autres.push('valvulopathie prédisposante / prothèse valvulaire');
  else if (p.valve === 'inconnu') inconnus.push('valve cardiaque');
  if (ctx.foyer === 'inconnu') autres.push('foyer inconnu');
  if (['osteoarticulaire_materiel', 'osteoarticulaire_sans_materiel', 'endocardite'].includes(ctx.foyer)) autres.push('signe de foyer profond ou métastatique');
  if (p.protheseArticulaire === 'oui') autres.push('matériel orthopédique (foyer profond possible)');
  return { cles, autres, inconnus };
}

export const R_SAB: Regle = {
  id: 'R-BACTERIEMIE-S-AUREUS',
  libelle: 'Bactériémie à Staphylococcus aureus (ou CGP en amas en attente d\'identification)',
  description: 'IDSA/ESCMID 2026 (stratification, hémocultures, échographie, durée) ; molécules : ESC 2023, SPILF/SFPT/CA-SFM 2026, SPILF 2025, IDSA 2011.',
  statut: 'verifiee_ia',
  priorite: 150,
  sources: [S(IDSA26, 'Executive Summary, CS1-CS7', undefined, 'autre')],
  sApplique: (ctx) => {
    if (!adulte(ctx) || !bacteriemie(ctx) || ctx.foyer === 'endocardite' || ctx.foyer === 'meningite') return false;
    const g = germePrincipal(ctx).g;
    return g === 's_aureus' || g === 'cgp_amas';
  },
  appliquer: (ctx) => {
    const f = new Fiche(ctx, 'verifiee_ia');
    const { prl, g } = germePrincipal(ctx);
    const enAttente = g === 'cgp_amas';
    const fr = facteursRisqueSAB(ctx);
    if (!enAttente)
      f.c.indication = {
        decision: ctx.dossier.patient.gravite === 'choc_septique' ? 'urgence' : 'traiter',
        qualification: 'infection',
        titre: 'Bactériémie à S. aureus : traitement indiqué',
        raison: 'S. aureus est rarement un contaminant d’hémoculture : une seule hémoculture positive suffit à définir la bactériémie.',
        conditions: ['S. aureus dans au moins une hémoculture'],
        exceptions: [],
        actions: [],
        surveillance: [],
        reconsiderer: [],
        questions: [],
        sources: [S(IDSA26, 'Table 1 (definitions)', 'S. aureus is rarely a blood culture contaminant.', 'definition'), S(IDSA26, 'Table 1 (definitions)', 'Any patient with ≥1 positive blood culture for S. aureus due to infection.', 'definition')],
        statut: 'verifiee_ia',
        regleId: 'R-BACTERIEMIE-S-AUREUS',
      };
    const risqueAccru = fr.cles.length + fr.autres.length > 0;
    const p = ctx.dossier.patient;
    f.urgence('elevee').situation(
      'bacteriemie-s-aureus',
      enAttente ? 'Hémocultures à cocci à Gram positif en amas (staphylocoque probable)' : `Bactériémie à S. aureus — risque ${risqueAccru ? 'accru' : fr.inconnus.length ? 'à préciser' : 'faible'}`,
      enAttente ? 'partielle' : 'couverte',
      `${risqueAccru ? `Facteurs de risque : ${[...fr.cles, ...fr.autres].join(', ')}. ` : ''}${fr.inconnus.length ? `À préciser : ${fr.inconnus.join(', ')}. ` : ''}S. aureus n'est presque jamais un contaminant. Les termes « compliquée / non compliquée » sont abandonnés au profit de « risque faible / accru ».`,
    );
    f.alerte('attention', 'S. aureus : avis infectiologique fortement recommandé ; retrait rapide de tout cathéter veineux central.', [S(IDSA26, 'Executive Summary', 'Infectious disease consultation is strongly encouraged to guide diagnostic evaluation and management.', 'autre'), S(IDSA26, 'CS1, Remarks', 'Prompt removal of central venous catheters is recommended', 'geste')]);
    f.avis('Avis infectiologique (bactériémie à S. aureus).', true, [S(IDSA26, 'Executive Summary', 'Infectious disease consultation is strongly encouraged', 'autre')]);
    if (ctx.materielVasculairePresent) f.geste('Retirer rapidement le cathéter veineux central (le retard augmente les complications hématogènes et les rechutes).', [S(IDSA26, 'CS1, Remarks', 'Prompt removal of central venous catheters is recommended as delayed removal is associated with increased risk of hematogenous complications and relapse.', 'geste')]);

    // Contrôles
    const cs2 = S(IDSA26, 'CS2 (Executive Summary)', 'at least 2 sets of FUBC be obtained at 48 hours after sampling of the first positive blood culture and then repeated as either 1 or 2 sets every 24 to 48 hours until negative', 'controle_micro');
    f.controle({ id: 'ctl-sab-hc', type: 'hemoculture', categorie: 'indique', quoi: 'Hémocultures de contrôle : au moins 2 séries', quand: { ancre: 'premiere_hemoculture_positive', offsetHeures: 48, texte: '48 h après le prélèvement de la 1re hémoculture positive', repetition: '1 ou 2 séries toutes les 24-48 h jusqu\'à négativation' }, pourquoi: 'Documenter la négativation (« clairance ») : son jour est le point de départ de la durée de traitement.', ensuite: 'Positives ≥ 48 h : risque accru → bilan de foyer profond et contrôle de la source.', sources: [cs2, S(IDSA26, 'CS2', 'The day of blood culture clearance should be used as the start date for calculating treatment duration', 'duree')] });
    f.controle({ id: 'ctl-sab-ett', type: 'echocardiographie', categorie: 'indique', quoi: 'Échocardiographie transthoracique (ETT)', quand: { ancre: 'debut_traitement', texte: 'Chez tous les adultes, dès que possible (délai non précisé)' }, pourquoi: 'Recherche d\'endocardite.', sources: [S(IDSA26, 'CS3 (page HTML)', 'The panel suggests routinely performing TTE in all adults with SAB.', 'imagerie')] });
    f.controle({ id: 'ctl-sab-eto', type: 'echocardiographie', categorie: risqueAccru ? 'indique' : fr.inconnus.length ? 'conditionnel' : 'non_systematique', quoi: 'Échocardiographie transœsophagienne (ETO)', quand: { ancre: 'non_determine', texte: 'Après une ETT négative, si au moins un critère de risque d\'endocardite' }, pourquoi: 'Critères : dispositif intracardiaque, valvulopathie prédisposante, hémoculture positive ≥ 48 h, emboles, plusieurs foyers non contigus, début communautaire, usage de drogues IV.', sources: [S(IDSA26, 'CS4 (page HTML)', 'TEE may be unnecessary in adults with SAB who have a negative good quality TTE', 'imagerie')] });
    if (risqueAccru && ctx.foyer === 'inconnu') f.controle({ id: 'ctl-sab-tep', type: 'imagerie', categorie: 'conditionnel', quoi: 'TEP-TDM au FDG (ou imagerie combinée des sites probables)', quand: { ancre: 'non_determine', texte: 'Si risque accru et foyer inconnu après bilan initial' }, pourquoi: 'Recherche de foyer profond ou métastatique.', sources: [S(IDSA26, 'CS5 (page HTML)', 'adultes à risque accru et foyer inconnu → TEP-TDM au FDG ou imagerie combinée', 'imagerie')] });

    const dateClear = ctx.hemocultures[0]?.hemoc?.dateNegativationISO;
    const duree: DureeDecidee = {
      texte: `14 jours en l'absence de foyer profond ou métastatique après bilan (risque faible ou accru)${dateClear ? ` — à compter du ${new Date(dateClear).toLocaleDateString('fr-FR')}` : ''} ; plus longue si bactériémie prolongée, bilan incomplet ou foyer profond (durée selon le foyer).`,
      pointDeDepart: 'jour de la 1re hémoculture négative (clairance), ou date du retrait du foyer s\'il est postérieur',
      dureePrevueJours: 14,
      sources: [S(IDSA26, 'CS6', 'the panel suggests an antibiotic treatment duration of 14 days rather than longer or shorter courses (consensus)', 'duree'), S(IDSA26, 'CS7', '>14 days of antibiotic therapy should be considered in select patients with prolonged bacteremia', 'duree'), S(IDSA26, 'CS2', 'The day of blood culture clearance should be used as the start date', 'duree')],
    };
    if (!dateClear) f.manque('date de la 1re hémoculture négative', 'point de départ de la durée (14 jours à compter de la clairance)', 'bloque_duree');

    const atb = lireAntibiogramme(prl);
    for (const n of atb.notes) f.alerte('info', n.texte, n.sources);
    const meti = statutMeticilline(atb);
    const sarm = meti === 'R';
    const sasm = meti === 'S';
    const srcMol: SourceRef[] = [S('ESC-2023-endocardite', 'Recommendation Table 8', '(flu)cloxacillin or cefazolin', 'choix'), S('SPILF-2025-DESC-SAB-Tattevin', 'messages clés', 'Péni M (anti-staph) ou céfazoline > autres Beta-lactamines si SAMS', 'choix')];
    const commentaireMol = 'Le consensus IDSA/ESCMID 2026 (Partie 1) ne traite pas encore du choix des molécules ; référence : ESC 2023 et SPILF.';
    if (sasm) {
      f.option({ id: 'doc-sasm-cefazoline', libelle: 'Céfazoline (SASM)', type: 'documente', rang: 'premiere_ligne', items: [{ m: 'cefazoline', r: 'cefazoline-2g-x3' }], duree, sources: srcMol, commentaire: `${commentaireMol} Céfazoline et cloxacilline sont citées à égalité par les sources (ESC 2023 T8 ; SPILF 2025) ; le rang 1 de la céfazoline est un choix de l'application (meilleure tolérance selon les essais CLOCEBA/SNAP cités « in press » par le support SPILF 2025, non lus).` });
      f.option({ id: 'doc-sasm-cloxa', libelle: 'Cloxacilline (SASM)', type: 'documente', rang: 'alternative', items: [{ m: 'cloxacilline', r: 'cloxacilline-2g-x6' }], duree, sources: srcMol });
      const allergieBL = ctx.allergie.famillesAEviter.has('penicilline') && ctx.allergie.famillesAEviter.has('cephalosporine');
      f.option({ id: 'doc-sasm-allergie', libelle: 'Daptomycine (allergie contre-indiquant les bêta-lactamines)', type: 'documente', rang: allergieBL ? 'alternative' : 'conditionnelle', condition: 'seulement si les bêta-lactamines sont contre-indiquées (avis allergologique)', items: [{ m: 'daptomycine', r: 'daptomycine-6' }], duree, sources: [S('RCP-daptomycine', '§4.2', '6 mg/kg/24 h (bactériémie à S. aureus)', 'posologie'), S('SPILF-AEPEI-2025-endocardite', 'diapo 13', 'CI β-lactamines : « Daptomycine + Fosfomycine » (endocardite)', 'choix')] });
    } else if (sarm) {
      const hd = p.renal.dialyse === 'hemodialyse_intermittente';
      f.option({ id: 'doc-sarm-vanco', libelle: hd ? 'Vancomycine (SARM), administration discontinue adaptée à la dialyse' : 'Vancomycine (SARM), perfusion continue', type: 'documente', rang: 'premiere_ligne', items: [{ m: 'vancomycine', r: hd ? 'vancomycine-discontinu' : 'vancomycine-continu' }], duree, sources: [S('IDSA-2011-SARM', 'Rec. 19 (archivée)', 'vancomycin (A-II) or daptomycin 6 mg/kg/dose IV once daily (AI) for at least 2 weeks', 'choix')], commentaire: commentaireMol });
      f.option({ id: 'doc-sarm-dapto', libelle: 'Daptomycine (SARM)', type: 'documente', rang: 'alternative', items: [{ m: 'daptomycine', r: 'daptomycine-6' }], duree, sources: [S('IDSA-2011-SARM', 'Rec. 19 (archivée)', 'daptomycin 6 mg/kg/dose IV once daily (AI)', 'choix'), S('SPILF-AEPEI-2025-endocardite', 'Le Moing JNI 2024', 'SARM et SERM: oublier la vancomycine, accompagner la daptomycine (endocardite)', 'choix')] });
    } else {
      f.alerte('attention', 'Sensibilité à la méticilline inconnue : la couverture probabiliste dépend du risque de SARM (antécédent de SARM, contexte associé aux soins) ; non tranchée par une recommandation lue.');
      const risqueSarm = p.antecedentsMicro.some((a) => a.resistance === 'SARM') || p.contexte === 'associe_aux_soins';
      f.option({ id: 'proba-sab-vanco', libelle: 'Vancomycine en attente de la sensibilité à la méticilline', type: 'probabiliste', rang: risqueSarm ? 'premiere_ligne' : 'conditionnelle', condition: 'si risque de SARM (antécédent de SARM, soins) ou allergie aux bêta-lactamines', items: [{ m: 'vancomycine', r: 'vancomycine-continu' }], duree, statut: 'brouillon', sources: [S('SRLF-2020-catheters', 'R3.11 (ILC en réanimation)', 'Vancomycine, mais pas teicoplanine… daptomycine, entre autre si choc septique ou insuffisance rénale', 'choix')], commentaire: 'Choix probabiliste avant la sensibilité à la méticilline non couvert par une recommandation lue : à valider avec le SMIT ; relais par céfazoline ou cloxacilline si SASM.' });
      f.option({ id: 'proba-sab-cefazoline', libelle: 'Céfazoline en attente (SASM probable)', type: 'probabiliste', rang: risqueSarm ? 'alternative' : 'conditionnelle', condition: 'si faible risque de SARM', items: [{ m: 'cefazoline', r: 'cefazoline-2g-x3' }], duree, statut: 'brouillon', sources: srcMol, commentaire: 'Hypothèse non sourcée sur le choix probabiliste ; à valider avec le SMIT.' });
      f.manque('sensibilité à l\'oxacilline / céfoxitine (SASM ou SARM)', 'choix entre céfazoline/cloxacilline et vancomycine/daptomycine', 'bloque_decision');
    }
    f.reeval('Si endocardite, foyer profond ou matériel infecté : durée et schéma propres au foyer (choisir le foyer correspondant).', [S(IDSA26, 'Executive Summary', 'Longer durations of therapy, guided by the likely focus, may be appropriate in select scenarios', 'duree')]);
    return f.fin();
  },
};

/* ------------------------------------------------------------------ */
/* Staphylocoques à coagulase négative                                 */
/* ------------------------------------------------------------------ */

export const R_SCN: Regle = {
  id: 'R-BACTERIEMIE-SCN',
  libelle: 'Hémocultures à staphylocoque à coagulase négative (dont S. epidermidis, S. lugdunensis)',
  description: 'Pas de recommandation dédiée aux critères contamination/infection ; IDSA 2009 (rec. 38), SRLF 2019-2020, SPILF/GPIP 2021, SPILF verrou 2021.',
  statut: 'verifiee_ia',
  priorite: 130,
  sources: [S('IDSA-2009-Mermel-ILC', 'rec. 38', undefined, 'controle_micro')],
  sApplique: (ctx) => adulte(ctx) && bacteriemie(ctx) && ['scn', 's_lugdunensis'].includes(germePrincipal(ctx).g) && ctx.foyer !== 'endocardite' && ctx.foyer !== 'meningite',
  appliquer: (ctx) => {
    const f = new Fiche(ctx, 'verifiee_ia');
    const { prl, g } = germePrincipal(ctx);
    const h = prl?.hemoc;
    const p = ctx.dossier.patient;
    const lugd = g === 's_lugdunensis';
    const series = h?.nbSeriesPositives;
    const materielEndo = ctx.protheseValvulaire || p.dispositifIntracardiaque === 'oui';
    const materiel = ctx.materielPresent;
    const srcRec38 = S('IDSA-2009-Mermel-ILC', 'rec. 38 (A-II)', 'additional cultures of blood samples obtained through the suspected catheter and from a peripheral vein should be performed', 'controle_micro');
    const srcDef = S('SRLF-2020-catheters', 'info-antibio SPILF 2019', 'Hémoculture positive sans porte d\'entrée certaine (sur au moins 2 séries, avec un même antibiogramme pour les commensaux cutanés)', 'definition');

    if (lugd) {
      // Audit relecteur 2 : la source ne vise que la durée ; considérer une série unique comme significative est un choix de l'application.
      f.alerte('attention', 'S. lugdunensis : durée alignée sur S. aureus (14 jours, SPILF/GPIP 2021) ; avis infectiologique. L\'application le traite comme une bactériémie vraie même sur une seule série : choix non sourcé, à confirmer par le clinicien (contrôle des hémocultures recommandé).', [S('SPILF-GPIP-2021-durees', 'diapo 21', 'Staphylococcus aureus et Staphylococcus lugdunensis : 14 jours', 'duree')]);
    }
    const srcDoern = S('DOERN-2019-contamination', 'Bacteria Associated with Contaminated Blood Cultures', 'These organisms may be considered contaminants unless recovered from multiple blood cultures obtained in sequence', 'definition');
    const ind = (decision: 'traiter' | 'urgence' | 'attendre_resultat' | 'informations_insuffisantes', qualification: 'infection' | 'infection_probable' | 'contamination_possible' | 'indeterminee', titre: string, raison: string, extra: { actions?: string[]; reconsiderer?: string[]; questions?: string[]; conditions?: string[] } = {}) => {
      f.c.indication = { decision, qualification, titre, raison, conditions: extra.conditions ?? [], exceptions: [], actions: extra.actions ?? [], surveillance: [], reconsiderer: extra.reconsiderer ?? [], questions: extra.questions ?? [], sources: [srcRec38, srcDoern, srcDef], statut: 'verifiee_ia', regleId: 'R-BACTERIEMIE-SCN' };
    };
    const grave = p.gravite === 'sepsis' || p.gravite === 'choc_septique';
    if (series === undefined && !lugd)
      ind('informations_insuffisantes', 'indeterminee', 'Staphylocoque à coagulase négative : signification à établir', 'Ni contaminant automatique, ni indication automatique : le nombre de séries positives (même espèce, même antibiogramme) est indispensable.', { questions: ['Nombre de séries prélevées et positives'] });
    else if (series !== undefined && series <= 1 && !lugd)
      ind(grave ? 'urgence' : 'attendre_resultat', 'contamination_possible', grave ? 'Sepsis avec un SCN sur une seule série : traiter le sepsis sans attendre' : 'Contamination possible : refaire les hémocultures avant de traiter', grave ? 'Le sepsis impose une antibiothérapie immédiate ; la signification du SCN reste à établir par de nouvelles hémocultures.' : 'Un SCN isolé dans une seule série est souvent un contaminant, mais pas toujours (matériel). Refaire des hémocultures (périphérie et cathéter suspect) avant tout antibiotique ou retrait de cathéter.', { conditions: ['une seule série positive', materiel ? 'matériel présent' : 'pas de matériel déclaré'], actions: ['Nouvelles hémocultures périphériques et sur le cathéter suspect, avant antibiotique', ...(materiel ? ['Avis infectiologique avant de conclure à une contamination (matériel présent)'] : [])], reconsiderer: ['Même SCN (même antibiogramme) dans une 2e série', 'Signes d’infection du cathéter ou du matériel', 'Sepsis'] });
    else if (series !== undefined && series >= 2)
      ind(grave ? 'urgence' : 'traiter', 'infection_probable', 'Bactériémie à SCN probable : traitement indiqué', 'Même espèce retrouvée dans au moins 2 séries : bactériémie vraie probable (vérifier l’identité des antibiogrammes).', { conditions: [`${series} séries positives`] });
    if (series === undefined) {
      f.situation('scn-a-qualifier', `Hémocultures à ${lugd ? 'S. lugdunensis' : 'staphylocoque à coagulase négative'} — signification à établir`, 'partielle', 'Le nombre de séries positives est indispensable : un SCN n\'est ni automatiquement un contaminant, ni automatiquement une indication d\'antibiothérapie.');
      f.manque('nombre de séries prélevées et positives', 'distinguer contamination probable et bactériémie vraie', 'bloque_decision');
      if (!lugd) return f.fin();
    }
    if (series !== undefined && series <= 1 && !lugd) {
      f.situation('scn-une-serie', 'SCN dans une seule série : contamination possible', materiel ? 'partielle' : 'couverte', `${materiel ? 'Présence de matériel : une contamination ne peut pas être retenue sans contrôle. ' : ''}Un seul prélèvement positif ne suffit ni à conclure à une contamination ni à traiter : répéter les hémocultures avant toute antibiothérapie.`);
      f.controle({ id: 'ctl-scn-repeter', type: 'hemoculture', categorie: 'indique', quoi: `Nouvelles hémocultures périphériques${ctx.materielVasculairePresent ? ' et sur le cathéter suspect' : ''}`, quand: { ancre: 'avant_traitement', texte: 'Maintenant, avant toute antibiothérapie ou retrait du cathéter' }, pourquoi: 'Un SCN sur une seule hémoculture impose un contrôle avant de conclure.', ensuite: 'Même espèce et même antibiogramme sur ≥ 2 séries : bactériémie vraie probable. Négatives et patient stable sans matériel : contamination probable, pas d\'antibiotique.', sources: [srcRec38, srcDef] });
      if (materielEndo) f.avis('Matériel endovasculaire/intracardiaque : avis infectiologique avant de conclure à une contamination.', false, [S('SPILF-2021-verrou', 'diapo 4', 'Pour les bactéries commensales un contrôle de l\'HC sur CIVLD est nécessaire pour différencier la colonisation de la CIVLD d\'une contamination du prélèvement', 'controle_micro')]);
      return f.fin();
    }
    // Bactériémie vraie probable (≥ 2 séries) ou S. lugdunensis
    f.situation('scn-bacteriemie', `Bactériémie à ${lugd ? 'S. lugdunensis' : 'SCN'} sur ${series ?? '?'} séries`, 'partielle', `${materiel ? 'Matériel présent : infection sur matériel probable. ' : ''}Bactériémie vraie probable si même espèce et même antibiogramme sur au moins 2 séries.`);
    if (ctx.materielVasculairePresent) {
      f.geste('Infection de cathéter probable : retrait du cathéter (référence) ; verrou antibiotique possible pour un CIVLD (chambre implantable, cathéter tunnelisé) en l\'absence de complication.', [S('SPILF-2021-verrou', 'diapo 7', 'Un verrou curatif est une option pour traiter une infection non compliquée liée à un CIVLD, à staphylocoque à coagulase négative ou entérocoque.', 'geste')]);
    }
    if (materielEndo || p.protheseArticulaire === 'oui') {
      f.urgence('elevee').avis('Matériel prothétique (valve, dispositif intracardiaque, prothèse articulaire) : avis infectiologique ; rechercher une infection du matériel.', true, [S('SPILF-2021-verrou', 'diapo (matériel)', 'La présence de matériel prothétique nécessite un avis infectiologique', 'autre')]);
      if (materielEndo) f.controle({ id: 'ctl-scn-eto', type: 'echocardiographie', categorie: 'conditionnel', quoi: 'ETT puis ETO', quand: { ancre: 'non_determine', texte: 'Sans délai si matériel intracardiaque' }, pourquoi: 'Patient à risque d\'endocardite (ETO suggérée si bactériémie persistante, quel que soit le germe).', sources: [S('SRLF-2020-catheters', 'R3.3b', 'quel que soit le micro-organisme (R3.3b), chez les patients à risque d\'endocardite', 'imagerie')] });
    }
    const atb = lireAntibiogramme(prl);
    const oxa = statutMeticilline(atb);
    const duree: DureeDecidee = lugd
      ? { texte: '14 jours (S. lugdunensis, comme S. aureus) en l\'absence de foyer profond.', pointDeDepart: 'première hémoculture négative', dureePrevueJours: 14, sources: [S('SPILF-GPIP-2021-durees', 'diapo 21', 'Staphylococcus aureus et Staphylococcus lugdunensis : 14 jours', 'duree')] }
      : ctx.materielVasculairePresent
        ? { texte: 'Après retrait du cathéter : 3 jours si apyrexie et absence de matériel endovasculaire (SPILF 2021) ; 5 à 7 jours (IDSA 2009) ; 7 jours (SRLF 2020) — divergence non résolue. Cathéter conservé avec verrou : 10 jours de traitement systémique.', pointDeDepart: 'retrait du cathéter et première hémoculture négative', dureePrevueJours: 7, sources: [S('SPILF-GPIP-2021-durees', 'diapo 19-20', 'Staphylocoque à coagulase négative : 3 jours si apyrexie et absence de matériel endovasculaire', 'duree'), S('IDSA-2009-Mermel-ILC', 'rec. 75', 'treat with antibiotics for 5–7 days if the catheter is removed', 'duree'), S('SRLF-2020-catheters', 'Table 3', '7 days if positive without distant complications', 'duree')] }
        : { texte: 'Durée selon le foyer et le matériel : non déterminable sans foyer identifié (avis infectiologique).', pointDeDepart: 'à définir', sources: [] };
    // Choix de molécule pour un SCN : aucune recommandation dédiée. Seule la vancomycine probabiliste d'une infection
    // liée au cathéter est sourcée (SRLF 2020 R3.11) ; ailleurs, l'absence est expliquée, pas comblée (2026-11-06).
    if (!ctx.materielVasculairePresent || oxa === 'S') {
      f.absence(
        `Choix de l'antibiotique d'une bactériémie à ${lugd ? 'S. lugdunensis' : 'staphylocoque à coagulase négative'}${ctx.materielVasculairePresent ? ' sensible à la méticilline' : ' sans cathéter'}`,
        'Recherche du 2026-11-04 : pas de recommandation dédiée au choix de la molécule pour les staphylocoques à coagulase négative ; les sources lues fixent la durée (SPILF/GPIP 2021) et le traitement probabiliste d\'une infection liée au cathéter (SRLF 2020), pas le traitement documenté.',
        [
          'Confirmer la bactériémie vraie (même espèce et même antibiogramme sur au moins 2 séries)',
          'Rechercher le foyer et le matériel (cathéter, prothèse, valve)',
          'Avis du SMIT pour le choix de la molécule, selon l\'antibiogramme',
        ],
        [S('SPILF-GPIP-2021-durees', 'diapo 19-21', undefined, 'duree'), S('SRLF-2020-catheters', 'R3.11', 'Vancomycine, mais pas teicoplanine (probabiliste ILC)', 'choix')],
      );
      f.reeval('La seule ablation du cathéter peut suffire en fonction de l\'évolution clinique (sur avis spécialisé).', [S('SPILF-GPIP-2021-durees', 'diapo 19', 'La seule ablation du cathéter peut suffire en fonction de l\'évolution clinique (sur avis spécialisé)', 'duree')]);
      return f.fin();
    }
    const item = { m: 'vancomycine', r: 'vancomycine-continu' };
    f.option({ id: 'scn-traitement', libelle: 'Vancomycine (infection liée au cathéter à SCN méticillino-résistant ou de sensibilité inconnue)', type: oxa === undefined ? 'probabiliste' : 'documente', rang: 'premiere_ligne', items: [item], duree, statut: 'brouillon', sources: [S('SRLF-2020-catheters', 'R3.11', 'Vancomycine, mais pas teicoplanine (probabiliste ILC)', 'choix')], commentaire: 'Seule la vancomycine probabiliste d\'une infection liée au cathéter est sourcée (SRLF 2020 R3.11) ; pas de recommandation dédiée aux SCN : à valider avec le SMIT. La seule ablation du cathéter peut suffire selon l\'évolution (avis spécialisé).' });
    f.reeval('La seule ablation du cathéter peut suffire en fonction de l\'évolution clinique (sur avis spécialisé).', [S('SPILF-GPIP-2021-durees', 'diapo 19', 'La seule ablation du cathéter peut suffire en fonction de l\'évolution clinique (sur avis spécialisé)', 'duree')]);
    return f.fin();
  },
};

/* ------------------------------------------------------------------ */
/* Streptocoques et entérocoques                                       */
/* ------------------------------------------------------------------ */

export const R_STREPTO: Regle = {
  id: 'R-BACTERIEMIE-STREPTOCOQUE',
  libelle: 'Bactériémie à streptocoque (hors endocardite)',
  description: 'Durée : SPILF/GPIP 2021 ; échographie : ESC 2023 Table 5 ; posologie : SPILF/SFPT/CA-SFM 2026.',
  statut: 'verifiee_ia',
  priorite: 130,
  sources: [S('SPILF-GPIP-2021-durees', 'diapo 21', undefined, 'duree')],
  sApplique: (ctx) => adulte(ctx) && bacteriemie(ctx) && ['strepto', 'cgp_chainettes'].includes(germePrincipal(ctx).g) && ctx.foyer !== 'endocardite' && ctx.foyer !== 'meningite',
  appliquer: (ctx) => {
    const f = new Fiche(ctx, 'verifiee_ia');
    const { prl, g } = germePrincipal(ctx);
    const org = prl?.organisme;
    f.situation('bacteriemie-streptocoque', g === 'cgp_chainettes' ? 'Cocci à Gram positif en chaînettes (streptocoque ou entérocoque) en attente d\'identification' : 'Bactériémie à streptocoque', g === 'cgp_chainettes' ? 'partielle' : 'couverte', 'Rechercher la porte d\'entrée et une endocardite selon l\'espèce.');
    const duree: DureeDecidee = { texte: '7 jours pour une bactériémie non compliquée sans porte d\'entrée profonde (durée du foyer sinon).', pointDeDepart: 'premier jour de traitement efficace (non précisé par la source)', dureePrevueJours: 7, sources: [S('SPILF-GPIP-2021-durees', 'diapo 21', 'streptocoques, entérocoques : 7 jours', 'duree')] };
    const atb = lireAntibiogramme(prl);
    // Déduction amoxicilline ← pénicilline G : règle CA-SFM 2026 (ch. 5.10) propre aux streptocoques A, B, C et G, non généralisée.
    const abcg = org === 'streptococcus_pyogenes' || org === 'streptococcus_agalactiae' || org === 'streptocoque_groupe_c_g';
    // Déduction seulement d'un résultat S ; une résistance est exceptionnelle et signalée (CMI, identification).
    const amox = atb.sir('amoxicilline') ?? (abcg && atb.sir('penicilline_g') === 'S' ? 'S' : undefined);
    // Audit relecteur 2 (2026-11-05) : BLOQUÉ (brouillon). Aucune recommandation lue ne porte sur le choix de la molécule
    // dans la bactériémie à streptocoque hors endocardite : l'amoxicilline est extrapolée (CA-SFM = règle de lecture,
    // ESC 2023 T7 = endocardite). Seule la durée de 7 jours (SPILF/GPIP 2021) est sourcée.
    const extrapole = 'Choix de molécule extrapolé (ESC 2023 T7 endocardite ; règle de lecture CA-SFM) : aucune recommandation lue sur la bactériémie à streptocoque hors endocardite. À valider par un médecin.';
    f.option({ id: 'strepto-amox', libelle: `Amoxicilline IV${amox === 'I' ? ' (forte posologie)' : ''}`, type: amox ? 'documente' : 'probabiliste', rang: 'premiere_ligne', items: [{ m: 'amoxicilline', r: amox === 'I' ? 'amoxicilline-iv-fort' : 'amoxicilline-iv-std' }], duree, sources: [S('CASFM-2026-V1.0', 'ch. 5.10', 'La sensibilité à l\'amoxicilline […] des streptocoques des groupes A, B, C ou G se déduit de la sensibilité à la pénicilline G.', 'choix'), S('SPILF-SFPT-CASFM-2026-posologies', 'Annexe 9 (amoxicilline)', 'Amoxicilline iv 50 à 100 mg/kg/jour [standard]', 'posologie')], statut: 'brouillon', commentaire: g === 'cgp_chainettes' ? `En attente d'identification. ${extrapole}` : extrapole });
    // Au stade de l'examen direct (chaînettes), un entérocoque n'est pas exclu : or les céphalosporines sont inactives
    // sur les entérocoques (résistance naturelle). La ceftriaxone n'est alors qu'une option conditionnelle.
    const srcEnteroCeph = S('CASFM-2026-V1.0', 'ch. 5.8 (entérocoques)', 'Toutes les espèces d\'Enterococcus sont naturellement résistantes aux céphalosporines, à l\'exception du ceftobiprole vis-à-vis de E. faecalis.', 'choix');
    if (g === 'cgp_chainettes') {
      f.alerte('attention', 'Cocci à Gram positif en chaînettes : un entérocoque n\'est pas exclu avant l\'identification. Les céphalosporines (dont la ceftriaxone) sont inactives sur les entérocoques (résistance naturelle).', [srcEnteroCeph]);
      f.option({ id: 'strepto-c3g', libelle: 'Ceftriaxone', type: 'probabiliste', rang: 'conditionnelle', condition: 'seulement une fois un streptocoque identifié (inactive sur les entérocoques)', items: [{ m: 'ceftriaxone', r: 'ceftriaxone-2g' }], duree, statut: 'brouillon', commentaire: extrapole, sources: [S('ESC-2023-endocardite', 'Recommendation Table 7 (endocardite, extrapolation)', 'penicillin G, amoxicillin, or ceftriaxone', 'choix'), srcEnteroCeph] });
    } else {
      f.option({ id: 'strepto-c3g', libelle: 'Ceftriaxone', type: amox ? 'documente' : 'probabiliste', rang: 'alternative', items: [{ m: 'ceftriaxone', r: 'ceftriaxone-2g' }], duree, statut: 'brouillon', commentaire: extrapole, sources: [S('ESC-2023-endocardite', 'Recommendation Table 7 (endocardite, extrapolation)', 'penicillin G, amoxicillin, or ceftriaxone', 'choix')] });
    }
    if (org === 'streptocoque_viridans' || org === 'streptococcus_gallolyticus' || g === 'cgp_chainettes') {
      f.controle({ id: 'ctl-strepto-ett', type: 'echocardiographie', categorie: 'conditionnel', quoi: 'Échocardiographie (ETT, puis ETO si doute)', quand: { ancre: 'non_determine', texte: 'Pendant l\'hospitalisation (délai non précisé)' }, pourquoi: 'Certaines espèces de streptocoques sont fortement associées à l\'endocardite.', sources: [S('ESC-2023-endocardite', 'Recommendation Table 5 (IIa B)', 'Performing an echocardiography should be considered in S. aureus, E. faecalis, and some Streptococcus spp. bacteraemia', 'imagerie')] });
    }
    if (org === 'streptococcus_gallolyticus') f.controle({ id: 'ctl-gallolyticus-colo', type: 'imagerie', categorie: 'conditionnel', quoi: 'Coloscopie (recherche de néoplasie colique)', quand: { ancre: 'non_determine', texte: 'À programmer (délai non précisé)' }, pourquoi: 'Association S. gallolyticus – néoplasie colique (mention du texte ESC, sans recommandation classée).', sources: [S('ESC-2023-endocardite', 'section 5.4.2 (texte)', 'CT does not replace the specific test indicated for the diagnosis of the extracardiac source of bacteraemia (i.e. colonoscopy in colon neoplasms)', 'imagerie')] });
    f.controle({ id: 'ctl-strepto-hc', type: 'hemoculture', categorie: 'non_systematique', quoi: 'Hémocultures de contrôle', quand: { ancre: 'non_determine', texte: 'Si fièvre persistante ou suspicion d\'endocardite' }, pourquoi: 'Non exigées par les sources lues en l\'absence d\'endocardite.', sources: [S('SRLF-2020-catheters', 'R3.2', undefined, 'controle_micro')] });
    return f.fin();
  },
};

export const R_ENTERO: Regle = {
  id: 'R-BACTERIEMIE-ENTEROCOQUE',
  libelle: 'Bactériémie à entérocoque (hors endocardite)',
  description: 'Durée : SPILF/GPIP 2021 (7 j) ; IDSA 2009 (7-14 j) ; échographie : ESC 2023 ; ETO si persistance : SRLF 2020.',
  statut: 'verifiee_ia',
  priorite: 130,
  sources: [S('SPILF-GPIP-2021-durees', 'diapo 19, 21', undefined, 'duree')],
  sApplique: (ctx) => adulte(ctx) && bacteriemie(ctx) && germePrincipal(ctx).g === 'entero' && ctx.foyer !== 'endocardite' && ctx.foyer !== 'meningite',
  appliquer: (ctx) => {
    const f = new Fiche(ctx, 'verifiee_ia');
    const { prl } = germePrincipal(ctx);
    const org = prl?.organisme;
    const atb = lireAntibiogramme(prl);
    for (const n of atb.notes) f.alerte('info', n.texte, n.sources);
    const amox = atb.sir('amoxicilline');
    const vanco = atb.sir('vancomycine');
    f.situation('bacteriemie-enterocoque', `Bactériémie à ${org === 'enterococcus_faecium' ? 'E. faecium' : org === 'enterococcus_faecalis' ? 'E. faecalis' : 'entérocoque'}`, 'couverte', 'Rechercher la porte d\'entrée (urinaire, digestive, cathéter) et une endocardite (E. faecalis).');
    const duree: DureeDecidee = { texte: '7 jours pour une bactériémie non compliquée (SPILF 2021) ; 7 à 14 jours (IDSA 2009, infection de cathéter) — divergence.', pointDeDepart: 'premier jour de traitement efficace ; après ablation du cathéter et 1re hémoculture négative si cathéter', dureePrevueJours: 7, sources: [S('SPILF-GPIP-2021-durees', 'diapo 19, 21', 'Streptocoque, entérocoque, et bacilles à Gram négatif : 7 jours', 'duree'), S('IDSA-2009-Mermel-ILC', 'rec. 93', 'A 7–14-day course of therapy is recommended', 'duree')] };
    if (atb.meca('ERV') || vanco === 'R') {
      f.plafond('non_couverte').urgence('elevee').avis('Entérocoque résistant aux glycopeptides (ERV/ERG) : avis infectiologique immédiat et mesures BHRe.', true, [S('HCSP-2019-BHRe', 'définitions', 'ERG = E. faecium vanA/vanB', 'definition')]);
      f.ecarter('Vancomycine', 'resistance', 'entérocoque résistant aux glycopeptides (ERV/ERG) : les molécules actives ne sont pas modélisées pour ce germe.', [S('HCSP-2019-BHRe', 'définitions', 'ERG = E. faecium vanA/vanB', 'definition')]);
    } else if (amox === 'R' || (org === 'enterococcus_faecium' && amox === undefined)) {
      f.option({ id: 'entero-vanco', libelle: 'Vancomycine (entérocoque résistant à l\'amoxicilline)', type: amox ? 'documente' : 'probabiliste', rang: 'premiere_ligne', items: [{ m: 'vancomycine', r: 'vancomycine-continu' }], duree, sources: [S('IDSA-2009-Mermel-ILC', 'rec. 91', 'Ampicillin is preferred for susceptible strains; use vancomycin if resistant (A-III)', 'choix')] });
    } else {
      f.option({ id: 'entero-amox', libelle: 'Amoxicilline IV', type: amox ? 'documente' : 'probabiliste', rang: 'premiere_ligne', items: [{ m: 'amoxicilline', r: amox === 'I' ? 'amoxicilline-iv-fort' : 'amoxicilline-iv-std' }], duree, sources: [S('IDSA-2009-Mermel-ILC', 'rec. 91', 'Ampicillin is preferred for susceptible strains', 'choix'), S('SPILF-2026-info-antibio-109', 'IU', 'Enterococcus sp: Amoxicilline', 'choix')] });
      // Audit relecteur 2 : BLOQUÉ (brouillon) — IDSA 2009 rec. 91 vise la résistance à l'ampicilline, pas l'allergie.
      f.option({ id: 'entero-vanco-allergie', libelle: 'Vancomycine (allergie aux pénicillines)', type: 'documente', rang: 'conditionnelle', condition: 'si allergie aux pénicillines', items: [{ m: 'vancomycine', r: 'vancomycine-continu' }], duree, statut: 'brouillon', commentaire: 'IDSA 2009 rec. 91 cite la vancomycine en cas de résistance, pas d\'allergie : indication extrapolée, à valider (avis allergologique).', sources: [S('IDSA-2009-Mermel-ILC', 'rec. 91', 'Ampicillin is preferred for susceptible strains; use vancomycin if resistant (A-III)', 'choix')] });
    }
    if (org !== 'enterococcus_faecium') f.controle({ id: 'ctl-entero-echo', type: 'echocardiographie', categorie: 'conditionnel', quoi: 'Échocardiographie (E. faecalis)', quand: { ancre: 'non_determine', texte: 'Pendant l\'hospitalisation (délai non précisé)' }, pourquoi: 'E. faecalis : risque d\'endocardite.', sources: [S('ESC-2023-endocardite', 'Recommendation Table 5 (IIa B)', 'Performing an echocardiography should be considered in S. aureus, E. faecalis, and some Streptococcus spp. bacteraemia', 'imagerie')] });
    f.controle({ id: 'ctl-entero-eto', type: 'echocardiographie', categorie: 'conditionnel', quoi: 'ETO si bactériémie persistante', quand: { ancre: 'non_determine', texte: 'Si hémocultures toujours positives après 3 jours de traitement adapté' }, pourquoi: 'Persistance à entérocoque.', sources: [S('SRLF-2020-catheters', 'R3.3a', 'ETO in all patients with persistent fungaemia or bacteraemia due to S. aureus or Enterococcus spp.', 'imagerie')] });
    return f.fin();
  },
};

export const REGLES_CGP = [R_SAB, R_SCN, R_STREPTO, R_ENTERO];
