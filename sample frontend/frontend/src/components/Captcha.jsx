import React, { useEffect, useState } from 'react';
import { FiRefreshCw, FiShield } from 'react-icons/fi';
import { generateCaptcha } from '../utils/captchaGenerator';

function Captcha({ value, onChange, onCaptchaGenerated, error, disabled = false }) {
  const [captcha, setCaptcha] = useState('');

  const refreshCaptcha = () => {
    const next = generateCaptcha(5);
    setCaptcha(next);
    onCaptchaGenerated(next);
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  return (
    <div className="field-group">
      <label className="field-label" htmlFor="captchaInput">
        CAPTCHA
      </label>
      <div className="captcha-row">
        <div className="captcha-box" aria-live="polite">
          {captcha}
        </div>
        <button
          type="button"
          className="captcha-refresh"
          onClick={refreshCaptcha}
          disabled={disabled}
        >
          <FiRefreshCw />
          Refresh Captcha
        </button>
      </div>
      <div className={`field-shell ${error ? 'field-shell-error' : ''}`}>
        <FiShield className="field-icon" aria-hidden="true" />
        <input
          id="captchaInput"
          name="captchaInput"
          className="field-input"
          type="text"
          value={value}
          onChange={onChange}
          placeholder="Enter Captcha"
          autoComplete="off"
          disabled={disabled}
        />
      </div>
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}

export default Captcha;
