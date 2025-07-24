/**
 * Optimization Recommendations Component
 * 
 * Displays AI-powered content optimization recommendations with
 * implementation guides, priority levels, and expected impact metrics.
 * 
 * @component OptimizationRecommendationsComponent
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
  Button,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Stack,
  Divider,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Lightbulb as LightbulbIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Tag as TagIcon,
  Visibility as VisibilityIcon,
  TouchApp as TouchAppIcon,
  Group as GroupIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  MoreVert as MoreVertIcon,
  PlayArrow as PlayArrowIcon,
  BookmarkBorder as BookmarkIcon,
  Share as ShareIcon,
} from '@mui/icons-material';

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

interface OptimizationRecommendationsComponentProps {
  trends?: OptimizationTrends;
  loading: boolean;
}

// Mock recommendations data
const mockRecommendations = [
  {
    id: '1',
    type: 'cta',
    priority: 'critical',
    title: 'Strengthen Your Call-to-Action',
    description: 'Your current CTA is weak and doesn\'t create urgency. Adding action words and urgency can increase click-through rates significantly.',
    rationale: 'Analysis shows posts with strong CTAs perform 45% better in your industry.',
    expectedImpact: {
      metric: 'engagement',
      improvementRange: '20-35%',
      confidence: 85,
    },
    implementation: {
      difficulty: 'easy',
      timeRequired: '5 minutes',
      steps: [
        'Replace passive language with action verbs',
        'Add urgency indicators like "now" or "today"',
        'Use first-person language ("I want", "I need")',
        'Test with emojis to increase visibility',
      ],
      resources: ['CTA Writing Guide', 'Action Verb List'],
    },
    category: 'Content Structure',
    aiInsight: 'Posts ending with questions get 23% more comments than declarative statements.',
  },
  {
    id: '2',
    type: 'timing',
    priority: 'high',
    title: 'Optimize Posting Schedule',
    description: 'Your audience is most active between 7-9 PM, but you\'re posting at 2 PM when engagement is 40% lower.',
    rationale: 'Audience analytics show peak engagement windows that don\'t align with your current schedule.',
    expectedImpact: {
      metric: 'reach',
      improvementRange: '15-25%',
      confidence: 92,
    },
    implementation: {
      difficulty: 'easy',
      timeRequired: '2 minutes',
      steps: [
        'Schedule posts for 7-9 PM in your audience timezone',
        'Use scheduling tools to automate optimal timing',
        'Test weekend posting times (Saturday 10 AM performs well)',
        'Monitor engagement for 2 weeks to validate',
      ],
    },
    category: 'Timing Optimization',
    aiInsight: 'Your industry sees 30% higher engagement on weekday evenings vs afternoons.',
  },
  {
    id: '3',
    type: 'hashtags',
    priority: 'medium',
    title: 'Improve Hashtag Strategy',
    description: 'You\'re using only 5 hashtags when the optimal range is 8-12 for your platform. Missing niche-specific tags.',
    rationale: 'Hashtag analysis reveals opportunities for better discoverability.',
    expectedImpact: {
      metric: 'reach',
      improvementRange: '10-20%',
      confidence: 78,
    },
    implementation: {
      difficulty: 'medium',
      timeRequired: '15 minutes',
      steps: [
        'Research 5-10 niche hashtags in your industry',
        'Mix popular (#100k+ posts) and niche (#1k-10k posts) tags',
        'Create hashtag sets for different content types',
        'Track hashtag performance monthly',
      ],
      resources: ['Hashtag Research Tool', 'Industry Tag Database'],
    },
    category: 'Discoverability',
    aiInsight: 'Niche hashtags have 40% higher engagement rates than popular ones.',
  },
  {
    id: '4',
    type: 'content_structure',
    priority: 'medium',
    title: 'Add Hook in First Line',
    description: 'Your opening lines don\'t grab attention. Adding compelling hooks can significantly improve read-through rates.',
    rationale: 'First 3 words determine if users will read the full post.',
    expectedImpact: {
      metric: 'engagement',
      improvementRange: '12-18%',
      confidence: 80,
    },
    implementation: {
      difficulty: 'medium',
      timeRequired: '10 minutes',
      steps: [
        'Start with questions, numbers, or bold statements',
        'Use power words like "Secret", "Mistake", "Revealed"',
        'Create curiosity gaps that require reading to resolve',
        'Test different hook styles for your audience',
      ],
    },
    category: 'Content Structure',
    aiInsight: 'Posts starting with numbers get 36% more engagement than those without.',
  },
  {
    id: '5',
    type: 'visuals',
    priority: 'high',
    title: 'Enhance Visual Appeal',
    description: 'Your images lack contrast and text overlay. Visual improvements can dramatically increase stop-scroll rate.',
    rationale: 'Visual analysis shows your images score below average for attention-grabbing potential.',
    expectedImpact: {
      metric: 'engagement',
      improvementRange: '25-40%',
      confidence: 88,
    },
    implementation: {
      difficulty: 'hard',
      timeRequired: '30 minutes',
      steps: [
        'Increase contrast between background and text',
        'Use bold, readable fonts for text overlays',
        'Apply rule of thirds for better composition',
        'Add branded elements for consistency',
      ],
      resources: ['Design Templates', 'Brand Guidelines', 'Photo Editing Tools'],
    },
    category: 'Visual Content',
    aiInsight: 'High-contrast images get 67% more saves than low-contrast ones.',
  },
  {
    id: '6',
    type: 'audience_targeting',
    priority: 'low',
    title: 'Refine Audience Segments',
    description: 'Your content appeals to a broad audience but could be more targeted to your core demographic.',
    rationale: 'Demographic analysis shows untapped potential in specific age groups.',
    expectedImpact: {
      metric: 'conversions',
      improvementRange: '8-15%',
      confidence: 72,
    },
    implementation: {
      difficulty: 'hard',
      timeRequired: '1 hour',
      steps: [
        'Analyze top-performing posts by audience segment',
        'Create content pillars for different demographics',
        'Use demographic-specific language and references',
        'Test targeted content with small audience segments',
      ],
    },
    category: 'Audience Targeting',
    aiInsight: 'Age-specific content performs 28% better than generic messaging.',
  },
];

export const OptimizationRecommendationsComponent: React.FC<OptimizationRecommendationsComponentProps> = ({
  trends,
  loading,
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState<any>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, recommendation: any) => {
    setMenuAnchor(event.currentTarget);
    setSelectedRecommendation(recommendation);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedRecommendation(null);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <ErrorIcon color="error" />;
      case 'high':
        return <WarningIcon color="warning" />;
      case 'medium':
        return <InfoIcon color="info" />;
      default:
        return <CheckIcon color="success" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'success';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'success';
      case 'medium':
        return 'warning';
      case 'hard':
        return 'error';
      default:
        return 'default';
    }
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'cta':
        return <TouchAppIcon />;
      case 'timing':
        return <ScheduleIcon />;
      case 'hashtags':
        return <TagIcon />;
      case 'visuals':
        return <VisibilityIcon />;
      case 'audience_targeting':
        return <GroupIcon />;
      default:
        return <LightbulbIcon />;
    }
  };

  // Filter recommendations
  const filteredRecommendations = mockRecommendations.filter(rec => {
    const categoryMatch = filterCategory === 'all' || rec.category.toLowerCase().includes(filterCategory.toLowerCase());
    const priorityMatch = filterPriority === 'all' || rec.priority === filterPriority;
    return categoryMatch && priorityMatch;
  });

  // Group by priority
  const recommendationsByPriority = {
    critical: filteredRecommendations.filter(r => r.priority === 'critical'),
    high: filteredRecommendations.filter(r => r.priority === 'high'),
    medium: filteredRecommendations.filter(r => r.priority === 'medium'),
    low: filteredRecommendations.filter(r => r.priority === 'low'),
  };

  return (
    <Box>
      {/* Quick Stats */}
      {trends && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar sx={{ width: 50, height: 50, bgcolor: 'primary.main', mx: 'auto', mb: 1 }}>
                  <LightbulbIcon />
                </Avatar>
                <Typography variant="h6">
                  {trends.topRecommendations.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Top Categories
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar sx={{ width: 50, height: 50, bgcolor: 'success.main', mx: 'auto', mb: 1 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Typography variant="h6">
                  {trends.improvementMetrics.avgImprovement.toFixed(1)}%
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
                <Avatar sx={{ width: 50, height: 50, bgcolor: 'info.main', mx: 'auto', mb: 1 }}>
                  <CheckIcon />
                </Avatar>
                <Typography variant="h6">
                  {trends.topRecommendations[0]?.successRate.toFixed(0) || 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Success Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar sx={{ width: 50, height: 50, bgcolor: 'warning.main', mx: 'auto', mb: 1 }}>
                  <TouchAppIcon />
                </Avatar>
                <Typography variant="h6">
                  {trends.improvementMetrics.bestCategory || 'CTA'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Best Category
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filter Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography variant="subtitle2">Filter by:</Typography>
          <Stack direction="row" spacing={1}>
            <Chip
              label="All Priorities"
              color={filterPriority === 'all' ? 'primary' : 'default'}
              onClick={() => setFilterPriority('all')}
              clickable
            />
            <Chip
              label="Critical"
              color={filterPriority === 'critical' ? 'error' : 'default'}
              onClick={() => setFilterPriority('critical')}
              clickable
            />
            <Chip
              label="High"
              color={filterPriority === 'high' ? 'warning' : 'default'}
              onClick={() => setFilterPriority('high')}
              clickable
            />
            <Chip
              label="Medium"
              color={filterPriority === 'medium' ? 'info' : 'default'}
              onClick={() => setFilterPriority('medium')}
              clickable
            />
          </Stack>
        </Box>
      </Paper>

      {/* Critical Recommendations Alert */}
      {recommendationsByPriority.critical.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            🚨 Critical Issues Found
          </Typography>
          <Typography variant="body2">
            You have {recommendationsByPriority.critical.length} critical optimization issue{recommendationsByPriority.critical.length > 1 ? 's' : ''} that could significantly impact your performance. Address these first.
          </Typography>
        </Alert>
      )}

      {/* Recommendations by Priority */}
      {Object.entries(recommendationsByPriority).map(([priority, recs]) => {
        if (recs.length === 0) return null;

        return (
          <Card key={priority} sx={{ mb: 3 }}>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getPriorityIcon(priority)}
                  <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                    {priority} Priority ({recs.length})
                  </Typography>
                </Box>
              }
            />
            <CardContent>
              <Grid container spacing={2}>
                {recs.map((recommendation) => (
                  <Grid item xs={12} lg={6} key={recommendation.id}>
                    <Paper sx={{ p: 2, height: '100%', border: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <Avatar sx={{ bgcolor: `${getPriorityColor(recommendation.priority)}.light`, mr: 2 }}>
                          {getCategoryIcon(recommendation.type)}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="subtitle2" gutterBottom>
                              {recommendation.title}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, recommendation)}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </Box>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {recommendation.description}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Expected Impact
                          </Typography>
                          <Typography variant="caption" fontWeight="medium" color="success.main">
                            {recommendation.expectedImpact.improvementRange}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={recommendation.expectedImpact.confidence}
                          color="success"
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {recommendation.expectedImpact.confidence}% confidence
                        </Typography>
                      </Box>

                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="body2">Implementation Guide</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" gutterBottom>
                              Difficulty & Time
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                              <Chip
                                label={recommendation.implementation.difficulty}
                                color={getDifficultyColor(recommendation.implementation.difficulty) as any}
                                size="small"
                              />
                              <Chip
                                label={recommendation.implementation.timeRequired}
                                variant="outlined"
                                size="small"
                              />
                            </Stack>
                          </Box>

                          <Typography variant="caption" color="text.secondary" gutterBottom>
                            Steps to Implement:
                          </Typography>
                          <List dense>
                            {recommendation.implementation.steps.map((step, index) => (
                              <ListItem key={index}>
                                <ListItemIcon>
                                  <Avatar sx={{ width: 20, height: 20, fontSize: 12 }}>
                                    {index + 1}
                                  </Avatar>
                                </ListItemIcon>
                                <ListItemText
                                  primary={step}
                                  primaryTypographyProps={{ variant: 'body2' }}
                                />
                              </ListItem>
                            ))}
                          </List>

                          {recommendation.implementation.resources && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="caption" color="text.secondary" gutterBottom>
                                Resources:
                              </Typography>
                              <Stack direction="row" spacing={1} flexWrap="wrap">
                                {recommendation.implementation.resources.map((resource, index) => (
                                  <Chip
                                    key={index}
                                    label={resource}
                                    variant="outlined"
                                    size="small"
                                    clickable
                                  />
                                ))}
                              </Stack>
                            </Box>
                          )}
                        </AccordionDetails>
                      </Accordion>

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="primary.main">
                          💡 AI Insight: {recommendation.aiInsight}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <Button
                          size="small"
                          startIcon={<PlayArrowIcon />}
                          color="primary"
                        >
                          Apply
                        </Button>
                        <Button
                          size="small"
                          startIcon={<BookmarkIcon />}
                          variant="outlined"
                        >
                          Save
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        );
      })}

      {/* Empty State */}
      {filteredRecommendations.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.light', mx: 'auto', mb: 3 }}>
            <LightbulbIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h6" gutterBottom>
            No Recommendations Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your filters or optimize some content to get personalized recommendations
          </Typography>
        </Box>
      )}

      {/* Context Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={() => { /* Apply recommendation */ handleMenuClose(); }}>
          <PlayArrowIcon sx={{ mr: 1 }} />
          Apply Recommendation
        </MenuItem>
        <MenuItem onClick={() => { /* Save for later */ handleMenuClose(); }}>
          <BookmarkIcon sx={{ mr: 1 }} />
          Save for Later
        </MenuItem>
        <MenuItem onClick={() => { /* Share */ handleMenuClose(); }}>
          <ShareIcon sx={{ mr: 1 }} />
          Share with Team
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default OptimizationRecommendationsComponent;