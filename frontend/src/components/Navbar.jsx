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
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { usePortfolio } from '../hooks/usePortfolio';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { portfolio, refetch, lastUpdated } = usePortfolio(3000); // Auto-refresh every 3 seconds
  const [anchorEl, setAnchorEl] = useState(null);

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
    <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid', borderBottomColor: 'divider' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', paddingX: { xs: 2, md: 4 }, height: 64 }}>
        {/* Left Section - Logo & Menu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
          <Tooltip title="Toggle sidebar">
            <IconButton
              color="inherit"
              onClick={onMenuClick}
              sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>

          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', transition: 'opacity 0.2s' }}
            onClick={() => navigate('/dashboard')}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                background: '#05a854',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 600,
                fontSize: '1rem',
              }}
            >
              PT
            </Box>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.2 }}>
                Paper Trading
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', opacity: 0.6, fontSize: '0.7rem' }}>
                Brokerage
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Center Section - Search */}
        <Box sx={{ flex: 1, justifyContent: 'center', marginX: 3, display: { xs: 'none', md: 'flex' } }}>
          <TextField
            placeholder="Search stocks, symbols..."
            variant="outlined"
            size="small"
            sx={{
              width: '100%',
              maxWidth: '320px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '6px',
                fontSize: '0.9rem',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ opacity: 0.4, fontSize: '1.2rem' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Right Section - Portfolio Value, Theme Toggle & Account */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Portfolio Value */}
          <Box sx={{ display: { xs: 'none', lg: 'block' }, textAlign: 'right', mr: 2 }}>
            <Typography variant="caption" sx={{ opacity: 0.7, display: 'block' }}>
              Portfolio Value
            </Typography>
            <Typography sx={{ fontWeight: 600, color: '#05a854', fontSize: '1rem' }}>
              ${portfolio?.totalPortfolioValue?.toFixed(2) || '0.00'}
            </Typography>
          </Box>

          {/* Refresh Button */}
          <Tooltip title="Refresh portfolio">
            <IconButton
              onClick={refetch}
              color="inherit"
              size="small"
              sx={{
                '&:hover': { backgroundColor: 'rgba(5, 168, 84, 0.1)' }
              }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Theme Toggle */}
          <Tooltip title={isDark ? 'Light mode' : 'Dark mode'}>
            <IconButton
              onClick={toggleTheme}
              color="inherit"
              size="small"
              sx={{
                '&:hover': { backgroundColor: 'rgba(5, 168, 84, 0.1)' }
              }}
            >
              {isDark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          <Box sx={{ display: { xs: 'none', sm: 'block' }, marginX: 2, textAlign: 'right' }}>
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.9rem' }}>
              {user?.email?.split('@')[0]}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.6, fontSize: '0.75rem' }}>
              Cash: ${portfolio?.currentBalance?.toFixed(2) || '0.00'}
            </Typography>
          </Box>

          <Tooltip title="Account menu">
            <IconButton
              onClick={handleMenuOpen}
              size="small"
              sx={{
                p: 0.5,
                '&:hover': { backgroundColor: 'rgba(5, 168, 84, 0.1)' }
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  background: '#05a854',
                  fontWeight: 600,
                  fontSize: '0.95rem',
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
