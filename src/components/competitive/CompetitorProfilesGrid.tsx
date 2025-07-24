/**
 * Competitor Profiles Grid Component
 * 
 * Displays competitor analysis in a responsive grid layout with
 * comprehensive metrics, content strategy insights, and performance data.
 * 
 * @component CompetitorProfilesGrid
 * @version 1.0.0
 * 
 * @features
 * - Responsive grid layout for competitor profiles
 * - Performance metrics with visual indicators
 * - Content strategy analysis and patterns
 * - Top performing content samples
 * - Competitive strengths and opportunities
 * - Interactive profile cards with detailed views
 * - Follow/unfollow competitor tracking
 * 
 * @props
 * - data: CompetitorProfile[] | undefined - Competitor data from API
 * - isLoading: boolean - Loading state indicator
 * - platforms: string[] - Selected platforms for analysis
 * 
 * @card_sections
 * - Header: Competitor name, handle, verification status
 * - Metrics: Followers, engagement rate, post frequency
 * - Strategy: Content mix, posting patterns, top topics
 * - Performance: Top content examples and engagement
 * - Actions: View profile, analyze content, track competitor
 * 
 * @responsive
 * - Mobile: Single column with condensed information
 * - Tablet: Two columns with expanded metrics
 * - Desktop: Three+ columns with full details
 */

import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemText,
  Stack,
  Tooltip,
  Badge,
  Alert,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  VerifiedUser,
  Schedule,
  Visibility,
  MoreVert,
  Launch,
  BookmarkAdd,
  Analytics,
  ContentCopy,
} from '@mui/icons-material';
import { CompetitorProfile } from '../../store/api/researchApi';

interface CompetitorProfilesGridProps {
  data: CompetitorProfile[] | undefined;
  isLoading: boolean;
  platforms: string[];
}

/**
 * Competitor Profile Card Component
 * 
 * Individual competitor card with comprehensive analysis data.
 */
interface CompetitorCardProps {
  competitor: CompetitorProfile;
  onViewDetails: (competitor: CompetitorProfile) => void;
  onTrackCompetitor: (competitorId: string) => void;
}

const CompetitorCard: React.FC<CompetitorCardProps> = ({
  competitor,
  onViewDetails,
  onTrackCompetitor,
}) => {
  const [isTracking, setIsTracking] = useState(false);

  const handleTrackClick = () => {
    setIsTracking(!isTracking);
    onTrackCompetitor(competitor.id);
  };

  const getPlatformIcon = (platform: string) => {
    // Return appropriate platform icon
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getEngagementColor = (rate: number) => {
    if (rate >= 5) return 'success';
    if (rate >= 2) return 'warning';
    return 'error';
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        avatar={
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              competitor.verified ? (
                <VerifiedUser color="primary" sx={{ fontSize: 16 }} />
              ) : null
            }
          >
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {competitor.name.charAt(0).toUpperCase()}
            </Avatar>
          </Badge>
        }
        title={
          <Box>
            <Typography variant="h6" component="div">
              {competitor.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              @{competitor.handle}
            </Typography>
          </Box>
        }
        action={
          <Stack direction="row" spacing={1}>
            <Tooltip title={isTracking ? "Stop Tracking" : "Track Competitor"}>
              <IconButton
                size="small"
                color={isTracking ? "primary" : "default"}
                onClick={handleTrackClick}
              >
                <BookmarkAdd />
              </IconButton>
            </Tooltip>
            <IconButton size="small">
              <MoreVert />
            </IconButton>
          </Stack>
        }
        subheader={
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Chip
              label={getPlatformIcon(competitor.platform)}
              size="small"
              variant="outlined"
            />
            <Chip
              label={competitor.category}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Stack>
        }
      />

      <CardContent sx={{ flexGrow: 1 }}>
        {/* Key Metrics */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  {formatNumber(competitor.followers)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Followers
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="h6" 
                  color={getEngagementColor(competitor.metrics.avgEngagementRate)}
                >
                  {competitor.metrics.avgEngagementRate.toFixed(1)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Engagement
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="secondary">
                  {competitor.metrics.postFrequency}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Posts/Week
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Content Strategy */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Content Strategy
          </Typography>
          
          {/* Content Mix */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Content Mix
            </Typography>
            {competitor.contentStrategy.contentMix.slice(0, 3).map((mix, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">{mix.type}</Typography>
                  <Typography variant="body2">{mix.percentage}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={mix.percentage}
                  sx={{ height: 4, borderRadius: 2 }}
                />
              </Box>
            ))}
          </Box>

          {/* Primary Topics */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Primary Topics
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
              {competitor.contentStrategy.primaryTopics.slice(0, 4).map((topic, index) => (
                <Chip
                  key={index}
                  label={topic}
                  size="small"
                  variant="outlined"
                  sx={{ mb: 0.5 }}
                />
              ))}
            </Stack>
          </Box>
        </Box>

        {/* Performance Indicators */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Performance
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Avg Views</Typography>
            <Typography variant="body2" fontWeight="medium">
              {formatNumber(competitor.metrics.avgViews)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Top Content</Typography>
            <Typography variant="body2" fontWeight="medium">
              {competitor.metrics.topPerformingContentTypes.join(', ')}
            </Typography>
          </Box>
        </Box>

        {/* Strengths */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Key Strengths
          </Typography>
          <List dense>
            {competitor.strengths.slice(0, 3).map((strength, index) => (
              <ListItem key={index} sx={{ py: 0, px: 0 }}>
                <ListItemText
                  primary={strength}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Best Posting Times */}
        {competitor.contentStrategy.postingPattern.bestTimes.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Best Posting Times
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {competitor.contentStrategy.postingPattern.bestTimes.slice(0, 3).map((time, index) => (
                <Chip
                  key={index}
                  icon={<Schedule />}
                  label={`${time.day} ${time.hour}:00`}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              ))}
            </Stack>
          </Box>
        )}
      </CardContent>

      {/* Actions */}
      <Box sx={{ p: 2, pt: 0 }}>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Visibility />}
            onClick={() => onViewDetails(competitor)}
            fullWidth
          >
            View Details
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<Analytics />}
            fullWidth
          >
            Analyze
          </Button>
        </Stack>
      </Box>
    </Card>
  );
};

/**
 * Main Competitor Profiles Grid Component
 */
const CompetitorProfilesGrid: React.FC<CompetitorProfilesGridProps> = ({
  data,
  isLoading,
  platforms,
}) => {
  const [selectedCompetitor, setSelectedCompetitor] = useState<CompetitorProfile | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleViewDetails = (competitor: CompetitorProfile) => {
    setSelectedCompetitor(competitor);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedCompetitor(null);
  };

  const handleTrackCompetitor = (competitorId: string) => {
    // Implementation for tracking competitor
    console.log('Tracking competitor:', competitorId);
  };

  const handleCopyProfile = () => {
    if (selectedCompetitor) {
      const profileText = `
Competitor: ${selectedCompetitor.name} (@${selectedCompetitor.handle})
Platform: ${selectedCompetitor.platform}
Followers: ${selectedCompetitor.followers.toLocaleString()}
Engagement Rate: ${selectedCompetitor.metrics.avgEngagementRate.toFixed(1)}%
Post Frequency: ${selectedCompetitor.metrics.postFrequency} posts/week
Primary Topics: ${selectedCompetitor.contentStrategy.primaryTopics.join(', ')}
Key Strengths: ${selectedCompetitor.strengths.join(', ')}
      `.trim();
      
      navigator.clipboard.writeText(profileText);
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item}>
            <Card>
              <CardHeader
                avatar={<Skeleton variant="circular" width={40} height={40} />}
                title={<Skeleton width="60%" />}
                subheader={<Skeleton width="40%" />}
              />
              <CardContent>
                <Skeleton variant="rectangular" height={200} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  // No data state
  if (!data || data.length === 0) {
    return (
      <Alert severity="info">
        No competitor profiles found for {platforms.join(', ')}. 
        Run a competitor analysis to discover competitors in your industry.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Competitor Profiles
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {data.length} competitors analyzed across {platforms.join(', ')}
        </Typography>
      </Box>

      {/* Competitor Grid */}
      <Grid container spacing={3}>
        {data.map((competitor) => (
          <Grid item xs={12} sm={6} lg={4} key={competitor.id}>
            <CompetitorCard
              competitor={competitor}
              onViewDetails={handleViewDetails}
              onTrackCompetitor={handleTrackCompetitor}
            />
          </Grid>
        ))}
      </Grid>

      {/* Competitor Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {selectedCompetitor?.name} - Detailed Analysis
            </Typography>
            <IconButton onClick={handleCopyProfile}>
              <ContentCopy />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {selectedCompetitor && (
            <Box>
              {/* Basic Info */}
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Account Information
                    </Typography>
                    <Typography variant="body2">
                      Handle: @{selectedCompetitor.handle}
                    </Typography>
                    <Typography variant="body2">
                      Platform: {selectedCompetitor.platform}
                    </Typography>
                    <Typography variant="body2">
                      Category: {selectedCompetitor.category}
                    </Typography>
                    <Typography variant="body2">
                      Industry: {selectedCompetitor.industry}
                    </Typography>
                    <Typography variant="body2">
                      Verified: {selectedCompetitor.verified ? 'Yes' : 'No'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Key Metrics
                    </Typography>
                    <Typography variant="body2">
                      Followers: {selectedCompetitor.followers.toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      Avg Engagement: {selectedCompetitor.metrics.avgEngagementRate.toFixed(2)}%
                    </Typography>
                    <Typography variant="body2">
                      Avg Views: {selectedCompetitor.metrics.avgViews.toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      Post Frequency: {selectedCompetitor.metrics.postFrequency} per week
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Content Strategy Details */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Content Strategy
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight="medium" gutterBottom>
                    Primary Topics:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {selectedCompetitor.contentStrategy.primaryTopics.map((topic, index) => (
                      <Chip key={index} label={topic} size="small" />
                    ))}
                  </Stack>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight="medium" gutterBottom>
                    Content Mix:
                  </Typography>
                  {selectedCompetitor.contentStrategy.contentMix.map((mix, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">{mix.type}</Typography>
                        <Typography variant="body2">{mix.percentage}%</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={mix.percentage}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Strengths and Opportunities */}
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Key Strengths
                  </Typography>
                  <List dense>
                    {selectedCompetitor.strengths.map((strength, index) => (
                      <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                        <ListItemText primary={strength} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Opportunities
                  </Typography>
                  <List dense>
                    {selectedCompetitor.opportunities.map((opportunity, index) => (
                      <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                        <ListItemText primary={opportunity} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
          <Button 
            variant="contained" 
            startIcon={<Launch />}
            onClick={() => {
              // Open competitor profile in new tab
              window.open(`https://${selectedCompetitor?.platform}.com/${selectedCompetitor?.handle}`, '_blank');
            }}
          >
            View Profile
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompetitorProfilesGrid;