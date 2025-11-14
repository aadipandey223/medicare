import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Card, CardContent, TextField, Button, 
  Container, Paper, Chip, CircularProgress, Alert, Fade,
  Divider, List, ListItem, ListItemIcon, ListItemText, Stack,
  IconButton, Tooltip
} from '@mui/material';
import { 
  TipsAndUpdates as TipsAndUpdatesIcon,
  Mic,
  Psychology,
  Warning,
  CheckCircle,
  LocalHospital,
  FitnessCenter,
  LocalPharmacy,
  AutoAwesome,
  ArrowForward,
  Refresh
} from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';

function LLMAnalysis() {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const [input, setInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Get API base URL from environment
  const rawApiBase = import.meta.env.VITE_API_URL || '/api';
  const API_BASE_URL = rawApiBase.endsWith('/api')
    ? rawApiBase
    : `${rawApiBase.replace(/\/$/, '')}/api`;

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setAnalyzing(true);
    setError('');
    setResult(null);
    
    try {
      const token = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('token')) || localStorage.getItem('token');
      
      if (!token) {
        setError('Please log in to use AI analysis');
        setAnalyzing(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/analyze-symptoms`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          symptoms: input.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to analyze symptoms');
      }

      const analysisData = await response.json();
      setResult(analysisData);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze symptoms. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setInput('');
    setResult(null);
    setError('');
  };

  return (
    <Box sx={{ 
      height: '100%',
      width: '100%',
      py: 3,
      px: { xs: 2, sm: 3 },
      overflow: 'auto',
      background: isDark
        ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)'
        : 'linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 50%, #F8FAFC 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 15s ease infinite',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: isDark
          ? 'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)'
          : 'radial-gradient(circle at 20% 50%, rgba(192, 132, 252, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(244, 114, 182, 0.05) 0%, transparent 50%)',
        pointerEvents: 'none',
        zIndex: 0,
      },
      '@keyframes gradientShift': {
        '0%': { backgroundPosition: '0% 50%' },
        '50%': { backgroundPosition: '100% 50%' },
        '100%': { backgroundPosition: '0% 50%' },
      },
    }}>
      <Box sx={{ position: 'relative', zIndex: 1, maxWidth: '1000px', mx: 'auto' }}>
        <Fade in timeout={600}>
          <Box>
            {/* Modern Header */}
            <Box sx={{ 
              textAlign: 'center', 
              mb: 4,
              position: 'relative'
            }}>
              <Box sx={{ 
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
                mb: 2,
                borderRadius: '50%',
                background: isDark
                  ? 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)'
                  : 'linear-gradient(135deg, #A78BFA 0%, #F472B6 100%)',
                boxShadow: isDark
                  ? '0 20px 60px rgba(139, 92, 246, 0.4)'
                  : '0 20px 60px rgba(167, 139, 250, 0.3)',
              }}>
                <AutoAwesome sx={{ fontSize: 56, color: 'white' }} />
              </Box>
              
              <Typography 
                variant="h3" 
                fontWeight="800" 
                gutterBottom
                sx={{ 
                  color: isDark ? '#F1F5F9' : '#0F172A',
                  letterSpacing: '-1px',
                  mb: 1.5
                }}
              >
                AI Health Assistant
              </Typography>
              
              <Typography 
                variant="h6" 
                sx={{ 
                  color: isDark ? 'rgba(241, 245, 249, 0.7)' : 'rgba(15, 23, 42, 0.7)',
                  fontWeight: 400,
                  maxWidth: 600,
                  mx: 'auto',
                  lineHeight: 1.6
                }}
              >
                Powered by Phi-4-mini AI • Get instant health insights and personalized recommendations
              </Typography>
            </Box>

            {/* Input Form - Enhanced Design */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 4, 
                borderRadius: 4, 
                mb: 3,
                bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                border: isDark 
                  ? '2px solid rgba(139, 92, 246, 0.2)' 
                  : '2px solid rgba(226, 232, 240, 0.8)',
                backdropFilter: 'blur(20px)',
                boxShadow: isDark
                  ? '0 10px 40px rgba(139, 92, 246, 0.15)'
                  : '0 10px 40px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: isDark ? 'rgba(139, 92, 246, 0.4)' : 'rgba(167, 139, 250, 0.5)',
                  boxShadow: isDark
                    ? '0 20px 60px rgba(139, 92, 246, 0.25)'
                    : '0 20px 60px rgba(0, 0, 0, 0.08)',
                }
              }}
            >
              <form onSubmit={handleAnalyze}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography 
                    variant="h6" 
                    fontWeight="700"
                    sx={{ 
                      color: isDark ? '#F1F5F9' : '#0F172A',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Psychology sx={{ color: isDark ? '#A78BFA' : '#8B5CF6' }} />
                    Describe Your Symptoms
                  </Typography>
                  
                  {result && (
                    <Tooltip title="Start new analysis">
                      <IconButton 
                        onClick={handleReset}
                        sx={{ 
                          color: isDark ? '#A78BFA' : '#8B5CF6',
                          '&:hover': {
                            bgcolor: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)'
                          }
                        }}
                      >
                        <Refresh />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>

                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  placeholder="Example: I've been experiencing headache and fever for the past 2 days. I also feel tired and have body aches..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  variant="outlined"
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      bgcolor: isDark ? 'rgba(15, 23, 42, 0.4)' : 'rgba(248, 250, 252, 0.8)',
                      borderRadius: 3,
                      fontSize: '1rem',
                      lineHeight: 1.8,
                      '& fieldset': {
                        borderColor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(203, 213, 225, 0.5)',
                        borderWidth: 2
                      },
                      '&:hover fieldset': {
                        borderColor: isDark ? 'rgba(139, 92, 246, 0.4)' : 'rgba(139, 92, 246, 0.3)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: isDark ? '#8B5CF6' : '#A78BFA',
                      },
                      '& textarea': {
                        color: isDark ? '#F1F5F9' : '#0F172A'
                      },
                      '& textarea::placeholder': {
                        color: isDark ? 'rgba(241, 245, 249, 0.4)' : 'rgba(15, 23, 42, 0.4)',
                        opacity: 1
                      }
                    }
                  }}
                />
                
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={!input.trim() || analyzing}
                    startIcon={analyzing ? <CircularProgress size={20} color="inherit" /> : <AutoAwesome />}
                    endIcon={!analyzing && <ArrowForward />}
                    sx={{ 
                      py: 1.8,
                      px: 4,
                      fontWeight: 700,
                      fontSize: '1.05rem',
                      borderRadius: 3,
                      textTransform: 'none',
                      background: isDark
                        ? 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)'
                        : 'linear-gradient(135deg, #A78BFA 0%, #F472B6 100%)',
                      boxShadow: isDark
                        ? '0 8px 24px rgba(139, 92, 246, 0.4)'
                        : '0 8px 24px rgba(167, 139, 250, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: isDark
                          ? '0 12px 32px rgba(139, 92, 246, 0.5)'
                          : '0 12px 32px rgba(167, 139, 250, 0.4)',
                        background: isDark
                          ? 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)'
                          : 'linear-gradient(135deg, #9333EA 0%, #EC4899 100%)',
                      },
                      '&:disabled': {
                        background: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(203, 213, 225, 0.3)',
                        color: isDark ? 'rgba(241, 245, 249, 0.3)' : 'rgba(15, 23, 42, 0.3)',
                        boxShadow: 'none'
                      }
                    }}
                  >
                    {analyzing ? 'Analyzing...' : 'Analyze with AI'}
                  </Button>
                </Stack>
              </form>

              <Alert 
                severity="info" 
                icon={<Psychology />}
                sx={{ 
                  mt: 3, 
                  borderRadius: 2.5,
                  bgcolor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                  border: isDark ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(59, 130, 246, 0.15)',
                  color: isDark ? '#93C5FD' : '#1E40AF',
                  '& .MuiAlert-icon': {
                    color: isDark ? '#60A5FA' : '#3B82F6'
                  }
                }}
              >
                <Typography variant="body2" fontWeight="600">
                  <strong>Medical Disclaimer:</strong> This AI analysis provides general health information only. 
                  It is not a substitute for professional medical advice, diagnosis, or treatment. 
                  Always consult a qualified healthcare provider.
                </Typography>
              </Alert>

              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mt: 2, 
                    borderRadius: 2.5,
                    bgcolor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                    border: isDark ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(239, 68, 68, 0.2)',
                  }}
                >
                  {error}
                </Alert>
              )}
            </Paper>

            {/* Results */}
            {result && (
              <Fade in timeout={500}>
                <Box>
                  {/* Summary */}
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 3, 
                      mb: 3, 
                      borderRadius: 3,
                      borderLeft: '5px solid',
                      borderColor: result.severity === 'mild' ? 'success.main' : result.severity === 'moderate' ? 'warning.main' : 'error.main',
                      bgcolor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                      border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(226, 232, 240, 0.8)'}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Psychology sx={{ fontSize: 40, color: isDark ? '#A78BFA' : 'primary.main' }} />
                      <Box>
                        <Typography 
                          variant="h6" 
                          fontWeight="bold"
                          sx={{ color: isDark ? '#F1F5F9' : undefined }}
                        >
                          AI Analysis Complete
                        </Typography>
                        <Chip 
                          label={`Severity: ${result.severity.toUpperCase()}`} 
                          size="small"
                          color={result.severity === 'mild' ? 'success' : result.severity === 'moderate' ? 'warning' : 'error'}
                        />
                      </Box>
                    </Box>
                    <Typography 
                      variant="body1" 
                      sx={{ color: isDark ? '#CBD5E1' : undefined }}
                    >
                      {result.summary}
                    </Typography>
                  </Paper>

                  {/* Recommendations */}
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 3, 
                      mb: 3, 
                      borderRadius: 3,
                      bgcolor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                      border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(226, 232, 240, 0.8)'}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <LocalPharmacy sx={{ color: isDark ? '#10B981' : 'success.main' }} />
                      <Typography 
                        variant="h6" 
                        fontWeight="600"
                        sx={{ color: isDark ? '#F1F5F9' : undefined }}
                      >
                        Recommendations
                      </Typography>
                    </Box>
                    <List>
                      {(result.recommendations || []).map((rec, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon>
                            <CheckCircle sx={{ color: 'success.main' }} />
                          </ListItemIcon>
                          <ListItemText primary={rec} />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>

                  {/* Warnings */}
                  {result.warnings && result.warnings.length > 0 && (
                    <Paper 
                      elevation={3} 
                      sx={{ 
                        p: 3, 
                        mb: 3, 
                        borderRadius: 3, 
                        bgcolor: isDark ? 'rgba(251, 146, 60, 0.1)' : '#FFF3E0',
                        border: `1px solid ${isDark ? 'rgba(251, 146, 60, 0.2)' : 'rgba(226, 232, 240, 0.8)'}`,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Warning sx={{ color: isDark ? '#FB923C' : 'warning.main' }} />
                        <Typography 
                          variant="h6" 
                          fontWeight="600" 
                          sx={{ color: isDark ? '#FB923C' : 'warning.main' }}
                        >
                          Important Warnings
                        </Typography>
                      </Box>
                      <List>
                        {(result.warnings || []).map((warn, idx) => (
                          <ListItem key={idx}>
                            <ListItemIcon>
                              <Warning sx={{ color: 'warning.main' }} />
                            </ListItemIcon>
                            <ListItemText primary={warn} />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  )}

                  {/* Next Steps */}
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 3, 
                      borderRadius: 3,
                      bgcolor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                      border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(226, 232, 240, 0.8)'}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <LocalHospital sx={{ color: isDark ? '#A78BFA' : 'primary.main' }} />
                      <Typography 
                        variant="h6" 
                        fontWeight="600"
                        sx={{ color: isDark ? '#F1F5F9' : undefined }}
                      >
                        Next Steps
                      </Typography>
                    </Box>
                    <List>
                      {(result.next_steps || result.nextSteps || []).map((step, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon>
                            <FitnessCenter sx={{ color: 'primary.main' }} />
                          </ListItemIcon>
                          <ListItemText primary={step} />
                        </ListItem>
                      ))}
                    </List>
                    <Divider sx={{ my: 3 }} />
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <Button 
                        variant="contained" 
                        fullWidth
                        size="large"
                        startIcon={<LocalHospital />}
                        onClick={() => navigate('/doctors')}
                        sx={{
                          py: 1.8,
                          fontWeight: 700,
                          fontSize: '1rem',
                          borderRadius: 3,
                          textTransform: 'none',
                          background: isDark
                            ? 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)'
                            : 'linear-gradient(135deg, #A78BFA 0%, #F472B6 100%)',
                          boxShadow: isDark
                            ? '0 8px 24px rgba(139, 92, 246, 0.4)'
                            : '0 8px 24px rgba(167, 139, 250, 0.3)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: isDark
                              ? '0 12px 32px rgba(139, 92, 246, 0.5)'
                              : '0 12px 32px rgba(167, 139, 250, 0.4)',
                          }
                        }}
                      >
                        Consult a Doctor Now
                      </Button>
                      <Button 
                        variant="outlined"
                        fullWidth
                        size="large"
                        startIcon={<Refresh />}
                        onClick={handleReset}
                        sx={{
                          py: 1.8,
                          fontWeight: 600,
                          fontSize: '1rem',
                          borderRadius: 3,
                          textTransform: 'none',
                          borderWidth: 2,
                          borderColor: isDark ? 'rgba(139, 92, 246, 0.4)' : 'rgba(139, 92, 246, 0.3)',
                          color: isDark ? '#A78BFA' : '#8B5CF6',
                          '&:hover': {
                            borderWidth: 2,
                            borderColor: isDark ? '#8B5CF6' : '#A78BFA',
                            bgcolor: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
                          }
                        }}
                      >
                        New Analysis
                      </Button>
                    </Stack>
                  </Paper>
                </Box>
              </Fade>
            )}
          </Box>
        </Fade>
      </Box>
    </Box>
  );
}

export default LLMAnalysis;
