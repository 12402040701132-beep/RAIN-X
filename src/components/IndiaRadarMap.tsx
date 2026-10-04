import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, MapPin, Layers, Info, Navigation2, CheckCircle2, Waves, Wind } from 'lucide-react';
import { DistrictForecast, RegimeType } from '../types';

interface IndiaRadarMapProps {
  districts: DistrictForecast[];
  selectedDistrictId: string;
  onSelectDistrict: (districtId: string) => void;
  activeLayer: 'rainx' | 'raw' | 'delta' | 'prob';
  onChangeLayer: (layer: 'rainx' | 'raw' | 'delta' | 'prob') => void;
  activeClusterId: string;
  onSelectCluster: (clusterId: string) => void;
}

export interface RegionalCluster {
  id: string;
  name: string;
  subdivision: string;
  viewBox: string;
}

export const REGIONAL_CLUSTERS: RegionalCluster[] = [
  { id: 'all', name: 'All India', subdivision: 'National Overview', viewBox: '0 0 400 450' },
  { id: 'western_ghats', name: 'Western Ghats / Konkan', subdivision: 'Maharashtra & Kerala Coast', viewBox: '50 190 190 200' },
  { id: 'odisha_bay', name: 'Odisha & Bay Coast', subdivision: 'Bay of Bengal Cyclonic Belt', viewBox: '190 150 190 180' },
  { id: 'gangetic_plain', name: 'Gangetic Plains / Central', subdivision: 'Bihar, MP & Vidarbha', viewBox: '160 90 200 180' },
  { id: 'northeast', name: 'Northeast Region', subdivision: 'Assam & Meghalaya Hills', viewBox: '250 90 150 150' },
  { id: 'northwest', name: 'Northwest & Kutch', subdivision: 'Gujarat & Western Arid', viewBox: '30 110 180 180' }
];

export const IndiaRadarMap: React.FC<IndiaRadarMapProps> = ({
  districts,
  selectedDistrictId,
  onSelectDistrict,
  activeLayer,
  onChangeLayer,
  activeClusterId,
  onSelectCluster
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredDistrict, setHoveredDistrict] = useState<{
    district: DistrictForecast;
    screenX: number;
    screenY: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Viewbox computation with smooth animated viewBox transition
  const currentViewBox = React.useMemo(() => {
    const cluster = REGIONAL_CLUSTERS.find(c => c.id === activeClusterId);
    if (cluster && activeClusterId !== 'all') {
      return cluster.viewBox;
    }
    const baseW = 400 / zoomLevel;
    const baseH = 450 / zoomLevel;
    const cx = 200 + panOffset.x;
    const cy = 225 + panOffset.y;
    const minX = Math.max(-50, cx - baseW / 2);
    const minY = Math.max(-50, cy - baseH / 2);
    return `${minX} ${minY} ${baseW} ${baseH}`;
  }, [activeClusterId, zoomLevel, panOffset]);

  const handleZoomIn = () => {
    onSelectCluster('all');
    setZoomLevel(prev => Math.min(prev + 0.4, 3.2));
  };

  const handleZoomOut = () => {
    onSelectCluster('all');
    setZoomLevel(prev => Math.max(prev - 0.4, 1.0));
  };

  const handleResetZoom = () => {
    onSelectCluster('all');
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Drill down when clicking a pin: selects district AND zooms into cluster
  const handlePinClick = (district: DistrictForecast) => {
    onSelectDistrict(district.id);
    if (district.clusterId) {
      onSelectCluster(district.clusterId);
    }
  };

  const handlePointerUpdate = (d: DistrictForecast, e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setHoveredDistrict({
        district: d,
        screenX: e.clientX - rect.left,
        screenY: e.clientY - rect.top
      });
    }
  };

  // Dynamic tooltip positioning clamped safely to container dimensions
  const containerWidth = containerRef.current?.clientWidth || 450;
  const isNearTop = hoveredDistrict ? hoveredDistrict.screenY < 130 : false;
  const clampedX = hoveredDistrict ? Math.min(Math.max(hoveredDistrict.screenX, 115), Math.max(containerWidth - 115, 160)) : 0;
  const tooltipY = hoveredDistrict ? (isNearTop ? hoveredDistrict.screenY + 22 : hoveredDistrict.screenY - 14) : 0;

  return (
    <div
      className="relative w-full h-[420px] bg-[#071324] border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-inner select-none"
      ref={containerRef}
    >
      {/* Top Map Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Layer Switcher */}
        <div className="flex items-center gap-1 bg-slate-900/95 border border-slate-700/80 rounded-lg p-1 text-[11px] backdrop-blur shadow-md pointer-events-auto">
          <button
            onClick={() => onChangeLayer('rainx')}
            className={`px-2.5 py-1 rounded font-bold transition cursor-pointer ${
              activeLayer === 'rainx' ? 'bg-teal-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
            title="RAIN-X Regime-Corrected Precipitation"
          >
            RAIN-X
          </button>
          <button
            onClick={() => onChangeLayer('raw')}
            className={`px-2.5 py-1 rounded font-bold transition cursor-pointer ${
              activeLayer === 'raw' ? 'bg-teal-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
            title="Raw Numerical Weather Prediction Guidance"
          >
            Raw NWP
          </button>
          <button
            onClick={() => onChangeLayer('delta')}
            className={`px-2.5 py-1 rounded font-bold transition cursor-pointer ${
              activeLayer === 'delta' ? 'bg-teal-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
            title="NWP Bias Delta (RAIN-X minus Raw)"
          >
            Δ Bias
          </button>
          <button
            onClick={() => onChangeLayer('prob')}
            className={`px-2.5 py-1 rounded font-bold transition cursor-pointer ${
              activeLayer === 'prob' ? 'bg-teal-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
            title="Calibrated Heavy Rainfall Probability (≥64.5mm)"
          >
            P(≥64.5mm)
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-slate-900/95 border border-slate-700/80 rounded-lg p-1 backdrop-blur shadow-md pointer-events-auto">
          <button
            onClick={handleZoomIn}
            className="p-1 hover:bg-slate-800 text-slate-300 hover:text-teal-300 rounded transition cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1 hover:bg-slate-800 text-slate-300 hover:text-teal-300 rounded transition cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1 hover:bg-slate-800 text-slate-300 hover:text-teal-300 rounded transition cursor-pointer"
            title="Reset to Full India View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Cluster Quick Drill-Down Selector Pills */}
      <div className="absolute bottom-3 right-3 z-10 flex flex-wrap items-center gap-1 pointer-events-auto max-w-sm justify-end">
        {REGIONAL_CLUSTERS.map(c => {
          const isCurrent = activeClusterId === c.id;
          return (
            <button
              key={c.id}
              onClick={() => onSelectCluster(c.id)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                isCurrent
                  ? 'bg-teal-500 text-slate-950 border-teal-300 shadow-md scale-105'
                  : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {c.name.split(' ')[0]}
            </button>
          );
        })}
      </div>

      {/* Active Cluster Badge on bottom-left */}
      {activeClusterId !== 'all' && (
        <div className="absolute bottom-3 left-3 z-10 bg-teal-950/95 border border-teal-500/60 rounded-lg px-2.5 py-1 text-xs text-teal-300 backdrop-blur shadow flex items-center gap-1.5 pointer-events-auto">
          <Navigation2 className="w-3.5 h-3.5 text-teal-400 rotate-45" />
          <span className="font-bold">
            Cluster: {REGIONAL_CLUSTERS.find(c => c.id === activeClusterId)?.name}
          </span>
          <button
            onClick={handleResetZoom}
            className="ml-1 text-[10px] underline text-slate-300 hover:text-white cursor-pointer"
          >
            (Reset All India)
          </button>
        </div>
      )}

      {/* SVG Canvas with animated viewBox */}
      <div className="flex-1 w-full h-full flex items-center justify-center p-2">
        <svg
          viewBox={currentViewBox}
          className="w-full h-full transition-all duration-700 ease-in-out"
        >
          <defs>
            <pattern id="radar-grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1E3E62" strokeWidth="0.4" strokeOpacity="0.3" />
            </pattern>
            <radialGradient id="plumeGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00ADB5" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="#00ADB5" stopOpacity="0"/>
            </radialGradient>
            <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#00ADB5" />
            </marker>
            <marker id="arrow-bay" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#38bdf8" />
            </marker>
          </defs>
          <rect x="-100" y="-100" width="600" height="600" fill="url(#radar-grid)" />

          {/* India Mainland Polygon */}
          <path
            d="M 120,40 L 150,30 L 175,45 L 210,50 L 220,70 L 235,95 L 260,105 L 310,95 L 340,110 L 330,135 L 280,140 L 270,170 L 250,190 L 245,230 L 220,290 L 190,360 L 175,400 L 160,370 L 130,290 L 110,240 L 80,210 L 60,190 L 85,150 L 95,110 Z"
            fill="#0B1A2F"
            stroke="#1E3E62"
            strokeWidth="1.8"
          />

          {/* Western Ghats Ridge Line */}
          <path
            d="M 105,225 Q 125,280 145,350"
            stroke="#14b8a6"
            strokeWidth="4"
            strokeOpacity="0.35"
            strokeLinecap="round"
            fill="none"
          />

          {/* Monsoon Trough Axis line */}
          <path
            d="M 75,145 Q 170,155 280,135"
            stroke="#f59e0b"
            strokeWidth="1.2"
            strokeDasharray="5,3"
            fill="none"
          />
          <text x="125" y="140" fill="#f59e0b" fontSize="6.5" fontWeight="bold" opacity="0.8">
            Monsoon Trough Axis
          </text>

          {/* Ocean Labels & Low-level Jet Streams */}
          <text x="25" y="325" fill="#475569" fontSize="9" fontWeight="bold" letterSpacing="1">
            ARABIAN SEA
          </text>
          <path
            d="M 30,355 Q 65,330 95,295"
            stroke="#00ADB5"
            strokeWidth="1.5"
            strokeDasharray="4,4"
            fill="none"
            markerEnd="url(#arrow)"
          />
          <text x="40" y="365" fill="#00ADB5" fontSize="6" fontWeight="bold">
            LLJ Moisture Flux (15 m/s)
          </text>

          <text x="260" y="275" fill="#475569" fontSize="9" fontWeight="bold" letterSpacing="1">
            BAY OF BENGAL
          </text>
          <path
            d="M 305,290 Q 275,250 245,225"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeDasharray="4,4"
            fill="none"
            markerEnd="url(#arrow-bay)"
          />
          <text x="265" y="300" fill="#38bdf8" fontSize="6" fontWeight="bold">
            Depression Convergence
          </text>

          {/* Synoptic Plumes */}
          <ellipse cx="135" cy="270" rx="45" ry="75" fill="rgba(14, 165, 233, 0.15)" stroke="rgba(14, 165, 233, 0.35)" strokeDasharray="3,3" />
          <ellipse cx="240" cy="210" rx="60" ry="50" fill="url(#plumeGrad)" stroke="rgba(20, 184, 166, 0.4)" strokeDasharray="4,3" />

          {/* District Pins with Hover Tooltips */}
          {districts.map(d => {
            const isSelected = d.id === selectedDistrictId;
            let valLabel = `${d.rainX} mm`;
            let markerColor = "#0ea5e9";
            if (activeLayer === 'raw') {
              valLabel = `${d.rawNwp} mm`;
              markerColor = "#64748b";
            } else if (activeLayer === 'delta') {
              valLabel = `${d.delta > 0 ? '+' : ''}${d.delta} mm`;
              markerColor = d.delta > 0 ? "#14b8a6" : "#f59e0b";
            } else if (activeLayer === 'prob') {
              valLabel = `${d.heavyRainProb}%`;
              markerColor = d.alertCategory === 'RED' ? '#ef4444' : d.alertCategory === 'ORANGE' ? '#f97316' : '#22c55e';
            }

            const px = (d.x / 100) * 400;
            const py = (d.y / 100) * 450;

            return (
              <g
                key={d.id}
                className="cursor-pointer transition-transform hover:scale-125"
                onClick={() => handlePinClick(d)}
                onMouseEnter={(e) => handlePointerUpdate(d, e)}
                onMouseMove={(e) => handlePointerUpdate(d, e)}
                onMouseLeave={() => setHoveredDistrict(null)}
              >
                {(isSelected || d.alertCategory === 'RED') && (
                  <circle
                    cx={px}
                    cy={py}
                    r={isSelected ? 16 : 13}
                    fill="none"
                    stroke={markerColor}
                    strokeWidth="1.5"
                    strokeOpacity={0.6}
                    className="animate-ping"
                  />
                )}

                <circle
                  cx={px}
                  cy={py}
                  r={isSelected ? 9 : 6.5}
                  fill={markerColor}
                  fillOpacity={0.9}
                  stroke={isSelected ? '#ffffff' : '#0B192C'}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                />

                <text
                  x={px + 8}
                  y={py + 3.5}
                  fill="#ffffff"
                  fontSize="8.5"
                  fontWeight="bold"
                  className="pointer-events-none drop-shadow-md"
                >
                  {d.name.split(' ')[0]} ({valLabel})
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Enhanced Hover Tooltip (Real-time delta, probability, regime, uncertainty) */}
      {hoveredDistrict && (
        <div
          className={`absolute z-30 pointer-events-none bg-slate-950/95 border border-teal-400 rounded-xl p-3 shadow-2xl backdrop-blur text-xs text-slate-200 min-w-[230px] animate-fadeIn ${
            isNearTop ? 'transform -translate-x-1/2' : 'transform -translate-x-1/2 -translate-y-full'
          }`}
          style={{
            left: `${clampedX}px`,
            top: `${tooltipY}px`
          }}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1.5">
            <div>
              <div className="font-bold text-white text-sm">
                {hoveredDistrict.district.name}
              </div>
              <div className="text-[10px] text-slate-400">
                {hoveredDistrict.district.subdivision} ({hoveredDistrict.district.state})
              </div>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
              hoveredDistrict.district.alertCategory === 'RED' ? 'bg-red-950 text-red-300 border border-red-800' :
              hoveredDistrict.district.alertCategory === 'ORANGE' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
              hoveredDistrict.district.alertCategory === 'YELLOW' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
              'bg-emerald-950 text-emerald-300 border border-emerald-800'
            }`}>
              {hoveredDistrict.district.alertCategory}
            </span>
          </div>

          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">RAIN-X Corrected:</span>
              <span className="text-teal-300 font-bold">{hoveredDistrict.district.rainX} mm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Raw NWP Forecast:</span>
              <span className="text-slate-300">{hoveredDistrict.district.rawNwp} mm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Real-time Delta Δ:</span>
              <span className={`font-bold ${hoveredDistrict.district.delta > 0 ? 'text-teal-400' : 'text-amber-400'}`}>
                {hoveredDistrict.district.delta > 0 ? '+' : ''}{hoveredDistrict.district.delta} mm
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">P(Rain ≥ 64.5mm):</span>
              <span className={`font-bold ${hoveredDistrict.district.heavyRainProb >= 75 ? 'text-red-400' : hoveredDistrict.district.heavyRainProb >= 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {hoveredDistrict.district.heavyRainProb}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Dominant Regime:</span>
              <span className="text-sky-300 font-sans font-semibold uppercase text-[10px]">
                {hoveredDistrict.district.dominantRegime} ({(hoveredDistrict.district.regimeConfidence * 100).toFixed(0)}%)
              </span>
            </div>
          </div>

          <div className="mt-2 pt-1 border-t border-slate-800 text-[10px] text-teal-400 font-sans flex items-center justify-between">
            <span>Uncertainty: ±{hoveredDistrict.district.uncertaintyBand} mm</span>
            <span className="text-slate-400">Click to drill down</span>
          </div>
        </div>
      )}
    </div>
  );
};
