import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Switch,
  FormControlLabel,
  FormGroup,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Email as EmailIcon,
  PhoneAndroid as PushIcon,
  Computer as InAppIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Science as TestIcon,
  Webhook as WebhookIcon,
  Chat as SlackIcon
} from '@mui/icons-material';

import {
  useGetNotificationsQuery,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
  useGetNotificationChannelsQuery,
  useCreateNotificationChannelMutation,
  useUpdateNotificationChannelMutation,
  useDeleteNotificationChannelMutation,
  useTestNotificationChannelMutation,
  useGetNotificationStatsQuery,
  useSendTestNotificationMutation,
  type NotificationChannel,
  type NotificationPreferences
} from '../../store/api/notificationsApi';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

export const NotificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [channelDialog, setChannelDialog] = useState<{
    open: boolean;
    channel?: NotificationChannel;
  }>({ open: false });

  // API calls
  const { data: notificationsData } = useGetNotificationsQuery({ limit: 10 });
  const { data: preferencesData } = useGetNotificationPreferencesQuery();
  const { data: channelsData } = useGetNotificationChannelsQuery();
  const { data: statsData, isLoading: statsLoading } = useGetNotificationStatsQuery({ period: 'week' });

  const [updatePreferences] = useUpdateNotificationPreferencesMutation();
  const [createChannel] = useCreateNotificationChannelMutation();
  const [updateChannel] = useUpdateNotificationChannelMutation();
  const [deleteChannel] = useDeleteNotificationChannelMutation();
  const [testChannel] = useTestNotificationChannelMutation();
  const [sendTestNotification] = useSendTestNotificationMutation();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handlePreferenceChange = async (
    category: keyof NotificationPreferences,
    key: string,
    value: boolean
  ) => {
    try {
      await updatePreferences({
        [category]: {
          [key]: value
        }
      }).unwrap();
    } catch (error) {
      console.error('Failed to update preference:', error);
    }
  };

  const handleTestNotification = async (type: 'email' | 'push' | 'inApp') => {
    try {
      await sendTestNotification({
        type: 'system',
        channels: [type]
      }).unwrap();
    } catch (error) {
      console.error('Failed to send test notification:', error);
    }
  };

  const getChannelIcon = (type: NotificationChannel['type']) => {
    switch (type) {
      case 'email': return <EmailIcon />;
      case 'push': return <PushIcon />;
      case 'webhook': return <WebhookIcon />;
      case 'slack': return <SlackIcon />;
      default: return <NotificationsIcon />;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Notifications
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your notification preferences, channels, and delivery settings
        </Typography>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab 
              label="Overview" 
              icon={<NotificationsIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Preferences" 
              icon={<SettingsIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Channels" 
              icon={<WebhookIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Analytics" 
              icon={<AnalyticsIcon />} 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            {/* Stats Overview */}
            {statsLoading ? (
              <Grid item xs={12}>
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <CircularProgress />
                </Box>
              </Grid>
            ) : statsData && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" color="primary.main">
                        {statsData.total}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Notifications
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" color="warning.main">
                        {statsData.unread}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Unread
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" color="success.main">
                        {(statsData.delivery.deliveryRate * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Delivery Rate
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" color="info.main">
                        {(statsData.delivery.openRate * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Open Rate
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </>
            )}

            {/* Recent Notifications */}
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Notifications
                  </Typography>
                  {notificationsData?.notifications.length ? (
                    <List>
                      {notificationsData.notifications.slice(0, 5).map((notification) => (
                        <ListItem key={notification.id} divider>
                          <ListItemIcon>
                            <NotificationsIcon color={notification.read ? 'disabled' : 'primary'} />
                          </ListItemIcon>
                          <ListItemText
                            primary={notification.title}
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {notification.message}
                                </Typography>
                                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                  <Chip label={notification.type} size="small" />
                                  <Chip label={notification.priority} size="small" color="secondary" />
                                </Box>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography color="text.secondary">
                      No recent notifications
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Actions */}
            <Grid item xs={12} lg={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<TestIcon />}
                      onClick={() => handleTestNotification('email')}
                    >
                      Test Email
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<TestIcon />}
                      onClick={() => handleTestNotification('push')}
                    >
                      Test Push
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<TestIcon />}
                      onClick={() => handleTestNotification('inApp')}
                    >
                      Test In-App
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Preferences Tab */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            {/* Email Preferences */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <EmailIcon color="primary" />
                    <Typography variant="h6">Email Notifications</Typography>
                  </Box>
                  <FormGroup>
                    {preferencesData?.preferences.email && Object.entries(preferencesData.preferences.email).map(([key, value]) => (
                      <FormControlLabel
                        key={key}
                        control={
                          <Switch
                            checked={value}
                            onChange={(e) => handlePreferenceChange('email', key, e.target.checked)}
                          />
                        }
                        label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      />
                    ))}
                  </FormGroup>
                </CardContent>
              </Card>
            </Grid>

            {/* Push Preferences */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <PushIcon color="primary" />
                    <Typography variant="h6">Push Notifications</Typography>
                  </Box>
                  <FormGroup>
                    {preferencesData?.preferences.push && Object.entries(preferencesData.preferences.push).map(([key, value]) => (
                      <FormControlLabel
                        key={key}
                        control={
                          <Switch
                            checked={value}
                            onChange={(e) => handlePreferenceChange('push', key, e.target.checked)}
                          />
                        }
                        label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      />
                    ))}
                  </FormGroup>
                </CardContent>
              </Card>
            </Grid>

            {/* In-App Preferences */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <InAppIcon color="primary" />
                    <Typography variant="h6">In-App Notifications</Typography>
                  </Box>
                  <FormGroup>
                    {preferencesData?.preferences.inApp && Object.entries(preferencesData.preferences.inApp).map(([key, value]) => {
                      if (key === 'quietHours') return null;
                      return (
                        <FormControlLabel
                          key={key}
                          control={
                            <Switch
                              checked={typeof value === 'boolean' ? value : false}
                              onChange={(e) => handlePreferenceChange('inApp', key, e.target.checked)}
                            />
                          }
                          label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        />
                      );
                    })}
                  </FormGroup>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Channels Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Notification Channels</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setChannelDialog({ open: true })}
            >
              Add Channel
            </Button>
          </Box>

          <Grid container spacing={3}>
            {channelsData?.channels.map((channel) => (
              <Grid item xs={12} sm={6} md={4} key={channel.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      {getChannelIcon(channel.type)}
                      <Typography variant="h6">{channel.name}</Typography>
                      <Chip
                        label={channel.enabled ? 'Active' : 'Disabled'}
                        color={channel.enabled ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Type: {channel.type}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button
                        size="small"
                        startIcon={<TestIcon />}
                        onClick={() => testChannel(channel.id)}
                      >
                        Test
                      </Button>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => setChannelDialog({ open: true, channel })}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => deleteChannel(channel.id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={activeTab} index={3}>
          {statsData && (
            <Grid container spacing={3}>
              {/* Notification Types */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Notifications by Type
                    </Typography>
                    {Object.entries(statsData.byType).map(([type, count]) => (
                      <Box key={type} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">{type.replace(/_/g, ' ')}</Typography>
                        <Typography variant="body2" fontWeight="bold">{count}</Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>

              {/* Priority Distribution */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Priority Distribution
                    </Typography>
                    {Object.entries(statsData.byPriority).map(([priority, count]) => (
                      <Box key={priority} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">{priority}</Typography>
                          <Typography variant="body2" fontWeight="bold">{count}</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(count / statsData.total) * 100}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>

              {/* Delivery Performance */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Delivery Performance
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="primary.main">
                            {statsData.delivery.emailsSent}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Emails Sent
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="secondary.main">
                            {statsData.delivery.pushsSent}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Push Notifications
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="success.main">
                            {(statsData.delivery.deliveryRate * 100).toFixed(1)}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Delivery Rate
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="info.main">
                            {(statsData.delivery.clickRate * 100).toFixed(1)}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Click Rate
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </TabPanel>
      </Paper>

      {/* Channel Dialog */}
      <ChannelDialog
        open={channelDialog.open}
        channel={channelDialog.channel}
        onClose={() => setChannelDialog({ open: false })}
        onSave={async (data) => {
          try {
            if (channelDialog.channel) {
              await updateChannel({ id: channelDialog.channel.id, ...data }).unwrap();
            } else {
              await createChannel(data).unwrap();
            }
            setChannelDialog({ open: false });
          } catch (error) {
            console.error('Failed to save channel:', error);
          }
        }}
      />
    </Container>
  );
};

// Channel Dialog Component
interface ChannelDialogProps {
  open: boolean;
  channel?: NotificationChannel;
  onClose: () => void;
  onSave: (data: any) => void;
}

const ChannelDialog: React.FC<ChannelDialogProps> = ({
  open,
  channel,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'email' as NotificationChannel['type'],
    config: {},
    enabled: true
  });

  React.useEffect(() => {
    if (channel) {
      setFormData({
        name: channel.name,
        type: channel.type,
        config: channel.config,
        enabled: channel.enabled
      });
    } else {
      setFormData({
        name: '',
        type: 'email',
        config: {},
        enabled: true
      });
    }
  }, [channel]);

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {channel ? 'Edit Channel' : 'Create Channel'}
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Channel Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          sx={{ mb: 2, mt: 1 }}
        />
        
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as NotificationChannel['type'] })}
            label="Type"
          >
            <MenuItem value="email">Email</MenuItem>
            <MenuItem value="webhook">Webhook</MenuItem>
            <MenuItem value="slack">Slack</MenuItem>
            <MenuItem value="teams">Microsoft Teams</MenuItem>
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
            />
          }
          label="Enabled"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {channel ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};