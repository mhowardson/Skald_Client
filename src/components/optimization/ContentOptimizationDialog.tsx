/**
 * Content Optimization Dialog Component
 * 
 * Modal dialog for quick content optimization with AI analysis.
 * Provides a streamlined interface for optimizing existing content.
 * 
 * @component ContentOptimizationDialog
 * @version 1.0.0
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Grid,
  Chip,
  Stack,
  Alert,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  AutoFixHigh as OptimizeIcon,
  Psychology as AIIcon,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
  useOptimizeContentMutation,
} from '../../store/api/aiContentOptimizationApi';

interface ContentOptimizationDialogProps {
  open: boolean;
  onClose: () => void;
  initialContent?: {
    title?: string;
    body?: string;
    platform?: string;
    contentType?: string;
  };
}

export const ContentOptimizationDialog: React.FC<ContentOptimizationDialogProps> = ({
  open,
  onClose,
  initialContent,
}) => {
  const [content, setContent] = useState({
    title: initialContent?.title || '',
    body: initialContent?.body || '',
    platform: initialContent?.platform || 'instagram',
    contentType: (initialContent?.contentType as any) || 'post',
  });
  const [optimizationType, setOptimizationType] = useState('comprehensive' as const);
  const [generateVariants, setGenerateVariants] = useState(true);
  const [includeCompetitorAnalysis, setIncludeCompetitorAnalysis] = useState(false);

  const [optimizeContent, { isLoading, error }] = useOptimizeContentMutation();

  const handleOptimize = async () => {
    if (!content.title && !content.body) return;

    try {
      const result = await optimizeContent({
        content,
        optimizationType,
        generateVariants,
        includeCompetitorAnalysis,
      }).unwrap();

      // Show results in a new view or close and navigate
      onClose();
      // You might want to show results in a separate dialog or navigate to results page
    } catch (error) {
      console.error('Optimization failed:', error);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const isFormValid = content.title.trim() || content.body.trim();

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { minHeight: '60vh' } }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <OptimizeIcon color="primary" />
          <Typography variant="h6">Optimize Content with AI</Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Platform</InputLabel>
              <Select
                value={content.platform}
                onChange={(e) => setContent(prev => ({ ...prev, platform: e.target.value }))}
                label="Platform"
              >
                <MenuItem value="instagram">Instagram</MenuItem>
                <MenuItem value="linkedin">LinkedIn</MenuItem>
                <MenuItem value="tiktok">TikTok</MenuItem>
                <MenuItem value="facebook">Facebook</MenuItem>
                <MenuItem value="twitter">Twitter</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Content Type</InputLabel>
              <Select
                value={content.contentType}
                onChange={(e) => setContent(prev => ({ ...prev, contentType: e.target.value as any }))}
                label="Content Type"
              >
                <MenuItem value="post">Post</MenuItem>
                <MenuItem value="story">Story</MenuItem>
                <MenuItem value="reel">Reel/Video</MenuItem>
                <MenuItem value="carousel">Carousel</MenuItem>
                <MenuItem value="article">Article</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Title/Headline"
              value={content.title}
              onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
              fullWidth
              multiline
              maxRows={3}
              placeholder="Enter your content title or headline..."
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Content Body"
              value={content.body}
              onChange={(e) => setContent(prev => ({ ...prev, body: e.target.value }))}
              fullWidth
              multiline
              rows={6}
              placeholder="Enter your content body text..."
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Optimization Focus</InputLabel>
              <Select
                value={optimizationType}
                onChange={(e) => setOptimizationType(e.target.value as any)}
                label="Optimization Focus"
              >
                <MenuItem value="comprehensive">Comprehensive Analysis</MenuItem>
                <MenuItem value="engagement">Engagement Optimization</MenuItem>
                <MenuItem value="reach">Reach Optimization</MenuItem>
                <MenuItem value="conversions">Conversion Optimization</MenuItem>
                <MenuItem value="performance">Performance Optimization</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Optimization Options
            </Typography>
            <Stack spacing={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={generateVariants}
                    onChange={(e) => setGenerateVariants(e.target.checked)}
                  />
                }
                label="Generate content variants for A/B testing"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={includeCompetitorAnalysis}
                    onChange={(e) => setIncludeCompetitorAnalysis(e.target.checked)}
                  />
                }
                label="Include competitor analysis"
              />
            </Stack>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Optimization failed. Please try again.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <LoadingButton
          onClick={handleOptimize}
          loading={isLoading}
          variant="contained"
          disabled={!isFormValid}
          startIcon={<AIIcon />}
        >
          Optimize with AI
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default ContentOptimizationDialog;