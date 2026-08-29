import { Patient, MLPrediction, FeatureContribution, TriageLevelCode } from '../types';
import { XGBOOST_TREES_V2, BASE_MARGINS_V2, GLOBAL_SHAP_IMPORTANCE_V2, MODEL_METADATA_V2 } from './modelData';

const CLASS_NAMES: TriageLevelCode[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'NON_URGENT'];

/**
 * Negation-protected text search helper.
 */
function containsWithNegationProtection(text: string, patternRegex: RegExp): boolean {
  if (!patternRegex.test(text)) return false;
  
  const negationPrefix = /(?:no|denies|without|negative\s+for|r\/o|rule\s+out)\s+(?:[\w\d]+\s+){0,3}/i;
  const match = text.match(patternRegex);
  if (!match || match.index === undefined) return false;
  
  const preText = text.slice(Math.max(0, match.index - 40), match.index);
  if (negationPrefix.test(preText)) {
    return false;
  }
  return true;
}

/**
 * Extracts 71 domain-robust numerical features from a Patient entity matching XGBoost V2 schema.
 */
export function extractPatientFeatures(patient: Patient): Record<string, number | null> {
  const v = patient.currentVitals;
  const feats: Record<string, number | null> = {};

  // 1. Objective Vitals & Demographics
  feats['temperature_c'] = v.temperature !== null && v.temperature !== undefined ? v.temperature : null;
  feats['heart_rate_bpm'] = v.heartRate !== null && v.heartRate !== undefined ? v.heartRate : null;
  feats['resp_rate_bpm'] = v.respiratoryRate !== null && v.respiratoryRate !== undefined ? v.respiratoryRate : null;
  feats['spo2_pct'] = v.spo2 !== null && v.spo2 !== undefined ? v.spo2 : null;
  feats['sbp_mmhg'] = v.systolicBp !== null && v.systolicBp !== undefined ? v.systolicBp : null;
  feats['dbp_mmhg'] = v.diastolicBp !== null && v.diastolicBp !== undefined ? v.diastolicBp : null;

  feats['pain_score'] = patient.symptomSeverity !== null && patient.symptomSeverity !== undefined ? patient.symptomSeverity : 0.0;
  feats['symptom_duration_hours'] = patient.symptomDurationHours !== null && patient.symptomDurationHours !== undefined ? patient.symptomDurationHours : 4.0;

  feats['age'] = patient.age !== null && patient.age !== undefined ? patient.age : 45.0;
  feats['sex_male'] = patient.gender === 'M' ? 1 : 0;
  feats['is_geriatric'] = (feats['age'] || 45) >= 65 ? 1 : 0;
  feats['is_pediatric'] = (feats['age'] || 45) < 18 ? 1 : 0;

  // 2. Pain Context Features (De-biasing zero-pain)
  feats['pain_missing'] = patient.symptomSeverity === null || patient.symptomSeverity === undefined ? 1 : 0;
  feats['missing_pain'] = feats['pain_missing'];
  feats['pain_present'] = (feats['pain_score'] || 0) > 0 ? 1 : 0;
  feats['pain_severe'] = (feats['pain_score'] || 0) >= 7 ? 1 : 0;

  // Text aggregation
  const cc = (patient.chiefComplaint || '').toLowerCase();
  const assoc = (patient.associatedSymptoms || []).join(' ').toLowerCase();
  const cues = (patient.observedCues || []).join(' ').toLowerCase();
  const hist = (patient.medicalHistory || []).join(' ').toLowerCase();
  const combinedComplaint = `${cc} ${assoc}`;
  const combinedAll = `${cc} ${assoc} ${cues} ${hist}`;

  feats['pain_zero_with_symptoms'] = (feats['pain_score'] === 0 && combinedComplaint.length > 3) ? 1 : 0;

  // 3. Chief Complaint Clinical Concept Extraction
  feats['feat_chest_pain'] = containsWithNegationProtection(combinedComplaint, /chest\s+pain|pain\s+in\s+chest|chest\s+tightness|chest\s+pressure|angina|substernal/i) ? 1 : 0;
  feats['feat_palpitations'] = containsWithNegationProtection(combinedComplaint, /palpitation|flutter|rapid\s+heart|irregular\s+pulse/i) ? 1 : 0;
  feats['feat_cardiac_arrest_history'] = /cardiac\s+arrest|s\/p\s+arrest|resuscitation|cpr/i.test(combinedAll) ? 1 : 0;

  feats['feat_dyspnea'] = containsWithNegationProtection(combinedComplaint, /dyspnea|shortness\s+of\s+breath|sob|breathless|gasping|orthopnea|difficulty\s+breathing/i) ? 1 : 0;
  feats['feat_respiratory_distress'] = /respiratory\s+distress|accessory\s+muscle|retraction|tripod/i.test(combinedAll) ? 1 : 0;
  feats['feat_stridor'] = /stridor|severe\s+airway|croup/i.test(combinedAll) ? 1 : 0;
  feats['feat_wheezing'] = containsWithNegationProtection(combinedComplaint, /wheez|bronchospasm|asthma\s+exacerbation/i) ? 1 : 0;
  feats['feat_cough'] = containsWithNegationProtection(combinedComplaint, /cough|hemoptysis|sputum|productive\s+cough/i) ? 1 : 0;

  feats['feat_altered_mental_status'] = /altered\s+mental|confusion|delirium|unresponsive|letharg|obtund|encephalopathy|disoriented/i.test(combinedAll) ? 1 : 0;
  feats['feat_stroke_weakness_droop'] = /stroke|facial\s+droop|slurred\s+speech|hemiparesis|weakness|ich|sdh|sah|intracranial\s+hemorrhage|t-spine/i.test(combinedAll) ? 1 : 0;
  feats['feat_seizure_syncope'] = /seizure|syncope|passed\s+out|blacked\s+out|postictal|convulsion/i.test(combinedAll) ? 1 : 0;
  feats['feat_dizziness'] = containsWithNegationProtection(combinedComplaint, /dizz|lighthead|vertigo|unsteady|loss\s+of\s+balance/i) ? 1 : 0;

  feats['feat_gi_bleed_hematemesis'] = /gi\s+bleed|hematemesis|coffee\s+ground|melena|hematochezia|vomiting\s+blood|rectal\s+bleed/i.test(combinedAll) ? 1 : 0;
  feats['feat_vomiting_nausea'] = containsWithNegationProtection(combinedComplaint, /vomit|emesis|nausea|n\/v/i) ? 1 : 0;
  feats['feat_abdominal_pain'] = containsWithNegationProtection(combinedComplaint, /abdominal|abd\s+pain|belly\s+pain|stomach\s+pain|flank\s+pain|appendix|peritonitis/i) ? 1 : 0;

  feats['feat_dka_hyperglycemia'] = /dka|diabetic\s+ketoacidosis|hyperglycemia|elevated\s+glucose|high\s+blood\s+sugar/i.test(combinedAll) ? 1 : 0;
  feats['feat_neutropenic_fever_sepsis'] = /neutropeni|sepsis|septic|bacteremia|urosepsis/i.test(combinedAll) ? 1 : 0;
  feats['feat_fever_symptoms'] = containsWithNegationProtection(combinedComplaint, /fever|febrile|chills|rigors|pyrexia|sweats/i) ? 1 : 0;

  feats['feat_fall_trauma_mvc'] = /fall|s\/p\s+fall|trauma|mvc|motor\s+vehicle|accident|head\s+injury|fracture|hit\s+by/i.test(combinedAll) ? 1 : 0;
  feats['feat_elevated_inr_coagulopathy'] = /elevated\s+inr|inr|coagulopathy|anticoagulat|bleeding\s+risk|warfarin|coumadin/i.test(combinedAll) ? 1 : 0;
  feats['feat_psych_suicidal_eval'] = /psych\s+eval|suicid|ideation|self\s+harm|overdose|ingestion|depression/i.test(combinedAll) ? 1 : 0;
  feats['feat_fatigue_weakness'] = containsWithNegationProtection(combinedComplaint, /fatigue|generalized\s+weakness|malaise|lethargy|abnormal\s+labs/i) ? 1 : 0;

  // 4. Clinical Signs & Observed Physical Cues
  feats['feat_cyanosis'] = /cyanosis|cyanotic|dusky/i.test(combinedAll) ? 1 : 0;
  feats['feat_diaphoresis'] = /diaphoresis|profuse\s+sweat|sweating|clammy/i.test(combinedAll) ? 1 : 0;
  feats['feat_pallor'] = /pallor|pale/i.test(cues) ? 1 : 0;
  feats['feat_levine_sign'] = /levine|clenched\s+fist/i.test(cues) ? 1 : 0;

  // 5. Physiological Derived Features
  const hr = feats['heart_rate_bpm'];
  const sbp = feats['sbp_mmhg'];
  const dbp = feats['dbp_mmhg'];
  const rr = feats['resp_rate_bpm'];
  const temp = feats['temperature_c'];
  const spo2 = feats['spo2_pct'];

  feats['shock_index'] = (sbp !== null && sbp > 0 && hr !== null) ? hr / sbp : null;
  feats['mean_arterial_pressure'] = (sbp !== null && dbp !== null) ? (sbp + 2.0 * dbp) / 3.0 : null;
  feats['pulse_pressure'] = (sbp !== null && dbp !== null) ? sbp - dbp : null;

  feats['hr_abnormality'] = (hr !== null && (hr > 100 || hr < 50)) ? 1 : 0;
  feats['rr_abnormality'] = (rr !== null && (rr >= 22 || rr < 10)) ? 1 : 0;
  feats['temp_abnormality'] = (temp !== null && (temp >= 38.0 || temp < 36.0)) ? 1 : 0;
  feats['spo2_hypoxemia'] = (spo2 !== null && spo2 < 92) ? 1 : 0;

  // 6. Nonlinear Clinical Interactions
  feats['interaction_cardiac_diaphoresis'] = (feats['feat_chest_pain'] && feats['feat_diaphoresis']) ? 1 : 0;
  feats['interaction_cardiac_vomiting'] = (feats['feat_chest_pain'] && feats['feat_vomiting_nausea']) ? 1 : 0;
  feats['interaction_hypoxemia_tachypnea'] = (feats['spo2_hypoxemia'] && feats['rr_abnormality']) ? 1 : 0;
  feats['interaction_fever_tachycardia'] = (feats['temp_abnormality'] && feats['hr_abnormality']) ? 1 : 0;
  feats['interaction_shock_tachycardia'] = (feats['shock_index'] !== null && feats['shock_index'] >= 0.9) ? 1 : 0;

  const anyVitalAbnl = feats['hr_abnormality'] || feats['rr_abnormality'] || feats['spo2_hypoxemia'] || (sbp !== null && sbp < 90);
  feats['interaction_altered_mental_abnormal_vitals'] = (feats['feat_altered_mental_status'] && anyVitalAbnl) ? 1 : 0;

  const highRiskCC = feats['feat_chest_pain'] || feats['feat_cardiac_arrest_history'] || feats['feat_altered_mental_status'] || feats['feat_stroke_weakness_droop'] || feats['feat_gi_bleed_hematemesis'] || feats['feat_dka_hyperglycemia'] || feats['feat_neutropenic_fever_sepsis'];
  const missingAnyKey = (spo2 === null || sbp === null || hr === null);
  feats['interaction_high_risk_complaint_missing_vitals'] = (highRiskCC && missingAnyKey) ? 1 : 0;

  feats['interaction_trauma_hypotension'] = (feats['feat_fall_trauma_mvc'] && sbp !== null && sbp < 100) ? 1 : 0;

  // 7. Explicit Missing-Data & Modality Flags (UNKNOWN != NORMAL)
  feats['missing_spo2'] = spo2 === null ? 1 : 0;
  feats['missing_sbp'] = sbp === null ? 1 : 0;
  feats['missing_dbp'] = dbp === null ? 1 : 0;
  feats['missing_hr'] = hr === null ? 1 : 0;
  feats['missing_rr'] = rr === null ? 1 : 0;
  feats['missing_temp'] = temp === null ? 1 : 0;

  const missingVitalCount = feats['missing_spo2'] + feats['missing_sbp'] + feats['missing_dbp'] + feats['missing_hr'] + feats['missing_rr'] + feats['missing_temp'] + feats['missing_pain'];
  feats['missing_vitals_count'] = missingVitalCount;
  feats['vitals_complete'] = missingVitalCount === 0 ? 1 : 0;

  feats['age_missing'] = patient.age === null || patient.age === undefined ? 1 : 0;
  feats['sex_missing'] = !patient.gender ? 1 : 0;
  feats['symptom_duration_missing'] = patient.symptomDurationHours === null || patient.symptomDurationHours === undefined ? 1 : 0;
  feats['observed_cues_available'] = (patient.observedCues || []).length > 0 ? 1 : 0;
  feats['has_medical_history'] = (patient.medicalHistory || []).length > 0 ? 1 : 0;

  return feats;
}

/**
 * Traverses a single compact XGBoost tree.
 */
function evaluateTree(tree: typeof XGBOOST_TREES_V2[0], feats: Record<string, number | null>): number {
  let curr = 0;
  while (tree.left[curr] !== -1 && tree.right[curr] !== -1) {
    const featName = tree.feat[curr];
    const thresh = tree.thresh[curr];
    const val = feats[featName];

    if (val === null || val === undefined || isNaN(val)) {
      curr = tree.def_left[curr] === 1 ? tree.left[curr] : tree.right[curr];
    } else {
      if (val < thresh) {
        curr = tree.left[curr];
      } else {
        curr = tree.right[curr];
      }
    }
  }
  return tree.val[curr];
}

/**
 * Numerically stable Softmax function.
 */
function softmax(logits: number[]): number[] {
  const maxLogit = Math.max(...logits);
  const exps = logits.map(l => Math.exp(l - maxLogit));
  const sumExps = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => (sumExps > 0 ? e / sumExps : 0.2));
}

/**
 * Client-Side XGBoost Prediction Function (Model V2).
 */
export function predictPatientAcuity(patient: Patient): MLPrediction | null {
  try {
    const feats = extractPatientFeatures(patient);
    const numClasses = 5;
    const logits = [...BASE_MARGINS_V2];

    for (let i = 0; i < XGBOOST_TREES_V2.length; i++) {
      const classIdx = i % numClasses;
      const leafVal = evaluateTree(XGBOOST_TREES_V2[i], feats);
      logits[classIdx] += leafVal;
    }

    const probsArr = softmax(logits);
    const probabilities: Record<TriageLevelCode, number> = {
      CRITICAL: probsArr[0],
      HIGH: probsArr[1],
      MEDIUM: probsArr[2],
      LOW: probsArr[3],
      NON_URGENT: probsArr[4]
    };

    const indexedProbs = probsArr.map((p, idx) => ({ prob: p, classIdx: idx }));
    indexedProbs.sort((a, b) => b.prob - a.prob);

    const topIdx = indexedProbs[0].classIdx;
    const topProb = indexedProbs[0].prob;
    const secondProb = indexedProbs[1].prob;
    const margin = topProb - secondProb;
    const predictedClass = CLASS_NAMES[topIdx];

    let modelUncertainty: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW';
    if (topProb < 0.50 || margin < 0.15) {
      modelUncertainty = 'HIGH';
    } else if (topProb < 0.70 || margin < 0.25) {
      modelUncertainty = 'MODERATE';
    }

    // Top SHAP feature contributions
    const featureContributions: FeatureContribution[] = [];
    const displayNames: Record<string, string> = {
      'temperature_c': 'Body Temperature',
      'sbp_mmhg': 'Systolic Blood Pressure',
      'resp_rate_bpm': 'Respiratory Rate',
      'heart_rate_bpm': 'Heart Rate',
      'spo2_pct': 'Oxygen Saturation (SpO₂)',
      'feat_chest_pain': 'Chest Pain / Angina',
      'shock_index': 'Shock Index (HR/SBP)',
      'feat_altered_mental_status': 'Altered Mental Status',
      'pain_score': 'Pain Severity Score',
      'feat_dyspnea': 'Dyspnea / Shortness of Breath'
    };

    for (const [featKey, globalWeight] of Object.entries(GLOBAL_SHAP_IMPORTANCE_V2)) {
      const rawVal = feats[featKey];
      if (rawVal !== null && rawVal !== undefined && (rawVal !== 0 || globalWeight > 0.05)) {
        let impactDirection: 'increases_acuity' | 'decreases_acuity' | 'neutral' = 'neutral';
        if (featKey.includes('chest_pain') || featKey.includes('hypoxemia') || featKey.includes('altered_mental') || featKey === 'shock_index') {
          impactDirection = 'increases_acuity';
        } else if (featKey === 'spo2_pct' && rawVal < 92) {
          impactDirection = 'increases_acuity';
        } else if (featKey === 'heart_rate_bpm' && (rawVal > 110 || rawVal < 50)) {
          impactDirection = 'increases_acuity';
        }

        featureContributions.push({
          featureName: featKey,
          displayName: displayNames[featKey] || featKey,
          value: typeof rawVal === 'number' ? Number(rawVal.toFixed(1)) : rawVal,
          importance: globalWeight,
          impactDirection
        });
      }
    }
    featureContributions.sort((a, b) => b.importance - a.importance);

    return {
      predictedClass,
      probabilities,
      topProbability: topProb,
      secondProbability: secondProb,
      probabilityMargin: margin,
      modelUncertainty,
      featureContributions: featureContributions.slice(0, 5),
      modelVersion: '2.0.0-domain-robust',
      inferenceTimestamp: new Date().toISOString()
    };
  } catch (err) {
    console.error("XGBoost V2 Inference Exception - Falling back:", err);
    return null;
  }
}
