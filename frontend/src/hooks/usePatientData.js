/**
 * Custom Hook: usePatientData
 * Handles fetching detailed patient data with risk scores
 */

import { useState, useEffect } from 'react';
import { getPatientById } from '../services/api';

export const usePatientData = (patientId, mode) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!patientId) {
      setData(null);
      return;
    }

    const fetchPatientData = async () => {
      try {
        setLoading(true);
        setError(null);
        const patientData = await getPatientById(patientId, mode);
        setData(patientData);
      } catch (err) {
        setError(err.message || 'Failed to fetch patient data');
        console.error('Error fetching patient data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId, mode]);

  return { data, loading, error };
};

