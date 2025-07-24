import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  alpha,
  useTheme,
  Avatar,
  Badge,
  Divider,
  Switch,
  FormControlLabel,
  Slider,
} from '@mui/material';
import {
  TrendingUp,
  Schedule,
  Tag,
  Analytics,
  AutoAwesome,
  Lightbulb,
  Speed,
  Psychology,
  Visibility,
  Share,
  ThumbUp,
  Comment,
  Repeat,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  ExpandMore,
  TuneIcon,
  Language,
  Accessibility,
  Timer,
  Group,
  LocationOn,
  Favorite,
  Star,
  TrendingFlat,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';

interface PlatformMetrics {
  platform: string;
  characterLimit: number;
  currentLength: number;
  optimizationScore: number;
  engagement: {
    predicted: number;
    historical: number;
    benchmark: number;
  };
  bestTimeToPost: string;
  hashtags: {
    suggested: string[];
    trending: string[];
    performance: Record<string, number>;
  };
  readabilityScore: number;
  sentimentScore: number;
  aiSuggestions: string[];
}

interface OptimizationSuggestion {
  id: string;
  type: 'critical' | 'warning' | 'improvement';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'easy' | 'moderate' | 'complex';
  category: 'length' | 'hashtags' | 'timing' | 'engagement' | 'accessibility';
  action?: () => void;
  applied?: boolean;
}

interface PlatformOptimizationProps {
  content: string;
  platforms: string[];
  onOptimizationApply?: (suggestion: OptimizationSuggestion) => void;
  onHashtagAdd?: (hashtag: string) => void;
  onContentOptimize?: (optimizedContent: string) => void;
  showAdvancedMetrics?: boolean;
}

const platformLimits: Record<string, number> = {
  twitter: 280,
  facebook: 63206,
  instagram: 2200,
  linkedin: 3000,
  tiktok: 2200,
  youtube: 5000,
};

const platformColors: Record<string, string> = {
  twitter: '#1DA1F2',
  facebook: '#1877F2',
  instagram: '#E4405F',
  linkedin: '#0A66C2',
  tiktok: '#000000',
  youtube: '#FF0000',
};

const platformIcons: Record<string, string> = {
  twitter: '🐦',
  facebook: '📘',
  instagram: '📷',
  linkedin: '💼',
  tiktok: '🎵',
  youtube: '📺',
};

// Mock data for demonstration
const getMockMetrics = (platform: string, content: string): PlatformMetrics => ({
  platform,
  characterLimit: platformLimits[platform] || 5000,
  currentLength: content.length,
  optimizationScore: Math.floor(Math.random() * 40) + 60, // 60-100
  engagement: {
    predicted: Math.floor(Math.random() * 5) + 3, // 3-8%
    historical: Math.floor(Math.random() * 3) + 4, // 4-7%
    benchmark: Math.floor(Math.random() * 2) + 5, // 5-7%
  },
  bestTimeToPost: ['9:00 AM', '1:00 PM', '5:00 PM', '8:00 PM'][Math.floor(Math.random() * 4)],
  hashtags: {
    suggested: ['#innovation', '#growth', '#success', '#leadership'],
    trending: ['#mondayMotivation', '#techNews', '#startup', '#AI'],
    performance: {
      '#innovation': 8.5,
      '#growth': 7.2,
      '#success': 6.8,
      '#leadership': 9.1,
    },
  },
  readabilityScore: Math.floor(Math.random() * 30) + 70, // 70-100
  sentimentScore: Math.random() * 0.4 + 0.6, // 0.6-1.0 (positive)
  aiSuggestions: [
    'Add a compelling hook in the first sentence',
    'Include a call-to-action at the end',
    'Consider adding relevant emojis',
    'Break up long paragraphs for better readability',
  ],
});

const generateSuggestions = (metrics: PlatformMetrics[]): OptimizationSuggestion[] => {
  const suggestions: OptimizationSuggestion[] = [];

  metrics.forEach((metric) => {
    const utilizationRate = metric.currentLength / metric.characterLimit;

    if (utilizationRate > 0.9) {
      suggestions.push({
        id: `length-${metric.platform}`,
        type: 'critical',
        title: `Content too long for ${metric.platform}`,
        description: `Your content exceeds the optimal length for ${metric.platform}. Consider shortening it.`,
        impact: 'high',
        effort: 'moderate',
        category: 'length',
      });
    }

    if (metric.readabilityScore < 75) {
      suggestions.push({
        id: `readability-${metric.platform}`,
        type: 'warning',
        title: 'Improve readability',
        description: 'Break up long sentences and use simpler language to improve engagement.',
        impact: 'medium',
        effort: 'easy',
        category: 'engagement',
      });
    }

    if (metric.optimizationScore < 80) {
      suggestions.push({
        id: `optimization-${metric.platform}`,
        type: 'improvement',
        title: `Optimize for ${metric.platform}`,
        description: 'Add platform-specific formatting and hashtags to increase visibility.',
        impact: 'medium',
        effort: 'easy',
        category: 'hashtags',
      });
    }
  });

  return suggestions;
};

export const PlatformOptimizationPanel: React.FC<PlatformOptimizationProps> = ({
  content,
  platforms,
  onOptimizationApply,
  onHashtagAdd,
  onContentOptimize,
  showAdvancedMetrics = true,
}) => {
  const theme = useTheme();
  const [metrics, setMetrics] = useState<PlatformMetrics[]>([]);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);
  const [autoOptimize, setAutoOptimize] = useState(false);
  const [optimizationLevel, setOptimizationLevel] = useState(70);

  useEffect(() => {
    const platformMetrics = platforms.map((platform) => getMockMetrics(platform, content));
    setMetrics(platformMetrics);
    setSuggestions(generateSuggestions(platformMetrics));
  }, [content, platforms]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getSuggestionIcon = (type: OptimizationSuggestion['type']) => {
    switch (type) {
      case 'critical':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <Warning color="warning" />;
      default:
        return <Lightbulb color="info" />;
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high':
        return <ArrowUpward color="success" fontSize="small" />;
      case 'medium':
        return <TrendingFlat color="warning" fontSize="small" />;
      default:
        return <ArrowDownward color="action" fontSize="small" />;
    }
  };

  const getOverallScore = () => {
    if (metrics.length === 0) return 0;
    return metrics.reduce((sum, metric) => sum + metric.optimizationScore, 0) / metrics.length;
  };

  const handleSuggestionApply = (suggestion: OptimizationSuggestion) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === suggestion.id ? { ...s, applied: true } : s))
    );
    onOptimizationApply?.(suggestion);
  };

  const overallScore = getOverallScore();

  return (
    <Box>
      {/* Overview Card */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(
            theme.palette.background.paper,
            0.9
          )} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Avatar
            sx={{
              bgcolor: getScoreColor(overallScore),
              width: 56,
              height: 56,
            }}
          >
            <Typography variant="h6" fontWeight={700} color="white">
              {Math.round(overallScore)}
            </Typography>
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
              Optimization Score
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Based on {platforms.length} platform{platforms.length !== 1 ? 's' : ''} analysis
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AutoAwesome />}
            onClick={() => onContentOptimize?.(content)}
            sx={{
              borderRadius: 3,
              px: 3,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}
          >
            AI Optimize
          </Button>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={overallScore}
          sx={{
            height: 8,
            borderRadius: 4,
            mb: 2,
            backgroundColor: alpha(theme.palette.divider, 0.1),
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              backgroundColor: getScoreColor(overallScore),
            },
          }}
        />

        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Stack alignItems="center">
              <Typography variant="h4" color="primary" fontWeight={700}>
                {content.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Characters
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Stack alignItems="center">
              <Typography variant="h4" color="secondary" fontWeight={700}>
                {suggestions.filter((s) => s.type === 'critical').length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Critical Issues
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Stack alignItems="center">
              <Typography variant="h4" color="warning.main" fontWeight={700}>
                {Math.round(metrics.reduce((sum, m) => sum + m.engagement.predicted, 0) / metrics.length || 0)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Predicted Engagement
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Stack alignItems="center">
              <Typography variant="h4" color="info.main" fontWeight={700}>
                {platforms.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Platforms
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Auto-optimization Settings */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <FormControlLabel
            control={
              <Switch checked={autoOptimize} onChange={(e) => setAutoOptimize(e.target.checked)} />
            }
            label="Auto-optimize as you type"
          />
          <Box sx={{ flexGrow: 1, mx: 3 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Optimization Level: {optimizationLevel}%
            </Typography>
            <Slider
              value={optimizationLevel}
              onChange={(_, value) => setOptimizationLevel(value as number)}
              min={50}
              max={100}
              size="small"
            />
          </Box>
          <Button startIcon={<TuneIcon />} variant="outlined" size="small" sx={{ borderRadius: 2 }}>
            Advanced
          </Button>
        </Stack>
      </Paper>

      {/* Platform-specific Analysis */}
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Analytics color="primary" />
        Platform Analysis
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {metrics.map((metric) => (
          <Grid item xs={12} sm={6} md={4} key={metric.platform}>
            <Card
              sx={{
                borderRadius: 3,
                border: `2px solid ${alpha(platformColors[metric.platform] || theme.palette.divider, 0.2)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                  borderColor: platformColors[metric.platform] || theme.palette.primary.main,
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <Typography variant="h5">
                    {platformIcons[metric.platform]}
                  </Typography>
                  <Typography variant="h6" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                    {metric.platform}
                  </Typography>
                  <Box sx={{ flexGrow: 1 }} />
                  <Chip
                    label={`${Math.round(metric.optimizationScore)}%`}
                    size="small"
                    sx={{
                      backgroundColor: getScoreColor(metric.optimizationScore),
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                </Stack>

                {/* Character Usage */}
                <Box sx={{ mb: 2 }}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography variant="body2">Character Usage</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {metric.currentLength}/{metric.characterLimit}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={(metric.currentLength / metric.characterLimit) * 100}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: alpha(theme.palette.divider, 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        backgroundColor:
                          metric.currentLength > metric.characterLimit
                            ? theme.palette.error.main
                            : theme.palette.success.main,
                      },
                    }}
                  />
                </Box>

                {/* Key Metrics */}
                <Grid container spacing={1} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Stack alignItems="center" spacing={0.5}>
                      <Typography variant="h6" color="primary">
                        {metric.engagement.predicted}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Engagement
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={6}>
                    <Stack alignItems="center" spacing={0.5}>
                      <Typography variant="h6" color="secondary">
                        {metric.readabilityScore}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Readability
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>

                {/* Best Time */}
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <Schedule fontSize="small" color="action" />
                  <Typography variant="body2">
                    Best time: {metric.bestTimeToPost}
                  </Typography>
                </Stack>

                {/* Top Hashtags */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Tag fontSize="small" />
                    Top Hashtags
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" spacing={0.5}>
                    {metric.hashtags.suggested.slice(0, 3).map((hashtag) => (
                      <Chip
                        key={hashtag}
                        label={hashtag}
                        size="small"
                        onClick={() => onHashtagAdd?.(hashtag)}
                        sx={{
                          fontSize: '0.7rem',
                          height: 20,
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: alpha(platformColors[metric.platform], 0.1),
                          },
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Optimization Suggestions */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Lightbulb color="warning" />
            <Typography variant="h6">
              Optimization Suggestions ({suggestions.filter((s) => !s.applied).length})
            </Typography>
            {suggestions.some((s) => s.type === 'critical') && (
              <Badge badgeContent={suggestions.filter((s) => s.type === 'critical').length} color="error">
                <Typography />
              </Badge>
            )}
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {suggestions
              .filter((s) => !s.applied)
              .map((suggestion) => (
                <ListItem
                  key={suggestion.id}
                  sx={{
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    borderRadius: 2,
                    mb: 1,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.action.hover, 0.5),
                    },
                  }}
                >
                  <ListItemIcon>
                    {getSuggestionIcon(suggestion.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {suggestion.title}
                        </Typography>
                        <Chip
                          label={suggestion.impact}
                          size="small"
                          icon={getImpactIcon(suggestion.impact)}
                          color={suggestion.impact === 'high' ? 'error' : suggestion.impact === 'medium' ? 'warning' : 'default'}
                          variant="outlined"
                        />
                        <Chip
                          label={suggestion.effort}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>
                    }
                    secondary={suggestion.description}
                  />
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleSuggestionApply(suggestion)}
                    sx={{ borderRadius: 2, ml: 2 }}
                  >
                    Apply
                  </Button>
                </ListItem>
              ))}
          </List>

          {suggestions.filter((s) => !s.applied).length === 0 && (
            <Alert
              severity="success"
              sx={{ borderRadius: 2 }}
              icon={<CheckCircle />}
            >
              <Typography variant="body2">
                Great! Your content is well-optimized. All suggestions have been applied.
              </Typography>
            </Alert>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Advanced Metrics */}
      {showAdvancedMetrics && (
        <Accordion sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Psychology color="info" />
              <Typography variant="h6">Advanced Metrics</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {metrics.map((metric) => (
                <Grid item xs={12} md={6} key={`advanced-${metric.platform}`}>
                  <Paper sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                      {platformIcons[metric.platform]} {metric.platform} Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Sentiment Score
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={metric.sentimentScore * 100}
                          sx={{ mt: 0.5, mb: 1 }}
                        />
                        <Typography variant="body2">
                          {(metric.sentimentScore * 100).toFixed(1)}% Positive
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Readability
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={metric.readabilityScore}
                          sx={{ mt: 0.5, mb: 1 }}
                        />
                        <Typography variant="body2">
                          {metric.readabilityScore}/100
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
};