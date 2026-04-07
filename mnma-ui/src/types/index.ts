// File information from backend
export interface FileInfo {
  id: number;
  file_id: string;
  user_id: string;
  file_name: string;
  status: string;
  created_at?: string;
}

// Upload response from backend
export interface UploadResponse {
  files: {
    user_id: string;
    file_id: string;
    file_path: string;
    filename: string;
  }[];
}

// Chat message
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// WebSocket connection status
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

// WebSocket message from backend
export interface WebSocketMessage {
  reporter: string;
  type: string;
  message: string;
}

// File status type
export type FileStatus = 'uploaded' | 'processing' | 'indexed' | 'error';

// Notification type
export interface Notification {
  id: string;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
  timestamp: Date;
}
