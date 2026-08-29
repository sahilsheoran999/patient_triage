import React, { useState } from 'react';
import { Patient, SurgeState, TriageLevelCode } from '../../types';
import { 
  Users, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  ArrowUpRight, 
  Flame, 
  Search, 
  Filter, 
  Activity, 
  Info,
  CheckCircle,
  HelpCircle,
  Eye
} from 'lucide-react';
import { WhatChangedDiff } from '../common/WhatChangedDiff';

interface CommandCenterViewProps {
  patients: Patient[];
  surgeState: SurgeState;
  onSelectPatient: (patient: Patient) => void;
  onOpenOverrideModal: (patient: Patient) => void;
  onOpenIntake: () => void;
}

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({
  patients,
  surgeState,
  onSelectPatient,
  onOpenOverrideModal,
  onOpenIntake,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  // KPI Calculations
  const waitingPatientsCount = surgeState.isActive 
    ? Math.round(patients.length * surgeState.multiplier) 
    : patients.length;
    
  const criticalCount = patients.filter(p => p.priority === 'CRITICAL').length + (surgeState.isActive ? 8 : 0);
  const highCount = patients.filter(p => p.priority === 'HIGH').length + (surgeState.isActive ? 18 : 0);
  const medCount = patients.filter(p => p.priority === 'MEDIUM').length + (surgeState.isActive ? 45 : 0);
  const lowCount = patients.filter(p => p.priority === 'LOW' || p.priority === 'NON_URGENT').length + (surgeState.isActive ? 120 : 0);
  const reassessCount = patients.filter(p => p.monitoringState === 'REASSESS' || p.monitoringState === 'ESCALATE').length + (surgeState.isActive ? 13 : 0);
  const watchCount = patients.filter(p => p.monitoringState === 'WATCH').length;
  const avgWaitMinutes = Math.round(patients.reduce((acc, p) => acc + p.elapsedWaitMinutes, 0) / (patients.length || 1));

  // Filtered patients
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          patient.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterPriority === 'ALL' || patient.priority === filterPriority || (filterPriority === 'LOW' && patient.priority === 'NON_URGENT');
    return matchesSearch && matchesFilter;
  });

  // Sort: Critical & High & Deteriorating first
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    if (surgeState.isActive) {
      if (a.priority === 'CRITICAL' && b.priority !== 'CRITICAL') return -1;
      if (b.priority === 'CRITICAL' && a.priority !== 'CRITICAL') return 1;
    }
    return b.riskScore - a.riskScore;
  });

  return (
    <div className="space-y-5 p-4 sm:p-6 text-slate-100">
      
      {/* Surge Active Banner */}
      {surgeState.isActive && (
        <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 border border-rose-500/80 p-3 rounded-xl shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className="w-6 h-6 text-amber-300 animate-bounce" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-white uppercase tracking-wider">
                  ⚠ SURGE MODE ACTIVE (SIMULATED 3.0× BASELINE VOLUME)
                </span>
                <span className="bg-rose-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                  Action-First UI
                </span>
              </div>
              <p className="text-xs text-rose-200 mt-0.5">
                Surge intelligence sorting active: Critical cases pinned • Deterioration alerts elevated • Non-actionable noise suppressed.
              </p>
            </div>
          </div>
          <span className="hidden md:inline font-mono text-xs text-amber-300 bg-rose-950/90 px-3 py-1.5 rounded border border-amber-500/40">
            Queue Pressure: +184 Patients
          </span>
        </div>
      )}

      {/* Top KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Waiting Patients</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-white mt-1">{waitingPatientsCount}</p>
          <span className="text-[10px] text-slate-500">Live queue size</span>
        </div>

        <div className="bg-slate-900 border border-rose-900/60 p-3 rounded-lg">
          <div className="flex items-center justify-between text-rose-400 text-xs font-medium">
            <span>Critical</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
          </div>
          <p className="text-2xl font-bold font-mono text-rose-400 mt-1">{criticalCount}</p>
          <span className="text-[10px] text-rose-500/80">Immediate resuscitation</span>
        </div>

        <div className="bg-slate-900 border border-orange-900/60 p-3 rounded-lg">
          <div className="flex items-center justify-between text-orange-400 text-xs font-medium">
            <span>High Priority</span>
            <ShieldAlert className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-orange-400 mt-1">{highCount}</p>
          <span className="text-[10px] text-orange-500/80">Very urgent review</span>
        </div>

        <div className="bg-slate-900 border border-amber-900/60 p-3 rounded-lg">
          <div className="flex items-center justify-between text-amber-400 text-xs font-medium">
            <span>Medium Priority</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-400 mt-1">{medCount}</p>
          <span className="text-[10px] text-amber-500/80">Urgent care</span>
        </div>

        <div className="bg-slate-900 border border-emerald-900/60 p-3 rounded-lg">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-medium">
            <span>Low / Non-Urgent</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{lowCount}</p>
          <span className="text-[10px] text-emerald-500/80">Standard wait</span>
        </div>

        <div className="bg-slate-900 border border-amber-500/50 p-3 rounded-lg bg-gradient-to-br from-amber-950/30 to-slate-900">
          <div className="flex items-center justify-between text-amber-300 text-xs font-medium">
            <span>Actionable Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-400 animate-bounce" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-300 mt-1">{reassessCount}</p>
          <span className="text-[10px] text-amber-400/90 font-mono">
            {watchCount} in passive watch
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Avg Wait Time</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-white mt-1">{avgWaitMinutes}<span className="text-xs text-slate-400 font-normal">m</span></p>
          <span className="text-[10px] text-slate-500">ED queue average</span>
        </div>
      </div>

      {/* "The Safety Gap" Innovation Panel & Authority Legend */}
      <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-lg space-y-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="bg-rose-500/20 p-2 rounded text-rose-400 font-mono font-bold text-xs">
              SAFETY GAP
            </div>
            <div>
              <span className="text-slate-200 font-semibold text-xs">
                Initial Triage ≠ Permanent Risk.
              </span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Patients can deteriorate while waiting. Waiting-Room Radar™ continuously monitors risk changes across the entire queue.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenIntake}
            className="self-start md:self-auto bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded font-medium text-xs flex items-center gap-1.5 transition-all border border-slate-700 shrink-0"
          >
            <span>+ Fast Patient Intake</span>
          </button>
        </div>

        {/* Compact Architecture Authority Legend */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-[11px] font-mono">
          <span className="text-slate-400 uppercase text-[10px] font-bold">Architecture Legend:</span>
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
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3 rounded-lg border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search patient, ID, complaint..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 pl-9 pr-3 py-1.5 rounded text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-slate-500 mr-1" />
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterPriority(lvl)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-all ${
                filterPriority === lvl 
                  ? 'bg-rose-500 text-slate-950 font-bold shadow-sm' 
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {lvl === 'LOW' ? 'LOW / NON-URGENT' : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sortedPatients.map((patient) => {
          const isCritical = patient.priority === 'CRITICAL';
          const isHigh = patient.priority === 'HIGH';
          const isMedium = patient.priority === 'MEDIUM';

          return (
            <div
              key={patient.id}
              onClick={() => onSelectPatient(patient)}
              className={`bg-slate-900/90 rounded-xl border p-4 transition-all duration-200 hover:border-slate-700 hover:shadow-xl cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden group ${
                isCritical 
                  ? 'border-rose-500/60 shadow-rose-950/20' 
                  : isHigh 
                  ? 'border-orange-500/50' 
                  : isMedium
                  ? 'border-amber-500/40' 
                  : 'border-slate-800'
              }`}
            >
              {/* Header line: ID, Age, Group & Priority badge */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-white">{patient.id}</span>
                    <span className="text-xs text-slate-400 font-semibold">{patient.age} Y</span>
                    <span className="bg-slate-950 text-slate-400 border border-slate-800 text-[10px] font-mono px-1.5 py-0.5 rounded">
                      {patient.ageGroup}
                    </span>
                    {patient.scenarioTag && (
                      <span className="text-[9px] bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800 truncate max-w-[120px]" title={patient.scenarioTag}>
                        {patient.scenarioTag.split('—')[0]}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-200 font-medium mt-1 line-clamp-1">
                    {patient.name}
                  </p>
                </div>

                {/* Priority Badge */}
                <div className={`px-2.5 py-1 rounded font-mono font-bold text-xs flex items-center gap-1 ${
                  isCritical ? 'bg-rose-500 text-slate-950 animate-pulse' :
                  isHigh ? 'bg-orange-500 text-slate-950' :
                  isMedium ? 'bg-amber-500 text-slate-950' :
                  'bg-emerald-500 text-slate-950'
                }`}>
                  {isCritical && <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping"></span>}
                  {patient.priority}
                </div>
              </div>

              {/* Chief Complaint */}
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2 rounded border border-slate-800/80 font-normal">
                <span className="text-slate-500 font-mono text-[10px] uppercase block mb-0.5">Chief Complaint</span>
                {patient.chiefComplaint}
              </p>

              {/* Risk Score, Model Probability & Uncertainty Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs bg-slate-950/80 p-2 rounded border border-slate-800">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block">Risk Score</span>
                  <span className={`font-bold text-sm ${patient.riskScore >= 80 ? 'text-rose-400' : patient.riskScore >= 60 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {patient.riskScore}<span className="text-[10px] text-slate-500">/100</span>
                  </span>
                </div>

                <div>
                  <span className="text-[9px] text-slate-500 uppercase block">Model Prob</span>
                  <span className="font-bold text-xs text-indigo-300">
                    {patient.mlPrediction ? `${(patient.mlPrediction.topProbability * 100).toFixed(0)}%` : 'N/A'}
                  </span>
                </div>

                <div>
                  <span className="text-[9px] text-slate-500 uppercase block">Uncertainty</span>
                  <span className={`font-bold text-[11px] ${
                    patient.uncertainty === 'HIGH' ? 'text-rose-400' : patient.uncertainty === 'MODERATE' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {patient.uncertainty}
                  </span>
                </div>
              </div>

              {/* Completeness & Waiting Timer */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
                <span>Completeness: <strong className="text-slate-200">{patient.dataCompleteness}%</strong></span>
                <span className="flex items-center gap-1 text-slate-300">
                  <Clock className="w-3 h-3 text-slate-500" /> Wait: <strong className="text-white">{patient.elapsedWaitMinutes}m</strong>
                </span>
              </div>

              {/* AI Decision Support & Hybrid Status Badge */}
              {patient.hybridDecision?.isSafetyFloorEnforced ? (
                <div className="bg-rose-950/60 border border-rose-500/50 text-rose-300 text-[10px] px-2 py-1 rounded flex items-center justify-between font-mono">
                  <span className="flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-rose-400" />
                    <span>🛡 SAFETY FLOOR ACTIVE</span>
                  </span>
                  <span className="text-[9px] text-rose-400">ML: {patient.mlPrediction?.predictedClass || 'MED'}</span>
                </div>
              ) : patient.hybridDecision?.isDisagreement ? (
                <div className="bg-amber-950/50 border border-amber-500/40 text-amber-300 text-[10px] px-2 py-1 rounded flex items-center justify-between font-mono">
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span>⚠ MODEL / RULE DISAGREEMENT</span>
                  </span>
                  <span className="text-[9px] text-amber-400">ML: {patient.mlPrediction?.predictedClass} ({(Number(patient.mlPrediction?.topProbability || 0) * 100).toFixed(0)}%)</span>
                </div>
              ) : patient.mlPrediction ? (
                <div className="bg-slate-950 border border-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded flex items-center justify-between font-mono">
                  <span className="text-emerald-400">✓ RULE / ML MATCH</span>
                  <span>ML: {patient.mlPrediction.predictedClass} ({(patient.mlPrediction.topProbability * 100).toFixed(0)}%)</span>
                </div>
              ) : null}

              {/* Safety Escalation Due to Uncertainty Badge */}
              {patient.safetyEscalatedDueToUncertainty && (
                <div className="bg-amber-950/50 border border-amber-500/40 text-amber-300 text-[10px] p-1.5 rounded flex items-center gap-1 font-mono">
                  <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>⚠ ESCALATED DUE TO UNCERTAINTY</span>
                </div>
              )}

                {patient.recentDeteriorationDetected && (
                  <div className="bg-rose-950/80 border border-rose-500/60 text-rose-300 text-[10px] p-2 rounded space-y-1 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-rose-400 animate-pulse shrink-0" />
                      <span className="font-bold text-rose-200 uppercase tracking-wide">⚠ REASSESS NOW</span>
                    </div>
                    {patient.vitalDeltas && patient.vitalDeltas.length > 0 ? (
                      <div className="text-rose-300/90 pl-5">
                        {patient.vitalDeltas.filter(d => d.isWorse).map(d => `${d.label} ${d.previousValue} → ${d.currentValue}`).join(' · ')}
                      </div>
                    ) : patient.whyNowReason ? (
                      <div className="text-rose-300/90 pl-5">{patient.whyNowReason}</div>
                    ) : null}
                  </div>
                )}

                {!patient.recentDeteriorationDetected && patient.monitoringState === 'REASSESS' && patient.whyNowReason && (
                  <div className="bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[10px] p-2 rounded space-y-1 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="font-bold text-amber-200 uppercase tracking-wide">⚠ REASSESS NOW</span>
                    </div>
                    <div className="text-amber-300/80 pl-5">{patient.whyNowReason}</div>
                  </div>
                )}

                {/* Clinician Override Indicator */}
                {patient.overrideApplied && (
                  <div className="bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 text-[10px] p-1.5 rounded flex items-center justify-between font-mono">
                    <span>✓ Clinician Overridden</span>
                    <span className="text-indigo-400 font-bold">{patient.overrideInfo?.newPriority}</span>
                  </div>
                )}

                {/* Actions: View Details & Clinician Override Button */}
                <div className="pt-2 flex items-center gap-2 border-t border-slate-800">
                  <button
                    onClick={() => onSelectPatient(patient)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-1.5 rounded transition-all flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span>Patient Detail</span>
                  </button>

                  <button
                    onClick={() => onOpenOverrideModal(patient)}
                    className="bg-slate-950 hover:bg-rose-950/80 text-rose-400 hover:text-rose-300 border border-rose-900/60 text-xs font-bold px-3 py-1.5 rounded transition-all flex items-center gap-1"
                    title="Clinician Override Recommendation"
                  >
                    <span>Override</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>

    </div>
  );
};
