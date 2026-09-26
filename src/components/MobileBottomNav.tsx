import React from 'react';
import { Presentation, LayoutDashboard, CloudRain, MessageSquareShare, Bot, Globe } from 'lucide-react';

interface MobileBottomNavProps {
  currentView: 'presentation' | 'dashboard' | 'simulator' | 'nudges' | 'google-data';
  setCurrentView: (view: 'presentation' | 'dashboard' | 'simulator' | 'nudges' | 'google-data') => void;
  onOpenAiCopilot: () => void;
  criticalCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  setCurrentView,
  onOpenAiCopilot,
  criticalCount,
}) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-slate-300 py-1.5 px-2">
      <div className="flex items-center justify-around">
        {/* Map & Radar */}
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`flex flex-col items-center py-1 px-1.5 rounded-lg text-[10px] font-medium transition-colors relative ${
            currentView === 'dashboard' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          <span>Map & Radar</span>
          {criticalCount > 0 && (
            <span className="absolute top-0.5 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
        </button>

        {/* Google Data */}
        <button
          onClick={() => setCurrentView('google-data')}
          className={`flex flex-col items-center py-1 px-1.5 rounded-lg text-[10px] font-medium transition-colors ${
            currentView === 'google-data' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4 mb-0.5" />
          <span>Google Data</span>
        </button>

        {/* Simulator */}
        <button
          onClick={() => setCurrentView('simulator')}
          className={`flex flex-col items-center py-1 px-1.5 rounded-lg text-[10px] font-medium transition-colors ${
            currentView === 'simulator' ? 'text-teal-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <CloudRain className="w-4 h-4 mb-0.5" />
          <span>Surge</span>
        </button>

        {/* Restock Orders */}
        <button
          onClick={() => setCurrentView('nudges')}
          className={`flex flex-col items-center py-1 px-1.5 rounded-lg text-[10px] font-medium transition-colors ${
            currentView === 'nudges' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquareShare className="w-4 h-4 mb-0.5" />
          <span>Orders</span>
        </button>

        {/* AI Copilot */}
        <button
          onClick={onOpenAiCopilot}
          className="flex flex-col items-center py-1 px-1.5 rounded-lg text-[10px] font-medium text-violet-400 hover:text-violet-300 transition-colors"
        >
          <Bot className="w-4 h-4 mb-0.5" />
          <span>AI Chat</span>
        </button>
      </div>
    </nav>
  );
};
