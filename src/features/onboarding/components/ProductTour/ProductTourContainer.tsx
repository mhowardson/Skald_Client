/**
 * Product Tour Container
 * 
 * Main container component that orchestrates the entire tour experience,
 * combining overlay, tooltip, and tour controls.
 */

import React, { useEffect, useCallback } from 'react';
import { Portal } from '@mui/material';
import { TourOverlay } from './TourOverlay';
import { TourTooltip } from './TourTooltip';
import { useProductTour } from '../../hooks/useProductTour';

interface ProductTourContainerProps {
  // Optional props for external control
  onTourComplete?: () => void;
  onTourSkip?: () => void;
  onStepChange?: (stepIndex: number) => void;
}

export const ProductTourContainer: React.FC<ProductTourContainerProps> = ({
  onTourComplete,
  onTourSkip,
  onStepChange
}) => {
  const {
    activeTour,
    currentStep,
    stepIndex,
    totalSteps,
    progress,
    isActive,
    canGoNext,
    canGoPrevious,
    isFirstStep,
    isLastStep,
    next,
    previous,
    skip,
    complete
  } = useProductTour();

  // Handle external callbacks
  useEffect(() => {
    if (onStepChange) {
      onStepChange(stepIndex);
    }
  }, [stepIndex, onStepChange]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      complete();
      onTourComplete?.();
    } else {
      next();
    }
  }, [isLastStep, complete, next, onTourComplete]);

  const handleSkip = useCallback(() => {
    skip();
    onTourSkip?.();
  }, [skip, onTourSkip]);

  const handleClose = useCallback(() => {
    skip();
    onTourSkip?.();
  }, [skip, onTourSkip]);

  // Scroll target element into view when step changes
  useEffect(() => {
    if (!currentStep || !isActive) return;

    const targetElement = document.querySelector(currentStep.target);
    if (targetElement) {
      // Smooth scroll to ensure the element is visible
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });
    }
  }, [currentStep, isActive]);

  // Focus management for accessibility
  useEffect(() => {
    if (isActive) {
      // Store the previously focused element
      const previouslyFocused = document.activeElement as HTMLElement;
      
      return () => {
        // Restore focus when tour ends
        if (previouslyFocused && previouslyFocused.focus) {
          previouslyFocused.focus();
        }
      };
    }
  }, [isActive]);

  // Prevent body scroll when tour is active
  useEffect(() => {
    if (isActive && currentStep?.backdrop) {
      // Prevent background scrolling
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isActive, currentStep?.backdrop]);

  // Add tour-active class to body for CSS styling
  useEffect(() => {
    if (isActive) {
      document.body.classList.add('tour-active');
      return () => {
        document.body.classList.remove('tour-active');
      };
    }
  }, [isActive]);

  // Handle target element interactions
  useEffect(() => {
    if (!currentStep || !isActive) return;

    const targetElement = document.querySelector(currentStep.target);
    if (!targetElement) return;

    // Add tour-target class for styling
    targetElement.classList.add('tour-target');
    
    // Handle automatic actions
    if (currentStep.action?.type === 'wait' && currentStep.action.waitForElement) {
      const waitForElement = currentStep.action.waitForElement;
      const timeout = currentStep.action.timeout || 5000;
      
      let observer: MutationObserver;
      let timeoutId: NodeJS.Timeout;
      
      const checkElement = () => {
        const element = document.querySelector(waitForElement);
        if (element) {
          observer?.disconnect();
          clearTimeout(timeoutId);
          setTimeout(handleNext, 500); // Small delay before advancing
        }
      };
      
      // Check immediately
      checkElement();
      
      // Set up observer for DOM changes
      observer = new MutationObserver(checkElement);
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      // Set timeout
      timeoutId = setTimeout(() => {
        observer?.disconnect();
        // Continue anyway if timeout reached
        handleNext();
      }, timeout);
      
      return () => {
        observer?.disconnect();
        clearTimeout(timeoutId);
      };
    }
    
    return () => {
      targetElement.classList.remove('tour-target');
    };
  }, [currentStep, isActive, handleNext]);

  if (!isActive || !activeTour || !currentStep) {
    return null;
  }

  return (
    <Portal>
      {/* Overlay with backdrop and highlighting */}
      <TourOverlay
        step={currentStep}
        isVisible={isActive}
        onBackdropClick={currentStep.backdrop ? undefined : handleClose}
      />
      
      {/* Tooltip with content and navigation */}
      <TourTooltip
        step={currentStep}
        stepIndex={stepIndex}
        totalSteps={totalSteps}
        progress={progress}
        isVisible={isActive}
        canGoNext={canGoNext}
        canGoPrevious={canGoPrevious}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        onNext={handleNext}
        onPrevious={previous}
        onSkip={handleSkip}
        onClose={handleClose}
      />
      
      {/* Global styles for tour */}
      <style>{`
        .tour-active {
          /* Prevent interactions with background elements */
        }
        
        .tour-target {
          /* Ensure target element is above overlay */
          position: relative;
          z-index: 1300;
        }
        
        /* Hide scrollbars during tour */
        .tour-active::-webkit-scrollbar {
          display: none;
        }
        
        .tour-active {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </Portal>
  );
};