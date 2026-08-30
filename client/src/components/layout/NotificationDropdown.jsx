import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';
import { useSocket } from '../../context/SocketContext';
import './NotificationDropdown.css';

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { socket } = useSocket();

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 60000); // 60s backup poll
    return () => clearInterval(interval);
  }, []);

  // Real-time Socket Event Listener
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, [socket]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      if (res.success) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err.message);
    }
  };

  const handleMarkAsRead = async (id, link) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setIsOpen(false);
      if (link) navigate(link);
    } catch (err) {
      console.error('Failed to mark read:', err.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatRelativeTime = (dateStr) => {
    const diffMs = new Date() - new Date(dateStr);
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'INTERVIEW_SCHEDULED':
        return '📅';
      case 'APPLICATION_STATUS':
        return '📝';
      case 'JOB_ALERT':
        return '💼';
      default:
        return '🔔';
    }
  };

  return (
    <div className="notif-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className="notif-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <span className="bell-symbol">🔔</span>
        {unreadCount > 0 && (
          <span className="notif-badge-bubble">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notif-menu-card card">
          <div className="notif-header">
            <div className="notif-title-group">
              <h4>Notifications</h4>
              {unreadCount > 0 && (
                <span className="notif-unread-tag">{unreadCount} new</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                className="mark-all-btn"
                onClick={handleMarkAllAsRead}
                disabled={loading}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="notif-list-body">
            {notifications.length === 0 ? (
              <div className="notif-empty-state">
                <span className="empty-bell-icon">🔕</span>
                <p>No notifications yet</p>
                <small>Updates regarding your applications will appear here.</small>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`notif-item ${!notif.isRead ? 'notif-unread' : ''}`}
                  onClick={() => handleMarkAsRead(notif._id, notif.link)}
                >
                  <div className="notif-icon-circle">
                    {getTypeIcon(notif.type)}
                  </div>
                  <div className="notif-text-content">
                    <div className="notif-item-top">
                      <strong className="notif-title-text">{notif.title}</strong>
                      <span className="notif-time-text">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>
                    <p className="notif-body-text">{notif.message}</p>
                  </div>
                  {!notif.isRead && <span className="unread-dot-indicator" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};