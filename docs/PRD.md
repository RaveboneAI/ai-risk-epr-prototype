# Product Requirements Document (PRD)
## AI Results Risk Prototype - EPR Clinical Decision Support System

**Version:** 2.0  
**Date:** November 2024  
**Status:** Production-Ready Prototype  
**Owner:** System C  

---

## 1. Executive Summary

### 1.1 Vision
A comprehensive Electronic Patient Record (EPR) risk assessment system that provides real-time clinical decision support for hospitalized patients by calculating 12 condition-specific risks, integrating NICE/NHSE diagnosis scoring, and displaying comprehensive clinical documentation.

### 1.2 Problem Statement
Healthcare professionals need rapid, evidence-based risk assessment across multiple clinical domains to:
- Identify patients at risk of deterioration
- Prevent hospital-acquired complications
- Guide appropriate interventions
- Support clinical decision-making with validated scoring systems

### 1.3 Solution
A web-based prototype that:
- Calculates 12 real-time risk assessments using NICE/NHSE guidelines
- Displays comprehensive clinical documentation (imaging, assessments, labs, vitals)
- Shows multi-disciplinary team input and attribution
- Provides expandable/collapsible information hierarchy
- Integrates validated scoring tools (MUST, Waterlow, CURB-65, Wells, etc.)

---

## 2. User Personas

### 2.1 Primary Users
- **Junior Doctors (F1/F2)**: Need quick risk overview during ward rounds
- **Ward Nurses**: Monitor deteriorating patients, document assessments
- **Consultant Physicians**: Review complex cases, make treatment decisions
- **Specialty Registrars**: Assess admission risk, plan investigations

### 2.2 Secondary Users
- **Pharmacists**: Review medication-related harm risk
- **Dietitians**: Monitor malnutrition risk (MUST scores)
- **Physiotherapists**: Assess falls and mobility risk
- **Tissue Viability Nurses**: Monitor pressure ulcer risk

---

## 3. Functional Requirements

### 3.1 Patient Management
**REQ-PAT-001**: System shall display list of 10+ patients with demographics  
**REQ-PAT-002**: System shall show presenting complaint for each patient  
**REQ-PAT-003**: System shall filter patients by search (name/complaint)  
**REQ-PAT-004**: System shall highlight selected patient with visual distinction  

### 3.2 Risk Assessment Engine
**REQ-RISK-001**: System shall calculate 12 condition-specific risks:
1. Acute Kidney Injury (AKI) - NICE NG148
2. Sepsis - NICE NG51
3. VTE (DVT/PE) - Padua Score, NICE NG89
4. Delirium - 4AT/DELPHI, NICE CG103
5. Falls - STRATIFY, NICE CG161
6. Pressure Ulcers - Waterlow, NICE CG179
7. Acute Respiratory Failure
8. Cardiac Arrest - NCAA indicators
9. Electrolyte Disturbance
10. Medication-Related Harm
11. Malnutrition - MUST, NICE CG32
12. Bleeding Risk - HAS-BLED

**REQ-RISK-002**: Each risk shall have score (0-1), level (low/moderate/high), guideline reference, and contributing factors  
**REQ-RISK-003**: Overall risk score shall be maximum of all individual risks  
**REQ-RISK-004**: System shall support two modes: Demo rules vs. Guideline-based  

### 3.3 Diagnosis Scoring
**REQ-DIAG-001**: System shall calculate NICE/NHSE diagnosis scores:
- Heart Failure - NICE NG106
- Pulmonary Embolism - Wells Score, NICE NG158
- Diabetic Ketoacidosis - Joint British Diabetes Societies
- Acute Coronary Syndrome - NICE CG95
- Community-Acquired Pneumonia - CURB-65, NICE CG191
- Stroke/TIA - FAST criteria, NICE CG68

**REQ-DIAG-002**: Only display diagnoses with moderate/high probability  
**REQ-DIAG-003**: Show specific scores (Wells, CURB-65) where applicable  

### 3.4 Clinical Documentation
**REQ-DOC-001**: System shall display imaging reports with:
- Type (CXR, CT, ECG, Echo, Doppler, ABG)
- Date/time stamp
- Detailed findings
- Reporter name and role

**REQ-DOC-002**: System shall display clinical assessments with:
- Assessment type (MUST, Waterlow, 4AT, STRATIFY, etc.)
- Score/result
- Date/time stamp
- Assessor name and role
- Clinical notes

**REQ-DOC-003**: System shall attribute risks to source documentation  
Example: "MUST score of 5 documented by Dietitian L. Green on 15 Nov 2024"

### 3.5 Laboratory Results
**REQ-LAB-001**: System shall display lab values with reference ranges  
**REQ-LAB-002**: System shall flag abnormal values with visual indicators (▲/▼)  
**REQ-LAB-003**: System shall include: Creatinine, eGFR, WBC, CRP, Potassium, Sodium, Hb, Urea  

### 3.6 Vital Signs & NEWS2
**REQ-VIT-001**: System shall display NEWS2 Early Warning Score table  
**REQ-VIT-002**: System shall calculate individual parameter scores  
**REQ-VIT-003**: System shall show total NEWS2 with risk stratification:
- 0-4: LOW (green)
- 5-6: MEDIUM (amber)
- 7+: HIGH (red)

**REQ-VIT-004**: System shall include: RR, SpO2, O2 therapy, Temp, BP, HR, AVPU

### 3.7 Patient Banner
**REQ-BAN-001**: System shall display patient demographics:
- Name, Age, Sex, DoB, MRN, NHS Number

**REQ-BAN-002**: System shall display allergies with count  
**REQ-BAN-003**: System shall display up to 3 clinical alerts  
**REQ-BAN-004**: System shall display overall risk score and level  
**REQ-BAN-005**: System shall show presenting complaint  

### 3.8 User Interface
**REQ-UI-001**: All sections shall be expandable/collapsible  
**REQ-UI-002**: Collapsed sections shall show warning indicators if abnormal  
**REQ-UI-003**: System shall use consistent color coding:
- Low risk: Green (#16a34a)
- Moderate risk: Amber (#f59e0b)
- High risk: Red (#dc2626)
- Theme color: Teal (#4F958B)

**REQ-UI-004**: Section order shall be:
1. Patient Banner
2. Condition-specific risk (12 assessments)
3. NICE/NHSE Diagnosis Scoring (if present)
4. Imaging & Investigations
5. Clinical Assessments & Documentation
6. Laboratory Results
7. Vitals & Early Warning Score (NEWS2)

---

## 4. Non-Functional Requirements

### 4.1 Performance
**REQ-PERF-001**: Patient list shall load within 2 seconds  
**REQ-PERF-002**: Patient details shall load within 3 seconds  
**REQ-PERF-003**: Risk calculations shall complete within 500ms  

### 4.2 Usability
**REQ-USE-001**: Interface shall follow NHS Digital Service Manual patterns  
**REQ-USE-002**: All text shall be readable (WCAG AA contrast)  
**REQ-USE-003**: System shall be responsive down to 1024px width  

### 4.3 Security
**REQ-SEC-001**: System shall include CORS protection  
**REQ-SEC-002**: System shall use Helmet.js security headers  
**REQ-SEC-003**: System shall rate limit API requests (100/15min)  
**REQ-SEC-004**: System shall validate and sanitize all inputs  

### 4.4 Reliability
**REQ-REL-001**: System shall handle missing data gracefully  
**REQ-REL-002**: System shall display error messages for failed API calls  
**REQ-REL-003**: System shall cache patient list for 5 minutes  

### 4.5 Maintainability
**REQ-MAIN-001**: Code shall follow component-based architecture  
**REQ-MAIN-002**: Risk calculations shall be modular and testable  
**REQ-MAIN-003**: System shall include comprehensive documentation  

---

## 5. Technical Architecture

### 5.1 Frontend Stack
- **Framework**: React 18+
- **Language**: JavaScript (ES6+)
- **Styling**: CSS3 with CSS variables
- **State Management**: React hooks + Context API
- **HTTP Client**: Fetch API

### 5.2 Backend Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: JavaScript
- **Data Storage**: JSON files (prototype), migrate to MongoDB (production)
- **Middleware**: Helmet, CORS, express-rate-limit, express-validator

### 5.3 Architecture Patterns
- **Frontend**: Component-based, custom hooks, error boundaries
- **Backend**: Services layer, controllers, middleware, routes
- **API**: RESTful, structured responses `{status, data}`

---

## 6. Data Model

### 6.1 Patient Object
```javascript
{
  id: string,
  name: string,
  age: number,
  sex: "M" | "F",
  bmi: number,
  pmh: string[],              // Past medical history
  medications: string[],
  allergies: string[],
  alerts: string[],
  presentingComplaint: string,
  mobility: "normal" | "reduced" | "uses aid" | "chair-bound" | "bedbound",
  cognitive: "normal" | "impaired",
  nutrition: "good" | "adequate" | "poor",
  continence: "continent" | "incontinent",
  skinCondition: "healthy" | "fragile" | "broken",
  weightLoss: "none" | "5-10%" | ">10%",
  acuteDisease: boolean,
  labs: {/* lab values */},
  vitals: {/* vital signs */},
  imaging: [/* imaging reports */],
  clinicalAssessments: [/* formal assessments */],
  examFindings: string[]
}
```

### 6.2 Risk Object
```javascript
{
  guideline: string,
  score: number,          // 0-1 normalized
  level: "low" | "moderate" | "high",
  factors: string[],      // Contributing factors
  [specificScore]: number // e.g., paduaScore, mustScore
}
```

---

## 7. Clinical Guidelines Reference

### 7.1 NICE Guidelines Implemented
- NG148: Acute kidney injury (AKI)
- NG51: Sepsis recognition and management
- NG89: Venous thromboembolism prevention
- CG103: Delirium
- CG161: Falls in older people
- CG179: Pressure ulcers
- CG32: Nutrition support
- NG106: Heart failure
- NG158: Venous thromboembolic diseases
- CG95: Chest pain of recent onset (ACS)
- CG191: Pneumonia in adults
- CG68: Stroke and TIA

### 7.2 Other Clinical Tools
- Padua Prediction Score (VTE)
- Waterlow Score (pressure ulcers)
- STRATIFY (falls)
- MUST (malnutrition)
- HAS-BLED (bleeding risk)
- Wells Score (PE/DVT)
- CURB-65 (pneumonia)
- 4AT (delirium)
- NIHSS (stroke)
- NEWS2 (Early Warning Score)

---

## 8. Testing Requirements

### 8.1 Unit Tests
- All risk calculation functions
- All diagnosis scoring functions
- Utility functions (scoring, classification)
- Minimum 80% code coverage

### 8.2 Component Tests
- Patient search functionality
- Error boundaries
- Collapsible sections
- Risk card rendering

### 8.3 Integration Tests
- API endpoints
- Data flow from backend to frontend
- Error handling

### 8.4 Clinical Validation
- Each risk calculation validated against clinical scenarios
- Test cases for edge cases (missing data, extreme values)
- Comparison with manual calculations

---

## 9. Deployment

### 9.1 Development
- Backend: `node src/server.js` on port 4000
- Frontend: `npm start` on port 3000
- Hot reload enabled

### 9.2 Production (Future)
- Docker containers via docker-compose
- MongoDB for data persistence
- Nginx reverse proxy
- Environment-based configuration

---

## 10. Future Enhancements

### 10.1 Phase 2 Features
- Real-time alerts for deteriorating patients
- Risk trending over time
- Automated care bundles based on risks
- Integration with actual EPR systems
- Mobile responsive design
- Print-friendly views

### 10.2 Phase 3 Features
- Machine learning for prediction
- Natural language processing of clinical notes
- Integration with PACS for imaging
- Audit trail of risk changes
- Multi-site deployment
- User authentication and roles

---

## 11. Success Metrics

### 11.1 Clinical Metrics
- Reduction in missed deterioration
- Earlier identification of at-risk patients
- Improved compliance with guidelines
- Reduction in hospital-acquired complications

### 11.2 User Metrics
- Time to review patient risk profile
- User satisfaction scores
- System adoption rate
- Error rate reduction

### 11.3 Technical Metrics
- System uptime >99%
- API response time <500ms
- Zero data loss
- <1% error rate

---

## 12. Compliance & Safety

### 12.1 Clinical Safety
- **NOT FOR CLINICAL USE** - Prototype only
- Does not replace clinical judgement
- Not a validated medical device
- For demonstration purposes only

### 12.2 Data Protection
- No real patient data
- All data anonymized
- GDPR considerations for production
- Information governance requirements

### 12.3 Standards
- Follows NHS Digital Service Manual
- NICE guideline compliance
- DCB0129 (Clinical Risk Management) for production

---

## 13. Documentation

### 13.1 User Documentation
- Quick start guide
- Clinical guidelines reference
- Interpretation guide for scores

### 13.2 Technical Documentation
- API documentation
- Architecture diagrams
- Deployment guide
- Testing guide

### 13.3 Clinical Documentation
- Diagnosis scoring algorithms
- Risk calculation methodologies
- Clinical validation results

---

## Appendix A: Glossary

- **AKI**: Acute Kidney Injury
- **CURB-65**: Confusion, Urea, Respiratory rate, Blood pressure, age ≥65
- **MUST**: Malnutrition Universal Screening Tool
- **NEWS2**: National Early Warning Score 2
- **NICE**: National Institute for Health and Care Excellence
- **NHSE**: NHS England
- **VTE**: Venous Thromboembolism

---

**Document Control**  
Created: November 2024  
Last Updated: November 2024  
Next Review: As needed for enhancements  

