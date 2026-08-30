import './ErrorMessage.css';

export const ErrorMessage = ({ message, onRetry }) => {
  if (!message) return null;
  return (
    <div className="error-banner">
      <div className="error-banner-content">
        <span className="error-icon">⚠️</span>
        <span className="error-text">{message}</span>
      </div>
      {onRetry && (
        <button type="button" className="error-retry-btn" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
};