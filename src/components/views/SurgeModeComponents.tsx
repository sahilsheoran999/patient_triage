import React from 'react';
import { SurgeState, Patient } from '../../types';
import { Flame, AlertTriangle, Users, Clock, ShieldAlert, ArrowRight } from 'lucide-react';

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
    <div className="bg-slate-900 border border-rose-500/80 p-5 rounded-xl space-y-4 font-mono text-xs shadow-2xl text-slate-100">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <Flame className="w-5 h-5 text-amber-300 animate-bounce" />
          <h3 className="font-bold text-sm text-white uppercase tracking-wider">
            SURGE INTELLIGENCE & QUEUE PRESSURE DASHBOARD
          </h3>
        </div>
        <span className="text-[10px] bg-rose-500 text-slate-950 font-extrabold px-2.5 py-1 rounded uppercase">
          SIMULATED 3.0× SURGE
        </span>
      </div>

      <p className="text-[11px] text-slate-400 font-sans italic">
        Illustrative simulation values calculated dynamically from baseline queue volume.
      </p>

      {/* Surge Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center">
        <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
          <span className="text-[9px] text-slate-500 uppercase block">Patient Volume</span>
          <span className="text-lg font-bold text-amber-300">3.0×</span>
        </div>

        <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
          <span className="text-[9px] text-slate-500 uppercase block">Queue Growth</span>
          <span className="text-lg font-bold text-rose-400">+{surgeState.queueGrowth}</span>
        </div>

        <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
          <span className="text-[9px] text-slate-500 uppercase block">Critical Cases</span>
          <span className="text-lg font-bold text-rose-400">{surgeState.criticalCasesCount}</span>
        </div>

        <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
          <span className="text-[9px] text-slate-500 uppercase block">High Priority</span>
          <span className="text-lg font-bold text-orange-400">{surgeState.highPriorityCount}</span>
        </div>

        <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
          <span className="text-[9px] text-slate-500 uppercase block">Reassessment Backlog</span>
          <span className="text-lg font-bold text-amber-300">{surgeState.reassessmentBacklogCount}</span>
        </div>

        <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
          <span className="text-[9px] text-slate-500 uppercase block">Longest Wait</span>
          <span className="text-lg font-bold text-white">{surgeState.longestWaitMinutes}m</span>
        </div>
      </div>

      {/* Top 5 Safety Concerns List */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <span className="text-xs font-bold text-rose-300 uppercase block">
          Top 5 Pinned Safety Concerns (Action Required)
        </span>

        <div className="space-y-1.5">
          {topConcernPatients.map((pt) => (
            <div
              key={pt.id}
              onClick={() => onSelectPatient(pt)}
              className="bg-slate-950 hover:bg-slate-800 p-2.5 rounded border border-slate-800 flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                  pt.priority === 'CRITICAL' ? 'bg-rose-500 text-slate-950' : 'bg-orange-500 text-slate-950'
                }`}>
                  {pt.priority}
                </span>

                <div>
                  <span className="font-bold text-white text-xs">{pt.id} — {pt.name}</span>
                  <span className="text-slate-400 text-[11px] ml-2">({pt.chiefComplaint})</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] text-amber-400">Risk: {pt.riskScore}/100</span>
                <span className="text-rose-400 font-bold text-xs flex items-center gap-1">
                  View →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
