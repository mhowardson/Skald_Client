import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Grid,
  Paper,
  Chip,
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge
} from '@mui/material';
import {
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  Add as AddIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  Publish as PublishIcon,
  Edit as EditIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';

interface ContentItem {
  id: string;
  title: string;
  description?: string;
  platform: string;
  type: 'post' | 'story' | 'reel' | 'video';
  status: 'published' | 'scheduled' | 'draft';
  publishedDate?: string;
  scheduledDate?: string;
  thumbnailUrl?: string;
  mediaUrl?: string;
  metrics?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    engagementRate?: number;
    reachImpact?: 'low' | 'medium' | 'high';
  };
}

interface ContentCalendarProps {
  content: ContentItem[];
  onDateClick?: (date: Date) => void;
  onContentClick?: (content: ContentItem) => void;
  onCreateContent?: (date: Date) => void;
}

const platformColors: Record<string, string> = {
  instagram: '#E4405F',
  twitter: '#1DA1F2',
  linkedin: '#0077B5',
  youtube: '#FF0000',
  tiktok: '#000000',
  facebook: '#1877F2'
};

const platformIcons: Record<string, string> = {
  instagram: '📷',
  twitter: '🐦',
  linkedin: '💼',
  youtube: '📺',
  tiktok: '🎵',
  facebook: '👥'
};

export const ContentCalendar: React.FC<ContentCalendarProps> = ({
  content,
  onDateClick,
  onContentClick,
  onCreateContent
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dayDetailsOpen, setDayDetailsOpen] = useState(false);

  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Get content organized by date
  const getContentForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return content.filter(item => {
      const itemDate = item.scheduledDate || item.publishedDate;
      return itemDate && itemDate.split('T')[0] === dateStr;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setDayDetailsOpen(true);
    onDateClick?.(date);
  };

  const renderCalendarDay = (dayNumber: number) => {
    const date = new Date(currentYear, currentMonth, dayNumber);
    const dayContent = getContentForDate(date);
    const isToday = date.toDateString() === today.toDateString();
    const isPastDate = date < today;
    
    const publishedCount = dayContent.filter(c => c.status === 'published').length;
    const scheduledCount = dayContent.filter(c => c.status === 'scheduled').length;
    const draftCount = dayContent.filter(c => c.status === 'draft').length;

    return (
      <Paper
        key={dayNumber}
        sx={{
          p: 1,
          minHeight: 120,
          cursor: 'pointer',
          border: isToday ? 2 : 1,
          borderColor: isToday ? 'primary.main' : 'divider',
          bgcolor: isPastDate ? 'action.hover' : 'background.paper',
          '&:hover': {
            bgcolor: 'action.selected'
          }
        }}
        onClick={() => handleDateClick(date)}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography
            variant="body2"
            fontWeight={isToday ? 'bold' : 'normal'}
            color={isToday ? 'primary' : 'text.primary'}
          >
            {dayNumber}
          </Typography>
          
          {dayContent.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {publishedCount > 0 && (
                <Badge badgeContent={publishedCount} color="success">
                  <PublishIcon fontSize="small" />
                </Badge>
              )}
              {scheduledCount > 0 && (
                <Badge badgeContent={scheduledCount} color="warning">
                  <ScheduleIcon fontSize="small" />
                </Badge>
              )}
              {draftCount > 0 && (
                <Badge badgeContent={draftCount} color="default">
                  <EditIcon fontSize="small" />
                </Badge>
              )}
            </Box>
          )}
        </Box>

        {/* Content items for this day */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {dayContent.slice(0, 3).map((item) => (
            <Tooltip key={item.id} title={item.title}>
              <Chip
                size="small"
                label={`${platformIcons[item.platform]} ${item.title.substring(0, 15)}${item.title.length > 15 ? '...' : ''}`}
                sx={{
                  bgcolor: platformColors[item.platform],
                  color: 'white',
                  fontSize: '0.7rem',
                  height: 20,
                  '& .MuiChip-label': {
                    px: 0.5
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onContentClick?.(item);
                }}
              />
            </Tooltip>
          ))}
          
          {dayContent.length > 3 && (
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
              +{dayContent.length - 3} more
            </Typography>
          )}
        </Box>

        {/* Add content button for future dates */}
        {!isPastDate && dayContent.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onCreateContent?.(date);
              }}
              sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Paper>
    );
  };

  const renderEmptyDay = (key: string) => (
    <Paper
      key={key}
      sx={{
        p: 1,
        minHeight: 120,
        bgcolor: 'action.disabled',
        opacity: 0.3
      }}
    />
  );

  const selectedDateContent = selectedDate ? getContentForDate(selectedDate) : [];

  return (
    <Box>
      {/* Calendar Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Typography>
        <Box>
          <IconButton onClick={() => navigateMonth('prev')}>
            <PrevIcon />
          </IconButton>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setCurrentDate(new Date())}
            sx={{ mx: 1 }}
          >
            Today
          </Button>
          <IconButton onClick={() => navigateMonth('next')}>
            <NextIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Calendar Legend */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <PublishIcon fontSize="small" color="success" />
          <Typography variant="caption">Published</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <ScheduleIcon fontSize="small" color="warning" />
          <Typography variant="caption">Scheduled</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <EditIcon fontSize="small" color="action" />
          <Typography variant="caption">Draft</Typography>
        </Box>
      </Box>

      {/* Days of week header */}
      <Grid container spacing={1} sx={{ mb: 1 }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <Grid item xs key={day}>
            <Typography variant="subtitle2" textAlign="center" color="text.secondary">
              {day}
            </Typography>
          </Grid>
        ))}
      </Grid>

      {/* Calendar Grid */}
      <Grid container spacing={1}>
        {/* Empty cells for days before the first day of the month */}
        {Array.from({ length: startingDayOfWeek }, (_, i) => (
          <Grid item xs key={`empty-${i}`}>
            {renderEmptyDay(`empty-${i}`)}
          </Grid>
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }, (_, i) => (
          <Grid item xs key={i + 1}>
            {renderCalendarDay(i + 1)}
          </Grid>
        ))}
      </Grid>

      {/* Day Details Dialog */}
      <Dialog
        open={dayDetailsOpen}
        onClose={() => setDayDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <EventIcon />
            <Typography variant="h6">
              {selectedDate?.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          {selectedDateContent.length > 0 ? (
            <List>
              {selectedDateContent.map((item) => (
                <ListItem
                  key={item.id}
                  button
                  onClick={() => onContentClick?.(item)}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1
                  }}
                >
                  <ListItemIcon>
                    <Avatar
                      sx={{
                        bgcolor: platformColors[item.platform],
                        width: 32,
                        height: 32
                      }}
                    >
                      {platformIcons[item.platform]}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          {item.platform} • {item.type}
                        </Typography>
                        <Chip
                          label={item.status}
                          size="small"
                          color={
                            item.status === 'published' ? 'success' :
                            item.status === 'scheduled' ? 'warning' : 'default'
                          }
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    }
                  />
                  {item.metrics && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <TrendingIcon fontSize="small" color="primary" />
                      <Typography variant="caption">
                        {item.metrics.views || 0}
                      </Typography>
                    </Box>
                  )}
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <EventIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No content scheduled
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Add content to this date to get started
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  if (selectedDate) {
                    onCreateContent?.(selectedDate);
                    setDayDetailsOpen(false);
                  }
                }}
              >
                Create Content
              </Button>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDayDetailsOpen(false)}>Close</Button>
          {selectedDate && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                onCreateContent?.(selectedDate);
                setDayDetailsOpen(false);
              }}
            >
              Add Content
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};