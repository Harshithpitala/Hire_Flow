import { Outlet, Link } from 'react-router-dom';
import logo from '../assets/logo.svg';
import './AuthLayout.css';

export const AuthLayout = () => {
  return (
    <div className="auth-layout">
      {/* Left Branding Showcase Panel */}
      <div className="auth-sidebar-panel">
        <div className="auth-sidebar-header">
          <Link to="/" className="auth-brand-logo">
            <img src={logo} alt="HireFlow" width="34" height="34" />
            <span>HireFlow</span>
          </Link>
        </div>
        <div className="auth-sidebar-content">
          <div className="auth-quote-badge">Smart Career Engine</div>
          <h2>Accelerate your placement & hiring pipeline.</h2>
          <p>
            Connect top candidates with industry-leading teams. Real-time scheduling,
            verified candidate matching, and automated recruitment workflows.
          </p>
          <div className="auth-stats-preview">
            <div className="auth-stat-item">
              <strong>98%</strong>
              <span>Placement Match</span>
            </div>
            <div className="auth-stat-item">
              <strong>500+</strong>
              <span>Hiring Partners</span>
            </div>
            <div className="auth-stat-item">
              <strong>24/7</strong>
              <span>Real-time Alerts</span>
            </div>
          </div>
        </div>
        <div className="auth-sidebar-footer">
          <p>&copy; {new Date().getFullYear()} HireFlow Inc. All rights reserved.</p>
        </div>
      </div>

      {/* Right Interactive Form Area */}
      <div className="auth-content-panel">
        <div className="auth-form-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  );
};