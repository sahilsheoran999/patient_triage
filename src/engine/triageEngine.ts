import { Patient, TriageLevelCode, MonitoringState, MonitoringReasonCode, VitalDelta, RiskFactor, UncertaintyDriver, MLPrediction, HybridDecision } from '../types';
import { PROTOTYPE_RISK_WEIGHTS } from '../config/riskWeights';
import { DEFAULT_RED_FLAG_THRESHOLDS, DEFAULT_WAIT_THRESHOLDS, RedFlagThresholds, WaitThresholds } from '../config/prototypeThresholds';
import { AGE_GROUP_CONFIGS } from '../config/ageGroupConfig';
import { predictPatientAcuity } from './mlModel';

/**
 * Deterministically checks for respiratory symptoms in the chief complaint.
 * Prevents negated statements (e.g. "No shortness of breath") from triggering positive respiratory risk.
 */
export function hasRespiratoryComplaint(complaint: string): boolean {
  if (!complaint) return false;
  const normalized = complaint.toLowerCase();
  
  const respiratoryTerms = [
    'shortness of breath',
    'breathlessness',
    'difficulty breathing',
    'dyspnea',
    'stridor',
    'respiratory distress',
    'wheezing',
    'gasping'
  ];
  
  const hasTerm = respiratoryTerms.some(term => normalized.includes(term));
  if (!hasTerm) return false;
  
  const negationPattern = /\b(no|denies|without|negative\s+for)\s+(?:\w+\s+){0,3}(?:shortness\s+of\s+breath|breathlessness|difficulty\s+breathing|dyspnea|stridor|respiratory\s+distress|wheezing|gasping)\b/;
  
  return !negationPattern.test(normalized);
}

/**
 * Deterministically checks for cardiac symptoms in the chief complaint.
 * Prevents negated statements from triggering positive cardiac recognition.
 */
export function hasCardiacComplaint(complaint: string): boolean {
  if (!complaint) return false;
  const normalized = complaint.toLowerCase();
  
  const cardiacTerms = [
    'chest pain',
    'pain in chest',
    'palpitations',
    'angina',
    'cardiac arrest',
    'heart attack',
    'myocardial infarction',
    'chest pressure',
    'chest tightness'
  ];
  
  const hasTerm = cardiacTerms.some(term => normalized.includes(term));
  if (!hasTerm) return false;
  
  const negationPattern = /\b(no|denies|without|negative\s+for)\s+(?:\w+\s+){0,3}(?:chest\s+pain|pain\s+in\s+chest|palpitations|angina|cardiac\s+arrest|heart\s+attack|myocardial\s+infarction|chest\s+pressure|chest\s+tightness)\b/;
  
  return !negationPattern.test(normalized);
}

export type ComplaintCategory =
  | 'RESPIRATORY'
  | 'CARDIAC'
  | 'NEURO'
  | 'TRAUMA'
  | 'ABDOMINAL'
  | 'GI'
  | 'ALLERGIC'
  | 'FEVER'
  | 'PAIN'
  | 'OTHER';

/**
 * Categorizes chief complaints into structured clinical domains.
 */
export function categorizeChiefComplaint(complaint: string): ComplaintCategory {
  if (!complaint) return 'OTHER';
  const normalized = complaint.toLowerCase();

  if (hasRespiratoryComplaint(normalized)) return 'RESPIRATORY';
  if (hasCardiacComplaint(normalized)) return 'CARDIAC';

  if (/\b(seizure|stroke|altered\s+mental|unresponsive|syncope|fainting|dizziness|confusion|delirium|headache|weakness|numbness|loss\s+of\s+consciousness)\b/.test(normalized)) {
    return 'NEURO';
  }

  if (/\b(allergic|anaphylaxis|swelling|hives|rash|sting|bite)\b/.test(normalized)) {
    return 'ALLERGIC';
  }

  if (/\b(fall|fracture|laceration|bleeding|trauma|accident|injury|cut|wound|burn|assault|collision)\b/.test(normalized)) {
    return 'TRAUMA';
  }

  if (/\b(abdominal\s+pain|stomach\s+pain|belly\s+pain|flank\s+pain|appendix|appendicitis)\b/.test(normalized)) {
    return 'ABDOMINAL';
  }

  if (/\b(vomiting|nausea|diarrhea|rectal\s+bleeding|blood\s+in\s+stool|hematemesis|gi\s+bleed)\b/.test(normalized)) {
    return 'GI';
  }

  if (/\b(fever|chills|cold|flu|infection|sweats)\b/.test(normalized)) {
    return 'FEVER';
  }

  if (/\b(pain|ache|sore|discomfort)\b/.test(normalized)) {
    return 'PAIN';
  }

  return 'OTHER';
}

export interface ObservedCueFeatures {
  hasLevineSign: boolean;
  hasRespiratoryDistress: boolean;
  hasStridor: boolean;
  hasCyanosis: boolean;
  hasConfusionDelirium: boolean;
  hasPallor: boolean;
  hasDiaphoresis: boolean;
  hasCapillaryRefillAbnormality: boolean;
}

/**
 * Extracts structured boolean feature flags from observed clinical cues.
 */
export function extractObservedCueFeatures(cues: string[] = []): ObservedCueFeatures {
  const normalized = cues.map(c => c.toLowerCase());
  return {
    hasLevineSign: normalized.some(c => c.includes('levine') || c.includes('clenched fist')),
    hasRespiratoryDistress: normalized.some(c => c.includes('respiratory distress')),
    hasStridor: normalized.some(c => c.includes('stridor')),
    hasCyanosis: normalized.some(c => c.includes('cyanotic') || c.includes('cyanosis')),
    hasConfusionDelirium: normalized.some(c => c.includes('confusion') || c.includes('delirium') || c.includes('altered mental')),
    hasPallor: normalized.some(c => c.includes('pallor')),
    hasDiaphoresis: normalized.some(c => c.includes('sweating') || c.includes('diaphoresis')),
    hasCapillaryRefillAbnormality: normalized.some(c => c.includes('capillary refill')),
  };
}

const PRIORITY_RANK: Record<TriageLevelCode, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
  NON_URGENT: 4
};

export interface HybridTriageResult {
  finalPriority: TriageLevelCode;
  rulePriority: TriageLevelCode;
  mlPrediction: MLPrediction | null;
  hybridDecision: HybridDecision;
  disagreementEventRequired: boolean;
  safetyFloorEventRequired: boolean;
}

/**
 * Evaluates the safety-first hybrid triage fusion between deterministic rules and XGBoost.
 * INVARIANT: A deterministic CRITICAL safety floor can NEVER be downgraded by ML.
 */
export function hybridTriageDecision(
  rulePriority: TriageLevelCode,
  isRedFlagState: boolean,
  mlPrediction: MLPrediction | null
): HybridTriageResult {
  const ruleRank = PRIORITY_RANK[rulePriority];

  // Fallback to deterministic rules if ML model is unavailable
  if (!mlPrediction) {
    return {
      finalPriority: rulePriority,
      rulePriority,
      mlPrediction: null,
      hybridDecision: {
        finalPriority: rulePriority,
        rulePriority,
        isSafetyFloorEnforced: isRedFlagState,
        isDisagreement: false,
        reason: 'AI model unavailable — deterministic safety engine active.',
        policyApplied: 'FALLBACK_DETERMINISTIC_ONLY'
      },
      disagreementEventRequired: false,
      safetyFloorEventRequired: false
    };
  }

  const mlRank = PRIORITY_RANK[mlPrediction.predictedClass];
  const isMlDowngrade = mlRank > ruleRank; // Rule indicates higher acuity than ML
  const isMlUpgrade = mlRank < ruleRank;   // ML indicates higher acuity than Rule

  // RULE 1: Hard Deterministic Safety Floor (CRITICAL)
  if (isRedFlagState || rulePriority === 'CRITICAL') {
    const isSafetyFloorEnforced = mlPrediction.predictedClass !== 'CRITICAL';
    return {
      finalPriority: 'CRITICAL',
      rulePriority: 'CRITICAL',
      mlPrediction,
      hybridDecision: {
        finalPriority: 'CRITICAL',
        rulePriority: 'CRITICAL',
        mlPriority: mlPrediction.predictedClass,
        isSafetyFloorEnforced,
        isDisagreement: isSafetyFloorEnforced,
        reason: isSafetyFloorEnforced
          ? 'Deterministic safety rules prevented an ML downgrade.'
          : 'Safety rules and ML model both identified life-threatening acuity.',
        policyApplied: 'DETERMINISTIC_SAFETY_FLOOR_CRITICAL'
      },
      disagreementEventRequired: isSafetyFloorEnforced,
      safetyFloorEventRequired: isSafetyFloorEnforced
    };
  }

  // RULE 2: ML Upgrade for Safety (Nonlinear interaction captured by ML)
  if (isMlUpgrade) {
    return {
      finalPriority: mlPrediction.predictedClass,
      rulePriority,
      mlPrediction,
      hybridDecision: {
        finalPriority: mlPrediction.predictedClass,
        rulePriority,
        mlPriority: mlPrediction.predictedClass,
        isSafetyFloorEnforced: false,
        isDisagreement: true,
        reason: 'Model predicted higher acuity than the deterministic rule engine.',
        policyApplied: 'ML_UPGRADE_FOR_SAFETY'
      },
      disagreementEventRequired: true,
      safetyFloorEventRequired: false
    };
  }

  // RULE 3: Rule Safety Override (Rule priority higher than ML prediction)
  if (isMlDowngrade) {
    return {
      finalPriority: rulePriority,
      rulePriority,
      mlPrediction,
      hybridDecision: {
        finalPriority: rulePriority,
        rulePriority,
        mlPriority: mlPrediction.predictedClass,
        isSafetyFloorEnforced: true,
        isDisagreement: true,
        reason: 'Deterministic rule priority preserved over lower ML prediction for clinical safety.',
        policyApplied: 'RULE_SAFETY_OVERRIDE'
      },
      disagreementEventRequired: true,
      safetyFloorEventRequired: false
    };
  }

  // RULE 4: Concordant Recommendation
  return {
    finalPriority: rulePriority,
    rulePriority,
    mlPrediction,
    hybridDecision: {
      finalPriority: rulePriority,
      rulePriority,
      mlPriority: mlPrediction.predictedClass,
      isSafetyFloorEnforced: false,
      isDisagreement: false,
      reason: 'Deterministic rule engine and ML model reached concordant triage recommendations.',
      policyApplied: 'CONCORDANT'
    },
    disagreementEventRequired: false,
    safetyFloorEventRequired: false
  };
}

export interface EvaluatedPatientResult {
  updatedPatient: Patient;
  reassessmentAlertTriggered: boolean;
  deteriorationAlertTriggered: boolean;
  disagreementAlertTriggered: boolean;
  safetyFloorAlertTriggered: boolean;
}

/**
 * PatientTriage.ai Hybrid Decision Engine
 * 
 * Layer 1: Deterministic Safety Rules (Red Flags)
 * Layer 2: Transparent Weighted Risk Score (0-100)
 * Layer 3: Uncertainty Assessment & Safety Bias ("When uncertain, do not downgrade")
 * Layer 4: Clinician Review Control
 */
export function evaluatePatientTriage(
  patient: Patient,
  redFlagThresholds: RedFlagThresholds = DEFAULT_RED_FLAG_THRESHOLDS,
  waitThresholds: WaitThresholds = DEFAULT_WAIT_THRESHOLDS
): EvaluatedPatientResult {
  const ageConfig = AGE_GROUP_CONFIGS[patient.ageGroup] || AGE_GROUP_CONFIGS.ADULT;
  let reassessmentAlertTriggered = false;
  let deteriorationAlertTriggered = false;

  // ----------------------------------------------------
  // 1. DATA COMPLETENESS & UNCERTAINTY (UNKNOWN ≠ NORMAL)
  // ----------------------------------------------------
  let presentFieldsCount = 0;
  const totalFieldsCount = 9; // SpO2, HR, BP, RR, Temp, ChiefComplaint, Symptoms, History, Allergies
  const missingInputs: string[] = [];
  const uncertaintyDrivers: UncertaintyDriver[] = [];

  const vitals = patient.currentVitals;
  if (vitals.spo2 !== null) presentFieldsCount++; else missingInputs.push('SpO₂ reading unavailable');
  if (vitals.heartRate !== null) presentFieldsCount++; else missingInputs.push('Heart rate unavailable');
  if (vitals.systolicBp !== null) presentFieldsCount++; else missingInputs.push('Blood pressure unavailable (UNKNOWN ≠ NORMAL)');
  if (vitals.respiratoryRate !== null) presentFieldsCount++; else missingInputs.push('Respiratory rate unavailable');
  if (vitals.temperature !== null) presentFieldsCount++;

  if (patient.chiefComplaint && patient.chiefComplaint.trim().length > 0) presentFieldsCount++;
  if (patient.associatedSymptoms && patient.associatedSymptoms.length > 0) presentFieldsCount++;
  
  if (!patient.hasNoHistoryRecord && patient.medicalHistory && patient.medicalHistory.length > 0) {
    presentFieldsCount++;
  } else if (patient.hasNoHistoryRecord) {
    missingInputs.push('Medical history record UNAVAILABLE (Zero history)');
    uncertaintyDrivers.push({
      factor: 'Zero Medical History',
      impact: 'High',
      description: 'Patient unrepresented in hospital health records database'
    });
  }

  if (patient.allergies && patient.allergies.length > 0) presentFieldsCount++;

  const completenessPercent = Math.round((presentFieldsCount / totalFieldsCount) * 100);

  // Compute Uncertainty Level
  let uncertaintyLevel: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW';
  let confidenceScore = Math.min(98, Math.max(40, completenessPercent + 10));

  if (completenessPercent < 55 || patient.hasNoHistoryRecord || missingInputs.length >= 3) {
    uncertaintyLevel = 'HIGH';
    confidenceScore = Math.min(65, confidenceScore);
  } else if (completenessPercent < 78 || missingInputs.length >= 1) {
    uncertaintyLevel = 'MODERATE';
    confidenceScore = Math.min(82, confidenceScore);
  }

  if (missingInputs.length > 0) {
    missingInputs.forEach(input => {
      if (!uncertaintyDrivers.some(d => d.description.includes(input))) {
        uncertaintyDrivers.push({
          factor: 'Missing Input',
          impact: uncertaintyLevel === 'HIGH' ? 'High' : 'Moderate',
          description: input
        });
      }
    });
  }

  // ----------------------------------------------------
  // 2. LAYER 1 — DETERMINISTIC RED-FLAG SAFETY RULES
  // ----------------------------------------------------
  const redFlagsTriggered: string[] = [];
  
  if (vitals.spo2 !== null && vitals.spo2 < redFlagThresholds.spo2Critical) {
    redFlagsTriggered.push(`Critical Hypoxemia (SpO₂ ${vitals.spo2}% < ${redFlagThresholds.spo2Critical}%)`);
  }
  if (vitals.systolicBp !== null && vitals.systolicBp < redFlagThresholds.systolicBpCriticalLow) {
    redFlagsTriggered.push(`Critical Hypotension (SBP ${vitals.systolicBp} mmHg < ${redFlagThresholds.systolicBpCriticalLow} mmHg)`);
  }
  if (vitals.systolicBp !== null && vitals.systolicBp >= redFlagThresholds.systolicBpCriticalHigh) {
    redFlagsTriggered.push(`Critical Hypertension (SBP ${vitals.systolicBp} mmHg >= ${redFlagThresholds.systolicBpCriticalHigh} mmHg)`);
  }
  if (vitals.respiratoryRate !== null && vitals.respiratoryRate >= redFlagThresholds.respiratoryRateCriticalHigh) {
    redFlagsTriggered.push(`Severe Tachypnea (RR ${vitals.respiratoryRate} /min)`);
  }
  if (vitals.heartRate !== null && vitals.heartRate >= redFlagThresholds.heartRateCriticalHigh) {
    redFlagsTriggered.push(`Critical Tachycardia (HR ${vitals.heartRate} bpm >= ${redFlagThresholds.heartRateCriticalHigh} bpm)`);
  }
  if (vitals.heartRate !== null && vitals.heartRate <= redFlagThresholds.heartRateCriticalLow) {
    redFlagsTriggered.push(`Critical Bradycardia (HR ${vitals.heartRate} bpm <= ${redFlagThresholds.heartRateCriticalLow} bpm)`);
  }
  if (vitals.temperature !== null && vitals.temperature >= redFlagThresholds.temperatureCriticalHigh) {
    redFlagsTriggered.push(`Critical Hyperthermia (Temp ${vitals.temperature}°C >= ${redFlagThresholds.temperatureCriticalHigh}°C)`);
  }
  if (vitals.temperature !== null && vitals.temperature <= redFlagThresholds.temperatureCriticalLow) {
    redFlagsTriggered.push(`Critical Hypothermia (Temp ${vitals.temperature}°C <= ${redFlagThresholds.temperatureCriticalLow}°C)`);
  }

  const cueFeatures = extractObservedCueFeatures(patient.observedCues);
  if (
    cueFeatures.hasStridor ||
    cueFeatures.hasRespiratoryDistress ||
    cueFeatures.hasCyanosis ||
    cueFeatures.hasConfusionDelirium
  ) {
    const triggeredCues: string[] = [];
    if (cueFeatures.hasStridor) triggeredCues.push('Stridor');
    if (cueFeatures.hasRespiratoryDistress) triggeredCues.push('Respiratory Distress');
    if (cueFeatures.hasCyanosis) triggeredCues.push('Cyanosis');
    if (cueFeatures.hasConfusionDelirium) triggeredCues.push('Confusion/Delirium');
    redFlagsTriggered.push(`Severe Clinical Distress Cues (${triggeredCues.join(', ')})`);
  }

  const isRedFlagState = redFlagsTriggered.length > 0;

  // ----------------------------------------------------
  // 3. LAYER 2 — TRANSPARENT WEIGHTED RISK SCORE (0-100)
  // ----------------------------------------------------
  const riskFactors: RiskFactor[] = [];
  let baseScore = 0;

  // SpO2 score
  if (vitals.spo2 !== null) {
    if (vitals.spo2 < 88) {
      baseScore += PROTOTYPE_RISK_WEIGHTS.spo2Abnormality;
      riskFactors.push({ name: 'SpO₂ Abnormality (<88%)', contribution: PROTOTYPE_RISK_WEIGHTS.spo2Abnormality, description: `Critical arterial desaturation (${vitals.spo2}%)`, isRedFlag: true });
    } else if (vitals.spo2 <= 92) {
      const contrib = Math.round(PROTOTYPE_RISK_WEIGHTS.spo2Abnormality * 0.75);
      baseScore += contrib;
      riskFactors.push({ name: 'SpO₂ Abnormality (88-92%)', contribution: contrib, description: `Moderate hypoxemia (${vitals.spo2}%)` });
    } else if (vitals.spo2 <= 94) {
      const contrib = Math.round(PROTOTYPE_RISK_WEIGHTS.spo2Abnormality * 0.4);
      baseScore += contrib;
      riskFactors.push({ name: 'SpO₂ Abnormality (93-94%)', contribution: contrib, description: `Mild hypoxemia (${vitals.spo2}%)` });
    }
  } else {
    // UNKNOWN ≠ NORMAL penalty
    const penalty = 12;
    baseScore += penalty;
    riskFactors.push({ name: 'Missing SpO₂ Input (UNKNOWN ≠ NORMAL)', contribution: penalty, description: 'Unassessed arterial oxygenation increases uncertainty penalty' });
  }

  // Respiratory rate & symptoms
  if (vitals.respiratoryRate !== null && vitals.respiratoryRate >= 26) {
    baseScore += PROTOTYPE_RISK_WEIGHTS.respiratorySymptoms;
    riskFactors.push({ name: 'Tachypnea & Respiratory Distress', contribution: PROTOTYPE_RISK_WEIGHTS.respiratorySymptoms, description: `Elevated respiratory rate (${vitals.respiratoryRate}/min)` });
  } else if (hasRespiratoryComplaint(patient.chiefComplaint)) {
    const contrib = Math.round(PROTOTYPE_RISK_WEIGHTS.respiratorySymptoms * 0.7);
    baseScore += contrib;
    riskFactors.push({ name: 'Respiratory Complaint', contribution: contrib, description: 'Acute dyspnea reported' });
  }

  // Temperature abnormality scoring (fever or hypothermia)
  if (vitals.temperature !== null && (vitals.temperature >= 38.5 || vitals.temperature < 36.0)) {
    baseScore += PROTOTYPE_RISK_WEIGHTS.temperatureAbnormality;
    riskFactors.push({
      name: 'Temperature Abnormality',
      contribution: PROTOTYPE_RISK_WEIGHTS.temperatureAbnormality,
      description: `Abnormal core body temperature (${vitals.temperature}°C)`
    });
  }

  // Observed distress cues
  if (patient.observedCues.length > 0) {
    const cueScore = Math.min(18, patient.observedCues.length * PROTOTYPE_RISK_WEIGHTS.observedDistress);
    baseScore += cueScore;
    riskFactors.push({ name: 'Observed Clinical Distress Cues', contribution: cueScore, description: patient.observedCues.join(', ') });
  }

  // Age factor
  const ageContrib = Math.round(PROTOTYPE_RISK_WEIGHTS.ageFactor * ageConfig.riskWeightMultiplier);
  baseScore += ageContrib;
  riskFactors.push({ name: `Age Factor (${ageConfig.label})`, contribution: ageContrib, description: `Age weight multiplier ${ageConfig.riskWeightMultiplier}x applied` });

  // Medical history & comorbidities
  if (patient.medicalHistory && patient.medicalHistory.length > 0) {
    const histContrib = Math.min(16, patient.medicalHistory.length * PROTOTYPE_RISK_WEIGHTS.history);
    baseScore += histContrib;
    riskFactors.push({ name: 'Pre-existing Medical History', contribution: histContrib, description: patient.medicalHistory.join(', ') });
  } else if (patient.hasNoHistoryRecord) {
    const penalty = 14;
    baseScore += penalty;
    riskFactors.push({ name: 'Zero History Uncertainty Penalty', contribution: penalty, description: 'Absence of prior health records increases baseline safety weight' });
  }

  // Heart rate & BP abnormalities
  if (vitals.heartRate !== null && (vitals.heartRate > 110 || vitals.heartRate < 50)) {
    baseScore += PROTOTYPE_RISK_WEIGHTS.heartRateAbnormality;
    riskFactors.push({ name: 'Heart Rate Abnormality', contribution: PROTOTYPE_RISK_WEIGHTS.heartRateAbnormality, description: `Abnormal pulse rate (${vitals.heartRate} bpm)` });
  }

  if (vitals.systolicBp !== null && (vitals.systolicBp > 160 || vitals.systolicBp < 90)) {
    baseScore += PROTOTYPE_RISK_WEIGHTS.bpAbnormality;
    riskFactors.push({ name: 'Blood Pressure Abnormality', contribution: PROTOTYPE_RISK_WEIGHTS.bpAbnormality, description: `Abnormal systolic BP (${vitals.systolicBp} mmHg)` });
  }

  const rawRiskScore = Math.min(99, Math.max(10, Math.round(baseScore)));

  // ----------------------------------------------------
  // 4. LAYER 3 — UNCERTAINTY & SAFETY-FIRST ESCALATION
  // ----------------------------------------------------
  let calculatedPriority: TriageLevelCode = 'LOW';
  let safetyEscalatedDueToUncertainty = false;

  if (isRedFlagState || rawRiskScore >= 90) {
    calculatedPriority = 'CRITICAL';
  } else if (rawRiskScore >= 70) {
    calculatedPriority = 'HIGH';
  } else if (rawRiskScore >= 45) {
    calculatedPriority = 'MEDIUM';
  } else if (rawRiskScore >= 25) {
    calculatedPriority = 'LOW';
  } else {
    calculatedPriority = 'NON_URGENT';
  }

  // "When uncertain, do not downgrade" safety principle
  if (uncertaintyLevel === 'HIGH' && calculatedPriority !== 'CRITICAL') {
    if (calculatedPriority === 'LOW' || calculatedPriority === 'NON_URGENT') {
      calculatedPriority = 'MEDIUM';
      safetyEscalatedDueToUncertainty = true;
    } else if (calculatedPriority === 'MEDIUM') {
      calculatedPriority = 'HIGH';
      safetyEscalatedDueToUncertainty = true;
    }
  }

  // ----------------------------------------------------
  // 5. LAYER 4 — XGBOOST ML DECISION SUPPORT & HYBRID FUSION
  // ----------------------------------------------------
  const mlPrediction = predictPatientAcuity(patient);
  const hybridRes = hybridTriageDecision(calculatedPriority, isRedFlagState, mlPrediction);

  if (hybridRes.hybridDecision.isDisagreement) {
    uncertaintyLevel = 'HIGH';
  }

  // ----------------------------------------------------
  // 6. DETERIORATION DETECTION & EVIDENCE DIFF ("WHAT CHANGED?")
  // ----------------------------------------------------
  let recentDeteriorationDetected = patient.recentDeteriorationDetected || false;
  const vitalDeltas: VitalDelta[] = patient.vitalDeltas || [];
  let whyNowReason = patient.whyNowReason;

  if (patient.vitalsHistory && patient.vitalsHistory.length > 0) {
    const prev = patient.vitalsHistory[patient.vitalsHistory.length - 1];
    const curr = patient.currentVitals;

    const deltas: VitalDelta[] = [];

    if (prev.spo2 !== null && curr.spo2 !== null && curr.spo2 < prev.spo2) {
      const drop = prev.spo2 - curr.spo2;
      deltas.push({
        field: 'spo2',
        label: 'SpO₂',
        previousValue: `${prev.spo2}%`,
        currentValue: `${curr.spo2}%`,
        deltaText: `↓ ${drop}%`,
        isWorse: drop >= 3
      });
      if (drop >= 3) recentDeteriorationDetected = true;
    }

    if (prev.heartRate !== null && curr.heartRate !== null && curr.heartRate > prev.heartRate) {
      const spike = curr.heartRate - prev.heartRate;
      deltas.push({
        field: 'heartRate',
        label: 'Heart Rate',
        previousValue: `${prev.heartRate} bpm`,
        currentValue: `${curr.heartRate} bpm`,
        deltaText: `↑ ${spike}`,
        isWorse: spike >= 15
      });
      if (spike >= 15) recentDeteriorationDetected = true;
    }

    if (prev.respiratoryRate !== null && curr.respiratoryRate !== null && curr.respiratoryRate > prev.respiratoryRate) {
      const inc = curr.respiratoryRate - prev.respiratoryRate;
      deltas.push({
        field: 'respiratoryRate',
        label: 'Resp Rate',
        previousValue: `${prev.respiratoryRate}/min`,
        currentValue: `${curr.respiratoryRate}/min`,
        deltaText: `↑ ${inc}`,
        isWorse: inc >= 6
      });
      if (inc >= 6) recentDeteriorationDetected = true;
    }

    if (deltas.length > 0) {
      vitalDeltas.length = 0;
      vitalDeltas.push(...deltas);
    }
  }

  // ----------------------------------------------------
  // 7. WAIT-TIME SAFETY LOGIC & MONITORING STATE
  // ----------------------------------------------------
  let monitoringState: MonitoringState = 'SAFE';
  let monitoringReasonCode: MonitoringReasonCode = 'NONE';
  let whyNowTitle: string | undefined = undefined;

  // Check wait thresholds using hybrid priority
  const effectivePriority = hybridRes.finalPriority;
  let maxAllowedWait = waitThresholds.medium;
  if (effectivePriority === 'CRITICAL') maxAllowedWait = waitThresholds.critical;
  else if (effectivePriority === 'HIGH') maxAllowedWait = waitThresholds.high;
  else if (effectivePriority === 'MEDIUM') maxAllowedWait = waitThresholds.medium;
  else maxAllowedWait = waitThresholds.low;

  const waitThresholdExceeded = patient.elapsedWaitMinutes > maxAllowedWait && maxAllowedWait > 0;

  // Exact Prioritized Determination of Monitoring State & Why-Now Reason
  if (recentDeteriorationDetected) {
    monitoringState = 'ESCALATE';
    monitoringReasonCode = 'DETERIORATION';
    whyNowTitle = 'Deterioration Detected';
    deteriorationAlertTriggered = true;
    const deltaSummary = vitalDeltas.map(d => `${d.label} ${d.deltaText}`).join('; ');
    whyNowReason = deltaSummary
      ? `Vital trend deterioration: ${deltaSummary} recorded ${patient.lastVitalsUpdateMinutesAgo}m ago.`
      : `Deterioration detected: Worsening vitals recorded ${patient.lastVitalsUpdateMinutesAgo}m ago.`;
  } else if (isRedFlagState || calculatedPriority === 'CRITICAL') {
    monitoringState = 'ESCALATE';
    monitoringReasonCode = 'SAFETY_RED_FLAG';
    whyNowTitle = 'Safety Floor Triggered';
    const redFlagDescriptions = riskFactors.filter(r => r.isRedFlag).map(r => r.name);
    whyNowReason = redFlagDescriptions.length > 0
      ? `Deterministic red flag detected: ${redFlagDescriptions.join(', ')}. Deterministic safety rules enforce CRITICAL priority.`
      : `Deterministic safety rules identified critical physiological red flag. Immediate safety floor enforced.`;
  } else if (waitThresholdExceeded) {
    monitoringState = 'REASSESS';
    monitoringReasonCode = 'WAIT_TIME_EXCEEDED';
    whyNowTitle = 'Waiting-Time Threshold Exceeded';
    reassessmentAlertTriggered = true;
    whyNowReason = `Patient has waited ${patient.elapsedWaitMinutes} minutes; configured ${effectivePriority}-priority reassessment threshold is ${maxAllowedWait} minutes.`;
  } else if (hybridRes.hybridDecision.policyApplied === 'ML_UPGRADE_FOR_SAFETY' && mlPrediction) {
    // Advisory model predicted higher acuity than rules
    monitoringState = effectivePriority === 'CRITICAL' ? 'ESCALATE' : 'WATCH';
    monitoringReasonCode = 'MODEL_RULE_DISAGREEMENT';
    whyNowTitle = 'Advisory Model Disagreement';
    whyNowReason = `Deterministic rules classify this patient as ${calculatedPriority} (Risk ${rawRiskScore}/100), while XGBoost predicts ${mlPrediction.predictedClass} (${((mlPrediction.topProbability || 0) * 100).toFixed(1)}%). Clinician review is recommended because the advisory model indicates potentially higher acuity.`;
  } else if (uncertaintyLevel === 'HIGH' || safetyEscalatedDueToUncertainty) {
    monitoringState = 'WATCH';
    monitoringReasonCode = 'HIGH_UNCERTAINTY';
    whyNowTitle = 'High Uncertainty Review';
    whyNowReason = `High uncertainty assessment due to ${uncertaintyDrivers.map(d => d.factor).join(', ') || 'incomplete clinical inputs'}. Cautious clinician review recommended.`;
  } else if (effectivePriority === 'HIGH') {
    monitoringState = 'WATCH';
    monitoringReasonCode = 'NONE';
    whyNowTitle = undefined;
    whyNowReason = undefined;
  } else {
    monitoringState = 'SAFE';
    monitoringReasonCode = 'NONE';
    whyNowTitle = undefined;
    whyNowReason = undefined;
  }

  // Respect Clinician Override if applied
  const finalPriority = patient.overrideApplied && patient.overrideInfo 
    ? patient.overrideInfo.newPriority 
    : effectivePriority;

  const updatedPatient: Patient = {
    ...patient,
    priority: finalPriority,
    previousPriority: patient.priority !== finalPriority ? patient.priority : patient.previousPriority,
    riskScore: rawRiskScore,
    previousRiskScore: patient.riskScore !== rawRiskScore ? patient.riskScore : patient.previousRiskScore,
    confidence: confidenceScore,
    uncertainty: uncertaintyLevel,
    dataCompleteness: completenessPercent,
    dataReliability: completenessPercent >= 80 ? 'HIGH' : completenessPercent >= 60 ? 'MEDIUM' : 'LOW',
    missingCriticalInputs: missingInputs,
    monitoringState,
    monitoringReasonCode,
    safetyEscalatedDueToUncertainty,
    whyNowTitle,
    whyNowReason,
    recentDeteriorationDetected,
    vitalDeltas,
    riskFactors,
    uncertaintyDrivers,
    mlPrediction: mlPrediction || undefined,
    hybridDecision: hybridRes.hybridDecision,
  };

  return {
    updatedPatient,
    reassessmentAlertTriggered,
    deteriorationAlertTriggered,
    disagreementAlertTriggered: hybridRes.disagreementEventRequired,
    safetyFloorAlertTriggered: hybridRes.safetyFloorEventRequired,
  };
}
