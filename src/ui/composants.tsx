import type { ReactNode } from 'react';
import type { SourceRef, StatutValidation, TriState } from '../clinical/types';
import { SOURCES_PAR_ID } from '../clinical/sources';

let idc = 0;
function nextId(prefix: string) {
  idc += 1;
  return `${prefix}-${idc}`;
}

export function Champ({ libelle, aide, children, id }: { libelle: string; aide?: string; children: ReactNode; id?: string }) {
  return (
    <div className="champ">
      {id ? <label htmlFor={id}>{libelle}</label> : <span className="libelle">{libelle}</span>}
      {aide && <span className="aide">{aide}</span>}
      {children}
    </div>
  );
}

export function ChoixTri({ libelle, aide, valeur, onChange, ouiLibelle = 'Oui', nonLibelle = 'Non' }: { libelle: string; aide?: string; valeur: TriState; onChange: (v: TriState) => void; ouiLibelle?: string; nonLibelle?: string }) {
  return (
    <Champ libelle={libelle} aide={aide}>
      <div className="boutons-choix" role="radiogroup" aria-label={libelle}>
        {(['oui', 'non', 'inconnu'] as TriState[]).map((v) => (
          <button key={v} type="button" role="radio" aria-checked={valeur === v} className={(valeur === v ? 'actif ' : '') + (v === 'inconnu' ? 'inconnu' : '')} onClick={() => onChange(v)}>
            {v === 'oui' ? ouiLibelle : v === 'non' ? nonLibelle : 'Inconnu'}
          </button>
        ))}
      </div>
    </Champ>
  );
}

export function ChoixRadio<T extends string>({ libelle, aide, valeur, options, onChange }: { libelle: string; aide?: string; valeur: T; options: { v: T; l: string; aide?: string }[]; onChange: (v: T) => void }) {
  return (
    <Champ libelle={libelle} aide={aide}>
      <div className="boutons-choix" role="radiogroup" aria-label={libelle}>
        {options.map((o) => (
          <button key={o.v} type="button" role="radio" aria-checked={valeur === o.v} title={o.aide} className={(valeur === o.v ? 'actif ' : '') + (o.v === 'inconnu' || o.v === 'inconnue' ? 'inconnu' : '')} onClick={() => onChange(o.v)}>
            {o.l}
          </button>
        ))}
      </div>
    </Champ>
  );
}

export function ChampNombre({ libelle, aide, valeur, onChange, unite, min, max, step }: { libelle: string; aide?: string; valeur: number | undefined; onChange: (v: number | undefined) => void; unite?: string; min?: number; max?: number; step?: number }) {
  const id = nextId('n');
  return (
    <Champ libelle={libelle} aide={aide} id={id}>
      <div className="ligne">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step ?? 'any'}
          value={valeur ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
        />
        {unite && <span>{unite}</span>}
      </div>
    </Champ>
  );
}

export function ChampTexte({ libelle, aide, valeur, onChange, type = 'text' }: { libelle: string; aide?: string; valeur: string | undefined; onChange: (v: string | undefined) => void; type?: 'text' | 'datetime-local' | 'date' }) {
  const id = nextId('t');
  return (
    <Champ libelle={libelle} aide={aide} id={id}>
      <input id={id} type={type} value={valeur ?? ''} onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)} />
    </Champ>
  );
}

export function Select<T extends string>({ libelle, aide, valeur, options, onChange }: { libelle: string; aide?: string; valeur: T; options: { v: T; l: string }[]; onChange: (v: T) => void }) {
  const id = nextId('s');
  return (
    <Champ libelle={libelle} aide={aide} id={id}>
      <select id={id} value={valeur} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.l}
          </option>
        ))}
      </select>
    </Champ>
  );
}

export function Badge({ children, type }: { children: ReactNode; type?: 'urgence' | 'attention' | 'ok' | 'accent' }) {
  return <span className={`badge ${type ?? ''}`}>{children}</span>;
}

export const LIBELLE_STATUT: Record<StatutValidation, string> = {
  brouillon: 'brouillon',
  verifiee_ia: 'vérifiée par IA — non validée par un humain',
  validee_humain: 'validée par un humain',
  publiee: 'publiée',
  retiree: 'retirée',
};

export function BadgeStatut({ statut }: { statut: StatutValidation }) {
  const type = statut === 'publiee' || statut === 'validee_humain' ? 'ok' : statut === 'retiree' ? 'urgence' : 'attention';
  return <Badge type={type}>{LIBELLE_STATUT[statut]}</Badge>;
}

function urlAvecAncre(ref: SourceRef): string | undefined {
  const s = SOURCES_PAR_ID[ref.source];
  if (!s) return undefined;
  const base = ref.ancre && ref.ancre.startsWith('#page=') && s.urlPdf ? s.urlPdf : s.urlPdf && ref.ancre?.startsWith('#page') ? s.urlPdf : s.url;
  if (ref.ancre) return base + ref.ancre;
  return base;
}

export function ListeSources({ refs, compact }: { refs: SourceRef[]; compact?: boolean }) {
  if (refs.length === 0) return <p className="aide">Aucune source enregistrée pour cet élément.</p>;
  return (
    <ul className="sources-liste">
      {refs.map((r, i) => {
        const s = SOURCES_PAR_ID[r.source];
        const url = urlAvecAncre(r);
        return (
          <li key={`${r.source}-${r.repere ?? ''}-${i}`}>
            {s ? (
              <>
                <strong>{s.organisme}</strong> — {s.titre} ({s.annee}
                {s.version ? `, ${s.version}` : ''})
                {r.repere && <> — {r.repere}</>}
                {r.justifie && !compact && (
                  <>
                    {' '}
                    <Badge>{r.justifie.replace('_', ' ')}</Badge>
                  </>
                )}
                {s.statutVigueur !== 'en_vigueur' && (
                  <>
                    {' '}
                    <Badge type="attention">{s.statutVigueur === 'remplacee' ? `remplacée${s.remplaceePar ? ` par ${s.remplaceePar}` : ''}` : s.statutVigueur === 'retiree' ? 'retirée' : 'vigueur incertaine'}</Badge>
                  </>
                )}
                {s.statutAcces !== 'consultee' && (
                  <>
                    {' '}
                    <Badge type="attention">{s.statutAcces === 'introuvable' ? 'source non vérifiée (introuvable)' : 'contenu non vérifié (non lisible)'}</Badge>
                  </>
                )}
                {r.extrait && !compact && (
                  <div className="extrait">« {r.extrait} »</div>
                )}
                {url && (
                  <div>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      Voir la recommandation{r.ancre ? ' (passage ciblé)' : r.repere ? ' (repère : ' + r.repere + ')' : ''}
                    </a>
                    <span className="aide"> — consultée le {s.dateConsultation}</span>
                  </div>
                )}
              </>
            ) : (
              <span className="avert">Source « {r.source} » absente du registre.</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function RefsInline({ refs }: { refs: SourceRef[] }) {
  if (refs.length === 0) return null;
  return (
    <details className="discret">
      <summary>Sources ({refs.length})</summary>
      <ListeSources refs={refs} compact />
    </details>
  );
}
