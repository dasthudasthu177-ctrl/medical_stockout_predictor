import React, { useState } from 'react';
import { Medicine, Facility } from '../types';
import {
  X,
  FileSpreadsheet,
  Download,
  Upload,
  Check,
  Edit2,
  Save,
  Plus,
  ArrowUpDown,
  Building,
} from 'lucide-react';

interface InventoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  facility: Facility;
  medicines: Medicine[];
  onUpdateStock: (medicineId: string, newStock: number) => void;
}

export const InventoryManagerModal: React.FC<InventoryManagerModalProps> = ({
  isOpen,
  onClose,
  facility,
  medicines,
  onUpdateStock,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartEdit = (med: Medicine) => {
    setEditingId(med.id);
    setEditValue(med.currentStock);
  };

  const handleSaveEdit = (medId: string) => {
    onUpdateStock(medId, Math.max(0, editValue));
    setEditingId(null);
    setFeedback(`Updated stock for ${medId}`);
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleExportCSV = () => {
    const headers = 'DrugCode,MedicineName,GenericName,Category,CurrentStock,Unit,DailyBurnRate,DaysRemaining,RiskLevel,BatchNumber,ExpiryDate\n';
    const rows = medicines
      .map(
        (m) =>
          `"${m.code}","${m.name}","${m.genericName}","${m.category}",${m.currentStock},"${m.unit}",${m.adjustedDailyBurnRate},${m.daysRemaining},"${m.riskLevel}","${m.batchNumber}","${m.expiryDate}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${facility.name.replace(/\s+/g, '_')}_Stock_Register_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Daily Stock & Dispensing Register</h3>
              <p className="text-xs text-slate-400">
                Facility: <span className="text-slate-200 font-semibold">{facility.name}</span> • Last Sync: {facility.lastSync}
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

        {/* Action bar */}
        <div className="px-6 py-3 bg-slate-950 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-400">
            Click <strong className="text-slate-200">"Edit"</strong> on any drug to simulate stock physical audit adjustment.
          </div>

          <div className="flex items-center space-x-2">
            {feedback && (
              <span className="text-emerald-400 text-xs font-semibold flex items-center space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span>{feedback}</span>
              </span>
            )}
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export CSV Register</span>
            </button>
          </div>
        </div>

        {/* Register Table */}
        <div className="p-6 overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="py-2.5 px-3">Drug Code</th>
                  <th className="py-2.5 px-3">Medicine & Form</th>
                  <th className="py-2.5 px-3">Batch & Expiry</th>
                  <th className="py-2.5 px-3">Physical Shelf Stock</th>
                  <th className="py-2.5 px-3">Burn Rate</th>
                  <th className="py-2.5 px-3">Risk Level</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {medicines.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-300">
                      {m.code}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-100">{m.name}</div>
                      <div className="text-[11px] text-slate-400">{m.genericName}</div>
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-400">
                      <div>Batch: <span className="font-mono text-slate-300">{m.batchNumber}</span></div>
                      <div>Exp: {m.expiryDate}</div>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {editingId === m.id ? (
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(parseInt(e.target.value, 10) || 0)}
                            className="w-20 bg-slate-950 border border-emerald-500 rounded px-2 py-1 text-xs text-white"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(m.id)}
                            className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-500"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="font-bold text-slate-200">
                          {m.currentStock} {m.unit}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {m.adjustedDailyBurnRate} {m.unit}/day
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.riskLevel === 'CRITICAL'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : m.riskLevel === 'HIGH'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : m.riskLevel === 'MODERATE'
                            ? 'bg-yellow-950 text-yellow-300 border border-yellow-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {m.riskLevel}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {editingId !== m.id && (
                        <button
                          onClick={() => handleStartEdit(m)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition-colors"
                        >
                          Edit Stock
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-850 flex items-center justify-between text-xs text-slate-400">
          <span>Compatible with HMIS & TNMSC e-Aushadhi portal formats</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
