import React from 'react';
import { AlertCircle, Clock, ArrowRight } from 'lucide-react';

interface WhyNowAlertProps {
  reason?: string;
  actionText?: string;
  onActionClick?: () => void;
  compact?: boolean;
}

export const WhyNowAlert: React.FC<WhyNowAlertProps> = ({
  reason = 'Waiting-Room Radar detected vital deterioration & wait threshold exceeded',
  actionText = 'REASSESS NOW',
  onActionClick,
  compact = false
}) => {
  return (
    <div className="bg-gradient-to-r from-rose-950/80 via-amber-950/70 to-slate-900 border-l-4 border-rose-500 border-y border-r border-slate-800 p-2.5 rounded-r-lg shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <div className="bg-rose-500/20 p-1.5 rounded text-rose-400 mt-0.5">
            <AlertCircle className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-rose-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                WHY NOW?
              </span>
              <span className="text-xs font-semibold text-rose-300">Safety Reassessment Triggered</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 font-medium leading-relaxed">
              {reason}
            </p>
          </div>
        </div>

        {onActionClick && (
          <button
            onClick={onActionClick}
            className="self-start sm:self-center px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded transition-all duration-150 flex items-center gap-1.5 shadow-md hover:shadow-rose-600/30 whitespace-nowrap"
          >
            <span>{actionText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
