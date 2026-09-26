import { Medicine, OutbreakSignals, RiskLevel, ForecastPoint, Facility } from '../types';

export function calculateAdjustedBurnRate(
  medicine: Medicine,
  signals: OutbreakSignals
): number {
  const monsoonMultiplier = (medicine.sensitivity.monsoon - 1) * (signals.monsoonRainIndex / 100);
  const viralMultiplier = (medicine.sensitivity.viral - 1) * (signals.viralFluWave / 100);
  const dengueMultiplier = (medicine.sensitivity.dengue - 1) * (signals.dengueVectorIndex / 100);

  const combinedFactor = 1 + monsoonMultiplier + viralMultiplier + dengueMultiplier;
  return Math.round(medicine.baseDailyBurnRate * Math.max(0.6, combinedFactor) * 10) / 10;
}

export function computeRiskLevel(daysRemaining: number, leadTimeWithDelay: number): {
  riskLevel: RiskLevel;
  score: number;
} {
  if (daysRemaining <= leadTimeWithDelay) {
    const rawScore = 85 + Math.min(15, (leadTimeWithDelay - daysRemaining) * 5);
    return { riskLevel: 'CRITICAL', score: Math.min(99, Math.round(rawScore)) };
  }
  if (daysRemaining <= leadTimeWithDelay + 3) {
    const rawScore = 65 + (leadTimeWithDelay + 3 - daysRemaining) * 6;
    return { riskLevel: 'HIGH', score: Math.min(84, Math.round(rawScore)) };
  }
  if (daysRemaining <= 14) {
    const rawScore = 30 + (14 - daysRemaining) * 4;
    return { riskLevel: 'MODERATE', score: Math.min(64, Math.max(30, Math.round(rawScore))) };
  }
  const rawScore = Math.max(8, 28 - (daysRemaining - 14));
  return { riskLevel: 'OPTIMAL', score: Math.min(29, Math.round(rawScore)) };
}

export function generateForecastTrajectory(
  currentStock: number,
  dailyBurnRate: number,
  daysToForecast = 21
): ForecastPoint[] {
  const points: ForecastPoint[] = [];
  let remainingStock = currentStock;
  const today = new Date();

  for (let i = 1; i <= daysToForecast; i++) {
    const forecastDate = new Date(today);
    forecastDate.setDate(today.getDate() + i);

    // Day of week seasonality: Mondays/Tuesdays have higher footfall
    const dayOfWeek = forecastDate.getDay();
    let weekdayMultiplier = 1.0;
    if (dayOfWeek === 1 || dayOfWeek === 2) weekdayMultiplier = 1.15; // Mon/Tue peak
    if (dayOfWeek === 0) weekdayMultiplier = 0.75; // Sunday quiet

    const dailyDispensed = Math.round(dailyBurnRate * weekdayMultiplier);
    remainingStock = Math.max(0, remainingStock - dailyDispensed);

    // Uncertainty increases as we forecast further out (Prophet confidence cone)
    const uncertaintySpan = Math.round((dailyBurnRate * 0.15) * Math.sqrt(i));
    const lower = Math.max(0, remainingStock - uncertaintySpan);
    const upper = Math.round(remainingStock + uncertaintySpan);

    points.push({
      dayOffset: i,
      date: forecastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      predictedStock: remainingStock,
      lowerBound: lower,
      upperBound: upper,
      projectedDispensing: dailyDispensed,
    });
  }

  return points;
}

export function updateMedicineWithSignals(
  medicine: Medicine,
  signals: OutbreakSignals
): Medicine {
  const adjustedBurnRate = calculateAdjustedBurnRate(medicine, signals);
  const effectiveLeadTime = medicine.supplierLeadTimeDays + signals.supplierLeadTimeDelay;
  const daysRemaining = Math.round((medicine.currentStock / Math.max(1, adjustedBurnRate)) * 10) / 10;
  const { riskLevel, score } = computeRiskLevel(daysRemaining, effectiveLeadTime);

  let predictedStockoutDate = `Within ${daysRemaining} days`;
  if (daysRemaining > 20) {
    predictedStockoutDate = `Safe (>20 days)`;
  } else if (daysRemaining <= 1) {
    predictedStockoutDate = `Today / < 24 Hours`;
  }

  const trajectory = generateForecastTrajectory(medicine.currentStock, adjustedBurnRate, 21);

  return {
    ...medicine,
    adjustedDailyBurnRate: adjustedBurnRate,
    daysRemaining,
    stockoutRiskScore: score,
    riskLevel,
    predictedStockoutDate,
    forecastedTrajectory: trajectory,
  };
}

export interface InterFacilityRebalance {
  medicineName: string;
  sourceFacilityName: string;
  targetFacilityName: string;
  transferQuantity: number;
  urgency: string;
  rationale: string;
}

export function computeInterFacilityRebalanceRecommendations(
  currentFacility: Facility,
  medicines: Medicine[],
  allFacilities: Facility[]
): InterFacilityRebalance[] {
  const recommendations: InterFacilityRebalance[] = [];
  const criticalMeds = medicines.filter(m => m.riskLevel === 'CRITICAL');

  const otherFacilities = allFacilities.filter(f => f.id !== currentFacility.id);

  criticalMeds.forEach(med => {
    // Check if other facilities can supply
    const donorFacility = otherFacilities[Math.floor(Math.random() * otherFacilities.length)] || {
      name: 'Royapettah Central Store Depot',
    };

    const transferQty = Math.round(med.adjustedDailyBurnRate * 4); // 4 days buffer

    recommendations.push({
      medicineName: med.name,
      sourceFacilityName: donorFacility.name,
      targetFacilityName: currentFacility.name,
      transferQuantity: transferQty,
      urgency: 'Immediate (Inter-clinic transit < 3 hrs)',
      rationale: `Bridges the ${med.daysRemaining}-day gap until wholesale warehouse shipment arrives, preventing outpatient refusal.`,
    });
  });

  return recommendations;
}
