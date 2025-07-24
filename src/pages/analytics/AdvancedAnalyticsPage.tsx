/**
 * Advanced Analytics Page
 * 
 * Comprehensive analytics dashboard with cross-platform metrics,
 * audience insights, and performance reporting capabilities.
 * 
 * @page AdvancedAnalyticsPage
 * @version 1.0.0
 * 
 * @features
 * - Cross-platform performance metrics
 * - Interactive charts and visualizations
 * - Audience insights and demographics
 * - AI-powered recommendations
 * - Custom report generation
 * - Data export functionality
 * - Real-time trending insights
 * 
 * @components
 * - PerformanceSummaryCards - Key metrics overview
 * - CrossPlatformMetricsChart - Platform comparison
 * - AudienceInsightsPanel - Demographics and engagement
 * - RecommendationsWidget - AI suggestions
 * - TrendingInsightsPanel - Hashtags and content trends
 * - ReportGenerationDialog - Custom report creation
 */

import React, { useState, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Menu,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Skeleton,
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Visibility as VisibilityIcon,
  ThumbUp as ThumbUpIcon,
  Share as ShareIcon,
  FileDownload as ExportIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Assessment as ReportIcon,
  Lightbulb as RecommendationIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ComposedChart,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import {
  useGetCrossPlatformMetricsQuery,
  useGetAudienceInsightsQuery,
  useGetPerformanceSummaryQuery,
  useGetContentAnalysisQuery,
  useGetRecommendationsQuery,
  useGetTrendingInsightsQuery,
  useGeneratePerformanceReportMutation,
  useExportAnalyticsDataMutation,
} from '../../store/api/advancedAnalyticsApi';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const timeframeOptions = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '1y', label: 'Last year' },
];

const platformOptions = [
  { value: 'linkedin', label: 'LinkedIn', color: '#0077B5', icon: '💼' },
  { value: 'twitter', label: 'Twitter', color: '#1DA1F2', icon: '🐦' },
  { value: 'facebook', label: 'Facebook', color: '#1877F2', icon: '📘' },
  { value: 'instagram', label: 'Instagram', color: '#E4405F', icon: '📷' },
  { value: 'youtube', label: 'YouTube', color: '#FF0000', icon: '📺' },
  { value: 'tiktok', label: 'TikTok', color: '#000000', icon: '🎵' },
];

const COLORS = ['#ff0050', '#25f4ee', '#fe2c55', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#fcea2b'];

export const AdvancedAnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [timeframe, setTimeframe] = useState('30d');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  // API Queries
  const { data: performanceSummary, isLoading: summaryLoading } = useGetPerformanceSummaryQuery({ timeframe });
  const { data: crossPlatformData, isLoading: metricsLoading } = useGetCrossPlatformMetricsQuery({ 
    timeframe, 
    platforms: selectedPlatforms.length > 0 ? selectedPlatforms : undefined 
  });
  const { data: audienceData, isLoading: audienceLoading } = useGetAudienceInsightsQuery({ 
    timeframe, 
    platforms: selectedPlatforms.length > 0 ? selectedPlatforms : undefined 
  });
  const { data: contentAnalysis, isLoading: contentLoading } = useGetContentAnalysisQuery({ 
    timeframe, 
    platforms: selectedPlatforms.length > 0 ? selectedPlatforms : undefined 
  });
  const { data: recommendations, isLoading: recommendationsLoading } = useGetRecommendationsQuery({ 
    timeframe, 
    platforms: selectedPlatforms.length > 0 ? selectedPlatforms : undefined 
  });
  const { data: trendingInsights, isLoading: trendingLoading } = useGetTrendingInsightsQuery({ 
    timeframe: '7d', 
    platforms: selectedPlatforms.length > 0 ? selectedPlatforms : undefined 
  });

  // Mutations
  const [generateReport, { isLoading: generatingReport }] = useGeneratePerformanceReportMutation();
  const [exportData, { isLoading: exportingData }] = useExportAnalyticsDataMutation();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleGenerateReport = async () => {
    try {
      const result = await generateReport({
        title: `Analytics Report - ${new Date().toLocaleDateString()}`,
        timeframe,
        platforms: selectedPlatforms.length > 0 ? selectedPlatforms : undefined,
      }).unwrap();
      
      console.log('Report generated:', result.report.id);
      setReportDialogOpen(false);
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const handleExportData = async (format: string, dataTypes: string[]) => {
    try {
      const result = await exportData({
        format: format as any,
        timeframe,
        platforms: selectedPlatforms.length > 0 ? selectedPlatforms : undefined,
        dataTypes: dataTypes as any,
      }).unwrap();
      
      console.log('Data exported:', result.format);
      setExportDialogOpen(false);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`;
  };

  // Performance Summary Cards Component
  const PerformanceSummaryCards = () => {
    if (summaryLoading) {
      return (
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Card>
                <CardContent>
                  <Skeleton variant="rectangular" height={80} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      );
    }

    if (!performanceSummary) return null;

    const summaryCards = [
      {
        title: 'Total Reach',
        value: formatNumber(performanceSummary.totalReach),
        icon: <VisibilityIcon />,
        color: 'primary',
        change: '+12.5%',
      },
      {
        title: 'Total Engagement',
        value: formatNumber(performanceSummary.totalEngagement),
        icon: <ThumbUpIcon />,
        color: 'success',
        change: '+8.3%',
      },
      {
        title: 'Engagement Rate',
        value: formatPercentage(performanceSummary.averageEngagementRate),
        icon: <TrendingUpIcon />,
        color: 'warning',
        change: '+2.1%',
      },
      {
        title: 'Total Audience',
        value: formatNumber(performanceSummary.totalAudience),
        icon: <PeopleIcon />,
        color: 'info',
        change: `+${performanceSummary.audienceGrowth}`,
      },
    ];

    return (
      <Grid container spacing={3}>
        {summaryCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ color: `${card.color}.main`, mr: 1 }}>{card.icon}</Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {card.title}
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" gutterBottom>
                  {card.value}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUpIcon color="success" sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="body2" color="success.main">
                    {card.change}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Cross-Platform Metrics Chart Component
  const CrossPlatformMetricsChart = () => {
    if (metricsLoading) {
      return (
        <Card>
          <CardContent>
            <Skeleton variant="rectangular" height={400} />
          </CardContent>
        </Card>
      );
    }

    if (!crossPlatformData?.metrics) return null;

    const { metrics } = crossPlatformData;

    return (
      <Card>
        <CardHeader
          title="Cross-Platform Performance"
          subheader={`Performance trends over the last ${timeframe}`}
          action={
            <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
              <MoreVertIcon />
            </IconButton>
          }
        />
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={metrics.trendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <RechartsTooltip />
              <Legend />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="reach" 
                fill="#8884d8" 
                stroke="#8884d8"
                fillOpacity={0.6}
                name="Reach"
              />
              <Bar 
                yAxisId="right"
                dataKey="engagement" 
                fill="#82ca9d"
                name="Engagement"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="engagementRate" 
                stroke="#ff7300"
                strokeWidth={3}
                name="Engagement Rate"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  // Platform Breakdown Component
  const PlatformBreakdownChart = () => {
    if (!crossPlatformData?.metrics) return null;

    const { platformBreakdown } = crossPlatformData.metrics;

    return (
      <Card>
        <CardHeader title="Platform Performance" />
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={platformBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="platform" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="engagement" fill="#8884d8" name="Engagement" />
              <Bar dataKey="reach" fill="#82ca9d" name="Reach" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  // Audience Demographics Component
  const AudienceDemographics = () => {
    if (audienceLoading) {
      return (
        <Card>
          <CardContent>
            <Skeleton variant="rectangular" height={300} />
          </CardContent>
        </Card>
      );
    }

    if (!audienceData?.insights) return null;

    const { demographics } = audienceData.insights;

    const genderData = [
      { name: 'Female', value: demographics.genderDistribution.female, color: '#ff0050' },
      { name: 'Male', value: demographics.genderDistribution.male, color: '#25f4ee' },
      { name: 'Other', value: demographics.genderDistribution.other, color: '#fe2c55' },
    ];

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Gender Distribution" />
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Age Groups" />
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={demographics.ageGroups}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ageRange" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="percentage" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardHeader title="Top Locations" />
            <CardContent>
              <List>
                {demographics.topLocations.slice(0, 5).map((location, index) => (
                  <ListItem key={location.country}>
                    <ListItemIcon>
                      <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                        {index + 1}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={location.country}
                      secondary={`${location.percentage}% of audience`}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {location.engagement.toFixed(1)}% engagement
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // Recommendations Component
  const RecommendationsPanel = () => {
    if (recommendationsLoading) {
      return (
        <Card>
          <CardContent>
            <Skeleton variant="rectangular" height={200} />
          </CardContent>
        </Card>
      );
    }

    if (!recommendations?.recommendations) return null;

    return (
      <Card>
        <CardHeader
          title="AI Recommendations"
          subheader={`${recommendations.summary.totalRecommendations} suggestions to improve performance`}
          avatar={<RecommendationIcon color="primary" />}
        />
        <CardContent>
          <Grid container spacing={2}>
            {recommendations.recommendations.slice(0, 6).map((rec, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Chip
                      label={rec.impact}
                      color={rec.impact === 'high' ? 'error' : rec.impact === 'medium' ? 'warning' : 'default'}
                      size="small"
                    />
                    <Typography variant="subtitle2" sx={{ ml: 1, flexGrow: 1 }}>
                      {rec.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {rec.description}
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    Expected: {rec.expectedImprovement}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  };

  // Trending Insights Component
  const TrendingInsightsPanel = () => {
    if (trendingLoading) {
      return (
        <Card>
          <CardContent>
            <Skeleton variant="rectangular" height={300} />
          </CardContent>
        </Card>
      );
    }

    if (!trendingInsights) return null;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Trending Hashtags" />
            <CardContent>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {trendingInsights.trendingHashtags.slice(0, 10).map((hashtag) => (
                  <Chip
                    key={hashtag.hashtag}
                    label={`#${hashtag.hashtag}`}
                    variant="outlined"
                    size="small"
                    color="primary"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Rising Content Types" />
            <CardContent>
              <List dense>
                {trendingInsights.risingContentTypes.map((type) => (
                  <ListItem key={type.type}>
                    <ListItemIcon>
                      <TrendingUpIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary={type.type}
                      secondary={`${type.avgEngagementRate.toFixed(1)}% engagement rate`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardHeader title="Viral Content" />
            <CardContent>
              <List>
                {trendingInsights.viralContent.slice(0, 3).map((content) => (
                  <ListItem key={content.contentId}>
                    <ListItemText
                      primary={content.title}
                      secondary={`${content.platform} • ${formatNumber(content.reach)} reach • ${formatPercentage(content.engagementRate)} engagement`}
                    />
                    <Chip
                      label={`Score: ${content.performanceScore.toFixed(1)}`}
                      color="success"
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Advanced Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive insights and performance metrics across all platforms
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={() => setExportDialogOpen(true)}
            disabled={exportingData}
          >
            Export Data
          </Button>
          <Button
            variant="contained"
            startIcon={<ReportIcon />}
            onClick={() => setReportDialogOpen(true)}
            disabled={generatingReport}
          >
            Generate Report
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Timeframe</InputLabel>
              <Select
                value={timeframe}
                label="Timeframe"
                onChange={(e) => setTimeframe(e.target.value)}
              >
                {timeframeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Platforms
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {platformOptions.map((platform) => (
                <Chip
                  key={platform.value}
                  label={`${platform.icon} ${platform.label}`}
                  clickable
                  color={selectedPlatforms.includes(platform.value) ? 'primary' : 'default'}
                  onClick={() => handlePlatformToggle(platform.value)}
                />
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => window.location.reload()}
            >
              Refresh Data
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Performance Summary */}
      <Box sx={{ mb: 4 }}>
        <PerformanceSummaryCards />
      </Box>

      {/* Analytics Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="analytics tabs">
          <Tab label="Overview" icon={<AnalyticsIcon />} iconPosition="start" />
          <Tab label="Audience" icon={<PeopleIcon />} iconPosition="start" />
          <Tab label="Content" icon={<BarChartIcon />} iconPosition="start" />
          <Tab label="Trends" icon={<TimelineIcon />} iconPosition="start" />
          <Tab label="Recommendations" icon={<RecommendationIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <CrossPlatformMetricsChart />
          </Grid>
          <Grid item xs={12}>
            <PlatformBreakdownChart />
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <AudienceDemographics />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        {contentLoading ? (
          <Skeleton variant="rectangular" height={400} />
        ) : (
          <Alert severity="info">
            Content analysis panel coming soon. Advanced content insights and optimization suggestions.
          </Alert>
        )}
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <TrendingInsightsPanel />
      </TabPanel>

      <TabPanel value={activeTab} index={4}>
        <RecommendationsPanel />
      </TabPanel>

      {/* Report Generation Dialog */}
      <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Performance Report</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create a comprehensive performance report with all current analytics data.
          </Typography>
          <TextField
            fullWidth
            label="Report Title"
            defaultValue={`Analytics Report - ${new Date().toLocaleDateString()}`}
            sx={{ mb: 2 }}
          />
          <FormGroup>
            <FormControlLabel control={<Checkbox defaultChecked />} label="Include cross-platform metrics" />
            <FormControlLabel control={<Checkbox defaultChecked />} label="Include audience insights" />
            <FormControlLabel control={<Checkbox defaultChecked />} label="Include content analysis" />
            <FormControlLabel control={<Checkbox defaultChecked />} label="Include recommendations" />
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleGenerateReport}
            disabled={generatingReport}
          >
            {generatingReport ? 'Generating...' : 'Generate Report'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Data Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export Analytics Data</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Export Format</InputLabel>
            <Select defaultValue="csv" label="Export Format">
              <MenuItem value="csv">CSV</MenuItem>
              <MenuItem value="xlsx">Excel</MenuItem>
              <MenuItem value="pdf">PDF</MenuItem>
              <MenuItem value="json">JSON</MenuItem>
            </Select>
          </FormControl>
          <FormGroup>
            <FormControlLabel control={<Checkbox defaultChecked />} label="Cross-platform metrics" />
            <FormControlLabel control={<Checkbox defaultChecked />} label="Audience insights" />
            <FormControlLabel control={<Checkbox />} label="Content analysis" />
            <FormControlLabel control={<Checkbox />} label="Recommendations" />
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => handleExportData('csv', ['metrics', 'insights'])}
            disabled={exportingData}
          >
            {exportingData ? 'Exporting...' : 'Export Data'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={() => setMenuAnchor(null)}>
          <LineChartIcon sx={{ mr: 1 }} />
          Switch to Line Chart
        </MenuItem>
        <MenuItem onClick={() => setMenuAnchor(null)}>
          <BarChartIcon sx={{ mr: 1 }} />
          Switch to Bar Chart
        </MenuItem>
        <MenuItem onClick={() => setMenuAnchor(null)}>
          <PieChartIcon sx={{ mr: 1 }} />
          Switch to Pie Chart
        </MenuItem>
      </Menu>
    </Container>
  );
};