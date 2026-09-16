import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import Captcha from '../components/Captcha';
import InputField from '../components/InputField';
import PasswordField from '../components/PasswordField';
import Loader from '../components/Loader';
import useAutoFocus from '../hooks/useAutoFocus';
import { login } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Login() {
  const navigate = useNavigate();
  const firstFieldRef = useAutoFocus();
  const { setAuthData } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'USER',
    captchaInput: '',
  });
  const [captchaCode, setCaptchaCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiMessage, setApiMessage] = useState('');

  const validate = () => {
    const nextErrors = {};

    if (!formData.email.trim()) {
      nextErrors.email = 'User ID is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      nextErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required';
    }

    if (!formData.captchaInput.trim()) {
      nextErrors.captchaInput = 'Enter Captcha';
    } else if (formData.captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      nextErrors.captchaInput = 'Invalid Captcha';
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

  const resolveErrorMessage = (error) => {
    const status = error?.status;
    const serverMessage = error?.serverMessage || '';

    if (status === 400) {
      return serverMessage || 'Invalid request data';
    }

    if (status === 401) {
      return 'Unauthorized: Invalid User ID or Password';
    }

    if (status === 403) {
      return 'Forbidden: Selected role is not allowed for this account';
    }

    if (status === 404) {
      return 'API endpoint not found';
    }

    if (status === 500) {
      return 'Server Error: Please try again later';
    }

    return serverMessage || 'Unable to login. Please try again.';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    setApiMessage('');

    try {
      const response = await login({
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      });

      const token = response?.token || response?.jwt || response?.accessToken || '';
      const role = String(response?.role || formData.role).toUpperCase();
      const user = {
        id: response?.id,
        fullName: response?.fullName,
        email: response?.email || formData.email.trim(),
      };

      setAuthData({ token, user, role });

      if (role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (error) {
      setApiMessage(resolveErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page-login">
      <div className="bg-shape bg-shape-one" />
      <div className="bg-shape bg-shape-two" />
      <div className="auth-card auth-fade-in">
        <Navbar subtitle="Login to Continue" />

        {apiMessage ? <div className="auth-alert auth-alert-error">{apiMessage}</div> : null}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="role" className="field-label">
              Login As
            </label>
            <select
              id="role"
              name="role"
              className="field-input"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <InputField
            id="email"
            name="email"
            label="User ID"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="student@college.edu"
            error={errors.email}
            icon={<FiMail />}
            inputRef={firstFieldRef}
            disabled={loading}
            autoComplete="email"
          />

          <PasswordField
            id="password"
            name="password"
            label="Password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            error={errors.password}
            disabled={loading}
          />

          <div className="auth-row">
            <span />
            <Link className="forgot-link" to="/forgot-password">
              Forgot Password?
            </Link>
          </div>

          <Captcha
            value={formData.captchaInput}
            onChange={handleChange}
            onCaptchaGenerated={setCaptchaCode}
            error={errors.captchaInput}
            disabled={loading}
          />

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? <Loader label="Logging in..." /> : 'LOGIN'}
          </button>
        </form>

        <p className="auth-footer-text">
          Don't have an account? <Link to="/register">Create Account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
