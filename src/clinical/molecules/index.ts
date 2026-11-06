import type { Molecule } from '../types';
import { amikacine, gentamicine, vancomycine, daptomycine } from './aminosides-glycopeptides';
import { cefotaxime, ceftriaxone, cloxacilline, cefazoline, amoxicilline, amoxicillineClavulanate, piperacillineTazobactam, temocilline, cefoxitine, cefepime, meropeneme, imipeneme, ertapeneme, aztreonam, cefixime } from './betalactamines';
import { ciprofloxacine, levofloxacine, cotrimoxazole, rifampicine } from './divers';
import { fosfomycineTrometamol, pivmecillinam, nitrofurantoine, trimethoprime } from './urinaires-oraux';
import { fidaxomicine, vancomycineOrale } from './clostridioides-difficile';

export const MOLECULES: Molecule[] = [
  cefotaxime,
  ceftriaxone,
  cloxacilline,
  cefazoline,
  amoxicilline,
  amoxicillineClavulanate,
  piperacillineTazobactam,
  temocilline,
  cefoxitine,
  cefepime,
  meropeneme,
  imipeneme,
  ertapeneme,
  aztreonam,
  cefixime,
  amikacine,
  gentamicine,
  vancomycine,
  daptomycine,
  ciprofloxacine,
  levofloxacine,
  cotrimoxazole,
  rifampicine,
  fosfomycineTrometamol,
  pivmecillinam,
  nitrofurantoine,
  trimethoprime,
  fidaxomicine,
  vancomycineOrale,
];

export const MOLECULES_PAR_ID: Record<string, Molecule> = Object.fromEntries(MOLECULES.map((m) => [m.id, m]));

export function molecule(id: string): Molecule {
  const m = MOLECULES_PAR_ID[id];
  if (!m) throw new Error(`Molécule inconnue dans la base clinique : ${id}`);
  return m;
}

export function regimen(moleculeId: string, regimenId: string) {
  const m = molecule(moleculeId);
  const r = m.regimens.find((x) => x.id === regimenId);
  if (!r) throw new Error(`Régime inconnu : ${moleculeId}/${regimenId}`);
  return { molecule: m, regimen: r };
}
