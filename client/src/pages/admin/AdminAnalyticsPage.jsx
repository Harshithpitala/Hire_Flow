import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Loader } from '../../components/common/Loader';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import './AdminAnalyticsPage.css';

export const AdminAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminAnalytics();
  }, []);

  const fetchAdminAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/analytics');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load platform analytics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Generating platform aggregate reports..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!data) return null;

  const { userRegistrationTrends, industryDistribution, totalPlacements } = data;

  const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="admin-analytics-container">
      <div className="admin-analytics-header">
        <div>
          <h1 className="admin-analytics-title">Global Platform Analytics</h1>
          <p className="admin-analytics-subtitle">
            Longitudinal growth trends, campus placement statistics, and corporate industry breakdown.
          </p>
        </div>
        <div className="card total-placements-kpi">
          <span>Confirmed Placements</span>
          <strong>🎓 {totalPlacements} Hires</strong>
        </div>
      </div>

      {/* Registration Velocity by Month */}
      <div className="card admin-metric-card">
        <h3 className="section-title">User Registration Velocity (Past 6 Months)</h3>
        <p className="section-desc">Month-over-month breakdown of candidate and recruiter sign-ups.</p>

        {userRegistrationTrends.length === 0 ? (
          <p className="empty-subtext" style={{ marginTop: '1rem' }}>No historical registration data recorded yet.</p>
        ) : (
          <div className="registration-bars-container">
            {userRegistrationTrends.map((trend, idx) => (
              <div key={idx} className="month-trend-col">
                <span className="trend-total-val">{trend.total}</span>
                <div className="stacked-bar">
                  <div
                    className="bar-segment student-seg"
                    style={{ height: `${trend.total > 0 ? (trend.students / trend.total) * 100 : 0}%` }}
                    title={`Students: ${trend.students}`}
                  />
                  <div
                    className="bar-segment recruiter-seg"
                    style={{ height: `${trend.total > 0 ? (trend.recruiters / trend.total) * 100 : 0}%` }}
                    title={`Recruiters: ${trend.recruiters}`}
                  />
                </div>
                <span className="month-label">
                  {monthNames[trend._id.month]} {trend._id.year}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="trend-legend">
          <div className="legend-item"><span className="legend-dot student-dot"></span> Students</div>
          <div className="legend-item"><span className="legend-dot recruiter-dot"></span> Recruiters</div>
        </div>
      </div>

      {/* Industry Breakdown Table */}
      <div className="card admin-metric-card">
        <h3 className="section-title">Employer Distribution by Industry</h3>
        <p className="section-desc">Active corporate partners by domain category.</p>

        <div className="industry-distribution-grid">
          {industryDistribution.map((item) => (
            <div key={item._id} className="industry-stat-box">
              <strong>{item._id || 'Unspecified'}</strong>
              <span>{item.count} Organizations</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};