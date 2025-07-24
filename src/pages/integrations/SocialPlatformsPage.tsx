import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  CheckCircle as ConnectedIcon,
  Error as ErrorIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

import {
  useGetPlatformConnectionsQuery,
  useGetPlatformStatsQuery,
  useDisconnectPlatformMutation,
  useRefreshConnectionMutation,
  useTestConnectionMutation,
  type SocialPlatformConnection
} from '../../store/api/socialPlatformsApi';
import { ConnectPlatformDialog } from '../../components/integrations/ConnectPlatformDialog';
import { PlatformStatsCard } from '../../components/integrations/PlatformStatsCard';

const platformConfig = {
  linkedin: {
    name: 'LinkedIn',
    color: '#0077B5',
    icon: '💼',
    description: 'Professional networking and B2B content'
  },
  twitter: {
    name: 'Twitter',
    color: '#1DA1F2', 
    icon: '🐦',
    description: 'Real-time updates and conversations'
  },
  facebook: {
    name: 'Facebook',
    color: '#1877F2',
    icon: '📘',
    description: 'Social networking and community engagement'
  },
  instagram: {
    name: 'Instagram',
    color: '#E4405F',
    icon: '📷',
    description: 'Visual content and stories'
  },
  youtube: {
    name: 'YouTube',
    color: '#FF0000',
    icon: '📺',
    description: 'Video content and channel management'
  },
  tiktok: {
    name: 'TikTok',
    color: '#000000',
    icon: '🎵',
    description: 'Short-form video content'
  }
};

export const SocialPlatformsPage: React.FC = () => {
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedConnection, setSelectedConnection] = useState<SocialPlatformConnection | null>(null);
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);

  const { data: connectionsData, isLoading: connectionsLoading } = useGetPlatformConnectionsQuery();
  const { data: statsData, isLoading: statsLoading } = useGetPlatformStatsQuery();
  const [disconnectPlatform, { isLoading: isDisconnecting }] = useDisconnectPlatformMutation();
  const [refreshConnection, { isLoading: isRefreshing }] = useRefreshConnectionMutation();
  const [testConnection, { isLoading: isTesting }] = useTestConnectionMutation();

  const handleConnectPlatform = (platform: string) => {
    setSelectedPlatform(platform);
    setConnectDialogOpen(true);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, connection: SocialPlatformConnection) => {
    setMenuAnchor(event.currentTarget);
    setSelectedConnection(connection);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedConnection(null);
  };

  const handleDisconnect = () => {
    setDisconnectDialogOpen(true);
    handleMenuClose();
  };

  const handleRefresh = async () => {
    if (!selectedConnection) return;
    
    try {
      await refreshConnection(selectedConnection.id).unwrap();
    } catch (error) {
      console.error('Failed to refresh connection:', error);
    }
    handleMenuClose();
  };

  const handleTest = async () => {
    if (!selectedConnection) return;
    
    try {
      await testConnection(selectedConnection.id).unwrap();
    } catch (error) {
      console.error('Failed to test connection:', error);
    }
    handleMenuClose();
  };

  const confirmDisconnect = async () => {
    if (!selectedConnection) return;

    try {
      await disconnectPlatform(selectedConnection.id).unwrap();
      setDisconnectDialogOpen(false);
      setSelectedConnection(null);
    } catch (error) {
      console.error('Failed to disconnect platform:', error);
    }
  };

  const getConnectedPlatforms = () => {
    return connectionsData?.connections.map(c => c.platform) || [];
  };

  const getAvailablePlatforms = () => {
    const connected = getConnectedPlatforms();
    return Object.keys(platformConfig).filter(platform => !connected.includes(platform as any));
  };

  const formatLastSync = (date?: string) => {
    if (!date) return 'Never';
    return format(new Date(date), 'MMM d, yyyy HH:mm');
  };

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
            Social Media Integrations
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Connect and manage your social media accounts for seamless content publishing
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setConnectDialogOpen(true)}
          size="large"
          disabled={getAvailablePlatforms().length === 0}
        >
          Connect Platform
        </Button>
      </Box>

      {/* Platform Stats Overview */}
      {!statsLoading && statsData?.stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsData.stats.map((stat) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={stat.platform}>
              <PlatformStatsCard stat={stat} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Available Platforms to Connect */}
      {getAvailablePlatforms().length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Available Platforms
          </Typography>
          <Grid container spacing={2}>
            {getAvailablePlatforms().map((platform) => {
              const config = platformConfig[platform as keyof typeof platformConfig];
              return (
                <Grid item xs={12} sm={6} md={4} key={platform}>
                  <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Typography variant="h4">{config.icon}</Typography>
                        <Box>
                          <Typography variant="h6" fontWeight="bold">
                            {config.name}
                          </Typography>
                          <Chip
                            label="Not Connected"
                            size="small"
                            variant="outlined"
                            color="default"
                          />
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {config.description}
                      </Typography>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => handleConnectPlatform(platform)}
                        sx={{ bgcolor: config.color, '&:hover': { bgcolor: config.color } }}
                      >
                        Connect {config.name}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Connected Platforms */}
      {connectionsData?.connections && connectionsData.connections.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Connected Platforms
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Account</TableCell>
                  <TableCell>Platform</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Connected</TableCell>
                  <TableCell>Last Sync</TableCell>
                  <TableCell>Followers</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {connectionsData.connections.map((connection) => {
                  const config = platformConfig[connection.platform];
                  return (
                    <TableRow key={connection.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            src={connection.profileImageUrl}
                            sx={{ 
                              bgcolor: config.color,
                              width: 40,
                              height: 40
                            }}
                          >
                            {config.icon}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="medium">
                              {connection.accountName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              @{connection.accountHandle}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={config.name}
                          size="small"
                          sx={{
                            bgcolor: config.color + '20',
                            color: config.color,
                            fontWeight: 'medium'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {connection.isActive ? (
                            <>
                              <ConnectedIcon color="success" fontSize="small" />
                              <Typography variant="body2" color="success.main">
                                Active
                              </Typography>
                            </>
                          ) : (
                            <>
                              <ErrorIcon color="error" fontSize="small" />
                              <Typography variant="body2" color="error.main">
                                Inactive
                              </Typography>
                            </>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {format(new Date(connection.connectedAt), 'MMM d, yyyy')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatLastSync(connection.lastSyncAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {connection.metadata.followerCount?.toLocaleString() || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, connection)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Empty State */}
      {connectionsData?.connections.length === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No social media accounts connected
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Connect your social media accounts to start publishing content across multiple platforms
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => setConnectDialogOpen(true)}
          >
            Connect Your First Platform
          </Button>
        </Paper>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleRefresh} disabled={isRefreshing}>
          <ListItemIcon>
            <RefreshIcon />
          </ListItemIcon>
          <ListItemText primary={isRefreshing ? 'Refreshing...' : 'Refresh Connection'} />
        </MenuItem>
        <MenuItem onClick={handleTest} disabled={isTesting}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary={isTesting ? 'Testing...' : 'Test Connection'} />
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <AnalyticsIcon />
          </ListItemIcon>
          <ListItemText primary="View Analytics" />
        </MenuItem>
        <MenuItem onClick={handleDisconnect} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText primary="Disconnect" />
        </MenuItem>
      </Menu>

      {/* Connect Platform Dialog */}
      <ConnectPlatformDialog
        open={connectDialogOpen}
        onClose={() => setConnectDialogOpen(false)}
        preselectedPlatform={selectedPlatform}
      />

      {/* Disconnect Confirmation Dialog */}
      <Dialog open={disconnectDialogOpen} onClose={() => setDisconnectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Disconnect Platform
        </DialogTitle>
        <DialogContent>
          {selectedConnection && (
            <Alert severity="warning">
              <Typography variant="body1" gutterBottom>
                Disconnect {selectedConnection.accountName} from {platformConfig[selectedConnection.platform].name}?
              </Typography>
              <Typography variant="body2">
                You won't be able to publish content to this account until you reconnect it. 
                Scheduled posts will be cancelled.
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDisconnectDialogOpen(false)}>
            Keep Connected
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDisconnect}
            disabled={isDisconnecting}
          >
            {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};