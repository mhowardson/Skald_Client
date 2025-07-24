/**
 * Tour Tooltip Component
 * 
 * Displays tour step content with navigation controls,
 * positioned relative to the target element.
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  LinearProgress,
  Chip,
  styled
} from '@mui/material';
import {
  ArrowForward,
  ArrowBack,
  Close,
  PlayArrow,
  Pause,
  SkipNext
} from '@mui/icons-material';
import { TourStep } from '../../types/onboarding.types';

interface TourTooltipProps {
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  progress: number;
  isVisible: boolean;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onClose: () => void;
}

interface TooltipPosition {
  top: number;
  left: number;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

const TooltipContainer = styled(Paper)<{ 
  position: TooltipPosition;
  isVisible: boolean;
}>(({ theme, position, isVisible }) => ({
  position: 'fixed',
  top: position.top,
  left: position.left,
  maxWidth: 360,
  minWidth: 280,
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  boxShadow: theme.shadows[8],
  zIndex: theme.zIndex.modal,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  transform: isVisible ? 'scale(1)' : 'scale(0.9)',
  opacity: isVisible ? 1 : 0,
  transition: 'all 0.2s ease-in-out',
  pointerEvents: isVisible ? 'auto' : 'none',
  
  // Arrow styling based on placement
  '&::before': {
    content: '""',
    position: 'absolute',
    width: 0,
    height: 0,
    borderStyle: 'solid',
    ...(position.placement === 'top' && {
      bottom: -8,
      left: '50%',
      transform: 'translateX(-50%)',
      borderWidth: '8px 8px 0 8px',
      borderColor: `${theme.palette.background.paper} transparent transparent transparent`
    }),
    ...(position.placement === 'bottom' && {
      top: -8,
      left: '50%',
      transform: 'translateX(-50%)',
      borderWidth: '0 8px 8px 8px',
      borderColor: `transparent transparent ${theme.palette.background.paper} transparent`
    }),
    ...(position.placement === 'left' && {
      right: -8,
      top: '50%',
      transform: 'translateY(-50%)',
      borderWidth: '8px 0 8px 8px',
      borderColor: `transparent transparent transparent ${theme.palette.background.paper}`
    }),
    ...(position.placement === 'right' && {
      left: -8,
      top: '50%',
      transform: 'translateY(-50%)',
      borderWidth: '8px 8px 8px 0',
      borderColor: `transparent ${theme.palette.background.paper} transparent transparent`
    })
  }
}));

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: theme.spacing(1)
}));

const StepInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1)
}));

const Content = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2)
}));

const Controls = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: theme.spacing(1)
}));

const NavigationButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1)
}));

export const TourTooltip: React.FC<TourTooltipProps> = ({
  step,
  stepIndex,
  totalSteps,
  progress,
  isVisible,
  canGoNext,
  canGoPrevious,
  isFirstStep,
  isLastStep,
  onNext,
  onPrevious,
  onSkip,
  onClose
}) => {
  const [position, setPosition] = useState<TooltipPosition>({
    top: 0,
    left: 0,
    placement: step.placement || 'bottom'
  });
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Calculate tooltip position relative to target element
  useEffect(() => {
    if (!isVisible || !step.target) return;

    const updatePosition = () => {
      const targetElement = document.querySelector(step.target);
      const tooltipElement = tooltipRef.current;
      
      if (!targetElement || !tooltipElement) return;

      const targetRect = targetElement.getBoundingClientRect();
      const tooltipRect = tooltipElement.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      let placement = step.placement || 'bottom';
      let top = 0;
      let left = 0;

      // Calculate initial position based on preferred placement
      switch (placement) {
        case 'top':
          top = targetRect.top - tooltipRect.height - 16;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          break;
        case 'bottom':
          top = targetRect.bottom + 16;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          break;
        case 'left':
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
          left = targetRect.left - tooltipRect.width - 16;
          break;
        case 'right':
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
          left = targetRect.right + 16;
          break;
        case 'center':
          top = (viewport.height - tooltipRect.height) / 2;
          left = (viewport.width - tooltipRect.width) / 2;
          break;
      }

      // Adjust for viewport boundaries and flip if necessary
      if (placement !== 'center') {
        // Check if tooltip goes outside viewport and adjust
        if (left < 16) {
          left = 16;
        } else if (left + tooltipRect.width > viewport.width - 16) {
          left = viewport.width - tooltipRect.width - 16;
        }

        if (top < 16) {
          if (placement === 'top') {
            placement = 'bottom';
            top = targetRect.bottom + 16;
          } else {
            top = 16;
          }
        } else if (top + tooltipRect.height > viewport.height - 16) {
          if (placement === 'bottom') {
            placement = 'top';
            top = targetRect.top - tooltipRect.height - 16;
          } else {
            top = viewport.height - tooltipRect.height - 16;
          }
        }
      }

      setPosition({ top, left, placement });
    };

    // Initial positioning
    updatePosition();

    // Update on scroll and resize
    const handleUpdate = () => {
      requestAnimationFrame(updatePosition);
    };

    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [step.target, step.placement, isVisible]);

  const handleNextClick = () => {
    if (step.action) {
      // Perform the required action first
      const targetElement = document.querySelector(step.target);
      if (targetElement && step.action.type === 'click') {
        (targetElement as HTMLElement).click();
      }
    }
    onNext();
  };

  return (
    <TooltipContainer
      ref={tooltipRef}
      position={position}
      isVisible={isVisible}
      elevation={8}
    >
      <Header>
        <StepInfo>
          <Chip
            label={`${stepIndex + 1} of ${totalSteps}`}
            size="small"
            color="primary"
            variant="outlined"
          />
          {step.optional && (
            <Chip
              label="Optional"
              size="small"
              color="secondary"
              variant="outlined"
            />
          )}
        </StepInfo>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ ml: 1 }}
        >
          <Close fontSize="small" />
        </IconButton>
      </Header>

      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ mb: 2, height: 4, borderRadius: 2 }}
      />

      <Content>
        <Typography variant="h6" gutterBottom>
          {step.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {step.description}
        </Typography>
        
        {step.action && (
          <Box sx={{ mt: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              <PlayArrow fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
              {step.action.type === 'click' ? 'Click' : 'Action'}: {step.actionRequired}
            </Typography>
          </Box>
        )}
      </Content>

      <Controls>
        <Box>
          {step.showSkip && (
            <Button
              size="small"
              startIcon={<SkipNext />}
              onClick={onSkip}
              color="inherit"
            >
              Skip Tour
            </Button>
          )}
        </Box>

        <NavigationButtons>
          {step.showPrevious && canGoPrevious && (
            <Button
              size="small"
              startIcon={<ArrowBack />}
              onClick={onPrevious}
              variant="outlined"
            >
              Previous
            </Button>
          )}
          
          {step.showNext && canGoNext && (
            <Button
              size="small"
              endIcon={<ArrowForward />}
              onClick={handleNextClick}
              variant="contained"
              color="primary"
            >
              {isLastStep ? 'Complete' : 'Next'}
            </Button>
          )}
        </NavigationButtons>
      </Controls>
    </TooltipContainer>
  );
};