import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Button,
  Alert
} from '@mui/material';
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Mail as MailIcon
} from '@mui/icons-material';

import { TeamMembersView } from '../../components/team/TeamMembersView';
import { TeamInvitesView } from '../../components/team/TeamInvitesView';
import { InviteUserDialog } from '../../components/team/InviteUserDialog';
import { useTenant } from '../../contexts/TenantContext';

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
      id={`team-tabpanel-${index}`}
      aria-labelledby={`team-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const TeamPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  
  const { currentOrganization } = useTenant();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!currentOrganization) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="info">
          Please select an organization to manage team members.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Team Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage team members and invitations for {currentOrganization.name}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setInviteDialogOpen(true)}
          size="large"
        >
          Invite Member
        </Button>
      </Box>

      {/* Team Management Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab 
              icon={<PeopleIcon />} 
              label="Team Members" 
              iconPosition="start"
            />
            <Tab 
              icon={<MailIcon />} 
              label="Pending Invites" 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <TeamMembersView 
            organizationId={currentOrganization.id}
            onInviteUser={() => setInviteDialogOpen(true)}
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <TeamInvitesView 
            organizationId={currentOrganization.id}
            onInviteUser={() => setInviteDialogOpen(true)}
          />
        </TabPanel>
      </Paper>

      {/* Invite User Dialog */}
      <InviteUserDialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        organizationId={currentOrganization.id}
      />
    </Container>
  );
};