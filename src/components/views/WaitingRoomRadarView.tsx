import React, { useState } from 'react';
import { Patient, MonitoringState } from '../../types';
import { 
  Radar, 
  Clock, 
  Activity, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowRight, 
  Zap, 
  CheckCircle2, 
  RefreshCw, 
  Sliders,
  TrendingDown,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { WhyNowAlert } from '../common/WhyNowAlert';
import { WhatChangedDiff } from '../common/WhatChangedDiff';

interface WaitingRoomRadarViewProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onSimulateDeterioration: (patientId: string) => void;
  onSimulateWaitThresholdExceeded: (patientId: string) => void;
  onReassessPatient: (patientId: string) => void;
}

export const WaitingRoomRadarView: React.FC<WaitingRoomRadarViewProps> = ({
  patients,
  onSelectPatient,
  onSimulateDeterioration,
  onSimulateWaitThresholdExceeded,
  onReassessPatient,
}) => {
  const [selectedFilterState, setSelectedFilterState] = useState<string>('ALL');

  const safeCount = patients.filter(p => p.monitoringState === 'SAFE').length;
  const watchCount = patients.filter(p => p.monitoringState === 'WATCH').length;
  const reassessCount = patients.filter(p => p.monitoringState === 'REASSESS').length;
  const escalateCount = patients.filter(p => p.monitoringState === 'ESCALATE').length;

  const filteredPatients = patients.filter(p => {
    if (selectedFilterState === 'ALL') return true;
    return p.monitoringState === selectedFilterState;
  });

  const stateBadges: Record<MonitoringState, { label: string; bg: string; text: string; border: string; icon: string }> = {
    SAFE: { label: '🟢 SAFE', bg: 'bg-emerald-950/60', text: 'text-emerald-400', border: 'border-emerald-500/40', icon: '🟢' },
    WATCH: { label: '🟡 WATCH', bg: 'bg-amber-950/60', text: 'text-amber-400', border: 'border-amber-500/40', icon: '🟡' },
    REASSESS: { label: '🟠 REASSESS', bg: 'bg-orange-950/80', text: 'text-orange-300', border: 'border-orange-500/60', icon: '🟠' },
    ESCALATE: { label: '🔴 ESCALATE', bg: 'bg-rose-950/90', text: 'text-rose-300', border: 'border-rose-500/80', icon: '🔴' },
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 text-slate-100">
      
      {/* Header & Product Concept Story */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-rose-500 to-amber-600 p-2.5 rounded-xl text-slate-950 shadow-lg">
              <Radar className="w-7 h-7 animate-spin text-slate-950" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-mono text-white tracking-tight">
                  Waiting-Room Radar™
                </h1>
                <span className="bg-rose-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                  Signature Innovation
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Continuous safety monitoring for patients who are still waiting in the emergency queue.
              </p>
            </div>
          </div>

          {/* Simulation Trigger Buttons for Judge Demo */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onSimulateDeterioration('P-108')}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded transition-all flex items-center gap-1.5 shadow-md shadow-rose-950"
              title="Simulate sudden SpO2 drop (96% -> 89%) and HR spike (88 -> 118)"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Simulate Deterioration (P-108)</span>
            </button>

            <button
              onClick={() => onSimulateWaitThresholdExceeded('P-110')}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded transition-all flex items-center gap-1.5 shadow-md"
              title="Simulate 82m wait exceeding Medium 30m threshold"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Simulate Wait Threshold (P-110)</span>
            </button>
          </div>
        </div>

        {/* Central Product Story Step Diagram */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono">
          <span className="text-[10px] text-slate-500 uppercase block mb-2 font-sans font-semibold">
            Continuous Clinical Safety Flow Architecture
          </span>
          <div className="flex flex-wrap items-center justify-between gap-2 text-center text-slate-300">
            <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded flex-1">
              <span className="text-slate-400 block text-[10px]">STAGE 1</span>
              <span className="font-bold text-white">ARRIVAL</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

            <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded flex-1">
              <span className="text-slate-400 block text-[10px]">STAGE 2</span>
              <span className="font-bold text-slate-200">Initial Assessment</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

            <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded flex-1">
              <span className="text-slate-400 block text-[10px]">STAGE 3</span>
              <span className="font-bold text-amber-300">WAITING ROOM</span>
            </div>
            <ArrowRight className="w-4 h-4 text-rose-500 shrink-0 animate-pulse" />

            <div className="bg-rose-950/70 border border-rose-500/50 px-3 py-1.5 rounded flex-1 shadow-md">
              <span className="text-rose-400 block text-[10px]">RADAR ACTIVE</span>
              <span className="font-bold text-rose-200">Continuous Monitoring</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

            <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded flex-1">
              <span className="text-slate-400 block text-[10px]">STAGE 5</span>
              <span className="font-bold text-orange-400">Risk Change</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

            <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded flex-1">
              <span className="text-slate-400 block text-[10px]">STAGE 6</span>
              <span className="font-bold text-emerald-400">Reassessment</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

            <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded flex-1">
              <span className="text-slate-400 block text-[10px]">STAGE 7</span>
              <span className="font-bold text-white">Clinician Decision</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Monitoring State KPI Filter Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <button
          onClick={() => setSelectedFilterState('SAFE')}
          className={`p-3 rounded-lg border text-left transition-all ${
            selectedFilterState === 'SAFE' ? 'bg-emerald-950/90 border-emerald-500' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-emerald-400">
            <span>🟢 SAFE</span>
            <span className="text-[10px] text-slate-500 font-sans">Normal wait</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{safeCount}</p>
        </button>

        <button
          onClick={() => setSelectedFilterState('WATCH')}
          className={`p-3 rounded-lg border text-left transition-all ${
            selectedFilterState === 'WATCH' ? 'bg-amber-950/90 border-amber-500' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-amber-400">
            <span>🟡 WATCH</span>
            <span className="text-[10px] text-slate-500 font-sans">Active surveillance</span>
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-1">{watchCount}</p>
        </button>

        <button
          onClick={() => setSelectedFilterState('REASSESS')}
          className={`p-3 rounded-lg border text-left transition-all ${
            selectedFilterState === 'REASSESS' ? 'bg-orange-950/90 border-orange-500' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-orange-400">
            <span>🟠 REASSESS</span>
            <span className="text-[10px] text-slate-500 font-sans font-bold">Action required</span>
          </div>
          <p className="text-2xl font-bold text-orange-400 mt-1">{reassessCount}</p>
        </button>

        <button
          onClick={() => setSelectedFilterState('ESCALATE')}
          className={`p-3 rounded-lg border text-left transition-all ${
            selectedFilterState === 'ESCALATE' ? 'bg-rose-950/90 border-rose-500' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-rose-400">
            <span>🔴 ESCALATE</span>
            <span className="text-[10px] text-slate-500 font-sans font-bold">Urgent alert</span>
          </div>
          <p className="text-2xl font-bold text-rose-400 mt-1">{escalateCount}</p>
        </button>
      </div>

      {/* Waiting Patient List with Timelines & Evidence Diff */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Waiting-Room Safety Queue ({filteredPatients.length} patients monitored)</span>
          <button 
            onClick={() => setSelectedFilterState('ALL')}
            className="text-slate-400 hover:text-slate-200 underline text-[11px]"
          >
            Show All ({patients.length})
          </button>
        </div>

        {filteredPatients.map((patient) => {
          const stateMeta = stateBadges[patient.monitoringState];

          return (
            <div
              key={patient.id}
              className={`bg-slate-900 rounded-xl border p-4 space-y-4 transition-all ${stateMeta.border} shadow-lg`}
            >
              {/* Top row: Patient Info & Monitoring State */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className={`px-2.5 py-1 rounded-md font-mono font-bold text-xs border ${stateMeta.bg} ${stateMeta.text} ${stateMeta.border}`}>
                    {stateMeta.label}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-white">{patient.id}</span>
                      <span className="text-xs text-slate-300 font-semibold">{patient.name}</span>
                      <span className="text-xs text-slate-400">({patient.age}y {patient.gender})</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      {patient.chiefComplaint}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs text-slate-300">
                  <div className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Wait: <strong className="text-white">{patient.elapsedWaitMinutes}m</strong></span>
                  </div>

                  <button
                    onClick={() => onReassessPatient(patient.id)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-semibold text-xs transition-all border border-slate-700 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3 text-slate-400" />
                    <span>Reassess</span>
                  </button>

                  <button
                    onClick={() => onSelectPatient(patient)}
                    className="px-3 py-1 bg-slate-950 hover:bg-slate-800 text-rose-400 border border-slate-700 rounded font-semibold text-xs transition-all"
                  >
                    Details →
                  </button>
                </div>
              </div>

              {/* Waiting-Queue Timeline Component (Arrival -> Vitals -> NOW) */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Queue Timeline Progression</span>
                  <span>Arrival: {patient.arrivalTime} ({patient.elapsedWaitMinutes}m ago)</span>
                </div>

                <div className="relative flex items-center justify-between px-4 py-2 bg-slate-900/60 rounded border border-slate-800/80">
                  {/* Line background */}
                  <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-slate-700 z-0"></div>

                  {/* Node 1: Arrival */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full bg-slate-600 border-2 border-slate-950 flex items-center justify-center text-[8px] font-bold">
                      ●
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">Arrival</span>
                    <span className="text-[9px] text-slate-500">{patient.arrivalTime}</span>
                  </div>

                  {/* Node 2: Initial Vitals */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-[8px] font-bold text-slate-950">
                      ✓
                    </div>
                    <span className="text-[10px] text-slate-300 mt-1">Initial Triage</span>
                    <span className="text-[9px] text-emerald-400 font-bold">{patient.previousPriority || patient.priority}</span>
                  </div>

                  {/* Node 3: Radar Check */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`w-5 h-5 rounded-full border-2 border-slate-950 flex items-center justify-center text-[9px] font-bold ${
                      patient.recentDeteriorationDetected ? 'bg-rose-500 text-slate-950 animate-ping' : 'bg-amber-500 text-slate-950'
                    }`}>
                      !
                    </div>
                    <span className="text-[10px] text-amber-300 mt-1">Radar Eval</span>
                    <span className="text-[9px] text-slate-400">-{patient.lastVitalsUpdateMinutesAgo}m</span>
                  </div>

                  {/* Node 4: NOW */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold ${
                      patient.priority === 'CRITICAL' ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-100 text-slate-950'
                    }`}>
                      NOW
                    </div>
                    <span className="text-[10px] font-bold text-white mt-1">Final Hybrid</span>
                    <span className={`text-[10px] font-bold ${
                      patient.priority === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'
                    }`}>
                      {patient.priority}
                    </span>
                    {patient.hybridDecision?.isSafetyFloorEnforced ? (
                      <span className="text-[8px] font-mono text-rose-400 bg-rose-950/80 px-1 rounded mt-0.5 border border-rose-500/40">🛡 Safety Floor</span>
                    ) : patient.hybridDecision?.isDisagreement ? (
                      <span className="text-[8px] font-mono text-amber-400 bg-amber-950/80 px-1 rounded mt-0.5 border border-amber-500/40">⚠ ML/Rule</span>
                    ) : patient.mlPrediction ? (
                      <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950/60 px-1 rounded mt-0.5 border border-emerald-500/30">✓ Concordant</span>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* WHY NOW? Alert Banner if Reassessment or Escalation triggered */}
              {(patient.monitoringState === 'REASSESS' || patient.monitoringState === 'ESCALATE' || patient.whyNowReason) && patient.whyNowReason && (
                <WhyNowAlert
                  title={patient.whyNowTitle}
                  reason={patient.whyNowReason}
                  reasonCode={patient.monitoringReasonCode}
                  actionText="REASSESS PATIENT NOW"
                  onActionClick={() => onSelectPatient(patient)}
                />
              )}

              {/* WHAT CHANGED? Evidence Diff Component */}
              {(patient.recentDeteriorationDetected || (patient.vitalDeltas && patient.vitalDeltas.length > 0)) && (
                <WhatChangedDiff
                  vitalDeltas={patient.vitalDeltas}
                  previousRiskScore={patient.previousRiskScore}
                  currentRiskScore={patient.riskScore}
                  previousPriority={patient.previousPriority}
                  currentPriority={patient.priority}
                  lastUpdateText={`${patient.lastVitalsUpdateMinutesAgo}m ago`}
                />
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};
