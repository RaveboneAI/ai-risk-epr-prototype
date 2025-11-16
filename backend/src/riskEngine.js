// Clamp score between 0 and 1
function clamp01(score) {
  return Math.max(0, Math.min(1, score));
}

// Map numerical score to band
function riskLevel(score) {
  if (score >= 0.7) return "high";
  if (score >= 0.4) return "moderate";
  return "low";
}

/* ================================
   DEMO RULES (simple, made-up)
   ================================ */

function calculateAkiDemo(patient) {
  const { labs, age, medications = [] } = patient;
  let score = 0;
  const factors = [];

  const baseline = labs.baselineEgfr;
  const current = labs.currentEgfr;
  const dropFraction = baseline ? (baseline - current) / baseline : 0;

  if (current < 60) {
    score += 0.4;
    factors.push("Current eGFR < 60 (demo rule)");
  }

  if (dropFraction > 0.25) {
    score += 0.3;
    factors.push("eGFR has fallen >25% from baseline (demo rule)");
  }

  const medsString = medications.join(" ").toLowerCase();
  if (medsString.includes("pril") || medsString.includes("diuretic")) {
    score += 0.2;
    factors.push("On ACE inhibitor/diuretic (demo rule)");
  }

  if (age >= 65) {
    score += 0.1;
    factors.push("Age ≥ 65 (demo rule)");
  }

  score = clamp01(score);

  return {
    mode: "demo",
    guideline: "Demo heuristic (not guideline-based)",
    score,
    level: riskLevel(score),
    factors
  };
}

function calculateSepsisDemo(patient) {
  const { labs, vitals, age, presentingComplaint = "" } = patient;
  let score = 0;
  const factors = [];

  if (labs.wbc > 12 || labs.wbc < 4) {
    score += 0.2;
    factors.push("Abnormal WBC (demo rule)");
  }

  if (labs.crp >= 100) {
    score += 0.2;
    factors.push("CRP ≥ 100 (demo rule)");
  }

  const news2 = vitals.news2 ?? vitals.ews ?? 0;

  if (news2 >= 3) {
    score += 0.2;
    factors.push("NEWS2/EWS ≥ 3 (demo rule)");
  }

  if (vitals.temp >= 38.3 || vitals.temp <= 36) {
    score += 0.1;
    factors.push("Abnormal temperature (demo rule)");
  }

  if (vitals.rr >= 22) {
    score += 0.1;
    factors.push("Respiratory rate ≥ 22 (demo rule)");
  }

  const pc = presentingComplaint.toLowerCase();
  if (pc.includes("infection") || pc.includes("pneumonia") || pc.includes("fever")) {
    score += 0.1;
    factors.push("Infective-type presenting complaint (demo rule)");
  }

  if (age >= 65) {
    score += 0.1;
    factors.push("Age ≥ 65 (demo rule)");
  }

  score = clamp01(score);

  return {
    mode: "demo",
    guideline: "Demo heuristic (not guideline-based)",
    score,
    level: riskLevel(score),
    factors
  };
}

/* ==========================================
   GUIDELINE-BASED (simplified NICE/NHSE)
   ========================================== */

/**
 * AKI detection (simplified KDIGO/NICE-style)
 * Based on:
 *  - rise in creatinine >= 26 µmol/L within 48h
 *  - OR creatinine >= 1.5x baseline within 7 days
 * We don't model urine output in this prototype.
 */
function calculateAkiGuideline(patient) {
  const { labs } = patient;
  const factors = [];
  let akiStage = 0;

  const baselineCr = labs?.baselineCreatinine;
  const currentCr = labs?.currentCreatinine;

  if (baselineCr && currentCr) {
    const absoluteRise = currentCr - baselineCr;
    const ratio = currentCr / baselineCr;

    if (absoluteRise >= 26 || ratio >= 1.5) {
      akiStage = 1;
      factors.push("Creatinine rise meets AKI criteria (≥26 µmol/L or ≥1.5× baseline)");

      if (ratio >= 2 && ratio < 3) {
        akiStage = 2;
        factors.push("Creatinine 2.0–2.9× baseline (AKI stage 2 range)");
      } else if (ratio >= 3 || currentCr >= 353) {
        akiStage = 3;
        factors.push("Creatinine ≥3× baseline or ≥353 µmol/L (AKI stage 3 range)");
      }
    } else {
      factors.push("Creatinine change does not meet AKI criteria");
    }
  } else {
    factors.push("Insufficient creatinine data to apply AKI criteria");
  }

  let score = 0;
  if (akiStage === 1) score = 0.5;
  if (akiStage === 2) score = 0.75;
  if (akiStage === 3) score = 0.95;

  score = clamp01(score);

  return {
    mode: "guideline",
    guideline: "NICE NG148 / NHSE AKI algorithm (simplified)",
    stage: akiStage, // this is what we’ll show in the UI
    score,
    level: riskLevel(score),
    factors
  };
}

/**
 * Sepsis risk based on NICE NG51 update using NEWS2 bands
 * Simplified:
 *  - If suspected infection AND NEWS2 >= 7 → high risk
 *  - If suspected infection AND NEWS2 5–6 → moderate risk
 *  - Otherwise low for this prototype
 */
function calculateSepsisGuideline(patient) {
  const { labs, vitals, presentingComplaint = "" } = patient;
  const factors = [];

  const news2 = vitals?.news2 ?? vitals?.ews ?? 0;

  const pc = presentingComplaint.toLowerCase();
  const infectionLike =
    pc.includes("infection") ||
    pc.includes("pneumonia") ||
    pc.includes("sepsis") ||
    pc.includes("cellulitis") ||
    pc.includes("uti") ||
    pc.includes("fever") ||
    pc.includes("flu");

  if (infectionLike) {
    factors.push("Presenting complaint suggests possible infection");
  } else {
    factors.push("Presenting complaint does not clearly suggest infection (prototype assumption)");
  }

  let score = 0;

  if (infectionLike && news2 >= 7) {
    score = 0.9;
    factors.push("NEWS2 ≥ 7 with suspected infection (high risk band)");
  } else if (infectionLike && news2 >= 5) {
    score = 0.6;
    factors.push("NEWS2 5–6 with suspected infection (moderate risk band)");
  } else if (infectionLike && news2 > 0) {
    score = 0.35;
    factors.push("Infection suspected but NEWS2 < 5 (lower NEWS2 band)");
  } else {
    score = 0.1;
    factors.push("No strong indicators of sepsis risk in this simplified model");
  }

  if (labs?.crp >= 100) {
    factors.push("CRP ≥ 100 (supports significant inflammatory process)");
    score += 0.05;
  }
  if (labs?.wbc > 12 || labs?.wbc < 4) {
    factors.push("Abnormal WBC (supports systemic response)");
    score += 0.05;
  }

  score = clamp01(score);

  return {
    mode: "guideline",
    guideline: "NICE NG51 sepsis risk stratification using NEWS2 (simplified)",
    score,
    level: riskLevel(score),
    factors
  };
}

/* ================================
   VTE RISK (Padua Score)
   ================================ */

function calculateVTERisk(patient) {
  const { pmh = [], age, mobility, examFindings = [] } = patient;
  let score = 0;
  const factors = [];

  // Padua Prediction Score for VTE
  if (pmh.includes('cancer')) {
    score += 3;
    factors.push('Active cancer (+3)');
  }

  if (pmh.includes('dvt') || pmh.includes('pe') || pmh.includes('thrombophilia')) {
    score += 3;
    factors.push('Previous VTE or thrombophilia (+3)');
  }

  if (mobility === 'reduced' || mobility === 'bedbound') {
    score += 3;
    factors.push('Reduced mobility (+3)');
  }

  if (pmh.includes('thrombophilia')) {
    score += 3;
    factors.push('Known thrombophilic condition (+3)');
  }

  if (examFindings.includes('recent trauma') || examFindings.includes('recent surgery')) {
    score += 2;
    factors.push('Recent trauma or surgery (+2)');
  }

  if (age >= 70) {
    score += 1;
    factors.push('Age ≥ 70 (+1)');
  }

  if (pmh.includes('heart failure') || pmh.includes('respiratory failure')) {
    score += 1;
    factors.push('Heart or respiratory failure (+1)');
  }

  if (pmh.includes('acute mi') || pmh.includes('stroke')) {
    score += 1;
    factors.push('Acute MI or stroke (+1)');
  }

  const normalizedScore = clamp01(score / 10);

  return {
    guideline: 'NICE NG89 - VTE Prevention (Padua Score)',
    score: normalizedScore,
    level: score >= 4 ? 'high' : score >= 2 ? 'moderate' : 'low',
    factors,
    paduaScore: score
  };
}

/* ================================
   DELIRIUM RISK
   ================================ */

function calculateDeliriumRisk(patient) {
  const { age, pmh = [], cognitive, vitals, medications = [] } = patient;
  let score = 0;
  const factors = [];

  // Based on 4AT score and DELPHI model
  if (age >= 80) {
    score += 0.3;
    factors.push('Age ≥ 80 years (high risk)');
  } else if (age >= 65) {
    score += 0.15;
    factors.push('Age ≥ 65 years (increased risk)');
  }

  if (pmh.includes('dementia') || cognitive === 'impaired') {
    score += 0.3;
    factors.push('Pre-existing cognitive impairment or dementia');
  }

  if (vitals?.news2 >= 5 || pmh.includes('severe illness')) {
    score += 0.2;
    factors.push('Severe illness (NEWS2 ≥ 5)');
  }

  // Check for delirium-inducing medications
  const medString = medications.join(' ').toLowerCase();
  if (medString.includes('opioid') || medString.includes('benzodiazepine') || 
      medString.includes('anticholinergic')) {
    score += 0.15;
    factors.push('On medications associated with delirium risk');
  }

  if (pmh.includes('previous delirium')) {
    score += 0.2;
    factors.push('Previous episode of delirium');
  }

  const normalizedScore = clamp01(score);

  return {
    guideline: 'NICE CG103 - Delirium (4AT/DELPHI risk factors)',
    score: normalizedScore,
    level: riskLevel(normalizedScore),
    factors
  };
}

/* ================================
   FALLS RISK
   ================================ */

function calculateFallsRisk(patient) {
  const { age, pmh = [], mobility, medications = [], cognitive, vitals } = patient;
  let score = 0;
  const factors = [];

  // STRATIFY / Morse Fall Scale principles
  if (pmh.includes('previous fall') || pmh.includes('falls risk')) {
    score += 0.25;
    factors.push('History of falls');
  }

  if (age >= 65) {
    score += 0.15;
    factors.push('Age ≥ 65 years');
  }

  if (mobility === 'reduced' || mobility === 'uses aid') {
    score += 0.2;
    factors.push('Impaired mobility or requires walking aid');
  }

  if (cognitive === 'impaired' || pmh.includes('dementia')) {
    score += 0.15;
    factors.push('Cognitive impairment');
  }

  // Medications increasing fall risk
  const medString = medications.join(' ').toLowerCase();
  if (medString.includes('diuretic') || medString.includes('hypotensive') ||
      medString.includes('opioid') || medString.includes('benzodiazepine')) {
    score += 0.15;
    factors.push('On medications that increase fall risk');
  }

  if (vitals?.systolicBp < 100) {
    score += 0.1;
    factors.push('Hypotension (postural instability risk)');
  }

  const normalizedScore = clamp01(score);

  return {
    guideline: 'NICE CG161 - Falls in older people (STRATIFY)',
    score: normalizedScore,
    level: riskLevel(normalizedScore),
    factors
  };
}

/* ================================
   PRESSURE ULCER RISK
   ================================ */

function calculatePressureUlcerRisk(patient) {
  const { age, bmi, mobility, nutrition, continence, skinCondition } = patient;
  let score = 0;
  const factors = [];

  // Waterlow / Braden Scale principles
  if (mobility === 'bedbound') {
    score += 0.3;
    factors.push('Bedbound (severely limited mobility)');
  } else if (mobility === 'reduced' || mobility === 'chair-bound') {
    score += 0.2;
    factors.push('Reduced mobility');
  }

  if (nutrition === 'poor' || bmi < 18.5) {
    score += 0.2;
    factors.push('Poor nutrition or underweight (BMI < 18.5)');
  }

  if (continence === 'incontinent') {
    score += 0.15;
    factors.push('Incontinence (moisture risk)');
  }

  if (skinCondition === 'fragile' || skinCondition === 'broken') {
    score += 0.15;
    factors.push('Fragile or broken skin');
  }

  if (age >= 75) {
    score += 0.1;
    factors.push('Age ≥ 75 (skin fragility)');
  }

  const normalizedScore = clamp01(score);

  return {
    guideline: 'NICE CG179 - Pressure ulcers (Waterlow)',
    score: normalizedScore,
    level: riskLevel(normalizedScore),
    factors
  };
}

/* ================================
   ACUTE RESPIRATORY FAILURE RISK
   ================================ */

function calculateRespiratoryFailureRisk(patient) {
  const { vitals, pmh = [], labs } = patient;
  let score = 0;
  const factors = [];

  if (!vitals) {
    return {
      guideline: 'Respiratory failure risk assessment',
      score: 0,
      level: 'low',
      factors: []
    };
  }

  if (vitals.spo2 < 90) {
    score += 0.3;
    factors.push('SpO₂ < 90% (severe hypoxia)');
  } else if (vitals.spo2 < 94) {
    score += 0.2;
    factors.push('SpO₂ < 94% (hypoxia)');
  }

  if (vitals.rr > 25) {
    score += 0.2;
    factors.push('Respiratory rate > 25/min (tachypnoea)');
  } else if (vitals.rr < 10) {
    score += 0.3;
    factors.push('Respiratory rate < 10/min (concerning bradypnoea)');
  }

  if (vitals.supplementalO2 === true) {
    score += 0.15;
    factors.push('Requiring supplemental oxygen');
  }

  if (pmh.includes('copd') || pmh.includes('asthma')) {
    score += 0.1;
    factors.push('History of chronic respiratory disease');
  }

  if (labs?.ph && labs.ph < 7.35) {
    score += 0.15;
    factors.push('Acidosis (pH < 7.35)');
  }

  const normalizedScore = clamp01(score);

  return {
    guideline: 'Acute respiratory failure risk (clinical indicators)',
    score: normalizedScore,
    level: riskLevel(normalizedScore),
    factors
  };
}

/* ================================
   CARDIAC ARREST RISK
   ================================ */

function calculateCardiacArrestRisk(patient) {
  const { vitals } = patient;
  let score = 0;
  const factors = [];

  if (!vitals) {
    return {
      guideline: 'National Cardiac Arrest Audit (NCAA) - Risk indicators',
      score: 0,
      level: 'low',
      factors: []
    };
  }

  const news2 = vitals.news2 ?? 0;

  if (news2 >= 9) {
    score += 0.4;
    factors.push('NEWS2 ≥ 9 (very high risk of deterioration)');
  } else if (news2 >= 7) {
    score += 0.3;
    factors.push('NEWS2 ≥ 7 (high risk of deterioration)');
  } else if (news2 >= 5) {
    score += 0.15;
    factors.push('NEWS2 ≥ 5 (increased risk)');
  }

  if (vitals.hr > 130 || vitals.hr < 40) {
    score += 0.2;
    factors.push('Critical heart rate (brady/tachycardia)');
  }

  if (vitals.systolicBp < 90) {
    score += 0.2;
    factors.push('Systolic BP < 90 mmHg (hypotension)');
  }

  if (vitals.avpu && vitals.avpu !== 'Alert') {
    score += 0.15;
    factors.push('Altered consciousness (AVPU not Alert)');
  }

  const normalizedScore = clamp01(score);

  return {
    guideline: 'National Cardiac Arrest Audit (NCAA) - Risk indicators',
    score: normalizedScore,
    level: riskLevel(normalizedScore),
    factors
  };
}

/* ================================
   ELECTROLYTE DISTURBANCE RISK
   ================================ */

function calculateElectrolyteRisk(patient) {
  const { labs, medications = [] } = patient;
  let score = 0;
  const factors = [];

  if (!labs) {
    return {
      guideline: 'Electrolyte disturbance risk',
      score: 0,
      level: 'low',
      factors: []
    };
  }

  // Potassium
  if (labs.potassium >= 6.0) {
    score += 0.4;
    factors.push('Severe hyperkalaemia (K ≥ 6.0) - arrhythmia risk');
  } else if (labs.potassium >= 5.5) {
    score += 0.25;
    factors.push('Hyperkalaemia (K ≥ 5.5)');
  } else if (labs.potassium < 3.0) {
    score += 0.3;
    factors.push('Severe hypokalaemia (K < 3.0) - arrhythmia risk');
  } else if (labs.potassium < 3.5) {
    score += 0.15;
    factors.push('Hypokalaemia (K < 3.5)');
  }

  // Sodium
  if (labs.sodium < 125) {
    score += 0.3;
    factors.push('Severe hyponatraemia (Na < 125) - seizure risk');
  } else if (labs.sodium < 135) {
    score += 0.1;
    factors.push('Hyponatraemia (Na < 135)');
  } else if (labs.sodium > 150) {
    score += 0.2;
    factors.push('Hypernatraemia (Na > 150)');
  }

  // Medication factors
  const medString = medications.join(' ').toLowerCase();
  if (medString.includes('diuretic')) {
    score += 0.05;
    factors.push('On diuretics (electrolyte loss risk)');
  }

  const normalizedScore = clamp01(score);

  return {
    guideline: 'Electrolyte disturbance risk assessment',
    score: normalizedScore,
    level: riskLevel(normalizedScore),
    factors
  };
}

/* ================================
   MEDICATION-RELATED HARM RISK
   ================================ */

function calculateMedicationHarmRisk(patient) {
  const { medications = [], labs, age, allergies = [] } = patient;
  let score = 0;
  const factors = [];

  if (medications.length >= 10) {
    score += 0.2;
    factors.push('Polypharmacy (≥ 10 medications) - interaction risk');
  } else if (medications.length >= 5) {
    score += 0.1;
    factors.push('Multiple medications (≥ 5) - moderate interaction risk');
  }

  // Renal dosing concerns
  if (labs?.currentEgfr < 30) {
    score += 0.25;
    factors.push('Severe renal impairment (eGFR < 30) - dose adjustment needed');
  } else if (labs?.currentEgfr < 60) {
    score += 0.15;
    factors.push('Renal impairment (eGFR < 60) - some medications need adjustment');
  }

  if (age >= 75) {
    score += 0.1;
    factors.push('Age ≥ 75 (increased sensitivity to medications)');
  }

  if (allergies.length > 0) {
    score += 0.1;
    factors.push(`Known allergies present (${allergies.join(', ')})`);
  }

  // High-risk medications
  const medString = medications.join(' ').toLowerCase();
  const highRiskMeds = [];
  if (medString.includes('warfarin') || medString.includes('anticoagulant')) highRiskMeds.push('anticoagulants');
  if (medString.includes('insulin')) highRiskMeds.push('insulin');
  if (medString.includes('opioid')) highRiskMeds.push('opioids');
  
  if (highRiskMeds.length > 0) {
    score += 0.15;
    factors.push(`On high-risk medications (${highRiskMeds.join(', ')})`);
  }

  const normalizedScore = clamp01(score);

  return {
    guideline: 'Medication-related harm risk assessment',
    score: normalizedScore,
    level: riskLevel(normalizedScore),
    factors
  };
}

/* ================================
   MALNUTRITION RISK (MUST)
   ================================ */

function calculateMalnutritionRisk(patient) {
  const { bmi, weightLoss, acuteDisease, age } = patient;
  let score = 0;
  const factors = [];

  // MUST Score
  if (bmi < 18.5) {
    score += 2;
    factors.push('BMI < 18.5 (underweight) (+2)');
  } else if (bmi < 20) {
    score += 1;
    factors.push('BMI < 20 (+1)');
  }

  if (weightLoss === '>10%') {
    score += 2;
    factors.push('Weight loss > 10% in 3-6 months (+2)');
  } else if (weightLoss === '5-10%') {
    score += 1;
    factors.push('Weight loss 5-10% (+1)');
  }

  if (acuteDisease === true) {
    score += 2;
    factors.push('Acute disease with no nutritional intake >5 days (+2)');
  }

  // Additional factors
  if (age >= 75 && bmi < 23) {
    score += 0.05;
    factors.push('Elderly with borderline BMI');
  }

  const normalizedScore = clamp01(score / 6);

  return {
    guideline: 'NICE CG32 - Nutrition support (MUST score)',
    score: normalizedScore,
    level: score >= 2 ? 'high' : score >= 1 ? 'moderate' : 'low',
    factors,
    mustScore: score
  };
}

/* ================================
   BLEEDING RISK (HAS-BLED)
   ================================ */

function calculateBleedingRisk(patient) {
  const { pmh = [], medications = [], age, labs, vitals } = patient;
  let score = 0;
  const factors = [];

  // HAS-BLED Score
  if (vitals?.systolicBp > 160) {
    score += 1;
    factors.push('Hypertension (SBP > 160) (+1)');
  }

  if (labs?.currentEgfr < 60 || pmh.includes('renal disease')) {
    score += 1;
    factors.push('Renal disease (eGFR < 60) (+1)');
  }

  if (pmh.includes('liver disease')) {
    score += 1;
    factors.push('Liver disease (+1)');
  }

  if (pmh.includes('stroke')) {
    score += 1;
    factors.push('History of stroke (+1)');
  }

  if (pmh.includes('previous bleed') || pmh.includes('bleeding tendency')) {
    score += 1;
    factors.push('Previous bleeding or predisposition (+1)');
  }

  if (labs?.inr > 3) {
    score += 1;
    factors.push('Labile INR (INR > 3) (+1)');
  }

  if (age >= 65) {
    score += 1;
    factors.push('Age ≥ 65 (+1)');
  }

  // Medications
  const medString = medications.join(' ').toLowerCase();
  if (medString.includes('nsaid') || medString.includes('antiplatelet')) {
    score += 1;
    factors.push('On NSAIDs or antiplatelet drugs (+1)');
  }

  if (medString.includes('alcohol') || pmh.includes('alcohol excess')) {
    score += 1;
    factors.push('Alcohol excess (+1)');
  }

  const normalizedScore = clamp01(score / 9);

  return {
    guideline: 'HAS-BLED bleeding risk score',
    score: normalizedScore,
    level: score >= 3 ? 'high' : score >= 1 ? 'moderate' : 'low',
    factors,
    hasbledScore: score
  };
}

/* ================================
   MAIN ENTRY POINT
   ================================ */

function calculateAllRisks(patient, mode = "guideline") {
  let aki, sepsis;

  if (mode === "demo") {
    aki = calculateAkiDemo(patient);
    sepsis = calculateSepsisDemo(patient);
  } else {
    aki = calculateAkiGuideline(patient);
    sepsis = calculateSepsisGuideline(patient);
  }

  // Calculate all new risks (guideline-based only)
  const vte = calculateVTERisk(patient);
  const delirium = calculateDeliriumRisk(patient);
  const falls = calculateFallsRisk(patient);
  const pressureUlcer = calculatePressureUlcerRisk(patient);
  const respiratoryFailure = calculateRespiratoryFailureRisk(patient);
  const cardiacArrest = calculateCardiacArrestRisk(patient);
  const electrolyte = calculateElectrolyteRisk(patient);
  const medicationHarm = calculateMedicationHarmRisk(patient);
  const malnutrition = calculateMalnutritionRisk(patient);
  const bleeding = calculateBleedingRisk(patient);

  // Calculate overall score from all risks
  const allScores = [
    aki.score, 
    sepsis.score, 
    vte.score, 
    delirium.score, 
    falls.score, 
    pressureUlcer.score,
    respiratoryFailure.score,
    cardiacArrest.score,
    electrolyte.score,
    medicationHarm.score,
    malnutrition.score,
    bleeding.score
  ];
  const overallScore = Math.max(...allScores);

  return {
    mode,
    patientId: patient.id,
    aki,
    sepsis,
    vte,
    delirium,
    falls,
    pressureUlcer,
    respiratoryFailure,
    cardiacArrest,
    electrolyte,
    medicationHarm,
    malnutrition,
    bleeding,
    overall: {
      score: overallScore,
      level: riskLevel(overallScore)
    }
  };
}

module.exports = {
  calculateAllRisks,
  calculateAkiRisk: (p, m) => m === 'demo' ? calculateAkiDemo(p) : calculateAkiGuideline(p),
  calculateSepsisRisk: (p, m) => m === 'demo' ? calculateSepsisDemo(p) : calculateSepsisGuideline(p),
  calculateVTERisk,
  calculateDeliriumRisk,
  calculateFallsRisk,
  calculatePressureUlcerRisk,
  calculateRespiratoryFailureRisk,
  calculateCardiacArrestRisk,
  calculateElectrolyteRisk,
  calculateMedicationHarmRisk,
  calculateMalnutritionRisk,
  calculateBleedingRisk,
  riskLevel
};