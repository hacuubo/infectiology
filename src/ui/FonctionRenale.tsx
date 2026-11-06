/**
 * Affichage de la fonction rénale : trois estimations distinctes (DFG indexé, DFG désindexé, clairance de
 * Cockcroft-Gault), la valeur fournie par le laboratoire, leurs données, limites, détail du calcul et sources.
 */
import type { Plan } from '../clinical/types';
import type { Dossier } from '../engine/etat';
import type { Estimation } from '../calc/renal';
import { nombreFr } from '../calc/format';
import { contexteUI } from './contexte-ui';
import { Badge, RefsInline } from './composants';
import type { AllerAuChamp } from './Explication';

function LigneEstimation({ e, detail }: { e: Estimation; detail: boolean }) {
  return (
    <li className={`estimation ${e.calculable ? '' : 'non-calculable'}`}>
      <strong>{e.libelle}</strong>{' '}
      {e.calculable ? (
        <>
          : <span className="valeur">{nombreFr(e.valeur!)}</span> {e.unite}
        </>
      ) : (
        <span className="aide">— non calculé{e.manquants.length ? ` (${e.manquants.join(', ')})` : ''}</span>
      )}
      <div className="aide">
        {e.formule}, version {e.version}
      </div>
      {detail && e.calculable && (
        <details className="discret">
          <summary>Détail du calcul et source</summary>
          <dl className="details-frise">
            <dt>Données utilisées</dt>
            <dd>
              <ul>
                {e.donnees.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </dd>
            <dt>Calcul</dt>
            <dd>
              <ol>
                {e.calcul.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ol>
            </dd>
            {e.limites.length > 0 && (
              <>
                <dt>Limites</dt>
                <dd>
                  <ul>
                    {e.limites.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </dd>
              </>
            )}
          </dl>
          <RefsInline refs={e.sources} />
        </details>
      )}
      {!detail && e.calculable && e.limites.length > 0 && <div className="aide">⚠ {e.limites[0]}</div>}
    </li>
  );
}

/** Carte de la fiche : résultat, unité, formule et version, date de la créatinine, données, limites, détail et source. */
export function CarteFonctionRenale({ dossier, plan, allerAuChamp }: { dossier: Dossier; plan: Plan; allerAuChamp?: AllerAuChamp }) {
  const r = contexteUI(dossier).renal;
  const p = dossier.patient;
  const dialyse = r.etat === 'dialyse';
  const utilise = plan.options.some((o) => o.prescriptions.length > 0);
  return (
    <details className="carte-renale" open={!r.applicable || r.incoherences.length > 0}>
      <summary>
        Fonction rénale{' '}
        {dialyse ? <Badge type="attention">dialyse : estimations non applicables</Badge> : !r.applicable ? <Badge type="urgence">estimations non utilisées pour les doses</Badge> : r.etat === 'equilibre_non_confirme' ? <Badge type="attention">stabilité non confirmée</Badge> : null}
        {r.creatinine && <span className="aide"> — créatininémie {r.creatinine.saisie}{r.creatinine.date ? ` du ${r.creatinine.date}${r.creatinine.heure ? ` à ${r.creatinine.heure}` : ''}` : ''}</span>}
      </summary>
      {r.raisonNonApplicable && <p className="alerte attention">{r.raisonNonApplicable.charAt(0).toUpperCase() + r.raisonNonApplicable.slice(1)}</p>}
      {r.incoherences.map((i) => (
        <p key={i.texte} className="alerte urgence">
          {i.texte}{' '}
          {allerAuChamp && (
            <button type="button" className="btn discret" onClick={() => allerAuChamp(i.cible)}>
              Corriger
            </button>
          )}
        </p>
      ))}
      {!dialyse && (
        <ul className="estimations">
          {r.estimations.map((e) => (
            <LigneEstimation key={e.id} e={e} detail />
          ))}
        </ul>
      )}
      {r.labo && (
        <div className="labo">
          <strong>{r.labo.libelle}</strong> : {nombreFr(r.labo.valeur, 1)} {r.labo.unite === 'inconnue' ? '(unité non précisée)' : r.labo.unite}
          {r.labo.date ? ` du ${r.labo.date}` : ''} <Badge>valeur fournie, non recalculée</Badge>
          {r.labo.limites.map((l) => (
            <div key={l} className="aide">
              ⚠ {l}
            </div>
          ))}
        </div>
      )}
      {r.surfaceCorporelle !== undefined && <p className="aide">Surface corporelle (Du Bois) : {nombreFr(r.surfaceCorporelle, 2)} m².</p>}
      {r.limites.map((l) => (
        <p key={l} className="aide">
          ⚠ {l}
        </p>
      ))}
      <p className="aide">
        {utilise
          ? 'Chaque adaptation posologique des options thérapeutiques précise l’estimation utilisée et pourquoi (grandeur et unité exigées par la référence de la molécule).'
          : 'Aucune adaptation posologique n’est calculée sans proposition thérapeutique.'}
        {p.renal.dialyse === 'inconnu' && ' Dialyse non renseignée.'}
      </p>
    </details>
  );
}
