import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { loginCustomer } from '../services/api';

/**
 * Login Page
 * Route: /login
 * Allows existing customers to authenticate and receive an HttpOnly JWT cookie.
 */
export function Login() {
  const navigate = useNavigate();

  // Controlled input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI status states
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Please enter your email address';
    }

    if (!password) {
      newErrors.password = 'Please enter your password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    setServerError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Call backend login API (sends credentials/cookies)
      await loginCustomer({
        email: email.toLowerCase().trim(),
        password: password,
      });

      // Navigate to protected home page on successful authentication
      navigate('/home');
    } catch (err) {
      // Handle login failure
      if (err.response && err.response.status === 401) {
        setServerError('Invalid Credentials');
      } else {
        const errorMsg =
          err.response?.data?.message || err.message || 'Invalid Credentials';
        setServerError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        {/* Header Branding */}
        <div className="auth-card-header">
          <div className="auth-logo-badge">
            <span className="brand-wordmark">
              Shop<span>Kart</span>
            </span>
          </div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in with your email and password</p>
        </div>

        {/* Server Error Alert Banner */}
        {serverError && (
          <div className="alert-banner alert-danger" role="alert" id="login-error-banner">
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Email Address Field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address <span className="required-star">*</span>
            </label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                id="email"
                type="email"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                placeholder="e.g. alex@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                  if (serverError) setServerError('');
                }}
                disabled={loading}
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="field-error-text">{errors.email}</span>}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password <span className="required-star">*</span>
            </label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type="password"
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                  if (serverError) setServerError('');
                }}
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
            {errors.password && <span className="field-error-text">{errors.password}</span>}
          </div>

          {/* Submit Button */}
          <div style={{ marginTop: '24px' }}>
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
              id="login-submit-btn"
            >
              {loading ? (
                <span>Logging in...</span>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight size={22} strokeWidth={2.4} />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Link to Register */}
        <div className="auth-card-footer">
          <span>Don't have an account? </span>
          <Link to="/register" className="auth-link" id="link-to-register">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
