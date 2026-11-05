import type { Dossier } from '../engine/etat';
import type { ContexteDecision } from '../engine/contexte';
import { nombreFr } from '../calc/format';
import { formaterDate } from '../schedule/frise';
import { LIBELLE_FOYER, LIBELLE_ORGANISME, libelle } from './libelles';

function tri(v: string): string {
  return v === 'oui' ? 'oui' : v === 'non' ? 'non' : 'non renseigné';
}

/** Lignes du résumé (exportées pour les tests). Toutes les valeurs codées sont traduites en libellés lisibles. */
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
  if (p.renal.creatinine) renalTxt.push(`créat. ${nombreFr(p.renal.creatinine.valeur, 2)} ${p.renal.creatinine.unite === 'umol/L' ? 'µmol/L' : 'mg/dL'}`);
  if (r.cockcroftMlMin !== undefined && Number.isFinite(r.cockcroftMlMin)) renalTxt.push(`Cockcroft ≈ ${nombreFr(r.cockcroftMlMin)} mL/min`);
  if (r.ckdEpi2021 !== undefined && Number.isFinite(r.ckdEpi2021)) renalTxt.push(`CKD-EPI 2021 ≈ ${nombreFr(r.ckdEpi2021)} mL/min/1,73 m²`);
  if (p.renal.dfg) renalTxt.push(`${p.renal.dfg.methode} saisi ${nombreFr(p.renal.dfg.valeur, 1)}`);
  if (p.renal.dialyse !== 'aucune' && p.renal.dialyse !== 'inconnu') renalTxt.push(libelle(p.renal.dialyse));
  if (p.renal.insuffisanceRenaleAigue === 'oui') renalTxt.push('IRA');
  if (p.renal.stabilite === 'instable') renalTxt.push('instable');
  if (r.manquants.some((m) => m.startsWith('créatininémie valide'))) renalTxt.push('créatininémie non utilisée (valeur ou unité à vérifier)');
  lignes.push(['Rein', renalTxt.length ? renalTxt.join(' ; ') : 'non renseigné']);
  if (r.valeurPourPosologie && p.renal.dialyse !== 'hemodialyse_intermittente' && p.renal.dialyse !== 'eer_continue' && p.renal.dialyse !== 'dialyse_peritoneale') {
    lignes.push(['Retenu pour les doses', `${nombreFr(r.valeurPourPosologie.valeur)} mL/min (${r.valeurPourPosologie.methode})${r.applicable ? '' : ' — indicatif seulement'}`]);
  }
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
    if (prl.stade === 'antibiogramme') desc.push(`antibiogramme : ${prl.antibiogramme?.length ?? 0} molécule(s)${prl.mecanismes?.length ? ` ; ${prl.mecanismes.map(libelle).join(', ')}` : ''}`);
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
