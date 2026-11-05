import { useId } from 'react';
import type { Dossier } from '../engine/etat';
import { CarteIndication, EtapesParcours, LectureMicrobiologique, SyntheseDecision } from './Indication';
import type { Alerte, NiveauUrgence, OptionTherapeutique, Plan, PrescriptionProposee } from '../clinical/types';
import { Badge, BadgeStatut, ListeSources, RefsInline } from './composants';
import { formaterDate, type EvenementFriseDetaille } from '../schedule/frise';
import { dedupSources } from '../engine/decider';

export const LIBELLE_URGENCE: Record<NiveauUrgence, string> = {
  immediate: 'urgence immédiate',
  elevee: 'urgence élevée',
  standard: 'prise en charge standard',
};

export function typeUrgence(n: NiveauUrgence): 'urgence' | 'attention' | 'ok' {
  return n === 'immediate' ? 'urgence' : n === 'elevee' ? 'attention' : 'ok';
}

/** Alertes de niveau « urgence » : affichées en permanence dans la barre du haut (voir App). */
export function alertesUrgentes(plan: Plan): Alerte[] {
  return plan.urgence.alertes.filter((a) => a.niveau === 'urgence');
}

/**
 * Avertissements présents dans au moins deux prescriptions du plan (ex. « sujet âgé : formules
 * moins fiables », « fonction rénale instable ») : affichés une seule fois en tête de la section B
 * avec la liste des molécules concernées, au lieu d'être répétés sous chaque molécule.
 */
export function avertissementsCommuns(plan: Plan): { texte: string; dcis: string[] }[] {
  const parTexte = new Map<string, string[]>();
  for (const o of plan.options)
    for (const p of o.prescriptions)
      for (const a of p.avertissements) {
        const l = parTexte.get(a) ?? [];
        if (!l.includes(p.dci)) l.push(p.dci);
        parTexte.set(a, l);
      }
  const nbPrescriptions = (texte: string) => plan.options.reduce((n, o) => n + o.prescriptions.filter((p) => p.avertissements.includes(texte)).length, 0);
  return [...parTexte.entries()].filter(([t]) => nbPrescriptions(t) >= 2).map(([texte, dcis]) => ({ texte, dcis }));
}

function dureesIdentiques(o: OptionTherapeutique): boolean {
  if (o.prescriptions.length < 2) return false;
  const [a, ...reste] = o.prescriptions;
  return reste.every((p) => p.duree.texte === a.duree.texte && p.duree.pointDeDepart === a.duree.pointDeDepart);
}

function Duree({ p }: { p: PrescriptionProposee }) {
  return (
    <div className="duree">
      <span className="etiquette">Durée</span> {p.duree.texte} <span className="aide">(point de départ : {p.duree.pointDeDepart})</span>
    </div>
  );
}

function Prescription({ p, statutOption, communs, dureeAffichee }: { p: PrescriptionProposee; statutOption: OptionTherapeutique['statut']; communs: Set<string>; dureeAffichee: boolean }) {
  const propres = p.avertissements.filter((a) => !communs.has(a));
  const nbCommuns = p.avertissements.length - propres.length;
  return (
    <div className="prescription">
      <div className="dci">
        {p.dci} {p.statut !== statutOption && <BadgeStatut statut={p.statut} court />}
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
        {dureeAffichee && <Duree p={p} />}
      </div>
      {p.adaptations.map((a, i) => (
        <div key={i} className="adaptation">
          <span aria-hidden="true">↳ </span>
          {a}
        </div>
      ))}
      {propres.map((a, i) => (
        <div key={i} className="avert">
          <span aria-hidden="true">⚠ </span>
          {a}
        </div>
      ))}
      {nbCommuns > 0 && <div className="aide">+ {nbCommuns} avertissement{nbCommuns > 1 ? 's' : ''} commun{nbCommuns > 1 ? 's' : ''} à plusieurs molécules (en tête de la section B).</div>}
      {p.surveillance.length > 0 && (
        <details>
          <summary>
            Surveillance et dosages de {p.dci} ({p.surveillance.length})
          </summary>
          <ul>
            {p.surveillance.map((s, i) => {
              const e = s.element;
              const estStp = 'parametre' in e;
              return (
                <li key={i}>
                  <Badge type={e.categorie === 'systematique' ? 'accent' : e.categorie === 'non_recommande_routine' ? undefined : 'attention'}>{e.categorie.replace(/_/g, ' ')}</Badge>{' '}
                  <strong>{estStp ? `Dosage — ${e.parametre === 'residuelle' ? 'résiduelle' : e.parametre === 'auc' ? 'ASC' : e.parametre}` : e.quoi}</strong> : {s.texteCalendrier}
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
      <RefsInline refs={dedupSources([...p.sources, ...p.duree.sources])} />
    </div>
  );
}

function Option({ o, retenue, onRetenir, communs }: { o: OptionTherapeutique; retenue: boolean; onRetenir?: (id: string) => void; communs: Set<string> }) {
  const titreId = useId();
  const dureeCommune = dureesIdentiques(o);
  return (
    <article className={`option ${o.rang === 'premiere_ligne' ? 'premiere' : ''}`} aria-labelledby={titreId}>
      <div className="titre">
        <Badge type={o.rang === 'premiere_ligne' ? 'accent' : undefined}>{o.rang === 'premiere_ligne' ? '1re ligne' : o.rang === 'alternative' ? 'Alternative' : 'Conditionnelle'}</Badge>
        <Badge>{o.type === 'probabiliste' ? 'probabiliste' : 'documenté'}</Badge>
        <span id={titreId}>{o.libelle}</span>
        <BadgeStatut statut={o.statut} court />
        {retenue ? (
          <Badge type="ok">calendrier affiché</Badge>
        ) : (
          onRetenir && (
            <button type="button" className="btn discret" aria-describedby={titreId} onClick={() => onRetenir(o.id)}>
              Retenir cette option
            </button>
          )
        )}
      </div>
      {o.condition && <p className="condition">Condition : {o.condition}</p>}
      {o.prescriptions.map((p, i) => (
        <Prescription key={i} p={p} statutOption={o.statut} communs={communs} dureeAffichee={!dureeCommune} />
      ))}
      {dureeCommune && <Duree p={o.prescriptions[0]} />}
      {o.commentaire && <p className="aide">{o.commentaire}</p>}
      <RefsInline refs={o.sources} />
    </article>
  );
}

function LigneFrise({ e }: { e: EvenementFriseDetaille }) {
  const aDetails = e.pourquoi || e.ensuite || e.precisionMoment || e.cible || e.limites || e.repetition || e.sources.length > 0;
  return (
    <tr className={e.type === 'maintenant' ? 'maintenant' : ''}>
      <th scope="row" className="moment">
        {e.moment}
      </th>
      <td>
        <span className="quoi">{e.quoi}</span>
        {e.cible && <div className="cible">Cible : {e.cible}</div>}
        {aDetails && (
          <details className="discret">
            <summary>Pourquoi, conduite et précisions</summary>
            <dl className="details-frise">
              {e.precisionMoment && (
                <>
                  <dt>Moment et condition (texte de la source)</dt>
                  <dd>{e.precisionMoment}</dd>
                </>
              )}
              {e.dateISO && (
                <>
                  <dt>Date calculée</dt>
                  <dd>{e.dateAuJour ? 'au jour près (jour de traitement), heure à définir' : 'à partir de l\'horaire saisi'}</dd>
                </>
              )}
              {e.pourquoi && (
                <>
                  <dt>Pourquoi</dt>
                  <dd>{e.pourquoi}</dd>
                </>
              )}
              {e.ensuite && (
                <>
                  <dt>Ensuite</dt>
                  <dd>{e.ensuite}</dd>
                </>
              )}
              {e.repetition && e.repetition !== e.ensuite && (
                <>
                  <dt>Répétition</dt>
                  <dd>{e.repetition}</dd>
                </>
              )}
              {e.limites && (
                <>
                  <dt>Limites</dt>
                  <dd>{e.limites}</dd>
                </>
              )}
            </dl>
            <RefsInline refs={e.sources} />
          </details>
        )}
      </td>
    </tr>
  );
}

export function PanneauResultat({ plan, onRetenir, dossier }: { plan: Plan; onRetenir?: (id: string) => void; dossier?: Dossier }) {
  const ind = plan.indication;
  const conclusionSansTraitement = !!ind && !['traiter', 'urgence'].includes(ind.decision);
  const niveau = plan.urgence.niveau;
  const premieres = plan.options.filter((o) => o.rang === 'premiere_ligne');
  const autres = plan.options.filter((o) => o.rang !== 'premiere_ligne');
  const urgentes = alertesUrgentes(plan);
  const autresAlertes = plan.urgence.alertes.filter((a) => a.niveau !== 'urgence');
  const communs = avertissementsCommuns(plan);
  const communsSet = new Set(communs.map((c) => c.texte));
  const frise = plan.frise as EvenementFriseDetaille[];
  const friseDatee = frise.some((e) => e.dateISO);
  const optionRetenue = plan.options.find((o) => o.id === plan.optionRetenueId);
  return (
    <section className={`carte fiche ${niveau === 'immediate' ? 'urgence' : niveau === 'elevee' ? 'attention' : ''}`} aria-labelledby="t-fiche">
      <p className="sr-only" role="status" aria-live="polite">
        Fiche recalculée : {LIBELLE_URGENCE[niveau]} ; {plan.options.length} option(s)
        {urgentes.length ? ` ; ${urgentes.length} alerte(s) urgente(s)` : ''}.
      </p>
      <h2 id="t-fiche">
        Fiche opérationnelle{' '}
        <Badge type={plan.situation.couverture === 'couverte' ? 'ok' : plan.situation.couverture === 'partielle' ? 'attention' : 'urgence'}>
          {plan.situation.couverture === 'couverte' ? 'situation couverte' : plan.situation.couverture === 'partielle' ? 'partiellement couverte' : 'non couverte'}
        </Badge>
      </h2>
      {plan.contientReglesNonValidees && (
        <p className="alerte attention">
          Règles <strong>non validées par un humain</strong> (version {plan.versionClinique}) ; « vérifiée par IA » ne vaut pas validation médicale. Ne remplace ni l'avis du SMIT ni le jugement du prescripteur.
        </p>
      )}

      {dossier && <EtapesParcours plan={plan} dossier={dossier} />}
      <SyntheseDecision plan={plan} />

      <div className="fiche-section">
        <h3>
          A. Situation retenue <Badge type={typeUrgence(niveau)}>{LIBELLE_URGENCE[niveau]}</Badge>
        </h3>
        <p>
          <strong>{plan.situation.libelle}</strong>
        </p>
        <p className="aide">{plan.situation.description}</p>
        <LectureMicrobiologique plan={plan} />
        {urgentes.length > 0 && (
          <p className="aide">
            {urgentes.length} alerte{urgentes.length > 1 ? 's' : ''} urgente{urgentes.length > 1 ? 's' : ''} affichée{urgentes.length > 1 ? 's' : ''} en permanence en haut de l'écran.
          </p>
        )}
        {autresAlertes.map((a, i) => (
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
                  <Badge type={m.impact === 'affine' ? undefined : 'attention'}>{m.impact === 'bloque_dose' ? 'bloque le calcul de dose' : m.impact === 'bloque_surveillance' ? 'conditionne la surveillance' : m.impact === 'bloque_decision' ? 'conditionne la décision' : 'affinerait la proposition'}</Badge>{' '}
                  <strong>{m.champ}</strong> — {m.pourquoi}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>

      <div className="fiche-section">
        <h3>B. {conclusionSansTraitement ? 'Conclusion sur l\'indication' : 'Traitement proposé'}</h3>
        {ind && (conclusionSansTraitement || ind.decision === 'urgence' || ind.actions.length > 0) && <CarteIndication indication={ind} />}
        {plan.options.length === 0 && !conclusionSansTraitement && <p className="aide">Aucune proposition thérapeutique ne peut être formulée avec les données actuelles. Voir les informations manquantes et les critères d'avis spécialisé.</p>}
        {plan.options.length > 0 && premieres.length === 0 && <p className="aide">Aucune option de 1re ligne avec les données actuelles : voir les options conditionnelles ci-dessous et les informations manquantes.</p>}
        {communs.length > 0 && (
          <div className="alerte attention avert-communs">
            <strong>Avertissements communs à plusieurs molécules</strong>
            <ul>
              {communs.map((c) => (
                <li key={c.texte}>
                  {c.texte} <span className="aide">(concerne : {c.dcis.join(', ')})</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {premieres.map((o) => (
          <Option key={o.id} o={o} retenue={plan.optionRetenueId === o.id} onRetenir={onRetenir} communs={communsSet} />
        ))}
        {autres.length > 0 && (
          <details open={premieres.length === 0}>
            <summary>Alternatives et options conditionnelles ({autres.length})</summary>
            {autres.map((o) => (
              <Option key={o.id} o={o} retenue={plan.optionRetenueId === o.id} onRetenir={onRetenir} communs={communsSet} />
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
        {optionRetenue && <p className="aide">Calendrier établi pour l'option : {optionRetenue.libelle}.</p>}
        {frise.length > 0 && (
          <p className="aide">
            {friseDatee
              ? 'Dates calculées seulement à partir des horaires saisis et des délais explicites des sources ; les autres moments restent relatifs.'
              : 'Aucun horaire saisi : moments relatifs (aucune date inventée). Saisir l\'heure de la 1re dose (étape 5) pour dater le calendrier.'}
          </p>
        )}
        {frise.length === 0 ? (
          <p className="aide">Aucun calendrier ne peut être établi sans proposition thérapeutique.</p>
        ) : (
          <table className="frise">
            <caption className="sr-only">Calendrier de surveillance et de contrôles</caption>
            <thead>
              <tr>
                <th scope="col">Quand</th>
                <th scope="col">Quoi</th>
              </tr>
            </thead>
            <tbody>
              {frise.map((e) => (
                <LigneFrise key={e.id} e={e} />
              ))}
            </tbody>
          </table>
        )}
        {plan.controles.length > 0 && (
          <details>
            <summary>Détail des contrôles microbiologiques et examens ({plan.controles.length}, dont non systématiques)</summary>
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
          {plan.avisSpecialise
            .filter((a) => a.urgent)
            .map((a, i) => (
              <li key={`au-${i}`}>
                <Badge type="urgence">urgent</Badge> {a.texte} <RefsInline refs={a.sources} />
              </li>
            ))}
          {plan.reevaluation.map((r, i) => (
            <li key={`r-${i}`}>
              {r.texte} <RefsInline refs={r.sources} />
            </li>
          ))}
          {plan.avisSpecialise
            .filter((a) => !a.urgent)
            .map((a, i) => (
              <li key={`a-${i}`}>
                {a.texte} <RefsInline refs={a.sources} />
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
    </section>
  );
}
