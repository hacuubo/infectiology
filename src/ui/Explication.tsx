/**
 * Explication systématique de toute absence de proposition thérapeutique complète.
 * Présentation constante : statut, motif, ce qui peut déjà être proposé, ce qu'il faut compléter,
 * prochaine action, source ou limite. Le contenu vient de l'état de sortie du moteur (plan.sortie).
 */
import { Component, type ReactNode } from 'react';
import type { EtatSortie, MotifSortie, PropositionEcartee, TypeMotifSortie } from '../clinical/types';
import { Badge, RefsInline } from './composants';

export const LIBELLE_TYPE_MOTIF: Record<TypeMotifSortie, string> = {
  non_indiquee: 'Antibiothérapie non indiquée',
  informations_manquantes: 'Informations manquantes',
  microbiologie_insuffisante: 'Résultats microbiologiques insuffisants',
  non_couverte: 'Situation non couverte par l’application',
  contraintes: 'Aucune option ne satisfait les contraintes',
  non_validee: 'Règle non validée ou recommandations divergentes',
  incoherence: 'Données incohérentes',
  erreur_technique: 'Erreur technique',
};

const LIBELLE_IMPACT: Record<string, string> = {
  bloque_decision: 'choix de l’antibiotique',
  bloque_dose: 'dose seulement',
  bloque_duree: 'durée seulement',
  bloque_surveillance: 'surveillance seulement',
  affine: 'affinerait',
};

const LIBELLE_ECARTEE: Record<PropositionEcartee['type'], string> = {
  allergie: 'allergie',
  resistance: 'résistance documentée',
  contre_indication: 'contre-indication',
  non_validee: 'règle non validée',
  source_retiree: 'source retirée',
  inadaptee: 'inadaptée au contexte',
};

export type AllerAuChamp = (cible: string) => void;

function typeBadge(t: TypeMotifSortie): 'urgence' | 'attention' | 'ok' | undefined {
  if (t === 'erreur_technique' || t === 'incoherence') return 'urgence';
  if (t === 'non_indiquee') return 'ok';
  return 'attention';
}

function CarteMotif({ m, allerAuChamp }: { m: MotifSortie; allerAuChamp?: AllerAuChamp }) {
  return (
    <article className={`motif-sortie motif-${m.type}`} aria-label={m.statut}>
      <div className="titre">
        <Badge type={typeBadge(m.type)}>{LIBELLE_TYPE_MOTIF[m.type]}</Badge> <strong>{m.statut}</strong>
      </div>
      <dl className="motif-dl">
        <dt>Motif</dt>
        <dd>{m.motif}</dd>
        {m.verifie.length > 0 && (
          <>
            <dt>Éléments pris en compte</dt>
            <dd>
              <ul>
                {m.verifie.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </dd>
          </>
        )}
        <dt>Ce qui peut déjà être proposé</dt>
        <dd>
          {m.dejaPropose.length ? (
            <ul>
              {m.dejaPropose.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          ) : (
            'Rien de plus à ce stade.'
          )}
        </dd>
        {m.aCompleter.length > 0 && (
          <>
            <dt>À compléter ou vérifier</dt>
            <dd>
              <ul className="a-completer">
                {m.aCompleter.map((x) => (
                  <li key={`${x.texte}-${x.impact}`}>
                    <Badge type={x.impact === 'affine' ? undefined : 'attention'}>{LIBELLE_IMPACT[x.impact]}</Badge> <strong>{x.texte}</strong> — <span className="aide">{x.role}</span>{' '}
                    {x.cible && allerAuChamp && (
                      <button type="button" className="btn discret" onClick={() => allerAuChamp(x.cible!)}>
                        {m.type === 'incoherence' ? 'Corriger' : 'Compléter'}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </dd>
          </>
        )}
        <dt>Prochaine action</dt>
        <dd>{m.prochaineAction}</dd>
        {(m.limite || m.sources.length > 0) && (
          <>
            <dt>{m.limite ? 'Limite de couverture et source' : 'Source'}</dt>
            <dd>
              {m.limite && <p className="limite">{m.limite}</p>}
              {m.sources.length > 0 && <RefsInline refs={m.sources} />}
            </dd>
          </>
        )}
      </dl>
      <p className="aide origine">Règle(s) à l’origine : {m.origine.join(', ') || '—'}</p>
    </article>
  );
}

/** Panneau « Pourquoi aucun traitement complet n'est affiché » : un motif par situation, priorisés. */
export function ExplicationSortie({ sortie, allerAuChamp }: { sortie: EtatSortie; allerAuChamp?: AllerAuChamp }) {
  if (sortie.motifs.length === 0) return null;
  const titre = sortie.traitement === 'aucun' ? 'Pourquoi aucun traitement n’est affiché' : 'Pourquoi la proposition est incomplète';
  return (
    <section className="explication-sortie" aria-label={titre}>
      <h4>{titre}</h4>
      {sortie.urgence && sortie.traitement !== 'complet' && (
        <div className="alerte urgence" role="alert">
          <strong>Urgence : ne pas attendre une proposition complète.</strong>
          {sortie.actionsUrgentes.length > 0 ? (
            <ul>
              {sortie.actionsUrgentes.map((a) => (
                <li key={a.texte}>
                  {a.texte} {a.sources.length > 0 && <RefsInline refs={a.sources} />}
                </li>
              ))}
            </ul>
          ) : (
            <p>Appliquer les mesures urgentes et demander un avis immédiat.</p>
          )}
          <p>Les alertes urgentes restent affichées en haut de l’écran.</p>
        </div>
      )}
      {sortie.motifs.map((m, i) => (
        <CarteMotif key={`${m.type}-${i}`} m={m} allerAuChamp={allerAuChamp} />
      ))}
    </section>
  );
}

/** Propositions écartées par le moteur, avec leur raison structurée. */
export function PourquoiNonDisponible({ ecartees }: { ecartees: PropositionEcartee[] }) {
  if (ecartees.length === 0) return null;
  return (
    <details className="pourquoi-ecartees">
      <summary>Pourquoi cette proposition n’est-elle pas disponible ? ({ecartees.length})</summary>
      <ul>
        {ecartees.map((e, i) => (
          <li key={`${e.libelle}-${i}`}>
            <Badge>{LIBELLE_ECARTEE[e.type]}</Badge> <strong>{e.libelle}</strong> : {e.raison} <span className="aide">(règle : {e.origine})</span>
            {e.sources.length > 0 && <RefsInline refs={e.sources} />}
          </li>
        ))}
      </ul>
    </details>
  );
}

/** Erreur technique : distincte d'une conclusion médicale ; les données saisies sont conservées. */
export function PanneauErreurTechnique({ sortie, onReessayer }: { sortie: EtatSortie; onReessayer: () => void }) {
  const m = sortie.motifs[0];
  return (
    <section className="carte fiche erreur-technique" role="alert" aria-labelledby="t-erreur">
      <h2 id="t-erreur">{m?.statut ?? 'Erreur technique'}</h2>
      <p>{m?.motif}</p>
      <p>
        <strong>Ce n’est pas une conclusion médicale :</strong> l’absence de fiche ne signifie ni qu’une antibiothérapie est inutile, ni qu’elle est indiquée.
      </p>
      <p>{m?.prochaineAction}</p>
      <button type="button" className="btn" onClick={onReessayer}>
        Réessayer
      </button>
    </section>
  );
}

/** Capture une erreur d'affichage de la fiche sans perdre les données saisies. */
export class GardeErreur extends Component<{ children: ReactNode; cle: unknown; rendu: (message: string, reessayer: () => void) => ReactNode }, { erreur?: string; cle: unknown }> {
  state: { erreur?: string; cle: unknown } = { cle: this.props.cle };
  static getDerivedStateFromError(e: unknown) {
    return { erreur: e instanceof Error ? e.message : String(e) };
  }
  static getDerivedStateFromProps(props: { cle: unknown }, state: { erreur?: string; cle: unknown }) {
    // Nouvelle saisie : on retente l'affichage.
    return props.cle !== state.cle ? { erreur: undefined, cle: props.cle } : null;
  }
  render() {
    if (this.state.erreur !== undefined) return this.props.rendu(this.state.erreur, () => this.setState({ erreur: undefined }));
    return this.props.children;
  }
}
