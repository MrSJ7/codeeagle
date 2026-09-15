import { normalizeReviewData } from '../utils/reviewHelpers.js';

/**
 * Resolves the backend API base URL with environment checks.
 * - In Vite production builds (import.meta.env.PROD), requires VITE_API_BASE_URL and throws if omitted.
 * - In development or Node test runners, falls back cleanly to http://localhost:5001.
 * - Automatically trims trailing slashes to prevent double slashes.
 */
export function getApiBaseUrl() {
  const envUrl =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
    (typeof process !== 'undefined' && process.env?.VITE_API_BASE_URL);

  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  const isProd =
    (typeof import.meta !== 'undefined' && import.meta.env?.PROD) ||
    (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production');

  if (isProd) {
    throw new Error(
      'Deployment Configuration Error: VITE_API_BASE_URL is not configured for production. ' +
      'Please configure VITE_API_BASE_URL in your Vercel environment settings pointing to your Render backend URL.'
    );
  }

  return 'http://localhost:5001';
}

/**
 * Helper to construct an absolute API URL for a given relative path.
 */
export function buildApiUrl(path = '') {
  const base = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

/**
 * Fetches server health status and active persistence mode.
 */
export async function getHealthApi() {
  try {
    const res = await fetch(buildApiUrl('/api/health'));
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

/**
 * Executes a deterministic code review by calling the backend POST /api/review endpoint.
 */
export async function runReview(code, language = 'javascript', filename = 'source.js') {
  if (!code || typeof code !== 'string' || !code.trim()) {
    throw new Error('Please provide code to analyze.');
  }

  try {
    const response = await fetch(buildApiUrl('/api/review'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, language, filename }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `Server returned error (${response.status})`);
    }

    const data = await response.json();
    return normalizeReviewData(data);
  } catch (err) {
    // If backend is unreachable or threw an error
    console.error('API review call failed:', err);
    throw new Error(err.message || 'Could not connect to code review service.');
  }
}

/**
 * Verifies if a patch is safely applicable to current source code.
 */
export async function verifyPatchApi({ code, codeHash, issue }) {
  const response = await fetch(buildApiUrl('/api/patch/verify'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code, codeHash, issue }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const err = new Error(errorData?.error?.message || `Verification failed (${response.status})`);
    err.code = errorData?.error?.code || 'VERIFICATION_FAILED';
    throw err;
  }

  return await response.json();
}

/**
 * Safely applies a verified patch, re-analyzes the code, and computes the review diff.
 */
export async function applyPatchApi({
  code,
  codeHash,
  issue,
  language = 'javascript',
  filename = 'source.js',
  beforeReview = null,
}) {
  const response = await fetch(buildApiUrl('/api/patch/apply'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code,
      codeHash,
      issue,
      language,
      filename,
      beforeReview,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const err = new Error(errorData?.error?.message || `Patch application failed (${response.status})`);
    err.code = errorData?.error?.code || 'PATCH_FAILED';
    err.status = response.status;
    throw err;
  }

  const data = await response.json();
  return {
    ...data,
    review: normalizeReviewData(data.review),
  };
}

/**
 * Verifies if an AI-generated patch is safely applicable to current source code.
 */
export async function verifyAiPatchApi({ code, codeHash, issue }) {
  const response = await fetch(buildApiUrl('/api/patch/verify-ai'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code, codeHash, issue }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const err = new Error(errorData?.error?.message || `AI verification failed (${response.status})`);
    err.code = errorData?.error?.code || 'VERIFICATION_FAILED';
    err.status = response.status;
    throw err;
  }

  return await response.json();
}

/**
 * Safely applies an AI patch, triggers full re-analysis, and computes review diff.
 */
export async function applyAiPatchApi({
  code,
  codeHash,
  issue,
  language = 'javascript',
  filename = 'source.js',
  beforeReview = null,
}) {
  const response = await fetch(buildApiUrl('/api/patch/apply-ai'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code,
      codeHash,
      issue,
      language,
      filename,
      beforeReview,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const err = new Error(errorData?.error?.message || `AI patch application failed (${response.status})`);
    err.code = errorData?.error?.code || 'PATCH_FAILED';
    err.status = response.status;
    throw err;
  }

  const data = await response.json();
  return {
    ...data,
    review: normalizeReviewData(data.review),
  };
}

/**
 * Fetches paginated review history list.
 */
export async function getReviewHistoryApi({ page = 1, limit = 20 } = {}) {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  const response = await fetch(buildApiUrl(`/api/reviews?${query.toString()}`));

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error?.message || `Failed to fetch history (${response.status})`);
  }

  return await response.json();
}

/**
 * Fetches a single full review by its reviewId.
 */
export async function getReviewByIdApi(reviewId) {
  const response = await fetch(buildApiUrl(`/api/reviews/${encodeURIComponent(reviewId)}`));

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const err = new Error(errorData?.error?.message || `Failed to fetch review (${response.status})`);
    err.code = errorData?.error?.code || 'FETCH_FAILED';
    err.status = response.status;
    throw err;
  }

  const data = await response.json();
  return {
    ...normalizeReviewData(data),
    code: data.code || '',
    reviewId: data.reviewId,
    createdAt: data.createdAt,
  };
}

/**
 * Deletes a review from persistence by its reviewId.
 */
export async function deleteReviewApi(reviewId) {
  const response = await fetch(buildApiUrl(`/api/reviews/${encodeURIComponent(reviewId)}`), {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const err = new Error(errorData?.error?.message || `Failed to delete review (${response.status})`);
    err.code = errorData?.error?.code || 'DELETE_FAILED';
    err.status = response.status;
    throw err;
  }

  return await response.json();
}


