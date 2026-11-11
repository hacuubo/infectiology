import { createContext, useContext, type ReactNode } from 'react';

/**
 * Repli des étapes terminées de la saisie.
 *
 * Règles de sécurité :
 * - une étape n'est repliée que si elle ne contient aucune donnée bloquante, que l'utilisateur y a
 *   déjà travaillé, que le focus n'y est plus et qu'elle est sortie de l'écran par le haut : rien ne
 *   bouge sous le pointeur ou sous le doigt (pas de repli au clic dans une autre étape) ;
 * - une étape repliée affiche le résumé de ce qui a été saisi et se rouvre d'un clic ;
 * - elle se rouvre d'elle-même si une donnée bloquante y apparaît, ou quand la fiche ou la
 *   progression mène à l'un de ses champs ;
 * - le contenu replié reste dans la page (masqué) : aucune saisie n'est perdue.
 */
export interface EtatRepli {
  replies: ReadonlySet<string>;
  /** Étapes contenant une donnée bloquante : jamais repliées. */
  aCompleter: ReadonlySet<string>;
  resumes: Readonly<Record<string, string>>;
  basculer: (id: string, replier: boolean) => void;
}

export const RepliContexte = createContext<EtatRepli | null>(null);

/** Une étape peut-elle être repliée automatiquement ? (fonction pure, testée) */
export function peutReplierAuto(o: { aCompleter: boolean; touchee: boolean; focusDedans: boolean; basSection: number; hautVisible: number; visible: boolean }): boolean {
  return o.visible && !o.aCompleter && o.touchee && !o.focusDedans && o.basSection < o.hautVisible;
}

/** Section d'une étape de la saisie, repliable une fois terminée. Sans contexte (tests unitaires), jamais repliée. */
export function SectionEtape({ id, titre, children }: { id: string; titre: string; children: ReactNode }) {
  const etat = useContext(RepliContexte);
  const replie = !!etat?.replies.has(id);
  const repliable = !!etat && !etat.aCompleter.has(id);
  const corps = `${id}-corps`;
  return (
    <section className={`carte etape-saisie${replie ? ' repliee' : ''}`} aria-labelledby={id} data-etape={id}>
      <div className="entete-etape">
        <h2 id={id}>{titre}</h2>
        {etat && (replie || repliable) && (
          <button type="button" className="btn discret bouton-repli" aria-expanded={!replie} aria-controls={corps} onClick={() => etat.basculer(id, !replie)}>
            {replie ? 'Modifier' : 'Replier'}
            <span className="sr-only"> : {titre.replace(/^\d+\.\s*/, '')}</span>
          </button>
        )}
      </div>
      {replie && <p className="resume-etape">{etat?.resumes[id] || 'Aucune donnée bloquante.'}</p>}
      <div id={corps} hidden={replie}>
        {children}
      </div>
    </section>
  );
}
