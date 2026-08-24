import { Patient, TriageLevelCode, MonitoringState, VitalDelta, RiskFactor, UncertaintyDriver } from '../types';
import { PROTOTYPE_RISK_WEIGHTS } from '../config/riskWeights';
import { DEFAULT_RED_FLAG_THRESHOLDS, DEFAULT_WAIT_THRESHOLDS, RedFlagThresholds, WaitThresholds } from '../config/prototypeThresholds';
import { AGE_GROUP_CONFIGS } from '../config/ageGroupConfig';

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


export interface EvaluatedPatientResult {
  updatedPatient: Patient;
  reassessmentAlertTriggered: boolean;
  deteriorationAlertTriggered: boolean;
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
  if (patient.observedCues.some(c => c.toLowerCase().includes('stridor') || c.toLowerCase().includes('respiratory distress') || c.toLowerCase().includes('cyanotic'))) {
    redFlagsTriggered.push('Severe Airway / Respiratory Distress Cues');
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

  // Observed distress cues
  if (patient.observedCues.length > 0) {
    const cueScore = Math.min(18, patient.observedCues.length * 6);
    baseScore += cueScore;
    riskFactors.push({ name: 'Observed Clinical Distress Cues', contribution: cueScore, description: patient.observedCues.join(', ') });
  }

  // Age factor
  const ageContrib = Math.round(PROTOTYPE_RISK_WEIGHTS.ageFactor * ageConfig.riskWeightMultiplier);
  baseScore += ageContrib;
  riskFactors.push({ name: `Age Factor (${ageConfig.label})`, contribution: ageContrib, description: `Age weight multiplier ${ageConfig.riskWeightMultiplier}x applied` });

  // Medical history & comorbidities
  if (patient.medicalHistory && patient.medicalHistory.length > 0) {
    const histContrib = Math.min(16, patient.medicalHistory.length * 4);
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
  // 5. DETERIORATION DETECTION & EVIDENCE DIFF ("WHAT CHANGED?")
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
  // 6. WAIT-TIME SAFETY LOGIC & MONITORING STATE
  // ----------------------------------------------------
  let monitoringState: MonitoringState = 'SAFE';

  // Check wait thresholds
  let maxAllowedWait = waitThresholds.medium;
  if (calculatedPriority === 'CRITICAL') maxAllowedWait = waitThresholds.critical;
  else if (calculatedPriority === 'HIGH') maxAllowedWait = waitThresholds.high;
  else if (calculatedPriority === 'MEDIUM') maxAllowedWait = waitThresholds.medium;
  else maxAllowedWait = waitThresholds.low;

  const waitThresholdExceeded = patient.elapsedWaitMinutes > maxAllowedWait && maxAllowedWait > 0;

  if (recentDeteriorationDetected || isRedFlagState || calculatedPriority === 'CRITICAL') {
    monitoringState = 'ESCALATE';
    if (recentDeteriorationDetected) {
      deteriorationAlertTriggered = true;
      whyNowReason = `Deterioration detected: Vitals worsening recorded ${patient.lastVitalsUpdateMinutesAgo}m ago`;
    }
  } else if (waitThresholdExceeded) {
    monitoringState = 'REASSESS';
    reassessmentAlertTriggered = true;
    whyNowReason = `Elapsed wait time (${patient.elapsedWaitMinutes}m) exceeds prototype ${calculatedPriority} threshold (${maxAllowedWait}m)`;
  } else if (uncertaintyLevel === 'HIGH' || calculatedPriority === 'HIGH') {
    monitoringState = 'WATCH';
  } else {
    monitoringState = 'SAFE';
  }

  // Respect Clinician Override if applied
  const finalPriority = patient.overrideApplied && patient.overrideInfo 
    ? patient.overrideInfo.newPriority 
    : calculatedPriority;

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
    safetyEscalatedDueToUncertainty,
    whyNowReason,
    recentDeteriorationDetected,
    vitalDeltas,
    riskFactors,
    uncertaintyDrivers,
  };

  return {
    updatedPatient,
    reassessmentAlertTriggered,
    deteriorationAlertTriggered,
  };
}
