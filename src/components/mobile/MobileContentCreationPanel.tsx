import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Fab,
  useTheme,
  useMediaQuery,
  Avatar,
  Chip,
  Badge,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  AutoAwesome as AIIcon,
  Mic as VoiceIcon,
  VideoCall as VideoIcon,
  TextFields as TextIcon,
  Image as ImageIcon,
  Schedule as ScheduleIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { ContentGenerationDialog } from '../content/ContentGenerationDialog';
import { VoiceToContent } from './VoiceToContent';
import { MobileVideoUpload } from './MobileVideoUpload';
import { TranslationDialog } from './TranslationDialog';
import { useTenant } from '../../contexts/TenantContext';

interface MobileContentCreationPanelProps {
  onContentCreated?: (content: any) => void;
}

const quickActions = [
  {
    id: 'voice',
    label: 'Voice to Content',
    description: 'Record and convert to posts',
    icon: <VoiceIcon />,
    color: '#FF5722',
    gradient: 'linear-gradient(135deg, #FF5722 0%, #FF7043 100%)'
  },
  {
    id: 'video',
    label: 'Video Upload',
    description: 'AI captions & optimization',
    icon: <VideoIcon />,
    color: '#9C27B0',
    gradient: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)'
  },
  {
    id: 'text',
    label: 'Text Prompt',
    description: 'Describe your idea',
    icon: <TextIcon />,
    color: '#2196F3',
    gradient: 'linear-gradient(135deg, #2196F3 0%, #42A5F5 100%)'
  },
  {
    id: 'image',
    label: 'Image Content',
    description: 'Upload & generate captions',
    icon: <ImageIcon />,
    color: '#4CAF50',
    gradient: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)'
  }
];

const platformIcons: Record<string, string> = {
  instagram: '📷',
  twitter: '🐦',
  linkedin: '💼',
  youtube: '📺',
  tiktok: '🎵',
  facebook: '👥'
};

export const MobileContentCreationPanel: React.FC<MobileContentCreationPanelProps> = ({
  onContentCreated
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [_selectedAction, setSelectedAction] = useState<string | null>(null);
  const [contentGenerationOpen, setContentGenerationOpen] = useState(false);
  const [voiceDialogOpen, setVoiceDialogOpen] = useState(false);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [translationDialogOpen, setTranslationDialogOpen] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentWorkspace } = useTenant();

  const handleActionSelect = (actionId: string) => {
    setSelectedAction(actionId);
    
    switch (actionId) {
      case 'voice':
        setVoiceDialogOpen(true);
        break;
      case 'video':
        setVideoDialogOpen(true);
        break;
      case 'text':
        setContentGenerationOpen(true);
        break;
      case 'image':
        // TODO: Implement image upload
        console.log('Image upload coming soon');
        break;
    }
    
    setDrawerOpen(false);
  };

  const handleContentGenerated = (content: any) => {
    onContentCreated?.(content);
  };

  const renderQuickActionCard = (action: typeof quickActions[0]) => (
    <Card
      key={action.id}
      onClick={() => handleActionSelect(action.id)}
      sx={{
        cursor: 'pointer',
        background: action.gradient,
        color: 'white',
        '&:hover': {
          transform: 'scale(1.02)',
          transition: 'transform 0.2s'
        },
        minHeight: isMobile ? 120 : 140
      }}
    >
      <CardContent sx={{ p: isMobile ? 2 : 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
            {action.icon}
          </Avatar>
          <Typography variant={isMobile ? 'subtitle1' : 'h6'} fontWeight="bold">
            {action.label}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {action.description}
        </Typography>
      </CardContent>
    </Card>
  );

  const renderMobileDrawer = () => (
    <SwipeableDrawer
      anchor="bottom"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      onOpen={() => setDrawerOpen(true)}
      sx={{
        '& .MuiDrawer-paper': {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: '85vh'
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            Create Content
          </Typography>
          <IconButton onClick={() => setDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Current Workspace Info */}
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

        {/* Quick Actions */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {quickActions.map((action) => (
            <Grid item xs={6} key={action.id}>
              {renderQuickActionCard(action)}
            </Grid>
          ))}
        </Grid>

        {/* Additional Options */}
        <List>
          <ListItem button onClick={() => setTranslationDialogOpen(true)}>
            <ListItemIcon>
              <Badge badgeContent="New" color="primary">
                <AIIcon />
              </Badge>
            </ListItemIcon>
            <ListItemText
              primary="Translate Content"
              secondary="Multi-language support"
            />
          </ListItem>
          
          <ListItem button>
            <ListItemIcon>
              <ScheduleIcon />
            </ListItemIcon>
            <ListItemText
              primary="Schedule Posts"
              secondary="Plan your content calendar"
            />
          </ListItem>
          
          <ListItem button>
            <ListItemIcon>
              <TimelineIcon />
            </ListItemIcon>
            <ListItemText
              primary="View Analytics"
              secondary="Track performance"
            />
          </ListItem>
        </List>
      </Box>
    </SwipeableDrawer>
  );

  const renderDesktopPanel = () => (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Quick Content Creation
      </Typography>
      
      <Grid container spacing={2}>
        {quickActions.map((action) => (
          <Grid item xs={12} sm={6} md={3} key={action.id}>
            {renderQuickActionCard(action)}
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Recent Activity
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          Your last video generated 12K views! Consider creating similar content.
        </Alert>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {Object.entries(platformIcons).map(([platform, icon]) => (
            <Chip
              key={platform}
              label={`${icon} ${platform}`}
              size="small"
              clickable
              onClick={() => console.log(`Create for ${platform}`)}
            />
          ))}
        </Box>
      </Box>
    </Paper>
  );

  return (
    <>
      {/* Desktop View */}
      {!isMobile && renderDesktopPanel()}

      {/* Mobile Floating Action Button */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="create content"
          onClick={() => setDrawerOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5b61f0 0%, #7c3aed 100%)',
            }
          }}
        >
          <AIIcon />
        </Fab>
      )}

      {/* Mobile Drawer */}
      {isMobile && renderMobileDrawer()}

      {/* Content Creation Dialogs */}
      <ContentGenerationDialog
        open={contentGenerationOpen}
        onClose={() => setContentGenerationOpen(false)}
        onContentGenerated={handleContentGenerated}
      />

      <VoiceToContent
        open={voiceDialogOpen}
        onClose={() => setVoiceDialogOpen(false)}
        onGenerate={handleContentGenerated}
      />

      <MobileVideoUpload
        open={videoDialogOpen}
        onClose={() => setVideoDialogOpen(false)}
        onUpload={handleContentGenerated}
      />

      <TranslationDialog
        open={translationDialogOpen}
        onClose={() => setTranslationDialogOpen(false)}
        onTranslationComplete={(translatedContent, language) => {
          console.log(`Translated to ${language}:`, translatedContent);
        }}
      />
    </>
  );
};