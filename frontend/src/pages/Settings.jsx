import React from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
} from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import InfoIcon from '@mui/icons-material/Info';
import LogoutIcon from '@mui/icons-material/Logout';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { usePortfolio } from '../hooks/usePortfolio';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { portfolio } = usePortfolio();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Container maxWidth="md" sx={{ paddingY: 4 }}>
      {/* Header */}
      <Box sx={{ marginBottom: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, marginBottom: 1 }}>
          Settings
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Manage your account preferences and settings
        </Typography>
      </Box>

      {/* Account Section */}
      <Card elevation={0} sx={{ marginBottom: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: 2 }}>
            Account Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', marginBottom: 0.5 }}>
                  Email Address
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {user?.email}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', marginBottom: 0.5 }}>
                  Account Balance
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#05a854' }}>
                  ${(portfolio?.currentBalance || user?.balance || 0).toFixed(2)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Alert severity="info" icon={<InfoIcon />}>
            Account details cannot be changed. Contact support for assistance.
          </Alert>
        </CardContent>
      </Card>

      {/* Preferences Section */}
      <Card elevation={0} sx={{ marginBottom: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: 2 }}>
            Preferences
          </Typography>
          <List sx={{ padding: 0 }}>
            <ListItem sx={{ paddingX: 0, paddingY: 2 }}>
              <ListItemIcon>
                <DarkModeIcon />
              </ListItemIcon>
              <ListItemText
                primary="Dark Mode"
                secondary="Enable dark theme for better eye comfort"
              />
              <Switch
                edge="end"
                checked={isDark}
                onChange={toggleTheme}
                color="primary"
              />
            </ListItem>
            <Divider sx={{ my: 1 }} />
            <ListItem sx={{ paddingX: 0, paddingY: 2 }}>
              <ListItemIcon>
                <NotificationsIcon />
              </ListItemIcon>
              <ListItemText
                primary="Notifications"
                secondary="Receive trade alerts (coming soon)"
              />
              <Switch edge="end" disabled color="primary" />
            </ListItem>
            <Divider sx={{ my: 1 }} />
            <ListItem sx={{ paddingX: 0, paddingY: 2 }}>
              <ListItemIcon>
                <SecurityIcon />
              </ListItemIcon>
              <ListItemText
                primary="Two-Factor Authentication"
                secondary="Secure your account (coming soon)"
              />
              <Switch edge="end" disabled color="primary" />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* About Section */}
      <Card elevation={0} sx={{ marginBottom: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: 2 }}>
            About
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', marginBottom: 0.5 }}>
                  Application
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Paper Trading
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', marginBottom: 0.5 }}>
                  Version
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  1.0.0
                </Typography>
              </Box>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.8 }}>
            Paper Trading is a simulated stock trading application designed for educational purposes.
            All trades use virtual money and do not involve real financial transactions.
          </Typography>
        </CardContent>
      </Card>

      {/* Logout Section */}
      <Card elevation={0} sx={{ borderColor: 'error.main', backgroundColor: 'rgba(211, 47, 47, 0.05)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: 1, color: 'error.main' }}>
            Logout
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', marginBottom: 2 }}>
            Sign out of your account. You'll need to log in again to access your portfolio.
          </Typography>
          <Button
            variant="contained"
            onClick={handleLogout}
            sx={{
              backgroundColor: '#d32f2f',
              '&:hover': { backgroundColor: '#c62828' },
            }}
            startIcon={<LogoutIcon />}
          >
            Logout
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}
