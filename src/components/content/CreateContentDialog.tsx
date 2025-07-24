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
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Alert,
  Divider,
  IconButton,
  Paper,
  Autocomplete
} from '@mui/material';
import {
  Upload as UploadIcon,
  Schedule as ScheduleIcon,
  Send as SendIcon,
  VideoFile as VideoIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { 
  CreateContentRequest, 
  ContentPlatform,
  useCreateContentMutation,
  useUploadMediaMutation,
  ContentMedia 
} from '../../store/api/contentApi';
import { useTenant } from '../../contexts/TenantContext';

const steps = ['Content Details', 'Platforms & Scheduling', 'Review & Publish'];

const platformOptions = [
  { value: 'linkedin', label: 'LinkedIn', icon: '💼', color: '#0077B5' },
  { value: 'twitter', label: 'Twitter', icon: '🐦', color: '#1DA1F2' },
  { value: 'facebook', label: 'Facebook', icon: '📘', color: '#1877F2' },
  { value: 'instagram', label: 'Instagram', icon: '📷', color: '#E4405F' },
  { value: 'youtube', label: 'YouTube', icon: '📺', color: '#FF0000' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵', color: '#000000' },
];

const contentTypes = [
  { value: 'post', label: 'Post', description: 'Standard social media post' },
  { value: 'story', label: 'Story', description: '24-hour story content' },
  { value: 'reel', label: 'Reel', description: 'Short video content' },
  { value: 'video', label: 'Video', description: 'Long-form video content' },
  { value: 'carousel', label: 'Carousel', description: 'Multiple images/slides' },
  { value: 'thread', label: 'Thread', description: 'Connected series of posts' },
];

const schema = yup.object({
  title: yup.string().required('Title is required'),
  body: yup.string().required('Content is required'),
  type: yup.string().required('Content type is required'),
  platforms: yup.array().min(1, 'At least one platform must be selected'),
  scheduledAt: yup.date().nullable(),
  priority: yup.string(),
  tags: yup.array().of(yup.string()),
  category: yup.string(),
  contentPillar: yup.string(),
});

interface CreateContentDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: Partial<CreateContentRequest>;
}

interface CreateFormData {
  title: string;
  body: string;
  type: CreateContentRequest['type'];
  platforms: Omit<ContentPlatform, 'status' | 'publishingResult'>[];
  scheduledAt: Date | null;
  tags?: string[];
  category?: string;
  contentPillar?: string;
  priority?: CreateContentRequest['priority'];
  media?: string[];
  aiGenerate?: boolean;
}

export const CreateContentDialog: React.FC<CreateContentDialogProps> = ({
  open,
  onClose,
  onSuccess,
  initialData
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [uploadedMedia, setUploadedMedia] = useState<ContentMedia[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  const { currentWorkspace } = useTenant();
  const [createContent, { isLoading, error }] = useCreateContentMutation();
  const [uploadMedia] = useUploadMediaMutation();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset
  } = useForm<CreateFormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      title: '',
      body: '',
      type: 'post',
      platforms: [],
      priority: 'medium',
      tags: [],
      category: '',
      contentPillar: '',
      media: [],
      ...initialData,
      scheduledAt: initialData?.scheduledAt ? new Date(initialData.scheduledAt) : null
    }
  });

  const { fields: platformFields, append: appendPlatform, remove: removePlatform } = useFieldArray({
    control,
    name: 'platforms'
  });

  const watchedData = watch();

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleClose = () => {
    setActiveStep(0);
    reset();
    setUploadedMedia([]);
    onClose();
  };

  const onSubmit = async (data: CreateFormData) => {
    try {
      const contentData: CreateContentRequest = {
        title: data.title,
        body: data.body,
        type: data.type,
        platforms: data.platforms.map(p => ({
          platform: p.platform,
          scheduledAt: data.scheduledAt?.toISOString(),
          platformSpecific: p.platformSpecific
        })),
        scheduledAt: data.scheduledAt?.toISOString(),
        tags: data.tags,
        category: data.category,
        contentPillar: data.contentPillar,
        priority: data.priority,
        media: uploadedMedia.map(m => m.id)
      };

      await createContent(contentData).unwrap();
      onSuccess?.();
      handleClose();
    } catch (err) {
      console.error('Error creating content:', err);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const result = await uploadMedia(formData).unwrap();
        setUploadedMedia(prev => [...prev, result.media]);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  };

  const handleRemoveMedia = (mediaId: string) => {
    setUploadedMedia(prev => prev.filter(m => m.id !== mediaId));
  };

  const addTag = () => {
    if (tagInput.trim() && !watchedData.tags?.includes(tagInput.trim())) {
      setValue('tags', [...(watchedData.tags || []), tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue('tags', watchedData.tags?.filter(tag => tag !== tagToRemove) || []);
  };

  const addPlatform = (platformValue: string) => {
    const platform = platformOptions.find(p => p.value === platformValue);
    if (platform && !platformFields.find(f => f.platform === platformValue)) {
      appendPlatform({
        platform: platformValue as any,
        platformSpecific: {
          hashtags: [],
          mentions: []
        }
      });
    }
  };

  const getCharacterLimit = (platform: string, type: string) => {
    const limits: Record<string, Record<string, number>> = {
      twitter: { post: 280, thread: 280 },
      linkedin: { post: 3000 },
      facebook: { post: 63206 },
      instagram: { post: 2200 },
      youtube: { post: 5000 },
      tiktok: { post: 300 }
    };
    return limits[platform]?.[type] || 1000;
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Content Title"
                      error={!!errors.title}
                      helperText={errors.title?.message}
                      placeholder="Enter a descriptive title for your content"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Content Type</InputLabel>
                      <Select {...field} label="Content Type">
                        {contentTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            <Box>
                              <Typography variant="body1">{type.label}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {type.description}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Priority</InputLabel>
                      <Select {...field} label="Priority">
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="urgent">Urgent</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="body"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={6}
                      label="Content"
                      error={!!errors.body}
                      helperText={errors.body?.message || `${field.value.length} characters`}
                      placeholder="Write your content here..."
                    />
                  )}
                />
              </Grid>

              {/* Media Upload */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Media Attachments
                </Typography>
                
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  style={{ display: 'none' }}
                  id="media-upload"
                  onChange={handleFileUpload}
                />
                
                <label htmlFor="media-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                    sx={{ mb: 2 }}
                  >
                    Upload Media
                  </Button>
                </label>

                {uploadedMedia.length > 0 && (
                  <Grid container spacing={1}>
                    {uploadedMedia.map((media) => (
                      <Grid item xs={6} sm={4} md={3} key={media.id}>
                        <Paper sx={{ p: 1, position: 'relative' }}>
                          <IconButton
                            size="small"
                            sx={{ position: 'absolute', top: 0, right: 0, zIndex: 1 }}
                            onClick={() => handleRemoveMedia(media.id)}
                          >
                            <CloseIcon />
                          </IconButton>
                          
                          {media.type === 'image' ? (
                            <img
                              src={media.url}
                              alt={media.filename}
                              style={{ width: '100%', height: 60, objectFit: 'cover' }}
                            />
                          ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', height: 60 }}>
                              <VideoIcon sx={{ mr: 1 }} />
                              <Typography variant="caption" noWrap>
                                {media.filename}
                              </Typography>
                            </Box>
                          )}
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Grid>

              {/* Tags */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Tags
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Add a tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button variant="outlined" onClick={addTag}>
                    Add
                  </Button>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {watchedData.tags?.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => removeTag(tag)}
                      size="small"
                    />
                  ))}
                </Box>
              </Grid>

              {/* Content Pillar & Category */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="contentPillar"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      options={currentWorkspace?.contentSettings.contentPillars || []}
                      freeSolo
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Content Pillar"
                          placeholder="Select or type content pillar"
                        />
                      )}
                      onChange={(_, value) => setValue('contentPillar', value || '')}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Category"
                      placeholder="e.g., Product Update, Behind the Scenes"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Select Platforms
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {platformOptions.map((platform) => (
                <Grid item xs={6} sm={4} key={platform.value}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: platformFields.find(f => f.platform === platform.value) ? 2 : 1,
                      borderColor: platformFields.find(f => f.platform === platform.value) 
                        ? platform.color 
                        : 'divider',
                      '&:hover': { borderColor: platform.color }
                    }}
                    onClick={() => {
                      const existingIndex = platformFields.findIndex(f => f.platform === platform.value);
                      if (existingIndex >= 0) {
                        removePlatform(existingIndex);
                      } else {
                        addPlatform(platform.value);
                      }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" sx={{ mb: 1 }}>
                        {platform.icon}
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {platform.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Platform-specific settings */}
            {platformFields.map((platform, index) => {
              const platformInfo = platformOptions.find(p => p.value === platform.platform);
              const charLimit = getCharacterLimit(platform.platform, watchedData.type);
              
              return (
                <Paper key={platform.platform} sx={{ p: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ mr: 1 }}>
                      {platformInfo?.icon}
                    </Typography>
                    <Typography variant="h6">
                      {platformInfo?.label}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Character limit: {watchedData.body.length}/{charLimit}
                  </Typography>
                  
                  {watchedData.body.length > charLimit && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      Content exceeds {platformInfo?.label} character limit
                    </Alert>
                  )}

                  {/* Platform-specific options */}
                  {platform.platform === 'twitter' && (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={platform.platformSpecific?.threadMode || false}
                          onChange={(e) => {
                            const newPlatforms = [...platformFields];
                            newPlatforms[index] = {
                              ...newPlatforms[index],
                              platformSpecific: {
                                ...newPlatforms[index].platformSpecific,
                                threadMode: e.target.checked
                              }
                            };
                            setValue('platforms', newPlatforms);
                          }}
                        />
                      }
                      label="Post as Twitter thread"
                    />
                  )}

                  {platform.platform === 'instagram' && (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={platform.platformSpecific?.carouselMode || false}
                          onChange={(e) => {
                            const newPlatforms = [...platformFields];
                            newPlatforms[index] = {
                              ...newPlatforms[index],
                              platformSpecific: {
                                ...newPlatforms[index].platformSpecific,
                                carouselMode: e.target.checked
                              }
                            };
                            setValue('platforms', newPlatforms);
                          }}
                        />
                      }
                      label="Post as carousel"
                    />
                  )}
                </Paper>
              );
            })}

            {/* Scheduling */}
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Scheduling
            </Typography>
            
            <Controller
              name="scheduledAt"
              control={control}
              render={({ field }) => (
                <DateTimePicker
                  label="Schedule for later (optional)"
                  value={field.value}
                  onChange={field.onChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      helperText: 'Leave empty to save as draft'
                    }
                  }}
                />
              )}
            />
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Review Your Content
            </Typography>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {watchedData.title}
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                {watchedData.body}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip label={`Type: ${watchedData.type}`} size="small" />
                <Chip label={`Priority: ${watchedData.priority}`} size="small" />
                {watchedData.contentPillar && (
                  <Chip label={`Pillar: ${watchedData.contentPillar}`} size="small" />
                )}
              </Box>
              
              {watchedData.tags && watchedData.tags.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Tags:</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {watchedData.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}
              
              <Typography variant="subtitle2" gutterBottom>
                Platforms:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                {platformFields.map((platform) => {
                  const platformInfo = platformOptions.find(p => p.value === platform.platform);
                  return (
                    <Chip
                      key={platform.platform}
                      label={`${platformInfo?.icon} ${platformInfo?.label}`}
                      size="small"
                      sx={{ bgcolor: platformInfo?.color + '20' }}
                    />
                  );
                })}
              </Box>
              
              {watchedData.scheduledAt && (
                <Typography variant="body2" color="text.secondary">
                  Scheduled for: {watchedData.scheduledAt.toLocaleString()}
                </Typography>
              )}
              
              {uploadedMedia.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Media: {uploadedMedia.length} file(s)
                  </Typography>
                </Box>
              )}
            </Paper>
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
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: 700 }
      }}
    >
      <DialogTitle>
        <Typography variant="h5" fontWeight="bold">
          Create New Content
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create and schedule content across multiple platforms
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

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {(error as any)?.data?.error?.message || 'Failed to create content'}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit as any)}>
          {renderStepContent()}
        </form>
      </DialogContent>

      <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
        <Button 
          onClick={handleClose}
          color="inherit"
        >
          Cancel
        </Button>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit(onSubmit as any)}
              disabled={isLoading}
              startIcon={watchedData.scheduledAt ? <ScheduleIcon /> : <SendIcon />}
            >
              {isLoading ? 'Creating...' : watchedData.scheduledAt ? 'Schedule Content' : 'Save Draft'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={platformFields.length === 0 && activeStep === 1}
            >
              Next
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};