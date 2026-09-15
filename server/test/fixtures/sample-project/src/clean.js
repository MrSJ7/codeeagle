export function clamp(value, min, max) {
  if (min > max) {
    throw new Error('min cannot exceed max');
  }
  return Math.min(Math.max(value, min), max);
}

export function formatCurrency(amount) {
  return `$${Number(amount || 0).toFixed(2)}`;
}
