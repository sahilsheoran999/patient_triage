import React, { useState, useEffect } from 'react';
import { X, GitMerge, ArrowDown, Play, ShieldAlert } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ArchitectureLayer {
  step: string;
  title: string;
  badge?: string;
  badgeColor?: string;
  desc: string;
  color: string;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const architectureLayers: ArchitectureLayer[] = [
    { 
      step: '01', 
      title: 'PATIENT DATA', 
      badge: 'INPUT',
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
      desc: 'Vitals, symptoms, age group, history, allergies & observed clinical cues', 
      color: 'border-slate-700 bg-slate-900' 
    },
    { 
      step: '02', 
      title: 'DATA QUALITY', 
      badge: 'QUALITY',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-500/40',
      desc: 'Completeness checks, missing-input detection & UNKNOWN ≠ NORMAL', 
      color: 'border-amber-500/60 bg-amber-950/40' 
    },
    { 
      step: '03', 
      title: 'AGE-AWARE NORMALIZATION', 
      badge: 'PHYSIOLOGY',
      badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-500/40',
      desc: 'Pediatric (<18), adult (18–64) & geriatric (65+) physiological context', 
      color: 'border-indigo-500/60 bg-indigo-950/40' 
    },
    { 
      step: '04', 
      title: 'DETERMINISTIC SAFETY ENGINE', 
      badge: 'SAFETY AUTHORITY',
      badgeColor: 'bg-rose-950 text-rose-300 border-rose-500/60 font-bold',
      desc: 'Critical red-flag checks enforce immediate safety escalation (Hypoxemia, Hypotension, Temp, Stridor, Altered Mental Status)', 
      color: 'border-rose-500 bg-rose-950/70' 
    },
    { 
      step: '05', 
      title: 'RULE-BASED RISK ASSESSMENT', 
      badge: 'RULE ENGINE',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-500/40',
      desc: 'Illustrative weighted risk score (0–100) with transparent factor decomposition', 
      color: 'border-amber-500/60 bg-amber-950/40' 
    },
    { 
      step: '06', 
      title: 'XGBOOST ADVISORY MODEL', 
      badge: 'ADVISORY',
      badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-500/60 font-bold',
      desc: 'Multi-class acuity prediction using 71 engineered clinical features', 
      color: 'border-indigo-500/70 bg-indigo-950/50' 
    },
    { 
      step: '07', 
      title: 'MODEL PROBABILITY & UNCERTAINTY', 
      badge: 'PROBABILITIES',
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-500/40',
      desc: 'Class probabilities (CRITICAL to NON_URGENT), model uncertainty & feature-level SHAP explanations', 
      color: 'border-cyan-500/60 bg-cyan-950/40' 
    },
    { 
      step: '08', 
      title: 'SAFETY FUSION / SAFETY FLOOR', 
      badge: 'SAFETY GATE',
      badgeColor: 'bg-rose-950 text-rose-200 border-rose-500 font-bold',
      desc: 'Combines deterministic safety authority with advisory ML output — ML cannot override deterministic safety floors', 
      color: 'border-rose-500 bg-rose-950/90 shadow-lg' 
    },
    { 
      step: '09', 
      title: 'FINAL RECOMMENDATION', 
      badge: 'DECISION SUPPORT',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-500/40',
      desc: 'Final acuity recommendation with model/rule disagreement visibility (preserves review flags)', 
      color: 'border-amber-500/60 bg-amber-950/40' 
    },
    { 
      step: '10', 
      title: 'CLINICIAN DECISION', 
      badge: 'FINAL AUTHORITY',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-500 font-bold',
      desc: 'Clinician retains final decision authority (accept, reassess, or override recommendation)', 
      color: 'border-emerald-500 bg-emerald-950/80 shadow-lg' 
    },
    { 
      step: '11', 
      title: 'AUDIT & CONTINUOUS MONITORING', 
      badge: 'AUDIT + RADAR',
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-500/40',
      desc: 'Immutable audit events + Waiting-Room Radar™ continuous deterioration monitoring & wait-time reassessment', 
      color: 'border-purple-500/60 bg-purple-950/40' 
    },
  ];

  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveStepIndex((prev) => (prev + 1) % architectureLayers.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden text-slate-100 my-8">
        
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GitMerge className="w-6 h-6 text-rose-500" />
            <div>
              <h2 className="font-bold text-sm font-mono text-white">System Architecture Visualization</h2>
              <p className="text-xs text-slate-400">Sequential 11-layer clinical data flow & hybrid ML safety boundary</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold rounded text-slate-300 flex items-center gap-1.5"
            >
              <Play className={`w-3.5 h-3.5 ${isPlaying ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{isPlaying ? 'Pause Animation' : 'Auto Play'}</span>
            </button>

            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Authority Legend */}
        <div className="bg-slate-950/80 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center gap-4 text-[11px] font-mono">
          <span className="text-slate-400 uppercase text-[10px] font-bold">Legend:</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <strong>Clinician (Final Authority)</strong>
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <strong>Deterministic Rules (Safety Authority)</strong>
          </span>
          <span className="flex items-center gap-1.5 text-indigo-300">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
            <strong>XGBoost (Advisory Model)</strong>
          </span>
          <span className="flex items-center gap-1.5 text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <strong>UNKNOWN ≠ NORMAL</strong>
          </span>
        </div>

        {/* Animated 11-Step Flow Diagram */}
        <div className="p-6 space-y-2 max-h-[70vh] overflow-y-auto">
          {architectureLayers.map((layer, idx) => {
            const isActive = idx === activeStepIndex;

            return (
              <React.Fragment key={layer.step}>
                <div 
                  onClick={() => setActiveStepIndex(idx)}
                  className={`p-3 rounded-lg border transition-all duration-300 cursor-pointer flex items-center justify-between font-mono ${layer.color} ${
                    isActive ? 'ring-2 ring-rose-500 scale-[1.01] shadow-xl' : 'opacity-85 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${isActive ? 'bg-rose-500 text-slate-950 font-black' : 'bg-slate-950 text-slate-400'}`}>
                      {layer.step}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white tracking-wider">{layer.title}</span>
                        {layer.badge && (
                          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${layer.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                            {layer.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 font-sans mt-0.5">{layer.desc}</p>
                    </div>
                  </div>

                  {isActive && (
                    <span className="text-[10px] bg-rose-500 text-slate-950 font-bold px-2 py-0.5 rounded uppercase animate-pulse shrink-0 ml-2">
                      Processing Layer
                    </span>
                  )}
                </div>

                {idx < architectureLayers.length - 1 && (
                  <div className="flex justify-center my-0.5">
                    <ArrowDown className={`w-4 h-4 ${isActive ? 'text-rose-400 animate-bounce' : 'text-slate-700'}`} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

      </div>
    </div>
  );
};
