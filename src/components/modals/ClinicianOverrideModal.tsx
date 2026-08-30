import React, { useState } from 'react';
import { Patient, TriageLevelCode } from '../../types';
import { X, CheckCircle2, ArrowRight, UserCheck } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 w-full max-w-lg rounded-lg shadow-xl overflow-hidden text-slate-900 dark:text-slate-100 transition-colors">

        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">Clinician Priority Override</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        {isConfirmed ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Clinician Override Recorded</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Acuity priority updated to <strong className="text-slate-900 dark:text-white">{newPriority}</strong> for patient {patient.id}.
            </p>
            <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded text-[11px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
              Event logged in immutable clinical audit trail.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">

            {/* Current State Summary */}
            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Current Recommendation</span>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">{patient.id} — {patient.name}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Risk Score: {patient.riskScore}/100 · Model: {patient.mlPrediction?.predictedClass || 'N/A'} ({((patient.mlPrediction?.topProbability || 0) * 100).toFixed(0)}%)
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-slate-900 dark:text-white">
                  {patient.priority}
                </span>
              </div>
            </div>

            {/* Select New Clinician Decision */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                1. Select New Clinician Priority *
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as TriageLevelCode[]).map((p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setNewPriority(p)}
                    className={`py-2 rounded text-xs font-semibold transition-colors border ${
                      newPriority === p
                        ? p === 'CRITICAL' ? 'bg-red-600 text-white border-red-600 shadow-xs'
                          : p === 'HIGH' ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : p === 'MEDIUM' ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Before / After Preview */}
            <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800 flex items-center justify-around text-center">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block">System Recommendation</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{patient.priority}</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block">Clinician Decision</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{newPriority}</span>
              </div>
            </div>

            {/* Required Override Reason */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                2. Mandatory Reason Category *
              </label>
              <select
                value={reasonCategory}
                onChange={(e) => setReasonCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-400 dark:focus:border-slate-700 focus:outline-none"
              >
                {overrideReasons.map((r, i) => (
                  <option key={i} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Additional Clinician Notes */}
            <div className="space-y-1">
              <label className="text-xs text-slate-500 dark:text-slate-400 block">
                3. Clinical Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Enter observations supporting override decision..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-400 dark:focus:border-slate-700 focus:outline-none"
              />
            </div>

            {/* Submit Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 dark:text-slate-500">Dr. Neha Verma (MD)</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded font-medium text-xs border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-950 font-medium text-xs rounded transition-colors shadow-xs"
                >
                  Confirm Override
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
