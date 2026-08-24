export type AgeCategory = 'PEDIATRIC' | 'ADULT' | 'GERIATRIC';

export interface AgeGroupRuleConfig {
  category: AgeCategory;
  label: string;
  ageRange: string;
  specialConsiderations: string[];
  normalHrRange: [number, number];
  normalRrRange: [number, number];
  normalSystolicBpRange: [number, number];
  riskWeightMultiplier: number;
}

export const AGE_GROUP_CONFIGS: Record<AgeCategory, AgeGroupRuleConfig> = {
  PEDIATRIC: {
    category: 'PEDIATRIC',
    label: 'Pediatric (<18y)',
    ageRange: '0 - 17 years',
    specialConsiderations: [
      'Rapid physiological decompensation risk',
      'Age-adjusted heart rate & respiratory rate norms',
      'Atypical infection presentation',
      'Caregiver input integration'
    ],
    normalHrRange: [70, 130],
    normalRrRange: [20, 30],
    normalSystolicBpRange: [90, 115],
    riskWeightMultiplier: 1.25,
  },
  ADULT: {
    category: 'ADULT',
    label: 'Adult (18-64y)',
    ageRange: '18 - 64 years',
    specialConsiderations: [
      'Standard adult physiological baselines',
      'Occupational/lifestyle exposure factors'
    ],
    normalHrRange: [60, 100],
    normalRrRange: [12, 20],
    normalSystolicBpRange: [100, 130],
    riskWeightMultiplier: 1.0,
  },
  GERIATRIC: {
    category: 'GERIATRIC',
    label: 'Geriatric (65y+)',
    ageRange: '65+ years',
    specialConsiderations: [
      'Blunted febrile & inflammatory response',
      'High prevalence of polypharmacy',
      'Atypical acute coronary / sepsis presentations',
      'Elevated fall risk & baseline frailty'
    ],
    normalHrRange: [55, 95],
    normalRrRange: [14, 22],
    normalSystolicBpRange: [110, 140],
    riskWeightMultiplier: 1.3,
  },
};
