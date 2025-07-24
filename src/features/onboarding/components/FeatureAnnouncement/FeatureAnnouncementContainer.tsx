/**
 * Feature Announcement Container Component
 * 
 * Manages and displays feature announcements throughout the application.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Snackbar,
  Alert,
  Portal,
  Fade
} from '@mui/material';
import { 
  FeatureAnnouncementBanner, 
  FeatureAnnouncement 
} from './FeatureAnnouncementBanner';

interface FeatureAnnouncementContainerProps {
  position?: 'top' | 'bottom' | 'banner';
  maxVisible?: number;
  autoHideDuration?: number;
}

export const FeatureAnnouncementContainer: React.FC<FeatureAnnouncementContainerProps> = ({
  position = 'banner',
  maxVisible = 3,
  autoHideDuration = 10000
}) => {
  const [announcements, setAnnouncements] = useState<FeatureAnnouncement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Load announcements on mount
  useEffect(() => {
    loadAnnouncements();
    loadDismissedAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    // In a real app, this would fetch from API
    // For now, we'll use mock data
    const mockAnnouncements: FeatureAnnouncement[] = [
      {
        id: 'v2.1.0-voice-to-text',
        title: '🎤 New Voice-to-Text Feature',
        description: 'Transform your voice recordings into engaging social media content with our new AI-powered voice-to-text feature. Simply upload an audio file or record directly in your browser.',
        type: 'new_feature',
        priority: 'high',
        version: '2.1.0',
        date: new Date('2025-01-10'),
        actionText: 'Try It Now',
        actionUrl: '/content/voice-to-text',
        tags: ['AI', 'Voice', 'Content Creation'],
        imageUrl: '/images/voice-to-text-demo.png'
      },
      {
        id: 'v2.0.5-performance',
        title: '⚡ Performance Improvements',
        description: 'We\'ve significantly improved application loading times and content generation speed. Experience faster workflows and smoother interactions.',
        type: 'improvement',
        priority: 'medium',
        version: '2.0.5',
        date: new Date('2025-01-05'),
        actionText: 'Learn More',
        tags: ['Performance', 'Speed']
      },
      {
        id: 'v2.0.4-bug-fixes',
        title: '🐛 Bug Fixes & Stability',
        description: 'Fixed issues with workspace switching, improved error handling, and resolved several edge cases in content generation.',
        type: 'bug_fix',
        priority: 'low',
        version: '2.0.4',
        date: new Date('2025-01-01'),
        tags: ['Stability', 'Bug Fixes']
      },
      {
        id: 'welcome-onboarding',
        title: '👋 Welcome to the New Onboarding Experience',
        description: 'Discover new features with our interactive tours and guided onboarding. Get up to speed faster with personalized recommendations.',
        type: 'announcement',
        priority: 'medium',
        date: new Date('2024-12-28'),
        actionText: 'Start Tour',
        actionUrl: '/onboarding/tour',
        tags: ['Onboarding', 'Tours', 'User Experience']
      }
    ];

    setAnnouncements(mockAnnouncements);
  };

  const loadDismissedAnnouncements = () => {
    const dismissed = localStorage.getItem('dismissedAnnouncements');
    if (dismissed) {
      try {
        const dismissedList = JSON.parse(dismissed);
        setDismissedIds(new Set(dismissedList));
      } catch (error) {
        console.warn('Failed to parse dismissed announcements:', error);
      }
    }
  };

  const handleDismiss = (announcementId: string) => {
    const newDismissed = new Set(dismissedIds);
    newDismissed.add(announcementId);
    setDismissedIds(newDismissed);
    
    // Persist to localStorage
    localStorage.setItem(
      'dismissedAnnouncements', 
      JSON.stringify(Array.from(newDismissed))
    );

    // Remove from current announcements
    setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
  };

  const handleAction = (announcementId: string) => {
    // Track announcement interaction
    console.log('Announcement action clicked:', announcementId);
    
    // Optionally auto-dismiss after action
    // handleDismiss(announcementId);
  };

  // Filter out dismissed announcements and limit visible count
  const visibleAnnouncements = announcements
    .filter(announcement => !dismissedIds.has(announcement.id))
    .slice(0, maxVisible)
    .sort((a, b) => {
      // Sort by priority and date
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      return b.date.getTime() - a.date.getTime();
    });

  if (visibleAnnouncements.length === 0) {
    return null;
  }

  // Render as banner (default)
  if (position === 'banner') {
    return (
      <Box sx={{ mb: 3 }}>
        {visibleAnnouncements.map((announcement) => (
          <FeatureAnnouncementBanner
            key={announcement.id}
            announcement={announcement}
            onDismiss={handleDismiss}
            onAction={handleAction}
            showAnimation={true}
          />
        ))}
      </Box>
    );
  }

  // Render as snackbar (top/bottom)
  if (position === 'top' || position === 'bottom') {
    return (
      <>
        {visibleAnnouncements.map((announcement, index) => (
          <Snackbar
            key={announcement.id}
            open={true}
            anchorOrigin={{
              vertical: position,
              horizontal: 'right'
            }}
            sx={{
              position: 'fixed',
              [position]: 20 + (index * 80), // Stack multiple announcements
              zIndex: 1400
            }}
            autoHideDuration={autoHideDuration}
            onClose={() => handleDismiss(announcement.id)}
          >
            <Alert
              severity={announcement.priority === 'high' ? 'warning' : 'info'}
              onClose={() => handleDismiss(announcement.id)}
              sx={{ minWidth: 300, maxWidth: 400 }}
            >
              <Box>
                <Box sx={{ fontWeight: 600, mb: 0.5 }}>
                  {announcement.title}
                </Box>
                <Box sx={{ fontSize: '0.875rem' }}>
                  {announcement.description.length > 100
                    ? `${announcement.description.substring(0, 100)}...`
                    : announcement.description
                  }
                </Box>
                {announcement.actionText && (
                  <Box sx={{ mt: 1 }}>
                    <Alert
                      severity="info"
                      onClick={() => handleAction(announcement.id)}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.8 }
                      }}
                    >
                      {announcement.actionText}
                    </Alert>
                  </Box>
                )}
              </Box>
            </Alert>
          </Snackbar>
        ))}
      </>
    );
  }

  return null;
};