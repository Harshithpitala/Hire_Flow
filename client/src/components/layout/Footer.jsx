import { Link } from 'react-router-dom';
import logo from '../../assets/logo.svg';
import './Footer.css';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand-col">
          <div className="footer-logo-row">
            <img src={logo} alt="HireFlow" width="28" height="28" />
            <span className="brand-name">HireFlow</span>
          </div>
          <p className="footer-tagline">
            Smart placement & career lifecycle management platform. Connecting motivated students with verified employers through real-time matching and scheduling.
          </p>
        </div>

        <div className="footer-links-col">
          <strong>Candidates</strong>
          <Link to="/jobs">Discover Jobs</Link>
          <Link to="/register">Create Student Profile</Link>
          <Link to="/login">Application Tracking</Link>
        </div>

        <div className="footer-links-col">
          <strong>Recruiters</strong>
          <Link to="/register">Post New Roles</Link>
          <Link to="/login">Candidate Pipeline</Link>
          <Link to="/login">Interview Management</Link>
        </div>

        <div className="footer-links-col">
          <strong>Platform</strong>
          <span>MERN Architecture</span>
          <span>MongoDB Aggregations</span>
          <span>Real-time Socket.IO</span>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <div className="container flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
          <p>&copy; {new Date().getFullYear()} HireFlow SaaS Platform. Built for production-quality engineering portfolios.</p>
          <span>Production Ready • React & Node.js</span>
        </div>
      </div>
    </footer>
  );
};