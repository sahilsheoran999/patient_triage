import React from 'react';
import { Sliders, Building2, Check, ShieldCheck, Info } from 'lucide-react';
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
    <div className="space-y-6 p-4 sm:p-6 text-slate-100 font-sans">
      
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sliders className="w-6 h-6 text-amber-400" />
          <div>
            <h1 className="text-xl font-bold font-mono text-white">Hospital Configuration & Scalability</h1>
            <p className="text-xs text-slate-400">Adapt core triage safety engine across different hospital profiles without code changes</p>
          </div>
        </div>

        <div className="bg-slate-950 px-3 py-1.5 rounded border border-slate-800 text-xs font-mono text-amber-300">
          Active Profile: <strong className="text-white">{currentProfile.name}</strong>
        </div>
      </div>

      {/* Hospital Presets Switcher Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.values(HOSPITAL_PROFILES).map((prof) => {
          const isSelected = currentProfile.id === prof.id;

          return (
            <button
              key={prof.id}
              onClick={() => onSelectProfile(prof.id)}
              className={`p-5 rounded-xl border text-left transition-all duration-200 space-y-3 font-mono ${
                isSelected 
                  ? 'bg-rose-950/60 border-rose-500 shadow-xl ring-2 ring-rose-500/50' 
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className={`w-5 h-5 ${isSelected ? 'text-rose-400' : 'text-slate-400'}`} />
                  <span className="font-bold text-sm text-white">{prof.name}</span>
                </div>
                {isSelected && <span className="bg-rose-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded">ACTIVE</span>}
              </div>

              <p className="text-xs text-slate-300 font-sans leading-relaxed">{prof.description}</p>

              <div className="space-y-1.5 text-[11px] pt-2 border-t border-slate-800 text-slate-400">
                <p>Volume: <strong className="text-slate-200">{prof.volumeLabel}</strong></p>
                <p>Integration: <strong className="text-amber-400">{prof.integrationMaturity}</strong></p>
                <p>Staffing: <strong className="text-slate-200">{prof.staffingLevel}</strong></p>
              </div>

              <div className="pt-2 text-[10px] text-slate-500 border-t border-slate-800">
                Wait Thresholds (Low/Med/High): <span className="text-slate-300">{prof.waitThresholds.low}m / {prof.waitThresholds.medium}m / {prof.waitThresholds.high}m</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* "What Changes by Hospital?" Visualization Panel */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 font-mono">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            What Changes by Hospital Profile?
          </span>
          <span className="text-[10px] bg-slate-950 text-emerald-400 px-2.5 py-1 rounded border border-emerald-500/40">
            Core Triage Engine: UNCHANGED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
            <span className="text-emerald-400 font-bold block">✓ Waiting Thresholds</span>
            <span className="text-[11px] text-slate-400 font-sans block">Configured per hospital capacity</span>
          </div>

          <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
            <span className="text-emerald-400 font-bold block">✓ Available Specialties</span>
            <span className="text-[11px] text-slate-400 font-sans block">On-site vs tele-consult routing</span>
          </div>

          <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
            <span className="text-emerald-400 font-bold block">✓ Staffing Config</span>
            <span className="text-[11px] text-slate-400 font-sans block">Shift vs attending ratios</span>
          </div>

          <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
            <span className="text-emerald-400 font-bold block">✓ Alert Policy</span>
            <span className="text-[11px] text-slate-400 font-sans block">Strict vs surge optimized</span>
          </div>

          <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
            <span className="text-emerald-400 font-bold block">✓ Integration Maturity</span>
            <span className="text-[11px] text-slate-400 font-sans block">EHR & lab sync depth</span>
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded text-xs text-slate-300 border border-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            The core deterministic safety rules, risk scoring equations, and uncertainty escalation logic remain 100% consistent across all hospital presets.
          </span>
        </div>
      </div>

    </div>
  );
};
