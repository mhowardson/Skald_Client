import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
  Grid,
  Paper
} from '@mui/material';
import {
  Lock as LockIcon,
  Shield as ShieldIcon,
  Smartphone as PhoneIcon,
  Key as KeyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import {
  useChangePasswordMutation,
  useEnableTwoFactorMutation,
  useDisableTwoFactorMutation,
  type UserProfile
} from '../../store/api/userProfileApi';

interface SecuritySettingsProps {
  user?: UserProfile;
  isLoading: boolean;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const passwordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain uppercase, lowercase, number and special character'
    )
    .required('New password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password')
});

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  user,
  isLoading
}) => {
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [twoFADialogOpen, setTwoFADialogOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // API hooks
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [enable2FA, { isLoading: isEnabling2FA }] = useEnableTwoFactorMutation();
  const [disable2FA, { isLoading: isDisabling2FA }] = useDisableTwoFactorMutation();
  const twoFASecret = { secret: 'EXAMPLE_SECRET' }; // Mock for demo
  const securityDevices = { devices: [] }; // Mock for demo

  // Form handling
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<PasswordFormData>({
    resolver: yupResolver(passwordSchema) as any
  });

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword
      }).unwrap();
      setPasswordDialogOpen(false);
      reset();
    } catch (error) {
      console.error('Password change failed:', error);
    }
  };

  const handleEnable2FA = async (verificationCode: string) => {
    try {
      await enable2FA({ 
        code: verificationCode 
      }).unwrap();
      setTwoFADialogOpen(false);
    } catch (error) {
      console.error('2FA enable failed:', error);
    }
  };

  const handleDisable2FA = async () => {
    try {
      await disable2FA({ password: 'mock' }).unwrap();
    } catch (error) {
      console.error('2FA disable failed:', error);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Security Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Loading security settings...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Security Settings
      </Typography>
      
      <Grid container spacing={3}>
        {/* Password Management */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LockIcon color="primary" />
                <Typography variant="h6">Password</Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Keep your account secure with a strong password. Last changed: {user?.security?.lastPasswordChange || 'Never'}
              </Typography>
              
              <Button
                variant="outlined"
                onClick={() => setPasswordDialogOpen(true)}
                startIcon={<KeyIcon />}
              >
                Change Password
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Two-Factor Authentication */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ShieldIcon color="primary" />
                <Typography variant="h6">Two-Factor Authentication</Typography>
                {user?.security?.twoFactorEnabled && (
                  <Chip 
                    label="Enabled" 
                    color="success" 
                    size="small"
                    icon={<CheckIcon />}
                  />
                )}
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Add an extra layer of security to your account with two-factor authentication.
              </Typography>
              
              {user?.security?.twoFactorEnabled ? (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDisable2FA}
                  disabled={isDisabling2FA}
                >
                  {isDisabling2FA ? 'Disabling...' : 'Disable 2FA'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => setTwoFADialogOpen(true)}
                  startIcon={<PhoneIcon />}
                >
                  Enable 2FA
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Security Score */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
            <Typography variant="h6" gutterBottom>
              Security Score
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h2" color="primary.main">
                    85
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Security Score
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={9}>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Strong password"
                      secondary="Your password meets security requirements"
                    />
                    <CheckIcon color="success" />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Two-factor authentication"
                      secondary={user?.security?.twoFactorEnabled ? "Enabled" : "Not enabled"}
                    />
                    {user?.security?.twoFactorEnabled ? (
                      <CheckIcon color="success" />
                    ) : (
                      <WarningIcon color="warning" />
                    )}
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Recent security review"
                      secondary="Last reviewed 7 days ago"
                    />
                    <CheckIcon color="success" />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Trusted Devices */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Trusted Devices
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                These devices have been verified for two-factor authentication.
              </Typography>
              
              {securityDevices?.devices?.length ? (
                <List>
                  {securityDevices.devices.map((device: any) => (
                    <React.Fragment key={device.id}>
                      <ListItem>
                        <ListItemText
                          primary={device.name}
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                Added: {new Date(device.addedAt).toLocaleDateString()}
                              </Typography>
                              <Typography variant="caption" display="block">
                                Last used: {new Date(device.lastUsedAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => console.log('Revoke device:', device.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">
                  No trusted devices configured
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <form onSubmit={handleSubmit(onPasswordSubmit)}>
          <DialogContent>
            <Controller
              name="currentPassword"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Current Password"
                  type={showPasswords.current ? 'text' : 'password'}
                  error={!!errors.currentPassword}
                  helperText={errors.currentPassword?.message}
                  sx={{ mb: 2 }}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => togglePasswordVisibility('current')}
                        edge="end"
                      >
                        {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    )
                  }}
                />
              )}
            />
            
            <Controller
              name="newPassword"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="New Password"
                  type={showPasswords.new ? 'text' : 'password'}
                  error={!!errors.newPassword}
                  helperText={errors.newPassword?.message}
                  sx={{ mb: 2 }}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => togglePasswordVisibility('new')}
                        edge="end"
                      >
                        {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    )
                  }}
                />
              )}
            />
            
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Confirm New Password"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => togglePasswordVisibility('confirm')}
                        edge="end"
                      >
                        {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    )
                  }}
                />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained"
              disabled={isChangingPassword}
            >
              {isChangingPassword ? 'Changing...' : 'Change Password'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Enable 2FA Dialog */}
      <Dialog open={twoFADialogOpen} onClose={() => setTwoFADialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.):
          </Typography>
          
          {twoFASecret && (
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              {/* In a real app, you'd generate and display a QR code here */}
              <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                <Typography variant="caption">QR Code would be displayed here</Typography>
              </Paper>
              
              <Typography variant="body2" sx={{ mt: 2 }}>Or enter this secret manually:</Typography>
              <Typography component="code" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                {twoFASecret.secret}
              </Typography>
            </Box>
          )}
          
          <TextField
            fullWidth
            label="Verification Code"
            placeholder="Enter 6-digit code"
            helperText="Enter the 6-digit code from your authenticator app"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTwoFADialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained"
            disabled={isEnabling2FA}
            onClick={() => handleEnable2FA('123456')} // In real app, get from input
          >
            {isEnabling2FA ? 'Enabling...' : 'Enable 2FA'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};