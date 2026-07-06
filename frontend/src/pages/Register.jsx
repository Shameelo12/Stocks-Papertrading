import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  CircularProgress,
} from '@mui/material';
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
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            width: '100%',
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: '#667eea',
              marginBottom: 0.5,
              textAlign: 'center',
              fontWeight: 600,
            }}
          >
            Paper Trading
          </Typography>
          <Typography
            variant="h5"
            sx={{
              marginBottom: 3,
              textAlign: 'center',
              color: '#666',
            }}
          >
            Register
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              margin="normal"
              placeholder="your@email.com"
              disabled={loading}
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
            />

            {error && (
              <Alert severity="error" sx={{ marginTop: 2, marginBottom: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                marginTop: 3,
                padding: '12px',
                fontSize: '16px',
                fontWeight: 500,
                backgroundColor: '#667eea',
                '&:hover': {
                  backgroundColor: '#764ba2',
                },
              }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                'Register'
              )}
            </Button>
          </form>

          <Typography
            sx={{
              marginTop: 3,
              textAlign: 'center',
              fontSize: '14px',
              color: '#666',
            }}
          >
            Already have an account?{' '}
            <Link
              to="/login"
              style={{
                color: '#667eea',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Login here
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
