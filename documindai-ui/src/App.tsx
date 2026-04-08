import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, AppBar, Toolbar, Typography } from '@mui/material';
import { AppProvider } from './contexts/AppContext';
import { DocumentsPage } from './pages/DocumentsPage';
import { ChatPage } from './pages/ChatPage';
import { NotificationSnackbar } from './components/NotificationSnackbar';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <BrowserRouter>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div">
                DocuMindAI - Document Intelligence
              </Typography>
            </Toolbar>
          </AppBar>

          <Routes>
            <Route path="/" element={<DocumentsPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <NotificationSnackbar />
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
