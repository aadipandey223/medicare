import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent,
  Paper, CircularProgress, Alert, IconButton, Fade, Button, Zoom
} from '@mui/material';
import {
  UploadFile as UploadFileIcon,
  Chat as ChatIcon,
  People as PeopleIcon,
  Psychology as PsychologyIcon,
  Timeline as TimelineIcon,
  Refresh,
  ChevronRight
} from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mouse-x', `${x}%`);
    card.style.setProperty('--mouse-y', `${y}%`);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const userName = user?.name || 'Patient';
  const isDark = currentTheme === 'dark';

  return (
    <Box 
      sx={{ 
        minHeight: '100%',
        height: '100%',
        width: '100%',
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
      }}
    >
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3 }, position: 'relative', zIndex: 1, width: '100%', maxWidth: '1400px', mx: 'auto' }}>
        <Fade in timeout={600}>
          <Box>
            {/* Welcome Header */}
            <Box sx={{ mb: 2 }}>
              <Typography 
                variant="h4" 
                component="h1"
                fontWeight="800" 
                sx={{ 
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  mb: 0.5,
                  letterSpacing: '-0.02em',
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
                Welcome, {userName}
              </Typography>
              <Typography 
                variant="body1" 
                component="p"
                sx={{ 
                  color: isDark ? '#94A3B8' : '#64748B', 
                  fontWeight: 400,
                  fontSize: '0.95rem',
                }}
              >
                Here's what's happening today
              </Typography>
            </Box>

            {/* Refresh Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <IconButton
                onClick={handleRefresh}
                sx={{
                  bgcolor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(245, 243, 255, 0.8)',
                  color: isDark ? '#A78BFA' : '#8B5CF6',
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(139, 92, 246, 0.25)' : 'rgba(245, 243, 255, 1)',
                    transform: 'rotate(180deg) scale(1.1)',
                  },
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <Refresh sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              </IconButton>
            </Box>

            {/* Hero Stat Card */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12}>
                <Zoom in timeout={600}>
                  <Card 
                    onClick={() => navigate('/upload')}
                    onMouseMove={handleMouseMove}
                    sx={{ 
                      borderRadius: 2,
                      background: isDark 
                        ? 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)'
                        : 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
                      border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(245, 243, 255, 0.8)'}`,
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
                        background: 'linear-gradient(90deg, #8B5CF6 0%, #EC4899 100%)',
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        background: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
                        filter: 'blur(40px)',
                        animation: 'float 6s ease-in-out infinite',
                      },
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: isDark 
                          ? '0 12px 32px rgba(139, 92, 246, 0.3)'
                          : '0 12px 32px rgba(139, 92, 246, 0.2)',
                        borderColor: isDark ? 'rgba(139, 92, 246, 0.4)' : 'rgba(139, 92, 246, 0.4)',
                        '&::after': {
                          transform: 'scale(1.2)',
                        },
                        '& .light-overlay': {
                          opacity: 1,
                          background: `radial-gradient(circle 300px at var(--mouse-x) var(--mouse-y), rgba(139, 92, 246, 0.25) 0%, transparent 70%)`,
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
                    <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Box 
                            sx={{ 
                              width: 64,
                              height: 64,
                              borderRadius: 1.5,
                              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                              transition: 'all 0.4s ease',
                              animation: 'pulse 2s ease-in-out infinite',
                            }}
                          >
                            <UploadFileIcon sx={{ fontSize: 32, color: 'white' }} />
                          </Box>
                          <Box>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                color: isDark ? '#CBD5E1' : '#64748B',
                                fontWeight: 600,
                                fontSize: '1rem'
                              }}
                            >
                              Upload Your Documents
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: isDark ? '#94A3B8' : '#94A3B8',
                                fontSize: '0.875rem',
                                mt: 0.5
                              }}
                            >
                              Share prescriptions, reports, and medical records
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
                            background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            textTransform: 'none',
                            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)',
                              transform: 'translateX(8px) scale(1.05)',
                              boxShadow: '0 8px 20px rgba(139, 92, 246, 0.4)',
                            },
                          }}
                        >
                          Upload Now
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            </Grid>

            {/* Medium Stat Cards */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {[
                {
                  title: 'Consult Doctor',
                  value: 'Chat',
                  icon: <ChatIcon sx={{ fontSize: 28 }} />,
                  gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
                  lightColor: 'rgba(139, 92, 246, 0.25)',
                  route: '/consult',
                },
                {
                  title: 'Find Doctors',
                  value: 'Browse',
                  icon: <PeopleIcon sx={{ fontSize: 28 }} />,
                  gradient: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
                  lightColor: 'rgba(236, 72, 153, 0.25)',
                  route: '/doctors',
                },
                {
                  title: 'LLM Analysis',
                  value: 'AI Tips',
                  icon: <PsychologyIcon sx={{ fontSize: 28 }} />,
                  gradient: 'linear-gradient(135deg, #C084FC 0%, #E9D5FF 100%)',
                  lightColor: 'rgba(192, 132, 252, 0.25)',
                  route: '/llm-analysis',
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
                        border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(226, 232, 240, 0.8)'}`,
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
                          background: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
                          filter: 'blur(30px)',
                          transition: 'all 0.4s ease',
                        },
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.03) rotate(1deg)',
                          boxShadow: isDark 
                            ? '0 12px 32px rgba(0,0,0,0.3)'
                            : '0 12px 32px rgba(0,0,0,0.15)',
                          borderColor: isDark ? 'rgba(139, 92, 246, 0.4)' : 'rgba(139, 92, 246, 0.4)',
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
                            variant="h5" 
                            fontWeight="800" 
                            sx={{ 
                              mb: 0.5,
                              background: card.gradient,
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text',
                              fontSize: '1.5rem',
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
                            color: isDark ? '#A78BFA' : '#8B5CF6',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            textTransform: 'none',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              transform: 'translateX(8px) scale(1.05)',
                            },
                          }}
                        >
                          Explore
                        </Button>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>

            {/* Additional Quick Actions */}
            <Grid container spacing={2}>
              {[
                {
                  title: 'Medical History',
                  icon: <TimelineIcon sx={{ fontSize: 24 }} />,
                  gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                  lightColor: 'rgba(16, 185, 129, 0.25)',
                  route: '/history',
                },
              ].map((card, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Zoom in timeout={800 + (index * 100)}>
                    <Card 
                      onClick={() => card.route && navigate(card.route)}
                      onMouseMove={handleMouseMove}
                      sx={{ 
                        height: '100%',
                        minHeight: 150,
                        borderRadius: 2,
                        background: isDark 
                          ? 'rgba(30, 41, 59, 0.8)'
                          : 'rgba(255, 255, 255, 0.9)',
                        border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(226, 232, 240, 0.8)'}`,
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
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: isDark 
                            ? '0 8px 24px rgba(0,0,0,0.3)'
                            : '0 8px 24px rgba(0,0,0,0.12)',
                          '& .light-overlay': {
                            opacity: 1,
                            background: `radial-gradient(circle 300px at var(--mouse-x) var(--mouse-y), ${card.lightColor} 0%, transparent 70%)`,
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box 
                            sx={{ 
                              width: 40,
                              height: 40,
                              borderRadius: 1.5,
                              background: card.gradient,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            }}
                          >
                            <Box sx={{ color: 'white' }}>
                              {card.icon}
                            </Box>
                          </Box>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              color: isDark ? '#CBD5E1' : '#64748B',
                              fontWeight: 600,
                            }}
                          >
                            {card.title}
                          </Typography>
                        </Box>
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

export default Dashboard;
