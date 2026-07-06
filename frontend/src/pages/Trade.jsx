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
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa', paddingTop: 4, paddingBottom: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ marginBottom: 4, fontWeight: 700, color: '#1a1a1a' }}>
          Trade Stocks
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ marginBottom: 3, fontWeight: 700 }}>
                  Search Stocks
                </Typography>

                <form onSubmit={handleSearch}>
                  <TextField
                    fullWidth
                    label="Stock Ticker"
                    placeholder="e.g., AAPL, GOOGL, MSFT"
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
                      backgroundColor: '#05a854',
                      '&:hover': { backgroundColor: '#0d8f47' },
                    }}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Search'}
                  </Button>
                </form>

                {error && <Alert severity="error" sx={{ marginTop: 2 }}>{error}</Alert>}
              </CardContent>
            </Card>
          </Grid>

          {stockPrice && (
            <Grid item xs={12} md={6}>
              <Card
                elevation={0}
                sx={{
                  background: 'linear-gradient(135deg, #1f3a5f 0%, #2a5298 100%)',
                  color: 'white',
                  boxShadow: '0 8px 24px rgba(31, 58, 95, 0.2)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <CardContent>
                  <Typography variant="body2" sx={{ opacity: 0.85, marginBottom: 1, fontWeight: 500 }}>
                    Current Price
                  </Typography>
                  <Typography variant="h3" sx={{ marginBottom: 3, fontWeight: 700 }}>
                    ${parseFloat(stockPrice.price).toFixed(2)}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.95, marginBottom: 2, fontWeight: 600 }}>
                    {stockPrice.ticker}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.75 }}>
                    Last updated: {new Date(stockPrice.timestamp).toLocaleTimeString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {stockPrice && (
            <Grid item xs={12}>
              <Card elevation={0} sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ marginBottom: 3, fontWeight: 700 }}>
                    Execute Trade
                  </Typography>

                  <ButtonGroup fullWidth sx={{ marginBottom: 3 }}>
                    <Button
                      variant={tradeType === 'buy' ? 'contained' : 'outlined'}
                      onClick={() => setTradeType('buy')}
                      sx={{
                        backgroundColor: tradeType === 'buy' ? '#05a854' : 'transparent',
                        color: tradeType === 'buy' ? 'white' : '#05a854',
                        borderColor: '#05a854',
                        fontWeight: 600,
                      }}
                    >
                      BUY
                    </Button>
                    <Button
                      variant={tradeType === 'sell' ? 'contained' : 'outlined'}
                      onClick={() => setTradeType('sell')}
                      sx={{
                        backgroundColor: tradeType === 'sell' ? '#d32f2f' : 'transparent',
                        color: tradeType === 'sell' ? 'white' : '#d32f2f',
                        borderColor: '#d32f2f',
                        fontWeight: 600,
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

                  <Box sx={{ backgroundColor: '#f8f9fa', padding: 2, borderRadius: 2, marginTop: 2, marginBottom: 2, border: '1px solid rgba(0,0,0,0.04)' }}>
                    <Typography variant="body2" sx={{ marginBottom: 1 }}>
                      Total {tradeType === 'buy' ? 'Cost' : 'Value'}: <strong>${totalCost.toFixed(2)}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ marginBottom: 1, color: canAfford || tradeType === 'sell' ? '#666' : '#d32f2f' }}>
                      Available Balance: <strong>${user?.balance.toFixed(2)}</strong>
                    </Typography>
                    {tradeType === 'buy' && !canAfford && (
                      <Typography variant="caption" sx={{ color: '#d32f2f', fontWeight: 500 }}>
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
                      backgroundColor: tradeType === 'buy' ? '#05a854' : '#d32f2f',
                      padding: '12px',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: tradeType === 'buy' ? '#0d8f47' : '#b71c1c',
                      },
                    }}
                  >
                    {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : `${tradeType.toUpperCase()} ${shares} ${stockPrice.ticker}`}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
}
