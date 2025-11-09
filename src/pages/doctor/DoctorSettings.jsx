import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Container, Paper, TextField, Button,
  Grid, CircularProgress, Alert, Switch, FormControlLabel,
  Avatar, Divider, Fade, IconButton, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText
} from '@mui/material';
import { 
  Save as SaveIcon,
  Person as PersonIcon,
  AccountCircle as AccountCircleIcon,
  Security as SecurityIcon,
  Help as HelpIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  PhotoCamera as PhotoCameraIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { apiRequest } from '../../api/api';

function DoctorSettings() {
  const { user, updateUser } = useAuth();
  const { currentTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('profile');

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mouse-x', `${x}%`);
    card.style.setProperty('--mouse-y', `${y}%`);
  };
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialization: '',
    hospital: '',
    phone: '',
    photo_url: '',
    id_card_url: '',
    is_online: false
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingIdCard, setUploadingIdCard] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = React.useRef(null);
  const idCardInputRef = React.useRef(null);

  const isDark = currentTheme === 'dark';

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        specialization: user.specialization || '',
        hospital: user.hospital || '',
        phone: user.phone || '',
        photo_url: user.photo_url || '',
        id_card_url: user.id_card_url || '',
        is_online: user.is_online || false
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'is_online') {
      updateOnlineStatus(type === 'checkbox' ? checked : !!value);
    }
  };

  const updateOnlineStatus = async (nextOnline) => {
    try {
      await apiRequest('/doctor/me', {
        method: 'PUT',
        body: JSON.stringify({ is_online: nextOnline })
      });
      setFormData(prev => ({ ...prev, is_online: nextOnline }));
      setMessage({ type: 'success', text: nextOnline ? 'You are now Online' : 'You are now Offline' });
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update online status' });
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size must be less than 5MB' });
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('isProfilePhoto', 'true');

      const result = await apiRequest('/upload', {
        method: 'POST',
        body: uploadFormData
      });

      setFormData(prev => ({ ...prev, photo_url: result.downloadURL }));
      setMessage({ type: 'success', text: 'Profile photo updated successfully!' });
      setTimeout(() => setMessage(''), 3000);
      
      if (updateUser) {
        updateUser({ ...user, photo_url: result.downloadURL });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to upload photo' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleIdCardUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size must be less than 5MB' });
      return;
    }

    setUploadingIdCard(true);
    setMessage('');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('isDoctorCard', 'true');

      const result = await apiRequest('/upload', {
        method: 'POST',
        body: uploadFormData
      });

      setFormData(prev => ({ ...prev, id_card_url: result.downloadURL }));
      setMessage({ type: 'success', text: 'ID card updated successfully! Patients can now view your verification.' });
      setTimeout(() => setMessage(''), 3000);
      
      if (updateUser) {
        updateUser({ ...user, id_card_url: result.downloadURL });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to upload ID card' });
    } finally {
      setUploadingIdCard(false);
      if (idCardInputRef.current) {
        idCardInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name || !formData.name.trim()) {
      setMessage({ type: 'error', text: 'Name is required' });
      return;
    }
    if (!formData.email || !formData.email.trim()) {
      setMessage({ type: 'error', text: 'Email is required' });
      return;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      const updatedData = await apiRequest('/doctor/me', {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      setMessage({ type: 'success', text: 'Profile updated successfully! You can now login with your new email.' });
      setTimeout(() => setMessage(''), 3000);
      
      if (updateUser) {
        updateUser(updatedData);
        
        // Also update email in storage for login
        if (updatedData.email) {
          const updatedUser = { ...user, ...updatedData };
          sessionStorage.setItem('user', JSON.stringify(updatedUser));
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill in all password fields' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setSaving(true);
    setMessage('');
    
    try {
      setMessage({ type: 'info', text: 'Password change feature coming soon' });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const settingsSections = [
    { id: 'profile', label: 'Profile', icon: <PersonIcon /> },
    { id: 'security', label: 'Security', icon: <SecurityIcon /> },
    { id: 'support', label: 'Help & Support', icon: <HelpIcon /> },
  ];

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        py: 4,
        px: { xs: 2, sm: 3, md: 4 },
        bgcolor: isDark ? '#1E1B2E' : '#FDF4FF'
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 2 } }}>
        <Fade in timeout={800}>
          <Box>
            {/* Header */}
            <Box sx={{ mb: 5 }}>
              <Typography 
                variant="h2" 
                fontWeight="800" 
                sx={{ 
                  fontSize: { xs: '2rem', md: '3rem' },
                  mb: 1.5,
                  letterSpacing: '-0.03em',
                  color: isDark ? '#F3F4F6' : '#111827'
                }}
              >
                Settings
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: isDark ? '#9CA3AF' : '#6B7280', 
                  fontWeight: 400,
                  fontSize: '1.1rem'
                }}
              >
                Manage your profile and preferences
              </Typography>
            </Box>

            {message && typeof message === 'object' && (
              <Alert 
                severity={message.type} 
                sx={{ 
                  mb: 4, 
                  borderRadius: 4,
                  bgcolor: message.type === 'error' 
                    ? (isDark ? 'rgba(252, 165, 165, 0.15)' : 'rgba(254, 242, 242, 0.9)')
                    : (isDark ? 'rgba(110, 231, 183, 0.15)' : 'rgba(236, 253, 245, 0.9)'),
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${message.type === 'error' ? 'rgba(252, 165, 165, 0.3)' : 'rgba(110, 231, 183, 0.3)'}`
                }} 
                onClose={() => setMessage('')}
              >
                {message.text}
              </Alert>
            )}

            {/* Profile Header Card */}
            <Paper 
              onMouseMove={handleMouseMove}
              sx={{ 
                p: 5, 
                mb: 4,
                borderRadius: 5,
                background: isDark
                  ? 'linear-gradient(135deg, #2A1F3D 0%, #1E1B2E 100%)'
                  : 'linear-gradient(135deg, #A78BFA 0%, #C4B5FD 50%, #6EE7B7 100%)',
                color: 'white',
                boxShadow: isDark 
                  ? '0 12px 40px rgba(196, 181, 253, 0.2)'
                  : '0 12px 40px rgba(167, 139, 250, 0.3)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                '--mouse-x': '50%',
                '--mouse-y': '50%',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  animation: 'float 6s ease-in-out infinite',
                },
                '&:hover': {
                  transform: 'translateY(-4px) scale(1.01)',
                  boxShadow: isDark 
                    ? '0 16px 48px rgba(196, 181, 253, 0.3)'
                    : '0 16px 48px rgba(167, 139, 250, 0.4)',
                  '& .light-overlay': {
                    opacity: 1,
                    background: `radial-gradient(circle 400px at var(--mouse-x) var(--mouse-y), rgba(167, 139, 250, 0.25) 0%, transparent 70%)`,
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar 
                    src={user?.photo_url}
                    sx={{ 
                      width: 120, 
                      height: 120, 
                      bgcolor: 'rgba(255,255,255,0.2)',
                      fontSize: '3rem',
                      fontWeight: 700,
                      border: '4px solid rgba(255,255,255,0.3)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                    }}
                  >
                    {user?.name?.charAt(0).toUpperCase() || <AccountCircleIcon sx={{ fontSize: 60 }} />}
                  </Avatar>
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: 'white',
                      color: isDark ? '#2A1F3D' : '#A78BFA',
                      '&:hover': { bgcolor: '#F3F4F6', transform: 'scale(1.1)' },
                      width: 40,
                      height: 40,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? <CircularProgress size={20} /> : <PhotoCameraIcon fontSize="small" />}
                  </IconButton>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handlePhotoUpload}
                  />
                </Box>
                <Box sx={{ flex: 1, minWidth: 250 }}>
                  <Typography variant="h3" fontWeight="700" gutterBottom>
                    {user?.name || 'Doctor'}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.95, mb: 1, fontWeight: 500 }}>
                    {user?.specialization || 'General Medicine'}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9, mb: 0.5 }}>
                    {user?.hospital || 'Medicare Hospital'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, fontFamily: 'monospace', fontSize: '0.9rem' }}>
                    {user?.email || ''}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Settings Layout: Sidebar + Content */}
            <Grid container spacing={4}>
              {/* Left Sidebar Navigation */}
              <Grid item xs={12} md={3}>
                <Paper
                  sx={{
                    borderRadius: 4,
                    background: isDark 
                      ? 'rgba(42, 31, 61, 0.6)'
                      : 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: `2px solid ${isDark ? 'rgba(196, 181, 253, 0.2)' : 'rgba(167, 139, 250, 0.2)'}`,
                    boxShadow: isDark 
                      ? '0 8px 32px rgba(196, 181, 253, 0.1)'
                      : '0 8px 32px rgba(167, 139, 250, 0.15)',
                    overflow: 'hidden'
                  }}
                >
                  <List sx={{ p: 2 }}>
                    {settingsSections.map((section) => {
                      const isActive = activeSection === section.id;
                      return (
                        <ListItem key={section.id} disablePadding sx={{ mb: 1 }}>
                          <ListItemButton
                            onClick={() => setActiveSection(section.id)}
                            sx={{
                              borderRadius: 3,
                              minHeight: 64,
                              px: 3,
                              bgcolor: isActive 
                                ? (isDark ? 'rgba(196, 181, 253, 0.2)' : 'rgba(167, 139, 250, 0.2)')
                                : 'transparent',
                              color: isActive 
                                ? (isDark ? '#C4B5FD' : '#A78BFA') 
                                : (isDark ? '#D1D5DB' : '#6B7280'),
                              border: isActive 
                                ? `2px solid ${isDark ? 'rgba(196, 181, 253, 0.4)' : 'rgba(167, 139, 250, 0.4)'}`
                                : '2px solid transparent',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              '&:hover': {
                                bgcolor: isActive 
                                  ? (isDark ? 'rgba(196, 181, 253, 0.3)' : 'rgba(167, 139, 250, 0.3)')
                                  : (isDark ? 'rgba(196, 181, 253, 0.1)' : 'rgba(167, 139, 250, 0.1)'),
                                transform: 'translateX(4px)',
                                borderColor: isActive 
                                  ? (isDark ? 'rgba(196, 181, 253, 0.5)' : 'rgba(167, 139, 250, 0.5)')
                                  : (isDark ? 'rgba(196, 181, 253, 0.2)' : 'rgba(167, 139, 250, 0.2)'),
                              },
                            }}
                          >
                            <ListItemIcon sx={{ 
                              color: 'inherit', 
                              minWidth: 48,
                              '& .MuiSvgIcon-root': {
                                fontSize: 28
                              }
                            }}>
                              {section.icon}
                            </ListItemIcon>
                            <ListItemText 
                              primary={section.label}
                              primaryTypographyProps={{
                                fontWeight: isActive ? 700 : 600,
                                fontSize: '1rem'
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Paper>
              </Grid>

              {/* Right Content Area */}
              <Grid item xs={12} md={9}>
                <Fade in timeout={400} key={activeSection}>
                  <Paper
                    sx={{
                      borderRadius: 4,
                      background: isDark 
                        ? 'rgba(42, 31, 61, 0.6)'
                        : 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(20px)',
                      border: `2px solid ${isDark ? 'rgba(196, 181, 253, 0.2)' : 'rgba(167, 139, 250, 0.2)'}`,
                      boxShadow: isDark 
                        ? '0 8px 32px rgba(196, 181, 253, 0.1)'
                        : '0 8px 32px rgba(167, 139, 250, 0.15)',
                      p: 5
                    }}
                  >
                    {/* Profile Section */}
                    {activeSection === 'profile' && (
                      <Box>
                        <Typography variant="h4" fontWeight="700" sx={{ mb: 4, color: isDark ? '#C4B5FD' : '#8B5CF6' }}>
                          Edit Profile
                        </Typography>

                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Full Name"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              variant="outlined"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 3,
                                  bgcolor: isDark ? 'rgba(196, 181, 253, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                                  '& fieldset': {
                                    borderColor: isDark ? 'rgba(196, 181, 253, 0.2)' : 'rgba(167, 139, 250, 0.2)'
                                  },
                                  '&:hover fieldset': {
                                    borderColor: isDark ? 'rgba(196, 181, 253, 0.3)' : 'rgba(167, 139, 250, 0.3)'
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: isDark ? '#C4B5FD' : '#A78BFA'
                                  }
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Email"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleChange}
                              variant="outlined"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 3,
                                  bgcolor: isDark ? 'rgba(196, 181, 253, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                                  '& fieldset': {
                                    borderColor: isDark ? 'rgba(196, 181, 253, 0.2)' : 'rgba(167, 139, 250, 0.2)'
                                  },
                                  '&:hover fieldset': {
                                    borderColor: isDark ? 'rgba(196, 181, 253, 0.3)' : 'rgba(167, 139, 250, 0.3)'
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: isDark ? '#C4B5FD' : '#A78BFA'
                                  }
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Specialization"
                              name="specialization"
                              value={formData.specialization}
                              onChange={handleChange}
                              variant="outlined"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 3,
                                  bgcolor: isDark ? 'rgba(196, 181, 253, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                                  '& fieldset': {
                                    borderColor: isDark ? 'rgba(196, 181, 253, 0.2)' : 'rgba(167, 139, 250, 0.2)'
                                  },
                                  '&:hover fieldset': {
                                    borderColor: isDark ? 'rgba(196, 181, 253, 0.3)' : 'rgba(167, 139, 250, 0.3)'
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: isDark ? '#C4B5FD' : '#A78BFA'
                                  }
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Hospital"
                              name="hospital"
                              value={formData.hospital}
                              onChange={handleChange}
                              variant="outlined"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 3,
                                  bgcolor: isDark ? 'rgba(196, 181, 253, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                                  '& fieldset': {
                                    borderColor: isDark ? 'rgba(196, 181, 253, 0.2)' : 'rgba(167, 139, 250, 0.2)'
                                  },
                                  '&:hover fieldset': {
                                    borderColor: isDark ? 'rgba(196, 181, 253, 0.3)' : 'rgba(167, 139, 250, 0.3)'
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: isDark ? '#C4B5FD' : '#A78BFA'
                                  }
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              variant="outlined"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 3,
                                  bgcolor: isDark ? 'rgba(196, 181, 253, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                                  '& fieldset': {
                                    borderColor: isDark ? 'rgba(196, 181, 253, 0.2)' : 'rgba(167, 139, 250, 0.2)'
                                  },
                                  '&:hover fieldset': {
                                    borderColor: isDark ? 'rgba(196, 181, 253, 0.3)' : 'rgba(167, 139, 250, 0.3)'
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: isDark ? '#C4B5FD' : '#A78BFA'
                                  }
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <Box sx={{ 
                              p: 3, 
                              borderRadius: 3,
                              bgcolor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 246, 255, 0.8)',
                              border: `2px solid ${isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`
                            }}>
                              <Typography variant="h6" fontWeight="600" sx={{ color: isDark ? '#60A5FA' : '#3B82F6', mb: 2 }}>
                                ID Card / License Verification
                              </Typography>
                              <Typography variant="body2" sx={{ color: isDark ? '#94A3B8' : '#64748B', mb: 2 }}>
                                Upload your medical license or ID card. Patients will be able to view this for verification.
                              </Typography>
                              {formData.id_card_url ? (
                                <Box sx={{ mb: 2 }}>
                                  <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 2,
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.9)',
                                    border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`
                                  }}>
                                    <Box
                                      component="img"
                                      src={formData.id_card_url}
                                      alt="ID Card"
                                      sx={{
                                        width: 120,
                                        height: 80,
                                        objectFit: 'cover',
                                        borderRadius: 2,
                                        border: `2px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
                                        cursor: 'pointer',
                                        '&:hover': {
                                          transform: 'scale(1.05)',
                                          borderColor: isDark ? '#60A5FA' : '#3B82F6',
                                        },
                                        transition: 'all 0.3s ease',
                                      }}
                                      onClick={() => window.open(formData.id_card_url, '_blank')}
                                    />
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="body2" fontWeight="600" sx={{ color: isDark ? '#F1F5F9' : '#1E293B', mb: 0.5 }}>
                                        ID Card Uploaded
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                                        Click image to view full size
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Box>
                              ) : null}
                              <Button
                                variant="outlined"
                                component="label"
                                startIcon={uploadingIdCard ? <CircularProgress size={20} /> : <PhotoCameraIcon />}
                                disabled={uploadingIdCard}
                                sx={{
                                  borderRadius: 2,
                                  borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.3)',
                                  color: isDark ? '#60A5FA' : '#3B82F6',
                                  '&:hover': {
                                    borderColor: isDark ? '#60A5FA' : '#3B82F6',
                                    bgcolor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(239, 246, 255, 0.8)',
                                  },
                                  transition: 'all 0.3s ease',
                                }}
                              >
                                {formData.id_card_url ? 'Change ID Card' : 'Upload ID Card'}
                                <input
                                  ref={idCardInputRef}
                                  type="file"
                                  accept="image/*"
                                  style={{ display: 'none' }}
                                  onChange={handleIdCardUpload}
                                />
                              </Button>
                            </Box>
                          </Grid>
                          <Grid item xs={12}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between', 
                              p: 3, 
                              borderRadius: 3,
                              bgcolor: isDark ? 'rgba(196, 181, 253, 0.1)' : 'rgba(167, 139, 250, 0.1)',
                              border: `2px solid ${isDark ? 'rgba(196, 181, 253, 0.2)' : 'rgba(167, 139, 250, 0.2)'}`
                            }}>
                              <Box>
                                <Typography variant="h6" fontWeight="600" sx={{ color: isDark ? '#C4B5FD' : '#8B5CF6', mb: 0.5 }}>
                                  Online Status
                                </Typography>
                                <Typography variant="body2" sx={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                                  Patients can see your availability
                                </Typography>
                              </Box>
                              <Switch
                                checked={formData.is_online}
                                onChange={handleChange}
                                name="is_online"
                                sx={{
                                  '& .MuiSwitch-switchBase.Mui-checked': {
                                    color: '#6EE7B7',
                                  },
                                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                    backgroundColor: '#6EE7B7',
                                  },
                                }}
                              />
                            </Box>
                          </Grid>
                          <Grid item xs={12}>
                            <Button
                              variant="contained"
                              onClick={handleSave}
                              disabled={saving}
                              fullWidth
                              size="large"
                              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                              sx={{
                                mt: 2,
                                py: 2,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #A78BFA 0%, #C4B5FD 100%)',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '1rem',
                                textTransform: 'none',
                                boxShadow: '0 8px 24px rgba(167, 139, 250, 0.3)',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 12px 32px rgba(167, 139, 250, 0.4)',
                                },
                                '&:disabled': {
                                  bgcolor: '#D1D5DB'
                                },
                                transition: 'all 0.3s ease',
                              }}
                            >
                              {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                          </Grid>
                        </Grid>
                      </Box>
                    )}

                    {/* Security Section */}
                    {activeSection === 'security' && (
                      <Box>
                        <Typography variant="h4" fontWeight="700" sx={{ mb: 4, color: isDark ? '#C4B5FD' : '#8B5CF6' }}>
                          Security Settings
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Current Password"
                              name="oldPassword"
                              type="password"
                              value={passwordData.oldPassword}
                              onChange={handlePasswordChange}
                              variant="outlined"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 3,
                                  bgcolor: isDark ? 'rgba(196, 181, 253, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                                  '& fieldset': {
                                    borderColor: isDark ? 'rgba(196, 181, 253, 0.2)' : 'rgba(167, 139, 250, 0.2)'
                                  }
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="New Password"
                              name="newPassword"
                              type="password"
                              value={passwordData.newPassword}
                              onChange={handlePasswordChange}
                              variant="outlined"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 3,
                                  bgcolor: isDark ? 'rgba(196, 181, 253, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                                  '& fieldset': {
                                    borderColor: isDark ? 'rgba(196, 181, 253, 0.2)' : 'rgba(167, 139, 250, 0.2)'
                                  }
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Confirm New Password"
                              name="confirmPassword"
                              type="password"
                              value={passwordData.confirmPassword}
                              onChange={handlePasswordChange}
                              variant="outlined"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 3,
                                  bgcolor: isDark ? 'rgba(196, 181, 253, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                                  '& fieldset': {
                                    borderColor: isDark ? 'rgba(196, 181, 253, 0.2)' : 'rgba(167, 139, 250, 0.2)'
                                  }
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <Button
                              variant="contained"
                              onClick={handleChangePassword}
                              disabled={saving}
                              startIcon={saving ? <CircularProgress size={20} /> : <LockIcon />}
                              sx={{
                                mt: 2,
                                py: 2,
                                px: 4,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #A78BFA 0%, #C4B5FD 100%)',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '1rem',
                                textTransform: 'none',
                                boxShadow: '0 8px 24px rgba(167, 139, 250, 0.3)',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 12px 32px rgba(167, 139, 250, 0.4)',
                                },
                                transition: 'all 0.3s ease',
                              }}
                            >
                              Change Password
                            </Button>
                          </Grid>
                        </Grid>
                      </Box>
                    )}

                    {/* Support Section */}
                    {activeSection === 'support' && (
                      <Box>
                        <Typography variant="h4" fontWeight="700" sx={{ mb: 4, color: isDark ? '#C4B5FD' : '#8B5CF6' }}>
                          Help & Support
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <Paper 
                              variant="outlined" 
                              sx={{ 
                                p: 4, 
                                borderRadius: 4,
                                border: `2px solid ${isDark ? 'rgba(196, 181, 253, 0.2)' : 'rgba(167, 139, 250, 0.2)'}`,
                                bgcolor: isDark ? 'rgba(196, 181, 253, 0.05)' : 'rgba(167, 139, 250, 0.05)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'translateY(-4px)',
                                  borderColor: isDark ? 'rgba(196, 181, 253, 0.4)' : 'rgba(167, 139, 250, 0.4)',
                                }
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Box sx={{
                                  width: 64,
                                  height: 64,
                                  borderRadius: 3,
                                  bgcolor: isDark ? 'rgba(196, 181, 253, 0.2)' : 'rgba(167, 139, 250, 0.2)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: isDark ? '#C4B5FD' : '#A78BFA'
                                }}>
                                  <EmailIcon sx={{ fontSize: 32 }} />
                                </Box>
                                <Box>
                                  <Typography variant="h6" fontWeight="700" sx={{ color: isDark ? '#C4B5FD' : '#8B5CF6', mb: 0.5 }}>
                                    Email Support
                                  </Typography>
                                  <Typography variant="body1" sx={{ color: isDark ? '#D1D5DB' : '#6B7280' }}>
                                    aadipandey223@gmail.com
                                  </Typography>
                                </Box>
                              </Box>
                            </Paper>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Paper 
                              variant="outlined" 
                              sx={{ 
                                p: 4, 
                                borderRadius: 4,
                                border: `2px solid ${isDark ? 'rgba(196, 181, 253, 0.2)' : 'rgba(167, 139, 250, 0.2)'}`,
                                bgcolor: isDark ? 'rgba(196, 181, 253, 0.05)' : 'rgba(167, 139, 250, 0.05)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'translateY(-4px)',
                                  borderColor: isDark ? 'rgba(196, 181, 253, 0.4)' : 'rgba(167, 139, 250, 0.4)',
                                }
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Box sx={{
                                  width: 64,
                                  height: 64,
                                  borderRadius: 3,
                                  bgcolor: isDark ? 'rgba(196, 181, 253, 0.2)' : 'rgba(167, 139, 250, 0.2)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: isDark ? '#C4B5FD' : '#A78BFA'
                                }}>
                                  <PhoneIcon sx={{ fontSize: 32 }} />
                                </Box>
                                <Box>
                                  <Typography variant="h6" fontWeight="700" sx={{ color: isDark ? '#C4B5FD' : '#8B5CF6', mb: 0.5 }}>
                                    Phone Support
                                  </Typography>
                                  <Typography variant="body1" sx={{ color: isDark ? '#D1D5DB' : '#6B7280', mb: 0.5 }}>
                                    +91 9997181525
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: isDark ? '#9CA3AF' : '#9CA3AF' }}>
                                    Monday - Friday, 9 AM - 6 PM IST
                                  </Typography>
                                </Box>
                              </Box>
                            </Paper>
                          </Grid>
                        </Grid>
                      </Box>
                    )}
                  </Paper>
                </Fade>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}

export default DoctorSettings;
