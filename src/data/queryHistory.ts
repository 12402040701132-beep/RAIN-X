import { ForecastQueryRecord } from '../types';

export const INITIAL_QUERY_HISTORY: ForecastQueryRecord[] = [
  {
    id: 'query_101',
    timestamp: '2026-07-14 06:00 UTC',
    districtId: 'dist_mumbai',
    districtName: 'Mumbai Suburban',
    state: 'Maharashtra',
    leadTimeHr: 24,
    rawNwp: 52.0,
    predictedRainX: 86.5,
    delta: 34.5,
    heavyRainProbPct: 82.4,
    dominantRegime: 'active',
    regimeConfidence: 0.85,
    mslp: 998.2,
    wind850: 16.4,
    rh700: 92.0,
    tpw: 62.0,
    status: 'PASS',
    uncertaintyBand: 14.2
  },
  {
    id: 'query_102',
    timestamp: '2026-07-14 05:30 UTC',
    districtId: 'dist_cuttack',
    districtName: 'Cuttack',
    state: 'Odisha',
    leadTimeHr: 48,
    rawNwp: 34.0,
    predictedRainX: 78.2,
    delta: 44.2,
    heavyRainProbPct: 74.8,
    dominantRegime: 'depression',
    regimeConfidence: 0.92,
    mslp: 992.0,
    wind850: 21.0,
    rh700: 96.0,
    tpw: 68.0,
    status: 'PASS',
    uncertaintyBand: 12.0
  },
  {
    id: 'query_103',
    timestamp: '2026-07-14 04:45 UTC',
    districtId: 'dist_nagpur',
    districtName: 'Nagpur',
    state: 'Maharashtra',
    leadTimeHr: 24,
    rawNwp: 14.0,
    predictedRainX: 3.2,
    delta: -10.8,
    heavyRainProbPct: 1.5,
    dominantRegime: 'break',
    regimeConfidence: 0.89,
    mslp: 1008.5,
    wind850: 5.2,
    rh700: 58.0,
    tpw: 39.0,
    status: 'PASS',
    uncertaintyBand: 2.1
  },
  {
    id: 'query_104',
    timestamp: '2026-07-14 03:15 UTC',
    districtId: 'dist_wayanad',
    districtName: 'Wayanad',
    state: 'Kerala',
    leadTimeHr: 24,
    rawNwp: 64.0,
    predictedRainX: 118.0,
    delta: 54.0,
    heavyRainProbPct: 93.6,
    dominantRegime: 'active',
    regimeConfidence: 0.88,
    mslp: 1000.4,
    wind850: 18.2,
    rh700: 95.0,
    tpw: 64.0,
    status: 'PASS',
    uncertaintyBand: 18.5
  },
  {
    id: 'query_105',
    timestamp: '2026-07-14 01:20 UTC',
    districtId: 'dist_kutch',
    districtName: 'Kutch',
    state: 'Gujarat',
    leadTimeHr: 72,
    rawNwp: 72.0,
    predictedRainX: 82.5,
    delta: 10.5,
    heavyRainProbPct: 76.5,
    dominantRegime: 'other',
    regimeConfidence: 0.38,
    mslp: 988.0,
    wind850: 26.0,
    rh700: 72.0,
    tpw: 52.0,
    status: 'FALLBACK',
    uncertaintyBand: 24.0
  }
];

export const getStoredQueryHistory = (): ForecastQueryRecord[] => {
  try {
    const raw = localStorage.getItem('rainx_query_history');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to parse query history from localStorage:', e);
  }
  return INITIAL_QUERY_HISTORY;
};

export const saveQueryRecord = (record: ForecastQueryRecord): ForecastQueryRecord[] => {
  const current = getStoredQueryHistory();
  const updated = [record, ...current.filter(q => q.id !== record.id)].slice(0, 20);
  try {
    localStorage.setItem('rainx_query_history', JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save query history:', e);
  }
  return updated;
};
