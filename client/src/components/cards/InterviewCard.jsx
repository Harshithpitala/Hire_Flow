import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import './InterviewCard.css';

export const InterviewCard = ({ interview, isRecruiter = false, onStatusChange }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    const calculateCountdown = () => {
      const difference = new Date(interview.scheduledDate) - new Date();

      if (difference <= 0) {
        setIsPast(true);
        setTimeLeft('Session concluded or in progress');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m remaining`);
      } else {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s remaining`);
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [interview.scheduledDate]);

  const getBadgeVariant = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'SCHEDULED':
        return 'info';
      case 'CANCELLED':
        return 'danger';
      case 'RESCHEDULED':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  const formattedDate = new Date(interview.scheduledDate).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = new Date(interview.scheduledDate).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`card interview-item-card ${isPast ? 'interview-card-past' : ''}`}>
      <div className="interview-top-bar">
        <div className="interview-badge-group">
          <Badge variant="neutral" size="sm">{interview.interviewType} Round</Badge>
          <Badge variant={getBadgeVariant(interview.status)} size="sm">{interview.status}</Badge>
        </div>
        <span className={`countdown-ticker ${isPast ? 'ticker-past' : ''}`}>
          ⏱️ {timeLeft}
        </span>
      </div>

      <div className="interview-content-body">
        <h3 className="interview-card-title">{interview.title}</h3>
        <div className="interview-entity-info">
          {isRecruiter ? (
            <p className="entity-line">
              👤 <strong>Candidate:</strong> {interview.student?.name} ({interview.student?.email})
            </p>
          ) : (
            <p className="entity-line">
              🏢 <strong>Company:</strong> {interview.company?.name} • 📍 {interview.job?.location}
            </p>
          )}
          <p className="entity-line">
            💼 <strong>Role:</strong> {interview.job?.title}
          </p>
          {interview.interviewerName && (
            <p className="entity-line">
              🎙️ <strong>Interviewer:</strong> {interview.interviewerName}
            </p>
          )}
        </div>

        <div className="interview-datetime-box">
          <div>
            <span className="dt-label">Date</span>
            <strong>📅 {formattedDate}</strong>
          </div>
          <div>
            <span className="dt-label">Time</span>
            <strong>⏰ {formattedTime} ({interview.durationMinutes} mins)</strong>
          </div>
        </div>

        {interview.notes && (
          <div className="interview-notes-box">
            <strong>Preparation Notes:</strong>
            <p>{interview.notes}</p>
          </div>
        )}
      </div>

      <div className="interview-footer-actions">
        <a href={interview.meetingLink} target="_blank" rel="noreferrer" className="meeting-launch-btn">
          <Button variant="primary" size="md">
            Join Live Meeting Room 🔗
          </Button>
        </a>

        {!isRecruiter && (
          <Link to="/student/applications">
            <Button variant="outline" size="md">
              View My Applications 📝
            </Button>
          </Link>
        )}

        {isRecruiter && onStatusChange && (
          <div className="recruiter-status-quick-switch">
            <select
              className="status-dropdown"
              value={interview.status}
              onChange={(e) => onStatusChange(interview._id, e.target.value)}
            >
              <option value="SCHEDULED">Scheduled</option>
              <option value="COMPLETED">Mark Completed</option>
              <option value="RESCHEDULED">Rescheduled</option>
              <option value="CANCELLED">Cancel Interview</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};