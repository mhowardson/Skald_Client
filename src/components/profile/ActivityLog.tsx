import React from 'react';
import { Box, Typography } from '@mui/material';

export const ActivityLog: React.FC = () => {
  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom>
        Activity Log
      </Typography>
      <Typography variant="body2" color="text.secondary">
        User activity and audit log coming soon...
      </Typography>
    </Box>
  );
};