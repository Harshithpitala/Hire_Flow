import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './JobCard.css';

export const JobCard = ({
  job,
  isBookmarkedInitial = false,
  onBookmarkChange
}) => {
  const { user, isAuthenticated } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(isBookmarkedInitial);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [bookmarkError, setBookmarkError] = useState('');

  useEffect(() => {
    setIsBookmarked(isBookmarkedInitial);
  }, [isBookmarkedInitial]);

  const handleBookmarkToggle = async () => {
    try {
      setBookmarkLoading(true);
      setBookmarkError('');
      const res = await api.post(`/bookmarks/toggle/${job._id}`);

      if (res.data.success) {
        setIsBookmarked(res.data.bookmarked);
        onBookmarkChange?.(job._id, res.data.bookmarked);
      }
    } catch (err) {
      setBookmarkError(err.response?.data?.message || 'Could not update saved jobs.');
    } finally {
      setBookmarkLoading(false);
    }
  };

  const canBookmark = isAuthenticated && user?.role === 'student';
  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return 'Disclosed on interview';
    const minLakhs = salary.min ? (salary.min / 100000).toFixed(1) : null;
    const maxLakhs = salary.max ? (salary.max / 100000).toFixed(1) : null;

    if (minLakhs && maxLakhs) return `₹${minLakhs}L - ₹${maxLakhs}L / yr`;
    if (maxLakhs) return `Up to ₹${maxLakhs}L / yr`;
    return `From ₹${minLakhs}L / yr`;
  };

  const getDaysRemaining = (deadline) => {
    const diffTime = new Date(deadline) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Deadline passed';
    if (diffDays === 0) return 'Closes today';
    return `${diffDays} days left`;
  };

  return (
    <div className="job-card">
      <div className="job-card-top">
        <div className="job-card-brand">
          <div className="company-logo-box">
            {job.company?.logo ? (
              <img src={job.company.logo} alt={job.company.name} />
            ) : (
              <span>{job.company?.name?.charAt(0) || '🏢'}</span>
            )}
          </div>
          <div>
            <h3 className="job-title">
              <Link to={`/jobs/${job._id}`}>{job.title}</Link>
            </h3>
            <div className="company-meta-row">
              <span className="company-name">{job.company?.name}</span>
              {job.company?.isVerified && (
                <span className="verified-tag" title="Verified Employer">✓</span>
              )}
              <span className="dot-divider">•</span>
              <span className="location-text">📍 {job.location}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {job.skillMatch !== undefined && (
            <span
              className={`deadline-chip ${
                job.skillMatch >= 75
                  ? 'badge-match-high'
                  : job.skillMatch >= 45
                  ? 'badge-match-med'
                  : 'badge-match-low'
              }`}
              style={{ background: 'transparent', border: '1px solid currentColor' }}
            >
              ⚡ {job.skillMatch}% Match
            </span>
          )}
          <span className="deadline-chip">{getDaysRemaining(job.deadline)}</span>
        </div>
      </div>

      <p className="job-snippet">{job.description?.slice(0, 160)}...</p>

      <div className="job-tags-row">
        <Badge variant="neutral" size="sm">{job.jobType}</Badge>
        <Badge variant="info" size="sm">{job.workMode}</Badge>
        <Badge variant="neutral" size="sm">{job.experienceLevel}</Badge>
      </div>

      <div className="job-skills-row">
        {job.skillsRequired?.slice(0, 4).map((skill) => (
          <span key={skill} className="mini-skill-pill">
            {skill}
          </span>
        ))}
        {job.skillsRequired?.length > 4 && (
          <span className="more-skills-pill">
            +{job.skillsRequired.length - 4} more
          </span>
        )}
      </div>

      <div className="job-card-footer">
        <div className="salary-block">
          <span className="salary-label">Compensation</span>
          <strong className="salary-amount">{formatSalary(job.salary)}</strong>
        </div>
        <div className="job-card-actions">
          {canBookmark && (
            <Button
              variant={isBookmarked ? 'secondary' : 'outline'}
              size="sm"
              isLoading={bookmarkLoading}
              onClick={handleBookmarkToggle}
              title={bookmarkError || (isBookmarked ? 'Remove from saved jobs' : 'Save this job')}
              aria-label={isBookmarked ? 'Remove from saved jobs' : 'Save this job'}
            >
              {isBookmarked ? '🔖 Saved' : '🔖 Save'}
            </Button>
          )}
          <Link to={`/jobs/${job._id}`}>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
