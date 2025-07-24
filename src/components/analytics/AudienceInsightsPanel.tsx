/**
 * Audience Insights Panel Component
 * 
 * Comprehensive audience analytics dashboard providing deep insights
 * into audience demographics, behavior patterns, and engagement trends.
 * 
 * @component AudienceInsightsPanel
 * @version 1.0.0
 * 
 * @features
 * - Demographic breakdowns (age, gender, location)
 * - Engagement pattern analysis
 * - Optimal posting time recommendations
 * - Audience growth tracking
 * - Interest and affinity mapping
 * - Cross-platform audience overlap
 * - Behavioral insights and trends
 * 
 * @props
 * - timeframe: string - Analysis timeframe
 * - platforms: string[] - Platform filter
 * - onInsightClick: (insight: string) => void - Insight click handler
 * - showRecommendations: boolean - Show AI recommendations
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
  Menu,
  MenuItem,
  Avatar,
  LinearProgress,
  Button,
  Skeleton,
  Alert,
  Divider,
  Stack,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
} from '@mui/material';
import {
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Schedule as ScheduleIcon,
  Public as PublicIcon,
  PersonPin as PersonPinIcon,
  Interests as InterestsIcon,
  Timeline as TimelineIcon,
  MoreVert as MoreVertIcon,
  Lightbulb as LightbulbIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  LocationOn as LocationIcon,
  AccessTime as AccessTimeIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  ComposedChart,
} from 'recharts';
import {
  useGetAudienceInsightsQuery,
  useGetRecommendationsQuery,
} from '../../store/api/advancedAnalyticsApi';

interface AudienceInsightsPanelProps {
  timeframe?: string;
  platforms?: string[];
  onInsightClick?: (insight: string) => void;
  showRecommendations?: boolean;
}

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
      id={`audience-tabpanel-${index}`}
      aria-labelledby={`audience-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00c49f', '#ffbb28', '#ff8042'];

export const AudienceInsightsPanel: React.FC<AudienceInsightsPanelProps> = ({
  timeframe = '30d',
  platforms = [],
  onInsightClick,
  showRecommendations = true,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  // API Queries
  const { data: audienceData, isLoading: audienceLoading } = useGetAudienceInsightsQuery({
    timeframe,
    platforms: platforms.length > 0 ? platforms : undefined,
  });

  const { data: recommendations } = useGetRecommendationsQuery({
    timeframe,
    platforms: platforms.length > 0 ? platforms : undefined,
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Process audience data for visualizations
  const processedData = useMemo(() => {
    if (!audienceData?.insights) return null;

    const { insights } = audienceData;

    // Gender distribution for pie chart
    const genderData = [
      { name: 'Female', value: insights.demographics.genderDistribution.female, color: '#ff6b9d' },
      { name: 'Male', value: insights.demographics.genderDistribution.male, color: '#4ecdc4' },
      { name: 'Other', value: insights.demographics.genderDistribution.other, color: '#ffe66d' },
    ];

    // Age groups data
    const ageGroupsData = insights.demographics.ageGroups.map(group => ({
      ageRange: group.ageRange,
      percentage: group.percentage,
      engagement: group.engagement,
    }));

    // Top locations data
    const locationsData = insights.demographics.topLocations.slice(0, 10);

    // Posting times heatmap data
    const postingTimesData = insights.engagementPatterns.bestPostingTimes.map(time => ({
      hour: time.hour,
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][time.dayOfWeek],
      engagement: time.avgEngagementRate,
      posts: time.contentCount,
    }));

    // Day of week performance
    const dayPerformanceData = insights.engagementPatterns.dayOfWeekPerformance.map(day => ({
      day: day.dayOfWeek.substring(0, 3),
      engagement: day.avgEngagementRate,
      reach: day.reach,
      posts: day.contentCount,
    }));

    // Hourly activity data
    const hourlyActivityData = insights.engagementPatterns.mostActiveHours.map(hour => ({
      hour: `${hour.hour}:00`,
      activeUsers: hour.activeUsers,
      engagement: hour.engagementRate,
    }));

    // Interest affinity data
    const interestsData = insights.demographics.interests.map(interest => ({
      category: interest.category,
      percentage: interest.percentage,
      affinity: interest.affinity * 100, // Convert to percentage
    }));

    return {
      genderData,
      ageGroupsData,
      locationsData,
      postingTimesData,
      dayPerformanceData,
      hourlyActivityData,
      interestsData,
      totalAudience: insights.totalAudience,
      audienceGrowth: insights.audienceGrowth,
      crossPlatformOverlap: insights.crossPlatformOverlap,
    };
  }, [audienceData]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Loading State
  if (audienceLoading) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="rectangular" height={400} />
        </CardContent>
      </Card>
    );
  }

  // No Data State
  if (!processedData) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info">
            Connect social media accounts to view audience insights
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Audience Overview Component
  const AudienceOverview = () => (
    <Grid container spacing={3}>
      {/* Audience Summary */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
              <PeopleIcon sx={{ fontSize: 30 }} />
            </Avatar>
            <Typography variant="h4" gutterBottom>
              {formatNumber(processedData.totalAudience)}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Audience
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
              {processedData.audienceGrowth > 0 ? (
                <TrendingUpIcon color="success" sx={{ mr: 0.5 }} />
              ) : (
                <TrendingDownIcon color="error" sx={{ mr: 0.5 }} />
              )}
              <Typography
                variant="body2"
                color={processedData.audienceGrowth > 0 ? 'success.main' : 'error.main'}
              >
                {processedData.audienceGrowth > 0 ? '+' : ''}{processedData.audienceGrowth} this period
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Gender Distribution */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardHeader title="Gender Distribution" />
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={processedData.genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                  labelLine={false}
                >
                  {processedData.genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Age Groups */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardHeader title="Age Distribution" />
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={processedData.ageGroupsData}>
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

      {/* Platform Overlap */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title="Cross-Platform Audience Overlap" />
          <CardContent>
            <Grid container spacing={2}>
              {processedData.crossPlatformOverlap.map((overlap, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {overlap.platforms.join(' & ')}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={overlap.overlapPercentage}
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {overlap.overlapPercentage.toFixed(1)}% overlap • {formatNumber(overlap.audienceSize)} users
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Engagement Patterns Component
  const EngagementPatterns = () => (
    <Grid container spacing={3}>
      {/* Best Posting Times */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Optimal Posting Times" />
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={processedData.postingTimesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="engagement" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Day of Week Performance */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Day of Week Performance" />
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={processedData.dayPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <RechartsTooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="engagement" fill="#8884d8" name="Engagement Rate" />
                <Line yAxisId="right" type="monotone" dataKey="reach" stroke="#ff7300" name="Reach" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Hourly Activity */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title="Audience Activity by Hour" />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={processedData.hourlyActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <RechartsTooltip />
                <Area
                  type="monotone"
                  dataKey="activeUsers"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Quick Insights */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title="Engagement Insights" avatar={<LightbulbIcon color="primary" />} />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Alert severity="success">
                  <Typography variant="subtitle2">Peak Activity</Typography>
                  <Typography variant="body2">
                    Your audience is most active on{' '}
                    {processedData.dayPerformanceData.reduce((max, day) =>
                      day.engagement > max.engagement ? day : max
                    ).day}s
                  </Typography>
                </Alert>
              </Grid>
              <Grid item xs={12} md={4}>
                <Alert severity="info">
                  <Typography variant="subtitle2">Best Posting Time</Typography>
                  <Typography variant="body2">
                    Post at{' '}
                    {processedData.postingTimesData.reduce((max, time) =>
                      time.engagement > max.engagement ? time : max
                    ).hour}:00 for maximum engagement
                  </Typography>
                </Alert>
              </Grid>
              <Grid item xs={12} md={4}>
                <Alert severity="warning">
                  <Typography variant="subtitle2">Growth Opportunity</Typography>
                  <Typography variant="body2">
                    Focus on{' '}
                    {processedData.dayPerformanceData.reduce((min, day) =>
                      day.engagement < min.engagement ? day : min
                    ).day}s to improve overall reach
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Geographic Distribution Component
  const GeographicDistribution = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardHeader title="Top Locations" />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Rank</TableCell>
                    <TableCell>Country</TableCell>
                    <TableCell align="right">Audience %</TableCell>
                    <TableCell align="right">Engagement Rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {processedData.locationsData.map((location, index) => (
                    <TableRow key={location.country}>
                      <TableCell>
                        <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                          {index + 1}
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          {location.country}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {location.percentage.toFixed(1)}%
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${location.engagement.toFixed(1)}%`}
                          color={location.engagement > 3 ? 'success' : 'default'}
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

      <Grid item xs={12} md={4}>
        <Card>
          <CardHeader title="Interest Categories" />
          <CardContent>
            <List dense>
              {processedData.interestsData.map((interest, index) => (
                <ListItem key={interest.category}>
                  <ListItemIcon>
                    <InterestsIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={interest.category}
                    secondary={`${interest.percentage}% of audience`}
                  />
                  <ListItemSecondaryAction>
                    <Chip
                      label={`${interest.affinity.toFixed(0)}%`}
                      color={interest.affinity > 120 ? 'success' : 'default'}
                      size="small"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Card>
      <CardHeader
        title="Audience Insights"
        subheader={`Comprehensive audience analysis for the last ${timeframe}`}
        avatar={<PeopleIcon color="primary" />}
        action={
          <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
            <MoreVertIcon />
          </IconButton>
        }
      />
      <CardContent>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="audience insights tabs">
            <Tab label="Overview" icon={<PeopleIcon />} iconPosition="start" />
            <Tab label="Engagement" icon={<TimelineIcon />} iconPosition="start" />
            <Tab label="Geographic" icon={<PublicIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <TabPanel value={activeTab} index={0}>
          <AudienceOverview />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <EngagementPatterns />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <GeographicDistribution />
        </TabPanel>

        {/* AI Recommendations */}
        {showRecommendations && recommendations && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Audience Optimization Recommendations
            </Typography>
            <Grid container spacing={2}>
              {recommendations.recommendations
                .filter(rec => rec.type === 'audience' || rec.type === 'posting_time')
                .slice(0, 3)
                .map((rec, index) => (
                  <Grid item xs={12} md={4} key={index}>
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
          </Box>
        )}
      </CardContent>

      {/* Context Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={() => { setMenuAnchor(null); onInsightClick?.('export'); }}>
          Export Audience Data
        </MenuItem>
        <MenuItem onClick={() => { setMenuAnchor(null); onInsightClick?.('detailed'); }}>
          View Detailed Analysis
        </MenuItem>
        <MenuItem onClick={() => { setMenuAnchor(null); onInsightClick?.('segment'); }}>
          Create Audience Segments
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default AudienceInsightsPanel;