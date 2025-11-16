/**
 * Collapsible Section Component
 * Reusable collapsible section with header
 */

import React from 'react';

const CollapsibleSection = ({ 
  title, 
  isExpanded, 
  onToggle, 
  children, 
  warningIndicator = null 
}) => {
  return (
    <section className="sc-card">
      <div 
        className="sc-section-header-collapsible"
        onClick={onToggle}
      >
        <h3 className="sc-section-title">{title}</h3>
        <div className="sc-collapse-controls">
          {!isExpanded && warningIndicator && (
            <span className="sc-abnormal-indicator" title={warningIndicator.title}>
              {warningIndicator.icon}
            </span>
          )}
          <span className="sc-collapse-icon">{isExpanded ? '▼' : '▶'}</span>
        </div>
      </div>
      {isExpanded && children}
    </section>
  );
};

export default CollapsibleSection;

