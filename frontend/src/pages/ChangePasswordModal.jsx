import React, { useState } from 'react';
import { KeyRound, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Modal } from '../components/Modal';
import { PasswordInput, getPasswordStrength } from '../components/PasswordInput';
import { Button } from '../components/Button';
import { api } from '../api';

export function ChangePasswordModal({ isOpen, onClose, addToast }) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const resetForm = () => {
    setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setErrors({});
    setServerError('');
    setIsSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

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

  const validate = () => {
    const errs = {};

    if (!formData.currentPassword) {
      errs.currentPassword = 'Enter your current password';
    }

    if (!formData.newPassword) {
      errs.newPassword = 'Enter a new password';
    } else if (formData.newPassword.length < 6) {
      errs.newPassword = 'New password must be at least 6 characters long';
    } else if (formData.newPassword === formData.currentPassword) {
      errs.newPassword = 'New password cannot be the same as current password';
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Confirm your new password';
    } else if (formData.confirmPassword !== formData.newPassword) {
      errs.confirmPassword = 'New passwords do not match';
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
      const res = await api.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setIsSuccess(true);
      addToast(res.message || 'Password updated successfully', 'success');

      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (err) {
      const msg =
        err.data?.message || err.message || 'Failed to update password. Check your current password.';
      setServerError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Change Password">
      {serverError && (
        <div className="alert-banner alert-danger" role="alert">
          <ShieldAlert size={18} />
          <span>{serverError}</span>
        </div>
      )}

      {isSuccess && (
        <div className="alert-banner alert-success" role="status">
          <CheckCircle2 size={18} />
          <span>Password updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <PasswordInput
          id="currentPassword"
          label="Current Password"
          placeholder="Enter current password"
          value={formData.currentPassword}
          onChange={handleChange}
          error={errors.currentPassword}
          required
          autoComplete="current-password"
          disabled={loading || isSuccess}
        />

        <PasswordInput
          id="newPassword"
          label="New Password"
          placeholder="Minimum 6 characters"
          value={formData.newPassword}
          onChange={handleChange}
          error={errors.newPassword}
          showStrength={true}
          required
          autoComplete="new-password"
          disabled={loading || isSuccess}
        />

        <PasswordInput
          id="confirmPassword"
          label="Confirm New Password"
          placeholder="Re-enter new password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          required
          autoComplete="new-password"
          disabled={loading || isSuccess}
        />

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={isSuccess}
            icon={<KeyRound size={16} />}
            id="confirm-change-pw-btn"
          >
            {isSuccess ? 'Updated' : 'Update Password'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
