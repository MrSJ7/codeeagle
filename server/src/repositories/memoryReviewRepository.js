import crypto from 'node:crypto';

/**
 * In-memory fallback review repository for zero-dependency local operation.
 */
class MemoryReviewRepository {
  constructor() {
    this.reviews = new Map();
    this.counter = 1;
  }

  /**
   * Stores a completed review audit record in-memory.
   */
  async createReview(data) {
    const randomSuffix = crypto.randomBytes(4).toString('hex');
    const reviewId = `mem-${Date.now()}-${this.counter++}-${randomSuffix}`;

    const record = {
      reviewId,
      codeHash: data.codeHash || data.metadata?.codeHash || '',
      language: data.language || data.metadata?.language || 'javascript',
      filename: data.filename || data.metadata?.filename || 'source.js',
      code: typeof data.code === 'string' ? data.code : '',
      score: typeof data.score === 'number' ? data.score : 0,
      breakdown: data.breakdown || {
        security: 100,
        quality: 100,
        performance: 100,
        complexity: 100,
      },
      metrics: data.metrics || {
        lines: 0,
        functions: 0,
        branches: 0,
        complexity: 0,
        maxNesting: 0,
      },
      issues: Array.isArray(data.issues) ? [...data.issues] : [],
      summary: data.summary || {
        totalIssues: Array.isArray(data.issues) ? data.issues.length : 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      },
      metadata: data.metadata || {
        engine: 'static',
        language: data.language || 'javascript',
        filename: data.filename || 'source.js',
        codeHash: data.codeHash || '',
      },
      createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(),
    };

    this.reviews.set(reviewId, record);
    return record;
  }

  /**
   * Retrieves a paginated list of reviews using a compact projection.
   */
  async getReviews({ page = 1, limit = 20 } = {}) {
    const all = Array.from(this.reviews.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    const total = all.length;
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(50, limit));
    const pages = Math.max(1, Math.ceil(total / safeLimit));
    const start = (safePage - 1) * safeLimit;
    const slice = all.slice(start, start + safeLimit);

    // Compact projection for list view
    const compact = slice.map((r) => ({
      reviewId: r.reviewId,
      score: r.score,
      filename: r.filename,
      language: r.language,
      issueCount: r.summary?.totalIssues ?? r.issues.length,
      engine: r.metadata?.engine || 'static',
      createdAt: r.createdAt.toISOString(),
    }));

    return {
      reviews: compact,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        pages,
      },
    };
  }

  /**
   * Retrieves a full single review document by ID.
   */
  async getReviewById(id) {
    const record = this.reviews.get(id);
    if (!record) return null;

    return {
      ...record,
      createdAt: record.createdAt.toISOString(),
    };
  }

  /**
   * Deletes a review by ID.
   */
  async deleteReviewById(id) {
    if (!this.reviews.has(id)) {
      return false;
    }
    this.reviews.delete(id);
    return true;
  }

  /**
   * Clears all stored reviews (test helper).
   */
  clear() {
    this.reviews.clear();
    this.counter = 1;
  }
}

export const memoryReviewRepository = new MemoryReviewRepository();
