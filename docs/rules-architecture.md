# Architecture Rules
## AI Results Risk Prototype

**Purpose:** Define code architecture patterns, structure, and technical standards for maintainable, scalable development.

---

## 1. Frontend Architecture

### 1.1 Project Structure
```
frontend/src/
├── components/
│   ├── common/           # Reusable UI components
│   │   ├── ErrorBoundary.js
│   │   ├── LoadingSpinner.js
│   │   ├── ErrorMessage.js
│   │   └── CollapsibleSection.js
│   ├── layout/          # Layout components
│   │   ├── Header.js
│   │   └── Toolbar.js
│   ├── patient/         # Patient-specific components
│   │   ├── PatientList.js
│   │   ├── PatientBanner.js
│   │   └── PatientSearch.js
│   └── clinical/        # Clinical display components
│       └── index.js     # RiskCard, DiagnosisPanel, etc.
├── contexts/            # React Context providers
│   └── AppContext.js
├── hooks/               # Custom React hooks
│   ├── usePatients.js
│   └── usePatientData.js
├── services/            # API and business logic
│   └── api.js
├── utils/               # Utility functions
│   └── constants.js
├── App.js              # Main application component
├── App.css             # Main stylesheet
└── index.js            # React entry point
```

### 1.2 Component Patterns

#### 1.2.1 Functional Components Only
```javascript
// ✅ GOOD
function MyComponent({ prop1, prop2 }) {
  return <div>{prop1}</div>;
}

// ❌ BAD - No class components
class MyComponent extends React.Component {
  render() { return <div>{this.props.prop1}</div>; }
}
```

#### 1.2.2 Component File Structure
```javascript
/**
 * Component Name
 * Brief description of purpose
 */

import React from 'react';
// Other imports...

// Helper functions (if any)
const helperFunction = () => { /*...*/ };

// Main component
const MyComponent = ({ prop1, prop2 }) => {
  // Hooks first
  const [state, setState] = useState();
  
  // Event handlers
  const handleClick = () => { /*...*/ };
  
  // Render
  return (
    <div className="my-component">
      {/* JSX */}
    </div>
  );
};

export default MyComponent;
```

#### 1.2.3 Prop Types
```javascript
// ✅ GOOD - Destructure props, provide defaults
const MyComponent = ({ 
  title, 
  items = [], 
  onSelect = () => {},
  isLoading = false 
}) => {
  // ...
};

// ❌ BAD - No prop destructuring
const MyComponent = (props) => {
  return <div>{props.title}</div>;
};
```

### 1.3 State Management

#### 1.3.1 Local State (useState)
```javascript
// ✅ For component-specific state
const [isExpanded, setIsExpanded] = useState(true);
const [searchTerm, setSearchTerm] = useState('');
```

#### 1.3.2 Context API
```javascript
// ✅ For global/shared state
// contexts/AppContext.js
export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Usage
const { state, dispatch } = useContext(AppContext);
```

#### 1.3.3 State Management Rules
- **Local state** for UI-only state (expanded, focused, etc.)
- **Context** for shared application state (selected patient, mode)
- **Props** for parent-to-child data flow
- **Callbacks** for child-to-parent communication

### 1.4 Custom Hooks

#### 1.4.1 Hook Pattern
```javascript
// ✅ hooks/usePatients.js
export const usePatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch logic
  }, []);

  return { patients, loading, error };
};

// Usage
const { patients, loading, error } = usePatients();
```

#### 1.4.2 Hook Rules
- Prefix with `use` (usePatients, usePatientData)
- Return object for multiple values
- Handle loading and error states
- Include cleanup in useEffect if needed

### 1.5 API Integration

#### 1.5.1 API Service Layer
```javascript
// services/api.js
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000/api';

const fetchAPI = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const getAllPatients = async () => {
  const response = await fetchAPI('/patients');
  return response.data || response;
};
```

#### 1.5.2 API Rules
- **Centralize** all API calls in `services/api.js`
- **Handle errors** gracefully with try/catch
- **Extract data** from structured responses `{status, data}`
- **Type safety** with JSDoc or TypeScript (future)

### 1.6 Error Handling

#### 1.6.1 Error Boundaries
```javascript
// ✅ Wrap app in ErrorBoundary
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

#### 1.6.2 Error Display
```javascript
// ✅ Show user-friendly errors
{error && (
  <ErrorMessage 
    message={error}
    onRetry={() => refetch()}
  />
)}
```

---

## 2. Backend Architecture

### 2.1 Project Structure
```
backend/src/
├── config/              # Configuration
│   └── index.js
├── controllers/         # Route handlers
│   └── patientController.js
├── middleware/          # Express middleware
│   ├── errorHandler.js
│   ├── validation.js
│   └── requestLogger.js
├── routes/              # API routes
│   └── api.js
├── services/            # Business logic
│   ├── riskEngine.js
│   ├── diagnosisScoring.js
│   └── newsCalculator.js
├── utils/               # Utilities
│   ├── logger.js
│   └── cache.js
├── data/                # Data storage
│   └── patients.json
└── server.js            # Express app entry point
```

### 2.2 Layered Architecture

```
┌─────────────────────┐
│  Routes (API)       │  ← Define endpoints
├─────────────────────┤
│  Controllers        │  ← Handle requests
├─────────────────────┤
│  Services           │  ← Business logic
├─────────────────────┤
│  Data Layer         │  ← Data access
└─────────────────────┘
```

### 2.3 Express Server Pattern

#### 2.3.1 Server Setup
```javascript
// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors(config.cors));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));

// Logging
app.use(requestLogger);

// Routes
app.use('/api', apiRoutes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});
```

#### 2.3.2 Route Definition
```javascript
// routes/api.js
const express = require('express');
const router = express.Router();
const { validatePatientId } = require('../middleware/validation');
const { getPatients, getPatientById } = require('../controllers/patientController');

router.get('/patients', getPatients);
router.get('/patients/:id', validatePatientId, getPatientById);

module.exports = router;
```

#### 2.3.3 Controller Pattern
```javascript
// controllers/patientController.js
const patientService = require('../services/patientService');

exports.getPatients = async (req, res, next) => {
  try {
    const patients = await patientService.getAllPatients();
    res.json({
      status: 'success',
      results: patients.length,
      data: patients
    });
  } catch (error) {
    next(error);
  }
};
```

#### 2.3.4 Service Pattern
```javascript
// services/riskEngine.js
function calculateAkiRisk(patient, mode) {
  // Business logic here
  return {
    guideline: 'NICE NG148',
    score: normalizedScore,
    level: riskLevel(score),
    factors: factors
  };
}

module.exports = {
  calculateAllRisks,
  calculateAkiRisk,
  // ...other exports
};
```

### 2.4 API Response Format

#### 2.4.1 Success Response
```javascript
// ✅ Standard format
{
  "status": "success",
  "results": 10,          // Optional: count
  "data": {/* payload */}
}
```

#### 2.4.2 Error Response
```javascript
// ✅ Standard format
{
  "status": "error",
  "message": "Patient not found",
  "code": "PATIENT_NOT_FOUND"  // Optional
}
```

### 2.5 Error Handling

#### 2.5.1 Error Middleware
```javascript
// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  logger.error(err.stack);
  
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal server error'
  });
};
```

#### 2.5.2 Custom Errors
```javascript
// utils/errors.js
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
    this.name = 'ValidationError';
  }
}
```

### 2.6 Logging

#### 2.6.1 Winston Logger
```javascript
// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});
```

#### 2.6.2 Logging Rules
- **INFO**: Request logging, startup
- **WARN**: Deprecated usage, unusual patterns
- **ERROR**: Exceptions, failures
- **DEBUG**: Development only

---

## 3. Clinical Logic

### 3.1 Risk Calculation Pattern

```javascript
// ✅ Standard risk calculation structure
function calculateRiskName(patient, mode = 'guideline') {
  const { relevantData } = patient;
  let score = 0;
  const factors = [];
  
  // Calculation logic
  if (condition) {
    score += weight;
    factors.push('Description of factor');
  }
  
  // Normalize score
  const normalizedScore = clamp01(score);
  
  // Return standard structure
  return {
    guideline: 'NICE/NHSE Reference',
    score: normalizedScore,
    level: riskLevel(normalizedScore),
    factors: factors,
    [specificScore]: rawScore  // Optional: e.g., paduaScore, mustScore
  };
}
```

### 3.2 Risk Level Classification

```javascript
// ✅ Consistent classification
function riskLevel(score) {
  if (score >= 0.7) return "high";
  if (score >= 0.4) return "moderate";
  return "low";
}

// Score normalization
function clamp01(score) {
  return Math.max(0, Math.min(1, score));
}
```

### 3.3 Clinical Guidelines Reference

```javascript
// ✅ Always include guideline reference
return {
  guideline: 'NICE NG148 - Acute kidney injury (simplified)',
  // ...
};
```

---

## 4. Data Management

### 4.1 Patient Data Structure

```javascript
// ✅ Standard patient object
{
  // Demographics
  id: string,
  name: string,
  age: number,
  sex: "M" | "F",
  bmi: number,
  
  // Medical history
  pmh: string[],
  medications: string[],
  allergies: string[],
  alerts: string[],
  
  // Current status
  presentingComplaint: string,
  mobility: "normal" | "reduced" | "uses aid" | "chair-bound" | "bedbound",
  cognitive: "normal" | "impaired",
  nutrition: "good" | "adequate" | "poor",
  continence: "continent" | "incontinent",
  skinCondition: "healthy" | "fragile" | "broken",
  weightLoss: "none" | "5-10%" | ">10%",
  acuteDisease: boolean,
  
  // Clinical data
  labs: { /* lab values */ },
  vitals: { /* vital signs */ },
  imaging: [{ type, date, findings, reporter }],
  clinicalAssessments: [{ type, date, score, result, assessor, notes }],
  examFindings: string[]
}
```

### 4.2 Data Validation

```javascript
// middleware/validation.js
const { param, validationResult } = require('express-validator');

const validatePatientId = [
  param('id').matches(/^p\d{3}$/),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
```

### 4.3 Data Storage (Current: JSON, Future: Database)

```javascript
// ✅ Current: JSON file
const patients = require('../data/patients.json');

// ✅ Future: Database abstraction
// services/patientRepository.js
class PatientRepository {
  async findAll() { /* DB query */ }
  async findById(id) { /* DB query */ }
  async update(id, data) { /* DB query */ }
}
```

---

## 5. Security

### 5.1 Input Validation
```javascript
// ✅ Validate all inputs
const { body, validationResult } = require('express-validator');

const validatePatientData = [
  body('age').isInt({ min: 0, max: 120 }),
  body('bmi').isFloat({ min: 10, max: 100 }),
  // ...
];
```

### 5.2 Sanitization
```javascript
// ✅ Sanitize HTML content
const sanitizeHtml = require('sanitize-html');

const cleanContent = sanitizeHtml(userInput, {
  allowedTags: [],
  allowedAttributes: {}
});
```

### 5.3 Rate Limiting
```javascript
// ✅ Protect against abuse
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100                    // Max 100 requests per window
});
```

### 5.4 CORS Configuration
```javascript
// ✅ Restrict origins
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
};
app.use(cors(corsOptions));
```

---

## 6. Performance

### 6.1 Caching Strategy

```javascript
// utils/cache.js
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // 5 min default

exports.get = (key) => cache.get(key);
exports.set = (key, value, ttl) => cache.set(key, value, ttl);
```

### 6.2 Memoization (Frontend)

```javascript
// ✅ Memoize expensive calculations
const filteredPatients = useMemo(() => {
  return allPatients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
}, [allPatients, searchTerm]);
```

### 6.3 Lazy Loading

```javascript
// ✅ Code splitting (future)
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

<Suspense fallback={<LoadingSpinner />}>
  <HeavyComponent />
</Suspense>
```

---

## 7. Testing

### 7.1 Test Structure

```
__tests__/
├── unit/              # Unit tests
│   ├── riskEngine.test.js
│   └── diagnosisScoring.test.js
├── integration/       # API tests
│   └── api.test.js
└── components/        # Component tests
    ├── PatientSearch.test.js
    └── ErrorBoundary.test.js
```

### 7.2 Test Patterns

```javascript
// ✅ Unit test pattern
describe('calculateAkiRisk', () => {
  test('should detect high risk for elevated creatinine', () => {
    const patient = { labs: { currentCreatinine: 250 } };
    const result = calculateAkiRisk(patient, 'guideline');
    expect(result.level).toBe('high');
  });
});

// ✅ Component test pattern
describe('PatientSearch', () => {
  test('calls onSearchChange when typing', () => {
    const mockOnChange = jest.fn();
    render(<PatientSearch onSearchChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'Smith' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('Smith');
  });
});
```

---

## 8. Code Style

### 8.1 Naming Conventions

```javascript
// ✅ Components: PascalCase
PatientBanner, RiskCard, LoadingSpinner

// ✅ Functions: camelCase
calculateRisk, formatDate, handleClick

// ✅ Constants: UPPER_SNAKE_CASE
API_BASE, MAX_RETRIES, DEFAULT_TIMEOUT

// ✅ Files: kebab-case or camelCase
patient-controller.js, riskEngine.js

// ✅ CSS classes: kebab-case with prefix
.sc-patient-banner, .sc-risk-card
```

### 8.2 File Naming

```
// Components
PatientBanner.js
PatientSearch.js

// Services
riskEngine.js
api.js

// Tests
riskEngine.test.js
PatientSearch.test.js

// CSS
App.css
PatientSearch.css
```

### 8.3 Code Comments

```javascript
// ✅ File header
/**
 * Risk Engine Service
 * Calculates condition-specific risks using NICE/NHSE guidelines
 */

// ✅ Function documentation
/**
 * Calculates AKI risk based on creatinine changes
 * @param {Object} patient - Patient data
 * @param {string} mode - 'demo' or 'guideline'
 * @returns {Object} Risk assessment with score, level, factors
 */
function calculateAkiRisk(patient, mode) {
  // Implementation
}

// ✅ Inline comments for complex logic
// Calculate percentage change from baseline
const percentageChange = ((current - baseline) / baseline) * 100;
```

---

## 9. Dependency Management

### 9.1 Package Selection Criteria
- **Maintained**: Active development, recent commits
- **Popular**: Wide adoption, good documentation
- **Lightweight**: Minimal bundle size impact
- **License**: MIT or compatible

### 9.2 Version Pinning
```json
{
  "dependencies": {
    "react": "^18.3.1",        // Allow minor/patch updates
    "express": "~4.18.0"       // Allow patch updates only
  }
}
```

### 9.3 Dependency Audit
- Run `npm audit` regularly
- Update dependencies quarterly
- Review security advisories

---

## 10. Environment Configuration

### 10.1 Environment Variables

```javascript
// Backend: config/index.js
module.exports = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000'
  }
};

// Frontend: .env
REACT_APP_API_BASE=http://localhost:4000/api
```

### 10.2 Configuration Files
- `.env` - Local development (not committed)
- `.env.example` - Template (committed)
- `config/` - Application config (committed)

---

## 11. Git Workflow

### 11.1 Branch Strategy
```
main              Production-ready code
├── develop       Integration branch
    ├── feature/  Feature branches
    ├── fix/      Bug fix branches
    └── docs/     Documentation updates
```

### 11.2 Commit Messages
```
feat: Add VTE risk calculation
fix: Correct NEWS2 score calculation
docs: Update API documentation
style: Format code with prettier
refactor: Extract risk calculations to service
test: Add unit tests for diagnosis scoring
```

---

**These architecture rules ensure consistent, maintainable, and scalable code. All new development must follow these patterns.**

