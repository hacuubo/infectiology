import type { Dossier } from '../engine/etat';
import type { ContexteDecision } from '../engine/contexte';
import { nombreFr } from '../calc/format';
import { formaterDate } from '../schedule/frise';
import { LIBELLE_FOYER, LIBELLE_ORGANISME, libelle } from './libelles';

function tri(v: string): string {
  return v === 'oui' ? 'oui' : v === 'non' ? 'non' : 'non renseigné';
}

/** Lignes du résumé (exportées pour les tests). Toutes les valeurs codées sont traduites en libellés lisibles. */
const LIB_PHENOTYPE: Record<string, string> = { BLSE: 'BLSE', ampc: 'céphalosporinase', carbapenemase: 'carbapénémase', SARM: 'méticilline R', ERV: 'ERG/ERV', hnr_gentamicine: 'HNR gentamicine' };
function mecanismesPresents(prl: { phenotypes?: Partial<Record<string, string>> }): string[] {
  return Object.entries(prl.phenotypes ?? {})
    .filter(([, v]) => v === 'present')
    .map(([k]) => LIB_PHENOTYPE[k] ?? k);
}

export function lignesResume(dossier: Dossier, ctx: ContexteDecision): [string, string][] {
  const p = dossier.patient;
  const r = ctx.renal;
  const lignes: [string, string][] = [];
  lignes.push([
    'Patient',
    `${p.age !== undefined ? `${nombreFr(p.age)} ans` : 'âge ?'}, ${p.sexe === 'inconnu' ? 'sexe ?' : p.sexe}${p.poidsKg !== undefined ? `, ${nombreFr(p.poidsKg, 1)} kg` : ', poids ?'}${p.tailleCm !== undefined ? `, ${nombreFr(p.tailleCm)} cm` : ''}`,
  ]);
  if (p.sexe !== 'homme' && (p.age === undefined || p.age <= 55)) lignes.push(['Grossesse', tri(p.grossesse)]);
  const renalTxt: string[] = [];
  const u = p.renal.creatinine?.unite;
  if (p.renal.creatinine) renalTxt.push(`créat. ${nombreFr(p.renal.creatinine.valeur, 2)} ${u === 'umol/L' ? 'µmol/L' : u === 'mg/dL' ? 'mg/dL' : '(unité ?)'}${p.renal.creatinine.date ? ` du ${p.renal.creatinine.date}` : ''}`);
  // Les trois estimations restent distinctes : nom de la formule et unité toujours affichés.
  for (const e of r.estimations) if (e.calculable) renalTxt.push(`${e.libelle} (${e.nomCourt}) ≈ ${nombreFr(e.valeur!)} ${e.unite}`);
  if (p.renal.dfg) renalTxt.push(`valeur fournie (${p.renal.dfg.methode}) ${nombreFr(p.renal.dfg.valeur, 1)} ${p.renal.dfg.unite ?? '(unité ?)'}`);
  if (p.renal.dialyse !== 'aucune' && p.renal.dialyse !== 'inconnu') renalTxt.push(libelle(p.renal.dialyse));
  if (p.renal.insuffisanceRenaleAigue === 'oui') renalTxt.push('IRA');
  if (p.renal.stabilite === 'instable') renalTxt.push('instable');
  if (r.incoherences.some((i) => i.cible === 'patient.renal.creatinine')) renalTxt.push('créatininémie non utilisée (valeur, unité ou date à vérifier)');
  lignes.push(['Rein', renalTxt.length ? renalTxt.join(' ; ') : 'non renseigné']);
  if (!r.applicable && r.raisonNonApplicable && r.etat !== 'dialyse') lignes.push(['Estimations', `non utilisées pour les doses : ${r.raisonNonApplicable}`]);
  lignes.push([
    'Allergies',
    p.statutAllergie === 'inconnu' ? 'non renseigné' : p.allergies.length ? p.allergies.map((a) => `${a.molecule || '?'} (${libelle(a.reaction)}${a.gravite && a.gravite !== 'inconnue' ? `, ${a.gravite === 'severe' ? 'sévère' : a.gravite === 'moderee' ? 'modérée' : 'légère'}` : ''})`).join(' ; ') : 'aucune connue',
  ]);
  const terrain: string[] = [];
  if (p.immunodepression === 'oui') terrain.push('immunodépression');
  if (p.neutropenie === 'oui') terrain.push('neutropénie');
  if (p.insuffisanceHepatique === 'oui') terrain.push('insuffisance hépatique');
  if (terrain.length) lignes.push(['Terrain', terrain.join(', ')]);
  lignes.push(['Contexte', `${libelle(p.contexte)} ; gravité : ${libelle(p.gravite)}`]);
  const mat: string[] = [];
  if (p.valve !== 'native' && p.valve !== 'inconnu') mat.push(`valve : ${libelle(p.valve)}`);
  if (p.dispositifIntracardiaque === 'oui') mat.push('dispositif intracardiaque');
  if (p.protheseArticulaire === 'oui') mat.push(`prothèse/matériel orthopédique${p.protheseArticulaireDetails?.site ? ` (${p.protheseArticulaireDetails.site})` : ''}`);
  if (!['aucun', 'inconnu'].includes(p.materielVasculaire)) mat.push(libelle(p.materielVasculaire));
  if (!['aucun', 'inconnu'].includes(p.materielUrinaire)) mat.push(libelle(p.materielUrinaire));
  const materielInconnu = [p.valve === 'inconnu', p.dispositifIntracardiaque === 'inconnu', p.protheseArticulaire === 'inconnu', p.materielVasculaire === 'inconnu', p.materielUrinaire === 'inconnu'].some(Boolean);
  lignes.push(['Matériel', mat.length ? `${mat.join(', ')}${materielInconnu ? ' (autres : non renseignés)' : ''}` : materielInconnu ? 'non renseigné' : 'aucun']);
  if (p.antibiotiquesRecents.length) lignes.push(['Antibiotiques récents', p.antibiotiquesRecents.map((a) => `${a.dci || '?'}${a.enCours === 'oui' ? ' (en cours)' : ''}`).join(', ')]);
  if (p.antecedentsMicro.length) lignes.push(['Antécédents micro.', p.antecedentsMicro.map((a) => `${a.organisme || '?'} ${a.resistance ? libelle(a.resistance) : ''}`.trim()).join(', ')]);
  dossier.prelevements.forEach((prl, i) => {
    const desc: string[] = [];
    if (prl.stade === 'examen_direct') desc.push(`examen direct : ${prl.examenDirect ? libelle(prl.examenDirect) : '?'}`);
    if (prl.organisme) desc.push(prl.organisme === 'autre' && prl.organismeLibre ? prl.organismeLibre : LIBELLE_ORGANISME[prl.organisme]);
    if (prl.stade === 'antibiogramme') desc.push(`antibiogramme : ${prl.antibiogramme?.length ?? 0} molécule(s)${mecanismesPresents(prl).length ? ` ; ${mecanismesPresents(prl).join(', ')}` : ''}${(prl.isolatsSupplementaires?.length ?? 0) > 0 ? ` ; + ${prl.isolatsSupplementaires!.length} autre(s) germe(s)` : ''}`);
    if (prl.hemoc) {
      if (prl.hemoc.nbSeriesPositives !== undefined) desc.push(`${prl.hemoc.nbSeriesPositives}/${prl.hemoc.nbSeriesPrelevees ?? '?'} séries positives`);
      if (prl.hemoc.persistance !== 'inconnu') desc.push(libelle(prl.hemoc.persistance));
    }
    if (prl.foyer !== 'inconnu') desc.push(`foyer ${prl.foyerStatut === 'inconnu' ? 'de statut non précisé' : libelle(prl.foyerStatut)} : ${LIBELLE_FOYER[prl.foyer].split(' (')[0]}`);
    const type = prl.type === 'hemoculture' ? 'Hémocultures' : prl.type === 'urine' ? 'ECBU' : 'Prélèvement';
    lignes.push([`${type}${dossier.prelevements.length > 1 ? ` (${i + 1})` : ''}`, desc.join(' ; ') || 'en attente']);
  });
  if (dossier.entree === 'syndrome' && dossier.syndrome !== 'non_choisi') lignes.push(['Syndrome', LIBELLE_FOYER[dossier.syndrome].split(' (')[0]]);
  lignes.push(['1re dose', dossier.horaires.premiereDoseISO ? formaterDate(dossier.horaires.premiereDoseISO) : 'horaire non saisi (calendrier relatif)']);
  return lignes;
}

export function ResumePatient({ dossier, ctx }: { dossier: Dossier; ctx: ContexteDecision }) {
  const lignes = lignesResume(dossier, ctx);
  return (
    <section className="resume" aria-label="Résumé du patient">
      <h2 className="sr-only">Résumé du dossier</h2>
      <dl>
        {lignes.map(([k, v], i) => (
          <div className="paire" key={`${k}-${i}`}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Une pastille du bandeau patient ; `manque` la signale comme donnée à compléter. */
type Pastille = { texte: string; etat?: 'manque' | 'ok' | 'alerte' };

/** Pastilles du bandeau patient permanent (exportées pour les tests). Aucune valeur n'est déduite. */
export function pastillesBandeau(dossier: Dossier, ctx: ContexteDecision): Pastille[] {
  const p = dossier.patient;
  const out: Pastille[] = [];
  const sexe = p.sexe === 'inconnu' ? 'sexe ?' : p.sexe === 'femme' ? 'Femme' : 'Homme';
  out.push({ texte: `${sexe}, ${p.age !== undefined ? `${nombreFr(p.age)} ans` : 'âge ?'}`, etat: p.sexe === 'inconnu' || p.age === undefined ? 'manque' : undefined });
  out.push({ texte: `${p.poidsKg !== undefined ? `${nombreFr(p.poidsKg, 1)} kg` : 'poids ?'}${p.tailleCm !== undefined ? ` · ${nombreFr(p.tailleCm)} cm` : ''}`, etat: p.poidsKg === undefined ? 'manque' : undefined });
  const est = ctx.renal.estimations.find((e) => e.calculable && e.valeur !== undefined);
  if (p.renal.dialyse !== 'aucune' && p.renal.dialyse !== 'inconnu') out.push({ texte: libelle(p.renal.dialyse) });
  else if (est) out.push({ texte: `${est.nomCourt} ${nombreFr(est.valeur!)} ${est.unite}` });
  else if (p.renal.dfg) out.push({ texte: `DFG ${nombreFr(p.renal.dfg.valeur, 1)} ${p.renal.dfg.unite ?? ''}`.trim() });
  else out.push({ texte: 'rein ?', etat: 'manque' });
  out.push(
    p.statutAllergie === 'inconnu'
      ? { texte: 'allergie ?', etat: 'manque' }
      : p.statutAllergie === 'presentes'
        ? { texte: `Allergie : ${p.allergies.map((a) => a.molecule || '?').join(', ') || 'à préciser'}`, etat: 'alerte' }
        : { texte: 'Allergie : aucune connue', etat: 'ok' },
  );
  out.push({ texte: p.contexte === 'inconnu' ? 'contexte ?' : libelle(p.contexte).replace(/^./, (c) => c.toUpperCase()), etat: p.contexte === 'inconnu' ? 'manque' : undefined });
  if (p.gravite === 'sepsis' || p.gravite === 'choc_septique') out.push({ texte: libelle(p.gravite).replace(/^./, (c) => c.toUpperCase()), etat: 'alerte' });
  return out;
}

export function BandeauPatient({ dossier, ctx }: { dossier: Dossier; ctx: ContexteDecision }) {
  return (
    <ul className="bandeau-patient" aria-label="Patient en cours">
      {pastillesBandeau(dossier, ctx).map((x, i) => (
        <li key={i} className={x.etat ? `pastille ${x.etat}` : 'pastille'}>
          {x.texte}
        </li>
      ))}
    </ul>
  );
}
