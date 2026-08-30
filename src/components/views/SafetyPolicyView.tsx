import React from 'react';
import { ShieldCheck, ArrowDown, CheckCircle2 } from 'lucide-react';

export const SafetyPolicyView: React.FC = () => {
  return (
    <div className="space-y-4 p-4 sm:p-6 text-slate-900 dark:text-slate-100 font-sans transition-colors">

      {/* Title */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded border border-transparent dark:border-slate-700">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white">Clinical Safety Policy & Governance Guardrails</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Formal clinical decision support guardrails and deterministic safety boundaries</p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded text-xs text-slate-700 dark:text-slate-300">
          Operational Stance: <strong className="text-slate-900 dark:text-white">Decision Support, Not Autonomous Diagnosis</strong>
        </div>
      </div>

      {/* Safety Policy Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg shadow-sm space-y-3 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wide">
            Core Safety Principles
          </span>
          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            Clinician Retains 100% Final Authority
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded border border-slate-200 dark:border-slate-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white block">Clinician Remains Final Decision-Maker</strong>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">The system never overrides human clinical judgment and always formats suggestions as advisory support.</p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded border border-slate-200 dark:border-slate-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white block">AI Cannot Autonomously Diagnose</strong>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">Machine learning scoring engines are strictly isolated from autonomous safety-critical actions or prescriptions.</p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded border border-slate-200 dark:border-slate-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white block">UNKNOWN ≠ NORMAL</strong>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">Missing vitals or absent history increase model uncertainty penalties rather than assuming benign baseline values.</p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded border border-slate-200 dark:border-slate-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white block">When Uncertain, Do Not Downgrade</strong>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">If serious acute risk cannot be ruled out due to high uncertainty, safety bias prevents lowering acuity.</p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded border border-slate-200 dark:border-slate-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white block">Deterioration → Reassessment</strong>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">Worsening vitals or exceeded waiting thresholds trigger immediate Waiting-Room Radar reassessment alerts.</p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded border border-slate-200 dark:border-slate-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white block">Every Clinician Override → Audit Event</strong>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">All priority adjustments log before/after states, reasons, and clinician identifiers to an immutable audit store.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Decision Flow Diagram */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg shadow-sm space-y-3 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 gap-2">
          <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wide block">
            Hybrid Safety Decision Flow Architecture
          </span>
          <span className="text-[10px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            Deterministic Safety Authority Constrains Advisory ML
          </span>
        </div>

        {/* Authority Legend */}
        <div className="flex flex-wrap items-center gap-4 p-2.5 bg-slate-50 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold">Authority Legend:</span>
          <span className="flex items-center gap-1.5 text-slate-900 dark:text-slate-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            Clinician (Final Authority)
          </span>
          <span className="flex items-center gap-1.5 text-slate-900 dark:text-slate-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            Deterministic Rules (Safety Authority)
          </span>
          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            XGBoost (Advisory Model)
          </span>
          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            UNKNOWN ≠ NORMAL
          </span>
        </div>

        {/* 10-Stage Pipeline Flow */}
        <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded border border-slate-200 dark:border-slate-800 space-y-3">

          {/* Row 1: Input to ML Advisory Model */}
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1.5 block">
              Phase 1: Deterministic Ingestion & Advisory Predictive Inference
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 text-center">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded shadow-2xs">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-bold">INPUT</span>
                <span className="font-semibold text-slate-900 dark:text-white text-xs">Patient Data</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">Vitals, Complaint, Age</span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded shadow-2xs">
                <span className="text-[9px] text-blue-600 dark:text-blue-400 block font-bold">LAYER 1</span>
                <span className="font-semibold text-slate-900 dark:text-white text-xs">Data Quality</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">UNKNOWN ≠ NORMAL</span>
              </div>

              <div className="bg-red-50/70 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 p-2.5 rounded shadow-2xs">
                <span className="text-[9px] text-red-700 dark:text-red-400 block font-bold">LAYER 2</span>
                <span className="font-semibold text-red-950 dark:text-red-200 text-xs">Deterministic Safety</span>
                <span className="text-[10px] text-red-800 dark:text-red-300 mt-0.5 block">Hard Red Flags</span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded shadow-2xs">
                <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-bold">LAYER 3</span>
                <span className="font-semibold text-slate-900 dark:text-white text-xs">Risk Assessment</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">Weighted Score 0–100</span>
              </div>

              <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 p-2.5 rounded shadow-2xs">
                <span className="text-[9px] text-blue-700 dark:text-blue-400 block font-bold">LAYER 4</span>
                <span className="font-semibold text-blue-950 dark:text-blue-200 text-xs">XGBoost Advisory</span>
                <span className="text-[10px] text-blue-800 dark:text-blue-300 mt-0.5 block">71 Domain Features</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500 text-xs">
            <ArrowDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Deterministic Safety Constraints & Advisory Fusion</span>
            <ArrowDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          </div>

          {/* Row 2: Probabilities to Final Clinician Decision */}
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1.5 block">
              Phase 2: Hybrid Safety Fusion & Human Authority
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 text-center">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded shadow-2xs">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-bold">LAYER 5</span>
                <span className="font-semibold text-slate-900 dark:text-white text-xs">Uncertainty Estimate</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">Margin & SHAP</span>
              </div>

              <div className="bg-red-50 dark:bg-red-950/50 border border-red-300 dark:border-red-800 p-2.5 rounded shadow-xs">
                <span className="text-[9px] text-red-800 dark:text-red-400 block font-bold">SAFETY GATE</span>
                <span className="font-bold text-red-950 dark:text-red-200 text-xs">Safety Fusion</span>
                <span className="text-[10px] text-red-800 dark:text-red-300 mt-0.5 block">Deterministic Floor</span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded shadow-2xs">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-bold">FINAL</span>
                <span className="font-semibold text-slate-900 dark:text-white text-xs">Recommendation</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">Decision Support</span>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 p-2.5 rounded shadow-xs">
                <span className="text-[9px] text-emerald-800 dark:text-emerald-400 block font-bold">CONTROL</span>
                <span className="font-bold text-emerald-950 dark:text-emerald-200 text-xs">Clinician Decision</span>
                <span className="text-[10px] text-emerald-800 dark:text-emerald-300 mt-0.5 block font-semibold">100% Final Authority</span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded shadow-2xs">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-bold">AUDIT</span>
                <span className="font-semibold text-slate-900 dark:text-white text-xs">Audit Logging</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">Immutable Store</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
