import React, { useMemo, useState, useEffect } from 'react';
import { 
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  Button,
  TextField,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
  Tooltip,
  Divider,
  LinearProgress,
} from '@mui/material';
import { 
  CloudUpload,
  UploadFile as UploadFileIcon, 
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  CreateNewFolder,
  Delete as DeleteIcon,
  FileDownload,
  DriveFileMove,
  Description,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  listFolders,
  createFolder,
  deleteFolder,
  listDocuments,
  deleteDocument,
  updateDocument,
} from '../api/documents';

const ROOT_ALL = 'all';
const ROOT_UNCATEGORISED = 'uncategorised';

function Upload() {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [description, setDescription] = useState('');
  const [alert, setAlert] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [folders, setFolders] = useState([]);
  const [allDocuments, setAllDocuments] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(ROOT_ALL);
  const [targetFolderId, setTargetFolderId] = useState(null);
  const [listLoading, setListLoading] = useState(true);

  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [processingDocId, setProcessingDocId] = useState(null);

  const rawApiBase = import.meta.env.VITE_API_URL || '/api';
  const API_BASE_URL = rawApiBase.endsWith('/api')
    ? rawApiBase
    : `${rawApiBase.replace(/\/$/, '')}/api`;

  const refreshFolders = async () => {
    try {
      const data = await listFolders();
      setFolders(data || []);
    } catch (err) {
      setAlert({ type: 'error', text: err.message });
    }
  };

  const refreshDocuments = async () => {
    setListLoading(true);
    try {
      const data = await listDocuments();
      setAllDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      setAlert({ type: 'error', text: err.message });
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    refreshFolders();
    refreshDocuments();
  }, []);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const folderDocumentCounts = useMemo(() => {
    const counts = {};
    if (Array.isArray(allDocuments)) {
      allDocuments.forEach((doc) => {
        if (doc && doc.folder_id) {
          counts[doc.folder_id] = (counts[doc.folder_id] || 0) + 1;
        }
      });
    }
    return counts;
  }, [allDocuments]);

  const uncategorisedCount = useMemo(
    () => Array.isArray(allDocuments) ? allDocuments.filter((doc) => doc && !doc.folder_id).length : 0,
    [allDocuments]
  );

  const documents = useMemo(() => {
    if (!Array.isArray(allDocuments)) {
      return [];
    }
    if (selectedFolder === ROOT_ALL) {
      return allDocuments;
    }
    if (selectedFolder === ROOT_UNCATEGORISED) {
      return allDocuments.filter((doc) => doc && !doc.folder_id);
    }
    return allDocuments.filter((doc) => doc && doc.folder_id === selectedFolder);
  }, [allDocuments, selectedFolder]);

  const enhancedFolders = useMemo(
    () =>
      Array.isArray(folders) 
        ? folders.map((folder) => ({
            ...folder,
            document_count: folderDocumentCounts[folder?.id] || 0,
          }))
        : [],
    [folders, folderDocumentCounts]
  );

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    if (selected && selected.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(selected));
    } else {
      setPreview(null);
    }
  };

  const resetUploadState = () => {
    setFile(null);
    setPreview(null);
    setDescription('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setAlert({ type: 'error', text: 'Please choose a file to upload.' });
      return;
    }

    // Enhanced validation
    const maxSize = 6 * 1024 * 1024; // 6 MB
    if (file.size > maxSize) {
      setAlert({ type: 'error', text: `File size (${(file.size / 1024 / 1024).toFixed(2)} MB) exceeds maximum allowed size of 6 MB.` });
      return;
    }

    if (file.size === 0) {
      setAlert({ type: 'error', text: 'File is empty. Please select a valid file.' });
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setAlert({ type: 'error', text: `File type "${file.type}" not supported. Only PDF, JPG, and PNG files are allowed.` });
      return;
    }

    const token =
      (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('token')) ||
      localStorage.getItem('token');
    if (!token) {
      setAlert({ type: 'error', text: 'You must be logged in to upload documents.' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    if (targetFolderId) {
      formData.append('folder_id', targetFolderId.toString());
    }
      
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate progress for better UX (since fetch doesn't support progress events)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 200);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || data?.message || `Upload failed (${response.status}).`);
      }
      
      setAlert({ type: 'success', text: `${file.name} uploaded successfully!` });
      resetUploadState();
      setUploadProgress(0);
      
      // Refresh after a short delay
      setTimeout(async () => {
        await refreshDocuments();
        await refreshFolders();
      }, 500);
    } catch (err) {
      console.error('Upload error:', err);
      setAlert({ type: 'error', text: err.message || 'Upload failed. Please check your connection and try again.' });
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setAlert({ type: 'error', text: 'Folder name cannot be empty.' });
      return;
    }
    try {
      const folder = await createFolder(newFolderName.trim());
      setAlert({ type: 'success', text: `Folder “${newFolderName}” created.` });
      setNewFolderName('');
      setFolderDialogOpen(false);
      await refreshFolders();
      if (folder?.id) {
        setSelectedFolder(folder.id);
        setTargetFolderId(folder.id);
      }
    } catch (err) {
      setAlert({ type: 'error', text: err.message });
    }
  };

  const handleDeleteFolder = async (folder) => {
    const docCount = folderDocumentCounts[folder.id] || 0;
    
    let confirmMessage = `Are you sure you want to delete the folder "${folder.name}"?`;
    if (docCount > 0) {
      confirmMessage = `This folder contains ${docCount} file(s). Deleting it will move all files to "Uncategorised". Are you sure you want to delete "${folder.name}"?`;
    }
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      // Move all documents in this folder to uncategorised (folder_id = null)
      if (docCount > 0 && Array.isArray(allDocuments)) {
        const docsInFolder = allDocuments.filter((doc) => doc && doc.folder_id === folder.id);
        for (const doc of docsInFolder) {
          try {
            await updateDocument(doc.id, { folder_id: null });
          } catch (err) {
            console.error(`Failed to move document ${doc.id}:`, err);
          }
        }
      }
      
      await deleteFolder(folder.id);
      setAlert({ 
        type: 'success', 
        text: docCount > 0 
          ? `Folder deleted. ${docCount} file(s) moved to Uncategorised.` 
          : 'Folder deleted.' 
      });
      
      if (selectedFolder === folder.id) {
        setSelectedFolder(ROOT_ALL);
      }
      if (targetFolderId === folder.id) {
        setTargetFolderId(null);
      }
      
      await refreshDocuments();
      await refreshFolders();
    } catch (err) {
      setAlert({ type: 'error', text: err.message });
    }
  };

  const handleDeleteDocument = async (documentId) => {
    setProcessingDocId(documentId);
    try {
      await deleteDocument(documentId);
      setAlert({ type: 'success', text: 'Document deleted.' });
      await refreshDocuments();
      await refreshFolders();
    } catch (err) {
      setAlert({ type: 'error', text: err.message });
    } finally {
      setProcessingDocId(null);
    }
  };

  const handleMoveDocument = async (documentId, folderId) => {
    const payload = { folder_id: folderId === null ? null : Number(folderId) };
    try {
      await updateDocument(documentId, payload);
      setAlert({ type: 'success', text: 'Document moved.' });
      await refreshDocuments();
      await refreshFolders();
    } catch (err) {
      setAlert({ type: 'error', text: err.message });
    }
  };

  const renderDocumentIcon = (doc) => {
    if (doc.file_type?.startsWith('image/')) {
      return <ImageIcon />;
    }
    if (doc.file_type === 'application/pdf') {
      return <Description />;
    }
    return <UploadFileIcon />;
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      py: 4,
      background: isDark
        ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)'
        : 'linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 50%, #F8FAFC 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 15s ease infinite',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: isDark
          ? 'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)'
          : 'radial-gradient(circle at 20% 50%, rgba(192, 132, 252, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(244, 114, 182, 0.05) 0%, transparent 50%)',
        pointerEvents: 'none',
        zIndex: 0,
      },
      '@keyframes gradientShift': {
        '0%': { backgroundPosition: '0% 50%' },
        '50%': { backgroundPosition: '100% 50%' },
        '100%': { backgroundPosition: '0% 50%' },
      },
    }}>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ 
              p: 3, 
              borderRadius: 3, 
              mb: 3,
              bgcolor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)',
              border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(226, 232, 240, 0.8)'}`,
            }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography variant="h5" fontWeight="bold">
                  Upload Documents
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Store reports, prescriptions, and important records securely.
                </Typography>
              </Box>

              {alert && alert.type && (
                <Alert 
                  severity={alert.type}
                  sx={{ mb: 2 }}
                  onClose={() => setAlert(null)}
                >
                  {alert.text}
                </Alert>
              )}

              <Box
                component="form"
                onSubmit={handleUpload}
                sx={{ display: 'grid', gap: 2 }}
                >
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<UploadFileIcon />}
                  >
                  Choose File
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                    />
                  </Button>

                {file && (
                  <Card variant="outlined">
                      <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                          icon={renderDocumentIcon({ file_type: file.type })}
                          label={file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                          color="primary"
                        />
                          <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                              {file.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </Typography>
                          </Box>
                        </Box>
                        {preview && (
                        <Box sx={{ mt: 2, borderRadius: 2, overflow: 'hidden' }}>
                          <img src={preview} alt="Preview" style={{ width: '100%', height: 'auto' }} />
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                )}

                <TextField
                  label="Description (optional)"
                  multiline
                  minRows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <FormControl fullWidth>
                  <InputLabel id="folder-select-label">Save to folder</InputLabel>
                  <Select
                    labelId="folder-select-label"
                    value={targetFolderId ?? ''}
                    label="Save to folder"
                    onChange={(e) => {
                      const value = e.target.value;
                      setTargetFolderId(value === '' ? null : value);
                    }}
                  >
                    <MenuItem value="">
                      <em>Uncategorised</em>
                    </MenuItem>
                    {enhancedFolders.map((folder) => (
                      <MenuItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {uploading && (
                  <Box sx={{ width: '100%', mt: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={uploadProgress} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                        }
                      }} 
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textAlign: 'center' }}>
                      {Math.round(uploadProgress)}% uploaded
                    </Typography>
                  </Box>
                )}
                
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={!file || uploading}
                  startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <UploadFileIcon />}
                >
                  {uploading ? 'Uploading…' : 'Upload'}
                </Button>
              </Box>
            </Paper>

            <Paper elevation={3} sx={{ 
              p: 3, 
              borderRadius: 3,
              bgcolor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)',
              border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(226, 232, 240, 0.8)'}`,
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Folders
                </Typography>
                <Tooltip title="Create folder">
                  <IconButton size="small" onClick={() => setFolderDialogOpen(true)}>
                    <CreateNewFolder />
                  </IconButton>
                </Tooltip>
              </Box>

              <List sx={{ maxHeight: 320, overflow: 'auto' }}>
                <ListItem
                  button
                  selected={selectedFolder === ROOT_ALL}
                  onClick={() => {
                    setSelectedFolder(ROOT_ALL);
                    setTargetFolderId(null);
                  }}
                >
                  <ListItemIcon>
                    <FolderOpenIcon color={selectedFolder === ROOT_ALL ? 'primary' : 'inherit'} />
                  </ListItemIcon>
                  <ListItemText primary="All documents" secondary={`${allDocuments.length} files`} />
                </ListItem>

                <ListItem
                  button
                  selected={selectedFolder === ROOT_UNCATEGORISED}
                  onClick={() => {
                    setSelectedFolder(ROOT_UNCATEGORISED);
                    setTargetFolderId(null);
                  }}
                >
                  <ListItemIcon>
                    <FolderIcon color={selectedFolder === ROOT_UNCATEGORISED ? 'primary' : 'inherit'} />
                  </ListItemIcon>
                  <ListItemText primary="Uncategorised" secondary={`${uncategorisedCount} files`} />
                </ListItem>

                {enhancedFolders.map((folder) => (
                  <ListItem
                    key={folder.id}
                    button
                    selected={selectedFolder === folder.id}
                    onClick={() => {
                      setSelectedFolder(folder.id);
                      setTargetFolderId(folder.id);
                    }}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(folder);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemIcon>
                      <FolderIcon color={selectedFolder === folder.id ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={folder.name}
                      secondary={`${folder.document_count} files`}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, minHeight: 520 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Documents
                </Typography>
                <Chip label={`${documents.length} shown`} color="primary" variant="outlined" />
              </Box>
              <Divider sx={{ mb: 2 }} />

              {listLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress />
                </Box>
              ) : documents.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <UploadFileIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No documents yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upload files or choose another folder to see more documents.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'grid', gap: 2 }}>
                  {documents.map((doc) => (
                    <Paper key={doc.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                        <Chip
                          icon={renderDocumentIcon(doc)}
                          label={doc.file_type ? doc.file_type.split('/')[1]?.toUpperCase() : 'FILE'}
                          color="primary"
                          variant="outlined"
                        />
                        <Box sx={{ flex: 1, minWidth: 200 }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {doc.file_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Uploaded {doc.created_at ? new Date(doc.created_at).toLocaleString() : ''}
                            {doc.file_size ? ` • ${(doc.file_size / 1024 / 1024).toFixed(2)} MB` : ''}
                          </Typography>
                          {doc.description && (
                            <Typography variant="body2" color="text.secondary">
                              {doc.description}
                            </Typography>
                          )}
                        </Box>

                        <FormControl size="small" sx={{ minWidth: 160 }}>
                          <InputLabel>Move to</InputLabel>
                          <Select
                            value={doc.folder_id || ''}
                            label="Move to"
                            onChange={(e) => {
                              const value = e.target.value;
                              handleMoveDocument(doc.id, value === '' ? null : value);
                            }}
                            IconComponent={DriveFileMove}
                          >
                            <MenuItem value="">
                              <em>Uncategorised</em>
                            </MenuItem>
                            {enhancedFolders.map((folder) => (
                              <MenuItem key={folder.id} value={folder.id}>
                                {folder.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Download">
                            <IconButton onClick={() => window.open(doc.download_url, '_blank', 'noopener')}>
                              <FileDownload />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteDocument(doc.id)}
                              disabled={processingDocId === doc.id}
                            >
                              {processingDocId === doc.id ? <CircularProgress size={20} /> : <DeleteIcon />}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
            </Paper>
                  ))}
          </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Dialog open={folderDialogOpen} onClose={() => setFolderDialogOpen(false)}>
        <DialogTitle>Create folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder name"
            fullWidth
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFolderDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateFolder} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Upload;
