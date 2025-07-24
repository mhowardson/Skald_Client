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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';
import {
  Email as EmailIcon,
  Campaign as CampaignIcon,
  NotificationsActive as AlertIcon,
  Assessment as LogsIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  Visibility as PreviewIcon,
  MoreVert as MoreIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  OpenInNew as OpenIcon
} from '@mui/icons-material';

import {
  useGetEmailTemplatesQuery,
  useGetEmailCampaignsQuery,
  useGetEmailAlertsQuery,
  useGetEmailLogsQuery,
  useCreateEmailTemplateMutation,
  useCreateEmailCampaignMutation,
  useCreateEmailAlertMutation,
  useSendEmailCampaignMutation,
  usePauseEmailCampaignMutation,
  usePreviewEmailTemplateMutation,
  type EmailTemplate,
  type EmailCampaign,
  type EmailAlert
} from '../../store/api/emailApi';

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

export const EmailPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [templateDialog, setTemplateDialog] = useState(false);
  const [campaignDialog, setCampaignDialog] = useState(false);
  const [alertDialog, setAlertDialog] = useState(false);
  const [previewDialog, setPreviewDialog] = useState<{ open: boolean; template?: EmailTemplate }>({ open: false });
  const [menuAnchor, setMenuAnchor] = useState<{ element: HTMLElement; template?: EmailTemplate; campaign?: EmailCampaign; alert?: EmailAlert } | null>(null);

  // API calls
  const { data: templatesData, isLoading: templatesLoading } = useGetEmailTemplatesQuery({});
  const { data: campaignsData, isLoading: campaignsLoading } = useGetEmailCampaignsQuery({});
  const { data: alertsData, isLoading: alertsLoading } = useGetEmailAlertsQuery({});
  const { data: logsData, isLoading: logsLoading } = useGetEmailLogsQuery({});

  const [createTemplate] = useCreateEmailTemplateMutation();
  const [createCampaign] = useCreateEmailCampaignMutation();
  const [createAlert] = useCreateEmailAlertMutation();
  const [sendCampaign] = useSendEmailCampaignMutation();
  const [pauseCampaign] = usePauseEmailCampaignMutation();
  const [previewTemplate] = usePreviewEmailTemplateMutation();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCreateTemplate = async (templateData: {
    name: string;
    subject: string;
    htmlContent: string;
    textContent: string;
    type: EmailTemplate['type'];
  }) => {
    try {
      await createTemplate(templateData).unwrap();
      setTemplateDialog(false);
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  const handleCreateCampaign = async (campaignData: {
    name: string;
    templateId: string;
    recipients: EmailCampaign['recipients'];
    scheduling: EmailCampaign['scheduling'];
  }) => {
    try {
      await createCampaign(campaignData).unwrap();
      setCampaignDialog(false);
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  const handleCreateAlert = async (alertData: {
    name: string;
    trigger: EmailAlert['trigger'];
    actions: EmailAlert['actions'];
  }) => {
    try {
      await createAlert(alertData).unwrap();
      setAlertDialog(false);
    } catch (error) {
      console.error('Failed to create alert:', error);
    }
  };

  const handleSendCampaign = async (campaignId: string) => {
    try {
      await sendCampaign({ id: campaignId }).unwrap();
      setMenuAnchor(null);
    } catch (error) {
      console.error('Failed to send campaign:', error);
    }
  };

  const handlePauseCampaign = async (campaignId: string) => {
    try {
      await pauseCampaign(campaignId).unwrap();
      setMenuAnchor(null);
    } catch (error) {
      console.error('Failed to pause campaign:', error);
    }
  };

  const handlePreviewTemplate = async (template: EmailTemplate) => {
    try {
      const result = await previewTemplate({ id: template.id }).unwrap();
      setPreviewDialog({ open: true, template: { ...template, htmlContent: result.html } });
    } catch (error) {
      console.error('Failed to preview template:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'success';
      case 'sending': return 'info';
      case 'scheduled': return 'warning';
      case 'failed': return 'error';
      case 'paused': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckIcon color="success" />;
      case 'sending': return <SendIcon color="info" />;
      case 'scheduled': return <ScheduleIcon color="warning" />;
      case 'failed': return <ErrorIcon color="error" />;
      case 'paused': return <PauseIcon color="action" />;
      default: return <CheckIcon />;
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatPercentage = (num: number) => {
    return (num * 100).toFixed(1) + '%';
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Email Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage email templates, campaigns, and automated alerts
        </Typography>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab 
              label="Templates" 
              icon={<EmailIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Campaigns" 
              icon={<CampaignIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Alerts" 
              icon={<AlertIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Logs" 
              icon={<LogsIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Settings" 
              icon={<SettingsIcon />} 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Templates Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Email Templates</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setTemplateDialog(true)}
            >
              Create Template
            </Button>
          </Box>

          {templatesLoading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {templatesData?.templates.map((template) => (
                <Grid item xs={12} md={6} lg={4} key={template.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Typography variant="h6" noWrap>
                          {template.name}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => setMenuAnchor({ element: e.currentTarget, template })}
                        >
                          <MoreIcon />
                        </IconButton>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {template.subject}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        <Chip label={template.type} size="small" />
                        {template.isSystem && (
                          <Chip label="System" size="small" color="primary" />
                        )}
                        <Chip 
                          label={template.isActive ? 'Active' : 'Inactive'} 
                          size="small" 
                          color={template.isActive ? 'success' : 'default'}
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          size="small" 
                          startIcon={<PreviewIcon />}
                          onClick={() => handlePreviewTemplate(template)}
                        >
                          Preview
                        </Button>
                        <Button 
                          size="small" 
                          startIcon={<EditIcon />}
                        >
                          Edit
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Campaigns Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Email Campaigns</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCampaignDialog(true)}
            >
              Create Campaign
            </Button>
          </Box>

          {campaignsLoading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {campaignsData?.campaigns.map((campaign) => (
                <Grid item xs={12} key={campaign.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6">
                            {campaign.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {campaign.description}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={campaign.status} 
                            size="small" 
                            color={getStatusColor(campaign.status) as any}
                            icon={getStatusIcon(campaign.status)}
                          />
                          <IconButton
                            size="small"
                            onClick={(e) => setMenuAnchor({ element: e.currentTarget, campaign })}
                          >
                            <MoreIcon />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" color="primary.main">
                              {formatNumber(campaign.stats.recipientCount)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Recipients
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" color="success.main">
                              {formatNumber(campaign.stats.sentCount)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Sent
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" color="info.main">
                              {formatPercentage(campaign.stats.openRate)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Open Rate
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" color="warning.main">
                              {formatPercentage(campaign.stats.clickRate)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Click Rate
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Alerts Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Email Alerts</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAlertDialog(true)}
            >
              Create Alert
            </Button>
          </Box>

          {alertsLoading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {alertsData?.alerts.map((alert) => (
                <ListItem key={alert.id} divider>
                  <ListItemIcon>
                    <AlertIcon color={alert.isActive ? 'primary' : 'disabled'} />
                  </ListItemIcon>
                  <ListItemText
                    primary={alert.name}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {alert.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Trigger: {alert.trigger.type} • Triggered {alert.triggerCount} times
                        </Typography>
                      </Box>
                    }
                  />
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip 
                      label={alert.isActive ? 'Active' : 'Inactive'} 
                      size="small" 
                      color={alert.isActive ? 'success' : 'default'}
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => setMenuAnchor({ element: e.currentTarget, alert })}
                    >
                      <MoreIcon />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </TabPanel>

        {/* Logs Tab */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h6" gutterBottom>
            Email Logs
          </Typography>
          
          {logsLoading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : logsData && (
            <>
              {/* Stats Overview */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={2}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" color="primary.main">
                        {formatNumber(logsData.stats.sent)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Sent
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" color="success.main">
                        {formatNumber(logsData.stats.delivered)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Delivered
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" color="info.main">
                        {formatNumber(logsData.stats.opened)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Opened
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" color="warning.main">
                        {formatNumber(logsData.stats.clicked)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Clicked
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" color="error.main">
                        {formatNumber(logsData.stats.bounced)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Bounced
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" color="error.main">
                        {formatNumber(logsData.stats.failed)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Failed
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Logs Table */}
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Recipient</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Sent At</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logsData.logs.map((log) => (
                      <TableRow key={log.id} hover>
                        <TableCell>{log.recipient.email}</TableCell>
                        <TableCell>{log.subject}</TableCell>
                        <TableCell>
                          <Chip 
                            label={log.status} 
                            size="small" 
                            color={getStatusColor(log.status) as any}
                          />
                        </TableCell>
                        <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                        <TableCell align="right">
                          <IconButton size="small">
                            <OpenIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </TabPanel>

        {/* Settings Tab */}
        <TabPanel value={activeTab} index={4}>
          <Typography variant="h6" gutterBottom>
            Email Settings
          </Typography>
          <Alert severity="info">
            Email settings configuration coming soon...
          </Alert>
        </TabPanel>
      </Paper>

      {/* Menu */}
      <Menu
        anchorEl={menuAnchor?.element}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        {menuAnchor?.template && (
          <>
            <MenuItem onClick={() => handlePreviewTemplate(menuAnchor.template!)}>
              <PreviewIcon sx={{ mr: 1 }} />
              Preview
            </MenuItem>
            <MenuItem onClick={() => setMenuAnchor(null)}>
              <EditIcon sx={{ mr: 1 }} />
              Edit
            </MenuItem>
            <MenuItem onClick={() => setMenuAnchor(null)} sx={{ color: 'error.main' }}>
              <DeleteIcon sx={{ mr: 1 }} />
              Delete
            </MenuItem>
          </>
        )}
        {menuAnchor?.campaign && (
          <>
            {menuAnchor.campaign.status === 'draft' && (
              <MenuItem onClick={() => handleSendCampaign(menuAnchor.campaign!.id)}>
                <SendIcon sx={{ mr: 1 }} />
                Send Now
              </MenuItem>
            )}
            {menuAnchor.campaign.status === 'sending' && (
              <MenuItem onClick={() => handlePauseCampaign(menuAnchor.campaign!.id)}>
                <PauseIcon sx={{ mr: 1 }} />
                Pause
              </MenuItem>
            )}
            <MenuItem onClick={() => setMenuAnchor(null)}>
              <EditIcon sx={{ mr: 1 }} />
              Edit
            </MenuItem>
          </>
        )}
        {menuAnchor?.alert && (
          <>
            <MenuItem onClick={() => setMenuAnchor(null)}>
              <PlayIcon sx={{ mr: 1 }} />
              Test Alert
            </MenuItem>
            <MenuItem onClick={() => setMenuAnchor(null)}>
              <EditIcon sx={{ mr: 1 }} />
              Edit
            </MenuItem>
            <MenuItem onClick={() => setMenuAnchor(null)} sx={{ color: 'error.main' }}>
              <DeleteIcon sx={{ mr: 1 }} />
              Delete
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Preview Dialog */}
      <Dialog
        open={previewDialog.open}
        onClose={() => setPreviewDialog({ open: false })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Email Preview: {previewDialog.template?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ border: '1px solid #ddd', p: 2, borderRadius: 1 }}>
            <div dangerouslySetInnerHTML={{ __html: previewDialog.template?.htmlContent || '' }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog({ open: false })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create dialogs would go here */}
      <CreateTemplateDialog
        open={templateDialog}
        onClose={() => setTemplateDialog(false)}
        onCreate={handleCreateTemplate}
      />
    </Container>
  );
};

// Placeholder dialog components
const CreateTemplateDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onCreate: (data: any) => void;
}> = ({ open, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    htmlContent: '',
    textContent: '',
    type: 'custom' as EmailTemplate['type']
  });

  const handleSubmit = () => {
    if (formData.name && formData.subject && formData.htmlContent) {
      onCreate(formData);
      setFormData({ name: '', subject: '', htmlContent: '', textContent: '', type: 'custom' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create Email Template</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Template Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          sx={{ mb: 2, mt: 1 }}
        />
        
        <TextField
          fullWidth
          label="Subject Line"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Template Type</InputLabel>
          <Select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as EmailTemplate['type'] })}
            label="Template Type"
          >
            <MenuItem value="welcome">Welcome</MenuItem>
            <MenuItem value="invitation">Invitation</MenuItem>
            <MenuItem value="digest">Digest</MenuItem>
            <MenuItem value="custom">Custom</MenuItem>
          </Select>
        </FormControl>
        
        <TextField
          fullWidth
          label="HTML Content"
          multiline
          rows={8}
          value={formData.htmlContent}
          onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Text Content (Optional)"
          multiline
          rows={4}
          value={formData.textContent}
          onChange={(e) => setFormData({ ...formData, textContent: e.target.value })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!formData.name || !formData.subject || !formData.htmlContent}
        >
          Create Template
        </Button>
      </DialogActions>
    </Dialog>
  );
};