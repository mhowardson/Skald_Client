import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  CheckCircle as ConnectedIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

import type { PlatformStats } from '../../store/api/socialPlatformsApi';

interface PlatformStatsCardProps {
  stat: PlatformStats;
}

const platformConfig = {
  linkedin: { name: 'LinkedIn', color: '#0077B5', icon: '💼' },
  twitter: { name: 'Twitter', color: '#1DA1F2', icon: '🐦' },
  facebook: { name: 'Facebook', color: '#1877F2', icon: '📘' },
  instagram: { name: 'Instagram', color: '#E4405F', icon: '📷' },
  youtube: { name: 'YouTube', color: '#FF0000', icon: '📺' },
  tiktok: { name: 'TikTok', color: '#000000', icon: '🎵' }
};

export const PlatformStatsCard: React.FC<PlatformStatsCardProps> = ({ stat }) => {
  const config = platformConfig[stat.platform as keyof typeof platformConfig];
  
  if (!config) return null;

  const engagementRate = stat.totalPosts > 0 ? (stat.totalEngagement / stat.totalPosts) : 0;
  const getEngagementColor = (rate: number) => {
    if (rate > 5) return 'success';
    if (rate > 2) return 'warning';
    return 'error';
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">{config.icon}</Typography>
            <Typography variant="subtitle2" fontWeight="bold" noWrap>
              {config.name}
            </Typography>
          </Box>
          
          {stat.isConnected ? (
            <Chip
              icon={<ConnectedIcon />}
              label="Connected"
              size="small"
              color="success"
              variant="outlined"
            />
          ) : (
            <Chip
              icon={<ErrorIcon />}
              label="Disconnected"
              size="small"
              color="error"
              variant="outlined"
            />
          )}
        </Box>

        {stat.isConnected ? (
          <>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h4" fontWeight="bold" color={config.color}>
                {stat.totalPosts}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Posts
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TrendingUpIcon fontSize="small" color="action" />
                <Typography variant="body2" fontWeight="medium">
                  {engagementRate.toFixed(1)}% avg engagement
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(engagementRate * 10, 100)}
                color={getEngagementColor(engagementRate) as any}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>

            {stat.lastPostAt && (
              <Typography variant="caption" color="text.secondary">
                Last post: {formatDistanceToNow(new Date(stat.lastPostAt), { addSuffix: true })}
              </Typography>
            )}

            {stat.accountCount > 1 && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                {stat.accountCount} accounts connected
              </Typography>
            )}
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Connect your {config.name} account to see stats
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};