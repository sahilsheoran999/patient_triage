/**
 * PROTOTYPE RISK WEIGHTS
 * 
 * NOTE: These weights are illustrative prototype parameters.
 * They are not clinically validated and must not be used
 * for real-world clinical decision-making.
 */

export interface PrototypeRiskWeights {
  spo2Abnormality: number;
  respiratorySymptoms: number;
  observedDistress: number;
  ageFactor: number;
  history: number;
  heartRateAbnormality: number;
  bpAbnormality: number;
  respiratoryRateAbnormality: number;
}

export const PROTOTYPE_RISK_WEIGHTS: PrototypeRiskWeights = {
  spo2Abnormality: 32,
  respiratorySymptoms: 24,
  observedDistress: 12,
  ageFactor: 10,
  history: 4,
  heartRateAbnormality: 8,
  bpAbnormality: 6,
  respiratoryRateAbnormality: 4,
};

export const PROTOTYPE_WEIGHTS_DISCLAIMER = 
  "Illustrative scoring parameters used to demonstrate the prototype decision architecture.";
