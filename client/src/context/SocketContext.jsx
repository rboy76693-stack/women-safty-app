import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ userId, children }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [liveAlerts, setLiveAlerts] = useState([]);

  useEffect(() => {
    // Connect to backend — use env var for deployed version, fallback to same origin for local
    const backendUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin;
    const socket = io(backendUrl, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      // Join this user's room so ALL devices with same userId get events
      socket.emit('watch:user', { userId });
    });

    socket.on('disconnect', () => setConnected(false));

    // Any device that triggers SOS → all other devices see it instantly
    socket.on('sos:triggered', (data) => {
      setLiveAlerts((prev) => [{ ...data, timestamp: new Date().toISOString() }, ...prev]);
      // Vibrate on receiving devices too
      navigator.vibrate?.([300, 100, 300]);
    });

    socket.on('sos:resolved', ({ alertId }) => {
      setLiveAlerts((prev) =>
        prev.map((a) => (a.alertId === alertId ? { ...a, status: 'RESOLVED' } : a))
      );
    });

    return () => socket.disconnect();
  }, [userId]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, liveAlerts }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext) ?? { socket: null, connected: false, liveAlerts: [] };
