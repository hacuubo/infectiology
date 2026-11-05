import etat from './etat-base.json';

export interface EtatBaseClinique {
  version: string;
  dateValidationHumaine: string | null;
  statutGlobal: 'brouillon' | 'verifiee_ia' | 'validee_humain' | 'publiee';
  derniereVeilleReussie: string | null;
  derniereVeilleTentee: string | null;
  perimetreSurveille: string[];
  changementsEnAttente: { id: string; resume: string; date: string; pr?: string }[];
  obsolescence: { alerte: boolean; texte: string };
}

export const VERSION_CLINIQUE: EtatBaseClinique = etat as EtatBaseClinique;

/** Une base est considérée obsolète si aucune veille réussie depuis plus de 2 mois (veille mensuelle + marge). */
export function estObsolete(e: EtatBaseClinique, maintenant: Date = new Date()): boolean {
  if (e.obsolescence.alerte) return true;
  if (!e.derniereVeilleReussie) return false; // pas encore de veille : signalé autrement
  const d = new Date(e.derniereVeilleReussie);
  return maintenant.getTime() - d.getTime() > 62 * 24 * 3_600_000;
}
