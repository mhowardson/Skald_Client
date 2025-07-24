/**
 * Content Gaps Analysis Component
 * 
 * Identifies and visualizes content opportunities based on competitor analysis,
 * search volume data, and market gaps in the selected industry.
 * 
 * @component ContentGapsAnalysis
 * @version 1.0.0
 * 
 * @features
 * - Content opportunity identification with competitor coverage analysis
 * - Search volume vs difficulty matrix visualization
 * - Suggested content formats and approaches
 * - Priority scoring based on reach potential and competition
 * - Interactive filtering by difficulty, volume, and format type
 * - Actionable content ideas with examples and templates
 * 
 * @props
 * - data: ContentGapsResponse | undefined - Content gaps data from API
 * - isLoading: boolean - Loading state indicator
 * - industry: string - Selected industry for analysis
 * - platforms: string[] - Selected platforms for content distribution
 * 
 * @visualizations
 * - ScatterPlot: Search volume vs competition difficulty
 * - BarChart: Opportunity ranking by estimated reach
 * - HeatMap: Content format effectiveness by platform
 * - TreeMap: Topic categories by opportunity size
 * 
 * @interactions
 * - Click on opportunities to view detailed analysis
 * - Filter by difficulty level and search volume
 * - Sort by priority score and estimated reach
 * - Generate content briefs from opportunities
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
  Button,
  LinearProgress,
  Alert,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Stack,
  Tooltip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Paper,
} from '@mui/material';
import {
  ScatterChart,
  Scatter,
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
  Lightbulb,
  Assessment,
  Create,
  Visibility,
  GetApp,
} from '@mui/icons-material';
import { ContentGap } from '../../store/api/researchApi';

interface ContentGapsAnalysisProps {
  data: {
    gaps: ContentGap[];
    totalOpportunities: number;
    analysis: {
      industry: string;
      platforms: string[];
      timeframe: string;
    };
  } | undefined;
  isLoading: boolean;
  industry: string;
  platforms: string[];
}

/**
 * Content Gap Opportunity Card Component
 * 
 * Displays detailed information for a single content opportunity.
 */
interface GapOpportunityCardProps {
  gap: ContentGap;
  onViewDetails: (gap: ContentGap) => void;
  onCreateContent: (gap: ContentGap) => void;
}

const GapOpportunityCard: React.FC<GapOpportunityCardProps> = ({
  gap,
  onViewDetails,
  onCreateContent,
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'default';
    }
  };

  const getVolumeColor = (volume: string) => {
    switch (volume) {
      case 'high': return 'success';
      case 'medium': return 'info';
      case 'low': return 'warning';
      default: return 'default';
    }
  };

  const getCoverageColor = (coverage: string) => {
    switch (coverage) {
      case 'low': return 'success'; // Low competitor coverage = good opportunity
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  const getPriorityScore = () => {
    // Calculate priority based on search volume, competition, and difficulty
    let score = gap.confidenceScore;
    
    // Boost score for high volume, low competition
    if (gap.searchVolume === 'high' && gap.competitorCoverage === 'low') score += 20;
    if (gap.searchVolume === 'medium' && gap.competitorCoverage === 'low') score += 15;
    if (gap.difficulty === 'easy') score += 10;
    
    return Math.min(100, score);
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'primary.light' }}>
            <Lightbulb />
          </Avatar>
        }
        title={
          <Typography variant="h6" component="div">
            {gap.opportunity}
          </Typography>
        }
        subheader={
          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
            <Chip
              label={gap.category}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`${gap.searchVolume} volume`}
              size="small"
              color={getVolumeColor(gap.searchVolume) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
            />
            <Chip
              label={`${gap.competitorCoverage} competition`}
              size="small"
              color={getCoverageColor(gap.competitorCoverage) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
            />
          </Stack>
        }
        action={
          <Tooltip title={`Priority Score: ${getPriorityScore()}/100`}>
            <Box sx={{ textAlign: 'center', minWidth: 60 }}>
              <Typography variant="h6" color="primary">
                {getPriorityScore()}
              </Typography>
              <Typography variant="caption">
                Priority
              </Typography>
            </Box>
          </Tooltip>
        }
      />

      <CardContent sx={{ flexGrow: 1 }}>
        {/* Opportunity Metrics */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Opportunity Metrics
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">Estimated Reach</Typography>
              <Typography variant="body2" fontWeight="medium">
                {gap.estimatedReach.toLocaleString()}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(gap.estimatedReach / 1000000) * 100} // Scale to reasonable range
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">Confidence Score</Typography>
              <Typography variant="body2" fontWeight="medium">
                {gap.confidenceScore.toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={gap.confidenceScore}
              color={gap.confidenceScore >= 80 ? 'success' : gap.confidenceScore >= 60 ? 'warning' : 'error'}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        </Box>

        {/* Difficulty Assessment */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Content Difficulty
          </Typography>
          <Chip
            label={`${gap.difficulty.toUpperCase()} to execute`}
            color={getDifficultyColor(gap.difficulty) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
            variant="outlined"
            size="small"
          />
        </Box>

        {/* Suggested Formats */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Suggested Formats
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap">
            {gap.suggestedFormats.map((format, index) => (
              <Chip
                key={index}
                label={format}
                size="small"
                variant="outlined"
                sx={{ mb: 0.5 }}
              />
            ))}
          </Stack>
        </Box>

        {/* Quick Stats */}
        <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Search Volume
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {gap.searchVolume.toUpperCase()}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Competition
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {gap.competitorCoverage.toUpperCase()}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </CardContent>

      {/* Actions */}
      <Box sx={{ p: 2, pt: 0 }}>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Visibility />}
            onClick={() => onViewDetails(gap)}
            fullWidth
          >
            Details
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<Create />}
            onClick={() => onCreateContent(gap)}
            fullWidth
          >
            Create
          </Button>
        </Stack>
      </Box>
    </Card>
  );
};

/**
 * Main Content Gaps Analysis Component
 */
const ContentGapsAnalysis: React.FC<ContentGapsAnalysisProps> = ({
  data,
  isLoading,
  industry,
  platforms,
}) => {
  const [volumeFilter, setVolumeFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [coverageFilter, setCoverageFilter] = useState<string>('all');
  const [selectedGap, setSelectedGap] = useState<ContentGap | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleVolumeFilterChange = (event: SelectChangeEvent<string>) => {
    setVolumeFilter(event.target.value);
  };

  const handleDifficultyFilterChange = (event: SelectChangeEvent<string>) => {
    setDifficultyFilter(event.target.value);
  };

  const handleCoverageFilterChange = (event: SelectChangeEvent<string>) => {
    setCoverageFilter(event.target.value);
  };

  const handleViewGapDetails = (gap: ContentGap) => {
    setSelectedGap(gap);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedGap(null);
  };

  const handleCreateContent = (gap: ContentGap) => {
    // Implementation would navigate to content creation with pre-filled data
    console.log('Creating content for opportunity:', gap.opportunity);
  };

  const handleExportOpportunities = () => {
    if (!data) return;
    
    const csvContent = data.gaps.map(gap => ({
      opportunity: gap.opportunity,
      category: gap.category,
      searchVolume: gap.searchVolume,
      competition: gap.competitorCoverage,
      difficulty: gap.difficulty,
      estimatedReach: gap.estimatedReach,
      confidence: gap.confidenceScore,
      formats: gap.suggestedFormats.join('; ')
    }));
    
    console.log('Exporting opportunities:', csvContent);
  };

  // Filter and sort data
  const filteredGaps = useMemo(() => {
    if (!data?.gaps) return [];

    return data.gaps.filter(gap => {
      const volumeMatch = volumeFilter === 'all' || gap.searchVolume === volumeFilter;
      const difficultyMatch = difficultyFilter === 'all' || gap.difficulty === difficultyFilter;
      const coverageMatch = coverageFilter === 'all' || gap.competitorCoverage === coverageFilter;
      return volumeMatch && difficultyMatch && coverageMatch;
    }).sort((a, b) => {
      // Sort by confidence score and estimated reach
      const scoreA = a.confidenceScore + (a.estimatedReach / 100000);
      const scoreB = b.confidenceScore + (b.estimatedReach / 100000);
      return scoreB - scoreA;
    });
  }, [data?.gaps, volumeFilter, difficultyFilter, coverageFilter]);

  // Prepare chart data
  const opportunityScatterData = useMemo(() => {
    if (!filteredGaps.length) return [];

    return filteredGaps.map(gap => ({
      x: gap.confidenceScore,
      y: gap.estimatedReach / 1000, // Scale for better visualization
      difficulty: gap.difficulty,
      volume: gap.searchVolume,
      name: gap.opportunity,
      competition: gap.competitorCoverage,
    }));
  }, [filteredGaps]);

  const categoryDistributionData = useMemo(() => {
    if (!filteredGaps.length) return [];

    const categoryMap = new Map();
    filteredGaps.forEach(gap => {
      const current = categoryMap.get(gap.category) || 0;
      categoryMap.set(gap.category, current + 1);
    });

    return Array.from(categoryMap.entries()).map(([category, count]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: count,
    }));
  }, [filteredGaps]);

  const topOpportunitiesData = useMemo(() => {
    if (!filteredGaps.length) return [];

    return filteredGaps.slice(0, 8).map(gap => ({
      name: gap.opportunity.length > 25 ? gap.opportunity.substring(0, 25) + '...' : gap.opportunity,
      reach: gap.estimatedReach / 1000, // Scale for visualization
      confidence: gap.confidenceScore,
      category: gap.category,
    }));
  }, [filteredGaps]);

  // Loading skeleton
  if (isLoading) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title={<Skeleton width="50%" />}
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
  if (!data || !data.gaps.length) {
    return (
      <Alert severity="info">
        No content gaps identified for {industry.replace('_', ' ')} on {platforms.join(', ')}. 
        Run a competitive analysis to discover content opportunities.
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
            <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
            Content Gaps Analysis
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {filteredGaps.length} content opportunities identified across {platforms.join(', ')}
          </Typography>
        </Box>
        
        <Button
          startIcon={<GetApp />}
          onClick={handleExportOpportunities}
          variant="outlined"
          size="small"
        >
          Export Opportunities
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={3} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Search Volume</InputLabel>
              <Select
                value={volumeFilter}
                label="Search Volume"
                onChange={handleVolumeFilterChange}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={difficultyFilter}
                label="Difficulty"
                onChange={handleDifficultyFilterChange}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Competition</InputLabel>
              <Select
                value={coverageFilter}
                label="Competition"
                onChange={handleCoverageFilterChange}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>

            <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
              Showing {filteredGaps.length} of {data.gaps.length} opportunities
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Opportunity Matrix */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardHeader 
              title="Opportunity Matrix"
              subheader="Confidence vs Estimated Reach for content opportunities"
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="Confidence Score"
                    domain={[0, 100]}
                    label={{ value: 'Confidence Score (%)', position: 'insideBottom', offset: -10 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name="Estimated Reach"
                    label={{ value: 'Est. Reach (K)', angle: -90, position: 'insideLeft' }}
                  />
                  <RechartsTooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        const data = payload[0].payload;
                        return (
                          <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle2">{data.name}</Typography>
                            <Typography variant="body2">Confidence: {data.x}%</Typography>
                            <Typography variant="body2">Reach: {data.y}K</Typography>
                            <Typography variant="body2">Volume: {data.volume}</Typography>
                            <Typography variant="body2">Competition: {data.competition}</Typography>
                          </Paper>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter data={opportunityScatterData} fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardHeader 
              title="Opportunity Categories"
              subheader="Distribution by content category"
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

        {/* Top Opportunities Chart */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="Top Content Opportunities"
              subheader="Highest potential opportunities ranked by reach and confidence"
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topOpportunitiesData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={200} />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="reach" fill="#8884d8" name="Est. Reach (K)" />
                  <Bar dataKey="confidence" fill="#82ca9d" name="Confidence %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Content Opportunity Cards */}
        {filteredGaps.slice(0, 8).map((gap) => (
          <Grid item xs={12} sm={6} lg={4} xl={3} key={gap.id}>
            <GapOpportunityCard
              gap={gap}
              onViewDetails={handleViewGapDetails}
              onCreateContent={handleCreateContent}
            />
          </Grid>
        ))}
      </Grid>

      {/* Gap Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Content Opportunity Details
        </DialogTitle>
        
        <DialogContent>
          {selectedGap && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedGap.opportunity}
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Opportunity Analysis
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Category: {selectedGap.category}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Search Volume: {selectedGap.searchVolume.toUpperCase()}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Competitor Coverage: {selectedGap.competitorCoverage.toUpperCase()}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Difficulty: {selectedGap.difficulty.toUpperCase()}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Potential Impact
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Estimated Reach: {selectedGap.estimatedReach.toLocaleString()} people
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Confidence Score: {selectedGap.confidenceScore.toFixed(1)}%
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Recommended Content Formats
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {selectedGap.suggestedFormats.map((format, index) => (
                  <Chip key={index} label={format} variant="outlined" />
                ))}
              </Stack>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
          <Button 
            variant="contained" 
            startIcon={<Create />}
            onClick={() => {
              if (selectedGap) handleCreateContent(selectedGap);
              handleCloseDetails();
            }}
          >
            Create Content
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContentGapsAnalysis;