import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { useAuth } from '../../context/AuthContext';

export const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1 = Enter Email, 2 = Enter OTP + New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [devCode, setDevCode] = useState('');

  const navigate = useNavigate();
  const { loginWithToken } = useAuth?.() || {};

  // Step 1: Send OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setSuccessMsg('A 6-digit OTP code has been sent to your email.');
        if (res.data.devOtp) setDevCode(res.data.devOtp);
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Change Password
  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/reset-password-otp', {
        email,
        otp,
        newPassword
      });

      if (res.data.success) {
        if (res.data.token && loginWithToken) {
          loginWithToken(res.data.token, res.data.user);
          navigate('/');
        } else {
          alert('Password reset successful! Please log in.');
          navigate('/login');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '440px', margin: '3rem auto', padding: '2rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        {step === 1 ? 'Reset Password 🔒' : 'Enter Verification Code 📩'}
      </h2>
      <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        {step === 1
          ? 'Enter your registered email to receive a 6-digit OTP.'
          : `Enter the 6-digit OTP sent to ${email}`}
      </p>

      {error && <ErrorMessage message={error} />}
      {successMsg && !error && (
        <div style={{ background: '#ecfdf5', color: '#065f46', padding: '10px 14px', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem' }}>
          {successMsg}
        </div>
      )}

      {devCode && (
        <div style={{ background: '#eef2ff', color: '#3730a3', padding: '8px 12px', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.8rem' }}>
          <strong>[Dev Mode OTP]:</strong> {devCode}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleRequestOtp}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.875rem' }}>
              Email Address
            </label>
            <input
              type="email"
              required
              className="input"
              style={{ width: '100%', padding: '0.65rem 0.8rem' }}
              placeholder="e.g. name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button type="submit" variant="primary" size="lg" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Sending OTP...' : 'Send 6-Digit OTP'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyAndReset}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.875rem' }}>
              6-Digit OTP Code
            </label>
            <input
              type="text"
              maxLength={6}
              required
              className="input"
              style={{ width: '100%', padding: '0.65rem 0.8rem', textAlign: 'center', fontSize: '1.25rem', letterSpacing: '4px', fontWeight: 'bold' }}
              placeholder="••••••"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.875rem' }}>
              New Password
            </label>
            <input
              type="password"
              required
              className="input"
              style={{ width: '100%', padding: '0.65rem 0.8rem' }}
              placeholder="Min. 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.875rem' }}>
              Confirm New Password
            </label>
            <input
              type="password"
              required
              className="input"
              style={{ width: '100%', padding: '0.65rem 0.8rem' }}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <Button type="submit" variant="primary" size="lg" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Verifying...' : 'Verify OTP & Reset Password'}
          </Button>

          <button
            type="button"
            onClick={() => setStep(1)}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'block', margin: '1rem auto 0', fontSize: '0.875rem' }}
          >
            ← Change Email / Resend
          </button>
        </form>
      )}

      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <Link to="/login" style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
          Remember your password? <strong>Sign In</strong>
        </Link>
      </div>
    </div>
  );
};