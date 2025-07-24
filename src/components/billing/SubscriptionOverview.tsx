import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Upgrade as UpgradeIcon,
  Settings as SettingsIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';

import {
  useCreatePortalSessionMutation,
  useCancelSubscriptionMutation,
  useResumeSubscriptionMutation,
  type Subscription
} from '../../store/api/billingApi';

interface SubscriptionOverviewProps {
  subscription?: Subscription | null;
  detailed?: boolean;
}

export const SubscriptionOverview: React.FC<SubscriptionOverviewProps> = ({
  subscription,
}) => {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);

  const [createPortalSession, { isLoading: isCreatingPortal }] = useCreatePortalSessionMutation();
  const [cancelSubscription, { isLoading: isCanceling }] = useCancelSubscriptionMutation();
  const [resumeSubscription, { isLoading: isResuming }] = useResumeSubscriptionMutation();

  const handleManageBilling = async () => {
    try {
      const response = await createPortalSession({
        returnUrl: window.location.href
      }).unwrap();
      
      window.location.href = response.portalUrl;
    } catch (error) {
      console.error('Failed to create portal session:', error);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription({ cancelAtPeriodEnd: true }).unwrap();
      setCancelDialogOpen(false);
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    }
  };

  const handleResumeSubscription = async () => {
    try {
      await resumeSubscription().unwrap();
      setResumeDialogOpen(false);
    } catch (error) {
      console.error('Failed to resume subscription:', error);
    }
  };

  if (!subscription) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" gutterBottom>
            No Active Subscription
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Choose a plan to get started with ContentAutoPilot
          </Typography>
          <Button variant="contained" size="large" startIcon={<UpgradeIcon />}>
            Choose Plan
          </Button>
        </CardContent>
      </Card>
    );
  }

  const statusColors = {
    active: 'success',
    trialing: 'info',
    past_due: 'warning',
    canceled: 'error',
    unpaid: 'error',
    incomplete: 'warning'
  } as const;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckIcon color="success" />;
      case 'trialing':
        return <ScheduleIcon color="info" />;
      case 'canceled':
        return <CancelIcon color="error" />;
      case 'past_due':
      case 'unpaid':
        return <WarningIcon color="warning" />;
      default:
        return <WarningIcon color="action" />;
    }
  };

  const isActive = subscription.status === 'active';
  const isTrialing = subscription.status === 'trialing';
  const isCanceled = subscription.cancelAtPeriodEnd;

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Main Subscription Info */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {subscription.plan.displayName} Plan
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                      icon={getStatusIcon(subscription.status)}
                      label={subscription.status.replace('_', ' ').toUpperCase()}
                      color={statusColors[subscription.status]}
                      variant="outlined"
                    />
                    <Typography variant="body2" color="text.secondary">
                      ${subscription.plan.price}/{subscription.plan.interval}
                    </Typography>
                  </Box>
                </Box>

                <Button
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  onClick={handleManageBilling}
                  disabled={isCreatingPortal}
                >
                  {isCreatingPortal ? 'Loading...' : 'Manage Billing'}
                </Button>
              </Box>

              {isCanceled && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Your subscription will be canceled at the end of the current billing period on{' '}
                  {format(new Date(subscription.currentPeriodEnd), 'MMMM d, yyyy')}.
                  <Button
                    size="small"
                    onClick={() => setResumeDialogOpen(true)}
                    sx={{ ml: 1 }}
                  >
                    Resume Subscription
                  </Button>
                </Alert>
              )}

              {isTrialing && subscription.trialEnd && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Your trial ends on {format(new Date(subscription.trialEnd), 'MMMM d, yyyy')} (
                  {formatDistanceToNow(new Date(subscription.trialEnd), { addSuffix: true })}).
                  Add a payment method to continue after your trial.
                </Alert>
              )}

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Current Period
                  </Typography>
                  <Typography variant="body1">
                    {format(new Date(subscription.currentPeriodStart), 'MMM d')} -{' '}
                    {format(new Date(subscription.currentPeriodEnd), 'MMM d, yyyy')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Next Billing Date
                  </Typography>
                  <Typography variant="body1">
                    {format(new Date(subscription.currentPeriodEnd), 'MMMM d, yyyy')}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Plan Features */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Plan Features
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${subscription.plan.features.workspaces} Workspaces`}
                    secondary="Client accounts"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${subscription.plan.features.teamMembers} Team Members`}
                    secondary="Collaborate with your team"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${subscription.plan.features.socialAccounts} Social Accounts`}
                    secondary="Connected platforms"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${subscription.plan.features.monthlyPosts} Posts/Month`}
                    secondary="Scheduled content"
                  />
                </ListItem>
                {subscription.plan.features.analytics && (
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Advanced Analytics" />
                  </ListItem>
                )}
                {subscription.plan.features.aiFeatures && (
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="AI Content Generation" />
                  </ListItem>
                )}
                {subscription.plan.features.whiteLabel && (
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="White Label Branding" />
                  </ListItem>
                )}
                {subscription.plan.features.prioritySupport && (
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Priority Support" />
                  </ListItem>
                )}
              </List>

              {!isCanceled && isActive && (
                <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Button
                    variant="text"
                    color="error"
                    size="small"
                    onClick={() => setCancelDialogOpen(true)}
                  >
                    Cancel Subscription
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Cancel Subscription Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cancel Subscription</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to cancel your subscription?
          </Alert>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Your subscription will remain active until {format(new Date(subscription.currentPeriodEnd), 'MMMM d, yyyy')}.
            After that, you'll lose access to premium features but your data will be preserved.
          </Typography>
          <Typography variant="body2">
            You can reactivate your subscription at any time before the end of your current billing period.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>
            Keep Subscription
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancelSubscription}
            disabled={isCanceling}
          >
            {isCanceling ? 'Canceling...' : 'Cancel Subscription'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Resume Subscription Dialog */}
      <Dialog open={resumeDialogOpen} onClose={() => setResumeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Resume Subscription</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Resume your {subscription.plan.displayName} subscription?
          </Alert>
          <Typography variant="body2">
            Your subscription will continue as normal and you'll be billed ${subscription.plan.price} on{' '}
            {format(new Date(subscription.currentPeriodEnd), 'MMMM d, yyyy')}.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResumeDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleResumeSubscription}
            disabled={isResuming}
          >
            {isResuming ? 'Resuming...' : 'Resume Subscription'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};