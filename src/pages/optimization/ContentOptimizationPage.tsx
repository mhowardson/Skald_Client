/**
 * Content Optimization Page Component
 * 
 * Main dashboard for AI-powered content optimization, showing performance insights,
 * optimization recommendations, A/B testing, and content scoring.
 * 
 * @component ContentOptimizationPage
 * @version 1.0.0
 * 
 * @features
 * - Content optimization analysis and scoring
 * - AI-powered recommendations with implementation guides
 * - A/B testing experiment management
 * - Performance prediction and tracking
 * - Content variant generation
 * - Optimization trends and analytics
 */

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Avatar,
  LinearProgress,
  Tabs,
  Tab,
  Alert,
  Stack,
  Paper,
  Divider,
  Fab,
} from '@mui/material';
import {
  Psychology as AIIcon,
  TrendingUp as TrendingUpIcon,
  Science as ScienceIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon,
  Lightbulb as LightbulbIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  AutoFixHigh as OptimizeIcon,
  Speed as SpeedIcon,
  CompareArrows as CompareIcon,
  Insights as InsightsIcon,
} from '@mui/icons-material';
import { ContentOptimizerComponent } from '../../components/optimization/ContentOptimizerComponent';
import { OptimizationRecommendationsComponent } from '../../components/optimization/OptimizationRecommendationsComponent';
import { ABTestingComponent } from '../../components/optimization/ABTestingComponent';
import { OptimizationTrendsComponent } from '../../components/optimization/OptimizationTrendsComponent';
import { ContentOptimizationDialog } from '../../components/optimization/ContentOptimizationDialog';
import { CreateABTestDialog } from '../../components/optimization/CreateABTestDialog';
import {
  useGetOptimizationTrendsQuery,
  useGetABTestsQuery,
} from '../../store/api/aiContentOptimizationApi';

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
      id={`optimization-tabpanel-${index}`}
      aria-labelledby={`optimization-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

export const ContentOptimizationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [optimizationDialogOpen, setOptimizationDialogOpen] = useState(false);
  const [abTestDialogOpen, setABTestDialogOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  // API Queries
  const { data: trendsData, isLoading: trendsLoading, refetch: refetchTrends } = useGetOptimizationTrendsQuery({
    timeframe: '30d',
  });

  const { data: abTestsData, isLoading: abTestsLoading, refetch: refetchABTests } = useGetABTestsQuery({
    page: 1,
    limit: 10,
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleRefreshAll = () => {
    refetchTrends();
    refetchABTests();
    handleMenuClose();
  };

  // Quick stats for the overview
  const quickStats = React.useMemo(() => {
    const trends = trendsData?.trends;
    const experiments = abTestsData?.experiments || [];
    
    return {
      totalOptimizations: trends?.improvementMetrics?.totalOptimizations || 0,
      avgImprovement: trends?.improvementMetrics?.avgImprovement || 0,
      activeExperiments: experiments.filter(exp => exp.status === 'running').length,
      completedExperiments: experiments.filter(exp => exp.status === 'completed').length,
    };
  }, [trendsData, abTestsData]);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            AI Content Optimization
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefreshAll}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<ScienceIcon />}
              onClick={() => setABTestDialogOpen(true)}
            >
              Create A/B Test
            </Button>
            <Button
              variant="contained"
              startIcon={<OptimizeIcon />}
              onClick={() => setOptimizationDialogOpen(true)}
            >
              Optimize Content
            </Button>
            <IconButton onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Box>

        <Typography variant="body1" color="text.secondary">
          Leverage AI to optimize your content performance, run A/B tests, and improve engagement
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
                <OptimizeIcon sx={{ fontSize: 30 }} />
              </Avatar>
              <Typography variant="h4" gutterBottom>
                {quickStats.totalOptimizations}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Content Optimizations
              </Typography>
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
                {quickStats.avgImprovement.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Improvement
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ width: 60, height: 60, bgcolor: 'info.main', mx: 'auto', mb: 2 }}>
                <ScienceIcon sx={{ fontSize: 30 }} />
              </Avatar>
              <Typography variant="h4" gutterBottom>
                {quickStats.activeExperiments}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active A/B Tests
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
                {quickStats.completedExperiments}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed Tests
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="optimization tabs">
            <Tab label="Content Optimizer" icon={<OptimizeIcon />} iconPosition="start" />
            <Tab label="Recommendations" icon={<LightbulbIcon />} iconPosition="start" />
            <Tab label="A/B Testing" icon={<ScienceIcon />} iconPosition="start" />
            <Tab label="Trends & Analytics" icon={<InsightsIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <ContentOptimizerComponent 
            onOptimize={() => setOptimizationDialogOpen(true)}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <OptimizationRecommendationsComponent 
            trends={trendsData?.trends}
            loading={trendsLoading}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <ABTestingComponent 
            experiments={abTestsData?.experiments || []}
            loading={abTestsLoading}
            onCreateTest={() => setABTestDialogOpen(true)}
            onRefresh={refetchABTests}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <OptimizationTrendsComponent 
            trends={trendsData?.trends}
            loading={trendsLoading}
          />
        </TabPanel>
      </Card>

      {/* AI Insights Section */}
      {trendsData?.trends && (
        <Paper sx={{ mt: 4, p: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AIIcon sx={{ mr: 1, fontSize: 30 }} />
            <Typography variant="h6" fontWeight="bold">
              AI Optimization Insights
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>
                🎯 Top Optimization Category
              </Typography>
              <Typography variant="body2">
                {trendsData.trends.improvementMetrics.bestCategory || 'Content Structure'} shows the highest success rate
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>
                📈 Performance Trend
              </Typography>
              <Typography variant="body2">
                Content optimization is trending{' '}
                {trendsData.trends.improvementMetrics.trendDirection === 'up' ? '📈 upward' : 
                 trendsData.trends.improvementMetrics.trendDirection === 'down' ? '📉 downward' : '➡️ stable'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>
                💡 AI Recommendation
              </Typography>
              <Typography variant="body2">
                Focus on call-to-action optimization for maximum impact this week
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Context Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={() => { handleMenuClose(); setActiveTab(3); }}>
          <InsightsIcon sx={{ mr: 1 }} />
          View Analytics
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); /* Export data */ }}>
          <AssessmentIcon sx={{ mr: 1 }} />
          Export Optimization Data
        </MenuItem>
        <MenuItem onClick={handleRefreshAll}>
          <RefreshIcon sx={{ mr: 1 }} />
          Refresh All Data
        </MenuItem>
      </Menu>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="optimize"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setOptimizationDialogOpen(true)}
      >
        <OptimizeIcon />
      </Fab>

      {/* Dialogs */}
      <ContentOptimizationDialog
        open={optimizationDialogOpen}
        onClose={() => setOptimizationDialogOpen(false)}
      />

      <CreateABTestDialog
        open={abTestDialogOpen}
        onClose={() => setABTestDialogOpen(false)}
      />
    </Container>
  );
};

export default ContentOptimizationPage;