import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Stack,
  Grid,
  Chip,
  Avatar,
  Button,
  IconButton,
  LinearProgress,
  Divider,
  Switch,
  FormControlLabel,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  Alert,
  Tooltip,
  Badge,
  alpha,
  useTheme,
} from '@mui/material';
import {
  TrendingUp,
  Schedule,
  Analytics,
  AutoAwesome,
  Lightbulb,
  AccessTime,
  LocationOn,
  People,
  Refresh,
  Settings,
  Info,
  Warning,
  CheckCircle,
  Timer,
  Insights,
  Speed,
  Timeline,
  Language,
  Public,
} from '@mui/icons-material';
import { format, addHours, startOfDay, endOfDay, isWithinInterval, parseISO } from 'date-fns';

interface OptimalTime {
  time: string;
  dayOfWeek: number;
  engagementRate: number;
  confidenceScore: number;
  platformSpecific: Record<string, number>;
  audienceSize: number;
  competitionLevel: 'low' | 'medium' | 'high';
  factors: {
    historicalData: number;
    audienceActivity: number;
    industryBenchmarks: number;
    seasonalTrends: number;
    competitorAnalysis: number;
  };
}

interface PlatformTiming {
  platform: string;
  bestTimes: OptimalTime[];
  averageEngagement: number;
  peakDays: number[];
  timezone: string;
  audienceInsights: {
    primaryTimezone: string;
    ageGroups: { range: string; percentage: number }[];
    activeHours: { start: string; end: string };
    weekendActivity: number;
  };
}

interface TimingRecommendation {
  id: string;
  contentType: string;
  platforms: string[];
  recommendedTime: string;
  confidence: number;
  reasoning: string[];
  expectedEngagement: number;
  alternativeTimes: { time: string; score: number }[];
  factors: {
    audienceActivity: number;
    competitionLevel: number;
    contentRelevance: number;
    historicalPerformance: number;
  };
}

interface OptimalTimingEngineProps {
  platforms?: string[];
  contentType?: string;
  timezone?: string;
  onTimingSelect?: (timing: OptimalTime) => void;
  onRecommendationApply?: (recommendation: TimingRecommendation) => void;
}

const platformColors: Record<string, string> = {
  linkedin: '#0A66C2',
  twitter: '#1DA1F2', 
  instagram: '#E4405F',
  facebook: '#1877F2',
  youtube: '#FF0000',
  tiktok: '#000000',
};

const platformIcons: Record<string, string> = {
  linkedin: '💼',
  twitter: '🐦',
  instagram: '📷',
  facebook: '📘',
  youtube: '📺',
  tiktok: '🎵',
};

// Mock optimal timing data
const mockPlatformTiming: Record<string, PlatformTiming> = {
  linkedin: {
    platform: 'linkedin',
    bestTimes: [
      {
        time: '09:00',
        dayOfWeek: 2, // Tuesday
        engagementRate: 8.5,
        confidenceScore: 92,
        platformSpecific: { linkedin: 8.5 },
        audienceSize: 15000,
        competitionLevel: 'medium',
        factors: {
          historicalData: 90,
          audienceActivity: 85,
          industryBenchmarks: 88,
          seasonalTrends: 92,
          competitorAnalysis: 80,
        },
      },
      {
        time: '12:00',
        dayOfWeek: 3, // Wednesday
        engagementRate: 7.8,
        confidenceScore: 88,
        platformSpecific: { linkedin: 7.8 },
        audienceSize: 18000,
        competitionLevel: 'high',
        factors: {
          historicalData: 85,
          audienceActivity: 90,
          industryBenchmarks: 82,
          seasonalTrends: 88,
          competitorAnalysis: 75,
        },
      },
      {
        time: '17:00',
        dayOfWeek: 4, // Thursday
        engagementRate: 9.2,
        confidenceScore: 95,
        platformSpecific: { linkedin: 9.2 },
        audienceSize: 22000,
        competitionLevel: 'low',
        factors: {
          historicalData: 95,
          audienceActivity: 92,
          industryBenchmarks: 90,
          seasonalTrends: 96,
          competitorAnalysis: 88,
        },
      },
    ],
    averageEngagement: 6.2,
    peakDays: [1, 2, 3, 4], // Monday to Thursday
    timezone: 'UTC',
    audienceInsights: {
      primaryTimezone: 'EST',
      ageGroups: [
        { range: '25-34', percentage: 35 },
        { range: '35-44', percentage: 28 },
        { range: '45-54', percentage: 22 },
        { range: '18-24', percentage: 15 },
      ],
      activeHours: { start: '08:00', end: '19:00' },
      weekendActivity: 0.3,
    },
  },
  twitter: {
    platform: 'twitter',
    bestTimes: [
      {
        time: '08:00',
        dayOfWeek: 1, // Monday
        engagementRate: 6.8,
        confidenceScore: 85,
        platformSpecific: { twitter: 6.8 },
        audienceSize: 25000,
        competitionLevel: 'high',
        factors: {
          historicalData: 80,
          audienceActivity: 88,
          industryBenchmarks: 85,
          seasonalTrends: 90,
          competitorAnalysis: 78,
        },
      },
      {
        time: '19:00',
        dayOfWeek: 2, // Tuesday
        engagementRate: 7.5,
        confidenceScore: 90,
        platformSpecific: { twitter: 7.5 },
        audienceSize: 32000,
        competitionLevel: 'medium',
        factors: {
          historicalData: 88,
          audienceActivity: 95,
          industryBenchmarks: 87,
          seasonalTrends: 92,
          competitorAnalysis: 85,
        },
      },
    ],
    averageEngagement: 4.8,
    peakDays: [1, 2, 3, 5], // Monday, Tuesday, Wednesday, Friday
    timezone: 'UTC',
    audienceInsights: {
      primaryTimezone: 'PST',
      ageGroups: [
        { range: '18-24', percentage: 40 },
        { range: '25-34', percentage: 32 },
        { range: '35-44', percentage: 18 },
        { range: '45-54', percentage: 10 },
      ],
      activeHours: { start: '07:00', end: '23:00' },
      weekendActivity: 0.8,
    },
  },
  instagram: {
    platform: 'instagram',
    bestTimes: [
      {
        time: '11:00',
        dayOfWeek: 3, // Wednesday
        engagementRate: 5.2,
        confidenceScore: 88,
        platformSpecific: { instagram: 5.2 },
        audienceSize: 28000,
        competitionLevel: 'high',
        factors: {
          historicalData: 85,
          audienceActivity: 90,
          industryBenchmarks: 82,
          seasonalTrends: 88,
          competitorAnalysis: 80,
        },
      },
      {
        time: '20:00',
        dayOfWeek: 6, // Saturday
        engagementRate: 6.1,
        confidenceScore: 92,
        platformSpecific: { instagram: 6.1 },
        audienceSize: 35000,
        competitionLevel: 'medium',
        factors: {
          historicalData: 90,
          audienceActivity: 95,
          industryBenchmarks: 88,
          seasonalTrends: 94,
          competitorAnalysis: 88,
        },
      },
    ],
    averageEngagement: 3.9,
    peakDays: [3, 4, 5, 6], // Wednesday to Saturday
    timezone: 'UTC',
    audienceInsights: {
      primaryTimezone: 'EST',
      ageGroups: [
        { range: '18-24', percentage: 45 },
        { range: '25-34', percentage: 30 },
        { range: '35-44', percentage: 15 },
        { range: '13-17', percentage: 10 },
      ],
      activeHours: { start: '10:00', end: '22:00' },
      weekendActivity: 0.9,
    },
  },
};

// Mock timing recommendations
const mockRecommendations: TimingRecommendation[] = [
  {
    id: '1',
    contentType: 'professional',
    platforms: ['linkedin'],
    recommendedTime: '2024-01-25T17:00:00Z',
    confidence: 95,
    reasoning: [
      'Peak professional audience activity',
      'Low competition from similar content',
      'Historical high engagement at this time',
      'Matches your audience timezone preferences'
    ],
    expectedEngagement: 9.2,
    alternativeTimes: [
      { time: '2024-01-25T09:00:00Z', score: 8.5 },
      { time: '2024-01-25T12:00:00Z', score: 7.8 },
    ],
    factors: {
      audienceActivity: 92,
      competitionLevel: 88,
      contentRelevance: 90,
      historicalPerformance: 95,
    },
  },
  {
    id: '2',
    contentType: 'casual',
    platforms: ['instagram', 'twitter'],
    recommendedTime: '2024-01-27T20:00:00Z',
    confidence: 88,
    reasoning: [
      'Weekend evening peak engagement',
      'Cross-platform audience overlap',
      'Visual content performs best at this time',
      'Low business competition on weekends'
    ],
    expectedEngagement: 6.8,
    alternativeTimes: [
      { time: '2024-01-27T11:00:00Z', score: 5.2 },
      { time: '2024-01-27T19:00:00Z', score: 7.5 },
    ],
    factors: {
      audienceActivity: 90,
      competitionLevel: 75,
      contentRelevance: 85,
      historicalPerformance: 88,
    },
  },
];

export const OptimalTimingEngine: React.FC<OptimalTimingEngineProps> = ({
  platforms = ['linkedin', 'twitter', 'instagram'],
  contentType = 'professional',
  timezone = 'UTC',
  onTimingSelect,
  onRecommendationApply,
}) => {
  const theme = useTheme();
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(platforms);
  const [selectedContentType, setSelectedContentType] = useState(contentType);
  const [selectedTimezone, setSelectedTimezone] = useState(timezone);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'recommendations'>('overview');

  // Filter timing data based on selected platforms
  const filteredTimingData = useMemo(() => {
    return Object.entries(mockPlatformTiming)
      .filter(([platform]) => selectedPlatforms.includes(platform))
      .reduce((acc, [platform, data]) => {
        acc[platform] = data;
        return acc;
      }, {} as Record<string, PlatformTiming>);
  }, [selectedPlatforms]);

  // Generate cross-platform recommendations
  const crossPlatformRecommendations = useMemo(() => {
    return mockRecommendations.filter(rec => 
      rec.platforms.some(platform => selectedPlatforms.includes(platform)) &&
      rec.contentType === selectedContentType
    );
  }, [selectedPlatforms, selectedContentType]);

  // Auto-refresh timing data
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => setLoading(false), 1000);
      }, 300000); // Refresh every 5 minutes

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Render platform timing overview
  const renderOverview = () => (
    <Grid container spacing={3}>
      {Object.entries(filteredTimingData).map(([platform, data]) => (
        <Grid item xs={12} md={6} lg={4} key={platform}>
          <Card sx={{ height: '100%', borderRadius: 3, border: `1px solid ${alpha(platformColors[platform], 0.2)}` }}>
            <CardContent sx={{ p: 3 }}>
              {/* Platform Header */}
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha(platformColors[platform], 0.1),
                    color: platformColors[platform],
                    width: 48,
                    height: 48,
                  }}
                >
                  {platformIcons[platform]}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ textTransform: 'capitalize', fontWeight: 600 }}>
                    {platform}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg: {data.averageEngagement}% engagement
                  </Typography>
                </Box>
              </Stack>

              {/* Best Time */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Next Best Time
                </Typography>
                {data.bestTimes.length > 0 && (
                  <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.05), border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="h6" fontWeight={600} color="success.main">
                          {data.bestTimes[0].time}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date().setDate(new Date().getDate() + data.bestTimes[0].dayOfWeek), 'EEEE')}
                        </Typography>
                      </Box>
                      <Stack alignItems="center">
                        <Typography variant="h6" fontWeight={600} color="success.main">
                          {data.bestTimes[0].engagementRate}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          engagement
                        </Typography>
                      </Stack>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={data.bestTimes[0].confidenceScore}
                      sx={{ mt: 1, height: 4, borderRadius: 2 }}
                      color="success"
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {data.bestTimes[0].confidenceScore}% confidence
                    </Typography>
                  </Paper>
                )}
              </Box>

              {/* Audience Insights */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Audience Insights
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <LocationOn sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                      <Typography variant="body2" color="text.secondary">
                        Primary TZ
                      </Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight={500}>
                      {data.audienceInsights.primaryTimezone}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <AccessTime sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                      <Typography variant="body2" color="text.secondary">
                        Active Hours
                      </Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight={500}>
                      {data.audienceInsights.activeHours.start} - {data.audienceInsights.activeHours.end}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <People sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                      <Typography variant="body2" color="text.secondary">
                        Top Age Group
                      </Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight={500}>
                      {data.audienceInsights.ageGroups[0].range} ({data.audienceInsights.ageGroups[0].percentage}%)
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Action Buttons */}
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  onClick={() => data.bestTimes.length > 0 && onTimingSelect?.(data.bestTimes[0])}
                  sx={{ borderRadius: 2 }}
                >
                  Use This Time
                </Button>
                <IconButton
                  size="small"
                  onClick={() => setViewMode('detailed')}
                  sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.3)}`, borderRadius: 1 }}
                >
                  <Analytics fontSize="small" />
                </IconButton>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}

      {/* Cross-Platform Recommendations */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, borderRadius: 3, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)` }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoAwesome color="primary" />
                AI Timing Recommendations
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Optimized for {selectedContentType} content across {selectedPlatforms.length} platforms
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setViewMode('recommendations')}
              sx={{ borderRadius: 2 }}
            >
              View All
            </Button>
          </Stack>

          <Grid container spacing={2}>
            {crossPlatformRecommendations.slice(0, 2).map((rec) => (
              <Grid item xs={12} md={6} key={rec.id}>
                <Card sx={{ p: 2, borderRadius: 2, border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={0.5}>
                      {rec.platforms.map((platform) => (
                        <Chip
                          key={platform}
                          label={platformIcons[platform]}
                          size="small"
                          sx={{ 
                            bgcolor: alpha(platformColors[platform], 0.1),
                            border: `1px solid ${alpha(platformColors[platform], 0.3)}`,
                          }}
                        />
                      ))}
                    </Stack>
                    <Chip
                      label={`${rec.confidence}% confidence`}
                      size="small"
                      color={rec.confidence >= 90 ? 'success' : rec.confidence >= 70 ? 'warning' : 'error'}
                      variant="outlined"
                    />
                  </Stack>
                  
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    {format(parseISO(rec.recommendedTime), 'MMM d, HH:mm')}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Expected {rec.expectedEngagement}% engagement
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    {rec.reasoning[0]}
                  </Typography>
                  
                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    onClick={() => onRecommendationApply?.(rec)}
                    sx={{ borderRadius: 2 }}
                  >
                    Apply Recommendation
                  </Button>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );

  // Render detailed timing analysis
  const renderDetailed = () => (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={600}>
          Detailed Timing Analysis
        </Typography>
        <Button
          variant="outlined"
          onClick={() => setViewMode('overview')}
          sx={{ borderRadius: 2 }}
        >
          Back to Overview
        </Button>
      </Stack>

      {Object.entries(filteredTimingData).map(([platform, data]) => (
        <Paper key={platform} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, textTransform: 'capitalize' }}>
            {platform} Detailed Analysis
          </Typography>
          
          <Grid container spacing={3}>
            {data.bestTimes.map((timing, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ height: '100%', borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.2)}` }}>
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                      <Typography variant="h6" fontWeight={600}>
                        {timing.time}
                      </Typography>
                      <Chip
                        label={timing.competitionLevel}
                        size="small"
                        color={timing.competitionLevel === 'low' ? 'success' : timing.competitionLevel === 'medium' ? 'warning' : 'error'}
                        variant="outlined"
                      />
                    </Stack>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {format(new Date().setDate(new Date().getDate() + timing.dayOfWeek), 'EEEE')}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Engagement Rate
                      </Typography>
                      <Typography variant="h5" fontWeight={600} color="success.main">
                        {timing.engagementRate}%
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Audience Size
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {timing.audienceSize.toLocaleString()}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Performance Factors
                    </Typography>
                    
                    <Stack spacing={1}>
                      {Object.entries(timing.factors).map(([factor, score]) => (
                        <Box key={factor} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                            {factor.replace(/([A-Z])/g, ' $1').trim()}
                          </Typography>
                          <Typography variant="caption" fontWeight={600}>
                            {score}%
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      ))}
    </Box>
  );

  // Render recommendations view
  const renderRecommendations = () => (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={600}>
          AI Timing Recommendations
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1000);
            }}
            sx={{ borderRadius: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            onClick={() => setViewMode('overview')}
            sx={{ borderRadius: 2 }}
          >
            Back to Overview
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {crossPlatformRecommendations.map((rec) => (
          <Grid item xs={12} lg={6} key={rec.id}>
            <Card sx={{ height: '100%', borderRadius: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
              <CardContent sx={{ p: 3 }}>
                {/* Header */}
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Stack direction="row" spacing={0.5}>
                    {rec.platforms.map((platform) => (
                      <Chip
                        key={platform}
                        label={`${platformIcons[platform]} ${platform}`}
                        size="small"
                        sx={{ 
                          bgcolor: alpha(platformColors[platform], 0.1),
                          border: `1px solid ${alpha(platformColors[platform], 0.3)}`,
                        }}
                      />
                    ))}
                  </Stack>
                  <Badge
                    badgeContent={`${rec.confidence}%`}
                    color={rec.confidence >= 90 ? 'success' : rec.confidence >= 70 ? 'warning' : 'error'}
                    sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem', height: 20, minWidth: 20 } }}
                  >
                    <CheckCircle color={rec.confidence >= 90 ? 'success' : rec.confidence >= 70 ? 'warning' : 'error'} />
                  </Badge>
                </Stack>

                {/* Recommended Time */}
                <Box sx={{ mb: 3, textAlign: 'center', p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                  <Typography variant="h4" fontWeight={600} color="primary.main">
                    {format(parseISO(rec.recommendedTime), 'HH:mm')}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    {format(parseISO(rec.recommendedTime), 'EEEE, MMM d')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Expected {rec.expectedEngagement}% engagement
                  </Typography>
                </Box>

                {/* Reasoning */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Why This Time?
                  </Typography>
                  <Stack spacing={0.5}>
                    {rec.reasoning.map((reason, index) => (
                      <Typography key={index} variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle sx={{ fontSize: 16, color: theme.palette.success.main }} />
                        {reason}
                      </Typography>
                    ))}
                  </Stack>
                </Box>

                {/* Performance Factors */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                    Performance Factors
                  </Typography>
                  <Grid container spacing={1}>
                    {Object.entries(rec.factors).map(([factor, score]) => (
                      <Grid item xs={6} key={factor}>
                        <Box sx={{ textAlign: 'center', p: 1, borderRadius: 1, bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textTransform: 'capitalize' }}>
                            {factor.replace(/([A-Z])/g, ' $1').trim()}
                          </Typography>
                          <Typography variant="h6" fontWeight={600} color={score >= 90 ? 'success.main' : score >= 70 ? 'warning.main' : 'error.main'}>
                            {score}%
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                {/* Alternative Times */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Alternative Times
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {rec.alternativeTimes.map((alt, index) => (
                      <Chip
                        key={index}
                        label={`${format(parseISO(alt.time), 'HH:mm')} (${alt.score}%)`}
                        size="small"
                        variant="outlined"
                        clickable
                      />
                    ))}
                  </Stack>
                </Box>

                {/* Actions */}
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => onRecommendationApply?.(rec)}
                    sx={{ borderRadius: 2 }}
                  >
                    Apply Recommendation
                  </Button>
                  <IconButton
                    sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.3)}`, borderRadius: 1 }}
                  >
                    <Info fontSize="small" />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)` }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Timer color="primary" />
              Optimal Timing Engine
            </Typography>
            <Typography variant="body2" color="text.secondary">
              AI-powered scheduling recommendations based on audience behavior and platform analytics
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControlLabel
              control={
                <Switch
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  color="primary"
                />
              }
              label="Auto-refresh"
            />
            <IconButton>
              <Settings />
            </IconButton>
          </Stack>
        </Stack>

        {/* Controls */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Content Type</InputLabel>
              <Select
                value={selectedContentType}
                onChange={(e) => setSelectedContentType(e.target.value)}
                label="Content Type"
              >
                <MenuItem value="professional">Professional</MenuItem>
                <MenuItem value="casual">Casual</MenuItem>
                <MenuItem value="promotional">Promotional</MenuItem>
                <MenuItem value="educational">Educational</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Platforms</InputLabel>
              <Select
                multiple
                value={selectedPlatforms}
                onChange={(e) => setSelectedPlatforms(e.target.value as string[])}
                label="Platforms"
                renderValue={(selected) => `${selected.length} platforms`}
              >
                {Object.keys(platformIcons).map((platform) => (
                  <MenuItem key={platform} value={platform}>
                    {platformIcons[platform]} {platform}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Timezone</InputLabel>
              <Select
                value={selectedTimezone}
                onChange={(e) => setSelectedTimezone(e.target.value)}
                label="Timezone"
              >
                <MenuItem value="UTC">UTC</MenuItem>
                <MenuItem value="EST">EST</MenuItem>
                <MenuItem value="PST">PST</MenuItem>
                <MenuItem value="CST">CST</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Loading State */}
      {loading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress sx={{ borderRadius: 2 }} />
        </Box>
      )}

      {/* Content */}
      {viewMode === 'overview' && renderOverview()}
      {viewMode === 'detailed' && renderDetailed()}
      {viewMode === 'recommendations' && renderRecommendations()}

      {/* Global Insights */}
      <Paper sx={{ p: 3, mt: 3, borderRadius: 3, bgcolor: alpha(theme.palette.info.main, 0.05), border: `1px solid ${alpha(theme.palette.info.main, 0.2)}` }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Insights color="info" />
          <Typography variant="h6" fontWeight={600}>
            Global Timing Insights
          </Typography>
        </Stack>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={600} color="info.main">
                17:00
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Best Overall Time
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={600} color="info.main">
                Thu
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Peak Day
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={600} color="info.main">
                8.2%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Engagement
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={600} color="info.main">
                92%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Prediction Accuracy
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};