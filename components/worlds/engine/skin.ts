/** Classes de cada mundo para o conteúdo dos capítulos (cada mundo tem a sua identidade). */
export type Skin = {
  /** Cartão que contém o capítulo. */
  panel: string;
  /** Linha acima do título (período, número do capítulo…). */
  kicker: string;
  title: string;
  /** Título grande do capítulo de abertura. */
  hero: string;
  sub: string;
  body: string;
  bullet: string;
  marker: string;
  markerChar: string;
  tag: string;
  link: string;
  button: string;
  barTrack: string;
  barFill: string;
  divider: string;
};
