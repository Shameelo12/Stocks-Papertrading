import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const response = await API.get('/portfolio');
      setPortfolio(response.data);
    } catch (err) {
      console.error('Failed to fetch portfolio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <AppBar position="static" sx={{ backgroundColor: '#fff', color: '#333', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1, fontWeight: 600, color: '#667eea' }}>
            Paper Trading
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, marginRight: 3 }}>
            <Button
              color="inherit"
              onClick={() => navigate('/trade')}
              sx={{ color: '#667eea', textTransform: 'none' }}
            >
              Trade
            </Button>
            <Button
              color="inherit"
              onClick={() => navigate('/history')}
              sx={{ color: '#667eea', textTransform: 'none' }}
            >
              History
            </Button>
          </Box>
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
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={3} sx={{ marginBottom: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ opacity: 0.9, marginBottom: 1 }}>
                      Cash Balance
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      ${portfolio?.currentBalance.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)', color: 'white' }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ opacity: 0.9, marginBottom: 1 }}>
                      Invested
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      ${portfolio?.investedBalance.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)', color: 'white' }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ opacity: 0.9, marginBottom: 1 }}>
                      Portfolio Value
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      ${portfolio?.totalPortfolioValue.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    background: `linear-gradient(135deg, ${portfolio?.totalGainLoss >= 0 ? '#28a745' : '#dc3545'} 0%, ${portfolio?.totalGainLoss >= 0 ? '#20c997' : '#c82333'} 100%)`,
                    color: 'white',
                  }}
                >
                  <CardContent>
                    <Typography variant="body2" sx={{ opacity: 0.9, marginBottom: 1 }}>
                      Total Gain/Loss
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      ${portfolio?.totalGainLoss.toFixed(2)}
                    </Typography>
                    <Typography variant="caption">
                      ({portfolio?.totalGainLossPercent.toFixed(2)}%)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {portfolio?.holdings.length > 0 ? (
              <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ padding: 0 }}>
                  <Typography variant="h6" sx={{ padding: 3, marginBottom: 0, fontWeight: 600 }}>
                    Your Holdings
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Ticker</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Shares</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Avg Cost</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Current Price</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Current Value</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Gain/Loss</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {portfolio?.holdings.map((holding) => (
                          <TableRow key={holding.ticker} hover>
                            <TableCell sx={{ fontWeight: 600 }}>
                              {holding.ticker}
                            </TableCell>
                            <TableCell align="right">
                              {parseFloat(holding.shares).toFixed(2)}
                            </TableCell>
                            <TableCell align="right">
                              ${parseFloat(holding.avgCostPerShare).toFixed(2)}
                            </TableCell>
                            <TableCell align="right">
                              ${parseFloat(holding.currentPrice).toFixed(2)}
                            </TableCell>
                            <TableCell align="right">
                              ${parseFloat(holding.currentValue).toFixed(2)}
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{
                                color: holding.gainLoss >= 0 ? '#28a745' : '#dc3545',
                                fontWeight: 600,
                              }}
                            >
                              ${parseFloat(holding.gainLoss).toFixed(2)} ({parseFloat(holding.gainLossPercent).toFixed(2)}%)
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            ) : (
              <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ textAlign: 'center', padding: 4 }}>
                  <Typography variant="body1" sx={{ color: '#666', marginBottom: 2 }}>
                    You don't have any holdings yet.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/trade')}
                    sx={{
                      backgroundColor: '#667eea',
                      '&:hover': { backgroundColor: '#764ba2' },
                    }}
                  >
                    Start Trading
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}
