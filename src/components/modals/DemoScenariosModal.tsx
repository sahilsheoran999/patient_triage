import React from 'react';
import { X, Play, RefreshCw, Sparkles } from 'lucide-react';

interface DemoScenariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (scenarioId: string) => void;
  onRunSignatureDemo: () => void;
  onResetDemo: () => void;
}

export const DemoScenariosModal: React.FC<DemoScenariosModalProps> = ({
  isOpen,
  onClose,
  onSelectScenario,
  onRunSignatureDemo,
  onResetDemo,
}) => {
  if (!isOpen) return null;

  const scenarios = [
    { id: 'A', title: 'Scenario A — Clear Critical Case', patientId: 'P-101', desc: 'Anaphylaxis red flag → Immediate resuscitation escalation.' },
    { id: 'B', title: 'Scenario B — Ambiguous Presentation', patientId: 'P-106', desc: 'Atypical chest tightness → High uncertainty → Safety escalation.' },
    { id: 'C', title: 'Scenario C — Pediatric Context', patientId: 'P-103', desc: 'Pediatric fever (39.8°C) → Age-aware pediatric weight multiplier.' },
    { id: 'D', title: 'Scenario D — Geriatric Presentation', patientId: 'P-104', desc: 'Geriatric confusion → Age-aware geriatric sepsis protocol.' },
    { id: 'E', title: 'Scenario E — Zero History Record', patientId: 'P-105', desc: 'Unrepresented patient → 42% completeness → HIGH uncertainty.' },
    { id: 'F', title: 'Scenario F — Vital Deterioration', patientId: 'P-108', desc: 'SpO₂ drops 96% → 89% → Radar detects → Reassessment alert fired.' },
    { id: 'G', title: 'Scenario G — Long Wait Exceeded', patientId: 'P-110', desc: 'Wait time 82m exceeds Medium 30m threshold → Reassessment.' },
    { id: 'H', title: 'Scenario H — Clinician Override', patientId: 'P-111', desc: 'System Medium → Clinician overrides to High → Audit log generated.' },
    { id: 'I', title: 'Scenario I — 3× Surge Pressure', patientId: 'P-120', desc: 'Activate 3.0× surge volume → Priority queue pinned.' },
    { id: 'J', title: 'Scenario J — ML Catches Interaction', patientId: 'P-127', desc: 'Chest pain + Levine sign → Rule NON_URGENT (22/100) vs ML MEDIUM (81.9%) → Safety upgrade.' },
    { id: 'K', title: 'Scenario K — Safety Floor Override', patientId: 'P-146', desc: 'SpO₂ 78% desaturation → ML predicts Medium but Safety Floor forces CRITICAL.' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 w-full max-w-3xl rounded-lg shadow-xl overflow-hidden text-slate-900 dark:text-slate-100 my-6 transition-colors">

        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Play className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">Clinical Demo Scenarios</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Select a pre-configured clinical scenario or run the full demo sequence</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onResetDemo}
              className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded flex items-center gap-1 border border-slate-300 dark:border-slate-700 transition-colors"
              title="Reset simulation to initial baseline"
            >
              <RefreshCw className="w-3 h-3 text-slate-500 dark:text-slate-400" />
              <span>Reset Baseline</span>
            </button>

            <button onClick={onClose} className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Demo Trigger Callout */}
        <div className="bg-slate-100 dark:bg-slate-950/80 p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-semibold text-slate-900 dark:text-white block">Recommended Demo Sequence</span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
              Automated workflow illustrating ambiguous intake, longitudinal deterioration detection, and clinician override.
            </p>
          </div>
          <button
            onClick={() => {
              onRunSignatureDemo();
              onClose();
            }}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs rounded transition-colors shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Run Signature Demo</span>
          </button>
        </div>

        {/* Scenarios Grid */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[60vh] overflow-y-auto text-xs">
          {scenarios.map((sc) => (
            <button
              key={sc.id}
              onClick={() => {
                onSelectScenario(sc.id);
                onClose();
              }}
              className="p-3 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded text-left transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-slate-900 dark:text-white font-semibold mb-1">
                  <span>{sc.title}</span>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 px-1.5 py-0.2 rounded border border-slate-200 dark:border-slate-800 font-mono">
                    {sc.patientId}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  {sc.desc}
                </p>
              </div>

              <span className="text-[10px] text-rose-700 dark:text-rose-400 font-semibold mt-2">
                Launch Scenario →
              </span>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};
