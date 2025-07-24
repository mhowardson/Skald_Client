/**
 * Feature Announcement Banner Component
 * 
 * Displays new feature announcements and updates to users.
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  Avatar,
  Slide,
  Collapse,
  Stack
} from '@mui/material';
import {
  Close as CloseIcon,
  NewReleases as NewIcon,
  Update as UpdateIcon,
  BugReport as BugIcon,
  Info as InfoIcon,
  Launch as LaunchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

export interface FeatureAnnouncement {
  id: string;
  title: string;
  description: string;
  type: 'new_feature' | 'improvement' | 'bug_fix' | 'announcement';
  priority: 'low' | 'medium' | 'high';
  version?: string;
  date: Date;
  actionText?: string;
  actionUrl?: string;
  imageUrl?: string;
  tags?: string[];
  isExpanded?: boolean;
}

interface FeatureAnnouncementBannerProps {
  announcement: FeatureAnnouncement;
  onDismiss: (announcementId: string) => void;
  onAction?: (announcementId: string) => void;
  showAnimation?: boolean;
}

const getAnnouncementIcon = (type: FeatureAnnouncement['type']) => {
  switch (type) {
    case 'new_feature':
      return <NewIcon />;
    case 'improvement':
      return <UpdateIcon />;
    case 'bug_fix':
      return <BugIcon />;
    default:
      return <InfoIcon />;
  }
};

const getAnnouncementColor = (type: FeatureAnnouncement['type']) => {
  switch (type) {
    case 'new_feature':
      return '#10b981'; // Green
    case 'improvement':
      return '#6366f1'; // Purple
    case 'bug_fix':
      return '#f59e0b'; // Amber
    default:
      return '#6b7280'; // Gray
  }
};

const getPriorityColor = (priority: FeatureAnnouncement['priority']) => {
  switch (priority) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    default:
      return 'info';
  }
};

export const FeatureAnnouncementBanner: React.FC<FeatureAnnouncementBannerProps> = ({
  announcement,
  onDismiss,
  onAction,
  showAnimation = true
}) => {
  const [isExpanded, setIsExpanded] = useState(announcement.isExpanded || false);
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss(announcement.id);
    }, 300); // Wait for animation to complete
  };

  const handleAction = () => {
    if (onAction) {
      onAction(announcement.id);
    }
    if (announcement.actionUrl) {
      window.open(announcement.actionUrl, '_blank');
    }
  };

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const announcementContent = (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        mb: 2,
        border: `2px solid ${getAnnouncementColor(announcement.type)}`,
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Priority indicator */}
      {announcement.priority === 'high' && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: 'error.main',
            animation: 'pulse 2s infinite'
          }}
        />
      )}

      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        {/* Icon */}
        <Avatar
          sx={{
            bgcolor: getAnnouncementColor(announcement.type),
            width: 40,
            height: 40
          }}
        >
          {getAnnouncementIcon(announcement.type)}
        </Avatar>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
              {announcement.title}
            </Typography>
            
            {announcement.version && (
              <Chip
                label={`v${announcement.version}`}
                size="small"
                color={getPriorityColor(announcement.priority)}
                variant="outlined"
              />
            )}
            
            <Chip
              label={announcement.type.replace('_', ' ')}
              size="small"
              sx={{ 
                bgcolor: getAnnouncementColor(announcement.type),
                color: 'white',
                textTransform: 'capitalize'
              }}
            />
          </Box>

          {/* Description */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: isExpanded ? 2 : 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: isExpanded ? 'none' : 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {announcement.description}
          </Typography>

          {/* Expandable Content */}
          <Collapse in={isExpanded}>
            <Box sx={{ mb: 2 }}>
              {/* Tags */}
              {announcement.tags && announcement.tags.length > 0 && (
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  {announcement.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              )}

              {/* Image */}
              {announcement.imageUrl && (
                <Box
                  component="img"
                  src={announcement.imageUrl}
                  alt={announcement.title}
                  sx={{
                    width: '100%',
                    maxWidth: 400,
                    height: 'auto',
                    borderRadius: 1,
                    mb: 2
                  }}
                />
              )}

              {/* Date */}
              <Typography variant="caption" color="text.secondary">
                Released: {announcement.date.toLocaleDateString()}
              </Typography>
            </Box>
          </Collapse>

          {/* Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {announcement.actionText && (
              <Button
                variant="contained"
                size="small"
                onClick={handleAction}
                endIcon={<LaunchIcon />}
                sx={{ bgcolor: getAnnouncementColor(announcement.type) }}
              >
                {announcement.actionText}
              </Button>
            )}
            
            <Button
              variant="text"
              size="small"
              onClick={handleToggleExpanded}
              endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            >
              {isExpanded ? 'Show Less' : 'Show More'}
            </Button>
          </Box>
        </Box>

        {/* Close Button */}
        <IconButton
          size="small"
          onClick={handleDismiss}
          sx={{ color: 'text.secondary' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  );

  if (!showAnimation) {
    return isVisible ? announcementContent : null;
  }

  return (
    <Slide direction="down" in={isVisible} mountOnEnter unmountOnExit>
      {announcementContent}
    </Slide>
  );
};