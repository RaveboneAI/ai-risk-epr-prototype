/**
 * Main Application Component (Refactored)
 * AI Results Risk Prototype
 * 
 * This is the modernized version using:
 * - Custom hooks for data fetching
 * - Context API for state management
 * - Component-based architecture
 * - Error boundaries and loading states
 */

import React, { useState, useMemo } from 'react';
import './App.css';

// Context
import { AppProvider, useAppContext } from './contexts/AppContext';

// Hooks
import { usePatients } from './hooks/usePatients';
import { usePatientData } from './hooks/usePatientData';

// Layout Components
import Header from './components/layout/Header';
import Toolbar from './components/layout/Toolbar';

// Patient Components
import PatientList from './components/patient/PatientList';
import PatientBanner from './components/patient/PatientBanner';

// Common Components
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorMessage from './components/common/ErrorMessage';
import CollapsibleSection from './components/common/CollapsibleSection';

// Import existing components from old App.js (we'll keep these for now)
import { 
  RiskCard, 
  DiagnosisPanel, 
  LabsPanel, 
  VitalsPanel 
} from './components/clinical';

// Helper functions
const hasAbnormalLabs = (labs) => {
  if (!labs) return false;
  
  const LAB_RANGES = {
    currentCreatinine: { low: 40, high: 110 },
    baselineCreatinine: { low: 40, high: 110 },
    currentEgfr: { low: 60, high: 999 },
    baselineEgfr: { low: 60, high: 999 },
    wbc: { low: 4, high: 11 },
    crp: { low: 0, high: 5 },
    potassium: { low: 3.5, high: 5.3 },
    hb: { low: 120, high: 160 }
  };
  
  const fields = [
    "currentCreatinine", "baselineCreatinine", "currentEgfr", 
    "baselineEgfr", "wbc", "crp", "potassium", "hb"
  ];
  
  return fields.some((key) => {
    const value = labs[key];
    if (value === null || value === undefined) return false;
    const range = LAB_RANGES[key];
    if (!range) return false;
    return value < range.low || value > range.high;
  });
};

const hasAbnormalVitals = (vitals) => {
  if (!vitals) return false;
  
  const VITAL_RANGES = {
    news2: { low: 0, high: 4, special: "news2" },
    temp: { low: 36.0, high: 37.9 },
    rr: { low: 12, high: 20 },
    hr: { low: 50, high: 100 },
    systolicBp: { low: 100, high: 160 },
    diastolicBp: { low: 60, high: 100 },
    spo2: { low: 94, high: 100 }
  };
  
  const fields = ["news2", "temp", "rr", "hr", "systolicBp", "diastolicBp", "spo2"];
  
  return fields.some((key) => {
    const value = vitals[key];
    if (value === null || value === undefined) return false;
    const range = VITAL_RANGES[key];
    if (!range) return false;
    
    // NEWS2 special handling
    if (range.special === "news2") {
      return value >= 5;
    }
    
    return value < range.low || value > range.high;
  });
};

const hasHighRiskDiagnosis = (diagnoses) => {
  if (!diagnoses || diagnoses.length === 0) return false;
  return diagnoses.some(d => d.level === "high");
};

// Main App Content Component
const AppContent = () => {
  const { state, dispatch } = useAppContext();
  const { patients: allPatients, loading: patientsLoading, error: patientsError } = usePatients();
  const { data: patientData, loading: patientLoading, error: patientError } = usePatientData(
    state.selectedPatientId, 
    state.mode
  );

  const [searchTerm, setSearchTerm] = useState('');

  // Filter patients based on search
  const filteredPatients = useMemo(() => {
    if (!allPatients) return [];
    
    if (!searchTerm) return allPatients;
    
    const lowerSearch = searchTerm.toLowerCase();
    return allPatients.filter(p =>
      p.name.toLowerCase().includes(lowerSearch) ||
      p.presentingComplaint.toLowerCase().includes(lowerSearch)
    );
  }, [allPatients, searchTerm]);

  const handlePatientSelect = (patientId) => {
    dispatch({ type: 'SELECT_PATIENT', payload: patientId });
  };

  const handleModeChange = (newMode) => {
    dispatch({ type: 'SET_MODE', payload: newMode });
  };

  const handleSearchChange = (term) => {
    setSearchTerm(term);
  };

  const toggleSection = (section) => {
    dispatch({ type: 'TOGGLE_SECTION', payload: section });
  };

  return (
    <div className="sc-app">
      <Header />

      <div className="sc-layout">
        {/* Sidebar with Patient List */}
        {patientsLoading ? (
          <aside className="sc-sidebar">
            <LoadingSpinner message="Loading patients..." />
          </aside>
        ) : patientsError ? (
          <aside className="sc-sidebar">
            <ErrorMessage message={patientsError} />
          </aside>
        ) : (
          <PatientList
            patients={filteredPatients}
            selectedId={state.selectedPatientId}
            onSelectPatient={handlePatientSelect}
            onSearchChange={handleSearchChange}
          />
        )}

        {/* Main Content Area */}
        <main className="sc-main">
          <Toolbar mode={state.mode} onModeChange={handleModeChange} />

          {/* No patient selected */}
          {!state.selectedPatientId && (
            <div className="sc-placeholder-card">
              Select a patient from the left to view results and risk.
            </div>
          )}

          {/* Loading patient data */}
          {state.selectedPatientId && patientLoading && (
            <LoadingSpinner message="Loading patient data..." />
          )}

          {/* Error loading patient */}
          {state.selectedPatientId && patientError && (
            <ErrorMessage 
              message={patientError}
              onRetry={() => handlePatientSelect(state.selectedPatientId)}
            />
          )}

          {/* Patient data loaded */}
          {state.selectedPatientId && patientData && !patientLoading && (
            <>
              {/* Patient Banner */}
              <PatientBanner 
                patient={patientData.patient} 
                risks={patientData.risks} 
              />

              {/* Condition-specific Risk */}
              <CollapsibleSection
                title="Condition-specific risk"
                isExpanded={state.expandedSections.risk}
                onToggle={() => toggleSection('risk')}
              >
                <div className="sc-risk-grid">
                  <RiskCard title="AKI" risk={patientData.risks.aki} />
                  <RiskCard title="Sepsis" risk={patientData.risks.sepsis} />
                </div>
              </CollapsibleSection>

              {/* Diagnosis Scoring */}
              {patientData.diagnoses && patientData.diagnoses.length > 0 && (
                <section className="sc-card sc-card--diagnosis">
                  <div 
                    className="sc-section-header-collapsible"
                    onClick={() => toggleSection('diagnosis')}
                  >
                    <h3 className="sc-section-title">NICE/NHSE Diagnosis Scoring</h3>
                    <div className="sc-collapse-controls">
                      {!state.expandedSections.diagnosis && hasHighRiskDiagnosis(patientData.diagnoses) && (
                        <span className="sc-abnormal-indicator" title="High-risk diagnosis present">⚠️</span>
                      )}
                      <span className="sc-collapse-icon">
                        {state.expandedSections.diagnosis ? '▼' : '▶'}
                      </span>
                    </div>
                  </div>
                  {state.expandedSections.diagnosis && (
                    <DiagnosisPanel diagnoses={patientData.diagnoses} />
                  )}
                </section>
              )}

              {/* Labs and Vitals */}
              <section className="sc-card sc-card--data">
                <div className="sc-data-columns">
                  {/* Laboratory Results */}
                  <div className="sc-data-column">
                    <div 
                      className="sc-section-header-collapsible"
                      onClick={() => toggleSection('labs')}
                    >
                      <h3 className="sc-section-title">Laboratory results</h3>
                      <div className="sc-collapse-controls">
                        {!state.expandedSections.labs && hasAbnormalLabs(patientData.patient.labs) && (
                          <span className="sc-abnormal-indicator" title="Abnormal results present">⚠️</span>
                        )}
                        <span className="sc-collapse-icon">
                          {state.expandedSections.labs ? '▼' : '▶'}
                        </span>
                      </div>
                    </div>
                    {state.expandedSections.labs && (
                      <LabsPanel labs={patientData.patient.labs} />
                    )}
                  </div>

                  {/* Vitals / NEWS2 */}
                  <div className="sc-data-column">
                    <div 
                      className="sc-section-header-collapsible"
                      onClick={() => toggleSection('vitals')}
                    >
                      <h3 className="sc-section-title">Vitals / NEWS2</h3>
                      <div className="sc-collapse-controls">
                        {!state.expandedSections.vitals && hasAbnormalVitals(patientData.patient.vitals) && (
                          <span className="sc-abnormal-indicator" title="Abnormal results present">⚠️</span>
                        )}
                        <span className="sc-collapse-icon">
                          {state.expandedSections.vitals ? '▼' : '▶'}
                        </span>
                      </div>
                    </div>
                    {state.expandedSections.vitals && (
                      <VitalsPanel vitals={patientData.patient.vitals} />
                    )}
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

// Main App with Providers
const AppRefactored = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
};

export default AppRefactored;

