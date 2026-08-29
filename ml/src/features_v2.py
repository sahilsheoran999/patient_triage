import pandas as pd
import numpy as np
import re
from typing import Dict, Any, List, Union
import warnings
warnings.filterwarnings('ignore', category=UserWarning)

LABEL_MAP = {
    'CRITICAL': 0,
    'HIGH': 1,
    'MEDIUM': 2,
    'LOW': 3,
    'NON_URGENT': 4
}

INV_LABEL_MAP = {v: k for k, v in LABEL_MAP.items()}

FEATURE_COLUMNS_V2 = [
    # 1. Base Objective Vitals & Demographics
    'temperature_c',
    'heart_rate_bpm',
    'resp_rate_bpm',
    'spo2_pct',
    'sbp_mmhg',
    'dbp_mmhg',
    'pain_score',
    'symptom_duration_hours',
    'age',
    'sex_male',
    'is_geriatric',
    'is_pediatric',

    # 2. Pain Context Features (De-biasing zero-pain)
    'pain_missing',
    'pain_present',
    'pain_severe',
    'pain_zero_with_symptoms',

    # 3. Clinical Chief Complaint Concept Extraction (with Negation Protection)
    'feat_chest_pain',
    'feat_palpitations',
    'feat_cardiac_arrest_history',
    'feat_dyspnea',
    'feat_respiratory_distress',
    'feat_stridor',
    'feat_wheezing',
    'feat_cough',
    'feat_altered_mental_status',
    'feat_stroke_weakness_droop',
    'feat_seizure_syncope',
    'feat_dizziness',
    'feat_gi_bleed_hematemesis',
    'feat_vomiting_nausea',
    'feat_abdominal_pain',
    'feat_dka_hyperglycemia',
    'feat_neutropenic_fever_sepsis',
    'feat_fever_symptoms',
    'feat_fall_trauma_mvc',
    'feat_elevated_inr_coagulopathy',
    'feat_psych_suicidal_eval',
    'feat_fatigue_weakness',

    # 4. Clinical Signs & Observed Physical Cues
    'feat_cyanosis',
    'feat_diaphoresis',
    'feat_pallor',
    'feat_levine_sign',

    # 5. Physiological Derived Features
    'shock_index',
    'mean_arterial_pressure',
    'pulse_pressure',
    'hr_abnormality',
    'rr_abnormality',
    'temp_abnormality',
    'spo2_hypoxemia',

    # 6. Nonlinear Clinical Interactions
    'interaction_cardiac_diaphoresis',
    'interaction_cardiac_vomiting',
    'interaction_hypoxemia_tachypnea',
    'interaction_fever_tachycardia',
    'interaction_shock_tachycardia',
    'interaction_altered_mental_abnormal_vitals',
    'interaction_high_risk_complaint_missing_vitals',
    'interaction_trauma_hypotension',

    # 7. Explicit Missing-Data & Modality Flags (UNKNOWN != NORMAL)
    'missing_spo2',
    'missing_sbp',
    'missing_dbp',
    'missing_hr',
    'missing_rr',
    'missing_temp',
    'missing_pain',
    'missing_vitals_count',
    'vitals_complete',
    'age_missing',
    'sex_missing',
    'symptom_duration_missing',
    'observed_cues_available',
    'has_medical_history'
]

def contains_with_negation_protection(text_series: pd.Series, pattern: str, negation_prefix_regex: str = r'(?:no|denies|without|negative\s+for|r/o|rule\s+out)\s+(?:\w+\s+){0,3}') -> pd.Series:
    """
    Returns boolean series: true if text contains pattern AND pattern is not preceded by negation.
    """
    has_term = text_series.str.contains(pattern, case=False, regex=True, na=False)
    negated = text_series.str.contains(negation_prefix_regex + r'(?:' + pattern + r')', case=False, regex=True, na=False)
    return (has_term & (~negated)).astype(int)

def extract_features_v2(df: pd.DataFrame) -> pd.DataFrame:
    """
    Extracts structured features from raw DataFrame for XGBoost V2.
    """
    X = pd.DataFrame(index=df.index)
    
    # --- 1. Objective Vitals & Demographics ---
    X['temperature_c'] = pd.to_numeric(df.get('temperature_c', np.nan), errors='coerce')
    X['heart_rate_bpm'] = pd.to_numeric(df.get('heart_rate_bpm', np.nan), errors='coerce')
    X['resp_rate_bpm'] = pd.to_numeric(df.get('resp_rate_bpm', np.nan), errors='coerce')
    X['spo2_pct'] = pd.to_numeric(df.get('spo2_pct', np.nan), errors='coerce')
    X['sbp_mmhg'] = pd.to_numeric(df.get('sbp_mmhg', np.nan), errors='coerce')
    X['dbp_mmhg'] = pd.to_numeric(df.get('dbp_mmhg', np.nan), errors='coerce')
    
    raw_pain = pd.to_numeric(df.get('pain_score', np.nan), errors='coerce')
    X['pain_score'] = raw_pain.fillna(0.0)
    
    raw_duration = pd.to_numeric(df.get('symptom_duration_hours', np.nan), errors='coerce')
    X['symptom_duration_hours'] = raw_duration.fillna(4.0)
    
    raw_age = pd.to_numeric(df.get('age', np.nan), errors='coerce')
    X['age'] = raw_age.fillna(45.0)
    
    sex_str = df.get('sex', '').astype(str).str.upper()
    X['sex_male'] = (sex_str.str.startswith('M')).astype(int)
    X['is_geriatric'] = (X['age'] >= 65).astype(int)
    X['is_pediatric'] = (X['age'] < 18).astype(int)
    
    # --- 2. Pain Context Features ---
    X['pain_missing'] = raw_pain.isnull().astype(int)
    X['missing_pain'] = X['pain_missing']
    X['pain_present'] = (X['pain_score'] > 0).astype(int)
    X['pain_severe'] = (X['pain_score'] >= 7).astype(int)
    
    # --- Text Preparation ---
    cc = df.get('chief_complaint', pd.Series('', index=df.index)).fillna('').astype(str)
    assoc = df.get('associated_symptoms', pd.Series('', index=df.index)).fillna('').astype(str)
    cues = df.get('observed_cues', pd.Series('', index=df.index)).fillna('').astype(str)
    hist = df.get('medical_history', pd.Series('', index=df.index)).fillna('').astype(str)
    
    combined_complaint = (cc + ' ' + assoc).str.lower()
    combined_all = (cc + ' ' + assoc + ' ' + cues + ' ' + hist).str.lower()
    cues_lower = cues.str.lower()
    
    X['pain_zero_with_symptoms'] = ((X['pain_score'] == 0) & (combined_complaint.str.len() > 3)).astype(int)
    
    # --- 3. Chief Complaint Clinical Concept Extraction ---
    # Cardiac
    X['feat_chest_pain'] = contains_with_negation_protection(combined_complaint, r'chest\s+pain|pain\s+in\s+chest|chest\s+tightness|chest\s+pressure|angina|substernal')
    X['feat_palpitations'] = contains_with_negation_protection(combined_complaint, r'palpitation|flutter|rapid\s+heart|irregular\s+pulse')
    X['feat_cardiac_arrest_history'] = (combined_all.str.contains(r'cardiac\s+arrest|s/p\s+arrest|resuscitation|cpr', regex=True, na=False)).astype(int)
    
    # Respiratory
    X['feat_dyspnea'] = contains_with_negation_protection(combined_complaint, r'dyspnea|shortness\s+of\s+breath|\bsob\b|breathless|gasping|orthopnea|difficulty\s+breathing')
    X['feat_respiratory_distress'] = (combined_all.str.contains(r'respiratory\s+distress|accessory\s+muscle|retraction|tripod', regex=True, na=False)).astype(int)
    X['feat_stridor'] = (combined_all.str.contains(r'stridor|severe\s+airway|croup', regex=True, na=False)).astype(int)
    X['feat_wheezing'] = contains_with_negation_protection(combined_complaint, r'wheez|bronchospasm|asthma\s+exacerbation')
    X['feat_cough'] = contains_with_negation_protection(combined_complaint, r'cough|hemoptysis|sputum|productive\s+cough')
    
    # Neurological
    X['feat_altered_mental_status'] = (combined_all.str.contains(r'altered\s+mental|confusion|delirium|unresponsive|letharg|obtund|encephalopathy|disoriented', regex=True, na=False)).astype(int)
    X['feat_stroke_weakness_droop'] = (combined_all.str.contains(r'stroke|facial\s+droop|slurred\s+speech|hemiparesis|weakness|ich|sdh|sah|intracranial\s+hemorrhage|t-spine', regex=True, na=False)).astype(int)
    X['feat_seizure_syncope'] = (combined_all.str.contains(r'seizure|syncope|passed\s+out|blacked\s+out|postictal|convulsion', regex=True, na=False)).astype(int)
    X['feat_dizziness'] = contains_with_negation_protection(combined_complaint, r'dizz|lighthead|vertigo|unsteady|loss\s+of\s+balance')
    
    # GI / Bleeding
    X['feat_gi_bleed_hematemesis'] = (combined_all.str.contains(r'gi\s+bleed|hematemesis|coffee\s+ground|melena|hematochezia|vomiting\s+blood|rectal\s+bleed', regex=True, na=False)).astype(int)
    X['feat_vomiting_nausea'] = contains_with_negation_protection(combined_complaint, r'vomit|emesis|nausea|\bn/v\b')
    X['feat_abdominal_pain'] = contains_with_negation_protection(combined_complaint, r'abdominal|abd\s+pain|belly\s+pain|stomach\s+pain|flank\s+pain|appendix|peritonitis')
    
    # Metabolic & Infection
    X['feat_dka_hyperglycemia'] = (combined_all.str.contains(r'\bdka\b|diabetic\s+ketoacidosis|hyperglycemia|elevated\s+glucose|high\s+blood\s+sugar', regex=True, na=False)).astype(int)
    X['feat_neutropenic_fever_sepsis'] = (combined_all.str.contains(r'neutropeni|sepsis|septic|bacteremia|urosepsis', regex=True, na=False)).astype(int)
    X['feat_fever_symptoms'] = contains_with_negation_protection(combined_complaint, r'fever|febrile|chills|rigors|pyrexia|sweats')
    
    # Trauma, Coagulation, Psychiatric & General
    X['feat_fall_trauma_mvc'] = (combined_all.str.contains(r'fall|s/p\s+fall|trauma|mvc|motor\s+vehicle|accident|head\s+injury|fracture|hit\s+by', regex=True, na=False)).astype(int)
    X['feat_elevated_inr_coagulopathy'] = (combined_all.str.contains(r'elevated\s+inr|\binr\b|coagulopathy|anticoagulat|bleeding\s+risk|warfarin|coumadin', regex=True, na=False)).astype(int)
    X['feat_psych_suicidal_eval'] = (combined_all.str.contains(r'psych\s+eval|suicid|ideation|self\s+harm|overdose|ingestion|depression', regex=True, na=False)).astype(int)
    X['feat_fatigue_weakness'] = contains_with_negation_protection(combined_complaint, r'fatigue|generalized\s+weakness|malaise|lethargy|abnormal\s+labs')
    
    # --- 4. Clinical Signs & Observed Physical Cues ---
    X['feat_cyanosis'] = (combined_all.str.contains(r'cyanosis|cyanotic|dusky', regex=True, na=False)).astype(int)
    X['feat_diaphoresis'] = (combined_all.str.contains(r'diaphoresis|profuse\s+sweat|sweating|clammy', regex=True, na=False)).astype(int)
    X['feat_pallor'] = (cues_lower.str.contains(r'pallor|pale', regex=True, na=False)).astype(int)
    X['feat_levine_sign'] = (cues_lower.str.contains(r'levine|clenched\s+fist', regex=True, na=False)).astype(int)
    
    # --- 5. Physiological Derived Features ---
    valid_si = (X['sbp_mmhg'] > 0) & (X['heart_rate_bpm'].notnull())
    X['shock_index'] = np.where(valid_si, X['heart_rate_bpm'] / X['sbp_mmhg'], np.nan)
    
    valid_map = (X['sbp_mmhg'].notnull()) & (X['dbp_mmhg'].notnull())
    X['mean_arterial_pressure'] = np.where(valid_map, (X['sbp_mmhg'] + 2.0 * X['dbp_mmhg']) / 3.0, np.nan)
    X['pulse_pressure'] = np.where(valid_map, X['sbp_mmhg'] - X['dbp_mmhg'], np.nan)
    
    X['hr_abnormality'] = ((X['heart_rate_bpm'] > 100) | (X['heart_rate_bpm'] < 50)).fillna(False).astype(int)
    X['rr_abnormality'] = ((X['resp_rate_bpm'] >= 22) | (X['resp_rate_bpm'] < 10)).fillna(False).astype(int)
    X['temp_abnormality'] = ((X['temperature_c'] >= 38.0) | (X['temperature_c'] < 36.0)).fillna(False).astype(int)
    X['spo2_hypoxemia'] = (X['spo2_pct'] < 92).fillna(False).astype(int)
    
    # --- 6. Nonlinear Clinical Interactions ---
    X['interaction_cardiac_diaphoresis'] = (X['feat_chest_pain'] & X['feat_diaphoresis']).astype(int)
    X['interaction_cardiac_vomiting'] = (X['feat_chest_pain'] & X['feat_vomiting_nausea']).astype(int)
    X['interaction_hypoxemia_tachypnea'] = (X['spo2_hypoxemia'] & X['rr_abnormality']).astype(int)
    X['interaction_fever_tachycardia'] = (X['temp_abnormality'] & X['hr_abnormality']).astype(int)
    X['interaction_shock_tachycardia'] = (X['shock_index'] >= 0.9).fillna(False).astype(int)
    
    any_vital_abnl = (X['hr_abnormality'] | X['rr_abnormality'] | X['spo2_hypoxemia'] | (X['sbp_mmhg'] < 90)).fillna(False).astype(int)
    X['interaction_altered_mental_abnormal_vitals'] = (X['feat_altered_mental_status'] & any_vital_abnl).astype(int)
    
    high_risk_cc = (X['feat_chest_pain'] | X['feat_cardiac_arrest_history'] | X['feat_altered_mental_status'] | X['feat_stroke_weakness_droop'] | X['feat_gi_bleed_hematemesis'] | X['feat_dka_hyperglycemia'] | X['feat_neutropenic_fever_sepsis'])
    missing_any_key = (X['spo2_pct'].isnull() | X['sbp_mmhg'].isnull() | X['heart_rate_bpm'].isnull()).astype(int)
    X['interaction_high_risk_complaint_missing_vitals'] = (high_risk_cc & missing_any_key).astype(int)
    
    X['interaction_trauma_hypotension'] = (X['feat_fall_trauma_mvc'] & (X['sbp_mmhg'] < 100)).fillna(False).astype(int)
    
    # --- 7. Explicit Missing-Data & Modality Flags (UNKNOWN != NORMAL) ---
    X['missing_spo2'] = X['spo2_pct'].isnull().astype(int)
    X['missing_sbp'] = X['sbp_mmhg'].isnull().astype(int)
    X['missing_dbp'] = X['dbp_mmhg'].isnull().astype(int)
    X['missing_hr'] = X['heart_rate_bpm'].isnull().astype(int)
    X['missing_rr'] = X['resp_rate_bpm'].isnull().astype(int)
    X['missing_temp'] = X['temperature_c'].isnull().astype(int)
    
    vital_missing_cols = ['missing_spo2', 'missing_sbp', 'missing_dbp', 'missing_hr', 'missing_rr', 'missing_temp', 'missing_pain']
    X['missing_vitals_count'] = X[vital_missing_cols].sum(axis=1)
    X['vitals_complete'] = (X['missing_vitals_count'] == 0).astype(int)
    
    X['age_missing'] = raw_age.isnull().astype(int)
    X['sex_missing'] = (df.get('sex', pd.Series(np.nan, index=df.index)).isnull() | (sex_str == '')).astype(int)
    X['symptom_duration_missing'] = raw_duration.isnull().astype(int)
    X['observed_cues_available'] = (cues.str.len() > 0).astype(int)
    X['has_medical_history'] = (hist.str.len() > 0).astype(int)
    
    return X[FEATURE_COLUMNS_V2]
