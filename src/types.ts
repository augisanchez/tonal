export type ZoneValue = number | 'clip';

export type FilmCategory =
  | 'negative-color'
  | 'black-white'
  | 'cinema'
  | 'instant'
  | 'digital';

export interface FilmStock {
  id: string;
  category: FilmCategory;
  manufacturer: string;
  film: string;
  ei: number;
  totalDR: number;
  shadowDR: number;
  highlightDR: number;
  minZone: number;
  maxZone: number;
  expComp: Record<-3 | -2 | -1 | 0 | 1 | 2 | 3, ZoneValue>;
}

export type FormatKey = '35mm' | '120' | 'lf' | 'instant';

export interface AspectOption {
  id: string;
  name: string;
  ratio: string;
  aspect: number;
  standardFL: number;
}

export interface FormatDef {
  key: FormatKey;
  label: string;
  aspects: AspectOption[];
  focalLengths: number[];
}

export interface ZoneMarker {
  zone: number;
  label: string;
  x: number;
  y: number;
  isClipping: boolean;
  isActive: boolean;
}
