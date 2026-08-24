import React, { useState } from 'react';
import { 
  Activity, 
  ShieldAlert, 
  Play, 
  Layers, 
  UserCheck, 
  ChevronDown, 
  Flame, 
  Info, 
  CheckCircle2, 
  Building2 
} from 'lucide-react';
import { SurgeState } from '../../types';

interface TopBarProps {
  surgeState: SurgeState;
  onToggleSurge: () => void;
  activePatientCount: number;
  activeAlertsCount: number;
  onOpenDemoScenarios: () => void;
  onRunSignatureDemo: () => void;
  onOpenArchitectureModal: () => void;
  currentHospitalName: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  surgeState,
  onToggleSurge,
  activePatientCount,
  activeAlertsCount,
  onOpenDemoScenarios,
  onRunSignatureDemo,
  onOpenArchitectureModal,
  currentHospitalName,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <header className="bg-slate-950 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-xl select-none">
      <div className="px-4 py-2.5 flex items-center justify-between gap-4">
        
        {/* Left Section — Product Branding & Positioning Badges */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-rose-500 to-rose-700 p-2 rounded-lg text-white shadow-lg shadow-rose-950/50">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white font-mono">
                  PatientTriage<span className="text-rose-500">.ai</span>
                </span>
                <span className="bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Continuous Safety Layer
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                See risk before it becomes a crisis.
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-800">
            {/* Clinical Decision Support Badge */}
            <span className="bg-slate-900 border border-slate-700/80 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded flex items-center gap-1.5 shadow-sm">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
              CLINICAL DECISION SUPPORT
            </span>

            {/* Global Simulation Environment Safety Badge */}
            <div className="relative">
              <span 
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded flex items-center gap-1.5 cursor-help"
              >
                <Info className="w-3.5 h-3.5 text-amber-400" />
                SIMULATION ENVIRONMENT
                <span className="text-[9px] font-normal text-amber-400/80">(Synthetic Data • Prototype)</span>
              </span>

              {showTooltip && (
                <div className="absolute top-full left-0 mt-1.5 w-72 bg-slate-900 border border-amber-500/40 p-3 rounded shadow-2xl text-[11px] text-slate-300 z-50 leading-relaxed">
                  <p className="font-bold text-amber-300 mb-1">Prototype Simulation Notice</p>
                  This demonstration uses synthetic patient data and illustrative prototype parameters. It is not intended for clinical deployment.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center / Hospital & Emergency Department Status */}
        <div className="hidden md:flex items-center gap-3 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="text-slate-200">{currentHospitalName}</span>
          </div>
          <span className="text-slate-700">|</span>
          <span className="text-slate-400 font-mono">Emergency Dept</span>
          <span className="text-slate-700">|</span>
          
          {/* Normal vs Surge Mode Toggle */}
          <button
            onClick={onToggleSurge}
            className={`px-2.5 py-1 rounded font-bold text-[11px] transition-all flex items-center gap-1.5 ${
              surgeState.isActive
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-950 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${surgeState.isActive ? 'text-amber-300' : 'text-slate-400'}`} />
            <span>{surgeState.isActive ? `SURGE MODE 3.0×` : 'NORMAL MODE'}</span>
          </button>
        </div>

        {/* Right Section — Counters & Interactive Demo Launchers */}
        <div className="flex items-center gap-2.5">
          {/* Active Patients & Alerts Badges */}
          <div className="hidden sm:flex items-center gap-2 font-mono text-xs">
            <div className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded text-slate-300">
              Patients: <span className="text-white font-bold">{activePatientCount}</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded text-slate-300 flex items-center gap-1">
              Alerts: <span className="text-rose-400 font-bold">{activeAlertsCount}</span>
            </div>
          </div>



          {/* Demo Mode Menu Launcher */}
          <button
            onClick={onOpenDemoScenarios}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1.5 transition-all shadow-md"
          >
            <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>DEMO MODE</span>
          </button>

          {/* Hero "RUN SIGNATURE DEMO" Button */}
          <button
            onClick={onRunSignatureDemo}
            className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded shadow-lg shadow-rose-950 flex items-center gap-1.5 transition-all border border-rose-500"
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">RUN SIGNATURE DEMO</span>
            <span className="sm:hidden">SIGNATURE</span>
          </button>

          {/* Clinician Profile Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800 text-xs text-slate-300">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-rose-400 font-bold">
              NV
            </div>
            <div className="hidden lg:block text-left leading-tight">
              <p className="font-semibold text-slate-200 text-[11px]">Dr. Neha Verma</p>
              <p className="text-[10px] text-slate-400">ED Attending</p>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
