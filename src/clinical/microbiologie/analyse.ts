/**
 * Synthèse microbiologique d'un isolat, distincte du choix thérapeutique :
 *  - résultats déterminants (avec la lecture interprétative appliquée) ;
 *  - informations encore inconnues qui changeraient la décision ;
 *  - résultats inhabituels ou contradictoires (à vérifier avec le laboratoire ou le SMIT, sans arbitrage) ;
 *  - molécules rendues sensibles mais non pertinentes dans ce contexte.
 * Aucune sensibilité n'est extrapolée d'une molécule à une autre hors règle interprétative sourcée.
 */
import type { ContexteDecision } from '../../engine/contexte';
import type { DonneesIsolat, Prelevement, SourceRef, SyntheseIsolat } from '../types';
import { S } from '../molecules/base';
import { familleDe, libelleGerme, type FamilleGerme } from './germes';
import { pireC3G } from '../rules/outils';
import { AIDE_I, SOURCE_I, etatPhenotype, guideAntibiogramme, libelleMolecule, sirDe, type ContexteGuide } from './guide';

const CASFM = (repere: string, extrait?: string) => S('CASFM-2026-V1.0', repere, extrait, 'definition');

export function contexteGuide(ctx: ContexteDecision, prl: Prelevement, iso: DonneesIsolat): ContexteGuide | undefined {
  const famille = familleDe(iso.organisme);
  if (!famille || !iso.organisme) return undefined;
  const p = ctx.dossier.patient;
  const series = prl.hemoc?.nbSeriesPositives;
  return {
    famille,
    organisme: iso.organisme,
    urinaire: ctx.foyer === 'urinaire' || (prl.type === 'urine' && ctx.foyer === 'inconnu'),
    endocardite: ctx.foyer === 'endocardite',
    grave: p.gravite === 'sepsis' || p.gravite === 'choc_septique',
    allergieBetaLactamines: ctx.allergie.famillesAEviter.has('penicilline') && ctx.allergie.famillesAEviter.has('cephalosporine'),
    protheseValvulaireOuIntracardiaque: ctx.protheseValvulaire || p.dispositifIntracardiaque === 'oui',
    bacteriemie: prl.type === 'hemoculture',
    scnSignificatif: prl.type !== 'hemoculture' || series === undefined ? 'inconnu' : series >= 2 ? 'oui' : 'non',
    traitementNonIndique: ctx.evaluationECBU?.urine.id === prl.id && ctx.evaluationECBU.decision === 'ne_pas_traiter',
  };
}

/* ------------------------------------------------------------------ */
/* Résistances attendues (ex-« naturelles ») : un résultat S est suspect */
/* ------------------------------------------------------------------ */

interface ResistanceAttendue {
  familles?: FamilleGerme[];
  organismes?: string[];
  dcis: string[];
  sources: SourceRef[];
}

const ERP = (repere: string, extrait?: string) => S('EUCAST-ERP-v1.2', repere, extrait, 'definition');
const CA_NAT = (page: string) => CASFM(`ch. 2, résistances naturelles, ${page}`);

/** Entrées vérifiées dans EUCAST Expected Resistant Phenotypes v1.2 et le CA-SFM 2026 (ch. 2), molécules de la base seulement. */
export const RESISTANCES_ATTENDUES: ResistanceAttendue[] = [
  {
    familles: ['enterobacterale', 'enterobacterale_groupe3'],
    dcis: ['penicilline_g', 'vancomycine', 'teicoplanine', 'rifampicine', 'linezolide', 'clindamycine', 'oxacilline', 'daptomycine'],
    sources: [ERP('Table 1', 'Enterobacterales and Aeromonas spp. are also expected to be resistant to benzylpenicillin, glycopeptides, lipoglycopeptides, fusidic acid, macrolides (with some exceptions), lincosamides, streptogramins, rifampicin, and oxazolidinones'), CA_NAT('p. 34')],
  },
  { organismes: ['klebsiella_pneumoniae'], dcis: ['amoxicilline'], sources: [ERP('Table 1, 1.7 K. pneumoniae complex'), CA_NAT('p. 34')] },
  {
    organismes: ['enterobacter_cloacae'],
    dcis: ['amoxicilline', 'amoxicilline_clavulanate', 'cefazoline', 'cefoxitine'],
    sources: [ERP('Table 1, 1.3 E. cloacae complex et note 2', 'Enterobacterales species expected to be resistant to this antibiotic produce a chromosomal inducible AmpC β-lactamase'), CA_NAT('p. 34')],
  },
  {
    familles: ['pseudomonas'],
    dcis: ['amoxicilline', 'amoxicilline_clavulanate', 'cefotaxime', 'ceftriaxone', 'ertapeneme', 'cefazoline', 'cefoxitine', 'cotrimoxazole', 'vancomycine', 'daptomycine', 'oxacilline', 'temocilline', 'cefixime'],
    sources: [ERP('Table 2, 2.7 P. aeruginosa et en-tête', 'also generally intrinsically resistant to benzylpenicillin, first- and second-generation cephalosporins, glycopeptides'), CA_NAT('p. 36'), S('EUCAST-2026-breakpoints-v16.1', 'Pseudomonas, tirets « - »', 'report resistant without prior testing', 'definition')],
  },
  {
    familles: ['s_aureus', 'scn', 's_lugdunensis', 'strepto_abcg', 'strepto_oral', 'strepto_pneumoniae', 'enterocoque'],
    dcis: ['aztreonam', 'temocilline'],
    sources: [ERP('Table 4, en-tête', 'Gram-positive bacteria are expected to be resistant to aztreonam, temocillin, polymyxin B/colistin and nalidixic acid.'), CA_NAT('p. 37')],
  },
  {
    familles: ['enterocoque'],
    dcis: ['cefazoline', 'cefoxitine', 'cefotaxime', 'ceftriaxone', 'cefepime', 'cefixime', 'oxacilline', 'ertapeneme'],
    sources: [CASFM('ch. 5.8 Enterococcus', 'Toutes les espèces d\'Enterococcus sont naturellement résistantes aux céphalosporines, à l\'exception du ceftobiprole vis-à-vis de E. faecalis.'), ERP('Table 4, 4.7 et 4.9'), CA_NAT('p. 37')],
  },
];

/** Phénotypes inhabituels : un résultat R doit être confirmé (EUCAST Expected Susceptible Phenotypes v1.1). */
const ESP = (repere: string, extrait: string) => S('EUCAST-ESP-v1.1', repere, extrait, 'definition');
const INHABITUELS: { familles?: FamilleGerme[]; organismes?: string[]; dcis: string[]; sources: SourceRef[] }[] = [
  { familles: ['s_aureus'], dcis: ['vancomycine', 'teicoplanine', 'daptomycine', 'linezolide'], sources: [ESP('Table 2, 2.1 S. aureus', 'Resistant to vancomycin, teicoplanin, telavancin, dalbavancin, oritavancin, daptomycin, linezolid')] },
  { familles: ['scn', 's_lugdunensis'], dcis: ['vancomycine', 'daptomycine', 'linezolide'], sources: [ESP('Table 2, 2.2 SCN', 'Resistant to vancomycin […] daptomycin, linezolid')] },
  { familles: ['strepto_pneumoniae'], dcis: ['imipeneme', 'meropeneme', 'ertapeneme', 'vancomycine', 'rifampicine'], sources: [ESP('Table 2, 2.4 S. pneumoniae', 'Resistant to carbapenems, vancomycin, teicoplanin […] or rifampicin.')] },
  { familles: ['strepto_abcg'], dcis: ['ceftriaxone', 'cefotaxime', 'vancomycine', 'daptomycine'], sources: [ESP('Table 2, 2.5 streptocoques A, B, C, G', 'Resistant to penicillin, cephalosporins, vancomycin, teicoplanin […] daptomycin, linezolid')] },
  { familles: ['enterocoque'], dcis: ['daptomycine', 'linezolide'], sources: [ESP('Table 2, 2.6 Enterococcus spp.', 'Resistant to daptomycin, linezolid, tigecycline')] },
  { organismes: ['enterococcus_faecalis'], dcis: ['amoxicilline'], sources: [ESP('Table 2, 2.7 E. faecalis', 'Resistant to ampicillin')] },
];

/** Résistance attendue pour ce germe et cette molécule (lecture « rendre R » d'EUCAST), sinon undefined. */
export function resistanceAttendue(org: string | undefined, dci: string): ResistanceAttendue | undefined {
  const f = familleDe(org as never);
  return f && org ? attendueR(f, org, dci) : undefined;
}

function attendueR(f: FamilleGerme, org: string, dci: string): ResistanceAttendue | undefined {
  return RESISTANCES_ATTENDUES.find((r) => ((r.familles?.includes(f) ?? false) || (r.organismes?.includes(org) ?? false)) && r.dcis.includes(dci));
}

/* ------------------------------------------------------------------ */

export function analyserIsolat(ctx: ContexteDecision, prl: Prelevement, iso: DonneesIsolat & { id: string }): SyntheseIsolat {
  const cg = contexteGuide(ctx, prl, iso);
  const syn: SyntheseIsolat = { prelevementId: prl.id, isolatId: iso.id, germe: libelleGerme(iso.organisme, iso.organismeLibre), determinants: [], inconnues: [], incoherences: [], sensiblesNonRetenues: [] };
  if (!cg) return syn;
  const f = cg.famille;
  const s = (d: string) => sirDe(iso, d);
  const ph = (id: Parameters<typeof etatPhenotype>[1]) => etatPhenotype(iso, id);
  const det = (texte: string, sources: SourceRef[] = []) => syn.determinants.push({ texte, sources });
  const inc = (texte: string, sources: SourceRef[] = []) => syn.incoherences.push({ texte, sources });
  const nonRetenue = (dci: string, raison: string, sources: SourceRef[]) => {
    const c = s(dci);
    if (c === 'S' || c === 'I') syn.sensiblesNonRetenues.push({ dci: libelleMolecule(dci), raison, sources });
  };

  // Inconnues : questions essentielles sans réponse exploitable.
  const guide = guideAntibiogramme(iso, cg);
  // Avant le stade « antibiogramme », ces résultats ne sont pas encore attendus : ils ne sont pas comptés comme inconnus.
  for (const q of prl.stade === 'antibiogramme' ? guide.essentielles : []) {
    if (q.type === 'molecule' && s(q.dci) === undefined) syn.inconnues.push({ texte: `${q.libelle} : non renseigné ou non testé`, pourquoi: q.utilite });
    if (q.type === 'phenotype' && ph(q.phenotype) === 'non_rapporte') syn.inconnues.push({ texte: `${q.libelle} : non rapporté`, pourquoi: q.utilite });
  }

  // Résultats déterminants : réponses données aux questions essentielles.
  for (const q of guide.essentielles) {
    if (q.type === 'phenotype' && ph(q.phenotype) !== 'non_rapporte') det(`${q.libelle} : ${q.etats[ph(q.phenotype)].toLowerCase()}`, q.sources);
    if (q.type === 'molecule') {
      const c = s(q.dci);
      if (c) det(`${q.libelle} : ${c}${c === 'I' ? ' (sensible à forte posologie)' : ''}`, c === 'I' ? SOURCE_I : q.sources);
    }
  }
  if ((iso.antibiogramme ?? []).some((r) => r.categorie === 'I')) det(AIDE_I, SOURCE_I);

  // Résistances attendues rendues sensibles.
  for (const r of iso.antibiogramme ?? []) {
    if (r.categorie === 'S' || r.categorie === 'I') {
      const a = attendueR(f, cg.organisme, r.dci);
      if (a) inc(`${libelleMolecule(r.dci)} rendu ${r.categorie} alors qu'une résistance est attendue pour ce germe : vérifier l'identification et l'antibiogramme avec le laboratoire (l'application ne retient pas cette molécule).`, a.sources);
    }
    if (r.categorie === 'R') {
      const x = INHABITUELS.find((e) => ((e.familles?.includes(f) ?? false) || (e.organismes?.includes(cg.organisme) ?? false)) && e.dcis.includes(r.dci));
      if (x) inc(`${libelleMolecule(r.dci)} rendu R : phénotype inhabituel pour ce germe, à confirmer par le laboratoire (autre méthode, laboratoire référent) avant toute décision.`, x.sources);
    }
  }
  if (f === 'pseudomonas' && (iso.antibiogramme ?? []).some((r) => r.categorie === 'I'))
    det('P. aeruginosa : la souche sauvage est catégorisée I (pipéracilline-tazobactam, céfépime, aztréonam, imipénème, ciprofloxacine, lévofloxacine) ; I impose la forte posologie.', [S('EUCAST-2026-breakpoints-v16.1', 'Pseudomonas spp. (S ≤ 0,001 mg/L)', undefined, 'definition'), S('SPILF-SFPT-CASFM-2026-posologies', 'Annexe 9', 'Pseudomonas spp. […] forte posologie uniquement', 'posologie')]);

  if (f === 'enterobacterale' || f === 'enterobacterale_groupe3') {
    const c3g = pireC3G(s);
    const blse = ph('BLSE');
    const ampc = ph('ampc');
    if (blse === 'present' && (s('ceftriaxone') === 'S' || s('cefotaxime') === 'S' || s('cefepime') === 'S'))
      inc('BLSE rapportée mais une C3G ou le céfépime figure « S » : selon le CA-SFM, ces résultats doivent être rendus R. Vérifier le compte rendu avec le laboratoire ; l\'application les lit comme R.', [CASFM('ch. 5.1 Enterobacterales', 'pour les souches productrices de BLSE, il est recommandé d\'interpréter "résistant" tout résultat "sensible" ou "sensible à forte posologie" aux C3G, aux C4G ou à l\'aztréonam')]);
    if (c3g === 'R' && blse !== 'present' && ampc !== 'present') {
      const texte = blse === 'absent' && ampc === 'absent'
        ? 'Résistance aux C3G alors que BLSE et céphalosporinase sont indiquées absentes : résultat inhabituel, à vérifier avec le laboratoire.'
        : 'Résistance aux C3G sans mécanisme rapporté : elle ne permet pas, à elle seule, d\'affirmer une BLSE (une céphalosporinase hyperproduite ou acquise donne aussi ce profil). Demander au laboratoire le mécanisme.';
      inc(texte, [CASFM('ch. 5.1, p. 50', 'en l\'absence de synergie… évocatrice d\'une souche hyperproductrice de céphalosporinase chromosomique (groupe 3 et E. coli) ou d\'une céphalosporinase plasmidique')]);
    }
    const c3gs = ['cefotaxime', 'ceftriaxone', 'ceftazidime'].map(s);
    if (c3gs.includes('R') && c3gs.includes('S'))
      inc('Résultats discordants entre C3G (l’une R, l’autre S) : l’application retient la résistance et ne propose pas la C3G rendue S. Demander le mécanisme au laboratoire.', [CASFM('ch. 5.1, p. 50'), S('EUCAST-expert-rules-v3.3-enterobacterales', 'règle 7 (E. coli, Klebsiella, Raoultella)', 'report each as tested and enclose a warning on uncertain therapeutic outcome for infections other than urinary tract infections', 'definition')]);
    if ([s('ertapeneme'), s('meropeneme'), s('imipeneme')].some((c) => c === 'R' || c === 'I') && ph('carbapenemase') !== 'present')
      inc('Carbapénème non sensible sans carbapénémase rapportée : suspicion à confirmer. Demander au laboratoire si une carbapénémase a été recherchée (algorithme de criblage CA-SFM) et prévenir l\'équipe d\'hygiène.', [CASFM('Annexe 6, p. 158', 'Algorithme phénotypique de criblage des souches d\'Enterobacterales productrices de carbapénémases')]);
    if (s('ciprofloxacine') === 'R' && (s('levofloxacine') === 'S' || s('levofloxacine') === 'I'))
      inc('Ciprofloxacine R mais lévofloxacine rendue sensible : la résistance s\'étend à toutes les fluoroquinolones ; l\'application lit la lévofloxacine comme R.', [S('EUCAST-expert-rules-v3.3-enterobacterales', 'règle 8', 'IF resistant to ciprofloxacin, THEN report as resistant to all fluoroquinolones', 'definition')]);
    // Pertinence : sensible ne veut pas dire indiqué.
    if (!cg.urinaire) nonRetenue('temocilline', 'proposée par la SPILF uniquement en foyer urinaire ; le CA-SFM permet une catégorisation hors voie urinaire (forte posologie), l’EUCAST non', [S('SPILF-2023-BGN-MDR-diapo', 'diapo 6', undefined, 'choix'), CASFM('ch. 5.1, p. 49', 'Témocilline (autres infections)'), S('EUCAST-2026-breakpoints-v16.1', 'Enterobacterales, témocilline', 'infections originating from the urinary tract', 'definition')]);
    const cefoxitineOk = cg.urinaire && blse === 'present' && cg.organisme === 'escherichia_coli';
    if (!cefoxitineOk && cg.organisme !== 'proteus_mirabilis') nonRetenue('cefoxitine', 'proposée seulement pour E. coli producteur de BLSE, en foyer urinaire (catégorisation CA-SFM validée pour E. coli seulement)', [S('SPILF-2023-BGN-MDR-diapo', 'diapo 6', 'Céfoxitine uniquement pour E. coli producteur de BLSE', 'choix'), CASFM('ch. 5.1, p. 51', 'valeurs critiques thérapeutiques validées que pour E. coli')]);
    if (cg.organisme === 'proteus_mirabilis') nonRetenue('cefoxitine', 'Proteus : admise par SPILF 2026 mais non par SPILF 2023, et catégorisation CA-SFM non validée pour Proteus : option conditionnelle seulement, sur avis', [S('SPILF-2026-IUM', 'diapo 17, 24', 'céfoxitine IV 6 g/jour (seulement si E. coli ou Proteus)', 'choix'), CASFM('ch. 5.1, p. 51', 'valeurs critiques thérapeutiques validées que pour E. coli')]);
    if (f === 'enterobacterale_groupe3') {
      const src = [CASFM('ch. 5.1 (groupe 3)', 'l\'utilisation en monothérapie de la pipéracilline-tazobactam ou des céphalosporines de 3e génération […] est déconseillée')];
      nonRetenue('ceftriaxone', 'monothérapie par C3G déconseillée pour les entérobactéries du groupe 3 (risque de sélection d\'un mutant déréprimé)', src);
      nonRetenue('cefotaxime', 'monothérapie par C3G déconseillée pour les entérobactéries du groupe 3', src);
      nonRetenue('piperacilline_tazobactam', 'monothérapie déconseillée pour les entérobactéries du groupe 3', src);
    }
    if (!cg.urinaire) {
      for (const a of ['amikacine', 'gentamicine'])
        nonRetenue(a, 'hors infection d\'origine urinaire, un aminoside ne s\'utilise qu\'en association avec un autre traitement actif', [S('EUCAST-expert-rules-v3.3-enterobacterales', 'règle 10', 'these drugs should always be used in combination with another active therapy', 'definition')]);
    }
  }

  if (f === 's_aureus' || f === 's_lugdunensis' || f === 'scn') {
    const sarm = ph('SARM');
    const depistage = s('cefoxitine') ?? s('oxacilline');
    const cef = s('cefoxitine');
    const oxa = s('oxacilline');
    if (cef && oxa && cef !== oxa && cef !== 'I' && oxa !== 'I') inc('Discordance entre céfoxitine et oxacilline : la céfoxitine est le test de référence ; vérifier par une autre méthode (mecA, PLP2a) avant de conclure. L’application laisse le statut méticilline inconnu.', [CASFM('ch. 5.7, note 4')]);
    if (cef === 'I' || oxa === 'I') inc('Céfoxitine ou oxacilline rendue « I » : cette catégorie n’existe pas pour le dépistage de la méticillino-résistance ; vérifier le compte rendu.', [CASFM('ch. 5.7 Staphylococcus')]);
    if (sarm === 'present' && depistage === 'S') inc('Résistance à la méticilline rapportée mais céfoxitine/oxacilline rendue S : résultats contradictoires, à vérifier avec le laboratoire avant de choisir.', [CASFM('ch. 5.7 Staphylococcus')]);
    if (sarm === 'absent' && depistage === 'R') inc('Sensibilité à la méticilline indiquée mais céfoxitine/oxacilline rendue R : résultats contradictoires, à vérifier avec le laboratoire avant de choisir.', [CASFM('ch. 5.7 Staphylococcus')]);
    nonRetenue('cefixime', 'le céfixime ne doit pas être utilisé pour traiter une infection à staphylocoque', [CASFM('ch. 5.7 Staphylococcus', 'Le céfixime, la ceftazidime […] ne doivent pas être utilisés pour le traitement des infections staphylococciques.')]);
  }

  if (f === 'strepto_abcg') {
    const pen = s('penicilline_g');
    const amox = s('amoxicilline');
    if (pen === 'R' || pen === 'I' || amox === 'R' || amox === 'I') inc('Résistance aux bêta-lactamines chez un streptocoque A, B, C ou G : exceptionnelle. Vérifier le résultat et l\'identification ; souche à adresser à un laboratoire référent.', [CASFM('ch. 5.10', 'La résistance aux β-lactamines est exceptionnelle chez les streptocoques des groupes A, B, C, ou G. Vérifier le résultat ainsi que l\'identification')]);
    if (pen === 'S' && amox === undefined) det('Amoxicilline : sensibilité déduite de la pénicilline G (règle CA-SFM propre aux streptocoques A, B, C et G).', [CASFM('ch. 5.10', 'se déduit de la sensibilité à la pénicilline G')]);
  }

  if (f === 'strepto_abcg' || f === 'strepto_oral' || f === 'strepto_pneumoniae') {
    for (const a of ['gentamicine', 'amikacine'])
      nonRetenue(a, 'résistance naturelle de bas niveau des streptocoques aux aminosides : jamais en monothérapie', [ERP('Table 4, 4.6 et note 1', 'Low-level resistance (LLR) to aminoglycosides')]);
    nonRetenue('ciprofloxacine', 'la ciprofloxacine n\'est pas catégorisée pour les streptocoques (EUCAST : rendre R sans test)', [S('EUCAST-2026-breakpoints-v16.1', 'Streptococcus, tirets « - »', 'report resistant without prior testing', 'definition')]);
  }

  if (f === 'enterocoque') {
    if (s('amoxicilline') === 'R' && [s('piperacilline_tazobactam'), s('imipeneme')].some((c) => c === 'S' || c === 'I'))
      inc('Amoxicilline R mais pipéracilline-tazobactam ou imipénème rendu sensible : ces molécules doivent être catégorisées R. Vérifier avec le laboratoire ; l\'application les lit comme R.', [CASFM('ch. 5.8 Enterococcus', 'doivent également être catégorisées "résistantes" aux uréidopénicillines et aux carbapénèmes')]);
    if (ph('ERV') === 'present' && s('vancomycine') === 'S') inc('ERG/ERV rapporté mais vancomycine rendue S : résultats contradictoires, à vérifier avec le laboratoire.', [S('HCSP-2019-BHRe', 'définitions', undefined, 'definition')]);
    for (const a of ['gentamicine', 'amikacine'])
      nonRetenue(a, 'résistance naturelle de bas niveau des entérocoques aux aminosides : seule compte l\'absence de haut niveau de résistance, pour une association synergique', [S('EUCAST-ERP-v1.2', 'Table 4, note 1 (et note 2 pour E. faecium)', 'Low-level resistance (LLR) to aminoglycosides', 'definition')]);
  }

  return syn;
}
