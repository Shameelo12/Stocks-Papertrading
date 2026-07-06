import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  InputAdornment,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import NotificationsIcon from '@mui/icons-material/Notifications';
import API from '../api/axios';

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState(['AAPL', 'GOOGL', 'MSFT']);
  const [searchQuery, setSearchQuery] = useState('');
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [alertTicker, setAlertTicker] = useState('');
  const [alertPrice, setAlertPrice] = useState('');
  const [alertType, setAlertType] = useState('ABOVE');

  const handleAddStock = async () => {
    if (!searchQuery.trim()) return;

    const ticker = searchQuery.toUpperCase();
    if (watchlist.includes(ticker)) {
      setError('Stock already in watchlist');
      return;
    }

    // Fetch price to verify it exists
    setLoading(true);
    setError('');
    try {
      const response = await API.get(`/stocks/${ticker}/price`);
      setWatchlist([...watchlist, ticker]);
      setPrices({ ...prices, [ticker]: response.data.price });
      setSearchQuery('');
    } catch (err) {
      setError('Stock not found');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStock = (ticker) => {
    setWatchlist(watchlist.filter((item) => item !== ticker));
    const newPrices = { ...prices };
    delete newPrices[ticker];
    setPrices(newPrices);
  };

  const handleFetchPrices = async () => {
    setLoading(true);
    setError('');
    try {
      const newPrices = {};
      for (const ticker of watchlist) {
        const response = await API.get(`/stocks/${ticker}/price`);
        newPrices[ticker] = response.data.price;
      }
      setPrices(newPrices);
    } catch (err) {
      setError('Failed to fetch prices');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async () => {
    if (!alertTicker.trim() || !alertPrice.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await API.post('/price-alerts', {
        ticker: alertTicker.toUpperCase(),
        targetPrice: parseFloat(alertPrice),
        type: alertType,
      });
      setAlertTicker('');
      setAlertPrice('');
      setAlertType('ABOVE');
      setError('');
      fetchAlerts();
    } catch (err) {
      setError('Failed to create alert');
    }
  };

  const handleDeleteAlert = async (alertId) => {
    try {
      await API.delete(`/price-alerts/${alertId}`);
      fetchAlerts();
    } catch (err) {
      setError('Failed to delete alert');
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await API.get('/price-alerts');
      setAlerts(response.data);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    }
  };

  useEffect(() => {
    handleFetchPrices();
    fetchAlerts();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ paddingY: 4 }}>
      {/* Header */}
      <Box sx={{ marginBottom: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, marginBottom: 1 }}>
          Watchlist
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Track your favorite stocks
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ marginBottom: 3 }}>{error}</Alert>}

      {/* Price Alerts Section */}
      <Card elevation={0} sx={{ marginBottom: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: 2 }}>
            <NotificationsIcon sx={{ marginRight: 1, fontSize: '1.2rem' }} />
            Price Alerts
          </Typography>
          <Grid container spacing={2} sx={{ marginBottom: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Stock Ticker"
                value={alertTicker}
                onChange={(e) => setAlertTicker(e.target.value)}
                fullWidth
                size="small"
                placeholder="e.g., AAPL"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Target Price"
                value={alertPrice}
                onChange={(e) => setAlertPrice(e.target.value)}
                fullWidth
                size="small"
                type="number"
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Alert Type</InputLabel>
                <Select value={alertType} onChange={(e) => setAlertType(e.target.value)} label="Alert Type">
                  <MenuItem value="ABOVE">Price Above</MenuItem>
                  <MenuItem value="BELOW">Price Below</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                onClick={handleCreateAlert}
                fullWidth
                sx={{
                  backgroundColor: '#05a854',
                  '&:hover': { backgroundColor: '#0d8f47' },
                  height: '40px',
                }}
              >
                Set Alert
              </Button>
            </Grid>
          </Grid>

          {/* Active Alerts */}
          {alerts.length > 0 && (
            <Box sx={{ marginTop: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, marginBottom: 1 }}>
                Active Alerts ({alerts.length})
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Ticker</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Target Price</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Type</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {alerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell sx={{ fontWeight: 600 }}>{alert.ticker}</TableCell>
                        <TableCell align="right">${parseFloat(alert.targetPrice).toFixed(2)}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={alert.type}
                            size="small"
                            sx={{
                              backgroundColor: alert.type === 'ABOVE' ? 'rgba(5, 168, 84, 0.2)' : 'rgba(33, 150, 243, 0.2)',
                              color: alert.type === 'ABOVE' ? '#05a854' : '#2196f3',
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteAlert(alert.id)}
                            sx={{ color: 'error.main' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Add Stock Section */}
      <Card elevation={0} sx={{ marginBottom: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: 2 }}>
            Add to Watchlist
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              placeholder="Enter ticker symbol (e.g., TSLA, NFLX)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddStock()}
              disabled={loading}
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ opacity: 0.5 }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              onClick={handleAddStock}
              disabled={loading || !searchQuery.trim()}
              sx={{
                backgroundColor: '#05a854',
                '&:hover': { backgroundColor: '#0d8f47' },
                minWidth: '120px',
              }}
              startIcon={<AddIcon />}
            >
              Add
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Watchlist Table */}
      {watchlist.length > 0 ? (
        <Card elevation={0}>
          <CardContent sx={{ padding: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 3, marginBottom: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Stocks ({watchlist.length})
              </Typography>
              <Button
                size="small"
                onClick={handleFetchPrices}
                disabled={loading}
                variant="outlined"
              >
                {loading ? <CircularProgress size={20} /> : 'Refresh Prices'}
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Ticker</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Price</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {watchlist.map((ticker) => (
                    <TableRow key={ticker} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <StarIcon sx={{ color: '#ffc107', fontSize: '1.2rem' }} />
                          <Chip
                            label={ticker}
                            variant="outlined"
                            size="small"
                            sx={{
                              fontWeight: 700,
                              borderColor: '#05a854',
                              color: '#05a854',
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {prices[ticker] ? `$${parseFloat(prices[ticker]).toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveStock(ticker)}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
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
            <StarIcon sx={{ fontSize: 48, color: 'text.secondary', marginBottom: 2 }} />
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Your watchlist is empty. Add stocks to track them here!
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
