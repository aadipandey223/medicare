import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent, Container,
  Paper, CircularProgress, Alert, IconButton, Fade, Button, Zoom
} from '@mui/material';
import {
  People as PeopleIcon,
  Chat as ChatIcon,
  Assignment as AssignmentIcon,
  Refresh,
  ChevronRight
} from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';
import { apiRequest } from '../../api/api';

function DoctorDashboard() {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mouse-x', `${x}%`);
    card.style.setProperty('--mouse-y', `${y}%`);
  };

  useEffect(() => {
    fetchDashboardStats();
    const interval = setInterval(() => {
      fetchDashboardStats(true);
    }, 30000);
    
    // Refresh when window gains focus (user returns to tab)
    const handleFocus = () => {
      fetchDashboardStats(true);
    };
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchDashboardStats = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    
    try {
      const data = await apiRequest('/doctor/dashboard');
      setStats(data);
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={40} thickness={4} sx={{ color: '#0D9488' }} />
      </Box>
    );
  }

  const userName = sessionStorage.getItem('user') 
    ? JSON.parse(sessionStorage.getItem('user')).name 
    : (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).name : 'Doctor');

  const isDark = currentTheme === 'dark';

  return (
    <Box 
      sx={{ 
        height: '100%',
        overflow: 'auto',
        py: 3,
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
            ? 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(8, 145, 178, 0.1) 0%, transparent 50%)'
            : 'radial-gradient(circle at 20% 50%, rgba(14, 165, 233, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.05) 0%, transparent 50%)',
          pointerEvents: 'none',
          zIndex: 0,
        },
        '@keyframes gradientShift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      }}
    >
      <Box sx={{ maxWidth: 1400, mx: 'auto', position: 'relative', zIndex: 10 }}>
        <Fade in timeout={600}>
          <Box sx={{ position: 'relative', zIndex: 10 }}>
            {/* Welcome Header */}
            <Box sx={{ mb: 2, position: 'relative', zIndex: 10 }}>
              <Typography 
                variant="h4" 
                component="h1"
                fontWeight="800" 
                sx={{ 
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  mb: 0.5,
                  letterSpacing: '-0.02em',
                  background: isDark
                    ? 'linear-gradient(135deg, #60A5FA 0%, #34D399 50%, #FBBF24 100%)'
                    : 'linear-gradient(135deg, #3B82F6 0%, #10B981 50%, #F59E0B 100%)',
                  backgroundSize: '200% 200%',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'gradientShift 3s ease infinite',
                  position: 'relative',
                  zIndex: 10,
                  display: 'block',
                  visibility: 'visible',
                  opacity: 1,
                }}
              >
                Welcome, Dr. {userName || 'Doctor'}
              </Typography>
              <Typography 
                variant="body1" 
                component="p"
                sx={{ 
                  color: isDark ? '#94A3B8' : '#64748B', 
                  fontWeight: 400,
                  fontSize: '0.9375rem',
                  position: 'relative',
                  zIndex: 10,
                  display: 'block',
                  visibility: 'visible',
                  opacity: 1,
                }}
              >
                Here's what's happening today
              </Typography>
            </Box>

            {/* Refresh Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2.5, position: 'relative', zIndex: 10 }}>
              <IconButton
                onClick={() => fetchDashboardStats()}
                sx={{
                  bgcolor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(239, 246, 255, 0.8)',
                  color: isDark ? '#60A5FA' : '#3B82F6',
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(239, 246, 255, 1)',
                    transform: 'rotate(180deg) scale(1.1)',
                  },
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <Refresh sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              </IconButton>
            </Box>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 2.5, 
                  borderRadius: 2,
                  bgcolor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(254, 242, 242, 0.9)',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }} 
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            )}

            {/* Hero Stat Card */}
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              <Grid item xs={12}>
                <Zoom in timeout={600}>
                  <Card 
                    onClick={() => navigate('/doctor/requests')}
                    onMouseMove={handleMouseMove}
                    sx={{ 
                      borderRadius: 2,
                      background: isDark 
                        ? 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)'
                        : 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
                      border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(254, 226, 226, 0.8)'}`,
                      boxShadow: isDark 
                        ? '0 4px 12px rgba(0,0,0,0.3)'
                        : '0 4px 12px rgba(0,0,0,0.08)',
                      cursor: 'pointer',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '--mouse-x': '50%',
                      '--mouse-y': '50%',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, #EF4444 0%, #F87171 100%)',
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        background: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                        filter: 'blur(40px)',
                        animation: 'float 6s ease-in-out infinite',
                      },
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: isDark 
                          ? '0 12px 32px rgba(239, 68, 68, 0.3)'
                          : '0 12px 32px rgba(239, 68, 68, 0.2)',
                        borderColor: isDark ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.4)',
                        '&::after': {
                          transform: 'scale(1.2)',
                        },
                        '& .light-overlay': {
                          opacity: 1,
                          background: `radial-gradient(circle 300px at var(--mouse-x) var(--mouse-y), rgba(239, 68, 68, 0.25) 0%, transparent 70%)`,
                        },
                      },
                      '& .light-overlay': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: 0,
                        pointerEvents: 'none',
                        zIndex: 1,
                        transition: 'opacity 0.3s ease',
                      }
                    }}
                  >
                    <Box className="light-overlay" />
                    <CardContent sx={{ p: 2.5, position: 'relative', zIndex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                          <Box 
                            sx={{ 
                              width: 56,
                              height: 56,
                              borderRadius: 1.25,
                              background: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                              transition: 'all 0.4s ease',
                              animation: 'pulse 2s ease-in-out infinite',
                            }}
                          >
                            <Typography 
                              variant="h3" 
                              fontWeight="800" 
                              sx={{ 
                                fontSize: { xs: '1.75rem', md: '2rem' },
                                color: 'white',
                              }}
                            >
                              {stats?.new_requests || 0}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                color: isDark ? '#CBD5E1' : '#64748B',
                                fontWeight: 600,
                                fontSize: '0.9375rem'
                              }}
                            >
                              New Consult Requests
                            </Typography>
                          </Box>
                        </Box>
                        <Button
                          variant="contained"
                          endIcon={<ChevronRight />}
                          sx={{
                            px: 3,
                            py: 1.5,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            textTransform: 'none',
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
                              transform: 'translateX(8px) scale(1.05)',
                              boxShadow: '0 8px 20px rgba(239, 68, 68, 0.4)',
                            },
                          }}
                        >
                          View All
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            </Grid>

            {/* Medium Stat Cards */}
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              {[
                {
                  title: 'Active Consultations',
                  value: stats?.active_consultations || 0,
                  icon: <ChatIcon sx={{ fontSize: 28 }} />,
                  gradient: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
                  lightColor: 'rgba(59, 130, 246, 0.25)',
                  route: '/doctor/consultations',
                },
                {
                  title: 'Total Patients',
                  value: stats?.total_patients || 0,
                  icon: <PeopleIcon sx={{ fontSize: 28 }} />,
                  gradient: 'linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)',
                  lightColor: 'rgba(8, 145, 178, 0.25)',
                  route: '/doctor/patients',
                },
                {
                  title: 'Reports Pending',
                  value: stats?.reports_awaiting || 0,
                  icon: <AssignmentIcon sx={{ fontSize: 28 }} />,
                  gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                  lightColor: 'rgba(16, 185, 129, 0.25)',
                  route: '/doctor/reports',
                }
              ].map((card, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Zoom in timeout={700 + (index * 100)}>
                    <Card 
                      onClick={() => card.route && navigate(card.route)}
                      onMouseMove={handleMouseMove}
                      sx={{ 
                        height: '100%',
                        minHeight: 200,
                        borderRadius: 2,
                        background: isDark 
                          ? 'rgba(30, 41, 59, 0.8)'
                          : 'rgba(255, 255, 255, 0.9)',
                        border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(226, 232, 240, 0.8)'}`,
                        boxShadow: isDark 
                          ? '0 4px 12px rgba(0,0,0,0.2)'
                          : '0 4px 12px rgba(0,0,0,0.08)',
                        cursor: 'pointer',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        '--mouse-x': '50%',
                        '--mouse-y': '50%',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '3px',
                          background: card.gradient,
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: -30,
                          right: -30,
                          width: 100,
                          height: 100,
                          borderRadius: '50%',
                          background: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                          filter: 'blur(30px)',
                          transition: 'all 0.4s ease',
                        },
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.03) rotate(1deg)',
                          boxShadow: isDark 
                            ? '0 12px 32px rgba(0,0,0,0.3)'
                            : '0 12px 32px rgba(0,0,0,0.15)',
                          borderColor: isDark ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.4)',
                          '&::after': {
                            transform: 'scale(1.5)',
                          },
                          '& .light-overlay': {
                            opacity: 1,
                            background: `radial-gradient(circle 300px at var(--mouse-x) var(--mouse-y), ${card.lightColor} 0%, transparent 70%)`,
                          },
                          '& .card-icon': {
                            transform: 'scale(1.15) rotate(5deg)',
                          },
                          '& .card-value': {
                            transform: 'scale(1.1)',
                          },
                        },
                        '& .light-overlay': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          opacity: 0,
                          pointerEvents: 'none',
                          zIndex: 1,
                          transition: 'opacity 0.3s ease',
                        }
                      }}
                    >
                      <Box className="light-overlay" />
                      <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                        <Box>
                          <Box 
                            className="card-icon"
                            sx={{ 
                              width: 48,
                              height: 48,
                              borderRadius: 1.5,
                              background: card.gradient,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mb: 2,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                          >
                            <Box sx={{ color: 'white' }}>
                              {card.icon}
                            </Box>
                          </Box>
                          <Typography 
                            className="card-value"
                            variant="h2" 
                            fontWeight="800" 
                            sx={{ 
                              mb: 0.5,
                              background: card.gradient,
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text',
                              fontSize: '2rem',
                              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                          >
                            {card.value}
                          </Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              color: isDark ? '#CBD5E1' : '#64748B',
                              fontWeight: 600,
                              fontSize: '0.875rem'
                            }}
                          >
                            {card.title}
                          </Typography>
                        </Box>
                        <Button
                          variant="text"
                          endIcon={<ChevronRight />}
                          sx={{
                            mt: 2,
                            alignSelf: 'flex-start',
                            color: isDark ? '#60A5FA' : '#3B82F6',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            textTransform: 'none',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              transform: 'translateX(8px) scale(1.05)',
                            },
                          }}
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>
      </Box>
    </Box>
  );
}

export default DoctorDashboard;
