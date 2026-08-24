import React from 'react';
import { Patient } from '../../types';
import { 
  X, 
  Clock, 
  Activity, 
  AlertTriangle, 
  ShieldAlert, 
  FileText, 
  CheckCircle, 
  Info, 
  UserCheck, 
  RefreshCw, 
  HelpCircle 
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

  // Prepare Recharts data for Risk Breakdown
  const riskChartData = patient.riskFactors.map(factor => ({
    name: factor.name.length > 25 ? factor.name.substring(0, 24) + '...' : factor.name,
    fullName: factor.name,
    contribution: factor.contribution,
    description: factor.description,
    isRedFlag: factor.isRedFlag
  }));

  // Prepare Recharts data for Vitals timeline
  const vitalsTrendData = (patient.vitalsHistory || []).map(vh => ({
    time: vh.timestamp,
    spo2: vh.spo2,
    heartRate: vh.heartRate,
    systolicBp: vh.systolicBp,
  }));
  
  // Include current vitals in trend chart
  vitalsTrendData.push({
    time: 'NOW',
    spo2: patient.currentVitals.spo2,
    heartRate: patient.currentVitals.heartRate,
    systolicBp: patient.currentVitals.systolicBp,
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden my-8 text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded font-mono font-bold text-xs ${
              patient.priority === 'CRITICAL' ? 'bg-rose-500 text-slate-950' :
              patient.priority === 'HIGH' ? 'bg-orange-500 text-slate-950' :
              patient.priority === 'MEDIUM' ? 'bg-amber-500 text-slate-950' :
              'bg-emerald-500 text-slate-950'
            }`}>
              {patient.priority}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-mono text-white">{patient.id} — {patient.name}</h2>
                <span className="text-xs text-slate-400 font-mono">({patient.age}y {patient.gender} • {patient.ageGroup})</span>
              </div>
              <p className="text-xs text-slate-400">Arrival: {patient.arrivalTime} • Elapsed Wait: <strong className="text-white">{patient.elapsedWaitMinutes}m</strong></p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onReassessPatient(patient.id)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded transition-all border border-slate-700 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>REASSESS PATIENT</span>
            </button>

            <button
              onClick={() => onOpenOverrideModal(patient)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded transition-all shadow-md"
            >
              OVERRIDE RECOMMENDATION
            </button>

            <button
              onClick={onClose}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Section 1 & 2: Current Status & Monitoring Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Risk Score</span>
              <span className="text-2xl font-bold text-rose-400">{patient.riskScore}<span className="text-xs text-slate-500">/100</span></span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Confidence</span>
              <span className="text-2xl font-bold text-slate-200">{patient.confidence}%</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Uncertainty</span>
              <span className={`text-xl font-bold ${patient.uncertainty === 'HIGH' ? 'text-rose-400' : 'text-amber-400'}`}>
                {patient.uncertainty}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Monitoring State</span>
              <span className="text-xl font-bold text-amber-300">{patient.monitoringState}</span>
            </div>
          </div>

          {/* Section 9: WHY NOW? Alert */}
          {(patient.monitoringState === 'REASSESS' || patient.monitoringState === 'ESCALATE' || patient.whyNowReason) && (
            <WhyNowAlert
              reason={patient.whyNowReason || 'Safety threshold reached — clinician reassessment recommended.'}
              actionText="REASSESS PATIENT NOW"
              onActionClick={() => onReassessPatient(patient.id)}
            />
          )}

          {/* Section 10: WHAT CHANGED? Evidence Diff */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Section 7: Symptoms & Medical History */}
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
              <span className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider block border-b border-slate-800 pb-2">
                Chief Complaint & Symptoms
              </span>

              <div>
                <p className="text-slate-200 font-semibold text-sm leading-snug">{patient.chiefComplaint}</p>
                <p className="text-slate-400 text-xs mt-1">Severity: <strong className="text-rose-400 font-mono">{patient.symptomSeverity}/10</strong> • Duration: <strong className="text-slate-300 font-mono">{patient.symptomDurationHours}h</strong></p>
              </div>

              {patient.associatedSymptoms.length > 0 && (
                <div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">Associated Symptoms</span>
                  <div className="flex flex-wrap gap-1">
                    {patient.associatedSymptoms.map((sym, i) => (
                      <span key={i} className="bg-slate-900 border border-slate-800 text-slate-300 text-[11px] px-2 py-0.5 rounded">
                        {sym}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 5: Medical History */}
              <div className="pt-2 border-t border-slate-900">
                <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">Medical History</span>
                {patient.hasNoHistoryRecord ? (
                  <div className="bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs p-2 rounded font-mono">
                    ⚠ ZERO HISTORY RECORD — Medical history unavailable in EHR.
                  </div>
                ) : patient.medicalHistory.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {patient.medicalHistory.map((h, i) => (
                      <span key={i} className="bg-slate-900 border border-slate-800 text-slate-300 text-[11px] px-2 py-0.5 rounded">
                        {h}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No significant medical history reported.</p>
                )}
              </div>

              {/* Section 6: Observed Cues */}
              {patient.observedCues.length > 0 && (
                <div className="pt-2 border-t border-slate-900">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">Observed Clinical Cues</span>
                  <div className="flex flex-wrap gap-1">
                    {patient.observedCues.map((cue, i) => (
                      <span key={i} className="bg-rose-950/60 border border-rose-500/40 text-rose-300 text-[11px] px-2 py-0.5 rounded font-mono">
                        ⚠ {cue}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Current Vitals & Vitals Timeline Chart */}
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
              <span className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider block border-b border-slate-800 pb-2">
                Current Vitals & Historical Timeline
              </span>

              <div className="grid grid-cols-3 gap-2 text-center font-mono bg-slate-900 p-2 rounded border border-slate-800">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block">SpO₂</span>
                  <span className={`font-bold text-sm ${patient.currentVitals.spo2 !== null && patient.currentVitals.spo2 < 90 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {patient.currentVitals.spo2 !== null ? `${patient.currentVitals.spo2}%` : 'UNKNOWN'}
                  </span>
                </div>

                <div>
                  <span className="text-[9px] text-slate-500 uppercase block">Heart Rate</span>
                  <span className="font-bold text-sm text-white">
                    {patient.currentVitals.heartRate !== null ? `${patient.currentVitals.heartRate} bpm` : 'UNKNOWN'}
                  </span>
                </div>

                <div>
                  <span className="text-[9px] text-slate-500 uppercase block">Blood Pressure</span>
                  <span className="font-bold text-xs text-amber-300">
                    {patient.currentVitals.systolicBp !== null ? `${patient.currentVitals.systolicBp}/${patient.currentVitals.diastolicBp}` : 'UNAVAILABLE'}
                  </span>
                </div>
              </div>

              {/* Recharts Vitals Line Chart */}
              <div className="h-36 pt-2">
                <span className="text-[10px] text-slate-500 font-mono block mb-1">Vitals Trend Over Time</span>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={vitalsTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="time" stroke="#6b7280" fontSize={10} />
                    <YAxis stroke="#6b7280" fontSize={10} domain={[60, 160]} />
                    <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#374151', fontSize: '11px' }} />
                    <Line type="monotone" dataKey="spo2" name="SpO2 (%)" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="heartRate" name="Heart Rate (bpm)" stroke="#eab308" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Section 7: PROTOTYPE RISK CONTRIBUTION BAR CHART */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Prototype Risk Contribution Breakdown
                </span>
                <span className="text-[10px] bg-slate-900 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                  Illustrative Prototype Parameters
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-rose-400">Total Score: {patient.riskScore}/100</span>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              Illustrative scoring parameters used to demonstrate the prototype decision architecture. Not clinically validated.
            </p>

            <div className="h-44 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskChartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis type="number" stroke="#6b7280" fontSize={10} domain={[0, 40]} />
                  <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={10} width={150} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#374151', fontSize: '11px' }}
                    formatter={(value: any) => [`+${value} points`, 'Contribution']}
                  />
                  <Bar dataKey="contribution" fill="#f97316" radius={[0, 4, 4, 0]}>
                    {riskChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isRedFlag ? '#ef4444' : '#f97316'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Section 11: DEDICATED UNCERTAINTY PANEL */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                Dedicated Uncertainty & Data Quality Panel
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                patient.uncertainty === 'HIGH' ? 'bg-rose-950 text-rose-300 border border-rose-500/50' : 'bg-amber-950 text-amber-300'
              }`}>
                UNCERTAINTY: {patient.uncertainty}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 uppercase text-[10px] block">Confidence Score</span>
                <span className="text-lg font-bold text-white">{patient.confidence}%</span>
              </div>

              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 uppercase text-[10px] block">Data Completeness</span>
                <span className="text-lg font-bold text-slate-200">{patient.dataCompleteness}%</span>
              </div>

              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 uppercase text-[10px] block">Safety Response Policy</span>
                <span className="text-xs font-bold text-amber-300">
                  {patient.safetyEscalatedDueToUncertainty ? 'ESCALATION RECOMMENDED' : 'STANDARD EVALUATION'}
                </span>
              </div>
            </div>

            {patient.missingCriticalInputs.length > 0 && (
              <div>
                <span className="text-[10px] text-slate-500 uppercase block mb-1">Missing Critical Inputs (UNKNOWN ≠ NORMAL)</span>
                <div className="space-y-1">
                  {patient.missingCriticalInputs.map((input, idx) => (
                    <div key={idx} className="text-xs text-amber-300 bg-amber-950/40 px-2 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{input}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 12: SAFETY REASONING PANEL (6-Step Checklist) */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3 font-mono">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block border-b border-slate-800 pb-2">
              Safety Reasoning Checklist
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px] block">1. Red-Flag Check</span>
                <span className="font-bold text-emerald-400">{patient.priority === 'CRITICAL' ? 'TRIGGERED' : 'PASS'}</span>
              </div>

              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px] block">2. Risk Score</span>
                <span className="font-bold text-white">{patient.riskScore} / 100</span>
              </div>

              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px] block">3. Uncertainty Level</span>
                <span className="font-bold text-amber-300">{patient.uncertainty}</span>
              </div>

              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px] block">4. Missing Data Check</span>
                <span className="font-bold text-slate-300">{patient.missingCriticalInputs.length > 0 ? `${patient.missingCriticalInputs.length} missing` : 'Complete'}</span>
              </div>

              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px] block">5. Safety Policy</span>
                <span className="font-bold text-emerald-400">Escalation Permitted</span>
              </div>

              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px] block">6. Final Recommendation</span>
                <span className="font-bold text-rose-400">{patient.priority} PRIORITY</span>
              </div>
            </div>
          </div>

          {/* Section 16 & Footer Disclaimer */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span>AI recommendation — clinician retains final decision authority.</span>
            </div>
            <span className="text-[10px] text-slate-500">Not certified for clinical deployment.</span>
          </div>

        </div>
      </div>
    </div>
  );
};
