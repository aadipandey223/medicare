import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  People as PeopleIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  PendingActions as PendingIcon,
  LockReset as LockResetIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import * as adminApi from '../../api/admin';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await adminApi.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Doctors',
      value: stats?.total_doctors || 0,
      icon: <HospitalIcon sx={{ fontSize: 40 }} />,
      color: '#6366F1',
      bgGradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
    },
    {
      title: 'Active Doctors',
      value: stats?.active_doctors || 0,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#10B981',
      bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)',
    },
    {
      title: 'Pending Verification',
      value: stats?.pending_doctors || 0,
      icon: <PendingIcon sx={{ fontSize: 40 }} />,
      color: '#F59E0B',
      bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.2) 100%)',
    },
    {
      title: 'Total Patients',
      value: stats?.total_patients || 0,
      icon: <PersonIcon sx={{ fontSize: 40 }} />,
      color: '#3B82F6',
      bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)',
    },
    {
      title: 'Active Consultations',
      value: stats?.active_consultations || 0,
      icon: <ChatIcon sx={{ fontSize: 40 }} />,
      color: '#8B5CF6',
      bgGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(124, 58, 237, 0.2) 100%)',
    },
    {
      title: 'Pending Resets',
      value: stats?.pending_password_resets || 0,
      icon: <LockResetIcon sx={{ fontSize: 40 }} />,
      color: '#EF4444',
      bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)',
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress sx={{ color: '#C0C0C0' }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{
            background: 'linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 50%, #DAA520 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          Admin Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: '#a0a0a0' }}>
          Overview of system statistics and activities
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                bgcolor: '#1a1a1a',
                border: '1px solid rgba(192, 192, 192, 0.2)',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7)',
                  borderColor: 'rgba(218, 165, 32, 0.4)',
                },
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      background: card.bgGradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box sx={{ color: card.color }}>{card.icon}</Box>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" fontWeight="bold" sx={{ color: '#e0e0e0', mb: 0.5 }}>
                      {card.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#a0a0a0' }}>
                      {card.title}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper
        sx={{
          mt: 4,
          p: 4,
          bgcolor: '#1a1a1a',
          border: '1px solid rgba(192, 192, 192, 0.2)',
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        }}
      >
        <Typography variant="h6" fontWeight="600" sx={{ color: '#e0e0e0', mb: 2 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 2,
                bgcolor: '#252525',
                border: '1px solid rgba(192, 192, 192, 0.1)',
                borderRadius: 2,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: '#2a2a2a',
                  borderColor: 'rgba(218, 165, 32, 0.3)',
                },
                transition: 'all 0.2s',
              }}
              onClick={() => window.location.href = '/admin/doctors'}
            >
              <Typography variant="body2" sx={{ color: '#a0a0a0', mb: 1 }}>
                Manage Doctors
              </Typography>
              <Typography variant="caption" sx={{ color: '#666' }}>
                Add, approve, or remove doctors
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 2,
                bgcolor: '#252525',
                border: '1px solid rgba(192, 192, 192, 0.1)',
                borderRadius: 2,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: '#2a2a2a',
                  borderColor: 'rgba(218, 165, 32, 0.3)',
                },
                transition: 'all 0.2s',
              }}
              onClick={() => window.location.href = '/admin/password-resets'}
            >
              <Typography variant="body2" sx={{ color: '#a0a0a0', mb: 1 }}>
                Password Resets
              </Typography>
              <Typography variant="caption" sx={{ color: '#666' }}>
                Review pending requests
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 2,
                bgcolor: '#252525',
                border: '1px solid rgba(192, 192, 192, 0.1)',
                borderRadius: 2,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: '#2a2a2a',
                  borderColor: 'rgba(218, 165, 32, 0.3)',
                },
                transition: 'all 0.2s',
              }}
              onClick={() => window.location.href = '/admin/audit-logs'}
            >
              <Typography variant="body2" sx={{ color: '#a0a0a0', mb: 1 }}>
                Audit Logs
              </Typography>
              <Typography variant="caption" sx={{ color: '#666' }}>
                View admin activity history
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 2,
                bgcolor: '#252525',
                border: '1px solid rgba(192, 192, 192, 0.1)',
                borderRadius: 2,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: '#2a2a2a',
                  borderColor: 'rgba(218, 165, 32, 0.3)',
                },
                transition: 'all 0.2s',
              }}
              onClick={() => window.location.href = '/admin/settings'}
            >
              <Typography variant="body2" sx={{ color: '#a0a0a0', mb: 1 }}>
                System Settings
              </Typography>
              <Typography variant="caption" sx={{ color: '#666' }}>
                Configure platform preferences
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default AdminDashboard;
