import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiUser } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import InputField from '../components/InputField';
import PasswordField from '../components/PasswordField';
import Loader from '../components/Loader';
import useAutoFocus from '../hooks/useAutoFocus';
import { register } from '../services/authService';
import '../styles/auth.css';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const initialState = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

function Register() {
  const navigate = useNavigate();
  const firstFieldRef = useAutoFocus();
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [apiMessage, setApiMessage] = useState('');
  const [apiType, setApiType] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordChecks = useMemo(
    () => ({
      length: formData.password.length >= 8,
      upper: /[A-Z]/.test(formData.password),
      lower: /[a-z]/.test(formData.password),
      number: /\d/.test(formData.password),
      special: /[^A-Za-z\d]/.test(formData.password),
    }),
    [formData.password]
  );

  const validate = () => {
    const nextErrors = {};

    if (!formData.fullName.trim()) {
      nextErrors.fullName = 'Full Name is required';
    } else if (formData.fullName.trim().length < 3) {
      nextErrors.fullName = 'Full Name must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'User ID is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      nextErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required';
    } else if (!passwordRegex.test(formData.password)) {
      nextErrors.password = 'Use 8+ chars with upper, lower, number, and special character';
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Confirm Password is required';
    } else if (formData.confirmPassword !== formData.password) {
      nextErrors.confirmPassword = 'Passwords must match';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: '' }));
    setApiMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    setApiMessage('');

    try {
      await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: 'USER',
      });

      setApiType('success');
      setApiMessage('Account Created Successfully');

      setTimeout(() => {
        navigate('/login');
      }, 1400);
    } catch (error) {
      setApiType('error');
      setApiMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page-register">
      <div className="bg-shape bg-shape-one" />
      <div className="bg-shape bg-shape-two" />
      <div className="auth-card auth-card-wide auth-fade-in">
        <Navbar subtitle="Create Your Account" />

        {apiMessage ? <div className={`auth-alert auth-alert-${apiType}`}>{apiMessage}</div> : null}

        <form className="auth-form" onSubmit={handleSubmit}>
          <InputField
            id="fullName"
            name="fullName"
            label="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            error={errors.fullName}
            icon={<FiUser />}
            inputRef={firstFieldRef}
            disabled={loading}
            autoComplete="name"
          />

          <InputField
            id="email"
            name="email"
            label="User ID (Email)"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="student@college.edu"
            error={errors.email}
            icon={<FiMail />}
            disabled={loading}
            autoComplete="email"
          />

          <PasswordField
            id="password"
            name="password"
            label="Password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a strong password"
            error={errors.password}
            disabled={loading}
          />

          {formData.password ? (
            <div className="password-check-grid" aria-live="polite">
              <span className={passwordChecks.length ? 'ok' : ''}>8+ Characters</span>
              <span className={passwordChecks.upper ? 'ok' : ''}>Uppercase</span>
              <span className={passwordChecks.lower ? 'ok' : ''}>Lowercase</span>
              <span className={passwordChecks.number ? 'ok' : ''}>Number</span>
              <span className={passwordChecks.special ? 'ok' : ''}>Special Character</span>
            </div>
          ) : null}

          <PasswordField
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter password"
            error={errors.confirmPassword}
            disabled={loading}
          />

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? <Loader label="Creating Account..." /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>

        <div className="auth-admin-footer">
          <p className="auth-footer-divider">-------------------------------------</p>
          <p className="auth-footer-text">
            Need an Admin Account? <Link to="/admin-register">Create Admin Account</Link>
          </p>
          <p className="auth-footer-divider">-------------------------------------</p>
        </div>
      </div>
    </div>
  );
}

export default Register;
