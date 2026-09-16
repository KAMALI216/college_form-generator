import React, { useState } from 'react';
import { FiEye, FiEyeOff, FiLock } from 'react-icons/fi';

function PasswordField({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  onKeyDown,
}) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="field-group">
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className={`field-shell ${error ? 'field-shell-error' : ''}`}>
        <FiLock className="field-icon" aria-hidden="true" />
        <input
          id={id}
          name={name}
          className="field-input"
          type={isVisible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={name === 'password' ? 'current-password' : 'new-password'}
          disabled={disabled}
          onKeyDown={onKeyDown}
        />
        <button
          type="button"
          className="field-toggle"
          onClick={() => setIsVisible((previous) => !previous)}
          aria-label={isVisible ? 'Hide Password' : 'Show Password'}
          disabled={disabled}
        >
          {isVisible ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}

export default PasswordField;
