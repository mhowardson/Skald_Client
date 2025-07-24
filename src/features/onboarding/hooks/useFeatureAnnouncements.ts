/**
 * Feature Announcements Hook
 * 
 * Manages feature announcement state, loading, and user interactions.
 */

import { useState, useEffect, useCallback } from 'react';
import { FeatureAnnouncement } from '../components/FeatureAnnouncement/FeatureAnnouncementBanner';

interface UseFeatureAnnouncementsReturn {
  announcements: FeatureAnnouncement[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  dismissAnnouncement: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refreshAnnouncements: () => Promise<void>;
  getAnnouncementsByType: (type: FeatureAnnouncement['type']) => FeatureAnnouncement[];
  getHighPriorityAnnouncements: () => FeatureAnnouncement[];
}

const STORAGE_KEY = 'feature_announcements';
const DISMISSED_KEY = 'dismissed_announcements';
const READ_KEY = 'read_announcements';

export const useFeatureAnnouncements = (): UseFeatureAnnouncementsReturn => {
  const [announcements, setAnnouncements] = useState<FeatureAnnouncement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load persisted state from localStorage
  useEffect(() => {
    loadPersistedState();
    loadAnnouncements();
  }, []);

  const loadPersistedState = () => {
    try {
      // Load dismissed announcements
      const dismissedData = localStorage.getItem(DISMISSED_KEY);
      if (dismissedData) {
        setDismissedIds(new Set(JSON.parse(dismissedData)));
      }

      // Load read announcements
      const readData = localStorage.getItem(READ_KEY);
      if (readData) {
        setReadIds(new Set(JSON.parse(readData)));
      }
    } catch (error) {
      console.warn('Failed to load persisted announcement state:', error);
    }
  };

  const persistState = (dismissed: Set<string>, read: Set<string>) => {
    try {
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(Array.from(dismissed)));
      localStorage.setItem(READ_KEY, JSON.stringify(Array.from(read)));
    } catch (error) {
      console.warn('Failed to persist announcement state:', error);
    }
  };

  const loadAnnouncements = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // In a real application, this would be an API call
      // For now, we'll simulate with mock data
      const mockAnnouncements: FeatureAnnouncement[] = [
        {
          id: 'v2.2.0-ai-improvements',
          title: '🤖 Enhanced AI Content Generation',
          description: 'Our AI models have been updated with better understanding of brand voice and tone. Experience more accurate and engaging content suggestions.',
          type: 'new_feature',
          priority: 'high',
          version: '2.2.0',
          date: new Date('2025-01-15'),
          actionText: 'Try Enhanced AI',
          actionUrl: '/content/generate',
          tags: ['AI', 'Content Generation', 'Brand Voice']
        },
        {
          id: 'v2.1.5-dashboard-analytics',
          title: '📊 New Dashboard Analytics',
          description: 'Get deeper insights into your content performance with new analytics widgets on your dashboard.',
          type: 'new_feature',
          priority: 'medium',
          version: '2.1.5',
          date: new Date('2025-01-12'),
          actionText: 'View Analytics',
          actionUrl: '/analytics',
          tags: ['Analytics', 'Dashboard', 'Insights']
        },
        {
          id: 'v2.1.3-mobile-optimization',
          title: '📱 Mobile Experience Improvements',
          description: 'Better mobile responsiveness and touch interactions across all pages.',
          type: 'improvement',
          priority: 'medium',
          version: '2.1.3',
          date: new Date('2025-01-08'),
          tags: ['Mobile', 'UX', 'Responsive']
        },
        {
          id: 'v2.1.1-security-updates',
          title: '🔒 Security & Performance Updates',
          description: 'Enhanced security measures and faster loading times.',
          type: 'improvement',
          priority: 'low',
          version: '2.1.1',
          date: new Date('2025-01-03'),
          tags: ['Security', 'Performance']
        },
        {
          id: 'holiday-update-2024',
          title: '🎉 Happy New Year from ContentAutoPilot!',
          description: 'Thank you for using ContentAutoPilot in 2024. We have exciting updates planned for 2025!',
          type: 'announcement',
          priority: 'low',
          date: new Date('2025-01-01'),
          tags: ['Announcement', 'New Year']
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAnnouncements(mockAnnouncements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load announcements');
    } finally {
      setIsLoading(false);
    }
  };

  const dismissAnnouncement = useCallback((id: string) => {
    const newDismissed = new Set(dismissedIds);
    newDismissed.add(id);
    setDismissedIds(newDismissed);
    persistState(newDismissed, readIds);
  }, [dismissedIds, readIds]);

  const markAsRead = useCallback((id: string) => {
    const newRead = new Set(readIds);
    newRead.add(id);
    setReadIds(newRead);
    persistState(dismissedIds, newRead);
  }, [readIds, dismissedIds]);

  const markAllAsRead = useCallback(() => {
    const allIds = new Set(announcements.map(a => a.id));
    setReadIds(allIds);
    persistState(dismissedIds, allIds);
  }, [announcements, dismissedIds]);

  const refreshAnnouncements = useCallback(async () => {
    await loadAnnouncements();
  }, []);

  const getAnnouncementsByType = useCallback((type: FeatureAnnouncement['type']) => {
    return announcements
      .filter(announcement => 
        announcement.type === type && 
        !dismissedIds.has(announcement.id)
      )
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [announcements, dismissedIds]);

  const getHighPriorityAnnouncements = useCallback(() => {
    return announcements
      .filter(announcement => 
        announcement.priority === 'high' && 
        !dismissedIds.has(announcement.id)
      )
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [announcements, dismissedIds]);

  // Calculate unread count
  const visibleAnnouncements = announcements.filter(a => !dismissedIds.has(a.id));
  const unreadCount = visibleAnnouncements.filter(a => !readIds.has(a.id)).length;

  return {
    announcements: visibleAnnouncements,
    unreadCount,
    isLoading,
    error,
    dismissAnnouncement,
    markAsRead,
    markAllAsRead,
    refreshAnnouncements,
    getAnnouncementsByType,
    getHighPriorityAnnouncements
  };
};