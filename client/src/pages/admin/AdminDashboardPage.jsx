import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Loader } from '../../components/common/Loader';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import './AdminDashboardPage.css';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/overview');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load platform analytics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Loading administrative metrics..." />;

  return (
    <div className="admin-dash-container">
      <div className="admin-dash-header">
        <div>
          <h1 className="admin-dash-title">Administrative Command Center</h1>
          <p className="admin-dash-subtitle">
            System-wide user statistics, company verifications, and recruitment activity.
          </p>
        </div>
      </div>

      <ErrorMessage message={error} />

      {stats && (
        <div className="admin-stats-grid">
          <div className="card stat-card">
            <div className="stat-icon-wrapper blue">👥</div>
            <div className="stat-content">
              <span className="stat-label">Total Accounts</span>
              <strong className="stat-number">{stats.users.total}</strong>
              <small className="stat-breakdown">
                {stats.users.students} Students • {stats.users.recruiters} Recruiters
              </small>
            </div>
          </div>

          <div className="card stat-card">
            <div className="stat-icon-wrapper amber">🏢</div>
            <div className="stat-content">
              <span className="stat-label">Employer Organizations</span>
              <strong className="stat-number">{stats.companies.total}</strong>
              <small className="stat-breakdown">
                {stats.companies.pendingVerification} Pending Verification
              </small>
            </div>
          </div>

          <div className="card stat-card">
            <div className="stat-icon-wrapper purple">💼</div>
            <div className="stat-content">
              <span className="stat-label">Published Roles</span>
              <strong className="stat-number">{stats.jobs.total}</strong>
              <small className="stat-breakdown">
                {stats.jobs.active} Active Openings
              </small>
            </div>
          </div>

          <div className="card stat-card">
            <div className="stat-icon-wrapper green">🎓</div>
            <div className="stat-content">
              <span className="stat-label">Application Submissions</span>
              <strong className="stat-number">{stats.applications.total}</strong>
              <small className="stat-breakdown">
                {stats.applications.placements} Confirmed Placements
              </small>
            </div>
          </div>
        </div>
      )}

      <div className="admin-quick-actions-row">
        <h3 className="section-title">Moderation Queues</h3>
        <div className="admin-cards-grid">
          <Link to="/admin/recruiters" className="card action-nav-card">
            <div className="action-nav-icon">🛡️</div>
            <div>
              <strong>Verify Employer Organizations</strong>
              <p>Review new company registrations and approve recruitment privileges.</p>
            </div>
          </Link>

          <Link to="/admin/users" className="card action-nav-card">
            <div className="action-nav-icon">👥</div>
            <div>
              <strong>User Account Directory</strong>
              <p>Search user profiles, inspect roles, and manage access restrictions.</p>
            </div>
          </Link>

          <Link to="/admin/jobs" className="card action-nav-card">
            <div className="action-nav-icon">⚖️</div>
            <div>
              <strong>Job Posting Moderation</strong>
              <p>Review live listings, ensure compliance, and remove invalid openings.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};