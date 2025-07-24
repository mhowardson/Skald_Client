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
  Alert,
  CircularProgress,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Divider,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Speed as PerformanceIcon,
  Timeline as MetricsIcon,
  TrendingUp as OptimizationIcon,
  NotificationsActive as AlertsIcon,
  Assessment as ReportsIcon,
  Insights as InsightsIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Lightbulb as IdeaIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  ExpandMore as ExpandMoreIcon,
  Compare as CompareIcon,
  AutoAwesome as AiIcon,
  Science as TestIcon
} from '@mui/icons-material';

import {
  useGetPerformanceMetricsQuery,
  useGetContentOptimizationQuery,
  useGetPerformanceAlertsQuery,
  useGetPerformanceReportsQuery,
  useGetRealTimeMetricsQuery,
  useGetPerformanceInsightsQuery,
  useGenerateOptimizationReportMutation,
  useMarkAlertAsReadMutation,
  useResolveAlertMutation,
  type PerformanceMetrics,
  type ContentOptimization,
  type PerformanceAlert
} from '../../store/api/performanceApi';

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

export const PerformancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [optimizationDialog, setOptimizationDialog] = useState(false);
  const [alertDialog, setAlertDialog] = useState<PerformanceAlert | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ element: HTMLElement; metric?: PerformanceMetrics; alert?: PerformanceAlert } | null>(null);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'quarter'>('week');

  // API calls
  const { data: metricsData, isLoading: metricsLoading } = useGetPerformanceMetricsQuery({ period });
  const { data: optimizationData, isLoading: optimizationLoading } = useGetContentOptimizationQuery(selectedContent || '', { skip: !selectedContent });
  const { data: alertsData, isLoading: alertsLoading } = useGetPerformanceAlertsQuery({ isRead: false });
  const { data: reportsData, isLoading: reportsLoading } = useGetPerformanceReportsQuery({});
  const { data: realTimeData, isLoading: realTimeLoading } = useGetRealTimeMetricsQuery();
  const { data: insightsData, isLoading: insightsLoading } = useGetPerformanceInsightsQuery({ period });

  const [generateOptimization] = useGenerateOptimizationReportMutation();
  const [markAlertAsRead] = useMarkAlertAsReadMutation();
  const [resolveAlert] = useResolveAlertMutation();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleGenerateOptimization = async (contentId: string) => {
    try {
      await generateOptimization({ contentId, includeCompetitive: true, includeTrends: true }).unwrap();
      setOptimizationDialog(false);
    } catch (error) {
      console.error('Failed to generate optimization:', error);
    }
  };

  const handleMarkAlertAsRead = async (alertId: string) => {
    try {
      await markAlertAsRead(alertId).unwrap();
      setMenuAnchor(null);
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
    }
  };

  const handleResolveAlert = async (alertId: string, resolution: string) => {
    try {
      await resolveAlert({ alertId, resolution }).unwrap();
      setAlertDialog(null);
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatPercentage = (num: number) => {
    return (num * 100).toFixed(1) + '%';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUpIcon color="success" />;
      case 'down': return <TrendingDownIcon color="error" />;
      case 'stable': return <TrendingFlatIcon color="action" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'performance_drop': return <TrendingDownIcon color="error" />;
      case 'high_performing': return <TrendingUpIcon color="success" />;
      case 'anomaly': return <WarningIcon color="warning" />;
      case 'opportunity': return <IdeaIcon color="info" />;
      default: return <WarningIcon />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Performance Optimization
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor content performance and get AI-powered optimization recommendations
        </Typography>
      </Box>

      {/* Real-time Overview */}
      {realTimeData && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Typography variant="body2">
              <strong>Live:</strong> {formatNumber(realTimeData.currentViews)} views, {formatNumber(realTimeData.currentEngagements)} engagements
            </Typography>
            {realTimeData.alerts.length > 0 && (
              <Typography variant="body2" color="warning.main">
                {realTimeData.alerts.length} active alerts
              </Typography>
            )}
          </Box>
        </Alert>
      )}

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Metrics" icon={<MetricsIcon />} iconPosition="start" />
            <Tab label="Optimization" icon={<OptimizationIcon />} iconPosition="start" />
            <Tab label="Alerts" icon={<AlertsIcon />} iconPosition="start" />
            <Tab label="Reports" icon={<ReportsIcon />} iconPosition="start" />
            <Tab label="Insights" icon={<InsightsIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Metrics Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Performance Metrics</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Period</InputLabel>
                <Select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as any)}
                  label="Period"
                >
                  <MenuItem value="day">Last Day</MenuItem>
                  <MenuItem value="week">Last Week</MenuItem>
                  <MenuItem value="month">Last Month</MenuItem>
                  <MenuItem value="quarter">Last Quarter</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {metricsLoading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {metricsData?.metrics.map((metric) => (
                <Grid item xs={12} md={6} lg={4} key={metric.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Typography variant="h6" noWrap>
                          Content #{metric.contentId.slice(-6)}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => setMenuAnchor({ element: e.currentTarget, metric })}
                        >
                          <MoreIcon />
                        </IconButton>
                      </Box>
                      
                      <Chip label={metric.contentType} size="small" sx={{ mb: 2 }} />
                      
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Views</Typography>
                          <Typography variant="h6">{formatNumber(metric.views)}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Engagements</Typography>
                          <Typography variant="h6">{formatNumber(metric.engagements)}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Engagement Rate</Typography>
                          <Typography variant="h6">{formatPercentage(metric.engagementRate)}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Virality Score</Typography>
                          <Typography variant="h6">{metric.viralityScore.toFixed(1)}</Typography>
                        </Grid>
                      </Grid>

                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          vs. Benchmark
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min((metric.engagementRate / metric.benchmark.industryAverage) * 100, 100)}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {((metric.engagementRate / metric.benchmark.industryAverage - 1) * 100).toFixed(1)}% vs industry avg
                        </Typography>
                      </Box>

                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<OptimizationIcon />}
                          onClick={() => {
                            setSelectedContent(metric.contentId);
                            setOptimizationDialog(true);
                          }}
                        >
                          Optimize
                        </Button>
                        <Button size="small" startIcon={<CompareIcon />}>
                          Compare
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Optimization Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Content Optimization</Typography>
            <Button
              variant="contained"
              startIcon={<AiIcon />}
              onClick={() => setOptimizationDialog(true)}
            >
              Generate AI Recommendations
            </Button>
          </Box>

          {optimizationLoading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : optimizationData ? (
            <Grid container spacing={3}>
              {/* Optimization Score */}
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="primary.main">
                      {optimizationData.optimizationScore}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Optimization Score
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={optimizationData.optimizationScore}
                      sx={{ mt: 2, height: 8, borderRadius: 4 }}
                    />
                  </CardContent>
                </Card>
              </Grid>

              {/* Recommendations */}
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Optimization Recommendations
                    </Typography>
                    <List>
                      {optimizationData.recommendations.slice(0, 3).map((rec, index) => (
                        <ListItem key={index} divider>
                          <ListItemIcon>
                            <IdeaIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={rec.title}
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {rec.description}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                  <Chip
                                    label={`${rec.expectedLift}% lift`}
                                    size="small"
                                    color="success"
                                  />
                                  <Chip
                                    label={`${rec.confidence}% confidence`}
                                    size="small"
                                    color="info"
                                  />
                                  <Chip
                                    label={`${rec.effort} effort`}
                                    size="small"
                                    variant="outlined"
                                  />
                                </Box>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* A/B Test Suggestions */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      A/B Test Suggestions
                    </Typography>
                    <Grid container spacing={2}>
                      {optimizationData.testSuggestions.map((test, index) => (
                        <Grid item xs={12} md={6} key={index}>
                          <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                            <Typography variant="subtitle1" gutterBottom>
                              Test {test.element}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {test.hypothesis}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              <Chip label={test.successMetric} size="small" />
                              <Chip label={`${test.estimatedDuration} days`} size="small" variant="outlined" />
                            </Box>
                            <Button
                              size="small"
                              startIcon={<TestIcon />}
                              sx={{ mt: 1 }}
                            >
                              Start Test
                            </Button>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Alert severity="info">
              Select content to view optimization recommendations
            </Alert>
          )}
        </TabPanel>

        {/* Alerts Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Performance Alerts</Typography>
            <Typography variant="body2" color="text.secondary">
              {alertsData?.unread || 0} unread alerts
            </Typography>
          </Box>

          {alertsLoading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {alertsData?.alerts.map((alert) => (
                <ListItem key={alert.id} divider>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: `${getSeverityColor(alert.severity)}.light` }}>
                      {getAlertIcon(alert.type)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={alert.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {alert.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {alert.trigger.metric}: {alert.trigger.currentValue} (threshold: {alert.trigger.threshold})
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Chip
                            label={alert.severity}
                            size="small"
                            color={getSeverityColor(alert.severity) as any}
                          />
                          <Chip
                            label={alert.type}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    }
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      onClick={() => setAlertDialog(alert)}
                    >
                      View Details
                    </Button>
                    <IconButton
                      size="small"
                      onClick={(e) => setMenuAnchor({ element: e.currentTarget, alert })}
                    >
                      <MoreIcon />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </TabPanel>

        {/* Reports Tab */}
        <TabPanel value={activeTab} index={3}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Performance Reports</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
            >
              Generate Report
            </Button>
          </Box>

          {reportsLoading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {reportsData?.reports.map((report) => (
                <Grid item xs={12} md={6} key={report.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {report.period.type} Report
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {new Date(report.period.start).toLocaleDateString()} - {new Date(report.period.end).toLocaleDateString()}
                      </Typography>
                      
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Total Views</Typography>
                          <Typography variant="h6">{formatNumber(report.summary.totalViews)}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Avg Engagement</Typography>
                          <Typography variant="h6">{formatPercentage(report.summary.avgEngagementRate)}</Typography>
                        </Grid>
                      </Grid>

                      <Button
                        size="small"
                        sx={{ mt: 2 }}
                        fullWidth
                      >
                        View Full Report
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Insights Tab */}
        <TabPanel value={activeTab} index={4}>
          <Typography variant="h6" gutterBottom>
            AI-Powered Insights
          </Typography>

          {insightsLoading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : insightsData && (
            <Grid container spacing={3}>
              {insightsData.insights.map((insight, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        {insight.type === 'opportunity' && <IdeaIcon color="primary" />}
                        {insight.type === 'warning' && <WarningIcon color="warning" />}
                        {insight.type === 'success' && <SuccessIcon color="success" />}
                        <Typography variant="h6">
                          {insight.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {insight.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <Chip
                          label={`${insight.impact}% impact`}
                          size="small"
                          color={insight.impact > 0 ? 'success' : 'error'}
                        />
                        {insight.actionable && (
                          <Chip
                            label="Actionable"
                            size="small"
                            color="primary"
                          />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
      </Paper>

      {/* Menu */}
      <Menu
        anchorEl={menuAnchor?.element}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        {menuAnchor?.metric && (
          <>
            <MenuItem onClick={() => {
              setSelectedContent(menuAnchor.metric!.contentId);
              setOptimizationDialog(true);
              setMenuAnchor(null);
            }}>
              <OptimizationIcon sx={{ mr: 1 }} />
              Optimize Content
            </MenuItem>
            <MenuItem onClick={() => setMenuAnchor(null)}>
              <CompareIcon sx={{ mr: 1 }} />
              Compare Performance
            </MenuItem>
          </>
        )}
        {menuAnchor?.alert && (
          <>
            <MenuItem onClick={() => handleMarkAlertAsRead(menuAnchor.alert!.id)}>
              <CheckCircle sx={{ mr: 1 }} />
              Mark as Read
            </MenuItem>
            <MenuItem onClick={() => {
              setAlertDialog(menuAnchor.alert!);
              setMenuAnchor(null);
            }}>
              <PlayIcon sx={{ mr: 1 }} />
              Resolve Alert
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Alert Details Dialog */}
      <Dialog
        open={Boolean(alertDialog)}
        onClose={() => setAlertDialog(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Alert Details: {alertDialog?.title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" gutterBottom>
              {alertDialog?.description}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip
                label={alertDialog?.severity}
                size="small"
                color={getSeverityColor(alertDialog?.severity || '') as any}
              />
              <Chip
                label={alertDialog?.type}
                size="small"
                variant="outlined"
              />
            </Box>
          </Box>

          <Typography variant="h6" gutterBottom>
            Affected Content
          </Typography>
          <List>
            {alertDialog?.affectedContent.map((content, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={content.title}
                  secondary={`${content.contentType} • Performance: ${content.performance}`}
                />
              </ListItem>
            ))}
          </List>

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Recommended Actions
          </Typography>
          <List>
            {alertDialog?.recommendations.map((rec, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={rec.action}
                  secondary={
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Chip
                        label={rec.priority}
                        size="small"
                        color={rec.priority === 'high' ? 'error' : rec.priority === 'medium' ? 'warning' : 'default'}
                      />
                      <Chip
                        label={`${rec.effort} effort`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlertDialog(null)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => handleResolveAlert(alertDialog!.id, 'User reviewed and took action')}
          >
            Resolve Alert
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};