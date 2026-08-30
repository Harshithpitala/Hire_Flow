import './Loader.css';

export const Loader = ({ message = 'Loading...', fullPage = false }) => {
  return (
    <div className={`loader-container ${fullPage ? 'loader-fullpage' : ''}`}>
      <div className="loader-spinner"></div>
      {message && <p className="loader-text">{message}</p>}
    </div>
  );
};