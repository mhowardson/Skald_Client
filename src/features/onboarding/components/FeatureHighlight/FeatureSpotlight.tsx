/**
 * Feature Spotlight Component
 * 
 * Creates a spotlight effect that highlights new features
 * with an animated border and call-to-action.
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  styled,
  keyframes
} from '@mui/material';
import {
  Close,
  AutoAwesome,
  PlayArrow,
  Info
} from '@mui/icons-material';
import { FeatureHighlight } from '../../types/onboarding.types';

interface FeatureSpotlightProps {
  highlight: FeatureHighlight;
  isVisible: boolean;
  onDismiss: () => void;
  onAction?: () => void;
}

// Animations
const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(99, 102, 241, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
  }
`;

const shimmerAnimation = keyframes`
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
`;

// Styled components
const SpotlightContainer = styled(Box)<{ isVisible: boolean }>(({ theme, isVisible }) => ({
  position: 'fixed',
  zIndex: theme.zIndex.modal + 1,
  transition: 'all 0.3s ease-in-out',
  transform: isVisible ? 'scale(1)' : 'scale(0.9)',
  opacity: isVisible ? 1 : 0,
  pointerEvents: isVisible ? 'auto' : 'none'
}));

const SpotlightBorder = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: -4,
  left: -4,
  right: -4,
  bottom: -4,
  borderRadius: theme.spacing(2),
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  animation: `${pulseAnimation} 2s infinite`,
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 'inherit',
    background: `linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    )`,
    backgroundSize: '468px 100%',
    animation: `${shimmerAnimation} 2s infinite`
  }
}));

const SpotlightContent = styled(Paper)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  maxWidth: 320,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[12]
}));

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(1)
}));

const FeatureIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  marginRight: theme.spacing(1)
}));

const BenefitsList = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(2),
  
  '& li': {
    marginBottom: theme.spacing(0.5),
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
    
    '&::before': {
      content: '"✓"',
      marginRight: theme.spacing(1),
      color: theme.palette.success.main,
      fontWeight: 'bold'
    }
  }
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  justifyContent: 'flex-end',
  marginTop: theme.spacing(2)
}));

export const FeatureSpotlight: React.FC<FeatureSpotlightProps> = ({
  highlight,
  isVisible,
  onDismiss,
  onAction
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate position relative to target element
  useEffect(() => {
    if (!isVisible || !highlight.target) return;

    const updatePosition = () => {
      const targetElement = document.querySelector(highlight.target);
      const containerElement = containerRef.current;
      
      if (!targetElement || !containerElement) return;

      const targetRect = targetElement.getBoundingClientRect();
      const containerRect = containerElement.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      let top = targetRect.bottom + 16;
      let left = targetRect.left;

      // Adjust for viewport boundaries
      if (left + containerRect.width > viewport.width - 16) {
        left = viewport.width - containerRect.width - 16;
      }
      
      if (left < 16) {
        left = 16;
      }

      if (top + containerRect.height > viewport.height - 16) {
        top = targetRect.top - containerRect.height - 16;
      }

      setPosition({ top, left });
    };

    // Initial positioning
    const timer = setTimeout(updatePosition, 100);

    // Update on scroll and resize
    const handleUpdate = () => {
      requestAnimationFrame(updatePosition);
    };

    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [highlight.target, isVisible]);

  // Auto-dismiss after a certain time if configured
  useEffect(() => {
    if (!isVisible || !highlight.expiresAt) return;

    const now = new Date();
    const expiresAt = new Date(highlight.expiresAt);
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();

    if (timeUntilExpiry <= 0) {
      onDismiss();
      return;
    }

    const timer = setTimeout(onDismiss, timeUntilExpiry);
    return () => clearTimeout(timer);
  }, [isVisible, highlight.expiresAt, onDismiss]);

  const handleActionClick = () => {
    if (onAction) {
      onAction();
    } else if (highlight.ctaAction) {
      // Parse and execute CTA action
      if (highlight.ctaAction.startsWith('start_tour:')) {
        const tourId = highlight.ctaAction.replace('start_tour:', '');
        // Trigger tour start - this would be handled by parent component
        console.log('Start tour:', tourId);
      }
    }
  };

  return (
    <SpotlightContainer
      ref={containerRef}
      isVisible={isVisible}
      sx={{
        top: position.top,
        left: position.left
      }}
    >
      <SpotlightBorder />
      <SpotlightContent elevation={12}>
        <Header>
          <Box display="flex" alignItems="center">
            <FeatureIcon>
              <AutoAwesome fontSize="small" />
            </FeatureIcon>
            <Box>
              <Chip
                label="New Feature"
                size="small"
                color="primary"
                variant="filled"
                sx={{ mb: 0.5 }}
              />
            </Box>
          </Box>
          
          {highlight.dismissible && (
            <IconButton
              size="small"
              onClick={onDismiss}
              sx={{ ml: 1 }}
            >
              <Close fontSize="small" />
            </IconButton>
          )}
        </Header>

        <Typography variant="h6" gutterBottom>
          {highlight.title}
        </Typography>

        <Typography variant="body2" color="text.secondary" paragraph>
          {highlight.description}
        </Typography>

        {highlight.benefits && highlight.benefits.length > 0 && (
          <BenefitsList component="ul" sx={{ listStyle: 'none', p: 0 }}>
            {highlight.benefits.map((benefit, index) => (
              <li key={index}>{benefit}</li>
            ))}
          </BenefitsList>
        )}

        <ActionButtons>
          {highlight.docsUrl && (
            <Button
              size="small"
              startIcon={<Info />}
              href={highlight.docsUrl}
              target="_blank"
              color="inherit"
            >
              Learn More
            </Button>
          )}
          
          {highlight.ctaText && (
            <Button
              size="small"
              variant="contained"
              startIcon={<PlayArrow />}
              onClick={handleActionClick}
              color="primary"
            >
              {highlight.ctaText}
            </Button>
          )}
        </ActionButtons>
      </SpotlightContent>
    </SpotlightContainer>
  );
};