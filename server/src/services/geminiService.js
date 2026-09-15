/**
 * Isolated Google Gemini Service for Semantic Code Review Analysis.
 * Interfaces with Google GenAI SDK (@google/genai) and enforces strict structured output.
 */
import { GoogleGenAI } from '@google/genai';
import {
  GEMINI_SYSTEM_INSTRUCTION,
  GEMINI_RESPONSE_SCHEMA,
  buildGeminiPrompt,
} from './geminiPrompt.js';
import { validateAiResponse } from './aiValidator.js';

export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
const REQUEST_TIMEOUT_MS = 25000;

// Internal client reference allowing dependency injection for tests
let testClientOverride = null;

/**
 * Injects a mock client for automated testing without network access.
 * @param {object|null} mockClient Mock instance of GoogleGenAI or null to reset.
 */
export function setGeminiClientOverride(mockClient) {
  testClientOverride = mockClient;
}

/**
 * Returns an instance of GoogleGenAI using configured environment variables.
 * @returns {GoogleGenAI|null}
 */
export function getGeminiClient() {
  if (testClientOverride) {
    return testClientOverride;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    return null;
  }

  return new GoogleGenAI({ apiKey: apiKey.trim() });
}

/**
 * Performs semantic code review using Google Gemini.
 *
 * Guaranteed characteristics:
 * - Never throws or crashes the calling process.
 * - Always returns a predictable internal object with status: 'SUCCESS' | 'UNAVAILABLE' | 'VALIDATION_FAILED'.
 * - Model output is schema-validated and line-grounded before returning.
 *
 * @param {object} params
 * @param {string} params.code Raw source code to analyze.
 * @param {string} params.language Language identifier (e.g. 'javascript', 'jsx').
 * @param {string} params.filename Name of the file being reviewed.
 * @param {Array} params.staticIssues Findings already discovered by static analysis.
 * @param {object} params.metrics Deterministic metrics calculated for the code.
 * @returns {Promise<{ status: 'SUCCESS'|'UNAVAILABLE'|'VALIDATION_FAILED', data: object|null, error: string|null }>}
 */
export function analyzeCodeWithGemini({
  code = '',
  language = 'javascript',
  filename = 'source.js',
  staticIssues = [],
  metrics = {},
}) {
  return new Promise(async (resolve) => {
    // 1. Check API Key availability
    const client = getGeminiClient();
    if (!client) {
      return resolve({
        status: 'UNAVAILABLE',
        data: null,
        error: 'Gemini semantic engine is unavailable: GEMINI_API_KEY is not configured.',
      });
    }

    const modelName = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
    const prompt = buildGeminiPrompt({
      code,
      language,
      filename,
      staticIssues,
      metrics,
    });

    let timeoutHandle = null;
    let didTimeout = false;

    // Timeout guard to ensure calls never hang indefinitely
    const timeoutPromise = new Promise((_, reject) => {
      timeoutHandle = setTimeout(() => {
        didTimeout = true;
        reject(new Error(`Gemini request timed out after ${REQUEST_TIMEOUT_MS}ms`));
      }, REQUEST_TIMEOUT_MS);
    });

    try {
      const apiCall = client.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction: GEMINI_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: GEMINI_RESPONSE_SCHEMA,
          temperature: 0.2, // Low temperature for deterministic/reproducible reasoning
        },
      });

      const response = await Promise.race([apiCall, timeoutPromise]);
      clearTimeout(timeoutHandle);

      // Extract raw response text
      const rawText = response?.text;
      if (!rawText || typeof rawText !== 'string') {
        return resolve({
          status: 'VALIDATION_FAILED',
          data: null,
          error: 'Gemini returned an empty or invalid response body.',
        });
      }

      // 2. Parse structured JSON output
      let parsedJson = null;
      try {
        parsedJson = JSON.parse(rawText);
      } catch (parseErr) {
        return resolve({
          status: 'VALIDATION_FAILED',
          data: null,
          error: `Failed to parse Gemini output as JSON: ${parseErr.message}`,
        });
      }

      // 3. Strict schema and line grounding validation
      const validation = validateAiResponse(parsedJson, code);
      if (!validation.valid) {
        return resolve({
          status: 'VALIDATION_FAILED',
          data: null,
          error: `Gemini response failed validation guardrails: ${validation.errors.join('; ')}`,
        });
      }

      return resolve({
        status: 'SUCCESS',
        data: validation.validatedData,
        error: null,
      });
    } catch (err) {
      if (timeoutHandle) clearTimeout(timeoutHandle);

      // Log server diagnostic without leaking sensitive keys
      console.error('[GeminiService] Execution error:', err.message);

      return resolve({
        status: didTimeout ? 'UNAVAILABLE' : 'UNAVAILABLE',
        data: null,
        error: didTimeout
          ? 'Gemini analysis request timed out.'
          : 'Gemini analysis encountered a provider or network error.',
      });
    }
  });
}
