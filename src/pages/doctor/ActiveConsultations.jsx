import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Paper, Button, TextField,
  CircularProgress, Alert, Avatar, Fade
} from '@mui/material';
import { 
  Send as SendIcon, 
  Close as CloseIcon,
  Chat as MessageCircleIcon,
  AccessTime as ClockIcon,
  Description as DescriptionIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { apiRequest } from '../../api/api';

function ActiveConsultations() {
  const [consultations, setConsultations] = useState([]);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  // API base URL used in legacy fetch below
  const rawApiBase = import.meta.env.VITE_API_URL || '/api';
  const API_BASE_URL = rawApiBase.endsWith('/api')
    ? rawApiBase
    : `${rawApiBase.replace(/\/$/, '')}/api`;

  useEffect(() => {
    fetchConsultations();
    const interval = setInterval(() => {
      if (selectedConsultation) {
        fetchMessages(selectedConsultation.id);
        markViewing(selectedConsultation.id);
      }
      fetchConsultations(true);
    }, 5000); // Optimized: Reduced from 2s to 5s polling
    return () => clearInterval(interval);
  }, [selectedConsultation]);

  const markViewing = async (consultationId) => {
    try {
      await apiRequest(`/consultation/${consultationId}/viewing`, {
        method: 'POST'
      });
    } catch (err) {
      // Silent fail
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConsultations = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const data = await apiRequest('/doctor/consultations');
      const consultationsArray = Array.isArray(data) ? data : [];
      setConsultations(consultationsArray);

      if (consultationsArray.length > 0 && !selectedConsultation) {
        setSelectedConsultation(consultationsArray[0]);
        fetchMessages(consultationsArray[0].id);
      }

      if (selectedConsultation) {
        const updated = consultationsArray.find((c) => c.id === selectedConsultation.id);
        setSelectedConsultation((prev) => {
          if (!prev) {
            return updated || null;
          }
          if (!updated) {
            return prev;
          }
          if (
            prev.id === updated.id &&
            prev.status === updated.status &&
            prev.started_at === updated.started_at &&
            prev.patient_name === updated.patient_name &&
            prev.patient_photo_url === updated.patient_photo_url
          ) {
            return prev;
          }
          return updated;
        });
      }

      setError('');
    } catch (err) {
      setError(err.message);
      if (err.message.includes('Session expired') || err.message.includes('Not authenticated')) {
        return;
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const [consultationDocuments, setConsultationDocuments] = useState([]);

  const fetchMessages = async (consultationId) => {
    try {
      const data = await apiRequest(`/consultation/${consultationId}/messages`);
      // Handle both old format (array) and new format (object with messages and documents)
      if (Array.isArray(data)) {
        setMessages(data);
        setConsultationDocuments([]);
      } else if (data && data.messages) {
        setMessages(Array.isArray(data.messages) ? data.messages : []);
        setConsultationDocuments(Array.isArray(data.documents) ? data.documents : []);
      } else {
        setMessages([]);
        setConsultationDocuments([]);
      }
    } catch (err) {
      // Silent fail for message fetching
      setMessages([]);
      setConsultationDocuments([]);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConsultation) return;

    const messageToSend = messageText.trim();
    setMessageText('');
    setSending(true);
    try {
      await apiRequest(`/consultation/${selectedConsultation.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: messageToSend })
      });
      await fetchMessages(selectedConsultation.id);
    } catch (err) {
      if (err.name === 'TypeError' || err.message.includes('fetch') || err.message.includes('Network')) {
        setTimeout(() => {
          fetchMessages(selectedConsultation.id);
        }, 500);
        return;
      }
      setTimeout(() => {
        fetchMessages(selectedConsultation.id);
      }, 500);
    } finally {
      setSending(false);
    }
  };

  const handleEndConsultation = async () => {
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

      fetchConsultations();
      setSelectedConsultation(null);
      setMessages([]);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} thickness={4} sx={{ color: isDark ? '#60A5FA' : '#3B82F6' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: isDark ? '#0F172A' : '#F8FAFC'
    }}>
      {/* Header */}
      <Box sx={{ 
        bgcolor: isDark ? '#1E293B' : '#FFFFFF',
        borderBottom: `1px solid ${isDark ? 'rgba(30, 41, 59, 0.8)' : '#E2E8F0'}`,
        px: 3,
        py: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" fontWeight="600" sx={{ fontSize: '1.25rem', color: isDark ? '#F1F5F9' : '#1E293B' }}>
            Active Consultations
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar - Consultations List */}
        <Box sx={{ 
          width: 320,
          bgcolor: isDark ? '#1E293B' : '#FFFFFF',
          borderRight: `1px solid ${isDark ? 'rgba(30, 41, 59, 0.8)' : '#E2E8F0'}`,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Box sx={{ p: 4, borderBottom: `1px solid ${isDark ? 'rgba(30, 41, 59, 0.8)' : '#E2E8F0'}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="caption" fontWeight="600" sx={{ 
                color: isDark ? '#64748B' : '#64748B',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Consultations
              </Typography>
              <Box sx={{ 
                bgcolor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#F1F5F9',
                px: 2,
                py: 0.5,
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: isDark ? '#60A5FA' : '#64748B'
              }}>
                {consultations.length}
              </Box>
            </Box>
            <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: '0.75rem' }}>
              Chat with your patients in real-time
            </Typography>
          </Box>

          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            {consultations.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <MessageCircleIcon sx={{ fontSize: 48, color: isDark ? '#475569' : '#CBD5E1', mb: 2 }} />
                <Typography variant="body2" sx={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                  No active consultations
                </Typography>
              </Box>
            ) : (
              consultations.map((consultation) => {
                const isSelected = selectedConsultation?.id === consultation.id;
                return (
                  <Button
                    key={consultation.id}
                    onClick={() => {
                      setSelectedConsultation(consultation);
                      fetchMessages(consultation.id);
                      markViewing(consultation.id);
                    }}
                    fullWidth
                    sx={{
                      p: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      borderBottom: `1px solid ${isDark ? 'rgba(30, 41, 59, 0.8)' : '#F1F5F9'}`,
                      borderRadius: 0,
                      textTransform: 'none',
                      bgcolor: isSelected 
                        ? (isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF')
                        : 'transparent',
                      borderLeft: isSelected ? `4px solid ${isDark ? '#60A5FA' : '#3B82F6'}` : '4px solid transparent',
                      '&:hover': {
                        bgcolor: isSelected 
                          ? (isDark ? 'rgba(59, 130, 246, 0.2)' : '#EFF6FF')
                          : (isDark ? 'rgba(30, 41, 59, 0.5)' : '#F8FAFC'),
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Avatar 
                      src={consultation.patient_photo_url}
                      sx={{ 
                        width: 48,
                        height: 48,
                        bgcolor: isDark ? '#475569' : '#E2E8F0',
                        color: isDark ? '#F1F5F9' : '#1E293B',
                        fontWeight: 600,
                        fontSize: '1.125rem'
                      }}
                    >
                      {consultation.patient_name?.charAt(0) || 'P'}
                    </Avatar>
                    <Box sx={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                      <Typography variant="body2" fontWeight="600" noWrap sx={{ 
                        color: isDark ? '#F1F5F9' : '#1E293B',
                        fontSize: '0.875rem',
                        mb: 0.5
                      }}>
                        {consultation.patient_name || 'Patient'}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: isDark ? '#94A3B8' : '#64748B',
                        fontSize: '0.75rem'
                      }}>
                        {new Date(consultation.started_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <MessageCircleIcon sx={{ 
                      fontSize: 16, 
                      color: isDark ? '#475569' : '#CBD5E1',
                      flexShrink: 0
                    }} />
                  </Button>
                );
              })
            )}
          </Box>
        </Box>

        {/* Chat Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: isDark ? '#0F172A' : '#F8FAFC' }}>
          {selectedConsultation ? (
            <>
              {/* Chat Header */}
              <Box sx={{ 
                bgcolor: isDark ? '#1E293B' : '#FFFFFF',
                borderBottom: `1px solid ${isDark ? 'rgba(30, 41, 59, 0.8)' : '#E2E8F0'}`,
                px: 6,
                py: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Avatar 
                    src={selectedConsultation.patient_photo_url} 
                    sx={{ 
                      bgcolor: isDark ? '#475569' : '#E2E8F0',
                      color: isDark ? '#F1F5F9' : '#1E293B',
                      width: 44,
                      height: 44,
                      fontWeight: 600
                    }}
                  >
                    {selectedConsultation.patient_name?.charAt(0) || 'P'}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight="600" sx={{ color: isDark ? '#F1F5F9' : '#1E293B', mb: 0.5 }}>
                      {selectedConsultation.patient_name || 'Patient'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <ClockIcon sx={{ fontSize: 12, color: isDark ? '#94A3B8' : '#64748B' }} />
                      <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: '0.75rem' }}>
                        Started: {new Date(selectedConsultation.started_at).toLocaleDateString()}, {new Date(selectedConsultation.started_at).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleEndConsultation}
                  startIcon={<CloseIcon />}
                  sx={{
                    borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : '#FEE2E2',
                    color: isDark ? '#F87171' : '#DC2626',
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEE2E2',
                    '&:hover': {
                      borderColor: isDark ? 'rgba(239, 68, 68, 0.5)' : '#FCA5A5',
                      bgcolor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  End Chat
                </Button>
              </Box>

              {/* Messages */}
              <Box sx={{ 
                flex: 1, 
                overflowY: 'auto', 
                overflowX: 'hidden',
                p: 6,
                bgcolor: isDark ? '#0F172A' : '#F8FAFC',
                minHeight: 0, // Important for flex scrolling
                maxHeight: '100%'
              }}>
                {messages.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <MessageCircleIcon sx={{ fontSize: 64, color: isDark ? '#475569' : '#CBD5E1', mb: 2 }} />
                    <Typography variant="h6" fontWeight="500" sx={{ color: isDark ? '#94A3B8' : '#64748B', mb: 1 }}>
                      No consultation selected
                    </Typography>
                    <Typography variant="body2" sx={{ color: isDark ? '#64748B' : '#94A3B8' }}>
                      Select a consultation to start chatting
                    </Typography>
                  </Box>
                ) : (
                  <>
                    {/* Shared Documents Section */}
                    {consultationDocuments && consultationDocuments.length > 0 && (
                      <Box sx={{ mb: 4, p: 3, bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : '#FFFFFF', borderRadius: 3, border: `1px solid ${isDark ? 'rgba(30, 41, 59, 0.8)' : '#E2E8F0'}` }}>
                        <Typography variant="subtitle2" fontWeight="600" sx={{ color: isDark ? '#F1F5F9' : '#1E293B', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DescriptionIcon sx={{ fontSize: 20 }} />
                          Shared Documents ({consultationDocuments.length})
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          {consultationDocuments.map((doc) => (
                            <Box
                              key={doc.id}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                p: 2,
                                bgcolor: isDark ? 'rgba(15, 23, 42, 0.5)' : '#F8FAFC',
                                borderRadius: 2,
                                border: `1px solid ${isDark ? 'rgba(30, 41, 59, 0.8)' : '#E2E8F0'}`,
                                '&:hover': {
                                  bgcolor: isDark ? 'rgba(15, 23, 42, 0.7)' : '#F1F5F9',
                                },
                                transition: 'all 0.2s',
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
                                <DescriptionIcon sx={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 24 }} />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography variant="body2" fontWeight="500" sx={{ color: isDark ? '#F1F5F9' : '#1E293B', mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {doc.file_name || 'Untitled Document'}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: '0.75rem' }}>
                                    {doc.file_size ? `${(doc.file_size / 1024 / 1024).toFixed(2)} MB` : ''} • {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'N/A'}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<VisibilityIcon />}
                                  onClick={() => {
                                    if (doc.download_url) {
                                      window.open(doc.download_url, '_blank', 'noopener,noreferrer');
                                    }
                                  }}
                                  sx={{
                                    textTransform: 'none',
                                    fontSize: '0.75rem',
                                    borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#3B82F6',
                                    color: isDark ? '#60A5FA' : '#3B82F6',
                                    '&:hover': {
                                      borderColor: isDark ? 'rgba(59, 130, 246, 0.5)' : '#2563EB',
                                      bgcolor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF',
                                    },
                                  }}
                                >
                                  View
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<DownloadIcon />}
                                  onClick={() => {
                                    if (doc.download_url) {
                                      const link = document.createElement('a');
                                      link.href = doc.download_url;
                                      link.download = doc.file_name || 'document';
                                      link.target = '_blank';
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                    }
                                  }}
                                  sx={{
                                    textTransform: 'none',
                                    fontSize: '0.75rem',
                                    borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#10B981',
                                    color: isDark ? '#34D399' : '#10B981',
                                    '&:hover': {
                                      borderColor: isDark ? 'rgba(16, 185, 129, 0.5)' : '#059669',
                                      bgcolor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#D1FAE5',
                                    },
                                  }}
                                >
                                  Download
                                </Button>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}
                    {messages.map((message) => {
                    const isDoctor = message.sender_type === 'doctor';
                    return (
                      <Box
                        key={message.id}
                        sx={{
                          display: 'flex',
                          justifyContent: isDoctor ? 'flex-end' : 'flex-start',
                          mb: 4
                        }}
                      >
                        <Box sx={{ 
                          maxWidth: '70%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isDoctor ? 'flex-end' : 'flex-start'
                        }}>
                          <Box
                            sx={{
                              px: 4,
                              py: 3,
                              borderRadius: 4,
                              bgcolor: isDoctor 
                                ? (isDark ? '#3B82F6' : '#3B82F6')
                                : (isDark ? '#1E293B' : '#FFFFFF'),
                              color: isDoctor ? '#FFFFFF' : (isDark ? '#F1F5F9' : '#1E293B'),
                              border: isDoctor ? 'none' : `1px solid ${isDark ? 'rgba(30, 41, 59, 0.8)' : '#E2E8F0'}`,
                              borderBottomRightRadius: isDoctor ? 4 : 16,
                              borderBottomLeftRadius: isDoctor ? 16 : 4,
                            }}
                          >
                            <Typography variant="body2" sx={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                              {message.content}
                            </Typography>
                            {Array.isArray(message.attachments) && message.attachments.length > 0 && (
                              <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {message.attachments.map((doc) => (
                                  <Box key={doc.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                    <DescriptionIcon sx={{ fontSize: 18, opacity: 0.9 }} />
                                    <Typography variant="body2" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {doc.file_name || 'Document'}
                                    </Typography>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      startIcon={<VisibilityIcon />}
                                      onClick={() => doc.download_url && window.open(doc.download_url, '_blank', 'noopener,noreferrer')}
                                      sx={{
                                        textTransform: 'none',
                                        fontSize: '0.75rem',
                                        borderColor: isDoctor ? 'rgba(255,255,255,0.7)' : (isDark ? 'rgba(59, 130, 246, 0.3)' : '#3B82F6'),
                                        color: isDoctor ? '#fff' : (isDark ? '#60A5FA' : '#3B82F6'),
                                      }}
                                    >
                                      View
                                    </Button>
                                  </Box>
                                ))}
                              </Box>
                            )}
                          </Box>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              mt: 1.5,
                              px: 1,
                              fontSize: '0.75rem',
                              color: isDark ? '#64748B' : '#94A3B8'
                            }}
                          >
                            {new Date(message.sent_at).toLocaleTimeString()}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </>
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Message Input */}
              <Box sx={{ 
                bgcolor: isDark ? '#1E293B' : '#FFFFFF',
                borderTop: `1px solid ${isDark ? 'rgba(30, 41, 59, 0.8)' : '#E2E8F0'}`,
                p: 4
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <TextField
                    fullWidth
                    size="medium"
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
                        borderRadius: 3,
                        bgcolor: isDark ? '#0F172A' : '#F8FAFC',
                        '& fieldset': {
                          borderColor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#E2E8F0'
                        },
                        '&:hover fieldset': {
                          borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#CBD5E1'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: isDark ? '#60A5FA' : '#3B82F6'
                        }
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sending}
                    startIcon={sending ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                    sx={{
                      minWidth: 120,
                      borderRadius: 3,
                      bgcolor: isDark ? '#3B82F6' : '#3B82F6',
                      color: 'white',
                      textTransform: 'none',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        bgcolor: isDark ? '#2563EB' : '#2563EB'
                      },
                      '&:disabled': {
                        bgcolor: isDark ? '#475569' : '#CBD5E1',
                        color: isDark ? '#64748B' : '#94A3B8'
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Send
                  </Button>
                </Box>
              </Box>
            </>
          ) : (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{ textAlign: 'center' }}>
                <MessageCircleIcon sx={{ fontSize: 64, color: isDark ? '#475569' : '#CBD5E1', mb: 2 }} />
                <Typography variant="h6" fontWeight="500" sx={{ color: isDark ? '#94A3B8' : '#64748B', mb: 1 }}>
                  No consultation selected
                </Typography>
                <Typography variant="body2" sx={{ color: isDark ? '#64748B' : '#94A3B8' }}>
                  Select a consultation to start chatting
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default ActiveConsultations;
