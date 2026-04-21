import type { FormatDef } from '../types';

export const FORMATS: FormatDef[] = [
  {
    key: '35mm',
    label: '35mm',
    aspects: [
      { id: 'half', name: 'Half Frame', ratio: '3:4', aspect: 3 / 4, standardFL: 35 },
      { id: 'standard', name: 'Standard', ratio: '3:2', aspect: 3 / 2, standardFL: 50 },
      { id: 'square', name: 'Square', ratio: '1:1', aspect: 1, standardFL: 50 },
      { id: 'panoramic', name: 'Panoramic', ratio: '~2.7:1', aspect: 65 / 24, standardFL: 50 },
    ],
    focalLengths: [24, 28, 35, 50, 85, 105, 135, 200],
  },
  {
    key: '120',
    label: '120 Medium Format',
    aspects: [
      { id: '6x45', name: '6×4.5', ratio: '4:3', aspect: 4 / 3, standardFL: 75 },
      { id: '6x6', name: '6×6', ratio: '1:1', aspect: 1, standardFL: 80 },
      { id: '6x7', name: '6×7', ratio: '5:4', aspect: 7 / 6, standardFL: 90 },
      { id: '6x9', name: '6×9', ratio: '3:2', aspect: 3 / 2, standardFL: 105 },
      { id: '6x12', name: '6×12', ratio: '2:1', aspect: 2, standardFL: 105 },
      { id: '6x17', name: '6×17', ratio: '3:1', aspect: 3, standardFL: 105 },
    ],
    focalLengths: [40, 50, 65, 80, 90, 105, 115, 150, 180, 250],
  },
  {
    key: 'lf',
    label: 'Large Format',
    aspects: [
      { id: '4x5', name: '4×5', ratio: '5:4', aspect: 5 / 4, standardFL: 150 },
      { id: '5x7', name: '5×7', ratio: '7:5', aspect: 7 / 5, standardFL: 210 },
      { id: '8x10', name: '8×10', ratio: '5:4', aspect: 5 / 4, standardFL: 300 },
    ],
    focalLengths: [90, 135, 150, 180, 210, 240, 300, 360],
  },
  {
    key: 'instant',
    label: 'Instant Film',
    aspects: [
      { id: 'sx70', name: 'Polaroid SX-70', ratio: '1:1', aspect: 1, standardFL: 100 },
      { id: '600', name: 'Polaroid 600', ratio: '1:1', aspect: 1, standardFL: 100 },
      { id: 'spectra', name: 'Polaroid Spectra', ratio: '4:3', aspect: 4 / 3, standardFL: 100 },
      { id: 'instax-mini', name: 'Instax Mini', ratio: '4:3', aspect: 4 / 3, standardFL: 100 },
      { id: 'instax-sq', name: 'Instax Square', ratio: '1:1', aspect: 1, standardFL: 100 },
      { id: 'instax-wide', name: 'Instax Wide', ratio: '~1.6:1', aspect: 1.6, standardFL: 100 },
    ],
    focalLengths: [80, 100, 120, 150],
  },
];

export function findFormat(key: string) {
  return FORMATS.find((f) => f.key === key) ?? FORMATS[0];
}
