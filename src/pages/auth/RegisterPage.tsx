import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Lock, 
  Person, 
  Business,
  AccountBalance
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { useRegisterMutation } from '../../store/api/authApi';
import { setCredentials } from '../../store/slices/authSlice';

const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  organizationName: yup.string().required('Organization name is required'),
  organizationType: yup.string().oneOf(['agency', 'enterprise', 'freelancer']).required('Organization type is required'),
  plan: yup.string().oneOf(['creator', 'agency', 'studio', 'enterprise']).required('Plan selection is required'),
});

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  organizationName: string;
  organizationType: 'agency' | 'enterprise' | 'freelancer';
  plan: 'creator' | 'agency' | 'studio' | 'enterprise';
}

const organizationTypes = [
  { value: 'agency', label: 'Agency' },
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'freelancer', label: 'Freelancer' },
];

const plans = [
  { value: 'creator', label: 'Creator' },
  { value: 'agency', label: 'Agency' },
  { value: 'studio', label: 'Studio' },
  { value: 'enterprise', label: 'Enterprise' },
];

export const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [register, { isLoading, error }] = useRegisterMutation();

  const {
    register: registerField,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const result = await register(data).unwrap();
      
      // Store credentials in Redux
      dispatch(setCredentials({
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken
      }));
      
      // Redirect to dashboard
      navigate('/dashboard', { replace: true });
    } catch (err) {
      // Error is handled by RTK Query
      console.error('Registration error:', err);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 500,
            boxShadow: 4
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                Create Your Account
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Join ContentAutoPilot and start automating your content
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {(error as any)?.data?.error?.message || 'Registration failed. Please try again.'}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    {...registerField('firstName')}
                    fullWidth
                    label="First Name"
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                    margin="normal"
                    autoComplete="given-name"
                    data-testid="firstName-input"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    {...registerField('lastName')}
                    fullWidth
                    label="Last Name"
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                    margin="normal"
                    autoComplete="family-name"
                    data-testid="lastName-input"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <TextField
                {...registerField('email')}
                fullWidth
                label="Email Address"
                type="email"
                error={!!errors.email}
                helperText={errors.email?.message}
                margin="normal"
                autoComplete="email"
                data-testid="email-input"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                {...registerField('password')}
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                error={!!errors.password}
                helperText={errors.password?.message}
                margin="normal"
                autoComplete="new-password"
                data-testid="password-input"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={togglePasswordVisibility}
                        edge="end"
                        data-testid="toggle-password"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                {...registerField('organizationName')}
                fullWidth
                label="Organization Name"
                error={!!errors.organizationName}
                helperText={errors.organizationName?.message}
                margin="normal"
                data-testid="organizationName-input"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Business color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth margin="normal" error={!!errors.organizationType}>
                    <InputLabel>Organization Type</InputLabel>
                    <Controller
                      name="organizationType"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Organization Type"
                          data-testid="organizationType-select"
                        >
                          {organizationTypes.map((type) => (
                            <MenuItem key={type.value} value={type.value} data-value={type.value}>
                              {type.label}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                    {errors.organizationType && (
                      <FormHelperText>{errors.organizationType.message}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth margin="normal" error={!!errors.plan}>
                    <InputLabel>Plan</InputLabel>
                    <Controller
                      name="plan"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Plan"
                          data-testid="plan-select"
                          startAdornment={
                            <InputAdornment position="start">
                              <AccountBalance color="action" />
                            </InputAdornment>
                          }
                        >
                          {plans.map((plan) => (
                            <MenuItem key={plan.value} value={plan.value} data-value={plan.value}>
                              {plan.label}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                    {errors.plan && (
                      <FormHelperText>{errors.plan.message}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ mt: 3, mb: 2 }}
                data-testid="register-button"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  to="/login"
                  style={{
                    color: 'inherit',
                    textDecoration: 'none',
                    fontWeight: 600
                  }}
                  data-testid="login-link"
                >
                  Sign in
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};