import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  CircularProgress,
  useTheme,
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import API, { unwrapList } from '../api/axios';
import { currency, currencyAbs, percentAbs, shares as fmtShares } from '../utils/format';

/**
 * The transactions endpoint is paginated and has no per-ticker filter, so this
 * pulls the largest page the API allows and filters client-side. For an account
 * with more than this many trades the older ones for a given stock will not
 * appear; a dedicated /transactions?ticker= filter is the real fix.
 */
const TRANSACTION_FETCH_LIMIT = 100;

function Metric({ label, value, tone }) {
  const theme = useTheme();
  const color =
    tone === 'up' ? theme.palette.success.main
    : tone === 'down' ? theme.palette.error.main
    : 'text.primary';

  return (
    <Box>
      <Typography
        variant="caption"
        sx={{
          color: 'text.secondary',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontSize: '0.68rem',
          display: 'block',
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontSize: '1.15rem', fontWeight: 600, color, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Typography>
    </Box>
  );
}

export default function StockDetailsModal({ open, ticker, onClose }) {
  const theme = useTheme();
  const [holding, setHolding] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !ticker) return;

    // Reset before fetching. Without this, reopening the dialog for a different
    // ticker showed the previous stock's figures until the new request landed,
    // because loading was never set back to true.
    setLoading(true);
    setHolding(null);
    setTransactions([]);

    let cancelled = false;
    Promise.all([
      API.get('/portfolio'),
      API.get('/portfolio/transactions', { params: { offset: 0, limit: TRANSACTION_FETCH_LIMIT } }),
    ])
      .then(([portfolioRes, txRes]) => {
        if (cancelled) return;
        setHolding(portfolioRes.data.holdings?.find((h) => h.ticker === ticker) ?? null);
        setTransactions(unwrapList(txRes.data).filter((tx) => tx.ticker === ticker));
      })
      .catch(() => { /* the dialog renders its empty state */ })
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [open, ticker]);

  if (!open) return null;

  const gain = Number(holding?.gainLoss ?? 0);
  const up = gain >= 0;
  const tone = up ? theme.palette.success.main : theme.palette.error.main;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, fontSize: '1.2rem', pb: 1 }}>{ticker}</DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={28} />
          </Box>
        ) : !holding ? (
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 5 }}>
            You don't hold any {ticker}.
          </Typography>
        ) : (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
              <Typography sx={{ fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                {currency(holding.currentPrice)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, color: tone }}>
                {up ? <ArrowUpwardIcon sx={{ fontSize: '0.9rem' }} /> : <ArrowDownwardIcon sx={{ fontSize: '0.9rem' }} />}
                <Typography sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                  {currencyAbs(gain)} ({percentAbs(holding.gainLossPercent)})
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 2.5,
                mt: 3,
                pt: 2.5,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Metric label="Shares" value={fmtShares(holding.shares)} />
              <Metric label="Avg cost" value={currency(holding.avgCostPerShare)} />
              <Metric label="Value" value={currency(holding.currentValue)} />
            </Box>

            <Typography sx={{ fontWeight: 600, mt: 4, mb: 1 }}>Your trades</Typography>
            <Divider />
            {transactions.length > 0 ? (
              transactions.map((tx, i) => {
                const isBuy = tx.type === 'BUY';
                return (
                  <React.Fragment key={tx.id}>
                    {i > 0 && <Divider />}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 1.5 }}>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: isBuy ? theme.palette.success.main : theme.palette.error.main }}
                        >
                          {isBuy ? 'Bought' : 'Sold'} {fmtShares(tx.shares)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {new Date(tx.timestamp).toLocaleString(undefined, {
                            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                          })}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                          {isBuy ? '-' : '+'}{currency(tx.totalValue)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
                          @ {currency(tx.priceAtTime)}
                        </Typography>
                      </Box>
                    </Box>
                  </React.Fragment>
                );
              })
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary', py: 2.5 }}>
                No recorded trades for {ticker}.
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
