import React from 'react';
import { Lock, Shield, Eye, FileText, CheckCircle2, AlertTriangle, UserCheck } from 'lucide-react';

export const DataProtectionView: React.FC = () => {
  return (
    <div className="space-y-4 p-4 sm:p-6 text-slate-900 dark:text-slate-100 font-sans transition-colors">

      {/* Title */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded border border-transparent dark:border-slate-700">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white">Data Protection & Security Posture</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Privacy-by-design standards and clinical data governance specifications</p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded text-xs text-slate-700 dark:text-slate-300">
          Jurisdiction Assumption: <strong className="text-slate-900 dark:text-white">India / CDSCO Guidelines</strong>
        </div>
      </div>

      {/* Regulatory Notice Box */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 p-3.5 rounded-lg space-y-1 text-xs text-amber-900 dark:text-amber-200">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
          <span className="font-semibold text-amber-950 dark:text-amber-100">Regulatory Notice & Clinical Scope</span>
        </div>
        <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
          Assumed Jurisdiction: India. Designed in accordance with privacy-by-design standards and applicable health data guidelines.
          This prototype operates exclusively on synthetic demonstration data and requires formal multi-center prospective validation before clinical deployment.
        </p>
      </div>

      {/* Data Protection Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-lg shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Patient Identifiers</span>
            <Eye className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white block font-mono">Masked (P-***)</span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Direct PII stripped from decision pipeline</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-lg shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Dataset Integrity</span>
            <Shield className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white block font-mono">Synthetic Only</span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Zero real patient records ingested</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-lg shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Access Control</span>
            <UserCheck className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white block font-mono">Role-Based (RBAC)</span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Attending & Triage Nurse scoped roles</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-lg shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Audit Logging</span>
            <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white block font-mono">Active & Immutable</span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Every override & assessment logged</p>
        </div>
      </div>

      {/* Privacy Stance Checklist */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg shadow-sm space-y-3 text-xs">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide block border-b border-slate-100 dark:border-slate-800 pb-2">
          Security & Privacy Governance Checklist
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Role-Based Access Control (RBAC) active</span>
          </div>

          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Masked Patient Identifiers in decision layers</span>
          </div>

          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Immutable Clinical Audit Event Trail</span>
          </div>

          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>In-Browser Edge Execution (No cloud PHI transmission)</span>
          </div>

          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Synthetic Patient Demonstration Data Only</span>
          </div>

          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Data Minimization (No unnecessary PII collected)</span>
          </div>
        </div>
      </div>

    </div>
  );
};
