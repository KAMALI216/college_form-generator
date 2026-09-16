import React from 'react';

function Loader({ label = 'Loading...' }) {
  return (
    <span className="loader-inline" aria-live="polite" aria-label={label}>
      <span className="loader-spinner" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

export default Loader;
