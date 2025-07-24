import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Stack,
  Alert,
  Fade,
  Zoom,
  alpha,
  useTheme,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
} from '@mui/material';
import {
  CloudUpload,
  Image,
  VideoFile,
  AudioFile,
  InsertDriveFile,
  Delete,
  Edit,
  Download,
  Share,
  Visibility,
  MoreVert,
  PhotoCamera,
  VideoCall,
  Crop,
  Tune,
  Compress,
  AutoFixHigh,
  CheckCircle,
  Error as ErrorIcon,
  Close,
} from '@mui/icons-material';

interface MediaFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  url?: string;
  thumbnail?: string;
  uploadProgress: number;
  uploadStatus: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  metadata?: {
    dimensions?: { width: number; height: number };
    duration?: number;
    format?: string;
  };
}

interface MediaUploadProps {
  onFilesSelected: (files: MediaFile[]) => void;
  onFileRemove: (fileId: string) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxFileSize?: number; // in MB
  showPreview?: boolean;
  showOptimization?: boolean;
}

const defaultAcceptedTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/mov',
  'video/avi',
  'audio/mp3',
  'audio/wav',
  'audio/aac',
];

const fileTypeIcons: Record<string, React.ReactElement> = {
  'image': <Image color="primary" />,
  'video': <VideoFile color="secondary" />,
  'audio': <AudioFile color="info" />,
  'document': <InsertDriveFile color="action" />,
};

const optimizationSuggestions = [
  'Compress for web',
  'Auto-enhance quality',
  'Generate thumbnails',
  'Convert to optimal format',
];

export const ModernMediaUpload: React.FC<MediaUploadProps> = ({
  onFilesSelected,
  onFileRemove,
  acceptedTypes = defaultAcceptedTypes,
  maxFiles = 10,
  maxFileSize = 50,
  showPreview = true,
  showOptimization = true,
}) => {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{ element: HTMLElement; fileId: string } | null>(null);

  useEffect(() => {
    onFilesSelected(files);
  }, [files, onFilesSelected]);

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles = Array.from(selectedFiles)
      .filter((file) => {
        if (!acceptedTypes.includes(file.type)) return false;
        if (file.size > maxFileSize * 1024 * 1024) return false;
        return true;
      })
      .slice(0, maxFiles - files.length)
      .map((file): MediaFile => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadProgress: 0,
        uploadStatus: 'pending',
      }));

    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles]);
      uploadFiles(newFiles);
    }
  }, [acceptedTypes, maxFileSize, maxFiles, files.length]);

  const uploadFiles = async (filesToUpload: MediaFile[]) => {
    setIsUploading(true);

    for (const file of filesToUpload) {
      try {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, uploadStatus: 'uploading' as const } : f
          )
        );

        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          setFiles((prev) =>
            prev.map((f) =>
              f.id === file.id ? { ...f, uploadProgress: progress } : f
            )
          );
        }

        // Generate preview URL
        const url = URL.createObjectURL(file.file);
        const thumbnail = file.type.startsWith('image/') ? url : undefined;

        // Get metadata for images and videos
        const metadata = await getFileMetadata(file.file);

        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? {
                  ...f,
                  url,
                  thumbnail,
                  metadata,
                  uploadStatus: 'completed' as const,
                  uploadProgress: 100,
                }
              : f
          )
        );
      } catch (error) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? {
                  ...f,
                  uploadStatus: 'error' as const,
                  error: 'Upload failed',
                }
              : f
          )
        );
      }
    }

    setIsUploading(false);
  };

  const getFileMetadata = async (file: File): Promise<MediaFile['metadata']> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.onload = () => {
          resolve({
            dimensions: { width: img.width, height: img.height },
            format: file.type,
          });
        };
        img.onerror = () => resolve({ format: file.type });
        img.src = URL.createObjectURL(file);
      } else if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.onloadedmetadata = () => {
          resolve({
            dimensions: { width: video.videoWidth, height: video.videoHeight },
            duration: video.duration,
            format: file.type,
          });
        };
        video.onerror = () => resolve({ format: file.type });
        video.src = URL.createObjectURL(file);
      } else {
        resolve({ format: file.type });
      }
    });
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleRemoveFile = (fileId: string) => {
    const file = files.find((f) => f.id === fileId);
    if (file?.url) {
      URL.revokeObjectURL(file.url);
    }
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    onFileRemove(fileId);
    setMenuAnchor(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return fileTypeIcons.image;
    if (type.startsWith('video/')) return fileTypeIcons.video;
    if (type.startsWith('audio/')) return fileTypeIcons.audio;
    return fileTypeIcons.document;
  };

  const getStatusColor = (status: MediaFile['uploadStatus']) => {
    switch (status) {
      case 'completed':
        return theme.palette.success.main;
      case 'error':
        return theme.palette.error.main;
      case 'uploading':
        return theme.palette.primary.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Box>
      {/* Drop Zone */}
      <Paper
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          p: 4,
          textAlign: 'center',
          border: `2px dashed ${
            isDragOver ? theme.palette.primary.main : alpha(theme.palette.divider, 0.3)
          }`,
          borderRadius: 3,
          background: isDragOver
            ? alpha(theme.palette.primary.main, 0.04)
            : alpha(theme.palette.background.default, 0.5),
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          '&:hover': {
            borderColor: theme.palette.primary.main,
            background: alpha(theme.palette.primary.main, 0.04),
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 30px ${alpha(theme.palette.primary.main, 0.15)}`,
          },
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          style={{ display: 'none' }}
          onChange={(e) => handleFileSelect(e.target.files)}
        />

        <Zoom in={!isDragOver}>
          <CloudUpload
            sx={{
              fontSize: 48,
              color: theme.palette.primary.main,
              mb: 2,
              transition: 'transform 0.3s ease',
            }}
          />
        </Zoom>

        <Typography
          variant="h6"
          sx={{
            mb: 1,
            fontWeight: 600,
            color: isDragOver ? theme.palette.primary.main : theme.palette.text.primary,
          }}
        >
          {isDragOver ? 'Drop files here' : 'Upload Media'}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Drag and drop files here, or click to browse
        </Typography>

        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<PhotoCamera />}
            size="small"
            sx={{ borderRadius: 2.5 }}
          >
            Photos
          </Button>
          <Button
            variant="outlined"
            startIcon={<VideoCall />}
            size="small"
            sx={{ borderRadius: 2.5 }}
          >
            Videos
          </Button>
        </Stack>

        <Typography variant="caption" color="text.secondary">
          Max {maxFiles} files, up to {maxFileSize}MB each
        </Typography>
      </Paper>

      {/* File List */}
      {files.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip label={files.length} size="small" color="primary" />
            Uploaded Files
          </Typography>

          <Grid container spacing={2}>
            {files.map((file) => (
              <Grid item xs={12} sm={6} md={4} key={file.id}>
                <Card
                  sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8],
                      '& .media-actions': {
                        opacity: 1,
                      },
                    },
                  }}
                >
                  {/* Preview */}
                  <Box
                    sx={{
                      height: 180,
                      position: 'relative',
                      background: alpha(theme.palette.background.default, 0.5),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {file.thumbnail ? (
                      <img
                        src={file.thumbnail}
                        alt={file.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : file.uploadStatus === 'uploading' ? (
                      <Skeleton variant="rectangular" width="100%" height="100%" />
                    ) : (
                      getFileIcon(file.type)
                    )}

                    {/* Status Indicator */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: alpha(theme.palette.background.paper, 0.9),
                        borderRadius: '50%',
                        p: 0.5,
                      }}
                    >
                      {file.uploadStatus === 'completed' && (
                        <CheckCircle sx={{ color: theme.palette.success.main, fontSize: 20 }} />
                      )}
                      {file.uploadStatus === 'error' && (
                        <ErrorIcon sx={{ color: theme.palette.error.main, fontSize: 20 }} />
                      )}
                      {file.uploadStatus === 'uploading' && (
                        <LinearProgress
                          size={20}
                          variant="determinate"
                          value={file.uploadProgress}
                          sx={{ width: 20, height: 20 }}
                        />
                      )}
                    </Box>

                    {/* Action Overlay */}
                    <Fade in>
                      <Box
                        className="media-actions"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: alpha(theme.palette.common.black, 0.6),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1,
                          opacity: 0,
                          transition: 'opacity 0.3s ease',
                        }}
                      >
                        <IconButton
                          size="small"
                          sx={{ color: 'white' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(file);
                            setPreviewDialogOpen(true);
                          }}
                        >
                          <Visibility />
                        </IconButton>
                        {showOptimization && (
                          <IconButton size="small" sx={{ color: 'white' }}>
                            <Tune />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          sx={{ color: 'white' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuAnchor({ element: e.currentTarget, fileId: file.id });
                          }}
                        >
                          <MoreVert />
                        </IconButton>
                      </Box>
                    </Fade>
                  </Box>

                  {/* File Info */}
                  <CardContent sx={{ p: 2 }}>
                    <Typography
                      variant="subtitle2"
                      noWrap
                      sx={{ fontWeight: 600, mb: 0.5 }}
                      title={file.name}
                    >
                      {file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(file.size)}
                      {file.metadata?.dimensions &&
                        ` • ${file.metadata.dimensions.width}×${file.metadata.dimensions.height}`}
                      {file.metadata?.duration &&
                        ` • ${Math.round(file.metadata.duration)}s`}
                    </Typography>

                    {/* Upload Progress */}
                    {file.uploadStatus === 'uploading' && (
                      <LinearProgress
                        variant="determinate"
                        value={file.uploadProgress}
                        sx={{
                          mt: 1,
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        }}
                      />
                    )}

                    {/* Error Message */}
                    {file.uploadStatus === 'error' && file.error && (
                      <Alert severity="error" sx={{ mt: 1, p: 0.5 }}>
                        <Typography variant="caption">{file.error}</Typography>
                      </Alert>
                    )}
                  </CardContent>

                  {/* Optimization Suggestions */}
                  {showOptimization && file.uploadStatus === 'completed' && (
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        size="small"
                        startIcon={<AutoFixHigh />}
                        sx={{ borderRadius: 2 }}
                      >
                        Optimize
                      </Button>
                    </CardActions>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Optimization Panel */}
      {showOptimization && files.some((f) => f.uploadStatus === 'completed') && (
        <Paper sx={{ p: 3, mt: 3, borderRadius: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Compress color="primary" />
            Smart Optimization
          </Typography>
          <Grid container spacing={2}>
            {optimizationSuggestions.map((suggestion, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AutoFixHigh />}
                  sx={{
                    py: 1.5,
                    borderRadius: 2.5,
                    textTransform: 'none',
                    justifyContent: 'flex-start',
                  }}
                >
                  {suggestion}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor?.element}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 180 } }}
      >
        <MenuItem onClick={() => setMenuAnchor(null)}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => setMenuAnchor(null)}>
          <ListItemIcon>
            <Download fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => setMenuAnchor(null)}>
          <ListItemIcon>
            <Share fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuAnchor) {
              handleRemoveFile(menuAnchor.fileId);
            }
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <Delete fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Preview</Typography>
            <IconButton onClick={() => setPreviewDialogOpen(false)}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedFile && (
            <Box sx={{ textAlign: 'center' }}>
              {selectedFile.thumbnail ? (
                <img
                  src={selectedFile.thumbnail}
                  alt={selectedFile.name}
                  style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 8 }}
                />
              ) : (
                <Box
                  sx={{
                    height: 300,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px dashed ${theme.palette.divider}`,
                    borderRadius: 2,
                  }}
                >
                  {getFileIcon(selectedFile.type)}
                </Box>
              )}
              <Typography variant="h6" sx={{ mt: 2 }}>
                {selectedFile.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatFileSize(selectedFile.size)}
                {selectedFile.metadata?.dimensions &&
                  ` • ${selectedFile.metadata.dimensions.width}×${selectedFile.metadata.dimensions.height}`}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};