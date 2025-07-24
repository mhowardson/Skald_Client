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
  Avatar,
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
  FormControl,
  InputLabel,
  Select,
  Grid,
  Card,
  CardContent,
  Alert,
  Skeleton
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExitToApp as LeaveIcon,
  PersonAdd as PersonAddIcon,
  Badge as BadgeIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';

import {
  useGetOrganizationMembersQuery,
  useUpdateMemberMutation,
  useRemoveMemberMutation,
  useLeaveOrganizationMutation,
  type OrganizationMember
} from '../../store/api/organizationApi';
import { useAuth } from '../../hooks/useAuth';

interface TeamMembersViewProps {
  organizationId: string;
  onInviteUser: () => void;
}

const roleColors = {
  owner: 'primary',
  admin: 'secondary',
  manager: 'info',
  member: 'default',
} as const;

const roleDescriptions = {
  owner: 'Full access to organization settings and billing',
  admin: 'Manage team members and organization settings',
  manager: 'Manage content and team workflows',
  member: 'Create and manage assigned content'
};

export const TeamMembersView: React.FC<TeamMembersViewProps> = ({
  organizationId,
  onInviteUser
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedMember, setSelectedMember] = useState<OrganizationMember | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editRole, setEditRole] = useState<string>('');

  const { user } = useAuth();
  const { data: membersData, isLoading } = useGetOrganizationMembersQuery(organizationId);
  const [updateMember, { isLoading: isUpdating }] = useUpdateMemberMutation();
  const [removeMember, { isLoading: isRemoving }] = useRemoveMemberMutation();
  const [leaveOrganization, { isLoading: isLeaving }] = useLeaveOrganizationMutation();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, member: OrganizationMember) => {
    setMenuAnchor(event.currentTarget);
    setSelectedMember(member);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedMember(null);
  };

  const handleEditMember = () => {
    if (selectedMember) {
      setEditRole(selectedMember.role);
      setEditDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteMember = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleUpdateRole = async () => {
    if (!selectedMember) return;

    try {
      await updateMember({
        organizationId,
        memberId: selectedMember.id,
        role: editRole as any
      }).unwrap();
      setEditDialogOpen(false);
      setSelectedMember(null);
    } catch (error) {
      console.error('Failed to update member role:', error);
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;

    try {
      await removeMember({
        organizationId,
        memberId: selectedMember.id
      }).unwrap();
      setDeleteDialogOpen(false);
      setSelectedMember(null);
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const handleLeave = async () => {
    try {
      await leaveOrganization(organizationId).unwrap();
      setDeleteDialogOpen(false);
      setSelectedMember(null);
    } catch (error) {
      console.error('Failed to leave organization:', error);
    }
  };

  const isCurrentUser = (member: OrganizationMember) => member.id === user?.id;
  const canEditMember = (member: OrganizationMember) => {
    return !isCurrentUser(member) && member.role !== 'owner';
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

  if (!membersData?.members.length) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          No team members yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Start building your team by inviting members to your organization
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={onInviteUser}
        >
          Invite Your First Member
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {membersData.members.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Members
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {membersData.members.filter(m => m.role === 'admin').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Administrators
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold" color="info.main">
                {membersData.members.filter(m => m.role === 'manager').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Managers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold">
                {membersData.members.filter(m => m.role === 'member').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Members
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Members Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Member</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell>Last Active</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {membersData.members.map((member) => (
              <TableRow key={member.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      src={member.profile.avatar}
                      sx={{ width: 48, height: 48 }}
                    >
                      {member.profile.firstName[0]}{member.profile.lastName[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="medium">
                        {member.profile.firstName} {member.profile.lastName}
                        {isCurrentUser(member) && (
                          <Chip 
                            label="You" 
                            size="small" 
                            color="primary" 
                            sx={{ ml: 1 }} 
                          />
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {member.email}
                      </Typography>
                      {member.profile.title && (
                        <Typography variant="caption" color="text.secondary">
                          {member.profile.title}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={member.role}
                    color={roleColors[member.role]}
                    size="small"
                    icon={<BadgeIcon />}
                    sx={{ textTransform: 'capitalize' }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {format(new Date(member.joinedAt), 'MMM d, yyyy')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimeIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {formatDistanceToNow(new Date(member.lastActiveAt), { addSuffix: true })}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={(e) => handleMenuOpen(e, member)}
                    disabled={member.role === 'owner' && !isCurrentUser(member)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        {selectedMember && canEditMember(selectedMember) && (
          <MenuItem onClick={handleEditMember}>
            <ListItemIcon>
              <EditIcon />
            </ListItemIcon>
            <ListItemText primary="Edit Role" />
          </MenuItem>
        )}
        
        {selectedMember && isCurrentUser(selectedMember) && (
          <MenuItem onClick={handleDeleteMember} sx={{ color: 'warning.main' }}>
            <ListItemIcon>
              <LeaveIcon sx={{ color: 'warning.main' }} />
            </ListItemIcon>
            <ListItemText primary="Leave Organization" />
          </MenuItem>
        )}
        
        {selectedMember && !isCurrentUser(selectedMember) && selectedMember.role !== 'owner' && (
          <MenuItem onClick={handleDeleteMember} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <DeleteIcon sx={{ color: 'error.main' }} />
            </ListItemIcon>
            <ListItemText primary="Remove Member" />
          </MenuItem>
        )}
      </Menu>

      {/* Edit Role Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit Member Role
        </DialogTitle>
        <DialogContent>
          {selectedMember && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body1" gutterBottom>
                Update role for {selectedMember.profile.firstName} {selectedMember.profile.lastName}
              </Typography>
              
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={editRole}
                  label="Role"
                  onChange={(e) => setEditRole(e.target.value)}
                >
                  <MenuItem value="admin">Administrator</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="member">Member</MenuItem>
                </Select>
              </FormControl>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  {roleDescriptions[editRole as keyof typeof roleDescriptions]}
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateRole}
            disabled={isUpdating}
          >
            {isUpdating ? 'Updating...' : 'Update Role'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete/Leave Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedMember && isCurrentUser(selectedMember) ? 'Leave Organization' : 'Remove Member'}
        </DialogTitle>
        <DialogContent>
          {selectedMember && (
            <Box sx={{ pt: 1 }}>
              {isCurrentUser(selectedMember) ? (
                <Alert severity="warning">
                  <Typography variant="body1" gutterBottom>
                    Are you sure you want to leave this organization?
                  </Typography>
                  <Typography variant="body2">
                    You will lose access to all workspaces and content. This action cannot be undone.
                  </Typography>
                </Alert>
              ) : (
                <Alert severity="error">
                  <Typography variant="body1" gutterBottom>
                    Remove {selectedMember.profile.firstName} {selectedMember.profile.lastName} from the organization?
                  </Typography>
                  <Typography variant="body2">
                    They will lose access to all workspaces and content. This action cannot be undone.
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={selectedMember && isCurrentUser(selectedMember) ? 'warning' : 'error'}
            onClick={selectedMember && isCurrentUser(selectedMember) ? handleLeave : handleRemoveMember}
            disabled={isRemoving || isLeaving}
          >
            {isRemoving || isLeaving ? 'Processing...' : 
             selectedMember && isCurrentUser(selectedMember) ? 'Leave Organization' : 'Remove Member'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};