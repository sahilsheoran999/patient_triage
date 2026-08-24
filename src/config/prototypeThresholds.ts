/**
 * PROTOTYPE REASSESSMENT & RED FLAG THRESHOLDS
 * 
 * Illustrative values for demonstration only — not clinical guidelines.
 */

export interface RedFlagThresholds {
  spo2Critical: number;            // %
  systolicBpCriticalLow: number;  // mmHg
  systolicBpCriticalHigh: number; // mmHg
  respiratoryRateCriticalHigh: number; // bpm
  heartRateCriticalHigh: number;  // bpm
}

export interface WaitThresholds {
  critical: number; // minutes (0 = Immediate)
  high: number;     // minutes (15)
  medium: number;   // minutes (30)
  low: number;      // minutes (60)
}

export const DEFAULT_RED_FLAG_THRESHOLDS: RedFlagThresholds = {
  spo2Critical: 88,
  systolicBpCriticalLow: 80,
  systolicBpCriticalHigh: 200,
  respiratoryRateCriticalHigh: 30,
  heartRateCriticalHigh: 140,
};

export const DEFAULT_WAIT_THRESHOLDS: WaitThresholds = {
  critical: 0,
  high: 15,
  medium: 30,
  low: 60,
};

export const PROTOTYPE_THRESHOLDS_DISCLAIMER =
  "Illustrative values for demonstration only — not clinical guidelines.";
