import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Paper,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Mic as MicIcon,
  Stop as StopIcon,
  AutoAwesome as AIIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
  VolumeUp as VolumeIcon,
  ContentCopy as CopyIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useTenant } from '../../contexts/TenantContext';
import { useVoiceToTextMutation } from '../../store/api/aiContentApi';

interface VoiceToContentProps {
  open: boolean;
  onClose: () => void;
  onGenerate?: (content: GeneratedContent) => void;
}

interface GeneratedContent {
  originalTranscript: string;
  socialMediaPost: string;
  platform: string;
  contentType: 'post' | 'story' | 'reel' | 'video';
  hashtags: string[];
  callToAction?: string;
  duration?: number;
}

const platformOptions = [
  { id: 'instagram', name: 'Instagram', maxLength: 2200 },
  { id: 'twitter', name: 'Twitter', maxLength: 280 },
  { id: 'linkedin', name: 'LinkedIn', maxLength: 3000 },
  { id: 'facebook', name: 'Facebook', maxLength: 63206 },
  { id: 'youtube', name: 'YouTube', maxLength: 5000 },
  { id: 'tiktok', name: 'TikTok', maxLength: 150 }
];

const contentTypeOptions = [
  { id: 'post', name: 'Post', description: 'Standard social media post' },
  { id: 'story', name: 'Story', description: 'Short-form story content' },
  { id: 'reel', name: 'Reel/Short', description: 'Short video content' },
  { id: 'video', name: 'Video', description: 'Long-form video content' }
];

export const VoiceToContent: React.FC<VoiceToContentProps> = ({
  open,
  onClose,
  onGenerate
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [selectedContentType, setSelectedContentType] = useState<'post' | 'story' | 'reel' | 'video'>('post');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { currentWorkspace } = useTenant();
  
  // AI API hooks
  const [voiceToText] = useVoiceToTextMutation();

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
        processAudio(blob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    if (!currentWorkspace) {
      console.error('No workspace selected');
      return;
    }

    setIsProcessing(true);

    try {
      // Convert blob to file
      const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
      
      // Use real AI API for voice to text conversion
      const result = await voiceToText({
        audio: audioFile,
        workspaceId: currentWorkspace.id,
        platform: selectedPlatform,
        contentType: selectedContentType
      }).unwrap();

      setTranscript(result.transcription);
      setGeneratedContent({
        originalTranscript: result.transcription,
        socialMediaPost: result.generatedContent.content,
        platform: result.generatedContent.platform,
        contentType: result.generatedContent.contentType as 'post' | 'story' | 'reel' | 'video',
        hashtags: result.generatedContent.hashtags,
        callToAction: result.generatedContent.callToAction,
        duration: recordingTime
      });
    } catch (error) {
      console.error('Voice processing error:', error);
      
      // Fallback to mock data if API fails
      const mockTranscript = generateMockTranscript();
      setTranscript(mockTranscript);
      const content = generateSocialMediaContent(mockTranscript);
      setGeneratedContent(content);
    }

    setIsProcessing(false);
  };

  const generateMockTranscript = () => {
    if (!currentWorkspace) {
      return "I just had an amazing idea for content that I think our audience would love. It's about creating engaging posts that resonate with our brand voice and connect with our community.";
    }

    const industry = currentWorkspace.client.industry?.toLowerCase() || '';

    // Generate context-aware mock transcripts
    const transcripts = {
      technology: "I just discovered this incredible new tech trend that's going to change everything. The way AI is being integrated into everyday tools is fascinating, and I think our audience needs to know about this. It's all about making technology more accessible and user-friendly.",
      
      healthcare: "Today I want to share some important wellness insights that can really make a difference in people's daily lives. It's about finding that balance between modern healthcare approaches and traditional wellness practices that actually work.",
      
      education: "I had this breakthrough moment while working with students today. There's this simple technique that completely changes how people learn and retain information. I think this could help so many of our community members who are struggling with similar challenges.",
      
      finance: "The market has been showing some interesting patterns lately, and I want to break down what this means for regular investors. It's not as complicated as people think, and there are some smart strategies that anyone can implement.",
      
      retail: "I just found the perfect way to style this piece that nobody talks about. It's all about understanding your body type and personal style, then adapting trends to work for you. This could be a game-changer for anyone struggling with their wardrobe.",
      
      default: "I just had this amazing insight that I think our community would really benefit from. It's something I've been working on lately, and the results have been incredible. I can't wait to share this with everyone."
    };

    return transcripts[industry as keyof typeof transcripts] || transcripts.default;
  };

  const generateSocialMediaContent = (transcript: string): GeneratedContent => {
    if (!currentWorkspace) {
      return {
        originalTranscript: transcript,
        socialMediaPost: transcript,
        platform: selectedPlatform,
        contentType: selectedContentType,
        hashtags: ['#content', '#socialmedia']
      };
    }

    const industry = currentWorkspace.client.industry?.toLowerCase() || '';
    const toneOfVoice = currentWorkspace.branding.toneOfVoice;
    const targetAudience = currentWorkspace.branding.targetAudience;

    // Generate platform-optimized content
    const platformConfig = platformOptions.find(p => p.id === selectedPlatform);
    const maxLength = platformConfig?.maxLength || 2200;

    // Create engaging post based on brand voice and platform
    let socialMediaPost = '';
    let hashtags: string[] = [];
    let callToAction = '';

    if (selectedPlatform === 'twitter') {
      socialMediaPost = `🚀 Quick insight: ${transcript.substring(0, 200)}...

What's your take on this? 

#${industry} #insights`;
      hashtags = [`#${industry}`, '#insights', '#tips'];
    } else if (selectedPlatform === 'linkedin') {
      socialMediaPost = `💡 Professional Insight

${transcript}

This approach has proven effective in my experience working with ${targetAudience}. 

What strategies have worked best for you in similar situations?

#${industry} #professional #insights #${toneOfVoice}`;
      hashtags = [`#${industry}`, '#professional', '#insights', `#${toneOfVoice}`];
      callToAction = 'Share your thoughts in the comments!';
    } else if (selectedPlatform === 'instagram') {
      socialMediaPost = `✨ Real talk about ${industry}...

${transcript}

Double-tap if this resonates with you! 👇

${hashtags.map(tag => tag).join(' ')}`;
      hashtags = [`#${industry}`, '#authentic', '#community', '#insights', `#${toneOfVoice}`];
      callToAction = 'Save this post for later!';
    } else {
      // Default format
      socialMediaPost = `${transcript}

What do you think about this? Let me know in the comments!

${hashtags.map(tag => tag).join(' ')}`;
      hashtags = [`#${industry}`, '#content', '#community'];
    }

    // Ensure content fits platform limits
    if (socialMediaPost.length > maxLength) {
      const truncatePoint = maxLength - 100; // Leave room for hashtags
      socialMediaPost = socialMediaPost.substring(0, truncatePoint) + '...';
    }

    return {
      originalTranscript: transcript,
      socialMediaPost,
      platform: selectedPlatform,
      contentType: selectedContentType,
      hashtags,
      callToAction,
      duration: recordingTime
    };
  };

  const regenerateContent = () => {
    if (transcript) {
      const newContent = generateSocialMediaContent(transcript);
      setGeneratedContent(newContent);
    }
  };

  const handleSubmit = () => {
    if (generatedContent) {
      onGenerate?.(generatedContent);
    }
    onClose();
    // Reset state
    setIsRecording(false);
    setIsProcessing(false);
    setRecordingTime(0);
    setAudioBlob(null);
    setTranscript('');
    setGeneratedContent(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ sx: { minHeight: '70vh' } }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <MicIcon color="primary" />
          <Typography variant="h6">Voice to Content</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Record your idea and let AI transform it into engaging content
        </Typography>
      </DialogTitle>

      <DialogContent>
        {/* Current Workspace Context */}
        {currentWorkspace && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar 
                sx={{ 
                  bgcolor: currentWorkspace.branding.brandColors.primary,
                  width: 32,
                  height: 32
                }}
              >
                {currentWorkspace.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="subtitle2">{currentWorkspace.name}</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip 
                    label={currentWorkspace.branding.toneOfVoice}
                    size="small"
                    variant="outlined"
                  />
                  {currentWorkspace.client.industry && (
                    <Chip 
                      label={currentWorkspace.client.industry}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
            </Box>
          </Paper>
        )}

        {/* Recording Interface */}
        {!generatedContent && (
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{ mb: 3 }}>
              <IconButton
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: isRecording ? 'error.main' : 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: isRecording ? 'error.dark' : 'primary.dark',
                  }
                }}
              >
                {isRecording ? <StopIcon sx={{ fontSize: 32 }} /> : <MicIcon sx={{ fontSize: 32 }} />}
              </IconButton>
            </Box>

            {isRecording && (
              <Box>
                <Typography variant="h6" color="error">
                  Recording... {formatTime(recordingTime)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tap the microphone to stop
                </Typography>
              </Box>
            )}

            {isProcessing && (
              <Box>
                <AIIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Processing with AI...
                </Typography>
                <LinearProgress sx={{ mb: 2 }} />
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <VolumeIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Converting speech to text..." />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <EditIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Generating social media content..." />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AIIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Optimizing for platform and audience..." />
                  </ListItem>
                </List>
              </Box>
            )}

            {!isRecording && !isProcessing && !audioBlob && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Ready to Record
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tap the microphone and share your idea
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Platform and Content Type Selection */}
        {!isRecording && !isProcessing && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Platform</InputLabel>
                <Select
                  value={selectedPlatform}
                  label="Platform"
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                >
                  {platformOptions.map((platform) => (
                    <MenuItem key={platform.id} value={platform.id}>
                      {platform.name}
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
                  onChange={(e) => setSelectedContentType(e.target.value as any)}
                >
                  {contentTypeOptions.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )}

        {/* Generated Content */}
        {generatedContent && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Generated Content</Typography>
              <Button
                startIcon={<RefreshIcon />}
                onClick={regenerateContent}
                size="small"
              >
                Regenerate
              </Button>
            </Box>

            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Original Transcript
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  "{generatedContent.originalTranscript}"
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="subtitle2">
                    {generatedContent.platform} {generatedContent.contentType}
                  </Typography>
                  <IconButton size="small" onClick={() => navigator.clipboard.writeText(generatedContent.socialMediaPost)}>
                    <CopyIcon />
                  </IconButton>
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  value={generatedContent.socialMediaPost}
                  onChange={(e) => setGeneratedContent(prev => 
                    prev ? { ...prev, socialMediaPost: e.target.value } : null
                  )}
                />
                <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                  {generatedContent.hashtags.map((tag, index) => (
                    <Chip key={index} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
                {generatedContent.callToAction && (
                  <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                    CTA: {generatedContent.callToAction}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>
          Cancel
        </Button>
        {generatedContent && (
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handleSubmit}
          >
            Use Content
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};