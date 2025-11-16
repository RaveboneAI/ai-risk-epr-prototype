/**
 * Application Constants
 * Reference ranges and configuration values
 */

export const LAB_RANGES = {
  currentCreatinine: { low: 40, high: 110, text: "40–110 µmol/L" },
  baselineCreatinine: { low: 40, high: 110, text: "40–110 µmol/L" },
  currentEgfr: { low: 60, high: 999, text: "≥60 ml/min/1.73m²" },
  baselineEgfr: { low: 60, high: 999, text: "≥60 ml/min/1.73m²" },
  wbc: { low: 4, high: 11, text: "4–11 ×10⁹/L" },
  crp: { low: 0, high: 5, text: "<5 mg/L" },
  potassium: { low: 3.5, high: 5.3, text: "3.5–5.3 mmol/L" },
  hb: { low: 120, high: 160, text: "120–160 g/L" },
};

export const VITAL_RANGES = {
  news2: { low: 0, high: 4, text: "0–4 (low risk)" },
  temp: { low: 36.0, high: 37.9, text: "36.0–37.9 °C" },
  rr: { low: 12, high: 20, text: "12–20 breaths/min" },
  hr: { low: 50, high: 100, text: "50–100 bpm" },
  systolicBp: { low: 100, high: 160, text: "100–160 mmHg" },
  diastolicBp: { low: 60, high: 100, text: "60–100 mmHg" },
  spo2: { low: 94, high: 100, text: "≥94%" },
};

export const RISK_LEVELS = {
  LOW: 'low',
  MODERATE: 'moderate',
  HIGH: 'high'
};

export const MODES = {
  DEMO: 'demo',
  GUIDELINE: 'guideline'
};

