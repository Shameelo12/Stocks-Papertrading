import React from 'react';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import StarIcon from '@mui/icons-material/Star';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { useNavigate, useLocation } from 'react-router-dom';

const DRAWER_WIDTH = 280;

const menuItems = [
  { label: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
  { label: 'Trade', icon: TrendingUpIcon, path: '/trade' },
  { label: 'Portfolio', icon: AccountBalanceIcon, path: '/portfolio' },
  { label: 'Watchlist', icon: StarIcon, path: '/watchlist' },
];

const otherItems = [
  { label: 'Analytics', icon: AnalyticsIcon, path: '/analytics' },
  { label: 'History', icon: HistoryIcon, path: '/history' },
  { label: 'Settings', icon: SettingsIcon, path: '/settings' },
];

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const isActive = (path) => location.pathname === path;

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Main Navigation */}
      <Box sx={{ flex: 1, paddingTop: 2 }}>
        <List sx={{ paddingX: 0 }}>
          {menuItems.map((item) => (
            <ListItem key={item.path} disablePadding sx={{ paddingX: 1, marginY: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigate(item.path)}
                sx={{
                  borderRadius: '8px',
                  backgroundColor: isActive(item.path)
                    ? 'rgba(5, 168, 84, 0.1)'
                    : 'transparent',
                  color: isActive(item.path) ? '#05a854' : 'inherit',
                  fontWeight: isActive(item.path) ? 600 : 500,
                  '&:hover': {
                    backgroundColor: 'rgba(5, 168, 84, 0.08)',
                  },
                  paddingX: 2,
                  paddingY: 1.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive(item.path) ? '#05a854' : 'inherit',
                  }}
                >
                  <item.icon />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: 'inherit',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Divider */}
      <Divider sx={{ my: 2 }} />

      {/* Other Items */}
      <Box sx={{ paddingBottom: 2 }}>
        <List sx={{ paddingX: 0 }}>
          {otherItems.map((item) => (
            <ListItem key={item.path} disablePadding sx={{ paddingX: 1, marginY: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigate(item.path)}
                sx={{
                  borderRadius: '8px',
                  backgroundColor: isActive(item.path)
                    ? 'rgba(5, 168, 84, 0.1)'
                    : 'transparent',
                  color: isActive(item.path) ? '#05a854' : 'inherit',
                  fontWeight: isActive(item.path) ? 600 : 500,
                  '&:hover': {
                    backgroundColor: 'rgba(5, 168, 84, 0.08)',
                  },
                  paddingX: 2,
                  paddingY: 1.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive(item.path) ? '#05a854' : 'inherit',
                  }}
                >
                  <item.icon />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: 'inherit',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <Box
        sx={{
          width: DRAWER_WIDTH,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          borderRight: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          height: '100%',
          overflow: 'auto',
        }}
      >
        {drawerContent}
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        sx={{
          display: { xs: 'flex', md: 'none' },
        }}
      >
        <Box sx={{ width: DRAWER_WIDTH }}>
          {drawerContent}
        </Box>
      </Drawer>
    </>
  );
}

export { DRAWER_WIDTH };
