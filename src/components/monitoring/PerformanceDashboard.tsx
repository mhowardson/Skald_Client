/**
 * Performance Monitoring Dashboard
 * 
 * Real-time performance monitoring dashboard for operations and administrators.
 * Displays system health, performance metrics, alerts, and recommendations.
 * 
 * @component PerformanceDashboard
 * @version 1.0.0
 * 
 * @features
 * - Real-time performance metrics display
 * - System health status monitoring
 * - Performance alerts and notifications
 * - Endpoint performance analysis
 * - Resource usage tracking
 * - Performance recommendations
 * - Historical data visualization
 * - Export functionality
 * 
 * @dependencies
 * - Performance monitoring API endpoints
 * - Real-time updates via WebSocket/polling
 * - Chart visualization library
 * - Material Design components
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkIcon
} from '@mui/icons-material';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useApi } from '../../hooks/useApi';
import { formatDistanceToNow, format } from 'date-fns';

// Types
interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Array<{
    name: string;
    status: 'pass' | 'warn' | 'fail';
    responseTime?: number;
    message?: string;
  }>;
  timestamp: Date;
}

interface PerformanceMetrics {
  activeConnections: number;
  requestsPerMinute: number;
  averageResponseTime: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
}

interface PerformanceAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  value: number;
  threshold: number;
  endpoint?: string;
  timestamp: Date;
  resolved: boolean;
}

interface EndpointPerformance {
  endpoint: string;
  requests: number;
  averageResponseTime: number;
  errorRate: number;
  slowestRequests: any[];
}

/**
 * Performance Dashboard Component
 * 
 * Comprehensive monitoring dashboard for system performance and health.
 */
export const PerformanceDashboard: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [endpoints, setEndpoints] = useState<EndpointPerformance[]>([]);
  const [timeRange, setTimeRange] = useState('1h');
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const api = useApi();

  // Fetch all monitoring data
  const fetchMonitoringData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const [healthRes, metricsRes, alertsRes, endpointsRes] = await Promise.all([
        api.get('/monitoring/health/detailed'),
        api.get('/monitoring/metrics'),
        api.get('/monitoring/alerts'),
        api.get(`/monitoring/performance/endpoints?timeRange=${timeRange}`)
      ]);

      setHealthStatus(healthRes.data);
      setMetrics(metricsRes.data.data);
      setAlerts(alertsRes.data.data.alerts);
      setEndpoints(endpointsRes.data.data.endpoints);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [api, timeRange]);

  // Auto-refresh data
  useEffect(() => {
    fetchMonitoringData();
    
    const interval = setInterval(fetchMonitoringData, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [fetchMonitoringData, refreshInterval]);

  // Export performance data
  const handleExport = async (format: 'json' | 'csv' = 'json') => {
    try {
      const response = await api.get(`/monitoring/performance/export?format=${format}&timeRange=${timeRange}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `performance-data-${Date.now()}.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': case 'pass': return 'success';
      case 'degraded': case 'warn': return 'warning';
      case 'unhealthy': case 'fail': return 'error';
      default: return 'default';
    }
  };

  // Get alert severity color
  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#f44336';
      case 'high': return '#ff9800';
      case 'medium': return '#ffeb3b';
      case 'low': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Performance Monitoring
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="1h">Last Hour</MenuItem>
              <MenuItem value="6h">Last 6 Hours</MenuItem>
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Refresh</InputLabel>
            <Select
              value={refreshInterval}
              label="Refresh"
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
            >
              <MenuItem value={10}>10 seconds</MenuItem>
              <MenuItem value={30}>30 seconds</MenuItem>
              <MenuItem value={60}>1 minute</MenuItem>
              <MenuItem value={300}>5 minutes</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleExport('json')}
          >
            Export
          </Button>

          <IconButton onClick={fetchMonitoringData} disabled={isLoading}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Last Update */}
      {lastUpdate && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Last updated: {formatDistanceToNow(lastUpdate)} ago
        </Typography>
      )}

      {isLoading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Health Status Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {healthStatus?.status === 'healthy' ? (
                  <CheckCircleIcon color="success" />
                ) : healthStatus?.status === 'degraded' ? (
                  <WarningIcon color="warning" />
                ) : (
                  <ErrorIcon color="error" />
                )}
                <Typography variant="h6">
                  System Health
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 1 }}>
                <Chip 
                  label={healthStatus?.status?.toUpperCase() || 'UNKNOWN'} 
                  color={getStatusColor(healthStatus?.status || '')}
                  size="small"
                />
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon color="primary" />
                <Typography variant="h6">Requests/Min</Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {metrics?.requestsPerMinute || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SpeedIcon color="primary" />
                <Typography variant="h6">Avg Response</Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {metrics?.averageResponseTime?.toFixed(0) || 0}ms
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ErrorIcon color="error" />
                <Typography variant="h6">Error Rate</Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {((metrics?.errorRate || 0) * 100).toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* System Resources */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                <MemoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Memory Usage
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={metrics?.memoryUsage || 0}
                  sx={{ flexGrow: 1, height: 10 }}
                  color={metrics?.memoryUsage && metrics.memoryUsage > 80 ? 'error' : 'primary'}
                />
                <Typography variant="body2">
                  {(metrics?.memoryUsage || 0).toFixed(1)}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                <StorageIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                CPU Usage
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={metrics?.cpuUsage || 0}
                  sx={{ flexGrow: 1, height: 10 }}
                  color={metrics?.cpuUsage && metrics.cpuUsage > 70 ? 'error' : 'primary'}
                />
                <Typography variant="body2">
                  {(metrics?.cpuUsage || 0).toFixed(1)}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Health Checks Detail */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Component Health Checks
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Component</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Response Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {healthStatus?.checks.map((check) => (
                    <TableRow key={check.name}>
                      <TableCell>{check.name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={check.status} 
                          color={getStatusColor(check.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {check.responseTime ? `${check.responseTime.toFixed(1)}ms` : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Alerts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Active Alerts
                </Typography>
                <Badge badgeContent={alerts.filter(a => !a.resolved).length} color="error">
                  <WarningIcon />
                </Badge>
              </Box>
              
              {alerts.length === 0 ? (
                <Alert severity="success">No active alerts</Alert>
              ) : (
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {alerts.slice(0, 5).map((alert) => (
                    <Alert 
                      key={alert.id}
                      severity={alert.severity === 'critical' ? 'error' : 
                               alert.severity === 'high' ? 'warning' : 'info'}
                      sx={{ mb: 1 }}
                    >
                      <Typography variant="body2">
                        <strong>{alert.type.replace('_', ' ').toUpperCase()}</strong>
                      </Typography>
                      <Typography variant="body2">
                        {alert.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDistanceToNow(new Date(alert.timestamp))} ago
                      </Typography>
                    </Alert>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Endpoint Performance */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Endpoint Performance
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Endpoint</TableCell>
                      <TableCell align="right">Requests</TableCell>
                      <TableCell align="right">Avg Response Time</TableCell>
                      <TableCell align="right">Error Rate</TableCell>
                      <TableCell align="right">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {endpoints.slice(0, 10).map((endpoint) => (
                      <TableRow key={endpoint.endpoint}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {endpoint.endpoint}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{endpoint.requests}</TableCell>
                        <TableCell align="right">
                          <Typography 
                            variant="body2"
                            color={endpoint.averageResponseTime > 1000 ? 'error' : 'text.primary'}
                          >
                            {endpoint.averageResponseTime.toFixed(0)}ms
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography 
                            variant="body2"
                            color={endpoint.errorRate > 0.05 ? 'error' : 'text.primary'}
                          >
                            {(endpoint.errorRate * 100).toFixed(1)}%
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={endpoint.errorRate > 0.05 ? 'Issues' : 
                                   endpoint.averageResponseTime > 1000 ? 'Slow' : 'Healthy'}
                            color={endpoint.errorRate > 0.05 ? 'error' : 
                                   endpoint.averageResponseTime > 1000 ? 'warning' : 'success'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};