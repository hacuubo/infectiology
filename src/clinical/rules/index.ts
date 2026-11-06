import type { Regle } from '../../engine/decider';
import { REGLES_TRANSVERSALES } from './transversales';
import { REGLES_BGN } from './bgn-urinaire';
import { REGLES_CGP } from './cocci-gram-positif';
import { REGLES_FOYERS } from './foyers-materiel';
import { REGLES_INDICATION } from './indication';
import { REGLES_CYSTITE } from './cystite';
import { REGLES_CDIFF } from './clostridioides-difficile';
import { REGLES_MENINGITES } from './meningites';
import { REGLES_INTRA_ABDOMINAL } from './intra-abdominal';
import { REGLES_PEAU } from './peau-tissus-mous';
import { REGLES_PNEUMONIES } from './pneumonies';

/** Base de règles versionnée avec la version clinique (src/clinical/etat-base.json). */
export const REGLES: Regle[] = [...REGLES_TRANSVERSALES, ...REGLES_INDICATION, ...REGLES_CYSTITE, ...REGLES_CDIFF, ...REGLES_MENINGITES, ...REGLES_INTRA_ABDOMINAL, ...REGLES_PNEUMONIES, ...REGLES_PEAU, ...REGLES_BGN, ...REGLES_CGP, ...REGLES_FOYERS];
