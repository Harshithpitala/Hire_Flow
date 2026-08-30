import { Link } from 'react-router-dom';
import { Button } from './Button';

export const EmptyState = ({
  icon = '📭',
  title = 'No records found',
  description = 'There are no items to display at this moment.',
  actionText,
  actionLabel, // compatibility alias
  actionLink,
  onAction
}) => {
  const label = actionText || actionLabel;

  return (
    <div
      className="card"
      style={{
        textAlign: 'center',
        padding: '3rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem'
      }}
    >
      <div style={{ fontSize: '2.5rem' }}>{icon}</div>
      <h3 style={{ margin: 0, color: 'var(--text)' }}>{title}</h3>
      <p style={{ margin: 0, color: 'var(--muted)', maxWidth: '420px', fontSize: '0.9375rem' }}>
        {description}
      </p>

      {label && (
        <div style={{ marginTop: '1rem' }}>
          {actionLink ? (
            <Link to={actionLink}>
              <Button variant="primary" size="md">
                {label}
              </Button>
            </Link>
          ) : onAction ? (
            <Button variant="primary" size="md" onClick={onAction}>
              {label}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
};