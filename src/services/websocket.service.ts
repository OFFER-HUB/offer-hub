import { toast } from 'sonner';

export interface WebSocketMessage {
  type: 'configuration_update' | 'policy_update' | 'feature_toggle_update' | 'audit_log' | 'system_health' | 'notification';
  data: Record<string, unknown>;
  timestamp: Date;
  source: string;
}

export interface WebSocketConnectionOptions {
  url?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectInterval: number;
  private maxReconnectAttempts: number;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private messageHandlers: Map<string, Array<(message: WebSocketMessage) => void>> = new Map();
  private connectionOptions: WebSocketConnectionOptions;

  constructor(options: WebSocketConnectionOptions = {}) {
    this.url = options.url || this.getWebSocketUrl();
    this.reconnectInterval = options.reconnectInterval || 5000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
    this.connectionOptions = options;
  }

  /**
   * Get WebSocket URL based on environment
   */
  private getWebSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws/admin`;
  }

  /**
   * Connect to WebSocket
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      this.isConnecting = true;

      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          console.log('WebSocket connected');
          this.connectionOptions.onConnect?.();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          this.isConnecting = false;
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.connectionOptions.onDisconnect?.();
          
          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          this.isConnecting = false;
          console.error('WebSocket error:', error);
          this.connectionOptions.onError?.(error);
          reject(error);
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }

  /**
   * Send message through WebSocket
   */
  send(message: Partial<WebSocketMessage>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const fullMessage: WebSocketMessage = {
        type: message.type || 'notification',
        data: message.data || {},
        timestamp: new Date(),
        source: 'admin-client',
        ...message,
      };
      
      this.ws.send(JSON.stringify(fullMessage));
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  }

  /**
   * Subscribe to specific message types
   */
  subscribe(type: string, handler: (message: WebSocketMessage) => void): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    
    this.messageHandlers.get(type)!.push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(type);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: WebSocketMessage): void {
    // Call general message handler
    this.connectionOptions.onMessage?.(message);

    // Call specific type handlers
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('Error in WebSocket message handler:', error);
        }
      });
    }

    // Handle specific message types
    this.handleSpecificMessage(message);
  }

  /**
   * Handle specific message types with built-in logic
   */
  private handleSpecificMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'configuration_update':
        this.handleConfigurationUpdate(message);
        break;
      case 'policy_update':
        this.handlePolicyUpdate(message);
        break;
      case 'feature_toggle_update':
        this.handleFeatureToggleUpdate(message);
        break;
      case 'audit_log':
        this.handleAuditLog(message);
        break;
      case 'system_health':
        this.handleSystemHealth(message);
        break;
      case 'notification':
        this.handleNotification(message);
        break;
    }
  }

  /**
   * Handle configuration updates
   */
  private handleConfigurationUpdate(message: WebSocketMessage): void {
    const { configurationId, key, value, changedBy } = message.data as {
      configurationId: string;
      key: string;
      value: unknown;
      changedBy: string;
    };

    toast.info(`Configuration updated: ${key}`, {
      description: `Changed by ${changedBy}`,
      action: {
        label: 'View',
        onClick: () => {
          // Navigate to configuration or show details
          console.log('Navigate to configuration:', configurationId);
        },
      },
    });
  }

  /**
   * Handle policy updates
   */
  private handlePolicyUpdate(message: WebSocketMessage): void {
    const { policyId, name, status, changedBy } = message.data as {
      policyId: string;
      name: string;
      status: string;
      changedBy: string;
    };

    toast.info(`Policy updated: ${name}`, {
      description: `Status: ${status} by ${changedBy}`,
      action: {
        label: 'View',
        onClick: () => {
          console.log('Navigate to policy:', policyId);
        },
      },
    });
  }

  /**
   * Handle feature toggle updates
   */
  private handleFeatureToggleUpdate(message: WebSocketMessage): void {
    const { toggleId, key, status, changedBy } = message.data as {
      toggleId: string;
      key: string;
      status: string;
      changedBy: string;
    };

    toast.info(`Feature toggle updated: ${key}`, {
      description: `Status: ${status} by ${changedBy}`,
      action: {
        label: 'View',
        onClick: () => {
          console.log('Navigate to feature toggle:', toggleId);
        },
      },
    });
  }

  /**
   * Handle audit logs
   */
  private handleAuditLog(message: WebSocketMessage): void {
    const { action, entityType, entityId, changedBy } = message.data as {
      action: string;
      entityType: string;
      entityId: string;
      changedBy: string;
    };

    // Only show important audit events as toasts
    if (['delete', 'rollback', 'enforce'].includes(action)) {
      toast.warning(`Audit: ${action} on ${entityType}`, {
        description: `Entity: ${entityId} by ${changedBy}`,
      });
    }
  }

  /**
   * Handle system health updates
   */
  private handleSystemHealth(message: WebSocketMessage): void {
    const { status, message: healthMessage, services } = message.data as {
      status: 'healthy' | 'warning' | 'critical';
      message: string;
      services: Record<string, string>;
    };

    if (status === 'critical') {
      toast.error('System Health: Critical', {
        description: healthMessage,
      });
    } else if (status === 'warning') {
      toast.warning('System Health: Warning', {
        description: healthMessage,
      });
    }
  }

  /**
   * Handle general notifications
   */
  private handleNotification(message: WebSocketMessage): void {
    const { title, message: notificationMessage, type } = message.data as {
      title: string;
      message: string;
      type: 'info' | 'success' | 'warning' | 'error';
    };

    switch (type) {
      case 'success':
        toast.success(title, { description: notificationMessage });
        break;
      case 'warning':
        toast.warning(title, { description: notificationMessage });
        break;
      case 'error':
        toast.error(title, { description: notificationMessage });
        break;
      default:
        toast.info(title, { description: notificationMessage });
        break;
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      this.connect().catch((error) => {
        console.error('Reconnection failed:', error);
      });
    }, this.reconnectInterval);
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): 'connecting' | 'connected' | 'disconnected' | 'error' {
    if (this.isConnecting) return 'connecting';
    if (this.ws?.readyState === WebSocket.OPEN) return 'connected';
    if (this.ws?.readyState === WebSocket.CLOSED) return 'disconnected';
    return 'error';
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
let wsServiceInstance: WebSocketService | null = null;

/**
 * Get WebSocket service singleton
 */
export const getWebSocketService = (options?: WebSocketConnectionOptions): WebSocketService => {
  if (!wsServiceInstance) {
    wsServiceInstance = new WebSocketService(options);
  }
  return wsServiceInstance;
};

/**
 * Initialize WebSocket connection
 */
export const initializeWebSocket = async (options?: WebSocketConnectionOptions): Promise<WebSocketService> => {
  const service = getWebSocketService(options);
  await service.connect();
  return service;
};
