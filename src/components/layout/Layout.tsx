import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ContentCopy as ContentIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountIcon,
  ExitToApp as LogoutIcon,
  Notifications as NotificationsIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Hub as IntegrationsIcon,
  Payment as BillingIcon,
  Insights as CompetitiveIcon,
  VideoLibrary as SocialIcon,
  Assessment as AdvancedAnalyticsIcon,
  Description as ReportsIcon,
  AutoFixHigh as OptimizationIcon
} from '@mui/icons-material';
import { OrganizationSwitcher } from '../organization/OrganizationSwitcher';
import { WorkspaceSwitcher } from '../workspace/WorkspaceSwitcher';
import { AnnouncementCenterTrigger } from '../../features/onboarding/components/FeatureAnnouncement/AnnouncementCenter';
import { HelpCenterWidget } from '../../features/onboarding/components/HelpCenter/HelpCenterWidget';
import { useContextualHelp } from '../../features/onboarding/hooks/useContextualHelp';
import { useAuth } from '../../hooks/useAuth';
import { useTenant } from '../../contexts/TenantContext';

const drawerWidth = 280;

interface LayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { id: 'content', label: 'Content', icon: <ContentIcon />, path: '/content' },
  { id: 'social-content', label: 'Social Media', icon: <SocialIcon />, path: '/content/social' },
  { id: 'competitive-intelligence', label: 'Competitive Intelligence', icon: <CompetitiveIcon />, path: '/competitive-intelligence' },
  { id: 'analytics', label: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
  { id: 'advanced-analytics', label: 'Advanced Analytics', icon: <AdvancedAnalyticsIcon />, path: '/analytics/advanced' },
  { id: 'reports', label: 'Reports', icon: <ReportsIcon />, path: '/reports' },
  { id: 'optimization', label: 'AI Optimization', icon: <OptimizationIcon />, path: '/optimization' },
  { id: 'team', label: 'Team', icon: <PeopleIcon />, path: '/team' },
  { id: 'integrations', label: 'Integrations', icon: <IntegrationsIcon />, path: '/integrations' },
  { id: 'billing', label: 'Billing', icon: <BillingIcon />, path: '/billing' },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();
  const { currentOrganization, currentWorkspace } = useTenant();
  const { contextualArticles } = useContextualHelp();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleAccountMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAccountMenuAnchor(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAccountMenuAnchor(null);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    handleAccountMenuClose();
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
          ContentAutoPilot
        </Typography>
      </Toolbar>
      <Divider />
      
      {/* Organization & Workspace Switchers */}
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Organization
        </Typography>
        <OrganizationSwitcher variant="select" />
        
        <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
          Workspace
        </Typography>
        <WorkspaceSwitcher variant="select" />
      </Box>
      
      <Divider />
      
      {/* Navigation */}
      <List>
        {navigationItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                selected={isActive}
                onClick={() => handleNavigation(item.path)}
                data-testid={`nav-${item.id}`}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.main',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'inherit' : 'action.active' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      
      <Divider />
      
      {/* Current Context Info */}
      {currentWorkspace && (
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Current Workspace
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar 
              sx={{ 
                width: 24, 
                height: 24, 
                bgcolor: currentWorkspace.branding?.brandColors?.primary || '#6366f1',
                fontSize: '0.75rem'
              }}
            >
              {currentWorkspace.name?.charAt(0) || 'W'}
            </Avatar>
            <Box>
              <Typography variant="body2" noWrap>
                {currentWorkspace.name || 'Workspace'}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {currentWorkspace.client?.companyName || 'Company'}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Current Organization Display */}
          {currentOrganization && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
              <Typography variant="body2" color="inherit">
                {currentOrganization.name}
              </Typography>
            </Box>
          )}
          
          {/* Feature Announcements */}
          <Box sx={{ mr: 1 }}>
            <AnnouncementCenterTrigger variant="icon" showBadge={true} />
          </Box>
          
          {/* Account Menu */}
          <IconButton
            color="inherit"
            onClick={handleAccountMenuOpen}
            data-testid="user-menu"
          >
            <AccountIcon />
          </IconButton>
          
          <Menu
            anchorEl={accountMenuAnchor}
            open={Boolean(accountMenuAnchor)}
            onClose={handleAccountMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem disabled>
              <Box data-testid="user-profile">
                <Typography variant="body2" fontWeight="medium">
                  {user?.profile.firstName} {user?.profile.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { handleNavigation('/settings/organization'); handleAccountMenuClose(); }}>
              <ListItemIcon>
                <BusinessIcon fontSize="small" />
              </ListItemIcon>
              Organization Settings
            </MenuItem>
            <MenuItem onClick={() => { handleNavigation('/settings'); handleAccountMenuClose(); }}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              User Settings
            </MenuItem>
            <MenuItem onClick={handleLogout} data-testid="logout-button">
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Sign Out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        {children}
      </Box>

      {/* Help Center Widget */}
      <HelpCenterWidget 
        contextualHelp={contextualArticles}
        position="bottom-right"
      />
    </Box>
  );
};