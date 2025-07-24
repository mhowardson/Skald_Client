/**
 * Onboarding Context Provider
 * 
 * Manages global state for user onboarding, journey tracking, and feature discovery.
 * Provides centralized state management for all onboarding-related functionality.
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { onboardingService } from '../services/onboardingService';
import { trackEvent } from '../../../utils/analytics';
import {
  OnboardingState,
  OnboardingActions,
  OnboardingEvent,
  OnboardingEventType,
  JourneyStage,
  StepCategory,
  TourType,
  FeatureCategory,
  OnboardingStep,
  ProductTour,
  FeatureHighlight,
  UserJourney,
  OnboardingPreferences
} from '../types/onboarding.types';

// Action Types
type OnboardingAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | undefined }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'SET_USER_JOURNEY'; payload: UserJourney }
  | { type: 'SET_AVAILABLE_STEPS'; payload: OnboardingStep[] }
  | { type: 'SET_CURRENT_STEP'; payload: OnboardingStep | undefined }
  | { type: 'COMPLETE_STEP'; payload: string }
  | { type: 'SKIP_STEP'; payload: string }
  | { type: 'START_TOUR'; payload: ProductTour }
  | { type: 'SET_TOUR_STEP'; payload: number }
  | { type: 'END_TOUR' }
  | { type: 'SET_HIGHLIGHTS'; payload: FeatureHighlight[] }
  | { type: 'DISMISS_HIGHLIGHT'; payload: string }
  | { type: 'DISCOVER_FEATURE'; payload: FeatureCategory }
  | { type: 'TOGGLE_CHECKLIST' }
  | { type: 'SET_HIGHLIGHTED_ELEMENT'; payload: string | undefined }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<OnboardingPreferences> };

// Initial State
const initialState: OnboardingState = {
  isLoading: false,
  isInitialized: false,
  error: undefined,
  userJourney: undefined,
  availableSteps: [],
  completedSteps: [],
  currentStep: undefined,
  activeTour: undefined,
  currentTourStep: undefined,
  tourProgress: 0,
  tourHistory: [],
  activeHighlights: [],
  dismissedHighlights: [],
  discoveredFeatures: [],
  contextualHelp: [],
  helpHistory: [],
  milestones: [],
  unlockedRewards: [],
  totalPoints: 0,
  showChecklist: false,
  showTour: false,
  showWelcome: false,
  tourPosition: { x: 0, y: 0 },
  highlightedElement: undefined
};

// Reducer
function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: action.payload };
    
    case 'SET_USER_JOURNEY':
      return { 
        ...state, 
        userJourney: action.payload,
        completedSteps: state.availableSteps.filter(step => 
          action.payload.completedSteps.includes(step.id)
        )
      };
    
    case 'SET_AVAILABLE_STEPS':
      return { 
        ...state, 
        availableSteps: action.payload,
        completedSteps: action.payload.filter(step => step.completed)
      };
    
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
    
    case 'COMPLETE_STEP': {
      const updatedSteps = state.availableSteps.map(step =>
        step.id === action.payload
          ? { ...step, completed: true, completedAt: new Date() }
          : step
      );
      return {
        ...state,
        availableSteps: updatedSteps,
        completedSteps: updatedSteps.filter(step => step.completed)
      };
    }
    
    case 'SKIP_STEP': {
      const updatedSteps = state.availableSteps.map(step =>
        step.id === action.payload
          ? { ...step, skipped: true, skippedAt: new Date() }
          : step
      );
      return {
        ...state,
        availableSteps: updatedSteps
      };
    }
    
    case 'START_TOUR':
      return {
        ...state,
        activeTour: action.payload,
        currentTourStep: action.payload.steps[0],
        tourProgress: 0,
        showTour: true
      };
    
    case 'SET_TOUR_STEP': {
      if (!state.activeTour) return state;
      const step = state.activeTour.steps[action.payload];
      const progress = ((action.payload + 1) / state.activeTour.steps.length) * 100;
      return {
        ...state,
        currentTourStep: step,
        tourProgress: progress
      };
    }
    
    case 'END_TOUR':
      return {
        ...state,
        activeTour: undefined,
        currentTourStep: undefined,
        tourProgress: 0,
        showTour: false,
        tourHistory: state.activeTour 
          ? [...state.tourHistory, state.activeTour.id]
          : state.tourHistory
      };
    
    case 'SET_HIGHLIGHTS':
      return { ...state, activeHighlights: action.payload };
    
    case 'DISMISS_HIGHLIGHT':
      return {
        ...state,
        activeHighlights: state.activeHighlights.filter(h => h.id !== action.payload),
        dismissedHighlights: [...state.dismissedHighlights, action.payload]
      };
    
    case 'DISCOVER_FEATURE':
      return {
        ...state,
        discoveredFeatures: state.discoveredFeatures.includes(action.payload)
          ? state.discoveredFeatures
          : [...state.discoveredFeatures, action.payload]
      };
    
    case 'TOGGLE_CHECKLIST':
      return { ...state, showChecklist: !state.showChecklist };
    
    case 'SET_HIGHLIGHTED_ELEMENT':
      return { ...state, highlightedElement: action.payload };
    
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        userJourney: state.userJourney
          ? {
              ...state.userJourney,
              preferences: { ...state.userJourney.preferences, ...action.payload }
            }
          : state.userJourney
      };
    
    default:
      return state;
  }
}

// Context Type
interface OnboardingContextType extends OnboardingState, OnboardingActions {
  // Computed properties
  isOnboardingComplete: boolean;
  currentStageProgress: number;
  overallProgress: number;
  nextSteps: OnboardingStep[];
  suggestedTours: ProductTour[];
  unviewedHighlights: FeatureHighlight[];
}

// Create Context
const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// Custom Hook
export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

// Provider Props
interface OnboardingProviderProps {
  children: React.ReactNode;
}

// Provider Component
export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);

  // Computed Properties
  const isOnboardingComplete = state.userJourney?.currentStage === JourneyStage.COMPLETED;
  
  const currentStageProgress = React.useMemo(() => {
    if (!state.userJourney) return 0;
    
    const stageSteps = state.availableSteps.filter(step => {
      // Logic to determine which steps belong to current stage
      return step.category === StepCategory.ESSENTIAL;
    });
    
    const completedStageSteps = stageSteps.filter(step => step.completed);
    return stageSteps.length > 0 ? (completedStageSteps.length / stageSteps.length) * 100 : 0;
  }, [state.availableSteps, state.userJourney]);

  const overallProgress = React.useMemo(() => {
    const essentialSteps = state.availableSteps.filter(step => 
      step.category === StepCategory.ESSENTIAL
    );
    const completedEssential = essentialSteps.filter(step => step.completed);
    return essentialSteps.length > 0 ? (completedEssential.length / essentialSteps.length) * 100 : 0;
  }, [state.availableSteps]);

  const nextSteps = React.useMemo(() => {
    return state.availableSteps
      .filter(step => !step.completed && !step.skipped)
      .filter(step => {
        // Check dependencies
        if (!step.dependencies) return true;
        return step.dependencies.every(depId =>
          state.completedSteps.some(completed => completed.id === depId)
        );
      })
      .sort((a, b) => a.order - b.order)
      .slice(0, 3); // Show top 3 next steps
  }, [state.availableSteps, state.completedSteps]);

  const suggestedTours = React.useMemo(() => {
    // Logic to suggest tours based on user progress and features used
    return [];
  }, [state.userJourney, state.discoveredFeatures]);

  const unviewedHighlights = React.useMemo(() => {
    return state.activeHighlights.filter(highlight =>
      !state.dismissedHighlights.includes(highlight.id)
    );
  }, [state.activeHighlights, state.dismissedHighlights]);

  // Actions
  const initializeOnboarding = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = await onboardingService.getOnboardingData();
      dispatch({ type: 'SET_USER_JOURNEY', payload: data.journey });
      dispatch({ type: 'SET_AVAILABLE_STEPS', payload: data.steps });
      dispatch({ type: 'SET_HIGHLIGHTS', payload: data.highlights });
      dispatch({ type: 'SET_INITIALIZED', payload: true });
      
      // Track initialization
      trackEvent({
        eventType: OnboardingEventType.JOURNEY_STARTED,
        userId: data.journey.userId,
        organizationId: data.journey.organizationId,
        sessionId: '', // Will be set by analytics service
        timestamp: new Date(),
        properties: {
          stage: data.journey.currentStage,
          completedSteps: data.journey.completedSteps.length
        }
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  }, []);

  const completeStep = useCallback(async (stepId: string) => {
    try {
      await onboardingService.completeStep(stepId);
      dispatch({ type: 'COMPLETE_STEP', payload: stepId });
      
      const step = state.availableSteps.find(s => s.id === stepId);
      if (step && state.userJourney) {
        trackEvent({
          eventType: OnboardingEventType.JOURNEY_STEP_COMPLETED,
          userId: state.userJourney.userId,
          organizationId: state.userJourney.organizationId,
          sessionId: '',
          timestamp: new Date(),
          properties: {
            stepId,
            stepTitle: step.title,
            category: step.category,
            timeSpent: 0 // Will be calculated by analytics
          }
        });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  }, [state.availableSteps, state.userJourney]);

  const skipStep = useCallback(async (stepId: string, reason?: string) => {
    try {
      await onboardingService.skipStep(stepId, reason);
      dispatch({ type: 'SKIP_STEP', payload: stepId });
      
      const step = state.availableSteps.find(s => s.id === stepId);
      if (step && state.userJourney) {
        trackEvent({
          eventType: OnboardingEventType.JOURNEY_STEP_SKIPPED,
          userId: state.userJourney.userId,
          organizationId: state.userJourney.organizationId,
          sessionId: '',
          timestamp: new Date(),
          properties: {
            stepId,
            stepTitle: step.title,
            reason: reason || 'user_choice'
          }
        });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  }, [state.availableSteps, state.userJourney]);

  const updatePreferences = useCallback(async (preferences: Partial<OnboardingPreferences>) => {
    try {
      await onboardingService.updatePreferences(preferences);
      dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  }, []);

  const startTour = useCallback(async (tourId: string) => {
    try {
      const tour = await onboardingService.getTour(tourId);
      dispatch({ type: 'START_TOUR', payload: tour });
      
      if (state.userJourney) {
        trackEvent({
          eventType: OnboardingEventType.TOUR_STARTED,
          userId: state.userJourney.userId,
          organizationId: state.userJourney.organizationId,
          sessionId: '',
          timestamp: new Date(),
          properties: {
            tourId,
            tourType: tour.type,
            totalSteps: tour.steps.length
          }
        });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  }, [state.userJourney]);

  const nextTourStep = useCallback(() => {
    if (!state.activeTour || !state.currentTourStep) return;
    
    const currentIndex = state.activeTour.steps.findIndex(s => s.id === state.currentTourStep!.id);
    if (currentIndex < state.activeTour.steps.length - 1) {
      dispatch({ type: 'SET_TOUR_STEP', payload: currentIndex + 1 });
    }
  }, [state.activeTour, state.currentTourStep]);

  const previousTourStep = useCallback(() => {
    if (!state.activeTour || !state.currentTourStep) return;
    
    const currentIndex = state.activeTour.steps.findIndex(s => s.id === state.currentTourStep!.id);
    if (currentIndex > 0) {
      dispatch({ type: 'SET_TOUR_STEP', payload: currentIndex - 1 });
    }
  }, [state.activeTour, state.currentTourStep]);

  const skipTour = useCallback(() => {
    if (state.activeTour && state.userJourney) {
      trackEvent({
        eventType: OnboardingEventType.TOUR_SKIPPED,
        userId: state.userJourney.userId,
        organizationId: state.userJourney.organizationId,
        sessionId: '',
        timestamp: new Date(),
        properties: {
          tourId: state.activeTour.id,
          currentStep: state.currentTourStep?.id,
          progress: state.tourProgress
        }
      });
    }
    
    dispatch({ type: 'END_TOUR' });
  }, [state.activeTour, state.currentTourStep, state.tourProgress, state.userJourney]);

  const completeTour = useCallback(() => {
    if (state.activeTour && state.userJourney) {
      trackEvent({
        eventType: OnboardingEventType.TOUR_COMPLETED,
        userId: state.userJourney.userId,
        organizationId: state.userJourney.organizationId,
        sessionId: '',
        timestamp: new Date(),
        properties: {
          tourId: state.activeTour.id,
          tourType: state.activeTour.type,
          totalSteps: state.activeTour.steps.length
        }
      });
    }
    
    dispatch({ type: 'END_TOUR' });
  }, [state.activeTour, state.userJourney]);

  const dismissHighlight = useCallback(async (highlightId: string) => {
    try {
      await onboardingService.dismissHighlight(highlightId);
      dispatch({ type: 'DISMISS_HIGHLIGHT', payload: highlightId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  }, []);

  const markFeatureDiscovered = useCallback(async (feature: FeatureCategory) => {
    try {
      await onboardingService.markFeatureDiscovered(feature);
      dispatch({ type: 'DISCOVER_FEATURE', payload: feature });
      
      if (state.userJourney) {
        trackEvent({
          eventType: OnboardingEventType.FEATURE_DISCOVERED,
          userId: state.userJourney.userId,
          organizationId: state.userJourney.organizationId,
          sessionId: '',
          timestamp: new Date(),
          properties: {
            feature,
            discoveryMethod: 'user_interaction'
          }
        });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  }, [state.userJourney]);

  // Additional action implementations...
  const resetJourney = useCallback(async () => {
    // Implementation for resetting journey
  }, []);

  const advanceToStage = useCallback(async (stage: JourneyStage) => {
    // Implementation for advancing to stage
  }, []);

  const pauseTour = useCallback(() => {
    // Implementation for pausing tour
  }, []);

  const resumeTour = useCallback(() => {
    // Implementation for resuming tour
  }, []);

  const highlightFeature = useCallback((featureId: string) => {
    // Implementation for highlighting feature
  }, []);

  const showHelp = useCallback((elementId: string) => {
    // Implementation for showing help
  }, []);

  const hideHelp = useCallback(() => {
    // Implementation for hiding help
  }, []);

  const trackHelpView = useCallback((contentId: string) => {
    // Implementation for tracking help view
  }, []);

  const checkMilestones = useCallback(() => {
    // Implementation for checking milestones
  }, []);

  const claimReward = useCallback((rewardId: string) => {
    // Implementation for claiming reward
  }, []);

  const toggleChecklist = useCallback(() => {
    dispatch({ type: 'TOGGLE_CHECKLIST' });
  }, []);

  const setHighlightedElement = useCallback((elementId?: string) => {
    dispatch({ type: 'SET_HIGHLIGHTED_ELEMENT', payload: elementId });
  }, []);

  const updateTourPosition = useCallback((position: { x: number; y: number }) => {
    // Implementation for updating tour position
  }, []);

  const trackEvent = useCallback((event: OnboardingEvent) => {
    // Implementation for tracking event
  }, []);

  const trackStepCompletion = useCallback((stepId: string, timeSpent: number) => {
    // Implementation for tracking step completion
  }, []);

  const trackFeatureUsage = useCallback((feature: FeatureCategory) => {
    // Implementation for tracking feature usage
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeOnboarding();
  }, [initializeOnboarding]);

  // Context value
  const contextValue: OnboardingContextType = {
    ...state,
    isOnboardingComplete,
    currentStageProgress,
    overallProgress,
    nextSteps,
    suggestedTours,
    unviewedHighlights,
    initializeOnboarding,
    updatePreferences,
    completeStep,
    skipStep,
    resetJourney,
    advanceToStage,
    startTour,
    nextTourStep,
    previousTourStep,
    skipTour,
    completeTour,
    pauseTour,
    resumeTour,
    highlightFeature,
    dismissHighlight,
    markFeatureDiscovered,
    showHelp,
    hideHelp,
    trackHelpView,
    checkMilestones,
    claimReward,
    toggleChecklist,
    setHighlightedElement,
    updateTourPosition,
    trackEvent,
    trackStepCompletion,
    trackFeatureUsage
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
};

export default OnboardingProvider;