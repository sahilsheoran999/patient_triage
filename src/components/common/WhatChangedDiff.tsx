import React from 'react';
import { VitalDelta, TriageLevelCode } from '../../types';
import { ArrowDown, ArrowUp, Activity } from 'lucide-react';

interface WhatChangedDiffProps {
  vitalDeltas?: VitalDelta[];
  previousRiskScore?: number;
  currentRiskScore?: number;
  previousPriority?: TriageLevelCode;
  currentPriority?: TriageLevelCode;
  lastUpdateText?: string;
  compact?: boolean;
}

export const WhatChangedDiff: React.FC<WhatChangedDiffProps> = ({
  vitalDeltas = [],
  previousRiskScore,
  currentRiskScore,
  previousPriority,
  currentPriority,
  lastUpdateText = '2m ago',
}) => {
  const riskDelta = (currentRiskScore !== undefined && previousRiskScore !== undefined)
    ? currentRiskScore - previousRiskScore
    : undefined;

  return (
    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-slate-800 dark:text-slate-200 text-xs transition-colors">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-2">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span className="font-semibold text-xs text-slate-900 dark:text-white">
            Recorded Changes (Evidence Diff)
          </span>
        </div>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Updated {lastUpdateText}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Vitals diffs */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Vital Changes</span>
          {vitalDeltas.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 italic text-[11px]">No significant vital delta recorded.</p>
          ) : (
            <div className="space-y-1">
              {vitalDeltas.map((delta, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white dark:bg-slate-900 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{delta.label}:</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-slate-500 dark:text-slate-400">{delta.previousValue}</span>
                    <span className="text-slate-400 dark:text-slate-600">→</span>
                    <span className={delta.isWorse ? "text-red-700 dark:text-red-400 font-bold" : "text-emerald-700 dark:text-emerald-400 font-semibold"}>
                      {delta.currentValue}
                    </span>
                    <span className={`inline-flex items-center px-1 rounded text-[10px] ${
                      delta.isWorse
                        ? "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-semibold border border-transparent dark:border-red-800"
                        : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium border border-transparent dark:border-emerald-800"
                    }`}>
                      {delta.isWorse ? <ArrowDown className="w-2.5 h-2.5 mr-0.5 inline" /> : <ArrowUp className="w-2.5 h-2.5 mr-0.5 inline" />}
                      {delta.deltaText}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Priority & Risk Diff */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Acuity & Risk Trajectory</span>
          <div className="bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-800 space-y-1 font-mono text-xs">
            {previousPriority && currentPriority && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Acuity Shift:</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 dark:text-slate-400">{previousPriority}</span>
                  <span className="text-slate-400 dark:text-slate-600">→</span>
                  <span className="text-slate-900 dark:text-white font-bold">{currentPriority}</span>
                </div>
              </div>
            )}

            {previousRiskScore !== undefined && currentRiskScore !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Risk Score:</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 dark:text-slate-400">{previousRiskScore}</span>
                  <span className="text-slate-400 dark:text-slate-600">→</span>
                  <span className="text-slate-900 dark:text-white font-bold">{currentRiskScore}</span>
                  {riskDelta !== undefined && (
                    <span className={`text-[10px] font-semibold ${riskDelta > 0 ? 'text-red-700 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                      ({riskDelta >= 0 ? `+${riskDelta}` : riskDelta})
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
