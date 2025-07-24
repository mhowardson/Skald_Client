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
  ListItemSecondaryAction,
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
  CircularProgress,
  LinearProgress,
  Avatar,
} from '@mui/material';
import {
  Approval as ApprovalIcon,
  Schedule as ScheduleIcon,
  Analytics as AnalyticsIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  HourglassEmpty as PendingIcon,
  Warning as EscalatedIcon,
  MoreVert as MoreIcon,
  Comment as CommentIcon,
  Visibility as ViewIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as TimeIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';

import {
  useGetApprovalRequestsQuery,
  useGetApprovalStatsQuery,
  useGetMyAssignmentsQuery,
  useApproveStepMutation,
  useRejectStepMutation,
  useAddCommentMutation,
  type ApprovalRequest,
  type ApprovalRequestStep
} from '../../store/api/approvalApi';

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

export const ApprovalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'approve' | 'reject' | 'comment';
    request?: ApprovalRequest;
    step?: ApprovalRequestStep;
  }>({ open: false, type: 'approve' });
  const [menuAnchor, setMenuAnchor] = useState<{ element: HTMLElement; request: ApprovalRequest } | null>(null);

  // API calls
  const { data: requestsData, isLoading: requestsLoading } = useGetApprovalRequestsQuery({
    page: 1,
    limit: 20,
    assignedToMe: activeTab === 1,
    status: activeTab === 2 ? 'pending' : undefined
  });

  const { data: assignmentsData } = useGetMyAssignmentsQuery({});
  const { data: statsData, isLoading: statsLoading } = useGetApprovalStatsQuery({ period: 'month' });

  const [approveStep] = useApproveStepMutation();
  const [rejectStep] = useRejectStepMutation();
  const [addComment] = useAddCommentMutation();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleApprove = async (requestId: string, stepId: string, comment?: string) => {
    try {
      await approveStep({ requestId, stepId, comment }).unwrap();
      setActionDialog({ open: false, type: 'approve' });
    } catch (error) {
      console.error('Failed to approve:', error);
    }
  };

  const handleReject = async (requestId: string, stepId: string, comment: string) => {
    try {
      await rejectStep({ requestId, stepId, comment }).unwrap();
      setActionDialog({ open: false, type: 'reject' });
    } catch (error) {
      console.error('Failed to reject:', error);
    }
  };

  const handleAddComment = async (requestId: string, message: string) => {
    try {
      await addComment({ requestId, message }).unwrap();
      setActionDialog({ open: false, type: 'comment' });
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const getStatusIcon = (status: ApprovalRequest['status']) => {
    switch (status) {
      case 'approved': return <ApprovedIcon color="success" />;
      case 'rejected': return <RejectedIcon color="error" />;
      case 'pending': return <PendingIcon color="warning" />;
      case 'escalated': return <EscalatedIcon color="error" />;
      default: return <PendingIcon />;
    }
  };

  const getStatusColor = (status: ApprovalRequest['status']) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      case 'escalated': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: ApprovalRequest['priority']) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getCurrentUserStep = (request: ApprovalRequest) => {
    // Mock current user ID - in real app would come from auth state
    const currentUserId = 'current-user-id';
    
    return request.steps.find(step => 
      step.status === 'pending' && 
      step.assignedTo.includes(currentUserId)
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Content Approval
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and approve content before publication
        </Typography>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab 
              label="All Requests" 
              icon={<ApprovalIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="My Assignments" 
              icon={<AssignmentIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Pending" 
              icon={<ScheduleIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Analytics" 
              icon={<AnalyticsIcon />} 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* All Requests Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            {/* Quick Stats */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main">
                        {statsData?.pending || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pending
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {statsData?.approved || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Approved
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="error.main">
                        {statsData?.rejected || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Rejected
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="info.main">
                        {statsData ? (statsData.approvalRate * 100).toFixed(1) : 0}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Approval Rate
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>

            {/* Requests List */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Requests
                  </Typography>
                  
                  {requestsLoading ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <CircularProgress />
                    </Box>
                  ) : requestsData?.requests.length ? (
                    <List>
                      {requestsData.requests.map((request) => (
                        <ListItem 
                          key={request.id} 
                          divider
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' }
                          }}
                          onClick={() => setSelectedRequest(request)}
                        >
                          <ListItemIcon>
                            {getStatusIcon(request.status)}
                          </ListItemIcon>
                          
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle1">
                                  {request.content.title}
                                </Typography>
                                <Chip
                                  label={request.status}
                                  size="small"
                                  color={getStatusColor(request.status) as any}
                                />
                                <Chip
                                  label={request.priority}
                                  size="small"
                                  color={getPriorityColor(request.priority) as any}
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {request.content.type} • {request.content.platforms.join(', ')}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Submitted {formatTimeAgo(request.submittedAt)} by {request.submittedBy}
                                </Typography>
                              </Box>
                            }
                          />
                          
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuAnchor({ element: e.currentTarget, request });
                              }}
                            >
                              <MoreIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      No approval requests found
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* My Assignments Tab */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            {/* Assignment Stats */}
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="primary.main">
                    {assignmentsData?.total || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Assignments
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="warning.main">
                    {assignmentsData?.assignments.filter(a => a.daysOverdue && a.daysOverdue > 0).length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overdue
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="info.main">
                    {statsData ? statsData.averageTimeToApproval.toFixed(1) : 0}h
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg. Review Time
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* My Assignments List */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Pending Assignments
                  </Typography>
                  
                  {assignmentsData?.assignments.length ? (
                    <List>
                      {assignmentsData.assignments.map(({ request, step, daysOverdue }) => (
                        <ListItem key={`${request.id}-${step.id}`} divider>
                          <ListItemIcon>
                            <Avatar sx={{ bgcolor: daysOverdue && daysOverdue > 0 ? 'error.main' : 'warning.main' }}>
                              <TimeIcon />
                            </Avatar>
                          </ListItemIcon>
                          
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle1">
                                  {request.content.title}
                                </Typography>
                                {daysOverdue && daysOverdue > 0 && (
                                  <Chip
                                    label={`${daysOverdue} days overdue`}
                                    size="small"
                                    color="error"
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Step: {step.stepId} • Priority: {request.priority}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Due: {request.dueAt ? new Date(request.dueAt).toLocaleDateString() : 'No deadline'}
                                </Typography>
                              </Box>
                            }
                          />
                          
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              startIcon={<ThumbUpIcon />}
                              color="success"
                              onClick={() => setActionDialog({
                                open: true,
                                type: 'approve',
                                request,
                                step
                              })}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              startIcon={<ThumbDownIcon />}
                              color="error"
                              onClick={() => setActionDialog({
                                open: true,
                                type: 'reject',
                                request,
                                step
                              })}
                            >
                              Reject
                            </Button>
                            <Button
                              size="small"
                              startIcon={<CommentIcon />}
                              onClick={() => setActionDialog({
                                open: true,
                                type: 'comment',
                                request
                              })}
                            >
                              Comment
                            </Button>
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      No pending assignments
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Pending Tab */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" gutterBottom>
            Pending Approvals
          </Typography>
          <Typography color="text.secondary">
            Content waiting for approval across all workflows
          </Typography>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={activeTab} index={3}>
          {statsLoading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : statsData && (
            <Grid container spacing={3}>
              {/* Performance Metrics */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Performance Metrics
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Average Time to Approval</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {statsData.averageTimeToApproval.toFixed(1)} hours
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">On-time Approvals</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {statsData.performance.onTimeApprovals}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Escalations</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {statsData.performance.escalations}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Approval Rate Trend */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Approval Trends
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <TrendingUpIcon color="success" />
                      <Typography variant="h4" color="success.main">
                        {(statsData.approvalRate * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        approval rate
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={statsData.approvalRate * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </CardContent>
                </Card>
              </Grid>

              {/* Workflow Performance */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Workflow Performance
                    </Typography>
                    {Object.entries(statsData.byWorkflow).map(([workflowId, count]) => (
                      <Box key={workflowId} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Workflow {workflowId}</Typography>
                          <Typography variant="body2" fontWeight="bold">{count} requests</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(count / statsData.total) * 100}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </TabPanel>
      </Paper>

      {/* Request Menu */}
      <Menu
        anchorEl={menuAnchor?.element}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => {
          setSelectedRequest(menuAnchor!.request);
          setMenuAnchor(null);
        }}>
          <ViewIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => {
          const step = getCurrentUserStep(menuAnchor!.request);
          if (step) {
            setActionDialog({
              open: true,
              type: 'approve',
              request: menuAnchor!.request,
              step
            });
          }
          setMenuAnchor(null);
        }}>
          <ThumbUpIcon sx={{ mr: 1 }} />
          Approve
        </MenuItem>
        <MenuItem onClick={() => {
          const step = getCurrentUserStep(menuAnchor!.request);
          if (step) {
            setActionDialog({
              open: true,
              type: 'reject',
              request: menuAnchor!.request,
              step
            });
          }
          setMenuAnchor(null);
        }}>
          <ThumbDownIcon sx={{ mr: 1 }} />
          Reject
        </MenuItem>
      </Menu>

      {/* Action Dialog */}
      <ActionDialog
        open={actionDialog.open}
        type={actionDialog.type}
        request={actionDialog.request}
        step={actionDialog.step}
        onClose={() => setActionDialog({ open: false, type: 'approve' })}
        onApprove={handleApprove}
        onReject={handleReject}
        onComment={handleAddComment}
      />

      {/* Request Details Dialog */}
      {selectedRequest && (
        <RequestDetailsDialog
          request={selectedRequest}
          open={Boolean(selectedRequest)}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </Container>
  );
};

// Action Dialog Component
interface ActionDialogProps {
  open: boolean;
  type: 'approve' | 'reject' | 'comment';
  request?: ApprovalRequest;
  step?: ApprovalRequestStep;
  onClose: () => void;
  onApprove: (requestId: string, stepId: string, comment?: string) => void;
  onReject: (requestId: string, stepId: string, comment: string) => void;
  onComment: (requestId: string, message: string) => void;
}

const ActionDialog: React.FC<ActionDialogProps> = ({
  open,
  type,
  request,
  step,
  onClose,
  onApprove,
  onReject,
  onComment
}) => {
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (!request) return;

    switch (type) {
      case 'approve':
        if (step) {
          onApprove(request.id, step.stepId, comment || undefined);
        }
        break;
      case 'reject':
        if (step && comment.trim()) {
          onReject(request.id, step.stepId, comment);
        }
        break;
      case 'comment':
        if (comment.trim()) {
          onComment(request.id, comment);
        }
        break;
    }
    setComment('');
  };

  const getTitle = () => {
    switch (type) {
      case 'approve': return 'Approve Content';
      case 'reject': return 'Reject Content';
      case 'comment': return 'Add Comment';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{getTitle()}</DialogTitle>
      <DialogContent>
        {request && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {request.content.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {request.content.body.substring(0, 200)}...
            </Typography>
          </Box>
        )}
        
        <TextField
          fullWidth
          multiline
          rows={4}
          label={type === 'reject' ? 'Reason for rejection (required)' : 'Comment (optional)'}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required={type === 'reject'}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={type === 'reject' && !comment.trim()}
          color={type === 'reject' ? 'error' : 'primary'}
        >
          {type === 'approve' ? 'Approve' : type === 'reject' ? 'Reject' : 'Add Comment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Request Details Dialog Component
interface RequestDetailsDialogProps {
  request: ApprovalRequest;
  open: boolean;
  onClose: () => void;
}

const RequestDetailsDialog: React.FC<RequestDetailsDialogProps> = ({
  request,
  open,
  onClose
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{request.content.title}</Typography>
          <Chip
            label={request.status}
            color={request.status === 'approved' ? 'success' : 
                   request.status === 'rejected' ? 'error' : 'warning'}
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>Content</Typography>
            <Typography paragraph>{request.content.body}</Typography>
            
            <Typography variant="h6" gutterBottom>Details</Typography>
            <Typography variant="body2" color="text.secondary">
              Type: {request.content.type}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Platforms: {request.content.platforms.join(', ')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Submitted: {new Date(request.submittedAt).toLocaleString()}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>Approval Steps</Typography>
            <List dense>
              {request.steps.map((step, index) => (
                <ListItem key={step.id}>
                  <ListItemIcon>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                      {index + 1}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={`Step ${index + 1}`}
                    secondary={step.status}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};