import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Stack,
  Grid,
  Button,
  IconButton,
  Chip,
  Avatar,
  Badge,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Collapse,
  Tooltip,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Approval,
  CheckCircle,
  Cancel,
  Schedule,
  Edit,
  Comment,
  Visibility,
  Send,
  History,
  Person,
  Group,
  AccessTime,
  Priority,
  Flag,
  Assignment,
  Timeline,
  Notifications,
  MoreVert,
  ThumbUp,
  ThumbDown,
  Edit as EditIcon,
  Delete,
  Share,
  ContentCopy,
  Warning,
  Info,
  HourglassEmpty,
  FastForward,
  Gavel,
  Psychology,
  AutoAwesome,
  Speed,
  Analytics,
} from '@mui/icons-material';
import { format, formatDistanceToNow, addDays, isAfter, isBefore } from 'date-fns';

interface ApprovalWorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'review' | 'approval' | 'final_approval' | 'auto';
  required: boolean;
  assignees: {
    type: 'user' | 'role' | 'team';
    id: string;
    name: string;
    avatar?: string;
  }[];
  permissions: {
    canEdit: boolean;
    canReject: boolean;
    canApprove: boolean;
    canComment: boolean;
    canReassign: boolean;
  };
  conditions?: {
    minApprovals?: number;
    unanimousRequired?: boolean;
    timeLimit?: number; // hours
    priorityThreshold?: 'low' | 'medium' | 'high' | 'urgent';
  };
}

interface ContentSubmission {
  id: string;
  title: string;
  content: string;
  platforms: string[];
  scheduledAt: Date;
  submittedBy: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  submittedAt: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  tags: string[];
  media?: { url: string; type: string; alt?: string }[];
  currentStep: number;
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'published' | 'expired';
  approvals: {
    stepId: string;
    userId: string;
    userName: string;
    action: 'approved' | 'rejected' | 'commented';
    comment?: string;
    timestamp: Date;
  }[];
  comments: {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    message: string;
    timestamp: Date;
    internal: boolean; // Internal comments vs public feedback
  }[];
  deadline?: Date;
  estimatedReach?: number;
  riskScore?: number;
}

interface ApprovalWorkflowProps {
  workflows?: ApprovalWorkflowStep[][];
  submissions?: ContentSubmission[];
  currentUser?: {
    id: string;
    name: string;
    role: string;
    permissions: string[];
  };
  onApprove?: (submissionId: string, comment?: string) => void;
  onReject?: (submissionId: string, reason: string) => void;
  onComment?: (submissionId: string, comment: string, internal?: boolean) => void;
  onEdit?: (submission: ContentSubmission) => void;
  onReassign?: (submissionId: string, newAssignee: string) => void;
}

const platformColors: Record<string, string> = {
  linkedin: '#0A66C2',
  twitter: '#1DA1F2',
  instagram: '#E4405F',
  facebook: '#1877F2',
  youtube: '#FF0000',
  tiktok: '#000000',
};

const platformIcons: Record<string, string> = {
  linkedin: '💼',
  twitter: '🐦',
  instagram: '📷',
  facebook: '📘',
  youtube: '📺',
  tiktok: '🎵',
};

// Mock workflow steps
const mockWorkflowSteps: ApprovalWorkflowStep[] = [
  {
    id: '1',
    name: 'Content Review',
    description: 'Initial content quality and compliance review',
    type: 'review',
    required: true,
    assignees: [
      { type: 'role', id: 'content_reviewer', name: 'Content Reviewers' },
    ],
    permissions: {
      canEdit: true,
      canReject: true,
      canApprove: true,
      canComment: true,
      canReassign: false,
    },
    conditions: {
      minApprovals: 1,
      timeLimit: 24,
    },
  },
  {
    id: '2',
    name: 'Brand Compliance',
    description: 'Brand guidelines and messaging approval',
    type: 'approval',
    required: true,
    assignees: [
      { type: 'user', id: 'brand_manager', name: 'Sarah Wilson', avatar: '' },
    ],
    permissions: {
      canEdit: false,
      canReject: true,
      canApprove: true,
      canComment: true,
      canReassign: true,
    },
    conditions: {
      unanimousRequired: true,
      timeLimit: 48,
    },
  },
  {
    id: '3',
    name: 'Legal Review',
    description: 'Legal compliance and risk assessment (high-risk content only)',
    type: 'approval',
    required: false,
    assignees: [
      { type: 'team', id: 'legal_team', name: 'Legal Team' },
    ],
    permissions: {
      canEdit: false,
      canReject: true,
      canApprove: true,
      canComment: true,
      canReassign: false,
    },
    conditions: {
      priorityThreshold: 'high',
      unanimousRequired: true,
      timeLimit: 72,
    },
  },
  {
    id: '4',
    name: 'Final Approval',
    description: 'Final sign-off before publishing',
    type: 'final_approval',
    required: true,
    assignees: [
      { type: 'user', id: 'marketing_director', name: 'Mike Johnson', avatar: '' },
    ],
    permissions: {
      canEdit: false,
      canReject: true,
      canApprove: true,
      canComment: true,
      canReassign: true,
    },
    conditions: {
      minApprovals: 1,
      timeLimit: 12,
    },
  },
];

// Mock content submissions
const mockSubmissions: ContentSubmission[] = [
  {
    id: '1',
    title: 'Q4 Product Launch Campaign',
    content: '🚀 Exciting news! We\'re launching our revolutionary AI-powered analytics platform this quarter. Get ready to transform your data insights like never before...',
    platforms: ['linkedin', 'twitter', 'instagram'],
    scheduledAt: addDays(new Date(), 3),
    submittedBy: {
      id: 'content_creator_1',
      name: 'Alex Thompson',
      avatar: '',
      role: 'Content Creator',
    },
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    priority: 'high',
    category: 'Product Launch',
    tags: ['product', 'launch', 'AI', 'analytics'],
    currentStep: 1,
    status: 'in_review',
    approvals: [
      {
        stepId: '1',
        userId: 'reviewer_1',
        userName: 'Emily Davis',
        action: 'approved',
        comment: 'Content looks great! Minor grammar suggestions applied.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
      },
    ],
    comments: [
      {
        id: '1',
        userId: 'reviewer_1',
        userName: 'Emily Davis',
        userAvatar: '',
        message: 'The messaging is strong, but consider adding more specific benefits for each platform.',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        internal: false,
      },
      {
        id: '2',
        userId: 'content_creator_1',
        userName: 'Alex Thompson',
        userAvatar: '',
        message: 'Thanks for the feedback! I\'ve updated the content to include platform-specific benefits.',
        timestamp: new Date(Date.now() - 35 * 60 * 1000),
        internal: false,
      },
    ],
    deadline: addDays(new Date(), 2),
    estimatedReach: 125000,
    riskScore: 3, // Low risk
  },
  {
    id: '2',
    title: 'Weekly Industry Insights',
    content: '📊 This week in social media marketing: New algorithm changes, emerging trends, and what they mean for your strategy...',
    platforms: ['linkedin', 'twitter'],
    scheduledAt: addDays(new Date(), 1),
    submittedBy: {
      id: 'content_creator_2',
      name: 'Jordan Lee',
      avatar: '',
      role: 'Content Strategist',
    },
    submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    priority: 'medium',
    category: 'Thought Leadership',
    tags: ['insights', 'trends', 'strategy'],
    currentStep: 0,
    status: 'pending',
    approvals: [],
    comments: [],
    deadline: addDays(new Date(), 1),
    estimatedReach: 85000,
    riskScore: 1, // Very low risk
  },
  {
    id: '3',
    title: 'Customer Success Story - Enterprise Client',
    content: '🎉 Amazing results! Our enterprise client achieved 300% ROI using our platform. Here\'s their journey and key insights that could transform your business too...',
    platforms: ['linkedin', 'twitter', 'facebook'],
    scheduledAt: addDays(new Date(), 5),
    submittedBy: {
      id: 'content_creator_3',
      name: 'Sam Chen',
      avatar: '',
      role: 'Content Manager',
    },
    submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    priority: 'urgent',
    category: 'Case Study',
    tags: ['success-story', 'enterprise', 'ROI'],
    currentStep: 2,
    status: 'in_review',
    approvals: [
      {
        stepId: '1',
        userId: 'reviewer_1',
        userName: 'Emily Davis',
        action: 'approved',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      },
      {
        stepId: '2',
        userId: 'brand_manager',
        userName: 'Sarah Wilson',
        action: 'rejected',
        comment: 'Need to verify client consent for using specific ROI numbers. Please get written approval before proceeding.',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    ],
    comments: [
      {
        id: '1',
        userId: 'brand_manager',
        userName: 'Sarah Wilson',
        userAvatar: '',
        message: 'Great story! However, we need to be careful about sharing specific client data. Legal review required.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        internal: true,
      },
    ],
    deadline: addDays(new Date(), 4),
    estimatedReach: 180000,
    riskScore: 7, // Medium-high risk due to client data
  },
];

export const ApprovalWorkflow: React.FC<ApprovalWorkflowProps> = ({
  workflows = [mockWorkflowSteps],
  submissions = mockSubmissions,
  currentUser = {
    id: 'reviewer_1',
    name: 'Emily Davis',
    role: 'Content Reviewer',
    permissions: ['review', 'approve', 'comment'],
  },
  onApprove,
  onReject,
  onComment,
  onEdit,
  onReassign,
}) => {
  const theme = useTheme();
  const [selectedSubmission, setSelectedSubmission] = useState<ContentSubmission | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'comment'>('approve');
  const [actionComment, setActionComment] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'queue' | 'analytics' | 'workflows'>('queue');
  const [menuAnchor, setMenuAnchor] = useState<{ element: HTMLElement; submission: ContentSubmission } | null>(null);

  const workflowSteps = workflows[0] || mockWorkflowSteps;

  // Filter submissions based on current user's assignments
  const mySubmissions = useMemo(() => {
    return submissions.filter(submission => {
      if (submission.status === 'published' || submission.status === 'rejected') return false;
      
      const currentStep = workflowSteps[submission.currentStep];
      if (!currentStep) return false;

      return currentStep.assignees.some(assignee => {
        if (assignee.type === 'user') return assignee.id === currentUser.id;
        if (assignee.type === 'role') return currentUser.permissions.includes(assignee.id);
        return false; // For teams, would need additional logic
      });
    });
  }, [submissions, workflowSteps, currentUser]);

  // Filter submissions based on filters
  const filteredSubmissions = useMemo(() => {
    let filtered = submissions;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(s => s.status === filterStatus);
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(s => s.priority === filterPriority);
    }

    return filtered.sort((a, b) => {
      // Sort by priority first, then by deadline
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      if (a.priority !== b.priority) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      if (a.deadline && b.deadline) {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });
  }, [submissions, filterStatus, filterPriority]);

  // Handle approval actions
  const handleApprovalAction = async (type: 'approve' | 'reject') => {
    if (!selectedSubmission) return;

    if (type === 'approve') {
      await onApprove?.(selectedSubmission.id, actionComment);
    } else {
      await onReject?.(selectedSubmission.id, actionComment);
    }

    setReviewDialogOpen(false);
    setActionComment('');
    setSelectedSubmission(null);
  };

  const handleAddComment = async () => {
    if (!selectedSubmission || !actionComment.trim()) return;

    await onComment?.(selectedSubmission.id, actionComment, false);
    setCommentDialogOpen(false);
    setActionComment('');
    setSelectedSubmission(null);
  };

  // Render submission card
  const renderSubmissionCard = (submission: ContentSubmission) => {
    const currentStep = workflowSteps[submission.currentStep];
    const isAssignedToMe = currentStep?.assignees.some(assignee => {
      if (assignee.type === 'user') return assignee.id === currentUser.id;
      if (assignee.type === 'role') return currentUser.permissions.includes(assignee.id);
      return false;
    });

    const timeRemaining = submission.deadline ? 
      new Date(submission.deadline).getTime() - new Date().getTime() : null;
    const isOverdue = timeRemaining ? timeRemaining < 0 : false;
    const isUrgent = timeRemaining ? timeRemaining < 24 * 60 * 60 * 1000 : false; // Less than 24 hours

    const lastApproval = submission.approvals[submission.approvals.length - 1];

    return (
      <Card 
        key={submission.id} 
        sx={{ 
          mb: 2, 
          borderRadius: 3, 
          border: `2px solid ${
            isAssignedToMe ? alpha(theme.palette.primary.main, 0.3) : alpha(theme.palette.divider, 0.2)
          }`,
          position: 'relative',
          '&:hover': {
            boxShadow: theme.shadows[8],
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Priority & Status Indicators */}
          <Stack direction="row" spacing={1} sx={{ position: 'absolute', top: 16, right: 16 }}>
            {isOverdue && (
              <Tooltip title="Overdue">
                <Chip
                  icon={<Warning />}
                  label="Overdue"
                  size="small"
                  color="error"
                  variant="filled"
                />
              </Tooltip>
            )}
            {isUrgent && !isOverdue && (
              <Tooltip title="Urgent - Due soon">
                <Chip
                  icon={<AccessTime />}
                  label="Urgent"
                  size="small"
                  color="warning"
                  variant="filled"
                />
              </Tooltip>
            )}
            <Chip
              label={submission.priority}
              size="small"
              color={submission.priority === 'urgent' ? 'error' : submission.priority === 'high' ? 'warning' : submission.priority === 'medium' ? 'info' : 'default'}
              variant="outlined"
              sx={{ textTransform: 'capitalize' }}
            />
          </Stack>

          {/* Header */}
          <Box sx={{ mr: 8, mb: 2 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
              {submission.title}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar sx={{ width: 24, height: 24 }}>
                  {submission.submittedBy.name.charAt(0)}
                </Avatar>
                <Typography variant="body2" color="text.secondary">
                  {submission.submittedBy.name} • {submission.submittedBy.role}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {formatDistanceToNow(submission.submittedAt)} ago
              </Typography>
            </Stack>
            
            {/* Platforms */}
            <Stack direction="row" spacing={0.5} sx={{ mb: 2 }}>
              {submission.platforms.map((platform) => (
                <Chip
                  key={platform}
                  label={platformIcons[platform]}
                  size="small"
                  sx={{
                    bgcolor: alpha(platformColors[platform], 0.1),
                    border: `1px solid ${alpha(platformColors[platform], 0.3)}`,
                  }}
                />
              ))}
            </Stack>
          </Box>

          {/* Content Preview */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ 
              display: '-webkit-box', 
              WebkitLineClamp: 3, 
              WebkitBoxOrient: 'vertical', 
              overflow: 'hidden',
              mb: 2,
            }}>
              {submission.content}
            </Typography>
            
            {/* Tags */}
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
              {submission.tags.map((tag) => (
                <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ mb: 0.5 }} />
              ))}
            </Stack>
          </Box>

          {/* Workflow Progress */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Approval Progress
            </Typography>
            <Stepper activeStep={submission.currentStep} orientation="horizontal" sx={{ mb: 2 }}>
              {workflowSteps.map((step, index) => (
                <Step key={step.id} completed={index < submission.currentStep}>
                  <StepLabel
                    StepIconComponent={({ active, completed }) => (
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          bgcolor: completed ? theme.palette.success.main : active ? theme.palette.primary.main : theme.palette.grey[300],
                          color: 'white',
                          fontSize: 12,
                        }}
                      >
                        {completed ? <CheckCircle sx={{ fontSize: 16 }} /> : index + 1}
                      </Avatar>
                    )}
                  >
                    <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'block' } }}>
                      {step.name}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
            
            {currentStep && (
              <Alert 
                severity={isAssignedToMe ? 'info' : 'default'} 
                sx={{ py: 0.5 }}
                icon={isAssignedToMe ? <Assignment /> : <Info />}
              >
                <Typography variant="body2">
                  <strong>Current Step:</strong> {currentStep.name}
                  {isAssignedToMe && ' - Awaiting your review'}
                </Typography>
              </Alert>
            )}
          </Box>

          {/* Last Action */}
          {lastApproval && (
            <Box sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                {lastApproval.action === 'approved' ? (
                  <CheckCircle sx={{ fontSize: 16, color: theme.palette.success.main }} />
                ) : (
                  <Cancel sx={{ fontSize: 16, color: theme.palette.error.main }} />
                )}
                <Typography variant="body2" fontWeight={600}>
                  {lastApproval.action === 'approved' ? 'Approved' : 'Rejected'} by {lastApproval.userName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDistanceToNow(lastApproval.timestamp)} ago
                </Typography>
              </Stack>
              {lastApproval.comment && (
                <Typography variant="body2" color="text.secondary">
                  "{lastApproval.comment}"
                </Typography>
              )}
            </Box>
          )}

          {/* Comments Preview */}
          {submission.comments.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Recent Comments ({submission.comments.length})
              </Typography>
              <Stack spacing={1}>
                {submission.comments.slice(-2).map((comment) => (
                  <Box key={comment.id} sx={{ p: 1.5, borderRadius: 1, bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                      <Avatar sx={{ width: 20, height: 20 }}>
                        {comment.userName.charAt(0)}
                      </Avatar>
                      <Typography variant="caption" fontWeight={600}>
                        {comment.userName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDistanceToNow(comment.timestamp)} ago
                      </Typography>
                      {comment.internal && (
                        <Chip label="Internal" size="small" color="warning" sx={{ height: 16, fontSize: '0.6rem' }} />
                      )}
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      {comment.message}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {/* Deadline & Metrics */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', p: 1, borderRadius: 1, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                <Typography variant="h6" fontWeight={600} color="info.main">
                  {submission.estimatedReach ? (submission.estimatedReach / 1000).toFixed(0) + 'K' : 'N/A'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Est. Reach
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', p: 1, borderRadius: 1, bgcolor: alpha(
                submission.riskScore && submission.riskScore > 5 ? theme.palette.error.main : 
                submission.riskScore && submission.riskScore > 3 ? theme.palette.warning.main : 
                theme.palette.success.main, 0.05
              )}}>
                <Typography 
                  variant="h6" 
                  fontWeight={600} 
                  color={
                    submission.riskScore && submission.riskScore > 5 ? 'error.main' : 
                    submission.riskScore && submission.riskScore > 3 ? 'warning.main' : 
                    'success.main'
                  }
                >
                  {submission.riskScore || 0}/10
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Risk Score
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Actions */}
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              variant="outlined"
              startIcon={<Visibility />}
              onClick={() => {
                setSelectedSubmission(submission);
                setReviewDialogOpen(true);
              }}
              sx={{ borderRadius: 2 }}
            >
              Review
            </Button>
            
            {isAssignedToMe && currentStep?.permissions.canComment && (
              <Button
                variant="outlined"
                startIcon={<Comment />}
                onClick={() => {
                  setSelectedSubmission(submission);
                  setCommentDialogOpen(true);
                }}
                sx={{ borderRadius: 2 }}
              >
                Comment
              </Button>
            )}
            
            {isAssignedToMe && currentStep?.permissions.canApprove && (
              <Button
                variant="contained"
                startIcon={<CheckCircle />}
                onClick={() => {
                  setSelectedSubmission(submission);
                  setActionType('approve');
                  setReviewDialogOpen(true);
                }}
                color="success"
                sx={{ borderRadius: 2 }}
              >
                Approve
              </Button>
            )}
            
            {isAssignedToMe && currentStep?.permissions.canReject && (
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => {
                  setSelectedSubmission(submission);
                  setActionType('reject');
                  setReviewDialogOpen(true);
                }}
                color="error"
                sx={{ borderRadius: 2 }}
              >
                Reject
              </Button>
            )}

            <IconButton onClick={(e) => setMenuAnchor({ element: e.currentTarget as HTMLElement, submission })}>
              <MoreVert />
            </IconButton>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  // Calculate analytics
  const analytics = useMemo(() => {
    const total = submissions.length;
    const pending = submissions.filter(s => s.status === 'pending').length;
    const inReview = submissions.filter(s => s.status === 'in_review').length;
    const approved = submissions.filter(s => s.status === 'approved').length;
    const rejected = submissions.filter(s => s.status === 'rejected').length;
    const published = submissions.filter(s => s.status === 'published').length;
    
    const avgTimeToApproval = submissions
      .filter(s => s.status === 'approved' && s.approvals.length > 0)
      .reduce((sum, s) => {
        const firstSubmission = s.submittedAt;
        const lastApproval = s.approvals[s.approvals.length - 1].timestamp;
        return sum + (lastApproval.getTime() - firstSubmission.getTime());
      }, 0) / (approved || 1);

    return {
      total,
      pending,
      inReview,
      approved,
      rejected,
      published,
      avgTimeToApproval: avgTimeToApproval / (1000 * 60 * 60), // Convert to hours
      myAssignments: mySubmissions.length,
    };
  }, [submissions, mySubmissions]);

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)` }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Approval color="primary" />
              Approval Workflow
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage content approvals and collaborate on publishing decisions
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2} alignItems="center">
            <Badge badgeContent={mySubmissions.length} color="primary">
              <Person />
            </Badge>
            <Typography variant="body2" color="text.secondary">
              {mySubmissions.length} awaiting your review
            </Typography>
          </Stack>
        </Stack>

        {/* Analytics Summary */}
        <Grid container spacing={3}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <Typography variant="h4" fontWeight={600} color="primary.main">
                {analytics.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Submissions
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
              <Typography variant="h4" fontWeight={600} color="warning.main">
                {analytics.pending + analytics.inReview}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Review
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
              <Typography variant="h4" fontWeight={600} color="success.main">
                {analytics.approved + analytics.published}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Approved
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
              <Typography variant="h4" fontWeight={600} color="info.main">
                {analytics.avgTimeToApproval.toFixed(1)}h
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Approval Time
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* View Mode Toggle & Filters */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Stack direction="row" spacing={1}>
            <Button
              variant={viewMode === 'queue' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('queue')}
              sx={{ borderRadius: 2 }}
            >
              Review Queue ({filteredSubmissions.length})
            </Button>
            <Button
              variant={viewMode === 'analytics' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('analytics')}
              sx={{ borderRadius: 2 }}
            >
              Analytics
            </Button>
            <Button
              variant={viewMode === 'workflows' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('workflows')}
              sx={{ borderRadius: 2 }}
            >
              Workflows
            </Button>
          </Stack>

          {viewMode === 'queue' && (
            <Stack direction="row" spacing={2} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in_review">In Review</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  label="Priority"
                >
                  <MenuItem value="all">All Priorities</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          )}
        </Stack>
      </Paper>

      {/* Content */}
      {viewMode === 'queue' && (
        <Box>
          {/* My Assignments Section */}
          {mySubmissions.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                🎯 My Assignments ({mySubmissions.length})
              </Typography>
              {mySubmissions.map(renderSubmissionCard)}
            </Box>
          )}

          {/* All Submissions */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              All Submissions
            </Typography>
            {filteredSubmissions.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                <Assignment sx={{ fontSize: 64, color: theme.palette.text.secondary, mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No submissions found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Content submissions will appear here when they're ready for review
                </Typography>
              </Paper>
            ) : (
              filteredSubmissions.map(renderSubmissionCard)
            )}
          </Box>
        </Box>
      )}

      {viewMode === 'analytics' && (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Analytics sx={{ fontSize: 64, color: theme.palette.text.secondary, mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Detailed analytics coming soon
          </Typography>
        </Paper>
      )}

      {viewMode === 'workflows' && (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Timeline sx={{ fontSize: 64, color: theme.palette.text.secondary, mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Workflow management coming soon
          </Typography>
        </Paper>
      )}

      {/* Review Dialog */}
      <Dialog
        open={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {selectedSubmission && (
          <>
            <DialogTitle>
              <Stack direction="row" alignItems="center" spacing={2}>
                {actionType === 'approve' ? (
                  <CheckCircle color="success" />
                ) : (
                  <Cancel color="error" />
                )}
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {actionType === 'approve' ? 'Approve' : 'Reject'} Content
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedSubmission.title}
                  </Typography>
                </Box>
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Content Preview
                </Typography>
                <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedSubmission.content}
                  </Typography>
                </Paper>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={4}
                label={actionType === 'approve' ? 'Approval Comments (Optional)' : 'Rejection Reason (Required)'}
                value={actionComment}
                onChange={(e) => setActionComment(e.target.value)}
                placeholder={
                  actionType === 'approve' 
                    ? 'Add any feedback or notes for the submitter...'
                    : 'Please explain why this content needs to be revised...'
                }
                required={actionType === 'reject'}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setReviewDialogOpen(false)} sx={{ borderRadius: 2 }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={() => handleApprovalAction(actionType)}
                disabled={actionType === 'reject' && !actionComment.trim()}
                color={actionType === 'approve' ? 'success' : 'error'}
                sx={{ borderRadius: 2 }}
              >
                {actionType === 'approve' ? 'Approve Content' : 'Reject Content'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Comment Dialog */}
      <Dialog
        open={commentDialogOpen}
        onClose={() => setCommentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Comment color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Add Comment
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Comment"
            value={actionComment}
            onChange={(e) => setActionComment(e.target.value)}
            placeholder="Share your feedback or questions about this content..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialogOpen(false)} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddComment}
            disabled={!actionComment.trim()}
            sx={{ borderRadius: 2 }}
          >
            Add Comment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor?.element}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 200 } }}
      >
        <MenuItem onClick={() => menuAnchor && onEdit?.(menuAnchor.submission)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Content</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <ContentCopy fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <History fontSize="small" />
          </ListItemIcon>
          <ListItemText>View History</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <ListItemText>Reassign</ListItemText>
        </MenuItem>
      </Menu>

      {/* AI Insights */}
      <Paper sx={{ p: 3, mt: 3, borderRadius: 3, bgcolor: alpha(theme.palette.info.main, 0.05), border: `1px solid ${alpha(theme.palette.info.main, 0.2)}` }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Psychology color="info" />
          <Typography variant="h6" fontWeight={600}>
            Workflow Intelligence
          </Typography>
        </Stack>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Stack alignItems="center" sx={{ p: 2, textAlign: 'center' }}>
              <AutoAwesome sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 1 }} />
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                Smart Routing
              </Typography>
              <Typography variant="body2" color="text.secondary">
                AI automatically routes high-risk content to additional reviewers and expedites time-sensitive approvals.
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack alignItems="center" sx={{ p: 2, textAlign: 'center' }}>
              <Speed sx={{ fontSize: 48, color: theme.palette.success.main, mb: 1 }} />
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                Bottleneck Detection
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Identify approval bottlenecks and automatically reassign to available reviewers to maintain velocity.
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack alignItems="center" sx={{ p: 2, textAlign: 'center' }}>
              <Analytics sx={{ fontSize: 48, color: theme.palette.warning.main, mb: 1 }} />
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                Predictive Insights
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Predict approval likelihood and suggest content improvements before submission to reduce rejection rates.
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};