import React from 'react';
import { SurgeState, Patient } from '../../types';
import { Flame } from 'lucide-react';

interface SurgeIntelligencePanelProps {
  surgeState: SurgeState;
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
}

export const SurgeIntelligencePanel: React.FC<SurgeIntelligencePanelProps> = ({
  surgeState,
  patients,
  onSelectPatient,
}) => {
  if (!surgeState.isActive) return null;

  // Filter top 5 safety concern patients
  const topConcernPatients = patients
    .filter(p => p.priority === 'CRITICAL' || p.priority === 'HIGH' || p.monitoringState === 'ESCALATE' || p.monitoringState === 'REASSESS')
    .slice(0, 5);

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-red-200 dark:border-red-800/80 p-4 rounded-lg space-y-3 text-xs shadow-sm text-slate-900 dark:text-slate-100 transition-colors">

      {/* Title */}
      <div className="flex items-center justify-between border-b border-red-100 dark:border-red-800/60 pb-2">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-red-600 dark:text-red-400" />
          <h3 className="font-bold text-sm text-red-950 dark:text-red-200 uppercase tracking-wide">
            Surge Mode Active · Queue Pressure Dashboard
          </h3>
        </div>
        <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded">
          3.0× Surge Volume
        </span>
      </div>

      {/* Surge Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center">
        <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block">Volume Multiplier</span>
          <span className="text-base font-bold text-slate-900 dark:text-white font-mono">3.0×</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block">Queue Growth</span>
          <span className="text-base font-bold text-red-700 dark:text-red-400 font-mono">+{surgeState.queueGrowth}</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block">Critical Cases</span>
          <span className="text-base font-bold text-red-700 dark:text-red-400 font-mono">{surgeState.criticalCasesCount}</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block">High Priority</span>
          <span className="text-base font-bold text-amber-800 dark:text-amber-400 font-mono">{surgeState.highPriorityCount}</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block">Reassess Backlog</span>
          <span className="text-base font-bold text-amber-800 dark:text-amber-400 font-mono">{surgeState.reassessmentBacklogCount}</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block">Longest Wait</span>
          <span className="text-base font-bold text-slate-900 dark:text-white font-mono">{surgeState.longestWaitMinutes}m</span>
        </div>
      </div>

      {/* Top 5 Safety Concerns List */}
      <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
        <span className="text-[11px] font-bold text-red-900 dark:text-red-300 uppercase block">
          Priority Pinned Patients (Attention Required)
        </span>

        <div className="space-y-1">
          {topConcernPatients.map((pt) => (
            <div
              key={pt.id}
              onClick={() => onSelectPatient(pt)}
              className="bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800/80 p-2 rounded border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  pt.priority === 'CRITICAL'
                    ? 'bg-red-100 dark:bg-red-950/70 text-red-800 dark:text-red-300 border border-transparent dark:border-red-800'
                    : 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-transparent dark:border-amber-800'
                }`}>
                  {pt.priority}
                </span>

                <div>
                  <span className="font-semibold text-slate-900 dark:text-white text-xs">{pt.id} — {pt.name}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] ml-1.5">({pt.chiefComplaint})</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">Risk: {pt.riskScore}/100</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium text-xs">
                  Review →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
