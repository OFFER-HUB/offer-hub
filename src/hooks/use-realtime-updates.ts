import { useEffect, useRef, useState, useCallback } from 'react';
import { getWebSocketService, WebSocketMessage, WebSocketService } from '../services/websocket.service';
import { toast } from 'sonner';

export interface RealtimeUpdateOptions {
  enableNotifications?: boolean;
  autoConnect?: boolean;
  onConfigurationUpdate?: (data: any) => void;
  onPolicyUpdate?: (data: any) => void;
  onFeatureToggleUpdate?: (data: any) => void;
  onAuditLog?: (data: any) => void;
  onSystemHealth?: (data: any) => void;
}

export interface RealtimeUpdateHook {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  connect: () => Promise<void>;
  disconnect: () => void;
  sendMessage: (message: Partial<WebSocketMessage>) => void;
  subscribe: (type: string, handler: (message: WebSocketMessage) => void) => () => void;
  lastMessage: WebSocketMessage | null;
  messageCount: number;
}

export const useRealtimeUpdates = (options: RealtimeUpdateOptions = {}): RealtimeUpdateHook => {
  const {
    enableNotifications = true,
    autoConnect = true,
    onConfigurationUpdate,
    onPolicyUpdate,
    onFeatureToggleUpdate,
    onAuditLog,
    onSystemHealth,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [messageCount, setMessageCount] = useState(0);

  const wsServiceRef = useRef<WebSocketService | null>(null);
  const unsubscribeRef = useRef<Array<() => void>>([]);

  // Initialize WebSocket service
  useEffect(() => {
    if (!wsServiceRef.current) {
      wsServiceRef.current = getWebSocketService({
        onConnect: () => {
          setIsConnected(true);
          setConnectionStatus('connected');
          if (enableNotifications) {
            toast.success('Real-time updates connected');
          }
        },
        onDisconnect: () => {
          setIsConnected(false);
          setConnectionStatus('disconnected');
          if (enableNotifications) {
            toast.info('Real-time updates disconnected');
          }
        },
        onError: (error) => {
          setConnectionStatus('error');
          if (enableNotifications) {
            toast.error('Real-time updates error');
          }
          console.error('WebSocket error:', error);
        },
        onMessage: (message) => {
          setLastMessage(message);
          setMessageCount(prev => prev + 1);
        },
      });
    }

    return () => {
      // Cleanup on unmount
      unsubscribeRef.current.forEach(unsubscribe => unsubscribe());
      wsServiceRef.current?.disconnect();
    };
  }, [enableNotifications]);

  // Subscribe to specific message types
  useEffect(() => {
    if (!wsServiceRef.current) return;

    const unsubscribers: Array<() => void> = [];

    if (onConfigurationUpdate) {
      const unsubscribe = wsServiceRef.current.subscribe('configuration_update', onConfigurationUpdate);
      unsubscribers.push(unsubscribe);
    }

    if (onPolicyUpdate) {
      const unsubscribe = wsServiceRef.current.subscribe('policy_update', onPolicyUpdate);
      unsubscribers.push(unsubscribe);
    }

    if (onFeatureToggleUpdate) {
      const unsubscribe = wsServiceRef.current.subscribe('feature_toggle_update', onFeatureToggleUpdate);
      unsubscribers.push(unsubscribe);
    }

    if (onAuditLog) {
      const unsubscribe = wsServiceRef.current.subscribe('audit_log', onAuditLog);
      unsubscribers.push(unsubscribe);
    }

    if (onSystemHealth) {
      const unsubscribe = wsServiceRef.current.subscribe('system_health', onSystemHealth);
      unsubscribers.push(unsubscribe);
    }

    unsubscribeRef.current = unsubscribers;

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [onConfigurationUpdate, onPolicyUpdate, onFeatureToggleUpdate, onAuditLog, onSystemHealth]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && wsServiceRef.current) {
      connect();
    }
  }, [autoConnect]);

  // Update connection status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (wsServiceRef.current) {
        setConnectionStatus(wsServiceRef.current.getConnectionStatus());
        setIsConnected(wsServiceRef.current.isConnected());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const connect = useCallback(async () => {
    if (wsServiceRef.current) {
      try {
        setConnectionStatus('connecting');
        await wsServiceRef.current.connect();
      } catch (error) {
        setConnectionStatus('error');
        console.error('Failed to connect to WebSocket:', error);
        if (enableNotifications) {
          toast.error('Failed to connect to real-time updates');
        }
      }
    }
  }, [enableNotifications]);

  const disconnect = useCallback(() => {
    if (wsServiceRef.current) {
      wsServiceRef.current.disconnect();
      setIsConnected(false);
      setConnectionStatus('disconnected');
    }
  }, []);

  const sendMessage = useCallback((message: Partial<WebSocketMessage>) => {
    if (wsServiceRef.current) {
      wsServiceRef.current.send(message);
    }
  }, []);

  const subscribe = useCallback((type: string, handler: (message: WebSocketMessage) => void) => {
    if (wsServiceRef.current) {
      return wsServiceRef.current.subscribe(type, handler);
    }
    return () => {}; // No-op unsubscribe function
  }, []);

  return {
    isConnected,
    connectionStatus,
    connect,
    disconnect,
    sendMessage,
    subscribe,
    lastMessage,
    messageCount,
  };
};

/**
 * Hook for configuration-specific real-time updates
 */
export const useConfigurationRealtimeUpdates = (onUpdate?: (data: any) => void) => {
  return useRealtimeUpdates({
    onConfigurationUpdate: onUpdate,
  });
};

/**
 * Hook for policy-specific real-time updates
 */
export const usePolicyRealtimeUpdates = (onUpdate?: (data: any) => void) => {
  return useRealtimeUpdates({
    onPolicyUpdate: onUpdate,
  });
};

/**
 * Hook for feature toggle-specific real-time updates
 */
export const useFeatureToggleRealtimeUpdates = (onUpdate?: (data: any) => void) => {
  return useRealtimeUpdates({
    onFeatureToggleUpdate: onUpdate,
  });
};

/**
 * Hook for system health monitoring
 */
export const useSystemHealthMonitoring = (onHealthUpdate?: (data: any) => void) => {
  return useRealtimeUpdates({
    onSystemHealth: onHealthUpdate,
    enableNotifications: true,
  });
};
