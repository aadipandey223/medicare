import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Container, Paper, Button, Card, CardContent,
  Grid, CircularProgress, Alert, Chip, Fade, Zoom,
  Avatar, IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, List, ListItem, ListItemText, ListItemIcon, Stack
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Refresh,
  AccessTime,
  Visibility,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';
import { apiRequest } from '../../api/api';

function PatientRequests() {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileConsultationId, setProfileConsultationId] = useState(null);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(() => {
      fetchRequests(true);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async (silent = false) => {
    if (!silent) setLoading(true);
    
    try {
      const data = await apiRequest('/doctor/requests');
      setRequests(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError(err.message);
      if (err.message.includes('Session expired') || err.message.includes('Not authenticated')) {
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (consultationId) => {
    setProcessingId(consultationId);
    try {
      await apiRequest(`/consultation/${consultationId}/accept`, { method: 'POST' });
      fetchRequests();
      setTimeout(() => setProcessingId(null), 1000);
      navigate('/doctor/consultations');
    } catch (err) {
      alert(err.message);
      setProcessingId(null);
    }
  };

  const handleReject = async (consultationId) => {
    if (!window.confirm('Are you sure you want to reject this consultation request?')) {
      return;
    }

    setProcessingId(consultationId);
    try {
      await apiRequest(`/consultation/${consultationId}/reject`, { method: 'POST' });
      fetchRequests();
      setTimeout(() => setProcessingId(null), 1000);
    } catch (err) {
      alert(err.message);
      setProcessingId(null);
    }
  };

  const handleViewProfile = async (consultationId) => {
    setProfileConsultationId(consultationId);
    setProfileOpen(true);
    setProfileLoading(true);
    setProfileError('');
    setProfileData(null);

    try {
      const data = await apiRequest(`/consultation/${consultationId}/patient_profile`);
      setProfileData(data);
      setProfileError('');
    } catch (err) {
      setProfileError(err.message || 'Failed to load profile');
    } finally {
      setProfileLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <Box sx={{ bgcolor: isDark ? '#0F172A' : '#FAFAFA', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Fade in timeout={800}>
          <Box sx={{ mb: 6 }}>
            <Typography variant="h3" fontWeight="600" sx={{ color: isDark ? '#F1F5F9' : '#111827', mb: 1 }}>
              Patient Requests
            </Typography>
            <Typography variant="body1" sx={{ color: isDark ? '#94A3B8' : '#6B7280' }}>
              Review and respond to consultation requests
            </Typography>
          </Box>
        </Fade>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {requests.length === 0 ? (
          <Fade in timeout={600}>
            <Paper 
              sx={{ 
                p: 16, 
                textAlign: 'center',
                borderRadius: 3,
                border: `1px solid ${isDark ? 'rgba(30, 41, 59, 0.8)' : '#E5E7EB'}`,
                bgcolor: isDark ? '#1E293B' : '#FFFFFF',
                boxShadow: 'none'
              }}
            >
              <Box sx={{ 
                display: 'inline-flex', 
                p: 8, 
                bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : '#F3F4F6', 
                borderRadius: '50%', 
                mb: 3 
              }}>
                <PersonIcon sx={{ fontSize: 48, color: isDark ? '#475569' : '#D1D5DB' }} />
              </Box>
              <Typography variant="h4" fontWeight="600" sx={{ color: isDark ? '#F1F5F9' : '#111827', mb: 1 }}>
                No Pending Requests
              </Typography>
              <Typography variant="body1" sx={{ color: isDark ? '#94A3B8' : '#6B7280', maxWidth: 448, mx: 'auto' }}>
                New consultation requests will appear here
              </Typography>
            </Paper>
          </Fade>
        ) : (
          <Grid container spacing={3}>
            {requests.map((request, index) => (
              <Grid item xs={12} md={6} key={request.id}>
                <Zoom in timeout={400 + (index * 100)}>
                  <Card 
                    sx={{ 
                      borderRadius: 3, 
                      border: `1px solid ${isDark ? 'rgba(30, 41, 59, 0.8)' : '#E5E7EB'}`,
                      boxShadow: 'none',
                      bgcolor: isDark ? '#1E293B' : '#FFFFFF',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        boxShadow: isDark ? '0 12px 24px rgba(0,0,0,0.3)' : '0 12px 24px rgba(0,0,0,0.08)',
                        borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#D1D5DB',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar 
                          src={request.patient_photo_url}
                          sx={{ 
                            width: 56, 
                            height: 56, 
                            bgcolor: isDark ? '#475569' : '#E5E7EB',
                            mr: 2,
                            fontSize: '1.5rem',
                            fontWeight: '600',
                            color: isDark ? '#F1F5F9' : '#374151'
                          }}
                        >
                          {request.patient_name?.charAt(0) || 'P'}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight="600" sx={{ color: isDark ? '#F1F5F9' : '#111827' }}>
                            {request.patient_name || 'Unknown Patient'}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <AccessTime sx={{ fontSize: 14, color: isDark ? '#64748B' : '#9CA3AF' }} />
                            <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#6B7280' }}>
                              {getTimeAgo(request.created_at)}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip 
                          label="Pending" 
                          size="small"
                          sx={{ 
                            bgcolor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7',
                            color: isDark ? '#FBBF24' : '#92400E',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}
                        />
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ color: isDark ? '#94A3B8' : '#6B7280', mb: 1 }}>
                          <strong>Age:</strong> {request.patient_age || 'N/A'} | <strong>Gender:</strong> {request.patient_gender || 'N/A'}
                        </Typography>
                        {request.document_count > 0 && (
                          <Chip
                            label={`${request.document_count} document${request.document_count > 1 ? 's' : ''} shared`}
                            size="small"
                            sx={{ 
                              bgcolor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#EFF6FF',
                              color: isDark ? '#60A5FA' : '#1E40AF',
                              fontWeight: 600,
                              fontSize: '0.75rem'
                            }}
                          />
                        )}
                      </Box>

                      {request.primary_symptoms && (
                        <Box sx={{ mb: 2, p: 2, bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : '#F9FAFB', borderRadius: 2, border: `1px solid ${isDark ? 'rgba(30, 41, 59, 0.8)' : '#E5E7EB'}` }}>
                          <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ color: isDark ? '#F1F5F9' : '#111827', mb: 0.5 }}>
                            Primary Symptoms:
                          </Typography>
                          <Typography variant="body2" sx={{ color: isDark ? '#94A3B8' : '#6B7280' }}>
                            {request.primary_symptoms}
                          </Typography>
                        </Box>
                      )}

                      {request.llm_summary && (
                        <Box sx={{ mb: 2, p: 2, bgcolor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF', borderRadius: 2, border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : '#BFDBFE'}` }}>
                          <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ color: isDark ? '#60A5FA' : '#1E40AF', mb: 0.5 }}>
                            AI Summary:
                          </Typography>
                          <Typography variant="body2" sx={{ color: isDark ? '#94A3B8' : '#1E3A8A' }}>
                            {request.llm_summary}
                          </Typography>
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', gap: 1.5, mt: 3, flexWrap: 'wrap' }}>
                        <Button
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={() => handleViewProfile(request.id)}
                          fullWidth
                          sx={{
                            py: 1.5,
                            borderRadius: 2,
                            border: `1px solid ${isDark ? 'rgba(30, 41, 59, 0.8)' : '#E5E7EB'}`,
                            color: isDark ? '#F1F5F9' : '#374151',
                            fontWeight: 500,
                            textTransform: 'none',
                            '&:hover': {
                              borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#D1D5DB',
                              bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : '#F9FAFB'
                            }
                          }}
                        >
                          View Profile
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={processingId === request.id ? <CircularProgress size={16} /> : <CheckIcon />}
                          onClick={() => handleAccept(request.id)}
                          disabled={processingId === request.id}
                          fullWidth
                          sx={{
                            py: 1.5,
                            borderRadius: 2,
                            bgcolor: isDark ? '#3B82F6' : '#111827',
                            color: 'white',
                            fontWeight: 500,
                            textTransform: 'none',
                            '&:hover': {
                              bgcolor: isDark ? '#2563EB' : '#1F2937'
                            },
                            '&:disabled': {
                              bgcolor: isDark ? '#475569' : '#9CA3AF'
                            }
                          }}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={processingId === request.id ? <CircularProgress size={16} /> : <CloseIcon />}
                          onClick={() => handleReject(request.id)}
                          disabled={processingId === request.id}
                          fullWidth
                          sx={{
                            py: 1.5,
                            borderRadius: 2,
                            border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : '#FEE2E2'}`,
                            color: isDark ? '#F87171' : '#DC2626',
                            fontWeight: 500,
                            textTransform: 'none',
                            '&:hover': {
                              borderColor: isDark ? 'rgba(239, 68, 68, 0.5)' : '#FECACA',
                              bgcolor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2'
                            }
                          }}
                        >
                          Reject
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <Dialog
        open={profileOpen}
        onClose={() => {
          setProfileOpen(false);
          setProfileError('');
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ pb: 2, borderBottom: `1px solid ${isDark ? 'rgba(30, 41, 59, 0.8)' : '#E5E7EB'}` }}>
          <Typography variant="h6" fontWeight="600" sx={{ color: isDark ? '#F1F5F9' : '#111827' }}>
            Patient Profile
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#E5E7EB' }}>
          {profileLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: isDark ? '#60A5FA' : '#3B82F6' }} />
            </Box>
          ) : profileError ? (
            <Alert severity="error" sx={{ bgcolor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(254, 242, 242, 0.9)' }}>
              {profileError}
            </Alert>
          ) : profileData ? (
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" fontWeight="600" gutterBottom sx={{ color: isDark ? '#F1F5F9' : '#111827' }}>
                  {profileData.patient?.name || 'Unknown Patient'}
                </Typography>
                <Typography variant="body2" sx={{ color: isDark ? '#94A3B8' : '#6B7280' }}>
                  Email: {profileData.patient?.email || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ color: isDark ? '#94A3B8' : '#6B7280' }}>
                  Phone: {profileData.patient?.phone || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ color: isDark ? '#94A3B8' : '#6B7280' }}>
                  Age: {profileData.patient?.age || 'N/A'} | Gender: {profileData.patient?.gender || 'N/A'}
                </Typography>
              </Box>

              <Box sx={{ borderTop: `1px solid ${isDark ? 'rgba(30, 41, 59, 0.8)' : '#E5E7EB'}`, pt: 2 }}>
                <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ color: isDark ? '#F1F5F9' : '#111827', mb: 1 }}>
                  Consultation Details
                </Typography>
                <Typography variant="body2" sx={{ color: isDark ? '#94A3B8' : '#6B7280', mb: 2 }}>
                  Requested: {profileData.requested_at ? new Date(profileData.requested_at).toLocaleString() : 'N/A'}
                </Typography>
                {profileData.primary_symptoms && (
                  <Box sx={{ mb: 2, p: 2, bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : '#F9FAFB', borderRadius: 2, border: `1px solid ${isDark ? 'rgba(30, 41, 59, 0.8)' : '#E5E7EB'}` }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: isDark ? '#F1F5F9' : '#111827', mb: 0.5 }}>
                      Primary Symptoms
                    </Typography>
                    <Typography variant="body2" sx={{ color: isDark ? '#94A3B8' : '#6B7280' }}>{profileData.primary_symptoms}</Typography>
                  </Box>
                )}
                {profileData.llm_summary && (
                  <Box sx={{ mb: 2, p: 2, bgcolor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF', border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : '#BFDBFE'}`, borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: isDark ? '#60A5FA' : '#1E40AF', mb: 0.5 }}>
                      AI Summary
                    </Typography>
                    <Typography variant="body2" sx={{ color: isDark ? '#94A3B8' : '#1E3A8A' }}>{profileData.llm_summary}</Typography>
                  </Box>
                )}
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ color: isDark ? '#F1F5F9' : '#111827' }}>
                  Shared Documents ({profileData.document_count || 0})
                </Typography>
                {profileData.documents && profileData.documents.length > 0 ? (
                  <List sx={{ bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : '#F9FAFB', borderRadius: 2, border: `1px solid ${isDark ? 'rgba(30, 41, 59, 0.8)' : '#E5E7EB'}` }}>
                    {profileData.documents.map((doc) => (
                      <ListItem
                        key={doc.id}
                        secondaryAction={
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => window.open(doc.download_url, '_blank', 'noopener')}
                            sx={{
                              borderRadius: 2,
                              border: `1px solid ${isDark ? 'rgba(30, 41, 59, 0.8)' : '#E5E7EB'}`,
                              textTransform: 'none',
                              fontSize: '0.75rem',
                              color: isDark ? '#F1F5F9' : '#111827',
                              '&:hover': {
                                borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#D1D5DB',
                                bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : '#F9FAFB'
                              }
                            }}
                          >
                            View
                          </Button>
                        }
                      >
                        <ListItemIcon>
                          <DescriptionIcon sx={{ color: isDark ? '#94A3B8' : '#6B7280' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={doc.file_name}
                          secondary={`Uploaded ${doc.created_at ? new Date(doc.created_at).toLocaleString() : 'N/A'}${doc.file_size ? ` • ${(doc.file_size / 1024 / 1024).toFixed(2)} MB` : ''}`}
                          primaryTypographyProps={{ sx: { color: isDark ? '#F1F5F9' : '#111827', fontWeight: 500 } }}
                          secondaryTypographyProps={{ sx: { color: isDark ? '#94A3B8' : '#6B7280', fontSize: '0.75rem' } }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" sx={{ color: isDark ? '#94A3B8' : '#6B7280' }}>
                    No documents were shared with this consultation.
                  </Typography>
                )}
              </Box>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${isDark ? 'rgba(30, 41, 59, 0.8)' : '#E5E7EB'}` }}>
          <Button 
            onClick={() => setProfileOpen(false)} 
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              px: 3,
              borderColor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#E5E7EB',
              color: isDark ? '#F1F5F9' : '#374151',
              '&:hover': {
                borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#D1D5DB',
                bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : '#F9FAFB'
              }
            }}
            variant="outlined"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PatientRequests;
