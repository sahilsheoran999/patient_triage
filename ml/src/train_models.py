import pandas as pd
import numpy as np
import json
import os
import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, f1_score, accuracy_score, recall_score
import xgboost as xgb
from features import extract_features, LABEL_MAP, INV_LABEL_MAP, FEATURE_COLUMNS

def train_and_export_models(
    train_path: str = 'ml/data/splits/train.csv',
    val_path: str = 'ml/data/splits/val.csv',
    test_path: str = 'ml/data/splits/test.csv',
    models_dir: str = 'ml/models'
):
    os.makedirs(models_dir, exist_ok=True)
    
    print("Loading data splits...")
    train_df = pd.read_csv(train_path)
    val_df = pd.read_csv(val_path)
    test_df = pd.read_csv(test_path)
    
    print("Extracting features...")
    X_train = extract_features(train_df)
    y_train = train_df['acuity_label'].map(LABEL_MAP).values
    
    X_val = extract_features(val_df)
    y_val = val_df['acuity_label'].map(LABEL_MAP).values
    
    X_test = extract_features(test_df)
    y_test = test_df['acuity_label'].map(LABEL_MAP).values
    
    print(f"Features shape: {X_train.shape}")
    
    # ----------------------------------------------------
    # 1. BASELINE 2: MULTINOMIAL LOGISTIC REGRESSION
    # ----------------------------------------------------
    print("\nTraining Baseline 2: Multinomial Logistic Regression...")
    lr_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler()),
        ('clf', LogisticRegression(max_iter=1000, random_state=42))
    ])
    lr_pipeline.fit(X_train, y_train)
    y_pred_lr = lr_pipeline.predict(X_test)
    
    lr_acc = accuracy_score(y_test, y_pred_lr)
    lr_f1 = f1_score(y_test, y_pred_lr, average='macro')
    lr_crit_rec = recall_score(y_test, y_pred_lr, labels=[0], average='micro')
    print(f"Logistic Regression -> Test Acc: {lr_acc*100:.2f}%, Macro F1: {lr_f1*100:.2f}%, Critical Recall: {lr_crit_rec*100:.2f}%")
    
    # ----------------------------------------------------
    # 2. MODEL 3: MULTI-CLASS XGBOOST
    # ----------------------------------------------------
    print("\nTraining Model 3: Multi-Class XGBoost Classifier...")
    xgb_clf = xgb.XGBClassifier(
        n_estimators=250,
        max_depth=5,
        learning_rate=0.04,
        subsample=0.85,
        colsample_bytree=0.85,
        objective='multi:softprob',
        num_class=5,
        random_state=42,
        eval_metric='mlogloss',
        early_stopping_rounds=20
    )
    
    xgb_clf.fit(
        X_train, y_train,
        eval_set=[(X_train, y_train), (X_val, y_val)],
        verbose=50
    )
    
    y_pred_xgb = xgb_clf.predict(X_test)
    xgb_acc = accuracy_score(y_test, y_pred_xgb)
    xgb_f1 = f1_score(y_test, y_pred_xgb, average='macro')
    xgb_crit_rec = recall_score(y_test, y_pred_xgb, labels=[0], average='micro')
    print(f"\nXGBoost -> Test Acc: {xgb_acc*100:.2f}%, Macro F1: {xgb_f1*100:.2f}%, Critical Recall: {xgb_crit_rec*100:.2f}%")
    
    # ----------------------------------------------------
    # 3. EXPORT MODEL ARTIFACTS
    # ----------------------------------------------------
    xgb_model_path = os.path.join(models_dir, 'xgboost_triage_model.json')
    xgb_clf.save_model(xgb_model_path)
    print(f"\nSaved XGBoost model to {xgb_model_path}")
    
    metadata = {
        'model_type': 'XGBClassifier',
        'n_features': len(FEATURE_COLUMNS),
        'feature_names': FEATURE_COLUMNS,
        'label_map': LABEL_MAP,
        'inv_label_map': INV_LABEL_MAP,
        'test_accuracy': float(xgb_acc),
        'test_macro_f1': float(xgb_f1),
        'test_critical_recall': float(xgb_crit_rec)
    }
    metadata_path = os.path.join(models_dir, 'feature_metadata.json')
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"Saved metadata to {metadata_path}")
    
    joblib.dump(lr_pipeline, os.path.join(models_dir, 'logistic_regression_baseline.joblib'))
    print("Saved baseline pipeline.")
    
    return xgb_clf, lr_pipeline

if __name__ == '__main__':
    train_and_export_models()
