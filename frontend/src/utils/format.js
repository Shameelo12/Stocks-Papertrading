/**
 * Display formatting for money and percentages.
 *
 * Amounts are grouped (10,000.00 rather than 10000.00) and always shown to two
 * decimal places, so columns of figures line up when paired with tabular-nums.
 */

export const currency = (value) =>
  `$${Number(value ?? 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/** Absolute value, for use beside an explicit direction arrow or sign. */
export const currencyAbs = (value) => currency(Math.abs(Number(value ?? 0)));

export const percent = (value) => `${Number(value ?? 0).toFixed(2)}%`;

export const percentAbs = (value) => percent(Math.abs(Number(value ?? 0)));

/**
 * Signed amount, e.g. "+$120.50" / "-$80.00".
 *
 * The sign matters for accessibility: gain and loss must never be distinguished
 * by colour alone, so every figure carries its direction in the text itself.
 */
export const signedCurrency = (value) => {
  const n = Number(value ?? 0);
  return `${n >= 0 ? '+' : '-'}${currency(Math.abs(n))}`;
};

export const signedPercent = (value) => {
  const n = Number(value ?? 0);
  return `${n >= 0 ? '+' : '-'}${percent(Math.abs(n))}`;
};

/** Compact axis label, e.g. "$10.4k". */
export const compactCurrency = (value) => {
  const n = Number(value ?? 0);
  if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
};

export const shares = (value) => Number(value ?? 0).toFixed(2);
