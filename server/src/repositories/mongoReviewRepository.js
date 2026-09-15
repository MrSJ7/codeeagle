import mongoose from 'mongoose';
import { ReviewModel } from '../models/review.model.js';

/**
 * MongoDB Mongoose review repository implementation.
 */
class MongoReviewRepository {
  /**
   * Stores a completed review audit record in MongoDB.
   */
  async createReview(data) {
    const doc = await ReviewModel.create({
      codeHash: data.codeHash || data.metadata?.codeHash || '',
      language: data.language || data.metadata?.language || 'javascript',
      filename: data.filename || data.metadata?.filename || 'source.js',
      code: typeof data.code === 'string' ? data.code : '',
      score: typeof data.score === 'number' ? data.score : 0,
      breakdown: data.breakdown || {},
      metrics: data.metrics || {},
      issues: Array.isArray(data.issues) ? data.issues : [],
      summary: data.summary || {},
      metadata: data.metadata || {},
      createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(),
    });

    const obj = doc.toObject();
    return {
      ...obj,
      reviewId: doc._id.toString(),
    };
  }

  /**
   * Retrieves a paginated list of reviews using a compact projection.
   */
  async getReviews({ page = 1, limit = 20 } = {}) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(50, limit));
    const skip = (safePage - 1) * safeLimit;

    const [docs, total] = await Promise.all([
      ReviewModel.find({})
        .select('score filename language summary metadata createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      ReviewModel.countDocuments({}),
    ]);

    const pages = Math.max(1, Math.ceil(total / safeLimit));

    const reviews = docs.map((doc) => ({
      reviewId: doc._id.toString(),
      score: doc.score,
      filename: doc.filename,
      language: doc.language,
      issueCount: doc.summary?.totalIssues ?? 0,
      engine: doc.metadata?.engine || 'static',
      createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : new Date(doc.createdAt).toISOString(),
    }));

    return {
      reviews,
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    const doc = await ReviewModel.findById(id).lean();
    if (!doc) return null;

    return {
      ...doc,
      reviewId: doc._id.toString(),
      createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : new Date(doc.createdAt).toISOString(),
    };
  }

  /**
   * Deletes a review by ID.
   */
  async deleteReviewById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }

    const result = await ReviewModel.findByIdAndDelete(id);
    return Boolean(result);
  }
}

export const mongoReviewRepository = new MongoReviewRepository();
