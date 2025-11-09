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
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  LockReset as LockResetIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import * as adminApi from '../../api/admin';

function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewDialog, setViewDialog] = useState(false);
  const [resetDialog, setResetDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const data = await adminApi.listPatients();
      setPatients(data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load patients' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePatient = async (patientId) => {
    if (!window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      return;
    }

    try {
      await adminApi.deletePatient(patientId);
      setMessage({ type: 'success', text: 'Patient deleted successfully' });
      fetchPatients();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete patient' });
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    if (!selectedPatient) return;

    try {
      await adminApi.resetPatientPassword(selectedPatient.id, newPassword);
      setMessage({ type: 'success', text: 'Password reset successfully' });
      setResetDialog(false);
      setNewPassword('');
      setSelectedPatient(null);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to reset password' });
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
          Patient Management
        </Typography>
        <Typography variant="body2" sx={{ color: '#a0a0a0', mt: 1 }}>
          View and manage all patient accounts
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
              <TableCell sx={{ color: '#e0e0e0', fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ color: '#e0e0e0', fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ color: '#e0e0e0', fontWeight: 600 }}>Phone</TableCell>
              <TableCell sx={{ color: '#e0e0e0', fontWeight: 600 }}>Age</TableCell>
              <TableCell sx={{ color: '#e0e0e0', fontWeight: 600 }}>Gender</TableCell>
              <TableCell sx={{ color: '#e0e0e0', fontWeight: 600 }}>Created</TableCell>
              <TableCell sx={{ color: '#e0e0e0', fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.map((patient) => (
              <TableRow
                key={patient.id}
                sx={{
                  '&:hover': { bgcolor: '#252525' },
                  borderBottom: '1px solid rgba(192, 192, 192, 0.1)',
                }}
              >
                <TableCell sx={{ color: '#e0e0e0' }}>{patient.name}</TableCell>
                <TableCell sx={{ color: '#a0a0a0' }}>{patient.email}</TableCell>
                <TableCell sx={{ color: '#a0a0a0' }}>{patient.phone || 'N/A'}</TableCell>
                <TableCell sx={{ color: '#a0a0a0' }}>{patient.age || 'N/A'}</TableCell>
                <TableCell sx={{ color: '#a0a0a0' }}>{patient.gender || 'N/A'}</TableCell>
                <TableCell sx={{ color: '#a0a0a0' }}>
                  {patient.created_at ? new Date(patient.created_at).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="View">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedPatient(patient);
                          setViewDialog(true);
                        }}
                        sx={{ color: '#a0a0a0' }}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reset Password">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedPatient(patient);
                          setResetDialog(true);
                        }}
                        sx={{ color: '#F59E0B' }}
                      >
                        <LockResetIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDeletePatient(patient.id)}
                        sx={{ color: '#EF4444' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View Patient Dialog */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1a1a1a',
            border: '1px solid rgba(192, 192, 192, 0.2)',
          },
        }}
      >
        <DialogTitle sx={{ color: '#e0e0e0' }}>Patient Details</DialogTitle>
        <DialogContent>
          {selectedPatient && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#a0a0a0' }}>Name</Typography>
                <Typography variant="body1" sx={{ color: '#e0e0e0' }}>{selectedPatient.name}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#a0a0a0' }}>Email</Typography>
                <Typography variant="body1" sx={{ color: '#e0e0e0' }}>{selectedPatient.email}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#a0a0a0' }}>Phone</Typography>
                <Typography variant="body1" sx={{ color: '#e0e0e0' }}>{selectedPatient.phone || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#a0a0a0' }}>Age</Typography>
                <Typography variant="body1" sx={{ color: '#e0e0e0' }}>{selectedPatient.age || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#a0a0a0' }}>Gender</Typography>
                <Typography variant="body1" sx={{ color: '#e0e0e0' }}>{selectedPatient.gender || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#a0a0a0' }}>Medical History</Typography>
                <Typography variant="body2" sx={{ color: '#a0a0a0', mt: 1 }}>
                  {selectedPatient.medical_history || 'No medical history recorded'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#a0a0a0' }}>Created</Typography>
                <Typography variant="body1" sx={{ color: '#e0e0e0' }}>
                  {selectedPatient.created_at ? new Date(selectedPatient.created_at).toLocaleString() : 'N/A'}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(192, 192, 192, 0.1)' }}>
          <Button onClick={() => setViewDialog(false)} sx={{ color: '#a0a0a0' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog
        open={resetDialog}
        onClose={() => {
          setResetDialog(false);
          setNewPassword('');
          setSelectedPatient(null);
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
          Reset Password for {selectedPatient?.name}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            required
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                color: '#e0e0e0',
                '& fieldset': { borderColor: 'rgba(192, 192, 192, 0.3)' },
              },
              '& .MuiInputLabel-root': { color: '#a0a0a0' },
            }}
          />
          <Typography variant="caption" sx={{ color: '#a0a0a0', mt: 1, display: 'block' }}>
            Password must be at least 6 characters long
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(192, 192, 192, 0.1)' }}>
          <Button
            onClick={() => {
              setResetDialog(false);
              setNewPassword('');
              setSelectedPatient(null);
            }}
            sx={{ color: '#a0a0a0' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleResetPassword}
            variant="contained"
            sx={{
              bgcolor: '#252525',
              color: '#e0e0e0',
              border: '1px solid rgba(192, 192, 192, 0.3)',
              '&:hover': { bgcolor: '#2a2a2a' },
            }}
          >
            Reset Password
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AdminPatients;

