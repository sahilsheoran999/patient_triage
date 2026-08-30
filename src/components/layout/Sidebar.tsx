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
  label: string;
  icon: React.ElementType;
  badgeCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  reassessmentCount = 0,
  deteriorationCount = 0
}) => {
  const primaryNavItems: NavItem[] = [
    {
      id: 'command_center',
      label: 'Command Center',
      icon: LayoutDashboard,
    },
    {
      id: 'radar',
      label: 'Waiting-Room Radar',
      icon: Radar,
      badgeCount: reassessmentCount + deteriorationCount,
    },
    {
      id: 'intake',
      label: 'Patient Intake',
      icon: UserPlus,
    },
    {
      id: 'detail',
      label: 'Patient Detail',
      icon: FileText,
    },
    {
      id: 'audit',
      label: 'Audit & Overrides',
      icon: History,
    },
  ];

  const secondaryNavItems: NavItem[] = [
    {
      id: 'analytics',
      label: 'Analytics & Metrics',
      icon: BarChart3,
    },
    {
      id: 'config',
      label: 'Facility Settings',
      icon: Sliders,
    },
    {
      id: 'safety_policy',
      label: 'Safety Policy',
      icon: ShieldCheck,
    },
    {
      id: 'data_protection',
      label: 'Data Protection',
      icon: Lock,
    },
    {
      id: 'architecture',
      label: 'System Architecture',
      icon: GitMerge,
    },
  ];

  const renderNavList = (items: NavItem[]) => (
    <div className="space-y-0.5">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between text-xs group ${
              isActive
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Icon className={`w-4 h-4 ${isActive ? 'text-rose-600 dark:text-rose-500' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
              <span>{item.label}</span>
            </div>

            {item.badgeCount && item.badgeCount > 0 ? (
              <span className="bg-rose-600 text-white font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {item.badgeCount}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );

  return (
    <aside className="w-56 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between select-none shrink-0 transition-colors">
      <div className="p-3 space-y-5 overflow-y-auto">

        {/* Primary Clinical Workflow Section */}
        <div>
          <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Clinical Operations
          </div>
          {renderNavList(primaryNavItems)}
        </div>

        {/* Secondary Admin & Governance Section */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Governance & Settings
          </div>
          {renderNavList(secondaryNavItems)}
        </div>

      </div>

      {/* Footer Guardrail Notice */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium mb-0.5">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
          <span>Decision Support</span>
        </div>
        Clinician retains 100% final decision authority.
      </div>
    </aside>
  );
};
