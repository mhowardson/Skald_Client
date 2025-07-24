/**
 * Social Content Creation Page
 * 
 * Comprehensive content creation interface that includes platform-specific
 * upload components, with dedicated support for TikTok video uploads.
 * 
 * @page SocialContentCreationPage
 * @version 1.0.0
 * 
 * @features
 * - Platform-specific content creation tabs
 * - TikTok video upload with analytics preview
 * - Multi-platform content publishing
 * - Real-time preview and validation
 * - Draft saving and scheduling
 * 
 * @routes
 * - /content/social - Main social content creation interface
 * 
 * @components
 * - TikTokVideoUpload - Dedicated TikTok video upload component
 * - TikTokAnalytics - TikTok performance analytics
 * - CreateContentDialog - General content creation dialog
 * - ConnectPlatformDialog - Platform connection interface
 */

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Tabs,
  Tab,
  Alert,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Divider,
  Avatar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  VideoLibrary as VideoIcon,
  Analytics as AnalyticsIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  Launch as LaunchIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as ConnectedIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { useTenant } from '../../contexts/TenantContext';
import {
  useGetPlatformConnectionsQuery,
  useGetPlatformStatsQuery,
  type SocialPlatformConnection,
} from '../../store/api/socialPlatformsApi';
import { CreateContentDialog } from '../../components/content/CreateContentDialog';
import { ConnectPlatformDialog } from '../../components/integrations/ConnectPlatformDialog';
import TikTokVideoUpload from '../../components/social/TikTokVideoUpload';
import TikTokAnalytics from '../../components/social/TikTokAnalytics';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`platform-tabpanel-${index}`}
      aria-labelledby={`platform-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const platformConfig = {
  tiktok: {
    name: 'TikTok',
    color: '#000000',
    icon: '🎵',
    description: 'Create and upload short-form videos',
    features: ['Video Upload', 'Analytics', 'Hashtag Optimization'],
  },
  instagram: {
    name: 'Instagram',
    color: '#E4405F',
    icon: '📷',
    description: 'Share visual content and stories',
    features: ['Photo Upload', 'Story Creation', 'Reel Publishing'],
  },
  linkedin: {
    name: 'LinkedIn',
    color: '#0077B5',
    icon: '💼',
    description: 'Professional content and networking',
    features: ['Text Posts', 'Article Publishing', 'Professional Updates'],
  },
  twitter: {
    name: 'Twitter',
    color: '#1DA1F2',
    icon: '🐦',
    description: 'Real-time updates and conversations',
    features: ['Tweet Threads', 'Media Sharing', 'Engagement Tracking'],
  },
  facebook: {
    name: 'Facebook',
    color: '#1877F2',
    icon: '📘',
    description: 'Community engagement and sharing',
    features: ['Page Posts', 'Event Creation', 'Community Management'],
  },
  youtube: {
    name: 'YouTube',
    color: '#FF0000',
    icon: '📺',
    description: 'Long-form video content',
    features: ['Video Upload', 'Channel Management', 'Analytics'],
  },
};

export const SocialContentCreationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedConnection, setSelectedConnection] = useState<SocialPlatformConnection | null>(null);
  const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false);

  const { currentWorkspace } = useTenant();
  const { data: connectionsData, isLoading: connectionsLoading } = useGetPlatformConnectionsQuery();
  const { data: statsData } = useGetPlatformStatsQuery();

  // Filter connections to get available platforms
  const connectedPlatforms = connectionsData?.connections || [];
  const tiktokConnections = connectedPlatforms.filter(conn => conn.platform === 'tiktok');
  const hasAnyConnections = connectedPlatforms.length > 0;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleConnectPlatform = (platform?: string) => {
    if (platform) {
      setSelectedPlatform(platform);
    }
    setConnectDialogOpen(true);
  };

  const handleUploadSuccess = (result: any) => {
    console.log('Upload successful:', result);
    // You could show a success notification here
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
    // You could show an error notification here
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, connection: SocialPlatformConnection) => {
    setMenuAnchor(event.currentTarget);
    setSelectedConnection(connection);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedConnection(null);
  };

  const handleViewAnalytics = () => {
    setAnalyticsDialogOpen(true);
    handleMenuClose();
  };

  const tabs = [
    { label: 'All Platforms', icon: <AddIcon /> },
    { label: 'TikTok', icon: '🎵', disabled: tiktokConnections.length === 0 },
    { label: 'Instagram', icon: '📷', disabled: !connectedPlatforms.find(c => c.platform === 'instagram') },
    { label: 'LinkedIn', icon: '💼', disabled: !connectedPlatforms.find(c => c.platform === 'linkedin') },
    { label: 'Twitter', icon: '🐦', disabled: !connectedPlatforms.find(c => c.platform === 'twitter') },
  ];

  if (connectionsLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Social Content Creation
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create, schedule, and publish content across your connected social media platforms
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ScheduleIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Schedule Content
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleConnectPlatform()}
          >
            Connect Platform
          </Button>
        </Box>
      </Box>

      {/* Platform Overview Cards */}
      {hasAnyConnections && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {connectedPlatforms.slice(0, 6).map((connection) => {
            const config = platformConfig[connection.platform as keyof typeof platformConfig];
            const stats = statsData?.stats?.find(s => s.platform === connection.platform);
            
            return (
              <Grid item xs={12} sm={6} md={4} lg={2} key={connection.id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Avatar
                        src={connection.profileImageUrl}
                        sx={{ 
                          bgcolor: config?.color,
                          width: 32,
                          height: 32,
                          fontSize: 16
                        }}
                      >
                        {config?.icon}
                      </Avatar>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, connection)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    
                    <Typography variant="subtitle2" fontWeight="bold" noWrap>
                      {connection.accountName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      @{connection.accountHandle}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                      {connection.isActive ? (
                        <ConnectedIcon color="success" fontSize="small" />
                      ) : (
                        <ErrorIcon color="error" fontSize="small" />
                      )}
                      <Typography variant="caption" sx={{ ml: 0.5 }}>
                        {connection.isActive ? 'Active' : 'Inactive'}
                      </Typography>
                    </Box>

                    {stats && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {stats.totalPosts} posts
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {stats.totalEngagement} engagement
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* No Connections State */}
      {!hasAnyConnections && (
        <Card sx={{ mb: 4, textAlign: 'center', p: 4 }}>
          <Typography variant="h6" gutterBottom>
            No Social Media Accounts Connected
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Connect your social media accounts to start creating and publishing content
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => handleConnectPlatform()}
          >
            Connect Your First Platform
          </Button>
        </Card>
      )}

      {/* Platform Tabs */}
      {hasAnyConnections && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="platform tabs">
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                label={tab.label}
                icon={typeof tab.icon === 'string' ? <span>{tab.icon}</span> : tab.icon}
                disabled={tab.disabled}
                iconPosition="start"
              />
            ))}
          </Tabs>
        </Box>
      )}

      {/* Tab Content */}
      {hasAnyConnections && (
        <>
          {/* All Platforms Tab */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              {Object.entries(platformConfig).map(([platform, config]) => {
                const connections = connectedPlatforms.filter(c => c.platform === platform);
                const isConnected = connections.length > 0;
                
                return (
                  <Grid item xs={12} md={6} lg={4} key={platform}>
                    <Card sx={{ height: '100%' }}>
                      <CardHeader
                        avatar={<Typography variant="h4">{config.icon}</Typography>}
                        title={config.name}
                        subheader={config.description}
                        action={
                          isConnected ? (
                            <Chip label="Connected" color="success" size="small" />
                          ) : (
                            <Button
                              size="small"
                              onClick={() => handleConnectPlatform(platform)}
                            >
                              Connect
                            </Button>
                          )
                        }
                      />
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>
                          Features:
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          {config.features.map((feature) => (
                            <Chip
                              key={feature}
                              label={feature}
                              size="small"
                              variant="outlined"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                        {isConnected && (
                          <Button
                            fullWidth
                            variant="contained"
                            sx={{ bgcolor: config.color, '&:hover': { bgcolor: config.color } }}
                            onClick={() => {
                              // Navigate to platform-specific tab
                              const tabIndex = tabs.findIndex(t => t.label === config.name);
                              if (tabIndex > 0) setActiveTab(tabIndex);
                            }}
                          >
                            Create Content
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </TabPanel>

          {/* TikTok Tab */}
          <TabPanel value={activeTab} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <TikTokVideoUpload
                  connections={tiktokConnections.map(conn => ({
                    id: conn.id,
                    accountName: conn.accountName,
                    accountHandle: conn.accountHandle,
                    profileImageUrl: conn.profileImageUrl,
                    followerCount: conn.metadata.followerCount,
                    isActive: conn.isActive,
                  }))}
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={handleUploadError}
                />
              </Grid>
              
              <Grid item xs={12} lg={4}>
                <Card>
                  <CardHeader
                    title="TikTok Best Practices"
                    avatar={<TrendingIcon color="primary" />}
                  />
                  <CardContent>
                    <Typography variant="body2" paragraph>
                      <strong>Optimal Posting Times:</strong><br />
                      Tuesday-Thursday, 6-10 PM
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Video Length:</strong><br />
                      15-30 seconds for maximum engagement
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Trending Hashtags:</strong><br />
                      Use 3-5 relevant trending hashtags
                    </Typography>
                    <Typography variant="body2">
                      <strong>Content Tips:</strong><br />
                      • Hook viewers in first 3 seconds<br />
                      • Use vertical 9:16 aspect ratio<br />
                      • Add captions for accessibility<br />
                      • Include trending sounds
                    </Typography>
                  </CardContent>
                </Card>

                {tiktokConnections.length > 0 && (
                  <Card sx={{ mt: 2 }}>
                    <CardHeader
                      title="Quick Analytics"
                      action={
                        <IconButton onClick={handleViewAnalytics}>
                          <AnalyticsIcon />
                        </IconButton>
                      }
                    />
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        View detailed analytics for your TikTok performance
                      </Typography>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<AnalyticsIcon />}
                        onClick={handleViewAnalytics}
                        sx={{ mt: 2 }}
                      >
                        View Full Analytics
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </Grid>
            </Grid>
          </TabPanel>

          {/* Other Platform Tabs */}
          {tabs.slice(2).map((tab, index) => (
            <TabPanel value={activeTab} index={index + 2} key={tab.label}>
              <Alert severity="info" sx={{ mb: 3 }}>
                {tab.label} content creation interface coming soon. For now, use the general content creator.
              </Alert>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
              >
                Create {tab.label} Content
              </Button>
            </TabPanel>
          ))}
        </>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewAnalytics}>
          <ListItemIcon>
            <AnalyticsIcon />
          </ListItemIcon>
          <ListItemText primary="View Analytics" />
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <RefreshIcon />
          </ListItemIcon>
          <ListItemText primary="Refresh Connection" />
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </MenuItem>
      </Menu>

      {/* TikTok Analytics Dialog */}
      <Dialog
        open={analyticsDialogOpen}
        onClose={() => setAnalyticsDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>TikTok Analytics</DialogTitle>
        <DialogContent>
          {selectedConnection && (
            <TikTokAnalytics
              connectionId={selectedConnection.id}
              timeframe="30d"
              onInsightClick={(insight) => console.log('Insight clicked:', insight)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnalyticsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Dialogs */}
      <CreateContentDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={() => setCreateDialogOpen(false)}
      />

      <ConnectPlatformDialog
        open={connectDialogOpen}
        onClose={() => setConnectDialogOpen(false)}
        preselectedPlatform={selectedPlatform}
      />
    </Container>
  );
};