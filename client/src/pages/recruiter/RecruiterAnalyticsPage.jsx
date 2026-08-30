import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Loader } from '../../components/common/Loader';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import './RecruiterAnalyticsPage.css';

export const RecruiterAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/recruiters/analytics');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load recruitment metrics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Analyzing candidate pipelines..." />;

  if (error) return <ErrorMessage message={error} />;

  if (!data || data.totalApplications === 0) {
    return (
      <div className="analytics-empty-wrapper">
        <EmptyState
          title="No analytics available yet"
          description="Once candidates begin applying to your job listings, recruitment funnel conversions and performance metrics will populate here."
          actionLabel="View Active Job Listings"
          onAction={() => (window.location.href = '/recruiter/jobs')}
        />
      </div>
    );
  }

  const { funnel, totalApplications, shortlistRate, selectionRate, totalInterviews, jobPerformance } = data;

  const funnelStages = [
    { label: 'Applied Submissions', count: funnel.APPLIED, color: '#6366F1' },
    { label: 'Under Review', count: funnel.UNDER_REVIEW, color: '#F59E0B' },
    { label: 'Shortlisted', count: funnel.SHORTLISTED, color: '#0284C7' },
    { label: 'Assessment / Interview', count: funnel.INTERVIEW + funnel.ASSESSMENT, color: '#8B5CF6' },
    { label: 'Selected / Hired', count: funnel.SELECTED, color: '#16A34A' },
    { label: 'Rejected', count: funnel.REJECTED, color: '#DC2626' }
  ];

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <div>
          <h1 className="analytics-title">Recruitment Pipeline Analytics</h1>
          <p className="analytics-subtitle">
            Track hiring funnel efficiency, candidate conversion percentages, and role performance.
          </p>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="analytics-kpi-grid">
        <div className="card kpi-card">
          <span className="kpi-label">Total Applications</span>
          <strong className="kpi-value">{totalApplications}</strong>
          <span className="kpi-desc">Across all corporate openings</span>
        </div>

        <div className="card kpi-card">
          <span className="kpi-label">Candidate Shortlist Rate</span>
          <strong className="kpi-value">{shortlistRate}%</strong>
          <span className="kpi-desc">Advanced past initial screening</span>
        </div>

        <div className="card kpi-card">
          <span className="kpi-label">Total Interviews Conducted</span>
          <strong className="kpi-value">{totalInterviews}</strong>
          <span className="kpi-desc">Technical & HR evaluation sessions</span>
        </div>

        <div className="card kpi-card">
          <span className="kpi-label">Hiring Selection Rate</span>
          <strong className="kpi-value">{selectionRate}%</strong>
          <span className="kpi-desc">Offer conversion ratio</span>
        </div>
      </div>

      {/* Candidate Pipeline Funnel */}
      <div className="card funnel-card">
        <h3 className="section-title">Candidate Pipeline Conversion Funnel</h3>
        <p className="section-desc">Distribution of applicants across recruitment milestones.</p>

        <div className="funnel-bars-stack">
          {funnelStages.map((stage) => {
            const percentage = totalApplications > 0 ? Math.round((stage.count / totalApplications) * 100) : 0;
            return (
              <div key={stage.label} className="funnel-row">
                <div className="funnel-label-row">
                  <strong>{stage.label}</strong>
                  <span>{stage.count} candidates ({percentage}%)</span>
                </div>
                <div className="funnel-progress-track">
                  <div
                    className="funnel-progress-fill"
                    style={{ width: `${percentage}%`, backgroundColor: stage.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-Job Performance Breakdown Table */}
      <div className="card job-performance-card">
        <h3 className="section-title">Job-Level Conversion Performance</h3>
        <p className="section-desc">Detailed metrics for each published position.</p>

        <table className="custom-table" style={{ marginTop: '1rem' }}>
          <thead>
            <tr>
              <th>Role Title</th>
              <th>Status</th>
              <th>Total Applicants</th>
              <th>Selected Candidates</th>
              <th>Conversion Rate</th>
            </tr>
          </thead>
          <tbody>
            {jobPerformance.map((job) => {
              const convRate = job.applicantCount > 0
                ? Math.round((job.selectedCount / job.applicantCount) * 100)
                : 0;

              return (
                <tr key={job._id}>
                  <td>
                    <strong>{job.title}</strong>
                    <span className="role-subtext">{job.jobType} • {job.workMode}</span>
                  </td>
                  <td>
                    <Badge variant={job.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm">
                      {job.status}
                    </Badge>
                  </td>
                  <td>
                    <strong>{job.applicantCount}</strong>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--success)' }}>{job.selectedCount}</strong>
                  </td>
                  <td>
                    <span className="rate-badge">{convRate}%</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};