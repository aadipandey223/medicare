import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Grid, Card, CardContent, Avatar, Button, 
  Container, Chip, TextField, InputAdornment, Fade, Paper, CircularProgress, Alert, Stack
} from '@mui/material';
import { 
  LocalHospital as LocalHospitalIcon,
  Search as SearchIcon,
  VerifiedUser,
  Person as PersonIcon
} from '@mui/icons-material';

function Doctors() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [activeConsultations, setActiveConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch doctors
        const doctorsResponse = await fetch('/api/doctors');
        if (!doctorsResponse.ok) {
          throw new Error('Failed to fetch doctors');
        }
        const doctorsData = await doctorsResponse.json();
        setDoctors(doctorsData);
        
        // Fetch active consultations
        const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('token')) || localStorage.getItem('token');
        if (token) {
          try {
            const consultationsResponse = await fetch('/api/consultation/active', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            if (consultationsResponse.ok) {
              const consultationsData = await consultationsResponse.json();
              setActiveConsultations(consultationsData || []);
            }
          } catch (err) {
            // Silent fail for consultations
            console.warn('Failed to fetch consultations:', err);
          }
        }
        
        setError('');
      } catch (err) {
        setError(err.message || 'Unable to load doctors');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Helper function to check if doctor has active consultation
  const hasActiveConsultation = (doctorId) => {
    return activeConsultations.some(cons => cons.doctor_id === doctorId);
  };

  // Memoize filtered doctors for performance
  const filteredDoctors = useMemo(() => {
    if (!search.trim()) return doctors;
    const searchLower = search.toLowerCase();
    return doctors.filter(doc => 
      (doc.name || '').toLowerCase().includes(searchLower) ||
      (doc.specialization || '').toLowerCase().includes(searchLower) ||
      (doc.hospital || '').toLowerCase().includes(searchLower)
    );
  }, [doctors, search]);

  return (
    <Box sx={{ 
      background: 'linear-gradient(165deg, #0f172a 0%, #1e293b 50%, #1e3a5f 100%)',
      minHeight: '100vh', 
      py: 5,
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(34, 211, 238, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(251, 146, 60, 0.08) 0%, transparent 50%)',
        pointerEvents: 'none'
      }
    }}>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in timeout={600}>
          <Box>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Box sx={{ 
                display: 'inline-flex',
                p: 3,
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #22d3ee 0%, #fb923c 100%)',
                mb: 3,
                boxShadow: '0 10px 40px rgba(34, 211, 238, 0.3)'
              }}>
                <LocalHospitalIcon sx={{ fontSize: 64, color: 'white' }} />
              </Box>
              <Typography variant="h3" fontWeight="700" gutterBottom sx={{ 
                color: 'white',
                letterSpacing: '-1px',
                mb: 2
              }}>
                Find Your Doctor
              </Typography>
              <Typography variant="h6" sx={{ 
                color: 'rgba(255,255,255,0.7)', 
                fontWeight: 400,
                mb: 4,
                maxWidth: 600,
                mx: 'auto'
              }}>
                Connect with caring professionals for your wellness journey
              </Typography>

              {/* Search Bar */}
              <Paper elevation={0} sx={{ 
                maxWidth: 650, 
                mx: 'auto',
                borderRadius: 4,
                overflow: 'hidden',
                bgcolor: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.12)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(34, 211, 238, 0.4)'
                }
              }}>
                <TextField
                  fullWidth
                  placeholder="Search by name, specialty, or hospital..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#22d3ee', fontSize: 24 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { border: 'none' },
                      fontSize: '1.05rem',
                      py: 0.8,
                      color: 'white',
                      '& input::placeholder': {
                        color: 'rgba(255,255,255,0.5)',
                        opacity: 1
                      }
                    }
                  }}
                />
              </Paper>
            </Box>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 3,
                  bgcolor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5',
                  backdropFilter: 'blur(20px)'
                }}
              >
                {error}
              </Alert>
            )}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress sx={{ color: '#22d3ee' }} size={50} />
              </Box>
            ) : (
            <>
            {/* Stats */}
            <Box sx={{ display: 'flex', gap: 2, mb: 5, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Chip 
                label={`${doctors.length} Doctors`}
                sx={{ 
                  bgcolor: 'rgba(34, 211, 238, 0.15)',
                  backdropFilter: 'blur(10px)',
                  color: '#67e8f9',
                  fontWeight: 600,
                  px: 2.5,
                  py: 2.8,
                  fontSize: '0.95rem',
                  border: '1px solid rgba(34, 211, 238, 0.3)',
                  borderRadius: 3
                }}
              />
              <Chip 
                label={`${doctors.filter(d => d.is_online).length} Online`}
                sx={{ 
                  bgcolor: 'rgba(34, 197, 94, 0.15)',
                  backdropFilter: 'blur(10px)',
                  color: '#86efac',
                  fontWeight: 600,
                  px: 2.5,
                  py: 2.8,
                  fontSize: '0.95rem',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: 3
                }}
              />
              <Chip 
                label="Verified" 
                icon={<VerifiedUser sx={{ color: '#fb923c !important' }} />}
                sx={{ 
                  bgcolor: 'rgba(251, 146, 60, 0.15)',
                  backdropFilter: 'blur(10px)',
                  color: '#fdba74',
                  fontWeight: 600,
                  px: 2.5,
                  py: 2.8,
                  fontSize: '0.95rem',
                  border: '1px solid rgba(251, 146, 60, 0.3)',
                  borderRadius: 3
                }}
              />
            </Box>

            {/* Doctors Grid */}
            <Grid container spacing={3}>
              {filteredDoctors.map((doc) => (
                <Grid item xs={12} sm={6} md={4} key={doc.id}>
                  <Fade in timeout={400}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 4,
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        bgcolor: 'rgba(30, 41, 59, 0.5)',
                        backdropFilter: 'blur(20px)',
                        overflow: 'hidden',
                        position: 'relative',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 20px 60px rgba(34, 211, 238, 0.25)',
                          border: '1px solid rgba(34, 211, 238, 0.5)',
                          bgcolor: 'rgba(30, 41, 59, 0.7)'
                        }
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', flex: 1, p: 4 }}>
                        <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                          {doc.is_online && (
                            <Box sx={{
                              position: 'absolute',
                              top: -5,
                              left: -5,
                              right: -5,
                              bottom: -5,
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #22d3ee, #22c55e)',
                              opacity: 0.3,
                              animation: 'pulse 2.5s ease-in-out infinite',
                              '@keyframes pulse': {
                                '0%, 100%': { transform: 'scale(1)', opacity: 0.3 },
                                '50%': { transform: 'scale(1.12)', opacity: 0.5 }
                              }
                            }} />
                          )}
                          <Avatar 
                            src={doc.photo_url}
                            sx={{ 
                              mx: 'auto', 
                              background: 'linear-gradient(135deg, #22d3ee 0%, #fb923c 100%)',
                              width: 100, 
                              height: 100,
                              fontSize: '2.5rem',
                              border: '3px solid rgba(255,255,255,0.15)',
                              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                            }}
                          >
                            {(doc.name || 'Dr')[0] || 'D'}
                          </Avatar>
                          {doc.is_online && (
                            <Box sx={{
                              position: 'absolute',
                              bottom: 5,
                              right: 5,
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              bgcolor: '#22c55e',
                              border: '3px solid #1e293b',
                              boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.4)'
                            }} />
                          )}
                        </Box>

                        <Typography variant="h5" fontWeight="700" gutterBottom sx={{ 
                          color: 'white',
                          letterSpacing: '-0.5px',
                          mb: 1
                        }}>
                          {doc.name}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                          {doc.specialization && (
                            <Chip 
                              label={doc.specialization} 
                              size="small"
                              sx={{
                                bgcolor: 'rgba(34, 211, 238, 0.2)',
                                color: '#67e8f9',
                                fontWeight: 600,
                                border: '1px solid rgba(34, 211, 238, 0.3)',
                                fontSize: '0.85rem'
                              }}
                            />
                          )}
                          {doc.hospital && (
                            <Typography variant="body2" sx={{ 
                              color: 'rgba(255,255,255,0.6)',
                              fontWeight: 400,
                              fontSize: '0.9rem'
                            }}>
                              {doc.hospital}
                            </Typography>
                          )}
                          {doc.id_card_url && (
                            <Box sx={{ 
                              mt: 1,
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: 'rgba(251, 146, 60, 0.15)',
                              border: '1px solid rgba(251, 146, 60, 0.3)',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                bgcolor: 'rgba(251, 146, 60, 0.25)',
                                transform: 'scale(1.02)'
                              }
                            }}
                            onClick={() => window.open(doc.id_card_url, '_blank')}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                                <VerifiedUser sx={{ fontSize: 16, color: '#fdba74' }} />
                                <Typography variant="caption" sx={{ 
                                  color: '#fdba74',
                                  fontWeight: 600,
                                  fontSize: '0.75rem'
                                }}>
                                  View ID Card
                                </Typography>
                              </Box>
                            </Box>
                          )}
                        </Box>

                        <Stack spacing={1.5} sx={{ mt: 2 }}>
                          <Button 
                            variant="outlined"
                            fullWidth
                            size="medium"
                            startIcon={<PersonIcon />}
                            onClick={() => navigate(`/doctor-profile/${doc.id}`)}
                            sx={{ 
                              py: 1, 
                              fontWeight: 600, 
                              borderRadius: 2,
                              fontSize: '0.875rem',
                              textTransform: 'none',
                              borderColor: 'rgba(255,255,255,0.2)',
                              color: 'white',
                              '&:hover': {
                                borderColor: 'rgba(255,255,255,0.4)',
                                bgcolor: 'rgba(255,255,255,0.05)',
                              },
                            }}
                          >
                            View Profile
                          </Button>
                          
                          <Button 
                            variant="contained" 
                            fullWidth
                            size="large"
                            disabled={!doc.is_online}
                            href={hasActiveConsultation(doc.id) ? '/consult' : `/consult?doctorId=${encodeURIComponent(doc.id)}`}
                            sx={{ 
                              py: 1.5, 
                              fontWeight: 700, 
                              borderRadius: 3,
                              fontSize: '1rem',
                              textTransform: 'none',
                              background: hasActiveConsultation(doc.id)
                                ? 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)'
                                : (doc.is_online 
                                  ? 'linear-gradient(135deg, #22d3ee 0%, #22c55e 100%)'
                                  : 'rgba(71, 85, 105, 0.4)'),
                              color: 'white',
                              boxShadow: (doc.is_online || hasActiveConsultation(doc.id)) 
                                ? (hasActiveConsultation(doc.id) 
                                  ? '0 8px 24px rgba(245, 158, 11, 0.4)' 
                                  : '0 8px 24px rgba(34, 211, 238, 0.4)')
                                : 'none',
                              border: doc.is_online ? 'none' : '1px solid rgba(255,255,255,0.1)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: (doc.is_online || hasActiveConsultation(doc.id)) ? 'translateY(-2px)' : 'none',
                                boxShadow: (doc.is_online || hasActiveConsultation(doc.id))
                                  ? (hasActiveConsultation(doc.id)
                                    ? '0 12px 32px rgba(245, 158, 11, 0.5)'
                                    : '0 12px 32px rgba(34, 211, 238, 0.5)')
                                  : 'none',
                                background: hasActiveConsultation(doc.id)
                                  ? 'linear-gradient(135deg, #d97706 0%, #ea580c 100%)'
                                  : (doc.is_online 
                                    ? 'linear-gradient(135deg, #06b6d4 0%, #16a34a 100%)'
                                    : 'rgba(71, 85, 105, 0.4)')
                              },
                              '&:disabled': {
                                color: 'rgba(255,255,255,0.4)'
                              }
                            }}
                          >
                            {hasActiveConsultation(doc.id) 
                              ? 'Consulting' 
                              : (doc.is_online ? 'Consult Now' : 'Offline')}
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              ))}
            </Grid>

            {filteredDoctors.length === 0 && (
              <Paper sx={{ 
                p: 6, 
                textAlign: 'center', 
                borderRadius: 4,
                bgcolor: 'rgba(30, 41, 59, 0.5)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <Typography variant="h6" sx={{ 
                  color: 'rgba(255,255,255,0.6)', 
                  fontWeight: 500 
                }}>
                  No doctors found matching your search.
                </Typography>
              </Paper>
            )}
            </>
            )}
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}

export default Doctors;