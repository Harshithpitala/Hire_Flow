import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import './Toast.css';

export const Toast = () => {
  const { latestToast, clearToast } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (latestToast) {
      const timer = setTimeout(() => {
        clearToast();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [latestToast]);

  if (!latestToast) return null;

  const handleClick = () => {
    if (latestToast.link) {
      navigate(latestToast.link);
    }
    clearToast();
  };

  return (
    <div className="toast-container" onClick={handleClick}>
      <div className="toast-card card">
        <div className="toast-icon">🔔</div>
        <div className="toast-content">
          <strong className="toast-title">{latestToast.title}</strong>
          <p className="toast-message">{latestToast.message}</p>
        </div>
        <button
          type="button"
          className="toast-close-btn"
          onClick={(e) => {
            e.stopPropagation();
            clearToast();
          }}
        >
          &times;
        </button>
      </div>
    </div>
  );
};