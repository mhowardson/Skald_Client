/**
 * Welcome Modal Component
 * 
 * First-time user welcome experience with tour opt-in,
 * quick setup options, and value proposition.
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  IconButton,
  Switch,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  styled
} from '@mui/material';
import {
  Close,
  AutoAwesome,
  TrendingUp,
  Group,
  Speed,
  PlayArrow,
  Check,
  ArrowForward
} from '@mui/icons-material';
import { UserJourney, OnboardingPreferences } from '../../types/onboarding.types';

interface WelcomeModalProps {
  open: boolean;
  userJourney?: UserJourney;
  onClose: () => void;
  onStartTour: () => void;
  onSkipTour: () => void;
  onUpdatePreferences: (preferences: Partial<OnboardingPreferences>) => void;
}

const WelcomeDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    maxWidth: 800,
    width: '90vw'
  }
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(2, 0),
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: theme.palette.primary.contrastText,
  borderRadius: `${theme.spacing(2)} ${theme.spacing(2)} 0 0`,
  margin: theme.spacing(-3, -3, 2, -3)
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  cursor: 'pointer',
  border: `2px solid transparent`,
  
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    borderColor: theme.palette.primary.main
  }
}));

const StepIcon = styled(Box)<{ active: boolean }>(({ theme, active }) => ({
  width: 32,
  height: 32,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: active ? theme.palette.primary.main : theme.palette.grey[300],
  color: active ? theme.palette.primary.contrastText : theme.palette.text.secondary,
  fontSize: '0.875rem',
  fontWeight: 'bold'
}));

const features = [
  {
    icon: <AutoAwesome />,
    title: 'AI Content Generation',
    description: 'Create engaging social media content with Claude AI',
    time: '2 minutes',
    benefit: 'Save 90% of content creation time'
  },
  {
    icon: <Speed />,
    title: 'Multi-Platform Optimization',
    description: 'Automatically optimize for Instagram, Twitter, LinkedIn',
    time: '1 minute',
    benefit: 'Perfect content for every platform'
  },
  {
    icon: <Group />,
    title: 'Team Collaboration',
    description: 'Work together with approval workflows',
    time: '3 minutes',
    benefit: 'Streamlined team processes'
  },
  {
    icon: <TrendingUp />,
    title: 'Analytics & Insights',
    description: 'Track performance and optimize strategy',
    time: '2 minutes',
    benefit: 'Data-driven content decisions'
  }
];

const steps = [
  'Create your first workspace',
  'Generate AI content',
  'Discover key features',
  'Set up your team'
];

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  open,
  userJourney,
  onClose,
  onStartTour,
  onSkipTour,
  onUpdatePreferences
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<Partial<OnboardingPreferences>>({
    tourEnabled: true,
    tooltipsEnabled: true,
    emailReminders: true
  });

  const handlePreferenceChange = (key: keyof OnboardingPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    onUpdatePreferences(newPreferences);
  };

  const handleStartTour = () => {
    onStartTour();
    onClose();
  };

  const handleSkipToApp = () => {
    onSkipTour();
    onClose();
  };

  const organizationName = userJourney?.organizationId ? 'your organization' : 'ContentAutoPilot';

  return (
    <WelcomeDialog open={open} maxWidth="md" fullWidth>
      <DialogTitle sx={{ p: 0, position: 'relative' }}>
        <HeaderSection>
          <Box sx={{ position: 'relative', p: 3 }}>
            <IconButton
              sx={{ 
                position: 'absolute', 
                right: 8, 
                top: 8,
                color: 'inherit'
              }}
              onClick={onClose}
            >
              <Close />
            </IconButton>
            
            <AutoAwesome sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Welcome to {organizationName}!
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Let's get you set up for success with AI-powered content creation
            </Typography>
          </Box>
        </HeaderSection>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Progress Steps */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom align="center">
            Your Journey to Content Success
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {steps.map((step, index) => (
                <React.Fragment key={step}>
                  <Box sx={{ textAlign: 'center' }}>
                    <StepIcon active={index <= currentStep}>
                      {index < currentStep ? <Check fontSize="small" /> : index + 1}
                    </StepIcon>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block', 
                        mt: 1, 
                        maxWidth: 80,
                        fontSize: '0.75rem'
                      }}
                    >
                      {step}
                    </Typography>
                  </Box>
                  {index < steps.length - 1 && (
                    <ArrowForward sx={{ color: 'text.disabled', mx: 1 }} />
                  )}
                </React.Fragment>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Features Overview */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            What you'll master today
          </Typography>
          <Grid container spacing={2}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} key={feature.title}>
                <FeatureCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ 
                        mr: 2, 
                        color: 'primary.main',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        {feature.icon}
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {feature.title}
                        </Typography>
                        <Chip 
                          label={feature.time} 
                          size="small" 
                          variant="outlined"
                          color="primary"
                        />
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {feature.description}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="success.main"
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        fontWeight: 'medium'
                      }}
                    >
                      <Check fontSize="small" sx={{ mr: 0.5 }} />
                      {feature.benefit}
                    </Typography>
                  </CardContent>
                </FeatureCard>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Preferences */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Customize your experience
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.tourEnabled}
                    onChange={(e) => handlePreferenceChange('tourEnabled', e.target.checked)}
                    color="primary"
                  />
                }
                label="Interactive tours"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.tooltipsEnabled}
                    onChange={(e) => handlePreferenceChange('tooltipsEnabled', e.target.checked)}
                    color="primary"
                  />
                }
                label="Helpful tooltips"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.emailReminders}
                    onChange={(e) => handlePreferenceChange('emailReminders', e.target.checked)}
                    color="primary"
                  />
                }
                label="Email reminders"
              />
            </Grid>
          </Grid>
        </Box>

        {/* Value Proposition */}
        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.main', color: 'white', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Join 10,000+ creators who save 15+ hours per week
          </Typography>
          <Typography variant="body2">
            Our guided tour takes just 8 minutes and shows you everything you need to become a content creation pro.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
        <Button
          onClick={handleSkipToApp}
          color="inherit"
          size="large"
        >
          Skip for now
        </Button>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => {
              // Quick setup option
              setCurrentStep(1);
              handleSkipToApp();
            }}
            size="large"
          >
            Quick Setup
          </Button>
          <Button
            variant="contained"
            onClick={handleStartTour}
            startIcon={<PlayArrow />}
            size="large"
            sx={{ minWidth: 160 }}
          >
            Start Tour (8min)
          </Button>
        </Box>
      </DialogActions>
    </WelcomeDialog>
  );
};