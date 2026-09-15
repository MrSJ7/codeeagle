import { isDatabaseConnected } from '../config/database.js';
import { memoryReviewRepository } from './memoryReviewRepository.js';
import { mongoReviewRepository } from './mongoReviewRepository.js';

/**
 * Unified Review Repository Facade.
 * Transparently dispatches requests to MongoDB when connected, or the in-memory
 * repository when MongoDB is unavailable or unconfigured.
 */
class ReviewRepository {
  get activeRepository() {
    return isDatabaseConnected() ? mongoReviewRepository : memoryReviewRepository;
  }

  /**
   * Returns current active persistence strategy.
   * @returns {'mongo' | 'memory'}
   */
  getPersistenceMode() {
    return isDatabaseConnected() ? 'mongo' : 'memory';
  }

  /**
   * Saves a review audit record.
   */
  async createReview(data) {
    return this.activeRepository.createReview(data);
  }

  /**
   * Gets paginated compact review history.
   */
  async getReviews(params) {
    return this.activeRepository.getReviews(params);
  }

  /**
   * Gets a complete review record by ID.
   */
  async getReviewById(id) {
    return this.activeRepository.getReviewById(id);
  }

  /**
   * Deletes a review record by ID.
   */
  async deleteReviewById(id) {
    return this.activeRepository.deleteReviewById(id);
  }
}

export const reviewRepository = new ReviewRepository();
