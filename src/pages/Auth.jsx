import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  InputAdornment,
  MenuItem,
  Divider,
  Fade,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LocalHospital,
  LoginOutlined,
  PersonAddAltOutlined,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import * as authApi from '../api/auth';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';

function Auth() {
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    age: '',
    gender: '',
    phone: '',
    email: '',
    password: '',
    history: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const isLogin = mode === 'login';

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authApi.login(loginData.email, loginData.password);
      const role = response.role || 'patient';

      authLogin(response.token, response.user, role);

      if (role === 'doctor') {
        navigate('/doctor/dashboard');
      } else if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authApi.register(
        registerData.email,
        registerData.password,
        registerData.name,
        'patient'
      );

      authLogin(response.token, response.user, 'patient');

      if (
        registerData.age ||
        registerData.gender ||
        registerData.phone ||
        registerData.history
      ) {
        await authApi.updateProfile({
          age: registerData.age ? parseInt(registerData.age, 10) : undefined,
          gender: registerData.gender || undefined,
          phone: registerData.phone || undefined,
          medical_history: registerData.history || undefined,
        });
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');

    try {
      const response = await authApi.googleAuth(credentialResponse.credential, 'patient');
      const role = response.role || 'patient';
      authLogin(response.token, response.user, role);

      if (role === 'doctor') {
        navigate('/doctor/dashboard');
      } else if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Google authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google authentication failed. Please try again.');
  };

  const textFieldStyles = {
    '& .MuiInputBase-root': {
      bgcolor: 'rgba(255,255,255,0.04)',
      borderRadius: 2,
      color: '#f6efdb',
      '& fieldset': {
        borderColor: 'rgba(246,239,219,0.18)',
      },
      '&:hover fieldset': {
        borderColor: 'rgba(246,239,219,0.35)',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#f0d888',
      },
      input: {
        padding: '14px 16px',
        // Override browser autofill background - prevent blue background
        '&:-webkit-autofill': {
          WebkitBoxShadow: '0 0 0 100px rgba(255,255,255,0.04) inset !important',
          WebkitTextFillColor: '#f6efdb !important',
          caretColor: '#f6efdb',
          backgroundColor: 'rgba(255,255,255,0.04) !important',
          transition: 'background-color 5000s ease-in-out 0s',
        },
        '&:-webkit-autofill:hover': {
          WebkitBoxShadow: '0 0 0 100px rgba(255,255,255,0.04) inset !important',
          backgroundColor: 'rgba(255,255,255,0.04) !important',
        },
        '&:-webkit-autofill:focus': {
          WebkitBoxShadow: '0 0 0 100px rgba(255,255,255,0.04) inset !important',
          backgroundColor: 'rgba(255,255,255,0.04) !important',
        },
        '&:-webkit-autofill:active': {
          WebkitBoxShadow: '0 0 0 100px rgba(255,255,255,0.04) inset !important',
          backgroundColor: 'rgba(255,255,255,0.04) !important',
        },
        '&:-webkit-autofill:selected': {
          WebkitBoxShadow: '0 0 0 100px rgba(255,255,255,0.04) inset !important',
          backgroundColor: 'rgba(255,255,255,0.04) !important',
        },
      },
    },
    '& .MuiInputLabel-root': {
      color: 'rgba(246,239,219,0.6)',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#f0d888',
    },
    '& .MuiSelect-icon': {
      color: 'rgba(246,239,219,0.7)',
    },
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <style>
        {`
          /* Prevent blue background on autofill dropdown selection */
          input:-webkit-autofill,
          input:-webkit-autofill:hover,
          input:-webkit-autofill:focus,
          input:-webkit-autofill:active,
          input:-webkit-autofill:selected {
            -webkit-box-shadow: 0 0 0 1000px rgba(255,255,255,0.04) inset !important;
            -webkit-text-fill-color: #f6efdb !important;
            background-color: rgba(255,255,255,0.04) !important;
            transition: background-color 5000s ease-in-out 0s !important;
            caret-color: #f6efdb !important;
          }
          
          /* Prevent browser default selection colors */
          input::selection {
            background-color: rgba(240,216,136,0.3) !important;
            color: #f6efdb !important;
          }
          
          input::-moz-selection {
            background-color: rgba(240,216,136,0.3) !important;
            color: #f6efdb !important;
          }
        `}
      </style>
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#0d0c07',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 6,
          px: 2,
        }}
      >
        <Fade in timeout={600}>
          <Paper
            elevation={0}
            sx={{
              width: { xs: '100%', sm: 460 },
              p: { xs: 4, sm: 5 },
              borderRadius: 4,
              bgcolor: 'rgba(15,13,9,0.96)',
              border: '1px solid rgba(240,216,136,0.18)',
              boxShadow: '0 36px 80px rgba(0,0,0,0.55)',
            }}
          >
            <Stack spacing={2} alignItems="center" mb={3}>
              <LocalHospital sx={{ fontSize: 40, color: '#f6efdb' }} />
              <Box textAlign="center">
                <Typography variant="h4" fontWeight={700} sx={{ color: '#f7e8a4' }}>
                  Welcome to Medicare
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(246,239,219,0.6)' }}>
                  The new way to manage patient and doctor care online
                </Typography>
              </Box>
            </Stack>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  '& div[role="button"]': {
                    width: '100%',
                    borderRadius: 999,
                    background: 'rgba(28,24,16,0.92)',
                    border: '1px solid rgba(240,216,136,0.24)',
                    color: '#f6efdb',
                    textTransform: 'none',
                  },
                }}
              >
                <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} width="100%" />
              </Box>
            </Box>

            <Divider sx={{ borderColor: 'rgba(246,239,219,0.12)', mb: 3 }}>
              <Typography variant="caption" sx={{ color: 'rgba(246,239,219,0.45)', px: 1 }}>
                or enter credentials
              </Typography>
            </Divider>

            {isLogin ? (
              <Stack component="form" spacing={2.5} onSubmit={handleLogin}>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  required
                  disabled={loading}
                  sx={textFieldStyles}
                  fullWidth
                />
                <TextField
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                  disabled={loading}
                  sx={textFieldStyles}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          onClick={() => setShowPassword(!showPassword)}
                          sx={{
                            minWidth: 0,
                            color: 'rgba(246,239,219,0.7)',
                            textTransform: 'none',
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />

                <Box sx={{ bgcolor: 'rgba(246,239,219,0.05)', borderRadius: 3, p: 2.5 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(246,239,219,0.7)' }}>
                    Demo credentials
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#f6efdb', mt: 0.5 }}>
                    Doctor: niharika.pandey@medicare.com / doctor123
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(246,239,219,0.55)' }}>
                    Patients can create their own accounts below. Doctors are added by the admin team.
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'center', mt: 1 }}>
                  <Button
                    onClick={async () => {
                      const email = prompt('Enter your email address:');
                      if (email) {
                        try {
                          const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/forgot`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email }),
                          });
                          const data = await response.json();
                          alert(data.message || 'Password reset request created. Admin will review it.');
                        } catch (err) {
                          alert('Failed to create password reset request');
                        }
                      }
                    }}
                    sx={{
                      color: '#f7e8a4',
                      textTransform: 'none',
                      fontSize: '0.875rem',
                      '&:hover': {
                        color: '#ffefb8',
                        background: 'transparent',
                      },
                    }}
                  >
                    Forgot Password?
                  </Button>
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={!loading && <LoginOutlined />}
                  disabled={loading}
                  sx={{
                    py: 1.4,
                    borderRadius: 999,
                    fontWeight: 600,
                    bgcolor: '#2a2418',
                    color: '#f6efdb',
                    '&:hover': { bgcolor: '#3a311f' },
                  }}
                >
                  {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign in'}
                </Button>
              </Stack>
            ) : (
              <Stack component="form" spacing={2.5} onSubmit={handleRegister}>
                <TextField
                  label="Full name"
                  name="name"
                  value={registerData.name}
                  onChange={handleRegisterChange}
                  required
                  disabled={loading}
                  sx={textFieldStyles}
                  fullWidth
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Age"
                    name="age"
                    type="number"
                    value={registerData.age}
                    onChange={handleRegisterChange}
                    disabled={loading}
                    sx={{ ...textFieldStyles, flex: 1 }}
                    inputProps={{ min: 1, max: 120 }}
                  />
                  <TextField
                    select
                    label="Gender"
                    name="gender"
                    value={registerData.gender}
                    onChange={handleRegisterChange}
                    disabled={loading}
                    sx={{ ...textFieldStyles, flex: 1 }}
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </TextField>
                </Box>
                <TextField
                  label="Phone"
                  name="phone"
                  value={registerData.phone}
                  onChange={handleRegisterChange}
                  disabled={loading}
                  sx={textFieldStyles}
                  placeholder="10-digit phone number"
                  fullWidth
                />
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  required
                  disabled={loading}
                  sx={textFieldStyles}
                  fullWidth
                />
                <TextField
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  required
                  disabled={loading}
                  sx={textFieldStyles}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          onClick={() => setShowPassword(!showPassword)}
                          sx={{
                            minWidth: 0,
                            color: 'rgba(246,239,219,0.7)',
                            textTransform: 'none',
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Medical history (optional)"
                  name="history"
                  multiline
                  minRows={3}
                  value={registerData.history}
                  onChange={handleRegisterChange}
                  disabled={loading}
                  sx={textFieldStyles}
                  placeholder="Any chronic conditions, allergies, ongoing treatments..."
                  fullWidth
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={!loading && <PersonAddAltOutlined />}
                  disabled={loading}
                  sx={{
                    py: 1.4,
                    borderRadius: 999,
                    fontWeight: 600,
                    bgcolor: '#2a2418',
                    color: '#f6efdb',
                    '&:hover': { bgcolor: '#3a311f' },
                  }}
                >
                  {loading ? <CircularProgress size={22} color="inherit" /> : 'Create account'}
                </Button>
              </Stack>
            )}

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'rgba(246,239,219,0.65)' }}>
                {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                <Button
                  onClick={() => {
                    setMode(isLogin ? 'register' : 'login');
                    setError('');
                    setShowPassword(false);
                  }}
                  sx={{
                    color: '#f7e8a4',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      color: '#ffefb8',
                      background: 'transparent',
                    },
                  }}
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </Button>
              </Typography>
            </Box>

            <Typography
              variant="caption"
              display="block"
              align="center"
              sx={{ mt: 4, color: 'rgba(246,239,219,0.35)' }}
            >
              By continuing you agree to our Terms of Service and Privacy Policy
            </Typography>
          </Paper>
        </Fade>
      </Box>
    </GoogleOAuthProvider>
  );
}

export default Auth;
