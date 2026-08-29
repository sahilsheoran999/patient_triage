import pandas as pd
import numpy as np
import json
import os
import xgboost as xgb
import shap
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, f1_score, recall_score, precision_score
from features import extract_features, extract_single_patient_features, LABEL_MAP, INV_LABEL_MAP, FEATURE_COLUMNS
from baseline_rules import evaluate_baseline_rules

def run_evaluation(
    test_path: str = 'ml/data/splits/test.csv',
    model_path: str = 'ml/models/xgboost_triage_model.json'
):
    print("="*60)
    print("STAGE 3 COMPREHENSIVE BENCHMARK & EVALUATION")
    print("="*60)
    
    test_df = pd.read_csv(test_path)
    y_true_str = test_df['acuity_label'].values
    y_true_idx = np.array([LABEL_MAP[k] for k in y_true_str])
    
    X_test = extract_features(test_df)
    
    # 1. EVALUATE BASELINE 1: DETERMINISTIC RULES
    y_pred_rules_str = evaluate_baseline_rules(test_df).values
    y_pred_rules_idx = np.array([LABEL_MAP[k] for k in y_pred_rules_str])
    
    rules_acc = accuracy_score(y_true_idx, y_pred_rules_idx)
    rules_f1 = f1_score(y_true_idx, y_pred_rules_idx, average='macro')
    rules_crit_rec = recall_score(y_true_idx, y_pred_rules_idx, labels=[0], average='micro')
    rules_high_crit_rec = recall_score(np.isin(y_true_idx, [0, 1]).astype(int), np.isin(y_pred_rules_idx, [0, 1]).astype(int))
    
    # 2. EVALUATE MODEL 3: XGBOOST
    model = xgb.XGBClassifier()
    model.load_model(model_path)
    
    probs_xgb = model.predict_proba(X_test)
    y_pred_xgb_idx = np.argmax(probs_xgb, axis=1)
    y_pred_xgb_str = [INV_LABEL_MAP[i] for i in y_pred_xgb_idx]
    
    xgb_acc = accuracy_score(y_true_idx, y_pred_xgb_idx)
    xgb_f1 = f1_score(y_true_idx, y_pred_xgb_idx, average='macro')
    xgb_crit_rec = recall_score(y_true_idx, y_pred_xgb_idx, labels=[0], average='micro')
    xgb_high_crit_rec = recall_score(np.isin(y_true_idx, [0, 1]).astype(int), np.isin(y_pred_xgb_idx, [0, 1]).astype(int))
    
    print("\n=== COMPARATIVE BENCHMARK SUMMARY ===")
    print(f"{'Metric':<30} | {'Baseline 1 (Rules)':<20} | {'Model 3 (XGBoost)':<20}")
    print("-" * 76)
    print(f"{'Accuracy':<30} | {rules_acc*100:>18.2f}% | {xgb_acc*100:>18.2f}%")
    print(f"{'Macro F1-Score':<30} | {rules_f1*100:>18.2f}% | {xgb_f1*100:>18.2f}%")
    print(f"{'CRITICAL Recall (Safety)':<30} | {rules_crit_rec*100:>18.2f}% | {xgb_crit_rec*100:>18.2f}%")
    print(f"{'HIGH + CRITICAL Sensitivity':<30} | {rules_high_crit_rec*100:>18.2f}% | {xgb_high_crit_rec*100:>18.2f}%")
    
    print("\n=== XGBOOST DETAILED CLASSIFICATION REPORT ===")
    target_names = [INV_LABEL_MAP[i] for i in range(5)]
    print(classification_report(y_true_idx, y_pred_xgb_idx, target_names=target_names, digits=4))
    
    print("\n=== XGBOOST CONFUSION MATRIX ===")
    cm = confusion_matrix(y_true_idx, y_pred_xgb_idx)
    cm_df = pd.DataFrame(cm, index=[f"True {k}" for k in target_names], columns=[f"Pred {k}" for k in target_names])
    print(cm_df)
    
    # 3. SHAP EXPLAINABILITY
    print("\n=== COMPUTING SHAP GLOBAL FEATURE IMPORTANCE ===")
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_test.iloc[:500])
    
    # Mean absolute SHAP values across all classes
    if isinstance(shap_values, list):
        mean_abs_shap = np.mean([np.abs(sv).mean(axis=0) for sv in shap_values], axis=0)
    elif len(shap_values.shape) == 3:
        mean_abs_shap = np.abs(shap_values).mean(axis=(0, 2))
    else:
        mean_abs_shap = np.abs(shap_values).mean(axis=0)
        
    shap_df = pd.DataFrame({
        'Feature': FEATURE_COLUMNS,
        'Mean_Abs_SHAP': mean_abs_shap
    }).sort_values(by='Mean_Abs_SHAP', ascending=False)
    
    print("Top 12 Most Influential Features across Acuity Decisions:")
    print(shap_df.head(12).to_string(index=False))
    
    # 4. EDGE CASE INFERENCE (P-127 and P-146)
    print("\n" + "="*60)
    print("DEMO & EDGE CASE VALIDATION: P-127 & P-146")
    print("="*60)
    
    p127_dict = {
        'age': 45,
        'gender': 'M',
        'symptomSeverity': 6,
        'symptomDurationHours': 9,
        'chiefComplaint': 'pain in chest and vomiting',
        'associatedSymptoms': ['dizziness'],
        'observedCues': ['Levine sign (Clenched fist chest pain)'],
        'medicalHistory': [],
        'currentVitals': {
            'spo2': 96,
            'heartRate': 88,
            'systolicBp': None,
            'diastolicBp': None,
            'respiratoryRate': 18,
            'temperature': 37.0
        }
    }
    
    X_p127 = extract_single_patient_features(p127_dict)
    p127_probs = model.predict_proba(X_p127)[0]
    p127_pred_idx = np.argmax(p127_probs)
    p127_pred_label = INV_LABEL_MAP[p127_pred_idx]
    
    print("\nCase P-127 (Chest Pain + Levine Sign + Vomiting + Unmeasured SBP):")
    print(f"  Deterministic Rule Engine: NON_URGENT (Score 22/100)")
    print(f"  XGBoost Predicted Class:   {p127_pred_label} (Confidence: {p127_probs[p127_pred_idx]*100:.1f}%)")
    print(f"  Full Class Probability Distribution:")
    for idx, name in INV_LABEL_MAP.items():
        print(f"    - {name:<12}: {p127_probs[idx]*100:>5.1f}%")
        
    p146_dict = {
        'age': 45,
        'gender': 'M',
        'symptomSeverity': 6,
        'symptomDurationHours': 4,
        'chiefComplaint': 'fever and cold',
        'associatedSymptoms': ['dizziness'],
        'observedCues': [],
        'medicalHistory': [],
        'currentVitals': {
            'spo2': 78,
            'heartRate': 49,
            'systolicBp': 100,
            'diastolicBp': None,
            'respiratoryRate': 18,
            'temperature': 37.0
        }
    }
    X_p146 = extract_single_patient_features(p146_dict)
    p146_probs = model.predict_proba(X_p146)[0]
    p146_pred_idx = np.argmax(p146_probs)
    p146_pred_label = INV_LABEL_MAP[p146_pred_idx]
    
    print("\nCase P-146 (Fever and Cold + SpO2 78% + HR 49 bpm):")
    print(f"  Deterministic Safety Rule: CRITICAL (Red-Flag: Critical Hypoxemia)")
    print(f"  XGBoost Predicted Class:   {p146_pred_label} (Confidence: {p146_probs[p146_pred_idx]*100:.1f}%)")
    print(f"  Full Class Probability Distribution:")
    for idx, name in INV_LABEL_MAP.items():
        print(f"    - {name:<12}: {p146_probs[idx]*100:>5.1f}%")

if __name__ == '__main__':
    run_evaluation()
