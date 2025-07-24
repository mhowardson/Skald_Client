import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Paper,
  Tabs,
  Tab,
  Button,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Block as BlockIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  AttachMoney as MoneyIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';

import {
  useGetSystemMetricsQuery,
  useGetUsersQuery,
  useGetOrganizationsQuery,
  useGetAuditLogsQuery,
  useGetSecurityAlertsQuery,
  useCreateUserMutation,
  useSuspendUserMutation,
  useSuspendOrganizationMutation,
  useGenerateSystemReportMutation,
  type AdminUser,
  type AdminOrganization,
  type SecurityAlert
} from '../../store/api/adminApi';

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

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [userPage, setUserPage] = useState(0);
  const [userRowsPerPage, setUserRowsPerPage] = useState(10);
  const [orgPage, setOrgPage] = useState(0);
  const [orgRowsPerPage, setOrgRowsPerPage] = useState(10);
  const [userDialog, setUserDialog] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{ element: HTMLElement; user?: AdminUser; org?: AdminOrganization } | null>(null);

  // API calls
  const { data: metricsData, isLoading: metricsLoading } = useGetSystemMetricsQuery({ period: 'month' });
  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery({
    search: searchQuery,
    page: userPage + 1,
    limit: userRowsPerPage
  });
  const { data: orgsData, isLoading: orgsLoading } = useGetOrganizationsQuery({
    search: searchQuery,
    page: orgPage + 1,
    limit: orgRowsPerPage
  });
  const { data: auditData } = useGetAuditLogsQuery({ limit: 10 });
  const { data: alertsData } = useGetSecurityAlertsQuery({ status: 'open' });

  const [createUser] = useCreateUserMutation();
  const [suspendUser] = useSuspendUserMutation();
  const [suspendOrg] = useSuspendOrganizationMutation();
  const [generateReport] = useGenerateSystemReportMutation();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCreateUser = async (userData: {
    email: string;
    firstName: string;
    lastName: string;
    role: AdminUser['role'];
  }) => {
    try {
      await createUser({
        ...userData,
        sendInvitation: true
      }).unwrap();
      setUserDialog(false);
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleSuspendUser = async (userId: string, reason: string) => {
    try {
      await suspendUser({ id: userId, reason }).unwrap();
      setMenuAnchor(null);
    } catch (error) {
      console.error('Failed to suspend user:', error);
    }
  };

  const handleSuspendOrg = async (orgId: string, reason: string) => {
    try {
      await suspendOrg({ id: orgId, reason }).unwrap();
      setMenuAnchor(null);
    } catch (error) {
      console.error('Failed to suspend organization:', error);
    }
  };

  const handleGenerateReport = async (type: 'users' | 'organizations' | 'revenue' | 'security' | 'system_health') => {
    try {
      const result = await generateReport({
        type,
        format: 'pdf',
        includeDetails: true
      }).unwrap();
      window.open(result.downloadUrl, '_blank');
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'suspended': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: SecurityAlert['severity']) => {
    switch (severity) {
      case 'critical': return <ErrorIcon color="error" />;
      case 'high': return <WarningIcon color="error" />;
      case 'medium': return <WarningIcon color="warning" />;
      case 'low': return <WarningIcon color="info" />;
      default: return <WarningIcon />;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          System overview and management tools
        </Typography>
      </Box>

      {/* System Metrics Overview */}
      {metricsLoading ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      ) : metricsData && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Users */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Total Users
                    </Typography>
                    <Typography variant="h4">
                      {formatNumber(metricsData.users.total)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      {metricsData.users.growth >= 0 ? (
                        <TrendingUpIcon color="success" fontSize="small" />
                      ) : (
                        <TrendingDownIcon color="error" fontSize="small" />
                      )}
                      <Typography variant="body2" color={metricsData.users.growth >= 0 ? 'success.main' : 'error.main'}>
                        {metricsData.users.growth > 0 ? '+' : ''}{metricsData.users.growth}%
                      </Typography>
                    </Box>
                  </Box>
                  <Avatar sx={{ bgcolor: 'primary.light' }}>
                    <PeopleIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Organizations */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Organizations
                    </Typography>
                    <Typography variant="h4">
                      {formatNumber(metricsData.organizations.total)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      {metricsData.organizations.growth >= 0 ? (
                        <TrendingUpIcon color="success" fontSize="small" />
                      ) : (
                        <TrendingDownIcon color="error" fontSize="small" />
                      )}
                      <Typography variant="body2" color={metricsData.organizations.growth >= 0 ? 'success.main' : 'error.main'}>
                        {metricsData.organizations.growth > 0 ? '+' : ''}{metricsData.organizations.growth}%
                      </Typography>
                    </Box>
                  </Box>
                  <Avatar sx={{ bgcolor: 'secondary.light' }}>
                    <BusinessIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Revenue */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Monthly Revenue
                    </Typography>
                    <Typography variant="h4">
                      {formatCurrency(metricsData.revenue.monthlyRevenue)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ARPU: {formatCurrency(metricsData.revenue.averageRevenuePerUser)}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'success.light' }}>
                    <MoneyIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* System Health */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      System Health
                    </Typography>
                    <Typography variant="h4" color={metricsData.system.errorRate < 1 ? 'success.main' : 'error.main'}>
                      {metricsData.system.uptime.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Error Rate: {metricsData.system.errorRate.toFixed(2)}%
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: metricsData.system.errorRate < 1 ? 'success.light' : 'error.light' }}>
                    <SpeedIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Security Alerts */}
      {alertsData && alertsData.summary.critical > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography>
              {alertsData.summary.critical} critical security alerts require immediate attention
            </Typography>
            <Button color="inherit" size="small" onClick={() => setActiveTab(3)}>
              View Alerts
            </Button>
          </Box>
        </Alert>
      )}

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab 
              label="Overview" 
              icon={<DashboardIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Users" 
              icon={<PeopleIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Organizations" 
              icon={<BusinessIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Security" 
              icon={<SecurityIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Settings" 
              icon={<SettingsIcon />} 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            {/* Recent Activity */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Activity
                  </Typography>
                  <List>
                    {auditData?.logs.slice(0, 5).map((log) => (
                      <ListItem key={log.id} divider>
                        <ListItemIcon>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {log.userEmail[0].toUpperCase()}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={log.action}
                          secondary={`${log.userEmail} • ${new Date(log.timestamp).toLocaleString()}`}
                        />
                        <Chip 
                          label={log.outcome} 
                          size="small" 
                          color={log.outcome === 'success' ? 'success' : 'error'}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* System Status */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    System Status
                  </Typography>
                  {metricsData && (
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="API Response Time"
                          secondary={`${metricsData.system.responseTime}ms average`}
                        />
                        <LinearProgress
                          variant="determinate"
                          value={Math.min((200 - metricsData.system.responseTime) / 2, 100)}
                          sx={{ width: 100 }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Storage Usage"
                          secondary={`${(metricsData.system.storageUsed / 1024 / 1024 / 1024).toFixed(2)} GB`}
                        />
                        <Chip label="Normal" color="success" size="small" />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Support Tickets"
                          secondary={`${metricsData.support.openTickets} open`}
                        />
                        <Chip 
                          label={metricsData.support.openTickets > 50 ? 'High' : 'Normal'} 
                          color={metricsData.support.openTickets > 50 ? 'warning' : 'success'} 
                          size="small" 
                        />
                      </ListItem>
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Actions */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleGenerateReport('system_health')}
                    >
                      System Report
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleGenerateReport('revenue')}
                    >
                      Revenue Report
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleGenerateReport('users')}
                    >
                      User Report
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      color="warning"
                    >
                      Clear Cache
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Users Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <TextField
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{ width: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setUserDialog(true)}
            >
              Add User
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Organizations</TableCell>
                  <TableCell>Last Active</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usersLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : (
                  usersData?.users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {user.firstName[0]}{user.lastName[0]}
                          </Avatar>
                          <Typography variant="body2">
                            {user.firstName} {user.lastName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip label={user.role} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.status} 
                          size="small" 
                          color={getStatusColor(user.status) as any}
                        />
                      </TableCell>
                      <TableCell>{user.organizations.length}</TableCell>
                      <TableCell>
                        {user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleDateString() : 'Never'}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => setMenuAnchor({ element: e.currentTarget, user })}
                        >
                          <MoreIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={usersData?.total || 0}
            page={userPage}
            onPageChange={(_, page) => setUserPage(page)}
            rowsPerPage={userRowsPerPage}
            onRowsPerPageChange={(e) => setUserRowsPerPage(parseInt(e.target.value))}
          />
        </TabPanel>

        {/* Organizations Tab */}
        <TabPanel value={activeTab} index={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Organization</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Members</TableCell>
                  <TableCell>Revenue</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orgsLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : (
                  orgsData?.organizations.map((org) => (
                    <TableRow key={org.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {org.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {org.owner.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={org.type} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={org.plan.name} 
                          size="small" 
                          color={org.plan.tier === 'enterprise' ? 'primary' : 'default'}
                        />
                      </TableCell>
                      <TableCell>{org.members.total}</TableCell>
                      <TableCell>{formatCurrency(org.billing.monthlyRevenue)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={org.status} 
                          size="small" 
                          color={getStatusColor(org.status) as any}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => setMenuAnchor({ element: e.currentTarget, org })}
                        >
                          <MoreIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={orgsData?.total || 0}
            page={orgPage}
            onPageChange={(_, page) => setOrgPage(page)}
            rowsPerPage={orgRowsPerPage}
            onRowsPerPageChange={(e) => setOrgRowsPerPage(parseInt(e.target.value))}
          />
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={activeTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Security Alerts
                  </Typography>
                  {alertsData?.alerts.length ? (
                    <List>
                      {alertsData.alerts.map((alert) => (
                        <ListItem key={alert.id} divider>
                          <ListItemIcon>
                            {getSeverityIcon(alert.severity)}
                          </ListItemIcon>
                          <ListItemText
                            primary={alert.title}
                            secondary={alert.description}
                          />
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Chip 
                              label={alert.severity} 
                              size="small" 
                              color={alert.severity === 'critical' ? 'error' : 'warning'}
                            />
                            <Chip 
                              label={alert.status} 
                              size="small" 
                            />
                            <IconButton size="small">
                              <MoreIcon />
                            </IconButton>
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="success">
                      No active security alerts
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Settings Tab */}
        <TabPanel value={activeTab} index={4}>
          <Typography variant="h6" gutterBottom>
            System Settings
          </Typography>
          <Alert severity="info">
            System settings configuration coming soon...
          </Alert>
        </TabPanel>
      </Paper>

      {/* User Menu */}
      <Menu
        anchorEl={menuAnchor?.element}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        {menuAnchor?.user && (
          <>
            <MenuItem onClick={() => setMenuAnchor(null)}>
              <EditIcon sx={{ mr: 1 }} />
              Edit User
            </MenuItem>
            <MenuItem onClick={() => {
              handleSuspendUser(menuAnchor.user!.id, 'Admin action');
            }}>
              <BlockIcon sx={{ mr: 1 }} />
              Suspend User
            </MenuItem>
            <MenuItem onClick={() => setMenuAnchor(null)} sx={{ color: 'error.main' }}>
              <DeleteIcon sx={{ mr: 1 }} />
              Delete User
            </MenuItem>
          </>
        )}
        {menuAnchor?.org && (
          <>
            <MenuItem onClick={() => setMenuAnchor(null)}>
              <EditIcon sx={{ mr: 1 }} />
              Edit Organization
            </MenuItem>
            <MenuItem onClick={() => {
              handleSuspendOrg(menuAnchor.org!.id, 'Admin action');
            }}>
              <BlockIcon sx={{ mr: 1 }} />
              Suspend Organization
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Create User Dialog */}
      <CreateUserDialog
        open={userDialog}
        onClose={() => setUserDialog(false)}
        onCreate={handleCreateUser}
      />
    </Container>
  );
};

// Create User Dialog Component
interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: any) => void;
}

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({
  open,
  onClose,
  onCreate
}) => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'user' as AdminUser['role']
  });

  const handleSubmit = () => {
    if (formData.email && formData.firstName && formData.lastName) {
      onCreate(formData);
      setFormData({ email: '', firstName: '', lastName: '', role: 'user' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New User</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          sx={{ mb: 2, mt: 1 }}
        />
        
        <TextField
          fullWidth
          label="First Name"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          sx={{ mb: 2 }}
        />
        
        <TextField
          fullWidth
          label="Last Name"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          sx={{ mb: 2 }}
        />
        
        <FormControl fullWidth>
          <InputLabel>Role</InputLabel>
          <Select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as AdminUser['role'] })}
            label="Role"
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="support">Support</MenuItem>
            <MenuItem value="super_admin">Super Admin</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!formData.email || !formData.firstName || !formData.lastName}
        >
          Create User
        </Button>
      </DialogActions>
    </Dialog>
  );
};