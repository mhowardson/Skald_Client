import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Divider,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Payment as PaymentIcon,
  Group as TeamIcon,
  Palette as BrandingIcon,
  Api as ApiIcon,
  Storage as StorageIcon,
  Analytics as AnalyticsIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { useTenant } from '../../contexts/TenantContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const OrganizationSettingsPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [editOrganizationOpen, setEditOrganizationOpen] = useState(false);
  const [inviteTeamMemberOpen, setInviteTeamMemberOpen] = useState(false);
  const { currentOrganization } = useTenant();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  if (!currentOrganization) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Please select an organization to view settings.
        </Alert>
      </Container>
    );
  }

  const tabs = [
    { label: 'General', icon: <SettingsIcon /> },
    { label: 'Subscription', icon: <PaymentIcon /> },
    { label: 'Team', icon: <TeamIcon /> },
    { label: 'Branding', icon: <BrandingIcon /> },
    { label: 'API & Integrations', icon: <ApiIcon /> },
    { label: 'Usage & Limits', icon: <StorageIcon /> }
  ];

  const renderGeneralTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Organization Details</Typography>
              <Button
                startIcon={<EditIcon />}
                onClick={() => setEditOrganizationOpen(true)}
              >
                Edit
              </Button>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Organization Name
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {currentOrganization.name}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Organization Type
              </Typography>
              <Chip 
                label={currentOrganization.type}
                color="primary"
                size="small"
                sx={{ textTransform: 'capitalize' }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Default Timezone
              </Typography>
              <Typography variant="body1">
                {'America/New_York'}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body1">
                {new Date().toLocaleDateString()}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <List dense>
              <ListItem button onClick={() => setInviteTeamMemberOpen(true)}>
                <ListItemIcon>
                  <AddIcon />
                </ListItemIcon>
                <ListItemText primary="Invite Team Member" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <AnalyticsIcon />
                </ListItemIcon>
                <ListItemText primary="View Analytics" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <ApiIcon />
                </ListItemIcon>
                <ListItemText primary="API Documentation" />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderSubscriptionTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Current Subscription
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Chip 
                label={currentOrganization.subscription?.plan || 'Creator'}
                color="primary"
                size="medium"
                sx={{ textTransform: 'capitalize' }}
              />
              <Chip 
                label={currentOrganization.subscription?.status || 'Active'}
                color={currentOrganization.subscription?.status === 'active' ? 'success' : 'warning'}
                size="small"
                sx={{ textTransform: 'capitalize' }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Billing Email
              </Typography>
              <Typography variant="body1">
                {'billing@organization.com'}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Current Period Ends
              </Typography>
              <Typography variant="body1">
                {currentOrganization.subscription?.currentPeriodEnd 
                  ? new Date(currentOrganization.subscription.currentPeriodEnd).toLocaleDateString()
                  : 'Not set'
                }
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" color="primary">
                Upgrade Plan
              </Button>
              <Button variant="outlined">
                Manage Billing
              </Button>
              <Button variant="outlined" color="error">
                Cancel Subscription
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Plan Features
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color={currentOrganization.settings?.features?.clientWorkspaces ? 'success' : 'disabled'} />
                </ListItemIcon>
                <ListItemText primary="Client Workspaces" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color={currentOrganization.settings?.features?.advancedAnalytics ? 'success' : 'disabled'} />
                </ListItemIcon>
                <ListItemText primary="Advanced Analytics" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color={currentOrganization.settings?.features?.customVoices ? 'success' : 'disabled'} />
                </ListItemIcon>
                <ListItemText primary="Custom Voices" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color={currentOrganization.settings?.features?.apiAccess ? 'success' : 'disabled'} />
                </ListItemIcon>
                <ListItemText primary="API Access" />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderTeamTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Team Members</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setInviteTeamMemberOpen(true)}
              >
                Invite Member
              </Button>
            </Box>

            <List>
              <ListItem>
                <ListItemIcon>
                  <Avatar>JD</Avatar>
                </ListItemIcon>
                <ListItemText 
                  primary="John Doe"
                  secondary="john@example.com • Owner"
                />
                <Chip label="Owner" size="small" color="primary" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Avatar>JS</Avatar>
                </ListItemIcon>
                <ListItemText 
                  primary="Jane Smith"
                  secondary="jane@example.com • Admin"
                />
                <Chip label="Admin" size="small" />
                <IconButton color="error">
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            </List>

            <Alert severity="info" sx={{ mt: 2 }}>
              You have {currentOrganization.usage?.teamMembers || 1} of {currentOrganization.limits?.teamMembers || 1} team members.
            </Alert>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderBrandingTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              White Label Settings
            </Typography>
            
            <Alert 
              severity={currentOrganization.settings?.whiteLabel?.enabled ? 'success' : 'info'}
              sx={{ mb: 3 }}
            >
              White labeling is {currentOrganization.settings?.whiteLabel?.enabled ? 'enabled' : 'disabled'} for your organization.
            </Alert>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Custom Logo
              </Typography>
              <Typography variant="body1">
                {currentOrganization.settings?.whiteLabel?.logoUrl ? 'Uploaded' : 'Not set'}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Brand Colors
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {currentOrganization.settings?.whiteLabel?.brandColors?.primary && (
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: 1,
                      bgcolor: currentOrganization.settings.whiteLabel.brandColors.primary,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  />
                )}
                {currentOrganization.settings?.whiteLabel?.brandColors?.secondary && (
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: 1,
                      bgcolor: currentOrganization.settings.whiteLabel.brandColors.secondary,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  />
                )}
              </Box>
            </Box>

            <Button variant="contained" startIcon={<BrandingIcon />}>
              Update Branding
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderApiTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              API Access
            </Typography>
            
            {currentOrganization.settings?.features?.apiAccess ? (
              <Box>
                <Alert severity="success" sx={{ mb: 3 }}>
                  API access is enabled for your organization.
                </Alert>
                
                <Typography variant="subtitle2" gutterBottom>
                  API Key
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <TextField
                    value="************************************"
                    fullWidth
                    disabled
                    size="small"
                  />
                  <Button variant="outlined">
                    Regenerate
                  </Button>
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  Rate Limits
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Content Generation: 100 requests/hour" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Voice Processing: 50 requests/hour" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Translation: 200 requests/hour" />
                  </ListItem>
                </List>
              </Box>
            ) : (
              <Box>
                <Alert severity="warning" sx={{ mb: 3 }}>
                  API access is not available on your current plan.
                </Alert>
                <Button variant="contained">
                  Upgrade to Enable API
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderUsageTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Current Usage
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Client Workspaces
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6">
                  {currentOrganization.usage?.clientWorkspaces || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  / {currentOrganization.limits?.clientWorkspaces || 1}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Content Generated This Month
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6">
                  {currentOrganization.usage?.contentGenerated || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  / {currentOrganization.limits?.contentPerMonth || 25}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Storage Used
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6">
                  {(currentOrganization.usage?.storageUsed || 0).toFixed(1)} GB
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  / {currentOrganization.limits?.storageGB || 10} GB
                </Typography>
              </Box>
            </Box>

            <Typography variant="caption" color="text.secondary">
              Usage resets on {new Date().toLocaleDateString()}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Plan Limits
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Client Workspaces"
                  secondary={`${currentOrganization.limits?.clientWorkspaces || 1} workspace${(currentOrganization.limits?.clientWorkspaces || 1) > 1 ? 's' : ''}`}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Content per Month"
                  secondary={`${currentOrganization.limits?.contentPerMonth || 25} pieces`}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Team Members"
                  secondary={`${currentOrganization.limits?.teamMembers || 1} member${(currentOrganization.limits?.teamMembers || 1) > 1 ? 's' : ''}`}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Storage"
                  secondary={`${currentOrganization.limits?.storageGB || 10} GB`}
                />
              </ListItem>
            </List>

            <Button variant="outlined" sx={{ mt: 2 }}>
              Upgrade Plan
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Organization Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your organization settings, team, and subscription
        </Typography>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="settings tabs">
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                icon={tab.icon}
                label={tab.label}
                iconPosition="start"
                id={`settings-tab-${index}`}
                aria-controls={`settings-tabpanel-${index}`}
              />
            ))}
          </Tabs>
        </Box>

        <TabPanel value={currentTab} index={0}>
          {renderGeneralTab()}
        </TabPanel>
        <TabPanel value={currentTab} index={1}>
          {renderSubscriptionTab()}
        </TabPanel>
        <TabPanel value={currentTab} index={2}>
          {renderTeamTab()}
        </TabPanel>
        <TabPanel value={currentTab} index={3}>
          {renderBrandingTab()}
        </TabPanel>
        <TabPanel value={currentTab} index={4}>
          {renderApiTab()}
        </TabPanel>
        <TabPanel value={currentTab} index={5}>
          {renderUsageTab()}
        </TabPanel>
      </Paper>

      {/* Edit Organization Dialog */}
      <Dialog open={editOrganizationOpen} onClose={() => setEditOrganizationOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Organization</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Organization Name"
            fullWidth
            variant="outlined"
            defaultValue={currentOrganization.name}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Organization Type</InputLabel>
            <Select
              value={currentOrganization.type}
              label="Organization Type"
            >
              <MenuItem value="agency">Agency</MenuItem>
              <MenuItem value="enterprise">Enterprise</MenuItem>
              <MenuItem value="freelancer">Freelancer</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Default Timezone</InputLabel>
            <Select
              value={'America/New_York'}
              label="Default Timezone"
            >
              <MenuItem value="America/New_York">Eastern Time</MenuItem>
              <MenuItem value="America/Chicago">Central Time</MenuItem>
              <MenuItem value="America/Denver">Mountain Time</MenuItem>
              <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
              <MenuItem value="UTC">UTC</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOrganizationOpen(false)}>Cancel</Button>
          <Button variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Invite Team Member Dialog */}
      <Dialog open={inviteTeamMemberOpen} onClose={() => setInviteTeamMemberOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Invite Team Member</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              defaultValue="member"
              label="Role"
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="member">Member</MenuItem>
              <MenuItem value="viewer">Viewer</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteTeamMemberOpen(false)}>Cancel</Button>
          <Button variant="contained">Send Invitation</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};