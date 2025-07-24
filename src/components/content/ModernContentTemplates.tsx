import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Avatar,
  Badge,
  Tooltip,
  alpha,
  useTheme,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
  Divider,
} from '@mui/material';
import {
  Search,
  FilterList,
  TrendingUp,
  Star,
  StarBorder,
  Favorite,
  FavoriteBorder,
  Visibility,
  GetApp,
  Share,
  AutoAwesome,
  Category,
  Schedule,
  Analytics,
  Language,
  Group,
  Timer,
  ThumbUp,
  Comment,
  ExpandMore,
  Close,
  CheckCircle,
} from '@mui/icons-material';

interface ContentTemplate {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  industry: string;
  platform: string[];
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  popularity: number;
  rating: number;
  usageCount: number;
  isFavorite: boolean;
  isPremium: boolean;
  previewImage?: string;
  author: {
    name: string;
    avatar?: string;
    verified: boolean;
  };
  createdAt: string;
  updatedAt: string;
  metrics?: {
    avgEngagement: number;
    bestPerformingPlatform: string;
    successRate: number;
  };
}

interface ContentTemplatesProps {
  templates?: ContentTemplate[];
  loading?: boolean;
  onTemplateSelect: (template: ContentTemplate) => void;
  onTemplatePreview?: (template: ContentTemplate) => void;
  onTemplateFavorite?: (templateId: string, isFavorite: boolean) => void;
  showFilters?: boolean;
  showMetrics?: boolean;
}

const mockTemplates: ContentTemplate[] = [
  {
    id: '1',
    title: 'Product Launch Announcement',
    description: 'Perfect template for announcing new product launches with excitement and key features',
    content: '🚀 Exciting news! We\'re thrilled to announce [Product Name] - [brief description]. \n\n✨ Key features:\n• [Feature 1]\n• [Feature 2]\n• [Feature 3]\n\nAvailable now at [link]. What are you most excited about? 👇\n\n#ProductLaunch #Innovation #NewProduct',
    category: 'Product Marketing',
    industry: 'Technology',
    platform: ['linkedin', 'twitter', 'facebook'],
    tags: ['product-launch', 'announcement', 'features'],
    difficulty: 'beginner',
    estimatedTime: 15,
    popularity: 95,
    rating: 4.8,
    usageCount: 1247,
    isFavorite: false,
    isPremium: false,
    author: {
      name: 'Marketing Pro',
      avatar: '',
      verified: true,
    },
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    metrics: {
      avgEngagement: 8.5,
      bestPerformingPlatform: 'LinkedIn',
      successRate: 92,
    },
  },
  {
    id: '2',
    title: 'Behind-the-Scenes Story',
    description: 'Engage your audience with authentic behind-the-scenes content that builds trust',
    content: 'Want to see what goes on behind the scenes? 👀\n\n[Brief intro about the process/day]\n\n🎬 Here\'s what happened:\n→ [Step 1 or moment]\n→ [Step 2 or moment]\n→ [Step 3 or moment]\n\nThe best part? [Highlight the most interesting aspect]\n\nWhat would you like to see behind the scenes next? 💭\n\n#BehindTheScenes #Authentic #Process',
    category: 'Brand Storytelling',
    industry: 'General',
    platform: ['instagram', 'facebook', 'linkedin'],
    tags: ['behind-scenes', 'storytelling', 'authentic'],
    difficulty: 'intermediate',
    estimatedTime: 20,
    popularity: 88,
    rating: 4.6,
    usageCount: 823,
    isFavorite: true,
    isPremium: true,
    author: {
      name: 'Story Expert',
      avatar: '',
      verified: true,
    },
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18',
    metrics: {
      avgEngagement: 7.2,
      bestPerformingPlatform: 'Instagram',
      successRate: 85,
    },
  },
  {
    id: '3',
    title: 'Industry Insight & Tips',
    description: 'Share valuable insights and actionable tips to establish thought leadership',
    content: '💡 [Industry] Insight: [Main insight or trend]\n\n📊 What the data shows:\n[Key statistic or finding]\n\n🎯 3 actionable tips:\n\n1. [Tip 1] - [brief explanation]\n2. [Tip 2] - [brief explanation]  \n3. [Tip 3] - [brief explanation]\n\n💬 Which tip will you implement first?\n\n#IndustryInsights #Tips #ThoughtLeadership #[YourIndustry]',
    category: 'Thought Leadership',
    industry: 'Business',
    platform: ['linkedin', 'twitter'],
    tags: ['insights', 'tips', 'leadership', 'industry'],
    difficulty: 'advanced',
    estimatedTime: 25,
    popularity: 92,
    rating: 4.9,
    usageCount: 654,
    isFavorite: false,
    isPremium: true,
    author: {
      name: 'Industry Leader',
      avatar: '',
      verified: true,
    },
    createdAt: '2024-01-08',
    updatedAt: '2024-01-22',
    metrics: {
      avgEngagement: 9.1,
      bestPerformingPlatform: 'LinkedIn',
      successRate: 94,
    },
  },
];

const categories = ['All', 'Product Marketing', 'Brand Storytelling', 'Thought Leadership', 'Customer Success', 'Events'];
const platforms = ['All', 'LinkedIn', 'Twitter', 'Instagram', 'Facebook', 'TikTok', 'YouTube'];
const industries = ['All', 'Technology', 'Healthcare', 'Finance', 'Retail', 'Education', 'General'];

const platformIcons: Record<string, string> = {
  linkedin: '💼',
  twitter: '🐦',
  instagram: '📷',
  facebook: '📘',
  tiktok: '🎵',
  youtube: '📺',
};

const difficultyColors = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'error',
} as const;

export const ModernContentTemplates: React.FC<ContentTemplatesProps> = ({
  templates = mockTemplates,
  loading = false,
  onTemplateSelect,
  onTemplatePreview,
  onTemplateFavorite,
  showFilters = true,
  showMetrics = true,
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'recent'>('popularity');
  const [previewTemplate, setPreviewTemplate] = useState<ContentTemplate | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showOnlyPremium, setShowOnlyPremium] = useState(false);

  const filteredTemplates = useMemo(() => {
    let filtered = templates.filter((template) => {
      const matchesSearch = 
        template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
      const matchesPlatform = selectedPlatform === 'All' || template.platform.some(p => p.toLowerCase() === selectedPlatform.toLowerCase());
      const matchesIndustry = selectedIndustry === 'All' || template.industry === selectedIndustry;
      const matchesFavorites = !showOnlyFavorites || template.isFavorite;
      const matchesPremium = !showOnlyPremium || template.isPremium;

      return matchesSearch && matchesCategory && matchesPlatform && matchesIndustry && matchesFavorites && matchesPremium;
    });

    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return b.popularity - a.popularity;
      }
    });

    return filtered;
  }, [templates, searchTerm, selectedCategory, selectedPlatform, selectedIndustry, sortBy, showOnlyFavorites, showOnlyPremium]);

  const handleTemplatePreview = (template: ContentTemplate) => {
    setPreviewTemplate(template);
    setPreviewOpen(true);
    onTemplatePreview?.(template);
  };

  const handleTemplateSelect = (template: ContentTemplate) => {
    onTemplateSelect(template);
  };

  const handleFavoriteToggle = (template: ContentTemplate) => {
    onTemplateFavorite?.(template.id, !template.isFavorite);
  };

  if (loading) {
    return (
      <Box>
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={20} width="60%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesome color="primary" />
          Content Templates
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Choose from professionally crafted templates to accelerate your content creation
        </Typography>

        {/* Search and Quick Filters */}
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <TextField
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
          <Button
            variant={showOnlyFavorites ? 'contained' : 'outlined'}
            startIcon={showOnlyFavorites ? <Favorite /> : <FavoriteBorder />}
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            sx={{ borderRadius: 3 }}
          >
            Favorites
          </Button>
          <Button
            variant={showOnlyPremium ? 'contained' : 'outlined'}
            startIcon={<Star />}
            onClick={() => setShowOnlyPremium(!showOnlyPremium)}
            sx={{ borderRadius: 3 }}
          >
            Premium
          </Button>
        </Stack>

        {/* Filters */}
        {showFilters && (
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterList />
                Filters & Sorting
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Category</Typography>
                  <Stack direction="row" flexWrap="wrap" spacing={0.5}>
                    {categories.map((category) => (
                      <Chip
                        key={category}
                        label={category}
                        onClick={() => setSelectedCategory(category)}
                        color={selectedCategory === category ? 'primary' : 'default'}
                        size="small"
                        sx={{ mb: 0.5 }}
                      />
                    ))}
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Platform</Typography>
                  <Stack direction="row" flexWrap="wrap" spacing={0.5}>
                    {platforms.map((platform) => (
                      <Chip
                        key={platform}
                        label={platform}
                        onClick={() => setSelectedPlatform(platform)}
                        color={selectedPlatform === platform ? 'primary' : 'default'}
                        size="small"
                        sx={{ mb: 0.5 }}
                      />
                    ))}
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Industry</Typography>
                  <Stack direction="row" flexWrap="wrap" spacing={0.5}>
                    {industries.map((industry) => (
                      <Chip
                        key={industry}
                        label={industry}
                        onClick={() => setSelectedIndustry(industry)}
                        color={selectedIndustry === industry ? 'primary' : 'default'}
                        size="small"
                        sx={{ mb: 0.5 }}
                      />
                    ))}
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Sort by</Typography>
                  <Stack direction="row" spacing={0.5}>
                    {[
                      { value: 'popularity' as const, label: 'Popular' },
                      { value: 'rating' as const, label: 'Rating' },
                      { value: 'recent' as const, label: 'Recent' },
                    ].map((sort) => (
                      <Chip
                        key={sort.value}
                        label={sort.label}
                        onClick={() => setSortBy(sort.value)}
                        color={sortBy === sort.value ? 'primary' : 'default'}
                        size="small"
                      />
                    ))}
                  </Stack>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}
      </Paper>

      {/* Results Info */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">
          {filteredTemplates.length} templates found
        </Typography>
        <Stack direction="row" spacing={1}>
          <Chip
            icon={<TrendingUp />}
            label="Trending"
            size="small"
            color="secondary"
            variant="outlined"
          />
        </Stack>
      </Box>

      {/* Template Grid */}
      <Grid container spacing={3}>
        {filteredTemplates.map((template) => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'visible',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                borderRadius: 3,
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: theme.shadows[12],
                  '& .template-actions': {
                    opacity: 1,
                  },
                },
              }}
            >
              {/* Premium Badge */}
              {template.isPremium && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    zIndex: 1,
                  }}
                >
                  <Chip
                    icon={<Star />}
                    label="Premium"
                    size="small"
                    color="warning"
                    sx={{
                      background: alpha(theme.palette.warning.main, 0.9),
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                </Box>
              )}

              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                {/* Header */}
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600, pr: 1 }}>
                      {template.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {template.description}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => handleFavoriteToggle(template)}
                    sx={{
                      color: template.isFavorite ? theme.palette.error.main : theme.palette.action.active,
                    }}
                  >
                    {template.isFavorite ? <Favorite /> : <FavoriteBorder />}
                  </IconButton>
                </Stack>

                {/* Platforms */}
                <Stack direction="row" spacing={0.5} sx={{ mb: 2 }}>
                  {template.platform.map((platform) => (
                    <Tooltip key={platform} title={platform}>
                      <Typography variant="h6">
                        {platformIcons[platform.toLowerCase()]}
                      </Typography>
                    </Tooltip>
                  ))}
                </Stack>

                {/* Metrics */}
                <Grid container spacing={1} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Rating value={template.rating} precision={0.1} size="small" readOnly />
                      <Typography variant="caption" color="text.secondary">
                        {template.rating}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      {template.usageCount.toLocaleString()} uses
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Timer fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {template.estimatedTime}m
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={6}>
                    <Chip
                      label={template.difficulty}
                      size="small"
                      color={difficultyColors[template.difficulty]}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>

                {/* Tags */}
                <Stack direction="row" flexWrap="wrap" spacing={0.5} sx={{ mb: 2 }}>
                  {template.tags.slice(0, 3).map((tag) => (
                    <Chip key={tag} label={`#${tag}`} size="small" variant="outlined" />
                  ))}
                  {template.tags.length > 3 && (
                    <Chip label={`+${template.tags.length - 3}`} size="small" variant="outlined" />
                  )}
                </Stack>

                {/* Author */}
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Avatar sx={{ width: 24, height: 24 }}>
                    {template.author.name.charAt(0)}
                  </Avatar>
                  <Typography variant="caption" color="text.secondary">
                    by {template.author.name}
                  </Typography>
                  {template.author.verified && (
                    <CheckCircle fontSize="small" color="primary" />
                  )}
                </Stack>
              </CardContent>

              <CardActions
                className="template-actions"
                sx={{
                  p: 2,
                  pt: 0,
                  opacity: 0.7,
                  transition: 'opacity 0.3s ease',
                }}
              >
                <Button
                  size="small"
                  startIcon={<Visibility />}
                  onClick={() => handleTemplatePreview(template)}
                  sx={{ borderRadius: 2 }}
                >
                  Preview
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<GetApp />}
                  onClick={() => handleTemplateSelect(template)}
                  sx={{ borderRadius: 2 }}
                >
                  Use Template
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h5" fontWeight={600}>
              {previewTemplate?.title}
            </Typography>
            <IconButton onClick={() => setPreviewOpen(false)}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {previewTemplate && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {previewTemplate.description}
              </Typography>
              
              <Paper sx={{ p: 3, mb: 3, backgroundColor: alpha(theme.palette.background.default, 0.5) }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                  {previewTemplate.content}
                </Typography>
              </Paper>

              {showMetrics && previewTemplate.metrics && (
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Stack alignItems="center">
                      <Typography variant="h4" color="primary" fontWeight={700}>
                        {previewTemplate.metrics.avgEngagement}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Avg Engagement
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={4}>
                    <Stack alignItems="center">
                      <Typography variant="h4" color="secondary" fontWeight={700}>
                        {previewTemplate.metrics.successRate}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Success Rate
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={4}>
                    <Stack alignItems="center">
                      <Typography variant="body2" color="info.main" fontWeight={600}>
                        {previewTemplate.metrics.bestPerformingPlatform}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Best Platform
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setPreviewOpen(false)}>
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<GetApp />}
            onClick={() => {
              if (previewTemplate) {
                handleTemplateSelect(previewTemplate);
                setPreviewOpen(false);
              }
            }}
            sx={{ borderRadius: 2 }}
          >
            Use This Template
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};