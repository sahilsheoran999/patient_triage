import React, { useState, useEffect } from 'react';
import { X, GitMerge, ArrowDown, Play, CheckCircle2, ShieldAlert, Lock, Activity } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const architectureLayers = [
    { step: '01', title: 'PATIENT DATA', desc: 'Vitals, symptoms, age group, EHR history & observed cues', color: 'border-slate-700 bg-slate-900' },
    { step: '02', title: 'DATA QUALITY LAYER', desc: 'Computes completeness % & enforces UNKNOWN ≠ NORMAL', color: 'border-amber-500/60 bg-amber-950/40' },
    { step: '03', title: 'AGE-AWARE NORMALIZATION', desc: 'Pediatric (<18), Adult (18-64), Geriatric (65+) physiological baselines', color: 'border-indigo-500/60 bg-indigo-950/40' },
    { step: '04', title: 'RED-FLAG SAFETY ENGINE', desc: 'Layer 1: Immediate escalation rules (Hypoxemia, Hypotension, Stridor)', color: 'border-rose-500 bg-rose-950/60' },
    { step: '05', title: 'TRANSPARENT RISK SCORE', desc: 'Layer 2: Weighted score (0-100) with factor decomposition', color: 'border-orange-500/60 bg-orange-950/40' },
    { step: '06', title: 'UNCERTAINTY ENGINE', desc: 'Layer 3: Evaluates data gaps ("When uncertain, do not downgrade")', color: 'border-amber-500/60 bg-amber-950/40' },
    { step: '07', title: 'TRIAGE RECOMMENDATION', desc: '5-Level Severity Framework output + explicit confidence indicator', color: 'border-emerald-500/60 bg-emerald-950/40' },
    { step: '08', title: 'CLINICIAN REVIEW', desc: 'Layer 4: Mandatory human control & clinician override capability', color: 'border-cyan-500/60 bg-cyan-950/40' },
    { step: '09', title: 'WAITING-ROOM RADAR™', desc: 'Continuous safety monitoring for patients waiting in queue', color: 'border-rose-500 bg-rose-950/80' },
    { step: '10', title: 'REASSESSMENT LOGIC', desc: 'Triggered when wait threshold exceeded or vitals deteriorate', color: 'border-orange-500/60 bg-orange-950/40' },
    { step: '11', title: 'AUDIT + FEEDBACK STORE', desc: 'Immutable audit logs & clinician override feedback capture', color: 'border-purple-500/60 bg-purple-950/40' },
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
              <p className="text-xs text-slate-400">Sequential 11-layer clinical data flow & LLM decision isolation boundary</p>
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

        {/* LLM Isolation Rule Callout */}
        <div className="bg-slate-950 border-b border-slate-800 p-3 text-xs text-slate-300 flex items-center gap-3 font-mono">
          <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <strong className="text-emerald-400 uppercase">LLM DECISION ISOLATION BOUNDARY:</strong>
            <span className="text-slate-300 ml-1">
              LLMs (if integrated) are strictly restricted to symptom normalization & text summarization. All safety-critical triage decisions are 100% governed by deterministic rules & scoring.
            </span>
          </div>
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
                      <span className="font-bold text-xs text-white tracking-wider">{layer.title}</span>
                      <p className="text-[11px] text-slate-300 font-sans mt-0.5">{layer.desc}</p>
                    </div>
                  </div>

                  {isActive && (
                    <span className="text-[10px] bg-rose-500 text-slate-950 font-bold px-2 py-0.5 rounded uppercase animate-pulse">
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
