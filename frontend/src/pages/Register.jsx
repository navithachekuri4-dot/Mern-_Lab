import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowRight, CheckCircle } from 'lucide-react';
import { registerCustomer } from '../services/api';

/**
 * Register Page
 * Route: /register
 * Allows new customers to create a ShopKart account.
 */
export function Register() {
  const navigate = useNavigate();

  // Controlled input states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // UI status states
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Simple client-side validation
  const validateForm = () => {
    const newErrors = {};

    // 1. Full name validation
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    // 2. Email format validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailPattern.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // 3. Password length validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    // 4. Phone number validation
    const phoneClean = phone.replace(/[\s()-]/g, '');
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{7,15}$/.test(phoneClean)) {
      newErrors.phone = 'Please enter a valid phone number (digits only)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset previous errors
    setServerError('');
    setSuccessMessage('');

    // Validate inputs
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Call backend API
      const result = await registerCustomer({
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        password: password,
        phone: phone.trim(),
      });

      // Show success message
      setSuccessMessage(result.message || 'Registration successful! Redirecting to login...');

      // Redirect to /login after a brief delay
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      // Handle server error response
      const errorMessage =
        err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setServerError(errorMessage);
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
          <h2 className="auth-title">Create an Account</h2>
          <p className="auth-subtitle">Join ShopKart today for a seamless shopping experience</p>
        </div>

        {/* Server Error Alert Banner */}
        {serverError && (
          <div className="alert-banner alert-danger" role="alert" id="register-error-banner">
            <span>{serverError}</span>
          </div>
        )}

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="alert-banner alert-success" role="status" id="register-success-banner">
            <CheckCircle size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* 1. Full Name Field */}
          <div className="form-group">
            <label htmlFor="fullName" className="form-label">
              Full Name <span className="required-star">*</span>
            </label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                id="fullName"
                type="text"
                className={`form-input ${errors.fullName ? 'input-error' : ''}`}
                placeholder="e.g. Alex Johnson"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: null }));
                }}
                disabled={loading || Boolean(successMessage)}
              />
            </div>
            {errors.fullName && <span className="field-error-text">{errors.fullName}</span>}
          </div>

          {/* 2. Email Address Field */}
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
                }}
                disabled={loading || Boolean(successMessage)}
              />
            </div>
            {errors.email && <span className="field-error-text">{errors.email}</span>}
          </div>

          {/* 3. Phone Number Field */}
          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Phone Number <span className="required-star">*</span>
            </label>
            <div className="input-with-icon">
              <Phone size={18} className="input-icon" />
              <input
                id="phone"
                type="tel"
                className={`form-input ${errors.phone ? 'input-error' : ''}`}
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: null }));
                }}
                disabled={loading || Boolean(successMessage)}
              />
            </div>
            {errors.phone && <span className="field-error-text">{errors.phone}</span>}
          </div>

          {/* 4. Password Field */}
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
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                }}
                disabled={loading || Boolean(successMessage)}
              />
            </div>
            {errors.password && <span className="field-error-text">{errors.password}</span>}
          </div>

          {/* Submit Button */}
          <div style={{ marginTop: '24px' }}>
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading || Boolean(successMessage)}
              id="register-submit-btn"
            >
              {loading ? (
                <span>Registering...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={20} strokeWidth={2.4} />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Link to Login */}
        <div className="auth-card-footer">
          <span>Already have an account? </span>
          <Link to="/login" className="auth-link" id="link-to-login">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
