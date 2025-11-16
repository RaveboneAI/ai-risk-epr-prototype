/**
 * Toolbar Component
 * Mode selection toolbar
 */

import React from 'react';

const Toolbar = ({ mode, onModeChange }) => {
  const currentModeLabel =
    mode === "guideline"
      ? "Guideline-based (NICE/NHSE – simplified, prototype only)"
      : "Demo rules (heuristic, not guideline-based)";

  return (
    <div className="sc-toolbar">
      <div className="sc-toolbar-left">
        <span className="sc-toolbar-label">RISK ENGINE MODE</span>
        <div className="sc-toggle-group">
          <button
            className={
              "sc-toggle-btn" +
              (mode === "demo" ? " sc-toggle-btn--active" : "")
            }
            onClick={() => onModeChange("demo")}
          >
            Demo rules
          </button>
          <button
            className={
              "sc-toggle-btn" +
              (mode === "guideline" ? " sc-toggle-btn--active" : "")
            }
            onClick={() => onModeChange("guideline")}
          >
            Guideline-based
          </button>
        </div>
        <span className="sc-toolbar-help">{currentModeLabel}</span>
      </div>
    </div>
  );
};

export default Toolbar;

