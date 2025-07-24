import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Folder as FolderIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Image as ImageIcon,
  VideoFile as VideoIcon,
  AudioFile as AudioIcon,
  Description as DocumentIcon
} from '@mui/icons-material';

import { MediaLibrarySimple } from '../../components/media/MediaLibrarySimple';
import {
  useGetMediaStatsQuery,
  useGetRecentMediaQuery,
  useGetMediaUsageQuery,
  type MediaFile
} from '../../store/api/mediaApi';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`media-tabpanel-${index}`}
      aria-labelledby={`media-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

export const MediaPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [previewDialog, setPreviewDialog] = useState<MediaFile | null>(null);

  // API queries
  const { data: statsData, isLoading: statsLoading } = useGetMediaStatsQuery();
  const { data: recentData } = useGetRecentMediaQuery({ limit: 10 });
  const { data: usageData } = useGetMediaUsageQuery({ days: 30 });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon color="primary" />;
      case 'video': return <VideoIcon color="secondary" />;
      case 'audio': return <AudioIcon color="success" />;
      case 'document': return <DocumentIcon color="warning" />;
      default: return <DocumentIcon />;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Media Library
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your media files, images, videos, and documents
        </Typography>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab 
              label="Library" 
              icon={<FolderIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Analytics" 
              icon={<AnalyticsIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Recent" 
              icon={<UploadIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Settings" 
              icon={<SettingsIcon />} 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Library Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ height: 'calc(100vh - 200px)' }}>
            <MediaLibrarySimple />
          </Box>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ p: 3 }}>
            {statsLoading ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <LinearProgress />
                <Typography sx={{ mt: 2 }}>Loading analytics...</Typography>
              </Box>
            ) : statsData ? (
              <Grid container spacing={3}>
                {/* Storage Overview */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Storage Usage
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">
                            Used: {formatFileSize(statsData.storageUsed)}
                          </Typography>
                          <Typography variant="body2">
                            Limit: {formatFileSize(statsData.storageLimit)}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(statsData.storageUsed / statsData.storageLimit) * 100}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {((1 - statsData.storageUsed / statsData.storageLimit) * 100).toFixed(1)}% remaining
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* File Types */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Files by Type
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ImageIcon color="primary" />
                            <Typography>Images</Typography>
                          </Box>
                          <Chip label={statsData.filesByType.images} />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <VideoIcon color="secondary" />
                            <Typography>Videos</Typography>
                          </Box>
                          <Chip label={statsData.filesByType.videos} />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AudioIcon color="success" />
                            <Typography>Audio</Typography>
                          </Box>
                          <Chip label={statsData.filesByType.audio} />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DocumentIcon color="warning" />
                            <Typography>Documents</Typography>
                          </Box>
                          <Chip label={statsData.filesByType.documents} />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Recent Activity */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Upload Activity
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Today</Typography>
                          <Chip 
                            label={statsData.recentActivity.uploadsToday} 
                            size="small"
                            color="primary"
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">This Week</Typography>
                          <Chip 
                            label={statsData.recentActivity.uploadsThisWeek} 
                            size="small"
                            color="secondary"
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">This Month</Typography>
                          <Chip 
                            label={statsData.recentActivity.uploadsThisMonth} 
                            size="small"
                            color="success"
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Usage Analytics */}
                {usageData && (
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          File Usage (30 days)
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Most Used: {usageData.mostUsed.length} files
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Unused: {usageData.unusedFiles.length} files
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Usage: {Object.values(usageData.usageByType).reduce((a, b) => a + b, 0)} times
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            ) : (
              <Alert severity="error">
                Failed to load analytics data
              </Alert>
            )}
          </Box>
        </TabPanel>

        {/* Recent Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recently Uploaded Files
            </Typography>
            {recentData?.files ? (
              <List>
                {recentData.files.map((file) => (
                  <ListItem key={file.id} divider>
                    <ListItemIcon>
                      {getFileTypeIcon(file.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={file.originalName}
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {formatFileSize(file.size)} • Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                          </Typography>
                          {file.metadata.tags.length > 0 && (
                            <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {file.metadata.tags.slice(0, 3).map((tag) => (
                                <Chip key={tag} label={tag} size="small" />
                              ))}
                            </Box>
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                          size="small"
                          onClick={() => setPreviewDialog(file)}
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small">
                          <DownloadIcon />
                        </IconButton>
                        <IconButton size="small">
                          <ShareIcon />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">
                No recent files found
              </Typography>
            )}
          </Box>
        </TabPanel>

        {/* Settings Tab */}
        <TabPanel value={activeTab} index={3}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Media Settings
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Upload Settings
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Configure default upload behavior, file processing, and quality settings.
                    </Typography>
                    <Button variant="outlined" size="small">
                      Configure Upload Settings
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Storage Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Manage storage quotas, automatic cleanup, and file retention policies.
                    </Typography>
                    <Button variant="outlined" size="small">
                      Manage Storage
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      CDN Settings
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Configure content delivery network settings for optimal performance.
                    </Typography>
                    <Button variant="outlined" size="small">
                      Configure CDN
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Security & Access
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Manage file access permissions, sharing settings, and security policies.
                    </Typography>
                    <Button variant="outlined" size="small">
                      Security Settings
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Paper>

      {/* File Preview Dialog */}
      <Dialog
        open={Boolean(previewDialog)}
        onClose={() => setPreviewDialog(null)}
        maxWidth="md"
        fullWidth
      >
        {previewDialog && (
          <>
            <DialogTitle>
              {previewDialog.originalName}
            </DialogTitle>
            <DialogContent>
              {previewDialog.type === 'image' ? (
                <Box sx={{ textAlign: 'center' }}>
                  <img
                    src={previewDialog.url}
                    alt={previewDialog.originalName}
                    style={{ maxWidth: '100%', maxHeight: '400px' }}
                  />
                </Box>
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  {getFileTypeIcon(previewDialog.type)}
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    {previewDialog.originalName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatFileSize(previewDialog.size)} • {previewDialog.mimeType}
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  File Information
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Size: {formatFileSize(previewDialog.size)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Type: {previewDialog.mimeType}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Uploaded: {new Date(previewDialog.uploadedAt).toLocaleString()}
                </Typography>
                {previewDialog.metadata.tags.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Tags:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {previewDialog.metadata.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPreviewDialog(null)}>
                Close
              </Button>
              <Button variant="contained" startIcon={<DownloadIcon />}>
                Download
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};