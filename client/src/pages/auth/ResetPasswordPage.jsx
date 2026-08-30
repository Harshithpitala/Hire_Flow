import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import './auth.css';

export const ResetPasswordPage = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { updateUserState } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.put(`/auth/reset-password/${token}`, { password });
      
      if (res.data.success) {
        localStorage.setItem('hireflow_token', res.data.token);
        localStorage.setItem('hireflow_user', JSON.stringify(res.data.user));
        updateUserState(res.data.user);
        navigate(`/${res.data.user.role}/dashboard`, { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Token is invalid or has expired.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h1>Set New Password</h1>
        <p>Ensure your new password has at least 8 characters.</p>
      </div>

      <ErrorMessage message={error} />

      <form className="auth-form" onSubmit={handleSubmit}>
        <Input
          label="New Password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Input
          label="Confirm New Password"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={loading}
          className="btn-full"
        >
          Update Password & Enter
        </Button>

        <p className="auth-footer-prompt">
          <Link to="/login" className="auth-link">
            Return to Login
          </Link>
        </p>
      </form>
    </div>
  );
};