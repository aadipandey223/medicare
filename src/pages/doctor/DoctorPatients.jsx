import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Container, Paper, Card, CardContent,
  Grid, CircularProgress, Alert, Avatar, Chip, Fade, Zoom,
  TextField, InputAdornment, Divider, Button, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton
} from '@mui/material';
import { 
  Person as PersonIcon, 
  Search,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';
import { apiRequest } from '../../api/api';

function DoctorPatients() {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const [patients, setPatients] = useState([]);
  const [curedPatients, setCuredPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState(0);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [markingCured, setMarkingCured] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, [tab]);

  useEffect(() => {
    const patientsToFilter = tab === 0 ? patients : curedPatients;
    if (searchQuery.trim() === '') {
      setFilteredPatients(patientsToFilter);
    } else {
      const filtered = patientsToFilter.filter(patient =>
        patient.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  }, [searchQuery, patients, curedPatients, tab]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      
      const [allData, curedData] = await Promise.all([
        apiRequest('/doctor/patients'),
        apiRequest('/doctor/patients?cured=true')
      ]);
      
      const uncuredData = Array.isArray(allData) ? allData.filter(p => !p.is_cured) : [];
      const curedArray = Array.isArray(curedData) ? curedData : [];
      
      setPatients(uncuredData);
      setCuredPatients(curedArray);
      setFilteredPatients(tab === 0 ? uncuredData : curedArray);
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

  const handleMarkAsCured = async (patientId, e) => {
    e.stopPropagation();
    if (!window.confirm('Mark this patient as fully cured?')) {
      return;
    }

    setMarkingCured(true);
    try {
      await apiRequest(`/doctor/patients/${patientId}/mark-cured`, { method: 'POST' });
      await fetchPatients();
    } catch (err) {
      setError(err.message);
    } finally {
      setMarkingCured(false);
    }
  };

  const handleMarkAsUncured = async (patientId, e) => {
    e.stopPropagation();
    if (!window.confirm('Move this patient back to active patients?')) {
      return;
    }

    setMarkingCured(true);
    try {
      await apiRequest(`/doctor/patients/${patientId}/mark-uncured`, { method: 'POST' });
      await fetchPatients();
    } catch (err) {
      setError(err.message);
    } finally {
      setMarkingCured(false);
    }
  };

  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
    setProfileOpen(true);
  };

  const handleCloseProfile = () => {
    setProfileOpen(false);
    setSelectedPatient(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: isDark ? '#0F172A' : '#FAFAFA', height: '100%', overflow: 'auto', py: 3 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 3 } }}>
        <Fade in timeout={800}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="600" sx={{ color: isDark ? '#F1F5F9' : '#111827', mb: 1 }}>
              Patient Management
            </Typography>
            <Typography variant="body1" sx={{ color: isDark ? '#94A3B8' : '#6B7280', fontSize: '0.9375rem' }}>
              View and manage all your patients
            </Typography>
          </Box>
        </Fade>

        <Paper 
          sx={{ 
            borderRadius: 2,
            border: `1px solid ${isDark ? 'rgba(30, 41, 59, 0.8)' : '#E5E7EB'}`,
            bgcolor: isDark ? '#1E293B' : '#FFFFFF',
            boxShadow: 'none',
            mb: 2.5
          }}
        >
          <Box sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5 }}>
              <Button
                variant={tab === 0 ? 'contained' : 'text'}
                onClick={() => setTab(0)}
                sx={{
                  px: 2.5,
                  py: 1.25,
                  borderRadius: 2,
                  bgcolor: tab === 0 ? (isDark ? '#3B82F6' : '#111827') : 'transparent',
                  color: tab === 0 ? 'white' : (isDark ? '#F1F5F9' : '#374151'),
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: tab === 0 ? (isDark ? '#2563EB' : '#1F2937') : (isDark ? 'rgba(30, 41, 59, 0.6)' : '#F3F4F6')
                  }
                }}
              >
                Active Patients ({patients.length})
              </Button>
              <Button
                variant={tab === 1 ? 'contained' : 'text'}
                onClick={() => setTab(1)}
                sx={{
                  px: 2.5,
                  py: 1.25,
                  borderRadius: 2,
                  bgcolor: tab === 1 ? (isDark ? '#3B82F6' : '#111827') : 'transparent',
                  color: tab === 1 ? 'white' : (isDark ? '#F1F5F9' : '#374151'),
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: tab === 1 ? (isDark ? '#2563EB' : '#1F2937') : (isDark ? 'rgba(30, 41, 59, 0.6)' : '#F3F4F6')
                  }
                }}
              >
                Cured ({curedPatients.length})
              </Button>
            </Box>

            <TextField
              fullWidth
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: isDark ? '#64748B' : '#9CA3AF' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : '#F9FAFB',
                  color: isDark ? '#F1F5F9' : '#111827',
                  '& fieldset': {
                    borderColor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#E5E7EB'
                  },
                  '&:hover fieldset': {
                    borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#D1D5DB'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: isDark ? '#60A5FA' : '#111827'
                  }
                }
              }}
            />
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {filteredPatients.length === 0 ? (
          <Zoom in timeout={600}>
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
                {searchQuery ? 'No Patients Found' : tab === 0 ? 'No Patients Yet' : 'No Cured Patients'}
              </Typography>
              <Typography variant="body1" sx={{ color: isDark ? '#94A3B8' : '#6B7280', maxWidth: 448, mx: 'auto' }}>
                {searchQuery 
                  ? 'Try a different search term'
                  : tab === 0
                  ? 'Patients who have consulted with you will appear here.'
                  : 'Patients marked as cured will appear here.'}
              </Typography>
            </Paper>
          </Zoom>
        ) : (
          <Grid container spacing={3}>
            {filteredPatients.map((patient, index) => (
              <Grid item xs={12} sm={6} md={4} key={patient.id}>
                <Zoom in timeout={400 + (index * 100)}>
                  <Card 
                    onClick={() => handlePatientClick(patient)}
                    sx={{ 
                      borderRadius: 3, 
                      border: `1px solid ${isDark ? 'rgba(30, 41, 59, 0.8)' : '#E5E7EB'}`,
                      boxShadow: 'none',
                      bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : '#F9FAFB',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      height: '100%',
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: isDark ? '0 12px 24px rgba(0,0,0,0.3)' : '0 12px 24px rgba(0,0,0,0.08)',
                        borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#D1D5DB',
                        transform: 'translateY(-4px)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <Avatar 
                          src={patient.photo_url}
                          sx={{ 
                            width: 80, 
                            height: 80, 
                            bgcolor: isDark ? '#475569' : '#E5E7EB',
                            fontSize: '2rem',
                            fontWeight: 600,
                            color: isDark ? '#F1F5F9' : '#374151',
                            mb: 2
                          }}
                        >
                          {patient.name?.charAt(0).toUpperCase() || <PersonIcon />}
                        </Avatar>
                        <Typography variant="h6" fontWeight="600" sx={{ color: isDark ? '#F1F5F9' : '#111827', mb: 0.5 }}>
                          {patient.name || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#6B7280', mb: 0.5 }}>
                          Patient ID: {patient.id}
                        </Typography>
                        <Typography variant="caption" sx={{ color: isDark ? '#64748B' : '#9CA3AF', mb: 3, fontFamily: 'monospace', fontSize: '0.7rem' }}>
                          {patient.email || 'N/A'}
                        </Typography>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<CheckCircleIcon />}
                          onClick={(e) => patient.is_cured ? handleMarkAsUncured(patient.id, e) : handleMarkAsCured(patient.id, e)}
                          disabled={markingCured}
                          sx={{
                            py: 1.5,
                            borderRadius: 2,
                            bgcolor: patient.is_cured ? (isDark ? '#475569' : '#6B7280') : (isDark ? '#10B981' : '#10B981'),
                            color: 'white',
                            fontWeight: 500,
                            textTransform: 'none',
                            '&:hover': {
                              bgcolor: patient.is_cured ? (isDark ? '#334155' : '#4B5563') : (isDark ? '#059669' : '#059669')
                            },
                            '&:disabled': {
                              bgcolor: isDark ? '#475569' : '#D1D5DB'
                            }
                          }}
                        >
                          {patient.is_cured ? 'Move to Active' : 'Mark as Cured'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Dialog 
        open={profileOpen} 
        onClose={handleCloseProfile}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: isDark ? '#1E293B' : '#FFFFFF',
            border: `1px solid ${isDark ? 'rgba(30, 41, 59, 0.8)' : '#E5E7EB'}`
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${isDark ? 'rgba(30, 41, 59, 0.8)' : '#E5E7EB'}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" fontWeight="600" sx={{ color: isDark ? '#F1F5F9' : '#111827' }}>
              Patient Profile
            </Typography>
            <IconButton onClick={handleCloseProfile} sx={{ color: isDark ? '#94A3B8' : '#6B7280' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedPatient && (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                <Avatar 
                  src={selectedPatient.photo_url}
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    bgcolor: isDark ? '#475569' : '#E5E7EB',
                    fontSize: '3rem',
                    fontWeight: 600,
                    color: isDark ? '#F1F5F9' : '#374151',
                    mb: 2
                  }}
                >
                  {selectedPatient.name?.charAt(0).toUpperCase() || <PersonIcon />}
                </Avatar>
                <Typography variant="h4" fontWeight="600" sx={{ color: isDark ? '#F1F5F9' : '#111827', mb: 0.5 }}>
                  {selectedPatient.name || 'Unknown'}
                </Typography>
                <Typography variant="body2" sx={{ color: isDark ? '#94A3B8' : '#6B7280', mb: 1 }}>
                  Patient ID: {selectedPatient.id}
                </Typography>
                {selectedPatient.is_cured && (
                  <Chip 
                    icon={<CheckCircleIcon />}
                    label="Fully Cured" 
                    sx={{ 
                      bgcolor: isDark ? '#10B981' : '#10B981',
                      color: 'white',
                      fontWeight: 500,
                      mt: 1
                    }}
                  />
                )}
              </Box>

              <Divider sx={{ my: 3, borderColor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#E5E7EB' }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#6B7280', fontWeight: 600, fontSize: '0.75rem' }}>
                      Email
                    </Typography>
                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, color: isDark ? '#F1F5F9' : '#111827' }}>
                      <EmailIcon fontSize="small" sx={{ color: isDark ? '#64748B' : '#9CA3AF' }} />
                      {selectedPatient.email || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#6B7280', fontWeight: 600, fontSize: '0.75rem' }}>
                      Phone
                    </Typography>
                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, color: isDark ? '#F1F5F9' : '#111827' }}>
                      <PhoneIcon fontSize="small" sx={{ color: isDark ? '#64748B' : '#9CA3AF' }} />
                      {selectedPatient.phone || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#6B7280', fontWeight: 600, fontSize: '0.75rem' }}>
                      Age
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5, color: isDark ? '#F1F5F9' : '#111827' }}>
                      {selectedPatient.age || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#6B7280', fontWeight: 600, fontSize: '0.75rem' }}>
                      Gender
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5, color: isDark ? '#F1F5F9' : '#111827' }}>
                      {selectedPatient.gender || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#6B7280', fontWeight: 600, fontSize: '0.75rem', display: 'block', mb: 1 }}>
                      Medical History
                    </Typography>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : '#F9FAFB', 
                        borderRadius: 2,
                        border: `1px solid ${isDark ? 'rgba(30, 41, 59, 0.8)' : '#E5E7EB'}`,
                        minHeight: 100
                      }}
                    >
                      <Typography variant="body2" sx={{ color: isDark ? '#94A3B8' : '#6B7280', whiteSpace: 'pre-wrap' }}>
                        {selectedPatient.medical_history || 'No medical history recorded.'}
                      </Typography>
                    </Paper>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: `1px solid ${isDark ? 'rgba(30, 41, 59, 0.8)' : '#E5E7EB'}` }}>
          {selectedPatient && (
            <>
              {selectedPatient.is_cured ? (
                <Button
                  variant="outlined"
                  onClick={(e) => {
                    handleMarkAsUncured(selectedPatient.id, e);
                    handleCloseProfile();
                  }}
                  disabled={markingCured}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 500,
                    borderColor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#E5E7EB',
                    color: isDark ? '#F1F5F9' : '#374151',
                    '&:hover': {
                      borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#D1D5DB',
                      bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : '#F9FAFB'
                    }
                  }}
                >
                  Move to Active Patients
                </Button>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<CheckCircleIcon />}
                  onClick={(e) => {
                    handleMarkAsCured(selectedPatient.id, e);
                    handleCloseProfile();
                  }}
                  disabled={markingCured}
                  sx={{
                    borderRadius: 2,
                    bgcolor: isDark ? '#10B981' : '#10B981',
                    color: 'white',
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      bgcolor: isDark ? '#059669' : '#059669'
                    },
                    '&:disabled': {
                      bgcolor: isDark ? '#475569' : '#D1D5DB'
                    }
                  }}
                >
                  Mark as Cured
                </Button>
              )}
            </>
          )}
          <Button 
            onClick={handleCloseProfile} 
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              borderColor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#E5E7EB',
              color: isDark ? '#F1F5F9' : '#374151',
              '&:hover': {
                borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#D1D5DB',
                bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : '#F9FAFB'
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DoctorPatients;
