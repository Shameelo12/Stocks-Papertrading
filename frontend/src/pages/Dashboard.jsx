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
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <AppBar position="static" sx={{ backgroundColor: '#fff', color: '#333', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1, fontWeight: 700, background: 'linear-gradient(135deg, #05a854 0%, #0d8f47 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Paper Trading
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, marginRight: 3 }}>
            <Button
              onClick={() => navigate('/trade')}
              sx={{ color: '#1a1a1a', textTransform: 'none', fontWeight: 500 }}
            >
              Trade
            </Button>
            <Button
              onClick={() => navigate('/history')}
              sx={{ color: '#1a1a1a', textTransform: 'none', fontWeight: 500 }}
            >
              History
            </Button>
          </Box>
          <Typography sx={{ marginRight: 2, fontSize: '14px', color: '#666' }}>
            {user?.email}
          </Typography>
          <Button
            onClick={logout}
            sx={{ color: '#05a854', textTransform: 'none', fontWeight: 500 }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ flex: 1, paddingTop: 4, paddingBottom: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <CircularProgress sx={{ color: '#05a854' }} size={60} />
          </Box>
        ) : (
          <>
            <Grid container spacing={4} sx={{ marginBottom: 5 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, #1f3a5f 0%, #2a5298 100%)',
                    color: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 8px 24px rgba(31, 58, 95, 0.2)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 16px 40px rgba(31, 58, 95, 0.35)',
                    },
                  }}
                >
                  <CardContent sx={{ padding: 3 }}>
                    <Typography variant="body2" sx={{ opacity: 0.85, marginBottom: 1.5, fontWeight: 500, fontSize: '14px' }}>
                      Cash Balance
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '32px' }}>
                      ${portfolio?.currentBalance.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, #05a854 0%, #0d8f47 100%)',
                    color: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 8px 24px rgba(5, 168, 84, 0.2)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 16px 40px rgba(5, 168, 84, 0.35)',
                    },
                  }}
                >
                  <CardContent sx={{ padding: 3 }}>
                    <Typography variant="body2" sx={{ opacity: 0.85, marginBottom: 1.5, fontWeight: 500, fontSize: '14px' }}>
                      Invested
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '32px' }}>
                      ${portfolio?.investedBalance.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                    color: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 8px 24px rgba(255, 107, 53, 0.2)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 16px 40px rgba(255, 107, 53, 0.35)',
                    },
                  }}
                >
                  <CardContent sx={{ padding: 3 }}>
                    <Typography variant="body2" sx={{ opacity: 0.85, marginBottom: 1.5, fontWeight: 500, fontSize: '14px' }}>
                      Total Value
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '32px' }}>
                      ${portfolio?.totalPortfolioValue.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    background: `linear-gradient(135deg, ${portfolio?.totalGainLoss >= 0 ? '#05a854' : '#d32f2f'} 0%, ${portfolio?.totalGainLoss >= 0 ? '#0d8f47' : '#c62828'} 100%)`,
                    color: 'white',
                    borderRadius: '16px',
                    boxShadow: portfolio?.totalGainLoss >= 0 ? '0 8px 24px rgba(5, 168, 84, 0.2)' : '0 8px 24px rgba(211, 47, 47, 0.2)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: portfolio?.totalGainLoss >= 0 ? '0 16px 40px rgba(5, 168, 84, 0.35)' : '0 16px 40px rgba(211, 47, 47, 0.35)',
                    },
                  }}
                >
                  <CardContent sx={{ padding: 3 }}>
                    <Typography variant="body2" sx={{ opacity: 0.85, marginBottom: 1.5, fontWeight: 500, fontSize: '14px' }}>
                      Total Gain/Loss
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '32px' }}>
                      ${portfolio?.totalGainLoss.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, marginTop: 0.5, fontSize: '16px' }}>
                      ({portfolio?.totalGainLossPercent.toFixed(2)}%)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {portfolio?.holdings.length > 0 ? (
              <Card
                elevation={0}
                sx={{
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                  borderRadius: '16px',
                  border: '1px solid rgba(0,0,0,0.04)',
                  overflow: 'hidden',
                }}
              >
                <CardContent sx={{ padding: 0 }}>
                  <Typography variant="h5" sx={{ padding: 4, marginBottom: 0, fontWeight: 700 }}>
                    Your Holdings
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead sx={{ backgroundColor: '#f8f9fa', borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700, color: '#1a1a1a', fontSize: '15px', padding: '16px' }}>Ticker</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: '#1a1a1a', fontSize: '15px', padding: '16px' }}>Shares</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: '#1a1a1a', fontSize: '15px', padding: '16px' }}>Avg Cost</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: '#1a1a1a', fontSize: '15px', padding: '16px' }}>Current Price</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: '#1a1a1a', fontSize: '15px', padding: '16px' }}>Value</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: '#1a1a1a', fontSize: '15px', padding: '16px' }}>Gain/Loss</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {portfolio?.holdings.map((holding) => (
                          <TableRow
                            key={holding.ticker}
                            hover
                            sx={{
                              '&:hover': {
                                backgroundColor: '#f8f9fa',
                              },
                              borderBottom: '1px solid rgba(0,0,0,0.04)',
                            }}
                          >
                            <TableCell sx={{ fontWeight: 700, color: '#1a1a1a', fontSize: '15px', padding: '16px' }}>
                              {holding.ticker}
                            </TableCell>
                            <TableCell align="right" sx={{ fontSize: '15px', padding: '16px' }}>
                              {parseFloat(holding.shares).toFixed(2)}
                            </TableCell>
                            <TableCell align="right" sx={{ fontSize: '15px', padding: '16px' }}>
                              ${parseFloat(holding.avgCostPerShare).toFixed(2)}
                            </TableCell>
                            <TableCell align="right" sx={{ fontSize: '15px', padding: '16px' }}>
                              ${parseFloat(holding.currentPrice).toFixed(2)}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, fontSize: '15px', padding: '16px' }}>
                              ${parseFloat(holding.currentValue).toFixed(2)}
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{
                                color: holding.gainLoss >= 0 ? '#05a854' : '#d32f2f',
                                fontWeight: 700,
                                fontSize: '15px',
                                padding: '16px',
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
              <Card
                elevation={0}
                sx={{
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                  borderRadius: '16px',
                  border: '1px solid rgba(0,0,0,0.04)',
                }}
              >
                <CardContent sx={{ textAlign: 'center', padding: 6 }}>
                  <Typography variant="h4" sx={{ color: '#1a1a1a', marginBottom: 1.5, fontWeight: 700 }}>
                    Start Trading
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#666', marginBottom: 4, fontWeight: 400 }}>
                    You don't have any holdings yet. Search and buy your first stock.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/trade')}
                    sx={{
                      backgroundColor: '#05a854',
                      padding: '14px 32px',
                      fontSize: '16px',
                      fontWeight: 700,
                      borderRadius: '10px',
                      boxShadow: '0 6px 16px rgba(5, 168, 84, 0.25)',
                      '&:hover': {
                        backgroundColor: '#0d8f47',
                        boxShadow: '0 8px 20px rgba(5, 168, 84, 0.35)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Make Your First Trade
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
