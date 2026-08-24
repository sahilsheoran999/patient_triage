import { AgeCategory } from '../config/ageGroupConfig';

export type TriageLevelNumber = 1 | 2 | 3 | 4 | 5;

export type TriageLevelCode = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NON_URGENT';

export interface TriageLevelInfo {
  level: TriageLevelNumber;
  code: TriageLevelCode;
  name: string;
  badgeText: string;
  color: string;
  bgHex: string;
  textHex: string;
  borderHex: string;
  maxWaitMinutes: number;
}

export type MonitoringState = 'SAFE' | 'WATCH' | 'REASSESS' | 'ESCALATE';

export interface VitalReading {
  timestamp: string; // ISO or relative
  minutesAgo: number;
  spo2: number | null; // % or null if unknown
  heartRate: number | null; // bpm
  systolicBp: number | null; // mmHg
  diastolicBp: number | null; // mmHg
  respiratoryRate: number | null; // bpm
  temperature: number | null; // °C
}

export interface VitalDelta {
  field: string;
  label: string;
  previousValue: string;
  currentValue: string;
  deltaText: string;
  isWorse: boolean;
}

export interface RiskFactor {
  name: string;
  contribution: number;
  description: string;
  isRedFlag?: boolean;
}

export interface UncertaintyDriver {
  factor: string;
  impact: 'High' | 'Moderate' | 'Low';
  description: string;
}

export interface Patient {
  id: string;
  name: string;
  gender: 'M' | 'F' | 'Other';
  age: number;
  ageGroup: AgeCategory;
  chiefComplaint: string;
  symptomSeverity: number; // 1-10
  symptomDurationHours: number;
  associatedSymptoms: string[];
  medicalHistory: string[];
  hasNoHistoryRecord: boolean; // Zero history case
  allergies: string[];
  medications: string[];
  observedCues: string[]; // Pallor, Sweating, Respiratory distress, Confusion, etc.
  
  // Vitals
  currentVitals: VitalReading;
  vitalsHistory: VitalReading[];
  
  // Arrival metadata
  arrivalTime: string;
  elapsedWaitMinutes: number;
  lastVitalsUpdateMinutesAgo: number;
  
  // Triage state
  priority: TriageLevelCode;
  previousPriority?: TriageLevelCode;
  riskScore: number; // 0 - 100
  previousRiskScore?: number;
  confidence: number; // 0 - 100%
  uncertainty: 'LOW' | 'MODERATE' | 'HIGH';
  dataCompleteness: number; // 0 - 100%
  dataReliability: 'HIGH' | 'MEDIUM' | 'LOW';
  missingCriticalInputs: string[];
  monitoringState: MonitoringState;
  
  // Explanations & Evidence
  primaryReason: string;
  recommendedAction: string;
  safetyEscalatedDueToUncertainty: boolean;
  whyNowReason?: string;
  recentDeteriorationDetected?: boolean;
  vitalDeltas?: VitalDelta[];
  riskFactors: RiskFactor[];
  uncertaintyDrivers: UncertaintyDriver[];
  
  // Clinician override state
  overrideApplied?: boolean;
  overrideInfo?: {
    originalPriority: TriageLevelCode;
    newPriority: TriageLevelCode;
    reasonCategory: string;
    customNote: string;
    clinicianId: string;
    timestamp: string;
  };
  
  // Scenario tag
  scenarioTag?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  patientId: string;
  patientName: string;
  user: string;
  eventType: 
    | 'PATIENT_REGISTERED'
    | 'VITALS_RECORDED'
    | 'AI_ASSESSMENT_GENERATED'
    | 'RISK_RECALCULATED'
    | 'REASSESSMENT_TRIGGERED'
    | 'DETERIORATION_DETECTED'
    | 'CLINICIAN_REVIEWED'
    | 'CLINICIAN_OVERRIDE'
    | 'SURGE_MODE_ACTIVATED'
    | 'SURGE_MODE_DEACTIVATED'
    | 'CONFIG_CHANGED';
  details: string;
  previousState?: string;
  newState?: string;
  reason?: string;
  severity: 'info' | 'warning' | 'alert' | 'critical';
}

export interface SurgeState {
  isActive: boolean;
  multiplier: number; // e.g. 3.0
  baselineVolume: number; // e.g. 124
  surgeVolume: number; // baseline * multiplier
  queueGrowth: number;
  criticalCasesCount: number;
  highPriorityCount: number;
  reassessmentBacklogCount: number;
  longestWaitMinutes: number;
  topSafetyConcernPatientIds: string[];
}

export interface AnalyticsMetrics {
  patientsProcessed: number;
  avgTriageTimeSeconds: number;
  highRiskDetectionRate: number; // %
  reassessmentAlertCount: number;
  deteriorationEventCount: number;
  overrideRate: number; // %
  avgWaitTimeMinutes: number;
  highUncertaintyCaseRate: number; // %
  avgDataCompleteness: number; // %
  clinicianAgreementRate: number; // e.g. 87%
  commonOverrideReasons: { reason: string; percentage: number }[];
}
