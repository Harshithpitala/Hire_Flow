import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { ApplicationTimeline } from '../../components/cards/ApplicationTimeline';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import './StudentApplicationsPage.css';

export const StudentApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/applications/my');
      if (res.data.success) {
        setApplications(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your applications.');
    } finally {
      setLoading(false);
    }
  };

  const getBadgeVariant = (status) => {
    switch (status) {
      case 'SELECTED':
        return 'success';
      case 'SHORTLISTED':
      case 'INTERVIEW':
        return 'info';
      case 'UNDER_REVIEW':
        return 'warning';
      case 'REJECTED':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  if (loading) return <Loader message="Tracking your active applications..." />;

  return (
    <div className="student-tracker-container">
      <div className="student-tracker-header">
        <h1 className="tracker-title">My Applications</h1>
        <p className="tracker-subtitle">
          Monitor your recruitment stages, interview progress, and status updates in real time.
        </p>
      </div>

      <ErrorMessage message={error} />

      {applications.length === 0 ? (
        <EmptyState
          title="No applications submitted yet"
          description="Explore verified opportunities and submit your profile to begin tracking your hiring journey."
          actionLabel="Explore Open Roles"
          onAction={() => (window.location.href = '/jobs')}
        />
      ) : (
        <div className="applications-stack">
          {applications.map((app) => (
            <div key={app._id} className="card app-card">
              <div className="app-card-top">
                <div className="app-company-info">
                  <div className="app-logo-box">
                    {app.job?.company?.logo ? (
                      <img src={app.job.company.logo} alt={app.job.company.name} />
                    ) : (
                      <span>{app.job?.company?.name?.charAt(0) || '🏢'}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="app-job-title">
                      <Link to={`/jobs/${app.job?._id}`}>{app.job?.title}</Link>
                    </h3>
                    <div className="app-meta-line">
                      <strong>{app.job?.company?.name}</strong>
                      <span>•</span>
                      <span>📍 {app.job?.location}</span>
                      <span>•</span>
                      <span>Applied on {new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <Badge variant={getBadgeVariant(app.status)} size="md">
                  {app.status}
                </Badge>
              </div>

              {/* Progress Timeline */}
              <div className="timeline-container-box">
                <ApplicationTimeline currentStatus={app.status} />
              </div>

              {app.coverLetter && (
                <div className="app-cover-summary">
                  <span className="cover-tag">Your Cover Note:</span>
                  <p>"{app.coverLetter.slice(0, 140)}..."</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};