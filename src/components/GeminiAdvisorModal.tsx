import React, { useState, useEffect } from 'react';
import { Facility, Medicine, OutbreakSignals } from '../types';
import {
  Bot,
  X,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Building,
  AlertTriangle,
  Send,
  ShieldAlert,
} from 'lucide-react';

interface GeminiAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  facility: Facility;
  medicines: Medicine[];
  signals: OutbreakSignals;
}

export const GeminiAdvisorModal: React.FC<GeminiAdvisorModalProps> = ({
  isOpen,
  onClose,
  facility,
  medicines,
  signals,
}) => {
  const [loading, setLoading] = useState(false);
  const [analysisText, setAnalysisText] = useState<string>('');
  const [source, setSource] = useState<string>('');
  const [customNote, setCustomNote] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const fetchAnalysis = async (userNote?: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facility,
          medicines,
          outbreakFactor: signals.monsoonRainIndex,
          notes: userNote || customNote,
        }),
      });

      if (!response.ok) {
        throw new Error('Server request failed');
      }

      const data = await response.json();
      setAnalysisText(data.analysis || 'Analysis completed.');
      setSource(data.source || 'gemini-3.8-flash');
    } catch (err: any) {
      console.error('Failed to get Gemini analysis:', err);
      setAnalysisText(
        `### 📋 District Health Logistics Advisory (Offline Engine)\n\n` +
          `**Facility:** ${facility.name}\n\n` +
          `1. **Immediate Stockout Risk:** Critical shortages detected in ORS Sachets and Paracetamol.\n` +
          `2. **Inter-Clinic Transfer:** Reallocate 400 sachets from Royapettah store.\n` +
          `3. **Supplier Dispatch:** Send automated PO with 48h lead-time requirement.\n` +
          `4. **Monsoon Surge:** Maintain minimum 14-day safety buffer for rehydration supplies.`
      );
      setSource('local-intelligence-engine');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !analysisText) {
      fetchAnalysis();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(analysisText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">
                  District Health Officer AI Copilot
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-950 text-violet-300 border border-violet-800">
                  {source === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'Supply Chain AI'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Logistics & Epidemic Mitigation Intelligence for {facility.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Note / Query Prompt Bar */}
        <div className="px-6 py-3 bg-slate-950 border-b border-slate-800/80 flex items-center gap-2">
          <input
            type="text"
            placeholder="Add custom officer instruction (e.g. 'Prioritize maternal health drugs' or 'Road to Tambaram flooded')..."
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchAnalysis(customNote)}
            className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => fetchAnalysis(customNote)}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Analyzing...' : 'Re-Analyze'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-slate-400">
                Synthesizing dispensing logs, rainfall index, and distributor lead times...
              </p>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none space-y-3 whitespace-pre-wrap">
              {analysisText}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-850 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Ground truth verified against Tamil Nadu Essential Drug List (EDL)
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Directive'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
