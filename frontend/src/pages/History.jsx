import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Typography,
  CircularProgress,
  Box,
  Alert,
  Button,
  Divider,
  useTheme,
} from '@mui/material';
import API from '../api/axios';
import { currency, shares as fmtShares } from '../utils/format';

const PAGE_SIZE = 25;

/**
 * One trade. The type is stated in words and carried by the sign on the amount,
 * so a buy and a sell are distinguishable without relying on colour.
 */
function TransactionRow({ tx }) {
  const theme = useTheme();
  const isBuy = tx.type === 'BUY';
  const tone = isBuy ? theme.palette.success.main : theme.palette.error.main;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        py: 2,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography sx={{ fontWeight: 600 }}>{tx.ticker}</Typography>
          <Typography
            variant="caption"
            sx={{
              color: tone,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontSize: '0.68rem',
            }}
          >
            {isBuy ? 'Bought' : 'Sold'}
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
          {fmtShares(tx.shares)} @ {currency(tx.priceAtTime)}
        </Typography>
      </Box>

      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
        <Typography sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
          {isBuy ? '-' : '+'}{currency(tx.totalValue)}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {new Date(tx.timestamp).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </Typography>
      </Box>
    </Box>
  );
}

export default function History() {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  /**
   * The endpoint is paginated. The previous version fetched the first page only
   * and labelled its length as the total, so a user with 60 trades was told they
   * had 20 and had no way to reach the rest.
   */
  const loadPage = useCallback(async (offset) => {
    const res = await API.get('/portfolio/transactions', {
      params: { offset, limit: PAGE_SIZE },
    });
    const body = res.data;
    // Tolerate the bare-array shape in case this endpoint is ever un-paginated.
    if (Array.isArray(body)) {
      return { rows: body, total: body.length, hasMore: false };
    }
    return {
      rows: body.data ?? [],
      total: body.total ?? 0,
      hasMore: Boolean(body.hasMore),
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadPage(0)
      .then(({ rows, total: t, hasMore: more }) => {
        if (cancelled) return;
        setTransactions(rows);
        setTotal(t);
        setHasMore(more);
      })
      .catch(() => !cancelled && setError('Could not load your transaction history. Please try again.'))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [loadPage]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    setError('');
    try {
      const { rows, hasMore: more } = await loadPage(transactions.length);
      setTransactions((prev) => [...prev, ...rows]);
      setHasMore(more);
    } catch {
      setError('Could not load more transactions. Please try again.');
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 3, md: 5 } }}>
      <Typography
        variant="caption"
        sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em' }}
      >
        History
      </Typography>
      <Typography sx={{ fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.02em', mt: 0.5 }}>
        {total > 0 ? `${total} transaction${total === 1 ? '' : 's'}` : 'Transactions'}
      </Typography>

      {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}>
          <CircularProgress size={32} />
        </Box>
      ) : transactions.length === 0 ? (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography sx={{ fontWeight: 600, mb: 0.5 }}>No trades yet</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Once you buy or sell, every trade will be listed here.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ mt: 4 }}>
          <Divider />
          {transactions.map((tx, i) => (
            <React.Fragment key={tx.id}>
              {i > 0 && <Divider />}
              <TransactionRow tx={tx} />
            </React.Fragment>
          ))}
          <Divider />

          {hasMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button onClick={handleLoadMore} disabled={loadingMore}>
                {loadingMore
                  ? 'Loading…'
                  : `Show older (${total - transactions.length} remaining)`}
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
}
