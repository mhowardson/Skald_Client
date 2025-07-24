import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterIcon,
  ViewList as ListIcon,
  CalendarMonth as CalendarIcon,
  Timeline as TimelineIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Schedule as ScheduleIcon,
  Publish as PublishIcon,
  Drafts as DraftIcon
} from '@mui/icons-material';

import { ContentScheduler } from '../../components/content/ContentScheduler';
import { ContentListView } from '../../components/content/ContentListView';
import { ContentTimeline } from '../../components/content/ContentTimeline';
import { CreateContentDialog } from '../../components/content/CreateContentDialog';
import { useTenant } from '../../contexts/TenantContext';
import { useGetContentQuery, Content } from '../../store/api/contentApi';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`content-tabpanel-${index}`}
      aria-labelledby={`content-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

export const ContentPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const { currentWorkspace } = useTenant();

  // Fetch content overview for stats
  const { data: contentData } = useGetContentQuery({
    limit: 10,
    status: ['draft', 'pending_review', 'approved', 'scheduled', 'published']
  });

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleContentCreate = () => {
    setCreateDialogOpen(true);
  };

  const handleContentEdit = (content: Content) => {
    setSelectedContent(content);
    setCreateDialogOpen(true);
  };

  const handleContentSchedule = (content: Content) => {
    // TODO: Open scheduling dialog
    console.log('Schedule content:', content);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  // Calculate content stats
  const contentStats = React.useMemo(() => {
    if (!contentData?.content) return null;

    const stats = {
      total: contentData.content.length,
      draft: 0,
      scheduled: 0,
      published: 0,
      pending: 0
    };

    contentData.content.forEach(content => {
      switch (content.status) {
        case 'draft':
          stats.draft++;
          break;
        case 'scheduled':
          stats.scheduled++;
          break;
        case 'published':
          stats.published++;
          break;
        case 'pending_review':
          stats.pending++;
          break;
      }
    });

    return stats;
  }, [contentData]);

  if (!currentWorkspace) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="info">
          Please select a workspace to manage content.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Content Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create, schedule, and manage content for {currentWorkspace.client.companyName}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleContentCreate}
            size="large"
          >
            Create Content
          </Button>
          
          <IconButton onClick={handleMenuOpen}>
            <SettingsIcon />
          </IconButton>
          
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <AnalyticsIcon />
              </ListItemIcon>
              <ListItemText primary="Content Analytics" />
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <DownloadIcon />
              </ListItemIcon>
              <ListItemText primary="Export Content" />
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Content Settings" />
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Content Stats */}
      {contentStats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <DraftIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {contentStats.draft}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Drafts
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <ScheduleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {contentStats.scheduled}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Scheduled
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <PublishIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {contentStats.published}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Published
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <FilterIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {contentStats.pending}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Review
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Content Views */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab 
              icon={<CalendarIcon />} 
              label="Calendar" 
              iconPosition="start"
            />
            <Tab 
              icon={<ListIcon />} 
              label="Content List" 
              iconPosition="start"
            />
            <Tab 
              icon={<TimelineIcon />} 
              label="Timeline" 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <ContentScheduler
            onContentCreate={handleContentCreate}
            onContentEdit={handleContentEdit}
            onContentSchedule={handleContentSchedule}
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <ContentListView 
            onCreateContent={handleContentCreate}
            onEditContent={handleContentEdit}
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <ContentTimeline 
            onCreateContent={handleContentCreate}
            onEditContent={handleContentEdit}
          />
        </TabPanel>
      </Paper>

      {/* Create/Edit Content Dialog */}
      <CreateContentDialog
        open={createDialogOpen}
        onClose={() => {
          setCreateDialogOpen(false);
          setSelectedContent(null);
        }}
        onSuccess={() => {
          setCreateDialogOpen(false);
          setSelectedContent(null);
        }}
        initialData={selectedContent ? {
          title: selectedContent.title,
          body: selectedContent.body,
          type: selectedContent.type,
          platforms: selectedContent.platforms,
          tags: selectedContent.tags,
          priority: selectedContent.priority,
          category: selectedContent.category,
          contentPillar: selectedContent.contentPillar
        } : undefined}
      />
    </Container>
  );
};