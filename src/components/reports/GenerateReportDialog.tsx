/**
 * Generate Report Dialog Component
 * 
 * Modal dialog for generating reports with template selection,
 * filter configuration, and format options.
 * 
 * @component GenerateReportDialog
 * @version 1.0.0
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
  Grid,
  Chip,
  Stack,
  Alert,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Description as CsvIcon,
  Web as HtmlIcon,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
  ReportTemplate,
  ReportFilters,
  useGenerateReportMutation,
} from '../../store/api/reportGenerationApi';

interface GenerateReportDialogProps {
  open: boolean;
  onClose: () => void;
  templates: ReportTemplate[];
  preSelectedTemplate?: string;
}

const formatOptions = [
  { value: 'pdf', label: 'PDF', icon: <PdfIcon />, description: 'Professional formatted document' },
  { value: 'excel', label: 'Excel', icon: <ExcelIcon />, description: 'Spreadsheet with multiple sheets' },
  { value: 'csv', label: 'CSV', icon: <CsvIcon />, description: 'Comma-separated values' },
  { value: 'html', label: 'HTML', icon: <HtmlIcon />, description: 'Web page format' },
];

const timeframeOptions = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 3 months' },
  { value: '6m', label: 'Last 6 months' },
  { value: '1y', label: 'Last year' },
];

const platformOptions = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'twitter', label: 'Twitter' },
];

const contentTypeOptions = [
  { value: 'post', label: 'Posts' },
  { value: 'story', label: 'Stories' },
  { value: 'reel', label: 'Reels/Videos' },
  { value: 'carousel', label: 'Carousels' },
  { value: 'live', label: 'Live Content' },
];

export const GenerateReportDialog: React.FC<GenerateReportDialogProps> = ({
  open,
  onClose,
  templates,
  preSelectedTemplate,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(preSelectedTemplate || '');
  const [format, setFormat] = useState<'pdf' | 'csv' | 'excel' | 'html'>('pdf');
  const [filters, setFilters] = useState<ReportFilters>({
    timeframe: '30d',
    platforms: [],
    contentTypes: [],
    metrics: [],
    includeCompetitors: false,
  });

  const [generateReport, { isLoading, error }] = useGenerateReportMutation();

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  const handleFilterChange = (key: keyof ReportFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePlatformChange = (platform: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      platforms: checked
        ? [...(prev.platforms || []), platform]
        : (prev.platforms || []).filter(p => p !== platform),
    }));
  };

  const handleContentTypeChange = (contentType: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      contentTypes: checked
        ? [...(prev.contentTypes || []), contentType]
        : (prev.contentTypes || []).filter(ct => ct !== contentType),
    }));
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) return;

    try {
      const result = await generateReport({
        templateId: selectedTemplate,
        filters,
        format,
      }).unwrap();

      // Close dialog and show success
      onClose();
      // You might want to show a success notification here
      console.log('Report generated:', result);
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const isFormValid = selectedTemplate && filters.timeframe;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { minHeight: '70vh' } }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssessmentIcon color="primary" />
          <Typography variant="h6">Generate Report</Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Template Selection */}
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Report Template</InputLabel>
              <Select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                label="Report Template"
              >
                {templates.map((template) => (
                  <MenuItem key={template.id} value={template.id}>
                    <Box>
                      <Typography variant="subtitle2">{template.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {template.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedTemplateData && (
              <Paper sx={{ mt: 2, p: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Template Details
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <Chip 
                    label={selectedTemplateData.type} 
                    size="small" 
                    color="primary"
                    sx={{ textTransform: 'capitalize' }}
                  />
                  <Chip 
                    label={`${selectedTemplateData.sections.length} sections`} 
                    size="small" 
                    variant="outlined"
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {selectedTemplateData.description}
                </Typography>
              </Paper>
            )}
          </Grid>

          {/* Format Selection */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Output Format
            </Typography>
            <RadioGroup
              value={format}
              onChange={(e) => setFormat(e.target.value as any)}
              sx={{ mt: 1 }}
            >
              <Grid container spacing={2}>
                {formatOptions.map((option) => (
                  <Grid item xs={12} sm={6} key={option.value}>
                    <Paper
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        border: format === option.value ? 2 : 1,
                        borderColor: format === option.value ? 'primary.main' : 'divider',
                        '&:hover': { borderColor: 'primary.main' },
                      }}
                      onClick={() => setFormat(option.value as any)}
                    >
                      <FormControlLabel
                        value={option.value}
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {option.icon}
                            <Box>
                              <Typography variant="subtitle2">{option.label}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {option.description}
                              </Typography>
                            </Box>
                          </Box>
                        }
                        sx={{ m: 0, width: '100%' }}
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </RadioGroup>
          </Grid>

          {/* Filters */}
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">Report Filters</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  {/* Timeframe */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Timeframe</InputLabel>
                      <Select
                        value={filters.timeframe}
                        onChange={(e) => handleFilterChange('timeframe', e.target.value)}
                        label="Timeframe"
                      >
                        {timeframeOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Include Competitors */}
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={filters.includeCompetitors || false}
                          onChange={(e) => handleFilterChange('includeCompetitors', e.target.checked)}
                        />
                      }
                      label="Include Competitive Analysis"
                    />
                  </Grid>

                  {/* Platforms */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Platforms (leave empty for all)
                    </Typography>
                    <FormGroup row>
                      {platformOptions.map((platform) => (
                        <FormControlLabel
                          key={platform.value}
                          control={
                            <Checkbox
                              checked={(filters.platforms || []).includes(platform.value)}
                              onChange={(e) => handlePlatformChange(platform.value, e.target.checked)}
                            />
                          }
                          label={platform.label}
                        />
                      ))}
                    </FormGroup>
                  </Grid>

                  {/* Content Types */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Content Types (leave empty for all)
                    </Typography>
                    <FormGroup row>
                      {contentTypeOptions.map((contentType) => (
                        <FormControlLabel
                          key={contentType.value}
                          control={
                            <Checkbox
                              checked={(filters.contentTypes || []).includes(contentType.value)}
                              onChange={(e) => handleContentTypeChange(contentType.value, e.target.checked)}
                            />
                          }
                          label={contentType.label}
                        />
                      ))}
                    </FormGroup>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to generate report. Please try again.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <LoadingButton
          onClick={handleGenerate}
          loading={isLoading}
          variant="contained"
          disabled={!isFormValid}
          startIcon={<AssessmentIcon />}
        >
          Generate Report
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default GenerateReportDialog;