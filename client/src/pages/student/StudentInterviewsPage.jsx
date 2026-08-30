import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { InterviewCard } from '../../components/cards/InterviewCard';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorMessage } from '../../components/common/ErrorMessage';

export const StudentInterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/interviews/my');
      if (res.data?.success) {
        setInterviews(res.data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch interviews.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="Loading scheduled interviews..." />;

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1>Scheduled Interviews 📅</h1>
        <p className="text-muted">
          Access your live video meeting links, countdown timers, and preparation briefs.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      {interviews.length === 0 ? (
        <EmptyState
          title="No interviews scheduled yet"
          description="Once recruiters shortlist your applications and schedule evaluation rounds, meeting details will appear here."
          actionText="View My Applications"
          actionLink="/student/applications"
          onAction={() => navigate('/student/applications')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {interviews.map((interview) => (
            <InterviewCard key={interview._id} interview={interview} isRecruiter={false} />
          ))}
        </div>
      )}
    </div>
  );
};