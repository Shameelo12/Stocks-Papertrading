import React, { useState } from 'react';
import {
  Container,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  ButtonGroup,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function Trade() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [stockPrice, setStockPrice] = useState(null);
  const [shares, setShares] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tradeType, setTradeType] = useState('buy');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');
    setStockPrice(null);

    try {
      const response = await API.get(`/stocks/search?q=${searchQuery.toUpperCase()}`);
      setStockPrice(response.data);
    } catch (err) {
      setError('Stock not found. Please check the ticker symbol.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrade = async () => {
    if (!stockPrice || !shares || shares <= 0) {
      setError('Please enter a valid number of shares');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const endpoint = tradeType === 'buy' ? '/trade/buy' : '/trade/sell';
      const response = await API.post(endpoint, {
        ticker: stockPrice.ticker,
        shares: parseFloat(shares),
      });

      setSuccess(`${tradeType.toUpperCase()} successful! New balance: $${response.data.balance.toFixed(2)}`);
      setShares('');
      setStockPrice(null);
      setSearchQuery('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || `${tradeType} failed. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const totalCost = stockPrice ? (parseFloat(shares) || 0) * parseFloat(stockPrice.price) : 0;
  const canAfford = totalCost <= user?.balance;

  return (
    <Container maxWidth="md" sx={{ paddingTop: 4, paddingBottom: 4 }}>
      <Typography variant="h4" sx={{ marginBottom: 4, fontWeight: 600 }}>
        Trade Stocks
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ marginBottom: 2 }}>
                Search Stock
              </Typography>

              <form onSubmit={handleSearch}>
                <TextField
                  fullWidth
                  label="Stock Ticker"
                  placeholder="e.g., AAPL"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={loading}
                  margin="normal"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  startIcon={<SearchIcon />}
                  sx={{
                    marginTop: 2,
                    backgroundColor: '#667eea',
                    '&:hover': { backgroundColor: '#764ba2' },
                  }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Search'}
                </Button>
              </form>

              {error && <Alert severity="error" sx={{ marginTop: 2 }}>{error}</Alert>}
            </CardContent>
          </Card>
        </Grid>

        {stockPrice && (
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ marginBottom: 2 }}>
                  Current Price
                </Typography>
                <Typography variant="h3" sx={{ marginBottom: 3 }}>
                  ${parseFloat(stockPrice.price).toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, marginBottom: 2 }}>
                  {stockPrice.ticker}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Last updated: {new Date(stockPrice.timestamp).toLocaleTimeString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {stockPrice && (
          <Grid item xs={12}>
            <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ marginBottom: 3 }}>
                  Execute Trade
                </Typography>

                <ButtonGroup fullWidth sx={{ marginBottom: 3 }}>
                  <Button
                    variant={tradeType === 'buy' ? 'contained' : 'outlined'}
                    onClick={() => setTradeType('buy')}
                    sx={{
                      backgroundColor: tradeType === 'buy' ? '#667eea' : 'transparent',
                      color: tradeType === 'buy' ? 'white' : '#667eea',
                    }}
                  >
                    BUY
                  </Button>
                  <Button
                    variant={tradeType === 'sell' ? 'contained' : 'outlined'}
                    onClick={() => setTradeType('sell')}
                    sx={{
                      backgroundColor: tradeType === 'sell' ? '#667eea' : 'transparent',
                      color: tradeType === 'sell' ? 'white' : '#667eea',
                    }}
                  >
                    SELL
                  </Button>
                </ButtonGroup>

                <TextField
                  fullWidth
                  label="Number of Shares"
                  type="number"
                  value={shares}
                  onChange={(e) => setShares(e.target.value)}
                  disabled={loading}
                  margin="normal"
                  inputProps={{ step: '0.01', min: '0' }}
                />

                <Box sx={{ backgroundColor: '#f5f5f5', padding: 2, borderRadius: 1, marginTop: 2, marginBottom: 2 }}>
                  <Typography variant="body2" sx={{ marginBottom: 1 }}>
                    Total {tradeType === 'buy' ? 'Cost' : 'Value'}: <strong>${totalCost.toFixed(2)}</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ marginBottom: 1, color: canAfford || tradeType === 'sell' ? '#666' : '#c33' }}>
                    Available Balance: <strong>${user?.balance.toFixed(2)}</strong>
                  </Typography>
                  {tradeType === 'buy' && !canAfford && (
                    <Typography variant="caption" sx={{ color: '#c33' }}>
                      ⚠️ Insufficient balance
                    </Typography>
                  )}
                </Box>

                {success && <Alert severity="success" sx={{ marginBottom: 2 }}>{success}</Alert>}
                {error && <Alert severity="error" sx={{ marginBottom: 2 }}>{error}</Alert>}

                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleTrade}
                  disabled={loading || !shares || (tradeType === 'buy' && !canAfford)}
                  sx={{
                    backgroundColor: tradeType === 'buy' ? '#28a745' : '#dc3545',
                    padding: '12px',
                    '&:hover': {
                      backgroundColor: tradeType === 'buy' ? '#20c997' : '#c82333',
                    },
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : `${tradeType.toUpperCase()} ${shares} ${stockPrice.ticker}`}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}
