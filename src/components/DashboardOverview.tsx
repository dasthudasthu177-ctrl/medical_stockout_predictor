import React, { useState } from 'react';
import { Medicine, Facility, OutbreakSignals, SupplierNudge } from '../types';
import { ForecastChart } from './ForecastChart';
import { RealWorldMap } from './RealWorldMap';
import {
  AlertTriangle,
  ShieldCheck,
  TrendingDown,
  Building2,
  Clock,
  Search,
  Filter,
  Send,
  LineChart,
  ArrowRightLeft,
  CloudRain,
  ChevronRight,
  Sparkles,
  Map,
  CheckCircle2,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { computeInterFacilityRebalanceRecommendations } from '../utils/forecasting';

interface DashboardOverviewProps {
  facility: Facility;
  facilities: Facility[];
  medicines: Medicine[];
  signals: OutbreakSignals;
  onTriggerNudge: (medicine: Medicine) => void;
  onOpenSimulator: () => void;
  onOpenAiCopilot: () => void;
  onOpenGoogleData: () => void;
  onSelectFacility: (facility: Facility) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  facility,
  facilities,
  medicines,
  signals,
  onTriggerNudge,
  onOpenSimulator,
  onOpenAiCopilot,
  onOpenGoogleData,
  onSelectFacility,
}) => {
  const [selectedMedId, setSelectedMedId] = useState<string>(medicines[0]?.id || 'med-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'map' | 'forecast'>('map');

  const selectedMed = medicines.find((m) => m.id === selectedMedId) || medicines[0];

  const criticalMedicines = medicines.filter((m) => m.riskLevel === 'CRITICAL');
  const highRiskMedicines = medicines.filter((m) => m.riskLevel === 'HIGH');
  const optimalMedicines = medicines.filter((m) => m.riskLevel === 'OPTIMAL');

  // Filtered medicines
  const filteredMedicines = medicines.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || m.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = [
    'ALL',
    'Fever & Pain',
    'Hydration & GI',
    'Antibiotics',
    'Chronic & Metabolic',
    'Respiratory',
    'Vaccines & Critical',
  ];

  // Inter-facility rebalancing recommendations
  const rebalances = computeInterFacilityRebalanceRecommendations(facility, medicines, facilities);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Simple High-Impact KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900 border border-rose-900/40 p-4 sm:p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider">
              Critical Shortages
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono mt-1">
            {criticalMedicines.length} Drugs
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Zero stock within &lt; 4 days without supplier nudge
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900 border border-amber-900/40 p-4 sm:p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
              Approaching Buffer
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono mt-1">
            {highRiskMedicines.length} Drugs
          </div>
          <p className="text-[11px] text-slate-400 mt-1">4–7 days buffer remaining</p>
        </div>

        {/* Metric 3 */}
        <div
          onClick={onOpenSimulator}
          className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 p-4 sm:p-5 rounded-2xl shadow-lg cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
              Monsoon Surge Index
            </span>
            <CloudRain className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono mt-1">
            +{signals.monsoonRainIndex}% Burn
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Click to simulate outbreak scenarios</p>
        </div>

        {/* Metric 4 */}
        <div
          onClick={onOpenGoogleData}
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-4 sm:p-5 rounded-2xl shadow-lg cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
              Google Live Data
            </span>
            <MapPin className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-1">
            Live Verified
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Real-time Search & Maps Grounding</p>
        </div>
      </div>

      {/* 2. Visual Centerpiece: Real-World Map vs Time-Series Curve Toggle */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {viewMode === 'map' ? 'Real-World Supply Chain Map' : 'Prophet Depletion Trajectory'}
            </h2>
            <span className="text-xs text-slate-400 hidden sm:inline">
              (Facility: <strong className="text-emerald-400">{facility.name}</strong>)
            </span>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1.5 transition-colors cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Real-World Map</span>
            </button>
            <button
              onClick={() => setViewMode('forecast')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1.5 transition-colors cursor-pointer ${
                viewMode === 'forecast'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LineChart className="w-3.5 h-3.5 text-cyan-400" />
              <span>Forecast Trajectory</span>
            </button>
          </div>
        </div>

        {viewMode === 'map' ? (
          <RealWorldMap
            facilities={facilities}
            selectedFacility={facility}
            onSelectFacility={onSelectFacility}
            medicines={medicines}
            onTriggerNudge={onTriggerNudge}
          />
        ) : (
          <ForecastChart medicine={selectedMed} outbreakSignals={signals} />
        )}
      </div>

      {/* 3. Medicine Inventory Radar List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Stockout Vulnerability Radar
            </h3>
            <p className="text-xs text-slate-400">
              Ranked by days-to-stockout under current outbreak and weather signals
            </p>
          </div>

          {/* Search bar */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search medicine, salt, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800 pb-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredMedicines.map((m) => {
            const isSelected = selectedMedId === m.id;
            const isCritical = m.riskLevel === 'CRITICAL';
            const isHigh = m.riskLevel === 'HIGH';

            return (
              <div
                key={m.id}
                onClick={() => {
                  setSelectedMedId(m.id);
                  if (viewMode === 'map') setViewMode('forecast');
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative space-y-3 ${
                  isSelected
                    ? 'bg-slate-850 border-emerald-500 ring-1 ring-emerald-500/50 shadow-lg'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        {m.code}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">{m.category}</span>
                    </div>
                    <h4 className="font-bold text-white text-sm sm:text-base mt-1">{m.name}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{m.genericName}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        isCritical
                          ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                          : isHigh
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {m.riskLevel}
                    </span>
                    <div className="text-[11px] font-mono font-bold text-slate-300 mt-1">
                      {m.daysRemaining <= 1 ? '< 24 Hours' : `${m.daysRemaining} days left`}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>
                      Stock: <strong className="text-slate-200">{m.currentStock} {m.unit}</strong>
                    </span>
                    <span>Reorder point: {m.reorderPoint}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isCritical ? 'bg-rose-500' : isHigh ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(5, (m.currentStock / m.reorderPoint) * 100))}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
                  <div className="text-[11px] text-slate-400">
                    Burn: <strong className="text-slate-200">{m.adjustedDailyBurnRate} {m.unit}/day</strong>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMedId(m.id);
                        setViewMode('forecast');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium"
                    >
                      Curve
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTriggerNudge(m);
                      }}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center space-x-1.5 shadow-sm cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>WhatsApp Nudge</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Peer-to-Peer Inter-Clinic Rebalancing Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Inter-Clinic Stock Buffer Balancing
              </h3>
              <p className="text-xs text-slate-400">
                Peer-to-peer clinic transfers to protect patients during wholesale depot transit windows
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-indigo-400 bg-indigo-950/80 px-2.5 py-1 rounded-lg border border-indigo-800/60">
            {rebalances.length} Recommended Transfers
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {rebalances.map((rec, i) => (
            <div
              key={i}
              className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5 text-xs"
            >
              <div className="flex items-center justify-between font-semibold">
                <span className="text-emerald-400">{rec.medicineName}</span>
                <span className="text-indigo-300 font-mono font-bold">
                  +{rec.transferQuantity} units
                </span>
              </div>
              <div className="text-slate-300 flex items-center space-x-1.5">
                <span className="text-slate-400">From:</span>
                <span className="text-white font-medium">{rec.sourceFacilityName}</span>
                <span className="text-slate-500">→</span>
                <span className="text-white font-medium">{rec.targetFacilityName}</span>
              </div>
              <p className="text-[11px] text-slate-400">{rec.rationale}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
