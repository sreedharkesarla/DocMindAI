import React from 'react';
import { Chip } from '@mui/material';
import type { FileStatus } from '../types';

interface StatusIndicatorProps {
  status: string;
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const getStatusColor = (status: string): 'default' | 'primary' | 'success' | 'error' => {
    switch (status.toLowerCase()) {
      case 'uploaded':
        return 'default';
      case 'processing':
        return 'primary';
      case 'indexed':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Chip
      label={getStatusLabel(status)}
      color={getStatusColor(status)}
      size="small"
      sx={{ minWidth: 80 }}
    />
  );
}
