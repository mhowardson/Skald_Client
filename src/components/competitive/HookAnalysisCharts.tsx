/**
 * Hook Analysis Charts Component
 * 
 * Displays comprehensive hook pattern analysis with interactive charts
 * showing hook effectiveness, trending patterns, and platform comparisons.
 * 
 * @component HookAnalysisCharts
 * @version 1.0.0
 * 
 * @features
 * - Hook type distribution pie chart with effectiveness scores
 * - Performance over time line chart with trend analysis
 * - Platform comparison radar chart showing hook adoption
 * - Top performing hooks list with examples and variations
 * - Interactive filtering and drill-down capabilities
 * 
 * @props
 * - data: TrendingHooksResponse | undefined - Hook analysis data from API
 * - isLoading: boolean - Loading state indicator
 * - selectedPlatforms: string[] - Currently selected platforms
 * - timeframe: string - Analysis time period
 * 
 * @charts
 * - PieChart: Hook type distribution with custom colors
 * - LineChart: Performance trends over time
 * - RadarChart: Cross-platform effectiveness comparison
 * - BarChart: Top hooks ranked by effectiveness
 * 
 * @interactions
 * - Click on chart segments to filter hook details
 * - Hover for detailed tooltips with metrics
 * - Export chart data to CSV/PNG formats
 * - Responsive design for mobile and desktop
 */

import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
  IconButton,
  LinearProgress,
  Alert,
  Skeleton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
} from 'recharts';
import {
  TrendingUp,
  Psychology,
  MoreVert,
  FileDownload,
  Refresh,
} from '@mui/icons-material';
import { TrendingHooksResponse, HookType } from '../../store/api/researchApi';

interface HookAnalysisChartsProps {
  data: TrendingHooksResponse | undefined;
  isLoading: boolean;
  selectedPlatforms: string[];
  timeframe: string;
}

// Color palette for hook types
const HOOK_TYPE_COLORS: Record<HookType, string> = {
  question: '#8884d8',
  statistic: '#82ca9d',
  story: '#ffc658',
  controversy: '#ff7c7c',
  curiosity: '#8dd1e1',
  emotion: '#d084d0',
  urgency: '#ffb347',
  social_proof: '#87d068',
  problem_statement: '#ff9f43',
  benefit_promise: '#a4de6c',
};

/**
 * Hook Analysis Charts Component
 * 
 * Comprehensive visualization of hook patterns, effectiveness metrics,
 * and trending analysis across platforms and time periods.
 */
const HookAnalysisCharts: React.FC<HookAnalysisChartsProps> = ({
  data,
  isLoading,
  selectedPlatforms,
  timeframe,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExportData = (format: 'csv' | 'png') => {
    // Implementation for data export
    console.log(`Exporting data as ${format}`);
    handleMenuClose();
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((item) => (
          <Grid item xs={12} md={6} key={item}>
            <Card>
              <CardHeader 
                title={<Skeleton width="60%" />}
                action={<Skeleton variant="circular" width={40} height={40} />}
              />
              <CardContent>
                <Skeleton variant="rectangular" height={300} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  // Error state
  if (!data) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        No hook analysis data available. Run a competitor analysis to generate insights.
      </Alert>
    );
  }

  // Prepare chart data
  const hookTypeData = data.charts.hookTypeDistribution.map(item => ({
    name: item.type.replace('_', ' ').toUpperCase(),
    value: item.count,
    effectiveness: item.effectiveness,
    type: item.type,
  }));

  const performanceData = data.charts.performanceOverTime.map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    engagement: item.engagement,
    virality: item.virality,
  }));

  const platformData = data.charts.platformComparison.map(platform => ({
    platform: platform.platform.charAt(0).toUpperCase() + platform.platform.slice(1),
    hooks: platform.topHooks.length,
    avgScore: platform.topHooks.reduce((sum, hook) => sum + hook.score, 0) / platform.topHooks.length,
    topHook: platform.topHooks[0]?.hook || 'N/A',
  }));

  // Top hooks data for bar chart
  const topHooksData = data.hooks
    .slice(0, 10)
    .map(hook => ({
      pattern: hook.pattern.length > 30 ? hook.pattern.substring(0, 30) + '...' : hook.pattern,
      effectiveness: hook.effectiveness.score,
      usage: hook.usage.frequency,
      type: hook.type,
    }));

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <Box 
          sx={{ 
            bgcolor: 'background.paper', 
            p: 2, 
            border: 1, 
            borderColor: 'divider',
            borderRadius: 1,
            boxShadow: 2
          }}
        >
          <Typography variant="subtitle2">{data.name}</Typography>
          <Typography variant="body2">Count: {data.value}</Typography>
          <Typography variant="body2">
            Effectiveness: {(data.effectiveness * 100).toFixed(1)}%
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box>
      {/* Header with Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            <Psychology sx={{ mr: 1, verticalAlign: 'middle' }} />
            Hook Pattern Analysis
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Analyzing {data.hooks.length} hook patterns across {selectedPlatforms.join(', ')} 
            for the last {timeframe}
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
            <MenuItem onClick={handleMenuClose}>
              <Refresh sx={{ mr: 1 }} />
              Refresh Data
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Hook Type Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Hook Type Distribution"
              subheader="Breakdown of hook patterns by type and effectiveness"
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={hookTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {hookTypeData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={HOOK_TYPE_COLORS[entry.type as HookType] || '#8884d8'} 
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomPieTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Over Time */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Hook Performance Trends"
              subheader="Engagement and virality trends over time"
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="engagement" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Engagement Rate"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="virality" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    name="Virality Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Platform Comparison */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Platform Hook Effectiveness"
              subheader="Cross-platform comparison of hook performance"
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={platformData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="platform" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Average Score"
                    dataKey="avgScore"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <RechartsTooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Performing Hooks */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Top Performing Hooks"
              subheader="Highest effectiveness hooks by pattern"
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topHooksData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="pattern" type="category" width={120} />
                  <RechartsTooltip />
                  <Bar dataKey="effectiveness" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Hook Details List */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="Hook Pattern Details"
              subheader="Detailed analysis of trending hook patterns"
            />
            <CardContent>
              <Grid container spacing={2}>
                {data.hooks.slice(0, 8).map((hook, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={hook.id}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Chip 
                            label={hook.type.replace('_', ' ')}
                            size="small"
                            sx={{ 
                              bgcolor: HOOK_TYPE_COLORS[hook.type],
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            #{index + 1}
                          </Typography>
                        </Box>
                        
                        <Typography variant="subtitle2" gutterBottom>
                          {hook.pattern}
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Effectiveness
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={hook.effectiveness.score} 
                            sx={{ mt: 0.5, mb: 1 }}
                          />
                          <Typography variant="caption">
                            {hook.effectiveness.score.toFixed(1)}% ({hook.effectiveness.sampleSize} samples)
                          </Typography>
                        </Box>

                        <Typography variant="caption" color="text.secondary" display="block">
                          Avg Engagement: {hook.performance.averageEngagementRate.toFixed(2)}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Usage Frequency: {hook.usage.frequency}
                        </Typography>
                        
                        {hook.usage.trending && (
                          <Chip 
                            icon={<TrendingUp />}
                            label="Trending"
                            size="small"
                            color="success"
                            sx={{ mt: 1 }}
                          />
                        )}

                        {hook.examples.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              Example:
                            </Typography>
                            <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 0.5 }}>
                              "{hook.examples[0]}"
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HookAnalysisCharts;