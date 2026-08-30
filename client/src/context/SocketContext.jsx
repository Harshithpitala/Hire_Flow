import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [latestToast, setLatestToast] = useState(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    let socketInstance = null;

    if (isAuthenticated && user?._id) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
      socketInstance = io(socketUrl, {
        transports: ['websocket', 'polling'],
        withCredentials: true
      });

      socketInstance.on('connect', () => {
        console.log(`[Socket Client] Connected with ID: ${socketInstance.id}`);
        // Bind to personal room
        socketInstance.emit('join_user_room', user._id);
      });

      // Global real-time alert listener
      socketInstance.on('new_notification', (notification) => {
        setLatestToast(notification);
      });

      socketInstance.on('disconnect', () => {
        console.log('[Socket Client] Disconnected from server.');
      });

      setSocket(socketInstance);
    }

    return () => {
      if (socketInstance) {
        if (user?._id) {
          socketInstance.emit('leave_user_room', user._id);
        }
        socketInstance.disconnect();
      }
    };
  }, [isAuthenticated, user?._id]);

  const clearToast = () => setLatestToast(null);

  return (
    <SocketContext.Provider value={{ socket, latestToast, clearToast }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};