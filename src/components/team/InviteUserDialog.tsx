import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Divider
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Email as EmailIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { useInviteUserMutation } from '../../store/api/organizationApi';

interface InviteUserDialogProps {
  open: boolean;
  onClose: () => void;
  organizationId: string;
}

interface InviteFormData {
  email: string;
  role: 'admin' | 'manager' | 'member';
  message?: string;
}

const schema = yup.object({
  email: yup.string().email('Invalid email address').required('Email is required'),
  role: yup.string().required('Role is required'),
  message: yup.string(),
});

const roleDescriptions = {
  admin: {
    title: 'Administrator',
    description: 'Can manage team members, organization settings, and has full access to all features',
    permissions: ['Manage team members', 'Organization settings', 'Billing management', 'All workspace access']
  },
  manager: {
    title: 'Manager',
    description: 'Can manage content workflows and team collaboration within assigned workspaces',
    permissions: ['Content management', 'Workflow oversight', 'Team collaboration', 'Assigned workspace access']
  },
  member: {
    title: 'Member',
    description: 'Can create and manage content within assigned workspaces',
    permissions: ['Content creation', 'Content editing', 'Basic collaboration', 'Assigned workspace access']
  }
};

export const InviteUserDialog: React.FC<InviteUserDialogProps> = ({
  open,
  onClose,
  organizationId
}) => {
  const [selectedRole, setSelectedRole] = useState<keyof typeof roleDescriptions>('member');
  
  const [inviteUser, { isLoading, error }] = useInviteUserMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<InviteFormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      email: '',
      role: 'member',
      message: ''
    }
  });

  const watchedRole = watch('role');

  React.useEffect(() => {
    setSelectedRole(watchedRole as keyof typeof roleDescriptions);
  }, [watchedRole]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: InviteFormData) => {
    try {
      await inviteUser({
        organizationId,
        email: data.email,
        role: data.role,
        message: data.message
      }).unwrap();
      
      handleClose();
    } catch (err) {
      console.error('Failed to invite user:', err);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: 600 }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonAddIcon color="primary" />
          <Typography variant="h5" fontWeight="bold">
            Invite Team Member
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Send an invitation to join your organization
        </Typography>
      </DialogTitle>
      
      <DialogContent dividers>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Email Input */}
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon fontSize="small" />
                Email Address
              </Typography>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    placeholder="Enter email address"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                )}
              />
            </Box>

            {/* Role Selection */}
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BadgeIcon fontSize="small" />
                Role & Permissions
              </Typography>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.role}>
                    <InputLabel>Select Role</InputLabel>
                    <Select
                      {...field}
                      label="Select Role"
                    >
                      <MenuItem value="member">Member</MenuItem>
                      <MenuItem value="manager">Manager</MenuItem>
                      <MenuItem value="admin">Administrator</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
              
              {/* Role Description */}
              {selectedRole && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    {roleDescriptions[selectedRole].title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {roleDescriptions[selectedRole].description}
                  </Typography>
                  
                  <Typography variant="caption" fontWeight="medium" gutterBottom display="block">
                    Permissions:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {roleDescriptions[selectedRole].permissions.map((permission) => (
                      <Chip
                        key={permission}
                        label={permission}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>

            <Divider />

            {/* Optional Message */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Personal Message (Optional)
              </Typography>
              <Controller
                name="message"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Add a personal message to the invitation..."
                    error={!!errors.message}
                    helperText={errors.message?.message || 'This message will be included in the invitation email'}
                  />
                )}
              />
            </Box>

            {/* Error Display */}
            {error && (
              <Alert severity="error">
                {(error as any)?.data?.error?.message || 'Failed to send invitation'}
              </Alert>
            )}
          </Box>
        </form>
      </DialogContent>

      <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
        <Button 
          onClick={handleClose}
          color="inherit"
        >
          Cancel
        </Button>
        
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit as any)}
          disabled={isLoading}
          startIcon={<PersonAddIcon />}
          size="large"
        >
          {isLoading ? 'Sending Invitation...' : 'Send Invitation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};