import React, { useState } from 'react';
import {
  Shield,
  KeyRound,
  UserCheck,
  Lock,
  CheckCircle2,
  Building,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Activity,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { UserSession } from '../types';

interface SignInPageProps {
  onSignInSuccess: (user: UserSession) => void;
  onNavigateHome: () => void;
  currentUser: UserSession;
}

export const SignInPage: React.FC<SignInPageProps> = ({
  onSignInSuccess,
  onNavigateHome,
  currentUser
}) => {
  const [name, setName] = useState(currentUser.name || 'Dr. Arvind Sharma');
  const [email, setEmail] = useState(currentUser.email || 'dr.sharma@ncmrwf.gov.in');
  const [role, setRole] = useState(currentUser.role || 'Lead NWP Forecaster');
  const [agency, setAgency] = useState(currentUser.agency || 'MoES / NCMRWF Operational Division');
  const [officerId, setOfficerId] = useState('NCMRWF-OPS-772');
  const [tokenInput, setTokenInput] = useState('849-204');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  const handleQuickProfile = (profile: {
    name: string;
    role: string;
    email: string;
    agency: string;
    id: string;
  }) => {
    setName(profile.name);
    setRole(profile.role);
    setEmail(profile.email);
    setAgency(profile.agency);
    setOfficerId(profile.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);

    setTimeout(() => {
      setIsAuthenticating(false);
      setAuthSuccess(true);

      setTimeout(() => {
        onSignInSuccess({
          name,
          email,
          role,
          agency,
          isLoggedIn: true
        });
      }, 700);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#070f1e] text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800 bg-[#0B192C]/90 backdrop-blur px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-sky-700 flex items-center justify-center font-black text-white text-base shadow-md">
            RX
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">RAIN-X</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                MoES / NCMRWF
              </span>
            </div>
            <p className="text-[10px] text-slate-400">National Centre for Medium Range Weather Forecasting</p>
          </div>
        </div>

        <button
          onClick={onNavigateHome}
          className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-teal-400" />
          <span>Return to Portal Home</span>
        </button>
      </nav>

      {/* Main Sign-In Card */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-xl bg-[#0B192C] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
          {/* Card Header */}
          <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-[#0B192C] to-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 shadow-inner">
                <Shield className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <h2 className="font-black text-lg text-white tracking-tight">Forecaster Authentication Gateway</h2>
                <p className="text-xs text-slate-400">
                  Government of India • Ministry of Earth Sciences Operational Access
                </p>
              </div>
            </div>
            <div className="hidden sm:block text-right">
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-1 rounded font-bold">
                NIC Tier-4 Secure
              </span>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Quick 1-Click Role Profiles */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Quick 1-Click Role Profiles:
                </span>
                <span className="text-[10px] text-teal-400 font-medium">Select to auto-fill</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickProfile({
                    name: 'Dr. Arvind Sharma',
                    role: 'Lead NWP Forecaster',
                    email: 'dr.sharma@ncmrwf.gov.in',
                    agency: 'NCMRWF Operational Forecasting Division',
                    id: 'NCMRWF-OPS-772'
                  })}
                  className={`p-2.5 rounded-lg border text-left transition cursor-pointer ${
                    role.includes('NWP')
                      ? 'bg-teal-950/70 border-teal-400 text-teal-200'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="font-bold text-teal-300">NCMRWF Lead Forecaster</div>
                  <div className="text-[10px] text-slate-400">Dr. Arvind Sharma (NEPS-G)</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickProfile({
                    name: 'Dr. Sunita Deshmukh',
                    role: 'Senior Operational Forecaster',
                    email: 's.deshmukh@imd.gov.in',
                    agency: 'India Meteorological Department (NWFC)',
                    id: 'IMD-NWFC-419'
                  })}
                  className={`p-2.5 rounded-lg border text-left transition cursor-pointer ${
                    role.includes('Senior')
                      ? 'bg-teal-950/70 border-teal-400 text-teal-200'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="font-bold text-sky-300">IMD Senior Forecaster</div>
                  <div className="text-[10px] text-slate-400">Dr. Sunita Deshmukh (NWFC)</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickProfile({
                    name: 'Dr. K. Ramanathan',
                    role: 'MoES Scientific Reviewer',
                    email: 'ramanathan.moes@gov.in',
                    agency: 'Ministry of Earth Sciences R&D Cell',
                    id: 'MOES-SCI-902'
                  })}
                  className={`p-2.5 rounded-lg border text-left transition cursor-pointer ${
                    role.includes('Reviewer')
                      ? 'bg-teal-950/70 border-teal-400 text-teal-200'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="font-bold text-amber-300">MoES Scientific Auditor</div>
                  <div className="text-[10px] text-slate-400">Dr. K. Ramanathan (Evaluation)</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickProfile({
                    name: 'Rajesh Verma, IAS',
                    role: 'Disaster Management Commissioner',
                    email: 'commissioner@sdma.gov.in',
                    agency: 'State Disaster Management Authority',
                    id: 'SDMA-HQ-104'
                  })}
                  className={`p-2.5 rounded-lg border text-left transition cursor-pointer ${
                    role.includes('Disaster')
                      ? 'bg-teal-950/70 border-teal-400 text-teal-200'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="font-bold text-purple-300">SDMA Disaster Lead</div>
                  <div className="text-[10px] text-slate-400">Rajesh Verma, IAS (Civil Action)</div>
                </button>
              </div>
            </div>

            {/* Credential Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 pt-2 border-t border-slate-800 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Duty Officer / Forecaster Name:</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#071324] border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Official Email (.gov.in / .nic.in):</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#071324] border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-teal-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Operational Duty Role:</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#071324] border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-teal-400"
                  >
                    <option value="Lead NWP Forecaster">Lead NWP Forecaster (NCMRWF)</option>
                    <option value="Senior Operational Forecaster">Senior Operational Forecaster (IMD)</option>
                    <option value="MoES Scientific Reviewer">MoES Scientific Reviewer & Auditor</option>
                    <option value="Disaster Management Commissioner">Disaster Management Commissioner (SDMA)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Officer Badge ID:</label>
                  <input
                    type="text"
                    required
                    value={officerId}
                    onChange={(e) => setOfficerId(e.target.value)}
                    className="w-full bg-[#071324] border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-teal-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Affiliated Agency / Division:</label>
                <input
                  type="text"
                  required
                  value={agency}
                  onChange={(e) => setAgency(e.target.value)}
                  className="w-full bg-[#071324] border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-teal-400"
                />
              </div>

              {/* Security Level Pill */}
              <div className="p-3 rounded-lg bg-teal-950/40 border border-teal-500/20 text-[11px] text-teal-200 flex items-center gap-2">
                <Lock className="w-4 h-4 text-teal-400 shrink-0" />
                <span>
                  Authorized for Level-3 Common Alerting Protocol (CAP) and automated extreme rainfall advisory dispatch.
                </span>
              </div>

              {authSuccess && (
                <div className="p-3 rounded-lg bg-emerald-950 border border-emerald-500 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Authentication confirmed. Redirecting to Forecasting Console...</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onNavigateHome}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isAuthenticating || authSuccess}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-sky-600 hover:from-teal-400 hover:to-sky-500 text-slate-950 font-bold py-2.5 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isAuthenticating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : authSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
                      <span>Session Ready!</span>
                    </>
                  ) : (
                    <>
                      <span>Authenticate & Launch Console</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#081322] px-6 py-3 text-center text-xs text-slate-500">
        National Centre for Medium Range Weather Forecasting (NCMRWF) • Ministry of Earth Sciences, Govt. of India
      </footer>
    </div>
  );
};
