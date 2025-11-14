import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import * as adminApi from '../../api/admin';

function AdminPasswordResets() {
  const [resets, setResets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionDialog, setActionDialog] = useState(false);
  const [selectedReset, setSelectedReset] = useState(null);
  const [action, setAction] = useState('approve'); // 'approve' or 'reject'
  const [newPassword, setNewPassword] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchResets();
  }, []);

  const fetchResets = async () => {
    try {
      setLoading(true);
      const data = await adminApi.listPasswordResets();
      setResets(Array.isArray(data) ? data : []);
      if (data && data.length === 0) {
        setMessage({ type: 'info', text: 'No password reset requests found' });
      }
    } catch (err) {
      console.error('Failed to load password resets:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to load password reset requests' });
      setResets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (reset) => {
    setSelectedReset(reset);
    setAction('approve');
    setActionDialog(true);
  };

  const handleReject = (reset) => {
    setSelectedReset(reset);
    setAction('reject');
    setActionDialog(true);
  };

  const handleSubmitAction = async () => {
    if (action === 'approve' && !newPassword) {
      setMessage({ type: 'error', text: 'Password is required for approval' });
      return;
    }

    if (action === 'approve' && newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    try {
      await adminApi.resolvePasswordReset(
        selectedReset.id,
        action,
        action === 'approve' ? newPassword : undefined,
        reason || undefined
      );
      setMessage({
        type: 'success',
        text: action === 'approve' ? 'Password reset approved' : 'Password reset rejected',
      });
      setActionDialog(false);
      setNewPassword('');
      setReason('');
      setSelectedReset(null);
      fetchResets();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to process request' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return { bg: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', border: '#F59E0B' };
      case 'admin_set':
        return { bg: 'rgba(16, 185, 129, 0.2)', color: '#10B981', border: '#10B981' };
      case 'link_sent':
        return { bg: 'rgba(59, 130, 246, 0.2)', color: '#3B82F6', border: '#3B82F6' };
      case 'completed':
        return { bg: 'rgba(107, 114, 128, 0.2)', color: '#6B7280', border: '#6B7280' };
      default:
        return { bg: 'rgba(107, 114, 128, 0.2)', color: '#6B7280', border: '#6B7280' };
    }
  };

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
          }}
        >
          Password Reset Requests
        </Typography>
        <Typography variant="body2" sx={{ color: '#a0a0a0', mt: 1 }}>
          Review and manage password reset requests from users
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

      <TableContainer
        component={Paper}
        sx={{
          bgcolor: '#1a1a1a',
          border: '1px solid rgba(192, 192, 192, 0.2)',
          borderRadius: 3,
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#252525' }}>
              <TableCell sx={{ color: '#e0e0e0', fontWeight: 600 }}>User</TableCell>
              <TableCell sx={{ color: '#e0e0e0', fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ color: '#e0e0e0', fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ color: '#e0e0e0', fontWeight: 600 }}>Requested</TableCell>
              <TableCell sx={{ color: '#e0e0e0', fontWeight: 600 }}>Resolved</TableCell>
              <TableCell sx={{ color: '#e0e0e0', fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {resets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ color: '#a0a0a0', py: 4 }}>
                  No password reset requests
                </TableCell>
              </TableRow>
            ) : (
              resets.map((reset) => {
                const statusColors = getStatusColor(reset.status);
                return (
                  <TableRow
                    key={reset.id}
                    sx={{
                      '&:hover': { bgcolor: '#252525' },
                      borderBottom: '1px solid rgba(192, 192, 192, 0.1)',
                    }}
                  >
                    <TableCell sx={{ color: '#e0e0e0' }}>{reset.user_name || 'N/A'}</TableCell>
                    <TableCell sx={{ color: '#a0a0a0' }}>{reset.user_email || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={reset.status}
                        size="small"
                        sx={{
                          bgcolor: statusColors.bg,
                          color: statusColors.color,
                          border: `1px solid ${statusColors.border}`,
                          textTransform: 'capitalize',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#a0a0a0' }}>
                      {reset.requested_at ? new Date(reset.requested_at).toLocaleString() : 'N/A'}
                    </TableCell>
                    <TableCell sx={{ color: '#a0a0a0' }}>
                      {reset.resolved_at ? new Date(reset.resolved_at).toLocaleString() : '-'}
                    </TableCell>
                    <TableCell>
                      {reset.status === 'pending' && (
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Approve">
                            <IconButton
                              size="small"
                              onClick={() => handleApprove(reset)}
                              sx={{ color: '#10B981' }}
                            >
                              <CheckIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              onClick={() => handleReject(reset)}
                              sx={{ color: '#EF4444' }}
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Dialog */}
      <Dialog
        open={actionDialog}
        onClose={() => {
          setActionDialog(false);
          setNewPassword('');
          setReason('');
          setSelectedReset(null);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1a1a1a',
            border: '1px solid rgba(192, 192, 192, 0.2)',
          },
        }}
      >
        <DialogTitle sx={{ color: '#e0e0e0' }}>
          {action === 'approve' ? 'Approve Password Reset' : 'Reject Password Reset'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {selectedReset && (
              <Box>
                <Typography variant="body2" sx={{ color: '#a0a0a0', mb: 1 }}>
                  User: {selectedReset.user_name} ({selectedReset.user_email})
                </Typography>
              </Box>
            )}
            {action === 'approve' && (
              <TextField
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#e0e0e0',
                    '& fieldset': { borderColor: 'rgba(192, 192, 192, 0.3)' },
                  },
                  '& .MuiInputLabel-root': { color: '#a0a0a0' },
                }}
              />
            )}
            <TextField
              label="Reason (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              fullWidth
              multiline
              rows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#e0e0e0',
                  '& fieldset': { borderColor: 'rgba(192, 192, 192, 0.3)' },
                },
                '& .MuiInputLabel-root': { color: '#a0a0a0' },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(192, 192, 192, 0.1)' }}>
          <Button
            onClick={() => {
              setActionDialog(false);
              setNewPassword('');
              setReason('');
              setSelectedReset(null);
            }}
            sx={{ color: '#a0a0a0' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitAction}
            variant="contained"
            sx={{
              bgcolor: action === 'approve' ? '#10B981' : '#EF4444',
              color: '#fff',
              '&:hover': {
                bgcolor: action === 'approve' ? '#059669' : '#DC2626',
              },
            }}
          >
            {action === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AdminPasswordResets;

