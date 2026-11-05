import { Fragment } from 'react';
import type { Dossier } from '../engine/etat';
import type { ContexteDecision } from '../engine/contexte';
import { arrondi } from '../calc/renal';
import { LIBELLE_FOYER, LIBELLE_ORGANISME } from './libelles';

function tri(v: string): string {
  return v === 'oui' ? 'oui' : v === 'non' ? 'non' : 'inconnu';
}

export function ResumePatient({ dossier, ctx }: { dossier: Dossier; ctx: ContexteDecision }) {
  const p = dossier.patient;
  const r = ctx.renal;
  const lignes: [string, string][] = [];
  lignes.push(['Patient', `${p.age !== undefined ? `${p.age} ans` : 'âge ?'}, ${p.sexe === 'inconnu' ? 'sexe ?' : p.sexe}${p.poidsKg ? `, ${p.poidsKg} kg` : ', poids ?'}${p.tailleCm ? `, ${p.tailleCm} cm` : ''}`]);
  if (p.sexe !== 'homme' && (p.age === undefined || p.age <= 55)) lignes.push(['Grossesse', tri(p.grossesse)]);
  const renalTxt: string[] = [];
  if (p.renal.creatinine) renalTxt.push(`créat. ${p.renal.creatinine.valeur} ${p.renal.creatinine.unite === 'umol/L' ? 'µmol/L' : 'mg/dL'}`);
  if (r.cockcroftMlMin !== undefined) renalTxt.push(`Cockcroft ≈ ${arrondi(r.cockcroftMlMin)} mL/min`);
  if (r.ckdEpi2021 !== undefined) renalTxt.push(`CKD-EPI 2021 ≈ ${arrondi(r.ckdEpi2021)} mL/min/1,73 m²`);
  if (p.renal.dfg) renalTxt.push(`${p.renal.dfg.methode} saisi ${p.renal.dfg.valeur}`);
  if (p.renal.dialyse !== 'aucune' && p.renal.dialyse !== 'inconnu') renalTxt.push(p.renal.dialyse.replace(/_/g, ' '));
  if (p.renal.insuffisanceRenaleAigue === 'oui') renalTxt.push('IRA');
  if (p.renal.stabilite === 'instable') renalTxt.push('instable');
  lignes.push(['Rein', renalTxt.length ? renalTxt.join(' ; ') : 'non renseigné']);
  lignes.push(['Allergies', p.statutAllergie === 'inconnu' ? 'non renseigné' : p.allergies.length ? p.allergies.map((a) => `${a.molecule || '?'} (${a.reaction.replace(/_/g, ' ')})`).join(' ; ') : 'aucune connue']);
  const terrain: string[] = [];
  if (p.immunodepression === 'oui') terrain.push('immunodépression');
  if (p.neutropenie === 'oui') terrain.push('neutropénie');
  if (p.insuffisanceHepatique === 'oui') terrain.push('insuffisance hépatique');
  if (terrain.length) lignes.push(['Terrain', terrain.join(', ')]);
  lignes.push(['Contexte', `${p.contexte.replace(/_/g, ' ')} ; gravité : ${p.gravite.replace(/_/g, ' ')}`]);
  const mat: string[] = [];
  if (p.valve !== 'native' && p.valve !== 'inconnu') mat.push(`valve : ${p.valve.replace(/_/g, ' ')}`);
  if (p.dispositifIntracardiaque === 'oui') mat.push('dispositif intracardiaque');
  if (p.protheseArticulaire === 'oui') mat.push(`prothèse/matériel orthopédique${p.protheseArticulaireDetails?.site ? ` (${p.protheseArticulaireDetails.site})` : ''}`);
  if (!['aucun', 'inconnu'].includes(p.materielVasculaire)) mat.push(p.materielVasculaire.replace(/_/g, ' '));
  if (!['aucun', 'inconnu'].includes(p.materielUrinaire)) mat.push(p.materielUrinaire.replace(/_/g, ' '));
  const materielInconnu = [p.valve === 'inconnu', p.dispositifIntracardiaque === 'inconnu', p.protheseArticulaire === 'inconnu', p.materielVasculaire === 'inconnu', p.materielUrinaire === 'inconnu'].some(Boolean);
  lignes.push(['Matériel', mat.length ? `${mat.join(', ')}${materielInconnu ? ' (autres : non renseignés)' : ''}` : materielInconnu ? 'non renseigné' : 'aucun']);
  if (p.antibiotiquesRecents.length) lignes.push(['Antibiotiques récents', p.antibiotiquesRecents.map((a) => a.dci || '?').join(', ')]);
  if (p.antecedentsMicro.length) lignes.push(['Antécédents micro.', p.antecedentsMicro.map((a) => `${a.organisme || '?'} ${a.resistance ?? ''}`).join(', ')]);
  for (const prl of dossier.prelevements) {
    const desc: string[] = [];
    if (prl.stade === 'examen_direct') desc.push(`direct : ${prl.examenDirect ?? '?'}`);
    if (prl.organisme) desc.push(LIBELLE_ORGANISME[prl.organisme]);
    if (prl.stade === 'antibiogramme') desc.push(`ATB ${prl.antibiogramme?.length ?? 0} molécules${prl.mecanismes?.length ? ` ; ${prl.mecanismes.join(', ')}` : ''}`);
    if (prl.hemoc) {
      if (prl.hemoc.nbSeriesPositives !== undefined) desc.push(`${prl.hemoc.nbSeriesPositives}/${prl.hemoc.nbSeriesPrelevees ?? '?'} séries +`);
      if (prl.hemoc.persistance !== 'inconnu') desc.push(prl.hemoc.persistance.replace(/_/g, ' '));
    }
    if (prl.foyer !== 'inconnu') desc.push(`foyer ${prl.foyerStatut} : ${LIBELLE_FOYER[prl.foyer].split(' (')[0]}`);
    lignes.push([prl.type === 'hemoculture' ? 'Hémoc.' : prl.type === 'urine' ? 'ECBU' : 'Prélèvement', desc.join(' ; ') || 'en attente']);
  }
  return (
    <div className="carte resume" aria-label="Résumé du patient">
      <h2>Résumé du dossier</h2>
      <dl>
        {lignes.map(([k, v], i) => (
          <Fragment key={`${k}-${i}`}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </Fragment>
        ))}
      </dl>
    </div>
  );
}
