import { Router } from 'express';
import {
  handleGetReviews,
  handleGetReviewById,
  handleDeleteReview,
} from '../controllers/history.controller.js';

const router = Router();

router.get('/', handleGetReviews);
router.get('/:reviewId', handleGetReviewById);
router.delete('/:reviewId', handleDeleteReview);

export default router;
