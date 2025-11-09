import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Stack,
  Alert,
} from '@mui/material';
import {
  Save as SaveIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Backup as BackupIcon,
  Block as BlockIcon,
} from '@mui/icons-material';

function AdminSettings() {
  const [settings, setSettings] = useState({
    enableSignups: true,
    maxAccounts: 1000,
    consultationFee: 0,
    emailNotifications: true,
    pushNotifications: true,
  });
  const [message, setMessage] = useState(null);

  const handleSave = () => {
    // In a real app, this would save to backend
    setMessage({ type: 'success', text: 'Settings saved successfully' });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{
            background: 'linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 50%, #DAA520 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          System Settings
        </Typography>
        <Typography variant="body2" sx={{ color: '#a0a0a0', mt: 1 }}>
          Configure platform preferences and system behavior
        </Typography>
      </Box>

      {message && (
        <Alert
          severity={message.type}
          sx={{ mb: 3 }}
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* Platform Preferences */}
        <Paper
          sx={{
            p: 4,
            bgcolor: '#1a1a1a',
            border: '1px solid rgba(192, 192, 192, 0.2)',
            borderRadius: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <BlockIcon sx={{ color: '#C0C0C0', fontSize: 32 }} />
            <Typography variant="h6" fontWeight="600" sx={{ color: '#e0e0e0' }}>
              Platform Preferences
            </Typography>
          </Box>
          <Stack spacing={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableSignups}
                  onChange={(e) => setSettings({ ...settings, enableSignups: e.target.checked })}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#DAA520',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#DAA520',
                    },
                  }}
                />
              }
              label="Enable User Signups"
              sx={{ color: '#e0e0e0' }}
            />
            <TextField
              label="Maximum Accounts"
              type="number"
              value={settings.maxAccounts}
              onChange={(e) => setSettings({ ...settings, maxAccounts: parseInt(e.target.value) || 0 })}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#e0e0e0',
                  '& fieldset': { borderColor: 'rgba(192, 192, 192, 0.3)' },
                },
                '& .MuiInputLabel-root': { color: '#a0a0a0' },
              }}
            />
            <TextField
              label="Consultation Fee (if applicable)"
              type="number"
              value={settings.consultationFee}
              onChange={(e) => setSettings({ ...settings, consultationFee: parseFloat(e.target.value) || 0 })}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#e0e0e0',
                  '& fieldset': { borderColor: 'rgba(192, 192, 192, 0.3)' },
                },
                '& .MuiInputLabel-root': { color: '#a0a0a0' },
              }}
            />
          </Stack>
        </Paper>

        {/* Notification Settings */}
        <Paper
          sx={{
            p: 4,
            bgcolor: '#1a1a1a',
            border: '1px solid rgba(192, 192, 192, 0.2)',
            borderRadius: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <NotificationsIcon sx={{ color: '#C0C0C0', fontSize: 32 }} />
            <Typography variant="h6" fontWeight="600" sx={{ color: '#e0e0e0' }}>
              Notification Settings
            </Typography>
          </Box>
          <Stack spacing={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#DAA520',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#DAA520',
                    },
                  }}
                />
              }
              label="Email Notifications"
              sx={{ color: '#e0e0e0' }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.pushNotifications}
                  onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#DAA520',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#DAA520',
                    },
                  }}
                />
              }
              label="Push Notifications"
              sx={{ color: '#e0e0e0' }}
            />
            <TextField
              label="Email Service API Key"
              type="password"
              placeholder="Enter email service API key"
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#e0e0e0',
                  '& fieldset': { borderColor: 'rgba(192, 192, 192, 0.3)' },
                },
                '& .MuiInputLabel-root': { color: '#a0a0a0' },
              }}
            />
            <TextField
              label="Push Notification Service Key"
              type="password"
              placeholder="Enter push notification service key"
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#e0e0e0',
                  '& fieldset': { borderColor: 'rgba(192, 192, 192, 0.3)' },
                },
                '& .MuiInputLabel-root': { color: '#a0a0a0' },
              }}
            />
          </Stack>
        </Paper>

        {/* Backup Settings */}
        <Paper
          sx={{
            p: 4,
            bgcolor: '#1a1a1a',
            border: '1px solid rgba(192, 192, 192, 0.2)',
            borderRadius: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <BackupIcon sx={{ color: '#C0C0C0', fontSize: 32 }} />
            <Typography variant="h6" fontWeight="600" sx={{ color: '#e0e0e0' }}>
              Backup & Export
            </Typography>
          </Box>
          <Stack spacing={2}>
            <Button
              variant="outlined"
              onClick={() => {
                // In a real app, this would trigger database export
                setMessage({ type: 'info', text: 'Database export initiated' });
              }}
              sx={{
                borderColor: 'rgba(192, 192, 192, 0.3)',
                color: '#e0e0e0',
                '&:hover': {
                  borderColor: 'rgba(218, 165, 32, 0.5)',
                  bgcolor: 'rgba(218, 165, 32, 0.1)',
                },
              }}
            >
              Export Database Dump
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                // In a real app, this would trigger logs export
                setMessage({ type: 'info', text: 'Logs export initiated' });
              }}
              sx={{
                borderColor: 'rgba(192, 192, 192, 0.3)',
                color: '#e0e0e0',
                '&:hover': {
                  borderColor: 'rgba(218, 165, 32, 0.5)',
                  bgcolor: 'rgba(218, 165, 32, 0.1)',
                },
              }}
            >
              Export Audit Logs
            </Button>
          </Stack>
        </Paper>

        {/* Save Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{
              bgcolor: '#252525',
              color: '#e0e0e0',
              border: '1px solid rgba(192, 192, 192, 0.3)',
              px: 4,
              py: 1.5,
              '&:hover': {
                bgcolor: '#2a2a2a',
                borderColor: 'rgba(218, 165, 32, 0.5)',
              },
            }}
          >
            Save Settings
          </Button>
        </Box>
      </Stack>
    </Container>
  );
}

export default AdminSettings;

