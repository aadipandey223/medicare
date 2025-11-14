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
  Checkbox,
  FormControlLabel,
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
import { getPasswordStrength } from '../utils/validation';
import {
  isEmail,
  isPhone,
  normalizePhone,
  isName,
  isAge,
  isStrongPassword,
  getPasswordHint,
} from '../utils/validation';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';

// Check if Google OAuth is configured
const isGoogleConfigured = GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID' && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE';

function Auth() {
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    age: '',
    gender: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    history: '',
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginErrors, setLoginErrors] = useState({ email: '', password: '' });
  const [registerErrors, setRegisterErrors] = useState({
    name: '',
    age: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const isLogin = mode === 'login';

  const validateLoginField = (name, value) => {
    if (name === 'email') {
      return isEmail(value) ? '' : 'Enter a valid email address';
    }
    if (name === 'password') {
      return value && value.length >= 6 ? '' : 'Password must be at least 6 characters';
    }
    return '';
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    // Don't override if value is being set by autofill
    setLoginData((prev) => ({ ...prev, [name]: value }));
    setLoginErrors((prev) => ({ ...prev, [name]: validateLoginField(name, value) }));
    setError('');
  };

  const validateRegisterField = (name, value) => {
    switch (name) {
      case 'name':
        return isName(value) ? '' : 'Enter your real name (letters, spaces, - or \' only)';
      case 'age':
        if (value === '' || value === null) return '';
        return isAge(value) ? '' : 'Age must be a whole number between 1 and 120';
      case 'phone': {
        if (!value) return '';
        return isPhone(value) ? '' : 'Phone must be 10 digits';
      }
      case 'email':
        return isEmail(value) ? '' : 'Enter a valid email address';
      case 'password':
        return isStrongPassword(value) ? '' : getPasswordHint();
      case 'confirmPassword':
        // handled in change handler to access current password
        return '';
      default:
        return '';
    }
  };

  const handleRegisterChange = (e) => {
    const { name } = e.target;
    let { value } = e.target;
    // Normalize some inputs
    if (name === 'phone') value = normalizePhone(value);
    if (name === 'age') value = value === '' ? '' : String(Math.min(120, Math.max(1, Number(value))));

    setRegisterData((prev) => {
      const next = { ...prev, [name]: value };
      // compute errors
      const fieldErr = name === 'confirmPassword'
        ? (next.confirmPassword === next.password ? '' : 'Passwords do not match')
        : validateRegisterField(name, value);
      setRegisterErrors((prevErr) => ({
        ...prevErr,
        [name]: fieldErr,
        // when password changes, also revalidate confirm
        ...(name === 'password'
          ? { confirmPassword: next.confirmPassword === next.password ? '' : 'Passwords do not match' }
          : {}),
      }));
      return next;
    });
    setError('');
  };

  const isLoginValid =
    isEmail(loginData.email) && loginData.password && loginData.password.length >= 6 &&
    !loginErrors.email && !loginErrors.password;

  const isRegisterValid =
    isName(registerData.name) &&
    isEmail(registerData.email) &&
    isStrongPassword(registerData.password) &&
    registerData.confirmPassword === registerData.password &&
    termsAccepted &&
    // optional fields when present must be valid
    (!registerData.phone || isPhone(registerData.phone)) &&
    (!registerData.age || isAge(registerData.age)) &&
    !Object.values(registerErrors).some(Boolean);

  const handleLogin = async (e) => {
    e.preventDefault();
    // client-side validation guard
    const emailErr = validateLoginField('email', loginData.email);
    const passErr = validateLoginField('password', loginData.password);
    setLoginErrors({ email: emailErr, password: passErr });
    if (emailErr || passErr) {
      setError('Please fix the highlighted fields.');
      return;
    }
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
    // client-side validation guard
    const nextErrors = {
      name: validateRegisterField('name', registerData.name),
      age: validateRegisterField('age', registerData.age),
      phone: validateRegisterField('phone', registerData.phone),
      email: validateRegisterField('email', registerData.email),
      password: validateRegisterField('password', registerData.password),
      confirmPassword: registerData.confirmPassword === registerData.password ? '' : 'Passwords do not match',
    };
    setRegisterErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      setError('Please fix the highlighted fields.');
      return;
    }
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
      fontSize: { xs: '0.95rem', sm: '1rem' },
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
        padding: { xs: '12px 14px', sm: '14px 16px' },
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
          py: { xs: 3, sm: 6 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Fade in timeout={600}>
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              maxWidth: { xs: '100%', sm: 480, md: 520 },
              p: { xs: 3, sm: 4, md: 5 },
              borderRadius: { xs: 3, sm: 4 },
              bgcolor: 'rgba(15,13,9,0.96)',
              border: '1px solid rgba(240,216,136,0.18)',
              boxShadow: '0 36px 80px rgba(0,0,0,0.55)',
            }}
          >
            <Stack spacing={2} alignItems="center" mb={{ xs: 2, sm: 3 }}>
              <LocalHospital sx={{ fontSize: { xs: 36, sm: 40 }, color: '#f6efdb' }} />
              <Box textAlign="center">
                <Typography 
                  variant="h4" 
                  fontWeight={700} 
                  sx={{ 
                    color: '#f7e8a4',
                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                  }}
                >
                  Welcome to Medicare
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(246,239,219,0.6)',
                    fontSize: { xs: '0.8rem', sm: '0.875rem' }
                  }}
                >
                  The new way to manage patient and doctor care online
                </Typography>
              </Box>
            </Stack>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {isGoogleConfigured ? (
              <>
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
              </>
            ) : (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Note:</strong> Google Sign-In is not configured. Contact admin to set up Google OAuth.
                </Typography>
              </Alert>
            )}

            {isLogin ? (
              <Stack component="form" spacing={{ xs: 2, sm: 2.5 }} onSubmit={handleLogin}>
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
                  autoComplete="username email"
                  inputProps={{
                    'data-form-type': 'login',
                    'data-lpignore': 'false',
                  }}
                  error={Boolean(loginErrors.email)}
                  helperText={loginErrors.email}
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
                  autoComplete="current-password"
                  error={Boolean(loginErrors.password)}
                  helperText={loginErrors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loading}
                          sx={{
                            minWidth: 0,
                            color: 'rgba(246,239,219,0.7)',
                            textTransform: 'none',
                            '&:disabled': {
                              color: 'rgba(246,239,219,0.3)',
                            },
                          }}
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />

                <Box sx={{ bgcolor: 'rgba(246,239,219,0.05)', borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
                  <Typography variant="caption" sx={{ color: 'rgba(246,239,219,0.7)', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    Demo credentials
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#f6efdb', 
                      mt: 0.5, 
                      fontSize: { xs: '0.85rem', sm: '0.875rem' },
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none',
                      msUserSelect: 'none'
                    }}
                  >
                    Doctor: niharika.pandey@medicare.com / doctor123
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(246,239,219,0.55)', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    Patients can create their own accounts below. Doctors are added by the admin team.
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'center', mt: 1 }}>
                  <Button
                    onClick={async () => {
                      setError('');
                      const email = window.prompt('Enter your email address:');
                      if (email && email.trim()) {
                        try {
                          setLoading(true);
                          const data = await authApi.forgotPassword(email.trim());
                          setError('');
                          alert(data.message || 'Password reset request created. Admin will review it shortly.');
                        } catch (err) {
                          console.error('Password reset error:', err);
                          setError(err.message || 'Failed to create password reset request.');
                        } finally {
                          setLoading(false);
                        }
                      }
                    }}
                    disabled={loading}
                    sx={{
                      color: '#f7e8a4',
                      textTransform: 'none',
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      '&:hover': {
                        color: '#ffefb8',
                        background: 'transparent',
                      },
                      '&:disabled': {
                        color: 'rgba(247,232,164,0.3)',
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
                  disabled={loading || !isLoginValid}
                  sx={{
                    py: { xs: 1.2, sm: 1.4 },
                    borderRadius: 999,
                    fontWeight: 600,
                    fontSize: { xs: '0.95rem', sm: '1rem' },
                    bgcolor: '#2a2418',
                    color: '#f6efdb',
                    '&:hover': { bgcolor: '#3a311f' },
                    '&:disabled': {
                      bgcolor: 'rgba(42,36,24,0.5)',
                      color: 'rgba(246,239,219,0.5)',
                    },
                  }}
                >
                  {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign in'}
                </Button>
              </Stack>
            ) : (
              <Stack component="form" spacing={{ xs: 2, sm: 2.5 }} onSubmit={handleRegister}>
                <TextField
                  label="Full name"
                  name="name"
                  value={registerData.name}
                  onChange={handleRegisterChange}
                  required
                  disabled={loading}
                  sx={textFieldStyles}
                  fullWidth
                  autoComplete="name"
                  error={Boolean(registerErrors.name)}
                  helperText={registerErrors.name}
                />
                <Box sx={{ display: 'flex', gap: { xs: 1.5, sm: 2 }, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField
                    label="Age"
                    name="age"
                    type="number"
                    value={registerData.age}
                    onChange={handleRegisterChange}
                    disabled={loading}
                    sx={{ ...textFieldStyles, flex: 1 }}
                    inputProps={{ min: 1, max: 120 }}
                    fullWidth
                    error={Boolean(registerErrors.age)}
                    helperText={registerErrors.age}
                  />
                  <TextField
                    select
                    label="Gender"
                    name="gender"
                    value={registerData.gender}
                    onChange={handleRegisterChange}
                    disabled={loading}
                    sx={{ ...textFieldStyles, flex: 1 }}
                    fullWidth
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
                  autoComplete="tel"
                  inputProps={{ inputMode: 'numeric', pattern: '\\d*', maxLength: 10 }}
                  error={Boolean(registerErrors.phone)}
                  helperText={registerErrors.phone}
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
                  error={Boolean(registerErrors.email)}
                  helperText={registerErrors.email}
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
                  error={Boolean(registerErrors.password)}
                  helperText={registerErrors.password || getPasswordHint()}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loading}
                          sx={{
                            minWidth: 0,
                            color: 'rgba(246,239,219,0.7)',
                            textTransform: 'none',
                            '&:disabled': {
                              color: 'rgba(246,239,219,0.3)',
                            },
                          }}
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
                {/* Password strength meter */}
                <PasswordStrength password={registerData.password} />
                <TextField
                  label="Confirm password"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={registerData.confirmPassword}
                  onChange={handleRegisterChange}
                  required
                  disabled={loading}
                  sx={textFieldStyles}
                  fullWidth
                  error={Boolean(registerErrors.confirmPassword)}
                  helperText={registerErrors.confirmPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          onClick={() => setShowConfirm(!showConfirm)}
                          disabled={loading}
                          sx={{
                            minWidth: 0,
                            color: 'rgba(246,239,219,0.7)',
                            textTransform: 'none',
                            '&:disabled': {
                              color: 'rgba(246,239,219,0.3)',
                            },
                          }}
                        >
                          {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Medical history (optional)"
                  name="history"
                  multiline
                  minRows={{ xs: 2, sm: 3 }}
                  maxRows={6}
                  value={registerData.history}
                  onChange={handleRegisterChange}
                  disabled={loading}
                  sx={textFieldStyles}
                  placeholder="Any chronic conditions, allergies, ongoing treatments..."
                  fullWidth
                />

                {/* Terms acceptance */}
                <FormControlLabel
                  sx={{ color: 'rgba(246,239,219,0.75)', mt: -1 }}
                  control={
                    <Checkbox
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      sx={{ color: 'rgba(246,239,219,0.5)' }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ color: 'rgba(246,239,219,0.75)' }}>
                      I agree to the
                      {' '}<a href="#" style={{ color: '#f7e8a4' }}>Terms of Service</a>
                      {' '}and{' '}
                      <a href="#" style={{ color: '#f7e8a4' }}>Privacy Policy</a>
                    </Typography>
                  }
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={!loading && <PersonAddAltOutlined />}
                  disabled={loading || !isRegisterValid}
                  sx={{
                    py: { xs: 1.2, sm: 1.4 },
                    borderRadius: 999,
                    fontWeight: 600,
                    fontSize: { xs: '0.95rem', sm: '1rem' },
                    bgcolor: '#2a2418',
                    color: '#f6efdb',
                    '&:hover': { bgcolor: '#3a311f' },
                    '&:disabled': {
                      bgcolor: 'rgba(42,36,24,0.5)',
                      color: 'rgba(246,239,219,0.5)',
                    },
                  }}
                >
                  {loading ? <CircularProgress size={22} color="inherit" /> : 'Create account'}
                </Button>
              </Stack>
            )}

            <Box sx={{ mt: { xs: 3, sm: 4 }, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'rgba(246,239,219,0.65)', fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>
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
                    fontSize: { xs: '0.85rem', sm: '0.875rem' },
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
              sx={{ 
                mt: { xs: 3, sm: 4 }, 
                color: 'rgba(246,239,219,0.35)',
                fontSize: { xs: '0.7rem', sm: '0.75rem' }
              }}
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

// Inline component: password strength indicator
function PasswordStrength({ password }) {
  const { score, label, color } = getPasswordStrength(password);
  const bars = [0, 1, 2, 3];
  return (
    <Box sx={{ mt: -1, mb: 1 }}>
      <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
        {bars.map((i) => (
          <Box
            key={i}
            sx={{
              flex: 1,
              height: 6,
              borderRadius: 999,
              backgroundColor: i < score ? color : 'rgba(246,239,219,0.15)',
              transition: 'background-color 0.2s ease',
            }}
          />
        ))}
      </Box>
      <Typography variant="caption" sx={{ color: 'rgba(246,239,219,0.75)' }}>
        Strength: {label}
      </Typography>
    </Box>
  );
}
