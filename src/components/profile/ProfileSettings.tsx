import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  Button,
  Divider,
  Alert,
  Grid,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as ThemeIcon,
} from '@mui/icons-material';

import {
  type UserProfile,
} from '../../store/api/userProfileApi';

interface ProfileSettingsProps {
  user?: UserProfile;
  isLoading: boolean;
}

interface UserPreferences {
  notifications: {
    email: Record<string, boolean>;
    push: Record<string, boolean>;
    inApp: Record<string, boolean>;
  };
  ui: {
    theme: string;
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: string;
  };
  privacy: {
    profileVisibility: string;
    activityVisibility: string;
    allowAnalytics: boolean;
    allowMarketing: boolean;
  };
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  isLoading
}) => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    notifications: {
      email: {
        contentPublished: true,
        contentScheduled: true,
        contentFailed: true,
        teamInvitations: true,
        billingUpdates: true,
        securityAlerts: true,
        weeklyReports: false,
        monthlyReports: false
      },
      push: {
        contentPublished: false,
        contentScheduled: false,
        contentFailed: true,
        teamInvitations: true,
        billingUpdates: false,
        securityAlerts: true
      },
      inApp: {
        contentPublished: true,
        contentScheduled: true,
        contentFailed: true,
        teamInvitations: true,
        comments: true,
        mentions: true
      }
    },
    ui: {
      theme: 'system',
      language: 'en',
      timezone: 'America/New_York',
      dateFormat: 'MM/dd/yyyy',
      timeFormat: '12h'
    },
    privacy: {
      profileVisibility: 'organization',
      activityVisibility: 'team',
      allowAnalytics: true,
      allowMarketing: false
    }
  });

  const isUpdating = false;

  const handleSave = async () => {
    try {
      // Mock for demo - in real app would call API
      console.log('Updating preferences:', preferences);
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  const handleNotificationChange = (category: keyof UserPreferences['notifications'], key: string, value: boolean) => {
    setPreferences((prev: UserPreferences) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [category]: {
          ...prev.notifications[category],
          [key]: value
        }
      }
    }));
  };

  const handleUIChange = (key: keyof UserPreferences['ui'], value: any) => {
    setPreferences((prev: UserPreferences) => ({
      ...prev,
      ui: {
        ...prev.ui,
        [key]: value
      }
    }));
  };

  const handlePrivacyChange = (key: keyof UserPreferences['privacy'], value: any) => {
    setPreferences((prev: UserPreferences) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }));
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Profile Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Loading preferences...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Profile Preferences
      </Typography>
      
      <Grid container spacing={3}>
        {/* Notifications */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <NotificationsIcon color="primary" />
                <Typography variant="h6">Notification Preferences</Typography>
              </Box>
              
              {/* Email Notifications */}
              <Typography variant="subtitle2" gutterBottom>
                Email Notifications
              </Typography>
              <FormGroup sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.notifications.email.contentPublished}
                      onChange={(e) => handleNotificationChange('email', 'contentPublished', e.target.checked)}
                    />
                  }
                  label="Content published successfully"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.notifications.email.contentFailed}
                      onChange={(e) => handleNotificationChange('email', 'contentFailed', e.target.checked)}
                    />
                  }
                  label="Content publishing failed"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.notifications.email.teamInvitations}
                      onChange={(e) => handleNotificationChange('email', 'teamInvitations', e.target.checked)}
                    />
                  }
                  label="Team invitations and updates"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.notifications.email.billingUpdates}
                      onChange={(e) => handleNotificationChange('email', 'billingUpdates', e.target.checked)}
                    />
                  }
                  label="Billing and subscription updates"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.notifications.email.weeklyReports}
                      onChange={(e) => handleNotificationChange('email', 'weeklyReports', e.target.checked)}
                    />
                  }
                  label="Weekly performance reports"
                />
              </FormGroup>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Push Notifications */}
              <Typography variant="subtitle2" gutterBottom>
                Push Notifications
              </Typography>
              <FormGroup sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.notifications.push.contentFailed}
                      onChange={(e) => handleNotificationChange('push', 'contentFailed', e.target.checked)}
                    />
                  }
                  label="Content publishing failures"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.notifications.push.teamInvitations}
                      onChange={(e) => handleNotificationChange('push', 'teamInvitations', e.target.checked)}
                    />
                  }
                  label="Team invitations"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.notifications.push.securityAlerts}
                      onChange={(e) => handleNotificationChange('push', 'securityAlerts', e.target.checked)}
                    />
                  }
                  label="Security alerts"
                />
              </FormGroup>
            </CardContent>
          </Card>
        </Grid>

        {/* UI Preferences */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ThemeIcon color="primary" />
                <Typography variant="h6">Interface</Typography>
              </Box>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <FormLabel>Theme</FormLabel>
                <Select
                  value={preferences.ui.theme}
                  onChange={(e) => handleUIChange('theme', e.target.value)}
                  size="small"
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="system">System</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <FormLabel>Language</FormLabel>
                <Select
                  value={preferences.ui.language}
                  onChange={(e) => handleUIChange('language', e.target.value)}
                  size="small"
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                  <MenuItem value="de">German</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <FormLabel>Date Format</FormLabel>
                <Select
                  value={preferences.ui.dateFormat}
                  onChange={(e) => handleUIChange('dateFormat', e.target.value)}
                  size="small"
                >
                  <MenuItem value="MM/dd/yyyy">MM/dd/yyyy</MenuItem>
                  <MenuItem value="dd/MM/yyyy">dd/MM/yyyy</MenuItem>
                  <MenuItem value="yyyy-MM-dd">yyyy-MM-dd</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <FormLabel>Time Format</FormLabel>
                <Select
                  value={preferences.ui.timeFormat}
                  onChange={(e) => handleUIChange('timeFormat', e.target.value)}
                  size="small"
                >
                  <MenuItem value="12h">12 hour</MenuItem>
                  <MenuItem value="24h">24 hour</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* Privacy Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SecurityIcon color="primary" />
                <Typography variant="h6">Privacy</Typography>
              </Box>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <FormLabel>Profile Visibility</FormLabel>
                <Select
                  value={preferences.privacy.profileVisibility}
                  onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                  size="small"
                >
                  <MenuItem value="public">Public</MenuItem>
                  <MenuItem value="organization">Organization only</MenuItem>
                  <MenuItem value="team">Team only</MenuItem>
                  <MenuItem value="private">Private</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <FormLabel>Activity Visibility</FormLabel>
                <Select
                  value={preferences.privacy.activityVisibility}
                  onChange={(e) => handlePrivacyChange('activityVisibility', e.target.value)}
                  size="small"
                >
                  <MenuItem value="public">Public</MenuItem>
                  <MenuItem value="organization">Organization only</MenuItem>
                  <MenuItem value="team">Team only</MenuItem>
                  <MenuItem value="private">Private</MenuItem>
                </Select>
              </FormControl>
              
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.privacy.allowAnalytics}
                      onChange={(e) => handlePrivacyChange('allowAnalytics', e.target.checked)}
                    />
                  }
                  label="Allow usage analytics"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.privacy.allowMarketing}
                      onChange={(e) => handlePrivacyChange('allowMarketing', e.target.checked)}
                    />
                  }
                  label="Allow marketing communications"
                />
              </FormGroup>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Save Button */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isUpdating}
        >
          {isUpdating ? 'Saving...' : 'Save Preferences'}
        </Button>
      </Box>
      
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          Your preferences are automatically synced across all your devices. Changes may take a few moments to apply.
        </Typography>
      </Alert>
    </Box>
  );
};