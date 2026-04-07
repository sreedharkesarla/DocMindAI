import React, { useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Chip,
  Paper,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ChatWindow } from '../components/ChatWindow';
import { ChatInput } from '../components/ChatInput';
import { FileSelector } from '../components/FileSelector';
import { useChat } from '../hooks/useChat';
import { useApp } from '../contexts/AppContext';

export function ChatPage() {
  const navigate = useNavigate();
  const { state } = useApp();
  const { messages, sendMessage, isLoading, connectionStatus } = useChat(
    state.selectedFiles
  );

  useEffect(() => {
    if (!state.userId) {
      navigate('/');
    }
  }, [state.userId, navigate]);

  const getStatusColor = (): 'default' | 'success' | 'warning' | 'error' => {
    switch (connectionStatus) {
      case 'connected':
        return 'success';
      case 'connecting':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, height: 'calc(100vh - 64px)' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/')}>
            Back to Documents
          </Button>
          <Typography variant="h4" component="h1">
            Chat
          </Typography>
        </Box>
        <Chip
          label={connectionStatus.toUpperCase()}
          color={getStatusColor()}
          size="small"
        />
      </Box>

      <Grid container spacing={3} sx={{ height: 'calc(100% - 80px)' }}>
        <Grid item xs={12}>
          <FileSelector />
        </Grid>

        <Grid item xs={12} sx={{ height: 'calc(100% - 120px)' }}>
          <Box
            display="flex"
            flexDirection="column"
            height="100%"
            gap={2}
          >
            <Box flexGrow={1} overflow="hidden">
              <ChatWindow messages={messages} isLoading={isLoading} />
            </Box>

            <ChatInput
              onSendMessage={sendMessage}
              disabled={connectionStatus !== 'connected' || isLoading}
            />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
