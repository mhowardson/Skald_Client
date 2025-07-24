import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  LinearProgress,
  Chip,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  Badge
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Visibility as ViewsIcon,
  Favorite as LikesIcon,
  Share as SharesIcon,
  Psychology as SentimentIcon,
  Whatshot as ViralIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  NotificationsActive as AlertIcon,
  Speed as SpeedIcon,
  Public as ReachIcon
} from '@mui/icons-material';

interface ContentMetrics {
  id: string;
  title: string;
  platform: string;
  publishedDate: string;
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagementRate: number;
    reachImpact: 'low' | 'medium' | 'high';
    viralPotential: number;
  };
  sentiment: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
    mentions: number;
  };
  trends: {
    views24h: number;
    engagement24h: number;
    velocity: 'increasing' | 'decreasing' | 'stable';
  };
}

interface ImpactAlert {
  id: string;
  type: 'viral' | 'negative_sentiment' | 'engagement_drop' | 'milestone';
  severity: 'low' | 'medium' | 'high';
  contentId: string;
  message: string;
  timestamp: string;
  actionRequired: boolean;
}

const mockContentMetrics: ContentMetrics[] = [
  {
    id: '1',
    title: 'Future-Proofing Your Child\'s Digital Skills',
    platform: 'youtube',
    publishedDate: '2024-01-15T10:00:00Z',
    metrics: {
      views: 25000,
      likes: 1250,
      comments: 320,
      shares: 450,
      engagementRate: 0.082,
      reachImpact: 'high',
      viralPotential: 85
    },
    sentiment: {
      score: 0.8,
      label: 'positive',
      mentions: 156
    },
    trends: {
      views24h: 5200,
      engagement24h: 0.15,
      velocity: 'increasing'
    }
  },
  {
    id: '2',
    title: 'Teaching Kids About AI Safety',
    platform: 'instagram',
    publishedDate: '2024-01-14T14:30:00Z',
    metrics: {
      views: 12500,
      likes: 890,
      comments: 145,
      shares: 234,
      engagementRate: 0.102,
      reachImpact: 'medium',
      viralPotential: 65
    },
    sentiment: {
      score: 0.6,
      label: 'positive',
      mentions: 89
    },
    trends: {
      views24h: 2100,
      engagement24h: 0.08,
      velocity: 'stable'
    }
  }
];

const mockImpactAlerts: ImpactAlert[] = [
  {
    id: '1',
    type: 'viral',
    severity: 'high',
    contentId: '1',
    message: 'Your YouTube video is trending! 25K views in 24 hours - 300% above average.',
    timestamp: '2024-01-16T09:30:00Z',
    actionRequired: false
  },
  {
    id: '2',
    type: 'milestone',
    severity: 'medium',
    contentId: '2',
    message: 'Instagram post reached 10K views milestone!',
    timestamp: '2024-01-15T16:45:00Z',
    actionRequired: false
  },
  {
    id: '3',
    type: 'negative_sentiment',
    severity: 'medium',
    contentId: '1',
    message: 'Slight increase in negative sentiment detected. Monitor comments for context.',
    timestamp: '2024-01-15T14:20:00Z',
    actionRequired: true
  }
];

const platformColors: Record<string, string> = {
  youtube: '#FF0000',
  instagram: '#E4405F',
  twitter: '#1DA1F2',
  linkedin: '#0077B5',
  tiktok: '#000000',
  facebook: '#1877F2'
};

const platformIcons: Record<string, string> = {
  youtube: '📺',
  instagram: '📷',
  twitter: '🐦',
  linkedin: '💼',
  tiktok: '🎵',
  facebook: '👥'
};

export const SocialMediaImpactDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  const getTrendIcon = (velocity: string) => {
    switch (velocity) {
      case 'increasing':
        return <TrendingUpIcon color="success" />;
      case 'decreasing':
        return <TrendingDownIcon color="error" />;
      default:
        return <SpeedIcon color="action" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'success';
      case 'negative':
        return 'error';
      default:
        return 'warning';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'viral':
        return <ViralIcon color="success" />;
      case 'negative_sentiment':
        return <WarningIcon color="warning" />;
      case 'engagement_drop':
        return <TrendingDownIcon color="error" />;
      case 'milestone':
        return <SuccessIcon color="primary" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const calculateTotalMetrics = () => {
    return mockContentMetrics.reduce((acc, content) => ({
      totalViews: acc.totalViews + content.metrics.views,
      totalLikes: acc.totalLikes + content.metrics.likes,
      totalComments: acc.totalComments + content.metrics.comments,
      totalShares: acc.totalShares + content.metrics.shares,
      avgEngagement: acc.avgEngagement + content.metrics.engagementRate
    }), { totalViews: 0, totalLikes: 0, totalComments: 0, totalShares: 0, avgEngagement: 0 });
  };

  const totals = calculateTotalMetrics();
  const avgEngagement = totals.avgEngagement / mockContentMetrics.length;

  return (
    <Box>
      {/* Header with Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Social Media Impact Monitor
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="1h">Last Hour</MenuItem>
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Platform</InputLabel>
            <Select
              value={selectedPlatform}
              label="Platform"
              onChange={(e) => setSelectedPlatform(e.target.value)}
            >
              <MenuItem value="all">All Platforms</MenuItem>
              <MenuItem value="youtube">YouTube</MenuItem>
              <MenuItem value="instagram">Instagram</MenuItem>
              <MenuItem value="twitter">Twitter</MenuItem>
              <MenuItem value="linkedin">LinkedIn</MenuItem>
            </Select>
          </FormControl>
          
          <Button variant="outlined" startIcon={<RefreshIcon />}>
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Key Metrics Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <ViewsIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {totals.totalViews.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Views
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TrendingUpIcon fontSize="small" color="success" />
                    <Typography variant="caption" color="success.main">
                      +12.5% vs last period
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <LikesIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {totals.totalLikes.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Engagement
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TrendingUpIcon fontSize="small" color="success" />
                    <Typography variant="caption" color="success.main">
                      +8.3% vs last period
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <SentimentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {(avgEngagement * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Engagement Rate
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TrendingDownIcon fontSize="small" color="error" />
                    <Typography variant="caption" color="error.main">
                      -2.1% vs last period
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <ReachIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {mockImpactAlerts.filter(a => a.type === 'viral').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Viral Content
                  </Typography>
                  <Typography variant="caption" color="info.main">
                    Active trending posts
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Real-time Alerts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Real-time Impact Alerts
                </Typography>
                <Badge badgeContent={mockImpactAlerts.filter(a => a.actionRequired).length} color="error">
                  <AlertIcon color="primary" />
                </Badge>
              </Box>
              
              <List dense>
                {mockImpactAlerts.map((alert) => (
                  <React.Fragment key={alert.id}>
                    <ListItem>
                      <ListItemIcon>
                        {getAlertIcon(alert.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={alert.message}
                        secondary={
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                            <Typography variant="caption">
                              {new Date(alert.timestamp).toLocaleTimeString()}
                            </Typography>
                            <Chip
                              label={alert.severity}
                              size="small"
                              color={alert.severity === 'high' ? 'error' : alert.severity === 'medium' ? 'warning' : 'default'}
                              sx={{ fontSize: '0.6rem', height: 16 }}
                            />
                            {alert.actionRequired && (
                              <Chip
                                label="Action Required"
                                size="small"
                                color="error"
                                variant="outlined"
                                sx={{ fontSize: '0.6rem', height: 16 }}
                              />
                            )}
                          </Box>
                        }
                      />
                      {alert.actionRequired && (
                        <ListItemSecondaryAction>
                          <Button size="small" variant="outlined" color="primary">
                            Review
                          </Button>
                        </ListItemSecondaryAction>
                      )}
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Content Performance Tracking */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Performing Content
              </Typography>
              
              <List dense>
                {mockContentMetrics
                  .sort((a, b) => b.metrics.viralPotential - a.metrics.viralPotential)
                  .map((content) => (
                    <React.Fragment key={content.id}>
                      <ListItem>
                        <ListItemIcon>
                          <Avatar
                            sx={{ 
                              bgcolor: platformColors[content.platform],
                              width: 32,
                              height: 32
                            }}
                          >
                            {platformIcons[content.platform]}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={content.title}
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                {content.metrics.views.toLocaleString()} views • 
                                {(content.metrics.engagementRate * 100).toFixed(1)}% engagement
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center' }}>
                                <Chip
                                  label={`${content.metrics.viralPotential}% viral potential`}
                                  size="small"
                                  color={content.metrics.viralPotential > 80 ? 'success' : 
                                         content.metrics.viralPotential > 60 ? 'warning' : 'default'}
                                  sx={{ fontSize: '0.6rem', height: 16 }}
                                />
                                <Chip
                                  label={content.sentiment.label}
                                  size="small"
                                  color={getSentimentColor(content.sentiment.label) as any}
                                  variant="outlined"
                                  sx={{ fontSize: '0.6rem', height: 16 }}
                                />
                                {getTrendIcon(content.trends.velocity)}
                              </Box>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Tooltip title="Viral Potential">
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h6" color="primary">
                                {content.metrics.viralPotential}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Viral Score
                              </Typography>
                            </Box>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Box sx={{ px: 2, pb: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={content.metrics.viralPotential}
                          sx={{ 
                            height: 4, 
                            borderRadius: 2,
                            bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: content.metrics.viralPotential > 80 ? 'success.main' :
                                       content.metrics.viralPotential > 60 ? 'warning.main' : 'primary.main'
                            }
                          }}
                        />
                      </Box>
                      <Divider />
                    </React.Fragment>
                  ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Sentiment Analysis */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sentiment Analysis
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Overall Sentiment Score
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={75}
                    sx={{ 
                      flexGrow: 1, 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'success.main'
                      }
                    }}
                  />
                  <Typography variant="h6" color="success.main">
                    75%
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                    <Typography variant="h4" fontWeight="bold">
                      67%
                    </Typography>
                    <Typography variant="caption">
                      Positive
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.300' }}>
                    <Typography variant="h4" fontWeight="bold">
                      25%
                    </Typography>
                    <Typography variant="caption">
                      Neutral
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light', color: 'error.contrastText' }}>
                    <Typography variant="h4" fontWeight="bold">
                      8%
                    </Typography>
                    <Typography variant="caption">
                      Negative
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Sentiment trending positive! Your content about digital parenting is resonating well with your audience.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Viral Detection Engine */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Viral Detection Engine
              </Typography>
              
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="bold">
                  🔥 Viral Content Detected!
                </Typography>
                <Typography variant="body2">
                  Your YouTube video is showing viral patterns with 300% above-average engagement velocity.
                </Typography>
              </Alert>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Viral Indicators
                </Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUpIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Engagement Velocity"
                      secondary="300% above baseline"
                    />
                    <Chip label="High" color="success" size="small" />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <SharesIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Share Rate"
                      secondary="1.8% (Above 1.5% threshold)"
                    />
                    <Chip label="Medium" color="warning" size="small" />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <SpeedIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Growth Rate"
                      secondary="45 views/minute"
                    />
                    <Chip label="High" color="success" size="small" />
                  </ListItem>
                </List>
              </Box>

              <Button variant="contained" fullWidth>
                Boost Viral Content
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};