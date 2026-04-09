import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  TrendingUp,
  AttachMoney,
  Token,
  Chat,
  Description,
  DataUsage,
} from '@mui/icons-material';
import { useAppContext } from '../contexts/AppContext';

interface UsageData {
  user_id: string;
  period_days: number;
  total_tokens: number;
  total_cost_usd: number;
  breakdown: {
    [key: string]: {
      tokens: number;
      cost: number;
      operations: number;
    };
  };
  daily_records: Array<{
    user_id: string;
    operation_type: string;
    model_id: string;
    usage_date: string;
    operation_count: number;
    total_input_tokens: number;
    total_output_tokens: number;
    total_tokens: number;
    total_cost_usd: number;
  }>;
}

export const UsagePage: React.FC = () => {
  const { state } = useAppContext();
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<number>(30);

  const fetchUsageData = async () => {
    if (!state.user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/upload/usage/${state.user.userId}?days=${period}`);
      if (!response.ok) {
        throw new Error('Failed to fetch usage data');
      }
      const data = await response.json();
      setUsageData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsageData();
  }, [state.user, period]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!usageData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">No usage data available</Alert>
      </Box>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'chat':
        return <Chat fontSize="small" />;
      case 'embedding':
        return <Description fontSize="small" />;
      case 'indexing':
        return <DataUsage fontSize="small" />;
      default:
        return <Token fontSize="small" />;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Usage & Cost Analytics
        </Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Time Period</InputLabel>
          <Select
            value={period}
            label="Time Period"
            onChange={(e) => setPeriod(Number(e.target.value))}
          >
            <MenuItem value={7}>Last 7 Days</MenuItem>
            <MenuItem value={30}>Last 30 Days</MenuItem>
            <MenuItem value={90}>Last 90 Days</MenuItem>
            <MenuItem value={365}>Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoney color="primary" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Total Cost
                </Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {formatCurrency(usageData.total_cost_usd)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Last {period} days
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Token color="secondary" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Total Tokens
                </Typography>
              </Box>
              <Typography variant="h4" color="secondary">
                {formatNumber(usageData.total_tokens)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Input + Output tokens
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp color="success" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Operations
                </Typography>
              </Box>
              <Typography variant="h4" color="success">
                {formatNumber(
                  Object.values(usageData.breakdown).reduce(
                    (sum, b) => sum + b.operations,
                    0
                  )
                )}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total AI operations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Breakdown by Operation Type */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Cost Breakdown by Operation Type
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {Object.entries(usageData.breakdown).map(([type, data]) => (
            <Grid item xs={12} md={4} key={type}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {getOperationIcon(type)}
                    <Typography variant="subtitle1" sx={{ ml: 1, textTransform: 'capitalize' }}>
                      {type}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Cost
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {formatCurrency(data.cost)}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Tokens
                    </Typography>
                    <Typography variant="body1">
                      {formatNumber(data.tokens)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Operations
                    </Typography>
                    <Typography variant="body1">
                      {formatNumber(data.operations)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Daily Usage Table */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Daily Usage Details
        </Typography>
        <TableContainer sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Operation Type</TableCell>
                <TableCell>Model</TableCell>
                <TableCell align="right">Operations</TableCell>
                <TableCell align="right">Input Tokens</TableCell>
                <TableCell align="right">Output Tokens</TableCell>
                <TableCell align="right">Total Tokens</TableCell>
                <TableCell align="right">Cost</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usageData.daily_records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      No usage data for this period
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                usageData.daily_records.map((record, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      {new Date(record.usage_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getOperationIcon(record.operation_type)}
                        label={record.operation_type}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {record.model_id.split('/').pop()?.substring(0, 20)}...
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{formatNumber(record.operation_count)}</TableCell>
                    <TableCell align="right">{formatNumber(record.total_input_tokens)}</TableCell>
                    <TableCell align="right">{formatNumber(record.total_output_tokens)}</TableCell>
                    <TableCell align="right">
                      <strong>{formatNumber(record.total_tokens)}</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>{formatCurrency(record.total_cost_usd)}</strong>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* AWS Pricing Info */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          AWS Bedrock Pricing
        </Typography>
        <Typography variant="caption" component="div">
          • Claude 3 Haiku: $0.25 per 1M input tokens, $1.25 per 1M output tokens
        </Typography>
        <Typography variant="caption" component="div">
          • Titan Embeddings: $0.1 per 1M tokens
        </Typography>
      </Alert>
    </Box>
  );
};
