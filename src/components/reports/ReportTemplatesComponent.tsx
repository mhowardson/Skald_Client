/**
 * Report Templates Component
 * 
 * Displays available report templates with descriptions, preview capabilities,
 * and quick generation actions. Supports custom template creation.
 * 
 * @component ReportTemplatesComponent
 * @version 1.0.0
 */

import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Stack,
  Skeleton,
  Alert,
  Fab,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Analytics as AnalyticsIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  PlayArrow as PlayArrowIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  ContentCopy as CopyIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as ShowChartIcon,
  TableChart as TableChartIcon,
  Lightbulb as LightbulbIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { ReportTemplate } from '../../store/api/reportGenerationApi';

interface ReportTemplatesComponentProps {
  templates: ReportTemplate[];
  loading: boolean;
  onGenerateReport: (templateId: string) => void;
}

const getTemplateIcon = (type: string) => {
  switch (type) {
    case 'performance':
      return <TrendingUpIcon sx={{ fontSize: 30 }} />;
    case 'audience':
      return <PeopleIcon sx={{ fontSize: 30 }} />;
    case 'competitive':
      return <AnalyticsIcon sx={{ fontSize: 30 }} />;
    case 'comprehensive':
      return <AssessmentIcon sx={{ fontSize: 30 }} />;
    default:
      return <AssessmentIcon sx={{ fontSize: 30 }} />;
  }
};

const getTemplateColor = (type: string) => {
  switch (type) {
    case 'performance':
      return 'success.main';
    case 'audience':
      return 'info.main';
    case 'competitive':
      return 'warning.main';
    case 'comprehensive':
      return 'primary.main';
    default:
      return 'primary.main';
  }
};

const getSectionIcon = (sectionType: string) => {
  switch (sectionType) {
    case 'metrics_summary':
      return <BarChartIcon />;
    case 'charts':
      return <ShowChartIcon />;
    case 'tables':
      return <TableChartIcon />;
    case 'insights':
      return <LightbulbIcon />;
    case 'recommendations':
      return <StarIcon />;
    default:
      return <AssessmentIcon />;
  }
};

// Predefined templates for new organizations
const defaultTemplates: ReportTemplate[] = [
  {
    id: 'template-performance',
    name: 'Performance Overview',
    type: 'performance',
    description: 'Comprehensive performance metrics across all platforms with trends and insights',
    sections: [
      { id: '1', type: 'metrics_summary', title: 'Key Metrics Summary', configuration: {}, order: 1 },
      { id: '2', type: 'charts', title: 'Performance Trends', configuration: {}, order: 2 },
      { id: '3', type: 'tables', title: 'Platform Breakdown', configuration: {}, order: 3 },
      { id: '4', type: 'recommendations', title: 'AI Recommendations', configuration: {}, order: 4 },
    ],
    defaultFilters: { timeframe: '30d' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'template-audience',
    name: 'Audience Insights',
    type: 'audience',
    description: 'Deep dive into audience demographics, behavior patterns, and engagement analysis',
    sections: [
      { id: '1', type: 'metrics_summary', title: 'Audience Overview', configuration: {}, order: 1 },
      { id: '2', type: 'charts', title: 'Demographics & Patterns', configuration: {}, order: 2 },
      { id: '3', type: 'insights', title: 'Behavioral Insights', configuration: {}, order: 3 },
      { id: '4', type: 'recommendations', title: 'Audience Optimization', configuration: {}, order: 4 },
    ],
    defaultFilters: { timeframe: '30d' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const ReportTemplatesComponent: React.FC<ReportTemplatesComponentProps> = ({
  templates,
  loading,
  onGenerateReport,
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<ReportTemplate | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, template: ReportTemplate) => {
    setMenuAnchor(event.currentTarget);
    setSelectedTemplate(template);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedTemplate(null);
  };

  const handlePreview = (template: ReportTemplate) => {
    setPreviewTemplate(template);
    handleMenuClose();
  };

  const allTemplates = templates.length > 0 ? templates : defaultTemplates;

  if (loading) {
    return (
      <Grid container spacing={3}>
        {Array.from(new Array(4)).map((_, index) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <Card>
              <CardContent>
                <Skeleton variant="circular" width={60} height={60} sx={{ mb: 2 }} />
                <Skeleton variant="text" height={30} sx={{ mb: 1 }} />
                <Skeleton variant="text" height={20} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" height={100} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Box>
      {/* Templates Grid */}
      <Grid container spacing={3}>
        {allTemplates.map((template) => (
          <Grid item xs={12} md={6} lg={4} key={template.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      width: 60, 
                      height: 60, 
                      bgcolor: getTemplateColor(template.type),
                      mr: 2
                    }}
                  >
                    {getTemplateIcon(template.type)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" gutterBottom>
                        {template.name}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, template)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                    <Chip 
                      label={template.type} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ textTransform: 'capitalize', mb: 1 }}
                    />
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" paragraph>
                  {template.description}
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  Report Sections ({template.sections.length})
                </Typography>
                <Stack spacing={1}>
                  {template.sections.slice(0, 3).map((section) => (
                    <Box key={section.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getSectionIcon(section.type)}
                      <Typography variant="caption" color="text.secondary">
                        {section.title}
                      </Typography>
                    </Box>
                  ))}
                  {template.sections.length > 3 && (
                    <Typography variant="caption" color="text.secondary">
                      +{template.sections.length - 3} more sections
                    </Typography>
                  )}
                </Stack>
              </CardContent>

              <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                <Button
                  size="small"
                  startIcon={<VisibilityIcon />}
                  onClick={() => handlePreview(template)}
                >
                  Preview
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<PlayArrowIcon />}
                  onClick={() => onGenerateReport(template.id)}
                >
                  Generate
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}

        {/* Create New Template Card */}
        <Grid item xs={12} md={6} lg={4}>
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed',
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover',
              },
              cursor: 'pointer',
            }}
            onClick={() => {/* Open create template dialog */}}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ width: 60, height: 60, bgcolor: 'grey.300', mx: 'auto', mb: 2 }}>
                <AddIcon sx={{ fontSize: 30 }} />
              </Avatar>
              <Typography variant="h6" gutterBottom>
                Create Custom Template
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Design your own report template with custom sections and filters
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Template Preview Dialog */}
      {previewTemplate && (
        <Paper 
          sx={{ 
            position: 'fixed', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            width: '80%',
            maxWidth: 600,
            maxHeight: '80vh',
            overflow: 'auto',
            zIndex: 1300,
            p: 3,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Template Preview: {previewTemplate.name}</Typography>
            <Button onClick={() => setPreviewTemplate(null)}>Close</Button>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Typography variant="body1" paragraph>
            {previewTemplate.description}
          </Typography>
          
          <Typography variant="subtitle2" gutterBottom>
            Report Sections
          </Typography>
          <List dense>
            {previewTemplate.sections
              .sort((a, b) => a.order - b.order)
              .map((section) => (
                <ListItem key={section.id}>
                  <ListItemIcon>
                    {getSectionIcon(section.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={section.title}
                    secondary={section.type.replace('_', ' ').toUpperCase()}
                  />
                </ListItem>
              ))}
          </List>

          <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              onClick={() => {
                onGenerateReport(previewTemplate.id);
                setPreviewTemplate(null);
              }}
            >
              Generate This Report
            </Button>
            <Button variant="outlined" onClick={() => setPreviewTemplate(null)}>
              Close
            </Button>
          </Box>
        </Paper>
      )}

      {/* Background overlay for preview */}
      {previewTemplate && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1200,
          }}
          onClick={() => setPreviewTemplate(null)}
        />
      )}

      {/* Context Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={() => { onGenerateReport(selectedTemplate!.id); handleMenuClose(); }}>
          <PlayArrowIcon sx={{ mr: 1 }} />
          Generate Report
        </MenuItem>
        <MenuItem onClick={() => handlePreview(selectedTemplate!)}>
          <VisibilityIcon sx={{ mr: 1 }} />
          Preview Template
        </MenuItem>
        <MenuItem onClick={() => { /* Copy template */ handleMenuClose(); }}>
          <CopyIcon sx={{ mr: 1 }} />
          Duplicate Template
        </MenuItem>
        <MenuItem onClick={() => { /* Edit template */ handleMenuClose(); }}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Template
        </MenuItem>
        <MenuItem onClick={() => { /* Delete template */ handleMenuClose(); }} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Template
        </MenuItem>
      </Menu>

      {/* Empty State */}
      {!loading && templates.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No custom templates created yet. Use the default templates above or create your own custom template.
        </Alert>
      )}
    </Box>
  );
};

export default ReportTemplatesComponent;