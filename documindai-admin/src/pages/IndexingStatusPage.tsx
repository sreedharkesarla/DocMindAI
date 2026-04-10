import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Refresh,
  PlayArrow,
  CheckCircle,
  HourglassEmpty,
} from '@mui/icons-material';
import { getIndexingStatus } from '../services/adminApi';

interface ProcessingFile {
  fileId: string;
  userId: string;
  filename: string;
  status: string;
}

interface IndexingStatusData {
  processing_files: ProcessingFile[];
  total_processing: number;
}

export const IndexingStatusPage: React.FC = () => {
  const [statusData, setStatusData] = useState<IndexingStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadStatus = async () => {
    try {
      setError(null);
      const data = await getIndexingStatus();
      setStatusData(data);
    } catch (err) {
      setError('Failed to load indexing status');
      console.error('Error fetching indexing status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleRefresh = () => {
    setLoading(true);
    loadStatus();
  };

  if (loading && !statusData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Indexing Status
        </Typography>
        <Box display="flex" gap={1}>
          <Chip
            icon={autoRefresh ? <PlayArrow /> : <HourglassEmpty />}
            label={autoRefresh ? 'Auto-refresh: 5s' : 'Auto-refresh: Off'}
            color={autoRefresh ? 'success' : 'default'}
            onClick={() => setAutoRefresh(!autoRefresh)}
            sx={{ cursor: 'pointer' }}
          />
          <Tooltip title="Refresh now">
            <IconButton onClick={handleRefresh} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <HourglassEmpty color="warning" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {statusData?.total_processing ?? 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Files Being Indexed
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Box p={2} borderBottom="1px solid rgba(224, 224, 224, 1)">
          <Typography variant="h6" component="h2">
            Active Indexing Jobs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Files currently being processed and indexed
          </Typography>
        </Box>

        {statusData?.processing_files && statusData.processing_files.length > 0 ? (
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Filename</TableCell>
                  <TableCell>User ID</TableCell>
                  <TableCell>File ID</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {statusData.processing_files.map((file) => (
                  <TableRow key={file.fileId} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {file.filename}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {file.userId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace" fontSize="0.875rem">
                        {file.fileId.substring(0, 8)}...
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={<HourglassEmpty />}
                        label="Processing"
                        color="warning"
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box p={4} textAlign="center">
            <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Active Indexing Jobs
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All files have been processed. Upload new files to see indexing activity.
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};
