import React, { useState } from 'react';
import { Patient, VitalReading } from '../../types';
import { AgeCategory } from '../../config/ageGroupConfig';
import { 
  UserPlus, 
  Activity, 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle, 
  ArrowRight,
  Info
} from 'lucide-react';

interface PatientIntakeViewProps {
  onAddPatient: (newPatient: Patient) => void;
}

export const PatientIntakeView: React.FC<PatientIntakeViewProps> = ({ onAddPatient }) => {
  const [patientId, setPatientId] = useState(`P-${Math.floor(121 + Math.random() * 80)}`);
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(45);
  const [gender, setGender] = useState<'M' | 'F' | 'Other'>('M');
  const [ageGroup, setAgeGroup] = useState<AgeCategory>('ADULT');
  
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [symptomSeverity, setSymptomSeverity] = useState<number>(6);
  const [durationHours, setDurationHours] = useState<number>(4);
  const [associatedSymptomsText, setAssociatedSymptomsText] = useState('');
  
  // Vitals state
  const [spo2, setSpo2] = useState<string>('96');
  const [heartRate, setHeartRate] = useState<string>('88');
  const [systolicBp, setSystolicBp] = useState<string>(''); // INTENTIONALLY EMPTY BY DEFAULT TO DEMO UNKNOWN != NORMAL
  const [diastolicBp, setDiastolicBp] = useState<string>('');
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
  const totalCount = 9;

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
      id: patientId,
      name: name.trim() || `Patient ${patientId}`,
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
    <div className="max-w-4xl mx-auto space-y-6 p-4 sm:p-6 text-slate-100">
      
      {/* View Title & Principle Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-rose-500" />
            <h1 className="text-xl font-bold font-mono text-white">Patient Intake & Quality Layer</h1>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Fast clinician intake with live data completeness assessment & explicit <strong className="text-amber-300 font-mono">UNKNOWN ≠ NORMAL</strong> rule enforcement.
          </p>
        </div>

        {/* Live Data Completeness Gauge */}
        <div className="bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-lg text-center font-mono">
          <span className="text-[10px] text-slate-400 uppercase block font-sans">Live Data Completeness</span>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="w-24 bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  liveCompleteness >= 80 ? 'bg-emerald-500' : liveCompleteness >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${liveCompleteness}%` }}
              ></div>
            </div>
            <span className={`text-base font-bold ${
              liveCompleteness >= 80 ? 'text-emerald-400' : liveCompleteness >= 60 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {liveCompleteness}%
            </span>
          </div>
        </div>
      </div>

      {/* Principle Callout Box */}
      <div className="bg-amber-950/40 border border-amber-500/40 p-3 rounded-lg flex items-start gap-2.5 text-xs text-amber-200">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold text-amber-300 uppercase font-mono">DESIGN PRINCIPLE: UNKNOWN ≠ NORMAL</strong>
          <p className="text-[11px] text-slate-300 mt-0.5">
            If a vital or history field is left blank, the triage engine will NOT substitute a normal value. Instead, missing fields automatically decrease data completeness, increase uncertainty, and apply safety bias escalation.
          </p>
        </div>
      </div>

      {/* Intake Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-xl space-y-6">
        
        {/* Section 1: Demographics */}
        <div className="space-y-3 border-b border-slate-800 pb-4">
          <span className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">
            1. Demographics & Identification
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Patient ID</label>
              <input
                type="text"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Patient Name</label>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Age</label>
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
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Age Category</label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value as AgeCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs font-mono text-amber-300 font-bold focus:outline-none"
              >
                <option value="PEDIATRIC">PEDIATRIC (&lt;18y)</option>
                <option value="ADULT">ADULT (18-64y)</option>
                <option value="GERIATRIC">GERIATRIC (65y+)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Symptoms & Chief Complaint */}
        <div className="space-y-3 border-b border-slate-800 pb-4">
          <span className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">
            2. Symptoms & Chief Complaint
          </span>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Chief Complaint *</label>
              <input
                type="text"
                placeholder="e.g. Acute shortness of breath, chest tightness, abdominal pain..."
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Symptom Severity (1 - 10)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={symptomSeverity}
                    onChange={(e) => setSymptomSeverity(parseInt(e.target.value))}
                    className="w-full accent-rose-500"
                  />
                  <span className="font-mono text-sm font-bold text-rose-400 w-6">{symptomSeverity}</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Duration (Hours)</label>
                <input
                  type="number"
                  step="0.5"
                  value={durationHours}
                  onChange={(e) => setDurationHours(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs font-mono text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Associated Symptoms (Comma separated)</label>
              <input
                type="text"
                placeholder="e.g. Fever, sweating, nausea, dizziness..."
                value={associatedSymptomsText}
                onChange={(e) => setAssociatedSymptomsText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Vitals Measurements */}
        <div className="space-y-3 border-b border-slate-800 pb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">
              3. Vital Signs Measurements
            </span>
            <span className="text-[11px] text-amber-400 italic">Leave blank if unavailable to test UNKNOWN ≠ NORMAL</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">SpO₂ (%)</label>
              <input
                type="number"
                placeholder="e.g. 96"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs font-mono text-white placeholder-slate-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Heart Rate (bpm)</label>
              <input
                type="number"
                placeholder="e.g. 88"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs font-mono text-white placeholder-slate-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Systolic BP (mmHg)</label>
              <input
                type="number"
                placeholder="UNAVAILABLE"
                value={systolicBp}
                onChange={(e) => setSystolicBp(e.target.value)}
                className={`w-full border rounded px-3 py-1.5 text-xs font-mono focus:outline-none ${
                  !systolicBp ? 'bg-amber-950/40 border-amber-500/50 text-amber-300 placeholder-amber-500/60' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Resp Rate (/min)</label>
              <input
                type="number"
                placeholder="e.g. 18"
                value={respiratoryRate}
                onChange={(e) => setRespiratoryRate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs font-mono text-white placeholder-slate-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 37.0"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs font-mono text-white placeholder-slate-700 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Medical History & Zero-History Toggle */}
        <div className="space-y-3 border-b border-slate-800 pb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">
              4. Medical History & Past Records
            </span>

            {/* Zero History Toggle */}
            <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-xs text-amber-300">
              <input
                type="checkbox"
                checked={hasNoHistory}
                onChange={(e) => setHasNoHistory(e.target.checked)}
                className="accent-amber-500"
              />
              <span className="font-mono font-semibold">Zero History Record (Unrepresented)</span>
            </label>
          </div>

          {!hasNoHistory ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Medical Conditions (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Hypertension, COPD, Diabetes..."
                  value={medicalHistoryText}
                  onChange={(e) => setMedicalHistoryText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Known Allergies</label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Peanuts..."
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="bg-amber-950/40 border border-amber-500/50 p-2.5 rounded text-xs text-amber-300 font-mono">
              ⚠ ZERO HISTORY CONFIRMED — Medical background unavailable. Engine will assign zero-history uncertainty penalty.
            </div>
          )}
        </div>

        {/* Section 5: Observed Clinical Cues */}
        <div className="space-y-3">
          <span className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">
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
                  className={`p-2 rounded text-xs text-left border font-medium transition-all ${
                    isChecked
                      ? 'bg-rose-950/80 border-rose-500 text-rose-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isChecked ? '✓ ' : '+ '} {cue}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition-all shadow-lg shadow-rose-950 flex items-center gap-2"
          >
            <span>Register & Triage Patient</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </form>
    </div>
  );
};
