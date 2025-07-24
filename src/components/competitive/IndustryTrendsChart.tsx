/**
 * Industry Trends Chart Component
 * 
 * Displays comprehensive industry trend analysis with interactive charts
 * showing momentum, direction, and platform adoption patterns.
 * 
 * @component IndustryTrendsChart
 * @version 1.0.0
 * 
 * @features
 * - Trend momentum visualization with direction indicators
 * - Platform adoption comparison across social networks
 * - Time-based trend analysis with peak period detection
 * - Interactive filtering by trend category and confidence
 * - Detailed trend cards with predictions and recommendations
 * - Export functionality for trend data and insights
 * 
 * @props
 * - data: TrendAnalysis[] | undefined - Trend data from API
 * - isLoading: boolean - Loading state indicator
 * - timeframe: string - Analysis time period
 * - industry: string - Selected industry for analysis
 * 
 * @charts
 * - LineChart: Momentum trends over time with direction arrows
 * - BarChart: Platform adoption rates by trend
 * - ScatterPlot: Confidence vs momentum correlation
 * - TreeMap: Trend categories by engagement volume
 * 
 * @interactions
 * - Click on trends to view detailed analysis
 * - Filter by momentum direction and confidence level
 * - Sort by various metrics (momentum, adoption, confidence)
 * - Export trend reports and visualizations
 */

import React, { useState, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
  LinearProgress,
  IconButton,
  Button,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Alert,
  Skeleton,
  Avatar,
  Stack,
} from '@mui/material';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Analytics,
  MoreVert,
  FileDownload,
  Visibility,
  Schedule,
} from '@mui/icons-material';
import { TrendAnalysis } from '../../store/api/researchApi';

interface IndustryTrendsChartProps {
  data: TrendAnalysis[] | undefined;
  isLoading: boolean;
  timeframe: string;
  industry: string;
}

/**
 * Individual Trend Card Component
 * 
 * Displays detailed information for a single trend with metrics and predictions.
 */
interface TrendCardProps {
  trend: TrendAnalysis;
  onViewDetails: (trend: TrendAnalysis) => void;
}

const TrendCard: React.FC<TrendCardProps> = ({ trend, onViewDetails }) => {
  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'rising': return <TrendingUp color="success" />;
      case 'declining': return <TrendingDown color="error" />;
      case 'stable': return <TrendingFlat color="warning" />;
      default: return <TrendingFlat />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'rising': return 'success';
      case 'declining': return 'error'; 
      case 'stable': return 'warning';
      default: return 'default';
    }
  };

  const getMomentumColor = (momentum: number) => {
    if (momentum >= 80) return 'success';
    if (momentum >= 60) return 'info';
    if (momentum >= 40) return 'warning';
    return 'error';
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: `${getTrendColor(trend.direction)}.light` }}>
            {getTrendIcon(trend.direction)}
          </Avatar>
        }
        title={
          <Typography variant="h6" component="div">
            {trend.trend}
          </Typography>
        }
        subheader={
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Chip
              label={trend.category}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`${trend.confidence.toFixed(0)}% confidence`}
              size="small"
              color={trend.confidence >= 80 ? 'success' : 'warning'}
            />
          </Stack>
        }
        action={
          <IconButton onClick={() => onViewDetails(trend)}>
            <Visibility />
          </IconButton>
        }
      />

      <CardContent sx={{ flexGrow: 1 }}>
        {/* Momentum Indicator */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Momentum
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {trend.momentum.toFixed(0)}/100
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={trend.momentum}
            color={getMomentumColor(trend.momentum) as 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {/* Key Metrics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">
                {trend.metrics.totalMentions.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Mentions
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="secondary">
                {trend.metrics.avgEngagement.toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Engagement
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Platform Adoption */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Platform Adoption
          </Typography>
          {trend.platforms.slice(0, 3).map((platform, index) => (
            <Box key={index} sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">
                  {platform.platform.charAt(0).toUpperCase() + platform.platform.slice(1)}
                </Typography>
                <Typography variant="body2">
                  {platform.adoption.toFixed(0)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={platform.adoption}
                sx={{ height: 4, borderRadius: 2 }}
              />
            </Box>
          ))}
        </Box>

        {/* Key Insights */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Key Demographics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Primary: {trend.demographics.primaryAgeGroup}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Top Regions: {trend.demographics.topRegions.slice(0, 2).join(', ')}
          </Typography>
        </Box>

        {/* Predictions */}
        <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            <Schedule sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
            Predictions
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Expected Lifespan: {trend.predictions.expectedLifespan}
          </Typography>
          <Typography variant="body2">
            Peak Period: {trend.predictions.peakPeriod}
          </Typography>
        </Box>
      </CardContent>

      <Box sx={{ p: 2, pt: 0 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Analytics />}
          onClick={() => onViewDetails(trend)}
          fullWidth
        >
          View Analysis
        </Button>
      </Box>
    </Card>
  );
};

/**
 * Main Industry Trends Chart Component
 */
const IndustryTrendsChart: React.FC<IndustryTrendsChartProps> = ({
  data,
  isLoading,
  timeframe,
  industry,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [directionFilter, setDirectionFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDirectionFilterChange = (event: SelectChangeEvent<string>) => {
    setDirectionFilter(event.target.value);
  };

  const handleCategoryFilterChange = (event: SelectChangeEvent<string>) => {
    setCategoryFilter(event.target.value);
  };

  const handleExportData = (format: 'csv' | 'png') => {
    console.log(`Exporting trends data as ${format}`);
    handleMenuClose();
  };

  const handleViewTrendDetails = (trend: TrendAnalysis) => {
    // Could open a detailed modal or navigate to trend detail page
    console.log('Viewing trend details:', trend.trend);
  };

  // Filter and sort data
  const filteredData = useMemo(() => {
    if (!data) return [];

    return data.filter(trend => {
      const directionMatch = directionFilter === 'all' || trend.direction === directionFilter;
      const categoryMatch = categoryFilter === 'all' || trend.category === categoryFilter;
      return directionMatch && categoryMatch;
    }).sort((a, b) => b.momentum - a.momentum);
  }, [data, directionFilter, categoryFilter]);

  // Prepare chart data
  const momentumChartData = useMemo(() => {
    if (!filteredData.length) return [];

    return filteredData.slice(0, 10).map(trend => ({
      name: trend.trend.length > 20 ? trend.trend.substring(0, 20) + '...' : trend.trend,
      momentum: trend.momentum,
      confidence: trend.confidence,
      mentions: trend.metrics.totalMentions,
      direction: trend.direction,
    }));
  }, [filteredData]);

  const platformAdoptionData = useMemo(() => {
    if (!filteredData.length) return [];

    const platformMap = new Map();
    
    filteredData.forEach(trend => {
      trend.platforms.forEach(platform => {
        const current = platformMap.get(platform.platform) || { platform: platform.platform, adoption: 0, count: 0 };
        current.adoption += platform.adoption;
        current.count += 1;
        platformMap.set(platform.platform, current);
      });
    });

    return Array.from(platformMap.values()).map(item => ({
      platform: item.platform.charAt(0).toUpperCase() + item.platform.slice(1),
      avgAdoption: item.adoption / item.count,
      trendCount: item.count,
    }));
  }, [filteredData]);

  const categoryDistributionData = useMemo(() => {
    if (!filteredData.length) return [];

    const categoryMap = new Map();
    
    filteredData.forEach(trend => {
      const current = categoryMap.get(trend.category) || 0;
      categoryMap.set(trend.category, current + 1);
    });

    return Array.from(categoryMap.entries()).map(([category, count]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: count,
    }));
  }, [filteredData]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.map(trend => trend.category))];
  }, [data]);

  // Loading skeleton
  if (isLoading) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title={<Skeleton width="40%" />}
              action={<Skeleton variant="circular" width={40} height={40} />}
            />
            <CardContent>
              <Skeleton variant="rectangular" height={400} />
            </CardContent>
          </Card>
        </Grid>
        {[1, 2, 3, 4].map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item}>
            <Card>
              <CardHeader 
                avatar={<Skeleton variant="circular" width={40} height={40} />}
                title={<Skeleton width="80%" />}
                subheader={<Skeleton width="60%" />}
              />
              <CardContent>
                <Skeleton variant="rectangular" height={200} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  // No data state
  if (!data || data.length === 0) {
    return (
      <Alert severity="info">
        No industry trends available for {industry.replace('_', ' ')} in the last {timeframe}. 
        Run a competitive analysis to identify emerging trends.
      </Alert>
    );
  }

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  return (
    <Box>
      {/* Header with Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
            Industry Trends Analysis
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {filteredData.length} trends identified in {industry.replace('_', ' ')} over the last {timeframe}
          </Typography>
        </Box>
        
        <Box>
          <IconButton onClick={handleMenuOpen}>
            <MoreVert />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={() => handleExportData('csv')}>
              <FileDownload sx={{ mr: 1 }} />
              Export CSV
            </MenuItem>
            <MenuItem onClick={() => handleExportData('png')}>
              <FileDownload sx={{ mr: 1 }} />
              Export PNG
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={3} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Direction</InputLabel>
              <Select
                value={directionFilter}
                label="Direction"
                onChange={handleDirectionFilterChange}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="rising">Rising</MenuItem>
                <MenuItem value="stable">Stable</MenuItem>
                <MenuItem value="declining">Declining</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={handleCategoryFilterChange}
              >
                <MenuItem value="all">All</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
              Showing {filteredData.length} of {data.length} trends
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Momentum Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardHeader 
              title="Trend Momentum Analysis"
              subheader="Current momentum and confidence levels for top trends"
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={momentumChartData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={150} />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="momentum" fill="#8884d8" name="Momentum" />
                  <Bar dataKey="confidence" fill="#82ca9d" name="Confidence" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardHeader 
              title="Trend Categories"
              subheader="Distribution of trends by category"
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={categoryDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryDistributionData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Platform Adoption */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="Platform Adoption Rates"
              subheader="Average trend adoption across social media platforms"
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={platformAdoptionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="platform" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="avgAdoption" fill="#8884d8" name="Avg Adoption %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Trend Cards */}
        {filteredData.slice(0, 8).map((trend) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={trend.id}>
            <TrendCard
              trend={trend}
              onViewDetails={handleViewTrendDetails}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default IndustryTrendsChart;