import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, List, Typography, Divider,
  IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Avatar, Menu, MenuItem, Badge, useTheme, useMediaQuery, Paper, Chip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Notifications as NotificationsIcon,
  Chat as ChatIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  Brightness4,
  Brightness7,
  Circle
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { fetchNotificationSummary } from '../api/notifications';
import { useTheme as useCustomTheme } from '../context/ThemeContext';

const rawApiBase = import.meta.env.VITE_API_URL || '/api';
const API_BASE_URL = rawApiBase.endsWith('/api')
  ? rawApiBase
  : `${rawApiBase.replace(/\/$/, '')}/api`;

function DoctorNavigation({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationSummary, setNotificationSummary] = useState({ total: 0, unread: 0 });
  const [todayActivity, setTodayActivity] = useState({ patients: 0, completed: 0, pending: 0 });
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const { currentTheme, setCurrentTheme } = useCustomTheme();

  const refreshNotifications = useCallback(async () => {
    try {
      const summary = await fetchNotificationSummary();
      if (summary && typeof summary.unread === 'number') {
        setNotificationSummary({ total: summary.total || 0, unread: summary.unread || 0 });
      } else {
        // If API fails or returns invalid data, set to 0
        setNotificationSummary({ total: 0, unread: 0 });
      }
    } catch (err) {
      console.warn('Failed to load doctor notification summary', err);
      // Set to 0 on error to avoid showing fake notifications
      setNotificationSummary({ total: 0, unread: 0 });
    }
  }, []);

  const fetchTodayActivity = useCallback(async () => {
    try {
      const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('token')) || localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch(`${API_BASE_URL}/doctor/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.today_activity) {
          setTodayActivity(data.today_activity);
        }
      }
    } catch (err) {
      console.warn('Failed to load today activity', err);
    }
  }, []);

  useEffect(() => {
    refreshNotifications();
    fetchTodayActivity();
    const interval = setInterval(() => {
      refreshNotifications();
      fetchTodayActivity();
    }, 30000);
    return () => clearInterval(interval);
  }, [refreshNotifications, fetchTodayActivity]);

  useEffect(() => {
    if (location.pathname === '/doctor/requests') {
      refreshNotifications();
    }
  }, [location.pathname, refreshNotifications]);

  const menuItems = useMemo(
    () => [
      { 
        text: 'Dashboard', 
        icon: <DashboardIcon />, 
        path: '/doctor/dashboard',
        color: 'info'
      },
      {
        text: 'Patient Requests',
        icon: <NotificationsIcon />,
        path: '/doctor/requests',
        badge: notificationSummary.unread,
        color: 'error'
      },
      { 
        text: 'Active Consultations', 
        icon: <ChatIcon />, 
        path: '/doctor/consultations',
        color: 'info'
      },
      { 
        text: 'All Patients', 
        icon: <PeopleIcon />, 
        path: '/doctor/patients',
        color: 'secondary'
      },
      { 
        text: 'Reports', 
        icon: <AssignmentIcon />, 
        path: '/doctor/reports',
        color: 'success'
      },
      { 
        text: 'Settings', 
        icon: <SettingsIcon />, 
        path: '/doctor/settings',
        color: 'warning'
      },
    ],
    [notificationSummary.unread]
  );

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const toggleTheme = () => {
    setCurrentTheme(currentTheme === 'light' ? 'dark' : 'light');
  };

  const isDark = currentTheme === 'dark';
  const sidebarWidth = 320;

  const getColorStyles = (color, isActive) => {
    const colors = {
      error: {
        bg: isActive 
          ? (isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(254, 242, 242, 0.8)')
          : 'transparent',
        icon: isActive 
          ? (isDark ? 'rgba(239, 68, 68, 0.9)' : '#EF4444')
          : (isDark ? 'rgba(239, 68, 68, 0.5)' : '#FCA5A5'),
        text: isActive 
          ? (isDark ? '#F87171' : '#DC2626')
          : (isDark ? '#CBD5E1' : '#64748B'),
        border: isActive 
          ? (isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)')
          : 'transparent',
      },
      info: {
        bg: isActive 
          ? (isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(239, 246, 255, 0.8)')
          : 'transparent',
        icon: isActive 
          ? (isDark ? 'rgba(59, 130, 246, 0.9)' : '#3B82F6')
          : (isDark ? 'rgba(59, 130, 246, 0.5)' : '#93C5FD'),
        text: isActive 
          ? (isDark ? '#60A5FA' : '#2563EB')
          : (isDark ? '#CBD5E1' : '#64748B'),
        border: isActive 
          ? (isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)')
          : 'transparent',
      },
      secondary: {
        bg: isActive 
          ? (isDark ? 'rgba(8, 145, 178, 0.15)' : 'rgba(236, 254, 255, 0.8)')
          : 'transparent',
        icon: isActive 
          ? (isDark ? 'rgba(8, 145, 178, 0.9)' : '#0891B2')
          : (isDark ? 'rgba(8, 145, 178, 0.5)' : '#67E8F9'),
        text: isActive 
          ? (isDark ? '#06B6D4' : '#0E7490')
          : (isDark ? '#CBD5E1' : '#64748B'),
        border: isActive 
          ? (isDark ? 'rgba(8, 145, 178, 0.3)' : 'rgba(8, 145, 178, 0.2)')
          : 'transparent',
      },
      success: {
        bg: isActive 
          ? (isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(236, 253, 245, 0.8)')
          : 'transparent',
        icon: isActive 
          ? (isDark ? 'rgba(16, 185, 129, 0.9)' : '#10B981')
          : (isDark ? 'rgba(16, 185, 129, 0.5)' : '#6EE7B7'),
        text: isActive 
          ? (isDark ? '#34D399' : '#059669')
          : (isDark ? '#CBD5E1' : '#64748B'),
        border: isActive 
          ? (isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)')
          : 'transparent',
      },
      warning: {
        bg: isActive 
          ? (isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 251, 235, 0.8)')
          : 'transparent',
        icon: isActive 
          ? (isDark ? 'rgba(245, 158, 11, 0.9)' : '#F59E0B')
          : (isDark ? 'rgba(245, 158, 11, 0.5)' : '#FCD34D'),
        text: isActive 
          ? (isDark ? '#FBBF24' : '#D97706')
          : (isDark ? '#CBD5E1' : '#64748B'),
        border: isActive 
          ? (isDark ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)')
          : 'transparent',
      },
    };
    return colors[color] || colors.info;
  };

  const drawer = (
    <Box 
      sx={{ 
        width: sidebarWidth, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: isDark 
          ? 'rgba(15, 23, 42, 0.98)'
          : 'rgba(248, 250, 252, 0.98)',
        background: isDark
          ? 'linear-gradient(to bottom, #0F172A, #1E293B)'
          : 'linear-gradient(to bottom, #F8FAFC, #FFFFFF)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: isDark 
            ? 'rgba(59, 130, 246, 0.1)'
            : 'rgba(14, 165, 233, 0.1)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -100,
          left: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: isDark 
            ? 'rgba(8, 145, 178, 0.1)'
            : 'rgba(6, 182, 212, 0.1)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        },
      }}
    >
      {/* Header - Fixed (simplified, logo moved to AppBar) */}
      <Box sx={{ p: 3, pb: 2, position: 'relative', zIndex: 1, flexShrink: 0 }}>
        {/* Empty space - logo and title moved to AppBar */}
      </Box>

      {/* Doctor Profile Card - Fixed */}
      <Box sx={{ px: 3, mb: 2, position: 'relative', zIndex: 1, flexShrink: 0 }}>
        <Paper
          sx={{
            p: 2.5,
            borderRadius: 2,
            bgcolor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(226, 232, 240, 0.8)'}`,
            boxShadow: isDark 
              ? '0 4px 12px rgba(0,0,0,0.3)'
              : '0 4px 12px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: isDark 
                ? '0 8px 20px rgba(0,0,0,0.4)'
                : '0 8px 20px rgba(0,0,0,0.12)',
              transform: 'translateY(-2px)',
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar 
                src={user?.photo_url}
                sx={{ 
                  width: 56, 
                  height: 56, 
                  bgcolor: 'linear-gradient(135deg, #0D9488 0%, #0891B2 100%)',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  border: `3px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.8)'}`,
                  boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : <AccountCircleIcon />}
              </Avatar>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  bgcolor: user?.is_online ? '#10B981' : '#EF4444',
                  border: `3px solid ${isDark ? '#1E293B' : '#FFFFFF'}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body1" fontWeight="700" noWrap sx={{ fontSize: '0.9rem', color: isDark ? '#F1F5F9' : '#1E293B', mb: 0.5 }}>
                {user?.name || 'Doctor'}
              </Typography>
              <Typography variant="caption" noWrap sx={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                {user?.specialization || 'General Medicine'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Circle sx={{ fontSize: 8, color: user?.is_online ? '#10B981' : '#EF4444' }} />
                <Typography variant="caption" sx={{ color: user?.is_online ? '#10B981' : '#EF4444', fontSize: '0.7rem', fontWeight: 600 }}>
                  {user?.is_online ? 'Available' : 'Offline'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Divider sx={{ mx: 3, opacity: 0.2, mb: 1, flexShrink: 0 }} />

      {/* Scrollable Content Area */}
      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flex: 1, overflow: 'auto', px: 2.5, position: 'relative', zIndex: 1 }}>
          {/* Navigation Menu */}
          <Typography variant="caption" sx={{ 
            px: 2, 
            mb: 1.5, 
            display: 'block',
            color: isDark ? '#64748B' : '#94A3B8',
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Menu
          </Typography>
          <List sx={{ p: 0, mb: 2 }}>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const colorStyles = getColorStyles(item.color, isActive);
              return (
                <ListItem key={item.text} disablePadding sx={{ mb: 0.75 }}>
                  <ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      borderRadius: 2,
                      minHeight: 48,
                      px: 2,
                      py: 1.5,
                      bgcolor: colorStyles.bg,
                      border: `1px solid ${colorStyles.border}`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        background: isActive 
                          ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)'
                          : 'none',
                        transform: 'translateX(-100%)',
                        transition: 'transform 0.6s ease',
                      },
                      '&:hover': {
                        bgcolor: isActive 
                          ? colorStyles.bg
                          : (isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 246, 255, 0.6)'),
                        transform: 'translateY(-2px)',
                        boxShadow: isDark 
                          ? '0 4px 12px rgba(0,0,0,0.2)'
                          : '0 4px 12px rgba(0,0,0,0.08)',
                        borderColor: colorStyles.border,
                        '&::before': {
                          transform: 'translateX(100%)',
                        },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ 
                      minWidth: 44,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1.5,
                          bgcolor: colorStyles.icon,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          boxShadow: isActive 
                            ? '0 4px 12px rgba(0,0,0,0.2)'
                            : '0 2px 8px rgba(0,0,0,0.1)',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {typeof item.badge === 'number' && item.badge > 0 ? (
                          <Badge 
                            badgeContent={item.badge} 
                            color="error"
                            sx={{
                              '& .MuiBadge-badge': {
                                fontSize: '0.65rem',
                                minWidth: 18,
                                height: 18,
                                borderRadius: '50%',
                                animation: 'bounce 2s infinite',
                              }
                            }}
                          >
                            {item.icon}
                          </Badge>
                        ) : (
                          item.icon
                        )}
                      </Box>
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: isActive ? 700 : 600,
                        fontSize: '0.875rem',
                        color: colorStyles.text,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>

          {/* Quick Stats - Inside scrollable area */}
          <Box sx={{ mb: 2 }}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                background: isDark
                  ? 'linear-gradient(135deg, rgba(13, 148, 136, 0.15) 0%, rgba(8, 145, 178, 0.15) 100%)'
                  : 'linear-gradient(135deg, rgba(236, 254, 255, 0.8) 0%, rgba(240, 253, 250, 0.8) 100%)',
                border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(14, 165, 233, 0.2)'}`,
              }}
            >
              <Typography variant="caption" sx={{ 
                color: isDark ? '#64748B' : '#64748B',
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                mb: 1.5,
                display: 'block'
              }}>
                Today's Activity
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Box sx={{ flex: 1, bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.7)', borderRadius: 1.5, p: 1.5, textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 700, color: isDark ? '#60A5FA' : '#3B82F6', mb: 0.5 }}>
                    {todayActivity.patients}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.65rem', color: isDark ? '#94A3B8' : '#64748B', fontWeight: 500 }}>
                    Patients
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.7)', borderRadius: 1.5, p: 1.5, textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 700, color: isDark ? '#34D399' : '#10B981', mb: 0.5 }}>
                    {todayActivity.completed}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.65rem', color: isDark ? '#94A3B8' : '#64748B', fontWeight: 500 }}>
                    Completed
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.7)', borderRadius: 1.5, p: 1.5, textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 700, color: isDark ? '#F87171' : '#EF4444', mb: 0.5 }}>
                    {todayActivity.pending}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.65rem', color: isDark ? '#94A3B8' : '#64748B', fontWeight: 500 }}>
                    Pending
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ mx: 3, opacity: 0.2, flexShrink: 0 }} />

      {/* Logout Button - Fixed */}
      <Box sx={{ p: 2.5, position: 'relative', zIndex: 1, flexShrink: 0 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            minHeight: 48,
            px: 2,
            py: 1.5,
            bgcolor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.9)',
            border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(254, 226, 226, 0.8)'}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(254, 242, 242, 0.8)',
              borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.3)',
              transform: 'translateY(-2px)',
              boxShadow: isDark 
                ? '0 4px 12px rgba(239, 68, 68, 0.2)'
                : '0 4px 12px rgba(239, 68, 68, 0.15)',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 44 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                bgcolor: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(254, 226, 226, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isDark ? '#F87171' : '#EF4444',
                transition: 'all 0.3s ease',
              }}
            >
              <LogoutIcon sx={{ fontSize: 20 }} />
            </Box>
          </ListItemIcon>
          <ListItemText 
            primary="Logout"
            primaryTypographyProps={{
              fontWeight: 600,
              fontSize: '0.875rem',
              color: isDark ? '#F87171' : '#DC2626',
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* Top AppBar */}
      <AppBar 
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: isDark
            ? 'rgba(15, 23, 42, 0.9)'
            : 'rgba(255, 255, 255, 0.9)',
          color: 'text.primary',
          borderBottom: isDark
            ? '1px solid rgba(30, 41, 59, 0.8)'
            : '1px solid rgba(226, 232, 240, 0.8)',
          backdropFilter: 'blur(20px)',
          boxShadow: 'none',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: { sm: `calc(100% - ${drawerOpen ? sidebarWidth : 0}px)` },
          ml: { sm: `${drawerOpen ? sidebarWidth : 0}px` },
          transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1), margin-left 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          minHeight: '56px',
        }}
      >
        {/* Animated Gradient Line */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #0D9488 0%, #0891B2 25%, #3B82F6 50%, #0891B2 75%, #0D9488 100%)',
            backgroundSize: '200% 100%',
            animation: 'gradientMove 3s linear infinite',
            '@keyframes gradientMove': {
              '0%': {
                backgroundPosition: '0% 50%',
              },
              '100%': {
                backgroundPosition: '200% 50%',
              },
            },
          }}
        />
        <Toolbar sx={{ 
          px: { xs: 2, sm: 3 }, 
          py: 1, 
          minHeight: '64px !important', 
          position: 'relative', 
          zIndex: 1,
          alignItems: 'center',
        }}>
          {/* Logo, Medicare, and FOR DOCTORS Section */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            flex: 1
          }}>
            {/* Logo in outline box with shining animation - Clickable */}
            <Box
              onClick={() => navigate('/doctor/dashboard')}
              sx={{
                p: 1.5,
                borderRadius: 2,
                border: `2px solid ${isDark ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.3)'}`,
                position: 'relative',
                overflow: 'hidden',
                background: isDark 
                  ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%)'
                  : 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(255, 255, 255, 0.8) 100%)',
                cursor: 'pointer',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'shine 3s ease-in-out infinite',
                  pointerEvents: 'none',
                },
                '&:hover': {
                  borderColor: isDark ? 'rgba(59, 130, 246, 0.6)' : 'rgba(59, 130, 246, 0.5)',
                  boxShadow: isDark 
                    ? '0 0 20px rgba(59, 130, 246, 0.3)'
                    : '0 0 20px rgba(59, 130, 246, 0.2)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <Box
                component="img"
                src="/logo.svg"
                alt="MediCare Logo"
                sx={{
                  height: 40,
                  width: 'auto',
                  position: 'relative',
                  zIndex: 1,
                  display: 'block',
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </Box>

            {/* Medicare for Doctors Title - Clickable */}
            <Box 
              sx={{ 
                flex: 1,
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.8,
                },
                transition: 'opacity 0.2s ease',
              }}
              onClick={() => navigate('/doctor/dashboard')}
            >
              <Typography 
                variant="h4" 
                component="div"
                sx={{ 
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  lineHeight: 1.1,
                  mb: 0.25,
                  background: isDark
                    ? 'linear-gradient(135deg, #60A5FA 0%, #34D399 50%, #FBBF24 100%)'
                    : 'linear-gradient(135deg, #3B82F6 0%, #10B981 50%, #F59E0B 100%)',
                  backgroundSize: '200% 200%',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'gradientShift 3s ease infinite',
                }}
              >
                Medicare
              </Typography>
              <Typography 
                variant="caption" 
                component="div"
                sx={{ 
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  color: isDark ? '#94A3B8' : '#64748B',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                FOR DOCTORS
              </Typography>
            </Box>
          </Box>


          {/* Right side icons */}
          <Box sx={{ 
            position: 'absolute',
            top: '50%',
            right: { xs: 2, sm: 3 },
            transform: 'translateY(-50%)',
            display: 'flex', 
            alignItems: 'center', 
            gap: 1 
          }}>
            {/* Dark/Light Mode Toggle */}
            <IconButton
              onClick={toggleTheme}
              sx={{
                color: isDark ? '#FBBF24' : '#1E293B',
                '&:hover': {
                  bgcolor: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(241, 245, 249, 0.8)'
                }
              }}
            >
              {isDark ? <Brightness7 /> : <Brightness4 />}
            </IconButton>

            {/* Notifications */}
            <IconButton
              onClick={() => navigate('/doctor/requests')}
              sx={{
                color: isDark ? '#60A5FA' : '#3B82F6',
                '&:hover': {
                  bgcolor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(239, 246, 255, 0.8)'
                }
              }}
            >
              <Badge 
                badgeContent={notificationSummary.unread > 0 ? notificationSummary.unread : null} 
                color="error"
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <IconButton 
              onClick={handleMenuClick}
              sx={{
                p: 0.5,
                '&:hover': {
                  bgcolor: 'transparent'
                }
              }}
            >
              <Avatar 
                src={user?.photo_url} 
                sx={{ 
                  bgcolor: isDark ? '#0D9488' : '#0891B2', 
                  width: 36, 
                  height: 36,
                  border: `2px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(226, 232, 240, 0.8)'}`,
                  '&:hover': {
                    borderColor: isDark ? '#60A5FA' : '#3B82F6',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {user?.name?.charAt(0) || 'D'}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: 200,
                  borderRadius: 2,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  border: `1px solid ${isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(226, 232, 240, 0.8)'}`,
                  bgcolor: isDark ? '#1E293B' : '#FFFFFF',
                }
              }}
            >
              <MenuItem 
                onClick={() => { navigate('/doctor/settings'); handleMenuClose(); }}
                sx={{
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(239, 246, 255, 0.8)'
                  }
                }}
              >
                <AccountCircleIcon sx={{ mr: 1.5, fontSize: 20, color: isDark ? '#60A5FA' : '#3B82F6' }} />
                Profile Settings
              </MenuItem>
              <MenuItem 
                onClick={handleLogout}
                sx={{
                  color: isDark ? '#F87171' : '#DC2626',
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(254, 242, 242, 0.8)'
                  }
                }}
              >
                <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={drawerOpen}
        onClose={handleDrawerToggle}
        transitionDuration={300}
        ModalProps={{
          onBackdropClick: handleDrawerToggle,
        }}
        sx={{
          width: 0,
          flexShrink: 0,
          '& .MuiDrawer-root': {
            width: 0,
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 1200,
          },
          '& .MuiDrawer-paper': {
            width: sidebarWidth,
            boxSizing: 'border-box',
            border: 'none',
            borderRight: isDark 
              ? '1px solid rgba(30, 41, 59, 0.8)'
              : '1px solid rgba(226, 232, 240, 0.8)',
            boxShadow: isDark
              ? '4px 0 24px rgba(0,0,0,0.3)'
              : '4px 0 24px rgba(0,0,0,0.08)',
            transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1) !important',
            margin: 0,
            padding: 0,
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Floating Hamburger Button - Top Left */}
      <IconButton
        onClick={handleDrawerToggle}
        sx={{
          position: 'fixed',
          top: 68,
          left: drawerOpen ? { sm: `${sidebarWidth - 24}px` } : -24,
          zIndex: 1400,
          width: 48,
          height: 48,
          borderRadius: '50%',
          bgcolor: isDark ? 'rgba(59, 130, 246, 0.95)' : 'rgba(59, 130, 246, 0.95)',
          color: '#FFFFFF',
          border: 'none',
          boxShadow: isDark 
            ? '0 4px 16px rgba(59, 130, 246, 0.5)'
            : '0 4px 16px rgba(59, 130, 246, 0.4)',
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            bgcolor: isDark ? 'rgba(59, 130, 246, 1)' : 'rgba(59, 130, 246, 1)',
            transform: 'scale(1.1) rotate(90deg)',
            boxShadow: isDark 
              ? '0 8px 24px rgba(59, 130, 246, 0.6)'
              : '0 8px 24px rgba(59, 130, 246, 0.5)',
          },
        }}
      >
        <MenuIcon />
      </IconButton>

      {/* Main Content Area */}
      <Box
        component="main"
        onClick={() => {
          // Close sidebar on mobile when clicking main content
          if (isMobile && drawerOpen) {
            setDrawerOpen(false);
          }
        }}
        sx={{
          flexGrow: 1,
          width: { sm: drawerOpen ? `calc(100% - ${sidebarWidth}px)` : '100%' },
          marginLeft: { sm: drawerOpen ? `${sidebarWidth}px` : 0 },
          marginTop: '64px',
          transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1), margin-left 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          minHeight: 'calc(100vh - 56px)',
          bgcolor: isDark ? '#0F172A' : '#F8FAFC',
          padding: 0,
          margin: 0,
          position: 'relative',
          left: 0,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default DoctorNavigation;
