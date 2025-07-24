/**
 * Tour Data Configuration
 * 
 * Defines all available product tours with their steps and targeting.
 */

import { ProductTour, TourStep, TourType } from '../types/onboarding.types';

export const DASHBOARD_TOUR: ProductTour = {
  id: 'dashboard_overview',
  title: 'Dashboard Overview',
  description: 'Learn about your ContentAutoPilot dashboard and key features',
  type: TourType.DASHBOARD_OVERVIEW,
  estimatedMinutes: 3,
  isSkippable: true,
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to Your Dashboard! 👋',
      content: 'This is your central hub for managing content across all your workspaces. Here you can monitor performance, access quick actions, and manage your content strategy.',
      target: '[data-testid="dashboard-content"]',
      placement: 'center',
      disableBeacon: true,
      showSkip: true
    },
    {
      id: 'organization_management',
      title: 'Organization Management 🏢',
      content: 'Switch between organizations and manage your teams here. Each organization can have multiple workspaces and team members with different roles.',
      target: '[data-testid="organization-name"]',
      placement: 'bottom',
      showNext: true,
      showBack: true
    },
    {
      id: 'workspace_selection',
      title: 'Workspace Selection 💼',
      content: 'Each workspace represents a client or project. Create and switch between them easily to organize your content by brand or campaign.',
      target: '[data-testid="workspace-switcher"]',
      placement: 'bottom',
      showNext: true,
      showBack: true
    },
    {
      id: 'content_stats',
      title: 'Content Statistics 📊',
      content: 'Monitor your content performance with these key metrics. Track total content created, published posts, and scheduled content at a glance.',
      target: '[data-testid="organization-stats"]',
      placement: 'top',
      showNext: true,
      showBack: true
    },
    {
      id: 'quick_actions',
      title: 'Quick Actions ⚡',
      content: 'Access your most common tasks right from the dashboard. Generate new content or schedule posts with just one click to boost your productivity.',
      target: '[data-testid="quick-actions"]',
      placement: 'top',
      showNext: true,
      showBack: true
    },
    {
      id: 'recent_activity',
      title: 'Recent Activity 🔄',
      content: 'Stay updated with your latest content and team activities. See what\'s been created, published, or scheduled recently to keep track of your progress.',
      target: '[data-testid="recent-content"]',
      placement: 'top',
      showNext: false,
      showBack: true,
      isLast: true
    }
  ]
};

export const CONTENT_GENERATION_TOUR: ProductTour = {
  id: 'content_generation_basics',
  title: 'Content Generation Basics',
  description: 'Learn how to create amazing content with AI assistance',
  type: TourType.FEATURE_WALKTHROUGH,
  estimatedMinutes: 5,
  isSkippable: true,
  steps: [
    {
      id: 'content_intro',
      title: 'AI-Powered Content Creation',
      content: 'ContentAutoPilot uses advanced AI to help you create engaging social media content. Let\'s explore the content generation features.',
      target: '[data-testid="content-generator"]',
      placement: 'right',
      disableBeacon: true
    },
    {
      id: 'platform_selection',
      title: 'Choose Your Platform',
      content: 'Select the social media platform you want to create content for. Each platform has optimized settings for best results.',
      target: '[data-testid="platform-selector"]',
      placement: 'bottom'
    },
    {
      id: 'prompt_input',
      title: 'Describe Your Content',
      content: 'Enter a description of what you want to create. Be specific about your message, tone, and any key points you want to include.',
      target: '[data-testid="prompt-input"]',
      placement: 'top'
    },
    {
      id: 'generation_options',
      title: 'Customize Your Content',
      content: 'Fine-tune your content with options like tone of voice, target audience, and content length. These settings help the AI create more relevant content.',
      target: '[data-testid="generation-options"]',
      placement: 'left'
    },
    {
      id: 'generate_button',
      title: 'Generate Content',
      content: 'Click generate to create your content. The AI will analyze your inputs and create multiple variations for you to choose from.',
      target: '[data-testid="generate-button"]',
      placement: 'top',
      isLast: true
    }
  ]
};

export const WORKSPACE_MANAGEMENT_TOUR: ProductTour = {
  id: 'workspace_management',
  title: 'Workspace Management',
  description: 'Learn how to set up and manage client workspaces',
  type: TourType.FEATURE_WALKTHROUGH,
  estimatedMinutes: 4,
  isSkippable: true,
  steps: [
    {
      id: 'workspace_concept',
      title: 'Understanding Workspaces',
      content: 'Workspaces help you organize content by client, brand, or project. Each workspace has its own settings, team members, and content.',
      target: '[data-testid="workspace-container"]',
      placement: 'center',
      disableBeacon: true
    },
    {
      id: 'create_workspace',
      title: 'Creating a Workspace',
      content: 'Click here to create a new workspace. You\'ll set up client information, branding guidelines, and team access.',
      target: '[data-testid="create-workspace"]',
      placement: 'bottom'
    },
    {
      id: 'workspace_settings',
      title: 'Workspace Settings',
      content: 'Configure your workspace with client branding, tone of voice, and content preferences. This helps the AI generate more on-brand content.',
      target: '[data-testid="workspace-settings"]',
      placement: 'left'
    },
    {
      id: 'team_collaboration',
      title: 'Team Collaboration',
      content: 'Invite team members to collaborate on content. Set permissions and roles to control who can create, edit, or publish content.',
      target: '[data-testid="team-management"]',
      placement: 'right',
      isLast: true
    }
  ]
};

export const VOICE_TO_TEXT_TOUR: ProductTour = {
  id: 'voice_to_text_feature',
  title: 'Voice-to-Text Content',
  description: 'Turn your voice recordings into social media content',
  type: TourType.FEATURE_WALKTHROUGH,
  estimatedMinutes: 3,
  isSkippable: true,
  steps: [
    {
      id: 'voice_intro',
      title: 'Voice-to-Content Magic',
      content: 'Transform your voice recordings into polished social media content. Perfect for capturing spontaneous ideas or converting presentations.',
      target: '[data-testid="voice-uploader"]',
      placement: 'right',
      disableBeacon: true
    },
    {
      id: 'upload_audio',
      title: 'Upload Your Audio',
      content: 'Drag and drop an audio file or record directly in the browser. We support most audio formats including MP3, WAV, and M4A.',
      target: '[data-testid="audio-upload"]',
      placement: 'bottom'
    },
    {
      id: 'transcription_review',
      title: 'Review Transcription',
      content: 'Our AI will transcribe your audio with high accuracy. You can review and edit the transcription before generating content.',
      target: '[data-testid="transcription-display"]',
      placement: 'top'
    },
    {
      id: 'content_generation',
      title: 'Generate Social Content',
      content: 'The AI transforms your transcription into engaging social media posts, optimized for your chosen platform and audience.',
      target: '[data-testid="voice-generate"]',
      placement: 'left',
      isLast: true
    }
  ]
};

// Export all tours as a collection
export const ALL_TOURS: Record<string, ProductTour> = {
  dashboard_overview: DASHBOARD_TOUR,
  content_generation_basics: CONTENT_GENERATION_TOUR,
  workspace_management: WORKSPACE_MANAGEMENT_TOUR,
  voice_to_text_feature: VOICE_TO_TEXT_TOUR
};

// Helper function to get tour by ID
export const getTourById = (tourId: string): ProductTour | undefined => {
  return ALL_TOURS[tourId];
};

// Helper function to get tours by type
export const getToursByType = (type: TourType): ProductTour[] => {
  return Object.values(ALL_TOURS).filter(tour => tour.type === type);
};

// Default tour suggestions based on user stage
export const getDefaultTourSuggestions = (currentStage: string): ProductTour[] => {
  switch (currentStage) {
    case 'registration':
    case 'organization_setup':
      return [DASHBOARD_TOUR];
    case 'first_workspace':
      return [DASHBOARD_TOUR, WORKSPACE_MANAGEMENT_TOUR];
    case 'first_content':
      return [CONTENT_GENERATION_TOUR, VOICE_TO_TEXT_TOUR];
    case 'feature_discovery':
      return [VOICE_TO_TEXT_TOUR, WORKSPACE_MANAGEMENT_TOUR];
    default:
      return [DASHBOARD_TOUR];
  }
};