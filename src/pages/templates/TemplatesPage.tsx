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
  CardActions,
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
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Article as TemplateIcon,
  Palette as BrandIcon,
  PhotoLibrary as AssetsIcon,
  Analytics as AnalyticsIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as DuplicateIcon,
  Preview as PreviewIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Image as ImageIcon,
  VideoFile as VideoIcon,
  AudioFile as AudioIcon,
  Description as DocumentIcon,
  FontDownload as FontIcon
} from '@mui/icons-material';

import {
  useGetTemplatesQuery,
  useGetTemplateCategoriesQuery,
  useCreateTemplateMutation,
  useDeleteTemplateMutation,
  useDuplicateTemplateMutation,
  useGetBrandGuidelinesQuery,
  useCreateBrandGuidelinesMutation,
  useGetBrandAssetsQuery,
  useUploadBrandAssetMutation,
  useGetTemplateAnalyticsQuery,
  useCheckBrandComplianceMutation,
  type ContentTemplate,
  type BrandGuidelines,
  type BrandAsset
} from '../../store/api/templatesApi';

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

export const TemplatesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [templateDialog, setTemplateDialog] = useState(false);
  const [brandGuidelinesDialog, setBrandGuidelinesDialog] = useState(false);
  const [assetUploadDialog, setAssetUploadDialog] = useState(false);
  const [complianceDialog, setComplianceDialog] = useState<{
    open: boolean;
    content?: any;
    result?: any;
  }>({ open: false });
  const [menuAnchor, setMenuAnchor] = useState<{ element: HTMLElement; template: ContentTemplate } | null>(null);

  // API calls
  const { data: templatesData, isLoading: templatesLoading } = useGetTemplatesQuery({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    limit: 20
  });

  const { data: categoriesData } = useGetTemplateCategoriesQuery();
  const { data: brandGuidelines } = useGetBrandGuidelinesQuery({});
  const { data: brandAssets } = useGetBrandAssetsQuery({});
  const { data: analyticsData } = useGetTemplateAnalyticsQuery({ period: 'month' });

  const [createTemplate] = useCreateTemplateMutation();
  const [deleteTemplate] = useDeleteTemplateMutation();
  const [duplicateTemplate] = useDuplicateTemplateMutation();
  const [createBrandGuidelines] = useCreateBrandGuidelinesMutation();
  const [uploadBrandAsset] = useUploadBrandAssetMutation();
  const [checkBrandCompliance] = useCheckBrandComplianceMutation();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCreateTemplate = async (templateData: {
    name: string;
    category: ContentTemplate['category'];
    content: ContentTemplate['content'];
  }) => {
    try {
      await createTemplate({
        ...templateData,
        platforms: [
          { platform: 'instagram', enabled: true },
          { platform: 'twitter', enabled: true },
          { platform: 'facebook', enabled: true }
        ]
      }).unwrap();
      setTemplateDialog(false);
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await deleteTemplate(templateId).unwrap();
      setMenuAnchor(null);
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const handleDuplicateTemplate = async (templateId: string) => {
    try {
      await duplicateTemplate({ id: templateId }).unwrap();
      setMenuAnchor(null);
    } catch (error) {
      console.error('Failed to duplicate template:', error);
    }
  };

  const handleCreateBrandGuidelines = async (guidelinesData: {
    brandName: string;
    description: string;
    tone: BrandGuidelines['voice']['tone'];
  }) => {
    try {
      await createBrandGuidelines({
        brand: {
          name: guidelinesData.brandName,
          description: guidelinesData.description,
          values: [],
          personality: [],
          targetAudience: {
            demographics: [],
            interests: [],
            painPoints: []
          }
        },
        visual: {
          logo: {
            primary: '',
            variants: []
          },
          colors: {
            primary: [],
            secondary: [],
            accent: [],
            neutral: []
          },
          typography: {
            primary: { name: '', family: '', weights: [], usage: '' }
          },
          imagery: {
            style: [],
            subjects: [],
            composition: [],
            lighting: [],
            avoid: []
          }
        },
        voice: {
          tone: guidelinesData.tone,
          personality: [],
          doUse: [],
          doNotUse: [],
          examples: {
            good: [],
            bad: []
          },
          grammarRules: []
        },
        content: {
          messaging: {
            keyMessages: [],
            valuePropositions: [],
            taglines: [],
            boilerplate: ''
          },
          guidelines: {
            postFrequency: {},
            hashtagStrategy: {
              recommended: [],
              avoid: [],
              maxPerPost: 10
            },
            contentTypes: [],
            approvalRequired: false
          }
        },
        platformSpecific: []
      }).unwrap();
      setBrandGuidelinesDialog(false);
    } catch (error) {
      console.error('Failed to create brand guidelines:', error);
    }
  };

  const handleUploadAsset = async (assetData: {
    file: File;
    name: string;
    type: BrandAsset['type'];
    category: string;
  }) => {
    try {
      await uploadBrandAsset({
        ...assetData,
        usage: {
          primary: false,
          platforms: [],
          contexts: []
        }
      }).unwrap();
      setAssetUploadDialog(false);
    } catch (error) {
      console.error('Failed to upload asset:', error);
    }
  };

  const handleCheckCompliance = async (content: any) => {
    try {
      const result = await checkBrandCompliance({
        content,
        platform: 'instagram'
      }).unwrap();
      setComplianceDialog({ open: true, content, result });
    } catch (error) {
      console.error('Failed to check compliance:', error);
    }
  };

  const getAssetIcon = (type: BrandAsset['type']) => {
    switch (type) {
      case 'image': return <ImageIcon />;
      case 'video': return <VideoIcon />;
      case 'audio': return <AudioIcon />;
      case 'document': return <DocumentIcon />;
      case 'font': return <FontIcon />;
      default: return <DocumentIcon />;
    }
  };


  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Templates & Brand Guidelines
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create consistent content with templates and maintain brand identity
        </Typography>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab 
              label="Templates" 
              icon={<TemplateIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Brand Guidelines" 
              icon={<BrandIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Brand Assets" 
              icon={<AssetsIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Analytics" 
              icon={<AnalyticsIcon />} 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Templates Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Typography variant="h6">Content Templates</Typography>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {categoriesData?.categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name} ({category.templateCount})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setTemplateDialog(true)}
            >
              Create Template
            </Button>
          </Box>

          {templatesLoading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {templatesData?.templates.map((template) => (
                <Grid item xs={12} sm={6} md={4} key={template.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Typography variant="h6" noWrap>
                          {template.name}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => setMenuAnchor({ element: e.currentTarget, template })}
                        >
                          <MoreIcon />
                        </IconButton>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {template.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        <Chip label={template.category} size="small" />
                        <Chip 
                          label={`${template.platforms.filter(p => p.enabled).length} platforms`} 
                          size="small" 
                          color="secondary"
                        />
                        {template.isFeatured && (
                          <Chip label="Featured" size="small" color="primary" />
                        )}
                      </Box>
                      
                      <Typography variant="caption" color="text.secondary">
                        Used {template.usage.useCount} times
                      </Typography>
                    </CardContent>
                    
                    <CardActions>
                      <Button size="small" startIcon={<PreviewIcon />}>
                        Preview
                      </Button>
                      <Button 
                        size="small" 
                        startIcon={<CheckIcon />}
                        onClick={() => handleCheckCompliance({
                          title: template.name,
                          body: template.content.body
                        })}
                      >
                        Check
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Brand Guidelines Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Brand Guidelines</Typography>
            {!brandGuidelines && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setBrandGuidelinesDialog(true)}
              >
                Create Guidelines
              </Button>
            )}
          </Box>

          {brandGuidelines ? (
            <Grid container spacing={3}>
              {/* Brand Overview */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Brand Overview
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {brandGuidelines.brand.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {brandGuidelines.brand.description}
                    </Typography>
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Brand Values
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      {brandGuidelines.brand.values.map((value, index) => (
                        <Chip key={index} label={value} size="small" />
                      ))}
                    </Box>
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Personality
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {brandGuidelines.brand.personality.map((trait, index) => (
                        <Chip key={index} label={trait} size="small" color="secondary" />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Voice & Tone */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Voice & Tone
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Tone: <strong>{brandGuidelines.voice.tone}</strong>
                    </Typography>
                    
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                      Do Use
                    </Typography>
                    <List dense>
                      {brandGuidelines.voice.doUse.slice(0, 3).map((item, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <ListItemIcon>
                            <CheckIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={item} />
                        </ListItem>
                      ))}
                    </List>
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Don't Use
                    </Typography>
                    <List dense>
                      {brandGuidelines.voice.doNotUse.slice(0, 3).map((item, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <ListItemIcon>
                            <ErrorIcon color="error" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={item} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Visual Identity */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Visual Identity
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" gutterBottom>
                          Primary Colors
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {brandGuidelines.visual.colors.primary.map((color, index) => (
                            <Box
                              key={index}
                              sx={{
                                width: 40,
                                height: 40,
                                backgroundColor: color.hex,
                                borderRadius: 1,
                                border: '1px solid #ddd'
                              }}
                              title={`${color.name}: ${color.hex}`}
                            />
                          ))}
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" gutterBottom>
                          Typography
                        </Typography>
                        <Typography variant="body2">
                          Primary: {brandGuidelines.visual.typography.primary.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {brandGuidelines.visual.typography.primary.family}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" gutterBottom>
                          Imagery Style
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {brandGuidelines.visual.imagery.style.slice(0, 3).map((style, index) => (
                            <Chip key={index} label={style} size="small" />
                          ))}
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Alert severity="info">
              No brand guidelines found. Create your first brand guidelines to maintain consistency across all content.
            </Alert>
          )}
        </TabPanel>

        {/* Brand Assets Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Brand Assets</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAssetUploadDialog(true)}
            >
              Upload Asset
            </Button>
          </Box>

          <Grid container spacing={3}>
            {brandAssets?.assets.map((asset) => (
              <Grid item xs={12} sm={6} md={3} key={asset.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        {getAssetIcon(asset.type)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" noWrap>
                          {asset.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {asset.type} • {asset.category}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {asset.type === 'image' && asset.url && (
                      <Box sx={{ mb: 2 }}>
                        <img
                          src={asset.thumbnailUrl || asset.url}
                          alt={asset.name}
                          style={{
                            width: '100%',
                            height: '120px',
                            objectFit: 'cover',
                            borderRadius: '4px'
                          }}
                        />
                      </Box>
                    )}
                    
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {asset.usage.primary && (
                        <Chip label="Primary" size="small" color="primary" />
                      )}
                      {asset.usage.platforms.slice(0, 2).map((platform) => (
                        <Chip key={platform} label={platform} size="small" />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h6" gutterBottom>
            Template Analytics
          </Typography>
          
          {analyticsData ? (
            <Grid container spacing={3}>
              {/* Usage Statistics */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Most Used Templates
                    </Typography>
                    <List>
                      {analyticsData.usage.slice(0, 5).map((template) => (
                        <ListItem key={template.templateId} divider>
                          <ListItemText
                            primary={template.name}
                            secondary={`${template.useCount} uses • Avg performance: ${template.averagePerformance.toFixed(1)}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Performance Metrics */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Performance Leaders
                    </Typography>
                    <List>
                      {analyticsData.performance.slice(0, 5).map((template) => (
                        <ListItem key={template.templateId} divider>
                          <ListItemText
                            primary={`Template ${template.templateId}`}
                            secondary={`Engagement: ${template.averageEngagement.toFixed(1)}% • Reach: ${template.averageReach}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Platform Distribution */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Platform Distribution
                    </Typography>
                    <Grid container spacing={2}>
                      {Object.entries(analyticsData.trends.platformDistribution).map(([platform, count]) => (
                        <Grid item xs={12} sm={6} md={3} key={platform}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="primary.main">
                              {count}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {platform}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Alert severity="info">
              No analytics data available yet. Start using templates to see performance metrics.
            </Alert>
          )}
        </TabPanel>
      </Paper>

      {/* Template Menu */}
      <Menu
        anchorEl={menuAnchor?.element}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => setMenuAnchor(null)}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Template
        </MenuItem>
        <MenuItem onClick={() => {
          if (menuAnchor?.template) {
            handleDuplicateTemplate(menuAnchor.template.id);
          }
        }}>
          <DuplicateIcon sx={{ mr: 1 }} />
          Duplicate
        </MenuItem>
        <MenuItem 
          onClick={() => {
            if (menuAnchor?.template) {
              handleDeleteTemplate(menuAnchor.template.id);
            }
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Create Template Dialog */}
      <CreateTemplateDialog
        open={templateDialog}
        onClose={() => setTemplateDialog(false)}
        onCreate={handleCreateTemplate}
      />

      {/* Create Brand Guidelines Dialog */}
      <CreateBrandGuidelinesDialog
        open={brandGuidelinesDialog}
        onClose={() => setBrandGuidelinesDialog(false)}
        onCreate={handleCreateBrandGuidelines}
      />

      {/* Upload Asset Dialog */}
      <UploadAssetDialog
        open={assetUploadDialog}
        onClose={() => setAssetUploadDialog(false)}
        onUpload={handleUploadAsset}
      />

      {/* Compliance Check Dialog */}
      <ComplianceCheckDialog
        open={complianceDialog.open}
        onClose={() => setComplianceDialog({ open: false })}
        result={complianceDialog.result}
      />
    </Container>
  );
};

// Create Template Dialog Component
interface CreateTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: any) => void;
}

const CreateTemplateDialog: React.FC<CreateTemplateDialogProps> = ({
  open,
  onClose,
  onCreate
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'social_post' as ContentTemplate['category'],
    content: {
      body: '',
      hashtags: [] as string[]
    }
  });

  const handleSubmit = () => {
    if (formData.name.trim() && formData.content.body.trim()) {
      onCreate(formData);
      setFormData({
        name: '',
        category: 'social_post',
        content: { body: '', hashtags: [] }
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create Content Template</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Template Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          sx={{ mb: 2, mt: 1 }}
        />
        
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as ContentTemplate['category'] })}
            label="Category"
          >
            <MenuItem value="social_post">Social Post</MenuItem>
            <MenuItem value="story">Story</MenuItem>
            <MenuItem value="carousel">Carousel</MenuItem>
            <MenuItem value="video">Video</MenuItem>
            <MenuItem value="email">Email</MenuItem>
            <MenuItem value="blog">Blog</MenuItem>
            <MenuItem value="ad">Advertisement</MenuItem>
          </Select>
        </FormControl>
        
        <TextField
          fullWidth
          label="Template Content"
          multiline
          rows={6}
          value={formData.content.body}
          onChange={(e) => setFormData({ 
            ...formData, 
            content: { ...formData.content, body: e.target.value }
          })}
          placeholder="Enter your template content here. Use {{variable_name}} for dynamic content."
          helperText="Use variables like {{company_name}} or {{product_name}} to make content dynamic"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!formData.name.trim() || !formData.content.body.trim()}
        >
          Create Template
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Create Brand Guidelines Dialog Component
interface CreateBrandGuidelinesDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: any) => void;
}

const CreateBrandGuidelinesDialog: React.FC<CreateBrandGuidelinesDialogProps> = ({
  open,
  onClose,
  onCreate
}) => {
  const [formData, setFormData] = useState({
    brandName: '',
    description: '',
    tone: 'professional' as BrandGuidelines['voice']['tone']
  });

  const handleSubmit = () => {
    if (formData.brandName.trim() && formData.description.trim()) {
      onCreate(formData);
      setFormData({ brandName: '', description: '', tone: 'professional' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Brand Guidelines</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Brand Name"
          value={formData.brandName}
          onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
          sx={{ mb: 2, mt: 1 }}
        />
        
        <TextField
          fullWidth
          label="Brand Description"
          multiline
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          sx={{ mb: 2 }}
        />
        
        <FormControl fullWidth>
          <InputLabel>Brand Tone</InputLabel>
          <Select
            value={formData.tone}
            onChange={(e) => setFormData({ ...formData, tone: e.target.value as BrandGuidelines['voice']['tone'] })}
            label="Brand Tone"
          >
            <MenuItem value="professional">Professional</MenuItem>
            <MenuItem value="casual">Casual</MenuItem>
            <MenuItem value="friendly">Friendly</MenuItem>
            <MenuItem value="authoritative">Authoritative</MenuItem>
            <MenuItem value="playful">Playful</MenuItem>
            <MenuItem value="inspirational">Inspirational</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!formData.brandName.trim() || !formData.description.trim()}
        >
          Create Guidelines
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Upload Asset Dialog Component
interface UploadAssetDialogProps {
  open: boolean;
  onClose: () => void;
  onUpload: (data: any) => void;
}

const UploadAssetDialog: React.FC<UploadAssetDialogProps> = ({
  open,
  onClose,
  onUpload
}) => {
  const [formData, setFormData] = useState({
    file: null as File | null,
    name: '',
    type: 'image' as BrandAsset['type'],
    category: 'logo'
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData({ ...formData, file, name: file.name });
    }
  };

  const handleSubmit = () => {
    if (formData.file && formData.name.trim()) {
      onUpload(formData);
      setFormData({ file: null, name: '', type: 'image', category: 'logo' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Upload Brand Asset</DialogTitle>
      <DialogContent>
        <TextField
          type="file"
          fullWidth
          onChange={handleFileChange}
          sx={{ mb: 2, mt: 1 }}
          inputProps={{ accept: 'image/*,video/*,audio/*,.pdf,.doc,.docx,.ttf,.otf' }}
        />
        
        <TextField
          fullWidth
          label="Asset Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          sx={{ mb: 2 }}
        />
        
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Asset Type</InputLabel>
          <Select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as BrandAsset['type'] })}
            label="Asset Type"
          >
            <MenuItem value="logo">Logo</MenuItem>
            <MenuItem value="image">Image</MenuItem>
            <MenuItem value="video">Video</MenuItem>
            <MenuItem value="audio">Audio</MenuItem>
            <MenuItem value="document">Document</MenuItem>
            <MenuItem value="font">Font</MenuItem>
          </Select>
        </FormControl>
        
        <TextField
          fullWidth
          label="Category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!formData.file || !formData.name.trim()}
        >
          Upload Asset
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Compliance Check Dialog Component
interface ComplianceCheckDialogProps {
  open: boolean;
  onClose: () => void;
  result?: any;
}

const ComplianceCheckDialog: React.FC<ComplianceCheckDialogProps> = ({
  open,
  onClose,
  result
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Brand Compliance Check</DialogTitle>
      <DialogContent>
        {result && (
          <>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="h3" color={result.compliant ? 'success.main' : 'warning.main'}>
                {result.score}/100
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Compliance Score
              </Typography>
            </Box>
            
            {result.issues.length > 0 && (
              <>
                <Typography variant="h6" gutterBottom>
                  Issues Found
                </Typography>
                <List>
                  {result.issues.map((issue: any, index: number) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        {issue.severity === 'error' ? <ErrorIcon color="error" /> :
                         issue.severity === 'warning' ? <WarningIcon color="warning" /> :
                         <CheckIcon color="info" />}
                      </ListItemIcon>
                      <ListItemText
                        primary={issue.message}
                        secondary={issue.suggestions.join(', ')}
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
            
            {result.compliant && (
              <Alert severity="success">
                Content fully complies with brand guidelines!
              </Alert>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};