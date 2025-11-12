// Simple retry with exponential backoff and basic circuit breaker
// Usage: await withRetry(() => fn(), { retries: 3, minDelayMs: 200, maxDelayMs: 2000, breakerKey: 'shopify' })

const breakerState = new Map();

export async function withRetry(fn, options = {}) {
  const {
    retries = 2,
    minDelayMs = 200,
    maxDelayMs = 2000,
    jitter = true,
    breakerKey,
    breakerFailThreshold = 5,
    breakerOpenMs = 30000,
  } = options;

  const now = Date.now();
  if (breakerKey) {
    const state = breakerState.get(breakerKey);
    if (state && state.openUntil && state.openUntil > now) {
      const err = new Error('Circuit open for ' + breakerKey);
      err.code = 'CIRCUIT_OPEN';
      throw err;
    }
  }

  let attempt = 0;
  while (true) {
    try {
      const res = await fn();
      // success resets breaker
      if (breakerKey) breakerState.delete(breakerKey);
      return res;
    } catch (err) {
      attempt++;
      const isRetryable = isRetryableError(err);
      if (attempt > retries || !isRetryable) {
        // track breaker
        if (breakerKey) {
          const state = breakerState.get(breakerKey) || { fails: 0 };
          state.fails++;
          if (state.fails >= breakerFailThreshold) {
            state.openUntil = Date.now() + breakerOpenMs;
          }
          breakerState.set(breakerKey, state);
        }
        throw err;
      }
      const delay = Math.min(maxDelayMs, minDelayMs * Math.pow(2, attempt - 1));
      const sleep = jitter ? delay * (0.5 + Math.random()) : delay;
      await new Promise(r => setTimeout(r, sleep));
    }
  }
}

function isRetryableError(err) {
  const code = err.code || err.status || err.response?.status;
  // Retry on 429 (rate limit), 5xx, network/timeouts
  if ([408, 425, 429, 500, 502, 503, 504].includes(code)) return true;
  const msg = (err.message || '').toLowerCase();
  if (msg.includes('timeout') || msg.includes('network')) return true;
  return false;
}

export function __resetBreaker() {
  breakerState.clear();
}
