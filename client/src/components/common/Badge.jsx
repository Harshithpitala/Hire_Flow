import './Badge.css';

export const Badge = ({ children, variant = 'info', size = 'md' }) => {
  return <span className={`badge badge-${variant} badge-${size}`}>{children}</span>;
};