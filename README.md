# AI Results Risk Prototype

A clinical decision support prototype that assesses patient risk for various conditions using NICE/NHSE guidelines. Displays patient vitals, labs, NEWS2 scores, and diagnosis risk scoring in an EPR-style interface.

⚠️ **NOT FOR CLINICAL USE** - This is a demonstration prototype only.

## Features

### Clinical Risk Assessment
- **AKI Detection**: NICE NG148 / NHSE AKI algorithm
- **Sepsis Risk**: NICE NG51 sepsis risk stratification using NEWS2
- **Heart Failure**: NICE NG106 assessment with NT-proBNP and LVEF
- **Pulmonary Embolism**: NICE NG158 with Wells score and D-dimer
- **Diabetic Ketoacidosis**: NICE NG18 criteria
- **Acute Coronary Syndrome**: NICE NG185 with troponin and ECG
- **Pneumonia**: NICE NG138 with CURB-65 scoring
- **Stroke/TIA**: NICE NG128 with FAST criteria

### NEWS2 Scoring
- Full NEWS2 (National Early Warning Score) calculation
- Individual parameter scoring
- Risk level categorization
- Clinical response recommendations

### User Interface
- Modern EPR-style design
- Compact patient banner with demographics and alerts
- Collapsible sections for all data
- Abnormal value indicators
- Color-coded risk levels
- Search and filtering capabilities

## Architecture

### Backend
- **Framework**: Node.js + Express
- **Features**:
  - RESTful API
  - Input validation
  - Error handling
  - Request logging (Winston)
  - Caching (node-cache)
  - Rate limiting
  - Security (Helmet)

### Frontend
- **Framework**: React 19
- **State Management**: Context API
- **Custom Hooks**: Data fetching, patient management
- **Components**: Modular, reusable components
- **Error Handling**: Error boundaries
- **UI/UX**: Loading states, collapsible sections

## Prerequisites

- Node.js 18+ 
- npm or yarn
- (Optional) Docker and Docker Compose

## Quick Start

### Option 1: Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-results-risk-prototype-2
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm run dev
   ```
   Backend will run on http://localhost:4000

3. **Setup Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   npm start
   ```
   Frontend will run on http://localhost:3000

### Option 2: Docker

```bash
# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Build and run
docker-compose up --build
```

## Project Structure

```
ai-results-risk-prototype-2/
├── backend/
│   ├── src/
│   │   ├── config/           # Configuration management
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Express middleware
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   │   ├── newsCalculator.js
│   │   │   └── ...
│   │   ├── utils/            # Utilities (logger, cache)
│   │   ├── data/             # Patient data
│   │   ├── diagnosisScoring.js
│   │   ├── riskEngine.js
│   │   └── server.js
│   ├── tests/
│   ├── Dockerfile
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/       # Reusable UI components
    │   │   ├── layout/       # Layout components
    │   │   ├── patient/      # Patient-related components
    │   │   └── clinical/     # Clinical data components
    │   ├── contexts/         # React Context
    │   ├── hooks/            # Custom hooks
    │   ├── services/         # API service
    │   ├── utils/            # Utility functions
    │   ├── App.js
    │   └── index.js
    ├── public/
    ├── Dockerfile
    ├── nginx.conf
    └── package.json
```

## API Documentation

### Endpoints

#### `GET /api/health`
Health check endpoint

**Response:**
```json
{
  "status": "success",
  "message": "API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

#### `GET /api/patients`
Get all patients (summary)

**Response:**
```json
{
  "status": "success",
  "results": 10,
  "data": [
    {
      "id": "p001",
      "name": "George Smith",
      "age": 65,
      "sex": "M",
      "presentingComplaint": "Fever and confusion"
    }
  ]
}
```

#### `GET /api/patients/:id`
Get detailed patient data with risk scores

**Parameters:**
- `id` (string): Patient identifier (format: p001, p002, etc.)
- `mode` (query, optional): "demo" or "guideline" (default: "guideline")

**Response:**
```json
{
  "status": "success",
  "data": {
    "mode": "guideline",
    "patient": {
      "id": "p001",
      "name": "George Smith",
      "age": 65,
      "sex": "M",
      "presentingComplaint": "Fever and confusion",
      "labs": {...},
      "vitals": {...},
      "news2": {
        "totalScore": 7,
        "riskLevel": "high",
        "clinicalResponse": "..."
      }
    },
    "risks": {
      "aki": {...},
      "sepsis": {...},
      "overall": {...}
    },
    "diagnoses": [
      {
        "condition": "Pneumonia",
        "guideline": "NICE NG138",
        "curb65Score": 3,
        "score": 0.8,
        "level": "high",
        "factors": [...]
      }
    ]
  }
}
```

#### `GET /api/patients/search?q=searchTerm`
Search patients by name or presenting complaint

**Query Parameters:**
- `q` (string): Search term

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Configuration

### Backend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 4000 |
| `NODE_ENV` | Environment | development |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:3000 |
| `RATE_LIMIT_MAX` | Max requests per window | 100 |
| `CACHE_TTL` | Cache TTL in seconds | 300 |
| `LOG_LEVEL` | Logging level | info |

### Frontend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_BASE` | Backend API URL | http://localhost:4000/api |

## Development

### Adding New Diagnosis Scoring

1. Add scoring function to `backend/src/diagnosisScoring.js`
2. Include NICE/NHSE guideline reference
3. Return scoring object with condition, score, level, factors
4. Update documentation

### Adding New Patient Data

Add patient objects to `backend/src/data/patients.json` with required fields:
- `id`, `name`, `age`, `sex`
- `presentingComplaint`
- `labs` (with appropriate values)
- `vitals` (with NEWS2 parameters)
- `pmh` (past medical history)
- `medications`
- `examFindings` (optional)

## Security Considerations

- Input validation on all endpoints
- Rate limiting to prevent abuse
- Security headers (Helmet)
- Error sanitization (no stack traces in production)
- Request logging for audit trail

## Known Limitations

1. **NOT VALIDATED FOR CLINICAL USE**
2. Uses simplified NICE/NHSE guideline implementations
3. Missing important clinical parameters (e.g., urine output for AKI)
4. No temporal aspect tracking (e.g., 48-hour windows)
5. Does not integrate with real EPR systems
6. No user authentication/authorization
7. Static patient data (no database)

## Roadmap

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] User authentication and authorization
- [ ] Temporal data tracking (trends over time)
- [ ] Integration with EPR systems (HL7/FHIR)
- [ ] Machine learning risk prediction
- [ ] Mobile responsive design
- [ ] Real-time alerts and notifications
- [ ] Clinical notes functionality
- [ ] Export to PDF/reports
- [ ] Multi-user collaboration

## Support

For issues, questions, or contributions, please open an issue on GitHub.

## License

This is a prototype for demonstration purposes. Not licensed for clinical use.

## Acknowledgments

- NICE (National Institute for Health and Care Excellence)
- NHS England
- Royal College of Physicians (NEWS2 guidelines)

---

**⚠️ IMPORTANT DISCLAIMER**: This application is a prototype for demonstration and educational purposes only. It does not replace clinical judgement and is not validated for clinical decision-making. Always follow your local clinical guidelines and protocols.

