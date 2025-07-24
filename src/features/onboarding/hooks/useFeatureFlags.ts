/**
 * useFeatureFlags Hook
 * 
 * Manages feature visibility and availability based on user progress,
 * subscription plan, and onboarding state.
 */

import { useMemo } from 'react';
import { useOnboarding } from '../contexts/OnboardingContext';
import { useTenant } from '../../../contexts/TenantContext';
import { FeatureCategory, JourneyStage } from '../types/onboarding.types';

interface FeatureFlag {
  enabled: boolean;
  reason?: string;
  unlockCondition?: string;
}

interface UseFeatureFlagsReturn {
  // Feature availability checks
  isFeatureEnabled: (feature: FeatureCategory) => boolean;
  getFeatureFlag: (feature: FeatureCategory) => FeatureFlag;
  
  // Bulk checks
  enabledFeatures: FeatureCategory[];
  lockedFeatures: FeatureCategory[];
  
  // Onboarding-specific flags
  shouldShowTour: (tourId: string) => boolean;
  shouldShowHighlight: (feature: FeatureCategory) => boolean;
  shouldShowHelp: (elementId: string) => boolean;
  
  // Plan-based features
  isPlanFeatureEnabled: (feature: string) => boolean;
  getUpgradeReason: (feature: string) => string | null;
}

export const useFeatureFlags = (): UseFeatureFlagsReturn => {
  const {
    userJourney,
    discoveredFeatures,
    completedSteps,
    tourHistory
  } = useOnboarding();
  
  const { currentOrganization } = useTenant();

  // Feature unlock conditions based on journey progress
  const featureUnlockConditions = useMemo(() => {
    const conditions: Record<FeatureCategory, {
      stage?: JourneyStage;
      steps?: string[];
      discovered?: boolean;
      planRequired?: string[];
    }> = {
      [FeatureCategory.CONTENT_GENERATION]: {
        stage: JourneyStage.REGISTRATION,
        steps: ['complete_profile']
      },
      [FeatureCategory.VOICE_TO_TEXT]: {
        stage: JourneyStage.FIRST_CONTENT,
        steps: ['generate_first_content'],
        planRequired: ['creator', 'agency', 'enterprise']
      },
      [FeatureCategory.MULTI_LANGUAGE]: {
        stage: JourneyStage.FEATURE_DISCOVERY,
        steps: ['complete_workspace_setup'],
        planRequired: ['agency', 'enterprise']
      },
      [FeatureCategory.ANALYTICS]: {
        stage: JourneyStage.FIRST_CONTENT,
        steps: ['generate_first_content']
      },
      [FeatureCategory.COLLABORATION]: {
        stage: JourneyStage.TEAM_COLLABORATION,
        steps: ['invite_team_member'],
        planRequired: ['agency', 'enterprise']
      },
      [FeatureCategory.WORKSPACE_MANAGEMENT]: {
        stage: JourneyStage.FIRST_WORKSPACE,
        steps: ['create_first_workspace']
      },
      [FeatureCategory.API_INTEGRATION]: {
        stage: JourneyStage.POWER_USER,
        steps: ['complete_advanced_setup'],
        planRequired: ['enterprise']
      }
    };

    return conditions;
  }, []);

  // Plan-based feature restrictions
  const planFeatures = useMemo(() => {
    const features: Record<string, string[]> = {
      'advanced_analytics': ['agency', 'enterprise'],
      'custom_branding': ['agency', 'enterprise'],
      'api_access': ['enterprise'],
      'sso_integration': ['enterprise'],
      'priority_support': ['agency', 'enterprise'],
      'bulk_generation': ['agency', 'enterprise'],
      'white_labeling': ['enterprise'],
      'custom_models': ['enterprise']
    };

    return features;
  }, []);

  // Check if a feature is enabled based on journey progress and plan
  const getFeatureFlag = useCallback((feature: FeatureCategory): FeatureFlag => {
    const condition = featureUnlockConditions[feature];
    
    if (!condition) {
      return { enabled: true };
    }

    // Check stage requirement
    if (condition.stage && userJourney) {
      const stageOrder = Object.values(JourneyStage);
      const currentStageIndex = stageOrder.indexOf(userJourney.currentStage);
      const requiredStageIndex = stageOrder.indexOf(condition.stage);
      
      if (currentStageIndex < requiredStageIndex) {
        return {
          enabled: false,
          reason: 'Stage not reached',
          unlockCondition: `Complete ${condition.stage} stage`
        };
      }
    }

    // Check step requirements
    if (condition.steps) {
      const completedStepIds = completedSteps.map(step => step.id);
      const missingSteps = condition.steps.filter(step => !completedStepIds.includes(step));
      
      if (missingSteps.length > 0) {
        return {
          enabled: false,
          reason: 'Required steps not completed',
          unlockCondition: `Complete: ${missingSteps.join(', ')}`
        };
      }
    }

    // Check plan requirements
    if (condition.planRequired && currentOrganization) {
      const currentPlan = currentOrganization.subscription?.plan;
      if (!currentPlan || !condition.planRequired.includes(currentPlan)) {
        return {
          enabled: false,
          reason: 'Plan upgrade required',
          unlockCondition: `Upgrade to: ${condition.planRequired.join(' or ')}`
        };
      }
    }

    return { enabled: true };
  }, [featureUnlockConditions, userJourney, completedSteps, currentOrganization]);

  const isFeatureEnabled = useCallback((feature: FeatureCategory): boolean => {
    return getFeatureFlag(feature).enabled;
  }, [getFeatureFlag]);

  // Get all enabled and locked features
  const enabledFeatures = useMemo(() => {
    return Object.values(FeatureCategory).filter(feature => 
      isFeatureEnabled(feature)
    );
  }, [isFeatureEnabled]);

  const lockedFeatures = useMemo(() => {
    return Object.values(FeatureCategory).filter(feature => 
      !isFeatureEnabled(feature)
    );
  }, [isFeatureEnabled]);

  // Tour visibility logic
  const shouldShowTour = useCallback((tourId: string): boolean => {
    // Don't show if already completed
    if (tourHistory.includes(tourId)) {
      return false;
    }

    // Don't show if user has disabled tours
    if (userJourney?.preferences.tourEnabled === false) {
      return false;
    }

    // Add specific tour visibility logic here
    return true;
  }, [tourHistory, userJourney]);

  // Feature highlight visibility
  const shouldShowHighlight = useCallback((feature: FeatureCategory): boolean => {
    // Don't show if feature is already discovered
    if (discoveredFeatures.includes(feature)) {
      return false;
    }

    // Don't show if feature is not enabled
    if (!isFeatureEnabled(feature)) {
      return false;
    }

    // Don't show if user has disabled tooltips
    if (userJourney?.preferences.tooltipsEnabled === false) {
      return false;
    }

    return true;
  }, [discoveredFeatures, isFeatureEnabled, userJourney]);

  // Contextual help visibility
  const shouldShowHelp = useCallback((elementId: string): boolean => {
    // Add logic for when to show contextual help
    return userJourney?.preferences.tooltipsEnabled !== false;
  }, [userJourney]);

  // Plan-based feature checks
  const isPlanFeatureEnabled = useCallback((feature: string): boolean => {
    const requiredPlans = planFeatures[feature];
    if (!requiredPlans || !currentOrganization) {
      return true; // Default to enabled if no restrictions
    }

    const currentPlan = currentOrganization.subscription?.plan;
    return currentPlan ? requiredPlans.includes(currentPlan) : false;
  }, [planFeatures, currentOrganization]);

  const getUpgradeReason = useCallback((feature: string): string | null => {
    if (isPlanFeatureEnabled(feature)) {
      return null;
    }

    const requiredPlans = planFeatures[feature];
    if (!requiredPlans) {
      return null;
    }

    return `This feature requires ${requiredPlans.join(' or ')} plan`;
  }, [isPlanFeatureEnabled, planFeatures]);

  return {
    isFeatureEnabled,
    getFeatureFlag,
    enabledFeatures,
    lockedFeatures,
    shouldShowTour,
    shouldShowHighlight,
    shouldShowHelp,
    isPlanFeatureEnabled,
    getUpgradeReason
  };
};