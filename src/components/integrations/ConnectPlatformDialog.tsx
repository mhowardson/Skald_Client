import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Link as LinkIcon,
  Security as SecurityIcon,
  CheckCircle as CheckIcon,
  Launch as LaunchIcon
} from '@mui/icons-material';

import {
  useGetOAuthUrlMutation,
  useConnectPlatformMutation
} from '../../store/api/socialPlatformsApi';

interface ConnectPlatformDialogProps {
  open: boolean;
  onClose: () => void;
  preselectedPlatform?: string;
}

const platformConfig = {
  linkedin: {
    name: 'LinkedIn',
    color: '#0077B5',
    icon: '💼',
    description: 'Professional networking platform',
    permissions: [
      'Read basic profile information',
      'Publish posts to your feed', 
      'Access follower statistics',
      'Read engagement metrics'
    ]
  },
  twitter: {
    name: 'Twitter',
    color: '#1DA1F2',
    icon: '🐦',
    description: 'Real-time microblogging platform',
    permissions: [
      'Read and write tweets',
      'Access your timeline',
      'View follower information',
      'Read tweet analytics'
    ]
  },
  facebook: {
    name: 'Facebook',
    color: '#1877F2',
    icon: '📘',
    description: 'Social networking platform',
    permissions: [
      'Manage your pages',
      'Publish posts and media',
      'Read page insights',
      'Access basic profile info'
    ]
  },
  instagram: {
    name: 'Instagram',
    color: '#E4405F',
    icon: '📷',
    description: 'Visual content sharing platform',
    permissions: [
      'Publish photos and videos',
      'Access your business account',
      'Read follower insights',
      'Manage Instagram stories'
    ]
  },
  youtube: {
    name: 'YouTube',
    color: '#FF0000',
    icon: '📺',
    description: 'Video sharing and streaming platform',
    permissions: [
      'Upload and manage videos',
      'Access channel analytics',
      'Manage playlists',
      'Read subscriber information'
    ]
  },
  tiktok: {
    name: 'TikTok',
    color: '#000000',
    icon: '🎵',
    description: 'Short-form video platform',
    permissions: [
      'Upload short videos',
      'Access basic profile info',
      'Read video analytics',
      'Manage video details'
    ]
  }
};

const steps = ['Select Platform', 'Authorize Access', 'Complete Setup'];

export const ConnectPlatformDialog: React.FC<ConnectPlatformDialogProps> = ({
  open,
  onClose,
  preselectedPlatform
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedPlatform, setSelectedPlatform] = useState<string>(preselectedPlatform || '');
  const [authWindow, setAuthWindow] = useState<Window | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const [getOAuthUrl, { isLoading: isGettingAuthUrl }] = useGetOAuthUrlMutation();
  const [connectPlatform, { isLoading: isConnectingPlatform }] = useConnectPlatformMutation();

  useEffect(() => {
    if (preselectedPlatform) {
      setSelectedPlatform(preselectedPlatform);
      if (preselectedPlatform) {
        setActiveStep(1);
      }
    }
  }, [preselectedPlatform]);

  useEffect(() => {
    // Listen for OAuth callback
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'OAUTH_SUCCESS') {
        const { code, state } = event.data;
        
        try {
          setIsConnecting(true);
          await connectPlatform({
            platform: selectedPlatform as any,
            code,
            state
          }).unwrap();
          
          setActiveStep(2);
          if (authWindow) {
            authWindow.close();
          }
        } catch (error) {
          console.error('Failed to connect platform:', error);
        } finally {
          setIsConnecting(false);
        }
      } else if (event.data.type === 'OAUTH_ERROR') {
        console.error('OAuth error:', event.data.error);
        if (authWindow) {
          authWindow.close();
        }
        setIsConnecting(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [selectedPlatform, authWindow, connectPlatform]);

  const handlePlatformSelect = (platform: string) => {
    setSelectedPlatform(platform);
    setActiveStep(1);
  };

  const handleAuthorize = async () => {
    try {
      const response = await getOAuthUrl(selectedPlatform).unwrap();
      
      // Open OAuth popup
      const popup = window.open(
        response.authUrl,
        'oauth',
        'width=600,height=700,left=' + 
        (window.screenX + (window.outerWidth - 600) / 2) + 
        ',top=' + 
        (window.screenY + (window.outerHeight - 700) / 2)
      );
      
      setAuthWindow(popup);
      
      // Monitor popup
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          setIsConnecting(false);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Failed to get OAuth URL:', error);
    }
  };

  const handleClose = () => {
    if (authWindow) {
      authWindow.close();
    }
    setActiveStep(0);
    setSelectedPlatform('');
    setIsConnecting(false);
    onClose();
  };

  const handleComplete = () => {
    handleClose();
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {Object.entries(platformConfig).map(([platform, config]) => (
              <Grid item xs={12} sm={6} key={platform}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedPlatform === platform ? 2 : 1,
                    borderColor: selectedPlatform === platform ? config.color : 'divider',
                    '&:hover': { borderColor: config.color }
                  }}
                  onClick={() => handlePlatformSelect(platform)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Typography variant="h4">{config.icon}</Typography>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {config.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {config.description}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        );

      case 1:
        const platform = platformConfig[selectedPlatform as keyof typeof platformConfig];
        return (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Typography variant="h4">{platform?.icon}</Typography>
              <Typography variant="h6" fontWeight="bold">
                Connecting to {platform?.name}
              </Typography>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                You'll be redirected to {platform?.name} to authorize ContentAutoPilot. 
                Make sure to grant all necessary permissions for full functionality.
              </Typography>
            </Alert>

            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SecurityIcon fontSize="small" />
              Permissions Required
            </Typography>

            <List dense>
              {platform?.permissions.map((permission) => (
                <ListItem key={permission} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={permission}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" color="text.secondary">
              Your data is secure and encrypted. We only access what's necessary to provide our services.
            </Typography>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Successfully Connected!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your {platformConfig[selectedPlatform as keyof typeof platformConfig]?.name} account 
              has been connected and is ready to use.
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: 500 }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinkIcon color="primary" />
          <Typography variant="h5" fontWeight="bold">
            Connect Social Media Platform
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Connect your social media accounts to start publishing content
        </Typography>
      </DialogTitle>
      
      <DialogContent dividers>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {(isConnecting || isConnectingPlatform) && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ ml: 2 }}>
              {isConnecting ? 'Connecting...' : 'Setting up connection...'}
            </Typography>
          </Box>
        )}

        {!isConnecting && !isConnectingPlatform && renderStepContent()}
      </DialogContent>

      <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
        <Button 
          onClick={handleClose}
          color="inherit"
        >
          {activeStep === 2 ? 'Close' : 'Cancel'}
        </Button>
        
        {activeStep === 1 && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={() => setActiveStep(0)}>
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleAuthorize}
              disabled={isGettingAuthUrl || isConnecting}
              startIcon={<LaunchIcon />}
              size="large"
            >
              {isGettingAuthUrl ? 'Loading...' : `Authorize ${platformConfig[selectedPlatform as keyof typeof platformConfig]?.name}`}
            </Button>
          </Box>
        )}

        {activeStep === 2 && (
          <Button
            variant="contained"
            onClick={handleComplete}
            size="large"
          >
            Done
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};