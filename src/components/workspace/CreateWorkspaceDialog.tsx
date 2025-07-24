import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Chip,
  Paper
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useCreateWorkspaceMutation } from '../../store/api/workspaceApi';

const schema = yup.object({
  name: yup.string().required('Workspace name is required'),
  companyName: yup.string().required('Company name is required'),
  industry: yup.string().optional(),
  website: yup.string().url('Invalid URL format').optional(),
  brandVoice: yup.string().required('Brand voice is required'),
  targetAudience: yup.string().required('Target audience is required'),
  toneOfVoice: yup.string().oneOf(['professional', 'casual', 'friendly', 'authoritative', 'playful']).optional(),
  primaryColor: yup.string().matches(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  secondaryColor: yup.string().matches(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
});

interface CreateWorkspaceFormData {
  name: string;
  companyName: string;
  industry?: string;
  website?: string;
  brandVoice: string;
  targetAudience: string;
  toneOfVoice?: 'professional' | 'casual' | 'friendly' | 'authoritative' | 'playful';
  primaryColor?: string;
  secondaryColor?: string;
}

interface CreateWorkspaceDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const steps = ['Workspace Details', 'Client Information', 'Branding'];

const toneOptions = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'playful', label: 'Playful' },
];

const industryOptions = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 
  'Manufacturing', 'Real Estate', 'Legal', 'Consulting', 'Other'
];

export const CreateWorkspaceDialog: React.FC<CreateWorkspaceDialogProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [createWorkspace, { isLoading, error }] = useCreateWorkspaceMutation();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset
  } = useForm<CreateWorkspaceFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      toneOfVoice: 'professional',
      primaryColor: '#6366f1',
      secondaryColor: '#f59e0b'
    }
  });

  const watchedValues = watch();

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleClose = () => {
    reset();
    setActiveStep(0);
    onClose();
  };

  const onSubmit = async (data: CreateWorkspaceFormData) => {
    try {
      const workspaceData = {
        name: data.name,
        client: {
          companyName: data.companyName,
          industry: data.industry,
          website: data.website
        },
        branding: {
          brandVoice: data.brandVoice,
          toneOfVoice: data.toneOfVoice || 'professional',
          targetAudience: data.targetAudience,
          brandColors: {
            primary: data.primaryColor || '#6366f1',
            secondary: data.secondaryColor || '#f59e0b'
          }
        }
      };

      await createWorkspace(workspaceData).unwrap();
      onSuccess?.();
      handleClose();
    } catch (err) {
      console.error('Failed to create workspace:', err);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                {...register('name')}
                fullWidth
                label="Workspace Name"
                error={!!errors.name}
                helperText={errors.name?.message}
                data-testid="workspace-name"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                This will be the internal name for this client workspace
              </Typography>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                {...register('companyName')}
                fullWidth
                label="Company Name"
                error={!!errors.companyName}
                helperText={errors.companyName?.message}
                data-testid="client-company"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Industry</InputLabel>
                <Controller
                  name="industry"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Industry"
                      data-testid="client-industry"
                    >
                      {industryOptions.map((industry) => (
                        <MenuItem key={industry} value={industry}>
                          {industry}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                {...register('website')}
                fullWidth
                label="Website"
                error={!!errors.website}
                helperText={errors.website?.message}
                data-testid="client-website"
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                {...register('brandVoice')}
                fullWidth
                multiline
                rows={3}
                label="Brand Voice"
                placeholder="Describe the brand's personality and communication style..."
                error={!!errors.brandVoice}
                helperText={errors.brandVoice?.message}
                data-testid="brand-voice"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                {...register('targetAudience')}
                fullWidth
                multiline
                rows={2}
                label="Target Audience"
                placeholder="Describe the primary audience for this brand..."
                error={!!errors.targetAudience}
                helperText={errors.targetAudience?.message}
                data-testid="target-audience"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.toneOfVoice}>
                <InputLabel>Tone of Voice</InputLabel>
                <Controller
                  name="toneOfVoice"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Tone of Voice"
                      data-testid="tone-of-voice"
                    >
                      {toneOptions.map((tone) => (
                        <MenuItem key={tone.value} value={tone.value} data-value={tone.value}>
                          {tone.label}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.toneOfVoice && (
                  <FormHelperText>{errors.toneOfVoice.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                {...register('primaryColor')}
                fullWidth
                label="Primary Color"
                type="color"
                error={!!errors.primaryColor}
                helperText={errors.primaryColor?.message}
                data-testid="primary-color"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                {...register('secondaryColor')}
                fullWidth
                label="Secondary Color"
                type="color"
                error={!!errors.secondaryColor}
                helperText={errors.secondaryColor?.message}
                data-testid="secondary-color"
              />
            </Grid>
            
            {/* Preview */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Brand Preview
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Chip 
                    label={watchedValues.toneOfVoice || 'professional'} 
                    size="small"
                    sx={{ 
                      bgcolor: watchedValues.primaryColor || '#6366f1',
                      color: 'white'
                    }}
                  />
                  <Chip 
                    label={watchedValues.companyName || 'Company'} 
                    size="small"
                    variant="outlined"
                    sx={{ 
                      borderColor: watchedValues.secondaryColor || '#f59e0b',
                      color: watchedValues.secondaryColor || '#f59e0b'
                    }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {watchedValues.brandVoice || 'Brand voice will appear here...'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
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
        <Typography variant="h6">Create New Workspace</Typography>
        <Typography variant="body2" color="text.secondary">
          Set up a new client workspace for content management
        </Typography>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {(error as any)?.data?.error?.message || 'Failed to create workspace'}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {renderStepContent(activeStep)}
        </form>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        
        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={isLoading}>
            Back
          </Button>
        )}
        
        {activeStep < steps.length - 1 ? (
          <Button onClick={handleNext} variant="contained">
            Next
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            disabled={isLoading}
            data-testid="create-workspace-submit"
          >
            {isLoading ? 'Creating...' : 'Create Workspace'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};