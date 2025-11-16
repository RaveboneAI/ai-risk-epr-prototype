/**
 * Unit Tests for Risk Engine
 * Tests AKI and Sepsis risk calculations
 */

const { calculateAkiRisk, calculateSepsisRisk, riskLevel } = require('../riskEngine');

describe('Risk Level Classification', () => {
  test('should classify scores into correct risk levels', () => {
    expect(riskLevel(0.1)).toBe('low');
    expect(riskLevel(0.4)).toBe('low');
    expect(riskLevel(0.5)).toBe('moderate');
    expect(riskLevel(0.6)).toBe('moderate');
    expect(riskLevel(0.8)).toBe('high');
    expect(riskLevel(1.0)).toBe('high');
  });

  test('should handle edge cases', () => {
    expect(riskLevel(0)).toBe('low');
    expect(riskLevel(0.49)).toBe('low');
    expect(riskLevel(0.5)).toBe('moderate');
    expect(riskLevel(0.79)).toBe('moderate');
    expect(riskLevel(0.8)).toBe('high');
  });
});

describe('AKI Risk Calculation - Demo Mode', () => {
  test('should detect no AKI risk for normal values', () => {
    const patient = {
      labs: {
        currentCreatinine: 80,
        baselineCreatinine: 80,
        currentEgfr: 90,
        baselineEgfr: 90
      }
    };
    
    const result = calculateAkiRisk(patient, 'demo');
    
    expect(result.level).toBe('low');
    expect(result.score).toBeLessThan(0.5);
    expect(result.mode).toBe('demo');
  });

  test('should detect high AKI risk for elevated creatinine', () => {
    const patient = {
      labs: {
        currentCreatinine: 250,
        baselineCreatinine: 80,
        currentEgfr: 25,
        baselineEgfr: 90
      }
    };
    
    const result = calculateAkiRisk(patient, 'demo');
    
    expect(result.level).toBe('high');
    expect(result.score).toBeGreaterThan(0.8);
    expect(result.factors.length).toBeGreaterThan(0);
  });

  test('should handle missing baseline values', () => {
    const patient = {
      labs: {
        currentCreatinine: 150,
        currentEgfr: 45
      }
    };
    
    const result = calculateAkiRisk(patient, 'demo');
    
    expect(result.level).toBeDefined();
    expect(result.score).toBeGreaterThan(0);
  });
});

describe('AKI Risk Calculation - Guideline Mode', () => {
  test('should detect AKI Stage 1', () => {
    const patient = {
      labs: {
        currentCreatinine: 120,
        baselineCreatinine: 80  // 1.5x increase
      }
    };
    
    const result = calculateAkiRisk(patient, 'guideline');
    
    expect(result.stage).toBe(1);
    expect(result.level).toBe('moderate');
    expect(result.guideline).toContain('NICE CG169');
  });

  test('should detect AKI Stage 2', () => {
    const patient = {
      labs: {
        currentCreatinine: 180,
        baselineCreatinine: 80  // 2.25x increase
      }
    };
    
    const result = calculateAkiRisk(patient, 'guideline');
    
    expect(result.stage).toBe(2);
    expect(result.level).toBe('high');
  });

  test('should detect AKI Stage 3', () => {
    const patient = {
      labs: {
        currentCreatinine: 250,
        baselineCreatinine: 80  // 3.125x increase
      }
    };
    
    const result = calculateAkiRisk(patient, 'guideline');
    
    expect(result.stage).toBe(3);
    expect(result.level).toBe('high');
  });

  test('should detect no AKI in guideline mode', () => {
    const patient = {
      labs: {
        currentCreatinine: 85,
        baselineCreatinine: 80
      }
    };
    
    const result = calculateAkiRisk(patient, 'guideline');
    
    expect(result.stage).toBe(0);
    expect(result.level).toBe('low');
  });
});

describe('Sepsis Risk Calculation - Demo Mode', () => {
  test('should detect no sepsis risk for normal values', () => {
    const patient = {
      labs: {
        wbc: 7,
        crp: 3
      },
      vitals: {
        temp: 37.0,
        hr: 80,
        rr: 16
      }
    };
    
    const result = calculateSepsisRisk(patient, 'demo');
    
    expect(result.level).toBe('low');
    expect(result.score).toBeLessThan(0.5);
  });

  test('should detect high sepsis risk for abnormal values', () => {
    const patient = {
      labs: {
        wbc: 18,
        crp: 150
      },
      vitals: {
        temp: 39.5,
        hr: 125,
        rr: 28
      }
    };
    
    const result = calculateSepsisRisk(patient, 'demo');
    
    expect(result.level).toBe('high');
    expect(result.score).toBeGreaterThan(0.8);
    expect(result.factors).toContain('Elevated temperature (39.5 °C)');
  });

  test('should detect hypothermia as risk factor', () => {
    const patient = {
      labs: { wbc: 16, crp: 80 },
      vitals: { temp: 35.0, hr: 110, rr: 24 }
    };
    
    const result = calculateSepsisRisk(patient, 'demo');
    
    expect(result.factors.some(f => f.includes('Low temperature'))).toBe(true);
  });
});

describe('Sepsis Risk Calculation - Guideline Mode', () => {
  test('should detect sepsis based on NICE NG51 criteria', () => {
    const patient = {
      labs: {
        wbc: 16,
        crp: 100
      },
      vitals: {
        temp: 38.5,
        hr: 110,
        rr: 25,
        systolicBp: 95
      }
    };
    
    const result = calculateSepsisRisk(patient, 'guideline');
    
    expect(result.level).not.toBe('low');
    expect(result.guideline).toContain('NICE NG51');
    expect(result.factors.length).toBeGreaterThan(0);
  });

  test('should handle qSOFA criteria', () => {
    const patient = {
      vitals: {
        systolicBp: 95,
        rr: 25,
        avpu: 'V'  // Altered mental status
      }
    };
    
    const result = calculateSepsisRisk(patient, 'guideline');
    
    // qSOFA ≥2 should indicate high risk
    expect(result.level).toBe('high');
  });
});

describe('Edge Cases and Error Handling', () => {
  test('should handle empty patient data', () => {
    const patient = {};
    
    const akiResult = calculateAkiRisk(patient, 'demo');
    const sepsisResult = calculateSepsisRisk(patient, 'demo');
    
    expect(akiResult.level).toBeDefined();
    expect(sepsisResult.level).toBeDefined();
    expect(akiResult.factors).toEqual([]);
    expect(sepsisResult.factors).toEqual([]);
  });

  test('should handle null/undefined values', () => {
    const patient = {
      labs: {
        currentCreatinine: null,
        wbc: undefined
      },
      vitals: {
        temp: null
      }
    };
    
    const akiResult = calculateAkiRisk(patient, 'demo');
    const sepsisResult = calculateSepsisRisk(patient, 'demo');
    
    expect(akiResult.score).toBe(0);
    expect(sepsisResult.score).toBeGreaterThanOrEqual(0);
  });

  test('should default to demo mode if mode not specified', () => {
    const patient = {
      labs: { currentCreatinine: 150 }
    };
    
    const result = calculateAkiRisk(patient);
    
    expect(result.mode).toBe('demo');
  });
});

