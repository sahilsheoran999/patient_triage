import React from 'react';
import { BarChart3, PieChart as PieIcon, RefreshCw, Activity, ShieldAlert, Info } from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';

export const AnalyticsView: React.FC = () => {
  const simulatedMetrics = [
    { label: 'Patients Processed', value: '1,420', sub: 'Total ED triage cohort' },
    { label: 'Avg Simulated Triage Time', value: '8.4 s', sub: '<10-second target' },
    { label: 'High-Risk Detection Rate', value: '94.2%', sub: 'Red-flag sensitivity' },
    { label: 'Reassessment Alerts Triggered', value: '186', sub: 'Radar monitoring triggers' },
    { label: 'Clinician Override Rate', value: '13.0%', sub: '184 overridden cases' },
    { label: 'Avg Wait Time in ED', value: '28.5 m', sub: 'Queue waiting duration' },
    { label: 'Deterioration Detected in Queue', value: '42', sub: 'Worsening vitals caught' },
    { label: 'Avg Data Completeness', value: '81.4%', sub: 'Intake quality score' },
  ];

  const agreementData = [
    { name: 'AI & Clinician Agreed', value: 87, color: '#10b981' },
    { name: 'Clinician Overridden', value: 13, color: '#6366f1' },
  ];

  const overrideReasonsData = [
    { reason: 'New clinical observation', percentage: 42, color: '#f97316' },
    { reason: 'Patient condition changed', percentage: 31, color: '#ef4444' },
    { reason: 'Additional info available', percentage: 19, color: '#eab308' },
    { reason: 'AI inconsistent with assessment', percentage: 8, color: '#8b5cf6' },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 text-slate-100 font-sans">
      
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-emerald-400" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-mono text-white">Analytics & Feedback Loop</h1>
              <span className="bg-slate-950 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded border border-amber-500/40">
                SIMULATED PROTOTYPE METRICS
              </span>
            </div>
            <p className="text-xs text-slate-400">Prototype performance metrics & clinician agreement evaluation</p>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid (Tagged SIMULATED PROTOTYPE METRIC) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {simulatedMetrics.map((m, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-3.5 rounded-lg space-y-1">
            <span className="text-[10px] text-amber-400/90 font-mono font-bold block uppercase tracking-wider">
              SIMULATED PROTOTYPE METRIC
            </span>
            <span className="text-xs font-semibold text-slate-300 block">{m.label}</span>
            <p className="text-2xl font-bold font-mono text-white mt-1">{m.value}</p>
            <span className="text-[10px] text-slate-500 block">{m.sub}</span>
          </div>
        ))}
      </div>

      {/* AI vs Clinician Agreement & Override Reason Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Agreement Donut Chart */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-mono text-xs font-bold text-slate-200 uppercase">
              AI vs Clinician Agreement Rate
            </span>
            <span className="text-[10px] text-slate-500 font-mono">SIMULATED DATA</span>
          </div>

          <div className="h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={agreementData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {agreementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#374151', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-6 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
              <span className="text-slate-300">Agreed: <strong>87%</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block"></span>
              <span className="text-slate-300">Overridden: <strong>13%</strong></span>
            </div>
          </div>
        </div>

        {/* Common Override Reasons Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-mono text-xs font-bold text-slate-200 uppercase">
              Common Clinician Override Reasons
            </span>
            <span className="text-[10px] text-slate-500 font-mono">SIMULATED DATA</span>
          </div>

          <div className="h-52 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overrideReasonsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis type="number" stroke="#6b7280" fontSize={10} domain={[0, 50]} />
                <YAxis dataKey="reason" type="category" stroke="#9ca3af" fontSize={10} width={160} />
                <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#374151', fontSize: '11px' }} />
                <Bar dataKey="percentage" fill="#f97316" radius={[0, 4, 4, 0]}>
                  {overrideReasonsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Feedback Loop Panel */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-indigo-400" />
          <div>
            <span className="font-bold text-white uppercase block">CLINICAL FEEDBACK CAPTURE STORE</span>
            <p className="text-slate-400 text-[11px] font-sans mt-0.5">
              Feedback captured for future model evaluation, rule calibration, and audit review. The system does NOT automatically retrain models in production without validation.
            </p>
          </div>
        </div>
        <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-500/40 px-3 py-1 rounded">
          Evaluation Active
        </span>
      </div>

    </div>
  );
};
