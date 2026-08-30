import { useState, useEffect } from 'react';
import api from '../../services/api';
import { InterviewCard } from '../../components/cards/InterviewCard';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import './RecruiterInterviewsPage.css';

export const RecruiterInterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Schedule Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [modalError, setModalError] = useState('');

  const [formData, setFormData] = useState({
    applicationId: '',
    title: '',
    interviewType: 'Technical',
    scheduledDate: '',
    durationMinutes: 45,
    meetingLink: '',
    interviewerName: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [intRes, appRes] = await Promise.all([
        api.get('/interviews/recruiter'),
        api.get('/applications/recruiter')
      ]);

      if (intRes.data.success) setInterviews(intRes.data.data);
      if (appRes.data.success) setApplicants(appRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch interview workspace data.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (interviewId, newStatus) => {
    try {
      const res = await api.patch(`/interviews/${interviewId}`, { status: newStatus });
      if (res.data.success) {
        setInterviews((prev) =>
          prev.map((item) => (item._id === interviewId ? { ...item, status: newStatus } : item))
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update interview status.');
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.applicationId || !formData.scheduledDate || !formData.meetingLink) {
      setModalError('Please select a candidate, date/time, and provide a meeting link.');
      return;
    }

    try {
      setScheduling(true);
      setModalError('');
      const res = await api.post('/interviews', formData);
      if (res.data.success) {
        setInterviews((prev) => [res.data.data, ...prev]);
        setIsModalOpen(false);
        setFormData({
          applicationId: '',
          title: '',
          interviewType: 'Technical',
          scheduledDate: '',
          durationMinutes: 45,
          meetingLink: '',
          interviewerName: '',
          notes: ''
        });
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to schedule interview.');
    } finally {
      setScheduling(false);
    }
  };

  if (loading) return <Loader message="Loading corporate interview calendar..." />;

  return (
    <div className="recruiter-interviews-container">
      <div className="recruiter-interviews-header">
        <div>
          <h1 className="interviews-title">Interview Coordination</h1>
          <p className="interviews-subtitle">
            Schedule candidate assessment rounds, distribute video meeting links, and monitor outcomes.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)}>
          + Schedule New Round
        </Button>
      </div>

      <ErrorMessage message={error} />

      {interviews.length === 0 ? (
        <EmptyState
          title="No interview sessions scheduled"
          description="Coordinate interviews with shortlisted applicants to evaluate their technical match."
          actionLabel="+ Schedule First Interview"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="interviews-grid">
          {interviews.map((interview) => (
            <InterviewCard
              key={interview._id}
              interview={interview}
              isRecruiter={true}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Interview Scheduling Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Candidate Interview"
        maxWidth="600px"
      >
        <form onSubmit={handleScheduleSubmit} className="schedule-form">
          <ErrorMessage message={modalError} />

          <div className="input-group">
            <label className="input-label">Select Candidate Application <span className="input-required">*</span></label>
            <select
              className="input-field"
              value={formData.applicationId}
              onChange={(e) => setFormData({ ...formData, applicationId: e.target.value })}
              required
            >
              <option value="">-- Choose Candidate --</option>
              {applicants.map((app) => (
                <option key={app._id} value={app._id}>
                  {app.student?.name} — {app.job?.title} ({app.status})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Session Title / Topic"
              placeholder="e.g. System Design & Coding Assessment"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <div className="input-group">
              <label className="input-label">Round Type</label>
              <select
                className="input-field"
                value={formData.interviewType}
                onChange={(e) => setFormData({ ...formData, interviewType: e.target.value })}
              >
                <option>Technical</option>
                <option>HR</option>
                <option>Managerial</option>
                <option>Assessment</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Scheduled Date & Time"
              type="datetime-local"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              required
            />
            <Input
              label="Duration (Minutes)"
              type="number"
              min="15"
              step="15"
              value={formData.durationMinutes}
              onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
              required
            />
          </div>

          <Input
            label="Live Meeting URL (Google Meet / Zoom / Teams)"
            placeholder="https://meet.google.com/abc-defg-hij"
            value={formData.meetingLink}
            onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
            required
          />

          <Input
            label="Interviewer Name / Panel"
            placeholder="e.g. David Miller (Staff Engineer)"
            value={formData.interviewerName}
            onChange={(e) => setFormData({ ...formData, interviewerName: e.target.value })}
          />

          <div className="input-group">
            <label className="input-label">Preparation Notes & Instructions</label>
            <textarea
              className="input-field"
              rows="3"
              placeholder="e.g. Please be ready in an environment suitable for live coding in JavaScript/Node.js..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="modal-actions-row">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={scheduling}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={scheduling}>
              Confirm & Dispatch Schedule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};