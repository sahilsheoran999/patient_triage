import pandas as pd
import numpy as np
from typing import Dict, Any, List

def evaluate_patient_rules_py(row: pd.Series) -> str:
    """
    Python implementation of the deterministic Layer 1 & 2 PatientTriage engine rules.
    """
    # 1. Extract vitals
    spo2 = row.get('spo2_pct')
    hr = row.get('heart_rate_bpm')
    sbp = row.get('sbp_mmhg')
    rr = row.get('resp_rate_bpm')
    temp = row.get('temperature_c')
    
    cues_str = str(row.get('observed_cues', '')).lower()
    complaint_str = str(row.get('chief_complaint', '')).lower()
    history_str = str(row.get('medical_history', '')).lower()
    age = float(row.get('age', 45))
    age_group = str(row.get('age_group', 'ADULT')).upper()
    
    # ----------------------------------------------------
    # LAYER 1: RED FLAGS
    # ----------------------------------------------------
    red_flags = []
    
    if pd.notnull(spo2) and spo2 < 88:
        red_flags.append('Critical Hypoxemia')
    if pd.notnull(sbp) and sbp < 80:
        red_flags.append('Critical Hypotension')
    if pd.notnull(sbp) and sbp >= 200:
        red_flags.append('Critical Hypertension')
    if pd.notnull(rr) and rr >= 30:
        red_flags.append('Severe Tachypnea')
    if pd.notnull(hr) and hr >= 140:
        red_flags.append('Critical Tachycardia')
    if pd.notnull(hr) and hr <= 40:
        red_flags.append('Critical Bradycardia')
    if pd.notnull(temp) and temp >= 40.5:
        red_flags.append('Critical Hyperthermia')
    if pd.notnull(temp) and temp <= 35.0:
        red_flags.append('Critical Hypothermia')
    
    # Critical Cues
    if any(k in cues_str for k in ['stridor', 'respiratory distress', 'cyanosis', 'cyanotic', 'confusion', 'delirium', 'altered mental']):
        red_flags.append('Critical Cues')
        
    if len(red_flags) > 0:
        return 'CRITICAL'
        
    # ----------------------------------------------------
    # LAYER 2: PROTOTYPE RISK SCORING
    # ----------------------------------------------------
    score = 0.0
    
    # SpO2
    if pd.notnull(spo2):
        if spo2 < 88:
            score += 32
        elif spo2 <= 92:
            score += 24
        elif spo2 <= 94:
            score += 13
    else:
        score += 12 # missing penalty
        
    # Respiratory
    if pd.notnull(rr) and rr >= 26:
        score += 24
    elif any(k in complaint_str for k in ['shortness of breath', 'dyspnea', 'stridor', 'wheezing', 'difficulty breathing']):
        score += 17
        
    # Temperature
    if pd.notnull(temp) and (temp >= 38.5 or temp < 36.0):
        score += 6
        
    # Observed Cues count
    cues_list = [c.strip() for c in str(row.get('observed_cues', '')).split(',') if c.strip()]
    if len(cues_list) > 0:
        score += min(18, len(cues_list) * 12)
        
    # Age factor
    multiplier = 1.25 if age_group == 'PEDIATRIC' or age < 18 else (1.3 if age_group == 'GERIATRIC' or age >= 65 else 1.0)
    score += round(10 * multiplier)
    
    # Medical history
    hist_list = [h.strip() for h in str(row.get('medical_history', '')).split(',') if h.strip() and h.strip().lower() not in ['none', 'unknown', 'no significant history']]
    if len(hist_list) > 0:
        score += min(16, len(hist_list) * 4)
    elif history_str in ['unknown', 'none', 'no significant history']:
        score += 14
        
    # HR & BP
    if pd.notnull(hr) and (hr > 110 or hr < 50):
        score += 8
    if pd.notnull(sbp) and (sbp > 160 or sbp < 90):
        score += 6
        
    raw_score = min(99, max(10, round(score)))
    
    # ----------------------------------------------------
    # LAYER 3: PRIORITY THRESHOLDS
    # ----------------------------------------------------
    if raw_score >= 90:
        return 'CRITICAL'
    elif raw_score >= 70:
        return 'HIGH'
    elif raw_score >= 45:
        return 'MEDIUM'
    elif raw_score >= 25:
        return 'LOW'
    else:
        return 'NON_URGENT'

def evaluate_baseline_rules(test_df: pd.DataFrame) -> pd.Series:
    return test_df.apply(evaluate_patient_rules_py, axis=1)
