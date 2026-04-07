import { useState, useEffect, useCallback } from 'react';
import { getFiles } from '../services/uploadApi';
import { useApp } from '../contexts/AppContext';

export function useFileList() {
  const { state, setUploadedFiles, addNotification } = useApp();
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchFiles = useCallback(async () => {
    if (!state.userId) return;

    setLoading(true);
    try {
      const files = await getFiles(state.userId);
      setUploadedFiles(files);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch files';
      addNotification(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [state.userId, setUploadedFiles, addNotification]);

  const refresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles, refreshKey]);

  return {
    files: state.uploadedFiles,
    loading,
    refresh,
  };
}
