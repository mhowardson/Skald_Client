import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Stack,
  Grid,
  Button,
  IconButton,
  Chip,
  Switch,
  FormControlLabel,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  TextField,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  CircularProgress,
  Badge,
  Avatar,
  Tooltip,
  Divider,
  alpha,
  useTheme,
} from '@mui/material';
import {
  CloudUpload,
  CheckCircle,
  Error as ErrorIcon,
  Warning,
  Refresh,
  Settings,
  Link as LinkIcon,
  Public,
  Analytics,
  Speed,
  Timeline,
  Share,
  Visibility,
  ThumbUp,
  Comment,
  TrendingUp,
  PlayArrow,
  Pause,
  Stop,
  Schedule,
  SyncProblem,
  Sync,
  DataUsage,
  Security,
  ApiOutlined,
} from '@mui/icons-material';
import { format, formatDistanceToNow, isAfter } from 'date-fns';

interface PlatformConnection {
  platform: string;
  connected: boolean;
  accountName: string;
  accountId: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  lastSync?: Date;
  status: 'connected' | 'disconnected' | 'error' | 'expired' | 'refreshing';
  error?: string;
  permissions: string[];
  rateLimits: {
    remaining: number;
    resetTime: Date;
    maxRequests: number;
  };
  analytics: {
    totalPosts: number;
    successfulPosts: number;
    failedPosts: number;
    averageEngagement: number;
    lastPostAt?: Date;
  };
}

interface PublishingJob {
  id: string;
  contentId: string;
  title: string;
  content: string;
  platforms: {
    platform: string;
    status: 'pending' | 'publishing' | 'published' | 'failed' | 'cancelled';
    publishedAt?: Date;
    postId?: string;
    url?: string;
    error?: string;
    retryCount: number;
    platformData?: any;
  }[];
  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  totalAttempts: number;
  media?: { url: string; type: string; alt?: string }[];
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface PlatformPublisherProps {
  connections?: PlatformConnection[];
  publishingJobs?: PublishingJob[];
  onConnectionTest?: (platform: string) => Promise<boolean>;
  onConnectionRefresh?: (platform: string) => Promise<void>;
  onPublishContent?: (job: PublishingJob) => Promise<void>;
  onRetryJob?: (jobId: string, platform?: string) => Promise<void>;
  onCancelJob?: (jobId: string) => Promise<void>;
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

// Mock platform connections
const mockConnections: PlatformConnection[] = [
  {
    platform: 'linkedin',
    connected: true,
    accountName: 'John Marketing Pro',
    accountId: 'john-marketing-pro',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    lastSync: new Date(),
    status: 'connected',
    permissions: ['publish', 'read_profile', 'read_analytics'],
    rateLimits: {
      remaining: 45,
      resetTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      maxRequests: 50,
    },
    analytics: {
      totalPosts: 89,
      successfulPosts: 87,
      failedPosts: 2,
      averageEngagement: 9.2,
      lastPostAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
  },
  {
    platform: 'twitter',
    connected: true,
    accountName: '@johnmarketing',
    accountId: '1234567890',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    lastSync: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    status: 'connected',
    permissions: ['write', 'read'],
    rateLimits: {
      remaining: 280,
      resetTime: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      maxRequests: 300,
    },
    analytics: {
      totalPosts: 156,
      successfulPosts: 150,
      failedPosts: 6,
      averageEngagement: 6.8,
      lastPostAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    },
  },
  {
    platform: 'instagram',
    connected: true,
    accountName: 'johnmarketing',
    accountId: 'instagram_business_123',
    expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    lastSync: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    status: 'connected',
    permissions: ['publish', 'read_insights'],
    rateLimits: {
      remaining: 195,
      resetTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      maxRequests: 200,
    },
    analytics: {
      totalPosts: 78,
      successfulPosts: 76,
      failedPosts: 2,
      averageEngagement: 8.5,
      lastPostAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    },
  },
  {
    platform: 'facebook',
    connected: false,
    accountName: '',
    accountId: '',
    status: 'disconnected',
    permissions: [],
    rateLimits: {
      remaining: 0,
      resetTime: new Date(),
      maxRequests: 200,
    },
    analytics: {
      totalPosts: 0,
      successfulPosts: 0,
      failedPosts: 0,
      averageEngagement: 0,
    },
  },
  {
    platform: 'youtube',
    connected: true,
    accountName: 'John Marketing Channel',
    accountId: 'UC123456789',
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours (expiring soon)
    lastSync: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    status: 'expired',
    error: 'Access token expired. Please reconnect.',
    permissions: ['upload', 'read_channel'],
    rateLimits: {
      remaining: 45,
      resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      maxRequests: 50,
    },
    analytics: {
      totalPosts: 12,
      successfulPosts: 12,
      failedPosts: 0,
      averageEngagement: 15.2,
      lastPostAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
  },
  {
    platform: 'tiktok',
    connected: true,
    accountName: '@johnmarketing',
    accountId: 'tiktok_123456',
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    status: 'error',
    error: 'API rate limit exceeded. Service temporarily unavailable.',
    permissions: ['publish', 'read_user'],
    rateLimits: {
      remaining: 0,
      resetTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      maxRequests: 100,
    },
    analytics: {
      totalPosts: 34,
      successfulPosts: 30,
      failedPosts: 4,
      averageEngagement: 12.8,
      lastPostAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    },
  },
];

// Mock publishing jobs
const mockPublishingJobs: PublishingJob[] = [
  {
    id: '1',
    contentId: 'content_1',
    title: 'Weekly Marketing Tips',
    content: '🚀 5 proven strategies to boost your social media engagement...',
    platforms: [
      {
        platform: 'linkedin',
        status: 'published',
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        postId: 'urn:li:activity:123456789',
        url: 'https://linkedin.com/posts/activity-123456789',
        retryCount: 0,
      },
      {
        platform: 'twitter',
        status: 'published',
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        postId: '1234567890123456789',
        url: 'https://twitter.com/user/status/1234567890123456789',
        retryCount: 0,
      },
    ],
    scheduledAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    totalAttempts: 1,
    tags: ['marketing', 'tips', 'engagement'],
    priority: 'high',
  },
  {
    id: '2',
    contentId: 'content_2',
    title: 'Product Feature Announcement',
    content: '✨ Introducing our latest AI-powered analytics dashboard...',
    platforms: [
      {
        platform: 'linkedin',
        status: 'publishing',
        retryCount: 0,
      },
      {
        platform: 'instagram',
        status: 'pending',
        retryCount: 0,
      },
    ],
    scheduledAt: new Date(),
    startedAt: new Date(),
    totalAttempts: 1,
    tags: ['product', 'announcement', 'AI'],
    priority: 'medium',
  },
  {
    id: '3',
    contentId: 'content_3',
    title: 'Industry Report Release',
    content: '📊 Our latest research reveals key trends in social media marketing...',
    platforms: [
      {
        platform: 'linkedin',
        status: 'failed',
        error: 'Rate limit exceeded. Retrying in 15 minutes.',
        retryCount: 2,
      },
      {
        platform: 'twitter',
        status: 'failed',
        error: 'Invalid media format.',
        retryCount: 1,
      },
    ],
    scheduledAt: new Date(Date.now() - 60 * 60 * 1000),
    startedAt: new Date(Date.now() - 60 * 60 * 1000),
    totalAttempts: 3,
    tags: ['research', 'insights', 'trends'],
    priority: 'urgent',
  },
];

export const PlatformPublisher: React.FC<PlatformPublisherProps> = ({
  connections = mockConnections,
  publishingJobs = mockPublishingJobs,
  onConnectionTest,
  onConnectionRefresh,
  onPublishContent,
  onRetryJob,
  onCancelJob,
}) => {
  const theme = useTheme();
  const [selectedConnection, setSelectedConnection] = useState<PlatformConnection | null>(null);
  const [connectionDialogOpen, setConnectionDialogOpen] = useState(false);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [refreshingConnection, setRefreshingConnection] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'connections' | 'jobs' | 'analytics'>('connections');

  // Connection statistics
  const connectionStats = useMemo(() => {
    const connected = connections.filter(c => c.connected && c.status === 'connected').length;
    const total = connections.length;
    const issues = connections.filter(c => c.status === 'error' || c.status === 'expired').length;
    const totalPosts = connections.reduce((sum, c) => sum + c.analytics.totalPosts, 0);
    const successRate = totalPosts > 0 
      ? (connections.reduce((sum, c) => sum + c.analytics.successfulPosts, 0) / totalPosts) * 100 
      : 0;

    return { connected, total, issues, totalPosts, successRate };
  }, [connections]);

  // Job statistics
  const jobStats = useMemo(() => {
    const total = publishingJobs.length;
    const completed = publishingJobs.filter(job => 
      job.platforms.every(p => p.status === 'published' || p.status === 'failed' || p.status === 'cancelled')
    ).length;
    const inProgress = publishingJobs.filter(job =>
      job.platforms.some(p => p.status === 'publishing' || p.status === 'pending')
    ).length;
    const failed = publishingJobs.filter(job =>
      job.platforms.some(p => p.status === 'failed')
    ).length;

    return { total, completed, inProgress, failed };
  }, [publishingJobs]);

  // Handle connection testing
  const handleTestConnection = async (platform: string) => {
    setTestingConnection(platform);
    try {
      const success = await onConnectionTest?.(platform);
      if (success) {
        // Show success feedback
      }
    } catch (error) {
      console.error('Connection test failed:', error);
    } finally {
      setTestingConnection(null);
    }
  };

  // Handle connection refresh
  const handleRefreshConnection = async (platform: string) => {
    setRefreshingConnection(platform);
    try {
      await onConnectionRefresh?.(platform);
    } catch (error) {
      console.error('Connection refresh failed:', error);
    } finally {
      setRefreshingConnection(null);
    }
  };

  // Render connection card
  const renderConnectionCard = (connection: PlatformConnection) => {
    const isExpiringSoon = connection.expiresAt && 
      isAfter(new Date(Date.now() + 24 * 60 * 60 * 1000), connection.expiresAt);
    const rateLimitUsage = connection.rateLimits.maxRequests > 0 
      ? ((connection.rateLimits.maxRequests - connection.rateLimits.remaining) / connection.rateLimits.maxRequests) * 100 
      : 0;

    return (
      <Card 
        key={connection.platform} 
        sx={{ 
          height: '100%', 
          borderRadius: 3, 
          border: `2px solid ${alpha(platformColors[connection.platform], 0.2)}`,
          position: 'relative',
          overflow: 'visible',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Status Badge */}
          <Badge
            badgeContent={
              connection.status === 'connected' ? <CheckCircle sx={{ fontSize: 16, color: theme.palette.success.main }} /> :
              connection.status === 'error' ? <ErrorIcon sx={{ fontSize: 16, color: theme.palette.error.main }} /> :
              connection.status === 'expired' ? <Warning sx={{ fontSize: 16, color: theme.palette.warning.main }} /> :
              connection.status === 'refreshing' ? <CircularProgress size={16} /> :
              <SyncProblem sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
            }
            overlap="circular"
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            sx={{ position: 'absolute', top: 16, right: 16 }}
          >
            <Box />
          </Badge>

          {/* Platform Header */}
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <Avatar
              sx={{
                bgcolor: alpha(platformColors[connection.platform], 0.1),
                color: platformColors[connection.platform],
                width: 56,
                height: 56,
                fontSize: 24,
              }}
            >
              {platformIcons[connection.platform]}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ textTransform: 'capitalize', mb: 0.5 }}>
                {connection.platform}
              </Typography>
              {connection.connected ? (
                <Typography variant="body2" color="text.secondary">
                  {connection.accountName}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Not connected
                </Typography>
              )}
            </Box>
          </Stack>

          {/* Connection Status */}
          <Box sx={{ mb: 3 }}>
            <Chip
              label={connection.status}
              size="small"
              color={
                connection.status === 'connected' ? 'success' :
                connection.status === 'error' ? 'error' :
                connection.status === 'expired' ? 'warning' : 'default'
              }
              variant="outlined"
              sx={{ mb: 1, textTransform: 'capitalize' }}
            />
            {connection.error && (
              <Alert severity="error" sx={{ mt: 1, py: 0.5 }}>
                <Typography variant="caption">
                  {connection.error}
                </Typography>
              </Alert>
            )}
            {isExpiringSoon && connection.connected && (
              <Alert severity="warning" sx={{ mt: 1, py: 0.5 }}>
                <Typography variant="caption">
                  Access expires {formatDistanceToNow(connection.expiresAt!)} from now
                </Typography>
              </Alert>
            )}
          </Box>

          {/* Analytics */}
          {connection.connected && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Publishing Stats
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 1, borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                    <Typography variant="h6" fontWeight={600} color="primary.main">
                      {connection.analytics.totalPosts}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Posts
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 1, borderRadius: 1, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                    <Typography variant="h6" fontWeight={600} color="success.main">
                      {connection.analytics.totalPosts > 0 
                        ? ((connection.analytics.successfulPosts / connection.analytics.totalPosts) * 100).toFixed(1)
                        : 0}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Success Rate
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', p: 1, borderRadius: 1, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                    <Typography variant="h6" fontWeight={600} color="info.main">
                      {connection.analytics.averageEngagement}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Avg Engagement
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Rate Limits */}
          {connection.connected && connection.rateLimits.maxRequests > 0 && (
            <Box sx={{ mb: 3 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  API Rate Limits
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {connection.rateLimits.remaining}/{connection.rateLimits.maxRequests}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={100 - rateLimitUsage}
                sx={{ height: 6, borderRadius: 3 }}
                color={rateLimitUsage > 80 ? 'error' : rateLimitUsage > 60 ? 'warning' : 'success'}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Resets {formatDistanceToNow(connection.rateLimits.resetTime)} from now
              </Typography>
            </Box>
          )}

          {/* Actions */}
          <Stack spacing={1}>
            {connection.connected ? (
              <>
                <Button
                  variant="outlined"
                  startIcon={testingConnection === connection.platform ? <CircularProgress size={16} /> : <Sync />}
                  onClick={() => handleTestConnection(connection.platform)}
                  disabled={testingConnection === connection.platform}
                  fullWidth
                  sx={{ borderRadius: 2 }}
                >
                  Test Connection
                </Button>
                {(connection.status === 'expired' || connection.status === 'error') && (
                  <Button
                    variant="contained"
                    startIcon={refreshingConnection === connection.platform ? <CircularProgress size={16} /> : <Refresh />}
                    onClick={() => handleRefreshConnection(connection.platform)}
                    disabled={refreshingConnection === connection.platform}
                    fullWidth
                    sx={{ borderRadius: 2 }}
                  >
                    Refresh Token
                  </Button>
                )}
                <Button
                  variant="outlined"
                  startIcon={<Settings />}
                  onClick={() => {
                    setSelectedConnection(connection);
                    setConnectionDialogOpen(true);
                  }}
                  fullWidth
                  sx={{ borderRadius: 2 }}
                >
                  Settings
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                startIcon={<LinkIcon />}
                fullWidth
                sx={{
                  borderRadius: 2,
                  bgcolor: platformColors[connection.platform],
                  color: 'white',
                  '&:hover': {
                    bgcolor: alpha(platformColors[connection.platform], 0.8),
                  },
                }}
              >
                Connect {connection.platform}
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
    );
  };

  // Render publishing job
  const renderPublishingJob = (job: PublishingJob) => {
    const overallStatus = job.platforms.every(p => p.status === 'published') ? 'completed' :
                         job.platforms.some(p => p.status === 'publishing') ? 'publishing' :
                         job.platforms.some(p => p.status === 'failed') ? 'failed' :
                         'pending';

    return (
      <Card key={job.id} sx={{ mb: 2, borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.2)}` }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            {/* Job Info */}
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="h6" fontWeight={600}>
                    {job.title}
                  </Typography>
                  <Chip
                    label={job.priority}
                    size="small"
                    color={job.priority === 'urgent' ? 'error' : job.priority === 'high' ? 'warning' : job.priority === 'medium' ? 'info' : 'default'}
                    variant="outlined"
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ 
                  display: '-webkit-box', 
                  WebkitLineClamp: 2, 
                  WebkitBoxOrient: 'vertical', 
                  overflow: 'hidden' 
                }}>
                  {job.content}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Schedule sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                    <Typography variant="caption" color="text.secondary">
                      {format(job.scheduledAt, 'MMM d, HH:mm')}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Attempts: {job.totalAttempts}
                  </Typography>
                </Stack>
              </Stack>
            </Grid>

            {/* Platform Status */}
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Platform Status
                </Typography>
                {job.platforms.map((platform, index) => (
                  <Stack key={index} direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(platformColors[platform.platform], 0.1),
                          color: platformColors[platform.platform],
                          width: 24,
                          height: 24,
                          fontSize: 12,
                        }}
                      >
                        {platformIcons[platform.platform]}
                      </Avatar>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {platform.platform}
                      </Typography>
                    </Stack>
                    <Stack alignItems="flex-end">
                      <Chip
                        label={platform.status}
                        size="small"
                        color={
                          platform.status === 'published' ? 'success' :
                          platform.status === 'publishing' ? 'warning' :
                          platform.status === 'failed' ? 'error' : 'default'
                        }
                        variant="outlined"
                        icon={
                          platform.status === 'published' ? <CheckCircle sx={{ fontSize: 14 }} /> :
                          platform.status === 'publishing' ? <CircularProgress size={14} /> :
                          platform.status === 'failed' ? <ErrorIcon sx={{ fontSize: 14 }} /> :
                          <Schedule sx={{ fontSize: 14 }} />
                        }
                      />
                      {platform.retryCount > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          Retry {platform.retryCount}
                        </Typography>
                      )}
                      {platform.url && (
                        <Button
                          variant="text"
                          size="small"
                          startIcon={<Public />}
                          href={platform.url}
                          target="_blank"
                          sx={{ mt: 0.5, p: 0, minWidth: 'auto' }}
                        >
                          View
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </Grid>

            {/* Overall Status & Actions */}
            <Grid item xs={12} md={2}>
              <Stack alignItems="flex-end" spacing={2}>
                <Chip
                  label={overallStatus}
                  color={
                    overallStatus === 'completed' ? 'success' :
                    overallStatus === 'publishing' ? 'warning' :
                    overallStatus === 'failed' ? 'error' : 'default'
                  }
                  variant="filled"
                />
                
                <Stack direction="row" spacing={0.5}>
                  {overallStatus === 'failed' && (
                    <Tooltip title="Retry failed platforms">
                      <IconButton
                        size="small"
                        onClick={() => onRetryJob?.(job.id)}
                        sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}
                      >
                        <Refresh fontSize="small" color="warning" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {overallStatus !== 'completed' && (
                    <Tooltip title="Cancel job">
                      <IconButton
                        size="small"
                        onClick={() => onCancelJob?.(job.id)}
                        sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
                      >
                        <Stop fontSize="small" color="error" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="View details">
                    <IconButton
                      size="small"
                      sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                    >
                      <Visibility fontSize="small" color="primary" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </Grid>
          </Grid>

          {/* Error Details */}
          {job.platforms.some(p => p.error) && (
            <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'error.main' }}>
                Errors:
              </Typography>
              {job.platforms
                .filter(p => p.error)
                .map((platform, index) => (
                  <Alert key={index} severity="error" sx={{ mt: 1, py: 0.5 }}>
                    <Typography variant="caption">
                      <strong>{platform.platform}:</strong> {platform.error}
                    </Typography>
                  </Alert>
                ))}
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  // Render analytics overview
  const renderAnalytics = () => (
    <Grid container spacing={3}>
      {/* Overall Performance */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
            Publishing Performance Overview
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 3, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <Typography variant="h3" fontWeight={700} color="primary.main">
                  {connectionStats.totalPosts}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Posts Published
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 3, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                <Typography variant="h3" fontWeight={700} color="success.main">
                  {connectionStats.successRate.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Success Rate
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 3, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                <Typography variant="h3" fontWeight={700} color="info.main">
                  {connectionStats.connected}/{connectionStats.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Platforms Connected
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 3, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
                <Typography variant="h3" fontWeight={700} color="warning.main">
                  {jobStats.inProgress}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Jobs In Progress
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Platform Performance Table */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
            Platform Performance Breakdown
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Platform</TableCell>
                  <TableCell align="right">Total Posts</TableCell>
                  <TableCell align="right">Success Rate</TableCell>
                  <TableCell align="right">Avg Engagement</TableCell>
                  <TableCell align="right">Rate Limit Usage</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {connections.map((connection) => (
                  <TableRow key={connection.platform} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar
                          sx={{
                            bgcolor: alpha(platformColors[connection.platform], 0.1),
                            color: platformColors[connection.platform],
                            width: 32,
                            height: 32,
                          }}
                        >
                          {platformIcons[connection.platform]}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                            {connection.platform}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {connection.accountName || 'Not connected'}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600}>
                        {connection.analytics.totalPosts}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        fontWeight={600}
                        color={
                          connection.analytics.totalPosts > 0 && 
                          (connection.analytics.successfulPosts / connection.analytics.totalPosts) * 100 >= 95 
                            ? 'success.main' : 'text.primary'
                        }
                      >
                        {connection.analytics.totalPosts > 0 
                          ? ((connection.analytics.successfulPosts / connection.analytics.totalPosts) * 100).toFixed(1)
                          : 0}%
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600} color="primary.main">
                        {connection.analytics.averageEngagement}%
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {connection.rateLimits.maxRequests > 0 ? (
                        <Stack alignItems="flex-end">
                          <Typography variant="caption">
                            {connection.rateLimits.remaining}/{connection.rateLimits.maxRequests}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={(connection.rateLimits.remaining / connection.rateLimits.maxRequests) * 100}
                            sx={{ width: 60, height: 4, borderRadius: 2 }}
                          />
                        </Stack>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          N/A
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={connection.status}
                        size="small"
                        color={
                          connection.status === 'connected' ? 'success' :
                          connection.status === 'error' ? 'error' :
                          connection.status === 'expired' ? 'warning' : 'default'
                        }
                        variant="outlined"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)` }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CloudUpload color="primary" />
              Platform Publisher
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage platform connections and monitor publishing performance
            </Typography>
          </Box>
        </Stack>

        {/* Summary Stats */}
        <Grid container spacing={3}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
              <Typography variant="h4" fontWeight={600} color="success.main">
                {connectionStats.connected}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Connected Platforms
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <Typography variant="h4" fontWeight={600} color="primary.main">
                {jobStats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Publishing Jobs
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
              <Typography variant="h4" fontWeight={600} color="warning.main">
                {jobStats.inProgress}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In Progress
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.05) }}>
              <Typography variant="h4" fontWeight={600} color="error.main">
                {connectionStats.issues}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Connection Issues
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* View Mode Toggle */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stack direction="row" spacing={1}>
          <Button
            variant={viewMode === 'connections' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('connections')}
            sx={{ borderRadius: 2 }}
          >
            Connections ({connectionStats.connected}/{connectionStats.total})
          </Button>
          <Button
            variant={viewMode === 'jobs' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('jobs')}
            sx={{ borderRadius: 2 }}
          >
            Publishing Jobs ({jobStats.total})
          </Button>
          <Button
            variant={viewMode === 'analytics' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('analytics')}
            sx={{ borderRadius: 2 }}
          >
            Analytics
          </Button>
        </Stack>
      </Paper>

      {/* Content */}
      {viewMode === 'connections' && (
        <Grid container spacing={3}>
          {connections.map(renderConnectionCard)}
        </Grid>
      )}

      {viewMode === 'jobs' && (
        <Box>
          {publishingJobs.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
              <Timeline sx={{ fontSize: 64, color: theme.palette.text.secondary, mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No publishing jobs
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Publishing jobs will appear here when content is scheduled
              </Typography>
            </Paper>
          ) : (
            publishingJobs.map(renderPublishingJob)
          )}
        </Box>
      )}

      {viewMode === 'analytics' && renderAnalytics()}

      {/* Connection Details Dialog */}
      <Dialog
        open={connectionDialogOpen}
        onClose={() => setConnectionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {selectedConnection && (
          <>
            <DialogTitle>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    bgcolor: alpha(platformColors[selectedConnection.platform], 0.1),
                    color: platformColors[selectedConnection.platform],
                  }}
                >
                  {platformIcons[selectedConnection.platform]}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                    {selectedConnection.platform} Settings
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedConnection.accountName}
                  </Typography>
                </Box>
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 1 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Connection Details
                  </Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Status</Typography>
                      <Chip
                        label={selectedConnection.status}
                        size="small"
                        color={selectedConnection.status === 'connected' ? 'success' : 'error'}
                        variant="outlined"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Account ID</Typography>
                      <Typography variant="body2">{selectedConnection.accountId}</Typography>
                    </Box>
                    {selectedConnection.expiresAt && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Token Expires</Typography>
                        <Typography variant="body2">
                          {format(selectedConnection.expiresAt, 'MMM d, yyyy HH:mm')}
                        </Typography>
                      </Box>
                    )}
                    {selectedConnection.lastSync && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Last Sync</Typography>
                        <Typography variant="body2">
                          {formatDistanceToNow(selectedConnection.lastSync)} ago
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Permissions
                  </Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                    {selectedConnection.permissions.map((permission) => (
                      <Chip key={permission} label={permission} size="small" variant="outlined" sx={{ mb: 0.5 }} />
                    ))}
                  </Stack>
                </Box>

                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Auto-refresh tokens before expiration"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Enable rate limit protection"
                />
                <FormControlLabel
                  control={<Switch />}
                  label="Send notifications on connection issues"
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConnectionDialogOpen(false)} sx={{ borderRadius: 2 }}>
                Close
              </Button>
              <Button variant="contained" sx={{ borderRadius: 2 }}>
                Save Settings
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};