import { Router } from 'express';
import {
  handleReviewRequest,
  handleAiReviewRequest,
  handleRefactorRequest,
} from '../controllers/review.controller.js';

const router = Router();

router.post('/', handleReviewRequest);
router.post('/ai', handleAiReviewRequest);
router.post('/refactor', handleRefactorRequest);

export default router;
