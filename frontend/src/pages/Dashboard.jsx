import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
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
  CircularProgress,
  Chip,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function Dashboard() {
  const { user } = useAuth();
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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#05a854' }} size={60} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ paddingY: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ marginBottom: 5 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, marginBottom: 1 }}>
          Welcome back, {user?.email?.split('@')[0]}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Here's your portfolio summary
        </Typography>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ marginBottom: 4 }}>
        {[
          {
            label: 'Cash Balance',
            value: `$${portfolio?.currentBalance.toFixed(2) || '0.00'}`,
            icon: '💰',
            bg: 'linear-gradient(135deg, #1f3a5f 0%, #2a5298 100%)',
          },
          {
            label: 'Invested',
            value: `$${portfolio?.investedBalance.toFixed(2) || '0.00'}`,
            icon: '📈',
            bg: 'linear-gradient(135deg, #05a854 0%, #0d8f47 100%)',
          },
          {
            label: 'Portfolio Value',
            value: `$${portfolio?.totalPortfolioValue.toFixed(2) || '0.00'}`,
            icon: '💼',
            bg: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
          },
          {
            label: 'Total Gain/Loss',
            value: `$${portfolio?.totalGainLoss.toFixed(2) || '0.00'} (${portfolio?.totalGainLossPercent.toFixed(2)}%)`,
            icon: portfolio?.totalGainLoss >= 0 ? '🚀' : '📉',
            bg: portfolio?.totalGainLoss >= 0 ? 'linear-gradient(135deg, #05a854 0%, #0d8f47 100%)' : 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)',
          },
        ].map((metric, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                background: metric.bg,
                color: 'white',
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
                },
              }}
            >
              <CardContent sx={{ padding: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.85, marginBottom: 1, fontWeight: 500 }}>
                      {metric.label}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {metric.value}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '2rem' }}>
                    {metric.icon}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Holdings Section */}
      {portfolio?.holdings && portfolio.holdings.length > 0 ? (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Your Holdings
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/trade')}
              sx={{
                backgroundColor: '#05a854',
                '&:hover': { backgroundColor: '#0d8f47' },
              }}
            >
              Trade More
            </Button>
          </Box>

          <Card elevation={0}>
            <CardContent sx={{ padding: 0 }}>
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Ticker</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Shares</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Avg Cost</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Current Price</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Value</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Return</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {portfolio.holdings.map((holding) => (
                      <TableRow key={holding.ticker} hover>
                        <TableCell sx={{ fontWeight: 700 }}>
                          <Chip
                            label={holding.ticker}
                            variant="outlined"
                            size="small"
                            sx={{
                              fontWeight: 700,
                              borderColor: '#05a854',
                              color: '#05a854',
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">{parseFloat(holding.shares).toFixed(2)}</TableCell>
                        <TableCell align="right">${parseFloat(holding.avgCostPerShare).toFixed(2)}</TableCell>
                        <TableCell align="right">${parseFloat(holding.currentPrice).toFixed(2)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          ${parseFloat(holding.currentValue).toFixed(2)}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            color: holding.gainLoss >= 0 ? '#05a854' : '#d32f2f',
                            fontWeight: 700,
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
        </>
      ) : (
        <Card elevation={0}>
          <CardContent sx={{ textAlign: 'center', paddingY: 8 }}>
            <TrendingUpIcon sx={{ fontSize: 64, color: 'text.secondary', marginBottom: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: 1 }}>
              Start Trading Today
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', marginBottom: 3 }}>
              You don't have any holdings yet. Begin your investment journey.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/trade')}
              sx={{
                backgroundColor: '#05a854',
                '&:hover': { backgroundColor: '#0d8f47' },
              }}
              size="large"
            >
              Make Your First Trade
            </Button>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
