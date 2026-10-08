import React, { useState } from 'react';
import { Mail, ArrowRight } from 'lucide-react';
import { AuthCard } from '../components/AuthCard';
import { Input } from '../components/Input';
import { PasswordInput } from '../components/PasswordInput';
import { Button } from '../components/Button';
import { AuthShowcase } from '../components/AuthShowcase';
import { api } from '../api';

export function LoginPage({ onAuthSuccess, onNavigateToRegister, addToast }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: null }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const validate = () => {
    const errs = {};

    if (!formData.email.trim()) {
      errs.email = 'Please enter your email address';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errs.password = 'Please enter your password';
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
      const response = await api.login({
        email: formData.email,
        password: formData.password,
      });

      addToast(response.message || 'Login successful', 'success');
      onAuthSuccess(response.customer);
    } catch (err) {
      const msg =
        err.data?.message || err.message || 'Invalid email or password';
      setServerError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-layout">
      {/* Left Showcase */}
      <AuthShowcase mode="login" />

      {/* Right Form Card */}
      <div className="auth-form-panel">
        <AuthCard
          title="Sign in to ShopKart"
          subtitle="Enter your credentials to access your customer account"
          footer={
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onNavigateToRegister}
                style={{
                  color: 'var(--brand-accent)',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                id="link-to-register"
              >
                Create an account
              </button>
            </span>
          }
        >
          {serverError && (
            <div className="alert-banner alert-danger" role="alert" id="login-error-banner">
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
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
              disabled={loading}
            />

            <PasswordInput
              id="password"
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
              autoComplete="current-password"
              disabled={loading}
            />

            <div style={{ marginTop: '24px' }}>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                icon={<ArrowRight size={17} />}
                iconPosition="right"
                id="login-submit-btn"
              >
                Sign In
              </Button>
            </div>
          </form>
        </AuthCard>
      </div>
    </div>
  );
}
