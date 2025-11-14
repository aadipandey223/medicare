import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Container, Paper, Fade, CircularProgress,
  Alert, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, IconButton, Tooltip, Button, Grid, Card, CardContent
} from '@mui/material';
import { 
  Assignment as AssignmentIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';

import { apiRequest } from '../../api/api';

function DoctorReports() {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchReports();
    const interval = setInterval(() => {
      fetchReports(true);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchReports = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    
    try {
      const data = await apiRequest('/doctor/reports');
      setReports(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError(err.message);
      if (err.message.includes('Session expired') || err.message.includes('Not authenticated')) {
        return;
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  const handleViewDocument = async (report) => {
    // Open the document in a new tab
    if (report.download_url) {
      window.open(report.download_url, '_blank', 'noopener');
      
      // Mark as viewed
      try {
        await apiRequest(`/doctor/reports/${report.id}/view`, {
          method: 'POST'
        });
        // Refresh the reports list to update the count
        fetchReports(true);
      } catch (err) {
        // Silent fail - don't show error if marking as viewed fails
        console.error('Failed to mark document as viewed:', err);
      }
    }
  };

  const getFileTypeColor = (mimeType) => {
    if (!mimeType) return isDark ? '#64748B' : '#6B7280';
    if (mimeType.includes('pdf')) return isDark ? '#EF4444' : '#DC2626';
    if (mimeType.includes('image')) return isDark ? '#10B981' : '#059669';
    if (mimeType.includes('word') || mimeType.includes('document')) return isDark ? '#3B82F6' : '#2563EB';
    return isDark ? '#64748B' : '#6B7280';
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        bgcolor: isDark ? '#0F172A' : '#FAFAFA'
      }}>
        <CircularProgress size={40} thickness={4} sx={{ color: isDark ? '#60A5FA' : '#3B82F6' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      bgcolor: isDark ? '#0F172A' : '#FAFAFA', 
      height: '100%', 
      overflow: 'auto',
      py: 3 
    }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, sm: 3 } }}>
        <Fade in timeout={800}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Box>
                <Typography variant="h4" fontWeight="600" sx={{ 
                  color: isDark ? '#F1F5F9' : '#111827', 
                  mb: 0.5 
                }}>
                  Patient Reports & Documents
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: isDark ? '#94A3B8' : '#6B7280',
                  fontSize: '0.9375rem'
                }}>
                  View and manage all patient medical documents
                </Typography>
              </Box>
              <IconButton
                onClick={() => fetchReports()}
                disabled={refreshing}
                size="small"
                sx={{
                  bgcolor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(239, 246, 255, 0.8)',
                  color: isDark ? '#60A5FA' : '#3B82F6',
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(239, 246, 255, 1)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <RefreshIcon fontSize="small" sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              </IconButton>
            </Box>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  bgcolor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(254, 242, 242, 0.9)',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }} 
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            )}
          </Box>
        </Fade>

        {reports.length === 0 ? (
          <Fade in timeout={600}>
            <Paper 
              sx={{ 
                p: 16, 
                textAlign: 'center',
                borderRadius: 3,
                border: `1px solid ${isDark ? 'rgba(30, 41, 59, 0.8)' : '#E5E7EB'}`,
                bgcolor: isDark ? '#1E293B' : '#FFFFFF',
                boxShadow: 'none'
              }}
            >
              <Box sx={{ 
                display: 'inline-flex', 
                p: 8, 
                bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : '#F3F4F6', 
                borderRadius: '50%', 
                mb: 3 
              }}>
                <AssignmentIcon sx={{ 
                  fontSize: 48, 
                  color: isDark ? '#475569' : '#D1D5DB' 
                }} />
              </Box>
              <Typography variant="h4" fontWeight="600" sx={{ 
                color: isDark ? '#F1F5F9' : '#111827', 
                mb: 1 
              }}>
                No Reports Available
              </Typography>
              <Typography variant="body1" sx={{ 
                color: isDark ? '#94A3B8' : '#6B7280', 
                maxWidth: 448, 
                mx: 'auto' 
              }}>
                Patient documents will appear here once they upload files during consultations.
              </Typography>
            </Paper>
          </Fade>
        ) : (
          <Fade in timeout={600}>
            <TableContainer 
              component={Paper}
              sx={{
                borderRadius: 3,
                border: `1px solid ${isDark ? 'rgba(30, 41, 59, 0.8)' : '#E5E7EB'}`,
                bgcolor: isDark ? '#1E293B' : '#FFFFFF',
                boxShadow: 'none'
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ 
                    bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : '#F9FAFB',
                    borderBottom: `1px solid ${isDark ? 'rgba(30, 41, 59, 0.8)' : '#E5E7EB'}`
                  }}>
                    <TableCell sx={{ color: isDark ? '#F1F5F9' : '#111827', fontWeight: 600 }}>Document</TableCell>
                    <TableCell sx={{ color: isDark ? '#F1F5F9' : '#111827', fontWeight: 600 }}>Patient</TableCell>
                    <TableCell sx={{ color: isDark ? '#F1F5F9' : '#111827', fontWeight: 600 }}>Type</TableCell>
                    <TableCell sx={{ color: isDark ? '#F1F5F9' : '#111827', fontWeight: 600 }}>Size</TableCell>
                    <TableCell sx={{ color: isDark ? '#F1F5F9' : '#111827', fontWeight: 600 }}>Uploaded</TableCell>
                    <TableCell align="right" sx={{ color: isDark ? '#F1F5F9' : '#111827', fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow 
                      key={report.id}
                      sx={{
                        borderBottom: `1px solid ${isDark ? 'rgba(30, 41, 59, 0.8)' : '#E5E7EB'}`,
                        '&:hover': {
                          bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : '#F9FAFB'
                        }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <DescriptionIcon sx={{ 
                            color: getFileTypeColor(report.mime_type),
                            fontSize: 24 
                          }} />
                          <Box>
                            <Typography variant="body2" sx={{ 
                              color: isDark ? '#F1F5F9' : '#111827',
                              fontWeight: 500
                            }}>
                              {report.file_name || 'Untitled Document'}
                            </Typography>
                            {report.description && (
                              <Typography variant="caption" sx={{ 
                                color: isDark ? '#94A3B8' : '#6B7280',
                                fontSize: '0.75rem'
                              }}>
                                {report.description}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ 
                          color: isDark ? '#F1F5F9' : '#111827'
                        }}>
                          {report.patient_name || 'Unknown'}
                        </Typography>
                        {report.patient_email && (
                          <Typography variant="caption" sx={{ 
                            color: isDark ? '#94A3B8' : '#6B7280',
                            fontSize: '0.75rem'
                          }}>
                            {report.patient_email}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={report.mime_type?.split('/')[1]?.toUpperCase() || 'FILE'}
                          size="small"
                          sx={{
                            bgcolor: isDark 
                              ? `${getFileTypeColor(report.mime_type)}20` 
                              : `${getFileTypeColor(report.mime_type)}15`,
                            color: getFileTypeColor(report.mime_type),
                            fontWeight: 600,
                            fontSize: '0.7rem'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ 
                          color: isDark ? '#94A3B8' : '#6B7280'
                        }}>
                          {formatFileSize(report.file_size)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ 
                          color: isDark ? '#94A3B8' : '#6B7280'
                        }}>
                          {formatDate(report.uploaded_at || report.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          {report.download_url && (
                            <>
                              <Tooltip title="View">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewDocument(report)}
                                  sx={{
                                    color: isDark ? '#60A5FA' : '#3B82F6',
                                    '&:hover': {
                                      bgcolor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)'
                                    }
                                  }}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Download">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = report.download_url;
                                    link.download = report.file_name || 'document';
                                    link.target = '_blank';
                                    link.click();
                                  }}
                                  sx={{
                                    color: isDark ? '#10B981' : '#059669',
                                    '&:hover': {
                                      bgcolor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)'
                                    }
                                  }}
                                >
                                  <DownloadIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Fade>
        )}
      </Box>
    </Box>
  );
}

export default DoctorReports;
