import React, { useState } from 'react';
import { Box, TextField, Button, Paper, Typography } from '@mui/material';
import { useApp } from '../contexts/AppContext';

export function UserLogin() {
  const { state, setUserId } = useApp();
  const [inputValue, setInputValue] = useState(state.userId || '');

  const handleLogin = () => {
    if (inputValue.trim()) {
      setUserId(inputValue.trim());
    }
  };

  const handleLogout = () => {
    setUserId('');
    setInputValue('');
    localStorage.removeItem('minima_user_id');
  };

  if (state.userId) {
    return (
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="body1">
            Logged in as: <strong>{state.userId}</strong>
          </Typography>
          <Button variant="outlined" size="small" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Login
      </Typography>
      <Box display="flex" gap={2} alignItems="flex-start">
        <TextField
          label="User ID"
          variant="outlined"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          placeholder="Enter your user ID"
          fullWidth
          size="small"
        />
        <Button
          variant="contained"
          onClick={handleLogin}
          disabled={!inputValue.trim()}
          sx={{ minWidth: 100 }}
        >
          Login
        </Button>
      </Box>
    </Paper>
  );
}
