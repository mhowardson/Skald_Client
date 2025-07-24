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
  Avatar
} from '@mui/material';
import {
  Business as BusinessIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { useTenant } from '../../contexts/TenantContext';

interface OrganizationSwitcherProps {
  variant?: 'select' | 'button';
  onCreateOrganization?: () => void;
}

export const OrganizationSwitcher: React.FC<OrganizationSwitcherProps> = ({
  variant = 'button',
  onCreateOrganization
}) => {
  const { currentOrganization, organizations, switchOrganization } = useTenant();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOrganizationSelect = (orgId: string) => {
    const organization = organizations.find(org => org.id === orgId);
    if (organization) {
      switchOrganization(organization);
    }
    handleClose();
  };

  const handleCreateOrganization = () => {
    onCreateOrganization?.();
    handleClose();
  };

  if (variant === 'select') {
    return (
      <FormControl fullWidth size="small">
        <InputLabel>Organization</InputLabel>
        <Select
          value={currentOrganization?.id || ''}
          label="Organization"
          data-testid="organization-switcher"
          onChange={(e) => handleOrganizationSelect(e.target.value)}
        >
          {organizations.map((org) => (
            <MenuItem key={org.id} value={org.id} data-testid={`org-option-${org.id}`}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                  <BusinessIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="body2">{org.name}</Typography>
                  <Chip
                    label={org.subscription.plan}
                    size="small"
                    variant="outlined"
                    sx={{ height: 16, fontSize: '0.6rem' }}
                  />
                </Box>
              </Box>
            </MenuItem>
          ))}
          {onCreateOrganization && (
            <MenuItem onClick={handleCreateOrganization} data-testid="create-organization">
              <ListItemIcon>
                <AddIcon />
              </ListItemIcon>
              <ListItemText primary="Create Organization" />
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
        data-testid="organization-switcher"
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
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
          <BusinessIcon />
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight="medium" noWrap>
            {currentOrganization?.name || 'Select Organization'}
          </Typography>
          {currentOrganization && (
            <Typography variant="caption" color="text.secondary">
              {currentOrganization.subscription.plan} plan
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
          sx: { minWidth: 280, mt: 1 }
        }}
      >
        {organizations.map((org) => (
          <MenuItem
            key={org.id}
            onClick={() => handleOrganizationSelect(org.id)}
            selected={org.id === currentOrganization?.id}
            data-testid={`org-option-${org.id}`}
          >
            <ListItemIcon>
              <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                <BusinessIcon fontSize="small" />
              </Avatar>
            </ListItemIcon>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2">{org.name}</Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                <Chip
                  label={org.subscription.plan}
                  size="small"
                  variant="outlined"
                  sx={{ height: 16, fontSize: '0.6rem' }}
                />
                <Chip
                  label={org.type}
                  size="small"
                  variant="outlined"
                  sx={{ height: 16, fontSize: '0.6rem' }}
                />
              </Box>
            </Box>
          </MenuItem>
        ))}
        
        <Divider />
        
        {onCreateOrganization && (
          <MenuItem onClick={handleCreateOrganization} data-testid="create-organization">
            <ListItemIcon>
              <AddIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Create Organization"
              secondary="Start a new organization"
            />
          </MenuItem>
        )}
        
        <MenuItem onClick={handleClose} data-testid="organization-settings">
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Organization Settings"
            secondary="Manage your organization"
          />
        </MenuItem>
      </Menu>
    </Box>
  );
};