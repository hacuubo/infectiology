/**
 * Bacilles à Gram négatif : infections urinaires fébriles (avec ou sans bactériémie)
 * et bactériémies à BGN hors foyer urinaire.
 */
import type { Regle } from '../../engine/decider';
import type { ContexteDecision } from '../../engine/contexte';
import type { OptionTherapeutique, Prelevement, SourceRef } from '../types';
import { Fiche, S, adulte, bacteriemie, germePrincipal, lireAntibiogramme, utilisable, type DureeDecidee } from './outils';

/* ------------------------------------------------------------------ */
/* Choix documenté sur antibiogramme                                   */
/* ------------------------------------------------------------------ */

function documenterBGN(f: Fiche, prl: Prelevement, site: 'urinaire' | 'autre', grave: boolean, duree: DureeDecidee) {
  const atb = lireAntibiogramme(prl);
  for (const n of atb.notes) f.alerte('info', n.texte, n.sources);
  const s = atb.sir;
  const org = prl.organisme;
  const doc = 'documente' as const;

  if (atb.meca('carbapenemase')) {
    f.plafond('non_couverte').urgence('elevee').alerte('urgence', 'Entérobactérie productrice de carbapénémase : hors périmètre ; avis infectiologique immédiat (nouvelles associations réservées) et mesures BHRe.', [S('SPILF-2023-BGN-MDR-diapo', 'diapo 11', 'OXA 48… : Ceftazidime-avibactam est recommandé', 'choix'), S('HCSP-2019-BHRe', 'définitions', undefined, 'definition')]);
    f.avis('Avis infectiologique immédiat (EPC) et équipe d\'hygiène.', true, [S('HCSP-2019-BHRe', 'définitions', undefined, 'definition')]);
    return;
  }
  if (org === 'pseudomonas_aeruginosa') {
    f.plafond('partielle').avis('P. aeruginosa : avis infectiologique (forte posologie uniquement, STP du céfépime).', false, [S('SPILF-SFPT-CASFM-2026-posologies', 'Annexe 9 (céfépime)', 'Pseudomonas spp. et Acinetobacter spp. : forte posologie uniquement', 'posologie')]);
    if (utilisable(s('piperacilline_tazobactam'))) f.option({ id: 'doc-pa-piptazo', libelle: 'Pipéracilline-tazobactam forte posologie', type: doc, rang: 'premiere_ligne', items: [{ m: 'piperacilline_tazobactam', r: 'piptazo-4g6h-prolongee' }], duree, sources: [S('SPILF-SFPT-CASFM-2026-posologies', 'Annexe 9 (pipéracilline-tazobactam)', 'Pseudomonas spp. […] forte posologie uniquement', 'posologie')] });
    if (utilisable(s('cefepime'))) f.option({ id: 'doc-pa-cefepime', libelle: 'Céfépime forte posologie (avec STP)', type: doc, rang: utilisable(s('piperacilline_tazobactam')) ? 'alternative' : 'premiere_ligne', items: [{ m: 'cefepime', r: 'cefepime-2g8h' }], duree, sources: [S('SPILF-SFPT-CASFM-2026-posologies', 'Annexe 9 (céfépime)', 'forte posologie « et nécessite un suivi thérapeutique pharmacologique »', 'posologie')] });
    if (utilisable(s('ciprofloxacine')) && site === 'urinaire') f.option({ id: 'doc-pa-cipro', libelle: 'Ciprofloxacine (relais, si S)', type: doc, rang: 'alternative', condition: 'relais oral après amélioration', items: [{ m: 'ciprofloxacine', r: 'cipro-po-500x2' }], duree, sources: [S('SPILF-AFU-SF2H-2015-IUAS', 'R.49', 'P. aeruginosa « piperacilline-tazobactam, ceftazidime, ciprofloxacine »', 'choix')] });
    return;
  }
  if (atb.meca('cephalosporinase_dereprimee') || org === 'enterobacter_cloacae') {
    const ok = utilisable(s('cefepime'));
    f.alerte('info', 'Entérobactérie du groupe 3 (céphalosporinase inductible/déréprimée) : monothérapie par C3G ou pipéracilline-tazobactam déconseillée ; céfépime privilégié.', [S('CASFM-2026-V1.0', 'ch. 5.1 (groupe 3)', 'privilégier l\'utilisation des céphalosporines de 4e génération (céfépime)', 'choix'), S('SPILF-2023-BGN-MDR-diapo', 'diapo 10', 'Céfépime est le traitement de référence', 'choix')]);
    if (ok) f.option({ id: 'doc-ampc-cefepime', libelle: 'Céfépime', type: doc, rang: 'premiere_ligne', items: [{ m: 'cefepime', r: 'cefepime-2g8h' }], duree, sources: [S('SPILF-2023-BGN-MDR-diapo', 'diapo 10', 'Céfépime est le traitement de référence', 'choix')] });
    else f.avis('Céfépime non utilisable : avis infectiologique.', true, []);
    relaisOral(f, s, site, duree, !ok);
    return;
  }
  if (atb.meca('BLSE')) {
    if (grave || site === 'autre') {
      const meroForte = s('meropeneme') === 'I';
      f.option({ id: 'doc-blse-carba', libelle: 'Carbapénème (méropénème)', type: doc, rang: 'premiere_ligne', items: [{ m: 'meropeneme', r: meroForte ? 'meropeneme-2g8h' : 'meropeneme-1g8h' }], duree, sources: [S('SPILF-2023-BGN-MDR-diapo', grave ? 'diapo 5' : 'diapo 6', grave ? 'Carbapénème: Imipénème ou Méropénème' : 'infections autres qu\'urinaires/biliaires : Carbapénème : imipénème ou méropénème', 'choix')], commentaire: 'Désescalade de bonne pratique dès qu\'il n\'y a plus de risque vital (pipéracilline-tazobactam si CMI ≤ 8 mg/L, FQ, cotrimoxazole…).' });
      if (site === 'urinaire') blseUrinaireNonGrave(f, s, org, duree, 'alternative');
    } else {
      blseUrinaireNonGrave(f, s, org, duree, 'premiere_ligne');
    }
    relaisOral(f, s, site, duree, false, true);
    return;
  }
  // Cas général (pas de mécanisme particulier)
  let premiere = true;
  const rang = () => {
    const r = premiere ? ('premiere_ligne' as const) : ('alternative' as const);
    premiere = false;
    return r;
  };
  const amox = s('amoxicilline');
  if (utilisable(amox)) {
    f.option({ id: 'doc-amox-iv', libelle: `Amoxicilline IV${amox === 'I' ? ' (forte posologie : souche I)' : ''}`, type: doc, rang: rang(), items: [{ m: 'amoxicilline', r: amox === 'I' ? 'amoxicilline-iv-fort' : 'amoxicilline-iv-std' }], duree, sources: [S('SPILF-2015-IU', 'p. 19', 'amoxicilline (à privilégier sur souche sensible)', 'choix'), S('SPILF-SFPT-CASFM-2026-posologies', 'Annexe 9 (amoxicilline)', undefined, 'posologie')], commentaire: 'Spectre le plus étroit actif.' });
  }
  const c3g = s('ceftriaxone') ?? s('cefotaxime');
  if (utilisable(c3g)) {
    f.option({ id: 'doc-c3g', libelle: `C3G (ceftriaxone)${c3g === 'I' ? ' — forte posologie (souche I)' : ''}`, type: doc, rang: rang(), items: [{ m: 'ceftriaxone', r: c3g === 'I' || grave || site === 'autre' ? 'ceftriaxone-2g' : 'ceftriaxone-1g' }], duree, sources: [S('SPILF-2018-IU-Caron', 'p. 336', 'injectable 3GCs should be preferred', 'choix'), S('SPILF-AFU-SF2H-2015-IUAS', 'R.49', 'Entérobactéries : amoxicilline, amoxicilline-acide clavulanique, cotrimoxazole, fluoroquinolones, cefotaxime, ceftriaxone', 'choix')] });
  }
  if (!utilisable(amox) && !utilisable(c3g)) {
    f.avis('Aucune bêta-lactamine de référence rendue S/I : avis infectiologique.', true, []);
    f.plafond('partielle');
  }
  relaisOral(f, s, site, duree, false);
}

function blseUrinaireNonGrave(f: Fiche, s: (d: string) => 'S' | 'I' | 'R' | undefined, org: string | undefined, duree: DureeDecidee, rang0: 'premiere_ligne' | 'alternative') {
  const src: SourceRef[] = [S('SPILF-2026-IUM', 'diapo 17, 24', 'BLSE 1er choix « céfoxitine IV 6 g/jour (seulement si E. coli ou Proteus) OU pipéracilline-tazobactam IV 12 g/jour OU témocilline IV 6 g/jour »', 'choix'), S('SPILF-2023-BGN-MDR-diapo', 'diapo 6', 'IU bactériémiques ou non après contrôle de la source : Cotrimoxazole, Fluoroquinolone, Pipéracilline-tazobactam, Témocilline, Céfoxitine uniquement pour E. coli producteur de BLSE… Amikacine', 'choix')];
  let rang = rang0;
  const next = () => {
    const r = rang;
    rang = 'alternative';
    return r;
  };
  if (utilisable(s('temocilline'))) f.option({ id: 'doc-blse-temo', libelle: 'Témocilline (BLSE, foyer urinaire)', type: 'documente', rang: next(), items: [{ m: 'temocilline', r: 'temocilline-2g8h' }], duree, sources: src });
  if (utilisable(s('piperacilline_tazobactam'))) f.option({ id: 'doc-blse-piptazo', libelle: 'Pipéracilline-tazobactam (BLSE, foyer urinaire)', type: 'documente', rang: next(), items: [{ m: 'piperacilline_tazobactam', r: 'piptazo-4g8h' }], duree, sources: src });
  if ((org === 'escherichia_coli' || org === 'proteus_mirabilis') && utilisable(s('cefoxitine'))) f.option({ id: 'doc-blse-cefoxitine', libelle: 'Céfoxitine (E. coli / Proteus BLSE)', type: 'documente', rang: next(), items: [{ m: 'cefoxitine', r: 'cefoxitine-6g' }], duree, sources: src });
  if (rang === rang0) {
    f.option({ id: 'doc-blse-carba-defaut', libelle: 'Carbapénème (à défaut d\'alternative)', type: 'documente', rang: next(), items: [{ m: 'meropeneme', r: 'meropeneme-1g8h' }], duree, sources: [S('SPILF-2026-IUM', 'diapo 17', 'à défaut « ertapénème IV 1 g/jour OU imipénème IV 3 g/jour OU méropénème IV 3 g/jour »', 'choix')] });
  }
}

function relaisOral(f: Fiche, s: (d: string) => 'S' | 'I' | 'R' | undefined, site: 'urinaire' | 'autre', duree: DureeDecidee, premierSiAucun: boolean, blse = false) {
  if (site !== 'urinaire') {
    f.reeval('Relais oral hors foyer urinaire : à discuter avec le SMIT (cotrimoxazole, fluoroquinolone, amoxicilline-clavulanate cités pour les foyers urinaires et biliaires par SPILF 2023).', [S('SPILF-2023-BGN-MDR-diapo', 'diapo 6-7', undefined, 'choix')]);
    return;
  }
  const src26 = S('SPILF-2026-IUM', 'diapo 23-24', 'Amoxicilline 1 gx3/jour ; Sulfaméthoxazole-triméthoprime 800/160 mg 1 cpx2/jour ; Amoxicilline-acide clavulanique 1 gx3/jour ; Ciprofloxacine… ; Céfixime 200 mgx2/jour', 'choix');
  const srcHas = S('HAS-2021-PNA-femme', 'tableau relais', undefined, 'choix');
  const cond = 'relais oral après amélioration clinique (apyrexie, prise orale possible), sur souche sensible';
  let rang: 'premiere_ligne' | 'alternative' = premierSiAucun ? 'premiere_ligne' : 'alternative';
  const r = () => {
    const x = rang;
    rang = 'alternative';
    return x;
  };
  if (!blse && utilisable(s('amoxicilline'))) f.option({ id: 'relais-amox', libelle: 'Relais : amoxicilline per os', type: 'documente', rang: r(), condition: cond, items: [{ m: 'amoxicilline', r: 'amoxicilline-po-1g8h' }], duree, sources: [src26, srcHas] });
  if (utilisable(s('cotrimoxazole'))) f.option({ id: 'relais-smx', libelle: 'Relais : cotrimoxazole', type: 'documente', rang: r(), condition: cond, items: [{ m: 'cotrimoxazole', r: 'smx-tmp-800-160-x2' }], duree, sources: [src26, srcHas] });
  if (!blse && utilisable(s('amoxicilline_clavulanate'))) f.option({ id: 'relais-amoxclav', libelle: 'Relais : amoxicilline-acide clavulanique per os', type: 'documente', rang: r(), condition: cond, items: [{ m: 'amoxicilline_clavulanate', r: 'amoxclav-po-1g8h' }], duree, sources: [src26, srcHas] });
  const cipro = s('ciprofloxacine');
  if (utilisable(cipro)) f.option({ id: 'relais-cipro', libelle: `Relais : ciprofloxacine${cipro === 'I' ? ' (souche I : forte posologie, monothérapie prudente)' : ''}`, type: 'documente', rang: r(), condition: cond, items: [{ m: 'ciprofloxacine', r: 'cipro-po-500x2' }], duree, sources: [src26, S('SPILF-SFPT-CASFM-2026-posologies', 'Annexe 9 (fluoroquinolones)', 'Dans les situations pour lesquelles la souche est catégorisée "SFP", l\'utilisation en monothérapie des fluoroquinolones doit être prudente.', 'choix')] });
  if (!blse && utilisable(s('cefixime'))) f.option({ id: 'relais-cefixime', libelle: 'Relais : céfixime (dernier choix)', type: 'documente', rang: r(), condition: cond, items: [{ m: 'cefixime', r: 'cefixime-200x2' }], duree, sources: [src26] });
}

/* ------------------------------------------------------------------ */
/* Infections urinaires fébriles                                       */
/* ------------------------------------------------------------------ */

type Cadre = 'homme_spilf2026' | 'femme_spilf2015' | 'iuas';

function cadreIU(ctx: ContexteDecision): Cadre {
  const p = ctx.dossier.patient;
  const sonde = !['aucun', 'inconnu'].includes(p.materielUrinaire);
  if (sonde || p.contexte === 'associe_aux_soins') return 'iuas';
  if (p.sexe === 'homme' && p.immunodepression !== 'oui') return 'homme_spilf2026';
  return 'femme_spilf2015';
}

function dureeIU(ctx: ContexteDecision, cadre: Cadre): DureeDecidee {
  const p = ctx.dossier.patient;
  if (cadre === 'iuas') {
    return { texte: 'Pyélonéphrite associée aux soins : 10 jours ; prostatite : 14 jours ; cystite : 5 à 7 jours. La bactériémie n\'impose pas de prolongation.', pointDeDepart: 'premier jour d\'antibiothérapie active', dureePrevueJours: 10, sources: [S('SPILF-AFU-SF2H-2015-IUAS', 'R.51-R.54, p. 33-34', 'traiter 10 jours les pyélonéphrites ou orchi-épididymites associées aux soins (B-III) ; traiter 14 jours les prostatites associées aux soins (B-III)', 'duree'), S('EAU-2026-urological-infections', '3.7.3.a.4', 'Routine extension of therapy duration is unnecessary in cases of uncomplicated bacteremia', 'duree')] };
  }
  if (cadre === 'homme_spilf2026') {
    return { texte: 'PNA masculine : 7 jours si bêta-lactamine parentérale, fluoroquinolone ou cotrimoxazole ; 10 jours avec une autre molécule ; 5 jours si amikacine seule. Prostatite : 14 jours. Le 21 jours n\'est plus recommandé.', pointDeDepart: 'premier jour d\'antibiothérapie active', dureePrevueJours: 14, sources: [S('SPILF-2026-IUM', 'diapo 18, 25', '7 jours : si traitement par béta-lactamine parentérale et/ou fluoroquinolone et/ou sulfaméthoxazole-triméthoprime ; 10 jours : si autre(s) antibiotique(s) utilisé(s) ; Prostatite : 14 jours', 'duree'), S('EAU-2026-urological-infections', '3.6.3', 'a minimum treatment duration of two weeks is recommended (divergence)', 'duree')] };
  }
  const risque = p.age !== undefined && p.age > 75;
  return {
    texte: risque || p.gravite === 'sepsis' || p.gravite === 'choc_septique'
      ? 'PNA à risque de complication ou grave : 10 jours si souche sensible et évolution rapidement favorable (10 à 14 jours selon SPILF 2015). La bactériémie à entérobactérie ne modifie ni le choix ni la durée.'
      : 'PNA simple : 7 jours si fluoroquinolone ou bêta-lactamine injectable poursuivie ; 10 jours avec les autres molécules ; 5 jours si aminoside seul.',
    pointDeDepart: 'premier jour d\'antibiothérapie active',
    dureePrevueJours: 10,
    sources: [S('SPILF-2018-IU-Caron', 'p. 335-337', 'Treatment duration for APN at risk of complication is 10 to 14 days […] 10 days are enough when the causative agent is susceptible… and… rapidly favorable outcome ; The overall treatment duration is 10 days', 'duree'), S('SPILF-2015-IU', 'p. 18, 20-22', 'La présence d\'une bactériémie à entérobactérie ne modifie ni le pronostic, ni le choix et la durée du traitement antibiotique (IV-C)', 'duree'), S('HAS-2021-PNA-femme', 'durée', 'pour une durée de 10 jours si l\'évolution est rapidement favorable', 'duree')],
  };
}

export const R_IU_FEBRILE: Regle = {
  id: 'R-IU-FEBRILE',
  libelle: 'Infection urinaire fébrile (pyélonéphrite, IU masculine, IU associée aux soins), avec ou sans bactériémie',
  description: 'SPILF 2015/2018 (femme), SPILF 2026 (homme), SPILF/AFU/SF2H 2015 (IUAS), HAS 2021, EAU 2026.',
  statut: 'verifiee_ia',
  priorite: 140,
  sources: [S('SPILF-2015-IU', 'texte court 2015', undefined, 'choix'), S('SPILF-2026-IUM', 'diaporama 20/06/2026', undefined, 'choix'), S('SPILF-AFU-SF2H-2015-IUAS', 'RPC 2015', undefined, 'choix')],
  sApplique: (ctx) => {
    if (!adulte(ctx) || ctx.foyer !== 'urinaire') return false;
    const g = germePrincipal(ctx).g;
    return g === 'aucun' || g === 'bgn';
  },
  appliquer: (ctx) => {
    const f = new Fiche(ctx, 'verifiee_ia');
    const p = ctx.dossier.patient;
    const cadre = cadreIU(ctx);
    const duree = dureeIU(ctx, cadre);
    const { prl } = germePrincipal(ctx);
    const grave = p.gravite === 'sepsis' || p.gravite === 'choc_septique';
    const choc = p.gravite === 'choc_septique';
    const libCadre = { homme_spilf2026: 'IU masculine fébrile (SPILF 2026)', femme_spilf2015: 'Pyélonéphrite aiguë (SPILF 2015/2018)', iuas: 'IU associée aux soins / sur matériel (SPILF/AFU/SF2H 2015)' }[cadre];
    f.situation('iu-febrile', `${libCadre}${bacteriemie(ctx) ? ' avec bactériémie à BGN' : ''}`, 'couverte', `${p.age !== undefined && p.age > 75 ? 'Patient de plus de 75 ans : IU à risque de complication. ' : ''}${grave ? 'Forme grave (sepsis/choc). ' : ''}La bactériémie ne modifie ni le choix ni la durée lorsque l\'évolution est simple.`);
    if (p.sexe === 'inconnu') f.manque('sexe', 'cadre IU masculine (SPILF 2026) ou féminine (SPILF 2015)', 'bloque_decision');
    if (p.materielUrinaire === 'inconnu') f.manque('matériel urinaire (sonde, JJ, néphrostomie)', 'cadre IU associée aux soins, changement de sonde', 'bloque_decision');

    // Contrôles et imagerie
    f.controle({ id: 'ctl-iu-ecbu', type: 'prelevement', categorie: 'indique', quoi: 'ECBU avant toute antibiothérapie', quand: { ancre: 'avant_traitement', texte: 'Maintenant, avant la 1re dose' }, pourquoi: 'Documentation et antibiogramme.', sources: [S('SPILF-2026-IUM', 'diapo 6', 'ECBU avant tout traitement ; Bandelette urinaire Non recommandée', 'controle_micro'), S('HAS-2021-PNA-femme', 'Examens', 'ECBU systématique', 'controle_micro')] });
    if (grave || bacteriemie(ctx)) f.controle({ id: 'ctl-iu-hc', type: 'hemoculture', categorie: 'indique', quoi: 'Hémocultures avant antibiothérapie', quand: { ancre: 'avant_traitement', texte: 'Maintenant, avant la 1re dose (sans la retarder)' }, pourquoi: 'Systématiques dans la PNA grave.', sources: [S('SPILF-2015-IU', 'p. 22-23', 'Les hémocultures sont systématiques (IV-C).', 'controle_micro')] });
    f.controle({ id: 'ctl-iu-hc-controle', type: 'hemoculture', categorie: 'non_systematique', quoi: 'Hémocultures de contrôle', quand: { ancre: 'non_determine', texte: 'Non systématiques : seulement en cas d\'évolution défavorable ou de persistance de la fièvre' }, pourquoi: 'Aucune recommandation lue ne les exige pour une bactériémie à entérobactérie d\'origine urinaire d\'évolution favorable.', sources: [S('SRLF-2020-catheters', 'R3.2', 'contrôle seulement si persistance', 'controle_micro'), S('EAU-2026-urological-infections', '3.7.2.d', 'Blood cultures are indicated for patients presenting with sepsis or severe illness or when Staphylococcus aureus is isolated from the urine.', 'controle_micro')] });
    f.controle({ id: 'ctl-iu-ecbu-controle', type: 'prelevement', categorie: 'non_systematique', quoi: 'ECBU de contrôle sous ou après traitement', quand: { ancre: 'non_determine', texte: 'Non recommandé si évolution favorable ; indiqué si échec clinique à 72 h (ou PNA sur lithiase après traitement)' }, pourquoi: 'Absence de bénéfice démontré.', sources: [S('SPILF-2015-IU', 'p. 20-22', 'Il est recommandé de ne pas prévoir d\'ECBU de contrôle sous et après traitement (II-B).', 'controle_micro'), S('SPILF-AFU-SF2H-2015-IUAS', 'R.55', 'ne pas réaliser un ECBU de contrôle 48-72 heures après le début d\'un traitement sauf en cas de non réponse clinique', 'controle_micro')] });
    const risque = (p.age !== undefined && p.age > 75) || cadre !== 'femme_spilf2015' || grave;
    if (cadre === 'homme_spilf2026') {
      f.controle({ id: 'ctl-iu-scanner-h', type: 'imagerie', categorie: 'indique', quoi: 'Scanner abdomino-pelvien injecté (PNA masculine) — en urgence si sepsis, douleur non contrôlée, obstacle, matériel endo-urétéral ou IRA', quand: grave ? { ancre: 'avant_traitement', texte: 'En urgence' } : { ancre: 'debut_traitement', offsetHeures: 48, texte: 'Dans les 48-72 h' }, pourquoi: 'Rechercher une uropathie ou un obstacle. Attention à la fonction rénale (produit de contraste).', sources: [S('SPILF-2026-IUM', 'diapo 20', 'Scanner abdomino-pelvien injecté systématique dans les 48-72h pour rechercher une uropathie', 'imagerie')] });
    } else if (risque) {
      f.controle({ id: 'ctl-iu-uroscanner', type: 'imagerie', categorie: 'indique', quoi: 'Uroscanner (échographie si contre-indication, notamment insuffisance rénale)', quand: { ancre: 'avant_traitement', offsetHeures: 24, texte: 'Le plus souvent en urgence, au plus tard dans les 24 h' }, pourquoi: 'PNA à risque de complication ou grave : rechercher un obstacle ou un abcès.', ensuite: 'Obstacle : drainage en urgence.', sources: [S('SPILF-2015-IU', 'p. 21-23', 'Un uroscanner est indiqué, le plus souvent en urgence, et au plus tard dans les 24h (IV-C).', 'imagerie')] });
    }
    f.geste('Lever tout obstacle (drainage chirurgical ou interventionnel en urgence) ; exclure une rétention aiguë d\'urine (échographie/bladder scan au lit, surtout chez le sujet âgé).', [S('SPILF-2015-IU', 'p. 22-23', 'drainage chirurgical ou interventionnel en urgence en cas d\'obstacle', 'geste'), S('SPILF-2018-IU-Caron', 'p. 335', 'acute urinary retention should be excluded using portable ultrasound devices at bedside (especially in elderly subjects)', 'geste')]);
    if (!['aucun', 'inconnu'].includes(p.materielUrinaire)) {
      f.geste('Sonde urinaire : la retirer, ou la changer si le drainage reste indispensable. Moment : 24 h après le début de l\'antibiothérapie (IUAS 2015) — divergence : EAU 2026 recommande de la remplacer avant de débuter l\'antibiothérapie.', [S('SPILF-AFU-SF2H-2015-IUAS', 'R.56-R.57', 'Il est recommandé d\'effectuer ce changement de la sonde urinaire 24h après le début de l\'antibiothérapie (B-III).', 'geste'), S('EAU-2026-urological-infections', '3.8.4', 'Replace or remove the indwelling catheter before starting antimicrobial therapy. (Strong)', 'geste')]);
    }
    if (cadre === 'homme_spilf2026') f.avis('Consultation d\'urologie après une PNA masculine ; échographie des voies urinaires avec résidu post-mictionnel dès le 1er épisode.', false, [S('SPILF-2026-IUM', 'diapo 36-38', 'consultation urologie si « Pyélonéphrite aiguë… »', 'autre')]);

    // Documenté
    if (prl && prl.stade === 'antibiogramme' && (prl.antibiogramme?.length ?? 0) > 0) {
      documenterBGN(f, prl, 'urinaire', grave, duree);
      return f.fin();
    }
    if (prl && prl.stade === 'identification') f.alerte('info', 'Identification sans antibiogramme : traitement probabiliste à poursuivre, adaptation dès l\'antibiogramme.');

    // Probabiliste
    const proba = 'probabiliste' as const;
    const atcdBLSE = p.antecedentsMicro.some((a) => a.resistance === 'BLSE' || a.resistance === 'EPC');
    const fdrC3GR = ctx.risqueBLSE.present;
    const srcGrave: SourceRef[] = cadre === 'homme_spilf2026'
      ? [S('SPILF-2026-IUM', 'diapo 15, 22', 'Céfotaxime IV 6 g/jour OU ceftriaxone IV 2 g/jour ET amikacine IV 30 mg/kg, dose unique', 'choix')]
      : cadre === 'iuas'
        ? [S('SPILF-AFU-SF2H-2015-IUAS', 'R.47', 'En cas de sepsis grave ou de choc septique… : Cas général : ajouter l\'amikacine.', 'choix')]
        : [S('SPILF-2015-IU', 'p. 22-23', 'Une association C3G parentérale + amikacine est recommandée en première intention (IV-C).', 'choix'), S('SPILF-2018-IU-Caron', 'p. 336-337', 'must receive a 3GC (cefotaxime or ceftriaxone) associated with amikacin', 'choix')];
    const srcChoc: SourceRef[] = [S('SPILF-2026-IUM', 'diapo 15, 22', 'choc septique avec ≥ 1 FdR « Imipénème IV 3 g/jour OU méropénème IV 6 g/jour ET amikacine IV 30 mg/kg, dose unique »', 'choix'), S('SPILF-2015-IU', 'p. 23', 'En cas de choc septique, avec au moins un facteur de risque d\'IU à EBLSE : carbapénème… + amikacine', 'choix')];
    const srcNonGrave: SourceRef[] = cadre === 'iuas'
      ? [S('SPILF-AFU-SF2H-2015-IUAS', 'R.45', 'En 1ère intention : pipéracilline + tazobactam (intérêt du spectre sur Pseudomonas aeruginosa et entérocoque), ceftriaxone, cefotaxime', 'choix')]
      : cadre === 'homme_spilf2026'
        ? [S('SPILF-2026-IUM', 'diapo 14', 'hospitalier « céfotaxime IV 3 g/jour OU ceftriaxone IV 1 g/jour »', 'choix')]
        : [S('SPILF-2015-IU', 'p. 21-22', 'En cas d\'hospitalisation, il est proposé de privilégier les C3G parentérales', 'choix'), S('HAS-2021-PNA-femme', 'probabiliste', 'Ceftriaxone IM ou IV : 1 g par jour ; 2 g par jour si signes de gravité ou obésité (IMC > 30)', 'choix')];

    const ajouterNonGrave = (rang: OptionTherapeutique['rang'], condition?: string) => {
      if (cadre === 'iuas') {
        f.option({ id: 'proba-iu-iuas-piptazo', libelle: 'Pipéracilline-tazobactam', type: proba, rang, condition, items: [{ m: 'piperacilline_tazobactam', r: 'piptazo-4g8h' }], duree, sources: srcNonGrave });
        f.option({ id: 'proba-iu-iuas-c3g', libelle: 'C3G (ceftriaxone)', type: proba, rang: rang === 'premiere_ligne' ? 'alternative' : 'conditionnelle', condition, items: [{ m: 'ceftriaxone', r: 'ceftriaxone-1g' }], duree, sources: srcNonGrave });
      } else {
        f.option({ id: 'proba-iu-c3g', libelle: 'C3G parentérale (ceftriaxone)', type: proba, rang, condition, items: [{ m: 'ceftriaxone', r: 'ceftriaxone-1g' }], duree, sources: srcNonGrave });
        f.option({ id: 'proba-iu-fq', libelle: 'Fluoroquinolone per os', type: proba, rang: rang === 'premiere_ligne' ? 'alternative' : 'conditionnelle', condition: `${condition ? condition + ' ; ' : ''}en l'absence de fluoroquinolone dans les 6 mois ; prudence chez le sujet âgé (tendinopathie)`, items: [{ m: 'ciprofloxacine', r: 'cipro-po-500x2' }], duree, sources: [S('SPILF-2015-IU', 'p. 19', 'Fluoroquinolone, par voie orale d\'emblée… sauf traitement par quinolone dans les 6 mois précédents', 'choix'), S('ANSM-2023-fluoroquinolones', 'DHPC 2023', undefined, 'surveillance')] });
      }
    };
    const ajouterGrave = (rang: OptionTherapeutique['rang'], condition?: string) => {
      if (cadre === 'femme_spilf2015' && atcdBLSE) {
        f.option({ id: 'proba-iu-grave-blse', libelle: 'Carbapénème + amikacine (antécédent de BLSE < 6 mois)', type: proba, rang, condition, items: [{ m: 'meropeneme', r: 'meropeneme-1g8h' }, { m: 'amikacine', r: 'amikacine-30-du' }], duree, sources: [S('SPILF-2015-IU', 'p. 23', 'En cas d\'antécédent de colonisation urinaire ou IU à EBLSE < 6 mois : carbapénème (imipénème ou méropénème) + amikacine (I-A)', 'choix')] });
        return;
      }
      f.option({ id: 'proba-iu-grave', libelle: cadre === 'iuas' ? 'Pipéracilline-tazobactam + amikacine' : 'C3G forte dose + amikacine (dose unique)', type: proba, rang, condition, items: cadre === 'iuas' ? [{ m: 'piperacilline_tazobactam', r: 'piptazo-4g6h-prolongee' }, { m: 'amikacine', r: 'amikacine-30-du' }] : [{ m: 'cefotaxime', r: 'cefotaxime-fort' }, { m: 'amikacine', r: 'amikacine-30-du' }], duree, sources: srcGrave, commentaire: 'Amikacine : dose unique (SPILF 2026) ou 1 à 3 jours (SPILF 2015), à arrêter dès l\'antibiogramme.' });
    };
    const ajouterChoc = (rang: OptionTherapeutique['rang'], condition?: string) => {
      f.option({ id: 'proba-iu-choc-fdr', libelle: 'Carbapénème + amikacine (choc septique et facteur de risque de C3G-R)', type: proba, rang, condition, items: [{ m: 'meropeneme', r: 'meropeneme-2g8h' }, { m: 'amikacine', r: 'amikacine-30-du' }], duree, sources: srcChoc });
    };
    const allergieBL = ctx.allergie.famillesAEviter.has('penicilline') && ctx.allergie.famillesAEviter.has('cephalosporine');
    if (allergieBL) {
      f.option({ id: 'proba-iu-allergie', libelle: grave ? 'Aztréonam + amikacine (allergie aux bêta-lactamines)' : 'Aztréonam (allergie aux bêta-lactamines)', type: proba, rang: 'premiere_ligne', condition: 'si l\'allergie n\'implique pas la ceftazidime/céfidérocol et n\'est pas une réaction retardée sévère à toute la classe', items: grave ? [{ m: 'aztreonam', r: 'aztreonam-2g8h' }, { m: 'amikacine', r: 'amikacine-30-du' }] : [{ m: 'aztreonam', r: 'aztreonam-2g8h' }], duree, sources: [S('SPILF-2015-IU', 'p. 22-23 ; annexe 1', 'allergie « aztréonam + amikacine »', 'choix')] });
      f.option({ id: 'proba-iu-allergie-fq', libelle: grave ? 'Fluoroquinolone IV + amikacine' : 'Fluoroquinolone', type: proba, rang: 'alternative', items: grave ? [{ m: 'ciprofloxacine', r: 'cipro-iv-400x3' }, { m: 'amikacine', r: 'amikacine-30-du' }] : [{ m: 'ciprofloxacine', r: 'cipro-po-500x2' }], duree, sources: [S('SPILF-2026-IUM', 'diapo 28-29', 'Ciprofloxacine IV 400 mgx3/jour OU lévofloxacine IV 500 mgx2/jour ET Amikacine IV 30 mg/kg dose unique', 'choix')] });
    }
    if (p.gravite === 'inconnu') {
      ajouterNonGrave('conditionnelle', 'si absence de sepsis');
      ajouterGrave('conditionnelle', 'si sepsis (dysfonction d\'organe)');
      ajouterChoc('conditionnelle', 'si choc septique ET facteur de risque de C3G-R (EHPAD, C3G-R < 3 mois, voyage, FQ/amox-clav/C3G < 3 mois)');
    } else if (choc && fdrC3GR) {
      ajouterChoc('premiere_ligne');
      ajouterGrave('alternative');
    } else if (grave) {
      ajouterGrave('premiere_ligne');
      if (fdrC3GR) f.alerte('info', `Facteurs de risque de résistance déclarés (${ctx.risqueBLSE.raisons.join(', ')}) : un carbapénème n'est recommandé en probabiliste qu'en cas de choc septique (SPILF 2026).`, srcChoc);
    } else {
      ajouterNonGrave('premiere_ligne');
    }
    if (p.contexte === 'inconnu' && cadre !== 'iuas') f.alerte('attention', 'Contexte (communautaire ou associé aux soins) inconnu : s\'il est associé aux soins, le cadre IUAS s\'applique (pipéracilline-tazobactam possible en 1re intention).');
    f.manque('antécédents de BLSE / antibiotiques des 3-6 derniers mois / vie en EHPAD / voyage', 'facteurs de risque de C3G-R (choix d\'un carbapénème en cas de choc)', p.antecedentsMicro.length || p.antibiotiquesRecents.length ? 'affine' : 'bloque_decision');
    return f.fin();
  },
};

/* ------------------------------------------------------------------ */
/* Bactériémie à BGN hors foyer urinaire                               */
/* ------------------------------------------------------------------ */

const ARBITRAGE_BGN =
  'Aucune recommandation française ou ESCMID dédiée au traitement probabiliste des bactériémies à BGN sans foyer identifié n\'a été trouvée (vérification du 2026-11-04). Cette option est extrapolée des schémas des IU fébriles graves (SPILF) et des principes HAS/SSC (spectre adapté au site, à l\'origine communautaire ou non et au risque de BMR). Statut brouillon : à valider par le SMIT.';

export const R_BGN: Regle = {
  id: 'R-BACTERIEMIE-BGN',
  libelle: 'Bactériémie à bacilles à Gram négatif (hors foyer urinaire)',
  description: 'Durée : SPILF/GPIP 2021, SRLF 2020. Documenté : SPILF 2023 d\'après ESCMID 2022. Probabiliste : pas de recommandation dédiée (brouillon).',
  statut: 'verifiee_ia',
  priorite: 130,
  sources: [S('SPILF-GPIP-2021-durees', 'diapo 21', 'Bacilles à Gram négatif (dont entérobactéries et BGN non fermentant), streptocoques, entérocoques : 7 jours', 'duree')],
  sApplique: (ctx) => adulte(ctx) && bacteriemie(ctx) && germePrincipal(ctx).g === 'bgn' && ctx.foyer !== 'urinaire' && ctx.foyer !== 'endocardite',
  appliquer: (ctx) => {
    const f = new Fiche(ctx, 'verifiee_ia');
    const p = ctx.dossier.patient;
    const { prl } = germePrincipal(ctx);
    const foyerConnu = ctx.foyer !== 'inconnu';
    const nonIdentifie = !prl?.organisme || prl.organisme === 'bgn_non_identifie' || prl.stade === 'examen_direct';
    f.situation('bacteriemie-bgn', `Bactériémie à ${nonIdentifie ? 'BGN non identifié' : 'BGN'}${foyerConnu ? '' : ' — foyer non déterminé'}`, 'partielle', foyerConnu ? 'Foyer suspecté hors urinaire.' : 'Le foyer conditionne le spectre, la durée et le contrôle de la source : le rechercher activement (urinaire, digestif/biliaire, cathéter, pulmonaire). Les propositions restent conditionnelles tant que la gravité, le contexte et le foyer ne sont pas précisés.');
    const duree: DureeDecidee = { texte: '7 jours pour une bactériémie non compliquée avec foyer contrôlé ; durée à adapter au foyer s\'il est profond ou non contrôlé. (L\'essai BALANCE 2024 conforte 7 j mais n\'est pas une recommandation.)', pointDeDepart: 'premier jour d\'antibiothérapie efficace (après contrôle du foyer) — point de départ non précisé par la source', dureePrevueJours: 7, sources: [S('SPILF-GPIP-2021-durees', 'diapo 21', 'Bactériémies non compliquées sans porte d\'entrée retrouvée : Bacilles à Gram négatif […] : 7 jours', 'duree'), S('SRLF-2020-catheters', 'R3.13', '7j pour les autres pathogènes', 'duree'), S('BALANCE-2024-NEJM', 'résultat principal', 'antibiotic treatment for 7 days was noninferior to treatment for 14 days', 'autre')] };
    f.controle({ id: 'ctl-bgn-foyer', type: 'foyer', categorie: 'indique', quoi: 'Recherche du foyer : ECBU, examen des cathéters, bilan hépatique/biliaire, imagerie orientée par la clinique', quand: { ancre: 'avant_traitement', texte: 'Maintenant (ECBU avant antibiotique), imagerie sans délai si sepsis' }, pourquoi: 'Contrôle de la source idéalement dans les 6 h si sepsis.', sources: [S('SSC-2026', 'page SCCM — contrôle de la source', 'early source control over late source control, ideally within 6 hr of diagnosis', 'geste')] });
    f.controle({ id: 'ctl-bgn-hc', type: 'hemoculture', categorie: 'non_systematique', quoi: 'Hémocultures de contrôle', quand: { ancre: 'non_determine', texte: 'Non systématiques ; à refaire si fièvre persistante ou évolution défavorable après 72 h' }, pourquoi: 'Aucune recommandation lue ne les exige pour les BGN ; une persistance après 3 jours de traitement adapté définit une bactériémie persistante.', ensuite: 'Si positives : bactériémie persistante → foyer profond, endocardite, matériel.', sources: [S('SRLF-2020-catheters', 'info-antibio 2019', 'La persistance d\'HC positives après 3j de traitement bien conduit définit une bactériémie (fongémie) persistante', 'controle_micro')] });

    if (prl && prl.stade === 'antibiogramme' && (prl.antibiogramme?.length ?? 0) > 0) {
      documenterBGN(f, prl, 'autre', p.gravite === 'sepsis' || p.gravite === 'choc_septique', duree);
      return f.fin();
    }
    const proba = 'probabiliste' as const;
    const st = 'brouillon' as const;
    const commun = p.contexte === 'communautaire' && !ctx.risqueBLSE.present;
    const grave = p.gravite === 'sepsis' || p.gravite === 'choc_septique';
    const connu = p.gravite !== 'inconnu' && p.contexte !== 'inconnu';
    const r = (vrai: boolean) => (connu && vrai ? ('premiere_ligne' as const) : ('conditionnelle' as const));
    f.option({ id: 'proba-bgn-c3g', libelle: 'C3G (céfotaxime forte dose)', type: proba, rang: r(commun && !grave), condition: 'si contexte communautaire, sans facteur de risque de BLSE et sans sepsis', items: [{ m: 'cefotaxime', r: 'cefotaxime-fort' }], duree, statut: st, commentaire: ARBITRAGE_BGN, sources: [S('SPILF-2015-IU', 'p. 22-23 (extrapolation)', undefined, 'choix'), S('HAS-2025-sepsis', 'page de présentation', 'antibiothérapie IV adaptée « au site, aux germes, à l\'origine communautaire ou non, au risque de bactéries multirésistantes et à l\'écologie locale »', 'choix')] });
    f.option({ id: 'proba-bgn-c3g-amk', libelle: 'C3G + amikacine (dose unique)', type: proba, rang: r(commun && grave && p.gravite !== 'choc_septique'), condition: 'si sepsis, contexte communautaire sans facteur de risque de BLSE', items: [{ m: 'cefotaxime', r: 'cefotaxime-fort' }, { m: 'amikacine', r: 'amikacine-30-du' }], duree, statut: st, commentaire: ARBITRAGE_BGN, sources: [S('SPILF-2015-IU', 'p. 22-23 (extrapolation)', 'Une association C3G parentérale + amikacine est recommandée en première intention', 'choix'), S('SRLF-SFAR-2014-RFE-antibiotiques-rea', '§4-5', 'dans le choc septique, en association à une bêta-lactamine, « préférer les aminosides »', 'choix')] });
    f.option({ id: 'proba-bgn-piptazo', libelle: 'Pipéracilline-tazobactam (± amikacine si sepsis)', type: proba, rang: r(p.contexte === 'associe_aux_soins' && !ctx.dossier.patient.antecedentsMicro.some((a) => a.resistance === 'BLSE') && p.gravite !== 'choc_septique'), condition: 'si infection associée aux soins sans antécédent de BLSE', items: grave ? [{ m: 'piperacilline_tazobactam', r: 'piptazo-4g6h-prolongee' }, { m: 'amikacine', r: 'amikacine-30-du' }] : [{ m: 'piperacilline_tazobactam', r: 'piptazo-4g6h-prolongee' }], duree, statut: st, commentaire: ARBITRAGE_BGN, sources: [S('SPILF-AFU-SF2H-2015-IUAS', 'R.45 (extrapolation)', undefined, 'choix')] });
    f.option({ id: 'proba-bgn-carba', libelle: 'Méropénème + amikacine', type: proba, rang: r(p.gravite === 'choc_septique' && ctx.risqueBLSE.present), condition: 'si choc septique avec facteur de risque de BLSE (antécédent < 3-6 mois, antibiotique récent, EHPAD, voyage)', items: [{ m: 'meropeneme', r: 'meropeneme-2g8h' }, { m: 'amikacine', r: 'amikacine-30-du' }], duree, statut: st, commentaire: ARBITRAGE_BGN, sources: [S('SPILF-2026-IUM', 'diapo 15 (extrapolation)', undefined, 'choix'), S('SPILF-2023-BGN-MDR-diapo', 'diapo 5', 'Carbapénème: Imipénème ou Méropénème (infections graves à C3G-R documentées)', 'choix')] });
    f.avis('Bactériémie à BGN sans protocole validé dans l\'application : avis du SMIT pour le choix probabiliste.', p.gravite === 'choc_septique', []);
    if (!connu) f.alerte('attention', 'Aucune proposition définitive : préciser la gravité, le contexte, le foyer et les facteurs de risque de BLSE. Les options affichées sont conditionnelles.');
    return f.fin();
  },
};

export const REGLES_BGN = [R_IU_FEBRILE, R_BGN];
export { documenterBGN };
