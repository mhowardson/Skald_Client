import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Typography,
  IconButton,
  Divider,
  Chip,
  Stack,
  Alert,
  Button,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  Fade,
  alpha,
  useTheme,
  LinearProgress,
  Zoom,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Grid,
  Badge,
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  Link,
  Image,
  EmojiEmotions,
  Undo,
  Redo,
  AutoAwesome,
  Tag,
  Schedule,
  Visibility,
  Code,
  FormatClear,
  MoreVert,
  ContentCopy,
  Save,
  Analytics,
  Fullscreen,
  FullscreenExit,
  TrendingUp,
  Language,
  ExpandMore,
  Lightbulb,
  Insights,
  Speed,
} from '@mui/icons-material';

interface ContentPlatform {
  platform: string;
  status?: string;
  publishingResult?: any;
  platformSpecific?: any;
  scheduledAt?: string;
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  platforms?: ContentPlatform[];
  maxLength?: number;
  placeholder?: string;
  onAiAssist?: () => void;
  onHashtagSuggest?: () => void;
  onSchedule?: () => void;
  onPreview?: () => void;
  showPlatformOptimization?: boolean;
}

const platformLimits: Record<string, number> = {
  twitter: 280,
  facebook: 63206,
  instagram: 2200,
  linkedin: 3000,
  tiktok: 2200,
  youtube: 5000,
};

const platformColors: Record<string, string> = {
  twitter: '#1DA1F2',
  facebook: '#1877F2',
  instagram: '#E4405F',
  linkedin: '#0A66C2',
  tiktok: '#000000',
  youtube: '#FF0000',
};

const platformIcons: Record<string, string> = {
  twitter: '🐦',
  facebook: '📘',
  instagram: '📷',
  linkedin: '💼',
  tiktok: '🎵',
  youtube: '📺',
};

export const ModernRichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  platforms = [],
  maxLength,
  placeholder = 'Start crafting your story...',
  onAiAssist,
  onHashtagSuggest,
  onSchedule,
  onPreview,
  showPlatformOptimization = true,
}) => {
  const theme = useTheme();
  const textFieldRef = useRef<HTMLTextAreaElement>(null);
  const [formatting, setFormatting] = useState<string[]>([]);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<null | HTMLElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([
    'Add a compelling hook',
    'Include trending hashtags',
    'Optimize for engagement',
  ]);
  const typingTimeout = useRef<NodeJS.Timeout>();

  const primaryPlatform = platforms[0]?.platform || 'twitter';
  const characterLimit = maxLength || platformLimits[primaryPlatform] || 5000;
  const remaining = characterLimit - value.length;
  const isOverLimit = remaining < 0;
  const progress = (value.length / characterLimit) * 100;

  // Auto-save indicator
  useEffect(() => {
    if (isTyping) {
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        setIsTyping(false);
      }, 1000);
    }
  }, [value, isTyping]);

  const handleFormat = (event: React.MouseEvent<HTMLElement>, newFormats: string[]) => {
    setFormatting(newFormats);
  };

  const handleTextChange = (newValue: string) => {
    setUndoStack([...undoStack, value]);
    setRedoStack([]);
    onChange(newValue);
    setIsTyping(true);
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previousValue = undoStack[undoStack.length - 1];
      setRedoStack([...redoStack, value]);
      setUndoStack(undoStack.slice(0, -1));
      onChange(previousValue);
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextValue = redoStack[redoStack.length - 1];
      setUndoStack([...undoStack, value]);
      setRedoStack(redoStack.slice(0, -1));
      onChange(nextValue);
    }
  };

  const insertAtCursor = (text: string) => {
    if (textFieldRef.current) {
      const start = textFieldRef.current.selectionStart || 0;
      const end = textFieldRef.current.selectionEnd || 0;
      const newValue = value.substring(0, start) + text + value.substring(end);
      handleTextChange(newValue);
      setTimeout(() => {
        if (textFieldRef.current) {
          textFieldRef.current.selectionStart = start + text.length;
          textFieldRef.current.selectionEnd = start + text.length;
          textFieldRef.current.focus();
        }
      }, 0);
    }
  };

  const wrapSelection = (prefix: string, suffix: string) => {
    if (textFieldRef.current) {
      const start = textFieldRef.current.selectionStart || 0;
      const end = textFieldRef.current.selectionEnd || 0;
      const selectedText = value.substring(start, end);
      const newText = prefix + (selectedText || 'text') + suffix;
      const newValue = value.substring(0, start) + newText + value.substring(end);
      handleTextChange(newValue);
    }
  };

  const insertFormatting = (format: string) => {
    const formatMap: Record<string, { prefix: string; suffix: string }> = {
      bold: { prefix: '**', suffix: '**' },
      italic: { prefix: '*', suffix: '*' },
      underline: { prefix: '__', suffix: '__' },
      code: { prefix: '`', suffix: '`' },
      quote: { prefix: '\n> ', suffix: '' },
    };

    if (formatMap[format]) {
      const { prefix, suffix } = formatMap[format];
      wrapSelection(prefix, suffix);
    }
  };

  const insertList = (type: 'bullet' | 'number') => {
    const prefix = type === 'bullet' ? '\n• ' : '\n1. ';
    insertAtCursor(prefix);
  };

  const getPlatformProgress = (platform: string) => {
    const limit = platformLimits[platform] || 5000;
    const platformProgress = (value.length / limit) * 100;
    return {
      progress: Math.min(platformProgress, 100),
      remaining: limit - value.length,
      isOver: value.length > limit,
      limit,
    };
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Paper
        elevation={0}
        sx={{
          border: `2px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: 4,
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(
            theme.palette.background.default,
            0.6
          )} 100%)`,
          backdropFilter: 'blur(20px)',
          ...(isFullscreen && {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1300,
            borderRadius: 0,
          }),
          '&:hover': {
            borderColor: alpha(theme.palette.primary.main, 0.3),
            boxShadow: `0 8px 40px ${alpha(theme.palette.primary.main, 0.12)}`,
            transform: 'translateY(-2px)',
          },
          '&:focus-within': {
            borderColor: platformColors[primaryPlatform] || theme.palette.primary.main,
            boxShadow: `0 12px 50px ${alpha(
              platformColors[primaryPlatform] || theme.palette.primary.main,
              0.2
            )}`,
            transform: 'translateY(-4px)',
          },
        }}
      >
        {/* Advanced Toolbar */}
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
            background: `linear-gradient(90deg, ${alpha(
              theme.palette.background.default,
              0.8
            )} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            {/* Text Formatting Group */}
            <ToggleButtonGroup
              value={formatting}
              onChange={handleFormat}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  border: 'none',
                  borderRadius: 2.5,
                  px: 2,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.08),
                    transform: 'translateY(-1px)',
                  },
                  '&.Mui-selected': {
                    background: `linear-gradient(45deg, ${alpha(
                      theme.palette.primary.main,
                      0.15
                    )}, ${alpha(theme.palette.primary.main, 0.08)})`,
                    color: theme.palette.primary.main,
                    boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`,
                  },
                },
              }}
            >
              <ToggleButton value="bold" onClick={() => insertFormatting('bold')}>
                <Tooltip title="Bold (Ctrl+B)" arrow>
                  <FormatBold fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="italic" onClick={() => insertFormatting('italic')}>
                <Tooltip title="Italic (Ctrl+I)" arrow>
                  <FormatItalic fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="underline" onClick={() => insertFormatting('underline')}>
                <Tooltip title="Underline (Ctrl+U)" arrow>
                  <FormatUnderlined fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="code" onClick={() => insertFormatting('code')}>
                <Tooltip title="Code" arrow>
                  <Code fontSize="small" />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>

            <Divider orientation="vertical" flexItem sx={{ mx: 1, opacity: 0.2 }} />

            {/* Structure Tools */}
            <Stack direction="row" spacing={0.5}>
              {[
                { icon: FormatListBulleted, action: () => insertList('bullet'), tooltip: 'Bullet List' },
                {
                  icon: FormatListNumbered,
                  action: () => insertList('number'),
                  tooltip: 'Numbered List',
                },
                { icon: FormatQuote, action: () => insertFormatting('quote'), tooltip: 'Quote' },
              ].map((tool, index) => (
                <IconButton
                  key={index}
                  size="small"
                  onClick={tool.action}
                  sx={{
                    borderRadius: 2.5,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: alpha(theme.palette.primary.main, 0.08),
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  <Tooltip title={tool.tooltip} arrow>
                    <tool.icon fontSize="small" />
                  </Tooltip>
                </IconButton>
              ))}
            </Stack>

            <Divider orientation="vertical" flexItem sx={{ mx: 1, opacity: 0.2 }} />

            {/* Media & Enhancement Tools */}
            <Stack direction="row" spacing={0.5}>
              {[
                { icon: Link, tooltip: 'Insert Link' },
                { icon: Image, tooltip: 'Insert Image' },
                { icon: EmojiEmotions, tooltip: 'Insert Emoji' },
                { icon: Tag, action: onHashtagSuggest, tooltip: 'Hashtag Suggestions' },
              ].map((tool, index) => (
                <IconButton
                  key={index}
                  size="small"
                  onClick={tool.action}
                  sx={{
                    borderRadius: 2.5,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: alpha(theme.palette.primary.main, 0.08),
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  <Tooltip title={tool.tooltip} arrow>
                    <tool.icon fontSize="small" />
                  </Tooltip>
                </IconButton>
              ))}
            </Stack>

            <Box sx={{ flexGrow: 1 }} />

            {/* AI Assistant */}
            {onAiAssist && (
              <Zoom in>
                <Button
                  size="small"
                  startIcon={<AutoAwesome />}
                  onClick={onAiAssist}
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    color: theme.palette.primary.main,
                    background: alpha(theme.palette.primary.main, 0.04),
                    px: 2,
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      background: alpha(theme.palette.primary.main, 0.12),
                      transform: 'translateY(-1px)',
                      boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.25)}`,
                    },
                  }}
                >
                  AI Enhance
                </Button>
              </Zoom>
            )}

            {/* History & Actions */}
            <Stack direction="row" spacing={0.5}>
              <IconButton
                size="small"
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                sx={{ borderRadius: 2.5 }}
              >
                <Tooltip title="Undo (Ctrl+Z)" arrow>
                  <Undo fontSize="small" />
                </Tooltip>
              </IconButton>
              <IconButton
                size="small"
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                sx={{ borderRadius: 2.5 }}
              >
                <Tooltip title="Redo (Ctrl+Shift+Z)" arrow>
                  <Redo fontSize="small" />
                </Tooltip>
              </IconButton>
            </Stack>

            <Divider orientation="vertical" flexItem sx={{ mx: 1, opacity: 0.2 }} />

            {/* View Controls */}
            <IconButton
              size="small"
              onClick={() => setIsFullscreen(!isFullscreen)}
              sx={{ borderRadius: 2.5 }}
            >
              <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'} arrow>
                {isFullscreen ? <FullscreenExit fontSize="small" /> : <Fullscreen fontSize="small" />}
              </Tooltip>
            </IconButton>
          </Stack>
        </Box>

        {/* Main Content Area */}
        <Grid container sx={{ minHeight: isFullscreen ? 'calc(100vh - 240px)' : 480 }}>
          {/* Editor */}
          <Grid item xs={showPlatformOptimization ? 8 : 12}>
            <Box sx={{ position: 'relative', height: '100%' }}>
              <TextField
                inputRef={textFieldRef}
                multiline
                fullWidth
                value={value}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder={placeholder}
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                }}
                sx={{
                  height: '100%',
                  '& .MuiInputBase-root': {
                    p: 4,
                    height: '100%',
                    alignItems: 'flex-start',
                    fontSize: '1.125rem',
                    lineHeight: 1.8,
                    fontFamily: theme.typography.fontFamily,
                    color: theme.palette.text.primary,
                    '& textarea': {
                      height: '100% !important',
                      '&::placeholder': {
                        opacity: 0.4,
                        fontStyle: 'italic',
                        color: theme.palette.text.secondary,
                      },
                    },
                  },
                }}
              />

              {/* Auto-save Indicator */}
              <Fade in={isTyping}>
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    color: theme.palette.success.main,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    background: alpha(theme.palette.success.main, 0.1),
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    fontWeight: 500,
                  }}
                >
                  <Save fontSize="small" sx={{ fontSize: 14 }} />
                  Auto-saving...
                </Typography>
              </Fade>
            </Box>
          </Grid>

          {/* Platform Optimization Panel */}
          {showPlatformOptimization && (
            <Grid item xs={4}>
              <Box
                sx={{
                  borderLeft: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                  height: '100%',
                  p: 3,
                  background: alpha(theme.palette.background.default, 0.3),
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Insights color="primary" />
                  Platform Insights
                </Typography>

                {/* Platform Progress */}
                <Stack spacing={2} sx={{ mb: 3 }}>
                  {platforms.slice(0, 3).map((platform) => {
                    const stats = getPlatformProgress(platform.platform);
                    return (
                      <Card
                        key={platform.platform}
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderColor: stats.isOver ? 'error.main' : 'divider',
                          background: alpha(
                            stats.isOver ? theme.palette.error.main : theme.palette.success.main,
                            0.04
                          ),
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                          <Typography variant="h6">
                            {platformIcons[platform.platform]}
                          </Typography>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {platform.platform.charAt(0).toUpperCase() + platform.platform.slice(1)}
                          </Typography>
                          <Box sx={{ flexGrow: 1 }} />
                          <Chip
                            size="small"
                            label={stats.isOver ? 'Over limit' : 'Within limit'}
                            color={stats.isOver ? 'error' : 'success'}
                            variant="outlined"
                          />
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={stats.progress}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: alpha(theme.palette.divider, 0.1),
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                              backgroundColor: stats.isOver ? 'error.main' : 'success.main',
                            },
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                          {stats.remaining.toLocaleString()} / {stats.limit.toLocaleString()} characters
                        </Typography>
                      </Card>
                    );
                  })}
                </Stack>

                {/* AI Suggestions */}
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Lightbulb color="warning" fontSize="small" />
                      AI Suggestions
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={1}>
                      {aiSuggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          size="small"
                          variant="outlined"
                          startIcon={<TrendingUp />}
                          sx={{
                            justifyContent: 'flex-start',
                            textAlign: 'left',
                            borderRadius: 2,
                            textTransform: 'none',
                          }}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </Stack>
                  </AccordionDetails>
                </Accordion>

                {/* Performance Metrics */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Speed color="info" fontSize="small" />
                    Performance Score
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={75}
                      sx={{
                        flexGrow: 1,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: alpha(theme.palette.divider, 0.1),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          backgroundColor: theme.palette.info.main,
                        },
                      }}
                    />
                    <Typography variant="body2" fontWeight={600}>
                      75%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>

        {/* Enhanced Footer */}
        <Box
          sx={{
            px: 3,
            py: 2,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
            background: `linear-gradient(90deg, ${alpha(
              theme.palette.background.default,
              0.8
            )} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center">
              {platforms.length > 0 && (
                <Stack direction="row" spacing={1}>
                  {platforms.slice(0, 4).map((platform) => (
                    <Chip
                      key={platform.platform}
                      label={`${platformIcons[platform.platform]} ${platform.platform}`}
                      size="small"
                      sx={{
                        borderColor: platformColors[platform.platform],
                        color: platformColors[platform.platform],
                        borderRadius: 2.5,
                        fontWeight: 600,
                      }}
                      variant="outlined"
                    />
                  ))}
                  {platforms.length > 4 && (
                    <Chip
                      label={`+${platforms.length - 4} more`}
                      size="small"
                      variant="outlined"
                      sx={{ borderRadius: 2.5 }}
                    />
                  )}
                </Stack>
              )}

              <Stack direction="row" spacing={1}>
                {onPreview && (
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={onPreview}
                    sx={{ borderRadius: 2.5 }}
                  >
                    Preview
                  </Button>
                )}
                {onSchedule && (
                  <Button
                    size="small"
                    startIcon={<Schedule />}
                    onClick={onSchedule}
                    sx={{ borderRadius: 2.5 }}
                  >
                    Schedule
                  </Button>
                )}
              </Stack>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <LinearProgress
                variant="determinate"
                value={Math.min(progress, 100)}
                sx={{
                  width: 120,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: alpha(theme.palette.divider, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    backgroundColor:
                      isOverLimit
                        ? theme.palette.error.main
                        : progress > 90
                        ? theme.palette.warning.main
                        : theme.palette.success.main,
                  },
                }}
              />
              <Typography
                variant="body2"
                color={
                  isOverLimit ? 'error' : remaining < 50 ? 'warning.main' : 'text.secondary'
                }
                sx={{ fontWeight: 600, minWidth: 140, textAlign: 'right' }}
              >
                {remaining.toLocaleString()} characters left
              </Typography>
            </Stack>
          </Stack>
        </Box>

        {/* Character Limit Warning */}
        {isOverLimit && (
          <Alert
            severity="error"
            sx={{
              m: 2,
              borderRadius: 2.5,
              '& .MuiAlert-icon': {
                fontSize: 20,
              },
            }}
          >
            Your content exceeds the character limit by {Math.abs(remaining).toLocaleString()}{' '}
            characters. Consider shortening it for optimal platform performance.
          </Alert>
        )}
      </Paper>
    </Box>
  );
};