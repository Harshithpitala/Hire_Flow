import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import './auth.css';

export const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const sessionExpired = new URLSearchParams(location.search).get('session') === 'expired';

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const loggedInUser = await login(formData.email, formData.password);
      
      // Dynamic Role Redirect
      navigate(`/${loggedInUser.role}/dashboard`, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || 'Invalid credentials or server unavailable.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h1>Welcome Back</h1>
        <p>Enter your credentials to access your account workspace.</p>
      </div>

      {sessionExpired && (
        <ErrorMessage message="Your session has expired. Please sign in again." />
      )}
      <ErrorMessage message={error} />

      <form className="auth-form" onSubmit={handleSubmit}>
        <Input
          label="Email Address"
          name="email"
          type="email"
          placeholder="name@company.com"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <div className="auth-options-row">
          <Link to="/forgot-password" className="auth-link">
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={loading}
          className="btn-full"
        >
          Sign In
        </Button>

        <p className="auth-footer-prompt">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">
            Create account
          </Link>
        </p>
      </form>
    </div>
  );
};