import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import InputField from '../components/InputField';
import Loader from '../components/Loader';
import useAutoFocus from '../hooks/useAutoFocus';
import { forgotPassword } from '../services/authService';
import '../styles/auth.css';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ForgotPassword() {
  const firstFieldRef = useAutoFocus();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!email.trim()) {
      setError('User ID is required');
      return;
    }

    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await forgotPassword({ email: email.trim() });
      setMessageType('success');
      setMessage(response?.message || 'If this account exists, a reset link has been sent.');
    } catch (requestError) {
      setMessageType('error');
      setMessage(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page-forgot">
      <div className="bg-shape bg-shape-one" />
      <div className="bg-shape bg-shape-two" />
      <div className="auth-card auth-fade-in">
        <Navbar subtitle="Forgot Password" />
        <p className="auth-helper">Enter your User ID and we will help you reset your password.</p>

        {message ? <div className={`auth-alert auth-alert-${messageType}`}>{message}</div> : null}

        <form className="auth-form" onSubmit={handleSubmit}>
          <InputField
            id="forgotEmail"
            name="forgotEmail"
            label="User ID"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError('');
            }}
            placeholder="student@college.edu"
            error={error}
            icon={<FiMail />}
            inputRef={firstFieldRef}
            disabled={loading}
            autoComplete="email"
          />

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? <Loader label="Submitting..." /> : 'Submit'}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
