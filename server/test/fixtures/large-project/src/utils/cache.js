const cache = new Map();
export function get(k) { return cache.get(k); }
export function set(k, v) { cache.set(k, v); }