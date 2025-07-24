import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Avatar,
  Divider,
  Rating,
  Stack
} from '@mui/material';
import {
  School as OnboardingIcon,
  MenuBook as TutorialIcon,
  Help as HelpIcon,
  Analytics as AnalyticsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as StartIcon,
  Pause as PauseIcon,
  CheckCircle as CompleteIcon,
  Skip as SkipIcon,
  MoreVert as MoreIcon,
  Timer as TimerIcon,
  TrendingUp as TrendingUpIcon,
  VideoLibrary as VideoIcon,
  Article as ArticleIcon,
  Assignment as AssignmentIcon,
  Star as StarIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Search as SearchIcon
} from '@mui/icons-material';

import {
  useGetOnboardingFlowsQuery,
  useGetTutorialsQuery,
  useGetHelpArticlesQuery,
  useGetOnboardingAnalyticsQuery,
  useCreateOnboardingFlowMutation,
  useCreateTutorialMutation,
  useGetUserOnboardingProgressQuery,
  useStartOnboardingFlowMutation,
  useCompleteOnboardingStepMutation,
  type OnboardingFlow,
  type Tutorial,
  type HelpArticle
} from '../../store/api/onboardingApi';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

export const OnboardingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [flowDialog, setFlowDialog] = useState(false);
  const [tutorialDialog, setTutorialDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFlow, setSelectedFlow] = useState<OnboardingFlow | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ element: HTMLElement; flow?: OnboardingFlow; tutorial?: Tutorial } | null>(null);

  // API calls
  const { data: flowsData, isLoading: flowsLoading } = useGetOnboardingFlowsQuery({ isActive: true });
  const { data: tutorialsData, isLoading: tutorialsLoading } = useGetTutorialsQuery({ 
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    search: searchQuery 
  });
  const { data: helpData, isLoading: helpLoading } = useGetHelpArticlesQuery({ search: searchQuery });
  const { data: analyticsData, isLoading: analyticsLoading } = useGetOnboardingAnalyticsQuery({ period: 'month' });
  const { data: userProgress } = useGetUserOnboardingProgressQuery({});

  const [createFlow] = useCreateOnboardingFlowMutation();
  const [createTutorial] = useCreateTutorialMutation();
  const [startFlow] = useStartOnboardingFlowMutation();
  const [completeStep] = useCompleteOnboardingStepMutation();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCreateFlow = async (flowData: {
    name: string;
    description: string;
    steps: any[];
  }) => {
    try {
      await createFlow({
        ...flowData,
        triggers: [{ type: 'user_signup' }],
        settings: {
          allowSkip: true,
          showProgress: true,
          autoAdvance: true,
          pauseOnExit: true
        }
      }).unwrap();
      setFlowDialog(false);
    } catch (error) {
      console.error('Failed to create flow:', error);
    }
  };

  const handleCreateTutorial = async (tutorialData: {
    title: string;
    description: string;
    category: Tutorial['category'];
    difficulty: Tutorial['difficulty'];
    content: Tutorial['content'];
  }) => {
    try {
      await createTutorial(tutorialData).unwrap();
      setTutorialDialog(false);
    } catch (error) {
      console.error('Failed to create tutorial:', error);
    }
  };

  const handleStartFlow = async (flowId: string) => {
    try {
      await startFlow({ flowId }).unwrap();
      setMenuAnchor(null);
    } catch (error) {
      console.error('Failed to start flow:', error);
    }
  };

  const handleCompleteStep = async (progressId: string, stepId: string) => {
    try {
      await completeStep({ progressId, stepId }).unwrap();
    } catch (error) {
      console.error('Failed to complete step:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'getting_started': return <OnboardingIcon />;
      case 'content_creation': return <ArticleIcon />;
      case 'analytics': return <TrendingUpIcon />;
      case 'video': return <VideoIcon />;
      default: return <HelpIcon />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Onboarding & Help Center
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create onboarding flows, manage tutorials, and provide help resources
        </Typography>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab 
              label="Onboarding Flows" 
              icon={<OnboardingIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Tutorials" 
              icon={<TutorialIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Help Center" 
              icon={<HelpIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Analytics" 
              icon={<AnalyticsIcon />} 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Onboarding Flows Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Onboarding Flows</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setFlowDialog(true)}
            >
              Create Flow
            </Button>
          </Box>

          {userProgress && userProgress.status === 'in_progress' && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography>
                  You have an onboarding flow in progress: {userProgress.progress.completedSteps} / {userProgress.progress.totalSteps} steps completed
                </Typography>
                <Button size="small" variant="outlined">
                  Continue
                </Button>
              </Box>
            </Alert>
          )}

          {flowsLoading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {flowsData?.flows.map((flow) => (
                <Grid item xs={12} md={6} key={flow.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6">
                            {flow.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {flow.description}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => setMenuAnchor({ element: e.currentTarget, flow })}
                        >
                          <MoreIcon />
                        </IconButton>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Progress Steps
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={30}
                          sx={{ height: 8, borderRadius: 4, mb: 1 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {flow.steps.length} steps • Est. {flow.steps.reduce((sum, step) => sum + step.estimatedTime, 0)} min
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        {flow.triggers.map((trigger, index) => (
                          <Chip
                            key={index}
                            label={trigger.type.replace('_', ' ')}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                        {flow.isDefault && (
                          <Chip label="Default" size="small" color="primary" />
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<StartIcon />}
                          onClick={() => handleStartFlow(flow.id)}
                        >
                          Start Flow
                        </Button>
                        <Button
                          size="small"
                          onClick={() => setSelectedFlow(flow)}
                        >
                          View Steps
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Tutorials Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Tutorials</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setTutorialDialog(true)}
              >
                Create Tutorial
              </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                placeholder="Search tutorials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                sx={{ width: 300 }}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  <MenuItem value="getting_started">Getting Started</MenuItem>
                  <MenuItem value="content_creation">Content Creation</MenuItem>
                  <MenuItem value="analytics">Analytics</MenuItem>
                  <MenuItem value="team_management">Team Management</MenuItem>
                  <MenuItem value="integrations">Integrations</MenuItem>
                  <MenuItem value="advanced">Advanced</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {tutorialsLoading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {tutorialsData?.tutorials.map((tutorial) => (
                <Grid item xs={12} sm={6} md={4} key={tutorial.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'start', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                          {getCategoryIcon(tutorial.category)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            {tutorial.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {tutorial.description}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        <Chip
                          label={tutorial.difficulty}
                          size="small"
                          color={getDifficultyColor(tutorial.difficulty) as any}
                        />
                        <Chip
                          label={tutorial.content.type}
                          size="small"
                          icon={tutorial.content.type === 'video' ? <VideoIcon /> : <ArticleIcon />}
                        />
                        {tutorial.content.duration && (
                          <Chip
                            label={formatDuration(tutorial.content.duration)}
                            size="small"
                            icon={<TimerIcon />}
                          />
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Rating
                          value={tutorial.stats.averageRating}
                          readOnly
                          size="small"
                          precision={0.5}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          ({tutorial.stats.completions})
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          {tutorial.stats.views} views • {(tutorial.stats.completionRate * 100).toFixed(0)}% completion
                        </Typography>
                        <Button size="small" startIcon={<StartIcon />}>
                          Start
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Help Center Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Help Center
            </Typography>
            <TextField
              fullWidth
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ maxWidth: 600 }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Box>

          {helpLoading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Popular Articles
                    </Typography>
                    <List>
                      {helpData?.articles.map((article) => (
                        <ListItem key={article.id} divider>
                          <ListItemIcon>
                            <ArticleIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={article.title}
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {article.category} • {article.metadata.readTime} min read
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <ThumbUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                                    <Typography variant="caption">{article.stats.helpful}</Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <ThumbDownIcon fontSize="small" sx={{ mr: 0.5 }} />
                                    <Typography variant="caption">{article.stats.notHelpful}</Typography>
                                  </Box>
                                </Box>
                              </Box>
                            }
                          />
                          <Button size="small">Read</Button>
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Categories
                    </Typography>
                    <List>
                      {helpData?.categories.map((category) => (
                        <ListItem 
                          key={category} 
                          button
                          onClick={() => setSelectedCategory(category)}
                        >
                          <ListItemIcon>
                            {getCategoryIcon(category)}
                          </ListItemIcon>
                          <ListItemText primary={category} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h6" gutterBottom>
            Onboarding Analytics
          </Typography>

          {analyticsLoading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : analyticsData && (
            <Grid container spacing={3}>
              {/* Overall Stats */}
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary.main">
                          {analyticsData.overall.totalUsers}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Users
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main">
                          {analyticsData.overall.activeFlows}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Active Flows
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="info.main">
                          {(analyticsData.overall.completionRate * 100).toFixed(1)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Completion Rate
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="warning.main">
                          {formatDuration(analyticsData.overall.averageOnboardingTime)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Avg. Time
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>

              {/* Flow Performance */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Flow Performance
                    </Typography>
                    <List>
                      {analyticsData.flows.map((flow) => (
                        <ListItem key={flow.flowId} divider>
                          <ListItemText
                            primary={flow.name}
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {flow.totalUsers} users • {(flow.completionRate * 100).toFixed(1)}% completion
                                </Typography>
                                <LinearProgress
                                  variant="determinate"
                                  value={flow.completionRate * 100}
                                  sx={{ mt: 1 }}
                                />
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Top Tutorials */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Top Tutorials
                    </Typography>
                    <List>
                      {analyticsData.tutorials.map((tutorial) => (
                        <ListItem key={tutorial.tutorialId} divider>
                          <ListItemIcon>
                            <Avatar sx={{ bgcolor: 'primary.light' }}>
                              <StarIcon />
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={tutorial.title}
                            secondary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                  {tutorial.views} views
                                </Typography>
                                <Rating
                                  value={tutorial.averageRating}
                                  readOnly
                                  size="small"
                                />
                              </Box>
                            }
                          />
                          <Typography variant="body2" color="primary.main">
                            {tutorial.completions} completed
                          </Typography>
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </TabPanel>
      </Paper>

      {/* Menu */}
      <Menu
        anchorEl={menuAnchor?.element}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        {menuAnchor?.flow && (
          <>
            <MenuItem onClick={() => setMenuAnchor(null)}>
              <EditIcon sx={{ mr: 1 }} />
              Edit Flow
            </MenuItem>
            <MenuItem onClick={() => setMenuAnchor(null)}>
              <StartIcon sx={{ mr: 1 }} />
              Test Flow
            </MenuItem>
            <MenuItem onClick={() => setMenuAnchor(null)} sx={{ color: 'error.main' }}>
              <DeleteIcon sx={{ mr: 1 }} />
              Delete
            </MenuItem>
          </>
        )}
        {menuAnchor?.tutorial && (
          <>
            <MenuItem onClick={() => setMenuAnchor(null)}>
              <EditIcon sx={{ mr: 1 }} />
              Edit Tutorial
            </MenuItem>
            <MenuItem onClick={() => setMenuAnchor(null)}>
              <StartIcon sx={{ mr: 1 }} />
              Preview
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Flow Steps Dialog */}
      {selectedFlow && (
        <Dialog
          open={Boolean(selectedFlow)}
          onClose={() => setSelectedFlow(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {selectedFlow.name} - Steps
          </DialogTitle>
          <DialogContent>
            <Stepper orientation="vertical">
              {selectedFlow.steps.map((step, index) => (
                <Step key={step.id} active>
                  <StepLabel
                    optional={
                      step.isOptional && (
                        <Typography variant="caption">Optional</Typography>
                      )
                    }
                  >
                    {step.title}
                  </StepLabel>
                  <StepContent>
                    <Typography>{step.description}</Typography>
                    <Box sx={{ mb: 2, mt: 1 }}>
                      <Chip
                        label={`${step.estimatedTime} min`}
                        size="small"
                        icon={<TimerIcon />}
                      />
                      <Chip
                        label={step.type}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedFlow(null)}>Close</Button>
            <Button variant="contained" startIcon={<StartIcon />}>
              Start Flow
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Create Flow Dialog */}
      <CreateFlowDialog
        open={flowDialog}
        onClose={() => setFlowDialog(false)}
        onCreate={handleCreateFlow}
      />

      {/* Create Tutorial Dialog */}
      <CreateTutorialDialog
        open={tutorialDialog}
        onClose={() => setTutorialDialog(false)}
        onCreate={handleCreateTutorial}
      />
    </Container>
  );
};

// Create Flow Dialog
const CreateFlowDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onCreate: (data: any) => void;
}> = ({ open, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    steps: [{
      title: '',
      description: '',
      type: 'welcome' as const,
      estimatedTime: 5,
      isOptional: false,
      isSkippable: true
    }]
  });

  const handleAddStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, {
        title: '',
        description: '',
        type: 'tutorial',
        estimatedTime: 5,
        isOptional: false,
        isSkippable: true
      }]
    });
  };

  const handleUpdateStep = (index: number, field: string, value: any) => {
    const newSteps = [...formData.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setFormData({ ...formData, steps: newSteps });
  };

  const handleSubmit = () => {
    if (formData.name && formData.steps.length > 0) {
      onCreate(formData);
      setFormData({
        name: '',
        description: '',
        steps: [{
          title: '',
          description: '',
          type: 'welcome',
          estimatedTime: 5,
          isOptional: false,
          isSkippable: true
        }]
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create Onboarding Flow</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Flow Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          sx={{ mb: 2, mt: 1 }}
        />
        
        <TextField
          fullWidth
          label="Description"
          multiline
          rows={2}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          sx={{ mb: 3 }}
        />

        <Typography variant="subtitle1" gutterBottom>
          Steps
        </Typography>

        {formData.steps.map((step, index) => (
          <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Step Title"
                  value={step.title}
                  onChange={(e) => handleUpdateStep(index, 'title', e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Step Description"
                  multiline
                  rows={2}
                  value={step.description}
                  onChange={(e) => handleUpdateStep(index, 'description', e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={step.type}
                    onChange={(e) => handleUpdateStep(index, 'type', e.target.value)}
                    label="Type"
                  >
                    <MenuItem value="welcome">Welcome</MenuItem>
                    <MenuItem value="setup">Setup</MenuItem>
                    <MenuItem value="tutorial">Tutorial</MenuItem>
                    <MenuItem value="checklist">Checklist</MenuItem>
                    <MenuItem value="video">Video</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Est. Time (min)"
                  value={step.estimatedTime}
                  onChange={(e) => handleUpdateStep(index, 'estimatedTime', parseInt(e.target.value))}
                  size="small"
                />
              </Grid>
              <Grid item xs={4}>
                <Stack direction="row" spacing={1}>
                  <Chip
                    label="Optional"
                    onClick={() => handleUpdateStep(index, 'isOptional', !step.isOptional)}
                    color={step.isOptional ? 'primary' : 'default'}
                    variant={step.isOptional ? 'filled' : 'outlined'}
                  />
                  <Chip
                    label="Skippable"
                    onClick={() => handleUpdateStep(index, 'isSkippable', !step.isSkippable)}
                    color={step.isSkippable ? 'primary' : 'default'}
                    variant={step.isSkippable ? 'filled' : 'outlined'}
                  />
                </Stack>
              </Grid>
            </Grid>
          </Box>
        ))}

        <Button
          startIcon={<AddIcon />}
          onClick={handleAddStep}
          variant="outlined"
          fullWidth
        >
          Add Step
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!formData.name || formData.steps.length === 0}
        >
          Create Flow
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Create Tutorial Dialog
const CreateTutorialDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onCreate: (data: any) => void;
}> = ({ open, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'getting_started' as Tutorial['category'],
    difficulty: 'beginner' as Tutorial['difficulty'],
    content: {
      type: 'article' as const,
      markdown: ''
    }
  });

  const handleSubmit = () => {
    if (formData.title && formData.description) {
      onCreate(formData);
      setFormData({
        title: '',
        description: '',
        category: 'getting_started',
        difficulty: 'beginner',
        content: {
          type: 'article',
          markdown: ''
        }
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create Tutorial</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Tutorial Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          sx={{ mb: 2, mt: 1 }}
        />
        
        <TextField
          fullWidth
          label="Description"
          multiline
          rows={2}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          sx={{ mb: 2 }}
        />

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={4}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Tutorial['category'] })}
                label="Category"
              >
                <MenuItem value="getting_started">Getting Started</MenuItem>
                <MenuItem value="content_creation">Content Creation</MenuItem>
                <MenuItem value="analytics">Analytics</MenuItem>
                <MenuItem value="team_management">Team Management</MenuItem>
                <MenuItem value="integrations">Integrations</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <FormControl fullWidth>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as Tutorial['difficulty'] })}
                label="Difficulty"
              >
                <MenuItem value="beginner">Beginner</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <FormControl fullWidth>
              <InputLabel>Content Type</InputLabel>
              <Select
                value={formData.content.type}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  content: { ...formData.content, type: e.target.value as any }
                })}
                label="Content Type"
              >
                <MenuItem value="article">Article</MenuItem>
                <MenuItem value="video">Video</MenuItem>
                <MenuItem value="interactive">Interactive</MenuItem>
                <MenuItem value="guided_tour">Guided Tour</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <TextField
          fullWidth
          label="Content (Markdown)"
          multiline
          rows={8}
          value={formData.content.markdown}
          onChange={(e) => setFormData({ 
            ...formData, 
            content: { ...formData.content, markdown: e.target.value }
          })}
          placeholder="Enter tutorial content in markdown format..."
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!formData.title || !formData.description}
        >
          Create Tutorial
        </Button>
      </DialogActions>
    </Dialog>
  );
};