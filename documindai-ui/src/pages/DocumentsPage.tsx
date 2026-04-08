import React, { useEffect } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { UserLogin } from '../components/UserLogin';
import { FileUploadZone } from '../components/FileUploadZone';
import { FileList } from '../components/FileList';
import { useFileList } from '../hooks/useFileList';

export function DocumentsPage() {
  const { refresh } = useFileList();

  // Auto-refresh to detect status changes
  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Document Management
      </Typography>

      <UserLogin />

      <Box mb={3}>
        <FileUploadZone onUploadComplete={refresh} />
      </Box>

      <FileList />
    </Container>
  );
}
