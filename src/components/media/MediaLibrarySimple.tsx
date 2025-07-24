import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Upload as UploadIcon,
  Folder as FolderIcon
} from '@mui/icons-material';

import {
  useGetMediaFilesQuery,
  useGetMediaFoldersQuery,
  type MediaFile,
  type MediaFolder
} from '../../store/api/mediaApi';

interface MediaLibrarySimpleProps {
  onSelectFiles?: (files: MediaFile[]) => void;
}

export const MediaLibrarySimple: React.FC<MediaLibrarySimpleProps> = () => {
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>();
  
  // API calls
  const { data: foldersData } = useGetMediaFoldersQuery({ parentId: currentFolderId });
  const { 
    data: filesData, 
    isLoading: filesLoading,
    error: filesError 
  } = useGetMediaFilesQuery({
    page: 1,
    limit: 50,
    filters: { folderId: currentFolderId }
  });

  const isUploading = false;


  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (filesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (filesError) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load media files
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Media Library</Typography>
        <Button
          startIcon={<UploadIcon />}
          variant="contained"
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload Files'}
        </Button>
      </Box>

      <Grid container spacing={2}>
        {/* Folders */}
        {foldersData?.folders.map((folder: MediaFolder) => (
          <Grid item xs={12} sm={6} md={3} key={folder.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' }
              }}
              onClick={() => setCurrentFolderId(folder.id)}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FolderIcon color="primary" />
                <Box>
                  <Typography variant="subtitle2">{folder.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {folder.fileCount} files
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Files */}
        {filesData?.files.map((file: MediaFile) => (
          <Grid item xs={12} sm={6} md={3} key={file.id}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" noWrap>
                  {file.originalName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(file.size)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {(!foldersData?.folders.length && !filesData?.files.length) && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            No files or folders found
          </Typography>
        </Box>
      )}
    </Box>
  );
};