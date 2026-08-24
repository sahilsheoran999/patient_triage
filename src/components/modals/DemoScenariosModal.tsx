import React from 'react';
import { X, Play, RefreshCw, Activity, ShieldAlert, Sparkles } from 'lucide-react';

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
    { id: 'A', title: 'Scenario A — Clear Critical Case', patientId: 'P-101', desc: 'Anaphylaxis red flag -> Immediate resuscitation escalation' },
    { id: 'B', title: 'Scenario B — Ambiguous Case', patientId: 'P-106', desc: 'Atypical chest tightness -> High uncertainty -> Safety escalation' },
    { id: 'C', title: 'Scenario C — Pediatric', patientId: 'P-103', desc: 'Pediatric fever (39.8°C) -> Age-aware pediatric weight multiplier' },
    { id: 'D', title: 'Scenario D — Geriatric', patientId: 'P-104', desc: 'Geriatric confusion -> Age-aware geriatric sepsis protocol' },
    { id: 'E', title: 'Scenario E — Zero History', patientId: 'P-105', desc: 'Unrepresented patient -> 42% completeness -> HIGH uncertainty' },
    { id: 'F', title: 'Scenario F — Deterioration', patientId: 'P-108', desc: 'SpO₂ drops 96% -> 89% -> Radar detects -> "WHY NOW?" alert' },
    { id: 'G', title: 'Scenario G — Long Wait', patientId: 'P-110', desc: 'Wait time 82m exceeds Medium 30m threshold -> Reassessment' },
    { id: 'H', title: 'Scenario H — Clinician Override', patientId: 'P-111', desc: 'AI Medium -> Clinician overrides to High -> Audit log generated' },
    { id: 'I', title: 'Scenario I — 3× Surge Mode', patientId: 'P-120', desc: 'Activate 3.0× surge volume -> Critical cases pinned & queue updated' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden text-slate-100 my-8">
        
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Play className="w-5 h-5 text-amber-400 fill-amber-400" />
            <div>
              <h2 className="font-bold text-sm font-mono text-white">Competition Demo Launcher</h2>
              <p className="text-xs text-slate-400">Select predefined scenario or trigger 1-click hero journey</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onResetDemo}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold rounded flex items-center gap-1 border border-slate-700"
              title="Reset simulation to clean initial state"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>RESET DEMO</span>
            </button>

            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hero Demo Trigger Callout */}
        <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-amber-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rose-300 uppercase font-mono block">Recommended Hero Demo</span>
            <p className="text-xs text-slate-200 mt-0.5">
              Automated 12-step competition journey demonstrating full pipeline from ambiguous triage to vital deterioration, Radar alert, and clinician override.
            </p>
          </div>
          <button
            onClick={() => {
              onRunSignatureDemo();
              onClose();
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition-all shadow-lg shadow-rose-950 flex items-center gap-1.5 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>RUN SIGNATURE DEMO</span>
          </button>
        </div>

        {/* Scenarios Grid A through I */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto text-xs font-mono">
          {scenarios.map((sc) => (
            <button
              key={sc.id}
              onClick={() => {
                onSelectScenario(sc.id);
                onClose();
              }}
              className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-all duration-150 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-white font-bold mb-1">
                  <span>{sc.title}</span>
                  <span className="text-[10px] text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                    {sc.patientId}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans leading-snug">
                  {sc.desc}
                </p>
              </div>

              <span className="text-[10px] text-rose-400 font-bold mt-2 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Launch Scenario →
              </span>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};
