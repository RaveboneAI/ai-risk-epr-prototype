/**
 * Patient Banner Component
 * Compact EPR-style patient demographics banner
 */

import React from 'react';

const RiskBadge = ({ level }) => {
  return (
    <span className={`sc-risk-badge sc-risk-badge--${level}`}>
      {level.toUpperCase()}
    </span>
  );
};

const PatientBanner = ({ patient, risks }) => {
  return (
    <section className="sc-patient-banner">
      <div className="sc-patient-banner-main">
        <div className="sc-patient-info">
          <h2 className="sc-patient-banner-name">{patient.name}</h2>
          <div className="sc-patient-demographics">
            <span className="sc-demo-item">
              <span className="sc-demo-label">DoB:</span> 15/03/1967 (Age {patient.age})
            </span>
            <span className="sc-demo-separator">•</span>
            <span className="sc-demo-item">
              <span className="sc-demo-label">MRN:</span> 123456789
            </span>
            <span className="sc-demo-separator">•</span>
            <span className="sc-demo-item">
              <span className="sc-demo-label">Sex:</span> {patient.sex}
            </span>
            <span className="sc-demo-separator">•</span>
            <span className="sc-demo-item">
              <span className="sc-demo-label">NHS No:</span> 485 777 3456
            </span>
          </div>
        </div>
        <div className="sc-patient-alerts">
          <div className="sc-alert-badge sc-alert-allergy">
            ⚠️ Penicillin Allergy
          </div>
          <div className="sc-alert-badge sc-alert-risk">
            Falls Risk
          </div>
        </div>
        <div className="sc-overall-risk-compact">
          <span className="sc-overall-label">Overall risk</span>
          <RiskBadge level={risks.overall.level} />
          <span className="sc-overall-score">
            {risks.overall.score.toFixed(2)}
          </span>
        </div>
      </div>
      <div className="sc-patient-banner-sub">
        <span className="sc-presenting-complaint">
          <strong>Presenting complaint:</strong> {patient.presentingComplaint}
        </span>
      </div>
    </section>
  );
};

export default PatientBanner;

