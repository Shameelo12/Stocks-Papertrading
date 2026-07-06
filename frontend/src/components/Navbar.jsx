import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  TextField,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const handleSettings = () => {
    navigate('/settings');
    handleMenuClose();
  };

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', paddingX: 3 }}>
        {/* Left Section - Logo & Menu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="Toggle sidebar">
            <IconButton
              color="inherit"
              onClick={onMenuClick}
              sx={{ display: { xs: 'flex', md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
            <Box
              sx={{
                width: 40,
                height: 40,
                background: 'linear-gradient(135deg, #05a854 0%, #0d8f47 100%)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                fontSize: '1.2rem',
              }}
            >
              PT
            </Box>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '0.5px' }}>
                Paper Trading
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', opacity: 0.7 }}>
                Brokerage
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Center Section - Search */}
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', marginX: 2, display: { xs: 'none', md: 'flex' } }}>
          <TextField
            placeholder="Search stocks..."
            variant="outlined"
            size="small"
            sx={{
              width: '300px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                backgroundColor: 'rgba(0,0,0,0.05)',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ opacity: 0.5 }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Right Section - Theme Toggle & Account */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={isDark ? 'Light mode' : 'Dark mode'}>
            <IconButton onClick={toggleTheme} color="inherit" size="small">
              {isDark ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          <Box sx={{ display: { xs: 'none', sm: 'block' }, marginX: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {user?.email?.split('@')[0]}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              Balance: ${user?.balance?.toFixed(2) || '0.00'}
            </Typography>
          </Box>

          <Tooltip title="Account menu">
            <IconButton onClick={handleMenuOpen} size="small">
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  background: 'linear-gradient(135deg, #05a854 0%, #0d8f47 100%)',
                  fontWeight: 700,
                }}
              >
                {user?.email?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem disabled>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {user?.email}
              </Typography>
            </MenuItem>
            <MenuItem disabled>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                Balance: ${user?.balance?.toFixed(2) || '0.00'}
              </Typography>
            </MenuItem>
            <Divider sx={{ my: 1 }} />
            <MenuItem onClick={handleSettings}>
              <SettingsIcon sx={{ marginRight: 1, fontSize: '1.2rem' }} />
              Settings
            </MenuItem>
            <Divider sx={{ my: 1 }} />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <LogoutIcon sx={{ marginRight: 1, fontSize: '1.2rem' }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
