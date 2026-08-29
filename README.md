# PatientTriage.ai

> Clinical decision-support prototype for emergency-department triage, continuous waiting-room monitoring, and hybrid rule-based + machine-learning risk assessment.

---

> [!WARNING]
> ### PROTOTYPE / SIMULATION ONLY — NOT FOR CLINICAL USE
> * All patient records, clinical presentations, and triage logs in this application are completely **synthetic**.
> * All physiological thresholds, risk weights, and decision rules are illustrative parameters for demonstration purposes and are **NOT** validated clinical guidelines.
> * The integrated **XGBoost model** is trained on synthetic demonstration data. Reported benchmark metrics demonstrate prototype architecture behavior and do **NOT** establish clinical validity or diagnostic accuracy.
> * This system does **NOT** autonomously diagnose patients or make independent medical decisions.
> * **Licensed clinicians retain 100% final decision and triage authority at all times.**

---

## 1. Project Overview

Emergency departments operate under intense time pressure, fluctuating surge volumes, and incomplete intake information. Furthermore, a patient's clinical state is dynamic—conditions can deteriorate rapidly while waiting in queue.

**PatientTriage.ai** demonstrates a safety-first clinical decision-support architecture that unifies:
* **Structured & Incomplete Intake Handling** with explicit `UNKNOWN ≠ NORMAL` data governance.
* **Deterministic Safety Rules** acting as an unbreachable safety authority with hard safety floors.
* **Transparent Rule-Based Risk Scoring** providing fully explainable factor decomposition.
* **XGBoost Advisory Machine Learning** identifying nonlinear multi-vital clinical patterns.
* **Model Probability & Model Uncertainty** surfacing model distributions without clinical overclaiming.
* **Local & Global SHAP Feature Attribution** explaining model predictions transparently.
* **Hybrid Safety Fusion** enforcing that advisory ML cannot override deterministic safety constraints.
* **Waiting-Room Radar™** providing continuous vital-trend deterioration tracking and queue wait-time monitoring.
* **Human-in-the-Loop Governance** requiring mandatory clinician override logging and immutable audit trails.

The system is designed strictly as an **AI-assisted decision-support prototype**, never as an autonomous diagnostic engine.

---

## 2. System Architecture

The architecture consists of a sequential 11-layer data and safety pipeline:

```
                                  PHASE 1: DETERMINISTIC INTAKE & ML ADVISORY INFERENCE
┌──────────────────┐     ┌──────────────────┐     ┌────────────────────────┐     ┌────────────────────────┐     ┌────────────────────────┐
│     LAYER 01     │ ──> │     LAYER 02     │ ──> │        LAYER 03        │ ──> │        LAYER 04        │ ──> │        LAYER 05        │
│   Patient Data   │     │   Data Quality   │     │  Age-Aware Baseline    │     │  Deterministic Safety  │     │ Rule-Based Risk Assess │
│ (Vitals, Intake) │     │(UNKNOWN ≠ NORMAL)│     │(Ped / Adult / Geriatric│     │(Safety Authority Floors│     │   (Scored Risk 0-100)  │
└──────────────────┘     └──────────────────┘     └────────────────────────┘     └────────────────────────┘     └────────────────────────┘
                                                                                             │                               │
                                                                                             │                               ▼
                                                                                             │                  ┌────────────────────────┐
                                                                                             │                  │        LAYER 06        │
                                                                                             │                  │ XGBoost Advisory Model │
                                                                                             │                  │  (71 Domain Features)  │
                                                                                             │                  └────────────────────────┘
                                                                                             │                               │
                                                                                             │                               ▼
                                                                                             │                  ┌────────────────────────┐
                                                                                             │                  │        LAYER 07        │
                                                                                             │                  │  Model Probabilities + │
                                                                                             │                  │    Model Uncertainty   │
                                                                                             │                  └────────────────────────┘
                                                                                             │                               │
                                                                                             ▼                               ▼
                                                                               ┌─────────────────────────────────────────────────────────┐
                                                                               │          LAYER 08: SAFETY FUSION / SAFETY FLOOR         │
                                                                               │  (Deterministic Safety Rules Constrain Advisory Model)  │
                                                                               │    • ML cannot override deterministic safety floors     │
                                                                               │    • Model disagreement highlighted for review          │
                                                                               └─────────────────────────────────────────────────────────┘
                                                                                                             │
                                                                                                             ▼
                                  PHASE 2: HYBRID SAFETY FUSION & CLINICIAN CONTROL
                                                                               ┌────────────────────────┐     ┌────────────────────────┐
                                                                               │        LAYER 09        │ ──> │        LAYER 10        │
                                                                               │  Final Recommendation  │     │   Clinician Decision   │
                                                                               │   (Decision Support)   │     │ (Final Human Authority)│
                                                                               └────────────────────────┘     └────────────────────────┘
                                                                                                                             │
                                                                                                                             ▼
                                                                                                              ┌────────────────────────┐
                                                                                                              │        LAYER 11        │
                                                                                                              │   Audit & Continuous   │
                                                                                                              │   Radar Monitoring     │
                                                                                                              └────────────────────────┘
```

### Detailed Layer Specifications:

* **Layer 01 — Patient Data (Input):** Captures structured vitals ($\text{SpO}_2$, HR, SBP, DBP, RR, Temperature), demographics (Age, Age Group, Sex), chief complaint, symptom severity ($1\text{–}10$), symptom duration, associated symptoms, medical history, allergies, and clinician-observed physical cues.
* **Layer 02 — Data Quality (`UNKNOWN ≠ NORMAL`):** Missing vitals or absent history records are never assumed to be normal. Instead, missing fields reduce data completeness percentage, elevate uncertainty penalties, and trigger missing-input safety flags.
* **Layer 03 — Age-Aware Normalization:** Distinguishes Pediatric ($<18$), Adult ($18\text{–}64$), and Geriatric ($65+$) physiological baselines, applying age-specific multipliers to risk scoring.
* **Layer 04 — Deterministic Safety Engine (Safety Authority):** Evaluates deterministic Layer 1 physiological red flags that immediately mandate a `CRITICAL` safety floor:
  * Critical Hypoxemia: $\text{SpO}_2 < 88\%$
  * Critical Hypotension: $\text{Systolic BP} < 80\text{ mmHg}$
  * Critical Hypertension: $\text{Systolic BP} \ge 200\text{ mmHg}$
  * Critical Tachypnea: $\text{Respiratory Rate} \ge 30\text{ /min}$
  * Critical Tachycardia: $\text{Heart Rate} \ge 140\text{ bpm}$
  * Critical Bradycardia: $\text{Heart Rate} \le 40\text{ bpm}$
  * Critical Hyperthermia: $\text{Temperature} \ge 40.5^\circ\text{C}$
  * Critical Hypothermia: $\text{Temperature} \le 35.0^\circ\text{C}$
  * Observed Acute Signs: Severe respiratory distress, stridor/wheezing, confusion/delirium, cyanosis, or prolonged capillary refill ($>3\text{s}$).
  * *Invariant:* **ML cannot override deterministic safety floors.**
* **Layer 05 — Rule-Based Risk Assessment:** Computes an illustrative weighted risk score ($0\text{–}100$) using configured prototype weights ($\text{SpO}_2$: $32$, Respiratory: $24$, Observed Distress: $12$, Age: $10$, HR: $8$, BP: $6$, Temp: $6$, History: $4$) with transparent factor decomposition.
* **Layer 06 — XGBoost Advisory Model (Advisory):** Evaluates a 71-feature domain-robust Gradient Boosted Decision Tree ensemble trained across 5 triage acuity classes (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `NON_URGENT`).
* **Layer 07 — Model Probability & Model Uncertainty:** Generates exact class probability distributions, computes top-vs-second probability margins, assesses model uncertainty (`LOW`, `MODERATE`, `HIGH`), and computes local feature attributions via tree SHAP.
* **Layer 08 — Safety Fusion / Safety Floor:** Fuses the deterministic safety floor and advisory ML output:
  * If deterministic red flags are present $\rightarrow$ enforces `CRITICAL` priority (`DETERMINISTIC_SAFETY_FLOOR_CRITICAL`).
  * If ML indicates higher acuity than rules without red flags $\rightarrow$ upgrades priority for safety (`ML_UPGRADE_FOR_SAFETY`) and flags advisory disagreement.
  * If ML suggests a downgrade below rule assessment $\rightarrow$ preserves rule priority (`RULE_SAFETY_OVERRIDE`).
* **Layer 09 — Final Recommendation:** Presents the AI-assisted decision-support recommendation alongside rule priority, ML prediction, model probability, uncertainty drivers, and disagreement indicators.
* **Layer 10 — Clinician Decision (Final Authority):** Licensed clinicians evaluate the recommendation and retain final authority to accept, order reassessment, or manually override the priority. Overrides require a mandatory reason code and clinical note.
* **Layer 11 — Audit & Continuous Monitoring:** Emits immutable audit log records for every registration, prediction, override, and state change, and hands the patient off to the Waiting-Room Radar™ for active queue monitoring.

---

## 3. Hybrid Safety Architecture

The system enforces a strict hierarchy among three distinct authorities:

```
                    PATIENT DATA
                         |
              +----------+----------+
              |                     |
       DETERMINISTIC            XGBOOST
       SAFETY ENGINE            ADVISORY MODEL
     (Safety Authority)       (Advisory Predictive)
              |                     |
        SAFETY FLOOR          MODEL PROBABILITIES
              |                     |
              +----------+----------+
                         |
                   SAFETY FUSION
             (Safety Floor Constrains ML)
                         |
                FINAL RECOMMENDATION
                         |
                 CLINICIAN REVIEW
              (Final Human Authority)
                         |
                 IMMUTABLE AUDIT
```

| Authority Component | Role in System | Authority Level | Constraint Enforcement |
|---|---|---|---|
| **Deterministic Safety Engine** | Hard physiological red-flag evaluation | **Safety Authority** | Strictly enforces `CRITICAL` safety floors; cannot be downgraded by ML. |
| **XGBoost Classifier** | Multi-feature nonlinear acuity estimation | **Advisory Signal** | Advisory decision support; provides probabilities and feature attributions. |
| **Safety Fusion Layer** | Rule + ML reconciliation logic | **Safety Gate** | Applies $\max(\text{Safety Floor}, \text{ML Upgrade})$; prevents unsafe downgrades. |
| **Clinician** | Human-in-the-loop medical triage | **Final Authority** | 100% final override authority; all actions logged to audit trail. |

---

## 4. Waiting-Room Radar™

Triage is not a one-time event at the intake desk. Patients in emergency department waiting rooms may experience vital deterioration or exceed safe waiting durations.

```
WAITING PATIENT ──> RADAR EVALUATION ──> RISK CHANGE? ──> REASSESS ALERT ──> CLINICIAN REVIEW
  (Queue State)    (Wait Time + Vitals)   (Delta Diff)     (Why Now Banner)   (Bedside Action)
```

### Core Radar Capabilities:
1. **Deterioration Detection ("What Changed?"):** Tracks historical vital sign series and flags acute drops in queue (e.g. $\text{SpO}_2 \downarrow \ge 3\%$, $\text{Heart Rate} \uparrow \ge 15\text{ bpm}$, $\text{Resp Rate} \uparrow \ge 6\text{ /min}$). Renders an evidence diff showing exact previous vs current values.
2. **Configured Wait-Time Monitoring:** Continuously compares elapsed wait time against configured prototype thresholds (`CRITICAL`: $0\text{m}$, `HIGH`: $15\text{m}$, `MEDIUM`: $30\text{m}$, `LOW`: $60\text{m}$).
3. **Truthful "Why Now?" Alerts:** Distinguishes between 5 distinct monitoring triggers with tailored visual indicators:
   * `SAFETY_RED_FLAG` $\rightarrow$ *"Safety Floor Triggered: SpO₂ Abnormality (<88%). Deterministic safety rules enforce CRITICAL priority."*
   * `DETERIORATION` $\rightarrow$ *"Deterioration Detected: Vital trend deterioration SpO₂ ↓ 7%; HR ↑ 30 recorded 2m ago."*
   * `MODEL_RULE_DISAGREEMENT` $\rightarrow$ *"Advisory Model Disagreement: Deterministic rules classify patient as NON_URGENT (Risk 23/100), while XGBoost predicts CRITICAL (46.4%). Clinician review recommended."*
   * `WAIT_TIME_EXCEEDED` $\rightarrow$ *"Waiting-Time Threshold Exceeded: Patient has waited 85 minutes; configured threshold is 30 minutes."*
   * `HIGH_UNCERTAINTY` $\rightarrow$ *"High Uncertainty Review: Missing blood pressure and medical history. Cautious review recommended."*

---

## 5. Machine Learning Architecture & Benchmark

### Model Specifications:
* **Algorithm:** XGBoost (`XGBClassifier`) Multi-Class Gradient Boosted Decision Trees
* **Target Acuity Classes (5):** `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `NON_URGENT`
* **Features (71):** Objective vitals, derived hemodynamics (Shock Index $\text{HR}/\text{SBP}$, Mean Arterial Pressure, Pulse Pressure), 22 negation-protected clinical concepts extracted from free-text complaints, explicit missingness flags, and nonlinear clinical interaction terms.
* **Dataset:** 15,000 synthetic emergency triage records (augmented with 1,000 conflicting-signal validation archetypes).
* **Partition:** 70% Training ($10,500$ rows), 15% Validation ($2,250$ rows), 15% Test ($2,250$ rows).

### Synthetic Demonstration Benchmark Results

> [!NOTE]
> These metrics demonstrate prototype model behavior on the synthetic evaluation benchmark. They do **NOT** establish real-world clinical accuracy or medical safety.

| Model / Architecture | Accuracy | Macro F1-Score | Critical Recall (Sensitivity) | High + Critical Sensitivity |
|---|---:|---:|---:|---:|
| **Deterministic Rules Only** | $44.71\%$ | $30.90\%$ | $91.53\%$ | $88.24\%$ |
| **Logistic Regression Baseline** | $83.51\%$ | $81.00\%$ | $92.82\%$ | $95.12\%$ |
| **XGBoost Advisory Model (V1)** | $85.82\%$ | $83.47\%$ | $95.21\%$ | $97.65\%$ |
| **XGBoost Domain-Robust Model (V2)** | **$90.79\%$** | **$88.20\%$** | **$95.99\%$** | **$98.87\%$** |

* **Zero Catastrophic Misses:** In testing across held-out synthetic test sets, $0$ true Critical patients were predicted as Low or Non-Urgent.
* **External Zero-Shot EHR Benchmark:** Evaluated on an untouched holdout of $207$ labeled MIMIC-IV-ED records, the domain-robust feature engineering increased Critical resuscitation recall from $0.00\% \rightarrow 88.89\%$ ($16/18$ detected) and High+Critical sensitivity from $13.91\% \rightarrow 61.74\%$ ($71/115$ detected) without tuning to the external dataset.

---

## 6. Safety Edge Cases & Demonstrations

The system includes pre-configured synthetic demo cases illustrating the hybrid decision architecture:

### Case 1: P-127 (Atypical Presentation — Model Disagreement)
* **Presentation:** Crushing substernal chest pressure, diaphoresis, vomiting, Levine sign, unmeasured blood pressure.
* **Rule Engine:** Risk Score $22/100 \rightarrow \text{NON\_URGENT}$ (due to missing vitals and low baseline rule coverage).
* **XGBoost Prediction:** $\text{MEDIUM} / \text{HIGH}$ ($81.9\%$ probability) recognizing multi-symptom coronary ischemia pattern.
* **Safety Fusion Policy:** `ML_UPGRADE_FOR_SAFETY` upgrades final recommendation to $\text{MEDIUM}$, flags advisory disagreement, and highlights patient on Waiting-Room Radar.

### Case 2: P-146 (Deterministic Red Flag — Safety Floor Enforced)
* **Presentation:** Elderly patient presenting with cough, fever, severe hypoxemia ($\text{SpO}_2 = 78\%$), bradycardia ($\text{HR} = 49\text{ bpm}$).
* **XGBoost Prediction:** Advisory model predicts $\text{MEDIUM}$ ($87.8\%$ probability) based on benign text symptoms.
* **Rule Engine:** Layer 1 Red Flag triggers immediately ($\text{SpO}_2 < 88\%$).
* **Safety Fusion Policy:** `DETERMINISTIC_SAFETY_FLOOR_CRITICAL` strictly enforces $\text{CRITICAL}$ priority, overriding the lower ML advisory prediction.

---

## 7. Explainability & Interpretability

* **Global Explainability (Tree SHAP):** Global feature importances across the ensemble show balanced attribution across objective physiology ($\text{Temp}: 0.080$, $\text{SBP}: 0.079$, $\text{RR}: 0.076$, $\text{HR}: 0.072$, $\text{SpO}_2: 0.066$), clinical concepts ($\text{Chest Pain}: 0.054$, $\text{Altered Mental Status}: 0.045$), and derived hemodynamics ($\text{Shock Index}: 0.049$).
* **Local Explainability (Patient Detail):** Every patient evaluation displays the top 5 SHAP feature contributions, indicating the direction of influence (`increases_acuity` vs `decreases_acuity`).
* *Interpretation Guardrail:* SHAP values represent **mathematical feature attributions** within the decision tree ensemble and do **NOT** imply clinical causation or diagnostic etiology.

---

## 8. Implemented Features

* **Command Center:** Real-time ED board with active patient cards, wait times, priority badges, category filters, and live surge simulation.
* **Waiting-Room Radar™:** Continuous queue timeline monitoring with automated vital deterioration detection and wait-time threshold alerts.
* **Patient Intake View:** Interactive registration form capturing vitals, complaints, severity, duration, history, and cues with live data completeness gauge and explicit `UNKNOWN ≠ NORMAL` preservation.
* **Patient Detail Modal:** Comprehensive clinical dossier with vitals timeline chart, SHAP feature attributions, hybrid decision breakdown, and override controls.
* **Clinician Override Modal:** Human-in-the-loop override interface requiring mandatory reason codes and clinical notes with live audit emission.
* **Audit Log View:** Immutable audit trail logging all system registrations, model predictions, rule triggers, overrides, and radar alerts.
* **Safety Policy View:** Interactive clinical safety policy documentation and visual 10-stage hybrid architecture diagram.
* **Analytics & Performance View:** Model probability distributions, uncertainty analytics, and prototype performance metrics.
* **Hospital Configuration:** Customizable red-flag vitals thresholds and maximum allowable wait times.
* **Data Protection & Governance:** Compliance view modeling synthetic healthcare data protections and DPDP principles.

---

## 9. Project Structure

```
patient-triage/
├── ml/
│   ├── data/
│   │   ├── patienttriage_synthetic_xgboost_15000.csv  # Synthetic dataset (15k rows)
│   │   ├── patienttriage_synthetic_v2.csv             # Augmented dataset (16k rows)
│   │   └── splits/                                    # Train / Val / Test splits
│   ├── models/
│   │   ├── xgboost_triage_model_v1.json               # Baseline XGBoost model
│   │   ├── xgboost_triage_model_v2.json               # Domain-robust XGBoost model
│   │   ├── feature_metadata_v2.json                   # 71-feature metadata schema
│   │   └── logistic_regression_baseline.joblib        # Baseline linear model
│   └── src/
│       ├── features.py                                # Baseline feature engineering
│       ├── features_v2.py                             # 71-feature domain-robust pipeline
│       ├── split.py                                   # Stratified dataset partitioning
│       ├── train_models.py                            # Model training with early stopping
│       ├── baseline_rules.py                          # Rule engine evaluation
│       └── evaluate.py                                # Comprehensive model benchmark
├── src/
│   ├── components/
│   │   ├── common/                                    # Reusable UI alerts & badges
│   │   ├── layout/                                    # TopBar & navigation
│   │   ├── modals/                                    # PatientDetail, Override, Architecture
│   │   └── views/                                     # CommandCenter, Radar, Intake, Safety
│   ├── config/
│   │   ├── ageGroupConfig.ts                          # Pediatric, adult, geriatric configs
│   │   ├── prototypeThresholds.ts                     # Red flag & wait time thresholds
│   │   └── riskWeights.ts                             # Rule-based scoring weights
│   ├── data/
│   │   └── syntheticPatients.ts                       # Pre-configured synthetic scenarios
│   ├── engine/
│   │   ├── mlModel.ts                                 # In-browser XGBoost inference engine
│   │   ├── modelData.ts                               # Exported decision tree data (1,500 trees)
│   │   └── triageEngine.ts                            # Deterministic rules & hybrid fusion
│   ├── types/
│   │   └── index.ts                                   # Core TypeScript interfaces
│   ├── App.tsx                                        # Root application component
│   └── main.tsx                                       # Vite application entry point
├── package.json                                       # Dependencies and build scripts
├── tsconfig.json                                      # TypeScript configuration
├── vite.config.ts                                     # Vite build configuration
└── README.md                                          # Complete architecture documentation
```

---

## 10. Tech Stack

### Frontend & Application:
* **React 18** (`react`, `react-dom`) — Component-driven reactive UI
* **TypeScript 5.3** — Strict static type checking and interface contracts
* **Vite 5.4** — High-performance ES module bundler and dev server
* **Tailwind CSS 3.4** — Dark clinical mission-control design system
* **Lucide React** — Consistent medical and operational iconography
* **Recharts 2.12** — Interactive vitals trends and feature attribution charts
* **Framer Motion 11.0** — Smooth queue state and transition animations

### Machine Learning & Data Pipeline:
* **Python 3.10+** — ML training and feature engineering runtime
* **XGBoost** (`xgboost`) — Gradient Boosted Decision Tree ensemble
* **scikit-learn** — Stratified dataset splitting and baseline evaluation
* **SHAP** — TreeExplainer model attribution and feature importance
* **pandas & NumPy** — Tabular data manipulation and numerical operations

---

## 11. Getting Started

### Prerequisites:
* **Node.js**: v18.0 or higher
* **npm**: v9.0 or higher

### Local Installation:

1. Clone the repository:
   ```bash
   git clone https://github.com/sahilsheoran999/patient_triage.git
   cd patient_triage
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

### Quality & Build Verification:

Run strict TypeScript typechecking:
```bash
npx tsc --noEmit
```

Build the production distribution package:
```bash
npm run build
```

---

## 12. Retraining the ML Model (Optional)

To reproduce or retrain the XGBoost triage model:

1. Set up a Python virtual environment and install dependencies:
   ```bash
   pip install xgboost scikit-learn shap pandas numpy joblib
   ```

2. Partition the dataset:
   ```bash
   python ml/src/split.py
   ```

3. Train the baseline and XGBoost models:
   ```bash
   python ml/src/train_models.py
   ```

4. Run evaluation and SHAP analysis:
   ```bash
   python ml/src/evaluate.py
   ```

---

## 13. Limitations

* **Synthetic Data Only:** The model and prototype are trained and evaluated exclusively on synthetic data. Real clinical environments exhibit severe distribution shifts, comorbidities, and unmeasured confounding not present in synthetic datasets.
* **No Clinical Validation:** This system has **not** undergone prospective clinical trials, institutional review, or hospital EHR validation.
* **No Regulatory Approval:** The software is not certified as a medical device (SaMD) by the FDA, CE, CDSCO, or any regulatory body.
* **Illustrative Parameters:** All numerical risk weights and thresholds are prototype demonstrations and must not be used as clinical guidelines.
* **Mandatory Human Authority:** The system must never be used autonomously. Clinician oversight is mandatory for all patient assessments.

---

## 14. Future Work

1. Validation on appropriately governed, de-identified real-world clinical datasets.
2. Multi-center external validation across diverse healthcare systems.
3. Probability calibration analysis across demographic subgroups.
4. Temporal and seasonal distribution shift monitoring.
5. Prospective shadow evaluation alongside licensed triage nurses.
6. Automated model drift and data quality degradation alarms.
7. Integration with standardized clinical terminologies (SNOMED-CT, LOINC).
8. Formal clinical governance and regulatory assessment.

---

## 15. Development Status

* **Status:** Functional prototype / simulation environment.
* **Build Verification:** `npx tsc --noEmit` (0 errors), `npm run build` (Exit code 0).
* **License:** MIT (Prototype Simulation Only).

