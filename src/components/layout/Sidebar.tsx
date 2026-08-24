import React from 'react';
import { 
  LayoutDashboard, 
  Radar, 
  UserPlus, 
  FileText, 
  History, 
  BarChart3, 
  Sliders, 
  Lock, 
  ShieldCheck, 
  GitMerge 
} from 'lucide-react';

export type ActiveTab = 
  | 'command_center'
  | 'radar'
  | 'intake'
  | 'detail'
  | 'audit'
  | 'analytics'
  | 'config'
  | 'data_protection'
  | 'safety_policy'
  | 'architecture';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  reassessmentCount?: number;
  deteriorationCount?: number;
}

interface NavItem {
  id: ActiveTab;
  index: string;
  label: string;
  subtitle: string;
  icon: React.ElementType;
  badgeCount?: number;
  isSignature?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  reassessmentCount = 0,
  deteriorationCount = 0
}) => {
  const navItems: NavItem[] = [
    {
      id: 'command_center',
      index: '01',
      label: 'Command Center',
      subtitle: 'Hero Priority Board',
      icon: LayoutDashboard,
    },
    {
      id: 'radar',
      index: '02',
      label: 'Waiting-Room Radar™',
      subtitle: 'Continuous Safety Monitoring',
      icon: Radar,
      badgeCount: reassessmentCount + deteriorationCount,
      isSignature: true,
    },
    {
      id: 'intake',
      index: '03',
      label: 'Patient Intake',
      subtitle: 'Clinician Intake & Quality',
      icon: UserPlus,
    },
    {
      id: 'detail',
      index: '04',
      label: 'Patient Detail',
      subtitle: 'Comprehensive View & Recharts',
      icon: FileText,
    },
    {
      id: 'audit',
      index: '05',
      label: 'Audit & Overrides',
      subtitle: 'Clinical Event Logs',
      icon: History,
    },
    {
      id: 'analytics',
      index: '06',
      label: 'Analytics & Feedback',
      subtitle: 'Simulated Prototype Metrics',
      icon: BarChart3,
    },
    {
      id: 'config',
      index: '07',
      label: 'Hospital Configuration',
      subtitle: 'Scalability & Profiles',
      icon: Sliders,
    },
    {
      id: 'data_protection',
      index: '08',
      label: 'Data Protection',
      subtitle: 'India Jurisdiction Posture',
      icon: Lock,
    },
    {
      id: 'safety_policy',
      index: '09',
      label: 'Safety Policy',
      subtitle: 'Decision & Monitoring Flow',
      icon: ShieldCheck,
    },
    {
      id: 'architecture',
      index: '10',
      label: 'System Architecture',
      subtitle: '11-Layer Sequential Flow',
      icon: GitMerge,
    },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between select-none shrink-0">
      <div className="p-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">
          Clinical Operations Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 flex items-center justify-between group ${
                isActive
                  ? item.isSignature
                    ? 'bg-rose-950/70 border border-rose-500/50 text-white shadow-lg shadow-rose-950/30'
                    : 'bg-slate-900 border border-slate-700 text-white shadow-md'
                  : 'hover:bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`font-mono text-[10px] font-bold mt-0.5 ${isActive ? 'text-rose-400' : 'text-slate-600'}`}>
                  {item.index}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isActive ? (item.isSignature ? 'text-rose-400 animate-pulse' : 'text-slate-100') : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      {item.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-normal mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              {item.badgeCount && item.badgeCount > 0 ? (
                <span className="bg-rose-600 text-white font-mono font-bold text-[10px] px-1.5 py-0.5 rounded-full shadow-sm animate-pulse">
                  {item.badgeCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Footer Disclaimer */}
      <div className="p-3 border-t border-slate-900 bg-slate-950 text-[10px] text-slate-500 leading-relaxed font-sans">
        <div className="flex items-center gap-1.5 text-slate-400 font-medium mb-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Decision Support Guardrail</span>
        </div>
        "AI recommendation — clinician retains final decision."
      </div>
    </aside>
  );
};
