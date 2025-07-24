import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Button,
  LinearProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Visibility as ViewIcon,
  Share as ShareIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';

interface ContentItem {
  id: string;
  title: string;
  description?: string;
  platform: string;
  type: 'post' | 'story' | 'reel' | 'video';
  status: 'published' | 'scheduled' | 'draft';
  publishedDate?: string;
  scheduledDate?: string;
  createdAt: string;
  thumbnailUrl?: string;
  metrics?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    engagementRate?: number;
    reachImpact?: 'low' | 'medium' | 'high';
  };
  sentiment?: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
  };
}

interface ContentListViewProps {
  content?: ContentItem[];
  onContentClick?: (content: ContentItem) => void;
  onCreateContent?: () => void;
  onEditContent?: (content: any) => void;
  onContentDelete?: (content: ContentItem) => void;
  onContentDuplicate?: (content: ContentItem) => void;
  loading?: boolean;
}

type SortField = 'title' | 'platform' | 'status' | 'publishedDate' | 'engagementRate';
type SortDirection = 'asc' | 'desc';

const platformColors: Record<string, string> = {
  instagram: '#E4405F',
  twitter: '#1DA1F2',
  linkedin: '#0077B5',
  youtube: '#FF0000',
  tiktok: '#000000',
  facebook: '#1877F2'
};

const platformIcons: Record<string, string> = {
  instagram: '📷',
  twitter: '🐦',
  linkedin: '💼',
  youtube: '📺',
  tiktok: '🎵',
  facebook: '👥'
};

export const ContentListView: React.FC<ContentListViewProps> = ({
  content = [],
  onContentClick,
  onEditContent,
  onContentDelete,
  onContentDuplicate,
  loading = false
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>('publishedDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);

  // Filter and sort content
  const filteredContent = content
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesPlatform = platformFilter === 'all' || item.platform === platformFilter;
      
      return matchesSearch && matchesStatus && matchesPlatform;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'platform':
          aValue = a.platform;
          bValue = b.platform;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'publishedDate':
          aValue = new Date(a.publishedDate || a.scheduledDate || a.createdAt).getTime();
          bValue = new Date(b.publishedDate || b.scheduledDate || b.createdAt).getTime();
          break;
        case 'engagementRate':
          aValue = a.metrics?.engagementRate || 0;
          bValue = b.metrics?.engagementRate || 0;
          break;
        default:
          return 0;
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const paginatedContent = filteredContent.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, content: ContentItem) => {
    setMenuAnchor(event.currentTarget);
    setSelectedContent(content);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedContent(null);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatEngagement = (rate?: number) => {
    if (!rate) return '-';
    return `${(rate * 100).toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'success';
      case 'scheduled': return 'warning';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const getImpactColor = (impact?: string) => {
    switch (impact) {
      case 'high': return 'success';
      case 'medium': return 'warning';
      case 'low': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      {/* Filters and Search */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          size="small"
          sx={{ minWidth: 250 }}
        />
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="published">Published</MenuItem>
            <MenuItem value="scheduled">Scheduled</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Platform</InputLabel>
          <Select
            value={platformFilter}
            label="Platform"
            onChange={(e) => setPlatformFilter(e.target.value)}
          >
            <MenuItem value="all">All Platforms</MenuItem>
            <MenuItem value="instagram">Instagram</MenuItem>
            <MenuItem value="twitter">Twitter</MenuItem>
            <MenuItem value="linkedin">LinkedIn</MenuItem>
            <MenuItem value="youtube">YouTube</MenuItem>
            <MenuItem value="tiktok">TikTok</MenuItem>
            <MenuItem value="facebook">Facebook</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          startIcon={<FilterIcon />}
          size="small"
        >
          More Filters
        </Button>
      </Box>

      {/* Results Count */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Showing {paginatedContent.length} of {filteredContent.length} content items
      </Typography>

      {/* Loading State */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Content</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'platform'}
                  direction={sortField === 'platform' ? sortDirection : 'asc'}
                  onClick={() => handleSort('platform')}
                >
                  Platform
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'status'}
                  direction={sortField === 'status' ? sortDirection : 'asc'}
                  onClick={() => handleSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'publishedDate'}
                  direction={sortField === 'publishedDate' ? sortDirection : 'asc'}
                  onClick={() => handleSort('publishedDate')}
                >
                  Date
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">Performance</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'engagementRate'}
                  direction={sortField === 'engagementRate' ? sortDirection : 'asc'}
                  onClick={() => handleSort('engagementRate')}
                >
                  Engagement
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedContent.map((item) => (
              <TableRow
                key={item.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => onContentClick?.(item)}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {item.thumbnailUrl ? (
                      <Avatar
                        src={item.thumbnailUrl}
                        variant="rounded"
                        sx={{ width: 48, height: 48 }}
                      />
                    ) : (
                      <Avatar
                        variant="rounded"
                        sx={{ 
                          width: 48, 
                          height: 48,
                          bgcolor: platformColors[item.platform]
                        }}
                      >
                        {platformIcons[item.platform]}
                      </Avatar>
                    )}
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.type} • {item.description?.substring(0, 50)}
                        {item.description && item.description.length > 50 ? '...' : ''}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                <TableCell>
                  <Chip
                    label={item.platform}
                    size="small"
                    sx={{
                      bgcolor: platformColors[item.platform],
                      color: 'white',
                      textTransform: 'capitalize'
                    }}
                  />
                </TableCell>

                <TableCell>
                  <Chip
                    label={item.status}
                    size="small"
                    color={getStatusColor(item.status) as any}
                    variant="outlined"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </TableCell>

                <TableCell>
                  <Typography variant="body2">
                    {formatDate(item.publishedDate || item.scheduledDate)}
                  </Typography>
                  {item.status === 'scheduled' && (
                    <Typography variant="caption" color="warning.main">
                      Scheduled
                    </Typography>
                  )}
                </TableCell>

                <TableCell align="center">
                  {item.metrics ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Typography variant="body2" fontWeight="600">
                        {item.metrics.views?.toLocaleString() || '-'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        views
                      </Typography>
                      {item.metrics.reachImpact && (
                        <Chip
                          label={item.metrics.reachImpact}
                          size="small"
                          color={getImpactColor(item.metrics.reachImpact) as any}
                          sx={{ mt: 0.5, fontSize: '0.6rem', height: 16 }}
                        />
                      )}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>

                <TableCell align="center">
                  <Typography variant="body2" fontWeight="600">
                    {formatEngagement(item.metrics?.engagementRate)}
                  </Typography>
                  {item.sentiment && (
                    <Typography 
                      variant="caption" 
                      color={item.sentiment.label === 'positive' ? 'success.main' : 
                             item.sentiment.label === 'negative' ? 'error.main' : 'text.secondary'}
                    >
                      {item.sentiment.label}
                    </Typography>
                  )}
                </TableCell>

                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuOpen(e, item);
                    }}
                  >
                    <MoreIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={filteredContent.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedContent) onContentClick?.(selectedContent);
          handleMenuClose();
        }}>
          <ViewIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedContent) onEditContent?.(selectedContent);
          handleMenuClose();
        }}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Content
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedContent) onContentDuplicate?.(selectedContent);
          handleMenuClose();
        }}>
          <CopyIcon sx={{ mr: 1 }} />
          Duplicate
        </MenuItem>
        <MenuItem>
          <ShareIcon sx={{ mr: 1 }} />
          Share
        </MenuItem>
        <MenuItem>
          <AnalyticsIcon sx={{ mr: 1 }} />
          View Analytics
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedContent) onContentDelete?.(selectedContent);
          handleMenuClose();
        }} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};