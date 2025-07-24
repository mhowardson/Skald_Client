/**
 * Progress Bar Component
 * 
 * Linear progress indicator with milestones and labels.
 */

import React from 'react';
import {
  Box,
  LinearProgress,
  Typography,
  Chip,
  styled
} from '@mui/material';
import { Check, RadioButtonUnchecked } from '@mui/icons-material';

interface Milestone {
  id: string;
  title: string;
  position: number; // 0-100
  completed: boolean;
}

interface ProgressBarProps {
  progress: number; // 0-100
  milestones?: Milestone[];
  showPercentage?: boolean;
  height?: number;
  color?: 'primary' | 'secondary' | 'success';
  label?: string;
  variant?: 'default' | 'with-milestones' | 'gradient';
}

const ProgressContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  position: 'relative'
}));

const StyledLinearProgress = styled(LinearProgress)<{
  height: number;
  variant: string;
}>(({ theme, height, variant }) => ({
  height,
  borderRadius: height / 2,
  backgroundColor: theme.palette.grey[200],
  
  '& .MuiLinearProgress-bar': {
    borderRadius: height / 2,
    ...(variant === 'gradient' && {
      background: `linear-gradient(90deg, 
        ${theme.palette.error.main} 0%, 
        ${theme.palette.warning.main} 25%, 
        ${theme.palette.info.main} 50%, 
        ${theme.palette.success.main} 100%
      )`
    })
  }
}));

const MilestonesContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(2)
}));

const MilestoneMarker = styled(Box)<{ 
  position: number;
  completed: boolean;
}>(({ theme, position, completed }) => ({
  position: 'absolute',
  left: `${position}%`,
  transform: 'translateX(-50%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  
  '&:hover': {
    transform: 'translateX(-50%) scale(1.1)'
  }
}));

const MilestoneIcon = styled(Box)<{ completed: boolean }>(({ theme, completed }) => ({
  width: 24,
  height: 24,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: completed ? theme.palette.success.main : theme.palette.grey[300],
  color: completed ? theme.palette.success.contrastText : theme.palette.text.secondary,
  border: `2px solid ${completed ? theme.palette.success.main : theme.palette.grey[400]}`,
  transition: 'all 0.2s ease',
  
  '& .MuiSvgIcon-root': {
    fontSize: 16
  }
}));

const MilestoneLabel = styled(Typography)<{ completed: boolean }>(({ theme, completed }) => ({
  marginTop: theme.spacing(0.5),
  fontSize: '0.75rem',
  fontWeight: completed ? 600 : 400,
  color: completed ? theme.palette.text.primary : theme.palette.text.secondary,
  textAlign: 'center',
  maxWidth: 80,
  lineHeight: 1.2
}));

const ProgressInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(1)
}));

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  milestones = [],
  showPercentage = true,
  height = 8,
  color = 'primary',
  label,
  variant = 'default'
}) => {
  const getProgressColor = () => {
    if (progress >= 100) return 'success';
    if (progress >= 75) return 'primary';
    if (progress >= 50) return 'info';
    if (progress >= 25) return 'warning';
    return 'error';
  };

  const progressColor = variant === 'gradient' ? 'primary' : getProgressColor();

  return (
    <ProgressContainer>
      {(label || showPercentage) && (
        <ProgressInfo>
          {label && (
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
          )}
          {showPercentage && (
            <Chip
              label={`${Math.round(progress)}%`}
              size="small"
              color={progressColor as any}
              variant="outlined"
            />
          )}
        </ProgressInfo>
      )}
      
      <StyledLinearProgress
        variant="determinate"
        value={progress}
        color={progressColor as any}
        height={height}
        variant={variant}
      />
      
      {variant === 'with-milestones' && milestones.length > 0 && (
        <MilestonesContainer>
          {milestones.map((milestone) => (
            <MilestoneMarker
              key={milestone.id}
              position={milestone.position}
              completed={milestone.completed}
            >
              <MilestoneIcon completed={milestone.completed}>
                {milestone.completed ? (
                  <Check fontSize="small" />
                ) : (
                  <RadioButtonUnchecked fontSize="small" />
                )}
              </MilestoneIcon>
              <MilestoneLabel completed={milestone.completed}>
                {milestone.title}
              </MilestoneLabel>
            </MilestoneMarker>
          ))}
        </MilestonesContainer>
      )}
    </ProgressContainer>
  );
};