import React, { useState } from 'react';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

/**
 * Reusable PasswordInput component.
 * @param {object} props
 * @param {string} props.label - Label for the input
 * @param {string} props.name - Name attribute of the input
 * @param {string} props.value - Controlled input value
 * @param {function} props.onChange - Change handler
 * @param {string} props.placeholder - Input placeholder
 * @param {string} props.error - Error message if validation fails
 * @param {boolean} props.required - Mark field as required
 * @param {boolean} props.disabled - Disable the input
 */
const PasswordInput = ({
  label,
  name,
  value,
  onChange,
  placeholder = '••••••••',
  error,
  required = false,
  disabled = false,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const id = `input-${name}`;

  const toggleVisibility = (e) => {
    e.preventDefault(); // Prevent form submission if in standard buttons
    setShowPassword((prev) => !prev);
  };

  return (
    <div className={`input-field-container ${error ? 'has-error' : ''}`}>
      {label && (
        <label htmlFor={id} className="input-label">
          {label} {required && <span className="required-star">*</span>}
        </label>
      )}
      <div className="input-wrapper">
        <span className="input-icon-left">
          <FaLock />
        </span>
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="input-element has-icon-left has-icon-right"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...rest}
        />
        <button
          type="button"
          onClick={toggleVisibility}
          className="password-toggle-btn"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          disabled={disabled}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      {error && (
        <span id={`${id}-error`} className="input-error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default PasswordInput;
