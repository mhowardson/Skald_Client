import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  Speed as UsageIcon,
  Security as RateLimitIcon,
  NotificationsActive as AlertIcon,
  Assessment as ReportsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  MoreVert as MoreIcon,
  NetworkCheck as NetworkIcon,
  AttachMoney as CostIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';

import {
  useGetUsageMetricsQuery,
  useGetRateLimitsQuery,
  useGetUsageAlertsQuery,
  useGetCurrentUsageQuery,
  useGetCostAnalysisQuery,
  useCreateRateLimitRuleMutation,
  useCreateUsageAlertMutation,
  useGenerateUsageReportMutation,
  type RateLimitRule,
  type UsageAlert
} from '../../store/api/usageApi';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

export const UsagePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [period, setPeriod] = useState<'hour' | 'day' | 'month'>('day');
  const [rateLimitDialog, setRateLimitDialog] = useState(false);
  const [alertDialog, setAlertDialog] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{ element: HTMLElement; rule?: RateLimitRule; alert?: UsageAlert } | null>(null);

  // API calls
  const { data: usageData, isLoading: usageLoading } = useGetUsageMetricsQuery({ period });
  const { data: rateLimitsData } = useGetRateLimitsQuery({});
  const { data: alertsData } = useGetUsageAlertsQuery({});
  const { data: realtimeData } = useGetCurrentUsageQuery();
  const { data: costData } = useGetCostAnalysisQuery({ period: 'month' });

  const [createRateLimit] = useCreateRateLimitRuleMutation();
  const [createAlert] = useCreateUsageAlertMutation();
  const [generateReport] = useGenerateUsageReportMutation();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCreateRateLimit = async (data: {
    endpoint: string;
    method: RateLimitRule['method'];
    requests: number;
    window: number;
  }) => {
    try {
      await createRateLimit({
        endpoint: data.endpoint,
        method: data.method,
        limits: {
          requests: data.requests,
          window: data.window
        },
        tiers: []
      }).unwrap();
      setRateLimitDialog(false);
    } catch (error) {
      console.error('Failed to create rate limit rule:', error);
    }
  };

  const handleCreateAlert = async (data: {
    type: UsageAlert['type'];
    metric: string;
    value: number;
    operator: UsageAlert['threshold']['operator'];
  }) => {
    try {
      await createAlert({
        type: data.type,
        metric: data.metric,
        threshold: {
          value: data.value,
          unit: 'count',
          operator: data.operator
        },
        notifications: {
          email: true,
          inApp: true
        }
      }).unwrap();
      setAlertDialog(false);
    } catch (error) {
      console.error('Failed to create usage alert:', error);
    }
  };

  const handleGenerateReport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      const result = await generateReport({
        type: 'summary',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        format,
        includeBreakdown: true
      }).unwrap();
      
      // Open download URL
      window.open(result.downloadUrl, '_blank');
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const getQuotaStatus = (used: number, limit: number) => {
    const percentage = (used / limit) * 100;
    if (percentage >= 100) return { color: 'error', status: 'Exceeded' };
    if (percentage >= 80) return { color: 'warning', status: 'Warning' };
    if (percentage >= 60) return { color: 'info', status: 'Good' };
    return { color: 'success', status: 'Excellent' };
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Usage & Rate Limiting
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor API usage, manage rate limits, and track costs
        </Typography>
      </Box>

      {/* Real-time Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <NetworkIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h4" color="primary.main">
                  {realtimeData?.realtime.requestsPerSecond || 0}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Requests/sec
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <TimelineIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h4" color="info.main">
                  {realtimeData?.realtime.averageResponseTime || 0}ms
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Avg Response Time
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <ErrorIcon color={realtimeData?.realtime.errorRate && realtimeData.realtime.errorRate > 5 ? 'error' : 'success'} sx={{ mr: 1 }} />
                <Typography variant="h4" color={realtimeData?.realtime.errorRate && realtimeData.realtime.errorRate > 5 ? 'error.main' : 'success.main'}>
                  {realtimeData?.realtime.errorRate || 0}%
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Error Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <CostIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h4" color="warning.main">
                  ${costData?.current.total.toFixed(2) || '0.00'}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Monthly Cost
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab 
              label="Usage Metrics" 
              icon={<UsageIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Rate Limits" 
              icon={<RateLimitIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Alerts" 
              icon={<AlertIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Reports" 
              icon={<ReportsIcon />} 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Usage Metrics Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Usage Overview</Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Period</InputLabel>
              <Select
                value={period}
                onChange={(e) => setPeriod(e.target.value as 'hour' | 'day' | 'month')}
                label="Period"
              >
                <MenuItem value="hour">Last Hour</MenuItem>
                <MenuItem value="day">Last Day</MenuItem>
                <MenuItem value="month">Last Month</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {usageLoading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {/* API Usage */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      API Usage
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Total Requests</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatNumber(usageData?.current.api.totalRequests || 0)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Success Rate</Typography>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          {usageData?.current.api.totalRequests ? 
                            ((usageData.current.api.successfulRequests / usageData.current.api.totalRequests) * 100).toFixed(1) : 0}%
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Avg Response Time</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {usageData?.current.api.averageResponseTime || 0}ms
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Feature Usage */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Feature Usage
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Content Published</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatNumber(usageData?.current.features.contentPublished || 0)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Templates Used</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatNumber(usageData?.current.features.templatesUsed || 0)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Active Members</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatNumber(usageData?.current.features.membersActive || 0)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Storage Usage */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Storage Usage
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Media Storage</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatBytes(usageData?.current.storage.mediaStorage || 0)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Document Storage</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatBytes(usageData?.current.storage.documentStorage || 0)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Total Storage</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatBytes(usageData?.current.storage.totalStorage || 0)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Quota Status */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Quota Status
                    </Typography>
                    {realtimeData?.quotaStatus.map((quota) => {
                      const status = getQuotaStatus(quota.used, quota.limit);
                      return (
                        <Box key={quota.feature} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">{quota.feature}</Typography>
                            <Chip 
                              label={status.status} 
                              size="small" 
                              color={status.color as any}
                            />
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(quota.percentage, 100)}
                            color={status.color as any}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {formatNumber(quota.used)} / {formatNumber(quota.limit)} ({quota.percentage.toFixed(1)}%)
                          </Typography>
                        </Box>
                      );
                    })}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </TabPanel>

        {/* Rate Limits Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Rate Limit Rules</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setRateLimitDialog(true)}
            >
              Add Rule
            </Button>
          </Box>

          <Grid container spacing={3}>
            {/* Current Limits */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Current Limits
                  </Typography>
                  <List>
                    {rateLimitsData?.currentLimits.map((limit) => (
                      <ListItem key={limit.endpoint} divider>
                        <ListItemText
                          primary={limit.endpoint}
                          secondary={`${limit.remaining} requests remaining • Resets ${new Date(limit.resetTime).toLocaleTimeString()}`}
                        />
                        {limit.violations > 0 && (
                          <Chip 
                            label={`${limit.violations} violations`} 
                            size="small" 
                            color="error" 
                          />
                        )}
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Rate Limit Rules */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Rules Configuration
                  </Typography>
                  <List>
                    {rateLimitsData?.rules.map((rule) => (
                      <ListItem 
                        key={rule.id} 
                        divider
                        secondaryAction={
                          <IconButton
                            edge="end"
                            onClick={(e) => setMenuAnchor({ element: e.currentTarget, rule })}
                          >
                            <MoreIcon />
                          </IconButton>
                        }
                      >
                        <ListItemIcon>
                          <Chip 
                            label={rule.method} 
                            size="small" 
                            color={rule.isActive ? 'success' : 'default'}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={rule.endpoint}
                          secondary={`${rule.limits.requests} requests per ${rule.limits.window}s`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Alerts Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Usage Alerts</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAlertDialog(true)}
            >
              Create Alert
            </Button>
          </Box>

          <Grid container spacing={3}>
            {/* Active Alerts */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Active Alerts
                  </Typography>
                  <List>
                    {alertsData?.activeAlerts.map((alert) => (
                      <ListItem key={alert.id} divider>
                        <ListItemIcon>
                          {alert.status === 'triggered' ? <WarningIcon color="warning" /> :
                           alert.status === 'active' ? <CheckIcon color="success" /> :
                           <InfoIcon color="info" />}
                        </ListItemIcon>
                        <ListItemText
                          primary={`${alert.type} - ${alert.metric}`}
                          secondary={`Threshold: ${alert.threshold.operator} ${alert.threshold.value} ${alert.threshold.unit}`}
                        />
                        <Chip 
                          label={alert.status} 
                          size="small" 
                          color={alert.status === 'triggered' ? 'warning' : 'success'}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Triggers */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Triggers
                  </Typography>
                  <List>
                    {alertsData?.recentTriggers.map((trigger, index) => (
                      <ListItem key={index} divider>
                        <ListItemIcon>
                          {trigger.resolved ? <CheckIcon color="success" /> : <WarningIcon color="warning" />}
                        </ListItemIcon>
                        <ListItemText
                          primary={trigger.alert.metric}
                          secondary={`Value: ${trigger.value} • ${new Date(trigger.triggeredAt).toLocaleString()}`}
                        />
                        <Chip 
                          label={trigger.resolved ? 'Resolved' : 'Active'} 
                          size="small" 
                          color={trigger.resolved ? 'success' : 'warning'}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Reports Tab */}
        <TabPanel value={activeTab} index={3}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Usage Reports
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Generate detailed usage reports for analysis and billing
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Reports
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleGenerateReport('pdf')}
                    >
                      PDF Report
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleGenerateReport('excel')}
                    >
                      Excel Report
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleGenerateReport('csv')}
                    >
                      CSV Export
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Cost Analysis
                  </Typography>
                  {costData && (
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Current Month</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          ${costData.current.total.toFixed(2)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">vs Last Month</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {costData.current.comparison.change > 0 ? 
                            <TrendingUpIcon color="error" fontSize="small" /> : 
                            <TrendingDownIcon color="success" fontSize="small" />
                          }
                          <Typography 
                            variant="body2" 
                            fontWeight="bold"
                            color={costData.current.comparison.change > 0 ? 'error.main' : 'success.main'}
                          >
                            {costData.current.comparison.changePercent > 0 ? '+' : ''}
                            {costData.current.comparison.changePercent.toFixed(1)}%
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Projected End of Month</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          ${costData.projections.nextMonth.toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Menu */}
      <Menu
        anchorEl={menuAnchor?.element}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => setMenuAnchor(null)}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => setMenuAnchor(null)}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Create Rate Limit Dialog */}
      <CreateRateLimitDialog
        open={rateLimitDialog}
        onClose={() => setRateLimitDialog(false)}
        onCreate={handleCreateRateLimit}
      />

      {/* Create Alert Dialog */}
      <CreateAlertDialog
        open={alertDialog}
        onClose={() => setAlertDialog(false)}
        onCreate={handleCreateAlert}
      />
    </Container>
  );
};

// Create Rate Limit Dialog Component
interface CreateRateLimitDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: any) => void;
}

const CreateRateLimitDialog: React.FC<CreateRateLimitDialogProps> = ({
  open,
  onClose,
  onCreate
}) => {
  const [formData, setFormData] = useState({
    endpoint: '',
    method: 'GET' as RateLimitRule['method'],
    requests: 100,
    window: 3600
  });

  const handleSubmit = () => {
    if (formData.endpoint.trim()) {
      onCreate(formData);
      setFormData({ endpoint: '', method: 'GET', requests: 100, window: 3600 });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Rate Limit Rule</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Endpoint"
          value={formData.endpoint}
          onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
          placeholder="/api/v1/content/*"
          sx={{ mb: 2, mt: 1 }}
        />
        
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Method</InputLabel>
          <Select
            value={formData.method}
            onChange={(e) => setFormData({ ...formData, method: e.target.value as RateLimitRule['method'] })}
            label="Method"
          >
            <MenuItem value="GET">GET</MenuItem>
            <MenuItem value="POST">POST</MenuItem>
            <MenuItem value="PUT">PUT</MenuItem>
            <MenuItem value="DELETE">DELETE</MenuItem>
            <MenuItem value="*">All Methods</MenuItem>
          </Select>
        </FormControl>
        
        <TextField
          fullWidth
          type="number"
          label="Requests Limit"
          value={formData.requests}
          onChange={(e) => setFormData({ ...formData, requests: parseInt(e.target.value) })}
          sx={{ mb: 2 }}
        />
        
        <TextField
          fullWidth
          type="number"
          label="Time Window (seconds)"
          value={formData.window}
          onChange={(e) => setFormData({ ...formData, window: parseInt(e.target.value) })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!formData.endpoint.trim()}
        >
          Create Rule
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Create Alert Dialog Component
interface CreateAlertDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: any) => void;
}

const CreateAlertDialog: React.FC<CreateAlertDialogProps> = ({
  open,
  onClose,
  onCreate
}) => {
  const [formData, setFormData] = useState({
    type: 'quota' as UsageAlert['type'],
    metric: '',
    value: 0,
    operator: '>' as UsageAlert['threshold']['operator']
  });

  const handleSubmit = () => {
    if (formData.metric.trim() && formData.value > 0) {
      onCreate(formData);
      setFormData({ type: 'quota', metric: '', value: 0, operator: '>' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Usage Alert</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
          <InputLabel>Alert Type</InputLabel>
          <Select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as UsageAlert['type'] })}
            label="Alert Type"
          >
            <MenuItem value="quota">Quota Limit</MenuItem>
            <MenuItem value="rate_limit">Rate Limit</MenuItem>
            <MenuItem value="cost">Cost Threshold</MenuItem>
            <MenuItem value="storage">Storage Usage</MenuItem>
            <MenuItem value="bandwidth">Bandwidth Usage</MenuItem>
          </Select>
        </FormControl>
        
        <TextField
          fullWidth
          label="Metric"
          value={formData.metric}
          onChange={(e) => setFormData({ ...formData, metric: e.target.value })}
          placeholder="e.g., api_requests, storage_used"
          sx={{ mb: 2 }}
        />
        
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Operator</InputLabel>
          <Select
            value={formData.operator}
            onChange={(e) => setFormData({ ...formData, operator: e.target.value as UsageAlert['threshold']['operator'] })}
            label="Operator"
          >
            <MenuItem value=">">Greater than</MenuItem>
            <MenuItem value=">=">Greater than or equal</MenuItem>
            <MenuItem value="<">Less than</MenuItem>
            <MenuItem value="<=">Less than or equal</MenuItem>
            <MenuItem value="==">Equal to</MenuItem>
          </Select>
        </FormControl>
        
        <TextField
          fullWidth
          type="number"
          label="Threshold Value"
          value={formData.value}
          onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!formData.metric.trim() || formData.value <= 0}
        >
          Create Alert
        </Button>
      </DialogActions>
    </Dialog>
  );
};