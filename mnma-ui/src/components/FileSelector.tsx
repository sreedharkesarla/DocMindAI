import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { Description } from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';

export function FileSelector() {
  const { state } = useApp();

  const selectedFiles = state.uploadedFiles.filter((file) =>
    state.selectedFiles.includes(file.file_id)
  );

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Context Files ({selectedFiles.length})
      </Typography>

      {selectedFiles.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No files selected. Chatting without document context.
        </Typography>
      ) : (
        <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
          {selectedFiles.map((file) => (
            <Chip
              key={file.file_id}
              icon={<Description />}
              label={file.file_name}
              size="small"
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
      )}
    </Paper>
  );
}
