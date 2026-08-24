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
        <span className="font-bold text-sm text-white uppercase tracking-wider block border-b border-slate-800 pb-2">
          Safety Decision Flow Architecture
        </span>

        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-center">
          <div className="bg-slate-900 border border-slate-800 p-2.5 rounded flex-1">
            <span className="text-[10px] text-slate-500 block">INPUT</span>
            <span className="font-bold text-white">Patient Data</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

          <div className="bg-slate-900 border border-slate-800 p-2.5 rounded flex-1">
            <span className="text-[10px] text-rose-400 block font-bold">LAYER 1</span>
            <span className="font-bold text-slate-200">Red-Flag Check</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

          <div className="bg-slate-900 border border-slate-800 p-2.5 rounded flex-1">
            <span className="text-[10px] text-amber-400 block font-bold">LAYER 2</span>
            <span className="font-bold text-slate-200">Risk Assessment</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

          <div className="bg-slate-900 border border-slate-800 p-2.5 rounded flex-1">
            <span className="text-[10px] text-amber-400 block font-bold">LAYER 3</span>
            <span className="font-bold text-amber-300">Uncertainty Eval</span>
          </div>
          <ArrowRight className="w-4 h-4 text-rose-500 shrink-0 animate-pulse" />

          <div className="bg-rose-950/80 border border-rose-500/60 p-2.5 rounded flex-1">
            <span className="text-[10px] text-rose-300 block font-bold">SAFETY GATE</span>
            <span className="font-bold text-white text-[11px]">Serious Risk Ruled Out?</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

          <div className="bg-emerald-950/80 border border-emerald-500/60 p-2.5 rounded flex-1">
            <span className="text-[10px] text-emerald-400 block font-bold">FINAL CONTROL</span>
            <span className="font-bold text-white">Clinician Decision</span>
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
