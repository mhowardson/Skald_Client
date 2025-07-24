import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Stack,
  Grid,
  Button,
  IconButton,
  Chip,
  Switch,
  FormControlLabel,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  TextField,
  Checkbox,
  Radio,
  RadioGroup,
  FormLabel,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Collapse,
  Avatar,
  Badge,
  Tooltip,
  LinearProgress,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Repeat,
  Add,
  Edit,
  Delete,
  PlayArrow,
  Pause,
  Stop,
  Schedule,
  CalendarMonth,
  AccessTime,
  Settings,
  AutoAwesome,
  Timeline,
  TrendingUp,
  Lightbulb,
  ContentCopy,
  Visibility,
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Info,
  Psychology,
  Speed,
  Analytics,
} from '@mui/icons-material';
import { 
  format, 
  addDays, 
  addWeeks, 
  addMonths, 
  startOfWeek, 
  endOfWeek,
  isSameDay,
  isAfter,
  isBefore,
  parseISO,
  setHours,
  setMinutes,
} from 'date-fns';

interface RecurrenceRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval: number; // Every X days/weeks/months
  daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
  daysOfMonth?: number[]; // 1-31
  times: string[]; // ["09:00", "17:00"]
  platforms: string[];
  contentTemplate?: {
    title: string;
    content: string;
    tags: string[];
    media?: { type: string; url: string }[];
  };
  scheduling: {
    startDate: Date;
    endDate?: Date;
    maxPosts?: number;
    timezone: string;
  };
  optimization: {
    adaptTiming: boolean;
    skipWeekends: boolean;
    skipHolidays: boolean;
    respectRateLimit: boolean;
    optimalSpacing: number; // minimum hours between posts
  };
  analytics: {
    totalScheduled: number;
    published: number;
    failed: number;
    averageEngagement: number;
    lastRun?: Date;
    nextRun?: Date;
  };
}

interface RecurringPost {
  id: string;
  ruleId: string;
  ruleName: string;
  title: string;
  content: string;
  platforms: string[];
  scheduledAt: Date;
  status: 'scheduled' | 'published' | 'failed' | 'cancelled';
  generatedAt: Date;
  adaptedTiming?: boolean;
  optimizationScore?: number;
}

interface RecurringSchedulerProps {
  rules?: RecurrenceRule[];
  onRuleCreate?: (rule: Omit<RecurrenceRule, 'id' | 'analytics'>) => void;
  onRuleUpdate?: (rule: RecurrenceRule) => void;
  onRuleDelete?: (ruleId: string) => void;
  onRuleToggle?: (ruleId: string, enabled: boolean) => void;
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

// Mock recurring rules
const mockRecurrenceRules: RecurrenceRule[] = [
  {
    id: '1',
    name: 'Weekly Marketing Tips',
    description: 'Share marketing tips every Tuesday and Thursday',
    enabled: true,
    frequency: 'weekly',
    interval: 1,
    daysOfWeek: [2, 4], // Tuesday, Thursday
    times: ['09:00', '17:00'],
    platforms: ['linkedin', 'twitter'],
    contentTemplate: {
      title: 'Weekly Marketing Tip #{week}',
      content: '💡 Marketing Tip of the Week: {tip}\n\nWhat strategies are working for your business? Share in the comments! 👇\n\n#MarketingTips #BusinessGrowth #SocialMedia',
      tags: ['marketing', 'tips', 'weekly'],
    },
    scheduling: {
      startDate: new Date(),
      endDate: addMonths(new Date(), 6),
      timezone: 'UTC',
    },
    optimization: {
      adaptTiming: true,
      skipWeekends: false,
      skipHolidays: true,
      respectRateLimit: true,
      optimalSpacing: 4,
    },
    analytics: {
      totalScheduled: 48,
      published: 42,
      failed: 2,
      averageEngagement: 8.5,
      lastRun: addDays(new Date(), -3),
      nextRun: addDays(new Date(), 1),
    },
  },
  {
    id: '2',
    name: 'Daily Motivational Quotes',
    description: 'Inspire followers with daily motivational content',
    enabled: true,
    frequency: 'daily',
    interval: 1,
    times: ['08:00'],
    platforms: ['instagram', 'facebook', 'twitter'],
    contentTemplate: {
      title: 'Daily Motivation',
      content: '🌟 "{quote}"\n\n{author}\n\nStart your day with positivity! What motivates you today? 💪\n\n#Motivation #Inspiration #MondayMotivation #Success',
      tags: ['motivation', 'quotes', 'daily'],
    },
    scheduling: {
      startDate: new Date(),
      maxPosts: 365,
      timezone: 'UTC',
    },
    optimization: {
      adaptTiming: true,
      skipWeekends: true,
      skipHolidays: true,
      respectRateLimit: true,
      optimalSpacing: 24,
    },
    analytics: {
      totalScheduled: 90,
      published: 87,
      failed: 1,
      averageEngagement: 6.2,
      lastRun: addDays(new Date(), -1),
      nextRun: addDays(new Date(), 1),
    },
  },
  {
    id: '3',
    name: 'Monthly Industry Report',
    description: 'Share comprehensive industry insights monthly',
    enabled: false,
    frequency: 'monthly',
    interval: 1,
    daysOfMonth: [1], // First day of month
    times: ['12:00'],
    platforms: ['linkedin'],
    contentTemplate: {
      title: '{Month} Industry Report - Key Insights',
      content: '📊 Monthly Industry Report for {month}:\n\n• Key trend 1\n• Important development 2\n• Market insight 3\n\nFull report in comments 👇\n\n#IndustryReport #MarketTrends #BusinessIntelligence',
      tags: ['report', 'industry', 'monthly'],
    },
    scheduling: {
      startDate: new Date(),
      endDate: addMonths(new Date(), 12),
      timezone: 'UTC',
    },
    optimization: {
      adaptTiming: false,
      skipWeekends: true,
      skipHolidays: true,
      respectRateLimit: true,
      optimalSpacing: 0,
    },
    analytics: {
      totalScheduled: 3,
      published: 3,
      failed: 0,
      averageEngagement: 12.8,
      lastRun: addDays(new Date(), -30),
      nextRun: addDays(new Date(), 1),
    },
  },
];

// Mock upcoming posts
const mockUpcomingPosts: RecurringPost[] = [
  {
    id: '1',
    ruleId: '1',
    ruleName: 'Weekly Marketing Tips',
    title: 'Weekly Marketing Tip #12',
    content: '💡 Marketing Tip of the Week: Use storytelling to connect emotionally with your audience...',
    platforms: ['linkedin', 'twitter'],
    scheduledAt: addDays(new Date(), 1),
    status: 'scheduled',
    generatedAt: new Date(),
    adaptedTiming: true,
    optimizationScore: 92,
  },
  {
    id: '2',
    ruleId: '2',
    ruleName: 'Daily Motivational Quotes',
    title: 'Daily Motivation',
    content: '🌟 "Success is not final, failure is not fatal: it is the courage to continue that counts."',
    platforms: ['instagram', 'facebook', 'twitter'],
    scheduledAt: addDays(new Date(), 1),
    status: 'scheduled',
    generatedAt: addDays(new Date(), -1),
    optimizationScore: 85,
  },
];

export const RecurringScheduler: React.FC<RecurringSchedulerProps> = ({
  rules = mockRecurrenceRules,
  onRuleCreate,
  onRuleUpdate,
  onRuleDelete,
  onRuleToggle,
}) => {
  const theme = useTheme();
  const [selectedRule, setSelectedRule] = useState<RecurrenceRule | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [expandedRules, setExpandedRules] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'rules' | 'upcoming' | 'history'>('rules');

  // Filter and sort rules
  const activeRules = useMemo(() => rules.filter(rule => rule.enabled), [rules]);
  const inactiveRules = useMemo(() => rules.filter(rule => !rule.enabled), [rules]);

  // Calculate upcoming posts
  const upcomingPosts = useMemo(() => {
    return mockUpcomingPosts.sort((a, b) => 
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );
  }, []);

  // Handle rule actions
  const handleRuleToggle = (ruleId: string, enabled: boolean) => {
    onRuleToggle?.(ruleId, enabled);
  };

  const handleRuleEdit = (rule: RecurrenceRule) => {
    setSelectedRule(rule);
    setEditDialogOpen(true);
  };

  const handleRuleDelete = (ruleId: string) => {
    onRuleDelete?.(ruleId);
  };

  const toggleRuleExpanded = (ruleId: string) => {
    setExpandedRules(prev =>
      prev.includes(ruleId)
        ? prev.filter(id => id !== ruleId)
        : [...prev, ruleId]
    );
  };

  // Calculate next run time for a rule
  const calculateNextRun = (rule: RecurrenceRule): Date | null => {
    const now = new Date();
    const { frequency, interval, daysOfWeek, daysOfMonth, times } = rule;

    if (!times.length) return null;

    let nextDate = new Date(now);
    const [hours, minutes] = times[0].split(':').map(Number);

    switch (frequency) {
      case 'daily':
        nextDate = addDays(now, interval);
        break;
      case 'weekly':
        if (daysOfWeek && daysOfWeek.length > 0) {
          // Find next occurrence of specified days
          const currentDay = now.getDay();
          const nextDay = daysOfWeek.find(day => day > currentDay) || daysOfWeek[0];
          const daysToAdd = nextDay > currentDay ? nextDay - currentDay : 7 - currentDay + nextDay;
          nextDate = addDays(now, daysToAdd);
        }
        break;
      case 'monthly':
        if (daysOfMonth && daysOfMonth.length > 0) {
          nextDate = addMonths(now, interval);
          nextDate.setDate(daysOfMonth[0]);
        }
        break;
    }

    nextDate = setHours(setMinutes(nextDate, minutes), hours);
    return nextDate;
  };

  // Render rule card
  const renderRuleCard = (rule: RecurrenceRule) => {
    const isExpanded = expandedRules.includes(rule.id);
    const nextRun = calculateNextRun(rule);
    const successRate = rule.analytics.totalScheduled > 0 
      ? (rule.analytics.published / rule.analytics.totalScheduled) * 100 
      : 0;

    return (
      <Card key={rule.id} sx={{ mb: 2, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.2)}` }}>
        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    bgcolor: rule.enabled ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.text.disabled, 0.1),
                    color: rule.enabled ? theme.palette.success.main : theme.palette.text.disabled,
                    width: 48,
                    height: 48,
                  }}
                >
                  <Repeat />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {rule.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {rule.description}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Stack direction="row" alignItems="center" spacing={1}>
              <Chip
                label={rule.frequency}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ textTransform: 'capitalize' }}
              />
              <Switch
                checked={rule.enabled}
                onChange={(e) => handleRuleToggle(rule.id, e.target.checked)}
                color="primary"
              />
              <IconButton onClick={() => toggleRuleExpanded(rule.id)}>
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Stack>
          </Stack>

          {/* Quick Stats */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <Typography variant="h6" fontWeight={600} color="primary.main">
                  {rule.analytics.totalScheduled}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Posts
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                <Typography variant="h6" fontWeight={600} color="success.main">
                  {successRate.toFixed(1)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Success Rate
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                <Typography variant="h6" fontWeight={600} color="info.main">
                  {rule.analytics.averageEngagement}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Avg Engagement
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
                <Typography variant="h6" fontWeight={600} color="warning.main">
                  {nextRun ? format(nextRun, 'MMM d') : 'N/A'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Next Run
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Platforms & Schedule */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Stack direction="row" spacing={0.5}>
              {rule.platforms.map((platform) => (
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
            <Stack direction="row" alignItems="center" spacing={1}>
              <AccessTime sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
              <Typography variant="body2" color="text.secondary">
                {rule.times.join(', ')}
              </Typography>
            </Stack>
          </Stack>

          {/* Expanded Details */}
          <Collapse in={isExpanded}>
            <Box sx={{ pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <Grid container spacing={3}>
                {/* Schedule Configuration */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                    Schedule Configuration
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Frequency
                      </Typography>
                      <Typography variant="body2">
                        Every {rule.interval} {rule.frequency}
                        {rule.daysOfWeek && rule.daysOfWeek.length > 0 && (
                          <span> on {rule.daysOfWeek.map(day => 
                            ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]
                          ).join(', ')}</span>
                        )}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Times
                      </Typography>
                      <Stack direction="row" spacing={0.5}>
                        {rule.times.map((time) => (
                          <Chip key={time} label={time} size="small" variant="outlined" />
                        ))}
                      </Stack>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Duration
                      </Typography>
                      <Typography variant="body2">
                        {format(rule.scheduling.startDate, 'MMM d, yyyy')} - {
                          rule.scheduling.endDate 
                            ? format(rule.scheduling.endDate, 'MMM d, yyyy')
                            : rule.scheduling.maxPosts 
                            ? `${rule.scheduling.maxPosts} posts`
                            : 'Indefinite'
                        }
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                {/* Content Template */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                    Content Template
                  </Typography>
                  {rule.contentTemplate ? (
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Title Template
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          p: 1, 
                          borderRadius: 1, 
                          bgcolor: alpha(theme.palette.background.paper, 0.5),
                          fontSize: '0.8rem',
                        }}>
                          {rule.contentTemplate.title}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Content Template
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          p: 1, 
                          borderRadius: 1, 
                          bgcolor: alpha(theme.palette.background.paper, 0.5),
                          fontSize: '0.8rem',
                          maxHeight: 100,
                          overflow: 'hidden',
                        }}>
                          {rule.contentTemplate.content}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Tags
                        </Typography>
                        <Stack direction="row" spacing={0.5}>
                          {rule.contentTemplate.tags.map((tag) => (
                            <Chip key={tag} label={tag} size="small" variant="outlined" />
                          ))}
                        </Stack>
                      </Box>
                    </Stack>
                  ) : (
                    <Alert severity="info">
                      No content template configured. Posts will need manual content.
                    </Alert>
                  )}
                </Grid>

                {/* Optimization Settings */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                    Optimization Settings
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Stack alignItems="center" sx={{ p: 1, textAlign: 'center' }}>
                        <AutoAwesome color={rule.optimization.adaptTiming ? 'primary' : 'disabled'} />
                        <Typography variant="caption" color={rule.optimization.adaptTiming ? 'primary.main' : 'text.disabled'}>
                          Adaptive Timing
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Stack alignItems="center" sx={{ p: 1, textAlign: 'center' }}>
                        <CalendarMonth color={rule.optimization.skipWeekends ? 'primary' : 'disabled'} />
                        <Typography variant="caption" color={rule.optimization.skipWeekends ? 'primary.main' : 'text.disabled'}>
                          Skip Weekends
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Stack alignItems="center" sx={{ p: 1, textAlign: 'center' }}>
                        <Speed color={rule.optimization.respectRateLimit ? 'primary' : 'disabled'} />
                        <Typography variant="caption" color={rule.optimization.respectRateLimit ? 'primary.main' : 'text.disabled'}>
                          Rate Limiting
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Stack alignItems="center" sx={{ p: 1, textAlign: 'center' }}>
                        <AccessTime color="primary" />
                        <Typography variant="caption" color="primary.main">
                          {rule.optimization.optimalSpacing}h Spacing
                        </Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              {/* Actions */}
              <Stack direction="row" spacing={1} sx={{ mt: 3, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => handleRuleEdit(rule)}
                  sx={{ borderRadius: 2 }}
                >
                  Edit Rule
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ContentCopy />}
                  sx={{ borderRadius: 2 }}
                >
                  Duplicate
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Analytics />}
                  sx={{ borderRadius: 2 }}
                >
                  View Analytics
                </Button>
                <Box sx={{ flex: 1 }} />
                <Button
                  variant="outlined"
                  startIcon={<Delete />}
                  color="error"
                  onClick={() => handleRuleDelete(rule.id)}
                  sx={{ borderRadius: 2 }}
                >
                  Delete
                </Button>
              </Stack>
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    );
  };

  // Render upcoming posts
  const renderUpcomingPosts = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
            Upcoming Recurring Posts
          </Typography>
          <Stack spacing={2}>
            {upcomingPosts.map((post) => (
              <Card key={post.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {post.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ 
                        display: '-webkit-box', 
                        WebkitLineClamp: 2, 
                        WebkitBoxOrient: 'vertical', 
                        overflow: 'hidden' 
                      }}>
                        {post.content}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Repeat sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                        <Typography variant="caption" color="text.secondary">
                          {post.ruleName}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <AccessTime sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                        <Typography variant="body2">
                          {format(post.scheduledAt, 'MMM d, HH:mm')}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5}>
                        {post.platforms.map((platform) => (
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
                    </Stack>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Stack alignItems="flex-end" spacing={1}>
                      <Chip
                        label={post.status}
                        size="small"
                        color={post.status === 'published' ? 'success' : post.status === 'failed' ? 'error' : 'primary'}
                        variant={post.status === 'scheduled' ? 'outlined' : 'filled'}
                      />
                      {post.optimizationScore && (
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <AutoAwesome sx={{ fontSize: 14, color: theme.palette.success.main }} />
                          <Typography variant="caption" color="success.main" fontWeight={600}>
                            {post.optimizationScore}% optimized
                          </Typography>
                        </Stack>
                      )}
                      {post.adaptedTiming && (
                        <Tooltip title="Timing adapted for optimal engagement">
                          <Chip
                            label="Adaptive"
                            size="small"
                            color="success"
                            variant="outlined"
                            icon={<TrendingUp sx={{ fontSize: 14 }} />}
                          />
                        </Tooltip>
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              </Card>
            ))}
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );

  // Create Rule Dialog Component
  const CreateRuleDialog = () => {
    const [newRule, setNewRule] = useState({
      name: '',
      description: '',
      frequency: 'weekly' as const,
      interval: 1,
      daysOfWeek: [] as number[],
      times: ['09:00'],
      platforms: [] as string[],
      contentTemplate: {
        title: '',
        content: '',
        tags: [] as string[],
      },
    });

    const steps = ['Basic Info', 'Schedule', 'Content', 'Optimization'];

    const handleCreate = () => {
      const rule: Omit<RecurrenceRule, 'id' | 'analytics'> = {
        ...newRule,
        enabled: true,
        scheduling: {
          startDate: new Date(),
          timezone: 'UTC',
        },
        optimization: {
          adaptTiming: true,
          skipWeekends: false,
          skipHolidays: true,
          respectRateLimit: true,
          optimalSpacing: 4,
        },
      };
      onRuleCreate?.(rule);
      setCreateDialogOpen(false);
      setActiveStep(0);
    };

    return (
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            Create Recurring Schedule
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Rule Name"
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                placeholder="e.g., Weekly Marketing Tips"
              />
              <TextField
                fullWidth
                label="Description"
                value={newRule.description}
                onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                placeholder="Brief description of this recurring schedule"
                multiline
                rows={2}
              />
            </Stack>
          )}

          {activeStep === 1 && (
            <Stack spacing={3}>
              <FormControl fullWidth>
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={newRule.frequency}
                  onChange={(e) => setNewRule({ ...newRule, frequency: e.target.value as any })}
                  label="Frequency"
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
              
              {newRule.frequency === 'weekly' && (
                <Box>
                  <FormLabel component="legend">Days of Week</FormLabel>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                      <Chip
                        key={day}
                        label={day}
                        clickable
                        color={newRule.daysOfWeek.includes(index) ? 'primary' : 'default'}
                        onClick={() => {
                          const newDays = newRule.daysOfWeek.includes(index)
                            ? newRule.daysOfWeek.filter(d => d !== index)
                            : [...newRule.daysOfWeek, index];
                          setNewRule({ ...newRule, daysOfWeek: newDays });
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}

              <Box>
                <FormLabel component="legend">Publishing Times</FormLabel>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {newRule.times.map((time, index) => (
                    <TextField
                      key={index}
                      type="time"
                      value={time}
                      onChange={(e) => {
                        const newTimes = [...newRule.times];
                        newTimes[index] = e.target.value;
                        setNewRule({ ...newRule, times: newTimes });
                      }}
                      size="small"
                      sx={{ width: 150 }}
                    />
                  ))}
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => setNewRule({ ...newRule, times: [...newRule.times, '12:00'] })}
                    sx={{ width: 'fit-content' }}
                  >
                    Add Time
                  </Button>
                </Stack>
              </Box>
            </Stack>
          )}

          {activeStep === 2 && (
            <Stack spacing={3}>
              <Box>
                <FormLabel component="legend">Platforms</FormLabel>
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  {Object.entries(platformIcons).map(([platform, icon]) => (
                    <Grid item key={platform}>
                      <Chip
                        label={`${icon} ${platform}`}
                        clickable
                        color={newRule.platforms.includes(platform) ? 'primary' : 'default'}
                        onClick={() => {
                          const newPlatforms = newRule.platforms.includes(platform)
                            ? newRule.platforms.filter(p => p !== platform)
                            : [...newRule.platforms, platform];
                          setNewRule({ ...newRule, platforms: newPlatforms });
                        }}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <TextField
                fullWidth
                label="Content Template"
                value={newRule.contentTemplate.content}
                onChange={(e) => setNewRule({ 
                  ...newRule, 
                  contentTemplate: { ...newRule.contentTemplate, content: e.target.value } 
                })}
                placeholder="Use variables like {tip}, {quote}, {week}, {month}"
                multiline
                rows={4}
                helperText="Use {} variables for dynamic content generation"
              />
            </Stack>
          )}

          {activeStep === 3 && (
            <Stack spacing={3}>
              <Alert severity="info">
                Optimization settings help improve post performance automatically.
              </Alert>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Adapt timing based on audience activity"
              />
              <FormControlLabel
                control={<Switch />}
                label="Skip weekends"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Skip holidays"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Respect platform rate limits"
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setCreateDialogOpen(false)} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          {activeStep > 0 && (
            <Button onClick={() => setActiveStep(activeStep - 1)} sx={{ borderRadius: 2 }}>
              Back
            </Button>
          )}
          {activeStep < steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={() => setActiveStep(activeStep + 1)}
              disabled={activeStep === 0 && !newRule.name}
              sx={{ borderRadius: 2 }}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleCreate}
              disabled={!newRule.name || !newRule.platforms.length}
              sx={{ borderRadius: 2 }}
            >
              Create Rule
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)` }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Repeat color="primary" />
              Recurring Scheduler
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Automate your content publishing with intelligent recurring schedules
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{
              borderRadius: 3,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}
          >
            Create Rule
          </Button>
        </Stack>

        {/* Summary Stats */}
        <Grid container spacing={3}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
              <Typography variant="h4" fontWeight={600} color="success.main">
                {activeRules.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Rules
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <Typography variant="h4" fontWeight={600} color="primary.main">
                {upcomingPosts.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upcoming Posts
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
              <Typography variant="h4" fontWeight={600} color="info.main">
                {rules.reduce((sum, rule) => sum + rule.analytics.published, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Posts Published
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
              <Typography variant="h4" fontWeight={600} color="warning.main">
                {(rules.reduce((sum, rule) => sum + rule.analytics.averageEngagement, 0) / rules.length).toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Engagement
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* View Mode Toggle */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1}>
            <Button
              variant={viewMode === 'rules' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('rules')}
              sx={{ borderRadius: 2 }}
            >
              Rules ({rules.length})
            </Button>
            <Button
              variant={viewMode === 'upcoming' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('upcoming')}
              sx={{ borderRadius: 2 }}
            >
              Upcoming ({upcomingPosts.length})
            </Button>
            <Button
              variant={viewMode === 'history' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('history')}
              sx={{ borderRadius: 2 }}
            >
              History
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Content */}
      {viewMode === 'rules' && (
        <Box>
          {/* Active Rules */}
          {activeRules.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'success.main' }}>
                Active Rules ({activeRules.length})
              </Typography>
              {activeRules.map(renderRuleCard)}
            </Box>
          )}

          {/* Inactive Rules */}
          {inactiveRules.length > 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}>
                Inactive Rules ({inactiveRules.length})
              </Typography>
              {inactiveRules.map(renderRuleCard)}
            </Box>
          )}

          {rules.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
              <Repeat sx={{ fontSize: 64, color: theme.palette.text.secondary, mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No recurring rules created
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create your first recurring schedule to automate content publishing
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCreateDialogOpen(true)}
                sx={{ borderRadius: 3 }}
              >
                Create Your First Rule
              </Button>
            </Paper>
          )}
        </Box>
      )}

      {viewMode === 'upcoming' && renderUpcomingPosts()}

      {viewMode === 'history' && (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Timeline sx={{ fontSize: 64, color: theme.palette.text.secondary, mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            History view coming soon
          </Typography>
        </Paper>
      )}

      {/* Create Rule Dialog */}
      <CreateRuleDialog />

      {/* AI Insights */}
      <Paper sx={{ p: 3, mt: 3, borderRadius: 3, bgcolor: alpha(theme.palette.info.main, 0.05), border: `1px solid ${alpha(theme.palette.info.main, 0.2)}` }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Psychology color="info" />
          <Typography variant="h6" fontWeight={600}>
            Recurring Schedule Optimization
          </Typography>
        </Stack>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Stack alignItems="center" sx={{ p: 2, textAlign: 'center' }}>
              <AutoAwesome sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 1 }} />
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                Smart Timing
              </Typography>
              <Typography variant="body2" color="text.secondary">
                AI automatically adjusts posting times based on your audience's activity patterns for optimal engagement.
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack alignItems="center" sx={{ p: 2, textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 48, color: theme.palette.success.main, mb: 1 }} />
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                Performance Learning
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rules learn from past performance to improve content templates and scheduling patterns automatically.
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack alignItems="center" sx={{ p: 2, textAlign: 'center' }}>
              <Speed sx={{ fontSize: 48, color: theme.palette.warning.main, mb: 1 }} />
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                Rate Optimization
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Intelligent rate limiting ensures your recurring posts don't overwhelm your audience or hit platform limits.
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};