'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (url: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [botStatus, setBotStatus] = useState<any>(null);
  const [otpEvent, setOtpEvent] = useState<any>(null);

  useEffect(() => {
    const socketInstance = io(url, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('bot_status', (data) => {
      setBotStatus(data);
    });

    socketInstance.on('otp_event', (data) => {
      setOtpEvent(data);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [url]);

  return { socket, isConnected, botStatus, otpEvent };
};
