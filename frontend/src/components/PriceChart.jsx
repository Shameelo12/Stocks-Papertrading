import React, { useEffect, useState, useId } from 'react';
import { Box, Typography, CircularProgress, ToggleButton, ToggleButtonGroup, useTheme } from '@mui/material';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import API from '../api/axios';
import { currency, compactCurrency, signedCurrency, signedPercent } from '../utils/format';

const RANGES = [
  { label: '1W', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
];

/**
 * Recorded price series for one ticker.
 *
 * The series is built by this application rather than fetched from a provider —
 * Finnhub's free tier does not expose historical candles — so it is seeded from
 * past trades and extended by a periodic snapshot. A ticker nobody has traded or
 * watched yet legitimately has nothing to draw.
 */
export default function PriceChart({ ticker, height = 200 }) {
  const theme = useTheme();
  const gradientId = useId();
  const [days, setDays] = useState(30);
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ticker) return;
    let cancelled = false;
    setLoading(true);

    API.get(`/stocks/${ticker}/history`, { params: { days } })
      .then((res) => {
        if (cancelled) return;
        setPoints(
          (Array.isArray(res.data) ? res.data : []).map((p) => ({
            t: new Date(p.timestamp).getTime(),
            price: Number(p.price),
          }))
        );
      })
      .catch(() => !cancelled && setPoints([]))
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [ticker, days]);

  const first = points[0]?.price;
  const last = points[points.length - 1]?.price;
  const change = first != null && last != null ? last - first : 0;
  const changePct = first ? (change / first) * 100 : 0;
  const up = change >= 0;

  // Colour follows the direction of the period, which is the chart's subject.
  // The signed figures beside it carry the same information in text, so the
  // meaning does not rest on colour alone.
  const lineColor = up ? theme.palette.success.main : theme.palette.error.main;

  const rangePicker = (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={days}
      onChange={(_, v) => v && setDays(v)}
      sx={{ '& .MuiToggleButton-root': { px: 1.25, py: 0.25, fontSize: '0.72rem', border: 'none' } }}
    >
      {RANGES.map((r) => (
        <ToggleButton key={r.days} value={r.days}>{r.label}</ToggleButton>
      ))}
    </ToggleButtonGroup>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 1 }}>
        {points.length > 1 ? (
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography sx={{ color: lineColor, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {signedCurrency(change)}
            </Typography>
            <Typography variant="body2" sx={{ color: lineColor, fontVariantNumeric: 'tabular-nums' }}>
              {signedPercent(changePct)}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              recorded
            </Typography>
          </Box>
        ) : <Box />}
        {rangePicker}
      </Box>

      <Box sx={{ height }}>
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <CircularProgress size={22} />
          </Box>
        ) : points.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 6, right: 6, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={lineColor} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
              <XAxis
                dataKey="t"
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
                axisLine={{ stroke: theme.palette.divider }}
                tickLine={false}
                minTickGap={40}
                tickFormatter={(t) =>
                  new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              />
              <YAxis
                tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={54}
                domain={['auto', 'auto']}
                tickFormatter={compactCurrency}
              />
              {/* Where the period started, so the shape reads against a baseline. */}
              {first != null && (
                <ReferenceLine y={first} stroke={theme.palette.text.disabled} strokeDasharray="2 4" />
              )}
              <Tooltip
                formatter={(v) => [currency(v), ticker]}
                labelFormatter={(t) =>
                  new Date(t).toLocaleString(undefined, {
                    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                  })}
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
                dataKey="price"
                stroke={lineColor}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: theme.palette.background.paper }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <Box
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: '100%', textAlign: 'center', px: 3,
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {points.length === 1
                ? `Only one price recorded for ${ticker} so far — the chart fills in as more are captured.`
                : `No price history for ${ticker} yet. It starts building once you trade or watch it.`}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
