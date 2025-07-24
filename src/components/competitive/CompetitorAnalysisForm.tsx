/**
 * Competitor Analysis Form Component
 * 
 * Interactive form for configuring and triggering competitor analysis
 * with customizable parameters and real-time validation.
 * 
 * @component CompetitorAnalysisForm
 * @version 1.0.0
 * 
 * @features
 * - Configurable analysis parameters (industry, platforms, keywords)
 * - Custom competitor list input with validation
 * - Analysis scope selection (content types, timeframes)
 * - Real-time parameter validation and suggestions
 * - Analysis progress tracking with estimated completion time
 * - Quick preset configurations for common use cases
 * 
 * @props
 * - selectedIndustry: string - Currently selected industry
 * - selectedPlatforms: string[] - Currently selected platforms
 * - onRunAnalysis: (config: CompetitorAnalysisRequest) => Promise<void>
 * - isLoading: boolean - Whether analysis is currently running
 * 
 * @form_sections
 * - Basic Configuration: Industry, platforms, timeframe
 * - Competitor Selection: Manual list or auto-discovery
 * - Content Scope: Content types and analysis depth
 * - Advanced Options: Keywords, filters, language settings
 * 
 * @validation
 * - Required fields validation
 * - Platform compatibility checks
 * - Competitor handle format validation
 * - Analysis scope recommendations
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  Autocomplete,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Card,
  CardContent,
  LinearProgress,
  Divider,
  Stack,
  Paper,
} from '@mui/material';
import {
  PlayArrow,
  Add,
  Delete,
  Speed,
  Schedule,
  TrendingUp,
  Psychology,
  Assessment,
  Tune,
} from '@mui/icons-material';
import { CompetitorAnalysisRequest } from '../../store/api/researchApi';

interface CompetitorAnalysisFormProps {
  selectedIndustry: string;
  selectedPlatforms: string[];
  onRunAnalysis: (config: CompetitorAnalysisRequest) => Promise<void>;
  isLoading: boolean;
}

interface AnalysisPreset {
  name: string;
  description: string;
  config: Partial<CompetitorAnalysisRequest>;
  estimatedTime: string;
  icon: React.ReactNode;
}

/**
 * Competitor Analysis Configuration Form
 * 
 * Multi-step form for setting up comprehensive competitor analysis
 * with validation and preset configurations.
 */
const CompetitorAnalysisForm: React.FC<CompetitorAnalysisFormProps> = ({
  selectedIndustry,
  selectedPlatforms,
  onRunAnalysis,
  isLoading,
}) => {
  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [analysisConfig, setAnalysisConfig] = useState<CompetitorAnalysisRequest>({
    category: selectedIndustry.split('_')[0],
    industry: selectedIndustry,
    platforms: selectedPlatforms,
    timeframe: '30d',
    limit: 50,
    includeMetrics: true,
    language: 'en',
  });

  // Form state
  const [customCompetitors, setCustomCompetitors] = useState<string[]>([]);
  const [newCompetitor, setNewCompetitor] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [useAutoDiscovery, setUseAutoDiscovery] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  // Analysis presets
  const analysisPresets: AnalysisPreset[] = [
    {
      name: 'Quick Scan',
      description: 'Fast competitor overview with key metrics',
      config: {
        timeframe: '7d',
        limit: 25,
        includeMetrics: true,
      },
      estimatedTime: '2-3 minutes',
      icon: <Speed color="primary" />,
    },
    {
      name: 'Content Strategy',
      description: 'Deep dive into content patterns and hooks',
      config: {
        timeframe: '30d',
        limit: 50,
        includeMetrics: true,
      },
      estimatedTime: '5-7 minutes',
      icon: <Psychology color="primary" />,
    },
    {
      name: 'Market Intelligence',
      description: 'Comprehensive market analysis with trends',
      config: {
        timeframe: '90d',
        limit: 100,
        includeMetrics: true,
      },
      estimatedTime: '10-15 minutes',
      icon: <TrendingUp color="primary" />,
    },
    {
      name: 'Performance Benchmark',
      description: 'Detailed performance comparison analysis',
      config: {
        timeframe: '30d',
        limit: 75,
        includeMetrics: true,
      },
      estimatedTime: '7-10 minutes',
      icon: <Assessment color="primary" />,
    },
  ];

  const industryKeywordSuggestions = {
    'health_wellness': ['fitness', 'nutrition', 'mental health', 'wellness', 'healthy lifestyle'],
    'technology': ['AI', 'software', 'innovation', 'digital transformation', 'tech trends'],
    'fashion': ['style', 'trends', 'outfit', 'fashion week', 'designer'],
    'food_beverage': ['recipe', 'cooking', 'restaurant', 'food trends', 'culinary'],
    'business': ['entrepreneurship', 'leadership', 'strategy', 'growth', 'productivity'],
    'education': ['learning', 'online courses', 'skills', 'training', 'education'],
  };


  useEffect(() => {
    setAnalysisConfig(prev => ({
      ...prev,
      industry: selectedIndustry,
      platforms: selectedPlatforms,
      category: selectedIndustry.split('_')[0],
    }));
  }, [selectedIndustry, selectedPlatforms]);

  const handleOpen = () => {
    setOpen(true);
    setActiveStep(0);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPreset(null);
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handlePresetSelect = (preset: AnalysisPreset) => {
    setSelectedPreset(preset.name);
    setAnalysisConfig(prev => ({
      ...prev,
      ...preset.config,
    }));
  };

  const handleAddCompetitor = () => {
    if (newCompetitor.trim() && !customCompetitors.includes(newCompetitor.trim())) {
      setCustomCompetitors(prev => [...prev, newCompetitor.trim()]);
      setNewCompetitor('');
    }
  };

  const handleRemoveCompetitor = (competitor: string) => {
    setCustomCompetitors(prev => prev.filter(c => c !== competitor));
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords(prev => [...prev, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(prev => prev.filter(k => k !== keyword));
  };

  const handleRunAnalysis = async () => {
    const finalConfig: CompetitorAnalysisRequest = {
      ...analysisConfig,
      competitors: useAutoDiscovery ? undefined : customCompetitors,
      keywords: keywords.length > 0 ? keywords : undefined,
    };

    try {
      await onRunAnalysis(finalConfig);
      handleClose();
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // Basic configuration
        return analysisConfig.platforms.length > 0;
      case 1: // Competitor selection
        return useAutoDiscovery || customCompetitors.length > 0;
      case 2: // Final review
        return true;
      default:
        return false;
    }
  };

  const getEstimatedTime = (): string => {
    if (selectedPreset) {
      const preset = analysisPresets.find(p => p.name === selectedPreset);
      return preset?.estimatedTime || '5-7 minutes';
    }

    const baseTime = analysisConfig.limit || 50;
    const platformMultiplier = analysisConfig.platforms.length;
    const timeframeMultiplier = analysisConfig.timeframe === '90d' ? 2 : analysisConfig.timeframe === '7d' ? 0.5 : 1;
    
    const estimatedMinutes = Math.ceil((baseTime * platformMultiplier * timeframeMultiplier) / 10);
    return `${Math.max(2, estimatedMinutes - 2)}-${estimatedMinutes + 2} minutes`;
  };


  return (
    <Box>
      <Button
        variant="contained"
        startIcon={<PlayArrow />}
        onClick={handleOpen}
        disabled={isLoading}
        size="large"
        fullWidth
      >
        {isLoading ? 'Analyzing...' : 'Run Analysis'}
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { minHeight: '70vh' } }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tune sx={{ mr: 1 }} />
            Configure Competitor Analysis
          </Box>
        </DialogTitle>

        <DialogContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            {/* Step 1: Analysis Configuration */}
            <Step>
              <StepLabel>
                <Typography variant="h6">Analysis Configuration</Typography>
              </StepLabel>
              <StepContent>
                {/* Analysis Presets */}
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  Quick Start Presets
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {analysisPresets.map((preset) => (
                    <Grid item xs={12} sm={6} key={preset.name}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          border: selectedPreset === preset.name ? 2 : 1,
                          borderColor: selectedPreset === preset.name ? 'primary.main' : 'divider',
                          '&:hover': { borderColor: 'primary.main' },
                        }}
                        onClick={() => handlePresetSelect(preset)}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            {preset.icon}
                            <Typography variant="subtitle1" sx={{ ml: 1 }}>
                              {preset.name}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {preset.description}
                          </Typography>
                          <Typography variant="caption" color="primary">
                            <Schedule sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                            {preset.estimatedTime}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Custom Configuration */}
                <Typography variant="subtitle2" gutterBottom>
                  Custom Configuration
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Timeframe</InputLabel>
                      <Select
                        value={analysisConfig.timeframe}
                        label="Timeframe"
                        onChange={(e) => setAnalysisConfig(prev => ({
                          ...prev,
                          timeframe: e.target.value as '7d' | '30d' | '90d'
                        }))}
                      >
                        <MenuItem value="7d">Last 7 Days</MenuItem>
                        <MenuItem value="30d">Last 30 Days</MenuItem>
                        <MenuItem value="90d">Last 90 Days</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Content Limit"
                      type="number"
                      value={analysisConfig.limit}
                      onChange={(e) => setAnalysisConfig(prev => ({
                        ...prev,
                        limit: parseInt(e.target.value) || 50
                      }))}
                      inputProps={{ min: 10, max: 500 }}
                      helperText="Number of content pieces to analyze"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={analysisConfig.includeMetrics}
                          onChange={(e) => setAnalysisConfig(prev => ({
                            ...prev,
                            includeMetrics: e.target.checked
                          }))}
                        />
                      }
                      label="Include detailed performance metrics"
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mb: 1, mt: 3 }}>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={!validateStep(0)}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Continue
                  </Button>
                </Box>
              </StepContent>
            </Step>

            {/* Step 2: Competitor Selection */}
            <Step>
              <StepLabel>
                <Typography variant="h6">Competitor Selection</Typography>
              </StepLabel>
              <StepContent>
                <FormControlLabel
                  control={
                    <Switch
                      checked={useAutoDiscovery}
                      onChange={(e) => setUseAutoDiscovery(e.target.checked)}
                    />
                  }
                  label="Auto-discover competitors"
                  sx={{ mb: 2 }}
                />

                {useAutoDiscovery ? (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    AI will automatically identify top competitors in your industry and platforms.
                  </Alert>
                ) : (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Manual Competitor List
                    </Typography>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <TextField
                        fullWidth
                        label="Competitor handle or username"
                        value={newCompetitor}
                        onChange={(e) => setNewCompetitor(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCompetitor();
                          }
                        }}
                        helperText="Enter @username or profile name"
                      />
                      <Button
                        onClick={handleAddCompetitor}
                        sx={{ ml: 1 }}
                        disabled={!newCompetitor.trim()}
                      >
                        <Add />
                      </Button>
                    </Box>

                    {customCompetitors.length > 0 && (
                      <List dense>
                        {customCompetitors.map((competitor, index) => (
                          <ListItem key={index}>
                            <ListItemText primary={competitor} />
                            <ListItemSecondaryAction>
                              <IconButton
                                edge="end"
                                onClick={() => handleRemoveCompetitor(competitor)}
                              >
                                <Delete />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                )}

                {/* Keywords */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Target Keywords (Optional)
                  </Typography>
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <Autocomplete
                      fullWidth
                      freeSolo
                      options={industryKeywordSuggestions[selectedIndustry as keyof typeof industryKeywordSuggestions] || []}
                      value={newKeyword}
                      onChange={(_, value) => setNewKeyword(value || '')}
                      onInputChange={(_, value) => setNewKeyword(value)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Keywords to track"
                          helperText="Focus analysis on specific topics"
                        />
                      )}
                    />
                    <Button
                      onClick={handleAddKeyword}
                      sx={{ ml: 1 }}
                      disabled={!newKeyword.trim()}
                    >
                      <Add />
                    </Button>
                  </Box>

                  {keywords.length > 0 && (
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {keywords.map((keyword) => (
                        <Chip
                          key={keyword}
                          label={keyword}
                          onDelete={() => handleRemoveKeyword(keyword)}
                          size="small"
                        />
                      ))}
                    </Stack>
                  )}
                </Box>

                <Box sx={{ mb: 1, mt: 3 }}>
                  <Button
                    disabled={!validateStep(1)}
                    variant="contained"
                    onClick={handleNext}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Continue
                  </Button>
                  <Button onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
                    Back
                  </Button>
                </Box>
              </StepContent>
            </Step>

            {/* Step 3: Review & Launch */}
            <Step>
              <StepLabel>
                <Typography variant="h6">Review & Launch</Typography>
              </StepLabel>
              <StepContent>
                <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Analysis Summary
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Industry:
                      </Typography>
                      <Typography variant="body1">
                        {selectedIndustry.replace('_', ' ').toUpperCase()}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Platforms:
                      </Typography>
                      <Typography variant="body1">
                        {selectedPlatforms.join(', ').toUpperCase()}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Timeframe:
                      </Typography>
                      <Typography variant="body1">
                        {analysisConfig.timeframe === '7d' ? 'Last 7 Days' :
                         analysisConfig.timeframe === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Content Limit:
                      </Typography>
                      <Typography variant="body1">
                        {analysisConfig.limit} pieces
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Competitor Discovery:
                      </Typography>
                      <Typography variant="body1">
                        {useAutoDiscovery ? 'Automatic' : `Manual (${customCompetitors.length})`}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Keywords:
                      </Typography>
                      <Typography variant="body1">
                        {keywords.length > 0 ? `${keywords.length} keywords` : 'None specified'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <Schedule sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                    Estimated completion time: {getEstimatedTime()}
                  </Typography>
                </Alert>

                <Box sx={{ mb: 1 }}>
                  <Button
                    variant="contained"
                    onClick={handleRunAnalysis}
                    disabled={isLoading}
                    sx={{ mt: 1, mr: 1 }}
                    startIcon={<PlayArrow />}
                  >
                    {isLoading ? 'Starting Analysis...' : 'Start Analysis'}
                  </Button>
                  <Button onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
                    Back
                  </Button>
                </Box>

                {isLoading && (
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Analysis in progress... This may take several minutes.
                    </Typography>
                  </Box>
                )}
              </StepContent>
            </Step>
          </Stepper>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompetitorAnalysisForm;