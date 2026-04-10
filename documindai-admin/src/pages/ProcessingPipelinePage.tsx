import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Collapse,
} from '@mui/material';
import {
  Refresh,
  CloudUpload,
  HourglassEmpty,
  CheckCircle,
  ArrowForward,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { useAppContext } from '../contexts/AppContext';
import { getPipelineStatus } from '../services/adminApi';

interface PipelineFile {
  fileId: string;
  userId: string;
  filename: string;
  status: string;
}

interface PipelineStage {
  count: number;
  files: PipelineFile[];
}

interface PipelineData {
  pipeline: {
    uploaded: PipelineStage;
    processing: PipelineStage;
    indexed: PipelineStage;
  };
  recent_files: PipelineFile[];
  total_files: number;
}



export const ProcessingPipelinePage: React.FC = () => {
  const { state } = useAppContext();
  const [pipelineData, setPipelineData] = useState<PipelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [expandedStage, setExpandedStage] = useState<string | null>('processing');

  const loadPipelineStatus = async () => {
    if (!state.user) {
      setLoading(false);
      return;
    }
    
    try {
      setError(null);
      const data = await getPipelineStatus(state.user.userId);
      setPipelineData(data);
    } catch (err) {
      setError('Failed to load pipeline status');
      console.error('Error fetching pipeline status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPipelineStatus();
  }, [state.user]);

  // Auto-refresh every 2 seconds (faster to catch processing state)
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadPipelineStatus();
    }, 2000);

    return () => clearInterval(interval);
  }, [autoRefresh, state.user]);

  const handleRefresh = () => {
    setLoading(true);
    loadPipelineStatus();
  };

  const toggleStage = (stage: string) => {
    setExpandedStage(expandedStage === stage ? null : stage);
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'warning' | 'success' => {
    switch (status) {
      case 'uploaded':
        return 'primary';
      case 'processing':
        return 'warning';
      case 'indexed':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading && !pipelineData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1">
            Processing Pipeline
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Track your files through the complete indexing workflow
          </Typography>
        </Box>
        <Box display="flex" gap={1} alignItems="center">
          <Typography variant="caption" color="text.secondary">
            Auto-refresh: {autoRefresh ? 'ON (2s)' : 'OFF'}
          </Typography>
          <Chip
            label={autoRefresh ? 'Auto' : 'Manual'}
            size="small"
            color={autoRefresh ? 'success' : 'default'}
            onClick={() => setAutoRefresh(!autoRefresh)}
            sx={{ cursor: 'pointer' }}
          />
          <Tooltip title="Refresh now">
            <IconButton onClick={handleRefresh} color="primary" size="small">
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

      {/* Pipeline Flow Visualization */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Pipeline Flow
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Files progress through three stages. Note: Small files may process in 1-2 seconds!
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          {/* Stage 1: Uploaded */}
          <Grid item xs={12} md={3}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                bgcolor: expandedStage === 'uploaded' ? 'action.selected' : 'background.paper',
                border: expandedStage === 'uploaded' ? '2px solid' : '1px solid',
                borderColor: expandedStage === 'uploaded' ? 'primary.main' : 'divider'
              }}
              onClick={() => toggleStage('uploaded')}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <CloudUpload color="primary" sx={{ fontSize: 32 }} />
                  {expandedStage === 'uploaded' ? <ExpandLess /> : <ExpandMore />}
                </Box>
                <Typography variant="h4" component="div" color="primary.main">
                  {pipelineData?.pipeline.uploaded.count ?? 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Uploaded
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                  Files in S3, waiting to be indexed
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={1} display="flex" justifyContent="center">
            <ArrowForward color="action" sx={{ fontSize: 32 }} />
          </Grid>

          {/* Stage 2: Processing */}
          <Grid item xs={12} md={3}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                bgcolor: expandedStage === 'processing' ? 'action.selected' : 'background.paper',
                border: expandedStage === 'processing' ? '2px solid' : '1px solid',
                borderColor: expandedStage === 'processing' ? 'warning.main' : 'divider'
              }}
              onClick={() => toggleStage('processing')}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <HourglassEmpty color="warning" sx={{ fontSize: 32 }} />
                  {expandedStage === 'processing' ? <ExpandLess /> : <ExpandMore />}
                </Box>
                <Typography variant="h4" component="div" color="warning.main">
                  {pipelineData?.pipeline.processing.count ?? 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Processing
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                  Extracting text & generating embeddings
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={1} display="flex" justifyContent="center">
            <ArrowForward color="action" sx={{ fontSize: 32 }} />
          </Grid>

          {/* Stage 3: Indexed */}
          <Grid item xs={12} md={3}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                bgcolor: expandedStage === 'indexed' ? 'action.selected' : 'background.paper',
                border: expandedStage === 'indexed' ? '2px solid' : '1px solid',
                borderColor: expandedStage === 'indexed' ? 'success.main' : 'divider'
              }}
              onClick={() => toggleStage('indexed')}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <CheckCircle color="success" sx={{ fontSize: 32 }} />
                  {expandedStage === 'indexed' ? <ExpandLess /> : <ExpandMore />}
                </Box>
                <Typography variant="h4" component="div" color="success.main">
                  {pipelineData?.pipeline.indexed.count ?? 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Indexed
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                  Ready for chat queries
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Files at Selected Stage */}
      {expandedStage && pipelineData && (
        <Paper sx={{ mb: 3 }}>
          <Box p={2} borderBottom="1px solid rgba(224, 224, 224, 1)">
            <Typography variant="h6" component="h2">
              Files: {expandedStage.charAt(0).toUpperCase() + expandedStage.slice(1)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {pipelineData.pipeline[expandedStage as keyof typeof pipelineData.pipeline].count} files in this stage
            </Typography>
          </Box>

          <Collapse in={true}>
            {pipelineData.pipeline[expandedStage as keyof typeof pipelineData.pipeline].files.length > 0 ? (
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Filename</TableCell>
                      <TableCell>File ID</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pipelineData.pipeline[expandedStage as keyof typeof pipelineData.pipeline].files.map((file) => (
                      <TableRow key={file.fileId} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {file.filename}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace" fontSize="0.875rem">
                            {file.fileId.substring(0, 8)}...
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={file.status}
                            color={getStatusColor(file.status)}
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
                <Typography variant="body2" color="text.secondary">
                  No files in this stage
                </Typography>
              </Box>
            )}
          </Collapse>
        </Paper>
      )}

      {/* Recent Activity */}
      <Paper>
        <Box p={2} borderBottom="1px solid rgba(224, 224, 224, 1)">
          <Typography variant="h6" component="h2">
            Recent Activity
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Last 20 files you've uploaded
          </Typography>
        </Box>

        {pipelineData && pipelineData.recent_files.length > 0 ? (
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Filename</TableCell>
                  <TableCell>File ID</TableCell>
                  <TableCell align="center">Current Stage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pipelineData.recent_files.map((file) => (
                  <TableRow key={file.fileId} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {file.filename}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace" fontSize="0.875rem">
                        {file.fileId.substring(0, 8)}...
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={file.status}
                        color={getStatusColor(file.status)}
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
            <Typography variant="body2" color="text.secondary">
              No files uploaded yet
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};
