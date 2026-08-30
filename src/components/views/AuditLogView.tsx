import React, { useState } from 'react';
import { AuditLogEntry } from '../../types';
import { History, Search } from 'lucide-react';

interface AuditLogViewProps {
  auditLogs: AuditLogEntry[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ auditLogs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEventType, setFilterEventType] = useState<string>('ALL');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEvent = filterEventType === 'ALL' || log.eventType === filterEventType;
    return matchesSearch && matchesEvent;
  });

  return (
    <div className="space-y-4 p-4 sm:p-6 text-slate-900 dark:text-slate-100 font-sans transition-colors">

      {/* Title Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded border border-transparent dark:border-slate-700">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white">Clinical Audit & Override Log</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Immutable clinical decision trail & clinician override records</p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded text-xs text-slate-600 dark:text-slate-300 font-mono">
          Logged Events: <strong className="text-slate-900 dark:text-white">{auditLogs.length}</strong>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Patient ID, User, Details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-400 dark:focus:border-slate-700 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-slate-500 dark:text-slate-400">Filter Event:</span>
          <select
            value={filterEventType}
            onChange={(e) => setFilterEventType(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded px-2.5 py-1 text-xs focus:bg-white dark:focus:bg-slate-900 focus:border-slate-400 dark:focus:border-slate-700 focus:outline-none"
          >
            <option value="ALL">All Event Types</option>
            <option value="SAFETY_FLOOR_OVERRIDE">Safety Floor Override</option>
            <option value="MODEL_RULE_DISAGREEMENT">Model / Rule Disagreement</option>
            <option value="CLINICIAN_OVERRIDE">Clinician Override</option>
            <option value="DETERIORATION_DETECTED">Deterioration Detected</option>
            <option value="REASSESSMENT_TRIGGERED">Reassessment Triggered</option>
            <option value="AI_ASSESSMENT_GENERATED">Decision Generated</option>
            <option value="SURGE_MODE_ACTIVATED">Surge Mode</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <th className="p-3">Timestamp</th>
                <th className="p-3">Patient ID</th>
                <th className="p-3">Event Type</th>
                <th className="p-3">User / Actor</th>
                <th className="p-3">Details & Notes</th>
                <th className="p-3 text-right">State Shift</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 text-slate-500 dark:text-slate-400 font-mono whitespace-nowrap">{log.timestamp}</td>
                  <td className="p-3 font-bold font-mono text-slate-900 dark:text-white whitespace-nowrap">{log.patientId}</td>
                  <td className="p-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                      log.eventType === 'SAFETY_FLOOR_OVERRIDE' ? 'bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800 font-semibold' :
                      log.eventType === 'MODEL_RULE_DISAGREEMENT' ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800 font-semibold' :
                      log.eventType === 'CLINICIAN_OVERRIDE' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-semibold' :
                      log.eventType === 'DETERIORATION_DETECTED' ? 'bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800 font-semibold' :
                      log.eventType === 'REASSESSMENT_TRIGGERED' ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800 font-semibold' :
                      'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}>
                      {log.eventType}
                    </span>
                  </td>
                  <td className="p-3 text-slate-800 dark:text-slate-200 font-medium whitespace-nowrap">{log.user}</td>
                  <td className="p-3 text-slate-700 dark:text-slate-300 max-w-sm">
                    <p className="line-clamp-2">{log.details}</p>
                    {log.reason && (
                      <span className="text-[11px] text-amber-800 dark:text-amber-300 block mt-0.5 font-medium">Reason: {log.reason}</span>
                    )}
                  </td>
                  <td className="p-3 text-right whitespace-nowrap font-mono">
                    {log.previousState && log.newState ? (
                      <span className="text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400">{log.previousState}</span>
                        <span className="text-slate-400 dark:text-slate-600 px-1">→</span>
                        <span className="text-slate-900 dark:text-white font-bold">{log.newState}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
