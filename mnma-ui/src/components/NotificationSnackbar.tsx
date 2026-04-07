import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useApp } from '../contexts/AppContext';

export function NotificationSnackbar() {
  const { state, removeNotification } = useApp();

  return (
    <>
      {state.notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={5000}
          onClose={() => removeNotification(notification.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => removeNotification(notification.id)}
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
}
