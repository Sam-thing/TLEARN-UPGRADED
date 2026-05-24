// src/contexts/SocketContext.jsx

import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '');

export const SocketProvider = ({ children }) => {
  const [socket, setSocket]       = useState(null);
  const [connected, setConnected] = useState(false);
  const [transport, setTransport] = useState(null); // 'websocket' | 'polling'
  const { user, authReady }       = useAuth();
  const socketRef                 = useRef(null);
  const reconnectAttempts         = useRef(0);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
      setTransport(null);
    }
  }, []);

  useEffect(() => {
    // Don't even try until auth is resolved and user is logged in
    if (!authReady || !user) {
      disconnect();
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    // Prevent duplicate connections
    if (socketRef.current?.connected) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token },

      // Start with polling — works immediately even on cold-start.
      // Socket.io will upgrade to websocket automatically when ready.
      transports: ['polling', 'websocket'],

      // Reconnection with exponential backoff
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,  // max 30s between retries
      randomizationFactor: 0.5,

      // Give Render more time to wake up
      timeout: 20000,

      // Don't upgrade too aggressively on first connect
      upgrade: true,
      rememberUpgrade: false,
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log(`✅ Socket connected via ${newSocket.io.engine.transport.name}`);
      setConnected(true);
      reconnectAttempts.current = 0;
      setTransport(newSocket.io.engine.transport.name);

      // Join personal notification room
      if (user?._id) newSocket.emit('authenticate', user._id);
    });

    // Track transport upgrades (polling → websocket)
    newSocket.io.engine.on('upgrade', () => {
      setTransport(newSocket.io.engine.transport.name);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setConnected(false);
      setTransport(null);

      // If server forced disconnect (e.g. restart), don't auto-reconnect immediately
      if (reason === 'io server disconnect') {
        setTimeout(() => newSocket.connect(), 2000);
      }
    });

    newSocket.on('connect_error', (err) => {
      reconnectAttempts.current += 1;
      console.warn(`Socket connect error (attempt ${reconnectAttempts.current}):`, err.message);
      setConnected(false);

      // After 3 failed websocket attempts, force polling-only mode
      if (reconnectAttempts.current >= 3 && newSocket.io.opts.transports?.includes('websocket')) {
        console.log('Falling back to polling-only mode');
        newSocket.io.opts.transports = ['polling'];
      }
    });

    setSocket(newSocket);

    return () => {
      disconnect();
    };
  }, [user, authReady, disconnect]);

  return (
    <SocketContext.Provider value={{ socket, connected, transport }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};