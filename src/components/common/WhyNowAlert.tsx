import React from 'react';
import { AlertCircle, Clock, ArrowRight, AlertTriangle, ShieldAlert, Zap, HelpCircle } from 'lucide-react';
import { MonitoringReasonCode } from '../../types';

interface WhyNowAlertProps {
  title?: string;
  reason?: string;
  reasonCode?: MonitoringReasonCode;
  actionText?: string;
  onActionClick?: () => void;
  compact?: boolean;
}

export const WhyNowAlert: React.FC<WhyNowAlertProps> = ({
  title,
  reason = 'Clinician review recommended.',
  reasonCode = 'NONE',
  actionText = 'REASSESS NOW',
  onActionClick,
  compact = false
}) => {
  // Determine distinct visual badges, colors, and default titles based on reasonCode
  let borderClass = 'border-rose-500';
  let gradientClass = 'from-rose-950/80 via-slate-900 to-slate-900';
  let badgeBg = 'bg-rose-500 text-slate-950';
  let titleColor = 'text-rose-300';
  let badgeText = 'WHY NOW?';
  let defaultTitle = 'Safety Alert Triggered';
  let Icon = AlertCircle;

  if (reasonCode === 'SAFETY_RED_FLAG') {
    borderClass = 'border-rose-500';
    gradientClass = 'from-rose-950/90 via-slate-900 to-slate-900';
    badgeBg = 'bg-rose-500 text-slate-950';
    titleColor = 'text-rose-300';
    badgeText = 'SAFETY FLOOR';
    defaultTitle = 'Safety Floor Triggered';
    Icon = ShieldAlert;
  } else if (reasonCode === 'MODEL_RULE_DISAGREEMENT') {
    borderClass = 'border-amber-500';
    gradientClass = 'from-amber-950/80 via-slate-900 to-slate-900';
    badgeBg = 'bg-amber-500 text-slate-950';
    titleColor = 'text-amber-300';
    badgeText = 'AI ADVISORY';
    defaultTitle = 'Advisory Model Disagreement';
    Icon = AlertTriangle;
  } else if (reasonCode === 'DETERIORATION') {
    borderClass = 'border-rose-500';
    gradientClass = 'from-rose-950/90 via-amber-950/40 to-slate-900';
    badgeBg = 'bg-rose-500 text-slate-950';
    titleColor = 'text-rose-300';
    badgeText = 'DETERIORATION';
    defaultTitle = 'Deterioration Detected';
    Icon = Zap;
  } else if (reasonCode === 'WAIT_TIME_EXCEEDED') {
    borderClass = 'border-orange-500';
    gradientClass = 'from-orange-950/80 via-slate-900 to-slate-900';
    badgeBg = 'bg-orange-500 text-slate-950';
    titleColor = 'text-orange-300';
    badgeText = 'QUEUE TIMER';
    defaultTitle = 'Waiting-Time Threshold Exceeded';
    Icon = Clock;
  } else if (reasonCode === 'HIGH_UNCERTAINTY') {
    borderClass = 'border-indigo-500';
    gradientClass = 'from-indigo-950/80 via-slate-900 to-slate-900';
    badgeBg = 'bg-indigo-500 text-slate-950';
    titleColor = 'text-indigo-300';
    badgeText = 'UNCERTAINTY';
    defaultTitle = 'High Uncertainty Review';
    Icon = HelpCircle;
  }

  const displayTitle = title || defaultTitle;

  return (
    <div className={`bg-gradient-to-r ${gradientClass} border-l-4 ${borderClass} border-y border-r border-slate-800 p-2.5 rounded-r-lg shadow-lg`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <div className="bg-slate-900/80 p-1.5 rounded text-white mt-0.5 border border-slate-800">
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`${badgeBg} text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide`}>
                {badgeText}
              </span>
              <span className={`text-xs font-semibold ${titleColor}`}>{displayTitle}</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 font-medium leading-relaxed">
              {reason}
            </p>
          </div>
        </div>

        {onActionClick && (
          <button
            onClick={onActionClick}
            className="self-start sm:self-center px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded transition-all duration-150 flex items-center gap-1.5 shadow-md border border-slate-700 whitespace-nowrap"
          >
            <span>{actionText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
