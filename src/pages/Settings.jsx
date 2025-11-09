import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Avatar,
  Paper,
} from '@mui/material';
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  FileDownload as FileIcon,
  Help as HelpIcon,
  Feedback as FeedbackIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Close as CloseIcon,
  PhotoCamera as PhotoCameraIcon,
  AccountCircle as AccountCircleIcon,
  Visibility as VisibilityIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Description as DescriptionIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import BackButton from '../components/BackButton';
import * as authApi from '../api/auth';
import * as documentsApi from '../api/documents';

function Settings() {
  const { user, updateUser, logout } = useAuth();
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [feedbackDialog, setFeedbackDialog] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    age: user?.age || '',
    gender: user?.gender || '',
    medical_history: user?.medical_history || '',
    photo_url: user?.photo_url || '',
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [savingHistory, setSavingHistory] = useState(false);
  const medicalHistoryTimeoutRef = useRef(null);

  // Sync profileData when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        age: user.age || '',
        gender: user.gender || '',
        medical_history: user.medical_history || '',
        photo_url: user.photo_url || '',
      });
    }
  }, [user]);

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [feedbackData, setFeedbackData] = useState({
    subject: '',
    message: '',
  });

  // Documents state
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);

  // Auto-save medical history after user stops typing for 2 seconds
  useEffect(() => {
    if (medicalHistoryTimeoutRef.current) {
      clearTimeout(medicalHistoryTimeoutRef.current);
    }

    // Only auto-save if medical_history has changed from initial value
    if (profileData.medical_history !== (user?.medical_history || '')) {
      medicalHistoryTimeoutRef.current = setTimeout(async () => {
        setSavingHistory(true);
        try {
          await authApi.updateProfile({
            medical_history: profileData.medical_history || undefined,
          });
          updateUser({ ...user, medical_history: profileData.medical_history });
        } catch (err) {
          // Silent fail for auto-save
        } finally {
          setSavingHistory(false);
        }
      }, 2000); // 2 second debounce
    }

    return () => {
      if (medicalHistoryTimeoutRef.current) {
        clearTimeout(medicalHistoryTimeoutRef.current);
      }
    };
  }, [profileData.medical_history]);

  // Fetch documents when Documents tab is selected
  useEffect(() => {
    if (tab === 1) {
      fetchDocuments();
    }
  }, [tab]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const updated = await authApi.updateProfile({
        phone: profileData.phone || undefined,
        age: profileData.age ? parseInt(profileData.age) : undefined,
        gender: profileData.gender || undefined,
        medical_history: profileData.medical_history || undefined,
        email: profileData.email || undefined,
        photo_url: profileData.photo_url || undefined,
      });
      setProfileData((prev) => ({ ...prev, ...updated }));
      setMessage({ type: 'success', text: 'Profile updated successfully! You can now login with your new email.' });
      
      // Update user context and storage
      const updatedUser = { ...user, ...updated };
      updateUser(updatedUser);
      
      // Also update email in storage for login
      if (updated.email) {
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size must be less than 5MB' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('token')) || localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('isProfilePhoto', 'true');

      const rawApiBase = import.meta.env.VITE_API_URL || '/api';
      const API_BASE_URL = rawApiBase.endsWith('/api')
        ? rawApiBase
        : `${rawApiBase.replace(/\/$/, '')}/api`;

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload photo');
      }

      const result = await response.json();
      setProfileData(prev => ({ ...prev, photo_url: result.downloadURL }));
      setMessage({ type: 'success', text: 'Profile photo updated successfully!' });
      
      // Update user context
      if (updateUser) {
        updateUser({ ...user, photo_url: result.downloadURL });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const fetchDocuments = async () => {
    setDocumentsLoading(true);
    try {
      const docs = await documentsApi.listDocuments();
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load documents' });
      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const handleViewDocument = async (doc) => {
    setPreviewDocument(doc);
    setPreviewDialog(true);
    setPreviewLoading(true);
    setPreviewError(null);

    // Check if file is image or PDF
    const mimeType = doc.mime_type || doc.mime || '';
    const isImage = mimeType.startsWith('image/');
    const isPdf = mimeType === 'application/pdf' || doc.file_name?.toLowerCase().endsWith('.pdf');

    if (isImage || isPdf) {
      // For images and PDFs, we can preview directly
      setPreviewLoading(false);
    } else {
      // For other types, show download option
      setPreviewLoading(false);
    }
  };

  const handleClosePreview = () => {
    setPreviewDialog(false);
    setPreviewDocument(null);
    setPreviewError(null);
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await documentsApi.deleteDocument(docId);
      setMessage({ type: 'success', text: 'Document deleted successfully' });
      fetchDocuments(); // Refresh list
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete document' });
    }
  };

  const handleDownloadDocument = (doc) => {
    const url = doc.download_url || doc.file_url || doc.url;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      setMessage({ type: 'error', text: 'Download URL not available' });
    }
  };

  const getFileIcon = (doc) => {
    const mimeType = doc.mime_type || doc.mime || '';
    const fileName = doc.file_name || '';
    
    if (mimeType.startsWith('image/')) {
      return <ImageIcon />;
    } else if (mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
      return <PdfIcon />;
    } else {
      return <DescriptionIcon />;
    }
  };

  const handleSendFeedback = async () => {
    if (!feedbackData.subject || !feedbackData.message) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would send to backend
      const emailBody = `
From: ${user?.email}
Subject: ${feedbackData.subject}

${feedbackData.message}
      `;
      
      // For now, just show success
      setMessage({ type: 'success', text: 'Feedback sent successfully!' });
      setFeedbackData({ subject: '', message: '' });
      setFeedbackDialog(false);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to send feedback' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      p: 3, 
      maxWidth: 1000, 
      mx: 'auto',
      minHeight: '100vh',
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
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <BackButton />
          <Typography variant="h4" fontWeight="bold" sx={{ 
            color: isDark ? '#F1F5F9' : '#111827',
          }}>
            Settings
          </Typography>
        </Box>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      {/* Tabs */}
      <Card sx={{ 
        mb: 3,
        bgcolor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(226, 232, 240, 0.8)'}`,
      }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="👤 Profile" icon={<PersonIcon />} iconPosition="start" />
          <Tab label="📄 Documents" icon={<FileIcon />} iconPosition="start" />
          <Tab label="❓ Help & Support" icon={<HelpIcon />} iconPosition="start" />
          <Tab label="💬 Feedback" icon={<FeedbackIcon />} iconPosition="start" />
        </Tabs>

        <CardContent>
          {/* Profile Tab */}
          {tab === 0 && (
            <Box>
              {/* Profile Photo */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar 
                    src={profileData.photo_url || user?.photo_url}
                    sx={{ 
                      width: 120, 
                      height: 120,
                      fontSize: '3rem',
                      bgcolor: 'primary.main'
                    }}
                  >
                    {profileData.name?.charAt(0).toUpperCase() || <AccountCircleIcon sx={{ fontSize: 80 }} />}
                  </Avatar>
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                      width: 40,
                      height: 40
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? <CircularProgress size={20} color="inherit" /> : <PhotoCameraIcon fontSize="small" />}
                  </IconButton>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handlePhotoUpload}
                  />
                </Box>
              </Box>
              
              <Typography variant="h6" sx={{ mb: 2 }}>
                Edit Profile
              </Typography>
              <Box sx={{ display: 'grid', gap: 2 }}>
                <TextField
                  label="Full Name"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  fullWidth
                  disabled
                  helperText="Name cannot be changed"
                />
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  fullWidth
                  helperText="You can change your email address"
                />
                <TextField
                  label="Phone Number"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  fullWidth
                  placeholder="+91 9997181525"
                />
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <TextField
                    label="Age"
                    name="age"
                    type="number"
                    value={profileData.age}
                    onChange={handleProfileChange}
                    inputProps={{ min: 1, max: 120 }}
                  />
                  <TextField
                    label="Gender"
                    name="gender"
                    select
                    value={profileData.gender}
                    onChange={handleProfileChange}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </TextField>
                </Box>
                <Box sx={{ position: 'relative' }}>
                  <TextField
                    label="Medical History"
                    name="medical_history"
                    value={profileData.medical_history}
                    onChange={handleProfileChange}
                    multiline
                    rows={4}
                    placeholder="Any chronic conditions, allergies, ongoing treatments..."
                    helperText={savingHistory ? 'Saving...' : 'Changes are saved automatically'}
                  />
                  {savingHistory && (
                    <CircularProgress 
                      size={20} 
                      sx={{ 
                        position: 'absolute', 
                        right: 8, 
                        top: 8 
                      }} 
                    />
                  )}
                </Box>
                <Button
                  variant="contained"
                  onClick={handleSaveProfile}
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
              </Box>
            </Box>
          )}

          {/* Documents Tab */}
          {tab === 1 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                My Documents
              </Typography>
              
              {documentsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : documents.length === 0 ? (
                <Card variant="outlined" sx={{ p: 3, textAlign: 'center', bgcolor: 'action.hover' }}>
                  <Typography color="textSecondary" sx={{ mb: 2 }}>
                    📁 No documents uploaded yet
                  </Typography>
                  <Button 
                    variant="contained"
                    onClick={() => window.location.href = '/upload'}
                  >
                    Upload Document
                  </Button>
                </Card>
              ) : (
                <>
                  <List>
                    {documents.map((doc) => {
                      const mimeType = doc.mime_type || doc.mime || '';
                      const isImage = mimeType.startsWith('image/');
                      const isPdf = mimeType === 'application/pdf' || doc.file_name?.toLowerCase().endsWith('.pdf');
                      const canPreview = isImage || isPdf;
                      
                      return (
                        <ListItem
                          key={doc.id}
                          secondaryAction={
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton
                                edge="end"
                                color="primary"
                                size="small"
                                onClick={() => handleViewDocument(doc)}
                                title={canPreview ? 'Preview' : 'View/Download'}
                                sx={{ mr: 1 }}
                              >
                                <VisibilityIcon />
                              </IconButton>
                              <IconButton
                                edge="end"
                                color="error"
                                size="small"
                                onClick={() => handleDeleteDocument(doc.id)}
                                title="Delete"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          }
                        >
                          <ListItemIcon>
                            {getFileIcon(doc)}
                          </ListItemIcon>
                          <ListItemText
                            primary={doc.file_name || doc.name || 'Document'}
                            secondary={
                              <>
                                {doc.created_at 
                                  ? new Date(doc.created_at).toLocaleDateString() 
                                  : doc.uploaded_at 
                                    ? new Date(doc.uploaded_at).toLocaleDateString()
                                    : 'N/A'}
                                {doc.file_size && ` • ${(doc.file_size / 1024 / 1024).toFixed(2)} MB`}
                              </>
                            }
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                </>
              )}
            </Box>
          )}

          {/* Help & Support Tab */}
          {tab === 2 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Help & Support
              </Typography>
              <Box sx={{ display: 'grid', gap: 3 }}>
                {/* Contact Information */}
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <EmailIcon color="primary" sx={{ fontSize: 30 }} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight="600">
                        Email Support
                      </Typography>
                      <Typography variant="body2" color="primary">
                        aadipandey223@gmail.com
                      </Typography>
                    </Box>
                  </Box>
                </Card>

                <Card variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <PhoneIcon color="primary" sx={{ fontSize: 30 }} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight="600">
                        Phone Support
                      </Typography>
                      <Typography variant="body2" color="primary">
                        +91 9997181525
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Monday - Friday, 9 AM - 6 PM IST
                      </Typography>
                    </Box>
                  </Box>
                </Card>

                {/* FAQ */}
                <Box>
                  <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 2 }}>
                    Frequently Asked Questions
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="How do I update my profile?"
                        secondary="Go to Settings > Profile to update your information"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="How do I upload documents?"
                        secondary="Go to Documents tab and click Upload Document"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Is my data secure?"
                        secondary="Yes, all your data is encrypted and stored securely"
                      />
                    </ListItem>
                  </List>
                </Box>
              </Box>
            </Box>
          )}

          {/* Feedback Tab */}
          {tab === 3 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Send Us Your Feedback
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                We'd love to hear your thoughts and suggestions to improve Medicare Portal
              </Typography>
              <Button
                variant="contained"
                startIcon={<FeedbackIcon />}
                onClick={() => setFeedbackDialog(true)}
              >
                Send Feedback
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Document Preview Dialog */}
      <Dialog 
        open={previewDialog} 
        onClose={handleClosePreview} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: isDark ? '#1E293B' : '#FFFFFF',
            maxHeight: '90vh',
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {previewDocument?.file_name || 'Document Preview'}
          </Typography>
          <IconButton onClick={handleClosePreview} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {previewLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : previewError ? (
            <Alert severity="error">{previewError}</Alert>
          ) : previewDocument ? (
            <Box>
              {(() => {
                const mimeType = previewDocument.mime_type || previewDocument.mime || '';
                const isImage = mimeType.startsWith('image/');
                const isPdf = mimeType === 'application/pdf' || previewDocument.file_name?.toLowerCase().endsWith('.pdf');
                const url = previewDocument.download_url || previewDocument.file_url || previewDocument.url;

                if (isImage && url) {
                  return (
                    <Box sx={{ textAlign: 'center' }}>
                      <img 
                        src={url} 
                        alt={previewDocument.file_name}
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '70vh',
                          objectFit: 'contain',
                          borderRadius: 8,
                        }}
                        onError={() => setPreviewError('Failed to load image')}
                      />
                    </Box>
                  );
                } else if (isPdf && url) {
                  return (
                    <Box sx={{ width: '100%', height: '70vh' }}>
                      <iframe
                        src={url}
                        style={{
                          width: '100%',
                          height: '100%',
                          border: 'none',
                          borderRadius: 8,
                        }}
                        title={previewDocument.file_name}
                      />
                    </Box>
                  );
                } else {
                  return (
                    <Box sx={{ textAlign: 'center', p: 4 }}>
                      <DescriptionIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Preview not available
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        This file type cannot be previewed. Please download to view.
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownloadDocument(previewDocument)}
                      >
                        Download File
                      </Button>
                    </Box>
                  );
                }
              })()}
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          {previewDocument && (
            <Button
              startIcon={<DownloadIcon />}
              onClick={() => handleDownloadDocument(previewDocument)}
            >
              Download
            </Button>
          )}
          <Button onClick={handleClosePreview}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialog} onClose={() => setFeedbackDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Send Feedback
          <Button
            onClick={() => setFeedbackDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
            size="small"
          >
            <CloseIcon />
          </Button>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, mt: 2 }}>
            <TextField
              label="Subject"
              value={feedbackData.subject}
              onChange={(e) => setFeedbackData(prev => ({ ...prev, subject: e.target.value }))}
              fullWidth
              placeholder="e.g., Feature request, Bug report, etc."
            />
            <TextField
              label="Your Feedback"
              value={feedbackData.message}
              onChange={(e) => setFeedbackData(prev => ({ ...prev, message: e.target.value }))}
              multiline
              rows={5}
              fullWidth
              placeholder="Please describe your feedback in detail..."
            />
            <Typography variant="caption" color="textSecondary">
              Your feedback will be sent to: <strong>aadipandey223@gmail.com</strong>
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSendFeedback}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Send Feedback'}
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </Box>
  );
}

export default Settings;
