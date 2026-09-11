import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment,
  IconButton,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { usePortfolio } from '../hooks/usePortfolio';
import PriceChart from '../components/PriceChart';
import API, { unwrapList, apiErrorMessage } from '../api/axios';
import { currency, shares as fmtShares } from '../utils/format';

const SEARCH_DEBOUNCE_MS = 300;

/** Label/value line used in the order summary. */
function SummaryLine({ label, value, strong }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 0.75 }}>
      <Typography variant="body2" sx={{ color: strong ? 'text.primary' : 'text.secondary' }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{ fontWeight: strong ? 600 : 500, fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export default function Trade() {
  const theme = useTheme();
  const { portfolio, refetch: refetchPortfolio } = usePortfolio(false);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const [side, setSide] = useState('buy');
  const [orderType, setOrderType] = useState('market');
  const [shareCount, setShareCount] = useState('');
  const [limitPrice, setLimitPrice] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pendingOrders, setPendingOrders] = useState([]);

  const successTimer = useRef(null);

  /** Show a transient confirmation, replacing any already on screen. */
  const flashSuccess = useCallback((text) => {
    setSuccess(text);
    clearTimeout(successTimer.current);
    successTimer.current = setTimeout(() => setSuccess(''), 5000);
  }, []);

  // Clearing the timer on unmount avoids setting state on a component that is
  // already gone if the user navigates away inside the five seconds.
  useEffect(() => () => clearTimeout(successTimer.current), []);

  const loadPendingOrders = useCallback(async () => {
    try {
      const res = await API.get('/orders/pending');
      setPendingOrders(unwrapList(res.data));
    } catch {
      /* the form still works without this list */
    }
  }, []);

  useEffect(() => { loadPendingOrders(); }, [loadPendingOrders]);

  /**
   * Debounced symbol search.
   *
   * Previously this fired a request on every keystroke, so typing "AAPL" cost
   * four round trips and the responses could arrive out of order.
   */
  useEffect(() => {
    const term = query.trim();
    if (!term) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const res = await API.get('/stocks/suggestions', { params: { q: term } });
        if (cancelled) return;
        setSuggestions(unwrapList(res.data));
        setShowSuggestions(true);
      } catch {
        if (!cancelled) setSuggestions([]);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => { cancelled = true; clearTimeout(timer); };
  }, [query]);

  useEffect(() => {
    if (!showSuggestions) return;
    const onClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [showSuggestions]);

  const loadQuote = async (ticker) => {
    setQuoteLoading(true);
    setError('');
    setQuote(null);
    try {
      const res = await API.get(`/stocks/${ticker}/price`);
      setQuote(res.data);
    } catch (err) {
      setError(apiErrorMessage(err, `Couldn't find a price for ${ticker}. Check the symbol and try again.`));
    } finally {
      setQuoteLoading(false);
    }
  };

  const selectTicker = (ticker) => {
    setQuery(ticker);
    setShowSuggestions(false);
    setSuggestions([]);
    loadQuote(ticker);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const term = query.trim().toUpperCase();
    if (term) { setShowSuggestions(false); loadQuote(term); }
  };

  const clearSelection = () => {
    setQuote(null);
    setQuery('');
    setShareCount('');
    setLimitPrice('');
    setError('');
  };

  // ---- derived order state -------------------------------------------------

  const buyingPower = Number(portfolio?.currentBalance ?? 0);
  const held = quote ? portfolio?.holdings?.find((h) => h.ticker === quote.ticker) : null;
  const heldShares = Number(held?.shares ?? 0);

  const qty = parseFloat(shareCount) || 0;
  const unitPrice = orderType === 'limit'
    ? (parseFloat(limitPrice) || 0)
    : Number(quote?.price ?? 0);
  const estimate = qty * unitPrice;

  /** The single reason the order cannot be placed, or null when it can. */
  const blocker = (() => {
    if (!quote) return null;
    if (qty <= 0) return 'Enter how many shares you want.';
    if (orderType === 'limit' && !(parseFloat(limitPrice) > 0)) return 'Enter a limit price.';
    if (side === 'buy' && orderType === 'market' && estimate > buyingPower) {
      return `That costs ${currency(estimate)} — more than your ${currency(buyingPower)} buying power.`;
    }
    if (side === 'sell') {
      if (!held) return `You don't own any ${quote.ticker}.`;
      if (qty > heldShares) return `You only own ${fmtShares(heldShares)} shares of ${quote.ticker}.`;
    }
    return null;
  })();

  const canSubmit = Boolean(quote) && !blocker && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      if (orderType === 'limit') {
        await API.post('/orders', {
          ticker: quote.ticker,
          type: side.toUpperCase(),
          shares: qty,
          limitPrice: parseFloat(limitPrice),
        });
        flashSuccess(
          `Limit ${side} placed: ${fmtShares(qty)} ${quote.ticker} at ${currency(limitPrice)}. `
          + `It will fill automatically when the price is reached.`
        );
        loadPendingOrders();
      } else {
        await API.post(side === 'buy' ? '/trade/buy' : '/trade/sell', {
          ticker: quote.ticker,
          shares: qty,
        });
        await refetchPortfolio();
        flashSuccess(
          `${side === 'buy' ? 'Bought' : 'Sold'} ${fmtShares(qty)} ${quote.ticker} `
          + `for ${currency(estimate)}.`
        );
      }
      clearSelection();
    } catch (err) {
      setError(apiErrorMessage(err, 'That order could not be placed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await API.delete(`/orders/${orderId}`);
      loadPendingOrders();
      flashSuccess('Order cancelled.');
    } catch (err) {
      setError(apiErrorMessage(err, 'That order could not be cancelled.'));
    }
  };

  const sideColor = side === 'buy' ? theme.palette.success.main : theme.palette.error.main;

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 3, md: 5 } }}>
      <Typography
        variant="caption"
        sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em' }}
      >
        Trade
      </Typography>
      <Typography sx={{ fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.02em', mt: 0.5, mb: 3 }}>
        {currency(buyingPower)} buying power
      </Typography>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Symbol search */}
      <Box ref={searchRef} sx={{ position: 'relative' }}>
        <form onSubmit={handleSearchSubmit}>
          <TextField
            fullWidth
            placeholder="Search a symbol, e.g. AAPL"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length && setShowSuggestions(true)}
            autoComplete="off"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.disabled', fontSize: '1.2rem' }} />
                </InputAdornment>
              ),
              endAdornment: quoteLoading ? (
                <InputAdornment position="end"><CircularProgress size={16} /></InputAdornment>
              ) : quote ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={clearSelection} aria-label="Clear selection">
                    <CloseIcon sx={{ fontSize: '1rem' }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        </form>

        {showSuggestions && suggestions.length > 0 && (
          <Paper
            elevation={4}
            sx={{ position: 'absolute', top: '100%', left: 0, right: 0, mt: 0.5, zIndex: 20, overflow: 'hidden' }}
          >
            <List disablePadding>
              {suggestions.slice(0, 6).map((s) => (
                <ListItemButton key={s.ticker} onClick={() => selectTicker(s.ticker)}>
                  <ListItemText
                    primary={s.ticker}
                    secondary={s.name}
                    primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
                    secondaryTypographyProps={{ fontSize: '0.78rem' }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        )}
      </Box>

      {/* Order ticket */}
      {quote && (
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 2 }}>
            <Typography sx={{ fontSize: '1.35rem', fontWeight: 600 }}>{quote.ticker}</Typography>
            <Typography sx={{ fontSize: '1.35rem', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {currency(quote.price)}
            </Typography>
          </Box>
          {heldShares > 0 && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              You own {fmtShares(heldShares)} shares
            </Typography>
          )}

          <Box sx={{ mt: 2 }}>
            <PriceChart ticker={quote.ticker} height={180} />
          </Box>

          <ToggleButtonGroup
            fullWidth
            exclusive
            value={side}
            onChange={(_, v) => v && setSide(v)}
            sx={{
              mt: 3,
              '& .MuiToggleButton-root.Mui-selected': {
                backgroundColor: `${sideColor}1A`,
                color: sideColor,
                borderColor: sideColor,
                '&:hover': { backgroundColor: `${sideColor}26` },
              },
            }}
          >
            <ToggleButton value="buy" sx={{ fontWeight: 600 }}>Buy</ToggleButton>
            <ToggleButton value="sell" sx={{ fontWeight: 600 }}>Sell</ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup
            fullWidth
            exclusive
            size="small"
            value={orderType}
            onChange={(_, v) => v && setOrderType(v)}
            sx={{ mt: 1.5 }}
          >
            <ToggleButton value="market">Market</ToggleButton>
            <ToggleButton value="limit">Limit</ToggleButton>
          </ToggleButtonGroup>

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <TextField
              label="Shares"
              type="number"
              value={shareCount}
              onChange={(e) => setShareCount(e.target.value)}
              inputProps={{ min: 0, step: 'any' }}
              fullWidth
            />
            {orderType === 'limit' && (
              <TextField
                label="Limit price"
                type="number"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                inputProps={{ min: 0, step: '0.01' }}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                fullWidth
              />
            )}
          </Box>

          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <SummaryLine
              label={orderType === 'limit' ? 'Limit price' : 'Market price'}
              value={unitPrice > 0 ? currency(unitPrice) : '—'}
            />
            <SummaryLine label="Shares" value={qty > 0 ? fmtShares(qty) : '—'} />
            <SummaryLine
              label={side === 'buy' ? 'Estimated cost' : 'Estimated proceeds'}
              value={estimate > 0 ? currency(estimate) : '—'}
              strong
            />
            {side === 'buy' && (
              <SummaryLine
                label="Buying power after"
                value={estimate > 0 ? currency(buyingPower - estimate) : currency(buyingPower)}
              />
            )}
          </Box>

          {blocker && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
              {blocker}
            </Typography>
          )}

          <Button
            fullWidth
            variant="contained"
            size="large"
            disableElevation
            disabled={!canSubmit}
            onClick={handleSubmit}
            sx={{
              mt: 2.5,
              py: 1.4,
              backgroundColor: sideColor,
              '&:hover': { backgroundColor: sideColor, filter: 'brightness(0.92)' },
            }}
          >
            {submitting
              ? 'Placing…'
              : orderType === 'limit'
                ? `Place limit ${side}`
                : `${side === 'buy' ? 'Buy' : 'Sell'} ${quote.ticker}`}
          </Button>

          {orderType === 'limit' && (
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1.5 }}>
              {side === 'buy'
                ? 'Fills automatically when the price falls to your limit or below.'
                : 'Fills automatically when the price rises to your limit or above.'}
            </Typography>
          )}
        </Box>
      )}

      {/* Open orders */}
      {pendingOrders.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '1.05rem', mb: 1 }}>
            Open orders
          </Typography>
          <Divider />
          {pendingOrders.map((order, i) => (
            <React.Fragment key={order.id}>
              {i > 0 && <Divider />}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, py: 2 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600 }}>
                    {order.type === 'BUY' ? 'Buy' : 'Sell'} {order.ticker}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
                    {fmtShares(order.shares)} shares at {currency(order.limitPrice)}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleCancelOrder(order.id)}
                  aria-label={`Cancel ${order.type} order for ${order.ticker}`}
                >
                  Cancel
                </Button>
              </Box>
            </React.Fragment>
          ))}
        </Box>
      )}
    </Container>
  );
}
