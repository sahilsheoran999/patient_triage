import React, { useState, useEffect } from 'react';
import { X, GitMerge, ArrowDown, Play } from 'lucide-react';

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
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const architectureLayers: ArchitectureLayer[] = [
    {
      step: '01',
      title: 'Patient Data Ingestion',
      badge: 'Input',
      badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      desc: 'Vitals, chief complaint, age category, associated symptoms, medical history, and clinician-observed cues.',
    },
    {
      step: '02',
      title: 'Data Quality & Completeness',
      badge: 'Safety Rule',
      badgeColor: 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      desc: 'Completeness evaluation and missing-data tracking. Enforces UNKNOWN ≠ NORMAL so unrecorded fields never default to benign.',
    },
    {
      step: '03',
      title: 'Age-Aware Physiological Normalization',
      badge: 'Physiology',
      badgeColor: 'bg-blue-100 dark:bg-blue-950/70 text-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      desc: 'Contextualizes physiological vitals across Pediatric (<18), Adult (18–64), and Geriatric (65+) thresholds.',
    },
    {
      step: '04',
      title: 'Deterministic Safety Engine',
      badge: 'Safety Authority',
      badgeColor: 'bg-red-100 dark:bg-red-950/70 text-red-900 dark:text-red-300 border-red-200 dark:border-red-800 font-semibold',
      desc: 'Evaluates critical physiological red flags (Severe hypoxemia, hypotension, stridor, altered mental status) to establish an unbreachable safety floor.',
    },
    {
      step: '05',
      title: 'Rule-Based Risk Assessment',
      badge: 'Rule Engine',
      badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      desc: 'Calculates a weighted risk score (0–100) with complete factor decomposition and transparent attribution.',
    },
    {
      step: '06',
      title: 'XGBoost Advisory Model',
      badge: 'Advisory ML',
      badgeColor: 'bg-blue-100 dark:bg-blue-950/70 text-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      desc: '5-class acuity prediction using 71 domain-engineered features (shock index, pulse pressure, clinical interactions, text concepts).',
    },
    {
      step: '07',
      title: 'Model Probability & Uncertainty Estimation',
      badge: 'Uncertainty',
      badgeColor: 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      desc: 'Calculates probability distribution, margin uncertainty, and generates local SHAP feature explanations.',
    },
    {
      step: '08',
      title: 'Safety Fusion & Safety Floor Gating',
      badge: 'Safety Gate',
      badgeColor: 'bg-red-100 dark:bg-red-950/70 text-red-900 dark:text-red-300 border-red-200 dark:border-red-800 font-semibold',
      desc: 'Fuses rule authority and advisory ML. Enforces deterministic safety floor (ML can upgrade for safety, but cannot downgrade a red flag).',
    },
    {
      step: '09',
      title: 'Decision Support Output',
      badge: 'Recommendation',
      badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      desc: 'Surfaces recommendation with clear rule/model concordancy status and prominent disagreement review badges.',
    },
    {
      step: '10',
      title: 'Clinician Review & Final Authority',
      badge: 'Final Authority',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-semibold',
      desc: 'Licensed clinician reviews synthesized evidence and makes final triage determination with mandatory override reason tracking.',
    },
    {
      step: '11',
      title: 'Audit Logging & Continuous Radar Monitoring',
      badge: 'Audit + Radar',
      badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      desc: 'Immutable audit trail logs all decisions while Waiting-Room Radar tracks ongoing physiological deterioration over time.',
    },
  ];

  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveStepIndex((prev) => (prev + 1) % architectureLayers.length);
      }, 1600);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 w-full max-w-4xl rounded-lg shadow-xl overflow-hidden text-slate-900 dark:text-slate-100 my-6 transition-colors">

        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <GitMerge className="w-5 h-5 text-slate-800 dark:text-slate-200" />
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">System Architecture Flow</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Sequential 11-layer clinical data pipeline & safety gating boundary</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-xs font-medium rounded text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <Play className={`w-3 h-3 ${isPlaying ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button onClick={onClose} className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Authority Legend */}
        <div className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex flex-wrap items-center gap-4 text-xs">
          <span className="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold">Hierarchy:</span>
          <span className="flex items-center gap-1.5 text-slate-900 dark:text-slate-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            Clinician (Final Authority)
          </span>
          <span className="flex items-center gap-1.5 text-slate-900 dark:text-slate-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            Deterministic Safety Rules (Safety Authority)
          </span>
          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            XGBoost (Advisory Model)
          </span>
          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            UNKNOWN ≠ NORMAL
          </span>
        </div>

        {/* 11-Step Flow Diagram */}
        <div className="p-5 space-y-2 max-h-[70vh] overflow-y-auto">
          {architectureLayers.map((layer, idx) => {
            const isActive = idx === activeStepIndex;

            return (
              <React.Fragment key={layer.step}>
                <div
                  onClick={() => setActiveStepIndex(idx)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                    isActive
                      ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 ring-1 ring-blue-400 dark:ring-blue-600 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                      isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {layer.step}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900 dark:text-white">{layer.title}</span>
                        {layer.badge && (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded border ${layer.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                            {layer.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">{layer.desc}</p>
                    </div>
                  </div>

                  {isActive && (
                    <span className="text-[10px] bg-blue-600 text-white font-medium px-2 py-0.5 rounded shrink-0 ml-2">
                      Active Step
                    </span>
                  )}
                </div>

                {idx < architectureLayers.length - 1 && (
                  <div className="flex justify-center my-0.5">
                    <ArrowDown className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-300 dark:text-slate-700'}`} />
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
