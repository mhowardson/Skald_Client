/**
 * Tour Overlay Component
 * 
 * Creates a backdrop overlay that highlights the target element
 * and dims the rest of the interface during tours.
 */

import React, { useEffect, useState } from 'react';
import { Box, styled } from '@mui/material';
import { TourStep } from '../../types/onboarding.types';

interface TourOverlayProps {
  step: TourStep;
  isVisible: boolean;
  onBackdropClick?: () => void;
}

interface ElementPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

const OverlayContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isVisible'
})<{ isVisible: boolean }>(({ theme, isVisible }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  pointerEvents: isVisible ? 'auto' : 'none',
  zIndex: theme.zIndex.modal - 1,
  transition: 'opacity 0.3s ease-in-out',
  opacity: isVisible ? 1 : 0
}));

const BackdropSvg = styled('svg')({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%'
});

const HighlightBorder = styled(Box)<{ 
  position: ElementPosition;
  borderRadius?: number;
}>(({ theme, position, borderRadius = 8 }) => ({
  position: 'absolute',
  top: position.top - 4,
  left: position.left - 4,
  width: position.width + 8,
  height: position.height + 8,
  border: `3px solid ${theme.palette.primary.main}`,
  borderRadius: borderRadius + 4,
  boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`,
  pointerEvents: 'none',
  animation: 'pulse 2s infinite',
  '@keyframes pulse': {
    '0%': {
      boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`
    },
    '50%': {
      boxShadow: `0 0 0 8px ${theme.palette.primary.main}10`
    },
    '100%': {
      boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`
    }
  }
}));

export const TourOverlay: React.FC<TourOverlayProps> = ({
  step,
  isVisible,
  onBackdropClick
}) => {
  const [elementPosition, setElementPosition] = useState<ElementPosition | null>(null);
  const [borderRadius, setBorderRadius] = useState(8);

  // Find and track the target element
  useEffect(() => {
    if (!isVisible || !step.target) return;

    const updateElementPosition = () => {
      const element = document.querySelector(step.target);
      if (!element) {
        setElementPosition(null);
        return;
      }

      const rect = element.getBoundingClientRect();
      setElementPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      });

      // Get computed border radius
      const computedStyle = window.getComputedStyle(element);
      const elementBorderRadius = computedStyle.borderRadius;
      if (elementBorderRadius && elementBorderRadius !== '0px') {
        setBorderRadius(parseInt(elementBorderRadius) || 8);
      }
    };

    updateElementPosition();

    // Update position on scroll and resize
    const handleUpdate = () => {
      requestAnimationFrame(updateElementPosition);
    };

    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [step.target, isVisible]);

  // Handle backdrop clicks
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && onBackdropClick) {
      onBackdropClick();
    }
  };

  if (!step.backdrop || !isVisible) {
    return null;
  }

  return (
    <OverlayContainer isVisible={isVisible} onClick={handleBackdropClick}>
      <BackdropSvg>
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {elementPosition && (
              <rect
                x={elementPosition.left - 4}
                y={elementPosition.top - 4}
                width={elementPosition.width + 8}
                height={elementPosition.height + 8}
                rx={borderRadius + 4}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.5)"
          mask="url(#tour-mask)"
        />
      </BackdropSvg>
      
      {/* Highlight border around target element */}
      {step.highlight && elementPosition && (
        <HighlightBorder 
          position={elementPosition} 
          borderRadius={borderRadius}
        />
      )}
    </OverlayContainer>
  );
};