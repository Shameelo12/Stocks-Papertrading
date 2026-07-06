import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import API from '../api/axios';

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await API.get('/analytics/stats');
        setStats(response.data);
      } catch (err) {
        setError('Failed to load analytics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#05a854' }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ paddingY: 4 }}>
      {/* Header */}
      <Box sx={{ marginBottom: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, marginBottom: 1 }}>
          Trading Analytics
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Analyze your trading performance and statistics
        </Typography>
      </Box>

      {error && (
        <Typography variant="body2" sx={{ color: 'error.main', marginBottom: 2 }}>
          {error}
        </Typography>
      )}

      {stats && (
        <>
          {/* Key Metrics */}
          <Grid container spacing={3} sx={{ marginBottom: 4 }}>
            {[
              {
                label: 'Total Trades',
                value: stats.totalTrades,
                icon: '📊',
                bg: 'linear-gradient(135deg, #1f3a5f 0%, #2a5298 100%)',
              },
              {
                label: 'Win Rate',
                value: `${stats.winRate.toFixed(1)}%`,
                icon: '🎯',
                bg: stats.winRate >= 50 ? 'linear-gradient(135deg, #05a854 0%, #0d8f47 100%)' : 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)',
              },
              {
                label: 'Winning Trades',
                value: stats.winningTrades,
                icon: '📈',
                bg: 'linear-gradient(135deg, #05a854 0%, #0d8f47 100%)',
              },
              {
                label: 'Losing Trades',
                value: stats.losingTrades,
                icon: '📉',
                bg: 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)',
              },
            ].map((metric, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Card elevation={0} sx={{ background: metric.bg, color: 'white', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 32px rgba(0,0,0,0.2)' } }}>
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

          {/* Performance Metrics */}
          <Grid container spacing={3} sx={{ marginBottom: 4 }}>
            {[
              {
                label: 'Average Gain Per Trade',
                value: `$${stats.avgGainPerTrade.toFixed(2)}`,
                icon: '💰',
                bg: 'linear-gradient(135deg, #05a854 0%, #0d8f47 100%)',
              },
              {
                label: 'Average Loss Per Trade',
                value: `$${stats.avgLossPerTrade.toFixed(2)}`,
                icon: '💸',
                bg: 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)',
              },
              {
                label: 'Largest Win',
                value: `$${stats.largestWin.toFixed(2)}`,
                icon: '🏆',
                bg: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
              },
              {
                label: 'Largest Loss',
                value: `$${stats.largestLoss.toFixed(2)}`,
                icon: '⚠️',
                bg: 'linear-gradient(135deg, #e91e63 0%, #c2185b 100%)',
              },
            ].map((metric, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Card elevation={0} sx={{ background: metric.bg, color: 'white', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 32px rgba(0,0,0,0.2)' } }}>
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

          {/* Best Performers */}
          {stats.bestPerformers.length > 0 && (
            <Card elevation={0} sx={{ marginBottom: 4 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: 3 }}>
                  Best Performing Stocks 🌟
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Ticker</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Gain/Loss</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Return %</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.bestPerformers.map((stock) => (
                        <TableRow key={stock.ticker} hover>
                          <TableCell sx={{ fontWeight: 600 }}>
                            <Chip
                              label={stock.ticker}
                              variant="outlined"
                              size="small"
                              sx={{
                                fontWeight: 700,
                                borderColor: '#05a854',
                                color: '#05a854',
                              }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ color: '#05a854', fontWeight: 600 }}>
                            ${stock.gainLoss.toFixed(2)}
                          </TableCell>
                          <TableCell align="right" sx={{ color: '#05a854', fontWeight: 600 }}>
                            +{stock.gainLossPercent.toFixed(2)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {/* Worst Performers */}
          {stats.worstPerformers.length > 0 && (
            <Card elevation={0}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: 3 }}>
                  Worst Performing Stocks 📉
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Ticker</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Gain/Loss</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Return %</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.worstPerformers.map((stock) => (
                        <TableRow key={stock.ticker} hover>
                          <TableCell sx={{ fontWeight: 600 }}>
                            <Chip
                              label={stock.ticker}
                              variant="outlined"
                              size="small"
                              sx={{
                                fontWeight: 700,
                                borderColor: '#d32f2f',
                                color: '#d32f2f',
                              }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ color: '#d32f2f', fontWeight: 600 }}>
                            ${stock.gainLoss.toFixed(2)}
                          </TableCell>
                          <TableCell align="right" sx={{ color: '#d32f2f', fontWeight: 600 }}>
                            {stock.gainLossPercent.toFixed(2)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Container>
  );
}
