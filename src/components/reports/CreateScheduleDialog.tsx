/**
 * Create Schedule Dialog Component
 * 
 * Modal dialog for creating automated report schedules with template selection,
 * frequency configuration, recipient management, and delivery options.
 * 
 * @component CreateScheduleDialog
 * @version 1.0.0
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
  Grid,
  Chip,
  Stack,
  Alert,
  Paper,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Autocomplete,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Schedule as ScheduleIcon,
  Email as EmailIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  AccessTime as AccessTimeIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  ReportTemplate,
  ReportFilters,
  useCreateReportScheduleMutation,
} from '../../store/api/reportGenerationApi';

interface CreateScheduleDialogProps {
  open: boolean;
  onClose: () => void;
  templates: ReportTemplate[];
}

const frequencyOptions = [
  { value: 'daily', label: 'Daily', description: 'Every day at the specified time' },
  { value: 'weekly', label: 'Weekly', description: 'Every week on the selected day' },
  { value: 'monthly', label: 'Monthly', description: 'Every month on the selected date' },
  { value: 'quarterly', label: 'Quarterly', description: 'Every 3 months' },
];

const dayOfWeekOptions = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const timezoneOptions = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
];

const timeframeOptions = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 3 months' },
];

export const CreateScheduleDialog: React.FC<CreateScheduleDialogProps> = ({
  open,
  onClose,
  templates,
}) => {
  const [scheduleData, setScheduleData] = useState({
    name: '',
    templateId: '',
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly' | 'quarterly',
    dayOfWeek: 1, // Monday
    dayOfMonth: 1,
    time: new Date(),
    timezone: 'America/New_York',
    recipients: [] as string[],
    filters: {
      timeframe: '30d',
      platforms: [],
      contentTypes: [],
      includeCompetitors: false,
    } as ReportFilters,
  });

  const [newRecipient, setNewRecipient] = useState('');
  const [createSchedule, { isLoading, error }] = useCreateReportScheduleMutation();

  const handleInputChange = (field: string, value: any) => {
    setScheduleData(prev => ({ ...prev, [field]: value }));
  };

  const handleFilterChange = (field: keyof ReportFilters, value: any) => {
    setScheduleData(prev => ({
      ...prev,
      filters: { ...prev.filters, [field]: value },
    }));
  };

  const handleAddRecipient = () => {
    if (newRecipient && !scheduleData.recipients.includes(newRecipient)) {
      setScheduleData(prev => ({
        ...prev,
        recipients: [...prev.recipients, newRecipient],
      }));
      setNewRecipient('');
    }
  };

  const handleRemoveRecipient = (email: string) => {
    setScheduleData(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r !== email),
    }));
  };

  const handleCreateSchedule = async () => {
    try {
      const timeString = scheduleData.time.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      });

      const payload = {
        name: scheduleData.name,
        templateId: scheduleData.templateId,
        frequency: scheduleData.frequency,
        ...(scheduleData.frequency === 'weekly' && { dayOfWeek: scheduleData.dayOfWeek }),
        ...(scheduleData.frequency === 'monthly' && { dayOfMonth: scheduleData.dayOfMonth }),
        time: timeString,
        timezone: scheduleData.timezone,
        recipients: scheduleData.recipients,
        filters: scheduleData.filters,
      };

      await createSchedule(payload).unwrap();
      onClose();
      
      // Reset form
      setScheduleData({
        name: '',
        templateId: '',
        frequency: 'weekly',
        dayOfWeek: 1,
        dayOfMonth: 1,
        time: new Date(),
        timezone: 'America/New_York',
        recipients: [],
        filters: {
          timeframe: '30d',
          platforms: [],
          contentTypes: [],
          includeCompetitors: false,
        },
      });
    } catch (error) {
      console.error('Failed to create schedule:', error);
    }
  };

  const selectedTemplate = templates.find(t => t.id === scheduleData.templateId);
  const isFormValid = scheduleData.name && 
                     scheduleData.templateId && 
                     scheduleData.recipients.length > 0;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { minHeight: '70vh' } }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScheduleIcon color="primary" />
            <Typography variant="h6">Create Report Schedule</Typography>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Schedule Name"
                    value={scheduleData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    fullWidth
                    required
                    placeholder="e.g., Weekly Performance Report"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Report Template</InputLabel>
                    <Select
                      value={scheduleData.templateId}
                      onChange={(e) => handleInputChange('templateId', e.target.value)}
                      label="Report Template"
                    >
                      {templates.map((template) => (
                        <MenuItem key={template.id} value={template.id}>
                          <Box>
                            <Typography variant="subtitle2">{template.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {template.type} • {template.sections.length} sections
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            <Divider sx={{ width: '100%', my: 2 }} />

            {/* Schedule Configuration */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Schedule Configuration
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Frequency</InputLabel>
                    <Select
                      value={scheduleData.frequency}
                      onChange={(e) => handleInputChange('frequency', e.target.value)}
                      label="Frequency"
                    >
                      {frequencyOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Box>
                            <Typography variant="subtitle2">{option.label}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {option.description}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {scheduleData.frequency === 'weekly' && (
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Day of Week</InputLabel>
                      <Select
                        value={scheduleData.dayOfWeek}
                        onChange={(e) => handleInputChange('dayOfWeek', e.target.value)}
                        label="Day of Week"
                      >
                        {dayOfWeekOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                {scheduleData.frequency === 'monthly' && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Day of Month"
                      type="number"
                      value={scheduleData.dayOfMonth}
                      onChange={(e) => handleInputChange('dayOfMonth', parseInt(e.target.value))}
                      fullWidth
                      inputProps={{ min: 1, max: 31 }}
                    />
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <TimePicker
                    label="Time"
                    value={scheduleData.time}
                    onChange={(value) => handleInputChange('time', value)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Timezone</InputLabel>
                    <Select
                      value={scheduleData.timezone}
                      onChange={(e) => handleInputChange('timezone', e.target.value)}
                      label="Timezone"
                    >
                      {timezoneOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            <Divider sx={{ width: '100%', my: 2 }} />

            {/* Recipients */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Email Recipients
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  label="Email Address"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddRecipient()}
                  fullWidth
                  placeholder="user@example.com"
                />
                <Button
                  variant="outlined"
                  onClick={handleAddRecipient}
                  disabled={!newRecipient}
                  startIcon={<AddIcon />}
                >
                  Add
                </Button>
              </Box>

              {scheduleData.recipients.length > 0 && (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Recipients ({scheduleData.recipients.length})
                  </Typography>
                  <List dense>
                    {scheduleData.recipients.map((email) => (
                      <ListItem key={email}>
                        <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <ListItemText primary={email} />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => handleRemoveRecipient(email)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </Grid>

            {/* Report Filters */}
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">Report Filters (Optional)</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Timeframe</InputLabel>
                        <Select
                          value={scheduleData.filters.timeframe}
                          onChange={(e) => handleFilterChange('timeframe', e.target.value)}
                          label="Timeframe"
                        >
                          {timeframeOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={scheduleData.filters.includeCompetitors || false}
                            onChange={(e) => handleFilterChange('includeCompetitors', e.target.checked)}
                          />
                        }
                        label="Include Competitive Analysis"
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* Preview */}
            {selectedTemplate && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Schedule Preview
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      <strong>Report:</strong> {selectedTemplate.name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Frequency:</strong> {scheduleData.frequency} at {scheduleData.time.toLocaleTimeString()}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Recipients:</strong> {scheduleData.recipients.length} email{scheduleData.recipients.length !== 1 ? 's' : ''}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Timezone:</strong> {timezoneOptions.find(tz => tz.value === scheduleData.timezone)?.label}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
            )}
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Failed to create schedule. Please check your settings and try again.
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <LoadingButton
            onClick={handleCreateSchedule}
            loading={isLoading}
            variant="contained"
            disabled={!isFormValid}
            startIcon={<ScheduleIcon />}
          >
            Create Schedule
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default CreateScheduleDialog;