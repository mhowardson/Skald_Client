import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Card,
  CardContent,
  Grid,
  Skeleton
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  AccessTime as TimeIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { format, formatDistanceToNow, isAfter } from 'date-fns';

import {
  useGetOrganizationInvitesQuery,
  useCancelInviteMutation,
  useResendInviteMutation,
  type OrganizationInvite
} from '../../store/api/organizationApi';

interface TeamInvitesViewProps {
  organizationId: string;
  onInviteUser: () => void;
}

const statusColors = {
  pending: 'warning',
  accepted: 'success',
  rejected: 'error',
  expired: 'default',
} as const;

const roleColors = {
  admin: 'secondary',
  manager: 'info',
  member: 'default',
} as const;

export const TeamInvitesView: React.FC<TeamInvitesViewProps> = ({
  organizationId,
  onInviteUser
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedInvite, setSelectedInvite] = useState<OrganizationInvite | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const { data: invitesData, isLoading } = useGetOrganizationInvitesQuery(organizationId);
  const [cancelInvite, { isLoading: isCanceling }] = useCancelInviteMutation();
  const [resendInvite, { isLoading: isResending }] = useResendInviteMutation();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, invite: OrganizationInvite) => {
    setMenuAnchor(event.currentTarget);
    setSelectedInvite(invite);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedInvite(null);
  };

  const handleResendInvite = async () => {
    if (!selectedInvite) return;

    try {
      await resendInvite({
        organizationId,
        inviteId: selectedInvite.id
      }).unwrap();
      handleMenuClose();
    } catch (error) {
      console.error('Failed to resend invite:', error);
    }
  };

  const handleCancelInvite = async () => {
    if (!selectedInvite) return;

    try {
      await cancelInvite({
        organizationId,
        inviteId: selectedInvite.id
      }).unwrap();
      setCancelDialogOpen(false);
      setSelectedInvite(null);
    } catch (error) {
      console.error('Failed to cancel invite:', error);
    }
  };

  const isExpired = (invite: OrganizationInvite) => {
    return isAfter(new Date(), new Date(invite.expiresAt));
  };

  const getInviteStatus = (invite: OrganizationInvite) => {
    if (invite.status === 'pending' && isExpired(invite)) {
      return 'expired';
    }
    return invite.status;
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        {[...Array(3)].map((_, index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Skeleton variant="circular" width={48} height={48} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="text" width="60%" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  if (!invitesData?.invites.length) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          No pending invitations
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          All team members have been successfully added to your organization
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={onInviteUser}
        >
          Invite New Member
        </Button>
      </Box>
    );
  }

  const pendingInvites = invitesData.invites.filter(invite => 
    getInviteStatus(invite) === 'pending'
  );
  const expiredInvites = invitesData.invites.filter(invite => 
    getInviteStatus(invite) === 'expired'
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {pendingInvites.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Invites
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {expiredInvites.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Expired Invites
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {invitesData.invites.filter(i => i.status === 'accepted').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Accepted
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold">
                {invitesData.invites.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Invites
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Invites Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Invited</TableCell>
              <TableCell>Expires</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invitesData.invites.map((invite) => {
              const status = getInviteStatus(invite);
              
              return (
                <TableRow key={invite.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <EmailIcon color="action" />
                      <Box>
                        <Typography variant="subtitle2" fontWeight="medium">
                          {invite.email}
                        </Typography>
                        {invite.message && (
                          <Typography variant="caption" color="text.secondary">
                            "{invite.message}"
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={invite.role}
                      color={roleColors[invite.role]}
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={status}
                      color={statusColors[status as keyof typeof statusColors]}
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {format(new Date(invite.createdAt), 'MMM d, yyyy')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDistanceToNow(new Date(invite.createdAt), { addSuffix: true })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TimeIcon fontSize="small" color={isExpired(invite) ? 'error' : 'action'} />
                      <Typography 
                        variant="body2" 
                        color={isExpired(invite) ? 'error.main' : 'text.secondary'}
                      >
                        {format(new Date(invite.expiresAt), 'MMM d, yyyy')}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, invite)}
                      disabled={status === 'accepted' || status === 'rejected'}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        {selectedInvite && getInviteStatus(selectedInvite) === 'pending' && (
          <MenuItem onClick={handleResendInvite} disabled={isResending}>
            <ListItemIcon>
              <RefreshIcon />
            </ListItemIcon>
            <ListItemText primary={isResending ? 'Resending...' : 'Resend Invite'} />
          </MenuItem>
        )}
        
        {selectedInvite && (getInviteStatus(selectedInvite) === 'pending' || getInviteStatus(selectedInvite) === 'expired') && (
          <MenuItem onClick={() => setCancelDialogOpen(true)} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <DeleteIcon sx={{ color: 'error.main' }} />
            </ListItemIcon>
            <ListItemText primary="Cancel Invite" />
          </MenuItem>
        )}
      </Menu>

      {/* Cancel Invite Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Cancel Invitation
        </DialogTitle>
        <DialogContent>
          {selectedInvite && (
            <Alert severity="warning">
              <Typography variant="body1" gutterBottom>
                Cancel invitation for {selectedInvite.email}?
              </Typography>
              <Typography variant="body2">
                The invitation link will no longer be valid and they won't be able to join your organization.
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>
            Keep Invite
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancelInvite}
            disabled={isCanceling}
          >
            {isCanceling ? 'Canceling...' : 'Cancel Invite'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};