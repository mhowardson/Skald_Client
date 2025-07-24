/**
 * useProductTour Hook
 * 
 * Specialized hook for managing product tours with enhanced functionality
 * for tour navigation, step management, and progress tracking.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useOnboarding } from '../contexts/OnboardingContext';
import {
  ProductTour,
  TourStep,
  UseProductTourReturn,
  TourType,
  OnboardingEventType
} from '../types/onboarding.types';

export const useProductTour = (): UseProductTourReturn => {
  const {
    activeTour,
    currentTourStep,
    tourProgress,
    userJourney,
    startTour: contextStartTour,
    nextTourStep: contextNextStep,
    previousTourStep: contextPreviousStep,
    skipTour: contextSkipTour,
    completeTour: contextCompleteTour,
    trackEvent
  } = useOnboarding();

  const [tourStartTime, setTourStartTime] = useState<Date | null>(null);
  const [stepStartTime, setStepStartTime] = useState<Date | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Computed properties
  const stepIndex = useMemo(() => {
    if (!activeTour || !currentTourStep) return 0;
    return activeTour.steps.findIndex(step => step.id === currentTourStep.id);
  }, [activeTour, currentTourStep]);

  const totalSteps = activeTour?.steps.length || 0;
  const progress = totalSteps > 0 ? ((stepIndex + 1) / totalSteps) * 100 : 0;

  const isActive = Boolean(activeTour && !isPaused);
  const canGoNext = stepIndex < totalSteps - 1;
  const canGoPrevious = stepIndex > 0;
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === totalSteps - 1;

  // Enhanced tour controls
  const start = useCallback((tourId: string) => {
    contextStartTour(tourId);
    setTourStartTime(new Date());
    setStepStartTime(new Date());
    setIsPaused(false);
  }, [contextStartTour]);

  const next = useCallback(() => {
    if (!canGoNext || !activeTour || !currentTourStep || !userJourney) return;

    // Track step completion time
    if (stepStartTime) {
      const timeSpent = Date.now() - stepStartTime.getTime();
      trackEvent({
        eventType: OnboardingEventType.TOUR_STEP_COMPLETED,
        userId: userJourney.userId,
        organizationId: userJourney.organizationId,
        sessionId: '',
        timestamp: new Date(),
        properties: {
          tourId: activeTour.id,
          stepId: currentTourStep.id,
          stepIndex,
          timeSpent,
          isLastStep: false
        }
      });
    }

    contextNextStep();
    setStepStartTime(new Date());

    // Auto-complete tour if this was the last step
    if (isLastStep) {
      setTimeout(() => {
        complete();
      }, 1000); // Brief delay to show completion
    }
  }, [
    canGoNext,
    activeTour,
    currentTourStep,
    userJourney,
    stepStartTime,
    trackEvent,
    stepIndex,
    isLastStep,
    contextNextStep
  ]);

  const previous = useCallback(() => {
    if (!canGoPrevious) return;
    
    contextPreviousStep();
    setStepStartTime(new Date());
  }, [canGoPrevious, contextPreviousStep]);

  const skip = useCallback(() => {
    if (!activeTour || !userJourney) return;

    // Track skip event with current progress
    trackEvent({
      eventType: OnboardingEventType.TOUR_SKIPPED,
      userId: userJourney.userId,
      organizationId: userJourney.organizationId,
      sessionId: '',
      timestamp: new Date(),
      properties: {
        tourId: activeTour.id,
        currentStepId: currentTourStep?.id,
        stepIndex,
        progress,
        totalSteps,
        timeSpent: tourStartTime ? Date.now() - tourStartTime.getTime() : 0
      }
    });

    contextSkipTour();
    setTourStartTime(null);
    setStepStartTime(null);
    setIsPaused(false);
  }, [
    activeTour,
    userJourney,
    currentTourStep,
    stepIndex,
    progress,
    totalSteps,
    tourStartTime,
    trackEvent,
    contextSkipTour
  ]);

  const complete = useCallback(() => {
    if (!activeTour || !userJourney) return;

    // Track completion event
    const totalTime = tourStartTime ? Date.now() - tourStartTime.getTime() : 0;
    trackEvent({
      eventType: OnboardingEventType.TOUR_COMPLETED,
      userId: userJourney.userId,
      organizationId: userJourney.organizationId,
      sessionId: '',
      timestamp: new Date(),
      properties: {
        tourId: activeTour.id,
        tourType: activeTour.type,
        totalSteps,
        totalTime,
        skippedSteps: 0, // Calculate actual skipped steps if needed
        completionRate: 100
      }
    });

    contextCompleteTour();
    setTourStartTime(null);
    setStepStartTime(null);
    setIsPaused(false);
  }, [
    activeTour,
    userJourney,
    tourStartTime,
    totalSteps,
    trackEvent,
    contextCompleteTour
  ]);

  const pause = useCallback(() => {
    setIsPaused(true);
    
    if (activeTour && userJourney) {
      trackEvent({
        eventType: OnboardingEventType.TOUR_STEP_VIEWED, // Reuse for pause tracking
        userId: userJourney.userId,
        organizationId: userJourney.organizationId,
        sessionId: '',
        timestamp: new Date(),
        properties: {
          tourId: activeTour.id,
          stepId: currentTourStep?.id,
          action: 'paused',
          stepIndex
        }
      });
    }
  }, [activeTour, userJourney, currentTourStep, stepIndex, trackEvent]);

  const resume = useCallback(() => {
    setIsPaused(false);
    setStepStartTime(new Date()); // Reset step timer
    
    if (activeTour && userJourney) {
      trackEvent({
        eventType: OnboardingEventType.TOUR_STEP_VIEWED,
        userId: userJourney.userId,
        organizationId: userJourney.organizationId,
        sessionId: '',
        timestamp: new Date(),
        properties: {
          tourId: activeTour.id,
          stepId: currentTourStep?.id,
          action: 'resumed',
          stepIndex
        }
      });
    }
  }, [activeTour, userJourney, currentTourStep, stepIndex, trackEvent]);

  // Track step views when step changes
  useEffect(() => {
    if (currentTourStep && activeTour && userJourney && !isPaused) {
      trackEvent({
        eventType: OnboardingEventType.TOUR_STEP_VIEWED,
        userId: userJourney.userId,
        organizationId: userJourney.organizationId,
        sessionId: '',
        timestamp: new Date(),
        properties: {
          tourId: activeTour.id,
          stepId: currentTourStep.id,
          stepIndex,
          stepTitle: currentTourStep.title,
          target: currentTourStep.target
        }
      });

      setStepStartTime(new Date());
    }
  }, [currentTourStep, activeTour, userJourney, isPaused, stepIndex, trackEvent]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isActive) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowRight':
        case ' ': // Spacebar
          event.preventDefault();
          if (canGoNext) next();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          if (canGoPrevious) previous();
          break;
        case 'Escape':
          event.preventDefault();
          skip();
          break;
        case 'Enter':
          event.preventDefault();
          if (isLastStep) {
            complete();
          } else if (canGoNext) {
            next();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isActive, canGoNext, canGoPrevious, isLastStep, next, previous, skip, complete]);

  // Auto-advance functionality
  useEffect(() => {
    if (!currentTourStep || isPaused || !currentTourStep.autoAdvance) return;

    const timer = setTimeout(() => {
      if (canGoNext) {
        next();
      }
    }, currentTourStep.autoAdvance);

    return () => clearTimeout(timer);
  }, [currentTourStep, isPaused, canGoNext, next]);

  return {
    // Current tour state
    activeTour,
    currentStep: currentTourStep,
    stepIndex,
    totalSteps,
    progress,
    
    // Tour controls
    start,
    next,
    previous,
    skip,
    complete,
    pause,
    resume,
    
    // State checks
    isActive,
    canGoNext,
    canGoPrevious,
    isFirstStep,
    isLastStep
  };
};