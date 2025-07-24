import React, { useState, useRef } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  TextField,
  IconButton,
  Alert,
  Skeleton,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera as CameraIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Verified as VerifiedIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import {
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useDeleteAvatarMutation,
  useGetUserStatsQuery,
  useResendEmailVerificationMutation,
  type UserProfile
} from '../../store/api/userProfileApi';

interface ProfileOverviewProps {
  user?: UserProfile;
  isLoading: boolean;
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  bio: string;
  title: string;
  phone: string;
  location: string;
  timezone: string;
}

const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  bio: yup.string().max(500, 'Bio must be less than 500 characters'),
  title: yup.string(),
  phone: yup.string(),
  location: yup.string(),
  timezone: yup.string().required('Timezone is required'),
});

const timezones = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney'
];

export const ProfileOverview: React.FC<ProfileOverviewProps> = ({
  user,
  isLoading
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: statsData } = useGetUserStatsQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [uploadAvatar, { isLoading: isUploading }] = useUploadAvatarMutation();
  const [deleteAvatar, { isLoading: isDeleting }] = useDeleteAvatarMutation();
  const [resendVerification, { isLoading: isResending }] = useResendEmailVerificationMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ProfileFormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      firstName: user?.profile.firstName || '',
      lastName: user?.profile.lastName || '',
      bio: user?.profile.bio || '',
      title: user?.profile.title || '',
      phone: user?.profile.phone || '',
      location: user?.profile.location || '',
      timezone: user?.profile.timezone || 'America/New_York',
    }
  });

  React.useEffect(() => {
    if (user) {
      reset({
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        bio: user.profile.bio || '',
        title: user.profile.title || '',
        phone: user.profile.phone || '',
        location: user.profile.location || '',
        timezone: user.profile.timezone,
      });
    }
  }, [user, reset]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      reset();
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile({ profile: data }).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      await uploadAvatar(formData).unwrap();
    } catch (error) {
      console.error('Failed to upload avatar:', error);
    }
  };

  const handleAvatarDelete = async () => {
    try {
      await deleteAvatar().unwrap();
    } catch (error) {
      console.error('Failed to delete avatar:', error);
    }
  };

  const handleResendVerification = async () => {
    try {
      await resendVerification().unwrap();
    } catch (error) {
      console.error('Failed to resend verification:', error);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Skeleton variant="circular" width={120} height={120} sx={{ mx: 'auto', mb: 2 }} />
                <Skeleton variant="text" width="60%" sx={{ mx: 'auto' }} />
                <Skeleton variant="text" width="40%" sx={{ mx: 'auto' }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="30%" height={32} />
                <Box sx={{ mt: 2 }}>
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} variant="text" height={56} sx={{ mb: 2 }} />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (!user) return null;

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                <Avatar
                  src={user.profile.avatar}
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    mx: 'auto',
                    fontSize: '2rem',
                    cursor: 'pointer'
                  }}
                  onClick={handleAvatarClick}
                >
                  {user.profile.firstName[0]}{user.profile.lastName[0]}
                </Avatar>
                
                {(isUploading || isDeleting) && (
                  <LinearProgress 
                    sx={{ 
                      position: 'absolute', 
                      top: '50%', 
                      left: 0, 
                      right: 0,
                      borderRadius: '50%'
                    }} 
                  />
                )}
                
                <IconButton
                  sx={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    right: 0,
                    bgcolor: 'background.paper',
                    boxShadow: 1,
                    '&:hover': { bgcolor: 'background.paper' }
                  }}
                  onClick={handleAvatarClick}
                  disabled={isUploading || isDeleting}
                >
                  <CameraIcon />
                </IconButton>
              </Box>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />

              <Typography variant="h6" gutterBottom>
                {user.profile.firstName} {user.profile.lastName}
              </Typography>
              
              {user.profile.title && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {user.profile.title}
                </Typography>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                <Chip
                  icon={user.verification.emailVerified ? <VerifiedIcon /> : <WarningIcon />}
                  label={user.verification.emailVerified ? 'Email Verified' : 'Email Unverified'}
                  color={user.verification.emailVerified ? 'success' : 'warning'}
                  size="small"
                />
              </Box>

              {!user.verification.emailVerified && (
                <Alert severity="warning" sx={{ mb: 2, textAlign: 'left' }}>
                  <Typography variant="body2" gutterBottom>
                    Please verify your email address
                  </Typography>
                  <Button
                    size="small"
                    onClick={handleResendVerification}
                    disabled={isResending}
                  >
                    {isResending ? 'Sending...' : 'Resend Verification'}
                  </Button>
                </Alert>
              )}

              {user.profile.avatar && (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={handleAvatarDelete}
                  disabled={isDeleting}
                  sx={{ mt: 1 }}
                >
                  Remove Photo
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Stats Card */}
          {statsData && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Your Activity
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Content Created</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {statsData.stats.contentCreated}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Posts Published</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {statsData.stats.postsPublished}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Days Active</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {statsData.stats.daysActive}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Organizations</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {statsData.stats.organizationsJoined}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Profile Form */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Profile Information
                </Typography>
                <Button
                  variant={isEditing ? 'outlined' : 'contained'}
                  startIcon={isEditing ? <CancelIcon /> : <EditIcon />}
                  onClick={handleEditToggle}
                  disabled={isUpdating}
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </Box>

              <form onSubmit={handleSubmit(onSubmit as any)}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="firstName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="First Name"
                          disabled={!isEditing}
                          error={!!errors.firstName}
                          helperText={errors.firstName?.message}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="lastName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Last Name"
                          disabled={!isEditing}
                          error={!!errors.lastName}
                          helperText={errors.lastName?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name="bio"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Bio"
                          multiline
                          rows={3}
                          disabled={!isEditing}
                          error={!!errors.bio}
                          helperText={errors.bio?.message || `${field.value.length}/500 characters`}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="title"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Job Title"
                          disabled={!isEditing}
                          error={!!errors.title}
                          helperText={errors.title?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Phone Number"
                          disabled={!isEditing}
                          error={!!errors.phone}
                          helperText={errors.phone?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="location"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Location"
                          disabled={!isEditing}
                          error={!!errors.location}
                          helperText={errors.location?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="timezone"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Timezone"
                          select
                          disabled={!isEditing}
                          error={!!errors.timezone}
                          helperText={errors.timezone?.message}
                          SelectProps={{ native: true }}
                        >
                          {timezones.map((tz) => (
                            <option key={tz} value={tz}>
                              {tz}
                            </option>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>
                </Grid>

                {isEditing && (
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={isUpdating}
                    >
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleEditToggle}
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};