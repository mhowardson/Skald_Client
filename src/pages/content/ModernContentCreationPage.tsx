import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Tabs,
  Tab,
  Drawer,
  IconButton,
  Fab,
  Slide,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Chip,
  alpha,
  useTheme,
  useMediaQuery,
  Tooltip,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Create,
  Save,
  Schedule,
  Visibility,
  Send,
  AutoAwesome,
  Template,
  CloudUpload,
  Analytics,
  Settings,
  Share,
  ContentCopy,
  History,
  Bookmark,
  Close,
  NavigateNext,
  Home,
  Tune,
  Preview,
} from '@mui/icons-material';

// Import our modern components
import { ModernRichTextEditor } from '../../components/content/ModernRichTextEditor';
import { ModernMediaUpload } from '../../components/content/ModernMediaUpload';
import { ModernContentTemplates } from '../../components/content/ModernContentTemplates';
import { PlatformOptimizationPanel } from '../../components/content/PlatformOptimizationPanel';

// Import API hooks
import {
  useCreateDraftMutation,
  useUpdateDraftMutation,
  useOptimizeContentMutation,
  usePreviewContentMutation,
  useUploadMediaMutation,
  useValidateContentMutation,
  useGetTemplatesQuery,
} from '../../store/api/contentCreationApi';

interface ContentPlatform {
  platform: string;
  status?: string;
  publishingResult?: any;
  platformSpecific?: any;
  scheduledAt?: string;
}

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
  metadata?: any;
}

interface ContentTemplate {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  platform: string[];
  tags: string[];
}

const platformOptions = [
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: '#0A66C2' },
  { id: 'twitter', name: 'Twitter', icon: '🐦', color: '#1DA1F2' },
  { id: 'instagram', name: 'Instagram', icon: '📷', color: '#E4405F' },
  { id: 'facebook', name: 'Facebook', icon: '📘', color: '#1877F2' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', color: '#000000' },
  { id: 'youtube', name: 'YouTube', icon: '📺', color: '#FF0000' },
];

export const ModernContentCreationPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));\n  const [activeTab, setActiveTab] = useState(0);\n  const [content, setContent] = useState('');\n  const [selectedPlatforms, setSelectedPlatforms] = useState<ContentPlatform[]>([]);\n  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);\n  const [isOptimizationOpen, setIsOptimizationOpen] = useState(!isMobile);\n  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);\n  const [previewOpen, setPreviewOpen] = useState(false);\n  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');\n  const [notification, setNotification] = useState<{ message: string; severity: 'success' | 'error' | 'info' } | null>(null);\n\n  // Auto-save functionality\n  useEffect(() => {\n    const timer = setTimeout(() => {\n      if (content.trim() && saveStatus !== 'saving') {\n        handleAutoSave();\n      }\n    }, 2000);\n\n    return () => clearTimeout(timer);\n  }, [content]);\n\n  const handleAutoSave = async () => {\n    setSaveStatus('saving');\n    try {\n      // Simulate API call\n      await new Promise(resolve => setTimeout(resolve, 1000));\n      setSaveStatus('saved');\n      setTimeout(() => setSaveStatus('idle'), 2000);\n    } catch (error) {\n      setSaveStatus('error');\n      setNotification({ message: 'Auto-save failed', severity: 'error' });\n    }\n  };\n\n  const handleContentChange = useCallback((newContent: string) => {\n    setContent(newContent);\n  }, []);\n\n  const handlePlatformToggle = (platform: string) => {\n    setSelectedPlatforms(prev => {\n      const exists = prev.find(p => p.platform === platform);\n      if (exists) {\n        return prev.filter(p => p.platform !== platform);\n      } else {\n        return [...prev, { platform, platformSpecific: {} }];\n      }\n    });\n  };\n\n  const handleTemplateSelect = (template: ContentTemplate) => {\n    setContent(template.content);\n    // Auto-select platforms from template\n    const platforms = template.platform.map(p => ({ platform: p, platformSpecific: {} }));\n    setSelectedPlatforms(platforms);\n    setIsTemplatesOpen(false);\n    setNotification({ message: `Template \"${template.title}\" applied successfully`, severity: 'success' });\n  };\n\n  const handleFilesSelected = useCallback((files: MediaFile[]) => {\n    setMediaFiles(files);\n  }, []);\n\n  const handleFileRemove = useCallback((fileId: string) => {\n    setMediaFiles(prev => prev.filter(f => f.id !== fileId));\n  }, []);\n\n  const handleAiAssist = () => {\n    setNotification({ message: 'AI enhancement in progress...', severity: 'info' });\n    // Simulate AI processing\n    setTimeout(() => {\n      const enhancedContent = content + '\\n\\n✨ [AI-enhanced with relevant hashtags and call-to-action]';\n      setContent(enhancedContent);\n      setNotification({ message: 'Content enhanced with AI suggestions', severity: 'success' });\n    }, 2000);\n  };\n\n  const handleSchedule = () => {\n    setNotification({ message: 'Scheduling feature coming soon', severity: 'info' });\n  };\n\n  const handlePublish = async () => {\n    if (!content.trim()) {\n      setNotification({ message: 'Please add some content first', severity: 'error' });\n      return;\n    }\n    if (selectedPlatforms.length === 0) {\n      setNotification({ message: 'Please select at least one platform', severity: 'error' });\n      return;\n    }\n\n    try {\n      setSaveStatus('saving');\n      // Simulate publishing\n      await new Promise(resolve => setTimeout(resolve, 2000));\n      setNotification({ message: 'Content published successfully!', severity: 'success' });\n      setSaveStatus('saved');\n    } catch (error) {\n      setNotification({ message: 'Publishing failed', severity: 'error' });\n      setSaveStatus('error');\n    }\n  };\n\n  const handlePreview = () => {\n    setPreviewOpen(true);\n  };\n\n  const tabPanels = [\n    {\n      label: 'Create',\n      icon: <Create />,\n      content: (\n        <Grid container spacing={3}>\n          <Grid item xs={12} lg={isOptimizationOpen ? 8 : 12}>\n            <ModernRichTextEditor\n              value={content}\n              onChange={handleContentChange}\n              platforms={selectedPlatforms}\n              placeholder=\"Start crafting your amazing content...\"\n              onAiAssist={handleAiAssist}\n              onSchedule={handleSchedule}\n              onPreview={handlePreview}\n              showPlatformOptimization={isOptimizationOpen}\n            />\n          </Grid>\n          {isOptimizationOpen && (\n            <Grid item xs={12} lg={4}>\n              <PlatformOptimizationPanel\n                content={content}\n                platforms={selectedPlatforms.map(p => p.platform)}\n                onHashtagAdd={(hashtag) => setContent(prev => prev + ` ${hashtag}`)}\n                onContentOptimize={setContent}\n              />\n            </Grid>\n          )}\n        </Grid>\n      ),\n    },\n    {\n      label: 'Media',\n      icon: <CloudUpload />,\n      content: (\n        <ModernMediaUpload\n          onFilesSelected={handleFilesSelected}\n          onFileRemove={handleFileRemove}\n          maxFiles={10}\n          maxFileSize={50}\n          showPreview\n          showOptimization\n        />\n      ),\n    },\n    {\n      label: 'Templates',\n      icon: <Template />,\n      content: (\n        <ModernContentTemplates\n          onTemplateSelect={handleTemplateSelect}\n          showFilters\n          showMetrics\n        />\n      ),\n    },\n  ];\n\n  const speedDialActions = [\n    {\n      icon: <AutoAwesome />,\n      name: 'AI Enhance',\n      onClick: handleAiAssist,\n    },\n    {\n      icon: <Template />,\n      name: 'Templates',\n      onClick: () => setIsTemplatesOpen(true),\n    },\n    {\n      icon: <Analytics />,\n      name: 'Analytics',\n      onClick: () => setIsOptimizationOpen(!isOptimizationOpen),\n    },\n    {\n      icon: <Schedule />,\n      name: 'Schedule',\n      onClick: handleSchedule,\n    },\n  ];\n\n  return (\n    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>\n      {/* Header */}\n      <Paper\n        elevation={0}\n        sx={{\n          position: 'sticky',\n          top: 0,\n          zIndex: 1100,\n          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,\n          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(\n            theme.palette.background.default,\n            0.95\n          )} 100%)`,\n          backdropFilter: 'blur(20px)',\n        }}\n      >\n        <Container maxWidth=\"xl\" sx={{ py: 2 }}>\n          <Stack direction=\"row\" alignItems=\"center\" spacing={2}>\n            {/* Breadcrumbs */}\n            <Breadcrumbs separator={<NavigateNext fontSize=\"small\" />} sx={{ flexGrow: 1 }}>\n              <Link underline=\"hover\" color=\"inherit\" href=\"/dashboard\" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>\n                <Home fontSize=\"small\" />\n                Dashboard\n              </Link>\n              <Typography color=\"text.primary\" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>\n                <Create fontSize=\"small\" />\n                Create Content\n              </Typography>\n            </Breadcrumbs>\n\n            {/* Platform Selector */}\n            <Stack direction=\"row\" spacing={1}>\n              {platformOptions.map((platform) => {\n                const isSelected = selectedPlatforms.some(p => p.platform === platform.id);\n                return (\n                  <Tooltip key={platform.id} title={platform.name}>\n                    <Chip\n                      icon={<Typography>{platform.icon}</Typography>}\n                      label={platform.name}\n                      onClick={() => handlePlatformToggle(platform.id)}\n                      color={isSelected ? 'primary' : 'default'}\n                      variant={isSelected ? 'filled' : 'outlined'}\n                      sx={{\n                        borderRadius: 3,\n                        borderColor: isSelected ? platform.color : 'divider',\n                        '&:hover': {\n                          borderColor: platform.color,\n                        },\n                      }}\n                    />\n                  </Tooltip>\n                );\n              })}\n            </Stack>\n\n            {/* Action Buttons */}\n            <Stack direction=\"row\" spacing={1}>\n              <Button\n                variant=\"outlined\"\n                startIcon={<Preview />}\n                onClick={handlePreview}\n                disabled={!content.trim()}\n                sx={{ borderRadius: 3 }}\n              >\n                Preview\n              </Button>\n              <Button\n                variant=\"outlined\"\n                startIcon={<Schedule />}\n                onClick={handleSchedule}\n                disabled={!content.trim()}\n                sx={{ borderRadius: 3 }}\n              >\n                Schedule\n              </Button>\n              <Button\n                variant=\"contained\"\n                startIcon={<Send />}\n                onClick={handlePublish}\n                disabled={!content.trim() || selectedPlatforms.length === 0}\n                sx={{\n                  borderRadius: 3,\n                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,\n                }}\n              >\n                Publish\n              </Button>\n            </Stack>\n\n            {/* Optimization Toggle */}\n            {!isMobile && (\n              <Tooltip title={isOptimizationOpen ? 'Hide Optimization Panel' : 'Show Optimization Panel'}>\n                <IconButton\n                  onClick={() => setIsOptimizationOpen(!isOptimizationOpen)}\n                  color={isOptimizationOpen ? 'primary' : 'default'}\n                  sx={{ borderRadius: 2 }}\n                >\n                  <Analytics />\n                </IconButton>\n              </Tooltip>\n            )}\n          </Stack>\n        </Container>\n      </Paper>\n\n      {/* Main Content */}\n      <Container maxWidth=\"xl\" sx={{ py: 3 }}>\n        <Paper\n          sx={{\n            borderRadius: 4,\n            overflow: 'hidden',\n            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,\n          }}\n        >\n          {/* Tabs */}\n          <Tabs\n            value={activeTab}\n            onChange={(_, newValue) => setActiveTab(newValue)}\n            sx={{\n              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,\n              '& .MuiTab-root': {\n                minHeight: 64,\n                fontSize: '1rem',\n                fontWeight: 600,\n                textTransform: 'none',\n              },\n            }}\n          >\n            {tabPanels.map((tab, index) => (\n              <Tab\n                key={index}\n                icon={tab.icon}\n                label={tab.label}\n                iconPosition=\"start\"\n                sx={{ gap: 1 }}\n              />\n            ))}\n          </Tabs>\n\n          {/* Tab Content */}\n          <Box sx={{ p: 3 }}>\n            {tabPanels[activeTab]?.content}\n          </Box>\n        </Paper>\n      </Container>\n\n      {/* Mobile Speed Dial */}\n      {isMobile && (\n        <SpeedDial\n          ariaLabel=\"Content creation actions\"\n          sx={{ position: 'fixed', bottom: 16, right: 16 }}\n          icon={<SpeedDialIcon />}\n        >\n          {speedDialActions.map((action) => (\n            <SpeedDialAction\n              key={action.name}\n              icon={action.icon}\n              tooltipTitle={action.name}\n              onClick={action.onClick}\n            />\n          ))}\n        </SpeedDial>\n      )}\n\n      {/* Templates Drawer */}\n      <Drawer\n        anchor=\"right\"\n        open={isTemplatesOpen}\n        onClose={() => setIsTemplatesOpen(false)}\n        PaperProps={{\n          sx: {\n            width: { xs: '100%', sm: 400, md: 600 },\n            borderRadius: isMobile ? 0 : '16px 0 0 16px',\n          },\n        }}\n      >\n        <Box sx={{ p: 3 }}>\n          <Stack direction=\"row\" alignItems=\"center\" justifyContent=\"space-between\" sx={{ mb: 3 }}>\n            <Typography variant=\"h5\" fontWeight={700}>\n              Content Templates\n            </Typography>\n            <IconButton onClick={() => setIsTemplatesOpen(false)}>\n              <Close />\n            </IconButton>\n          </Stack>\n          <ModernContentTemplates\n            onTemplateSelect={handleTemplateSelect}\n            showFilters\n            showMetrics\n          />\n        </Box>\n      </Drawer>\n\n      {/* Preview Dialog */}\n      <Dialog\n        open={previewOpen}\n        onClose={() => setPreviewOpen(false)}\n        maxWidth=\"md\"\n        fullWidth\n        PaperProps={{\n          sx: { borderRadius: 3, minHeight: 400 },\n        }}\n      >\n        <DialogTitle>\n          <Stack direction=\"row\" alignItems=\"center\" justifyContent=\"space-between\">\n            <Typography variant=\"h5\" fontWeight={600}>\n              Content Preview\n            </Typography>\n            <IconButton onClick={() => setPreviewOpen(false)}>\n              <Close />\n            </IconButton>\n          </Stack>\n        </DialogTitle>\n        <DialogContent>\n          {selectedPlatforms.map((platform) => (\n            <Paper key={platform.platform} sx={{ p: 3, mb: 2, borderRadius: 3 }}>\n              <Typography variant=\"h6\" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>\n                <Typography>\n                  {platformOptions.find(p => p.id === platform.platform)?.icon}\n                </Typography>\n                {platform.platform.charAt(0).toUpperCase() + platform.platform.slice(1)} Preview\n              </Typography>\n              <Typography variant=\"body1\" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>\n                {content || 'No content to preview'}\n              </Typography>\n              {mediaFiles.length > 0 && (\n                <Box sx={{ mt: 2 }}>\n                  <Typography variant=\"subtitle2\" sx={{ mb: 1 }}>\n                    Media: {mediaFiles.length} file(s)\n                  </Typography>\n                </Box>\n              )}\n            </Paper>\n          ))}\n        </DialogContent>\n        <DialogActions sx={{ p: 3 }}>\n          <Button onClick={() => setPreviewOpen(false)}>Close</Button>\n          <Button variant=\"contained\" onClick={handlePublish} sx={{ borderRadius: 2 }}>\n            Publish Now\n          </Button>\n        </DialogActions>\n      </Dialog>\n\n      {/* Status Bar */}\n      {saveStatus !== 'idle' && (\n        <Slide direction=\"up\" in mountOnEnter unmountOnExit>\n          <Paper\n            sx={{\n              position: 'fixed',\n              bottom: 16,\n              left: 16,\n              px: 3,\n              py: 1,\n              borderRadius: 3,\n              zIndex: 1200,\n            }}\n          >\n            <Stack direction=\"row\" alignItems=\"center\" spacing={1}>\n              <Box sx={{ width: 16, height: 16 }}>\n                {saveStatus === 'saving' && (\n                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>\n                    <Box sx={{ width: 12, height: 12, border: '2px solid', borderColor: 'primary.main', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />\n                  </Box>\n                )}\n                {saveStatus === 'saved' && <Save color=\"success\" sx={{ fontSize: 16 }} />}\n                {saveStatus === 'error' && <Close color=\"error\" sx={{ fontSize: 16 }} />}\n              </Box>\n              <Typography variant=\"body2\">\n                {saveStatus === 'saving' && 'Saving...'}\n                {saveStatus === 'saved' && 'Saved'}\n                {saveStatus === 'error' && 'Save failed'}\n              </Typography>\n            </Stack>\n          </Paper>\n        </Slide>\n      )}\n\n      {/* Notifications */}\n      <Snackbar\n        open={!!notification}\n        autoHideDuration={4000}\n        onClose={() => setNotification(null)}\n        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}\n      >\n        {notification && (\n          <Alert\n            onClose={() => setNotification(null)}\n            severity={notification.severity}\n            sx={{ borderRadius: 3 }}\n          >\n            {notification.message}\n          </Alert>\n        )}\n      </Snackbar>\n\n      <style jsx>{`\n        @keyframes spin {\n          0% { transform: rotate(0deg); }\n          100% { transform: rotate(360deg); }\n        }\n      `}</style>\n    </Box>\n  );\n};