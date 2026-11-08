import { createContext, Fragment, useContext, useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import type { SourceRef, StatutValidation, TriState } from '../clinical/types';
import { SOURCES_PAR_ID } from '../clinical/sources';

/**
 * Champs de saisie signalés comme manquants par la fiche (chemins « cible » des données manquantes) :
 * ils sont mis en surbrillance dans la saisie.
 */
/** Cible → true si la donnée bloque (décision, dose, durée, surveillance), false si elle affinerait seulement. */
export const ChampsManquants = createContext<ReadonlyMap<string, boolean>>(new Map());

/**
 * Un champ est signalé si sa cible est manquante, ou l'un de ses sous-champs directs (ex. date de la créatininémie).
 * Renvoie « bloquant », « facultatif » ou undefined.
 */
export function estManquant(manquants: ReadonlyMap<string, boolean>, cible: string | undefined): 'bloquant' | 'facultatif' | undefined {
  if (!cible) return undefined;
  let trouve: boolean | undefined;
  for (const [c, bloquant] of manquants) {
    const parent = c.includes('.') ? c.slice(0, c.lastIndexOf('.')) : undefined;
    if (c === cible || parent === cible) trouve = trouve || bloquant;
  }
  return trouve === undefined ? undefined : trouve ? 'bloquant' : 'facultatif';
}

export function Champ({ libelle, aide, children, id, libelleId, cible }: { libelle: string; aide?: string; children: ReactNode; id?: string; libelleId?: string; cible?: string }) {
  // L'aide est reliée au contrôle par aria-describedby (identifiant dérivé de celui du contrôle).
  const aideId = id ? `${id}-aide` : libelleId ? `${libelleId}-aide` : undefined;
  const manquant = estManquant(useContext(ChampsManquants), cible);
  const libelleEl = id ? (
    <label htmlFor={id} id={libelleId}>
      {libelle}
    </label>
  ) : (
    <span className="libelle" id={libelleId}>
      {libelle}
    </span>
  );
  return (
    <div className={manquant ? `champ manquant ${manquant}` : 'champ'} data-champ={cible}>
      {manquant ? (
        <span className="ligne-libelle">
          {libelleEl}
          <span className="etiquette-manquant">{manquant === 'bloquant' ? 'à compléter' : 'à compléter (facultatif)'}</span>
        </span>
      ) : (
        libelleEl
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
  const idAide = useId();
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
          aria-describedby={o.aide ? `${idAide}-${i}` : undefined}
          className={`${valeur === o.v ? 'actif ' : ''}${classeOption ? classeOption(o.v) : ''}`.trim()}
          onClick={() => onChange(o.v)}
          onKeyDown={(e) => clavier(e, i)}
        >
          {o.l}
        </button>
      ))}
      {options.map((o, i) =>
        o.aide ? (
          <span key={`aide-${o.v}`} id={`${idAide}-${i}`} className="sr-only">
            {o.aide}
          </span>
        ) : null,
      )}
    </div>
  );
}

const classeInconnu = (v: string) => (v === 'inconnu' || v === 'inconnue' ? 'inconnu' : '');

export function ChoixTri({ libelle, aide, valeur, onChange, ouiLibelle = 'Oui', nonLibelle = 'Non', cible }: { libelle: string; aide?: string; valeur: TriState; onChange: (v: TriState) => void; ouiLibelle?: string; nonLibelle?: string; cible?: string }) {
  const id = useId();
  return (
    <Champ libelle={libelle} aide={aide} libelleId={id} cible={cible}>
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

export function ChoixRadio<T extends string>({ libelle, aide, valeur, options, onChange, cible }: { libelle: string; aide?: string; valeur: T; options: { v: T; l: string; aide?: string }[]; onChange: (v: T) => void; cible?: string }) {
  const id = useId();
  return (
    <Champ libelle={libelle} aide={aide} libelleId={id} cible={cible}>
      <GroupeRadio libelle={libelle} libelleId={id} valeur={valeur} options={options} onChange={onChange} classeOption={classeInconnu} decritPar={aide ? `${id}-aide` : undefined} />
    </Champ>
  );
}

/**
 * Champ numérique. Avec `depart` (valeur de départ, ex. 50 ans) : la valeur est affichée en grisé tant qu'elle
 * n'est pas saisie, et les boutons − / +, les flèches du clavier et la molette (champ actif) partent de cette valeur.
 * La valeur de départ n'est jamais utilisée par le moteur tant qu'elle n'a pas été choisie : une dose calculée sur
 * un poids ou un âge par défaut serait une donnée inventée.
 */
export function ChampNombre({ libelle, aide, valeur, onChange, unite, min, max, step, cible, depart }: { libelle: string; aide?: string; valeur: number | undefined; onChange: (v: number | undefined) => void; unite?: string; min?: number; max?: number; step?: number; cible?: string; depart?: number }) {
  const id = useId();
  const champ = useRef<HTMLInputElement>(null);
  const horsBornes = valeur !== undefined && ((min !== undefined && valeur < min) || (max !== undefined && valeur > max));
  const pas = step ?? 1;
  const decimales = (String(pas).split('.')[1] ?? '').length;
  /** Un cran vers le haut ou le bas ; depuis un champ vide, le premier cran donne la valeur de départ. */
  const avancer = (sens: 1 | -1) => {
    if (depart === undefined) return;
    if (valeur === undefined) return onChange(depart);
    const v = Number((Math.round((valeur + sens * pas) / pas) * pas).toFixed(decimales));
    onChange(Math.min(max ?? Infinity, Math.max(min ?? -Infinity, v)));
  };
  /** Valeur à `crans` crans d'une valeur de base ; depuis un champ vide, le premier cran donne la valeur de départ. */
  const decaler = (base: number | undefined, crans: number): number => {
    const v = base === undefined ? depart! + (crans - Math.sign(crans)) * pas : base + crans * pas;
    return Math.min(max ?? Infinity, Math.max(min ?? -Infinity, Number((Math.round(v / pas) * pas).toFixed(decimales))));
  };
  const courant = useRef({ avancer, decaler, valeur, onChange });
  courant.current = { avancer, decaler, valeur, onChange };
  useEffect(() => {
    const el = champ.current;
    if (!el || depart === undefined) return;
    // Molette : seulement quand le champ est actif, pour ne pas détourner le défilement de la page.
    const surMolette = (e: WheelEvent) => {
      if (document.activeElement !== el || e.deltaY === 0) return;
      e.preventDefault();
      courant.current.avancer(e.deltaY < 0 ? 1 : -1);
    };
    // Doigt (téléphone) : glisser vers le haut augmente, vers le bas diminue, un cran tous les 14 px.
    // Un simple appui ouvre le clavier comme d'habitude ; un glissement ne déplace pas la page.
    const PX_PAR_CRAN = 14;
    let depuis: { y: number; base: number | undefined; derniere?: number } | undefined;
    let glisse = false;
    const debut = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      depuis = { y: e.touches[0].clientY, base: courant.current.valeur };
      glisse = false;
    };
    const mouvement = (e: TouchEvent) => {
      if (!depuis || e.touches.length !== 1) return;
      const dy = depuis.y - e.touches[0].clientY;
      if (!glisse && Math.abs(dy) < 6) return;
      glisse = true;
      e.preventDefault();
      const crans = Math.trunc(dy / PX_PAR_CRAN);
      if (crans === 0) return;
      const v = courant.current.decaler(depuis.base, crans);
      if (v !== depuis.derniere) {
        depuis.derniere = v;
        courant.current.onChange(v);
      }
    };
    const fin = (e: TouchEvent) => {
      if (glisse) e.preventDefault(); // pas de clavier ouvert après un glissement
      depuis = undefined;
    };
    el.addEventListener('wheel', surMolette, { passive: false });
    el.addEventListener('touchstart', debut, { passive: true });
    el.addEventListener('touchmove', mouvement, { passive: false });
    el.addEventListener('touchend', fin, { passive: false });
    el.addEventListener('touchcancel', fin);
    return () => {
      el.removeEventListener('wheel', surMolette);
      el.removeEventListener('touchstart', debut);
      el.removeEventListener('touchmove', mouvement);
      el.removeEventListener('touchend', fin);
      el.removeEventListener('touchcancel', fin);
    };
  }, [depart]);
  return (
    <Champ libelle={libelle} aide={aide} id={id} cible={cible}>
      <div className={`ligne${depart !== undefined ? ' pas-a-pas' : ''}`}>
        {depart !== undefined && (
          <button type="button" className="btn cran" aria-label={`Diminuer : ${libelle}`} onClick={() => avancer(-1)}>
            −
          </button>
        )}
        <input
          ref={champ}
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step ?? 'any'}
          placeholder={depart !== undefined ? String(depart) : undefined}
          value={valeur ?? ''}
          aria-invalid={horsBornes || undefined}
          aria-describedby={[aide ? `${id}-aide` : '', horsBornes ? `${id}-err` : ''].filter(Boolean).join(' ') || undefined}
          onKeyDown={(e) => {
            if (depart === undefined || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
            e.preventDefault();
            avancer(e.key === 'ArrowUp' ? 1 : -1);
          }}
          onChange={(e) => {
            const v = e.target.value === '' ? undefined : Number(e.target.value);
            onChange(v !== undefined && Number.isFinite(v) ? v : undefined);
          }}
        />
        {depart !== undefined && (
          <button type="button" className="btn cran" aria-label={`Augmenter : ${libelle}`} onClick={() => avancer(1)}>
            +
          </button>
        )}
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

export function ChampTexte({ libelle, aide, valeur, onChange, type = 'text', cible }: { libelle: string; aide?: string; valeur: string | undefined; onChange: (v: string | undefined) => void; type?: 'text' | 'datetime-local' | 'date' | 'time'; cible?: string }) {
  const id = useId();
  return (
    <Champ libelle={libelle} aide={aide} id={id} cible={cible}>
      <input id={id} type={type} aria-describedby={aide ? `${id}-aide` : undefined} value={valeur ?? ''} onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)} />
    </Champ>
  );
}

export function Select<T extends string>({ libelle, aide, valeur, options, onChange, cible }: { libelle: string; aide?: string; valeur: T; options: { v: T; l: string }[]; onChange: (v: T) => void; cible?: string }) {
  const id = useId();
  return (
    <Champ libelle={libelle} aide={aide} id={id} cible={cible}>
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

/**
 * Statut de validation à signaler sur place : tout sauf « vérifiée par IA » (et validé/publié), dont la mention
 * est unique, en fin de fiche. Un brouillon ou une règle retirée reste donc marqué à côté de l'option.
 */
export function statutASignaler(s: StatutValidation): boolean {
  return s !== 'verifiee_ia' && s !== 'validee_humain' && s !== 'publiee';
}

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

/** Mention d'une source dont le statut doit rester visible même en affichage compact. */
function etatSource(id: string): string | undefined {
  const s = SOURCES_PAR_ID[id];
  if (!s) return 'absente du registre';
  if (s.statutVigueur === 'remplacee') return `remplacée${s.remplaceePar ? ` par ${s.remplaceePar}` : ''}`;
  if (s.statutVigueur === 'retiree') return 'retirée';
  if (s.statutVigueur !== 'en_vigueur') return 'vigueur incertaine';
  if (s.statutAcces === 'introuvable') return 'non vérifiée';
  if (s.statutAcces !== 'consultee') return 'contenu non vérifié';
  return undefined;
}

/**
 * Libellé court d'une source : organisme (avant « — ») et année ; si deux sources de la ligne auraient le même
 * libellé (ex. deux RCP de l'ANSM), on ajoute le début du titre pour les distinguer.
 */
function libelleCourt(id: string, ligne: Map<string, SourceRef[]>): string {
  const s = SOURCES_PAR_ID[id];
  if (!s) return id;
  const base = (x: { organisme: string; annee: number }) => `${x.organisme.split(' — ')[0]} ${x.annee}`;
  const ambigu = [...ligne.keys()].some((autre) => autre !== id && SOURCES_PAR_ID[autre] && base(SOURCES_PAR_ID[autre]) === base(s));
  if (!ambigu) return base(s);
  const titre = s.titre.split(/ [—(]|, /)[0];
  return `${base(s)} — ${titre.length > 40 ? `${titre.slice(0, 39)}…` : titre}`;
}

/**
 * Sources d'un élément, en liens courts (organisme et année) : un clic ouvre la recommandation au passage
 * cité quand il est connu. Le titre complet et les repères figurent dans l'infobulle ; dans la fiche, la liste
 * complète des sources, avec repères et extraits, est en fin de fiche.
 */
export function RefsInline({ refs }: { refs: SourceRef[] }) {
  if (refs.length === 0) return null;
  const parSource = new Map<string, SourceRef[]>();
  for (const r of refs) parSource.set(r.source, [...(parSource.get(r.source) ?? []), r]);
  return (
    <span className="refs-inline">
      Sources :{' '}
      {[...parSource.entries()].map(([id, rs], i) => {
        const s = SOURCES_PAR_ID[id];
        const reperes = [...new Set(rs.map((r) => r.repere).filter(Boolean))];
        const libelle = libelleCourt(id, parSource);
        const titre = s ? `${s.titre}${reperes.length ? ` — ${reperes.join(' ; ')}` : ''}` : `Source « ${id} » absente du registre`;
        const url = urlAvecAncre(rs.find((r) => r.ancre) ?? rs[0]);
        const etat = etatSource(id);
        return (
          <Fragment key={id}>
            {i > 0 && ' · '}
            {url ? (
              <a href={url} target="_blank" rel="noopener noreferrer" title={titre}>
                {libelle}
                <span className="sr-only"> (nouvel onglet)</span>
              </a>
            ) : (
              <span title={titre}>{libelle}</span>
            )}
            {etat && <span className="etat-source"> ({etat})</span>}
          </Fragment>
        );
      })}
    </span>
  );
}
