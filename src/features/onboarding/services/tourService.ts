/**
 * Tour Service
 * 
 * Manages tour registration, retrieval, and configuration.
 */

import { ProductTour, TourType, JourneyStage } from '../types/onboarding.types';
import { 
  DASHBOARD_TOUR, 
  CONTENT_GENERATION_TOUR, 
  WORKSPACE_MANAGEMENT_TOUR, 
  VOICE_TO_TEXT_TOUR,
  ALL_TOURS 
} from '../data/tours';

class TourService {
  private tours: Map<string, ProductTour> = new Map();

  constructor() {
    this.registerDefaultTours();
  }

  private registerDefaultTours() {
    // Register all default tours
    this.registerTour(DASHBOARD_TOUR);
    this.registerTour(CONTENT_GENERATION_TOUR);
    this.registerTour(WORKSPACE_MANAGEMENT_TOUR);
    this.registerTour(VOICE_TO_TEXT_TOUR);
  }

  registerTour(tour: ProductTour): void {
    // Validate tour structure
    if (!tour.id || !tour.title || !tour.steps || tour.steps.length === 0) {
      console.warn('Invalid tour structure:', tour);
      return;
    }

    // Validate steps
    for (const step of tour.steps) {
      if (!step.id || !step.title || !step.content) {
        console.warn('Invalid step in tour:', tour.id, step);
        return;
      }
    }

    this.tours.set(tour.id, tour);
  }

  getTour(tourId: string): ProductTour | undefined {
    return this.tours.get(tourId);
  }

  getAllTours(): ProductTour[] {
    return Array.from(this.tours.values());
  }

  getToursByType(type: TourType): ProductTour[] {
    return Array.from(this.tours.values()).filter(tour => tour.type === type);
  }

  getRecommendedTours(currentStage: JourneyStage, completedTours: string[] = []): ProductTour[] {
    const allTours = this.getAllTours();
    const availableTours = allTours.filter(tour => !completedTours.includes(tour.id));

    // Recommend tours based on journey stage
    switch (currentStage) {
      case JourneyStage.REGISTRATION:
      case JourneyStage.ORGANIZATION_SETUP:
        return availableTours.filter(tour => 
          tour.id === 'dashboard_overview'
        );

      case JourneyStage.FIRST_WORKSPACE:
        return availableTours.filter(tour => 
          ['dashboard_overview', 'workspace_management'].includes(tour.id)
        );

      case JourneyStage.FIRST_CONTENT:
        return availableTours.filter(tour => 
          ['content_generation_basics', 'voice_to_text_feature'].includes(tour.id)
        );

      case JourneyStage.FEATURE_DISCOVERY:
        return availableTours.filter(tour => 
          tour.type === TourType.FEATURE_WALKTHROUGH
        );

      case JourneyStage.TEAM_COLLABORATION:
        return availableTours.filter(tour => 
          ['workspace_management'].includes(tour.id)
        );

      default:
        return availableTours.slice(0, 3); // Return first 3 available tours
    }
  }

  validateTourTarget(tourId: string): { valid: boolean; missingTargets: string[] } {
    const tour = this.getTour(tourId);
    if (!tour) {
      return { valid: false, missingTargets: ['Tour not found'] };
    }

    const missingTargets: string[] = [];

    for (const step of tour.steps) {
      if (step.target && step.target !== 'center') {
        const element = document.querySelector(step.target);
        if (!element) {
          missingTargets.push(`${step.id}: ${step.target}`);
        }
      }
    }

    return {
      valid: missingTargets.length === 0,
      missingTargets
    };
  }

  getTourProgress(tourId: string, currentStepIndex: number): {
    percentage: number;
    currentStep: number;
    totalSteps: number;
    isComplete: boolean;
  } {
    const tour = this.getTour(tourId);
    if (!tour) {
      return { percentage: 0, currentStep: 0, totalSteps: 0, isComplete: false };
    }

    const totalSteps = tour.steps.length;
    const currentStep = Math.min(currentStepIndex + 1, totalSteps);
    const percentage = (currentStep / totalSteps) * 100;
    const isComplete = currentStep >= totalSteps;

    return {
      percentage,
      currentStep,
      totalSteps,
      isComplete
    };
  }

  canStartTour(tourId: string, userStage: JourneyStage): boolean {
    const tour = this.getTour(tourId);
    if (!tour) return false;

    // Check if tour is available for current stage
    const recommendedTours = this.getRecommendedTours(userStage);
    return recommendedTours.some(t => t.id === tourId);
  }

  getTourEstimatedTime(tourId: string): number {
    const tour = this.getTour(tourId);
    if (!tour) return 0;

    // If estimatedMinutes is provided, use it
    if (tour.estimatedMinutes) {
      return tour.estimatedMinutes;
    }

    // Otherwise, calculate based on steps (assume 30 seconds per step)
    return Math.ceil(tour.steps.length * 0.5);
  }

  getToursByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): ProductTour[] {
    return this.getAllTours().filter(tour => {
      // Map tour types to difficulties
      switch (tour.type) {
        case TourType.WELCOME:
        case TourType.DASHBOARD_OVERVIEW:
          return difficulty === 'beginner';
        case TourType.FEATURE_WALKTHROUGH:
          return difficulty === 'intermediate';
        case TourType.ADVANCED_FEATURES:
          return difficulty === 'advanced';
        default:
          return difficulty === 'beginner';
      }
    });
  }

  searchTours(query: string): ProductTour[] {
    const lowercaseQuery = query.toLowerCase();
    return this.getAllTours().filter(tour => 
      tour.title.toLowerCase().includes(lowercaseQuery) ||
      tour.description.toLowerCase().includes(lowercaseQuery) ||
      tour.steps.some(step => 
        step.title.toLowerCase().includes(lowercaseQuery) ||
        step.content.toLowerCase().includes(lowercaseQuery)
      )
    );
  }
}

// Export singleton instance
export const tourService = new TourService();

// Export class for testing or multiple instances
export { TourService };