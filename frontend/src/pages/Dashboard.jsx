import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <AppBar position="static" sx={{ backgroundColor: '#fff', color: '#333', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1, fontWeight: 600, color: '#667eea' }}>
            Paper Trading
          </Typography>
          <Typography sx={{ marginRight: 2, fontSize: '14px' }}>
            {user?.email}
          </Typography>
          <Button
            color="inherit"
            onClick={logout}
            sx={{ color: '#667eea', textTransform: 'none' }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ flex: 1, paddingTop: 4, paddingBottom: 4 }}>
        <Box sx={{ marginBottom: 4 }}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
            }}
          >
            <CardContent sx={{ padding: 4, textAlign: 'center' }}>
              <Typography variant="h5" sx={{ marginBottom: 1 }}>
                Welcome, {user?.email}!
              </Typography>
              <Typography variant="body2" sx={{ marginBottom: 2, opacity: 0.9 }}>
                Your Account Balance
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  marginBottom: 1,
                  fontSize: '48px',
                }}
              >
                ${(user?.balance || 0).toFixed(2)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Starting balance: $10,000.00
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ padding: 3 }}>
            <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: 600 }}>
              Coming Soon
            </Typography>
            <Typography variant="body2" sx={{ marginBottom: 2, color: '#666' }}>
              Portfolio and trading features will appear here as we build them out.
            </Typography>
            <List>
              <ListItem disablePadding sx={{ marginBottom: 1 }}>
                <ListItemText primary="View your holdings" />
              </ListItem>
              <ListItem disablePadding sx={{ marginBottom: 1 }}>
                <ListItemText primary="Track your portfolio performance" />
              </ListItem>
              <ListItem disablePadding sx={{ marginBottom: 1 }}>
                <ListItemText primary="Buy and sell stocks" />
              </ListItem>
              <ListItem disablePadding>
                <ListItemText primary="View transaction history" />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
