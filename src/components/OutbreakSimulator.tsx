import React from 'react';
import { OutbreakSignals, Medicine } from '../types';
import {
  CloudRain,
  Activity,
  Bug,
  Truck,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';

interface OutbreakSimulatorProps {
  signals: OutbreakSignals;
  setSignals: (signals: OutbreakSignals) => void;
  medicines: Medicine[];
  onApplyAndGoDashboard: () => void;
}

export const OutbreakSimulator: React.FC<OutbreakSimulatorProps> = ({
  signals,
  setSignals,
  medicines,
  onApplyAndGoDashboard,
}) => {
  const handleSliderChange = (key: keyof OutbreakSignals, value: number) => {
    setSignals({
      ...signals,
      [key]: value,
    });
  };

  const applyPreset = (preset: {
    monsoonRainIndex: number;
    viralFluWave: number;
    dengueVectorIndex: number;
    supplierLeadTimeDelay: number;
  }) => {
    setSignals(preset);
  };

  const criticalCount = medicines.filter((m) => m.riskLevel === 'CRITICAL').length;
  const highRiskCount = medicines.filter((m) => m.riskLevel === 'HIGH').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Title & Introduction */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
            <CloudRain className="w-3.5 h-3.5" />
            <span>Outbreak & Climate Signal Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Stress-Test Supply Chain Resilience
          </h2>
          <p className="text-slate-300 text-sm max-w-2xl">
            Simulate how monsoon waterlogging, viral influenza waves, and road logistics delays dynamically compress days-to-stockout across Chennai health facilities.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={onApplyAndGoDashboard}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
        >
          <span>View Updated Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Preset Quick Scenarios */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Quick Preset Scenarios
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() =>
              applyPreset({
                monsoonRainIndex: 10,
                viralFluWave: 15,
                dengueVectorIndex: 15,
                supplierLeadTimeDelay: 0,
              })
            }
            className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition-all hover:bg-slate-850 cursor-pointer"
          >
            <div className="text-xs font-bold text-slate-200">☀️ Dry Season Baseline</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Normal footfall, no transit delays</div>
          </button>

          <button
            onClick={() =>
              applyPreset({
                monsoonRainIndex: 85,
                viralFluWave: 40,
                dengueVectorIndex: 80,
                supplierLeadTimeDelay: 3,
              })
            }
            className="p-3 rounded-xl bg-slate-900 border border-cyan-800/60 hover:border-cyan-600 text-left transition-all hover:bg-cyan-950/20 cursor-pointer"
          >
            <div className="text-xs font-bold text-cyan-300">🌧️ Chennai Monsoon Surge</div>
            <div className="text-[11px] text-cyan-400/80 mt-0.5">+85% Rain, +80% Dengue vector, 3d transit delay</div>
          </button>

          <button
            onClick={() =>
              applyPreset({
                monsoonRainIndex: 25,
                viralFluWave: 90,
                dengueVectorIndex: 20,
                supplierLeadTimeDelay: 1,
              })
            }
            className="p-3 rounded-xl bg-slate-900 border border-amber-800/60 hover:border-amber-600 text-left transition-all hover:bg-amber-950/20 cursor-pointer"
          >
            <div className="text-xs font-bold text-amber-300">🤧 Post-Festival Viral Wave</div>
            <div className="text-[11px] text-amber-400/80 mt-0.5">+90% Flu spike, fever & cough surge</div>
          </button>

          <button
            onClick={() =>
              applyPreset({
                monsoonRainIndex: 95,
                viralFluWave: 60,
                dengueVectorIndex: 90,
                supplierLeadTimeDelay: 6,
              })
            }
            className="p-3 rounded-xl bg-slate-900 border border-rose-800/60 hover:border-rose-600 text-left transition-all hover:bg-rose-950/20 cursor-pointer"
          >
            <div className="text-xs font-bold text-rose-300">🌪️ Severe Cyclone Disaster</div>
            <div className="text-[11px] text-rose-400/80 mt-0.5">Extreme inundation, 6-day depot bottleneck</div>
          </button>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Slider 1: Monsoon Rain */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
                <CloudRain className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Northeast Monsoon & Rainfall Index</h4>
                <p className="text-xs text-slate-400">Triggers waterborne illnesses & ORS demand</p>
              </div>
            </div>
            <span className="text-lg font-extrabold text-cyan-400 font-mono">
              +{signals.monsoonRainIndex}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={signals.monsoonRainIndex}
            onChange={(e) => handleSliderChange('monsoonRainIndex', parseInt(e.target.value, 10))}
            className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>0% (Dry sunny)</span>
            <span>50% (Normal showers)</span>
            <span>100% (Continuous heavy rain)</span>
          </div>
        </div>

        {/* Slider 2: Dengue Vector */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-rose-950/80 border border-rose-800/60 text-rose-400">
                <Bug className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Dengue / Vector Surveillance Index</h4>
                <p className="text-xs text-slate-400">Directly impacts Artemether, ACT, Paracetamol</p>
              </div>
            </div>
            <span className="text-lg font-extrabold text-rose-400 font-mono">
              +{signals.dengueVectorIndex}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={signals.dengueVectorIndex}
            onChange={(e) => handleSliderChange('dengueVectorIndex', parseInt(e.target.value, 10))}
            className="w-full accent-rose-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>0% (Low vector risk)</span>
            <span>50% (Seasonal breeding)</span>
            <span>100% (High epidemic cluster)</span>
          </div>
        </div>

        {/* Slider 3: Viral Flu */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-800/60 text-amber-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Seasonal Viral / Influenza Intensity</h4>
                <p className="text-xs text-slate-400">Spikes Cetirizine, Inhalers, Azithromycin</p>
              </div>
            </div>
            <span className="text-lg font-extrabold text-amber-400 font-mono">
              +{signals.viralFluWave}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={signals.viralFluWave}
            onChange={(e) => handleSliderChange('viralFluWave', parseInt(e.target.value, 10))}
            className="w-full accent-amber-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>0% (Calm)</span>
            <span>50% (Standard winter/monsoon flu)</span>
            <span>100% (Widespread viral wave)</span>
          </div>
        </div>

        {/* Slider 4: Supplier Lead Time Delay */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-violet-950/80 border border-violet-800/60 text-violet-400">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Distributor Transit & Logistics Delay</h4>
                <p className="text-xs text-slate-400">Road bottlenecks, floods, depot dispatch queues</p>
              </div>
            </div>
            <span className="text-lg font-extrabold text-violet-400 font-mono">
              +{signals.supplierLeadTimeDelay} days
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="7"
            step="1"
            value={signals.supplierLeadTimeDelay}
            onChange={(e) => handleSliderChange('supplierLeadTimeDelay', parseInt(e.target.value, 10))}
            className="w-full accent-violet-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>0 days (On-time dispatch)</span>
            <span>3 days (Moderate delay)</span>
            <span>7 days (Severe bottleneck)</span>
          </div>
        </div>
      </div>

      {/* Real-time Recalculated Impact Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white">
              Real-Time Stockout Vulnerability Preview
            </h3>
            <p className="text-xs text-slate-400">
              Recalculated burn rates and days-to-stockout under current simulated signals
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-rose-950 text-rose-300 font-bold border border-rose-800">
              {criticalCount} Critical (&lt; 4 days)
            </span>
            <span className="px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 font-bold border border-amber-800">
              {highRiskCount} High Risk (4–7 days)
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800">
                <th className="py-2.5 px-3 font-semibold">Medicine</th>
                <th className="py-2.5 px-3 font-semibold">Base Burn Rate</th>
                <th className="py-2.5 px-3 font-semibold text-cyan-400">Adjusted Surge Rate</th>
                <th className="py-2.5 px-3 font-semibold">Current Stock</th>
                <th className="py-2.5 px-3 font-semibold">Days to Zero Stock</th>
                <th className="py-2.5 px-3 font-semibold">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {medicines.map((m) => (
                <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-200">{m.name}</div>
                    <div className="text-[11px] text-slate-400">{m.category}</div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {m.baseDailyBurnRate} {m.unit}/day
                  </td>
                  <td className="py-2.5 px-3 text-cyan-300 font-bold font-mono">
                    {m.adjustedDailyBurnRate} {m.unit}/day
                    {m.adjustedDailyBurnRate > m.baseDailyBurnRate && (
                      <span className="text-[10px] ml-1 text-cyan-400 font-normal">
                        (+{Math.round(((m.adjustedDailyBurnRate - m.baseDailyBurnRate) / m.baseDailyBurnRate) * 100)}%)
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-medium text-slate-200">
                    {m.currentStock} {m.unit}
                  </td>
                  <td className="py-2.5 px-3 font-bold font-mono">
                    <span
                      className={
                        m.daysRemaining <= 4
                          ? 'text-rose-400'
                          : m.daysRemaining <= 7
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }
                    >
                      {m.daysRemaining} days
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
