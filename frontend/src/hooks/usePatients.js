/**
 * Custom Hook: usePatients
 * Handles fetching and managing patient list
 */

import { useState, useEffect } from 'react';
import { getAllPatients } from '../services/api';

export const usePatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllPatients();
        setPatients(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch patients');
        console.error('Error fetching patients:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  return { patients, loading, error };
};

