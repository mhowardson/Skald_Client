/**
 * Content Optimizer Component
 * 
 * Main content optimization interface allowing users to analyze and optimize
 * their content with AI-powered recommendations and performance predictions.
 * 
 * @component ContentOptimizerComponent
 * @version 1.0.0
 */

import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Skeleton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  AutoFixHigh as OptimizeIcon,
  Psychology as AIIcon,
  TrendingUp as TrendingUpIcon,
  Lightbulb as LightbulbIcon,
  Speed as SpeedIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Launch as LaunchIcon,
  ContentCopy as CopyIcon,
  Compare as CompareIcon,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
  OptimizationAnalysis,
  OptimizationRecommendation,
  ContentVariant,
  useOptimizeContentMutation,
} from '../../store/api/aiContentOptimizationApi';

interface ContentOptimizerComponentProps {
  onOptimize: () => void;
}

export const ContentOptimizerComponent: React.FC<ContentOptimizerComponentProps> = ({
  onOptimize,
}) => {
  const [content, setContent] = useState({
    title: '',
    body: '',
    platform: 'instagram',
    contentType: 'post' as const,
  });
  const [optimizationType, setOptimizationType] = useState('comprehensive' as const);
  const [generateVariants, setGenerateVariants] = useState(false);
  const [includeCompetitorAnalysis, setIncludeCompetitorAnalysis] = useState(false);

  const [optimizeContent, { data: optimizationResult, isLoading, error }] = useOptimizeContentMutation();

  const handleOptimize = async () => {
    if (!content.title && !content.body) return;

    try {
      await optimizeContent({
        content,
        optimizationType,
        generateVariants,
        includeCompetitorAnalysis,
      }).unwrap();
    } catch (error) {
      console.error('Optimization failed:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success.main';
    if (score >= 60) return 'warning.main';
    return 'error.main';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Needs Improvement';
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

  const handleCopyVariant = (variant: ContentVariant) => {
    navigator.clipboard.writeText(`${variant.title}\n\n${variant.body}`);
    // You might want to show a toast notification here
  };

  const isFormValid = content.title.trim() || content.body.trim();

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Content Input Section */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardHeader
              title="Content to Optimize"
              avatar={
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <OptimizeIcon />
                </Avatar>
              }
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Platform</InputLabel>
                    <Select
                      value={content.platform}
                      onChange={(e) => setContent(prev => ({ ...prev, platform: e.target.value }))}
                      label="Platform"
                    >
                      <MenuItem value="instagram">Instagram</MenuItem>
                      <MenuItem value="linkedin">LinkedIn</MenuItem>
                      <MenuItem value="tiktok">TikTok</MenuItem>
                      <MenuItem value="facebook">Facebook</MenuItem>
                      <MenuItem value="twitter">Twitter</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Content Type</InputLabel>
                    <Select
                      value={content.contentType}
                      onChange={(e) => setContent(prev => ({ ...prev, contentType: e.target.value as any }))}
                      label="Content Type"
                    >
                      <MenuItem value="post">Post</MenuItem>
                      <MenuItem value="story">Story</MenuItem>
                      <MenuItem value="reel">Reel/Video</MenuItem>
                      <MenuItem value="carousel">Carousel</MenuItem>
                      <MenuItem value="article">Article</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Title/Headline"
                    value={content.title}
                    onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
                    fullWidth
                    multiline
                    maxRows={3}
                    placeholder="Enter your content title or headline..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Content Body"
                    value={content.body}
                    onChange={(e) => setContent(prev => ({ ...prev, body: e.target.value }))}
                    fullWidth
                    multiline
                    rows={6}
                    placeholder="Enter your content body text..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Optimization Focus</InputLabel>
                    <Select
                      value={optimizationType}
                      onChange={(e) => setOptimizationType(e.target.value as any)}
                      label="Optimization Focus"
                    >
                      <MenuItem value="comprehensive">Comprehensive Analysis</MenuItem>
                      <MenuItem value="engagement">Engagement Optimization</MenuItem>
                      <MenuItem value="reach">Reach Optimization</MenuItem>
                      <MenuItem value="conversions">Conversion Optimization</MenuItem>
                      <MenuItem value="performance">Performance Optimization</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip
                      label="Generate Variants"
                      color={generateVariants ? 'primary' : 'default'}
                      onClick={() => setGenerateVariants(!generateVariants)}
                      clickable
                    />
                    <Chip
                      label="Competitor Analysis"
                      color={includeCompetitorAnalysis ? 'primary' : 'default'}
                      onClick={() => setIncludeCompetitorAnalysis(!includeCompetitorAnalysis)}
                      clickable
                    />
                  </Stack>
                </Grid>

                <Grid item xs={12}>
                  <LoadingButton
                    variant="contained"
                    startIcon={<AIIcon />}
                    onClick={handleOptimize}
                    loading={isLoading}
                    disabled={!isFormValid}
                    fullWidth
                    size="large"
                  >
                    Optimize with AI
                  </LoadingButton>
                </Grid>
              </Grid>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  Optimization failed. Please try again.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12} lg={6}>
          {isLoading ? (
            <Card>
              <CardContent>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <AIIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    AI is analyzing your content...
                  </Typography>
                  <LinearProgress sx={{ mt: 2 }} />
                </Box>
              </CardContent>
            </Card>
          ) : optimizationResult ? (
            <Card>
              <CardHeader
                title="Optimization Results"
                subheader="AI-powered analysis and recommendations"
                avatar={
                  <Avatar sx={{ bgcolor: getScoreColor(optimizationResult.analysis.contentScore) }}>
                    <SpeedIcon />
                  </Avatar>
                }
              />
              <CardContent>
                {/* Content Score */}
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ color: getScoreColor(optimizationResult.analysis.contentScore) }}>
                    {optimizationResult.analysis.contentScore}/100
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {getScoreLabel(optimizationResult.analysis.contentScore)}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={optimizationResult.analysis.contentScore}
                    sx={{ mt: 1, height: 8, borderRadius: 4 }}
                    color={optimizationResult.analysis.contentScore >= 80 ? 'success' : 
                           optimizationResult.analysis.contentScore >= 60 ? 'warning' : 'error'}
                  />
                </Box>

                {/* Performance Prediction */}
                <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    📊 Performance Prediction
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Engagement Rate
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {optimizationResult.analysis.performancePrediction.engagementRate.toFixed(1)}%
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Estimated Reach
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {optimizationResult.analysis.performancePrediction.reach.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Expected Clicks
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {optimizationResult.analysis.performancePrediction.clicks}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Confidence
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {optimizationResult.analysis.performancePrediction.confidence}%
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                {/* SWOT Analysis */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">📋 SWOT Analysis</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="success.main" fontWeight="bold">
                          ✅ STRENGTHS
                        </Typography>
                        <List dense>
                          {optimizationResult.analysis.strengths.map((strength, index) => (
                            <ListItem key={index}>
                              <ListItemText primary={strength} />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="error.main" fontWeight="bold">
                          ⚠️ WEAKNESSES
                        </Typography>
                        <List dense>
                          {optimizationResult.analysis.weaknesses.map((weakness, index) => (
                            <ListItem key={index}>
                              <ListItemText primary={weakness} />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="info.main" fontWeight="bold">
                          🚀 OPPORTUNITIES
                        </Typography>
                        <List dense>
                          {optimizationResult.analysis.opportunities.map((opportunity, index) => (
                            <ListItem key={index}>
                              <ListItemText primary={opportunity} />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="warning.main" fontWeight="bold">
                          ⚡ THREATS
                        </Typography>
                        <List dense>
                          {optimizationResult.analysis.threats.map((threat, index) => (
                            <ListItem key={index}>
                              <ListItemText primary={threat} />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <AIIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Ready to Optimize
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enter your content and click "Optimize with AI" to get started
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Recommendations Section */}
        {optimizationResult?.analysis.recommendations && (
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title="AI Recommendations"
                subheader={`${optimizationResult.analysis.recommendations.length} optimization suggestions`}
                avatar={
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <LightbulbIcon />
                  </Avatar>
                }
              />
              <CardContent>
                <Grid container spacing={2}>
                  {optimizationResult.analysis.recommendations.slice(0, 6).map((rec, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Paper sx={{ p: 2, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                          {getPriorityIcon(rec.priority)}
                          <Box sx={{ ml: 1, flexGrow: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              {rec.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                              {rec.description}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                          <Chip
                            label={rec.implementation.difficulty}
                            color={getDifficultyColor(rec.implementation.difficulty) as any}
                            size="small"
                          />
                          <Typography variant="caption" color="text.secondary">
                            {rec.implementation.timeRequired}
                          </Typography>
                        </Box>
                        
                        <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1 }}>
                          Expected: {rec.expectedImpact.improvementRange} improvement
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Content Variants Section */}
        {optimizationResult?.analysis.variants && optimizationResult.analysis.variants.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title="Optimized Variants"
                subheader="AI-generated content variations for A/B testing"
                avatar={
                  <Avatar sx={{ bgcolor: 'info.main' }}>
                    <CompareIcon />
                  </Avatar>
                }
              />
              <CardContent>
                <Grid container spacing={3}>
                  {optimizationResult.analysis.variants.map((variant, index) => (
                    <Grid item xs={12} md={4} key={variant.id}>
                      <Paper sx={{ p: 2, height: '100%', border: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            Variant {index + 1}
                          </Typography>
                          <Chip
                            label={variant.optimizationType}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>

                        <Typography variant="body2" fontWeight="medium" gutterBottom>
                          {variant.title}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" paragraph sx={{ 
                          maxHeight: 120, 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {variant.body}
                        </Typography>

                        <Box sx={{ mt: 2, mb: 2 }}>
                          <Typography variant="caption" color="text.secondary" gutterBottom>
                            Expected Performance:
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                            <Typography variant="caption">
                              Engagement: {variant.expectedPerformance.engagementRate.toFixed(1)}%
                            </Typography>
                            <Typography variant="caption">
                              Confidence: {variant.expectedPerformance.confidence.toFixed(0)}%
                            </Typography>
                          </Box>
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            startIcon={<CopyIcon />}
                            onClick={() => handleCopyVariant(variant)}
                          >
                            Copy
                          </Button>
                          <Button
                            size="small"
                            startIcon={<LaunchIcon />}
                            onClick={() => {/* Open in new content form */}}
                          >
                            Use
                          </Button>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ContentOptimizerComponent;