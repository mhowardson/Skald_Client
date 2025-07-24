import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Alert
} from '@mui/material';
import {
  Person as ProfileIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  History as ActivityIcon,
  Devices as DevicesIcon
} from '@mui/icons-material';

import { ProfileOverview } from '../../components/profile/ProfileOverview';
import { ProfileSettings } from '../../components/profile/ProfileSettings';
import { SecuritySettings } from '../../components/profile/SecuritySettings';
import { ActivityLog } from '../../components/profile/ActivityLog';
import { SessionManagementSimple } from '../../components/profile/SessionManagementSimple';
import { useGetUserProfileQuery } from '../../store/api/userProfileApi';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const ProfilePage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  
  const { data: profileData, isLoading, error } = useGetUserProfileQuery();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">
          Failed to load user profile. Please try again.
        </Alert>
      </Container>
    );
  }

  const user = profileData?.user;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Account Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your profile, preferences, and security settings
          </Typography>
        </Box>
      </Box>

      {/* Profile Management Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab 
              icon={<ProfileIcon />} 
              label="Profile" 
              iconPosition="start"
            />
            <Tab 
              icon={<SettingsIcon />} 
              label="Preferences" 
              iconPosition="start"
            />
            <Tab 
              icon={<SecurityIcon />} 
              label="Security" 
              iconPosition="start"
            />
            <Tab 
              icon={<ActivityIcon />} 
              label="Activity" 
              iconPosition="start"
            />
            <Tab 
              icon={<DevicesIcon />} 
              label="Sessions" 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <ProfileOverview user={user} isLoading={isLoading} />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <ProfileSettings user={user} isLoading={isLoading} />
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <SecuritySettings user={user} isLoading={isLoading} />
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <ActivityLog />
        </TabPanel>
        
        <TabPanel value={tabValue} index={4}>
          <SessionManagementSimple user={user} isLoading={isLoading} />
        </TabPanel>
      </Paper>
    </Container>
  );
};