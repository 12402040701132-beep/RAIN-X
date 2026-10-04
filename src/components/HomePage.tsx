import React from 'react';
import {
  CloudRain,
  Compass,
  Layers,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  TrendingDown,
  Activity,
  Cpu,
  LogIn,
  History,
  DownloadCloud,
  FileCheck2
} from 'lucide-react';
import { UserSession } from '../types';

interface HomePageProps {
  onLaunchDashboard: () => void;
  onOpenSignIn: () => void;
  onNavigateToArchive: () => void;
  currentUser: UserSession;
}

export const HomePage: React.FC<HomePageProps> = ({
  onLaunchDashboard,
  onOpenSignIn,
  onNavigateToArchive,
  currentUser
}) => {
  return (
    <div className="min-h-screen bg-[#070f1e] text-slate-100 flex flex-col selection:bg-teal-500 selection:text-white">
      {/* Official Government Portal Navigation Bar */}
      <nav className="border-b border-slate-800 bg-[#0B192C]/90 backdrop-blur sticky top-0 z-40 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-sky-700 flex items-center justify-center shadow-lg shadow-teal-500/20 font-black text-white text-xl tracking-tighter border border-teal-300/30">
              RX
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-teal-400 via-sky-300 to-white bg-clip-text text-transparent">
                  RAIN-X
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                  MoES / NCMRWF
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                National Centre for Medium Range Weather Forecasting • Ministry of Earth Sciences, Govt. of India
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser.isLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenSignIn}
                  className="text-xs text-slate-300 hover:text-white bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg font-medium cursor-pointer"
                >
                  <span className="text-teal-400 font-bold">{currentUser.name}</span> ({currentUser.role.split(' ')[0]})
                </button>
                <button
                  onClick={onLaunchDashboard}
                  className="bg-gradient-to-r from-teal-500 to-sky-600 hover:from-teal-400 hover:to-sky-500 text-slate-950 font-bold px-4 py-1.5 rounded-lg text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Forecasting Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenSignIn}
                className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-md transition cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Forecaster Sign-In</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 px-6 bg-gradient-to-b from-[#0B192C] via-[#071324] to-[#070f1e] border-b border-slate-800">
        <div className="max-w-6xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-950/80 border border-teal-500/40 text-teal-300 text-xs font-semibold">
            <Activity className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
            <span>Operational Meteorological Intelligence Layer • Coupled to NCMRWF NEPS-G (12 km)</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Regime-Aware Post-Processing of <span className="bg-gradient-to-r from-teal-400 via-sky-300 to-teal-200 bg-clip-text text-transparent">Monsoon Rainfall</span> Forecasts
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            <i>"Don't correct rainfall blindly. Understand the atmosphere first."</i><br />
            RAIN-X replaces brittle, uniform bias-correction with an adaptive mixture of regime-specific experts, soft probability fusion, and calibrated tail risk estimation for district-level disaster management.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={onLaunchDashboard}
              className="bg-gradient-to-r from-teal-400 to-sky-500 hover:from-teal-300 hover:to-sky-400 text-slate-950 font-extrabold px-6 py-3 rounded-xl shadow-xl shadow-teal-500/20 text-sm transition transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
            >
              <span>Launch Operational Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onNavigateToArchive}
              className="bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-teal-500/50 text-slate-200 font-bold px-5 py-3 rounded-xl text-sm transition flex items-center gap-2 cursor-pointer"
            >
              <History className="w-4 h-4 text-amber-400" />
              <span>Explore Multi-Season Archive</span>
            </button>
          </div>

          {/* Quick Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto pt-8">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-2xl font-black text-teal-400">-47.4%</div>
              <div className="text-xs text-slate-400 mt-0.5">RMSE Reduction vs Raw NWP</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-2xl font-black text-sky-400">0.68</div>
              <div className="text-xs text-slate-400 mt-0.5">CSI Threat Score (vs 0.38 Raw)</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-2xl font-black text-emerald-400">0.082</div>
              <div className="text-xs text-slate-400 mt-0.5">Calibrated Brier Score</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-2xl font-black text-amber-400">100%</div>
              <div className="text-xs text-slate-400 mt-0.5">Offline Storage & PWA Ready</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Architectural Pillars Section */}
      <section className="py-14 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            The 4 Scientific Innovations of RAIN-X
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Engineered to overcome the fundamental failure modes of numerical weather models across India
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Pillar 1 */}
          <div className="bg-[#0B192C] border border-slate-800 hover:border-teal-500/50 rounded-2xl p-5 shadow-lg transition">
            <div className="w-10 h-10 rounded-xl bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400 mb-3">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">1. Weather Regime Engine</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Estimates soft probabilities for <b>Active</b>, <b>Break</b>, <b>Monsoon Low/Depression</b>, and <b>Western Disturbance</b> regimes using synoptic atmospheric predictors rather than brittle hard thresholds.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-[#0B192C] border border-slate-800 hover:border-teal-500/50 rounded-2xl p-5 shadow-lg transition">
            <div className="w-10 h-10 rounded-xl bg-teal-950 border border-teal-800 flex items-center justify-center text-teal-400 mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">2. Adaptive Soft Fusion</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Combines specialized LightGBM/GBDT experts softly: <span className="text-teal-300 font-mono text-[11px]">ŷ = ∑ P(Regime) × Expert</span>. Applies generic-model shrinkage for small-sample stability.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-[#0B192C] border border-slate-800 hover:border-teal-500/50 rounded-2xl p-5 shadow-lg transition">
            <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-800 flex items-center justify-center text-red-400 mb-3">
              <CloudRain className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">3. Calibrated Extreme Risk</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Separate probabilistic classifier for high-impact rainfall (<span className="text-white font-mono text-[11px]">≥64.5 mm/day</span>). Platt calibrated to produce reliable probabilities and accurate Brier scores.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="bg-[#0B192C] border border-slate-800 hover:border-teal-500/50 rounded-2xl p-5 shadow-lg transition">
            <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400 mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">4. Dynamic OOD Safety Fallback</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Monitors atmospheric Mahalanobis distance in real time. Unfamiliar synoptic anomalies safely fall back to the generic baseline with expanded uncertainty intervals.
            </p>
          </div>
        </div>
      </section>

      {/* Proof Ladder Summary */}
      <section className="py-10 px-6 bg-[#081322] border-y border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-xl font-bold text-white">
              The Scientific Baseline Proof Ladder
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every advanced claim is measured strictly on held-out unseen chronological seasons against Raw NWP, classical Quantile Mapping, and regime-blind Generic ML controls.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onLaunchDashboard}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-5 py-2.5 rounded-lg text-xs transition cursor-pointer shadow-md"
            >
              View Verification Metrics
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0B192C] text-slate-400 text-xs py-5 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="font-bold text-white">RAIN-X</span> | National Centre for Medium Range Weather Forecasting (NCMRWF)
            <span className="mx-2">•</span>
            Ministry of Earth Sciences, Govt. of India
          </div>
          <div className="text-[11px] text-slate-500">
            Operational Post-Processing System • A-50, Sector-62, Noida, Uttar Pradesh, India
          </div>
        </div>
      </footer>
    </div>
  );
};
