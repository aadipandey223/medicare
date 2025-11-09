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
  CircularProgress,
  Chip,
} from '@mui/material';
import * as adminApi from '../../api/admin';

function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const data = await adminApi.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    if (action.includes('add') || action.includes('approve')) {
      return { bg: 'rgba(16, 185, 129, 0.2)', color: '#10B981' };
    } else if (action.includes('remove') || action.includes('delete') || action.includes('reject')) {
      return { bg: 'rgba(239, 68, 68, 0.2)', color: '#EF4444' };
    } else if (action.includes('update') || action.includes('reset')) {
      return { bg: 'rgba(59, 130, 246, 0.2)', color: '#3B82F6' };
    }
    return { bg: 'rgba(107, 114, 128, 0.2)', color: '#6B7280' };
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
          Audit Logs
        </Typography>
        <Typography variant="body2" sx={{ color: '#a0a0a0', mt: 1 }}>
          Complete history of all admin actions
        </Typography>
      </Box>

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
              <TableCell sx={{ color: '#e0e0e0', fontWeight: 600 }}>Timestamp</TableCell>
              <TableCell sx={{ color: '#e0e0e0', fontWeight: 600 }}>Action</TableCell>
              <TableCell sx={{ color: '#e0e0e0', fontWeight: 600 }}>Target User ID</TableCell>
              <TableCell sx={{ color: '#e0e0e0', fontWeight: 600 }}>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ color: '#a0a0a0', py: 4 }}>
                  No audit logs found
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => {
                const actionColors = getActionColor(log.action);
                return (
                  <TableRow
                    key={log.id}
                    sx={{
                      '&:hover': { bgcolor: '#252525' },
                      borderBottom: '1px solid rgba(192, 192, 192, 0.1)',
                    }}
                  >
                    <TableCell sx={{ color: '#a0a0a0' }}>
                      {log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.action.replace('_', ' ')}
                        size="small"
                        sx={{
                          bgcolor: actionColors.bg,
                          color: actionColors.color,
                          border: `1px solid ${actionColors.color}`,
                          textTransform: 'capitalize',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#a0a0a0' }}>
                      {log.target_user_id || '-'}
                    </TableCell>
                    <TableCell sx={{ color: '#a0a0a0', maxWidth: 300 }}>
                      {log.meta ? (
                        <Typography
                          variant="body2"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={log.meta}
                        >
                          {log.meta}
                        </Typography>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default AdminAuditLogs;

