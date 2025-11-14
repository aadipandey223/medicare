import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Container,
  Paper,
  Badge,
  Divider,
  Fade,
  Avatar,
  IconButton,
  Chip,
  Button,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Delete,
  MarkEmailRead,
  Circle,
  Chat,
  UploadFile,
  Psychology,
  LocalHospital,
  Campaign,
  AssignmentTurnedIn,
  PersonAdd,
} from '@mui/icons-material';
import {
  fetchNotifications,
  fetchNotificationSummary,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '../../api/notifications';
import { useTheme } from '../../context/ThemeContext';

const TYPE_CONFIG = {
  consult_request: { icon: PersonAdd, color: '#2196F3', label: 'New Request' },
  consult_accept: { icon: LocalHospital, color: '#4CAF50', label: 'Consultation' },
  consult_reject: { icon: LocalHospital, color: '#F44336', label: 'Consultation' },
  consult_message: { icon: Chat, color: '#00BCD4', label: 'Message' },
  document_upload: { icon: UploadFile, color: '#673AB7', label: 'Document' },
  analysis: { icon: Psychology, color: '#00BCD4', label: 'Analysis' },
  reminder: { icon: LocalHospital, color: '#FF9800', label: 'Reminder' },
  tip: { icon: Campaign, color: '#9C27B0', label: 'Info' },
  general: { icon: AssignmentTurnedIn, color: '#607D8B', label: 'General' },
};

const getConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.general;

function DoctorNotifications() {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const [notifications, setNotifications] = useState([]);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [summary, setSummary] = useState({ total: 0, unread: 0 });

  const loadNotifications = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [list, info] = await Promise.all([
        fetchNotifications(),
        fetchNotificationSummary().catch(() => null),
      ]);
      setNotifications(Array.isArray(list) ? list : []);
      if (info && typeof info.unread === 'number') {
        setSummary(info);
      } else {
        const unread = (Array.isArray(list) ? list : []).filter((n) => !n.is_read).length;
        setSummary({ total: list.length, unread });
      }
    } catch (err) {
      if (!silent) {
        setAlert({ type: 'error', text: err.message });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Poll for new notifications every 2 seconds
    const interval = setInterval(() => {
      loadNotifications(true);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.is_read).length, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (tab === 0) return notifications;
    return notifications.filter((n) => !n.is_read);
  }, [notifications, tab]);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
      setSummary((prev) => ({ ...prev, unread: Math.max((prev.unread || 0) - 1, 0) }));
    } catch (err) {
      setAlert({ type: 'error', text: err.message });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
      const removed = notifications.find((notif) => notif.id === id);
      setSummary((prev) => ({
        total: Math.max((prev.total || 0) - 1, 0),
        unread:
          removed && !removed.is_read
            ? Math.max((prev.unread || 0) - 1, 0)
            : prev.unread || 0,
      }));
    } catch (err) {
      setAlert({ type: 'error', text: err.message });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((notif) => ({ ...notif, is_read: true })));
      setSummary((prev) => ({ ...prev, unread: 0 }));
    } catch (err) {
      setAlert({ type: 'error', text: err.message });
    }
  };

  const renderHeader = () => (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        mb: 4,
        borderRadius: 3,
        textAlign: 'center',
        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
        color: 'white',
      }}
    >
      <Badge badgeContent={unreadCount} color="error">
        <NotificationsIcon sx={{ fontSize: 60 }} />
      </Badge>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
        Notifications
      </Typography>
      <Typography variant="body1" sx={{ opacity: 0.9 }}>
        Stay updated with patient requests and important updates
      </Typography>
    </Paper>
  );

  return (
    <Box sx={{ 
      height: '100%',
      width: '100%',
      py: 3,
      px: { xs: 2, sm: 3 },
      overflow: 'auto',
      bgcolor: isDark ? '#1E1B2E' : '#FDF4FF',
    }}>
      <Box sx={{ maxWidth: '900px', mx: 'auto' }}>
        {renderHeader()}

        {alert && (
          <Alert severity={alert.type} sx={{ mb: 3, borderRadius: 2 }} onClose={() => setAlert(null)}>
            {alert.text}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip 
              label={`${summary.total} Total`} 
              color="primary" 
              variant="outlined"
              sx={{
                bgcolor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                borderColor: isDark ? 'rgba(139, 92, 246, 0.3)' : undefined,
                color: isDark ? '#A78BFA' : undefined,
              }}
            />
            <Chip 
              label={`${unreadCount} Unread`} 
              color="error" 
              variant={unreadCount ? 'filled' : 'outlined'}
              sx={!unreadCount ? {
                bgcolor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : undefined,
                color: isDark ? '#F87171' : undefined,
              } : {}}
            />
          </Box>
          {unreadCount > 0 && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<MarkEmailRead />}
              onClick={handleMarkAllRead}
              sx={{
                borderColor: isDark ? 'rgba(139, 92, 246, 0.3)' : undefined,
                color: isDark ? '#A78BFA' : undefined,
                '&:hover': {
                  borderColor: isDark ? 'rgba(139, 92, 246, 0.5)' : undefined,
                  bgcolor: isDark ? 'rgba(139, 92, 246, 0.1)' : undefined,
                },
              }}
            >
              Mark all read
            </Button>
          )}
        </Box>

        <Paper 
          elevation={3} 
          sx={{ 
            borderRadius: 3, 
            mb: 3,
            bgcolor: isDark ? 'rgba(42, 31, 61, 0.6)' : 'rgba(255, 255, 255, 0.9)',
            border: `2px solid ${isDark ? 'rgba(196, 181, 253, 0.2)' : 'rgba(167, 139, 250, 0.2)'}`,
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            centered
            TabIndicatorProps={{ 
              style: { 
                height: 3,
                backgroundColor: isDark ? '#A78BFA' : '#8B5CF6',
              } 
            }}
            sx={{
              '& .MuiTab-root': {
                color: isDark ? '#94A3B8' : undefined,
                fontWeight: 600,
                '&.Mui-selected': {
                  color: isDark ? '#A78BFA' : '#8B5CF6',
                },
              },
            }}
          >
            <Tab label="All" />
            <Tab label={`Unread (${unreadCount})`} />
          </Tabs>
        </Paper>

        <Paper 
          elevation={3} 
          sx={{ 
            borderRadius: 3, 
            overflow: 'hidden',
            bgcolor: isDark ? 'rgba(42, 31, 61, 0.6)' : 'rgba(255, 255, 255, 0.9)',
            border: `2px solid ${isDark ? 'rgba(196, 181, 253, 0.2)' : 'rgba(167, 139, 250, 0.2)'}`,
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress sx={{ color: isDark ? '#8B5CF6' : '#6366f1' }} />
            </Box>
          ) : filteredNotifications.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 60, color: isDark ? '#94A3B8' : 'text.secondary', mb: 2 }} />
              <Typography variant="h6" sx={{ color: isDark ? '#F1F5F9' : '#111827' }}>
                {tab === 0 ? 'No notifications yet' : 'You have no unread notifications'}
              </Typography>
              <Typography variant="body2" sx={{ color: isDark ? '#94A3B8' : '#6B7280' }}>
                {tab === 0
                  ? 'We will notify you about patient requests and important updates.'
                  : 'Check back later for new updates.'}
              </Typography>
            </Box>
          ) : (
            filteredNotifications.map((notification, index) => {
              const config = getConfig(notification.type);
              const Icon = config.icon;
              return (
                <Fade in timeout={200 * (index + 1)} key={notification.id}>
                  <Box
                    sx={{
                      p: 3,
                      bgcolor: notification.is_read 
                        ? (isDark ? 'rgba(30, 41, 59, 0.3)' : 'white')
                        : (isDark ? 'rgba(139, 92, 246, 0.1)' : '#F3F4F6'),
                      position: 'relative',
                      '&:hover': {
                        bgcolor: isDark ? 'rgba(139, 92, 246, 0.15)' : '#FAFAFA',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Avatar sx={{ bgcolor: config.color, width: 48, height: 48 }}>
                        <Icon />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography 
                            variant="subtitle1" 
                            fontWeight={600}
                            sx={{ color: isDark ? '#F1F5F9' : '#111827' }}
                          >
                            {notification.title}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ color: isDark ? '#94A3B8' : '#6B7280' }}
                          >
                            {notification.created_at
                              ? new Date(notification.created_at).toLocaleString()
                              : ''}
                          </Typography>
                        </Box>
                        {notification.message && (
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              mt: 0.5,
                              color: isDark ? '#94A3B8' : '#6B7280',
                            }}
                          >
                            {notification.message}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Chip size="small" label={config.label} sx={{ bgcolor: `${config.color}20`, color: config.color }} />
                          {!notification.is_read && (
                            <Chip size="small" color="error" label="New" />
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                        {!notification.is_read && (
                          <Button
                            size="small"
                            startIcon={<Circle fontSize="small" />}
                            onClick={() => handleMarkRead(notification.id)}
                            sx={{
                              color: isDark ? '#A78BFA' : '#8B5CF6',
                              '&:hover': {
                                bgcolor: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                              },
                            }}
                          >
                            Mark read
                          </Button>
                        )}
                        <IconButton 
                          color="error" 
                          size="small"
                          onClick={() => handleDelete(notification.id)}
                          sx={{
                            '&:hover': {
                              bgcolor: 'rgba(239, 68, 68, 0.1)',
                            },
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    {index < filteredNotifications.length - 1 && (
                      <Divider 
                        sx={{ 
                          mt: 2,
                          borderColor: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(226, 232, 240, 0.5)',
                        }} 
                      />
                    )}
                  </Box>
                </Fade>
              );
            })
          )}
        </Paper>
      </Box>
    </Box>
  );
}

export default DoctorNotifications;
