/**
 * Optimization Trends Component
 * 
 * Displays optimization trends, analytics, and performance metrics
 * to help users understand their optimization progress over time.
 * 
 * @component OptimizationTrendsComponent
 * @version 1.0.0
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Chip,
  Avatar,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Stack,
  Skeleton,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Insights as InsightsIcon,
  Assessment as AssessmentIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  Star as StarIcon,
  AutoFixHigh as OptimizeIcon,
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
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

interface OptimizationTrends {
  trends: {
    period: string;
    improvements: number;
    topCategories: string[];
    successRate: number;
  }[];
  topRecommendations: {
    category: string;
    frequency: number;
    successRate: number;
    avgImprovement: number;
  }[];
  improvementMetrics: {
    totalOptimizations: number;
    avgImprovement: number;
    bestCategory: string;
    trendDirection: 'up' | 'down' | 'stable';
  };
}

interface OptimizationTrendsComponentProps {
  trends?: OptimizationTrends;
  loading: boolean;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

// Mock data for demonstration
const mockTrendsData = [
  { period: 'Week 1', improvements: 5, successRate: 75, avgImprovement: 12 },
  { period: 'Week 2', improvements: 8, successRate: 82, avgImprovement: 15 },
  { period: 'Week 3', improvements: 12, successRate: 88, avgImprovement: 18 },
  { period: 'Week 4', improvements: 15, successRate: 91, avgImprovement: 22 },
  { period: 'Week 5', improvements: 18, successRate: 85, avgImprovement: 25 },
  { period: 'Week 6', improvements: 22, successRate: 89, avgImprovement: 28 },
];

const mockCategoryData = [
  { category: 'Content Structure', improvements: 45, successRate: 89, avgImprovement: 28 },
  { category: 'Timing Optimization', improvements: 38, successRate: 92, avgImprovement: 22 },
  { category: 'Visual Content', improvements: 32, successRate: 85, avgImprovement: 35 },
  { category: 'Hashtag Strategy', improvements: 28, successRate: 78, avgImprovement: 18 },
  { category: 'Call-to-Action', improvements: 25, successRate: 95, avgImprovement: 42 },
  { category: 'Audience Targeting', improvements: 20, successRate: 82, avgImprovement: 25 },
];

const mockPieData = [
  { name: 'Content Structure', value: 35, color: '#8884d8' },
  { name: 'Timing', value: 25, color: '#82ca9d' },
  { name: 'Visual', value: 20, color: '#ffc658' },
  { name: 'Hashtags', value: 15, color: '#ff7300' },
  { name: 'Other', value: 5, color: '#0088fe' },
];

export const OptimizationTrendsComponent: React.FC<OptimizationTrendsComponentProps> = ({
  trends,
  loading,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('6weeks');

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return <TrendingUpIcon color="success" />;
      case 'down':
        return <TrendingDownIcon color="error" />;
      default:
        return <TrendingFlatIcon color="warning" />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up':
        return 'success.main';
      case 'down':
        return 'error.main';
      default:
        return 'warning.main';
    }
  };

  if (loading) {
    return (
      <Box>
        <Grid container spacing={3}>
          {Array.from(new Array(4)).map((_, index) => (
            <Grid item xs={12} md={6} lg={3} key={index}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 3 }}>
          <Skeleton variant="rectangular" height={400} />
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Key Metrics Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
                <OptimizeIcon sx={{ fontSize: 30 }} />
              </Avatar>
              <Typography variant="h4" gutterBottom>
                {trends?.improvementMetrics?.totalOptimizations || 142}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Optimizations
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                {getTrendIcon(trends?.improvementMetrics?.trendDirection || 'up')}
                <Typography variant="caption" sx={{ ml: 0.5 }}>
                  vs last period
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ width: 60, height: 60, bgcolor: 'success.main', mx: 'auto', mb: 2 }}>
                <TrendingUpIcon sx={{ fontSize: 30 }} />
              </Avatar>
              <Typography variant="h4" gutterBottom>
                {trends?.improvementMetrics?.avgImprovement?.toFixed(1) || '23.5'}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Improvement
              </Typography>
              <LinearProgress
                variant="determinate"
                value={trends?.improvementMetrics?.avgImprovement || 23.5}
                color="success"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ width: 60, height: 60, bgcolor: 'info.main', mx: 'auto', mb: 2 }}>
                <StarIcon sx={{ fontSize: 30 }} />
              </Avatar>
              <Typography variant="h4" gutterBottom>
                87%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Success Rate
              </Typography>
              <Typography variant="caption" color="success.main">
                +5% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ width: 60, height: 60, bgcolor: 'warning.main', mx: 'auto', mb: 2 }}>
                <AssessmentIcon sx={{ fontSize: 30 }} />
              </Avatar>
              <Typography variant="h4" gutterBottom>
                CTA
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Best Category
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {trends?.improvementMetrics?.bestCategory || 'Call-to-Action'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Trends Chart */}
      <Card sx={{ mb: 4 }}>
        <CardHeader
          title="Optimization Performance Trends"
          subheader="Success rate and improvement metrics over time"
          avatar={
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <TimelineIcon />
            </Avatar>
          }
        />
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={mockTrendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <RechartsTooltip />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="improvements"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
                name="Optimizations Applied"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="successRate"
                stroke="#82ca9d"
                strokeWidth={3}
                name="Success Rate (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Performance */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader
              title="Optimization Categories Performance"
              subheader="Success rates by optimization category"
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockCategoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="avgImprovement" fill="#8884d8" name="Avg Improvement %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader
              title="Optimization Distribution"
              subheader="By category"
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mockPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {mockPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Performing Categories Table */}
      <Card sx={{ mb: 4 }}>
        <CardHeader
          title="Category Performance Details"
          subheader="Detailed breakdown of optimization categories"
        />
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Optimizations</TableCell>
                  <TableCell align="right">Success Rate</TableCell>
                  <TableCell align="right">Avg Improvement</TableCell>
                  <TableCell align="right">Impact Score</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockCategoryData.map((category) => (
                  <TableRow key={category.category} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', mr: 1 }}>
                          <OptimizeIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Typography variant="body2" fontWeight="medium">
                          {category.category}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {category.improvements}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <LinearProgress
                          variant="determinate"
                          value={category.successRate}
                          color={category.successRate > 85 ? 'success' : category.successRate > 70 ? 'warning' : 'error'}
                          sx={{ width: 50, mr: 1 }}
                        />
                        <Typography variant="body2">
                          {category.successRate}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`+${category.avgImprovement}%`}
                        color={category.avgImprovement > 30 ? 'success' : category.avgImprovement > 20 ? 'warning' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <StarIcon sx={{ color: 'gold', mr: 0.5, fontSize: 16 }} />
                        <Typography variant="body2">
                          {((category.successRate * category.avgImprovement) / 100).toFixed(1)}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Insights and Recommendations */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          📊 Key Insights
        </Typography>
        <Stack spacing={1}>
          <Typography variant="body2">
            • Call-to-Action optimizations show the highest success rate (95%) and impact (+42% avg improvement)
          </Typography>
          <Typography variant="body2">
            • Visual content improvements have the highest potential impact but require more effort
          </Typography>
          <Typography variant="body2">
            • Timing optimizations are quick wins with consistent 22% improvement rates
          </Typography>
          <Typography variant="body2">
            • Your optimization trend is positive with 87% overall success rate
          </Typography>
        </Stack>
      </Alert>

      {/* AI Recommendations */}
      <Card>
        <CardHeader
          title="AI-Powered Optimization Insights"
          subheader="Personalized recommendations based on your data"
          avatar={
            <Avatar sx={{ bgcolor: 'success.main' }}>
              <InsightsIcon />
            </Avatar>
          }
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                <Typography variant="subtitle2" gutterBottom>
                  🎯 Focus Area
                </Typography>
                <Typography variant="body2">
                  Continue prioritizing CTA optimizations - they're your highest ROI category
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
                <Typography variant="subtitle2" gutterBottom>
                  📈 Growth Opportunity
                </Typography>
                <Typography variant="body2">
                  Visual content improvements have high potential - consider investing more time here
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                <Typography variant="subtitle2" gutterBottom>
                  ⚡ Quick Wins
                </Typography>
                <Typography variant="body2">
                  Timing optimizations are low-effort, high-impact improvements you can implement daily
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OptimizationTrendsComponent;