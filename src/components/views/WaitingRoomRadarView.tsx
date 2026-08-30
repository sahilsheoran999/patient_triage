import React, { useState } from 'react';
import { Patient, MonitoringState } from '../../types';
import {
  Radar,
  Clock,
  Activity,
  Zap,
  RefreshCw,
  ShieldCheck
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

  const stateBadges: Record<MonitoringState, { label: string; badgeClass: string; desc: string }> = {
    SAFE: { label: 'Safe', badgeClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60', desc: 'Within expected parameters' },
    WATCH: { label: 'Watch', badgeClass: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60', desc: 'Passive monitoring' },
    REASSESS: { label: 'Reassess', badgeClass: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60', desc: 'Safety reassessment recommended' },
    ESCALATE: { label: 'Escalate', badgeClass: 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/60', desc: 'Immediate clinician attention' },
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/60 font-semibold';
      case 'HIGH':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60 font-semibold';
      case 'MEDIUM':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60 font-medium';
      case 'LOW':
      case 'NON_URGENT':
      default:
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 font-medium';
    }
  };

  return (
    <div className="space-y-4 p-4 sm:p-6 text-slate-900 dark:text-slate-100 transition-colors">

      {/* Operational Header with Simulation Demo Triggers */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 dark:bg-slate-800 text-white p-2 rounded flex items-center justify-center border border-transparent dark:border-slate-700">
            <Radar className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-white">
                Waiting-Room Radar
              </h1>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                Continuous Surveillance
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Continuous physiological tracking and wait-time threshold monitoring for waiting patients.
            </p>
          </div>
        </div>

        {/* Demo Simulation Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onSimulateDeterioration('P-108')}
            className="px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-medium text-xs rounded border border-rose-200 dark:border-rose-800 transition-colors flex items-center gap-1.5"
            title="Simulate SpO2 drop (96% -> 89%) and HR spike (88 -> 118)"
          >
            <Zap className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Simulate Deterioration (P-108)</span>
          </button>

          <button
            onClick={() => onSimulateWaitThresholdExceeded('P-110')}
            className="px-2.5 py-1.5 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-medium text-xs rounded border border-amber-200 dark:border-amber-800 transition-colors flex items-center gap-1.5"
            title="Simulate wait time exceeding threshold"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Simulate Wait Threshold (P-110)</span>
          </button>
        </div>
      </div>

      {/* 4 State Metric Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setSelectedFilterState(selectedFilterState === 'ESCALATE' ? 'ALL' : 'ESCALATE')}
          className={`p-3 rounded-lg border text-left transition-all ${
            selectedFilterState === 'ESCALATE'
              ? 'bg-red-50/50 dark:bg-red-950/40 border-red-400 dark:border-red-600 ring-1 ring-red-400 dark:ring-red-600 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-red-700 dark:text-red-400 font-semibold">
            <span>Escalate</span>
            <span className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-500"></span>
          </div>
          <p className="text-2xl font-bold font-mono text-red-600 dark:text-red-400 mt-1">{escalateCount}</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Immediate attention</span>
        </button>

        <button
          onClick={() => setSelectedFilterState(selectedFilterState === 'REASSESS' ? 'ALL' : 'REASSESS')}
          className={`p-3 rounded-lg border text-left transition-all ${
            selectedFilterState === 'REASSESS'
              ? 'bg-amber-50/50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 ring-1 ring-amber-400 dark:ring-amber-600 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-amber-800 dark:text-amber-400 font-semibold">
            <span>Reassess</span>
            <Activity className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-800 dark:text-amber-400 mt-1">{reassessCount}</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Safety review required</span>
        </button>

        <button
          onClick={() => setSelectedFilterState(selectedFilterState === 'WATCH' ? 'ALL' : 'WATCH')}
          className={`p-3 rounded-lg border text-left transition-all ${
            selectedFilterState === 'WATCH'
              ? 'bg-blue-50/50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 ring-1 ring-blue-400 dark:ring-blue-600 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-blue-700 dark:text-blue-400 font-medium">
            <span>Watch</span>
            <Clock className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-blue-700 dark:text-blue-400 mt-1">{watchCount}</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Active surveillance</span>
        </button>

        <button
          onClick={() => setSelectedFilterState(selectedFilterState === 'SAFE' ? 'ALL' : 'SAFE')}
          className={`p-3 rounded-lg border text-left transition-all ${
            selectedFilterState === 'SAFE'
              ? 'bg-emerald-50/50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600 ring-1 ring-emerald-400 dark:ring-emerald-600 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-medium">
            <span>Safe</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-1">{safeCount}</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Normal wait window</span>
        </button>
      </div>

      {/* Monitored Patient List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>Surveillance Queue ({filteredPatients.length} of {patients.length} patients)</span>
          {selectedFilterState !== 'ALL' && (
            <button
              onClick={() => setSelectedFilterState('ALL')}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 underline"
            >
              Clear Filter
            </button>
          )}
        </div>

        {filteredPatients.map((patient) => {
          const stateMeta = stateBadges[patient.monitoringState];

          return (
            <div
              key={patient.id}
              className={`bg-white dark:bg-slate-900 rounded-lg border p-4 space-y-3 shadow-sm transition-colors ${
                patient.monitoringState === 'ESCALATE' ? 'border-red-300 dark:border-red-800/80 border-l-4 border-l-red-600 dark:border-l-red-500' :
                patient.monitoringState === 'REASSESS' ? 'border-amber-300 dark:border-amber-800/80 border-l-4 border-l-amber-500 dark:border-l-amber-500' :
                'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Row 1: Patient Details, Radar Status & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded border text-xs font-medium ${stateMeta.badgeClass}`}>
                    {stateMeta.label}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{patient.id}</span>
                      <span className="text-slate-800 dark:text-slate-200 font-medium text-xs">{patient.name}</span>
                      <span className="text-slate-500 dark:text-slate-400 text-xs font-mono">({patient.age}y {patient.gender})</span>
                      <span className={`px-2 py-0.2 rounded border text-[10px] ${getPriorityBadgeClass(patient.priority)}`}>
                        {patient.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      {patient.chiefComplaint}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded text-slate-700 dark:text-slate-300 font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>Wait: <strong className="text-slate-900 dark:text-white">{patient.elapsedWaitMinutes}m</strong></span>
                  </div>

                  <button
                    onClick={() => onReassessPatient(patient.id)}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded font-medium text-xs transition-colors flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                  >
                    <RefreshCw className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                    <span>Reassess</span>
                  </button>

                  <button
                    onClick={() => onSelectPatient(patient)}
                    className="px-2.5 py-1 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white rounded font-medium text-xs transition-colors"
                  >
                    Details
                  </button>
                </div>
              </div>

              {/* WHY NOW? Alert if Reassessment/Escalate active */}
              {(patient.monitoringState === 'REASSESS' || patient.monitoringState === 'ESCALATE' || patient.whyNowReason) && patient.whyNowReason && (
                <WhyNowAlert
                  title={patient.whyNowTitle}
                  reason={patient.whyNowReason}
                  reasonCode={patient.monitoringReasonCode}
                  actionText="Reassess Patient"
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
