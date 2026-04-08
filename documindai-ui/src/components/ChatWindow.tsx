import React, { useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  CircularProgress,
} from '@mui/material';
import { Person, SmartToy } from '@mui/icons-material';
import type { ChatMessage } from '../types';

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

export function ChatWindow({ messages, isLoading }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <Paper
        sx={{
          p: 4,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
        }}
      >
        <Typography variant="body1" color="text.secondary" align="center">
          No messages yet. Start a conversation by asking a question below.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        height: '100%',
        overflow: 'auto',
        p: 2,
        backgroundColor: '#f5f5f5',
      }}
    >
      {messages.map((message) => {
        const isUser = message.role === 'user';

        return (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              mb: 2,
              justifyContent: isUser ? 'flex-end' : 'flex-start',
            }}
          >
            {!isUser && (
              <Avatar sx={{ bgcolor: '#1976d2', mr: 1 }}>
                <SmartToy />
              </Avatar>
            )}

            <Paper
              sx={{
                p: 2,
                maxWidth: '70%',
                backgroundColor: isUser ? '#1976d2' : '#fff',
                color: isUser ? '#fff' : 'text.primary',
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {message.content}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 1,
                  opacity: 0.7,
                }}
              >
                {message.timestamp.toLocaleTimeString()}
              </Typography>
            </Paper>

            {isUser && (
              <Avatar sx={{ bgcolor: '#424242', ml: 1 }}>
                <Person />
              </Avatar>
            )}
          </Box>
        );
      })}

      {isLoading && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Avatar sx={{ bgcolor: '#1976d2', mr: 1 }}>
            <SmartToy />
          </Avatar>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <CircularProgress size={20} />
              <Typography variant="body2">Thinking...</Typography>
            </Box>
          </Paper>
        </Box>
      )}

      <div ref={messagesEndRef} />
    </Paper>
  );
}
