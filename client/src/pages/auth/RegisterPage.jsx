import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import './auth.css';

export const RegisterPage = () => {
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
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
      const newUser = await register({ name, email, password, role });
      navigate(`/${newUser.role}/dashboard`, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h1>Create an Account</h1>
        <p>Select your account type and start connecting today.</p>
      </div>

      <div className="auth-role-selector">
        <button
          type="button"
          className={`auth-role-btn ${role === 'student' ? 'active' : ''}`}
          onClick={() => setRole('student')}
        >
          🎓 Candidate / Student
        </button>
        <button
          type="button"
          className={`auth-role-btn ${role === 'recruiter' ? 'active' : ''}`}
          onClick={() => setRole('recruiter')}
        >
          🏢 Recruiter / Employer
        </button>
      </div>

      <ErrorMessage message={error} />

      <form className="auth-form" onSubmit={handleSubmit}>
        <Input
          label={role === 'student' ? 'Full Name' : 'Company Representative Name'}
          name="name"
          type="text"
          placeholder={role === 'student' ? 'e.g. Rahul Sharma' : 'e.g. Sarah Connor'}
          value={formData.name}
          onChange={handleChange}
          required
        />

        <Input
          label="Work / College Email"
          name="email"
          type="email"
          placeholder="name@domain.com"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <Input
          label="Password (min 8 chars)"
          name="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={loading}
          className="btn-full"
        >
          Register as {role === 'student' ? 'Student' : 'Recruiter'}
        </Button>

        <p className="auth-footer-prompt">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};