import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import './RecruiterDashboardPage.css';

export const RecruiterDashboardPage = () => {
  const [data, setData] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplicants: 0,
    totalInterviews: 0,
    pipelineFunnel: [],
    recentApplications: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardAnalytics();
  }, []);

  const fetchDashboardAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/recruiters/analytics');
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load recruiter analytics.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'SELECTED': return 'success';
      case 'SHORTLISTED':
      case 'INTERVIEW': return 'info';
      case 'UNDER_REVIEW': return 'warning';
      case 'REJECTED': return 'danger';
      default: return 'neutral';
    }
  };

  if (loading) return <Loader text="Loading your recruitment overview..." />;

  return (
    <div className="recruiter-dashboard-container">
      {/* Header with Quick Actions */}
      <div className="dashboard-welcome-header">
        <div>
          <h1>Hiring Overview 📊</h1>
          <p className="text-muted">
            Track your candidate pipelines, active postings, and interview schedules.
          </p>
        </div>
        <div className="header-action-buttons">
          <Link to="/recruiter/jobs/new">
            <Button variant="primary" size="md">+ Post New Job</Button>
          </Link>
          <Link to="/recruiter/applicants">
            <Button variant="outline" size="md">Review Candidates 👥</Button>
          </Link>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Metric Cards Grid */}
      <div className="stats-metric-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper blue-bg">💼</div>
          <div>
            <span className="stat-number">{data.activeJobs} <small className="stat-sub">/ {data.totalJobs}</small></span>
            <span className="stat-label">Active Job Postings</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper purple-bg">👥</div>
          <div>
            <span className="stat-number">{data.totalApplicants}</span>
            <span className="stat-label">Total Applicants</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper green-bg">📅</div>
          <div>
            <span className="stat-number">{data.totalInterviews}</span>
            <span className="stat-label">Interviews Scheduled</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper orange-bg">🎯</div>
          <div>
            <span className="stat-number">
              {data.pipelineFunnel?.find((s) => s.stage === 'SELECTED')?.count || 0}
            </span>
            <span className="stat-label">Offers Accepted / Hired</span>
          </div>
        </div>
      </div>

      {/* Main Widgets Layout */}
      <div className="dashboard-sections-grid">
        {/* Pipeline Stage Distribution */}
        <div className="card dashboard-section-card">
          <div className="section-card-header">
            <h3>Recruitment Pipeline Funnel</h3>
            <Link to="/recruiter/applicants" className="view-all-link">Manage Pipeline →</Link>
          </div>

          <div className="funnel-stack">
            {data.pipelineFunnel?.map((item) => {
              const maxCount = Math.max(...data.pipelineFunnel.map((f) => f.count), 1);
              const percentage = Math.round((item.count / maxCount) * 100);

              return (
                <div key={item.stage} className="funnel-row">
                  <div className="funnel-label-row">
                    <span className="stage-name">{item.stage.replace('_', ' ')}</span>
                    <strong className="stage-count">{item.count}</strong>
                  </div>
                  <div className="funnel-bar-track">
                    <div
                      className={`funnel-bar-fill fill-${item.stage.toLowerCase()}`}
                      style={{ width: `${item.count > 0 ? Math.max(percentage, 8) : 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Applicant Submissions */}
        <div className="card dashboard-section-card">
          <div className="section-card-header">
            <h3>Recent Candidate Submissions</h3>
            <Link to="/recruiter/applicants" className="view-all-link">View All →</Link>
          </div>

          {data.recentApplications?.length === 0 ? (
            <p className="empty-section-text">No applicants have applied yet.</p>
          ) : (
            <div className="recent-items-list">
              {data.recentApplications?.map((app) => (
                <div key={app._id} className="recent-candidate-row">
                  <div className="candidate-avatar">
                    {app.student?.name?.charAt(0) || '👤'}
                  </div>
                  <div className="candidate-info-box">
                    <h4 className="item-title">{app.student?.name || 'Applicant'}</h4>
                    <span className="item-subtitle">
                      Applied for <strong>{app.job?.title}</strong> • {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Badge variant={getStatusVariant(app.status)} size="sm">
                    {app.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
