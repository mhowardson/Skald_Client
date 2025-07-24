import React, { useState } from 'react';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Avatar,
  Button
} from '@mui/material';
import {
  WorkOutline as WorkspaceIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useTenant } from '../../contexts/TenantContext';

interface WorkspaceSwitcherProps {
  variant?: 'select' | 'button';
  onCreateWorkspace?: () => void;
}

export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({
  variant = 'button',
  onCreateWorkspace
}) => {
  const { currentWorkspace, workspaces, switchWorkspace } = useTenant();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleWorkspaceSelect = (workspaceId: string) => {
    const workspace = workspaces.find(ws => ws.id === workspaceId);
    switchWorkspace(workspace || null);
    handleClose();
  };

  const handleCreateWorkspace = () => {
    onCreateWorkspace?.();
    handleClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  if (workspaces.length === 0) {
    return (
      <Button
        onClick={onCreateWorkspace}
        startIcon={<AddIcon />}
        variant="outlined"
        size="small"
        data-testid="create-workspace"
      >
        Create Workspace
      </Button>
    );
  }

  if (variant === 'select') {
    return (
      <FormControl fullWidth size="small">
        <InputLabel>Workspace</InputLabel>
        <Select
          value={currentWorkspace?.id || ''}
          label="Workspace"
          data-testid="workspace-switcher"
          onChange={(e) => handleWorkspaceSelect(e.target.value)}
        >
          {workspaces.map((workspace) => (
            <MenuItem 
              key={workspace.id} 
              value={workspace.id} 
              data-testid={`workspace-option-${workspace.name}`}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 24, height: 24, bgcolor: workspace.branding.brandColors.primary }}>
                  <BusinessIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="body2">{workspace.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {workspace.client.companyName}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          ))}
          {onCreateWorkspace && (
            <MenuItem onClick={handleCreateWorkspace} data-testid="create-workspace">
              <ListItemIcon>
                <AddIcon />
              </ListItemIcon>
              <ListItemText primary="Create Workspace" />
            </MenuItem>
          )}
        </Select>
      </FormControl>
    );
  }

  return (
    <Box>
      <Box
        onClick={handleClick}
        data-testid="workspace-switcher"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 1,
          borderRadius: 1,
          cursor: 'pointer',
          '&:hover': {
            bgcolor: 'action.hover'
          }
        }}
      >
        <Avatar 
          sx={{ 
            width: 32, 
            height: 32, 
            bgcolor: currentWorkspace?.branding.brandColors.primary || 'primary.main' 
          }}
        >
          <WorkspaceIcon />
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight="medium" noWrap>
            {currentWorkspace?.name || 'Select Workspace'}
          </Typography>
          {currentWorkspace && (
            <Typography variant="caption" color="text.secondary">
              {currentWorkspace.client.companyName}
            </Typography>
          )}
        </Box>
        <ExpandMoreIcon fontSize="small" />
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        PaperProps={{
          sx: { minWidth: 320, mt: 1 }
        }}
      >
        {workspaces.map((workspace) => (
          <MenuItem
            key={workspace.id}
            onClick={() => handleWorkspaceSelect(workspace.id)}
            selected={workspace.id === currentWorkspace?.id}
            data-testid={`workspace-option-${workspace.name}`}
          >
            <ListItemIcon>
              <Avatar 
                sx={{ 
                  width: 24, 
                  height: 24, 
                  bgcolor: workspace.branding.brandColors.primary 
                }}
              >
                <BusinessIcon fontSize="small" />
              </Avatar>
            </ListItemIcon>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight="medium">
                {workspace.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {workspace.client.companyName}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                <Chip
                  label={workspace.status}
                  size="small"
                  color={getStatusColor(workspace.status) as any}
                  variant="outlined"
                  sx={{ height: 16, fontSize: '0.6rem' }}
                />
                <Chip
                  label={`${workspace.totalContent} posts`}
                  size="small"
                  variant="outlined"
                  sx={{ height: 16, fontSize: '0.6rem' }}
                />
              </Box>
            </Box>
          </MenuItem>
        ))}
        
        <Divider />
        
        {onCreateWorkspace && (
          <MenuItem onClick={handleCreateWorkspace} data-testid="create-workspace">
            <ListItemIcon>
              <AddIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Create Workspace"
              secondary="Add a new client workspace"
            />
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};