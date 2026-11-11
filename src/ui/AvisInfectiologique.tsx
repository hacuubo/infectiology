import { useState } from 'react';
import type { Dossier } from '../engine/etat';
import type { ContexteDecision } from '../engine/contexte';
import { courrielAvis, DESTINATAIRE_AVIS, enregistrerSignature, lienCourriel, lireSignature, SIGNATURE_VIDE, type SignatureAvis } from './avis';

/**
 * Dernière section de l'onglet Patient : présentation du patient pour une demande d'avis infectiologique écrite.
 * Le texte est construit à partir du dossier ; l'application ouvre la messagerie, l'utilisateur relit et envoie.
 */
export function AvisInfectiologique({ dossier, ctx }: { dossier: Dossier; ctx: ContexteDecision }) {
  const [histoire, setHistoire] = useState('');
  const [question, setQuestion] = useState('');
  const [copie, setCopie] = useState<'' | 'ok' | 'echec'>('');
  // Signature du prescripteur : lue et enregistrée dans ce seul navigateur.
  const [signature, setSignature] = useState<SignatureAvis>(lireSignature);
  const [stockageOk, setStockageOk] = useState(true);
  const majSignature = (champ: keyof SignatureAvis, valeur: string) => {
    const s = { ...signature, [champ]: valeur };
    setSignature(s);
    setStockageOk(enregistrerSignature(s));
  };
  const signee = !!(signature.nom.trim() || signature.courriel.trim() || signature.telephone.trim());
  const { objet, corps } = courrielAvis(dossier, ctx, { histoire, question, signature });

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(`Objet : ${objet}\n\n${corps}`);
      setCopie('ok');
    } catch {
      setCopie('echec');
    }
  };

  return (
    <section className="carte avis" aria-labelledby="t-avis">
      <h2 id="t-avis">Demande d’avis infectiologique</h2>
      <p className="aide">
        Courriel à <strong>{DESTINATAIRE_AVIS}</strong>, rédigé à partir des données saisies. Ne saisissez ni nom ni identifiant : des données nominatives ne s’envoient que par une messagerie sécurisée de santé.
      </p>
      <div className="champ">
        <label htmlFor="avis-histoire">Histoire clinique</label>
        <textarea id="avis-histoire" rows={3} value={histoire} onChange={(e) => setHistoire(e.target.value)} placeholder="Ex. : fièvre à 39 °C depuis 48 h, frissons, brûlures mictionnelles…" />
      </div>
      <div className="champ">
        <label htmlFor="avis-question">Question posée</label>
        <textarea id="avis-question" rows={2} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ex. : choix de l’antibiothérapie et durée ?" />
      </div>
      <details className="signature" open={!signee}>
        <summary>Votre signature{signee ? ` : ${signature.nom || signature.courriel}` : ' (à renseigner une fois)'}</summary>
        <p className="aide">Enregistrée dans ce navigateur uniquement : elle n’est ni dans le code de l’application ni transmise.</p>
        <div className="champ">
          <label htmlFor="avis-sig-nom">Nom</label>
          <input id="avis-sig-nom" type="text" autoComplete="name" value={signature.nom} onChange={(e) => majSignature('nom', e.target.value)} placeholder="Dr NOM Prénom" />
        </div>
        <div className="champ">
          <label htmlFor="avis-sig-courriel">Adresse électronique</label>
          <input id="avis-sig-courriel" type="email" autoComplete="email" value={signature.courriel} onChange={(e) => majSignature('courriel', e.target.value)} />
        </div>
        <div className="champ">
          <label htmlFor="avis-sig-tel">Téléphone</label>
          <input id="avis-sig-tel" type="tel" autoComplete="tel" value={signature.telephone} onChange={(e) => majSignature('telephone', e.target.value)} />
        </div>
        {!stockageOk && <p className="aide">Stockage du navigateur indisponible : la signature vaut pour cette page seulement.</p>}
        {signee && (
          <button
            type="button"
            className="btn discret"
            onClick={() => {
              setSignature(SIGNATURE_VIDE);
              setStockageOk(enregistrerSignature(SIGNATURE_VIDE));
            }}
          >
            Effacer ma signature de ce navigateur
          </button>
        )}
      </details>
      <div className="champ">
        <label htmlFor="avis-apercu">Aperçu du courriel</label>
        <textarea id="avis-apercu" className="avis-apercu" readOnly value={`Objet : ${objet}\n\n${corps}`} />
      </div>
      <div className="actions">
        <a className="btn" href={lienCourriel(objet, corps)}>
          Ouvrir dans ma messagerie
        </a>
        <button type="button" className="btn secondaire" onClick={copier}>
          Copier le texte
        </button>
        <span role="status" className="aide">
          {copie === 'ok' ? 'Texte copié.' : copie === 'echec' ? 'Copie impossible : sélectionner le texte de l’aperçu.' : ''}
        </span>
      </div>
    </section>
  );
}
