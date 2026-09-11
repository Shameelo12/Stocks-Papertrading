import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Divider,
  CircularProgress,
  Alert,
  Button,
  useTheme,
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { usePortfolio } from '../hooks/usePortfolio';
import API, { unwrapList } from '../api/axios';
import StockDetailsModal from '../components/StockDetailsModal';
import {
  currency,
  currencyAbs,
  percentAbs,
  compactCurrency,
  shares as fmtShares,
} from '../utils/format';

/** Label above, figure below. Used for the row of supporting numbers. */
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

/**
 * Allocation as sorted horizontal bars rather than a pie.
 *
 * A pie makes "is AAPL bigger than MSFT" a comparison of angles; sorted bars with
 * the percentage stated make it a comparison of lengths plus a readable number.
 * It also needs only one hue, where the previous two pie charts cycled an
 * arbitrary eight-colour list that carried no meaning.
 */
function Allocation({ rows, total }) {
  const theme = useTheme();
  if (!rows.length) return null;

  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
      {rows.map((row) => {
        const share = total > 0 ? (row.value / total) * 100 : 0;
        return (
          <Box key={row.name}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 0.5 }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>{row.name}</Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}
              >
                {currency(row.value)} · {share.toFixed(1)}%
              </Typography>
            </Box>
            <Box
              sx={{
                height: 6,
                borderRadius: '3px',
                backgroundColor: 'action.hover',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  height: '100%',
                  width: `${(row.value / max) * 100}%`,
                  borderRadius: '3px',
                  backgroundColor: row.muted
                    ? theme.palette.text.disabled
                    : theme.palette.primary.main,
                }}
              />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

function HoldingRow({ holding, totalValue, onClick }) {
  const theme = useTheme();
  const gain = Number(holding.gainLoss ?? 0);
  const up = gain >= 0;
  const tone = up ? theme.palette.success.main : theme.palette.error.main;
  const weight = totalValue > 0 ? (Number(holding.currentValue) / totalValue) * 100 : 0;

  return (
    <Box
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
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
        <Typography sx={{ fontWeight: 600 }}>{holding.ticker}</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
          {fmtShares(holding.shares)} @ {currency(holding.avgCostPerShare)} · now {currency(holding.currentPrice)}
        </Typography>
      </Box>

      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
        <Typography sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
          {currency(holding.currentValue)}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, justifyContent: 'flex-end', color: tone }}>
          {up ? <ArrowUpwardIcon sx={{ fontSize: '0.8rem' }} /> : <ArrowDownwardIcon sx={{ fontSize: '0.8rem' }} />}
          <Typography variant="caption" sx={{ fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
            {currencyAbs(gain)} ({percentAbs(holding.gainLossPercent)})
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', ml: 0.75 }}>
            {weight.toFixed(0)}%
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function Portfolio() {
  const theme = useTheme();
  const { portfolio, loading, error } = usePortfolio(15000);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [selectedTicker, setSelectedTicker] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    API.get('/portfolio/history')
      .then((res) => {
        if (cancelled) return;
        setHistory(
          unwrapList(res.data).map((item) => ({
            date: new Date(item.timestamp).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            }),
            value: parseFloat(item.portfolioValue),
          }))
        );
      })
      .catch(() => {
        /* the chart is supplementary; the page is still usable without it */
      })
      .finally(() => !cancelled && setHistoryLoading(false));
    return () => { cancelled = true; };
  }, []);

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
  const totalValue = Number(portfolio?.totalPortfolioValue ?? 0);

  const allocationRows = [
    ...holdings
      .map((h) => ({ name: h.ticker, value: Number(h.currentValue) }))
      .sort((a, b) => b.value - a.value),
    { name: 'Cash', value: Number(portfolio?.currentBalance ?? 0), muted: true },
  ];

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Typography
        variant="caption"
        sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em' }}
      >
        Portfolio value
      </Typography>
      <Typography
        sx={{
          fontSize: { xs: '2.5rem', md: '3.25rem' },
          fontWeight: 600,
          letterSpacing: '-0.03em',
          lineHeight: 1.05,
          mt: 0.5,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {currency(totalValue)}
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

      {/* Value over time. One series, so the heading names it and no legend is needed. */}
      <Box sx={{ mt: 4, height: 260 }}>
        {historyLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
            <CircularProgress size={24} />
          </Box>
        ) : history.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
              <defs>
                <linearGradient id="valueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={theme.palette.divider}
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
                axisLine={{ stroke: theme.palette.divider }}
                tickLine={false}
                minTickGap={24}
              />
              <YAxis
                tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={56}
                tickFormatter={compactCurrency}
                domain={['auto', 'auto']}
              />
              <Tooltip
                formatter={(v) => [currency(v), 'Value']}
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 8,
                  fontSize: 13,
                  color: theme.palette.text.primary,
                }}
                labelStyle={{ color: theme.palette.text.secondary }}
                cursor={{ stroke: theme.palette.divider, strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={theme.palette.primary.main}
                strokeWidth={2}
                fill="url(#valueFill)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: theme.palette.background.paper }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Not enough history yet — make a few trades and a value chart will appear here.
            </Typography>
          </Box>
        )}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' },
          gap: 3,
          mt: 4,
          pt: 3,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stat label="Buying power" value={currency(portfolio?.currentBalance)} />
        <Stat label="Cost basis" value={currency(portfolio?.investedBalance)} />
        <Stat label="Positions" value={holdings.length} />
      </Box>

      {holdings.length > 0 && (
        <>
          <Typography sx={{ fontWeight: 600, fontSize: '1.05rem', mt: 6, mb: 2 }}>
            Allocation
          </Typography>
          <Allocation rows={allocationRows} total={totalValue} />

          <Typography sx={{ fontWeight: 600, fontSize: '1.05rem', mt: 6, mb: 1 }}>
            Positions
          </Typography>
          <Divider />
          {holdings.map((holding, i) => (
            <React.Fragment key={holding.ticker}>
              {i > 0 && <Divider />}
              <HoldingRow
                holding={holding}
                totalValue={totalValue}
                onClick={() => { setSelectedTicker(holding.ticker); setModalOpen(true); }}
              />
            </React.Fragment>
          ))}
        </>
      )}

      {holdings.length === 0 && (
        <Box sx={{ py: 7, textAlign: 'center' }}>
          <Typography sx={{ fontWeight: 600, mb: 0.5 }}>No positions yet</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Your buying power is {currency(portfolio?.currentBalance)}.
          </Typography>
          <Button variant="contained" href="/trade" disableElevation>
            Make your first trade
          </Button>
        </Box>
      )}

      <StockDetailsModal
        open={modalOpen}
        ticker={selectedTicker}
        onClose={() => setModalOpen(false)}
      />
    </Container>
  );
}
