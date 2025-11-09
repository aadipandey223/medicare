import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import * as adminApi from '../../api/admin';

function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addDialog, setAddDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    hospital: '',
    phone: '',
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const data = await adminApi.listDoctors();
      setDoctors(data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load doctors' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoctor = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      setMessage({ type: 'error', text: 'Name, email, and password are required' });
      return;
    }

    try {
      await adminApi.addDoctor(formData);
      setMessage({ type: 'success', text: 'Doctor added successfully' });
      setAddDialog(false);
      setFormData({ name: '', email: '', password: '', specialization: '', hospital: '', phone: '' });
      fetchDoctors();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to add doctor' });
    }
  };

  const handleApproveDoctor = async (doctorId) => {
    try {
      await adminApi.updateDoctor(doctorId, { is_active: true });
      setMessage({ type: 'success', text: 'Doctor approved successfully' });
      fetchDoctors();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to approve doctor' });
    }
  };

  const handleDeactivateDoctor = async (doctorId) => {
    if (!window.confirm('Are you sure you want to delete this doctor? This action cannot be undone and will remove the doctor from the database.')) {
      return;
    }

    try {
      await adminApi.deleteDoctor(doctorId);
      setMessage({ type: 'success', text: 'Doctor deleted successfully' });
      fetchDoctors();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete doctor' });
    }
  };

  const handleUpdateDoctor = async () => {
    if (!selectedDoctor) return;

    try {
      await adminApi.updateDoctor(selectedDoctor.id, formData);
      setMessage({ type: 'success', text: 'Doctor updated successfully' });
      setEditDialog(false);
      setFormData({ name: '', email: '', password: '', specialization: '', hospital: '', phone: '' });
      fetchDoctors();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update doctor' });
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
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
          Doctor Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddDialog(true)}
          sx={{
            bgcolor: '#252525',
            color: '#e0e0e0',
            border: '1px solid rgba(192, 192, 192, 0.3)',
            '&:hover': {
              bgcolor: '#2a2a2a',
              borderColor: 'rgba(218, 165, 32, 0.5)',
            },
          }}
        >
          Add Doctor
        </Button>
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
              <TableCell sx={{ color: '#e0e0e0', fontWeight: 600 }}>Specialization</TableCell>
              <TableCell sx={{ color: '#e0e0e0', fontWeight: 600 }}>Hospital</TableCell>
              <TableCell sx={{ color: '#e0e0e0', fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ color: '#e0e0e0', fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {doctors.map((doctor) => (
              <TableRow
                key={doctor.id}
                sx={{
                  '&:hover': { bgcolor: '#252525' },
                  borderBottom: '1px solid rgba(192, 192, 192, 0.1)',
                }}
              >
                <TableCell sx={{ color: '#e0e0e0' }}>Dr. {doctor.name}</TableCell>
                <TableCell sx={{ color: '#a0a0a0' }}>{doctor.email}</TableCell>
                <TableCell sx={{ color: '#a0a0a0' }}>{doctor.specialization || 'N/A'}</TableCell>
                <TableCell sx={{ color: '#a0a0a0' }}>{doctor.hospital || 'N/A'}</TableCell>
                <TableCell>
                  <Chip
                    label={doctor.is_active ? 'Active' : 'Pending'}
                    size="small"
                    sx={{
                      bgcolor: doctor.is_active
                        ? 'rgba(16, 185, 129, 0.2)'
                        : 'rgba(245, 158, 11, 0.2)',
                      color: doctor.is_active ? '#10B981' : '#F59E0B',
                      border: `1px solid ${doctor.is_active ? '#10B981' : '#F59E0B'}`,
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="View">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedDoctor(doctor);
                          setViewDialog(true);
                        }}
                        sx={{ color: '#a0a0a0' }}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {!doctor.is_active && (
                      <Tooltip title="Approve">
                        <IconButton
                          size="small"
                          onClick={() => handleApproveDoctor(doctor.id)}
                          sx={{ color: '#10B981' }}
                        >
                          <CheckIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedDoctor(doctor);
                          setFormData({
                            name: doctor.name,
                            email: doctor.email,
                            password: '',
                            specialization: doctor.specialization || '',
                            hospital: doctor.hospital || '',
                            phone: doctor.phone || '',
                          });
                          setEditDialog(true);
                        }}
                        sx={{ color: '#a0a0a0' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDeactivateDoctor(doctor.id)}
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

      {/* Add Doctor Dialog */}
      <Dialog
        open={addDialog}
        onClose={() => setAddDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1a1a1a',
            border: '1px solid rgba(192, 192, 192, 0.2)',
          },
        }}
      >
        <DialogTitle sx={{ color: '#e0e0e0' }}>Add New Doctor</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
            <TextField
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
            <TextField
              label="Specialization"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
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
              label="Hospital"
              value={formData.hospital}
              onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
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
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(192, 192, 192, 0.1)' }}>
          <Button onClick={() => setAddDialog(false)} sx={{ color: '#a0a0a0' }}>
            Cancel
          </Button>
          <Button
            onClick={handleAddDoctor}
            variant="contained"
            sx={{
              bgcolor: '#252525',
              color: '#e0e0e0',
              border: '1px solid rgba(192, 192, 192, 0.3)',
              '&:hover': { bgcolor: '#2a2a2a' },
            }}
          >
            Add Doctor
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Doctor Dialog */}
      <Dialog
        open={editDialog}
        onClose={() => setEditDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1a1a1a',
            border: '1px solid rgba(192, 192, 192, 0.2)',
          },
        }}
      >
        <DialogTitle sx={{ color: '#e0e0e0' }}>Edit Doctor</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
            <TextField
              label="New Password (leave blank to keep current)"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
              label="Specialization"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
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
              label="Hospital"
              value={formData.hospital}
              onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
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
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(192, 192, 192, 0.1)' }}>
          <Button onClick={() => setEditDialog(false)} sx={{ color: '#a0a0a0' }}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateDoctor}
            variant="contained"
            sx={{
              bgcolor: '#252525',
              color: '#e0e0e0',
              border: '1px solid rgba(192, 192, 192, 0.3)',
              '&:hover': { bgcolor: '#2a2a2a' },
            }}
          >
            Update Doctor
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Doctor Dialog */}
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
        <DialogTitle sx={{ color: '#e0e0e0' }}>Doctor Details</DialogTitle>
        <DialogContent>
          {selectedDoctor && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#a0a0a0' }}>Name</Typography>
                <Typography variant="body1" sx={{ color: '#e0e0e0' }}>Dr. {selectedDoctor.name}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#a0a0a0' }}>Email</Typography>
                <Typography variant="body1" sx={{ color: '#e0e0e0' }}>{selectedDoctor.email}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#a0a0a0' }}>Specialization</Typography>
                <Typography variant="body1" sx={{ color: '#e0e0e0' }}>{selectedDoctor.specialization || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#a0a0a0' }}>Hospital</Typography>
                <Typography variant="body1" sx={{ color: '#e0e0e0' }}>{selectedDoctor.hospital || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#a0a0a0' }}>Phone</Typography>
                <Typography variant="body1" sx={{ color: '#e0e0e0' }}>{selectedDoctor.phone || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#a0a0a0' }}>Status</Typography>
                <Chip
                  label={selectedDoctor.is_active ? 'Active' : 'Pending Verification'}
                  size="small"
                  sx={{
                    bgcolor: selectedDoctor.is_active
                      ? 'rgba(16, 185, 129, 0.2)'
                      : 'rgba(245, 158, 11, 0.2)',
                    color: selectedDoctor.is_active ? '#10B981' : '#F59E0B',
                    border: `1px solid ${selectedDoctor.is_active ? '#10B981' : '#F59E0B'}`,
                  }}
                />
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
    </Container>
  );
}

export default AdminDoctors;

