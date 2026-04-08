import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatWebSocket } from '../services/chatWebSocket';
import { useApp } from '../contexts/AppContext';
import type { ChatMessage } from '../types';

export function useChat(fileIds: string[] = []) {
  const { state, updateConnectionStatus, addNotification } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const wsRef = useRef<ChatWebSocket | null>(null);
  const conversationIdRef = useRef<string>(uuidv4());

  // Initialize WebSocket connection
  useEffect(() => {
    if (!state.userId) return;

    const ws = new ChatWebSocket(state.userId, conversationIdRef.current, fileIds);
    wsRef.current = ws;

    ws.onStatusChange((status) => {
      updateConnectionStatus(status);
      
      if (status === 'error') {
        addNotification('Connection error. Retrying...', 'warning');
      } else if (status === 'connected') {
        addNotification('Connected to chat', 'success');
      }
    });

    ws.onMessage((message) => {
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    });

    ws.connect();

    return () => {
      ws.disconnect();
      updateConnectionStatus('disconnected');
    };
  }, [state.userId, fileIds, updateConnectionStatus, addNotification]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!wsRef.current || !content.trim()) return;

      const userMessage: ChatMessage = {
        id: uuidv4(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        wsRef.current.sendMessage(content.trim());
      } catch (error) {
        setIsLoading(false);
        const message = error instanceof Error ? error.message : 'Failed to send message';
        addNotification(message, 'error');
      }
    },
    [addNotification]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    // Create new conversation
    conversationIdRef.current = uuidv4();
    
    if (wsRef.current && state.userId) {
      wsRef.current.disconnect();
      const ws = new ChatWebSocket(state.userId, conversationIdRef.current, fileIds);
      wsRef.current = ws;
      ws.connect();
    }
  }, [state.userId, fileIds]);

  return {
    messages,
    sendMessage,
    clearMessages,
    isLoading,
    connectionStatus: state.connectionStatus,
  };
}
