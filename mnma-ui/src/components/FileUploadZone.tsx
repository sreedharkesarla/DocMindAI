import React, { useCallback, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { useFileUpload } from '../hooks/useFileUpload';
import { useApp } from '../contexts/AppContext';

interface FileUploadZoneProps {
  onUploadComplete?: () => void;
}

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/markdown',
  'text/csv',
];

export function FileUploadZone({ onUploadComplete }: FileUploadZoneProps) {
  const { state, addNotification } = useApp();
  const { uploadFiles, uploading, progress } = useFileUpload();
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const validateFiles = (files: FileList): File[] => {
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    Array.from(files).forEach((file) => {
      if (ALLOWED_TYPES.includes(file.type)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      addNotification(
        `Invalid file types: ${invalidFiles.join(', ')}. Allowed: PDF, DOC, DOCX, XLS, XLSX, TXT, MD, CSV`,
        'warning'
      );
    }

    return validFiles;
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (!state.userId) {
        addNotification('Please log in first', 'error');
        return;
      }

      const files = validateFiles(e.dataTransfer.files);
      if (files.length > 0) {
        const success = await uploadFiles(files);
        if (success && onUploadComplete) {
          onUploadComplete();
        }
      }
    },
    [state.userId, uploadFiles, onUploadComplete, addNotification]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!state.userId) {
        addNotification('Please log in first', 'error');
        return;
      }

      if (e.target.files && e.target.files.length > 0) {
        const files = validateFiles(e.target.files);
        if (files.length > 0) {
          const success = await uploadFiles(files);
          if (success && onUploadComplete) {
            onUploadComplete();
          }
        }
      }
    },
    [state.userId, uploadFiles, onUploadComplete, addNotification]
  );

  return (
    <Paper
      sx={{
        p: 4,
        border: dragActive ? '2px dashed #1976d2' : '2px dashed #ccc',
        backgroundColor: dragActive ? '#f0f7ff' : 'transparent',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        id="file-upload"
        disabled={!state.userId || uploading}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.md,.csv"
      />
      <label htmlFor="file-upload" style={{ cursor: 'pointer', width: '100%', display: 'block' }}>
        <CloudUpload sx={{ fontSize: 48, color: dragActive ? '#1976d2' : '#999', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {dragActive ? 'Drop files here' : 'Drag & drop files here'}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          or
        </Typography>
        <Button
          variant="contained"
          component="span"
          disabled={!state.userId || uploading}
          sx={{ mt: 1 }}
        >
          Browse Files
        </Button>
        <Typography variant="caption" display="block" sx={{ mt: 2 }} color="text.secondary">
          Supported: PDF, DOC, DOCX, XLS, XLSX, TXT, MD, CSV
        </Typography>
      </label>

      {uploading && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" gutterBottom>
            Uploading... {progress}%
          </Typography>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
      )}
    </Paper>
  );
}
