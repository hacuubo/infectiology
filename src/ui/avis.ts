/**
 * Demande d'avis infectiologique par courriel : texte de présentation du patient construit à partir du dossier
 * (aucune donnée inventée, rien d'autre que ce qui a été saisi), destinataire et signature configurés ici.
 * L'application n'envoie rien : elle ouvre la messagerie de l'utilisateur, qui relit et envoie lui-même.
 */
import type { Dossier } from '../engine/etat';
import type { ContexteDecision } from '../engine/contexte';
import { foyersQuestions } from '../engine/etat';
import { optionsAvecInconnu, questionsPour } from '../clinical/syndromes/questions';
import { LIBELLE_FOYER } from './libelles';
import { lignesResume } from './ResumePatient';
import { nombreFr } from '../calc/format';

/** Adresse de la demande d'avis (à corriger ici si elle change). */
export const DESTINATAIRE_AVIS = 'avis.infectiologiques@chu-toulouse.fr';

/**
 * Signature du prescripteur : saisie dans l'application et conservée dans ce seul navigateur (jamais dans le code
 * ni dans le dépôt, qui est public).
 */
export interface SignatureAvis {
  nom: string;
  courriel: string;
  telephone: string;
}
export const SIGNATURE_VIDE: SignatureAvis = { nom: '', courriel: '', telephone: '' };
const CLE_SIGNATURE = 'infectiology.signatureAvis';

/** Signature enregistrée dans ce navigateur (vide si absente, illisible ou stockage indisponible). */
export function lireSignature(): SignatureAvis {
  try {
    const brut = window.localStorage.getItem(CLE_SIGNATURE);
    if (!brut) return SIGNATURE_VIDE;
    const s = JSON.parse(brut) as Partial<SignatureAvis>;
    return { nom: String(s.nom ?? ''), courriel: String(s.courriel ?? ''), telephone: String(s.telephone ?? '') };
  } catch {
    return SIGNATURE_VIDE;
  }
}

/** Enregistre la signature dans ce navigateur ; une signature vide est effacée. Renvoie faux si le stockage est indisponible. */
export function enregistrerSignature(s: SignatureAvis): boolean {
  try {
    if (!s.nom.trim() && !s.courriel.trim() && !s.telephone.trim()) window.localStorage.removeItem(CLE_SIGNATURE);
    else window.localStorage.setItem(CLE_SIGNATURE, JSON.stringify(s));
    return true;
  } catch {
    return false;
  }
}

/** Formule finale puis signature, une ligne vide entre chaque élément (les éléments vides sont omis). */
export function formuleFinale(s: SignatureAvis = SIGNATURE_VIDE): string {
  return ['Confraternellement,', s.nom, s.courriel, s.telephone]
    .map((x) => x.trim())
    .filter(Boolean)
    .join('\n\n');
}

export interface ComplementsAvis {
  /** Histoire clinique, en texte libre (sans nom ni identifiant). */
  histoire?: string;
  /** Question posée à l'infectiologue. */
  question?: string;
  signature?: SignatureAvis;
}

function patientEnUnePhrase(d: Dossier): string {
  const p = d.patient;
  const qui = p.sexe === 'femme' ? 'une patiente' : p.sexe === 'homme' ? 'un patient' : 'un(e) patient(e)';
  const mesures = [p.poidsKg !== undefined ? `${nombreFr(p.poidsKg, 1)} kg` : '', p.tailleCm !== undefined ? `${nombreFr(p.tailleCm)} cm` : ''].filter(Boolean);
  if (p.age === undefined) return `${qui} (âge non renseigné${mesures.length ? `, ${mesures.join(', ')}` : ''})`;
  return `${qui} de ${[`${nombreFr(p.age)} ans`, ...mesures].join(', ')}`;
}

/** Motif : syndrome choisi et réponses aux questions du foyer (les réponses « inconnu » sont omises). */
function motif(d: Dossier): string[] {
  const lignes: string[] = [];
  if (d.entree === 'syndrome' && d.syndrome !== 'non_choisi') lignes.push(`Suspicion : ${LIBELLE_FOYER[d.syndrome]}`);
  for (const f of foyersQuestions(d)) {
    for (const q of questionsPour(f, d)) {
      const v = d.details?.[q.id];
      if (!v || v === 'inconnu') continue;
      const option = optionsAvecInconnu(q).find((o) => o.v === v);
      lignes.push(`${q.libelle.replace(/\s*\?$/, '')} : ${option?.l ?? v}`);
    }
  }
  return lignes;
}

/** Objet et corps du courriel (lignes séparées par « \n »). */
export function courrielAvis(d: Dossier, ctx: ContexteDecision, complements: ComplementsAvis = {}): { objet: string; corps: string } {
  const syndrome = d.entree === 'syndrome' && d.syndrome !== 'non_choisi' ? LIBELLE_FOYER[d.syndrome] : undefined;
  const age = d.patient.age !== undefined ? `${nombreFr(d.patient.age)} ans` : undefined;
  const objet = ['Demande d’avis infectiologique', [syndrome, age].filter(Boolean).join(', ')].filter(Boolean).join(' — ');

  // Résumé du dossier, sans la ligne « Patient » (reprise dans la phrase d'introduction) ni l'horaire de 1re dose.
  const resume = lignesResume(d, ctx).filter(([k, v]) => k !== 'Patient' && !(k === '1re dose' && /non saisi/.test(v)) && k !== 'Syndrome');
  const enCours = d.patient.antibiotiquesRecents.filter((a) => a.enCours === 'oui' && a.dci);

  const blocs: string[] = ['Bonjour,', '', `Je sollicite votre avis pour ${patientEnUnePhrase(d)}.`];
  const m = motif(d);
  if (m.length) blocs.push('', 'Motif :', ...m.map((x) => `- ${x}`));
  if (complements.histoire?.trim()) blocs.push('', 'Histoire clinique :', complements.histoire.trim());
  blocs.push('', 'Données du dossier :', ...resume.map(([k, v]) => `- ${k} : ${v}`));
  blocs.push('', `Antibiothérapie en cours : ${enCours.length ? enCours.map((a) => a.dci).join(', ') : 'aucune déclarée'}`);
  if (complements.question?.trim()) blocs.push('', 'Question posée :', complements.question.trim());
  blocs.push('', 'Je reste disponible pour tout complément.', '', formuleFinale(complements.signature));
  return { objet, corps: blocs.join('\n') };
}

/** Lien « mailto: » (retours à la ligne en CRLF, comme l'exige la RFC 6068). */
export function lienCourriel(objet: string, corps: string, destinataire = DESTINATAIRE_AVIS): string {
  const enc = (t: string) => encodeURIComponent(t.replace(/\r?\n/g, '\r\n'));
  return `mailto:${destinataire}?subject=${enc(objet)}&body=${enc(corps)}`;
}
