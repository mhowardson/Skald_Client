import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar
} from '@mui/material';
import {
  Close as CloseIcon,
  AutoAwesome as AIIcon,
  Edit as EditIcon,
  ContentCopy as CopyIcon,
  Schedule as ScheduleIcon,
  Publish as PublishIcon,
  Mic as VoiceIcon,
  VideoCall as VideoIcon,
  Image as ImageIcon,
  TextFields as TextIcon,
  Translate as TranslateIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';
import { useTenant } from '../../contexts/TenantContext';
import { useGenerateContentMutation, useOptimizeForPlatformMutation } from '../../store/api/aiContentApi';
import { VoiceToContent } from '../mobile/VoiceToContent';
import { MobileVideoUpload } from '../mobile/MobileVideoUpload';
import { TranslationDialog } from '../mobile/TranslationDialog';

interface ContentGenerationDialogProps {
  open: boolean;
  onClose: () => void;
  onContentGenerated?: (content: any) => void;
}

const steps = ['Input Method', 'Generate Content', 'Review & Optimize', 'Schedule & Publish'];

const platforms = [
  { id: 'instagram', name: 'Instagram', color: '#E4405F', icon: '📷' },
  { id: 'twitter', name: 'Twitter', color: '#1DA1F2', icon: '🐦' },
  { id: 'linkedin', name: 'LinkedIn', color: '#0077B5', icon: '💼' },
  { id: 'youtube', name: 'YouTube', color: '#FF0000', icon: '📺' },
  { id: 'tiktok', name: 'TikTok', color: '#000000', icon: '🎵' },
  { id: 'facebook', name: 'Facebook', color: '#1877F2', icon: '👥' }
];

const contentTypes = [
  { id: 'post', name: 'Social Post', description: 'Standard social media post' },
  { id: 'story', name: 'Story', description: 'Short-form story content' },
  { id: 'reel', name: 'Reel/Short', description: 'Short video content' },
  { id: 'video', name: 'Video', description: 'Long-form video content' }
];

const inputMethods = [
  { 
    id: 'text', 
    name: 'Text Prompt', 
    description: 'Describe your content idea',
    icon: <TextIcon />,
    color: '#2196F3'
  },
  { 
    id: 'voice', 
    name: 'Voice Recording', 
    description: 'Record your idea by speaking',
    icon: <VoiceIcon />,
    color: '#FF5722'
  },
  { 
    id: 'video', 
    name: 'Video Upload', 
    description: 'Upload video for AI captioning',
    icon: <VideoIcon />,
    color: '#9C27B0'
  },
  { 
    id: 'image', 
    name: 'Image Upload', 
    description: 'Generate content from images',
    icon: <ImageIcon />,
    color: '#4CAF50'
  }
];

export const ContentGenerationDialog: React.FC<ContentGenerationDialogProps> = ({
  open,
  onClose,
  onContentGenerated
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [inputMethod, setInputMethod] = useState('');
  const [textPrompt, setTextPrompt] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram']);
  const [selectedContentType, setSelectedContentType] = useState('post');
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [voiceDialogOpen, setVoiceDialogOpen] = useState(false);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [translationDialogOpen, setTranslationDialogOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  
  const { currentWorkspace } = useTenant();
  const [generateContent] = useGenerateContentMutation();
  const [optimizeForPlatform] = useOptimizeForPlatformMutation();

  const handleNext = () => {
    if (activeStep === 0 && inputMethod === 'text' && textPrompt.trim()) {
      handleGenerateFromText();
    } else {
      setActiveStep((prev: any) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev: any) => prev - 1);
  };

  const handleClose = () => {
    setActiveStep(0);
    setInputMethod('');
    setTextPrompt('');
    setGeneratedContent(null);
    setIsGenerating(false);
    onClose();
  };

  const handleInputMethodSelect = (method: string) => {
    setInputMethod(method);
    
    if (method === 'voice') {
      setVoiceDialogOpen(true);
    } else if (method === 'video') {
      setVideoDialogOpen(true);
    } else if (method === 'text') {
      setActiveStep(1);
    }
  };

  const handleGenerateFromText = async () => {
    if (!currentWorkspace || !textPrompt.trim()) return;
    
    setIsGenerating(true);
    setActiveStep(1);
    
    try {
      const result = await generateContent({
        prompt: textPrompt,
        platform: selectedPlatforms[0],
        contentType: selectedContentType as any,
        workspaceId: currentWorkspace.id
      }).unwrap();
      
      setGeneratedContent(result);
      setActiveStep(2);
    } catch (error) {
      console.error('Content generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVoiceContentGenerated = (content: any) => {
    setGeneratedContent({
      content: content.socialMediaPost,
      hashtags: content.hashtags,
      callToAction: content.callToAction,
      platform: content.platform,
      contentType: content.contentType
    });
    setVoiceDialogOpen(false);
    setActiveStep(2);
  };

  const handleOptimizeForPlatform = async (targetPlatform: string) => {
    if (!currentWorkspace || !generatedContent) return;
    
    try {
      const optimized = await optimizeForPlatform({
        content: generatedContent.content,
        fromPlatform: generatedContent.platform,
        toPlatform: targetPlatform,
        workspaceId: currentWorkspace.id
      }).unwrap();
      
      setGeneratedContent((prev: any) => ({
        ...prev,
        content: optimized.content,
        hashtags: optimized.hashtags,
        platform: targetPlatform
      }));
    } catch (error) {
      console.error('Platform optimization failed:', error);
    }
  };

  const handleScheduleContent = () => {
    if (generatedContent) {
      const finalContent = {
        ...generatedContent,
        scheduledDate,
        platforms: selectedPlatforms,
        workspaceId: currentWorkspace?.id
      };
      
      onContentGenerated?.(finalContent);
      handleClose();
    }
  };

  const renderInputMethodStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        How would you like to create content?
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose your preferred input method to get started
      </Typography>

      <Grid container spacing={2}>
        {inputMethods.map((method) => (
          <Grid item xs={12} sm={6} key={method.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                border: inputMethod === method.id ? 2 : 1,
                borderColor: inputMethod === method.id ? 'primary.main' : 'divider',
                '&:hover': { borderColor: 'primary.light' }
              }}
              onClick={() => handleInputMethodSelect(method.id)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: method.color }}>
                    {method.icon}
                  </Avatar>
                  <Typography variant="h6">{method.name}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {method.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {inputMethod === 'text' && (
        <Box sx={{ mt: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Describe your content idea"
            placeholder="e.g., Create a post about teaching kids coding fundamentals..."
            value={textPrompt}
            onChange={(e) => setTextPrompt(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Primary Platform</InputLabel>
                <Select
                  value={selectedPlatforms[0] || ''}
                  label="Primary Platform"
                  onChange={(e) => setSelectedPlatforms([e.target.value])}
                >
                  {platforms.map((platform) => (
                    <MenuItem key={platform.id} value={platform.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{platform.icon}</span>
                        <span>{platform.name}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Content Type</InputLabel>
                <Select
                  value={selectedContentType}
                  label="Content Type"
                  onChange={(e) => setSelectedContentType(e.target.value)}
                >
                  {contentTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );

  const renderGenerateStep = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <AIIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
      <Typography variant="h5" gutterBottom>
        Generating Your Content
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Our AI is creating engaging content based on your input and workspace branding
      </Typography>
      
      <LinearProgress sx={{ mb: 3, maxWidth: 400, mx: 'auto' }} />
      
      <List dense sx={{ maxWidth: 400, mx: 'auto' }}>
        <ListItem>
          <ListItemIcon>
            <AIIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Analyzing your prompt and brand voice" />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <TrendingIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Optimizing for platform best practices" />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <EditIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Crafting engaging copy and hashtags" />
        </ListItem>
      </List>
    </Box>
  );

  const renderReviewStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Review & Optimize Your Content
      </Typography>
      
      {generatedContent && (
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">Generated Content</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton size="small" onClick={() => navigator.clipboard.writeText(generatedContent.content)}>
                    <CopyIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => setTranslationDialogOpen(true)}>
                    <TranslateIcon />
                  </IconButton>
                </Box>
              </Box>
              
              <TextField
                fullWidth
                multiline
                rows={6}
                value={generatedContent.content}
                onChange={(e) => setGeneratedContent((prev: any) => ({ ...prev, content: e.target.value }))}
                variant="outlined"
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {generatedContent.hashtags?.map((tag: string, index: number) => (
                  <Chip key={index} label={tag} size="small" variant="outlined" />
                ))}
              </Box>
              
              {generatedContent.callToAction && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <strong>Suggested CTA:</strong> {generatedContent.callToAction}
                </Alert>
              )}
            </CardContent>
          </Card>

          <Typography variant="subtitle1" gutterBottom>
            Optimize for Different Platforms
          </Typography>
          <Grid container spacing={1} sx={{ mb: 3 }}>
            {platforms.map((platform) => (
              <Grid item key={platform.id}>
                <Button
                  variant={generatedContent.platform === platform.id ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => handleOptimizeForPlatform(platform.id)}
                  sx={{
                    borderColor: platform.color,
                    color: generatedContent.platform === platform.id ? 'white' : platform.color,
                    bgcolor: generatedContent.platform === platform.id ? platform.color : 'transparent',
                    '&:hover': {
                      bgcolor: platform.color,
                      color: 'white'
                    }
                  }}
                >
                  {platform.icon} {platform.name}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );

  const renderScheduleStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Schedule & Publish
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            Publish Options
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<PublishIcon />}
              onClick={() => {
                // Immediate publish
                handleScheduleContent();
              }}
            >
              Publish Now
            </Button>
            <Button
              variant="outlined"
              startIcon={<ScheduleIcon />}
              onClick={() => {
                // Schedule for later
                const date = new Date();
                date.setHours(date.getHours() + 1);
                setScheduledDate(date.toISOString().slice(0, 16));
              }}
            >
              Schedule
            </Button>
          </Box>

          {scheduledDate && (
            <TextField
              fullWidth
              type="datetime-local"
              label="Scheduled Date & Time"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              sx={{ mb: 3 }}
            />
          )}

          <Typography variant="subtitle2" gutterBottom>
            Target Platforms
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {platforms.map((platform) => (
              <Chip
                key={platform.id}
                label={`${platform.icon} ${platform.name}`}
                clickable
                color={selectedPlatforms.includes(platform.id) ? 'primary' : 'default'}
                onClick={() => {
                  setSelectedPlatforms((prev: any) =>
                    prev.includes(platform.id)
                      ? prev.filter((p: any) => p !== platform.id)
                      : [...prev, platform.id]
                  );
                }}
              />
            ))}
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="subtitle2" gutterBottom>
              Content Preview
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
              {generatedContent?.content?.substring(0, 150)}...
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {generatedContent?.hashtags?.slice(0, 3).map((tag: string, index: number) => (
                <Chip key={index} label={tag} size="small" />
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  const getStepContent = () => {
    switch (activeStep) {
      case 0:
        return renderInputMethodStep();
      case 1:
        return renderGenerateStep();
      case 2:
        return renderReviewStep();
      case 3:
        return renderScheduleStep();
      default:
        return null;
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { minHeight: '70vh' } }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Generate Content</Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {getStepContent()}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleBack} disabled={activeStep === 0 || isGenerating}>
            Back
          </Button>
          {activeStep < steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={
                isGenerating ||
                (activeStep === 0 && (!inputMethod || (inputMethod === 'text' && !textPrompt.trim())))
              }
            >
              {activeStep === 0 && inputMethod === 'text' ? 'Generate' : 'Next'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleScheduleContent}
              disabled={!generatedContent || selectedPlatforms.length === 0}
            >
              {scheduledDate ? 'Schedule Content' : 'Publish Now'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Sub-dialogs for different input methods */}
      <VoiceToContent
        open={voiceDialogOpen}
        onClose={() => setVoiceDialogOpen(false)}
        onGenerate={handleVoiceContentGenerated}
      />

      <MobileVideoUpload
        open={videoDialogOpen}
        onClose={() => setVideoDialogOpen(false)}
        onUpload={(data) => {
          setGeneratedContent({
            content: data.description || 'AI-generated video content',
            title: data.title,
            platform: selectedPlatforms[0],
            contentType: 'video'
          });
          setVideoDialogOpen(false);
          setActiveStep(2);
        }}
      />

      <TranslationDialog
        open={translationDialogOpen}
        onClose={() => setTranslationDialogOpen(false)}
        initialContent={generatedContent?.content}
        onTranslationComplete={(translatedContent) => {
          setGeneratedContent((prev: any) => ({
            ...prev,
            content: translatedContent
          }));
        }}
      />
    </>
  );
};