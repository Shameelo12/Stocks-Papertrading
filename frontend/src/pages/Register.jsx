import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await API.post('/auth/register', { email, password });
      login(response.data.token, response.data.email, response.data.balance);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Email may already be in use.');
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

      {/* Right Side - Register Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 4,
          backgroundColor: '#fff',
          overflowY: 'auto',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: '380px' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, marginBottom: 1 }}>
            Get started
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', marginBottom: 4 }}>
            Create your account to begin paper trading today
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

            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
                'Create Account'
              )}
            </Button>
          </form>

          <Box sx={{ marginTop: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Already have an account?{' '}
              <Link
                to="/login"
                style={{
                  color: '#05a854',
                  fontWeight: 700,
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                }}
              >
                Login
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
