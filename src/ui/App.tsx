import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { clonerDossier, dossierParDefaut, nettoyerDossier, type Dossier, type Invalidation } from '../engine/etat';
import { deciderSansPanne } from '../engine/decider';
import { comparerPlans } from '../engine/comparaison';
import type { Plan } from '../clinical/types';
import { GardeErreur, GardeLocale, PanneauErreurTechnique } from './Explication';
import { contexteUI } from './contexte-ui';
import { FormulaireDossier } from './FormulaireDossier';
import { ResumePatient } from './ResumePatient';
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
  const [onglet, setOnglet] = useState<'saisie' | 'resultat'>('saisie');
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
  }, []);

  return (
    <div className="app">
      <header className="bandeau">
        <h1>Infectiology — aide à la décision en antibiothérapie (adulte)</h1>
        {obsolete && <Badge type="urgence">base clinique possiblement obsolète (voir en fin de page)</Badge>}
      </header>

      {/* Barre permanente : alertes urgentes et résumé du patient, visibles quel que soit l'onglet ou le défilement. */}
      <div className="barre-contexte">
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
        <div id="resume-patient" hidden={resumeReduit}>
          {ctx && (
            <GardeLocale nom="résumé du patient" cle={dossier}>
              <ResumePatient dossier={dossier} ctx={ctx} />
            </GardeLocale>
          )}
        </div>
      </div>

      <nav className="onglets" aria-label="Affichage sur écran étroit">
        <button type="button" aria-pressed={onglet === 'saisie'} className={onglet === 'saisie' ? 'actif' : ''} onClick={() => setOnglet('saisie')}>
          Patient
        </button>
        <button type="button" aria-pressed={onglet === 'resultat'} className={onglet === 'resultat' ? 'actif' : ''} onClick={() => setOnglet('resultat')}>
          Prise en charge {niveau !== 'standard' && <Badge type={typeUrgence(niveau)}>{niveau === 'immediate' ? 'urgence' : 'élevée'}</Badge>}
        </button>
      </nav>

      <main className="contenu">
        <div className={`colonne-saisie ${onglet === 'resultat' ? 'masque-etroit' : ''}`}>
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
              <FormulaireDossier dossier={dossier} modifier={modifier} />
            </ChampsManquants.Provider>
          </GardeLocale>
          {ctx && (
            <GardeLocale nom="demande d’avis" cle={dossier}>
              <AvisInfectiologique key={nouveauPatient} dossier={dossier} ctx={ctx} />
            </GardeLocale>
          )}
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
        <div className={`colonne-resultat ${onglet === 'saisie' ? 'masque-etroit' : ''}`}>
          {resultat.ok && plan ? (
            <GardeErreur cle={plan} rendu={(message, reessayer) => <PanneauErreurTechnique sortie={{ traitement: 'aucun', urgence: false, actionsUrgentes: [], ecartees: [], motifs: [{ type: 'erreur_technique', rang: 0, statut: 'Erreur technique d’affichage — ce n’est pas une conclusion médicale', motif: `L’affichage de la prise en charge a échoué (${message}).`, verifie: [], dejaPropose: [], aCompleter: [], prochaineAction: 'Les données saisies sont conservées : réessayer. Si l’erreur persiste, décider sans l’application (avis du SMIT) et signaler l’erreur.', sources: [], origine: ['interface'] }] }} onReessayer={reessayer} />}>
              <PanneauResultat plan={plan} dossier={dossier} onRetenir={(id) => modifier((x) => (x.optionRetenueId = id))} allerAuChamp={allerAuChamp} changements={changements} />
            </GardeErreur>
          ) : (
            !resultat.ok && <PanneauErreurTechnique sortie={resultat.sortie} onReessayer={() => setEssai((n) => n + 1)} />
          )}
          <footer className="pied">
            Outil en développement, non validé pour l'usage clinique. Moteur déterministe : à entrées et version clinique identiques, le résultat est identique. Les règles « vérifiées par IA » ne sont pas validées médicalement. Sources : SPILF, HAS, ANSM, CA-SFM/EUCAST, ESCMID, ESC, IDSA ; voir les sources de chaque prise en charge.
          </footer>
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
