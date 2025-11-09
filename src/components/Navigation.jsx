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
  UploadFile as UploadFileIcon,
  Psychology as PsychologyIcon,
  Timeline as TimelineIcon,
  People as PeopleIcon,
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

function Navigation({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationSummary, setNotificationSummary] = useState({ total: 0, unread: 0 });
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
        setNotificationSummary({ total: 0, unread: 0 });
      }
    } catch (err) {
      console.warn('Failed to load notification summary', err);
      setNotificationSummary({ total: 0, unread: 0 });
    }
  }, []);

  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 30000);
    return () => clearInterval(interval);
  }, [refreshNotifications]);

  useEffect(() => {
    if (location.pathname === '/notifications') {
      refreshNotifications();
    }
  }, [location.pathname, refreshNotifications]);

  const menuItems = useMemo(
    () => [
      { 
        text: 'Dashboard', 
        icon: <DashboardIcon />, 
        path: '/dashboard',
        color: 'info'
      },
      {
        text: 'Upload',
        icon: <UploadFileIcon />,
        path: '/upload',
        color: 'success'
      },
      { 
        text: 'Consult', 
        icon: <ChatIcon />, 
        path: '/consult',
        color: 'info'
      },
      { 
        text: 'Doctors', 
        icon: <PeopleIcon />, 
        path: '/doctors',
        color: 'secondary'
      },
      { 
        text: 'LLM Analysis', 
        icon: <PsychologyIcon />, 
        path: '/llm-analysis',
        color: 'warning'
      },
      { 
        text: 'History', 
        icon: <TimelineIcon />, 
        path: '/history',
        color: 'secondary'
      },
      {
        text: 'Notifications',
        icon: <NotificationsIcon />,
        path: '/notifications',
        badge: notificationSummary.unread,
        color: 'error'
      },
      { 
        text: 'Settings', 
        icon: <SettingsIcon />, 
        path: '/settings',
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
          ? (isDark ? 'rgba(236, 72, 153, 0.15)' : 'rgba(253, 242, 248, 0.8)')
          : 'transparent',
        icon: isActive 
          ? (isDark ? 'rgba(236, 72, 153, 0.9)' : '#EC4899')
          : (isDark ? 'rgba(236, 72, 153, 0.5)' : '#F9A8D4'),
        text: isActive 
          ? (isDark ? '#F472B6' : '#DB2777')
          : (isDark ? '#CBD5E1' : '#64748B'),
        border: isActive 
          ? (isDark ? 'rgba(236, 72, 153, 0.3)' : 'rgba(236, 72, 153, 0.2)')
          : 'transparent',
      },
      info: {
        bg: isActive 
          ? (isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(245, 243, 255, 0.8)')
          : 'transparent',
        icon: isActive 
          ? (isDark ? 'rgba(139, 92, 246, 0.9)' : '#8B5CF6')
          : (isDark ? 'rgba(139, 92, 246, 0.5)' : '#C4B5FD'),
        text: isActive 
          ? (isDark ? '#A78BFA' : '#7C3AED')
          : (isDark ? '#CBD5E1' : '#64748B'),
        border: isActive 
          ? (isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)')
          : 'transparent',
      },
      secondary: {
        bg: isActive 
          ? (isDark ? 'rgba(192, 132, 252, 0.15)' : 'rgba(250, 245, 255, 0.8)')
          : 'transparent',
        icon: isActive 
          ? (isDark ? 'rgba(192, 132, 252, 0.9)' : '#C084FC')
          : (isDark ? 'rgba(192, 132, 252, 0.5)' : '#E9D5FF'),
        text: isActive 
          ? (isDark ? '#C4B5FD' : '#9333EA')
          : (isDark ? '#CBD5E1' : '#64748B'),
        border: isActive 
          ? (isDark ? 'rgba(192, 132, 252, 0.3)' : 'rgba(192, 132, 252, 0.2)')
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
            ? 'rgba(139, 92, 246, 0.1)'
            : 'rgba(192, 132, 252, 0.1)',
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
            ? 'rgba(236, 72, 153, 0.1)'
            : 'rgba(244, 114, 182, 0.1)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        },
      }}
    >
      {/* Header - Fixed */}
      <Box sx={{ p: 3, pb: 2, position: 'relative', zIndex: 1, flexShrink: 0 }}>
        {/* Empty space - logo and title moved to AppBar */}
      </Box>

      {/* Patient Profile Card - Fixed */}
      <Box sx={{ px: 3, mb: 2, position: 'relative', zIndex: 1, flexShrink: 0 }}>
        <Paper
          sx={{
            p: 2.5,
            borderRadius: 2,
            bgcolor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(226, 232, 240, 0.8)'}`,
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
                  bgcolor: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  border: `3px solid ${isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.8)'}`,
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : <AccountCircleIcon />}
              </Avatar>
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body1" fontWeight="700" noWrap sx={{ fontSize: '0.9rem', color: isDark ? '#F1F5F9' : '#1E293B', mb: 0.5 }}>
                {user?.name || 'Patient'}
              </Typography>
              <Typography variant="caption" noWrap sx={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                {user?.email || 'patient@medicare.com'}
              </Typography>
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
                          : (isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(245, 243, 255, 0.6)'),
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
            background: 'linear-gradient(90deg, #8B5CF6 0%, #EC4899 25%, #C084FC 50%, #EC4899 75%, #8B5CF6 100%)',
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
          minHeight: '56px !important', 
          position: 'relative', 
          zIndex: 1,
          alignItems: 'center',
        }}>
          {/* Logo, Medicare, and FOR PATIENTS Section */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            flex: 1
          }}>
            {/* Logo in outline box with shining animation - Clickable */}
            <Box
              onClick={() => navigate('/dashboard')}
              sx={{
                p: 1.5,
                borderRadius: 2,
                border: `2px solid ${isDark ? 'rgba(139, 92, 246, 0.4)' : 'rgba(139, 92, 246, 0.3)'}`,
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
                  borderColor: isDark ? 'rgba(139, 92, 246, 0.6)' : 'rgba(139, 92, 246, 0.5)',
                  boxShadow: isDark 
                    ? '0 0 20px rgba(139, 92, 246, 0.3)'
                    : '0 0 20px rgba(139, 92, 246, 0.2)',
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

            {/* Medicare for Patients Title - Clickable */}
            <Box 
              sx={{ 
                flex: 1,
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.8,
                },
                transition: 'opacity 0.2s ease',
              }}
              onClick={() => navigate('/dashboard')}
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
                    ? 'linear-gradient(135deg, #A78BFA 0%, #EC4899 50%, #FBBF24 100%)'
                    : 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F59E0B 100%)',
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
                FOR PATIENTS
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
              onClick={() => navigate('/notifications')}
              sx={{
                color: isDark ? '#A78BFA' : '#8B5CF6',
                '&:hover': {
                  bgcolor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(245, 243, 255, 0.8)'
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
                  bgcolor: isDark ? '#8B5CF6' : '#EC4899', 
                  width: 36, 
                  height: 36,
                  border: `2px solid ${isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(226, 232, 240, 0.8)'}`,
                  '&:hover': {
                    borderColor: isDark ? '#A78BFA' : '#8B5CF6',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {user?.name?.charAt(0) || 'P'}
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
                onClick={() => { navigate('/settings'); handleMenuClose(); }}
                sx={{
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(245, 243, 255, 0.8)'
                  }
                }}
              >
                <AccountCircleIcon sx={{ mr: 1.5, fontSize: 20, color: isDark ? '#A78BFA' : '#8B5CF6' }} />
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
          bgcolor: isDark ? 'rgba(139, 92, 246, 0.95)' : 'rgba(139, 92, 246, 0.95)',
          color: '#FFFFFF',
          border: 'none',
          boxShadow: isDark 
            ? '0 4px 16px rgba(139, 92, 246, 0.5)'
            : '0 4px 16px rgba(139, 92, 246, 0.4)',
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            bgcolor: isDark ? 'rgba(139, 92, 246, 1)' : 'rgba(139, 92, 246, 1)',
            transform: 'scale(1.1) rotate(90deg)',
            boxShadow: isDark 
              ? '0 8px 24px rgba(139, 92, 246, 0.6)'
              : '0 8px 24px rgba(139, 92, 246, 0.5)',
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
          marginTop: '56px',
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

export default Navigation;
