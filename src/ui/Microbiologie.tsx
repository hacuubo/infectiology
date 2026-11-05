/**
 * Saisie microbiologique guidée : contexte de l'ECBU, isolats (prélèvement polymicrobien)
 * et antibiogramme guidé par le germe et le contexte.
 */
import { useId } from 'react';
import type { CategorieSaisie, DonneesIsolat, EtatPhenotype, Isolat, OrganismeId, Prelevement } from '../clinical/types';
import type { Dossier } from '../engine/etat';
import { construireContexte } from '../engine/contexte';
import { nouvelIsolat } from '../engine/etat';
import { contexteGuide } from '../clinical/microbiologie/analyse';
import { AIDE_I, categorieDe, etatPhenotype, guideAntibiogramme, type QuestionMicro } from '../clinical/microbiologie/guide';
import { Champ, ChampTexte, ChoixRadio, GroupeRadio, RefsInline, Select } from './composants';
import { GROUPES_ORGANISMES, LIBELLE_ORGANISME } from './libelles';

type MajIsolat = (fn: (i: DonneesIsolat) => void) => void;

/* ------------------------------------------------------------------ */
/* ECBU                                                                */
/* ------------------------------------------------------------------ */

export function ContexteECBUSaisie({ prl, maj }: { prl: Prelevement; maj: (fn: (p: Prelevement) => void) => void }) {
  const u = prl.urine ?? { motif: 'inconnu', recueil: 'inconnu', nbEspeces: 'inconnu' };
  const set = (fn: (x: NonNullable<Prelevement['urine']>) => void) =>
    maj((p) => {
      if (!p.urine) p.urine = { motif: 'inconnu', recueil: 'inconnu', nbEspeces: 'inconnu' };
      fn(p.urine);
    });
  return (
    <div className="sous-bloc">
      <Select
        libelle="Pourquoi cet ECBU a-t-il été fait ?"
        aide="Un ECBU de dépistage ou de contrôle sans symptôme n'a pas la même signification qu'un ECBU fait pour des signes urinaires."
        valeur={u.motif}
        options={[
          { v: 'inconnu', l: '— non renseigné —' },
          { v: 'signes_urinaires', l: 'Signes urinaires' },
          { v: 'fievre', l: 'Fièvre' },
          { v: 'signes_non_specifiques', l: 'Confusion, chute ou altération générale' },
          { v: 'depistage_grossesse', l: 'Dépistage pendant la grossesse' },
          { v: 'avant_geste_urologique', l: 'Bilan avant geste urologique' },
          { v: 'systematique', l: 'Systématique, sans symptôme (entrée, bilan)' },
          { v: 'controle_apres_traitement', l: 'Contrôle après traitement' },
          { v: 'autre', l: 'Autre' },
        ]}
        onChange={(v) => set((x) => (x.motif = v))}
      />
      <ChoixRadio
        libelle="Mode de recueil"
        aide="Sur sonde : ponction de l'opercule, jamais dans le sac collecteur."
        valeur={u.recueil}
        options={[
          { v: 'mi_jet', l: 'Milieu de jet' },
          { v: 'sondage_aller_retour', l: 'Sondage aller-retour' },
          { v: 'sonde_a_demeure', l: 'Opercule de sonde à demeure' },
          { v: 'collecteur', l: 'Poche ou sac collecteur' },
          { v: 'nephrostomie_ou_derivation', l: 'Néphrostomie ou dérivation' },
          { v: 'inconnu', l: 'Inconnu' },
        ]}
        onChange={(v) => set((x) => (x.recueil = v))}
      />
      <ChoixRadio
        libelle="Nombre d'espèces rapportées"
        aide="Au-delà de deux espèces, le laboratoire ne poursuit pas l'analyse : contamination probable."
        valeur={u.nbEspeces}
        options={[
          { v: 'une', l: 'Une' },
          { v: 'deux', l: 'Deux' },
          { v: 'trois_ou_plus', l: 'Trois ou plus' },
          { v: 'inconnu', l: 'Inconnu' },
        ]}
        onChange={(v) => set((x) => (x.nbEspeces = v))}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Organisme                                                           */
/* ------------------------------------------------------------------ */

export function SelectOrganisme({ valeur, libre, onChange, onLibre, libelle = 'Organisme identifié' }: { valeur?: OrganismeId; libre?: string; onChange: (v: OrganismeId | undefined) => void; onLibre: (v: string | undefined) => void; libelle?: string }) {
  const id = useId();
  return (
    <Champ libelle={libelle} id={id} aide="Choisissez le groupe si l'espèce n'est pas encore connue (ex. « BGN non identifié »). Changer de germe efface les résultats d'antibiogramme saisis pour l'ancien.">
      <select id={id} value={valeur ?? ''} onChange={(e) => onChange((e.target.value || undefined) as OrganismeId | undefined)}>
        <option value="">— choisir —</option>
        {GROUPES_ORGANISMES.map((g) => (
          <optgroup key={g.titre} label={g.titre}>
            {g.ids.map((o) => (
              <option key={o} value={o}>
                {LIBELLE_ORGANISME[o]}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {valeur === 'autre' && <input type="text" aria-label="Précisez l'organisme" placeholder="Précisez l'organisme" value={libre ?? ''} onChange={(e) => onLibre(e.target.value || undefined)} />}
    </Champ>
  );
}

/* ------------------------------------------------------------------ */
/* Antibiogramme guidé                                                 */
/* ------------------------------------------------------------------ */

const LIB_CAT: Record<CategorieSaisie, string> = { S: 'S', I: 'I', R: 'R', NT: 'Non testé' };
const AIDE_CAT: Record<CategorieSaisie, string> = { S: 'Sensible (posologie standard)', I: 'Sensible à forte posologie', R: 'Résistant', NT: 'Non testé, en attente ou non renseigné' };

function CarteQuestion({ q, iso, maj }: { q: QuestionMicro; iso: DonneesIsolat; maj: MajIsolat }) {
  const id = useId();
  const marquer = (i: DonneesIsolat) => {
    i.antibiogrammePour = i.organisme;
  };
  if (q.type === 'phenotype') {
    const valeur = iso.phenotypes?.[q.phenotype];
    return (
      <div className="carte-question" role="group" aria-labelledby={id}>
        <div className="q-titre" id={id}>
          {q.libelle}
        </div>
        <div className="aide">Sur le compte rendu : {q.compteRendu}</div>
        <div className="aide">{q.aide}</div>
        <GroupeRadio
          libelleId={id}
          valeur={valeur}
          options={(['present', 'absent', 'non_rapporte'] as EtatPhenotype[]).map((e) => ({ v: e, l: q.etats[e] }))}
          classeOption={(v) => (v === 'non_rapporte' ? 'inconnu' : '')}
          onChange={(v) =>
            maj((i) => {
              const cur = i.phenotypes ?? {};
              if (cur[q.phenotype] === v) delete cur[q.phenotype];
              else cur[q.phenotype] = v;
              i.phenotypes = Object.keys(cur).length ? { ...cur } : undefined;
              marquer(i);
            })
          }
        />
        <Pourquoi q={q} />
      </div>
    );
  }
  const valeur = categorieDe(iso, q.dci);
  const cmi = iso.antibiogramme?.find((r) => r.dci === q.dci)?.cmi;
  return (
    <div className="carte-question" role="group" aria-labelledby={id}>
      <div className="q-titre" id={id}>
        {q.libelle}
      </div>
      <div className="aide">Sur le compte rendu : {q.compteRendu}</div>
      {q.aide !== AIDE_I && <div className="aide">{q.aide}</div>}
      <GroupeRadio
        libelleId={id}
        valeur={valeur}
        options={(['S', 'I', 'R', 'NT'] as CategorieSaisie[]).map((c) => ({ v: c, l: LIB_CAT[c], aide: AIDE_CAT[c] }))}
        classeOption={(v) => (v === 'NT' ? 'inconnu' : '')}
        onChange={(c) =>
          maj((i) => {
            const autres = (i.antibiogramme ?? []).filter((r) => r.dci !== q.dci);
            const actuel = (i.antibiogramme ?? []).find((r) => r.dci === q.dci);
            if (actuel?.categorie !== c) autres.push({ dci: q.dci, categorie: c, cmi: actuel?.cmi });
            i.antibiogramme = autres.length ? autres : undefined;
            marquer(i);
          })
        }
      />
      {q.cmi && (
        <label className="ligne">
          <span className="aide">CMI (mg/L), si rendue — {q.cmi}</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            style={{ width: 110 }}
            aria-label={`CMI de ${q.libelle} (mg/L)`}
            value={cmi ?? ''}
            onChange={(e) =>
              maj((i) => {
                const v = e.target.value === '' ? undefined : Number(e.target.value);
                const l = i.antibiogramme ?? [];
                const r = l.find((x) => x.dci === q.dci);
                const ok = v !== undefined && Number.isFinite(v) && v >= 0 ? v : undefined;
                if (r) r.cmi = ok;
                else if (ok !== undefined) l.push({ dci: q.dci, categorie: 'NT', cmi: ok });
                i.antibiogramme = l.length ? [...l] : undefined;
                marquer(i);
              })
            }
          />
        </label>
      )}
      <Pourquoi q={q} />
    </div>
  );
}

function Pourquoi({ q }: { q: QuestionMicro }) {
  return (
    <details className="discret">
      <summary>Pourquoi cette question ?</summary>
      <p className="aide">{q.utilite}</p>
      {q.sources.length > 0 && <RefsInline refs={q.sources} />}
    </details>
  );
}

export function AntibiogrammeGuide({ iso, prl, dossier, maj }: { iso: DonneesIsolat; prl: Prelevement; dossier: Dossier; maj: MajIsolat }) {
  const ctx = construireContexte(dossier);
  const cg = contexteGuide(ctx, prl, iso);
  const guide = guideAntibiogramme(iso, cg);
  const groupes = [...new Set(guide.essentielles.map((q) => q.groupe))];
  const nbAutres = guide.complementaires.filter((q) => (q.type === 'molecule' ? categorieDe(iso, q.dci) !== undefined : etatPhenotype(iso, q.phenotype) !== 'non_rapporte')).length;
  return (
    <div className="sous-bloc antibiogramme-guide">
      <p className="aide">
        Seuls les résultats qui peuvent changer la décision sont demandés. Une case sans réponse n'est jamais lue comme « sensible » ni « absent ». {AIDE_I}
      </p>
      {guide.message && <p className="alerte info">{guide.message}</p>}
      {groupes.map((g) => (
        <fieldset key={g} className="groupe-questions">
          <legend>{g}</legend>
          {guide.essentielles
            .filter((q) => q.groupe === g)
            .map((q) => (
              <CarteQuestion key={q.id} q={q} iso={iso} maj={maj} />
            ))}
        </fieldset>
      ))}
      {guide.complementaires.length > 0 && (
        <details>
          <summary>
            Ajouter d'autres résultats{nbAutres > 0 ? ` (${nbAutres} saisi${nbAutres > 1 ? 's' : ''})` : ''}
          </summary>
          <div className="groupe-questions">
            {guide.complementaires.map((q) => (
              <CarteQuestion key={q.id} q={q} iso={iso} maj={maj} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Isolats supplémentaires (prélèvement polymicrobien)                 */
/* ------------------------------------------------------------------ */

export function IsolatsSupplementaires({ prl, dossier, majPrl }: { prl: Prelevement; dossier: Dossier; majPrl: (fn: (p: Prelevement) => void) => void }) {
  const isolats = prl.isolatsSupplementaires ?? [];
  const majIso = (id: string): MajIsolat => (fn) =>
    majPrl((p) => {
      const i = p.isolatsSupplementaires?.find((x) => x.id === id);
      if (i) fn(i);
    });
  return (
    <div className="isolats">
      {isolats.map((iso: Isolat, n) => (
        <div key={iso.id} className="objet" role="group" aria-label={`Germe ${n + 2} du prélèvement`}>
          <div className="entete">
            <strong>Germe {n + 2} du même prélèvement</strong>
            <button type="button" className="btn discret" onClick={() => majPrl((p) => (p.isolatsSupplementaires = (p.isolatsSupplementaires ?? []).filter((x) => x.id !== iso.id)))}>
              Retirer ce germe
            </button>
          </div>
          <SelectOrganisme libelle={`Germe ${n + 2}`} valeur={iso.organisme} libre={iso.organismeLibre} onChange={(v) => majIso(iso.id)((i) => (i.organisme = v))} onLibre={(v) => majIso(iso.id)((i) => (i.organismeLibre = v))} />
          {prl.stade === 'antibiogramme' && iso.organisme && <AntibiogrammeGuide iso={iso} prl={prl} dossier={dossier} maj={majIso(iso.id)} />}
        </div>
      ))}
      {prl.stade !== 'examen_direct' && (
        <button type="button" className="btn secondaire" onClick={() => majPrl((p) => (p.isolatsSupplementaires = [...(p.isolatsSupplementaires ?? []), nouvelIsolat()]))}>
          + Autre germe dans ce prélèvement
        </button>
      )}
    </div>
  );
}

export function ChampReferentiel({ prl, maj }: { prl: Prelevement; maj: (fn: (p: Prelevement) => void) => void }) {
  return <ChampTexte libelle="Référentiel d'interprétation et version (facultatif)" aide="Ex. CA-SFM/EUCAST 2026 V1.0." valeur={prl.referentiel} onChange={(v) => maj((p) => (p.referentiel = v))} />;
}
