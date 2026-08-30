import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

export const Sidebar = () => {
  const { user } = useAuth();

  const navigationConfig = {
    student: [
      { label: 'Overview', path: '/student/dashboard', icon: '📊' },
      { label: 'Find Jobs', path: '/jobs', icon: '🔍' },
      { label: 'My Applications', path: '/student/applications', icon: '📝' },
      { label: 'Saved Jobs', path: '/student/saved', icon: '🔖' },
      { label: 'Interviews', path: '/student/interviews', icon: '📅' },
      { label: 'Profile & Resume', path: '/student/profile', icon: '👤' }
    ],
    recruiter: [
      { label: 'Dashboard', path: '/recruiter/dashboard', icon: '📊' },
      { label: 'Company Profile', path: '/recruiter/company', icon: '🏢' },
      { label: 'Post a Job', path: '/recruiter/jobs/new', icon: '➕' },
      { label: 'Job Listings', path: '/recruiter/jobs', icon: '📋' },
      { label: 'Applicants', path: '/recruiter/applicants', icon: '👥' },
      { label: 'Interviews', path: '/recruiter/interviews', icon: '📅' },
      { label: 'Analytics', path: '/recruiter/analytics', icon: '📈' }
    ],
    admin: [
      { label: 'Platform Overview', path: '/admin/dashboard', icon: '📊' },
      { label: 'User Directory', path: '/admin/users', icon: '👥' },
      { label: 'Recruiter Approval', path: '/admin/recruiters', icon: '🛡️' },
      { label: 'Job Moderation', path: '/admin/jobs', icon: '⚖️' },
      { label: 'Global Analytics', path: '/admin/analytics', icon: '📈' }
    ]
  };

  const navItems = navigationConfig[user?.role] || [];

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-header">
        <span className="sidebar-role-tag">{user?.role} Portal</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path.endsWith('dashboard')}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};