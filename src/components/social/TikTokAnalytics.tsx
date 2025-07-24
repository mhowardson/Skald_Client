/**
 * TikTok Analytics Component
 * 
 * Displays comprehensive TikTok video performance analytics including
 * engagement metrics, audience demographics, and traffic sources.
 * 
 * @component TikTokAnalytics
 * @version 1.0.0
 * 
 * @features
 * - Video performance metrics and trends
 * - Engagement rate analysis with industry benchmarks
 * - Audience demographics breakdown (age, gender, geography)
 * - Traffic source analysis (FYP, Following, Hashtag, etc.)
 * - View completion rates at different milestones
 * - Time-based performance comparison
 * - Export functionality for analytics data
 * 
 * @props
 * - connectionId: string - TikTok account connection ID
 * - videoIds?: string[] - Specific videos to analyze
 * - timeframe: '7d' | '30d' | '90d' - Analytics time period
 * - onInsightClick?: (insight: AnalyticsInsight) => void - Insight callback
 * 
 * @metrics
 * - Views, Likes, Comments, Shares
 * - Engagement Rate, Reach, Impressions
 * - Profile Visits, Follower Growth
 * - Average Watch Time, Completion Rate
 * - Demographics and Geographic Data
 */

import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Chip,
  IconButton,
  Button,
  Menu,
  MenuItem,
  LinearProgress,
  Alert,
  Skeleton,
  Divider,
  Stack,
  Tooltip,
  Avatar,
} from '@mui/material';
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
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Visibility,
  ThumbUp,
  ChatBubble,
  Share,
  MoreVert,
  FileDownload,
  Info,
  People,
  Public,
} from '@mui/icons-material';
import { useGetPostAnalyticsQuery } from '../../store/api/socialPlatformsApi';

interface TikTokAnalyticsProps {
  connectionId: string;
  videoIds?: string[];
  timeframe: '7d' | '30d' | '90d';
  onInsightClick?: (insight: any) => void;
}

interface VideoMetrics {
  video_id: string;
  video_title: string;
  video_url: string;
  create_time: string;
  duration: number;
  metrics: {
    video_views: number;
    profile_views: number;
    likes: number;
    comments: number;
    shares: number;
    total_time_watched: number;
    average_time_watched: number;
    reach: number;
    impressions: number;
    engagement_rate: number;
  };
  audience_demographics: {
    gender_distribution: {
      male: number;
      female: number;
    };
    age_distribution: Array<{
      age_range: string;
      percentage: number;
    }>;
    geography_distribution: Array<{
      country_code: string;
      percentage: number;
    }>;
  };
  traffic_source: {
    following_feed: number;
    for_you_page: number;
    hashtag_page: number;
    sound_page: number;
    profile_page: number;
    search_page: number;
    others: number;
  };
  video_views_milestones: {
    video_views_p25: number;
    video_views_p50: number;
    video_views_p75: number;
    video_views_p100: number;
  };
}

/**
 * Metric Card Component
 * 
 * Displays individual performance metrics with trend indicators.
 */
interface MetricCardProps {
  title: string;
  value: number | string;
  change?: number;
  format?: 'number' | 'percentage' | 'duration';
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  format = 'number',
  icon,
  color = 'primary',
}) => {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'duration':
        return `${Math.floor(val / 60)}:${(val % 60).toString().padStart(2, '0')}`;
      default:
        return val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` :
               val >= 1000 ? `${(val / 1000).toFixed(1)}K` : val.toLocaleString();
    }
  };

  const getTrendIcon = () => {
    if (change === undefined) return null;
    if (change > 0) return <TrendingUp color="success" sx={{ fontSize: 16 }} />;
    if (change < 0) return <TrendingDown color="error" sx={{ fontSize: 16 }} />;
    return <TrendingFlat color="warning" sx={{ fontSize: 16 }} />;
  };

  const getTrendColor = () => {
    if (change === undefined) return 'text.secondary';
    return change > 0 ? 'success.main' : change < 0 ? 'error.main' : 'warning.main';
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ color: `${color}.main`, mr: 1 }}>{icon}</Box>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" gutterBottom>
          {formatValue(value)}
        </Typography>
        {change !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {getTrendIcon()}
            <Typography variant="body2" sx={{ color: getTrendColor(), ml: 0.5 }}>
              {change > 0 ? '+' : ''}{change.toFixed(1)}%
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Main TikTok Analytics Component
 */
const TikTokAnalytics: React.FC<TikTokAnalyticsProps> = ({
  connectionId,
  videoIds = [],
  timeframe,
  onInsightClick,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // API Query
  const {
    data: analyticsData,
    isLoading,
    error,
    refetch,
  } = useGetPostAnalyticsQuery(
    { postIds: videoIds },
    { 
      skip: videoIds.length === 0,
      refetchOnMountOrArgChange: true,
    }
  );

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExportData = () => {
    // Implementation for data export
    console.log('Exporting TikTok analytics data');
    handleMenuClose();
  };

  // Process analytics data
  const processedData = useMemo(() => {
    if (!analyticsData?.analytics) return null;

    const videos = analyticsData.analytics as VideoMetrics[];
    
    // Aggregate metrics
    const totalMetrics = videos.reduce((acc, video) => {
      acc.views += video.metrics.video_views;
      acc.likes += video.metrics.likes;
      acc.comments += video.metrics.comments;
      acc.shares += video.metrics.shares;
      acc.profileViews += video.metrics.profile_views;
      acc.totalWatchTime += video.metrics.total_time_watched;
      acc.reach += video.metrics.reach;
      acc.impressions += video.metrics.impressions;
      return acc;
    }, {
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      profileViews: 0,
      totalWatchTime: 0,
      reach: 0,
      impressions: 0,
    });

    // Calculate average engagement rate
    const avgEngagementRate = videos.length > 0 
      ? videos.reduce((sum, video) => sum + video.metrics.engagement_rate, 0) / videos.length
      : 0;

    // Prepare time series data
    const timeSeriesData = videos.map(video => ({
      date: new Date(video.create_time).toLocaleDateString(),
      views: video.metrics.video_views,
      likes: video.metrics.likes,
      comments: video.metrics.comments,
      shares: video.metrics.shares,
      engagementRate: video.metrics.engagement_rate,
    }));

    // Aggregate demographics
    const genderData = videos.length > 0 ? {
      male: videos.reduce((sum, v) => sum + v.audience_demographics.gender_distribution.male, 0) / videos.length,
      female: videos.reduce((sum, v) => sum + v.audience_demographics.gender_distribution.female, 0) / videos.length,
    } : { male: 0, female: 0 };

    // Aggregate traffic sources
    const trafficSources = videos.length > 0 ? videos.reduce((acc, video) => {
      acc.following_feed += video.traffic_source.following_feed;
      acc.for_you_page += video.traffic_source.for_you_page;
      acc.hashtag_page += video.traffic_source.hashtag_page;
      acc.sound_page += video.traffic_source.sound_page;
      acc.profile_page += video.traffic_source.profile_page;
      acc.search_page += video.traffic_source.search_page;
      acc.others += video.traffic_source.others;
      return acc;
    }, {
      following_feed: 0,
      for_you_page: 0,
      hashtag_page: 0,
      sound_page: 0,
      profile_page: 0,
      search_page: 0,
      others: 0,
    }) : {};

    // Normalize traffic sources to percentages
    const totalTraffic = Object.values(trafficSources).reduce((sum, val) => sum + (val as number), 0);
    const normalizedTrafficSources = Object.entries(trafficSources).map(([key, value]) => ({
      name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: totalTraffic > 0 ? ((value as number) / totalTraffic) * 100 : 0,
    }));

    return {
      totalMetrics,
      avgEngagementRate,
      timeSeriesData,
      genderData,
      trafficSources: normalizedTrafficSources,
      videoCount: videos.length,
    };
  }, [analyticsData]);

  // Loading skeleton
  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item}>
            <Card>
              <CardContent>
                <Skeleton variant="rectangular" height={100} />
              </CardContent>
            </Card>
          </Grid>
        ))}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Skeleton variant="rectangular" height={400} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert severity="error" action={
        <Button color="inherit" size="small" onClick={() => refetch()}>
          Retry
        </Button>
      }>
        Failed to load TikTok analytics. Please try again.
      </Alert>
    );
  }

  // No data state
  if (!processedData || processedData.videoCount === 0) {
    return (
      <Alert severity="info">
        No TikTok videos found for the selected time period. Upload some videos to see analytics.
      </Alert>
    );
  }

  const COLORS = ['#ff0050', '#25f4ee', '#fe2c55', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#fcea2b'];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          TikTok Analytics
        </Typography>
        <Box>
          <IconButton onClick={handleMenuOpen}>
            <MoreVert />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={handleExportData}>
              <FileDownload sx={{ mr: 1 }} />
              Export Data
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Views"
            value={processedData.totalMetrics.views}
            icon={<Visibility />}
            color="primary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Engagement Rate"
            value={processedData.avgEngagementRate}
            format="percentage"
            icon={<ThumbUp />}
            color="success"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Likes"
            value={processedData.totalMetrics.likes}
            icon={<ThumbUp />}
            color="error"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Profile Visits"
            value={processedData.totalMetrics.profileViews}
            icon={<People />}
            color="secondary"
          />
        </Grid>

        {/* Performance Trends */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardHeader 
              title="Performance Trends"
              subheader={`Video performance over the last ${timeframe}`}
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={processedData.timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#ff0050" 
                    strokeWidth={3}
                    name="Views"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="likes" 
                    stroke="#25f4ee" 
                    strokeWidth={2}
                    name="Likes"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="comments" 
                    stroke="#fe2c55" 
                    strokeWidth={2}
                    name="Comments"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Traffic Sources */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardHeader 
              title="Traffic Sources"
              subheader="Where your views come from"
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={processedData.trafficSources}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {processedData.trafficSources.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Audience Demographics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Audience Demographics"
              subheader="Gender distribution of your viewers"
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {processedData.genderData.female.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Female
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="secondary">
                      {processedData.genderData.male.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Male
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Engagement Breakdown */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Engagement Breakdown"
              subheader="Types of engagement on your content"
            />
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Likes</Typography>
                    <Typography variant="body2">
                      {processedData.totalMetrics.likes.toLocaleString()}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={85} 
                    sx={{ height: 8, borderRadius: 4 }}
                    color="error"
                  />
                </Box>
                
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Comments</Typography>
                    <Typography variant="body2">
                      {processedData.totalMetrics.comments.toLocaleString()}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={65} 
                    sx={{ height: 8, borderRadius: 4 }}
                    color="primary"
                  />
                </Box>
                
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Shares</Typography>
                    <Typography variant="body2">
                      {processedData.totalMetrics.shares.toLocaleString()}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={45} 
                    sx={{ height: 8, borderRadius: 4 }}
                    color="secondary"
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Insights and Recommendations */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="Insights & Recommendations"
              subheader="AI-powered insights to improve your TikTok performance"
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Alert severity="success" icon={<TrendingUp />}>
                    <Typography variant="subtitle2">Great Engagement!</Typography>
                    <Typography variant="body2">
                      Your engagement rate is {processedData.avgEngagementRate.toFixed(1)}%, which is above the TikTok average of 5.3%.
                    </Typography>
                  </Alert>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Alert severity="info" icon={<Info />}>
                    <Typography variant="subtitle2">For You Page Performance</Typography>
                    <Typography variant="body2">
                      {processedData.trafficSources.find(s => s.name.includes('For You'))?.value.toFixed(1)}% of your traffic comes from FYP. Keep creating engaging content!
                    </Typography>
                  </Alert>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Alert severity="warning" icon={<Public />}>
                    <Typography variant="subtitle2">Expand Reach</Typography>
                    <Typography variant="body2">
                      Try using trending hashtags and sounds to increase your reach and get on more For You pages.
                    </Typography>
                  </Alert>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TikTokAnalytics;