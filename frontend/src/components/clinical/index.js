/**
 * Clinical Components Export
 * Exports all clinical display components (extracted from original App.js)
 */

import React from 'react';

// Risk Badge Component
export const RiskBadge = ({ level }) => {
  return (
    <span className={`sc-risk-badge sc-risk-badge--${level}`}>
      {level.toUpperCase()}
    </span>
  );
};

// Risk Card Component
export const RiskCard = ({ title, risk }) => {
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
};

// Reference ranges for labs
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

// Helper to classify values
const classifyValue = (value, range) => {
  if (value === null || value === undefined || !range) {
    return { status: "normal" };
  }

  if (range.special === "news2") {
    if (value >= 5) return { status: "high" };
    return { status: "normal" };
  }

  if (value < range.low) return { status: "low" };
  if (value > range.high) return { status: "high" };
  return { status: "normal" };
};

// Labs Panel Component
export const LabsPanel = ({ labs }) => {
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
};

// NEWS2 calculation helper
const calculateNEWS2Score = (parameter, value) => {
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
};

// Vitals Panel with NEWS2 Table
export const VitalsPanel = ({ vitals }) => {
  if (!vitals) return <div className="sc-empty-metrics">No vitals available.</div>;

  const rrScore = calculateNEWS2Score("rr", vitals.rr);
  const spo2Score = calculateNEWS2Score("spo2", vitals.spo2);
  const tempScore = calculateNEWS2Score("temp", vitals.temp);
  const bpScore = calculateNEWS2Score("systolicBp", vitals.systolicBp);
  const hrScore = calculateNEWS2Score("hr", vitals.hr);
  
  const calculatedTotal = rrScore + spo2Score + tempScore + bpScore + hrScore;
  const displayedNEWS2 = vitals.news2 !== undefined && vitals.news2 !== null ? vitals.news2 : calculatedTotal;
  
  let news2Color = "#16a34a";
  if (displayedNEWS2 >= 7) {
    news2Color = "#dc2626";
  } else if (displayedNEWS2 >= 5) {
    news2Color = "#f59e0b";
  } else if (displayedNEWS2 >= 3) {
    news2Color = "#f59e0b";
  }

  const parameters = [
    { label: "Respiratory Rate", value: vitals.rr, unit: "/min", score: rrScore, key: "rr" },
    { label: "SpO₂", value: vitals.spo2, unit: "%", score: spo2Score, key: "spo2" },
    { label: "Air or Oxygen?", value: vitals.supplementalO2 ? "Oxygen" : "Air", unit: "", score: vitals.supplementalO2 ? 2 : 0, key: "o2" },
    { label: "Temperature", value: vitals.temp, unit: "°C", score: tempScore, key: "temp" },
    { label: "Systolic BP", value: vitals.systolicBp, unit: "mmHg", score: bpScore, key: "bp" },
    { label: "Heart Rate", value: vitals.hr, unit: "/min", score: hrScore, key: "hr" },
    { label: "Consciousness", value: vitals.avpu || "Alert", unit: "", score: vitals.avpu && vitals.avpu !== "Alert" ? 3 : 0, key: "avpu" },
  ];

  const presentParameters = parameters.filter(
    (p) => p.value !== undefined && p.value !== null
  );

  if (presentParameters.length === 0) {
    return <div className="sc-empty-metrics">No vital signs to display.</div>;
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
};

// Diagnosis Panel Component
export const DiagnosisPanel = ({ diagnoses }) => {
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
          
          {(diagnosis.wellsScore || diagnosis.curb65Score !== undefined) && (
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
};

