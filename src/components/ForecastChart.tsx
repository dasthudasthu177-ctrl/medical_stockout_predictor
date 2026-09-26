import React, { useState } from 'react';
import { Medicine, OutbreakSignals } from '../types';
import { Calendar, TrendingDown, AlertTriangle, ShieldCheck, Info } from 'lucide-react';

interface ForecastChartProps {
  medicine: Medicine;
  outbreakSignals: OutbreakSignals;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({ medicine, outbreakSignals }) => {
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);

  // Chart Dimensions
  const width = 800;
  const height = 280;
  const padding = { top: 25, right: 30, bottom: 40, left: 55 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Historical data (past 14 days) and Forecasted trajectory (next 21 days)
  const trajectory = medicine.forecastedTrajectory || [];
  const maxStock = Math.max(
    medicine.currentStock * 1.3,
    medicine.reorderPoint * 1.2,
    ...trajectory.map((p) => p.upperBound),
    100
  );

  // Coordinate scales
  const totalDays = 21;
  const getX = (dayOffset: number) => {
    return padding.left + (dayOffset / totalDays) * chartWidth;
  };

  const getY = (stockValue: number) => {
    const clamped = Math.max(0, Math.min(maxStock, stockValue));
    return padding.top + chartHeight - (clamped / maxStock) * chartHeight;
  };

  // Generate SVG Path for predicted stock curve
  const linePoints = [
    { x: getX(0), y: getY(medicine.currentStock) },
    ...trajectory.map((p) => ({
      x: getX(p.dayOffset),
      y: getY(p.predictedStock),
    })),
  ];

  const linePath = linePoints.reduce(
    (acc, pt, idx) => (idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`),
    ''
  );

  // Confidence Upper and Lower Band Area
  const upperPoints = [
    { x: getX(0), y: getY(medicine.currentStock) },
    ...trajectory.map((p) => ({
      x: getX(p.dayOffset),
      y: getY(p.upperBound),
    })),
  ];

  const lowerPoints = [
    ...trajectory
      .map((p) => ({
        x: getX(p.dayOffset),
        y: getY(p.lowerBound),
      }))
      .reverse(),
    { x: getX(0), y: getY(medicine.currentStock) },
  ];

  const areaPath =
    upperPoints.reduce((acc, pt, idx) => (idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`), '') +
    lowerPoints.reduce((acc, pt) => `${acc} L ${pt.x},${pt.y}`, '') +
    ' Z';

  // Zero stock intercept day
  const stockoutDay = trajectory.find((p) => p.predictedStock <= 5)?.dayOffset || 21;
  const isCritical = medicine.daysRemaining <= 4;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
              {medicine.code}
            </span>
            <h3 className="text-lg font-bold text-white tracking-tight">{medicine.name}</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{medicine.genericName}</p>
        </div>

        {/* Prediction Status Badge */}
        <div className="flex items-center space-x-3">
          <div
            className={`px-3 py-1.5 rounded-xl border flex items-center space-x-2 text-xs font-bold ${
              medicine.riskLevel === 'CRITICAL'
                ? 'bg-rose-950/70 border-rose-600/70 text-rose-300'
                : medicine.riskLevel === 'HIGH'
                ? 'bg-amber-950/70 border-amber-600/70 text-amber-300'
                : 'bg-emerald-950/70 border-emerald-600/70 text-emerald-300'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>
              {medicine.daysRemaining <= 1
                ? 'Stockout in < 24 Hours'
                : `Predicted Stockout: ${medicine.daysRemaining} days`}
            </span>
          </div>

          <div className="text-right text-xs">
            <div className="text-slate-400">Current Stock</div>
            <div className="text-white font-bold">
              {medicine.currentStock} {medicine.unit}
            </div>
          </div>
        </div>
      </div>

      {/* Trajectory Metrics row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs">
        <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-800">
          <span className="text-slate-400">Daily Burn Rate</span>
          <div className="text-slate-200 font-bold text-sm mt-0.5 flex items-center space-x-1">
            <span>{medicine.adjustedDailyBurnRate} {medicine.unit}/day</span>
            {medicine.adjustedDailyBurnRate > medicine.baseDailyBurnRate && (
              <span className="text-amber-400 text-[11px] font-semibold">
                (+{Math.round(((medicine.adjustedDailyBurnRate - medicine.baseDailyBurnRate) / medicine.baseDailyBurnRate) * 100)}%)
              </span>
            )}
          </div>
        </div>

        <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-800">
          <span className="text-slate-400">Supplier Lead Time</span>
          <div className="text-slate-200 font-bold text-sm mt-0.5">
            {medicine.supplierLeadTimeDays + outbreakSignals.supplierLeadTimeDelay} days
            {outbreakSignals.supplierLeadTimeDelay > 0 && (
              <span className="text-rose-400 text-[11px] font-normal ml-1">
                (+{outbreakSignals.supplierLeadTimeDelay}d transit delay)
              </span>
            )}
          </div>
        </div>

        <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-800">
          <span className="text-slate-400">Buffer Safety Threshold</span>
          <div className="text-slate-200 font-bold text-sm mt-0.5">
            {medicine.bufferThreshold} {medicine.unit}
          </div>
        </div>

        <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-800">
          <span className="text-slate-400">Reorder Trigger Point</span>
          <div className="text-slate-200 font-bold text-sm mt-0.5">
            {medicine.reorderPoint} {medicine.unit}
          </div>
        </div>
      </div>

      {/* SVG Interactive Chart */}
      <div className="relative overflow-x-auto">
        <div className="min-w-[500px]">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
            <defs>
              <linearGradient id="gradientTrajectory" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>

              <linearGradient id="bandGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Grid horizontal lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const val = Math.round(maxStock * (1 - ratio));
              const y = padding.top + ratio * chartHeight;
              return (
                <g key={ratio}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="#334155"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 4}
                    textAnchor="end"
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Critical Threshold Line */}
            {medicine.bufferThreshold < maxStock && (
              <g>
                <line
                  x1={padding.left}
                  y1={getY(medicine.bufferThreshold)}
                  x2={width - padding.right}
                  y2={getY(medicine.bufferThreshold)}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  strokeWidth="1.5"
                />
                <text
                  x={width - padding.right}
                  y={getY(medicine.bufferThreshold) - 4}
                  textAnchor="end"
                  fill="#f87171"
                  fontSize="9"
                  fontWeight="bold"
                >
                  CRITICAL BUFFER LEVEL ({medicine.bufferThreshold})
                </text>
              </g>
            )}

            {/* Confidence Interval Band */}
            <path d={areaPath} fill="url(#bandGradient)" />

            {/* Main Predicted Stock Depletion Line */}
            <path
              d={linePath}
              fill="none"
              stroke="url(#gradientTrajectory)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Day 0 / Today Marker */}
            <circle
              cx={getX(0)}
              y={getY(medicine.currentStock)}
              r="5"
              fill="#10b981"
              stroke="#0f172a"
              strokeWidth="2"
            />
            <text
              x={getX(0)}
              y={padding.top + chartHeight + 18}
              textAnchor="middle"
              fill="#10b981"
              fontSize="10"
              fontWeight="bold"
            >
              Today
            </text>

            {/* Timeline Days X-Axis labels */}
            {[4, 7, 14, 21].map((day) => (
              <g key={day}>
                <line
                  x1={getX(day)}
                  y1={padding.top}
                  x2={getX(day)}
                  y2={padding.top + chartHeight}
                  stroke="#1e293b"
                  strokeWidth="1"
                />
                <text
                  x={getX(day)}
                  y={padding.top + chartHeight + 18}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="sans-serif"
                >
                  +{day}d
                </text>
              </g>
            ))}

            {/* Interactive Data Points */}
            {trajectory.map((p, idx) => (
              <g key={idx}>
                <circle
                  cx={getX(p.dayOffset)}
                  y={getY(p.predictedStock)}
                  r={hoveredPoint?.dayOffset === p.dayOffset ? '6' : '3.5'}
                  fill={p.predictedStock <= medicine.bufferThreshold ? '#f43f5e' : '#38bdf8'}
                  stroke="#0f172a"
                  strokeWidth="1.5"
                  className="cursor-pointer transition-all hover:scale-125"
                  onMouseEnter={() => setHoveredPoint(p)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            ))}

            {/* Stockout zero marker if within 21 days */}
            {medicine.daysRemaining <= 21 && (
              <g>
                <circle
                  cx={getX(medicine.daysRemaining)}
                  y={getY(0)}
                  r="6"
                  fill="#ef4444"
                  stroke="#fff"
                  strokeWidth="2"
                  className="animate-ping"
                />
                <circle
                  cx={getX(medicine.daysRemaining)}
                  y={getY(0)}
                  r="5"
                  fill="#ef4444"
                  stroke="#fff"
                  strokeWidth="1.5"
                />
                <text
                  x={getX(medicine.daysRemaining)}
                  y={getY(0) - 10}
                  textAnchor="middle"
                  fill="#fca5a5"
                  fontSize="10"
                  fontWeight="bold"
                >
                  ⚠️ 0 Stock ({medicine.daysRemaining}d)
                </text>
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Hover or Current Point Card */}
      <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/60 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            {hoveredPoint ? (
              <>
                <strong>{hoveredPoint.date} (+{hoveredPoint.dayOffset} days):</strong> Projected Stock:{' '}
                <strong className="text-white">{hoveredPoint.predictedStock} {medicine.unit}</strong>{' '}
                (80% Confidence Range: {hoveredPoint.lowerBound}–{hoveredPoint.upperBound})
              </>
            ) : (
              <>
                <strong>Prophet Time-Series Cone:</strong> Blue shaded band represents 80% confidence interval factoring monsoon rainfall and day-of-week surge variations.
              </>
            )}
          </span>
        </div>

        <div className="text-[11px] text-slate-400">
          Source: PHC Dispensing Register + Vector Surveillance Data
        </div>
      </div>
    </div>
  );
};
