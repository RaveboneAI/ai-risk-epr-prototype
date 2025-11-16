/**
 * Patient List Component
 * Displays list of patients in sidebar
 */

import React from 'react';
import PatientSearch from './PatientSearch';

const PatientList = ({ patients, selectedId, onSelectPatient, onSearchChange }) => {
  return (
    <aside className="sc-sidebar">
      <div className="sc-sidebar-header">
        <h2>Patients</h2>
        <div className="sc-patient-count">{patients.length} patient{patients.length !== 1 ? 's' : ''}</div>
      </div>
      
      <PatientSearch onSearchChange={onSearchChange} />
      
      <div className="sc-patient-list">
        {patients.map((p) => (
          <button
            key={p.id}
            className={
              "sc-patient-item" +
              (selectedId === p.id ? " sc-patient-item--active" : "")
            }
            onClick={() => onSelectPatient(p.id)}
          >
            <div className="sc-patient-name">{p.name}</div>
            <div className="sc-patient-meta">
              Age {p.age} · {p.sex}
            </div>
            <div className="sc-patient-complaint">
              {p.presentingComplaint}
            </div>
          </button>
        ))}
        {patients.length === 0 && (
          <div className="sc-empty">No patients found.</div>
        )}
      </div>
    </aside>
  );
};

export default PatientList;

