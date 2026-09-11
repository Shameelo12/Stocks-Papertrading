import React from 'react';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
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

const DRAWER_WIDTH = 236;

/**
 * Navigation, grouped by what the items are for: the first group is where you
 * act on your account, the second is where you look back at it.
 */
const SECTIONS = [
  {
    heading: 'Invest',
    items: [
      { label: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
      { label: 'Trade', icon: TrendingUpIcon, path: '/trade' },
      { label: 'Portfolio', icon: AccountBalanceIcon, path: '/portfolio' },
      { label: 'Watchlist', icon: StarIcon, path: '/watchlist' },
    ],
  },
  {
    heading: 'Review',
    items: [
      { label: 'Analytics', icon: AnalyticsIcon, path: '/analytics' },
      { label: 'History', icon: HistoryIcon, path: '/history' },
      { label: 'Settings', icon: SettingsIcon, path: '/settings' },
    ],
  },
];

/**
 * A single navigation entry.
 *
 * Previously the two groups each carried their own copy of this markup and
 * styling, so any change had to be made twice.
 */
function NavItem({ item, active, onNavigate }) {
  const theme = useTheme();
  const Icon = item.icon;

  return (
    <ListItem disablePadding sx={{ px: 1.5, mb: 0.25 }}>
      <ListItemButton
        onClick={() => onNavigate(item.path)}
        // Marks the current page for assistive tech, which the background
        // tint alone did not convey.
        aria-current={active ? 'page' : undefined}
        sx={{
          borderRadius: '8px',
          py: 1.1,
          px: 1.5,
          position: 'relative',
          color: active ? 'primary.main' : 'text.secondary',
          backgroundColor: active ? 'action.selected' : 'transparent',
          '&:hover': {
            backgroundColor: active ? 'action.selected' : 'action.hover',
            color: active ? 'primary.main' : 'text.primary',
          },
          '&:focus-visible': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: -2,
          },
          // A short rail on the active item, so the current page is legible
          // without depending on the tint being visible.
          '&::before': active
            ? {
                content: '""',
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 3,
                height: 18,
                borderRadius: '0 2px 2px 0',
                backgroundColor: 'primary.main',
              }
            : undefined,
        }}
      >
        <ListItemIcon sx={{ minWidth: 34, color: 'inherit' }}>
          <Icon sx={{ fontSize: '1.25rem' }} />
        </ListItemIcon>
        <ListItemText
          primary={item.label}
          primaryTypographyProps={{
            fontSize: '0.9rem',
            fontWeight: active ? 600 : 500,
          }}
        />
      </ListItemButton>
    </ListItem>
  );
}

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) onClose();
  };

  const content = (
    <Box
      component="nav"
      aria-label="Main navigation"
      sx={{ height: '100%', display: 'flex', flexDirection: 'column', pt: 2 }}
    >
      {SECTIONS.map((section, i) => (
        <Box key={section.heading} sx={{ mt: i > 0 ? 3 : 0 }}>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              px: 3,
              mb: 0.75,
              color: 'text.disabled',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontSize: '0.67rem',
              fontWeight: 600,
            }}
          >
            {section.heading}
          </Typography>
          <List disablePadding>
            {section.items.map((item) => (
              <NavItem
                key={item.path}
                item={item}
                active={location.pathname === item.path}
                onNavigate={handleNavigate}
              />
            ))}
          </List>
        </Box>
      ))}
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          borderRight: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          // Stretch to the row rather than height:100%. A percentage height needs
          // a parent with a definite height, and the parent's is computed by flex
          // layout — so height:100% collapsed to the content height and the panel
          // ended partway down the page. align-items:stretch is the default, so
          // simply not setting a height makes it fill.
          overflow: 'auto',
        }}
      >
        {content}
      </Box>

      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        sx={{ display: { xs: 'flex', md: 'none' } }}
      >
        <Box sx={{ width: DRAWER_WIDTH }}>{content}</Box>
      </Drawer>
    </>
  );
}

export { DRAWER_WIDTH };
