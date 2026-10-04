import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Mail, Phone, MessageSquare, ShieldAlert, Sparkles } from 'lucide-react';
import { offlineStorage } from '../services/offlineStorage';

export const AlertSubscriptionPanel: React.FC = () => {
  const [email, setEmail] = useState('disaster.cell@maharashtra.gov.in');
  const [phone, setPhone] = useState('+91 98201 54321');
  const [district, setDistrict] = useState('Konkan & Goa (Mumbai / Raigad)');
  const [threshold, setThreshold] = useState(70);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [testSentMsg, setTestSentMsg] = useState<string | null>(null);

  useEffect(() => {
    const existing = offlineStorage.getAlertSubscriptions();
    if (existing && existing.length > 0) {
      const last = existing[existing.length - 1];
      if (last.email) setEmail(last.email);
      if (last.phone) setPhone(last.phone);
      if (last.district) setDistrict(last.district);
      if (last.threshold) setThreshold(last.threshold);
      if (typeof last.smsEnabled === 'boolean') setSmsEnabled(last.smsEnabled);
      if (typeof last.emailEnabled === 'boolean') setEmailEnabled(last.emailEnabled);
      if (typeof last.whatsappEnabled === 'boolean') setWhatsappEnabled(last.whatsappEnabled);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      email,
      phone,
      district,
      threshold,
      smsEnabled,
      emailEnabled,
      whatsappEnabled,
      timestamp: new Date().toISOString()
    };
    offlineStorage.saveAlertSubscription(payload);
    setIsSaved(true);
    setTestSentMsg(`Simulated ${smsEnabled ? 'SMS' : ''}${smsEnabled && emailEnabled ? ' & ' : ''}${emailEnabled ? 'Email' : ''} alert dispatched to ${phone} for ${district}!`);
    setTimeout(() => {
      setIsSaved(false);
    }, 4000);
  };

  return (
    <div className="bg-[#0B192C] border border-teal-500/40 rounded-xl p-4 shadow-lg text-xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 font-bold text-white">
          <Bell className="w-4 h-4 text-teal-400 animate-pulse" />
          <span>Heavy Rain Alert Gateway</span>
        </div>
        <span className="text-[10px] font-bold text-teal-300 bg-teal-950 px-1.5 py-0.5 rounded border border-teal-800">
          IMD / NDMA CAP
        </span>
      </div>

      <form onSubmit={handleSave} className="space-y-2.5">
        <div>
          <label className="text-[11px] text-slate-300 font-semibold block mb-1">
            Target District / Sub-Division:
          </label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full bg-[#071324] border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-teal-400"
          >
            <option value="Konkan & Goa (Mumbai / Raigad)">Konkan & Goa (Mumbai / Raigad)</option>
            <option value="Madhya Maharashtra (Pune / Satara)">Madhya Maharashtra (Pune / Satara)</option>
            <option value="Coastal Karnataka (Udupi / Mangalore)">Coastal Karnataka (Udupi / Mangalore)</option>
            <option value="Kerala & Mahe (Wayanad / Idukki)">Kerala & Mahe (Wayanad / Idukki)</option>
            <option value="Odisha (Cuttack / Balasore)">Odisha (Cuttack / Balasore)</option>
            <option value="Vidarbha (Nagpur / Amravati)">Vidarbha (Nagpur / Amravati)</option>
            <option value="Assam & Meghalaya (Guwahati)">Assam & Meghalaya (Guwahati)</option>
            <option value="Saurashtra & Kutch (Gujarat)">Saurashtra & Kutch (Gujarat)</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5 flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400" /> Mobile (SMS)
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 XXXXX XXXXX"
              className="w-full bg-[#071324] border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-teal-400 font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5 flex items-center gap-1">
              <Mail className="w-3 h-3 text-slate-400" /> Official Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@nic.in"
              className="w-full bg-[#071324] border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-teal-400"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-slate-300">Trigger Threshold:</span>
            <span className="font-bold text-teal-400">P(Rain ≥ 64.5mm) ≥ {threshold}%</span>
          </div>
          <input
            type="range"
            min="40"
            max="90"
            step="5"
            value={threshold}
            onChange={(e) => setThreshold(parseInt(e.target.value))}
            className="w-full accent-teal-400 cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-slate-500">
            <span>Watch (50%)</span>
            <span>Alert (65%)</span>
            <span>Warning (75%+)</span>
          </div>
        </div>

        {/* Channels toggles */}
        <div className="pt-1 border-t border-slate-800 space-y-1.5">
          <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">
            Notification Channels:
          </span>
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-300">
              <input
                type="checkbox"
                checked={smsEnabled}
                onChange={(e) => setSmsEnabled(e.target.checked)}
                className="accent-teal-500 rounded"
              />
              <span>SMS Priority</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-300">
              <input
                type="checkbox"
                checked={emailEnabled}
                onChange={(e) => setEmailEnabled(e.target.checked)}
                className="accent-teal-500 rounded"
              />
              <span>Email CAP Bulletin</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-300">
              <input
                type="checkbox"
                checked={whatsappEnabled}
                onChange={(e) => setWhatsappEnabled(e.target.checked)}
                className="accent-teal-500 rounded"
              />
              <span>WhatsApp Flash</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-2 bg-gradient-to-r from-teal-500 to-sky-600 hover:from-teal-400 hover:to-sky-500 text-slate-950 font-bold py-1.5 px-3 rounded-lg shadow-md transition flex items-center justify-center gap-1.5 text-xs cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Update Subscription & Test Dispatch
        </button>
      </form>

      {/* Confirmation Banner */}
      {isSaved && testSentMsg && (
        <div className="bg-emerald-950/80 border border-emerald-500/60 rounded-lg p-2 text-[11px] text-emerald-200 flex items-start gap-1.5 animate-fadeIn">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Preferences Saved (Offline & Cloud Sync)</div>
            <div className="text-[10px] text-emerald-300/90">{testSentMsg}</div>
          </div>
        </div>
      )}
    </div>
  );
};
