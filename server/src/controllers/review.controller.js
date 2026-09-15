import { normalizeLanguage } from '../analyzers/analyzeCode.js';
import { getRegisteredRules } from '../analyzers/ruleRegistry.js';
import { reviewCode } from '../services/reviewService.js';
import { reviewRepository } from '../repositories/reviewRepository.js';

const SUPPORTED_LANGUAGES = new Set(['javascript', 'jsx']);
const MAX_CODE_LENGTH = 150000; // ~150KB safe payload limit

export async function handleReviewRequest(req, res) {
  try {
    const { code, language = 'javascript', filename = 'source.js' } = req.body;

    // Validate code presence and type
    if (typeof code !== 'string') {
      return res.status(400).json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Invalid request: "code" must be a string.',
        },
      });
    }

    if (!code.trim()) {
      return res.status(400).json({
        error: {
          code: 'EMPTY_CODE',
          message: 'Invalid request: "code" cannot be empty or whitespace.',
        },
      });
    }

    if (code.length > MAX_CODE_LENGTH) {
      return res.status(400).json({
        error: {
          code: 'PAYLOAD_TOO_LARGE',
          message: `Code payload exceeds maximum allowed size (${MAX_CODE_LENGTH} characters).`,
        },
      });
    }

    // Validate and normalize language
    const normalizedLang = normalizeLanguage(language);
    if (!SUPPORTED_LANGUAGES.has(normalizedLang)) {
      return res.status(400).json({
        error: {
          code: 'UNSUPPORTED_LANGUAGE',
          message: `Unsupported language "${language}". Currently only JavaScript and JSX are supported.`,
        },
      });
    }

    // Delegate orchestration to reviewService
    const reviewResult = await reviewCode({
      code,
      language: normalizedLang,
      filename,
    });

    // Persist completed review audit (non-fatal if persistence fails)
    let reviewId = null;
    try {
      const saved = await reviewRepository.createReview({
        code,
        language: normalizedLang,
        filename,
        ...reviewResult,
      });
      reviewId = saved?.reviewId || null;
    } catch (persistErr) {
      console.error('Non-fatal review persistence failure:', persistErr);
    }

    return res.status(200).json({
      ...reviewResult,
      reviewId,
    });
  } catch (error) {
    console.error('Internal analysis error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected internal error occurred during code analysis.',
      },
    });
  }
}

export function handleRulesRequest(req, res) {
  try {
    const rules = getRegisteredRules();
    return res.status(200).json({ rules });
  } catch (error) {
    console.error('Error fetching rules:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve rule registry.',
      },
    });
  }
}

export async function handleAiReviewRequest(req, res) {
  try {
    const { code, language = 'javascript', filename = 'source.js' } = req.body;

    if (typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({
        error: {
          code: 'EMPTY_CODE',
          message: 'Invalid request: "code" must be a non-empty string.',
        },
      });
    }

    const normalizedLang = normalizeLanguage(language);
    if (!SUPPORTED_LANGUAGES.has(normalizedLang)) {
      return res.status(400).json({
        error: {
          code: 'UNSUPPORTED_LANGUAGE',
          message: `Unsupported language "${language}". Currently only JavaScript and JSX are supported.`,
        },
      });
    }

    // Run static analysis first to supply context and avoid duplication
    const { analyzeCode } = await import('../analyzers/analyzeCode.js');
    const staticResult = analyzeCode(code, normalizedLang, filename);

    const { analyzeCodeWithGemini } = await import('../services/geminiService.js');
    const aiResult = await analyzeCodeWithGemini({
      code,
      language: normalizedLang,
      filename,
      staticIssues: staticResult.issues,
      metrics: staticResult.metrics,
    });

    return res.status(200).json(aiResult);
  } catch (error) {
    console.error('Error in handleAiReviewRequest:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected internal error occurred during AI review.',
      },
    });
  }
}
