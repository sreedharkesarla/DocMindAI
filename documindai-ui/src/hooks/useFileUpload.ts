import { useState, useCallback } from 'react';
import { uploadFiles as uploadFilesApi } from '../services/uploadApi';
import { useApp } from '../contexts/AppContext';

export function useFileUpload() {
  const { state, addNotification } = useApp();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (!state.userId) {
        addNotification('Please log in first', 'error');
        return;
      }

      setUploading(true);
      setProgress(0);

      try {
        await uploadFilesApi(state.userId, files, (p) => setProgress(p));
        addNotification('Files uploaded successfully', 'success');
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Upload failed';
        addNotification(message, 'error');
        return false;
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [state.userId, addNotification]
  );

  return { uploadFiles, uploading, progress };
}
