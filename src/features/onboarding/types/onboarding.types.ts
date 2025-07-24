/**
 * Onboarding and User Journey Type Definitions
 * 
 * Defines the complete type system for user onboarding, journey tracking,
 * and feature discovery within ContentAutoPilot.
 */

// Journey Stages
export enum JourneyStage {
  REGISTRATION = 'registration',
  ORGANIZATION_SETUP = 'organization_setup',
  FIRST_WORKSPACE = 'first_workspace',
  FIRST_CONTENT = 'first_content',
  FEATURE_DISCOVERY = 'feature_discovery',
  TEAM_COLLABORATION = 'team_collaboration',
  POWER_USER = 'power_user',
  COMPLETED = 'completed'
}

// Step Categories
export enum StepCategory {
  ESSENTIAL = 'essential',
  RECOMMENDED = 'recommended',
  ADVANCED = 'advanced',
  OPTIONAL = 'optional'
}

// Tour Types
export enum TourType {
  FIRST_TIME_SETUP = 'first_time_setup',
  DASHBOARD_OVERVIEW = 'dashboard_overview',
  CONTENT_CREATION = 'content_creation',
  WORKSPACE_MANAGEMENT = 'workspace_management',
  ANALYTICS_INTRO = 'analytics_intro',
  TEAM_FEATURES = 'team_features'
}

// Feature Categories
export enum FeatureCategory {
  CONTENT_GENERATION = 'content_generation',
  VOICE_TO_TEXT = 'voice_to_text',
  MULTI_LANGUAGE = 'multi_language',
  ANALYTICS = 'analytics',
  COLLABORATION = 'collaboration',
  WORKSPACE_MANAGEMENT = 'workspace_management',
  API_INTEGRATION = 'api_integration'
}

// Core Interfaces

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  actionRequired: string;
  actionUrl?: string;
  category: StepCategory;
  estimatedMinutes: number;
  completed: boolean;
  completedAt?: Date;
  skipped: boolean;
  skippedAt?: Date;
  dependencies?: string[]; // Step IDs that must be completed first
  features?: FeatureCategory[];
  order: number;
}

export interface UserJourney {
  id: string;
  userId: string;
  organizationId: string;
  currentStage: JourneyStage;
  completedSteps: string[]; // Step IDs
  skippedSteps: string[]; // Step IDs
  availableSteps: string[]; // Steps user can currently take
  preferences: OnboardingPreferences;
  metrics: JourneyMetrics;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface OnboardingPreferences {
  tourEnabled: boolean;
  tooltipsEnabled: boolean;
  emailReminders: boolean;
  autoAdvanceSteps: boolean;
  celebrationAnimations: boolean;
  soundEffects: boolean;
  skipIntroductions: boolean;
}

export interface JourneyMetrics {
  timeToFirstContent?: number; // Minutes
  timeToFirstWorkspace?: number; // Minutes
  timeToCompletion?: number; // Minutes
  featuresUsed: FeatureCategory[];
  toursCompleted: TourType[];
  helpArticlesViewed: string[];
  lastActiveAt: Date;
  totalSessionTime: number; // Minutes
  contentGenerated: number;
  workspacesCreated: number;
  teamMembersInvited: number;
}

// Tour System

export interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector or data-testid
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: TourAction;
  optional: boolean;
  showSkip: boolean;
  showPrevious: boolean;
  showNext: boolean;
  autoAdvance?: number; // Milliseconds
  highlight: boolean;
  backdrop: boolean;
  order: number;
}

export interface TourAction {
  type: 'click' | 'input' | 'wait' | 'navigate';
  value?: string;
  waitForElement?: string;
  timeout?: number;
}

export interface ProductTour {
  id: string;
  title: string;
  description: string;
  type: TourType;
  steps: TourStep[];
  triggers: TourTrigger[];
  prerequisites?: string[]; // Journey step IDs or feature flags
  estimatedMinutes: number;
  category: FeatureCategory;
  priority: number;
  isActive: boolean;
}

export interface TourTrigger {
  type: 'page_load' | 'element_click' | 'feature_use' | 'time_based' | 'manual';
  condition?: string;
  delay?: number;
  onlyOnce?: boolean;
}

// Feature Discovery

export interface FeatureHighlight {
  id: string;
  feature: FeatureCategory;
  title: string;
  description: string;
  benefits: string[];
  demoUrl?: string;
  docsUrl?: string;
  target: string; // Element to highlight
  placement: 'tooltip' | 'modal' | 'banner' | 'spotlight';
  priority: number;
  showConditions: ShowCondition[];
  dismissible: boolean;
  ctaText?: string;
  ctaAction?: string;
  expiresAt?: Date;
}

export interface ShowCondition {
  type: 'user_segment' | 'feature_flag' | 'step_completed' | 'time_since_signup' | 'usage_count';
  value: string | number | boolean;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'not_equals';
}

// Help System

export interface HelpContent {
  id: string;
  title: string;
  content: string;
  type: 'tooltip' | 'article' | 'video' | 'interactive';
  category: FeatureCategory;
  keywords: string[];
  url?: string;
  thumbnail?: string;
  duration?: number; // For videos
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lastUpdated: Date;
  viewCount: number;
  helpfulness: number; // 1-5 rating
}

export interface ContextualHelp {
  element: string; // CSS selector
  content: HelpContent[];
  trigger: 'hover' | 'click' | 'focus' | 'auto';
  delay?: number;
  position: 'top' | 'bottom' | 'left' | 'right';
  persistent?: boolean;
}

// Progress Tracking

export interface ProgressMilestone {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiredSteps: string[];
  rewards?: ProgressReward[];
  category: 'setup' | 'usage' | 'mastery' | 'social';
  points: number;
  unlockedAt?: Date;
}

export interface ProgressReward {
  type: 'badge' | 'feature_unlock' | 'credit' | 'discount';
  value: string | number;
  description: string;
  expiresAt?: Date;
}

// Analytics Events

export interface OnboardingEvent {
  eventType: OnboardingEventType;
  userId: string;
  organizationId: string;
  sessionId: string;
  timestamp: Date;
  properties: Record<string, any>;
  metadata?: {
    userAgent: string;
    ip: string;
    referrer: string;
    device: string;
  };
}

export enum OnboardingEventType {
  // Journey Events
  JOURNEY_STARTED = 'journey.started',
  JOURNEY_STEP_COMPLETED = 'journey.step.completed',
  JOURNEY_STEP_SKIPPED = 'journey.step.skipped',
  JOURNEY_STAGE_ADVANCED = 'journey.stage.advanced',
  JOURNEY_COMPLETED = 'journey.completed',
  
  // Tour Events
  TOUR_STARTED = 'tour.started',
  TOUR_STEP_VIEWED = 'tour.step.viewed',
  TOUR_STEP_COMPLETED = 'tour.step.completed',
  TOUR_SKIPPED = 'tour.skipped',
  TOUR_COMPLETED = 'tour.completed',
  TOUR_ABANDONED = 'tour.abandoned',
  
  // Feature Discovery
  FEATURE_HIGHLIGHTED = 'feature.highlighted',
  FEATURE_DISCOVERED = 'feature.discovered',
  FEATURE_FIRST_USE = 'feature.first_use',
  HELP_ACCESSED = 'help.accessed',
  
  // Progress Events
  MILESTONE_ACHIEVED = 'milestone.achieved',
  REWARD_EARNED = 'reward.earned',
  
  // Engagement Events
  CHECKLIST_OPENED = 'checklist.opened',
  PREFERENCES_CHANGED = 'preferences.changed',
  FEEDBACK_SUBMITTED = 'feedback.submitted'
}

// State Management

export interface OnboardingState {
  // Current state
  isLoading: boolean;
  isInitialized: boolean;
  error?: string;
  
  // Journey data
  userJourney?: UserJourney;
  availableSteps: OnboardingStep[];
  completedSteps: OnboardingStep[];
  currentStep?: OnboardingStep;
  
  // Tour state
  activeTour?: ProductTour;
  currentTourStep?: TourStep;
  tourProgress: number; // 0-100
  tourHistory: string[]; // Tour IDs
  
  // Feature discovery
  activeHighlights: FeatureHighlight[];
  dismissedHighlights: string[];
  discoveredFeatures: FeatureCategory[];
  
  // Help system
  contextualHelp: ContextualHelp[];
  helpHistory: string[];
  
  // Progress tracking
  milestones: ProgressMilestone[];
  unlockedRewards: ProgressReward[];
  totalPoints: number;
  
  // UI state
  showChecklist: boolean;
  showTour: boolean;
  showWelcome: boolean;
  tourPosition: { x: number; y: number };
  highlightedElement?: string;
}

// Action Types

export interface OnboardingActions {
  // Initialization
  initializeOnboarding: () => Promise<void>;
  updatePreferences: (preferences: Partial<OnboardingPreferences>) => Promise<void>;
  
  // Journey management
  completeStep: (stepId: string) => Promise<void>;
  skipStep: (stepId: string, reason?: string) => Promise<void>;
  resetJourney: () => Promise<void>;
  advanceToStage: (stage: JourneyStage) => Promise<void>;
  
  // Tour management
  startTour: (tourId: string) => void;
  nextTourStep: () => void;
  previousTourStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
  pauseTour: () => void;
  resumeTour: () => void;
  
  // Feature discovery
  highlightFeature: (featureId: string) => void;
  dismissHighlight: (highlightId: string) => void;
  markFeatureDiscovered: (feature: FeatureCategory) => void;
  
  // Help system
  showHelp: (elementId: string) => void;
  hideHelp: () => void;
  trackHelpView: (contentId: string) => void;
  
  // Progress tracking
  checkMilestones: () => void;
  claimReward: (rewardId: string) => void;
  
  // UI actions
  toggleChecklist: () => void;
  setHighlightedElement: (elementId?: string) => void;
  updateTourPosition: (position: { x: number; y: number }) => void;
  
  // Analytics
  trackEvent: (event: OnboardingEvent) => void;
  trackStepCompletion: (stepId: string, timeSpent: number) => void;
  trackFeatureUsage: (feature: FeatureCategory) => void;
}

// Hook Return Types

export interface UseOnboardingReturn extends OnboardingState, OnboardingActions {
  // Computed properties
  isOnboardingComplete: boolean;
  currentStageProgress: number;
  overallProgress: number;
  nextSteps: OnboardingStep[];
  suggestedTours: ProductTour[];
  unviewedHighlights: FeatureHighlight[];
}

export interface UseProductTourReturn {
  // Current tour state
  activeTour?: ProductTour;
  currentStep?: TourStep;
  stepIndex: number;
  totalSteps: number;
  progress: number;
  
  // Tour controls
  start: (tourId: string) => void;
  next: () => void;
  previous: () => void;
  skip: () => void;
  complete: () => void;
  pause: () => void;
  resume: () => void;
  
  // State checks
  isActive: boolean;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
}

// API Response Types

export interface OnboardingApiResponse<T = any> {
  success: boolean;
  data: T;
  metadata?: {
    timestamp: string;
    requestId: string;
  };
}

export interface JourneyProgressResponse {
  journey: UserJourney;
  nextSteps: OnboardingStep[];
  availableTours: ProductTour[];
  milestones: ProgressMilestone[];
}

export interface TourConfigResponse {
  tours: ProductTour[];
  highlights: FeatureHighlight[];
  helpContent: HelpContent[];
}

// Utility Types

export type OnboardingConfig = {
  tours: ProductTour[];
  steps: OnboardingStep[];
  highlights: FeatureHighlight[];
  milestones: ProgressMilestone[];
  preferences: OnboardingPreferences;
};

export type StepFilter = {
  category?: StepCategory;
  completed?: boolean;
  available?: boolean;
  stage?: JourneyStage;
};

export type TourFilter = {
  type?: TourType;
  category?: FeatureCategory;
  completed?: boolean;
  available?: boolean;
};

// Event Handlers

export type OnboardingEventHandler = (event: OnboardingEvent) => void;
export type StepCompletionHandler = (step: OnboardingStep) => void;
export type TourStepHandler = (step: TourStep, tour: ProductTour) => void;
export type FeatureDiscoveryHandler = (feature: FeatureCategory) => void;