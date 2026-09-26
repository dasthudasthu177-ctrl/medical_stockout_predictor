import React, { useState } from 'react';
import {
  Activity,
  Presentation,
  LayoutDashboard,
  CloudRain,
  Bot,
  MessageSquareShare,
  Menu,
  X,
  Building2,
  AlertTriangle,
  FileSpreadsheet,
  Globe,
  LogIn,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { Facility, OutbreakSignals } from '../types';
import { User, signInWithGoogle, signOutUser } from '../lib/firebase';

interface NavbarProps {
  currentView: 'presentation' | 'dashboard' | 'simulator' | 'nudges' | 'google-data';
  setCurrentView: (view: 'presentation' | 'dashboard' | 'simulator' | 'nudges' | 'google-data') => void;
  facilities: Facility[];
  selectedFacility: Facility;
  setSelectedFacility: (facility: Facility) => void;
  outbreakSignals: OutbreakSignals;
  onOpenAiCopilot: () => void;
  onOpenInventoryModal: () => void;
  criticalCount: number;
  user: User | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  facilities,
  selectedFacility,
  setSelectedFacility,
  outbreakSignals,
  onOpenAiCopilot,
  onOpenInventoryModal,
  criticalCount,
  user,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const handleSignIn = async () => {
    setAuthLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign-in failed:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.error('Sign-out failed:', err);
    }
  };

  const isSevereOutbreak =
    outbreakSignals.monsoonRainIndex > 50 || outbreakSignals.viralFluWave > 40;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Project Identity */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="flex items-center space-x-2.5 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5 text-slate-950 font-bold" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                    Stockout Predictor
                  </span>
                  <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                    GDG DevFest
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Smart Health & Supply Chain Resilience
                </p>
              </div>
            </button>
          </div>

          {/* Simple & Clear Main Navigation Switcher */}
          <div className="hidden lg:flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg font-medium transition-all relative cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Map & Radar</span>
              {criticalCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {criticalCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentView('google-data')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                currentView === 'google-data'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Google Real-World Data</span>
            </button>

            <button
              onClick={() => setCurrentView('simulator')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                currentView === 'simulator'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CloudRain className="w-4 h-4 text-teal-400" />
              <span>Surge Simulator</span>
            </button>

            <button
              onClick={() => setCurrentView('nudges')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                currentView === 'nudges'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <MessageSquareShare className="w-4 h-4 text-emerald-400" />
              <span>Restock Orders</span>
            </button>

            <button
              onClick={() => setCurrentView('presentation')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                currentView === 'presentation'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Presentation className="w-4 h-4" />
              <span>Pitch Deck</span>
            </button>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Facility Selector */}
            {currentView !== 'presentation' && (
              <div className="hidden md:flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
                <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <select
                  value={selectedFacility.id}
                  onChange={(e) => {
                    const found = facilities.find((f) => f.id === e.target.value);
                    if (found) setSelectedFacility(found);
                  }}
                  className="bg-transparent text-slate-200 border-none outline-none focus:ring-0 cursor-pointer text-xs font-medium max-w-[140px] truncate"
                >
                  {facilities.map((fac) => (
                    <option key={fac.id} value={fac.id} className="bg-slate-900 text-slate-200">
                      {fac.name.split(' ')[0]} ({fac.type})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* AI Copilot Button */}
            <button
              onClick={onOpenAiCopilot}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Bot className="w-4 h-4 text-violet-200" />
              <span className="hidden sm:inline">AI Copilot</span>
            </button>

            {/* Google Firebase Auth Profile / Sign-In Button */}
            {user ? (
              <div className="flex items-center space-x-2 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-6 h-6 rounded-full border border-emerald-500"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {user.displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <span className="text-xs font-medium text-slate-200 hidden sm:inline max-w-[90px] truncate">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-slate-400 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                  title="Sign out of Firebase"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                disabled={authLoading}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                <span>{authLoading ? 'Signing in...' : 'Sign In'}</span>
              </button>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-slate-200" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-900/98 px-4 pt-3 pb-4 space-y-2">
          {/* Facility Selector */}
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 mb-2">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Active Facility
            </label>
            <select
              value={selectedFacility.id}
              onChange={(e) => {
                const found = facilities.find((f) => f.id === e.target.value);
                if (found) setSelectedFacility(found);
                setMobileMenuOpen(false);
              }}
              className="w-full bg-slate-900 text-slate-100 text-xs rounded-lg p-2 border border-slate-700"
            >
              {facilities.map((fac) => (
                <option key={fac.id} value={fac.id}>
                  {fac.name} ({fac.type})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => {
                setCurrentView('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl font-medium flex items-center space-x-2 ${
                currentView === 'dashboard' ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-slate-300'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Map & Radar</span>
            </button>

            <button
              onClick={() => {
                setCurrentView('google-data');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl font-medium flex items-center space-x-2 ${
                currentView === 'google-data' ? 'bg-cyan-600 text-white' : 'bg-slate-950 text-slate-300'
              }`}
            >
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Google Data</span>
            </button>

            <button
              onClick={() => {
                setCurrentView('simulator');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl font-medium flex items-center space-x-2 ${
                currentView === 'simulator' ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-slate-300'
              }`}
            >
              <CloudRain className="w-4 h-4 text-teal-400" />
              <span>Surge Simulator</span>
            </button>

            <button
              onClick={() => {
                setCurrentView('nudges');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl font-medium flex items-center space-x-2 ${
                currentView === 'nudges' ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-slate-300'
              }`}
            >
              <MessageSquareShare className="w-4 h-4 text-emerald-400" />
              <span>Restock Orders</span>
            </button>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
            <button
              onClick={() => {
                setCurrentView('presentation');
                setMobileMenuOpen(false);
              }}
              className="text-slate-400 hover:text-white flex items-center space-x-1"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>Pitch Deck</span>
            </button>
            <button
              onClick={() => {
                onOpenInventoryModal();
                setMobileMenuOpen(false);
              }}
              className="text-slate-400 hover:text-white flex items-center space-x-1"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Dispensing Registers</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
