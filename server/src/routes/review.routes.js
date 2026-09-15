import { Router } from 'express';
import { handleReviewRequest, handleAiReviewRequest } from '../controllers/review.controller.js';

const router = Router();

router.post('/', handleReviewRequest);
router.post('/ai', handleAiReviewRequest);

export default router;
