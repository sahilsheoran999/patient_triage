import React, { useState } from 'react';
import { Patient, VitalReading } from '../../types';
import { AgeCategory } from '../../config/ageGroupConfig';
import {
  UserPlus,
  ArrowRight,
  Info
} from 'lucide-react';

interface PatientIntakeViewProps {
  onAddPatient: (newPatient: Patient) => void;
}

export const PatientIntakeView: React.FC<PatientIntakeViewProps> = ({ onAddPatient }) => {
  const [patientId, setPatientId] = useState<string>('');
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(45);
  const [gender, setGender] = useState<'M' | 'F' | 'Other'>('M');
  const [ageGroup, setAgeGroup] = useState<AgeCategory>('ADULT');

  const [chiefComplaint, setChiefComplaint] = useState('');
  const [symptomSeverity, setSymptomSeverity] = useState<number>(6);
  const [durationHours, setDurationHours] = useState<number>(4);
  const [associatedSymptomsText, setAssociatedSymptomsText] = useState('');

  // Vitals state — BP intentionally starts blank to enforce UNKNOWN ≠ NORMAL
  const [spo2, setSpo2] = useState<string>('96');
  const [heartRate, setHeartRate] = useState<string>('88');
  const [systolicBp, setSystolicBp] = useState<string>(''); // BLANK BY DEFAULT TO PRESERVE UNKNOWN != NORMAL
  const [diastolicBp, setDiastolicBp] = useState<string>(''); // BLANK BY DEFAULT TO PRESERVE UNKNOWN != NORMAL
  const [respiratoryRate, setRespiratoryRate] = useState<string>('18');
  const [temperature, setTemperature] = useState<string>('37.0');

  // History state
  const [hasNoHistory, setHasNoHistory] = useState<boolean>(false);
  const [medicalHistoryText, setMedicalHistoryText] = useState('');
  const [allergiesText, setAllergiesText] = useState('');

  // Observed Cues checkboxes
  const [selectedCues, setSelectedCues] = useState<string[]>([]);

  const availableCues = [
    'Respiratory distress',
    'Confusion / Delirium',
    'Pallor',
    'Sweating (Diaphoresis)',
    'Difficulty walking / Antalgic gait',
    'Stridor / Wheezing',
    'Levine sign (Clenched fist chest pain)',
    'Capillary refill > 3s'
  ];

  const handleCueToggle = (cue: string) => {
    if (selectedCues.includes(cue)) {
      setSelectedCues(selectedCues.filter(c => c !== cue));
    } else {
      setSelectedCues([...selectedCues, cue]);
    }
  };

  // Live Data Completeness calculation
  let completedCount = 0;
  const totalCount = 10;

  if (patientId.trim()) completedCount++;
  if (spo2) completedCount++;
  if (heartRate) completedCount++;
  if (systolicBp) completedCount++;
  if (respiratoryRate) completedCount++;
  if (temperature) completedCount++;
  if (chiefComplaint.trim()) completedCount++;
  if (associatedSymptomsText.trim()) completedCount++;
  if (!hasNoHistory && medicalHistoryText.trim()) completedCount++;
  if (allergiesText.trim()) completedCount++;

  const liveCompleteness = Math.round((completedCount / totalCount) * 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedId = patientId.trim().toUpperCase();
    if (!formattedId) {
      alert('Please enter a Patient ID (format: P-XXX, e.g. P-147).');
      return;
    }

    if (!/^P-\d+$/i.test(formattedId)) {
      alert('Invalid Patient ID format. Please use the P-XXX convention (e.g. P-147).');
      return;
    }

    if (!chiefComplaint.trim()) {
      alert('Please enter a chief complaint.');
      return;
    }

    const currentVitals: VitalReading = {
      timestamp: 'Just now',
      minutesAgo: 0,
      spo2: spo2 ? parseFloat(spo2) : null,
      heartRate: heartRate ? parseFloat(heartRate) : null,
      systolicBp: systolicBp ? parseFloat(systolicBp) : null,
      diastolicBp: diastolicBp ? parseFloat(diastolicBp) : null,
      respiratoryRate: respiratoryRate ? parseFloat(respiratoryRate) : null,
      temperature: temperature ? parseFloat(temperature) : null,
    };

    const newPatient: Patient = {
      id: formattedId,
      name: name.trim() || `Patient ${formattedId}`,
      gender,
      age: Number(age),
      ageGroup,
      chiefComplaint: chiefComplaint.trim(),
      symptomSeverity: Number(symptomSeverity),
      symptomDurationHours: Number(durationHours),
      associatedSymptoms: associatedSymptomsText.split(',').map(s => s.trim()).filter(Boolean),
      medicalHistory: hasNoHistory ? [] : medicalHistoryText.split(',').map(s => s.trim()).filter(Boolean),
      hasNoHistoryRecord: hasNoHistory,
      allergies: allergiesText.split(',').map(s => s.trim()).filter(Boolean),
      medications: [],
      observedCues: selectedCues,
      currentVitals,
      vitalsHistory: [],
      arrivalTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      elapsedWaitMinutes: 0,
      lastVitalsUpdateMinutesAgo: 0,
      priority: 'MEDIUM', // Will be evaluated dynamically by triage engine
      riskScore: 50,
      confidence: Math.max(50, liveCompleteness),
      uncertainty: liveCompleteness < 60 || hasNoHistory ? 'HIGH' : 'LOW',
      dataCompleteness: liveCompleteness,
      dataReliability: liveCompleteness >= 80 ? 'HIGH' : liveCompleteness >= 60 ? 'MEDIUM' : 'LOW',
      missingCriticalInputs: !systolicBp ? ['Blood pressure unavailable (UNKNOWN ≠ NORMAL)'] : [],
      monitoringState: 'SAFE',
      primaryReason: 'Initial Triage Intake Registered',
      recommendedAction: 'CLINICIAN TRIAGE SCORING & MONITORING',
      safetyEscalatedDueToUncertainty: liveCompleteness < 60 || hasNoHistory,
      riskFactors: [],
      uncertaintyDrivers: [],
      scenarioTag: 'New Intake'
    };

    onAddPatient(newPatient);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 p-4 sm:p-6 text-slate-900 dark:text-slate-100 transition-colors">

      {/* View Header with Live Completeness Indicator */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-slate-800 dark:text-slate-200" />
            <h1 className="text-base font-bold text-slate-900 dark:text-white">Patient Intake</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Structured clinical registration with real-time data completeness evaluation.
          </p>
        </div>

        {/* Live Data Completeness Indicator */}
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded text-center">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Data Completeness</span>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="w-24 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  liveCompleteness >= 80 ? 'bg-emerald-600' : liveCompleteness >= 60 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${liveCompleteness}%` }}
              ></div>
            </div>
            <span className={`text-xs font-bold font-mono ${
              liveCompleteness >= 80 ? 'text-emerald-700 dark:text-emerald-400' : liveCompleteness >= 60 ? 'text-amber-800 dark:text-amber-400' : 'text-red-700 dark:text-red-400'
            }`}>
              {liveCompleteness}%
            </span>
          </div>
        </div>
      </div>

      {/* Principle Callout Box */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 p-3 rounded-lg flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
        <Info className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold text-amber-950 dark:text-amber-100">Safety Standard: UNKNOWN ≠ NORMAL</strong>
          <p className="text-amber-800 dark:text-amber-300 text-[11px] mt-0.5">
            Missing vital signs or absent history will not be assumed normal. Unrecorded inputs increase model uncertainty and activate safety floor constraints.
          </p>
        </div>
      </div>

      {/* Intake Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-lg shadow-sm space-y-5 text-xs">

        {/* Section 1: Demographics */}
        <div className="space-y-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-wide block">
            1. Demographics & Identification
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-slate-500 dark:text-slate-400 block mb-1">Patient ID *</label>
              <input
                type="text"
                placeholder="P-XXX (e.g. P-147)"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-400 dark:focus:border-slate-700 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-slate-500 dark:text-slate-400 block mb-1">Patient Name</label>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-400 dark:focus:border-slate-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-500 dark:text-slate-400 block mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setAge(val);
                  if (val < 18) setAgeGroup('PEDIATRIC');
                  else if (val >= 65) setAgeGroup('GERIATRIC');
                  else setAgeGroup('ADULT');
                }}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 font-mono text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-400 dark:focus:border-slate-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-500 dark:text-slate-400 block mb-1">Age Category</label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value as AgeCategory)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-slate-900 dark:text-slate-100 font-medium focus:bg-white dark:focus:bg-slate-900 focus:border-slate-400 dark:focus:border-slate-700 focus:outline-none"
              >
                <option value="PEDIATRIC">Pediatric (&lt;18y)</option>
                <option value="ADULT">Adult (18-64y)</option>
                <option value="GERIATRIC">Geriatric (65y+)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Symptoms & Chief Complaint */}
        <div className="space-y-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-wide block">
            2. Chief Complaint & Symptoms
          </span>

          <div className="space-y-3">
            <div>
              <label className="text-slate-500 dark:text-slate-400 block mb-1">Chief Complaint *</label>
              <input
                type="text"
                placeholder="e.g. Acute shortness of breath, substernal chest tightness..."
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-400 dark:focus:border-slate-700 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-500 dark:text-slate-400 block mb-1">Symptom Severity (1 - 10)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={symptomSeverity}
                    onChange={(e) => setSymptomSeverity(parseInt(e.target.value))}
                    className="w-full accent-slate-800 dark:accent-slate-400"
                  />
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-white w-6">{symptomSeverity}</span>
                </div>
              </div>

              <div>
                <label className="text-slate-500 dark:text-slate-400 block mb-1">Duration (Hours)</label>
                <input
                  type="number"
                  step="0.5"
                  value={durationHours}
                  onChange={(e) => setDurationHours(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 font-mono text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-400 dark:focus:border-slate-700 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-500 dark:text-slate-400 block mb-1">Associated Symptoms (Comma separated)</label>
              <input
                type="text"
                placeholder="e.g. Diaphoresis, nausea, dizziness..."
                value={associatedSymptomsText}
                onChange={(e) => setAssociatedSymptomsText(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-400 dark:focus:border-slate-700 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Vitals Measurements */}
        <div className="space-y-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-wide block">
              3. Vital Signs Measurements
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 italic">Leave unrecorded to test UNKNOWN ≠ NORMAL</span>
              <button
                type="button"
                onClick={() => { setSystolicBp('120'); setDiastolicBp('80'); }}
                className="text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 transition-colors"
              >
                + Fill Sample BP (120/80)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            <div>
              <label className="text-slate-500 dark:text-slate-400 block mb-1">SpO₂ (%)</label>
              <input
                type="number"
                placeholder="e.g. 96"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-400 dark:focus:border-slate-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-500 dark:text-slate-400 block mb-1">Heart Rate (bpm)</label>
              <input
                type="number"
                placeholder="e.g. 88"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-400 dark:focus:border-slate-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-500 dark:text-slate-400 block mb-1">Systolic BP</label>
              <input
                type="number"
                placeholder="UNRECORDED"
                value={systolicBp}
                onChange={(e) => setSystolicBp(e.target.value)}
                className={`w-full border rounded px-2.5 py-1.5 font-mono text-xs focus:outline-none ${
                  !systolicBp
                    ? 'bg-amber-50/60 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 placeholder-amber-500'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
                }`}
              />
            </div>

            <div>
              <label className="text-slate-500 dark:text-slate-400 block mb-1">Diastolic BP</label>
              <input
                type="number"
                placeholder="UNRECORDED"
                value={diastolicBp}
                onChange={(e) => setDiastolicBp(e.target.value)}
                className={`w-full border rounded px-2.5 py-1.5 font-mono text-xs focus:outline-none ${
                  !diastolicBp
                    ? 'bg-amber-50/60 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 placeholder-amber-500'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
                }`}
              />
            </div>

            <div>
              <label className="text-slate-500 dark:text-slate-400 block mb-1">Resp Rate (/min)</label>
              <input
                type="number"
                placeholder="e.g. 18"
                value={respiratoryRate}
                onChange={(e) => setRespiratoryRate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-400 dark:focus:border-slate-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-500 dark:text-slate-400 block mb-1">Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 37.0"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-400 dark:focus:border-slate-700 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Medical History */}
        <div className="space-y-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-wide block">
              4. Medical History & Past Records
            </span>

            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={hasNoHistory}
                onChange={(e) => setHasNoHistory(e.target.checked)}
                className="accent-slate-800 dark:accent-slate-400"
              />
              <span className="font-medium">Zero History Record (Unrepresented)</span>
            </label>
          </div>

          {!hasNoHistory ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 dark:text-slate-400 block mb-1">Medical Conditions (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Hypertension, COPD, Diabetes..."
                  value={medicalHistoryText}
                  onChange={(e) => setMedicalHistoryText(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-400 dark:focus:border-slate-700 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-500 dark:text-slate-400 block">Known Allergies</label>
                  <button
                    type="button"
                    onClick={() => setAllergiesText('NKDA')}
                    className="text-[10px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                  >
                    + Mark NKDA
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Sulfa (or 'NKDA')"
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-400 dark:focus:border-slate-700 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 p-2.5 rounded">
              ⚠ Zero History Confirmed — Engine will assign uncertainty penalty.
            </div>
          )}
        </div>

        {/* Section 5: Observed Physical Cues */}
        <div className="space-y-3">
          <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-wide block">
            5. Clinician Observed Physical Cues
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {availableCues.map((cue) => {
              const isChecked = selectedCues.includes(cue);
              return (
                <button
                  type="button"
                  key={cue}
                  onClick={() => handleCueToggle(cue)}
                  className={`p-2 rounded text-xs text-left border transition-colors ${
                    isChecked
                      ? 'bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 font-semibold'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {isChecked ? '✓ ' : '+ '} {cue}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-950 font-medium text-xs rounded transition-colors shadow-xs flex items-center gap-1.5"
          >
            <span>Register & Triage Patient</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </form>
    </div>
  );
};
