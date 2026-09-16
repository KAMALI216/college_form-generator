import React from 'react';

/**
 * Reusable Button component
 * @param {object} props
 * @param {string} props.type - HTML button type ('submit', 'button', 'reset')
 * @param {string} props.variant - Styling variant ('primary', 'secondary', 'reset')
 * @param {boolean} props.loading - Display loading spinner and disable button
 * @param {boolean} props.disabled - Disable button
 * @param {React.ReactNode} props.children - Button label/content
 * @param {function} props.onClick - Click handler
 */
const Button = ({
  type = 'button',
  variant = 'primary',
  loading = false,
  disabled = false,
  children,
  onClick,
  ...rest
}) => {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${loading ? 'btn-loading' : ''}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className="btn-loading-wrapper">
          <svg className="spinner" viewBox="0 0 50 50" aria-hidden="true">
            <circle
              className="path"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth="5"
            ></circle>
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
