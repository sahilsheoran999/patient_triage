import React from 'react';
import { VitalDelta, TriageLevelCode } from '../../types';
import { ArrowDown, ArrowUp, Activity, AlertTriangle } from 'lucide-react';

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
  compact = false
}) => {
  const riskDelta = (currentRiskScore !== undefined && previousRiskScore !== undefined) 
    ? currentRiskScore - previousRiskScore 
    : undefined;

  return (
    <div className="bg-slate-900/90 border border-amber-500/40 rounded-lg p-3 shadow-lg text-slate-200">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="font-semibold text-xs tracking-wider uppercase text-amber-300">
            What Changed? (Evidence Diff)
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">Recorded {lastUpdateText}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Vitals diffs */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-slate-400 font-mono uppercase">Vital Trends</span>
          {vitalDeltas.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No significant vital delta recorded.</p>
          ) : (
            <div className="space-y-1">
              {vitalDeltas.map((delta, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs bg-slate-950/80 px-2 py-1 rounded border border-slate-800">
                  <span className="text-slate-300 font-medium">{delta.label}:</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-slate-400">{delta.previousValue}</span>
                    <span className="text-slate-600">→</span>
                    <span className={delta.isWorse ? "text-rose-400 font-bold" : "text-emerald-400"}>
                      {delta.currentValue}
                    </span>
                    <span className={`inline-flex items-center px-1 rounded text-[10px] ${
                      delta.isWorse ? "bg-rose-950 text-rose-300" : "bg-emerald-950 text-emerald-300"
                    }`}>
                      {delta.isWorse ? <ArrowDown className="w-3 h-3 mr-0.5 inline" /> : <ArrowUp className="w-3 h-3 mr-0.5 inline" />}
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
          <span className="text-[10px] text-slate-400 font-mono uppercase">Triage Vector Shift</span>
          <div className="bg-slate-950/80 px-2.5 py-1.5 rounded border border-slate-800 space-y-1 text-xs font-mono">
            {previousPriority && currentPriority && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Priority Shift:</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400 font-semibold">{previousPriority}</span>
                  <span className="text-slate-600">→</span>
                  <span className="text-amber-400 font-bold">{currentPriority}</span>
                </div>
              </div>
            )}

            {previousRiskScore !== undefined && currentRiskScore !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Risk Score Shift:</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">{previousRiskScore}</span>
                  <span className="text-slate-600">→</span>
                  <span className="text-rose-400 font-bold">{currentRiskScore}</span>
                  {riskDelta !== undefined && (
                    <span className="text-rose-400 text-[10px] font-bold">
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
