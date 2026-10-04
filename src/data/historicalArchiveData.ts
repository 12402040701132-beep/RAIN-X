export interface HistoricalSeasonTrend {
  year: number;
  season: string;
  rawNwpRmse: number;
  quantileMappingRmse: number;
  genericMlRmse: number;
  rainXRmse: number;
  rawNwpCsi: number;
  rainXCsi: number;
  activeEventsCount: number;
  extremeDelugeCount: number;
  highlightEvent: string;
  description: string;
}

export interface MonsoonArchiveEvent {
  id: string;
  year: number;
  date: string;
  title: string;
  region: string;
  state: string;
  regime: 'active' | 'break' | 'depression' | 'other';
  regimeName: string;
  observedRainMm: number;
  rawNwpMm: number;
  rainXMm: number;
  heavyRainProbPct: number;
  csiScore: number;
  rmseReductionPct: string;
  impactSummary: string;
  synopticNotes: string;
}

export const HISTORICAL_SEASON_TRENDS: HistoricalSeasonTrend[] = [
  {
    year: 2018,
    season: 'JJAS 2018',
    rawNwpRmse: 22.8,
    quantileMappingRmse: 18.5,
    genericMlRmse: 15.9,
    rainXRmse: 12.1,
    rawNwpCsi: 0.34,
    rainXCsi: 0.61,
    activeEventsCount: 14,
    extremeDelugeCount: 8,
    highlightEvent: 'Kerala Floods (Aug 2018)',
    description: 'Vigorous active monsoon surge with heavy orographic convergence along Idukki & Wayanad peaks.'
  },
  {
    year: 2019,
    season: 'JJAS 2019',
    rawNwpRmse: 21.4,
    quantileMappingRmse: 17.6,
    genericMlRmse: 15.2,
    rainXRmse: 11.5,
    rawNwpCsi: 0.36,
    rainXCsi: 0.63,
    activeEventsCount: 16,
    extremeDelugeCount: 10,
    highlightEvent: 'Maharashtra & Vadodara Extreme Deluge',
    description: 'Record above-normal monsoon season; prolonged Active spell over Western India with severe urban flooding.'
  },
  {
    year: 2020,
    season: 'JJAS 2020',
    rawNwpRmse: 20.6,
    quantileMappingRmse: 16.9,
    genericMlRmse: 14.5,
    rainXRmse: 10.9,
    rawNwpCsi: 0.37,
    rainXCsi: 0.65,
    activeEventsCount: 13,
    extremeDelugeCount: 7,
    highlightEvent: 'Hyderabad Urban Cloudburst & Bay Vortex',
    description: 'Consecutive low-pressure systems formed over west-central Bay of Bengal moving across Telangana.'
  },
  {
    year: 2021,
    season: 'JJAS 2021',
    rawNwpRmse: 20.1,
    quantileMappingRmse: 16.5,
    genericMlRmse: 14.1,
    rainXRmse: 10.6,
    rawNwpCsi: 0.38,
    rainXCsi: 0.66,
    activeEventsCount: 12,
    extremeDelugeCount: 6,
    highlightEvent: 'Chiplun / Konkan Flash Floods & Aug Break',
    description: 'Sharp contrast: extreme orographic rain in July followed by a severe 3-week break spell in August.'
  },
  {
    year: 2022,
    season: 'JJAS 2022',
    rawNwpRmse: 19.8,
    quantileMappingRmse: 16.2,
    genericMlRmse: 13.9,
    rainXRmse: 10.4,
    rawNwpCsi: 0.39,
    rainXCsi: 0.67,
    activeEventsCount: 15,
    extremeDelugeCount: 9,
    highlightEvent: 'Odisha Deep Depression Sequence',
    description: 'Successive deep depressions crossed Chandbali coast, producing heavy precipitation across Mahanadi basin.'
  },
  {
    year: 2023,
    season: 'JJAS 2023',
    rawNwpRmse: 19.4,
    quantileMappingRmse: 16.1,
    genericMlRmse: 13.8,
    rainXRmse: 10.2,
    rawNwpCsi: 0.38,
    rainXCsi: 0.68,
    activeEventsCount: 14,
    extremeDelugeCount: 8,
    highlightEvent: 'North-West Deluge & Himachal Landslides',
    description: 'Interaction of active monsoon trough with mid-latitude Western Disturbance over Delhi and Himachal Pradesh.'
  },
  {
    year: 2024,
    season: 'JJAS 2024',
    rawNwpRmse: 18.9,
    quantileMappingRmse: 15.6,
    genericMlRmse: 13.4,
    rainXRmse: 9.8,
    rawNwpCsi: 0.40,
    rainXCsi: 0.70,
    activeEventsCount: 17,
    extremeDelugeCount: 9,
    highlightEvent: 'Wayanad Meppadi Catastrophic Rain',
    description: 'Continuous extreme orographic rainfall exceeding 140 mm in 24h triggered major landslides in Western Ghats.'
  },
  {
    year: 2025,
    season: 'JJAS 2025',
    rawNwpRmse: 18.5,
    quantileMappingRmse: 15.2,
    genericMlRmse: 13.0,
    rainXRmse: 9.5,
    rawNwpCsi: 0.41,
    rainXCsi: 0.72,
    activeEventsCount: 15,
    extremeDelugeCount: 8,
    highlightEvent: 'Central Zone Quasi-Stationary Trough',
    description: 'Prolonged active trough across Narmada & Tapi valleys with high moisture convergence from both Arabian Sea & Bay.'
  },
  {
    year: 2026,
    season: 'JJAS 2026 (Operational Target)',
    rawNwpRmse: 18.1,
    quantileMappingRmse: 14.8,
    genericMlRmse: 12.6,
    rainXRmse: 9.1,
    rawNwpCsi: 0.42,
    rainXCsi: 0.74,
    activeEventsCount: 16,
    extremeDelugeCount: 7,
    highlightEvent: 'NCMRWF Operational Benchmark Validation Run',
    description: 'Current operational deployment candidate: Soft regime fusion + calibrated extreme probability deployed for MoES / NCMRWF.'
  }
];

export const ARCHIVE_SIGNIFICANT_EVENTS: MonsoonArchiveEvent[] = [
  {
    id: 'arch_2018_kerala',
    year: 2018,
    date: '2018-08-16',
    title: 'Kerala Extreme Monsoon Deluge',
    region: 'Idukki & Wayanad',
    state: 'Kerala',
    regime: 'active',
    regimeName: 'Active Monsoon (Orographic Surge)',
    observedRainMm: 168.0,
    rawNwpMm: 82.0,
    rainXMm: 154.0,
    heavyRainProbPct: 96.2,
    csiScore: 0.76,
    rmseReductionPct: '-48.2%',
    impactSummary: 'NWP missed more than 50% of the rainfall accumulation due to unresolved steep orography. RAIN-X orographic modifier restored accurate volume.',
    synopticNotes: 'Strong low-level westerly jet (u850 = 22 m/s) with 95% relative humidity impinging on high Western Ghats crest.'
  },
  {
    id: 'arch_2019_mumbai',
    year: 2019,
    date: '2019-07-02',
    title: 'Mumbai & Konkan Flash Rainstorm',
    region: 'Mumbai Suburban / Thane',
    state: 'Maharashtra',
    regime: 'active',
    regimeName: 'Active Monsoon (Offshore Trough)',
    observedRainMm: 215.0,
    rawNwpMm: 95.0,
    rainXMm: 198.0,
    heavyRainProbPct: 98.4,
    csiScore: 0.81,
    rmseReductionPct: '-51.5%',
    impactSummary: 'Offshore vortex generated convective line training. RAIN-X heavy-rain calibrated model issued an unambiguous Red Alert 36 hours ahead.',
    synopticNotes: 'Offshore trough from south Gujarat to north Kerala coast with severe mid-level vorticity and total precipitable water > 65 kg/m².'
  },
  {
    id: 'arch_2021_chiplun',
    year: 2021,
    date: '2021-07-22',
    title: 'Chiplun & Mahad River Basin Inundation',
    region: 'Ratnagiri & Raigad',
    state: 'Maharashtra',
    regime: 'active',
    regimeName: 'Active Monsoon (Synoptic Surge)',
    observedRainMm: 242.0,
    rawNwpMm: 110.0,
    rainXMm: 224.0,
    heavyRainProbPct: 99.1,
    csiScore: 0.84,
    rmseReductionPct: '-54.0%',
    impactSummary: 'Vashishti river reached record levels in 6 hours. RAIN-X post-processing provided 24-hour advance probability of extreme rainfall exceedance.',
    synopticNotes: 'Synoptic shear zone across 18°N with deep vertical velocity (-0.4 Pa/s at 500 hPa).'
  },
  {
    id: 'arch_2022_cuttack',
    year: 2022,
    date: '2022-08-19',
    title: 'Deep Depression BOB 03 Inundation',
    region: 'Cuttack, Kendrapara, Balasore',
    state: 'Odisha',
    regime: 'depression',
    regimeName: 'Monsoon Depression',
    observedRainMm: 138.0,
    rawNwpMm: 41.0,
    rainXMm: 126.0,
    heavyRainProbPct: 94.2,
    csiScore: 0.73,
    rmseReductionPct: '-44.5%',
    impactSummary: 'Raw NWP track had 150 km westward displacement error. Soft fusion blended Depression expert to capture rainfall core over coastal districts.',
    synopticNotes: 'MSLP reached 992.0 hPa; cyclonic wind speeds exceeded 21 m/s at 850 hPa.'
  },
  {
    id: 'arch_2023_himachal',
    year: 2023,
    date: '2023-07-09',
    title: 'Himachal Pradesh & Delhi Yamuna Surge',
    region: 'Kullu, Mandi, New Delhi',
    state: 'Himachal Pradesh & NCR',
    regime: 'other',
    regimeName: 'Monsoon Trough + Western Disturbance Interaction',
    observedRainMm: 152.0,
    rawNwpMm: 68.0,
    rainXMm: 142.0,
    heavyRainProbPct: 92.5,
    csiScore: 0.75,
    rmseReductionPct: '-42.0%',
    impactSummary: 'Rare interaction between tropical monsoon and extra-tropical upper tropospheric trough. RAIN-X correctly scaled precipitation up from raw NWP.',
    synopticNotes: 'Trough in westerlies in mid & upper tropospheric levels interacting with Arabian Sea moisture flux.'
  },
  {
    id: 'arch_2024_wayanad',
    year: 2024,
    date: '2024-07-30',
    title: 'Wayanad Meppadi Hill Cloudburst',
    region: 'Meppadi & Chooralmala',
    state: 'Kerala',
    regime: 'active',
    regimeName: 'Vigorous Active Monsoon + Orographic Blocking',
    observedRainMm: 185.0,
    rawNwpMm: 74.0,
    rainXMm: 168.0,
    heavyRainProbPct: 97.8,
    csiScore: 0.82,
    rmseReductionPct: '-53.2%',
    impactSummary: 'Consecutive 48-hour torrential rain saturated soil. RAIN-X quantified extreme tail risk P90 at 195 mm.',
    synopticNotes: 'Strong low-level convergence line locked against mountain ridge with saturated tropospheric column (RH > 96%).'
  }
];
