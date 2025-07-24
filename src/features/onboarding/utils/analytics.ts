/**
 * Onboarding Analytics Utilities
 * 
 * Handles tracking and analysis of user onboarding behavior,
 * progress metrics, and feature adoption.
 */

import {
  OnboardingEvent,
  OnboardingEventType,
  FeatureCategory,
  JourneyStage,
  TourType,
  UserJourney,
  OnboardingStep
} from '../types/onboarding.types';

class OnboardingAnalytics {
  private sessionId: string;
  private userId?: string;
  private organizationId?: string;
  private sessionStartTime: Date;
  private events: OnboardingEvent[] = [];

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = new Date();
    this.loadStoredData();
  }

  /**
   * Initialize analytics with user context
   */
  initialize(userId: string, organizationId: string): void {
    this.userId = userId;
    this.organizationId = organizationId;
    this.saveUserContext();
  }

  /**
   * Track a generic onboarding event
   */
  trackEvent(
    eventType: OnboardingEventType,
    properties: Record<string, any> = {},
    metadata?: Record<string, any>
  ): void {
    if (!this.userId || !this.organizationId) {
      console.warn('Analytics not initialized with user context');
      return;
    }

    const event: OnboardingEvent = {
      eventType,
      userId: this.userId,
      organizationId: this.organizationId,
      sessionId: this.sessionId,
      timestamp: new Date(),
      properties: {
        sessionDuration: Date.now() - this.sessionStartTime.getTime(),
        ...properties
      },
      metadata: {
        userAgent: navigator.userAgent,
        ip: '', // Will be filled by backend
        referrer: document.referrer,
        device: this.getDeviceType(),
        ...metadata
      }
    };

    this.events.push(event);
    this.persistEvent(event);
    this.sendEventToBackend(event);
  }

  /**
   * Track journey stage advancement
   */
  trackStageAdvancement(
    fromStage: JourneyStage,
    toStage: JourneyStage,
    timeSpent: number
  ): void {
    this.trackEvent(OnboardingEventType.JOURNEY_STAGE_ADVANCED, {
      fromStage,
      toStage,
      timeSpent,
      stageProgression: this.getStageProgression(fromStage, toStage)
    });
  }

  /**
   * Track step completion with timing
   */
  trackStepCompletion(
    step: OnboardingStep,
    timeSpent: number,
    attempts: number = 1
  ): void {
    this.trackEvent(OnboardingEventType.JOURNEY_STEP_COMPLETED, {
      stepId: step.id,
      stepTitle: step.title,
      stepCategory: step.category,
      timeSpent,
      attempts,
      estimatedTime: step.estimatedMinutes * 60 * 1000,
      efficiency: (step.estimatedMinutes * 60 * 1000) / timeSpent
    });
  }

  /**
   * Track feature discovery and first use
   */
  trackFeatureDiscovery(
    feature: FeatureCategory,
    discoveryMethod: 'tour' | 'exploration' | 'highlight' | 'help'
  ): void {
    this.trackEvent(OnboardingEventType.FEATURE_DISCOVERED, {
      feature,
      discoveryMethod,
      timeSinceSignup: this.getTimeSinceSignup()
    });
  }

  /**
   * Track feature first use
   */
  trackFeatureFirstUse(
    feature: FeatureCategory,
    context: string,
    timeSinceDiscovery?: number
  ): void {
    this.trackEvent(OnboardingEventType.FEATURE_FIRST_USE, {
      feature,
      context,
      timeSinceDiscovery,
      timeSinceSignup: this.getTimeSinceSignup()
    });
  }

  /**
   * Track tour interactions
   */
  trackTourStart(tourType: TourType, tourId: string): void {
    this.trackEvent(OnboardingEventType.TOUR_STARTED, {
      tourType,
      tourId,
      startTime: new Date().toISOString()
    });
  }

  trackTourStep(
    tourId: string,
    stepId: string,
    stepIndex: number,
    timeSpent: number,
    action?: string
  ): void {
    this.trackEvent(OnboardingEventType.TOUR_STEP_VIEWED, {
      tourId,
      stepId,
      stepIndex,
      timeSpent,
      action
    });
  }

  trackTourCompletion(
    tourId: string,
    totalTime: number,
    stepsCompleted: number,
    stepsSkipped: number
  ): void {
    this.trackEvent(OnboardingEventType.TOUR_COMPLETED, {
      tourId,
      totalTime,
      stepsCompleted,
      stepsSkipped,
      completionRate: (stepsCompleted / (stepsCompleted + stepsSkipped)) * 100
    });
  }

  /**
   * Track help usage
   */
  trackHelpAccess(
    contentId: string,
    contentType: 'article' | 'video' | 'tour',
    trigger: 'search' | 'contextual' | 'browse'
  ): void {
    this.trackEvent(OnboardingEventType.HELP_ACCESSED, {
      contentId,
      contentType,
      trigger
    });
  }

  /**
   * Track milestone achievements
   */
  trackMilestoneAchieved(
    milestoneId: string,
    milestoneTitle: string,
    points: number
  ): void {
    this.trackEvent(OnboardingEventType.MILESTONE_ACHIEVED, {
      milestoneId,
      milestoneTitle,
      points,
      timeSinceSignup: this.getTimeSinceSignup()
    });
  }

  /**
   * Get analytics summary for current session
   */
  getSessionSummary(): {
    sessionId: string;
    duration: number;
    eventsCount: number;
    featuresDiscovered: FeatureCategory[];
    stepsCompleted: number;
    toursStarted: number;
    helpAccessed: number;
  } {
    const duration = Date.now() - this.sessionStartTime.getTime();
    const featuresDiscovered = this.events
      .filter(e => e.eventType === OnboardingEventType.FEATURE_DISCOVERED)
      .map(e => e.properties.feature as FeatureCategory);
    
    const stepsCompleted = this.events
      .filter(e => e.eventType === OnboardingEventType.JOURNEY_STEP_COMPLETED)
      .length;
    
    const toursStarted = this.events
      .filter(e => e.eventType === OnboardingEventType.TOUR_STARTED)
      .length;
    
    const helpAccessed = this.events
      .filter(e => e.eventType === OnboardingEventType.HELP_ACCESSED)
      .length;

    return {
      sessionId: this.sessionId,
      duration,
      eventsCount: this.events.length,
      featuresDiscovered: [...new Set(featuresDiscovered)],
      stepsCompleted,
      toursStarted,
      helpAccessed
    };
  }

  /**
   * Calculate user engagement score
   */
  calculateEngagementScore(): number {
    const summary = this.getSessionSummary();
    const sessionHours = summary.duration / (1000 * 60 * 60);
    
    // Scoring algorithm
    let score = 0;
    
    // Time engagement (max 30 points)
    score += Math.min(sessionHours * 10, 30);
    
    // Feature discovery (max 25 points)
    score += summary.featuresDiscovered.length * 5;
    
    // Step completion (max 25 points)
    score += Math.min(summary.stepsCompleted * 5, 25);
    
    // Tour engagement (max 10 points)
    score += Math.min(summary.toursStarted * 5, 10);
    
    // Help usage (max 10 points)
    score += Math.min(summary.helpAccessed * 2, 10);
    
    return Math.min(Math.round(score), 100);
  }

  /**
   * Get time-to-value metrics
   */
  getTimeToValueMetrics(): {
    timeToFirstContent?: number;
    timeToFirstWorkspace?: number;
    timeToFeatureDiscovery?: number;
    timeToTourCompletion?: number;
  } {
    const firstContent = this.events.find(e => 
      e.eventType === OnboardingEventType.FEATURE_FIRST_USE &&
      e.properties.feature === FeatureCategory.CONTENT_GENERATION
    );
    
    const firstWorkspace = this.events.find(e =>
      e.eventType === OnboardingEventType.FEATURE_FIRST_USE &&
      e.properties.feature === FeatureCategory.WORKSPACE_MANAGEMENT
    );
    
    const firstFeatureDiscovery = this.events.find(e =>
      e.eventType === OnboardingEventType.FEATURE_DISCOVERED
    );
    
    const firstTourCompletion = this.events.find(e =>
      e.eventType === OnboardingEventType.TOUR_COMPLETED
    );

    return {
      timeToFirstContent: firstContent 
        ? firstContent.timestamp.getTime() - this.sessionStartTime.getTime()
        : undefined,
      timeToFirstWorkspace: firstWorkspace
        ? firstWorkspace.timestamp.getTime() - this.sessionStartTime.getTime()
        : undefined,
      timeToFeatureDiscovery: firstFeatureDiscovery
        ? firstFeatureDiscovery.timestamp.getTime() - this.sessionStartTime.getTime()
        : undefined,
      timeToTourCompletion: firstTourCompletion
        ? firstTourCompletion.timestamp.getTime() - this.sessionStartTime.getTime()
        : undefined
    };
  }

  /**
   * Private helper methods
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDeviceType(): string {
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) return 'mobile';
    return 'desktop';
  }

  private getStageProgression(from: JourneyStage, to: JourneyStage): number {
    const stages = Object.values(JourneyStage);
    const fromIndex = stages.indexOf(from);
    const toIndex = stages.indexOf(to);
    return toIndex - fromIndex;
  }

  private getTimeSinceSignup(): number {
    // This would be calculated based on user registration date
    // For now, return session duration as placeholder
    return Date.now() - this.sessionStartTime.getTime();
  }

  private loadStoredData(): void {
    try {
      const stored = localStorage.getItem('onboarding_session');
      if (stored) {
        const data = JSON.parse(stored);
        this.sessionId = data.sessionId || this.sessionId;
        this.userId = data.userId;
        this.organizationId = data.organizationId;
      }
    } catch (error) {
      console.warn('Failed to load stored analytics data:', error);
    }
  }

  private saveUserContext(): void {
    try {
      const data = {
        sessionId: this.sessionId,
        userId: this.userId,
        organizationId: this.organizationId
      };
      localStorage.setItem('onboarding_session', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save user context:', error);
    }
  }

  private persistEvent(event: OnboardingEvent): void {
    try {
      const stored = localStorage.getItem('onboarding_events') || '[]';
      const events = JSON.parse(stored);
      events.push(event);
      
      // Keep only last 100 events to avoid storage bloat
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      
      localStorage.setItem('onboarding_events', JSON.stringify(events));
    } catch (error) {
      console.warn('Failed to persist event:', error);
    }
  }

  private async sendEventToBackend(event: OnboardingEvent): Promise<void> {
    try {
      // Send to backend analytics service
      await fetch('/api/v1/onboarding/analytics/event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.warn('Failed to send event to backend:', error);
      // Event is still persisted locally for retry
    }
  }

  /**
   * Batch send stored events (for retry mechanism)
   */
  async syncStoredEvents(): Promise<void> {
    try {
      const stored = localStorage.getItem('onboarding_events');
      if (!stored) return;

      const events = JSON.parse(stored);
      const response = await fetch('/api/v1/onboarding/analytics/events/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ events })
      });

      if (response.ok) {
        localStorage.removeItem('onboarding_events');
      }
    } catch (error) {
      console.warn('Failed to sync stored events:', error);
    }
  }

  /**
   * Clear all analytics data
   */
  clear(): void {
    this.events = [];
    localStorage.removeItem('onboarding_session');
    localStorage.removeItem('onboarding_events');
  }
}

// Export singleton instance
export const onboardingAnalytics = new OnboardingAnalytics();
export default onboardingAnalytics;