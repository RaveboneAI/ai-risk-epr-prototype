/**
 * Error Message Component
 */

import React from 'react';
import './ErrorMessage.css';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="error-message">
      <div className="error-message-content">
        <span className="error-icon">⚠️</span>
        <div>
          <h3>Error</h3>
          <p>{message || 'An error occurred'}</p>
        </div>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="error-retry-button">
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;

