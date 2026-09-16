import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaCheckCircle, FaTimesCircle, FaCheck } from 'react-icons/fa';
import InputField from '../components/InputField';
import PasswordInput from '../components/PasswordInput';
import Button from '../components/Button';
import { signupUser } from '../services/authApi';
import '../styles/signup.css';

const Signup = () => {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  // Validation States
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [redirectCount, setRedirectCount] = useState(3);
  const [isRegistering, setIsRegistering] = useState(false);

  // Password criteria validators
  const getPasswordCriteria = (pwd) => {
    return {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd),
    };
  };

  const passwordCriteria = getPasswordCriteria(formData.password);

  // Field change handler
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear validation error on type
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Comprehensive Form validation
  const validateForm = () => {
    const newErrors = {};

    // First Name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    // Last Name
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Email
    if (!formData.email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password requirements validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const criteria = getPasswordCriteria(formData.password);
      if (!criteria.length) {
        newErrors.password = 'Must be at least 8 characters';
      } else if (!criteria.uppercase || !criteria.lowercase || !criteria.number || !criteria.special) {
        newErrors.password = 'Password does not meet all criteria';
      }
    }

    // Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Agree Terms checkbox
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the Terms & Conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsRegistering(true);

    const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
    const payload = {
      fullName,
      email: formData.email.trim(),
      password: formData.password,
      role: 'USER',
    };

    console.info('[Signup] request payload', JSON.stringify(payload));

    signupUser(payload)
      .then(() => {
        setIsRegistering(false);
        setShowSuccessModal(true);

        let count = 3;
        const interval = setInterval(() => {
          count -= 1;
          setRedirectCount(count);
          if (count === 0) {
            clearInterval(interval);
            navigate('/');
          }
        }, 1000);
      })
      .catch((error) => {
        setIsRegistering(false);
        setErrors((prev) => ({
          ...prev,
          form: error.message,
        }));
      });
  };

  // Clear Handler
  const handleClear = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    });
    setErrors({});
  };

  return (
    <div className="auth-page-wrapper">
      {/* Decorative background shapes */}
      <div className="bg-bubble bubble-1"></div>
      <div className="bg-bubble bubble-2"></div>
      <div className="bg-bubble bubble-3"></div>

      <div className="auth-card">
        {/* Header */}
        <header className="auth-header">
          <h1 className="auth-title">College Form Generator</h1>
          <p className="auth-subtitle">Create your User account</p>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Row: First Name & Last Name */}
          <div className="form-row">
            <InputField
              label="First Name"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="John"
              error={errors.firstName}
              icon={<FaUser />}
              required
              disabled={isRegistering}
            />
            <InputField
              label="Last Name"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Doe"
              error={errors.lastName}
              icon={<FaUser />}
              required
              disabled={isRegistering}
            />
          </div>

          {/* Email */}
          <InputField
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="john.doe@college.edu"
            error={errors.email}
            icon={<FaEnvelope />}
            required
            disabled={isRegistering}
          />

          {/* Password */}
          <PasswordInput
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Create password"
            error={errors.password}
            required
            disabled={isRegistering}
          />

          {/* Real-time criteria visual helper (only visible if user starts typing) */}
          {formData.password && (
            <ul className="password-criteria-list">
              <li className={`criteria-item ${passwordCriteria.length ? 'valid' : 'invalid'}`}>
                <span className="criteria-icon">
                  {passwordCriteria.length ? <FaCheckCircle /> : <FaTimesCircle />}
                </span>
                At least 8 characters
              </li>
              <li className={`criteria-item ${passwordCriteria.uppercase ? 'valid' : 'invalid'}`}>
                <span className="criteria-icon">
                  {passwordCriteria.uppercase ? <FaCheckCircle /> : <FaTimesCircle />}
                </span>
                At least one uppercase character (A-Z)
              </li>
              <li className={`criteria-item ${passwordCriteria.lowercase ? 'valid' : 'invalid'}`}>
                <span className="criteria-icon">
                  {passwordCriteria.lowercase ? <FaCheckCircle /> : <FaTimesCircle />}
                </span>
                At least one lowercase character (a-z)
              </li>
              <li className={`criteria-item ${passwordCriteria.number ? 'valid' : 'invalid'}`}>
                <span className="criteria-icon">
                  {passwordCriteria.number ? <FaCheckCircle /> : <FaTimesCircle />}
                </span>
                At least one number (0-9)
              </li>
              <li className={`criteria-item ${passwordCriteria.special ? 'valid' : 'invalid'}`}>
                <span className="criteria-icon">
                  {passwordCriteria.special ? <FaCheckCircle /> : <FaTimesCircle />}
                </span>
                At least one special character (@, $, !, etc.)
              </li>
            </ul>
          )}

          {/* Confirm Password */}
          <PasswordInput
            label="Confirm Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Re-enter password"
            error={errors.confirmPassword}
            required
            disabled={isRegistering}
          />

          {/* Terms and Conditions Checkbox */}
          <div className="input-field-container">
            <label className="terms-conditions-container">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleInputChange}
                className="remember-checkbox"
                disabled={isRegistering}
              />
              <span className="terms-label">
                I agree to the <a href="#terms" className="terms-link" onClick={(e) => { e.preventDefault(); alert("Terms & Conditions: Please act responsibly and follow college policies while using this application."); }}>Terms & Conditions</a>
              </span>
            </label>
            {errors.agreeTerms && (
              <span className="input-error-message" role="alert">{errors.agreeTerms}</span>
            )}
          </div>

          {/* Action buttons */}
          {errors.form && (
            <span className="input-error-message" role="alert">{errors.form}</span>
          )}
          <div className="auth-actions-group">
            <Button
              type="submit"
              variant="primary"
              loading={isRegistering}
              disabled={isRegistering}
            >
              Register
            </Button>
            <Button
              type="button"
              variant="reset"
              onClick={handleClear}
              disabled={isRegistering}
            >
              Clear
            </Button>
          </div>
        </form>

        {/* Footer */}
        <footer className="auth-footer">
          Already have an account?
          <button 
            type="button" 
            className="auth-footer-link"
            onClick={() => navigate('/')}
            disabled={isRegistering}
          >
            Login
          </button>
        </footer>
      </div>

      {/* Success Popup Modal */}
      {showSuccessModal && (
        <div className="success-modal-overlay">
          <div className="success-modal">
            <div className="success-icon-wrapper">
              <FaCheck />
            </div>
            <h2 className="success-title">Account Created!</h2>
            <p className="success-message">
              Your registration was successful. Welcome to the College Form Generator portal!
            </p>
            <div className="redirect-countdown">
              Redirecting to Login page in {redirectCount}s...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
