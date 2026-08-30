import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import './AdminJobsPage.css';

export const AdminJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/jobs');
      if (res.data.success) {
        setJobs(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch job moderation queue.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleJobStatus = async (jobId) => {
    try {
      setActionId(jobId);
      const res = await api.patch(`/jobs/${jobId}/status`);
      if (res.data.success) {
        setJobs((prev) =>
          prev.map((j) => (j._id === jobId ? { ...j, status: res.data.status } : j))
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update job status.');
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to permanently delete this job listing as an admin?')) {
      return;
    }

    try {
      setActionId(jobId);
      const res = await api.delete(`/jobs/${jobId}`);
      if (res.data.success) {
        setJobs((prev) => prev.filter((j) => j._id !== jobId));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete job.');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="admin-jobs-container">
      <div className="admin-jobs-header">
        <div>
          <h1 className="admin-jobs-title">Job Moderation Console</h1>
          <p className="admin-jobs-subtitle">
            Audit live job postings, enforce quality standards, and take corrective actions.
          </p>
        </div>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <Loader message="Loading job listings..." />
      ) : jobs.length === 0 ? (
        <EmptyState title="No jobs listed" description="There are no jobs posted on the platform yet." />
      ) : (
        <div className="card table-card">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Job Title & Company</th>
                <th>Type & Mode</th>
                <th>Applicants</th>
                <th>Status</th>
                <th>Posted By</th>
                <th style={{ textAlign: 'right' }}>Moderation Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j._id}>
                  <td>
                    <div className="job-info-cell">
                      <strong>{j.title}</strong>
                      <span>{j.company?.name} • 📍 {j.location}</span>
                    </div>
                  </td>
                  <td>
                    <span className="type-tag">{j.jobType}</span>
                    <span className="mode-subtext">{j.workMode}</span>
                  </td>
                  <td>
                    <span className="applicant-badge-count">{j.applicantCount || 0} candidates</span>
                  </td>
                  <td>
                    <Badge variant={j.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm">
                      {j.status}
                    </Badge>
                  </td>
                  <td>
                    <div className="posted-by-cell">
                      <span>{j.postedBy?.name}</span>
                      <small>{j.postedBy?.email}</small>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="table-actions">
                      <Button
                        variant="outline"
                        size="sm"
                        isLoading={actionId === j._id}
                        onClick={() => handleToggleJobStatus(j._id)}
                      >
                        {j.status === 'ACTIVE' ? 'Force Close' : 'Reactivate'}
                      </Button>
                      <button
                        type="button"
                        className="btn-danger-icon"
                        title="Delete listing"
                        disabled={actionId === j._id}
                        onClick={() => handleDeleteJob(j._id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};