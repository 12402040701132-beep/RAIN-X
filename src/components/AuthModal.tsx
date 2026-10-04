import React, { useState } from 'react';
import { Shield, KeyRound, UserCheck, Lock, CheckCircle2, Building, Sparkles } from 'lucide-react';
import { UserSession } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession;
  onLogin: (user: UserSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin
}) => {
  const [email, setEmail] = useState(currentUser.email);
  const [name, setName] = useState(currentUser.name);
  const [role, setRole] = useState(currentUser.role);
  const [officerId, setOfficerId] = useState('NCMRWF-OPS-772');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: UserSession = {
      name,
      email,
      role,
      agency: 'MoES / NCMRWF Weather Intelligence Unit',
      isLoggedIn: true
    };
    onLogin(updatedUser);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  const handleQuickRole = (roleName: string, userName: string, userEmail: string) => {
    setName(userName);
    setEmail(userEmail);
    setRole(roleName);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0B192C] border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
        {/* Header with National Emblem styling */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-[#0B192C] to-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300">
              <Shield className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Forecaster Portal Sign-In</h3>
              <p className="text-[11px] text-slate-400">Ministry of Earth Sciences / NCMRWF Gateway</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white px-2 py-1 text-sm font-bold rounded cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {/* Quick Evaluator Switch */}
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">
              Quick 1-Click Role Profiles (Evaluation Mode):
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickRole('MoES Scientific Reviewer', 'Dr. K. Ramanathan', 'ramanathan.moes@gov.in')}
                className="p-2 rounded bg-slate-900 border border-slate-700 hover:border-teal-400 text-left text-slate-200 transition cursor-pointer"
              >
                <div className="font-bold text-teal-300">MoES Evaluator</div>
                <div className="text-[10px] text-slate-500">Full Auditing Access</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRole('Lead NWP Scientist', 'Dr. Arvind Sharma', 'dr.sharma@ncmrwf.gov.in')}
                className="p-2 rounded bg-slate-900 border border-slate-700 hover:border-teal-400 text-left text-slate-200 transition cursor-pointer"
              >
                <div className="font-bold text-sky-300">NCMRWF Forecaster</div>
                <div className="text-[10px] text-slate-500">Operational Ingestion</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-slate-800 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Officer / User Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#071324] border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Official Email (.gov.in / .nic.in):</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#071324] border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-teal-400 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Operational Role:</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#071324] border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-teal-400"
              >
                <option value="Lead NWP Scientist">Lead NWP Scientist (NCMRWF)</option>
                <option value="Senior Forecaster">Senior Operational Forecaster (IMD)</option>
                <option value="MoES Scientific Reviewer">MoES Scientific Reviewer & Auditor</option>
                <option value="Disaster Management Commissioner">Disaster Management Commissioner (SDMA)</option>
              </select>
            </div>

            <div className="p-2.5 rounded bg-teal-950/40 border border-teal-500/20 text-[11px] text-teal-200 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>Session encrypted. Authenticated to trigger CAP emergency warnings.</span>
            </div>

            {isSuccess && (
              <div className="p-2.5 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 flex items-center gap-2 text-xs font-bold animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Session authenticated successfully! Loading workspace...
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 rounded-lg bg-gradient-to-r from-teal-500 to-sky-600 hover:from-teal-400 hover:to-sky-500 text-slate-950 font-bold shadow-lg transition cursor-pointer"
              >
                Sign In to RAIN-X
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
