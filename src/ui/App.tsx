import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { clonerDossier, dossierParDefaut, nettoyerDossier, type Dossier, type Invalidation } from '../engine/etat';
import { deciderSansPanne } from '../engine/decider';
import { comparerPlans } from '../engine/comparaison';
import type { Plan } from '../clinical/types';
import { GardeErreur, GardeLocale, PanneauErreurTechnique } from './Explication';
import { contexteUI } from './contexte-ui';
import { FormulaireDossier } from './FormulaireDossier';
import { BandeauPatient, ResumePatient, resumesEtapes } from './ResumePatient';
import { peutReplierAuto, RepliContexte, type EtatRepli } from './Repli';
import { AvisInfectiologique } from './AvisInfectiologique';
import { alertesUrgentes, elementsManquants, LIBELLE_URGENCE, PanneauResultat, typeUrgence } from './PanneauResultat';
import { VERSION_CLINIQUE, estObsolete } from '../clinical/version';
import { Badge, ChampsManquants, RefsInline } from './composants';

/** `dossierInitial` : dossier de départ (tests) ; par défaut, un dossier vide. */
export function App({ dossierInitial }: { dossierInitial?: Dossier } = {}) {
  const [dossier, setDossier] = useState<Dossier>(() => {
    if (!dossierInitial) return dossierParDefaut();
    const d = clonerDossier(dossierInitial);
    nettoyerDossier(d);
    return d;
  });
  const [invalidations, setInvalidations] = useState<Invalidation[]>([]);
  // Trois vues, une à la fois, choisies dans la barre d'onglets fixée en bas de l'écran.
  const [onglet, setOngletBrut] = useState<'saisie' | 'resultat' | 'avis'>('saisie');
  const setOnglet = useCallback((o: 'saisie' | 'resultat' | 'avis') => {
    setOngletBrut((avant) => {
      if (avant !== o) window.scrollTo?.({ top: 0 });
      return o;
    });
  }, []);
  // Résumé du patient réduit par défaut : la saisie reste au premier plan.
  const [resumeReduit, setResumeReduit] = useState(true);

  // Plan affiché avant la dernière modification : sert à signaler ce que cette modification change.
  const planCourant = useRef<Plan | undefined>(undefined);
  const [planAvant, setPlanAvant] = useState<Plan | undefined>(undefined);

  const modifier = (fn: (d: Dossier) => void) => {
    setPlanAvant(planCourant.current);
    setDossier((prev) => {
      const next = clonerDossier(prev);
      fn(next);
      const inv = nettoyerDossier(next);
      if (inv.length) setInvalidations(inv);
      return next;
    });
  };

  const [essai, setEssai] = useState(0);
  // Incrémenté à chaque réinitialisation : efface aussi le texte libre de la demande d'avis (patient précédent).
  const [nouveauPatient, setNouveauPatient] = useState(0);
  const ctx = useMemo(() => {
    try {
      return contexteUI(dossier);
    } catch {
      return undefined;
    }
  }, [dossier]);
  // Appel protégé : une panne du moteur est une erreur technique, jamais une conclusion médicale.
  const resultat = useMemo(() => {
    void essai; // « Réessayer » relance le calcul
    return deciderSansPanne(dossier);
  }, [dossier, essai]);
  const plan: Plan | undefined = resultat.ok ? resultat.plan : undefined;
  useEffect(() => {
    planCourant.current = plan;
  }, [plan]);
  // Modifications de la saisie qui changent la proposition thérapeutique (calcul pur, compatible StrictMode).
  const changements = useMemo(() => (plan && planAvant ? comparerPlans(planAvant, plan) : []), [plan, planAvant]);
  // Champs à compléter signalés par la fiche : mis en surbrillance dans la saisie.
  const ciblesManquantes = useMemo(() => {
    const m = new Map<string, boolean>();
    for (const x of plan ? elementsManquants(plan) : []) if (x.cible) m.set(x.cible, (m.get(x.cible) ?? false) || x.impact !== 'affine');
    return m;
  }, [plan]);
  const etapesACompleter = useMemo(() => etapesBloquees(ciblesManquantes), [ciblesManquantes]);

  // Repli des étapes terminées (voir Repli.tsx pour les règles de sécurité).
  const [replies, setReplies] = useState<ReadonlySet<string>>(() => new Set());
  const touchees = useRef(new Set<string>());
  const colonneSaisie = useRef<HTMLDivElement>(null);
  /** Repère (étape suivante) dont la position doit rester fixe à l'écran après un repli automatique. */
  const ancre = useRef<{ el: Element; haut: number } | undefined>(undefined);
  const basculerEtape = useCallback((id: string, replier: boolean) => {
    ancre.current = undefined;
    setReplies((r) => {
      if (r.has(id) === replier) return r;
      const n = new Set(r);
      if (replier) n.add(id);
      else n.delete(id);
      return n;
    });
  }, []);
  const ouvrirEtape = useCallback((id: string | undefined) => {
    if (id) basculerEtape(id, false);
  }, [basculerEtape]);
  // Une donnée bloquante apparaît dans une étape repliée : elle se rouvre.
  useEffect(() => {
    setReplies((r) => ([...r].some((id) => etapesACompleter.has(id)) ? new Set([...r].filter((id) => !etapesACompleter.has(id))) : r));
  }, [etapesACompleter]);
  // Le contenu au-dessus de l'écran a rétréci : on compense pour que rien ne bouge sous les yeux.
  useLayoutEffect(() => {
    const a = ancre.current;
    ancre.current = undefined;
    if (!a) return;
    const delta = a.el.getBoundingClientRect().top - a.haut;
    if (!delta) return;
    const col = colonneSaisie.current;
    const avant = col?.scrollTop ?? 0;
    if (col) col.scrollTop += delta;
    const reste = delta - ((col?.scrollTop ?? 0) - avant);
    if (reste) window.scrollBy?.(0, reste);
  }, [replies]);
  const etapesRef = useRef(etapesACompleter);
  etapesRef.current = etapesACompleter;
  const repliesRef = useRef(replies);
  repliesRef.current = replies;
  useEffect(() => {
    const col = colonneSaisie.current;
    if (!col) return;
    const surFocus = (e: Event) => {
      const id = (e.target as Element | null)?.closest?.('[data-etape]')?.getAttribute('data-etape');
      if (id) touchees.current.add(id);
    };
    let attente = 0;
    const verifier = () => {
      attente = 0;
      if (col.offsetParent === null || ancre.current) return; // colonne masquée (onglet Prise en charge) ou repli en cours
      const barre = document.querySelector('.barre-contexte');
      const hautVisible = Math.max(barre ? barre.getBoundingClientRect().bottom : 0, col.getBoundingClientRect().top);
      const sections = [...col.querySelectorAll<HTMLElement>('[data-etape]')];
      // Une seule étape à la fois, la plus basse éligible : la compensation de défilement reste exacte.
      for (let i = sections.length - 1; i >= 0; i--) {
        const s = sections[i];
        const id = s.dataset.etape!;
        if (repliesRef.current.has(id)) continue;
        const r = s.getBoundingClientRect();
        if (!peutReplierAuto({ visible: r.height > 0, aCompleter: etapesRef.current.has(id), touchee: touchees.current.has(id), focusDedans: s.contains(document.activeElement), basSection: r.bottom, hautVisible })) continue;
        const suivant = s.nextElementSibling;
        if (suivant) ancre.current = { el: suivant, haut: suivant.getBoundingClientRect().top };
        setReplies((x) => new Set(x).add(id));
        return;
      }
    };
    const surDefilement = () => {
      if (!attente) attente = window.setTimeout(verifier, 120);
    };
    // Étape « travaillée » : l'utilisateur y est entré (clavier) ou y a cliqué.
    col.addEventListener('focusin', surFocus);
    col.addEventListener('click', surFocus);
    document.addEventListener('scroll', surDefilement, { capture: true, passive: true });
    return () => {
      col.removeEventListener('focusin', surFocus);
      col.removeEventListener('click', surFocus);
      document.removeEventListener('scroll', surDefilement, { capture: true });
      if (attente) window.clearTimeout(attente);
    };
  }, []);
  // Nouveau patient : tout est déplié.
  useEffect(() => {
    setReplies(new Set());
    touchees.current.clear();
  }, [nouveauPatient]);
  const ctxRepli: EtatRepli = useMemo(() => ({ replies, aCompleter: etapesACompleter, resumes: ctx ? resumesEtapes(dossier, ctx) : {}, basculer: basculerEtape }), [replies, etapesACompleter, ctx, dossier, basculerEtape]);
  // Données sans champ précis (antibiogramme, signes cliniques, antécédents…) : c'est la section qui est signalée.
  useEffect(() => {
    document.querySelectorAll('.section-manquante').forEach((el) => el.classList.remove('section-manquante'));
    for (const cible of ciblesManquantes.keys()) {
      if (document.querySelector(`[data-champ="${cible}"]`)) continue;
      const el = trouverChamp(cible);
      const section = el?.closest('section.carte');
      if (section && !section.closest('.fiche')) section.classList.add('section-manquante');
    }
  });
  const obsolete = estObsolete(VERSION_CLINIQUE);
  // En cas de panne, l'urgence déclarée (sepsis, choc) reste affichée.
  const urgentes = plan ? alertesUrgentes(plan) : !resultat.ok ? resultat.sortie.actionsUrgentes.map((a) => ({ niveau: 'urgence' as const, texte: a.texte, sources: a.sources })) : [];
  const niveau = plan?.urgence.niveau ?? (!resultat.ok && resultat.sortie.urgence ? 'immediate' : 'standard');

  /** Mène directement au champ à compléter (onglet Patient sur écran étroit), sans refaire le parcours. */
  const allerAuChamp = useCallback((cible: string) => {
    setOnglet('saisie');
    ouvrirEtape(etapeDeCible(cible));
    window.setTimeout(() => {
      const el = trouverChamp(cible);
      if (!el) return;
      const reduit = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView?.({ block: 'center', behavior: reduit ? 'auto' : 'smooth' });
      // Le champ de saisie d'abord (avant les boutons − / + qui l'entourent), sinon le premier contrôle.
      const focusable = el.querySelector<HTMLElement>('input:not([disabled]), select, textarea') ?? el.querySelector<HTMLElement>('[role="radio"][tabindex="0"], button') ?? (el.matches('h2, h3') ? el : null);
      if (focusable) {
        if (focusable.matches('h2, h3')) focusable.setAttribute('tabindex', '-1');
        focusable.focus({ preventScroll: true });
      }
      el.classList.add('surbrillance');
      window.setTimeout(() => el.classList.remove('surbrillance'), 2500);
    }, 0);
  }, [ouvrirEtape, setOnglet]);

  // Hauteur de la barre permanente : les sections ciblées s'arrêtent juste dessous.
  const barreContexte = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = barreContexte.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => document.documentElement.style.setProperty('--haut-barre', `${Math.round(el.getBoundingClientRect().height)}px`));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="app">
      <header className="bandeau">
        <h1>Infectiology — aide à la décision en antibiothérapie (adulte)</h1>
        {obsolete && <Badge type="urgence">base clinique possiblement obsolète (voir en fin de page)</Badge>}
      </header>

      {/* Barre permanente : alertes urgentes et résumé du patient, visibles quel que soit l'onglet ou le défilement. */}
      <div className="barre-contexte" ref={barreContexte}>
        <div className={`barre-urgence ${typeUrgence(niveau)}`} role="region" aria-label="Niveau d'urgence et alertes urgentes">
          <Badge type={typeUrgence(niveau)}>{LIBELLE_URGENCE[niveau]}</Badge>
          {urgentes.length > 0 && (
            <ul className="alertes-urgentes">
              {urgentes.map((a, i) => (
                <li key={i} className="alerte urgence">
                  {a.texte}
                  {a.sources && a.sources.length > 0 && <RefsInline refs={a.sources} />}
                </li>
              ))}
            </ul>
          )}
          <button type="button" className="btn discret bouton-resume" aria-expanded={!resumeReduit} aria-controls="resume-patient" onClick={() => setResumeReduit((r) => !r)}>
            {resumeReduit ? 'Afficher le résumé' : 'Réduire le résumé'}
          </button>
        </div>
        {ctx && (
          <GardeLocale nom="bandeau patient" cle={dossier}>
            <BandeauPatient dossier={dossier} ctx={ctx} />
          </GardeLocale>
        )}
        <div id="resume-patient" hidden={resumeReduit}>
          {ctx && (
            <GardeLocale nom="résumé du patient" cle={dossier}>
              <ResumePatient dossier={dossier} ctx={ctx} />
            </GardeLocale>
          )}
        </div>
        {onglet === 'saisie' && <Progression aCompleter={etapesACompleter} replies={replies} ouvrir={ouvrirEtape} toutDeplier={() => setReplies(new Set())} />}
      </div>

      <nav className="onglets" aria-label="Onglets de l’application">
        <button type="button" aria-pressed={onglet === 'saisie'} className={onglet === 'saisie' ? 'actif' : ''} onClick={() => setOnglet('saisie')}>
          <span className="onglet-icone" aria-hidden="true" />
          Patient
        </button>
        <button type="button" aria-pressed={onglet === 'resultat'} className={onglet === 'resultat' ? 'actif' : ''} onClick={() => setOnglet('resultat')}>
          <span className="onglet-icone" aria-hidden="true" />
          <span>
            Prise en charge {niveau !== 'standard' && <Badge type={typeUrgence(niveau)}>{niveau === 'immediate' ? 'urgence' : 'élevée'}</Badge>}
          </span>
        </button>
        <button type="button" aria-pressed={onglet === 'avis'} className={onglet === 'avis' ? 'actif' : ''} onClick={() => setOnglet('avis')}>
          <span className="onglet-icone" aria-hidden="true" />
          Avis SMIT
        </button>
      </nav>

      <main className="contenu">
        <div ref={colonneSaisie} className={`colonne-saisie ${onglet !== 'saisie' ? 'masque' : ''}`}>
          <div className="ligne reinitialiser">
              <button
                type="button"
                className="btn discret"
                onClick={() => {
                  setDossier(dossierParDefaut());
                  setPlanAvant(undefined);
                  setInvalidations([]);
                  setNouveauPatient((n) => n + 1);
                }}
              >
                Réinitialiser le patient
              </button>
          </div>
          {invalidations.length > 0 && (
            <div className="invalidations" role="status">
              <strong>Réponses effacées car devenues incohérentes avec vos modifications :</strong>
              <ul>
                {invalidations.map((i) => (
                  <li key={i.champ}>{i.raison}</li>
                ))}
              </ul>
              <button type="button" className="btn discret" onClick={() => setInvalidations([])}>
                Compris
              </button>
            </div>
          )}
          <GardeLocale nom="formulaire" cle={dossier}>
            <ChampsManquants.Provider value={ciblesManquantes}>
              <RepliContexte.Provider value={ctxRepli}>
                <FormulaireDossier dossier={dossier} modifier={modifier} />
              </RepliContexte.Provider>
            </ChampsManquants.Provider>
          </GardeLocale>
          {/* En fin de saisie : statut de l'outil et état de la base clinique. */}
          <footer className="pied pied-saisie">
            <div className="avertissement-global" role="note">
              <strong>Outil en développement, non validé pour l'usage clinique.</strong> Moteur déterministe et règles sourcées, en attendant l'avis du service de maladies infectieuses et tropicales. Les règles « vérifiées par IA » ne sont pas validées médicalement. Aucune donnée saisie n'est conservée ; l'application ne transmet rien (le courriel de demande d'avis s'ouvre dans votre messagerie et c'est vous qui l'envoyez). Utilisez des patients fictifs.
            </div>
            <div className="statut" aria-label="État de la base clinique">
              <span>
                Version clinique <strong>{VERSION_CLINIQUE.version}</strong>
              </span>
              <span>Validation humaine : {VERSION_CLINIQUE.dateValidationHumaine ?? 'aucune'}</span>
              <span>Dernière veille réussie : {VERSION_CLINIQUE.derniereVeilleReussie ?? 'aucune'}</span>
              <span>Changements en attente : {VERSION_CLINIQUE.changementsEnAttente.length}</span>
              {obsolete && <Badge type="urgence">base possiblement obsolète</Badge>}
              <details className="discret">
                <summary>Périmètre surveillé</summary>
                <ul>
                  {VERSION_CLINIQUE.perimetreSurveille.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <p className="aide">{VERSION_CLINIQUE.obsolescence.texte}</p>
              </details>
            </div>
            <p>
              Moteur déterministe : à entrées et version clinique identiques, le résultat est identique. Sources : SPILF, HAS, ANSM, CA-SFM/EUCAST, ESCMID, ESC, IDSA ; voir les sources de chaque prise en charge.
            </p>
          </footer>
        </div>
        <div className={`colonne-resultat ${onglet !== 'resultat' ? 'masque' : ''}`}>
          {resultat.ok && plan ? (
            <GardeErreur cle={plan} rendu={(message, reessayer) => <PanneauErreurTechnique sortie={{ traitement: 'aucun', urgence: false, actionsUrgentes: [], ecartees: [], motifs: [{ type: 'erreur_technique', rang: 0, statut: 'Erreur technique d’affichage — ce n’est pas une conclusion médicale', motif: `L’affichage de la prise en charge a échoué (${message}).`, verifie: [], dejaPropose: [], aCompleter: [], prochaineAction: 'Les données saisies sont conservées : réessayer. Si l’erreur persiste, décider sans l’application (avis du SMIT) et signaler l’erreur.', sources: [], origine: ['interface'] }] }} onReessayer={reessayer} />}>
              <PanneauResultat plan={plan} dossier={dossier} onRetenir={(id) => modifier((x) => (x.optionRetenueId = id))} allerAuChamp={allerAuChamp} changements={changements} demanderAvis={() => setOnglet('avis')} />
            </GardeErreur>
          ) : (
            !resultat.ok && <PanneauErreurTechnique sortie={resultat.sortie} onReessayer={() => setEssai((n) => n + 1)} />
          )}
          <footer className="pied">
            Outil en développement, non validé pour l'usage clinique. Moteur déterministe : à entrées et version clinique identiques, le résultat est identique. Les règles « vérifiées par IA » ne sont pas validées médicalement. Sources : SPILF, HAS, ANSM, CA-SFM/EUCAST, ESCMID, ESC, IDSA ; voir les sources de chaque prise en charge.
          </footer>
        </div>
        <div className={`colonne-avis ${onglet !== 'avis' ? 'masque' : ''}`}>
          {ctx && (
            <GardeLocale nom="demande d’avis" cle={dossier}>
              <AvisInfectiologique key={nouveauPatient} dossier={dossier} ctx={ctx} />
            </GardeLocale>
          )}
        </div>
      </main>
    </div>
  );
}

/** Champ de saisie ciblé ; à défaut (champ masqué car non pertinent), la section qui le contient. */
const SECTIONS: [string, string][] = [
  ['entree', 't-entree'],
  ['details', 't-entree'],
  ['patient.renal', 't-renal'],
  ['patient.gravite', 't-contexte'],
  ['patient.contexte', 't-contexte'],
  ['patient.materiel', 't-contexte'],
  ['patient.valve', 't-contexte'],
  ['patient.formeIUMasculine', 't-contexte'],
  ['patient.', 't-patient'],
  ['prelevements', 't-micro'],
  ['clinique', 't-indication'],
  ['horaires', 't-horaires'],
];

export function trouverChamp(cible: string): HTMLElement | null {
  const exact = document.querySelector<HTMLElement>(`[data-champ="${cible}"]`);
  if (exact) return exact;
  const parent = cible.includes('.') ? document.querySelector<HTMLElement>(`[data-champ="${cible.split('.').slice(0, -1).join('.')}"]`) : null;
  if (parent) return parent;
  for (const [prefixe, id] of SECTIONS) if (cible.startsWith(prefixe)) return document.getElementById(id) ?? (id === 't-indication' ? document.getElementById('t-micro') : null);
  return null;
}

/** Étapes de la saisie (sections du formulaire), dans l'ordre. */
const ETAPES: { id: string; libelle: string }[] = [
  { id: 't-entree', libelle: 'Point d’entrée' },
  { id: 't-patient', libelle: 'Patient' },
  { id: 't-contexte', libelle: 'Contexte' },
  { id: 't-micro', libelle: 'Microbiologie' },
  { id: 't-horaires', libelle: 'Horaires' },
];
const SECTION_ETAPE: Record<string, string> = { 't-renal': 't-patient', 't-indication': 't-micro' };

/** Section de saisie qui contient le champ ciblé (même correspondance que la navigation depuis la fiche). */
export function etapeDeCible(cible: string): string | undefined {
  for (const [prefixe, id] of SECTIONS) if (cible.startsWith(prefixe)) return SECTION_ETAPE[id] ?? id;
  return undefined;
}

/**
 * Progression de la saisie : une étape est « à compléter » si la fiche y signale une donnée qui
 * bloque le choix, la dose, la durée ou la surveillance ; les données « pour affiner » ne bloquent pas.
 */
export function etapesBloquees(manquants: ReadonlyMap<string, boolean>): ReadonlySet<string> {
  const aCompleter = new Set<string>();
  for (const [cible, bloquant] of manquants) {
    const etape = bloquant ? etapeDeCible(cible) : undefined;
    if (etape) aCompleter.add(etape);
  }
  return aCompleter;
}

function Progression({ aCompleter, replies, ouvrir, toutDeplier }: { aCompleter: ReadonlySet<string>; replies: ReadonlySet<string>; ouvrir: (id: string) => void; toutDeplier: () => void }) {
  const faites = ETAPES.filter((e) => !aCompleter.has(e.id)).length;
  const aller = (id: string) => {
    ouvrir(id);
    const el = document.getElementById(id);
    if (!el) return;
    const reduit = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView?.({ block: 'start', behavior: reduit ? 'auto' : 'smooth' });
    el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  };
  return (
    <nav className="progression" aria-label="Étapes de la saisie">
      <div className="progression-titre">
        <span>
          {faites === ETAPES.length ? 'Saisie suffisante pour la proposition' : `${faites} étape${faites > 1 ? 's' : ''} sur ${ETAPES.length} sans donnée bloquante`}
        </span>
        {replies.size > 0 && (
          <button type="button" className="btn discret tout-deplier" onClick={toutDeplier}>
            Tout déplier ({replies.size} étape{replies.size > 1 ? 's' : ''} repliée{replies.size > 1 ? 's' : ''})
          </button>
        )}
        <span className="progression-barre" aria-hidden="true">
          <i style={{ width: `${(faites / ETAPES.length) * 100}%` }} />
        </span>
      </div>
      <ol className="etapes">
        {ETAPES.map((e, i) => {
          const ok = !aCompleter.has(e.id);
          return (
            <li key={e.id}>
              <button type="button" className={ok ? 'etape faite' : 'etape a-faire'} onClick={() => aller(e.id)}>
                <span className="etape-num" aria-hidden="true">{ok ? '✓' : i + 1}</span>
                {e.libelle}
                <span className="sr-only">{ok ? ' : pas de donnée bloquante' : ' : à compléter'}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
