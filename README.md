# PatientTriage.ai

Clinical decision-support prototype for continuous emergency-department triage monitoring using a hybrid deterministic safety architecture and an XGBoost advisory model.

---

> [!WARNING]
> ### PROTOTYPE SIMULATION ONLY — NOT FOR CLINICAL USE
> * **Synthetic Demonstration Data**: All patient records, clinical scenarios, and triage trajectories in this prototype are generated from synthetic data.
> * **Illustrative Scoring & Rules**: All physiological thresholds, risk weights, and decision rules are demonstration parameters, not validated clinical guidelines.
> * **Advisory Model Status**: The integrated XGBoost model is an advisory prototype evaluated on a synthetic benchmark. Reported metrics demonstrate prototype architecture behavior and do **not** establish clinical validity or diagnostic accuracy.
> * **No Autonomous Diagnosis**: The system does **not** autonomously diagnose disease, prescribe treatment, or make independent medical decisions.
> * **Clinician Authority**: Licensed clinicians retain 100% final decision authority and oversight over all triage classifications at all times.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Target Users](#target-users)
- [System Architecture](#system-architecture)
- [Clinical Decision Flow](#clinical-decision-flow)
- [Hybrid Safety Architecture](#hybrid-safety-architecture)
- [UNKNOWN ≠ NORMAL](#unknown--normal)
- [Machine Learning Model](#machine-learning-model)
- [Model Probability vs Uncertainty](#model-probability-vs-uncertainty)
- [Explainability](#explainability)
- [Continuous Waiting-Room Monitoring](#continuous-waiting-room-monitoring)
- [Reassessment & Deterioration Detection](#reassessment--deterioration-detection)
- [Clinician Override & Audit Logging](#clinician-override--audit-logging)
- [Edge Cases](#edge-cases)
- [Benchmark Results](#benchmark-results)
- [Data & Limitations](#data--limitations)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [ML Training Pipeline](#ml-training-pipeline)
- [Testing & Verification](#testing--verification)
- [Security & Data Protection](#security--data-protection)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## Overview

Emergency departments (EDs) operate under intense cognitive pressure, fluctuating surge volumes, and incomplete intake data. Conventional triage systems assign a static, one-time acuity score at arrival. However, patient conditions are dynamic:

$$\text{Initial Triage} \ne \text{Permanent Risk}$$

When patients wait for extended periods, silent physiological deterioration can go undetected.

**PatientTriage.ai** addresses this challenge through a hybrid decision-support architecture:
1. **Deterministic Safety Rules**: Red-flag vital thresholds act as an unbreachable safety authority, establishing hard `CRITICAL` safety floors.
2. **Rule-Based Risk Scoring**: Transparent, explainable numerical scoring ($0\text{–}100$) decomposes physiological risk factors.
3. **XGBoost Advisory Model**: A 71-feature multi-class classifier identifies complex multi-vital patterns and non-linear interactions.
4. **Waiting-Room Radar™**: Continuous queue surveillance monitors vital-sign trends, deterioration deltas, and elapsed wait times.
5. **Clinician Governance**: Licensed clinicians maintain final decision authority, supported by mandatory override justification and immutable audit logging.

```
Initial Triage ──> Continuous Monitoring ──> Risk Reassessment ──> Safety Escalation ──> Clinician Review
```

---

## Key Features

| Feature | Description |
|---|---|
| **Command Center** | Live emergency department queue displaying priority distribution, risk scores, model probability, uncertainty levels, and hybrid status tags. |
| **Waiting-Room Radar™** | Continuous queue monitoring tracking vital deterioration alerts (`ESCALATE`), wait-time exceedance alerts (`REASSESS`), and passive monitoring (`WATCH`, `SAFE`). |
| **Patient Intake** | Structured form capturing demographics, vitals, chief complaint, symptom severity/duration, medical history, and clinical cues with real-time completeness tracking. |
| **`UNKNOWN ≠ NORMAL` Enforcement** | Unmeasured vital signs remain `null`/unavailable, penalizing completeness and elevating uncertainty rather than defaulting to normal baselines. |
| **Deterministic Red Flags** | Immediate `CRITICAL` safety floors for life-threatening parameters ($\text{SpO}_2 < 88\%$, $\text{SBP} < 80\text{ mmHg}$, $\text{HR} \ge 140\text{ bpm}$, etc.). |
| **XGBoost Advisory Prediction** | 71-feature multi-class Gradient Boosted Tree ensemble evaluating acuity across 5 classes. |
| **Hybrid Safety Fusion** | Safety-first reconciliation ensuring that advisory ML predictions can never downgrade a deterministic safety floor. |
| **SHAP Local Attribution** | Patient-level feature contribution breakdown surfacing exact variables influencing the model prediction. |
| **Clinician Override System** | Structured override interface requiring mandatory reason codes and clinical justification notes. |
| **Immutable Audit Logging** | Comprehensive audit trail recording every intake, prediction, threshold alert, override, and queue state change. |
| **Surge Intelligence** | Interactive $3.0\times$ volume surge simulation evaluating queue pressure and prioritizing critical safety cases. |
| **Hospital Configuration** | Configurable facility presets (Urban Trauma, Community Hospital, Rural ED) adjusting wait thresholds while preserving safety rules. |

---

## Target Users

1. **Emergency Triage Nurses**: Rapid intake data capture, missing-input awareness, and queue acuity prioritization.
2. **ED Charge Nurses & Supervisors**: Waiting-room surveillance, surge volume tracking, and deterioration monitoring.
3. **Emergency Attending Physicians**: Clinical decision support, high-uncertainty case review, and final override authority.
4. **Clinical Quality & Safety Officers**: Audit trail inspection, safety adherence monitoring, and override pattern analysis.

---

## System Architecture

PatientTriage.ai implements a sequential 11-layer data and safety pipeline:

```
                  ┌─────────────────────────────────────────────┐
                  │          01. PATIENT DATA INPUT             │
                  │   Vitals, Symptoms, History, Cues, Age      │
                  └──────────────────────┬──────────────────────┘
                                         │
                  ┌──────────────────────▼──────────────────────┐
                  │          02. DATA QUALITY LAYER             │
                  │   Completeness Check & UNKNOWN ≠ NORMAL     │
                  └──────────────────────┬──────────────────────┘
                                         │
                  ┌──────────────────────▼──────────────────────┐
                  │      03. AGE-AWARE NORMALIZATION LAYER      │
                  │     Pediatric / Adult / Geriatric Baselines │
                  └──────────────────────┬──────────────────────┘
                                         │
                  ┌──────────────────────▼──────────────────────┐
                  │     04. DETERMINISTIC SAFETY ENGINE         │
                  │   Safety Authority: Hard Red-Flag Checks    │
                  └──────────────┬──────────────┬───────────────┘
                                 │              │
                    Safety Floor │              │ No Red Flag
                                 │              ▼
                                 │   ┌──────────────────────────────────┐
                                 │   │ 05. RULE-BASED RISK ASSESSMENT   │
                                 │   │ Weighted Score Decomposition     │
                                 │   └──────────┬───────────────────────┘
                                 │              │
                                 │   ┌──────────▼───────────────────────┐
                                 │   │ 06. XGBOOST ADVISORY MODEL       │
                                 │   │ 71 Domain-Robust Features        │
                                 │   └──────────┬───────────────────────┘
                                 │              │
                                 │   ┌──────────▼───────────────────────┐
                                 │   │ 07. PROBABILITY & UNCERTAINTY    │
                                 │   │ Softmax Distribution & Margin    │
                                 │   └──────────┬───────────────────────┘
                                 │              │
                                 ▼              ▼
                  ┌─────────────────────────────────────────────┐
                  │       08. SAFETY FUSION / SAFETY FLOOR      │
                  │  Deterministic Safety Rules Constrain ML    │
                  └──────────────────────┬──────────────────────┘
                                         │
                  ┌──────────────────────▼──────────────────────┐
                  │        09. FINAL SYSTEM RECOMMENDATION      │
                  │     AI-Assisted Decision-Support Output     │
                  └──────────────────────┬──────────────────────┘
                                         │
                  ┌──────────────────────▼──────────────────────┐
                  │         10. CLINICIAN FINAL DECISION        │
                  │    Human Authority: Accept / Override       │
                  └──────────────────────┬──────────────────────┘
                                         │
                  ┌──────────────────────▼──────────────────────┐
                  │     11. AUDIT & CONTINUOUS RADAR MONITORING │
                  │  Immutable Event Log + Waiting-Room Radar   │
                  └─────────────────────────────────────────────┘
```

---

## Clinical Decision Flow

```
                Patient Intake & Objective Vitals
                               │
                               ▼
            Data Quality Check (UNKNOWN ≠ NORMAL)
                               │
                               ▼
             Deterministic Safety Red-Flag Check
                               │
            ┌──────────────────┴──────────────────┐
            │                                     │
   [Red Flag Triggered]                  [No Red Flag Triggered]
            │                                     │
   CRITICAL Safety Floor                          ▼
            │                         Rule-Based Risk Score
            │                                     │
            │                                     ▼
            │                           XGBoost Advisory Model
            │                                     │
            │                                     ▼
            │                         Model Probability Distribution
            │                                     │
            └──────────────────┬──────────────────┘
                               │
                               ▼
                     Hybrid Safety Fusion
              • Enforces CRITICAL floor if flagged
              • Accepts ML upgrade if non-critical
              • Prevents unsafe ML downgrades
                               │
                               ▼
                     Monitoring State Check
           (Deterioration? Wait Time Exceeded? Disagreement?)
                               │
                               ▼
                   Clinician Decision Review
                    (Final Human Authority)
                               │
                               ▼
                 Immutable Audit Log & Radar
```

---

## Hybrid Safety Architecture

The system enforces a strict hierarchy across four authority tiers:

```
🟢 CLINICIAN             ──> Final Decision Authority (100% override capability)
🔴 DETERMINISTIC RULES   ──> Safety Authority (Safety floor strictly enforced)
🟡 XGBOOST MODEL         ──> Advisory Signal (Cannot downgrade safety floors)
🔵 DATA QUALITY          ──> Safety Constraint (UNKNOWN ≠ NORMAL)
```

### Authority Matrix

| Component | Role in System | Authority Level | Safety Constraint |
|---|---|---|---|
| **Deterministic Rules** | Red-flag physiological evaluation | **Safety Authority** | Strictly enforces `CRITICAL` safety floors. Cannot be overridden or downgraded by ML. |
| **XGBoost Classifier** | Multi-class pattern recognition | **Advisory Signal** | Advisory decision support. Provides class probabilities and SHAP feature attribution. |
| **Hybrid Safety Fusion** | Algorithmic reconciliation | **Safety Gate** | Applies $\max(\text{Safety Floor}, \text{ML Upgrade})$. Prevents downward classification shifts. |
| **Licensed Clinician** | Bedside clinical judgement | **Final Authority** | 100% final override authority. Every override emits an immutable audit event. |

### Deterministic Red-Flag Thresholds

| Parameter | Critical Threshold | Safety Action | Implementation Reference |
|---|---|---|---|
| **Arterial Oxygen Saturation ($\text{SpO}_2$)** | $< 88\%$ | Immediate `CRITICAL` Safety Floor | `prototypeThresholds.ts:18` |
| **Systolic Blood Pressure (Low)** | $< 80\text{ mmHg}$ | Immediate `CRITICAL` Safety Floor | `prototypeThresholds.ts:19` |
| **Systolic Blood Pressure (High)** | $\ge 200\text{ mmHg}$ | Immediate `CRITICAL` Safety Floor | `prototypeThresholds.ts:20` |
| **Respiratory Rate** | $\ge 30\text{ breaths/min}$ | Immediate `CRITICAL` Safety Floor | `prototypeThresholds.ts:21` |
| **Heart Rate (High)** | $\ge 140\text{ bpm}$ | Immediate `CRITICAL` Safety Floor | `prototypeThresholds.ts:22` |
| **Heart Rate (Low)** | $\le 40\text{ bpm}$ | Immediate `CRITICAL` Safety Floor | `prototypeThresholds.ts:23` |
| **Core Temperature (High)** | $\ge 40.5^\circ\text{C}$ | Immediate `CRITICAL` Safety Floor | `prototypeThresholds.ts:24` |
| **Core Temperature (Low)** | $\le 35.0^\circ\text{C}$ | Immediate `CRITICAL` Safety Floor | `prototypeThresholds.ts:25` |
| **Critical Distress Cues** | Stridor, Cyanosis, Confusion/Delirium, Respiratory Distress | Immediate `CRITICAL` Safety Floor | `triageEngine.ts:397-408` |

### Hybrid Fusion Policies

1. `DETERMINISTIC_SAFETY_FLOOR_CRITICAL`: When deterministic red flags trigger, `CRITICAL` priority is strictly enforced even if ML suggests a lower acuity.
2. `ML_UPGRADE_FOR_SAFETY`: When deterministic rules classify low/medium risk but XGBoost detects high-acuity multi-feature interactions, the final recommendation is upgraded for safety and flagged for clinician review.
3. `RULE_SAFETY_OVERRIDE`: When rule-based scoring indicates higher acuity than ML without red flags, rule priority is preserved to prevent unsafe downgrading.
4. `CONCORDANT`: Rule engine and ML arrive at identical acuity levels.
5. `FALLBACK_DETERMINISTIC_ONLY`: Activated if the ML engine is unavailable.

---

## UNKNOWN ≠ NORMAL

A core data governance principle of PatientTriage.ai is:

$$\text{Missing Data} \ne \text{Normal Physiology}$$

In many digital triage tools, missing inputs (such as unmeasured blood pressure) silently default to normal values (e.g., $120/80\text{ mmHg}$), artificially lowering calculated risk.

In PatientTriage.ai:
* If Blood Pressure is left blank at intake, it is recorded as `null`/`UNAVAILABLE`.
* Missing vital inputs reduce the patient's **Data Completeness** score.
* Missing critical inputs trigger explicit **Uncertainty Drivers** and elevate the **Model Uncertainty** level.
* Safety bias prevents downgrading acuity when uncertainty is `HIGH`.

```
Missing Information ──> Reduced Completeness ──> Elevated Uncertainty ──> Safety Bias (No Downgrade)
```

---

## Machine Learning Model

### Model Specifications

* **Algorithm**: XGBoost (`XGBClassifier`) Multi-Class Decision Forest
* **Architecture**: 300 boosted tree estimators (60 per class $\times$ 5 classes)
* **Model Version**: `2.0.0-domain-robust`
* **Target Classes (5)**: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `NON_URGENT`
* **Feature Count**: 71 engineered domain features
* **Training Dataset**: 15,000 synthetic triage records
* **Partition**: 70% Train ($10,500$ rows), 15% Validation ($2,250$ rows), 15% Test ($2,250$ rows)
* **Inference Engine**: In-browser client-side TypeScript tree evaluation (`mlModel.ts`) with numerically stable softmax

### Feature Extraction Breakdown (71 Features)

1. **Objective Vitals & Demographics (12)**: $\text{SpO}_2$, HR, SBP, DBP, RR, Temperature, Pain Score, Duration, Age, Sex Male, Geriatric ($65+$), Pediatric ($<18$).
2. **Pain Context Features (4)**: `pain_missing`, `pain_present`, `pain_severe` ($\ge 7$), `pain_zero_with_symptoms`.
3. **Negation-Protected Clinical Concepts (22)**: Chest pain, palpitations, cardiac arrest history, dyspnea, respiratory distress, stridor, wheezing, cough, altered mental status, stroke signs, seizure/syncope, dizziness, GI bleed, vomiting/nausea, abdominal pain, DKA, neutropenic fever/sepsis, fever symptoms, trauma/fall, elevated INR, psychiatric evaluation, fatigue/weakness.
4. **Physical Signs & Cues (4)**: Cyanosis, diaphoresis, pallor, Levine sign.
5. **Physiological Derived Features (7)**: Shock Index ($\text{HR}/\text{SBP}$), Mean Arterial Pressure, Pulse Pressure, HR abnormality, RR abnormality, Temperature abnormality, $\text{SpO}_2$ hypoxemia.
6. **Nonlinear Clinical Interactions (8)**: Cardiac $\times$ Diaphoresis, Cardiac $\times$ Vomiting, Hypoxemia $\times$ Tachypnea, Fever $\times$ Tachycardia, Shock $\times$ Tachycardia, Altered Mental $\times$ Abnormal Vitals, High-Risk Complaint $\times$ Missing Vitals, Trauma $\times$ Hypotension.
7. **Explicit Missingness & Data Quality Flags (14)**: Missing flags for all vitals, missing vital count, vitals complete indicator, missing age/sex/duration, observed cues available, medical history available.

---

## Model Probability vs Uncertainty

PatientTriage.ai maintains strict separation between mathematical classifier probability and system uncertainty:

```
┌──────────────────────────────────────┐     ┌──────────────────────────────────────┐
│          MODEL PROBABILITY           │     │          MODEL UNCERTAINTY           │
├──────────────────────────────────────┤     ├──────────────────────────────────────┤
│ • Mathematical softmax output for    │     │ • Multi-factor system assessment     │
│   the predicted class (0.0% – 100%)  │     │   ('LOW', 'MODERATE', 'HIGH')        │
│ • Represents classifier margin       │     │ • Driven by probability margins,     │
│ • Does NOT imply clinical certainty  │     │   missing data & clinical ambiguity  │
└──────────────────────────────────────┘     └──────────────────────────────────────┘
```

* **Model Probability**: The softmax probability assigned by the XGBoost model to its top predicted class (e.g., $81.9\%$ for `MEDIUM`).
* **Model Uncertainty**: Evaluated via top-versus-second class probability margins ($\Delta < 0.15 \rightarrow \text{HIGH}$ uncertainty) combined with input data completeness.

---

## Explainability

Every model evaluation provides local and global feature attribution via **Tree SHAP** (SHapley Additive exPlanations):

```
Patient Data ──> Tree Traversal ──> Local SHAP Value ──> Directional Impact (↑ Risk / ↓ Risk)
```

### Global Feature Importance (Top Variables)

1. `temperature_c` ($0.080$)
2. `sbp_mmhg` ($0.079$)
3. `resp_rate_bpm` ($0.076$)
4. `heart_rate_bpm` ($0.072$)
5. `spo2_pct` ($0.066$)
6. `feat_chest_pain` ($0.054$)
7. `shock_index` ($0.049$)
8. `feat_altered_mental_status` ($0.045$)

> [!NOTE]
> **Interpretation Guardrail**: SHAP values describe internal model attribution and mathematical feature influence within the tree ensemble. They do **not** establish medical causation or clinical etiology.

---

## Continuous Waiting-Room Monitoring

The **Waiting-Room Radar™** runs continuous surveillance across all queued patients:

```
[Arrival] ──> [Initial Triage] ──> [Waiting Room Queue] ──> [Radar Surveillance] ──> [Alert & Escalation]
```

### Monitoring States

| State | Badge | Description | Action Required |
|---|---|---|---|
| `ESCALATE` | 🔴 Red | Acute vital deterioration or safety red flag triggered | Immediate bedside clinical intervention |
| `REASSESS` | 🟠 Orange | Queue wait time exceeded configured threshold | Nursing reassessment and vitals refresh |
| `WATCH` | 🟡 Yellow | Active surveillance (high uncertainty or ML disagreement) | Passive observation and monitoring |
| `SAFE` | 🟢 Green | Vitals stable, wait duration within safe limits | Standard queue progression |

### Configured Wait-Time Thresholds

| Priority | Maximum Allowable Wait Time |
|---|---|
| `CRITICAL` | $0\text{ minutes}$ (Immediate resuscitation) |
| `HIGH` | $15\text{ minutes}$ |
| `MEDIUM` | $30\text{ minutes}$ |
| `LOW` / `NON_URGENT` | $60\text{ minutes}$ |

---

## Reassessment & Deterioration Detection

The system tracks historical vital sign series (`vitalsHistory`) and triggers immediate deterioration alerts upon detecting:

* **Oxygen Saturation Drop**: $\text{SpO}_2 \downarrow \ge 3\%$
* **Heart Rate Spike**: $\text{Heart Rate} \uparrow \ge 15\text{ bpm}$
* **Respiratory Rate Increase**: $\text{Respiratory Rate} \uparrow \ge 6\text{ breaths/min}$

When deterioration is detected, the UI renders:
1. **"Why Now?" Alert Banner**: Contextual justification explaining why the patient requires urgent attention.
2. **Evidence Diff ("What Changed?")**: Visual table contrasting previous vitals against current readings with directional deltas.

---

## Clinician Override & Audit Logging

### Clinician Override

When a licensed clinician disagrees with an AI recommendation, they can override the acuity via a dedicated interface:
* **Mandatory Reason Categories**:
  * New clinical observation
  * Patient condition changed
  * Additional information available
  * AI recommendation inconsistent with physical assessment
  * Other (detailed in notes)
* **Clinical Justification**: Free-text clinical notes required.
* **Clinician Identification**: Logged with clinician name/ID and timestamp.

### Immutable Audit Trail

Every critical operational event is recorded to the audit log (`src/components/views/AuditLogView.tsx`):
* `PATIENT_REGISTERED`, `VITALS_RECORDED`, `AI_ASSESSMENT_GENERATED`
* `SAFETY_FLOOR_OVERRIDE`, `MODEL_RULE_DISAGREEMENT`
* `DETERIORATION_DETECTED`, `REASSESSMENT_TRIGGERED`
* `CLINICIAN_OVERRIDE`, `SURGE_MODE_ACTIVATED`

---

## Edge Cases

### Case 1: P-127 — Atypical Presentation (ML Catches Interaction)

* **Clinical Presentation**: 45-year-old male presenting with chest pain, vomiting, dizziness, observed Levine sign (clenched fist over sternum), and unmeasured blood pressure.
* **Deterministic Rule Engine**: Scores $22/100 \rightarrow \text{NON\_URGENT}$ due to missing vitals and low baseline symptom keywords.
* **XGBoost Advisory Model**: Predicts `MEDIUM` ($81.9\%$ Model Probability) by recognizing the non-linear interaction between chest pain, vomiting, and the Levine sign.
* **Hybrid Safety Fusion**: Applies `ML_UPGRADE_FOR_SAFETY`, promoting the final system recommendation to `MEDIUM` and triggering an advisory disagreement alert on the Waiting-Room Radar.

### Case 2: P-146 — Safety Floor Enforcement (Deterministic Override)

* **Clinical Presentation**: 45-year-old male presenting with mild cough, fever ($38.2^\circ\text{C}$), severe hypoxemia ($\text{SpO}_2 = 78\%$), and bradycardia ($49\text{ bpm}$).
* **XGBoost Advisory Model**: Predicts `MEDIUM` based on benign chief complaint text ("fever and cold").
* **Deterministic Safety Rule**: Red flag triggers immediately for Critical Hypoxemia ($\text{SpO}_2 < 88\%$).
* **Hybrid Safety Fusion**: Applies `DETERMINISTIC_SAFETY_FLOOR_CRITICAL`, strictly enforcing `CRITICAL` priority and preventing an unsafe ML downgrade. In 100% of tested safety-floor scenarios, deterministic safety rules successfully override lower ML predictions.

---

## Benchmark Results

### Prototype Benchmark on Synthetic Demonstration Data

> [!NOTE]
> The following benchmark results were evaluated on a held-out test split ($2,250$ records) of the synthetic demonstration dataset. These results demonstrate prototype architecture behavior and do **not** represent real-world clinical performance.

| Model / Architecture | Accuracy | Macro F1-Score | Critical Class Recall | High + Critical Sensitivity |
|---|---:|---:|---:|---:|
| **Deterministic Rules Only** | $44.71\%$ | $30.90\%$ | $91.53\%$ | $88.24\%$ |
| **Multinomial Logistic Regression Baseline** | $83.51\%$ | $81.00\%$ | $92.82\%$ | $95.12\%$ |
| **XGBoost Advisory Model (V1)** | $85.82\%$ | $83.47\%$ | $95.21\%$ | $97.65\%$ |
| **XGBoost Domain-Robust Model (V2)** | **$90.79\%$** | **$88.20\%$** | **$95.99\%$** | **$98.87\%$** |

* **Zero Critical→Low/Non-Urgent Misclassifications in the Synthetic Holdout Test Set**: On the evaluated synthetic test partition ($2,250$ records), $0$ true Critical cases were classified into Low or Non-Urgent categories. *(Note: This result applies strictly to the evaluated synthetic test set and does not establish real-world clinical safety or diagnostic accuracy.)*
* **Exploratory Generalization Benchmark on De-Identified EHR Sample**: Evaluated on an untouched holdout sample of $207$ labeled records from the MIMIC-IV-ED database (`ml/data/triage.csv.gz`, ESI levels 1–4), the domain-robust feature extraction identified $88.89\%$ ($16/18$) of Critical resuscitation cases (ESI Level 1) and $61.74\%$ ($71/115$) of High+Critical cases (ESI Levels 1–2) in zero-shot evaluation without fine-tuning. This exploratory evaluation demonstrates prototype transferability under missing data conditions, but does not constitute prospective clinical validation.

---

## Data & Limitations

### Prominent Clinical Limitations

1. **Synthetic Training Data**: The model is trained and tested exclusively on synthetic demonstration data. Synthetic distributions cannot replicate the complexity, comorbid noise, or distribution shifts of real hospital EHR environments.
2. **Not Clinically Validated**: This system has **not** undergone clinical trials, institutional review board (IRB) review, or prospective hospital validation.
3. **Not a Medical Device**: The software is not approved or certified as Software as a Medical Device (SaMD) by CDSCO, FDA, CE, or any regulatory authority.
4. **Prototype Status**: Numerical risk weights and red-flag thresholds are illustrative demonstration parameters.
5. **Mandatory Human Oversight**: The system is designed strictly for decision support. Clinician oversight is required for every triage decision.

---

## Technology Stack

### Application Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | `18.2.0` | Component-based interactive UI framework |
| **TypeScript** | `5.3.3` | Strict static typing and interface contracts |
| **Vite** | `5.1.6` | Development server and production bundler |
| **Tailwind CSS** | `3.4.1` | Dark clinical dashboard design system |
| **Recharts** | `2.12.2` | Interactive vitals trend lines and SHAP feature charts |
| **Lucide React** | `0.354.0` | Clinical, operational, and navigational iconography |
| **Framer Motion** | `11.0.8` | UI transitions and queue animations |

### Machine Learning Pipeline

| Technology | Purpose |
|---|---|
| **Python 3.10+** | Feature engineering and model training runtime |
| **XGBoost** | Gradient Boosted Decision Tree multi-class classifier |
| **scikit-learn** | Stratified splitting, logistic regression baseline, evaluation metrics |
| **SHAP** | TreeExplainer model attribution and feature importance computation |
| **pandas & NumPy** | Data manipulation and numerical operations |

---

## Project Structure

```
patient_triage/
├── docs/
│   └── PatientTriage_Submission.md            # Comprehensive competition submission document
├── ml/
│   ├── data/
│   │   ├── patienttriage_synthetic_xgboost_15000.csv  # Synthetic dataset (15k rows)
│   │   ├── patienttriage_synthetic_v2.csv             # Augmented dataset (16k rows)
│   │   └── splits/                                    # train.csv, val.csv, test.csv
│   ├── models/
│   │   ├── xgboost_triage_model_v1.json               # Baseline model artifact
│   │   ├── xgboost_triage_model_v2.json               # Domain-robust model artifact
│   │   ├── feature_metadata_v2.json                   # 71-feature metadata schema
│   │   └── logistic_regression_baseline.joblib        # Baseline linear model
│   └── src/
│       ├── features.py                                # Baseline feature extraction
│       ├── features_v2.py                             # 71-feature domain-robust pipeline
│       ├── split.py                                   # Stratified dataset partitioning
│       ├── train_models.py                            # Model training with early stopping
│       ├── baseline_rules.py                          # Deterministic rule evaluation
│       └── evaluate.py                                # Model benchmark and evaluation
├── src/
│   ├── components/
│   │   ├── common/                                    # WhyNowAlert, WhatChangedDiff
│   │   ├── layout/                                    # TopBar, Sidebar
│   │   ├── modals/                                    # PatientDetail, Override, Architecture, Demo
│   │   └── views/                                     # CommandCenter, Radar, Intake, Safety, etc.
│   ├── config/
│   │   ├── ageGroupConfig.ts                          # Pediatric, adult, geriatric parameters
│   │   ├── hospitalProfiles.ts                        # Facility configuration presets
│   │   ├── prototypeThresholds.ts                     # Red-flag & wait-time thresholds
│   │   └── riskWeights.ts                             # Rule scoring weights
│   ├── data/
│   │   └── syntheticPatients.ts                       # 22 pre-configured synthetic patients
│   ├── engine/
│   │   ├── mlModel.ts                                 # In-browser XGBoost inference engine
│   │   ├── modelData.ts                               # Exported decision tree ensemble
│   │   └── triageEngine.ts                            # Deterministic rules & hybrid fusion
│   ├── types/
│   │   └── index.ts                                   # Core TypeScript interfaces
│   ├── App.tsx                                        # Root application shell
│   └── main.tsx                                       # Application entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Installation

### Prerequisites
* **Node.js**: v18.0 or higher
* **npm**: v9.0 or higher

### Step-by-Step Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sahilsheoran999/patient_triage.git
   cd patient_triage
   ```

2. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

---

## Running the Application

### Development Mode
Launch the local Vite development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build & Preview
```bash
npm run build
npm run preview
```

---

## ML Training Pipeline

To reproduce the dataset split, train the XGBoost model, and run benchmark evaluations:

1. **Install Python dependencies**:
   ```bash
   pip install xgboost scikit-learn shap pandas numpy joblib
   ```

2. **Create stratified data splits**:
   ```bash
   python ml/src/split.py
   ```

3. **Train baseline and XGBoost models**:
   ```bash
   python ml/src/train_models.py
   ```

4. **Run model evaluation and SHAP analysis**:
   ```bash
   python ml/src/evaluate.py
   ```

---

## Testing & Verification

Run strict TypeScript type-checking:
```bash
npx tsc --noEmit
```

Execute the full production build:
```bash
npm run build
```

---

## Security & Data Protection

* **Zero Real PHI**: The repository contains exclusively synthetic patient profiles.
* **Privacy-by-Design**: Masked patient identifiers (`P-***`) prevent exposure of direct identifiers.
* **Immutable Audit Trail**: All overrides and system state changes are permanently logged.
* **Client-Side Processing**: ML inference executes locally in-browser without sending patient telemetry to external AI endpoints.

---

## Troubleshooting

| Issue | Cause | Solution |
|---|---|---|
| `npx tsc --noEmit` fails on imports | Missing node modules | Run `npm install` |
| Vite dev server port conflict | Port 5173 in use | Vite will automatically select the next open port (e.g., 5174) |
| Python script `FileNotFoundError` | Executing from wrong directory | Run scripts from repository root (`python ml/src/train_models.py`) |

---

## FAQ

**Q: Is PatientTriage.ai clinically validated?**
A: No. It is a research prototype evaluated on synthetic demonstration data.

**Q: Can the XGBoost model override a critical safety rule?**
A: No. Deterministic safety rules act as an unbreachable safety authority. A `CRITICAL` safety floor can never be downgraded by the advisory model.

**Q: Is Model Probability the same as clinical confidence?**
A: No. Model probability reflects the classifier's mathematical softmax distribution across classes. System uncertainty is assessed separately.

**Q: Can the system autonomously triage patients?**
A: No. Licensed clinicians retain 100% final decision authority over all patient assessments.

---

## Future Improvements

* [ ] Validation on governed, de-identified real-world clinical datasets.
* [ ] Multi-center external validation across academic and community emergency departments.
* [ ] Prospective shadow evaluation alongside licensed emergency triage nurses.
* [ ] Conformal prediction for statistically rigorous uncertainty bounds.
* [ ] Integration with HL7 FHIR and hospital EHR systems.
* [ ] Formal regulatory and clinical safety evaluation.

---

## License

* **Status**: Competition Technical Submission Prototype
* **License**: MIT (Prototype Simulation Only)
