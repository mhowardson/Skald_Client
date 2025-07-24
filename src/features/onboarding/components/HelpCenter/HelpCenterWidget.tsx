/**
 * Help Center Widget Component
 * 
 * Provides contextual help and support resources throughout the application.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Chip,
  InputAdornment,
  Fade,
  Zoom,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Help as HelpIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Article as ArticleIcon,
  OndemandVideo as VideoIcon,
  QuestionAnswer as FAQIcon,
  ContactSupport as ContactIcon,
  ArrowBack as BackIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  BookmarkBorder as BookmarkIcon,
  BookmarkAdded as BookmarkedIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon
} from '@mui/icons-material';

export interface HelpArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  category: 'getting-started' | 'features' | 'troubleshooting' | 'api' | 'billing';
  type: 'article' | 'video' | 'faq';
  estimatedReadTime?: number;
  videoUrl?: string;
  relatedArticles?: string[];
  tags: string[];
  helpful?: number;
  notHelpful?: number;
}

interface HelpCenterWidgetProps {
  contextualHelp?: HelpArticle[];
  position?: 'bottom-right' | 'bottom-left';
  initialOpen?: boolean;
}

const mockHelpArticles: HelpArticle[] = [
  {
    id: '1',
    title: 'Getting Started with ContentAutoPilot',
    description: 'Learn the basics of content creation and management',
    content: `
      <h2>Welcome to ContentAutoPilot!</h2>
      <p>This guide will help you get started with creating and managing content.</p>
      <h3>Key Features:</h3>
      <ul>
        <li>AI-powered content generation</li>
        <li>Multi-platform optimization</li>
        <li>Team collaboration</li>
        <li>Analytics and insights</li>
      </ul>
    `,
    category: 'getting-started',
    type: 'article',
    estimatedReadTime: 5,
    tags: ['beginner', 'tutorial', 'onboarding'],
    helpful: 42,
    notHelpful: 3
  },
  {
    id: '2',
    title: 'How to Create Your First Workspace',
    description: 'Step-by-step guide to workspace creation',
    content: 'Workspace creation guide content...',
    category: 'getting-started',
    type: 'video',
    videoUrl: 'https://example.com/video/workspace-creation',
    estimatedReadTime: 3,
    tags: ['workspace', 'setup', 'tutorial'],
    helpful: 28,
    notHelpful: 1
  },
  {
    id: '3',
    title: 'AI Content Generation Best Practices',
    description: 'Tips for getting the best results from AI',
    content: 'AI best practices content...',
    category: 'features',
    type: 'article',
    estimatedReadTime: 7,
    tags: ['ai', 'content', 'advanced'],
    helpful: 67,
    notHelpful: 5
  },
  {
    id: '4',
    title: 'Troubleshooting Connection Issues',
    description: 'Common connection problems and solutions',
    content: 'Troubleshooting guide content...',
    category: 'troubleshooting',
    type: 'faq',
    estimatedReadTime: 4,
    tags: ['troubleshooting', 'connection', 'errors'],
    helpful: 15,
    notHelpful: 2
  }
];

export const HelpCenterWidget: React.FC<HelpCenterWidgetProps> = ({
  contextualHelp = [],
  position = 'bottom-right',
  initialOpen = false
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Set<string>>(new Set());
  const [helpfulArticles, setHelpfulArticles] = useState<Set<string>>(new Set());
  const [notHelpfulArticles, setNotHelpfulArticles] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['getting-started']));

  // Load bookmarks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('helpCenterBookmarks');
    if (saved) {
      setBookmarkedArticles(new Set(JSON.parse(saved)));
    }
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedArticle(null);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSelectArticle = (article: HelpArticle) => {
    setSelectedArticle(article);
  };

  const handleBack = () => {
    setSelectedArticle(null);
  };

  const handleToggleBookmark = (articleId: string) => {
    const newBookmarks = new Set(bookmarkedArticles);
    if (newBookmarks.has(articleId)) {
      newBookmarks.delete(articleId);
    } else {
      newBookmarks.add(articleId);
    }
    setBookmarkedArticles(newBookmarks);
    localStorage.setItem('helpCenterBookmarks', JSON.stringify(Array.from(newBookmarks)));
  };

  const handleHelpful = (articleId: string, isHelpful: boolean) => {
    if (isHelpful) {
      const newHelpful = new Set(helpfulArticles);
      newHelpful.add(articleId);
      setHelpfulArticles(newHelpful);
      notHelpfulArticles.delete(articleId);
    } else {
      const newNotHelpful = new Set(notHelpfulArticles);
      newNotHelpful.add(articleId);
      setNotHelpfulArticles(newNotHelpful);
      helpfulArticles.delete(articleId);
    }
  };

  const handleToggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Filter articles based on search
  const filteredArticles = [...mockHelpArticles, ...contextualHelp].filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Group articles by category
  const articlesByCategory = filteredArticles.reduce((acc, article) => {
    if (!acc[article.category]) {
      acc[article.category] = [];
    }
    acc[article.category].push(article);
    return acc;
  }, {} as Record<string, HelpArticle[]>);

  const getCategoryIcon = (type: HelpArticle['type']) => {
    switch (type) {
      case 'video':
        return <VideoIcon />;
      case 'faq':
        return <FAQIcon />;
      default:
        return <ArticleIcon />;
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const widgetPosition = position === 'bottom-right' 
    ? { bottom: 20, right: 20 }
    : { bottom: 20, left: 20 };

  return (
    <>
      {/* Help Button */}
      <Zoom in={!isOpen}>
        <Box
          sx={{
            position: 'fixed',
            ...widgetPosition,
            zIndex: 1300
          }}
        >
          <Tooltip title="Help & Support" placement="top">
            <IconButton
              onClick={handleToggle}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                width: 56,
                height: 56,
                boxShadow: 3,
                '&:hover': {
                  bgcolor: 'primary.dark',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <HelpIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Zoom>

      {/* Help Widget */}
      <Fade in={isOpen}>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            ...widgetPosition,
            width: isMinimized ? 320 : 380,
            height: isMinimized ? 60 : 500,
            maxHeight: '80vh',
            display: isOpen ? 'flex' : 'none',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 1300,
            transition: 'all 0.3s ease'
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {selectedArticle && (
                <IconButton
                  size="small"
                  onClick={handleBack}
                  sx={{ color: 'white' }}
                >
                  <BackIcon />
                </IconButton>
              )}
              <Typography variant="h6">
                {selectedArticle ? selectedArticle.title : 'Help Center'}
              </Typography>
            </Box>
            <Box>
              <IconButton
                size="small"
                onClick={handleMinimize}
                sx={{ color: 'white' }}
              >
                {isMinimized ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
              <IconButton
                size="small"
                onClick={handleClose}
                sx={{ color: 'white' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Content */}
          {!isMinimized && (
            <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {selectedArticle ? (
                // Article View
                <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                  {/* Article Header */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {getCategoryIcon(selectedArticle.type)}
                      <Chip
                        label={getCategoryLabel(selectedArticle.category)}
                        size="small"
                        color="primary"
                      />
                      {selectedArticle.estimatedReadTime && (
                        <Typography variant="caption" color="text.secondary">
                          {selectedArticle.estimatedReadTime} min read
                        </Typography>
                      )}
                      <Box sx={{ flex: 1 }} />
                      <IconButton
                        size="small"
                        onClick={() => handleToggleBookmark(selectedArticle.id)}
                      >
                        {bookmarkedArticles.has(selectedArticle.id) ? (
                          <BookmarkedIcon color="primary" />
                        ) : (
                          <BookmarkIcon />
                        )}
                      </IconButton>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {selectedArticle.description}
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* Article Content */}
                  {selectedArticle.type === 'video' && selectedArticle.videoUrl ? (
                    <Box
                      component="iframe"
                      src={selectedArticle.videoUrl}
                      sx={{
                        width: '100%',
                        height: 200,
                        border: 'none',
                        borderRadius: 1,
                        mb: 2
                      }}
                    />
                  ) : (
                    <Box
                      dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                      sx={{
                        '& h2': { fontSize: '1.2rem', fontWeight: 600, mt: 2, mb: 1 },
                        '& h3': { fontSize: '1rem', fontWeight: 600, mt: 1.5, mb: 0.5 },
                        '& p': { mb: 1 },
                        '& ul': { pl: 3 },
                        '& li': { mb: 0.5 }
                      }}
                    />
                  )}

                  {/* Article Footer */}
                  <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="body2" gutterBottom>
                      Was this helpful?
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Button
                        size="small"
                        variant={helpfulArticles.has(selectedArticle.id) ? 'contained' : 'outlined'}
                        startIcon={<ThumbUpIcon />}
                        onClick={() => handleHelpful(selectedArticle.id, true)}
                      >
                        Yes ({(selectedArticle.helpful || 0) + (helpfulArticles.has(selectedArticle.id) ? 1 : 0)})
                      </Button>
                      <Button
                        size="small"
                        variant={notHelpfulArticles.has(selectedArticle.id) ? 'contained' : 'outlined'}
                        startIcon={<ThumbDownIcon />}
                        onClick={() => handleHelpful(selectedArticle.id, false)}
                      >
                        No ({(selectedArticle.notHelpful || 0) + (notHelpfulArticles.has(selectedArticle.id) ? 1 : 0)})
                      </Button>
                    </Box>

                    {/* Tags */}
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {selectedArticle.tags.map(tag => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          variant="outlined"
                          onClick={() => handleSearch(tag)}
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>
              ) : (
                // Article List View
                <>
                  {/* Search */}
                  <Box sx={{ p: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search help articles..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Box>

                  {/* Articles List */}
                  <Box sx={{ flex: 1, overflow: 'auto' }}>
                    {Object.entries(articlesByCategory).map(([category, articles]) => (
                      <Box key={category}>
                        <ListItemButton
                          onClick={() => handleToggleCategory(category)}
                          sx={{ bgcolor: 'grey.50' }}
                        >
                          <ListItemText
                            primary={getCategoryLabel(category)}
                            secondary={`${articles.length} articles`}
                          />
                          {expandedCategories.has(category) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </ListItemButton>
                        <Collapse in={expandedCategories.has(category)}>
                          <List disablePadding>
                            {articles.map((article) => (
                              <ListItem key={article.id} disablePadding>
                                <ListItemButton
                                  onClick={() => handleSelectArticle(article)}
                                  sx={{ pl: 4 }}
                                >
                                  <ListItemIcon sx={{ minWidth: 40 }}>
                                    {getCategoryIcon(article.type)}
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={article.title}
                                    secondary={article.description}
                                    primaryTypographyProps={{ variant: 'body2' }}
                                    secondaryTypographyProps={{ variant: 'caption' }}
                                  />
                                  {bookmarkedArticles.has(article.id) && (
                                    <BookmarkedIcon color="action" fontSize="small" />
                                  )}
                                </ListItemButton>
                              </ListItem>
                            ))}
                          </List>
                        </Collapse>
                      </Box>
                    ))}
                  </Box>

                  {/* Quick Actions */}
                  <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<ContactIcon />}
                      size="small"
                    >
                      Contact Support
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          )}
        </Paper>
      </Fade>
    </>
  );
};