/**
 * Reports Page Component
 * 
 * Main reports dashboard for viewing, generating, and managing automated reports.
 * Includes report templates, schedules, and generated report history.
 * 
 * @component ReportsPage
 * @version 1.0.0
 * 
 * @features
 * - Generated reports list with filtering
 * - Quick report generation
 * - Report templates management
 * - Scheduled reports configuration
 * - Report download and sharing
 * - Analytics on report usage
 */

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Avatar,
  LinearProgress,
  Tabs,
  Tab,
  Alert,
  Stack,
  Paper,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Download as DownloadIcon,
  Schedule as ScheduleIcon,
  Description as ReportIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Assessment as AnalyticsIcon,
  Autorenew as AutorenewIcon,
  CloudDownload as CloudDownloadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { ReportsListComponent } from '../../components/reports/ReportsListComponent';
import { ReportTemplatesComponent } from '../../components/reports/ReportTemplatesComponent';
import { ReportSchedulesComponent } from '../../components/reports/ReportSchedulesComponent';
import { GenerateReportDialog } from '../../components/reports/GenerateReportDialog';
import { CreateScheduleDialog } from '../../components/reports/CreateScheduleDialog';
import {
  useGetReportsQuery,
  useGetReportTemplatesQuery,
  useGetReportSchedulesQuery,
  GeneratedReport,
} from '../../store/api/reportGenerationApi';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  // API Queries
  const { data: reportsData, isLoading: reportsLoading, refetch: refetchReports } = useGetReportsQuery({
    page: 1,
    limit: 10,
  });

  const { data: templatesData, isLoading: templatesLoading } = useGetReportTemplatesQuery();
  const { data: schedulesData, isLoading: schedulesLoading } = useGetReportSchedulesQuery();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'generating':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CloudDownloadIcon />;
      case 'failed':
        return <DeleteIcon />;
      case 'generating':
        return <AutorenewIcon />;
      default:
        return <ReportIcon />;
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Quick stats for the overview
  const quickStats = React.useMemo(() => {
    const reports = reportsData?.reports || [];
    const schedules = schedulesData?.schedules || [];
    
    return {
      totalReports: reports.length,
      recentReports: reports.filter(r => 
        new Date(r.generatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length,
      activeSchedules: schedules.filter(s => s.isActive).length,
      failedReports: reports.filter(r => r.status === 'failed').length,
    };
  }, [reportsData, schedulesData]);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Reports & Analytics
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => refetchReports()}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<ScheduleIcon />}
              onClick={() => setScheduleDialogOpen(true)}
            >
              Schedule Report
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setGenerateDialogOpen(true)}
            >
              Generate Report
            </Button>
            <IconButton onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Box>

        <Typography variant="body1" color="text.secondary">
          Generate automated reports, manage templates, and schedule regular analytics deliveries
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
                <ReportIcon sx={{ fontSize: 30 }} />
              </Avatar>
              <Typography variant="h4" gutterBottom>
                {quickStats.totalReports}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Reports
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ width: 60, height: 60, bgcolor: 'success.main', mx: 'auto', mb: 2 }}>
                <AnalyticsIcon sx={{ fontSize: 30 }} />
              </Avatar>
              <Typography variant="h4" gutterBottom>
                {quickStats.recentReports}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This Week
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ width: 60, height: 60, bgcolor: 'info.main', mx: 'auto', mb: 2 }}>
                <ScheduleIcon sx={{ fontSize: 30 }} />
              </Avatar>
              <Typography variant="h4" gutterBottom>
                {quickStats.activeSchedules}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Schedules
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ width: 60, height: 60, bgcolor: 'warning.main', mx: 'auto', mb: 2 }}>
                <FilterIcon sx={{ fontSize: 30 }} />
              </Avatar>
              <Typography variant="h4" gutterBottom>
                {templatesData?.templates?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Templates
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="reports tabs">
            <Tab label="Recent Reports" icon={<ReportIcon />} iconPosition="start" />
            <Tab label="Templates" icon={<AnalyticsIcon />} iconPosition="start" />
            <Tab label="Schedules" icon={<ScheduleIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <ReportsListComponent 
            reports={reportsData?.reports || []}
            loading={reportsLoading}
            onRefresh={refetchReports}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <ReportTemplatesComponent 
            templates={templatesData?.templates || []}
            loading={templatesLoading}
            onGenerateReport={(templateId) => {
              setGenerateDialogOpen(true);
              // Pre-select template
            }}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <ReportSchedulesComponent 
            schedules={schedulesData?.schedules || []}
            loading={schedulesLoading}
            onCreateSchedule={() => setScheduleDialogOpen(true)}
          />
        </TabPanel>
      </Card>

      {/* Recent Activity */}
      {quickStats.failedReports > 0 && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          {quickStats.failedReports} report{quickStats.failedReports > 1 ? 's' : ''} failed to generate recently. 
          Check the reports list for details.
        </Alert>
      )}

      {/* Context Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={() => { handleMenuClose(); setActiveTab(1); }}>
          <AnalyticsIcon sx={{ mr: 1 }} />
          Manage Templates
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); /* Export reports */ }}>
          <DownloadIcon sx={{ mr: 1 }} />
          Export Report Data
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); /* View analytics */ }}>
          <FilterIcon sx={{ mr: 1 }} />
          Report Usage Analytics
        </MenuItem>
      </Menu>

      {/* Dialogs */}
      <GenerateReportDialog
        open={generateDialogOpen}
        onClose={() => setGenerateDialogOpen(false)}
        templates={templatesData?.templates || []}
      />

      <CreateScheduleDialog
        open={scheduleDialogOpen}
        onClose={() => setScheduleDialogOpen(false)}
        templates={templatesData?.templates || []}
      />
    </Container>
  );
};

export default ReportsPage;