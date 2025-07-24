import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  IconButton,
  Chip,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid
} from '@mui/material';
import {
  Translate as TranslateIcon,
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Language as LanguageIcon,
  AutoAwesome as AIIcon,
  Public as GlobalIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { useTenant } from '../../contexts/TenantContext';
import { 
  useTranslateContentMutation, 
  useLocalizeContentMutation,
  useDetectLanguageMutation
} from '../../store/api/aiContentApi';

interface TranslationDialogProps {
  open: boolean;
  onClose: () => void;
  initialContent?: string;
  onTranslationComplete?: (translatedContent: string, language: string) => void;
}

export const TranslationDialog: React.FC<TranslationDialogProps> = ({
  open,
  onClose,
  initialContent = '',
  onTranslationComplete
}) => {
  const [originalText, setOriginalText] = useState(initialContent);
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [targetMarket, setTargetMarket] = useState('');
  const [translatedContent, setTranslatedContent] = useState('');
  const [localizationMode, setLocalizationMode] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const [culturalNotes, setCulturalNotes] = useState<string[]>([]);
  
  const { currentWorkspace } = useTenant();
  
  // API hooks
  const [translateContent, { isLoading: isTranslating }] = useTranslateContentMutation();
  const [localizeContent, { isLoading: isLocalizing }] = useLocalizeContentMutation();
  const [detectLanguage, { isLoading: isDetecting }] = useDetectLanguageMutation();

  const popularLanguages = [
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' }
  ];

  const marketOptions = [
    'United States', 'Mexico', 'Spain', 'France', 'Germany', 'Italy', 
    'Brazil', 'Japan', 'South Korea', 'China', 'India', 'United Kingdom'
  ];

  const handleDetectLanguage = async () => {
    if (!originalText.trim()) return;

    try {
      const result = await detectLanguage({ text: originalText }).unwrap();
      setDetectedLanguage(result.language);
    } catch (error) {
      console.error('Language detection failed:', error);
    }
  };

  const handleTranslate = async () => {
    if (!originalText.trim() || !currentWorkspace) return;

    try {
      if (localizationMode && targetMarket) {
        // Use localization for market-specific adaptation
        const result = await localizeContent({
          content: originalText,
          targetLanguage,
          targetMarket,
          workspaceId: currentWorkspace.id
        }).unwrap();
        
        setTranslatedContent(result.translatedContent);
        setCulturalNotes(result.culturalNotes);
      } else {
        // Use basic translation
        const result = await translateContent({
          content: originalText,
          targetLanguage,
          workspaceId: currentWorkspace.id,
          sourceLanguage: detectedLanguage || undefined
        }).unwrap();
        
        setTranslatedContent(result.translatedText);
        setCulturalNotes([]);
      }
    } catch (error) {
      console.error('Translation failed:', error);
    }
  };

  const handleCopyTranslation = () => {
    navigator.clipboard.writeText(translatedContent);
  };

  const handleUseTranslation = () => {
    if (translatedContent && onTranslationComplete) {
      const selectedLang = popularLanguages.find(l => l.code === targetLanguage);
      onTranslationComplete(translatedContent, selectedLang?.name || targetLanguage);
    }
    onClose();
  };

  const handleClose = () => {
    setOriginalText('');
    setTranslatedContent('');
    setDetectedLanguage('');
    setCulturalNotes([]);
    onClose();
  };

  const isProcessing = isTranslating || isLocalizing || isDetecting;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { minHeight: '70vh' } }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TranslateIcon color="primary" />
            <Typography variant="h6">AI Translation & Localization</Typography>
          </Box>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Translate and localize your content for global audiences
        </Typography>
      </DialogTitle>

      <DialogContent>
        {/* Current Workspace Context */}
        {currentWorkspace && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
            <Typography variant="subtitle2" gutterBottom>
              Translating for: {currentWorkspace.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip 
                label={currentWorkspace.branding.toneOfVoice}
                size="small"
                variant="outlined"
              />
              {currentWorkspace.client.industry && (
                <Chip 
                  label={currentWorkspace.client.industry}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </Paper>
        )}

        {/* Original Content Input */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">Original Content</Typography>
              <Button
                size="small"
                startIcon={<LanguageIcon />}
                onClick={handleDetectLanguage}
                disabled={!originalText.trim() || isDetecting}
              >
                Detect Language
              </Button>
            </Box>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              placeholder="Enter the content you want to translate..."
              variant="outlined"
            />
            
            {detectedLanguage && (
              <Box sx={{ mt: 1 }}>
                <Chip 
                  label={`Detected: ${detectedLanguage.toUpperCase()}`}
                  size="small"
                  color="primary"
                  icon={<CheckIcon />}
                />
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Translation Settings */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Translation Settings
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Target Language</InputLabel>
                  <Select
                    value={targetLanguage}
                    label="Target Language"
                    onChange={(e) => setTargetLanguage(e.target.value)}
                  >
                    {popularLanguages.map((lang) => (
                      <MenuItem key={lang.code} value={lang.code}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="body2">Localization Mode</Typography>
                  <Chip
                    label={localizationMode ? 'ON' : 'OFF'}
                    size="small"
                    color={localizationMode ? 'primary' : 'default'}
                    onClick={() => setLocalizationMode(!localizationMode)}
                    clickable
                  />
                </Box>
                
                {localizationMode && (
                  <FormControl fullWidth>
                    <InputLabel>Target Market</InputLabel>
                    <Select
                      value={targetMarket}
                      label="Target Market"
                      onChange={(e) => setTargetMarket(e.target.value)}
                    >
                      {marketOptions.map((market) => (
                        <MenuItem key={market} value={market}>
                          {market}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Grid>
            </Grid>

            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<AIIcon />}
                onClick={handleTranslate}
                disabled={!originalText.trim() || isProcessing || !currentWorkspace}
                fullWidth
              >
                {localizationMode ? 'Translate & Localize' : 'Translate'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Processing State */}
        {isProcessing && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ textAlign: 'center' }}>
                <AIIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {localizationMode ? 'AI Localizing Content...' : 'AI Translating...'}
                </Typography>
                <LinearProgress sx={{ mb: 2 }} />
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <TranslateIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Converting to target language..." />
                  </ListItem>
                  {localizationMode && (
                    <ListItem>
                      <ListItemIcon>
                        <GlobalIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Adapting for local market..." />
                    </ListItem>
                  )}
                  <ListItem>
                    <ListItemIcon>
                      <AIIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Maintaining brand voice..." />
                  </ListItem>
                </List>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Translated Content */}
        {translatedContent && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">
                  Translated Content ({popularLanguages.find(l => l.code === targetLanguage)?.name})
                </Typography>
                <IconButton onClick={handleCopyTranslation}>
                  <CopyIcon />
                </IconButton>
              </Box>
              
              <TextField
                fullWidth
                multiline
                rows={6}
                value={translatedContent}
                onChange={(e) => setTranslatedContent(e.target.value)}
                variant="outlined"
              />
              
              {culturalNotes.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Cultural Notes:
                  </Typography>
                  {culturalNotes.map((note, index) => (
                    <Alert key={index} severity="info" sx={{ mb: 1 }}>
                      {note}
                    </Alert>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        {translatedContent && (
          <Button
            variant="contained"
            onClick={handleUseTranslation}
            startIcon={<CheckIcon />}
          >
            Use Translation
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};