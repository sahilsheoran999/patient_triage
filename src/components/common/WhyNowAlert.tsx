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
  actionText = 'Reassess Patient',
  onActionClick,
}) => {
  let borderClass = 'border-l-red-600 dark:border-l-red-500 border-red-200 dark:border-red-900/60';
  let bgClass = 'bg-red-50/70 dark:bg-red-950/30';
  let badgeClass = 'bg-red-100 dark:bg-red-950/70 text-red-800 dark:text-red-300 font-semibold border border-transparent dark:border-red-800';
  let titleColor = 'text-red-900 dark:text-red-200';
  let badgeText = 'Safety Alert';
  let defaultTitle = 'Clinical Reassessment Required';
  let Icon = AlertCircle;

  if (reasonCode === 'SAFETY_RED_FLAG') {
    borderClass = 'border-l-red-600 dark:border-l-red-500 border-red-200 dark:border-red-900/60';
    bgClass = 'bg-red-50/80 dark:bg-red-950/40';
    badgeClass = 'bg-red-100 dark:bg-red-950/70 text-red-800 dark:text-red-300 font-semibold border border-transparent dark:border-red-800';
    titleColor = 'text-red-900 dark:text-red-200';
    badgeText = 'Safety Floor';
    defaultTitle = 'Deterministic Red Flag Active';
    Icon = ShieldAlert;
  } else if (reasonCode === 'MODEL_RULE_DISAGREEMENT') {
    borderClass = 'border-l-amber-500 dark:border-l-amber-500 border-amber-200 dark:border-amber-900/60';
    bgClass = 'bg-amber-50/80 dark:bg-amber-950/40';
    badgeClass = 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-semibold border border-transparent dark:border-amber-800';
    titleColor = 'text-amber-900 dark:text-amber-200';
    badgeText = 'Model Disagreement';
    defaultTitle = 'Advisory Model Divergence';
    Icon = AlertTriangle;
  } else if (reasonCode === 'DETERIORATION') {
    borderClass = 'border-l-red-600 dark:border-l-red-500 border-red-200 dark:border-red-900/60';
    bgClass = 'bg-red-50/90 dark:bg-red-950/50';
    badgeClass = 'bg-red-100 dark:bg-red-950/70 text-red-800 dark:text-red-300 font-semibold border border-transparent dark:border-red-800';
    titleColor = 'text-red-900 dark:text-red-200';
    badgeText = 'Deterioration';
    defaultTitle = 'Physiological Deterioration Detected';
    Icon = Zap;
  } else if (reasonCode === 'WAIT_TIME_EXCEEDED') {
    borderClass = 'border-l-amber-500 dark:border-l-amber-500 border-amber-200 dark:border-amber-900/60';
    bgClass = 'bg-amber-50/80 dark:bg-amber-950/40';
    badgeClass = 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-semibold border border-transparent dark:border-amber-800';
    titleColor = 'text-amber-900 dark:text-amber-200';
    badgeText = 'Wait Timer';
    defaultTitle = 'Waiting-Time Threshold Exceeded';
    Icon = Clock;
  } else if (reasonCode === 'HIGH_UNCERTAINTY') {
    borderClass = 'border-l-blue-600 dark:border-l-blue-500 border-blue-200 dark:border-blue-900/60';
    bgClass = 'bg-blue-50/80 dark:bg-blue-950/40';
    badgeClass = 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 font-semibold border border-transparent dark:border-blue-800';
    titleColor = 'text-blue-900 dark:text-blue-200';
    badgeText = 'Data Quality';
    defaultTitle = 'High Uncertainty Review';
    Icon = HelpCircle;
  }

  const displayTitle = title || defaultTitle;

  return (
    <div className={`${bgClass} border-l-4 ${borderClass} border-y border-r p-3 rounded-r-md text-xs transition-colors`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <div className="p-1 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 mt-0.5 shadow-2xs">
            <Icon className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`${badgeClass} text-[10px] px-1.5 py-0.2 rounded`}>
                {badgeText}
              </span>
              <span className={`font-semibold ${titleColor}`}>{displayTitle}</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed font-normal">
              {reason}
            </p>
          </div>
        </div>

        {onActionClick && (
          <button
            onClick={onActionClick}
            className="self-start sm:self-center px-3 py-1 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium text-xs rounded border border-slate-300 dark:border-slate-700 transition-colors flex items-center gap-1 shrink-0 shadow-2xs"
          >
            <span>{actionText}</span>
            <ArrowRight className="w-3 h-3 text-slate-500 dark:text-slate-400" />
          </button>
        )}
      </div>
    </div>
  );
};
