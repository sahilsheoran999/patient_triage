import React from 'react';
import { ShieldCheck, ArrowDown, ArrowRight, CheckCircle2, AlertTriangle, UserCheck, HelpCircle } from 'lucide-react';

export const SafetyPolicyView: React.FC = () => {
  return (
    <div className="space-y-6 p-4 sm:p-6 text-slate-100 font-sans">
      
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-rose-500" />
          <div>
            <h1 className="text-xl font-bold font-mono text-white">Clinical Safety Policy & Principles</h1>
            <p className="text-xs text-slate-400">Formal clinical decision support guardrails and safety escalation policy</p>
          </div>
        </div>

        <div className="bg-slate-950 px-3 py-1.5 rounded border border-slate-800 text-xs font-mono text-rose-400">
          Core Stance: <strong className="text-white">Decision Support, Not Diagnosis</strong>
        </div>
      </div>

      {/* Safety Policy Panel */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 font-mono text-xs shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="font-bold text-sm text-white uppercase tracking-wider">
            PatientTriage.ai Clinical Safety Policy
          </span>
          <span className="text-[10px] bg-slate-950 text-emerald-400 px-2.5 py-1 rounded border border-emerald-500/40">
            Clinician Retains Final Decision Authority
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
          <div className="bg-slate-950 p-3 rounded border border-slate-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">Clinician Remains Final Decision-Maker</strong>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">The system never overrides human judgment and always presents recommendations as decision support.</p>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded border border-slate-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">AI Cannot Autonomously Diagnose</strong>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">LLMs and AI scoring engines are strictly isolated from autonomous safety-critical actions.</p>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded border border-slate-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 block">UNKNOWN ≠ NORMAL</strong>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">Missing vitals or history increase uncertainty penalties rather than assuming normal baseline values.</p>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded border border-slate-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-rose-300 block">When Uncertain, Do Not Downgrade</strong>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">If serious risk cannot be ruled out due to high uncertainty, safety bias prevents lowering severity level.</p>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded border border-slate-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">Deterioration → Reassessment</strong>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">Worsening vitals in waiting room trigger immediate RADAR reassessment alerts.</p>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded border border-slate-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">Every Clinician Override → Audit Event</strong>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">All priority overrides log before/after states, reasons, and clinician IDs to immutable audit store.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Decision Flow Diagram */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 font-mono text-xs shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-2 gap-2">
          <span className="font-bold text-sm text-white uppercase tracking-wider block">
            Hybrid Safety Decision Flow Architecture
          </span>
          <span className="text-[10px] text-amber-400 font-mono bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded">
            Deterministic Safety Authority Constrains Advisory ML
          </span>
        </div>

        {/* Authority Legend */}
        <div className="flex flex-wrap items-center gap-4 p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono">
          <span className="text-slate-400 uppercase text-[10px] font-bold">Authority Legend:</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <strong>Clinician (Final Authority)</strong>
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <strong>Deterministic Rules (Safety Authority)</strong>
          </span>
          <span className="flex items-center gap-1.5 text-indigo-300">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
            <strong>XGBoost (Advisory Model)</strong>
          </span>
          <span className="flex items-center gap-1.5 text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <strong>UNKNOWN ≠ NORMAL</strong>
          </span>
        </div>

        {/* 10-Stage Pipeline Flow */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-4">
          
          {/* Row 1: Input to ML Advisory Model (Stages 1 - 5) */}
          <div>
            <div className="text-[10px] text-slate-500 font-mono uppercase mb-2 flex items-center gap-1.5">
              <span>Phase 1: Deterministic Intake & ML Advisory Inference</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 text-center">
              {/* INPUT */}
              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded flex flex-col justify-center">
                <span className="text-[9px] text-slate-500 block font-bold">INPUT</span>
                <span className="font-bold text-white text-xs">Patient Data</span>
                <span className="text-[9px] text-slate-400 mt-0.5 font-sans">Vitals, Complaint, Age</span>
              </div>

              {/* LAYER 1 */}
              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded flex flex-col justify-center">
                <span className="text-[9px] text-indigo-400 block font-bold">LAYER 1</span>
                <span className="font-bold text-slate-200 text-xs">Data Quality</span>
                <span className="text-[9px] text-indigo-300 mt-0.5 font-sans">UNKNOWN ≠ NORMAL</span>
              </div>

              {/* LAYER 2 */}
              <div className="bg-rose-950/40 border border-rose-500/40 p-2.5 rounded flex flex-col justify-center">
                <span className="text-[9px] text-rose-400 block font-bold">LAYER 2</span>
                <span className="font-bold text-rose-200 text-xs">Deterministic Safety Check</span>
                <span className="text-[9px] text-rose-300 mt-0.5 font-sans">Hard Red Flags</span>
              </div>

              {/* LAYER 3 */}
              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded flex flex-col justify-center">
                <span className="text-[9px] text-amber-400 block font-bold">LAYER 3</span>
                <span className="font-bold text-slate-200 text-xs">Rule-Based Risk Assessment</span>
                <span className="text-[9px] text-slate-400 mt-0.5 font-sans">Scored Risk 0–100</span>
              </div>

              {/* LAYER 4 */}
              <div className="bg-indigo-950/50 border border-indigo-500/40 p-2.5 rounded flex flex-col justify-center">
                <span className="text-[9px] text-indigo-300 block font-bold">LAYER 4</span>
                <span className="font-bold text-indigo-100 text-xs">XGBoost Advisory Model</span>
                <span className="text-[9px] text-indigo-400 mt-0.5 font-sans">71 Domain Features</span>
              </div>
            </div>
          </div>

          {/* Flow Bridge Indicator */}
          <div className="flex items-center justify-center gap-2 text-slate-600 font-mono text-[10px]">
            <ArrowDown className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span className="text-slate-400 font-sans">Deterministic Safety Constraints & Advisory Fusion</span>
            <ArrowDown className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
          </div>

          {/* Row 2: Probabilities to Final Clinician Decision (Stages 6 - 10) */}
          <div>
            <div className="text-[10px] text-slate-500 font-mono uppercase mb-2 flex items-center gap-1.5">
              <span>Phase 2: Hybrid Safety Fusion & Human Authority</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 text-center">
              {/* LAYER 5 */}
              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded flex flex-col justify-center">
                <span className="text-[9px] text-indigo-400 block font-bold">LAYER 5</span>
                <span className="font-bold text-slate-200 text-xs">Model Probabilities + Uncertainty</span>
                <span className="text-[9px] text-slate-400 mt-0.5 font-sans">Model Distribution</span>
              </div>

              {/* SAFETY GATE */}
              <div className="bg-rose-950/90 border-2 border-rose-500 p-2.5 rounded flex flex-col justify-center shadow-lg shadow-rose-950/50">
                <span className="text-[9px] text-rose-300 block font-bold">SAFETY GATE</span>
                <span className="font-bold text-white text-xs">Safety Fusion / Safety Floor</span>
                <span className="text-[9px] text-rose-300 mt-0.5 font-bold font-sans">Deterministic Authority</span>
              </div>

              {/* FINAL */}
              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded flex flex-col justify-center">
                <span className="text-[9px] text-amber-400 block font-bold">FINAL</span>
                <span className="font-bold text-slate-200 text-xs">Final Recommendation</span>
                <span className="text-[9px] text-slate-400 mt-0.5 font-sans">Decision Support</span>
              </div>

              {/* CONTROL */}
              <div className="bg-emerald-950/90 border-2 border-emerald-500 p-2.5 rounded flex flex-col justify-center shadow-lg shadow-emerald-950/50">
                <span className="text-[9px] text-emerald-400 block font-bold">CONTROL</span>
                <span className="font-bold text-white text-xs">Clinician Decision</span>
                <span className="text-[9px] text-emerald-300 mt-0.5 font-bold font-sans">Clinician Final Authority</span>
              </div>

              {/* AUDIT */}
              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded flex flex-col justify-center">
                <span className="text-[9px] text-slate-500 block font-bold">AUDIT</span>
                <span className="font-bold text-slate-200 text-xs">Audit Log</span>
                <span className="text-[9px] text-slate-400 mt-0.5 font-sans">Immutable Store</span>
              </div>
            </div>
          </div>

          {/* Architectural Notes Callout */}
          <div className="pt-2 border-t border-slate-900 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-sans">
            <div className="bg-slate-900/60 p-2 rounded border border-slate-800/80 text-slate-300">
              <strong className="text-rose-400 block font-mono text-[10px] uppercase">Deterministic Safety Authority</strong>
              Safety rules constrain ML recommendations. Deterministic red flags cannot be overridden by ML.
            </div>
            <div className="bg-slate-900/60 p-2 rounded border border-slate-800/80 text-slate-300">
              <strong className="text-amber-400 block font-mono text-[10px] uppercase">Model Disagreement</strong>
              Advisory model disagreement highlighted for clinician review without triggering false red flags.
            </div>
            <div className="bg-slate-900/60 p-2 rounded border border-slate-800/80 text-slate-300">
              <strong className="text-emerald-400 block font-mono text-[10px] uppercase">Clinician Final Authority</strong>
              AI provides decision support; clinicians retain 100% final override and diagnostic authority.
            </div>
          </div>

        </div>
      </div>

      {/* Continuous Safety Monitoring Flow Diagram */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 font-mono text-xs shadow-xl">
        <span className="font-bold text-sm text-white uppercase tracking-wider block border-b border-slate-800 pb-2">
          Continuous Safety Monitoring Flow (Waiting-Room Radar™)
        </span>

        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-center">
          <div className="bg-slate-900 border border-slate-800 p-2.5 rounded flex-1">
            <span className="text-[10px] text-slate-500 block">QUEUE</span>
            <span className="font-bold text-white">Waiting Patient</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

          <div className="bg-slate-900 border border-slate-800 p-2.5 rounded flex-1">
            <span className="text-[10px] text-amber-400 block font-bold">RADAR CHECK</span>
            <span className="font-bold text-slate-200">Wait Time + Vital Trend</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

          <div className="bg-rose-950/70 border border-rose-500/50 p-2.5 rounded flex-1">
            <span className="text-[10px] text-rose-300 block font-bold">EVALUATION</span>
            <span className="font-bold text-rose-200">Risk Change?</span>
          </div>
          <ArrowRight className="w-4 h-4 text-rose-500 shrink-0 animate-pulse" />

          <div className="bg-orange-950/80 border border-orange-500/60 p-2.5 rounded flex-1">
            <span className="text-[10px] text-orange-300 block font-bold">ACTION</span>
            <span className="font-bold text-white">REASSESS</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

          <div className="bg-slate-900 border border-slate-800 p-2.5 rounded flex-1">
            <span className="text-[10px] text-emerald-400 block font-bold">CONTROL</span>
            <span className="font-bold text-white">Clinician Review</span>
          </div>
        </div>
      </div>

    </div>
  );
};
