import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Avatar,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Button,
  Stack,
} from '@mui/material';
import {
  VerifiedUser,
  LocalHospital,
  Star,
  Language,
  School,
  Work,
  ArrowBack,
  Circle,
} from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';
import BackButton from '../components/BackButton';

// Get API base URL from environment
const rawApiBase = import.meta.env.VITE_API_URL || '/api';
const API_BASE_URL = rawApiBase.endsWith('/api')
  ? rawApiBase
  : `${rawApiBase.replace(/\/$/, '')}/api`;

function DoctorProfile() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDoctorProfile();
  }, [doctorId]);

  const fetchDoctorProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}`);
      if (!response.ok) {
        throw new Error('Failed to load doctor profile');
      }
      const data = await response.json();
      setDoctor(data);
      
      // Fetch doctor ratings
      try {
        const ratingsResponse = await fetch(`${API_BASE_URL}/doctors/${doctorId}/ratings`);
        if (ratingsResponse.ok) {
          const ratingsData = await ratingsResponse.json();
          setDoctor(prev => ({ ...prev, ratings: ratingsData.ratings, averageRating: ratingsData.average, totalRatings: ratingsData.total }));
        }
      } catch (err) {
        console.error('Failed to load ratings:', err);
      }
    } catch (err) {
      setError(err.message || 'Failed to load doctor profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !doctor) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Doctor not found'}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        py: 3,
        px: { xs: 2, sm: 3 },
        overflow: 'auto',
        background: isDark
          ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)'
          : 'linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 50%, #F8FAFC 100%)',
      }}
    >
      <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
        <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
          <BackButton />
          <Typography variant="h5" fontWeight="bold" sx={{ color: isDark ? '#F1F5F9' : '#1E293B' }}>
            Doctor Profile
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                bgcolor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#FFFFFF',
                border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : '#E2E8F0'}`,
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Avatar
                  src={doctor.photo_url}
                  sx={{
                    width: 120,
                    height: 120,
                    mx: 'auto',
                    mb: 2,
                    fontSize: '3rem',
                    bgcolor: 'primary.main',
                  }}
                >
                  {doctor.name?.charAt(0) || 'D'}
                </Avatar>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 1, color: isDark ? '#F1F5F9' : '#1E293B' }}>
                  Dr. {doctor.name}
                </Typography>
                <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B', display: 'block', mb: 1 }}>
                  ID: {doctor.id}
                </Typography>
                <Chip
                  icon={<LocalHospital />}
                  label={doctor.specialization || 'General Practitioner'}
                  color="primary"
                  sx={{ mb: 2 }}
                />
                
                {/* Rating Display */}
                {doctor.averageRating > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, my: 2 }}>
                    <Star sx={{ color: '#FCD34D', fontSize: 24 }} />
                    <Typography variant="h6" fontWeight="bold" sx={{ color: isDark ? '#F1F5F9' : '#1E293B' }}>
                      {doctor.averageRating.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                      ({doctor.totalRatings} {doctor.totalRatings === 1 ? 'review' : 'reviews'})
                    </Typography>
                  </Box>
                )}
                
                <Stack spacing={1} sx={{ mt: 2 }}>
                  <Chip
                    icon={<Circle sx={{ fontSize: 8 }} />}
                    label={doctor.is_online ? 'Available' : 'Offline'}
                    color={doctor.is_online ? 'success' : 'default'}
                    size="small"
                  />
                  {doctor.is_verified && (
                    <Chip
                      icon={<VerifiedUser />}
                      label="Verified"
                      color="success"
                      size="small"
                    />
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              {/* Bio Section */}
              {doctor.bio && (
                <Card
                  sx={{
                    bgcolor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#FFFFFF',
                    border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : '#E2E8F0'}`,
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: isDark ? '#F1F5F9' : '#1E293B' }}>
                      About Dr. {doctor.name}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: isDark ? '#CBD5E1' : '#475569',
                        lineHeight: 1.8,
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {doctor.bio}
                    </Typography>
                  </CardContent>
                </Card>
              )}

              <Card
                sx={{
                  bgcolor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#FFFFFF',
                  border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : '#E2E8F0'}`,
                }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: isDark ? '#F1F5F9' : '#1E293B' }}>
                    Professional Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    {doctor.experience && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Work sx={{ fontSize: 20, color: 'primary.main' }} />
                          <Typography variant="body2" fontWeight="600" sx={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                            Experience
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ color: isDark ? '#F1F5F9' : '#1E293B' }}>
                          {doctor.experience} years
                        </Typography>
                      </Grid>
                    )}
                    {doctor.hospital && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <LocalHospital sx={{ fontSize: 20, color: 'primary.main' }} />
                          <Typography variant="body2" fontWeight="600" sx={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                            Hospital
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ color: isDark ? '#F1F5F9' : '#1E293B' }}>
                          {doctor.hospital}
                        </Typography>
                      </Grid>
                    )}
                    {doctor.language && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Language sx={{ fontSize: 20, color: 'primary.main' }} />
                          <Typography variant="body2" fontWeight="600" sx={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                            Language
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ color: isDark ? '#F1F5F9' : '#1E293B' }}>
                          {doctor.language}
                        </Typography>
                      </Grid>
                    )}
                    {doctor.phone && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="body2" fontWeight="600" sx={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                            📞 Phone
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ color: isDark ? '#F1F5F9' : '#1E293B' }}>
                          {doctor.phone}
                        </Typography>
                      </Grid>
                    )}
                    {doctor.email && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="body2" fontWeight="600" sx={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                            📧 Email
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ color: isDark ? '#F1F5F9' : '#1E293B', wordBreak: 'break-word' }}>
                          {doctor.email}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>

              {doctor.bio && (
                <Card
                  sx={{
                    bgcolor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#FFFFFF',
                    border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : '#E2E8F0'}`,
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: isDark ? '#F1F5F9' : '#1E293B' }}>
                      About
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body1" sx={{ color: isDark ? '#94A3B8' : '#64748B', lineHeight: 1.8 }}>
                      {doctor.bio}
                    </Typography>
                  </CardContent>
                </Card>
              )}
              
              {/* ID Card Verification */}
              {doctor.id_card_url && (
                <Card
                  sx={{
                    bgcolor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#FFFFFF',
                    border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : '#E2E8F0'}`,
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: isDark ? '#F1F5F9' : '#1E293B', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <VerifiedUser color="success" /> Verified Credentials
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box
                      component="img"
                      src={doctor.id_card_url}
                      alt="Doctor ID Card"
                      onClick={() => window.open(doctor.id_card_url, '_blank')}
                      sx={{
                        width: '100%',
                        borderRadius: 2,
                        cursor: 'pointer',
                        border: `2px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.02)',
                          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
                        },
                      }}
                    />
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, textAlign: 'center', color: isDark ? '#94A3B8' : '#64748B' }}>
                      Click to view full size
                    </Typography>
                  </CardContent>
                </Card>
              )}
              
              {/* Patient Reviews */}
              {doctor.ratings && doctor.ratings.length > 0 && (
                <Card
                  sx={{
                    bgcolor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#FFFFFF',
                    border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : '#E2E8F0'}`,
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: isDark ? '#F1F5F9' : '#1E293B', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Star sx={{ color: '#FCD34D' }} /> Patient Reviews
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Stack spacing={2}>
                      {doctor.ratings.slice(0, 5).map((rating, index) => (
                        <Paper
                          key={index}
                          sx={{
                            p: 2,
                            bgcolor: isDark ? 'rgba(15, 23, 42, 0.5)' : '#F8FAFC',
                            border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.1)' : '#E2E8F0'}`,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle2" fontWeight="600" sx={{ color: isDark ? '#F1F5F9' : '#1E293B' }}>
                              {rating.patient_name || 'Anonymous Patient'}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  sx={{
                                    fontSize: 16,
                                    color: i < rating.doctor_rating ? '#FCD34D' : isDark ? '#374151' : '#D1D5DB',
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                          {rating.feedback && (
                            <Typography variant="body2" sx={{ color: isDark ? '#94A3B8' : '#64748B', lineHeight: 1.6 }}>
                              {rating.feedback}
                            </Typography>
                          )}
                          <Typography variant="caption" sx={{ color: isDark ? '#6B7280' : '#9CA3AF', display: 'block', mt: 1 }}>
                            {new Date(rating.created_at).toLocaleDateString()}
                          </Typography>
                        </Paper>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              )}

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={!doctor.is_online}
                  onClick={() => navigate(`/consult?doctorId=${doctorId}`)}
                  sx={{
                    background: doctor.is_online
                      ? 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'
                      : 'rgba(71, 85, 105, 0.4)',
                  }}
                >
                  {doctor.is_online ? 'Consult Now' : 'Offline'}
                </Button>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default DoctorProfile;

