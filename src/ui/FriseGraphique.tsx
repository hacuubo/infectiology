import type { OptionTherapeutique } from '../clinical/types';
import type { EvenementFriseDetaille } from '../schedule/frise';

/**
 * Frise graphique du traitement (jours de traitement en abscisse) : durée prévue de chaque molécule
 * et repères numérotés du calendrier. Seuls les événements dont le moment est placé sans
 * approximation (`position`) y figurent ; le tableau du calendrier, juste en dessous, reste la
 * référence complète et porte les mêmes numéros.
 */

/** Numéro de repère de chaque événement placé sur la frise (dans l'ordre du calendrier). */
export function numerosReperes(frise: EvenementFriseDetaille[]): Map<string, number> {
  const m = new Map<string, number>();
  let n = 0;
  for (const e of frise) if (e.position !== undefined) m.set(e.id, ++n);
  return m;
}

interface Repere {
  pct: number;
  numeros: number[];
  type: EvenementFriseDetaille['type'];
}

const pct = (heures: number, jours: number) => Math.min(100, Math.max(0, (heures / (jours * 24)) * 100));

export function FriseGraphique({ frise, option }: { frise: EvenementFriseDetaille[]; option?: OptionTherapeutique }) {
  const numeros = numerosReperes(frise);
  const places = frise.filter((e) => e.position !== undefined);
  const prescriptions = option?.prescriptions ?? [];
  const durees = prescriptions.map((p) => p.duree.dureePrevueJours).filter((d): d is number => d !== undefined && d > 0);
  if (places.length === 0 && durees.length === 0) return null;

  const derniere = Math.max(0, ...places.map((e) => e.position!));
  const jours = Math.max(3, ...durees, Math.ceil((derniere + 1) / 24));
  // Graduations lisibles sur téléphone : chaque jour jusqu'à une semaine, un jour sur deux jusqu'à deux semaines, puis chaque semaine.
  const pas = jours <= 7 ? 1 : jours <= 14 ? 2 : 7;
  const graduations: number[] = [];
  for (let j = 1; j <= jours; j += pas) graduations.push(j);

  // Repères proches regroupés (moins de 2,5 % d'écart) pour ne pas se chevaucher.
  const reperes: Repere[] = [];
  for (const e of places) {
    const p = pct(e.position!, jours);
    const proche = reperes.find((r) => Math.abs(r.pct - p) < 2.5);
    if (proche) proche.numeros.push(numeros.get(e.id)!);
    else reperes.push({ pct: p, numeros: [numeros.get(e.id)!], type: e.type });
  }

  const resume = [
    ...prescriptions.map((p) => `${p.dci} : ${p.duree.dureePrevueJours ? `${p.duree.dureePrevueJours} jours prévus` : 'durée non précisée'}`),
    places.length ? `${places.length} repère${places.length > 1 ? 's' : ''} numéroté${places.length > 1 ? 's' : ''}, détaillé${places.length > 1 ? 's' : ''} dans le tableau ci-dessous` : '',
  ]
    .filter(Boolean)
    .join(' ; ');

  return (
    <figure className="frise-graphique">
      <figcaption>
        Frise du traitement <span className="aide">(J1 = jour de la 1re dose)</span>
      </figcaption>
      <p className="sr-only">{resume}.</p>
      <div className="fg-grille" aria-hidden="true" style={{ ['--fg-jours' as string]: jours }}>
        <div className="fg-ligne">
          <span />
          <div className="fg-piste fg-axe">
            {graduations.map((j) => (
              <span key={j} style={{ left: `${((j - 1) / jours) * 100}%`, width: `${(Math.min(pas, jours - j + 1) / jours) * 100}%` }}>
                J{j}
              </span>
            ))}
          </div>
        </div>
        {prescriptions.map((p) => (
          <div className="fg-ligne" key={p.regimenId}>
            <span className="fg-libelle">
              {p.dci} <small>{p.voie}</small>
            </span>
            <div className="fg-piste fg-quadrillage">
              {p.duree.dureePrevueJours ? (
                <i className="fg-barre" style={{ width: `${pct(p.duree.dureePrevueJours * 24, jours)}%` }}>
                  <span>{p.duree.dureePrevueJours} j</span>
                </i>
              ) : (
                <span className="fg-sans-duree">durée non précisée : voir la fiche</span>
              )}
            </div>
          </div>
        ))}
        {reperes.length > 0 && (
          <div className="fg-ligne">
            <span className="fg-libelle">Repères</span>
            <div className="fg-piste">
              {reperes.map((r) => (
                <i key={r.numeros.join('-')} className={`fg-repere fg-${r.type}`} style={{ left: `${r.pct}%` }}>
                  {r.numeros.join(',')}
                </i>
              ))}
            </div>
          </div>
        )}
      </div>
    </figure>
  );
}
