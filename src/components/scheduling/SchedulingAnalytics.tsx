import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Stack,
  Grid,
  Button,
  IconButton,
  Chip,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
  Divider,
  Avatar,
  Tooltip,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Analytics,
  TrendingUp,
  TrendingDown,
  Schedule,
  CheckCircle,
  Error as ErrorIcon,
  Timeline,
  Speed,
  AccessTime,
  People,
  Visibility,
  ThumbUp,
  Share,
  Comment,
  BarChart,
  PieChart,
  ShowChart,
  CalendarMonth,
  Compare,
  Download,
  Refresh,
  FilterList,
  InsightsOutlined,
  Psychology,
  AutoAwesome,
  DataUsage,
  Assessment,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface SchedulingMetrics {
  totalPosts: number;
  successfulPosts: number;
  failedPosts: number;
  averageEngagement: number;
  totalReach: number;
  bestPerformingTime: string;
  bestPerformingPlatform: string;
  successRate: number;
  averageTimeToPublish: number; // seconds
}

interface PlatformPerformance {
  platform: string;
  posts: number;
  successRate: number;
  averageEngagement: number;
  totalReach: number;
  bestTime: string;
  trend: 'up' | 'down' | 'neutral';
  trendPercentage: number;
}

interface TimeSlotAnalysis {
  timeSlot: string;
  posts: number;
  successRate: number;
  averageEngagement: number;
  reach: number;
  platforms: string[];
}

interface ContentPerformance {
  id: string;
  title: string;
  scheduledAt: Date;
  platforms: string[];
  status: 'published' | 'failed' | 'cancelled';
  engagement: number;
  reach: number;
  clicks: number;
  shares: number;
  comments: number;
  optimizationScore: number;
}

interface SchedulingAnalyticsProps {
  dateRange?: { start: Date; end: Date };
  platforms?: string[];
  onDateRangeChange?: (range: { start: Date; end: Date }) => void;
  onExport?: (data: any) => void;
}

const platformColors: Record<string, string> = {
  linkedin: '#0A66C2',
  twitter: '#1DA1F2',
  instagram: '#E4405F',
  facebook: '#1877F2',
  youtube: '#FF0000',
  tiktok: '#000000',
};

const platformIcons: Record<string, string> = {
  linkedin: '💼',
  twitter: '🐦',
  instagram: '📷',
  facebook: '📘',
  youtube: '📺',
  tiktok: '🎵',
};

// Mock analytics data
const mockMetrics: SchedulingMetrics = {
  totalPosts: 245,
  successfulPosts: 231,
  failedPosts: 14,
  averageEngagement: 7.8,
  totalReach: 1250000,
  bestPerformingTime: '17:00',
  bestPerformingPlatform: 'linkedin',
  successRate: 94.3,
  averageTimeToPublish: 32,
};

const mockPlatformPerformance: PlatformPerformance[] = [
  {
    platform: 'linkedin',
    posts: 89,
    successRate: 97.8,
    averageEngagement: 9.2,
    totalReach: 450000,
    bestTime: '17:00',
    trend: 'up',
    trendPercentage: 12.5,
  },
  {
    platform: 'twitter',
    posts: 156,
    successRate: 92.3,
    averageEngagement: 6.8,
    totalReach: 380000,
    bestTime: '19:00',
    trend: 'up',
    trendPercentage: 8.2,
  },
  {
    platform: 'instagram',
    posts: 78,
    successRate: 96.2,
    averageEngagement: 8.5,
    totalReach: 290000,
    bestTime: '20:00',
    trend: 'neutral',
    trendPercentage: 1.2,
  },
  {
    platform: 'facebook',
    posts: 45,
    successRate: 88.9,
    averageEngagement: 5.3,
    totalReach: 130000,
    bestTime: '12:00',
    trend: 'down',
    trendPercentage: -4.8,
  },
];

const mockTimeSlotAnalysis: TimeSlotAnalysis[] = [
  { timeSlot: '08:00', posts: 18, successRate: 88.9, averageEngagement: 6.2, reach: 95000, platforms: ['twitter', 'linkedin'] },
  { timeSlot: '09:00', posts: 32, successRate: 93.8, averageEngagement: 7.8, reach: 145000, platforms: ['linkedin', 'twitter'] },
  { timeSlot: '12:00', posts: 28, successRate: 89.3, averageEngagement: 6.9, reach: 125000, platforms: ['facebook', 'linkedin'] },
  { timeSlot: '15:00', posts: 24, successRate: 91.7, averageEngagement: 7.2, reach: 118000, platforms: ['instagram', 'twitter'] },
  { timeSlot: '17:00', posts: 45, successRate: 97.8, averageEngagement: 9.2, reach: 235000, platforms: ['linkedin', 'instagram'] },
  { timeSlot: '19:00', posts: 38, successRate: 94.7, averageEngagement: 8.1, reach: 198000, platforms: ['twitter', 'instagram'] },
  { timeSlot: '20:00', posts: 35, successRate: 91.4, averageEngagement: 8.8, reach: 182000, platforms: ['instagram', 'facebook'] },
  { timeSlot: '21:00', posts: 25, successRate: 88.0, averageEngagement: 7.5, reach: 142000, platforms: ['facebook', 'twitter'] },
];

const mockEngagementTrend = [
  { date: '2024-01-15', engagement: 6.2, reach: 125000, posts: 12 },
  { date: '2024-01-16', engagement: 7.1, reach: 142000, posts: 15 },
  { date: '2024-01-17', engagement: 6.8, reach: 138000, posts: 18 },
  { date: '2024-01-18', engagement: 8.2, reach: 165000, posts: 14 },
  { date: '2024-01-19', engagement: 7.9, reach: 158000, posts: 16 },
  { date: '2024-01-20', engagement: 9.1, reach: 185000, posts: 13 },
  { date: '2024-01-21', engagement: 8.5, reach: 172000, posts: 17 },
];

const mockTopContent: ContentPerformance[] = [
  {
    id: '1',
    title: 'AI-Powered Marketing Strategies',
    scheduledAt: subDays(new Date(), 2),
    platforms: ['linkedin', 'twitter'],
    status: 'published',
    engagement: 12.5,
    reach: 45000,
    clicks: 2800,
    shares: 180,
    comments: 95,
    optimizationScore: 92,
  },
  {
    id: '2',
    title: 'Social Media Trends 2024',
    scheduledAt: subDays(new Date(), 1),
    platforms: ['instagram', 'facebook', 'twitter'],
    status: 'published',
    engagement: 11.8,
    reach: 38000,
    clicks: 2200,
    shares: 150,
    comments: 85,
    optimizationScore: 89,
  },
  {
    id: '3',
    title: 'Content Creation Best Practices',
    scheduledAt: subDays(new Date(), 3),
    platforms: ['linkedin', 'instagram'],
    status: 'published',
    engagement: 10.2,
    reach: 32000,
    clicks: 1950,
    shares: 125,
    comments: 68,
    optimizationScore: 85,
  },
];

export const SchedulingAnalytics: React.FC<SchedulingAnalyticsProps> = ({
  dateRange = { start: subDays(new Date(), 30), end: new Date() },
  platforms = ['linkedin', 'twitter', 'instagram', 'facebook'],
  onDateRangeChange,
  onExport,
}) => {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'comparison'>('overview');
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'engagement' | 'reach' | 'success'>('engagement');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(platforms);

  // Filter data based on selected platforms
  const filteredPlatformData = useMemo(() => {
    return mockPlatformPerformance.filter(p => selectedPlatforms.includes(p.platform));
  }, [selectedPlatforms]);

  // Calculate comparative metrics
  const comparativeMetrics = useMemo(() => {
    const current = mockMetrics;
    const previous = {
      successRate: 91.2,
      averageEngagement: 7.1,
      totalReach: 1150000,
    };

    return {
      successRateChange: current.successRate - previous.successRate,
      engagementChange: current.averageEngagement - previous.averageEngagement,
      reachChange: ((current.totalReach - previous.totalReach) / previous.totalReach) * 100,
    };
  }, []);

  // Render overview dashboard
  const renderOverview = () => (
    <Grid container spacing={3}>
      {/* Key Metrics Cards */}
      <Grid item xs={12}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: 3, background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)` }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: theme.palette.success.main, mx: 'auto', mb: 2, width: 56, height: 56 }}>
                  <CheckCircle />
                </Avatar>
                <Typography variant="h3" fontWeight={700} color="success.main">
                  {mockMetrics.successRate}%
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Success Rate
                </Typography>
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                  <TrendingUp sx={{ fontSize: 16, color: theme.palette.success.main }} />
                  <Typography variant="caption" color="success.main" fontWeight={600}>
                    +{comparativeMetrics.successRateChange.toFixed(1)}%
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: 3, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)` }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main, mx: 'auto', mb: 2, width: 56, height: 56 }}>
                  <ThumbUp />
                </Avatar>
                <Typography variant="h3" fontWeight={700} color="primary.main">
                  {mockMetrics.averageEngagement}%
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Avg Engagement
                </Typography>
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                  <TrendingUp sx={{ fontSize: 16, color: theme.palette.success.main }} />
                  <Typography variant="caption" color="success.main" fontWeight={600}>
                    +{comparativeMetrics.engagementChange.toFixed(1)}%
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: 3, background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)` }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: theme.palette.info.main, mx: 'auto', mb: 2, width: 56, height: 56 }}>
                  <Visibility />
                </Avatar>
                <Typography variant="h3" fontWeight={700} color="info.main">
                  {(mockMetrics.totalReach / 1000000).toFixed(1)}M
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Total Reach
                </Typography>
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                  <TrendingUp sx={{ fontSize: 16, color: theme.palette.success.main }} />
                  <Typography variant="caption" color="success.main" fontWeight={600}>
                    +{comparativeMetrics.reachChange.toFixed(1)}%
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: 3, background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)` }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: theme.palette.warning.main, mx: 'auto', mb: 2, width: 56, height: 56 }}>
                  <Speed />
                </Avatar>
                <Typography variant="h3" fontWeight={700} color="warning.main">
                  {mockMetrics.averageTimeToPublish}s
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Avg Publish Time
                </Typography>
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                  <TrendingDown sx={{ fontSize: 16, color: theme.palette.success.main }} />
                  <Typography variant="caption" color="success.main" fontWeight={600}>
                    -12% faster
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Engagement Trend Chart */}
      <Grid item xs={12} lg={8}>
        <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={600}>
              Engagement Trends
            </Typography>
            <ToggleButtonGroup
              value={selectedMetric}
              exclusive
              onChange={(_, value) => value && setSelectedMetric(value)}
              size="small"
            >
              <ToggleButton value="engagement">Engagement</ToggleButton>
              <ToggleButton value="reach">Reach</ToggleButton>
              <ToggleButton value="posts">Posts</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mockEngagementTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
              <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
              <YAxis stroke={theme.palette.text.secondary} />
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  borderRadius: 8,
                }}
              />
              <Area
                type="monotone"
                dataKey={selectedMetric}
                stroke={theme.palette.primary.main}
                fill={alpha(theme.palette.primary.main, 0.1)}
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Platform Performance */}
      <Grid item xs={12} lg={4}>
        <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
            Platform Performance
          </Typography>
          <Stack spacing={2}>
            {filteredPlatformData.map((platform) => (
              <Card key={platform.platform} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(platformColors[platform.platform], 0.1),
                        color: platformColors[platform.platform],
                        width: 40,
                        height: 40,
                      }}
                    >
                      {platformIcons[platform.platform]}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                        {platform.platform}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {platform.posts} posts • {platform.successRate}% success
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack alignItems="flex-end">
                    <Typography variant="h6" fontWeight={600} color="primary.main">
                      {platform.averageEngagement}%
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      {platform.trend === 'up' ? (
                        <TrendingUp sx={{ fontSize: 14, color: theme.palette.success.main }} />
                      ) : platform.trend === 'down' ? (
                        <TrendingDown sx={{ fontSize: 14, color: theme.palette.error.main }} />
                      ) : null}
                      <Typography 
                        variant="caption" 
                        color={platform.trend === 'up' ? 'success.main' : platform.trend === 'down' ? 'error.main' : 'text.secondary'}
                        fontWeight={600}
                      >
                        {platform.trend === 'neutral' ? '±' : platform.trend === 'up' ? '+' : ''}{platform.trendPercentage}%
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Paper>
      </Grid>

      {/* Optimal Times Heatmap */}
      <Grid item xs={12} lg={6}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
            Optimal Publishing Times
          </Typography>
          <Grid container spacing={1}>
            {mockTimeSlotAnalysis.map((slot) => (
              <Grid item xs={3} key={slot.timeSlot}>
                <Tooltip title={`${slot.timeSlot}: ${slot.averageEngagement}% engagement, ${slot.posts} posts`}>
                  <Card
                    sx={{
                      p: 1.5,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, slot.successRate / 100 * 0.3)} 0%, ${alpha(theme.palette.primary.main, slot.successRate / 100 * 0.1)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.primary.main, slot.successRate / 100 * 0.5)}`,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[8],
                      },
                    }}
                  >
                    <Typography variant="h6" fontWeight={600} color="primary.main">
                      {slot.timeSlot}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {slot.averageEngagement}%
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <LinearProgress
                        variant="determinate"
                        value={slot.successRate}
                        sx={{ height: 4, borderRadius: 2 }}
                        color="primary"
                      />
                    </Box>
                  </Card>
                </Tooltip>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Grid>

      {/* Top Performing Content */}
      <Grid item xs={12} lg={6}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={600}>
              Top Performing Content
            </Typography>
            <Button variant="outlined" size="small" sx={{ borderRadius: 2 }}>
              View All
            </Button>
          </Stack>
          <Stack spacing={2}>
            {mockTopContent.map((content, index) => (
              <Card key={content.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Badge
                    badgeContent={index + 1}
                    color="primary"
                    sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem', minWidth: 18, height: 18 } }}
                  >
                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                      <TrendingUp />
                    </Avatar>
                  </Badge>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
                      {content.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      {format(content.scheduledAt, 'MMM d, HH:mm')} • {content.platforms.length} platforms
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <ThumbUp sx={{ fontSize: 12, color: theme.palette.text.secondary }} />
                        <Typography variant="caption">{content.engagement}%</Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Visibility sx={{ fontSize: 12, color: theme.palette.text.secondary }} />
                        <Typography variant="caption">{(content.reach / 1000).toFixed(1)}K</Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Share sx={{ fontSize: 12, color: theme.palette.text.secondary }} />
                        <Typography variant="caption">{content.shares}</Typography>
                      </Stack>
                    </Stack>
                  </Box>
                  <Chip
                    label={`${content.optimizationScore}%`}
                    size="small"
                    color={content.optimizationScore >= 90 ? 'success' : content.optimizationScore >= 70 ? 'warning' : 'error'}
                    variant="outlined"
                  />
                </Stack>
              </Card>
            ))}
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );

  // Render detailed analytics
  const renderDetailed = () => (
    <Grid container spacing={3}>
      {/* Detailed Time Analysis */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
            Detailed Time Slot Analysis
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Time Slot</TableCell>
                  <TableCell align="right">Posts</TableCell>
                  <TableCell align="right">Success Rate</TableCell>
                  <TableCell align="right">Avg Engagement</TableCell>
                  <TableCell align="right">Total Reach</TableCell>
                  <TableCell>Best Platforms</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockTimeSlotAnalysis.map((slot) => (
                  <TableRow key={slot.timeSlot} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {slot.timeSlot}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{slot.posts}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={1}>
                        <Typography>{slot.successRate}%</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={slot.successRate}
                          sx={{ width: 60, height: 4, borderRadius: 2 }}
                        />
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600} color="primary.main">
                        {slot.averageEngagement}%
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {(slot.reach / 1000).toFixed(0)}K
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        {slot.platforms.map((platform) => (
                          <Chip
                            key={platform}
                            label={platformIcons[platform]}
                            size="small"
                            sx={{
                              bgcolor: alpha(platformColors[platform], 0.1),
                              border: `1px solid ${alpha(platformColors[platform], 0.3)}`,
                            }}
                          />
                        ))}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>

      {/* Platform Deep Dive */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
            Platform Performance Deep Dive
          </Typography>
          <Grid container spacing={3}>
            {filteredPlatformData.map((platform) => (
              <Grid item xs={12} md={6} lg={4} key={platform.platform}>
                <Card sx={{ height: '100%', borderRadius: 2, border: `2px solid ${alpha(platformColors[platform.platform], 0.2)}` }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(platformColors[platform.platform], 0.1),
                          color: platformColors[platform.platform],
                          width: 48,
                          height: 48,
                        }}
                      >
                        {platformIcons[platform.platform]}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                          {platform.platform}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {platform.posts} posts published
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack spacing={2}>
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">Success Rate</Typography>
                          <Typography variant="h6" fontWeight={600} color="success.main">
                            {platform.successRate}%
                          </Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={platform.successRate} sx={{ height: 6, borderRadius: 3 }} color="success" />
                      </Box>

                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">Avg Engagement</Typography>
                          <Typography variant="h6" fontWeight={600} color="primary.main">
                            {platform.averageEngagement}%
                          </Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={platform.averageEngagement * 10} sx={{ height: 6, borderRadius: 3 }} />
                      </Box>

                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Total Reach</Typography>
                        <Typography variant="h5" fontWeight={600}>
                          {(platform.totalReach / 1000).toFixed(0)}K
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Best Time</Typography>
                        <Chip label={platform.bestTime} size="small" color="primary" />
                      </Box>

                      <Box>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">Trend</Typography>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            {platform.trend === 'up' ? (
                              <TrendingUp sx={{ fontSize: 16, color: theme.palette.success.main }} />
                            ) : platform.trend === 'down' ? (
                              <TrendingDown sx={{ fontSize: 16, color: theme.palette.error.main }} />
                            ) : null}
                            <Typography 
                              variant="body2" 
                              fontWeight={600}
                              color={platform.trend === 'up' ? 'success.main' : platform.trend === 'down' ? 'error.main' : 'text.secondary'}
                            >
                              {platform.trend === 'neutral' ? '±' : platform.trend === 'up' ? '+' : ''}{platform.trendPercentage}%
                            </Typography>
                          </Stack>
                        </Stack>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );

  // Render comparison view
  const renderComparison = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
            Platform Comparison
          </Typography>
          
          {/* Comparison Chart */}
          <ResponsiveContainer width="100%" height={400}>
            <RechartsBarChart data={filteredPlatformData}>
              <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
              <XAxis dataKey="platform" stroke={theme.palette.text.secondary} />
              <YAxis stroke={theme.palette.text.secondary} />
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  borderRadius: 8,
                }}
              />
              <Legend />
              <Bar dataKey="successRate" fill={theme.palette.success.main} name="Success Rate %" />
              <Bar dataKey="averageEngagement" fill={theme.palette.primary.main} name="Avg Engagement %" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Comparison Table */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
            Side-by-Side Comparison
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Platform</TableCell>
                  <TableCell align="right">Posts</TableCell>
                  <TableCell align="right">Success Rate</TableCell>
                  <TableCell align="right">Avg Engagement</TableCell>
                  <TableCell align="right">Total Reach</TableCell>
                  <TableCell align="right">Best Time</TableCell>
                  <TableCell align="right">Trend</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPlatformData
                  .sort((a, b) => b.averageEngagement - a.averageEngagement)
                  .map((platform, index) => (
                  <TableRow key={platform.platform} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Badge badgeContent={index + 1} color="primary">
                          <Avatar
                            sx={{
                              bgcolor: alpha(platformColors[platform.platform], 0.1),
                              color: platformColors[platform.platform],
                              width: 32,
                              height: 32,
                            }}
                          >
                            {platformIcons[platform.platform]}
                          </Avatar>
                        </Badge>
                        <Typography variant="subtitle2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                          {platform.platform}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">{platform.posts}</TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600} color="success.main">
                        {platform.successRate}%
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600} color="primary.main">
                        {platform.averageEngagement}%
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {(platform.totalReach / 1000).toFixed(0)}K
                    </TableCell>
                    <TableCell align="right">
                      <Chip label={platform.bestTime} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5}>
                        {platform.trend === 'up' ? (
                          <TrendingUp sx={{ fontSize: 16, color: theme.palette.success.main }} />
                        ) : platform.trend === 'down' ? (
                          <TrendingDown sx={{ fontSize: 16, color: theme.palette.error.main }} />
                        ) : null}
                        <Typography 
                          variant="body2" 
                          fontWeight={600}
                          color={platform.trend === 'up' ? 'success.main' : platform.trend === 'down' ? 'error.main' : 'text.secondary'}
                        >
                          {platform.trend === 'neutral' ? '±' : platform.trend === 'up' ? '+' : ''}{platform.trendPercentage}%
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)` }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Analytics color="primary" />
              Scheduling Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Comprehensive performance insights and optimization recommendations
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={() => onExport?.(mockMetrics)}
              sx={{ borderRadius: 2 }}
            >
              Export
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              sx={{ borderRadius: 2 }}
            >
              Refresh
            </Button>
          </Stack>
        </Stack>

        {/* Controls */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Timeframe</InputLabel>
              <Select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as any)}
                label="Timeframe"
              >
                <MenuItem value="7d">Last 7 days</MenuItem>
                <MenuItem value="30d">Last 30 days</MenuItem>
                <MenuItem value="90d">Last 90 days</MenuItem>
                <MenuItem value="custom">Custom range</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Platforms</InputLabel>
              <Select
                multiple
                value={selectedPlatforms}
                onChange={(e) => setSelectedPlatforms(e.target.value as string[])}
                label="Platforms"
                renderValue={(selected) => `${selected.length} platforms`}
              >
                {Object.keys(platformIcons).map((platform) => (
                  <MenuItem key={platform} value={platform}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography>{platformIcons[platform]}</Typography>
                      <Typography sx={{ textTransform: 'capitalize' }}>{platform}</Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, value) => value && setViewMode(value)}
              size="small"
              fullWidth
            >
              <ToggleButton value="overview">Overview</ToggleButton>
              <ToggleButton value="detailed">Detailed</ToggleButton>
              <ToggleButton value="comparison">Compare</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </Paper>

      {/* Content */}
      {viewMode === 'overview' && renderOverview()}
      {viewMode === 'detailed' && renderDetailed()}
      {viewMode === 'comparison' && renderComparison()}

      {/* AI Insights */}
      <Paper sx={{ p: 3, mt: 3, borderRadius: 3, bgcolor: alpha(theme.palette.info.main, 0.05), border: `1px solid ${alpha(theme.palette.info.main, 0.2)}` }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Psychology color="info" />
          <Typography variant="h6" fontWeight={600}>
            AI-Powered Insights & Recommendations
          </Typography>
        </Stack>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Stack alignItems="center" sx={{ p: 2, textAlign: 'center' }}>
              <AutoAwesome sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 1 }} />
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                Optimal Scheduling
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your best performing time is 17:00 on weekdays. Consider scheduling more content during this window for 23% higher engagement.
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack alignItems="center" sx={{ p: 2, textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 48, color: theme.palette.success.main, mb: 1 }} />
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                Platform Focus
              </Typography>
              <Typography variant="body2" color="text.secondary">
                LinkedIn shows the highest ROI with 9.2% engagement. Increase LinkedIn content by 40% to maximize overall performance.
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack alignItems="center" sx={{ p: 2, textAlign: 'center' }}>
              <Assessment sx={{ fontSize: 48, color: theme.palette.warning.main, mb: 1 }} />
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                Content Optimization
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Posts with 3-5 hashtags perform 18% better. Your average optimization score could improve from 87% to 94%.
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};