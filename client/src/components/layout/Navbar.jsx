import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import logo from '../../assets/logo.svg';
import './Navbar.css';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-container container">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <img src={logo} alt="HireFlow" className="brand-logo" />
          <span className="brand-name">HireFlow</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="navbar-nav desktop-only">
          <Link to="/jobs" className="nav-link">Explore Jobs</Link>
          
          {isAuthenticated ? (
            <div className="navbar-auth-section">
              <Link to={`/${user.role}/dashboard`} className="nav-link dashboard-link">
                Dashboard
              </Link>
              <NotificationDropdown />
              <div className="user-profile-badge">
                <span className="user-name">{user.name}</span>
                <Badge variant="neutral" size="sm">{user.role}</Badge>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="navbar-guest-actions">
              <Link to="/login">
                <Button variant="outline" size="sm">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Hamburger Button */}
        <div className="mobile-actions-wrapper mobile-only">
          {isAuthenticated && <NotificationDropdown />}
          <button
            type="button"
            className="mobile-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Panel */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={closeMenu}>
          <div className="mobile-drawer-card" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <span className="mobile-drawer-title">Navigation</span>
              <button type="button" className="drawer-close-btn" onClick={closeMenu}>✕</button>
            </div>
            
            <div className="mobile-drawer-links">
              <Link to="/jobs" className="mobile-nav-link" onClick={closeMenu}>
                🔍 Explore Jobs
              </Link>

              {isAuthenticated ? (
                <>
                  <Link to={`/${user.role}/dashboard`} className="mobile-nav-link" onClick={closeMenu}>
                    📊 My Dashboard
                  </Link>
                  {user.role === 'student' && (
                    <>
                      <Link to="/student/applications" className="mobile-nav-link" onClick={closeMenu}>
                        📝 My Applications
                      </Link>
                      <Link to="/student/saved" className="mobile-nav-link" onClick={closeMenu}>
                        🔖 Saved Jobs
                      </Link>
                      <Link to="/student/interviews" className="mobile-nav-link" onClick={closeMenu}>
                        📅 Interviews
                      </Link>
                      <Link to="/student/profile" className="mobile-nav-link" onClick={closeMenu}>
                        👤 Profile & Resume
                      </Link>
                    </>
                  )}
                  {user.role === 'recruiter' && (
                    <>
                      <Link to="/recruiter/jobs" className="mobile-nav-link" onClick={closeMenu}>
                        📋 Job Listings
                      </Link>
                      <Link to="/recruiter/jobs/new" className="mobile-nav-link" onClick={closeMenu}>
                        ➕ Post a Job
                      </Link>
                      <Link to="/recruiter/applicants" className="mobile-nav-link" onClick={closeMenu}>
                        👥 Candidate Pipeline
                      </Link>
                    </>
                  )}
                  <div className="mobile-drawer-footer">
                    <div className="mobile-user-row">
                      <strong>{user.name}</strong>
                      <Badge variant="neutral" size="sm">{user.role}</Badge>
                    </div>
                    <Button variant="outline" size="md" className="btn-full" onClick={handleLogout}>
                      Logout
                    </Button>
                  </div>
                </>
              ) : (
                <div className="mobile-guest-buttons">
                  <Link to="/login" onClick={closeMenu}>
                    <Button variant="outline" size="md" className="btn-full">Sign In</Button>
                  </Link>
                  <Link to="/register" onClick={closeMenu} style={{ marginTop: '0.5rem' }}>
                    <Button variant="primary" size="md" className="btn-full">Create Account</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};