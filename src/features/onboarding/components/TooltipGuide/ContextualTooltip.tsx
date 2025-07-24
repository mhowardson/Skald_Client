/**
 * Contextual Tooltip Component
 * 
 * Provides contextual help and guidance through smart tooltips
 * that appear on hover or focus of UI elements.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Tooltip,
  Paper,
  Typography,
  Button,
  Box,
  IconButton,
  Chip,
  styled,
  TooltipProps,
  ClickAwayListener
} from '@mui/material';
import {
  Help,
  Close,
  VideoLibrary,
  Article,
  AutoAwesome
} from '@mui/icons-material';
import { HelpContent, ContextualHelp } from '../../types/onboarding.types';

interface ContextualTooltipProps {
  children: React.ReactElement;
  helpContent: HelpContent[];
  trigger?: 'hover' | 'click' | 'focus';
  placement?: TooltipProps['placement'];
  showAlways?: boolean;
  onHelpView?: (contentId: string) => void;
}

const TooltipContent = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  maxWidth: 320,
  minWidth: 240
}));

const HelpHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(1)
}));

const HelpList = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1)
}));

const HelpItem = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(0.5),
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    borderColor: theme.palette.primary.main
  }
}));

const HelpIcon = styled(Box)<{ type: string }>(({ theme, type }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 20,
  height: 20,
  borderRadius: '50%',
  marginRight: theme.spacing(1),
  backgroundColor: 
    type === 'video' ? theme.palette.error.main :
    type === 'article' ? theme.palette.info.main :
    theme.palette.success.main,
  color: theme.palette.common.white
}));

const QuickTip = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  backgroundColor: theme.palette.primary.main + '10',
  borderRadius: theme.spacing(0.5),
  marginBottom: theme.spacing(1),
  
  '&::before': {
    content: '"💡"',
    marginRight: theme.spacing(0.5)
  }
}));

export const ContextualTooltip: React.FC<ContextualTooltipProps> = ({
  children,
  helpContent,
  trigger = 'hover',
  placement = 'top',
  showAlways = false,
  onHelpView
}) => {
  const [open, setOpen] = useState(showAlways);
  const [clickOpen, setClickOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Get the primary help content (first item or tooltip type)
  const primaryHelp = helpContent.find(content => content.type === 'tooltip') || helpContent[0];
  const hasAdditionalHelp = helpContent.length > 1 || 
    (helpContent.length === 1 && helpContent[0].type !== 'tooltip');

  const handleOpen = () => {
    if (trigger === 'hover') {
      clearTimeout(timeoutRef.current);
      setOpen(true);
    }
  };

  const handleClose = () => {
    if (trigger === 'hover') {
      timeoutRef.current = setTimeout(() => {
        setOpen(false);
      }, 100);
    }
  };

  const handleClick = () => {
    if (trigger === 'click') {
      setClickOpen(!clickOpen);
      setOpen(!clickOpen);
    }
  };

  const handleClickAway = () => {
    if (trigger === 'click' && clickOpen) {
      setClickOpen(false);
      setOpen(false);
    }
  };

  const handleHelpItemClick = (content: HelpContent) => {
    onHelpView?.(content.id);
    
    if (content.url) {
      window.open(content.url, '_blank');
    }
    
    // Close tooltip after interaction
    if (trigger === 'click') {
      setClickOpen(false);
      setOpen(false);
    }
  };

  const getHelpIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <VideoLibrary fontSize="small" />;
      case 'article':
        return <Article fontSize="small" />;
      case 'interactive':
        return <AutoAwesome fontSize="small" />;
      default:
        return <Help fontSize="small" />;
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return '';
    const minutes = Math.floor(duration / 60);
    return `${minutes}m`;
  };

  const tooltipContent = (
    <TooltipContent elevation={8}>
      {hasAdditionalHelp && (
        <HelpHeader>
          <Typography variant="subtitle2" color="primary">
            Need Help?
          </Typography>
          {trigger === 'click' && (
            <IconButton size="small" onClick={() => handleClickAway()}>
              <Close fontSize="small" />
            </IconButton>
          )}
        </HelpHeader>
      )}

      {primaryHelp && primaryHelp.type === 'tooltip' && (
        <QuickTip>
          <Typography variant="body2" color="text.secondary">
            {primaryHelp.content}
          </Typography>
        </QuickTip>
      )}

      {hasAdditionalHelp && (
        <HelpList>
          {helpContent
            .filter(content => content.type !== 'tooltip')
            .slice(0, 3) // Limit to 3 items to avoid overwhelming
            .map((content) => (
              <HelpItem
                key={content.id}
                onClick={() => handleHelpItemClick(content)}
              >
                <Box display="flex" alignItems="flex-start">
                  <HelpIcon type={content.type}>
                    {getHelpIcon(content.type)}
                  </HelpIcon>
                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <Typography variant="body2" fontWeight="medium">
                        {content.title}
                      </Typography>
                      {content.duration && (
                        <Chip 
                          label={formatDuration(content.duration)}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      <Chip
                        label={content.difficulty}
                        size="small"
                        color={
                          content.difficulty === 'beginner' ? 'success' :
                          content.difficulty === 'intermediate' ? 'warning' :
                          'error'
                        }
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {content.content.length > 100 
                        ? content.content.substring(0, 100) + '...'
                        : content.content
                      }
                    </Typography>
                  </Box>
                </Box>
              </HelpItem>
            ))}
          
          {helpContent.length > 3 && (
            <Button
              size="small"
              variant="outlined"
              fullWidth
              onClick={() => {
                // Navigate to full help center
                window.open('/help', '_blank');
              }}
            >
              View All Help ({helpContent.length} items)
            </Button>
          )}
        </HelpList>
      )}
    </TooltipContent>
  );

  // For simple tooltips without additional help
  if (!hasAdditionalHelp && primaryHelp) {
    return (
      <Tooltip
        title={primaryHelp.content}
        placement={placement}
        arrow
        enterDelay={500}
        leaveDelay={200}
      >
        {children}
      </Tooltip>
    );
  }

  // For complex help tooltips
  const wrappedChildren = React.cloneElement(children, {
    onMouseEnter: trigger === 'hover' ? handleOpen : children.props.onMouseEnter,
    onMouseLeave: trigger === 'hover' ? handleClose : children.props.onMouseLeave,
    onClick: trigger === 'click' ? handleClick : children.props.onClick,
    onFocus: trigger === 'focus' ? handleOpen : children.props.onFocus,
    onBlur: trigger === 'focus' ? handleClose : children.props.onBlur
  });

  if (trigger === 'click') {
    return (
      <ClickAwayListener onClickAway={handleClickAway}>
        <Box>
          <Tooltip
            open={open}
            title={tooltipContent}
            placement={placement}
            arrow
            disableHoverListener
            disableFocusListener
            disableTouchListener
            PopperProps={{
              modifiers: [
                {
                  name: 'offset',
                  options: {
                    offset: [0, 8],
                  },
                },
              ],
            }}
          >
            {wrappedChildren}
          </Tooltip>
        </Box>
      </ClickAwayListener>
    );
  }

  return (
    <Tooltip
      open={open}
      title={tooltipContent}
      placement={placement}
      arrow
      disableHoverListener
      disableFocusListener
      disableTouchListener
      onOpen={handleOpen}
      onClose={handleClose}
      PopperProps={{
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
        ],
      }}
    >
      {wrappedChildren}
    </Tooltip>
  );
};