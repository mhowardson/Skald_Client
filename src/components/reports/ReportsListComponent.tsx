/**
 * Reports List Component
 * 
 * Displays a list of generated reports with filtering, sorting, and actions.
 * Provides download links, status information, and management capabilities.
 * 
 * @component ReportsListComponent
 * @version 1.0.0
 */

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
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Avatar,
  Typography,
  Button,
  Skeleton,
  TablePagination,
  Tooltip,
  Stack,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectMenuItem,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  CloudDownload as CloudDownloadIcon,
  Autorenew as AutorenewIcon,
  Error as ErrorIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import {
  GeneratedReport,
  useDeleteReportMutation,
  useDownloadReportQuery,
} from '../../store/api/reportGenerationApi';

interface ReportsListComponentProps {
  reports: GeneratedReport[];
  loading: boolean;
  onRefresh: () => void;
}

export const ReportsListComponent: React.FC<ReportsListComponentProps> = ({
  reports,
  loading,
  onRefresh,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedReport, setSelectedReport] = useState<GeneratedReport | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const [deleteReport] = useDeleteReportMutation();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, report: GeneratedReport) => {
    setMenuAnchor(event.currentTarget);
    setSelectedReport(report);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedReport(null);
  };

  const handleDelete = async () => {
    if (selectedReport) {
      try {
        await deleteReport(selectedReport.id).unwrap();
        onRefresh();
      } catch (error) {
        console.error('Failed to delete report:', error);
      }
    }
    handleMenuClose();
  };

  const handleDownload = (report: GeneratedReport) => {
    if (report.fileUrl) {
      window.open(report.fileUrl, '_blank');
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'generating':
        return 'warning';
      case 'pending':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CloudDownloadIcon sx={{ fontSize: 16 }} />;
      case 'failed':
        return <ErrorIcon sx={{ fontSize: 16 }} />;
      case 'generating':
        return <AutorenewIcon sx={{ fontSize: 16, animation: 'spin 1s linear infinite' }} />;
      default:
        return <AutorenewIcon sx={{ fontSize: 16 }} />;
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Filter reports
  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Paginate reports
  const paginatedReports = filteredReports.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box>
        {Array.from(new Array(5)).map((_, index) => (
          <Skeleton key={index} variant="rectangular" height={60} sx={{ mb: 1 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box>
      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Search reports..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ minWidth: 250 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <SelectMenuItem value="all">All</SelectMenuItem>
            <SelectMenuItem value="completed">Completed</SelectMenuItem>
            <SelectMenuItem value="generating">Generating</SelectMenuItem>
            <SelectMenuItem value="pending">Pending</SelectMenuItem>
            <SelectMenuItem value="failed">Failed</SelectMenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={typeFilter}
            label="Type"
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <SelectMenuItem value="all">All</SelectMenuItem>
            <SelectMenuItem value="performance">Performance</SelectMenuItem>
            <SelectMenuItem value="audience">Audience</SelectMenuItem>
            <SelectMenuItem value="competitive">Competitive</SelectMenuItem>
            <SelectMenuItem value="comprehensive">Comprehensive</SelectMenuItem>
          </Select>
        </FormControl>

        <Box sx={{ flexGrow: 1 }} />

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
          size="small"
        >
          Refresh
        </Button>
      </Box>

      {/* Reports Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Report Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Format</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Generated</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedReports.length > 0 ? (
              paginatedReports.map((report) => (
                <TableRow key={report.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" noWrap sx={{ maxWidth: 250 }}>
                        {report.name}
                      </Typography>
                      {report.scheduleId && (
                        <Typography variant="caption" color="text.secondary">
                          Scheduled Report
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Chip 
                      label={report.type} 
                      size="small" 
                      variant="outlined"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(report.status)}
                      label={report.status}
                      color={getStatusColor(report.status) as any}
                      size="small"
                      variant={report.status === 'completed' ? 'filled' : 'outlined'}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" sx={{ textTransform: 'uppercase' }}>
                      {report.format}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {formatFileSize(report.fileSize)}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {format(new Date(report.generatedAt), 'MMM dd, yyyy')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDistanceToNow(new Date(report.generatedAt), { addSuffix: true })}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      {report.status === 'completed' && report.fileUrl && (
                        <Tooltip title="Download Report">
                          <IconButton
                            size="small"
                            onClick={() => handleDownload(report)}
                            color="primary"
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, report)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                      ? 'No reports match your filters'
                      : 'No reports generated yet'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {filteredReports.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredReports.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}

      {/* Context Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        {selectedReport?.status === 'completed' && selectedReport?.fileUrl && (
          <MenuItem onClick={() => { handleDownload(selectedReport); handleMenuClose(); }}>
            <DownloadIcon sx={{ mr: 1 }} />
            Download
          </MenuItem>
        )}
        
        <MenuItem onClick={() => { /* View details */ handleMenuClose(); }}>
          <CloudDownloadIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        
        {selectedReport?.status !== 'generating' && (
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default ReportsListComponent;