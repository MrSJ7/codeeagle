import { Router } from 'express';
import {
  handleReviewRequest,
  handleAiReviewRequest,
  handleRefactorRequest,
  handleReviewChatRequest,
} from '../controllers/review.controller.js';

const router = Router();

router.post('/', handleReviewRequest);
router.post('/ai', handleAiReviewRequest);
router.post('/refactor', handleRefactorRequest);
router.post('/chat', handleReviewChatRequest);

export default router;
