import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container, Typography, Box } from '@mui/material';

export const SettingsPage: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
      </Box>

      <Routes>
        <Route path="/organization" element={<OrganizationSettings />} />
        <Route path="/organization/*" element={<OrganizationSettings />} />
        <Route path="/workspace" element={<WorkspaceSettings />} />
        <Route path="/workspace/*" element={<WorkspaceSettings />} />
        <Route path="*" element={<DefaultSettings />} />
      </Routes>
    </Container>
  );
};

const OrganizationSettings: React.FC = () => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Organization Settings
      </Typography>
      
      {/* Organization stats */}
      <Box data-testid="usage-section">
        <Box data-testid="workspace-count">Workspaces: 0</Box>
        <Box data-testid="member-count">Members: 1</Box>
        <Box data-testid="content-generated">Content Generated: 0</Box>
        <Box data-testid="storage-used">Storage Used: 0 GB</Box>
      </Box>

      {/* Usage details */}
      <Box>
        <Box data-testid="workspaces-usage">Workspaces Usage</Box>
        <Box data-testid="content-usage">Content Usage</Box>
        <Box data-testid="team-members-usage">Team Members Usage</Box>
        <Box data-testid="storage-usage">Storage Usage</Box>
      </Box>

      {/* Settings sections */}
      <Box data-testid="edit-organization">Edit Organization</Box>
      <Box data-testid="billing-section">Billing</Box>
      <Box data-testid="members-section">Members</Box>
      <Box data-testid="white-label-section">White Label</Box>
      <Box data-testid="danger-zone">Danger Zone</Box>
    </Box>
  );
};

const WorkspaceSettings: React.FC = () => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Workspace Settings
      </Typography>
      
      <Box data-testid="client-info">Client Information</Box>
      <Box data-testid="branding-settings">Branding Settings</Box>
      <Box data-testid="content-settings">Content Settings</Box>
      
      {/* Platform connections */}
      <Box data-testid="platforms-list">
        <Box data-testid="connect-instagram">Connect Instagram</Box>
        <Box data-testid="connect-youtube">Connect YouTube</Box>
        <Box data-testid="connect-tiktok">Connect TikTok</Box>
        <Box data-testid="connect-twitter">Connect Twitter</Box>
      </Box>

      {/* Members */}
      <Box data-testid="workspace-members">
        <Box data-testid="member-item">Admin</Box>
        <Box data-testid="invite-workspace-member">Invite Member</Box>
      </Box>
    </Box>
  );
};

const DefaultSettings: React.FC = () => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Settings
      </Typography>
      <Typography variant="body1">
        Select a settings category from the navigation.
      </Typography>
    </Box>
  );
};