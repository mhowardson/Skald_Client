import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Badge,
  Popover,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Button,
  Chip,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  Checkbox,
  Alert,
  CircularProgress,
  Avatar
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
  MoreVert as MoreIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  Campaign as CampaignIcon,
  Comment as CommentIcon,
  Settings as SettingsIcon,
  Done as DoneIcon,
  DoneAll as DoneAllIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';

import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useMarkMultipleAsReadMutation,
  useDeleteMultipleNotificationsMutation,
  type Notification
} from '../../store/api/notificationsApi';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && children}
    </div>
  );
};

export const NotificationCenter: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [menuAnchor, setMenuAnchor] = useState<{ element: HTMLElement; notification: Notification } | null>(null);

  // API calls
  const { 
    data: notificationsData, 
    isLoading, 
    error,
    refetch 
  } = useGetNotificationsQuery({
    page: 1,
    limit: 50,
    read: activeTab === 1 ? false : undefined
  });

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();
  const [markMultipleAsRead] = useMarkMultipleAsReadMutation();
  const [deleteMultipleNotifications] = useDeleteMultipleNotificationsMutation();

  // Auto-refresh notifications
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  const handleOpenNotifications = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setAnchorEl(null);
    setSelectedNotifications([]);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setSelectedNotifications([]);
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate to action URL if provided
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead({}).unwrap();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId).unwrap();
      setMenuAnchor(null);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleBulkMarkAsRead = async () => {
    if (selectedNotifications.length === 0) return;

    try {
      await markMultipleAsRead(selectedNotifications).unwrap();
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNotifications.length === 0) return;

    try {
      await deleteMultipleNotifications(selectedNotifications).unwrap();
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Failed to delete notifications:', error);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'content_published':
        return <CheckIcon color="success" />;
      case 'content_failed':
        return <ErrorIcon color="error" />;
      case 'team_invitation':
        return <PersonIcon color="primary" />;
      case 'content_approved':
        return <CheckIcon color="success" />;
      case 'content_rejected':
        return <CloseIcon color="error" />;
      case 'mention':
        return <CampaignIcon color="warning" />;
      case 'comment':
        return <CommentIcon color="info" />;
      case 'system':
        return <SettingsIcon color="action" />;
      case 'billing':
        return <WarningIcon color="warning" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const unreadCount = notificationsData?.unread || 0;
  const notifications = notificationsData?.notifications || [];
  const isSelectionMode = selectedNotifications.length > 0;

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleOpenNotifications}
        sx={{ mr: 1 }}
      >
        <Badge badgeContent={unreadCount} color="error">
          {unreadCount > 0 ? <NotificationsIcon /> : <NotificationsOffIcon />}
        </Badge>
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleCloseNotifications}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { width: 400, maxHeight: 600 }
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Notifications
            </Typography>
            {!isSelectionMode && unreadCount > 0 && (
              <Button
                size="small"
                onClick={handleMarkAllAsRead}
                startIcon={<DoneAllIcon />}
              >
                Mark all read
              </Button>
            )}
            {isSelectionMode && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  onClick={handleBulkMarkAsRead}
                  startIcon={<DoneIcon />}
                >
                  Mark read
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={handleBulkDelete}
                  startIcon={<DeleteIcon />}
                >
                  Delete
                </Button>
              </Box>
            )}
          </Box>

          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ mt: 1 }}
          >
            <Tab label={`All (${notifications.length})`} />
            <Tab label={`Unread (${unreadCount})`} />
          </Tabs>
        </Box>

        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ m: 2 }}>
              Failed to load notifications
            </Alert>
          ) : (
            <>
              <TabPanel value={activeTab} index={0}>
                {notifications.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <NotificationsOffIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography color="text.secondary">
                      No notifications
                    </Typography>
                  </Box>
                ) : (
                  <List disablePadding>
                    {notifications.map((notification) => (
                      <ListItem
                        key={notification.id}
                        sx={{
                          bgcolor: notification.read ? 'transparent' : 'action.hover',
                          borderLeft: notification.read ? 'none' : '3px solid',
                          borderLeftColor: `${getPriorityColor(notification.priority)}.main`,
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: 'action.selected'
                          }
                        }}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        {isSelectionMode && (
                          <Checkbox
                            checked={selectedNotifications.includes(notification.id)}
                            onChange={() => handleSelectNotification(notification.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}

                        <ListItemIcon>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'transparent' }}>
                            {getNotificationIcon(notification.type)}
                          </Avatar>
                        </ListItemIcon>

                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle2" noWrap>
                                {notification.title}
                              </Typography>
                              {notification.priority !== 'low' && (
                                <Chip
                                  label={notification.priority}
                                  size="small"
                                  color={getPriorityColor(notification.priority) as any}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  mb: 0.5
                                }}
                              >
                                {notification.message}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatTimeAgo(notification.createdAt)}
                              </Typography>
                            </Box>
                          }
                        />

                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuAnchor({ element: e.currentTarget, notification });
                            }}
                          >
                            <MoreIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                {notifications.filter(n => !n.read).length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CheckIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                    <Typography color="text.secondary">
                      All caught up!
                    </Typography>
                  </Box>
                ) : (
                  <List disablePadding>
                    {notifications.filter(n => !n.read).map((notification) => (
                      <ListItem
                        key={notification.id}
                        sx={{
                          bgcolor: 'action.hover',
                          borderLeft: '3px solid',
                          borderLeftColor: `${getPriorityColor(notification.priority)}.main`,
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: 'action.selected'
                          }
                        }}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <ListItemIcon>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'transparent' }}>
                            {getNotificationIcon(notification.type)}
                          </Avatar>
                        </ListItemIcon>

                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle2" noWrap>
                                {notification.title}
                              </Typography>
                              {notification.priority !== 'low' && (
                                <Chip
                                  label={notification.priority}
                                  size="small"
                                  color={getPriorityColor(notification.priority) as any}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  mb: 0.5
                                }}
                              >
                                {notification.message}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatTimeAgo(notification.createdAt)}
                              </Typography>
                            </Box>
                          }
                        />

                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuAnchor({ element: e.currentTarget, notification });
                            }}
                          >
                            <MoreIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}
              </TabPanel>
            </>
          )}
        </Box>
      </Popover>

      {/* Notification Context Menu */}
      <Menu
        anchorEl={menuAnchor?.element}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            if (menuAnchor?.notification && !menuAnchor.notification.read) {
              markAsRead(menuAnchor.notification.id);
            }
            setMenuAnchor(null);
          }}
          disabled={menuAnchor?.notification?.read}
        >
          <DoneIcon sx={{ mr: 1 }} />
          Mark as read
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuAnchor?.notification) {
              handleDeleteNotification(menuAnchor.notification.id);
            }
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </>
  );
};