import type { WebSocketMessage, ConnectionStatus } from '../types';

const WS_BASE_URL = import.meta.env.VITE_CHAT_WS_URL || 'ws://localhost:8003';

export class ChatWebSocket {
  private ws: WebSocket | null = null;
  private userId: string;
  private conversationId: string;
  private fileIds: string[];
  private onMessageCallback: ((message: string) => void) | null = null;
  private onStatusCallback: ((status: ConnectionStatus) => void) | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor(userId: string, conversationId: string, fileIds: string[] = []) {
    this.userId = userId;
    this.conversationId = conversationId;
    this.fileIds = fileIds;
  }

  connect(): void {
    const fileIdsParam = this.fileIds.length > 0 ? this.fileIds.join(',') : '';
    const wsUrl = `${WS_BASE_URL}/chat/${this.userId}/${this.conversationId}/${fileIdsParam}`;

    this.updateStatus('connecting');

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.updateStatus('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          
          // Handle different message types from backend
          if (data.type === 'answer' && data.message) {
            this.onMessageCallback?.(data.message);
          } else if (data.type === 'error') {
            console.error('WebSocket error message:', data.message);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.updateStatus('error');
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.updateStatus('disconnected');
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      this.updateStatus('error');
    }
  }

  sendMessage(message: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ message }));
    } else {
      console.error('WebSocket is not connected');
      throw new Error('WebSocket is not connected');
    }
  }

  onMessage(callback: (message: string) => void): void {
    this.onMessageCallback = callback;
  }

  onStatusChange(callback: (status: ConnectionStatus) => void): void {
    this.onStatusCallback = callback;
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnect
  }

  private updateStatus(status: ConnectionStatus): void {
    this.onStatusCallback?.(status);
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
      
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
      
      this.reconnectTimeout = setTimeout(() => {
        this.connect();
      }, delay);
    }
  }

  getStatus(): ConnectionStatus {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'disconnected';
    }
  }
}
