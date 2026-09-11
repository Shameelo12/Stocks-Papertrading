import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Container,
  Box,
  Button,
  Divider,
  CircularProgress,
  Alert,
  useTheme,
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useAuth } from '../context/AuthContext';
import { usePortfolio } from '../hooks/usePortfolio';
import { currency, currencyAbs, percentAbs, shares as fmtShares } from '../utils/format';

/** One figure in the summary row. Label above, value below, nothing else. */
function Stat({ label, value, tone }) {
  const theme = useTheme();
  const color =
    tone === 'up' ? theme.palette.success.main
    : tone === 'down' ? theme.palette.error.main
    : 'text.primary';

  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="caption"
        sx={{
          color: 'text.secondary',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontSize: '0.7rem',
          display: 'block',
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: '1.35rem',
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

/** One position. Ticker and share count on the left, value and return on the right. */
function HoldingRow({ holding, onClick }) {
  const theme = useTheme();
  const gain = Number(holding.gainLoss ?? 0);
  const up = gain >= 0;
  const tone = up ? theme.palette.success.main : theme.palette.error.main;

  return (
    <Box
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick?.()}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        py: 2,
        px: 1,
        mx: -1,
        borderRadius: 1,
        cursor: 'pointer',
        transition: 'background-color 0.15s ease',
        '&:hover': { backgroundColor: 'action.hover' },
        '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 600, fontSize: '1rem', letterSpacing: '0.01em' }}>
          {holding.ticker}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
          {fmtShares(holding.shares)} shares · avg {currency(holding.avgCostPerShare)}
        </Typography>
      </Box>

      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
        <Typography sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
          {currency(holding.currentValue)}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, justifyContent: 'flex-end', color: tone }}>
          {up
            ? <ArrowUpwardIcon sx={{ fontSize: '0.85rem' }} />
            : <ArrowDownwardIcon sx={{ fontSize: '0.85rem' }} />}
          <Typography variant="caption" sx={{ fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
            {currencyAbs(gain)} ({percentAbs(holding.gainLossPercent)})
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const { portfolio, loading, error } = usePortfolio(15000);

  if (loading && !portfolio) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', pt: 12 }}>
        <CircularProgress size={32} />
      </Container>
    );
  }

  const gain = Number(portfolio?.totalGainLoss ?? 0);
  const up = gain >= 0;
  const tone = up ? theme.palette.success.main : theme.palette.error.main;
  const holdings = portfolio?.holdings ?? [];

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Typography variant="caption" sx={{ color: 'text.secondary', letterSpacing: '0.04em' }}>
        {user?.email?.split('@')[0]}
      </Typography>

      {/* The hero figure. Everything else on this page is secondary to it. */}
      <Typography
        sx={{
          fontSize: { xs: '2.75rem', md: '3.5rem' },
          fontWeight: 600,
          letterSpacing: '-0.03em',
          lineHeight: 1.05,
          mt: 0.5,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {currency(portfolio?.totalPortfolioValue)}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: tone, mt: 1 }}>
        {up ? <ArrowUpwardIcon sx={{ fontSize: '1rem' }} /> : <ArrowDownwardIcon sx={{ fontSize: '1rem' }} />}
        <Typography sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
          {currencyAbs(gain)} ({percentAbs(portfolio?.totalGainLossPercent)})
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', ml: 0.5 }}>
          all time
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' },
          gap: 3,
          mt: 5,
          pt: 3,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stat label="Buying power" value={currency(portfolio?.currentBalance)} />
        <Stat label="Invested" value={currency(portfolio?.investedBalance)} />
        <Stat label="Positions" value={holdings.length} />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 6, mb: 1 }}>
        <Typography sx={{ fontWeight: 600, fontSize: '1.05rem' }}>Positions</Typography>
        <Button size="small" onClick={() => navigate('/trade')} sx={{ fontWeight: 600 }}>
          Trade
        </Button>
      </Box>
      <Divider />

      {holdings.length > 0 ? (
        <Box>
          {holdings.map((holding, i) => (
            <React.Fragment key={holding.ticker}>
              {i > 0 && <Divider />}
              <HoldingRow holding={holding} onClick={() => navigate('/portfolio')} />
            </React.Fragment>
          ))}
        </Box>
      ) : (
        <Box sx={{ py: 7, textAlign: 'center' }}>
          <Typography sx={{ fontWeight: 600, mb: 0.5 }}>No positions yet</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Your buying power is {currency(portfolio?.currentBalance)}.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/trade')} disableElevation>
            Make your first trade
          </Button>
        </Box>
      )}
    </Container>
  );
}
