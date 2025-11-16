/**
 * Unit Tests for Diagnosis Scoring
 * Tests NICE/NHSE diagnosis calculations
 */

const {
  calculateHeartFailure,
  calculatePulmonaryEmbolism,
  calculateDKA,
  calculateACS,
  calculatePneumonia,
  calculateStroke,
  calculateDiagnosisScores
} = require('../diagnosisScoring');

describe('Heart Failure Diagnosis', () => {
  test('should detect high-risk heart failure', () => {
    const patient = {
      pmh: ['heart failure', 'hypertension'],
      labs: { bnp: 800 },
      examFindings: ['peripheral edema', 'crackles']
    };
    
    const result = calculateHeartFailure(patient);
    
    expect(result.level).toBe('high');
    expect(result.condition).toBe('Heart Failure');
    expect(result.factors.length).toBeGreaterThan(0);
  });

  test('should detect low-risk with no indicators', () => {
    const patient = {
      pmh: [],
      labs: { bnp: 50 }
    };
    
    const result = calculateHeartFailure(patient);
    
    expect(result.level).toBe('low');
    expect(result.score).toBeLessThan(0.5);
  });
});

describe('Pulmonary Embolism Diagnosis', () => {
  test('should calculate Wells score correctly', () => {
    const patient = {
      pmh: ['dvt'],
      vitals: { hr: 115 },
      examFindings: ['leg swelling']
    };
    
    const result = calculatePulmonaryEmbolism(patient);
    
    expect(result.wellsScore).toBeGreaterThan(0);
    expect(result.guideline).toContain('Wells');
  });

  test('should detect high-risk PE', () => {
    const patient = {
      pmh: ['dvt', 'cancer'],
      vitals: { hr: 120 },
      examFindings: ['hemoptysis', 'leg swelling']
    };
    
    const result = calculatePulmonaryEmbolism(patient);
    
    expect(result.level).toBe('high');
    expect(result.wellsScore).toBeGreaterThan(4);
  });
});

describe('DKA Diagnosis', () => {
  test('should detect DKA with classic triad', () => {
    const patient = {
      labs: {
        glucose: 25,
        ketones: 4.0,
        ph: 7.2
      }
    };
    
    const result = calculateDKA(patient);
    
    expect(result.level).toBe('high');
    expect(result.factors).toContain('Hyperglycemia (glucose: 25 mmol/L)');
  });

  test('should not detect DKA with normal values', () => {
    const patient = {
      labs: {
        glucose: 6.0,
        ph: 7.4
      }
    };
    
    const result = calculateDKA(patient);
    
    expect(result.level).toBe('low');
  });
});

describe('Acute Coronary Syndrome Diagnosis', () => {
  test('should detect high-risk ACS', () => {
    const patient = {
      presentingComplaint: 'chest pain',
      labs: { troponin: 150 },
      examFindings: ['st elevation']
    };
    
    const result = calculateACS(patient);
    
    expect(result.level).toBe('high');
    expect(result.factors.some(f => f.includes('troponin'))).toBe(true);
  });

  test('should consider risk factors', () => {
    const patient = {
      presentingComplaint: 'chest pain',
      pmh: ['diabetes', 'hypertension', 'smoking']
    };
    
    const result = calculateACS(patient);
    
    expect(result.level).not.toBe('low');
    expect(result.factors.length).toBeGreaterThan(0);
  });
});

describe('Pneumonia Diagnosis (CURB-65)', () => {
  test('should calculate CURB-65 score correctly', () => {
    const patient = {
      age: 70,
      vitals: {
        systolicBp: 95,
        rr: 35
      },
      labs: {
        urea: 10
      },
      examFindings: ['confusion']
    };
    
    const result = calculatePneumonia(patient);
    
    expect(result.curb65Score).toBeGreaterThanOrEqual(3);
    expect(result.level).toBe('high');
  });

  test('should detect low-risk pneumonia', () => {
    const patient = {
      age: 45,
      vitals: {
        systolicBp: 120,
        rr: 18
      },
      labs: {
        urea: 5
      }
    };
    
    const result = calculatePneumonia(patient);
    
    expect(result.curb65Score).toBeLessThanOrEqual(1);
    expect(result.level).toBe('low');
  });
});

describe('Stroke/TIA Diagnosis', () => {
  test('should detect stroke with FAST criteria', () => {
    const patient = {
      presentingComplaint: 'sudden weakness',
      examFindings: ['facial droop', 'arm weakness', 'speech difficulty']
    };
    
    const result = calculateStroke(patient);
    
    expect(result.level).toBe('high');
    expect(result.factors.length).toBeGreaterThan(0);
  });

  test('should not detect stroke without symptoms', () => {
    const patient = {
      presentingComplaint: 'headache'
    };
    
    const result = calculateStroke(patient);
    
    expect(result.level).toBe('low');
  });
});

describe('Complete Diagnosis Scoring', () => {
  test('should return only relevant diagnoses', () => {
    const patient = {
      presentingComplaint: 'chest pain',
      labs: { troponin: 100 },
      pmh: ['hypertension']
    };
    
    const results = calculateDiagnosisScores(patient);
    
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(d => d.condition === 'Acute Coronary Syndrome')).toBe(true);
  });

  test('should filter out low-risk diagnoses', () => {
    const patient = {
      labs: {},
      vitals: {},
      pmh: []
    };
    
    const results = calculateDiagnosisScores(patient);
    
    results.forEach(diagnosis => {
      expect(diagnosis.level).not.toBe('low');
    });
  });

  test('should handle empty patient data', () => {
    const patient = {};
    
    const results = calculateDiagnosisScores(patient);
    
    expect(Array.isArray(results)).toBe(true);
  });
});

