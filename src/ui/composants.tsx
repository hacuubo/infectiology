import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import type { SourceRef, StatutValidation, TriState } from '../clinical/types';
import { SOURCES_PAR_ID } from '../clinical/sources';

export function Champ({ libelle, aide, children, id, libelleId }: { libelle: string; aide?: string; children: ReactNode; id?: string; libelleId?: string }) {
  // L'aide est reliée au contrôle par aria-describedby (identifiant dérivé de celui du contrôle).
  const aideId = id ? `${id}-aide` : libelleId ? `${libelleId}-aide` : undefined;
  return (
    <div className="champ">
      {id ? (
        <label htmlFor={id} id={libelleId}>
          {libelle}
        </label>
      ) : (
        <span className="libelle" id={libelleId}>
          {libelle}
        </span>
      )}
      {aide && (
        <span className="aide" id={aideId}>
          {aide}
        </span>
      )}
      {children}
    </div>
  );
}

/**
 * Groupe de boutons radio accessible (motif ARIA « radio group ») :
 * un seul arrêt de tabulation (l'option cochée, sinon la première), flèches
 * gauche/droite/haut/bas pour se déplacer et cocher, Début/Fin, Espace pour cocher.
 */
export function GroupeRadio<T extends string>({
  libelle,
  libelleId,
  valeur,
  options,
  onChange,
  classeOption,
  decritPar,
}: {
  libelle?: string;
  libelleId?: string;
  decritPar?: string;
  valeur: T | undefined;
  options: { v: T; l: string; aide?: string }[];
  onChange: (v: T) => void;
  classeOption?: (v: T) => string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const indexCoche = options.findIndex((o) => o.v === valeur);
  const focusable = indexCoche >= 0 ? indexCoche : 0;
  const deplacer = (i: number) => {
    const n = options.length;
    const j = ((i % n) + n) % n;
    refs.current[j]?.focus();
    onChange(options[j].v);
  };
  const clavier = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        deplacer(i + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        deplacer(i - 1);
        break;
      case 'Home':
        e.preventDefault();
        deplacer(0);
        break;
      case 'End':
        e.preventDefault();
        deplacer(options.length - 1);
        break;
      default:
    }
  };
  return (
    <div className="boutons-choix" role="radiogroup" aria-label={libelleId ? undefined : libelle} aria-labelledby={libelleId} aria-describedby={decritPar}>
      {options.map((o, i) => (
        <button
          key={o.v}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="button"
          role="radio"
          aria-checked={valeur === o.v}
          tabIndex={i === focusable ? 0 : -1}
          title={o.aide}
          className={`${valeur === o.v ? 'actif ' : ''}${classeOption ? classeOption(o.v) : ''}`.trim()}
          onClick={() => onChange(o.v)}
          onKeyDown={(e) => clavier(e, i)}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

const classeInconnu = (v: string) => (v === 'inconnu' || v === 'inconnue' ? 'inconnu' : '');

export function ChoixTri({ libelle, aide, valeur, onChange, ouiLibelle = 'Oui', nonLibelle = 'Non' }: { libelle: string; aide?: string; valeur: TriState; onChange: (v: TriState) => void; ouiLibelle?: string; nonLibelle?: string }) {
  const id = useId();
  return (
    <Champ libelle={libelle} aide={aide} libelleId={id}>
      <GroupeRadio
        libelle={libelle}
        libelleId={id}
        valeur={valeur}
        options={[
          { v: 'oui' as TriState, l: ouiLibelle },
          { v: 'non' as TriState, l: nonLibelle },
          { v: 'inconnu' as TriState, l: 'Inconnu' },
        ]}
        onChange={onChange}
        classeOption={classeInconnu}
        decritPar={aide ? `${id}-aide` : undefined}
      />
    </Champ>
  );
}

export function ChoixRadio<T extends string>({ libelle, aide, valeur, options, onChange }: { libelle: string; aide?: string; valeur: T; options: { v: T; l: string; aide?: string }[]; onChange: (v: T) => void }) {
  const id = useId();
  return (
    <Champ libelle={libelle} aide={aide} libelleId={id}>
      <GroupeRadio libelle={libelle} libelleId={id} valeur={valeur} options={options} onChange={onChange} classeOption={classeInconnu} decritPar={aide ? `${id}-aide` : undefined} />
    </Champ>
  );
}

export function ChampNombre({ libelle, aide, valeur, onChange, unite, min, max, step }: { libelle: string; aide?: string; valeur: number | undefined; onChange: (v: number | undefined) => void; unite?: string; min?: number; max?: number; step?: number }) {
  const id = useId();
  const horsBornes = valeur !== undefined && ((min !== undefined && valeur < min) || (max !== undefined && valeur > max));
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
          aria-invalid={horsBornes || undefined}
          aria-describedby={[aide ? `${id}-aide` : '', horsBornes ? `${id}-err` : ''].filter(Boolean).join(' ') || undefined}
          onChange={(e) => {
            const v = e.target.value === '' ? undefined : Number(e.target.value);
            onChange(v !== undefined && Number.isFinite(v) ? v : undefined);
          }}
        />
        {unite && <span>{unite}</span>}
      </div>
      {horsBornes && (
        <span className="erreur" id={`${id}-err`}>
          Valeur hors des bornes attendues ({min ?? '…'} à {max ?? '…'}{unite ? ` ${unite}` : ''}) : vérifier la saisie.
        </span>
      )}
    </Champ>
  );
}

export function ChampTexte({ libelle, aide, valeur, onChange, type = 'text' }: { libelle: string; aide?: string; valeur: string | undefined; onChange: (v: string | undefined) => void; type?: 'text' | 'datetime-local' | 'date' }) {
  const id = useId();
  return (
    <Champ libelle={libelle} aide={aide} id={id}>
      <input id={id} type={type} aria-describedby={aide ? `${id}-aide` : undefined} value={valeur ?? ''} onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)} />
    </Champ>
  );
}

export function Select<T extends string>({ libelle, aide, valeur, options, onChange }: { libelle: string; aide?: string; valeur: T; options: { v: T; l: string }[]; onChange: (v: T) => void }) {
  const id = useId();
  return (
    <Champ libelle={libelle} aide={aide} id={id}>
      <select id={id} aria-describedby={aide ? `${id}-aide` : undefined} value={valeur} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.l}
          </option>
        ))}
      </select>
    </Champ>
  );
}

export function Badge({ children, type, titre }: { children: ReactNode; type?: 'urgence' | 'attention' | 'ok' | 'accent'; titre?: string }) {
  return (
    <span className={`badge ${type ?? ''}`} title={titre}>
      {children}
    </span>
  );
}

export const LIBELLE_STATUT: Record<StatutValidation, string> = {
  brouillon: 'brouillon',
  verifiee_ia: 'vérifiée par IA — non validée par un humain',
  validee_humain: 'validée par un humain',
  publiee: 'publiée',
  retiree: 'retirée',
};

/** Libellés courts des badges ; le libellé complet reste disponible (infobulle et texte masqué). */
export const LIBELLE_STATUT_COURT: Record<StatutValidation, string> = {
  brouillon: 'brouillon',
  verifiee_ia: 'vérifiée par IA',
  validee_humain: 'validée',
  publiee: 'publiée',
  retiree: 'retirée',
};

export function BadgeStatut({ statut, court }: { statut: StatutValidation; court?: boolean }) {
  const type = statut === 'publiee' || statut === 'validee_humain' ? 'ok' : statut === 'retiree' ? 'urgence' : 'attention';
  return (
    <Badge type={type} titre={LIBELLE_STATUT[statut]}>
      {court ? LIBELLE_STATUT_COURT[statut] : LIBELLE_STATUT[statut]}
    </Badge>
  );
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
