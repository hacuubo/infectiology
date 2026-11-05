import type { OptionTherapeutique, Plan, PrescriptionProposee } from '../clinical/types';
import { Badge, BadgeStatut, ListeSources, RefsInline } from './composants';
import { formaterDate } from '../schedule/frise';

function Prescription({ p }: { p: PrescriptionProposee }) {
  return (
    <div className="prescription">
      <div className="dci">
        {p.dci} <BadgeStatut statut={p.statut} />
      </div>
      <div className="dose">
        {p.chargeInitiale && (
          <div>
            <strong>{p.chargeInitiale}</strong>
          </div>
        )}
        <div>
          <strong>{p.doseAffichee}</strong> — {p.voie}, {p.modalites}
        </div>
        <div>
          Durée : {p.duree.texte} <span className="aide">(point de départ : {p.duree.pointDeDepart})</span>
        </div>
      </div>
      {p.adaptations.map((a, i) => (
        <div key={i} className="adaptation">
          ↳ {a}
        </div>
      ))}
      {p.avertissements.map((a, i) => (
        <div key={i} className="avert">
          ⚠ {a}
        </div>
      ))}
      {p.surveillance.length > 0 && (
        <details>
          <summary>Surveillance liée à {p.dci} ({p.surveillance.length})</summary>
          <ul>
            {p.surveillance.map((s, i) => {
              const e = s.element;
              const estStp = 'parametre' in e;
              return (
                <li key={i}>
                  <Badge type={e.categorie === 'systematique' ? 'accent' : e.categorie === 'non_recommande_routine' ? undefined : 'attention'}>{e.categorie.replace(/_/g, ' ')}</Badge>{' '}
                  <strong>{estStp ? `Dosage — ${e.parametre}` : e.quoi}</strong> : {s.texteCalendrier}
                  {s.dateCalculeeISO && <> → {formaterDate(s.dateCalculeeISO)}</>}
                  <div className="aide">
                    {estStp ? (
                      <>
                        Indication : {e.indication}. {e.cible ? `Cible : ${e.cible.texte}${e.cible.verifiee ? '' : ' (cible non vérifiée dans la source)'}. ` : ''}
                        Limites : {e.limites}. {e.conduite ? `Conduite : ${e.conduite}` : ''}
                      </>
                    ) : (
                      <>
                        Pourquoi : {e.pourquoi}. {e.conduite ? `Conduite : ${e.conduite}` : ''}
                      </>
                    )}
                  </div>
                  <RefsInline refs={e.sources} />
                </li>
              );
            })}
          </ul>
        </details>
      )}
      <RefsInline refs={[...p.sources, ...p.duree.sources]} />
    </div>
  );
}

function Option({ o, retenue, onRetenir }: { o: OptionTherapeutique; retenue: boolean; onRetenir?: (id: string) => void }) {
  return (
    <div className={`option ${o.rang === 'premiere_ligne' ? 'premiere' : ''}`}>
      <div className="titre">
        <Badge type={o.rang === 'premiere_ligne' ? 'accent' : undefined}>{o.rang === 'premiere_ligne' ? '1re ligne' : o.rang === 'alternative' ? 'Alternative' : 'Conditionnelle'}</Badge>
        <Badge>{o.type === 'probabiliste' ? 'probabiliste' : 'documenté'}</Badge>
        <span>{o.libelle}</span>
        <BadgeStatut statut={o.statut} />
        {retenue ? <Badge type="ok">calendrier affiché</Badge> : onRetenir && <button type="button" className="btn discret" onClick={() => onRetenir(o.id)}>Retenir cette option</button>}
      </div>
      {o.condition && <p className="aide">Condition : {o.condition}</p>}
      {o.prescriptions.map((p, i) => (
        <Prescription key={i} p={p} />
      ))}
      {o.commentaire && <p className="aide">{o.commentaire}</p>}
      <RefsInline refs={o.sources} />
    </div>
  );
}

export function PanneauResultat({ plan, onRetenir }: { plan: Plan; onRetenir?: (id: string) => void }) {
  const niveau = plan.urgence.niveau;
  const premieres = plan.options.filter((o) => o.rang === 'premiere_ligne');
  const autres = plan.options.filter((o) => o.rang !== 'premiere_ligne');
  return (
    <div className={`carte ${niveau === 'immediate' ? 'urgence' : niveau === 'elevee' ? 'attention' : ''}`} aria-live="polite">
      <h2>
        Fiche opérationnelle <Badge type={plan.situation.couverture === 'couverte' ? 'ok' : plan.situation.couverture === 'partielle' ? 'attention' : 'urgence'}>{plan.situation.couverture === 'couverte' ? 'situation couverte' : plan.situation.couverture === 'partielle' ? 'partiellement couverte' : 'non couverte'}</Badge>
      </h2>
      {plan.contientReglesNonValidees && (
        <div className="alerte attention">
          Cette proposition repose sur des règles <strong>non validées par un humain</strong> (version {plan.versionClinique}). Elle ne remplace ni l'avis du SMIT ni le jugement du prescripteur.
        </div>
      )}

      <div className="fiche-section">
        <h3>
          A. Situation retenue <Badge type={niveau === 'immediate' ? 'urgence' : niveau === 'elevee' ? 'attention' : 'ok'}>{niveau === 'immediate' ? 'urgence immédiate' : niveau === 'elevee' ? 'urgence élevée' : 'prise en charge standard'}</Badge>
        </h3>
        <p>
          <strong>{plan.situation.libelle}</strong>
        </p>
        <p className="aide">{plan.situation.description}</p>
        {plan.urgence.alertes.map((a, i) => (
          <div key={i} className={`alerte ${a.niveau}`}>
            {a.texte}
            {a.sources && a.sources.length > 0 && <RefsInline refs={a.sources} />}
          </div>
        ))}
        {plan.donneesManquantes.length > 0 && (
          <details open={plan.donneesManquantes.some((m) => m.impact !== 'affine')}>
            <summary>Informations manquantes pour individualiser ({plan.donneesManquantes.length})</summary>
            <ul className="manquants">
              {plan.donneesManquantes.map((m, i) => (
                <li key={i} className={`impact-${m.impact}`}>
                  <strong>{m.champ}</strong> — {m.pourquoi}{' '}
                  <Badge type={m.impact === 'affine' ? undefined : 'attention'}>{m.impact === 'bloque_dose' ? 'bloque le calcul de dose' : m.impact === 'bloque_surveillance' ? 'conditionne la surveillance' : m.impact === 'bloque_decision' ? 'conditionne la décision' : 'affinerait la proposition'}</Badge>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>

      <div className="fiche-section">
        <h3>B. Traitement proposé</h3>
        {plan.options.length === 0 && <p className="aide">Aucune proposition thérapeutique ne peut être formulée avec les données actuelles. Voir les informations manquantes et les critères d'avis spécialisé.</p>}
        {premieres.map((o) => (
          <Option key={o.id} o={o} retenue={plan.optionRetenueId === o.id} onRetenir={onRetenir} />
        ))}
        {autres.length > 0 && (
          <details>
            <summary>Alternatives et options conditionnelles ({autres.length})</summary>
            {autres.map((o) => (
              <Option key={o.id} o={o} retenue={plan.optionRetenueId === o.id} onRetenir={onRetenir} />
            ))}
          </details>
        )}
        {plan.gestes.length > 0 && (
          <>
            <h4>Contrôle du foyer et gestes</h4>
            <ul>
              {plan.gestes.map((g, i) => (
                <li key={i}>
                  {g.texte} <RefsInline refs={g.sources} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="fiche-section">
        <h3>C. Surveillance et contrôles à prévoir</h3>
        {plan.optionRetenueId && <p className="aide">Calendrier établi pour l'option : {plan.options.find((o) => o.id === plan.optionRetenueId)?.libelle}.</p>}
        {plan.frise.length === 0 ? (
          <p className="aide">Aucun calendrier ne peut être établi sans proposition thérapeutique.</p>
        ) : (
          <table className="frise">
            <thead>
              <tr>
                <th scope="col">Quand</th>
                <th scope="col">Quoi</th>
                <th scope="col">Pourquoi</th>
                <th scope="col">Ensuite</th>
              </tr>
            </thead>
            <tbody>
              {plan.frise.map((e) => (
                <tr key={e.id} className={e.type === 'maintenant' ? 'maintenant' : ''}>
                  <td className="moment">{e.moment}</td>
                  <td>
                    {e.quoi}
                    <RefsInline refs={e.sources} />
                  </td>
                  <td>{e.pourquoi}</td>
                  <td>{e.ensuite ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {plan.controles.length > 0 && (
          <details>
            <summary>Détail des contrôles microbiologiques et examens ({plan.controles.length})</summary>
            <ul>
              {plan.controles.map((c) => (
                <li key={c.id}>
                  <Badge type={c.categorie === 'indique' ? 'accent' : c.categorie === 'non_systematique' ? undefined : 'attention'}>{c.categorie.replace(/_/g, ' ')}</Badge> <strong>{c.quoi}</strong> — {c.quand.texte}
                  {c.quand.repetition && <> ; {c.quand.repetition}</>}
                  <div className="aide">
                    {c.pourquoi}
                    {c.ensuite && <> Ensuite : {c.ensuite}</>}
                  </div>
                  <RefsInline refs={c.sources} />
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>

      <div className="fiche-section">
        <h3>D. Réévaluation et avis spécialisé</h3>
        <ul>
          {plan.reevaluation.map((r, i) => (
            <li key={`r-${i}`}>
              {r.texte} <RefsInline refs={r.sources} />
            </li>
          ))}
          {plan.avisSpecialise.map((a, i) => (
            <li key={`a-${i}`}>
              {a.urgent && <Badge type="urgence">urgent</Badge>} {a.texte} <RefsInline refs={a.sources} />
            </li>
          ))}
        </ul>
      </div>

      <div className="fiche-section">
        <h3>E. Sources</h3>
        <details>
          <summary>Toutes les sources de cette fiche ({plan.sources.length})</summary>
          <ListeSources refs={plan.sources} />
        </details>
        <details className="discret">
          <summary>Règles appliquées ({plan.regles.length}) et leur statut de validation</summary>
          <ul>
            {plan.regles.map((r) => (
              <li key={r.id}>
                <code>{r.id}</code> — {r.libelle} <BadgeStatut statut={r.statut} />
              </li>
            ))}
          </ul>
        </details>
      </div>
    </div>
  );
}
