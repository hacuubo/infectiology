import { useMemo, useState } from 'react';
import { clonerDossier, dossierParDefaut, nettoyerDossier, type Dossier, type Invalidation } from '../engine/etat';
import { decider } from '../engine/decider';
import { construireContexte } from '../engine/contexte';
import { FormulaireDossier } from './FormulaireDossier';
import { ResumePatient } from './ResumePatient';
import { alertesUrgentes, LIBELLE_URGENCE, PanneauResultat, typeUrgence } from './PanneauResultat';
import { VERSION_CLINIQUE, estObsolete } from '../clinical/version';
import { CAS_FICTIFS } from '../tests/cas-fictifs';
import { Badge, RefsInline } from './composants';

export function App() {
  const [dossier, setDossier] = useState<Dossier>(() => dossierParDefaut());
  const [invalidations, setInvalidations] = useState<Invalidation[]>([]);
  const [onglet, setOnglet] = useState<'saisie' | 'resultat'>('saisie');
  const [modeClinique, setModeClinique] = useState(false);
  const [resumeReduit, setResumeReduit] = useState(false);

  const modifier = (fn: (d: Dossier) => void) => {
    setDossier((prev) => {
      const next = clonerDossier(prev);
      fn(next);
      const inv = nettoyerDossier(next);
      if (inv.length) setInvalidations(inv);
      return next;
    });
  };

  const ctx = useMemo(() => construireContexte(dossier), [dossier]);
  const plan = useMemo(() => decider(dossier, { modeUsageClinique: modeClinique }), [dossier, modeClinique]);
  const obsolete = estObsolete(VERSION_CLINIQUE);
  const urgentes = alertesUrgentes(plan);
  const niveau = plan.urgence.niveau;

  return (
    <div className="app">
      <header className="bandeau">
        <h1>Infectiology — aide à la décision en antibiothérapie (adulte)</h1>
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
          <label>
            <input type="checkbox" checked={modeClinique} onChange={(e) => setModeClinique(e.target.checked)} /> N'appliquer que les règles validées par un humain
          </label>
        </div>
      </header>
      <div className="avertissement-global" role="note">
        <strong>Outil en développement, non validé pour l'usage clinique.</strong> Moteur déterministe et règles sourcées, en attendant l'avis du service de maladies infectieuses et tropicales. Aucune donnée saisie n'est conservée ni transmise. Utilisez des cas fictifs.
      </div>

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
          <ResumePatient dossier={dossier} ctx={ctx} />
        </div>
      </div>

      <nav className="onglets" aria-label="Affichage sur écran étroit">
        <button type="button" aria-pressed={onglet === 'saisie'} className={onglet === 'saisie' ? 'actif' : ''} onClick={() => setOnglet('saisie')}>
          Saisie
        </button>
        <button type="button" aria-pressed={onglet === 'resultat'} className={onglet === 'resultat' ? 'actif' : ''} onClick={() => setOnglet('resultat')}>
          Fiche {niveau !== 'standard' && <Badge type={typeUrgence(niveau)}>{niveau === 'immediate' ? 'urgence' : 'élevée'}</Badge>}
        </button>
      </nav>

      <main className="contenu">
        <div className={`colonne-saisie ${onglet === 'resultat' ? 'masque-etroit' : ''}`}>
          <div className="carte">
            <div className="ligne">
              <label>
                Charger un cas fictif :{' '}
                <select
                  aria-label="Cas fictif"
                  value=""
                  onChange={(e) => {
                    const c = CAS_FICTIFS.find((x) => x.id === e.target.value);
                    if (c) {
                      const d = clonerDossier(c.dossier);
                      nettoyerDossier(d);
                      setDossier(d);
                      setInvalidations([]);
                    }
                  }}
                >
                  <option value="">— choisir —</option>
                  {CAS_FICTIFS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.titre}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="btn discret"
                onClick={() => {
                  setDossier(dossierParDefaut());
                  setInvalidations([]);
                }}
              >
                Réinitialiser
              </button>
            </div>
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
          <FormulaireDossier dossier={dossier} modifier={modifier} />
        </div>
        <div className={`colonne-resultat ${onglet === 'saisie' ? 'masque-etroit' : ''}`}>
          <PanneauResultat plan={plan} dossier={dossier} onRetenir={(id) => modifier((x) => (x.optionRetenueId = id))} />
          <footer className="pied">
            Moteur déterministe : à entrées et version clinique identiques, le résultat est identique. Les règles « vérifiées par IA » ne sont pas validées médicalement. Sources : SPILF, HAS, ANSM, CA-SFM/EUCAST, ESCMID, ESC, IDSA ; voir le registre des sources dans chaque fiche.
          </footer>
        </div>
      </main>
    </div>
  );
}
