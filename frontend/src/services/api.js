/**
 * API Service
 * Centralized API calls
 */

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000/api';

/**
 * Generic fetch wrapper with error handling
 */
const fetchAPI = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Get all patients
 */
export const getAllPatients = async () => {
  const response = await fetchAPI('/patients');
  return response.data || response;
};

/**
 * Get single patient with risk scores
 */
export const getPatientById = async (id, mode = 'guideline') => {
  const response = await fetchAPI(`/patients/${id}?mode=${mode}`);
  return response.data || response;
};

/**
 * Search patients
 */
export const searchPatients = async (query) => {
  const response = await fetchAPI(`/patients/search?q=${encodeURIComponent(query)}`);
  return response.data || response;
};

/**
 * Health check
 */
export const checkHealth = async () => {
  return await fetchAPI('/health');
};

