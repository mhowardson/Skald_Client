import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  IconButton,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  alpha
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Add as AddIcon,
  Schedule as ScheduleIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { format, addDays, subDays, startOfWeek, endOfWeek, isSameDay, parseISO } from 'date-fns';

import { Content, useGetContentCalendarQuery } from '../../store/api/contentApi';
import { CreateContentDialog } from './CreateContentDialog';

interface ContentSchedulerProps {
  onContentCreate?: () => void;
  onContentEdit?: (content: Content) => void;
  onContentSchedule?: (content: Content) => void;
}

interface CalendarDay {
  date: Date;
  content: Content[];
  isCurrentMonth: boolean;
  isToday: boolean;
}

const platformColors = {
  linkedin: '#0077B5',
  twitter: '#1DA1F2',
  facebook: '#1877F2',
  instagram: '#E4405F',
  youtube: '#FF0000',
  tiktok: '#000000',
};

const platformIcons = {
  linkedin: '💼',
  twitter: '🐦',
  facebook: '📘',
  instagram: '📷',
  youtube: '📺',
  tiktok: '🎵',
};

const statusColors = {
  draft: 'default',
  pending_review: 'warning',
  approved: 'info',
  scheduled: 'primary',
  published: 'success',
  failed: 'error',
  archived: 'default',
} as const;

export const ContentScheduler: React.FC<ContentSchedulerProps> = ({
  onContentCreate,
  onContentEdit,
  onContentSchedule
}) => {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'month'>('week');
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Calculate date range based on view
  const dateRange = useMemo(() => {
    const start = view === 'week' 
      ? startOfWeek(currentDate, { weekStartsOn: 1 })
      : new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    const end = view === 'week'
      ? endOfWeek(currentDate, { weekStartsOn: 1 })
      : new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    return { start, end };
  }, [currentDate, view]);

  // Fetch calendar data
  const { data: calendarData, isLoading } = useGetContentCalendarQuery({
    startDate: format(dateRange.start, 'yyyy-MM-dd'),
    endDate: format(dateRange.end, 'yyyy-MM-dd'),
  });

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days: CalendarDay[] = [];
    const start = dateRange.start;
    const end = dateRange.end;
    
    let currentDay = new Date(start);
    
    while (currentDay <= end) {
      const dayContent = calendarData?.calendar.filter(content => 
        content.scheduledAt && isSameDay(parseISO(content.scheduledAt), currentDay)
      ) || [];
      
      days.push({
        date: new Date(currentDay),
        content: dayContent,
        isCurrentMonth: currentDay.getMonth() === currentDate.getMonth(),
        isToday: isSameDay(currentDay, new Date()),
      });
      
      currentDay = addDays(currentDay, 1);
    }
    
    return days;
  }, [dateRange, calendarData, currentDate]);

  const navigateDate = (direction: 'prev' | 'next') => {
    if (view === 'week') {
      setCurrentDate(direction === 'next' ? addDays(currentDate, 7) : subDays(currentDate, 7));
    } else {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      setCurrentDate(newDate);
    }
  };

  const handleContentClick = (content: Content) => {
    setSelectedContent(content);
    setDetailDialogOpen(true);
  };

  const handleCreateContent = () => {
    setCreateDialogOpen(true);
    onContentCreate?.();
  };

  const getPlatformChips = (content: Content) => {
    return content.platforms.map((platform) => (
      <Chip
        key={platform.platform}
        size="small"
        label={platformIcons[platform.platform]}
        sx={{
          bgcolor: alpha(platformColors[platform.platform], 0.1),
          color: platformColors[platform.platform],
          fontSize: '0.7rem',
          height: 20,
          minWidth: 24,
          '& .MuiChip-label': { px: 0.5 }
        }}
      />
    ));
  };

  const renderWeekView = () => {
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return (
      <Grid container spacing={1}>
        {weekDays.map((day, index) => {
          const dayData = calendarDays[index];
          
          return (
            <Grid item xs key={day}>
              <Paper
                sx={{
                  minHeight: 400,
                  p: 1,
                  bgcolor: dayData?.isToday ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
                  border: dayData?.isToday ? `2px solid ${theme.palette.primary.main}` : '1px solid',
                  borderColor: dayData?.isToday ? 'primary.main' : 'divider',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography 
                    variant="subtitle2" 
                    fontWeight={dayData?.isToday ? 'bold' : 'normal'}
                    color={dayData?.isToday ? 'primary.main' : 'text.primary'}
                  >
                    {day}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    fontWeight={dayData?.isToday ? 'bold' : 'normal'}
                    color={dayData?.isToday ? 'primary.main' : 'text.primary'}
                  >
                    {dayData && format(dayData.date, 'd')}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {dayData?.content.map((content) => (
                    <Card
                      key={content.id}
                      sx={{
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'scale(1.02)',
                          boxShadow: 2,
                        },
                      }}
                      onClick={() => handleContentClick(content)}
                    >
                      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                          <Chip
                            size="small"
                            label={content.status.replace('_', ' ')}
                            color={statusColors[content.status]}
                            sx={{ fontSize: '0.6rem', height: 16 }}
                          />
                          {content.scheduledAt && (
                            <Typography variant="caption" color="text.secondary">
                              {format(parseISO(content.scheduledAt), 'HH:mm')}
                            </Typography>
                          )}
                        </Box>
                        
                        <Typography variant="body2" noWrap sx={{ mb: 0.5, fontSize: '0.75rem' }}>
                          {content.title}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {getPlatformChips(content)}
                        </Box>
                        
                        {content.priority !== 'medium' && (
                          <Chip
                            size="small"
                            label={content.priority}
                            color={content.priority === 'high' || content.priority === 'urgent' ? 'error' : 'default'}
                            sx={{ mt: 0.5, fontSize: '0.6rem', height: 16 }}
                          />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleCreateContent}
                    sx={{ 
                      mt: 1, 
                      fontSize: '0.7rem',
                      minHeight: 28,
                      justifyContent: 'flex-start',
                      textTransform: 'none'
                    }}
                  >
                    Add Content
                  </Button>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  const renderMonthView = () => {
    const weeks = [];
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Header
    weeks.push(
      <Grid container key="header">
        {weekDays.map((day) => (
          <Grid item xs key={day}>
            <Typography variant="subtitle2" align="center" sx={{ p: 1, fontWeight: 'bold' }}>
              {day}
            </Typography>
          </Grid>
        ))}
      </Grid>
    );
    
    // Days
    for (let i = 0; i < calendarDays.length; i += 7) {
      const week = calendarDays.slice(i, i + 7);
      
      weeks.push(
        <Grid container key={`week-${i}`} sx={{ minHeight: 120 }}>
          {week.map((dayData, index) => (
            <Grid item xs key={index}>
              <Paper
                sx={{
                  height: '100%',
                  p: 0.5,
                  bgcolor: dayData.isToday ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
                  border: dayData.isToday ? `2px solid ${theme.palette.primary.main}` : '1px solid',
                  borderColor: dayData.isToday ? 'primary.main' : 'divider',
                  opacity: dayData.isCurrentMonth ? 1 : 0.5,
                }}
              >
                <Typography 
                  variant="body2" 
                  align="center"
                  fontWeight={dayData.isToday ? 'bold' : 'normal'}
                  color={dayData.isToday ? 'primary.main' : 'text.primary'}
                  sx={{ mb: 0.5 }}
                >
                  {format(dayData.date, 'd')}
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                  {dayData.content.slice(0, 3).map((content) => (
                    <Box
                      key={content.id}
                      onClick={() => handleContentClick(content)}
                      sx={{
                        bgcolor: alpha(platformColors[content.platforms[0]?.platform] || theme.palette.primary.main, 0.1),
                        borderRadius: 0.5,
                        p: 0.25,
                        cursor: 'pointer',
                        fontSize: '0.6rem',
                        '&:hover': { bgcolor: alpha(platformColors[content.platforms[0]?.platform] || theme.palette.primary.main, 0.2) }
                      }}
                    >
                      <Typography variant="caption" noWrap>
                        {content.title}
                      </Typography>
                    </Box>
                  ))}
                  
                  {dayData.content.length > 3 && (
                    <Typography variant="caption" align="center" color="text.secondary">
                      +{dayData.content.length - 3} more
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      );
    }
    
    return <Box>{weeks}</Box>;
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" fontWeight="bold">
            Content Calendar
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={() => navigateDate('prev')}>
              <ChevronLeft />
            </IconButton>
            
            <Typography variant="h6" sx={{ minWidth: 200, textAlign: 'center' }}>
              {view === 'week' 
                ? `${format(dateRange.start, 'MMM d')} - ${format(dateRange.end, 'MMM d, yyyy')}`
                : format(currentDate, 'MMMM yyyy')
              }
            </Typography>
            
            <IconButton onClick={() => navigateDate('next')}>
              <ChevronRight />
            </IconButton>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant={view === 'week' ? 'contained' : 'outlined'}
            onClick={() => setView('week')}
            size="small"
          >
            Week
          </Button>
          <Button
            variant={view === 'month' ? 'contained' : 'outlined'}
            onClick={() => setView('month')}
            size="small"
          >
            Month
          </Button>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateContent}
            sx={{ ml: 2 }}
          >
            Create Content
          </Button>
        </Box>
      </Box>

      {/* Calendar */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography>Loading calendar...</Typography>
        </Box>
      ) : view === 'week' ? renderWeekView() : renderMonthView()}

      {/* Content Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedContent && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{selectedContent.title}</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {getPlatformChips(selectedContent)}
                </Box>
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Chip
                  label={selectedContent.status.replace('_', ' ')}
                  color={statusColors[selectedContent.status]}
                  sx={{ mr: 1 }}
                />
                <Chip
                  label={selectedContent.priority}
                  color={selectedContent.priority === 'high' || selectedContent.priority === 'urgent' ? 'error' : 'default'}
                />
              </Box>
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedContent.body}
              </Typography>
              
              {selectedContent.scheduledAt && (
                <Typography variant="body2" color="text.secondary">
                  Scheduled for: {format(parseISO(selectedContent.scheduledAt), 'PPpp')}
                </Typography>
              )}
              
              {selectedContent.tags.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Tags:</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {selectedContent.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}
            </DialogContent>
            
            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>
                Close
              </Button>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => {
                  onContentEdit?.(selectedContent);
                  setDetailDialogOpen(false);
                }}
              >
                Edit
              </Button>
              {selectedContent.status === 'approved' && (
                <Button
                  variant="contained"
                  startIcon={<ScheduleIcon />}
                  onClick={() => {
                    onContentSchedule?.(selectedContent);
                    setDetailDialogOpen(false);
                  }}
                >
                  Schedule
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Create Content Dialog */}
      <CreateContentDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={() => setCreateDialogOpen(false)}
      />
    </Box>
  );
};