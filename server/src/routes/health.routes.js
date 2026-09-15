import { Router } from 'express';
import { reviewRepository } from '../repositories/reviewRepository.js';

const router = Router();

router.get('/', (req, res) => {
  const isAiConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
  res.json({
    status: 'ok',
    service: 'codelens-api',
    persistence: reviewRepository.getPersistenceMode(),
    ai: isAiConfigured ? 'configured' : 'not_configured',
  });
});

export default router;
