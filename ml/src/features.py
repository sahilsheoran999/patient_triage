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

FEATURE_COLUMNS = [
    # Continuous vitals & demographics
    'age',
    'temperature_c',
    'heart_rate_bpm',
    'resp_rate_bpm',
    'spo2_pct',
    'sbp_mmhg',
    'dbp_mmhg',
    'pain_score',
    'symptom_duration_hours',
    'sex_male',
    'is_geriatric',
    'is_pediatric',
    
    # Clinical symptoms & cues (with negation protection)
    'feat_chest_pain',
    'feat_dyspnea',
    'feat_respiratory_distress',
    'feat_stridor',
    'feat_wheezing',
    'feat_vomiting',
    'feat_dizziness',
    'feat_confusion_altered_mental',
    'feat_cyanosis',
    'feat_diaphoresis',
    'feat_pallor',
    'feat_levine_sign',
    'feat_fever_symptoms',
    'feat_abdominal_pain',
    
    # Derived physiological features
    'shock_index',
    'pulse_pressure',
    'hypoxemia_tachypnea_interaction',
    
    # Missingness & data quality indicators (UNKNOWN != NORMAL)
    'missing_spo2',
    'missing_sbp',
    'missing_dbp',
    'missing_hr',
    'missing_rr',
    'missing_temp',
    'missing_vitals_count',
    'has_unrepresented_history'
]

def contains_with_negation_protection(text_series: pd.Series, pattern: str, negation_prefix_regex: str = r'(?:no|denies|without|negative\s+for)\s+(?:\w+\s+){0,3}') -> pd.Series:
    """
    Returns boolean series true if text contains pattern AND pattern is not preceded by negation.
    """
    has_term = text_series.str.contains(pattern, case=False, regex=True, na=False)
    negated = text_series.str.contains(negation_prefix_regex + r'(?:' + pattern + r')', case=False, regex=True, na=False)
    return (has_term & (~negated)).astype(int)

def extract_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Extracts 37 structured features from a raw DataFrame.
    """
    X = pd.DataFrame(index=df.index)
    
    # 1. Objective Vitals
    X['age'] = df['age'].astype(float)
    X['temperature_c'] = pd.to_numeric(df['temperature_c'], errors='coerce')
    X['heart_rate_bpm'] = pd.to_numeric(df['heart_rate_bpm'], errors='coerce')
    X['resp_rate_bpm'] = pd.to_numeric(df['resp_rate_bpm'], errors='coerce')
    X['spo2_pct'] = pd.to_numeric(df['spo2_pct'], errors='coerce')
    X['sbp_mmhg'] = pd.to_numeric(df['sbp_mmhg'], errors='coerce')
    X['dbp_mmhg'] = pd.to_numeric(df['dbp_mmhg'], errors='coerce')
    
    # Pain and Duration
    X['pain_score'] = pd.to_numeric(df.get('pain_score', 0), errors='coerce').fillna(0.0)
    X['symptom_duration_hours'] = pd.to_numeric(df.get('symptom_duration_hours', 4.0), errors='coerce').fillna(4.0)
    
    # Demographics
    sex_str = df['sex'].astype(str).str.upper()
    X['sex_male'] = (sex_str.str.startswith('M')).astype(int)
    X['is_geriatric'] = (X['age'] >= 65).astype(int)
    X['is_pediatric'] = (X['age'] < 18).astype(int)
    
    # Text aggregation for complaint, symptoms, cues, history
    cc = df['chief_complaint'].fillna('').astype(str)
    assoc = df['associated_symptoms'].fillna('').astype(str)
    cues = df['observed_cues'].fillna('').astype(str)
    hist = df['medical_history'].fillna('').astype(str)
    
    combined_complaint = (cc + ' ' + assoc).str.lower()
    combined_all = (cc + ' ' + assoc + ' ' + cues).str.lower()
    cues_lower = cues.str.lower()
    
    # 2. Clinical Symptoms with Negation Protection
    X['feat_chest_pain'] = contains_with_negation_protection(combined_complaint, r'chest\s+pain|pain\s+in\s+chest|chest\s+tightness|chest\s+pressure|angina')
    X['feat_dyspnea'] = contains_with_negation_protection(combined_complaint, r'dyspnea|shortness\s+of\s+breath|breathless|gasping|difficulty\s+breathing')
    X['feat_respiratory_distress'] = (combined_all.str.contains(r'respiratory\s+distress|accessory\s+muscle', regex=True, na=False)).astype(int)
    X['feat_stridor'] = (combined_all.str.contains(r'stridor|severe\s+airway', regex=True, na=False)).astype(int)
    X['feat_wheezing'] = contains_with_negation_protection(combined_complaint, r'wheez')
    X['feat_vomiting'] = contains_with_negation_protection(combined_complaint, r'vomit|emesis|nausea\s+and\s+vomiting')
    X['feat_dizziness'] = contains_with_negation_protection(combined_complaint, r'dizz|lighthead|syncope|faint')
    X['feat_confusion_altered_mental'] = (combined_all.str.contains(r'confusion|delirium|altered\s+mental|unresponsive', regex=True, na=False)).astype(int)
    X['feat_cyanosis'] = (combined_all.str.contains(r'cyanosis|cyanotic|dusky', regex=True, na=False)).astype(int)
    X['feat_diaphoresis'] = (combined_all.str.contains(r'diaphoresis|profuse\s+sweat|sweating', regex=True, na=False)).astype(int)
    X['feat_pallor'] = (cues_lower.str.contains(r'pallor|pale', regex=True, na=False)).astype(int)
    X['feat_levine_sign'] = (cues_lower.str.contains(r'levine|clenched\s+fist', regex=True, na=False)).astype(int)
    X['feat_fever_symptoms'] = contains_with_negation_protection(combined_complaint, r'fever|chills|rigors|sweats')
    X['feat_abdominal_pain'] = contains_with_negation_protection(combined_complaint, r'abdominal|stomach\s+pain|belly\s+pain|flank\s+pain|appendix')
    
    # 3. Derived Physiology
    # Shock Index = HR / SBP (only valid when SBP > 0)
    valid_si = (X['sbp_mmhg'] > 0) & (X['heart_rate_bpm'].notnull())
    X['shock_index'] = np.where(valid_si, X['heart_rate_bpm'] / X['sbp_mmhg'], np.nan)
    
    # Pulse Pressure = SBP - DBP
    valid_pp = (X['sbp_mmhg'].notnull()) & (X['dbp_mmhg'].notnull())
    X['pulse_pressure'] = np.where(valid_pp, X['sbp_mmhg'] - X['dbp_mmhg'], np.nan)
    
    # Hypoxemia + Tachypnea Interaction
    hypoxemia = (X['spo2_pct'] < 92)
    tachypnea = (X['resp_rate_bpm'] >= 24)
    X['hypoxemia_tachypnea_interaction'] = (hypoxemia & tachypnea).fillna(False).astype(int)
    
    # 4. Missingness & Quality Indicators (UNKNOWN != NORMAL)
    X['missing_spo2'] = X['spo2_pct'].isnull().astype(int)
    X['missing_sbp'] = X['sbp_mmhg'].isnull().astype(int)
    X['missing_dbp'] = X['dbp_mmhg'].isnull().astype(int)
    X['missing_hr'] = X['heart_rate_bpm'].isnull().astype(int)
    X['missing_rr'] = X['resp_rate_bpm'].isnull().astype(int)
    X['missing_temp'] = X['temperature_c'].isnull().astype(int)
    
    vital_missing_cols = ['missing_spo2', 'missing_sbp', 'missing_dbp', 'missing_hr', 'missing_rr', 'missing_temp']
    X['missing_vitals_count'] = X[vital_missing_cols].sum(axis=1)
    
    # History Unrepresented
    hist_lower = hist.str.lower()
    X['has_unrepresented_history'] = (
        hist_lower.isin(['unknown', 'none', 'no significant history', '', 'no significant medical history reported.']) | 
        hist_lower.isna()
    ).astype(int)
    
    return X[FEATURE_COLUMNS]

def extract_single_patient_features(patient_dict: Dict[str, Any]) -> pd.DataFrame:
    """
    Transforms a single patient dictionary (from React frontend or JSON API) into model input features.
    """
    vitals = patient_dict.get('currentVitals', {})
    
    row = {
        'age': patient_dict.get('age', 45),
        'sex': patient_dict.get('gender', patient_dict.get('sex', 'M')),
        'pain_score': patient_dict.get('symptomSeverity', patient_dict.get('pain_score', 5)),
        'symptom_duration_hours': patient_dict.get('symptomDurationHours', patient_dict.get('symptom_duration_hours', 4)),
        'chief_complaint': patient_dict.get('chiefComplaint', patient_dict.get('chief_complaint', '')),
        'associated_symptoms': ', '.join(patient_dict.get('associatedSymptoms', [])) if isinstance(patient_dict.get('associatedSymptoms'), list) else patient_dict.get('associated_symptoms', ''),
        'observed_cues': ', '.join(patient_dict.get('observedCues', [])) if isinstance(patient_dict.get('observedCues'), list) else patient_dict.get('observed_cues', ''),
        'medical_history': ', '.join(patient_dict.get('medicalHistory', [])) if isinstance(patient_dict.get('medicalHistory'), list) else patient_dict.get('medical_history', ''),
        'temperature_c': vitals.get('temperature', patient_dict.get('temperature_c', None)),
        'heart_rate_bpm': vitals.get('heartRate', patient_dict.get('heart_rate_bpm', None)),
        'resp_rate_bpm': vitals.get('respiratoryRate', patient_dict.get('resp_rate_bpm', None)),
        'spo2_pct': vitals.get('spo2', patient_dict.get('spo2_pct', None)),
        'sbp_mmhg': vitals.get('systolicBp', patient_dict.get('sbp_mmhg', None)),
        'dbp_mmhg': vitals.get('diastolicBp', patient_dict.get('dbp_mmhg', None)),
    }
    
    df = pd.DataFrame([row])
    return extract_features(df)
