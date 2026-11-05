import type { Regle } from '../../engine/decider';
import { REGLES_TRANSVERSALES } from './transversales';
import { REGLES_BGN } from './bgn-urinaire';
import { REGLES_CGP } from './cocci-gram-positif';
import { REGLES_FOYERS } from './foyers-materiel';
import { REGLES_INDICATION } from './indication';

/** Base de règles versionnée avec la version clinique (src/clinical/etat-base.json). */
export const REGLES: Regle[] = [...REGLES_TRANSVERSALES, ...REGLES_INDICATION, ...REGLES_BGN, ...REGLES_CGP, ...REGLES_FOYERS];
