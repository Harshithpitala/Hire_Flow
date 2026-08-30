import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';

export const UnauthorizedPage = () => {
  return (
    <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
      <h1 style={{ fontSize: '3rem', color: 'var(--danger)', marginBottom: '1rem' }}>403</h1>
      <h2 style={{ marginBottom: '1rem' }}>Access Denied</h2>
      <p style={{ color: 'var(--muted)', maxWidth: '480px', margin: '0 auto 2rem auto' }}>
        You do not have the required permissions or role tier to view this resource.
      </p>
      <Link to="/">
        <Button variant="primary">Return to Home</Button>
      </Link>
    </div>
  );
};