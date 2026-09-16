import React from 'react';

function InputField({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  icon,
  disabled = false,
  inputRef,
  autoComplete,
  onKeyDown,
}) {
  return (
    <div className="field-group">
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className={`field-shell ${error ? 'field-shell-error' : ''}`}>
        {icon ? <span className="field-icon" aria-hidden="true">{icon}</span> : null}
        <input
          ref={inputRef}
          id={id}
          name={name}
          type={type}
          className="field-input"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          onKeyDown={onKeyDown}
        />
      </div>
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}

export default InputField;
