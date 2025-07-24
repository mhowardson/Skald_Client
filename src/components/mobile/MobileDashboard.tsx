import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Button,
  SwipeableDrawer,
  Alert,
  Badge,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Visibility as ViewsIcon,
  Favorite as LikesIcon,
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  MoreVert as MoreIcon,
  Notifications as NotificationsIcon,
  Speed as SpeedIcon,
  AutoAwesome as AIIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { useTenant } from '../../contexts/TenantContext';

interface MobileMetric {
  id: string;
  label: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
  trend: 'up' | 'down' | 'stable';
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
}

interface ContentItem {
  id: string;
  title: string;
  platform: string;
  status: 'published' | 'scheduled' | 'draft';
  metrics?: {
    views: number;
    engagement: number;
  };
  scheduledDate?: string;
  publishedDate?: string;
}

const mockMetrics: MobileMetric[] = [
  {
    id: 'views',
    label: 'Total Views',
    value: '37.5K',
    change: 12.5,
    icon: <ViewsIcon />,
    color: '#2196F3',
    trend: 'up'
  },
  {
    id: 'engagement',
    label: 'Engagement',
    value: '8.2%',
    change: -2.1,
    icon: <LikesIcon />,
    color: '#4CAF50',
    trend: 'down'
  },
  {
    id: 'content',
    label: 'Content',
    value: 24,
    change: 4,
    icon: <EditIcon />,
    color: '#FF9800',
    trend: 'up'
  },
  {
    id: 'viral',
    label: 'Viral Score',
    value: 85,
    change: 15,
    icon: <SpeedIcon />,
    color: '#9C27B0',
    trend: 'up'
  }
];

const mockRecentContent: ContentItem[] = [
  {
    id: '1',
    title: 'Future-Proofing Digital Skills',
    platform: 'youtube',
    status: 'published',
    publishedDate: '2 hours ago',
    metrics: { views: 25000, engagement: 8.5 }
  },
  {
    id: '2',
    title: 'AI Safety for Kids',
    platform: 'instagram',
    status: 'published',
    publishedDate: '1 day ago',
    metrics: { views: 12500, engagement: 10.2 }
  },
  {
    id: '3',
    title: 'Screen Time Balance',
    platform: 'tiktok',
    status: 'scheduled',
    scheduledDate: 'Tomorrow 4:00 PM'
  },
  {
    id: '4',
    title: 'Digital Resilience',
    platform: 'twitter',
    status: 'draft'
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

export const MobileDashboard: React.FC = () => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentWorkspace } = useTenant();

  const quickActions: QuickAction[] = [
    {
      id: 'create',
      label: 'Create',
      icon: <AIIcon />,
      color: '#6366f1',
      action: () => console.log('Create content')
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: <ScheduleIcon />,
      color: '#f59e0b',
      action: () => console.log('Schedule content')
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <AnalyticsIcon />,
      color: '#10b981',
      action: () => console.log('View analytics')
    },
    {
      id: 'timeline',
      label: 'Timeline',
      icon: <TimelineIcon />,
      color: '#8b5cf6',
      action: () => console.log('View timeline')
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'success';
      case 'scheduled': return 'warning';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? (
      <TrendingUpIcon fontSize="small" color="success" />
    ) : trend === 'down' ? (
      <TrendingUpIcon fontSize="small" color="error" sx={{ transform: 'rotate(180deg)' }} />
    ) : null;
  };

  const renderMetricCard = (metric: MobileMetric) => (
    <Card key={metric.id} sx={{ height: '100%' }}>
      <CardContent sx={{ p: isMobile ? 2 : 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Avatar sx={{ bgcolor: metric.color, width: 32, height: 32 }}>
            {metric.icon}
          </Avatar>
          {getTrendIcon(metric.trend)}
        </Box>
        
        <Typography variant="h5" fontWeight="bold" color={metric.color}>
          {metric.value}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {metric.label}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography 
            variant="caption" 
            color={metric.change > 0 ? 'success.main' : 'error.main'}
          >
            {metric.change > 0 ? '+' : ''}{metric.change}%
          </Typography>
          <Typography variant="caption" color="text.secondary">
            vs last period
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  const renderQuickActionButton = (action: QuickAction) => (
    <Paper
      key={action.id}
      onClick={action.action}
      sx={{
        p: 2,
        textAlign: 'center',
        cursor: 'pointer',
        bgcolor: action.color,
        color: 'white',
        '&:hover': {
          bgcolor: action.color,
          opacity: 0.9
        },
        minHeight: 80,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 1
      }}
    >
      {action.icon}
      <Typography variant="caption" fontWeight="bold">
        {action.label}
      </Typography>
    </Paper>
  );

  return (
    <Box>
      {/* Mobile Header */}
      {isMobile && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.main', color: 'white' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Welcome back!
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {currentWorkspace?.name || 'Content Dashboard'}
              </Typography>
            </Box>
            <IconButton 
              color="inherit"
              onClick={() => setNotificationsOpen(true)}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Box>
        </Paper>
      )}

      {/* Current Workspace Card */}
      {currentWorkspace && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: currentWorkspace.branding.brandColors.primary,
                  width: isMobile ? 40 : 48,
                  height: isMobile ? 40 : 48
                }}
              >
                {currentWorkspace.name.charAt(0)}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant={isMobile ? 'subtitle1' : 'h6'} fontWeight="bold">
                  {currentWorkspace.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentWorkspace.client.companyName}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                  <Chip
                    label={currentWorkspace.branding.toneOfVoice}
                    size="small"
                    variant="outlined"
                  />
                  {currentWorkspace.client.industry && (
                    <Chip
                      label={currentWorkspace.client.industry}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={1}>
            {quickActions.map((action) => (
              <Grid item xs={3} key={action.id}>
                {renderQuickActionButton(action)}
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Typography variant="h6" sx={{ mb: 2, px: isMobile ? 0 : 2 }}>
        Performance Overview
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {mockMetrics.map((metric) => (
          <Grid item xs={6} sm={3} key={metric.id}>
            {renderMetricCard(metric)}
          </Grid>
        ))}
      </Grid>

      {/* Recent Content */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Recent Content
            </Typography>
            <Button size="small" color="primary">
              View All
            </Button>
          </Box>
          
          <List dense>
            {mockRecentContent.map((content, index) => (
              <React.Fragment key={content.id}>
                <ListItem sx={{ px: 0 }}>
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
                    primary={
                      <Typography variant="subtitle2" noWrap>
                        {content.title}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5 }}>
                          <Chip
                            label={content.status}
                            size="small"
                            color={getStatusColor(content.status) as any}
                            variant="outlined"
                            sx={{ fontSize: '0.6rem', height: 16 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {content.publishedDate || content.scheduledDate}
                          </Typography>
                        </Box>
                        
                        {content.metrics && (
                          <Typography variant="caption" color="text.secondary">
                            {content.metrics.views.toLocaleString()} views • 
                            {content.metrics.engagement}% engagement
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <IconButton size="small">
                      <MoreIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                
                {index < mockRecentContent.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Activity Alert */}
      <Alert severity="success" sx={{ mt: 2 }}>
        <Typography variant="body2" fontWeight="bold">
          🔥 Your video is trending!
        </Typography>
        <Typography variant="body2">
          "Future-Proofing Digital Skills" gained 5K views in the last hour.
        </Typography>
      </Alert>

      {/* Mobile Notifications Drawer */}
      <SwipeableDrawer
        anchor="right"
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onOpen={() => setNotificationsOpen(true)}
        sx={{
          '& .MuiDrawer-paper': {
            width: '85%',
            maxWidth: 400
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Notifications
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <TrendingUpIcon color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Content is trending!"
                secondary="Your YouTube video reached 25K views"
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <ScheduleIcon color="warning" />
              </ListItemIcon>
              <ListItemText
                primary="Scheduled post ready"
                secondary="TikTok video scheduled for 4:00 PM"
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <AIIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="AI suggestion available"
                secondary="New content ideas based on trends"
              />
            </ListItem>
          </List>
        </Box>
      </SwipeableDrawer>
    </Box>
  );
};