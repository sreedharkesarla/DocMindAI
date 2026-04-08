import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import type { FileInfo, ConnectionStatus, Notification } from '../types';

// State interface
interface AppState {
  userId: string | null;
  selectedFiles: string[];
  uploadedFiles: FileInfo[];
  connectionStatus: ConnectionStatus;
  notifications: Notification[];
}

// Action types
type AppAction =
  | { type: 'SET_USER_ID'; payload: string }
  | { type: 'SET_SELECTED_FILES'; payload: string[] }
  | { type: 'SET_UPLOADED_FILES'; payload: FileInfo[] }
  | { type: 'UPDATE_CONNECTION_STATUS'; payload: ConnectionStatus }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' };

// Context interface
interface AppContextType {
  state: AppState;
  setUserId: (userId: string) => void;
  setSelectedFiles: (fileIds: string[]) => void;
  setUploadedFiles: (files: FileInfo[]) => void;
  updateConnectionStatus: (status: ConnectionStatus) => void;
  addNotification: (message: string, severity: Notification['severity']) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

// Initial state
const initialState: AppState = {
  userId: localStorage.getItem('minima_user_id') || null,
  selectedFiles: [],
  uploadedFiles: [],
  connectionStatus: 'disconnected',
  notifications: [],
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER_ID':
      localStorage.setItem('minima_user_id', action.payload);
      return { ...state, userId: action.payload };

    case 'SET_SELECTED_FILES':
      return { ...state, selectedFiles: action.payload };

    case 'SET_UPLOADED_FILES':
      return { ...state, uploadedFiles: action.payload };

    case 'UPDATE_CONNECTION_STATUS':
      return { ...state, connectionStatus: action.payload };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.payload),
      };

    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };

    default:
      return state;
  }
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const setUserId = useCallback((userId: string) => {
    dispatch({ type: 'SET_USER_ID', payload: userId });
  }, []);

  const setSelectedFiles = useCallback((fileIds: string[]) => {
    dispatch({ type: 'SET_SELECTED_FILES', payload: fileIds });
  }, []);

  const setUploadedFiles = useCallback((files: FileInfo[]) => {
    dispatch({ type: 'SET_UPLOADED_FILES', payload: files });
  }, []);

  const updateConnectionStatus = useCallback((status: ConnectionStatus) => {
    dispatch({ type: 'UPDATE_CONNECTION_STATUS', payload: status });
  }, []);

  const addNotification = useCallback(
    (message: string, severity: Notification['severity']) => {
      const notification: Notification = {
        id: Date.now().toString(),
        message,
        severity,
        timestamp: new Date(),
      };
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });

      // Auto-remove after 5 seconds
      setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: notification.id });
      }, 5000);
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  }, []);

  const clearNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  }, []);

  const value: AppContextType = {
    state,
    setUserId,
    setSelectedFiles,
    setUploadedFiles,
    updateConnectionStatus,
    addNotification,
    removeNotification,
    clearNotifications,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
