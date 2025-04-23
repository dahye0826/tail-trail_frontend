// src/components/common/LoadingSpinner.js
import React from 'react';

const LoadingSpinner = ({ text = "로딩 중..." }) => {
  return (
    <div className="text-center py-4">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">{text}</span>
      </div>
      <p className="mt-3 text-muted">{text}</p>
    </div>
  );
};

export default LoadingSpinner;