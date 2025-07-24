import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  TextField,
  Grid,
  Fab,
  Slide,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  VideoCall as VideoIcon,
  Upload as UploadIcon,
  Close as CloseIcon,
  Stop as StopIcon,
  Send as SendIcon,
  AutoAwesome as AIIcon,
  Translate as TranslateIcon,
  Subtitles as CaptionsIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import { useTenant } from '../../contexts/TenantContext';
import { useGenerateVideoCaptionsMutation, useGenerateContentMutation } from '../../store/api/aiContentApi';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface VideoUploadData {
  file?: File;
  recordedBlob?: Blob;
  thumbnail?: string;
  duration?: number;
  title?: string;
  description?: string;
  platforms?: string[];
  aiEnhancements?: {
    autoCaptions: boolean;
    translation: boolean;
    backgroundMusic: boolean;
    thumbnailGeneration: boolean;
  };
}

interface MobileVideoUploadProps {
  open: boolean;
  onClose: () => void;
  onUpload?: (data: VideoUploadData) => void;
}

const platformOptions = [
  { id: 'youtube', name: 'YouTube', color: '#FF0000' },
  { id: 'instagram', name: 'Instagram', color: '#E4405F' },
  { id: 'tiktok', name: 'TikTok', color: '#000000' },
  { id: 'twitter', name: 'Twitter', color: '#1DA1F2' },
  { id: 'facebook', name: 'Facebook', color: '#1877F2' }
];

export const MobileVideoUpload: React.FC<MobileVideoUploadProps> = ({
  open,
  onClose,
  onUpload
}) => {
  const [step, setStep] = useState<'capture' | 'process' | 'review'>('capture');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoData, setVideoData] = useState<VideoUploadData>({});
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['youtube']);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { currentWorkspace } = useTenant();
  
  // AI API hooks
  const [generateVideoCaptions] = useGenerateVideoCaptionsMutation();
  const [generateContent] = useGenerateContentMutation();

  // AI processing with real APIs
  const processVideoWithAI = useCallback(async (videoFile: File | Blob) => {
    if (!currentWorkspace) {
      console.error('No workspace selected');
      return;
    }

    setStep('process');

    try {
      // Convert Blob to File if needed
      const file = videoFile instanceof File ? videoFile : new File([videoFile], 'recorded-video.webm', { type: 'video/webm' });

      // Step 1: Generate video captions (20-40%)
      setUploadProgress(20);
      let captions: any[] = [];
      try {
        const captionsResult = await generateVideoCaptions({
          video: file,
          workspaceId: currentWorkspace.id,
          platform: selectedPlatforms[0] || 'youtube'
        }).unwrap();
        captions = captionsResult.captions;
        setUploadProgress(40);
      } catch (error) {
        console.error('Caption generation failed:', error);
        setUploadProgress(40);
      }

      // Step 2: Generate content description (40-80%)
      setUploadProgress(60);
      let contentData = {
        title: 'Engaging Video Content',
        description: 'AI-generated content tailored to your brand voice and audience.'
      };

      try {
        // Create a prompt from captions or use fallback
        const prompt = captions.length > 0 
          ? `Create engaging content for this video: ${captions.map(c => c.text).join(' ')}`
          : `Create engaging ${currentWorkspace.client.industry || 'general'} video content for ${currentWorkspace.branding.targetAudience}`;

        const contentResult = await generateContent({
          prompt,
          platform: selectedPlatforms[0] || 'youtube',
          contentType: 'video',
          workspaceId: currentWorkspace.id
        }).unwrap();

        contentData = {
          title: contentResult.title || 'Engaging Video Content',
          description: contentResult.content
        };
        setUploadProgress(80);
      } catch (error) {
        console.error('Content generation failed:', error);
        setUploadProgress(80);
      }

      // Step 3: Finalize (80-100%)
      setUploadProgress(90);
      
      const aiGeneratedData = {
        ...contentData,
        aiEnhancements: {
          autoCaptions: captions.length > 0,
          translation: false,
          backgroundMusic: false,
          thumbnailGeneration: true
        }
      };

      setVideoData(prev => ({ ...prev, ...aiGeneratedData }));
      setUploadProgress(100);
      
      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setStep('review');
    } catch (error) {
      console.error('Video processing error:', error);
      
      // Fallback to basic content
      const fallbackData = {
        title: 'Video Content',
        description: `🎥 New video content for ${currentWorkspace.name}!\n\nCheck out our latest content created with AI assistance.\n\n#content #video #${currentWorkspace.client.industry?.toLowerCase().replace(/\s+/g, '') || 'business'}`,
        aiEnhancements: {
          autoCaptions: false,
          translation: false,
          backgroundMusic: false,
          thumbnailGeneration: false
        }
      };
      
      setVideoData(prev => ({ ...prev, ...fallbackData }));
      setStep('review');
    }
  }, [currentWorkspace, selectedPlatforms, generateVideoCaptions, generateContent]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const recordedBlob = new Blob(chunks, { type: 'video/webm' });
        setVideoData(prev => ({ ...prev, recordedBlob }));
        processVideoWithAI(recordedBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      // Start recording timer
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Auto-stop after 60 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopRecording();
        }
        clearInterval(timer);
      }, 60000);

    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoData(prev => ({ ...prev, file }));
      processVideoWithAI(file);
    }
  };

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleSubmit = () => {
    const finalData = {
      ...videoData,
      platforms: selectedPlatforms
    };
    onUpload?.(finalData);
    onClose();
    // Reset state
    setStep('capture');
    setVideoData({});
    setSelectedPlatforms(['youtube']);
    setUploadProgress(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderCaptureStep = () => (
    <Box sx={{ textAlign: 'center', p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Create Content
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Record a video or upload from your device
      </Typography>

      {/* Camera Preview */}
      <Paper 
        sx={{ 
          position: 'relative', 
          mb: 3, 
          borderRadius: 2,
          overflow: 'hidden',
          aspectRatio: '9/16',
          maxHeight: 300,
          bgcolor: 'black'
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        
        {isRecording && (
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: 'rgba(255, 0, 0, 0.8)',
              color: 'white',
              px: 2,
              py: 1,
              borderRadius: 2
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'white',
                animation: 'blink 1s infinite'
              }}
            />
            <Typography variant="caption" fontWeight="bold">
              REC {formatTime(recordingTime)}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Recording Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
        {!isRecording ? (
          <>
            <Fab
              color="primary"
              onClick={startRecording}
              sx={{ width: 64, height: 64 }}
            >
              <VideoIcon />
            </Fab>
            <Fab
              color="secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadIcon />
            </Fab>
          </>
        ) : (
          <Fab
            color="error"
            onClick={stopRecording}
            sx={{ width: 64, height: 64 }}
          >
            <StopIcon />
          </Fab>
        )}
      </Box>

      {/* Current Workspace Context */}
      {currentWorkspace && (
        <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
          <Typography variant="subtitle2" gutterBottom>
            Creating for
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar 
              sx={{ 
                width: 24, 
                height: 24, 
                bgcolor: currentWorkspace.branding.brandColors.primary 
              }}
            >
              {currentWorkspace.name.charAt(0)}
            </Avatar>
            <Typography variant="body2">
              {currentWorkspace.name}
            </Typography>
            <Chip 
              label={currentWorkspace.branding.toneOfVoice}
              size="small"
              variant="outlined"
            />
          </Box>
        </Paper>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />
    </Box>
  );

  const renderProcessStep = () => (
    <Box sx={{ textAlign: 'center', p: 3 }}>
      <Typography variant="h6" gutterBottom>
        AI Processing
      </Typography>
      
      <Box sx={{ my: 4 }}>
        <AIIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="body1" gutterBottom>
          Enhancing your video with AI...
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={uploadProgress}
          sx={{ my: 2, height: 8, borderRadius: 4 }}
        />
        <Typography variant="body2" color="text.secondary">
          {uploadProgress}% complete
        </Typography>
      </Box>

      <List dense>
        <ListItem>
          <ListItemIcon>
            <CaptionsIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Generating auto-captions with Claude AI" />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <EditIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Creating thumbnail options" />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <TranslateIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Optimizing for social platforms" />
        </ListItem>
      </List>
    </Box>
  );

  const renderReviewStep = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Review & Publish
      </Typography>

      {/* Content Preview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            label="Title"
            value={videoData.title || ''}
            onChange={(e) => setVideoData(prev => ({ ...prev, title: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description"
            value={videoData.description || ''}
            onChange={(e) => setVideoData(prev => ({ ...prev, description: e.target.value }))}
          />
        </CardContent>
      </Card>

      {/* AI Enhancements */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            AI Enhancements
          </Typography>
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Auto-generate captions"
          />
          <FormControlLabel
            control={<Switch />}
            label="Translate to multiple languages"
          />
          <FormControlLabel
            control={<Switch />}
            label="Add background music"
          />
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Generate thumbnails"
          />
        </CardContent>
      </Card>

      {/* Platform Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Publish to Platforms
          </Typography>
          <Grid container spacing={1}>
            {platformOptions.map((platform) => (
              <Grid item xs={6} key={platform.id}>
                <Button
                  variant={selectedPlatforms.includes(platform.id) ? 'contained' : 'outlined'}
                  onClick={() => handlePlatformToggle(platform.id)}
                  size="small"
                  fullWidth
                  sx={{
                    bgcolor: selectedPlatforms.includes(platform.id) ? platform.color : 'transparent',
                    borderColor: platform.color,
                    color: selectedPlatforms.includes(platform.id) ? 'white' : platform.color,
                    '&:hover': {
                      bgcolor: platform.color,
                      color: 'white'
                    }
                  }}
                >
                  {platform.name}
                </Button>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">Mobile Video Upload</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {step === 'capture' && renderCaptureStep()}
        {step === 'process' && renderProcessStep()}
        {step === 'review' && renderReviewStep()}
      </DialogContent>

      {step === 'review' && (
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setStep('capture')}
            variant="outlined"
          >
            Back
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            startIcon={<SendIcon />}
            disabled={selectedPlatforms.length === 0}
          >
            Schedule & Publish
          </Button>
        </DialogActions>
      )}

      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </Dialog>
  );
};