/**
 * Announcement Center Component
 * 
 * A dedicated view for managing and viewing all feature announcements.
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  Chip,
  Stack,
  Divider,
  Alert
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  MarkAsUnread as MarkAsUnreadIcon,
  DoneAll as DoneAllIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { FeatureAnnouncementBanner } from './FeatureAnnouncementBanner';
import { useFeatureAnnouncements } from '../../hooks/useFeatureAnnouncements';

interface AnnouncementCenterProps {
  open: boolean;
  onClose: () => void;
}

type AnnouncementFilter = 'all' | 'new_feature' | 'improvement' | 'bug_fix' | 'announcement';

export const AnnouncementCenter: React.FC<AnnouncementCenterProps> = ({
  open,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<AnnouncementFilter>('all');
  const {
    announcements,
    unreadCount,
    isLoading,
    error,
    dismissAnnouncement,
    markAsRead,
    markAllAsRead,
    refreshAnnouncements,
    getAnnouncementsByType
  } = useFeatureAnnouncements();

  const handleTabChange = (event: React.SyntheticEvent, newValue: AnnouncementFilter) => {
    setActiveTab(newValue);
  };

  const handleAnnouncementAction = (announcementId: string) => {
    markAsRead(announcementId);
  };

  const handleRefresh = async () => {
    await refreshAnnouncements();
  };

  const getFilteredAnnouncements = () => {
    if (activeTab === 'all') {
      return announcements;
    }
    return getAnnouncementsByType(activeTab);
  };

  const filteredAnnouncements = getFilteredAnnouncements();

  const tabCounts = {
    all: announcements.length,
    new_feature: getAnnouncementsByType('new_feature').length,
    improvement: getAnnouncementsByType('improvement').length,
    bug_fix: getAnnouncementsByType('bug_fix').length,
    announcement: getAnnouncementsByType('announcement').length
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '80vh', maxHeight: 800 }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
            <Typography variant="h6">
              Feature Announcements
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              size="small"
              onClick={handleRefresh}
              disabled={isLoading}
              title="Refresh announcements"
            >
              <RefreshIcon />
            </IconButton>
            {unreadCount > 0 && (
              <Button
                size="small"
                startIcon={<DoneAllIcon />}
                onClick={markAllAsRead}
                variant="outlined"
              >
                Mark All Read
              </Button>
            )}
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Filter Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  All
                  <Chip label={tabCounts.all} size="small" />
                </Box>
              }
              value="all"
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  New Features
                  <Chip label={tabCounts.new_feature} size="small" color="primary" />
                </Box>
              }
              value="new_feature"
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Improvements
                  <Chip label={tabCounts.improvement} size="small" color="secondary" />
                </Box>
              }
              value="improvement"
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Bug Fixes
                  <Chip label={tabCounts.bug_fix} size="small" color="warning" />
                </Box>
              }
              value="bug_fix"
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Announcements
                  <Chip label={tabCounts.announcement} size="small" color="info" />
                </Box>
              }
              value="announcement"
            />
          </Tabs>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {isLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                Loading announcements...
              </Typography>
            </Box>
          ) : filteredAnnouncements.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                {activeTab === 'all' 
                  ? 'No announcements to show' 
                  : `No ${activeTab.replace('_', ' ')} announcements`
                }
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {filteredAnnouncements.map((announcement) => (
                <FeatureAnnouncementBanner
                  key={announcement.id}
                  announcement={{ ...announcement, isExpanded: false }}
                  onDismiss={dismissAnnouncement}
                  onAction={handleAnnouncementAction}
                  showAnimation={false}
                />
              ))}
            </Stack>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
          {filteredAnnouncements.length} {filteredAnnouncements.length === 1 ? 'announcement' : 'announcements'}
          {unreadCount > 0 && (
            <>, {unreadCount} unread</>
          )}
        </Typography>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Announcement Center Trigger Component
interface AnnouncementCenterTriggerProps {
  variant?: 'icon' | 'button';
  showBadge?: boolean;
}

export const AnnouncementCenterTrigger: React.FC<AnnouncementCenterTriggerProps> = ({
  variant = 'icon',
  showBadge = true
}) => {
  const [open, setOpen] = useState(false);
  const { unreadCount } = useFeatureAnnouncements();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  if (variant === 'button') {
    return (
      <>
        <Button
          variant="outlined"
          startIcon={
            showBadge ? (
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            ) : (
              <NotificationsIcon />
            )
          }
          onClick={handleOpen}
        >
          Announcements
        </Button>
        <AnnouncementCenter open={open} onClose={handleClose} />
      </>
    );
  }

  return (
    <>
      <IconButton
        onClick={handleOpen}
        color="inherit"
        title="View announcements"
      >
        {showBadge ? (
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        ) : (
          <NotificationsIcon />
        )}
      </IconButton>
      <AnnouncementCenter open={open} onClose={handleClose} />
    </>
  );
};