/**
 * Onboarding Checklist Component
 * 
 * Interactive checklist showing user progress through onboarding steps
 * with quick actions and celebration animations.
 */

import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  IconButton,
  Typography,
  Button,
  Chip,
  Box,
  Collapse,
  LinearProgress,
  Divider,
  Tooltip,
  styled
} from '@mui/material';
import {
  CheckCircle,
  RadioButtonUnchecked,
  PlayArrow,
  ExpandMore,
  ExpandLess,
  AccessTime,
  Star,
  Lightbulb,
  Close,
  Refresh
} from '@mui/icons-material';
import { ProgressRing } from '../ProgressIndicator';
import { useOnboarding } from '../../hooks/useOnboarding';
import {
  OnboardingStep,
  StepCategory,
  FeatureCategory
} from '../../types/onboarding.types';

interface OnboardingChecklistProps {
  isOpen: boolean;
  onClose: () => void;
  onStepAction: (stepId: string) => void;
  onStartTour?: (tourId: string) => void;
}

const ChecklistCard = styled(Card)(({ theme }) => ({
  position: 'fixed',
  top: 80,
  right: 20,
  width: 380,
  maxHeight: 'calc(100vh - 100px)',
  zIndex: theme.zIndex.drawer,
  boxShadow: theme.shadows[12],
  overflow: 'hidden'
}));

const StepListItem = styled(ListItem)<{ 
  completed: boolean;
  category: StepCategory;
}>(({ theme, completed, category }) => ({
  padding: 0,
  
  '& .MuiListItemButton-root': {
    padding: theme.spacing(1.5),
    borderLeft: `4px solid ${
      completed 
        ? theme.palette.success.main
        : category === StepCategory.ESSENTIAL
        ? theme.palette.primary.main
        : category === StepCategory.RECOMMENDED
        ? theme.palette.info.main
        : theme.palette.grey[400]
    }`,
    transition: 'all 0.2s ease',
    
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      transform: 'translateX(4px)'
    }
  }
}));

const CategorySection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2)
}));

const CategoryHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.spacing(0.5),
  cursor: 'pointer',
  
  '&:hover': {
    backgroundColor: theme.palette.grey[100]
  }
}));

const StepActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(0.5),
  alignItems: 'center'
}));

const CompletionCelebration = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(3),
  background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.primary.main})`,
  color: theme.palette.common.white,
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M30 30l15-15v30l-15-15zm0 0l-15 15h30l-15-15z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat',
    animation: 'float 20s infinite linear'
  },
  
  '@keyframes float': {
    '0%': { transform: 'translateX(0) translateY(0)' },
    '100%': { transform: 'translateX(-60px) translateY(-60px)' }
  }
}));

export const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  isOpen,
  onClose,
  onStepAction,
  onStartTour
}) => {
  const {
    availableSteps,
    completedSteps,
    currentStep,
    overallProgress,
    nextSteps,
    completeStep,
    skipStep
  } = useOnboarding();

  const [expandedCategories, setExpandedCategories] = useState<StepCategory[]>([
    StepCategory.ESSENTIAL,
    StepCategory.RECOMMENDED
  ]);

  // Group steps by category
  const stepsByCategory = React.useMemo(() => {
    const grouped = availableSteps.reduce((acc, step) => {
      if (!acc[step.category]) {
        acc[step.category] = [];
      }
      acc[step.category].push(step);
      return acc;
    }, {} as Record<StepCategory, OnboardingStep[]>);

    // Sort steps within each category
    Object.keys(grouped).forEach(category => {
      grouped[category as StepCategory].sort((a, b) => a.order - b.order);
    });

    return grouped;
  }, [availableSteps]);

  const getCategoryIcon = (category: StepCategory) => {
    switch (category) {
      case StepCategory.ESSENTIAL:
        return <Star color="primary" />;
      case StepCategory.RECOMMENDED:
        return <Lightbulb color="info" />;
      case StepCategory.ADVANCED:
        return <PlayArrow color="secondary" />;
      default:
        return <RadioButtonUnchecked />;
    }
  };

  const getCategoryColor = (category: StepCategory) => {
    switch (category) {
      case StepCategory.ESSENTIAL:
        return 'primary';
      case StepCategory.RECOMMENDED:
        return 'info';
      case StepCategory.ADVANCED:
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getCategoryProgress = (category: StepCategory) => {
    const categorySteps = stepsByCategory[category] || [];
    const completedCount = categorySteps.filter(step => step.completed).length;
    return categorySteps.length > 0 ? (completedCount / categorySteps.length) * 100 : 0;
  };

  const toggleCategory = (category: StepCategory) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleStepAction = async (step: OnboardingStep) => {
    if (step.completed) return;

    try {
      await completeStep(step.id);
      onStepAction(step.id);
    } catch (error) {
      console.error('Failed to complete step:', error);
    }
  };

  const handleSkipStep = async (step: OnboardingStep) => {
    try {
      await skipStep(step.id, 'user_skipped_from_checklist');
    } catch (error) {
      console.error('Failed to skip step:', error);
    }
  };

  const isStepAvailable = (step: OnboardingStep) => {
    if (!step.dependencies) return true;
    return step.dependencies.every(depId =>
      completedSteps.some(completed => completed.id === depId)
    );
  };

  const isComplete = overallProgress >= 100;

  if (!isOpen) return null;

  return (
    <ChecklistCard>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={2}>
            <ProgressRing
              progress={overallProgress}
              size={40}
              strokeWidth={4}
              showLabel={false}
            />
            <Box>
              <Typography variant="h6">
                Getting Started
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {completedSteps.length} of {availableSteps.length} steps completed
              </Typography>
            </Box>
          </Box>
        }
        action={
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        }
        sx={{ pb: 1 }}
      />

      <LinearProgress
        variant="determinate"
        value={overallProgress}
        sx={{ height: 4 }}
      />

      <CardContent sx={{ p: 0, maxHeight: 'calc(100vh - 240px)', overflow: 'auto' }}>
        {isComplete ? (
          <CompletionCelebration>
            <Typography variant="h5" gutterBottom>
              🎉 Congratulations!
            </Typography>
            <Typography variant="body1" paragraph>
              You've completed your onboarding journey. You're ready to create amazing content!
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => onStartTour?.('advanced_features')}
            >
              Explore Advanced Features
            </Button>
          </CompletionCelebration>
        ) : (
          <>
            {/* Next Steps Section */}
            {nextSteps.length > 0 && (
              <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                <Typography variant="subtitle1" gutterBottom>
                  Up Next
                </Typography>
                <Typography variant="body2" paragraph>
                  {nextSteps[0].title}
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  color="secondary"
                  onClick={() => handleStepAction(nextSteps[0])}
                >
                  Start Now
                </Button>
              </Box>
            )}

            {/* Steps by Category */}
            {Object.entries(stepsByCategory).map(([category, steps]) => {
              const typedCategory = category as StepCategory;
              const isExpanded = expandedCategories.includes(typedCategory);
              const progress = getCategoryProgress(typedCategory);
              
              return (
                <CategorySection key={category}>
                  <CategoryHeader onClick={() => toggleCategory(typedCategory)}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getCategoryIcon(typedCategory)}
                      <Typography variant="subtitle2" fontWeight="bold">
                        {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                      </Typography>
                      <Chip
                        label={`${steps.filter(s => s.completed).length}/${steps.length}`}
                        size="small"
                        color={getCategoryColor(typedCategory) as any}
                        variant="outlined"
                      />
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{ width: 60, height: 4 }}
                      />
                      {isExpanded ? <ExpandLess /> : <ExpandMore />}
                    </Box>
                  </CategoryHeader>

                  <Collapse in={isExpanded}>
                    <List dense>
                      {steps.map((step) => {
                        const available = isStepAvailable(step);
                        
                        return (
                          <StepListItem
                            key={step.id}
                            completed={step.completed}
                            category={step.category}
                          >
                            <ListItemButton
                              disabled={!available || step.completed}
                              onClick={() => available && handleStepAction(step)}
                            >
                              <ListItemIcon>
                                {step.completed ? (
                                  <CheckCircle color="success" />
                                ) : available ? (
                                  <RadioButtonUnchecked color="action" />
                                ) : (
                                  <RadioButtonUnchecked color="disabled" />
                                )}
                              </ListItemIcon>

                              <ListItemText
                                primary={step.title}
                                secondary={
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">
                                      {step.description}
                                    </Typography>
                                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                      <Chip
                                        icon={<AccessTime fontSize="small" />}
                                        label={`${step.estimatedMinutes}m`}
                                        size="small"
                                        variant="outlined"
                                      />
                                      {step.features?.map(feature => (
                                        <Chip
                                          key={feature}
                                          label={feature.replace('_', ' ')}
                                          size="small"
                                          variant="outlined"
                                          color="primary"
                                        />
                                      ))}
                                    </Box>
                                  </Box>
                                }
                              />

                              <ListItemSecondaryAction>
                                <StepActions>
                                  {!step.completed && available && (
                                    <>
                                      <Tooltip title="Skip this step">
                                        <IconButton
                                          size="small"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleSkipStep(step);
                                          }}
                                        >
                                          <Close fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title={step.actionRequired}>
                                        <IconButton
                                          size="small"
                                          color="primary"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleStepAction(step);
                                          }}
                                        >
                                          <PlayArrow fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </>
                                  )}
                                </StepActions>
                              </ListItemSecondaryAction>
                            </ListItemButton>
                          </StepListItem>
                        );
                      })}
                    </List>
                  </Collapse>
                  
                  {Object.keys(stepsByCategory).indexOf(category) < Object.keys(stepsByCategory).length - 1 && (
                    <Divider sx={{ my: 1 }} />
                  )}
                </CategorySection>
              );
            })}
          </>
        )}
      </CardContent>
    </ChecklistCard>
  );
};