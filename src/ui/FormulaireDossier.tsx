import { useState } from 'react';
import type { Dossier } from '../engine/etat';
import { nouveauPrelevement, REGLES_PERTINENCE, REGLES_PERTINENCE_PRELEVEMENT } from '../engine/etat';
import type { Allergie, AntecedentMicrobiologique, AntibiotiqueRecent, FoyerId, Prelevement, TraitementAssocie } from '../clinical/types';
import { AntibiogrammeGuide, ChampReferentiel, ContexteECBUSaisie, IsolatsSupplementaires, SelectOrganisme } from './Microbiologie';
import { SectionIndication } from './Indication';
import { Champ, ChampNombre, ChampTexte, ChoixRadio, ChoixTri, RefsInline, Select } from './composants';
import { creatininePlausible } from '../calc/renal';
import { FOYERS_ENTREE_A, LIBELLE_FOYER, LIBELLE_TRAITEMENT } from './libelles';
import { contexteUI } from './contexte-ui';
import { nombreFr } from '../calc/format';
import { S } from '../clinical/molecules/base';
import { GardeLocale } from './Explication';

type Modifier = (fn: (d: Dossier) => void) => void;

/**
 * Définition des infections associées aux soins (CTINILS 2007), citée par la recommandation IUAS 2015.
 * « Communautaire » (les autres situations) : complément formulé par l'application.
 */
const DEFINITION_IAS = S(
  'SPILF-AFU-SF2H-2015-IUAS',
  'Sous-question 4 « Quels sont les critères définissant l’association aux soins ? » (définition du CTINILS citée) ; « communautaire » : complément formulé par l’application',
  '« Une infection est dite associée aux soins (IAS) si elle survient au cours ou au décours d’une prise en charge […] et si elle n’était ni présente, ni en incubation au début de la prise en charge. »',
);

function pertinent(champ: string, d: Dossier): boolean {
  const r = REGLES_PERTINENCE.find((x) => x.champ === champ);
  return r ? r.pertinent(d) : true;
}
function pertinentP(champ: string, p: Prelevement, d: Dossier): boolean {
  const r = REGLES_PERTINENCE_PRELEVEMENT.find((x) => x.champ === champ);
  return r ? r.pertinent(p, d) : true;
}

export function FormulaireDossier({ dossier, modifier }: { dossier: Dossier; modifier: Modifier }) {
  const d = dossier;
  const p = d.patient;
  return (
    <>
      <section className="carte" aria-labelledby="t-entree">
        <h2 id="t-entree">1. Point d'entrée</h2>
        <ChoixRadio
          libelle="Par quoi commencez-vous ?" cible="entree"
          valeur={d.entree}
          options={[
            { v: 'syndrome', l: 'A. Syndrome ou foyer infectieux' },
            { v: 'microbiologie', l: 'B. Résultat microbiologique' },
          ]}
          onChange={(v) =>
            modifier((x) => {
              x.entree = v;
              if (v === 'microbiologie' && x.prelevements.length === 0) x.prelevements.push(nouveauPrelevement('hemoculture'));
            })
          }
        />
        {d.entree === 'syndrome' && (
          <Select
            libelle="Syndrome / foyer" cible="entree.syndrome"
            valeur={d.syndrome}
            options={[{ v: 'non_choisi' as const, l: '— choisir —' }, ...FOYERS_ENTREE_A.map((f) => ({ v: f, l: LIBELLE_FOYER[f] }))]}
            onChange={(v) => modifier((x) => (x.syndrome = v as FoyerId | 'non_choisi'))}
          />
        )}
        {d.entree === 'syndrome' && d.syndrome !== 'non_choisi' && (
          <p className="aide">
            Vous pourrez ajouter les prélèvements (hémocultures, ECBU…) à l'étape 4 ; les propositions probabilistes s'affichent dès maintenant et seront précisées par la microbiologie.
          </p>
        )}
      </section>

      <section className="carte" aria-labelledby="t-patient">
        <h2 id="t-patient">2. Patient</h2>
        <div className="deux-colonnes">
          <ChampNombre libelle="Âge" valeur={p.age} onChange={(v) => modifier((x) => (x.patient.age = v))} unite="ans" min={0} max={120} step={1} cible="patient.age" />
          <ChoixRadio libelle="Sexe" valeur={p.sexe} options={[{ v: 'femme', l: 'Femme' }, { v: 'homme', l: 'Homme' }]} onChange={(v) => modifier((x) => (x.patient.sexe = v))} cible="patient.sexe" />
        </div>
        <div className="deux-colonnes">
          <ChampNombre libelle="Poids" valeur={p.poidsKg} onChange={(v) => modifier((x) => (x.patient.poidsKg = v))} unite="kg" min={25} max={300} cible="patient.poidsKg" />
          <ChampNombre libelle="Taille" valeur={p.tailleCm} onChange={(v) => modifier((x) => (x.patient.tailleCm = v))} unite="cm" min={120} max={230} cible="patient.tailleCm" />
        </div>
        {pertinent('patient.grossesse', d) && (
          <div className="grille-2">
            <ChoixTri libelle="Grossesse" valeur={p.grossesse} onChange={(v) => modifier((x) => (x.patient.grossesse = v))} cible="patient.grossesse" />
            <ChoixTri libelle="Allaitement" valeur={p.allaitement} onChange={(v) => modifier((x) => (x.patient.allaitement = v))} />
          </div>
        )}

        <h3 id="t-renal">Fonction rénale</h3>
        <div className="deux-colonnes">
          <ChampCreatinine creatinine={p.renal.creatinine} modifier={modifier} />
          <ChampDfg dossier={d} modifier={modifier} />
        </div>
        <div className="grille-2">
          <ChoixTri libelle="Insuffisance rénale aiguë en cours ?" valeur={p.renal.insuffisanceRenaleAigue} onChange={(v) => modifier((x) => (x.patient.renal.insuffisanceRenaleAigue = v))} cible="patient.renal.insuffisanceRenaleAigue" />
          <ChoixRadio libelle="Dialyse / épuration extrarénale" valeur={p.renal.dialyse} options={[{ v: 'aucune', l: 'Aucune' }, { v: 'hemodialyse_intermittente', l: 'Hémodialyse intermittente' }, { v: 'eer_continue', l: 'EER continue' }, { v: 'dialyse_peritoneale', l: 'Dialyse péritonéale' }, { v: 'inconnu', l: 'Inconnu' }]} onChange={(v) => modifier((x) => (x.patient.renal.dialyse = v))} cible="patient.renal.dialyse" />
        </div>
        {pertinent('patient.renal.stabilite', d) && (
          <ChoixRadio libelle="Fonction rénale stable ?" aide="Instable : créatininémie variant nettement sur 24-48 h. Les formules d'estimation ne s'appliquent qu'à l'état d'équilibre." valeur={p.renal.stabilite} options={[{ v: 'stable', l: 'Stable' }, { v: 'instable', l: 'Instable / changeante' }, { v: 'inconnu', l: 'Inconnu' }]} onChange={(v) => modifier((x) => (x.patient.renal.stabilite = v))} cible="patient.renal.stabilite" />
        )}
        {pertinent('patient.renal.horairesDialyse', d) && <ChampTexte libelle="Jours et horaires des séances de dialyse" aide="Ex. : lundi/mercredi/vendredi 8 h-12 h. Sert à positionner les doses après séance." valeur={p.renal.horairesDialyse} onChange={(v) => modifier((x) => (x.patient.renal.horairesDialyse = v))} cible="patient.renal.horairesDialyse" />}

        <h3>Terrain</h3>
        <div className="grille-2">
          <ChoixTri libelle="Insuffisance hépatique" valeur={p.insuffisanceHepatique} onChange={(v) => modifier((x) => (x.patient.insuffisanceHepatique = v))} />
          <ChoixTri libelle="Immunodépression" aide="Chimiothérapie, greffe, corticoïdes forte dose, biothérapie, VIH non contrôlé…" valeur={p.immunodepression} onChange={(v) => modifier((x) => (x.patient.immunodepression = v))} />
          {pertinent('patient.neutropenie', d) && <ChoixTri libelle="Neutropénie (PNN < 500/mm³)" cible="patient.neutropenie" valeur={p.neutropenie} onChange={(v) => modifier((x) => (x.patient.neutropenie = v))} />}
        </div>

        <h3>Allergies</h3>
        <ChoixRadio libelle="Allergies médicamenteuses" cible="patient.statutAllergie" aide="« Aucune connue » signifie que la question a été posée ; « Inconnu » qu'elle ne l'a pas été." valeur={p.statutAllergie} options={[{ v: 'aucune', l: 'Aucune connue' }, { v: 'presentes', l: 'Oui, à préciser' }, { v: 'inconnu', l: 'Inconnu' }]} onChange={(v) => modifier((x) => { x.patient.statutAllergie = v; if (v === 'presentes' && x.patient.allergies.length === 0) x.patient.allergies = [{ molecule: '', reaction: 'inconnue' }]; })} />
        {p.statutAllergie === 'presentes' && <Allergies liste={p.allergies} onChange={(l) => modifier((x) => (x.patient.allergies = l))} />}

        <h3>Traitements associés pertinents</h3>
        <p className="aide">Cochez ce qui s'applique ; ne cochez rien si aucun traitement pertinent.</p>
        <div className="cases">
          {(Object.keys(LIBELLE_TRAITEMENT) as TraitementAssocie[]).map((t) => (
            <label key={t}>
              <input type="checkbox" checked={p.traitementsAssocies.includes(t)} onChange={(e) => modifier((x) => { x.patient.traitementsAssocies = e.target.checked ? [...x.patient.traitementsAssocies, t] : x.patient.traitementsAssocies.filter((y) => y !== t); })} />
              {LIBELLE_TRAITEMENT[t]}
            </label>
          ))}
        </div>

        <h3>Antibiotiques récents ou en cours</h3>
        <AntibiotiquesRecents liste={p.antibiotiquesRecents} onChange={(l) => modifier((x) => (x.patient.antibiotiquesRecents = l))} />

        <h3>Antécédents microbiologiques</h3>
        <AntecedentsMicro liste={p.antecedentsMicro} onChange={(l) => modifier((x) => (x.patient.antecedentsMicro = l))} />
      </section>

      <section className="carte" aria-labelledby="t-contexte">
        <h2 id="t-contexte">3. Contexte, gravité et matériel</h2>
        <ChoixRadio libelle="Contexte de l'infection" cible="patient.contexte" valeur={p.contexte} options={[{ v: 'communautaire', l: 'Communautaire' }, { v: 'associe_aux_soins', l: 'Associé aux soins' }, { v: 'inconnu', l: 'Inconnu' }]} onChange={(v) => modifier((x) => (x.patient.contexte = v))} />
        <div className="definition">
          <p>
            <strong>Associée aux soins</strong> : survenue au cours ou au décours d'une prise en charge (diagnostique, thérapeutique, palliative, préventive ou éducative), sans être présente ni en incubation à son début. Si l'état initial est mal connu, un délai d'au moins 48 h, ou supérieur à la période d'incubation, est couramment accepté ; la plausibilité du lien avec les soins s'apprécie au cas par cas. <strong>Communautaire</strong> : les autres situations (complément formulé par l'application).
          </p>
          <RefsInline refs={[DEFINITION_IAS]} />
        </div>
        <ChoixRadio
          libelle="Gravité" cible="patient.gravite"
          valeur={p.gravite}
          options={[{ v: 'stable', l: 'Stable, sans dysfonction d\'organe' }, { v: 'sepsis', l: 'Sepsis' }, { v: 'choc_septique', l: 'Choc septique' }, { v: 'inconnu', l: 'Inconnu' }]}
          onChange={(v) => modifier((x) => (x.patient.gravite = v))}
        />
        <div className="grille-2">
          <ChoixRadio libelle="Valve cardiaque" cible="patient.valve" valeur={p.valve} options={[{ v: 'native', l: 'Native' }, { v: 'prothese_mecanique', l: 'Prothèse mécanique' }, { v: 'prothese_biologique', l: 'Prothèse biologique' }, { v: 'tavi', l: 'TAVI' }, { v: 'inconnu', l: 'Inconnu' }]} onChange={(v) => modifier((x) => (x.patient.valve = v))} />
          <ChoixTri libelle="Dispositif intracardiaque (stimulateur, défibrillateur)" valeur={p.dispositifIntracardiaque} onChange={(v) => modifier((x) => (x.patient.dispositifIntracardiaque = v))} />
          <ChoixTri libelle="Prothèse articulaire ou matériel orthopédique" valeur={p.protheseArticulaire} onChange={(v) => modifier((x) => (x.patient.protheseArticulaire = v))} />
          {pertinent('patient.protheseArticulaireDetails', d) && (
            <div className="sous-bloc">
              <ChampTexte libelle="Site de la prothèse / du matériel" valeur={p.protheseArticulaireDetails?.site} onChange={(v) => modifier((x) => (x.patient.protheseArticulaireDetails = { ...x.patient.protheseArticulaireDetails, site: v }))} />
              <ChampTexte libelle="Date de pose" type="date" valeur={p.protheseArticulaireDetails?.datePose} onChange={(v) => modifier((x) => (x.patient.protheseArticulaireDetails = { ...x.patient.protheseArticulaireDetails, datePose: v }))} />
            </div>
          )}
          <ChoixRadio libelle="Matériel vasculaire" cible="patient.materielVasculaire" valeur={p.materielVasculaire} options={[{ v: 'aucun', l: 'Aucun' }, { v: 'cvc', l: 'Cathéter veineux central' }, { v: 'picc', l: 'PICC' }, { v: 'chambre_implantable', l: 'Chambre implantable' }, { v: 'catheter_dialyse', l: 'Cathéter de dialyse' }, { v: 'autre', l: 'Autre' }, { v: 'inconnu', l: 'Inconnu' }]} onChange={(v) => modifier((x) => (x.patient.materielVasculaire = v))} />
          {pertinent('patient.materielVasculaireDatePose', d) && <ChampTexte libelle="Date de pose du matériel vasculaire" type="date" valeur={p.materielVasculaireDatePose} onChange={(v) => modifier((x) => (x.patient.materielVasculaireDatePose = v))} />}
          {p.sexe === 'homme' && (d.syndrome === 'urinaire' || d.prelevements.some((x) => x.foyer === 'urinaire')) && (
            <ChoixRadio libelle="Forme de l'infection urinaire masculine" cible="patient.formeIUMasculine" aide="La durée dépend de la forme (SPILF 2026) : PNA 7 j, prostatite 14 j, orchi-épididymite 10 j." valeur={p.formeIUMasculine ?? 'inconnu'} options={[{ v: 'pna', l: 'Pyélonéphrite' }, { v: 'prostatite', l: 'Prostatite' }, { v: 'orchi_epididymite', l: 'Orchi-épididymite' }, { v: 'inconnu', l: 'Inconnu' }]} onChange={(v) => modifier((x) => (x.patient.formeIUMasculine = v))} />
          )}
          <ChoixRadio libelle="Matériel urinaire" cible="patient.materielUrinaire" valeur={p.materielUrinaire} options={[{ v: 'aucun', l: 'Aucun' }, { v: 'sonde_vesicale', l: 'Sonde vésicale' }, { v: 'sonde_jj', l: 'Sonde JJ' }, { v: 'nephrostomie', l: 'Néphrostomie' }, { v: 'autre', l: 'Autre' }, { v: 'inconnu', l: 'Inconnu' }]} onChange={(v) => modifier((x) => (x.patient.materielUrinaire = v))} />
        </div>
        <ChampTexte libelle="Intervention ou geste récent (facultatif)" valeur={p.interventionRecente} onChange={(v) => modifier((x) => (x.patient.interventionRecente = v))} />
      </section>

      <section className="carte" aria-labelledby="t-micro">
        <h2 id="t-micro">4. Prélèvements et microbiologie</h2>
        <div className="liste-objets">
          {d.prelevements.map((prl, i) => (
            <FormulairePrelevement key={prl.id} index={i} prl={prl} d={d} modifier={modifier} />
          ))}
        </div>
        <div className="ligne" style={{ marginTop: 8 }}>
          <button type="button" className="btn secondaire" onClick={() => modifier((x) => x.prelevements.push(nouveauPrelevement('hemoculture')))}>+ Hémoculture</button>
          <button type="button" className="btn secondaire" onClick={() => modifier((x) => x.prelevements.push(nouveauPrelevement('urine')))}>+ ECBU</button>
          <button type="button" className="btn secondaire" onClick={() => modifier((x) => x.prelevements.push(nouveauPrelevement('profond')))}>+ Prélèvement profond / opératoire</button>
          <button type="button" className="btn secondaire" onClick={() => modifier((x) => x.prelevements.push(nouveauPrelevement('autre')))}>+ Autre</button>
        </div>
      </section>

      <GardeLocale nom="questions d’indication" cle={d}>
        <SectionIndication dossier={d} modifier={modifier} />
      </GardeLocale>

      <section className="carte" aria-labelledby="t-horaires">
        <h2 id="t-horaires">5. Horaires (pour dater le calendrier)</h2>
        <p className="aide">Facultatif. Sans horaires, le calendrier reste exprimé en délais relatifs ; aucune date n'est inventée.</p>
        <div className="grille-2">
          <ChampTexte libelle="Première dose prévue ou administrée" cible="horaires.premiereDoseISO" type="datetime-local" valeur={d.horaires.premiereDoseISO} onChange={(v) => modifier((x) => (x.horaires.premiereDoseISO = v))} />
          <ChampNombre libelle="Durée de perfusion prévue (aminosides)" valeur={d.horaires.dureePerfusionMin} onChange={(v) => modifier((x) => (x.horaires.dureePerfusionMin = v))} unite="min" min={15} max={240} step={5} />
        </div>
      </section>
    </>
  );
}

function FormulairePrelevement({ index, prl, d, modifier }: { index: number; prl: Prelevement; d: Dossier; modifier: Modifier }) {
  const maj = (fn: (p: Prelevement) => void) =>
    modifier((x) => {
      const t = x.prelevements.find((y) => y.id === prl.id);
      if (t) fn(t);
    });
  const titre = { hemoculture: 'Hémocultures', urine: 'ECBU', profond: 'Prélèvement profond / opératoire', superficiel: 'Prélèvement superficiel', respiratoire: 'Prélèvement respiratoire', autre: 'Autre prélèvement' }[prl.type];
  return (
    <div className="objet" role="group" aria-label={`Prélèvement ${index + 1} — ${titre}`}>
      <div className="entete">
        <strong>
          Prélèvement {index + 1} — {titre}
        </strong>
        <button type="button" className="btn discret" aria-label={`Retirer le prélèvement ${index + 1} (${titre})`} onClick={() => modifier((x) => (x.prelevements = x.prelevements.filter((y) => y.id !== prl.id)))}>
          Retirer
        </button>
      </div>
      <Select libelle="Type" valeur={prl.type} options={[{ v: 'hemoculture', l: 'Hémoculture' }, { v: 'urine', l: 'Urine (ECBU)' }, { v: 'profond', l: 'Profond / opératoire' }, { v: 'superficiel', l: 'Superficiel' }, { v: 'respiratoire', l: 'Respiratoire' }, { v: 'autre', l: 'Autre' }]} onChange={(v) => maj((p) => { p.type = v; if (v === 'hemoculture' && !p.hemoc) p.hemoc = { origine: 'inconnu', persistance: 'inconnu' }; })} />
      <ChoixRadio libelle="Stade du résultat" valeur={prl.stade} options={[{ v: 'examen_direct', l: 'Examen direct seulement' }, { v: 'identification', l: 'Identification (espèce / groupe)' }, { v: 'antibiogramme', l: 'Antibiogramme disponible' }]} onChange={(v) => maj((p) => { p.stade = v; p.antibiogrammeDisponible = v === 'antibiogramme' ? 'oui' : v === 'identification' ? 'non' : 'inconnu'; })} />
      {pertinentP('examenDirect', prl, d) && (
        <ChoixRadio libelle="Examen direct" valeur={prl.examenDirect ?? 'inconnu'} options={[{ v: 'bgn', l: 'Bacilles à Gram négatif' }, { v: 'cgp_amas', l: 'Cocci à Gram positif en amas' }, { v: 'cgp_chainettes', l: 'Cocci à Gram positif en chaînettes' }, { v: 'autre', l: 'Autre' }, { v: 'inconnu', l: 'Inconnu' }]} onChange={(v) => maj((p) => (p.examenDirect = v))} />
      )}
      {pertinentP('organisme', prl, d) && <SelectOrganisme valeur={prl.organisme} libre={prl.organismeLibre} onChange={(v) => maj((p) => (p.organisme = v))} onLibre={(v) => maj((p) => (p.organismeLibre = v))} />}
      {pertinentP('urine', prl, d) && <ContexteECBUSaisie prl={prl} maj={maj} />}
      {pertinentP('antibiogramme', prl, d) && prl.organisme && (
        <>
          <GardeLocale nom="antibiogramme guidé" cle={d}>
            <AntibiogrammeGuide iso={prl} prl={prl} dossier={d} maj={(fn) => maj((p) => fn(p))} />
          </GardeLocale>
          <ChampReferentiel prl={prl} maj={maj} />
        </>
      )}
      <IsolatsSupplementaires prl={prl} dossier={d} majPrl={maj} />
      {pertinentP('hemoc', prl, d) && prl.hemoc && (
        <div className="sous-bloc">
          <div className="grille-2">
            <ChampNombre libelle="Séries prélevées" valeur={prl.hemoc.nbSeriesPrelevees} onChange={(v) => maj((p) => { if (p.hemoc) p.hemoc.nbSeriesPrelevees = v; })} min={0} max={20} step={1} />
            <ChampNombre libelle="Séries positives" valeur={prl.hemoc.nbSeriesPositives} onChange={(v) => maj((p) => { if (p.hemoc) p.hemoc.nbSeriesPositives = v; })} min={0} max={20} step={1} />
            <ChampNombre libelle="Flacons positifs" valeur={prl.hemoc.nbFlaconsPositifs} onChange={(v) => maj((p) => { if (p.hemoc) p.hemoc.nbFlaconsPositifs = v; })} min={0} max={40} step={1} />
          </div>
          <ChoixRadio libelle="Origine des prélèvements positifs" valeur={prl.hemoc.origine} options={[{ v: 'peripherique', l: 'Périphérique' }, { v: 'catheter', l: 'Sur cathéter' }, { v: 'les_deux', l: 'Périphérique et cathéter' }, { v: 'inconnu', l: 'Inconnu' }]} onChange={(v) => maj((p) => { if (p.hemoc) p.hemoc.origine = v; })} />
          {pertinentP('hemoc.delaiPositiviteDifferentielHeures', prl, d) && (
            <ChampNombre libelle="Délai de positivité différentiel (cathéter − périphérique)" aide="Positif ≥ 2 h en faveur d'une origine cathéter (si prélèvements simultanés et volumes comparables)." valeur={prl.hemoc.delaiPositiviteDifferentielHeures} onChange={(v) => maj((p) => { if (p.hemoc) p.hemoc.delaiPositiviteDifferentielHeures = v; })} unite="h" min={-24} max={48} step={0.5} />
          )}
          <ChampTexte libelle="Date/heure de la première hémoculture positive" type="datetime-local" valeur={prl.hemoc.datePremierePositiveISO} onChange={(v) => maj((p) => { if (p.hemoc) p.hemoc.datePremierePositiveISO = v; })} />
          <ChoixRadio libelle="Hémocultures de contrôle" valeur={prl.hemoc.persistance} options={[{ v: 'non_controlees', l: 'Pas encore contrôlées' }, { v: 'negativees', l: 'Négativées' }, { v: 'persistantes', l: 'Toujours positives' }, { v: 'inconnu', l: 'Inconnu' }]} onChange={(v) => maj((p) => { if (p.hemoc) p.hemoc.persistance = v; })} />
          {pertinentP('hemoc.dateNegativationISO', prl, d) && <ChampTexte libelle="Date de la première hémoculture négative" type="datetime-local" aide="Point de départ du calcul de durée pour S. aureus et l'endocardite." valeur={prl.hemoc.dateNegativationISO} onChange={(v) => maj((p) => { if (p.hemoc) p.hemoc.dateNegativationISO = v; })} />}
        </div>
      )}
      <Select libelle="Foyer suspecté ou confirmé" valeur={prl.foyer} options={(Object.keys(LIBELLE_FOYER) as FoyerId[]).map((f) => ({ v: f, l: LIBELLE_FOYER[f] }))} onChange={(v) => maj((p) => (p.foyer = v))} />
      {prl.foyer !== 'inconnu' && <ChoixRadio libelle="Statut du foyer" valeur={prl.foyerStatut} options={[{ v: 'suspecte', l: 'Suspecté' }, { v: 'confirme', l: 'Confirmé' }, { v: 'inconnu', l: 'Inconnu' }]} onChange={(v) => maj((p) => (p.foyerStatut = v))} />}
      {pertinentP('signesInfectionMateriel', prl, d) && <ChoixTri libelle="Signes d'infection sur le matériel (inflammation au point d'insertion, descellement, douleur de prothèse, végétation sur sonde…)" valeur={prl.signesInfectionMateriel} onChange={(v) => maj((p) => (p.signesInfectionMateriel = v))} />}
    </div>
  );
}

function Allergies({ liste, onChange }: { liste: Allergie[]; onChange: (l: Allergie[]) => void }) {
  const maj = (i: number, fn: (a: Allergie) => void) => {
    const copie = liste.map((a) => ({ ...a }));
    fn(copie[i]);
    onChange(copie);
  };
  return (
    <div className="liste-objets">
      {liste.length === 0 && <p className="aide">Aucune allergie déclarée. Si l'information n'est pas connue, laissez vide et précisez-le dans la prise de décision.</p>}
      {liste.map((a, i) => (
        <div key={i} className="objet" role="group" aria-label={`Allergie ${i + 1}`}>
          <div className="entete">
            <strong>Allergie {i + 1}</strong>
            <button type="button" className="btn discret" aria-label={`Retirer l'allergie ${i + 1}`} onClick={() => onChange(liste.filter((_, j) => j !== i))}>Retirer</button>
          </div>
          <ChampTexte libelle="Molécule ou famille" aide="Ex. amoxicilline, pénicillines, céphalosporines, bêta-lactamine non précisée, vancomycine…" valeur={a.molecule} onChange={(v) => maj(i, (x) => (x.molecule = v ?? ''))} />
          <ChoixRadio
            libelle="Type de réaction"
            aide="Immédiate (< 1 h) : urticaire, angio-œdème, bronchospasme, anaphylaxie. Retardée sévère : DRESS, Stevens-Johnson/Lyell, PEAG, atteinte d'organe. Retardée bénigne : éruption maculo-papuleuse isolée."
            valeur={a.reaction}
            options={[{ v: 'immediate', l: 'Immédiate' }, { v: 'retardee_benigne', l: 'Retardée bénigne' }, { v: 'retardee_severe', l: 'Retardée sévère' }, { v: 'intolerance_non_allergique', l: 'Intolérance non allergique' }, { v: 'inconnue', l: 'Inconnue' }]}
            onChange={(v) => maj(i, (x) => (x.reaction = v))}
          />
          <div className="grille-2">
            <ChoixRadio libelle="Gravité" valeur={a.gravite ?? 'inconnue'} options={[{ v: 'legere', l: 'Légère' }, { v: 'moderee', l: 'Modérée' }, { v: 'severe', l: 'Sévère' }, { v: 'inconnue', l: 'Inconnue' }]} onChange={(v) => maj(i, (x) => (x.gravite = v))} />
            <ChampTexte libelle="Délai / date" valeur={a.delai} onChange={(v) => maj(i, (x) => (x.delai = v))} />
          </div>
          <ChampTexte libelle="Molécules de la même famille tolérées depuis (facultatif)" valeur={a.tolerees?.join(', ')} onChange={(v) => maj(i, (x) => (x.tolerees = v ? v.split(',').map((s) => s.trim()).filter(Boolean) : undefined))} />
        </div>
      ))}
      <div>
        <button type="button" className="btn secondaire" onClick={() => onChange([...liste, { molecule: '', reaction: 'inconnue' }])}>+ Déclarer une allergie</button>
      </div>
    </div>
  );
}

function AntibiotiquesRecents({ liste, onChange }: { liste: AntibiotiqueRecent[]; onChange: (l: AntibiotiqueRecent[]) => void }) {
  const maj = (i: number, fn: (a: AntibiotiqueRecent) => void) => {
    const copie = liste.map((a) => ({ ...a }));
    fn(copie[i]);
    onChange(copie);
  };
  return (
    <div className="liste-objets">
      {liste.length === 0 && <p className="aide">Aucun antibiotique récent déclaré (3 derniers mois).</p>}
      {liste.map((a, i) => (
        <div key={i} className="objet">
          <div className="entete">
            <strong>{a.dci || `Antibiotique ${i + 1}`}</strong>
            <button type="button" className="btn discret" aria-label={`Retirer l'antibiotique récent ${i + 1}`} onClick={() => onChange(liste.filter((_, j) => j !== i))}>Retirer</button>
          </div>
          <div className="grille-2">
            <ChampTexte libelle="DCI" valeur={a.dci} onChange={(v) => maj(i, (x) => (x.dci = v ?? ''))} />
            <ChoixTri libelle="En cours ?" valeur={a.enCours} onChange={(v) => maj(i, (x) => (x.enCours = v))} />
            <ChampTexte libelle="Début" type="date" valeur={a.debut} onChange={(v) => maj(i, (x) => (x.debut = v))} />
            {a.enCours !== 'oui' && <ChampTexte libelle="Fin" type="date" valeur={a.fin} onChange={(v) => maj(i, (x) => (x.fin = v))} />}
            {a.enCours === 'oui' && <ChampTexte libelle="Dernière dose administrée (date et heure)" type="datetime-local" valeur={a.derniereDoseISO} onChange={(v) => maj(i, (x) => (x.derniereDoseISO = v))} />}
          </div>
        </div>
      ))}
      <div>
        <button type="button" className="btn secondaire" onClick={() => onChange([...liste, { dci: '', enCours: 'inconnu' }])}>+ Ajouter un antibiotique</button>
      </div>
    </div>
  );
}

function AntecedentsMicro({ liste, onChange }: { liste: AntecedentMicrobiologique[]; onChange: (l: AntecedentMicrobiologique[]) => void }) {
  const maj = (i: number, fn: (a: AntecedentMicrobiologique) => void) => {
    const copie = liste.map((a) => ({ ...a }));
    fn(copie[i]);
    onChange(copie);
  };
  return (
    <div className="liste-objets">
      {liste.length === 0 && <p className="aide">Aucun antécédent de colonisation ou d'infection à bactérie résistante déclaré.</p>}
      {liste.map((a, i) => (
        <div key={i} className="objet">
          <div className="entete">
            <strong>Antécédent {i + 1}</strong>
            <button type="button" className="btn discret" aria-label={`Retirer l'antécédent ${i + 1}`} onClick={() => onChange(liste.filter((_, j) => j !== i))}>Retirer</button>
          </div>
          <div className="grille-2">
            <ChampTexte libelle="Organisme" valeur={a.organisme} onChange={(v) => maj(i, (x) => (x.organisme = v ?? ''))} />
            <Select libelle="Résistance" valeur={a.resistance ?? 'autre'} options={[{ v: 'BLSE', l: 'BLSE' }, { v: 'EPC', l: 'EPC (carbapénémase)' }, { v: 'SARM', l: 'SARM' }, { v: 'ERV', l: 'ERV' }, { v: 'autre', l: 'Autre / non précisée' }]} onChange={(v) => maj(i, (x) => (x.resistance = v))} />
            <ChampTexte libelle="Date" type="date" valeur={a.date} onChange={(v) => maj(i, (x) => (x.date = v))} />
          </div>
        </div>
      ))}
      <div>
        <button type="button" className="btn secondaire" onClick={() => onChange([...liste, { organisme: '', resistance: 'BLSE' }])}>+ Ajouter un antécédent</button>
      </div>
    </div>
  );
}

type Creatinine = Dossier['patient']['renal']['creatinine'];
type UniteCreat = 'umol/L' | 'mg/dL';

/**
 * Créatininémie : valeur et unité explicite (jamais déduite de la valeur). Sans unité choisie, la valeur est
 * conservée mais n'est pas utilisée. Une valeur non plausible pour l'unité est signalée et n'est pas utilisée.
 */
function ChampCreatinine({ creatinine, modifier }: { creatinine: Creatinine; modifier: Modifier }) {
  const [unitePendante, setUnitePendante] = useState<UniteCreat | ''>('');
  const unite = creatinine ? (creatinine.unite ?? '') : unitePendante;
  const verif = creatinine && creatinine.unite ? creatininePlausible(creatinine.valeur, creatinine.unite) : undefined;
  return (
    <Champ libelle="Créatininémie" cible="patient.renal.creatinine">
      <div className="ligne">
        <input
          type="number"
          inputMode="decimal"
          min={0}
          aria-label="Valeur de la créatininémie"
          aria-invalid={verif && !verif.plausible ? true : undefined}
          value={creatinine?.valeur ?? ''}
          onChange={(e) => {
            const v = e.target.value === '' ? undefined : Number(e.target.value);
            if (unite) setUnitePendante(unite); // l'unité choisie est conservée si la valeur est effacée
            modifier((x) => {
              x.patient.renal.creatinine = v === undefined || !Number.isFinite(v) ? undefined : { valeur: v, unite: unite || undefined };
            });
          }}
        />
        <select
          aria-label="Unité de la créatininémie"
          aria-invalid={creatinine && !creatinine.unite ? true : undefined}
          value={unite}
          onChange={(e) => {
            const u = e.target.value as UniteCreat | '';
            setUnitePendante(u);
            modifier((x) => {
              if (x.patient.renal.creatinine) x.patient.renal.creatinine.unite = u || undefined;
            });
          }}
        >
          <option value="">— unité —</option>
          <option value="umol/L">µmol/L</option>
          <option value="mg/dL">mg/dL</option>
        </select>
      </div>
      {creatinine && !creatinine.unite && (
        <span className="erreur" role="alert">
          Unité non choisie : la valeur n’est pas utilisée (l’application ne devine pas l’unité).
        </span>
      )}
      {verif && !verif.plausible && (
        <span className="erreur" role="alert">
          Valeur non utilisée : {verif.raison}
        </span>
      )}
    </Champ>
  );
}

type Dfg = Dossier['patient']['renal']['dfg'];
type MethodeDfg = NonNullable<Dfg>['methode'];

/**
 * DFG estimé indexé (mL/min/1,73 m²) : affiché directement dès que l'application peut le calculer (créatininémie
 * avec unité, âge, sexe) ; sinon, saisi à partir du compte rendu du laboratoire, avec son équation.
 * Le DFG désindexé, la clairance de Cockcroft-Gault et le détail des calculs figurent dans la fiche.
 */
function ChampDfg({ dossier, modifier }: { dossier: Dossier; modifier: Modifier }) {
  // Une panne du calcul ne doit pas effacer le formulaire : le champ redevient alors une saisie manuelle.
  let renal: ReturnType<typeof contexteUI>['renal'] | undefined;
  try {
    renal = contexteUI(dossier).renal;
  } catch {
    renal = undefined;
  }
  const indexe = renal?.estimations.find((e) => e.id === 'dfg_indexe');
  const dfg = dossier.patient.renal.dfg;
  const [methodePendante, setMethodePendante] = useState<MethodeDfg>('inconnue');
  const methode = dfg?.methode ?? methodePendante;
  if (indexe?.calculable && indexe.valeur !== undefined) {
    return (
      <Champ libelle="DFG estimé" cible="patient.renal.dfg">
        <div className="ligne">
          <output className="valeur-calculee" aria-label="DFG estimé calculé">
            {nombreFr(indexe.valeur, 0)}
          </output>
          <span>
            {indexe.unite} ({indexe.nomCourt})
          </span>
        </div>
        {renal && !renal.applicable && <span className="erreur">Non utilisé pour adapter les doses (voir la fiche).</span>}
        {dfg && (
          <div className="ligne">
            <span>
              Valeur saisie : {nombreFr(dfg.valeur, 0)} {dfg.unite ?? '(unité non précisée)'}
            </span>
            <button type="button" className="btn discret" onClick={() => modifier((x) => (x.patient.renal.dfg = undefined))}>
              Effacer
            </button>
          </div>
        )}
      </Champ>
    );
  }
  const unite = dfg?.unite ?? 'mL/min/1,73 m²';
  return (
    <Champ libelle="DFG estimé" cible="patient.renal.dfg">
      <div className="ligne">
        <input
          type="number"
          inputMode="decimal"
          min={0}
          aria-label="DFG estimé (valeur du laboratoire)"
          value={dfg?.valeur ?? ''}
          onChange={(e) => {
            const v = e.target.value === '' ? undefined : Number(e.target.value);
            setMethodePendante(methode);
            modifier((x) => {
              const ancien = x.patient.renal.dfg;
              x.patient.renal.dfg = v === undefined || !Number.isFinite(v) || v <= 0 ? undefined : { valeur: v, methode, unite: ancien?.unite ?? 'mL/min/1,73 m²', date: ancien?.date };
            });
          }}
        />
        <span>{unite}</span>
      </div>
      <select
        aria-label="Équation du DFG saisi"
        value={methode}
        onChange={(e) => {
          const m = e.target.value as MethodeDfg;
          setMethodePendante(m);
          modifier((x) => {
            if (x.patient.renal.dfg) x.patient.renal.dfg.methode = m;
          });
        }}
      >
        <option value="inconnue">— équation —</option>
        <option value="CKD-EPI">CKD-EPI</option>
        <option value="EKFC">EKFC</option>
        <option value="MDRD">MDRD</option>
        <option value="mesure">Mesuré</option>
      </select>
      {dfg && methode === 'inconnue' && (
        <span className="erreur" role="alert">
          Équation non précisée : la valeur n’est pas utilisée pour adapter une dose.
        </span>
      )}
      {!dfg && dossier.patient.renal.creatinine?.valeur !== undefined && indexe && indexe.manquants.length > 0 && (
        <span className="aide">Calcul automatique impossible, il manque : {indexe.manquants.join(', ')}.</span>
      )}
    </Champ>
  );
}
