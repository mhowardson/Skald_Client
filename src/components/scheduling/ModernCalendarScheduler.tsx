import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Grid,
  Stack,
  Chip,
  Avatar,
  Card,
  CardContent,
  Tooltip,
  Badge,
  alpha,
  useTheme,
  Fade,
  Zoom,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Skeleton,
  Collapse,
  Drawer,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Today,
  CalendarMonth,
  CalendarViewWeek,
  CalendarViewDay,
  Schedule,
  Add,
  Edit,
  Delete,
  ContentCopy,
  Visibility,
  Share,
  Analytics,
  TrendingUp,
  Timer,
  Lightbulb,
  AutoAwesome,
  DragIndicator,
  MoreVert,
  Circle,
  CheckCircle,
  Error as ErrorIcon,
  Warning,
  Refresh,
  FilterList,
  Search,
  Notifications,
  CloudOff,
  AccessTime,
  LocationOn,
  Language,
} from '@mui/icons-material';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  isPast,
  isFuture,
  isWithinInterval,
  addHours,
  setHours,
  setMinutes,
  parseISO,
} from 'date-fns';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface ScheduledContent {
  id: string;
  title: string;
  content: string;
  platforms: PlatformConfig[];
  scheduledAt: Date;
  status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';
  media?: { url: string; type: string }[];
  analytics?: {
    estimatedReach: number;
    optimalScore: number;
  };
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    endDate?: Date;
  };
}

interface PlatformConfig {
  platform: 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'youtube' | 'tiktok';
  status?: 'scheduled' | 'published' | 'failed';
  scheduledTime?: Date;
}

interface TimeSlot {
  time: string;
  score: number;
  label: 'Best' | 'Good' | 'Average' | 'Poor';
  platforms: string[];
}

interface CalendarSchedulerProps {
  scheduledContent?: ScheduledContent[];
  onContentSelect?: (content: ScheduledContent) => void;
  onContentSchedule?: (date: Date, content?: Partial<ScheduledContent>) => void;
  onContentUpdate?: (content: ScheduledContent) => void;
  onContentDelete?: (contentId: string) => void;
  loading?: boolean;
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

// Mock optimal posting times
const optimalTimes: TimeSlot[] = [
  { time: '09:00', score: 95, label: 'Best', platforms: ['linkedin', 'twitter'] },
  { time: '12:00', score: 85, label: 'Good', platforms: ['instagram', 'facebook'] },
  { time: '17:00', score: 90, label: 'Best', platforms: ['linkedin', 'instagram'] },
  { time: '20:00', score: 80, label: 'Good', platforms: ['instagram', 'tiktok'] },
];

// Mock scheduled content
const mockScheduledContent: ScheduledContent[] = [
  {
    id: '1',
    title: 'Product Launch Announcement',
    content: '🚀 Exciting news! We\'re launching our new AI-powered feature...',
    platforms: [
      { platform: 'linkedin', status: 'scheduled' },
      { platform: 'twitter', status: 'scheduled' },
    ],
    scheduledAt: addHours(new Date(), 2),
    status: 'scheduled',
    analytics: {
      estimatedReach: 15000,
      optimalScore: 92,
    },
  },
  {
    id: '2',
    title: 'Weekly Tips Thread',
    content: '💡 Here are 5 tips to boost your social media engagement...',
    platforms: [
      { platform: 'twitter', status: 'published' },
      { platform: 'instagram', status: 'published' },
    ],
    scheduledAt: addDays(new Date(), -1),
    status: 'published',
    analytics: {
      estimatedReach: 8500,
      optimalScore: 78,
    },
  },
  {
    id: '3',
    title: 'Behind the Scenes',
    content: '👀 Take a peek behind the scenes of our creative process...',
    platforms: [
      { platform: 'instagram', status: 'scheduled' },
      { platform: 'tiktok', status: 'scheduled' },
    ],
    scheduledAt: addDays(new Date(), 3),
    status: 'scheduled',
    analytics: {
      estimatedReach: 12000,
      optimalScore: 88,
    },
    recurrence: {
      frequency: 'weekly',
    },
  },
];

type ViewMode = 'month' | 'week' | 'day' | 'list';

export const ModernCalendarScheduler: React.FC<CalendarSchedulerProps> = ({
  scheduledContent = mockScheduledContent,
  onContentSelect,
  onContentSchedule,
  onContentUpdate,
  onContentDelete,
  loading = false,
}) => {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedContent, setSelectedContent] = useState<ScheduledContent | null>(null);
  const [showOptimalTimes, setShowOptimalTimes] = useState(true);
  const [filterPlatforms, setFilterPlatforms] = useState<string[]>([]);
  const [quickScheduleOpen, setQuickScheduleOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{ element: HTMLElement; content: ScheduledContent } | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [draggedContent, setDraggedContent] = useState<ScheduledContent | null>(null);

  // Calculate calendar days
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    const days: Date[] = [];
    let current = start;

    while (current <= end) {
      days.push(current);
      current = addDays(current, 1);
    }

    return days;
  }, [currentDate]);

  // Get content for a specific date
  const getContentForDate = useCallback((date: Date) => {
    return scheduledContent.filter(content =>
      isSameDay(content.scheduledAt, date)
    );
  }, [scheduledContent]);

  // Handle navigation
  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Handle date selection
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dayContent = getContentForDate(date);
    if (dayContent.length === 0 && !isPast(date)) {
      setQuickScheduleOpen(true);
      onContentSchedule?.(date);
    }
  };

  // Handle drag and drop
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceDate = parseISO(result.source.droppableId);
    const destDate = parseISO(result.destination.droppableId);
    
    if (!isSameDay(sourceDate, destDate)) {
      const content = scheduledContent.find(c => c.id === result.draggableId);
      if (content) {
        const updatedContent = {
          ...content,
          scheduledAt: destDate,
        };
        onContentUpdate?.(updatedContent);
      }
    }
  };

  // Handle content actions
  const handleContentClick = (content: ScheduledContent, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedContent(content);
    setDetailsOpen(true);
    onContentSelect?.(content);
  };

  const handleContentMenu = (event: React.MouseEvent, content: ScheduledContent) => {
    event.stopPropagation();
    event.preventDefault();
    setMenuAnchor({ element: event.currentTarget as HTMLElement, content });
  };

  const handleDuplicate = (content: ScheduledContent) => {
    const newContent = {
      ...content,
      id: `${content.id}-copy`,
      title: `${content.title} (Copy)`,
      scheduledAt: addDays(content.scheduledAt, 1),
    };
    onContentSchedule?.(newContent.scheduledAt, newContent);
    setMenuAnchor(null);
  };

  // Render calendar header
  const renderCalendarHeader = () => (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        {/* Navigation */}
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton onClick={handlePreviousMonth} sx={{ borderRadius: 2 }}>
            <ChevronLeft />
          </IconButton>
          <Typography variant="h5" fontWeight={700} sx={{ minWidth: 200, textAlign: 'center' }}>
            {format(currentDate, 'MMMM yyyy')}
          </Typography>
          <IconButton onClick={handleNextMonth} sx={{ borderRadius: 2 }}>
            <ChevronRight />
          </IconButton>
          <Button
            variant="outlined"
            startIcon={<Today />}
            onClick={handleToday}
            sx={{ borderRadius: 3, ml: 2 }}
          >
            Today
          </Button>
        </Stack>

        {/* View Mode Toggle */}
        <Stack direction="row" spacing={2} alignItems="center">
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, value) => value && setViewMode(value)}
            size="small"
          >
            <ToggleButton value="month" sx={{ px: 2 }}>
              <CalendarMonth fontSize="small" sx={{ mr: 1 }} />
              Month
            </ToggleButton>
            <ToggleButton value="week" sx={{ px: 2 }}>
              <CalendarViewWeek fontSize="small" sx={{ mr: 1 }} />
              Week
            </ToggleButton>
            <ToggleButton value="day" sx={{ px: 2 }}>
              <CalendarViewDay fontSize="small" sx={{ mr: 1 }} />
              Day
            </ToggleButton>
            <ToggleButton value="list" sx={{ px: 2 }}>
              <FilterList fontSize="small" sx={{ mr: 1 }} />
              List
            </ToggleButton>
          </ToggleButtonGroup>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setSelectedDate(new Date());
              setQuickScheduleOpen(true);
            }}
            sx={{
              borderRadius: 3,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}
          >
            Schedule Content
          </Button>
        </Stack>
      </Stack>

      {/* Filters and Options */}
      <Stack direction="row" spacing={2} alignItems="center">
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Platform</InputLabel>
          <Select
            multiple
            value={filterPlatforms}
            onChange={(e) => setFilterPlatforms(e.target.value as string[])}
            renderValue={(selected) => (
              <Stack direction="row" spacing={0.5}>
                {selected.map((platform) => (
                  <Chip
                    key={platform}
                    label={platformIcons[platform]}
                    size="small"
                    sx={{ height: 24 }}
                  />
                ))}
              </Stack>
            )}
          >
            {Object.keys(platformIcons).map((platform) => (
              <MenuItem key={platform} value={platform}>
                <ListItemIcon>{platformIcons[platform]}</ListItemIcon>
                <ListItemText>{platform.charAt(0).toUpperCase() + platform.slice(1)}</ListItemText>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant={showOptimalTimes ? 'contained' : 'outlined'}
          startIcon={<Lightbulb />}
          onClick={() => setShowOptimalTimes(!showOptimalTimes)}
          size="small"
          sx={{ borderRadius: 2 }}
        >
          Optimal Times
        </Button>

        <Button
          variant="outlined"
          startIcon={<Analytics />}
          size="small"
          sx={{ borderRadius: 2 }}
        >
          Analytics
        </Button>
      </Stack>
    </Box>
  );

  // Render weekday headers
  const renderWeekdayHeaders = () => (
    <Grid container sx={{ mb: 1 }}>
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <Grid item xs={12 / 7} key={day}>
          <Typography
            variant="subtitle2"
            align="center"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.secondary,
              py: 1,
            }}
          >
            {day}
          </Typography>
        </Grid>
      ))}
    </Grid>
  );

  // Render calendar day
  const renderCalendarDay = (date: Date) => {
    const dayContent = getContentForDate(date);
    const isCurrentMonth = isSameMonth(date, currentDate);
    const isSelected = selectedDate && isSameDay(date, selectedDate);
    const isHovered = hoveredDate && isSameDay(date, hoveredDate);
    const hasContent = dayContent.length > 0;
    const isPastDate = isPast(date) && !isToday(date);

    // Check if this is an optimal time
    const dayOfWeek = format(date, 'EEEE');
    const isOptimalDay = showOptimalTimes && optimalTimes.some(
      time => time.score >= 85 && !isPastDate
    );

    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={date.toISOString()} isDropDisabled={isPastDate}>
          {(provided, snapshot) => (
            <Paper
              ref={provided.innerRef}
              {...provided.droppableProps}
              onClick={() => handleDateClick(date)}
              onMouseEnter={() => setHoveredDate(date)}
              onMouseLeave={() => setHoveredDate(null)}
              sx={{
                height: 120,
                p: 1,
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: isSelected
                  ? alpha(theme.palette.primary.main, 0.08)
                  : isPastDate
                  ? alpha(theme.palette.action.disabled, 0.02)
                  : snapshot.isDraggingOver
                  ? alpha(theme.palette.primary.main, 0.04)
                  : 'transparent',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[4],
                  borderColor: theme.palette.primary.main,
                  background: alpha(theme.palette.primary.main, 0.04),
                },
                opacity: isCurrentMonth ? 1 : 0.4,
              }}
            >
              {/* Date Number */}
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.5 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isToday(date) ? 700 : 500,
                    color: isToday(date)
                      ? theme.palette.primary.main
                      : isPastDate
                      ? theme.palette.text.disabled
                      : theme.palette.text.primary,
                  }}
                >
                  {format(date, 'd')}
                </Typography>
                {isOptimalDay && (
                  <Tooltip title="Optimal posting time">
                    <TrendingUp
                      sx={{
                        fontSize: 16,
                        color: theme.palette.success.main,
                        animation: 'pulse 2s infinite',
                      }}
                    />
                  </Tooltip>
                )}
              </Stack>

              {/* Content Items */}
              <Box sx={{ mt: 0.5 }}>
                {dayContent.slice(0, 3).map((content, index) => (
                  <Draggable
                    key={content.id}
                    draggableId={content.id}
                    index={index}
                    isDragDisabled={isPastDate || content.status === 'published'}
                  >
                    {(provided, snapshot) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        onClick={(e) => handleContentClick(content, e)}
                        onContextMenu={(e) => handleContentMenu(e, content)}
                        sx={{
                          mb: 0.5,
                          p: 0.5,
                          borderRadius: 1,
                          fontSize: '0.7rem',
                          cursor: 'pointer',
                          position: 'relative',
                          overflow: 'hidden',
                          background: alpha(theme.palette.background.paper, 0.9),
                          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                          transition: 'all 0.2s ease',
                          transform: snapshot.isDragging ? 'rotate(2deg)' : 'none',
                          boxShadow: snapshot.isDragging ? theme.shadows[8] : 'none',
                          '&:hover': {
                            background: theme.palette.background.paper,
                            borderColor: theme.palette.primary.main,
                            '& .drag-handle': {
                              opacity: 1,
                            },
                          },
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Box
                            {...provided.dragHandleProps}
                            className="drag-handle"
                            sx={{
                              opacity: 0,
                              transition: 'opacity 0.2s',
                              cursor: 'grab',
                              color: theme.palette.text.secondary,
                            }}
                          >
                            <DragIndicator sx={{ fontSize: 14 }} />
                          </Box>
                          
                          {/* Status Indicator */}
                          {content.status === 'published' ? (
                            <CheckCircle sx={{ fontSize: 12, color: theme.palette.success.main }} />
                          ) : content.status === 'failed' ? (
                            <ErrorIcon sx={{ fontSize: 12, color: theme.palette.error.main }} />
                          ) : content.status === 'publishing' ? (
                            <Circle sx={{ fontSize: 12, color: theme.palette.warning.main }} />
                          ) : (
                            <Schedule sx={{ fontSize: 12, color: theme.palette.info.main }} />
                          )}
                          
                          {/* Platforms */}
                          <Stack direction="row" spacing={0.25}>
                            {content.platforms.slice(0, 2).map((p) => (
                              <Typography key={p.platform} sx={{ fontSize: 10 }}>
                                {platformIcons[p.platform]}
                              </Typography>
                            ))}
                            {content.platforms.length > 2 && (
                              <Typography sx={{ fontSize: 10, color: theme.palette.text.secondary }}>
                                +{content.platforms.length - 2}
                              </Typography>
                            )}
                          </Stack>
                          
                          {/* Title */}
                          <Typography
                            variant="caption"
                            sx={{
                              flex: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontSize: '0.7rem',
                            }}
                          >
                            {content.title}
                          </Typography>
                        </Stack>

                        {/* Time */}
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '0.65rem',
                            color: theme.palette.text.secondary,
                            mt: 0.25,
                          }}
                        >
                          {format(content.scheduledAt, 'HH:mm')}
                        </Typography>
                      </Box>
                    )}
                  </Draggable>
                ))}
                {dayContent.length > 3 && (
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.65rem',
                      color: theme.palette.primary.main,
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    +{dayContent.length - 3} more
                  </Typography>
                )}
              </Box>

              {/* Quick Add Button */}
              {isHovered && !isPastDate && (
                <Fade in>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDate(date);
                      setQuickScheduleOpen(true);
                    }}
                    sx={{
                      position: 'absolute',
                      bottom: 4,
                      right: 4,
                      width: 24,
                      height: 24,
                      bgcolor: theme.palette.primary.main,
                      color: 'white',
                      '&:hover': {
                        bgcolor: theme.palette.primary.dark,
                      },
                    }}
                  >
                    <Add sx={{ fontSize: 16 }} />
                  </IconButton>
                </Fade>
              )}
              {provided.placeholder}
            </Paper>
          )}
        </Droppable>
      </DragDropContext>
    );
  };

  // Render optimal times sidebar
  const renderOptimalTimesSidebar = () => (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(
          theme.palette.background.paper,
          0.9
        )} 100%)`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoAwesome color="primary" />
        Optimal Posting Times
      </Typography>
      
      <Stack spacing={2}>
        {optimalTimes.map((timeSlot, index) => (
          <Card
            key={index}
            variant="outlined"
            sx={{
              p: 2,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: `1px solid ${alpha(
                timeSlot.label === 'Best' ? theme.palette.success.main : theme.palette.divider,
                0.3
              )}`,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[4],
                borderColor: theme.palette.primary.main,
              },
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="h6" fontWeight={600}>
                {timeSlot.time}
              </Typography>
              <Chip
                label={timeSlot.label}
                size="small"
                color={timeSlot.label === 'Best' ? 'success' : timeSlot.label === 'Good' ? 'primary' : 'default'}
                sx={{ fontWeight: 600 }}
              />
            </Stack>
            
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <AccessTime sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
              <Typography variant="body2" color="text.secondary">
                Engagement Score: {timeSlot.score}%
              </Typography>
            </Stack>
            
            <Stack direction="row" spacing={0.5}>
              {timeSlot.platforms.map((platform) => (
                <Chip
                  key={platform}
                  label={platformIcons[platform]}
                  size="small"
                  sx={{
                    bgcolor: alpha(platformColors[platform], 0.1),
                    border: `1px solid ${alpha(platformColors[platform], 0.3)}`,
                  }}
                />
              ))}
            </Stack>
          </Card>
        ))}
      </Stack>

      <Button
        fullWidth
        variant="outlined"
        startIcon={<TrendingUp />}
        sx={{ mt: 3, borderRadius: 2 }}
      >
        View Full Analytics
      </Button>
    </Paper>
  );

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2, borderRadius: 2 }} />
        <Grid container spacing={2}>
          {[...Array(35)].map((_, i) => (
            <Grid item xs={12 / 7} key={i}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      {renderCalendarHeader()}
      
      <Grid container spacing={3}>
        {/* Calendar Grid */}
        <Grid item xs={12} md={showOptimalTimes ? 9 : 12}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(20px)',
            }}
          >
            {viewMode === 'month' && (
              <>
                {renderWeekdayHeaders()}
                <Grid container spacing={1}>
                  {calendarDays.map((date) => (
                    <Grid item xs={12 / 7} key={date.toISOString()}>
                      {renderCalendarDay(date)}
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
            
            {/* Week View */}
            {viewMode === 'week' && (
              <Box>
                {/* Week Headers */}
                <Grid container sx={{ mb: 2 }}>
                  {Array.from({ length: 7 }, (_, i) => {
                    const date = addDays(startOfWeek(currentDate), i);
                    return (
                      <Grid item xs key={i}>
                        <Box sx={{ textAlign: 'center', p: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {format(date, 'EEE')}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: isToday(date) ? 700 : 400 }}>
                            {format(date, 'd')}
                          </Typography>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
                
                {/* Week Grid */}
                <Grid container spacing={1} sx={{ minHeight: 600 }}>
                  {Array.from({ length: 7 }, (_, i) => {
                    const date = addDays(startOfWeek(currentDate), i);
                    const dayContent = getContentForDate(date);
                    return (
                      <Grid item xs key={i}>
                        <Paper
                          sx={{
                            minHeight: 580,
                            p: 1,
                            bgcolor: isToday(date) ? alpha(theme.palette.primary.main, 0.03) : 'transparent',
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                          }}
                        >
                          {dayContent.map((content, index) => (
                            <Card
                              key={content.id}
                              sx={{
                                mb: 1,
                                p: 1,
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                '&:hover': { boxShadow: theme.shadows[4] },
                              }}
                              onClick={(e) => handleContentClick(content, e)}
                            >
                              <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>
                                {format(content.scheduledAt, 'HH:mm')}
                              </Typography>
                              <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                                {content.title}
                              </Typography>
                              <Stack direction="row" spacing={0.25}>
                                {content.platforms.slice(0, 3).map((p) => (
                                  <Typography key={p.platform} sx={{ fontSize: 10 }}>
                                    {platformIcons[p.platform]}
                                  </Typography>
                                ))}
                              </Stack>
                            </Card>
                          ))}
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            )}
            
            {/* Day View */}
            {viewMode === 'day' && (
              <Box>
                {/* Day Header */}
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ mb: 1 }}>
                    {format(selectedDate || currentDate, 'EEEE')}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    {format(selectedDate || currentDate, 'MMMM d, yyyy')}
                  </Typography>
                </Box>
                
                {/* Time Grid */}
                <Box sx={{ position: 'relative' }}>
                  {Array.from({ length: 24 }, (_, hour) => {
                    const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
                    const slotContent = scheduledContent.filter(content => 
                      isSameDay(content.scheduledAt, selectedDate || currentDate) &&
                      format(content.scheduledAt, 'HH') === hour.toString().padStart(2, '0')
                    );
                    
                    return (
                      <Box key={hour} sx={{ display: 'flex', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`, minHeight: 60 }}>
                        <Box sx={{ width: 80, p: 2, borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                          <Typography variant="caption" color="text.secondary">
                            {timeSlot}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, p: 1, position: 'relative' }}>
                          {slotContent.map((content, index) => (
                            <Card
                              key={content.id}
                              sx={{
                                mb: 1,
                                p: 1.5,
                                cursor: 'pointer',
                                background: alpha(theme.palette.primary.main, 0.1),
                                border: `1px solid ${theme.palette.primary.main}`,
                                '&:hover': { boxShadow: theme.shadows[4] },
                              }}
                              onClick={(e) => handleContentClick(content, e)}
                            >
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {content.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                {format(content.scheduledAt, 'HH:mm')} • {content.platforms.length} platform{content.platforms.length !== 1 ? 's' : ''}
                              </Typography>
                              <Stack direction="row" spacing={0.5}>
                                {content.platforms.map((p) => (
                                  <Chip
                                    key={p.platform}
                                    label={platformIcons[p.platform]}
                                    size="small"
                                    sx={{ height: 20, fontSize: 10 }}
                                  />
                                ))}
                              </Stack>
                            </Card>
                          ))}
                          {slotContent.length === 0 && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                borderRadius: 1,
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                                },
                              }}
                              onClick={() => {
                                const scheduleTime = setHours(setMinutes(selectedDate || currentDate, 0), hour);
                                setSelectedDate(scheduleTime);
                                setQuickScheduleOpen(true);
                              }}
                            >
                              <Typography variant="caption" color="text.secondary">
                                Click to schedule
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}
            
            {/* List View */}
            {viewMode === 'list' && (
              <Box>
                {/* Filters */}
                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Status</InputLabel>
                    <Select defaultValue="" label="Status">
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="draft">Draft</MenuItem>
                      <MenuItem value="scheduled">Scheduled</MenuItem>
                      <MenuItem value="published">Published</MenuItem>
                      <MenuItem value="failed">Failed</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Date Range</InputLabel>
                    <Select defaultValue="week" label="Date Range">
                      <MenuItem value="today">Today</MenuItem>
                      <MenuItem value="week">This Week</MenuItem>
                      <MenuItem value="month">This Month</MenuItem>
                      <MenuItem value="all">All Time</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
                
                {/* Content List */}
                <Stack spacing={2}>
                  {scheduledContent
                    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                    .map((content) => (
                    <Card key={content.id} sx={{ p: 3, cursor: 'pointer', '&:hover': { boxShadow: theme.shadows[4] } }}>
                      <Grid container spacing={3} alignItems="center">
                        {/* Content Info */}
                        <Grid item xs={12} md={6}>
                          <Box onClick={(e) => handleContentClick(content, e)}>
                            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                              {content.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {content.content}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <AccessTime sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                              <Typography variant="caption" color="text.secondary">
                                {format(content.scheduledAt, 'MMM d, yyyy • HH:mm')}
                              </Typography>
                            </Stack>
                          </Box>
                        </Grid>
                        
                        {/* Platforms */}
                        <Grid item xs={12} md={3}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            Platforms
                          </Typography>
                          <Stack direction="row" spacing={0.5} flexWrap="wrap">
                            {content.platforms.map((platform) => (
                              <Chip
                                key={platform.platform}
                                label={`${platformIcons[platform.platform]} ${platform.platform}`}
                                size="small"
                                variant="outlined"
                                sx={{ mb: 0.5 }}
                              />
                            ))}
                          </Stack>
                        </Grid>
                        
                        {/* Status & Actions */}
                        <Grid item xs={12} md={3}>
                          <Stack alignItems="flex-end" spacing={1}>
                            <Chip
                              label={content.status}
                              size="small"
                              color={content.status === 'published' ? 'success' : content.status === 'failed' ? 'error' : 'primary'}
                              variant={content.status === 'scheduled' ? 'outlined' : 'filled'}
                            />
                            {content.analytics && (
                              <Typography variant="caption" color="text.secondary">
                                {content.analytics.estimatedReach.toLocaleString()} est. reach • {content.analytics.optimalScore}% optimal
                              </Typography>
                            )}
                            <Stack direction="row" spacing={0.5}>
                              <IconButton size="small" onClick={(e) => handleContentClick(content, e)}>
                                <Visibility fontSize="small" />
                              </IconButton>
                              <IconButton size="small">
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton size="small" onClick={(e) => handleContentMenu(e, content)}>
                                <MoreVert fontSize="small" />
                              </IconButton>
                            </Stack>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Card>
                  ))}
                </Stack>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Optimal Times Sidebar */}
        {showOptimalTimes && (
          <Grid item xs={12} md={3}>
            {renderOptimalTimesSidebar()}
          </Grid>
        )}
      </Grid>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor?.element}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 180 } }}
      >
        <MenuItem onClick={() => menuAnchor && handleContentClick(menuAnchor.content, {} as any)}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => menuAnchor && handleDuplicate(menuAnchor.content)}>
          <ListItemIcon>
            <ContentCopy fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <Share fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            menuAnchor && onContentDelete?.(menuAnchor.content.id);
            setMenuAnchor(null);
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <Delete fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Quick Schedule Dialog */}
      <Dialog
        open={quickScheduleOpen}
        onClose={() => setQuickScheduleOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight={600}>
              Quick Schedule Content
            </Typography>
            <IconButton onClick={() => setQuickScheduleOpen(false)}>
              <ChevronLeft />
            </IconButton>
          </Stack>
          {selectedDate && (
            <Typography variant="body2" color="text.secondary">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </Typography>
          )}
        </DialogTitle>
        
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={3}>
            {/* Content Input */}
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Content"
              placeholder="Write your content here..."
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            
            {/* Time Selection */}
            <Stack direction="row" spacing={2}>
              <TextField
                type="time"
                label="Time"
                defaultValue="09:00"
                sx={{ flex: 1 }}
                InputLabelProps={{ shrink: true }}
              />
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Timezone</InputLabel>
                <Select defaultValue="UTC" label="Timezone">
                  <MenuItem value="UTC">UTC</MenuItem>
                  <MenuItem value="EST">EST</MenuItem>
                  <MenuItem value="PST">PST</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            
            {/* Platform Selection */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Select Platforms
              </Typography>
              <Grid container spacing={1}>
                {Object.entries(platformIcons).map(([platform, icon]) => (
                  <Grid item key={platform}>
                    <Button
                      variant="outlined"
                      startIcon={<span>{icon}</span>}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'capitalize',
                        minWidth: 100,
                      }}
                    >
                      {platform}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>
            
            {/* Optimal Time Suggestions */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Lightbulb fontSize="small" color="primary" />
                Optimal Times for Today
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {optimalTimes.map((timeSlot, index) => (
                  <Chip
                    key={index}
                    label={`${timeSlot.time} (${timeSlot.score}%)`}
                    size="small"
                    color={timeSlot.label === 'Best' ? 'success' : 'primary'}
                    variant="outlined"
                    clickable
                    sx={{ mb: 0.5 }}
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setQuickScheduleOpen(false)} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<Schedule />}
            sx={{
              borderRadius: 2,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}
          >
            Schedule Content
          </Button>
        </DialogActions>
      </Dialog>

      {/* Content Details Modal */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, maxHeight: '90vh' } }}
      >
        {selectedContent && (
          <>
            <DialogTitle sx={{ pb: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {selectedContent.title}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                    <Chip
                      label={selectedContent.status}
                      size="small"
                      color={selectedContent.status === 'published' ? 'success' : selectedContent.status === 'failed' ? 'error' : 'primary'}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {format(selectedContent.scheduledAt, 'MMM d, yyyy • HH:mm')}
                    </Typography>
                  </Stack>
                </Box>
                <IconButton onClick={() => setDetailsOpen(false)}>
                  <ChevronLeft />
                </IconButton>
              </Stack>
            </DialogTitle>
            
            <DialogContent>
              <Grid container spacing={4}>
                {/* Content Preview */}
                <Grid item xs={12} md={8}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                      Content Preview
                    </Typography>
                    <Paper sx={{ p: 3, borderRadius: 2, bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                        {selectedContent.content}
                      </Typography>
                    </Paper>
                  </Box>
                  
                  {/* Media Preview */}
                  {selectedContent.media && selectedContent.media.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                        Media ({selectedContent.media.length})
                      </Typography>
                      <Grid container spacing={2}>
                        {selectedContent.media.map((media, index) => (
                          <Grid item xs={6} sm={4} key={index}>
                            <Paper sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
                              <Box sx={{ width: 60, height: 60, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1 }}>
                                <Typography sx={{ fontSize: 24 }}>
                                  {media.type === 'image' ? '🖼️' : '🎥'}
                                </Typography>
                              </Box>
                              <Typography variant="caption">
                                {media.type}
                              </Typography>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                </Grid>
                
                {/* Details Sidebar */}
                <Grid item xs={12} md={4}>
                  <Stack spacing={3}>
                    {/* Platforms */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                        Publishing Platforms
                      </Typography>
                      <Stack spacing={1}>
                        {selectedContent.platforms.map((platform) => (
                          <Paper key={platform.platform} sx={{ p: 2, borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.2)}` }}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography sx={{ fontSize: 18 }}>
                                  {platformIcons[platform.platform]}
                                </Typography>
                                <Typography variant="body2" sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
                                  {platform.platform}
                                </Typography>
                              </Stack>
                              <Chip
                                label={platform.status || 'scheduled'}
                                size="small"
                                color={platform.status === 'published' ? 'success' : 'primary'}
                                variant="outlined"
                              />
                            </Stack>
                          </Paper>
                        ))}
                      </Stack>
                    </Box>
                    
                    {/* Analytics */}
                    {selectedContent.analytics && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                          Estimated Performance
                        </Typography>
                        <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                          <Stack spacing={2}>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Estimated Reach
                              </Typography>
                              <Typography variant="h6" fontWeight={600}>
                                {selectedContent.analytics.estimatedReach.toLocaleString()}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Optimal Score
                              </Typography>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography variant="h6" fontWeight={600} color="success.main">
                                  {selectedContent.analytics.optimalScore}%
                                </Typography>
                                <TrendingUp fontSize="small" color="success" />
                              </Stack>
                            </Box>
                          </Stack>
                        </Paper>
                      </Box>
                    )}
                    
                    {/* Recurrence */}
                    {selectedContent.recurrence && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                          Recurring Schedule
                        </Typography>
                        <Paper sx={{ p: 2, borderRadius: 2, border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Refresh fontSize="small" color="info" />
                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                              {selectedContent.recurrence.frequency}
                            </Typography>
                          </Stack>
                          {selectedContent.recurrence.endDate && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                              Until {format(selectedContent.recurrence.endDate, 'MMM d, yyyy')}
                            </Typography>
                          )}
                        </Paper>
                      </Box>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>
            
            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Button onClick={() => setDetailsOpen(false)} sx={{ borderRadius: 2 }}>
                Close
              </Button>
              <Button startIcon={<Edit />} sx={{ borderRadius: 2 }}>
                Edit
              </Button>
              <Button startIcon={<ContentCopy />} sx={{ borderRadius: 2 }}>
                Duplicate
              </Button>
              <Button 
                variant="contained" 
                startIcon={<Analytics />}
                sx={{ borderRadius: 2 }}
              >
                View Analytics
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <style jsx global>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </Box>
  );
};