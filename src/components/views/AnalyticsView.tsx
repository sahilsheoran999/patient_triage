import React from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
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
    { label: 'Avg Triage Latency', value: '8.4 s', sub: '<10-second target' },
    { label: 'High-Risk Detection Rate', value: '94.2%', sub: 'Red-flag sensitivity' },
    { label: 'Reassessment Triggers', value: '186', sub: 'Radar monitoring triggers' },
    { label: 'Clinician Override Rate', value: '13.0%', sub: '184 overridden cases' },
    { label: 'Avg Wait Duration', value: '28.5 m', sub: 'Queue waiting duration' },
    { label: 'Deterioration Detected', value: '42', sub: 'Worsening vitals caught' },
    { label: 'Data Completeness Index', value: '81.4%', sub: 'Intake quality score' },
  ];

  const agreementData = [
    { name: 'System & Clinician Agreed', value: 87, color: '#10b981' },
    { name: 'Clinician Overridden', value: 13, color: '#3b82f6' },
  ];

  const overrideReasonsData = [
    { reason: 'New clinical observation', percentage: 42, color: '#d97706' },
    { reason: 'Patient condition changed', percentage: 31, color: '#dc2626' },
    { reason: 'Additional info available', percentage: 19, color: '#2563eb' },
    { reason: 'System inconsistent with exam', percentage: 8, color: '#64748b' },
  ];

  return (
    <div className="space-y-4 p-4 sm:p-6 text-slate-900 dark:text-slate-100 font-sans transition-colors">

      {/* Title Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded border border-transparent dark:border-slate-700">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-white">Analytics & Operational Metrics</h1>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                Simulated Demonstration Data
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Triage operational performance & clinician concordancy metrics</p>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {simulatedMetrics.map((m, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-lg shadow-sm space-y-1">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block uppercase">
              Demonstration Metric
            </span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">{m.label}</span>
            <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">{m.value}</p>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{m.sub}</span>
          </div>
        ))}
      </div>

      {/* Agreement & Override Reason Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Agreement Donut Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
              Clinician Concordancy Rate
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">Synthetic Cohort</span>
          </div>

          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={agreementData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {agreementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              <span className="text-slate-700 dark:text-slate-300">Concordant: <strong>87%</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
              <span className="text-slate-700 dark:text-slate-300">Overridden: <strong>13%</strong></span>
            </div>
          </div>
        </div>

        {/* Common Override Reasons Bar Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
              Clinician Override Breakdown
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">Synthetic Cohort</span>
          </div>

          <div className="h-48 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overrideReasonsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} domain={[0, 50]} />
                <YAxis dataKey="reason" type="category" stroke="#94a3b8" fontSize={10} width={150} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', fontSize: '11px' }} />
                <Bar dataKey="percentage" fill="#2563eb" radius={[0, 4, 4, 0]}>
                  {overrideReasonsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Model Benchmark Performance Summary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">
              Model Holdout Benchmark Metrics
            </span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              V2 Domain-Robust
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            2,250 holdout synthetic test records.
          </span>
        </div>

        {/* 4 Key ML Evaluation Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block font-sans">Accuracy</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">90.79%</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-sans mt-0.5">vs 44.71% Rule Baseline</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block font-sans">Macro F1-Score</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">88.20%</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-sans mt-0.5">5-Class Macro Average</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block font-sans">Critical Recall</span>
            <span className="text-xl font-bold text-red-700 dark:text-red-400">95.99%</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-sans mt-0.5">Life-Threatening Recall</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block font-sans">High+Crit Sensitivity</span>
            <span className="text-xl font-bold text-amber-800 dark:text-amber-400">98.87%</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-sans mt-0.5">Acute Queue Detection</span>
          </div>
        </div>
      </div>

      {/* Feedback Loop Panel */}
      <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <div>
            <span className="font-semibold text-slate-900 dark:text-white block">Clinical Feedback Collection Store</span>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
              Overrides logged for offline quality auditing and multi-center validation. Production inference remains strictly static and deterministic.
            </p>
          </div>
        </div>
        <span className="text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded">
          Logging Active
        </span>
      </div>

    </div>
  );
};
