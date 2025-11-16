# Testing Rules
## AI Results Risk Prototype

**Purpose:** Define testing standards, coverage requirements, and quality assurance practices for reliable clinical software.

---

## 1. Testing Philosophy

### 1.1 Testing Pyramid
```
       ╱╲        E2E Tests (Few)
      ╱  ╲       - Critical user journeys
     ╱────╲      Integration Tests (Some)
    ╱      ╲     - API endpoints, data flow
   ╱────────╲    Unit Tests (Many)
  ╱          ╲   - Functions, calculations, components
 ╱────────────╲
```

### 1.2 Test Coverage Goals
- **Overall**: 80% minimum
- **Risk calculations**: 95% minimum (clinical safety)
- **API endpoints**: 90% minimum
- **UI components**: 70% minimum

### 1.3 Test-Driven Development
- Write tests before implementation (where feasible)
- Red → Green → Refactor cycle
- Tests as documentation

---

## 2. Unit Testing

### 2.1 What to Test
- **✅ DO Test:**
  - Risk calculation functions
  - Data transformation functions
  - Utility functions
  - Classification logic
  - Validation functions

- **❌ DON'T Test:**
  - Third-party libraries
  - Simple getters/setters
  - Trivial functions

### 2.2 Unit Test Structure

```javascript
// ✅ Standard test structure
describe('Feature or Module Name', () => {
  // Group related tests
  describe('specific function', () => {
    // Individual test cases
    test('should do something specific', () => {
      // Arrange
      const input = { /* test data */ };
      
      // Act
      const result = functionUnderTest(input);
      
      // Assert
      expect(result).toBe(expectedValue);
    });
  });
});
```

### 2.3 Backend Unit Tests

#### 2.3.1 Risk Calculation Tests
```javascript
// backend/src/services/__tests__/riskEngine.test.js
const { calculateAkiRisk, riskLevel } = require('../riskEngine');

describe('AKI Risk Calculation', () => {
  test('should detect no AKI risk for normal values', () => {
    const patient = {
      labs: {
        currentCreatinine: 80,
        baselineCreatinine: 80,
        currentEgfr: 90,
        baselineEgfr: 90
      }
    };
    
    const result = calculateAkiRisk(patient, 'guideline');
    
    expect(result.level).toBe('low');
    expect(result.score).toBeLessThan(0.5);
    expect(result.guideline).toContain('NICE NG148');
  });

  test('should detect AKI Stage 1 with 1.5x creatinine rise', () => {
    const patient = {
      labs: {
        currentCreatinine: 120,
        baselineCreatinine: 80
      }
    };
    
    const result = calculateAkiRisk(patient, 'guideline');
    
    expect(result.stage).toBe(1);
    expect(result.level).toBe('moderate');
    expect(result.factors.length).toBeGreaterThan(0);
  });

  test('should handle missing baseline values gracefully', () => {
    const patient = {
      labs: { currentCreatinine: 150 }
    };
    
    const result = calculateAkiRisk(patient, 'guideline');
    
    expect(result.level).toBeDefined();
    expect(result.score).toBeGreaterThanOrEqual(0);
  });
});
```

#### 2.3.2 Edge Case Tests
```javascript
describe('Edge Cases and Error Handling', () => {
  test('should handle empty patient data', () => {
    const patient = {};
    
    const result = calculateAkiRisk(patient, 'guideline');
    
    expect(result.level).toBeDefined();
    expect(result.factors).toEqual([]);
  });

  test('should handle null/undefined values', () => {
    const patient = {
      labs: {
        currentCreatinine: null,
        baselineCreatinine: undefined
      }
    };
    
    const result = calculateAkiRisk(patient, 'guideline');
    
    expect(result.score).toBe(0);
  });

  test('should default to guideline mode if not specified', () => {
    const patient = { labs: { currentCreatinine: 150 } };
    
    const result = calculateAkiRisk(patient);
    
    expect(result.mode).toBeDefined();
  });
});
```

#### 2.3.3 Clinical Validation Tests
```javascript
describe('Clinical Validation', () => {
  test('CURB-65 score calculation matches manual calculation', () => {
    const patient = {
      age: 70,               // +1
      vitals: {
        systolicBp: 95,      // +1
        rr: 35               // +1
      },
      labs: { urea: 10 },    // +1
      examFindings: ['confusion']  // +1
    };
    
    const result = calculatePneumonia(patient);
    
    expect(result.curb65Score).toBe(5);
    expect(result.level).toBe('high');
  });
});
```

### 2.4 Frontend Component Tests

#### 2.4.1 Component Rendering
```javascript
// frontend/src/components/__tests__/PatientSearch.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import PatientSearch from '../patient/PatientSearch';

describe('PatientSearch Component', () => {
  test('renders search input', () => {
    render(<PatientSearch onSearchChange={jest.fn()} />);
    
    const searchInput = screen.getByPlaceholderText(/search patients/i);
    expect(searchInput).toBeInTheDocument();
  });

  test('calls onSearchChange when typing', () => {
    const mockOnChange = jest.fn();
    render(<PatientSearch onSearchChange={mockOnChange} />);
    
    const searchInput = screen.getByPlaceholderText(/search patients/i);
    fireEvent.change(searchInput, { target: { value: 'Smith' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('Smith');
  });

  test('shows clear button when text is entered', () => {
    render(<PatientSearch onSearchChange={jest.fn()} />);
    
    const searchInput = screen.getByPlaceholderText(/search patients/i);
    
    expect(screen.queryByTitle('Clear search')).not.toBeInTheDocument();
    
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    expect(screen.getByTitle('Clear search')).toBeInTheDocument();
  });
});
```

#### 2.4.2 Error Boundary Tests
```javascript
describe('ErrorBoundary Component', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  test('renders children when there is no error', () => {
    const WorkingComponent = () => <div>Working</div>;
    
    render(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Working')).toBeInTheDocument();
  });

  test('renders error message when child component throws', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
});
```

---

## 3. Integration Testing

### 3.1 API Endpoint Tests

```javascript
// backend/__tests__/integration/api.test.js
const request = require('supertest');
const app = require('../../src/server');

describe('API Endpoints', () => {
  describe('GET /api/patients', () => {
    test('should return list of patients', async () => {
      const response = await request(app)
        .get('/api/patients')
        .expect(200)
        .expect('Content-Type', /json/);
      
      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('should return patients with required fields', async () => {
      const response = await request(app)
        .get('/api/patients');
      
      const patient = response.body.data[0];
      expect(patient).toHaveProperty('id');
      expect(patient).toHaveProperty('name');
      expect(patient).toHaveProperty('age');
    });
  });

  describe('GET /api/patients/:id', () => {
    test('should return patient with risks', async () => {
      const response = await request(app)
        .get('/api/patients/p001?mode=guideline')
        .expect(200);
      
      expect(response.body.status).toBe('success');
      expect(response.body.data.patient).toBeDefined();
      expect(response.body.data.risks).toBeDefined();
      expect(response.body.data.diagnoses).toBeDefined();
    });

    test('should return 404 for non-existent patient', async () => {
      const response = await request(app)
        .get('/api/patients/p999')
        .expect(404);
      
      expect(response.body.status).toBe('error');
    });

    test('should validate patient ID format', async () => {
      const response = await request(app)
        .get('/api/patients/invalid')
        .expect(400);
      
      expect(response.body.status).toBe('error');
    });
  });

  describe('Rate Limiting', () => {
    test('should rate limit after 100 requests', async () => {
      // Make 101 requests
      for (let i = 0; i < 101; i++) {
        await request(app).get('/api/patients');
      }
      
      const response = await request(app)
        .get('/api/patients')
        .expect(429);
      
      expect(response.body.message).toMatch(/rate limit/i);
    });
  });
});
```

### 3.2 Data Flow Tests

```javascript
describe('Risk Calculation Data Flow', () => {
  test('should calculate all 12 risks for complete patient', async () => {
    const response = await request(app)
      .get('/api/patients/p001?mode=guideline');
    
    const risks = response.body.data.risks;
    
    // All 12 risk types should be present
    expect(risks.aki).toBeDefined();
    expect(risks.sepsis).toBeDefined();
    expect(risks.vte).toBeDefined();
    expect(risks.delirium).toBeDefined();
    expect(risks.falls).toBeDefined();
    expect(risks.pressureUlcer).toBeDefined();
    expect(risks.respiratoryFailure).toBeDefined();
    expect(risks.cardiacArrest).toBeDefined();
    expect(risks.electrolyte).toBeDefined();
    expect(risks.medicationHarm).toBeDefined();
    expect(risks.malnutrition).toBeDefined();
    expect(risks.bleeding).toBeDefined();
    
    // Each risk should have required structure
    Object.values(risks).forEach(risk => {
      if (risk.overall) return; // Skip overall risk
      expect(risk).toHaveProperty('score');
      expect(risk).toHaveProperty('level');
      expect(risk).toHaveProperty('factors');
      expect(risk).toHaveProperty('guideline');
    });
  });
});
```

---

## 4. Test Data Management

### 4.1 Test Fixtures

```javascript
// __tests__/fixtures/patients.js
export const mockPatients = {
  normalValues: {
    id: 'test001',
    name: 'Test Patient',
    age: 50,
    labs: {
      currentCreatinine: 80,
      baselineCreatinine: 80,
      currentEgfr: 90,
      baselineEgfr: 90,
      wbc: 7,
      crp: 3,
      potassium: 4.0
    },
    vitals: {
      news2: 1,
      hr: 75,
      rr: 14,
      systolicBp: 120,
      temp: 37.0,
      spo2: 98
    }
  },
  
  highRisk: {
    id: 'test002',
    name: 'High Risk Patient',
    age: 85,
    labs: {
      currentCreatinine: 250,
      wbc: 18,
      crp: 220,
      potassium: 6.0
    },
    vitals: {
      news2: 9,
      hr: 125,
      rr: 30,
      systolicBp: 85,
      temp: 39.5,
      spo2: 88
    }
  }
};
```

### 4.2 Factory Functions

```javascript
// __tests__/factories/patientFactory.js
export const createPatient = (overrides = {}) => {
  return {
    id: 'test-' + Math.random(),
    name: 'Test Patient',
    age: 50,
    sex: 'M',
    labs: {},
    vitals: {},
    ...overrides
  };
};

// Usage
const patient = createPatient({
  age: 85,
  labs: { currentCreatinine: 200 }
});
```

---

## 5. Mocking

### 5.1 API Mocking (Frontend Tests)

```javascript
// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      status: 'success',
      data: mockPatients
    })
  })
);

test('usePatients hook fetches data', async () => {
  const { result, waitForNextUpdate } = renderHook(() => usePatients());
  
  expect(result.current.loading).toBe(true);
  
  await waitForNextUpdate();
  
  expect(result.current.loading).toBe(false);
  expect(result.current.patients).toEqual(mockPatients);
});
```

### 5.2 Module Mocking (Backend Tests)

```javascript
// Mock patient data
jest.mock('../data/patients.json', () => [{
  id: 'p001',
  name: 'Mock Patient',
  // ...
}]);

// Mock logger
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
}));
```

---

## 6. Test Organization

### 6.1 Test File Structure
```
__tests__/
├── unit/
│   ├── backend/
│   │   ├── riskEngine.test.js
│   │   ├── diagnosisScoring.test.js
│   │   └── newsCalculator.test.js
│   └── frontend/
│       ├── utils.test.js
│       └── hooks.test.js
├── integration/
│   ├── api.test.js
│   └── dataFlow.test.js
├── components/
│   ├── PatientSearch.test.js
│   ├── ErrorBoundary.test.js
│   └── LoadingSpinner.test.js
├── fixtures/
│   ├── patients.js
│   └── risks.js
└── helpers/
    └── testUtils.js
```

### 6.2 Test Naming Convention

```javascript
// ✅ Descriptive test names
test('should calculate AKI Stage 1 for 1.5x creatinine rise', () => {});
test('should return 404 for non-existent patient', () => {});
test('should display error message when API fails', () => {});

// ❌ Vague test names
test('works', () => {});
test('test1', () => {});
test('should work correctly', () => {});
```

---

## 7. Clinical Validation

### 7.1 Clinical Test Scenarios

```javascript
describe('Clinical Scenarios', () => {
  test('Scenario: 85-year-old with sepsis', () => {
    const patient = {
      age: 85,
      presentingComplaint: 'Fever and confusion',
      labs: { wbc: 16, crp: 210, lactate: 2.8 },
      vitals: { news2: 8, temp: 39.5, hr: 125, rr: 28, systolicBp: 90 },
      cognitive: 'impaired',
      mobility: 'reduced'
    };
    
    const risks = calculateAllRisks(patient, 'guideline');
    
    // Should have high sepsis risk
    expect(risks.sepsis.level).toBe('high');
    
    // Should have high delirium risk
    expect(risks.delirium.level).toBe('high');
    
    // Should have high cardiac arrest risk
    expect(risks.cardiacArrest.level).toBe('high');
    
    // Overall risk should be high
    expect(risks.overall.level).toBe('high');
  });

  test('Scenario: DKA in young diabetic', () => {
    const patient = {
      age: 28,
      pmh: ['Type 1 diabetes'],
      presentingComplaint: 'Nausea, vomiting, abdominal pain',
      labs: { glucose: 24.5, ketones: 5.2, ph: 7.15, bicarbonate: 12 }
    };
    
    const diagnoses = calculateDiagnosisScores(patient);
    
    const dka = diagnoses.find(d => d.condition === 'Diabetic Ketoacidosis');
    expect(dka).toBeDefined();
    expect(dka.level).toBe('high');
  });
});
```

### 7.2 Guideline Compliance Tests

```javascript
describe('NICE Guideline Compliance', () => {
  test('AKI staging follows NICE NG148', () => {
    // Stage 1: 1.5-1.9x baseline
    const stage1 = calculateAkiRisk({
      labs: { currentCreatinine: 120, baselineCreatinine: 80 }
    }, 'guideline');
    expect(stage1.stage).toBe(1);
    
    // Stage 2: 2.0-2.9x baseline
    const stage2 = calculateAkiRisk({
      labs: { currentCreatinine: 180, baselineCreatinine: 80 }
    }, 'guideline');
    expect(stage2.stage).toBe(2);
    
    // Stage 3: ≥3.0x baseline
    const stage3 = calculateAkiRisk({
      labs: { currentCreatinine: 250, baselineCreatinine: 80 }
    }, 'guideline');
    expect(stage3.stage).toBe(3);
  });

  test('CURB-65 follows NICE CG191', () => {
    // Score components correct
    const patient = {
      age: 70,  // ≥65 = 1 point
      vitals: { systolicBp: 95, rr: 30 },  // Low BP = 1, High RR = 1
      labs: { urea: 10 },  // Urea >7 = 1
      examFindings: ['confusion']  // Confusion = 1
    };
    
    const result = calculatePneumonia(patient);
    expect(result.curb65Score).toBe(5);
  });
});
```

---

## 8. Performance Testing

### 8.1 Response Time Tests

```javascript
describe('Performance', () => {
  test('risk calculation should complete within 500ms', () => {
    const start = Date.now();
    
    const result = calculateAllRisks(complexPatient, 'guideline');
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(500);
  });

  test('API endpoint should respond within 3 seconds', async () => {
    const start = Date.now();
    
    await request(app).get('/api/patients/p001?mode=guideline');
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(3000);
  });
});
```

### 8.2 Load Testing

```javascript
describe('Load Testing', () => {
  test('should handle 100 concurrent requests', async () => {
    const requests = Array(100).fill().map(() =>
      request(app).get('/api/patients')
    );
    
    const responses = await Promise.all(requests);
    
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });
  });
});
```

---

## 9. Continuous Integration

### 9.1 Test Scripts

```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

### 9.2 Pre-commit Hooks

```json
// .huskyrc
{
  "hooks": {
    "pre-commit": "npm test",
    "pre-push": "npm run test:coverage"
  }
}
```

### 9.3 CI Pipeline (GitHub Actions Example)

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Check coverage
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

---

## 10. Test Documentation

### 10.1 Test Comments

```javascript
/**
 * Tests for AKI risk calculation
 * 
 * Tests cover:
 * - Normal values (no AKI)
 * - AKI Stage 1, 2, 3 detection
 * - Missing data handling
 * - NICE NG148 compliance
 */
describe('AKI Risk Calculation', () => {
  // Individual tests...
});
```

### 10.2 Coverage Reports

```bash
# Generate HTML coverage report
npm run test:coverage

# View report
open coverage/lcov-report/index.html
```

### 10.3 Test Documentation Files

```
docs/
├── testing-strategy.md
├── clinical-test-scenarios.md
└── test-coverage-report.md
```

---

## 11. Quality Gates

### 11.1 Minimum Requirements for Merge

- ✅ All tests pass
- ✅ Coverage ≥ 80% overall
- ✅ Coverage ≥ 95% for risk calculations
- ✅ No linter errors
- ✅ All critical clinical scenarios tested
- ✅ API endpoints have integration tests

### 11.2 Coverage Thresholds

```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/services/riskEngine.js': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    }
  }
};
```

---

## 12. Test Maintenance

### 12.1 Regular Reviews
- **Weekly**: Review failed tests
- **Monthly**: Update test data
- **Quarterly**: Review coverage gaps
- **Annually**: Clinical validation review

### 12.2 Test Refactoring
- Remove duplicate tests
- Extract common test utilities
- Update fixtures when data model changes
- Keep tests fast (<5ms per unit test)

### 12.3 Documentation Updates
- Update test docs when features change
- Document new clinical scenarios
- Maintain test coverage reports

---

**These testing rules ensure clinical safety, reliability, and maintainability. All code must be tested before deployment.**

