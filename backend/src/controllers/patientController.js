/**
 * Patient Controller
 * Handles patient-related requests
 */

const patients = require('../data/patients.json');
const { calculateAllRisks } = require('../riskEngine');
const { calculateDiagnosisScores } = require('../diagnosisScoring');
const { calculateTotalNEWS2, validateVitals } = require('../services/newsCalculator');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Get list of all patients (summary view)
 */
const getAllPatients = (req, res, next) => {
  try {
    const summary = patients.map((p) => ({
      id: p.id,
      name: p.name,
      age: p.age,
      sex: p.sex,
      presentingComplaint: p.presentingComplaint,
      // Add computed risk level for filtering
      hasHighRisk: false // Will be computed if needed
    }));

    logger.info(`Retrieved ${summary.length} patients`);
    
    res.json({
      status: 'success',
      results: summary.length,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed patient data with risk scores
 */
const getPatientById = (req, res, next) => {
  try {
    const { id } = req.params;
    const mode = req.query.mode === 'demo' ? 'demo' : 'guideline';

    const patient = patients.find((p) => p.id === id);

    if (!patient) {
      return next(new AppError('Patient not found', 404));
    }

    logger.info(`Fetching patient ${id} in ${mode} mode`);

    // Validate vitals data
    const vitalsValidation = validateVitals(patient.vitals);
    if (!vitalsValidation.valid) {
      logger.warn(`Vitals validation warnings for patient ${id}:`, vitalsValidation.warnings);
    }

    // Calculate NEWS2 score
    const news2Data = patient.vitals ? calculateTotalNEWS2(patient.vitals) : null;

    // Calculate risks
    const risks = calculateAllRisks(patient, mode);

    // Calculate diagnosis scores
    const diagnoses = calculateDiagnosisScores(patient);

    // Prepare response
    const response = {
      status: 'success',
      data: {
        mode,
        patient: {
          ...patient,
          news2: news2Data
        },
        risks,
        diagnoses,
        warnings: vitalsValidation.warnings.length > 0 ? vitalsValidation.warnings : undefined
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Search patients by name or presenting complaint
 */
const searchPatients = (req, res, next) => {
  try {
    const { q, riskLevel } = req.query;

    let filteredPatients = [...patients];

    // Filter by search query
    if (q) {
      const searchTerm = q.toLowerCase();
      filteredPatients = filteredPatients.filter(p =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.presentingComplaint.toLowerCase().includes(searchTerm)
      );
    }

    // Map to summary format
    const results = filteredPatients.map(p => ({
      id: p.id,
      name: p.name,
      age: p.age,
      sex: p.sex,
      presentingComplaint: p.presentingComplaint
    }));

    logger.info(`Search query: "${q}", found ${results.length} results`);

    res.json({
      status: 'success',
      results: results.length,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPatients,
  getPatientById,
  searchPatients
};

