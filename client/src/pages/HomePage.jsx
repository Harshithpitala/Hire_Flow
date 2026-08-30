import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/common/Button';
import './HomePage.css';

export const HomePage = () => {
  const [stats, setStats] = useState({
    activeJobs: 120,
    totalCompanies: 45,
    totalStudents: 850,
    totalPlacements: 310
  });
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLandingStats = async () => {
      try {
        const res = await api.get('/stats');
        if (res.data?.success && res.data?.data) {
          setStats(res.data.data);
        }
      } catch {
        // Fallback state retained gracefully
      }
    };
    fetchLandingStats();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/jobs');
    }
  };

  return (
    <div className="landing-page-root">
      {/* 1. HERO SECTION */}
      <section className="landing-hero-section">
        <div className="container hero-layout-container">
          <span className="hero-pill-badge">🚀 Next-Gen Campus & Corporate Recruitment</span>
          <h1 className="hero-main-title">
            Your Career. <br />
            <span className="title-gradient">Your Next Opportunity.</span>
          </h1>
          <p className="hero-lead-text">
            HireFlow unifies students, campus placement cells, and enterprise recruiters into a single real-time platform. Match skillsets, track pipelines, and schedule interviews seamlessly.
          </p>

          <form onSubmit={handleHeroSearch} className="hero-search-wrapper card">
            <span className="hero-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by role (e.g. MERN Developer), skill (e.g. React), or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="hero-search-input"
            />
            <Button type="submit" variant="primary" size="md">
              Find Jobs
            </Button>
          </form>

          <div className="hero-cta-button-group">
            <Link to="/register">
              <Button variant="primary" size="lg">Get Started Free</Button>
            </Link>
            <Link to="/jobs">
              <Button variant="outline" size="lg">Browse Open Roles</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. LIVE PLATFORM METRICS */}
      <section className="stats-ticker-section">
        <div className="container stats-ticker-grid">
          <div className="stat-ticker-item">
            <strong>{stats.activeJobs}+</strong>
            <span>Active Openings</span>
          </div>
          <div className="stat-ticker-item">
            <strong>{stats.totalCompanies}+</strong>
            <span>Hiring Partners</span>
          </div>
          <div className="stat-ticker-item">
            <strong>{stats.totalStudents}+</strong>
            <span>Verified Candidates</span>
          </div>
          <div className="stat-ticker-item">
            <strong>{stats.totalPlacements}+</strong>
            <span>Successful Hires</span>
          </div>
        </div>
      </section>

      {/* 3. 3-STEP "HOW IT WORKS" WORKFLOW */}
      <section className="section-padded how-it-works-section">
        <div className="container">
          <div className="section-heading-center">
            <span className="section-sub-label">Effortless Recruitment</span>
            <h2>How HireFlow Works</h2>
            <p>From job discovery to confirmed offers in three streamlined steps.</p>
          </div>

          <div className="workflow-grid">
            <div className="card workflow-step-card">
              <div className="workflow-step-num">01</div>
              <h3>Create Profile & Upload Resume</h3>
              <p>
                Build your verified academic profile, catalog your technical skills, and upload your resume directly to cloud storage.
              </p>
            </div>

            <div className="card workflow-step-card">
              <div className="workflow-step-num">02</div>
              <h3>Smart Skill Matching</h3>
              <p>
                Our deterministic matching engine computes your alignment score against live job requirements, highlighting matched skills and gap areas.
              </p>
            </div>

            <div className="card workflow-step-card">
              <div className="workflow-step-num">03</div>
              <h3>Track & Schedule Interviews</h3>
              <p>
                Receive real-time Socket.IO status transitions, review visual stage timelines, and launch live video interviews with integrated countdowns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DUAL AUDIENCE VALUE PROPOSITIONS */}
      <section className="section-padded audience-section">
        <div className="container audience-grid">
          <div className="card audience-card">
            <div className="audience-icon-box blue">🎓</div>
            <h3>For Students & Job Seekers</h3>
            <p className="audience-intro">Everything you need to land your next software engineering opportunity.</p>
            <ul className="audience-feature-list">
              <li>✓ Interactive Skill Compatibility score on every job card.</li>
              <li>✓ Multi-stage visual timeline tracking from application to offer.</li>
              <li>✓ One-click applications with pre-populated cloud resume attachments.</li>
              <li>✓ Real-time desktop alerts when recruiters update application states.</li>
            </ul>
            <Link to="/register">
              <Button variant="primary" size="md" style={{ marginTop: '1.5rem' }}>
                Join as Student
              </Button>
            </Link>
          </div>

          <div className="card audience-card">
            <div className="audience-icon-box purple">🏢</div>
            <h3>For Recruiters & Talent Teams</h3>
            <p className="audience-intro">Modern candidate pipeline coordination without spreadsheet clutter.</p>
            <ul className="audience-feature-list">
              <li>✓ Instant job posting with multi-faceted filtering and required skills.</li>
              <li>✓ Dedicated candidate pipeline dashboard with stage dropdowns.</li>
              <li>✓ Integrated interview scheduler with meeting links and auto-calendar sync.</li>
              <li>✓ Funnel analytics and conversion rate metrics powered by MongoDB.</li>
            </ul>
            <Link to="/register">
              <Button variant="secondary" size="md" style={{ marginTop: '1.5rem' }}>
                Hire on HireFlow
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. PLATFORM SOCIAL PROOF & TESTIMONIALS */}
      <section className="section-padded testimonials-section">
        <div className="container">
          <div className="section-heading-center">
            <span className="section-sub-label">Campus Placement Stories</span>
            <h2>Trusted by Engineering Talent</h2>
            <p>See how HireFlow turns campus placement drives into transparent hiring journeys.</p>
          </div>

          <div className="testimonials-grid">
            <div className="card testimonial-card">
              <div className="testimonial-rating">★★★★★</div>
              <p className="testimonial-quote">
                "The visual application tracking and skill match breakdown made campus placement stress-free. I knew exactly which technical skills to brush up on before my interview."
              </p>
              <div className="testimonial-author">
                <strong>Ananya Verma</strong>
                <span>Software Engineer @ Fintech Cloud</span>
              </div>
            </div>

            <div className="card testimonial-card">
              <div className="testimonial-rating">★★★★★</div>
              <p className="testimonial-quote">
                "We reviewed over 300 candidate applications in half the time. The stage-by-stage pipeline and instant interview scheduling eliminated email back-and-forth entirely."
              </p>
              <div className="testimonial-author">
                <strong>Rohan Sen</strong>
                <span>Lead Technical Recruiter @ Acme Systems</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION (CTA) BANNER */}
      <section className="cta-banner-section">
        <div className="container">
          <div className="card cta-banner-card">
            <h2>Ready to Transform Your Placement Pipeline?</h2>
            <p>Join hundreds of students and enterprise recruiters building the future of hiring on HireFlow.</p>
            <div className="cta-buttons-row">
              <Link to="/register">
                <Button variant="primary" size="lg">Create Free Account</Button>
              </Link>
              <Link to="/jobs">
                <Button variant="outline" size="lg">Discover Open Roles</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};