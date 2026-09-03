import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  ButtonGroup,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  LinearProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '../context/AuthContext';
import { usePortfolio } from '../hooks/usePortfolio';
import API, { unwrapList } from '../api/axios';

export default function Trade() {
  const { user } = useAuth();
  const { portfolio, refetch: refetchPortfolio } = usePortfolio(false); // No auto-refresh, manual refresh after trade
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);
  const [stockPrice, setStockPrice] = useState(null);
  const [shares, setShares] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tradeType, setTradeType] = useState('buy');
  const [orderType, setOrderType] = useState('market');
  const [limitPrice, setLimitPrice] = useState('');
  const [pendingOrders, setPendingOrders] = useState([]);

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSuggestions]);

  const fetchSuggestions = async () => {
    try {
      const response = await API.get(`/stocks/suggestions?q=${searchQuery}`);
      setSuggestions(response.data);
      setShowSuggestions(true);
    } catch (err) {
      setSuggestions([]);
    }
  };

  const handleSelectStock = async (ticker) => {
    setSearchQuery(ticker);
    setShowSuggestions(false);
    setSuggestions([]);
    fetchStockPrice(ticker);
  };

  const fetchStockPrice = async (ticker) => {
    setLoading(true);
    setError('');
    setStockPrice(null);

    try {
      const response = await API.get(`/stocks/${ticker}/price`);
      setStockPrice(response.data);
    } catch (err) {
      setError('Unable to fetch stock price. Please try another ticker.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSuggestions(false);
    fetchStockPrice(searchQuery.toUpperCase());
  };

  const handleTrade = async () => {
    if (!stockPrice || !shares || parseFloat(shares) <= 0) {
      setError('Please enter a valid number of shares');
      return;
    }

    const sharesNum = parseFloat(shares);

    if (orderType === 'limit' && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      setError('Please enter a valid limit price');
      return;
    }

    const totalCost = sharesNum * parseFloat(stockPrice.price);

    // Validation logic for market orders only
    if (orderType === 'market') {
      if (tradeType === 'buy') {
        if (totalCost > portfolio?.currentBalance) {
          setError(`Insufficient buying power. Required: $${totalCost.toFixed(2)}, Available: $${portfolio?.currentBalance?.toFixed(2)}`);
          return;
        }
      } else {
        // For sell
        const holding = portfolio?.holdings?.find(h => h.ticker === stockPrice.ticker);
        if (!holding) {
          setError(`You don't own any shares of ${stockPrice.ticker}`);
          return;
        }
        if (sharesNum > parseFloat(holding.shares)) {
          setError(`You only own ${parseFloat(holding.shares).toFixed(2)} shares of ${stockPrice.ticker}`);
          return;
        }
      }
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (orderType === 'limit') {
        // Create limit order
        await API.post('/orders', {
          ticker: stockPrice.ticker,
          type: tradeType.toUpperCase(),
          shares: sharesNum,
          limitPrice: parseFloat(limitPrice),
        });
        setSuccess(`Limit ${tradeType.toUpperCase()} order created!`);
        fetchPendingOrders();
      } else {
        // Market order
        const endpoint = tradeType === 'buy' ? '/trade/buy' : '/trade/sell';
        const response = await API.post(endpoint, {
          ticker: stockPrice.ticker,
          shares: sharesNum,
        });

        // Refetch portfolio to update all values
        await refetchPortfolio();

        setSuccess(`${tradeType.toUpperCase()} successful! New balance: $${response.data.balance.toFixed(2)}`);
      }

      setShares('');
      setLimitPrice('');
      setStockPrice(null);
      setSearchQuery('');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.error || `Order failed. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingOrders = async () => {
    try {
      const response = await API.get('/orders/pending');
      setPendingOrders(unwrapList(response.data));
    } catch (err) {
      console.error('Failed to fetch pending orders:', err);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await API.delete(`/orders/${orderId}`);
      fetchPendingOrders();
      setSuccess('Order cancelled');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to cancel order');
    }
  };

  const totalCost = stockPrice && shares ? (parseFloat(shares) || 0) * parseFloat(stockPrice.price) : 0;
  const currentBalance = portfolio?.currentBalance || user?.balance || 0;
  const canAfford = totalCost <= currentBalance;
  const buyingPower = currentBalance;

  // For sell, check if user owns enough shares
  const userHolding = stockPrice ? portfolio?.holdings?.find(h => h.ticker === stockPrice.ticker) : null;
  const canSell = userHolding && parseFloat(shares) <= parseFloat(userHolding.shares);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box sx={{ flex: 1, width: '100%', paddingX: 2, paddingY: 4 }}>
        <Box sx={{ textAlign: 'center', marginBottom: 5, maxWidth: '1200px', marginX: 'auto', width: '100%' }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary', marginBottom: 1 }}>
            Trade Stocks
          </Typography>
          <Typography variant="body1" sx={{ color: '#666' }}>
            Search for a stock and make your trade
          </Typography>
        </Box>

        <Card
          elevation={0}
          sx={{
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            borderRadius: '16px',
            border: '1px solid rgba(0,0,0,0.04)',
            marginBottom: 4,
            overflow: 'visible',
            maxWidth: '1200px',
            marginX: 'auto',
            width: '100%',
          }}
        >
          <CardContent sx={{ padding: 4 }}>
            <Typography variant="h6" sx={{ marginBottom: 3, fontWeight: 700 }}>
              Find Your Stock
            </Typography>

            <Box sx={{ position: 'relative' }} ref={searchContainerRef}>
              <form onSubmit={handleSearch}>
                <TextField
                  fullWidth
                  label="Stock Ticker or Company Name"
                  placeholder="e.g., AAPL, Apple, GOOGL"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={loading}
                  variant="outlined"
                  sx={{
                    marginBottom: showSuggestions && suggestions.length > 0 ? 0 : 2,
                    '& .MuiOutlinedInput-root': {
                      fontSize: '16px',
                    },
                  }}
                />
                {showSuggestions && suggestions.length > 0 && (
                  <Paper
                    elevation={2}
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 10,
                      maxHeight: '300px',
                      overflow: 'auto',
                      marginTop: 1,
                      borderRadius: '12px',
                    }}
                  >
                    <List sx={{ padding: 0 }}>
                      {suggestions.map((stock) => (
                        <ListItemButton
                          key={stock.ticker}
                          onClick={() => handleSelectStock(stock.ticker)}
                          sx={{
                            padding: '12px 16px',
                            borderBottom: '1px solid rgba(0,0,0,0.04)',
                            '&:last-child': {
                              borderBottom: 'none',
                            },
                            '&:hover': {
                              backgroundColor: '#f0f7ff',
                            },
                          }}
                        >
                          <ListItemText
                            primary={stock.ticker}
                            secondary={stock.name}
                            primaryTypographyProps={{ sx: { fontWeight: 600, color: '#05a854' } }}
                            secondaryTypographyProps={{ sx: { color: '#666' } }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Paper>
                )}
              </form>

              <Button
                onClick={handleSearch}
                fullWidth
                variant="contained"
                startIcon={<SearchIcon />}
                disabled={loading || !searchQuery.trim()}
                sx={{
                  marginTop: 2,
                  padding: '14px',
                  fontSize: '16px',
                  fontWeight: 600,
                  backgroundColor: '#05a854',
                  borderRadius: '10px',
                  boxShadow: '0 4px 12px rgba(5, 168, 84, 0.2)',
                  '&:hover': {
                    backgroundColor: '#0d8f47',
                    boxShadow: '0 6px 16px rgba(5, 168, 84, 0.3)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Search'}
              </Button>
            </Box>

            {error && <Alert severity="error" sx={{ marginTop: 2 }}>{error}</Alert>}
          </CardContent>
        </Card>

        {stockPrice && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, marginBottom: 4, maxWidth: '1200px', marginX: 'auto', width: '100%' }}>
            <Card
              elevation={0}
              sx={{
                background: 'linear-gradient(135deg, #1f3a5f 0%, #2a5298 100%)',
                color: 'white',
                boxShadow: '0 12px 32px rgba(31, 58, 95, 0.25)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 16px 40px rgba(31, 58, 95, 0.35)',
                },
              }}
            >
              <CardContent sx={{ padding: 3 }}>
                <Typography variant="body2" sx={{ opacity: 0.85, marginBottom: 1, fontWeight: 500 }}>
                  Current Price
                </Typography>
                <Typography variant="h2" sx={{ marginBottom: 2, fontWeight: 700 }}>
                  ${parseFloat(stockPrice.price).toFixed(2)}
                </Typography>
                <Typography variant="h5" sx={{ opacity: 0.95, marginBottom: 1, fontWeight: 700 }}>
                  {stockPrice.ticker}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.75 }}>
                  Updated: {new Date(stockPrice.timestamp).toLocaleTimeString()}
                </Typography>
              </CardContent>
            </Card>

            <Card
              elevation={0}
              sx={{
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                borderRadius: '16px',
                border: '1px solid rgba(0,0,0,0.04)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                },
              }}
            >
              <CardContent sx={{ padding: 3 }}>
                <Typography variant="h6" sx={{ marginBottom: 3, fontWeight: 700 }}>
                  Execute Trade
                </Typography>

                <ButtonGroup fullWidth sx={{ marginBottom: 3 }}>
                  <Button
                    variant={tradeType === 'buy' ? 'contained' : 'outlined'}
                    onClick={() => setTradeType('buy')}
                    sx={{
                      padding: '12px',
                      fontWeight: 700,
                      fontSize: '15px',
                      backgroundColor: tradeType === 'buy' ? '#05a854' : 'transparent',
                      color: tradeType === 'buy' ? 'white' : '#05a854',
                      borderColor: '#05a854',
                      borderRadius: '10px',
                      '&:hover': {
                        backgroundColor: tradeType === 'buy' ? '#0d8f47' : 'rgba(5, 168, 84, 0.05)',
                      },
                    }}
                  >
                    BUY
                  </Button>
                  <Button
                    variant={tradeType === 'sell' ? 'contained' : 'outlined'}
                    onClick={() => setTradeType('sell')}
                    sx={{
                      padding: '12px',
                      fontWeight: 700,
                      fontSize: '15px',
                      backgroundColor: tradeType === 'sell' ? '#d32f2f' : 'transparent',
                      color: tradeType === 'sell' ? 'white' : '#d32f2f',
                      borderColor: '#d32f2f',
                      borderRadius: '10px',
                      '&:hover': {
                        backgroundColor: tradeType === 'sell' ? '#b71c1c' : 'rgba(211, 47, 47, 0.05)',
                      },
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
                  variant="outlined"
                  margin="normal"
                  inputProps={{ step: '0.01', min: '0' }}
                  sx={{ marginBottom: 2 }}
                />

                <Box sx={{ marginBottom: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, marginBottom: 1 }}>
                    Order Type
                  </Typography>
                  <ButtonGroup fullWidth size="small">
                    <Button
                      variant={orderType === 'market' ? 'contained' : 'outlined'}
                      onClick={() => setOrderType('market')}
                      sx={{
                        backgroundColor: orderType === 'market' ? '#05a854' : 'transparent',
                        color: orderType === 'market' ? 'white' : '#05a854',
                        borderColor: '#05a854',
                      }}
                    >
                      Market
                    </Button>
                    <Button
                      variant={orderType === 'limit' ? 'contained' : 'outlined'}
                      onClick={() => setOrderType('limit')}
                      sx={{
                        backgroundColor: orderType === 'limit' ? '#05a854' : 'transparent',
                        color: orderType === 'limit' ? 'white' : '#05a854',
                        borderColor: '#05a854',
                      }}
                    >
                      Limit
                    </Button>
                  </ButtonGroup>
                </Box>

                {orderType === 'limit' && (
                  <TextField
                    fullWidth
                    label="Limit Price"
                    type="number"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    disabled={loading}
                    variant="outlined"
                    margin="normal"
                    inputProps={{ step: '0.01', min: '0' }}
                    sx={{ marginBottom: 2 }}
                  />
                )}
              </CardContent>
            </Card>
          </Box>
        )}

        {stockPrice && (
          <Card
            elevation={0}
            sx={{
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              borderRadius: '16px',
              border: '1px solid rgba(0,0,0,0.04)',
              marginBottom: 4,
              maxWidth: '1200px',
              marginX: 'auto',
              width: '100%',
            }}
          >
            <CardContent sx={{ padding: 4 }}>
              <Box sx={{ backgroundColor: 'rgba(0,0,0,0.02)', padding: 3, borderRadius: '12px', marginBottom: 3, border: '1px solid rgba(0,0,0,0.08)' }}>
                <Box sx={{ marginBottom: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {tradeType === 'buy' ? 'Buying Power' : 'Shares Held'}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#05a854' }}>
                      {tradeType === 'buy' ? `$${buyingPower.toFixed(2)}` : (userHolding ? parseFloat(userHolding.shares).toFixed(2) : '0.00')}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={
                      tradeType === 'buy'
                        ? Math.min(100, (totalCost / buyingPower) * 100 || 0)
                        : Math.min(100, (parseFloat(shares || 0) / parseFloat(userHolding?.shares || 1)) * 100 || 0)
                    }
                    sx={{
                      height: 8,
                      borderRadius: '4px',
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: totalCost > buyingPower && tradeType === 'buy' ? '#d32f2f' : '#05a854',
                      },
                    }}
                  />
                </Box>

                <Typography variant="body1" sx={{ marginBottom: 2, fontSize: '16px' }}>
                  <strong>Total {tradeType === 'buy' ? 'Cost' : 'Value'}:</strong> <span style={{ color: '#05a854', fontWeight: 700 }}>${totalCost.toFixed(2)}</span>
                </Typography>

                {tradeType === 'buy' && (
                  <>
                    <Typography variant="body2" sx={{ marginBottom: 1, color: canAfford ? 'text.secondary' : '#d32f2f', fontWeight: canAfford ? 400 : 600 }}>
                      Available Cash: <strong>${buyingPower.toFixed(2)}</strong>
                    </Typography>
                    {!canAfford && (
                      <Alert severity="error" sx={{ marginTop: 1 }}>
                        Insufficient buying power. You need ${(totalCost - buyingPower).toFixed(2)} more.
                      </Alert>
                    )}
                  </>
                )}

                {tradeType === 'sell' && (
                  <>
                    <Typography variant="body2" sx={{ marginBottom: 1, color: 'text.secondary' }}>
                      You own: <strong>{userHolding ? parseFloat(userHolding.shares).toFixed(2) : '0.00'}</strong> shares
                    </Typography>
                    {!canSell && userHolding && (
                      <Alert severity="error" sx={{ marginTop: 1 }}>
                        You can only sell {parseFloat(userHolding.shares).toFixed(2)} shares.
                      </Alert>
                    )}
                  </>
                )}
              </Box>

              {success && <Alert severity="success" sx={{ marginBottom: 2 }}>{success}</Alert>}
              {error && <Alert severity="error" sx={{ marginBottom: 2 }}>{error}</Alert>}

              <Button
                fullWidth
                variant="contained"
                onClick={handleTrade}
                disabled={loading || !shares || parseFloat(shares) <= 0 || (tradeType === 'buy' && !canAfford) || (tradeType === 'sell' && !canSell)}
                sx={{
                  backgroundColor: tradeType === 'buy' ? '#05a854' : '#d32f2f',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: 700,
                  borderRadius: '10px',
                  boxShadow: tradeType === 'buy' ? '0 6px 16px rgba(5, 168, 84, 0.25)' : '0 6px 16px rgba(211, 47, 47, 0.25)',
                  '&:hover:not(:disabled)': {
                    backgroundColor: tradeType === 'buy' ? '#0d8f47' : '#b71c1c',
                    boxShadow: tradeType === 'buy' ? '0 8px 20px rgba(5, 168, 84, 0.35)' : '0 8px 20px rgba(211, 47, 47, 0.35)',
                    transform: 'translateY(-2px)',
                  },
                  '&:disabled': {
                    opacity: 0.5,
                    cursor: 'not-allowed',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : `${tradeType.toUpperCase()} ${shares || '0'} ${stockPrice?.ticker || 'Shares'}`}
              </Button>
            </CardContent>
          </Card>
        )}

        {pendingOrders.length > 0 && (
          <Card
            elevation={0}
            sx={{
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              borderRadius: '16px',
              border: '1px solid rgba(0,0,0,0.04)',
              maxWidth: '1200px',
              marginX: 'auto',
              width: '100%',
            }}
          >
            <CardContent sx={{ padding: 3 }}>
              <Typography variant="h6" sx={{ marginBottom: 3, fontWeight: 700 }}>
                Pending Limit Orders ({pendingOrders.length})
              </Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', paddingBottom: '8px', fontWeight: 600 }}>Ticker</th>
                      <th style={{ textAlign: 'right', paddingBottom: '8px', fontWeight: 600 }}>Type</th>
                      <th style={{ textAlign: 'right', paddingBottom: '8px', fontWeight: 600 }}>Shares</th>
                      <th style={{ textAlign: 'right', paddingBottom: '8px', fontWeight: 600 }}>Limit Price</th>
                      <th style={{ textAlign: 'center', paddingBottom: '8px', fontWeight: 600 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingOrders.map((order) => (
                      <tr key={order.id} style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                        <td style={{ padding: '12px 0' }}>
                          <Chip label={order.ticker} size="small" sx={{ fontWeight: 600 }} />
                        </td>
                        <td style={{ textAlign: 'right', padding: '12px 0' }}>
                          <Chip
                            label={order.type}
                            size="small"
                            sx={{
                              backgroundColor: order.type === 'BUY' ? 'rgba(5, 168, 84, 0.2)' : 'rgba(211, 47, 47, 0.2)',
                              color: order.type === 'BUY' ? '#05a854' : '#d32f2f',
                            }}
                          />
                        </td>
                        <td style={{ textAlign: 'right', padding: '12px 0' }}>{parseFloat(order.shares).toFixed(2)}</td>
                        <td style={{ textAlign: 'right', padding: '12px 0' }}>${parseFloat(order.limitPrice).toFixed(2)}</td>
                        <td style={{ textAlign: 'center', padding: '12px 0' }}>
                          <Button size="small" color="error" onClick={() => handleCancelOrder(order.id)}>
                            Cancel
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
}
