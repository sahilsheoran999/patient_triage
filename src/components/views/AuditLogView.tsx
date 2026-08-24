import React, { useState } from 'react';
import { AuditLogEntry } from '../../types';
import { History, Search, Filter, ShieldCheck, Clock, FileText } from 'lucide-react';

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
    <div className="space-y-5 p-4 sm:p-6 text-slate-100 font-sans">
      
      {/* Title Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <History className="w-6 h-6 text-indigo-400" />
          <div>
            <h1 className="text-xl font-bold font-mono text-white">Clinical Audit & Override Trail</h1>
            <p className="text-xs text-slate-400">Immutable clinical decision event history & clinician override tracking</p>
          </div>
        </div>

        <div className="bg-slate-950 px-3 py-1.5 rounded border border-slate-800 text-xs font-mono text-slate-300">
          Total Recorded Events: <strong className="text-white">{auditLogs.length}</strong>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Patient ID, User, Details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto font-mono">
          <span className="text-slate-500">Event Filter:</span>
          <select
            value={filterEventType}
            onChange={(e) => setFilterEventType(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded px-2.5 py-1 text-xs focus:outline-none"
          >
            <option value="ALL">All Event Types</option>
            <option value="CLINICIAN_OVERRIDE">Clinician Override</option>
            <option value="DETERIORATION_DETECTED">Deterioration Detected</option>
            <option value="REASSESSMENT_TRIGGERED">Reassessment Triggered</option>
            <option value="AI_ASSESSMENT_GENERATED">AI Assessment Generated</option>
            <option value="SURGE_MODE_ACTIVATED">Surge Mode</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="p-3">Timestamp</th>
                <th className="p-3">Patient ID</th>
                <th className="p-3">Event Type</th>
                <th className="p-3">User / Actor</th>
                <th className="p-3">Details & Reason</th>
                <th className="p-3 text-right">State Shift</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-950/60 transition-colors">
                  <td className="p-3 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                  <td className="p-3 font-bold text-rose-400 whitespace-nowrap">{log.patientId}</td>
                  <td className="p-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.eventType === 'CLINICIAN_OVERRIDE' ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/40' :
                      log.eventType === 'DETERIORATION_DETECTED' ? 'bg-rose-950 text-rose-300 border border-rose-500/40' :
                      log.eventType === 'REASSESSMENT_TRIGGERED' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' :
                      'bg-slate-950 text-slate-300'
                    }`}>
                      {log.eventType}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300 font-sans font-medium whitespace-nowrap">{log.user}</td>
                  <td className="p-3 text-slate-300 font-sans max-w-xs">
                    <p className="line-clamp-2">{log.details}</p>
                    {log.reason && (
                      <span className="text-[10px] text-amber-300 block mt-0.5 font-mono">Reason: {log.reason}</span>
                    )}
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    {log.previousState && log.newState ? (
                      <span className="text-[11px] font-mono">
                        <span className="text-slate-500">{log.previousState}</span>
                        <span className="text-slate-600 px-1">→</span>
                        <span className="text-amber-400 font-bold">{log.newState}</span>
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
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
