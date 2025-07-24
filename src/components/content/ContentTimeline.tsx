import React from 'react';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Button,
  Grid,
  Paper,
  LinearProgress
} from '@mui/material';
import {
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  Movie as TikTokIcon,
  PlayArrow as PlayIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  Comment as CommentIcon,
  Visibility as ViewsIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as PublishedIcon,
  HourglassEmpty as DraftIcon
} from '@mui/icons-material';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  platform: 'instagram' | 'youtube' | 'twitter' | 'facebook' | 'tiktok';
  type: 'post' | 'video' | 'story' | 'reel';
  status: 'draft' | 'scheduled' | 'published';
  scheduledDate?: string;
  publishedDate?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  metrics?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    engagementRate?: number;
    reachImpact?: 'low' | 'medium' | 'high' | 'viral';
  };
  sentiment?: {
    score: number;
    label: 'positive' | 'neutral' | 'negative';
  };
}

interface ContentTimelineProps {
  content?: ContentItem[];
  onContentClick?: (content: ContentItem) => void;
  onCreateContent?: () => void;
  onEditContent?: (content: any) => void;
  loading?: boolean;
}

const platformIcons = {
  instagram: <InstagramIcon sx={{ color: '#E4405F' }} />,
  youtube: <YouTubeIcon sx={{ color: '#FF0000' }} />,
  twitter: <TwitterIcon sx={{ color: '#1DA1F2' }} />,
  facebook: <FacebookIcon sx={{ color: '#1877F2' }} />,
  tiktok: <TikTokIcon sx={{ color: '#000000' }} />
};

const statusIcons = {
  draft: <DraftIcon color="action" />,
  scheduled: <ScheduleIcon color="warning" />,
  published: <PublishedIcon color="success" />
};

const getImpactColor = (impact?: string) => {
  switch (impact) {
    case 'viral': return '#ff1744';
    case 'high': return '#ff9800';
    case 'medium': return '#2196f3';
    case 'low': return '#9e9e9e';
    default: return '#9e9e9e';
  }
};

const getSentimentColor = (sentiment?: string) => {
  switch (sentiment) {
    case 'positive': return '#4caf50';
    case 'negative': return '#f44336';
    case 'neutral': return '#ff9800';
    default: return '#9e9e9e';
  }
};

const formatNumber = (num?: number) => {
  if (!num) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export const ContentTimeline: React.FC<ContentTimelineProps> = ({
  content = [],
  onContentClick,
  loading
}) => {
  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Loading content...</Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (content.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>No content yet</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Start creating content to see your social media timeline
        </Typography>
        <Button variant="contained" startIcon={<PlayIcon />}>
          Generate Content
        </Button>
      </Paper>
    );
  }

  return (
    <Timeline position="right">
      {content.map((item, index) => (
        <TimelineItem key={item.id}>
          <TimelineOppositeContent sx={{ py: 2, px: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {item.status === 'published' && item.publishedDate
                ? new Date(item.publishedDate).toLocaleDateString()
                : item.status === 'scheduled' && item.scheduledDate
                ? `Scheduled: ${new Date(item.scheduledDate).toLocaleDateString()}`
                : 'Draft'
              }
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              {platformIcons[item.platform]}
              <Chip 
                label={item.type} 
                size="small" 
                variant="outlined"
              />
            </Box>
          </TimelineOppositeContent>

          <TimelineSeparator>
            <TimelineDot sx={{ bgcolor: getImpactColor(item.metrics?.reachImpact) }}>
              {statusIcons[item.status]}
            </TimelineDot>
            {index < content.length - 1 && <TimelineConnector />}
          </TimelineSeparator>

          <TimelineContent sx={{ py: 1, px: 2 }}>
            <Card 
              sx={{ 
                cursor: onContentClick ? 'pointer' : 'default',
                '&:hover': onContentClick ? { elevation: 4 } : {}
              }}
              onClick={() => onContentClick?.(item)}
            >
              {(item.mediaUrl || item.thumbnailUrl) && (
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component={item.type === 'video' ? 'video' : 'img'}
                    height="200"
                    image={item.thumbnailUrl || item.mediaUrl}
                    title={item.title}
                    controls={item.type === 'video'}
                  />
                  {item.type === 'video' && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        bgcolor: 'rgba(0,0,0,0.6)',
                        borderRadius: '50%',
                        p: 1
                      }}
                    >
                      <PlayIcon sx={{ color: 'white', fontSize: 32 }} />
                    </Box>
                  )}
                </Box>
              )}

              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {item.title}
                  </Typography>
                  <Chip 
                    label={item.status}
                    size="small"
                    color={
                      item.status === 'published' ? 'success' :
                      item.status === 'scheduled' ? 'warning' : 'default'
                    }
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {item.description}
                </Typography>

                {/* Impact Metrics */}
                {item.metrics && item.status === 'published' && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Performance Metrics
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <ViewsIcon color="action" />
                          <Typography variant="caption" display="block">
                            {formatNumber(item.metrics.views)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Views
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <FavoriteIcon color="error" />
                          <Typography variant="caption" display="block">
                            {formatNumber(item.metrics.likes)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Likes
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <CommentIcon color="action" />
                          <Typography variant="caption" display="block">
                            {formatNumber(item.metrics.comments)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Comments
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <ShareIcon color="action" />
                          <Typography variant="caption" display="block">
                            {formatNumber(item.metrics.shares)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Shares
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Impact Indicators */}
                    <Box sx={{ display: 'flex', gap: 1, mt: 2, alignItems: 'center' }}>
                      <Chip
                        icon={<TrendingUpIcon />}
                        label={`${item.metrics.reachImpact} impact`}
                        size="small"
                        sx={{ 
                          bgcolor: getImpactColor(item.metrics.reachImpact),
                          color: 'white'
                        }}
                      />
                      {item.metrics.engagementRate && (
                        <Chip
                          label={`${(item.metrics.engagementRate * 100).toFixed(1)}% engagement`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      {item.sentiment && (
                        <Chip
                          label={`${item.sentiment.label} sentiment`}
                          size="small"
                          sx={{
                            bgcolor: getSentimentColor(item.sentiment.label),
                            color: 'white'
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                )}

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {item.status === 'draft' && (
                    <>
                      <Button size="small" variant="contained">
                        Schedule
                      </Button>
                      <Button size="small" variant="outlined">
                        Edit
                      </Button>
                    </>
                  )}
                  {item.status === 'scheduled' && (
                    <>
                      <Button size="small" variant="outlined">
                        Reschedule
                      </Button>
                      <Button size="small" variant="outlined" color="error">
                        Cancel
                      </Button>
                    </>
                  )}
                  {item.status === 'published' && (
                    <Button size="small" variant="outlined">
                      View Details
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};