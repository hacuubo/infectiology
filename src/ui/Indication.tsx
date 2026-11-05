/**
 * Étape « Faut-il traiter ? » : questions cliniques utiles à la décision,
 * et présentation de la conclusion (y compris « pas d'antibiothérapie indiquée »).
 */
import type { Clinique, GesteUrologique, IndicationPlan, Plan, TriState } from '../clinical/types';
import type { Dossier } from '../engine/etat';
import { GESTES } from '../clinical/indication/ecbu';
import { construireContexte } from '../engine/contexte';
import { LIBELLE_FOYER } from './libelles';
import { Badge, BadgeStatut, ChoixRadio, ChoixTri, ListeSources, RefsInline, Select } from './composants';

type Modifier = (fn: (d: Dossier) => void) => void;

export function pertinenceClinique(d: Dossier) {
  const urine = d.prelevements.some((x) => x.type === 'urine');
  const syndromeUrinaire = d.syndrome === 'urinaire';
  const superficiel = d.prelevements.some((x) => x.type === 'superficiel');
  const c = d.clinique;
  return {
    fievre: urine || syndromeUrinaire || superficiel,
    signesUrinaires: urine || syndromeUrinaire,
    signesNonSpecifiques: urine,
    autreFoyer: urine && (c.fievre === 'oui' || c.signesNonSpecifiques === 'oui'),
    geste: urine,
    signesInfectionLocale: superficiel,
  };
}

export function SectionIndication({ dossier, modifier }: { dossier: Dossier; modifier: Modifier }) {
  const d = dossier;
  const c = d.clinique;
  const pert = pertinenceClinique(d);
  if (!Object.values(pert).some(Boolean)) return null;
  const set = <K extends keyof Clinique>(k: K, v: Clinique[K]) => modifier((x) => (x.clinique[k] = v));
  return (
    <section className="carte" aria-labelledby="t-indication">
      <h2 id="t-indication">Étape 1 — Faut-il traiter ?</h2>
      <p className="aide">Une culture positive n'est pas, à elle seule, une indication d'antibiotique. Ces réponses distinguent infection, colonisation et prélèvement contaminé.</p>
      {pert.signesUrinaires && (
        <ChoixRadio
          libelle="Signes urinaires"
          aide="Brûlures, pollakiurie, impériosité, douleur sus-pubienne, lombaire ou pelvienne. Une hématurie ou une rétention isolées ne sont pas des signes d'infection urinaire."
          valeur={c.signesUrinaires}
          options={[
            { v: 'nouveaux', l: 'Présents, récents' },
            { v: 'chroniques_inchanges', l: 'Anciens, inchangés' },
            { v: 'absents', l: 'Absents' },
            { v: 'inconnu', l: 'Inconnu' },
          ]}
          onChange={(v) => set('signesUrinaires', v)}
        />
      )}
      {pert.fievre && <ChoixTri libelle="Fièvre ≥ 38 °C ou hypothermie < 36 °C" valeur={c.fievre} onChange={(v: TriState) => set('fievre', v)} />}
      {pert.signesNonSpecifiques && (
        <ChoixTri
          libelle="Signes non spécifiques (confusion, chute, perte d'autonomie, altération de l'état général)"
          aide="Surtout chez la personne âgée : ils ne doivent pas être attribués à une bactériurie sans signe urinaire ni fièvre."
          valeur={c.signesNonSpecifiques}
          onChange={(v: TriState) => set('signesNonSpecifiques', v)}
        />
      )}
      {pert.autreFoyer && (
        <ChoixRadio
          libelle="Un autre foyer peut-il expliquer ces signes ?"
          valeur={c.autreFoyer}
          options={[
            { v: 'identifie', l: 'Oui, un autre foyer est identifié' },
            { v: 'recherche_negative', l: 'Recherché, aucun trouvé' },
            { v: 'non_recherche', l: 'Pas encore recherché' },
          ]}
          onChange={(v) => set('autreFoyer', v)}
        />
      )}
      {pert.geste && (
        <Select
          libelle="Geste urologique prévu"
          aide="Tous les gestes ne sont pas équivalents : avant certains, une colonisation se traite ; avant d'autres, elle ne se recherche pas (AFU 2026)."
          valeur={c.gesteUrologique}
          options={(Object.keys(GESTES) as GesteUrologique[]).map((g) => ({ v: g, l: g === 'inconnu' ? '— non renseigné —' : GESTES[g].libelle }))}
          onChange={(v) => set('gesteUrologique', v)}
        />
      )}
      {pert.signesInfectionLocale && (
        <ChoixTri libelle="Signes cliniques d'infection de la plaie (pus, abcès, dermohypodermite, aggravation)" aide="Une plaie est toujours colonisée : l'infection se définit cliniquement." valeur={c.signesInfectionLocale} onChange={(v: TriState) => set('signesInfectionLocale', v)} />
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Résultat                                                            */
/* ------------------------------------------------------------------ */

export const LIBELLE_DECISION: Record<IndicationPlan['decision'], string> = {
  traiter: 'Traitement indiqué',
  urgence: 'Urgence : traiter sans attendre',
  ne_pas_traiter: 'Pas d\'antibiothérapie indiquée',
  informations_insuffisantes: 'Informations insuffisantes',
  attendre_resultat: 'Attendre un résultat',
};
const LIBELLE_QUALIF: Record<IndicationPlan['qualification'], string> = {
  infection: 'infection',
  infection_probable: 'infection probable',
  colonisation: 'colonisation',
  contamination_possible: 'contamination possible',
  indeterminee: 'signification indéterminée',
};

export function indicationOuiNon(i: IndicationPlan | undefined): 'oui' | 'non' | 'indéterminée' {
  if (!i) return 'indéterminée';
  if (i.decision === 'traiter' || i.decision === 'urgence') return 'oui';
  if (i.decision === 'ne_pas_traiter') return 'non';
  return 'indéterminée';
}

function Liste({ titre, items }: { titre: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="bloc-liste">
      <strong>{titre}</strong>
      <ul>
        {items.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    </div>
  );
}

/** Conclusion clinique complète, aussi lisible qu'une proposition de traitement. */
export function CarteIndication({ indication }: { indication: IndicationPlan }) {
  const type = indication.decision === 'urgence' ? 'urgence' : indication.decision === 'ne_pas_traiter' ? 'ok' : indication.decision === 'traiter' ? 'accent' : 'attention';
  return (
    <div className={`option carte-indication decision-${indication.decision}`}>
      <div className="titre">
        <strong>{indication.titre}</strong> <Badge type={type}>{LIBELLE_DECISION[indication.decision]}</Badge> <Badge>{LIBELLE_QUALIF[indication.qualification]}</Badge> <BadgeStatut statut={indication.statut} court />
      </div>
      <p>{indication.raison}</p>
      <Liste titre="Ce qui justifie cette conclusion" items={indication.conditions} />
      <Liste titre="Exceptions recherchées" items={indication.exceptions} />
      <Liste titre="Pour conclure, il manque" items={indication.questions} />
      <Liste titre="À faire" items={indication.actions} />
      <Liste titre="Surveillance" items={indication.surveillance} />
      <Liste titre="Reconsidérer la décision si" items={indication.reconsiderer} />
      <details className="discret">
        <summary>Voir la recommandation ({indication.sources.length})</summary>
        <ListeSources refs={indication.sources} />
      </details>
    </div>
  );
}

/** Étapes du parcours : indication → foyer et germe → résultats déterminants → prise en charge. */
export function EtapesParcours({ plan, dossier }: { plan: Plan; dossier: Dossier }) {
  const ind = indicationOuiNon(plan.indication);
  const germes = plan.microbiologie.map((m) => m.germe);
  const ctx = construireContexte(dossier);
  const foyer = ctx.foyer !== 'inconnu' ? ctx.foyer : undefined;
  const inconnues = plan.microbiologie.reduce((n, m) => n + m.inconnues.length, 0);
  const premiere = plan.options.find((o) => o.id === plan.optionRetenueId) ?? plan.options.find((o) => o.rang === 'premiere_ligne');
  const etapes = [
    { n: 1, t: 'Indication', v: ind === 'oui' ? 'oui' : ind === 'non' ? 'non' : 'indéterminée', ok: ind !== 'indéterminée' },
    { n: 2, t: 'Foyer et germe', v: `${foyer ? LIBELLE_FOYER[foyer] : 'foyer à préciser'}${germes.length ? ` ; ${germes.join(', ')}` : ''}`, ok: !!foyer && germes.length > 0 },
    { n: 3, t: 'Résultats déterminants', v: germes.length === 0 ? 'aucun germe' : plan.indication?.decision === 'ne_pas_traiter' ? 'non nécessaires' : inconnues === 0 ? 'complets' : `${inconnues} à préciser`, ok: germes.length > 0 && (inconnues === 0 || plan.indication?.decision === 'ne_pas_traiter') },
    { n: 4, t: 'Prise en charge', v: plan.indication?.decision === 'ne_pas_traiter' ? 'pas d\'antibiotique' : premiere ? premiere.libelle : 'non établie', ok: plan.indication?.decision === 'ne_pas_traiter' || !!premiere },
  ];
  return (
    <ol className="etapes" aria-label="Étapes du parcours">
      {etapes.map((e) => (
        <li key={e.n} className={e.ok ? 'fait' : 'a-faire'}>
          <span className="num">{e.n}</span> <strong>{e.t}</strong> : {e.v}
        </li>
      ))}
    </ol>
  );
}

/** Synthèse : indication, germe, résultats déterminants, inconnues, traitement ou raison de ne pas traiter. */
export function SyntheseDecision({ plan }: { plan: Plan }) {
  const ind = plan.indication;
  const premiere = plan.options.find((o) => o.id === plan.optionRetenueId) ?? plan.options.find((o) => o.rang === 'premiere_ligne');
  return (
    <div className="fiche-section synthese">
      <h3>Synthèse</h3>
      <dl className="synthese-dl">
        <dt>Indication de traitement</dt>
        <dd>
          <strong>{indicationOuiNon(ind)}</strong>
          {ind && (
            <>
              {' '}
              — {LIBELLE_DECISION[ind.decision]} ({LIBELLE_QUALIF[ind.qualification]})
            </>
          )}
        </dd>
        <dt>Germe{plan.microbiologie.length > 1 ? 's' : ''}</dt>
        <dd>{plan.microbiologie.length ? plan.microbiologie.map((m) => m.germe).join(' ; ') : 'non identifié'}</dd>
        {plan.microbiologie.some((m) => m.determinants.length > 0) && (
          <>
            <dt>Résultats déterminants</dt>
            <dd>
              <ul>
                {plan.microbiologie.flatMap((m) => m.determinants.map((x) => <li key={`${m.isolatId}-${x.texte}`}>{plan.microbiologie.length > 1 ? `${m.germe} — ` : ''}{x.texte}</li>))}
              </ul>
            </dd>
          </>
        )}
        {plan.microbiologie.some((m) => m.inconnues.length > 0) && (
          <>
            <dt>Encore inconnu</dt>
            <dd>
              <ul>
                {plan.microbiologie.flatMap((m) => m.inconnues.map((x) => <li key={`${m.isolatId}-${x.texte}`} title={x.pourquoi}>{plan.microbiologie.length > 1 ? `${m.germe} — ` : ''}{x.texte}</li>))}
              </ul>
            </dd>
          </>
        )}
        <dt>{ind?.decision === 'ne_pas_traiter' ? 'Raison de ne pas traiter' : 'Traitement retenu'}</dt>
        <dd>{ind?.decision === 'ne_pas_traiter' ? ind.raison : premiere ? premiere.libelle : ind && ind.decision !== 'traiter' && ind.decision !== 'urgence' ? LIBELLE_DECISION[ind.decision] : 'aucune option de 1re ligne'}</dd>
        <dt>Surveillance et contrôles</dt>
        <dd>
          {plan.surveillance.length + plan.controles.length + (ind?.surveillance.length ?? 0) > 0 ? `${plan.surveillance.length} élément(s) de surveillance, ${plan.controles.length} contrôle(s)${ind?.surveillance.length ? ', surveillance clinique' : ''} — voir C` : 'aucun'}
        </dd>
        <dt>Sources</dt>
        <dd>{plan.sources.length} référence(s) — voir E</dd>
      </dl>
    </div>
  );
}

/** Lecture microbiologique par isolat : incohérences et molécules sensibles non retenues. */
export function LectureMicrobiologique({ plan }: { plan: Plan }) {
  const avec = plan.microbiologie.filter((m) => m.incoherences.length > 0 || m.sensiblesNonRetenues.length > 0);
  if (avec.length === 0) return null;
  return (
    <div className="lecture-micro">
      {avec.map((m) => (
        <div key={`${m.prelevementId}-${m.isolatId}`}>
          {m.incoherences.map((x) => (
            <div key={x.texte} className="alerte attention">
              <strong>{m.germe} — résultat à vérifier :</strong> {x.texte}
              {x.sources.length > 0 && <RefsInline refs={x.sources} />}
            </div>
          ))}
          {m.sensiblesNonRetenues.length > 0 && (
            <div className="alerte info">
              <strong>{m.germe} — sensible ne veut pas dire indiqué :</strong>
              <ul>
                {m.sensiblesNonRetenues.map((x) => (
                  <li key={x.dci}>
                    {x.dci} : {x.raison}
                    <RefsInline refs={x.sources} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
