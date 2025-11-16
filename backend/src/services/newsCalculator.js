/**
 * NEWS2 (National Early Warning Score) Calculator
 * Based on Royal College of Physicians NHS guidelines
 */

/**
 * Calculate individual NEWS2 parameter scores
 */
const calculateNEWS2Score = (parameter, value) => {
  if (value === null || value === undefined) return 0;
  
  switch (parameter) {
    case 'respirationRate':
      if (value <= 8) return 3;
      if (value <= 11) return 1;
      if (value <= 20) return 0;
      if (value <= 24) return 2;
      return 3;
    
    case 'oxygenSaturation':
      if (value <= 91) return 3;
      if (value <= 93) return 2;
      if (value <= 95) return 1;
      return 0;
    
    case 'temperature':
      if (value <= 35.0) return 3;
      if (value <= 36.0) return 1;
      if (value <= 38.0) return 0;
      if (value <= 39.0) return 1;
      return 2;
    
    case 'systolicBP':
      if (value <= 90) return 3;
      if (value <= 100) return 2;
      if (value <= 110) return 1;
      if (value <= 219) return 0;
      return 3;
    
    case 'heartRate':
      if (value <= 40) return 3;
      if (value <= 50) return 1;
      if (value <= 90) return 0;
      if (value <= 110) return 1;
      if (value <= 130) return 2;
      return 3;
    
    case 'consciousness':
      // AVPU score: Alert = 0, any other = 3
      return (value === 'Alert' || value === 'A') ? 0 : 3;
    
    default:
      return 0;
  }
};

/**
 * Calculate total NEWS2 score from vitals
 */
const calculateTotalNEWS2 = (vitals) => {
  if (!vitals) return null;

  const scores = {
    respirationRate: calculateNEWS2Score('respirationRate', vitals.rr),
    oxygenSaturation: calculateNEWS2Score('oxygenSaturation', vitals.spo2),
    temperature: calculateNEWS2Score('temperature', vitals.temp),
    systolicBP: calculateNEWS2Score('systolicBP', vitals.systolicBp),
    heartRate: calculateNEWS2Score('heartRate', vitals.hr),
    consciousness: calculateNEWS2Score('consciousness', vitals.avpu || 'Alert')
  };

  // Add supplemental oxygen score (2 points if on oxygen)
  const oxygenScore = vitals.supplementalO2 ? 2 : 0;

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0) + oxygenScore;

  return {
    totalScore,
    individualScores: scores,
    oxygenScore,
    riskLevel: getNEWS2RiskLevel(totalScore),
    clinicalResponse: getNEWS2ClinicalResponse(totalScore)
  };
};

/**
 * Determine risk level from NEWS2 score
 */
const getNEWS2RiskLevel = (score) => {
  if (score >= 7) return 'high';
  if (score >= 5) return 'medium';
  if (score >= 3) return 'low-medium';
  return 'low';
};

/**
 * Get clinical response recommendation based on NEWS2 score
 */
const getNEWS2ClinicalResponse = (score) => {
  if (score >= 7) {
    return 'Emergency assessment by critical care team. Consider transfer to higher level care.';
  }
  if (score >= 5) {
    return 'Urgent review by ward-based doctor or acute team nurse. Consider critical care referral.';
  }
  if (score >= 3) {
    return 'Increase frequency of observations. Inform registered nurse who must assess patient.';
  }
  if (score >= 1) {
    return 'Continue routine NEWS monitoring.';
  }
  return 'Continue routine monitoring as per local policy.';
};

/**
 * Validate vitals data
 */
const validateVitals = (vitals) => {
  const warnings = [];

  if (!vitals) {
    return { valid: false, warnings: ['No vital signs data provided'] };
  }

  // Check for clinically unlikely values
  if (vitals.rr && (vitals.rr < 5 || vitals.rr > 60)) {
    warnings.push(`Respiratory rate (${vitals.rr}) is clinically unlikely`);
  }

  if (vitals.hr && (vitals.hr < 20 || vitals.hr > 250)) {
    warnings.push(`Heart rate (${vitals.hr}) is clinically unlikely`);
  }

  if (vitals.temp && (vitals.temp < 30 || vitals.temp > 43)) {
    warnings.push(`Temperature (${vitals.temp}) is clinically unlikely`);
  }

  if (vitals.systolicBp && (vitals.systolicBp < 40 || vitals.systolicBp > 250)) {
    warnings.push(`Systolic BP (${vitals.systolicBp}) is clinically unlikely`);
  }

  if (vitals.spo2 && (vitals.spo2 < 50 || vitals.spo2 > 100)) {
    warnings.push(`Oxygen saturation (${vitals.spo2}) is clinically unlikely`);
  }

  return {
    valid: warnings.length === 0,
    warnings
  };
};

module.exports = {
  calculateNEWS2Score,
  calculateTotalNEWS2,
  getNEWS2RiskLevel,
  getNEWS2ClinicalResponse,
  validateVitals
};

