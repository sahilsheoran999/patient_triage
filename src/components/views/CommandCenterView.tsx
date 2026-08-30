import React, { useState } from 'react';
import { Patient, SurgeState } from '../../types';
import {
  Users,
  Clock,
  ShieldAlert,
  Flame,
  Search,
  Filter,
  Activity,
  AlertTriangle,
  List,
  LayoutGrid,
  Plus
} from 'lucide-react';

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
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // KPI Calculations
  const waitingPatientsCount = surgeState.isActive
    ? Math.round(patients.length * surgeState.multiplier)
    : patients.length;

  const criticalCount = patients.filter(p => p.priority === 'CRITICAL').length + (surgeState.isActive ? 8 : 0);
  const highCount = patients.filter(p => p.priority === 'HIGH').length + (surgeState.isActive ? 18 : 0);
  const escalateCount = patients.filter(p => p.monitoringState === 'ESCALATE').length + (surgeState.isActive ? 6 : 0);
  const reassessOnlyCount = patients.filter(p => p.monitoringState === 'REASSESS').length + (surgeState.isActive ? 7 : 0);
  const needsReviewCount = escalateCount + reassessOnlyCount;
  const avgWaitMinutes = Math.round(patients.reduce((acc, p) => acc + p.elapsedWaitMinutes, 0) / (patients.length || 1));

  // Deteriorating patient for the Safety Gap notification (P-101 or first critical)
  const safetyGapPatient = patients.find(p => p.recentDeteriorationDetected || p.monitoringState === 'ESCALATE') || patients[0];

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

      {/* Surge Active Operational Banner */}
      {surgeState.isActive && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-rose-900 dark:text-rose-200 uppercase tracking-wide">
                  Surge Mode Active · Simulated 3.0× Volume
                </span>
                <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded">
                  Surge Priority Queue
                </span>
              </div>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                Priority pinned queue active: Critical cases elevated • Deterioration tracking prioritized.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline text-xs text-rose-800 dark:text-rose-300 font-mono bg-rose-100/70 dark:bg-rose-900/50 px-2.5 py-1 rounded border border-rose-200 dark:border-rose-800">
            Queue Pressure: +184 Patients
          </span>
        </div>
      )}

      {/* 4 Core Clinical KPI Metrics + Average Wait */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {/* KPI 1: Waiting */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Waiting Patients</span>
            <Users className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">{waitingPatientsCount}</p>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Total in queue</span>
        </div>

        {/* KPI 2: Critical */}
        <div className="bg-white dark:bg-slate-900 border-l-4 border-l-red-600 border-y border-r border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-red-700 dark:text-red-400 text-xs font-semibold">
            <span>Critical Acuity</span>
            <span className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-500"></span>
          </div>
          <p className="text-2xl font-bold font-mono text-red-600 dark:text-red-400 mt-1">{criticalCount}</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Immediate attention</span>
        </div>

        {/* KPI 3: High Priority */}
        <div className="bg-white dark:bg-slate-900 border-l-4 border-l-amber-500 border-y border-r border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-amber-800 dark:text-amber-400 text-xs font-semibold">
            <span>High Priority</span>
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-800 dark:text-amber-400 mt-1">{highCount}</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Urgent clinical review</span>
        </div>

        {/* KPI 4: Needs Review */}
        <div className="bg-white dark:bg-slate-900 border-l-4 border-l-blue-600 border-y border-r border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-blue-700 dark:text-blue-400 text-xs font-semibold">
            <span>Needs Reassessment</span>
            <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-blue-700 dark:text-blue-400 mt-1">{needsReviewCount}</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {escalateCount} escalate · {reassessOnlyCount} overdue
          </span>
        </div>

        {/* KPI 5: Avg Wait Time */}
        <div className="col-span-2 md:col-span-4 lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Average Wait</span>
            <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-800 dark:text-slate-200 mt-1">
            {avgWaitMinutes}<span className="text-xs text-slate-500 dark:text-slate-400 font-normal"> min</span>
          </p>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Department average</span>
        </div>
      </div>

      {/* Operational Safety Gap Alert Banner */}
      {safetyGapPatient && (
        <div className="bg-white dark:bg-slate-900 border-l-4 border-l-amber-500 border-y border-r border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-amber-50 dark:bg-amber-950/60 rounded text-amber-700 dark:text-amber-400 mt-0.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 dark:text-white">Safety Gap Notice:</span>
                <span className="text-slate-600 dark:text-slate-300">Initial triage snapshot may no longer reflect current state.</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                Monitoring patient <strong className="text-slate-800 dark:text-slate-200">{safetyGapPatient.id} ({safetyGapPatient.name})</strong> — {safetyGapPatient.chiefComplaint} (Wait: {safetyGapPatient.elapsedWaitMinutes}m).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onSelectPatient(safetyGapPatient)}
              className="px-3 py-1.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white font-medium text-xs rounded transition-colors"
            >
              Review Patient
            </button>
            <button
              onClick={onOpenIntake}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs rounded border border-slate-300 dark:border-slate-700 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Intake</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter, Search and View Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search patient, ID, or complaint..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 pl-9 pr-3 py-1.5 rounded text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-slate-400 dark:focus:border-slate-700"
          />
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          <div className="flex items-center gap-1 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 mr-1" />
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterPriority(lvl)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  filterPriority === lvl
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {lvl === 'LOW' ? 'Low / Stable' : lvl}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-2">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'table' ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              title="Table View (Dense)"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'cards' ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* PATIENT QUEUE: DENSE CLINICAL TABLE VIEW (Standard ED Operations) */}
      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Patient</th>
                  <th className="py-2.5 px-3">Acuity</th>
                  <th className="py-2.5 px-3">Key Change / Complaint</th>
                  <th className="py-2.5 px-3">Wait</th>
                  <th className="py-2.5 px-3">Status / Flag</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sortedPatients.map((patient) => {
                  const isCritical = patient.priority === 'CRITICAL';
                  const isHigh = patient.priority === 'HIGH';

                  return (
                    <tr
                      key={patient.id}
                      onClick={() => onSelectPatient(patient)}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${
                        isCritical ? 'bg-red-50/20 dark:bg-red-950/20' : isHigh ? 'bg-amber-50/10 dark:bg-amber-950/10' : ''
                      }`}
                    >
                      {/* Patient ID, Name & Age */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 dark:text-white">{patient.id}</span>
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{patient.name}</span>
                          <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">({patient.age}y {patient.gender})</span>
                        </div>
                      </td>

                      {/* Acuity Badge */}
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded border text-[11px] inline-block ${getPriorityBadgeClass(patient.priority)}`}>
                          {patient.priority}
                        </span>
                      </td>

                      {/* Key Change / Complaint */}
                      <td className="py-3 px-3 max-w-xs md:max-w-md">
                        {patient.recentDeteriorationDetected && patient.vitalDeltas && patient.vitalDeltas.length > 0 ? (
                          <div className="text-red-700 dark:text-red-400 font-medium text-xs">
                            <span className="font-semibold">Deterioration: </span>
                            {patient.vitalDeltas.filter(d => d.isWorse).map(d => `${d.label} ${d.previousValue} → ${d.currentValue}`).join(' · ')}
                          </div>
                        ) : patient.hybridDecision?.isSafetyFloorEnforced ? (
                          <div className="text-red-700 dark:text-red-400 text-xs">
                            <span className="font-semibold">Safety floor: </span>{patient.chiefComplaint}
                          </div>
                        ) : (
                          <div className="text-slate-700 dark:text-slate-300 text-xs truncate" title={patient.chiefComplaint}>
                            {patient.chiefComplaint}
                          </div>
                        )}
                        {patient.observedCues.length > 0 && (
                          <div className="text-slate-500 dark:text-slate-400 text-[10px] mt-0.5 truncate">
                            Cues: {patient.observedCues.join(', ')}
                          </div>
                        )}
                      </td>

                      {/* Wait Time */}
                      <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        <span className={`font-semibold ${patient.elapsedWaitMinutes >= 30 ? 'text-amber-800 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {patient.elapsedWaitMinutes}m
                        </span>
                        <span className="text-slate-400 dark:text-slate-500 text-[10px] ml-1">({patient.arrivalTime})</span>
                      </td>

                      {/* Status / Flag */}
                      <td className="py-3 px-3 text-xs whitespace-nowrap">
                        {patient.monitoringState === 'ESCALATE' ? (
                          <span className="bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800 font-semibold px-2 py-0.5 rounded text-[11px]">
                            ⚠ Escalate
                          </span>
                        ) : patient.monitoringState === 'REASSESS' ? (
                          <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-semibold px-2 py-0.5 rounded text-[11px]">
                            Reassess
                          </span>
                        ) : patient.monitoringState === 'WATCH' ? (
                          <span className="text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-[11px]">
                            Watch
                          </span>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                            Stable
                          </span>
                        )}
                        {patient.overrideApplied && (
                          <span className="ml-1 text-[10px] text-blue-700 dark:text-blue-400 font-medium">
                            (Overridden)
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectPatient(patient)}
                            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs rounded transition-colors"
                          >
                            Review
                          </button>
                          <button
                            onClick={() => onOpenOverrideModal(patient)}
                            className="px-2 py-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Clinician Override"
                          >
                            Override
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* PATIENT QUEUE: RESTRAINED CARD GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedPatients.map((patient) => {
            const isCritical = patient.priority === 'CRITICAL';
            const isHigh = patient.priority === 'HIGH';

            return (
              <div
                key={patient.id}
                onClick={() => onSelectPatient(patient)}
                className={`bg-white dark:bg-slate-900 rounded-lg border p-3.5 space-y-2.5 transition-shadow hover:shadow-md cursor-pointer ${
                  isCritical
                    ? 'border-red-300 dark:border-red-800/80 border-l-4 border-l-red-600 dark:border-l-red-500'
                    : isHigh
                    ? 'border-amber-300 dark:border-amber-800/80 border-l-4 border-l-amber-500 dark:border-l-amber-500'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Header: ID, Name, Acuity Badge */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{patient.id}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">({patient.age}y {patient.gender})</span>
                    </div>
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{patient.name}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded border text-[11px] ${getPriorityBadgeClass(patient.priority)}`}>
                    {patient.priority}
                  </span>
                </div>

                {/* Complaint / Change */}
                <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-100 dark:border-slate-800 line-clamp-2">
                  {patient.chiefComplaint}
                </p>

                {/* Physiological Delta or Radar Alert */}
                {patient.recentDeteriorationDetected && (
                  <div className="bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 p-2 rounded text-[11px] font-medium border border-red-100 dark:border-red-800">
                    ⚠ Reassessment Required: SpO₂ / HR deterioration detected.
                  </div>
                )}

                {/* Wait Time & Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-mono">
                    Wait: <strong className="text-slate-800 dark:text-slate-200">{patient.elapsedWaitMinutes}m</strong>
                  </span>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onSelectPatient(patient)}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium rounded transition-colors text-xs"
                    >
                      Review
                    </button>
                    <button
                      onClick={() => onOpenOverrideModal(patient)}
                      className="px-2 py-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs rounded hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Override
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
