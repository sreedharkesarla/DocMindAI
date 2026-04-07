import axios, { AxiosError } from 'axios';
import type { FileInfo, UploadResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_UPLOAD_API_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error handler
const handleError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    throw new Error(
      axiosError.response?.data?.detail || 
      axiosError.message || 
      'An error occurred'
    );
  }
  throw error;
};

// Upload files
export const uploadFiles = async (
  userId: string,
  files: File[],
  onProgress?: (progress: number) => void
): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await api.post<UploadResponse>(
      `/upload/upload_files/?user_id=${userId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      }
    );

    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Get files for a user
export const getFiles = async (userId: string): Promise<FileInfo[]> => {
  try {
    const response = await api.get<FileInfo[]>(`/upload/get_files/${userId}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Get file statuses for a user
export const getFilesStatus = async (userId: string): Promise<FileInfo[]> => {
  try {
    const response = await api.get<FileInfo[]>(`/upload/get_files_status/${userId}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Remove files
export const removeFile = async (
  fileIds: string[],
  userId: string
): Promise<{ message: string }> => {
  try {
    const response = await api.post<{ message: string }>('/upload/remove_file/', {
      file_ids: fileIds,
      user_id: userId,
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
