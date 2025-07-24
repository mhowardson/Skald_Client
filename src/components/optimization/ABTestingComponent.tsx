/**
 * A/B Testing Component
 * 
 * Comprehensive A/B testing interface for managing content experiments,
 * viewing results, and analyzing performance variations.
 * 
 * @component ABTestingComponent
 * @version 1.0.0
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Grid,
  Chip,
  Avatar,
  LinearProgress,
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
  Alert,
  Skeleton,
  Stack,
  Tooltip,
  Badge,
  Divider,
} from '@mui/material';
import {
  Science as ScienceIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Assessment as AssessmentIcon,
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Timeline as TimelineIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';
import {
  ABTestExperiment,
  useStartABTestMutation,
  useAnalyzeABTestMutation,
  useDeleteABTestMutation,
} from '../../store/api/aiContentOptimizationApi';

interface ABTestingComponentProps {
  experiments: ABTestExperiment[];
  loading: boolean;
  onCreateTest: () => void;
  onRefresh: () => void;
}

export const ABTestingComponent: React.FC<ABTestingComponentProps> = ({
  experiments,
  loading,
  onCreateTest,
  onRefresh,
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedExperiment, setSelectedExperiment] = useState<ABTestExperiment | null>(null);

  const [startABTest] = useStartABTestMutation();
  const [analyzeABTest] = useAnalyzeABTestMutation();
  const [deleteABTest] = useDeleteABTestMutation();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, experiment: ABTestExperiment) => {
    setMenuAnchor(event.currentTarget);
    setSelectedExperiment(experiment);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedExperiment(null);
  };

  const handleStartTest = async (experiment: ABTestExperiment) => {
    try {
      await startABTest(experiment.id).unwrap();
      onRefresh();
    } catch (error) {
      console.error('Failed to start A/B test:', error);
    }
    handleMenuClose();
  };

  const handleAnalyzeTest = async (experiment: ABTestExperiment) => {
    try {
      await analyzeABTest(experiment.id).unwrap();
      onRefresh();
    } catch (error) {
      console.error('Failed to analyze A/B test:', error);
    }
    handleMenuClose();
  };

  const handleDeleteTest = async (experiment: ABTestExperiment) => {
    try {
      await deleteABTest(experiment.id).unwrap();
      onRefresh();
    } catch (error) {
      console.error('Failed to delete A/B test:', error);
    }
    handleMenuClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'success';
      case 'completed':
        return 'primary';
      case 'paused':
        return 'warning';
      case 'draft':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <PlayIcon />;
      case 'completed':
        return <CheckCircleIcon />;
      case 'paused':
        return <PauseIcon />;
      case 'draft':
        return <ScheduleIcon />;
      default:
        return <ScienceIcon />;
    }
  };

  const calculateProgress = (experiment: ABTestExperiment): number => {
    if (experiment.status !== 'running' || !experiment.startedAt) return 0;
    
    const startDate = new Date(experiment.startedAt);
    const now = new Date();
    const daysRunning = differenceInDays(now, startDate);
    const progress = (daysRunning / experiment.testConfig.duration) * 100;
    
    return Math.min(progress, 100);
  };

  const formatDuration = (days: number): string => {
    if (days === 1) return '1 day';
    if (days < 7) return `${days} days`;
    if (days === 7) return '1 week';
    if (days < 30) return `${Math.round(days / 7)} weeks`;
    return `${Math.round(days / 30)} months`;
  };

  if (loading) {
    return (
      <Box>
        {Array.from(new Array(3)).map((_, index) => (
          <Skeleton key={index} variant="rectangular" height={120} sx={{ mb: 2 }} />
        ))}
      </Box>
    );
  }

  if (experiments.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.light', mx: 'auto', mb: 3 }}>
          <ScienceIcon sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography variant="h6" gutterBottom>
          No A/B Tests Yet
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Create your first A/B test to compare content variations and optimize performance
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateTest}
        >
          Create First A/B Test
        </Button>
      </Box>
    );
  }

  const runningTests = experiments.filter(exp => exp.status === 'running');
  const completedTests = experiments.filter(exp => exp.status === 'completed');
  const draftTests = experiments.filter(exp => exp.status === 'draft');

  return (
    <Box>
      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ width: 50, height: 50, bgcolor: 'success.main', mx: 'auto', mb: 1 }}>
                <PlayIcon />
              </Avatar>
              <Typography variant="h6">{runningTests.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Running Tests
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ width: 50, height: 50, bgcolor: 'primary.main', mx: 'auto', mb: 1 }}>
                <AssessmentIcon />
              </Avatar>
              <Typography variant="h6">{completedTests.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ width: 50, height: 50, bgcolor: 'warning.main', mx: 'auto', mb: 1 }}>
                <ScheduleIcon />
              </Avatar>
              <Typography variant="h6">{draftTests.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Drafts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ width: 50, height: 50, bgcolor: 'info.main', mx: 'auto', mb: 1 }}>
                <SpeedIcon />
              </Avatar>
              <Typography variant="h6">
                {completedTests.length > 0 
                  ? `${Math.round(completedTests.reduce((sum, exp) => 
                      sum + (exp.results?.improvementRate || 0), 0) / completedTests.length)}%`
                  : '0%'
                }
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Improvement
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
          onClick={onCreateTest}
        >
          Create A/B Test
        </Button>
      </Box>

      {/* Active Tests Alert */}
      {runningTests.length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You have {runningTests.length} active A/B test{runningTests.length > 1 ? 's' : ''} running. 
          Monitor their progress and analyze results when sufficient data is collected.
        </Alert>
      )}

      {/* Experiments Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Experiment</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell>Variants</TableCell>
              <TableCell>Success Metric</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Results</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {experiments.map((experiment) => (
              <TableRow key={experiment.id} hover>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2" noWrap sx={{ maxWidth: 200 }}>
                      {experiment.name}
                    </Typography>
                    {experiment.description && (
                      <Typography variant="caption" color="text.secondary">
                        {experiment.description}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Chip
                    icon={getStatusIcon(experiment.status)}
                    label={experiment.status}
                    color={getStatusColor(experiment.status) as any}
                    size="small"
                    variant="outlined"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </TableCell>
                
                <TableCell>
                  {experiment.status === 'running' ? (
                    <Box sx={{ width: '100%' }}>
                      <LinearProgress
                        variant="determinate"
                        value={calculateProgress(experiment)}
                        sx={{ mb: 0.5 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {calculateProgress(experiment).toFixed(0)}% complete
                      </Typography>
                    </Box>
                  ) : experiment.status === 'completed' ? (
                    <Typography variant="body2" color="success.main">
                      ✅ Complete
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Not started
                    </Typography>
                  )}
                </TableCell>
                
                <TableCell>
                  <Stack direction="row" spacing={0.5}>
                    {experiment.variants.map((variant, index) => (
                      <Tooltip key={variant.id} title={`${variant.name}: ${variant.allocation}%`}>
                        <Chip
                          label={`${variant.name.charAt(0)}${index + 1}`}
                          size="small"
                          variant="outlined"
                        />
                      </Tooltip>
                    ))}
                  </Stack>
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2">
                    {experiment.testConfig.successMetric}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {experiment.testConfig.confidenceLevel * 100}% confidence
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2">
                    {formatDuration(experiment.testConfig.duration)}
                  </Typography>
                  {experiment.startedAt && (
                    <Typography variant="caption" color="text.secondary">
                      Started {formatDistanceToNow(new Date(experiment.startedAt), { addSuffix: true })}
                    </Typography>
                  )}
                </TableCell>
                
                <TableCell>
                  {experiment.results ? (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TrendingUpIcon color="success" sx={{ fontSize: 16 }} />
                        <Typography variant="body2" fontWeight="medium">
                          +{experiment.results.improvementRate.toFixed(1)}%
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {experiment.results.confidence}% confidence
                      </Typography>
                    </Box>
                  ) : experiment.status === 'running' ? (
                    <Typography variant="body2" color="text.secondary">
                      Collecting data...
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No results yet
                    </Typography>
                  )}
                </TableCell>
                
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, experiment)}
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
        {selectedExperiment?.status === 'draft' && (
          <MenuItem onClick={() => handleStartTest(selectedExperiment)}>
            <PlayIcon sx={{ mr: 1 }} />
            Start Test
          </MenuItem>
        )}
        
        {selectedExperiment?.status === 'running' && (
          <MenuItem onClick={() => handleAnalyzeTest(selectedExperiment)}>
            <AssessmentIcon sx={{ mr: 1 }} />
            Analyze Results
          </MenuItem>
        )}
        
        <MenuItem onClick={() => { /* View details */ handleMenuClose(); }}>
          <VisibilityIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        
        {selectedExperiment?.status !== 'running' && (
          <MenuItem 
            onClick={() => handleDeleteTest(selectedExperiment!)} 
            sx={{ color: 'error.main' }}
          >
            <MoreVertIcon sx={{ mr: 1 }} />
            Delete Test
          </MenuItem>
        )}
      </Menu>

      {/* Winner Alert for Completed Tests */}
      {completedTests.length > 0 && (
        <Alert severity="success" sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            🏆 Latest Test Results
          </Typography>
          {completedTests.slice(0, 3).map((test) => (
            <Typography key={test.id} variant="body2">
              • {test.name}: {test.results?.improvementRate.toFixed(1)}% improvement
            </Typography>
          ))}
        </Alert>
      )}
    </Box>
  );
};

export default ABTestingComponent;