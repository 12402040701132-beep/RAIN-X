export type RegimeType = 'active' | 'break' | 'depression' | 'other';

export interface RegimeProbabilities {
  active: number;
  break: number;
  depression: number;
  other: number;
}

export interface HistoricalEvent {
  id: string;
  title: string;
  date: string;
  regime: string;
  dominantRegimeId: RegimeType;
  region: string;
  context: string;
  rawNwp: number;
  observed: number;
  quantileMapping: number;
  genericMl: number;
  rainX: number;
  heavyRainProbPct: number;
  p10: number;
  p50: number;
  p90: number;
  confidence: number;
  probabilities: RegimeProbabilities;
  status: 'PASS' | 'WARNING' | 'FALLBACK';
  oodDistance: number;
  narrative: string;
  synoptic: {
    mslp: number;
    wind850: number;
    rh700: number;
    tpw: number;
  };
}

export interface DistrictForecast {
  id: string;
  name: string;
  state: string;
  subdivision: string;
  clusterId: 'western_ghats' | 'odisha_bay' | 'gangetic_plain' | 'northeast' | 'northwest';
  x: number; // percentage on India map SVG (0 - 100)
  y: number; // percentage on India map SVG (0 - 100)
  rawNwp: number;
  rainX: number;
  observed: number;
  delta: number;
  heavyRainProb: number;
  dominantRegime: RegimeType;
  regimeConfidence: number;
  uncertaintyBand: number; // +/- mm
  alertCategory: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  status: 'PASS' | 'WARNING' | 'FALLBACK';
}

export interface VerificationRow {
  model: string;
  rmse: number;
  mae: number;
  bias: number;
  csi: number;
  pod: number;
  far: number;
  ets: number;
}

export interface ForecastQueryRecord {
  id: string;
  timestamp: string;
  districtId: string;
  districtName: string;
  state: string;
  leadTimeHr: number;
  rawNwp: number;
  predictedRainX: number;
  delta: number;
  heavyRainProbPct: number;
  dominantRegime: RegimeType;
  regimeConfidence: number;
  mslp: number;
  wind850: number;
  rh700: number;
  tpw: number;
  status: 'PASS' | 'WARNING' | 'FALLBACK';
  uncertaintyBand: number;
}

export interface UserSession {
  name: string;
  email: string;
  role: string;
  agency: string;
  isLoggedIn: boolean;
}

