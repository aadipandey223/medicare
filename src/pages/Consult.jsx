import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  FormControlLabel,
  Divider,
  Fade,
  Zoom,
  Card,
  CardContent,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
} from '@mui/material';
import { 
  Close as X,
  Send as SendIcon,
  Add as Plus,
  Upload as UploadIcon,
  Description as FileText,
  Circle,
  Message as MessageCircle,
  Person as User,
  Star,
  StarBorder,
} from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';
import BackButton from '../components/BackButton';
import { useNavigate } from 'react-router-dom';

// Get API base URL from environment
const rawApiBase = import.meta.env.VITE_API_URL || '/api';
const API_BASE_URL = rawApiBase.endsWith('/api')
  ? rawApiBase
  : `${rawApiBase.replace(/\/$/, '')}/api`;

function Consult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [activeConsultations, setActiveConsultations] = useState([]);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [requestModal, setRequestModal] = useState(false);
  const [symptoms, setSymptoms] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [chosenDoctor, setChosenDoctor] = useState(null); // Doctor chosen from Doctors panel
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState([]);
  const [shareAllDocuments, setShareAllDocuments] = useState(false);
  const [shareDocDialogOpen, setShareDocDialogOpen] = useState(false);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [selectedShareDocs, setSelectedShareDocs] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [requesting, setRequesting] = useState(false);
  const [ratingChecked, setRatingChecked] = useState(false);

  useEffect(() => {
    fetchDoctors();
    fetchActiveConsultations();
    checkForRatingNeeded();
    const interval = setInterval(() => {
      if (selectedConsultation) {
        fetchMessages(selectedConsultation.id);
        markViewing(selectedConsultation.id);
      }
      fetchActiveConsultations();
    }, 2000);
    return () => clearInterval(interval);
  }, [selectedConsultation, searchParams]);

  const checkForRatingNeeded = async () => {
    if (ratingChecked || ratingDialogOpen) return;
    
    try {
      const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('token')) || localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch(`${API_BASE_URL}/consultation/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const allData = await response.json();
        // Find ended consultations without ratings from last 24 hours
        const endedWithoutRating = allData.find(cons => 
          cons.status === 'ended' && 
          !cons.has_rating &&
          cons.ended_at &&
          new Date(cons.ended_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        );
        if (endedWithoutRating && !ratingDialogOpen) {
          setEndedConsultation(endedWithoutRating);
          setRatingDialogOpen(true);
        }
        setRatingChecked(true);
      }
    } catch (err) {
      // Silent fail
    }
  };

  const markViewing = async (consultationId) => {
    try {
      const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('token')) || localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/consultation/${consultationId}/viewing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      // Silent fail
    }
  };

  useEffect(() => {
    if (requestModal) {
      loadPatientDocuments();
    } else {
      setShareAllDocuments(false);
      setSelectedDocumentIds([]);
    }
  }, [requestModal]);

  useEffect(() => {
    if (shareAllDocuments && documents && Array.isArray(documents)) {
      setSelectedDocumentIds(documents.map((doc) => doc.id));
    }
  }, [documents, shareAllDocuments]);

  const fetchDoctors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/doctors`);
      if (!response.ok) throw new Error('Failed to fetch doctors');
      const data = await response.json();
      setDoctors(data);
      
      // Check if doctorId is in URL params (from Doctors panel)
      const doctorIdParam = searchParams.get('doctorId');
      if (doctorIdParam) {
        const doctor = data.find(d => d.id === parseInt(doctorIdParam));
        if (doctor) {
          setChosenDoctor(doctor);
          setSelectedDoctor(doctor);
        }
      }
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveConsultations = async () => {
    try {
      const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('token')) || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/consultation/active`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setActiveConsultations(data);
        if (data.length > 0 && !selectedConsultation) {
          setSelectedConsultation(data[0]);
          fetchMessages(data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch consultations:', err);
    }
  };

  const loadPatientDocuments = async () => {
    setDocumentsLoading(true);
    try {
      const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('token')) || localStorage.getItem('token');
      if (!token) {
        setDocuments([]);
        return;
      }
      const response = await fetch(`${API_BASE_URL}/patient/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to load documents');
      }
      const data = await response.json();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load documents:', err);
      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const fetchMessages = async (consultationId) => {
    try {
      const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('token')) || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/consultation/${consultationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const handleRequestConsultation = async () => {
    const doctorToUse = selectedDoctor || chosenDoctor;
    if (!doctorToUse) {
      setSnackbar({ open: true, message: 'Please select a doctor', severity: 'warning' });
      return;
    }

    setRequesting(true);
    try {
      const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('token')) || localStorage.getItem('token');
      const documentIdsToShare = shareAllDocuments && documents && Array.isArray(documents) 
        ? documents.map((doc) => doc.id) 
        : selectedDocumentIds;
      
      const response = await fetch(`${API_BASE_URL}/consultation/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctor_id: doctorToUse.id,
          primary_symptoms: symptoms,
          llm_summary: '',
          document_ids: documentIdsToShare
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMessage = data.error || data.message || `Failed to request consultation (${response.status})`;
        throw new Error(errorMessage);
      }

      // Success - only show success message if we got a valid response
      setRequestModal(false);
      setSymptoms('');
      setSelectedDoctor(chosenDoctor); // Reset to chosen doctor if available
      setSelectedDocumentIds([]);
      setShareAllDocuments(false);
      setSnackbar({ 
        open: true, 
        message: 'Consultation request sent successfully! The doctor will review it shortly.', 
        severity: 'success' 
      });
      
      // Refresh consultations after a short delay
      setTimeout(() => {
        fetchActiveConsultations();
      }, 500);
    } catch (err) {
      console.error('Request consultation error:', err);
      setSnackbar({ 
        open: true, 
        message: err.message || 'Failed to send consultation request. Please try again.', 
        severity: 'error' 
      });
    } finally {
      setRequesting(false);
    }
  };

  const toggleDocumentSelection = (documentId) => {
    setSelectedDocumentIds((prev) => {
      if (prev.includes(documentId)) {
        return prev.filter((id) => id !== documentId);
      }
      return [...prev, documentId];
    });
  };

  const handleShareAllToggle = () => {
    setShareAllDocuments((prev) => {
      const next = !prev;
      if (next && documents && Array.isArray(documents)) {
        setSelectedDocumentIds(documents.map((doc) => doc.id));
      } else {
        setSelectedDocumentIds([]);
      }
      return next;
    });
  };

  const handleSendMessage = async (shareDocIds = []) => {
    if ((!messageText.trim() && shareDocIds.length === 0) || !selectedConsultation) return;

    const messageToSend = messageText.trim();
    setMessageText('');
    setSending(true);
    try {
      const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('token')) || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/consultation/${selectedConsultation.id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          content: messageToSend,
          document_ids: shareDocIds.length > 0 ? shareDocIds : undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to send message (${response.status})`);
      }

      await fetchMessages(selectedConsultation.id);
    } catch (err) {
      if (err.name === 'TypeError' || err.message.includes('fetch')) {
        console.warn('Network error during send, checking if message was received:', err);
        setTimeout(() => {
          fetchMessages(selectedConsultation.id);
        }, 500);
        return;
      }
      console.error('Error sending message:', err);
      setTimeout(() => {
        fetchMessages(selectedConsultation.id);
      }, 500);
    } finally {
      setSending(false);
    }
  };

  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: isDark
          ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)'
          : 'linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 50%, #F8FAFC 100%)',
      }}>
        <CircularProgress sx={{ color: isDark ? '#8B5CF6' : '#6366f1' }} size={50} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      py: 4,
      px: { xs: 2, sm: 3 },
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
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <BackButton />
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="h3" 
              fontWeight="800" 
              sx={{ 
                mb: 1,
                background: isDark
                  ? 'linear-gradient(135deg, #A78BFA 0%, #EC4899 50%, #FBBF24 100%)'
                  : 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F59E0B 100%)',
                backgroundSize: '200% 200%',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'gradientShift 3s ease infinite',
              }}
            >
              Medical Consultation
            </Typography>
            <Typography variant="body1" sx={{ color: isDark ? '#94A3B8' : '#64748B', fontWeight: 500 }}>
              Connect with healthcare professionals instantly
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              {/* Only show chosen doctor card if doctor was selected from Doctors panel */}
              {chosenDoctor && (
                <Card 
                  sx={{ 
                    borderRadius: 4, 
                    boxShadow: 3,
                    bgcolor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#FFFFFF',
                    border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : '#E2E8F0'}`,
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: isDark ? '#F1F5F9' : '#1E293B' }}>
                        Selected Doctor
                      </Typography>
                      <Button
                        onClick={() => setRequestModal(true)}
                        variant="contained"
                        startIcon={<Plus />}
                        sx={{
                          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                          borderRadius: 2,
                          textTransform: 'none',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          boxShadow: 3,
                          '&:hover': {
                            boxShadow: 6,
                            transform: 'scale(1.05)',
                          },
                          transition: 'all 0.2s',
                        }}
                      >
                        New Request
                      </Button>
                    </Box>
              
                    <Card
                      sx={{
                        background: isDark 
                          ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)'
                          : 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
                        borderRadius: 3,
                        border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : '#E2E8F0'}`,
                        p: 2,
                        '&:hover': {
                          boxShadow: 4,
                          transform: 'translateY(-4px)',
                        },
                        transition: 'all 0.3s',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={chosenDoctor.photo_url}
                          sx={{
                            width: 56,
                            height: 56,
                            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            border: `4px solid ${isDark ? '#1E293B' : '#FFFFFF'}`,
                            boxShadow: 3,
                          }}
                        >
                          {chosenDoctor.photo_url ? null : (chosenDoctor.name?.charAt(0) || <User />)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold" sx={{ color: isDark ? '#F1F5F9' : '#1E293B' }}>
                            Dr. {chosenDoctor.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: isDark ? '#94A3B8' : '#64748B', mb: 1, fontWeight: 500 }}>
                            {chosenDoctor.specialization}
                          </Typography>
                          <Chip
                            icon={<Circle sx={{ fontSize: 8 }} />}
                            label={chosenDoctor.is_online ? 'Available' : 'Offline'}
                            size="small"
                            sx={{
                              bgcolor: chosenDoctor.is_online 
                                ? (isDark ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5')
                                : (isDark ? 'rgba(71, 85, 105, 0.3)' : '#F1F5F9'),
                              color: chosenDoctor.is_online 
                                ? (isDark ? '#10B981' : '#065F46')
                                : (isDark ? '#94A3B8' : '#475569'),
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              height: 24,
                            }}
                          />
                        </Box>
                      </Box>
                    </Card>
                  </CardContent>
                </Card>
              )}

              {/* Show "New Request" button if no doctor chosen */}
              {!chosenDoctor && (
                <Card 
                  sx={{ 
                    borderRadius: 4, 
                    boxShadow: 3,
                    bgcolor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#FFFFFF',
                    border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : '#E2E8F0'}`,
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: isDark ? '#F1F5F9' : '#1E293B', mb: 2 }}>
                      Choose a Doctor
                    </Typography>
                    <Typography variant="body2" sx={{ color: isDark ? '#94A3B8' : '#64748B', mb: 3 }}>
                      Visit the Doctors panel to select a doctor, then return here to request a consultation.
                    </Typography>
                    <Button
                      onClick={() => setRequestModal(true)}
                      variant="contained"
                      startIcon={<Plus />}
                      sx={{
                        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        boxShadow: 3,
                        '&:hover': {
                          boxShadow: 6,
                          transform: 'scale(1.05)',
                        },
                        transition: 'all 0.2s',
                      }}
                    >
                      New Request
                    </Button>
                  </CardContent>
                </Card>
              )}

            {activeConsultations.length > 0 && (
              <Card 
                sx={{ 
                  borderRadius: 4, 
                  boxShadow: 3,
                  bgcolor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#FFFFFF',
                  border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : '#E2E8F0'}`,
                }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: isDark ? '#F1F5F9' : '#1E293B', mb: 2 }}>
                    Active Sessions
                  </Typography>
                  <Stack spacing={1}>
                  {activeConsultations.map((consultation) => (
                      <Button
                      key={consultation.id}
                      onClick={() => {
                        setSelectedConsultation(consultation);
                        fetchMessages(consultation.id);
                        markViewing(consultation.id);
                      }}
                        fullWidth
                        sx={{
                          textAlign: 'left',
                          p: 2,
                          borderRadius: 3,
                          border: `2px solid ${
                        selectedConsultation?.id === consultation.id
                              ? 'transparent'
                              : (isDark ? 'rgba(139, 92, 246, 0.2)' : '#E2E8F0')
                          }`,
                          background: selectedConsultation?.id === consultation.id
                            ? 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'
                            : (isDark ? 'rgba(30, 41, 59, 0.6)' : '#FFFFFF'),
                          color: selectedConsultation?.id === consultation.id
                            ? '#FFFFFF'
                            : (isDark ? '#F1F5F9' : '#1E293B'),
                          boxShadow: selectedConsultation?.id === consultation.id ? 3 : 0,
                          transform: selectedConsultation?.id === consultation.id ? 'scale(1.02)' : 'scale(1)',
                          '&:hover': {
                            borderColor: selectedConsultation?.id === consultation.id
                              ? 'transparent'
                              : (isDark ? 'rgba(99, 102, 241, 0.5)' : '#C7D2FE'),
                            boxShadow: selectedConsultation?.id === consultation.id ? 4 : 2,
                          },
                          transition: 'all 0.3s',
                          textTransform: 'none',
                        }}
                      >
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              Dr. {consultation.doctor_name || 'Doctor'}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: selectedConsultation?.id === consultation.id
                                  ? 'rgba(255, 255, 255, 0.8)'
                                  : (isDark ? '#94A3B8' : '#64748B'),
                                display: 'block',
                                mt: 0.5,
                              }}
                            >
                        {new Date(consultation.started_at).toLocaleString()}
                            </Typography>
                          </Box>
                          <Chip
                            icon={<Circle sx={{ fontSize: 8 }} />}
                            label="Active"
                            size="small"
                            sx={{
                              bgcolor: selectedConsultation?.id === consultation.id
                                ? 'rgba(255, 255, 255, 0.2)'
                                : (isDark ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5'),
                              color: selectedConsultation?.id === consultation.id
                                ? '#FFFFFF'
                                : (isDark ? '#10B981' : '#065F46'),
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              height: 24,
                            }}
                          />
                        </Box>
                      </Button>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            )}
            </Stack>
          </Grid>

          <Grid item xs={12} lg={8}>
            {selectedConsultation ? (
              <Card 
                sx={{ 
                  borderRadius: 4, 
                  boxShadow: 3,
                  bgcolor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#FFFFFF',
                  border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : '#E2E8F0'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '70vh',
                }}
              >
                <Box 
                  sx={{ 
                    p: 3, 
                    borderBottom: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : '#E2E8F0'}`,
                    background: isDark 
                      ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)'
                      : 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
                    borderRadius: '16px 16px 0 0',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <BackButton 
                      onClick={() => setSelectedConsultation(null)}
                      tooltip="Back to consultations"
                    />
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        border: `3px solid ${isDark ? '#1E293B' : '#FFFFFF'}`,
                        boxShadow: 3,
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          transition: 'transform 0.2s',
                        },
                      }}
                      onClick={() => {
                        if (selectedConsultation.doctor_id) {
                          navigate(`/doctor-profile/${selectedConsultation.doctor_id}`);
                        }
                      }}
                    >
                      {selectedConsultation.doctor_name?.charAt(0) || 'D'}
                    </Avatar>
                    <Box 
                      sx={{ 
                        flex: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          opacity: 0.8,
                        },
                      }}
                      onClick={() => {
                        if (selectedConsultation.doctor_id) {
                          navigate(`/doctor-profile/${selectedConsultation.doctor_id}`);
                        }
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold" sx={{ color: isDark ? '#F1F5F9' : '#1E293B' }}>
                        Dr. {selectedConsultation.doctor_name || 'Doctor'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: isDark ? '#94A3B8' : '#64748B', fontWeight: 500 }}>
                        Session started {new Date(selectedConsultation.started_at).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box 
                  sx={{ 
                    flex: 1, 
                    overflowY: 'auto', 
                    p: 3,
                    background: isDark 
                      ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%)'
                      : 'linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)',
                  }}
                >
                  <Stack spacing={2}>
                  {messages.map((message) => (
                      <Box
                      key={message.id}
                        sx={{
                          display: 'flex',
                          justifyContent: message.sender_type === 'patient' ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <Paper
                          elevation={2}
                          sx={{
                            maxWidth: '70%',
                            p: 2,
                            borderRadius: 3,
                            background: message.sender_type === 'patient'
                              ? 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'
                              : (isDark ? 'rgba(30, 41, 59, 0.6)' : '#FFFFFF'),
                            color: message.sender_type === 'patient'
                              ? '#FFFFFF'
                              : (isDark ? '#F1F5F9' : '#1E293B'),
                            border: message.sender_type === 'patient'
                              ? 'none'
                              : `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : '#E2E8F0'}`,
                            borderBottomRightRadius: message.sender_type === 'patient' ? 1 : 3,
                            borderBottomLeftRadius: message.sender_type === 'patient' ? 3 : 1,
                          }}
                        >
                          <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                            {message.content}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: message.sender_type === 'patient'
                                ? 'rgba(255, 255, 255, 0.75)'
                                : (isDark ? '#94A3B8' : '#64748B'),
                              fontWeight: 600,
                            }}
                          >
                          {new Date(message.sent_at).toLocaleTimeString()}
                          </Typography>
                        </Paper>
                      </Box>
                    ))}
                  </Stack>
                </Box>

                <Box 
                  sx={{ 
                    p: 3, 
                    borderTop: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : '#E2E8F0'}`,
                    background: isDark 
                      ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)'
                      : 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
                    borderRadius: '0 0 16px 16px',
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <IconButton
                      onClick={async () => {
                        try {
                          const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('token')) || localStorage.getItem('token');
                          const response = await fetch(`${API_BASE_URL}/patient/documents?limit=10&sort=created_at:desc`, {
                            headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json'
                            }
                          });
                          if (response.ok) {
                            const docs = await response.json();
                            setRecentDocuments(Array.isArray(docs) ? docs : []);
                            setShareDocDialogOpen(true);
                          }
                        } catch (err) {
                          // Silent fail
                        }
                      }}
                      sx={{
                        bgcolor: isDark ? 'rgba(71, 85, 105, 0.3)' : '#F1F5F9',
                        color: '#6366F1',
                        '&:hover': {
                          bgcolor: isDark ? 'rgba(71, 85, 105, 0.5)' : '#E2E8F0',
                          transform: 'scale(1.05)',
                        },
                        transition: 'all 0.2s',
                      }}
                    >
                      <UploadIcon />
                    </IconButton>
                    <TextField
                      fullWidth
                      placeholder="Type your message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: isDark ? 'rgba(71, 85, 105, 0.3)' : '#F1F5F9',
                          '&:hover': {
                            bgcolor: isDark ? 'rgba(71, 85, 105, 0.5)' : '#E2E8F0',
                          },
                          '&.Mui-focused': {
                            bgcolor: isDark ? 'rgba(71, 85, 105, 0.5)' : '#FFFFFF',
                          },
                        },
                      }}
                    />
                    <Button
                      onClick={() => {
                        if (selectedShareDocs.length > 0) {
                          handleSendMessage(selectedShareDocs);
                          setSelectedShareDocs([]);
                        } else {
                          handleSendMessage();
                        }
                      }}
                      disabled={(!messageText.trim() && selectedShareDocs.length === 0) || sending}
                      variant="contained"
                      startIcon={sending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                      sx={{
                        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: 3,
                        '&:hover': {
                          boxShadow: 6,
                          transform: 'scale(1.05)',
                        },
                        '&:disabled': {
                          opacity: 0.5,
                          transform: 'scale(1)',
                        },
                        transition: 'all 0.2s',
                      }}
                    >
                      Send
                    </Button>
                    <Button
                      onClick={async () => {
                        if (!window.confirm('Are you sure you want to end this consultation?')) {
                          return;
                        }
                        try {
                          const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('token')) || localStorage.getItem('token');
                          const response = await fetch(`${API_BASE_URL}/consultation/${selectedConsultation.id}/end`, {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json'
                            }
                          });
                          if (!response.ok) {
                            throw new Error('Failed to end consultation');
                          }
                          setSnackbar({ open: true, message: 'Consultation ended successfully', severity: 'success' });
                          setSelectedConsultation(null);
                          setMessages([]);
                          fetchActiveConsultations();
                          // Check for rating after ending
                          setTimeout(() => checkForRatingNeeded(), 1000);
                        } catch (err) {
                          setSnackbar({ open: true, message: err.message || 'Failed to end consultation', severity: 'error' });
                        }
                      }}
                      variant="outlined"
                      color="error"
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        borderColor: isDark ? 'rgba(239, 68, 68, 0.5)' : '#EF4444',
                        color: isDark ? '#F87171' : '#DC2626',
                        '&:hover': {
                          borderColor: isDark ? 'rgba(239, 68, 68, 0.8)' : '#DC2626',
                          bgcolor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                        },
                      }}
                    >
                      End Consultation
                    </Button>
                  </Box>
                </Box>
              </Card>
            ) : (
              <Card 
                sx={{ 
                  borderRadius: 4, 
                  boxShadow: 3,
                  bgcolor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#FFFFFF',
                  border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : '#E2E8F0'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '70vh',
                  p: 6,
                  textAlign: 'center',
                }}
              >
                <Avatar
                  sx={{
                    width: 96,
                    height: 96,
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                    mb: 3,
                  }}
                >
                  <MessageCircle sx={{ fontSize: 48, color: '#6366f1' }} />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" sx={{ color: isDark ? '#F1F5F9' : '#1E293B', mb: 1 }}>
                  No Active Consultation
                </Typography>
                <Typography variant="body1" sx={{ color: isDark ? '#94A3B8' : '#64748B', mb: 4, maxWidth: 400, fontWeight: 500 }}>
                  Start a conversation with one of our healthcare professionals to get expert medical advice.
                </Typography>
                <Button
                  onClick={() => setRequestModal(true)}
                  variant="contained"
                  startIcon={<Plus />}
                  sx={{
                    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: 3,
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  Request Consultation
                </Button>
              </Card>
            )}
          </Grid>
        </Grid>

        <Dialog
          open={requestModal}
          onClose={() => {
            setRequestModal(false);
            setSymptoms('');
            setSelectedDoctor(chosenDoctor); // Reset to chosen doctor if available
          }}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              bgcolor: isDark ? 'rgba(30, 41, 59, 0.95)' : '#FFFFFF',
              border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : '#E2E8F0'}`,
              maxHeight: '90vh',
            }
          }}
        >
          <DialogTitle
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pb: 2,
              borderBottom: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : '#E2E8F0'}`,
            }}
          >
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{
                background: isDark
                  ? 'linear-gradient(135deg, #A78BFA 0%, #EC4899 50%, #FBBF24 100%)'
                  : 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                backgroundSize: '200% 200%',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Request Consultation
            </Typography>
            <IconButton
              onClick={() => {
                setRequestModal(false);
                setSymptoms('');
                setSelectedDoctor(chosenDoctor);
              }}
              sx={{
                color: isDark ? '#94A3B8' : '#64748B',
                '&:hover': {
                  bgcolor: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(241, 245, 249, 0.8)',
                },
              }}
            >
              <X />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: isDark ? '#94A3B8' : '#64748B' }}>Select Doctor</InputLabel>
                <Select
                  value={selectedDoctor?.id || (chosenDoctor?.id || '')}
                  onChange={(e) => {
                    const doctor = doctors.find(d => d.id === parseInt(e.target.value));
                    setSelectedDoctor(doctor || chosenDoctor);
                  }}
                  label="Select Doctor"
                  sx={{
                    bgcolor: isDark ? 'rgba(71, 85, 105, 0.3)' : '#F8FAFC',
                    color: isDark ? '#F1F5F9' : '#1E293B',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDark ? 'rgba(139, 92, 246, 0.2)' : '#E2E8F0',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDark ? 'rgba(139, 92, 246, 0.4)' : '#C7D2FE',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#6366F1',
                    },
                  }}
                >
                  {chosenDoctor && (
                    <MenuItem value={chosenDoctor.id}>
                      Dr. {chosenDoctor.name} - {chosenDoctor.specialization}
                    </MenuItem>
                  )}
                  {doctors
                    .filter(d => !chosenDoctor || d.id !== chosenDoctor.id)
                    .map((doctor) => (
                      <MenuItem key={doctor.id} value={doctor.id}>
                        Dr. {doctor.name} - {doctor.specialization}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Describe your symptoms"
                placeholder="E.g., Headache and fever for 2 days"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                multiline
                rows={4}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: isDark ? 'rgba(71, 85, 105, 0.3)' : '#F8FAFC',
                    color: isDark ? '#F1F5F9' : '#1E293B',
                    '& fieldset': {
                      borderColor: isDark ? 'rgba(139, 92, 246, 0.2)' : '#E2E8F0',
                    },
                    '&:hover fieldset': {
                      borderColor: isDark ? 'rgba(139, 92, 246, 0.4)' : '#C7D2FE',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#6366F1',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: isDark ? '#94A3B8' : '#64748B',
                  },
                }}
              />

              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ color: isDark ? '#F1F5F9' : '#1E293B', mb: 1 }}>
                  Share Medical Documents
                  <Typography component="span" variant="body2" sx={{ color: isDark ? '#94A3B8' : '#64748B', ml: 1, fontWeight: 400 }}>
                    (optional)
                  </Typography>
                </Typography>
                
                {documentsLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: isDark ? 'rgba(71, 85, 105, 0.3)' : '#F8FAFC', borderRadius: 2 }}>
                    <CircularProgress size={20} sx={{ color: '#6366F1' }} />
                    <Typography variant="body2" sx={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                      Loading documents...
                    </Typography>
                  </Box>
                ) : documents.length > 0 ? (
                  <>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={shareAllDocuments}
                          onChange={handleShareAllToggle}
                          sx={{
                            color: '#6366F1',
                            '&.Mui-checked': {
                              color: '#6366F1',
                            },
                          }}
                        />
                      }
                      label={
                        <Typography variant="body2" fontWeight="600" sx={{ color: isDark ? '#F1F5F9' : '#1E293B' }}>
                          Share all documents with the doctor
                        </Typography>
                      }
                      sx={{ mb: 2 }}
                    />
                    
                    <Paper
                      elevation={0}
                      sx={{
                        border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : '#E2E8F0'}`,
                        borderRadius: 2,
                        maxHeight: 256,
                        overflow: 'auto',
                        bgcolor: isDark ? 'rgba(15, 23, 42, 0.5)' : '#FFFFFF',
                      }}
                    >
                      {documents.map((doc) => {
                        const checked = shareAllDocuments || selectedDocumentIds.includes(doc.id);
                        return (
                          <Box
                            key={doc.id}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              p: 2,
                              borderBottom: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.1)' : '#F1F5F9'}`,
                              '&:last-child': {
                                borderBottom: 'none',
                              },
                              '&:hover': {
                                bgcolor: isDark ? 'rgba(71, 85, 105, 0.2)' : '#F8FAFC',
                              },
                              transition: 'background-color 0.2s',
                            }}
                          >
                            <Checkbox
                              checked={checked}
                              disabled={shareAllDocuments}
                              onChange={() => toggleDocumentSelection(doc.id)}
                              sx={{
                                color: '#6366F1',
                                '&.Mui-checked': {
                                  color: '#6366F1',
                                },
                              }}
                            />
                            <FileText sx={{ fontSize: 20, color: isDark ? '#94A3B8' : '#64748B' }} />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body2" fontWeight="600" sx={{ color: isDark ? '#F1F5F9' : '#1E293B', noWrap: true }}>
                                {doc.file_name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                                {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'N/A'}
                                {doc.file_size ? ` • ${(doc.file_size / 1024 / 1024).toFixed(2)} MB` : ''}
                              </Typography>
                            </Box>
                            <Button
                              onClick={() => window.open(doc.download_url, '_blank', 'noopener')}
                              size="small"
                              sx={{
                                color: '#6366F1',
                                fontWeight: 600,
                                textTransform: 'none',
                                '&:hover': {
                                  bgcolor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
                                },
                              }}
                            >
                              View
                            </Button>
                          </Box>
                        );
                      })}
                    </Paper>
                  </>
                ) : (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      bgcolor: isDark ? 'rgba(71, 85, 105, 0.2)' : '#F8FAFC',
                      borderRadius: 2,
                      border: `2px dashed ${isDark ? 'rgba(139, 92, 246, 0.2)' : '#E2E8F0'}`,
                    }}
                  >
                    <FileText sx={{ fontSize: 48, color: isDark ? '#475569' : '#CBD5E1', mb: 2 }} />
                    <Typography variant="body2" sx={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                      No documents uploaded yet. Visit the Upload section to add reports or prescriptions.
                    </Typography>
                  </Paper>
                )}
              </Box>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 2, borderTop: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : '#E2E8F0'}` }}>
            <Button
              onClick={() => {
                setRequestModal(false);
                setSymptoms('');
                setSelectedDoctor(chosenDoctor);
              }}
              sx={{
                color: isDark ? '#94A3B8' : '#64748B',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  bgcolor: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(241, 245, 249, 0.8)',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRequestConsultation}
              disabled={(!selectedDoctor && !chosenDoctor) || requesting}
              variant="contained"
              startIcon={requesting ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 3,
                '&:hover': {
                  boxShadow: 6,
                  transform: 'scale(1.05)',
                },
                '&:disabled': {
                  opacity: 0.5,
                  transform: 'scale(1)',
                },
                transition: 'all 0.2s',
              }}
            >
              {requesting ? 'Sending...' : 'Send Request'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={shareDocDialogOpen}
          onClose={() => {
            setShareDocDialogOpen(false);
            setSelectedShareDocs([]);
          }}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              bgcolor: isDark ? 'rgba(30, 41, 59, 0.95)' : '#FFFFFF',
              border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : '#E2E8F0'}`,
              maxHeight: '80vh',
            }
          }}
        >
          <DialogTitle
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pb: 2,
              borderBottom: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : '#E2E8F0'}`,
            }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: isDark ? '#F1F5F9' : '#1E293B' }}>
              Share Documents
            </Typography>
            <IconButton
              onClick={() => {
                setShareDocDialogOpen(false);
                setSelectedShareDocs([]);
              }}
              sx={{
                color: isDark ? '#94A3B8' : '#64748B',
                '&:hover': {
                  bgcolor: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(241, 245, 249, 0.8)',
                },
              }}
            >
              <X />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ pt: 3 }}>
            <Typography variant="body2" sx={{ color: isDark ? '#94A3B8' : '#64748B', mb: 3, fontWeight: 500 }}>
              Select recently uploaded documents to share with the doctor
            </Typography>

            {recentDocuments.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  bgcolor: isDark ? 'rgba(71, 85, 105, 0.2)' : '#F8FAFC',
                  borderRadius: 2,
                  border: `2px dashed ${isDark ? 'rgba(139, 92, 246, 0.2)' : '#E2E8F0'}`,
                }}
              >
                <FileText sx={{ fontSize: 48, color: isDark ? '#475569' : '#CBD5E1', mb: 2 }} />
                <Typography variant="body2" sx={{ color: isDark ? '#94A3B8' : '#64748B', fontWeight: 500 }}>
                  No documents available
                </Typography>
              </Paper>
            ) : (
              <Stack spacing={1.5} sx={{ maxHeight: 384, overflowY: 'auto' }}>
                {recentDocuments.map((doc) => {
                  const isSelected = selectedShareDocs.includes(doc.id);
                  return (
                    <Card
                      key={doc.id}
                      onClick={() => {
                        setSelectedShareDocs(prev => 
                          prev.includes(doc.id) 
                            ? prev.filter(id => id !== doc.id)
                            : [...prev, doc.id]
                        );
                      }}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        border: `2px solid ${
                          isSelected
                            ? '#6366F1'
                            : (isDark ? 'rgba(139, 92, 246, 0.2)' : '#E2E8F0')
                        }`,
                        bgcolor: isSelected
                          ? (isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)')
                          : (isDark ? 'rgba(30, 41, 59, 0.6)' : '#FFFFFF'),
                        borderRadius: 2,
                        boxShadow: isSelected ? 3 : 0,
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: isSelected ? '#6366F1' : (isDark ? 'rgba(139, 92, 246, 0.4)' : '#C7D2FE'),
                          boxShadow: 2,
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: isSelected
                              ? 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'
                              : (isDark ? 'rgba(71, 85, 105, 0.3)' : '#F1F5F9'),
                            transition: 'all 0.2s',
                          }}
                        >
                          <FileText sx={{ fontSize: 20, color: isSelected ? '#FFFFFF' : (isDark ? '#94A3B8' : '#64748B') }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight="600" sx={{ color: isDark ? '#F1F5F9' : '#1E293B', noWrap: true }}>
                            {doc.file_name || doc.name || 'Document'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                            {doc.created_at ? new Date(doc.created_at).toLocaleString() : ''}
                          </Typography>
                        </Box>
                        <Checkbox
                          checked={isSelected}
                          readOnly
                          sx={{
                            color: '#6366F1',
                            '&.Mui-checked': {
                              color: '#6366F1',
                            },
                          }}
                        />
                      </Box>
                    </Card>
                  );
                })}
              </Stack>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 2, borderTop: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : '#E2E8F0'}` }}>
            <Button
              onClick={() => {
                setShareDocDialogOpen(false);
                setSelectedShareDocs([]);
              }}
              sx={{
                color: isDark ? '#94A3B8' : '#64748B',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  bgcolor: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(241, 245, 249, 0.8)',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedShareDocs.length > 0) {
                  handleSendMessage(selectedShareDocs);
                  setShareDocDialogOpen(false);
                  setSelectedShareDocs([]);
                }
              }}
              disabled={selectedShareDocs.length === 0}
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 3,
                '&:hover': {
                  boxShadow: 6,
                  transform: 'scale(1.05)',
                },
                '&:disabled': {
                  opacity: 0.5,
                  transform: 'scale(1)',
                },
                transition: 'all 0.2s',
              }}
            >
              Share {selectedShareDocs.length > 0 ? `(${selectedShareDocs.length})` : ''}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Rating Dialog */}
        <Dialog
          open={ratingDialogOpen}
          onClose={() => {
            setRatingDialogOpen(false);
            setEndedConsultation(null);
            setDoctorRating(0);
            setPlatformRating(0);
            setFeedback('');
          }}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              bgcolor: isDark ? 'rgba(30, 41, 59, 0.95)' : '#FFFFFF',
              border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : '#E2E8F0'}`,
            }
          }}
        >
          <DialogTitle
            sx={{
              borderBottom: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : '#E2E8F0'}`,
            }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: isDark ? '#F1F5F9' : '#1E293B' }}>
              Rate Your Experience
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={3}>
              {endedConsultation && (
                <>
                  <Box>
                    <Typography variant="body1" fontWeight="600" sx={{ mb: 2, color: isDark ? '#F1F5F9' : '#1E293B' }}>
                      Rate Dr. {endedConsultation.doctor_name || 'Doctor'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <IconButton
                          key={star}
                          onClick={() => setDoctorRating(star)}
                          sx={{ p: 0.5 }}
                        >
                          {star <= doctorRating ? (
                            <Star sx={{ fontSize: 40, color: '#FBBF24' }} />
                          ) : (
                            <StarBorder sx={{ fontSize: 40, color: isDark ? '#475569' : '#CBD5E1' }} />
                          )}
                        </IconButton>
                      ))}
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="body1" fontWeight="600" sx={{ mb: 2, color: isDark ? '#F1F5F9' : '#1E293B' }}>
                      Rate Platform Experience
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <IconButton
                          key={star}
                          onClick={() => setPlatformRating(star)}
                          sx={{ p: 0.5 }}
                        >
                          {star <= platformRating ? (
                            <Star sx={{ fontSize: 40, color: '#FBBF24' }} />
                          ) : (
                            <StarBorder sx={{ fontSize: 40, color: isDark ? '#475569' : '#CBD5E1' }} />
                          )}
                        </IconButton>
                      ))}
                    </Box>
                  </Box>

                  <TextField
                    fullWidth
                    label="Feedback (optional)"
                    placeholder="Share your thoughts about the consultation..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    multiline
                    rows={4}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: isDark ? 'rgba(71, 85, 105, 0.3)' : '#F8FAFC',
                        color: isDark ? '#F1F5F9' : '#1E293B',
                      },
                    }}
                  />
                </>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2, borderTop: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : '#E2E8F0'}` }}>
            <Button
              onClick={() => {
                setRatingDialogOpen(false);
                setEndedConsultation(null);
                setDoctorRating(0);
                setPlatformRating(0);
                setFeedback('');
              }}
              sx={{
                color: isDark ? '#94A3B8' : '#64748B',
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              Skip
            </Button>
            <Button
              onClick={async () => {
                if (doctorRating === 0) {
                  setSnackbar({ open: true, message: 'Please rate the doctor', severity: 'warning' });
                  return;
                }
                
                setSubmittingRating(true);
                try {
                  const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('token')) || localStorage.getItem('token');
                  const response = await fetch(`${API_BASE_URL}/consultation/${endedConsultation.id}/rate`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      doctor_rating: doctorRating,
                      platform_rating: platformRating || null,
                      feedback: feedback.trim() || null
                    })
                  });

                  const data = await response.json();
                  if (!response.ok) {
                    throw new Error(data.error || 'Failed to submit rating');
                  }

                  setSnackbar({ open: true, message: 'Thank you for your feedback!', severity: 'success' });
                  setRatingDialogOpen(false);
                  setEndedConsultation(null);
                  setDoctorRating(0);
                  setPlatformRating(0);
                  setFeedback('');
                  fetchActiveConsultations();
                } catch (err) {
                  setSnackbar({ open: true, message: err.message || 'Failed to submit rating', severity: 'error' });
                } finally {
                  setSubmittingRating(false);
                }
              }}
              disabled={doctorRating === 0 || submittingRating}
              variant="contained"
              startIcon={submittingRating ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                '&:disabled': {
                  opacity: 0.5,
                },
              }}
            >
              {submittingRating ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

export default Consult;
