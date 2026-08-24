import React from 'react';
import { Lock, Shield, Eye, FileText, CheckCircle2, AlertTriangle, UserCheck } from 'lucide-react';

export const DataProtectionView: React.FC = () => {
  return (
    <div className="space-y-6 p-4 sm:p-6 text-slate-100 font-sans">
      
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Lock className="w-6 h-6 text-emerald-400" />
          <div>
            <h1 className="text-xl font-bold font-mono text-white">Data Protection & Privacy Posture</h1>
            <p className="text-xs text-slate-400">Privacy-by-design architecture & health data governance stance</p>
          </div>
        </div>

        <div className="bg-slate-950 px-3 py-1.5 rounded border border-slate-800 text-xs font-mono text-emerald-400">
          Assumed Jurisdiction: <strong className="text-white">India</strong>
        </div>
      </div>

      {/* Mandatory Regulatory Assumption Box */}
      <div className="bg-amber-950/40 border border-amber-500/50 p-4 rounded-xl space-y-2 font-mono text-xs text-amber-200">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-amber-300 uppercase">REGULATORY ASSUMPTION DISCLAIMER</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
          Assumed Jurisdiction: <strong>India</strong>. This prototype is designed around privacy-by-design principles and applicable Indian health data protection guidelines. 
          <strong className="text-amber-300 block mt-1">
            "This prototype is not certified for clinical deployment. Final regulatory, legal, security, and clinical validation would be required before real-world use."
          </strong>
        </p>
      </div>

      {/* Data Protection Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span>Patient Identifiers</span>
            <Eye className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-base font-bold text-emerald-400 block">MASKED (P-***)</span>
          <p className="text-[10px] text-slate-500 font-sans">Direct PII stripped from decision pipeline</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span>Dataset Integrity</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-base font-bold text-emerald-400 block">SYNTHETIC ONLY</span>
          <p className="text-[10px] text-slate-500 font-sans">Zero real patient health information used</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span>Access Control</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-base font-bold text-emerald-400 block">ROLE-BASED (RBAC)</span>
          <p className="text-[10px] text-slate-500 font-sans">Attending & Triage Nurse scoped permissions</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span>Audit Logging</span>
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-base font-bold text-emerald-400 block">ACTIVE & IMMUTABLE</span>
          <p className="text-[10px] text-slate-500 font-sans">Every override & assessment logged</p>
        </div>
      </div>

      {/* Privacy Stance Checklist */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3 font-mono text-xs">
        <span className="text-slate-200 font-bold uppercase tracking-wider block border-b border-slate-800 pb-2">
          Prototype Privacy & Security Controls Checklist
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Role-Based Access Control (RBAC) active</span>
          </div>

          <div className="flex items-center gap-2 text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Masked Patient Identifiers in decision layers</span>
          </div>

          <div className="flex items-center gap-2 text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Immutable Clinical Audit Event Trail</span>
          </div>

          <div className="flex items-center gap-2 text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Session Timeout & Inactivity Guards</span>
          </div>

          <div className="flex items-center gap-2 text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Synthetic Patient Data Only</span>
          </div>

          <div className="flex items-center gap-2 text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Data Minimization (No extra PII ingested)</span>
          </div>
        </div>
      </div>

    </div>
  );
};
