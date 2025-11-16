import React, { useEffect, useState } from "react";
import "./App.css";

const API_BASE = process.env.REACT_APP_API_BASE || "/api";

function App() {
  const [patients, setPatients] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [mode, setMode] = useState("guideline"); // "demo" or "guideline"
  
  // Collapsible section states
  const [riskExpanded, setRiskExpanded] = useState(true);
  const [labsExpanded, setLabsExpanded] = useState(false);
  const [vitalsExpanded, setVitalsExpanded] = useState(false);
  const [diagnosisExpanded, setDiagnosisExpanded] = useState(true);
  const [imagingExpanded, setImagingExpanded] = useState(true);
  const [assessmentsExpanded, setAssessmentsExpanded] = useState(true);

  // Load list of patients once
  useEffect(() => {
    fetch(`${API_BASE}/patients`)
      .then((res) => res.json())
      .then((response) => {
        // Backend now returns { status, results, data }
        setPatients(response.data || response);
      })
      .catch(console.error);
  }, []);

  // Load details + risks when patient or mode changes
  useEffect(() => {
    if (!selectedId) return;
    setLoadingPatient(true);
    fetch(`${API_BASE}/patients/${selectedId}?mode=${mode}`)
      .then((res) => res.json())
      .then((response) => {
        // Backend now returns { status, data: { mode, patient, risks, diagnoses } }
        setSelectedData(response.data || response);
        setLoadingPatient(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingPatient(false);
      });
  }, [selectedId, mode]);

  const currentModeLabel =
    mode === "guideline"
      ? "Guideline-based (NICE/NHSE – simplified, prototype only)"
      : "Demo rules (heuristic, not guideline-based)";

  return (
    <div className="sc-app">
      {/* HEADER */}
      <header className="sc-header">
        <div className="sc-header-left">
          <div className="sc-brand-name">System C</div>
          <div className="sc-header-divider"></div>
          <div>
            <div className="sc-title">AI Results Risk Prototype</div>
            <div className="sc-subtitle">
              Patient results risk view – not for clinical use
            </div>
          </div>
        </div>
        <div className="sc-header-right">
          <span className="sc-env-pill">LOCAL DEMO</span>
        </div>
      </header>

      {/* WARNING BANNER */}
      <div className="sc-banner">
        This is a prototype for demonstration only. It does not replace clinical
        judgement or represent a validated decision support tool.
      </div>

      <div className="sc-layout">
        {/* LEFT SIDEBAR */}
        <aside className="sc-sidebar">
          <div className="sc-sidebar-header">
            <h2>Patients</h2>
          </div>
          <div className="sc-patient-list">
            {patients.map((p) => (
              <button
                key={p.id}
                className={
                  "sc-patient-item" +
                  (selectedId === p.id ? " sc-patient-item--active" : "")
                }
                onClick={() => setSelectedId(p.id)}
              >
                <div className="sc-patient-name">{p.name}</div>
                <div className="sc-patient-meta">
                  Age {p.age} · {p.sex}
                </div>
                <div className="sc-patient-complaint">
                  {p.presentingComplaint}
                </div>
              </button>
            ))}
            {patients.length === 0 && (
              <div className="sc-empty">No patients found in demo data.</div>
            )}
          </div>
        </aside>

        {/* MAIN AREA */}
        <main className="sc-main">
          {/* Mode toggle row */}
          <div className="sc-toolbar">
            <div className="sc-toolbar-left">
              <span className="sc-toolbar-label">RISK ENGINE MODE</span>
              <div className="sc-toggle-group">
                <button
                  className={
                    "sc-toggle-btn" +
                    (mode === "demo" ? " sc-toggle-btn--active" : "")
                  }
                  onClick={() => setMode("demo")}
                >
                  Demo rules
                </button>
                <button
                  className={
                    "sc-toggle-btn" +
                    (mode === "guideline" ? " sc-toggle-btn--active" : "")
                  }
                  onClick={() => setMode("guideline")}
                >
                  Guideline-based
                </button>
              </div>
              <span className="sc-toolbar-help">{currentModeLabel}</span>
            </div>
          </div>

          {/* Placeholders */}
          {!selectedId && (
            <div className="sc-placeholder-card">
              Select a patient from the left to view results and risk.
            </div>
          )}

          {loadingPatient && (
            <div className="sc-placeholder-card">Loading patient details…</div>
          )}

          {/* Patient + risk view */}
          {selectedData && !loadingPatient && (
            <>
              {/* Compact EPR-style patient banner */}
              <section className="sc-patient-banner">
                <div className="sc-patient-banner-main">
                  <div className="sc-patient-info">
                    <h2 className="sc-patient-banner-name">{selectedData.patient.name}</h2>
                    <div className="sc-patient-demographics">
                      <span className="sc-demo-item">
                        <span className="sc-demo-label">DoB:</span> 15/03/1967 (Age {selectedData.patient.age})
                      </span>
                      <span className="sc-demo-separator">•</span>
                      <span className="sc-demo-item">
                        <span className="sc-demo-label">MRN:</span> 123456789
                      </span>
                      <span className="sc-demo-separator">•</span>
                      <span className="sc-demo-item">
                        <span className="sc-demo-label">Sex:</span> {selectedData.patient.sex}
                      </span>
                      <span className="sc-demo-separator">•</span>
                      <span className="sc-demo-item">
                        <span className="sc-demo-label">NHS No:</span> 485 777 3456
                      </span>
                    </div>
                  </div>
                  <div className="sc-patient-alerts">
                    {selectedData.patient.allergies && selectedData.patient.allergies.length > 0 && selectedData.patient.allergies[0] !== "No known drug allergies" && (
                      <div className="sc-alert-badge sc-alert-allergy">
                        ⚠️ {selectedData.patient.allergies.length} Allerg{selectedData.patient.allergies.length > 1 ? 'ies' : 'y'}
                      </div>
                    )}
                    {selectedData.patient.alerts && selectedData.patient.alerts.slice(0, 2).map((alert, idx) => (
                      <div key={idx} className="sc-alert-badge sc-alert-risk">
                        {alert}
                      </div>
                    ))}
                  </div>
                  <div className="sc-overall-risk-compact">
                    <span className="sc-overall-label">Overall risk</span>
                    <RiskBadge level={selectedData.risks.overall.level} />
                    <span className="sc-overall-score">
                      {selectedData.risks.overall.score.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="sc-patient-banner-sub">
                  <span className="sc-presenting-complaint">
                    <strong>Presenting complaint:</strong> {selectedData.patient.presentingComplaint}
                  </span>
                </div>
              </section>

              {/* Condition-specific risk */}
              <section className="sc-card sc-card--risk-row">
                <div 
                  className="sc-section-header-collapsible"
                  onClick={() => setRiskExpanded(!riskExpanded)}
                >
                  <h3 className="sc-section-title">Condition-specific risk (12 assessments)</h3>
                  <span className="sc-collapse-icon">{riskExpanded ? '▼' : '▶'}</span>
                </div>
                {riskExpanded && (
                  <div className="sc-risk-grid">
                    <RiskCard title="AKI" risk={selectedData.risks.aki} />
                    <RiskCard title="Sepsis" risk={selectedData.risks.sepsis} />
                    <RiskCard title="VTE (DVT/PE)" risk={selectedData.risks.vte} />
                    <RiskCard title="Delirium" risk={selectedData.risks.delirium} />
                    <RiskCard title="Falls" risk={selectedData.risks.falls} />
                    <RiskCard title="Pressure Ulcer" risk={selectedData.risks.pressureUlcer} />
                    <RiskCard title="Respiratory Failure" risk={selectedData.risks.respiratoryFailure} />
                    <RiskCard title="Cardiac Arrest" risk={selectedData.risks.cardiacArrest} />
                    <RiskCard title="Electrolyte Disturbance" risk={selectedData.risks.electrolyte} />
                    <RiskCard title="Medication Harm" risk={selectedData.risks.medicationHarm} />
                    <RiskCard title="Malnutrition" risk={selectedData.risks.malnutrition} />
                    <RiskCard title="Bleeding Risk" risk={selectedData.risks.bleeding} />
                  </div>
                )}
              </section>

              {/* Diagnosis Panel - only show if diagnoses exist */}
              {selectedData.diagnoses && selectedData.diagnoses.length > 0 && (
                <section className="sc-card sc-card--diagnosis">
                  <div 
                    className="sc-section-header-collapsible"
                    onClick={() => setDiagnosisExpanded(!diagnosisExpanded)}
                  >
                    <h3 className="sc-section-title">NICE/NHSE Diagnosis Scoring</h3>
                    <div className="sc-collapse-controls">
                      {!diagnosisExpanded && hasHighRiskDiagnosis(selectedData.diagnoses) && (
                        <span className="sc-abnormal-indicator" title="High-risk diagnosis present">⚠️</span>
                      )}
                      <span className="sc-collapse-icon">{diagnosisExpanded ? '▼' : '▶'}</span>
                    </div>
                  </div>
                  {diagnosisExpanded && <DiagnosisPanel diagnoses={selectedData.diagnoses} />}
                </section>
              )}

              {/* Imaging Results */}
              {selectedData.patient.imaging && selectedData.patient.imaging.length > 0 && (
                <section className="sc-card">
                  <div 
                    className="sc-section-header-collapsible"
                    onClick={() => setImagingExpanded(!imagingExpanded)}
                  >
                    <h3 className="sc-section-title">Imaging & Investigations ({selectedData.patient.imaging.length})</h3>
                    <span className="sc-collapse-icon">{imagingExpanded ? '▼' : '▶'}</span>
                  </div>
                  {imagingExpanded && <ImagingPanel imaging={selectedData.patient.imaging} />}
                </section>
              )}

              {/* Clinical Assessments */}
              {selectedData.patient.clinicalAssessments && selectedData.patient.clinicalAssessments.length > 0 && (
                <section className="sc-card">
                  <div 
                    className="sc-section-header-collapsible"
                    onClick={() => setAssessmentsExpanded(!assessmentsExpanded)}
                  >
                    <h3 className="sc-section-title">Clinical Assessments & Documentation ({selectedData.patient.clinicalAssessments.length})</h3>
                    <span className="sc-collapse-icon">{assessmentsExpanded ? '▼' : '▶'}</span>
                  </div>
                  {assessmentsExpanded && <AssessmentsPanel assessments={selectedData.patient.clinicalAssessments} />}
                </section>
              )}

              {/* Laboratory Results */}
              <section className="sc-card">
                <div 
                  className="sc-section-header-collapsible"
                  onClick={() => setLabsExpanded(!labsExpanded)}
                >
                  <h3 className="sc-section-title">Laboratory Results</h3>
                  <div className="sc-collapse-controls">
                    {!labsExpanded && hasAbnormalLabs(selectedData.patient.labs) && (
                      <span className="sc-abnormal-indicator" title="Abnormal results present">⚠️</span>
                    )}
                    <span className="sc-collapse-icon">{labsExpanded ? '▼' : '▶'}</span>
                  </div>
                </div>
                {labsExpanded && <LabsPanel labs={selectedData.patient.labs} />}
              </section>

              {/* Vitals / NEWS2 */}
              <section className="sc-card">
                <div 
                  className="sc-section-header-collapsible"
                  onClick={() => setVitalsExpanded(!vitalsExpanded)}
                >
                  <h3 className="sc-section-title">Vitals & Early Warning Score (NEWS2)</h3>
                  <div className="sc-collapse-controls">
                    {!vitalsExpanded && hasAbnormalVitals(selectedData.patient.vitals) && (
                      <span className="sc-abnormal-indicator" title="Abnormal results present">⚠️</span>
                    )}
                    <span className="sc-collapse-icon">{vitalsExpanded ? '▼' : '▶'}</span>
                  </div>
                </div>
                {vitalsExpanded && <VitalsPanel vitals={selectedData.patient.vitals} />}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

/* Small utility components */

function RiskBadge({ level }) {
  return (
    <span className={`sc-risk-badge sc-risk-badge--${level}`}>
      {level.toUpperCase()}
    </span>
  );
}

// Imaging Panel Component
function ImagingPanel({ imaging }) {
  if (!imaging || imaging.length === 0) {
    return <div className="sc-empty-metrics">No imaging results available.</div>;
  }

  return (
    <div className="sc-imaging-container">
      {imaging.map((img, idx) => (
        <div key={idx} className="sc-imaging-card">
          <div className="sc-imaging-header">
            <span className="sc-imaging-type">{img.type}</span>
            <span className="sc-imaging-date">
              {new Date(img.date).toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          <div className="sc-imaging-findings">{img.findings}</div>
          <div className="sc-imaging-footer">
            <span className="sc-imaging-reporter">Reporter: {img.reporter}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Clinical Assessments Panel Component
function AssessmentsPanel({ assessments }) {
  if (!assessments || assessments.length === 0) {
    return <div className="sc-empty-metrics">No clinical assessments available.</div>;
  }

  return (
    <div className="sc-assessments-container">
      {assessments.map((assessment, idx) => (
        <div key={idx} className="sc-assessment-card">
          <div className="sc-assessment-header">
            <span className="sc-assessment-type">{assessment.type}</span>
            {assessment.score !== undefined && (
              <span className="sc-assessment-score-badge">
                Score: {assessment.score}
              </span>
            )}
            {assessment.result && !assessment.score && (
              <span className="sc-assessment-result-badge">
                {assessment.result}
              </span>
            )}
          </div>
          <div className="sc-assessment-meta">
            <span className="sc-assessment-date">
              {new Date(assessment.date).toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            <span className="sc-assessment-assessor"> by {assessment.assessor}</span>
          </div>
          {assessment.notes && (
            <div className="sc-assessment-notes">{assessment.notes}</div>
          )}
        </div>
      ))}
    </div>
  );
}

function RiskCard({ title, risk }) {
  if (!risk) return null;

  let headline = `${title} risk: ${risk.level.toUpperCase()}`;
  if (
    title === "AKI" &&
    risk.mode === "guideline" &&
    typeof risk.stage === "number"
  ) {
    headline =
      risk.stage > 0
        ? `AKI Stage ${risk.stage} – ${risk.level.toUpperCase()} risk`
        : `No AKI detected – ${risk.level.toUpperCase()} risk`;
  }

  return (
    <div className={`sc-risk-card sc-risk-card--${risk.level}`}>
      <div className="sc-risk-card-header">
        <h4 className="sc-risk-title">{headline}</h4>
        <div className="sc-risk-score">
          <span className="sc-risk-score-label">Score</span>
          <span className="sc-risk-score-value">
            {risk.score.toFixed(2)}
          </span>
        </div>
      </div>
      {risk.guideline && (
        <p className="sc-risk-guideline">
          <strong>Source:</strong> {risk.guideline}
        </p>
      )}
      <ul className="sc-risk-factors">
        {risk.factors.map((f, idx) => (
          <li key={idx}>{f}</li>
        ))}
      </ul>
    </div>
  );
}

// --- simple reference ranges for demo only (NOT for clinical use) ---
const LAB_RANGES = {
  currentCreatinine: { low: 40, high: 110, text: "40–110 µmol/L" },
  baselineCreatinine: { low: 40, high: 110, text: "40–110 µmol/L" },
  currentEgfr: { low: 60, high: 999, text: "≥60 ml/min/1.73m²" },
  baselineEgfr: { low: 60, high: 999, text: "≥60 ml/min/1.73m²" },
  wbc: { low: 4, high: 11, text: "4–11 ×10⁹/L" },
  crp: { low: 0, high: 5, text: "<5 mg/L" },
  potassium: { low: 3.5, high: 5.3, text: "3.5–5.3 mmol/L" },
  hb: { low: 120, high: 160, text: "120–160 g/L" },
};

const VITAL_RANGES = {
  news2: { low: 0, high: 4, text: "0–4 (low risk)" },         // ≥5 flagged
  temp: { low: 36.0, high: 37.9, text: "36.0–37.9 °C" },
  rr: { low: 12, high: 20, text: "12–20 breaths/min" },
  hr: { low: 50, high: 100, text: "50–100 bpm" },
  systolicBp: { low: 100, high: 160, text: "100–160 mmHg" },
  diastolicBp: { low: 60, high: 100, text: "60–100 mmHg" },
  spo2: { low: 94, high: 100, text: "≥94%" },
};

// helper to work out if a value is low / normal / high
function classifyValue(value, range) {
  if (value === null || value === undefined || !range) {
    return { status: "normal" };
  }

  // NEWS2 is a bit special – treat ≥5 as high
  if (range.special === "news2") {
    if (value >= 5) return { status: "high" };
    return { status: "normal" };
  }

  if (value < range.low) return { status: "low" };
  if (value > range.high) return { status: "high" };
  return { status: "normal" };
}

// Helper function to check if labs have any abnormal values
function hasAbnormalLabs(labs) {
  if (!labs) return false;
  
  const fields = [
    "currentCreatinine", "baselineCreatinine", "currentEgfr", 
    "baselineEgfr", "wbc", "crp", "potassium", "hb"
  ];
  
  return fields.some((key) => {
    const value = labs[key];
    if (value === null || value === undefined) return false;
    const range = LAB_RANGES[key];
    if (!range) return false;
    const { status } = classifyValue(value, range);
    return status === "low" || status === "high";
  });
}

// Helper function to check if vitals have any abnormal values
function hasAbnormalVitals(vitals) {
  if (!vitals) return false;
  
  const fields = ["news2", "temp", "rr", "hr", "systolicBp", "diastolicBp", "spo2"];
  
  return fields.some((key) => {
    const value = vitals[key];
    if (value === null || value === undefined) return false;
    const range = {
      ...VITAL_RANGES[key],
      ...(key === "news2" ? { special: "news2" } : {}),
    };
    if (!range) return false;
    const { status } = classifyValue(value, range);
    return status === "low" || status === "high";
  });
}

// Helper function to check if any diagnosis is high risk
function hasHighRiskDiagnosis(diagnoses) {
  if (!diagnoses || diagnoses.length === 0) return false;
  return diagnoses.some(d => d.level === "high");
}

function LabsPanel({ labs }) {
  if (!labs) return <div className="sc-empty-metrics">No lab results available.</div>;

  const fields = [
    { key: "currentCreatinine", label: "Creatinine (current)" },
    { key: "baselineCreatinine", label: "Creatinine (baseline)" },
    { key: "currentEgfr", label: "eGFR (current)" },
    { key: "baselineEgfr", label: "eGFR (baseline)" },
    { key: "wbc", label: "WCC" },
    { key: "crp", label: "CRP" },
    { key: "potassium", label: "Potassium" },
    { key: "hb", label: "Hb" },
  ];

  const present = fields.filter(
    (f) => labs[f.key] !== undefined && labs[f.key] !== null
  );

  if (present.length === 0) {
    return <div className="sc-empty-metrics">No structured lab values to display.</div>;
  }

  return (
    <div className="sc-metric-grid">
      {present.map((f) => {
        const value = labs[f.key];
        const range = LAB_RANGES[f.key];
        const { status } = classifyValue(value, range);
        const abnormal = status === "low" || status === "high";
        const arrow = status === "high" ? "▲" : status === "low" ? "▼" : "";

        return (
          <div
            key={f.key}
            className={
              "sc-metric-card" + (abnormal ? " sc-metric-card--abnormal" : "")
            }
          >
            <div className="sc-metric-label">{f.label}</div>
            <div
              className={
                "sc-metric-value" +
                (abnormal ? " sc-metric-value--abnormal" : "")
              }
            >
              {value}
              {arrow && <span className="sc-metric-arrow">{arrow}</span>}
            </div>
            {range && (
              <div className="sc-metric-range">Ref: {range.text}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Calculate NEWS2 score for individual parameters
function calculateNEWS2Score(parameter, value) {
  if (value === null || value === undefined) return 0;
  
  switch (parameter) {
    case "rr":
      if (value <= 8) return 3;
      if (value <= 11) return 1;
      if (value <= 20) return 0;
      if (value <= 24) return 2;
      return 3;
    
    case "spo2":
      if (value <= 91) return 3;
      if (value <= 93) return 2;
      if (value <= 95) return 1;
      return 0;
    
    case "temp":
      if (value <= 35.0) return 3;
      if (value <= 36.0) return 1;
      if (value <= 38.0) return 0;
      if (value <= 39.0) return 1;
      return 2;
    
    case "systolicBp":
      if (value <= 90) return 3;
      if (value <= 100) return 2;
      if (value <= 110) return 1;
      if (value <= 219) return 0;
      return 3;
    
    case "hr":
      if (value <= 40) return 3;
      if (value <= 50) return 1;
      if (value <= 90) return 0;
      if (value <= 110) return 1;
      if (value <= 130) return 2;
      return 3;
    
    default:
      return 0;
  }
}

function VitalsPanel({ vitals }) {
  if (!vitals) return <div className="sc-empty-metrics">No vitals available.</div>;

  // Calculate individual scores
  const rrScore = calculateNEWS2Score("rr", vitals.rr);
  const spo2Score = calculateNEWS2Score("spo2", vitals.spo2);
  const tempScore = calculateNEWS2Score("temp", vitals.temp);
  const bpScore = calculateNEWS2Score("systolicBp", vitals.systolicBp);
  const hrScore = calculateNEWS2Score("hr", vitals.hr);
  
  const calculatedTotal = rrScore + spo2Score + tempScore + bpScore + hrScore;
  const displayedNEWS2 = vitals.news2 !== undefined && vitals.news2 !== null ? vitals.news2 : calculatedTotal;
  
  // Determine NEWS2 risk level
  let news2Level = "low";
  let news2Color = "#16a34a";
  if (displayedNEWS2 >= 7) {
    news2Level = "high";
    news2Color = "#dc2626";
  } else if (displayedNEWS2 >= 5) {
    news2Level = "medium";
    news2Color = "#f59e0b";
  } else if (displayedNEWS2 >= 3) {
    news2Level = "low-medium";
    news2Color = "#f59e0b";
  }

  const parameters = [
    { 
      label: "Respiratory Rate", 
      value: vitals.rr, 
      unit: "/min", 
      score: rrScore,
      key: "rr"
    },
    { 
      label: "SpO₂", 
      value: vitals.spo2, 
      unit: "%", 
      score: spo2Score,
      key: "spo2"
    },
    { 
      label: "Air or Oxygen?", 
      value: vitals.supplementalO2 ? "Oxygen" : "Air", 
      unit: "", 
      score: vitals.supplementalO2 ? 2 : 0,
      key: "o2"
    },
    { 
      label: "Temperature", 
      value: vitals.temp, 
      unit: "°C", 
      score: tempScore,
      key: "temp"
    },
    { 
      label: "Systolic BP", 
      value: vitals.systolicBp, 
      unit: "mmHg", 
      score: bpScore,
      key: "bp"
    },
    { 
      label: "Heart Rate", 
      value: vitals.hr, 
      unit: "/min", 
      score: hrScore,
      key: "hr"
    },
    { 
      label: "Consciousness", 
      value: vitals.avpu || "Alert", 
      unit: "", 
      score: vitals.avpu && vitals.avpu !== "Alert" ? 3 : 0,
      key: "avpu"
    },
  ];

  // Filter to only show parameters with values
  const presentParameters = parameters.filter(
    (p) => p.value !== undefined && p.value !== null
  );

  if (presentParameters.length === 0) {
    return (
      <div className="sc-empty-metrics">
        No vital signs to display.
      </div>
    );
  }

  return (
    <div className="sc-news2-container">
      <div className="sc-news2-header" style={{ borderLeftColor: news2Color }}>
        <div>
          <div className="sc-news2-total-label">NEWS2 Total Score</div>
          <div className="sc-news2-total-value" style={{ color: news2Color }}>
            {displayedNEWS2}
          </div>
        </div>
        <div className="sc-news2-risk-badge" style={{ 
          backgroundColor: news2Color + "20",
          borderColor: news2Color,
          color: news2Color
        }}>
          {displayedNEWS2 >= 7 ? "HIGH RISK" : 
           displayedNEWS2 >= 5 ? "MEDIUM RISK" : 
           displayedNEWS2 >= 3 ? "LOW-MEDIUM" : "LOW RISK"}
        </div>
      </div>
      
      <table className="sc-news2-table">
        <thead>
          <tr>
            <th>Parameter</th>
            <th>Value</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {presentParameters.map((param) => (
            <tr key={param.key} className={param.score > 0 ? "sc-news2-row-abnormal" : ""}>
              <td className="sc-news2-param">{param.label}</td>
              <td className="sc-news2-value">
                {param.value}{param.unit && ` ${param.unit}`}
              </td>
              <td className="sc-news2-score">
                <span className={`sc-news2-score-badge sc-news2-score-${param.score}`}>
                  {param.score}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DiagnosisPanel({ diagnoses }) {
  if (!diagnoses || diagnoses.length === 0) {
    return <div className="sc-empty-metrics">No diagnosis scoring available.</div>;
  }

  return (
    <div className="sc-diagnosis-grid">
      {diagnoses.map((diagnosis, idx) => (
        <div
          key={idx}
          className={`sc-diagnosis-card sc-diagnosis-card--${diagnosis.level}`}
        >
          <div className="sc-diagnosis-header">
            <h4 className="sc-diagnosis-title">{diagnosis.condition}</h4>
            <div className="sc-diagnosis-score-badge">
              <span className={`sc-risk-badge sc-risk-badge--${diagnosis.level}`}>
                {diagnosis.level.toUpperCase()}
              </span>
              <span className="sc-diagnosis-score-value">
                {diagnosis.score.toFixed(2)}
              </span>
            </div>
          </div>
          
          {diagnosis.guideline && (
            <div className="sc-diagnosis-guideline">
              <strong>Guideline:</strong> {diagnosis.guideline}
            </div>
          )}
          
          {(diagnosis.wellsScore || diagnosis.curb65Score) && (
            <div className="sc-diagnosis-score-detail">
              {diagnosis.wellsScore && <><strong>Wells Score:</strong> {diagnosis.wellsScore}</>}
              {diagnosis.curb65Score !== undefined && <><strong>CURB-65:</strong> {diagnosis.curb65Score}</>}
            </div>
          )}
          
          {diagnosis.confidence && (
            <div className="sc-diagnosis-confidence">
              <strong>Confidence:</strong> {diagnosis.confidence}
            </div>
          )}
          
          <ul className="sc-diagnosis-factors">
            {diagnosis.factors.map((factor, fIdx) => (
              <li key={fIdx}>{factor}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default App;