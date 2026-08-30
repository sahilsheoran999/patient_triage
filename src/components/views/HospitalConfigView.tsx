import React from 'react';
import { Sliders, Building2, ShieldCheck } from 'lucide-react';
import { HOSPITAL_PROFILES, HospitalProfile } from '../../config/hospitalProfiles';

interface HospitalConfigViewProps {
  currentProfile: HospitalProfile;
  onSelectProfile: (profileId: string) => void;
}

export const HospitalConfigView: React.FC<HospitalConfigViewProps> = ({
  currentProfile,
  onSelectProfile,
}) => {
  return (
    <div className="space-y-4 p-4 sm:p-6 text-slate-900 dark:text-slate-100 font-sans transition-colors">

      {/* Title */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded border border-transparent dark:border-slate-700">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white">Facility Configuration & Operational Profiles</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Adapt queue thresholds and operational capacity without modifying core safety rules</p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded text-xs text-slate-700 dark:text-slate-300">
          Active Profile: <strong className="text-slate-900 dark:text-white">{currentProfile.name}</strong>
        </div>
      </div>

      {/* Hospital Presets Switcher Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {Object.values(HOSPITAL_PROFILES).map((prof) => {
          const isSelected = currentProfile.id === prof.id;

          return (
            <button
              key={prof.id}
              onClick={() => onSelectProfile(prof.id)}
              className={`p-4 rounded-lg border text-left transition-all space-y-2.5 ${
                isSelected
                  ? 'bg-blue-50/50 dark:bg-blue-950/40 border-blue-500 ring-1 ring-blue-500 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className={`w-4 h-4 ${isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{prof.name}</span>
                </div>
                {isSelected && <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">ACTIVE</span>}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{prof.description}</p>

              <div className="space-y-1 text-xs pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                <p>Volume: <strong className="text-slate-800 dark:text-slate-200">{prof.volumeLabel}</strong></p>
                <p>Maturity: <strong className="text-slate-800 dark:text-slate-200">{prof.integrationMaturity}</strong></p>
                <p>Staffing: <strong className="text-slate-800 dark:text-slate-200">{prof.staffingLevel}</strong></p>
              </div>

              <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 font-mono">
                Wait Caps (Low/Med/High): <span className="text-slate-800 dark:text-slate-200 font-semibold">{prof.waitThresholds.low}m / {prof.waitThresholds.medium}m / {prof.waitThresholds.high}m</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* "What Changes by Hospital?" Visualization Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">
            Configurable Facility Parameters
          </span>
          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            Core Safety Rules: Static & Invariant
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 text-xs">
          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded border border-slate-200 dark:border-slate-800 space-y-0.5">
            <span className="text-slate-900 dark:text-white font-semibold block">Waiting Caps</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Configured per ED capacity</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded border border-slate-200 dark:border-slate-800 space-y-0.5">
            <span className="text-slate-900 dark:text-white font-semibold block">Specialties</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">On-site vs tele-routing</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded border border-slate-200 dark:border-slate-800 space-y-0.5">
            <span className="text-slate-900 dark:text-white font-semibold block">Staffing Ratios</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Attending vs triage ratios</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded border border-slate-200 dark:border-slate-800 space-y-0.5">
            <span className="text-slate-900 dark:text-white font-semibold block">Alert Sensitivity</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Normal vs surge optimized</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded border border-slate-200 dark:border-slate-800 space-y-0.5">
            <span className="text-slate-900 dark:text-white font-semibold block">EHR Depth</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">HL7 / FHIR connector depth</span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            Deterministic safety rules, risk scoring equations, and uncertainty escalation logic remain 100% consistent across all hospital presets.
          </span>
        </div>
      </div>

    </div>
  );
};
