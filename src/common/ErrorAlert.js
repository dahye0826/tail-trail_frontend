// src/components/common/ErrorAlert.js
import React from 'react';

const ErrorAlert = ({ message }) => {
  return (
    <div className="alert alert-danger" role="alert">
      <i className="bi bi-exclamation-circle-fill me-2"></i>
      {message}
    </div>
  );
};

export default ErrorAlert;