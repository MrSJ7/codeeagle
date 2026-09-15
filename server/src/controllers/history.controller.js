import { reviewRepository } from '../repositories/reviewRepository.js';

const SAFE_ID_REGEX = /^[a-zA-Z0-9\-_]{1,64}$/;

/**
 * Validates a reviewId parameter format before repository query.
 */
function isValidReviewId(id) {
  return typeof id === 'string' && SAFE_ID_REGEX.test(id);
}

/**
 * GET /api/reviews
 * Retrieves paginated list of historical audits with compact projection.
 */
export async function handleGetReviews(req, res) {
  try {
    let page = 1;
    let limit = 20;

    if (req.query.page !== undefined) {
      const parsedPage = Number(req.query.page);
      if (!Number.isInteger(parsedPage) || parsedPage < 1) {
        return res.status(400).json({
          error: {
            code: 'INVALID_PAGINATION',
            message: 'Page query parameter must be a positive integer (>= 1).',
          },
        });
      }
      page = parsedPage;
    }

    if (req.query.limit !== undefined) {
      const parsedLimit = Number(req.query.limit);
      if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
        return res.status(400).json({
          error: {
            code: 'INVALID_PAGINATION',
            message: 'Limit query parameter must be an integer between 1 and 50.',
          },
        });
      }
      limit = parsedLimit;
    }

    const result = await reviewRepository.getReviews({ page, limit });
    return res.status(200).json(result);
  } catch (err) {
    console.error('Error fetching review history:', err);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Could not fetch review history.',
      },
    });
  }
}

/**
 * GET /api/reviews/:reviewId
 * Retrieves full audit details for a specific reviewId.
 */
export async function handleGetReviewById(req, res) {
  try {
    const { reviewId } = req.params;

    if (!isValidReviewId(reviewId)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_REVIEW_ID',
          message: 'Malformed or invalid review ID parameter.',
        },
      });
    }

    const review = await reviewRepository.getReviewById(reviewId);

    if (!review) {
      return res.status(404).json({
        error: {
          code: 'REVIEW_NOT_FOUND',
          message: `No review found with ID "${reviewId}".`,
        },
      });
    }

    return res.status(200).json(review);
  } catch (err) {
    console.error(`Error fetching review ${req.params?.reviewId}:`, err);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Could not retrieve review details.',
      },
    });
  }
}

/**
 * DELETE /api/reviews/:reviewId
 * Removes an audit record by ID.
 */
export async function handleDeleteReview(req, res) {
  try {
    const { reviewId } = req.params;

    if (!isValidReviewId(reviewId)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_REVIEW_ID',
          message: 'Malformed or invalid review ID parameter.',
        },
      });
    }

    const deleted = await reviewRepository.deleteReviewById(reviewId);

    if (!deleted) {
      return res.status(404).json({
        error: {
          code: 'REVIEW_NOT_FOUND',
          message: `No review found to delete with ID "${reviewId}".`,
        },
      });
    }

    return res.status(200).json({
      success: true,
      reviewId,
    });
  } catch (err) {
    console.error(`Error deleting review ${req.params?.reviewId}:`, err);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Could not delete review.',
      },
    });
  }
}
