import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AcademicCapIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { authService } from '../../services';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ForgotPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [reset, setReset] = useState(false);

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch {
      toast.error('Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await authService.resetPassword(token, newPassword);
      setReset(true);
      toast.success('Password reset successfully!');
    } catch {
      toast.error('Invalid or expired reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl shadow-lg mb-4">
            <AcademicCapIcon className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {token ? 'Reset Password' : 'Forgot Password'}
          </h1>
        </div>

        <div className="card shadow-xl border-0">
          {(sent || reset) ? (
            <div className="text-center py-6">
              <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {reset ? 'Password Reset!' : 'Email Sent!'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {reset ? 'Your password has been reset. You can now login.' : 'Check your email for the password reset link.'}
              </p>
              <Link to="/login" className="mt-4 inline-block btn-primary px-6">
                Back to Login
              </Link>
            </div>
          ) : token ? (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="label">New Password</label>
                <input type="password" className="input" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <input type="password" className="input" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? <LoadingSpinner size="sm" className="mx-auto" /> : 'Reset Password'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgot} className="space-y-4">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              <div>
                <label className="label">Email Address</label>
                <input type="email" className="input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? <LoadingSpinner size="sm" className="mx-auto" /> : 'Send Reset Link'}
              </button>
              <p className="text-center text-sm text-gray-500">
                <Link to="/login" className="text-primary-600 hover:text-primary-700">Back to Login</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
