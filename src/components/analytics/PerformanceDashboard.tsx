/**
 * Performance Dashboard Component
 * 
 * Comprehensive dashboard widget that displays key performance metrics,
 * trends, and insights in a compact, dashboard-friendly format.
 * 
 * @component PerformanceDashboard
 * @version 1.0.0
 * 
 * @features
 * - Real-time performance metrics
 * - Interactive mini-charts
 * - Quick insights and alerts
 * - Customizable metric selection
 * - Export and drill-down capabilities
 * - Responsive design for different screen sizes
 * 
 * @props
 * - timeframe: string - Analysis timeframe
 * - platforms: string[] - Platform filter
 * - compact: boolean - Compact view mode
 * - showDetails: boolean - Show detailed metrics
 * - onMetricClick: (metric: string) => void - Metric click handler
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Avatar,
  LinearProgress,
  Button,
  Skeleton,
  Alert,
  Divider,
  Stack,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Visibility as VisibilityIcon,
  ThumbUp as ThumbUpIcon,
  People as PeopleIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  Launch as LaunchIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Tooltip as RechartsTooltip,
} from 'recharts';
import {
  useGetPerformanceSummaryQuery,
  useGetCrossPlatformMetricsQuery,
  useGetRecommendationsQuery,
} from '../../store/api/advancedAnalyticsApi';

interface PerformanceDashboardProps {
  timeframe?: string;
  platforms?: string[];
  compact?: boolean;
  showDetails?: boolean;
  onMetricClick?: (metric: string) => void;
  height?: number;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'flat';
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend = 'flat',
  icon,
  color = 'primary',
  onClick,
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon color="success" sx={{ fontSize: 16 }} />;
      case 'down':
        return <TrendingDownIcon color="error" sx={{ fontSize: 16 }} />;
      default:
        return <TrendingFlatIcon color="warning" sx={{ fontSize: 16 }} />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'success.main';
      case 'down':
        return 'error.main';
      default:
        return 'warning.main';
    }
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { boxShadow: 4 } : {},
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ color: `${color}.main`, mr: 1 }}>{icon}</Box>
          <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h6" component="div" gutterBottom>
          {value}
        </Typography>
        {change !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {getTrendIcon()}
            <Typography variant="caption" sx={{ color: getTrendColor(), ml: 0.5 }}>
              {change > 0 ? '+' : ''}{change.toFixed(1)}%
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  timeframe = '30d',
  platforms = [],
  compact = false,
  showDetails = true,
  onMetricClick,
  height = 400,
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  // API Queries
  const { data: performanceSummary, isLoading: summaryLoading } = useGetPerformanceSummaryQuery({ timeframe });
  const { data: crossPlatformData, isLoading: metricsLoading } = useGetCrossPlatformMetricsQuery({ 
    timeframe, 
    platforms: platforms.length > 0 ? platforms : undefined 
  });
  const { data: recommendations, isLoading: recommendationsLoading } = useGetRecommendationsQuery({ 
    timeframe, 
    platforms: platforms.length > 0 ? platforms : undefined 
  });

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`;
  };

  // Loading State
  if (summaryLoading || metricsLoading) {
    return (
      <Card sx={{ height }}>
        <CardContent>
          <Skeleton variant="rectangular" height={height - 40} />
        </CardContent>
      </Card>
    );
  }

  // Error State
  if (!performanceSummary || !crossPlatformData) {
    return (
      <Card sx={{ height }}>
        <CardContent>
          <Alert severity="info">
            Connect social media accounts to view performance analytics
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const { metrics } = crossPlatformData;

  // Key Metrics Data
  const keyMetrics = [
    {
      title: 'Total Reach',
      value: formatNumber(performanceSummary.totalReach),
      change: 12.5,
      trend: 'up' as const,
      icon: <VisibilityIcon />,
      color: 'primary' as const,
    },
    {
      title: 'Engagement',
      value: formatNumber(performanceSummary.totalEngagement),
      change: 8.3,
      trend: 'up' as const,
      icon: <ThumbUpIcon />,
      color: 'success' as const,
    },
    {
      title: 'Engagement Rate',
      value: formatPercentage(performanceSummary.averageEngagementRate),
      change: 2.1,
      trend: 'up' as const,
      icon: <TrendingUpIcon />,
      color: 'warning' as const,
    },
    {
      title: 'Audience',
      value: formatNumber(performanceSummary.totalAudience),
      change: performanceSummary.audienceGrowth,
      trend: performanceSummary.audienceGrowth > 0 ? 'up' as const : 'down' as const,
      icon: <PeopleIcon />,
      color: 'info' as const,
    },
  ];

  // Platform Performance Chart Data
  const platformChartData = metrics.platformBreakdown.map(platform => ({
    name: platform.platform,
    engagement: platform.engagement,
    reach: platform.reach,
    engagementRate: platform.engagementRate,
  }));

  // Trends Chart Data
  const trendsChartData = metrics.trendsData.slice(-7); // Last 7 data points

  if (compact) {
    return (
      <Card>
        <CardHeader
          title="Performance Overview"
          subheader={`Last ${timeframe}`}
          avatar={<AssessmentIcon color="primary" />}
          action={
            <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
              <MoreVertIcon />
            </IconButton>
          }
        />
        <CardContent>
          <Grid container spacing={2}>
            {keyMetrics.slice(0, 2).map((metric, index) => (
              <Grid item xs={6} key={index}>
                <MetricCard
                  {...metric}
                  onClick={() => onMetricClick?.(metric.title)}
                />
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ mt: 2, height: 120 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendsChartData}>
                <Area 
                  type="monotone" 
                  dataKey="engagementRate" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.6}
                />
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <RechartsTooltip />
              </AreaChart>
            </ResponsiveContainer>
          </Box>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<LaunchIcon />}
            size="small"
            sx={{ mt: 1 }}
            onClick={() => onMetricClick?.('details')}
          >
            View Details
          </Button>
        </CardContent>

        {/* Context Menu */}
        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
          <MenuItem onClick={() => { setMenuAnchor(null); onMetricClick?.('refresh'); }}>
            <RefreshIcon sx={{ mr: 1 }} />
            Refresh Data
          </MenuItem>
          <MenuItem onClick={() => { setMenuAnchor(null); onMetricClick?.('export'); }}>
            <LaunchIcon sx={{ mr: 1 }} />
            View Full Analytics
          </MenuItem>
        </Menu>
      </Card>
    );
  }

  return (
    <Card sx={{ height }}>
      <CardHeader
        title="Performance Dashboard"
        subheader={`Analytics overview for the last ${timeframe}`}
        avatar={<AssessmentIcon color="primary" />}
        action={
          <Box>
            <IconButton onClick={() => onMetricClick?.('refresh')}>
              <RefreshIcon />
            </IconButton>
            <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
              <MoreVertIcon />
            </IconButton>
          </Box>
        }
      />
      <CardContent>
        {/* Key Metrics Grid */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {keyMetrics.map((metric, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <MetricCard
                {...metric}
                onClick={() => onMetricClick?.(metric.title)}
              />
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ mb: 3 }} />

        {/* Charts Section */}
        <Grid container spacing={3}>
          {/* Trends Chart */}
          <Grid item xs={12} md={8}>
            <Typography variant="subtitle2" gutterBottom>
              Engagement Trends
            </Typography>
            <Box sx={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendsChartData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line 
                    type="monotone" 
                    dataKey="engagementRate" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ fill: '#8884d8' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Grid>

          {/* Platform Breakdown */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom>
              Platform Performance
            </Typography>
            <Box sx={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="engagement"
                    label={({ name, value }) => `${name}: ${formatNumber(value)}`}
                    labelLine={false}
                  >
                    {platformChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Grid>

        {/* Quick Insights */}
        {showDetails && recommendations && !recommendationsLoading && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Quick Insights
            </Typography>
            <Stack spacing={1}>
              {recommendations.recommendations.slice(0, 2).map((rec, index) => (
                <Paper key={index} sx={{ p: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={rec.impact}
                      color={rec.impact === 'high' ? 'error' : rec.impact === 'medium' ? 'warning' : 'default'}
                      size="small"
                    />
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>
                      {rec.title}
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => onMetricClick?.('recommendations')}
                    >
                      View
                    </Button>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Box>
        )}

        {/* Platform Status */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Connected Platforms
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {metrics.platformBreakdown.map((platform) => (
              <Tooltip key={platform.platform} title={`${formatNumber(platform.engagement)} engagement`}>
                <Chip
                  label={platform.platform}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              </Tooltip>
            ))}
          </Box>
        </Box>
      </CardContent>

      {/* Context Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={() => { setMenuAnchor(null); onMetricClick?.('advanced'); }}>
          <AssessmentIcon sx={{ mr: 1 }} />
          Advanced Analytics
        </MenuItem>
        <MenuItem onClick={() => { setMenuAnchor(null); onMetricClick?.('export'); }}>
          <ShareIcon sx={{ mr: 1 }} />
          Export Data
        </MenuItem>
        <MenuItem onClick={() => { setMenuAnchor(null); onMetricClick?.('refresh'); }}>
          <RefreshIcon sx={{ mr: 1 }} />
          Refresh Data
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default PerformanceDashboard;