import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { ApplyModal } from './ApplyModal';
import { SkillMatchBadge } from '../../components/cards/SkillMatchBadge';
import './JobDetailsPage.css';

export const JobDetailsPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [job, setJob] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [appliedStatus, setAppliedStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJobDetails();
    if (isAuthenticated && user?.role === 'student') {
      checkStatus();
      fetchMatchScore();
    }
  }, [id, isAuthenticated]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/jobs/${id}`);
      if (res.data.success) {
        setJob(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load job details.');
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    try {
      const res = await api.get(`/applications/check/${id}`);
      if (res.data.success && res.data.hasApplied) {
        setHasApplied(true);
        setAppliedStatus(res.data.data.status);
      }
    } catch (err) {
      console.error('Failed to check application status:', err);
    }
  };

  const fetchMatchScore = async () => {
    try {
      const res = await api.get(`/students/match/${id}`);
      if (res.data.success) {
        setMatchData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load skill match score:', err);
    }
  };

  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return 'Disclosed on interview';
    const minLakhs = salary.min ? (salary.min / 100000).toFixed(1) : null;
    const maxLakhs = salary.max ? (salary.max / 100000).toFixed(1) : null;
    if (minLakhs && maxLakhs) return `₹${minLakhs} Lakhs - ₹${maxLakhs} Lakhs / yr`;
    if (maxLakhs) return `Up to ₹${maxLakhs} Lakhs / yr`;
    return `From ₹${minLakhs} Lakhs / yr`;
  };

  if (loading) return <Loader message="Fetching role specifics..." />;
  if (error) return <div className="container" style={{ padding: '3rem 0' }}><ErrorMessage message={error} /></div>;
  if (!job) return null;

  return (
    <div className="job-details-container container">
      <div className="card job-details-hero">
        <div className="hero-main-row">
          <div className="hero-brand">
            <div className="company-large-logo">
              {job.company?.logo ? (
                <img src={job.company.logo} alt={job.company.name} />
              ) : (
                <span>{job.company?.name?.charAt(0) || '🏢'}</span>
              )}
            </div>
            <div>
              <h1 className="details-job-title">{job.title}</h1>
              <div className="details-company-line">
                <span className="details-company-name">{job.company?.name}</span>
                {job.company?.isVerified && <span className="verified-badge">✓ Verified</span>}
                <span>•</span>
                <span>📍 {job.location}</span>
                <span>•</span>
                <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="hero-actions">
            {isAuthenticated && user?.role === 'student' ? (
              hasApplied ? (
                <Badge variant="success" size="md">
                  ✓ Application Submitted ({appliedStatus})
                </Badge>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setIsModalOpen(true)}
                >
                  Apply Now
                </Button>
              )
            ) : isAuthenticated && user?.role === 'recruiter' ? (
              <Badge variant="neutral" size="md">Recruiter Mode</Badge>
            ) : (
              <Link to="/login">
                <Button variant="primary" size="lg">Sign In to Apply</Button>
              </Link>
            )}
          </div>
        </div>

        <div className="details-highlights-grid">
          <div className="highlight-item">
            <span className="highlight-label">Compensation</span>
            <strong>{formatSalary(job.salary)}</strong>
          </div>
          <div className="highlight-item">
            <span className="highlight-label">Job Type</span>
            <strong>{job.jobType}</strong>
          </div>
          <div className="highlight-item">
            <span className="highlight-label">Work Mode</span>
            <strong>{job.workMode}</strong>
          </div>
          <div className="highlight-item">
            <span className="highlight-label">Experience Tier</span>
            <strong>{job.experienceLevel}</strong>
          </div>
          <div className="highlight-item">
            <span className="highlight-label">Total Openings</span>
            <strong>{job.openings} positions</strong>
          </div>
          <div className="highlight-item">
            <span className="highlight-label">Deadline</span>
            <strong>{new Date(job.deadline).toLocaleDateString()}</strong>
          </div>
        </div>
      </div>

      {/* Smart Skill Matcher Widget */}
      {isAuthenticated && user?.role === 'student' && matchData && (
        <SkillMatchBadge
          score={matchData.score}
          matchedSkills={matchData.matchedSkills}
          missingSkills={matchData.missingSkills}
          showDetails={true}
        />
      )}

      <div className="details-content-grid">
        <div className="details-main-column">
          <div className="card details-section">
            <h2>Required Technical Skills</h2>
            <div className="skills-pill-group">
              {job.skillsRequired?.map((skill) => (
                <span key={skill} className="skill-badge-lg">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="card details-section">
            <h2>Role Overview & Description</h2>
            <div className="description-text">
              {job.description?.split('\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        </div>

        <aside className="details-sidebar-column">
          <div className="card company-sidebar-card">
            <h3>About {job.company?.name}</h3>
            <p className="company-sidebar-bio">
              {job.company?.description || 'No corporate summary provided.'}
            </p>
            <div className="company-sidebar-meta">
              <div>
                <strong>Industry</strong>
                <span>{job.company?.industry || 'Technology'}</span>
              </div>
              <div>
                <strong>Headquarters</strong>
                <span>{job.company?.headquarters}</span>
              </div>
              {job.company?.website && (
                <div>
                  <strong>Website</strong>
                  <a href={job.company.website} target="_blank" rel="noreferrer">
                    {job.company.website}
                  </a>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      <ApplyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        job={job}
        onSuccess={() => {
          setHasApplied(true);
          setAppliedStatus('APPLIED');
        }}
      />
    </div>
  );
};