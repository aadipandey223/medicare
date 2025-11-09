import React, { useState } from 'react';
import { 
  Box, Typography, Card, CardContent, TextField, Button, 
  Container, Paper, Chip, CircularProgress, Alert, Fade,
  Divider, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import { 
  TipsAndUpdates as TipsAndUpdatesIcon,
  Mic,
  Psychology,
  Warning,
  CheckCircle,
  LocalHospital,
  FitnessCenter,
  LocalPharmacy
} from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';

function LLMAnalysis() {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const [input, setInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setResult({
        severity: 'moderate',
        summary: 'Based on your symptoms, you may be experiencing common cold or flu.',
        recommendations: [
          'Drink plenty of fluids (water, herbal tea, warm lemon water)',
          'Get adequate rest - aim for 7-8 hours of sleep',
          'Consider over-the-counter pain relievers if needed',
          'Monitor your temperature regularly'
        ],
        warnings: [
          'Seek immediate medical attention if fever exceeds 103°F (39.4°C)',
          'Watch for difficulty breathing or chest pain'
        ],
        nextSteps: [
          'If symptoms persist for more than 5 days, consult a doctor',
          'Consider booking a virtual consultation with our specialists'
        ]
      });
      setAnalyzing(false);
    }, 2500);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      py: 4,
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
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in timeout={600}>
          <Box>
            {/* Header */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 4, 
                mb: 4, 
                borderRadius: 3, 
                textAlign: 'center',
                background: 'linear-gradient(135deg, #00BCD4 0%, #009688 100%)',
                color: 'white'
              }}
            >
              <Psychology sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                AI Health Analysis
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Describe your symptoms and get instant AI-powered health insights
              </Typography>
            </Paper>

            {/* Input Form */}
            <Paper 
              elevation={3} 
              sx={{ 
                p: 4, 
                borderRadius: 3, 
                mb: 3,
                bgcolor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(226, 232, 240, 0.8)'}`,
              }}
            >
              <form onSubmit={handleAnalyze}>
                <Typography 
                  variant="h6" 
                  fontWeight="600" 
                  gutterBottom
                  sx={{ color: isDark ? '#F1F5F9' : undefined }}
                >
                  Tell us about your symptoms
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={5}
                  placeholder="E.g., I have a headache, fever, and sore throat for the past 2 days..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    disabled={!input.trim() || analyzing}
                    startIcon={analyzing ? <CircularProgress size={20} /> : <TipsAndUpdatesIcon />}
                    sx={{ py: 1.5, fontWeight: 600, borderRadius: 2 }}
                  >
                    {analyzing ? 'Analyzing...' : 'Analyze Symptoms'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<Mic />}
                    sx={{ minWidth: 120 }}
                  >
                    Voice
                  </Button>
                </Box>
              </form>

              <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
                <strong>Disclaimer:</strong> This AI analysis is for informational purposes only and not a substitute for professional medical advice.
              </Alert>
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
                      {result.recommendations.map((rec, idx) => (
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
                  {result.warnings.length > 0 && (
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
                        {result.warnings.map((warn, idx) => (
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
                      {result.nextSteps.map((step, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon>
                            <FitnessCenter sx={{ color: 'primary.main' }} />
                          </ListItemIcon>
                          <ListItemText primary={step} />
                        </ListItem>
                      ))}
                    </List>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        fullWidth
                        href="/doctors"
                      >
                        Consult a Doctor
                      </Button>
                      <Button 
                        variant="outlined" 
                        color="primary" 
                        fullWidth
                        onClick={() => setResult(null)}
                      >
                        New Analysis
                      </Button>
                    </Box>
                  </Paper>
                </Box>
              </Fade>
            )}
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}

export default LLMAnalysis;
