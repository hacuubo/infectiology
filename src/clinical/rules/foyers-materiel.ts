/**
 * Foyers et matériel : endocardite (ESC 2023 + position SPILF/AEPEI), infection de cathéter,
 * infection ostéoarticulaire sur matériel, prothèse valvulaire avec bactériémie non staphylococcique.
 */
import type { Regle } from '../../engine/decider';
import type { SourceRef } from '../types';
import { Fiche, S, adulte, bacteriemie, germePrincipal, lireAntibiogramme, type DureeDecidee } from './outils';

const ESC = 'ESC-2023-endocardite';
const AEPEI = 'SPILF-AEPEI-2025-endocardite';

export const R_ENDOCARDITE: Regle = {
  id: 'R-ENDOCARDITE',
  libelle: 'Endocardite infectieuse suspectée ou confirmée',
  description: 'ESC 2023 (tableaux 5, 7-12, 20) et prise de position SPILF/AEPEI 2025 (arbitrage documenté : la position française est retenue en 1re ligne lorsqu\'elle diverge).',
  statut: 'verifiee_ia',
  priorite: 200,
  sources: [S(ESC, 'EHJ 2023;44:3948-4042', undefined, 'choix'), S(AEPEI, 'diaporama SPILF 12/11/2025', undefined, 'choix')],
  sApplique: (ctx) => adulte(ctx) && ctx.foyer === 'endocardite',
  appliquer: (ctx) => {
    const f = new Fiche(ctx, 'verifiee_ia');
    const p = ctx.dossier.patient;
    const { prl, g } = germePrincipal(ctx);
    const prothese = ctx.protheseValvulaire;
    f.urgence('elevee').situation('endocardite', `Endocardite ${prothese ? 'sur prothèse valvulaire' : 'sur valve native'}${g !== 'aucun' ? '' : ' — germe non identifié'}`, 'couverte', 'Prise en charge par une équipe d\'endocardite (Endocarditis Team) ; chirurgie à discuter selon l\'insuffisance cardiaque, l\'infection non contrôlée et le risque embolique.');
    f.avis('Avis urgent de l\'équipe d\'endocardite (infectiologue, cardiologue, chirurgien cardiaque) ; tout patient nécessitant la réanimation doit être discuté en urgence.', true, [S(ESC, 'section 12.5 (via ACC)', 'Any IE patient requiring ICU admission should be urgently discussed within the Endocarditis Team', 'autre')]);
    f.controle({ id: 'ctl-ei-hc', type: 'hemoculture', categorie: 'indique', quoi: 'Au moins 3 séries d\'hémocultures à 30 min d\'intervalle', quand: { ancre: 'avant_traitement', texte: 'Avant l\'antibiothérapie' }, pourquoi: 'Documentation microbiologique.', sources: [S(ESC, '5.3.1 (EHJ p. 3966)', 'At least three sets of blood cultures should be obtained at 30-minute intervals prior to antibiotic therapy', 'controle_micro')] });
    f.controle({ id: 'ctl-ei-hc-j3', type: 'hemoculture', categorie: 'indique', quoi: 'Hémocultures de contrôle', quand: { ancre: 'debut_traitement', offsetHeures: 72, texte: 'À J3 du traitement, puis jusqu\'à stérilisation', repetition: 'jusqu\'à négativation' }, pourquoi: 'La négativation à J3 conditionne la durée (4 vs 6 semaines, SPILF/AEPEI) ; persistance > 1 semaine : chirurgie à discuter.', sources: [S(AEPEI, 'diapo 14', 'EI cœur gauche : 4 semaines si hémocultures négatives à J3 et apyrexie dès les premiers jours de traitement, 6 semaines sinon', 'controle_micro'), S(ESC, 'Recommendation Table 12 (IIa B)', 'persistently positive blood cultures >1 week or persistent sepsis', 'geste')] });
    f.controle({ id: 'ctl-ei-ett', type: 'echocardiographie', categorie: 'indique', quoi: 'ETT en première intention puis ETO si négative ou non contributive', quand: { ancre: 'avant_traitement', texte: 'Sans délai' }, pourquoi: 'Diagnostic et complications.', ensuite: 'Répéter ETT/ETO à 5-7 jours si suspicion persistante ; ETO avant relais oral ; échographie en fin de traitement.', sources: [S(ESC, 'Recommendation Table 5 (I B, I C)', 'TTE is recommended as the first-line imaging modality ; Repeating TTE and/or TOE within 5-7 days is recommended […] ; TTE and/or TOE are recommended at completion of antibiotic therapy', 'imagerie')] });
    f.geste('Chirurgie : en urgence absolue (< 24 h) si insuffisance cardiaque réfractaire/choc ; urgente (3-5 j) si infection non contrôlée (abcès, faux anévrisme, fistule) ou végétation ≥ 10 mm avec embole ; à discuter si prothèse à S. aureus ou BGN non HACEK.', [S(ESC, 'Recommendation Table 12 (EHJ p. 3991)', 'Emergency, within 24 h. Urgent, within 3-5 days.', 'geste')]);
    if (p.dispositifIntracardiaque === 'oui') f.geste('Dispositif intracardiaque : extraction complète du système sans délai en cas d\'endocardite sur sonde certaine.', [S(ESC, 'Recommendation Table 20 (I C)', 'Complete system extraction without delay is recommended in patients with definite CIED-related IE', 'geste')]);

    const dureeEI = (sem: number, txt: string, src: SourceRef[]): DureeDecidee => ({ texte: txt, pointDeDepart: '1er jour de traitement efficace (1re hémoculture négative) ; nouveau traitement complet seulement si la culture de valve est positive', dureePrevueJours: sem * 7, sources: [...src, S(ESC, '7.1 (EHJ p. 3975)', 'the duration of treatment is based on the first day of effective antibiotic therapy (negative blood culture in the case of initial positive blood culture), not on the day of surgery', 'duree')] });
    const atb = lireAntibiogramme(prl);
    if (g === 'aucun' || g === 'cgp_amas' || g === 'cgp_chainettes') {
      if (!prothese || p.valve === 'inconnu') {
        f.option({ id: 'ei-proba-nve', libelle: 'Amoxicilline + céfazoline (+ gentamicine si sepsis) — valve native ou prothèse tardive', type: 'probabiliste', rang: p.valve === 'inconnu' ? 'conditionnelle' : 'premiere_ligne', condition: p.valve === 'inconnu' ? 'si valve native ou prothèse posée depuis plus de 12 mois' : undefined, items: p.gravite === 'sepsis' || p.gravite === 'choc_septique' ? [{ m: 'amoxicilline', r: 'amoxicilline-iv-fort' }, { m: 'cefazoline', r: 'cefazoline-2g-x3' }, { m: 'gentamicine', r: 'gentamicine-5-ei-proba' }] : [{ m: 'amoxicilline', r: 'amoxicilline-iv-fort' }, { m: 'cefazoline', r: 'cefazoline-2g-x3' }], duree: dureeEI(4, 'À adapter au germe : 4 semaines (valve native) à 6 semaines (prothèse).', []), sources: [S(AEPEI, 'diapo 6', 'Amoxicilline IV (200 mg/kg/jour) + céfazoline IV (100 mg/kg/jour) + (gentamicine IV (5 mg/kg/jour) uniquement chez les patients en sepsis)', 'choix'), S(ESC, 'Recommendation Table 10 (IIa C)', 'ampicillin in combination with (flu)cloxacillin and gentamicin should be considered', 'choix')], commentaire: 'Arbitrage : la position SPILF/AEPEI (céfazoline, gentamicine seulement si sepsis) est retenue ; l\'ESC propose ampicilline + (flu)cloxacilline + gentamicine. Céfazoline affichée à 2 g/8 h ; la SPILF indique 100 mg/kg/j. Gentamicine (si sepsis) : 5 mg/kg/j selon SPILF/AEPEI (corrigé par l\'audit du 2026-11-05 ; l\'ESC indique 3 mg/kg/j).' });
      }
      if (prothese || p.valve === 'inconnu') {
        f.option({ id: 'ei-proba-pve-precoce', libelle: 'Daptomycine (ou vancomycine) + céfépime — prothèse précoce (< 12 mois) ou endocardite associée aux soins', type: 'probabiliste', rang: prothese ? 'premiere_ligne' : 'conditionnelle', condition: 'si prothèse valvulaire posée depuis moins de 12 mois ou endocardite associée aux soins', items: [{ m: 'daptomycine', r: 'daptomycine-10-12' }, { m: 'cefepime', r: 'cefepime-2g8h' }], duree: dureeEI(6, '6 semaines au moins (prothèse), à adapter au germe.', []), sources: [S(AEPEI, 'diapo 7', 'Daptomycine IV (12 mg/kg/jour) ou Vancomycine IV (30 mg/kg/jour, perfusion continue après dose de charge) + céfépime IV (2g IV/8h)', 'choix'), S(ESC, 'Recommendation Table 10 (IIb C)', 'vancomycin or daptomycin combined with gentamicin and rifampin may be considered', 'choix')], commentaire: 'Arbitrage : position SPILF/AEPEI retenue (céfépime) ; l\'ESC propose glycopeptide/daptomycine + gentamicine + rifampicine. La date de pose de la prothèse est nécessaire pour choisir entre schéma précoce et tardif.' });
        if (prothese) f.manque('date de pose de la prothèse valvulaire', 'schéma probabiliste précoce (< 12 mois) ou tardif', 'bloque_decision');
      }
      return f.fin();
    }
    if (g === 's_aureus' || g === 'scn' || g === 's_lugdunensis') {
      const oxa = atb.sir('oxacilline') ?? atb.sir('cefoxitine');
      const sarm = atb.meca('SARM') || oxa === 'R';
      const d = prothese ? dureeEI(6, 'Au moins 6 semaines (prothèse) ; gentamicine jusqu\'à stérilisation des hémocultures (SPILF/AEPEI) ou 2 semaines (ESC) ; rifampicine après stérilisation.', [S(ESC, 'Recommendation Table 8', 'with rifampin for at least 6 weeks and gentamicin for 2 weeks', 'duree'), S(AEPEI, 'diapo 15', 'Gentamicine [jusqu\'à] Hémocultures stériles ; Rifampicine [après] Hémocultures stériles', 'duree')]) : dureeEI(4, '4 semaines si hémocultures négatives à J3 et apyrexie rapide, 6 semaines sinon (SPILF/AEPEI ; ESC : 4-6 semaines).', [S(AEPEI, 'diapo 14', '4 semaines si hémocultures négatives à J3 […], 6 semaines sinon', 'duree'), S(ESC, 'Recommendation Table 8 (I B)', 'for 4-6 weeks', 'duree')]);
      const base = sarm ? [{ m: 'daptomycine', r: 'daptomycine-10-12' }] : [{ m: 'cefazoline', r: 'cefazoline-2g-x3' }];
      const items = prothese ? [...base, { m: 'rifampicine', r: 'rifampicine-900' }, { m: 'gentamicine', r: 'gentamicine-3-synergie' }] : base;
      // Audit relecteur 2 (2026-11-05) : pour le SARM, la daptomycine n'est recommandée qu'EN ASSOCIATION (SPILF/AEPEI :
      // + ceftaroline ou fosfomycine ; ESC 2023 IIb C : + cloxacilline, ceftaroline ou fosfomycine), partenaires absents
      // de la base → option bloquée en brouillon ; la vancomycine (ESC 2023, I B) reste affichée en alternative.
      f.option({ id: 'ei-staph', libelle: `${sarm ? 'Daptomycine (SARM/SERM) — association requise, partenaire non modélisé' : 'Céfazoline ou cloxacilline (SASM)'}${prothese ? ' + rifampicine + gentamicine' : ''}`, type: 'documente', rang: 'premiere_ligne', items, duree: d, statut: sarm ? 'brouillon' : undefined, sources: [S(ESC, 'Recommendation Table 8 (EHJ p. 3980)', undefined, 'choix'), S(AEPEI, 'diapo 13, 15-16', sarm ? 'SARM : « Daptomycine + Ceftaroline Ou Fosfomycine »' : 'Céfazoline Ou (Cl)oxacilline', 'choix')], commentaire: sarm ? 'SPILF/AEPEI : daptomycine 12 mg/kg associée à ceftaroline ou fosfomycine (molécules non présentes dans la base) tant que la bactériémie persiste et au maximum 7 j après la 1re hémoculture négative ; ESC : vancomycine 1re intention.' : 'Cloxacilline équivalente (alternative).' });
      if (!sarm) f.option({ id: 'ei-staph-cloxa', libelle: `Cloxacilline${prothese ? ' + rifampicine + gentamicine' : ''}`, type: 'documente', rang: 'alternative', items: prothese ? [{ m: 'cloxacilline', r: 'cloxacilline-2g-x6' }, { m: 'rifampicine', r: 'rifampicine-900' }, { m: 'gentamicine', r: 'gentamicine-3-synergie' }] : [{ m: 'cloxacilline', r: 'cloxacilline-2g-x6' }], duree: d, sources: [S(ESC, 'Recommendation Table 8', '(Flu)cloxacillin 12 g/day i.v. in 4-6 doses', 'choix')] });
      if (sarm) f.option({ id: 'ei-sarm-vanco', libelle: `Vancomycine${prothese ? ' + rifampicine + gentamicine' : ''} (ESC)`, type: 'documente', rang: 'alternative', items: prothese ? [{ m: 'vancomycine', r: 'vancomycine-continu' }, { m: 'rifampicine', r: 'rifampicine-900' }, { m: 'gentamicine', r: 'gentamicine-3-synergie' }] : [{ m: 'vancomycine', r: 'vancomycine-continu' }], duree: d, sources: [S(ESC, 'Recommendation Table 8 (I B)', 'vancomycin is recommended for 4-6 weeks', 'choix')] });
      return f.fin();
    }
    if (g === 'strepto') {
      const d = dureeEI(prothese ? 6 : 4, prothese ? '6 semaines (prothèse).' : '4 semaines (valve native). Schéma court de 2 semaines avec gentamicine possible selon l\'ESC pour une endocardite native non compliquée, non repris par la SPILF/AEPEI.', [S(ESC, 'Recommendation Table 7 (I B)', 'penicillin G, amoxicillin, or ceftriaxone are recommended for 4 (in NVE) or 6 weeks (in PVE)', 'duree'), S(AEPEI, 'diapo 8-9', '4 semaines pour les EI sur valve native et de 6 semaines sur les EI sur valve prothétique', 'duree')]);
      f.option({ id: 'ei-strepto', libelle: 'Amoxicilline (choix guidé par la CMI)', type: 'documente', rang: 'premiere_ligne', items: [{ m: 'amoxicilline', r: 'amoxicilline-iv-fort' }], duree: d, sources: [S(AEPEI, 'diapo 8-9', 'Les choix thérapeutiques sont basés sur les résultats des CMI de l\'amoxicilline et des C3G ; CMI amox ≤ 0,5 mg/L : Amoxicilline 100 mg/kg/j', 'choix')], commentaire: 'SPILF/AEPEI : 100 mg/kg/j si CMI amoxicilline ≤ 0,5 mg/L ; 200 mg/kg/j + gentamicine si 0,5 < CMI ≤ 2 ; ceftriaxone ou vancomycine si CMI > 2. La CMI est nécessaire pour ajuster la dose affichée (200 mg/kg/j).' });
      f.option({ id: 'ei-strepto-c3g', libelle: 'Ceftriaxone 2 g/j', type: 'documente', rang: 'alternative', items: [{ m: 'ceftriaxone', r: 'ceftriaxone-2g' }], duree: d, sources: [S(ESC, 'Recommendation Table 7', 'Ceftriaxone 2 g/day i.v. in 1 dose', 'choix')] });
      f.manque('CMI de l\'amoxicilline et des C3G', 'dose et association (SPILF/AEPEI)', 'bloque_dose');
      return f.fin();
    }
    if (g === 'entero') {
      const faecium = prl?.organisme === 'enterococcus_faecium' || atb.sir('amoxicilline') === 'R';
      const d = dureeEI(6, '6 semaines.', [S(ESC, 'Recommendation Table 9 (I B)', 'the combination of ampicillin or amoxicillin with ceftriaxone for 6 weeks', 'duree')]);
      if (faecium) f.option({ id: 'ei-faecium', libelle: 'Vancomycine + gentamicine (6 semaines / 2 semaines)', type: 'documente', rang: 'premiere_ligne', items: [{ m: 'vancomycine', r: 'vancomycine-continu' }, { m: 'gentamicine', r: 'gentamicine-3-synergie' }], duree: d, sources: [S(ESC, 'Recommendation Table 9 (I C)', 'vancomycin for 6 weeks combined with gentamicin for 2 weeks', 'choix'), S(AEPEI, 'diapo 10-11', 'E. faecium : « Vancomycine + gentamicine 6S/2S »', 'choix')] });
      else f.option({ id: 'ei-faecalis', libelle: 'Amoxicilline + ceftriaxone (6 semaines)', type: 'documente', rang: 'premiere_ligne', items: [{ m: 'amoxicilline', r: 'amoxicilline-iv-fort' }, { m: 'ceftriaxone', r: 'ceftriaxone-2g12h' }], duree: d, sources: [S(ESC, 'Recommendation Table 9 (I B)', 'ampicillin or amoxicillin with ceftriaxone for 6 weeks or with gentamicin for 2 weeks', 'choix'), S(AEPEI, 'diapo 10-11', 'Amoxicilline + ceftriaxone 6S/6S ; Le schéma amoxicilline + gentamicine n\'est pas retenu dans les EI à Enterococcus faecalis', 'choix')], commentaire: 'Arbitrage : la SPILF/AEPEI ne retient que l\'association amoxicilline + ceftriaxone ; l\'ESC admet aussi amoxicilline + gentamicine 2 semaines.' });
      return f.fin();
    }
    f.avis('Endocardite à BGN ou autre germe : hors schémas modélisés, avis de l\'équipe d\'endocardite.', true, []);
    f.plafond('partielle');
    return f.fin();
  },
};

export const R_ILC: Regle = {
  id: 'R-INFECTION-CATHETER',
  libelle: 'Infection liée au cathéter / matériel vasculaire',
  description: 'IDSA 2009 (Mermel), SRLF 2020, SPILF verrou 2021, SPILF/GPIP 2021, IDSA/ESCMID 2026 (définition du délai différentiel).',
  statut: 'verifiee_ia',
  priorite: 0,
  sources: [S('IDSA-2009-Mermel-ILC', 'rec. 19, 31-33', undefined, 'geste')],
  sApplique: (ctx) => adulte(ctx) && bacteriemie(ctx) && (ctx.foyer === 'catheter' || (ctx.materielVasculairePresent && (ctx.hemocultures[0]?.hemoc?.delaiPositiviteDifferentielHeures ?? 0) >= 2)),
  appliquer: (ctx) => {
    const f = new Fiche(ctx, 'verifiee_ia');
    const { g } = germePrincipal(ctx);
    const h = ctx.hemocultures[0]?.hemoc;
    const dtp = h?.delaiPositiviteDifferentielHeures;
    const srcDtp = [S('IDSA-2009-Mermel-ILC', 'rec. 19 (A-II)', 'growth of microbes from a blood sample drawn from a catheter hub at least 2 h before microbial growth is detected', 'definition'), S('IDSA-ESCMID-2026-SAB', 'Table of Definitions', 'differential time to positivity (DTTP) of at least 120 minutes', 'definition')];
    if (dtp === undefined) f.controle({ id: 'ctl-ilc-dtp', type: 'hemoculture', categorie: 'conditionnel', quoi: 'Hémocultures appariées (cathéter + périphérie, prélevées simultanément, volumes égaux) pour le délai différentiel de positivité', quand: { ancre: 'avant_traitement', texte: 'Avant l\'antibiothérapie si le cathéter est conservé' }, pourquoi: 'Délai différentiel ≥ 2 h en faveur d\'une origine cathéter.', sources: srcDtp });
    else f.alerte(dtp >= 2 ? 'attention' : 'info', dtp >= 2 ? `Délai différentiel de positivité ${dtp} h (≥ 2 h) : en faveur d'une infection liée au cathéter.` : `Délai différentiel ${dtp} h (< 2 h) : n'argumente pas une origine cathéter (critère pris en défaut pour S. aureus et Candida).`, srcDtp);
    const retraitObligatoire = g === 's_aureus' || g === 'bgn' || g === 'entero';
    f.geste(retraitObligatoire ? 'Retrait du cathéter (S. aureus, BGN dont P. aeruginosa, entérocoques sur cathéter de courte durée ; S. aureus et P. aeruginosa aussi sur cathéter de longue durée).' : 'Retrait du cathéter en référence ; pour un cathéter de longue durée (chambre implantable, tunnelisé) et un SCN ou un entérocoque sans complication, un verrou curatif de 10 jours est une option.', [S('IDSA-2009-Mermel-ILC', 'rec. 31-32 (A-II)', 'Short-term catheters should be removed from patients with CRBSI due to gram-negative bacilli, S. aureus, enterococci', 'geste'), S('SPILF-2021-verrou', 'diapo 7, 10', 'Ablation systématique du CIVLD en cas de: Staphylococcus aureus ou Candida spp. ; La durée totale du traitement par verrou est de 10 jours', 'geste')]);
    f.controle({ id: 'ctl-ilc-verrou', type: 'hemoculture', categorie: 'conditionnel', quoi: 'Hémocultures de contrôle sous verrou', quand: { ancre: 'debut_traitement', offsetHeures: 72, texte: 'À J4 et J11 du verrou, puis avant toute réutilisation du cathéter', repetition: 'J4, J11, avant réutilisation' }, pourquoi: 'Échec du verrou si fièvre ou hémocultures positives à partir de J4 : ablation.', ensuite: 'Échec : ablation systématique.', sources: [S('SPILF-2021-verrou', 'diapo 11-13', 'échec : « ≥ J4… fièvre attribuée à l\'ILC et/ou persistance d\'hémoculture(s) positive(s) » → « Echec = ablation systématique »', 'controle_micro')] });
    f.reeval('Durée après ablation et 1re hémoculture négative : SCN 3 j (si apyrexie, sans matériel endovasculaire) ; streptocoque, entérocoque, BGN 7 j ; S. aureus 14 j (thrombophlébite : 21 j). Cathéter conservé avec verrou : 10 j de traitement systémique.', [S('SPILF-GPIP-2021-durees', 'diapo 19-20', 'Staphylococcus aureus : 14 jours (thrombophlébite septique : 21 jours)', 'duree')]);
    f.controle({ id: 'ctl-ilc-persist', type: 'hemoculture', categorie: 'conditionnel', quoi: 'Retrait si hémocultures encore positives à 72 h', quand: { ancre: 'debut_traitement', offsetHeures: 72, texte: 'À 72 h de traitement adapté' }, pourquoi: 'Bactériémie persistante sur cathéter conservé.', sources: [S('IDSA-2009-Mermel-ILC', 'rec. 33', 'retrait si hémocultures positives à 72 h', 'geste')] });
    return f.fin();
  },
};

export const R_IOA_MATERIEL: Regle = {
  id: 'R-IOA-MATERIEL',
  libelle: 'Infection ostéoarticulaire sur matériel (prothèse, ostéosynthèse)',
  description: 'SPILF 2026 (diaporama JNI, publication non localisée), EBJIS 2025, HAS 2014, SPILF 2009.',
  statut: 'verifiee_ia',
  priorite: 120,
  sources: [S('EBJIS-2025-DAIR', 'résumé', undefined, 'geste'), S('HAS-2014-prothese-infection', 'reco2clics', undefined, 'geste')],
  sApplique: (ctx) => adulte(ctx) && (ctx.foyer === 'osteoarticulaire_materiel' || (bacteriemie(ctx) && ctx.dossier.patient.protheseArticulaire === 'oui' && ctx.hemocultures[0]?.signesInfectionMateriel === 'oui')),
  appliquer: (ctx) => {
    const f = new Fiche(ctx, 'verifiee_ia');
    const p = ctx.dossier.patient;
    const grave = p.gravite === 'sepsis' || p.gravite === 'choc_septique';
    if (ctx.foyer === 'osteoarticulaire_materiel' && germePrincipal(ctx).g === 'aucun') f.situation('ioa-materiel', 'Infection ostéoarticulaire sur matériel', 'partielle', 'Prise en charge médico-chirurgicale spécialisée (CRIOAc ou réseau). Le traitement antibiotique dépend des prélèvements peropératoires.');
    f.urgence('elevee').avis('Avis chirurgical orthopédique et infectiologique (CRIOAc ou réseau multidisciplinaire lié au CRIOAc).', true, [S('SPILF-2026-IPA-JNI', 'organisation (C2)', 'sous la condition qu\'il existe un réseau préétabli multidisciplinaire dédié, en lien avec le CRIOAC référent', 'autre'), S('HAS-2014-prothese-infection', 'reco2clics', 'L\'antibiothérapie de l\'infection sur prothèse est du ressort d\'un infectiologue', 'autre')]);
    if (!grave) f.alerte('attention', 'Sans sepsis : différer l\'antibiothérapie jusqu\'aux prélèvements (ponction, prélèvements peropératoires), pour ne pas compromettre la documentation.', [S('EBJIS-2025-DAIR', 'résumé', 'In patients without sepsis or septic shock, antimicrobial treatment should be withheld until tissue sampling is completed', 'choix')]);
    f.controle({ id: 'ctl-ioa-pop', type: 'prelevement', categorie: 'indique', quoi: 'Prélèvements peropératoires multiples (au moins 4) ; ponction articulaire préopératoire', quand: { ancre: 'avant_traitement', texte: 'Avant toute antibiothérapie si l\'état le permet' }, pourquoi: 'Documentation de l\'infection sur matériel.', sources: [S('SPILF-2026-IPA-JNI', 'diagnostic (B2)', 'Il est recommandé de réaliser quatre prélèvements peropératoires (B2)', 'controle_micro')] });
    f.geste('Infection aiguë (≤ 4 semaines après la pose ou < 3 semaines de symptômes) : synovectomie-lavage avec changement des pièces mobiles (SYLAC/DAIR) ; chronique : changement de prothèse (1 ou 2 temps).', [S('EBJIS-2025-DAIR', 'indications', 'an acute infection including early acute (≤ 4 weeks after index arthroplasty) and late acute infections (< 3 weeks of symptoms', 'geste'), S('SPILF-2026-IPA-JNI', 'chirurgie', 'SYLAC (SYnovectomie, LAvage et Changement de pièces intermédiaires)', 'geste')]);
    if (grave) f.option({ id: 'ioa-proba', libelle: 'Daptomycine + pipéracilline-tazobactam (ou céfépime), après prélèvements', type: 'probabiliste', rang: 'premiere_ligne', items: [{ m: 'daptomycine', r: 'daptomycine-10-12' }, { m: 'piperacilline_tazobactam', r: 'piptazo-4g6h-prolongee' }], duree: { texte: '12 semaines après SYLAC ou changement en 1 temps (8 semaines possibles pour un staphylocoque traité tôt par lévofloxacine-rifampicine ; 6 semaines envisagées après un changement en 1 temps optimal).', pointDeDepart: 'chirurgie', dureePrevueJours: 84, sources: [S('SPILF-2026-IPA-JNI', 'durées', 'Maintien des implants pour IPP aiguë (SYLAC) : 12 semaines (A1)', 'duree'), S('EBJIS-2025-DAIR', 'résumé', 'A total antibiotic duration of 12 weeks after DAIR', 'duree')] }, statut: 'brouillon', sources: [S('SPILF-2026-IPA-JNI', 'antibiothérapie probabiliste', '1re intention « Daptomycine » + « Pipéracilline-Tazobactam ou Céfépime »', 'choix')], commentaire: 'Source SPILF 2026 au statut incertain (publication finale non localisée) : règle en brouillon. Dose de daptomycine non précisée par la source.' });
    return f.fin();
  },
};

export const R_VALVE_BACTERIEMIE: Regle = {
  id: 'R-MATERIEL-INTRACARDIAQUE-BACTERIEMIE',
  libelle: 'Prothèse valvulaire ou dispositif intracardiaque et bactériémie (hors S. aureus)',
  description: 'SRLF 2020 R3.3b ; ESC 2023 (tableaux 12 et 20).',
  statut: 'verifiee_ia',
  priorite: 0,
  sources: [S('SRLF-2020-catheters', 'R3.3b', undefined, 'imagerie')],
  sApplique: (ctx) => adulte(ctx) && bacteriemie(ctx) && ctx.foyer !== 'endocardite' && (ctx.protheseValvulaire || ctx.dossier.patient.dispositifIntracardiaque === 'oui') && !['s_aureus', 'cgp_amas', 'scn'].includes(germePrincipal(ctx).g),
  appliquer: (ctx) => {
    const f = new Fiche(ctx, 'verifiee_ia').plafond('partielle').urgence('elevee');
    const { g } = germePrincipal(ctx);
    f.alerte('attention', 'Prothèse valvulaire ou dispositif intracardiaque : patient à risque d\'endocardite ; une endocardite à BGN sur prothèse relève d\'une discussion chirurgicale.', [S('ESC-2023-endocardite', 'Recommendation Table 12 (IIa C)', 'PVE caused by S. aureus or non-HACEK Gram-negative bacteria', 'geste')]);
    f.controle({ id: 'ctl-valve-eto', type: 'echocardiographie', categorie: 'conditionnel', quoi: 'ETT puis ETO', quand: { ancre: 'non_determine', texte: g === 'bgn' ? 'Si bactériémie persistante, absence de foyer évident ou rechute' : 'Pendant l\'hospitalisation' }, pourquoi: 'ETO suggérée en cas de bactériémie persistante, quel que soit le germe, chez les patients à risque d\'endocardite.', ensuite: 'Endocardite : choisir le foyer « Endocardite ».', sources: [S('SRLF-2020-catheters', 'R3.3b (info-antibio 2019)', 'quel que soit le micro-organisme (R3.3b), chez les patients à risque d\'endocardite', 'imagerie')] });
    f.controle({ id: 'ctl-valve-hc', type: 'hemoculture', categorie: 'conditionnel', quoi: 'Hémocultures de contrôle', quand: { ancre: 'debut_traitement', offsetHeures: 72, texte: 'À 72 h si fièvre persistante ou absence de foyer contrôlé' }, pourquoi: 'Détecter une bactériémie persistante (≥ 3 jours sous traitement adapté), qui oriente vers une endocardite.', sources: [S('SRLF-2020-catheters', 'info-antibio 2019', 'La persistance d\'HC positives après 3j de traitement bien conduit définit une bactériémie (fongémie) persistante', 'controle_micro')] });
    f.avis('Avis infectiologique (et cardiologique si suspicion d\'endocardite) : matériel intracardiaque et bactériémie.', false, [S('SPILF-2021-verrou', 'matériel', 'La présence de matériel prothétique nécessite un avis infectiologique', 'autre')]);
    if (ctx.dossier.patient.dispositifIntracardiaque === 'oui') f.alerte('info', 'Dispositif intracardiaque : ne pas retirer le dispositif après une seule hémoculture positive sans autre argument.', [S('ESC-2023-endocardite', 'Recommendation Table 20 (III C)', 'Removal of CIED after a single positive blood culture, with no other clinical evidence of infection, is not recommended', 'geste')]);
    return f.fin();
  },
};

export const REGLES_FOYERS = [R_ENDOCARDITE, R_ILC, R_IOA_MATERIEL, R_VALVE_BACTERIEMIE];
