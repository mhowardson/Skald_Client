import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Stack,
  IconButton,
  Divider,
  Chip,
  Card,
  CardContent,
  Grid,
  Button,
  alpha,
  useTheme,
  Badge,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Comment,
  Share,
  MoreHoriz,
  Repeat,
  Send,
  Bookmark,
  BookmarkBorder,
  ThumbUp,
  ThumbUpOutlined,
  LinkedIn,
  Twitter,
  Instagram,
  Facebook,
  YouTube,
  TikTok,
  Visibility,
  PlayArrow,
  VolumeOff,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { ContentPlatform, MediaFile } from '../../types/content';

interface PlatformPreviewProps {
  content: string;
  platforms: ContentPlatform[];
  mediaFiles: MediaFile[];
  authorName?: string;
  authorAvatar?: string;
  accountHandle?: string;
  showAllPreviews?: boolean;
}

interface MockUser {
  name: string;
  handle: string;
  avatar: string;
  verified?: boolean;
  followers?: string;
}

const mockUsers: Record<string, MockUser> = {
  linkedin: {
    name: 'John Marketing Pro',
    handle: 'john-marketing-pro',
    avatar: '',
    verified: true,
    followers: '10.5K',
  },
  twitter: {
    name: 'John Marketing',
    handle: '@johnmarketing',
    avatar: '',
    verified: true,
    followers: '15.2K',
  },
  instagram: {
    name: 'johnmarketing',
    handle: 'johnmarketing',
    avatar: '',
    verified: true,
    followers: '8.9K',
  },
  facebook: {
    name: 'John Marketing Pro',
    handle: 'John Marketing Pro',
    avatar: '',
    followers: '5.1K',
  },
  youtube: {
    name: 'John Marketing Channel',
    handle: 'johnmarketingchannel',
    avatar: '',
    verified: true,
    followers: '25.8K',
  },
  tiktok: {
    name: 'johnmarketing',
    handle: '@johnmarketing',
    avatar: '',
    verified: true,
    followers: '45.2K',
  },
};

const formatContent = (content: string, platform: string): string => {
  // Platform-specific content formatting
  switch (platform) {
    case 'twitter':
      // Twitter has character limits, might need to truncate
      return content.length > 280 ? content.substring(0, 277) + '...' : content;
    case 'linkedin':
      // LinkedIn supports longer content
      return content;
    case 'instagram':
      // Instagram caption styling
      return content;
    default:
      return content;
  }
};

const LinkedInPreview: React.FC<{ content: string; mediaFiles: MediaFile[]; user: MockUser }> = ({
  content,
  mediaFiles,
  user,
}) => {
  const theme = useTheme();
  const [isLiked, setIsLiked] = useState(false);
  
  return (
    <Card sx={{ maxWidth: 550, borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.2)}` }}>
      <CardContent sx={{ p: 2 }}>
        {/* Header */}
        <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
          <Avatar sx={{ width: 48, height: 48 }}>
            {user.name.charAt(0)}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography variant="subtitle2" fontWeight={600}>
                {user.name}
              </Typography>
              {user.verified && (
                <Box sx={{ width: 16, height: 16, bgcolor: '#0066CC', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ color: 'white', fontSize: 8 }}>✓</Typography>\n                </Box>\n              )}\n            </Stack>\n            <Typography variant=\"caption\" color=\"text.secondary\">\n              {user.followers} followers • 2h\n            </Typography>\n          </Box>\n          <IconButton size=\"small\">\n            <MoreHoriz />\n          </IconButton>\n        </Stack>\n\n        {/* Content */}\n        <Typography variant=\"body1\" sx={{ mb: 2, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>\n          {formatContent(content, 'linkedin')}\n        </Typography>\n\n        {/* Media */}\n        {mediaFiles.length > 0 && (\n          <Box sx={{ mb: 2, borderRadius: 1, overflow: 'hidden' }}>\n            {mediaFiles[0].type.startsWith('image') ? (\n              <img\n                src={mediaFiles[0].thumbnail || mediaFiles[0].url}\n                alt=\"Content media\"\n                style={{ width: '100%', maxHeight: 300, objectFit: 'cover' }}\n              />\n            ) : (\n              <Box\n                sx={{\n                  height: 200,\n                  bgcolor: 'black',\n                  display: 'flex',\n                  alignItems: 'center',\n                  justifyContent: 'center',\n                  position: 'relative',\n                }}\n              >\n                <PlayArrow sx={{ fontSize: 48, color: 'white' }} />\n                <Typography\n                  variant=\"caption\"\n                  sx={{ position: 'absolute', bottom: 8, left: 8, color: 'white', bgcolor: 'rgba(0,0,0,0.7)', px: 1, borderRadius: 1 }}\n                >\n                  {mediaFiles[0].name}\n                </Typography>\n              </Box>\n            )}\n          </Box>\n        )}\n\n        {/* Engagement */}\n        <Stack direction=\"row\" spacing={1} sx={{ mb: 1 }}>\n          <Typography variant=\"caption\" color=\"text.secondary\">\n            👍 12 • 💬 3 • 🔄 1\n          </Typography>\n        </Stack>\n\n        <Divider sx={{ mb: 1 }} />\n\n        {/* Actions */}\n        <Stack direction=\"row\" justifyContent=\"space-around\">\n          <Button\n            startIcon={isLiked ? <ThumbUp /> : <ThumbUpOutlined />}\n            size=\"small\"\n            onClick={() => setIsLiked(!isLiked)}\n            color={isLiked ? \"primary\" : \"inherit\"}\n            sx={{ textTransform: 'none', minWidth: 'auto' }}\n          >\n            Like\n          </Button>\n          <Button startIcon={<Comment />} size=\"small\" sx={{ textTransform: 'none', minWidth: 'auto' }}>\n            Comment\n          </Button>\n          <Button startIcon={<Share />} size=\"small\" sx={{ textTransform: 'none', minWidth: 'auto' }}>\n            Share\n          </Button>\n          <Button startIcon={<Send />} size=\"small\" sx={{ textTransform: 'none', minWidth: 'auto' }}>\n            Send\n          </Button>\n        </Stack>\n      </CardContent>\n    </Card>\n  );\n};\n\nconst TwitterPreview: React.FC<{ content: string; mediaFiles: MediaFile[]; user: MockUser }> = ({\n  content,\n  mediaFiles,\n  user,\n}) => {\n  const theme = useTheme();\n  const [isLiked, setIsLiked] = useState(false);\n  const [isRetweeted, setIsRetweeted] = useState(false);\n  const [isBookmarked, setIsBookmarked] = useState(false);\n\n  return (\n    <Card sx={{ maxWidth: 550, borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.2)}` }}>\n      <CardContent sx={{ p: 2 }}>\n        {/* Header */}\n        <Stack direction=\"row\" spacing={1.5} sx={{ mb: 1 }}>\n          <Avatar sx={{ width: 40, height: 40 }}>\n            {user.name.charAt(0)}\n          </Avatar>\n          <Box sx={{ flexGrow: 1 }}>\n            <Stack direction=\"row\" alignItems=\"center\" spacing={0.5}>\n              <Typography variant=\"subtitle2\" fontWeight={600}>\n                {user.name}\n              </Typography>\n              {user.verified && (\n                <Box sx={{ color: '#1DA1F2' }}>\n                  ✓\n                </Box>\n              )}\n              <Typography variant=\"body2\" color=\"text.secondary\">\n                {user.handle} · 2h\n              </Typography>\n            </Stack>\n          </Box>\n          <IconButton size=\"small\">\n            <MoreHoriz />\n          </IconButton>\n        </Stack>\n\n        {/* Content */}\n        <Typography variant=\"body1\" sx={{ mb: 2, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>\n          {formatContent(content, 'twitter')}\n        </Typography>\n\n        {/* Media */}\n        {mediaFiles.length > 0 && (\n          <Box sx={{ mb: 2, borderRadius: 2, overflow: 'hidden', border: `1px solid ${alpha(theme.palette.divider, 0.3)}` }}>\n            {mediaFiles[0].type.startsWith('image') ? (\n              <img\n                src={mediaFiles[0].thumbnail || mediaFiles[0].url}\n                alt=\"Content media\"\n                style={{ width: '100%', maxHeight: 300, objectFit: 'cover' }}\n              />\n            ) : (\n              <Box\n                sx={{\n                  height: 200,\n                  bgcolor: 'black',\n                  display: 'flex',\n                  alignItems: 'center',\n                  justifyContent: 'center',\n                  position: 'relative',\n                }}\n              >\n                <PlayArrow sx={{ fontSize: 48, color: 'white' }} />\n              </Box>\n            )}\n          </Box>\n        )}\n\n        {/* Actions */}\n        <Stack direction=\"row\" justifyContent=\"space-between\" sx={{ maxWidth: 300 }}>\n          <IconButton size=\"small\" color=\"inherit\">\n            <Stack alignItems=\"center\">\n              <Comment fontSize=\"small\" />\n              <Typography variant=\"caption\">3</Typography>\n            </Stack>\n          </IconButton>\n          <IconButton\n            size=\"small\"\n            color={isRetweeted ? \"success\" : \"inherit\"}\n            onClick={() => setIsRetweeted(!isRetweeted)}\n          >\n            <Stack alignItems=\"center\">\n              <Repeat fontSize=\"small\" />\n              <Typography variant=\"caption\">1</Typography>\n            </Stack>\n          </IconButton>\n          <IconButton\n            size=\"small\"\n            color={isLiked ? \"error\" : \"inherit\"}\n            onClick={() => setIsLiked(!isLiked)}\n          >\n            <Stack alignItems=\"center\">\n              {isLiked ? <Favorite fontSize=\"small\" /> : <FavoriteBorder fontSize=\"small\" />}\n              <Typography variant=\"caption\">12</Typography>\n            </Stack>\n          </IconButton>\n          <IconButton\n            size=\"small\"\n            color={isBookmarked ? \"primary\" : \"inherit\"}\n            onClick={() => setIsBookmarked(!isBookmarked)}\n          >\n            {isBookmarked ? <Bookmark fontSize=\"small\" /> : <BookmarkBorder fontSize=\"small\" />}\n          </IconButton>\n          <IconButton size=\"small\">\n            <Share fontSize=\"small\" />\n          </IconButton>\n        </Stack>\n      </CardContent>\n    </Card>\n  );\n};\n\nconst InstagramPreview: React.FC<{ content: string; mediaFiles: MediaFile[]; user: MockUser }> = ({\n  content,\n  mediaFiles,\n  user,\n}) => {\n  const theme = useTheme();\n  const [isLiked, setIsLiked] = useState(false);\n  const [isBookmarked, setIsBookmarked] = useState(false);\n  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);\n\n  return (\n    <Card sx={{ maxWidth: 400, borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.2)}` }}>\n      {/* Header */}\n      <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>\n        <Stack direction=\"row\" alignItems=\"center\" spacing={1.5}>\n          <Avatar sx={{ width: 32, height: 32 }}>\n            {user.name.charAt(0)}\n          </Avatar>\n          <Box sx={{ flexGrow: 1 }}>\n            <Stack direction=\"row\" alignItems=\"center\" spacing={0.5}>\n              <Typography variant=\"subtitle2\" fontWeight={600}>\n                {user.handle}\n              </Typography>\n              {user.verified && (\n                <Box sx={{ color: '#1DA1F2', fontSize: 14 }}>✓</Box>\n              )}\n            </Stack>\n            <Typography variant=\"caption\" color=\"text.secondary\">\n              2 hours ago\n            </Typography>\n          </Box>\n          <IconButton size=\"small\">\n            <MoreHoriz />\n          </IconButton>\n        </Stack>\n      </Box>\n\n      {/* Media */}\n      {mediaFiles.length > 0 && (\n        <Box sx={{ position: 'relative', aspectRatio: '1/1' }}>\n          {mediaFiles[currentMediaIndex].type.startsWith('image') ? (\n            <img\n              src={mediaFiles[currentMediaIndex].thumbnail || mediaFiles[currentMediaIndex].url}\n              alt=\"Content media\"\n              style={{ width: '100%', height: '100%', objectFit: 'cover' }}\n            />\n          ) : (\n            <Box\n              sx={{\n                width: '100%',\n                height: '100%',\n                bgcolor: 'black',\n                display: 'flex',\n                alignItems: 'center',\n                justifyContent: 'center',\n              }}\n            >\n              <PlayArrow sx={{ fontSize: 64, color: 'white' }} />\n              <VolumeOff sx={{ position: 'absolute', top: 8, right: 8, color: 'white' }} />\n            </Box>\n          )}\n          {mediaFiles.length > 1 && (\n            <>\n              <IconButton\n                sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(0,0,0,0.5)', color: 'white' }}\n                onClick={() => setCurrentMediaIndex(Math.max(0, currentMediaIndex - 1))}\n                disabled={currentMediaIndex === 0}\n              >\n                <ChevronLeft />\n              </IconButton>\n              <IconButton\n                sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(0,0,0,0.5)', color: 'white' }}\n                onClick={() => setCurrentMediaIndex(Math.min(mediaFiles.length - 1, currentMediaIndex + 1))}\n                disabled={currentMediaIndex === mediaFiles.length - 1}\n              >\n                <ChevronRight />\n              </IconButton>\n              <Stack\n                direction=\"row\"\n                spacing={0.5}\n                sx={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)' }}\n              >\n                {mediaFiles.map((_, index) => (\n                  <Box\n                    key={index}\n                    sx={{\n                      width: 6,\n                      height: 6,\n                      borderRadius: '50%',\n                      bgcolor: index === currentMediaIndex ? 'white' : 'rgba(255,255,255,0.5)',\n                    }}\n                  />\n                ))}\n              </Stack>\n            </>\n          )}\n        </Box>\n      )}\n\n      {/* Actions */}\n      <Box sx={{ p: 2 }}>\n        <Stack direction=\"row\" justifyContent=\"space-between\" alignItems=\"center\" sx={{ mb: 1 }}>\n          <Stack direction=\"row\" spacing={1}>\n            <IconButton\n              size=\"small\"\n              onClick={() => setIsLiked(!isLiked)}\n              sx={{ color: isLiked ? '#E91E63' : 'inherit' }}\n            >\n              {isLiked ? <Favorite /> : <FavoriteBorder />}\n            </IconButton>\n            <IconButton size=\"small\">\n              <Comment />\n            </IconButton>\n            <IconButton size=\"small\">\n              <Share />\n            </IconButton>\n          </Stack>\n          <IconButton\n            size=\"small\"\n            onClick={() => setIsBookmarked(!isBookmarked)}\n            sx={{ color: isBookmarked ? '#1976d2' : 'inherit' }}\n          >\n            {isBookmarked ? <Bookmark /> : <BookmarkBorder />}\n          </IconButton>\n        </Stack>\n\n        <Typography variant=\"body2\" sx={{ mb: 1, fontWeight: 600 }}>\n          24 likes\n        </Typography>\n\n        {/* Caption */}\n        <Typography variant=\"body2\" sx={{ lineHeight: 1.4 }}>\n          <strong>{user.handle}</strong> {formatContent(content, 'instagram')}\n        </Typography>\n\n        <Typography variant=\"caption\" color=\"text.secondary\" sx={{ mt: 1, display: 'block' }}>\n          View all 3 comments\n        </Typography>\n      </Box>\n    </Card>\n  );\n};\n\nconst FacebookPreview: React.FC<{ content: string; mediaFiles: MediaFile[]; user: MockUser }> = ({\n  content,\n  mediaFiles,\n  user,\n}) => {\n  const theme = useTheme();\n  const [isLiked, setIsLiked] = useState(false);\n\n  return (\n    <Card sx={{ maxWidth: 500, borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.2)}` }}>\n      <CardContent sx={{ p: 0 }}>\n        {/* Header */}\n        <Box sx={{ p: 2 }}>\n          <Stack direction=\"row\" spacing={1.5}>\n            <Avatar sx={{ width: 40, height: 40 }}>\n              {user.name.charAt(0)}\n            </Avatar>\n            <Box sx={{ flexGrow: 1 }}>\n              <Typography variant=\"subtitle2\" fontWeight={600}>\n                {user.name}\n              </Typography>\n              <Typography variant=\"caption\" color=\"text.secondary\">\n                2h • 🌍\n              </Typography>\n            </Box>\n            <IconButton size=\"small\">\n              <MoreHoriz />\n            </IconButton>\n          </Stack>\n        </Box>\n\n        {/* Content */}\n        <Box sx={{ px: 2, pb: 1 }}>\n          <Typography variant=\"body1\" sx={{ lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>\n            {formatContent(content, 'facebook')}\n          </Typography>\n        </Box>\n\n        {/* Media */}\n        {mediaFiles.length > 0 && (\n          <Box sx={{ mb: 1 }}>\n            {mediaFiles[0].type.startsWith('image') ? (\n              <img\n                src={mediaFiles[0].thumbnail || mediaFiles[0].url}\n                alt=\"Content media\"\n                style={{ width: '100%', maxHeight: 400, objectFit: 'cover' }}\n              />\n            ) : (\n              <Box\n                sx={{\n                  height: 250,\n                  bgcolor: 'black',\n                  display: 'flex',\n                  alignItems: 'center',\n                  justifyContent: 'center',\n                  position: 'relative',\n                }}\n              >\n                <PlayArrow sx={{ fontSize: 64, color: 'white' }} />\n              </Box>\n            )}\n          </Box>\n        )}\n\n        {/* Reactions */}\n        <Box sx={{ px: 2, pb: 1 }}>\n          <Stack direction=\"row\" justifyContent=\"space-between\">\n            <Typography variant=\"body2\" color=\"text.secondary\">\n              👍❤️😊 24\n            </Typography>\n            <Typography variant=\"body2\" color=\"text.secondary\">\n              3 comments • 1 share\n            </Typography>\n          </Stack>\n        </Box>\n\n        <Divider />\n\n        {/* Actions */}\n        <Stack direction=\"row\" sx={{ px: 2, py: 1 }}>\n          <Button\n            startIcon={<ThumbUpOutlined />}\n            size=\"small\"\n            fullWidth\n            sx={{ textTransform: 'none', color: isLiked ? '#1877F2' : 'inherit' }}\n            onClick={() => setIsLiked(!isLiked)}\n          >\n            Like\n          </Button>\n          <Button startIcon={<Comment />} size=\"small\" fullWidth sx={{ textTransform: 'none' }}>\n            Comment\n          </Button>\n          <Button startIcon={<Share />} size=\"small\" fullWidth sx={{ textTransform: 'none' }}>\n            Share\n          </Button>\n        </Stack>\n      </CardContent>\n    </Card>\n  );\n};\n\nconst YouTubePreview: React.FC<{ content: string; mediaFiles: MediaFile[]; user: MockUser }> = ({\n  content,\n  mediaFiles,\n  user,\n}) => {\n  const theme = useTheme();\n  const [isLiked, setIsLiked] = useState(false);\n\n  return (\n    <Card sx={{ maxWidth: 400, borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.2)}` }}>\n      {/* Thumbnail */}\n      <Box sx={{ position: 'relative', aspectRatio: '16/9', bgcolor: 'black' }}>\n        {mediaFiles.length > 0 && mediaFiles[0].type.startsWith('image') ? (\n          <img\n            src={mediaFiles[0].thumbnail || mediaFiles[0].url}\n            alt=\"Video thumbnail\"\n            style={{ width: '100%', height: '100%', objectFit: 'cover' }}\n          />\n        ) : (\n          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>\n            <PlayArrow sx={{ fontSize: 64, color: 'white' }} />\n          </Box>\n        )}\n        <Box sx={{ position: 'absolute', bottom: 8, right: 8, bgcolor: 'black', color: 'white', px: 1, py: 0.5, borderRadius: 1, fontSize: 12 }}>\n          2:34\n        </Box>\n      </Box>\n\n      <CardContent sx={{ p: 2 }}>\n        {/* Title */}\n        <Typography variant=\"subtitle2\" fontWeight={600} sx={{ mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>\n          {content.split('\\n')[0] || 'Video Title'}\n        </Typography>\n\n        {/* Stats */}\n        <Typography variant=\"caption\" color=\"text.secondary\" sx={{ mb: 1, display: 'block' }}>\n          156 views • 2 hours ago\n        </Typography>\n\n        {/* Channel */}\n        <Stack direction=\"row\" alignItems=\"center\" spacing={1} sx={{ mb: 2 }}>\n          <Avatar sx={{ width: 24, height: 24 }}>\n            {user.name.charAt(0)}\n          </Avatar>\n          <Typography variant=\"caption\" color=\"text.secondary\">\n            {user.name}\n          </Typography>\n          {user.verified && (\n            <Box sx={{ color: '#FF0000', fontSize: 12 }}>✓</Box>\n          )}\n        </Stack>\n\n        {/* Description */}\n        <Typography variant=\"body2\" color=\"text.secondary\" sx={{ fontSize: '0.8rem', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>\n          {formatContent(content, 'youtube')}\n        </Typography>\n      </CardContent>\n    </Card>\n  );\n};\n\nconst TikTokPreview: React.FC<{ content: string; mediaFiles: MediaFile[]; user: MockUser }> = ({\n  content,\n  mediaFiles,\n  user,\n}) => {\n  const theme = useTheme();\n  const [isLiked, setIsLiked] = useState(false);\n\n  return (\n    <Card sx={{ maxWidth: 300, aspectRatio: '9/16', position: 'relative', borderRadius: 3, overflow: 'hidden', bgcolor: 'black' }}>\n      {/* Video Background */}\n      {mediaFiles.length > 0 ? (\n        <img\n          src={mediaFiles[0].thumbnail || mediaFiles[0].url}\n          alt=\"TikTok content\"\n          style={{ width: '100%', height: '100%', objectFit: 'cover' }}\n        />\n      ) : (\n        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#000' }}>\n          <PlayArrow sx={{ fontSize: 80, color: 'white' }} />\n        </Box>\n      )}\n\n      {/* Overlay Content */}\n      <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 2, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>\n        {/* User Info */}\n        <Stack direction=\"row\" alignItems=\"center\" spacing={1} sx={{ mb: 1 }}>\n          <Avatar sx={{ width: 32, height: 32, border: '2px solid white' }}>\n            {user.name.charAt(0)}\n          </Avatar>\n          <Typography variant=\"subtitle2\" color=\"white\" fontWeight={600}>\n            {user.handle}\n          </Typography>\n          {user.verified && (\n            <Box sx={{ color: 'white', fontSize: 14 }}>✓</Box>\n          )}\n          <Button size=\"small\" variant=\"outlined\" sx={{ color: 'white', borderColor: 'white', ml: 'auto', minWidth: 'auto', px: 2 }}>\n            Follow\n          </Button>\n        </Stack>\n\n        {/* Caption */}\n        <Typography variant=\"body2\" color=\"white\" sx={{ mb: 1, lineHeight: 1.4 }}>\n          {formatContent(content, 'tiktok')}\n        </Typography>\n\n        {/* Music */}\n        <Typography variant=\"caption\" sx={{ color: 'rgba(255,255,255,0.8)' }}>\n          ♪ Original audio - {user.name}\n        </Typography>\n      </Box>\n\n      {/* Right Side Actions */}\n      <Stack spacing={2} sx={{ position: 'absolute', right: 12, bottom: 100 }}>\n        <Box sx={{ textAlign: 'center' }}>\n          <IconButton\n            sx={{ color: isLiked ? '#FF0050' : 'white', mb: 0.5 }}\n            onClick={() => setIsLiked(!isLiked)}\n          >\n            {isLiked ? <Favorite /> : <FavoriteBorder />}\n          </IconButton>\n          <Typography variant=\"caption\" color=\"white\" sx={{ display: 'block' }}>\n            156\n          </Typography>\n        </Box>\n        <Box sx={{ textAlign: 'center' }}>\n          <IconButton sx={{ color: 'white', mb: 0.5 }}>\n            <Comment />\n          </IconButton>\n          <Typography variant=\"caption\" color=\"white\" sx={{ display: 'block' }}>\n            12\n          </Typography>\n        </Box>\n        <Box sx={{ textAlign: 'center' }}>\n          <IconButton sx={{ color: 'white', mb: 0.5 }}>\n            <Share />\n          </IconButton>\n          <Typography variant=\"caption\" color=\"white\" sx={{ display: 'block' }}>\n            8\n          </Typography>\n        </Box>\n      </Stack>\n    </Card>\n  );\n};\n\nexport const PlatformPreview: React.FC<PlatformPreviewProps> = ({\n  content,\n  platforms,\n  mediaFiles,\n  authorName = 'John Marketing Pro',\n  authorAvatar,\n  accountHandle,\n  showAllPreviews = true,\n}) => {\n  const [selectedPlatform, setSelectedPlatform] = useState(platforms[0]?.platform || 'linkedin');\n\n  const renderPreview = (platform: string) => {\n    const user = mockUsers[platform] || mockUsers.linkedin;\n    \n    switch (platform) {\n      case 'linkedin':\n        return <LinkedInPreview content={content} mediaFiles={mediaFiles} user={user} />;\n      case 'twitter':\n        return <TwitterPreview content={content} mediaFiles={mediaFiles} user={user} />;\n      case 'instagram':\n        return <InstagramPreview content={content} mediaFiles={mediaFiles} user={user} />;\n      case 'facebook':\n        return <FacebookPreview content={content} mediaFiles={mediaFiles} user={user} />;\n      case 'youtube':\n        return <YouTubePreview content={content} mediaFiles={mediaFiles} user={user} />;\n      case 'tiktok':\n        return <TikTokPreview content={content} mediaFiles={mediaFiles} user={user} />;\n      default:\n        return <LinkedInPreview content={content} mediaFiles={mediaFiles} user={user} />;\n    }\n  };\n\n  if (!content.trim()) {\n    return (\n      <Box sx={{ textAlign: 'center', py: 4 }}>\n        <Typography variant=\"h6\" color=\"text.secondary\">\n          Start typing to see your content preview\n        </Typography>\n      </Box>\n    );\n  }\n\n  if (showAllPreviews && platforms.length > 1) {\n    return (\n      <Box>\n        {/* Platform Tabs */}\n        <Stack direction=\"row\" spacing={1} sx={{ mb: 3, flexWrap: 'wrap' }}>\n          {platforms.map((platform) => (\n            <Chip\n              key={platform.platform}\n              label={platform.platform.charAt(0).toUpperCase() + platform.platform.slice(1)}\n              onClick={() => setSelectedPlatform(platform.platform)}\n              color={selectedPlatform === platform.platform ? 'primary' : 'default'}\n              variant={selectedPlatform === platform.platform ? 'filled' : 'outlined'}\n            />\n          ))}\n        </Stack>\n\n        {/* Single Preview */}\n        <Box sx={{ display: 'flex', justifyContent: 'center' }}>\n          {renderPreview(selectedPlatform)}\n        </Box>\n      </Box>\n    );\n  }\n\n  // Show all previews side by side\n  return (\n    <Grid container spacing={3} justifyContent=\"center\">\n      {platforms.map((platform) => (\n        <Grid item key={platform.platform}>\n          <Box sx={{ textAlign: 'center' }}>\n            <Typography variant=\"h6\" sx={{ mb: 2, textTransform: 'capitalize' }}>\n              {platform.platform}\n            </Typography>\n            {renderPreview(platform.platform)}\n          </Box>\n        </Grid>\n      ))}\n    </Grid>\n  );\n};