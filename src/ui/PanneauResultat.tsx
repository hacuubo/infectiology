import { useId } from 'react';
import type { Dossier } from '../engine/etat';
import { CarteIndication, LIBELLE_DECISION, LectureMicrobiologique, indicationOuiNon } from './Indication';
import type { Alerte, DonneeManquante, LigneSurveillance, NiveauUrgence, OptionTherapeutique, Plan, PrescriptionProposee } from '../clinical/types';
import { Badge, BadgeStatut, ListeSources, RefsInline, statutASignaler } from './composants';
import { formaterDate, type EvenementFriseDetaille } from '../schedule/frise';
import { FriseGraphique, numerosReperes } from './FriseGraphique';
import { dedupSources } from '../engine/decider';
import { ExplicationSortie, PourquoiNonDisponible, type AllerAuChamp } from './Explication';
import { AlertesRenales } from './FonctionRenale';
import { rattacherChamp } from '../engine/cibles';

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
 * moins fiables », « fonction rénale instable ») : affichés une seule fois en tête des autres options
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

/**
 * Dose, voie, modalités puis une seule ligne sur la fonction rénale : pas d'adaptation, posologie recommandée
 * (texte du palier de la source) ou adaptation non calculée (raison). Les estimations (DFG, Cockcroft-Gault)
 * ne sont pas répétées ici ; elles restent dans l'onglet Patient.
 */
/** Vrai si la dose est modifiée par rapport à la posologie habituelle (fonction rénale, insuffisance hépatique). */
export function avecAdaptation(p: PrescriptionProposee): boolean {
  return p.renal?.statut === 'adaptee' || (p.autresAdaptations?.length ?? 0) > 0;
}

export function DoseEtRein({ p }: { p: PrescriptionProposee }) {
  const r = p.renal;
  return (
    <>
      <div className="dose-principale">
        {p.doseReference ? (
          <>
            <span className="aide">Dose de référence (fonction rénale normale) :</span> <strong>{p.doseReference}</strong>
          </>
        ) : (
          <strong>{p.doseAffichee}</strong>
        )}{' '}
        — {p.voie}, {p.modalites}
      </div>
      {r && (
        <div className={`rein rein-${r.statut}`}>
          {r.statut === 'adaptee' ? (
            <>
              <strong>Adaptation à la fonction rénale — posologie recommandée :</strong> {r.texte}
            </>
          ) : r.statut === 'non_calculee' ? (
            <>
              <span aria-hidden="true">⚠ </span>
              {r.texte}
              {r.details?.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </>
          ) : (
            r.texte
          )}
        </div>
      )}
      {(p.autresAdaptations ?? []).map((a) => (
        <div key={a} className="adaptation">
          <span aria-hidden="true">↳ </span>
          {a}
        </div>
      ))}
    </>
  );
}

function Prescription({ p, statutOption, communs, dureeAffichee }: { p: PrescriptionProposee; statutOption: OptionTherapeutique['statut']; communs: Set<string>; dureeAffichee: boolean }) {
  const propres = p.avertissements.filter((a) => !communs.has(a));
  const nbCommuns = p.avertissements.length - propres.length;
  return (
    <div className="prescription">
      <div className="dci">
        {p.dci} {p.statut !== statutOption && statutASignaler(p.statut) && <BadgeStatut statut={p.statut} court />}
      </div>
      <div className="dose">
        {p.chargeInitiale && (
          <div>
            <strong>{p.chargeInitiale}</strong>
          </div>
        )}
        <DoseEtRein p={p} />
        {dureeAffichee && <Duree p={p} />}
      </div>
      {propres.map((a, i) => (
        <div key={i} className="avert">
          <span aria-hidden="true">⚠ </span>
          {a}
        </div>
      ))}
      {nbCommuns > 0 && <div className="aide">+ {nbCommuns} avertissement{nbCommuns > 1 ? 's' : ''} commun{nbCommuns > 1 ? 's' : ''} à plusieurs molécules (en tête des autres options).</div>}
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
        {statutASignaler(o.statut) && <BadgeStatut statut={o.statut} court />}
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

function LigneFrise({ e, numero }: { e: EvenementFriseDetaille; numero?: number }) {
  const aDetails = e.pourquoi || e.ensuite || e.precisionMoment || e.cible || e.limites || e.repetition || e.sources.length > 0;
  return (
    <tr className={e.type === 'maintenant' ? 'maintenant' : ''}>
      <th scope="row" className="moment">
        {numero !== undefined && (
          <span className="numero-repere" title={`Repère ${numero} de la frise`}>
            <span className="sr-only">Repère </span>
            {numero}
          </span>
        )}
        {e.moment}
      </th>
      <td>
        <span className="quoi">{e.quoi}</span>
        {e.cible && <div className="cible">Cible : {e.cible}</div>}
        {e.conduite && (
          <div className="conduite">
            <strong>Conduite à tenir :</strong> {e.conduite}
          </div>
        )}
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
              {e.ensuite && e.ensuite !== e.conduite && (
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


/** Ce que bloque une donnée manquante, en un mot (affiché à côté du lien vers le champ). */
const BLOQUE_COURT: Record<DonneeManquante['impact'], string> = {
  bloque_decision: 'choix du traitement',
  bloque_dose: 'dose',
  bloque_duree: 'durée',
  bloque_surveillance: 'surveillance',
  affine: 'pour affiner',
};

/**
 * Tout ce qui manque, en une liste : données manquantes du plan, éléments « à compléter » des motifs
 * « informations manquantes » de l'état de sortie (ex. point d'entrée non choisi, questions pour conclure
 * sur l'indication), dédoublonnés par libellé. Ces motifs ne sont donc plus répétés plus bas.
 */
export function elementsManquants(plan: Plan): DonneeManquante[] {
  const liste: DonneeManquante[] = [...plan.donneesManquantes];
  for (const m of plan.sortie.motifs)
    if (m.type === 'informations_manquantes')
      for (const x of m.aCompleter) liste.push({ champ: x.texte, pourquoi: x.role, impact: x.impact, cible: x.cible ?? rattacherChamp(x.texte).cible });
  const vus = new Set<string>();
  return liste.filter((m) => (vus.has(m.champ) ? false : (vus.add(m.champ), true)));
}

/**
 * Libellé court d'une donnée manquante : sans la précision entre parenthèses finale (gardée dans l'infobulle),
 * sauf si elle énumère des alternatives acceptées (« (ou dosage plasmatique…) »).
 */
function libelleCourt(champ: string): string {
  if (/\(ou [^()]*\)\s*$/.test(champ)) return champ;
  const court = champ.replace(/\s*\([^()]*\)\s*$/, '');
  return court || champ;
}

/**
 * En tête de fiche : la liste des éléments manquants, chacun cliquable vers son champ de saisie
 * (les mêmes champs sont mis en surbrillance dans la saisie).
 */
function ElementsManquants({ manquants, allerAuChamp }: { manquants: DonneeManquante[]; allerAuChamp?: AllerAuChamp }) {
  const idBase = useId();
  if (manquants.length === 0) return null;
  const tries = [...manquants.filter((m) => m.impact !== 'affine'), ...manquants.filter((m) => m.impact === 'affine')];
  return (
    <section className="elements-manquants" aria-labelledby="t-manquants">
      <h3 id="t-manquants">
        <span aria-hidden="true">⚠ </span>Éléments manquants ({tries.length})
      </h3>
      <ul>
        {tries.map((m, i) => {
          const idPourquoi = `${idBase}-${i}`;
          const lien = !!m.cible && !!allerAuChamp;
          return (
            <li key={m.champ} className={m.impact === 'affine' ? 'facultatif' : undefined}>
              {lien ? (
                <button type="button" className="lien-manquant" title={`${m.champ} — ${m.pourquoi}`} aria-label={`Compléter : ${m.champ}`} aria-describedby={idPourquoi} onClick={() => allerAuChamp!(m.cible!)}>
                  {libelleCourt(m.champ)}
                </button>
              ) : (
                <strong>{m.champ}</strong>
              )}{' '}
              <span className="aide">({BLOQUE_COURT[m.impact]})</span>
              {/* Sans champ de saisie associé, le libellé seul peut être obscur : la raison est affichée. */}
              <span id={idPourquoi} className={lien ? 'sr-only' : 'aide'}>
                {lien ? m.pourquoi : ` : ${m.pourquoi}`}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * Élément de surveillance d'une molécule, résumé en une ligne : quoi surveiller (et, pour un dosage,
 * le premier prélèvement et la cible). Le calendrier complet, avec conditions et conduite, reste plus bas.
 */
function texteSurveillance(l: LigneSurveillance): string {
  const e = l.element;
  const conditionnel = e.conditionTexte ? ` — ${e.conditionTexte}` : e.categorie === 'conditionnelle' ? ' (conditionnel)' : e.categorie === 'non_determinable' ? ' (indication non déterminable)' : '';
  if ('parametre' in e) {
    const param = e.parametre === 'residuelle' ? 'résiduelle' : e.parametre === 'auc' ? 'ASC' : e.parametre;
    const cible = e.cible ? ` — cible : ${e.cible.texte}${e.cible.verifiee ? '' : ' (cible non vérifiée dans la source)'}` : '';
    return `Dosage (${param}) ${e.premierPrelevement.quand}${cible}${conditionnel}`;
  }
  return `${e.quoi}${conditionnel}`;
}

/** Motifs de l'état de sortie déjà présentés en tête de fiche (éléments manquants) ou dans la synthèse (raison de ne pas traiter). */
const MOTIFS_DEJA_PRESENTES = ['informations_manquantes', 'non_indiquee'] as const;

/** Synthèse : les informations principales de la fiche (situation, germe, traitement retenu avec dose et durée, surveillance). */
function SyntheseFiche({ plan, choixPrescripteur, explicationVisible, onRetenir }: { plan: Plan; choixPrescripteur: boolean; explicationVisible: boolean; onRetenir?: (id: string) => void }) {
  const ind = plan.indication;
  // Motifs « informations manquantes » du moteur (masqués plus bas) : statut, motif et prochaine action, mot pour mot.
  const etat = plan.sortie.motifs.filter((m) => m.type === 'informations_manquantes');
  const provisoire = elementsManquants(plan).some((m) => m.impact === 'bloque_decision');
  const retenue = plan.options.find((o) => o.id === plan.optionRetenueId) ?? plan.options.find((o) => o.rang === 'premiere_ligne');
  const nonTraiter = ind?.decision === 'ne_pas_traiter';
  const sansTraitement = !!ind && !['traiter', 'urgence'].includes(ind.decision);
  const autresOptions = plan.options.length - (retenue ? 1 : 0);
  const survMolecules = retenue ? retenue.prescriptions.flatMap((p) => p.surveillance.filter((s) => s.element.categorie !== 'non_recommande_routine').map((s) => ({ dci: p.dci, texte: texteSurveillance(s) }))) : [];
  const controles = plan.controles.filter((c) => c.categorie === 'indique');
  const survIndication = sansTraitement && ind ? [...ind.actions, ...ind.surveillance] : [];
  const dureeUnique = retenue && retenue.prescriptions.length > 0 && retenue.prescriptions.every((p) => p.duree.texte === retenue.prescriptions[0].duree.texte && p.duree.pointDeDepart === retenue.prescriptions[0].duree.pointDeDepart);
  const avisUrgents = plan.avisSpecialise.filter((a) => a.urgent);
  return (
    <div className="fiche-section synthese">
      <h3 className="sr-only">Synthèse</h3>
      <dl className="synthese-dl">
        {nonTraiter ? (
          <>
            <dt>Raison de ne pas traiter</dt>
            <dd>{ind!.raison}</dd>
          </>
        ) : (
          <>
            <dt className={retenue ? 'traitement-label' : undefined}>
              {choixPrescripteur ? 'Traitement retenu' : 'Traitement proposé (1re ligne)'}
              {retenue && provisoire ? ' — provisoire' : ''}
            </dt>
            {/* Traitement en vert et gras ; s'il est adapté (rein, foie), c'est l'adaptation qui est en gras. */}
            <dd className={retenue ? `traitement${retenue.prescriptions.some(avecAdaptation) ? ' avec-adaptation' : ''}` : undefined}>
              {etat.map((m) => (
                <div key={m.statut} className="etat-proposition">
                  <strong>{m.statut}</strong> : {m.motif} {m.prochaineAction}
                </div>
              ))}
              {retenue ? (
                <>
                  <strong className="traitement-nom">{retenue.libelle}</strong> {statutASignaler(retenue.statut) && <BadgeStatut statut={retenue.statut} court />}
                  {retenue.condition && <div className="aide">Condition : {retenue.condition}</div>}
                  {retenue.prescriptions.map((p) => (
                    <div key={p.regimenId} className="synthese-prescription">
                      {/* Nom de la molécule seulement s'il n'est pas déjà le libellé de l'option (ex. « Amoxicilline »). */}
                      {(retenue.prescriptions.length > 1 || p.dci.toLowerCase() !== retenue.libelle.toLowerCase() || (p.statut !== retenue.statut && statutASignaler(p.statut))) && (
                        <div className="dci">
                          <strong>{p.dci}</strong> {p.statut !== retenue.statut && statutASignaler(p.statut) && <BadgeStatut statut={p.statut} court />}
                        </div>
                      )}
                      {p.chargeInitiale && (
                        <div className="dose-principale">
                          <strong>{p.chargeInitiale}</strong> ; puis :
                        </div>
                      )}
                      <DoseEtRein p={p} />
                      {p.avertissements.map((a) => (
                        <div key={a} className="avert">
                          <span aria-hidden="true">⚠ </span>
                          {a}
                        </div>
                      ))}
                      {!dureeUnique && (
                        <div>
                          Durée : {p.duree.texte} <span className="aide">(à partir de : {p.duree.pointDeDepart})</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {dureeUnique && (
                    <div>
                      Durée : {retenue.prescriptions[0].duree.texte} <span className="aide">(à partir de : {retenue.prescriptions[0].duree.pointDeDepart})</span>
                    </div>
                  )}
                  {retenue.commentaire && <p className="aide">{retenue.commentaire}</p>}
                  <RefsInline refs={retenue.sources} />
                  {autresOptions > 0 && <div className="aide">{autresOptions} autre{autresOptions > 1 ? 's' : ''} option{autresOptions > 1 ? 's' : ''} : voir « Autres options » ci-dessous.</div>}
                  {onRetenir && !choixPrescripteur && (
                    <div className="actions-traitement">
                      <button type="button" className="btn retenir-traitement" onClick={() => onRetenir(retenue.id)}>
                        Retenir ce traitement
                      </button>
                    </div>
                  )}
                </>
              ) : ind && sansTraitement ? (
                LIBELLE_DECISION[ind.decision]
              ) : plan.options.length === 0 ? (
                `aucun traitement proposé par l’application${explicationVisible ? ' : voir l’explication ci-dessous' : ''}.`
              ) : (
                'aucune option de 1re ligne : voir « Autres options » ci-dessous.'
              )}
            </dd>
          </>
        )}
        {survMolecules.length + controles.length + survIndication.length > 0 && (
          <>
            <dt>{sansTraitement ? 'À faire et surveillance' : 'Surveillance'}</dt>
            <dd>
              <ul>
                {survIndication.map((x) => (
                  <li key={x}>{x}</li>
                ))}
                {survMolecules.map((s) => (
                  <li key={`${s.dci}-${s.texte}`}>
                    {retenue && retenue.prescriptions.length > 1 ? `${s.dci} — ` : ''}
                    {s.texte}
                  </li>
                ))}
                {controles.map((c) => (
                  <li key={c.id}>
                    {c.quoi} : {c.quand.texte}
                  </li>
                ))}
              </ul>
              {!sansTraitement && <span className="aide">Moments, conditions et conduite : calendrier ci-dessous.</span>}
            </dd>
          </>
        )}
        {avisUrgents.length > 0 && (
          <>
            <dt>Avis</dt>
            <dd>{avisUrgents.map((a) => a.texte).join(' ; ')}</dd>
          </>
        )}
      </dl>
    </div>
  );
}

/** En-tête de la fiche : couverture de la situation, situation en titre, indication et germe en sous-titre. */
function EnteteFiche({ plan }: { plan: Plan }) {
  const ind = plan.indication;
  const couv = plan.situation.couverture;
  const germes = plan.microbiologie.length ? plan.microbiologie.map((m) => m.germe).join(' ; ') : 'germe non identifié';
  const determinants = plan.microbiologie.flatMap((m) => m.determinants.map((x) => `${plan.microbiologie.length > 1 ? `${m.germe} — ` : ''}${x.texte}`));
  const inconnues = plan.microbiologie.flatMap((m) => m.inconnues.map((x) => `${plan.microbiologie.length > 1 ? `${m.germe} — ` : ''}${x.texte}`));
  return (
    <div className="entete-fiche">
      <Badge type={couv === 'couverte' ? 'ok' : couv === 'partielle' ? 'attention' : 'urgence'}>{couv === 'couverte' ? 'situation couverte' : couv === 'partielle' ? 'partiellement couverte' : 'non couverte'}</Badge>
      <h2 id="t-fiche">
        <span className="sr-only">Prise en charge : </span>
        {plan.situation.libelle}
      </h2>
      <p className="sous-titre">
        {ind && (
          <>
            Indication : <strong>{indicationOuiNon(ind)}</strong> — {LIBELLE_DECISION[ind.decision]} ·{' '}
          </>
        )}
        {plan.microbiologie.length > 1 ? 'Germes : ' : plan.microbiologie.length ? 'Germe : ' : ''}
        {germes}
      </p>
      {determinants.length > 0 && <p className="aide">{determinants.join(' ; ')}</p>}
      {inconnues.length > 0 && <p className="aide">À préciser : {inconnues.join(' ; ')}</p>}
    </div>
  );
}

export function PanneauResultat({ plan, onRetenir, dossier, allerAuChamp, changements = [], demanderAvis }: { plan: Plan; onRetenir?: (id: string) => void; dossier?: Dossier; allerAuChamp?: AllerAuChamp; changements?: string[]; demanderAvis?: () => void }) {
  const ind = plan.indication;
  const conclusionSansTraitement = !!ind && !['traiter', 'urgence'].includes(ind.decision);
  const niveau = plan.urgence.niveau;
  const premieres = plan.options.filter((o) => o.rang === 'premiere_ligne');
  // Option présentée dans la synthèse (retenue par le prescripteur, sinon la 1re ligne) ; les autres sont repliées.
  const affichee = plan.options.find((o) => o.id === plan.optionRetenueId) ?? premieres[0];
  const autres = plan.options.filter((o) => o !== affichee);
  const urgentes = alertesUrgentes(plan);
  const autresAlertes = plan.urgence.alertes.filter((a) => a.niveau !== 'urgence');
  const communs = avertissementsCommuns(plan);
  const communsSet = new Set(communs.map((c) => c.texte));
  const frise = plan.frise as EvenementFriseDetaille[];
  const friseDatee = frise.some((e) => e.dateISO);
  const reperes = numerosReperes(frise);
  const optionRetenue = plan.options.find((o) => o.id === plan.optionRetenueId);
  const manquants = elementsManquants(plan);
  const explicationVisible = plan.sortie.traitement !== 'complet' && (plan.sortie.motifs.some((m) => !(MOTIFS_DEJA_PRESENTES as readonly string[]).includes(m.type)) || plan.sortie.urgence);
  // Toutes les sources citées dans la fiche (le registre du plan n'inclut pas celles de l'indication, de la lecture microbiologique ni du calendrier).
  const toutesSources = dedupSources([
    ...plan.sources,
    ...(ind?.sources ?? []),
    ...(plan.indicationsSecondaires ?? []).flatMap((i) => i.sources),
    ...plan.microbiologie.flatMap((m) => [...m.determinants, ...m.incoherences, ...m.sensiblesNonRetenues].flatMap((x) => x.sources)),
    ...frise.flatMap((e) => e.sources),
  ]);
  return (
    <section className={`carte fiche ${niveau === 'immediate' ? 'urgence' : niveau === 'elevee' ? 'attention' : ''}`} aria-labelledby="t-fiche">
      <p className="sr-only" role="status" aria-live="polite">
        Prise en charge recalculée : {ind ? `${LIBELLE_DECISION[ind.decision]} ; ` : ''}{LIBELLE_URGENCE[niveau]} ; {plan.options.length} option(s)
        {urgentes.length ? ` ; ${urgentes.length} alerte(s) urgente(s)` : ''}.
      </p>
      <EnteteFiche plan={plan} />

      {changements.length > 0 && (
        <div className="alerte attention changements" role="status">
          <strong>Votre dernière modification change la proposition :</strong>
          <ul>
            {changements.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      )}
      <ElementsManquants manquants={manquants} allerAuChamp={allerAuChamp} />
      <SyntheseFiche plan={plan} choixPrescripteur={!!dossier?.optionRetenueId} explicationVisible={explicationVisible} onRetenir={onRetenir} />
      {autresAlertes.length > 0 && (
        <div className="fiche-section bloc-points">
        <h3 aria-hidden="true">Points d’attention</h3>
        <ul className="points-attention" aria-label="Points d'attention">
          {autresAlertes.map((a, i) => (
            <li key={i} className={a.niveau}>
              <span aria-hidden="true">{a.niveau === 'info' ? 'ℹ ' : '⚠ '}</span>
              <span className="sr-only">{a.niveau === 'info' ? 'Information : ' : 'Attention : '}</span>
              {a.texte} {a.sources && a.sources.length > 0 && <RefsInline refs={a.sources} />}
            </li>
          ))}
        </ul>
        </div>
      )}

      <div className="fiche-section">
        {conclusionSansTraitement && <h3>Conclusion sur l'indication</h3>}
        {plan.sortie.traitement !== 'complet' && <ExplicationSortie sortie={plan.sortie} allerAuChamp={allerAuChamp} masquer={[...MOTIFS_DEJA_PRESENTES]} />}
        <LectureMicrobiologique plan={plan} />
        {ind &&
          (conclusionSansTraitement || ind.decision === 'urgence' || ind.actions.length > 0 || plan.options.length === 0) &&
          (plan.sortie.traitement !== 'complet' && plan.sortie.motifs.some((m) => m.origine.includes(ind.regleId) && !(MOTIFS_DEJA_PRESENTES as readonly string[]).includes(m.type)) ? (
            <details className="detail-conclusion">
              <summary>Détail de la conclusion clinique ({ind.titre})</summary>
              <CarteIndication indication={ind} />
            </details>
          ) : (
            <CarteIndication indication={ind} />
          ))}
        {(plan.indicationsSecondaires?.length ?? 0) > 0 && (
          <details open>
            <summary>Autres conclusions ({plan.indicationsSecondaires!.length})</summary>
            {plan.indicationsSecondaires!.map((i) => (
              <CarteIndication key={`${i.regleId}-${i.titre}`} indication={i} />
            ))}
          </details>
        )}
        {plan.options.length > 0 && premieres.length === 0 && <p className="aide">Aucune option de 1re ligne avec les données actuelles : voir les autres options ci-dessous.</p>}
        {/* Le traitement de la synthèse n'est pas répété : seules les autres options sont listées, repliées. */}
        {autres.length > 0 && (
          <details className="autres-options" open={!affichee}>
            <summary>Autres options : alternatives et options conditionnelles ({autres.length})</summary>
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
            {autres.map((o) => (
              <Option key={o.id} o={o} retenue={plan.optionRetenueId === o.id} onRetenir={onRetenir} communs={communsSet} />
            ))}
          </details>
        )}
        <PourquoiNonDisponible ecartees={plan.sortie.ecartees} />
      </div>

      {plan.gestes.length > 0 && (
        <div className="fiche-section">
          <h3>Contrôle du foyer et gestes</h3>
          <ul>
            {plan.gestes.map((g, i) => (
              <li key={i}>
                {g.texte} <RefsInline refs={g.sources} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="fiche-section">
        <h3>Calendrier de surveillance et de contrôles</h3>
        {optionRetenue && <p className="aide">Calendrier établi pour l'option : {optionRetenue.libelle}.</p>}
        {frise.length > 0 && <p className="aide">{friseDatee ? 'Dates calculées à partir des horaires saisis et des délais explicites des sources ; les autres moments restent relatifs.' : 'Aucun horaire saisi : moments relatifs, sans date inventée. Saisir l\'heure de la 1re dose pour dater le calendrier.'}</p>}
        {frise.length === 0 ? (
          <p className="aide">{conclusionSansTraitement ? 'Pas de calendrier de surveillance d’antibiotique : aucun traitement n’est proposé.' : 'Aucun calendrier ne peut être établi sans proposition thérapeutique.'}</p>
        ) : (
          <>
          <FriseGraphique frise={frise} option={affichee} />
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
                <LigneFrise key={e.id} e={e} numero={reperes.get(e.id)} />
              ))}
            </tbody>
          </table>
          </>
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
        <h3>Réévaluation et avis spécialisé</h3>
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
        <h3>Situation</h3>
        <p className="aide">{plan.situation.description}</p>
        {dossier && <AlertesRenales dossier={dossier} allerAuChamp={allerAuChamp} />}
      </div>

      <div className="fiche-section fin-fiche">
        {demanderAvis && (
          <button type="button" className="btn secondaire demander-avis" onClick={demanderAvis}>
            Demander un avis SMIT
          </button>
        )}
        <details>
          <summary>Sources de cette prise en charge ({toutesSources.length})</summary>
          <ListeSources refs={toutesSources} />
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
        {plan.contientReglesNonValidees && (
          <p className="aide">
            Règles <strong>non validées par un humain</strong> (version {plan.versionClinique}) ; « vérifiée par IA » ne vaut pas validation médicale. Ne remplace ni l'avis du SMIT ni le jugement du prescripteur.
          </p>
        )}
      </div>
    </section>
  );
}
