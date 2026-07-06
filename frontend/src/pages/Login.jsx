import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import API from '../api/axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await API.post('/auth/login', { email, password });
      login(response.data.token, response.data.email, response.data.balance);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left Side - Hero Section */}
      <Box
        sx={{
          flex: 1,
          background: 'linear-gradient(135deg, #05a854 0%, #0d8f47 100%)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 4,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: '400px',
            height: '400px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            top: '-100px',
            right: '-100px',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            width: '300px',
            height: '300px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '50%',
            bottom: '-50px',
            left: '-50px',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '400px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 3 }}>
            <TrendingUpIcon sx={{ fontSize: 60, color: 'white' }} />
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 800, marginBottom: 2 }}>
            Paper Trading
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 300, marginBottom: 3, lineHeight: 1.6 }}>
            Learn to invest with $10,000 in virtual cash. Build your trading skills risk-free.
          </Typography>
          <Box sx={{ marginTop: 4, paddingTop: 3, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <Typography variant="body2" sx={{ marginBottom: 2 }}>
              ✓ Real-time stock data
            </Typography>
            <Typography variant="body2" sx={{ marginBottom: 2 }}>
              ✓ Portfolio tracking
            </Typography>
            <Typography variant="body2">
              ✓ Advanced analytics
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Right Side - Login Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 4,
          backgroundColor: 'background.default',
          position: 'relative',
        }}
      >
        <Tooltip title={isDark ? 'Light Mode' : 'Dark Mode'}>
          <IconButton
            onClick={toggleTheme}
            sx={{
              position: 'absolute',
              top: 20,
              right: 20,
              color: 'text.primary',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            {isDark ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>

        <Box sx={{ width: '100%', maxWidth: '380px' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, marginBottom: 1 }}>
            Welcome back
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', marginBottom: 4 }}>
            Sign in to your account to continue trading
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              margin="normal"
              placeholder="your@email.com"
              disabled={loading}
              variant="outlined"
              sx={{
                marginBottom: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              margin="normal"
              placeholder="••••••••"
              disabled={loading}
              variant="outlined"
              sx={{
                marginBottom: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />

            {error && (
              <Alert severity="error" sx={{ marginBottom: 3, borderRadius: '10px' }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                marginTop: 2,
                padding: '14px 24px',
                fontSize: '16px',
                fontWeight: 600,
                backgroundColor: '#05a854',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(5, 168, 84, 0.3)',
                '&:hover': {
                  backgroundColor: '#0d8f47',
                  boxShadow: '0 6px 16px rgba(5, 168, 84, 0.4)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                'Login'
              )}
            </Button>
          </form>

          <Box sx={{ marginTop: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Don't have an account?{' '}
              <Link
                to="/register"
                style={{
                  color: '#05a854',
                  fontWeight: 700,
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                }}
              >
                Create one
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Responsive - Stack on mobile */}
      <style>{`
        @media (max-width: 768px) {
          body {
            display: flex;
            flex-direction: column;
          }
        }
      `}</style>
    </Box>
  );
}
