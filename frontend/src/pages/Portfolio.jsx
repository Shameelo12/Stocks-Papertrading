import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { usePortfolio } from '../hooks/usePortfolio';
import API from '../api/axios';

const COLORS = ['#05a854', '#1f3a5f', '#ff6b35', '#f7931e', '#2196f3', '#9c27b0', '#e91e63', '#009688'];

export default function Portfolio() {
  const { portfolio, loading, error, lastUpdated } = usePortfolio(5000); // Auto-refresh every 5 seconds
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await API.get('/portfolio/history');
        const formattedData = response.data.map(item => ({
          timestamp: new Date(item.timestamp).toLocaleDateString(),
          portfolioValue: parseFloat(item.portfolioValue),
          balance: parseFloat(item.balance),
          investedValue: parseFloat(item.investedValue),
        }));
        setHistoryData(formattedData);
      } catch (err) {
        console.error('Failed to fetch portfolio history:', err);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#05a854' }} />
      </Container>
    );
  }

  // Allocation data (Cash vs Invested)
  const allocationData = [
    { name: 'Cash', value: portfolio?.currentBalance || 0, color: '#1f3a5f' },
    { name: 'Invested', value: portfolio?.investedBalance || 0, color: '#05a854' },
  ];

  // Holdings breakdown data
  const holdingsData = (portfolio?.holdings || []).map((h, idx) => ({
    name: h.ticker,
    value: parseFloat(h.currentValue),
    color: COLORS[idx % COLORS.length],
    ...h,
  }));

  const renderCustomLabel = (entry) => {
    const percent = ((entry.value / (portfolio?.totalPortfolioValue || 1)) * 100).toFixed(1);
    return `${percent}%`;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            backgroundColor: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          <Typography variant="caption" sx={{ color: 'white', display: 'block' }}>
            {data.name}
          </Typography>
          <Typography variant="caption" sx={{ color: 'white', display: 'block' }}>
            ${parseFloat(payload[0].value).toFixed(2)}
          </Typography>
          <Typography variant="caption" sx={{ color: 'white', display: 'block' }}>
            {((payload[0].value / (portfolio?.totalPortfolioValue || 1)) * 100).toFixed(1)}%
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Container maxWidth="lg" sx={{ paddingY: 4 }}>
      {/* Header */}
      <Box sx={{ marginBottom: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, marginBottom: 1 }}>
          Portfolio Analysis
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Your holdings and allocation breakdown
          {lastUpdated && (
            <Chip
              label={`Updated: ${lastUpdated.toLocaleTimeString()}`}
              size="small"
              variant="outlined"
              sx={{ marginLeft: 2 }}
            />
          )}
        </Typography>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ marginBottom: 4 }}>
        {[
          {
            label: 'Portfolio Value',
            value: `$${portfolio?.totalPortfolioValue.toFixed(2) || '0.00'}`,
            icon: '💼',
            bg: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
          },
          {
            label: 'Total Return',
            value: `${portfolio?.totalGainLossPercent.toFixed(2) || '0.00'}%`,
            icon: portfolio?.totalGainLoss >= 0 ? '📈' : '📉',
            bg: portfolio?.totalGainLoss >= 0 ? 'linear-gradient(135deg, #05a854 0%, #0d8f47 100%)' : 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)',
          },
          {
            label: 'Gain/Loss',
            value: `$${portfolio?.totalGainLoss.toFixed(2) || '0.00'}`,
            icon: '💰',
            bg: 'linear-gradient(135deg, #1f3a5f 0%, #2a5298 100%)',
          },
        ].map((metric, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
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

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ marginBottom: 4 }}>
        {/* Allocation Pie Chart */}
        <Grid item xs={12} md={6}>
          <Card elevation={0}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: 3 }}>
                Allocation Breakdown
              </Typography>
              {portfolio?.totalPortfolioValue > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ textAlign: 'center', padding: 4 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    No holdings yet
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Holdings Pie Chart */}
        <Grid item xs={12} md={6}>
          <Card elevation={0}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: 3 }}>
                Holdings Breakdown
              </Typography>
              {holdingsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={holdingsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {holdingsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ textAlign: 'center', padding: 4 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    No stocks in portfolio
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Chart */}
      <Card elevation={0} sx={{ marginBottom: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: 3 }}>
            Portfolio Performance
          </Typography>
          {historyLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
              <CircularProgress sx={{ color: '#05a854' }} />
            </Box>
          ) : historyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis
                  dataKey="timestamp"
                  stroke="rgba(0,0,0,0.5)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="rgba(0,0,0,0.5)"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <Tooltip
                  formatter={(value) => `$${parseFloat(value).toFixed(2)}`}
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: 'none',
                    borderRadius: '4px',
                    color: 'white',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="portfolioValue"
                  stroke="#05a854"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Box sx={{ textAlign: 'center', padding: 4 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No history yet
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Detailed Holdings Table */}
      {holdingsData.length > 0 && (
        <Card elevation={0}>
          <CardContent sx={{ padding: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, padding: 3, marginBottom: 0 }}>
              Holdings Details
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
                    <TableCell align="right" sx={{ fontWeight: 700 }}>% of Portfolio</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>P&L</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {holdingsData.map((holding) => (
                    <TableRow key={holding.ticker} hover>
                      <TableCell sx={{ fontWeight: 700 }}>
                        <Chip
                          label={holding.ticker}
                          variant="outlined"
                          size="small"
                          sx={{
                            fontWeight: 700,
                            borderColor: holding.color,
                            color: holding.color,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">{parseFloat(holding.shares).toFixed(2)}</TableCell>
                      <TableCell align="right">${parseFloat(holding.avgCostPerShare).toFixed(2)}</TableCell>
                      <TableCell align="right">${parseFloat(holding.currentPrice).toFixed(2)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        ${parseFloat(holding.currentValue).toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        {((parseFloat(holding.currentValue) / (portfolio?.totalPortfolioValue || 1)) * 100).toFixed(1)}%
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
      )}
    </Container>
  );
}
