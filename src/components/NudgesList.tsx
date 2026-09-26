import React from 'react';
import { SupplierNudge, Medicine, Facility } from '../types';
import {
  MessageSquareShare,
  Send,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building,
  Plus,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface NudgesListProps {
  nudges: SupplierNudge[];
  onOpenNudgeModal: (nudge: SupplierNudge) => void;
  onComposeNudge: () => void;
  facility: Facility;
}

export const NudgesList: React.FC<NudgesListProps> = ({
  nudges,
  onOpenNudgeModal,
  onComposeNudge,
  facility,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
            <MessageSquareShare className="w-3.5 h-3.5" />
            <span>Supplier Restock Automation</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Distributor Restock Nudges & Orders
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Proactive early-warning nudges dispatched to state medical warehouses via WhatsApp & Twilio SMS before stockouts occur.
          </p>
        </div>

        <button
          onClick={onComposeNudge}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Restock Nudge</span>
        </button>
      </div>

      {/* Nudge Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {nudges.map((nudge) => (
          <div
            key={nudge.id}
            onClick={() => onOpenNudgeModal(nudge)}
            className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/60 p-5 rounded-2xl space-y-3 transition-all cursor-pointer shadow-lg hover:shadow-emerald-500/5 group"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                {nudge.poNumber}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  nudge.status === 'Acknowledged'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    : nudge.status === 'Sent via WhatsApp'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {nudge.status}
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                {nudge.medicineName}
              </h3>
              <p className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                <Building className="w-3 h-3" />
                <span>{nudge.facilityName}</span>
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Days Remaining:</span>
                <span className="font-bold text-rose-400 font-mono">
                  {nudge.daysRemaining} days
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Suggested Quantity:</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {nudge.suggestedQuantity.toLocaleString()} units
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Urgency:</span>
                <span className="font-semibold text-slate-200">{nudge.urgency}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <span className="text-[11px] text-slate-500">{nudge.timestamp}</span>
              <span className="text-emerald-400 font-semibold flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                <span>Open WhatsApp Nudge</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
