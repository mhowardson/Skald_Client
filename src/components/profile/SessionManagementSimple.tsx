import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Chip
} from '@mui/material';
import {
  Computer as DesktopIcon,
  PhoneAndroid as MobileIcon,
  Tablet as TabletIcon
} from '@mui/icons-material';

interface SessionManagementSimpleProps {
  user?: any;
  isLoading: boolean;
}

export const SessionManagementSimple: React.FC<SessionManagementSimpleProps> = ({
  isLoading
}) => {
  // Mock data for demo
  const mockSessions = [
    {
      id: '1',
      deviceType: 'desktop',
      browser: 'Chrome',
      location: 'San Francisco, CA',
      lastActiveAt: new Date().toISOString(),
      current: true
    },
    {
      id: '2', 
      deviceType: 'mobile',
      browser: 'Safari',
      location: 'Los Angeles, CA',
      lastActiveAt: new Date(Date.now() - 3600000).toISOString(),
      current: false
    }
  ];

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return <MobileIcon />;
      case 'tablet': return <TabletIcon />;
      default: return <DesktopIcon />;
    }
  };

  const formatLastActive = (timestamp: string) => {
    const now = new Date();
    const lastActive = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Active now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Session Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Loading session information...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Active Sessions
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Monitor and manage your active login sessions across all devices.
      </Typography>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <List disablePadding>
            {mockSessions.map((session) => (
              <ListItem key={session.id} sx={{ py: 2 }}>
                <ListItemIcon>
                  {getDeviceIcon(session.deviceType)}
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1">
                        {session.browser} on {session.deviceType}
                      </Typography>
                      {session.current && (
                        <Chip 
                          label="Current Session" 
                          size="small" 
                          color="primary"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {session.location} • {formatLastActive(session.lastActiveAt)}
                      </Typography>
                    </Box>
                  }
                />
                
                {!session.current && (
                  <Button
                    size="small"
                    color="error"
                    onClick={() => console.log('Terminate session:', session.id)}
                  >
                    Terminate
                  </Button>
                )}
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Box sx={{ mt: 3 }}>
        <Button
          variant="outlined"
          color="error"
          onClick={() => console.log('Terminate all other sessions')}
        >
          Terminate All Other Sessions
        </Button>
      </Box>
    </Box>
  );
};