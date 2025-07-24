/**
 * Topic Frameworks Table Component
 * 
 * Displays comprehensive topic/problem/solution frameworks in a data table
 * with filtering, sorting, and detailed analysis capabilities.
 * 
 * @component TopicFrameworksTable
 * @version 1.0.0
 * 
 * @features
 * - Structured table displaying topic analysis frameworks
 * - Problem/solution pairs with performance metrics
 * - Content examples and hook variations
 * - Interactive filtering by urgency, difficulty, and trending score
 * - Sortable columns with custom sort functions
 * - Expandable rows showing detailed framework information
 * - Export functionality for framework data
 * 
 * @props
 * - data: TopicProblemSolution[] | undefined - Framework data from API
 * - isLoading: boolean - Loading state indicator
 * - industry: string - Selected industry for context
 * 
 * @table_columns
 * - Topic: Main content topic with category
 * - Problem: Pain points and target audience
 * - Solution: Approach and benefits
 * - Performance: Engagement rates and trending scores
 * - Examples: Top performing content samples
 * - Actions: View details and copy framework
 * 
 * @interactions
 * - Click row to expand detailed view
 * - Sort by any column header
 * - Filter by framework performance metrics
 * - Copy framework template for content creation
 * - Export selected frameworks to CSV
 */

import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  Chip,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Tooltip,
  Button,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Alert,
  Skeleton,
  Paper,
  Stack,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  Lightbulb,
  ContentCopy,
  FilterList,
  GetApp,
} from '@mui/icons-material';
import { TopicProblemSolution } from '../../store/api/researchApi';

interface TopicFrameworksTableProps {
  data: TopicProblemSolution[] | undefined;
  isLoading: boolean;
  industry: string;
}

type SortField = 'topic' | 'urgency' | 'difficulty' | 'trending' | 'engagement';
type SortDirection = 'asc' | 'desc';

interface SortState {
  field: SortField;
  direction: SortDirection;
}

/**
 * Topic Frameworks Table Component
 * 
 * Interactive table displaying topic/problem/solution frameworks
 * with comprehensive analysis and performance metrics.
 */
const TopicFrameworksTable: React.FC<TopicFrameworksTableProps> = ({
  data,
  isLoading,
  industry,
}) => {
  // State Management
  const [sortState, setSortState] = useState<SortState>({ field: 'trending', direction: 'desc' });
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Handle sorting
  const handleSort = (field: SortField) => {
    setSortState(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Handle row expansion
  const handleRowExpand = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Handle filters
  const handleUrgencyFilterChange = (event: SelectChangeEvent<string>) => {
    setUrgencyFilter(event.target.value);
  };

  const handleDifficultyFilterChange = (event: SelectChangeEvent<string>) => {
    setDifficultyFilter(event.target.value);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCopyFramework = (framework: TopicProblemSolution) => {
    const frameworkText = `
Topic: ${framework.topic}
Problem: ${framework.problem.description}
Solution: ${framework.solution.description}
Core Message: ${framework.message.coreMessage}
Call to Action: ${framework.message.callToAction}
    `.trim();
    
    navigator.clipboard.writeText(frameworkText);
    // Show success notification
  };

  const handleExportFrameworks = () => {
    // Implementation for CSV export
    console.log('Exporting frameworks to CSV');
    handleMenuClose();
  };

  // Sort and filter data
  const sortedAndFilteredData = useMemo(() => {
    if (!data) return [];

    let filtered = data.filter(framework => {
      const urgencyMatch = urgencyFilter === 'all' || framework.problem.urgency === urgencyFilter;
      const difficultyMatch = difficultyFilter === 'all' || framework.solution.difficulty === difficultyFilter;
      return urgencyMatch && difficultyMatch;
    });

    return filtered.sort((a, b) => {
      const direction = sortState.direction === 'asc' ? 1 : -1;
      
      switch (sortState.field) {
        case 'topic':
          return direction * a.topic.localeCompare(b.topic);
        case 'urgency':
          const urgencyOrder = { low: 1, medium: 2, high: 3 };
          return direction * (urgencyOrder[a.problem.urgency] - urgencyOrder[b.problem.urgency]);
        case 'difficulty':
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
          return direction * (difficultyOrder[a.solution.difficulty] - difficultyOrder[b.solution.difficulty]);
        case 'trending':
          return direction * (a.performance.trendingScore - b.performance.trendingScore);
        case 'engagement':
          return direction * (a.performance.averageEngagementRate - b.performance.averageEngagementRate);
        default:
          return 0;
      }
    });
  }, [data, sortState, urgencyFilter, difficultyFilter]);

  // Utility functions
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'hard': return 'error';
      case 'medium': return 'warning';
      case 'easy': return 'success';
      default: return 'default';
    }
  };


  // Loading skeleton
  if (isLoading) {
    return (
      <Card>
        <CardHeader 
          title={<Skeleton width="40%" />}
          action={<Skeleton variant="circular" width={40} height={40} />}
        />
        <CardContent>
          {[1, 2, 3, 4, 5].map((item) => (
            <Skeleton key={item} variant="rectangular" height={60} sx={{ mb: 1 }} />
          ))}
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!data || data.length === 0) {
    return (
      <Alert severity="info">
        No topic frameworks available for {industry.replace('_', ' ')}. 
        Run a competitor analysis to generate framework insights.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header with Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            <Lightbulb sx={{ mr: 1, verticalAlign: 'middle' }} />
            Topic/Problem/Solution Frameworks
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {sortedAndFilteredData.length} frameworks for {industry.replace('_', ' ')} industry
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<FilterList />}
            onClick={handleMenuOpen}
            variant="outlined"
            size="small"
          >
            Export
          </Button>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={handleExportFrameworks}>
              <GetApp sx={{ mr: 1 }} />
              Export CSV
            </MenuItem>
          </Menu>
        </Stack>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={3} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Urgency</InputLabel>
              <Select
                value={urgencyFilter}
                label="Urgency"
                onChange={handleUrgencyFilterChange}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={difficultyFilter}
                label="Difficulty"
                onChange={handleDifficultyFilterChange}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </Select>
            </FormControl>

            <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
              Showing {sortedAndFilteredData.length} of {data.length} frameworks
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="40px" />
                <TableCell>
                  <TableSortLabel
                    active={sortState.field === 'topic'}
                    direction={sortState.field === 'topic' ? sortState.direction : 'asc'}
                    onClick={() => handleSort('topic')}
                  >
                    Topic
                  </TableSortLabel>
                </TableCell>
                <TableCell>Problem</TableCell>
                <TableCell>Solution</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortState.field === 'urgency'}
                    direction={sortState.field === 'urgency' ? sortState.direction : 'asc'}
                    onClick={() => handleSort('urgency')}
                  >
                    Urgency
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortState.field === 'difficulty'}
                    direction={sortState.field === 'difficulty' ? sortState.direction : 'asc'}
                    onClick={() => handleSort('difficulty')}
                  >
                    Difficulty
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortState.field === 'engagement'}
                    direction={sortState.field === 'engagement' ? sortState.direction : 'asc'}
                    onClick={() => handleSort('engagement')}
                  >
                    Performance
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedAndFilteredData.map((framework) => (
                <React.Fragment key={framework.id}>
                  <TableRow 
                    hover 
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleRowExpand(framework.id)}
                  >
                    <TableCell>
                      <IconButton size="small">
                        {expandedRows.has(framework.id) ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </TableCell>
                    
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          {framework.topic}
                        </Typography>
                        <Chip 
                          label={framework.category}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 300 }}>
                        {framework.problem.description.length > 100 
                          ? `${framework.problem.description.substring(0, 100)}...`
                          : framework.problem.description
                        }
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {framework.problem.painPoints.length} pain points
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 300 }}>
                        {framework.solution.description.length > 100
                          ? `${framework.solution.description.substring(0, 100)}...`
                          : framework.solution.description
                        }
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {framework.solution.benefits.length} benefits
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={framework.problem.urgency.toUpperCase()}
                        color={getUrgencyColor(framework.problem.urgency) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
                        size="small"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={framework.solution.difficulty.toUpperCase()}
                        color={getDifficultyColor(framework.solution.difficulty) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          Engagement: {framework.performance.averageEngagementRate.toFixed(1)}%
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={framework.performance.trendingScore}
                            sx={{ flexGrow: 1, mr: 1 }}
                          />
                          <Typography variant="caption">
                            {framework.performance.trendingScore}/100
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell align="center">
                      <Tooltip title="Copy Framework">
                        <IconButton 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyFramework(framework);
                          }}
                        >
                          <ContentCopy />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded Row Content */}
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                      <Collapse in={expandedRows.has(framework.id)} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2 }}>
                          <Typography variant="h6" gutterBottom>
                            Framework Details
                          </Typography>
                          
                          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                            {/* Problem Details */}
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Problem Analysis
                              </Typography>
                              <Typography variant="body2" paragraph>
                                {framework.problem.description}
                              </Typography>
                              
                              <Typography variant="caption" display="block" gutterBottom>
                                Pain Points:
                              </Typography>
                              <List dense>
                                {framework.problem.painPoints.map((point, index) => (
                                  <ListItem key={index} sx={{ py: 0 }}>
                                    <ListItemText 
                                      primary={point}
                                      primaryTypographyProps={{ variant: 'body2' }}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                              
                              <Typography variant="caption" display="block">
                                Target Audience: {framework.problem.targetAudience.join(', ')}
                              </Typography>
                            </Box>
                            
                            {/* Solution Details */}
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Solution Framework
                              </Typography>
                              <Typography variant="body2" paragraph>
                                {framework.solution.description}
                              </Typography>
                              
                              <Typography variant="caption" display="block" gutterBottom>
                                Benefits:
                              </Typography>
                              <List dense>
                                {framework.solution.benefits.map((benefit, index) => (
                                  <ListItem key={index} sx={{ py: 0 }}>
                                    <ListItemText 
                                      primary={benefit}
                                      primaryTypographyProps={{ variant: 'body2' }}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                              
                              <Typography variant="caption" display="block">
                                Approach: {framework.solution.approach}
                              </Typography>
                            </Box>
                            
                            {/* Messaging & Performance */}
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Messaging & Performance
                              </Typography>
                              
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" display="block">
                                  Core Message:
                                </Typography>
                                <Typography variant="body2" paragraph>
                                  {framework.message.coreMessage}
                                </Typography>
                                
                                <Typography variant="caption" display="block">
                                  Call to Action:
                                </Typography>
                                <Typography variant="body2">
                                  {framework.message.callToAction}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                                <Typography variant="caption" display="block">
                                  Performance Metrics:
                                </Typography>
                                <Typography variant="body2">
                                  Success Rate: {((framework.performance.successfulPosts / framework.performance.totalPosts) * 100).toFixed(1)}%
                                </Typography>
                                <Typography variant="body2">
                                  Avg Views: {framework.performance.averageViews.toLocaleString()}
                                </Typography>
                                <Typography variant="body2">
                                  Total Posts: {framework.performance.totalPosts}
                                </Typography>
                              </Box>
                            </Box>
                          </Stack>
                          
                          {/* Examples Section */}
                          {framework.examples.hooks.length > 0 && (
                            <Box sx={{ mt: 3 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Hook Examples
                              </Typography>
                              <Stack direction="row" spacing={1} flexWrap="wrap">
                                {framework.examples.hooks.slice(0, 5).map((hook, index) => (
                                  <Chip 
                                    key={index}
                                    label={hook}
                                    size="small"
                                    variant="outlined"
                                    sx={{ mb: 1 }}
                                  />
                                ))}
                              </Stack>
                            </Box>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default TopicFrameworksTable;