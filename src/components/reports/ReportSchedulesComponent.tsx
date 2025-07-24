/**
 * Report Schedules Component
 * 
 * Manages automated report schedules with creation, editing, and monitoring capabilities.
 * Shows schedule status, next run times, and delivery information.
 * 
 * @component ReportSchedulesComponent
 * @version 1.0.0
 */

import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Typography,
  Button,
  Switch,
  Avatar,
  Stack,
  Skeleton,
  Alert,
  Tooltip,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Play as PlayIcon,
  Pause as PauseIcon,
  Email as EmailIcon,
  Add as AddIcon,
  AccessTime as AccessTimeIcon,
  Group as GroupIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import {
  ReportSchedule,
  useUpdateReportScheduleMutation,
  useDeleteReportScheduleMutation,
} from '../../store/api/reportGenerationApi';

interface ReportSchedulesComponentProps {
  schedules: ReportSchedule[];
  loading: boolean;
  onCreateSchedule: () => void;
}

export const ReportSchedulesComponent: React.FC<ReportSchedulesComponentProps> = ({
  schedules,
  loading,
  onCreateSchedule,
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<ReportSchedule | null>(null);

  const [updateSchedule] = useUpdateReportScheduleMutation();
  const [deleteSchedule] = useDeleteReportScheduleMutation();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, schedule: ReportSchedule) => {
    setMenuAnchor(event.currentTarget);
    setSelectedSchedule(schedule);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedSchedule(null);
  };

  const handleToggleActive = async (schedule: ReportSchedule) => {
    try {
      await updateSchedule({
        scheduleId: schedule.id,
        data: { isActive: !schedule.isActive },
      }).unwrap();
    } catch (error) {
      console.error('Failed to update schedule:', error);
    }
  };

  const handleDelete = async () => {
    if (selectedSchedule) {
      try {
        await deleteSchedule(selectedSchedule.id).unwrap();
      } catch (error) {
        console.error('Failed to delete schedule:', error);
      }
    }
    handleMenuClose();
  };

  const getFrequencyIcon = (frequency: string) => {
    return <ScheduleIcon />;
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return 'success';
      case 'weekly':
        return 'primary';
      case 'monthly':
        return 'warning';
      case 'quarterly':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatNextRun = (nextScheduled: string): string => {
    const date = new Date(nextScheduled);
    const now = new Date();
    
    if (date < now) {
      return 'Overdue';
    }
    
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const getStatusColor = (schedule: ReportSchedule) => {
    if (!schedule.isActive) return 'default';
    
    const nextRun = new Date(schedule.nextScheduled);
    const now = new Date();
    
    if (nextRun < now) return 'error';
    return 'success';
  };

  if (loading) {
    return (
      <Box>
        {Array.from(new Array(3)).map((_, index) => (
          <Skeleton key={index} variant="rectangular" height={80} sx={{ mb: 2 }} />
        ))}
      </Box>
    );
  }

  if (schedules.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.light', mx: 'auto', mb: 3 }}>
          <ScheduleIcon sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography variant="h6" gutterBottom>
          No Scheduled Reports
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Create automated report schedules to receive regular analytics updates
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateSchedule}
        >
          Create First Schedule
        </Button>
      </Box>
    );
  }

  const activeSchedules = schedules.filter(s => s.isActive);
  const inactiveSchedules = schedules.filter(s => !s.isActive);

  return (
    <Box>
      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ width: 50, height: 50, bgcolor: 'success.main', mx: 'auto', mb: 1 }}>
                <PlayIcon />
              </Avatar>
              <Typography variant="h6">{activeSchedules.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Active Schedules
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ width: 50, height: 50, bgcolor: 'info.main', mx: 'auto', mb: 1 }}>
                <AccessTimeIcon />
              </Avatar>
              <Typography variant="h6">
                {schedules.reduce((sum, s) => sum + s.recipients.length, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Recipients
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ width: 50, height: 50, bgcolor: 'warning.main', mx: 'auto', mb: 1 }}>
                <EmailIcon />
              </Avatar>
              <Typography variant="h6">
                {schedules.filter(s => s.lastGenerated).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Reports Sent
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Create New Button */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateSchedule}
        >
          Create Schedule
        </Button>
      </Box>

      {/* Schedules Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Schedule Name</TableCell>
              <TableCell>Frequency</TableCell>
              <TableCell>Next Run</TableCell>
              <TableCell>Recipients</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Generated</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedules.map((schedule) => (
              <TableRow key={schedule.id} hover>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2" noWrap sx={{ maxWidth: 200 }}>
                      {schedule.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Template: {schedule.templateId}
                    </Typography>
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Chip
                    icon={getFrequencyIcon(schedule.frequency)}
                    label={schedule.frequency}
                    color={getFrequencyColor(schedule.frequency) as any}
                    size="small"
                    variant="outlined"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </TableCell>
                
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      {format(new Date(schedule.nextScheduled), 'MMM dd, yyyy')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatNextRun(schedule.nextScheduled)}
                    </Typography>
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <GroupIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {schedule.recipients.length}
                    </Typography>
                    <Tooltip title={schedule.recipients.join(', ')}>
                      <Typography variant="caption" color="text.secondary">
                        recipient{schedule.recipients.length !== 1 ? 's' : ''}
                      </Typography>
                    </Tooltip>
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Switch
                      checked={schedule.isActive}
                      onChange={() => handleToggleActive(schedule)}
                      size="small"
                      color="primary"
                    />
                    <Chip
                      label={schedule.isActive ? 'Active' : 'Inactive'}
                      color={getStatusColor(schedule) as any}
                      size="small"
                      variant={schedule.isActive ? 'filled' : 'outlined'}
                    />
                  </Box>
                </TableCell>
                
                <TableCell>
                  {schedule.lastGenerated ? (
                    <Box>
                      <Typography variant="body2">
                        {format(new Date(schedule.lastGenerated), 'MMM dd, yyyy')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDistanceToNow(new Date(schedule.lastGenerated), { addSuffix: true })}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Never
                    </Typography>
                  )}
                </TableCell>
                
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, schedule)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Context Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={() => { /* Edit schedule */ handleMenuClose(); }}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Schedule
        </MenuItem>
        
        <MenuItem onClick={() => { /* Run now */ handleMenuClose(); }}>
          <PlayIcon sx={{ mr: 1 }} />
          Run Now
        </MenuItem>
        
        <MenuItem 
          onClick={() => { 
            if (selectedSchedule) {
              handleToggleActive(selectedSchedule);
            }
            handleMenuClose(); 
          }}
        >
          {selectedSchedule?.isActive ? <PauseIcon sx={{ mr: 1 }} /> : <PlayIcon sx={{ mr: 1 }} />}
          {selectedSchedule?.isActive ? 'Pause' : 'Activate'}
        </MenuItem>
        
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Schedule
        </MenuItem>
      </Menu>

      {/* Alerts */}
      {schedules.some(s => s.isActive && new Date(s.nextScheduled) < new Date()) && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Some scheduled reports are overdue. Check the schedule configuration and ensure the system is running properly.
        </Alert>
      )}
    </Box>
  );
};

export default ReportSchedulesComponent;