/**
 * Progress Ring Component
 * 
 * Animated circular progress indicator for onboarding completion.
 */

import React from 'react';
import { Box, Typography, styled } from '@mui/material';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  label?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

const ProgressContainer = styled(Box)<{ size: number }>(({ size }) => ({
  position: 'relative',
  width: size,
  height: size,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center'
}));

const ProgressSvg = styled('svg')<{ size: number }>(({ size }) => ({
  width: size,
  height: size,
  transform: 'rotate(-90deg)',
  transition: 'all 0.3s ease'
}));

const ProgressCircle = styled('circle')<{ 
  strokeColor: string;
  isDashed?: boolean;
}>(({ theme, strokeColor, isDashed }) => ({
  fill: 'transparent',
  stroke: isDashed ? theme.palette.grey[300] : strokeColor,
  strokeDasharray: isDashed ? '4 4' : 'none',
  transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease'
}));

const LabelContainer = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  textAlign: 'center'
});

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  showLabel = true,
  label,
  color = 'primary'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getColor = () => {
    switch (color) {
      case 'primary':
        return '#6366f1';
      case 'secondary':
        return '#8b5cf6';
      case 'success':
        return '#10b981';
      case 'warning':
        return '#f59e0b';
      case 'error':
        return '#ef4444';
      default:
        return '#6366f1';
    }
  };

  const getProgressColor = () => {
    if (progress >= 100) return '#10b981'; // Success green
    if (progress >= 75) return '#3b82f6'; // Blue
    if (progress >= 50) return '#f59e0b'; // Orange
    if (progress >= 25) return '#ef4444'; // Red
    return '#6b7280'; // Gray
  };

  return (
    <ProgressContainer size={size}>
      <ProgressSvg size={size}>
        {/* Background circle */}
        <ProgressCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeColor="#f3f4f6"
          isDashed
        />
        
        {/* Progress circle */}
        <ProgressCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeColor={getProgressColor()}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
            strokeLinecap: 'round'
          }}
        />
      </ProgressSvg>
      
      {showLabel && (
        <LabelContainer>
          <Typography
            variant="h6"
            fontWeight="bold"
            color={getProgressColor()}
            sx={{ lineHeight: 1 }}
          >
            {Math.round(progress)}%
          </Typography>
          {label && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ 
                display: 'block',
                mt: 0.5,
                fontSize: '0.75rem'
              }}
            >
              {label}
            </Typography>
          )}
        </LabelContainer>
      )}
    </ProgressContainer>
  );
};