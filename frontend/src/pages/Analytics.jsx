import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Tooltip,
  useTheme,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import API from '../api/axios';
import { currency, currencyAbs, percentAbs } from '../utils/format';

function Stat({ label, value, tone, hint }) {
  const theme = useTheme();
  const color =
    tone === 'up' ? theme.palette.success.main
    : tone === 'down' ? theme.palette.error.main
    : 'text.primary';

  return (
    <Box sx={{ minWidth: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontSize: '0.7rem',
          }}
        >
          {label}
        </Typography>
        {hint && (
          <Tooltip title={hint} arrow>
            <InfoOutlinedIcon sx={{ fontSize: '0.85rem', color: 'text.disabled', cursor: 'help' }} />
          </Tooltip>
        )}
      </Box>
      <Typography
        sx={{
          fontSize: '1.3rem',
          fontWeight: 600,
          color,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.01em',
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

/** One ticker in the performance list. */
function PerformerRow({ stock }) {
  const theme = useTheme();
  const gain = Number(stock.gainLoss ?? 0);
  const up = gain >= 0;
  const tone = up ? theme.palette.success.main : theme.palette.error.main;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, py: 1.75 }}>
      <Typography sx={{ fontWeight: 600 }}>{stock.ticker}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, color: tone }}>
        {up ? <ArrowUpwardIcon sx={{ fontSize: '0.85rem' }} /> : <ArrowDownwardIcon sx={{ fontSize: '0.85rem' }} />}
        <Typography sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
          {currencyAbs(gain)}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', ml: 0.75, fontVariantNumeric: 'tabular-nums' }}>
          {up ? '+' : '-'}{percentAbs(stock.gainLossPercent)}
        </Typography>
      </Box>
    </Box>
  );
}

export default function Analytics() {
  const theme = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    API.get('/analytics/stats')
      .then((res) => !cancelled && setStats(res.data))
      .catch(() => !cancelled && setError('Could not load your analytics. Please try again.'))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', pt: 12 }}>
        <CircularProgress size={32} />
      </Container>
    );
  }

  const upCount = stats?.winningTrades ?? 0;
  const downCount = stats?.losingTrades ?? 0;
  const measured = stats?.totalTrades ?? 0;
  const rate = Number(stats?.winRate ?? 0);
  const strong = rate >= 50;

  // Every label on this page says "position", not "trade", because that is what
  // the backend actually measures: it iterates current holdings and their
  // unrealized profit. Anything already sold is not counted. Calling these
  // "trades" would overstate what the numbers mean.
  const scopeNote =
    'Calculated from positions you currently hold, using unrealized profit and loss. '
    + 'Closed positions are not included yet.';

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 3, md: 5 } }}>
      <Typography
        variant="caption"
        sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em' }}
      >
        Open positions
      </Typography>

      {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}

      {!error && measured === 0 && (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Nothing to measure yet</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Once you hold positions that have moved in price, their performance appears here.
          </Typography>
        </Box>
      )}

      {!error && measured > 0 && (
        <>
          <Typography
            sx={{
              fontSize: { xs: '2.5rem', md: '3.25rem' },
              fontWeight: 600,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              mt: 0.5,
              fontVariantNumeric: 'tabular-nums',
              color: strong ? theme.palette.success.main : theme.palette.error.main,
            }}
          >
            {rate.toFixed(0)}%
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            of your {measured} open position{measured === 1 ? '' : 's'}{' '}
            {measured === 1 ? 'is' : 'are'} in profit
          </Typography>

          {/* A single bar is enough to show the split — two numbers do not need a chart. */}
          <Box sx={{ display: 'flex', gap: '2px', mt: 3, height: 8 }}>
            {upCount > 0 && (
              <Box
                sx={{
                  flex: upCount,
                  backgroundColor: theme.palette.success.main,
                  borderRadius: downCount ? '4px 0 0 4px' : '4px',
                }}
              />
            )}
            {downCount > 0 && (
              <Box
                sx={{
                  flex: downCount,
                  backgroundColor: theme.palette.error.main,
                  borderRadius: upCount ? '0 4px 4px 0' : '4px',
                }}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {upCount} up
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {downCount} down
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
              gap: 3,
              mt: 5,
              pt: 3,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Stat
              label="Avg gain"
              value={currency(stats.avgGainPerTrade)}
              tone="up"
              hint={`Average unrealized gain across positions currently up. ${scopeNote}`}
            />
            <Stat
              label="Avg loss"
              value={currencyAbs(stats.avgLossPerTrade)}
              tone="down"
              hint={`Average unrealized loss across positions currently down. ${scopeNote}`}
            />
            <Stat label="Best" value={currency(stats.largestWin)} tone="up" />
            <Stat label="Worst" value={currencyAbs(stats.largestLoss)} tone="down" />
          </Box>

          {stats.bestPerformers?.length > 0 && (
            <>
              <Typography sx={{ fontWeight: 600, fontSize: '1.05rem', mt: 6, mb: 1 }}>
                Leading
              </Typography>
              <Divider />
              {stats.bestPerformers.map((s, i) => (
                <React.Fragment key={s.ticker}>
                  {i > 0 && <Divider />}
                  <PerformerRow stock={s} />
                </React.Fragment>
              ))}
            </>
          )}

          {stats.worstPerformers?.length > 0 && (
            <>
              <Typography sx={{ fontWeight: 600, fontSize: '1.05rem', mt: 5, mb: 1 }}>
                Lagging
              </Typography>
              <Divider />
              {stats.worstPerformers.map((s, i) => (
                <React.Fragment key={s.ticker}>
                  {i > 0 && <Divider />}
                  <PerformerRow stock={s} />
                </React.Fragment>
              ))}
            </>
          )}

          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', display: 'block', mt: 5, lineHeight: 1.6 }}
          >
            {scopeNote}
          </Typography>
        </>
      )}
    </Container>
  );
}
