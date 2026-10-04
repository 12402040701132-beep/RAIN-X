import React, { useState } from 'react';
import { ListOrdered, ArrowRight, Play, Download, Trash2, CheckCircle2, AlertTriangle, Filter, Sparkles } from 'lucide-react';
import { ForecastQueryRecord, RegimeType } from '../types';

interface QueryHistoryViewProps {
  queries: ForecastQueryRecord[];
  onSelectQuery: (query: ForecastQueryRecord) => void;
  onRunCustomQuery: (custom: Omit<ForecastQueryRecord, 'id' | 'timestamp' | 'predictedRainX' | 'delta' | 'heavyRainProbPct' | 'dominantRegime' | 'regimeConfidence' | 'status' | 'uncertaintyBand'>) => void;
}

export const QueryHistoryView: React.FC<QueryHistoryViewProps> = ({
  queries,
  onSelectQuery,
  onRunCustomQuery
}) => {
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PASS' | 'FALLBACK'>('ALL');
  const [customDistrict, setCustomDistrict] = useState('Mumbai Suburban');
  const [customLeadTime, setCustomLeadTime] = useState(24);
  const [customRawNwp, setCustomRawNwp] = useState(55.0);
  const [customMslp, setCustomMslp] = useState(997.5);
  const [customWind850, setCustomWind850] = useState(17.5);
  const [customRh700, setCustomRh700] = useState(92.0);
  const [customTpw, setCustomTpw] = useState(62.0);
  const [customMessage, setCustomMessage] = useState<string | null>(null);

  const filteredQueries = queries.filter(q => {
    if (filterStatus === 'ALL') return true;
    return q.status === filterStatus;
  });

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRunCustomQuery({
      districtId: 'dist_' + customDistrict.toLowerCase().replace(/[^a-z]/g, ''),
      districtName: customDistrict,
      state: 'Regional Division',
      leadTimeHr: customLeadTime,
      rawNwp: customRawNwp,
      mslp: customMslp,
      wind850: customWind850,
      rh700: customRh700,
      tpw: customTpw
    });
    setCustomMessage(`Custom query executed for ${customDistrict} (+${customLeadTime}h)! Added to history.`);
    setTimeout(() => setCustomMessage(null), 3500);
  };

  const exportHistoryCsv = () => {
    const headers = "ID,Timestamp,District,LeadTime_h,Raw_NWP_mm,RAINX_mm,Delta_mm,P_Heavy_Pct,Regime,Confidence,Status\n";
    const rows = queries.map(q =>
      `"${q.id}","${q.timestamp}","${q.districtName}",${q.leadTimeHr},${q.rawNwp},${q.predictedRainX},${q.delta},${q.heavyRainProbPct},"${q.dominantRegime}",${q.regimeConfidence},"${q.status}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `RAINX_Query_History_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-[#0B192C] border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-teal-400" />
              Recent Forecast Queries & Parameter Testing History
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review previously tested atmospheric parameter configurations and 1-click restore them to the operational dashboard
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded-lg p-1 text-xs">
              <span className="text-[11px] text-slate-400 px-1">Filter:</span>
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-2 py-0.5 rounded font-semibold transition cursor-pointer ${
                  filterStatus === 'ALL' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                All ({queries.length})
              </button>
              <button
                onClick={() => setFilterStatus('PASS')}
                className={`px-2 py-0.5 rounded font-semibold transition cursor-pointer ${
                  filterStatus === 'PASS' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                PASS
              </button>
              <button
                onClick={() => setFilterStatus('FALLBACK')}
                className={`px-2 py-0.5 rounded font-semibold transition cursor-pointer ${
                  filterStatus === 'FALLBACK' ? 'bg-red-600 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                FALLBACK
              </button>
            </div>

            <button
              onClick={exportHistoryCsv}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-teal-300 font-medium transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export History
            </button>
          </div>
        </div>

        {/* Custom Query Sandbox Form */}
        <div className="mt-5 p-4 rounded-xl bg-[#081322] border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-sm text-teal-300 flex items-center gap-1.5">
              <Play className="w-4 h-4 text-teal-400" />
              Test New Custom Parameter Set (Ad-hoc Inference)
            </h3>
            <span className="text-[11px] text-slate-400">Appends result directly into history</span>
          </div>

          <form onSubmit={handleCustomSubmit} className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 text-xs mt-3">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">District / Station</label>
              <input
                type="text"
                value={customDistrict}
                onChange={(e) => setCustomDistrict(e.target.value)}
                className="w-full bg-[#071324] border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-teal-400 text-xs"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Lead Time (hr)</label>
              <select
                value={customLeadTime}
                onChange={(e) => setCustomLeadTime(Number(e.target.value))}
                className="w-full bg-[#071324] border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-teal-400 text-xs"
              >
                <option value={24}>+24h (Day 1)</option>
                <option value={48}>+48h (Day 2)</option>
                <option value={72}>+72h (Day 3)</option>
                <option value={96}>+96h (Day 4)</option>
                <option value={120}>+120h (Day 5)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Raw NWP Rain (mm)</label>
              <input
                type="number"
                step="0.5"
                value={customRawNwp}
                onChange={(e) => setCustomRawNwp(Number(e.target.value))}
                className="w-full bg-[#071324] border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-teal-400 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">MSLP (hPa)</label>
              <input
                type="number"
                step="0.5"
                value={customMslp}
                onChange={(e) => setCustomMslp(Number(e.target.value))}
                className="w-full bg-[#071324] border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-teal-400 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">850hPa Wind (m/s)</label>
              <input
                type="number"
                step="0.5"
                value={customWind850}
                onChange={(e) => setCustomWind850(Number(e.target.value))}
                className="w-full bg-[#071324] border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-teal-400 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">700hPa RH (%)</label>
              <input
                type="number"
                step="1"
                value={customRh700}
                onChange={(e) => setCustomRh700(Number(e.target.value))}
                className="w-full bg-[#071324] border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-teal-400 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">TPW (kg/m²)</label>
              <input
                type="number"
                step="1"
                value={customTpw}
                onChange={(e) => setCustomTpw(Number(e.target.value))}
                className="w-full bg-[#071324] border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-teal-400 text-xs font-mono"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-500 to-sky-600 hover:from-teal-400 hover:to-sky-500 text-slate-950 font-bold py-1.5 px-3 rounded text-xs shadow-md transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Run
              </button>
            </div>
          </form>

          {customMessage && (
            <div className="mt-2 text-[11px] text-emerald-300 font-semibold flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {customMessage}
            </div>
          )}
        </div>

        {/* Query History List Table */}
        <div className="mt-6 overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900 text-slate-300 text-[11px] uppercase tracking-wider sticky top-0">
              <tr>
                <th className="p-3">Query ID & Timestamp</th>
                <th className="p-3">District / Station</th>
                <th className="p-3 text-center">Lead Time</th>
                <th className="p-3 text-right">Raw NWP</th>
                <th className="p-3 text-right text-teal-400 font-bold">RAIN-X Pred</th>
                <th className="p-3 text-right">NWP Bias Δ</th>
                <th className="p-3 text-right">P(≥64.5mm)</th>
                <th className="p-3 text-center">Regime</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredQueries.map((q) => (
                <tr key={q.id} className="hover:bg-slate-800/40 text-slate-300 transition">
                  <td className="p-3 font-mono text-[11px]">
                    <div className="font-bold text-white">{q.id}</div>
                    <div className="text-[10px] text-slate-500">{q.timestamp}</div>
                  </td>
                  <td className="p-3 font-semibold text-white">
                    {q.districtName}
                    <div className="text-[10px] text-slate-400 font-normal">{q.state}</div>
                  </td>
                  <td className="p-3 text-center font-mono">+{q.leadTimeHr}h</td>
                  <td className="p-3 text-right font-mono text-slate-400">{q.rawNwp} mm</td>
                  <td className="p-3 text-right font-mono font-bold text-teal-300 text-sm">{q.predictedRainX} mm</td>
                  <td className={`p-3 text-right font-mono font-semibold ${q.delta > 0 ? 'text-teal-400' : 'text-amber-400'}`}>
                    {q.delta > 0 ? '+' : ''}{q.delta} mm
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-amber-300">{q.heavyRainProbPct}%</td>
                  <td className="p-3 text-center">
                    <span className="uppercase font-bold text-[10px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                      {q.dominantRegime}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`inline-block font-bold text-[10px] px-2 py-0.5 rounded border ${
                      q.status === 'FALLBACK'
                        ? 'bg-red-950 text-red-300 border-red-800'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    }`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => onSelectQuery(q)}
                      className="px-2.5 py-1 rounded bg-teal-600/30 hover:bg-teal-500 hover:text-slate-950 text-teal-300 border border-teal-500/50 font-bold text-[11px] transition flex items-center gap-1 mx-auto cursor-pointer"
                      title="Load parameter set into active dashboard"
                    >
                      <span>Restore</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
