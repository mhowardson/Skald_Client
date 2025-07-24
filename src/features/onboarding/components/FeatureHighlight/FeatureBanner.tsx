/**
 * Feature Banner Component
 * 
 * Displays feature announcements as a banner at the top of the page
 * or as a slide-in notification.
 */

import React, { useState, useEffect } from 'react';
import {
  Alert,
  AlertTitle,
  Button,
  IconButton,
  Slide,
  Box,
  Chip,
  styled
} from '@mui/material';
import {
  Close,
  AutoAwesome,
  PlayArrow,
  Info
} from '@mui/icons-material';
import { FeatureHighlight } from '../../types/onboarding.types';

interface FeatureBannerProps {
  highlight: FeatureHighlight;
  isVisible: boolean;
  variant?: 'fixed' | 'inline' | 'slide-in';
  position?: 'top' | 'bottom';
  onDismiss: () => void;
  onAction?: () => void;
}

const BannerContainer = styled(Box)<{
  variant: 'fixed' | 'inline' | 'slide-in';
  position: 'top' | 'bottom';
}>(({ theme, variant, position }) => ({
  ...(variant === 'fixed' && {
    position: 'fixed',
    top: position === 'top' ? 0 : 'auto',
    bottom: position === 'bottom' ? 0 : 'auto',
    left: 0,
    right: 0,
    zIndex: theme.zIndex.snackbar
  }),
  ...(variant === 'slide-in' && {
    position: 'fixed',
    top: position === 'top' ? 16 : 'auto',
    bottom: position === 'bottom' ? 16 : 'auto',
    right: 16,
    maxWidth: 400,
    zIndex: theme.zIndex.snackbar
  })
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  boxShadow: theme.shadows[4],
  
  '& .MuiAlert-icon': {
    fontSize: '1.5rem'
  },
  
  '& .MuiAlert-action': {
    alignItems: 'flex-start',
    paddingTop: 0
  }
}));

const ContentSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1)
}));

const BenefitsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(0.5),
  marginTop: theme.spacing(0.5)
}));

const ActionContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1)
}));

export const FeatureBanner: React.FC<FeatureBannerProps> = ({
  highlight,
  isVisible,
  variant = 'slide-in',
  position = 'top',
  onDismiss,
  onAction
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Small delay for smooth entrance
      const timer = setTimeout(() => setShow(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isVisible]);

  // Auto-dismiss logic
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
        console.log('Start tour:', tourId);
      }
    }
  };

  const handleClose = () => {
    setShow(false);
    // Delay the actual dismiss to allow for exit animation
    setTimeout(onDismiss, 300);
  };

  const bannerContent = (
    <StyledAlert
      severity="info"
      icon={<AutoAwesome />}
      action={
        highlight.dismissible ? (
          <IconButton
            size="small"
            color="inherit"
            onClick={handleClose}
          >
            <Close fontSize="small" />
          </IconButton>
        ) : undefined
      }
    >
      <AlertTitle>
        <Box display="flex" alignItems="center" gap={1}>
          {highlight.title}
          <Chip
            label="New"
            size="small"
            color="primary"
            variant="filled"
          />
        </Box>
      </AlertTitle>
      
      <ContentSection>
        {highlight.description}
        
        {highlight.benefits && highlight.benefits.length > 0 && (
          <BenefitsContainer>
            {highlight.benefits.slice(0, 3).map((benefit, index) => (
              <Chip
                key={index}
                label={benefit}
                size="small"
                variant="outlined"
                color="primary"
              />
            ))}
          </BenefitsContainer>
        )}
        
        <ActionContainer>
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
        </ActionContainer>
      </ContentSection>
    </StyledAlert>
  );

  if (variant === 'inline') {
    return show ? bannerContent : null;
  }

  return (
    <Slide
      direction={
        variant === 'slide-in'
          ? 'left'
          : position === 'top'
          ? 'down'
          : 'up'
      }
      in={show}
      timeout={300}
    >
      <BannerContainer variant={variant} position={position}>
        {bannerContent}
      </BannerContainer>
    </Slide>
  );
};