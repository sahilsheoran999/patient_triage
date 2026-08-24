import { WaitThresholds, DEFAULT_WAIT_THRESHOLDS } from './prototypeThresholds';

export interface HospitalProfile {
  id: string;
  name: string;
  type: string;
  description: string;
  volumeLabel: string;
  specialties: string[];
  integrationMaturity: 'High' | 'Moderate' | 'Basic';
  staffingLevel: string;
  waitThresholds: WaitThresholds;
  alertPolicy: 'Strict' | 'Standard' | 'Surge Optimized';
}

export const HOSPITAL_PROFILES: Record<string, HospitalProfile> = {
  urban_trauma: {
    id: 'urban_trauma',
    name: 'Urban Trauma Center',
    type: 'Level 1 Trauma Facility',
    description: 'High volume / multi-specialty tertiary referral hospital with advanced EHR integration.',
    volumeLabel: 'High (350+ ED visits/day)',
    specialties: ['Trauma', 'Cardiology', 'Neurology', 'Pediatrics', 'Burn Unit'],
    integrationMaturity: 'High',
    staffingLevel: '24/7 Multi-attending team',
    waitThresholds: {
      critical: 0,
      high: 10,
      medium: 20,
      low: 45,
    },
    alertPolicy: 'Strict',
  },
  community_hospital: {
    id: 'community_hospital',
    name: 'Community Hospital',
    type: 'General ED Facility',
    description: 'Medium volume hospital with standard specialties and moderate digital integration.',
    volumeLabel: 'Medium (150-250 ED visits/day)',
    specialties: ['Internal Medicine', 'General Surgery', 'Pediatric Consult'],
    integrationMaturity: 'Moderate',
    staffingLevel: 'Shift-based attending & resident staff',
    waitThresholds: DEFAULT_WAIT_THRESHOLDS, // Critical: 0, High: 15, Med: 30, Low: 60
    alertPolicy: 'Standard',
  },
  rural_ed: {
    id: 'rural_ed',
    name: 'Rural Emergency Department',
    type: 'Critical Access Facility',
    description: 'Lower volume facility with limited specialist coverage on-site and tele-triage support.',
    volumeLabel: 'Low (<80 ED visits/day)',
    specialties: ['General Emergency', 'Tele-consult'],
    integrationMaturity: 'Basic',
    staffingLevel: 'Single physician & on-call specialist',
    waitThresholds: {
      critical: 0,
      high: 20,
      medium: 40,
      low: 90,
    },
    alertPolicy: 'Surge Optimized',
  },
};
