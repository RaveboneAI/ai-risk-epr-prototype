/**
 * NICE/NHSE Diagnosis Scoring System
 * 
 * This module implements simplified versions of various NICE diagnostic criteria
 * for common acute conditions. These are educational prototypes and NOT for clinical use.
 */

// Score helpers
function scoreResult(score, confidence) {
  return {
    score: Math.max(0, Math.min(1, score)), // 0-1 range
    confidence: confidence || "moderate", // low, moderate, high
    level: score >= 0.7 ? "high" : score >= 0.4 ? "moderate" : "low"
  };
}

/**
 * Heart Failure Assessment (NICE NG106)
 * Based on NT-proBNP levels, clinical signs, and echo findings
 */
function assessHeartFailure(patient) {
  const { labs = {}, vitals = {}, presentingComplaint = "", examFindings = {} } = patient;
  let score = 0;
  const factors = [];
  const guideline = "NICE NG106 - Chronic heart failure in adults";

  // NT-proBNP levels (if available)
  if (labs.ntProBNP) {
    if (labs.ntProBNP > 2000) {
      score += 0.6;
      factors.push(`NT-proBNP >2000 pg/mL (${labs.ntProBNP}) - high probability`);
    } else if (labs.ntProBNP > 400) {
      score += 0.3;
      factors.push(`NT-proBNP 400-2000 pg/mL (${labs.ntProBNP}) - intermediate`);
    } else {
      factors.push(`NT-proBNP <400 pg/mL (${labs.ntProBNP}) - HF unlikely`);
    }
  }

  // Clinical presentation
  const pc = presentingComplaint.toLowerCase();
  if (pc.includes("sob") || pc.includes("shortness of breath") || pc.includes("breathless")) {
    score += 0.15;
    factors.push("Dyspnoea present");
  }
  if (pc.includes("oedema") || pc.includes("swelling") || pc.includes("ankle swelling")) {
    score += 0.1;
    factors.push("Peripheral oedema noted");
  }

  // Echo findings
  if (examFindings.lvef) {
    if (examFindings.lvef < 40) {
      score += 0.4;
      factors.push(`Reduced LVEF <40% (${examFindings.lvef}%) - HFrEF`);
    } else if (examFindings.lvef >= 40 && examFindings.lvef < 50) {
      score += 0.2;
      factors.push(`LVEF 40-49% (${examFindings.lvef}%) - HFmrEF`);
    }
  }

  // Respiratory rate
  if (vitals.rr > 20) {
    score += 0.05;
    factors.push("Tachypnoea present (RR >20)");
  }

  if (factors.length === 0) {
    return null; // No relevant data
  }

  return {
    condition: "Heart Failure",
    guideline,
    ...scoreResult(score, labs.ntProBNP ? "high" : "moderate"),
    factors
  };
}

/**
 * Pulmonary Embolism Assessment (NICE NG158)
 * Wells score for PE and D-dimer
 */
function assessPulmonaryEmbolism(patient) {
  const { labs = {}, vitals = {}, presentingComplaint = "", pmh = [] } = patient;
  let wellsScore = 0;
  const factors = [];
  const guideline = "NICE NG158 - Venous thromboembolic diseases";

  // Wells criteria for PE
  const pc = presentingComplaint.toLowerCase();
  
  if (pc.includes("haemoptysis") || pc.includes("blood") && pc.includes("cough")) {
    wellsScore += 1;
    factors.push("Haemoptysis (+1 Wells)");
  }

  // Check for DVT signs
  if (pc.includes("dvt") || pc.includes("leg swelling")) {
    wellsScore += 3;
    factors.push("Clinical signs of DVT (+3 Wells)");
  }

  // Previous VTE
  if (pmh.some(h => h.toLowerCase().includes("pe") || h.toLowerCase().includes("dvt") || h.toLowerCase().includes("vte"))) {
    wellsScore += 1.5;
    factors.push("Previous PE or DVT (+1.5 Wells)");
  }

  // Tachycardia
  if (vitals.hr > 100) {
    wellsScore += 1.5;
    factors.push(`Heart rate >100 bpm (${vitals.hr}) (+1.5 Wells)`);
  }

  // Recent surgery/immobilization - would need to be in patient data
  // For now, check presenting complaint
  if (pc.includes("post-op") || pc.includes("immobile")) {
    wellsScore += 1.5;
    factors.push("Recent surgery/immobilization (+1.5 Wells)");
  }

  if (factors.length === 0) {
    return null;
  }

  factors.push(`Wells score: ${wellsScore.toFixed(1)}`);

  // D-dimer interpretation
  let score = 0;
  if (labs.dDimer) {
    if (labs.dDimer > 500) {
      score += 0.3;
      factors.push(`D-dimer elevated (${labs.dDimer} ng/mL)`);
    } else {
      factors.push(`D-dimer normal (${labs.dDimer} ng/mL) - PE unlikely if Wells ≤4`);
    }
  }

  // Wells score interpretation
  if (wellsScore > 4) {
    score += 0.6;
    factors.push("Wells score >4 - PE likely, CTPA indicated");
  } else {
    score += 0.2;
    factors.push("Wells score ≤4 - PE unlikely");
  }

  return {
    condition: "Pulmonary Embolism",
    guideline,
    wellsScore: wellsScore.toFixed(1),
    ...scoreResult(score, labs.dDimer ? "high" : "moderate"),
    factors
  };
}

/**
 * Diabetic Ketoacidosis (NICE NG18)
 * Based on blood glucose, ketones, pH
 */
function assessDKA(patient) {
  const { labs = {}, presentingComplaint = "" } = patient;
  let score = 0;
  const factors = [];
  const guideline = "NICE NG18 - Diabetes (type 1 and type 2) in children and young people";

  // Need at least glucose or ketones to assess
  if (!labs.glucose && !labs.ketones && !labs.ph) {
    return null;
  }

  // Hyperglycaemia
  if (labs.glucose) {
    if (labs.glucose > 11) {
      score += 0.3;
      factors.push(`Blood glucose >11 mmol/L (${labs.glucose})`);
    }
  }

  // Ketones
  if (labs.ketones) {
    if (labs.ketones > 3) {
      score += 0.4;
      factors.push(`Blood ketones >3 mmol/L (${labs.ketones}) - significant ketonaemia`);
    } else if (labs.ketones > 1.5) {
      score += 0.2;
      factors.push(`Blood ketones 1.5-3 mmol/L (${labs.ketones})`);
    }
  }

  // Acidosis
  if (labs.ph) {
    if (labs.ph < 7.3) {
      score += 0.4;
      factors.push(`pH <7.3 (${labs.ph}) - significant acidosis`);
    } else if (labs.ph < 7.35) {
      score += 0.2;
      factors.push(`pH <7.35 (${labs.ph}) - mild acidosis`);
    }
  }

  // Bicarbonate
  if (labs.bicarbonate) {
    if (labs.bicarbonate < 15) {
      score += 0.2;
      factors.push(`Bicarbonate <15 mmol/L (${labs.bicarbonate})`);
    }
  }

  const pc = presentingComplaint.toLowerCase();
  if (pc.includes("vomit") || pc.includes("nausea") || pc.includes("abdo pain")) {
    score += 0.05;
    factors.push("GI symptoms present");
  }

  if (factors.length === 0) {
    return null;
  }

  // DKA diagnosis requires all three: hyperglycaemia, ketonaemia, acidosis
  if (labs.glucose > 11 && labs.ketones > 3 && labs.ph < 7.3) {
    factors.push("⚠️ DKA criteria met - urgent treatment required");
  }

  return {
    condition: "Diabetic Ketoacidosis",
    guideline,
    ...scoreResult(score, "high"),
    factors
  };
}

/**
 * Acute Coronary Syndrome (NICE NG185)
 * Based on troponin, ECG, symptoms
 */
function assessACS(patient) {
  const { labs = {}, examFindings = {}, presentingComplaint = "", age } = patient;
  let score = 0;
  const factors = [];
  const guideline = "NICE NG185 - Acute coronary syndromes";

  const pc = presentingComplaint.toLowerCase();
  
  // Chest pain characteristics
  if (pc.includes("chest pain") || pc.includes("chest discomfort")) {
    score += 0.2;
    factors.push("Chest pain/discomfort present");
    
    if (pc.includes("radiating") || pc.includes("arm") || pc.includes("jaw")) {
      score += 0.1;
      factors.push("Pain radiating to arm/jaw");
    }
  }

  // High-sensitivity troponin
  if (labs.troponin) {
    if (labs.troponin > 50) {
      score += 0.6;
      factors.push(`Troponin significantly elevated (${labs.troponin} ng/L) - consistent with MI`);
    } else if (labs.troponin > 14) {
      score += 0.3;
      factors.push(`Troponin mildly elevated (${labs.troponin} ng/L)`);
    } else {
      factors.push(`Troponin normal (${labs.troponin} ng/L)`);
    }
  }

  // ECG findings
  if (examFindings.ecg) {
    const ecg = examFindings.ecg.toLowerCase();
    if (ecg.includes("stemi") || ecg.includes("st elevation")) {
      score += 0.8;
      factors.push("⚠️ STEMI on ECG - emergency PCI indicated");
    } else if (ecg.includes("st depression") || ecg.includes("t wave")) {
      score += 0.3;
      factors.push("Ischaemic ECG changes present");
    } else if (ecg.includes("normal")) {
      factors.push("ECG normal");
    }
  }

  // Risk factors
  if (age > 65) {
    score += 0.05;
    factors.push("Age >65 - increased risk");
  }

  if (factors.length === 0) {
    return null;
  }

  return {
    condition: "Acute Coronary Syndrome",
    guideline,
    ...scoreResult(score, labs.troponin && examFindings.ecg ? "high" : "moderate"),
    factors
  };
}

/**
 * Community Acquired Pneumonia (NICE NG138)
 * CURB-65 score
 */
function assessPneumonia(patient) {
  const { labs = {}, vitals = {}, presentingComplaint = "", age, examFindings = {} } = patient;
  let curb65 = 0;
  const factors = [];
  const guideline = "NICE NG138 - Pneumonia (community-acquired): antimicrobial prescribing";

  const pc = presentingComplaint.toLowerCase();
  
  // Need respiratory symptoms to consider pneumonia
  if (!pc.includes("cough") && !pc.includes("pneumonia") && !pc.includes("sob") && !pc.includes("chest")) {
    return null;
  }

  // Confusion
  if (pc.includes("confusion") || pc.includes("confused")) {
    curb65 += 1;
    factors.push("Confusion present (+1 CURB-65)");
  }

  // Urea
  if (labs.urea && labs.urea > 7) {
    curb65 += 1;
    factors.push(`Urea >7 mmol/L (${labs.urea}) (+1 CURB-65)`);
  }

  // Respiratory rate
  if (vitals.rr >= 30) {
    curb65 += 1;
    factors.push(`Respiratory rate ≥30 (${vitals.rr}) (+1 CURB-65)`);
  }

  // Blood pressure
  if (vitals.systolicBp < 90 || vitals.diastolicBp <= 60) {
    curb65 += 1;
    factors.push(`Low BP (${vitals.systolicBp}/${vitals.diastolicBp}) (+1 CURB-65)`);
  }

  // Age ≥65
  if (age >= 65) {
    curb65 += 1;
    factors.push("Age ≥65 (+1 CURB-65)");
  }

  // Chest X-ray
  if (examFindings.chestXray && examFindings.chestXray.toLowerCase().includes("consolidation")) {
    factors.push("Chest X-ray shows consolidation");
  }

  if (factors.length === 0) {
    return null;
  }

  factors.push(`CURB-65 score: ${curb65}`);

  let score = 0;
  if (curb65 === 0 || curb65 === 1) {
    score = 0.3;
    factors.push("Low severity - consider home treatment");
  } else if (curb65 === 2) {
    score = 0.5;
    factors.push("Moderate severity - consider hospital admission");
  } else if (curb65 >= 3) {
    score = 0.8;
    factors.push("⚠️ High severity (CURB-65 ≥3) - hospital admission recommended");
  }

  return {
    condition: "Community-Acquired Pneumonia",
    guideline,
    curb65Score: curb65,
    ...scoreResult(score, "high"),
    factors
  };
}

/**
 * Stroke Assessment (NICE NG128)
 * Based on FAST criteria and imaging
 */
function assessStroke(patient) {
  const { presentingComplaint = "", examFindings = {}, vitals = {} } = patient;
  let score = 0;
  const factors = [];
  const guideline = "NICE NG128 - Stroke and transient ischaemic attack in over 16s";

  const pc = presentingComplaint.toLowerCase();
  
  // FAST criteria
  let fastPositive = false;
  
  if (pc.includes("weak") || pc.includes("facial droop") || examFindings.facialWeakness) {
    score += 0.3;
    factors.push("Facial weakness present (F in FAST)");
    fastPositive = true;
  }
  
  if (pc.includes("arm weak") || pc.includes("limb weak") || examFindings.limbWeakness) {
    score += 0.3;
    factors.push("Arm/limb weakness present (A in FAST)");
    fastPositive = true;
  }
  
  if (pc.includes("speech") || pc.includes("slurred") || examFindings.speechDifficulty) {
    score += 0.3;
    factors.push("Speech difficulty present (S in FAST)");
    fastPositive = true;
  }

  // CT/MRI findings
  if (examFindings.ctHead) {
    const ct = examFindings.ctHead.toLowerCase();
    if (ct.includes("ischaemic") || ct.includes("infarct")) {
      score += 0.5;
      factors.push("⚠️ Ischaemic stroke confirmed on CT - thrombolysis window assessment needed");
    } else if (ct.includes("haemorrhage") || ct.includes("bleed")) {
      score += 0.8;
      factors.push("⚠️ Haemorrhagic stroke on CT - urgent neurosurgical input");
    }
  }

  if (!fastPositive && !examFindings.ctHead) {
    return null;
  }

  if (fastPositive) {
    factors.push("⚠️ FAST positive - urgent imaging required (Time is brain)");
  }

  return {
    condition: "Stroke / TIA",
    guideline,
    ...scoreResult(score, examFindings.ctHead ? "high" : "moderate"),
    factors
  };
}

/**
 * Main function to calculate all diagnosis scores
 */
function calculateDiagnosisScores(patient) {
  const diagnoses = [];

  // Run all assessment functions
  const assessments = [
    assessHeartFailure(patient),
    assessPulmonaryEmbolism(patient),
    assessDKA(patient),
    assessACS(patient),
    assessPneumonia(patient),
    assessStroke(patient)
  ];

  // Filter out null results (conditions with no relevant data)
  assessments.forEach(assessment => {
    if (assessment) {
      diagnoses.push(assessment);
    }
  });

  return diagnoses;
}

module.exports = {
  calculateDiagnosisScores
};

