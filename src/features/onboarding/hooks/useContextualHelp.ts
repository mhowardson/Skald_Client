/**
 * Contextual Help Hook
 * 
 * Provides page-specific help articles and guidance based on current route and user context.
 */

import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { HelpArticle } from '../components/HelpCenter/HelpCenterWidget';
import { useOnboarding } from './useOnboarding';

interface UseContextualHelpReturn {
  contextualArticles: HelpArticle[];
  suggestedArticles: HelpArticle[];
  isLoading: boolean;
  refreshHelp: () => void;
  getHelpForPage: (pathname: string) => HelpArticle[];
  getHelpForFeature: (feature: string) => HelpArticle[];
}

// Help article database - in a real app, this would come from an API
const HELP_ARTICLES: HelpArticle[] = [
  // Dashboard Help
  {
    id: 'dashboard-overview',
    title: 'Understanding Your Dashboard',
    description: 'Learn about dashboard features, metrics, and navigation',
    content: `
      <h2>Dashboard Overview</h2>
      <p>Your dashboard provides a centralized view of your content performance and quick access to key features.</p>
      
      <h3>Key Sections:</h3>
      <ul>
        <li><strong>Organization Switcher:</strong> Switch between different organizations you belong to</li>
        <li><strong>Workspace Selector:</strong> Choose the client workspace you want to work with</li>
        <li><strong>Performance Metrics:</strong> View content statistics including total, published, and scheduled posts</li>
        <li><strong>Quick Actions:</strong> Access frequently used features like content generation</li>
        <li><strong>Recent Activity:</strong> See your latest content and team activities</li>
      </ul>
      
      <h3>Getting Started:</h3>
      <p>If this is your first time, consider taking the dashboard tour or creating your first workspace.</p>
    `,
    category: 'getting-started',
    type: 'article',
    estimatedReadTime: 3,
    tags: ['dashboard', 'overview', 'navigation'],
    helpful: 35,
    notHelpful: 2
  },
  
  // Content Generation Help
  {
    id: 'content-generation-guide',
    title: 'AI Content Generation Best Practices',
    description: 'Tips and tricks for creating engaging content with AI assistance',
    content: `
      <h2>Creating Great Content with AI</h2>
      <p>Our AI-powered content generation helps you create engaging social media posts quickly and efficiently.</p>
      
      <h3>Writing Effective Prompts:</h3>
      <ul>
        <li>Be specific about your message and tone</li>
        <li>Include target audience information</li>
        <li>Mention key points or calls-to-action</li>
        <li>Specify the platform for optimization</li>
      </ul>
      
      <h3>Platform Optimization:</h3>
      <ul>
        <li><strong>Instagram:</strong> Visual-focused, hashtag-friendly content</li>
        <li><strong>Twitter:</strong> Concise, engaging, conversation-starting posts</li>
        <li><strong>LinkedIn:</strong> Professional, industry-focused content</li>
        <li><strong>Facebook:</strong> Community-building, shareable content</li>
      </ul>
    `,
    category: 'features',
    type: 'article',
    estimatedReadTime: 5,
    tags: ['content', 'ai', 'generation', 'best-practices'],
    helpful: 89,
    notHelpful: 4
  },

  // Voice to Text Help
  {
    id: 'voice-to-text-tutorial',
    title: 'Voice-to-Text Content Creation',
    description: 'Transform your voice recordings into social media content',
    content: `
      <h2>Voice-to-Text Feature</h2>
      <p>Convert your voice recordings into polished social media content with AI assistance.</p>
      
      <h3>Supported Formats:</h3>
      <ul>
        <li>MP3, WAV, M4A audio files</li>
        <li>Direct browser recording</li>
        <li>Maximum file size: 50MB</li>
        <li>Maximum duration: 30 minutes</li>
      </ul>
      
      <h3>Best Recording Practices:</h3>
      <ul>
        <li>Record in a quiet environment</li>
        <li>Speak clearly and at a moderate pace</li>
        <li>Include key points you want emphasized</li>
        <li>Mention your target platform and audience</li>
      </ul>
    `,
    category: 'features',
    type: 'video',
    videoUrl: 'https://example.com/voice-to-text-demo',
    estimatedReadTime: 4,
    tags: ['voice', 'audio', 'transcription', 'content'],
    helpful: 42,
    notHelpful: 1
  },

  // Workspace Management Help
  {
    id: 'workspace-management',
    title: 'Managing Client Workspaces',
    description: 'Learn how to create and organize workspaces for different clients',
    content: `
      <h2>Workspace Management</h2>
      <p>Workspaces help you organize content by client, brand, or project.</p>
      
      <h3>Creating a Workspace:</h3>
      <ol>
        <li>Click "Create Workspace" from the workspace switcher</li>
        <li>Enter client information and company details</li>
        <li>Set up brand guidelines including colors and tone</li>
        <li>Configure team access and permissions</li>
      </ol>
      
      <h3>Brand Guidelines:</h3>
      <p>Setting up proper brand guidelines helps the AI generate more on-brand content:</p>
      <ul>
        <li>Primary and secondary brand colors</li>
        <li>Tone of voice (professional, casual, friendly, etc.)</li>
        <li>Industry and target audience</li>
        <li>Key messaging and values</li>
      </ul>
    `,
    category: 'getting-started',
    type: 'article',
    estimatedReadTime: 6,
    tags: ['workspace', 'client', 'branding', 'setup'],
    helpful: 67,
    notHelpful: 3
  },

  // Troubleshooting Help
  {
    id: 'connection-troubleshooting',
    title: 'Troubleshooting Connection Issues',
    description: 'Common connection problems and how to resolve them',
    content: `
      <h2>Connection Troubleshooting</h2>
      <p>If you're experiencing connection issues, try these solutions:</p>
      
      <h3>Common Issues:</h3>
      <ul>
        <li><strong>Login Problems:</strong> Check your email and password, try password reset</li>
        <li><strong>Slow Loading:</strong> Check internet connection, clear browser cache</li>
        <li><strong>Content Generation Errors:</strong> Wait a moment and try again, check API status</li>
        <li><strong>File Upload Issues:</strong> Check file size and format, try a different browser</li>
      </ul>
      
      <h3>Browser Requirements:</h3>
      <ul>
        <li>Modern browsers: Chrome 90+, Firefox 88+, Safari 14+</li>
        <li>JavaScript enabled</li>
        <li>Cookies enabled for authentication</li>
        <li>Stable internet connection</li>
      </ul>
    `,
    category: 'troubleshooting',
    type: 'faq',
    estimatedReadTime: 4,
    tags: ['troubleshooting', 'connection', 'browser', 'technical'],
    helpful: 28,
    notHelpful: 5
  },

  // Analytics Help
  {
    id: 'analytics-understanding',
    title: 'Understanding Your Analytics',
    description: 'Learn how to read and interpret your content performance data',
    content: `
      <h2>Analytics Dashboard</h2>
      <p>Track your content performance and engagement across platforms.</p>
      
      <h3>Key Metrics:</h3>
      <ul>
        <li><strong>Reach:</strong> Number of unique users who saw your content</li>
        <li><strong>Engagement:</strong> Likes, shares, comments, and other interactions</li>
        <li><strong>Click-through Rate:</strong> Percentage of users who clicked your links</li>
        <li><strong>Conversion Rate:</strong> Users who completed desired actions</li>
      </ul>
      
      <h3>Improving Performance:</h3>
      <ul>
        <li>Post at optimal times for your audience</li>
        <li>Use engaging visuals and compelling copy</li>
        <li>Experiment with different content types</li>
        <li>Analyze top-performing posts for insights</li>
      </ul>
    `,
    category: 'features',
    type: 'article',
    estimatedReadTime: 7,
    tags: ['analytics', 'metrics', 'performance', 'insights'],
    helpful: 54,
    notHelpful: 2
  }
];

// Map routes to relevant help articles
const ROUTE_HELP_MAPPING: Record<string, string[]> = {
  '/dashboard': ['dashboard-overview', 'workspace-management'],
  '/content': ['content-generation-guide', 'voice-to-text-tutorial'],
  '/content/generate': ['content-generation-guide'],
  '/content/voice-to-text': ['voice-to-text-tutorial'],
  '/analytics': ['analytics-understanding'],
  '/workspace': ['workspace-management'],
  '/settings': ['workspace-management', 'connection-troubleshooting'],
};

// Map features to help articles
const FEATURE_HELP_MAPPING: Record<string, string[]> = {
  'content_generation': ['content-generation-guide'],
  'voice_to_text': ['voice-to-text-tutorial'],
  'workspace_management': ['workspace-management'],
  'analytics': ['analytics-understanding'],
  'dashboard': ['dashboard-overview'],
};

export const useContextualHelp = (): UseContextualHelpReturn => {
  const location = useLocation();
  const { userJourney } = useOnboarding();
  const [isLoading, setIsLoading] = useState(false);

  const contextualArticles = useMemo(() => {
    const currentPath = location.pathname;
    const relevantArticleIds = ROUTE_HELP_MAPPING[currentPath] || [];
    
    // Add articles based on exact path match
    let articles = HELP_ARTICLES.filter(article => 
      relevantArticleIds.includes(article.id)
    );

    // Add articles based on partial path matches
    if (articles.length === 0) {
      const pathSegments = currentPath.split('/').filter(Boolean);
      for (const segment of pathSegments) {
        const matchingPath = Object.keys(ROUTE_HELP_MAPPING).find(path => 
          path.includes(segment)
        );
        if (matchingPath) {
          const articleIds = ROUTE_HELP_MAPPING[matchingPath];
          articles = HELP_ARTICLES.filter(article => 
            articleIds.includes(article.id)
          );
          break;
        }
      }
    }

    return articles;
  }, [location.pathname]);

  const suggestedArticles = useMemo(() => {
    if (!userJourney) return [];

    // Suggest articles based on user's journey stage
    const stageMapping: Record<string, string[]> = {
      'registration': ['dashboard-overview', 'workspace-management'],
      'organization_setup': ['workspace-management', 'dashboard-overview'],
      'first_workspace': ['workspace-management', 'content-generation-guide'],
      'first_content': ['content-generation-guide', 'voice-to-text-tutorial'],
      'feature_discovery': ['voice-to-text-tutorial', 'analytics-understanding'],
      'team_collaboration': ['workspace-management', 'analytics-understanding'],
      'power_user': ['analytics-understanding', 'content-generation-guide'],
    };

    const relevantIds = stageMapping[userJourney.currentStage] || [];
    return HELP_ARTICLES.filter(article => 
      relevantIds.includes(article.id)
    ).slice(0, 3); // Limit to 3 suggestions
  }, [userJourney]);

  const getHelpForPage = (pathname: string): HelpArticle[] => {
    const relevantArticleIds = ROUTE_HELP_MAPPING[pathname] || [];
    return HELP_ARTICLES.filter(article => 
      relevantArticleIds.includes(article.id)
    );
  };

  const getHelpForFeature = (feature: string): HelpArticle[] => {
    const relevantArticleIds = FEATURE_HELP_MAPPING[feature] || [];
    return HELP_ARTICLES.filter(article => 
      relevantArticleIds.includes(article.id)
    );
  };

  const refreshHelp = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  return {
    contextualArticles,
    suggestedArticles,
    isLoading,
    refreshHelp,
    getHelpForPage,
    getHelpForFeature
  };
};