import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Stack,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Switch,
  FormControlLabel,
  TextField,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Divider,
  LinearProgress,
  Alert,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  Schedule,
  AutoAwesome,
  Timeline,
  CalendarMonth,
  FilterList,
  Upload,
  Download,
  PlayArrow,
  Pause,
  Stop,
  CheckCircle,
  Error as ErrorIcon,
  Warning,
  Info,
  Close,
  DragHandle,
  Visibility,
  Analytics,
  Share,
  ContentCopy,
} from '@mui/icons-material';
import { format, addDays, addHours, parseISO } from 'date-fns';

interface BulkContent {
  id: string;
  title: string;
  content: string;
  platforms: string[];
  media?: { url: string; type: string }[];
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'scheduled' | 'published' | 'failed' | 'cancelled';
  scheduledAt?: Date;
  estimatedReach?: number;
  optimizationScore?: number;
}

interface SchedulingRule {
  id: string;
  name: string;
  enabled: boolean;
  platforms: string[];
  timeSlots: string[];
  daysOfWeek: number[];
  spacing: number; // hours between posts
  priority: 'low' | 'medium' | 'high';
}

interface BulkSchedulerProps {
  content?: BulkContent[];
  onSchedule?: (scheduledContent: BulkContent[]) => void;
  onSave?: (rules: SchedulingRule[]) => void;
  loading?: boolean;
}

const platformIcons: Record<string, string> = {
  linkedin: '💼',
  twitter: '🐦',
  instagram: '📷',
  facebook: '📘',
  youtube: '📺',
  tiktok: '🎵',
};

const platformColors: Record<string, string> = {
  linkedin: '#0A66C2',
  twitter: '#1DA1F2',
  instagram: '#E4405F',
  facebook: '#1877F2',
  youtube: '#FF0000',
  tiktok: '#000000',
};

// Mock content data
const mockBulkContent: BulkContent[] = [
  {
    id: '1',
    title: 'Weekly Marketing Tips',
    content: '🚀 5 proven strategies to boost your social media engagement...',
    platforms: ['linkedin', 'twitter', 'instagram'],
    tags: ['marketing', 'tips', 'engagement'],
    priority: 'high',
    status: 'pending',
    estimatedReach: 15000,
    optimizationScore: 92,
  },
  {
    id: '2',
    title: 'Product Feature Highlight',
    content: '✨ Introducing our latest AI-powered analytics dashboard...',
    platforms: ['linkedin', 'twitter'],
    tags: ['product', 'announcement', 'AI'],
    priority: 'medium',
    status: 'pending',
    estimatedReach: 12000,
    optimizationScore: 88,
  },
  {
    id: '3',
    title: 'Behind the Scenes',
    content: '👀 Take a look at our creative process and team culture...',
    platforms: ['instagram', 'tiktok'],
    tags: ['culture', 'team', 'process'],
    priority: 'low',
    status: 'pending',
    estimatedReach: 8500,
    optimizationScore: 75,
  },
  {
    id: '4',
    title: 'Industry Insights Report',
    content: '📊 Our latest research reveals key trends in social media...',
    platforms: ['linkedin', 'twitter', 'facebook'],
    tags: ['research', 'insights', 'trends'],
    priority: 'high',
    status: 'pending',
    estimatedReach: 20000,
    optimizationScore: 95,
  },
  {
    id: '5',
    title: 'Customer Success Story',
    content: '🎉 See how @client increased their engagement by 300%...',
    platforms: ['linkedin', 'twitter', 'facebook'],
    tags: ['success', 'testimonial', 'case-study'],
    priority: 'medium',
    status: 'pending',
    estimatedReach: 18000,
    optimizationScore: 90,
  },
];

const defaultSchedulingRules: SchedulingRule[] = [
  {
    id: '1',
    name: 'LinkedIn Business Hours',
    enabled: true,
    platforms: ['linkedin'],
    timeSlots: ['09:00', '12:00', '17:00'],
    daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
    spacing: 4,
    priority: 'high',
  },
  {
    id: '2',
    name: 'Social Media Prime Time',
    enabled: true,
    platforms: ['twitter', 'instagram', 'facebook'],
    timeSlots: ['19:00', '20:00', '21:00'],
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // All days
    spacing: 2,
    priority: 'medium',
  },
  {
    id: '3',
    name: 'Video Content Schedule',
    enabled: false,
    platforms: ['youtube', 'tiktok'],
    timeSlots: ['15:00', '18:00'],
    daysOfWeek: [2, 4, 6], // Tuesday, Thursday, Saturday
    spacing: 24,
    priority: 'medium',
  },
];

export const BulkScheduler: React.FC<BulkSchedulerProps> = ({
  content = mockBulkContent,
  onSchedule,
  onSave,
  loading = false,
}) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedContent, setSelectedContent] = useState<string[]>([]);
  const [schedulingRules, setSchedulingRules] = useState<SchedulingRule[]>(defaultSchedulingRules);
  const [bulkContent, setBulkContent] = useState<BulkContent[]>(content);
  const [showPreview, setShowPreview] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [schedulingProgress, setSchedulingProgress] = useState(0);
  const [schedulingResults, setSchedulingResults] = useState<{ success: number; failed: number; total: number } | null>(null);

  const steps = ['Select Content', 'Configure Rules', 'Preview Schedule', 'Execute Scheduling'];

  // Handle content selection
  const handleContentSelect = (contentId: string) => {
    setSelectedContent(prev => 
      prev.includes(contentId) 
        ? prev.filter(id => id !== contentId)
        : [...prev, contentId]
    );
  };

  const handleSelectAll = () => {
    setSelectedContent(
      selectedContent.length === bulkContent.length 
        ? [] 
        : bulkContent.map(c => c.id)
    );
  };

  // Handle scheduling rules
  const handleRuleToggle = (ruleId: string) => {
    setSchedulingRules(prev => 
      prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, enabled: !rule.enabled }
          : rule
      )
    );
  };

  const handleRuleUpdate = (ruleId: string, updates: Partial<SchedulingRule>) => {
    setSchedulingRules(prev => 
      prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, ...updates }
          : rule
      )
    );
  };

  // Auto-schedule algorithm
  const generateSchedule = useCallback(() => {
    const enabledRules = schedulingRules.filter(rule => rule.enabled);
    const contentToSchedule = bulkContent.filter(c => selectedContent.includes(c.id));
    const scheduledContent: BulkContent[] = [];

    let currentDate = new Date();
    
    // Sort content by priority
    const sortedContent = [...contentToSchedule].sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    for (const content of sortedContent) {
      let scheduled = false;
      
      // Find the best rule for this content
      for (const rule of enabledRules) {
        const contentPlatforms = content.platforms;
        const rulePlatforms = rule.platforms;
        
        // Check if content platforms match rule platforms
        const hasMatchingPlatform = contentPlatforms.some(platform => 
          rulePlatforms.includes(platform)
        );
        
        if (hasMatchingPlatform) {
          // Find next available time slot
          for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
            const checkDate = addDays(currentDate, dayOffset);
            const dayOfWeek = checkDate.getDay();
            
            if (rule.daysOfWeek.includes(dayOfWeek)) {
              for (const timeSlot of rule.timeSlots) {
                const [hours, minutes] = timeSlot.split(':').map(Number);
                const scheduleTime = new Date(checkDate);
                scheduleTime.setHours(hours, minutes, 0, 0);
                
                // Check if this time slot is available (no conflicts)
                const hasConflict = scheduledContent.some(sc => 
                  sc.scheduledAt && 
                  Math.abs(sc.scheduledAt.getTime() - scheduleTime.getTime()) < rule.spacing * 60 * 60 * 1000
                );
                
                if (!hasConflict && scheduleTime > currentDate) {
                  scheduledContent.push({
                    ...content,
                    scheduledAt: scheduleTime,
                    status: 'scheduled',
                  });
                  scheduled = true;
                  break;
                }
              }
              
              if (scheduled) break;
            }
          }
          
          if (scheduled) break;
        }
      }
      
      // If no rule matched, schedule for next business day at 9 AM
      if (!scheduled) {
        const nextBusinessDay = addDays(currentDate, 1);
        nextBusinessDay.setHours(9, 0, 0, 0);
        scheduledContent.push({
          ...content,
          scheduledAt: nextBusinessDay,
          status: 'scheduled',
        });
      }
    }

    setBulkContent(prev => 
      prev.map(content => {
        const scheduled = scheduledContent.find(sc => sc.id === content.id);
        return scheduled || content;
      })
    );

    return scheduledContent;
  }, [selectedContent, schedulingRules, bulkContent]);

  // Execute scheduling
  const handleExecuteScheduling = async () => {
    setScheduling(true);
    setSchedulingProgress(0);
    
    const scheduledContent = generateSchedule();
    const total = scheduledContent.length;
    let success = 0;
    let failed = 0;

    // Simulate scheduling process
    for (let i = 0; i < total; i++) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      
      // Simulate success/failure (90% success rate)
      if (Math.random() > 0.1) {
        success++;
      } else {
        failed++;
      }
      
      setSchedulingProgress(((i + 1) / total) * 100);
    }

    setSchedulingResults({ success, failed, total });
    setScheduling(false);
    onSchedule?.(scheduledContent);
  };

  // Render content selection step
  const renderContentSelection = () => (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={600}>
          Select Content to Schedule
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            size="small"
            sx={{ borderRadius: 2 }}
          >
            Filter
          </Button>
          <Button
            variant="outlined"
            startIcon={<Upload />}
            size="small"
            sx={{ borderRadius: 2 }}
          >
            Import CSV
          </Button>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedContent.length === bulkContent.length}
                indeterminate={selectedContent.length > 0 && selectedContent.length < bulkContent.length}
                onChange={handleSelectAll}
              />
            }
            label="Select All"
          />
        </Stack>
      </Stack>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedContent.length === bulkContent.length}
                  indeterminate={selectedContent.length > 0 && selectedContent.length < bulkContent.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Content</TableCell>
              <TableCell>Platforms</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Estimated Reach</TableCell>
              <TableCell>Optimization Score</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bulkContent.map((content) => (
              <TableRow key={content.id} hover>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedContent.includes(content.id)}
                    onChange={() => handleContentSelect(content.id)}
                  />
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {content.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {content.content}
                    </Typography>
                    <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
                      {content.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  </Box>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5}>
                    {content.platforms.map((platform) => (
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
                </TableCell>
                <TableCell>
                  <Chip
                    label={content.priority}
                    size="small"
                    color={content.priority === 'urgent' ? 'error' : content.priority === 'high' ? 'warning' : content.priority === 'medium' ? 'info' : 'default'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {content.estimatedReach?.toLocaleString() || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body2" fontWeight={600} color={content.optimizationScore && content.optimizationScore >= 90 ? 'success.main' : content.optimizationScore && content.optimizationScore >= 70 ? 'warning.main' : 'error.main'}>
                      {content.optimizationScore || 'N/A'}%
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5}>
                    <IconButton size="small">
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton size="small">
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small">
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {selectedContent.length} of {bulkContent.length} content items selected
        </Typography>
      </Box>
    </Box>
  );

  // Render scheduling rules step
  const renderSchedulingRules = () => (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={600}>
          Configure Scheduling Rules
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Add />}
          size="small"
          sx={{ borderRadius: 2 }}
        >
          Add Rule
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {schedulingRules.map((rule) => (
          <Grid item xs={12} md={6} key={rule.id}>
            <Card sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {rule.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {rule.enabled ? 'Active' : 'Inactive'} • {rule.platforms.length} platforms
                    </Typography>
                  </Box>
                  <Switch
                    checked={rule.enabled}
                    onChange={() => handleRuleToggle(rule.id)}
                    color="primary"
                  />
                </Stack>

                <Collapse in={rule.enabled}>
                  <Stack spacing={2}>
                    {/* Platforms */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Platforms
                      </Typography>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {rule.platforms.map((platform) => (
                          <Chip
                            key={platform}
                            label={`${platformIcons[platform]} ${platform}`}
                            size="small"
                            variant="outlined"
                            sx={{ mb: 0.5 }}
                          />
                        ))}
                      </Stack>
                    </Box>

                    {/* Time Slots */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Time Slots
                      </Typography>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {rule.timeSlots.map((time) => (
                          <Chip
                            key={time}
                            label={time}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ mb: 0.5 }}
                          />
                        ))}
                      </Stack>
                    </Box>

                    {/* Days of Week */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Days of Week
                      </Typography>
                      <Stack direction="row" spacing={0.5}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                          <Chip
                            key={day}
                            label={day}
                            size="small"
                            color={rule.daysOfWeek.includes(index) ? 'primary' : 'default'}
                            variant={rule.daysOfWeek.includes(index) ? 'filled' : 'outlined'}
                          />
                        ))}
                      </Stack>
                    </Box>

                    {/* Spacing */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Minimum Spacing: {rule.spacing} hours
                      </Typography>
                    </Box>
                  </Stack>
                </Collapse>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  // Render preview step
  const renderPreview = () => {
    const scheduledContent = generateSchedule();
    
    return (
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={600}>
            Preview Schedule
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              size="small"
              sx={{ borderRadius: 2 }}
            >
              Export Schedule
            </Button>
            <Button
              variant="outlined"
              startIcon={<AutoAwesome />}
              size="small"
              sx={{ borderRadius: 2 }}
              onClick={generateSchedule}
            >
              Regenerate
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={3}>
          {/* Schedule Summary */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 2, height: 'fit-content' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Schedule Summary
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Content
                  </Typography>
                  <Typography variant="h5" fontWeight={600}>
                    {scheduledContent.length}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Date Range
                  </Typography>
                  <Typography variant="body1">
                    {scheduledContent.length > 0 ? (
                      `${format(scheduledContent[0].scheduledAt!, 'MMM d')} - ${format(scheduledContent[scheduledContent.length - 1].scheduledAt!, 'MMM d')}`
                    ) : 'No content scheduled'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Platforms
                  </Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                    {Array.from(new Set(scheduledContent.flatMap(c => c.platforms))).map((platform) => (
                      <Chip
                        key={platform}
                        label={platformIcons[platform]}
                        size="small"
                        sx={{ mb: 0.5 }}
                      />
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Schedule Timeline */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 2, maxHeight: 400, overflow: 'auto' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Scheduled Content Timeline
              </Typography>
              <Stack spacing={2}>
                {scheduledContent
                  .sort((a, b) => (a.scheduledAt?.getTime() || 0) - (b.scheduledAt?.getTime() || 0))
                  .map((content) => (
                  <Box key={content.id} sx={{ display: 'flex', alignItems: 'center', p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.background.paper, 0.5), border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    <Box sx={{ width: 120, flexShrink: 0 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {content.scheduledAt ? format(content.scheduledAt, 'MMM d') : 'Unscheduled'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {content.scheduledAt ? format(content.scheduledAt, 'HH:mm') : 'No time'}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, mx: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {content.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {content.content}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={0.5}>
                      {content.platforms.map((platform) => (
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
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

  // Render execution step
  const renderExecution = () => (
    <Box>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
        Execute Bulk Scheduling
      </Typography>

      {!scheduling && !schedulingResults && (
        <Paper sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
          <Schedule sx={{ fontSize: 64, color: theme.palette.primary.main, mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>
            Ready to Schedule {selectedContent.length} Content Items
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
            This will schedule all selected content according to your configured rules. The process cannot be undone.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrow />}
            onClick={handleExecuteScheduling}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}
          >
            Execute Scheduling
          </Button>
        </Paper>
      )}

      {scheduling && (
        <Paper sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Scheduling in Progress...
            </Typography>
            <LinearProgress
              variant="determinate"
              value={schedulingProgress}
              sx={{ height: 8, borderRadius: 4, mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              {Math.round(schedulingProgress)}% complete
            </Typography>
          </Box>
        </Paper>
      )}

      {schedulingResults && (
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <CheckCircle sx={{ fontSize: 32, color: theme.palette.success.main }} />
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Scheduling Complete!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your content has been scheduled successfully
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                <Typography variant="h4" fontWeight={600} color="success.main">
                  {schedulingResults.success}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Successfully Scheduled
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.05) }}>
                <Typography variant="h4" fontWeight={600} color="error.main">
                  {schedulingResults.failed}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Failed
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <Typography variant="h4" fontWeight={600} color="primary.main">
                  {schedulingResults.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Processed
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="outlined"
              startIcon={<CalendarMonth />}
              sx={{ borderRadius: 2 }}
            >
              View Calendar
            </Button>
            <Button
              variant="outlined"
              startIcon={<Analytics />}
              sx={{ borderRadius: 2 }}
            >
              View Analytics
            </Button>
          </Stack>
        </Paper>
      )}
    </Box>
  );

  const handleNext = () => {
    if (activeStep === 2) {
      // Generate schedule before moving to execution step
      generateSchedule();
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedContent([]);
    setSchedulingResults(null);
    setSchedulingProgress(0);
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6">Loading bulk scheduler...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
          Bulk Content Scheduler
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Schedule multiple posts across platforms with intelligent timing optimization
        </Typography>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Step Content */}
      <Box sx={{ mb: 4 }}>
        {activeStep === 0 && renderContentSelection()}
        {activeStep === 1 && renderSchedulingRules()}
        {activeStep === 2 && renderPreview()}
        {activeStep === 3 && renderExecution()}
      </Box>

      {/* Navigation */}
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ borderRadius: 2 }}
          >
            Back
          </Button>
          
          <Typography variant="body2" color="text.secondary">
            Step {activeStep + 1} of {steps.length}
          </Typography>
          
          <Stack direction="row" spacing={2}>
            {activeStep === steps.length - 1 ? (
              <Button
                onClick={handleReset}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                Schedule More
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={activeStep === 0 && selectedContent.length === 0}
                sx={{ borderRadius: 2 }}
              >
                {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};