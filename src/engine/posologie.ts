/**
 * Calcul déterministe d'une prescription à partir d'un régime posologique de la base,
 * du contexte patient (poids, fonction rénale, allergies, grossesse) et de la durée
 * décidée par la règle. N'invente aucune donnée : si une dose pondérale ne peut pas
 * être calculée, elle est affichée en mg/kg avec la mention de ce qui manque.
 */
import type {
  ConditionId,
  DonneeManquante,
  ElementSurveillance,
  LigneSurveillance,
  Molecule,
  PrescriptionProposee,
  Regimen,
  SourceRef,
  SpecSTP,
} from '../clinical/types';
import { arrondi, poidsAjuste, poidsIdealDevine, poidsIdealLorentz } from '../calc/renal';
import { formaterDose, nombreFr } from '../calc/format';
import { moleculeEvitee, type ContexteDecision } from './contexte';
import { resoudreCalendrier } from '../schedule/frise';

const SANS_ADAPTATION = /pas d'adaptation|pas d'ajustement|dose normale|schéma habituel|posologie normale|dose unique journalière habituelle|pas de réduction/i;

export interface DureeDecidee {
  texte: string;
  pointDeDepart: string;
  sources: SourceRef[];
  dureePrevueJours?: number;
}

export interface ResultatPrescription {
  prescription: PrescriptionProposee;
  donneesManquantes: DonneeManquante[];
}

function texteMgKg(valeur: number, freq: number | undefined, continu?: boolean): string {
  const v = nombreFr(valeur, 1);
  if (continu) return `${v} mg/kg/24 h`;
  if (freq && freq > 1) return `${v} mg/kg par administration (≈ ${nombreFr(valeur * freq)} mg/kg/j)`;
  return `${v} mg/kg`;
}

function enMg(v: { valeur: number; unite: string }): number {
  return v.unite === 'g' ? v.valeur * 1000 : v.valeur;
}

/**
 * Dose pondérale (mg) plafonnée par la dose maximale par administration et, si la fréquence
 * est connue, par la dose maximale journalière. L'arrondi (à 10 mg) est appliqué avant le
 * plafonnement pour qu'un arrondi ne fasse jamais dépasser le plafond.
 */
export function dosePonderalePlafonnee(
  mgParKg: number,
  poidsKg: number,
  opts: { maxParAdministration?: { valeur: number; unite: string }; maxParJour?: { valeur: number; unite: string }; frequenceParJour?: number; continue?: boolean },
): { mg: number; plafonne: false | 'administration' | 'jour' } {
  let mg = arrondi(mgParKg * poidsKg, -1);
  let plafonne: false | 'administration' | 'jour' = false;
  if (opts.maxParAdministration && mg > enMg(opts.maxParAdministration)) {
    mg = enMg(opts.maxParAdministration);
    plafonne = 'administration';
  }
  if (opts.maxParJour) {
    const parJour = opts.continue ? 1 : opts.frequenceParJour;
    if (parJour && mg * parJour > enMg(opts.maxParJour)) {
      mg = Math.floor(enMg(opts.maxParJour) / parJour / 10) * 10;
      plafonne = 'jour';
    }
  }
  return { mg, plafonne };
}

function poidsPourDose(
  ref: 'total' | 'ideal' | 'ajuste' | undefined,
  seuilObesite: number | undefined,
  ctx: ContexteDecision,
  moleculeId?: string,
): { poids?: number; type: string; manquant?: string; avertissement?: string } {
  const p = ctx.dossier.patient;
  if (p.poidsKg === undefined) return { type: 'poids réel', manquant: 'poids' };
  if (!ref || ref === 'total') return { poids: p.poidsKg, type: 'poids réel' };
  const sexe = p.sexe === 'inconnu' ? undefined : p.sexe;
  if (p.tailleCm === undefined || !sexe) {
    return {
      poids: p.poidsKg,
      type: 'poids réel (taille ou sexe manquant pour le poids idéal/ajusté)',
      avertissement: `Poids ${ref === 'ideal' ? 'idéal' : 'ajusté'} non calculable sans taille et sexe : dose calculée sur le poids réel, à vérifier.`,
    };
  }
  // Aminosides : formules des RCP (gentamicine : Lorentz + 0,43 × surcharge ; amikacine : poids idéal + 40 % de l'excédent,
  // formule du poids idéal non précisée par le RCP amikacine → Lorentz retenu par cohérence). Autres molécules : Devine.
  const aminoside = moleculeId === 'gentamicine' || moleculeId === 'amikacine';
  const k = moleculeId === 'gentamicine' ? 0.43 : 0.4;
  const pi = aminoside ? poidsIdealLorentz(p.tailleCm, sexe) : poidsIdealDevine(p.tailleCm, sexe);
  const nomPi = aminoside ? 'Lorentz' : 'Devine';
  // Poids idéal : jamais supérieur au poids réel (patient maigre : poids réel).
  if (ref === 'ideal') return pi < p.poidsKg ? { poids: pi, type: `poids idéal (${nomPi})` } : { poids: p.poidsKg, type: 'poids réel (inférieur au poids idéal)' };
  const seuil = seuilObesite ?? 1.25;
  if (p.poidsKg / pi > seuil) return { poids: poidsAjuste(p.poidsKg, pi, k), type: `poids ajusté (PI ${nomPi} + ${nombreFr(k, 2)} × excès ; poids réel/PI > ${nombreFr(seuil, 2)})` };
  return { poids: p.poidsKg, type: `poids réel (poids réel/PI ≤ ${nombreFr(seuil, 2)} : pas d'obésité selon le seuil du régime)` };
}

export function evaluerCondition(id: ConditionId | undefined, ctx: ContexteDecision, opts: { dureePrevueJours?: number; coPrescriptions: string[]; continue?: boolean }): boolean | 'inconnu' {
  if (!id) return true;
  const p = ctx.dossier.patient;
  const clcr = ctx.renal.valeurPourPosologie?.valeur;
  switch (id) {
    case 'duree_sup_3j':
      return opts.dureePrevueJours === undefined ? 'inconnu' : opts.dureePrevueJours > 3;
    case 'duree_sup_7j':
      return opts.dureePrevueJours === undefined ? 'inconnu' : opts.dureePrevueJours > 7;
    case 'duree_sup_14j':
      return opts.dureePrevueJours === undefined ? 'inconnu' : opts.dureePrevueJours > 14;
    case 'insuffisance_renale':
      if (p.renal.insuffisanceRenaleAigue === 'oui') return true;
      if (p.renal.dialyse !== 'aucune' && p.renal.dialyse !== 'inconnu') return true;
      if (clcr === undefined) return 'inconnu';
      return clcr < 60;
    case 'instabilite_renale':
      return p.renal.stabilite === 'instable' || p.renal.insuffisanceRenaleAigue === 'oui' ? true : p.renal.stabilite === 'inconnu' ? 'inconnu' : false;
    case 'sujet_age':
      return p.age === undefined ? 'inconnu' : p.age >= 65;
    case 'hemodialyse':
      return p.renal.dialyse === 'hemodialyse_intermittente';
    case 'eer_continue':
      return p.renal.dialyse === 'eer_continue';
    case 'grossesse':
      return p.grossesse === 'oui' ? true : p.grossesse === 'non' ? false : ctx.grossessePossible ? 'inconnu' : false;
    case 'aminoside_associe':
      return opts.coPrescriptions.some((m) => ['gentamicine', 'amikacine', 'tobramycine'].includes(m));
    case 'piperacilline_associee':
      return opts.coPrescriptions.includes('piperacilline_tazobactam');
    case 'statine_associee':
      return p.traitementsAssocies.includes('statine');
    case 'serotoninergique_associe':
      return p.traitementsAssocies.includes('serotoninergique');
    case 'qt_allongeant_associe':
      return p.traitementsAssocies.includes('qt_allongeant');
    case 'anticoagulant_associe':
      return p.traitementsAssocies.includes('avk') || p.traitementsAssocies.includes('aod');
    case 'perfusion_continue':
      return opts.continue === true;
    case 'perfusion_intermittente':
      return opts.continue !== true;
    case 'perfusion_intermittente_hors_hemodialyse':
      return opts.continue !== true && p.renal.dialyse !== 'hemodialyse_intermittente';
    case 'patient_severe':
      if (p.gravite === 'sepsis' || p.gravite === 'choc_septique' || p.renal.insuffisanceRenaleAigue === 'oui' || p.renal.dialyse === 'eer_continue' || p.neutropenie === 'oui') return true;
      return p.gravite === 'inconnu' ? 'inconnu' : false;
    case 'duree_sup_5j_ou_insuffisance_renale': {
      const ir = evaluerCondition('insuffisance_renale', ctx, opts);
      if (ir === true) return true;
      if (opts.dureePrevueJours !== undefined && opts.dureePrevueJours > 5) return true;
      return ir === 'inconnu' || opts.dureePrevueJours === undefined ? 'inconnu' : false;
    }
    case 'vancomycine_associee':
      return opts.coPrescriptions.includes('vancomycine');
    default:
      return 'inconnu';
  }
}

function texteCalendrier(e: ElementSurveillance | SpecSTP, ctx: ContexteDecision): { texte: string; dateISO?: string } {
  const h = ctx.dossier.horaires;
  if ((e as SpecSTP).parametre !== undefined) {
    const s = e as SpecSTP;
    return { texte: `${s.premierPrelevement.quand} ; ${s.premierPrelevement.position}. Répétition : ${s.repetition}` };
  }
  const el = e as ElementSurveillance;
  const r = resoudreCalendrier(el.quand, { maintenantISO: h.maintenantISO, premiereDoseISO: h.premiereDoseISO, dureePerfusionMin: h.dureePerfusionMin });
  return { texte: el.quand.texte + (el.quand.repetition ? ` ; ${el.quand.repetition}` : ''), dateISO: r.dateISO };
}

export function surveillancePourMolecule(
  m: Molecule,
  ctx: ContexteDecision,
  opts: { dureePrevueJours?: number; coPrescriptions: string[]; continue?: boolean },
): { lignes: LigneSurveillance[]; manquants: DonneeManquante[] } {
  const lignes: LigneSurveillance[] = [];
  const manquants: DonneeManquante[] = [];
  const elements: (ElementSurveillance | SpecSTP)[] = [...m.surveillance, ...(m.stp ?? [])];
  for (const e of elements) {
    if (e.statut === 'retiree') continue;
    const cond = evaluerCondition(e.conditionId, ctx, opts);
    if (cond === false) continue;
    const t = texteCalendrier(e, ctx);
    let texte = t.texte;
    if (cond === 'inconnu' && e.conditionTexte) {
      texte = `${texte} — s'applique ${e.conditionTexte} (à confirmer : donnée manquante)`;
      manquants.push({ champ: e.conditionTexte, pourquoi: `détermine si « ${(e as ElementSurveillance).quoi ?? (e as SpecSTP).parametre} » (${m.dci}) est nécessaire`, impact: 'bloque_surveillance' });
    } else if (e.conditionTexte) {
      texte = `${texte} — ${e.conditionTexte}`;
    }
    lignes.push({ moleculeDci: m.dci, element: e, texteCalendrier: texte, dateCalculeeISO: t.dateISO });
  }
  return { lignes, manquants };
}

export function calculerPrescription(args: {
  molecule: Molecule;
  regimen: Regimen;
  ctx: ContexteDecision;
  duree: DureeDecidee;
  coPrescriptions?: string[];
}): ResultatPrescription {
  const { molecule: m, regimen: r, ctx, duree } = args;
  const manquants: DonneeManquante[] = [];
  const avert: string[] = [];
  const adaptations: string[] = [];
  const sources: SourceRef[] = [...r.sources];

  // --- Dose par administration
  let doseAffichee: string;
  let doseCalculee: PrescriptionProposee['doseCalculee'];
  const freq = r.dose.frequenceParJour;
  const freqTexte = r.dose.continue ? 'en perfusion continue sur 24 h' : freq ? `× ${freq}/24 h (toutes les ${nombreFr(24 / freq, 1)} h)` : '';
  if (r.dose.texte) {
    doseAffichee = r.dose.texte;
  } else if (r.dose.type === 'fixe') {
    doseAffichee = `${formaterDose(r.dose.valeur, r.dose.unite)} ${freqTexte}`.trim();
    doseCalculee = { valeurParAdministration: r.dose.valeur, unite: r.dose.unite, frequenceParJour: freq, continue: r.dose.continue };
  } else {
    const pd = poidsPourDose(r.dose.poidsReference, r.dose.seuilObesiteRatio, ctx, m.id);
    if (pd.poids === undefined) {
      doseAffichee = `${texteMgKg(r.dose.valeur, freq, r.dose.continue)} ${freqTexte} — poids manquant : dose par administration non calculée`;
      manquants.push({ champ: 'poids', pourquoi: `dose pondérale (${m.dci} : ${nombreFr(r.dose.valeur, 1)} ${r.dose.unite})`, impact: 'bloque_dose' });
    } else {
      const { mg: val, plafonne } = dosePonderalePlafonnee(r.dose.valeur, pd.poids, {
        maxParAdministration: r.dose.doseMaxParAdministration,
        maxParJour: r.dose.doseMaxParJour,
        frequenceParJour: freq,
        continue: r.dose.continue,
      });
      const plafTexte = plafonne === 'administration' ? ' ; plafonné à la dose maximale par administration' : plafonne === 'jour' ? ' ; plafonné à la dose maximale journalière' : '';
      doseAffichee = `${formaterDose(val, 'mg', { forcerMg: true })} ${freqTexte} (${texteMgKg(r.dose.valeur, freq, r.dose.continue)} × ${nombreFr(pd.poids, 1)} kg, ${pd.type}${plafTexte})`;
      doseCalculee = { valeurParAdministration: val, unite: 'mg', frequenceParJour: freq, continue: r.dose.continue, poidsUtilise: { valeur: arrondi(pd.poids, 1), type: pd.type } };
      if (pd.avertissement && !avert.includes(pd.avertissement)) avert.push(pd.avertissement);
    }
  }

  let chargeInitiale: string | undefined;
  if (r.chargeInitiale) {
    const c = r.chargeInitiale;
    if (c.type === 'fixe') chargeInitiale = `${c.libelle} : ${formaterDose(c.valeur, c.unite)}`;
    else {
      const pd = poidsPourDose(c.poidsReference, c.seuilObesiteRatio, ctx, m.id);
      if (pd.poids === undefined) {
        chargeInitiale = `${c.libelle} : ${nombreFr(c.valeur, 1)} ${c.unite} — poids manquant : dose non calculée`;
        manquants.push({ champ: 'poids', pourquoi: `dose de charge (${m.dci})`, impact: 'bloque_dose' });
      } else {
        // La dose de charge respecte aussi son plafond (ex. vancomycine 25 mg/kg, maximum 3 g).
        const ch = dosePonderalePlafonnee(c.valeur, pd.poids, { maxParAdministration: c.doseMaxParAdministration });
        chargeInitiale = `${c.libelle} : ${formaterDose(ch.mg, 'mg', { forcerMg: true })} (${nombreFr(c.valeur, 1)} ${c.unite} × ${nombreFr(pd.poids, 1)} kg, ${pd.type}${ch.plafonne ? ' ; plafonnée à la dose maximale' : ''})`;
        if (pd.avertissement && !avert.includes(pd.avertissement)) avert.push(pd.avertissement);
      }
    }
  }

  // --- Adaptation rénale
  let adaptationRequise = false;
  const ar = m.adaptationRenale;
  const p = ctx.dossier.patient;
  if (ar.statut !== 'retiree') {
    if (p.renal.dialyse === 'hemodialyse_intermittente' || p.renal.dialyse === 'eer_continue' || p.renal.dialyse === 'dialyse_peritoneale') adaptationRequise = true;
    if (p.renal.dialyse === 'hemodialyse_intermittente') {
      adaptations.push(ar.hemodialyse ? `Hémodialyse intermittente : ${ar.hemodialyse.texte}` : `Hémodialyse intermittente : modalité non renseignée dans la base pour ${m.dci} — avis pharmacologique/néphrologique requis.`);
      if (ar.hemodialyse) sources.push(...ar.hemodialyse.sources);
      if (!p.renal.horairesDialyse) manquants.push({ champ: 'horaires de dialyse', pourquoi: `administration de ${m.dci} par rapport aux séances`, impact: 'affine' });
    } else if (p.renal.dialyse === 'eer_continue') {
      adaptations.push(ar.eerContinue ? `Épuration extrarénale continue : ${ar.eerContinue.texte}` : `Épuration extrarénale continue : posologie non déterminable à partir de la base pour ${m.dci} — avis pharmacologique/réanimation requis (dépend du débit d'effluent).`);
      if (ar.eerContinue) sources.push(...ar.eerContinue.sources);
    } else if (p.renal.dialyse === 'dialyse_peritoneale') {
      adaptations.push(`Dialyse péritonéale : posologie non déterminable à partir de la base pour ${m.dci} — avis pharmacologique/néphrologique requis.`);
    } else {
      const v = ctx.renal.valeurPourPosologie;
      if (!v) {
        adaptations.push(`Adaptation rénale non évaluable : ${ctx.renal.manquants.join(', ') || 'données rénales manquantes'}.`);
        manquants.push({ champ: 'fonction rénale (créatininémie avec unité, âge, poids, sexe)', pourquoi: `adaptation posologique de ${m.dci} (méthode ${ar.methode})`, impact: m.famille === 'aminoside' || m.famille === 'glycopeptide' ? 'bloque_dose' : 'affine' });
      } else {
        const palier = ar.paliers.find((pl) => (pl.clcrMin === undefined || v.valeur >= pl.clcrMin) && (pl.clcrMax === undefined || v.valeur < pl.clcrMax));
        const clTexte = `${v.methode} ≈ ${nombreFr(v.valeur)} mL/min`;
        if (palier) {
          adaptations.push(`${clTexte} : ${palier.texte}`);
          sources.push(...palier.sources);
          if (!SANS_ADAPTATION.test(palier.texte)) adaptationRequise = true;
        } else if (ar.texteGeneral) {
          adaptations.push(`${clTexte} : ${ar.texteGeneral}`);
        }
        if (!ctx.renal.applicable) {
          avert.push(`Fonction rénale instable / IRA : l'estimation (${clTexte}) n'est qu'indicative ; adapter sur la créatininémie quotidienne et, pour les molécules dosables, sur les concentrations.`);
        }
        for (const l of ctx.renal.limites) if (!avert.includes(l) && !(ctx.renal.applicable === false && /instable|dialysé/.test(l))) avert.push(l);
        // Même libellé que la règle transversale : les deux demandes fusionnent en une seule ligne.
        if (p.renal.dialyse === 'inconnu') manquants.push({ champ: 'dialyse / épuration extrarénale (oui/non)', pourquoi: 'adaptation posologique', impact: 'affine' });
      }
    }
  }

  if (adaptationRequise) doseAffichee = `Dose de référence (fonction rénale normale) : ${doseAffichee} — à adapter selon l'indication rénale ci-dessous`;

  // --- Hépatique
  if (p.insuffisanceHepatique === 'oui' && m.insuffisanceHepatique) {
    adaptations.push(`Insuffisance hépatique : ${m.insuffisanceHepatique.texte}`);
    sources.push(...m.insuffisanceHepatique.sources);
  }

  // --- Grossesse
  if (m.grossesse && ctx.grossessePossible) {
    if (m.grossesse.statut === 'contre_indique' || m.grossesse.statut === 'eviter') {
      avert.push(`Grossesse ${p.grossesse === 'oui' ? 'déclarée' : 'non exclue'} : ${m.grossesse.texte}`);
      sources.push(...m.grossesse.sources);
    }
    if (p.grossesse === 'inconnu') manquants.push({ champ: 'grossesse', pourquoi: `choix et sécurité de ${m.dci}`, impact: 'affine' });
  }

  // --- Allergie
  const ev = moleculeEvitee(m.id, m.famille, ctx.allergie);
  if (ev.evitee) avert.push(`Allergie déclarée : ${ev.raison}. Cette proposition ne doit pas être utilisée sans réévaluation de l'allergie.`);
  for (const res of ctx.allergie.reserves) if (res.moleculeId === m.id) avert.push(res.texte);

  // --- Interactions
  for (const inter of m.interactionsPertinentes ?? []) {
    if (p.traitementsAssocies.includes(inter.avec)) {
      avert.push(`Interaction (${inter.avec}) : ${inter.texte}`);
      sources.push(...inter.sources);
    }
  }

  // --- Surveillance propre à la molécule
  const sv = surveillancePourMolecule(m, ctx, { dureePrevueJours: duree.dureePrevueJours, coPrescriptions: args.coPrescriptions ?? [], continue: r.dose.continue });
  manquants.push(...sv.manquants);

  const statut = [r.statut, ar.statut, m.statut].includes('brouillon') ? 'brouillon' : [r.statut, ar.statut, m.statut].includes('verifiee_ia') ? 'verifiee_ia' : [r.statut, ar.statut, m.statut].includes('validee_humain') ? 'validee_humain' : 'publiee';

  return {
    prescription: {
      moleculeId: m.id,
      dci: m.dci,
      regimenId: r.id,
      doseAffichee,
      doseCalculee,
      chargeInitiale,
      voie: r.voie,
      modalites: r.modalites,
      adaptations,
      duree: { texte: duree.texte, pointDeDepart: duree.pointDeDepart, sources: duree.sources, dureePrevueJours: duree.dureePrevueJours },
      surveillance: sv.lignes,
      sources,
      statut,
      avertissements: avert,
    },
    donneesManquantes: manquants,
  };
}
