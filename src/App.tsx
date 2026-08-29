import React, { useState, useEffect } from 'react';
import { Patient, AuditLogEntry, SurgeState, TriageLevelCode } from './types';
import { INITIAL_SYNTHETIC_PATIENTS } from './data/syntheticPatients';
import { evaluatePatientTriage } from './engine/triageEngine';
import { HOSPITAL_PROFILES, HospitalProfile } from './config/hospitalProfiles';

// Layout
import { TopBar } from './components/layout/TopBar';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';

// Views
import { CommandCenterView } from './components/views/CommandCenterView';
import { WaitingRoomRadarView } from './components/views/WaitingRoomRadarView';
import { PatientIntakeView } from './components/views/PatientIntakeView';
import { AuditLogView } from './components/views/AuditLogView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { HospitalConfigView } from './components/views/HospitalConfigView';
import { DataProtectionView } from './components/views/DataProtectionView';
import { SafetyPolicyView } from './components/views/SafetyPolicyView';
import { SurgeIntelligencePanel } from './components/views/SurgeModeComponents';

// Modals
import { PatientDetailModal } from './components/modals/PatientDetailModal';
import { ClinicianOverrideModal } from './components/modals/ClinicianOverrideModal';
import { ArchitectureModal } from './components/modals/ArchitectureModal';
import { DemoScenariosModal } from './components/modals/DemoScenariosModal';

export const App: React.FC = () => {
  // 1. Primary State
  const [patients, setPatients] = useState<Patient[]>(() => {
    return INITIAL_SYNTHETIC_PATIENTS.map(p => {
      const res = evaluatePatientTriage(p);
      return res.updatedPatient;
    });
  });

  const [currentHospital, setCurrentHospital] = useState<HospitalProfile>(HOSPITAL_PROFILES.urban_trauma);
  const [activeTab, setActiveTab] = useState<ActiveTab>('command_center');
  
  // Surge State
  const [surgeState, setSurgeState] = useState<SurgeState>({
    isActive: false,
    multiplier: 3.0,
    baselineVolume: 124,
    surgeVolume: 372,
    queueGrowth: 184,
    criticalCasesCount: 11,
    highPriorityCount: 29,
    reassessmentBacklogCount: 17,
    longestWaitMinutes: 48,
    topSafetyConcernPatientIds: ['P-101', 'P-108', 'P-109', 'P-120', 'P-104']
  });

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'LOG-1001',
      timestamp: '10:15 AM',
      patientId: 'P-101',
      patientName: 'Aarav Sharma',
      user: 'System Safety Engine',
      eventType: 'AI_ASSESSMENT_GENERATED',
      details: 'Layer 1 Red Flag Triggered: Anaphylactic Shock with Severe Airway Compromise',
      previousState: 'UNTRIAGED',
      newState: 'CRITICAL',
      severity: 'critical'
    },
    {
      id: 'LOG-1002',
      timestamp: '10:04 AM',
      patientId: 'P-111',
      patientName: 'Deepak Verma',
      user: 'Dr. Neha Verma (MD)',
      eventType: 'CLINICIAN_OVERRIDE',
      details: 'Clinician overridden priority from MEDIUM to HIGH based on localized McBurney peritoneal signs',
      previousState: 'MEDIUM',
      newState: 'HIGH',
      reason: 'New clinical observation',
      severity: 'alert'
    },
    {
      id: 'LOG-1003',
      timestamp: '09:55 AM',
      patientId: 'P-105',
      patientName: 'Unidentified Male (P-105)',
      user: 'System Uncertainty Engine',
      eventType: 'AI_ASSESSMENT_GENERATED',
      details: 'Zero History record detected. Completeness 42%. Safety policy prevented downgrade (HIGH UNCERTAINTY)',
      previousState: 'MEDIUM',
      newState: 'HIGH',
      severity: 'warning'
    }
  ]);

  // Modal States
  const [selectedDetailPatient, setSelectedDetailPatient] = useState<Patient | null>(null);
  const [selectedOverridePatient, setSelectedOverridePatient] = useState<Patient | null>(null);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState<boolean>(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);

  // Reassessments & Deterioration Counts
  const reassessmentCount = patients.filter(p => p.monitoringState === 'REASSESS').length;
  const deteriorationCount = patients.filter(p => p.monitoringState === 'ESCALATE').length;
  const activeAlertsCount = reassessmentCount + deteriorationCount;

  // ----------------------------------------------------
  // HANDLERS
  // ----------------------------------------------------

  // Toggle Surge Mode
  const handleToggleSurge = () => {
    setSurgeState(prev => {
      const nextActive = !prev.isActive;
      const newLog: AuditLogEntry = {
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        patientId: 'SYSTEM',
        patientName: 'System Queue',
        user: 'Dr. Neha Verma (MD)',
        eventType: nextActive ? 'SURGE_MODE_ACTIVATED' : 'SURGE_MODE_DEACTIVATED',
        details: nextActive 
          ? 'SURGE MODE 3.0x ACTIVATED: Simulated 372 waiting patients & priority pinned queue'
          : 'SURGE MODE DEACTIVATED: Restored normal volume monitoring',
        previousState: nextActive ? 'NORMAL' : 'SURGE',
        newState: nextActive ? 'SURGE (3.0x)' : 'NORMAL',
        severity: nextActive ? 'alert' : 'info'
      };
      setAuditLogs(logs => [newLog, ...logs]);
      return { ...prev, isActive: nextActive };
    });
  };

  // Clinician Override Confirmation
  const handleConfirmOverride = (
    patientId: string, 
    newPriority: TriageLevelCode, 
    reasonCategory: string, 
    customNote: string
  ) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        const origPriority = p.priority;
        const updated: Patient = {
          ...p,
          priority: newPriority,
          overrideApplied: true,
          overrideInfo: {
            originalPriority: origPriority,
            newPriority,
            reasonCategory,
            customNote,
            clinicianId: 'Dr. Neha Verma (MD)',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        };

        // Create Audit Entry
        const auditEntry: AuditLogEntry = {
          id: `LOG-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          patientId: p.id,
          patientName: p.name,
          user: 'Dr. Neha Verma (MD)',
          eventType: 'CLINICIAN_OVERRIDE',
          details: `Override applied: ${origPriority} → ${newPriority}. Note: ${customNote || 'None'}`,
          previousState: origPriority,
          newState: newPriority,
          reason: reasonCategory,
          severity: 'alert'
        };
        setAuditLogs(logs => [auditEntry, ...logs]);

        return updated;
      }
      return p;
    }));
  };

  // Reassess Patient Action
  const handleReassessPatient = (patientId: string) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        const evalRes = evaluatePatientTriage(p, currentHospital.waitThresholds as any);
        const updated = {
          ...evalRes.updatedPatient,
          monitoringState: 'SAFE' as const,
          recentDeteriorationDetected: false,
          whyNowReason: undefined
        };

        const auditEntry: AuditLogEntry = {
          id: `LOG-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          patientId: p.id,
          patientName: p.name,
          user: 'Triage Nurse',
          eventType: 'CLINICIAN_REVIEWED',
          details: `Reassessment conducted. Safety status cleared to SAFE. Risk score: ${updated.riskScore}`,
          severity: 'info'
        };
        setAuditLogs(logs => [auditEntry, ...logs]);

        return updated;
      }
      return p;
    }));
  };

  // Simulate Deterioration (P-108)
  const handleSimulateDeterioration = (patientId: string = 'P-108') => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        const worsenedVitals = {
          ...p.currentVitals,
          spo2: 89,
          heartRate: 118,
          systolicBp: 168,
          respiratoryRate: 30,
          minutesAgo: 1
        };

        const vitalsHist = [...(p.vitalsHistory || [])];
        if (vitalsHist.length === 0) {
          vitalsHist.push(p.currentVitals);
        }

        const patientWithWorsenedVitals: Patient = {
          ...p,
          currentVitals: worsenedVitals,
          vitalsHistory: vitalsHist,
          lastVitalsUpdateMinutesAgo: 1,
          recentDeteriorationDetected: true,
          monitoringState: 'ESCALATE',
          whyNowReason: 'Deterioration detected by Radar: SpO₂ dropped from 96% to 89% (-7%) & HR spiked from 88 to 118 (+30 bpm)',
        };

        const evalRes = evaluatePatientTriage(patientWithWorsenedVitals);
        const finalPatient = evalRes.updatedPatient;

        // Add Audit Log
        const auditEntry: AuditLogEntry = {
          id: `LOG-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          patientId: p.id,
          patientName: p.name,
          user: 'Waiting-Room Radar™ Engine',
          eventType: 'DETERIORATION_DETECTED',
          details: 'Deterioration detected: SpO₂ 96% → 89% (↓7%), HR 88 → 118 (↑30). Reassessment alert fired.',
          previousState: p.priority,
          newState: finalPatient.priority,
          severity: 'critical'
        };
        setAuditLogs(logs => [auditEntry, ...logs]);

        return finalPatient;
      }
      return p;
    }));
  };

  // Simulate Wait Threshold Exceeded (P-110)
  const handleSimulateWaitThresholdExceeded = (patientId: string = 'P-110') => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        const patientWithLongWait: Patient = {
          ...p,
          elapsedWaitMinutes: 82,
          monitoringState: 'REASSESS',
          whyNowReason: 'Safe waiting threshold exceeded: Wait time (82m) > Configured Medium threshold (30m)'
        };

        const auditEntry: AuditLogEntry = {
          id: `LOG-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          patientId: p.id,
          patientName: p.name,
          user: 'Waiting-Room Radar™ Engine',
          eventType: 'REASSESSMENT_TRIGGERED',
          details: 'Wait time (82m) exceeded Medium priority threshold (30m). Safety reassessment triggered.',
          severity: 'warning'
        };
        setAuditLogs(logs => [auditEntry, ...logs]);

        return patientWithLongWait;
      }
      return p;
    }));
  };

  // Add New Patient from Intake
  const handleAddPatient = (newPatient: Patient) => {
    const evalRes = evaluatePatientTriage(newPatient);
    const triaged = evalRes.updatedPatient;
    
    setPatients(prev => [triaged, ...prev]);

    const auditEntry: AuditLogEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: triaged.arrivalTime,
      patientId: triaged.id,
      patientName: triaged.name,
      user: 'Triage Intake Nurse',
      eventType: 'PATIENT_REGISTERED',
      details: `New intake registered: ${triaged.chiefComplaint}. Initial Triage: ${triaged.priority}`,
      newState: triaged.priority,
      severity: 'info'
    };
    setAuditLogs(logs => [auditEntry, ...logs]);

    setActiveTab('command_center');
  };

  // Select Demo Scenario
  const handleSelectScenario = (scenarioId: string) => {
    if (scenarioId === 'A') {
      const p = patients.find(x => x.id === 'P-101') || patients[0];
      setSelectedDetailPatient(p);
    } else if (scenarioId === 'B') {
      const p = patients.find(x => x.id === 'P-106') || patients[0];
      setSelectedDetailPatient(p);
    } else if (scenarioId === 'C') {
      const p = patients.find(x => x.id === 'P-103') || patients[0];
      setSelectedDetailPatient(p);
    } else if (scenarioId === 'D') {
      const p = patients.find(x => x.id === 'P-104') || patients[0];
      setSelectedDetailPatient(p);
    } else if (scenarioId === 'E') {
      const p = patients.find(x => x.id === 'P-105') || patients[0];
      setSelectedDetailPatient(p);
    } else if (scenarioId === 'F') {
      handleSimulateDeterioration('P-108');
      setActiveTab('radar');
    } else if (scenarioId === 'G') {
      handleSimulateWaitThresholdExceeded('P-110');
      setActiveTab('radar');
    } else if (scenarioId === 'H') {
      const p = patients.find(x => x.id === 'P-111') || patients[0];
      setSelectedOverridePatient(p);
    } else if (scenarioId === 'I') {
      setSurgeState(prev => ({ ...prev, isActive: true }));
      setActiveTab('command_center');
    } else if (scenarioId === 'J') {
      const p = patients.find(x => x.id === 'P-127') || patients[0];
      setSelectedDetailPatient(p);
      setActiveTab('command_center');
    } else if (scenarioId === 'K') {
      const p = patients.find(x => x.id === 'P-146') || patients[0];
      setSelectedDetailPatient(p);
      setActiveTab('command_center');
    }
  };

  // Hero "RUN SIGNATURE DEMO" Automated Sequence
  const handleRunSignatureDemo = () => {
    // Step 1: Open Ambiguous Case
    const amb = patients.find(p => p.id === 'P-106') || patients[0];
    setSelectedDetailPatient(amb);
    setActiveTab('command_center');

    // Step 2: Trigger deterioration on P-108
    setTimeout(() => {
      handleSimulateDeterioration('P-108');
      setActiveTab('radar');
    }, 2500);

    // Step 3: Switch to Audit Log
    setTimeout(() => {
      setActiveTab('audit');
    }, 5000);
  };

  // Reset Demo to Initial Baseline
  const handleResetDemo = () => {
    setPatients(INITIAL_SYNTHETIC_PATIENTS.map(p => evaluatePatientTriage(p).updatedPatient));
    setSurgeState(prev => ({ ...prev, isActive: false }));
    setActiveTab('command_center');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      
      {/* Persistent Top Navigation Bar */}
      <TopBar
        surgeState={surgeState}
        onToggleSurge={handleToggleSurge}
        activePatientCount={patients.length}
        activeAlertsCount={activeAlertsCount}
        onOpenDemoScenarios={() => setIsDemoModalOpen(true)}
        onRunSignatureDemo={handleRunSignatureDemo}
        onOpenArchitectureModal={() => setIsArchitectureModalOpen(true)}
        currentHospitalName={currentHospital.name}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Clinical Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            if (tab === 'architecture') {
              setIsArchitectureModalOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          reassessmentCount={reassessmentCount}
          deteriorationCount={deteriorationCount}
        />

        {/* Primary Content View Area */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          
          {/* Surge Intelligence Panel when Surge Mode Active */}
          {surgeState.isActive && (
            <div className="p-4 sm:p-6 pb-0">
              <SurgeIntelligencePanel
                surgeState={surgeState}
                patients={patients}
                onSelectPatient={(pt) => setSelectedDetailPatient(pt)}
              />
            </div>
          )}

          {/* View Tab Switcher */}
          {activeTab === 'command_center' && (
            <CommandCenterView
              patients={patients}
              surgeState={surgeState}
              onSelectPatient={(pt) => setSelectedDetailPatient(pt)}
              onOpenOverrideModal={(pt) => setSelectedOverridePatient(pt)}
              onOpenIntake={() => setActiveTab('intake')}
            />
          )}

          {activeTab === 'radar' && (
            <WaitingRoomRadarView
              patients={patients}
              onSelectPatient={(pt) => setSelectedDetailPatient(pt)}
              onSimulateDeterioration={handleSimulateDeterioration}
              onSimulateWaitThresholdExceeded={handleSimulateWaitThresholdExceeded}
              onReassessPatient={handleReassessPatient}
            />
          )}

          {activeTab === 'intake' && (
            <PatientIntakeView onAddPatient={handleAddPatient} />
          )}

          {activeTab === 'detail' && (
            <div className="p-6">
              {selectedDetailPatient ? (
                <PatientDetailModal
                  patient={selectedDetailPatient}
                  onClose={() => setSelectedDetailPatient(null)}
                  onOpenOverrideModal={(pt) => setSelectedOverridePatient(pt)}
                  onReassessPatient={handleReassessPatient}
                />
              ) : (
                <div className="text-center py-16 space-y-3 font-mono">
                  <p className="text-slate-400 text-sm">No patient selected for detail view.</p>
                  <button
                    onClick={() => setSelectedDetailPatient(patients[0])}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded"
                  >
                    View Sample Patient (P-101)
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'audit' && (
            <AuditLogView auditLogs={auditLogs} />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView />
          )}

          {activeTab === 'config' && (
            <HospitalConfigView
              currentProfile={currentHospital}
              onSelectProfile={(id) => setCurrentHospital(HOSPITAL_PROFILES[id] || HOSPITAL_PROFILES.urban_trauma)}
            />
          )}

          {activeTab === 'data_protection' && (
            <DataProtectionView />
          )}

          {activeTab === 'safety_policy' && (
            <SafetyPolicyView />
          )}

        </main>
      </div>

      {/* Global Modals */}
      {selectedDetailPatient && activeTab !== 'detail' && (
        <PatientDetailModal
          patient={selectedDetailPatient}
          onClose={() => setSelectedDetailPatient(null)}
          onOpenOverrideModal={(pt) => setSelectedOverridePatient(pt)}
          onReassessPatient={handleReassessPatient}
        />
      )}

      {selectedOverridePatient && (
        <ClinicianOverrideModal
          patient={selectedOverridePatient}
          onClose={() => setSelectedOverridePatient(null)}
          onConfirmOverride={handleConfirmOverride}
        />
      )}

      <ArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />

      <DemoScenariosModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onSelectScenario={handleSelectScenario}
        onRunSignatureDemo={handleRunSignatureDemo}
        onResetDemo={handleResetDemo}
      />

    </div>
  );
};

export default App;
