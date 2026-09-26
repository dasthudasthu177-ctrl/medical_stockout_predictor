import React, { useState } from 'react';
import { SupplierNudge } from '../types';
import {
  X,
  Send,
  Check,
  CheckCheck,
  Copy,
  Printer,
  Smartphone,
  ShieldCheck,
  Building,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface SupplierNudgeModalProps {
  nudge: SupplierNudge | null;
  onClose: () => void;
  onAcknowledgeNudge: (id: string) => void;
}

export const SupplierNudgeModal: React.FC<SupplierNudgeModalProps> = ({
  nudge,
  onClose,
  onAcknowledgeNudge,
}) => {
  const [copied, setCopied] = useState(false);
  const [replied, setReplied] = useState(false);

  if (!nudge) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(nudge.messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppWeb = () => {
    const encoded = encodeURIComponent(nudge.messageText);
    // WhatsApp direct web link
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleSimulateReply = () => {
    setReplied(true);
    onAcknowledgeNudge(nudge.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Automated Supplier Restock Nudge</h3>
              <p className="text-xs text-slate-400">
                PO: <span className="font-mono text-emerald-400">{nudge.poNumber}</span> • {nudge.facilityName}
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

        {/* Body Canvas: WhatsApp Mockup Screen */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 bg-slate-950/50">
          <div className="bg-[#0b141a] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl relative">
            {/* WhatsApp App Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-[#202c33] mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-xs">
                  TN
                </div>
                <div>
                  <div className="text-xs font-bold text-[#e9edef] flex items-center space-x-1.5">
                    <span>{nudge.supplierName}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-[11px] text-[#8696a0]">{nudge.supplierPhone} (Depot Dispatch)</div>
                </div>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 font-mono">
                WhatsApp API v2.4
              </span>
            </div>

            {/* Chat Bubble: Outgoing Nudge */}
            <div className="flex justify-end mb-3">
              <div className="bg-[#005c4b] text-[#e9edef] p-3.5 rounded-2xl rounded-tr-none max-w-[90%] sm:max-w-[85%] text-xs leading-relaxed space-y-2 shadow-md">
                <div className="whitespace-pre-line font-sans">{nudge.messageText}</div>
                <div className="flex items-center justify-end space-x-1 text-[10px] text-emerald-200/80 pt-1 border-t border-emerald-700/50">
                  <span>{nudge.timestamp}</span>
                  <CheckCheck className="w-3.5 h-3.5 text-cyan-300" />
                </div>
              </div>
            </div>

            {/* Simulated Incoming Reply Bubble */}
            {replied ? (
              <div className="flex justify-start animate-fadeIn">
                <div className="bg-[#202c33] text-[#e9edef] p-3.5 rounded-2xl rounded-tl-none max-w-[85%] text-xs space-y-1.5 shadow-md border border-slate-700/50">
                  <div className="font-bold text-emerald-400 text-[11px]">
                    {nudge.supplierName}
                  </div>
                  <p>
                    ✅ <strong>CONFIRM ACKNOWLEDGED.</strong> Purchase Order{' '}
                    <span className="font-mono text-cyan-300">{nudge.poNumber}</span> accepted for priority delivery.
                    <br />
                    Vehicle No: <strong>TN-09-DE-4412</strong> (Cold chain carrier).
                    <br />
                    Estimated Dispatch: <strong>Tomorrow, 09:30 AM</strong>.
                  </p>
                  <div className="text-[10px] text-[#8696a0] text-right pt-1">
                    Just now • Verified Distributor Gateway
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-900/60 rounded-xl border border-dashed border-slate-700 text-center space-y-2">
                <p className="text-xs text-slate-400">
                  Waiting for distributor acknowledgment or WhatsApp delivery confirmation.
                </p>
                <button
                  onClick={handleSimulateReply}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Simulate Distributor Restock Confirmation
                </button>
              </div>
            )}
          </div>

          {/* Quick Specifications */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400">Medicine</span>
              <div className="font-semibold text-slate-100 mt-0.5">{nudge.medicineName}</div>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400">Restock Quantity</span>
              <div className="font-bold text-emerald-400 mt-0.5 font-mono">
                {nudge.suggestedQuantity.toLocaleString()} units
              </div>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-slate-400">Urgency Tier</span>
              <div className="font-bold text-rose-400 mt-0.5">{nudge.urgency}</div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-850 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Nudge Text'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print PO</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleWhatsAppWeb}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send via WhatsApp Web</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
