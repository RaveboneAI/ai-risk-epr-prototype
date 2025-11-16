# NICE/NHSE Diagnosis Scoring System

## Overview

This module implements simplified versions of various NICE/NHSE diagnostic criteria for common acute conditions. These are educational prototypes and **NOT for clinical use**.

## Implemented Scoring Systems

### 1. Heart Failure Assessment (NICE NG106)
**Criteria:**
- NT-proBNP levels (>2000 pg/mL = high probability)
- Clinical signs (dyspnoea, peripheral oedema)
- Echo findings (LVEF <40% = HFrEF)

**Example Patient:** p002 (Mary Jones), p010 (Linda Martinez)

### 2. Pulmonary Embolism (NICE NG158)
**Criteria:**
- Wells score for PE (including DVT signs, tachycardia, haemoptysis)
- D-dimer levels
- Previous VTE history

**Example Patient:** p005 (Robert Taylor), p008 (Patricia Garcia)

### 3. Diabetic Ketoacidosis (NICE NG18)
**Criteria:**
- Blood glucose >11 mmol/L
- Blood ketones >3 mmol/L
- pH <7.3
- Bicarbonate <15 mmol/L

**Example Patient:** p004 (Sarah Williams)

### 4. Acute Coronary Syndrome (NICE NG185)
**Criteria:**
- Chest pain characteristics
- High-sensitivity troponin levels
- ECG findings (ST elevation, ST depression, T wave changes)
- Risk factors (age, previous MI)

**Example Patients:** p003 (David Chen - STEMI), p009 (Michael O'Brien - NSTEMI)

### 5. Community-Acquired Pneumonia (NICE NG138)
**Criteria:**
- CURB-65 score:
  - Confusion
  - Urea >7 mmol/L
  - Respiratory rate ≥30
  - Blood pressure (SBP <90 or DBP ≤60)
  - Age ≥65

**Example Patients:** p001 (George Smith), p007 (James Anderson)

### 6. Stroke / TIA Assessment (NICE NG128)
**Criteria:**
- FAST criteria:
  - Facial weakness
  - Arm/limb weakness
  - Speech difficulty
- CT/MRI findings (ischaemic vs haemorrhagic)

**Example Patient:** p006 (Elizabeth Brown)

## Test Results

### Patient p003 (David Chen - STEMI)
```json
{
  "condition": "Acute Coronary Syndrome",
  "level": "high",
  "score": 1.0,
  "factors": [
    "Chest pain/discomfort present",
    "Pain radiating to arm/jaw",
    "Troponin significantly elevated (850 ng/L)",
    "⚠️ STEMI on ECG - emergency PCI indicated"
  ]
}
```

### Patient p004 (Sarah Williams - DKA)
```json
{
  "condition": "Diabetic Ketoacidosis",
  "level": "high",
  "score": 1.0,
  "factors": [
    "Blood glucose >11 mmol/L (24.5)",
    "Blood ketones >3 mmol/L (5.2) - significant ketonaemia",
    "pH <7.3 (7.15) - significant acidosis",
    "Bicarbonate <15 mmol/L (12)",
    "⚠️ DKA criteria met - urgent treatment required"
  ]
}
```

### Patient p006 (Elizabeth Brown - Stroke)
```json
{
  "condition": "Stroke / TIA",
  "level": "high",
  "score": 1.0,
  "factors": [
    "Facial weakness present (F in FAST)",
    "Arm/limb weakness present (A in FAST)",
    "⚠️ Ischaemic stroke confirmed on CT",
    "⚠️ FAST positive - urgent imaging required (Time is brain)"
  ]
}
```

### Patient p007 (James Anderson - Pneumonia)
```json
{
  "condition": "Community-Acquired Pneumonia",
  "level": "moderate",
  "score": 0.5,
  "curb65Score": 2,
  "factors": [
    "Urea >7 mmol/L (8.5) (+1 CURB-65)",
    "Age ≥65 (+1 CURB-65)",
    "Chest X-ray shows consolidation",
    "CURB-65 score: 2",
    "Moderate severity - consider hospital admission"
  ]
}
```

## Patient Test Data Summary

| Patient ID | Name | Age | Primary Condition | Key Findings |
|------------|------|-----|-------------------|--------------|
| p001 | George Smith | 65 | Sepsis/Pneumonia | CURB-65=3, NEWS2=7, High CRP |
| p002 | Mary Jones | 72 | Heart Failure | NT-proBNP 2400, LVEF 35% |
| p003 | David Chen | 58 | STEMI | Troponin 850, ST elevation on ECG |
| p004 | Sarah Williams | 28 | DKA | Glucose 24.5, Ketones 5.2, pH 7.15 |
| p005 | Robert Taylor | 45 | PE suspected | Wells 5.5, D-dimer 1250 |
| p006 | Elizabeth Brown | 79 | Stroke | FAST positive, CT shows ischaemia |
| p007 | James Anderson | 82 | Pneumonia | CURB-65=2, Consolidation on CXR |
| p008 | Patricia Garcia | 56 | PE suspected | Wells 6.5, Previous DVT, Haemoptysis |
| p009 | Michael O'Brien | 48 | NSTEMI | Troponin 28, ST depression on ECG |
| p010 | Linda Martinez | 67 | Decompensated HF | NT-proBNP 3800, LVEF 28% |

## Usage

The diagnosis scoring is automatically calculated when requesting patient data:

```javascript
GET /api/patients/:id?mode=guideline

Response includes:
{
  "patient": {...},
  "risks": {...},
  "diagnoses": [
    {
      "condition": "...",
      "guideline": "...",
      "score": 0.0-1.0,
      "level": "low|moderate|high",
      "confidence": "low|moderate|high",
      "factors": [...]
    }
  ]
}
```

## Frontend Display

Diagnosis results appear in a collapsible section titled "NICE/NHSE Diagnosis Scoring" that:
- Only displays when relevant diagnosis data is available
- Shows a warning icon (⚠️) when collapsed if high-risk diagnoses are present
- Displays each diagnosis as a card with:
  - Condition name
  - Risk level badge (LOW/MODERATE/HIGH)
  - Score (0.00-1.00)
  - Guideline reference
  - Clinical scoring systems (Wells, CURB-65, etc.)
  - Contributing factors as a list
  - Confidence level

## Important Notes

⚠️ **This is a prototype for demonstration purposes only**

- Not validated for clinical use
- Simplified versions of complex clinical decision tools
- Does not replace clinical judgement
- Missing many important clinical parameters
- Does not account for temporal aspects (e.g., 48h window for AKI)
- Should only be used for educational and development purposes

