import React from 'react';
import { Patient } from '../../types';
import {
  X,
  Clock,
  Activity,
  AlertTriangle,
  ShieldAlert,
  RefreshCw,
  Brain,
  HelpCircle,
  CheckCircle2,
  FileText
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { WhatChangedDiff } from '../common/WhatChangedDiff';
import { WhyNowAlert } from '../common/WhyNowAlert';

interface PatientDetailModalProps {
  patient: Patient | null;
  onClose: () => void;
  onOpenOverrideModal: (patient: Patient) => void;
  onReassessPatient: (patientId: string) => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  patient,
  onClose,
  onOpenOverrideModal,
  onReassessPatient,
}) => {
  if (!patient) return null;

  // Prepare Recharts data for Vitals timeline
  const vitalsTrendData = (patient.vitalsHistory || []).map(vh => ({
    time: vh.timestamp,
    spo2: vh.spo2,
    heartRate: vh.heartRate,
    systolicBp: vh.systolicBp,
  }));

  // Include current vitals in trend chart
  vitalsTrendData.push({
    time: 'Current',
    spo2: patient.currentVitals.spo2,
    heartRate: patient.currentVitals.heartRate,
    systolicBp: patient.currentVitals.systolicBp,
  });

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-100 dark:bg-red-950/70 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800 font-bold';
      case 'HIGH':
        return 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 font-bold';
      case 'MEDIUM':
        return 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800 font-semibold';
      case 'LOW':
      case 'NON_URGENT':
      default:
        return 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-semibold';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 w-full max-w-5xl rounded-lg shadow-xl overflow-hidden my-6 text-slate-900 dark:text-slate-100 flex flex-col max-h-[92vh] transition-colors">

        {/* Modal Header */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded border text-xs font-mono uppercase ${getPriorityBadgeClass(patient.priority)}`}>
              {patient.priority}
            </span>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">{patient.id} — {patient.name}</h2>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">({patient.age}y {patient.gender} · {patient.ageGroup})</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Arrival: {patient.arrivalTime} · Elapsed Wait: <strong className="text-slate-800 dark:text-slate-200 font-mono">{patient.elapsedWaitMinutes} min</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onReassessPatient(patient.id)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded transition-colors border border-slate-300 dark:border-slate-700 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Reassess</span>
            </button>

            <button
              onClick={() => onOpenOverrideModal(patient)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded transition-colors shadow-xs"
            >
              Override Priority
            </button>

            <button
              onClick={onClose}
              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content Area */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">

          {/* Status Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Risk Score</span>
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">{patient.riskScore}<span className="text-xs text-slate-400 dark:text-slate-500 font-normal">/100</span></span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Rule-Weighted</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Model Probability</span>
              <span className="text-xl font-bold font-mono text-blue-700 dark:text-blue-400">
                {patient.mlPrediction ? `${(patient.mlPrediction.topProbability * 100).toFixed(1)}%` : 'N/A'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Advisory Model</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Model Uncertainty</span>
              <span className={`text-xl font-bold font-mono ${
                patient.uncertainty === 'HIGH' ? 'text-red-600 dark:text-red-400' :
                patient.uncertainty === 'MODERATE' ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'
              }`}>
                {patient.uncertainty}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                {patient.uncertainty === 'HIGH' ? 'Safety Escalation' : 'Nominal Margin'}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Monitoring State</span>
              <span className={`text-xl font-bold font-mono ${
                patient.monitoringState === 'ESCALATE' ? 'text-red-600 dark:text-red-400' :
                patient.monitoringState === 'REASSESS' ? 'text-amber-700 dark:text-amber-400' :
                patient.monitoringState === 'WATCH' ? 'text-blue-700 dark:text-blue-400' : 'text-emerald-700 dark:text-emerald-400'
              }`}>
                {patient.monitoringState}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Queue Surveillance</span>
            </div>
          </div>

          {/* WHY NOW? Alert */}
          {(patient.monitoringState === 'REASSESS' || patient.monitoringState === 'ESCALATE' || patient.whyNowReason) && patient.whyNowReason && (
            <WhyNowAlert
              title={patient.whyNowTitle}
              reason={patient.whyNowReason}
              reasonCode={patient.monitoringReasonCode}
              actionText="Reassess Patient Now"
              onActionClick={() => onReassessPatient(patient.id)}
            />
          )}

          {/* WHAT CHANGED? Evidence Diff */}
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

          {/* Grid layout for Vitals & Symptoms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Chief Complaint, Symptoms & History */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  Chief Complaint & Clinical Context
                </span>
              </div>

              <div>
                <p className="text-slate-900 dark:text-slate-100 font-medium text-xs leading-relaxed">{patient.chiefComplaint}</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                  Severity: <strong className="text-slate-800 dark:text-slate-200 font-mono">{patient.symptomSeverity}/10</strong> · Duration: <strong className="text-slate-800 dark:text-slate-200 font-mono">{patient.symptomDurationHours}h</strong>
                </p>
              </div>

              {patient.associatedSymptoms.length > 0 && (
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase block mb-1">Associated Symptoms</span>
                  <div className="flex flex-wrap gap-1">
                    {patient.associatedSymptoms.map((sym, i) => (
                      <span key={i} className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] px-2 py-0.5 rounded">
                        {sym}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Medical History */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase block mb-1">Medical History</span>
                {patient.hasNoHistoryRecord ? (
                  <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs p-2 rounded">
                    ⚠ Zero History Record — History unavailable in EHR. Treated under UNKNOWN ≠ NORMAL policy.
                  </div>
                ) : patient.medicalHistory.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {patient.medicalHistory.map((h, i) => (
                      <span key={i} className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] px-2 py-0.5 rounded">
                        {h}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400 italic">No significant prior history recorded.</p>
                )}
              </div>

              {/* Observed Cues */}
              {patient.observedCues.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase block mb-1">Observed Clinical Cues</span>
                  <div className="flex flex-wrap gap-1">
                    {patient.observedCues.map((cue, i) => (
                      <span key={i} className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-[11px] px-2 py-0.5 rounded font-medium">
                        ⚠ {cue}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Current Vitals & Historical Trend */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  Vitals & Physiological Trend
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center font-mono bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase block">SpO₂</span>
                  <span className={`font-bold text-sm ${patient.currentVitals.spo2 !== null && patient.currentVitals.spo2 < 90 ? 'text-red-700 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                    {patient.currentVitals.spo2 !== null ? `${patient.currentVitals.spo2}%` : 'UNKNOWN'}
                  </span>
                </div>

                <div>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase block">Heart Rate</span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {patient.currentVitals.heartRate !== null ? `${patient.currentVitals.heartRate} bpm` : 'UNKNOWN'}
                  </span>
                </div>

                <div>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase block">Blood Pressure</span>
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    {patient.currentVitals.systolicBp !== null
                      ? patient.currentVitals.diastolicBp !== null
                        ? `${patient.currentVitals.systolicBp}/${patient.currentVitals.diastolicBp}`
                        : `${patient.currentVitals.systolicBp}`
                      : 'UNAVAILABLE'}
                  </span>
                </div>
              </div>

              {/* Recharts Vitals Line Chart */}
              <div className="h-36 pt-2">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">Vital Trajectory</span>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={vitalsTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} domain={[60, 160]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', fontSize: '11px' }} />
                    <Line type="monotone" dataKey="spo2" name="SpO2 (%)" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="heartRate" name="Heart Rate (bpm)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* CLINICAL DECISION SUPPORT & HYBRID FUSION PANEL */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 gap-2">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                  Clinical Decision Support — Safety Fusion
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Advisory model subordinates to deterministic safety rules. Clinician holds final authority.
              </span>
            </div>

            {/* Side-by-side: Safety Rules vs XGBoost Advisory */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Box 1: Deterministic Rule Safety Authority */}
              <div className="bg-white dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide block">
                  1. Deterministic Safety Engine (Safety Authority)
                </span>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Risk Score</span>
                    <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">{patient.riskScore} / 100</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Rule Priority</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getPriorityBadgeClass(patient.hybridDecision?.rulePriority || patient.priority)}`}>
                      {patient.hybridDecision?.rulePriority || patient.priority}
                    </span>
                  </div>
                </div>
              </div>

              {/* Box 2: XGBoost Advisory Model */}
              <div className="bg-white dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide block">
                  2. Predictive Advisory Model (Advisory)
                </span>
                {patient.mlPrediction ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Prediction</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getPriorityBadgeClass(patient.mlPrediction.predictedClass)}`}>
                        {patient.mlPrediction.predictedClass}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Probability</span>
                      <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                        {(patient.mlPrediction.topProbability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Uncertainty</span>
                      <span className={`text-xs font-semibold font-mono ${
                        patient.mlPrediction.modelUncertainty === 'HIGH' ? 'text-red-700 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {patient.mlPrediction.modelUncertainty}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">Advisory model unavailable.</p>
                )}
              </div>
            </div>

            {/* Hybrid Safety Status Notice */}
            {patient.hybridDecision?.isSafetyFloorEnforced && (
              <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 p-2.5 rounded flex items-start gap-2 text-xs">
                <ShieldAlert className="w-4 h-4 text-red-700 dark:text-red-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-red-900 dark:text-red-200 block">
                    Safety Floor Enforced — Final Acuity: CRITICAL
                  </span>
                  <span className="text-red-800 dark:text-red-300">
                    Deterministic red-flag safety rules prevent any downgrade.
                  </span>
                </div>
              </div>
            )}

            {/* Model Feature Contributions (SHAP Explainability) */}
            {patient.mlPrediction && patient.mlPrediction.featureContributions.length > 0 && (
              <div className="bg-white dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide block">
                  Model Feature Contributions (Local Explainability)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {patient.mlPrediction.featureContributions.map((fc, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-700 dark:text-slate-300 truncate">{fc.displayName}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                        fc.impactDirection === 'increases_acuity'
                          ? 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/60 border border-transparent dark:border-red-900'
                          : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700'
                      }`}>
                        {fc.impactDirection === 'increases_acuity' ? '↑ Acuity' : '↓ Acuity'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Safety Reasoning Checklist (6-Step Verification) */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide block">
              Safety Verification Checklist
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
              <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Red Flag</span>
                <span className="font-semibold text-slate-900 dark:text-white">{patient.priority === 'CRITICAL' ? 'Active' : 'Clear'}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Risk Score</span>
                <span className="font-semibold text-slate-900 dark:text-white">{patient.riskScore}/100</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Uncertainty</span>
                <span className="font-semibold text-slate-900 dark:text-white">{patient.uncertainty}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Missing Data</span>
                <span className="font-semibold text-slate-900 dark:text-white">{patient.missingCriticalInputs.length > 0 ? `${patient.missingCriticalInputs.length} missing` : 'Complete'}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Safety Fusion</span>
                <span className="font-semibold text-slate-900 dark:text-white">{patient.hybridDecision?.policyApplied.split('_')[0] || 'Concordant'}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Final Acuity</span>
                <span className="font-semibold text-red-700 dark:text-red-400">{patient.priority}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
