import React, { useState } from 'react';
import { Patient, TriageLevelCode } from '../../types';
import { X, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, UserCheck } from 'lucide-react';

interface ClinicianOverrideModalProps {
  patient: Patient | null;
  onClose: () => void;
  onConfirmOverride: (
    patientId: string, 
    newPriority: TriageLevelCode, 
    reasonCategory: string, 
    customNote: string
  ) => void;
}

export const ClinicianOverrideModal: React.FC<ClinicianOverrideModalProps> = ({
  patient,
  onClose,
  onConfirmOverride,
}) => {
  if (!patient) return null;

  const [newPriority, setNewPriority] = useState<TriageLevelCode>(
    patient.priority === 'HIGH' ? 'CRITICAL' : patient.priority === 'MEDIUM' ? 'HIGH' : 'MEDIUM'
  );

  const [reasonCategory, setReasonCategory] = useState<string>('New clinical observation');
  const [customNote, setCustomNote] = useState<string>('');
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

  const overrideReasons = [
    'New clinical observation',
    'Patient condition changed',
    'Additional information available',
    'AI recommendation inconsistent with physical assessment',
    'Other (specified in notes)'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmOverride(patient.id, newPriority, reasonCategory, customNote);
    setIsConfirmed(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-rose-500" />
            <h2 className="font-bold text-sm font-mono text-white">Clinician Override Control</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isConfirmed ? (
          <div className="p-8 text-center space-y-3 font-mono">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 className="w-6 h-6 animate-bounce" />
            </div>
            <h3 className="text-base font-bold text-white">Clinician Override Recorded</h3>
            <p className="text-xs text-slate-400">
              Triage priority updated to <strong className="text-emerald-400 font-bold">{newPriority}</strong> for patient {patient.id}.
            </p>
            <div className="bg-slate-950 p-2 rounded text-[11px] text-slate-300 border border-slate-800">
              ✓ Override captured in clinical audit trail & feedback evaluation store.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-5 text-xs">
            
            {/* AI Current Recommendation Summary */}
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2 font-mono">
              <span className="text-[10px] text-slate-500 uppercase block font-bold">Current System State</span>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs">Patient: <strong className="text-white">{patient.id} — {patient.name}</strong></p>
                  <p className="text-slate-400 text-xs">AI Risk Score: <strong className="text-rose-400">{patient.riskScore}/100</strong> • Confidence: <strong className="text-slate-200">{patient.confidence}%</strong></p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase block">Current Priority</span>
                  <span className="font-bold text-sm text-amber-400">{patient.priority}</span>
                </div>
              </div>
            </div>

            {/* Select New Clinician Decision */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block font-mono">
                1. Select New Clinician Priority Decision *
              </label>
              <div className="grid grid-cols-4 gap-2 font-mono">
                {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as TriageLevelCode[]).map((p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setNewPriority(p)}
                    className={`py-2 rounded text-xs font-bold transition-all border ${
                      newPriority === p
                        ? p === 'CRITICAL' ? 'bg-rose-600 text-white border-rose-500 shadow-lg'
                          : p === 'HIGH' ? 'bg-orange-600 text-white border-orange-500 shadow-lg'
                          : p === 'MEDIUM' ? 'bg-amber-600 text-slate-950 border-amber-500 shadow-lg'
                          : 'bg-emerald-600 text-white border-emerald-500 shadow-lg'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Before / After Preview */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-around font-mono text-center">
              <div>
                <span className="text-[9px] text-slate-500 uppercase block">AI Recommendation</span>
                <span className="text-sm font-bold text-slate-400">{patient.priority}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-rose-500" />
              <div>
                <span className="text-[9px] text-slate-500 uppercase block">Clinician Decision</span>
                <span className="text-sm font-bold text-rose-400">{newPriority}</span>
              </div>
            </div>

            {/* Required Override Reason */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block font-mono">
                2. Mandatory Override Reason *
              </label>
              <select
                value={reasonCategory}
                onChange={(e) => setReasonCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                {overrideReasons.map((r, i) => (
                  <option key={i} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Additional Clinician Notes */}
            <div className="space-y-1">
              <label className="text-xs text-slate-400 block font-mono">
                3. Additional Clinical Observations / Notes
              </label>
              <textarea
                rows={2}
                placeholder="Enter mandatory clinical notes supporting override decision..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Submit Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono">Clinician ID: Dr. Neha Verma (MD)</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded transition-all shadow-lg shadow-rose-950"
                >
                  Confirm Override & Record Event
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
