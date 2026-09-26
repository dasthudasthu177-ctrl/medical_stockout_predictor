export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'OPTIMAL';

export interface Facility {
  id: string;
  name: string;
  type: 'PHC' | 'UPHC' | 'CHC' | 'District Hospital' | 'Regional Warehouse';
  district: string;
  latitude: number;
  longitude: number;
  dailyFootfall: number;
  lastSync: string;
  distributor: string;
  distributorPhone: string;
  medicalOfficer: string;
  officerPhone: string;
  address: string;
  activeSurge: string | null;
  criticalItemCount?: number;
}

export interface ForecastPoint {
  dayOffset: number;
  date: string;
  predictedStock: number;
  lowerBound: number;
  upperBound: number;
  projectedDispensing: number;
}

export interface Medicine {
  id: string;
  code: string;
  name: string;
  genericName: string;
  category: 'Fever & Pain' | 'Hydration & GI' | 'Antibiotics' | 'Chronic & Metabolic' | 'Respiratory' | 'Vaccines & Critical';
  unit: string;
  currentStock: number;
  baseDailyBurnRate: number;
  adjustedDailyBurnRate: number;
  reorderPoint: number;
  bufferThreshold: number;
  daysRemaining: number;
  stockoutRiskScore: number; // 0 to 100
  riskLevel: RiskLevel;
  predictedStockoutDate: string;
  supplierLeadTimeDays: number;
  batchNumber: string;
  expiryDate: string;
  historicalDispensing: number[]; // past 14 days
  forecastedTrajectory: ForecastPoint[];
  sensitivity: {
    monsoon: number; // 1.0 = normal, 1.8 = 80% higher in heavy monsoon
    viral: number;   // 1.0 = normal, 1.5 = 50% higher in flu wave
    dengue: number;  // 1.0 = normal, 2.0 = 100% higher in dengue outbreak
  };
}

export interface OutbreakSignals {
  monsoonRainIndex: number; // 0 to 100%
  viralFluWave: number;    // 0 to 100%
  dengueVectorIndex: number; // 0 to 100%
  supplierLeadTimeDelay: number; // 0 to 7 days
}

export interface SupplierNudge {
  id: string;
  poNumber: string;
  facilityId: string;
  facilityName: string;
  medicineId: string;
  medicineName: string;
  currentStock: number;
  daysRemaining: number;
  suggestedQuantity: number;
  urgency: 'Immediate (24h)' | 'Urgent (48h)' | 'Routine (5-7d)';
  status: 'Draft' | 'Sent via WhatsApp' | 'Acknowledged' | 'Dispatched';
  timestamp: string;
  supplierName: string;
  supplierPhone: string;
  messageText: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface MapPlace {
  title: string;
  uri: string;
  address: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  createdAt: string;
  places?: MapPlace[];
  sources?: GroundingSource[];
}
