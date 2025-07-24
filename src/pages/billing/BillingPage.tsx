import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Alert,
  Chip
} from '@mui/material';
import {
  CreditCard as BillingIcon,
  Receipt as InvoiceIcon,
  TrendingUp as UsageIcon,
  Settings as SettingsIcon,
  Upgrade as UpgradeIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

import { SubscriptionOverview } from '../../components/billing/SubscriptionOverview';
import { useGetSubscriptionQuery } from '../../store/api/billingApi';
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
      id={`billing-tabpanel-${index}`}
      aria-labelledby={`billing-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const BillingPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  
  const { currentOrganization } = useTenant();
  const { data: subscriptionData, isLoading } = useGetSubscriptionQuery();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!currentOrganization) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="info">
          Please select an organization to manage billing.
        </Alert>
      </Container>
    );
  }

  const subscription = subscriptionData?.subscription;
  const isOnTrial = subscription?.status === 'trialing';
  const isActive = subscription?.status === 'active';
  const hasSubscription = Boolean(subscription);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Billing & Subscription
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your subscription, billing, and usage for {currentOrganization.name}
          </Typography>
        </Box>

        {hasSubscription && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {subscription && (
              <Chip
                label={`${subscription.plan.displayName} Plan`}
                color={isActive ? 'success' : isOnTrial ? 'warning' : 'default'}
                variant="outlined"
              />
            )}
            {isOnTrial && subscription?.trialEnd && (
              <Chip
                label={`Trial ends ${format(new Date(subscription.trialEnd), 'MMM d')}`}
                color="warning"
                variant="outlined"
              />
            )}
          </Box>
        )}
      </Box>

      {/* Subscription Overview */}
      {!isLoading && (
        <Box sx={{ mb: 4 }}>
          <SubscriptionOverview subscription={subscription} />
        </Box>
      )}

      {/* Billing Management Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            {!hasSubscription && (
              <Tab 
                icon={<UpgradeIcon />} 
                label="Choose Plan" 
                iconPosition="start"
              />
            )}
            <Tab 
              icon={<BillingIcon />} 
              label="Overview" 
              iconPosition="start"
            />
            <Tab 
              icon={<UsageIcon />} 
              label="Usage" 
              iconPosition="start"
            />
            <Tab 
              icon={<InvoiceIcon />} 
              label="Invoices" 
              iconPosition="start"
            />
            <Tab 
              icon={<SettingsIcon />} 
              label="Payment Methods" 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {!hasSubscription && (
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Choose Your Plan
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Plan selector coming soon...
              </Typography>
            </Box>
          </TabPanel>
        )}
        
        <TabPanel value={tabValue} index={hasSubscription ? 0 : 1}>
          <SubscriptionOverview subscription={subscription} />
        </TabPanel>
        
        <TabPanel value={tabValue} index={hasSubscription ? 1 : 2}>
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Usage Metrics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Usage metrics view coming soon...
            </Typography>
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={hasSubscription ? 2 : 3}>
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Invoices & Billing History
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Invoices view coming soon...
            </Typography>
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={hasSubscription ? 3 : 4}>
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Payment Methods
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Payment methods management coming soon...
            </Typography>
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
};