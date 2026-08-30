import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import './RecruiterApplicantsPage.css';

export const RecruiterApplicantsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [resumeDownloadLoading, setResumeDownloadLoading] = useState(false);

  useEffect(() => {
    fetchApplicants();
  }, [filterStatus]);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (filterStatus) params.status = filterStatus;

      const res = await api.get('/applications/recruiter', { params });
      if (res.data.success) {
        setApplications(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch applicants.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      setActionLoadingId(appId);
      const res = await api.patch(`/applications/${appId}/status`, { status: newStatus });
      if (res.data.success) {
        setApplications((prev) =>
          prev.map((app) => (app._id === appId ? { ...app, status: newStatus } : app))
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update application status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleResumeDownload = async (applicationId) => {
    const downloadWindow = window.open('', '_blank');

    try {
      setResumeDownloadLoading(true);
      setError('');
      const res = await api.get(`/applications/${applicationId}/resume-download`);
      if (res.data.success) {
        if (downloadWindow) {
          downloadWindow.location.replace(res.data.data.url);
        } else {
          window.location.assign(res.data.data.url);
        }
      }
    } catch (err) {
      downloadWindow?.close();
      setError(err.response?.data?.message || 'Unable to download this resume.');
    } finally {
      setResumeDownloadLoading(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'SELECTED':
      case 'SHORTLISTED':
        return 'success';
      case 'INTERVIEW':
      case 'ASSESSMENT':
        return 'info';
      case 'UNDER_REVIEW':
        return 'warning';
      case 'REJECTED':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const statuses = [
    { label: 'All Applicants', value: '' },
    { label: 'Applied', value: 'APPLIED' },
    { label: 'Under Review', value: 'UNDER_REVIEW' },
    { label: 'Shortlisted', value: 'SHORTLISTED' },
    { label: 'Interview', value: 'INTERVIEW' },
    { label: 'Selected', value: 'SELECTED' },
    { label: 'Rejected', value: 'REJECTED' }
  ];

  return (
    <div className="applicants-board-container">
      <div className="applicants-header">
        <div>
          <h1 className="applicants-title">Candidate Pipeline</h1>
          <p className="applicants-subtitle">
            Review submissions, evaluate matched skillsets, and advance hiring stages.
          </p>
        </div>
      </div>

      <ErrorMessage message={error} />

      {/* Filter Tabs */}
      <div className="status-tabs-row">
        {statuses.map((tab) => (
          <button
            key={tab.value}
            className={`status-tab-btn ${filterStatus === tab.value ? 'active' : ''}`}
            onClick={() => setFilterStatus(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader message="Loading candidate applications..." />
      ) : applications.length === 0 ? (
        <EmptyState
          title="No candidates found in this stage"
          description="Candidates who apply to your active job listings will appear here."
        />
      ) : (
        <div className="card table-card">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Applied Role</th>
                <th>Skills & Details</th>
                <th>Status</th>
                <th>Applied Date</th>
                <th style={{ textAlign: 'right' }}>Workflow Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id}>
                  <td>
                    <div className="candidate-cell">
                      <strong>{app.student?.name}</strong>
                      <span>{app.student?.email}</span>
                      {app.studentProfile?.phone && (
                        <span className="candidate-phone">📞 {app.studentProfile.phone}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <strong>{app.job?.title}</strong>
                    <span className="role-subtext">{app.job?.experienceLevel}</span>
                  </td>
                  <td>
                    <div className="mini-skills-wrap">
                      {app.studentProfile?.skills?.slice(0, 3).map((s) => (
                        <span key={s} className="candidate-skill-tag">{s}</span>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', marginTop: '0.25rem' }}
                        onClick={() => setSelectedCandidate(app)}
                      >
                        View Full Profile
                      </Button>
                    </div>
                  </td>
                  <td>
                    <Badge variant={getStatusBadgeVariant(app.status)} size="sm">
                      {app.status}
                    </Badge>
                  </td>
                  <td>
                    <span className="date-text">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <select
                      className="status-dropdown"
                      value={app.status}
                      disabled={actionLoadingId === app._id}
                      onChange={(e) => handleStatusChange(app._id, e.target.value)}
                    >
                      <option value="APPLIED">Applied</option>
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="SHORTLISTED">Shortlist</option>
                      <option value="ASSESSMENT">Assessment</option>
                      <option value="INTERVIEW">Schedule Interview</option>
                      <option value="SELECTED">Offer / Selected</option>
                      <option value="REJECTED">Reject</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Candidate Profile Details Modal */}
      <Modal
        isOpen={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        title={`Candidate: ${selectedCandidate?.student?.name}`}
        maxWidth="680px"
      >
        {selectedCandidate && (
          <div className="candidate-modal-content">
            <div className="candidate-overview-header">
              <h3>{selectedCandidate.student?.name}</h3>
              <p className="headline-text">{selectedCandidate.studentProfile?.headline || 'Candidate'}</p>
              <span>📧 {selectedCandidate.student?.email} • 📍 {selectedCandidate.studentProfile?.location || 'Location not specified'}</span>
            </div>

            {selectedCandidate.coverLetter && (
              <div className="candidate-modal-section">
                <h4>Submitted Cover Letter</h4>
                <p className="modal-cover-letter">{selectedCandidate.coverLetter}</p>
              </div>
            )}

            <div className="candidate-modal-section">
              <h4>Resume</h4>
              {selectedCandidate.resumeUrl || selectedCandidate.studentProfile?.resume?.url ? (
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={resumeDownloadLoading}
                  onClick={() => handleResumeDownload(selectedCandidate._id)}
                >
                  📄 View / Download Resume
                </Button>
              ) : (
                <p className="text-muted">This candidate did not attach a resume.</p>
              )}
            </div>

            <div className="candidate-modal-section">
              <h4>Candidate Skills</h4>
              <div className="candidate-modal-skills">
                {selectedCandidate.studentProfile?.skills?.map((s) => (
                  <span key={s} className="skill-chip">{s}</span>
                )) || <span>No skills specified.</span>}
              </div>
            </div>

            {selectedCandidate.studentProfile?.socialLinks && (
              <div className="candidate-modal-section">
                <h4>Online Links</h4>
                <div className="modal-links-row">
                  {selectedCandidate.studentProfile.socialLinks.github && (
                    <a href={selectedCandidate.studentProfile.socialLinks.github} target="_blank" rel="noreferrer">
                      GitHub
                    </a>
                  )}
                  {selectedCandidate.studentProfile.socialLinks.linkedin && (
                    <a href={selectedCandidate.studentProfile.socialLinks.linkedin} target="_blank" rel="noreferrer">
                      LinkedIn
                    </a>
                  )}
                  {selectedCandidate.studentProfile.socialLinks.portfolio && (
                    <a href={selectedCandidate.studentProfile.socialLinks.portfolio} target="_blank" rel="noreferrer">
                      Portfolio
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
