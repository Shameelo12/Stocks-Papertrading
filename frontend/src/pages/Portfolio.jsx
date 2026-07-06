import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Paper,
  Chip,
  LinearProgress,
  Alert,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function Portfolio() {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const response = await API.get('/portfolio');
      setPortfolio(response.data);
    } catch (err) {
      setError('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#05a854' }} />
      </Container>
    );
  }

  const metrics = [
    {
      label: 'Portfolio Value',
      value: `$${portfolio?.totalPortfolioValue.toFixed(2) || '0.00'}`,
      icon: TrendingUpIcon,
      bg: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
    },
    {
      label: 'Total Gain/Loss',
      value: `$${portfolio?.totalGainLoss.toFixed(2) || '0.00'}`,
      icon: portfolio?.totalGainLoss >= 0 ? TrendingUpIcon : TrendingDownIcon,
      bg: portfolio?.totalGainLoss >= 0 ? 'linear-gradient(135deg, #05a854 0%, #0d8f47 100%)' : 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)',
      color: portfolio?.totalGainLoss >= 0 ? '#05a854' : '#d32f2f',
    },
    {
      label: 'Return %',
      value: `${portfolio?.totalGainLossPercent.toFixed(2) || '0.00'}%`,
      icon: portfolio?.totalGainLossPercent >= 0 ? TrendingUpIcon : TrendingDownIcon,
      color: portfolio?.totalGainLossPercent >= 0 ? '#05a854' : '#d32f2f',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ paddingY: 4 }}>
      {/* Header */}
      <Box sx={{ marginBottom: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, marginBottom: 1 }}>
          Portfolio
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          View your holdings and performance
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ marginBottom: 3 }}>{error}</Alert>}

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ marginBottom: 4 }}>
        {metrics.map((metric, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Card elevation={0} sx={{ height: '100%', overflow: 'hidden' }}>
              <Box
                sx={{
                  background: metric.bg,
                  color: 'white',
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, marginBottom: 1 }}>
                    {metric.label}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {metric.value}
                  </Typography>
                </Box>
                {metric.icon && <metric.icon sx={{ fontSize: 40, opacity: 0.3 }} />}
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Allocation Breakdown */}
      <Card elevation={0} sx={{ marginBottom: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: 3 }}>
            Allocation
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
                  <Typography variant="body2">Cash</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ${portfolio?.currentBalance.toFixed(2) || '0.00'}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(portfolio?.currentBalance / portfolio?.totalPortfolioValue) * 100 || 0}
                  sx={{
                    height: 8,
                    borderRadius: '4px',
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#1f3a5f',
                    },
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
                  <Typography variant="body2">Invested</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ${portfolio?.investedBalance.toFixed(2) || '0.00'}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(portfolio?.investedBalance / portfolio?.totalPortfolioValue) * 100 || 0}
                  sx={{
                    height: 8,
                    borderRadius: '4px',
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#05a854',
                    },
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Holdings Table */}
      {portfolio?.holdings && portfolio.holdings.length > 0 ? (
        <Card elevation={0}>
          <CardContent sx={{ padding: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, padding: 3, marginBottom: 0 }}>
              Holdings ({portfolio.holdings.length})
            </Typography>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Ticker</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Shares</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Avg Cost</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Current Price</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Value</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>P&L</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>%</TableCell>
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
                        ${parseFloat(holding.gainLoss).toFixed(2)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color: holding.gainLoss >= 0 ? '#05a854' : '#d32f2f',
                          fontWeight: 700,
                        }}
                      >
                        {parseFloat(holding.gainLossPercent).toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      ) : (
        <Card elevation={0}>
          <CardContent sx={{ textAlign: 'center', paddingY: 6 }}>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              No holdings yet. Start trading to build your portfolio!
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
