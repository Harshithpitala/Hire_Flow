import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import './RecruiterJobsPage.css';

export const RecruiterJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/jobs/my/listings');
      if (res.data.success) {
        setJobs(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch job postings.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (jobId) => {
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
    if (!window.confirm('Are you sure you want to delete this job posting? This action is permanent.')) {
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

  if (loading) {
    return <Loader message="Loading your job postings..." />;
  }

  return (
    <div className="recruiter-jobs-wrapper">
      <div className="recruiter-jobs-header">
        <div>
          <h1 className="recruiter-jobs-title">Manage Job Listings</h1>
          <p className="recruiter-jobs-subtitle">
            Track active openings, application volume, and modify recruitment statuses.
          </p>
        </div>
        <Link to="/recruiter/jobs/new">
          <Button variant="primary" size="md">
            + Post New Job
          </Button>
        </Link>
      </div>

      <ErrorMessage message={error} />

      {jobs.length === 0 ? (
        <EmptyState
          title="No job listings published yet"
          description="Create your first role to start receiving matched student applications."
          actionLabel="+ Post a Job Now"
          onAction={() => (window.location.href = '/recruiter/jobs/new')}
        />
      ) : (
        <div className="card table-card">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Job Title & Details</th>
                <th>Type & Mode</th>
                <th>Applicants</th>
                <th>Status</th>
                <th>Deadline</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job._id}>
                  <td>
                    <div className="job-meta-primary">
                      <strong>{job.title}</strong>
                      <span>{job.location} • {job.experienceLevel}</span>
                    </div>
                  </td>
                  <td>
                    <span className="type-tag">{job.jobType}</span>
                    <span className="mode-subtext">{job.workMode}</span>
                  </td>
                  <td>
                    <span className="applicant-badge-count">
                      {job.applicantCount || 0} candidates
                    </span>
                  </td>
                  <td>
                    <Badge variant={job.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm">
                      {job.status}
                    </Badge>
                  </td>
                  <td>
                    <span className="date-text">
                      {new Date(job.deadline).toLocaleDateString()}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="table-actions">
                      <Button
                        variant="outline"
                        size="sm"
                        isLoading={actionId === job._id}
                        onClick={() => handleToggleStatus(job._id)}
                      >
                        {job.status === 'ACTIVE' ? 'Close' : 'Reopen'}
                      </Button>
                      <button
                        type="button"
                        className="btn-danger-icon"
                        title="Delete listing"
                        disabled={actionId === job._id}
                        onClick={() => handleDeleteJob(job._id)}
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