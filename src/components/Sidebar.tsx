import React, { useState } from 'react';
import {
  CloudRain,
  Compass,
  Layers,
  BarChart3,
  ShieldCheck,
  History,
  ListOrdered,
  Bell,
  Wifi,
  WifiOff,
  User,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Home
} from 'lucide-react';
import { UserSession } from '../types';

export type ActivePage = 'forecast' | 'regime' | 'comparison' | 'verification' | 'explainability' | 'archive' | 'history';

interface SidebarProps {
  currentPage: ActivePage;
  onSelectPage: (page: ActivePage) => void;
  selectedEventId: string;
  onSelectEvent: (eventId: string) => void;
  historicalEvents: { id: string; title: string; date: string }[];
  currentUser: UserSession;
  onOpenAuth: () => void;
  isOnline: boolean;
  isSimulatedOffline: boolean;
  onToggleSimulatedOffline: () => void;
  oodThreshold: number;
  onChangeOodThreshold: (val: number) => void;
  currentOodDistance: number;
  auditSafetyStatus: 'PASS' | 'WARNING' | 'FALLBACK';
  onNavigateHome: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  selectedEventId,
  onSelectEvent,
  historicalEvents,
  currentUser,
  onOpenAuth,
  isOnline,
  isSimulatedOffline,
  onToggleSimulatedOffline,
  oodThreshold,
  onChangeOodThreshold,
  currentOodDistance,
  auditSafetyStatus,
  onNavigateHome
}) => {
  // Alert Subscription form state
  const [subName, setSubName] = useState(currentUser.name || 'Disaster Duty Officer');
  const [subPhone, setSubPhone] = useState('+91 98201 54321');
  const [subEmail, setSubEmail] = useState(currentUser.email || 'alert.cell@moes.gov.in');
  const [heavyRainAlertsOnly, setHeavyRainAlertsOnly] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribeSuccessMsg, setSubscribeSuccessMsg] = useState<string | null>(null);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribed(true);
    const msg = `Alert subscription registered for ${subName} (${subPhone})! Heavy-Rain priority alerts active.`;
    setSubscribeSuccessMsg(msg);
    setTimeout(() => {
      setSubscribeSuccessMsg(null);
    }, 4500);
  };

  const navItems = [
    { id: 'forecast', label: '1. Operational Forecast', icon: CloudRain },
    { id: 'regime', label: '2. Weather Regime Engine', icon: Compass },
    { id: 'comparison', label: '3. Model Comparison', icon: Layers },
    { id: 'verification', label: '4. Verification & Metrics', icon: BarChart3 },
    { id: 'explainability', label: '5. Explainability & Safety', icon: ShieldCheck },
    { id: 'archive', label: '6. Historical Archive (D3)', icon: History },
    { id: 'history', label: '7. Query History & Presets', icon: ListOrdered }
  ];

  return (
    <aside className="w-72 bg-[#0B192C] border-r border-slate-800 flex flex-col h-full shrink-0 select-none overflow-y-auto no-scrollbar">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 bg-[#081322]">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-300 font-medium transition cursor-pointer"
            title="Return to National Portal Homepage"
          >
            <Home className="w-3.5 h-3.5 text-teal-400" />
            <span>Portal Home</span>
          </button>
          <span className="text-[10px] text-teal-300 font-bold bg-teal-950 px-1.5 py-0.5 rounded border border-teal-800">
            Govt. of India
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-sky-700 flex items-center justify-center shadow-lg shadow-teal-500/20 font-black text-white text-lg tracking-tighter border border-teal-300/40">
            RX
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-teal-400 via-sky-300 to-white bg-clip-text text-transparent">
                RAIN-X
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                MoES
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">NCMRWF Operational Forecasting</p>
          </div>
        </div>

        {/* User Account / Role Pill */}
        <div
          onClick={onOpenAuth}
          className="mt-3 p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-teal-500/60 transition cursor-pointer flex items-center justify-between"
          title="Click to Switch Forecaster Profile / Sign-in"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-teal-950 border border-teal-500/50 flex items-center justify-center text-teal-300 font-bold text-xs shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="truncate text-left">
              <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
              <div className="text-[10px] text-teal-400 font-medium truncate">{currentUser.role}</div>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">Switch</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="p-3 space-y-1">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 block mb-1">
          Forecasting Console
        </span>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectPage(item.id as ActivePage)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                isActive
                  ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-teal-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Quick Scenario Selector */}
      <div className="p-3 border-t border-slate-800/80">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
          Select Monsoon Scenario:
        </label>
        <select
          aria-label="Monsoon Scenario Selector"
          value={selectedEventId}
          onChange={(e) => onSelectEvent(e.target.value)}
          className="w-full bg-[#071324] border border-slate-700 text-xs font-medium text-teal-300 rounded-lg p-2 cursor-pointer focus:outline-none focus:border-teal-400"
        >
          {historicalEvents.map(ev => (
            <option key={ev.id} value={ev.id}>
              {ev.title}
            </option>
          ))}
        </select>
      </div>

      {/* CONFIDENCE SENSITIVITY SLIDER (User requested dynamically adjusting OOD threshold) */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Sliders className="w-3 h-3 text-teal-400" />
            Confidence Sensitivity
          </span>
          <span className="text-xs font-mono font-bold text-teal-300">{oodThreshold.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min="2.0"
          max="6.0"
          step="0.1"
          value={oodThreshold}
          onChange={(e) => onChangeOodThreshold(parseFloat(e.target.value))}
          className="w-full accent-teal-400 cursor-pointer"
          title="Adjust OOD Mahalanobis distance detection threshold"
        />
        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-0.5">
          <span>Strict (2.0)</span>
          <span>Standard (4.2)</span>
          <span>Permissive (6.0)</span>
        </div>

        {/* Dynamic Safety & Audit Flag Indicator */}
        <div className="mt-2.5 p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <div className="text-[10px] text-slate-400">Atmospheric Distance:</div>
            <div className="font-mono font-bold text-white text-xs">{currentOodDistance.toFixed(1)}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400">Audit Status:</div>
            <span className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded border ${
              auditSafetyStatus === 'FALLBACK'
                ? 'bg-red-950 text-red-300 border-red-700 animate-pulse'
                : 'bg-emerald-950 text-emerald-300 border-emerald-700'
            }`}>
              {auditSafetyStatus === 'FALLBACK' ? <AlertTriangle className="w-3 h-3 text-red-400" /> : <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
              {auditSafetyStatus}
            </span>
          </div>
        </div>
      </div>

      {/* ALERT SUBSCRIPTION FORM */}
      <div className="p-3 border-t border-slate-800/80">
        <div
          onClick={() => setIsAlertsOpen(!isAlertsOpen)}
          className="flex items-center justify-between cursor-pointer py-1"
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
            <Bell className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
            <span>Alert Subscription</span>
          </div>
          {isAlertsOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
        </div>

        {isAlertsOpen && (
          <form onSubmit={handleSubscribe} className="mt-2 space-y-2 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Name:</label>
              <input
                type="text"
                required
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                placeholder="Duty Officer Name"
                className="w-full bg-[#071324] border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Phone Number (SMS):</label>
              <input
                type="text"
                required
                value={subPhone}
                onChange={(e) => setSubPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="w-full bg-[#071324] border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-teal-400 font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Email Address:</label>
              <input
                type="email"
                required
                value={subEmail}
                onChange={(e) => setSubEmail(e.target.value)}
                placeholder="officer@nic.in"
                className="w-full bg-[#071324] border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-teal-400"
              />
            </div>

            <div className="pt-1.5 flex items-center justify-between">
              <label className="text-[11px] text-slate-300 font-medium cursor-pointer flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={heavyRainAlertsOnly}
                  onChange={(e) => setHeavyRainAlertsOnly(e.target.checked)}
                  className="accent-teal-500 rounded"
                />
                <span>Heavy Rain (≥64.5mm)</span>
              </label>
              <span className="text-[9px] bg-red-950 text-red-300 px-1.5 py-0.5 rounded border border-red-800 font-bold">
                Red/Orange
              </span>
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-gradient-to-r from-teal-500 to-sky-600 hover:from-teal-400 hover:to-sky-500 text-slate-950 font-bold py-1.5 px-3 rounded-lg shadow transition flex items-center justify-center gap-1.5 text-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Subscribe
            </button>

            {subscribeSuccessMsg && (
              <div className="p-2 rounded bg-emerald-950 border border-emerald-500 text-emerald-200 text-[10px] flex items-start gap-1 animate-fadeIn">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{subscribeSuccessMsg}</span>
              </div>
            )}
          </form>
        )}
      </div>

      {/* Network & Offline Storage Toggle */}
      <div className="mt-auto p-3 border-t border-slate-800 bg-[#081322] text-[11px] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5">
            {isOnline ? <Wifi className="w-3.5 h-3.5 text-teal-400" /> : <WifiOff className="w-3.5 h-3.5 text-amber-400" />}
            {isOnline ? 'Online (IndexedDB Ready)' : 'Offline Active'}
          </span>
          <button
            onClick={onToggleSimulatedOffline}
            className={`text-[10px] font-bold px-2 py-0.5 rounded border transition cursor-pointer ${
              isSimulatedOffline
                ? 'bg-amber-600 text-white border-amber-400'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            {isSimulatedOffline ? 'Go Online' : 'Simulate Offline'}
          </button>
        </div>
        <div className="text-[10px] text-slate-500 text-center font-mono">
          MoES / NCMRWF • Govt. of India
        </div>
      </div>
    </aside>
  );
};
