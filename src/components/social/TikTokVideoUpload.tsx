/**
 * TikTok Video Upload Component
 * 
 * Handles video upload and publishing to TikTok with video preview,
 * metadata configuration, and publishing options.
 * 
 * @component TikTokVideoUpload
 * @version 1.0.0
 * 
 * @features
 * - Video file upload with drag & drop support
 * - Video preview with duration validation
 * - Caption and hashtag management
 * - Privacy level selection
 * - Content settings (comments, duets, stitching)
 * - Publishing to connected TikTok accounts
 * - Upload progress tracking
 * - Error handling and validation
 * 
 * @props
 * - connections: TikTokConnection[] - Connected TikTok accounts
 * - onUploadSuccess: (result: UploadResult) => void - Success callback
 * - onUploadError: (error: string) => void - Error callback
 * - defaultCaption?: string - Pre-filled caption text
 * - defaultHashtags?: string[] - Pre-filled hashtags
 * 
 * @video_requirements
 * - Format: MP4, MOV, WEBM
 * - Duration: 3-60 seconds
 * - Size: Maximum 128MB
 * - Aspect Ratio: 9:16 recommended
 * - Resolution: 720x1280 to 1080x1920
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  Stack,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Avatar,
  Divider,
} from '@mui/material';
import {
  CloudUpload,
  VideoLibrary,
  PlayArrow,
  Pause,
  Delete,
  Add,
  CheckCircle,
  Error as ErrorIcon,
  Info,
  Settings,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { usePublishContentMutation } from '../../store/api/socialPlatformsApi';

interface TikTokConnection {
  id: string;
  accountName: string;
  accountHandle: string;
  profileImageUrl?: string;
  followerCount?: number;
  isActive: boolean;
}

interface TikTokVideoUploadProps {
  connections: TikTokConnection[];
  onUploadSuccess: (result: any) => void;
  onUploadError: (error: string) => void;
  defaultCaption?: string;
  defaultHashtags?: string[];
}

interface VideoFile {
  file: File;
  preview: string;
  duration?: number;
  dimensions?: { width: number; height: number };
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  message: string;
}

/**
 * TikTok Video Upload Component
 * 
 * Comprehensive video upload interface for TikTok with metadata management
 * and publishing controls.
 */
const TikTokVideoUpload: React.FC<TikTokVideoUploadProps> = ({
  connections,
  onUploadSuccess,
  onUploadError,
  defaultCaption = '',
  defaultHashtags = [],
}) => {
  // State Management
  const [videoFile, setVideoFile] = useState<VideoFile | null>(null);
  const [caption, setCaption] = useState(defaultCaption);
  const [hashtags, setHashtags] = useState<string[]>(defaultHashtags);
  const [newHashtag, setNewHashtag] = useState('');
  const [selectedConnection, setSelectedConnection] = useState<string>('');
  const [privacyLevel, setPrivacyLevel] = useState<'PUBLIC_TO_EVERYONE' | 'FOLLOWER_OF_CREATOR' | 'SELF_ONLY'>('PUBLIC_TO_EVERYONE');
  const [settings, setSettings] = useState({
    commentDisabled: false,
    duetDisabled: false,
    stitchDisabled: false,
    autoAddMusic: false,
  });
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    status: 'idle',
    message: '',
  });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);

  // RTK Query
  const [publishContent] = usePublishContentMutation();

  // Video Upload Validation
  const validateVideo = useCallback((file: File): Promise<VideoFile> => {
    return new Promise((resolve, reject) => {
      // Check file size (128MB limit)
      if (file.size > 128 * 1024 * 1024) {
        reject(new Error('Video file must be less than 128MB'));
        return;
      }

      // Check file type
      const allowedTypes = ['video/mp4', 'video/mov', 'video/webm', 'video/quicktime'];
      if (!allowedTypes.includes(file.type)) {
        reject(new Error('Video must be MP4, MOV, or WEBM format'));
        return;
      }

      // Create video element to check duration and dimensions
      const video = document.createElement('video');
      const url = URL.createObjectURL(file);
      
      video.onloadedmetadata = () => {
        const duration = video.duration;
        const width = video.videoWidth;
        const height = video.videoHeight;

        // Check duration (3-60 seconds)
        if (duration < 3) {
          URL.revokeObjectURL(url);
          reject(new Error('Video must be at least 3 seconds long'));
          return;
        }
        
        if (duration > 60) {
          URL.revokeObjectURL(url);
          reject(new Error('Video must be less than 60 seconds long'));
          return;
        }

        // Check dimensions
        if (width < 480 || height < 640) {
          URL.revokeObjectURL(url);
          reject(new Error('Video resolution must be at least 480x640'));
          return;
        }

        resolve({
          file,
          preview: url,
          duration,
          dimensions: { width, height },
        });
      };

      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Invalid video file'));
      };

      video.src = url;
    });
  }, []);

  // Dropzone Configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'video/*': ['.mp4', '.mov', '.webm'],
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      try {
        const validatedVideo = await validateVideo(acceptedFiles[0]);
        setVideoFile(validatedVideo);
      } catch (error) {
        onUploadError(error instanceof Error ? error.message : 'Invalid video file');
      }
    },
  });

  // Hashtag Management
  const addHashtag = () => {
    if (newHashtag.trim() && !hashtags.includes(newHashtag.trim()) && hashtags.length < 30) {
      setHashtags([...hashtags, newHashtag.trim()]);
      setNewHashtag('');
    }
  };

  const removeHashtag = (hashtag: string) => {
    setHashtags(hashtags.filter(h => h !== hashtag));
  };

  // Video Controls
  const togglePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Video Upload and Publishing
  const handleUpload = async () => {
    if (!videoFile || !selectedConnection) {
      onUploadError('Please select a video file and TikTok account');
      return;
    }

    if (!caption.trim()) {
      onUploadError('Please add a caption for your video');
      return;
    }

    setUploadState({
      isUploading: true,
      progress: 0,
      status: 'uploading',
      message: 'Uploading video to TikTok...',
    });

    try {
      // Convert file to base64 for upload
      const reader = new FileReader();
      reader.onload = async (e) => {
        const videoData = e.target?.result as string;
        const base64Data = videoData.split(',')[1]; // Remove data:video/mp4;base64, prefix

        try {
          const result = await publishContent({
            connectionId: selectedConnection,
            content: {
              text: caption,
              mediaType: 'video',
              hashtags,
            },
            publishOptions: {
              publishNow: true,
            },
            // TikTok specific data
            platform: 'tiktok',
            videoData: base64Data,
            videoInfo: {
              title: caption.substring(0, 150), // TikTok title limit
              description: caption,
              privacyLevel,
              commentDisabled: settings.commentDisabled,
              duetDisabled: settings.duetDisabled,
              stitchDisabled: settings.stitchDisabled,
              autoAddMusic: settings.autoAddMusic,
              hashtags,
            },
          }).unwrap();

          setUploadState({
            isUploading: false,
            progress: 100,
            status: 'success',
            message: 'Video uploaded successfully!',
          });

          onUploadSuccess(result);

          // Reset form
          setTimeout(() => {
            setVideoFile(null);
            setCaption('');
            setHashtags([]);
            setUploadState({
              isUploading: false,
              progress: 0,
              status: 'idle',
              message: '',
            });
          }, 3000);
        } catch (error: any) {
          setUploadState({
            isUploading: false,
            progress: 0,
            status: 'error',
            message: error.message || 'Failed to upload video',
          });
          onUploadError(error.message || 'Failed to upload video');
        }
      };

      reader.readAsDataURL(videoFile.file);
    } catch (error: any) {
      setUploadState({
        isUploading: false,
        progress: 0,
        status: 'error',
        message: error.message || 'Failed to upload video',
      });
      onUploadError(error.message || 'Failed to upload video');
    }
  };

  // Remove Video
  const removeVideo = () => {
    if (videoFile) {
      URL.revokeObjectURL(videoFile.preview);
      setVideoFile(null);
    }
  };

  // Get aspect ratio recommendation
  const getAspectRatioRecommendation = () => {
    if (!videoFile?.dimensions) return null;
    
    const { width, height } = videoFile.dimensions;
    const ratio = width / height;
    
    if (Math.abs(ratio - 9/16) < 0.1) return { type: 'excellent', text: 'Perfect 9:16 aspect ratio' };
    if (Math.abs(ratio - 1) < 0.1) return { type: 'good', text: 'Square format (1:1) - good for TikTok' };
    if (ratio < 1) return { type: 'warning', text: 'Vertical video - good for TikTok' };
    return { type: 'error', text: 'Horizontal video - not recommended for TikTok' };
  };

  const aspectRatioRec = getAspectRatioRecommendation();

  return (
    <Card>
      <CardHeader
        title="Upload to TikTok"
        subheader="Share your video content on TikTok"
        avatar={<VideoLibrary color="primary" />}
      />
      
      <CardContent>
        {/* Video Upload Area */}
        {!videoFile ? (
          <Paper
            {...getRootProps()}
            sx={{
              p: 4,
              textAlign: 'center',
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              bgcolor: isDragActive ? 'primary.50' : 'grey.50',
              cursor: 'pointer',
              mb: 3,
            }}
          >
            <input {...getInputProps()} />
            <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive ? 'Drop your video here' : 'Upload TikTok Video'}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Drop a video file or click to browse
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Supported formats: MP4, MOV, WEBM • Max size: 128MB • Duration: 3-60 seconds
            </Typography>
          </Paper>
        ) : (
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  {videoFile.file.name}
                </Typography>
                <Tooltip title="Preview Video">
                  <IconButton onClick={() => setPreviewOpen(true)}>
                    <PlayArrow />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Remove Video">
                  <IconButton onClick={removeVideo} color="error">
                    <Delete />
                  </IconButton>
                </Tooltip>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Duration: {videoFile.duration?.toFixed(1)}s
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Size: {(videoFile.file.size / (1024 * 1024)).toFixed(1)}MB
                  </Typography>
                </Grid>
                {videoFile.dimensions && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Resolution: {videoFile.dimensions.width}x{videoFile.dimensions.height}
                    </Typography>
                  </Grid>
                )}
              </Grid>

              {/* Aspect Ratio Recommendation */}
              {aspectRatioRec && (
                <Alert 
                  severity={
                    aspectRatioRec.type === 'excellent' || aspectRatioRec.type === 'good' ? 'success' :
                    aspectRatioRec.type === 'warning' ? 'warning' : 'error'
                  }
                  sx={{ mt: 2 }}
                >
                  {aspectRatioRec.text}
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Account Selection */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>TikTok Account</InputLabel>
          <Select
            value={selectedConnection}
            label="TikTok Account"
            onChange={(e) => setSelectedConnection(e.target.value)}
          >
            {connections.map((connection) => (
              <MenuItem key={connection.id} value={connection.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar 
                    src={connection.profileImageUrl} 
                    sx={{ width: 24, height: 24 }}
                  >
                    {connection.accountName.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2">{connection.accountName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      @{connection.accountHandle} • {connection.followerCount?.toLocaleString()} followers
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Caption */}
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          helperText={`${caption.length}/2200 characters`}
          inputProps={{ maxLength: 2200 }}
          sx={{ mb: 3 }}
        />

        {/* Hashtags */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Hashtags ({hashtags.length}/30)
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              size="small"
              label="Add hashtag"
              value={newHashtag}
              onChange={(e) => setNewHashtag(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addHashtag();
                }
              }}
              sx={{ flexGrow: 1 }}
            />
            <Button 
              variant="outlined" 
              onClick={addHashtag}
              disabled={!newHashtag.trim() || hashtags.length >= 30}
            >
              <Add />
            </Button>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {hashtags.map((hashtag) => (
              <Chip
                key={hashtag}
                label={`#${hashtag}`}
                onDelete={() => removeHashtag(hashtag)}
                size="small"
              />
            ))}
          </Stack>
        </Box>

        {/* Privacy and Settings */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Privacy Level</InputLabel>
              <Select
                value={privacyLevel}
                label="Privacy Level"
                onChange={(e) => setPrivacyLevel(e.target.value as any)}
              >
                <MenuItem value="PUBLIC_TO_EVERYONE">Public</MenuItem>
                <MenuItem value="FOLLOWER_OF_CREATOR">Followers Only</MenuItem>
                <MenuItem value="SELF_ONLY">Private</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" gutterBottom>
              Content Settings
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={!settings.commentDisabled}
                  onChange={(e) => setSettings({ ...settings, commentDisabled: !e.target.checked })}
                />
              }
              label="Allow Comments"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={!settings.duetDisabled}
                  onChange={(e) => setSettings({ ...settings, duetDisabled: !e.target.checked })}
                />
              }
              label="Allow Duets"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={!settings.stitchDisabled}
                  onChange={(e) => setSettings({ ...settings, stitchDisabled: !e.target.checked })}
                />
              }
              label="Allow Stitching"
            />
          </Grid>
        </Grid>

        {/* Upload Status */}
        {uploadState.status !== 'idle' && (
          <Alert 
            severity={
              uploadState.status === 'success' ? 'success' :
              uploadState.status === 'error' ? 'error' : 'info'
            }
            sx={{ mb: 3 }}
            icon={
              uploadState.status === 'success' ? <CheckCircle /> :
              uploadState.status === 'error' ? <ErrorIcon /> : <Info />
            }
          >
            {uploadState.message}
            {uploadState.isUploading && (
              <LinearProgress sx={{ mt: 1 }} variant="indeterminate" />
            )}
          </Alert>
        )}

        {/* Upload Button */}
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleUpload}
          disabled={!videoFile || !selectedConnection || uploadState.isUploading || !caption.trim()}
          sx={{ mb: 2 }}
        >
          {uploadState.isUploading ? 'Uploading...' : 'Upload to TikTok'}
        </Button>

        {/* TikTok Guidelines */}
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>TikTok Best Practices:</Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2, m: 0 }}>
            <li>Use vertical 9:16 aspect ratio for best results</li>
            <li>Keep videos between 15-30 seconds for optimal engagement</li>
            <li>Add trending sounds and hashtags</li>
            <li>Create engaging content in the first 3 seconds</li>
            <li>Use clear, high-quality video with good lighting</li>
          </Typography>
        </Alert>
      </CardContent>

      {/* Video Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Video Preview</DialogTitle>
        <DialogContent>
          {videoFile && (
            <Box sx={{ position: 'relative', textAlign: 'center' }}>
              <video
                ref={videoRef}
                src={videoFile.preview}
                style={{
                  width: '100%',
                  maxHeight: '60vh',
                  borderRadius: 8,
                }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                controls
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default TikTokVideoUpload;