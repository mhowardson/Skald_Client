/**
 * Dashboard Tour Demo Component
 * 
 * Provides a simple interface to test and demonstrate the dashboard tour functionality.
 */

import React from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Alert
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useProductTour } from '../../hooks/useProductTour';
import { useOnboarding } from '../../hooks/useOnboarding';
import { DASHBOARD_TOUR } from '../../data/tours';
import { tourService } from '../../services/tourService';

interface DashboardTourDemoProps {
  onClose?: () => void;
}

export const DashboardTourDemo: React.FC<DashboardTourDemoProps> = ({ onClose }) => {
  const {
    isActive: isTourActive,
    activeTour,
    stepIndex,
    totalSteps,
    progress,
    start: startTour,
    skip: skipTour,
    complete: completeTour
  } = useProductTour();

  const { userJourney } = useOnboarding();

  const handleStartTour = () => {
    startTour('dashboard_overview');
  };

  const handleStopTour = () => {
    skipTour();
  };

  const handleRefreshTour = () => {
    if (isTourActive) {
      skipTour();
    }
    setTimeout(() => {
      startTour('dashboard_overview');
    }, 100);
  };

  // Validate tour targets
  const validation = tourService.validateTourTarget('dashboard_overview');

  return (
    <Card sx={{ position: 'fixed', top: 20, right: 20, width: 320, zIndex: 1000 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Dashboard Tour Demo
        </Typography>

        {/* Tour Information */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {DASHBOARD_TOUR.description}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Chip 
              label={`${DASHBOARD_TOUR.estimatedMinutes} min`} 
              size="small" 
              color="primary" 
            />
            <Chip 
              label={`${DASHBOARD_TOUR.steps.length} steps`} 
              size="small" 
              variant="outlined" 
            />
          </Box>
        </Box>

        {/* Tour Status */}
        {isTourActive && activeTour && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Tour Active: Step {stepIndex + 1} of {totalSteps}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Box 
                sx={{ 
                  width: '100%', 
                  height: 4, 
                  backgroundColor: 'rgba(0,0,0,0.1)', 
                  borderRadius: 2 
                }}
              >
                <Box 
                  sx={{ 
                    width: `${progress}%`, 
                    height: '100%', 
                    backgroundColor: 'primary.main', 
                    borderRadius: 2,
                    transition: 'width 0.3s ease'
                  }} 
                />
              </Box>
            </Box>
          </Alert>
        )}

        {/* Validation Status */}
        {!validation.valid && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Missing tour targets: {validation.missingTargets.length}
            </Typography>
          </Alert>
        )}

        {/* Tour Controls */}
        <Stack spacing={1}>
          {!isTourActive ? (
            <Button
              variant="contained"
              startIcon={<PlayIcon />}
              onClick={handleStartTour}
              disabled={!validation.valid}
              fullWidth
            >
              Start Dashboard Tour
            </Button>
          ) : (
            <Button
              variant="outlined"
              startIcon={<StopIcon />}
              onClick={handleStopTour}
              fullWidth
            >
              Stop Tour
            </Button>
          )}

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefreshTour}
            disabled={!validation.valid}
            fullWidth
            size="small"
          >
            Restart Tour
          </Button>

          {onClose && (
            <Button
              variant="text"
              onClick={onClose}
              size="small"
              fullWidth
            >
              Close Demo
            </Button>
          )}
        </Stack>

        {/* Debug Information */}
        {process.env.NODE_ENV === 'development' && (
          <Box sx={{ mt: 2, p: 1, backgroundColor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="caption" display="block">
              Debug Info:
            </Typography>
            <Typography variant="caption" display="block">
              Journey Stage: {userJourney?.currentStage || 'unknown'}
            </Typography>
            <Typography variant="caption" display="block">
              Tour Active: {isTourActive ? 'Yes' : 'No'}
            </Typography>
            <Typography variant="caption" display="block">
              Valid Targets: {validation.valid ? 'Yes' : 'No'}
            </Typography>
            {validation.missingTargets.length > 0 && (
              <Typography variant="caption" display="block" color="error">
                Missing: {validation.missingTargets.join(', ')}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};