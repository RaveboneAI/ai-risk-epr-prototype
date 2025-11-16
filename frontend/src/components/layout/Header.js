/**
 * Header Component
 * Application header with branding and environment indicator
 */

import React from 'react';

const Header = () => {
  return (
    <>
      <header className="sc-header">
        <div className="sc-header-left">
          <div className="sc-brand-name">System C</div>
          <div className="sc-header-divider"></div>
          <div>
            <div className="sc-title">AI Results Risk Prototype</div>
            <div className="sc-subtitle">
              Patient results risk view – not for clinical use
            </div>
          </div>
        </div>
        <div className="sc-header-right">
          <span className="sc-env-pill">LOCAL DEMO</span>
        </div>
      </header>

      <div className="sc-banner">
        This is a prototype for demonstration only. It does not replace clinical
        judgement or represent a validated decision support tool.
      </div>
    </>
  );
};

export default Header;

