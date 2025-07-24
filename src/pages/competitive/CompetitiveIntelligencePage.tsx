/**
 * Competitive Intelligence Dashboard Page
 * 
 * Main dashboard interface for AI-powered competitive analysis, trend detection,
 * and content research insights. Provides comprehensive competitor analysis
 * with topic/problem/solution frameworks and hook pattern analysis.
 * 
 * @component CompetitiveIntelligencePage
 * @version 1.0.0
 * 
 * @features
 * - Competitor content analysis with performance metrics
 * - Topic/Problem/Solution framework visualization
 * - Hook pattern analysis with trending charts
 * - Industry trend detection and momentum tracking
 * - Content gap identification and opportunities
 * - Viral pattern recognition and optimization
 * - Performance prediction for content strategy
 * 
 * @dependencies
 * - Material-UI for responsive design components
 * - Recharts for data visualization and charts
 * - RTK Query for API data fetching
 * - React hooks for state management
 * 
 * @state
 * - selectedIndustry: string - Currently selected industry for analysis
 * - selectedPlatforms: string[] - Active social media platforms
 * - analysisTimeframe: string - Time period for data analysis
 * - activeTab: number - Current dashboard tab/section
 * 
 * @api_integration
 * - useAnalyzeCompetitorsMutation - Trigger competitor analysis
 * - useGetTrendingHooksQuery - Fetch hook patterns and chart data
 * - useGetTopicFrameworksQuery - Get topic/problem/solution data
 * - useGetCompetitorsQuery - Load competitor profiles
 * - useGetIndustryTrendsQuery - Fetch industry trends
 * - useGetContentGapsQuery - Identify content opportunities
 * 
 * @responsive
 * - Mobile: Stacked card layout with simplified charts
 * - Tablet: Two-column grid with condensed visualizations
 * - Desktop: Full dashboard with comprehensive charts and data
 * 
 * @accessibility
 * - ARIA labels for all interactive elements
 * - Keyboard navigation support for all components
 * - Screen reader compatible chart descriptions
 * - High contrast mode support
 */

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Backdrop,
  SelectChangeEvent,
} from '@mui/material';
import {
  TrendingUp,
  Psychology,
  Insights,
  CompareArrows,
  Analytics,
  Lightbulb,
} from '@mui/icons-material';
import {
  useAnalyzeCompetitorsMutation,
  useGetTrendingHooksQuery,
  useGetTopicFrameworksQuery,
  useGetCompetitorsQuery,
  useGetIndustryTrendsQuery,
  useGetContentGapsQuery,
  CompetitorAnalysisRequest,
} from '../../store/api/researchApi';
import { useTenant } from '../../contexts/TenantContext';
import HookAnalysisCharts from '../../components/competitive/HookAnalysisCharts';
import TopicFrameworksTable from '../../components/competitive/TopicFrameworksTable';
import CompetitorProfilesGrid from '../../components/competitive/CompetitorProfilesGrid';
import IndustryTrendsChart from '../../components/competitive/IndustryTrendsChart';
import ContentGapsAnalysis from '../../components/competitive/ContentGapsAnalysis';
import CompetitorAnalysisForm from '../../components/competitive/CompetitorAnalysisForm';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`competitive-tabpanel-${index}`}
      aria-labelledby={`competitive-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `competitive-tab-${index}`,
    'aria-controls': `competitive-tabpanel-${index}`,
  };
}

/**
 * Main Competitive Intelligence Dashboard Component
 * 
 * Provides comprehensive competitive analysis interface with multiple
 * analysis modules and real-time data visualization.
 */
export const CompetitiveIntelligencePage: React.FC = () => {
  // State Management
  const [activeTab, setActiveTab] = useState(0);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('health_wellness');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram', 'linkedin']);
  const [analysisTimeframe, setAnalysisTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Tenant Context
  const { currentOrganization } = useTenant();

  // API Hooks
  const [analyzeCompetitors, { 
    isLoading: isAnalysisLoading, 
    error: analysisError 
  }] = useAnalyzeCompetitorsMutation();

  const { 
    data: trendingHooks, 
    isLoading: isHooksLoading,
    error: hooksError,
    refetch: refetchHooks
  } = useGetTrendingHooksQuery({
    platforms: selectedPlatforms,
    timeframe: analysisTimeframe,
    industry: selectedIndustry,
    limit: 25,
    includeCharts: true
  });

  const { 
    data: topicFrameworks, 
    isLoading: isTopicsLoading,
    error: topicsError,
    refetch: refetchTopics
  } = useGetTopicFrameworksQuery({
    category: selectedIndustry.split('_')[0], // Extract main category
    industry: selectedIndustry,
    limit: 15,
    sortBy: 'popularity'
  });

  const { 
    data: competitors, 
    isLoading: isCompetitorsLoading,
    error: competitorsError,
    refetch: refetchCompetitors
  } = useGetCompetitorsQuery({
    industry: selectedIndustry,
    platforms: selectedPlatforms,
    limit: 12,
    sortBy: 'engagement',
    includeMetrics: true
  });

  const { 
    data: industryTrends, 
    isLoading: isTrendsLoading,
    error: trendsError,
    refetch: refetchTrends
  } = useGetIndustryTrendsQuery({
    industry: selectedIndustry,
    timeframe: analysisTimeframe,
    platforms: selectedPlatforms,
    limit: 20
  });

  const { 
    data: contentGaps, 
    isLoading: isGapsLoading,
    error: gapsError,
    refetch: refetchGaps
  } = useGetContentGapsQuery({
    industry: selectedIndustry,
    platforms: selectedPlatforms,
    timeframe: analysisTimeframe
  });

  // Event Handlers
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleIndustryChange = (event: SelectChangeEvent<string>) => {
    setSelectedIndustry(event.target.value);
  };

  const handlePlatformChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedPlatforms(typeof value === 'string' ? value.split(',') : value);
  };

  const handleTimeframeChange = (event: SelectChangeEvent<'7d' | '30d' | '90d'>) => {
    setAnalysisTimeframe(event.target.value as '7d' | '30d' | '90d');
  };

  const handleRunAnalysis = async (analysisConfig: CompetitorAnalysisRequest) => {
    if (!currentOrganization) {
      return;
    }

    setIsAnalyzing(true);
    try {
      await analyzeCompetitors({
        ...analysisConfig,
        industry: selectedIndustry,
        platforms: selectedPlatforms,
        timeframe: analysisTimeframe
      }).unwrap();
      
      // Refresh all data after analysis
      refetchHooks();
      refetchTopics();
      refetchCompetitors();
      refetchTrends();
      refetchGaps();
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Industry Options
  const industryOptions = [
    { value: 'health_wellness', label: 'Health & Wellness' },
    { value: 'technology', label: 'Technology' },
    { value: 'fashion', label: 'Fashion & Beauty' },
    { value: 'food_beverage', label: 'Food & Beverage' },
    { value: 'travel', label: 'Travel & Lifestyle' },
    { value: 'business', label: 'Business & Finance' },
    { value: 'education', label: 'Education' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'sports', label: 'Sports & Fitness' },
    { value: 'automotive', label: 'Automotive' },
  ];

  const platformOptions = [
    { value: 'instagram', label: 'Instagram' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'twitter', label: 'Twitter/X' },
  ];

  const hasError = hooksError || topicsError || competitorsError || 
                  trendsError || gapsError || analysisError;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Loading Backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isAnalyzing}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress color="inherit" size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Analyzing Competitors...
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
            This may take a few moments while we gather insights
          </Typography>
        </Box>
      </Backdrop>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          <Insights sx={{ mr: 2, verticalAlign: 'middle' }} />
          Competitive Intelligence
        </Typography>
        <Typography variant="h6" color="text.secondary">
          AI-powered competitor analysis, trend detection, and content strategy insights
        </Typography>
      </Box>

      {/* Configuration Controls */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Industry</InputLabel>
                <Select
                  value={selectedIndustry}
                  label="Industry"
                  onChange={handleIndustryChange}
                >
                  {industryOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Platforms</InputLabel>
                <Select
                  multiple
                  value={selectedPlatforms}
                  label="Platforms"
                  onChange={handlePlatformChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip 
                          key={value} 
                          label={platformOptions.find(p => p.value === value)?.label || value}
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                >
                  {platformOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Timeframe</InputLabel>
                <Select
                  value={analysisTimeframe}
                  label="Timeframe"
                  onChange={handleTimeframeChange}
                >
                  <MenuItem value="7d">Last 7 Days</MenuItem>
                  <MenuItem value="30d">Last 30 Days</MenuItem>
                  <MenuItem value="90d">Last 90 Days</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <CompetitorAnalysisForm
                selectedIndustry={selectedIndustry}
                selectedPlatforms={selectedPlatforms}
                onRunAnalysis={handleRunAnalysis}
                isLoading={isAnalyzing}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Display */}
      {hasError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          An error occurred while loading competitive intelligence data. Please try again.
        </Alert>
      )}

      {/* Main Dashboard Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="competitive intelligence tabs">
          <Tab 
            icon={<Psychology />} 
            label="Hook Analysis" 
            {...a11yProps(0)}
            sx={{ minHeight: 64 }}
          />
          <Tab 
            icon={<Lightbulb />} 
            label="Topic Frameworks" 
            {...a11yProps(1)}
            sx={{ minHeight: 64 }}
          />
          <Tab 
            icon={<CompareArrows />} 
            label="Competitors" 
            {...a11yProps(2)}
            sx={{ minHeight: 64 }}
          />
          <Tab 
            icon={<TrendingUp />} 
            label="Industry Trends" 
            {...a11yProps(3)}
            sx={{ minHeight: 64 }}
          />
          <Tab 
            icon={<Analytics />} 
            label="Content Gaps" 
            {...a11yProps(4)}
            sx={{ minHeight: 64 }}
          />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <HookAnalysisCharts 
          data={trendingHooks}
          isLoading={isHooksLoading}
          selectedPlatforms={selectedPlatforms}
          timeframe={analysisTimeframe}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <TopicFrameworksTable
          data={topicFrameworks}
          isLoading={isTopicsLoading}
          industry={selectedIndustry}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <CompetitorProfilesGrid
          data={competitors}
          isLoading={isCompetitorsLoading}
          platforms={selectedPlatforms}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <IndustryTrendsChart
          data={industryTrends}
          isLoading={isTrendsLoading}
          timeframe={analysisTimeframe}
          industry={selectedIndustry}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={4}>
        <ContentGapsAnalysis
          data={contentGaps}
          isLoading={isGapsLoading}
          industry={selectedIndustry}
          platforms={selectedPlatforms}
        />
      </TabPanel>
    </Container>
  );
};

export default CompetitiveIntelligencePage;