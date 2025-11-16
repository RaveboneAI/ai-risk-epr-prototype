# Running Tests

## Backend Tests

### Run All Backend Tests
```bash
cd backend
npm test
```

### Run Tests with Coverage
```bash
cd backend
npm test -- --coverage
```

### Run Specific Test File
```bash
cd backend
npm test -- riskEngine.test.js
```

### Run Tests in Watch Mode
```bash
cd backend
npm test -- --watch
```

## Frontend Tests

### Run All Frontend Tests
```bash
cd frontend
npm test
```

### Run Tests Once (CI mode)
```bash
cd frontend
CI=true npm test
```

### Run Tests with Coverage
```bash
cd frontend
npm test -- --coverage --watchAll=false
```

### Run Specific Test File
```bash
cd frontend
npm test -- PatientSearch.test.js
```

## What's Being Tested

### Backend Tests (`backend/src/services/__tests__/`)

#### Risk Engine Tests (`riskEngine.test.js`)
- ✅ Risk level classification (low/moderate/high)
- ✅ AKI detection in demo mode
- ✅ AKI staging in guideline mode (Stage 1, 2, 3)
- ✅ Sepsis risk calculation
- ✅ qSOFA criteria
- ✅ Edge cases and error handling

#### Diagnosis Scoring Tests (`diagnosisScoring.test.js`)
- ✅ Heart failure detection
- ✅ Pulmonary embolism (Wells score)
- ✅ DKA diagnosis
- ✅ Acute coronary syndrome
- ✅ Pneumonia (CURB-65)
- ✅ Stroke/TIA (FAST criteria)
- ✅ Complete diagnosis scoring workflow

### Frontend Tests (`frontend/src/components/__tests__/`)

#### PatientSearch Tests (`PatientSearch.test.js`)
- ✅ Renders search input
- ✅ Calls onChange handler
- ✅ Shows/hides clear button
- ✅ Clears search on button click
- ✅ Handles empty input
- ✅ Maintains state between renders

#### ErrorBoundary Tests (`ErrorBoundary.test.js`)
- ✅ Renders children when no error
- ✅ Catches and displays errors
- ✅ Shows custom error message

## Expected Test Results

### Backend
```
PASS  src/services/__tests__/riskEngine.test.js
  ✓ Risk Level Classification (5 tests)
  ✓ AKI Risk Calculation - Demo Mode (3 tests)
  ✓ AKI Risk Calculation - Guideline Mode (4 tests)
  ✓ Sepsis Risk Calculation - Demo Mode (3 tests)
  ✓ Sepsis Risk Calculation - Guideline Mode (2 tests)
  ✓ Edge Cases and Error Handling (3 tests)

PASS  src/services/__tests__/diagnosisScoring.test.js
  ✓ Heart Failure Diagnosis (2 tests)
  ✓ Pulmonary Embolism Diagnosis (2 tests)
  ✓ DKA Diagnosis (2 tests)
  ✓ Acute Coronary Syndrome Diagnosis (2 tests)
  ✓ Pneumonia Diagnosis (CURB-65) (2 tests)
  ✓ Stroke/TIA Diagnosis (2 tests)
  ✓ Complete Diagnosis Scoring (3 tests)

Test Suites: 2 passed, 2 total
Tests:       35 passed, 35 total
```

### Frontend
```
PASS  src/components/__tests__/PatientSearch.test.js
  ✓ PatientSearch Component (6 tests)

PASS  src/components/__tests__/ErrorBoundary.test.js
  ✓ ErrorBoundary Component (3 tests)

Test Suites: 2 passed, 2 total
Tests:       9 passed, 9 total
```

## Troubleshooting

### Backend Test Issues

**"Cannot find module"**
```bash
cd backend
npm install
```

**"Test suite failed to run"**
- Check that `jest.config.js` exists
- Verify all imports in test files are correct
- Make sure you're running from the `backend` directory

### Frontend Test Issues

**"Cannot find module '@testing-library/react'"**
```bash
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

**"matchMedia is not defined"**
- This should be fixed by `setupTests.js`
- If issue persists, check that `setupTests.js` exists

**"enzyme" errors**
- We're using React Testing Library, not Enzyme
- Make sure tests import from `@testing-library/react`

## Adding More Tests

### Backend Test Template
```javascript
describe('My Feature', () => {
  test('should do something', () => {
    const result = myFunction(input);
    expect(result).toBe(expected);
  });
});
```

### Frontend Component Test Template
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  test('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## Coverage Reports

After running tests with coverage, open:
- **Backend**: `backend/coverage/lcov-report/index.html`
- **Frontend**: `frontend/coverage/lcov-report/index.html`

## Continuous Integration

These tests are ready for CI/CD pipelines like:
- GitHub Actions
- GitLab CI
- Jenkins
- CircleCI

Example GitHub Actions workflow:
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd backend && npm install && npm test
      - run: cd frontend && npm install && CI=true npm test
```

---

**All tests are ready to run! 🧪✅**

