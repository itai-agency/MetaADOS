export type AudienceType = 'DDO' | 'ADV' | 'CON SDR' | string;

export interface AdRow {
  metaId: string;
  anuncio: string;
  audiencia: AudienceType;
  ctr: number;
  cpm: number;
  leads: number;
  costoLead: number;
  inversion: number;
  calificados: number;
  tasaCali: number;
  costoLc: number | null;
  puntaje: number;
  hasSdr?: boolean;
}

export const MOCK_ADS: AdRow[] = [
  {
    metaId: '120239332252470008',
    anuncio: 'Ad01_msj_ddo - video - 07Feb26',
    audiencia: 'DDO',
    ctr: 1.84,
    cpm: 42.17,
    leads: 3,
    costoLead: 27.4,
    inversion: 1424.72,
    calificados: 2,
    tasaCali: 67,
    costoLc: 712.36,
    puntaje: 70,
    hasSdr: true,
  },
  {
    metaId: '120239332252510008',
    anuncio: 'Ad03_msj_adv - video - 07Feb26',
    audiencia: 'ADV',
    ctr: 0.51,
    cpm: 71.09,
    leads: 5,
    costoLead: 93.31,
    inversion: 1119.48,
    calificados: 3,
    tasaCali: 60,
    costoLc: 373.16,
    puntaje: 40,
    hasSdr: true,
  },
  {
    metaId: '120239330402170008',
    anuncio: 'Ad01_msj_adv - video - 07Feb26',
    audiencia: 'ADV',
    ctr: 1.59,
    cpm: 117.14,
    leads: 1,
    costoLead: 69.09,
    inversion: 345.44,
    calificados: 1,
    tasaCali: 100,
    costoLc: 345.44,
    puntaje: 70,
    hasSdr: true,
  },
  {
    metaId: '120239330402170009',
    anuncio: 'Ad01_msj_ddo - video - 07Feb26',
    audiencia: 'DDO',
    ctr: 1.23,
    cpm: 117.33,
    leads: 1,
    costoLead: 304.6,
    inversion: 304.6,
    calificados: 0,
    tasaCali: 0,
    costoLc: null,
    puntaje: 15,
  },
  {
    metaId: '120239330402130008',
    anuncio: 'Ad01_msj_adv - video - 07Feb26',
    audiencia: 'ADV',
    ctr: 0.26,
    cpm: 71.77,
    leads: 1,
    costoLead: 82.89,
    inversion: 82.89,
    calificados: 1,
    tasaCali: 100,
    costoLc: 82.89,
    puntaje: 70,
    hasSdr: true,
  },
  {
    metaId: '120239332252500008',
    anuncio: 'Ad01_msj_adv - video - 07Feb26',
    audiencia: 'ADV',
    ctr: 0.26,
    cpm: 71.77,
    leads: 1,
    costoLead: 82.89,
    inversion: 82.89,
    calificados: 0,
    tasaCali: 0,
    costoLc: null,
    puntaje: 30,
  },
];

export type TableFilter = string;
