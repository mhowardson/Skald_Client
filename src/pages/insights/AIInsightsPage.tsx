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
  Avatar,
  Divider,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Psychology as AIIcon,
  SentimentSatisfied as SentimentIcon,
  TrendingUp as TrendIcon,
  Insights as InsightsIcon,
  CompareArrows as CompetitorIcon,
  AutoAwesome as GenerateIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  ThumbUp as PositiveIcon,
  ThumbDown as NegativeIcon,
  RemoveCircle as NeutralIcon,
  Lightbulb as OpportunityIcon,
  Warning as RiskIcon,
  Timeline as TimelineIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Science as ModelIcon,
  Feedback as FeedbackIcon,
  RealTimeIcon,
  ShowChart as ChartIcon,
  LocationOn as LocationIcon,
  Group as AudienceIcon,
  Campaign as CampaignIcon
} from '@mui/icons-material';

import {
  useGetSentimentAnalysisQuery,
  useGetTrendAnalysisQuery,
  useGetAIInsightsQuery,
  useGetCompetitorAnalysisQuery,
  useGetRealTimeInsightsQuery,
  useAnalyzeSentimentMutation,
  useDetectTrendsMutation,
  useGenerateInsightsMutation,
  useAnalyzeCompetitorMutation,
  useBatchAnalyzeMutation,
  type SentimentAnalysis,
  type TrendAnalysis,
  type AIInsight,
  type CompetitorAnalysis
} from '../../store/api/aiInsightsApi';

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

export const AIInsightsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [generateDialog, setGenerateDialog] = useState(false);
  const [competitorDialog, setCompetitorDialog] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ element: HTMLElement; type: string; data: any } | null>(null);
  const [period, setPeriod] = useState<string>('week');

  // API calls
  const { data: sentimentData, isLoading: sentimentLoading } = useGetSentimentAnalysisQuery({ period });
  const { data: trendsData, isLoading: trendsLoading } = useGetTrendAnalysisQuery({ period });
  const { data: insightsData, isLoading: insightsLoading } = useGetAIInsightsQuery({});
  const { data: competitorData, isLoading: competitorLoading } = useGetCompetitorAnalysisQuery({});
  const { data: realTimeData, isLoading: realTimeLoading } = useGetRealTimeInsightsQuery();

  const [analyzeSentiment] = useAnalyzeSentimentMutation();
  const [detectTrends] = useDetectTrendsMutation();
  const [generateInsights] = useGenerateInsightsMutation();
  const [analyzeCompetitor] = useAnalyzeCompetitorMutation();
  const [batchAnalyze] = useBatchAnalyzeMutation();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleGenerateInsights = async () => {
    try {
      await generateInsights({
        analysisType: ['sentiment', 'trends', 'competitive'],
        includeCompetitive: true,
        includeTrends: true,
        includeSentiment: true
      }).unwrap();
      setGenerateDialog(false);
    } catch (error) {
      console.error('Failed to generate insights:', error);
    }
  };

  const handleAnalyzeCompetitor = async (competitorName: string) => {
    try {
      await analyzeCompetitor({
        competitorName,
        platforms: ['twitter', 'instagram', 'facebook', 'linkedin'],
        includeStrategy: true,
        includeGaps: true
      }).unwrap();
      setCompetitorDialog(false);
    } catch (error) {
      console.error('Failed to analyze competitor:', error);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <PositiveIcon color="success" />;
      case 'negative': return <NegativeIcon color="error" />;
      case 'neutral': return <NeutralIcon color="action" />;
      default: return <NeutralIcon />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'success';
      case 'negative': return 'error';
      case 'neutral': return 'default';
      default: return 'default';
    }
  };

  const getTrendIcon = (lifecycle: string) => {
    switch (lifecycle) {
      case 'emerging': return <TrendingUp color="primary" />;
      case 'growing': return <TrendingUp color="success" />;
      case 'peak': return <ShowChart color="warning" />;
      case 'declining': return <TrendingDown color="error" />;
      case 'stable': return <TrendingFlat color="action" />;
      default: return <TrendingUp />;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <OpportunityIcon color="success" />;
      case 'risk': return <RiskIcon color="error" />;
      case 'trend': return <TrendIcon color="primary" />;
      case 'sentiment': return <SentimentIcon color="info" />;
      case 'anomaly': return <Warning color="warning" />;
      default: return <InsightsIcon />;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatPercentage = (num: number) => {
    return (num * 100).toFixed(1) + '%';
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          AI Insights & Analysis
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Advanced sentiment analysis, trend detection, and competitive intelligence
        </Typography>
      </Box>

      {/* Real-time Dashboard */}
      {realTimeData && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Real-Time Insights
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    {getSentimentIcon(realTimeData.sentiment.current > 0 ? 'positive' : realTimeData.sentiment.current < 0 ? 'negative' : 'neutral')}
                    <Typography variant="h4" color={realTimeData.sentiment.current > 0 ? 'success.main' : realTimeData.sentiment.current < 0 ? 'error.main' : 'text.secondary'}>
                      {(realTimeData.sentiment.current * 100).toFixed(1)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Current Sentiment Score
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 1 }}>
                    {getTrendIcon(realTimeData.sentiment.trend)}
                    <Typography variant="caption" color="text.secondary">
                      {realTimeData.sentiment.change > 0 ? '+' : ''}{realTimeData.sentiment.change.toFixed(1)}% change
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Trending Topics
                  </Typography>
                  <List dense>
                    {realTimeData.trends.slice(0, 3).map((trend, index) => (
                      <ListItem key={index} disablePadding>
                        <ListItemText
                          primary={trend.name}
                          secondary={
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Chip label={`${trend.strength}% strength`} size="small" color="primary" />
                              <Chip label={`${trend.velocity > 0 ? '+' : ''}${trend.velocity.toFixed(1)}% velocity`} size="small" />
                            </Box>
                          }
                        />
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
                    Active Alerts
                  </Typography>
                  <List dense>
                    {realTimeData.alerts.map((alert, index) => (
                      <ListItem key={index} disablePadding>
                        <ListItemIcon>
                          <Badge color={alert.priority === 'high' ? 'error' : alert.priority === 'medium' ? 'warning' : 'info'} variant="dot">
                            <Warning />
                          </Badge>
                        </ListItemIcon>
                        <ListItemText
                          primary={alert.message}
                          secondary={
                            <Chip 
                              label={alert.priority} 
                              size="small" 
                              color={alert.priority === 'high' ? 'error' : alert.priority === 'medium' ? 'warning' : 'info'}
                            />
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Sentiment Analysis" icon={<SentimentIcon />} iconPosition="start" />
            <Tab label="Trend Detection" icon={<TrendIcon />} iconPosition="start" />
            <Tab label="AI Insights" icon={<InsightsIcon />} iconPosition="start" />
            <Tab label="Competitor Analysis" icon={<CompetitorIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Sentiment Analysis Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Sentiment Analysis</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Period</InputLabel>
                <Select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  label="Period"
                >
                  <MenuItem value="day">Last Day</MenuItem>
                  <MenuItem value="week">Last Week</MenuItem>
                  <MenuItem value="month">Last Month</MenuItem>
                  <MenuItem value="quarter">Last Quarter</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                startIcon={<GenerateIcon />}
                onClick={() => setGenerateDialog(true)}
              >
                Analyze Content
              </Button>
            </Box>
          </Box>

          {sentimentLoading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : sentimentData && (
            <>
              {/* Sentiment Summary */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <PositiveIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h4" color="success.main">
                        {sentimentData.summary.positive}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Positive
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <NegativeIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h4" color="error.main">
                        {sentimentData.summary.negative}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Negative
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <NeutralIcon color="action" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h4" color="text.secondary">
                        {sentimentData.summary.neutral}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Neutral
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <SentimentIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h4" color="primary.main">
                        {sentimentData.summary.averageScore.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Average Score
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Sentiment Details */}
              <Grid container spacing={3}>
                {sentimentData.analyses.map((analysis) => (
                  <Grid item xs={12} md={6} key={analysis.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getSentimentIcon(analysis.sentiment)}
                            <Typography variant="h6">
                              {analysis.sentiment.toUpperCase()}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h6" color="primary.main">
                              {(analysis.score * 100).toFixed(1)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatPercentage(analysis.confidence)} confidence
                            </Typography>
                          </Box>
                        </Box>

                        <Chip label={analysis.contentType} size="small" sx={{ mb: 2 }} />

                        {/* Emotions */}
                        <Typography variant="subtitle2" gutterBottom>
                          Emotions
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                          {Object.entries(analysis.emotions).slice(0, 4).map(([emotion, value]) => (
                            <Chip
                              key={emotion}
                              label={`${emotion}: ${formatPercentage(value)}`}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>

                        {/* Top Keywords */}
                        <Typography variant="subtitle2" gutterBottom>
                          Key Terms
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                          {analysis.keywords.slice(0, 3).map((keyword, index) => (
                            <Chip
                              key={index}
                              label={keyword.word}
                              size="small"
                              color={getSentimentColor(keyword.sentiment) as any}
                            />
                          ))}
                        </Box>

                        {/* Recommendations */}
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="subtitle2">
                              Recommendations ({analysis.recommendations.length})
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <List dense>
                              {analysis.recommendations.map((rec, index) => (
                                <ListItem key={index} disablePadding>
                                  <ListItemText
                                    primary={rec.suggestion}
                                    secondary={
                                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                        <Chip label={rec.type} size="small" />
                                        <Chip label={rec.priority} size="small" color={rec.priority === 'high' ? 'error' : rec.priority === 'medium' ? 'warning' : 'default'} />
                                      </Box>
                                    }
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </AccordionDetails>
                        </Accordion>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </TabPanel>

        {/* Trend Detection Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Trend Detection</Typography>
            <Button
              variant="contained"
              startIcon={<TrendIcon />}
              onClick={() => setGenerateDialog(true)}
            >
              Detect Trends
            </Button>
          </Box>

          {trendsLoading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : trendsData && (
            <>
              {/* Trend Summary */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary.main">
                        {trendsData.summary.emerging}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Emerging
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {trendsData.summary.growing}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Growing
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main">
                        {trendsData.summary.peak}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Peak
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="error.main">
                        {trendsData.summary.declining}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Declining
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Trend Details */}
              <Grid container spacing={3}>
                {trendsData.trends.map((trend) => (
                  <Grid item xs={12} md={6} key={trend.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                          <Box>
                            <Typography variant="h6" gutterBottom>
                              {trend.trend.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {trend.trend.description}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h6" color="primary.main">
                              {trend.trend.strength}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              strength
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                          <Chip label={trend.trend.category} size="small" />
                          <Chip 
                            label={trend.trend.lifecycle} 
                            size="small" 
                            color={
                              trend.trend.lifecycle === 'emerging' ? 'primary' :
                              trend.trend.lifecycle === 'growing' ? 'success' :
                              trend.trend.lifecycle === 'peak' ? 'warning' :
                              trend.trend.lifecycle === 'declining' ? 'error' : 'default'
                            }
                          />
                        </Box>

                        <Typography variant="subtitle2" gutterBottom>
                          Metrics
                        </Typography>
                        <Grid container spacing={1} sx={{ mb: 2 }}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">Volume</Typography>
                            <Typography variant="h6">{formatNumber(trend.metrics.volume)}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">Engagement</Typography>
                            <Typography variant="h6">{formatNumber(trend.metrics.engagement)}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">Reach</Typography>
                            <Typography variant="h6">{formatNumber(trend.metrics.reach)}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">Sentiment</Typography>
                            <Typography variant="h6">{trend.metrics.sentiment.toFixed(2)}</Typography>
                          </Grid>
                        </Grid>

                        {/* Opportunities */}
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="subtitle2">
                              Opportunities ({trend.opportunities.length})
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <List dense>
                              {trend.opportunities.map((opportunity, index) => (
                                <ListItem key={index} disablePadding>
                                  <ListItemText
                                    primary={opportunity.title}
                                    secondary={
                                      <Box>
                                        <Typography variant="body2" color="text.secondary">
                                          {opportunity.description}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                          <Chip label={opportunity.type} size="small" />
                                          <Chip label={`${opportunity.expectedImpact}% impact`} size="small" color="success" />
                                          <Chip label={opportunity.priority} size="small" color={opportunity.priority === 'high' ? 'error' : opportunity.priority === 'medium' ? 'warning' : 'default'} />
                                        </Box>
                                      </Box>
                                    }
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </AccordionDetails>
                        </Accordion>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </TabPanel>

        {/* AI Insights Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">AI-Generated Insights</Typography>
            <Button
              variant="contained"
              startIcon={<GenerateIcon />}
              onClick={handleGenerateInsights}
            >
              Generate Insights
            </Button>
          </Box>

          {insightsLoading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : insightsData && (
            <>
              {/* Insights Summary */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="error.main">
                        {insightsData.summary.high}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        High Impact
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main">
                        {insightsData.summary.medium}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Medium Impact
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {insightsData.summary.low}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Low Impact
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary.main">
                        {insightsData.summary.urgent}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Urgent
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Insights List */}
              <Grid container spacing={3}>
                {insightsData.insights.map((insight) => (
                  <Grid item xs={12} md={6} key={insight.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getInsightIcon(insight.type)}
                            <Typography variant="h6">
                              {insight.title}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={(e) => setMenuAnchor({ element: e.currentTarget, type: 'insight', data: insight })}
                          >
                            <MoreIcon />
                          </IconButton>
                        </Box>

                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {insight.description}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                          <Chip label={insight.category} size="small" />
                          <Chip 
                            label={insight.impact} 
                            size="small" 
                            color={insight.impact === 'high' ? 'error' : insight.impact === 'medium' ? 'warning' : 'success'}
                          />
                          <Chip 
                            label={insight.urgency} 
                            size="small" 
                            variant="outlined"
                          />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Confidence: {formatPercentage(insight.confidence)}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={insight.confidence * 100}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>

                        <Button
                          size="small"
                          onClick={() => setSelectedInsight(insight)}
                          fullWidth
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </TabPanel>

        {/* Competitor Analysis Tab */}
        <TabPanel value={activeTab} index={3}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Competitor Analysis</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCompetitorDialog(true)}
            >
              Analyze Competitor
            </Button>
          </Box>

          {competitorLoading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : competitorData && (
            <Grid container spacing={3}>
              {competitorData.analyses.map((analysis) => (
                <Grid item xs={12} key={analysis.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {analysis.competitor.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {analysis.competitor.industry} • {analysis.competitor.size}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {analysis.competitor.platforms.map((platform) => (
                            <Chip key={platform} label={platform} size="small" />
                          ))}
                        </Box>
                      </Box>

                      <Typography variant="subtitle1" gutterBottom>
                        Performance Comparison
                      </Typography>
                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        {analysis.performance.map((perf, index) => (
                          <Grid item xs={12} sm={6} md={3} key={index}>
                            <Box sx={{ textAlign: 'center', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                              <Typography variant="h6" color="primary.main">
                                {perf.platform}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {formatNumber(perf.metrics.followers)} followers
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {formatPercentage(perf.metrics.avgEngagementRate)} engagement
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                <Chip 
                                  label={`${perf.comparison.performanceScore > 1 ? '+' : ''}${((perf.comparison.performanceScore - 1) * 100).toFixed(1)}%`}
                                  size="small"
                                  color={perf.comparison.performanceScore > 1 ? 'success' : 'error'}
                                />
                              </Box>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>

                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="subtitle1">
                            Competitive Gaps & Opportunities
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <List>
                            {analysis.gaps.map((gap, index) => (
                              <ListItem key={index} divider>
                                <ListItemText
                                  primary={gap.description}
                                  secondary={
                                    <Box>
                                      <Typography variant="body2" color="text.secondary">
                                        Opportunity: {gap.opportunity}
                                      </Typography>
                                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                        <Chip label={gap.type} size="small" />
                                        <Chip label={gap.priority} size="small" color={gap.priority === 'high' ? 'error' : gap.priority === 'medium' ? 'warning' : 'default'} />
                                        <Chip label={`${gap.effort} effort`} size="small" variant="outlined" />
                                      </Box>
                                    </Box>
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        </AccordionDetails>
                      </Accordion>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
      </Paper>

      {/* Insight Details Dialog */}
      <Dialog
        open={Boolean(selectedInsight)}
        onClose={() => setSelectedInsight(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedInsight?.title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" gutterBottom>
              {selectedInsight?.description}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip label={selectedInsight?.category} size="small" />
              <Chip 
                label={selectedInsight?.impact} 
                size="small" 
                color={selectedInsight?.impact === 'high' ? 'error' : selectedInsight?.impact === 'medium' ? 'warning' : 'success'}
              />
              <Chip 
                label={selectedInsight?.urgency} 
                size="small" 
                variant="outlined"
              />
            </Box>
          </Box>

          <Typography variant="h6" gutterBottom>
            Recommendations
          </Typography>
          <List>
            {selectedInsight?.recommendations.map((rec, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={rec.action}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Expected: {rec.expectedOutcome}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Chip label={rec.priority} size="small" color={rec.priority === 'high' ? 'error' : rec.priority === 'medium' ? 'warning' : 'default'} />
                        <Chip label={`${rec.effort} effort`} size="small" variant="outlined" />
                        <Chip label={rec.timeline} size="small" />
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedInsight(null)}>Close</Button>
          <Button variant="contained">
            Implement Recommendations
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};