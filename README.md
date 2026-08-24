# PatientTriage.ai — Clinical Decision-Support Prototype

A clinical decision-support prototype designed for emergency department triage and queue management. This interface prioritizes patients based on physiological safety rules, weighted risk assessment, and data completeness, while enforcing clear boundaries between machine support and human oversight.

---

> [!WARNING]
> **PROTOTYPE SIMULATION ONLY — NOT FOR CLINICAL USE**
> * All patient records, histories, and clinical cases in this application are completely **synthetic**.
> * All physiological thresholds, risk weights, and decision rules are illustrative parameters for demonstration purposes. They are **NOT** validated clinical guidelines.
> * This prototype does **not** claim clinical validation, regulatory certification, or medical effectiveness.

---

## 🌟 Core Decision Architecture

PatientTriage.ai utilizes a 4-layer hybrid safety and triage engine:

1. **Data Completeness & Uncertainty Check (UNKNOWN ≠ NORMAL)**
   * Missing critical vitals or zero-history records are not assumed normal. They trigger safety uncertainty penalties, reducing confidence levels.
2. **Deterministic Red-Flag Safety Rules**
   * Absolute safety limits (e.g., SpO₂ < 88%, SBP < 80 mmHg, RR ≥ 30/min, or signs of severe respiratory distress) trigger immediate **CRITICAL** triage level bypass.
3. **Transparent Weighted Risk Score Engine**
   * Illustrative prototype risk weights are assigned to vital signs, observed cues, age group, and medical history. Factors are presented transparently to clinicians.
4. **Safety-First Escalation**
   * If input data is highly incomplete or ambiguous, the engine prevents automatic priority downgrades and escalates the priority level to ensure patient safety.

---

## 🛠️ Key UI Features

* **Command Center Dashboard**: Real-time ED board showing active patient counts, alerts, queue pressure metrics, and searchable/filterable priority lists. Includes a custom `LOW` + `NON_URGENT` consolidated filter.
* **Waiting-Room Radar™**: Continuous safety monitoring view displaying patient timelines, reassessment states, and custom simulated deterioration controls.
* **Actionable Alert System**:
  * **REASSESS NOW (Deterioration)**: Real-time radar alert with an evidence diff showing exactly what vitals changed (e.g. `SpO₂ 96% → 89% · HR 88 → 118`).
  * **REASSESS NOW (Wait Time)**: Triggers when configurable waiting thresholds for a triage category are exceeded (e.g., `Wait time (82m) > Configured threshold (60m)`).
* **Clinician Override**: Enables manual priority changes (e.g. upgrading to High based on localized examination) requiring a mandatory reason category and observation note. Every override generates an immutable audit entry.
* **Surge Mode (3.0× Dynamic)**: Simulates queue pressure and high-throughput scenarios, adjusting queue multipliers and pinning top-priority safety concerns.
* **Governance & Policies**: Interactive modules for Data Protection (Synthetic India-specific PII/DPDP posture) and Safety Policies.

---

## 💻 Tech Stack

* **Framework**: React 18 + Vite (Production-optimised bundler)
* **Language**: TypeScript 5+ (Strict type safety)
* **Styling**: Tailwind CSS 3.4 (With a bespoke dark-mode clinician palette)
* **Visualizations & Charts**: Recharts (Horizontal bar charts for risk contributions, line charts for vitals trends)
* **Icons & Animation**: Lucide React + Framer Motion

---

## 🚀 Getting Started

### Local Installation

1. Clone or download the repository.
2. Install the project dependencies:
   ```bash
   npm install
   ```

3. Run the local development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your web browser.

### Quality & Build Verification

Run strict TypeScript checks:
```bash
npx tsc --noEmit
```

Build the optimized production package:
```bash
npm run build
```
The output files will be compiled into the `dist/` directory, ready to be deployed.
