import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, Container, 
  Paper, Chip, Divider, Fade, Avatar, Button,
  Stepper, Step, StepLabel, StepContent, Tabs, Tab,
  TextField, CircularProgress, Alert, IconButton
} from '@mui/material';
import { 
  Timeline as TimelineIcon,
  UploadFile,
  Chat,
  Psychology,
  LocalHospital,
  CheckCircle,
  Schedule,
  Edit,
  Save,
  Cancel
} from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';

const rawApiBase = import.meta.env.VITE_API_URL || '/api';
const API_BASE_URL = rawApiBase.endsWith('/api')
  ? rawApiBase
  : `${rawApiBase.replace(/\/$/, '')}/api`;

function History() {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const [tab, setTab] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [isEditingHistory, setIsEditingHistory] = useState(false);
  const [savingHistory, setSavingHistory] = useState(false);
  const [originalHistory, setOriginalHistory] = useState('');

  useEffect(() => {
    fetchHistory();
    fetchMedicalHistory();
    // Poll for updates every 3 seconds
    const interval = setInterval(() => {
      fetchHistory(true);
      fetchMedicalHistory(true);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchHistory = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('token')) || localStorage.getItem('token');
      
      // Fetch consultations, documents, and combine into history
      const [consultationsRes, documentsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/consultation/active`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => null),
        fetch(`${API_BASE_URL}/patient/documents`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => null)
      ]);

      const consultations = consultationsRes?.ok ? await consultationsRes.json().catch(() => []) : [];
      const documents = documentsRes?.ok ? await documentsRes.json().catch(() => []) : [];

      // Transform into history format
      const historyItems = [];
      
      // Add consultations
      if (Array.isArray(consultations)) {
        consultations.forEach(consultation => {
          if (consultation && consultation.id) {
            historyItems.push({
              id: `consult-${consultation.id}`,
              type: 'Consult',
              desc: `Consultation with ${consultation.doctor_name || 'Doctor'}`,
              date: consultation.started_at ? new Date(consultation.started_at).toLocaleDateString() : new Date().toLocaleDateString(),
              time: consultation.started_at ? new Date(consultation.started_at).toLocaleTimeString() : '',
              icon: Chat,
              color: '#2196F3',
              status: consultation.status || 'active',
              notes: consultation.notes || ''
            });
          }
        });
      }

      // Add documents
      if (Array.isArray(documents)) {
        documents.forEach(doc => {
          if (doc && doc.id) {
            historyItems.push({
              id: `doc-${doc.id}`,
              type: 'Upload',
              desc: `Uploaded ${doc.name || doc.file_name || 'document'}`,
              date: doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : new Date().toLocaleDateString(),
              time: doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleTimeString() : '',
              icon: UploadFile,
              color: '#4CAF50',
              status: 'completed',
              documentId: doc.id
            });
          }
        });
      }

      // Sort by date (newest first)
      historyItems.sort((a, b) => {
        const dateA = new Date(a.date + ' ' + a.time);
        const dateB = new Date(b.date + ' ' + b.time);
        return dateB - dateA;
      });

      setHistory(historyItems);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load history');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchMedicalHistory = async (silent = false) => {
    try {
      const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('token')) || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMedicalHistory(data.medical_history || '');
        setOriginalHistory(data.medical_history || '');
      }
    } catch (err) {
      if (!silent) console.error('Failed to fetch medical history:', err);
    }
  };

  const handleSaveMedicalHistory = async () => {
    setSavingHistory(true);
    try {
      const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('token')) || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ medical_history: medicalHistory })
      });

      if (!response.ok) {
        throw new Error('Failed to save medical history');
      }

      setOriginalHistory(medicalHistory);
      setIsEditingHistory(false);
    } catch (err) {
      setError(err.message || 'Failed to save medical history');
    } finally {
      setSavingHistory(false);
    }
  };

  const handleCancelEdit = () => {
    setMedicalHistory(originalHistory);
    setIsEditingHistory(false);
  };

  const filteredHistory = tab === 0 
    ? history 
    : history.filter(item => {
        if (tab === 1) return item.type === 'Upload';
        if (tab === 2) return item.type === 'Consult';
        return true;
      });

  return (
    <Box sx={{ 
      height: '100%',
      width: '100%',
      py: 3,
      px: { xs: 2, sm: 3 },
      overflow: 'auto',
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
      <Box sx={{ position: 'relative', zIndex: 1, maxWidth: '900px', mx: 'auto' }}>
        <Fade in timeout={600}>
          <Box>
            {/* Header */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2.5, 
                mb: 2.5, 
                borderRadius: 2, 
                textAlign: 'center',
                background: 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)',
                color: 'white'
              }}
            >
              <TimelineIcon sx={{ fontSize: 48, mb: 1.5 }} />
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Medical History & Timeline
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Track your medical journey and health records
              </Typography>
            </Paper>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {/* Medical History Section */}
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                mb: 4, 
                borderRadius: 3,
                bgcolor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(226, 232, 240, 0.8)'}`,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography 
                  variant="h6" 
                  fontWeight="600"
                  sx={{ color: isDark ? '#F1F5F9' : undefined }}
                >
                  Medical History
                </Typography>
                {!isEditingHistory ? (
                  <IconButton onClick={() => setIsEditingHistory(true)} color="primary">
                    <Edit />
                  </IconButton>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton 
                      onClick={handleSaveMedicalHistory} 
                      color="primary"
                      disabled={savingHistory}
                    >
                      {savingHistory ? <CircularProgress size={20} /> : <Save />}
                    </IconButton>
                    <IconButton onClick={handleCancelEdit} color="error">
                      <Cancel />
                    </IconButton>
                  </Box>
                )}
              </Box>
              {isEditingHistory ? (
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  placeholder="Enter your medical history, including chronic conditions, allergies, medications, surgeries, etc."
                  variant="outlined"
                />
              ) : (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    p: 2, 
                    bgcolor: isDark ? 'rgba(15, 23, 42, 0.5)' : '#f5f5f5',
                    color: isDark ? '#CBD5E1' : undefined,
                    borderRadius: 1,
                    minHeight: 100,
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {medicalHistory || 'No medical history recorded. Click edit to add your medical history.'}
                </Typography>
              )}
            </Paper>

            {/* Stats */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Chip 
                label={`${history.length} Total Events`} 
                color="primary" 
                icon={<CheckCircle />}
              />
              <Chip 
                label={`${history.filter(h => h.type === 'Upload').length} Uploads`} 
                sx={{ bgcolor: '#4CAF50', color: 'white' }}
              />
              <Chip 
                label={`${history.filter(h => h.type === 'Consult').length} Consultations`} 
                sx={{ bgcolor: '#2196F3', color: 'white' }}
              />
            </Box>

            {/* Filter Tabs */}
            <Paper 
              elevation={3} 
              sx={{ 
                borderRadius: 3, 
                mb: 3,
                bgcolor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(226, 232, 240, 0.8)'}`,
              }}
            >
              <Tabs 
                value={tab} 
                onChange={(_, v) => setTab(v)} 
                centered
                TabIndicatorProps={{ style: { height: 3 } }}
                sx={{
                  '& .MuiTab-root': {
                    color: isDark ? '#94A3B8' : undefined,
                    '&.Mui-selected': {
                      color: isDark ? '#A78BFA' : undefined,
                    },
                  },
                }}
              >
                <Tab label="All" />
                <Tab label="Uploads" />
                <Tab label="Consultations" />
              </Tabs>
            </Paper>

            {/* Timeline */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress sx={{ color: isDark ? '#8B5CF6' : '#6366f1' }} />
              </Box>
            ) : (
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 4, 
                  borderRadius: 3,
                  bgcolor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                  border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(226, 232, 240, 0.8)'}`,
                }}
              >
                <Stepper orientation="vertical">
                  {filteredHistory.map((item, index) => (
                    <Step key={item.id} active={true} completed={item.status === 'completed'}>
                      <StepLabel
                        StepIconComponent={() => (
                          <Avatar sx={{ bgcolor: item.color, width: 40, height: 40 }}>
                            <item.icon />
                          </Avatar>
                        )}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography 
                            variant="h6" 
                            fontWeight="600"
                            sx={{ color: isDark ? '#F1F5F9' : undefined }}
                          >
                            {item.type}
                          </Typography>
                          <Chip 
                            label={item.date} 
                            size="small" 
                            icon={<Schedule />}
                            sx={{
                              bgcolor: isDark ? 'rgba(139, 92, 246, 0.15)' : undefined,
                              color: isDark ? '#A78BFA' : undefined,
                            }}
                          />
                          <Chip 
                            label={item.status} 
                            size="small" 
                            color="success"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </Box>
                      </StepLabel>
                      <StepContent>
                        <Card 
                          elevation={0} 
                          sx={{ 
                            bgcolor: isDark ? 'rgba(15, 23, 42, 0.5)' : '#fafafa',
                            border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : '#e0e0e0'}`,
                            borderRadius: 2,
                            mb: 2
                          }}
                        >
                          <CardContent>
                            <Typography 
                              variant="body1" 
                              gutterBottom
                              sx={{ color: isDark ? '#CBD5E1' : undefined }}
                            >
                              {item.desc}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ color: isDark ? '#94A3B8' : undefined }}
                            >
                              {item.time}
                            </Typography>
                            
                            {item.notes && (
                              <Box sx={{ 
                                mt: 2, 
                                p: 2, 
                                bgcolor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'white', 
                                borderRadius: 1 
                              }}>
                                <Typography 
                                  variant="caption" 
                                  fontWeight="600"
                                  sx={{ color: isDark ? '#94A3B8' : undefined }}
                                >
                                  Notes:
                                </Typography>
                                <Typography 
                                  variant="body2"
                                  sx={{ color: isDark ? '#CBD5E1' : undefined }}
                                >
                                  {item.notes}
                                </Typography>
                              </Box>
                            )}
                            
                            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                              {item.type === 'Upload' && item.documentId && (
                                <Button 
                                  size="small" 
                                  variant="text"
                                  onClick={() => {
                                    // Download document
                                    const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('token')) || localStorage.getItem('token');
                                    window.open(`${API_BASE_URL}/patient/documents/${item.documentId}/download?token=${token}`, '_blank');
                                  }}
                                >
                                  Download
                                </Button>
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>

                {filteredHistory.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <LocalHospital sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No records found for this category
                    </Typography>
                  </Box>
                )}
              </Paper>
            )}
          </Box>
        </Fade>
      </Box>
    </Box>
  );
}

export default History;
