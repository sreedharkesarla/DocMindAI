import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  Typography,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Delete, Refresh, Chat } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { StatusIndicator } from './StatusIndicator';
import { useFileList } from '../hooks/useFileList';
import { useApp } from '../contexts/AppContext';
import { removeFile } from '../services/uploadApi';

export function FileList() {
  const navigate = useNavigate();
  const { state, setSelectedFiles, addNotification } = useApp();
  const { files, loading, refresh } = useFileList();
  const [selected, setSelected] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const indexedFiles = files
        .filter((f) => f.status === 'indexed')
        .map((f) => f.file_id);
      setSelected(indexedFiles);
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (fileId: string) => {
    setSelected((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  };

  const handleDelete = async () => {
    if (!state.userId || selected.length === 0) return;

    setDeleting(true);
    try {
      await removeFile(selected, state.userId);
      addNotification('Files deleted successfully', 'success');
      setSelected([]);
      refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete files';
      addNotification(message, 'error');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleChatWithSelected = () => {
    const indexedSelected = selected.filter((id) =>
      files.find((f) => f.file_id === id && f.status === 'indexed')
    );

    if (indexedSelected.length === 0) {
      addNotification('Please select indexed files to chat', 'warning');
      return;
    }

    setSelectedFiles(indexedSelected);
    navigate('/chat');
  };

  if (!state.userId) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary" align="center">
          Please log in to view your files
        </Typography>
      </Paper>
    );
  }

  if (loading && files.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  const indexedCount = files.filter((f) => f.status === 'indexed').length;
  const selectedIndexed = selected.filter((id) =>
    files.find((f) => f.file_id === id && f.status === 'indexed')
  );

  return (
    <>
      <Paper>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            My Files ({files.length}) - {indexedCount} Indexed
          </Typography>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<Chat />}
              onClick={handleChatWithSelected}
              disabled={selectedIndexed.length === 0}
            >
              Chat ({selectedIndexed.length})
            </Button>
            <IconButton onClick={refresh} disabled={loading} color="primary">
              <Refresh />
            </IconButton>
            <IconButton
              onClick={() => setDeleteDialogOpen(true)}
              disabled={selected.length === 0 || deleting}
              color="error"
            >
              <Delete />
            </IconButton>
          </Box>
        </Box>

        {files.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No files uploaded yet. Upload files to get started.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={
                        selected.length > 0 && selected.length < indexedCount
                      }
                      checked={indexedCount > 0 && selected.length === indexedCount}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>File Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>File ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {files.map((file) => {
                  const isIndexed = file.status === 'indexed';
                  const isSelected = selected.includes(file.file_id);

                  return (
                    <TableRow
                      key={file.file_id}
                      hover
                      selected={isSelected}
                      onClick={() => isIndexed && handleSelect(file.file_id)}
                      sx={{ cursor: isIndexed ? 'pointer' : 'default' }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          disabled={!isIndexed}
                          onChange={() => handleSelect(file.file_id)}
                        />
                      </TableCell>
                      <TableCell>{file.file_name}</TableCell>
                      <TableCell>
                        <StatusIndicator status={file.status} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {file.file_id.substring(0, 8)}...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selected.length} file(s)? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
