import registre from './registre.json';
import type { Source, SourceRef } from '../types';

export const SOURCES: Source[] = registre as Source[];
export const SOURCES_PAR_ID: Record<string, Source> = Object.fromEntries(SOURCES.map((s) => [s.id, s]));

/** Raccourci pour écrire une référence précise. */
export function ref(source: string, repere?: string, extrait?: string, justifie?: SourceRef['justifie'], ancre?: string): SourceRef {
  return { source, repere, extrait, justifie, ancre };
}
