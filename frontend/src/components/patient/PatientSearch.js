/**
 * Patient Search Component
 * Search and filter patients
 */

import React, { useState } from 'react';
import './PatientSearch.css';

const PatientSearch = ({ onSearchChange }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearchChange(value);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearchChange('');
  };

  return (
    <div className="patient-search">
      <div className="search-input-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search patients by name or complaint..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        {searchTerm && (
          <button 
            className="search-clear-btn"
            onClick={handleClear}
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default PatientSearch;

