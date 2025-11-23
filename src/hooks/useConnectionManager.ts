import { useCallback, useEffect, useRef, useState } from 'react';
import { RealtimeClient } from '@openai/realtime-api-beta';

interface ConnectionManagerProps {
  client: RealtimeClient;
  onError: (error: any, type: 'network' | 'connection') => void;
}

export const useConnectionManager = ({ client, onError }: ConnectionManagerProps) => {
  const [connectionState, setConnectionState] = useState<'connected' | 'disconnected' | 'connecting' | 'reconnecting'>('disconnected');
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const attemptReconnect = useCallback(async () => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      setConnectionState('disconnected');
      onError(new Error('연결 재시도 횟수를 초과했습니다.'), 'connection');
      return;
    }

    reconnectAttempts.current += 1;
    setConnectionState('reconnecting');

    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current - 1), 10000);
    console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`);

    reconnectTimeoutRef.current = setTimeout(async () => {
      try {
        await client.connect();
        console.log('Reconnected successfully');
        reconnectAttempts.current = 0;
        setConnectionState('connected');
      } catch (error) {
        console.error('Reconnection failed:', error);
        attemptReconnect();
      }
    }, delay);
  }, [client, onError]);

  const handleDisconnect = useCallback((event: any) => {
    console.log('Connection lost, attempting to reconnect...', event);
    setConnectionState('disconnected');
    attemptReconnect();
  }, [attemptReconnect]);

  const connect = useCallback(async () => {
    try {
      setConnectionState('connecting');
      await client.connect();
      setConnectionState('connected');
      reconnectAttempts.current = 0;
    } catch (error) {
      console.error('Connection failed:', error);
      setConnectionState('disconnected');
      onError(error, 'connection');
      throw error;
    }
  }, [client, onError]);

  const disconnect = useCallback(async () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    reconnectAttempts.current = 0;
    client.disconnect();
    setConnectionState('disconnected');
  }, [client]);

  const resetReconnectAttempts = useCallback(() => {
    reconnectAttempts.current = 0;
  }, []);

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    connectionState,
    connect,
    disconnect,
    resetReconnectAttempts,
    handleDisconnect,
  };
};
