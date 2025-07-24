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
  LinearProgress,
  Chip,
  Avatar,
  Badge,
  Switch,
  FormControlLabel,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Collapse,
  Tooltip,
  CircularProgress,
  alpha,
  useTheme,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Schedule,
  CheckCircle,
  Error as ErrorIcon,
  Warning,
  Refresh,
  Settings,
  FilterList,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Share,
  ContentCopy,
  Timeline,
  Speed,
  AccessTime,
  Public,
  CloudUpload,
  CloudOff,
  Notifications,
  NotificationsOff,
  Psychology,
  Analytics2,
  TrendingUp,
  InfoOutlined,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { format, formatDistanceToNow, isAfter, isBefore, addMinutes, parseISO } from 'date-fns';

interface QueueItem {
  id: string;
  title: string;
  content: string;
  platforms: {
    platform: string;
    status: 'pending' | 'publishing' | 'published' | 'failed' | 'cancelled';
    scheduledAt: Date;
    publishedAt?: Date;
    error?: string;
    retryCount: number;
    postId?: string;
    url?: string;
  }[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  media?: { url: string; type: string; alt?: string }[];
  tags: string[];
  createdBy: string;
  scheduledAt: Date;
  estimatedDuration: number; // seconds
  actualDuration?: number; // seconds
  retryAttempts: number;
  maxRetries: number;
  failureReason?: string;
  analytics?: {
    estimatedReach: number;
    actualReach?: number;
    engagementRate?: number;
  };
}

interface QueueStatus {
  totalItems: number;
  pending: number;
  publishing: number;
  published: number;
  failed: number;
  cancelled: number;
  estimatedTimeToCompletion: number; // minutes
  currentThroughput: number; // items per hour
  errorRate: number; // percentage
  successRate: number; // percentage
}

interface PublishingQueueProps {
  queueItems?: QueueItem[];
  autoPublish?: boolean;
  onItemUpdate?: (item: QueueItem) => void;
  onItemDelete?: (itemId: string) => void;
  onQueueStart?: () => void;
  onQueueStop?: () => void;
  onQueuePause?: () => void;
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

// Mock queue data
const mockQueueItems: QueueItem[] = [
  {
    id: '1',
    title: 'Weekly Marketing Tips',
    content: '🚀 5 proven strategies to boost your social media engagement this week...',
    platforms: [
      {
        platform: 'linkedin',
        status: 'publishing',
        scheduledAt: new Date(),
        retryCount: 0,
      },
      {
        platform: 'twitter',
        status: 'pending',
        scheduledAt: addMinutes(new Date(), 5),
        retryCount: 0,
      },
    ],
    priority: 'high',
    tags: ['marketing', 'tips', 'engagement'],
    createdBy: 'John Doe',
    scheduledAt: new Date(),
    estimatedDuration: 45,
    retryAttempts: 0,
    maxRetries: 3,
    analytics: {
      estimatedReach: 15000,
    },
  },
  {
    id: '2',
    title: 'Product Feature Announcement',
    content: '✨ Introducing our latest AI-powered analytics dashboard...',
    platforms: [
      {
        platform: 'linkedin',
        status: 'published',
        scheduledAt: addMinutes(new Date(), -30),
        publishedAt: addMinutes(new Date(), -25),
        retryCount: 0,
        postId: 'urn:li:activity:123456789',
        url: 'https://linkedin.com/posts/activity-123456789',
      },
      {
        platform: 'twitter',
        status: 'published',
        scheduledAt: addMinutes(new Date(), -25),
        publishedAt: addMinutes(new Date(), -20),
        retryCount: 0,
        postId: '1234567890123456789',
        url: 'https://twitter.com/user/status/1234567890123456789',
      },
    ],
    priority: 'medium',
    tags: ['product', 'announcement', 'AI'],
    createdBy: 'Jane Smith',
    scheduledAt: addMinutes(new Date(), -30),
    estimatedDuration: 30,
    actualDuration: 28,
    retryAttempts: 0,
    maxRetries: 3,
    analytics: {
      estimatedReach: 12000,
      actualReach: 13500,
      engagementRate: 8.2,
    },
  },
  {
    id: '3',
    title: 'Industry Report Release',
    content: '📊 Our latest research reveals key trends in social media marketing...',
    platforms: [
      {
        platform: 'linkedin',
        status: 'failed',
        scheduledAt: addMinutes(new Date(), -60),
        retryCount: 2,
        error: 'Rate limit exceeded. Retrying in 15 minutes.',
      },
      {
        platform: 'facebook',
        status: 'cancelled',
        scheduledAt: addMinutes(new Date(), -55),
        retryCount: 0,
      },
    ],
    priority: 'urgent',
    tags: ['research', 'insights', 'trends'],
    createdBy: 'Mike Johnson',
    scheduledAt: addMinutes(new Date(), -60),
    estimatedDuration: 60,
    retryAttempts: 2,
    maxRetries: 3,
    failureReason: 'API rate limit exceeded',
    analytics: {
      estimatedReach: 20000,
    },
  },
  {
    id: '4',
    title: 'Team Behind the Scenes',
    content: '👀 Take a look at our creative process and amazing team culture...',
    platforms: [
      {
        platform: 'instagram',
        status: 'pending',
        scheduledAt: addMinutes(new Date(), 15),
        retryCount: 0,
      },
      {
        platform: 'tiktok',
        status: 'pending',
        scheduledAt: addMinutes(new Date(), 20),
        retryCount: 0,
      },
    ],
    priority: 'low',
    tags: ['culture', 'team', 'process'],
    createdBy: 'Sarah Wilson',
    scheduledAt: addMinutes(new Date(), 15),
    estimatedDuration: 90,
    retryAttempts: 0,
    maxRetries: 3,
    analytics: {
      estimatedReach: 8500,
    },
  },
];

export const PublishingQueue: React.FC<PublishingQueueProps> = ({
  queueItems = mockQueueItems,
  autoPublish = true,
  onItemUpdate,
  onItemDelete,
  onQueueStart,
  onQueueStop,
  onQueuePause,
}) => {
  const theme = useTheme();
  const [items, setItems] = useState<QueueItem[]>(queueItems);
  const [isRunning, setIsRunning] = useState(autoPublish);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('scheduledAt');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'timeline'>('list');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [detailsItem, setDetailsItem] = useState<QueueItem | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ element: HTMLElement; item: QueueItem } | null>(null);
  const [notifications, setNotifications] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Calculate queue status
  const queueStatus = useMemo((): QueueStatus => {
    const totalItems = items.length;
    const statusCounts = items.reduce((acc, item) => {
      item.platforms.forEach(platform => {
        acc[platform.status] = (acc[platform.status] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const totalPlatforms = items.reduce((sum, item) => sum + item.platforms.length, 0);
    const published = statusCounts.published || 0;
    const failed = statusCounts.failed || 0;
    const successRate = totalPlatforms > 0 ? (published / totalPlatforms) * 100 : 0;
    const errorRate = totalPlatforms > 0 ? (failed / totalPlatforms) * 100 : 0;

    const pendingItems = items.filter(item => 
      item.platforms.some(p => p.status === 'pending')
    );
    const avgDuration = items
      .filter(item => item.actualDuration)
      .reduce((sum, item) => sum + (item.actualDuration || 0), 0) / 
      items.filter(item => item.actualDuration).length || 60;
    const estimatedTimeToCompletion = (pendingItems.length * avgDuration) / 60;

    return {
      totalItems,
      pending: statusCounts.pending || 0,
      publishing: statusCounts.publishing || 0,
      published,
      failed,
      cancelled: statusCounts.cancelled || 0,
      estimatedTimeToCompletion,
      currentThroughput: isRunning ? 12 : 0, // items per hour
      errorRate,
      successRate,
    };
  }, [items, isRunning]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let filtered = items;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(item =>
        item.platforms.some(p => p.status === filterStatus)
      );
    }

    if (filterPlatform !== 'all') {
      filtered = filtered.filter(item =>
        item.platforms.some(p => p.platform === filterPlatform)
      );
    }

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'scheduledAt':
          return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'status':
          const statusOrder = { publishing: 4, pending: 3, failed: 2, published: 1, cancelled: 0 };
          const aStatus = Math.max(...a.platforms.map(p => statusOrder[p.status] || 0));
          const bStatus = Math.max(...b.platforms.map(p => statusOrder[p.status] || 0));
          return bStatus - aStatus;
        default:
          return 0;
      }
    });

    return filtered;
  }, [items, filterStatus, filterPlatform, sortBy]);

  // Simulate publishing process
  useEffect(() => {
    if (!isRunning || isPaused) return;

    const interval = setInterval(() => {
      setItems(prev => prev.map(item => {
        const updatedPlatforms = item.platforms.map(platform => {
          if (platform.status === 'pending' && isBefore(platform.scheduledAt, new Date())) {
            // Start publishing
            return { ...platform, status: 'publishing' as const };
          } else if (platform.status === 'publishing') {
            // Simulate publishing completion
            const shouldComplete = Math.random() > 0.1; // 90% success rate
            const shouldFail = Math.random() < 0.05; // 5% failure rate
            
            if (shouldFail && platform.retryCount < 3) {
              return {
                ...platform,
                status: 'failed' as const,
                error: 'Rate limit exceeded. Retrying...',
                retryCount: platform.retryCount + 1,
              };
            } else if (shouldComplete) {
              return {
                ...platform,
                status: 'published' as const,
                publishedAt: new Date(),
                postId: `${platform.platform}_${Date.now()}`,
                url: `https://${platform.platform}.com/post/${Date.now()}`,
              };
            }
          } else if (platform.status === 'failed' && platform.retryCount < 3) {
            // Retry failed posts after delay
            const timeSinceFailure = new Date().getTime() - (item.scheduledAt.getTime() + 60000);
            if (timeSinceFailure > 15 * 60 * 1000) { // Retry after 15 minutes
              return {
                ...platform,
                status: 'pending' as const,
                scheduledAt: addMinutes(new Date(), 1),
              };
            }
          }
          return platform;
        });

        return { ...item, platforms: updatedPlatforms };
      }));
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, [isRunning, isPaused]);

  // Handle queue controls
  const handleQueueStart = () => {
    setIsRunning(true);
    setIsPaused(false);
    onQueueStart?.();
  };

  const handleQueuePause = () => {
    setIsPaused(!isPaused);
    onQueuePause?.();
  };

  const handleQueueStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    onQueueStop?.();
  };

  // Handle item actions
  const handleItemSelect = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    setSelectedItems(
      selectedItems.length === filteredItems.length
        ? []
        : filteredItems.map(item => item.id)
    );
  };

  const handleItemMenu = (event: React.MouseEvent, item: QueueItem) => {
    setMenuAnchor({ element: event.currentTarget as HTMLElement, item });
  };

  const handleRetryItem = (item: QueueItem) => {
    const updatedItem = {
      ...item,
      platforms: item.platforms.map(p => ({
        ...p,
        status: 'pending' as const,
        scheduledAt: new Date(),
        error: undefined,
      })),
      retryAttempts: item.retryAttempts + 1,
    };
    setItems(prev => prev.map(i => i.id === item.id ? updatedItem : i));
    onItemUpdate?.(updatedItem);
    setMenuAnchor(null);
  };

  const handleCancelItem = (item: QueueItem) => {
    const updatedItem = {
      ...item,
      platforms: item.platforms.map(p => ({ ...p, status: 'cancelled' as const })),
    };
    setItems(prev => prev.map(i => i.id === item.id ? updatedItem : i));
    onItemUpdate?.(updatedItem);
    setMenuAnchor(null);
  };

  const toggleItemExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Render queue status header
  const renderQueueStatus = () => (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 3, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)` }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Timeline color="primary" />
            Publishing Queue
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {queueStatus.totalItems} items • {queueStatus.pending} pending • {queueStatus.publishing} publishing
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title={isRunning ? (isPaused ? 'Resume Queue' : 'Pause Queue') : 'Start Queue'}>
            <IconButton
              onClick={isRunning ? handleQueuePause : handleQueueStart}
              sx={{
                bgcolor: isRunning && !isPaused ? theme.palette.success.main : theme.palette.primary.main,
                color: 'white',
                '&:hover': {
                  bgcolor: isRunning && !isPaused ? theme.palette.success.dark : theme.palette.primary.dark,
                },
              }}
            >
              {isRunning ? (isPaused ? <PlayArrow /> : <Pause />) : <PlayArrow />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Stop Queue">
            <IconButton
              onClick={handleQueueStop}
              disabled={!isRunning}
              sx={{
                bgcolor: theme.palette.error.main,
                color: 'white',
                '&:hover': { bgcolor: theme.palette.error.dark },
                '&.Mui-disabled': { bgcolor: alpha(theme.palette.error.main, 0.3) },
              }}
            >
              <Stop />
            </IconButton>
          </Tooltip>
          
          <FormControlLabel
            control={
              <Switch
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                color="primary"
              />
            }
            label="Notifications"
          />
          
          <IconButton onClick={() => setSettingsOpen(true)}>
            <Settings />
          </IconButton>
        </Stack>
      </Stack>

      {/* Status Metrics */}
      <Grid container spacing={3}>
        <Grid item xs={6} sm={3}>
          <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
            <Typography variant="h4" fontWeight={600} color="success.main">
              {queueStatus.published}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Published
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
            <Typography variant="h4" fontWeight={600} color="warning.main">
              {queueStatus.pending + queueStatus.publishing}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              In Progress
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.05) }}>
            <Typography variant="h4" fontWeight={600} color="error.main">
              {queueStatus.failed}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Failed
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
            <Typography variant="h4" fontWeight={600} color="info.main">
              {Math.round(queueStatus.successRate)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Success Rate
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Progress Bar */}
      {isRunning && !isPaused && queueStatus.pending > 0 && (
        <Box sx={{ mt: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Queue Progress
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ~{Math.round(queueStatus.estimatedTimeToCompletion)} minutes remaining
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={(queueStatus.published / (queueStatus.published + queueStatus.pending + queueStatus.publishing)) * 100}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      )}

      {/* Status Alerts */}
      {queueStatus.failed > 0 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {queueStatus.failed} items failed to publish. Check individual items for details and retry options.
        </Alert>
      )}

      {!isRunning && queueStatus.pending > 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Queue is stopped. {queueStatus.pending} items are waiting to be published.
        </Alert>
      )}
    </Paper>
  );

  // Render queue controls
  const renderQueueControls = () => (
    <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="publishing">Publishing</MenuItem>
              <MenuItem value="published">Published</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Platform</InputLabel>
            <Select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              label="Platform"
            >
              <MenuItem value="all">All Platforms</MenuItem>
              {Object.keys(platformIcons).map((platform) => (
                <MenuItem key={platform} value={platform}>
                  {platformIcons[platform]} {platform}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label="Sort By"
            >
              <MenuItem value="scheduledAt">Scheduled Time</MenuItem>
              <MenuItem value="priority">Priority</MenuItem>
              <MenuItem value="status">Status</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            size="small"
            sx={{ borderRadius: 2 }}
          >
            Advanced Filters
          </Button>
          
          {selectedItems.length > 0 && (
            <>
              <Button
                variant="outlined"
                startIcon={<PlayArrow />}
                size="small"
                sx={{ borderRadius: 2 }}
              >
                Retry Selected ({selectedItems.length})
              </Button>
              <Button
                variant="outlined"
                startIcon={<Stop />}
                size="small"
                color="error"
                sx={{ borderRadius: 2 }}
              >
                Cancel Selected
              </Button>
            </>
          )}
        </Stack>
      </Stack>
    </Paper>
  );

  // Render queue item
  const renderQueueItem = (item: QueueItem) => {
    const isExpanded = expandedItems.includes(item.id);
    const overallStatus = item.platforms.every(p => p.status === 'published') ? 'published' :
                         item.platforms.some(p => p.status === 'publishing') ? 'publishing' :
                         item.platforms.some(p => p.status === 'failed') ? 'failed' :
                         'pending';

    return (
      <Card key={item.id} sx={{ mb: 2, borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.2)}` }}>
        <CardContent sx={{ p: 2 }}>
          {/* Main Row */}
          <Stack direction="row" alignItems="center" spacing={2}>
            <Checkbox
              checked={selectedItems.includes(item.id)}
              onChange={() => handleItemSelect(item.id)}
            />

            {/* Priority Indicator */}
            <Chip
              label={item.priority}
              size="small"
              color={item.priority === 'urgent' ? 'error' : item.priority === 'high' ? 'warning' : item.priority === 'medium' ? 'info' : 'default'}
              variant="outlined"
            />

            {/* Content Info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ 
                display: '-webkit-box', 
                WebkitLineClamp: 1, 
                WebkitBoxOrient: 'vertical', 
                overflow: 'hidden',
                mb: 1 
              }}>
                {item.content}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <AccessTime sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                <Typography variant="caption" color="text.secondary">
                  {format(item.scheduledAt, 'MMM d, HH:mm')}
                  {isAfter(item.scheduledAt, new Date()) && (
                    <span> ({formatDistanceToNow(item.scheduledAt)} from now)</span>
                  )}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  • by {item.createdBy}
                </Typography>
              </Stack>
            </Box>

            {/* Platforms Status */}
            <Stack direction="row" spacing={0.5}>
              {item.platforms.map((platform, index) => (
                <Tooltip key={index} title={`${platform.platform}: ${platform.status}${platform.error ? ` - ${platform.error}` : ''}`}>
                  <Badge
                    badgeContent={
                      platform.status === 'published' ? <CheckCircle sx={{ fontSize: 12, color: theme.palette.success.main }} /> :
                      platform.status === 'publishing' ? <CircularProgress size={12} /> :
                      platform.status === 'failed' ? <ErrorIcon sx={{ fontSize: 12, color: theme.palette.error.main }} /> :
                      platform.status === 'cancelled' ? <Stop sx={{ fontSize: 12, color: theme.palette.text.secondary }} /> :
                      <Schedule sx={{ fontSize: 12, color: theme.palette.info.main }} />
                    }
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: alpha(platformColors[platform.platform], 0.1),
                        color: platformColors[platform.platform],
                        fontSize: 16,
                      }}
                    >
                      {platformIcons[platform.platform]}
                    </Avatar>
                  </Badge>
                </Tooltip>
              ))}
            </Stack>

            {/* Overall Status */}
            <Box sx={{ textAlign: 'center', minWidth: 80 }}>
              <Chip
                label={overallStatus}
                size="small"
                color={
                  overallStatus === 'published' ? 'success' :
                  overallStatus === 'publishing' ? 'warning' :
                  overallStatus === 'failed' ? 'error' : 'default'
                }
                variant={overallStatus === 'pending' ? 'outlined' : 'filled'}
              />
              {item.analytics?.actualReach && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  {item.analytics.actualReach.toLocaleString()} reach
                </Typography>
              )}
            </Box>

            {/* Actions */}
            <Stack direction="row" spacing={0.5}>
              <IconButton
                size="small"
                onClick={() => toggleItemExpanded(item.id)}
              >
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setDetailsItem(item)}
              >
                <Visibility fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => handleItemMenu(e, item)}
              >
                <MoreVert fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>

          {/* Expanded Details */}
          <Collapse in={isExpanded}>
            <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <Grid container spacing={3}>
                {/* Platform Details */}
                <Grid item xs={12} md={8}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                    Platform Status
                  </Typography>
                  <Stack spacing={1}>
                    {item.platforms.map((platform, index) => (
                      <Paper key={index} sx={{ p: 2, borderRadius: 1, bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Avatar
                              sx={{
                                width: 24,
                                height: 24,
                                bgcolor: alpha(platformColors[platform.platform], 0.1),
                                color: platformColors[platform.platform],
                                fontSize: 12,
                              }}
                            >
                              {platformIcons[platform.platform]}
                            </Avatar>
                            <Typography variant="body2" sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
                              {platform.platform}
                            </Typography>
                          </Stack>
                          <Stack alignItems="flex-end" spacing={0.5}>
                            <Chip
                              label={platform.status}
                              size="small"
                              color={
                                platform.status === 'published' ? 'success' :
                                platform.status === 'publishing' ? 'warning' :
                                platform.status === 'failed' ? 'error' : 'default'
                              }
                              variant="outlined"
                            />
                            {platform.status === 'failed' && platform.retryCount > 0 && (
                              <Typography variant="caption" color="text.secondary">
                                Retry {platform.retryCount}/{item.maxRetries}
                              </Typography>
                            )}
                            {platform.publishedAt && (
                              <Typography variant="caption" color="text.secondary">
                                Published {format(platform.publishedAt, 'HH:mm')}
                              </Typography>
                            )}
                          </Stack>
                        </Stack>
                        {platform.error && (
                          <Alert severity="error" sx={{ mt: 1, py: 0.5 }}>
                            {platform.error}
                          </Alert>
                        )}
                        {platform.url && (
                          <Button
                            variant="text"
                            size="small"
                            startIcon={<Public />}
                            href={platform.url}
                            target="_blank"
                            sx={{ mt: 1 }}
                          >
                            View Post
                          </Button>
                        )}
                      </Paper>
                    ))}
                  </Stack>
                </Grid>

                {/* Analytics & Metadata */}
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                    Performance
                  </Typography>
                  <Stack spacing={2}>
                    {item.analytics && (
                      <Paper sx={{ p: 2, borderRadius: 1, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                        <Stack spacing={1}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              Estimated Reach
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {item.analytics.estimatedReach.toLocaleString()}
                            </Typography>
                          </Box>
                          {item.analytics.actualReach && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="caption" color="text.secondary">
                                Actual Reach
                              </Typography>
                              <Typography variant="body2" fontWeight={600} color="success.main">
                                {item.analytics.actualReach.toLocaleString()}
                              </Typography>
                            </Box>
                          )}
                          {item.analytics.engagementRate && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="caption" color="text.secondary">
                                Engagement Rate
                              </Typography>
                              <Typography variant="body2" fontWeight={600} color="success.main">
                                {item.analytics.engagementRate}%
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      </Paper>
                    )}

                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        Tags
                      </Typography>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {item.tags.map((tag) => (
                          <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ mb: 0.5 }} />
                        ))}
                      </Stack>
                    </Box>

                    <Box>
                      <Stack spacing={0.5}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            Est. Duration
                          </Typography>
                          <Typography variant="caption">
                            {item.estimatedDuration}s
                          </Typography>
                        </Box>
                        {item.actualDuration && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              Actual Duration
                            </Typography>
                            <Typography variant="caption" color="success.main">
                              {item.actualDuration}s
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      {renderQueueStatus()}
      {renderQueueControls()}

      {/* Queue Items */}
      <Box>
        {filteredItems.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <CloudOff sx={{ fontSize: 64, color: theme.palette.text.secondary, mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No items in queue
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Schedule some content to see it appear here
            </Typography>
          </Paper>
        ) : (
          filteredItems.map(renderQueueItem)
        )}
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor?.element}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 200 } }}
      >
        <MenuItem onClick={() => setDetailsItem(menuAnchor!.item)}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleRetryItem(menuAnchor!.item)} disabled={!menuAnchor?.item.platforms.some(p => p.status === 'failed')}>
          <ListItemIcon>
            <Refresh fontSize="small" />
          </ListItemIcon>
          <ListItemText>Retry Failed</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Content</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <ContentCopy fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleCancelItem(menuAnchor!.item)} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Stop fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText>Cancel Item</ListItemText>
        </MenuItem>
      </Menu>

      {/* Item Details Dialog */}
      <Dialog
        open={Boolean(detailsItem)}
        onClose={() => setDetailsItem(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {detailsItem && (
          <>
            <DialogTitle>
              <Typography variant="h6" fontWeight={600}>
                {detailsItem.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Scheduled for {format(detailsItem.scheduledAt, 'MMM d, yyyy • HH:mm')}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
                {detailsItem.content}
              </Typography>
              
              {/* Render detailed platform status and analytics here */}
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Platform Publishing Details
              </Typography>
              {/* Platform details would go here */}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsItem(null)} sx={{ borderRadius: 2 }}>
                Close
              </Button>
              <Button startIcon={<Analytics2 />} sx={{ borderRadius: 2 }}>
                View Analytics
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Settings Dialog */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>Queue Settings</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Auto-retry failed posts"
            />
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Send notifications on completion"
            />
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Pause queue on multiple failures"
            />
            <TextField
              label="Max retry attempts"
              type="number"
              defaultValue={3}
              size="small"
              fullWidth
            />
            <TextField
              label="Retry delay (minutes)"
              type="number"
              defaultValue={15}
              size="small"
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button variant="contained" sx={{ borderRadius: 2 }}>
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};