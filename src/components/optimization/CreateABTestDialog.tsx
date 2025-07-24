/**
 * Create A/B Test Dialog Component
 * 
 * Modal dialog for creating new A/B test experiments with content variants,
 * configuration options, and test parameters.
 * 
 * @component CreateABTestDialog
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
  Card,
  CardContent,
  IconButton,
  Divider,
  Slider,
  Paper,
} from '@mui/material';
import {
  Science as ScienceIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
  useCreateABTestMutation,
} from '../../store/api/aiContentOptimizationApi';

interface ContentVariant {
  id: string;
  name: string;
  content: {
    title: string;
    body: string;
  };
  allocation: number;
}

interface CreateABTestDialogProps {
  open: boolean;
  onClose: () => void;
}

export const CreateABTestDialog: React.FC<CreateABTestDialogProps> = ({
  open,
  onClose,
}) => {
  const [testData, setTestData] = useState({
    name: '',
    description: '',
    testConfig: {
      duration: 14,
      sampleSize: 1000,
      successMetric: 'engagement' as const,
      confidenceLevel: 0.95,
    },
  });

  const [variants, setVariants] = useState<ContentVariant[]>([
    {
      id: '1',
      name: 'Control',
      content: { title: '', body: '' },
      allocation: 50,
    },
    {
      id: '2',
      name: 'Variant A',
      content: { title: '', body: '' },
      allocation: 50,
    },
  ]);

  const [createABTest, { isLoading, error }] = useCreateABTestMutation();

  const handleAddVariant = () => {
    const newVariant: ContentVariant = {
      id: Date.now().toString(),
      name: `Variant ${String.fromCharCode(65 + variants.length - 1)}`,
      content: { title: '', body: '' },
      allocation: 0,
    };

    // Redistribute allocations equally
    const newVariants = [...variants, newVariant];
    const equalAllocation = Math.floor(100 / newVariants.length);
    const remainder = 100 % newVariants.length;

    setVariants(newVariants.map((variant, index) => ({
      ...variant,
      allocation: equalAllocation + (index < remainder ? 1 : 0),
    })));
  };

  const handleRemoveVariant = (variantId: string) => {
    if (variants.length <= 2) return; // Minimum 2 variants

    const newVariants = variants.filter(v => v.id !== variantId);
    // Redistribute allocations equally
    const equalAllocation = Math.floor(100 / newVariants.length);
    const remainder = 100 % newVariants.length;

    setVariants(newVariants.map((variant, index) => ({
      ...variant,
      allocation: equalAllocation + (index < remainder ? 1 : 0),
    })));
  };

  const handleVariantChange = (variantId: string, field: string, value: any) => {
    setVariants(variants.map(variant => 
      variant.id === variantId 
        ? { 
            ...variant, 
            [field]: field === 'content' 
              ? { ...variant.content, ...value }
              : value
          }
        : variant
    ));
  };

  const handleAllocationChange = (variantId: string, newAllocation: number) => {
    const otherVariants = variants.filter(v => v.id !== variantId);
    const remainingAllocation = 100 - newAllocation;
    const otherVariantsCount = otherVariants.length;

    if (otherVariantsCount > 0) {
      const avgOtherAllocation = Math.floor(remainingAllocation / otherVariantsCount);
      const remainder = remainingAllocation % otherVariantsCount;

      setVariants(variants.map((variant, index) => {
        if (variant.id === variantId) {
          return { ...variant, allocation: newAllocation };
        } else {
          const otherIndex = otherVariants.findIndex(v => v.id === variant.id);
          return { 
            ...variant, 
            allocation: avgOtherAllocation + (otherIndex < remainder ? 1 : 0)
          };
        }
      }));
    }
  };

  const handleCreateTest = async () => {
    try {
      const testPayload = {
        name: testData.name,
        description: testData.description,
        variants: variants.map(variant => ({
          name: variant.name,
          content: variant.content,
          allocation: variant.allocation,
        })),
        testConfig: testData.testConfig,
      };

      await createABTest(testPayload).unwrap();
      onClose();
      
      // Reset form
      setTestData({
        name: '',
        description: '',
        testConfig: {
          duration: 14,
          sampleSize: 1000,
          successMetric: 'engagement',
          confidenceLevel: 0.95,
        },
      });
      setVariants([
        {
          id: '1',
          name: 'Control',
          content: { title: '', body: '' },
          allocation: 50,
        },
        {
          id: '2',
          name: 'Variant A',
          content: { title: '', body: '' },
          allocation: 50,
        },
      ]);
    } catch (error) {
      console.error('Failed to create A/B test:', error);
    }
  };

  const isFormValid = testData.name.trim() && 
                     variants.every(v => v.content.title.trim() || v.content.body.trim()) &&
                     Math.abs(variants.reduce((sum, v) => sum + v.allocation, 0) - 100) < 0.01;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { minHeight: '80vh' } }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScienceIcon color="primary" />
          <Typography variant="h6">Create A/B Test Experiment</Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Test Configuration
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Test Name"
                  value={testData.name}
                  onChange={(e) => setTestData(prev => ({ ...prev, name: e.target.value }))}
                  fullWidth
                  required
                  placeholder="e.g., Call-to-Action Button Test"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Description (Optional)"
                  value={testData.description}
                  onChange={(e) => setTestData(prev => ({ ...prev, description: e.target.value }))}
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Describe what you're testing and why..."
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Duration (Days)"
                  type="number"
                  value={testData.testConfig.duration}
                  onChange={(e) => setTestData(prev => ({ 
                    ...prev, 
                    testConfig: { ...prev.testConfig, duration: parseInt(e.target.value) }
                  }))}
                  fullWidth
                  inputProps={{ min: 1, max: 90 }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Sample Size"
                  type="number"
                  value={testData.testConfig.sampleSize}
                  onChange={(e) => setTestData(prev => ({ 
                    ...prev, 
                    testConfig: { ...prev.testConfig, sampleSize: parseInt(e.target.value) }
                  }))}
                  fullWidth
                  inputProps={{ min: 100 }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Success Metric</InputLabel>
                  <Select
                    value={testData.testConfig.successMetric}
                    onChange={(e) => setTestData(prev => ({ 
                      ...prev, 
                      testConfig: { ...prev.testConfig, successMetric: e.target.value as any }
                    }))}
                    label="Success Metric"
                  >
                    <MenuItem value="engagement">Engagement Rate</MenuItem>
                    <MenuItem value="reach">Reach</MenuItem>
                    <MenuItem value="clicks">Click-through Rate</MenuItem>
                    <MenuItem value="conversions">Conversions</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" gutterBottom>
                  Confidence Level: {(testData.testConfig.confidenceLevel * 100)}%
                </Typography>
                <Slider
                  value={testData.testConfig.confidenceLevel}
                  onChange={(e, value) => setTestData(prev => ({ 
                    ...prev, 
                    testConfig: { ...prev.testConfig, confidenceLevel: value as number }
                  }))}
                  min={0.8}
                  max={0.99}
                  step={0.01}
                  marks={[
                    { value: 0.8, label: '80%' },
                    { value: 0.95, label: '95%' },
                    { value: 0.99, label: '99%' },
                  ]}
                />
              </Grid>
            </Grid>
          </Grid>

          <Divider sx={{ width: '100%' }} />

          {/* Content Variants */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Content Variants ({variants.length})
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddVariant}
                disabled={variants.length >= 5}
              >
                Add Variant
              </Button>
            </Box>

            <Grid container spacing={2}>
              {variants.map((variant, index) => (
                <Grid item xs={12} md={6} key={variant.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <TextField
                          label="Variant Name"
                          value={variant.name}
                          onChange={(e) => handleVariantChange(variant.id, 'name', e.target.value)}
                          size="small"
                          sx={{ flexGrow: 1, mr: 1 }}
                        />
                        {variants.length > 2 && (
                          <IconButton
                            onClick={() => handleRemoveVariant(variant.id)}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>

                      <TextField
                        label="Title"
                        value={variant.content.title}
                        onChange={(e) => handleVariantChange(variant.id, 'content', { title: e.target.value })}
                        fullWidth
                        multiline
                        maxRows={2}
                        sx={{ mb: 2 }}
                      />

                      <TextField
                        label="Content Body"
                        value={variant.content.body}
                        onChange={(e) => handleVariantChange(variant.id, 'content', { body: e.target.value })}
                        fullWidth
                        multiline
                        rows={4}
                        sx={{ mb: 2 }}
                      />

                      <Box>
                        <Typography variant="caption" gutterBottom>
                          Traffic Allocation: {variant.allocation}%
                        </Typography>
                        <Slider
                          value={variant.allocation}
                          onChange={(e, value) => handleAllocationChange(variant.id, value as number)}
                          min={0}
                          max={100}
                          step={5}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Allocation Summary */}
            <Paper sx={{ p: 2, mt: 2, bgcolor: 'background.default' }}>
              <Typography variant="subtitle2" gutterBottom>
                Allocation Summary
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {variants.map((variant) => (
                  <Chip
                    key={variant.id}
                    label={`${variant.name}: ${variant.allocation}%`}
                    color={variant.allocation > 0 ? 'primary' : 'default'}
                    size="small"
                  />
                ))}
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Total: {variants.reduce((sum, v) => sum + v.allocation, 0)}% 
                {Math.abs(variants.reduce((sum, v) => sum + v.allocation, 0) - 100) > 0.01 && (
                  <span style={{ color: 'red' }}> (Must equal 100%)</span>
                )}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to create A/B test. Please check your configuration and try again.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <LoadingButton
          onClick={handleCreateTest}
          loading={isLoading}
          variant="contained"
          disabled={!isFormValid}
          startIcon={<ScienceIcon />}
        >
          Create A/B Test
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default CreateABTestDialog;