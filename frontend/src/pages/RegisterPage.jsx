import React, { useState } from 'react';
import { User, Mail, Phone, ArrowRight, CheckCircle } from 'lucide-react';
import { AuthCard } from '../components/AuthCard';
import { Input } from '../components/Input';
import { PasswordInput, getPasswordStrength } from '../components/PasswordInput';
import { Button } from '../components/Button';
import { AuthShowcase } from '../components/AuthShowcase';
import { api } from '../api';

export function RegisterPage({ onAuthSuccess, onNavigateToLogin, addToast }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Field change handler
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: null }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  // Client-side validation
  const validate = () => {
    const errs = {};

    if (!formData.fullName.trim()) {
      errs.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters long';
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Confirm password is required';
    } else if (formData.confirmPassword !== formData.password) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');

    try {
      const response = await api.register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      setIsSuccess(true);
      addToast(response.message || 'Customer registered successfully', 'success');

      // Navigate to profile after short delay
      setTimeout(() => {
        onAuthSuccess(response.customer);
      }, 1000);
    } catch (err) {
      const msg = err.data?.message || err.message || 'Registration failed. Please try again.';
      setServerError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-layout">
      {/* Left Desktop Showcase */}
      <AuthShowcase mode="register" />

      {/* Right Form Card */}
      <div className="auth-form-panel">
        <AuthCard
          title="Create an account"
          subtitle="Register your ShopKart customer account"
          footer={
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={onNavigateToLogin}
                style={{
                  color: 'var(--brand-accent)',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                id="link-to-login"
              >
                Sign in
              </button>
            </span>
          }
        >
          {serverError && (
            <div className="alert-banner alert-danger" role="alert">
              <span>{serverError}</span>
            </div>
          )}

          {isSuccess && (
            <div className="alert-banner alert-success" role="status">
              <CheckCircle size={18} />
              <span>Registered successfully! Opening your profile...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Input
              id="fullName"
              label="Full Name"
              placeholder="e.g. John Doe"
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
              icon={User}
              required
              autoComplete="name"
              disabled={loading || isSuccess}
            />

            <Input
              id="email"
              type="email"
              label="Email Address"
              placeholder="e.g. john@gmail.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              icon={Mail}
              required
              autoComplete="email"
              disabled={loading || isSuccess}
            />

            <Input
              id="phone"
              type="tel"
              label="Phone Number"
              placeholder="e.g. 9876543210"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              icon={Phone}
              required
              autoComplete="tel"
              disabled={loading || isSuccess}
            />

            <PasswordInput
              id="password"
              label="Password"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              showStrength={true}
              required
              autoComplete="new-password"
              disabled={loading || isSuccess}
            />

            <PasswordInput
              id="confirmPassword"
              label="Confirm Password"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
              autoComplete="new-password"
              disabled={loading || isSuccess}
            />

            <div style={{ marginTop: '24px' }}>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                disabled={isSuccess}
                icon={<ArrowRight size={17} />}
                iconPosition="right"
                id="register-submit-btn"
              >
                {isSuccess ? 'Registered' : 'Register Customer'}
              </Button>
            </div>
          </form>
        </AuthCard>
      </div>
    </div>
  );
}
