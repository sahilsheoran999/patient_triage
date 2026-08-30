import React from 'react';
import {
  Activity,
  Play,
  Flame,
  Building2,
  Layers,
  Sun,
  Moon
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
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
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
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 sticky top-0 z-40 shadow-sm select-none transition-colors">
      <div className="px-4 py-2 flex items-center justify-between gap-4">

        {/* Left Section — Product Branding & Facility */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-slate-900 dark:bg-slate-800 text-white p-1.5 rounded flex items-center justify-center border border-transparent dark:border-slate-700">
              <Activity className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                  PatientTriage<span className="text-rose-600 dark:text-rose-500">.ai</span>
                </span>
                <span className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-medium px-2 py-0.5 rounded">
                  Clinical Operations
                </span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>{currentHospitalName}</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-slate-500 dark:text-slate-400">Emergency Department</span>
          </div>
        </div>

        {/* Center / Subtle Prototype Status */}
        <div className="hidden lg:flex items-center gap-3">
          <span className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-[11px] px-2.5 py-1 rounded flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>Simulation Mode · Synthetic Demonstration Data</span>
          </span>

          <button
            onClick={onOpenArchitectureModal}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 px-2 py-1 rounded transition-colors flex items-center gap-1"
            title="View 11-Layer Architecture"
          >
            <Layers className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>Architecture Flow</span>
          </button>
        </div>

        {/* Right Section — Controls, Counters & Clinician */}
        <div className="flex items-center gap-3">

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={theme === 'light' ? 'Switch to Clinical Dark Mode' : 'Switch to Clinical Light Mode'}
          >
            {theme === 'light' ? (
              <Moon className="w-3.5 h-3.5 text-slate-600" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            )}
          </button>

          {/* Normal vs Surge Mode Toggle */}
          <button
            onClick={onToggleSurge}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 border ${
              surgeState.isActive
                ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${surgeState.isActive ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400 dark:text-slate-500'}`} />
            <span>{surgeState.isActive ? `Surge Mode (3.0×)` : 'Normal Mode'}</span>
          </button>

          {/* Patient / Alert Metric Pills */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium">
            <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded text-slate-700 dark:text-slate-300">
              Patients: <strong className="text-slate-900 dark:text-white">{activePatientCount}</strong>
            </div>
            {activeAlertsCount > 0 && (
              <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 px-2.5 py-1 rounded text-rose-700 dark:text-rose-300 font-semibold">
                Alerts: {activeAlertsCount}
              </div>
            )}
          </div>

          {/* Demo Controls */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-800">
            <button
              onClick={onOpenDemoScenarios}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium px-2.5 py-1 rounded flex items-center gap-1 transition-colors"
            >
              <Play className="w-3 h-3 text-slate-500 fill-slate-500 dark:text-slate-400 dark:fill-slate-400" />
              <span>Scenarios</span>
            </button>

            <button
              onClick={onRunSignatureDemo}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium px-2.5 py-1 rounded shadow-sm flex items-center gap-1 transition-colors"
            >
              <Activity className="w-3 h-3" />
              <span className="hidden sm:inline">Run Demo</span>
            </button>
          </div>

          {/* Clinician Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 text-xs">
            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold text-[10px]">
              NV
            </div>
            <div className="hidden xl:block text-left leading-tight">
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">Dr. Neha Verma</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">ED Attending</p>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
