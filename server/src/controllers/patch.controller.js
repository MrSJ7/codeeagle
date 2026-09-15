import { verifyPatch, applyPatch, PATCH_REASONS } from '../services/patchService.js';
import { verifyAiPatch, applyAiPatch } from '../services/aiPatchVerifier.js';
import { reviewCode } from '../services/reviewService.js';
import { computeReviewDiff } from '../services/reviewDiff.js';
import { reviewRepository } from '../repositories/reviewRepository.js';

const ERROR_DETAILS = {
  [PATCH_REASONS.STALE_SOURCE]: {
    status: 409,
    message: 'The review is stale. Re-run the audit before applying this patch.',
  },
  [PATCH_REASONS.UNSAFE_AI_FIX]: {
    status: 422,
    message: 'AI suggested fixes cannot be applied automatically. Please apply them manually.',
  },
  [PATCH_REASONS.UNSUPPORTED_SOURCE]: {
    status: 422,
    message: 'Only static analysis issues support automated patch application.',
  },
  [PATCH_REASONS.ORIGINAL_NOT_FOUND]: {
    status: 422,
    message: 'Original snippet was not found in the current source code.',
  },
  [PATCH_REASONS.MULTIPLE_MATCHES]: {
    status: 422,
    message: 'Original snippet matches multiple locations in the current source code.',
  },
  [PATCH_REASONS.LINE_RANGE_MISMATCH]: {
    status: 422,
    message: 'Matched snippet does not correspond to the expected issue line range.',
  },
  [PATCH_REASONS.INVALID_LINE_RANGE]: {
    status: 422,
    message: 'Issue specifies an invalid source line range.',
  },
  [PATCH_REASONS.INVALID_FIX]: {
    status: 400,
    message: 'Invalid or malformed patch fix specification.',
  },
  [PATCH_REASONS.LOW_CONFIDENCE]: {
    status: 422,
    message: 'AI patch confidence is below the required safety threshold (80%).',
  },
  [PATCH_REASONS.REPLACEMENT_TOO_LARGE]: {
    status: 422,
    message: 'AI patch replacement size exceeds safe limit (50 KB).',
  },
  [PATCH_REASONS.SPAN_TOO_LARGE]: {
    status: 422,
    message: 'AI patch line span exceeds safe limit (30 lines).',
  },
};

/**
 * POST /api/patch/verify
 * Validates whether a patch can be safely applied to current source.
 */
export async function handleVerifyPatch(req, res) {
  try {
    const { code, codeHash, issue } = req.body || {};

    if (typeof code !== 'string') {
      return res.status(400).json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Source code string is required for patch verification.',
        },
      });
    }

    if (!issue || typeof issue !== 'object') {
      return res.status(400).json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Issue object is required for patch verification.',
        },
      });
    }

    const verification = verifyPatch({ code, codeHash, issue });
    return res.status(200).json(verification);
  } catch (err) {
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred while verifying the patch.',
      },
    });
  }
}

/**
 * POST /api/patch/apply
 * Applies a safe patch, immediately triggers re-analysis, and computes diff.
 */
export async function handleApplyPatch(req, res) {
  try {
    const {
      code,
      codeHash,
      issue,
      language = 'javascript',
      filename = 'source.js',
      beforeReview = null,
    } = req.body || {};

    if (typeof code !== 'string') {
      return res.status(400).json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Source code string is required for patch application.',
        },
      });
    }

    if (!issue || typeof issue !== 'object') {
      return res.status(400).json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Issue object is required for patch application.',
        },
      });
    }

    // 1. Verify and apply patch safely
    const patchResult = applyPatch({ code, codeHash, issue });

    if (!patchResult.success) {
      const errorInfo = ERROR_DETAILS[patchResult.reason] || {
        status: 422,
        message: 'Patch could not be applied safely.',
      };

      return res.status(errorInfo.status).json({
        error: {
          code: patchResult.reason,
          message: errorInfo.message,
        },
      });
    }

    // 2. Automatically re-analyze the patched code
    const afterReview = await reviewCode({
      code: patchResult.patchedCode,
      language,
      filename,
    });

    // Persist new post-patch audit (separate from original review)
    let reviewId = null;
    try {
      const saved = await reviewRepository.createReview({
        code: patchResult.patchedCode,
        language,
        filename,
        ...afterReview,
      });
      reviewId = saved?.reviewId || null;
    } catch (persistErr) {
      console.error('Non-fatal post-patch review persistence failure:', persistErr);
    }

    const reviewWithId = {
      ...afterReview,
      reviewId,
    };

    // 3. Compute resolution diff
    const diff = computeReviewDiff({
      beforeReview,
      afterReview: reviewWithId,
      appliedIssueId: issue.id,
    });

    return res.status(200).json({
      success: true,
      patchedCode: patchResult.patchedCode,
      beforeHash: patchResult.beforeHash,
      afterHash: patchResult.afterHash,
      appliedIssueId: issue.id,
      reviewId,
      review: reviewWithId,
      diff,
    });
  } catch (err) {
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred while applying the patch.',
      },
    });
  }
}

/**
 * POST /api/patch/verify-ai
 * Validates whether an AI patch can be safely applied and returns preview.
 * Read-only, zero persistence side-effects.
 */
export async function handleVerifyAiPatch(req, res) {
  try {
    const { code, codeHash, issue } = req.body || {};

    if (typeof code !== 'string') {
      return res.status(400).json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Source code string is required for AI patch verification.',
        },
      });
    }

    if (!issue || typeof issue !== 'object') {
      return res.status(400).json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Issue object is required for AI patch verification.',
        },
      });
    }

    const verification = verifyAiPatch({ code, codeHash, issue });
    return res.status(200).json(verification);
  } catch (err) {
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred while verifying the AI patch.',
      },
    });
  }
}

/**
 * POST /api/patch/apply-ai
 * Safely applies an AI patch, triggers full re-analysis, and computes diff.
 * Re-verifies all safety rules during apply to prevent TOCTOU gaps.
 */
export async function handleApplyAiPatch(req, res) {
  try {
    const {
      code,
      codeHash,
      issue,
      language = 'javascript',
      filename = 'source.js',
      beforeReview = null,
    } = req.body || {};

    if (typeof code !== 'string') {
      return res.status(400).json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Source code string is required for AI patch application.',
        },
      });
    }

    if (!issue || typeof issue !== 'object') {
      return res.status(400).json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Issue object is required for AI patch application.',
        },
      });
    }

    // 1. Re-verify and apply AI patch safely
    const patchResult = applyAiPatch({ code, codeHash, issue });

    if (!patchResult.success) {
      const errorInfo = ERROR_DETAILS[patchResult.reason] || {
        status: 422,
        message: 'AI patch could not be applied safely.',
      };

      return res.status(errorInfo.status).json({
        error: {
          code: patchResult.reason,
          message: errorInfo.message,
        },
      });
    }

    // 2. Automatically re-analyze the patched code (full hybrid pipeline)
    const afterReview = await reviewCode({
      code: patchResult.patchedCode,
      language,
      filename,
    });

    // 3. Persist new post-patch audit record
    let reviewId = null;
    try {
      const saved = await reviewRepository.createReview({
        code: patchResult.patchedCode,
        language,
        filename,
        ...afterReview,
      });
      reviewId = saved?.reviewId || null;
    } catch (persistErr) {
      console.error('Non-fatal post-AI-patch review persistence failure:', persistErr);
    }

    const reviewWithId = {
      ...afterReview,
      reviewId,
    };

    // 4. Compute before/after resolution diff
    const diff = computeReviewDiff({
      beforeReview,
      afterReview: reviewWithId,
      appliedIssueId: issue.id,
    });

    return res.status(200).json({
      success: true,
      patchedCode: patchResult.patchedCode,
      beforeHash: patchResult.beforeHash,
      afterHash: patchResult.afterHash,
      appliedIssueId: issue.id,
      reviewId,
      review: reviewWithId,
      diff,
    });
  } catch (err) {
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred while applying the AI patch.',
      },
    });
  }
}
