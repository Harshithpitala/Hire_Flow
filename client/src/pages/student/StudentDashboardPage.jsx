import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import './StudentDashboardPage.css';

export const StudentDashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    applicationsCount: 0,
    interviewsCount: 0,
    savedJobsCount: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [appsRes, interviewsRes, savedRes] = await Promise.all([
        api.get('/applications/my'),
        api.get('/interviews/my'),
        api.get('/bookmarks/my')
      ]);

      const applications = appsRes.data?.data || [];
      const interviews = interviewsRes.data?.data || [];
      const saved = savedRes.data?.data || [];

      setStats({
        applicationsCount: applications.length,
        interviewsCount: interviews.length,
        savedJobsCount: saved.length
      });

      setRecentApplications(applications.slice(0, 4));
      setUpcomingInterviews(interviews.slice(0, 2));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard overview data.');
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

  if (loading) return <Loader text="Loading your workspace overview..." />;

  return (
    <div className="student-dashboard-container">
      <div className="dashboard-welcome-header">
        <div>
          <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-muted">Here is an overview of your active applications and upcoming rounds.</p>
        </div>
        <Link to="/jobs">
          <Button variant="primary" size="md">Explore Jobs 🚀</Button>
        </Link>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Metrics Row */}
      <div className="stats-metric-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper blue-bg">📝</div>
          <div>
            <span className="stat-number">{stats.applicationsCount}</span>
            <span className="stat-label">Total Applied</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper green-bg">📅</div>
          <div>
            <span className="stat-number">{stats.interviewsCount}</span>
            <span className="stat-label">Interviews</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper purple-bg">🔖</div>
          <div>
            <span className="stat-number">{stats.savedJobsCount}</span>
            <span className="stat-label">Saved Listings</span>
          </div>
        </div>
      </div>

      {/* Main Sections Layout */}
      <div className="dashboard-sections-grid">
        {/* Recent Applications Widget */}
        <div className="card dashboard-section-card">
          <div className="section-card-header">
            <h3>Recent Applications</h3>
            <Link to="/student/applications" className="view-all-link">View All →</Link>
          </div>

          {recentApplications.length === 0 ? (
            <p className="empty-section-text">You have not submitted any applications yet.</p>
          ) : (
            <div className="recent-items-list">
              {recentApplications.map((app) => (
                <div key={app._id} className="recent-item-row">
                  <div>
                    <h4 className="item-title">{app.job?.title || 'Position'}</h4>
                    <span className="item-subtitle">{app.job?.company?.name || 'Company'} • 📍 {app.job?.location}</span>
                  </div>
                  <Badge variant={getStatusVariant(app.status)} size="sm">
                    {app.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Interviews Widget */}
        <div className="card dashboard-section-card">
          <div className="section-card-header">
            <h3>Upcoming Interviews</h3>
            <Link to="/student/interviews" className="view-all-link">View All →</Link>
          </div>

          {upcomingInterviews.length === 0 ? (
            <p className="empty-section-text">No pending evaluation rounds scheduled.</p>
          ) : (
            <div className="recent-items-list">
              {upcomingInterviews.map((interview) => (
                <div key={interview._id} className="interview-preview-box">
                  <div className="interview-preview-header">
                    <strong>{interview.title}</strong>
                    <Badge variant="info" size="sm">{interview.interviewType}</Badge>
                  </div>
                  <p className="text-muted" style={{ margin: '0.4rem 0', fontSize: '0.85rem' }}>
                    🏢 {interview.company?.name} • 📅 {new Date(interview.scheduledDate).toLocaleDateString()}
                  </p>
                  <a href={interview.meetingLink} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm" style={{ width: '100%', marginTop: '0.5rem' }}>
                      Join Room 🔗
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};