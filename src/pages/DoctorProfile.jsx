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

const API_BASE_URL = '/api';

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
        minHeight: '100vh',
        py: 4,
        background: isDark
          ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)'
          : 'linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 50%, #F8FAFC 100%)',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <BackButton />
          <Typography variant="h4" fontWeight="bold" sx={{ color: isDark ? '#F1F5F9' : '#1E293B' }}>
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
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
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
                <Chip
                  icon={<LocalHospital />}
                  label={doctor.specialization || 'General Practitioner'}
                  color="primary"
                  sx={{ mb: 2 }}
                />
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
      </Container>
    </Box>
  );
}

export default DoctorProfile;

