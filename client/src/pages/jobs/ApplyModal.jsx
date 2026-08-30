import { useState } from 'react';
import api from '../../services/api';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import './ApplyModal.css';

export const ApplyModal = ({ isOpen, onClose, job, onSuccess }) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');

      const res = await api.post('/applications', {
        jobId: job._id,
        coverLetter
      });

      if (res.data.success) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Apply to ${job?.title}`}>
      <form onSubmit={handleSubmit} className="apply-form">
        <div className="apply-job-banner">
          <strong>{job?.company?.name}</strong>
          <span>📍 {job?.location} • {job?.jobType}</span>
        </div>

        <ErrorMessage message={error} />

        <div className="input-group">
          <label className="input-label">
            Cover Letter / Introduction Note
          </label>
          <textarea
            className="input-field"
            rows="5"
            placeholder="Share why you are an ideal match for this opening, relevant projects, and your availability..."
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
          />
        </div>

        <p className="resume-notice">
          ℹ️ Your verified student profile details and primary resume will be attached automatically to this submission.
        </p>

        <div className="apply-modal-actions">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={submitting}>
            Confirm Application
          </Button>
        </div>
      </form>
    </Modal>
  );
};